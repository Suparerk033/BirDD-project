// -------------------------------
// ประเภทข้อมูลนก (Bird)
// -------------------------------
export interface Bird {
  BirdID: string;     // สร้างอัตโนมัติจาก backend
  RingNo: string;     // รหัสนก
  Name: string;       // ชื่อนก
  Species: string;    // สายพันธุ์
  Sex: string;        // เพศ
  Age: string;        // อายุ (เดือน)
  Color: string;      // สี
  AddedDate: string;  // วันที่เพิ่ม
  Origin: string;     // ที่มา
  Notes: string;      // หมายเหตุ
}

// -------------------------------
// ประเภทข้อมูลคู่ผสม (Pair)
// -------------------------------
export interface Pair {
  PairID: string;
  MaleID: string;      // นกตัวผู้ (BirdID)
  FemaleID: string;    // นกตัวเมีย (BirdID)
  StartDate: string;   // วันที่จับคู่
  Notes: string;       // หมายเหตุ
}
// -------------------------------
// ประเภทข้อมูลลูกนก (Chick)
// -------------------------------
export interface Chick {
  ChickID: string;
  ClutchID: string; // FK ไปคู่พ่อแม่
  RingNo: string;
  Name: string;
  HatchDate: string;
  Sex: string;
  Color: string;
  Status: string;
}

// -------------------------------
// ประเภทแท็บที่ใช้ใน UI
// -------------------------------
export type TabKey = 'birds' | 'pairs' | 'chicks' | 'stats';
