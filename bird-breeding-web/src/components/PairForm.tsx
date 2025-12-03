import React from "react";
import type { Pair, Bird } from "../types";

interface PairFormProps {
  value: Omit<Pair, "PairID">;
  saving: boolean;
  birds: Bird[];
  onChange: (val: Omit<Pair, "PairID">) => void;
  onSave: () => void;
}

const PairForm: React.FC<PairFormProps> = ({
  value,
  saving,
  birds,
  onChange,
  onSave,
}) => {
  const update = (k: keyof Omit<Pair, "PairID">, v: any) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="p-3">
      <div className="row g-3">

        <div className="col-md-6">
          <label className="form-label">ตัวผู้</label>
          <select
            className="form-select"
            value={value.MaleID}
            onChange={(e) => update("MaleID", e.target.value)}
          >
            <option value="">-- เลือกนกตัวผู้ --</option>
            {birds.map((b) => (
              <option key={b.BirdID} value={b.BirdID}>
                {b.RingNo} ({b.Species})
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">ตัวเมีย</label>
          <select
            className="form-select"
            value={value.FemaleID}
            onChange={(e) => update("FemaleID", e.target.value)}
          >
            <option value="">-- เลือกนกตัวเมีย --</option>
            {birds.map((b) => (
              <option key={b.BirdID} value={b.BirdID}>
                {b.RingNo} ({b.Species})
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">วันที่จับคู่</label>
          <input
            type="date"
            className="form-control"
            value={value.StartDate}
            onChange={(e) => update("StartDate", e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">วันที่แยก (ถ้ามี)</label>
          <input
            type="date"
            className="form-control"
            value={value.EndDate}
            onChange={(e) => update("EndDate", e.target.value)}
          />
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

export default PairForm;
