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
  { key: 'doc_meter',  label: 'เอกสารมิเตอร์น้ำ-ไฟ', group: 'เอกสาร',  sla: 1,  slaDesc: 'นับจากวันโอนจริง',      count: 14, aging: { '1':5,'2':3,'3':2,'4':1,'5':1,'6':0,'7':1,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  // ── LivNex ──
  { key: 'jd_livnex', label: 'JD - LivNex Able', group: 'LivNex', sla: 3, slaDesc: 'นับจากเอกสารธนาคารครบ', count: 20, aging: { '1':3,'2':3,'3':2,'4':2,'5':1,'6':1,'7':1,'8':1,'9':0,'10':1,'11':0,'12':1,'13':0,'14':1,'15':0,'15+':3 } },
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
  // ── CS Inspect ──
  { key: 'inspect_cs_review',  label: 'CS Review',              group: 'CS Inspect', sla: 1,  slaDesc: 'นับจากวันนัดตรวจ',     count: 9,  aging: { '1':3,'2':2,'3':1,'4':1,'5':0,'6':1,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'inspect_appt_cash',  label: 'โทรนัดตรวจ (โอนสด)',     group: 'CS Inspect', sla: 1,  slaDesc: 'นับจากวันจอง',          count: 7,  aging: { '1':2,'2':2,'3':1,'4':1,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'inspect_appt_loan',  label: 'โทรนัดตรวจ (กู้ธนาคาร)', group: 'CS Inspect', sla: 1,  slaDesc: 'นับจากผลบูโร',          count: 5,  aging: { '1':2,'2':1,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':1,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── Con Review ──
  { key: 'inspect_con_review', label: 'CON Review',   group: 'Con Review', sla: 2,  slaDesc: 'นับจากวัน QC5.5',     count: 6,  aging: { '1':2,'2':1,'3':1,'4':0,'5':1,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  // ── Con Review — จ้างตรวจ ──
  { key: 'inspect1_hired',     label: 'ตรวจครั้งที่ 1',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าจ้างตรวจ', sla: 5,  slaDesc: 'นับจากวันนัดตรวจ',     count: 18, aging: { '1':3,'2':2,'3':2,'4':2,'5':1,'6':1,'7':1,'8':0,'9':1,'10':0,'11':1,'12':0,'13':0,'14':1,'15':0,'15+':3 } },
  { key: 'inspect2_hired',     label: 'ตรวจครั้งที่ 2',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าจ้างตรวจ', sla: 10, slaDesc: 'นับจากวันตรวจจริง รอบ 1', count: 6,  aging: { '1':1,'2':1,'3':1,'4':0,'5':1,'6':0,'7':0,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'inspect3_hired',     label: 'ตรวจครั้งที่ 3',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าจ้างตรวจ', sla: 10, slaDesc: 'นับจากวันตรวจจริง รอบ 2', count: 2,  aging: { '1':0,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'inspect3plus_hired', label: 'ตรวจมากกว่า 3',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าจ้างตรวจ', sla: 10, slaDesc: 'นับจากวันตรวจจริง รอบ 3', count: 1,  aging: { '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  // ── Con Review — ตรวจเอง ──
  { key: 'inspect1_self',     label: 'ตรวจครั้งที่ 1',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าตรวจเอง', sla: 7,  slaDesc: 'นับจากวันนัดตรวจ',     count: 10, aging: { '1':1,'2':1,'3':1,'4':1,'5':1,'6':0,'7':1,'8':0,'9':1,'10':0,'11':0,'12':1,'13':0,'14':0,'15':0,'15+':2 } },
  { key: 'inspect2_self',     label: 'ตรวจครั้งที่ 2',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าตรวจเอง', sla: 5,  slaDesc: 'นับจากวันตรวจจริง รอบ 1', count: 3,  aging: { '1':0,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':1,'14':0,'15':0,'15+':1 } },
  { key: 'inspect3_self',     label: 'ตรวจครั้งที่ 3',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าตรวจเอง', sla: 5,  slaDesc: 'นับจากวันตรวจจริง รอบ 2', count: 1,  aging: { '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':1,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── โอน ──
  { key: 'contract_bank',   label: 'สัญญา Bank',  group: 'โอน', sla: 5,  slaDesc: 'นับจากวันอนุมัติจริง',  count: 19, aging: { '1':2,'2':2,'3':1,'4':1,'5':1,'6':1,'7':1,'8':1,'9':0,'10':1,'11':1,'12':0,'13':1,'14':0,'15':1,'15+':5 } },
  { key: 'transfer_pkg',    label: 'ส่งชุดโอน',    group: 'โอน', sla: 5,  slaDesc: 'นับจากวันทำสัญญา',    count: 14, aging: { '1':2,'2':1,'3':1,'4':1,'5':0,'6':1,'7':1,'8':0,'9':1,'10':0,'11':1,'12':0,'13':0,'14':1,'15':0,'15+':4 } },
  { key: 'title_clear',     label: 'ปลอดโฉนด',    group: 'โอน', sla: 10, slaDesc: 'นับจากวันส่งชุดโอน',   count: 8,  aging: { '1':1,'2':1,'3':0,'4':1,'5':0,'6':0,'7':1,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':1,'15':0,'15+':2 } },
  { key: 'transfer_appt',   label: 'นัดโอน',       group: 'โอน', sla: 3,  slaDesc: 'นับจากวันปลอดโฉนด',   count: 11, aging: { '1':2,'2':1,'3':1,'4':1,'5':0,'6':1,'7':0,'8':1,'9':0,'10':0,'11':1,'12':0,'13':1,'14':0,'15':0,'15+':2 } },
  { key: 'transfer_actual', label: 'โอนจริง',      group: 'โอน', sla: 3,  slaDesc: 'นับจากวันนัดโอน',     count: 6,  aging: { '1':1,'2':0,'3':1,'4':0,'5':0,'6':1,'7':0,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':2 } },
];

// ─────────────────────────────────────────────
// งานที่ดำเนินการแล้ว แต่ยังค้างอยู่ (In-Progress per Process)
// aging = จำนวนวันนับจากเริ่มดำเนินการ
// ─────────────────────────────────────────────
export const PROCESS_INPROGRESS = [
  // ── เอกสาร ──
  { key: 'doc_bureau', label: 'เอกสารตรวจบูโร',     group: 'เอกสาร',  sla: 3,  slaDesc: 'นับจากวันจอง',           count: 12, aging: { '1':3,'2':2,'3':2,'4':1,'5':1,'6':1,'7':0,'8':1,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'doc_bank',   label: 'เตรียมเอกสารธนาคาร', group: 'เอกสาร',  sla: 3,  slaDesc: 'นับจากวันจอง',           count: 10, aging: { '1':2,'2':2,'3':1,'4':1,'5':1,'6':1,'7':0,'8':0,'9':1,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'doc_jd',     label: 'เตรียมเอกสาร JD',    group: 'เอกสาร',  sla: 3,  slaDesc: 'นับจากเอกสารธนาคารครบ', count: 8,  aging: { '1':2,'2':1,'3':1,'4':1,'5':1,'6':0,'7':0,'8':1,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'doc_meter',  label: 'เอกสารมิเตอร์น้ำ-ไฟ', group: 'เอกสาร',  sla: 1,  slaDesc: 'นับจากวันโอนจริง',      count: 6,  aging: { '1':3,'2':1,'3':1,'4':0,'5':0,'6':0,'7':0,'8':1,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── LivNex ──
  { key: 'jd_livnex', label: 'JD - LivNex Able', group: 'LivNex', sla: 3, slaDesc: 'นับจากเอกสารธนาคารครบ', count: 9, aging: { '1':2,'2':2,'3':1,'4':1,'5':1,'6':0,'7':1,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  // ── สินเชื่อ — พนักงาน ──
  { key: 'bureau_emp',      label: 'ผลบูโร',            group: 'สินเชื่อ', subGroup: 'ลูกค้าพนักงาน', sla: 2,  slaDesc: 'นับจากวันจอง',              count: 5,  aging: { '1':1,'2':1,'3':1,'4':1,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':1,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  { key: 'preapprove_emp',  label: 'อนุมัติเบื้องต้น',    group: 'สินเชื่อ', subGroup: 'ลูกค้าพนักงาน', sla: 3,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 4,  aging: { '1':1,'2':1,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'final_emp',       label: 'อนุมัติจริง',         group: 'สินเชื่อ', subGroup: 'ลูกค้าพนักงาน', sla: 5,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 3,  aging: { '1':1,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── สินเชื่อ — เจ้าของกิจการ/อาชีพอิสระ ──
  { key: 'bureau_biz',      label: 'ผลบูโร',            group: 'สินเชื่อ', subGroup: 'ลูกค้าเจ้าของกิจการ/อาชีพอิสระ', sla: 2,  slaDesc: 'นับจากวันจอง',              count: 4,  aging: { '1':1,'2':1,'3':0,'4':1,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':1,'14':0,'15':0,'15+':0 } },
  { key: 'preapprove_biz',  label: 'อนุมัติเบื้องต้น',    group: 'สินเชื่อ', subGroup: 'ลูกค้าเจ้าของกิจการ/อาชีพอิสระ', sla: 7,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 3,  aging: { '1':1,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'final_biz',       label: 'อนุมัติจริง',         group: 'สินเชื่อ', subGroup: 'ลูกค้าเจ้าของกิจการ/อาชีพอิสระ', sla: 10, slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 2,  aging: { '1':0,'2':1,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── สินเชื่อ — ข้าราชการ ──
  { key: 'bureau_gov',      label: 'ผลบูโร',            group: 'สินเชื่อ', subGroup: 'ลูกค้าข้าราชการ', sla: 2,  slaDesc: 'นับจากวันจอง',              count: 2,  aging: { '1':1,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'preapprove_gov',  label: 'อนุมัติเบื้องต้น',    group: 'สินเชื่อ', subGroup: 'ลูกค้าข้าราชการ', sla: 3,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 1,  aging: { '1':1,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  { key: 'final_gov',       label: 'อนุมัติจริง',         group: 'สินเชื่อ', subGroup: 'ลูกค้าข้าราชการ', sla: 15, slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 1,  aging: { '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  // ── สินเชื่อ — ต่างชาติ ──
  { key: 'bureau_foreign',      label: 'ผลบูโร',            group: 'สินเชื่อ', subGroup: 'ลูกค้าต่างชาติ', sla: 2,  slaDesc: 'นับจากวันจอง',              count: 1,  aging: { '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':1,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  { key: 'preapprove_foreign',  label: 'อนุมัติเบื้องต้น',    group: 'สินเชื่อ', subGroup: 'ลูกค้าต่างชาติ', sla: 10, slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 1,  aging: { '1':0,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  { key: 'final_foreign',       label: 'อนุมัติจริง',         group: 'สินเชื่อ', subGroup: 'ลูกค้าต่างชาติ', sla: 15, slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 0,  aging: { '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── สินเชื่อ — เกษียณ/บำนาญ ──
  { key: 'bureau_retire',      label: 'ผลบูโร',            group: 'สินเชื่อ', subGroup: 'ลูกค้าเกษียณ/บำนาญ', sla: 2,  slaDesc: 'นับจากวันจอง',              count: 1,  aging: { '1':1,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  { key: 'preapprove_retire',  label: 'อนุมัติเบื้องต้น',    group: 'สินเชื่อ', subGroup: 'ลูกค้าเกษียณ/บำนาญ', sla: 3,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 1,  aging: { '1':0,'2':1,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  { key: 'final_retire',       label: 'อนุมัติจริง',         group: 'สินเชื่อ', subGroup: 'ลูกค้าเกษียณ/บำนาญ', sla: 5,  slaDesc: 'นับจากเอกสารธนาคารครบ',   count: 0,  aging: { '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── CS Inspect ──
  { key: 'inspect_cs_review',  label: 'CS Review',              group: 'CS Inspect', sla: 1,  slaDesc: 'นับจากวันนัดตรวจ',     count: 4,  aging: { '1':2,'2':1,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'inspect_appt_cash',  label: 'โทรนัดตรวจ (โอนสด)',     group: 'CS Inspect', sla: 1,  slaDesc: 'นับจากวันจอง',          count: 3,  aging: { '1':1,'2':1,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  { key: 'inspect_appt_loan',  label: 'โทรนัดตรวจ (กู้ธนาคาร)', group: 'CS Inspect', sla: 1,  slaDesc: 'นับจากผลบูโร',          count: 2,  aging: { '1':1,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── Con Review ──
  { key: 'inspect_con_review', label: 'CON Review',   group: 'Con Review', sla: 2,  slaDesc: 'นับจากวัน QC5.5',     count: 3,  aging: { '1':1,'2':1,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  // ── Con Review — จ้างตรวจ ──
  { key: 'inspect1_hired',     label: 'ตรวจครั้งที่ 1',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าจ้างตรวจ', sla: 5,  slaDesc: 'นับจากวันนัดตรวจ',     count: 8,  aging: { '1':2,'2':1,'3':1,'4':1,'5':1,'6':0,'7':1,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'inspect2_hired',     label: 'ตรวจครั้งที่ 2',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าจ้างตรวจ', sla: 10, slaDesc: 'นับจากวันตรวจจริง รอบ 1', count: 3,  aging: { '1':1,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'inspect3_hired',     label: 'ตรวจครั้งที่ 3',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าจ้างตรวจ', sla: 10, slaDesc: 'นับจากวันตรวจจริง รอบ 2', count: 1,  aging: { '1':0,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  { key: 'inspect3plus_hired', label: 'ตรวจมากกว่า 3',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าจ้างตรวจ', sla: 10, slaDesc: 'นับจากวันตรวจจริง รอบ 3', count: 0,  aging: { '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── Con Review — ตรวจเอง ──
  { key: 'inspect1_self',     label: 'ตรวจครั้งที่ 1',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าตรวจเอง', sla: 7,  slaDesc: 'นับจากวันนัดตรวจ',     count: 5,  aging: { '1':1,'2':1,'3':1,'4':0,'5':1,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'inspect2_self',     label: 'ตรวจครั้งที่ 2',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าตรวจเอง', sla: 5,  slaDesc: 'นับจากวันตรวจจริง รอบ 1', count: 1,  aging: { '1':0,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  { key: 'inspect3_self',     label: 'ตรวจครั้งที่ 3',   group: 'Con Review', subGroup: 'Inspection - ลูกค้าตรวจเอง', sla: 5,  slaDesc: 'นับจากวันตรวจจริง รอบ 2', count: 0,  aging: { '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
  // ── โอน ──
  { key: 'contract_bank',   label: 'สัญญา Bank',  group: 'โอน', sla: 5,  slaDesc: 'นับจากวันอนุมัติจริง',  count: 8,  aging: { '1':2,'2':1,'3':1,'4':1,'5':0,'6':1,'7':0,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'transfer_pkg',    label: 'ส่งชุดโอน',    group: 'โอน', sla: 5,  slaDesc: 'นับจากวันทำสัญญา',    count: 6,  aging: { '1':1,'2':1,'3':1,'4':1,'5':0,'6':0,'7':1,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'title_clear',     label: 'ปลอดโฉนด',    group: 'โอน', sla: 10, slaDesc: 'นับจากวันส่งชุดโอน',   count: 4,  aging: { '1':1,'2':0,'3':1,'4':0,'5':0,'6':0,'7':1,'8':0,'9':0,'10':0,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':1 } },
  { key: 'transfer_appt',   label: 'นัดโอน',       group: 'โอน', sla: 3,  slaDesc: 'นับจากวันปลอดโฉนด',   count: 5,  aging: { '1':2,'2':1,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0,'12':0,'13':1,'14':0,'15':0,'15+':0 } },
  { key: 'transfer_actual', label: 'โอนจริง',      group: 'โอน', sla: 3,  slaDesc: 'นับจากวันนัดโอน',     count: 3,  aging: { '1':1,'2':0,'3':1,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':1,'11':0,'12':0,'13':0,'14':0,'15':0,'15+':0 } },
];

// สีของแต่ละ group
export const GROUP_COLORS: Record<string, string> = {
  'เอกสาร':  '#6366f1',
  'LivNex':  '#4ade80',
  'สินเชื่อ': '#f59e0b',
  'CS Inspect':  '#0891b2',
  'Con Review': '#7c3aed',
  'โอน':     '#10b981',
};

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

// ─────────────────────────────────────────────
// SLA Compliance — โอนแล้ว (รายโครงการ)
// Mock data สำหรับตาราง: โอนแล้ว / ≤30 วัน / >30 วัน / เฉลี่ย E2E / %SLA
// ─────────────────────────────────────────────
export interface SlaComplianceRow {
  pName: string;
  n: number;        // โอนแล้วทั้งหมด
  within30: number;  // ≤30 วัน
  over30: number;    // >30 วัน
  avgE2E: number;    // เฉลี่ย E2E (วัน)
  pct: number;       // %SLA (0-100)
}

export const SLA_COMPLIANCE_DATA: SlaComplianceRow[] = [
  // BUD C1
  { pName: 'เสนา เวล่า สิริโสธร',          n: 42, within30: 35, over30: 7,  avgE2E: 24, pct: 83 },
  { pName: 'เสนา พาร์ค แกรนด์ รามอินทรา',  n: 38, within30: 30, over30: 8,  avgE2E: 26, pct: 79 },
  { pName: 'เสนา เรสซิเดนซ์ อารีย์',        n: 25, within30: 22, over30: 3,  avgE2E: 21, pct: 88 },
  // BUD C2
  { pName: 'เสนา คอนโด วงเวียนใหญ่',       n: 31, within30: 19, over30: 12, avgE2E: 33, pct: 61 },
  { pName: 'เสนา เพลส ลาดพร้าว',           n: 27, within30: 20, over30: 7,  avgE2E: 28, pct: 74 },
  // BUD C3
  { pName: 'เสนา โซลาร์ พหลโยธิน',         n: 35, within30: 28, over30: 7,  avgE2E: 25, pct: 80 },
  { pName: 'เสนา วิลล่า สุขุมวิท',          n: 19, within30: 16, over30: 3,  avgE2E: 22, pct: 84 },
  // BUD C4
  { pName: 'เสนา คอนโด พระราม 9',          n: 22, within30: 14, over30: 8,  avgE2E: 31, pct: 64 },
  { pName: 'เสนา คอนโด อ่อนนุช',           n: 18, within30: 12, over30: 6,  avgE2E: 32, pct: 67 },
  // BUD H1
  { pName: 'เสนา ทาวน์ รังสิต',             n: 45, within30: 38, over30: 7,  avgE2E: 23, pct: 84 },
  { pName: 'เสนา วีว่า ศรีราชา - อัสสัมชัญ',  n: 33, within30: 25, over30: 8,  avgE2E: 27, pct: 76 },
  { pName: 'บ้านบูรพา',                     n: 28, within30: 24, over30: 4,  avgE2E: 22, pct: 86 },
  // BUD H2
  { pName: 'เสนา อเวนิว บางปะกง - บ้านโพธิ์', n: 36, within30: 22, over30: 14, avgE2E: 35, pct: 58 },
  { pName: 'เสนา เอโค่ บางนา',              n: 30, within30: 23, over30: 7,  avgE2E: 27, pct: 77 },
  { pName: 'เสนา ไลฟ์ บางปู',               n: 24, within30: 18, over30: 6,  avgE2E: 29, pct: 75 },
  { pName: 'เสนา เวล่า สุขุมวิท-บางปู',      n: 20, within30: 11, over30: 9,  avgE2E: 34, pct: 55 },
];

// ─────────────────────────────────────────────
// งานค้างรายโครงการ (Backlog per Project)
// Mock data: งานค้าง / ตาม SLA / เกิน SLA / เฉลี่ย aging / %ตาม SLA
// ─────────────────────────────────────────────
export interface BacklogByProjectRow {
  pName: string;
  n: number;         // งานค้างทั้งหมด
  withinSla: number; // ตาม SLA
  overSla: number;   // เกิน SLA
  avgAging: number;  // เฉลี่ย aging (วัน)
  pct: number;       // %ตาม SLA (0-100)
}

export const BACKLOG_BY_PROJECT_DATA: BacklogByProjectRow[] = [
  // BUD C1
  { pName: 'เสนา เวล่า สิริโสธร',          n: 18, withinSla: 12, overSla: 6,  avgAging: 6,  pct: 67 },
  { pName: 'เสนา พาร์ค แกรนด์ รามอินทรา',  n: 22, withinSla: 14, overSla: 8,  avgAging: 7,  pct: 64 },
  { pName: 'เสนา เรสซิเดนซ์ อารีย์',        n: 10, withinSla: 8,  overSla: 2,  avgAging: 4,  pct: 80 },
  // BUD C2
  { pName: 'เสนา คอนโด วงเวียนใหญ่',       n: 15, withinSla: 7,  overSla: 8,  avgAging: 9,  pct: 47 },
  { pName: 'เสนา เพลส ลาดพร้าว',           n: 12, withinSla: 8,  overSla: 4,  avgAging: 6,  pct: 67 },
  // BUD C3
  { pName: 'เสนา โซลาร์ พหลโยธิน',         n: 16, withinSla: 11, overSla: 5,  avgAging: 5,  pct: 69 },
  { pName: 'เสนา วิลล่า สุขุมวิท',          n: 8,  withinSla: 6,  overSla: 2,  avgAging: 4,  pct: 75 },
  // BUD C4
  { pName: 'เสนา คอนโด พระราม 9',          n: 14, withinSla: 6,  overSla: 8,  avgAging: 10, pct: 43 },
  { pName: 'เสนา คอนโด อ่อนนุช',           n: 11, withinSla: 5,  overSla: 6,  avgAging: 9,  pct: 45 },
  // BUD H1
  { pName: 'เสนา ทาวน์ รังสิต',             n: 24, withinSla: 18, overSla: 6,  avgAging: 5,  pct: 75 },
  { pName: 'เสนา วีว่า ศรีราชา - อัสสัมชัญ',  n: 19, withinSla: 12, overSla: 7,  avgAging: 7,  pct: 63 },
  { pName: 'บ้านบูรพา',                     n: 13, withinSla: 10, overSla: 3,  avgAging: 4,  pct: 77 },
  // BUD H2
  { pName: 'เสนา อเวนิว บางปะกง - บ้านโพธิ์', n: 20, withinSla: 8,  overSla: 12, avgAging: 11, pct: 40 },
  { pName: 'เสนา เอโค่ บางนา',              n: 17, withinSla: 11, overSla: 6,  avgAging: 7,  pct: 65 },
  { pName: 'เสนา ไลฟ์ บางปู',               n: 14, withinSla: 9,  overSla: 5,  avgAging: 6,  pct: 64 },
  { pName: 'เสนา เวล่า สุขุมวิท-บางปู',      n: 9,  withinSla: 3,  overSla: 6,  avgAging: 12, pct: 33 },
];

// ─────────────────────────────────────────────
// Mock Booking Items per Project — สำหรับ panel ขวา
// ─────────────────────────────────────────────
export interface ProjectBookingItem {
  bookingNo: string;
  customer: string;
  project: string;
  unit: string;
  saleName: string;
  team: string;
  days: number;       // E2E หรือ aging days
  withinSla: boolean;  // ตาม SLA หรือไม่
  status: 'backlog' | 'transferred';
}

const MOCK_SALES = ['สกุลกาญจน์ ชินพรหมนิ','นภพร วงศ์สกุล','รัตนา เพชรดี','ธนพล ศรีสุข','อรุณี จิตดี','ชัยวัฒน์ มั่นคง','พิมพ์ใจ สมบูรณ์','เอกชัย ทองดี'];
const MOCK_TEAMS = ['CS','CO','Construction','Legal','Finance','Sale'];

let _projSeq = 5000;
function _genProjectItems(pName: string, count: number, avgDays: number, pctOk: number, status: 'backlog' | 'transferred'): ProjectBookingItem[] {
  const items: ProjectBookingItem[] = [];
  for (let i = 0; i < count; i++) {
    _projSeq++;
    const ok = (i / count) < (pctOk / 100);
    const days = ok
      ? Math.max(1, Math.round(avgDays * 0.6 + (_projSeq % 7)))
      : Math.round(avgDays * 1.3 + (_projSeq % 10));
    items.push({
      bookingNo: `BK-${String(_projSeq).padStart(5, '0')}`,
      customer: `${MOCK_FIRST[_projSeq % MOCK_FIRST.length]} ${MOCK_LAST[_projSeq % MOCK_LAST.length]}`,
      project: pName,
      unit: `${(_projSeq % 30) + 1}/${(_projSeq % 80) + 101}`,
      saleName: MOCK_SALES[_projSeq % MOCK_SALES.length],
      team: MOCK_TEAMS[_projSeq % MOCK_TEAMS.length],
      days,
      withinSla: ok,
      status,
    });
  }
  return items;
}

export const PROJECT_BOOKING_ITEMS: ProjectBookingItem[] = [
  ...SLA_COMPLIANCE_DATA.flatMap(r => _genProjectItems(r.pName, r.n, r.avgE2E, r.pct, 'transferred')),
  ...BACKLOG_BY_PROJECT_DATA.flatMap(r => _genProjectItems(r.pName, r.n, r.avgAging, r.pct, 'backlog')),
];

// ─────────────────────────────────────────────
// สถานะสินเชื่อรายธนาคาร (Bank Credit Status)
// ─────────────────────────────────────────────
export interface BankCreditStatus {
  bank: string;
  approved: number;           // อนุมัติจริง (final pass)
  pendingFinal: number;       // รอ Final (pre-approve ผ่าน, ยังไม่มี final)
  pendingPreapprove: number;  // รอเบื้องต้น (ยื่นแล้ว, ยังไม่มี pre-approve)
  rejected: number;           // ไม่อนุมัติ (fail ที่ขั้นใดก็ตาม)
}

export const BANK_CREDIT_STATUS: BankCreditStatus[] = [
  { bank: 'GHB',   approved: 15, pendingFinal: 4, pendingPreapprove: 3, rejected: 2 },
  { bank: 'KBANK',  approved: 12, pendingFinal: 5, pendingPreapprove: 2, rejected: 3 },
  { bank: 'SCB',    approved: 10, pendingFinal: 3, pendingPreapprove: 4, rejected: 1 },
  { bank: 'KTB',    approved: 8,  pendingFinal: 2, pendingPreapprove: 3, rejected: 2 },
  { bank: 'BBL',    approved: 7,  pendingFinal: 3, pendingPreapprove: 1, rejected: 1 },
  { bank: 'BAY',    approved: 6,  pendingFinal: 2, pendingPreapprove: 2, rejected: 2 },
  { bank: 'TTB',    approved: 5,  pendingFinal: 1, pendingPreapprove: 2, rejected: 1 },
  { bank: 'GSB',    approved: 4,  pendingFinal: 2, pendingPreapprove: 1, rejected: 1 },
  { bank: 'LH',     approved: 3,  pendingFinal: 1, pendingPreapprove: 1, rejected: 0 },
  { bank: 'UOB',    approved: 2,  pendingFinal: 1, pendingPreapprove: 0, rejected: 1 },
];

// ─────────────────────────────────────────────
// Workload per Person + SLA
// ─────────────────────────────────────────────
export interface PersonWorkload {
  name: string;
  team: 'CO' | 'CS' | 'CON' | 'Sale';
  backlog: number;
  withinSla: number;
  overSla: number;
  avgAging: number;
  pctSla: number;
  transferred: number;
  avgE2E: number;
}
export const PERSON_WORKLOAD: PersonWorkload[] = [
  // ─── CO ───
  { name: 'วิลาวัณย์ (อุ๊)',    team: 'CO',   backlog: 18, withinSla: 12, overSla: 6,  avgAging: 8,  pctSla: 67, transferred: 5,  avgE2E: 28 },
  { name: 'สุภาพร (แอน)',       team: 'CO',   backlog: 15, withinSla: 11, overSla: 4,  avgAging: 6,  pctSla: 73, transferred: 7,  avgE2E: 25 },
  { name: 'ธนพล (เอ็ม)',        team: 'CO',   backlog: 12, withinSla: 10, overSla: 2,  avgAging: 4,  pctSla: 83, transferred: 8,  avgE2E: 22 },
  { name: 'จิราภรณ์ (จอย)',     team: 'CO',   backlog: 10, withinSla: 7,  overSla: 3,  avgAging: 7,  pctSla: 70, transferred: 4,  avgE2E: 30 },
  // ─── CS ───
  { name: 'สุรศักดิ์ (โอ)',      team: 'CS',   backlog: 14, withinSla: 10, overSla: 4,  avgAging: 5,  pctSla: 71, transferred: 6,  avgE2E: 26 },
  { name: 'กาญจนา (แนน)',       team: 'CS',   backlog: 11, withinSla: 9,  overSla: 2,  avgAging: 3,  pctSla: 82, transferred: 9,  avgE2E: 20 },
  { name: 'พรทิพย์ (หมิว)',     team: 'CS',   backlog: 13, withinSla: 8,  overSla: 5,  avgAging: 9,  pctSla: 62, transferred: 3,  avgE2E: 32 },
  // ─── CON ───
  { name: 'สุรสิทธิ์ (โต้ง)',    team: 'CON',  backlog: 20, withinSla: 14, overSla: 6,  avgAging: 7,  pctSla: 70, transferred: 4,  avgE2E: 29 },
  { name: 'ประเสริฐ (เจ)',       team: 'CON',  backlog: 16, withinSla: 13, overSla: 3,  avgAging: 4,  pctSla: 81, transferred: 6,  avgE2E: 23 },
  { name: 'วิชัย (ชัย)',         team: 'CON',  backlog: 8,  withinSla: 6,  overSla: 2,  avgAging: 5,  pctSla: 75, transferred: 5,  avgE2E: 27 },
  // ─── Sale ───
  { name: 'สกุลกาญจน์ (กิ๊ฟ)',  team: 'Sale', backlog: 9,  withinSla: 7,  overSla: 2,  avgAging: 4,  pctSla: 78, transferred: 10, avgE2E: 21 },
  { name: 'นภัสสร (มิ้นท์)',    team: 'Sale', backlog: 7,  withinSla: 6,  overSla: 1,  avgAging: 3,  pctSla: 86, transferred: 8,  avgE2E: 19 },
  { name: 'ภูริวัจน์ (เบนซ์)',   team: 'Sale', backlog: 11, withinSla: 8,  overSla: 3,  avgAging: 6,  pctSla: 73, transferred: 6,  avgE2E: 26 },
];

// ─────────────────────────────────────────────
// Mock Booking Items per Person — สำหรับ panel ขวา workload
// ─────────────────────────────────────────────
export interface PersonBookingItem {
  bookingNo: string;
  customer: string;
  project: string;
  unit: string;
  personName: string;
  team: string;
  days: number;
  withinSla: boolean;
}

const MOCK_PROJECTS_SHORT = ['เสนา พาร์ค แกรนด์','เสนา เวล่า สิริโสธร','เสนา คอนโด วงเวียนใหญ่','เสนา ทาวน์ รังสิต','เสนา เอโค่ บางนา','เสนา โซลาร์ พหลโยธิน','เสนา เพลส ลาดพร้าว','เสนา ไลฟ์ บางปู'];

let _personSeq = 8000;
function _genPersonItems(p: PersonWorkload): PersonBookingItem[] {
  const items: PersonBookingItem[] = [];
  for (let i = 0; i < p.backlog; i++) {
    _personSeq++;
    const ok = i < p.withinSla;
    const days = ok
      ? Math.max(1, Math.round(p.avgAging * 0.6 + (_personSeq % 5)))
      : Math.round(p.avgAging * 1.4 + (_personSeq % 8));
    items.push({
      bookingNo: `BK-${String(_personSeq).padStart(5, '0')}`,
      customer: `${MOCK_FIRST[_personSeq % MOCK_FIRST.length]} ${MOCK_LAST[_personSeq % MOCK_LAST.length]}`,
      project: MOCK_PROJECTS_SHORT[_personSeq % MOCK_PROJECTS_SHORT.length],
      unit: `${(_personSeq % 30) + 1}/${(_personSeq % 80) + 101}`,
      personName: p.name,
      team: p.team,
      days,
      withinSla: ok,
    });
  }
  return items;
}

export const PERSON_BOOKING_ITEMS: PersonBookingItem[] = PERSON_WORKLOAD.flatMap(p => _genPersonItems(p));

// ─────────────────────────────────────────────
// Performance รายบุคคล — %SLA รายเดือน (12 เดือน)
// ─────────────────────────────────────────────
export interface PersonMonthlySla {
  month: string;           // ม.ค., ก.พ., ...
  [personName: string]: number | string; // %SLA 0-100
}

const THAI_MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

// Seed-based pseudo-random per person per month
function _genMonthlySla(basePct: number, seed: number): number[] {
  const months: number[] = [];
  let s = seed;
  for (let m = 0; m < 12; m++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const variance = ((s % 31) - 15); // -15 to +15
    months.push(Math.min(100, Math.max(30, basePct + variance)));
  }
  return months;
}

export const PERSON_MONTHLY_SLA: PersonMonthlySla[] = THAI_MONTHS_SHORT.map((month, mIdx) => {
  const row: PersonMonthlySla = { month };
  PERSON_WORKLOAD.forEach((p, pIdx) => {
    const series = _genMonthlySla(p.pctSla, pIdx * 100 + 7);
    row[p.name] = series[mIdx];
  });
  return row;
});
