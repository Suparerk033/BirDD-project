import React from "react";
import type { Bird } from "../types";

interface BirdFormProps {
  value: Omit<Bird, "BirdID">;
  saving: boolean;
  onChange: (val: Omit<Bird, "BirdID">) => void;
  onSave: () => void;
}

const BirdForm: React.FC<BirdFormProps> = ({
  value,
  saving,
  onChange,
  onSave,
}) => {
  const update = (key: keyof Omit<Bird, "BirdID">, val: any) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="bird-form-card p-4 mb-4">
      {/* หัวข้อ */}
      <div className="d-flex align-items-center mb-4">
        <span className="me-2 text-primary fs-4">＋</span>
        <h3 className="mb-0 fw-semibold bird-form-title">เพิ่มข้อมูลนกใหม่</h3>
      </div>

      {/* แถวบน: รหัสนก, ชื่อนก, สายพันธุ์, เพศ */}
      <div className="row g-3 mb-2">
        <div className="col-lg-3 col-md-6">
          <label className="form-label">รหัสนก *</label>
          <input
            type="text"
            className="form-control"
            placeholder="เช่น B001"
            value={value.RingNo}
            onChange={(e) => update("RingNo", e.target.value)}
          />
        </div>

        <div className="col-lg-3 col-md-6">
          <label className="form-label">ชื่อนก *</label>
          <input
            type="text"
            className="form-control"
            placeholder="ชื่อนก"
            value={value.Name}
            onChange={(e) => update("Name", e.target.value)}
          />
        </div>

        <div className="col-lg-3 col-md-6">
          <label className="form-label">สายพันธุ์ *</label>
          <input
            type="text"
            className="form-control"
            placeholder="สายพันธุ์"
            value={value.Species}
            onChange={(e) => update("Species", e.target.value)}
          />
        </div>

        <div className="col-lg-3 col-md-6">
          <label className="form-label">เพศ *</label>
          <select
            className="form-select"
            value={value.Sex || ""}
            onChange={(e) => update("Sex", e.target.value)}
          >
            <option value="">เลือกเพศ</option>
            <option value="ผู้">ผู้</option>
            <option value="เมีย">เมีย</option>
            <option value="ไม่ทราบ">ไม่ทราบ</option>
          </select>
        </div>
      </div>

      {/* แถวล่าง: อายุ, สี, วันที่เพิ่ม, ที่มา, หมายเหตุ, ปุ่มบันทึก */}
      <div className="row g-3 align-items-end">
        {/* อายุ (กรอกเอง) */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label">อายุ (เดือน)</label>
          <input
            type="number"
            className="form-control"
            placeholder="อายุเป็นเดือน"
            value={value.Age}
            onChange={(e) => update("Age", e.target.value)}
          />
        </div>

        {/* สี */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label">สี</label>
          <input
            type="text"
            className="form-control"
            placeholder="สีของนก"
            value={value.Color}
            onChange={(e) => update("Color", e.target.value)}
          />
        </div>

        {/* วันที่เพิ่ม */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label">วันที่เพิ่ม *</label>
          <input
            type="date"
            className="form-control"
            value={value.AddedDate}
            onChange={(e) => update("AddedDate", e.target.value)}
          />
        </div>

        {/* ที่มา */}
        <div className="col-md-3">
          <label className="form-label">ที่มา *</label>
          <select
            className="form-select"
            value={value.Origin}
            onChange={(e) => update("Origin", e.target.value)}
          >
            <option value="เพาะเอง">เพาะเอง</option>
            <option value="ซื้อมาจากฟาร์ม">ซื้อมาจากฟาร์ม</option>
            <option value="เก็บมา">เก็บมา</option>
            <option value="ไม่ทราบ">ไม่ทราบ</option>
          </select>
        </div>

        {/* หมายเหตุ */}
        <div className="col-md-6">
          <label className="form-label">หมายเหตุ</label>
          <textarea
            className="form-control"
            value={value.Notes}
            onChange={(e) => update("Notes", e.target.value)}
          />
        </div>

        {/* ปุ่มบันทึก */}
        <div className="col-lg-3 col-md-6 d-flex justify-content-lg-end">
          <button
            className="btn btn-primary w-100 bird-form-save-btn"
            onClick={onSave}
            disabled={saving}
          >
            <span className="me-2">💾</span>
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirdForm;
