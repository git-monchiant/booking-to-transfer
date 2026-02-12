// ===============================================
// MASTER DATA — Reference / Lookup Tables
// แยกจาก Transaction เพื่อนำไปสร้าง DB ได้เลย
// ===============================================

// ─────────────────────────────────────────────
// STAGES (Pipeline)
// ─────────────────────────────────────────────
export const STAGES = {
  BOOKING: 'booking',
  CONTRACT: 'contract',
  CREDIT: 'credit',
  INSPECTION: 'inspection',
  READY: 'ready',
  TRANSFERRED: 'transferred',
  CANCELLED: 'cancelled',
} as const;

export type Stage = typeof STAGES[keyof typeof STAGES];

export const STAGE_CONFIG: Record<Stage, { label: string; color: string; bg: string }> = {
  booking: { label: 'Booking', color: '#6366f1', bg: '#eef2ff' },
  contract: { label: 'Contract', color: '#8b5cf6', bg: '#f5f3ff' },
  credit: { label: 'Credit', color: '#f59e0b', bg: '#fffbeb' },
  inspection: { label: 'Inspection', color: '#06b6d4', bg: '#ecfeff' },
  ready: { label: 'Ready', color: '#22c55e', bg: '#f0fdf4' },
  transferred: { label: 'Transferred', color: '#10b981', bg: '#ecfdf5' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
};

// ─────────────────────────────────────────────
// TEAMS (ทีมงาน)
// ─────────────────────────────────────────────
export const TEAMS = ['Sale', 'CO', 'CS', 'Construction', 'Legal', 'Finance'] as const;
export type Team = typeof TEAMS[number];

export const TEAM_CONFIG: Record<Team, { label: string; color: string }> = {
  Sale: { label: 'ฝ่ายขาย', color: '#3b82f6' },
  CO: { label: 'CO', color: '#8b5cf6' },
  CS: { label: 'CS', color: '#10b981' },
  Construction: { label: 'ก่อสร้าง', color: '#f59e0b' },
  Legal: { label: 'นิติกรรม', color: '#ef4444' },
  Finance: { label: 'การเงิน', color: '#06b6d4' },
};

// ─────────────────────────────────────────────
// GRADES & KPI
// ─────────────────────────────────────────────
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type KPIResult = 'PASS' | 'FAIL' | 'N/A';

// ─────────────────────────────────────────────
// BANKS (ธนาคาร)
// ─────────────────────────────────────────────
export const BANKS_LIST = [
  'GHB',        // ธอส.
  'GSB',        // ออมสิน
  'SCB',        // ไทยพาณิชย์
  'KBANK',      // กสิกร
  'KTB',        // กรุงไทย
  'TTB',        // ทีทีบี
  'BAY',        // กรุงศรี
  'LH',         // แลนด์แอนด์เฮ้าส์
  'BBL',        // กรุงเทพ
  'UOB',        // ยูโอบี
  'CIMB',       // ซีไอเอ็มบี
  'KKP',        // เกียรตินาคินภัทร
  'iBank',      // ไอแบงก์
  'TISCO',      // ทิสโก้
  'สหกรณ์',     // สหกรณ์
  'CASH',       // เงินสด
  'JD',         // Jaidee (JD)
] as const;

export type BankCode = typeof BANKS_LIST[number];

// Bank UI — สีและชื่อแสดงผล
export const BANK_COLORS: Record<string, string> = {
  KBANK: 'bg-green-600',
  SCB: 'bg-violet-700',
  KTB: 'bg-sky-600',
  BBL: 'bg-blue-800',
  BAY: 'bg-yellow-500',
  GHB: 'bg-orange-500',
  GSB: 'bg-pink-500',
  TTB: 'bg-orange-400',
  LH: 'bg-lime-600',
  UOB: 'bg-blue-600',
  CIMB: 'bg-red-600',
  KKP: 'bg-teal-600',
  iBank: 'bg-emerald-600',
  TISCO: 'bg-cyan-700',
  CASH: 'bg-slate-600',
  'สหกรณ์': 'bg-stone-500',
  JD: 'bg-green-500',
  Proptiane: 'bg-green-500',
};

export function bankDisplayName(code: string): string {
  return code === 'JD' ? 'Jaidee(JD)' : code;
}

// Bank submission tracking — per bank (รวม เบื้องต้น + อนุมัติจริง)
export interface BankSubmission {
  bank: BankCode;
  submit_date: string | null;
  // เบื้องต้น (Pre-approve)
  preapprove_date: string | null;
  preapprove_result: string | null;
  preapprove_flag: ResultFlag;
  // อนุมัติจริง (Final)
  result: string | null;
  result_date: string | null;
  result_flag: ResultFlag;
  approved_amount: number | null;
  remark: string | null;
}

// ─────────────────────────────────────────────
// ประเภทการขาย (Sale Type)
// ─────────────────────────────────────────────
export const SALE_TYPES = [
  'ขายโอน',
  'LivNex',
  'ผ่อนดาวน์',
] as const;

export type SaleType = typeof SALE_TYPES[number];

// ─────────────────────────────────────────────
// ประเภทขอสินเชื่อ (Credit Request Type)
// ─────────────────────────────────────────────
export const CREDIT_REQUEST_TYPES = [
  'กู้ธนาคาร',
  'โอนสด',
  'สวัสดิการ',
] as const;

export type CreditRequestType = typeof CREDIT_REQUEST_TYPES[number];

// ─────────────────────────────────────────────
// อาชีพลูกค้า (Customer Occupation)
// ─────────────────────────────────────────────
export const CUSTOMER_OCCUPATIONS = [
  'พนักงาน',
  'เจ้าของกิจการ/อาชีพอิสระ',
  'ข้าราชการ',
  'ต่างชาติ',
  'เกษียณ/บำนาญ',
] as const;

export type CustomerOccupation = typeof CUSTOMER_OCCUPATIONS[number];

// ─────────────────────────────────────────────
// ผลบูโร (Bureau Result)
// ─────────────────────────────────────────────
export const BUREAU_RESULTS = [
  'บูโรปกติ - ไม่มีหนี้',
  'บูโรปกติ - มีหนี้',
  'บูโร - ค้างชำระ 60 วัน',
  'บูโร - ค้างชำระ 90 วัน',
  'บูโร - ค้างชำระ 300 วัน',
  'อาณัติ',
] as const;

export type BureauResult = typeof BUREAU_RESULTS[number];

// ─────────────────────────────────────────────
// ผลการอนุมัติ — Bank เบื้องต้น (Pre-approve)
// ─────────────────────────────────────────────
export const BANK_PREAPPROVE_RESULTS = [
  'อนุมัติ - ไม่มีเงื่อนไข',
  'อนุมัติ - มีหนี้',
  'อนุมัติ - ต้องมีผู้กู้ร่วม',
  'อนุมัติ - ต้องรอเวลา',
  'อนุมัติ - ขอเอกสารเพิ่ม',
  'อนุมัติ - รอประเมิน',
  'อนุมัติ - ไม่เต็มจำนวน',
  'อนุมัติ',
  'ไม่อนุมัติ - ขอธนาคารอื่น',
  'ไม่อนุมัติ - ขอยกเลิก',
] as const;

export type BankPreapproveResult = typeof BANK_PREAPPROVE_RESULTS[number];

// ─────────────────────────────────────────────
// ผลการอนุมัติ — Bank จริง (Final)
// ─────────────────────────────────────────────
export const BANK_FINAL_RESULTS = [
  'อนุมัติ - เต็มวงเงิน',
  'อนุมัติ - ไม่เต็มวงเงิน',
  'อนุมัติ - เต็มวงเงิน-รอยืด bank',
  'อนุมัติ - ไม่เต็มวงเงิน-รอยืด bank',
  'อนุมัติ - ต้องซื้อพ่วง',
  'อนุมัติ - ต้องซื้อพ่วง+ดึงเงิน',
  'อนุมัติ - มีประวัติค้างชำระ',
  'ไม่อนุมัติ - DSR เกิน',
  'ไม่อนุมัติ - รายได้ไม่เพียงพอ',
  'ไม่อนุมัติ - รายได้ไม่ใช่รายจ้าง',
  'ไม่อนุมัติ - ขอธนาคารอื่น',
  'ไม่อนุมัติ - ขอยก case',
  'ยกเลิก',
] as const;

export type BankFinalResult = typeof BANK_FINAL_RESULTS[number];

// ─────────────────────────────────────────────
// ผลการอนุมัติ — JD
// ─────────────────────────────────────────────
export const JD_RESULTS = [
  'อนุมัติ - ไม่มีเงื่อนไข',
  'อนุมัติ - แต่ต้องเพิ่มเงินหาร',
  'อนุมัติ - แต่ต้องเพิ่มผู้กู้',
  'อนุมัติ - แต่ทำกู้ร่วม',
  'ไม่อนุมัติ - แต่จ่ายค่างวดได้',
  'ไม่อนุมัติ - ยื่นซ้ำ',
  'ไม่อนุมัติ - DSR ไม่ผ่าน',
  'ไม่อนุมัติ',
  'ไม่อนุมัติ - ขอยก case',
  'ไม่อนุมัติ - มีบัญชีสินเชื่อค้างชำระ 2 บัญชีขึ้นไป',
  'ขอเอกสารเพิ่ม',
  'ยกเลิก',
] as const;

export type JDResult = typeof JD_RESULTS[number];

// ─────────────────────────────────────────────
// ผลการอนุมัติ — JD จริง (Final) / Livnex Able
// ─────────────────────────────────────────────
export const JD_FINAL_RESULTS = [
  'อนุมัติ - ไม่มีเงื่อนไข',
  'อนุมัติ - แต่ต้องเพิ่มเงินหาร',
  'อนุมัติ - แต่ต้องเพิ่มผู้กู้',
  'อนุมัติ - แต่ทำกู้ร่วม',
  'ไม่อนุมัติ - แต่จ่ายค่างวดได้',
  'ไม่อนุมัติ - ยื่นซ้ำ',
  'ไม่อนุมัติ - DSR ไม่ผ่าน',
  'ไม่อนุมัติ - รายได้ไม่พอ',
  'ไม่อนุมัติ - ขอยก case',
  'ขอเอกสารเพิ่ม',
  'ยกเลิก',
  'ไม่อนุมัติ - มีบัญชีสินเชื่อค้างชำระ 2 บัญชีขึ้นไป',
  'สถานะไม่ผ่านเอกสาร LivNex',
] as const;

export type JDFinalResult = typeof JD_FINAL_RESULTS[number];

// ─────────────────────────────────────────────
// ผลการอนุมัติ — Result (สรุปรวม)
// ─────────────────────────────────────────────
export const APPROVAL_COMBINED_RESULTS = [
  'Bank : อนุมัติ-เต็มวงเงิน',
  'Bank : อนุมัติ-ไม่เต็มวงเงิน',
  'Bank : ไม่อนุมัติ/JD : อนุมัติ-ไม่เต็มวงเงิน',
  'Bank : ไม่อนุมัติ/JD : อนุมัติ มีเงื่อนไข',
  'Bank : ไม่อนุมัติ/JD : ไม่อนุมัติ',
  'Bank : ไม่อนุมัติ/JD : ไม่ผ่านเอกสาร',
  'Bank : ไม่อนุมัติ-ไม่ผ่านเอกสาร',
  'ขอเอกสารเพิ่ม',
  'ยกเลิก',
  'สถานะไม่ผ่านเอกสาร LivNex',
] as const;

export type ApprovalCombinedResult = typeof APPROVAL_COMBINED_RESULTS[number];

// ─────────────────────────────────────────────
// บริษัท (Company)
// ─────────────────────────────────────────────
export const COMPANIES = ['SENA', 'SENX', 'SENA-JV'] as const;
export type Company = typeof COMPANIES[number];

// ─────────────────────────────────────────────
// ประเภทโครงการ (Project Type)
// ─────────────────────────────────────────────
export const PROJECT_TYPES = ['แนวราบ', 'แนวสูง'] as const;
export type ProjectType = typeof PROJECT_TYPES[number];

// ─────────────────────────────────────────────
// Project Status
// ─────────────────────────────────────────────
export const PROJECT_STATUSES = ['House', 'Condo'] as const;
export type ProjectStatus = typeof PROJECT_STATUSES[number];

// ─────────────────────────────────────────────
// OPM (Operation Manager)
// ─────────────────────────────────────────────
export const OPM_LIST = ['OPM C1', 'OPM C2', 'OPM C3', 'OPM H1', 'OPM H2'] as const;
export type OPMCode = typeof OPM_LIST[number];

// ─────────────────────────────────────────────
// BUD (Business Unit Director)
// ─────────────────────────────────────────────
export const BUD_LIST = ['BUD C1', 'BUD C2', 'BUD C3', 'BUD C4', 'BUD H1', 'BUD H2'] as const;
export type BUDCode = typeof BUD_LIST[number];

// ─────────────────────────────────────────────
// โครงการ (Projects) — รวม Company, OPM, BUD, Type
// ─────────────────────────────────────────────
export interface Project {
  code: string;
  name: string;
  company: Company;
  project_status: string;
  opm: string;
  bud: string;
  type: string;
}

export const PROJECTS: Project[] = [
  // BUD C1 — Condo
  { code: '01800', name: 'เสนา เวล่า สิริโสธร', company: 'SENX', project_status: 'Condo', opm: 'OPM C1', bud: 'BUD C1', type: 'แนวสูง' },
  { code: '01801', name: 'เสนา พาร์ค แกรนด์ รามอินทรา', company: 'SENA', project_status: 'Condo', opm: 'OPM C1', bud: 'BUD C1', type: 'แนวสูง' },
  { code: '01809', name: 'เสนา เรสซิเดนซ์ อารีย์', company: 'SENA', project_status: 'Condo', opm: 'OPM C1', bud: 'BUD C1', type: 'แนวสูง' },
  // BUD C2 — Condo
  { code: '01804', name: 'เสนา คอนโด วงเวียนใหญ่', company: 'SENA', project_status: 'Condo', opm: 'OPM C2', bud: 'BUD C2', type: 'แนวสูง' },
  { code: '01807', name: 'เสนา เพลส ลาดพร้าว', company: 'SENA', project_status: 'Condo', opm: 'OPM C2', bud: 'BUD C2', type: 'แนวสูง' },
  // BUD C3 — Condo
  { code: '01802', name: 'เสนา โซลาร์ พหลโยธิน', company: 'SENX', project_status: 'Condo', opm: 'OPM C3', bud: 'BUD C3', type: 'แนวสูง' },
  { code: '01806', name: 'เสนา วิลล่า สุขุมวิท', company: 'SENX', project_status: 'Condo', opm: 'OPM C3', bud: 'BUD C3', type: 'แนวสูง' },
  // BUD C4 — Condo
  { code: '01810', name: 'เสนา คอนโด พระราม 9', company: 'SENA', project_status: 'Condo', opm: 'OPM C1', bud: 'BUD C4', type: 'แนวสูง' },
  { code: '01811', name: 'เสนา คอนโด อ่อนนุช', company: 'SENA', project_status: 'Condo', opm: 'OPM C2', bud: 'BUD C4', type: 'แนวสูง' },
  // BUD H1 — House
  { code: '01805', name: 'เสนา ทาวน์ รังสิต', company: 'SENX', project_status: 'House', opm: 'OPM H1', bud: 'BUD H1', type: 'แนวราบ' },
  { code: '70401', name: 'เสนา วีว่า ศรีราชา - อัสสัมชัญ', company: 'SENX', project_status: 'House', opm: 'OPM H1', bud: 'BUD H1', type: 'แนวราบ' },
  { code: 'BPSN', name: 'บ้านบูรพา', company: 'SENA', project_status: 'House', opm: 'OPM H1', bud: 'BUD H1', type: 'แนวราบ' },
  // BUD H2 — House
  { code: '00601', name: 'เสนา อเวนิว บางปะกง - บ้านโพธิ์', company: 'SENX', project_status: 'House', opm: 'OPM H2', bud: 'BUD H2', type: 'แนวราบ' },
  { code: '01803', name: 'เสนา เอโค่ บางนา', company: 'SENX', project_status: 'House', opm: 'OPM H2', bud: 'BUD H2', type: 'แนวราบ' },
  { code: '01808', name: 'เสนา ไลฟ์ บางปู', company: 'SENA-JV', project_status: 'House', opm: 'OPM H2', bud: 'BUD H2', type: 'แนวราบ' },
  { code: 'BPU', name: 'เสนา เวล่า สุขุมวิท-บางปู', company: 'SENA-JV', project_status: 'House', opm: 'OPM H2', bud: 'BUD H2', type: 'แนวราบ' },
];

// ─────────────────────────────────────────────
// วัตถุประสงค์การซื้อ (Purchase Objective)
// ─────────────────────────────────────────────
export const PURCHASE_OBJECTIVES = [
  'เพื่ออยู่อาศัย',
  'ลงทุน',
] as const;

// ─────────────────────────────────────────────
// ประเภทขายใหม่/Re-sale
// ─────────────────────────────────────────────
export const SALE_TYPE_FLAGS = [
  'ขายใหม่',
  'Re-sale',
] as const;

// ─────────────────────────────────────────────
// วิธีตรวจบ้าน (Inspection Method)
// ─────────────────────────────────────────────
export const INSPECTION_METHODS = [
  'ตรวจเอง',
  'จ้างตรวจ',
] as const;

// ─────────────────────────────────────────────
// Backlog Status
// ─────────────────────────────────────────────
export const BACKLOG_STATUSES = [
  '1. รอเอกสาร',
  '2. Credit Approved',
  '3. backlog เดิม',
  '4. Ready to Transfer',
  '5. Transferred',
] as const;

// ─────────────────────────────────────────────
// Transfer Status
// ─────────────────────────────────────────────
export const TRANSFER_STATUSES = [
  'In process',
  'Transferred',
] as const;

// ─────────────────────────────────────────────
// Management Status (BY)
// ─────────────────────────────────────────────
export const MGMT_STATUSES = [
  'in process',
  'โอน',
  'LivNex',
] as const;

// ─────────────────────────────────────────────
// Thai Months (เดือนภาษาไทย)
// ─────────────────────────────────────────────
export const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'] as const;

// ─────────────────────────────────────────────
// Result Flag — ผลอนุมัติ pass/fail จาก master data
// ─────────────────────────────────────────────
export type ResultFlag = 'pass' | 'fail' | null;

export function getResultFlag(value: string | null | undefined): ResultFlag {
  if (!value) return null;
  if (value.startsWith('ไม่อนุมัติ') || value.startsWith('บูโร - ค้างชำระ') || value === 'อาณัติ' || value === 'ยกเลิก' || value === 'ปฏิเสธ' || value.startsWith('สถานะไม่ผ่านเอกสาร')) return 'fail';
  if (value.startsWith('อนุมัติ') || value.startsWith('บูโรปกติ') || value === 'ทำสัญญาแล้ว') return 'pass';
  return null;
}
