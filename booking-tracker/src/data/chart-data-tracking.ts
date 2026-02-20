// ===============================================
// TRACKING MOCKUP DATA — ข้อมูลกราฟสำหรับ Tracking Dashboard
// แยกจาก page.tsx เพื่อให้ mockup ตัวเลขได้อิสระ
// ===============================================

// ─────────────────────────────────────────────
// Aging Buckets: วันที่ 1-15 + 15+
// ─────────────────────────────────────────────
export const AGING_BUCKETS = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','15+'] as const;
export type AgingBucket = typeof AGING_BUCKETS[number];

// สีไล่เขียว→เหลือง→แดง ตามวัน
export const AGING_COLORS: Record<AgingBucket, string> = {
  '1':   '#059669',  // emerald-600  สดเขียว
  '2':   '#0d9448',  // เขียวเข้มสด
  '3':   '#16a34a',  // green-600
  '4':   '#3d9b09',  // lime เข้มสด
  '5':   '#65a30d',  // lime-600
  '6':   '#a3960a',  // เหลืองเข้มสด
  '7':   '#ca8a04',  // yellow-600
  '8':   '#d97706',  // amber-600
  '9':   '#ea580c',  // orange-600
  '10':  '#e04210',  // ส้มแดงสด
  '11':  '#dc2626',  // red-600
  '12':  '#db1818',  // แดงสด
  '13':  '#c41616',  // แดงเข้มสด
  '14':  '#b91c1c',  // red-700
  '15':  '#991b1b',  // red-800
  '15+': '#7f1d1d',  // red-900
};

// ─────────────────────────────────────────────
// งานค้างในแต่ละ Process (Backlog per Process)
// ─────────────────────────────────────────────
// aging: จำนวนรายค้าง แยกตามวัน (ผลรวม = count)
export const PROCESS_BACKLOG = [
  // ── เอกสาร ── (SLA จาก PROCESS_SLA)
  { key: 'doc_bureau', label: 'เอกสารตรวจบูโร',     group: 'เอกสาร',  sla: 3,  slaDesc: 'นับจากวันจอง',           count: 38, aging: { '1':4,'2':3,'3':3,'4':2,'5':2,'6':2,'7':2,'8':1,'9':2,'10':1,'11':1,'12':1,'13':1,'14':1,'15':1,'15+':11 } },
  { key: 'doc_bank',   label: 'เตรียมเอกสารธนาคาร', group: 'เอกสาร',  sla: 3,  slaDesc: 'นับจากวันจอง',           count: 25, aging: { '1':3,'2':2,'3':2,'4':1,'5':1,'6':1,'7':1,'8':1,'9':1,'10':1,'11':1,'12':1,'13':0,'14':1,'15':1,'15+':7 } },
  { key: 'doc_jd',     label: 'เตรียมเอกสาร JD',    group: 'เอกสาร',  sla: 3,  slaDesc: 'นับจากเอกสารธนาคารครบ', count: 18, aging: { '1':2,'2':2,'3':1,'4':1,'5':1,'6':1,'7':1,'8':1,'9':0,'10':1,'11':0,'12':1,'13':0,'14':1,'15':0,'15+':5 } },
  // ── LivNex ──
  { key: 'jd_livnex', label: 'JD-LivNex able', group: 'LivNex', sla: 3, slaDesc: 'นับจากเอกสารธนาคารครบ', count: 20, aging: { '1':3,'2':3,'3':2,'4':2,'5':1,'6':1,'7':1,'8':1,'9':0,'10':1,'11':0,'12':1,'13':0,'14':1,'15':0,'15+':3 } },
  // ── สินเชื่อ — พนักงาน ──
  { key: 'bureau_emp',      label: 'ผลบูโร',            group: 'สินเชื่อ', subGroup: 'ลูกค้าพนักงาน', sla: 2,  slaDesc: 'นับจากวันจอง',              count: 12, aging: { '1':2,'2':2,'3':2,'4':1,'5':1,'6':1,'7':0,'8':1,'9':0,'10':0,'11':1,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'preapprove_emp',  label: 'อนุมัติเบื้องต้น',    group: 'สินเชื่อ', subGroup: 'ลูกค้าพนักงาน', sla: 3,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 8,  aging: { '1':2,'2':1,'3':1,'4':1,'5':1,'6':0,'7':1,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'final_emp',       label: 'อนุมัติจริง',         group: 'สินเชื่อ', subGroup: 'ลูกค้าพนักงาน', sla: 5,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 6,  aging: { '1':1,'2':1,'3':1,'4':1,'5':0,'6':1,'7':0,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── สินเชื่อ — เจ้าของกิจการ/อาชีพอิสระ ──
  { key: 'bureau_biz',      label: 'ผลบูโร',            group: 'สินเชื่อ', subGroup: 'ลูกค้าเจ้าของกิจการ/อาชีพอิสระ', sla: 2,  slaDesc: 'นับจากวันจอง',              count: 9,  aging: { '1':1,'2':1,'3':1,'4':1,'5':1,'6':1,'7':0,'8':1,'9':0,'10':0,'11':0,'12':0,'13':1,'14':0,'15':0,'15+':1 } },
  { key: 'preapprove_biz',  label: 'อนุมัติเบื้องต้น',    group: 'สินเชื่อ', subGroup: 'ลูกค้าเจ้าของกิจการ/อาชีพอิสระ', sla: 7,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 6,  aging: { '1':1,'2':1,'3':1,'4':0,'5':1,'6':0,'7':0,'8':1,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'final_biz',       label: 'อนุมัติจริง',         group: 'สินเชื่อ', subGroup: 'ลูกค้าเจ้าของกิจการ/อาชีพอิสระ', sla: 10, slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 5,  aging: { '1':0,'2':1,'3':0,'4':1,'5':0,'6':0,'7':1,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  // ── สินเชื่อ — ข้าราชการ ──
  { key: 'bureau_gov',      label: 'ผลบูโร',            group: 'สินเชื่อ', subGroup: 'ลูกค้าข้าราชการ', sla: 2,  slaDesc: 'นับจากวันจอง',              count: 5,  aging: { '1':1,'2':1,'3':1,'4':0,'5':1,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'preapprove_gov',  label: 'อนุมัติเบื้องต้น',    group: 'สินเชื่อ', subGroup: 'ลูกค้าข้าราชการ', sla: 3,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 3,  aging: { '1':1,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'final_gov',       label: 'อนุมัติจริง',         group: 'สินเชื่อ', subGroup: 'ลูกค้าข้าราชการ', sla: 15, slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 2,  aging: { '1':0,'2':1,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  // ── สินเชื่อ — ต่างชาติ ──
  { key: 'bureau_foreign',      label: 'ผลบูโร',            group: 'สินเชื่อ', subGroup: 'ลูกค้าต่างชาติ', sla: 2,  slaDesc: 'นับจากวันจอง',              count: 3,  aging: { '1':0,'2':1,'3':0,'4':0,'5':0,'6':0,'7':1,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'preapprove_foreign',  label: 'อนุมัติเบื้องต้น',    group: 'สินเชื่อ', subGroup: 'ลูกค้าต่างชาติ', sla: 10, slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 2,  aging: { '1':0,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'final_foreign',       label: 'อนุมัติจริง',         group: 'สินเชื่อ', subGroup: 'ลูกค้าต่างชาติ', sla: 15, slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 1,  aging: { '1':0,'2':0,'3':0,'4':0,'5':1,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── สินเชื่อ — เกษียณ/บำนาญ ──
  { key: 'bureau_retire',      label: 'ผลบูโร',            group: 'สินเชื่อ', subGroup: 'ลูกค้าเกษียณ/บำนาญ', sla: 2,  slaDesc: 'นับจากวันจอง',              count: 3,  aging: { '1':1,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'preapprove_retire',  label: 'อนุมัติเบื้องต้น',    group: 'สินเชื่อ', subGroup: 'ลูกค้าเกษียณ/บำนาญ', sla: 3,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 2,  aging: { '1':0,'2':1,'3':0,'4':0,'5':0,'6':0,'7':1,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  { key: 'final_retire',       label: 'อนุมัติจริง',         group: 'สินเชื่อ', subGroup: 'ลูกค้าเกษียณ/บำนาญ', sla: 5,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 1,  aging: { '1':0,'2':0,'3':0,'4':0,'5':1,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── ตรวจบ้าน — จ้างตรวจ ──
  { key: 'inspect_appt_hired', label: 'โทรนัดลูกค้าเข้าตรวจ', group: 'ตรวจบ้าน', subGroup: 'ลูกค้าจ้างตรวจ', sla: 1, slaDesc: 'นับจากวันจอง/ผลบูโร', count: 7, aging: { '1':2,'2':2,'3':1,'4':1,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'inspect1_hired',     label: 'ตรวจครั้งที่ 1',   group: 'ตรวจบ้าน', subGroup: 'ลูกค้าจ้างตรวจ', sla: 5,  slaDesc: 'นับจากวันนัดตรวจ',     count: 18, aging: { '1':3,'2':2,'3':2,'4':2,'5':1,'6':1,'7':1,'8':0,'9':1,'10':0,'11':1,'12':0,'13':0,'14':1,'15':0,'15+':3 } },
  { key: 'inspect2_hired',     label: 'ตรวจครั้งที่ 2',   group: 'ตรวจบ้าน', subGroup: 'ลูกค้าจ้างตรวจ', sla: 10, slaDesc: 'นับจากวันตรวจจริง รอบ 1', count: 6,  aging: { '1':1,'2':1,'3':1,'4':0,'5':1,'6':0,'7':0,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'inspect3_hired',     label: 'ตรวจครั้งที่ 3',   group: 'ตรวจบ้าน', subGroup: 'ลูกค้าจ้างตรวจ', sla: 10, slaDesc: 'นับจากวันตรวจจริง รอบ 2', count: 2,  aging: { '1':0,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'inspect3plus_hired', label: 'ตรวจมากกว่า 3',   group: 'ตรวจบ้าน', subGroup: 'ลูกค้าจ้างตรวจ', sla: 10, slaDesc: 'นับจากวันตรวจจริง รอบ 3', count: 1,  aging: { '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  // ── ตรวจบ้าน — ตรวจเอง ──
  { key: 'inspect_appt_self', label: 'โทรนัดลูกค้าเข้าตรวจ', group: 'ตรวจบ้าน', subGroup: 'ลูกค้าตรวจเอง', sla: 1, slaDesc: 'นับจากวันจอง/ผลบูโร', count: 5, aging: { '1':2,'2':1,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':1,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  { key: 'inspect1_self',     label: 'ตรวจครั้งที่ 1',   group: 'ตรวจบ้าน', subGroup: 'ลูกค้าตรวจเอง', sla: 7,  slaDesc: 'นับจากวันนัดตรวจ',     count: 10, aging: { '1':1,'2':1,'3':1,'4':1,'5':1,'6':0,'7':1,'8':0,'9':1,'10':0,'11':0,'12':1,'13':0,'14':0,'15':0,'15+':2 } },
  { key: 'inspect2_self',     label: 'ตรวจครั้งที่ 2',   group: 'ตรวจบ้าน', subGroup: 'ลูกค้าตรวจเอง', sla: 5,  slaDesc: 'นับจากวันตรวจจริง รอบ 1', count: 3,  aging: { '1':0,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':1,'14':0,'15':0,'15+':1 } },
  { key: 'inspect3_self',     label: 'ตรวจครั้งที่ 3',   group: 'ตรวจบ้าน', subGroup: 'ลูกค้าตรวจเอง', sla: 5,  slaDesc: 'นับจากวันตรวจจริง รอบ 2', count: 1,  aging: { '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':1,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── โอน ──
  { key: 'contract_bank',   label: 'สัญญา Bank',  group: 'โอน', sla: 5,  slaDesc: 'นับจากวันอนุมัติจริง',  count: 19, aging: { '1':2,'2':2,'3':1,'4':1,'5':1,'6':1,'7':1,'8':1,'9':0,'10':1,'11':1,'12':0,'13':1,'14':0,'15':1,'15+':5 } },
  { key: 'transfer_pkg',    label: 'ส่งชุดโอน',    group: 'โอน', sla: 5,  slaDesc: 'นับจากวันทำสัญญา',    count: 14, aging: { '1':2,'2':1,'3':1,'4':1,'5':0,'6':1,'7':1,'8':0,'9':1,'10':0,'11':1,'12':0,'13':0,'14':1,'15':0,'15+':4 } },
  { key: 'title_clear',     label: 'ปลอดโฉนด',    group: 'โอน', sla: 10, slaDesc: 'นับจากวันส่งชุดโอน',   count: 8,  aging: { '1':1,'2':1,'3':0,'4':1,'5':0,'6':0,'7':1,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':1,'15':0,'15+':2 } },
  { key: 'transfer_appt',   label: 'นัดโอน',       group: 'โอน', sla: 3,  slaDesc: 'นับจากวันปลอดโฉนด',   count: 11, aging: { '1':2,'2':1,'3':1,'4':1,'5':0,'6':1,'7':0,'8':1,'9':0,'10':0,'11':1,'12':0,'13':1,'14':0,'15':0,'15+':2 } },
  { key: 'transfer_actual', label: 'โอนจริง',      group: 'โอน', sla: 3,  slaDesc: 'นับจากวันนัดโอน',     count: 6,  aging: { '1':1,'2':0,'3':1,'4':0,'5':0,'6':1,'7':0,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':2 } },
];

// สีของแต่ละ group
export const GROUP_COLORS: Record<string, string> = {
  'เอกสาร':  '#6366f1',
  'LivNex':  '#4ade80',
  'สินเชื่อ': '#f59e0b',
  'ตรวจบ้าน': '#06b6d4',
  'โอน':     '#10b981',
};

// ─────────────────────────────────────────────
// เวลาอนุมัติเฉลี่ย ของธนาคาร (Mockup)
// ─────────────────────────────────────────────
export const BANK_APPROVAL_STEPS = [
  { key: 'submit_bureau', label: 'ส่ง → บูโร',      sla: 3 },
  { key: 'bureau_pre',    label: 'บูโร → เบื้องต้น',  sla: 3 },
  { key: 'pre_final',     label: 'เบื้องต้น → จริง',  sla: 3 },
  { key: 'total',         label: 'รวม ส่ง → จริง',    sla: 9 },
] as const;

export type BankApprovalStep = typeof BANK_APPROVAL_STEPS[number]['key'];

export interface BankApprovalRow {
  bank: string;
  color: string;
  count: number; // จำนวน booking ที่ยื่น
  avgDays: Record<BankApprovalStep, number | null>; // เฉลี่ยวัน (null = ไม่มีข้อมูล)
}

export const BANK_APPROVAL_DATA: BankApprovalRow[] = [
  { bank: 'GHB',    color: '#e11d48', count: 145, avgDays: { submit_bureau: 1, bureau_pre: 2, pre_final: 2, total: 5 } },
  { bank: 'GSB',    color: '#f472b6', count: 98,  avgDays: { submit_bureau: 2, bureau_pre: 2, pre_final: 3, total: 7 } },
  { bank: 'SCB',    color: '#7c3aed', count: 72,  avgDays: { submit_bureau: 1, bureau_pre: 1, pre_final: 2, total: 4 } },
  { bank: 'KBANK',  color: '#16a34a', count: 88,  avgDays: { submit_bureau: 2, bureau_pre: 3, pre_final: 4, total: 9 } },
  { bank: 'KTB',    color: '#0891b2', count: 65,  avgDays: { submit_bureau: 3, bureau_pre: 2, pre_final: 3, total: 8 } },
  { bank: 'TTB',    color: '#ea580c', count: 54,  avgDays: { submit_bureau: 1, bureau_pre: 3, pre_final: 2, total: 6 } },
  { bank: 'BAY',    color: '#eab308', count: 41,  avgDays: { submit_bureau: 2, bureau_pre: 3, pre_final: 5, total: 10 } },
  { bank: 'LH',     color: '#84cc16', count: 37,  avgDays: { submit_bureau: 1, bureau_pre: 2, pre_final: 3, total: 6 } },
  { bank: 'BBL',    color: '#2563eb', count: 29,  avgDays: { submit_bureau: 3, bureau_pre: 4, pre_final: 3, total: 10 } },
  { bank: 'UOB',    color: '#db2777', count: 22,  avgDays: { submit_bureau: 2, bureau_pre: 2, pre_final: 3, total: 7 } },
  { bank: 'CIMB',   color: '#b91c1c', count: 18,  avgDays: { submit_bureau: 3, bureau_pre: 5, pre_final: 7, total: 15 } },
  { bank: 'KKP',    color: '#6366f1', count: 15,  avgDays: { submit_bureau: 1, bureau_pre: 2, pre_final: 3, total: 6 } },
  { bank: 'iBank',  color: '#0d9488', count: 12,  avgDays: { submit_bureau: 2, bureau_pre: 3, pre_final: 2, total: 7 } },
  { bank: 'TISCO',  color: '#a855f7', count: 9,   avgDays: { submit_bureau: 2, bureau_pre: 3, pre_final: 3, total: 8 } },
  { bank: 'สหกรณ์', color: '#78716c', count: 6,   avgDays: { submit_bureau: 3, bureau_pre: 6, pre_final: 9, total: 18 } },
  { bank: 'JD',     color: '#059669', count: 34,  avgDays: { submit_bureau: 1, bureau_pre: null, pre_final: 2, total: 3 } },
];

// ─────────────────────────────────────────────
// Mock Booking Items — auto-generate จาก PROCESS_BACKLOG
// ─────────────────────────────────────────────
export interface BacklogItem {
  bookingNo: string;
  customer: string;
  project: string;
  unit: string;
  processKey: string;
  agingDay: string;
}

const MOCK_PROJECTS = ['เสนา วิลล์ 1', 'เสนา พาร์ค 2', 'เสนา ทาวน์ 3', 'เสนา แกรนด์ 4', 'เสนา เลค 5'];
const MOCK_FIRST = ['สมชาย','สมหญิง','วิชัย','สุดา','ประสิทธิ์','จันทร์','อรุณ','มาลี','สุพจน์','นภา','กิตติ','ปราณี','ธนา','รัตนา','วีระ','พิมพ์','อนุชา','สาวิตรี','ชัยวัฒน์','ดวงใจ'];
const MOCK_LAST = ['จันทร์ดี','สุขใจ','วงศ์สว่าง','พรหมา','ศรีสุข','เกิดดี','มั่นคง','สมบูรณ์','ทองดี','แก้วใส','จิตดี','บุญมา','วัฒนา','รุ่งเรือง','พิทักษ์'];

let _seqId = 1000;
function _genItems(processKey: string, agingDay: string, count: number): BacklogItem[] {
  const items: BacklogItem[] = [];
  for (let i = 0; i < count; i++) {
    _seqId++;
    items.push({
      bookingNo: `BK-${String(_seqId).padStart(5, '0')}`,
      customer: `${MOCK_FIRST[_seqId % MOCK_FIRST.length]} ${MOCK_LAST[_seqId % MOCK_LAST.length]}`,
      project: MOCK_PROJECTS[_seqId % MOCK_PROJECTS.length],
      unit: `${(_seqId % 20) + 1}/${(_seqId % 50) + 101}`,
      processKey,
      agingDay,
    });
  }
  return items;
}

export const BACKLOG_ITEMS: BacklogItem[] = PROCESS_BACKLOG.flatMap(p =>
  AGING_BUCKETS.flatMap(b => _genItems(p.key, b, p.aging[b]))
);
