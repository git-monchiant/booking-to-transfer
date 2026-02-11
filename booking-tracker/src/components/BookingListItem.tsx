import { Booking, STAGE_CONFIG, formatMoney } from '@/data/bookings';
import { View } from '@/components/Sidebar';

interface BookingListItemProps {
  booking: Booking;
  currentView: View;
  onClick: () => void;
}

const BCLR: Record<string, string> = {
  KBANK:'bg-green-600',SCB:'bg-violet-700',KTB:'bg-sky-600',BBL:'bg-blue-800',
  BAY:'bg-yellow-500',GHB:'bg-orange-500',GSB:'bg-pink-500',TTB:'bg-orange-400',
  LH:'bg-lime-600',UOB:'bg-blue-600',CIMB:'bg-red-600',KKP:'bg-teal-600',
  iBank:'bg-emerald-600',TISCO:'bg-cyan-700',CASH:'bg-slate-600',
  'สหกรณ์':'bg-stone-500',JD:'bg-green-500',
};

const isAfterView = (view: View) => ['refund','meter','freebie','pending-work'].includes(view);

export function BookingListItem({ booking, currentView, onClick }: BookingListItemProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition">
      {/* Clickable card area */}
      <div onClick={onClick} className="cursor-pointer h-[152px] overflow-hidden">
        <div className="flex items-stretch h-full">
          <div className="flex-1 px-5 pt-1.5 pb-2 flex flex-col">
            {/* Row 1: Header */}
            <div className="flex items-center justify-between mb-0.5 h-7 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold text-base ${booking.stage === 'cancelled' ? 'text-red-500' : 'text-teal-700'}`}>{booking.id}</span>
                <span className="text-xs text-slate-400">Unit <span className="font-semibold text-slate-600">{booking.unit_no}</span></span>
                {booking.house_type && <><span className="text-slate-300">|</span><span className="text-xs text-slate-600">{booking.house_type}</span></>}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>เป้าโอน: <span className="text-slate-600 font-medium">{booking.transfer_target_date || '-'}</span></span>
                  <span>นัดโอน: <span className="text-slate-600 font-medium">{booking.transfer_appointment_date || '-'}</span></span>
                  {booking.transfer_actual_date && (
                    <span className="text-emerald-600 font-semibold">วันที่โอน: {booking.transfer_actual_date}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">฿{formatMoney(booking.net_contract_value)}</span>
                </div>
                <div className={`px-2 py-1 rounded flex items-center gap-1 ${
                  booking.aging_days > 45 ? 'bg-red-100' : booking.aging_days > 30 ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                  <span className={`text-sm font-bold ${
                    booking.aging_days > 45 ? 'text-red-600' : booking.aging_days > 30 ? 'text-amber-600' : 'text-slate-600'
                  }`}>{booking.aging_days}</span>
                  <span className="text-xs text-slate-500">วัน</span>
                </div>
              </div>
            </div>

            {/* Row 1.5: Column Headers */}
            <div className="flex text-[11px] text-slate-400 font-bold uppercase mb-0.5 h-6 shrink-0">
              <div className="w-[300px] shrink-0 pr-4 mr-5">
                <span className="text-sm font-semibold text-slate-900 normal-case truncate">{booking.customer_name}</span>
              </div>
              <div className={`flex-1 min-w-0 pr-3 mr-3 flex justify-between bg-slate-50 rounded px-1.5 py-0.5 ${isAfterView(currentView) ? 'hidden' : ''}`}>
                <span className="text-xs normal-case font-semibold text-slate-900">สินเชื่อ</span>
                <div className="flex items-center gap-1.5 normal-case">
                  <span className={`font-semibold ${
                    booking.credit_status === 'อนุมัติแล้ว' || booking.credit_status === 'โอนสด' ? 'text-emerald-600' :
                    booking.credit_status === 'รอผล Bureau' ? 'text-amber-600' : 'text-slate-700'
                  }`}>{booking.credit_status}{booking.credit_status === 'อนุมัติแล้ว' || booking.credit_status === 'โอนสด' ? ` (${booking.credit_request_type === 'โอนสด' ? 'เงินสด' : (booking.selected_bank || '-')})` : ''}</span>
                  {booking.livnex_able_status && (<>
                    <span className="text-slate-300">|</span>
                    <span className={`font-medium ${
                      booking.livnex_able_status.includes('อนุมัติ') && !booking.livnex_able_status.includes('ไม่อนุมัติ') ? 'text-indigo-600' :
                      booking.livnex_able_status.includes('ไม่อนุมัติ') ? 'text-red-500' : 'text-slate-500'
                    }`}>LivNex Able : {booking.livnex_able_status}</span>
                  </>)}
                </div>
              </div>
              <div className={`w-[390px] shrink-0 pr-3 mr-3 flex items-center justify-between gap-2 bg-slate-50 rounded px-1.5 py-0.5 ${isAfterView(currentView) ? 'hidden' : ''}`}>
                <span className="text-xs normal-case font-semibold text-slate-900">ตรวจบ้าน</span>
                <div className="flex items-center gap-1.5 normal-case">
                  {booking.inspection_status !== 'โอนแล้ว' && (
                    <span className={`px-1.5 py-0.5 rounded font-semibold ${
                      booking.inspection_status === 'ผ่านแล้ว' ? 'bg-emerald-100 text-emerald-700' :
                      booking.inspection_status === 'รอแก้งาน' ? 'bg-amber-100 text-amber-700' :
                      'bg-sky-100 text-sky-700'
                    }`}>{booking.inspection_status}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Content */}
            <div className="flex text-[11px] flex-1 min-h-0">
              {/* Col 1: Customer */}
              <div className="w-[300px] shrink-0 leading-snug pr-4 mr-5 text-[11px]">
                <div className="text-slate-600"><span className="text-slate-400">โทร : </span>{booking.customer_tel}</div>
                <div className="text-slate-600 truncate"><span className="text-slate-400">อาชีพ : </span>{booking.customer_occupation || '-'}</div>
                <div className="text-slate-600 truncate"><span className="text-slate-400">โครงการ : </span>{booking.project_name}</div>
                <div className="text-slate-600 truncate"><span className="text-slate-400">Sale : </span>{booking.sale_name}</div>
                <div className="flex items-center gap-0.5 mt-0.5 uppercase overflow-hidden">
                  {booking.stage === 'cancelled' ? (
                    <span className="px-1.5 py-px text-[9px] font-semibold shrink-0" style={{ backgroundColor: STAGE_CONFIG.cancelled.bg, color: STAGE_CONFIG.cancelled.color }}>Cancelled</span>
                  ) : booking.stage === 'transferred' ? (<>
                    <span className="px-1.5 py-px text-[9px] font-semibold shrink-0" style={{ backgroundColor: STAGE_CONFIG.transferred.bg, color: STAGE_CONFIG.transferred.color }}>Transferred</span>
                    {booking.refund_status && booking.refund_status !== 'ไม่มี' && (
                      <span className="px-1.5 py-px text-[9px] font-semibold shrink-0 bg-amber-50 text-amber-600">Refund</span>
                    )}
                    {(!booking.water_meter_change_date || !booking.electricity_meter_change_date) && (
                      <span className="px-1.5 py-px text-[9px] font-semibold shrink-0 bg-blue-50 text-blue-600">Meter</span>
                    )}
                    {!booking.handover_document_received_date && (
                      <span className="px-1.5 py-px text-[9px] font-semibold shrink-0 bg-emerald-50 text-emerald-600">Freebie</span>
                    )}
                    {!booking.handover_document_received_date && (
                      <span className="px-1.5 py-px text-[9px] font-semibold shrink-0 bg-red-50 text-red-500">Con-Pending</span>
                    )}
                  </>) : (() => {
                    const creditDone = booking.credit_status === 'อนุมัติแล้ว' || booking.credit_status === 'โอนสด';
                    const inspDone = booking.inspection_status === 'ผ่านแล้ว' || booking.inspection_status === 'โอนแล้ว';
                    return (<>
                      {!creditDone && (
                        <span className="px-1.5 py-px text-[9px] font-semibold shrink-0" style={{ backgroundColor: STAGE_CONFIG.credit.bg, color: STAGE_CONFIG.credit.color }}>Credit</span>
                      )}
                      {!inspDone && (
                        <span className="px-1.5 py-px text-[9px] font-semibold shrink-0" style={{ backgroundColor: STAGE_CONFIG.inspection.bg, color: STAGE_CONFIG.inspection.color }}>Inspection</span>
                      )}
                      {creditDone && inspDone && (
                        <span className="px-1.5 py-px text-[9px] font-semibold shrink-0" style={{ backgroundColor: STAGE_CONFIG.ready.bg, color: STAGE_CONFIG.ready.color }}>Ready</span>
                      )}
                    </>);
                  })()}
                </div>
              </div>

              {/* Col 2: Credit */}
              <div className={`flex-1 min-w-0 leading-snug pr-3 mr-3 pb-1 flex flex-col ${isAfterView(currentView) ? 'hidden' : ''}`}>
                <CreditPipeline booking={booking} />
                <div className="flex items-center gap-1 mt-auto pt-0.5 border-t border-slate-100">
                  <div className="flex flex-wrap gap-0.5 flex-1 min-w-0">
                    {booking.banks_submitted.map(bs => (
                      <span key={bs.bank} className={`inline-flex px-1.5 py-px text-[9px] font-bold text-white uppercase ${BCLR[bs.bank] || 'bg-slate-500'}`} title={[bs.bank, bs.result, bs.approved_amount ? `฿${formatMoney(bs.approved_amount)}` : ''].filter(Boolean).join(' · ')}>
                        {bs.bank}
                      </span>
                    ))}
                  </div>
                  {booking.credit_owner && (
                    <span className="text-[11px] text-slate-400 shrink-0 truncate max-w-[120px]">CO: <span className="text-slate-600">{booking.credit_owner}</span></span>
                  )}
                </div>
              </div>

              {/* Col: After Transfer details */}
              <div className={`flex-1 min-w-0 leading-snug pr-3 mr-3 text-[11px] ${!isAfterView(currentView) ? 'hidden' : ''}`}>
                <div className="text-[11px] font-bold text-teal-600 uppercase mb-1">
                  {currentView === 'refund' ? 'รายละเอียดการโอน และเงินทอนลูกค้า' :
                   currentView === 'freebie' ? 'รายละเอียดการโอน และของแถมลูกค้า' :
                   currentView === 'meter' ? 'รายละเอียดการโอน และการเปลี่ยนชื่อมิเตอร์น้ำ-ไฟ' :
                   currentView === 'pending-work' ? 'รายละเอียดการโอน และงานซ่อมคงค้าง' :
                   'รายละเอียดการโอน'}
                </div>
                <div className="space-y-0.5 mt-1">
                  {(currentView === 'refund' || currentView === 'after-transfer') && (<>
                    <div className="flex justify-between"><span className="text-slate-400">เงินทอน</span><span className={booking.refund_status && booking.refund_status !== 'ไม่มี' ? 'text-amber-600 font-medium' : 'text-slate-400'}>{booking.refund_status || '-'}</span></div>
                    {booking.refund_amount != null && booking.refund_amount > 0 && (
                      <div className="flex justify-between"><span className="text-slate-400">จำนวน</span><span className="font-semibold text-slate-700">฿{formatMoney(booking.refund_amount)}</span></div>
                    )}
                  </>)}
                  {(currentView === 'freebie' || currentView === 'after-transfer') && (
                    <div className="flex justify-between"><span className="text-slate-400">เอกสารส่งมอบ</span><span className={booking.handover_document_received_date ? 'text-emerald-600 font-medium' : 'text-amber-500'}>{booking.handover_document_received_date || 'รอรับ'}</span></div>
                  )}
                  {(currentView === 'meter' || currentView === 'after-transfer') && (<>
                    <div className="flex justify-between"><span className="text-slate-400">มิเตอร์น้ำ</span><span className={booking.water_meter_change_date ? 'text-emerald-600 font-medium' : 'text-amber-500'}>{booking.water_meter_change_date || 'รอ'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">มิเตอร์ไฟ</span><span className={booking.electricity_meter_change_date ? 'text-emerald-600 font-medium' : 'text-amber-500'}>{booking.electricity_meter_change_date || 'รอ'}</span></div>
                  </>)}
                  {(currentView === 'pending-work' || currentView === 'after-transfer') && (
                    <div className="flex justify-between"><span className="text-slate-400">เอกสารส่งมอบ</span><span className={booking.handover_document_received_date ? 'text-emerald-600 font-medium' : 'text-red-500'}>{booking.handover_document_received_date || 'ค้าง'}</span></div>
                  )}
                </div>
              </div>

              {/* Col 4: Inspection */}
              <div className={`w-[390px] shrink-0 leading-snug pr-3 mr-3 pb-1 flex flex-col ${isAfterView(currentView) ? 'hidden' : ''}`}>
                <div className="flex items-center gap-3 text-[11px] mb-0.5">
                  <span className="text-slate-400">QC(5.5): <span className="text-slate-600">{booking.unit_ready_inspection_date || '-'}</span></span>
                  <span className="text-slate-400">จ้างตรวจ: <span className="text-violet-600">{booking.hired_inspector || '-'}</span></span>
                </div>
                {(() => {
                  let latest: { round: number; appointment: string | null; actual: string | null; result: string | null } | null = null;
                  for (let r = 3; r >= 1; r--) {
                    const appt = booking[`inspect${r}_appointment_date` as keyof typeof booking] as string | null;
                    const actual = booking[`inspect${r}_actual_date` as keyof typeof booking] as string | null;
                    const res = booking[`inspect${r}_result` as keyof typeof booking] as string | null;
                    if (appt || actual || res) { latest = { round: r, appointment: appt, actual: actual, result: res }; break; }
                  }
                  return (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">ตรวจรอบ</span>
                        <span className="font-semibold text-slate-600">{latest?.round || '-'}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          latest?.result === 'ผ่าน' ? 'bg-emerald-50 text-emerald-600' : latest?.result === 'ไม่ผ่าน' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'
                        }`}>{latest?.result || '-'}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">นัด: <span className="text-slate-600 ml-1">{latest?.appointment || '-'}</span></span>
                        <span className="text-slate-400">ตรวจจริง: <span className={`ml-1 ${
                          latest?.result === 'ผ่าน' ? 'text-emerald-600' : latest?.result === 'ไม่ผ่าน' ? 'text-red-500' : 'text-slate-600'
                        }`}>{latest?.actual || '-'}</span></span>
                      </div>
                    </div>
                  );
                })()}
                <div className="mt-auto pt-0.5 border-t border-slate-100 flex items-center gap-1 text-[11px]">
                  <span className="text-slate-400">ลูกค้าตรวจรับห้อง: <span className={booking.handover_accept_date ? 'text-emerald-700 font-medium' : 'text-slate-400'}>{booking.handover_accept_date || '-'}</span>{booking.inspection_status === 'โอนแล้ว' && <span className="text-emerald-600 font-semibold ml-1">(โอนแล้ว)</span>}</span>
                  <span className="ml-auto text-slate-400 shrink-0 truncate">
                    CS: <span className="text-slate-600">{booking.cs_owner || '-'}</span> · CON: <span className="text-slate-600">{booking.inspection_officer || '-'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// Credit Pipeline sub-component
function CreditPipeline({ booking }: { booking: Booking }) {
  const isPass = (v: string | null) => v != null && (v.includes('อนุมัติ') || v.includes('ปกติ')) && !v.includes('ไม่อนุมัติ');
  const isFail = (v: string | null) => v != null && (v.includes('ไม่อนุมัติ') || v.includes('ค้างชำระ') || v === 'ยกเลิก' || v === 'อาณัติ');
  const parseD = (d: string) => { const [dd,mm,yy] = d.split('/'); return new Date(+yy, +mm-1, +dd); };
  const agingD = (target: string | null, actual: string | null) => {
    if (!target) return null;
    const diff = Math.floor(((actual ? parseD(actual) : new Date()).getTime() - parseD(target).getTime()) / 86400000);
    return diff > 0 ? diff : null;
  };
  const dotCls = (v: string | null) => isPass(v) ? 'bg-emerald-500' : isFail(v) ? 'bg-red-500' : v ? 'bg-amber-400' : 'bg-slate-300';
  const txtCls = (v: string | null) => v === 'done' ? 'text-emerald-600' : isPass(v) ? 'text-emerald-600' : isFail(v) ? 'text-red-500' : v ? 'text-amber-600' : 'text-slate-400';

  const docSteps = [
    { label: 'เอกสารเช็คบูโร', val: booking.doc_bureau_date ? 'done' : null, date: booking.doc_bureau_date },
    { label: 'เอกสาร Bank', val: booking.doc_complete_bank_jd_date ? 'done' : null, date: booking.doc_complete_bank_jd_date },
    { label: 'เอกสาร JD', val: booking.doc_complete_jd_date ? 'done' : null, date: booking.doc_complete_jd_date },
  ];
  const approvalSteps = [
    { label: 'ผลบูโร', val: booking.bureau_result, date: booking.bureau_actual_result_date, targetDate: booking.bureau_target_result_date_biz, ag: agingD(booking.bureau_target_result_date_biz, booking.bureau_actual_result_date) },
    { label: 'อนุมัติเบื้องต้น', val: booking.bank_preapprove_result, date: booking.bank_preapprove_actual_date, targetDate: booking.bank_preapprove_target_date_biz, ag: agingD(booking.bank_preapprove_target_date_biz, booking.bank_preapprove_actual_date) },
    { label: 'อนุมัติจริง', val: booking.bank_final_result, date: booking.bank_final_actual_date, targetDate: booking.bank_final_target_date_biz, ag: agingD(booking.bank_final_target_date_biz, booking.bank_final_actual_date) },
    { label: 'JD', val: booking.jd_final_result, date: booking.jd_final_actual_date, targetDate: booking.jd_final_target_date, ag: agingD(booking.jd_final_target_date, booking.jd_final_actual_date) },
  ];

  const renderCell = (s: { label: string; val: string | null; date: string | null; targetDate?: string | null; ag?: number | null }) => (
    <div key={s.label} className="min-w-0">
      <div className="flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.val === 'done' ? 'bg-emerald-500' : dotCls(s.val)}`} />
        <span className={`text-xs font-medium truncate ${txtCls(s.val)}`}>{s.label}</span>
        {s.ag ? <span className="text-[10px] text-red-500 shrink-0">+{s.ag}d</span> : null}
      </div>
      <div className="pl-3 text-[11px] leading-tight">
        {s.date && <span className="text-slate-400">{s.date}</span>}
        {!s.date && s.targetDate && <span className="text-slate-300">{s.targetDate}</span>}
        {s.val && s.val !== 'done' && <span className="text-slate-600 ml-1 truncate">{s.val}</span>}
        {!s.date && !s.targetDate && (!s.val || s.val === 'done') && <span className="text-slate-300">—</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-4 gap-x-3">
        {docSteps.map(renderCell)}
      </div>
      <div className="grid grid-cols-4 gap-x-3">
        {approvalSteps.map(renderCell)}
      </div>
    </div>
  );
}

