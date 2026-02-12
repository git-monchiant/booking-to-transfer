'use client';

import { useState } from 'react';
import {
  BarChart,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

export function TransferCharts() {
  const [selectedBud, setSelectedBud] = useState<string | null>('Condo 1');
  const [budDisplayMode, setBudDisplayMode] = useState<'unit' | 'value'>('unit');

  // ปัดแกน Y ให้เป็นเลขสวย + เพิ่มอีก 1 ขั้น
  const niceYMax = (dataMax: number) => {
    const step = [5, 10, 15, 20, 25, 50, 100, 200, 500].find(s => dataMax / s <= 4) || Math.ceil(dataMax / 4);
    return (Math.ceil(dataMax / step) + 1) * step;
  };

  // มูลค่าเฉลี่ยต่อ unit รวมทั้งโครงการ (ล้านบาท)
  const avgUnitValue = 4.8;
  const isVal = budDisplayMode === 'value';
  const mv = (v: number) => isVal ? +(v * avgUnitValue).toFixed(1) : v;
  const valUnit = isVal ? 'ล้าน฿' : 'ราย';

  const chartDataRaw = [
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
  const chartData = chartDataRaw.map(d => ({
    month: d.month, MTOP: mv(d.MTOP), แผนโอน: mv(d.แผนโอน), Upside: mv(d.Upside), โอนจริง: mv(d.โอนจริง), LivNex: mv(d.LivNex), PreLivNex: mv(d.PreLivNex),
  }));

  // คำนวณโอนสะสม
  let cumActual = 0;
  const chartDataWithCum = chartData.map(d => {
    cumActual += d.โอนจริง;
    return { ...d, โอนสะสม: +(cumActual.toFixed(1)) };
  });

  const totalTarget = +chartData.reduce((s, d) => s + d.MTOP, 0).toFixed(1);
  const totalPlan = +chartData.reduce((s, d) => s + d.แผนโอน + d.Upside, 0).toFixed(1);
  const totalActual = +chartData.reduce((s, d) => s + d.โอนจริง, 0).toFixed(1);
  const totalLivNex = +chartData.reduce((s, d) => s + d.LivNex, 0).toFixed(1);
  const totalPreLivNex = +chartData.reduce((s, d) => s + d.PreLivNex, 0).toFixed(1);

  // ═══ BUD Data ═══
  const budNames = ['Condo 1', 'Condo 2', 'Condo 3', 'Condo 4', 'Housing 1', 'Housing 2'];
  const budColors: Record<string, string> = {
    'Condo 1': '#6366f1', 'Condo 2': '#818cf8', 'Condo 3': '#a5b4fc', 'Condo 4': '#c7d2fe',
    'Housing 1': '#10b981', 'Housing 2': '#6ee7b7',
  };
  const budActual: Record<string, number[]> = {
    'Condo 1':   [14, 16, 25, 10, 13, 22, 16, 15, 0, 0, 0, 0],
    'Condo 2':   [9,  11, 17, 8,  9,  14, 11, 10, 0, 0, 0, 0],
    'Condo 3':   [7,  8,  11, 5,  6,  10, 7,  7,  0, 0, 0, 0],
    'Condo 4':   [3,  4,  5,  2,  3,  4,  3,  3,  0, 0, 0, 0],
    'Housing 1': [13, 15, 22, 12, 14, 20, 16, 15, 0, 0, 0, 0],
    'Housing 2': [6,  7,  10, 4,  5,  8,  6,  5,  0, 0, 0, 0],
  };
  const budPlan: Record<string, number[]> = {
    'Condo 1':   [13, 15, 24, 11, 14, 23, 17, 16, 18, 18, 18, 14],
    'Condo 2':   [10, 13, 20, 10, 12, 18, 14, 13, 16, 16, 16, 11],
    'Condo 3':   [10, 12, 18, 9,  11, 16, 13, 12, 14, 14, 14, 9],
    'Condo 4':   [8,  10, 16, 8,  10, 14, 11, 10, 12, 12, 12, 9],
    'Housing 1': [14, 17, 24, 13, 15, 21, 17, 17, 19, 19, 19, 14],
    'Housing 2': [12, 14, 22, 12, 14, 18, 16, 16, 16, 16, 16, 12],
  };
  const budUpside: Record<string, number[]> = {
    'Condo 1':   [2, 3, 4, 1, 1, 2, 1, 2, 2, 2, 2, 1],
    'Condo 2':   [2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    'Condo 3':   [2, 2, 2, 1, 1, 2, 1, 2, 2, 2, 2, 1],
    'Condo 4':   [2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    'Housing 1': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    'Housing 2': [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  };
  const budBacklog: Record<string, number[]> = {
    'Condo 1':   [120, 118, 108, 112, 114, 105, 102, 100, 110, 120, 130, 135],
    'Condo 2':   [85, 82, 74, 78, 80, 74, 72, 70, 78, 86, 94, 98],
    'Condo 3':   [60, 58, 52, 55, 56, 52, 50, 48, 54, 60, 66, 70],
    'Condo 4':   [40, 38, 36, 38, 39, 38, 37, 36, 40, 44, 48, 50],
    'Housing 1': [95, 90, 78, 80, 80, 72, 68, 65, 74, 82, 90, 95],
    'Housing 2': [55, 52, 48, 50, 51, 48, 46, 45, 50, 56, 62, 66],
  };
  const budLivNex: Record<string, number[]> = {
    'Condo 1':   [3, 4, 6, 2, 3, 5, 4, 3, 0, 0, 0, 0],
    'Condo 2':   [2, 3, 4, 2, 2, 3, 3, 2, 0, 0, 0, 0],
    'Condo 3':   [2, 2, 3, 1, 1, 2, 2, 2, 0, 0, 0, 0],
    'Condo 4':   [1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    'Housing 1': [3, 4, 5, 3, 3, 5, 4, 4, 0, 0, 0, 0],
    'Housing 2': [1, 2, 2, 1, 1, 2, 1, 1, 0, 0, 0, 0],
  };
  const budPreLivNex: Record<string, number[]> = {
    'Condo 1':   [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    'Condo 2':   [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    'Condo 3':   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'Condo 4':   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'Housing 1': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'Housing 2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  const budTargetData: Record<string, number[]> = {
    'Condo 1':   [15, 18, 28, 12, 15, 25, 18, 18, 20, 20, 20, 15],
    'Condo 2':   [12, 15, 22, 12, 14, 20, 15, 15, 18, 18, 18, 12],
    'Condo 3':   [12, 14, 20, 10, 12, 18, 14, 14, 16, 16, 16, 10],
    'Condo 4':   [10, 12, 18, 10, 12, 16, 12, 12, 14, 14, 14, 10],
    'Housing 1': [15, 18, 25, 14, 16, 22, 18, 18, 20, 20, 20, 15],
    'Housing 2': [14, 16, 24, 14, 16, 20, 18, 18, 18, 18, 18, 14],
  };
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  // มูลค่าเฉลี่ยต่อ unit (ล้านบาท) per BUD
  const budAvgValue: Record<string, number> = {
    'Condo 1': 3.2, 'Condo 2': 2.8, 'Condo 3': 4.5, 'Condo 4': 5.1,
    'Housing 1': 6.8, 'Housing 2': 8.5,
  };
  const isValue = budDisplayMode === 'value';
  const toVal = (units: number, bud: string) => isValue ? +(units * budAvgValue[bud]).toFixed(1) : units;
  const unitLabel = isValue ? 'ล้าน฿' : 'ราย';

  // ยอดสะสมรวมต่อ BUD
  const budTotals = budNames.map(b => ({
    name: b,
    total: toVal(budActual[b].reduce((s, v) => s + v, 0), b),
    target: toVal(budTargetData[b].reduce((s, v) => s + v, 0), b),
    livnex: toVal(budLivNex[b].reduce((s, v) => s + v, 0), b),
    prelivnex: toVal(budPreLivNex[b].reduce((s, v) => s + v, 0), b),
    color: budColors[b],
  }));
  const grandTotal = budTotals.reduce((s, d) => s + d.total, 0);
  const grandTarget = budTotals.reduce((s, d) => s + d.target, 0);

  // Drill-down data for selected BUD
  const drillData = selectedBud ? months.map((m, i) => ({
    month: m,
    MTOP: toVal(budTargetData[selectedBud][i], selectedBud),
    แผนโอน: toVal(budPlan[selectedBud][i], selectedBud),
    Upside: toVal(budUpside[selectedBud][i], selectedBud),
    actual: toVal(budActual[selectedBud][i], selectedBud),
    LivNex: toVal(budLivNex[selectedBud][i], selectedBud),
    PreLivNex: toVal(budPreLivNex[selectedBud][i], selectedBud),
    Backlog: budBacklog[selectedBud][i],
  })) : [];
  const drillTotal = selectedBud ? toVal(budActual[selectedBud].reduce((s, v) => s + v, 0), selectedBud) : 0;
  const drillTarget = selectedBud ? toVal(budTargetData[selectedBud].reduce((s, v) => s + v, 0), selectedBud) : 0;

  return (
    <>
      {/* ════════ ภาพรวมยอดโอนรายเดือน ════════ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-semibold text-slate-900">ภาพรวมยอดโอนรายเดือน เปรียบเทียบแผน</h2>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="text-slate-500">MTOP ทั้งปี <span className="font-bold text-slate-700">{isVal ? totalTarget.toFixed(1) : totalTarget}</span> {valUnit}</span>
            <span className="text-slate-500">แผนรวม <span className="font-bold text-indigo-600">{isVal ? totalPlan.toFixed(1) : totalPlan}</span> {valUnit}</span>
            <span className="text-slate-500">โอนจริง <span className="font-bold text-emerald-600">{isVal ? totalActual.toFixed(1) : totalActual}</span> {valUnit}</span>
            <span className="text-slate-500">LivNex <span className="font-bold text-orange-500">{isVal ? totalLivNex.toFixed(1) : totalLivNex}</span> {valUnit}</span>
            <span className="text-slate-500">Pre-LivNex <span className="font-bold text-indigo-500">{isVal ? totalPreLivNex.toFixed(1) : totalPreLivNex}</span> {valUnit}</span>
            <select value={budDisplayMode} onChange={e => setBudDisplayMode(e.target.value as 'unit' | 'value')}
              className="text-[10px] border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300">
              <option value="unit">จำนวน (Unit)</option>
              <option value="value">มูลค่า (ล้าน฿)</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 mb-1 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#d1d5db' }} /> MTOP</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#93c5fd' }} /> แผนโอน</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#bfdbfe' }} /> Upside</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} /> โอนจริง</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#6366f1' }} /> Pre-LivNex</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f97316' }} /> LivNex</span>
          <span className="flex items-center gap-1"><span className="w-6 border-t-2" style={{ borderColor: '#1d4ed8' }} /> โอนสะสม</span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartDataWithCum} margin={{ left: 0, right: 10, top: 25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, niceYMax]} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, niceYMax]} label={{ value: 'สะสม', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#94a3b8' } }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={((value: any, name: any) => [`${value} ${valUnit}`, name]) as any} />
            <Bar yAxisId="left" dataKey="MTOP" stackId="target" fill="#d1d5db" barSize={24}>
              <LabelList dataKey="MTOP" position="top" style={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
            </Bar>
            <Bar yAxisId="left" dataKey="แผนโอน" stackId="plan" fill="#93c5fd" barSize={24} />
            <Bar yAxisId="left" dataKey="Upside" stackId="plan" fill="#bfdbfe" barSize={24}>
              <LabelList
                content={((props: any) => {
                  const { x, y, width, index } = props;
                  if (x == null || y == null || width == null || index == null) return null;
                  const d = chartDataWithCum[index];
                  return (
                    <text x={x + width / 2} y={y - 5} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: '#2563eb' }}>
                      {d.แผนโอน + d.Upside}
                    </text>
                  );
                }) as any}
              />
            </Bar>
            <Bar yAxisId="left" dataKey="โอนจริง" stackId="actual" fill="#3b82f6" barSize={24}>
              <LabelList
                content={((props: any) => {
                  const { x, y, width, index } = props;
                  if (x == null || y == null || width == null || index == null) return null;
                  const d = chartDataWithCum[index];
                  if (!d.โอนจริง) return null;
                  const pct = d.MTOP > 0 ? Math.round((d.โอนจริง / d.MTOP) * 100) : 0;
                  return (
                    <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700 }}>
                      <tspan fill="#2563eb">{d.โอนจริง}</tspan>
                      <tspan fill={pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626'}>({pct}%)</tspan>
                    </text>
                  );
                }) as any}
              />
            </Bar>
            <Bar yAxisId="left" dataKey="LivNex" stackId="livnex" fill="#f97316" barSize={24} />
            <Bar yAxisId="left" dataKey="PreLivNex" stackId="livnex" fill="#6366f1" barSize={24}>
              <LabelList
                content={((props: any) => {
                  const { x, y, width, index } = props;
                  if (x == null || y == null || width == null || index == null) return null;
                  const d = chartDataWithCum[index];
                  const total = d.LivNex + d.PreLivNex;
                  if (!total) return null;
                  return (
                    <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: '#ea580c' }}>
                      {total}
                    </text>
                  );
                }) as any}
              />
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="โอนสะสม" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 3, fill: '#1d4ed8' }}>
              <LabelList
                content={((props: any) => {
                  const { x, y, value } = props;
                  if (x == null || y == null || value == null || value === 0) return null;
                  const pct = Math.round((value / totalTarget) * 100);
                  return (
                    <text x={x} y={y - 8} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700 }}>
                      <tspan fill="#1d4ed8">{value}</tspan>
                      <tspan fill="#16a34a">({pct}%)</tspan>
                    </text>
                  );
                }) as any}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ════════ โอนสะสม แยก BUD ════════ */}
      <div className="grid grid-cols-10 gap-4">
        {/* Left: BUD Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 col-span-3">
          <div className="mb-2">
            <h2 className="text-sm font-semibold text-slate-900">โอนสะสม แยก BUD</h2>
            <p className="text-[9px] text-slate-400 mt-0.5">รวม {isValue ? grandTotal.toFixed(1) : grandTotal}/{isValue ? grandTarget.toFixed(1) : grandTarget} {unitLabel} · คลิกเลือก BUD</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={budTotals} margin={{ left: -10, right: 5, top: 15, bottom: 0 }} style={{ cursor: 'pointer' }}
              onClick={(e: any) => { if (e?.activeLabel) setSelectedBud(e.activeLabel); }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 600 }} interval={0} angle={-30} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 8 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="target" name="MTOP" fill="#e2e8f0" barSize={16} />
              <Bar dataKey="total" name="โอนจริง" barSize={16}>
                {budTotals.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke={selectedBud === d.name ? '#1e293b' : 'none'} strokeWidth={selectedBud === d.name ? 2 : 0} />
                ))}
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, index } = props;
                    if (x == null || y == null || width == null || index == null) return null;
                    const d = budTotals[index];
                    const pct = d.target > 0 ? Math.round((d.total / d.target) * 100) : 0;
                    return (
                      <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 8, fontWeight: 700 }}>
                        <tspan fill="#334155">{d.total}</tspan>
                        <tspan fill={pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626'}>({pct}%)</tspan>
                      </text>
                    );
                  }) as any}
                />
              </Bar>
              <Bar dataKey="livnex" name="LivNex" stackId="livnex" fill="#f97316" barSize={16} />
              <Bar dataKey="prelivnex" name="Pre-LivNex" stackId="livnex" fill="#6366f1" barSize={16}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, index } = props;
                    if (x == null || y == null || width == null || index == null) return null;
                    const d = budTotals[index];
                    const total = d.livnex + d.prelivnex;
                    if (!total) return null;
                    return (
                      <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 7, fontWeight: 700, fill: '#ea580c' }}>
                        {total}
                      </text>
                    );
                  }) as any}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Monthly Drill-down */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 col-span-7">
          <div className="mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              ยอดโอนรายเดือน — <span style={{ color: budColors[selectedBud!] }}>{selectedBud}</span>
            </h2>
            <p className="text-[9px] text-slate-400 mt-0.5">
              รวม {isValue ? drillTotal.toFixed(1) : drillTotal}/{isValue ? drillTarget.toFixed(1) : drillTarget} {unitLabel} ({drillTarget > 0 ? Math.round((drillTotal / drillTarget) * 100) : 0}%)
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={drillData} margin={{ left: -10, right: 10, top: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 600 }} interval={0} />
              <YAxis yAxisId="left" tick={{ fontSize: 9 }} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} allowDecimals={false} label={{ value: 'Backlog', angle: 90, position: 'insideRight', style: { fontSize: 9, fill: '#d97706' } }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              <Bar yAxisId="left" dataKey="MTOP" stackId="target" fill="#e2e8f0" barSize={20}>
                <LabelList dataKey="MTOP" position="top" style={{ fontSize: 7, fill: '#94a3b8', fontWeight: 600 }} formatter={((v: any) => Number(v) > 0 ? v : '') as any} />
              </Bar>
              <Bar yAxisId="left" dataKey="แผนโอน" stackId="plan" fill="#93c5fd" barSize={20} />
              <Bar yAxisId="left" dataKey="Upside" stackId="plan" fill="#bfdbfe" barSize={20}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, index } = props;
                    if (x == null || y == null || width == null || index == null) return null;
                    const d = drillData[index];
                    return (
                      <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 7, fontWeight: 700, fill: '#2563eb' }}>
                        {d.แผนโอน + d.Upside}
                      </text>
                    );
                  }) as any}
                />
              </Bar>
              <Bar yAxisId="left" dataKey="actual" stackId="actual" name="โอนจริง" fill={budColors[selectedBud!]} barSize={16}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, index } = props;
                    if (x == null || y == null || width == null || index == null) return null;
                    const d = drillData[index];
                    if (!d.actual) return null;
                    const pct = d.MTOP > 0 ? Math.round((d.actual / d.MTOP) * 100) : 0;
                    return (
                      <text x={x + width / 2} y={y - 3} textAnchor="middle" style={{ fontSize: 7, fontWeight: 700 }}>
                        <tspan fill="#334155">{d.actual}</tspan>
                        <tspan fill={pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626'}>({pct}%)</tspan>
                      </text>
                    );
                  }) as any}
                />
              </Bar>
              <Bar yAxisId="left" dataKey="LivNex" stackId="livnex" name="LivNex" fill="#f97316" barSize={16} />
              <Bar yAxisId="left" dataKey="PreLivNex" stackId="livnex" name="Pre-LivNex" fill="#6366f1" barSize={16}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, width, index } = props;
                    if (x == null || y == null || width == null || index == null) return null;
                    const d = drillData[index];
                    const total = d.LivNex + d.PreLivNex;
                    if (!total) return null;
                    return (
                      <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 7, fontWeight: 700, fill: '#ea580c' }}>
                        {total}
                      </text>
                    );
                  }) as any}
                />
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="Backlog" name="Backlog (รอโอน)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: '#f59e0b' }}>
                <LabelList
                  content={((props: any) => {
                    const { x, y, value } = props;
                    if (x == null || y == null || !value) return null;
                    return (
                      <text x={x} y={y - 8} textAnchor="middle" style={{ fontSize: 8, fontWeight: 700, fill: '#d97706' }}>
                        {value}
                      </text>
                    );
                  }) as any}
                />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
