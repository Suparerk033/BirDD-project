import React from "react";
import type { Chick, Pair } from "../types";

interface ChickFormProps {
  value: Omit<Chick, "ChickID">;
  saving: boolean;
  pairs: Pair[];
  onChange: (val: Omit<Chick, "ChickID">) => void;
  onSave: () => void;
}

const ChickForm: React.FC<ChickFormProps> = ({
  value,
  saving,
  pairs,
  onChange,
  onSave,
}) => {
  const update = (k: keyof Omit<Chick, "ChickID">, v: any) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="p-3">
      <div className="row g-3">

        <div className="col-md-6">
          <label className="form-label">คู่พ่อแม่ (PairID)</label>
          <select
            className="form-select"
            value={value.ClutchID}
            onChange={(e) => update("ClutchID", e.target.value)}
          >
            <option value="">-- เลือกคู่พ่อแม่ --</option>
            {pairs.map((p) => (
              <option key={p.PairID} value={p.PairID}>
                {p.PairID} (♂ {p.MaleID} × ♀ {p.FemaleID})
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">รหัสวงแหวนลูกนก</label>
          <input
            type="text"
            className="form-control"
            value={value.RingNo}
            onChange={(e) => update("RingNo", e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">วันฟัก</label>
          <input
            type="date"
            className="form-control"
            value={value.HatchDate}
            onChange={(e) => update("HatchDate", e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">เพศลูกนก</label>
          <select
            className="form-select"
            value={value.Sex}
            onChange={(e) => update("Sex", e.target.value)}
          >
            <option value="ยังไม่ตรวจ">ยังไม่ตรวจ</option>
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
          <label className="form-label">สถานะ</label>
          <select
            className="form-select"
            value={value.Status}
            onChange={(e) => update("Status", e.target.value)}
          >
            <option value="มีชีวิต">มีชีวิต</option>
            <option value="ขายแล้ว">ขายแล้ว</option>
            <option value="เสียชีวิต">เสียชีวิต</option>
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

export default ChickForm;
