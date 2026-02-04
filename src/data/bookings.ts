// ===============================================
// SENA BOOKING TO TRANSFER - FULL DATA MODEL
// ครบทั้ง 13 Sections ตาม Requirement
// ===============================================

// ===== ENUMS & CONSTANTS =====
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

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type KPIResult = 'PASS' | 'FAIL' | 'N/A';

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
  sale_type: string;                // "ผ่อนดาวน์" | "เงินสด"
  down_payment_complete_date: string | null;
  credit_request_type: string;      // "โอนสด" | "สินเชื่อธนาคาร"
  bank_submitted: string | null;    // "CASH" | "SCB" | "KBANK" etc.

  // ─────────────────────────────────────────────
  // 6. CREDIT / BANK PROCESS (CO)
  // ─────────────────────────────────────────────
  credit_status: string;            // "โอนสด" | "รอผล Bureau" | "อนุมัติแล้ว"
  credit_owner: string | null;      // "1.2) วิลาวัณย์ (อุ๊)"

  // Document Tracking
  doc_submit_date: string | null;
  doc_complete_bank_jd_date: string | null;
  doc_complete_jd_date: string | null;
  bank_request_more_doc_date: string | null;
  jd_request_more_doc_date: string | null;

  // Bureau
  bureau_target_result_date: string | null;
  bureau_actual_result_date: string | null;
  bureau_result: string | null;     // "ผ่าน" | "ไม่ผ่าน" | null

  // Bank Approval
  bank_preapprove_target_date: string | null;
  bank_preapprove_actual_date: string | null;
  bank_preapprove_result: string | null;
  bank_final_target_date: string | null;
  bank_final_actual_date: string | null;
  bank_final_result: string | null; // "อนุมัติ 3,600,000"

  // JD Approval
  jd_final_target_date: string | null;
  jd_final_actual_date: string | null;
  jd_final_result: string | null;

  co_remark: string | null;

  // ─────────────────────────────────────────────
  // 7. INSPECTION / CS / CONSTRUCTION
  // ─────────────────────────────────────────────
  inspection_status: string;        // "รับนัดตรวจ" | "รอแก้งาน" | "ผ่านแล้ว"
  inspection_method: string | null; // "ตรวจเอง" | "จ้างตรวจ"
  unit_ready_inspection_date: string | null;
  cs_notify_target_date: string | null;

  // Round 1
  inspect1_notify_date: string | null;
  inspect1_appointment_date: string | null;
  inspect1_actual_date: string | null;
  inspect1_ready_date: string | null;

  // Round 2
  inspect2_appointment_date: string | null;
  inspect2_actual_date: string | null;
  inspect2_ready_date: string | null;

  // Round 3
  inspect3_appointment_date: string | null;
  inspect3_actual_date: string | null;

  handover_accept_date: string | null;
  inspection_officer: string | null;
  cs_owner: string | null;

  // ─────────────────────────────────────────────
  // 8. TRANSFER / LEGAL / CO SUPPORT
  // ─────────────────────────────────────────────
  bank_contract_date: string | null;
  transfer_package_sent_date: string | null;
  title_clear_date: string | null;
  title_clear_notify_date: string | null;
  transfer_target_date: string | null;
  transfer_actual_date: string | null;
  transfer_appointment_date: string | null;
  transfer_status: string;          // "In process" | "Transferred"

  // Cancellation
  cancel_flag: boolean;
  cancel_date: string | null;
  cancel_reason: string | null;

  // ─────────────────────────────────────────────
  // 9. LIVNEX / RENTNEX EQUITY
  // ─────────────────────────────────────────────
  livnex_able_status: string | null;
  livnex_able_completion_result: string | null;
  livnex_complete_date: string | null;
  sale_offer_livnex_flag: boolean;
  livnex_contract_appointment_date: string | null;
  livnex_contract_actual_date: string | null;
  livnex_cancel_date: string | null;
  livnex_cancel_reason: string | null;
  rentnex_contract_appointment_date: string | null;
  rentnex_cancel_date: string | null;
  rentnex_cancel_reason: string | null;

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
    sale_type: 'ผ่อนดาวน์',
    down_payment_complete_date: '25/05/2026',
    credit_request_type: 'โอนสด',
    bank_submitted: 'CASH',

    // 6. Credit
    credit_status: 'โอนสด',
    credit_owner: '1.2) วิลาวัณย์ (อุ๊)',
    doc_submit_date: null,
    doc_complete_bank_jd_date: null,
    doc_complete_jd_date: null,
    bank_request_more_doc_date: null,
    jd_request_more_doc_date: null,
    bureau_target_result_date: null,
    bureau_actual_result_date: null,
    bureau_result: null,
    bank_preapprove_target_date: null,
    bank_preapprove_actual_date: null,
    bank_preapprove_result: null,
    bank_final_target_date: null,
    bank_final_actual_date: null,
    bank_final_result: null,
    jd_final_target_date: null,
    jd_final_actual_date: null,
    jd_final_result: null,
    co_remark: 'ลูกค้าแจ้งโอนสด จึงไม่มีผลบูโร',

    // 7. Inspection
    inspection_status: 'รับนัดตรวจ',
    inspection_method: 'ตรวจเอง',
    unit_ready_inspection_date: '07/01/2026',
    cs_notify_target_date: null,
    inspect1_notify_date: '24/12/2025',
    inspect1_appointment_date: '15/05/2026',
    inspect1_actual_date: null,
    inspect1_ready_date: null,
    inspect2_appointment_date: null,
    inspect2_actual_date: null,
    inspect2_ready_date: null,
    inspect3_appointment_date: null,
    inspect3_actual_date: null,
    handover_accept_date: null,
    inspection_officer: 'สุรสิทธิ์ (โต้ง)',
    cs_owner: 'สุรศักดิ์ / กาญจนา',

    // 8. Transfer
    bank_contract_date: null,
    transfer_package_sent_date: null,
    title_clear_date: null,
    title_clear_notify_date: null,
    transfer_target_date: '30/06/2026',
    transfer_actual_date: null,
    transfer_appointment_date: null,
    transfer_status: 'In process',
    cancel_flag: false,
    cancel_date: null,
    cancel_reason: null,

    // 9. LivNex
    livnex_able_status: 'ON Hand Sale',
    livnex_able_completion_result: null,
    livnex_complete_date: null,
    sale_offer_livnex_flag: false,
    livnex_contract_appointment_date: null,
    livnex_contract_actual_date: null,
    livnex_cancel_date: null,
    livnex_cancel_reason: null,
    rentnex_contract_appointment_date: null,
    rentnex_cancel_date: null,
    rentnex_cancel_reason: null,

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
    sale_type: 'ผ่อนดาวน์',
    down_payment_complete_date: '05/03/2026',
    credit_request_type: 'สินเชื่อธนาคาร',
    bank_submitted: 'SCB',

    // 6. Credit
    credit_status: 'รอผล Bureau',
    credit_owner: '1.1) สมหญิง (หญิง)',
    doc_submit_date: '15/01/2026',
    doc_complete_bank_jd_date: '18/01/2026',
    doc_complete_jd_date: null,
    bank_request_more_doc_date: null,
    jd_request_more_doc_date: null,
    bureau_target_result_date: '25/01/2026',
    bureau_actual_result_date: null,
    bureau_result: 'รอผล',
    bank_preapprove_target_date: '01/02/2026',
    bank_preapprove_actual_date: null,
    bank_preapprove_result: null,
    bank_final_target_date: '15/02/2026',
    bank_final_actual_date: null,
    bank_final_result: null,
    jd_final_target_date: null,
    jd_final_actual_date: null,
    jd_final_result: null,
    co_remark: 'ลูกค้ามีประวัติดี คาดว่าผ่าน',

    // 7. Inspection
    inspection_status: 'รอนัดตรวจ',
    inspection_method: 'ตรวจเอง',
    unit_ready_inspection_date: '20/01/2026',
    cs_notify_target_date: '22/01/2026',
    inspect1_notify_date: null,
    inspect1_appointment_date: null,
    inspect1_actual_date: null,
    inspect1_ready_date: null,
    inspect2_appointment_date: null,
    inspect2_actual_date: null,
    inspect2_ready_date: null,
    inspect3_appointment_date: null,
    inspect3_actual_date: null,
    handover_accept_date: null,
    inspection_officer: 'ประวิทย์ (เอ็ม)',
    cs_owner: 'มานพ / ศิริพร',

    // 8. Transfer
    bank_contract_date: null,
    transfer_package_sent_date: null,
    title_clear_date: null,
    title_clear_notify_date: null,
    transfer_target_date: '28/02/2026',
    transfer_actual_date: null,
    transfer_appointment_date: null,
    transfer_status: 'In process',
    cancel_flag: false,
    cancel_date: null,
    cancel_reason: null,

    // 9. LivNex
    livnex_able_status: 'Offer แล้ว',
    livnex_able_completion_result: 'สนใจ',
    livnex_complete_date: null,
    sale_offer_livnex_flag: true,
    livnex_contract_appointment_date: null,
    livnex_contract_actual_date: null,
    livnex_cancel_date: null,
    livnex_cancel_reason: null,
    rentnex_contract_appointment_date: null,
    rentnex_cancel_date: null,
    rentnex_cancel_reason: null,

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
    sale_type: 'ผ่อนดาวน์',
    down_payment_complete_date: '10/02/2026',
    credit_request_type: 'สินเชื่อธนาคาร',
    bank_submitted: 'KBANK',

    // 6. Credit
    credit_status: 'อนุมัติแล้ว',
    credit_owner: '1.3) กานดา (ดา)',
    doc_submit_date: '20/12/2025',
    doc_complete_bank_jd_date: '23/12/2025',
    doc_complete_jd_date: '27/12/2025',
    bank_request_more_doc_date: null,
    jd_request_more_doc_date: null,
    bureau_target_result_date: '27/12/2025',
    bureau_actual_result_date: '26/12/2025',
    bureau_result: 'ผ่าน',
    bank_preapprove_target_date: '03/01/2026',
    bank_preapprove_actual_date: '02/01/2026',
    bank_preapprove_result: 'อนุมัติ',
    bank_final_target_date: '10/01/2026',
    bank_final_actual_date: '08/01/2026',
    bank_final_result: 'อนุมัติ 3,600,000',
    jd_final_target_date: '15/01/2026',
    jd_final_actual_date: '12/01/2026',
    jd_final_result: 'อนุมัติ',
    co_remark: 'ลูกค้าประวัติดีมาก อนุมัติเร็ว',

    // 7. Inspection
    inspection_status: 'รอแก้งาน',
    inspection_method: 'จ้างตรวจ',
    unit_ready_inspection_date: '05/01/2026',
    cs_notify_target_date: '07/01/2026',
    inspect1_notify_date: '07/01/2026',
    inspect1_appointment_date: '12/01/2026',
    inspect1_actual_date: '12/01/2026',
    inspect1_ready_date: null,
    inspect2_appointment_date: '25/01/2026',
    inspect2_actual_date: null,
    inspect2_ready_date: null,
    inspect3_appointment_date: null,
    inspect3_actual_date: null,
    handover_accept_date: null,
    inspection_officer: 'สุรสิทธิ์ (โต้ง)',
    cs_owner: 'สุรศักดิ์ / กาญจนา',

    // 8. Transfer
    bank_contract_date: '15/01/2026',
    transfer_package_sent_date: '18/01/2026',
    title_clear_date: '20/01/2026',
    title_clear_notify_date: '20/01/2026',
    transfer_target_date: '31/01/2026',
    transfer_actual_date: null,
    transfer_appointment_date: null,
    transfer_status: 'In process',
    cancel_flag: false,
    cancel_date: null,
    cancel_reason: null,

    // 9. LivNex
    livnex_able_status: 'Offer แล้ว',
    livnex_able_completion_result: 'ทำสัญญาแล้ว',
    livnex_complete_date: '15/01/2026',
    sale_offer_livnex_flag: true,
    livnex_contract_appointment_date: '14/01/2026',
    livnex_contract_actual_date: '15/01/2026',
    livnex_cancel_date: null,
    livnex_cancel_reason: null,
    rentnex_contract_appointment_date: null,
    rentnex_cancel_date: null,
    rentnex_cancel_reason: null,

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
    sale_type: 'เงินสด',
    down_payment_complete_date: '01/12/2025',
    credit_request_type: 'สินเชื่อธนาคาร',
    bank_submitted: 'BBL',

    // 6. Credit
    credit_status: 'อนุมัติแล้ว',
    credit_owner: '1.2) วิลาวัณย์ (อุ๊)',
    doc_submit_date: '10/12/2025',
    doc_complete_bank_jd_date: '12/12/2025',
    doc_complete_jd_date: '15/12/2025',
    bank_request_more_doc_date: null,
    jd_request_more_doc_date: null,
    bureau_target_result_date: '17/12/2025',
    bureau_actual_result_date: '16/12/2025',
    bureau_result: 'ผ่าน',
    bank_preapprove_target_date: '22/12/2025',
    bank_preapprove_actual_date: '20/12/2025',
    bank_preapprove_result: 'อนุมัติ',
    bank_final_target_date: '28/12/2025',
    bank_final_actual_date: '26/12/2025',
    bank_final_result: 'อนุมัติ 1,785,000',
    jd_final_target_date: '02/01/2026',
    jd_final_actual_date: '30/12/2025',
    jd_final_result: 'อนุมัติ',
    co_remark: 'ข้าราชการ ประวัติดี อนุมัติไว',

    // 7. Inspection
    inspection_status: 'ผ่านแล้ว',
    inspection_method: 'ตรวจเอง',
    unit_ready_inspection_date: '15/12/2025',
    cs_notify_target_date: '16/12/2025',
    inspect1_notify_date: '16/12/2025',
    inspect1_appointment_date: '22/12/2025',
    inspect1_actual_date: '22/12/2025',
    inspect1_ready_date: '05/01/2026',
    inspect2_appointment_date: null,
    inspect2_actual_date: null,
    inspect2_ready_date: null,
    inspect3_appointment_date: null,
    inspect3_actual_date: null,
    handover_accept_date: '05/01/2026',
    inspection_officer: 'ประวิทย์ (เอ็ม)',
    cs_owner: 'มานพ / ศิริพร',

    // 8. Transfer
    bank_contract_date: '08/01/2026',
    transfer_package_sent_date: '10/01/2026',
    title_clear_date: '15/01/2026',
    title_clear_notify_date: '15/01/2026',
    transfer_target_date: '25/01/2026',
    transfer_actual_date: null,
    transfer_appointment_date: '25/01/2026',
    transfer_status: 'In process',
    cancel_flag: false,
    cancel_date: null,
    cancel_reason: null,

    // 9. LivNex
    livnex_able_status: 'ไม่สนใจ',
    livnex_able_completion_result: 'ปฏิเสธ',
    livnex_complete_date: null,
    sale_offer_livnex_flag: true,
    livnex_contract_appointment_date: null,
    livnex_contract_actual_date: null,
    livnex_cancel_date: null,
    livnex_cancel_reason: 'ลูกค้าไม่สนใจ',
    rentnex_contract_appointment_date: null,
    rentnex_cancel_date: null,
    rentnex_cancel_reason: null,

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
    sale_type: 'เงินสด',
    down_payment_complete_date: '15/11/2025',
    credit_request_type: 'สินเชื่อธนาคาร',
    bank_submitted: 'TTB',

    // 6. Credit
    credit_status: 'โอนแล้ว',
    credit_owner: '1.1) สมหญิง (หญิง)',
    doc_submit_date: '25/11/2025',
    doc_complete_bank_jd_date: '27/11/2025',
    doc_complete_jd_date: '29/11/2025',
    bank_request_more_doc_date: null,
    jd_request_more_doc_date: null,
    bureau_target_result_date: '02/12/2025',
    bureau_actual_result_date: '01/12/2025',
    bureau_result: 'ผ่าน',
    bank_preapprove_target_date: '07/12/2025',
    bank_preapprove_actual_date: '05/12/2025',
    bank_preapprove_result: 'อนุมัติ',
    bank_final_target_date: '15/12/2025',
    bank_final_actual_date: '12/12/2025',
    bank_final_result: 'อนุมัติ 4,160,000',
    jd_final_target_date: '20/12/2025',
    jd_final_actual_date: '18/12/2025',
    jd_final_result: 'อนุมัติ',
    co_remark: 'ลูกค้า VIP ผู้บริหาร ประวัติดีเยี่ยม',

    // 7. Inspection
    inspection_status: 'โอนแล้ว',
    inspection_method: 'จ้างตรวจ',
    unit_ready_inspection_date: '01/12/2025',
    cs_notify_target_date: '02/12/2025',
    inspect1_notify_date: '02/12/2025',
    inspect1_appointment_date: '08/12/2025',
    inspect1_actual_date: '08/12/2025',
    inspect1_ready_date: '20/12/2025',
    inspect2_appointment_date: null,
    inspect2_actual_date: null,
    inspect2_ready_date: null,
    inspect3_appointment_date: null,
    inspect3_actual_date: null,
    handover_accept_date: '20/12/2025',
    inspection_officer: 'สุรสิทธิ์ (โต้ง)',
    cs_owner: 'สุรศักดิ์ / กาญจนา',

    // 8. Transfer
    bank_contract_date: '22/12/2025',
    transfer_package_sent_date: '23/12/2025',
    title_clear_date: '27/12/2025',
    title_clear_notify_date: '27/12/2025',
    transfer_target_date: '30/12/2025',
    transfer_actual_date: '28/12/2025',
    transfer_appointment_date: '28/12/2025',
    transfer_status: 'Transferred',
    cancel_flag: false,
    cancel_date: null,
    cancel_reason: null,

    // 9. LivNex
    livnex_able_status: 'Offer แล้ว',
    livnex_able_completion_result: 'ทำสัญญาแล้ว',
    livnex_complete_date: '25/12/2025',
    sale_offer_livnex_flag: true,
    livnex_contract_appointment_date: '24/12/2025',
    livnex_contract_actual_date: '25/12/2025',
    livnex_cancel_date: null,
    livnex_cancel_reason: null,
    rentnex_contract_appointment_date: null,
    rentnex_cancel_date: null,
    rentnex_cancel_reason: null,

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

    // Computed
    stage: 'transferred',
    current_owner_team: 'Finance',
    current_blocker: null,
    next_action: null,
  },
];

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
