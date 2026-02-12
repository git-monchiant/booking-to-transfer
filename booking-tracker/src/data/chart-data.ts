// ===============================================
// GRAPH MOCKUP DATA — ข้อมูลกราฟสำหรับ Dashboard
// แยกจาก TransferCharts.tsx เพื่อให้จัดการง่าย
// ===============================================

// ─────────────────────────────────────────────
// ภาพรวมยอดโอนรายเดือน (Monthly Transfer Overview)
// ─────────────────────────────────────────────
export const AVG_UNIT_VALUE = 4.8; // มูลค่าเฉลี่ยต่อ unit รวมทั้งโครงการ (ล้านบาท)

export const MONTHLY_TRANSFER_DATA = [
  { month: 'ม.ค.',  MTOP: 35, แผนโอน: 18, Upside: 0,  โอนจริง: 18, LivNex: 4, PreLivNex: 0 },
  { month: 'ก.พ.',  MTOP: 40, แผนโอน: 22, Upside: 0,  โอนจริง: 20, LivNex: 5, PreLivNex: 1 },
  { month: 'มี.ค.', MTOP: 50, แผนโอน: 30, Upside: 8,  โอนจริง: 30, LivNex: 8, PreLivNex: 0 },
  { month: 'เม.ย.', MTOP: 35, แผนโอน: 15, Upside: 0,  โอนจริง: 15, LivNex: 3, PreLivNex: 0 },
  { month: 'พ.ค.',  MTOP: 40, แผนโอน: 18, Upside: 0,  โอนจริง: 18, LivNex: 5, PreLivNex: 1 },
  { month: 'มิ.ย.', MTOP: 50, แผนโอน: 24, Upside: 6,  โอนจริง: 26, LivNex: 7, PreLivNex: 0 },
  { month: 'ก.ค.',  MTOP: 45, แผนโอน: 22, Upside: 0,  โอนจริง: 22, LivNex: 6, PreLivNex: 1 },
  { month: 'ส.ค.',  MTOP: 45, แผนโอน: 20, Upside: 0,  โอนจริง: 20, LivNex: 5, PreLivNex: 0 },
  { month: 'ก.ย.',  MTOP: 50, แผนโอน: 25, Upside: 10, โอนจริง: 0,  LivNex: 0, PreLivNex: 0 },
  { month: 'ต.ค.',  MTOP: 50, แผนโอน: 24, Upside: 0,  โอนจริง: 0,  LivNex: 0, PreLivNex: 0 },
  { month: 'พ.ย.',  MTOP: 50, แผนโอน: 26, Upside: 7,  โอนจริง: 0,  LivNex: 0, PreLivNex: 0 },
  { month: 'ธ.ค.',  MTOP: 35, แผนโอน: 18, Upside: 5,  โอนจริง: 0,  LivNex: 0, PreLivNex: 0 },
];

// ─────────────────────────────────────────────
// BUD (Business Unit Director) — กราฟแยกตาม BUD
// ─────────────────────────────────────────────
export const BUD_NAMES = ['Condo 1', 'Condo 2', 'Condo 3', 'Condo 4', 'Housing 1', 'Housing 2'];

export const BUD_COLORS: Record<string, string> = {
  'Condo 1': '#6366f1', 'Condo 2': '#818cf8', 'Condo 3': '#a5b4fc', 'Condo 4': '#c7d2fe',
  'Housing 1': '#10b981', 'Housing 2': '#6ee7b7',
};

// มูลค่าเฉลี่ยต่อ unit (ล้านบาท) per BUD
export const BUD_AVG_VALUE: Record<string, number> = {
  'Condo 1': 3.2, 'Condo 2': 2.8, 'Condo 3': 4.5, 'Condo 4': 5.1,
  'Housing 1': 6.8, 'Housing 2': 8.5,
};

// ยอดโอนจริง per BUD per month
export const BUD_ACTUAL: Record<string, number[]> = {
  'Condo 1':   [14, 16, 25, 10, 13, 22, 16, 15, 0, 0, 0, 0],
  'Condo 2':   [9,  11, 17, 8,  9,  14, 11, 10, 0, 0, 0, 0],
  'Condo 3':   [7,  8,  11, 5,  6,  10, 7,  7,  0, 0, 0, 0],
  'Condo 4':   [3,  4,  5,  2,  3,  4,  3,  3,  0, 0, 0, 0],
  'Housing 1': [13, 15, 22, 12, 14, 20, 16, 15, 0, 0, 0, 0],
  'Housing 2': [6,  7,  10, 4,  5,  8,  6,  5,  0, 0, 0, 0],
};

// แผนโอน per BUD per month
export const BUD_PLAN: Record<string, number[]> = {
  'Condo 1':   [13, 15, 24, 11, 14, 23, 17, 16, 18, 18, 18, 14],
  'Condo 2':   [10, 13, 20, 10, 12, 18, 14, 13, 16, 16, 16, 11],
  'Condo 3':   [10, 12, 18, 9,  11, 16, 13, 12, 14, 14, 14, 9],
  'Condo 4':   [8,  10, 16, 8,  10, 14, 11, 10, 12, 12, 12, 9],
  'Housing 1': [14, 17, 24, 13, 15, 21, 17, 17, 19, 19, 19, 14],
  'Housing 2': [12, 14, 22, 12, 14, 18, 16, 16, 16, 16, 16, 12],
};

// Upside per BUD per month
export const BUD_UPSIDE: Record<string, number[]> = {
  'Condo 1':   [2, 3, 4, 1, 1, 2, 1, 2, 2, 2, 2, 1],
  'Condo 2':   [2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  'Condo 3':   [2, 2, 2, 1, 1, 2, 1, 2, 2, 2, 2, 1],
  'Condo 4':   [2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  'Housing 1': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  'Housing 2': [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
};

// Backlog per BUD per month
export const BUD_BACKLOG: Record<string, number[]> = {
  'Condo 1':   [120, 118, 108, 112, 114, 105, 102, 100, 110, 120, 130, 135],
  'Condo 2':   [85, 82, 74, 78, 80, 74, 72, 70, 78, 86, 94, 98],
  'Condo 3':   [60, 58, 52, 55, 56, 52, 50, 48, 54, 60, 66, 70],
  'Condo 4':   [40, 38, 36, 38, 39, 38, 37, 36, 40, 44, 48, 50],
  'Housing 1': [95, 90, 78, 80, 80, 72, 68, 65, 74, 82, 90, 95],
  'Housing 2': [55, 52, 48, 50, 51, 48, 46, 45, 50, 56, 62, 66],
};

// LivNex per BUD per month
export const BUD_LIVNEX: Record<string, number[]> = {
  'Condo 1':   [3, 4, 6, 2, 3, 5, 4, 3, 0, 0, 0, 0],
  'Condo 2':   [2, 3, 4, 2, 2, 3, 3, 2, 0, 0, 0, 0],
  'Condo 3':   [2, 2, 3, 1, 1, 2, 2, 2, 0, 0, 0, 0],
  'Condo 4':   [1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  'Housing 1': [3, 4, 5, 3, 3, 5, 4, 4, 0, 0, 0, 0],
  'Housing 2': [1, 2, 2, 1, 1, 2, 1, 1, 0, 0, 0, 0],
};

// Pre-LivNex per BUD per month
export const BUD_PRE_LIVNEX: Record<string, number[]> = {
  'Condo 1':   [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  'Condo 2':   [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  'Condo 3':   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Condo 4':   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Housing 1': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Housing 2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

// MTOP Target per BUD per month
export const BUD_TARGET: Record<string, number[]> = {
  'Condo 1':   [15, 18, 28, 12, 15, 25, 18, 18, 20, 20, 20, 15],
  'Condo 2':   [12, 15, 22, 12, 14, 20, 15, 15, 18, 18, 18, 12],
  'Condo 3':   [12, 14, 20, 10, 12, 18, 14, 14, 16, 16, 16, 10],
  'Condo 4':   [10, 12, 18, 10, 12, 16, 12, 12, 14, 14, 14, 10],
  'Housing 1': [15, 18, 25, 14, 16, 22, 18, 18, 20, 20, 20, 15],
  'Housing 2': [14, 16, 24, 14, 16, 20, 18, 18, 18, 18, 18, 14],
};
