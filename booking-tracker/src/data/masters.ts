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

// Bank submission tracking — per bank (รวม เบื้องต้น + อนุมัติจริง)
export interface BankSubmission {
  bank: BankCode;
  submit_date: string | null;
  // เบื้องต้น (Pre-approve)
  preapprove_date: string | null;
  preapprove_result: string | null;
  // อนุมัติจริง (Final)
  result: string | null;
  result_date: string | null;
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
export const OPM_LIST = ['OPM CH1', 'OPM H1'] as const;
export type OPMCode = typeof OPM_LIST[number];

// ─────────────────────────────────────────────
// BUD (Business Unit Director)
// ─────────────────────────────────────────────
export const BUD_LIST = ['BUD H2'] as const;
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
  { code: '00601', name: 'เสนา อเวนิว บางปะกง - บ้านโพธิ์', company: 'SENX', project_status: 'House', opm: 'OPM CH1', bud: 'BUD H2', type: 'แนวราบ' },
  { code: '00602', name: 'J Town Execlusive บางปะกง', company: 'SENX', project_status: 'House', opm: 'OPM CH1', bud: 'BUD H2', type: 'แนวราบ' },
  { code: '10301', name: 'เสนา วิลเลจ บางปะกง - บ้านโพธิ์', company: 'SENX', project_status: 'House', opm: 'OPM CH1', bud: 'BUD H2', type: 'แนวราบ' },
  { code: '01800', name: 'เสนา เวล่า สิริโสธร', company: 'SENX', project_status: 'House', opm: 'OPM CH1', bud: 'BUD H2', type: 'แนวราบ' },
  { code: '70401', name: 'เสนา วีว่า ศรีราชา - อัสสัมชัญ', company: 'SENX', project_status: 'House', opm: 'OPM CH1', bud: 'BUD H2', type: 'แนวราบ' },
  { code: 'BPSN', name: 'บ้านบูรพา', company: 'SENA', project_status: 'House', opm: 'OPM CH1', bud: 'BUD H2', type: 'แนวราบ' },
  { code: '00300', name: 'เสนา ช็อปเฮ้าส์ สุขุมวิท - แพรกษา', company: 'SENX', project_status: 'House', opm: 'OPM CH1', bud: 'BUD H2', type: 'แนวราบ' },
  { code: '20100', name: 'เสนา วิลเลจ สุขุมวิท - แพรกษา 1', company: 'SENX', project_status: 'House', opm: 'OPM CH1', bud: 'BUD H2', type: 'แนวราบ' },
  { code: 'BPU', name: 'เสนา เวล่า สุขุมวิท-บางปู', company: 'SENA-JV', project_status: 'House', opm: 'OPM H1', bud: 'BUD H2', type: 'แนวราบ' },
  { code: 'TRAK1', name: 'เสนา เวล่า เทพารักษ์ - บางบ่อ', company: 'SENA-JV', project_status: 'House', opm: 'OPM H1', bud: 'BUD H2', type: 'แนวราบ' },
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
