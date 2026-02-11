'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Booking, formatMoney } from '@/data/bookings';

interface PerformanceChartsProps {
  bookings: Booking[];
}

// Simulated monthly data - realistic: ~9000 yearly booking, ~5000 yearly transfer
const SIMULATED_DATA = [
  { month: 'Jan', target: 700, booking: 682, livnex: 28, preLivnex: 18, contract: 620, cancel: 85, transfer: 380 },
  { month: 'Feb', target: 750, booking: 798, livnex: 35, preLivnex: 22, contract: 710, cancel: 92, transfer: 425 },
  { month: 'Mar', target: 850, booking: 892, livnex: 42, preLivnex: 28, contract: 780, cancel: 105, transfer: 485 },
  { month: 'Apr', target: 700, booking: 658, livnex: 25, preLivnex: 16, contract: 590, cancel: 78, transfer: 365 },
  { month: 'May', target: 750, booking: 771, livnex: 32, preLivnex: 21, contract: 680, cancel: 88, transfer: 410 },
  { month: 'Jun', target: 800, booking: 835, livnex: 38, preLivnex: 25, contract: 740, cancel: 95, transfer: 455 },
  { month: 'Jul', target: 750, booking: 745, livnex: 30, preLivnex: 19, contract: 660, cancel: 82, transfer: 395 },
  { month: 'Aug', target: 750, booking: 762, livnex: 33, preLivnex: 22, contract: 685, cancel: 86, transfer: 420 },
  { month: 'Sep', target: 800, booking: 812, livnex: 36, preLivnex: 24, contract: 720, cancel: 90, transfer: 445 },
  { month: 'Oct', target: 800, booking: 825, livnex: 38, preLivnex: 26, contract: 735, cancel: 94, transfer: 460 },
  { month: 'Nov', target: 800, booking: 788, livnex: 34, preLivnex: 23, contract: 700, cancel: 88, transfer: 435 },
  { month: 'Dec', target: 650, booking: 632, livnex: 24, preLivnex: 15, contract: 560, cancel: 72, transfer: 350 },
];

// Format value for axis - using centralized formatMoney from bookings.ts
const formatValue = (value: number): string => formatMoney(value);

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-slate-200 rounded shadow-lg text-xs">
        <p className="font-semibold text-slate-900 mb-1">{label}</p>
        {payload.map((item: any, idx: number) => (
          <p key={idx} style={{ color: item.color }}>
            {item.name}: {item.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PerformanceCharts({ bookings }: PerformanceChartsProps) {
  // Calculate cumulative values
  const chartData = useMemo(() => {
    let cumulativeContract = 0;
    let cumulativeCancel = 0;
    let cumulativeTransfer = 0;
    let cumulativeLivnex = 0;

    return SIMULATED_DATA.map(d => {
      cumulativeContract += d.contract;
      cumulativeCancel += d.cancel;
      cumulativeTransfer += d.transfer;
      cumulativeLivnex += d.livnex;

      return {
        ...d,
        cumulativeContract,
        cumulativeCancel,
        cumulativeTransfer,
        cumulativeLivnex,
      };
    });
  }, []);


  return (
    <div className="space-y-4">
      {/* Booking Performance */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-slate-900 text-sm">Booking Performance</h3>
          <p className="text-[10px] text-slate-500">เปรียบเทียบ Target vs Booking รายเดือน</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} align="right" verticalAlign="top" />
            <Bar dataKey="target" name="Target" fill="#d1d5db" radius={[2, 2, 0, 0]}>
              <LabelList dataKey="target" position="top" fontSize={9} fill="#94a3b8" formatter={(v) => typeof v === 'number' ? `${v.toLocaleString()} units` : ''} />
            </Bar>
            <Bar dataKey="booking" name="Booking" fill="#818cf8" radius={[2, 2, 0, 0]}>
              <LabelList dataKey="booking" position="top" fontSize={9} fill="#6366f1" formatter={(v) => typeof v === 'number' ? `${v.toLocaleString()} units` : ''} />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Transfer Performance */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-slate-900 text-sm">Transfer Performance</h3>
          <p className="text-[10px] text-slate-500">แท่ง = รายเดือน, เส้น = โอนสะสม</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={formatValue} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} align="right" verticalAlign="top" />
            <Bar yAxisId="left" dataKey="target" name="Target" fill="#d1d5db" radius={[2, 2, 0, 0]}>
              <LabelList dataKey="target" position="top" fontSize={9} fill="#94a3b8" formatter={(v) => typeof v === 'number' ? `${v.toLocaleString()} units` : ''} />
            </Bar>
            <Bar yAxisId="left" dataKey="transfer" name="โอน" fill="#3b82f6" radius={[2, 2, 0, 0]}>
              <LabelList dataKey="transfer" position="top" fontSize={9} fill="#2563eb" formatter={(v) => typeof v === 'number' ? `${v.toLocaleString()} units` : ''} />
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="cumulativeTransfer" name="โอนสะสม" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 3 }}>
              <LabelList dataKey="cumulativeTransfer" position="top" fontSize={9} fill="#1d4ed8" formatter={(v) => typeof v === 'number' ? `${v.toLocaleString()} units` : ''} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
