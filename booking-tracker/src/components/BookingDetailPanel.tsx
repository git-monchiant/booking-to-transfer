'use client';

import { useState } from 'react';
import { Booking, STAGE_CONFIG, Stage, formatMoney } from '@/data/bookings';
import { X, Phone, ChevronDown, ChevronRight, Info, User, CreditCard, ClipboardCheck, ArrowRightLeft, Wifi, BarChart3, MessageSquare, Wallet, Gauge, Gift, AlertTriangle, Clock } from 'lucide-react';
import { SLATimeline } from '@/components/SLATimeline';

// ─── Helpers ───
const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function dateToMonthKey(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  return `${parts[1]}/${parts[2]}`;
}

function monthKeyToLabel(key: string): string {
  const [mm, yyyy] = key.split('/');
  return `${THAI_MONTHS[parseInt(mm, 10) - 1]} ${yyyy}`;
}

function generateMonthOptions(): string[] {
  const options: string[] = [];
  const now = new Date();
  for (let offset = -3; offset <= 12; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    options.push(`${mm}/${yyyy}`);
  }
  return options;
}

function bankDisplayName(code: string): string {
  return code === 'JD' ? 'Jaidee(JD)' : code;
}

// Bank brand colors — chip bg + white text
const BANK_CHIP: Record<string, string> = {
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
  Proptiane: 'bg-green-500',
};

function BankChip({ code }: { code: string }) {
  const bg = BANK_CHIP[code] || 'bg-slate-500';
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold text-white ${bg}`}>
      {bankDisplayName(code)}
    </span>
  );
}

// ─── Tiny UI atoms ───
function Val({ v, green, red }: { v: string | null | undefined; green?: boolean; red?: boolean }) {
  if (!v) return <span className="text-slate-300">—</span>;
  return <span className={red ? 'text-red-600 font-medium' : green ? 'text-emerald-600 font-medium' : 'text-slate-800'}>{v}</span>;
}

function ResultChip({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-300 text-[10px]">—</span>;
  const fail = value === 'ไม่ผ่าน' || value.includes('ไม่อนุมัติ') || value.includes('ค้างชำระ') || value === 'อาณัติ' || value === 'ยกเลิก' || value === 'ปฏิเสธ';
  const pass = !fail && (value === 'ผ่าน' || value.includes('อนุมัติ') || value.includes('Pre-approve') || value.includes('บูโรปกติ') || value === 'ทำสัญญาแล้ว');
  const cls = pass ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : fail ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200';
  return <span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-medium ${cls}`}>{value}</span>;
}

function ResultBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-300">—</span>;
  const isFail = value === 'ไม่ผ่าน' || value.includes('ไม่อนุมัติ') || value.includes('ค้างชำระ') || value === 'อาณัติ' || value === 'ยกเลิก' || value === 'ปฏิเสธ';
  const isPass = !isFail && (value === 'ผ่าน' || value.includes('อนุมัติ') || value.includes('Pre-approve') || value.includes('บูโรปกติ') || value === 'ทำสัญญาแล้ว');
  return (
    <span className={`font-medium ${isPass ? 'text-emerald-600' : isFail ? 'text-red-500' : 'text-amber-600'}`}>
      {value}
    </span>
  );
}

// ─── Sub-header inside sections ───
function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100">
      {children}
    </div>
  );
}

// ─── Collapsible Section with colored header ───
function Section({ title, icon: Icon, defaultOpen = true, count, badge, children }: {
  title: string; icon?: React.ComponentType<{ className?: string }>; defaultOpen?: boolean; count?: string; badge?: React.ReactNode; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 transition-all text-left"
      >
        {Icon && <Icon className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />}
        <span className="text-xs font-semibold flex-1 text-white">{title}</span>
        {badge}
        {count && <span className="text-[10px] text-slate-300">{count}</span>}
        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Key-Value Row ───
function Row({ label, children, highlight }: { label: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between px-3 py-1.5 text-xs ${highlight ? 'bg-amber-50/40' : ''}`}>
      <span className="text-slate-400 min-w-[90px] shrink-0">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

// ─── Striped table helper ───
function MiniTable({ headers, rows, colWidths }: { headers: string[]; rows: (string | React.ReactNode)[][]; colWidths?: string[] }) {
  return (
    <table className="w-full text-[11px]">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-100">
          {headers.map((h, i) => (
            <th key={i} className="px-3 py-1.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider" style={colWidths?.[i] ? { width: colWidths[i] } : undefined}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className={ri % 2 === 1 ? 'bg-slate-50/40' : ''}>
            {row.map((cell, ci) => (
              <td key={ci} className="px-3 py-2 text-[11px]">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Pipeline Stepper (pill-based, 2 tracks) ───
function PipelineStepper({ current, cancelled }: { current: Stage; cancelled: boolean }) {
  if (cancelled) {
    return (
      <div className="flex items-center justify-center py-3">
        <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-600">ยกเลิก</span>
      </div>
    );
  }

  const ORDER: Record<string, number> = { booking: 0, contract: 1, credit: 2, inspection: 3, ready: 4, transferred: 5 };
  const ci = ORDER[current] ?? -1;

  type NS = 'done' | 'active' | 'future';
  const s = {
    booking:      (ci > 0 ? 'done' : ci === 0 ? 'active' : 'future') as NS,
    contract:     (ci > 1 ? 'done' : ci === 1 ? 'active' : 'future') as NS,
    credit:       (ci >= 3 ? 'done' : ci === 2 ? 'active' : 'future') as NS,
    credit_pass:  (ci >= 4 ? 'done' : ci === 3 ? 'active' : 'future') as NS,
    inspection:   (ci >= 4 ? 'done' : (ci === 2 || ci === 3) ? 'active' : 'future') as NS,
    insp_pass:    (ci >= 4 ? 'done' : ci === 3 ? 'active' : 'future') as NS,
    ready:        (ci >= 5 ? 'done' : ci === 4 ? 'active' : 'future') as NS,
    transferred:  (ci === 5 ? 'active' : 'future') as NS,
  };

  const Pill = ({ id, label, state }: { id: string; label: string; state: NS }) => {
    const cfg = STAGE_CONFIG[id as Stage] || STAGE_CONFIG.inspection;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border-[1.5px] transition-all ${
          state === 'active' ? 'shadow-sm' : ''
        }`}
        style={{
          borderColor: state === 'future' ? '#e2e8f0' : cfg.color,
          backgroundColor: state === 'done' ? cfg.color : state === 'active' ? cfg.bg : 'white',
          color: state === 'done' ? 'white' : state === 'active' ? cfg.color : '#94a3b8',
          boxShadow: state === 'active' ? `0 0 0 3px ${cfg.color}25` : undefined,
        }}
      >
        {state === 'done' && <span className="text-[10px]">✓</span>}
        {label}
      </span>
    );
  };

  const hLine = (done: boolean) => `h-[1.5px] mx-0.5 ${done ? 'bg-slate-400' : 'bg-slate-200'}`;

  return (
    <div
      className="py-3 px-1"
      style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr auto 1fr auto 1fr auto', rowGap: '6px', alignItems: 'center' }}
    >
      {/* Track 1: จอง → สัญญา → สินเชื่อ → อนุมัติ → เตรียมโอน → โอน */}
      <Pill id="booking" label="จอง" state={s.booking} />
      <div className={hLine(s.booking === 'done')} />
      <Pill id="contract" label="สัญญา" state={s.contract} />
      <div className={hLine(s.contract === 'done')} />
      <Pill id="credit" label="สินเชื่อ" state={s.credit} />
      <div className={hLine(s.credit === 'done')} />
      <Pill id="credit" label="อนุมัติ" state={s.credit_pass} />
      <div className={hLine(s.credit_pass === 'done')} />
      <Pill id="ready" label="เตรียมโอน" state={s.ready} />
      <div className={hLine(s.ready === 'done')} />
      <Pill id="transferred" label="โอน" state={s.transferred} />

      {/* Track 2: ตรวจบ้าน → ตรวจผ่าน */}
      <div /><div /><div /><div />
      <Pill id="inspection" label="ตรวจบ้าน" state={s.inspection} />
      <div className={hLine(s.inspection === 'done')} />
      <Pill id="inspection" label="ตรวจผ่าน" state={s.insp_pass} />
      <div /><div /><div /><div />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
interface Props {
  booking: Booking;
  onClose: () => void;
  onTransferMonthChange?: (bookingId: string, monthKey: string) => void;
  currentView?: string;
}

export function BookingDetailPanel({ booking, onClose, onTransferMonthChange, currentView }: Props) {
  const b = booking;
  const initialMonth = dateToMonthKey(b.transfer_target_date);
  const [transferMonth, setTransferMonth] = useState<string>(initialMonth || '');
  const [upside, setUpside] = useState<boolean>(!!b.transfer_upside_flag);
  const [banksOpen, setBanksOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<'detail' | 'sla'>('detail');
  const isAfterView = ['after-transfer','refund','meter','freebie','pending-work'].includes(currentView || '');
  const monthOptions = generateMonthOptions();
  if (initialMonth && !monthOptions.includes(initialMonth)) {
    monthOptions.unshift(initialMonth);
    monthOptions.sort();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-slate-50 shadow-2xl overflow-y-auto flex flex-col">

        {/* ── Sticky Header ── */}
        <div className={`sticky top-0 z-10 border-b px-6 py-3 shadow-sm ${
          b.stage === 'cancelled' ? 'bg-red-600 border-red-700' :
          b.stage === 'transferred' ? 'bg-teal-600 border-teal-700' :
          'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white' : 'text-slate-800'}`}>{b.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'bg-white/20 text-white' : b.backlog_old_flag ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {b.stage === 'cancelled' ? 'Cancelled' : b.stage === 'transferred' ? 'Transferred' : b.backlog_old_flag ? 'Backlog' : 'ขายในเดือน'}
              </span>
            </div>
            <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${b.stage === 'cancelled' ? 'hover:bg-red-500' : b.stage === 'transferred' ? 'hover:bg-teal-500' : 'hover:bg-slate-100'}`}><X className={`w-4 h-4 ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white/70' : 'text-slate-400'}`} /></button>
          </div>

          {/* Row 2: Project + Aging */}
          <div className={`flex items-center gap-2 mt-1 text-sm ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white/80' : ''}`}>
            <span className={`font-medium ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white' : 'text-slate-700'}`}>{b.project_name}</span>
            <span className={`ml-auto ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white/70' : 'text-slate-500'}`}>Aging <span className={`font-semibold ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white' : 'text-slate-700'}`}>{b.aging_days}</span> วัน</span>
          </div>

          {/* Row 3: Unit | แบบบ้าน | Aging | Price + เป้าโอน */}
          <div className={`flex items-center gap-2 mt-0.5 text-sm ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white/70' : 'text-slate-500'}`}>
            <span>Unit <span className={`font-semibold ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white' : 'text-slate-700'}`}>{b.unit_no}</span></span>
            {b.house_type && <><span className={b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white/40' : 'text-slate-300'}>|</span><span>{b.house_type}</span></>}
            <span className={b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white/40' : 'text-slate-300'}>|</span>
            <span>฿<span className={`font-semibold ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white' : 'text-slate-700'}`}>{formatMoney(b.net_contract_value)}</span></span>
            {b.booking_date && <><span className={b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white/40' : 'text-slate-300'}>|</span><span className="text-xs">จอง <span className={`font-semibold ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white' : 'text-slate-700'}`}>{b.booking_date}</span></span></>}

            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={upside} onChange={(e) => setUpside(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400 cursor-pointer" />
                <span className={`text-xs font-medium ${upside ? 'text-emerald-500' : b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white/50' : 'text-slate-400'}`}>Upside</span>
              </label>
              <span className={`text-xs ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white/50' : 'text-slate-400'}`}>เป้าโอน</span>
              <div className="relative">
                <select
                  value={transferMonth}
                  onChange={(e) => { setTransferMonth(e.target.value); onTransferMonthChange?.(b.id, e.target.value); }}
                  className={`appearance-none border rounded-md pl-2 pr-6 py-1 text-xs font-medium hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                >
                  <option value="">— ยังไม่กำหนด —</option>
                  {monthOptions.map(mk => <option key={mk} value={mk}>{monthKeyToLabel(mk)}</option>)}
                </select>
                <ChevronDown className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${b.stage === 'cancelled' || b.stage === 'transferred' ? 'text-white/50' : 'text-slate-400'}`} />
              </div>
            </div>
          </div>

        </div>

        {/* ── Content ── */}
        <div className="flex-1 px-6 pb-6 space-y-2">

          {/* ── Tab Buttons ── */}
          <div className="flex gap-1 pt-1 border-b border-slate-200 -mx-6 px-6">
            <button
              onClick={() => setPanelTab('detail')}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition -mb-px ${
                panelTab === 'detail'
                  ? 'border-slate-700 text-slate-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Info className="w-3 h-3 inline mr-1 -mt-0.5" />
              รายละเอียด
            </button>
            <button
              onClick={() => setPanelTab('sla')}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition -mb-px ${
                panelTab === 'sla'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
              SLA Timeline
            </button>
          </div>

          {panelTab === 'detail' && (<>

          {/* ════════════════ Pipeline Stepper ════════════════ */}
          <PipelineStepper current={b.stage} cancelled={b.stage === 'cancelled'} />

          {/* ── ผู้รับผิดชอบ ── */}
          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] text-slate-500 px-1">
            {([
              ['Sale', b.sale_name], ['CO', b.credit_owner], ['CS', b.cs_owner],
              ['CON', b.inspection_officer], ['OPM', b.OPM], ['BUD', b.BUD], ['Head CO', b.head_co],
            ] as [string, string | null][]).map(([label, val], i) => (
              <span key={label} className="flex items-center gap-1">
                {i > 0 && <span className="text-slate-300 mr-1">|</span>}
                {label} <span className="text-slate-700 font-medium">{val || '—'}</span>
              </span>
            ))}
          </div>

          {/* ═══ 1. ข้อมูลพื้นฐาน ═══ */}
          <Section
            title="ข้อมูลพื้นฐาน"
            icon={Info}
            defaultOpen={false}
            badge={
              <span className="text-xs text-white/70 flex items-center gap-2">
                {b.unit_no && <span>Unit: {b.unit_no}</span>}
                {b.booking_date && <><span className="text-white/70">|</span><span>จอง: {b.booking_date}</span></>}
                {b.contract_date && <><span className="text-white/70">|</span><span>สัญญา: {b.contract_date}</span></>}
                {b.booking_type && <><span className="text-white/70">|</span><span>ประเภท: {b.booking_type}</span></>}
                {b.credit_request_type && <><span className="text-white/70">|</span><span>สินเชื่อ: {b.credit_request_type}</span></>}
              </span>
            }
          >
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div>
                <SubHead>โครงการ / ห้อง</SubHead>
                <Row label="โครงการ"><Val v={b.project_name} /></Row>
                <Row label="รหัสโครงการ"><Val v={b.project_code} /></Row>
                <Row label="ห้อง/แปลง"><Val v={b.unit_no ? `Unit ${b.unit_no}` : null} /></Row>
                <Row label="บ้านเลขที่"><Val v={b.house_reg_no} /></Row>
                <Row label="แบบบ้าน"><Val v={b.house_type} /></Row>
              </div>
              <div>
                <SubHead>สัญญา / การขาย</SubHead>
                <Row label="จอง"><Val v={b.booking_date} /></Row>
                <Row label="สัญญา"><Val v={b.contract_date} /></Row>
                <Row label="ครบดาวน์">
                  {b.booking_date || b.down_payment_complete_date ? (
                    <span className="text-slate-700 text-[11px]">
                      {b.contract_date || '—'} <span className="text-slate-400">-</span> {b.down_payment_complete_date || '—'}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </Row>
                <Row label="ประเภทจอง"><Val v={b.booking_type} /></Row>
                <Row label="สินเชื่อ"><Val v={b.credit_request_type} /></Row>
              </div>
            </div>
          </Section>

          {/* ═══ 2. ลูกค้า ═══ */}
          <Section title="ลูกค้า" icon={User} defaultOpen={false} badge={
              <span className="text-xs text-white/70 flex items-center gap-2">
                <span>{b.customer_name}</span>
                {b.customer_occupation && <><span className="text-white/40">|</span><span>อาชีพ: {b.customer_occupation}</span></>}
                {b.customer_monthly_income && <><span className="text-white/40">|</span><span>รายได้: ฿{formatMoney(b.customer_monthly_income)}/เดือน</span></>}
              </span>
            }>
            <div className="px-3 py-2.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <span className="text-sm font-semibold text-slate-800">{b.customer_name}</span>
              <span className="flex items-center gap-1 text-xs text-blue-600 font-medium"><Phone className="w-3 h-3" />{b.customer_tel}</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div>
                <Row label="อาชีพ"><Val v={b.customer_occupation} /></Row>
                <Row label="อายุ"><Val v={b.customer_age ? `${b.customer_age} ปี (${b.customer_age_range || ''})` : null} /></Row>
                <Row label="รายได้/เดือน"><Val v={b.customer_monthly_income ? `฿${formatMoney(b.customer_monthly_income)}` : null} /></Row>
                <Row label="หนี้สิน"><Val v={b.customer_debt} /></Row>
              </div>
              <div>
                <Row label="LTV"><Val v={b.customer_ltv} /></Row>
                <Row label="วัตถุประสงค์"><Val v={b.purchase_objective} /></Row>
                <Row label="เหตุผลซื้อ"><Val v={b.purchase_reason} /></Row>
                <Row label="ซื้อเพื่อ"><Val v={b.obj_purchase} /></Row>
              </div>
            </div>
          </Section>

          {/* ═══ 3. สินเชื่อ — Credit Process ═══ */}
          <Section
            title="สินเชื่อ — Credit Process"
            icon={CreditCard}
            defaultOpen={!isAfterView}
            count={`${b.banks_submitted.length} ธนาคาร`}
            badge={b.credit_status ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white/80 font-medium">{b.credit_status}</span> : undefined}
          >
            {/* เอกสาร — step 1: บูโร → step 2: Bank + JD (พร้อมกัน) */}
            <div className="px-3 py-1.5 flex items-center justify-between bg-slate-50/80 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">เตรียมเอกสารยื่นสินเชื่อ</span>
              {b.credit_owner && <span className="text-[10px] text-slate-400">CO: <span className="text-slate-600 font-medium">{b.credit_owner}</span></span>}
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100 text-[11px]">
              {/* Step 1: เตรียมเอกสารเช็คบูโร */}
              <div className="px-3 py-2">
                <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">① เตรียมเอกสารเช็คบูโร</div>
                <div className="text-slate-700 font-medium">{b.doc_bureau_date || <span className="text-slate-300 font-normal">—</span>}</div>
              </div>
              {/* Step 2a: เอกสารครบ(Bank) */}
              <div className="px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">② เอกสารครบ(Bank)</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold ${b.doc_complete_bank_jd_date ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{b.doc_complete_bank_jd_date ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}</span>
                </div>
                <div className="space-y-0.5">
                  <div><span className="text-slate-500">ครบ: </span><span className="text-slate-700">{b.doc_complete_bank_jd_date || <span className="text-slate-300">—</span>}</span></div>
                  <div><span className="text-slate-500">ขอเพิ่ม: </span><span className={b.bank_request_more_doc_date ? 'text-amber-600 font-medium' : 'text-slate-300'}>{b.bank_request_more_doc_date || '—'}</span></div>
                </div>
              </div>
              {/* Step 2b: เอกสารครบ(JD) */}
              <div className="px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">② เอกสารครบ(JD)</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold ${b.doc_complete_jd_date ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{b.doc_complete_jd_date ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}</span>
                </div>
                <div className="space-y-0.5">
                  <div><span className="text-slate-500">ครบ: </span><span className="text-slate-700">{b.doc_complete_jd_date || <span className="text-slate-300">—</span>}</span></div>
                  <div><span className="text-slate-500">ขอเพิ่ม: </span><span className={b.jd_request_more_doc_date ? 'text-amber-600 font-medium' : 'text-slate-300'}>{b.jd_request_more_doc_date || '—'}</span></div>
                </div>
              </div>
            </div>

            {/* ผลอนุมัติ — flow cards: บูโร › Bank เบื้องต้น › Bank อนุมัติจริง */}
            <div className="px-3 py-1.5 flex items-center justify-between bg-slate-50/80 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ผลอนุมัติ</span>
              {b.selected_bank && <span className="text-[10px] text-slate-400">ธนาคาร: <span className="text-slate-600 font-medium">{bankDisplayName(b.selected_bank)}</span></span>}
            </div>
            {(() => {
              const steps = [
                { label: 'บูโร', target: b.bureau_target_result_date_biz, actual: b.bureau_actual_result_date, result: b.bureau_result },
                { label: 'Bank เบื้องต้น', target: b.bank_preapprove_target_date_biz, actual: b.bank_preapprove_actual_date, result: b.bank_preapprove_result },
                { label: 'Bank อนุมัติจริง', target: b.bank_final_target_date_biz, actual: b.bank_final_actual_date, result: b.bank_final_result },
              ];
              const lastDone = steps.reduce((acc, s, i) => s.result ? i : acc, -1);
              return (
                <div className="flex items-stretch px-3 py-3 gap-0">
                  {steps.map((step, i) => {
                    const hasResult = !!step.result;
                    const isFail = hasResult && (step.result === 'ไม่ผ่าน' || step.result!.includes('ไม่อนุมัติ') || step.result === 'ปฏิเสธ');
                    const isPass = hasResult && !isFail && (step.result === 'ผ่าน' || step.result!.includes('อนุมัติ') || step.result!.includes('Pre-approve') || step.result!.includes('บูโรปกติ'));
                    const isNext = !hasResult && i === lastDone + 1;
                    const accent = isPass ? 'bg-emerald-500' : isFail ? 'bg-red-500' : hasResult ? 'bg-amber-500' : isNext ? 'bg-amber-300' : 'bg-slate-200';
                    const border = isPass ? 'border-emerald-200' : isFail ? 'border-red-200' : isNext ? 'border-amber-200' : 'border-slate-200';
                    const badgeCls = isPass ? 'bg-emerald-100 text-emerald-700' : isFail ? 'bg-red-100 text-red-700' : hasResult ? 'bg-amber-100 text-amber-700' : isNext ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400';
                    const labelCls = isPass ? 'text-emerald-700' : isFail ? 'text-red-600' : hasResult ? 'text-amber-700' : isNext ? 'text-amber-600' : 'text-slate-500';
                    return (
                      <div key={i} className="flex items-stretch flex-1 min-w-0">
                        {i > 0 && <div className="w-1.5 flex-shrink-0" />}
                        <div className={`flex-1 flex flex-col rounded-lg border overflow-hidden shadow-sm ${border}`}>
                          <div className={`h-[3px] ${accent}`} />
                          <div className="bg-white px-2.5 py-2 flex flex-col flex-1">
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className={`w-[18px] h-[18px] rounded-full text-[8px] font-bold flex items-center justify-center flex-shrink-0 ${badgeCls}`}>
                                {isPass ? '✓' : isFail ? '✗' : i + 1}
                              </span>
                              <span className={`text-[10px] font-semibold leading-tight whitespace-nowrap ${labelCls}`}>{step.label}</span>
                            </div>
                            <div className="space-y-0.5 text-[10px]">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-400 text-[9px]">กำหนด</span>
                                <span className="text-slate-500 text-[9px] tabular-nums">{step.target || '—'}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-400 text-[9px]">จริง</span>
                                <span className={`text-[9px] tabular-nums ${step.actual ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>{step.actual || '—'}</span>
                              </div>
                            </div>
                            <div className="mt-auto pt-1.5 border-t border-slate-100 flex">
                              {hasResult ? (
                                <ResultChip value={step.result} />
                              ) : (
                                <span className="inline-flex px-1.5 py-0.5 rounded border text-[10px] font-medium bg-slate-50 text-slate-400 border-slate-200">รอผล</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ธนาคารที่ยื่น — summary bar + JD row + expandable cards */}
            {b.banks_submitted.length > 0 && (() => {
              const selected = b.selected_bank ? b.banks_submitted.find(bs => bs.bank === b.selected_bank) : null;
              const isApproved = !!selected && !!selected.result?.includes('อนุมัติ') && !selected.result?.includes('ไม่อนุมัติ');
              const jdHasResult = !!b.livnex_able_status;
              const jdPass = jdHasResult && b.livnex_able_status!.startsWith('อนุมัติ');
              const jdFail = jdHasResult && b.livnex_able_status!.startsWith('ไม่อนุมัติ');
              return (
                <>
                  <button
                    onClick={() => setBanksOpen(!banksOpen)}
                    className="w-full px-3 py-2 text-xs text-left cursor-pointer border-t border-slate-100 hover:bg-slate-50 transition-colors bg-slate-50/40"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Bank credit */}
                        <span className={`font-semibold ${isApproved ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {isApproved ? '✓ สินเชื่อผ่าน' : '⏳ รอผลสินเชื่อ'}
                        </span>
                        {selected ? (
                          <>
                            <span className="text-slate-500">{bankDisplayName(selected.bank)}</span>
                            {selected.approved_amount && <span className="text-emerald-700 font-medium">฿{formatMoney(selected.approved_amount)}</span>}
                          </>
                        ) : (
                          <span className="text-slate-400">ยังไม่เลือก</span>
                        )}
                        {b.co_remark && <span className="text-slate-400 text-[10px] italic">&ldquo;{b.co_remark}&rdquo;</span>}
                        {/* Separator */}
                        <span className="w-px h-4 bg-slate-200 mx-3" />
                        {/* LivNex / JD */}
                        <span className={`font-semibold ${jdPass ? 'text-indigo-700' : jdFail ? 'text-red-600' : 'text-slate-500'}`}>
                          {jdPass ? '✓' : jdFail ? '✗' : '⏳'} Livnex able
                        </span>
                        {jdHasResult ? (
                          <ResultBadge value={b.livnex_able_status} />
                        ) : (
                          <span className="text-slate-400">รอผล</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-slate-400">{b.banks_submitted.length} ธนาคาร</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${banksOpen ? '' : '-rotate-90'}`} />
                      </div>
                    </div>
                  </button>

                  {banksOpen && (
                    <div className="border-t border-slate-100">
                      {[...b.banks_submitted]
                        .sort((a, _b) => a.bank === 'JD' ? 1 : _b.bank === 'JD' ? -1 : 0)
                        .map((bs, i) => {
                          const isJD = bs.bank === 'JD';
                          const steps = isJD ? [
                            { label: 'บูโร', target: b.bureau_target_result_date_biz, actual: b.bureau_actual_result_date, result: b.bureau_result },
                            { label: 'เข้าโครงการ', target: b.jd_final_target_date, actual: b.jd_final_actual_date, result: b.livnex_able_status },
                          ] : [
                            { label: 'บูโร', target: b.bureau_target_result_date_biz, actual: b.bureau_actual_result_date, result: b.bureau_result },
                            { label: 'เบื้องต้น', target: b.bank_preapprove_target_date_biz, actual: bs.preapprove_date, result: bs.preapprove_result },
                            { label: 'อนุมัติจริง', target: b.bank_final_target_date_biz, actual: bs.result_date, result: bs.result },
                          ];
                          return (
                            <div key={i} className={i > 0 ? 'border-t border-slate-100' : ''}>
                              <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50/60">
                                <BankChip code={bs.bank} />
                                <span className="text-slate-400 text-[10px]">ยื่น {bs.submit_date || '—'}</span>
                                {!isJD && bs.approved_amount ? <span className="ml-auto font-semibold text-emerald-600">฿{formatMoney(bs.approved_amount)}</span> : null}
                              </div>
                              <div className="grid divide-x divide-slate-100 grid-cols-3" style={isJD ? { gridTemplateColumns: '1fr 2fr' } : undefined}>
                                {steps.map((step, si) => {
                                  const isFail = !!step.result && (step.result.includes('ไม่อนุมัติ') || step.result.includes('ค้างชำระ') || step.result === 'อาณัติ' || step.result === 'ยกเลิก' || step.result === 'ปฏิเสธ');
                                  const isPass = !!step.result && !isFail && (step.result.includes('อนุมัติ') || step.result.includes('บูโรปกติ') || step.result === 'ผ่าน');
                                  const stepBg = isPass ? 'bg-emerald-50' : isFail ? 'bg-red-50' : '';
                                  return (
                                  <div key={si} className={`px-3 py-2 space-y-1 ${stepBg}`}>
                                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{si + 1}. {step.label}</div>
                                    <div className="space-y-0.5 text-[10px]">
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-400">กำหนด</span>
                                        <span className="text-slate-500 tabular-nums">{step.target || '—'}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-400">จริง</span>
                                        <span className={`tabular-nums ${step.actual ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>{step.actual || '—'}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <ResultChip value={step.result} />
                                    </div>
                                  </div>
                                  );
                                })}
                              </div>
                              {bs.remark && <div className="text-[10px] text-slate-500 px-3 py-1 italic">{bs.remark}</div>}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Follow-up */}
          </Section>

          {/* ═══ 4. ตรวจบ้าน / Inspection ═══ */}
          <Section
            title="ตรวจบ้าน / Inspection"
            icon={ClipboardCheck}
            defaultOpen={!isAfterView}
            badge={b.inspection_status ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white/80 font-medium">{b.inspection_status}</span> : undefined}
          >
            {/* SubHead: รอบตรวจ + CS / CON */}
            <div className="px-3 py-1.5 flex items-center justify-between bg-slate-50/80 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">รอบตรวจ</span>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                {b.cs_owner && <span>CS: <span className="text-slate-600 font-medium">{b.cs_owner}</span></span>}
                {b.inspection_officer && <span>CON: <span className="text-slate-600 font-medium">{b.inspection_officer}</span></span>}
                {b.hired_inspector && <span>ผู้ตรวจ: <span className="text-slate-600 font-medium">{b.hired_inspector}</span></span>}
              </div>
            </div>

            {/* Inspection rounds */}
            <MiniTable
              headers={['รอบ', 'กำหนดตรวจ', 'ห้องพร้อม', 'นัดลูกค้าเข้าตรวจ', 'ตรวจจริง', 'ผลการตรวจ']}
              colWidths={['10%', '14%', '14%', '14%', '14%', '']}

              rows={([
                ['ตรวจ 1', b.inspect1_notify_target_date_biz, b.inspect1_ready_date, b.inspect1_appointment_date, b.inspect1_actual_date, b.inspect1_result],
                ['ตรวจ 2', b.inspect2_ready_target_date_biz, b.inspect2_ready_date, b.inspect2_appointment_date, b.inspect2_actual_date, b.inspect2_result],
                ['ตรวจ 3', b.inspect3_ready_target_date_biz, b.inspect3_ready_date, b.inspect3_appointment_date, b.inspect3_actual_date, b.inspect3_result],
              ] as const).map(([round, target, ready, appt, actual, result]) => [
                <span key="r" className="font-medium text-slate-600">{round}</span>,
                <Val key="t" v={target} />,
                <Val key="rd" v={ready} />,
                <Val key="ap" v={appt} />,
                <Val key="ac" v={actual} />,
                <ResultChip key="res" value={result} />,
              ])}
            />

            {/* Summary — ด้านล่าง */}
            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/40">
              <div className="flex items-center gap-3 text-xs flex-wrap">
                {b.handover_accept_date && <span className="text-emerald-600 font-medium">ลูกค้ารับห้อง: {b.handover_accept_date}</span>}
                <span className="text-slate-500">วิธีการตรวจ: <Val v={b.inspection_method} /></span>
                <span className="text-slate-500">QC(5.5): <Val v={b.unit_ready_inspection_date} /></span>
              </div>
            </div>
          </Section>

          {/* ═══ 5. โอน / Transfer ═══ */}
          <Section
            title="โอน / Transfer"
            icon={ArrowRightLeft}
            defaultOpen={!isAfterView}
            badge={b.transfer_status ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white/80 font-medium">{b.transfer_status}</span> : undefined}
          >
            {/* SubHead: ขั้นตอนโอน + ชื่อคน */}
            <div className="px-3 py-1.5 flex items-center justify-between bg-slate-50/80 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ขั้นตอนโอน</span>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                {b.credit_owner && <span>CO: <span className="text-slate-600 font-medium">{b.credit_owner}</span></span>}
              </div>
            </div>

            {/* Flow cards — same style as credit ผลอนุมัติ */}
            {(() => {
              const steps = [
                { label: 'สัญญา Bank', value: b.bank_contract_date },
                { label: 'ส่งชุดโอน', value: b.transfer_package_sent_date },
                { label: 'ปลอดโฉนด', value: b.title_clear_date },
                { label: 'เป้าโอน', value: b.transfer_target_date },
                { label: 'นัดโอน', value: b.transfer_appointment_date },
                { label: 'โอนจริง', value: b.transfer_actual_date },
              ];
              const lastDone = steps.reduce((acc, s, i) => s.value ? i : acc, -1);
              return (
                <div className="flex items-stretch px-3 py-3 gap-0">
                  {steps.map((step, i) => {
                    const done = !!step.value;
                    const isNext = !done && i === lastDone + 1;
                    const isLast = i === steps.length - 1;
                    const isFinal = isLast && done;
                    const accent = isFinal ? 'bg-emerald-500' : done ? 'bg-emerald-400' : isNext ? 'bg-amber-300' : 'bg-slate-200';
                    const border = isFinal ? 'border-emerald-300' : done ? 'border-emerald-200' : isNext ? 'border-amber-200' : 'border-slate-200';
                    const badgeCls = isFinal ? 'bg-emerald-100 text-emerald-700' : done ? 'bg-emerald-100 text-emerald-700' : isNext ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400';
                    const labelCls = isFinal ? 'text-emerald-700' : done ? 'text-emerald-700' : isNext ? 'text-amber-600' : 'text-slate-500';
                    return (
                      <div key={i} className="flex items-stretch flex-1 min-w-0">
                        {i > 0 && <div className="w-1.5 flex-shrink-0" />}
                        <div className={`flex-1 flex flex-col rounded-lg border overflow-hidden shadow-sm ${border}`}>
                          <div className={`h-[3px] ${accent}`} />
                          <div className="bg-white px-2 py-2 flex flex-col flex-1">
                            <div className="flex items-center gap-1 mb-1.5">
                              <span className={`w-[16px] h-[16px] rounded-full text-[7px] font-bold flex items-center justify-center flex-shrink-0 ${badgeCls}`}>
                                {done ? '✓' : i + 1}
                              </span>
                              <span className={`text-[9px] font-semibold leading-tight whitespace-nowrap ${labelCls}`}>{step.label}</span>
                            </div>
                            <div className="mt-auto pt-1.5 border-t border-slate-100">
                              <span className={`text-[10px] tabular-nums font-medium ${isFinal ? 'text-emerald-800' : done ? 'text-slate-700' : 'text-slate-300'}`}>
                                {step.value || '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Summary — ด้านล่าง */}
            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/40">
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="text-slate-500">แจ้งปลอดโฉนด: <Val v={b.title_clear_notify_date} /></span>
                <span className="text-slate-500">Fin Day นัด: <Val v={b.fin_day_appointment_date} /></span>
                <span className="text-slate-500">โบนัสโอน: <Val v={b.pro_transfer_bonus ? `฿${formatMoney(b.pro_transfer_bonus)}` : null} /></span>
                <span className="text-slate-500">คาดว่าโอน: <Val v={b.expected_transfer_month} /></span>
                {b.transfer_upside_flag && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-medium">{b.transfer_upside_flag}</span>}
                {b.cannot_transfer_issue && <span className="text-red-500 font-medium">ปัญหา: {b.cannot_transfer_issue}</span>}
                {b.reason_not_transfer_this_month && <span className="text-amber-600 font-medium">เหตุผล: {b.reason_not_transfer_this_month}</span>}
              </div>
            </div>

            {/* ยกเลิก */}
            {(b.cancel_flag || b.cancel_date) && (
              <div className="px-3 py-2 text-xs bg-red-50 border-t border-red-200 text-red-600 font-medium">
                ยกเลิก: {b.cancel_date || '—'} {b.cancel_reason && `— ${b.cancel_reason}`}
              </div>
            )}
          </Section>

          {/* ═══ 6. LivNex / Pre-LivNex ═══ */}
          <Section title="LivNex / Pre-LivNex" icon={Wifi} defaultOpen={!isAfterView}>
            {/* SubHead: ขั้นตอน + ผู้รับผิดชอบ */}
            <div className="px-3 py-1.5 flex items-center justify-between bg-slate-50/80 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ขั้นตอน LivNex</span>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                {b.sale_name && <span>Sale: <span className="text-slate-600 font-medium">{b.sale_name}</span></span>}
                {b.cs_owner && <span>CS: <span className="text-slate-600 font-medium">{b.cs_owner}</span></span>}
              </div>
            </div>

            {/* LivNex flow cards */}
            {(() => {
              const livnexSteps = [
                { label: 'นำเสนอ', value: b.livnex_present_date, check: b.sale_offer_livnex_flag },
                { label: 'นัดสัญญา', value: b.livnex_contract_appointment_date },
                { label: 'ทำสัญญาจริง', value: b.livnex_contract_actual_date },
                { label: 'เข้าอยู่', value: b.livnex_move_in_date },
              ];
              const preLivnexSteps = [
                { label: 'นำเสนอ', value: b.pre_livnex_present_date },
                { label: 'นัดสัญญา', value: b.pre_livnex_contract_appointment_date },
                { label: 'ทำสัญญาจริง', value: b.pre_livnex_contract_actual_date },
                { label: 'เข้าอยู่', value: b.pre_livnex_move_in_date },
              ];
              const renderFlow = (steps: { label: string; value: string | null; check?: boolean }[], title: string, cancelDate?: string | null, cancelReason?: string | null) => {
                const lastDone = steps.reduce((acc, s, i) => s.value ? i : acc, -1);
                return (
                  <div>
                    <div className="px-3 pt-2 pb-1 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">{title}</span>
                      {cancelDate && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 font-medium">ยกเลิก {cancelDate}{cancelReason && ` — ${cancelReason}`}</span>}
                    </div>
                    <div className="flex items-stretch px-3 pb-3 gap-0">
                      {steps.map((step, i) => {
                        const done = !!step.value;
                        const isNext = !done && i === lastDone + 1;
                        const isLast = i === steps.length - 1;
                        const isFinal = isLast && done;
                        const accent = isFinal ? 'bg-emerald-500' : done ? 'bg-emerald-400' : isNext ? 'bg-amber-300' : 'bg-slate-200';
                        const border = isFinal ? 'border-emerald-300' : done ? 'border-emerald-200' : isNext ? 'border-amber-200' : 'border-slate-200';
                        const badgeCls = isFinal ? 'bg-emerald-100 text-emerald-700' : done ? 'bg-emerald-100 text-emerald-700' : isNext ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400';
                        const labelCls = isFinal ? 'text-emerald-700' : done ? 'text-emerald-700' : isNext ? 'text-amber-600' : 'text-slate-500';
                        return (
                          <div key={i} className="flex items-stretch flex-1 min-w-0">
                            {i > 0 && <div className="w-1.5 flex-shrink-0" />}
                            <div className={`flex-1 flex flex-col rounded-lg border overflow-hidden shadow-sm ${border}`}>
                              <div className={`h-[3px] ${accent}`} />
                              <div className="bg-white px-2 py-2 flex flex-col flex-1">
                                <div className="flex items-center gap-1 mb-1.5">
                                  <span className={`w-[16px] h-[16px] rounded-full text-[7px] font-bold flex items-center justify-center flex-shrink-0 ${badgeCls}`}>
                                    {i + 1}
                                  </span>
                                  <span className={`text-[9px] font-semibold leading-tight whitespace-nowrap ${labelCls}`}>{step.label}</span>
                                </div>
                                <div className="mt-auto pt-1.5 border-t border-slate-100">
                                  <span className={`text-[10px] tabular-nums font-medium ${isFinal ? 'text-emerald-800' : done ? 'text-slate-700' : 'text-slate-300'}`}>
                                    {step.check && <span className="text-emerald-500 mr-0.5">✓</span>}{step.value || '—'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              };
              return (
                <>
                  {renderFlow(livnexSteps, 'LivNex', b.livnex_cancel_date, b.livnex_cancel_reason)}
                  <div className="border-t border-slate-100" />
                  {renderFlow(preLivnexSteps, 'Pre-LivNex', b.pre_livnex_cancel_date, b.pre_livnex_cancel_reason)}
                </>
              );
            })()}

            {/* Summary — ด้านล่าง */}
            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/40">
              <div className="flex items-center gap-3 text-xs flex-wrap">
                {/* Livnex Able — ได้/ไม่ได้/รอ */}
                <span className="text-slate-500">Livnex Able: {(() => {
                  if (!b.livnex_able_status) return <span className="text-slate-400">รอตรวจสอบ</span>;
                  const pass = b.livnex_able_status.startsWith('อนุมัติ');
                  const fail = b.livnex_able_status.startsWith('ไม่อนุมัติ');
                  return <span className={`font-semibold ${pass ? 'text-emerald-600' : fail ? 'text-red-500' : 'text-amber-600'}`}>{pass ? 'ได้' : fail ? 'ไม่ได้' : 'รอผล'}</span>;
                })()}</span>
                {/* ผล JD — รายละเอียด */}
                {b.livnex_able_status && <span className="text-slate-500">ผล JD: <ResultBadge value={b.livnex_able_status} /></span>}
                {/* เหตุผล JD — freetext */}
                {b.livnex_able_reason && <span className="text-slate-500">เหตุผล JD: <span className="text-slate-700">{b.livnex_able_reason}</span></span>}
                {b.livnex_contract_sign_status && <span className="text-slate-500">สัญญา: <span className="text-slate-700">{b.livnex_contract_sign_status}</span></span>}
                {b.livnex_followup_note && <span className="text-slate-500">ติดตาม: <span className="text-slate-700">{b.livnex_followup_note}</span></span>}
              </div>
            </div>
          </Section>

          {/* ═══ 7. Backlog / Segmentation ═══ */}
          <Section title="Backlog / Segmentation" icon={BarChart3} defaultOpen={!isAfterView}>
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div>
                <Row label="Backlog Status"><Val v={b.backlog_status} /></Row>
                <Row label="Backlog เดิม"><Val v={b.backlog_old_flag ? 'ใช่' : 'ไม่ใช่'} /></Row>
                <Row label="ขายใหม่/Re-sale"><Val v={b.sale_type_flag} /></Row>
                <Row label="DEC Period"><Val v={b.dec_period} /></Row>
                <Row label="Fiscal Year"><Val v={String(b.fiscal_year)} /></Row>
              </div>
              <div>
                <Row label="No Count"><Val v={b.no_count_flag ? 'ใช่' : 'ไม่ใช่'} /></Row>
              </div>
            </div>
          </Section>

          {/* ═══ 8. After Transfer — 4 sections ═══ */}
          {b.stage === 'transferred' && (<>
            <Section title="เงินทอนลูกค้า" icon={Wallet} defaultOpen={currentView === 'refund' || currentView === 'after-transfer' || !isAfterView}>
              <Row label="สถานะ"><Val v={b.refund_status} /></Row>
              {b.refund_amount !== null && <Row label="จำนวนเงิน"><Val v={`฿${formatMoney(b.refund_amount)}`} /></Row>}
              {b.refund_aging !== null && <Row label="Aging"><Val v={`${b.refund_aging} วัน`} /></Row>}
              <Row label="วันที่คืน"><Val v={b.refund_transfer_date} /></Row>
            </Section>

            <Section title="ของแถมลูกค้า" icon={Gift} defaultOpen={currentView === 'freebie' || currentView === 'after-transfer' || !isAfterView}>
              <Row label="เอกสารส่งมอบ"><Val v={b.handover_document_received_date} /></Row>
            </Section>

            <Section title="การเปลี่ยนชื่อมิเตอร์น้ำ-ไฟ" icon={Gauge} defaultOpen={currentView === 'meter' || currentView === 'after-transfer' || !isAfterView}>
              <Row label="มิเตอร์น้ำ"><Val v={b.water_meter_change_date} /></Row>
              <Row label="มิเตอร์ไฟ"><Val v={b.electricity_meter_change_date} /></Row>
            </Section>

            <Section title="งานซ่อมคงค้าง" icon={AlertTriangle} defaultOpen={currentView === 'pending-work' || currentView === 'after-transfer' || !isAfterView}>
              <Row label="เอกสารส่งมอบ"><Val v={b.handover_document_received_date} /></Row>
            </Section>
          </>)}

          {/* ═══ 9. Follow-up / Notes ═══ */}
          {(b.mgmt_remark || b.followup_note || b.sale_followup_task || b.pm_fast_sent_date || b.cs_review_date) && (
            <Section title="Follow-up / Notes" icon={MessageSquare}>
              {b.mgmt_remark && <Row label="Mgmt Remark"><Val v={b.mgmt_remark} /></Row>}
              {b.followup_note && <Row label="Follow-up"><Val v={b.followup_note} /></Row>}
              {b.sale_followup_task && <Row label="Sale Task"><Val v={b.sale_followup_task} /></Row>}
              {b.pm_fast_sent_date && <Row label="PM Fast ส่ง"><Val v={b.pm_fast_sent_date} /></Row>}
              {b.cs_review_date && <Row label="CS Review"><Val v={b.cs_review_date} /></Row>}
            </Section>
          )}

          </>)}

          {panelTab === 'sla' && (
            <div className="bg-white rounded-lg shadow-sm p-5">
              <SLATimeline booking={b} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
