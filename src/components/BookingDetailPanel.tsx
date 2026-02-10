'use client';

import { useState } from 'react';
import { Booking, STAGE_CONFIG, Stage, formatMoney } from '@/data/bookings';
import { X, Phone, ChevronDown } from 'lucide-react';

// ─── Helper: Thai month labels ───
const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function dateToMonthKey(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  return `${parts[1]}/${parts[2]}`; // MM/YYYY
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

// ─── Helper: Result badge ───
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

// ─── Helper: Bank display name ───
function bankDisplayName(code: string): string {
  return code === 'Proptiane' ? 'Jaidee (JD)' : code;
}

// ─── Helper: Date cell ───
function D({ value }: { value: string | null | undefined }) {
  return value ? <span className="text-slate-700">{value}</span> : <span className="text-slate-300">—</span>;
}

// ─── Helper: Label + Value row ───
function LV({ label, value, bold }: { label: string; value: string | null | undefined; bold?: boolean }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-slate-500">{label}</span>
      {value
        ? <span className={`text-slate-700 ${bold ? 'font-semibold' : ''}`}>{value}</span>
        : <span className="text-slate-300">—</span>
      }
    </div>
  );
}

// ─── Section Header ───
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-1">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h2>
      <div className="flex-1 border-t border-slate-200" />
    </div>
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

  /* ── Pill node ── */
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
      {/* ── Track 1: จอง → สัญญา → สินเชื่อ → อนุมัติ → เตรียมโอน → โอน ── */}
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

      {/* ── Track 2: ตรวจบ้าน → ตรวจผ่าน ── */}
      <div /><div /><div /><div />
      <Pill id="inspection" label="ตรวจบ้าน" state={s.inspection} />
      <div className={hLine(s.inspection === 'done')} />
      <Pill id="inspection" label="ตรวจผ่าน" state={s.insp_pass} />
      <div /><div /><div /><div />
    </div>
  );
}

// ─── Bank Badge ───
function BankBadge({ bank }: { bank: Booking['banks_submitted'][0] }) {
  const colorClass = bank.result?.includes('อนุมัติ') && !bank.result?.includes('ไม่อนุมัติ') ? 'bg-emerald-100 text-emerald-700'
    : bank.result?.includes('ไม่อนุมัติ') ? 'bg-red-100 text-red-700'
    : bank.result === 'รอผล' ? 'bg-amber-100 text-amber-700'
    : 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {bankDisplayName(bank.bank)}
      {bank.approved_amount ? <span className="opacity-75">฿{formatMoney(bank.approved_amount)}</span> : null}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
interface Props {
  booking: Booking;
  onClose: () => void;
  onTransferMonthChange?: (bookingId: string, monthKey: string) => void;
}

export function BookingDetailPanel({ booking, onClose, onTransferMonthChange }: Props) {
  const b = booking;
  const initialMonth = dateToMonthKey(b.transfer_target_date);
  const [transferMonth, setTransferMonth] = useState<string>(initialMonth || '');
  const [upside, setUpside] = useState<boolean>(!!b.transfer_upside_flag);
  const monthOptions = generateMonthOptions();
  // Ensure current value is in options
  if (initialMonth && !monthOptions.includes(initialMonth)) {
    monthOptions.unshift(initialMonth);
    monthOptions.sort();
  }

  // Table cell classes
  const th = 'px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase';
  const td = 'px-2 py-1.5 text-xs';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-3xl bg-white shadow-2xl overflow-y-auto">

        {/* ── Sticky Header ── */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-3 z-10">
          {/* Row 1: ID + Close */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-slate-900">{b.id}</div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Row 2: โครงการ · Unit · Aging · ราคา + เป้าโอน dropdown */}
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
            <span className="font-medium text-slate-800">{b.project_name}</span>
            <span className="text-slate-300">&middot;</span>
            <span className="font-semibold text-slate-800">{b.unit_no}</span>
            <span className="text-slate-300">|</span>
            <span>Aging <span className="font-semibold text-slate-800">{b.aging_days}</span> วัน</span>
            <span className="text-slate-300">|</span>
            <span>฿<span className="font-semibold text-slate-800">{formatMoney(b.net_contract_value)}</span></span>

            {/* เป้าโอน dropdown + Upside — ชิดขวา */}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-slate-500">เป้าโอน</span>
              <div className="relative">
                <select
                  value={transferMonth}
                  onChange={(e) => {
                    setTransferMonth(e.target.value);
                    onTransferMonthChange?.(b.id, e.target.value);
                  }}
                  className="appearance-none bg-white border border-slate-200 rounded-md pl-2 pr-6 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer"
                >
                  <option value="">— ยังไม่กำหนด —</option>
                  {monthOptions.map(mk => (
                    <option key={mk} value={mk}>{monthKeyToLabel(mk)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={upside}
                  onChange={(e) => setUpside(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className={`text-xs font-medium ${upside ? 'text-emerald-600' : 'text-slate-500'}`}>Upside</span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-6 pb-6 space-y-1">

          {/* ════════════════ Pipeline Stepper ════════════════ */}
          <PipelineStepper current={b.stage} cancelled={b.stage === 'cancelled'} />

          {/* ── ผู้รับผิดชอบ ── */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-slate-500 px-1">
            <span>Sale <span className="text-slate-700 font-medium">{b.sale_name}</span></span>
            <span className="text-slate-300">|</span>
            <span>CO <span className="text-slate-700 font-medium">{b.credit_owner || '—'}</span></span>
            <span>CS <span className="text-slate-700 font-medium">{b.cs_owner || '—'}</span></span>
            <span>Backlog <span className="text-slate-700 font-medium">{b.backlog_owner || '—'}</span></span>
            <span>CON <span className="text-slate-700 font-medium">{b.inspection_officer || '—'}</span></span>
          </div>

          {/* ════════════════ ข้อมูลพื้นฐาน ════════════════ */}
          <SectionHeader title="ข้อมูลพื้นฐาน" />

          {/* Card: โครงการ + Sale — compact inline */}
          <div className="rounded-lg border border-slate-200 px-3 py-2 space-y-1.5 text-[11px]">
            {/* โครงการ/ห้อง */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="font-medium text-slate-800 text-xs">{b.project_name}</span>
              <span className="text-slate-500">รหัส <span className="text-slate-700">{b.project_code}</span></span>
              <span className="text-slate-500">ห้อง <span className="text-slate-800 font-medium">{b.unit_no}</span></span>
              <span className="text-slate-500">โซน <span className="text-slate-700">{b.building_zone}</span></span>
              <span className="text-slate-500">ทะเบียน <span className="text-slate-700">{b.house_reg_no}</span></span>
              <span className="text-slate-500">แบบ <span className="text-slate-700">{b.house_type}</span></span>
            </div>
            {/* Sale details */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pt-1.5 border-t border-slate-100">
              <span className="text-slate-500">{b.sale_type} &bull; {b.credit_request_type}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">จอง <span className="text-slate-700">{b.booking_date || '—'}</span></span>
              <span className="text-slate-500">สัญญา <span className="text-slate-700">{b.contract_date || '—'}</span></span>
              <span className="text-slate-500">ครบดาวน์ <span className="text-slate-700">{b.down_payment_complete_date || '—'}</span></span>
              <span className="text-slate-500">ประเภท <span className="text-slate-700">{b.booking_type || '—'}</span></span>
            </div>
            {/* ยกเลิก */}
            {(b.cancel_flag || b.cancel_date || b.cancel_reason) && (
              <div className="flex items-baseline gap-x-3 pt-1.5 border-t border-red-200 text-red-600">
                <span className="font-semibold">ยกเลิก</span>
                <span>{b.cancel_date || '—'}</span>
                <span className="text-red-500">เหตุผล <span className="text-red-600">{b.cancel_reason || '—'}</span></span>
              </div>
            )}
          </div>

          {/* Card: ลูกค้า */}
          <div className="rounded-lg border border-slate-200 p-3 space-y-1.5">
            <div className="text-[10px] font-semibold text-slate-500 uppercase">ลูกค้า</div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800">{b.customer_name}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Phone className="w-3 h-3" /> {b.customer_tel}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-x-4 gap-y-0.5 text-xs pt-1 border-t border-slate-100">
              <LV label="อาชีพ" value={b.customer_occupation} />
              <LV label="อายุ" value={b.customer_age ? `${b.customer_age} ปี` : null} />
              <LV label="รายได้" value={b.customer_monthly_income ? `฿${formatMoney(b.customer_monthly_income)}` : null} />
              <LV label="หนี้สิน" value={b.customer_debt} />
              <LV label="LTV" value={b.customer_ltv} />
            </div>
          </div>

          {/* ════════════════ สินเชื่อ — Credit Process ════════════════ */}
          <SectionHeader title="สินเชื่อ — Credit Process" />


          {/* เตรียมเอกสาร (booking-level) */}
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden text-[11px]">
            <div className="px-3 py-1.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-800">เตรียมเอกสารยื่นสินเชื่อ</span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {/* บูโร */}
              <div className="px-3 py-1.5">
                <div className="text-slate-500">เอกสารบูโร</div>
                <div className="mt-0.5 text-slate-700 font-medium">{b.doc_submit_date || <span className="text-slate-300 font-normal">—</span>}</div>
              </div>
              {/* ชุดธนาคาร */}
              <div className="px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">ชุดธนาคาร</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold ${b.doc_complete_bank_jd_date ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{b.doc_complete_bank_jd_date ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}</span>
                </div>
                <div className="mt-0.5 space-y-0.5">
                  <div><span className="text-slate-500">ครบ: </span><span className="text-slate-700">{b.doc_complete_bank_jd_date || <span className="text-slate-300">—</span>}</span></div>
                  <div><span className="text-slate-500">ขอเพิ่ม: </span><span className="text-slate-700">{b.bank_request_more_doc_date || <span className="text-slate-300">—</span>}</span></div>
                </div>
              </div>
              {/* ชุด JD */}
              <div className="px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">ชุด JD</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold ${b.doc_complete_jd_date ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{b.doc_complete_jd_date ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}</span>
                </div>
                <div className="mt-0.5 space-y-0.5">
                  <div><span className="text-slate-500">ครบ: </span><span className="text-slate-700">{b.doc_complete_jd_date || <span className="text-slate-300">—</span>}</span></div>
                  <div><span className="text-slate-500">ขอเพิ่ม: </span><span className="text-slate-700">{b.jd_request_more_doc_date || <span className="text-slate-300">—</span>}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* สรุปสินเชื่อ */}
          {(() => {
            const selected = b.selected_bank ? b.banks_submitted.find(bs => bs.bank === b.selected_bank) : null;
            const isApproved = !!selected && !!selected.result?.includes('อนุมัติ') && !selected.result?.includes('ไม่อนุมัติ');
            return (
              <div className={`rounded-lg border px-3 py-2 text-xs ${isApproved ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`font-semibold ${isApproved ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {isApproved ? '✓ สินเชื่อผ่านแล้ว' : '⏳ รอผลสินเชื่อ'}
                  </span>
                  {selected ? (
                    <>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500">ธนาคารที่เลือก: <span className="text-slate-700 font-medium">{bankDisplayName(selected.bank)}</span></span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500">วันที่อนุมัติ: <span className="text-slate-700">{selected.result_date || '—'}</span></span>
                      {selected.approved_amount ? (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-500">วงเงิน: <span className="text-emerald-700 font-medium">฿{formatMoney(selected.approved_amount)}</span></span>
                        </>
                      ) : null}
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500">ผล: <ResultBadge value={selected.result} /></span>
                    </>
                  ) : (
                    <span className="text-slate-500">ยังไม่ได้เลือกธนาคาร</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ธนาคารที่ยื่น */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-500">ธนาคารที่ยื่น ({b.banks_submitted.length})</span>
            <div className="flex-1 border-t border-slate-100" />
          </div>
          <div className="space-y-1.5">
            {[...b.banks_submitted].sort((a, _b) => a.bank === 'Proptiane' ? 1 : _b.bank === 'Proptiane' ? -1 : 0).map((bs, i) => {
              const isJD = bs.bank === 'Proptiane';
              return (
              <div key={i} className="rounded-lg border border-slate-200 bg-white overflow-hidden text-[11px]">
                {/* Header row */}
                <div className="flex items-center gap-3 px-3 py-1.5 border-b border-slate-100">
                  <span className="font-medium text-slate-800 text-xs">{i + 1}. {bankDisplayName(bs.bank)}</span>
                  <span className="text-slate-500">ยื่นสินเชื่อ: <span className="text-slate-700">{bs.submit_date || '—'}</span></span>
                  <span className="text-slate-500">Aging: <span className="text-slate-700 font-medium">{b.aging_days}</span> <span className="text-[10px]">วัน</span></span>
                  {!isJD && bs.approved_amount ? <span className="ml-auto font-medium text-emerald-700">฿{formatMoney(bs.approved_amount)}</span> : null}
                </div>
                {/* Results — JD: บูโร(1/3) + เข้าโครงการ(2/3), Bank: 3 cols */}
                {isJD ? (
                  <div className="grid grid-cols-3 divide-x divide-slate-100">
                    <div className="px-3 py-1.5">
                      <div className="text-slate-500">บูโร</div>
                      <div className="text-[10px] text-slate-500">เป้า {b.bureau_target_result_date || '—'} → จริง {b.bureau_actual_result_date || '—'}</div>
                      <div className="mt-0.5"><ResultBadge value={b.bureau_result} /></div>
                    </div>
                    <div className="px-3 py-1.5 col-span-2">
                      <div className="text-slate-500">เข้าโครงการ</div>
                      <div className="text-[10px] text-slate-500">เป้า {b.bank_final_target_date || '—'} → จริง {bs.result_date || '—'}</div>
                      <div className="mt-0.5"><ResultBadge value={bs.result} /></div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 divide-x divide-slate-100">
                    <div className="px-3 py-1.5">
                      <div className="text-slate-500">บูโร</div>
                      <div className="text-[10px] text-slate-500">เป้า {b.bureau_target_result_date || '—'} → จริง {b.bureau_actual_result_date || '—'}</div>
                      <div className="mt-0.5"><ResultBadge value={b.bureau_result} /></div>
                    </div>
                    <div className="px-3 py-1.5">
                      <div className="text-slate-500">เบื้องต้น</div>
                      <div className="text-[10px] text-slate-500">เป้า {b.bank_preapprove_target_date || '—'} → จริง {bs.preapprove_date || '—'}</div>
                      <div className="mt-0.5"><ResultBadge value={bs.preapprove_result} /></div>
                    </div>
                    <div className="px-3 py-1.5">
                      <div className="text-slate-500">อนุมัติจริง</div>
                      <div className="text-[10px] text-slate-500">เป้า {b.bank_final_target_date || '—'} → จริง {bs.result_date || '—'}</div>
                      <div className="mt-0.5"><ResultBadge value={bs.result} /></div>
                    </div>
                  </div>
                )}
                {bs.remark && <div className="text-[10px] text-slate-500 px-3 py-1 border-t border-slate-100">{bs.remark}</div>}
              </div>
              );
            })}
          </div>

          {/* CO remark */}
          {b.co_remark && (
            <div className="text-xs text-slate-500 px-1">
              CO: <span className="text-slate-700">{b.co_remark}</span>
            </div>
          )}

          {/* LivNex Able summary */}
          <div className="flex items-center gap-4 text-xs text-slate-500 px-1">
            <span>LivNex Able: <ResultBadge value={b.livnex_able_completion_result} /></span>
            <span>Complete: <D value={b.livnex_complete_date} /></span>
            <span>เสนอ LivNex: <span className={b.sale_offer_livnex_flag ? 'text-emerald-600 font-medium' : 'text-slate-700'}>{b.sale_offer_livnex_flag ? 'เสนอแล้ว' : 'ยังไม่เสนอ'}</span></span>
          </div>

          {/* ════════════════ M3: ตรวจบ้าน / Inspection ════════════════ */}
          <SectionHeader title="ตรวจบ้าน / Inspection" />

          {/* Inspection info bar */}
          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
            <span>วิธี: <span className="text-slate-700">{b.inspection_method || '—'}</span></span>
            <span>Unit พร้อม: <D value={b.unit_ready_inspection_date} /></span>
          </div>

          {/* Inspection table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className={th}>รอบ</th>
                  <th className={th}>Target</th>
                  <th className={th}>Target (Biz)</th>
                  <th className={th}>ห้องพร้อม</th>
                  <th className={th}>นัดตรวจ</th>
                  <th className={th}>ตรวจจริง</th>
                  <th className={th}>ผล</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className={`${td} text-slate-600 font-medium`}>ตรวจ 1</td>
                  <td className={td}><D value={b.inspect1_notify_target_date} /></td>
                  <td className={td}><D value={b.inspect1_notify_target_date_biz} /></td>
                  <td className={td}><D value={b.inspect1_ready_date} /></td>
                  <td className={td}><D value={b.inspect1_appointment_date} /></td>
                  <td className={td}><D value={b.inspect1_actual_date} /></td>
                  <td className={td}><ResultBadge value={b.inspect1_result} /></td>
                </tr>
                <tr>
                  <td className={`${td} text-slate-600 font-medium`}>ตรวจ 2</td>
                  <td className={td}><D value={b.inspect2_ready_target_date} /></td>
                  <td className={td}><D value={b.inspect2_ready_target_date_biz} /></td>
                  <td className={td}><D value={b.inspect2_ready_date} /></td>
                  <td className={td}><D value={b.inspect2_appointment_date} /></td>
                  <td className={td}><D value={b.inspect2_actual_date} /></td>
                  <td className={td}><ResultBadge value={b.inspect2_result} /></td>
                </tr>
                <tr>
                  <td className={`${td} text-slate-600 font-medium`}>ตรวจ 3</td>
                  <td className={td}><D value={b.inspect3_ready_target_date} /></td>
                  <td className={td}><D value={b.inspect3_ready_target_date_biz} /></td>
                  <td className={td}><D value={b.inspect3_ready_date} /></td>
                  <td className={td}><D value={b.inspect3_appointment_date} /></td>
                  <td className={td}><D value={b.inspect3_actual_date} /></td>
                  <td className={td}><ResultBadge value={b.inspect3_result} /></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Handover */}
          <div className="text-xs text-slate-500 px-1">
            วันที่รับห้อง: <span className={`font-medium ${b.handover_accept_date ? 'text-emerald-600' : 'text-slate-300'}`}>{b.handover_accept_date || '—'}</span>
          </div>

          {/* ════════════════ M4: โอน / Transfer ════════════════ */}
          <SectionHeader title="โอน / Transfer" />

          {/* Horizontal Timeline */}
          {(() => {
            const steps = [
              { label: 'สัญญาธนาคาร', value: b.bank_contract_date },
              { label: 'ส่งชุดโอน', value: b.transfer_package_sent_date },
              { label: 'ปลอดโฉนด', value: b.title_clear_date },
              { label: 'เป้าโอน', value: b.transfer_target_date, badge: b.transfer_upside_flag },
              { label: 'นัดโอนจริง', value: b.transfer_appointment_date },
              { label: 'โอนจริง', value: b.transfer_actual_date },
            ];
            const lastFilledIdx = steps.reduce((acc, s, idx) => s.value ? idx : acc, -1);
            return (
              <div className="flex items-start">
                {steps.map((step, i) => {
                  const hasDot = !!step.value;
                  const isActive = i === lastFilledIdx + 1 && i < steps.length;
                  return (
                    <div key={step.label} className="flex-1 flex flex-col items-center">
                      {/* Dot + Line row */}
                      <div className="flex items-center w-full">
                        {i > 0 && <div className={`flex-1 h-0.5 ${steps[i - 1]?.value ? 'bg-slate-400' : 'bg-slate-200'}`} />}
                        <div className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 ${
                          hasDot ? 'bg-slate-700 border-slate-700' :
                          isActive ? 'bg-white border-slate-500' :
                          'bg-white border-slate-200'
                        }`} />
                        {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${hasDot ? 'bg-slate-400' : 'bg-slate-200'}`} />}
                      </div>
                      {/* Label */}
                      <div className="text-[10px] text-slate-500 mt-1 text-center leading-tight">{step.label}</div>
                      {/* Date */}
                      <div className="text-[10px] text-center mt-0.5">
                        {step.value
                          ? <span className="text-slate-700">{step.value}</span>
                          : <span className="text-slate-300">—</span>
                        }
                      </div>
                      {/* Badge */}
                      {step.badge && (
                        <span className="mt-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-semibold">{step.badge}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* ════════════════ M5: LivNex / Pre-LivNex ════════════════ */}
          <SectionHeader title="LivNex / Pre-LivNex" />

          <div className="grid grid-cols-2 gap-3">
            {/* LivNex ฝ่ายขาย */}
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-[10px] font-semibold text-slate-500 uppercase mb-2">LivNex ฝ่ายขาย</div>
              <div className="text-xs space-y-0.5">
                <LV label="เสนอ" value={b.sale_offer_livnex_flag ? 'ใช่' : 'ไม่'} />
                <LV label="วันที่นำเสนอ" value={b.livnex_present_date} />
                <LV label="นัดสัญญา" value={b.livnex_contract_appointment_date} />
                <LV label="ทำสัญญาจริง" value={b.livnex_contract_actual_date} />
                <LV label="ยกเลิก" value={b.livnex_cancel_date} />
                {b.livnex_cancel_reason && <LV label="เหตุผล" value={b.livnex_cancel_reason} />}
              </div>
            </div>

            {/* Pre-LivNex */}
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Pre-LivNex</div>
              <div className="text-xs space-y-0.5">
                <LV label="วันที่นำเสนอ" value={b.pre_livnex_present_date} />
                <LV label="นัดสัญญา" value={b.pre_livnex_contract_appointment_date} />
                <LV label="ยกเลิก" value={b.pre_livnex_cancel_date} />
                {b.pre_livnex_cancel_reason && <LV label="เหตุผล" value={b.pre_livnex_cancel_reason} />}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
