// -------------------------------
// ประเภทข้อมูลนก (Bird)
// -------------------------------
export interface Bird {
  BirdID: string;
  RingNo: string;
  Species: string;
  Sex: string;
  Color: string;
  BirthDate: string;
  Origin: string;
  Notes: string;
}

// -------------------------------
// ประเภทข้อมูลคู่ผสม (Pair)
// -------------------------------
export interface Pair {
  PairID: string;
  MaleID: string;
  FemaleID: string;
  StartDate: string;
  EndDate: string;
  Status: string;
  Notes: string;
}

// -------------------------------
// ประเภทข้อมูลลูกนก (Chick)
// -------------------------------
export interface Chick {
  ChickID: string;
  ClutchID: string;
  BirdID: string;
  RingNo: string;
  HatchDate: string;
  Sex: string;
  Color: string;
  Status: string;
  Notes: string;
}

// -------------------------------
// ประเภทแท็บที่ใช้ใน UI
// -------------------------------
export type TabKey = 'birds' | 'pairs' | 'chicks' | 'stats';
