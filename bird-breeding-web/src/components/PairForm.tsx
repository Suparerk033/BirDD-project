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

  // แยกตัวผู้/ตัวเมีย เพื่อให้ตรงกับช่องเลือก
  const maleBirds = birds.filter((b) => (b.Sex || "").includes("ผู้"));
  const femaleBirds = birds.filter((b) => (b.Sex || "").includes("เมีย"));

  return (
    <div className="p-3 pair-form">
      {/* หัวฟอร์ม */}
      <div className="d-flex align-items-center mb-3">
        <span className="pair-form-icon me-2">💗</span>
        <h3 className="fw-semibold mb-0">จับคู่เพาะพันธุ์</h3>
      </div>

      <div className="row g-3">
        {/* นกตัวผู้ */}
        <div className="col-lg-4 col-md-6">
          <label className="form-label">นกตัวผู้ *</label>
          <select
            className="form-select form-select-lg"
            value={value.MaleID}
            onChange={(e) => update("MaleID", e.target.value)}
          >
            <option value="">เลือกนกตัวผู้</option>
            {maleBirds.map((b) => (
              <option key={b.BirdID} value={b.BirdID}>
                {b.RingNo} {b.Name ? `- ${b.Name}` : ""} ({b.Species || "ไม่ระบุ"})
              </option>
            ))}
          </select>
        </div>

        {/* นกตัวเมีย */}
        <div className="col-lg-4 col-md-6">
          <label className="form-label">นกตัวเมีย *</label>
          <select
            className="form-select form-select-lg"
            value={value.FemaleID}
            onChange={(e) => update("FemaleID", e.target.value)}
          >
            <option value="">เลือกนกตัวเมีย</option>
            {femaleBirds.map((b) => (
              <option key={b.BirdID} value={b.BirdID}>
                {b.RingNo} {b.Name ? `- ${b.Name}` : ""} ({b.Species || "ไม่ระบุ"})
              </option>
            ))}
          </select>
        </div>

        {/* วันที่จับคู่ */}
        <div className="col-lg-4 col-md-6">
          <label className="form-label">วันที่จับคู่ *</label>
          <input
            type="date"
            className="form-control form-control-lg"
            value={value.StartDate}
            onChange={(e) => update("StartDate", e.target.value)}
          />
        </div>

        {/* หมายเหตุ */}
        <div className="col-lg-6 col-md-7">
          <label className="form-label">หมายเหตุ</label>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="หมายเหตุการเพาะพันธุ์"
            value={value.Notes}
            onChange={(e) => update("Notes", e.target.value)}
          />
        </div>

        {/* ปุ่มเขียว บันทึกการจับคู่ */}
        <div className="col-lg-6 col-md-5 d-flex align-items-end">
          <button
            className="btn w-100 pair-form-save-btn"
            onClick={onSave}
            disabled={saving}
          >
            💗 {saving ? "กำลังบันทึก..." : "บันทึกการจับคู่"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PairForm;
