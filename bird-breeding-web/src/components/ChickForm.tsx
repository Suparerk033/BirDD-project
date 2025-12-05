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
    <div className="p-3 chick-form">
      {/* หัวฟอร์ม */}
      <div className="d-flex align-items-center mb-3">
        <span className="chick-form-icon me-2">🪺</span>
        <h3 className="fw-semibold mb-0">เพิ่มลูกนก</h3>
      </div>

      <div className="row g-3">
        {/* คู่พ่อแม่ */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label">คู่พ่อแม่ *</label>
          <select
            className="form-select form-select-lg"
            value={value.ClutchID}
            onChange={(e) => update("ClutchID", e.target.value)}
          >
            <option value="">เลือกคู่พ่อแม่</option>
            {pairs.map((p) => (
              <option key={p.PairID} value={p.PairID}>
                {p.PairID} (♂ {p.MaleID} × ♀ {p.FemaleID})
              </option>
            ))}
          </select>
        </div>

        {/* รหัสลูกนก */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label">รหัสลูกนก *</label>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="เช่น C001"
            value={value.RingNo}
            onChange={(e) => update("RingNo", e.target.value)}
          />
        </div>

        {/* ชื่อลูกนก -> ใช้เก็บใน Notes (คอลัมน์ชื่อในตาราง) */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label">ชื่อลูกนก</label>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="ชื่อลูกนก"
            value={value.Name}
            onChange={(e) => update("Name", e.target.value)}
          />
        </div>


        {/* เพศ */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label">เพศ</label>
          <select
            className="form-select form-select-lg"
            value={value.Sex}
            onChange={(e) => update("Sex", e.target.value)}
          >
            <option value="ยังไม่ตรวจ">ยังไม่ทราบ</option>
            <option value="ผู้">ผู้</option>
            <option value="เมีย">เมีย</option>
          </select>
        </div>

        {/* แถวล่าง */}

        {/* วันที่ฟัก */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label">วันที่ฟัก *</label>
          <input
            type="date"
            className="form-control form-control-lg"
            value={value.HatchDate}
            onChange={(e) => update("HatchDate", e.target.value)}
          />
        </div>

        {/* สี */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label">สี</label>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="สีของลูกนก"
            value={value.Color}
            onChange={(e) => update("Color", e.target.value)}
          />
        </div>

        {/* สถานะ */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label">สถานะ</label>
          <select
            className="form-select form-select-lg"
            value={value.Status}
            onChange={(e) => update("Status", e.target.value)}
          >
            <option value="มีชีวิต">มีชีวิต</option>
            <option value="ขายแล้ว">ขายแล้ว</option>
            <option value="เสียชีวิต">เสียชีวิต</option>
          </select>
        </div>

        {/* ปุ่มบันทึกสีส้ม */}
        <div className="col-lg-3 col-md-6 d-flex align-items-end">
          <button
            className="btn w-100 chick-form-save-btn"
            onClick={onSave}
            disabled={saving}
          >
            🪺 {saving ? "กำลังบันทึก..." : "บันทึกลูกนก"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChickForm;
