# CLAUDE.md — Booking Tracker Project

## RULES (บังคับ)
- **คุณคือ programmer อายุงาน 50 ปี — อ่านคำสั่งให้ครบก่อนทำเสมอ ห้ามตอบมั่ว ห้ามเดา ห้ามใส่อะไรเกินคำสั่ง**
- **หลัง compact หรือเริ่ม session ใหม่ ให้อ่าน CLAUDE.md ก่อนทำงานทุกครั้ง**
- **ก่อน compact หรือจบ session ให้สรุปและอัพเดทสถานะงานลง CLAUDE.md ทุกครั้ง**
- บันทึกว่าทำอะไรไปแล้ว, อะไรค้าง, อะไรต้องทำต่อ
- ถ้า context ใกล้เต็ม ให้สรุปก่อน compact เสมอ
- **ทุกครั้งที่แก้โค้ดเสร็จ ให้ restart dev server เสมอ** — `lsof -ti:3000 | xargs kill -9 && npx next dev -p 3000`

## Current Status
- **Last updated:** 2026-02-24 (session 6)
- **สถานะ:** Tracking Dashboard — heatmap restructure + sections cleanup เสร็จ

### เสร็จแล้ว (session นี้ — session 6)
- **เพิ่ม doc_meter** (เอกสารมิเตอร์น้ำ-ไฟ) ใน PROCESS_BACKLOG กลุ่มเอกสาร, SLA 1 วัน
- **Dropdown สลับ heatmap mode** — "ยังไม่ได้ดำเนินการ" (PROCESS_BACKLOG) / "กำลังดำเนินการ" (PROCESS_INPROGRESS)
  - state: `heatmapMode` ('pending' | 'inprogress'), ใช้ `activeData` ใน rendering
- **แยกตรวจบ้าน → CS Inspect + CON Inspect** ตาม PROCESS_MASTER:
  - **CS Inspect** (#0891b2 cyan): CS Review, โทรนัดตรวจ โอนสด, โทรนัดตรวจ กู้ธนาคาร — ไม่มี subGroup
  - **CON Inspect** (#7c3aed purple): CON Review (ไม่มี subGroup) + ตรวจ 1-3+ (subGroup จ้างตรวจ/ตรวจเอง)
  - QC5/QC5.5 เก็บใน PROCESS_MASTER แต่ไม่ Track ใน heatmap
  - ลำดับ: CS Inspect อยู่ก่อน CON Inspect
- **Unified rendering logic** — รองรับ mixed groups (group ที่มีทั้ง process ไม่มี subGroup + process มี subGroup)
- **ลบ section Workload — งานค้างรายคน** ออกจาก tracking dashboard
- **ลบ section Workload รายบุคคล** (PERSON_WORKLOAD table) ออกจาก tracking dashboard

### เสร็จแล้ว (session 5)
- ลบ sections: ธนาคาร charts ×2, Aging graphs ×2, Team Workload, Pipeline, After Transfer cards
- SLA Compliance per project + Backlog per project + Panel list + Dropdown สลับ
- Mock data: SLA_COMPLIANCE_DATA, BACKLOG_BY_PROJECT_DATA, PROJECT_BOOKING_ITEMS

### เสร็จแล้ว (session ก่อน)
- SLA sync ทั้งหมด, Inspection SLA finalized (Condo)
- Master Data Restructure, Inspection fields redesign
- Tracking Dashboard heatmap — group/subGroup collapsible + UI polish

### งานค้าง
- **แนวราบ SLA** — ตรวจเอง:10, จ้างตรวจ:15 (ต้องเพิ่ม projectType field ใน SlaRule)
- **SLA config table UI** — ยังไม่สร้าง
- **Heatmap ยังใช้ PROCESS_BACKLOG เดิม** — รอ migrate ไปใช้ PROCESS_MASTER + PROCESS_SLA

### Master Data Design (implemented)

#### PROCESS_MASTER (ProcessDef)
```ts
{ key: string; label: string; group: string; subGroup?: string }
```
- **Milestone:** booking, contract, downpayment_complete (no SLA, เป็น fromProcess ให้ตัวอื่น)
- **เอกสาร:** doc_bureau, doc_bank, doc_jd
- **LivNex:** jd_livnex
- **สินเชื่อ:** 6 occupations × 3 processes (bureau, preapprove, final)
- **ตรวจบ้าน:** inspect_appt_cash, inspect_appt_loan + จ้างตรวจ/ตรวจเอง sub-groups
- **โอน:** contract_bank, transfer_pkg, title_clear, transfer_appt, transfer_actual

#### PROCESS_SLA (SlaRule)
```ts
{ processKey: string; slaDays: number; fromProcess: string }
```

#### Inspection Fields (bookings.ts)
| Field | รอบ 1 | รอบ 2 | รอบ 3 | รอบ 3+ |
|---|---|---|---|---|
| โทรนัดตรวจ | `inspect1_call` | — | — | — |
| กำหนดตรวจ | `inspect1_schedule` | `inspect2_schedule` | `inspect3_schedule` | `inspect3plus_schedule` |
| ห้องพร้อม | `inspect1_ready` | `inspect2_ready` | `inspect3_ready` | `inspect3plus_ready` |
| นัดลูกค้าเข้าตรวจ | `inspect1_appt` | `inspect2_appt` | `inspect3_appt` | `inspect3plus_appt` |
| ตรวจจริง | `inspect1_date` | `inspect2_date` | `inspect3_date` | `inspect3plus_date` |
| ผลการตรวจ | `inspect1_result` | `inspect2_result` | `inspect3_result` | `inspect3plus_result` |

---

## User Workflow Preferences
- **Kill & restart dev server ทุกครั้งที่แก้โค้ดเสร็จ** — `lsof -ti:3000 | xargs kill -9 && npx next dev -p 3000`
- **Bar charts = แนวตั้งเสมอ** ยกเว้นสั่งให้ทำแนวนอน
- **ใช้ grid cols ไม่ใช่ w-[%]** สำหรับกำหนดความกว้าง
- **NEVER redesign from scratch** — always build on existing design
- When user says "ออกแบบใหม่" = improve/iterate, NOT throw away
- Clear `.next` cache when encountering 500 errors

---

## Design Decisions (LOCKED — ห้ามแก้ถ้า user ไม่ได้สั่ง)

### BookingDetailPanel
- **Sticky Header:** Close + Booking ID + Stage badge + Status pill + ผู้รับผิดชอบ + หมายเหตุ
- **Pipeline Stepper:** Pill-based 2-track (user likes this)
- **Section Headers:** Dark bars `bg-{color}-600` white text, each M1-M5 has own color
- **M1 ธนาคาร:** Bank collapsible via credit summary bar, chevron rightmost, amber gradient
- **M2 สินเชื่อ:** Table: Target/Target(Biz)/Actual/Result
- **M3 ตรวจบ้าน:** Table similar to M2
- **M4 โอน:** Card boxes with `›` separators, border color by state
- **M5 LivNex:** Unified card + status header + 2-column table
- **Style:** White shadow cards on slate-50, Label=slate-400, Value=slate-700, Empty=`—` slate-300

---

## Recharts Gotcha
- **Stacked bar `value` prop = cumulative** ไม่ใช่ค่า segment → ต้องดึงจาก data โดยตรง
  - Bar แรกใน stack: `value` = ค่าตัวเอง (ถูก)
  - Bar ที่ 2+: `value` = ผลรวมสะสม (ผิด!) → ใช้ `d.fieldName` แทน
- **สี label ในแท่งสีอ่อน:** ห้ามใช้ขาว → ใช้สีเข้มแทน
  - เขียวเข้ม (#047857) → ขาว (#fff) ✓
  - เขียวอ่อน (#34d399) → เขียวเข้มมาก (#065f46) ✓

---

## Chart Layout (TransferCharts.tsx)

**แถว 1 (grid-cols-2):**
- ซ้าย: **ยอดจอง** — MTOP vs Book (MTOP เทา + stack ทำสัญญา/รอทำสัญญา เขียว + เส้น Backlog)
- ขวา: **LivNex** เป้า vs Actual (แท่งคู่ส้ม + เส้นสะสม)

**แถว 2 (grid-cols-2):**
- ซ้าย: **ยกเลิก** (แท่งแดง + stack ซื้อLivNex/ซื้อPreLivNex + เส้นยกเลิกสะสม)
- ขวา: **PreLivNex** เป้า vs Actual (แท่งคู่ฟ้า + เส้นสะสม)

**แถว 3:** ภาพรวมยอดโอนรายเดือน
**แถว 4:** โอนสะสม แยก BUD

### กราฟยอดจอง — Label structure
- MTOP: `position="top"` สี `#94a3b8`
- ทำสัญญา (เขียวเข้ม): ค่าในแท่ง สีขาว `#fff`
- รอทำสัญญา (เขียวอ่อน): `d.รอทำสัญญา` ในแท่ง สี `#065f46`
- Total: `d._total` บนสุด stack สี `#047857`

### เส้นสะสม
- แสดงยาว **12 เดือน** ทุกกราฟ (carry-forward ถ้ายังไม่มีข้อมูล)
- Backlog ทุกกราฟสี `#b45309` (amber dashed)
- LivNexสะสม `#c2410c` / PreLivNexสะสม `#0e7490`

---

## สีที่ใช้ (Color Reference)

| Element | Color |
|---------|-------|
| MTOP bar | `#d1d5db` |
| ทำสัญญา | `#047857` |
| รอทำสัญญา bar / label | `#34d399` / `#065f46` |
| Total label | `#047857` |
| Backlog line | `#b45309` (dashed) |
| LivNex เป้า / actual / สะสม | `#fed7aa` / `#f97316` / `#c2410c` |
| PreLivNex เป้า / actual / สะสม | `#a5f3fc` / `#06b6d4` / `#0e7490` |
| ยกเลิก bar / สะสม | `#dc2626` / `#991b1b` |
| ซื้อLivNex / ซื้อPreLivNex | `#f97316` / `#06b6d4` |

## Data Keys
**salesData:** `month, เป้าBook, เป้าLivNex, เป้าPreLivNex, รอทำสัญญา, ทำสัญญา, LivNex, PreLivNex, LivNexสะสม, PreLivNexสะสม, _total, ขายสะสม, Backlog`

**cancelData:** `month, ยกเลิก, Booking, ซื้อLivNex, ซื้อPreLivNex, ยกเลิกสะสม`

---

## Tracking Dashboard (Heatmap)
- **File:** `chart-data-tracking.ts` — PROCESS_BACKLOG + PROCESS_INPROGRESS + GROUP_COLORS + AGING_BUCKETS
- **Render:** `page.tsx` — heatmap table with collapsible groups/sub-groups
- **Dropdown:** `heatmapMode` สลับ PROCESS_BACKLOG ↔ PROCESS_INPROGRESS, ใช้ `activeData`
- **Table:** `table-layout: fixed` + `<colgroup>` (หมวด 72px, กระบวนการ 180px, SLA/ค้าง 36px, aging = auto)
- **collapsedGroups state:** Set<string> — ใช้ทั้ง group name + subGroup name เป็น key
- **Default collapse:** ทุกกลุ่มเปิดอันแรก ปิดที่เหลือ (logic: seenGroup + seenSg)
- **Default heatmapCell:** cell ซ้ายบน (process แรก, aging bucket แรกที่ > 0)
- **renderGroupHeader():** shared fn สำหรับทั้ง group header และ sub-group header
- **Unified rendering:** รองรับ mixed groups (group ที่มีทั้ง process ไม่มี subGroup + process มี subGroup)
- **Sub-header สี:** ใช้ GROUP_COLORS[p.group] dynamically + opacity hex suffix
- **Process จอง ถูกเอาออก** จาก PROCESS_BACKLOG แล้ว
- **Groups (ลำดับ):** เอกสาร → LivNex → สินเชื่อ → CS Inspect → CON Inspect → โอน
- **GROUP_COLORS:** เอกสาร #6366f1, LivNex #f97316, สินเชื่อ #f59e0b, CS Inspect #0891b2, CON Inspect #7c3aed, โอน #10b981

---

## Files
- `TransferCharts.tsx` — chart component หลัก
- `chart-data.ts` — mock data ทุกกราฟ
- `chart-data-tracking.ts` — tracking dashboard heatmap data
- `BookingDetailPanel.tsx` — detail panel (V1 approved)
- `page.tsx` — imports BookingDetailPanel + TransferCharts + Tracking heatmap
- `bookings.ts`, `masters.ts` — booking/master data
