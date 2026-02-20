'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Booking, getResultFlag } from '@/data/bookings';
import { PROCESS_SLA, PROJECTS } from '@/data/masters';

// Occupation → PROCESS_SLA suffix
const OCC_SUFFIX: Record<string, string> = {
  'พนักงาน': 'emp', 'เจ้าของกิจการ/อาชีพอิสระ': 'biz',
  'ข้าราชการ': 'gov', 'ต่างชาติ': 'foreign',
  'เกษียณ/บำนาญ': 'retire', 'สวัสดิการ': 'welfare',
};

// Lookup SLA from PROCESS_SLA — returns "Xd" string
const findSla = (key: string, pType?: 'Condo' | 'House'): string => {
  const rules = PROCESS_SLA.filter(r => r.processKey === key);
  if (pType) { const t = rules.find(r => r.projectType === pType); if (t) return `${t.slaDays}d`; }
  const g = rules.find(r => !r.projectType);
  return g ? `${g.slaDays}d` : '';
};

// SLA Timeline — text-character tree view (├ └ │)
export function SLATimeline({ booking }: { booking: Booking }) {
  const parseD = (d: string) => { const [dd,mm,yy] = d.split('/'); return new Date(+yy, +mm-1, +dd); };
  const daysDiff = (a: string | null, b: string | null) => {
    if (!a || !b) return null;
    return Math.round((parseD(b).getTime() - parseD(a).getTime()) / 86400000);
  };
  const parseSlaMax = (sla?: string) => {
    if (!sla) return null;
    const parts = sla.replace('d', '').split('-');
    return parseInt(parts[parts.length - 1]);
  };
  const isPass = (r: string | null) => getResultFlag(r) === 'pass';
  const isFail = (r: string | null) => getResultFlag(r) === 'fail';

  // ── Resolve occupation / projectType / inspectionMethod ──
  const suffix = OCC_SUFFIX[booking.customer_occupation || ''] || 'emp';
  const project = PROJECTS.find(p => p.code === booking.project_code);
  const pType = project?.project_status as 'Condo' | 'House' | undefined;
  const inspSuffix = booking.inspection_method === 'จ้างตรวจ' ? 'hired' : 'self';
  const isCash = booking.credit_request_type === 'โอนสด';

  // ── SLA values from PROCESS_SLA ──
  const sla = {
    doc_bureau: findSla('doc_bureau'),
    doc_bank: findSla('doc_bank'),
    doc_jd: findSla('doc_jd'),
    jd_livnex: findSla('jd_livnex'),
    bureau: findSla(`bureau_${suffix}`),
    preapprove: findSla(`preapprove_${suffix}`),
    final: findSla(`final_${suffix}`),
    inspect_appt: isCash ? findSla('inspect_appt_cash') : findSla('inspect_appt_loan'),
    inspect1: findSla(`inspect1_${inspSuffix}`),
    inspect2: findSla(`inspect2_${inspSuffix}`, pType),
    inspect3: findSla(`inspect3_${inspSuffix}`, pType),
    contract_bank: findSla('contract_bank'),
    transfer_pkg: findSla('transfer_pkg'),
    title_clear: findSla('title_clear'),
    transfer_appt: findSla('transfer_appt'),
    transfer_actual: findSla('transfer_actual'),
  };

  // Key dates
  const bureauDate = booking.bureau_actual_result_date;
  const finalApproveDate = booking.bank_final_actual_date;
  const preapproveDate = booking.bank_preapprove_actual_date;
  const bankContractDate = booking.bank_contract_date;
  const transferPkg = booking.transfer_package_sent_date;
  const docBankDate = booking.doc_complete_bank_jd_date;
  const docJdDate = booking.doc_complete_jd_date;

  // Inspection rounds
  const inspRounds = [1, 2, 3].map(r => ({
    round: r,
    appointment: booking[`inspect${r}_appt` as keyof typeof booking] as string | null,
    actual: booking[`inspect${r}_date` as keyof typeof booking] as string | null,
    result: booking[`inspect${r}_result` as keyof typeof booking] as string | null,
    ready: booking[`inspect${r}_ready` as keyof typeof booking] as string | null,
  }));
  const visibleRounds = inspRounds.filter((r, i) =>
    r.actual || r.appointment || r.ready || (i > 0 && isFail(inspRounds[i - 1].result))
  );
  const lastInspOrRepair = (() => {
    for (let i = visibleRounds.length - 1; i >= 0; i--) {
      if (visibleRounds[i].ready) return visibleRounds[i].ready;
      if (visibleRounds[i].actual) return visibleRounds[i].actual;
    }
    return booking.inspect1_appt;
  })();

  const totalDays = daysDiff(booking.booking_date, booking.transfer_actual_date);
  const firstSubmitDate = (() => { const dates = booking.banks_submitted.map(b => b.submit_date).filter(Boolean) as string[]; return dates.length ? dates.sort((a,b) => parseD(a).getTime() - parseD(b).getTime())[0] : null; })();

  const [expandedBanks, setExpandedBanks] = useState<Record<string, boolean>>({});
  const toggleBank = (bank: string) => setExpandedBanks(prev => ({ ...prev, [bank]: !prev[bank] }));

  type S = { label: string; date: string | null; prev: string | null; result?: string | null; owner?: string | null; sla?: string };

  // Tree characters
  const T = (isLast: boolean) => isLast ? '└─' : '├─';
  const G = (continues: boolean) => continues ? '│ ' : '  ';

  // Prefix span
  const pre = (text: string) => (
    <span className="text-slate-300 font-mono text-[11px] shrink-0 leading-[22px] whitespace-pre select-none">{text}</span>
  );

  // Result badge
  const badge = (result: string | null) => result ? (
    <span className={`text-[9px] px-1 py-px rounded font-medium ${
      isPass(result) ? 'bg-emerald-100 text-emerald-700' :
      isFail(result) ? 'bg-red-100 text-red-600' :
      'bg-amber-100 text-amber-600'
    }`}>{result}</span>
  ) : null;

  // Tree node renderer
  const node = (s: S, isLast: boolean, prefix: string = '') => {
    const days = daysDiff(s.prev, s.date);
    const done = !!s.date;
    const slaMax = parseSlaMax(s.sla);
    const overSla = days !== null && slaMax !== null && days > slaMax;

    return (
      <div className="flex items-start gap-0 min-h-[22px]">
        {pre(prefix + T(isLast))}
        <div className={`w-1.5 h-1.5 rounded-full mt-[7px] mx-1 shrink-0 ${done ? 'bg-emerald-500' : s.prev ? 'bg-amber-400' : 'bg-slate-300'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 leading-[22px]">
            <span className={`text-[11px] font-medium ${done ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</span>
            {badge(s.result ?? null)}
            <span className={`text-[10px] ${done ? 'text-slate-500' : 'text-slate-300'}`}>{s.date || '—'}</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 tabular-nums shrink-0 w-10 text-right leading-[22px]">{s.sla || ''}</span>
        <span className={`text-[10px] font-medium tabular-nums shrink-0 w-8 text-right leading-[22px] ${
          days === null ? 'text-slate-300' : overSla ? 'text-red-500' : 'text-emerald-600'
        }`}>{days !== null ? `${days}d` : ''}</span>
        <span className="text-[10px] text-slate-500 shrink-0 w-[200px] text-left pl-2 leading-[22px] truncate">{s.owner || ''}</span>
      </div>
    );
  };

  // Branch header
  const branchHead = (label: string, color: string, dotColor: string, isLast: boolean) => (
    <div className="flex items-center min-h-[22px]">
      {pre(T(isLast))}
      <div className={`w-1.5 h-1.5 rounded-full mx-1 shrink-0 ${dotColor}`} />
      <span className={`text-[11px] font-bold ${color}`}>{label}</span>
    </div>
  );

  // Guide prefixes for each branch level
  const gCredit = G(true);   // สินเชื่อ is not last root → guide continues
  const gInspect = G(true);  // ตรวจบ้าน is not last root → guide continues
  const gTransfer = G(false); // โอน is last root → no guide

  // Inspection SLA per round
  const inspSla = (round: number) => round === 1 ? sla.inspect1 : round === 2 ? sla.inspect2 : sla.inspect3;

  // Occupation label
  const occLabel = booking.customer_occupation || 'พนักงาน';
  // Inspection label
  const inspLabel = booking.inspection_method === 'จ้างตรวจ' ? 'จ้างตรวจ' : 'ตรวจเอง';
  const pTypeLabel = pType || 'Condo';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-2 pb-1.5 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex-1">SLA Timeline</span>
        <span className="text-[10px] font-bold text-slate-400 shrink-0 w-10 text-right">SLA</span>
        <span className={`text-[10px] font-bold tabular-nums shrink-0 w-8 text-right ${totalDays !== null ? 'text-emerald-600' : 'text-amber-600'}`}>
          {totalDays !== null ? `${totalDays}d` : `${booking.aging_days}d`}
        </span>
        <span className="text-[10px] font-bold text-slate-400 shrink-0 w-[200px] text-left pl-2">ผู้รับผิดชอบ</span>
      </div>

      {/* Tree */}
      <div className="text-[11px]">
        {/* ── Milestone ── */}
        {node({ label: `จอง (${occLabel})`, date: booking.booking_date, prev: null, owner: booking.sale_name }, false)}
        {node({ label: 'ทำสัญญา', date: booking.contract_date, prev: booking.booking_date, owner: booking.sale_name }, false)}
        {node({ label: 'ผ่อนดาวน์ครบ', date: booking.down_payment_complete_date, prev: booking.contract_date || booking.booking_date }, false)}

        {/* ── เอกสาร ── */}
        {node({ label: 'เอกสารตรวจบูโร', date: booking.doc_bureau_date, prev: booking.booking_date, owner: booking.credit_owner, sla: sla.doc_bureau }, false)}
        {node({ label: 'เตรียมเอกสารธนาคาร', date: docBankDate, prev: booking.booking_date, owner: booking.credit_owner, sla: sla.doc_bank }, false)}
        {node({ label: 'เตรียมเอกสาร JD', date: docJdDate, prev: docBankDate, owner: booking.credit_owner, sla: sla.doc_jd }, false)}

        {/* ── JD - LivNex Able ── */}
        {node({ label: 'JD - LivNex Able', date: booking.jd_final_actual_date, prev: docBankDate, result: booking.livnex_able_status, owner: booking.credit_owner, sla: sla.jd_livnex }, false)}

        {/* ═══ สินเชื่อ ═══ */}
        {branchHead(`สินเชื่อ (${occLabel})`, 'text-amber-600', 'bg-amber-400', false)}
        {node({ label: 'ส่งเอกสารให้ธนาคาร', date: firstSubmitDate, prev: booking.doc_bureau_date || docBankDate, owner: booking.credit_owner }, false, gCredit)}
        {node({ label: 'ผลบูโร', date: bureauDate, prev: booking.booking_date, result: booking.bureau_result, owner: booking.credit_owner, sla: sla.bureau }, false, gCredit)}
        {node({ label: 'อนุมัติเบื้องต้น', date: preapproveDate, prev: docBankDate, result: booking.bank_preapprove_result, owner: booking.credit_owner, sla: sla.preapprove }, false, gCredit)}
        {node({ label: 'อนุมัติจริง', date: finalApproveDate, prev: docBankDate, result: booking.bank_final_result, owner: booking.credit_owner, sla: sla.final }, false, gCredit)}

        {booking.banks_submitted.map((bs, idx) => {
          const isSelected = bs.bank === booking.selected_bank;
          const isJD = bs.bank === 'JD';
          const isOpen = !!expandedBanks[bs.bank];
          const badgeBg = isSelected ? 'bg-emerald-500' : isJD ? 'bg-green-500' : 'bg-slate-400';
          const isLastBank = idx === booking.banks_submitted.length - 1;
          const childPre = gCredit + G(!isLastBank);

          return (
            <div key={bs.bank}>
              {/* Bank header */}
              <div className="flex items-center min-h-[22px]">
                {pre(gCredit + T(isLastBank))}
                <button onClick={() => toggleBank(bs.bank)} className="flex items-center gap-0.5 hover:bg-slate-50/80 rounded px-0.5 transition">
                  <ChevronRight className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  <span className={`px-1 py-px rounded text-[9px] font-bold text-white ${badgeBg}`}>{bs.bank}</span>
                </button>
                {isSelected && <span className="text-[9px] text-emerald-500 font-medium ml-1">เลือก</span>}
                {isJD && <span className="text-[9px] text-green-500 font-medium ml-1">Internal</span>}
                {!isOpen && badge(bs.result)}
                {!isOpen && bs.result_date && <span className="text-[10px] text-slate-400 ml-1">{bs.result_date}</span>}
              </div>
              {/* Bank children */}
              {isOpen && (
                <>
                  {node({ label: 'ผลบูโร', date: bureauDate, prev: bs.submit_date || booking.doc_bureau_date, result: booking.bureau_result, owner: booking.credit_owner, sla: sla.bureau }, false, childPre)}
                  {!isJD && node({ label: 'อนุมัติเบื้องต้น', date: bs.preapprove_date, prev: docBankDate, result: bs.preapprove_result, owner: booking.credit_owner, sla: sla.preapprove }, false, childPre)}
                  {node({ label: isJD ? 'JD - LivNex Able' : 'อนุมัติจริง', date: bs.result_date, prev: isJD ? docBankDate : bs.preapprove_date, result: bs.result, owner: booking.credit_owner, sla: isJD ? sla.jd_livnex : sla.final }, true, childPre)}
                </>
              )}
            </div>
          );
        })}

        {/* ═══ ตรวจบ้าน ═══ */}
        {branchHead(`ตรวจบ้าน (${inspLabel}/${pTypeLabel})`, 'text-sky-600', 'bg-sky-400', false)}
        {node({ label: 'QC 5.5 ห้องพร้อมตรวจ', date: booking.unit_ready_inspection_date, prev: booking.contract_date || booking.booking_date, owner: booking.inspection_officer }, false, gInspect)}
        {node({ label: isCash ? 'โทรนัดตรวจ (โอนสด)' : 'โทรนัดตรวจ (กู้ธนาคาร)', date: booking.inspect1_appt, prev: isCash ? booking.booking_date : bureauDate, owner: booking.cs_owner, sla: sla.inspect_appt }, false, gInspect)}

        {visibleRounds.map((r) => {
          const prevDate = r.round === 1
            ? booking.inspect1_appt
            : inspRounds[r.round - 2].ready || inspRounds[r.round - 2].actual;
          const failed = isFail(r.result);
          const roundSla = inspSla(r.round);

          if (failed) {
            return (
              <div key={r.round}>
                <div className="flex items-start gap-0 min-h-[22px]">
                  {pre(gInspect + T(false))}
                  <div className={`w-1.5 h-1.5 rounded-full mt-[7px] mx-1 shrink-0 ${r.actual ? 'bg-emerald-500' : prevDate ? 'bg-amber-400' : 'bg-slate-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 leading-[22px]">
                      <span className={`text-[11px] font-medium ${r.actual ? 'text-slate-700' : 'text-slate-400'}`}>ตรวจครั้งที่ {r.round}</span>
                      <span className="text-[9px] px-1 py-px rounded font-medium bg-red-100 text-red-600">{r.result}</span>
                      <span className={`text-[10px] ${r.actual ? 'text-slate-500' : 'text-slate-300'}`}>{r.actual || '—'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 tabular-nums shrink-0 w-10 text-right leading-[22px]">{roundSla}</span>
                  <span className="text-[10px] font-medium tabular-nums shrink-0 w-8 text-right leading-[22px] text-slate-300" />
                  <span className="text-[10px] text-slate-500 shrink-0 w-[200px] text-left pl-2 leading-[22px] truncate" />
                </div>
                {node({ label: 'เก็บงาน', date: r.ready, prev: r.actual, owner: booking.inspection_officer, sla: inspSla(r.round + 1) }, true, gInspect + G(true))}
              </div>
            );
          }
          return (
            <div key={r.round}>
              {node({ label: `ตรวจครั้งที่ ${r.round}`, date: r.actual, prev: prevDate, result: r.result, owner: booking.cs_owner, sla: roundSla }, false, gInspect)}
            </div>
          );
        })}

        {node({ label: 'ลูกค้ารับมอบ', date: booking.handover_accept_date, prev: lastInspOrRepair, owner: booking.cs_owner }, true, gInspect)}

        {/* ═══ โอน ═══ */}
        {branchHead('โอน', 'text-teal-600', 'bg-teal-400', true)}
        {node({ label: 'สัญญา Bank', date: bankContractDate, prev: finalApproveDate || preapproveDate, owner: booking.credit_owner, sla: sla.contract_bank }, false, gTransfer)}
        {node({ label: 'ส่งชุดโอน', date: transferPkg, prev: bankContractDate || finalApproveDate, owner: booking.credit_owner, sla: sla.transfer_pkg }, false, gTransfer)}
        {node({ label: 'ปลอดโฉนด', date: booking.title_clear_date, prev: transferPkg || bankContractDate, owner: booking.credit_owner, sla: sla.title_clear }, false, gTransfer)}
        {node({ label: 'เป้าโอน', date: booking.transfer_target_date, prev: null }, false, gTransfer)}
        {node({ label: 'นัดโอน', date: booking.transfer_appointment_date, prev: booking.title_clear_date || transferPkg, owner: booking.sale_name, sla: sla.transfer_appt }, false, gTransfer)}
        {node({ label: 'โอนจริง', date: booking.transfer_actual_date, prev: booking.transfer_appointment_date, owner: booking.sale_name, sla: sla.transfer_actual }, true, gTransfer)}
      </div>
    </div>
  );
}
