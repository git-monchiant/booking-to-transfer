'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import {
  AVG_UNIT_VALUE, AVG_CONTRACT_VALUE, MONTHLY_TRANSFER_DATA, MONTHLY_SALES_DATA, BACKLOG_INITIAL,
  MONTHLY_CANCEL_DATA, AVG_CANCEL_VALUE,
} from '@/data/chart-data';

export function TransferCharts({ budDisplayMode }: { budDisplayMode: 'unit' | 'net' | 'contract' }) {
  const [showSalesCum, setShowSalesCum] = useState(true);
  const [showLivNexCum, setShowLivNexCum] = useState(true);
  const [showCancelCum, setShowCancelCum] = useState(true);
  const [showPreLivNexCum, setShowPreLivNexCum] = useState(true);
  const [showTransferCum, setShowTransferCum] = useState(true);

  // ปัดแกน Y ให้เป็นเลขสวย + เพิ่มอีก 1 ขั้น
  const niceYMax = (dataMax: number) => {
    const step = [5, 10, 15, 20, 25, 50, 100, 200, 500].find(s => dataMax / s <= 4) || Math.ceil(dataMax / 4);
    return (Math.ceil(dataMax / step) + 1) * step;
  };

  // round helper — ป้องกัน floating point เช่น 37.2+6.2=43.400000000000006
  const r = (v: number) => +v.toFixed(2);

  // มูลค่าเฉลี่ยต่อ unit รวมทั้งโครงการ (ล้านบาท)
  const isVal = budDisplayMode !== 'unit';
  const avgPrice = budDisplayMode === 'contract' ? AVG_CONTRACT_VALUE : AVG_UNIT_VALUE;
  const mv = (v: number) => isVal ? r(v * avgPrice) : v;
  const valUnit = isVal ? 'ล้าน฿' : 'ราย';

  const chartData = MONTHLY_TRANSFER_DATA.map(d => ({
    month: d.month, MTOP: mv(d.MTOP), แผนโอน: mv(d.แผนโอน), Upside: mv(d.Upside),
    โอนจากBacklog: mv(d.โอนจากBacklog), โอนจากขายในเดือน: mv(d.โอนจากขายในเดือน),
    โอนจริง: mv(d.โอนจากBacklog + d.โอนจากขายในเดือน),
    LivNex: mv(d.LivNex), PreLivNex: mv(d.PreLivNex),
  }));

  // คำนวณสะสม + forecast
  let cumActual = 0, cumLivNex = 0, cumPreLivNex = 0, cumMTOP = 0;
  const lastActualIdx = chartData.reduce((last, d, i) => d.โอนจริง > 0 ? i : last, -1);
  let cumForecast = 0;
  const chartDataWithCum = chartData.map((d, i) => {
    cumActual += d.โอนจริง;
    cumLivNex += d.LivNex;
    cumPreLivNex += d.PreLivNex;
    cumMTOP += d.MTOP;
    let Forecast: number | undefined;
    if (i === lastActualIdx) { cumForecast = cumActual; Forecast = +(cumForecast.toFixed(2)); }
    else if (i > lastActualIdx && lastActualIdx >= 0) { cumForecast += d.แผนโอน + d.Upside; Forecast = +(cumForecast.toFixed(2)); }
    return { ...d, โอนสะสม: +(cumActual.toFixed(2)), LivNexสะสม: +(cumLivNex.toFixed(2)), PreLivNexสะสม: +(cumPreLivNex.toFixed(2)), MTOPสะสม: +(cumMTOP.toFixed(2)), Forecast };
  });

  const totalTarget = +chartData.reduce((s, d) => s + d.MTOP, 0).toFixed(2);
  const totalPlan = +chartData.reduce((s, d) => s + d.แผนโอน + d.Upside, 0).toFixed(2);
  const totalActual = +chartData.reduce((s, d) => s + d.โอนจริง, 0).toFixed(2);
  const totalLivNex = +chartData.reduce((s, d) => s + d.LivNex, 0).toFixed(2);

  // ═══ Sales Chart Data ═══
  // Contract เป็น subset ของ Book → จอง = Book - Contract, stack รวม = Book
  // Backlog คำนวณจากสูตร: Backlog(n) = Backlog(n-1) + Book(n) - โอนจริง(n)
  const salesData = (() => {
    let cumBook = 0;
    let backlog = BACKLOG_INITIAL;
    let cumLN = 0, cumPLN = 0;
    return MONTHLY_SALES_DATA.map((d, i) => {
      const t = MONTHLY_TRANSFER_DATA[i];
      const โอนจริง = t.โอนจากBacklog + t.โอนจากขายในเดือน;
      const hasActual = d.Book > 0 || โอนจริง > 0; // มีข้อมูลจริงหรือยัง
      cumBook += d.Book;
      cumLN += d.LivNex;
      cumPLN += d.PreLivNex;
      backlog = backlog + d.Book - โอนจริง;
      const unsigned = d.Book - d.Contract; // จอง (ยังไม่ทำสัญญา)
      return {
        month: d.month,
        เป้าBook: mv(d.เป้าBook), เป้าLivNex: mv(d.เป้าLivNex), เป้าPreLivNex: mv(d.เป้าPreLivNex),
        รอทำสัญญา: mv(unsigned), ทำสัญญา: mv(d.Contract),
        LivNex: mv(d.LivNex), LivNexใหม่: mv(d.LivNexใหม่), LivNexจากยกเลิก: mv(d.LivNexจากยกเลิก),
        PreLivNex: mv(d.PreLivNex), PreLivNexใหม่: mv(d.PreLivNexใหม่), PreLivNexจากยกเลิก: mv(d.PreLivNexจากยกเลิก),
        LivNexสะสม: mv(cumLN), PreLivNexสะสม: mv(cumPLN),
        _total: mv(d.Book),
        ขายสะสม: hasActual ? mv(cumBook) : null,
        Backlog: mv(backlog),
      };
    });
  })();
  const salesTotalTargetBook = +MONTHLY_SALES_DATA.reduce((s, d) => s + d.เป้าBook, 0);
  const salesTotalTargetLivNex = +MONTHLY_SALES_DATA.reduce((s, d) => s + d.เป้าLivNex, 0);
  const salesTotalTargetPreLivNex = +MONTHLY_SALES_DATA.reduce((s, d) => s + d.เป้าPreLivNex, 0);
  const salesTotalBook = +MONTHLY_SALES_DATA.reduce((s, d) => s + d.Book, 0);
  const salesTotalContract = +MONTHLY_SALES_DATA.reduce((s, d) => s + d.Contract, 0);
  const salesTotalLivNex = +MONTHLY_SALES_DATA.reduce((s, d) => s + d.LivNex, 0);
  const salesTotalPreLivNex = +MONTHLY_SALES_DATA.reduce((s, d) => s + d.PreLivNex, 0);

  // ═══ Cancel Data ═══
  let cumCancel = 0;
  const cancelData = MONTHLY_CANCEL_DATA.map(d => {
    const netCancel = d.ยกเลิก - d.ซื้อLivNex - d.ซื้อPreLivNex;
    cumCancel += netCancel;
    return {
      ...d,
      ยกเลิก: isVal ? r(d.ยกเลิก * AVG_CANCEL_VALUE) : d.ยกเลิก,
      ยกเลิกสะสม: isVal ? r(cumCancel * AVG_CANCEL_VALUE) : cumCancel,
      ซื้อLivNex: isVal ? r(d.ซื้อLivNex * AVG_CANCEL_VALUE) : d.ซื้อLivNex,
      ซื้อPreLivNex: isVal ? r(d.ซื้อPreLivNex * AVG_CANCEL_VALUE) : d.ซื้อPreLivNex,
    };
  });
  const totalCancel = MONTHLY_CANCEL_DATA.reduce((s, d) => s + d.ยกเลิก, 0);

  return (
    <>
      {/* ════════ ภาพรวมยอดขายรายเดือน ════════ */}
      <div className="grid grid-cols-2 gap-4">
        {/* กราฟ 1: MTOP vs Book+สัญญา */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-900 text-sm">ยอดจอง — จอง/สัญญา</h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-slate-500">MTOP <span className="font-bold text-slate-700">{mv(salesTotalTargetBook)}</span></span>
              <span className="text-slate-500">Book <span className="font-bold text-emerald-600">{mv(salesTotalBook)}</span>/<span className="text-emerald-700">{mv(salesTotalContract)}</span></span>
              <span className="text-slate-400">{valUnit}</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mb-1 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#d1d5db' }} /> MTOP</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#34d399' }} /> รอทำสัญญา</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#047857' }} /> ทำสัญญา</span>
            {showSalesCum && (
              <span className="flex items-center gap-1"><span className="w-6 border-t-[3px] border-dashed" style={{ borderColor: '#b45309' }} /> Backlog</span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={salesData} barCategoryGap="15%" barGap={2} margin={{ left: 0, right: 5, top: 25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} domain={[0, niceYMax]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} domain={[0, niceYMax]} hide={!showSalesCum} label={{ value: 'Backlog', angle: 90, position: 'insideRight', style: { fontSize: 9, fill: '#b45309' } }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={((value: any, name: any) => [`${value} ${valUnit}`, name]) as any} />
              <Bar yAxisId="left" dataKey="เป้าBook" name="MTOP" stackId="mtop" fill="#d1d5db" barSize={22}>
                <LabelList dataKey="เป้าBook" position="top" style={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} formatter={((v: any) => Number(v) > 0 ? v : '') as any} />
              </Bar>
              <Bar yAxisId="left" dataKey="ทำสัญญา" stackId="book" fill="#047857" barSize={22}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, height, value } = props;
                    if (x == null || y == null || !value) return null;
                    return (
                      <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" style={{ fontSize: 8, fontWeight: 600, fill: '#fff' }}>
                        {value}
                      </text>
                    );
                  }) as any}
                />
              </Bar>
              <Bar yAxisId="left" dataKey="รอทำสัญญา" stackId="book" fill="#34d399" barSize={22}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, height, index } = props;
                    if (x == null || y == null || width == null || index == null) return null;
                    const d = salesData[index];
                    if (!d._total) return null;
                    return (
                      <g>
                        {d.รอทำสัญญา > 0 && (
                          <text x={x + width / 2} y={y + (height || 0) / 2 + 3} textAnchor="middle" style={{ fontSize: 8, fontWeight: 700, fill: '#065f46' }}>
                            {d.รอทำสัญญา}
                          </text>
                        )}
                        <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: '#047857' }}>
                          {d._total}
                        </text>
                      </g>
                    );
                  }) as any}
                />
              </Bar>
              {showSalesCum && (
                <Line yAxisId="right" type="monotone" dataKey="Backlog" name="Backlog (สะสม)" stroke="#b45309" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 4, fill: '#b45309', strokeWidth: 2, stroke: '#fff' }}>
                  <LabelList dataKey="Backlog" position="top" style={{ fontSize: 9, fontWeight: 700, fill: '#b45309' }} formatter={((v: any) => v != null && Number(v) > 0 ? v : '') as any} />
                </Line>
              )}
            </ComposedChart>
          </ResponsiveContainer>
          <label className="flex items-center gap-1.5 mt-1 ml-1 cursor-pointer select-none">
            <input type="checkbox" checked={showSalesCum} onChange={() => setShowSalesCum(v => !v)} className="w-3.5 h-3.5 rounded accent-emerald-600" />
            <span className="text-[10px] text-slate-500">แสดงสะสม</span>
          </label>
        </div>


        {/* กราฟ 2: LivNex เป้า vs Actual */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-900 text-sm">ยอดจอง — LivNex</h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-slate-500">เป้า <span className="font-bold text-orange-400">{mv(salesTotalTargetLivNex)}</span> Actual <span className="font-bold text-orange-500">{mv(salesTotalLivNex)}</span></span>
              <span className="text-slate-400">{valUnit}</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mb-1 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#fed7aa' }} /> เป้า</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f97316' }} /> ขายใหม่</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#c2410c' }} /> จากยกเลิก</span>
            {showLivNexCum && (
              <span className="flex items-center gap-1"><span className="w-6 border-t-2" style={{ borderColor: '#c2410c' }} /> สะสม</span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={salesData} barCategoryGap="15%" barGap={2} margin={{ left: -5, right: 5, top: 25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} domain={[0, niceYMax]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} domain={[0, niceYMax]} hide={!showLivNexCum} label={{ value: 'สะสม', angle: 90, position: 'insideRight', style: { fontSize: 9, fill: '#c2410c' } }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={((value: any, name: any) => [`${value} ${valUnit}`, name]) as any} />
              <Bar yAxisId="left" dataKey="เป้าLivNex" name="เป้าLivNex" stackId="tlivnex" fill="#fed7aa" barSize={22}>
                <LabelList dataKey="เป้าLivNex" position="top" style={{ fontSize: 8, fontWeight: 700, fill: '#c2410c' }} formatter={((v: any) => Number(v) > 0 ? v : '') as any} />
              </Bar>
              <Bar yAxisId="left" dataKey="LivNexจากยกเลิก" name="จากยกเลิก" stackId="alivnex" fill="#c2410c" barSize={22}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, height, index } = props;
                    if (x == null || y == null || width == null || index == null) return null;
                    const d = salesData[index];
                    if (!d.LivNexจากยกเลิก) return null;
                    return (
                      <text x={x + width / 2} y={y + (height || 0) / 2 + 3} textAnchor="middle" style={{ fontSize: 8, fontWeight: 600, fill: '#fff' }}>
                        {d.LivNexจากยกเลิก}
                      </text>
                    );
                  }) as any}
                />
              </Bar>
              <Bar yAxisId="left" dataKey="LivNexใหม่" name="ขายใหม่" stackId="alivnex" fill="#f97316" barSize={22}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, height, index } = props;
                    if (x == null || y == null || width == null || index == null) return null;
                    const d = salesData[index];
                    if (!d.LivNex) return null;
                    const pct = d.เป้าLivNex > 0 ? Math.round((d.LivNex / d.เป้าLivNex) * 100) : 0;
                    return (
                      <g>
                        {d.LivNexใหม่ > 0 && (
                          <text x={x + width / 2} y={y + (height || 0) / 2 + 3} textAnchor="middle" style={{ fontSize: 8, fontWeight: 700, fill: '#fff' }}>
                            {d.LivNexใหม่}
                          </text>
                        )}
                        <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700 }}>
                          <tspan fill="#ea580c">{d.LivNex}</tspan>
                          <tspan fill={pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626'}>({pct}%)</tspan>
                        </text>
                      </g>
                    );
                  }) as any}
                />
              </Bar>
              {showLivNexCum && (
                <Line yAxisId="right" type="monotone" dataKey="LivNexสะสม" stroke="#c2410c" strokeWidth={2} dot={{ r: 3, fill: '#c2410c' }}>
                  <LabelList
                    content={((props: any) => {
                      const { x, y, value } = props;
                      if (x == null || y == null || !value) return null;
                      return (
                        <text x={x} y={y - 8} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: '#c2410c' }}>
                          {value}
                        </text>
                      );
                    }) as any}
                  />
                </Line>
              )}
            </ComposedChart>
          </ResponsiveContainer>
          <label className="flex items-center gap-1.5 mt-1 ml-1 cursor-pointer select-none">
            <input type="checkbox" checked={showLivNexCum} onChange={() => setShowLivNexCum(v => !v)} className="w-3.5 h-3.5 rounded accent-orange-600" />
            <span className="text-[10px] text-slate-500">แสดงสะสม</span>
          </label>
        </div>
      </div>

      {/* ════════ ยกเลิก & PreLivNex แยกกราฟ ════════ */}
      <div className="grid grid-cols-2 gap-4">
        {/* กราฟ ยกเลิก */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-900 text-sm">ยอดยกเลิกรายเดือน</h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-slate-500">ยกเลิกทั้งปี <span className="font-bold text-red-500">{isVal ? r(totalCancel * AVG_CANCEL_VALUE) : totalCancel}</span> {valUnit}</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mb-1 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#dc2626' }} /> ยกเลิก</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f97316' }} /> ซื้อLivNex</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#06b6d4' }} /> ซื้อPreLivNex</span>
            {showCancelCum && (
              <span className="flex items-center gap-1"><span className="w-6 border-t-2" style={{ borderColor: '#991b1b' }} /> ยกเลิกสะสม</span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={cancelData} barCategoryGap="15%" barGap={2} margin={{ left: -5, right: 5, top: 25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} domain={[0, niceYMax]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} domain={[0, niceYMax]} hide={!showCancelCum} label={{ value: 'สะสม', angle: 90, position: 'insideRight', style: { fontSize: 9, fill: '#94a3b8' } }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar yAxisId="left" dataKey="ยกเลิก" stackId="cancel" fill="#dc2626" barSize={22}>
                <LabelList dataKey="ยกเลิก" position="top" style={{ fontSize: 9, fontWeight: 700, fill: '#b91c1c' }} formatter={((v: any) => Number(v) > 0 ? v : '') as any} />
              </Bar>
              <Bar yAxisId="left" dataKey="ซื้อLivNex" name="ซื้อ LivNex" stackId="rebuy" fill="#f97316" barSize={22}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, height, value } = props;
                    if (x == null || y == null || !value) return null;
                    return (
                      <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" style={{ fontSize: 8, fontWeight: 600, fill: '#fff' }}>
                        {value}
                      </text>
                    );
                  }) as any}
                />
              </Bar>
              <Bar yAxisId="left" dataKey="ซื้อPreLivNex" name="ซื้อ PreLivNex" stackId="rebuy" fill="#06b6d4" barSize={22}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, index } = props;
                    if (x == null || y == null || width == null || index == null) return null;
                    const d = cancelData[index];
                    const total = d.ซื้อLivNex + d.ซื้อPreLivNex;
                    if (!total) return null;
                    return (
                      <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: '#334155' }}>
                        {total}
                      </text>
                    );
                  }) as any}
                />
              </Bar>
              {showCancelCum && (
                <Line yAxisId="right" type="monotone" dataKey="ยกเลิกสะสม" stroke="#991b1b" strokeWidth={2} dot={{ r: 3, fill: '#991b1b' }}>
                  <LabelList
                    content={((props: any) => {
                      const { x, y, value } = props;
                      if (x == null || y == null || !value) return null;
                      return (
                        <text x={x} y={y - 8} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: '#991b1b' }}>
                          {value}
                        </text>
                      );
                    }) as any}
                  />
                </Line>
              )}
            </ComposedChart>
          </ResponsiveContainer>
          <label className="flex items-center gap-1.5 mt-1 ml-1 cursor-pointer select-none">
            <input type="checkbox" checked={showCancelCum} onChange={() => setShowCancelCum(v => !v)} className="w-3.5 h-3.5 rounded accent-red-600" />
            <span className="text-[10px] text-slate-500">แสดงสะสม</span>
          </label>
        </div>

        {/* กราฟ PreLivNex เป้า vs Actual */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-900 text-sm">ยอดจอง — Pre-LivNex</h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-slate-500">เป้า <span className="font-bold text-cyan-400">{mv(salesTotalTargetPreLivNex)}</span> Actual <span className="font-bold text-cyan-500">{mv(salesTotalPreLivNex)}</span></span>
              <span className="text-slate-400">{valUnit}</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mb-1 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#a5f3fc' }} /> เป้า</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#06b6d4' }} /> มาจาก LivNex</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#0e7490' }} /> จากยกเลิก</span>
            {showPreLivNexCum && (
              <span className="flex items-center gap-1"><span className="w-6 border-t-2" style={{ borderColor: '#0e7490' }} /> สะสม</span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={salesData} barCategoryGap="15%" barGap={2} margin={{ left: -5, right: 5, top: 25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} domain={[0, niceYMax]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} domain={[0, niceYMax]} hide={!showPreLivNexCum} label={{ value: 'สะสม', angle: 90, position: 'insideRight', style: { fontSize: 9, fill: '#0e7490' } }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={((value: any, name: any) => [`${value} ${valUnit}`, name]) as any} />
              <Bar yAxisId="left" dataKey="เป้าPreLivNex" name="เป้าPreLivNex" stackId="tprelivnex" fill="#a5f3fc" barSize={22}>
                <LabelList dataKey="เป้าPreLivNex" position="top" style={{ fontSize: 8, fontWeight: 700, fill: '#0e7490' }} formatter={((v: any) => Number(v) > 0 ? v : '') as any} />
              </Bar>
              <Bar yAxisId="left" dataKey="PreLivNexจากยกเลิก" name="จากยกเลิก" stackId="aprelivnex" fill="#0e7490" barSize={22}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, height, index } = props;
                    if (x == null || y == null || width == null || index == null) return null;
                    const d = salesData[index];
                    if (!d.PreLivNexจากยกเลิก) return null;
                    return (
                      <text x={x + width / 2} y={y + (height || 0) / 2 + 3} textAnchor="middle" style={{ fontSize: 8, fontWeight: 600, fill: '#fff' }}>
                        {d.PreLivNexจากยกเลิก}
                      </text>
                    );
                  }) as any}
                />
              </Bar>
              <Bar yAxisId="left" dataKey="PreLivNexใหม่" name="มาจาก LivNex" stackId="aprelivnex" fill="#06b6d4" barSize={22}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, height, index } = props;
                    if (x == null || y == null || width == null || index == null) return null;
                    const d = salesData[index];
                    if (!d.PreLivNex) return null;
                    const pct = d.เป้าPreLivNex > 0 ? Math.round((d.PreLivNex / d.เป้าPreLivNex) * 100) : 0;
                    return (
                      <g>
                        {d.PreLivNexใหม่ > 0 && (
                          <text x={x + width / 2} y={y + (height || 0) / 2 + 3} textAnchor="middle" style={{ fontSize: 8, fontWeight: 700, fill: '#fff' }}>
                            {d.PreLivNexใหม่}
                          </text>
                        )}
                        <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700 }}>
                          <tspan fill="#0891b2">{d.PreLivNex}</tspan>
                          <tspan fill={pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626'}>({pct}%)</tspan>
                        </text>
                      </g>
                    );
                  }) as any}
                />
              </Bar>
              {showPreLivNexCum && (
                <Line yAxisId="right" type="monotone" dataKey="PreLivNexสะสม" stroke="#0e7490" strokeWidth={2} dot={{ r: 3, fill: '#0e7490' }}>
                  <LabelList
                    content={((props: any) => {
                      const { x, y, value } = props;
                      if (x == null || y == null || !value) return null;
                      return (
                        <text x={x} y={y - 8} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: '#0e7490' }}>
                          {value}
                        </text>
                      );
                    }) as any}
                  />
                </Line>
              )}
            </ComposedChart>
          </ResponsiveContainer>
          <label className="flex items-center gap-1.5 mt-1 ml-1 cursor-pointer select-none">
            <input type="checkbox" checked={showPreLivNexCum} onChange={() => setShowPreLivNexCum(v => !v)} className="w-3.5 h-3.5 rounded accent-cyan-600" />
            <span className="text-[10px] text-slate-500">แสดงสะสม</span>
          </label>
        </div>
      </div>

      {/* ════════ ภาพรวมยอดโอนรายเดือน ════════ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-semibold text-slate-900">ภาพรวมยอดโอนรายเดือน เปรียบเทียบแผน</h2>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="text-slate-500">MTOP ทั้งปี <span className="font-bold text-slate-700">{isVal ? totalTarget.toFixed(2) : totalTarget}</span> {valUnit}</span>
            <span className="text-slate-500">แผนรวม <span className="font-bold text-indigo-600">{isVal ? totalPlan.toFixed(2) : totalPlan}</span> {valUnit}</span>
            <span className="text-slate-500">โอนจริง <span className="font-bold text-emerald-600">{isVal ? totalActual.toFixed(2) : totalActual}</span> {valUnit}</span>
            <span className="text-slate-500">LivNex-Transfer <span className="font-bold text-orange-500">{isVal ? totalLivNex.toFixed(2) : totalLivNex}</span> {valUnit}</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 mb-1 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#d1d5db' }} /> MTOP</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#93c5fd' }} /> แผนโอน</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#bfdbfe' }} /> Upside</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f97316' }} /> LivNex-Transfer</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1e3a8a' }} /> ขายในเดือน</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} /> จาก Backlog</span>
          {showTransferCum && (
            <span className="flex items-center gap-1"><span className="w-6 border-t-2" style={{ borderColor: '#1d4ed8' }} /> โอนสะสม</span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartDataWithCum} barCategoryGap="8%" barGap={1} margin={{ left: 0, right: 10, top: 25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, niceYMax]} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, niceYMax]} hide={!showTransferCum} label={{ value: 'สะสม', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#94a3b8' } }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={((value: any, name: any) => [`${value} ${valUnit}`, name]) as any} />
            <Bar yAxisId="left" dataKey="MTOP" stackId="target" fill="#d1d5db" barSize={32}>
              <LabelList dataKey="MTOP" position="top" style={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
            </Bar>
            <Bar yAxisId="left" dataKey="แผนโอน" stackId="plan" fill="#93c5fd" barSize={32} />
            <Bar yAxisId="left" dataKey="Upside" stackId="plan" fill="#bfdbfe" barSize={32}>
              <LabelList
                content={((props: any) => {
                  const { x, y, width, index } = props;
                  if (x == null || y == null || width == null || index == null) return null;
                  const d = chartDataWithCum[index];
                  return (
                    <text x={x + width / 2} y={y - 5} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: '#2563eb' }}>
                      {r(d.แผนโอน + d.Upside)}
                    </text>
                  );
                }) as any}
              />
            </Bar>
            <Bar yAxisId="left" dataKey="โอนจากขายในเดือน" stackId="actual" fill="#1e3a8a" barSize={32}>
              <LabelList
                content={((props: any) => {
                  const { x, y, width, height, value } = props;
                  if (x == null || y == null || !value) return null;
                  return (
                    <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" style={{ fontSize: 8, fontWeight: 600, fill: '#fff' }}>
                      {value}
                    </text>
                  );
                }) as any}
              />
            </Bar>
            <Bar yAxisId="left" dataKey="โอนจากBacklog" stackId="actual" fill="#3b82f6" barSize={32}>
              <LabelList
                content={((props: any) => {
                  const { x, y, width, height, value } = props;
                  if (x == null || y == null || !value) return null;
                  return (
                    <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" style={{ fontSize: 8, fontWeight: 600, fill: '#fff' }}>
                      {value}
                    </text>
                  );
                }) as any}
              />
            </Bar>
            <Bar yAxisId="left" dataKey="LivNex" name="LivNex-Transfer" stackId="actual" fill="#f97316" barSize={32}>
              <LabelList
                content={((props: any) => {
                  const { x, y, width, height, index } = props;
                  if (x == null || y == null || width == null || index == null) return null;
                  const d = chartDataWithCum[index];
                  if (!d.โอนจริง && !d.LivNex) return null;
                  const total = d.โอนจริง + d.LivNex;
                  return (
                    <g>
                      {d.LivNex > 0 && (
                        <text x={x + width / 2} y={y + (height || 0) / 2 + 3} textAnchor="middle" style={{ fontSize: 8, fontWeight: 600, fill: '#fff' }}>
                          {d.LivNex}
                        </text>
                      )}
                      <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: '#1e3a8a' }}>
                        {total}
                      </text>
                    </g>
                  );
                }) as any}
              />
            </Bar>
            {showTransferCum && (
              <Line yAxisId="right" type="monotone" dataKey="โอนสะสม" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 3, fill: '#1d4ed8' }}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, value, index } = props;
                    if (x == null || y == null || value == null || value === 0) return null;
                    const prevCum = index > 0 ? (chartDataWithCum[index - 1]?.โอนสะสม || 0) : 0;
                    const hasPrev = index > 0 && prevCum > 0;
                    const pctChg = hasPrev ? Math.round(((value - prevCum) / prevCum) * 100) : 0;
                    return (
                      <text x={x} y={y - 8} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700 }}>
                        <tspan fill="#1d4ed8">{value}</tspan>
                        {hasPrev && <tspan fill="#16a34a"> (+{pctChg}%)</tspan>}
                      </text>
                    );
                  }) as any}
                />
              </Line>
            )}
          </ComposedChart>
        </ResponsiveContainer>
        <label className="flex items-center gap-1.5 mt-1 ml-1 cursor-pointer select-none">
          <input type="checkbox" checked={showTransferCum} onChange={() => setShowTransferCum(v => !v)} className="w-3.5 h-3.5 rounded accent-blue-600" />
          <span className="text-[10px] text-slate-500">แสดงสะสม</span>
        </label>
      </div>

    </>
  );
}
