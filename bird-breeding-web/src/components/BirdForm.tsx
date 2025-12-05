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
    <div className="p-3">
      <div className="row g-3">

        <div className="col-md-6">
          <label className="form-label">รหัสวงแหวน</label>
          <input
            type="text"
            className="form-control"
            value={value.RingNo}
            onChange={(e) => update("RingNo", e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">สายพันธุ์</label>
          <input
            type="text"
            className="form-control"
            value={value.Species}
            onChange={(e) => update("Species", e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">เพศ</label>
          <select
            className="form-select"
            value={value.Sex}
            onChange={(e) => update("Sex", e.target.value)}
          >
            <option value="ไม่ทราบ">ไม่ทราบ</option>
            <option value="ผู้">ผู้</option>
            <option value="เมีย">เมีย</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">สี</label>
          <input
            type="text"
            className="form-control"
            value={value.Color}
            onChange={(e) => update("Color", e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">วันเกิด</label>
          <input
            type="date"
            className="form-control"
            value={value.BirthDate}
            onChange={(e) => update("BirthDate", e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">ที่มา</label>
          <select
            className="form-select"
            value={value.Origin}
            onChange={(e) => update("Origin", e.target.value)}
          >
            <option value="เพาะเอง">เพาะเอง</option>
            <option value="ซื้อมา">ซื้อมา</option>
          </select>
        </div>

        <div className="col-12">
          <label className="form-label">หมายเหตุ</label>
          <textarea
            className="form-control"
            value={value.Notes}
            onChange={(e) => update("Notes", e.target.value)}
          />
        </div>

        <div className="col-12 mt-3">
          <button
            className="btn btn-primary"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirdForm;
