'use client';

import { useState } from 'react';
import { Booking, STAGE_CONFIG, Stage, formatMoney, getResultFlag, THAI_MONTHS, BANK_COLORS, bankDisplayName, CHAT_ROLE_CONFIG, type ChatRole } from '@/data/bookings';
import { X, Phone, ChevronDown, ChevronRight, Info, User, CreditCard, ClipboardCheck, ArrowRightLeft, Wifi, BarChart3, MessageSquare, Wallet, Gauge, Gift, AlertTriangle, Clock, ListChecks, Sparkles, Send, AtSign, Pencil } from 'lucide-react';
import { SLATimeline } from '@/components/SLATimeline';

// ─── Helpers ───
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

function BankChip({ code }: { code: string }) {
  const bg = BANK_COLORS[code] || 'bg-slate-500';
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
  const flag = getResultFlag(value);
  const cls = flag === 'pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : flag === 'fail' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200';
  return <span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-medium ${cls}`}>{value}</span>;
}

function ResultBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-300">—</span>;
  const flag = getResultFlag(value);
  return (
    <span className={`font-medium ${flag === 'pass' ? 'text-emerald-600' : flag === 'fail' ? 'text-red-500' : 'text-amber-600'}`}>
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
function Section({ title, icon: Icon, defaultOpen = true, count, badge, followup, children }: {
  title: string; icon?: React.ComponentType<{ className?: string }>; defaultOpen?: boolean; count?: string; badge?: React.ReactNode; followup?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'content' | 'followup'>('content');
  const [followupText, setFollowupText] = useState('');
  const [notes, setNotes] = useState<{ text: string; date: string; time: string; user: string }[]>([]);

  const addNote = () => {
    if (followupText.trim()) {
      const now = new Date();
      setNotes(prev => [...prev, {
        text: followupText.trim(),
        date: now.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        user: 'คุณสมชาย',
      }]);
      setFollowupText('');
    }
  };

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
      {open && (
        <div>
          {/* Tab bar */}
          {followup && (
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${activeTab === 'content' ? 'text-slate-800 border-b-2 border-slate-700 bg-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                เนื้อหา
              </button>
              <button
                onClick={() => setActiveTab('followup')}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${activeTab === 'followup' ? 'text-amber-700 border-b-2 border-amber-500 bg-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <MessageSquare className="w-3 h-3" />
                Follow-up
                {notes.length > 0 && <span className="text-[9px] px-1 py-0.5 rounded-full bg-amber-500 text-white font-bold leading-none">{notes.length}</span>}
              </button>
            </div>
          )}

          {/* Content tab */}
          {(!followup || activeTab === 'content') && children}

          {/* Follow-up tab */}
          {followup && activeTab === 'followup' && (
            <div className="px-3 py-2 space-y-2 bg-amber-50/30">
              {notes.length > 0 ? (
                <div className="space-y-1.5">
                  {notes.map((n, i) => (
                    <div key={i} className="bg-white rounded px-2.5 py-1.5 border border-slate-100 text-[11px]">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-slate-400 tabular-nums text-[10px]">{n.date} {n.time}</span>
                        <span className="text-[10px] font-semibold text-slate-500">by {n.user}</span>
                      </div>
                      <div className="text-slate-700">{n.text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[11px] text-slate-400 py-3">ยังไม่มี follow-up</div>
              )}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={followupText}
                  onChange={(e) => setFollowupText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }}
                  placeholder="พิมพ์ follow-up..."
                  className="flex-1 text-[11px] px-2 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={addNote}
                  className="px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-semibold transition-colors"
                >
                  บันทึก
                </button>
              </div>
            </div>
          )}
        </div>
      )}
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
  stageFilter?: string;
  defaultTab?: 'detail' | 'sla' | 'followup' | 'ai';
}

export function BookingDetailPanel({ booking, onClose, onTransferMonthChange, currentView, stageFilter, defaultTab }: Props) {
  const b = booking;
  const initialMonth = dateToMonthKey(b.transfer_target_date);
  const [transferMonth, setTransferMonth] = useState<string>(initialMonth || '');
  const [upside, setUpside] = useState<boolean>(!!b.transfer_upside_flag);
  const [banksOpen, setBanksOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<'detail' | 'sla' | 'followup' | 'ai'>(defaultTab || 'detail');
  const [newNote, setNewNote] = useState('');
  // ─── Credit card inline edit ───
  const [editingCreditStep, setEditingCreditStep] = useState<number | null>(null);
  const [creditOverrides, setCreditOverrides] = useState<Record<number, { target: string; actual: string; result: string }>>({});
  const [creditHistory, setCreditHistory] = useState<{ stepIdx: number; stepLabel: string; field: string; oldVal: string; newVal: string; date: string; time: string; user: string }[]>([]);
  const [creditEditForm, setCreditEditForm] = useState({ target: '', actual: '', result: '', _origTarget: '', _origActual: '', _origResult: '' });
  const handleSaveCreditEdit = (stepIdx: number, stepLabel: string) => {
    const now = new Date();
    const d = now.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const t = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const newChanges: typeof creditHistory = [];
    if (creditEditForm.target !== creditEditForm._origTarget)
      newChanges.push({ stepIdx, stepLabel, field: 'วันกำหนด', oldVal: creditEditForm._origTarget || '—', newVal: creditEditForm.target || '—', date: d, time: t, user: 'คุณสมชาย' });
    if (creditEditForm.actual !== creditEditForm._origActual)
      newChanges.push({ stepIdx, stepLabel, field: 'วันจริง', oldVal: creditEditForm._origActual || '—', newVal: creditEditForm.actual || '—', date: d, time: t, user: 'คุณสมชาย' });
    if (creditEditForm.result !== creditEditForm._origResult)
      newChanges.push({ stepIdx, stepLabel, field: 'ผล', oldVal: creditEditForm._origResult || 'รอผล', newVal: creditEditForm.result || 'รอผล', date: d, time: t, user: 'คุณสมชาย' });
    if (newChanges.length > 0) setCreditHistory(prev => [...prev, ...newChanges]);
    setCreditOverrides(prev => ({ ...prev, [stepIdx]: { target: creditEditForm.target, actual: creditEditForm.actual, result: creditEditForm.result } }));
    setEditingCreditStep(null);
  };
  // Section open/close — single mapping for all views
  const sectionOpen = (section: string): boolean => {
    // Stage-filtered list views: open only the matching section
    if (currentView === 'list' && stageFilter && stageFilter !== 'all') {
      const map: Record<string, string[]> = {
        booking:     ['credit'],
        contract:    ['credit'],
        credit:      ['credit'],
        inspection:  ['inspection'],
        ready:       ['credit', 'inspection', 'transfer'],
        transferred: ['credit', 'inspection', 'transfer'],
        cancelled:   ['basic'],
      };
      return map[stageFilter]?.includes(section) ?? false;
    }
    // After-transfer views: open only the matching after-transfer section
    if (currentView === 'after-transfer') return ['refund', 'freebie', 'meter', 'pending-work'].includes(section);
    if (currentView === 'refund') return section === 'refund';
    if (currentView === 'freebie') return section === 'freebie';
    if (currentView === 'meter') return section === 'meter';
    if (currentView === 'pending-work') return section === 'pending-work';
    // Default (all bookings / dashboard / etc): open main sections
    return !['basic', 'customer'].includes(section);
  };
  const monthOptions = generateMonthOptions();
  if (initialMonth && !monthOptions.includes(initialMonth)) {
    monthOptions.unshift(initialMonth);
    monthOptions.sort();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-slate-50 shadow-2xl overflow-y-auto flex flex-col">

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
            <button
              onClick={() => setPanelTab('followup')}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition -mb-px ${
                panelTab === 'followup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <ListChecks className="w-3 h-3 inline mr-1 -mt-0.5" />
              Follow-up
            </button>
            <button
              onClick={() => setPanelTab('ai')}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition -mb-px ${
                panelTab === 'ai'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1 -mt-0.5" />
              AI+
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
            followup
            defaultOpen={sectionOpen('basic')}
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
          <Section title="ลูกค้า" icon={User} defaultOpen={sectionOpen('customer')} followup badge={
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
            defaultOpen={sectionOpen('credit')}
            count={`${b.banks_submitted.length} ธนาคาร`}
            badge={b.credit_status ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white/80 font-medium">{b.credit_status}</span> : undefined}
            followup
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
              {b.credit_request_type === 'โอนสด'
                ? <span className="text-[10px] text-emerald-600 font-semibold">โอนสด{b.bureau_result ? ' (กู้ผ่านแล้ว)' : ''}</span>
                : b.selected_bank && <span className="text-[10px] text-slate-400">ธนาคาร: <span className="text-slate-600 font-medium">{bankDisplayName(b.selected_bank)}</span></span>}
            </div>
            {(() => {
              const selectedBs = b.selected_bank ? b.banks_submitted.find(bs => bs.bank === b.selected_bank) : null;
              const steps = [
                { label: 'บูโร', target: b.bureau_target_result_date_biz, actual: b.bureau_actual_result_date, result: b.bureau_result, flag: b.bureau_flag, rate: null as number | null },
                { label: 'Bank เบื้องต้น', target: b.bank_preapprove_target_date_biz, actual: b.bank_preapprove_actual_date, result: b.bank_preapprove_result, flag: b.bank_preapprove_flag, rate: selectedBs?.interest_rate_3y ?? null },
                { label: 'Bank อนุมัติจริง', target: b.bank_final_target_date_biz, actual: b.bank_final_actual_date, result: b.bank_final_result, flag: b.bank_final_flag, rate: selectedBs?.interest_rate_3y ?? null },
              ];
              const lastDone = steps.reduce((acc, s, i) => {
                const eff = creditOverrides[i] ? creditOverrides[i].result : (s.result || '');
                return eff ? i : acc;
              }, -1);
              return (
                <>
                <div className="flex items-stretch px-3 py-3 gap-0">
                  {steps.map((step, i) => {
                    const ov = creditOverrides[i];
                    const effTarget = ov ? ov.target : (step.target || '');
                    const effActual = ov ? ov.actual : (step.actual || '');
                    const effResult = ov ? ov.result : (step.result || '');
                    const effFlag = ov ? (ov.result ? getResultFlag(ov.result) : null) : step.flag;
                    const hasResult = !!effResult;
                    const isPass = effFlag === 'pass';
                    const isFail = effFlag === 'fail';
                    const isNext = !hasResult && i === lastDone + 1;
                    const isEditing = editingCreditStep === i;
                    const accent = isPass ? 'bg-emerald-500' : isFail ? 'bg-red-500' : hasResult ? 'bg-amber-500' : isNext ? 'bg-amber-400' : 'bg-slate-200';
                    const border = isEditing ? 'border-amber-400 ring-1 ring-amber-200' : isPass ? 'border-emerald-300' : isFail ? 'border-red-300' : isNext ? 'border-amber-300' : 'border-slate-200';
                    const badgeCls = isEditing ? 'bg-amber-200 text-amber-800' : isPass ? 'bg-emerald-200 text-emerald-800' : isFail ? 'bg-red-200 text-red-800' : hasResult ? 'bg-amber-200 text-amber-800' : isNext ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400';
                    const labelCls = isEditing ? 'text-amber-700' : isPass ? 'text-emerald-800' : isFail ? 'text-red-700' : hasResult ? 'text-amber-800' : isNext ? 'text-amber-700' : 'text-slate-500';
                    const hasOverride = !!ov;
                    return (
                      <div key={i} className="flex items-stretch flex-1 min-w-0">
                        {i > 0 && <div className="w-1.5 flex-shrink-0" />}
                        <div className={`flex-1 flex flex-col rounded-lg border overflow-hidden shadow-sm ${border}`}>
                          <div className={`h-[3px] ${isEditing ? 'bg-amber-400' : accent}`} />
                          <div className={`${isEditing ? 'bg-amber-50/50' : 'bg-white'} px-2.5 py-2 flex flex-col flex-1`}>
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className={`w-[18px] h-[18px] rounded-full text-[8px] font-bold flex items-center justify-center flex-shrink-0 ${badgeCls}`}>
                                {isEditing ? '✎' : isPass ? '✓' : isFail ? '✗' : i + 1}
                              </span>
                              <span className={`text-[10px] font-semibold leading-tight whitespace-nowrap flex-1 ${labelCls}`}>{step.label}</span>
                              {isEditing ? (
                                <>
                                  <button onClick={() => handleSaveCreditEdit(i, step.label)} className="text-[9px] font-semibold text-emerald-600 hover:text-emerald-700 px-1">บันทึก</button>
                                  <button onClick={() => setEditingCreditStep(null)} className="text-[9px] text-slate-400 hover:text-slate-600 px-1">ยกเลิก</button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    const ct = ov ? ov.target : (step.target || '');
                                    const ca = ov ? ov.actual : (step.actual || '');
                                    const cr = ov ? ov.result : (step.result || '');
                                    setCreditEditForm({ target: ct, actual: ca, result: cr, _origTarget: ct, _origActual: ca, _origResult: cr });
                                    setEditingCreditStep(i);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 flex-shrink-0"
                                  title={`แก้ไข ${step.label}`}
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {isEditing ? (
                              <div className="space-y-1.5 text-[10px]">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-500 text-[9px] w-10 flex-shrink-0">กำหนด</span>
                                  <input type="text" className="flex-1 border border-slate-300 rounded px-1.5 py-0.5 text-[9px] bg-white focus:border-amber-400 focus:outline-none" value={creditEditForm.target} onChange={e => setCreditEditForm(f => ({ ...f, target: e.target.value }))} placeholder="DD/MM/YYYY" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-500 text-[9px] w-10 flex-shrink-0">จริง</span>
                                  <input type="text" className="flex-1 border border-slate-300 rounded px-1.5 py-0.5 text-[9px] bg-white focus:border-amber-400 focus:outline-none" value={creditEditForm.actual} onChange={e => setCreditEditForm(f => ({ ...f, actual: e.target.value }))} placeholder="DD/MM/YYYY" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-500 text-[9px] w-10 flex-shrink-0">ผล</span>
                                  <select className="flex-1 border border-slate-300 rounded px-1.5 py-0.5 text-[9px] bg-white focus:border-amber-400 focus:outline-none" value={creditEditForm.result} onChange={e => setCreditEditForm(f => ({ ...f, result: e.target.value }))}>
                                    <option value="">รอผล</option>
                                    <option value="ผ่าน">ผ่าน</option>
                                    <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                                    <option value="ผ่านแบบมีเงื่อนไข">ผ่าน (มีเงื่อนไข)</option>
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-0.5 text-[10px]">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-slate-400 text-[9px]">กำหนด</span>
                                    <span className={`text-[9px] tabular-nums ${hasOverride && effTarget !== (step.target || '') ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>{effTarget || '—'}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-slate-400 text-[9px]">จริง</span>
                                    <span className={`text-[9px] tabular-nums ${effActual ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>{effActual || '—'}</span>
                                  </div>
                                </div>
                                <div className="mt-auto pt-1.5 border-t border-slate-100 flex items-end justify-between">
                                  {hasResult ? (
                                    <ResultChip value={effResult} />
                                  ) : (
                                    <span className="inline-flex px-1.5 py-0.5 rounded border text-[10px] font-medium bg-slate-50 text-slate-400 border-slate-200">รอผล</span>
                                  )}
                                  {step.rate != null && <span className="text-[9px] text-blue-600 font-semibold tabular-nums">{step.rate.toFixed(2)}%</span>}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* ประวัติแก้ไข */}
                {creditHistory.length > 0 && (
                  <div className="px-3 pb-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">ประวัติแก้ไข</span>
                    </div>
                    <div className="space-y-0.5">
                      {creditHistory.slice().reverse().map((h, hi) => (
                        <div key={hi} className="text-[9px] flex items-start gap-1.5 py-0.5 text-slate-500">
                          <span className="text-slate-400 tabular-nums flex-shrink-0 whitespace-nowrap">{h.date} {h.time}</span>
                          <span className="text-slate-400 flex-shrink-0">by {h.user}:</span>
                          <span>
                            <span className="font-medium text-slate-600">{h.stepLabel}</span>
                            {' '}{h.field}{' '}
                            <span className="line-through text-slate-400">{h.oldVal}</span>
                            {' → '}
                            <span className="text-slate-700 font-medium">{h.newVal}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </>
              );
            })()}

            {/* ธนาคารที่ยื่น — summary bar + JD row + expandable cards */}
            {b.banks_submitted.length > 0 && (() => {
              const selected = b.selected_bank ? b.banks_submitted.find(bs => bs.bank === b.selected_bank) : null;
              const isApproved = !!selected && selected.result_flag === 'pass';
              const jdHasResult = !!b.livnex_able_status;
              const jdPass = b.livnex_able_flag === 'pass';
              const jdFail = b.livnex_able_flag === 'fail';
              return (
                <>
                  <button
                    onClick={() => setBanksOpen(!banksOpen)}
                    className="w-full px-3 py-2 text-xs text-left cursor-pointer border-t border-slate-100 hover:bg-slate-50 transition-colors bg-slate-50/40"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Bank credit */}
                        {b.credit_request_type === 'โอนสด' ? (
                          <span className="font-semibold text-emerald-700">โอนสด{b.bureau_result ? ' (กู้ผ่านแล้ว)' : ''}</span>
                        ) : (
                          <>
                            <span className={`font-semibold ${isApproved ? 'text-emerald-700' : 'text-amber-600'}`}>
                              {isApproved ? '✓ สินเชื่อผ่าน' : '⏳ รอผลสินเชื่อ'}
                            </span>
                            {selected ? (
                              <>
                                <span className="text-slate-500">{bankDisplayName(selected.bank)}</span>
                                {selected.approved_amount && <span className="text-emerald-700 font-medium">฿{formatMoney(selected.approved_amount)}{selected.interest_rate_3y != null && <span className="text-blue-600"> | {selected.interest_rate_3y.toFixed(2)}%</span>}</span>}
                              </>
                            ) : (
                              <span className="text-slate-400">ยังไม่เลือก</span>
                            )}
                          </>
                        )}
                        {b.co_remark && <span className="text-slate-400 text-[10px] italic">&ldquo;{b.co_remark}&rdquo;</span>}
                        {/* Separator */}
                        <span className="w-px h-4 bg-slate-200 mx-3" />
                        {/* LivNex / JD */}
                        <span className={`font-semibold ${jdPass ? 'text-indigo-700' : jdFail ? 'text-red-600' : 'text-slate-500'}`}>
                          {jdPass ? '✓' : jdFail ? '✗' : '⏳'} JD - LivNex Able
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
                    <div className="p-3 space-y-2">
                      {[...b.banks_submitted]
                        .sort((a, _b) => {
                          // JD always last
                          if (a.bank === 'JD' && _b.bank !== 'JD') return 1;
                          if (_b.bank === 'JD' && a.bank !== 'JD') return -1;
                          // Approved (pass) first, then pending/fail
                          const aOk = a.result_flag === 'pass' ? 0 : 1;
                          const bOk = _b.result_flag === 'pass' ? 0 : 1;
                          if (aOk !== bOk) return aOk - bOk;
                          // Sort by interest rate ascending (lowest first), null → bottom
                          const aRate = a.interest_rate_3y ?? Infinity;
                          const bRate = _b.interest_rate_3y ?? Infinity;
                          return aRate - bRate;
                        })
                        .map((bs, i) => {
                          const isJD = bs.bank === 'JD';
                          const steps = isJD ? [
                            { label: 'บูโร', target: b.bureau_target_result_date_biz, actual: b.bureau_actual_result_date, result: b.bureau_result, flag: b.bureau_flag },
                            { label: 'เข้าโครงการ', target: b.jd_final_target_date, actual: b.jd_final_actual_date, result: b.livnex_able_status, flag: b.livnex_able_flag },
                          ] : [
                            { label: 'บูโร', target: b.bureau_target_result_date_biz, actual: b.bureau_actual_result_date, result: b.bureau_result, flag: b.bureau_flag },
                            { label: 'เบื้องต้น', target: b.bank_preapprove_target_date_biz, actual: bs.preapprove_date, result: bs.preapprove_result, flag: bs.preapprove_flag },
                            { label: 'อนุมัติจริง', target: b.bank_final_target_date_biz, actual: bs.result_date, result: bs.result, flag: bs.result_flag },
                          ];
                          return (
                            <div key={i} className="rounded-lg border border-slate-200 overflow-hidden">
                              <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50/60">
                                <BankChip code={bs.bank} />
                                <span className="text-slate-400 text-[10px]">ยื่น {bs.submit_date || '—'}</span>
                                {!isJD && bs.approved_amount ? (
                                  <span className="ml-auto font-semibold text-emerald-600">
                                    ฿{formatMoney(bs.approved_amount)}{bs.interest_rate_3y != null && <span className="text-blue-600"> | {bs.interest_rate_3y.toFixed(2)}%</span>}
                                  </span>
                                ) : null}
                              </div>
                              <div className="grid divide-x divide-slate-100 grid-cols-3" style={isJD ? { gridTemplateColumns: '1fr 2fr' } : undefined}>
                                {steps.map((step, si) => {
                                  const isPass = step.flag === 'pass';
                                  const isFail = step.flag === 'fail';
                                  const stepBg = isPass ? 'bg-emerald-700' : isFail ? 'bg-red-700' : '';
                                  const stepText = isPass ? 'text-white' : isFail ? 'text-white' : '';
                                  const stepMuted = isPass ? 'text-emerald-200' : isFail ? 'text-red-200' : 'text-slate-400';
                                  const stepVal = isPass ? 'text-emerald-100' : isFail ? 'text-red-100' : 'text-slate-500';
                                  return (
                                  <div key={si} className={`px-3 py-2 space-y-1 ${stepBg}`}>
                                    <div className={`text-[10px] font-semibold uppercase tracking-wider ${isPass ? 'text-emerald-200' : isFail ? 'text-red-200' : 'text-slate-500'}`}>{si + 1}. {step.label}</div>
                                    <div className="space-y-0.5 text-[10px]">
                                      <div className="flex items-center justify-between">
                                        <span className={stepMuted}>กำหนด</span>
                                        <span className={`tabular-nums ${stepVal}`}>{step.target || '—'}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className={stepMuted}>จริง</span>
                                        <span className={`tabular-nums ${isPass ? 'text-white font-medium' : isFail ? 'text-white font-medium' : step.actual ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>{step.actual || '—'}</span>
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
            defaultOpen={sectionOpen('inspection')}
            badge={b.inspection_status ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white/80 font-medium">{b.inspection_status}</span> : undefined}
            followup
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
              headers={['รอบ', 'กำหนดตรวจ', 'CS Review', 'นัดลูกค้าเข้าตรวจ', 'ตรวจจริง', 'ผลการตรวจ']}
              colWidths={['10%', '14%', '14%', '14%', '14%', '']}

              rows={([
                ['ตรวจ 1', b.inspect1_schedule, b.inspect1_ready, b.inspect1_appt, b.inspect1_date, b.inspect1_result],
                ['ตรวจ 2', b.inspect2_schedule, b.inspect2_ready, b.inspect2_appt, b.inspect2_date, b.inspect2_result],
                ['ตรวจ 3', b.inspect3_schedule, b.inspect3_ready, b.inspect3_appt, b.inspect3_date, b.inspect3_result],
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
                <span className="text-slate-500">QC5: <Val v={b.qc5_date} /></span>
                <span className="text-slate-500">QC(5.5): <Val v={b.unit_ready_inspection_date} /></span>
              </div>
            </div>
          </Section>

          {/* ═══ 5. โอน / Transfer ═══ */}
          <Section
            title="โอน / Transfer"
            icon={ArrowRightLeft}
            defaultOpen={sectionOpen('transfer')}
            badge={b.transfer_status ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white/80 font-medium">{b.transfer_status}</span> : undefined}
            followup
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
          <Section title="LivNex / Pre-LivNex" icon={Wifi} defaultOpen={sectionOpen('livnex')} followup>
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
                {/* JD - LivNex Able — ได้/ไม่ได้/รอ */}
                <span className="text-slate-500">JD - LivNex Able: {(() => {
                  if (!b.livnex_able_status) return <span className="text-slate-400">รอตรวจสอบ</span>;
                  const f = b.livnex_able_flag;
                  return <span className={`font-semibold ${f === 'pass' ? 'text-emerald-600' : f === 'fail' ? 'text-red-500' : 'text-amber-600'}`}>{f === 'pass' ? 'ได้' : f === 'fail' ? 'ไม่ได้' : 'รอผล'}</span>;
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
          <Section title="Backlog / Segmentation" icon={BarChart3} defaultOpen={sectionOpen('backlog')} followup>
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
            <Section title="เงินทอนลูกค้า" icon={Wallet} defaultOpen={sectionOpen('refund')} followup>
              <Row label="สถานะ"><Val v={b.refund_status} /></Row>
              {b.refund_amount !== null && <Row label="จำนวนเงิน"><Val v={`฿${formatMoney(b.refund_amount)}`} /></Row>}
              {b.refund_aging !== null && <Row label="Aging"><Val v={`${b.refund_aging} วัน`} /></Row>}
              <Row label="วันที่คืน"><Val v={b.refund_transfer_date} /></Row>
            </Section>

            <Section title="ของแถมลูกค้า" icon={Gift} defaultOpen={sectionOpen('freebie')} followup>
              <Row label="เอกสารส่งมอบ"><Val v={b.handover_document_received_date} /></Row>
            </Section>

            <Section title="การเปลี่ยนชื่อมิเตอร์น้ำ-ไฟ" icon={Gauge} defaultOpen={sectionOpen('meter')} followup>
              <Row label="มิเตอร์น้ำ"><Val v={b.water_meter_change_date} /></Row>
              <Row label="มิเตอร์ไฟ"><Val v={b.electricity_meter_change_date} /></Row>
            </Section>

            <Section title="งานซ่อมคงค้าง" icon={AlertTriangle} defaultOpen={sectionOpen('pending-work')} followup>
              <Row label="เอกสารส่งมอบ"><Val v={b.handover_document_received_date} /></Row>
            </Section>
          </>)}

          {/* ═══ 9. Follow-up / Notes ═══ */}
          {(b.mgmt_remark || b.followup_note || b.sale_followup_task || b.pm_fast_sent_date || b.cs_review_date) && (
            <Section title="Follow-up / Notes" icon={MessageSquare} followup>
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

          {/* ══ Chat & Notes Tab ══ */}
          {panelTab === 'followup' && (() => {
            const messages = b.chat_messages || [];
            // mock "me" = credit_owner or first Sale
            const myName = b.credit_owner?.replace(/^\d+\.\d+\)\s*/, '').replace(/\s*\(.*\)/, '') || b.sale_name;

            // People available for @mention
            const mentionPeople = [
              b.sale_name && { name: b.sale_name, role: 'Sale' as ChatRole },
              b.credit_owner && { name: b.credit_owner.replace(/^\d+\.\d+\)\s*/, '').replace(/\s*\(.*\)/, ''), role: 'CO' as ChatRole },
              b.cs_owner && { name: b.cs_owner.split('/')[0].trim(), role: 'CS' as ChatRole },
              b.inspection_officer && { name: b.inspection_officer.replace(/\s*\(.*\)/, ''), role: 'CON' as ChatRole },
            ].filter(Boolean) as { name: string; role: ChatRole }[];

            // Render @mentions in text as highlighted spans
            const renderText = (text: string, isOwn = false) => {
              const parts = text.split(/(@\S+)/g);
              return parts.map((part, i) =>
                part.startsWith('@')
                  ? <span key={i} className={isOwn ? 'font-semibold bg-blue-500/30 px-0.5 rounded' : 'text-blue-600 font-semibold bg-blue-50 px-0.5 rounded'}>{part}</span>
                  : <span key={i}>{part}</span>
              );
            };

            return (
            <div className="flex flex-col pt-2" style={{ height: 'calc(100vh - 280px)', minHeight: 400 }}>
              {/* Header */}
              <div className="bg-slate-800 text-white text-xs font-semibold flex items-center justify-between px-4 py-2.5 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-white/60" />
                  Chat & Notes
                </div>
                <span className="text-[10px] text-white/50">{messages.length} ข้อความ</span>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto bg-slate-50 px-3 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">ยังไม่มีข้อความ</p>
                    <p className="text-[11px] text-slate-300 mt-1">เริ่มสนทนาเกี่ยวกับ booking นี้</p>
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const cfg = CHAT_ROLE_CONFIG[msg.role] || CHAT_ROLE_CONFIG.Sale;
                  const isMe = msg.sender === myName;
                  // Date separator
                  const prevDate = idx > 0 ? messages[idx - 1].timestamp.split(' ')[0] : null;
                  const curDate = msg.timestamp.split(' ')[0];
                  const showDate = idx === 0 || curDate !== prevDate;
                  const time = msg.timestamp.split(' ')[1] || '';

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center gap-2 my-2">
                          <div className="flex-1 border-t border-slate-200" />
                          <span className="text-[10px] text-slate-400 font-medium px-2">{curDate}</span>
                          <div className="flex-1 border-t border-slate-200" />
                        </div>
                      )}

                      <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full ${cfg.bg} text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-sm`}>
                          {cfg.avatar}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          {/* Name + Role + Time */}
                          <div className={`flex items-center gap-1.5 mb-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[11px] font-semibold text-slate-700">{msg.sender}</span>
                            <span className={`text-[9px] px-1 py-px rounded font-medium ${cfg.bg} text-white`}>{cfg.label}</span>
                            <span className="text-[10px] text-slate-400">{time}</span>
                          </div>
                          {/* Message body */}
                          <div className={`rounded-xl px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-tr-sm'
                              : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'
                          }`}>
                            {renderText(msg.text, isMe)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Bar */}
              <div className="bg-white border-t border-slate-200 px-3 py-2.5 rounded-b-lg">
                <div className="flex items-center gap-2">
                  {/* @ button with dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        const atPos = newNote.length;
                        setNewNote(prev => prev + '@');
                      }}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                      title="@mention"
                    >
                      <AtSign className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    className="flex-1 text-sm border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 placeholder:text-slate-300 bg-slate-50"
                    onKeyDown={e => { if (e.key === 'Enter' && newNote.trim()) setNewNote(''); }}
                  />
                  <button
                    onClick={() => { if (newNote.trim()) setNewNote(''); }}
                    disabled={!newNote.trim()}
                    className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 flex items-center justify-center transition"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* @mention autocomplete — shows when text ends with @ or @partial */}
                {(() => {
                  const match = newNote.match(/@(\S*)$/);
                  if (!match) return null;
                  const query = match[1].toLowerCase();
                  const filtered = mentionPeople.filter(p => p.name.toLowerCase().includes(query));
                  if (filtered.length === 0) return null;
                  return (
                    <div className="mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                      {filtered.map(p => {
                        const pcfg = CHAT_ROLE_CONFIG[p.role];
                        return (
                          <button
                            key={p.name}
                            onClick={() => {
                              setNewNote(prev => prev.replace(/@\S*$/, `@${p.name} `));
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition text-left"
                          >
                            <div className={`w-6 h-6 rounded-full ${pcfg.bg} text-white flex items-center justify-center text-[9px] font-bold`}>{pcfg.avatar}</div>
                            <span className="text-sm text-slate-700 font-medium">{p.name}</span>
                            <span className={`text-[9px] px-1 py-px rounded font-medium ${pcfg.bg} text-white`}>{pcfg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
            );
          })()}

          {/* ══ AI+ Tab ══ */}
          {panelTab === 'ai' && (() => {
            // Helper: parse dd/mm/yyyy → Date
            const _p = (d: string) => { const [dd,mm,yy] = d.split('/'); return new Date(+yy, +mm-1, +dd); };
            const _d = (a: string | null, b2: string | null) => {
              if (!a || !b2) return null;
              return Math.round((_p(b2).getTime() - _p(a).getTime()) / 86400000);
            };
            const TARGET_DAYS = 30;
            const totalDays = b.aging_days;
            const daysLeft = TARGET_DAYS - totalDays;

            // Compute key durations
            const dBookToContract = _d(b.booking_date, b.contract_date);
            const dContractToDoc = _d(b.contract_date || b.booking_date, b.doc_bureau_date);
            const dDocToBureau = _d(b.doc_bureau_date, b.bureau_actual_result_date);
            const dBureauToPreapprove = _d(b.bureau_actual_result_date, b.bank_preapprove_actual_date);
            const dPreapproveToFinal = _d(b.bank_preapprove_actual_date, b.bank_final_actual_date);
            const dFinalToContract = _d(b.bank_final_actual_date, b.bank_contract_date);
            const dContractToTransferPkg = _d(b.bank_contract_date, b.transfer_package_sent_date);
            const dInspect1 = _d(b.inspect1_appt, b.inspect1_date);
            const dHandover = _d(b.inspect1_date || b.inspect1_appt, b.handover_accept_date);
            const dTransferApptToActual = _d(b.transfer_appointment_date, b.transfer_actual_date);

            // Identify slow & fast steps
            const stepData: { label: string; days: number | null; sla: number; owner: string }[] = [
              { label: 'ลูกค้าจองถึงทำสัญญา', days: dBookToContract, sla: 14, owner: 'Sale' },
              { label: 'รวบรวมเอกสารสินเชื่อ', days: dContractToDoc, sla: 7, owner: 'CO' },
              { label: 'ยื่นธนาคารจนได้ผลบูโร', days: dDocToBureau, sla: 2, owner: 'CO/ธนาคาร' },
              { label: 'รอ Pre-approve หลังบูโรผ่าน', days: dBureauToPreapprove, sla: 7, owner: 'ธนาคาร' },
              { label: 'รอธนาคารอนุมัติจริง', days: dPreapproveToFinal, sla: 7, owner: 'ธนาคาร' },
              { label: 'ทำสัญญากู้กับธนาคาร', days: dFinalToContract, sla: 7, owner: 'CO' },
              { label: 'เตรียมและส่งชุดโอน', days: dContractToTransferPkg, sla: 7, owner: 'CO' },
              { label: 'นัดตรวจจนตรวจจริง', days: dInspect1, sla: 5, owner: 'CS/CON' },
              { label: 'ลูกค้ารับมอบห้อง', days: dHandover, sla: 3, owner: 'CS' },
              { label: 'นัดโอนจนถึงโอนจริง', days: dTransferApptToActual, sla: 4, owner: 'Sale' },
            ];
            const doneSteps = stepData.filter(s => s.days !== null);
            const slowSteps = doneSteps.filter(s => s.days! > s.sla).sort((a, x) => x.days! - a.days!);
            const fastSteps = doneSteps.filter(s => s.days! <= s.sla && s.days! >= 0).sort((a, x) => a.days! - x.days!);
            const pendingSteps = stepData.filter(s => s.days === null);
            const usedDays = doneSteps.reduce((s, x) => s + x.days!, 0);
            const failRounds = [b.inspect1_result, b.inspect2_result, b.inspect3_result].filter(r => getResultFlag(r) === 'fail').length;

            // Build long AI Summary paragraphs
            const summaryParas: string[] = [];

            if (b.stage === 'cancelled') {
              summaryParas.push(`Booking นี้ถูกยกเลิกแล้ว${b.cancel_reason ? ` สาเหตุจาก "${b.cancel_reason}"` : ''} โดยมีอายุ Aging อยู่ที่ ${totalDays} วัน ณ ตอนที่ยกเลิก${b.cancel_date ? ` (ยกเลิกเมื่อวันที่ ${b.cancel_date})` : ''} ปัจจุบันไม่มีงานค้างที่ต้องดำเนินการต่อ`);
            } else if (b.stage === 'transferred') {
              summaryParas.push(`Booking นี้โอนกรรมสิทธิ์สำเร็จแล้ว ใช้เวลาทั้งหมด ${totalDays} วัน ${totalDays <= TARGET_DAYS ? `ซึ่งทันเป้าหมาย ${TARGET_DAYS} วันของบริษัท ถือว่าทำได้ดีมาก` : `ซึ่งเกินเป้าหมาย ${TARGET_DAYS} วันของบริษัทไป ${totalDays - TARGET_DAYS} วัน`} โดยโอนจริงเมื่อวันที่ ${b.transfer_actual_date || '—'} ผ่าน${b.selected_bank ? `ธนาคาร${bankDisplayName(b.selected_bank)}` : 'ธนาคาร —'} มูลค่าสุทธิ ฿${formatMoney(b.net_contract_value)}`);
              if (slowSteps.length > 0) {
                summaryParas.push(`ขั้นตอนที่ใช้เวลานานกว่าปกติ: ${slowSteps.map(s => `${s.label} ใช้ไป ${s.days} วัน (มาตรฐาน ${s.sla} วัน เกินไป ${s.days! - s.sla} วัน ดูแลโดย ${s.owner})`).join(' / ')} — หากทำได้ตามมาตรฐานทุกขั้นตอน จะประหยัดเวลาได้ถึง ${slowSteps.reduce((s, x) => s + (x.days! - x.sla), 0)} วัน`);
              }
              if (fastSteps.length > 0) {
                summaryParas.push(`ขั้นตอนที่ทำได้รวดเร็ว: ${fastSteps.slice(0, 3).map(s => `${s.label} เสร็จภายใน ${s.days} วัน`).join(', ')} — ทีมที่รับผิดชอบทำได้ดี ควรเป็นแบบอย่างให้ Booking อื่น`);
              }
              if (b.refund_status && b.refund_status !== 'ไม่มี' && !b.refund_transfer_date) summaryParas.push(`ยังมีเงินทอนค้างจ่ายอยู่ (สถานะ: ${b.refund_status}${b.refund_amount ? ` จำนวน ฿${formatMoney(b.refund_amount)}` : ''}) ควรเร่งโอนคืนให้ลูกค้าเพื่อปิดจบกระบวนการ`);
            } else {
              // In-progress booking — smart analysis
              const overTarget = totalDays > TARGET_DAYS;
              summaryParas.push(`Booking นี้เป็นโครงการ ${b.project_name} ห้อง ${b.unit_no} มูลค่า ฿${formatMoney(b.net_contract_value)} ขณะนี้ดำเนินงานมาแล้ว ${totalDays} วัน ${overTarget ? `ซึ่งเกินเป้าหมาย ${TARGET_DAYS} วันของบริษัทไปแล้ว ${totalDays - TARGET_DAYS} วัน จำเป็นต้องเร่งรัดทุกขั้นตอนที่เหลือ` : `ยังเหลือเวลาอีก ${daysLeft} วันเพื่อให้ทันเป้าหมาย ${TARGET_DAYS} วัน`}`);

              // ═══ Track status — สินเชื่อ vs ตรวจบ้าน (2 track ทำคู่ขนานได้) ═══
              const creditDone = b.credit_status === 'อนุมัติแล้ว' || b.credit_status === 'โอนสด';
              const inspDone = b.inspection_status === 'ผ่านแล้ว' || b.inspection_status === 'โอนแล้ว';
              const inspStarted = !!b.inspect1_appt || !!b.inspect1_date;
              const inspFailing = b.inspection_status === 'รอแก้งาน';
              const unitReady = !!b.unit_ready_inspection_date;
              const creditInProgress = !creditDone && (!!b.doc_bureau_date || !!b.bureau_result || !!b.bank_preapprove_result);
              const hasBankContract = !!b.bank_contract_date;
              const hasTransferPkg = !!b.transfer_package_sent_date;

              // ═══ Bottleneck — ระบุจุดติดขัดหลัก ═══
              const bottlenecks: string[] = [];
              if (b.cannot_transfer_issue) bottlenecks.push(`มีปัญหาขวางการโอน: "${b.cannot_transfer_issue}" — ต้องแก้ปัญหานี้ก่อนจึงจะเดินหน้าได้`);

              // Credit bottleneck
              if (!creditDone) {
                if (b.bureau_flag === 'fail') {
                  bottlenecks.push(`ติดที่ผลบูโรไม่ผ่าน — CO ควรพิจารณายื่นธนาคารอื่นที่มีเกณฑ์ผ่อนปรนกว่า หรือให้ลูกค้าจัดการปัญหาเครดิตก่อนยื่นใหม่`);
                } else if (b.bank_preapprove_flag === 'fail') {
                  const bankCount = b.banks_submitted.length;
                  bottlenecks.push(`ธนาคารไม่อนุมัติเบื้องต้น — ${bankCount < 3 ? `ตอนนี้ยื่นแค่ ${bankCount} ธนาคาร ควรยื่นเพิ่มอีกเพื่อเพิ่มโอกาสอนุมัติ` : 'ยื่นแล้ว 3 ธนาคาร ควรพิจารณาเพิ่มผู้กู้ร่วมหรือค้ำประกัน'}`);
                } else if (!b.doc_bureau_date && !b.contract_date) {
                  bottlenecks.push('ยังไม่ได้ทำสัญญาและยังไม่เริ่มเตรียมเอกสารสินเชื่อ — Sale ต้องเร่งปิดสัญญาโดยด่วน เพราะทุกอย่างเริ่มจากตรงนี้');
                } else if (!b.doc_bureau_date && b.contract_date) {
                  bottlenecks.push('ทำสัญญาแล้วแต่ยังไม่ได้เตรียมเอกสารเช็คบูโร — CO ต้องเร่งรวบรวมเอกสารให้ลูกค้า ยิ่งช้ายิ่งกินเวลา');
                } else if (b.doc_bureau_date && !b.bureau_result) {
                  bottlenecks.push(`ติดที่รอผลบูโร — CO ควรติดตามผลกับธนาคารทุกวัน ปกติได้ผลภายใน 1-2 วันทำการ${b.selected_bank ? ` (ธนาคาร${bankDisplayName(b.selected_bank)})` : ''}`);
                } else if (b.bureau_flag === 'pass' && !b.bank_preapprove_result) {
                  bottlenecks.push(`บูโรผ่านแล้ว ติดที่รอ Pre-approve — CO ควรติดตามธนาคารอย่างใกล้ชิด ไม่ควรปล่อยให้เกิน 7 วัน${b.banks_submitted.length < 2 ? ' และควรพิจารณายื่นธนาคารสำรองคู่ขนาน' : ''}`);
                } else if (b.bank_preapprove_flag === 'pass' && !b.bank_final_result) {
                  bottlenecks.push('Pre-approve ผ่านแล้ว ติดที่รออนุมัติจริง — CO ควรเตรียมเอกสารเพิ่มเติมให้พร้อมและติดตามกับธนาคารเพื่อไม่ให้ล่าช้า');
                } else if (b.bank_final_flag === 'pass' && !hasBankContract) {
                  bottlenecks.push('อนุมัติสินเชื่อผ่านแล้ว แต่ยังไม่ได้ทำสัญญากู้ — CO ต้องนัดลูกค้ามาเซ็นสัญญากับธนาคารภายใน 3 วัน อย่าปล่อยให้เกินนี้');
                } else if (hasBankContract && !hasTransferPkg) {
                  bottlenecks.push('ทำสัญญากู้แล้ว แต่ยังไม่ได้ส่งชุดโอน — CO ต้องเร่งจัดเตรียมเอกสารชุดโอนให้เสร็จโดยเร็ว');
                }
              }

              // Inspection bottleneck
              if (!inspDone) {
                if (inspFailing) {
                  bottlenecks.push(`ตรวจบ้านไม่ผ่าน${failRounds > 1 ? ` (ไม่ผ่านมาแล้ว ${failRounds} รอบ เสียเวลาไปประมาณ ${failRounds * 14} วัน)` : ''} — CON ต้องเก็บงานให้เสร็จจริงก่อนนัดตรวจรอบถัดไป อย่านัดตรวจจนกว่าจะมั่นใจว่างานเรียบร้อย`);
                } else if (!inspStarted && !unitReady) {
                  bottlenecks.push('ห้องยังไม่พร้อมตรวจ — CON ต้องเร่งงานก่อสร้างให้เสร็จ เพราะตรวจบ้านไม่ผ่านจะทำให้ Aging เพิ่มขึ้นอย่างมาก');
                } else if (!inspStarted && unitReady) {
                  bottlenecks.push('ห้องพร้อมตรวจแล้ว แต่ยังไม่ได้นัดลูกค้า — CS ต้องนัดลูกค้ามาตรวจบ้านโดยเร็ว');
                } else if (inspStarted && !b.handover_accept_date && !inspFailing) {
                  bottlenecks.push('ตรวจบ้านแล้ว รอลูกค้ารับมอบห้อง — CS ติดตามให้ลูกค้ามารับมอบภายใน 3 วัน');
                }
              }

              if (bottlenecks.length > 0) summaryParas.push(`จุดติดขัด: ${bottlenecks.join(' | ')}`);

              // ═══ Parallel Strategy — แนะนำทำคู่ขนาน ═══
              const strategies: string[] = [];

              if (creditInProgress && !inspStarted && unitReady) {
                strategies.push('ระหว่างรอผลสินเชื่อจากธนาคาร ห้องพร้อมตรวจแล้ว — CS ควรนัดลูกค้าตรวจบ้านคู่ขนานไปเลย ไม่ต้องรอสินเชื่อผ่านก่อน จะได้ไม่เสียเวลา');
              } else if (creditInProgress && !inspStarted && !unitReady) {
                strategies.push('ระหว่างรอผลสินเชื่อ ห้องยังไม่พร้อมตรวจ — CON ควรเร่งงานก่อสร้าง/ตกแต่งให้เสร็จ เพื่อให้นัดตรวจได้ทันทีที่สินเชื่อผ่าน ไม่ต้องมาเสียเวลารอห้องอีก');
              }

              if (creditDone && !inspDone && !inspFailing) {
                strategies.push('สินเชื่ออนุมัติแล้ว ต้องเร่งปิดฝั่งตรวจบ้านให้เร็วที่สุด — ทุกวันที่ล่าช้าคือวันที่เสียโอกาสโอน');
              }

              if (inspDone && !creditDone) {
                strategies.push('ตรวจบ้านผ่านหมดแล้ว รอแค่สินเชื่ออนุมัติ — CO ต้องเป็นคนขับเคลื่อนหลัก ติดตามธนาคารทุกวัน เพราะฝั่งตรวจบ้านพร้อมโอนแล้ว');
              }

              if (creditDone && inspDone && !b.transfer_actual_date) {
                if (!hasBankContract) {
                  strategies.push('ทุกอย่างพร้อมแล้วทั้งสินเชื่อและตรวจบ้าน เหลือแค่ทำสัญญากู้ — CO ต้องนัดลูกค้าไปธนาคารทันที อย่าให้เสียเวลาอีก');
                } else if (!hasTransferPkg) {
                  strategies.push('พร้อมโอนแล้ว เหลือแค่ส่งชุดโอน — CO เร่งจัดเตรียมเอกสารชุดโอนให้เสร็จภายใน 3 วัน');
                } else if (!b.transfer_appointment_date) {
                  strategies.push('เอกสารพร้อมหมดแล้ว — Sale ต้องนัดวันโอนกับลูกค้าทันที อย่าปล่อยให้ล่าช้า');
                } else {
                  strategies.push(`นัดโอนแล้ววันที่ ${b.transfer_appointment_date} — Sale ติดตามให้ลูกค้ามาตามนัด และเตรียมเอกสารให้ครบ`);
                }
              }

              // Customer/reason analysis
              if (b.reason_not_transfer_this_month) {
                strategies.push(`ลูกค้าให้เหตุผลว่า "${b.reason_not_transfer_this_month}" — Sale ควรหาทางจัดการ เช่น เสนอทางเลือกวันโอนที่ลูกค้าสะดวก หรือชี้ให้เห็นผลกระทบของการล่าช้า`);
              }

              if (strategies.length > 0) summaryParas.push(`กลยุทธ์เร่งรัด: ${strategies.join(' | ')}`);

              // ═══ Problems — ขั้นตอนที่ช้า ═══
              if (slowSteps.length > 0) summaryParas.push(`ขั้นตอนที่ช้ากว่ามาตรฐาน: ${slowSteps.map(s => `${s.label} ใช้ไป ${s.days} วัน จากมาตรฐาน ${s.sla} วัน (${s.owner})`).join(' / ')}`);

              // What's going well
              if (fastSteps.length > 0) summaryParas.push(`ด้านที่ทำได้ดี: ${fastSteps.slice(0, 3).map(s => `${s.label} เสร็จใน ${s.days} วัน`).join(', ')} ซึ่งเร็วกว่ามาตรฐาน ทีมงานที่รับผิดชอบทำได้ดีมาก`);

              // ═══ Timeline forecast ═══
              if (pendingSteps.length > 0) {
                const remainingSLA = pendingSteps.reduce((s, x) => s + x.sla, 0);
                // ถ้าทำคู่ขนาน: credit track + inspection track ไม่ต้องบวก SLA ซ้อนกัน
                const creditPending = pendingSteps.filter(s => ['CO', 'CO/ธนาคาร', 'ธนาคาร'].includes(s.owner));
                const inspPending = pendingSteps.filter(s => ['CS/CON', 'CS'].includes(s.owner));
                const transferPending = pendingSteps.filter(s => s.owner === 'Sale');
                const creditSLA = creditPending.reduce((s, x) => s + x.sla, 0);
                const inspSLA = inspPending.reduce((s, x) => s + x.sla, 0);
                const transferSLA = transferPending.reduce((s, x) => s + x.sla, 0);
                const parallelSLA = Math.max(creditSLA, inspSLA) + transferSLA; // ทำคู่ขนานได้
                const forecastDays = totalDays + parallelSLA;

                if (!overTarget) {
                  if (parallelSLA <= daysLeft) {
                    summaryParas.push(`คาดการณ์: หากทำงานคู่ขนาน (สินเชื่อ ${creditSLA} วัน + ตรวจบ้าน ${inspSLA} วัน ทำพร้อมกัน + โอน ${transferSLA} วัน) จะใช้เวลาอีกประมาณ ${parallelSLA} วัน รวม ~${forecastDays} วัน — ทันเป้าหมาย ${TARGET_DAYS} วัน`);
                  } else {
                    summaryParas.push(`คาดการณ์: แม้ทำคู่ขนาน ก็ต้องใช้เวลาอีกอย่างน้อย ${parallelSLA} วัน (รวม ~${forecastDays} วัน) ซึ่งเกินเป้า ${TARGET_DAYS} วัน — ทุกทีมต้องเร่งให้เร็วกว่ามาตรฐาน`);
                  }
                } else {
                  summaryParas.push(`คาดการณ์: เกินเป้าแล้ว ยังต้องใช้เวลาอีกอย่างน้อย ${parallelSLA} วัน (รวม ~${forecastDays} วัน) — ต้องเร่งรัดทุกทีม โดยเฉพาะ${creditSLA >= inspSLA ? ' CO ฝั่งสินเชื่อ' : ' CS/CON ฝั่งตรวจบ้าน'}ที่เป็นเส้นทางวิกฤต`);
                }
              }
            }

            return (
            <div className="space-y-3 pt-2">
              {/* AI Summary Card — long analysis */}
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg shadow-sm border border-violet-200/60 overflow-hidden">
                <div className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Summary — Booking {b.id}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${totalDays <= TARGET_DAYS ? 'bg-emerald-400/30 text-emerald-100' : totalDays <= 60 ? 'bg-amber-400/30 text-amber-100' : 'bg-red-400/30 text-red-100'}`}>
                      {totalDays <= TARGET_DAYS ? `ทันเป้า (เหลือ ${daysLeft} วัน)` : `เกินเป้า ${totalDays - TARGET_DAYS} วัน`}
                    </span>
                    <span className="text-[10px] text-white/50">เป้า {TARGET_DAYS} วัน</span>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {summaryParas.map((para, i) => (
                    <p key={i} className="text-[12px] leading-[1.7] text-slate-700">{para}</p>
                  ))}
                  {/* Speed indicator chips */}
                  {doneSteps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-violet-200/40">
                      {doneSteps.map((s, i) => {
                        const over = s.days! > s.sla;
                        return (
                          <span key={i} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${over ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {over ? '▼' : '▲'} {s.label} {s.days} วัน
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-white/60" />
                  Risk Analysis
                </div>
                <div className="divide-y divide-slate-100">
                  {(() => {
                    const risk = totalDays > 120 ? 'high' : totalDays > 60 ? 'medium' : 'low';
                    const riskColor = risk === 'high' ? 'text-red-600 bg-red-50' : risk === 'medium' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';
                    const riskLabel = risk === 'high' ? 'สูง' : risk === 'medium' ? 'ปานกลาง' : 'ต่ำ';
                    return (
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-700">Aging Risk</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${riskColor}`}>{riskLabel} ({totalDays} วัน / เป้า {TARGET_DAYS} วัน)</span>
                      </div>
                    );
                  })()}
                  {b.stage !== 'transferred' && b.stage !== 'cancelled' && (
                    <div className="px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-700">Credit Risk</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        b.bank_final_flag === 'pass' ? 'bg-emerald-50 text-emerald-600' :
                        b.bureau_flag === 'fail' ? 'bg-red-50 text-red-600' :
                        b.bank_preapprove_flag === 'fail' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {b.bank_final_flag === 'pass' ? 'อนุมัติแล้ว' :
                         b.bureau_flag === 'fail' ? 'บูโรไม่ผ่าน' :
                         b.bank_preapprove_flag === 'fail' ? 'เบื้องต้นไม่ผ่าน' :
                         'รอผล'}
                      </span>
                    </div>
                  )}
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-700">Transfer Blocker</span>
                    </div>
                    {b.cannot_transfer_issue ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-600">{b.cannot_transfer_issue}</span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">ไม่มี</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommended Next Actions */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-white/60" />
                  Next Actions
                </div>
                <div className="p-3 space-y-1.5">
                  {b.stage !== 'transferred' && b.stage !== 'cancelled' && (() => {
                    const creditDone2 = b.credit_status === 'อนุมัติแล้ว' || b.credit_status === 'โอนสด';
                    const inspDone2 = b.inspection_status === 'ผ่านแล้ว' || b.inspection_status === 'โอนแล้ว';
                    const inspStarted2 = !!b.inspect1_appt || !!b.inspect1_date;
                    const unitReady2 = !!b.unit_ready_inspection_date;
                    const items: { priority: 'urgent' | 'high' | 'normal' | 'parallel'; who: string; text: string }[] = [];

                    // Blocker — always first
                    if (b.cannot_transfer_issue) items.push({ priority: 'urgent', who: 'ทุกทีม', text: `แก้ปัญหา "${b.cannot_transfer_issue}" ก่อนเดินหน้าต่อ` });

                    // Credit track
                    if (!creditDone2) {
                      if (!b.contract_date) items.push({ priority: 'urgent', who: 'Sale', text: 'เร่งปิดสัญญากับลูกค้า — ทุกอย่างเริ่มจากตรงนี้' });
                      else if (!b.doc_bureau_date) items.push({ priority: 'high', who: 'CO', text: 'รวบรวมเอกสารเช็คบูโรให้ครบ แล้วยื่นธนาคารทันที' });
                      else if (!b.bureau_result) items.push({ priority: 'high', who: 'CO', text: `ติดตามผลบูโรกับธนาคาร${b.selected_bank ? ` (${bankDisplayName(b.selected_bank)})` : ''} — ควรได้ผลภายใน 1-2 วัน` });
                      else if (b.bureau_flag === 'fail') items.push({ priority: 'urgent', who: 'CO', text: 'บูโรไม่ผ่าน — ยื่นธนาคารอื่น หรือแก้ปัญหาเครดิตลูกค้าก่อน' });
                      else if (!b.bank_preapprove_result) items.push({ priority: 'high', who: 'CO', text: `ติดตามผล Pre-approve กับธนาคาร${b.banks_submitted.length < 2 ? ' + พิจารณายื่นธนาคารสำรอง' : ''}` });
                      else if (b.bank_preapprove_flag === 'fail') items.push({ priority: 'urgent', who: 'CO', text: 'ธนาคารไม่ Pre-approve — ยื่นธนาคารอื่นหรือเพิ่มผู้ค้ำ' });
                      else if (!b.bank_final_result) items.push({ priority: 'high', who: 'CO', text: 'ติดตามผลอนุมัติจริงกับธนาคาร — เตรียมเอกสารเพิ่มให้พร้อม' });
                      else if (b.bank_final_flag === 'pass' && !b.bank_contract_date) items.push({ priority: 'high', who: 'CO', text: 'อนุมัติแล้ว — นัดลูกค้าเซ็นสัญญากู้กับธนาคารภายใน 3 วัน' });
                      else if (b.bank_contract_date && !b.transfer_package_sent_date) items.push({ priority: 'high', who: 'CO', text: 'เร่งจัดเตรียมและส่งชุดโอนให้เสร็จ' });
                    }

                    // Inspection track — ทำคู่ขนานกับ credit
                    if (!inspDone2) {
                      if (!unitReady2) {
                        items.push({ priority: !creditDone2 ? 'parallel' : 'high', who: 'CON', text: `เร่งงานก่อสร้าง/ตกแต่งให้ห้องพร้อมตรวจ${!creditDone2 ? ' (ทำคู่ขนานระหว่างรอสินเชื่อ)' : ''}` });
                      } else if (!inspStarted2) {
                        items.push({ priority: !creditDone2 ? 'parallel' : 'high', who: 'CS', text: `ห้องพร้อมแล้ว — นัดลูกค้าตรวจบ้านทันที${!creditDone2 ? ' (ไม่ต้องรอสินเชื่อผ่าน ทำคู่ขนานได้)' : ''}` });
                      } else if (b.inspection_status === 'รอแก้งาน') {
                        items.push({ priority: 'urgent', who: 'CON', text: `เก็บงานแก้ไขให้เสร็จจริงก่อนนัดตรวจรอบถัดไป${failRounds > 1 ? ` (ไม่ผ่านมาแล้ว ${failRounds} รอบ)` : ''}` });
                      } else if (!b.handover_accept_date) {
                        items.push({ priority: 'high', who: 'CS', text: 'ติดตามลูกค้ามารับมอบห้อง' });
                      }
                    }

                    // Transfer — ถ้าพร้อมทั้งสองฝั่ง
                    if (creditDone2 && inspDone2 && !b.transfer_actual_date) {
                      if (!b.transfer_appointment_date) items.push({ priority: 'urgent', who: 'Sale', text: 'พร้อมโอนแล้ว — นัดวันโอนกับลูกค้าทันที' });
                      else items.push({ priority: 'high', who: 'Sale', text: `นัดโอนแล้ว ${b.transfer_appointment_date} — ติดตามให้ลูกค้ามาตามนัด` });
                    }

                    // Customer reason
                    if (b.reason_not_transfer_this_month) items.push({ priority: 'normal', who: 'Sale', text: `ลูกค้าบอก "${b.reason_not_transfer_this_month}" — หาทางจัดการหรือเสนอทางเลือก` });

                    const prioConfig = {
                      urgent: { bg: 'bg-red-100', text: 'text-red-600', icon: '!!' },
                      high: { bg: 'bg-amber-100', text: 'text-amber-600', icon: '!' },
                      normal: { bg: 'bg-blue-100', text: 'text-blue-600', icon: '→' },
                      parallel: { bg: 'bg-violet-100', text: 'text-violet-600', icon: '⇄' },
                    };

                    return items.length > 0 ? items.map((item, idx) => {
                      const cfg = prioConfig[item.priority];
                      return (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <span className={`w-4 h-4 rounded-full ${cfg.bg} ${cfg.text} flex items-center justify-center flex-shrink-0 text-[9px] font-bold mt-px`}>{cfg.icon}</span>
                          <span className={item.priority === 'urgent' ? 'text-red-600 font-medium' : 'text-slate-700'}>
                            <span className="font-semibold text-slate-500">[{item.who}]</span> {item.text}
                          </span>
                        </div>
                      );
                    }) : <p className="text-xs text-slate-400 text-center py-2">ไม่มีงานเร่งด่วน</p>;
                  })()}
                  {b.stage === 'transferred' && (<>
                    {b.refund_status && b.refund_status !== 'ไม่มี' && !b.refund_transfer_date && (
                      <div className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-[9px] font-bold mt-px">1</span>
                        <span className="text-slate-700">คืนเงินทอนลูกค้า — สถานะ: {b.refund_status}</span>
                      </div>
                    )}
                    {!b.water_meter_change_date && (
                      <div className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-[9px] font-bold mt-px">2</span>
                        <span className="text-slate-700">เปลี่ยนชื่อมิเตอร์น้ำ</span>
                      </div>
                    )}
                    {!b.electricity_meter_change_date && (
                      <div className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-[9px] font-bold mt-px">3</span>
                        <span className="text-slate-700">เปลี่ยนชื่อมิเตอร์ไฟ</span>
                      </div>
                    )}
                  </>)}
                  {b.stage === 'cancelled' && (
                    <p className="text-xs text-slate-400 text-center py-2">Booking ถูกยกเลิกแล้ว</p>
                  )}
                </div>
              </div>
            </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
