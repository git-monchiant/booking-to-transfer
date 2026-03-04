// ===============================================
// GRAPH MOCKUP DATA — ข้อมูลกราฟสำหรับ Dashboard
// แยกจาก TransferCharts.tsx เพื่อให้จัดการง่าย
// ===============================================

// ─────────────────────────────────────────────
// ภาพรวมยอดขายรายเดือน (Monthly Sales Overview)
// ─────────────────────────────────────────────
// Backlog คำนวณจากสูตร: Backlog(n) = Backlog(n-1) + Book(n) - โอนจริง(n)
// ไม่ hardcode — คำนวณใน TransferCharts.tsx
export const BACKLOG_INITIAL = 2800; // ยอดค้างสะสมจากปีก่อน (unit) — สะสมมาจากปีก่อนๆ

// MTOP Presale ≈ 13,909 MB ÷ 4.0 = 3,477 unit/ปี
// MTOP LivNex ≈ 2,851 MB — ข้อมูลจำลอง max ~20 unit/เดือน
export const MONTHLY_SALES_DATA = [
  { month: 'ม.ค.',  เป้าBook: 262, เป้าLivNex: 10, เป้าPreLivNex: 5,  Book: 210, Contract: 184, LivNex: 8,  LivNexใหม่: 6,  LivNexจากยกเลิก: 2,  PreLivNex: 3,  PreLivNexใหม่: 2,  PreLivNexจากยกเลิก: 1 },
  { month: 'ก.พ.',  เป้าBook: 295, เป้าLivNex: 14, เป้าPreLivNex: 6,  Book: 289, Contract: 249, LivNex: 12, LivNexใหม่: 9,  LivNexจากยกเลิก: 3,  PreLivNex: 5,  PreLivNexใหม่: 4,  PreLivNexจากยกเลิก: 1 },
  { month: 'มี.ค.', เป้าBook: 361, เป้าLivNex: 20, เป้าPreLivNex: 10, Book: 381, Contract: 315, LivNex: 18, LivNexใหม่: 13, LivNexจากยกเลิก: 5,  PreLivNex: 8,  PreLivNexใหม่: 6,  PreLivNexจากยกเลิก: 2 },
  { month: 'เม.ย.', เป้าBook: 197, เป้าLivNex: 8,  เป้าPreLivNex: 5,  Book: 144, Contract: 118, LivNex: 5,  LivNexใหม่: 4,  LivNexจากยกเลิก: 1,  PreLivNex: 3,  PreLivNexใหม่: 2,  PreLivNexจากยกเลิก: 1 },
  { month: 'พ.ค.',  เป้าBook: 262, เป้าLivNex: 12, เป้าPreLivNex: 7,  Book: 249, Contract: 210, LivNex: 10, LivNexใหม่: 7,  LivNexจากยกเลิก: 3,  PreLivNex: 5,  PreLivNexใหม่: 4,  PreLivNexจากยกเลิก: 1 },
  { month: 'มิ.ย.', เป้าBook: 328, เป้าLivNex: 18, เป้าPreLivNex: 11, Book: 341, Contract: 295, LivNex: 16, LivNexใหม่: 11, LivNexจากยกเลิก: 5,  PreLivNex: 10, PreLivNexใหม่: 7,  PreLivNexจากยกเลิก: 3 },
  { month: 'ก.ค.',  เป้าBook: 262, เป้าLivNex: 14, เป้าPreLivNex: 8,  Book: 230, Contract: 197, LivNex: 13, LivNexใหม่: 10, LivNexจากยกเลิก: 3,  PreLivNex: 7,  PreLivNexใหม่: 5,  PreLivNexจากยกเลิก: 2 },
  { month: 'ส.ค.',  เป้าBook: 295, เป้าLivNex: 10, เป้าPreLivNex: 6,  Book: 276, Contract: 236, LivNex: 9,  LivNexใหม่: 7,  LivNexจากยกเลิก: 2,  PreLivNex: 5,  PreLivNexใหม่: 4,  PreLivNexจากยกเลิก: 1 },
  { month: 'ก.ย.',  เป้าBook: 328, เป้าLivNex: 15, เป้าPreLivNex: 8,  Book: 0,   Contract: 0,   LivNex: 0,  LivNexใหม่: 0,  LivNexจากยกเลิก: 0,  PreLivNex: 0,  PreLivNexใหม่: 0,  PreLivNexจากยกเลิก: 0 },
  { month: 'ต.ค.',  เป้าBook: 328, เป้าLivNex: 15, เป้าPreLivNex: 8,  Book: 0,   Contract: 0,   LivNex: 0,  LivNexใหม่: 0,  LivNexจากยกเลิก: 0,  PreLivNex: 0,  PreLivNexใหม่: 0,  PreLivNexจากยกเลิก: 0 },
  { month: 'พ.ย.',  เป้าBook: 328, เป้าLivNex: 15, เป้าPreLivNex: 8,  Book: 0,   Contract: 0,   LivNex: 0,  LivNexใหม่: 0,  LivNexจากยกเลิก: 0,  PreLivNex: 0,  PreLivNexใหม่: 0,  PreLivNexจากยกเลิก: 0 },
  { month: 'ธ.ค.',  เป้าBook: 231, เป้าLivNex: 10, เป้าPreLivNex: 5,  Book: 0,   Contract: 0,   LivNex: 0,  LivNexใหม่: 0,  LivNexจากยกเลิก: 0,  PreLivNex: 0,  PreLivNexใหม่: 0,  PreLivNexจากยกเลิก: 0 },
];

// ─────────────────────────────────────────────
// ภาพรวมยอดโอนรายเดือน (Monthly Transfer Overview)
// ─────────────────────────────────────────────
export const AVG_UNIT_VALUE = 4.0; // ราคาขายสุทธิเฉลี่ยต่อ unit (ล้านบาท) — บ้าน 2-6 ล้าน
export const AVG_BASE_VALUE = 3.5; // ราคาเบสเฉลี่ยต่อ unit (ล้านบาท)
export const AVG_CONTRACT_VALUE = 4.5; // ราคาหน้าสัญญาเฉลี่ยต่อ unit (ล้านบาท)

// MTOP Transfer ≈ 9,305 MB ÷ 4.0 = 2,326 unit/ปี
// Backlog movement ตามยอดจอง: จองสูง→backlog↑, จองต่ำ+โอนเยอะ→backlog↓
// 2800→2830→2879→2960(peak)→2824→2813→2864→2784→2720
export const MONTHLY_TRANSFER_DATA = [
  { month: 'ม.ค.',  MTOP: 155, แผนโอน: 150, Upside: 10,  โอนจากBacklog: 126, โอนจากขายในเดือน: 54,  LivNex: 8,  PreLivNex: 3 },
  { month: 'ก.พ.',  MTOP: 177, แผนโอน: 200, Upside: 15,  โอนจากBacklog: 168, โอนจากขายในเดือน: 72,  LivNex: 12, PreLivNex: 5 },
  { month: 'มี.ค.', MTOP: 222, แผนโอน: 250, Upside: 30,  โอนจากBacklog: 210, โอนจากขายในเดือน: 90,  LivNex: 18, PreLivNex: 8 },
  { month: 'เม.ย.', MTOP: 155, แผนโอน: 220, Upside: 25,  โอนจากBacklog: 196, โอนจากขายในเดือน: 84,  LivNex: 5,  PreLivNex: 3 },
  { month: 'พ.ค.',  MTOP: 177, แผนโอน: 210, Upside: 20,  โอนจากBacklog: 182, โอนจากขายในเดือน: 78,  LivNex: 10, PreLivNex: 5 },
  { month: 'มิ.ย.', MTOP: 222, แผนโอน: 240, Upside: 25,  โอนจากBacklog: 203, โอนจากขายในเดือน: 87,  LivNex: 16, PreLivNex: 10 },
  { month: 'ก.ค.',  MTOP: 199, แผนโอน: 260, Upside: 20,  โอนจากBacklog: 217, โอนจากขายในเดือน: 93,  LivNex: 13, PreLivNex: 7 },
  { month: 'ส.ค.',  MTOP: 199, แผนโอน: 280, Upside: 30,  โอนจากBacklog: 238, โอนจากขายในเดือน: 102, LivNex: 9,  PreLivNex: 5 },
  { month: 'ก.ย.',  MTOP: 222, แผนโอน: 260, Upside: 50,  โอนจากBacklog: 0,   โอนจากขายในเดือน: 0,   LivNex: 0,  PreLivNex: 0 },
  { month: 'ต.ค.',  MTOP: 222, แผนโอน: 250, Upside: 0,   โอนจากBacklog: 0,   โอนจากขายในเดือน: 0,   LivNex: 0,  PreLivNex: 0 },
  { month: 'พ.ย.',  MTOP: 222, แผนโอน: 260, Upside: 40,  โอนจากBacklog: 0,   โอนจากขายในเดือน: 0,   LivNex: 0,  PreLivNex: 0 },
  { month: 'ธ.ค.',  MTOP: 154, แผนโอน: 185, Upside: 25,  โอนจากBacklog: 0,   โอนจากขายในเดือน: 0,   LivNex: 0,  PreLivNex: 0 },
];

// ─────────────────────────────────────────────
// ภาพรวมยอดยกเลิกรายเดือน (Monthly Cancellation)
// ─────────────────────────────────────────────
export const AVG_CANCEL_VALUE = 4.8; // ราคาเฉลี่ยต่อ unit ยกเลิก (ล้านบาท)
export const MONTHLY_CANCEL_DATA = [
  { month: 'ม.ค.',  ยกเลิกใบจอง: 90,  ยกเลิกหลังสัญญา: 60,  ซื้อLivNex: 8,  ซื้อPreLivNex: 10 },
  { month: 'ก.พ.',  ยกเลิกใบจอง: 118, ยกเลิกหลังสัญญา: 80,  ซื้อLivNex: 12, ซื้อPreLivNex: 16 },
  { month: 'มี.ค.', ยกเลิกใบจอง: 150, ยกเลิกหลังสัญญา: 100, ซื้อLivNex: 18, ซื้อPreLivNex: 26 },
  { month: 'เม.ย.', ยกเลิกใบจอง: 132, ยกเลิกหลังสัญญา: 88,  ซื้อLivNex: 10, ซื้อPreLivNex: 15 },
  { month: 'พ.ค.',  ยกเลิกใบจอง: 126, ยกเลิกหลังสัญญา: 84,  ซื้อLivNex: 14, ซื้อPreLivNex: 20 },
  { month: 'มิ.ย.', ยกเลิกใบจอง: 144, ยกเลิกหลังสัญญา: 96,  ซื้อLivNex: 16, ซื้อPreLivNex: 28 },
  { month: 'ก.ค.',  ยกเลิกใบจอง: 159, ยกเลิกหลังสัญญา: 106, ซื้อLivNex: 13, ซื้อPreLivNex: 22 },
  { month: 'ส.ค.',  ยกเลิกใบจอง: 171, ยกเลิกหลังสัญญา: 114, ซื้อLivNex: 15, ซื้อPreLivNex: 25 },
  { month: 'ก.ย.',  ยกเลิกใบจอง: 0,   ยกเลิกหลังสัญญา: 0,   ซื้อLivNex: 0,  ซื้อPreLivNex: 0 },
  { month: 'ต.ค.',  ยกเลิกใบจอง: 0,   ยกเลิกหลังสัญญา: 0,   ซื้อLivNex: 0,  ซื้อPreLivNex: 0 },
  { month: 'พ.ย.',  ยกเลิกใบจอง: 0,   ยกเลิกหลังสัญญา: 0,   ซื้อLivNex: 0,  ซื้อPreLivNex: 0 },
  { month: 'ธ.ค.',  ยกเลิกใบจอง: 0,   ยกเลิกหลังสัญญา: 0,   ซื้อLivNex: 0,  ซื้อPreLivNex: 0 },
];

// ─────────────────────────────────────────────
// เหตุผลยกเลิก แยก 3 กลุ่ม (Cancel Reason Drill-Down)
// ─────────────────────────────────────────────
export interface CancelReason { reason: string; count: number }
export interface CancelReasonGroup {
  group: 'Normal Sale' | 'LivNex' | 'Pre-LivNex';
  color: string;
  reasons: CancelReason[];
}

const NS_REASONS: CancelReason[] = [
  { reason: 'กู้ไม่ผ่าน - ปัญหาแหล่งที่มารายได้', count: 0 },
  { reason: 'กู้ไม่ผ่าน - ปัญหาประวัติบูโร', count: 0 },
  { reason: 'กู้ไม่ผ่าน - ปัญหา DSR', count: 0 },
  { reason: 'ติดปัญหา LTV - ไม่มีเงินจ่ายส่วนต่าง', count: 0 },
  { reason: 'ได้เงินกู้น้อยกว่าที่ต้องจ่าย', count: 0 },
  { reason: 'กังวล - รายได้/งานไม่มั่นคง', count: 0 },
  { reason: 'กังวล - ภาระเพิ่มหนี้ที่เพิ่ม', count: 0 },
  { reason: 'กังวล - ไม่มั่นใจว่าจะอยู่ที่นี่ต่อถึงไปไหม', count: 0 },
  { reason: 'กังวล - ปัญหาภายในครอบครัว', count: 0 },
  { reason: 'ยุบห้อง', count: 0 },
  { reason: 'ย้ายแปลง/ย้ายโครงการ', count: 0 },
  { reason: 'ค้างส่งเอกสาร (เกิน3รอบ)', count: 0 },
  { reason: 'เหตุผลด้านการลงทุน', count: 0 },
  { reason: 'ปัญหาโครงการ - Location สู้คู่แข่งไม่ได้', count: 0 },
  { reason: 'ปัญหาโครงการ - คุณภาพโครงการ สู้คู่แข่งไม่ได้', count: 0 },
  { reason: 'ปัญหาโครงการ - ราคา/promotion สู้คู่แข่งไม่ได้', count: 0 },
  { reason: 'ปัญหาโครงการ - Design สู้คู่แข่งไม่ได้', count: 0 },
  { reason: 'ปัญหาโครงการ - สภาพแวดล้อม', count: 0 },
  { reason: 'ปัญหาการบริการ - ขาย - ล่าช้า/ไม่ติดตามเคส', count: 0 },
  { reason: 'ปัญหาการบริการ - ขาย - บอกข้อมูลไม่ตรง/ไม่ครบ', count: 0 },
  { reason: 'ปัญหาการบริการ - ขาย - ไม่สุภาพ/ไม่มี service mind', count: 0 },
  { reason: 'ปัญหาการบริการ - สินเชื่อ - ล่าช้า/ไม่ติดตามเคส', count: 0 },
  { reason: 'ปัญหาการบริการ - สินเชื่อ - บอกข้อมูลไม่ตรง/ไม่ครบ', count: 0 },
  { reason: 'ปัญหาการบริการ - สินเชื่อ - ไม่สุภาพ/ไม่มี service mind', count: 0 },
  { reason: 'ปัญหาการบริการ - ตรวจห้อง - ล่าช้า/แก้ไขไม่ครบ', count: 0 },
  { reason: 'ปัญหาการบริการ - ตรวจห้อง - คุณภาพงานไม่ได้ตามที่คาดหวัง', count: 0 },
  { reason: 'ปัญหาการบริการ - ตรวจห้อง - ไม่สุภาพ/ไม่มี service mind', count: 0 },
  { reason: 'ติดต่อไม่ได้ - ไม่ให้ความร่วมมือ', count: 0 },
  { reason: 'บันทึกรายการผิด', count: 0 },
  { reason: 'ย้ายไปทำสัญญา LivNex', count: 0 },
  { reason: 'Agent ยกเลิก-ยุบห้อง', count: 0 },
  { reason: 'Agent ยกเลิกผิดสัญญา', count: 0 },
];

const LN_REASONS: CancelReason[] = [
  { reason: 'JD ไม่อนุมัติ - ปัญหาแหล่งที่มารายได้', count: 0 },
  { reason: 'JD ไม่อนุมัติ - ปัญหาประวัติบูโร', count: 0 },
  { reason: 'JD ไม่อนุมัติ - ปัญหา DSR', count: 0 },
  { reason: 'JD ไม่อนุมัติ - ติดปัญหา LTV ไม่มีเงินจ่ายส่วนต่าง', count: 0 },
  { reason: 'JD ไม่อนุมัติ - มีบัญชีสินเชื่อบ้านแล้ว 2 บัญชีขึ้นไป', count: 0 },
  { reason: 'กังวล - ไม่สามารถทำค่าเช่าตามค่าเฉลี่ยของ JD ได้', count: 0 },
  { reason: 'กังวล - อะไรไม่ได้จริง แม้ค่าเช่าตามที่ JD แนะนำ', count: 0 },
  { reason: 'กังวล - รายได้/งานไม่มั่นคง', count: 0 },
  { reason: 'กังวล - ภาระเพิ่มหนี้ที่เพิ่ม/จ่ายไม่ไหว', count: 0 },
  { reason: 'กังวล - ปัญหาภายในครอบครัว/ผู้ร่วม', count: 0 },
  { reason: 'กังวล - คิดว่าตัวเองยังไม่พร้อม/รอพร้อมจะซื้อเอง', count: 0 },
  { reason: 'กังวล - ย้ายที่ทำงานไปจังหวัดอื่น/ต่างจังหวัด', count: 0 },
  { reason: 'ย้ายแปลง/ย้ายโครงการ/ยุบห้อง', count: 0 },
  { reason: 'เป้าหมายส่วนตัว - ต้องการสิทธิเป็นเจ้าของพื้นที่', count: 0 },
  { reason: 'เป้าหมายส่วนตัว - ไม่มีเงินแรกเข้า', count: 0 },
  { reason: 'เป้าหมายส่วนตัว - ต้องการซื้อเพื่อปล่อยเช่า', count: 0 },
  { reason: 'ติดต่อไม่ได้ - ไม่ให้ความร่วมมือ', count: 0 },
  { reason: 'ปัญหาโครงการ - Location สู้คู่แข่งไม่ได้', count: 0 },
  { reason: 'ปัญหาโครงการ - คุณภาพโครงการ สู้คู่แข่งไม่ได้', count: 0 },
  { reason: 'ปัญหาโครงการ - ราคา/promotion สู้คู่แข่งไม่ได้', count: 0 },
  { reason: 'ปัญหาโครงการ - Design สู้คู่แข่งไม่ได้', count: 0 },
  { reason: 'ข้อกำหนด LivNex - จับข้อเท้าโยกย้าย/กลัวโดนหลอก', count: 0 },
  { reason: 'ข้อกำหนด LivNex - ห้ามแต่งห้องต่อเติมเพิ่มเติม', count: 0 },
  { reason: 'ข้อกำหนด LivNex - การเปิดบ้านสินค้า Smartify', count: 0 },
  { reason: 'ข้อกำหนด LivNex - การตรวจห้องบ่อยเกินไป', count: 0 },
  { reason: 'ข้อกำหนด LivNex - ห้ามเช่าช่วง', count: 0 },
  { reason: 'ข้อกำหนด LivNex - ดอกเบี้ย/ค่าบริการ JD สูงเกินไป', count: 0 },
  { reason: 'ข้อกำหนด LivNex - ค่าช่วงต่อเดือนสูงเกินไป', count: 0 },
  { reason: 'ปัญหาการบริการ - ขาย - ล่าช้า/ไม่ติดตามเคส', count: 0 },
  { reason: 'ปัญหาการบริการ - ขาย - บอกข้อมูลไม่ตรง/ไม่ครบ', count: 0 },
  { reason: 'ปัญหาการบริการ - ขาย - ไม่สุภาพ/ไม่มี service mind', count: 0 },
  { reason: 'ผลธนาคารอนุมัติ', count: 0 },
];

const PL_REASONS: CancelReason[] = [
  { reason: 'ข้อกำหนด RentNex - ค่าเช่าแพงเกินไป', count: 0 },
  { reason: 'ข้อกำหนด RentNex - ห้องไม่มีความสะดวกเพียงพอ', count: 0 },
  { reason: 'ข้อกำหนด RentNex - ห้องเล็กเกินไป', count: 0 },
  { reason: 'ข้อกำหนด RentNex - มีบ้านอยู่แล้ว ต้องการซื้อเท่านั้น', count: 0 },
  { reason: 'อยากได้เงินส่วนต่าง', count: 0 },
  { reason: 'ได้ค่า Pre-LivNex คืน', count: 0 },
  { reason: 'กังวล - ปัญหาภายในครอบครัว/ผู้ร่วม', count: 0 },
  { reason: 'กังวล - ย้ายที่ทำงานไปจังหวัดอื่น/ต่างจังหวัด', count: 0 },
  { reason: 'ติดต่อไม่ได้ - ไม่ให้ความร่วมมือ', count: 0 },
  { reason: 'โครงการไม่มี Pre-LivNex', count: 0 },
  { reason: 'ติดเรื่อง Location ห้อง', count: 0 },
];

// helper: กระจาย count ลง reasons แบบ deterministic (ใช้ seed)
function spreadCount(reasons: CancelReason[], total: number, seed: number): CancelReason[] {
  if (total <= 0) return reasons.map(r => ({ ...r, count: 0 }));
  const out = reasons.map(r => ({ ...r, count: 0 }));
  let s = seed;
  for (let i = 0; i < total; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    out[s % out.length].count++;
  }
  return out;
}

// fixed mock: กระจายยกเลิกแต่ละเดือนลง 3 กลุ่ม — ใช้ตัวเลขจาก MONTHLY_CANCEL_DATA ตรงๆ
function buildCancelReasons(ns: number, ln: number, pl: number, monthIdx: number): CancelReasonGroup[] {
  if (ns + ln + pl <= 0) return [];
  return [
    { group: 'Normal Sale', color: '#dc2626', reasons: spreadCount(NS_REASONS, ns, monthIdx * 100 + 1) },
    { group: 'LivNex', color: '#f97316', reasons: spreadCount(LN_REASONS, ln, monthIdx * 100 + 2) },
    { group: 'Pre-LivNex', color: '#3b82f6', reasons: spreadCount(PL_REASONS, pl, monthIdx * 100 + 3) },
  ];
}

// สร้าง deterministic mock data — NS=ยกเลิกรวม, LN=ซื้อLivNex, PL=ซื้อPreLivNex (ตรงกับแท่งกราฟ)
export const CANCEL_REASON_DATA: Record<string, CancelReasonGroup[]> = Object.fromEntries(
  MONTHLY_CANCEL_DATA.map((d, i) => [
    d.month,
    buildCancelReasons(d.ยกเลิกใบจอง + d.ยกเลิกหลังสัญญา, d.ซื้อLivNex, d.ซื้อPreLivNex, i),
  ])
);

// ─────────────────────────────────────────────
// ยอดจอง แยก BUD (Monthly Booking per BUD)
// ─────────────────────────────────────────────
// กระจายจาก MONTHLY_SALES_DATA ตามสัดส่วน BUD
// ผลรวมรายเดือนใกล้เคียงกับ Book / Contract ของ MONTHLY_SALES_DATA
export const BUD_BOOK: Record<string, number[]> = {
  'Condo 1':   [57, 78, 103, 39, 67, 92, 62, 75, 0, 0, 0, 0],
  'Condo 2':   [42, 58, 76,  29, 50, 68, 46, 55, 0, 0, 0, 0],
  'Condo 3':   [32, 43, 57,  22, 37, 51, 35, 41, 0, 0, 0, 0],
  'Condo 4':   [15, 20, 27,  10, 17, 24, 16, 19, 0, 0, 0, 0],
  'Housing 1': [44, 60, 80,  30, 53, 72, 48, 58, 0, 0, 0, 0],
  'Housing 2': [20, 30, 38,  14, 25, 34, 23, 28, 0, 0, 0, 0],
};

export const BUD_CONTRACT: Record<string, number[]> = {
  'Condo 1':   [50, 68, 90, 34, 59, 80, 54, 65, 0, 0, 0, 0],
  'Condo 2':   [36, 50, 65, 25, 43, 59, 40, 47, 0, 0, 0, 0],
  'Condo 3':   [27, 37, 49, 19, 32, 44, 30, 35, 0, 0, 0, 0],
  'Condo 4':   [13, 17, 23,  9, 15, 21, 14, 16, 0, 0, 0, 0],
  'Housing 1': [38, 52, 70, 26, 46, 63, 42, 50, 0, 0, 0, 0],
  'Housing 2': [17, 25, 33, 12, 21, 29, 19, 23, 0, 0, 0, 0],
};

export const BUD_BOOK_TARGET: Record<string, number[]> = {
  'Condo 1':   [71, 80, 97,  53, 71, 89, 71, 80, 89, 89, 89, 63],
  'Condo 2':   [52, 59, 72,  39, 52, 66, 52, 59, 66, 66, 66, 46],
  'Condo 3':   [39, 44, 54,  30, 39, 49, 39, 44, 49, 49, 49, 35],
  'Condo 4':   [18, 21, 25,  14, 18, 23, 18, 21, 23, 23, 23, 16],
  'Housing 1': [58, 65, 79,  43, 58, 72, 58, 65, 72, 72, 72, 51],
  'Housing 2': [24, 26, 34,  18, 24, 29, 24, 26, 29, 29, 29, 20],
};

// ─────────────────────────────────────────────
// BUD (Business Unit Director) — กราฟแยกตาม BUD
// ─────────────────────────────────────────────
export const BUD_NAMES = ['Condo 1', 'Condo 2', 'Condo 3', 'Condo 4', 'Housing 1', 'Housing 2'];

export const BUD_COLORS: Record<string, string> = {
  'Condo 1': '#6366f1', 'Condo 2': '#818cf8', 'Condo 3': '#a5b4fc', 'Condo 4': '#c7d2fe',
  'Housing 1': '#10b981', 'Housing 2': '#6ee7b7',
};

// ราคาขายสุทธิเฉลี่ยต่อ unit (ล้านบาท) per BUD — บ้าน 2-6 ล้าน
export const BUD_AVG_VALUE: Record<string, number> = {
  'Condo 1': 2.5, 'Condo 2': 2.2, 'Condo 3': 3.5, 'Condo 4': 4.2,
  'Housing 1': 4.8, 'Housing 2': 5.5,
};

// ราคาหน้าสัญญาเฉลี่ยต่อ unit (ล้านบาท) per BUD
export const BUD_AVG_CONTRACT: Record<string, number> = {
  'Condo 1': 2.8, 'Condo 2': 2.5, 'Condo 3': 3.9, 'Condo 4': 4.6,
  'Housing 1': 5.2, 'Housing 2': 6.0,
};

// ยอดโอนจาก Backlog per BUD per month (×2 scale)
export const BUD_FROM_BACKLOG: Record<string, number[]> = {
  'Condo 1':   [18, 20, 34, 14, 18, 30, 22, 20, 0, 0, 0, 0],
  'Condo 2':   [12, 14, 22, 10, 12, 18, 14, 14, 0, 0, 0, 0],
  'Condo 3':   [10, 10, 14, 6,  8,  14, 10, 10, 0, 0, 0, 0],
  'Condo 4':   [4,  6,  6,  2,  4,  6,  4,  4,  0, 0, 0, 0],
  'Housing 1': [18, 20, 30, 16, 18, 26, 22, 20, 0, 0, 0, 0],
  'Housing 2': [8,  10, 14, 6,  6,  10, 8,  6,  0, 0, 0, 0],
};

// ยอดโอนจากขายในเดือน per BUD per month (×2 scale)
export const BUD_FROM_NEW_SALE: Record<string, number[]> = {
  'Condo 1':   [10, 12, 16, 6,  8,  14, 10, 10, 0, 0, 0, 0],
  'Condo 2':   [6,  8,  12, 6,  6,  10, 8,  6,  0, 0, 0, 0],
  'Condo 3':   [4,  6,  8,  4,  4,  6,  4,  4,  0, 0, 0, 0],
  'Condo 4':   [2,  2,  4,  2,  2,  2,  2,  2,  0, 0, 0, 0],
  'Housing 1': [8,  10, 14, 8,  10, 14, 10, 10, 0, 0, 0, 0],
  'Housing 2': [4,  4,  6,  2,  4,  6,  4,  4,  0, 0, 0, 0],
};

// ยอดโอนจริงรวม per BUD per month (= Backlog + ขายในเดือน)
export const BUD_ACTUAL: Record<string, number[]> = {
  'Condo 1':   [28, 32, 50, 20, 26, 44, 32, 30, 0, 0, 0, 0],
  'Condo 2':   [18, 22, 34, 16, 18, 28, 22, 20, 0, 0, 0, 0],
  'Condo 3':   [14, 16, 22, 10, 12, 20, 14, 14, 0, 0, 0, 0],
  'Condo 4':   [6,  8,  10, 4,  6,  8,  6,  6,  0, 0, 0, 0],
  'Housing 1': [26, 30, 44, 24, 28, 40, 32, 30, 0, 0, 0, 0],
  'Housing 2': [12, 14, 20, 8,  10, 16, 12, 10, 0, 0, 0, 0],
};

// แผนโอน per BUD per month (×2 scale)
export const BUD_PLAN: Record<string, number[]> = {
  'Condo 1':   [26, 30, 48, 22, 28, 46, 34, 32, 36, 36, 36, 28],
  'Condo 2':   [20, 26, 40, 20, 24, 36, 28, 26, 32, 32, 32, 22],
  'Condo 3':   [20, 24, 36, 18, 22, 32, 26, 24, 28, 28, 28, 18],
  'Condo 4':   [16, 20, 32, 16, 20, 28, 22, 20, 24, 24, 24, 18],
  'Housing 1': [28, 34, 48, 26, 30, 42, 34, 34, 38, 38, 38, 28],
  'Housing 2': [24, 28, 44, 24, 28, 36, 32, 32, 32, 32, 32, 24],
};

// Upside per BUD per month (×2 scale)
export const BUD_UPSIDE: Record<string, number[]> = {
  'Condo 1':   [4, 6, 8, 2, 2, 4, 2, 4, 4, 4, 4, 2],
  'Condo 2':   [4, 4, 4, 4, 4, 4, 2, 4, 4, 4, 4, 2],
  'Condo 3':   [4, 4, 4, 2, 2, 4, 2, 4, 4, 4, 4, 2],
  'Condo 4':   [4, 4, 4, 4, 4, 4, 2, 4, 4, 4, 4, 2],
  'Housing 1': [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  'Housing 2': [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
};

// Backlog per BUD per month (×6.15 scale — match BACKLOG_INITIAL 2800)
export const BUD_BACKLOG: Record<string, number[]> = {
  'Condo 1':   [738, 726, 664, 689, 701, 646, 628, 615, 677, 738, 800, 831],
  'Condo 2':   [523, 504, 455, 480, 492, 455, 443, 431, 480, 529, 578, 603],
  'Condo 3':   [369, 357, 320, 338, 345, 320, 308, 295, 332, 369, 406, 431],
  'Condo 4':   [246, 234, 222, 234, 240, 234, 228, 222, 246, 271, 295, 308],
  'Housing 1': [585, 554, 480, 492, 492, 443, 418, 400, 455, 505, 554, 585],
  'Housing 2': [338, 320, 295, 308, 314, 295, 283, 277, 308, 345, 382, 406],
};

// LivNex per BUD per month (max ~20 unit/เดือน)
export const BUD_LIVNEX: Record<string, number[]> = {
  'Condo 1':   [3, 4, 6, 2, 4, 6, 5, 3, 0, 0, 0, 0],
  'Condo 2':   [2, 2, 4, 1, 2, 3, 3, 2, 0, 0, 0, 0],
  'Condo 3':   [1, 1, 3, 1, 1, 2, 2, 1, 0, 0, 0, 0],
  'Condo 4':   [0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  'Housing 1': [2, 4, 4, 1, 2, 4, 2, 2, 0, 0, 0, 0],
  'Housing 2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

// Pre-LivNex per BUD per month (max ~10 unit/เดือน)
export const BUD_PRE_LIVNEX: Record<string, number[]> = {
  'Condo 1':   [1, 2, 3, 1, 2, 4, 3, 2, 0, 0, 0, 0],
  'Condo 2':   [1, 1, 2, 1, 1, 2, 1, 1, 0, 0, 0, 0],
  'Condo 3':   [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  'Condo 4':   [0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  'Housing 1': [1, 1, 1, 0, 0, 2, 1, 1, 0, 0, 0, 0],
  'Housing 2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

// MTOP Target per BUD per month (×2 scale)
export const BUD_TARGET: Record<string, number[]> = {
  'Condo 1':   [30, 36, 56, 24, 30, 50, 36, 36, 40, 40, 40, 30],
  'Condo 2':   [24, 30, 44, 24, 28, 40, 30, 30, 36, 36, 36, 24],
  'Condo 3':   [24, 28, 40, 20, 24, 36, 28, 28, 32, 32, 32, 20],
  'Condo 4':   [20, 24, 36, 20, 24, 32, 24, 24, 28, 28, 28, 20],
  'Housing 1': [30, 36, 50, 28, 32, 44, 36, 36, 40, 40, 40, 30],
  'Housing 2': [28, 32, 48, 28, 32, 40, 36, 36, 36, 36, 36, 28],
};
