// ===============================================
// SENA BOOKING TO TRANSFER - TRANSACTION DATA
// Master data อยู่ใน masters.ts
// ===============================================

// Re-export master data เพื่อ backward compatibility
export {
  STAGES, STAGE_CONFIG, TEAMS, TEAM_CONFIG, BANKS_LIST,
  PROJECTS, SALE_TYPES, CREDIT_REQUEST_TYPES, CUSTOMER_OCCUPATIONS,
  BUREAU_RESULTS, BANK_PREAPPROVE_RESULTS, BANK_FINAL_RESULTS, JD_RESULTS,
  APPROVAL_COMBINED_RESULTS, PURCHASE_OBJECTIVES, SALE_TYPE_FLAGS,
  INSPECTION_METHODS, BACKLOG_STATUSES, TRANSFER_STATUSES, MGMT_STATUSES,
  type Stage, type Team, type Grade, type KPIResult, type BankCode, type BankSubmission,
  type SaleType, type CreditRequestType, type CustomerOccupation, type BureauResult,
  type BankPreapproveResult, type BankFinalResult, type JDResult, type Project,
} from './masters';

import type { Stage, Grade, KPIResult, BankCode, BankSubmission, Team } from './masters';
import { STAGES, TEAMS } from './masters';

// ===== SEEDED RANDOM (เพื่อให้ Server และ Client ได้ค่าเดียวกัน) =====
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Linear Congruential Generator (LCG)
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  // Reset seed
  reset(seed: number) {
    this.seed = seed;
  }
}

// Global seeded random instance - ใช้ seed คงที่เพื่อ deterministic
const seededRandom = new SeededRandom(12345);

// ===============================================
// BOOKING INTERFACE - ครบ 13 Sections
// ===============================================
export interface Booking {
  id: string;

  // ─────────────────────────────────────────────
  // 1. BACKLOG / SEGMENTATION
  // ─────────────────────────────────────────────
  backlog_status: string;           // e.g., "3. backlog เดิม"
  backlog_old_flag: boolean;        // true = backlog เดิม
  sale_type_flag: string;           // "ขายใหม่" | "Re-sale"
  dec_period: string;               // "DEC" | "JAN" | etc.
  fiscal_year: number;              // e.g., 1403
  no_count_flag: boolean;           // NO = false
  obj_purchase: string;             // "เพื่ออยู่อาศัย" | "ลงทุน"
  OPM: string;                      // e.g., "CH1 - คุณธานินทร์"
  BUD: string;                      // e.g., "H2 - คุณเอกกฤษณ์"
  head_co: string;                  // e.g., "ภาวิณีย์"

  // ─────────────────────────────────────────────
  // 2. PROJECT / UNIT INFORMATION
  // ─────────────────────────────────────────────
  project_code: string;             // e.g., "1800"
  project_name: string;             // e.g., "01800 - เสนา เวล่า สิริโสธร"
  row_no: number;                   // row number in sheet
  building_zone: string;            // e.g., "E"
  unit_no: string;                  // e.g., "1"
  house_reg_no: string;             // e.g., "123/1"
  house_type: string;               // e.g., "Euro"

  // ─────────────────────────────────────────────
  // 3. BOOKING / CONTRACT CORE
  // ─────────────────────────────────────────────
  booking_date: string | null;      // "18/12/2025"
  contract_date: string | null;     // "25/12/2025"
  net_contract_value: number;       // 1830000
  aging_N_minus_U: number;          // 39
  pro_transfer_bonus: number;       // 15794
  reason_not_transfer_this_month: string | null;

  // ─────────────────────────────────────────────
  // 4. CUSTOMER INFORMATION
  // ─────────────────────────────────────────────
  customer_name: string;
  customer_tel: string;
  customer_profile_text: string;    // Full profile text
  customer_age: number | null;
  customer_age_range: string | null; // "40-50"
  customer_occupation: string | null;
  customer_monthly_income: number | null;
  customer_debt: string | null;     // "ไม่มี" or amount
  customer_ltv: string | null;      // "N/A" or "90%"
  purchase_reason: string | null;   // "ทำเล / ราคา"
  purchase_objective: string | null; // "เพื่ออยู่อาศัย"

  // ─────────────────────────────────────────────
  // 5. SALE INFORMATION
  // ─────────────────────────────────────────────
  sale_name: string;
  booking_type: string | null;      // ประเภทการจอง e.g., "ผ่อนดาวน์" | "เงินสด" | "จองพิเศษ"
  sale_type: string;                // "ผ่อนดาวน์" | "เงินสด"
  down_payment_complete_date: string | null;
  credit_request_type: string;      // "โอนสด" | "สินเชื่อธนาคาร"
  banks_submitted: BankSubmission[]; // ธนาคารที่ส่ง 1-3 แห่ง (รวม Proptiane)
  selected_bank: string | null;      // ธนาคารที่ลูกค้าเลือก (bank code) e.g. 'KBANK', 'SCB', 'Proptiane'

  // ─────────────────────────────────────────────
  // 6. CREDIT / BANK PROCESS (CO)
  // ─────────────────────────────────────────────
  credit_status: string;            // "โอนสด" | "รอผล Bureau" | "อนุมัติแล้ว"
  credit_owner: string | null;      // "1.2) วิลาวัณย์ (อุ๊)"

  // Document Tracking (วันที่ยื่นเอกสาร)
  doc_submit_date: string | null;           // เช็คบูโร
  doc_complete_bank_jd_date: string | null; // เอกสารครบ Bank
  doc_complete_jd_date: string | null;      // เอกสารครบ JD
  bank_request_more_doc_date: string | null; // เอกสารขอเพิ่ม Bank
  jd_request_more_doc_date: string | null;   // เอกสารขอเพิ่ม JD

  // Bureau (บูโร)
  bureau_target_result_date: string | null;           // Target (นับ Sat-Sun)
  bureau_target_result_date_biz: string | null;       // Target (ไม่นับ Sat-Sun)
  bureau_actual_result_date: string | null;           // วันที่ได้ผล Actual
  bureau_result: string | null;                       // ผลบูโร "ผ่าน" | "ไม่ผ่าน"

  // Bank อนุมัติเบื้องต้น (Pre-approve)
  bank_preapprove_target_date: string | null;         // Target (นับ Sat-Sun)
  bank_preapprove_target_date_biz: string | null;     // Target (ไม่นับ Sat-Sun)
  bank_preapprove_actual_date: string | null;         // วันที่ได้ผล Actual
  bank_preapprove_result: string | null;              // ผลการอนุมัติ

  // Bank อนุมัติจริง (Final)
  bank_final_target_date: string | null;              // Target (นับ Sat-Sun)
  bank_final_target_date_biz: string | null;          // Target (ไม่นับ Sat-Sun)
  bank_final_actual_date: string | null;              // วันที่ได้ผล Actual
  bank_final_result: string | null;                   // ผลการอนุมัติ

  // JD อนุมัติจริง
  jd_final_target_date: string | null;                // Target (ไม่นับ Sat-Sun)
  jd_final_actual_date: string | null;                // วันที่ได้ผล Actual
  jd_final_result: string | null;                     // ผลการอนุมัติ

  co_remark: string | null;

  // ─────────────────────────────────────────────
  // 7. INSPECTION / CS / CONSTRUCTION
  // ─────────────────────────────────────────────
  inspection_status: string;        // "รับนัดตรวจ" | "รอแก้งาน" | "ผ่านแล้ว"
  inspection_appointment_status: string | null; // "นัดแล้ว" | "รอนัด" | "ยกเลิกนัด"
  inspection_method: string | null; // "ตรวจเอง" | "จ้างตรวจ"
  hired_inspector: string | null;   // ชื่อผู้ที่ลูกค้าจ้างมาตรวจ (คน/บริษัท)
  unit_ready_inspection_date: string | null; // วันที่ห้องพร้อมตรวจ 5.5
  notify_customer_date: string | null; // แจ้งลูกค้า
  cs_notify_target_date: string | null;

  // Round 1 (ตรวจ 1)
  inspect1_notify_target_date: string | null;     // Target แจ้งลูกค้า (นับ Sat-Sun)
  inspect1_notify_target_date_biz: string | null; // Target แจ้งลูกค้า (ไม่นับ Sat-Sun)
  inspect1_notify_date: string | null;
  inspect1_appointment_date: string | null;       // วันที่นัดลูกค้าเข้าตรวจ
  inspect1_actual_date: string | null;            // วันที่ลูกค้าเข้าตรวจจริง
  inspect1_result: string | null;                 // ผลการตรวจ "ผ่าน" | "ไม่ผ่าน"
  inspect1_ready_date: string | null;

  // Round 2 (ตรวจ 2)
  inspect2_ready_target_date: string | null;      // Target พร้อม (นับ Sat-Sun)
  inspect2_ready_target_date_biz: string | null;  // Target พร้อม (ไม่นับ Sat-Sun)
  inspect2_ready_date: string | null;             // วันที่ห้องพร้อม CS ตรวจผ่าน
  inspect2_appointment_date: string | null;       // วันที่นัดลูกค้าเข้าตรวจ
  inspect2_actual_date: string | null;            // วันที่ลูกค้าเข้าตรวจจริง
  inspect2_result: string | null;                 // ผลการตรวจ

  // Round 3 (ตรวจ 3)
  inspect3_ready_target_date: string | null;      // Target พร้อม (นับ Sat-Sun)
  inspect3_ready_target_date_biz: string | null;  // Target พร้อม (ไม่นับ Sat-Sun)
  inspect3_ready_date: string | null;             // วันที่ห้องพร้อม CS ตรวจผ่าน
  inspect3_appointment_date: string | null;       // วันที่นัดลูกค้าเข้าตรวจ
  inspect3_actual_date: string | null;            // วันที่ลูกค้าเข้าตรวจจริง
  inspect3_result: string | null;                 // ผลการตรวจ

  handover_accept_date: string | null;            // วันที่รับห้อง
  inspection_officer: string | null;              // ชื่อ CON
  cs_owner: string | null;                        // ชื่อ CS

  // ─────────────────────────────────────────────
  // 8. TRANSFER / LEGAL / CO SUPPORT
  // ─────────────────────────────────────────────
  bank_contract_date: string | null;
  transfer_package_sent_date: string | null;
  title_clear_date: string | null;
  title_clear_notify_date: string | null;
  transfer_target_date: string | null;      // เป้าโอน
  transfer_upside_flag: string | null;      // Upside Flag
  transfer_appointment_date: string | null; // นัดโอนจริง
  transfer_actual_date: string | null;
  transfer_status: string;          // "In process" | "Transferred"

  // Cancellation
  cancel_flag: boolean;
  cancel_date: string | null;
  cancel_reason: string | null;

  // ─────────────────────────────────────────────
  // 9. LIVNEX / RENTNEX EQUITY
  // ─────────────────────────────────────────────
  livnex_able_status: string | null;           // "ON Hand Sale" | "ได้" | "ไม่ได้" | "รอตรวจสอบ"
  livnex_case_receive_date: string | null;     // วันที่ รับ CASE e.g. "27/12/2025"
  livnex_credit_status: string | null;         // สถานะสินเชื่อ e.g. "11. เซ็นสัญญา Livnex", "05. JD ไม่อนุมัติ"
  livnex_contract_sign_status: string | null;  // สถานะการเซ็นสัญญา e.g. "เซ็นสัญญาแล้ว นัดชำระเงิน"
  livnex_move_in_date: string | null;          // วันที่เข้าอยู่ e.g. "15 Jan 2026"
  livnex_able_reason: string | null;           // เหตุผล Livnex Able e.g. "อนุมัติ - ไม่มีเงื่อนไข", "ไม่อนุมัติ - DSR เกิน"
  livnex_followup_note: string | null;         // เหตุผล ติดตาม LIVNEX
  livnex_able_completion_result: string | null;
  livnex_complete_date: string | null;
  sale_offer_livnex_flag: boolean;
  livnex_present_date: string | null;                 // วันที่นำเสนอ LivNex
  livnex_contract_appointment_date: string | null;    // วันที่นัดทำสัญญา
  livnex_contract_actual_date: string | null;         // วันที่ทำสัญญาจริง (เซ็นต์)
  livnex_cancel_date: string | null;
  livnex_cancel_reason: string | null;
  pre_livnex_present_date: string | null;                // วันที่นำเสนอ Pre-LivNex
  pre_livnex_contract_appointment_date: string | null;   // วันที่ทำสัญญา
  pre_livnex_cancel_date: string | null;
  pre_livnex_cancel_reason: string | null;

  // ─────────────────────────────────────────────
  // 10. FOLLOW-UP / ACTION / ADMIN
  // ─────────────────────────────────────────────
  followup_bank: string | null;
  followup_bank_date: string | null;
  sale_followup_task: string | null;
  followup_note: string | null;
  pm_fast_sent_date: string | null;
  cs_review_date: string | null;
  qc_result: string | null;         // "QC.Pass" | "แก้งาน 5 รายการ"
  con_review_result: string | null; // "Pass" | "รอแก้ไข"

  // ─────────────────────────────────────────────
  // 11. FINANCE / REFUND / METER
  // ─────────────────────────────────────────────
  refund_status: string | null;
  refund_aging: number | null;
  refund_transfer_date: string | null;
  refund_amount: number | null;
  water_meter_change_date: string | null;
  electricity_meter_change_date: string | null;
  handover_document_received_date: string | null;
  cannot_transfer_issue: string | null;
  expected_transfer_month: string | null;
  fin_day_appointment_date: string | null;

  // ─────────────────────────────────────────────
  // 12. KPI / SLA (SYSTEM CALCULATED - READ ONLY)
  // ─────────────────────────────────────────────
  aging_days: number;
  m2_bureau_to_handover_days: number | null;
  call_customer_within_2_days: KPIResult;
  inspection_within_15_days: KPIResult;
  booking_to_preapprove_days: number | null;
  booking_to_bank_final_days: number | null;
  docsubmit_to_bank_final_days: number | null;
  booking_to_bureau_days: number | null;
  efficiency_cycle_status: string;
  ahead_delay_days: number | null;
  backlog_grade: Grade;

  // ─────────────────────────────────────────────
  // 13. MANAGEMENT / BACKLOG CONTROL
  // ─────────────────────────────────────────────
  backlog_owner: string | null;
  transfer_target_status: string;   // "โอนเดือนนี้" | "มีเงื่อนไขโอนเดือนอื่น"
  credit_day_status: string;        // "In process" | "อนุมัติแล้ว"
  product_status: string;           // "พร้อมโอน" | "รอแก้งาน"
  contract_transfer_due_date: string | null;
  transferred_actual_flag: boolean;

  // ─────────────────────────────────────────────
  // 14. MANAGEMENT WEEKLY TRACKING (BY-CA)
  // ─────────────────────────────────────────────
  mgmt_status: string | null;           // BY: สถานะปัจจุบัน
  mgmt_responsible: string | null;      // BZ: งานอยู่ที่ (ผู้รับผิดชอบ)
  mgmt_remark: string | null;           // CA: หมายเหตุ (สรุปรายสัปดาห์)

  // ─────────────────────────────────────────────
  // COMPUTED / HELPER FIELDS
  // ─────────────────────────────────────────────
  stage: Stage;                     // Current pipeline stage
  current_owner_team: Team;         // ทีมที่ต้องทำงานตอนนี้
  current_blocker: string | null;   // คอขวดปัจจุบัน
  next_action: string | null;       // สิ่งที่ต้องทำต่อไป
}

// ===============================================
// MOCK DATA - ครบทุก Field
// ===============================================
export const bookings: Booking[] = [
  {
    id: 'BK-2025-1218-001',

    // 1. Backlog
    backlog_status: '3. backlog เดิม',
    backlog_old_flag: true,
    sale_type_flag: 'ขายใหม่',
    dec_period: 'DEC',
    fiscal_year: 1403,
    no_count_flag: false,
    obj_purchase: 'เพื่ออยู่อาศัย',
    OPM: 'CH1 - คุณธานินทร์',
    BUD: 'H2 - คุณเอกกฤษณ์',
    head_co: 'ภาวิณีย์',

    // 2. Project
    project_code: '1800',
    project_name: '01800 - เสนา เวล่า สิริโสธร',
    row_no: 1,
    building_zone: 'E',
    unit_no: '1',
    house_reg_no: '123/1',
    house_type: 'Euro',

    // 3. Booking/Contract
    booking_date: '18/12/2025',
    contract_date: '25/12/2025',
    net_contract_value: 1830000,
    aging_N_minus_U: 39,
    pro_transfer_bonus: 15794,
    reason_not_transfer_this_month: 'ลูกค้าดูฤกษ์โอน',

    // 4. Customer
    customer_name: 'นางสาวกฤษณ์ชนิยา แซ่อุ๊ย',
    customer_tel: '062-835-7187',
    customer_profile_text: 'Book Date : 18 ธ.ค.2568\nรายได้ 300,000 บาท/เดือน\nไม่มีภาระ\nซื้อเงินสด',
    customer_age: 47,
    customer_age_range: '40-50',
    customer_occupation: 'ค้าขาย',
    customer_monthly_income: 300000,
    customer_debt: 'ไม่มี',
    customer_ltv: 'N/A',
    purchase_reason: 'ทำเล / ราคา',
    purchase_objective: 'เพื่ออยู่อาศัย',

    // 5. Sale
    sale_name: 'สกุลกาญจน์ ชินพราหมณ์',
    booking_type: 'เงินสด',
    sale_type: 'ผ่อนดาวน์',
    down_payment_complete_date: '25/05/2026',
    credit_request_type: 'โอนสด',
    banks_submitted: [
      { bank: 'CASH', submit_date: null, preapprove_date: null, preapprove_result: null, result: 'อนุมัติ - เงินสด', result_date: null, approved_amount: 1830000, remark: 'โอนสด' }
    ],
    selected_bank: 'CASH',

    // 6. Credit
    credit_status: 'โอนสด',
    credit_owner: '1.2) วิลาวัณย์ (อุ๊)',
    doc_submit_date: null,
    doc_complete_bank_jd_date: null,
    doc_complete_jd_date: null,
    bank_request_more_doc_date: null,
    jd_request_more_doc_date: null,
    bureau_target_result_date: null,
    bureau_target_result_date_biz: null,
    bureau_actual_result_date: null,
    bureau_result: null,
    bank_preapprove_target_date: null,
    bank_preapprove_target_date_biz: null,
    bank_preapprove_actual_date: null,
    bank_preapprove_result: null,
    bank_final_target_date: null,
    bank_final_target_date_biz: null,
    bank_final_actual_date: null,
    bank_final_result: null,
    jd_final_target_date: null,
    jd_final_actual_date: null,
    jd_final_result: null,
    co_remark: 'ลูกค้าแจ้งโอนสด จึงไม่มีผลบูโร',

    // 7. Inspection
    inspection_status: 'รับนัดตรวจ',
    inspection_appointment_status: 'นัดแล้ว',
    notify_customer_date: '24/12/2025',
    inspection_method: 'ตรวจเอง',
    hired_inspector: null,
    unit_ready_inspection_date: '07/01/2026',
    cs_notify_target_date: null,
    inspect1_notify_target_date: '22/12/2025',
    inspect1_notify_target_date_biz: '20/12/2025',
    inspect1_notify_date: '24/12/2025',
    inspect1_appointment_date: '15/05/2026',
    inspect1_actual_date: null,
    inspect1_result: null,
    inspect1_ready_date: null,
    inspect2_ready_target_date: null,
    inspect2_ready_target_date_biz: null,
    inspect2_ready_date: null,
    inspect2_appointment_date: null,
    inspect2_actual_date: null,
    inspect2_result: null,
    inspect3_ready_target_date: null,
    inspect3_ready_target_date_biz: null,
    inspect3_ready_date: null,
    inspect3_appointment_date: null,
    inspect3_actual_date: null,
    inspect3_result: null,
    handover_accept_date: null,
    inspection_officer: 'สุรสิทธิ์ (โต้ง)',
    cs_owner: 'สุรศักดิ์ / กาญจนา',

    // 8. Transfer
    bank_contract_date: null,
    transfer_package_sent_date: null,
    title_clear_date: null,
    title_clear_notify_date: null,
    transfer_target_date: '30/06/2026',
    transfer_upside_flag: null,
    transfer_actual_date: null,
    transfer_appointment_date: null,
    transfer_status: 'In process',
    cancel_flag: false,
    cancel_date: null,
    cancel_reason: null,

    // 9. LivNex
    livnex_able_status: 'ON Hand Sale',
    livnex_case_receive_date: '27/12/2025',
    livnex_credit_status: '11. เซ็นสัญญา Livnex',
    livnex_contract_sign_status: 'เซ็นสัญญาแล้ว นัดชำระเงิน',
    livnex_move_in_date: '15 Jan 2026',
    livnex_able_reason: 'อนุมัติ - ไม่มีเงื่อนไข',
    livnex_followup_note: '27/12/678 โครงการเสนา เวลา สิริโสธร ขอปิด 0904 (133/4)',
    livnex_able_completion_result: null,
    livnex_complete_date: null,
    sale_offer_livnex_flag: false,
    livnex_present_date: null,
    livnex_contract_appointment_date: null,
    livnex_contract_actual_date: null,
    livnex_cancel_date: null,
    livnex_cancel_reason: null,
    pre_livnex_present_date: null,
    pre_livnex_contract_appointment_date: null,
    pre_livnex_cancel_date: null,
    pre_livnex_cancel_reason: null,

    // 10. Follow-up
    followup_bank: 'โอน มิ.ย. 69',
    followup_bank_date: null,
    sale_followup_task: 'ตรวจบ้าน / นัดโอน',
    followup_note: 'ลูกค้าขอดูฤกษ์หลังสงกรานต์',
    pm_fast_sent_date: '01/07/2026',
    cs_review_date: null,
    qc_result: 'QC.Pass',
    con_review_result: 'Pass',

    // 11. Finance
    refund_status: null,
    refund_aging: null,
    refund_transfer_date: null,
    refund_amount: null,
    water_meter_change_date: null,
    electricity_meter_change_date: null,
    handover_document_received_date: null,
    cannot_transfer_issue: null,
    expected_transfer_month: 'มิ.ย.',
    fin_day_appointment_date: null,

    // 12. KPI
    aging_days: 46,
    m2_bureau_to_handover_days: 46,
    call_customer_within_2_days: 'FAIL',
    inspection_within_15_days: 'FAIL',
    booking_to_preapprove_days: null,
    booking_to_bank_final_days: null,
    docsubmit_to_bank_final_days: null,
    booking_to_bureau_days: null,
    efficiency_cycle_status: 'Booking → Transfer > 30 Days',
    ahead_delay_days: null,
    backlog_grade: 'C',

    // 13. Management
    backlog_owner: 'พี่เหน่ง',
    transfer_target_status: 'มีเงื่อนไขโอนเดือนอื่น',
    credit_day_status: 'In process',
    product_status: 'พร้อมโอน',
    contract_transfer_due_date: '30 วันหลังทำสัญญา',
    transferred_actual_flag: false,

    // 14. Management Weekly Tracking
    mgmt_status: 'in process',
    mgmt_responsible: 'Sale - สกุลกาญจน์',
    mgmt_remark: 'WK4: ลูกค้าดูฤกษ์หลังสงกรานต์ นัดโทรติดตาม 28/1',

    // Computed
    stage: 'inspection',
    current_owner_team: 'CS',
    current_blocker: 'ลูกค้าดูฤกษ์โอน',
    next_action: 'นัดตรวจบ้าน 15 พ.ค.',
  },

  {
    id: 'BK-2026-0105-002',

    // 1. Backlog
    backlog_status: '1. รอเอกสาร',
    backlog_old_flag: false,
    sale_type_flag: 'ขายใหม่',
    dec_period: 'JAN',
    fiscal_year: 1403,
    no_count_flag: false,
    obj_purchase: 'เพื่ออยู่อาศัย',
    OPM: 'CH2 - คุณสมชาย',
    BUD: 'H1 - คุณวิชัย',
    head_co: 'ภาวิณีย์',

    // 2. Project
    project_code: '1801',
    project_name: '01801 - เสนา พาร์ค แกรนด์ รามอินทรา',
    row_no: 2,
    building_zone: 'A',
    unit_no: '45',
    house_reg_no: '45/12',
    house_type: 'Modern',

    // 3. Booking/Contract
    booking_date: '05/01/2026',
    contract_date: '12/01/2026',
    net_contract_value: 3250000,
    aging_N_minus_U: 22,
    pro_transfer_bonus: 28500,
    reason_not_transfer_this_month: 'รอผลอนุมัติธนาคาร',

    // 4. Customer
    customer_name: 'นายวิทยา สุขสวัสดิ์',
    customer_tel: '089-123-4567',
    customer_profile_text: 'Book Date : 5 ม.ค.2569\nรายได้ 85,000 บาท/เดือน\nมีภาระสินเชื่อรถ 8,000/เดือน\nขอสินเชื่อ SCB',
    customer_age: 35,
    customer_age_range: '30-40',
    customer_occupation: 'พนักงานบริษัท',
    customer_monthly_income: 85000,
    customer_debt: '8,000 บาท/เดือน',
    customer_ltv: '90%',
    purchase_reason: 'ใกล้ที่ทำงาน',
    purchase_objective: 'เพื่ออยู่อาศัย',

    // 5. Sale
    sale_name: 'นภาพร วงศ์สกุล',
    booking_type: 'ผ่อนดาวน์',
    sale_type: 'ผ่อนดาวน์',
    down_payment_complete_date: '05/03/2026',
    credit_request_type: 'สินเชื่อธนาคาร',
    banks_submitted: [
      { bank: 'SCB', submit_date: '15/01/2026', preapprove_date: '27/01/2026', preapprove_result: 'อนุมัติ - ไม่มีเงื่อนไข', result: 'รอผล', result_date: null, approved_amount: null, remark: null },
      { bank: 'KBANK', submit_date: '15/01/2026', preapprove_date: '28/01/2026', preapprove_result: 'อนุมัติ - มีหนี้', result: 'รอผล', result_date: null, approved_amount: null, remark: 'มีสินเชื่อรถ 8,000/เดือน' },
      { bank: 'Proptiane', submit_date: '15/01/2026', preapprove_date: null, preapprove_result: null, result: 'รอผล', result_date: null, approved_amount: null, remark: null }
    ],
    selected_bank: null,

    // 6. Credit
    credit_status: 'รอผล Bureau',
    credit_owner: '1.1) สมหญิง (หญิง)',
    doc_submit_date: '15/01/2026',
    doc_complete_bank_jd_date: '18/01/2026',
    doc_complete_jd_date: null,
    bank_request_more_doc_date: null,
    jd_request_more_doc_date: null,
    bureau_target_result_date: '25/01/2026',
    bureau_target_result_date_biz: '23/01/2026',
    bureau_actual_result_date: null,
    bureau_result: 'รอผล',
    bank_preapprove_target_date: '01/02/2026',
    bank_preapprove_target_date_biz: '30/01/2026',
    bank_preapprove_actual_date: null,
    bank_preapprove_result: null,
    bank_final_target_date: '15/02/2026',
    bank_final_target_date_biz: '13/02/2026',
    bank_final_actual_date: null,
    bank_final_result: null,
    jd_final_target_date: null,
    jd_final_actual_date: null,
    jd_final_result: null,
    co_remark: 'ลูกค้ามีประวัติดี คาดว่าผ่าน',

    // 7. Inspection
    inspection_status: 'รอนัดตรวจ',
    inspection_appointment_status: 'รอนัด',
    notify_customer_date: null,
    inspection_method: 'ตรวจเอง',
    hired_inspector: null,
    unit_ready_inspection_date: '20/01/2026',
    cs_notify_target_date: '22/01/2026',
    inspect1_notify_target_date: null,
    inspect1_notify_target_date_biz: null,
    inspect1_notify_date: null,
    inspect1_appointment_date: null,
    inspect1_actual_date: null,
    inspect1_result: null,
    inspect1_ready_date: null,
    inspect2_ready_target_date: null,
    inspect2_ready_target_date_biz: null,
    inspect2_ready_date: null,
    inspect2_appointment_date: null,
    inspect2_actual_date: null,
    inspect2_result: null,
    inspect3_ready_target_date: null,
    inspect3_ready_target_date_biz: null,
    inspect3_ready_date: null,
    inspect3_appointment_date: null,
    inspect3_actual_date: null,
    inspect3_result: null,
    handover_accept_date: null,
    inspection_officer: 'ประวิทย์ (เอ็ม)',
    cs_owner: 'มานพ / ศิริพร',

    // 8. Transfer
    bank_contract_date: null,
    transfer_package_sent_date: null,
    title_clear_date: null,
    title_clear_notify_date: null,
    transfer_target_date: '28/02/2026',
    transfer_upside_flag: 'Upside',
    transfer_actual_date: null,
    transfer_appointment_date: null,
    transfer_status: 'In process',
    cancel_flag: false,
    cancel_date: null,
    cancel_reason: null,

    // 9. LivNex
    livnex_able_status: 'ON Hand Sale',
    livnex_case_receive_date: '23/01/2026',
    livnex_credit_status: '05. JD ไม่อนุมัติ',
    livnex_contract_sign_status: null,
    livnex_move_in_date: null,
    livnex_able_reason: 'ไม่อนุมัติ - DSR เกิน',
    livnex_followup_note: '23/01/69 ไม่เข้าเงื่อนไขเกณฑ์ภูมิภาค : เนื่องจาก รายได้เดิมเพียงพอ / DSR 96.52%',
    livnex_able_completion_result: 'สนใจ',
    livnex_complete_date: null,
    sale_offer_livnex_flag: true,
    livnex_present_date: '20/01/2026',
    livnex_contract_appointment_date: null,
    livnex_contract_actual_date: null,
    livnex_cancel_date: null,
    livnex_cancel_reason: null,
    pre_livnex_present_date: null,
    pre_livnex_contract_appointment_date: null,
    pre_livnex_cancel_date: null,
    pre_livnex_cancel_reason: null,

    // 10. Follow-up
    followup_bank: 'รอผล Bureau 25 ม.ค.',
    followup_bank_date: '25/01/2026',
    sale_followup_task: 'ติดตามผล Bureau',
    followup_note: 'ลูกค้าพร้อมโอนทันทีหลังอนุมัติ',
    pm_fast_sent_date: null,
    cs_review_date: null,
    qc_result: 'รอตรวจ',
    con_review_result: 'Pass',

    // 11. Finance
    refund_status: null,
    refund_aging: null,
    refund_transfer_date: null,
    refund_amount: null,
    water_meter_change_date: null,
    electricity_meter_change_date: null,
    handover_document_received_date: null,
    cannot_transfer_issue: null,
    expected_transfer_month: 'ก.พ.',
    fin_day_appointment_date: null,

    // 12. KPI
    aging_days: 22,
    m2_bureau_to_handover_days: 0,
    call_customer_within_2_days: 'PASS',
    inspection_within_15_days: 'N/A',
    booking_to_preapprove_days: null,
    booking_to_bank_final_days: null,
    docsubmit_to_bank_final_days: null,
    booking_to_bureau_days: null,
    efficiency_cycle_status: 'On Track',
    ahead_delay_days: null,
    backlog_grade: 'A',

    // 13. Management
    backlog_owner: 'พี่ต้น',
    transfer_target_status: 'โอนเดือนนี้',
    credit_day_status: 'รอ Bureau',
    product_status: 'พร้อมโอน',
    contract_transfer_due_date: '30 วันหลังทำสัญญา',
    transferred_actual_flag: false,

    // 14. Management Weekly Tracking
    mgmt_status: 'in process',
    mgmt_responsible: 'CO - วิลาวัณย์',
    mgmt_remark: 'WK4: รอผล Bureau ธ.กสิกร คาดได้ 25/1',

    // Computed
    stage: 'credit',
    current_owner_team: 'CO',
    current_blocker: 'รอผล Bureau',
    next_action: 'ผล Bureau 25 ม.ค.',
  },

  {
    id: 'BK-2025-1210-003',

    // 1. Backlog
    backlog_status: '2. Credit Approved',
    backlog_old_flag: false,
    sale_type_flag: 'ขายใหม่',
    dec_period: 'DEC',
    fiscal_year: 1403,
    no_count_flag: false,
    obj_purchase: 'ลงทุน',
    OPM: 'CH1 - คุณธานินทร์',
    BUD: 'H2 - คุณเอกกฤษณ์',
    head_co: 'ภาวิณีย์',

    // 2. Project
    project_code: '1802',
    project_name: '01802 - เสนา วิลล์ บางนา กม.7',
    row_no: 3,
    building_zone: 'B',
    unit_no: '78',
    house_reg_no: '78/5',
    house_type: 'Contemporary',

    // 3. Booking/Contract
    booking_date: '10/12/2025',
    contract_date: '17/12/2025',
    net_contract_value: 4500000,
    aging_N_minus_U: 53,
    pro_transfer_bonus: 38500,
    reason_not_transfer_this_month: 'รอแก้งาน ตรวจรอบ 2',

    // 4. Customer
    customer_name: 'นางปราณี โชติวัฒน์',
    customer_tel: '081-234-5678',
    customer_profile_text: 'Book Date : 10 ธ.ค.2568\nรายได้ 150,000 บาท/เดือน\nไม่มีภาระ\nขอสินเชื่อ KBANK',
    customer_age: 52,
    customer_age_range: '50-60',
    customer_occupation: 'ธุรกิจส่วนตัว',
    customer_monthly_income: 150000,
    customer_debt: 'ไม่มี',
    customer_ltv: '80%',
    purchase_reason: 'ลงทุนปล่อยเช่า',
    purchase_objective: 'ลงทุน',

    // 5. Sale
    sale_name: 'ธนพล ศรีสุข',
    booking_type: 'ผ่อนดาวน์',
    sale_type: 'ผ่อนดาวน์',
    down_payment_complete_date: '10/02/2026',
    credit_request_type: 'สินเชื่อธนาคาร',
    banks_submitted: [
      { bank: 'KBANK', submit_date: '20/12/2025', preapprove_date: '28/12/2025', preapprove_result: 'อนุมัติ - ไม่มีเงื่อนไข', result: 'อนุมัติ - เต็มวงเงิน', result_date: '10/01/2026', approved_amount: 3600000, remark: null },
      { bank: 'Proptiane', submit_date: '20/12/2025', preapprove_date: null, preapprove_result: null, result: 'ไม่อนุมัติ - มีประวัติ', result_date: '30/12/2025', approved_amount: null, remark: null }
    ],
    selected_bank: 'KBANK',

    // 6. Credit
    credit_status: 'อนุมัติแล้ว',
    credit_owner: '1.3) กานดา (ดา)',
    doc_submit_date: '20/12/2025',
    doc_complete_bank_jd_date: '23/12/2025',
    doc_complete_jd_date: '27/12/2025',
    bank_request_more_doc_date: null,
    jd_request_more_doc_date: null,
    bureau_target_result_date: '27/12/2025',
    bureau_target_result_date_biz: '25/12/2025',
    bureau_actual_result_date: '26/12/2025',
    bureau_result: 'บูโรปกติ - ไม่มีหนี้',
    bank_preapprove_target_date: '03/01/2026',
    bank_preapprove_target_date_biz: '02/01/2026',
    bank_preapprove_actual_date: '02/01/2026',
    bank_preapprove_result: 'อนุมัติ - ไม่มีเงื่อนไข',
    bank_final_target_date: '10/01/2026',
    bank_final_target_date_biz: '09/01/2026',
    bank_final_actual_date: '08/01/2026',
    bank_final_result: 'อนุมัติ - เต็มวงเงิน',
    jd_final_target_date: '15/01/2026',
    jd_final_actual_date: '12/01/2026',
    jd_final_result: 'อนุมัติ - ไม่มีเงื่อนไข',
    co_remark: 'ลูกค้าประวัติดีมาก อนุมัติเร็ว',

    // 7. Inspection
    inspection_status: 'รอแก้งาน',
    inspection_appointment_status: 'นัดแล้ว',
    notify_customer_date: '15/12/2025',
    inspection_method: 'จ้างตรวจ',
    hired_inspector: 'บ.ตรวจบ้านมืออาชีพ',
    unit_ready_inspection_date: '05/01/2026',
    cs_notify_target_date: '07/01/2026',
    inspect1_notify_target_date: '05/01/2026',
    inspect1_notify_target_date_biz: '03/01/2026',
    inspect1_notify_date: '07/01/2026',
    inspect1_appointment_date: '12/01/2026',
    inspect1_actual_date: '12/01/2026',
    inspect1_result: 'ไม่ผ่าน',
    inspect1_ready_date: null,
    inspect2_ready_target_date: '22/01/2026',
    inspect2_ready_target_date_biz: '20/01/2026',
    inspect2_ready_date: null,
    inspect2_appointment_date: '25/01/2026',
    inspect2_actual_date: null,
    inspect2_result: null,
    inspect3_ready_target_date: null,
    inspect3_ready_target_date_biz: null,
    inspect3_ready_date: null,
    inspect3_appointment_date: null,
    inspect3_actual_date: null,
    inspect3_result: null,
    handover_accept_date: null,
    inspection_officer: 'สุรสิทธิ์ (โต้ง)',
    cs_owner: 'สุรศักดิ์ / กาญจนา',

    // 8. Transfer
    bank_contract_date: '15/01/2026',
    transfer_package_sent_date: '18/01/2026',
    title_clear_date: '20/01/2026',
    title_clear_notify_date: '20/01/2026',
    transfer_target_date: '31/01/2026',
    transfer_upside_flag: null,
    transfer_actual_date: null,
    transfer_appointment_date: null,
    transfer_status: 'In process',
    cancel_flag: false,
    cancel_date: null,
    cancel_reason: null,

    // 9. LivNex
    livnex_able_status: 'ON Hand Sale',
    livnex_case_receive_date: '15/12/2025',
    livnex_credit_status: '05. JD ไม่อนุมัติ',
    livnex_contract_sign_status: null,
    livnex_move_in_date: null,
    livnex_able_reason: 'ไม่อนุมัติ - DSR เกิน',
    livnex_followup_note: '15/12/68 JD ไม่เข้าเงื่อนไข : เกณฑ์การพิจารณาของบริษัท รายได้ไม่เพียงพอ',
    livnex_able_completion_result: 'ทำสัญญาแล้ว',
    livnex_complete_date: '15/01/2026',
    sale_offer_livnex_flag: true,
    livnex_present_date: '10/12/2025',
    livnex_contract_appointment_date: '14/01/2026',
    livnex_contract_actual_date: '15/01/2026',
    livnex_cancel_date: null,
    livnex_cancel_reason: null,
    pre_livnex_present_date: '08/12/2025',
    pre_livnex_contract_appointment_date: null,
    pre_livnex_cancel_date: null,
    pre_livnex_cancel_reason: null,

    // 10. Follow-up
    followup_bank: 'รอตรวจรอบ 2',
    followup_bank_date: '25/01/2026',
    sale_followup_task: 'ติดตามแก้งาน',
    followup_note: 'งานแก้ไข 5 รายการ รอช่างเสร็จ 23 ม.ค.',
    pm_fast_sent_date: null,
    cs_review_date: '13/01/2026',
    qc_result: 'แก้งาน 5 รายการ',
    con_review_result: 'รอแก้ไข',

    // 11. Finance
    refund_status: null,
    refund_aging: null,
    refund_transfer_date: null,
    refund_amount: null,
    water_meter_change_date: null,
    electricity_meter_change_date: null,
    handover_document_received_date: null,
    cannot_transfer_issue: null,
    expected_transfer_month: 'ม.ค.',
    fin_day_appointment_date: null,

    // 12. KPI
    aging_days: 53,
    m2_bureau_to_handover_days: 30,
    call_customer_within_2_days: 'PASS',
    inspection_within_15_days: 'PASS',
    booking_to_preapprove_days: 23,
    booking_to_bank_final_days: 29,
    docsubmit_to_bank_final_days: 19,
    booking_to_bureau_days: 16,
    efficiency_cycle_status: 'Booking → Transfer > 30 Days',
    ahead_delay_days: -7,
    backlog_grade: 'B',

    // 13. Management
    backlog_owner: 'พี่เหน่ง',
    transfer_target_status: 'โอนเดือนนี้',
    credit_day_status: 'อนุมัติแล้ว',
    product_status: 'รอแก้งาน',
    contract_transfer_due_date: '30 วันหลังทำสัญญา',
    transferred_actual_flag: false,

    // 14. Management Weekly Tracking
    mgmt_status: 'LivNex',
    mgmt_responsible: 'CS - สมชาย',
    mgmt_remark: 'WK4: แก้งาน 5 รายการ รอช่าง คาดเสร็จ 23/1',

    // Computed
    stage: 'inspection',
    current_owner_team: 'Construction',
    current_blocker: 'รอแก้งาน 5 รายการ',
    next_action: 'ตรวจรอบ 2 วันที่ 25 ม.ค.',
  },

  {
    id: 'BK-2025-1201-004',

    // 1. Backlog
    backlog_status: '4. Ready to Transfer',
    backlog_old_flag: false,
    sale_type_flag: 'ขายใหม่',
    dec_period: 'DEC',
    fiscal_year: 1403,
    no_count_flag: false,
    obj_purchase: 'เพื่ออยู่อาศัย',
    OPM: 'CH3 - คุณสุภา',
    BUD: 'H1 - คุณวิชัย',
    head_co: 'ภาวิณีย์',

    // 2. Project
    project_code: '1800',
    project_name: '01800 - เสนา เวล่า สิริโสธร',
    row_no: 4,
    building_zone: 'C',
    unit_no: '25',
    house_reg_no: '25/3',
    house_type: 'Euro',

    // 3. Booking/Contract
    booking_date: '01/12/2025',
    contract_date: '08/12/2025',
    net_contract_value: 2100000,
    aging_N_minus_U: 62,
    pro_transfer_bonus: 18200,
    reason_not_transfer_this_month: null,

    // 4. Customer
    customer_name: 'นายสมศักดิ์ พงษ์ประเสริฐ',
    customer_tel: '086-789-1234',
    customer_profile_text: 'Book Date : 1 ธ.ค.2568\nรายได้ 120,000 บาท/เดือน\nไม่มีภาระ\nขอสินเชื่อ BBL',
    customer_age: 42,
    customer_age_range: '40-50',
    customer_occupation: 'ข้าราชการ',
    customer_monthly_income: 120000,
    customer_debt: 'ไม่มี',
    customer_ltv: '85%',
    purchase_reason: 'ทำเล / ใกล้โรงเรียน',
    purchase_objective: 'เพื่ออยู่อาศัย',

    // 5. Sale
    sale_name: 'รัตนา เพชรดี',
    booking_type: 'เงินสด',
    sale_type: 'เงินสด',
    down_payment_complete_date: '01/12/2025',
    credit_request_type: 'สินเชื่อธนาคาร',
    banks_submitted: [
      { bank: 'BBL', submit_date: '10/12/2025', preapprove_date: '18/12/2025', preapprove_result: 'อนุมัติ - ไม่มีเงื่อนไข', result: 'อนุมัติ - เต็มวงเงิน', result_date: '25/12/2025', approved_amount: 1785000, remark: 'ข้าราชการ อนุมัติไว' },
      { bank: 'SCB', submit_date: '10/12/2025', preapprove_date: '20/12/2025', preapprove_result: 'อนุมัติ - ไม่เต็มจำนวน', result: 'อนุมัติ - ไม่เต็มวงเงิน', result_date: '28/12/2025', approved_amount: 1700000, remark: 'วงเงินต่ำกว่า BBL เล็กน้อย' },
      { bank: 'Proptiane', submit_date: '10/12/2025', preapprove_date: null, preapprove_result: null, result: 'อนุมัติ - ไม่มีเงื่อนไข', result_date: '22/12/2025', approved_amount: null, remark: null }
    ],
    selected_bank: 'BBL',

    // 6. Credit
    credit_status: 'อนุมัติแล้ว',
    credit_owner: '1.2) วิลาวัณย์ (อุ๊)',
    doc_submit_date: '10/12/2025',
    doc_complete_bank_jd_date: '12/12/2025',
    doc_complete_jd_date: '15/12/2025',
    bank_request_more_doc_date: null,
    jd_request_more_doc_date: null,
    bureau_target_result_date: '17/12/2025',
    bureau_target_result_date_biz: '16/12/2025',
    bureau_actual_result_date: '16/12/2025',
    bureau_result: 'บูโรปกติ - ไม่มีหนี้',
    bank_preapprove_target_date: '22/12/2025',
    bank_preapprove_target_date_biz: '19/12/2025',
    bank_preapprove_actual_date: '20/12/2025',
    bank_preapprove_result: 'อนุมัติ - ไม่มีเงื่อนไข',
    bank_final_target_date: '28/12/2025',
    bank_final_target_date_biz: '26/12/2025',
    bank_final_actual_date: '26/12/2025',
    bank_final_result: 'อนุมัติ - เต็มวงเงิน',
    jd_final_target_date: '02/01/2026',
    jd_final_actual_date: '30/12/2025',
    jd_final_result: 'อนุมัติ - ไม่มีเงื่อนไข',
    co_remark: 'ข้าราชการ ประวัติดี อนุมัติไว',

    // 7. Inspection
    inspection_status: 'ผ่านแล้ว',
    inspection_appointment_status: 'นัดแล้ว',
    notify_customer_date: '10/12/2025',
    inspection_method: 'ตรวจเอง',
    hired_inspector: null,
    unit_ready_inspection_date: '15/12/2025',
    cs_notify_target_date: '16/12/2025',
    inspect1_notify_target_date: '14/12/2025',
    inspect1_notify_target_date_biz: '12/12/2025',
    inspect1_notify_date: '16/12/2025',
    inspect1_appointment_date: '22/12/2025',
    inspect1_actual_date: '22/12/2025',
    inspect1_result: 'ผ่าน',
    inspect1_ready_date: '05/01/2026',
    inspect2_ready_target_date: null,
    inspect2_ready_target_date_biz: null,
    inspect2_ready_date: null,
    inspect2_appointment_date: null,
    inspect2_actual_date: null,
    inspect2_result: null,
    inspect3_ready_target_date: null,
    inspect3_ready_target_date_biz: null,
    inspect3_ready_date: null,
    inspect3_appointment_date: null,
    inspect3_actual_date: null,
    inspect3_result: null,
    handover_accept_date: '05/01/2026',
    inspection_officer: 'ประวิทย์ (เอ็ม)',
    cs_owner: 'มานพ / ศิริพร',

    // 8. Transfer
    bank_contract_date: '08/01/2026',
    transfer_package_sent_date: '10/01/2026',
    title_clear_date: '15/01/2026',
    title_clear_notify_date: '15/01/2026',
    transfer_target_date: '25/01/2026',
    transfer_upside_flag: 'Upside',
    transfer_actual_date: null,
    transfer_appointment_date: '25/01/2026',
    transfer_status: 'In process',
    cancel_flag: false,
    cancel_date: null,
    cancel_reason: null,

    // 9. LivNex
    livnex_able_status: 'ON Hand Sale',
    livnex_case_receive_date: '12/01/2026',
    livnex_credit_status: '10. อนุมัติ นัดแล้วรอดำเนินการ',
    livnex_contract_sign_status: '16 Feb 2026',
    livnex_move_in_date: '15 Feb 2026',
    livnex_able_reason: 'อนุมัติ - ไม่มีเงื่อนไข',
    livnex_followup_note: '12/01/69 ลูกค้าแจ้งขอรอเงินจากการทำงานก่อน ภายใน 31/1/2026',
    livnex_able_completion_result: 'ปฏิเสธ',
    livnex_complete_date: null,
    sale_offer_livnex_flag: true,
    livnex_present_date: '08/01/2026',
    livnex_contract_appointment_date: null,
    livnex_contract_actual_date: null,
    livnex_cancel_date: null,
    livnex_cancel_reason: 'ลูกค้าไม่สนใจ',
    pre_livnex_present_date: null,
    pre_livnex_contract_appointment_date: null,
    pre_livnex_cancel_date: null,
    pre_livnex_cancel_reason: null,

    // 10. Follow-up
    followup_bank: 'นัดโอน 25 ม.ค.',
    followup_bank_date: '25/01/2026',
    sale_followup_task: 'ยืนยันนัดโอน',
    followup_note: 'ลูกค้ายืนยันมาโอนแน่นอน',
    pm_fast_sent_date: null,
    cs_review_date: '06/01/2026',
    qc_result: 'QC.Pass',
    con_review_result: 'Pass',

    // 11. Finance
    refund_status: null,
    refund_aging: null,
    refund_transfer_date: null,
    refund_amount: null,
    water_meter_change_date: null,
    electricity_meter_change_date: null,
    handover_document_received_date: null,
    cannot_transfer_issue: null,
    expected_transfer_month: 'ม.ค.',
    fin_day_appointment_date: '25/01/2026',

    // 12. KPI
    aging_days: 55,
    m2_bureau_to_handover_days: 20,
    call_customer_within_2_days: 'PASS',
    inspection_within_15_days: 'PASS',
    booking_to_preapprove_days: 19,
    booking_to_bank_final_days: 25,
    docsubmit_to_bank_final_days: 16,
    booking_to_bureau_days: 15,
    efficiency_cycle_status: 'Booking → Transfer > 30 Days',
    ahead_delay_days: 0,
    backlog_grade: 'A',

    // 13. Management
    backlog_owner: 'พี่ต้น',
    transfer_target_status: 'โอนเดือนนี้',
    credit_day_status: 'อนุมัติแล้ว',
    product_status: 'พร้อมโอน',
    contract_transfer_due_date: '30 วันหลังทำสัญญา',
    transferred_actual_flag: false,

    // 14. Management Weekly Tracking
    mgmt_status: 'in process',
    mgmt_responsible: 'Legal - นิติกรรม',
    mgmt_remark: 'WK4: นัดโอน 25/1 ลูกค้ายืนยันแล้ว',

    // Computed
    stage: 'ready',
    current_owner_team: 'Legal',
    current_blocker: null,
    next_action: 'นัดโอน 25 ม.ค.',
  },

  {
    id: 'BK-2025-1115-005',

    // 1. Backlog
    backlog_status: '5. Transferred',
    backlog_old_flag: false,
    sale_type_flag: 'ขายใหม่',
    dec_period: 'NOV',
    fiscal_year: 1403,
    no_count_flag: false,
    obj_purchase: 'เพื่ออยู่อาศัย',
    OPM: 'CH2 - คุณสมชาย',
    BUD: 'H2 - คุณเอกกฤษณ์',
    head_co: 'ภาวิณีย์',

    // 2. Project
    project_code: '1801',
    project_name: '01801 - เสนา พาร์ค แกรนด์ รามอินทรา',
    row_no: 5,
    building_zone: 'D',
    unit_no: '102',
    house_reg_no: '102/8',
    house_type: 'Modern',

    // 3. Booking/Contract
    booking_date: '15/11/2025',
    contract_date: '22/11/2025',
    net_contract_value: 5200000,
    aging_N_minus_U: 0,
    pro_transfer_bonus: 45000,
    reason_not_transfer_this_month: null,

    // 4. Customer
    customer_name: 'นายธนกฤต อัครเดชา',
    customer_tel: '092-345-6789',
    customer_profile_text: 'Book Date : 15 พ.ย.2568\nรายได้ 200,000 บาท/เดือน\nไม่มีภาระ\nขอสินเชื่อ TTB',
    customer_age: 38,
    customer_age_range: '30-40',
    customer_occupation: 'ผู้บริหาร',
    customer_monthly_income: 200000,
    customer_debt: 'ไม่มี',
    customer_ltv: '80%',
    purchase_reason: 'ทำเล / สิ่งแวดล้อม',
    purchase_objective: 'เพื่ออยู่อาศัย',

    // 5. Sale
    sale_name: 'อรุณี แสงทอง',
    booking_type: 'ผ่อนดาวน์',
    sale_type: 'เงินสด',
    down_payment_complete_date: '15/11/2025',
    credit_request_type: 'สินเชื่อธนาคาร',
    banks_submitted: [
      { bank: 'TTB', submit_date: '25/11/2025', preapprove_date: '03/12/2025', preapprove_result: 'อนุมัติ - ไม่มีเงื่อนไข', result: 'อนุมัติ - เต็มวงเงิน', result_date: '12/12/2025', approved_amount: 4160000, remark: 'VIP ผู้บริหาร' },
      { bank: 'KBANK', submit_date: '25/11/2025', preapprove_date: '04/12/2025', preapprove_result: 'อนุมัติ - ไม่เต็มจำนวน', result: 'อนุมัติ - ไม่เต็มวงเงิน', result_date: '13/12/2025', approved_amount: 4000000, remark: null },
      { bank: 'Proptiane', submit_date: '25/11/2025', preapprove_date: null, preapprove_result: null, result: 'อนุมัติ - ไม่มีเงื่อนไข', result_date: '14/12/2025', approved_amount: null, remark: null }
    ],
    selected_bank: 'TTB',

    // 6. Credit
    credit_status: 'โอนแล้ว',
    credit_owner: '1.1) สมหญิง (หญิง)',
    doc_submit_date: '25/11/2025',
    doc_complete_bank_jd_date: '27/11/2025',
    doc_complete_jd_date: '29/11/2025',
    bank_request_more_doc_date: null,
    jd_request_more_doc_date: null,
    bureau_target_result_date: '02/12/2025',
    bureau_target_result_date_biz: '01/12/2025',
    bureau_actual_result_date: '01/12/2025',
    bureau_result: 'บูโรปกติ - ไม่มีหนี้',
    bank_preapprove_target_date: '07/12/2025',
    bank_preapprove_target_date_biz: '05/12/2025',
    bank_preapprove_actual_date: '05/12/2025',
    bank_preapprove_result: 'อนุมัติ - ไม่มีเงื่อนไข',
    bank_final_target_date: '15/12/2025',
    bank_final_target_date_biz: '12/12/2025',
    bank_final_actual_date: '12/12/2025',
    bank_final_result: 'อนุมัติ - เต็มวงเงิน',
    jd_final_target_date: '20/12/2025',
    jd_final_actual_date: '18/12/2025',
    jd_final_result: 'อนุมัติ - ไม่มีเงื่อนไข',
    co_remark: 'ลูกค้า VIP ผู้บริหาร ประวัติดีเยี่ยม',

    // 7. Inspection
    inspection_status: 'โอนแล้ว',
    inspection_appointment_status: 'นัดแล้ว',
    notify_customer_date: '20/11/2025',
    inspection_method: 'จ้างตรวจ',
    hired_inspector: 'คุณสมชาย (ช่างอิสระ)',
    unit_ready_inspection_date: '01/12/2025',
    cs_notify_target_date: '02/12/2025',
    inspect1_notify_target_date: '30/11/2025',
    inspect1_notify_target_date_biz: '28/11/2025',
    inspect1_notify_date: '02/12/2025',
    inspect1_appointment_date: '08/12/2025',
    inspect1_actual_date: '08/12/2025',
    inspect1_result: 'ผ่าน',
    inspect1_ready_date: '20/12/2025',
    inspect2_ready_target_date: null,
    inspect2_ready_target_date_biz: null,
    inspect2_ready_date: null,
    inspect2_appointment_date: null,
    inspect2_actual_date: null,
    inspect2_result: null,
    inspect3_ready_target_date: null,
    inspect3_ready_target_date_biz: null,
    inspect3_ready_date: null,
    inspect3_appointment_date: null,
    inspect3_actual_date: null,
    inspect3_result: null,
    handover_accept_date: '20/12/2025',
    inspection_officer: 'สุรสิทธิ์ (โต้ง)',
    cs_owner: 'สุรศักดิ์ / กาญจนา',

    // 8. Transfer
    bank_contract_date: '22/12/2025',
    transfer_package_sent_date: '23/12/2025',
    title_clear_date: '27/12/2025',
    title_clear_notify_date: '27/12/2025',
    transfer_target_date: '30/12/2025',
    transfer_upside_flag: null,
    transfer_actual_date: '28/12/2025',
    transfer_appointment_date: '28/12/2025',
    transfer_status: 'Transferred',
    cancel_flag: false,
    cancel_date: null,
    cancel_reason: null,

    // 9. LivNex
    livnex_able_status: 'ON Hand Sale',
    livnex_case_receive_date: null,
    livnex_credit_status: 'ไม่มีข้อมูลใน REM Livnex',
    livnex_contract_sign_status: null,
    livnex_move_in_date: null,
    livnex_able_reason: null,
    livnex_followup_note: null,
    livnex_able_completion_result: 'ทำสัญญาแล้ว',
    livnex_complete_date: '25/12/2025',
    sale_offer_livnex_flag: true,
    livnex_present_date: '20/12/2025',
    livnex_contract_appointment_date: '24/12/2025',
    livnex_contract_actual_date: '25/12/2025',
    livnex_cancel_date: null,
    livnex_cancel_reason: null,
    pre_livnex_present_date: '18/12/2025',
    pre_livnex_contract_appointment_date: null,
    pre_livnex_cancel_date: null,
    pre_livnex_cancel_reason: null,

    // 10. Follow-up
    followup_bank: 'โอนแล้ว',
    followup_bank_date: '28/12/2025',
    sale_followup_task: null,
    followup_note: 'โอนเรียบร้อย เร็วกว่ากำหนด',
    pm_fast_sent_date: null,
    cs_review_date: '21/12/2025',
    qc_result: 'QC.Pass',
    con_review_result: 'Pass',

    // 11. Finance
    refund_status: null,
    refund_aging: null,
    refund_transfer_date: null,
    refund_amount: null,
    water_meter_change_date: '29/12/2025',
    electricity_meter_change_date: '29/12/2025',
    handover_document_received_date: '28/12/2025',
    cannot_transfer_issue: null,
    expected_transfer_month: 'ธ.ค.',
    fin_day_appointment_date: '28/12/2025',

    // 12. KPI
    aging_days: 43,
    m2_bureau_to_handover_days: 19,
    call_customer_within_2_days: 'PASS',
    inspection_within_15_days: 'PASS',
    booking_to_preapprove_days: 20,
    booking_to_bank_final_days: 27,
    docsubmit_to_bank_final_days: 17,
    booking_to_bureau_days: 16,
    efficiency_cycle_status: 'Completed < 45 Days',
    ahead_delay_days: 2,
    backlog_grade: 'A',

    // 13. Management
    backlog_owner: null,
    transfer_target_status: 'โอนแล้ว',
    credit_day_status: 'โอนแล้ว',
    product_status: 'โอนแล้ว',
    contract_transfer_due_date: '30 วันหลังทำสัญญา',
    transferred_actual_flag: true,

    // 14. Management Weekly Tracking
    mgmt_status: 'โอน',
    mgmt_responsible: 'Finance',
    mgmt_remark: 'WK4: โอนเรียบร้อย 28/12 เร็วกว่ากำหนด',

    // Computed
    stage: 'transferred',
    current_owner_team: 'Finance',
    current_blocker: null,
    next_action: null,
  },
];

// ===============================================
// GENERATE BULK BOOKINGS FOR ~6,000 MILLION BACKLOG
// ===============================================
const PROJECT_NAMES = [
  '01800 - เสนา เวล่า สิริโสธร',
  '01801 - เสนา พาร์ค แกรนด์ รามอินทรา',
  '01802 - เสนา โซลาร์ พหลโยธิน',
  '01803 - เสนา เอโค่ บางนา',
  '01804 - เสนา คอนโด วงเวียนใหญ่',
  '01805 - เสนา ทาวน์ รังสิต',
  '01806 - เสนา วิลล่า สุขุมวิท',
  '01807 - เสนา เพลส ลาดพร้าว',
  '01808 - เสนา ไลฟ์ บางปู',
  '01809 - เสนา เรสซิเดนซ์ อารีย์',
];

const CUSTOMER_NAMES = [
  'นายสมชาย ใจดี', 'นางสาวสมหญิง รักเรียน', 'นายวิชัย มั่งมี', 'นางมาลี สุขสันต์',
  'นายประสิทธิ์ ทำดี', 'นางสาวพิมพ์ใจ งามตา', 'นายอภิชาติ รุ่งเรือง', 'นางสาวณัฐธิดา สว่างใส',
  'นายธนากร ศรีสุข', 'นางวารี ชื่นใจ', 'นายกิตติ พงษ์พานิช', 'นางสาวรัตนา แก้วมณี',
  'นายพิชัย เจริญสุข', 'นางบุญมี ศรีทอง', 'นายเอกชัย วงศ์สกุล', 'นางสาวอรุณี จันทร์เพ็ญ',
];

const SALE_NAMES = ['สกุลกาญจน์ ชินพราหมณ์', 'นภาพร วงศ์สกุล', 'ศิริพร แก้วใส', 'มานพ ดีเด่น', 'พัชรี สุขสันต์'];
const GEN_BANKS: BankCode[] = ['SCB', 'KBANK', 'BBL', 'KTB', 'TTB', 'UOB', 'Proptiane'];
const STAGES_LIST: Stage[] = ['booking', 'contract', 'credit', 'inspection', 'ready'];
const GRADES: Grade[] = ['A', 'B', 'C', 'D', 'F'];
const TEAMS_LIST: Team[] = ['Sale', 'CO', 'CS', 'Construction', 'Legal', 'Finance'];

// Helper function to generate random banks (1-3) - always includes Proptiane
function generateBankSubmissions(price: number, hasBankFinal: boolean, hasBureauResult: boolean): BankSubmission[] {
  // Generate exactly 5 banks (not including Proptiane)
  const numberOfBanks = 5;
  const selectedBanks: BankCode[] = [];

  // Randomly select 5 banks without duplicates
  const availableBanks = [...GEN_BANKS].filter(b => b !== 'Proptiane');
  for (let i = 0; i < numberOfBanks && availableBanks.length > 0; i++) {
    const idx = Math.floor(seededRandom.next() * availableBanks.length);
    selectedBanks.push(availableBanks.splice(idx, 1)[0]);
  }

  // Always add Proptiane at the end
  selectedBanks.push('Proptiane');

  return selectedBanks.map((bank, index) => {
    // First bank is primary - most likely to be approved
    const isPrimary = index === 0;
    const isJaidee = bank === 'Proptiane';
    let result: string | null = 'รอผล';
    let approvedAmount: number | null = null;

    const APPROVE_RESULTS = ['อนุมัติ - เต็มวงเงิน', 'อนุมัติ - ไม่เต็มวงเงิน', 'อนุมัติ - ต้องซื้อพ่วง', 'อนุมัติ - มีประวัติค้างชำระ'];
    const REJECT_RESULTS = ['ไม่อนุมัติ - DSR เกิน', 'ไม่อนุมัติ - รายได้ไม่เพียงพอ', 'ไม่อนุมัติ - ขอธนาคารอื่น', 'ไม่อนุมัติ - ขอยก case'];

    if (hasBankFinal && isPrimary) {
      result = APPROVE_RESULTS[Math.floor(seededRandom.next() * APPROVE_RESULTS.length)];
      approvedAmount = Math.round(price * (0.85 + seededRandom.next() * 0.1));
    } else if (hasBureauResult) {
      const r = seededRandom.next();
      if (r > 0.3) {
        result = APPROVE_RESULTS[Math.floor(seededRandom.next() * APPROVE_RESULTS.length)];
        approvedAmount = Math.round(price * (0.75 + seededRandom.next() * 0.15));
      } else if (r > 0.15) {
        result = REJECT_RESULTS[Math.floor(seededRandom.next() * REJECT_RESULTS.length)];
      } else {
        result = 'รอผล';
      }
    }

    // Jaidee (JD): ไม่มีวงเงิน — อนุมัติเข้าโครงการ LivNex/Pre-LivNex
    if (isJaidee && hasBureauResult) {
      const JD_APPROVE = ['อนุมัติ - ไม่มีเงื่อนไข', 'อนุมัติ - แต่ต้องเพิ่มเงินหาร', 'อนุมัติ - แต่ต้องเพิ่มผู้กู้', 'อนุมัติ - แต่ทำกู้ร่วม'];
      const JD_REJECT = ['ไม่อนุมัติ - DSR ไม่ผ่าน', 'ไม่อนุมัติ - ยื่นซ้ำ', 'ไม่อนุมัติ - มีบัญชีสินเชื่อค้างชำระ 2 บัญชีขึ้นไป', 'ไม่อนุมัติ'];
      const r = seededRandom.next();
      if (r > 0.3) {
        result = JD_APPROVE[Math.floor(seededRandom.next() * JD_APPROVE.length)];
      } else if (r > 0.15) {
        result = JD_REJECT[Math.floor(seededRandom.next() * JD_REJECT.length)];
      } else {
        result = 'รอผล';
      }
      approvedAmount = null; // JD ไม่มีวงเงิน
    }

    // Pre-approve: generate if bureau passed (JD ไม่มีเบื้องต้น)
    let preapproveDate: string | null = null;
    let preapproveResult: string | null = null;
    let resultDate: string | null = null;

    if (hasBureauResult && !isJaidee) {
      preapproveDate = '25/01/2026';
      const r = seededRandom.next();
      preapproveResult = r > 0.25
        ? ['อนุมัติ - ไม่มีเงื่อนไข', 'อนุมัติ - มีหนี้', 'อนุมัติ - ไม่เต็มจำนวน', 'อนุมัติ'][Math.floor(seededRandom.next() * 4)]
        : ['ไม่อนุมัติ - ขอธนาคารอื่น', 'ไม่อนุมัติ - ขอยกเลิก'][Math.floor(seededRandom.next() * 2)];
    }

    if (result && result !== 'รอผล') {
      resultDate = '02/02/2026';
    }

    return {
      bank,
      submit_date: '20/01/2026',
      preapprove_date: preapproveDate,
      preapprove_result: preapproveResult,
      result,
      result_date: resultDate,
      approved_amount: approvedAmount,
      remark: null
    };
  });
}

function generateBulkBookings(): Booking[] {
  // Reset seed ให้เริ่มต้นที่ค่าเดิมเสมอ
  seededRandom.reset(12345);

  const generated: Booking[] = [];
  const targetBacklog = 6000000000; // 6,000 million baht
  let currentTotal = 0;
  let id = 100;

  // Price ranges - Luxury villas ~100 million each
  const priceRanges = [
    { min: 80000000, max: 120000000, weight: 70 },   // Luxury villas ~100M
    { min: 50000000, max: 80000000, weight: 20 },    // Premium houses ~65M
    { min: 30000000, max: 50000000, weight: 10 },    // High-end townhouses ~40M
  ];

  while (currentTotal < targetBacklog) {
    // Select price range based on weight
    const rand = seededRandom.next() * 100;
    let cumWeight = 0;
    let selectedRange = priceRanges[0];
    for (const range of priceRanges) {
      cumWeight += range.weight;
      if (rand <= cumWeight) {
        selectedRange = range;
        break;
      }
    }

    const price = Math.round((selectedRange.min + seededRandom.next() * (selectedRange.max - selectedRange.min)) / 1000000) * 1000000;
    const stage = STAGES_LIST[Math.floor(seededRandom.next() * STAGES_LIST.length)];
    const grade = GRADES[Math.floor(seededRandom.next() * GRADES.length)];
    const project = PROJECT_NAMES[Math.floor(seededRandom.next() * PROJECT_NAMES.length)];
    const customerName = CUSTOMER_NAMES[Math.floor(seededRandom.next() * CUSTOMER_NAMES.length)];
    const saleName = SALE_NAMES[Math.floor(seededRandom.next() * SALE_NAMES.length)];
    const team = TEAMS_LIST[Math.floor(seededRandom.next() * TEAMS_LIST.length)];

    // Determine credit status based on stage
    const hasBureauResult = stage === 'inspection' || stage === 'ready' || seededRandom.next() > 0.5;
    const hasBankFinal = stage === 'ready' || (stage === 'inspection' && seededRandom.next() > 0.3);

    // Generate multi-bank submissions (1-3 banks)
    const isCash = seededRandom.next() > 0.85; // 15% cash
    const banksSubmitted = isCash
      ? [{ bank: 'CASH' as BankCode, submit_date: null, preapprove_date: null, preapprove_result: null, result: 'อนุมัติ - เงินสด', result_date: null, approved_amount: price, remark: 'โอนสด' }]
      : generateBankSubmissions(price, hasBankFinal, hasBureauResult);

    // Inspection appointments based on stage
    const hasInspect1 = stage === 'inspection' || stage === 'ready';
    const hasInspect2 = (stage === 'inspection' && seededRandom.next() > 0.6) || stage === 'ready';
    const hasInspect3 = stage === 'ready' && seededRandom.next() > 0.5;

    const booking: Booking = {
      id: `BK-2026-GEN-${String(id++).padStart(4, '0')}`,

      // 1. Backlog
      backlog_status: grade === 'A' ? '1. พร้อมโอน' : grade === 'B' ? '2. รอสินเชื่อ' : '3. backlog เดิม',
      backlog_old_flag: seededRandom.next() > 0.7,
      sale_type_flag: seededRandom.next() > 0.2 ? 'ขายใหม่' : 'Re-sale',
      dec_period: ['JAN', 'FEB', 'MAR'][Math.floor(seededRandom.next() * 3)],
      fiscal_year: 1403,
      no_count_flag: false,
      obj_purchase: seededRandom.next() > 0.3 ? 'เพื่ออยู่อาศัย' : 'ลงทุน',
      OPM: 'CH1 - คุณธานินทร์',
      BUD: 'H2 - คุณเอกกฤษณ์',
      head_co: 'ภาวิณีย์',

      // 2. Project
      project_code: project.split(' - ')[0].replace('0', ''),
      project_name: project,
      row_no: id,
      building_zone: ['A', 'B', 'C', 'D', 'E'][Math.floor(seededRandom.next() * 5)],
      unit_no: String(Math.floor(seededRandom.next() * 200) + 1),
      house_reg_no: `${Math.floor(seededRandom.next() * 200) + 1}/${Math.floor(seededRandom.next() * 50) + 1}`,
      house_type: ['Euro', 'Modern', 'Classic', 'Contemporary'][Math.floor(seededRandom.next() * 4)],

      // 3. Booking/Contract
      booking_date: '15/01/2026',
      contract_date: stage !== 'booking' ? '22/01/2026' : null,
      net_contract_value: price,
      aging_N_minus_U: Math.floor(seededRandom.next() * 60) + 10,
      pro_transfer_bonus: Math.round(price * 0.008),
      reason_not_transfer_this_month: seededRandom.next() > 0.5 ? 'รอผลอนุมัติธนาคาร' : null,

      // 4. Customer
      customer_name: customerName,
      customer_tel: `08${Math.floor(seededRandom.next() * 10)}-${String(Math.floor(seededRandom.next() * 1000)).padStart(3, '0')}-${String(Math.floor(seededRandom.next() * 10000)).padStart(4, '0')}`,
      customer_profile_text: `Book Date : 15 ม.ค.2569\nรายได้ ${Math.floor(price / 100).toLocaleString()} บาท/เดือน`,
      customer_age: Math.floor(seededRandom.next() * 30) + 25,
      customer_age_range: ['25-30', '30-40', '40-50', '50-60'][Math.floor(seededRandom.next() * 4)],
      customer_occupation: ['พนักงานบริษัท', 'ข้าราชการ', 'ค้าขาย', 'ธุรกิจส่วนตัว'][Math.floor(seededRandom.next() * 4)],
      customer_monthly_income: Math.floor(price / 100),
      customer_debt: seededRandom.next() > 0.6 ? 'ไม่มี' : `${Math.floor(seededRandom.next() * 20000)} บาท/เดือน`,
      customer_ltv: isCash ? 'N/A' : '90%',
      purchase_reason: 'ทำเล / ราคา',
      purchase_objective: 'เพื่ออยู่อาศัย',

      // 5. Sale
      sale_name: saleName,
      booking_type: isCash ? 'เงินสด' : 'ผ่อนดาวน์',
      sale_type: 'ผ่อนดาวน์',
      down_payment_complete_date: '15/03/2026',
      credit_request_type: isCash ? 'โอนสด' : 'สินเชื่อธนาคาร',
      banks_submitted: banksSubmitted,
      selected_bank: (() => {
        const approvedBanks = banksSubmitted.filter(bs => bs.result?.includes('อนุมัติ') && !bs.result?.includes('ไม่อนุมัติ') && bs.bank !== 'Proptiane');
        if (approvedBanks.length > 0) return approvedBanks[Math.floor(seededRandom.next() * approvedBanks.length)].bank;
        return null;
      })(),

      // 6. Credit
      credit_status: hasBankFinal ? 'อนุมัติแล้ว' : hasBureauResult ? 'รอผลธนาคาร' : 'รอผล Bureau',
      credit_owner: '1.1) สมหญิง (หญิง)',
      doc_submit_date: stage !== 'booking' ? '20/01/2026' : null,
      doc_complete_bank_jd_date: stage !== 'booking' ? '23/01/2026' : null,
      doc_complete_jd_date: null,
      bank_request_more_doc_date: null,
      jd_request_more_doc_date: null,
      bureau_target_result_date: '28/01/2026',
      bureau_target_result_date_biz: '27/01/2026',
      bureau_actual_result_date: hasBureauResult ? '27/01/2026' : null,
      bureau_result: hasBureauResult ? ['บูโรปกติ - ไม่มีหนี้', 'บูโรปกติ - มีหนี้'][Math.floor(seededRandom.next() * 2)] : null,
      bank_preapprove_target_date: '05/02/2026',
      bank_preapprove_target_date_biz: '04/02/2026',
      bank_preapprove_actual_date: hasBureauResult ? '03/02/2026' : null,
      bank_preapprove_result: hasBureauResult ? ['อนุมัติ - ไม่มีเงื่อนไข', 'อนุมัติ - มีหนี้', 'อนุมัติ - ต้องมีผู้กู้ร่วม', 'อนุมัติ'][Math.floor(seededRandom.next() * 4)] : null,
      bank_final_target_date: '15/02/2026',
      bank_final_target_date_biz: '13/02/2026',
      bank_final_actual_date: hasBankFinal ? '12/02/2026' : null,
      bank_final_result: hasBankFinal ? ['อนุมัติ - เต็มวงเงิน', 'อนุมัติ - ไม่เต็มวงเงิน', 'อนุมัติ - ต้องซื้อพ่วง'][Math.floor(seededRandom.next() * 3)] : null,
      jd_final_target_date: hasBankFinal ? '20/02/2026' : null,
      jd_final_actual_date: hasBankFinal ? '18/02/2026' : null,
      jd_final_result: hasBankFinal ? ['อนุมัติ - ไม่มีเงื่อนไข', 'อนุมัติ - แต่ต้องเพิ่มเงินหาร', 'อนุมัติ - แต่ทำกู้ร่วม'][Math.floor(seededRandom.next() * 3)] : null,
      co_remark: null,

      // 7. Inspection
      inspection_status: hasInspect1 ? (hasInspect3 ? 'ผ่านแล้ว' : 'รอแก้งาน') : 'รอนัดตรวจ',
      inspection_appointment_status: hasInspect1 ? 'นัดแล้ว' : 'รอนัด',
      notify_customer_date: hasInspect1 ? '01/02/2026' : null,
      inspection_method: seededRandom.next() > 0.5 ? 'ตรวจเอง' : 'จ้างตรวจ',
      hired_inspector: seededRandom.next() > 0.5 ? null : ['บ.ตรวจบ้านมืออาชีพ', 'Home Check Pro', 'คุณวิชัย (ช่างอิสระ)', 'QC House Co.'][Math.floor(seededRandom.next() * 4)],
      unit_ready_inspection_date: '05/02/2026',
      cs_notify_target_date: '07/02/2026',
      inspect1_notify_target_date: '05/02/2026',
      inspect1_notify_target_date_biz: '04/02/2026',
      inspect1_notify_date: hasInspect1 ? '07/02/2026' : null,
      inspect1_appointment_date: hasInspect1 ? '12/02/2026' : null,
      inspect1_actual_date: hasInspect1 ? '12/02/2026' : null,
      inspect1_result: hasInspect1 ? (hasInspect2 ? 'ไม่ผ่าน' : 'ผ่าน') : null,
      inspect1_ready_date: hasInspect2 ? '20/02/2026' : null,
      inspect2_ready_target_date: hasInspect2 ? '18/02/2026' : null,
      inspect2_ready_target_date_biz: hasInspect2 ? '17/02/2026' : null,
      inspect2_ready_date: hasInspect2 ? '20/02/2026' : null,
      inspect2_appointment_date: hasInspect2 ? '25/02/2026' : null,
      inspect2_actual_date: hasInspect2 ? '25/02/2026' : null,
      inspect2_result: hasInspect2 ? (hasInspect3 ? 'ไม่ผ่าน' : 'ผ่าน') : null,
      inspect3_ready_target_date: hasInspect3 ? '28/02/2026' : null,
      inspect3_ready_target_date_biz: hasInspect3 ? '27/02/2026' : null,
      inspect3_ready_date: hasInspect3 ? '01/03/2026' : null,
      inspect3_appointment_date: hasInspect3 ? '05/03/2026' : null,
      inspect3_actual_date: hasInspect3 ? '05/03/2026' : null,
      inspect3_result: hasInspect3 ? 'ผ่าน' : null,
      handover_accept_date: stage === 'ready' ? '08/03/2026' : null,
      inspection_officer: 'ประวิทย์ (เอ็ม)',
      cs_owner: 'มานพ / ศิริพร',

      // 8. Transfer
      bank_contract_date: hasBankFinal ? '20/02/2026' : null,
      transfer_package_sent_date: stage === 'ready' ? '22/02/2026' : null,
      title_clear_date: stage === 'ready' ? '25/02/2026' : null,
      title_clear_notify_date: stage === 'ready' ? '26/02/2026' : null,
      transfer_target_date: '15/03/2026',
      transfer_upside_flag: stage === 'ready' ? 'Upside' : null,
      transfer_actual_date: null,
      transfer_appointment_date: stage === 'ready' ? '12/03/2026' : null,
      transfer_status: 'In process',
      cancel_flag: false,
      cancel_date: null,
      cancel_reason: null,

      // 9. LivNex - livnex_able_status = คุณสมบัติเข้าโครงการ LivNex ได้หรือไม่ (ตรวจตอนจอง)
      livnex_able_status: 'ON Hand Sale',
      livnex_case_receive_date: seededRandom.next() > 0.5 ? '20/01/2026' : null,
      livnex_credit_status: seededRandom.next() > 0.7 ? '11. เซ็นสัญญา Livnex' :
        (seededRandom.next() > 0.5 ? '05. JD ไม่อนุมัติ' : 'ไม่มีข้อมูลใน REM Livnex'),
      livnex_contract_sign_status: seededRandom.next() > 0.7 ? 'เซ็นสัญญาแล้ว นัดชำระเงิน' : null,
      livnex_move_in_date: seededRandom.next() > 0.8 ? '15 Feb 2026' : null,
      livnex_able_reason: seededRandom.next() > 0.6 ? 'อนุมัติ - ไม่มีเงื่อนไข' :
        (seededRandom.next() > 0.5 ? 'ไม่อนุมัติ - DSR เกิน' : null),
      livnex_followup_note: seededRandom.next() > 0.7 ? 'รอติดตามผลการพิจารณา' : null,
      livnex_able_completion_result: seededRandom.next() > 0.5 ? 'สนใจ' : 'ไม่สนใจ',
      livnex_complete_date: null,
      sale_offer_livnex_flag: seededRandom.next() > 0.3,
      livnex_present_date: seededRandom.next() > 0.5 ? '15/01/2026' : null,
      livnex_contract_appointment_date: null,
      livnex_contract_actual_date: null,
      livnex_cancel_date: null,
      livnex_cancel_reason: null,
      pre_livnex_present_date: seededRandom.next() > 0.6 ? '12/01/2026' : null,
      pre_livnex_contract_appointment_date: null,
      pre_livnex_cancel_date: null,
      pre_livnex_cancel_reason: null,

      // 10. Follow-up
      followup_bank: seededRandom.next() > 0.5 ? 'รอผล' : null,
      followup_bank_date: null,
      sale_followup_task: null,
      followup_note: null,
      pm_fast_sent_date: null,
      cs_review_date: null,
      qc_result: hasInspect1 ? 'QC.Pass' : null,
      con_review_result: hasInspect1 ? 'Pass' : null,

      // 11. Finance
      refund_status: null,
      refund_aging: null,
      refund_transfer_date: null,
      refund_amount: null,
      water_meter_change_date: null,
      electricity_meter_change_date: null,
      handover_document_received_date: null,
      cannot_transfer_issue: null,
      expected_transfer_month: 'มี.ค.',
      fin_day_appointment_date: null,

      // 12. KPI
      aging_days: Math.floor(seededRandom.next() * 50) + 15,
      m2_bureau_to_handover_days: hasBureauResult ? Math.floor(seededRandom.next() * 30) + 10 : null,
      call_customer_within_2_days: seededRandom.next() > 0.2 ? 'PASS' : 'FAIL',
      inspection_within_15_days: seededRandom.next() > 0.3 ? 'PASS' : 'FAIL',
      booking_to_preapprove_days: hasBureauResult ? Math.floor(seededRandom.next() * 20) + 10 : null,
      booking_to_bank_final_days: hasBankFinal ? Math.floor(seededRandom.next() * 30) + 20 : null,
      docsubmit_to_bank_final_days: hasBankFinal ? Math.floor(seededRandom.next() * 20) + 10 : null,
      booking_to_bureau_days: hasBureauResult ? Math.floor(seededRandom.next() * 15) + 5 : null,
      efficiency_cycle_status: grade === 'A' ? 'On Track' : 'Delayed',
      ahead_delay_days: grade === 'A' ? Math.floor(seededRandom.next() * 5) : -Math.floor(seededRandom.next() * 10),
      backlog_grade: grade,

      // 13. Management
      backlog_owner: seededRandom.next() > 0.5 ? 'พี่เหน่ง' : null,
      transfer_target_status: stage === 'ready' ? 'โอนเดือนนี้' : 'มีเงื่อนไขโอนเดือนอื่น',
      credit_day_status: hasBankFinal ? 'อนุมัติแล้ว' : 'In process',
      product_status: stage === 'ready' ? 'พร้อมโอน' : hasInspect1 ? 'รอแก้งาน' : 'รอตรวจ',
      contract_transfer_due_date: '30 วันหลังทำสัญญา',
      transferred_actual_flag: false,

      // 14. Management Weekly Tracking
      mgmt_status: stage === 'transferred' ? 'โอน' : 'in process',
      mgmt_responsible: stage === 'credit' ? 'CO, Sale' : (stage === 'inspection' ? 'CON, CS, CO' : 'Sale'),
      mgmt_remark: seededRandom.next() > 0.4 ? `WK4: ติดตามงาน ${stage === 'credit' ? 'รอผลธนาคาร' : 'รอนัดลูกค้า'}` : null,

      // Computed
      stage: stage,
      current_owner_team: team,
      current_blocker: seededRandom.next() > 0.7 ? 'รอผลธนาคาร' : null,
      next_action: stage === 'ready' ? 'นัดโอน' : stage === 'inspection' ? 'นัดตรวจ' : 'รอผลสินเชื่อ',
    };

    generated.push(booking);
    currentTotal += price;
  }

  return generated;
}

// Add generated bookings to main array
const generatedBookings = generateBulkBookings();
bookings.push(...generatedBookings);

// ===============================================
// HELPER FUNCTIONS
// ===============================================
export function formatMoney(n: number): string {
  return new Intl.NumberFormat('th-TH').format(n);
}

export function getBookingsByStage(stage: Stage): Booking[] {
  return bookings.filter(b => b.stage === stage);
}

export function getBookingsByTeam(team: Team): Booking[] {
  return bookings.filter(b =>
    b.current_owner_team === team &&
    b.stage !== 'transferred' &&
    b.stage !== 'cancelled'
  );
}

export function getBlockedBookings(): Booking[] {
  return bookings.filter(b =>
    b.current_blocker &&
    b.stage !== 'transferred' &&
    b.stage !== 'cancelled'
  );
}

export function getSummary() {
  const active = bookings.filter(b => b.stage !== 'transferred' && b.stage !== 'cancelled');
  const transferred = bookings.filter(b => b.stage === 'transferred');

  return {
    total: bookings.length,
    active: active.length,
    transferred: transferred.length,
    totalValue: bookings.reduce((sum, b) => sum + b.net_contract_value, 0),
    activeValue: active.reduce((sum, b) => sum + b.net_contract_value, 0),
    transferredValue: transferred.reduce((sum, b) => sum + b.net_contract_value, 0),
    avgAging: Math.round(active.reduce((sum, b) => sum + b.aging_days, 0) / (active.length || 1)),
    blocked: getBlockedBookings().length,
    byStage: Object.values(STAGES).map(stage => ({
      stage,
      count: getBookingsByStage(stage).length,
      value: getBookingsByStage(stage).reduce((sum, b) => sum + b.net_contract_value, 0),
    })),
    byTeam: TEAMS.map(team => ({
      team,
      count: getBookingsByTeam(team).length,
    })),
    byGrade: (['A', 'B', 'C', 'D', 'F'] as Grade[]).map(grade => ({
      grade,
      count: active.filter(b => b.backlog_grade === grade).length,
    })),
  };
}
