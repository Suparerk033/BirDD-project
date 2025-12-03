// src/App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import type { Bird, Pair, Chick, TabKey } from './types';

import BirdForm from './components/BirdForm';
import PairForm from './components/PairForm';
import ChickForm from './components/ChickForm';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [tab, setTab] = useState<TabKey>('birds');

  const [birds, setBirds] = useState<Bird[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [chicks, setChicks] = useState<Chick[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // ---------------- form state ----------------
  const [birdForm, setBirdForm] = useState<Omit<Bird, 'BirdID'>>({
    RingNo: '',
    Species: '',
    Sex: 'ไม่ทราบ',
    Color: '',
    BirthDate: '',
    Origin: 'เพาะเอง',
    Notes: '',
  });

  // ✅ ใส่ type ให้ชัด และเพิ่ม Status
  const [pairForm, setPairForm] = useState<Omit<Pair, 'PairID'>>({
    MaleID: '',
    FemaleID: '',
    StartDate: '',
    EndDate: '',
    Status: 'ใช้งาน',
    Notes: '',
  });

  const [chickForm, setChickForm] = useState<Omit<Chick, 'ChickID'>>({
    ClutchID: '',
    BirdID: '',
    RingNo: '',
    HatchDate: '',
    Sex: 'ยังไม่ตรวจ',
    Color: '',
    Status: 'มีชีวิต',
    Notes: '',
  });

  // ---------------- edit state ----------------
  const [editingBirdId, setEditingBirdId] = useState<string | null>(null);
  const [editingPairId, setEditingPairId] = useState<string | null>(null);
  const [editingChickId, setEditingChickId] = useState<string | null>(null);

  // ---------------- load all data ----------------
  const fetchAll = async () => {
    setLoading(true);
    setMessage('');

    try {
      const [bRes, pRes, kRes] = await Promise.allSettled([
        axios.get<Bird[]>(`${API_BASE_URL}/birds`),
        axios.get<Pair[]>(`${API_BASE_URL}/pairs`),
        axios.get<Chick[]>(`${API_BASE_URL}/chicks`),
      ]);

      if (bRes.status === 'fulfilled') setBirds(bRes.value.data || []);
      else setBirds([]);

      if (pRes.status === 'fulfilled') setPairs(pRes.value.data || []);
      else setPairs([]);

      if (kRes.status === 'fulfilled') setChicks(kRes.value.data || []);
      else setChicks([]);

      const allFailed =
        bRes.status === 'rejected' &&
        pRes.status === 'rejected' &&
        kRes.status === 'rejected';

      if (allFailed) {
        setMessage(
          'โหลดข้อมูลไม่สำเร็จทั้ง 3 รายการ · ตรวจสอบว่า bird-api รันอยู่ที่ ' +
            API_BASE_URL,
        );
      }
    } catch (err: any) {
      setMessage('โหลดข้อมูลไม่สำเร็จ · ตรวจสอบ server bird-api');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ---------------- save (create / update) ----------------
  const handleSave = async (type: TabKey) => {
    if (type === 'stats') return;

    setSaving(true);
    setMessage('');

    try {
      if (type === 'birds') {
        const body = birdForm;

        if (editingBirdId) {
          await axios.put(`${API_BASE_URL}/birds/${editingBirdId}`, body);
          setMessage(`แก้ไขข้อมูลนก ${editingBirdId} สำเร็จ ✓`);
        } else {
          const res = await axios.post(`${API_BASE_URL}/birds`, body);
          if (!res.data?.success) {
            throw new Error('API not return success:true');
          }
          setMessage('บันทึกข้อมูลนกสำเร็จ ✓');
        }

        setBirdForm({
          RingNo: '',
          Species: '',
          Sex: 'ไม่ทราบ',
          Color: '',
          BirthDate: '',
          Origin: 'เพาะเอง',
          Notes: '',
        });
        setEditingBirdId(null);
      }

      if (type === 'pairs') {
        // ✅ pairForm มี Status อยู่แล้ว
        const body = pairForm;

        if (editingPairId) {
          await axios.put(`${API_BASE_URL}/pairs/${editingPairId}`, body);
          setMessage(`แก้ไขคู่ผสม ${editingPairId} สำเร็จ ✓`);
        } else {
          const res = await axios.post(`${API_BASE_URL}/pairs`, body);
          if (!res.data?.success) {
            throw new Error('API not return success:true');
          }
          setMessage('บันทึกคู่ผสมสำเร็จ ✓');
        }

        setPairForm({
          MaleID: '',
          FemaleID: '',
          StartDate: '',
          EndDate: '',
          Status: 'ใช้งาน',
          Notes: '',
        });
        setEditingPairId(null);
      }

      if (type === 'chicks') {
        const body = chickForm;

        if (editingChickId) {
          await axios.put(`${API_BASE_URL}/chicks/${editingChickId}`, body);
          setMessage(`แก้ไขลูกนก ${editingChickId} สำเร็จ ✓`);
        } else {
          const res = await axios.post(`${API_BASE_URL}/chicks`, body);
          if (!res.data?.success) {
            throw new Error('API not return success:true');
          }
          setMessage('บันทึกลูกนกสำเร็จ ✓');
        }

        setChickForm({
          ClutchID: '',
          BirdID: '',
          RingNo: '',
          HatchDate: '',
          Sex: 'ยังไม่ตรวจ',
          Color: '',
          Status: 'มีชีวิต',
          Notes: '',
        });
        setEditingChickId(null);
      }

      await fetchAll();
    } catch (err: any) {
      console.error('handleSave error:', err);
      setMessage('เกิดข้อผิดพลาดในการบันทึก · ดู log ใน terminal ของ bird-api');
    } finally {
      setSaving(false);
    }
  };

  // ---------------- delete handlers ----------------
  const handleDeleteBird = async (bird: Bird) => {
    if (!bird.BirdID) return;
    const ok = window.confirm(
      `ต้องการลบนกรหัส ${bird.RingNo || bird.BirdID} ใช่ไหม?`,
    );
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE_URL}/birds/${bird.BirdID}`);
      setMessage(`ลบนก ${bird.RingNo || bird.BirdID} สำเร็จ ✓`);
      await fetchAll();
    } catch (err) {
      console.error('delete bird error:', err);
      setMessage('ลบนกไม่สำเร็จ · ตรวจสอบ server');
    }
  };

  const handleDeletePair = async (pair: Pair) => {
    if (!pair.PairID) return;
    const ok = window.confirm(`ต้องการลบคู่ผสม ${pair.PairID} ใช่ไหม?`);
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE_URL}/pairs/${pair.PairID}`);
      setMessage(`ลบคู่ผสม ${pair.PairID} สำเร็จ ✓`);
      await fetchAll();
    } catch (err) {
      console.error('delete pair error:', err);
      setMessage('ลบคู่ผสมไม่สำเร็จ · ตรวจสอบ server');
    }
  };

  const handleDeleteChick = async (chick: Chick) => {
    if (!chick.ChickID) return;
    const ok = window.confirm(
      `ต้องการลบลูกนก ${chick.RingNo || chick.ChickID} ใช่ไหม?`,
    );
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE_URL}/chicks/${chick.ChickID}`);
      setMessage(`ลบลูกนก ${chick.RingNo || chick.ChickID} สำเร็จ ✓`);
      await fetchAll();
    } catch (err) {
      console.error('delete chick error:', err);
      setMessage('ลบลูกนกไม่สำเร็จ · ตรวจสอบ server');
    }
  };

  // ---------------- edit handlers ----------------
  const handleEditBird = (b: Bird) => {
    if (!b.BirdID) return;
    setEditingBirdId(b.BirdID);
    setBirdForm({
      RingNo: b.RingNo || '',
      Species: b.Species || '',
      Sex: b.Sex || 'ไม่ทราบ',
      Color: b.Color || '',
      BirthDate: b.BirthDate || '',
      Origin: b.Origin || 'เพาะเอง',
      Notes: b.Notes || '',
    });
    setTab('birds');
    setMessage(`กำลังแก้ไขข้อมูลนก ${b.RingNo || b.BirdID}`);
  };

  const handleEditPair = (p: Pair) => {
    if (!p.PairID) return;
    setEditingPairId(p.PairID);
    setPairForm({
      MaleID: p.MaleID || '',
      FemaleID: p.FemaleID || '',
      StartDate: p.StartDate || '',
      EndDate: p.EndDate || '',
      Status: p.Status || 'ใช้งาน', // ✅ ดึง Status มาเก็บด้วย
      Notes: p.Notes || '',
    });
    setTab('pairs');
    setMessage(`กำลังแก้ไขคู่ผสม ${p.PairID}`);
  };

  const handleEditChick = (k: Chick) => {
    if (!k.ChickID) return;
    setEditingChickId(k.ChickID);
    setChickForm({
      ClutchID: k.ClutchID || '',
      BirdID: k.BirdID || '',
      RingNo: k.RingNo || '',
      HatchDate: k.HatchDate || '',
      Sex: k.Sex || 'ยังไม่ตรวจ',
      Color: k.Color || '',
      Status: k.Status || 'มีชีวิต',
      Notes: k.Notes || '',
    });
    setTab('chicks');
    setMessage(`กำลังแก้ไขลูกนก ${k.RingNo || k.ChickID}`);
  };

  // ---------------- helpers ----------------
  const calcAgeFromDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    const now = new Date();
    let months =
      (now.getFullYear() - d.getFullYear()) * 12 +
      (now.getMonth() - d.getMonth());
    if (months < 0) months = 0;
    return `${months}`;
  };

  const renderChickStatusBadge = (status?: string | null) => {
    if (!status) return '-';
    if (status === 'เสียชีวิต') {
      return (
        <span className="badge bg-danger-subtle text-danger fw-semibold">
          {status}
        </span>
      );
    }
    if (status === 'ขายแล้ว') {
      return (
        <span className="badge bg-warning-subtle text-warning-emphasis fw-semibold">
          {status}
        </span>
      );
    }
    return (
      <span className="badge bg-success-subtle text-success fw-semibold">
        {status}
      </span>
    );
  };

  // ---------------- list views ----------------
  const BirdList = ({
    birds,
    onEdit,
    onDelete,
  }: {
    birds: Bird[];
    onEdit: (b: Bird) => void;
    onDelete: (b: Bird) => void;
  }) => (
    <div className="card simple-card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: '1.3rem' }}>
              📝
            </span>
            <span className="card-title-main">รายการนก</span>
          </div>
          <div className="text-muted small mt-1">
            ดูภาพรวมนกทั้งหมดในฟาร์ม เรียงตามรหัสนก
          </div>
        </div>
        <span className="badge bg-primary rounded-pill px-3 py-2">
          {birds.length} ตัว
        </span>
      </div>

      <div className="card-body p-0">
        <div className="bird-table-wrap">
          <table className="table mb-0 align-middle bird-table">
            <thead className="table-light">
              <tr>
                <th>รหัสนก</th>
                <th>ชื่อ</th>
                <th>สายพันธุ์</th>
                <th>เพศ</th>
                <th>อายุ (เดือน)</th>
                <th>สี</th>
                <th>วันที่เพิ่ม</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {birds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    ยังไม่มีข้อมูลนก กรุณาเพิ่มข้อมูลนกใหม่จากฟอร์มด้านล่าง
                  </td>
                </tr>
              ) : (
                birds.map((b) => (
                  <tr key={b.BirdID}>
                    <td className="fw-semibold">{b.RingNo || '-'}</td>
                    <td>{(b as any).Name || '-'}</td>
                    <td>{b.Species || '-'}</td>
                    <td>{b.Sex || '-'}</td>
                    <td>{(b as any).Age ?? calcAgeFromDate(b.BirthDate)}</td>
                    <td>{b.Color || '-'}</td>
                    <td>{b.BirthDate || '-'}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => onEdit(b)}
                      >
                        แก้ไข
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(b)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const PairList = ({
    pairs,
    onEdit,
    onDelete,
  }: {
    pairs: Pair[];
    onEdit: (p: Pair) => void;
    onDelete: (p: Pair) => void;
  }) => (
    <div className="card simple-card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: '1.3rem' }}>
              👫
            </span>
            <span className="card-title-main">คู่เพาะพันธุ์</span>
          </div>
          <div className="text-muted small mt-1">
            แสดงคู่พ่อ–แม่ที่จับคู่ไว้ พร้อมวันที่เริ่มจับคู่
          </div>
        </div>
        <span className="badge bg-success rounded-pill px-3 py-2">
          {pairs.length} คู่
        </span>
      </div>

      <div className="card-body p-0">
        <div className="bird-table-wrap">
          <table className="table mb-0 align-middle bird-table">
            <thead className="table-light">
              <tr>
                <th>นกตัวผู้</th>
                <th>นกตัวเมีย</th>
                <th>วันที่จับคู่</th>
                <th>หมายเหตุ</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {pairs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    ยังไม่มีคู่เพาะพันธุ์ กรุณาจับคู่นกจากฟอร์มด้านล่าง
                  </td>
                </tr>
              ) : (
                pairs.map((p) => (
                  <tr key={p.PairID}>
                    <td>{p.MaleID || '-'}</td>
                    <td>{p.FemaleID || '-'}</td>
                    <td>{p.StartDate || '-'}</td>
                    <td>{p.Notes || '-'}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => onEdit(p)}
                      >
                        แก้ไข
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(p)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ChickList = ({
    chicks,
    onEdit,
    onDelete,
  }: {
    chicks: Chick[];
    onEdit: (c: Chick) => void;
    onDelete: (c: Chick) => void;
  }) => (
    <div className="card simple-card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: '1.3rem' }}>
              🐣
            </span>
            <span className="card-title-main">รายการลูกนก</span>
          </div>
          <div className="text-muted small mt-1">
            ดูลูกนกแต่ละตัว พร้อมพ่อแม่ วันที่ฟัก และสถานะปัจจุบัน
          </div>
        </div>
        <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
          {chicks.length} ตัว
        </span>
      </div>

      <div className="card-body p-0">
        <div className="bird-table-wrap">
          <table className="table mb-0 align-middle bird-table">
            <thead className="table-light">
              <tr>
                <th>รหัสลูกนก</th>
                <th>ชื่อ</th>
                <th>พ่อแม่ (รหัสคู่)</th>
                <th>เพศ</th>
                <th>วันที่ฟัก</th>
                <th>อายุ (เดือน)</th>
                <th>สถานะ</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {chicks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    ยังไม่มีลูกนก กรุณาเพิ่มข้อมูลลูกนกจากฟอร์มด้านล่าง
                  </td>
                </tr>
              ) : (
                chicks.map((k) => (
                  <tr key={k.ChickID}>
                    <td className="fw-semibold">{k.RingNo || '-'}</td>
                    <td>{k.Notes || '-'}</td>
                    <td>{k.ClutchID || '-'}</td>
                    <td>{k.Sex || '-'}</td>
                    <td>{k.HatchDate || '-'}</td>
                    <td>{calcAgeFromDate(k.HatchDate)}</td>
                    <td>{renderChickStatusBadge(k.Status)}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => onEdit(k)}
                      >
                        แก้ไข
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(k)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ---------------- stats view ----------------
  const StatsView = ({
    birds,
    pairs,
    chicks,
  }: {
    birds: Bird[];
    pairs: Pair[];
    chicks: Chick[];
  }) => {
    const totalBirds = birds.length;
    const maleBirds = birds.filter((b) => (b.Sex || '').includes('ผู้')).length;
    const femaleBirds = birds.filter((b) => (b.Sex || '').includes('เมีย'))
      .length;

    const speciesCount = new Set(
      birds
        .map((b) => (b.Species || '').trim())
        .filter((s) => s.length > 0),
    ).size;

    const totalPairs = pairs.length;

    const totalChicks = chicks.length;
    const liveChicks = chicks.filter((c) => c.Status !== 'เสียชีวิต').length;

    return (
      <div className="stats-wrapper">
        <div className="stats-grid">
          <div className="stats-row">
            <div className="stat-card stat-blue">
              <div className="stat-number">{totalBirds}</div>
              <div className="stat-label">นกทั้งหมด</div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-number">{maleBirds}</div>
              <div className="stat-label">ตัวผู้ ♂</div>
            </div>
            <div className="stat-card stat-pink">
              <div className="stat-number">{femaleBirds}</div>
              <div className="stat-label">ตัวเมีย ♀</div>
            </div>
            <div className="stat-card stat-purple">
              <div className="stat-number">{speciesCount}</div>
              <div className="stat-label">สายพันธุ์</div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card stat-orange">
              <div className="stat-number">{totalPairs}</div>
              <div className="stat-label">คู่เพาะพันธุ์</div>
            </div>
            <div className="stat-card stat-gold">
              <div className="stat-number">{totalChicks}</div>
              <div className="stat-label">ลูกนกทั้งหมด</div>
            </div>
            <div className="stat-card stat-red">
              <div className="stat-number">{liveChicks}</div>
              <div className="stat-label">ลูกนกมีชีวิต</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------------- main switching ----------------
  let main: React.ReactNode = null;

  if (tab === 'birds') {
    main = (
      <div className="stack-main">
        <div>
          <BirdList
            birds={birds}
            onEdit={handleEditBird}
            onDelete={handleDeleteBird}
          />
        </div>
        <div>
          <div className="card simple-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="card-title-main">เพิ่ม / แก้ไขข้อมูลนก</span>
              {editingBirdId && (
                <span className="badge bg-info text-dark">
                  แก้ไข: {editingBirdId}
                </span>
              )}
            </div>
            <div className="card-body">
              <BirdForm
                value={birdForm}
                saving={saving}
                onChange={setBirdForm}
                onSave={() => handleSave('birds')}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'pairs') {
    main = (
      <div className="stack-main">
        <div>
          <PairList
            pairs={pairs}
            onEdit={handleEditPair}
            onDelete={handleDeletePair}
          />
        </div>
        <div>
          <div className="card simple-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="card-title-main">เพิ่มคู่ผสม</span>
              {editingPairId && (
                <span className="badge bg-info text-dark">
                  แก้ไข: {editingPairId}
                </span>
              )}
            </div>
            <div className="card-body">
              <PairForm
                value={pairForm}
                saving={saving}
                onChange={setPairForm}
                onSave={() => handleSave('pairs')}
                birds={birds}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'chicks') {
    main = (
      <div className="stack-main">
        <div>
          <ChickList
            chicks={chicks}
            onEdit={handleEditChick}
            onDelete={handleDeleteChick}
          />
        </div>
        <div>
          <div className="card simple-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="card-title-main">เพิ่มลูกนก</span>
              {editingChickId && (
                <span className="badge bg-info text-dark">
                  แก้ไข: {editingChickId}
                </span>
              )}
            </div>
            <div className="card-body">
              <ChickForm
                value={chickForm}
                saving={saving}
                onChange={setChickForm}
                onSave={() => handleSave('chicks')}
                pairs={pairs}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'stats') {
    main = (
      <div className="card simple-card">
        <div className="card-header">
          <span className="card-title-main">ภาพรวมฟาร์ม</span>
        </div>
        <div className="card-body">
          <StatsView birds={birds} pairs={pairs} chicks={chicks} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="app-shell">
        {/* ========== SIDEBAR ========== */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-circle">🐦</div>
            <div>
              <div className="sidebar-app-name">Bird</div>
              <div className="sidebar-subtitle">ระบบจัดการเพาะพันธุ์นก</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`sidebar-link ${tab === 'birds' ? 'active' : ''}`}
              onClick={() => setTab('birds')}
            >
              ข้อมูลนก
            </button>
            <button
              className={`sidebar-link ${tab === 'pairs' ? 'active' : ''}`}
              onClick={() => setTab('pairs')}
            >
              คู่ผสม
            </button>
            <button
              className={`sidebar-link ${tab === 'chicks' ? 'active' : ''}`}
              onClick={() => setTab('chicks')}
            >
              ลูกนก
            </button>
            <button
              className={`sidebar-link ${tab === 'stats' ? 'active' : ''}`}
              onClick={() => setTab('stats')}
            >
              สถิติ
            </button>
          </nav>

          <div className="sidebar-summary">
            <div className="sidebar-summary-item">
              <span>นก</span>
              <span className="fw-semibold">{birds.length}</span>
            </div>
            <div className="sidebar-summary-item">
              <span>คู่ผสม</span>
              <span className="fw-semibold">{pairs.length}</span>
            </div>
            <div className="sidebar-summary-item">
              <span>ลูกนก</span>
              <span className="fw-semibold">{chicks.length}</span>
            </div>
          </div>
        </aside>

        {/* ========== MAIN AREA ========== */}
        <main className="main-area">
          <header className="main-header">
            <div>
              <h2 className="main-title">
                {tab === 'birds' && 'จัดการข้อมูลนก'}
                {tab === 'pairs' && 'จัดการคู่ผสม'}
                {tab === 'chicks' && 'จัดการลูกนก'}
                {tab === 'stats' && 'สถิติฟาร์ม'}
              </h2>
              <div className="main-subtitle">
                {tab === 'stats'
                  ? 'ดูภาพรวมข้อมูลทั้งหมดของฟาร์ม'
                  : 'ด้านบนคือรายการ ด้านล่างคือฟอร์มเพิ่ม/แก้ไขข้อมูล'}
              </div>
            </div>

            <button
              className="btn btn-light btn-refresh"
              onClick={fetchAll}
              disabled={loading}
            >
              {loading ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูล'}
            </button>
          </header>

          <div className="content-scroll">
            {main}
            {message && (
              <div className="alert alert-info mt-3 mb-0">{message}</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
