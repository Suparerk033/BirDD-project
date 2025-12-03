// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- CONFIG ----------
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_BIRDS = 'Birds';
const SHEET_PAIRS = 'Pairs';
const SHEET_CHICKS = 'Chicks';

// ---------- SERVICE ACCOUNT ----------
// ลำดับการโหลด:
// 1) GOOGLE_SERVICE_ACCOUNT_JSON (ใช้บน Render / server อื่น ๆ)
// 2) service-account.json (ใช้เฉพาะ dev ในเครื่อง)
let serviceAccount = null;

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  // วิธีที่ 1: ใส่ทั้ง JSON ลง ENV (เช่นบน Render)
  try {
    serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    console.log('✅ Loaded service account from GOOGLE_SERVICE_ACCOUNT_JSON');
  } catch (e) {
    console.error('❌ Cannot parse GOOGLE_SERVICE_ACCOUNT_JSON:', e);
    process.exit(1);
  }
} else {
  // วิธีที่ 2: dev ในเครื่อง ใช้ไฟล์ (ห้าม commit ขึ้น Git)
  try {
    // ใส่ไฟล์ service-account.json ไว้ในโฟลเดอร์เดียวกับ index.js
    // และต้องมีใน .gitignore
    // eslint-disable-next-line global-require
    serviceAccount = require('./service-account.json');
    console.log('✅ Loaded service account from service-account.json file');
  } catch (e) {
    console.error('❌ Cannot load service account credentials:', e);
    console.error('   - ถ้าเป็น dev: ให้ใส่ไฟล์ service-account.json ในโฟลเดอร์ bird-api และเพิ่มใน .gitignore');
    console.error('   - ถ้าเป็น Render: ให้ตั้ง GOOGLE_SERVICE_ACCOUNT_JSON เป็นเนื้อ JSON ของ key ทั้งก้อน');
    process.exit(1);
  }
}

// ---------- ROOT & HEALTH ----------
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Bird API is running' });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// ---------- AUTH ----------
async function getAuth() {
  if (!SPREADSHEET_ID) {
    throw new Error('Missing GOOGLE_SHEETS_ID in env');
  }

  if (!serviceAccount || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('Service account credentials not loaded');
  }

  // ถ้ามาจาก ENV บางทีจะเป็น "\\n" → แปลงเป็น newline จริง
  const rawKey = serviceAccount.private_key;
  const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return await auth.getClient();
}

async function getSheets() {
  const auth = await getAuth();
  return google.sheets({ version: 'v4', auth });
}

// ---------- HELPERS ----------
async function getTable(sheetName, range) {
  const sheets = await getSheets();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!${range}`,
  });

  const rows = res.data.values || [];
  if (rows.length < 2) return [];

  const [header, ...data] = rows;

  // ข้ามแถวที่ช่องแรกว่าง (เช่น แถวที่เคยลบแบบ clear)
  const filtered = data.filter((row) => (row[0] || '').trim() !== '');

  return filtered.map((row) => {
    const obj = {};
    header.forEach((h, i) => {
      obj[h] = row[i] || '';
    });
    return obj;
  });
}

async function appendRow(sheetName, range, values) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!${range}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

async function findRowIndexById(sheetName, id) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
  });

  const rows = res.data.values || [];
  for (let i = 1; i < rows.length; i++) {
    const cell = rows[i][0];
    if ((cell || '').trim() === id) {
      return i + 1; // row index จริง (เริ่มที่ 1)
    }
  }
  return -1;
}

async function updateRow(sheetName, rowIndex, startCol, endCol, values) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!${startCol}${rowIndex}:${endCol}${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

// หา ID ถัดไปจากเลขที่มากที่สุด (กันกรณีมีลบแถวไปแล้ว)
async function getNextId(sheetName, prefix) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
  });

  const rows = res.data.values || [];
  let maxNum = 0;

  for (let i = 1; i < rows.length; i++) {
    const cell = rows[i][0];
    if (!cell || typeof cell !== 'string') continue;
    if (!cell.startsWith(prefix)) continue;

    const num = parseInt(cell.slice(prefix.length), 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  }

  const nextNum = maxNum + 1;
  return prefix + String(nextNum).padStart(4, '0');
}

// ลบแถวตาม ID แล้วดันข้อมูลด้านล่างขึ้นมา
async function deleteRowByIdAndShiftUp(sheetName, lastCol, id) {
  const sheets = await getSheets();
  const range = `${sheetName}!A1:${lastCol}1000`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });

  const rows = res.data.values || [];
  if (rows.length === 0) return false;

  const header = rows[0];
  const data = rows.slice(1);

  // ตัดแถวที่ A == id ทิ้ง
  const filtered = data.filter((row) => (row[0] || '').trim() !== id);

  if (filtered.length === data.length) {
    // ไม่มีแถวไหนถูกลบ
    return false;
  }

  const newValues = [header, ...filtered];

  // ล้างช่วงเดิม
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });

  // เขียนข้อมูลใหม่ (header + ข้อมูลที่เหลือ)
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A1:${lastCol}${newValues.length}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: newValues },
  });

  return true;
}

// ---------- BIRDS ----------
app.get('/birds', async (req, res) => {
  try {
    const birds = await getTable(SHEET_BIRDS, 'A1:H1000');
    res.json(birds);
  } catch (err) {
    console.error('GET /birds error:', err);
    res.status(500).json({ error: 'Error fetching birds', detail: String(err) });
  }
});

app.post('/birds', async (req, res) => {
  try {
    const body = req.body;
    const newId = await getNextId(SHEET_BIRDS, 'B');
    const values = [
      newId,
      body.RingNo || '',
      body.Species || '',
      body.Sex || '',
      body.Color || '',
      body.BirthDate || '',
      body.Origin || '',
      body.Notes || '',
    ];
    await appendRow(SHEET_BIRDS, 'A:H', values);
    res.json({ success: true, BirdID: newId });
  } catch (err) {
    console.error('POST /birds error:', err);
    res.status(500).json({ error: 'Error creating bird', detail: String(err) });
  }
});

app.put('/birds/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const rowIndex = await findRowIndexById(SHEET_BIRDS, id);
    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Bird not found' });
    }

    const body = req.body;
    const values = [
      id,
      body.RingNo || '',
      body.Species || '',
      body.Sex || '',
      body.Color || '',
      body.BirthDate || '',
      body.Origin || '',
      body.Notes || '',
    ];

    await updateRow(SHEET_BIRDS, rowIndex, 'A', 'H', values);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /birds/:id error:', err);
    res.status(500).json({ error: 'Error updating bird', detail: String(err) });
  }
});

app.delete('/birds/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const ok = await deleteRowByIdAndShiftUp(SHEET_BIRDS, 'H', id);
    if (!ok) {
      return res.status(404).json({ error: 'Bird not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /birds/:id error:', err);
    res.status(500).json({ error: 'Error deleting bird', detail: String(err) });
  }
});

// ---------- PAIRS ----------
app.get('/pairs', async (req, res) => {
  try {
    const pairs = await getTable(SHEET_PAIRS, 'A1:G1000');
    res.json(pairs);
  } catch (err) {
    console.error('GET /pairs error:', err);
    res.status(500).json({ error: 'Error fetching pairs', detail: String(err) });
  }
});

app.post('/pairs', async (req, res) => {
  try {
    const body = req.body;
    const newId = await getNextId(SHEET_PAIRS, 'P');
    const values = [
      newId,
      body.MaleID || '',
      body.FemaleID || '',
      body.StartDate || '',
      body.EndDate || '',
      body.Status || 'ใช้งาน',
      body.Notes || '',
    ];
    await appendRow(SHEET_PAIRS, 'A:G', values);
    res.json({ success: true, PairID: newId });
  } catch (err) {
    console.error('POST /pairs error:', err);
    res.status(500).json({ error: 'Error creating pair', detail: String(err) });
  }
});

app.put('/pairs/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const rowIndex = await findRowIndexById(SHEET_PAIRS, id);
    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Pair not found' });
    }

    const body = req.body;
    const values = [
      id,
      body.MaleID || '',
      body.FemaleID || '',
      body.StartDate || '',
      body.EndDate || '',
      body.Status || 'ใช้งาน',
      body.Notes || '',
    ];

    await updateRow(SHEET_PAIRS, rowIndex, 'A', 'G', values);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /pairs/:id error:', err);
    res.status(500).json({ error: 'Error updating pair', detail: String(err) });
  }
});

app.delete('/pairs/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const ok = await deleteRowByIdAndShiftUp(SHEET_PAIRS, 'G', id);
    if (!ok) {
      return res.status(404).json({ error: 'Pair not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /pairs/:id error:', err);
    res.status(500).json({ error: 'Error deleting pair', detail: String(err) });
  }
});

// ---------- CHICKS ----------
app.get('/chicks', async (req, res) => {
  try {
    const chicks = await getTable(SHEET_CHICKS, 'A1:I1000');
    res.json(chicks);
  } catch (err) {
    console.error('GET /chicks error:', err);
    res.status(500).json({ error: 'Error fetching chicks', detail: String(err) });
  }
});

app.post('/chicks', async (req, res) => {
  try {
    const body = req.body;
    const newId = await getNextId(SHEET_CHICKS, 'K');
    const values = [
      newId,
      body.ClutchID || '',
      body.BirdID || '',
      body.RingNo || '',
      body.HatchDate || '',
      body.Sex || '',
      body.Color || '',
      body.Status || '',
      body.Notes || '',
    ];
    await appendRow(SHEET_CHICKS, 'A:I', values);
    res.json({ success: true, ChickID: newId });
  } catch (err) {
    console.error('POST /chicks error:', err);
    res.status(500).json({ error: 'Error creating chick', detail: String(err) });
  }
});

app.put('/chicks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const rowIndex = await findRowIndexById(SHEET_CHICKS, id);
    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Chick not found' });
    }

    const body = req.body;
    const values = [
      id,
      body.ClutchID || '',
      body.BirdID || '',
      body.RingNo || '',
      body.HatchDate || '',
      body.Sex || '',
      body.Color || '',
      body.Status || '',
      body.Notes || '',
    ];

    await updateRow(SHEET_CHICKS, rowIndex, 'A', 'I', values);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /chicks/:id error:', err);
    res.status(500).json({ error: 'Error updating chick', detail: String(err) });
  }
});

app.delete('/chicks/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const ok = await deleteRowByIdAndShiftUp(SHEET_CHICKS, 'I', id);
    if (!ok) {
      return res.status(404).json({ error: 'Chick not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /chicks/:id error:', err);
    res.status(500).json({ error: 'Error deleting chick', detail: String(err) });
  }
});

// ---------- START ----------
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Bird API running on port ${port}`);
});
