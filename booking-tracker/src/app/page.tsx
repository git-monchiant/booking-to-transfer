'use client';

import { useState, useMemo } from 'react';
import {
  bookings,
  getSummary,
  getBookingsByStage,
  getBookingsByTeam,
  getBlockedBookings,
  formatMoney,
  STAGES,
  STAGE_CONFIG,
  TEAMS,
  TEAM_CONFIG,
  Booking,
  Stage,
  Team,
  OPM_LIST,
  BUD_LIST,
} from '@/data/bookings';
import { Sidebar, View } from '@/components/Sidebar';
import { MultiSelect } from '@/components/MultiSelect';
import { PerformanceCharts } from '@/components/PerformanceCharts';
import { BookingDetailPanel } from '@/components/BookingDetailPanel';
import { BookingListItem } from '@/components/BookingListItem';
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
  Treemap,
} from 'recharts';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Banknote,
  ChevronRight,
  Search,
  X,
  Phone,
  User,
  FileText,
  CheckCircle2,
  ArrowUpRight,
  Wallet,
  Settings,
  Layers,
} from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard-performance');
  const [selectedTeam, setSelectedTeam] = useState<Team>('Sale');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all');

  // Global Filters
  const [globalFilters, setGlobalFilters] = useState({
    bu: [] as string[],
    opm: [] as string[],
    project: [] as string[],
    status: [] as string[],
    responsible: [] as string[],
    datePreset: 'all' as string,
    dateFrom: '' as string,
    dateTo: '' as string,
  });

  // Date preset helper
  const getDatePresetRange = (preset: string): { from: string; to: string } => {
    const today = new Date();
    const toStr = today.toISOString().split('T')[0];
    let fromDate: Date;

    switch (preset) {
      case 'this-month':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'ytd':
        fromDate = new Date(today.getFullYear(), 0, 1);
        break;
      case '3-months':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        break;
      case '6-months':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        break;
      case '1-year':
        fromDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        break;
      default:
        return { from: '', to: '' };
    }
    return { from: fromDate.toISOString().split('T')[0], to: toStr };
  };

  const handleDatePresetChange = (preset: string) => {
    const range = getDatePresetRange(preset);
    setGlobalFilters(prev => ({
      ...prev,
      datePreset: preset,
      dateFrom: range.from,
      dateTo: range.to,
    }));
  };

  // Get unique values for filters — OPM/BUD from master data, others from booking data
  const uniqueProjectNames = useMemo(() => Array.from(new Set(bookings.map(b => b.project_name))).sort(), []);

  // Extract clean person names from booking fields
  const cleanName = (v: string) => v.replace(/^\d+\.\d+\)\s*/, '').trim();
  const extractNames = (b: Booking): string[] => {
    const names: string[] = [];
    if (b.sale_name) names.push(b.sale_name);
    if (b.credit_owner) names.push(cleanName(b.credit_owner));
    if (b.cs_owner) b.cs_owner.split(/\s*\/\s*/).forEach(n => { if (n.trim()) names.push(n.trim()); });
    return names;
  };
  const uniqueResponsibles = useMemo(() => Array.from(new Set(
    bookings.flatMap(b => extractNames(b))
  )).sort(), []);

  const summary = useMemo(() => getSummary(), []);

  // Apply global filters first, then local filters
  const globalFilteredBookings = useMemo(() => {
    let result = [...bookings];
    if (globalFilters.bu.length > 0) {
      const budCodes = globalFilters.bu.map(v => v.replace('BUD ', ''));
      result = result.filter(b => budCodes.some(code => b.BUD?.startsWith(code)));
    }
    if (globalFilters.opm.length > 0) {
      const opmCodes = globalFilters.opm.map(v => v.replace('OPM ', ''));
      result = result.filter(b => opmCodes.some(code => b.OPM?.startsWith(code)));
    }
    if (globalFilters.project.length > 0) {
      result = result.filter(b => globalFilters.project.includes(b.project_name));
    }
    if (globalFilters.status.length > 0) {
      result = result.filter(b => globalFilters.status.includes(b.stage));
    }
    if (globalFilters.responsible.length > 0) {
      result = result.filter(b => {
        const names = extractNames(b);
        return names.some(n => globalFilters.responsible.includes(n));
      });
    }
    if (globalFilters.dateFrom) {
      const fromDate = new Date(globalFilters.dateFrom);
      result = result.filter(b => {
        if (!b.booking_date) return false;
        const parts = b.booking_date.split('/');
        const bookingDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        return bookingDate >= fromDate;
      });
    }
    if (globalFilters.dateTo) {
      const toDate = new Date(globalFilters.dateTo);
      result = result.filter(b => {
        if (!b.booking_date) return false;
        const parts = b.booking_date.split('/');
        const bookingDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        return bookingDate <= toDate;
      });
    }
    return result;
  }, [globalFilters]);

  const filteredBookings = useMemo(() => {
    let result = [...globalFilteredBookings];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.id.toLowerCase().includes(q) ||
        b.customer_name.toLowerCase().includes(q) ||
        b.project_name.toLowerCase().includes(q) ||
        b.unit_no.toLowerCase().includes(q)
      );
    }
    // After-transfer sub-views
    if (currentView === 'after-transfer') {
      result = result.filter(b => b.stage === 'transferred');
    } else if (currentView === 'refund') {
      result = result.filter(b => b.stage !== 'cancelled' && b.refund_status && b.refund_status !== 'ไม่มี');
    } else if (currentView === 'meter') {
      result = result.filter(b => b.stage === 'transferred' && (!b.water_meter_change_date || !b.electricity_meter_change_date));
    } else if (currentView === 'freebie') {
      result = result.filter(b => b.stage === 'transferred' && !b.handover_document_received_date);
    } else if (currentView === 'pending-work') {
      result = result.filter(b => b.stage === 'transferred' && !b.handover_document_received_date);
    } else if (stageFilter !== 'all') {
      // Sidebar stage filter — works together with global filters (AND logic)
      if (stageFilter === 'credit') {
        result = result.filter(b => b.stage !== 'cancelled' && b.stage !== 'transferred' && b.credit_status !== 'อนุมัติแล้ว' && b.credit_status !== 'โอนสด');
      } else if (stageFilter === 'inspection') {
        result = result.filter(b => b.stage !== 'cancelled' && b.stage !== 'transferred' && b.inspection_status !== 'ผ่านแล้ว' && b.inspection_status !== 'โอนแล้ว');
      } else {
        result = result.filter(b => b.stage === stageFilter);
      }
    }
    return result;
  }, [globalFilteredBookings, searchQuery, stageFilter, currentView]);

  // Team and blocked bookings based on global filter
  const teamBookings = useMemo(() => {
    return globalFilteredBookings.filter(b =>
      b.current_owner_team === selectedTeam &&
      b.stage !== 'transferred' &&
      b.stage !== 'cancelled'
    );
  }, [globalFilteredBookings, selectedTeam]);

  const blockedBookings = useMemo(() => {
    return globalFilteredBookings.filter(b => b.current_blocker !== null);
  }, [globalFilteredBookings]);

  // Filtered summary based on global filter
  const filteredSummary = useMemo(() => {
    const active = globalFilteredBookings.filter(b => b.stage !== 'transferred' && b.stage !== 'cancelled');
    const transferred = globalFilteredBookings.filter(b => b.stage === 'transferred');
    const blocked = globalFilteredBookings.filter(b => b.current_blocker !== null);

    // Group by BUD
    const budGroups = active.reduce((acc, b) => {
      const bud = b.BUD || 'ไม่ระบุ';
      if (!acc[bud]) acc[bud] = { count: 0, value: 0, transferred: 0 };
      acc[bud].count++;
      acc[bud].value += b.net_contract_value;
      return acc;
    }, {} as Record<string, { count: number; value: number; transferred: number }>);

    // Add transferred count to BUD groups
    transferred.forEach(b => {
      const bud = b.BUD || 'ไม่ระบุ';
      if (!budGroups[bud]) budGroups[bud] = { count: 0, value: 0, transferred: 0 };
      budGroups[bud].transferred++;
    });

    // Grade distribution removed — not shown in BookingDetailPanel

    // Credit status distribution (active only)
    const creditStatuses = ['โอนสด', 'อนุมัติแล้ว', 'รอผล Bureau', 'รอเอกสาร'];
    const creditGroups = creditStatuses.map(status => ({
      status,
      count: active.filter(b => b.credit_status === status || (status === 'รอเอกสาร' && !creditStatuses.slice(0, 3).includes(b.credit_status))).length,
    }));

    // Monthly commitment - group by expected_transfer_month
    const monthOrder = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthlyCommitment = active.reduce((acc, b) => {
      const month = b.expected_transfer_month || 'ไม่ระบุ';
      if (!acc[month]) acc[month] = { count: 0, value: 0 };
      acc[month].count++;
      acc[month].value += b.net_contract_value;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Sort by month order and convert to array
    const sortedMonthlyCommitment = Object.entries(monthlyCommitment)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => {
        const idxA = monthOrder.indexOf(a.month);
        const idxB = monthOrder.indexOf(b.month);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });

    return {
      activeBookings: active.length,
      transferredBookings: transferred.length,
      totalValue: globalFilteredBookings.reduce((sum, b) => sum + b.net_contract_value, 0),
      transferredValue: transferred.reduce((sum, b) => sum + b.net_contract_value, 0),
      avgAgingDays: active.length > 0 ? Math.round(active.reduce((sum, b) => sum + b.aging_days, 0) / active.length) : 0,
      blockedCount: blocked.length,
      byStage: Object.keys(STAGE_CONFIG).map(stage => ({
        stage: stage as Stage,
        count: globalFilteredBookings.filter(b => b.stage === stage).length,
        value: globalFilteredBookings.filter(b => b.stage === stage).reduce((sum, b) => sum + b.net_contract_value, 0),
      })),
      byTeam: Object.keys(TEAM_CONFIG).map(team => ({
        team: team as Team,
        count: globalFilteredBookings.filter(b => b.current_owner_team === team && b.stage !== 'transferred' && b.stage !== 'cancelled').length,
      })),
      byBUD: Object.entries(budGroups).map(([bud, data]) => ({ bud, ...data })).sort((a, b) => b.count - a.count),
      byCredit: creditGroups,
      monthlyCommitment: sortedMonthlyCommitment,
    };
  }, [globalFilteredBookings]);

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        stageFilter={stageFilter}
        selectedTeam={selectedTeam}
        globalFilteredBookings={globalFilteredBookings}
        blockedCount={blockedBookings.length}
        onViewChange={setCurrentView}
        onStageFilterChange={setStageFilter}
        onTeamChange={setSelectedTeam}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900">
              {(currentView === 'dashboard' || currentView === 'dashboard-performance') && 'Dashboard - Performance'}
              {currentView === 'dashboard-tracking' && 'Dashboard - Tracking'}
              {currentView === 'pipeline' && 'Pipeline'}
              {currentView === 'list' && (stageFilter === 'all' ? 'All Bookings' : STAGE_CONFIG[stageFilter]?.label)}
              {currentView === 'blocked' && 'รายการติดปัญหา'}
              {currentView === 'team' && `ทีม ${TEAM_CONFIG[selectedTeam]?.label}`}
              {currentView === 'after-transfer' && 'After Transfer'}
              {currentView === 'refund' && 'เงินทอน'}
              {currentView === 'meter' && 'มิเตอร์น้ำ-ไฟ'}
              {currentView === 'freebie' && 'ของแถม'}
              {currentView === 'pending-work' && 'งานค้าง'}
              {currentView === 'cancel-onprocess' && 'Cancel - Onprocess'}
              {currentView === 'cancel-livnex' && 'Cancel - LivNex'}
              {currentView === 'cancel-pre-livnex' && 'Cancel - Pre-LivNex'}
              {currentView === 'cancel-actual' && 'Cancel - ยกเลิกจริง'}
            </h1>
            <span className="text-xs text-slate-400 font-medium">{filteredBookings.length} รายการ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหา ID, ชื่อ, โครงการ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </header>

        {/* Global Filter Panel — always visible */}
          <div className="bg-white border-b border-slate-200 px-6 py-3">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">BUD</label>
                <MultiSelect
                  values={globalFilters.bu}
                  onChange={(values) => setGlobalFilters(prev => ({ ...prev, bu: values }))}
                  options={BUD_LIST.map(b => ({ value: b, label: b }))}
                  placeholder="ทั้งหมด"
                  className="w-36"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">OPM</label>
                <MultiSelect
                  values={globalFilters.opm}
                  onChange={(values) => setGlobalFilters(prev => ({ ...prev, opm: values }))}
                  options={OPM_LIST.map(o => ({ value: o, label: o }))}
                  placeholder="ทั้งหมด"
                  className="w-36"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">โครงการ</label>
                <MultiSelect
                  values={globalFilters.project}
                  onChange={(values) => setGlobalFilters(prev => ({ ...prev, project: values }))}
                  options={uniqueProjectNames.map(p => ({ value: p, label: p }))}
                  placeholder="ทั้งหมด"
                  className="w-56"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">สถานะงาน</label>
                <MultiSelect
                  values={globalFilters.status}
                  onChange={(values) => setGlobalFilters(prev => ({ ...prev, status: values }))}
                  options={Object.entries(STAGE_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: config.label,
                    color: config.color,
                    bg: config.bg,
                  }))}
                  placeholder="ทั้งหมด"
                  className="w-44"
                  renderOption={(opt) => (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                      {opt.label}
                    </span>
                  )}
                  renderSelected={(selected) => (
                    <span className="flex items-center gap-1 overflow-hidden">
                      {selected.map(s => (
                        <span key={s.value} className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0" style={{ backgroundColor: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      ))}
                    </span>
                  )}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">ผู้รับผิดชอบ</label>
                <MultiSelect
                  values={globalFilters.responsible}
                  onChange={(values) => setGlobalFilters(prev => ({ ...prev, responsible: values }))}
                  options={uniqueResponsibles.map(r => ({ value: r, label: r }))}
                  placeholder="ทั้งหมด"
                  className="w-40"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">วันที่</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={globalFilters.dateFrom}
                    onChange={(e) => setGlobalFilters(prev => ({ ...prev, datePreset: 'custom', dateFrom: e.target.value }))}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-slate-300 text-xs">–</span>
                  <input
                    type="date"
                    value={globalFilters.dateTo}
                    onChange={(e) => setGlobalFilters(prev => ({ ...prev, datePreset: 'custom', dateTo: e.target.value }))}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md self-end">
                {[
                  { value: 'ytd', label: 'YTD' },
                  { value: '3-months', label: '3m' },
                  { value: '6-months', label: '6m' },
                  { value: '1-year', label: '1y' },
                  { value: 'all', label: 'All' },
                ].map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => handleDatePresetChange(preset.value)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                      globalFilters.datePreset === preset.value
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              {(globalFilters.bu.length > 0 || globalFilters.opm.length > 0 || globalFilters.project.length > 0 || globalFilters.status.length > 0 || globalFilters.responsible.length > 0 || globalFilters.dateFrom || globalFilters.dateTo) && (
                <button
                  onClick={() => setGlobalFilters({ bu: [], opm: [], project: [], status: [], responsible: [], datePreset: 'all', dateFrom: '', dateTo: '' })}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] text-red-500 hover:bg-red-50 rounded transition self-end"
                >
                  <X className="w-3 h-3" />
                  ล้าง
                </button>
              )}
              <span className="text-[11px] text-slate-400 self-end pb-1">{globalFilteredBookings.length}/{bookings.length}</span>
            </div>
          </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* ========== DASHBOARD PERFORMANCE VIEW ========== */}
          {(currentView === 'dashboard' || currentView === 'dashboard-performance') && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-7 gap-3">
                {/* 1. จำนวนโครงการ - สีเทา */}
                {(() => {
                  const uniqueProjects = new Set(globalFilteredBookings.map(b => b.project_name));
                  const projectCount = uniqueProjects.size;
                  const changePercent = 2.1;
                  const changeCount = 3;
                  const isPositive = changePercent >= 0;
                  return (
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Layers className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                          <span>{isPositive ? '▲' : '▼'}{changePercent.toFixed(1)}%</span>
                          <span className="text-slate-300">|</span>
                          <span>{changeCount} โครงการ</span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-700">{projectCount} โครงการ</div>
                      <div className="text-xs font-medium text-slate-700">จำนวนโครงการ</div>
                      <div className="text-[10px] text-slate-400 mt-1">{globalFilteredBookings.length} รายการ</div>
                    </div>
                  );
                })()}

                {/* 2. Booking - สีม่วง */}
                {(() => {
                  const bookingData = globalFilteredBookings.filter(b => b.stage === 'booking');
                  const value = bookingData.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);
                  const target = 14197340000;
                  const pct = target > 0 ? (value / target * 100) : 0;
                  const changePercent = 5.2;
                  const changeValue = 120000000;
                  const isPositive = changePercent >= 0;
                  return (
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-violet-600" />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                          <span>{isPositive ? '▲' : '▼'}{changePercent.toFixed(1)}%</span>
                          <span className="text-slate-300">|</span>
                          <span>฿{formatMoney(changeValue)}</span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-violet-600">฿{formatMoney(value)}</div>
                      <div className="text-xs font-medium text-slate-700">Booking</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-violet-500">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Target ฿{formatMoney(target)}</div>
                    </div>
                  );
                })()}

                {/* 3. Contract */}
                {(() => {
                  const contractData = globalFilteredBookings.filter(b => b.stage === 'contract');
                  const value = contractData.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);
                  const target = 14197340000;
                  const pct = target > 0 ? (value / target * 100) : 0;
                  const changePercent = 3.8;
                  const changeValue = 85000000;
                  const isPositive = changePercent >= 0;
                  return (
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                          <span>{isPositive ? '▲' : '▼'}{changePercent.toFixed(1)}%</span>
                          <span className="text-slate-300">|</span>
                          <span>฿{formatMoney(changeValue)}</span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-emerald-600">฿{formatMoney(value)}</div>
                      <div className="text-xs font-medium text-slate-700">Contract</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Target ฿{formatMoney(target)}</div>
                    </div>
                  );
                })()}

                {/* 4. Transfer - สีน้ำเงิน */}
                {(() => {
                  const revenueData = globalFilteredBookings.filter(b => b.stage === 'transferred');
                  const value = revenueData.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);
                  const target = 8885450000;
                  const pct = target > 0 ? (value / target * 100) : 0;
                  const changePercent = 7.5;
                  const changeValue = 210000000;
                  const isPositive = changePercent >= 0;
                  return (
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Banknote className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                          <span>{isPositive ? '▲' : '▼'}{changePercent.toFixed(1)}%</span>
                          <span className="text-slate-300">|</span>
                          <span>฿{formatMoney(changeValue)}</span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-blue-600">฿{formatMoney(value)}</div>
                      <div className="text-xs font-medium text-slate-700">Transfer</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-blue-500">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Target ฿{formatMoney(target)}</div>
                    </div>
                  );
                })()}

                {/* 5. Livnex - สีส้ม */}
                {(() => {
                  const livnexData = globalFilteredBookings.filter(b => b.livnex_complete_date);
                  const value = livnexData.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);
                  const target = 2500000000;
                  const pct = target > 0 ? (value / target * 100) : 0;
                  const changePercent = 12.3;
                  const changeValue = 45000000;
                  const isPositive = changePercent >= 0;
                  return (
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Layers className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                          <span>{isPositive ? '▲' : '▼'}{changePercent.toFixed(1)}%</span>
                          <span className="text-slate-300">|</span>
                          <span>฿{formatMoney(changeValue)}</span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-orange-600">฿{formatMoney(value)}</div>
                      <div className="text-xs font-medium text-slate-700">Livnex</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-orange-500">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Target ฿{formatMoney(target)}</div>
                    </div>
                  );
                })()}

                {/* 6. Pre-LivNex - สีฟ้า */}
                {(() => {
                  const preLivnexData = globalFilteredBookings.filter(b => b.pre_livnex_contract_appointment_date);
                  const value = preLivnexData.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);
                  const target = 1800000000;
                  const pct = target > 0 ? (value / target * 100) : 0;
                  const changePercent = 8.7;
                  const changeValue = 32000000;
                  const isPositive = changePercent >= 0;
                  return (
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <Layers className="w-4 h-4 text-cyan-600" />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                          <span>{isPositive ? '▲' : '▼'}{changePercent.toFixed(1)}%</span>
                          <span className="text-slate-300">|</span>
                          <span>฿{formatMoney(changeValue)}</span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-cyan-600">฿{formatMoney(value)}</div>
                      <div className="text-xs font-medium text-slate-700">Pre-LivNex</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-cyan-500">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Target ฿{formatMoney(target)}</div>
                    </div>
                  );
                })()}

                {/* 7. Cancel */}
                {(() => {
                  const cancelData = globalFilteredBookings.filter(b => b.stage === 'cancelled');
                  const cancelValue = cancelData.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);
                  const changePercent = -2.4;
                  const changeValue = -18000000;
                  const isPositive = changePercent >= 0;
                  return (
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <X className="w-4 h-4 text-red-600" />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                          <span>{isPositive ? '▲' : '▼'}{changePercent.toFixed(1)}%</span>
                          <span className="text-slate-300">|</span>
                          <span>฿{formatMoney(Math.abs(changeValue))}</span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-red-600">฿{formatMoney(cancelValue)}</div>
                      <div className="text-xs font-medium text-slate-700">Cancel</div>
                      <div className="text-[10px] text-slate-400 mt-1">{cancelData.length} รายการ</div>
                    </div>
                  );
                })()}

              </div>

              {/* Performance Charts */}
              <PerformanceCharts bookings={globalFilteredBookings} />

              {/* 2-Column Layout: Credit, Team */}
              <div className="grid grid-cols-2 gap-4">
                {/* Credit Status */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="font-semibold text-slate-900 mb-4">สินเชื่อ</h2>
                  <div className="space-y-3">
                    {filteredSummary.byCredit.map((item, idx) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'อนุมัติแล้ว' || item.status === 'โอนสด' ? 'bg-emerald-500' :
                            item.status === 'รอผล Bureau' ? 'bg-amber-500' :
                            'bg-slate-400'
                          }`} />
                          <span className="text-sm text-slate-700">{item.status}</span>
                        </div>
                        <span className={`text-lg font-bold ${
                          item.status === 'อนุมัติแล้ว' || item.status === 'โอนสด' ? 'text-emerald-600' :
                          item.status === 'รอผล Bureau' ? 'text-amber-600' :
                          'text-slate-600'
                        }`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Workload */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="font-semibold text-slate-900 mb-4">ทีม</h2>
                  <div className="space-y-2">
                    {filteredSummary.byTeam.map(item => (
                      <div key={item.team} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: TEAM_CONFIG[item.team]?.color ?? '#64748b' }}
                        />
                        <span className="text-sm text-slate-700 flex-1">{TEAM_CONFIG[item.team]?.label ?? item.team}</span>
                        <span className="text-sm font-bold text-slate-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BUD Summary */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">สรุปตาม BUD</h2>
                <div className="grid grid-cols-3 gap-4">
                  {filteredSummary.byBUD.map(item => (
                    <div key={item.bud} className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm font-medium text-slate-700 mb-2 truncate">{item.bud}</div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-2xl font-bold text-slate-900">{item.count}</div>
                          <div className="text-xs text-slate-500">กำลังดำเนินการ</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-emerald-600">{item.transferred}</div>
                          <div className="text-xs text-slate-500">โอนแล้ว</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">฿{formatMoney(item.value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blocked Items */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    ติดปัญหา ({blockedBookings.length})
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-3 max-h-80 overflow-auto">
                  {blockedBookings.map(booking => (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">{booking.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                          {booking.aging_days} วัน
                        </span>
                      </div>
                      <div className="text-sm text-slate-700 mb-1 truncate">{booking.customer_name}</div>
                      <div className="text-xs text-slate-500 mb-2 truncate">{booking.project_name}</div>
                      <div className="text-sm text-amber-700 font-medium truncate">{booking.current_blocker}</div>
                      <div className="text-xs text-slate-500 mt-2">
                        {TEAM_CONFIG[booking.current_owner_team]?.label ?? booking.current_owner_team}
                      </div>
                    </div>
                  ))}
                </div>
                {blockedBookings.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    <div>ไม่มีรายการติดปัญหา</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== DASHBOARD TRACKING VIEW ========== */}
          {currentView === 'dashboard-tracking' && (
            <div className="space-y-6">
              {/* ════════ KPI Cards ════════ */}
              {(() => {
                const active = globalFilteredBookings.filter(b => b.stage !== 'transferred' && b.stage !== 'cancelled');
                const transferred = globalFilteredBookings.filter(b => b.stage === 'transferred');
                const cancelled = globalFilteredBookings.filter(b => b.stage === 'cancelled');

                // Stage counts for pipeline breakdown
                const stageDoc = active.filter(b => b.stage === 'booking' || b.stage === 'contract').length;
                const stageCredit = active.filter(b => b.stage === 'credit').length;
                const stageInsp = active.filter(b => b.stage === 'inspection').length;
                const stageReady = active.filter(b => b.stage === 'ready').length;
                const pipeTotal = active.length || 1;

                // Credit approval
                const allBankSubs = active.flatMap(b => b.banks_submitted).filter(bs => bs.bank !== 'JD' && bs.bank !== 'CASH');
                const submitted = allBankSubs.length;
                const approved = allBankSubs.filter(bs => bs.result?.includes('อนุมัติ') && !bs.result?.includes('ไม่')).length;
                const rejected = allBankSubs.filter(bs => bs.result?.includes('ไม่อนุมัติ')).length;
                const approvalRate = submitted > 0 ? Math.round((approved / submitted) * 100) : 0;

                // Aging
                const agingArr = active.map(b => b.aging_days);
                const avgAging = agingArr.length > 0 ? Math.round(agingArr.reduce((s, d) => s + d, 0) / agingArr.length) : 0;
                const maxAging = agingArr.length > 0 ? Math.max(...agingArr) : 0;
                const overSla = active.filter(b => b.aging_days > 90).length;

                // Values
                const activeValue = active.reduce((s, b) => s + b.net_contract_value, 0);
                const transferredValue = transferred.reduce((s, b) => s + b.net_contract_value, 0);

                return (
                  <div className="space-y-4">
                    {/* Row 1: Hero Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Pipeline Card */}
                      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-indigo-100">Pipeline ทั้งหมด</span>
                          <Layers className="w-5 h-5 text-indigo-200" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold">{active.length}</span>
                          <span className="text-sm text-indigo-200">รายการ</span>
                        </div>
                        <div className="text-sm text-indigo-200 mt-0.5">฿{formatMoney(activeValue)}</div>
                        {/* Stage breakdown bar */}
                        <div className="mt-4 flex h-2.5 rounded-full overflow-hidden bg-indigo-400/30">
                          {stageDoc > 0 && <div className="h-full bg-indigo-200" style={{ width: `${(stageDoc / pipeTotal) * 100}%` }} />}
                          {stageCredit > 0 && <div className="h-full bg-amber-300" style={{ width: `${(stageCredit / pipeTotal) * 100}%` }} />}
                          {stageInsp > 0 && <div className="h-full bg-cyan-300" style={{ width: `${(stageInsp / pipeTotal) * 100}%` }} />}
                          {stageReady > 0 && <div className="h-full bg-emerald-300" style={{ width: `${(stageReady / pipeTotal) * 100}%` }} />}
                        </div>
                        <div className="flex justify-between mt-1.5 text-[10px] text-indigo-200">
                          <span>เอกสาร {stageDoc}</span>
                          <span>สินเชื่อ {stageCredit}</span>
                          <span>ตรวจบ้าน {stageInsp}</span>
                          <span>พร้อมโอน {stageReady}</span>
                        </div>
                      </div>

                      {/* Transfer Card */}
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-emerald-100">โอนแล้ว</span>
                          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold">{transferred.length}</span>
                          <span className="text-sm text-emerald-200">รายการ</span>
                        </div>
                        <div className="text-sm text-emerald-200 mt-0.5">฿{formatMoney(transferredValue)}</div>
                        {/* Cancelled sub-stat */}
                        <div className="mt-4 pt-3 border-t border-emerald-400/30 flex gap-6">
                          <div>
                            <div className="text-[10px] text-emerald-300">ยกเลิก</div>
                            <div className="text-lg font-bold">{cancelled.length} <span className="text-[10px] font-normal text-emerald-200">รายการ</span></div>
                          </div>
                          <div>
                            <div className="text-[10px] text-emerald-300">อัตรายกเลิก</div>
                            <div className="text-lg font-bold">{globalFilteredBookings.length > 0 ? Math.round((cancelled.length / globalFilteredBookings.length) * 100) : 0}%</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-emerald-300">อัตราโอน</div>
                            <div className="text-lg font-bold">{globalFilteredBookings.length > 0 ? Math.round((transferred.length / globalFilteredBookings.length) * 100) : 0}%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Detail Cards */}
                    <div className="grid grid-cols-4 gap-4">
                      {/* สินเชื่อ */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500">อัตราอนุมัติสินเชื่อ</span>
                          <Banknote className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-3xl font-bold text-amber-600">{approvalRate}<span className="text-lg">%</span></div>
                        <div className="mt-2 flex h-2 rounded-full overflow-hidden bg-slate-100">
                          <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${submitted > 0 ? (approved / submitted) * 100 : 0}%` }} />
                          <div className="h-full bg-red-400" style={{ width: `${submitted > 0 ? (rejected / submitted) * 100 : 0}%` }} />
                        </div>
                        <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                          <span className="text-emerald-600 font-medium">อนุมัติ {approved}</span>
                          <span className="text-red-500 font-medium">ไม่อนุมัติ {rejected}</span>
                          <span>ส่ง {submitted}</span>
                        </div>
                      </div>

                      {/* Aging */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500">Aging เฉลี่ย</span>
                          <Clock className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-bold ${avgAging > 60 ? 'text-red-600' : avgAging > 30 ? 'text-amber-600' : 'text-slate-900'}`}>{avgAging}</span>
                          <span className="text-sm text-slate-400">วัน</span>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-400">
                          <div className="flex justify-between">
                            <span>สูงสุด <span className="font-bold text-slate-600">{maxAging}</span> วัน</span>
                            <span>เกิน 90d <span className={`font-bold ${overSla > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{overSla}</span> ราย</span>
                          </div>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full rounded-full ${avgAging > 60 ? 'bg-red-400' : avgAging > 30 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min((avgAging / 120) * 100, 100)}%` }} />
                        </div>
                      </div>

                      {/* ติดปัญหา */}
                      <div className={`bg-white rounded-xl border p-4 ${blockedBookings.length > 0 ? 'border-red-200 bg-red-50/50' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500">ติดปัญหา</span>
                          <AlertTriangle className={`w-4 h-4 ${blockedBookings.length > 0 ? 'text-red-400' : 'text-slate-300'}`} />
                        </div>
                        <div className={`text-3xl font-bold ${blockedBookings.length > 0 ? 'text-red-600' : 'text-slate-300'}`}>{blockedBookings.length}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {blockedBookings.length > 0 ? (
                            (() => {
                              const reasons: Record<string, number> = {};
                              blockedBookings.forEach(b => {
                                const r = b.current_blocker || 'อื่นๆ';
                                reasons[r] = (reasons[r] || 0) + 1;
                              });
                              const top = Object.entries(reasons).sort((a, b) => b[1] - a[1])[0];
                              return <span>Top: <span className="font-medium text-red-500">{top[0]}</span> ({top[1]})</span>;
                            })()
                          ) : 'ไม่มีรายการติดปัญหา'}
                        </div>
                      </div>

                      {/* Stage Pipeline Mini */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500">Stage Distribution</span>
                          <TrendingUp className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="space-y-1.5 mt-1">
                          {[
                            { label: 'เอกสาร', count: stageDoc, color: 'bg-indigo-500' },
                            { label: 'สินเชื่อ', count: stageCredit, color: 'bg-amber-500' },
                            { label: 'ตรวจบ้าน', count: stageInsp, color: 'bg-cyan-500' },
                            { label: 'พร้อมโอน', count: stageReady, color: 'bg-emerald-500' },
                          ].map(s => (
                            <div key={s.label} className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 w-14 shrink-0">{s.label}</span>
                              <div className="flex-1 h-3 bg-slate-100 rounded overflow-hidden">
                                <div className={`h-full ${s.color} rounded`} style={{ width: `${pipeTotal > 0 ? (s.count / pipeTotal) * 100 : 0}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 w-5 text-right">{s.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ════════ งานค้างในแต่ละ Process ════════ */}
              {(() => {
                const notDone = globalFilteredBookings.filter(b => b.stage !== 'transferred' && b.stage !== 'cancelled');
                const processes = [
                  { key: 'booking', label: 'จอง', count: notDone.filter(b => !b.contract_date).length },
                  { key: 'doc_bureau', label: 'เอกสารตรวจบูโร', count: notDone.filter(b => b.contract_date && !b.doc_bureau_date).length },
                  { key: 'doc_bank', label: 'เตรียมเอกสารธนาคาร', count: notDone.filter(b => b.contract_date && !b.doc_complete_bank_jd_date).length },
                  { key: 'doc_jd', label: 'เตรียมเอกสาร JD', count: notDone.filter(b => b.contract_date && !b.doc_complete_jd_date).length },
                  // สินเชื่อ
                  { key: 'submit_bank', label: 'ส่งเอกสารให้ธนาคาร', count: notDone.filter(b => (b.doc_bureau_date || b.doc_complete_bank_jd_date) && b.banks_submitted.length === 0).length },
                  { key: 'bureau', label: 'ผลบูโร', count: notDone.filter(b => b.banks_submitted.length > 0 && !b.bureau_actual_result_date).length },
                  { key: 'preapprove', label: 'อนุมัติเบื้องต้น', count: notDone.filter(b => b.bureau_actual_result_date && !b.bank_preapprove_actual_date).length },
                  { key: 'final', label: 'อนุมัติจริง', count: notDone.filter(b => b.bank_preapprove_actual_date && !b.bank_final_actual_date).length },
                  // ตรวจบ้าน
                  { key: 'inspect1', label: 'ตรวจครั้งที่ 1', count: notDone.filter(b => b.stage === 'inspection' && !b.inspect1_actual_date).length },
                  { key: 'inspect2', label: 'ตรวจครั้งที่ 2', count: notDone.filter(b => b.stage === 'inspection' && b.inspect1_actual_date && b.inspect1_result?.includes('ไม่') && !b.inspect2_actual_date).length },
                  { key: 'inspect3', label: 'ตรวจครั้งที่ 3', count: notDone.filter(b => b.stage === 'inspection' && b.inspect2_actual_date && b.inspect2_result?.includes('ไม่') && !b.inspect3_actual_date).length },
                  { key: 'inspect3plus', label: 'ตรวจมากกว่า 3', count: notDone.filter(b => b.stage === 'inspection' && b.inspect3_actual_date && b.inspect3_result?.includes('ไม่')).length },
                  // โอน
                  { key: 'contract_bank', label: 'สัญญา Bank', count: notDone.filter(b => b.bank_final_actual_date && !b.bank_contract_date).length },
                  { key: 'transfer_pkg', label: 'ส่งชุดโอน', count: notDone.filter(b => b.bank_contract_date && !b.transfer_package_sent_date).length },
                  { key: 'title_clear', label: 'ปลอดโฉนด', count: notDone.filter(b => b.transfer_package_sent_date && !b.title_clear_date).length },
                  { key: 'transfer_appt', label: 'นัดโอน', count: notDone.filter(b => b.title_clear_date && !b.transfer_appointment_date).length },
                  { key: 'transfer_actual', label: 'โอนจริง', count: notDone.filter(b => b.transfer_appointment_date && !b.transfer_actual_date).length },
                ];

                const groupColor: Record<string, string> = {
                  booking: '#6366f1', doc_bureau: '#6366f1', doc_bank: '#6366f1', doc_jd: '#6366f1',
                  submit_bank: '#f59e0b', bureau: '#f59e0b', preapprove: '#f59e0b', final: '#f59e0b',
                  inspect1: '#06b6d4', inspect2: '#06b6d4', inspect3: '#06b6d4', inspect3plus: '#06b6d4',
                  contract_bank: '#10b981', transfer_pkg: '#10b981', title_clear: '#10b981', transfer_appt: '#10b981', transfer_actual: '#10b981',
                };
                const barData = processes.map(p => ({ process: p.label, count: p.count, color: groupColor[p.key] }));

                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h2 className="font-semibold text-slate-900">งานค้างในแต่ละ Process</h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">จำนวน Booking ที่ค้างอยู่ในแต่ละขั้นตอน</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] text-slate-600"><span className="w-3 h-3 rounded-sm bg-indigo-500" /> เอกสาร</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-600"><span className="w-3 h-3 rounded-sm bg-amber-500" /> สินเชื่อ</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-600"><span className="w-3 h-3 rounded-sm bg-cyan-500" /> ตรวจบ้าน</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-600"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> โอน</div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={barData} margin={{ left: 0, right: 10, top: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="process" tick={{ fontSize: 9, fontWeight: 600 }} interval={0} angle={-30} textAnchor="end" height={50} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(value) => [`${value} รายการ`, 'งานค้าง']} />
                        <Bar dataKey="count" name="งานค้าง">
                          {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                          <LabelList dataKey="count" position="top" style={{ fontSize: 10, fontWeight: 700, fill: '#334155' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}

              {/* ════════ Workload List — Progress Bar รายคน ════════ */}
              {(() => {
                const notDone2 = globalFilteredBookings.filter(b => b.stage !== 'transferred' && b.stage !== 'cancelled');

                // นับงานค้างต่อคน แยกตามหมวดหมู่ process
                const countPeople = (bks: typeof notDone2, getter: (b: typeof notDone2[0]) => string | null) => {
                  const map: Record<string, number> = {};
                  bks.forEach(b => {
                    const owner = getter(b);
                    if (owner) map[owner] = (map[owner] || 0) + 1;
                  });
                  return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
                };

                const docBookings = notDone2.filter(b => b.stage === 'booking' || b.stage === 'contract' || (!b.doc_bureau_date && b.stage === 'credit') || (!b.doc_complete_bank_jd_date && b.stage === 'credit'));
                const creditBookings = notDone2.filter(b => b.stage === 'credit');
                const inspBookings = notDone2.filter(b => b.stage === 'inspection');
                const transferBookings = notDone2.filter(b => b.stage === 'ready');

                const catGroups = [
                  { cat: 'เอกสาร', color: '#6366f1', people: countPeople(docBookings, b => b.credit_owner || b.sale_name) },
                  { cat: 'สินเชื่อ', color: '#f59e0b', people: countPeople(creditBookings, b => b.credit_owner) },
                  { cat: 'ตรวจบ้าน', color: '#06b6d4', people: countPeople(inspBookings, b => b.cs_owner) },
                  { cat: 'โอน', color: '#10b981', people: countPeople(transferBookings, b => b.credit_owner || b.sale_name) },
                ];
                const maxAll = Math.max(...catGroups.flatMap(g => g.people.map(p => p.count)), 1);

                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="mb-3">
                      <h2 className="font-semibold text-slate-900">Workload — งานค้างรายคน</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">จำนวน Booking ค้างในแต่ละหมวด แยกตามผู้รับผิดชอบ</p>
                    </div>
                    <div className="space-y-4">
                      {catGroups.map(g => (
                        <div key={g.cat}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: g.color }} />
                            <span className="text-[11px] font-bold text-slate-700">{g.cat}</span>
                            <span className="text-[10px] text-slate-400 ml-1">{g.people.reduce((s, p) => s + p.count, 0)} รายการ</span>
                          </div>
                          <div className="space-y-1">
                            {g.people.map(p => (
                              <div key={p.name} className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-600 w-[160px] shrink-0 truncate">{p.name}</span>
                                <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
                                  <div className="h-full rounded transition-all" style={{ width: `${(p.count / maxAll) * 100}%`, backgroundColor: g.color, opacity: 0.75 }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 w-6 text-right tabular-nums">{p.count}</span>
                              </div>
                            ))}
                            {g.people.length === 0 && (
                              <div className="text-[10px] text-slate-300 pl-4">— ไม่มีงานค้าง</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* ════════ เวลาเฉลี่ย ตามอาชีพลูกค้า (จาก Booking Data) ════════ */}
              {(() => {
                const parseD = (d: string) => { const [dd,mm,yy] = d.split('/'); return new Date(+yy, +mm-1, +dd); };
                const daysDiff = (a: string | null, b: string | null) => {
                  if (!a || !b) return null;
                  return Math.round((parseD(b).getTime() - parseD(a).getTime()) / 86400000);
                };

                // Group bookings by occupation category
                const occMap: Record<string, string> = {
                  'พนักงานบริษัท': 'พนักงาน', 'ผู้บริหาร': 'พนักงาน', 'วิศวกร': 'พนักงาน',
                  'ค้าขาย': 'เจ้าของกิจการ', 'ธุรกิจส่วนตัว': 'เจ้าของกิจการ', 'เจ้าของกิจการ': 'เจ้าของกิจการ',
                  'ข้าราชการ': 'ข้าราชการ',
                };
                const occGroup = (occ: string | null) => occ ? (occMap[occ] || 'อื่นๆ') : 'อื่นๆ';

                const occupations = ['พนักงาน', 'เจ้าของกิจการ', 'ข้าราชการ'];
                const occColors: Record<string, string> = { 'พนักงาน': '#3b82f6', 'เจ้าของกิจการ': '#f59e0b', 'ข้าราชการ': '#8b5cf6' };

                type B = typeof globalFilteredBookings[0];
                const firstSubmitDate = (b: B) => {
                  const dates = b.banks_submitted.map(x => x.submit_date).filter(Boolean) as string[];
                  return dates.length ? dates.sort((a, c) => parseD(a).getTime() - parseD(c).getTime())[0] : null;
                };
                const lastInspDate = (b: B) => b.inspect3_actual_date || b.inspect2_actual_date || b.inspect1_actual_date;
                const stepDefs: { name: string; note: string; from: (b: B) => string | null; to: (b: B) => string | null }[] = [
                  // ── Root ──
                  { name: 'สัญญา', note: 'จากจอง', from: b => b.booking_date, to: b => b.contract_date },
                  { name: 'เช็คบูโร', note: 'จากสัญญา', from: b => b.contract_date || b.booking_date, to: b => b.doc_bureau_date },
                  { name: 'เอกสารครบ Bank', note: 'จากจอง', from: b => b.booking_date, to: b => b.doc_complete_bank_jd_date },
                  { name: 'เอกสารครบ JD', note: 'จากจอง', from: b => b.booking_date, to: b => b.doc_complete_jd_date },
                  // ── สินเชื่อ ──
                  { name: 'ส่งเอกสาร', note: 'จากเอกสารครบ', from: b => b.doc_complete_bank_jd_date || b.doc_bureau_date, to: b => firstSubmitDate(b) },
                  { name: 'บูโร', note: 'จากส่งเอกสาร', from: b => firstSubmitDate(b) || b.doc_bureau_date, to: b => b.bureau_actual_result_date },
                  { name: 'อนุมัติเบื้องต้น', note: 'จากผลบูโร', from: b => b.bureau_actual_result_date, to: b => b.bank_preapprove_actual_date },
                  { name: 'อนุมัติจริง', note: 'จาก Pre-approve', from: b => b.bank_preapprove_actual_date, to: b => b.bank_final_actual_date },
                  // ── ตรวจบ้าน ──
                  { name: 'นัดลูกค้าตรวจ', note: 'จาก QC', from: b => b.unit_ready_inspection_date, to: b => b.inspect1_appointment_date },
                  { name: 'ลูกค้ารับมอบ', note: 'จากตรวจ', from: b => lastInspDate(b), to: b => b.handover_accept_date },
                  // ── โอน ──
                  { name: 'สัญญา Bank', note: 'จากอนุมัติ', from: b => b.bank_final_actual_date, to: b => b.bank_contract_date },
                  { name: 'ส่งชุดโอน', note: 'จากสัญญา Bank', from: b => b.bank_contract_date, to: b => b.transfer_package_sent_date },
                  { name: 'ปลอดโฉนด', note: 'จากส่งชุดโอน', from: b => b.transfer_package_sent_date, to: b => b.title_clear_date },
                  { name: 'นัดโอน', note: 'จากปลอดโฉนด', from: b => b.title_clear_date, to: b => b.transfer_appointment_date },
                  { name: 'โอนจริง', note: 'จากนัดโอน', from: b => b.transfer_appointment_date, to: b => b.transfer_actual_date },
                ];

                const slaData = stepDefs.map(step => {
                  const row: Record<string, unknown> = { step: step.name, note: step.note };
                  occupations.forEach(occ => {
                    const matched = globalFilteredBookings
                      .filter(b => occGroup(b.customer_occupation) === occ)
                      .map(b => daysDiff(step.from(b), step.to(b)))
                      .filter((d): d is number => d !== null && d >= 0);
                    row[occ] = matched.length > 0 ? Math.round(matched.reduce((s, d) => s + d, 0) / matched.length) : undefined;
                  });
                  // ค่าเฉลี่ยรวมทุกอาชีพ
                  const allMatched = globalFilteredBookings
                    .map(b => daysDiff(step.from(b), step.to(b)))
                    .filter((d): d is number => d !== null && d >= 0);
                  row['เฉลี่ยรวม'] = allMatched.length > 0 ? Math.round(allMatched.reduce((s, d) => s + d, 0) / allMatched.length) : undefined;
                  return row;
                });

                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h2 className="font-semibold text-slate-900">เวลาเฉลี่ย — ตามอาชีพลูกค้า</h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">คำนวณจากข้อมูล Booking จริง</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {occupations.map(occ => (
                          <div key={occ} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <div className="w-4 h-0.5 rounded" style={{ backgroundColor: occColors[occ] }} />
                            {occ}
                          </div>
                        ))}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <div className="w-4 h-0 border-t-2 border-dashed border-slate-400 rounded" />
                          เฉลี่ยรวม
                        </div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={360}>
                      <ComposedChart data={slaData} margin={{ left: 0, right: 10, top: 35, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="step" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={70} />
                        <YAxis unit=" วัน" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
                        <Tooltip
                          contentStyle={{ fontSize: 13, borderRadius: 8 }}
                          formatter={(value, name) => [`${value} วัน`, name]}
                          labelFormatter={(label, payload) => {
                            const item = payload?.[0]?.payload as Record<string, unknown> | undefined;
                            return item ? `${label} (${item.note})` : String(label);
                          }}
                        />
                        {occupations.map((occ, idx) => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const renderLabel = (props: any) => {
                            const { x, y, value, index: stepIdx } = props;
                            if (x == null || y == null || value == null || stepIdx == null) return null;
                            const stepRow = slaData[stepIdx];
                            const vals = occupations.map((o, i) => ({ idx: i, val: stepRow[o] as number | undefined }));
                            const close = vals.filter(v => v.val !== undefined && Math.abs(v.val - value) <= 1);
                            let dy: number;
                            if (close.length <= 1) {
                              dy = -14;
                            } else {
                              const rank = close.findIndex(v => v.idx === idx);
                              dy = -14 - (close.length - 1 - rank) * 15;
                            }
                            const txt = `${value}`;
                            const tw = txt.length * 7 + 10;
                            return (
                              <g key={`${occ}-${stepIdx}`}>
                                <rect x={x - tw / 2} y={y + dy - 10} width={tw} height={15} rx={4} fill={occColors[occ]} opacity={0.15} />
                                <text x={x} y={y + dy} textAnchor="middle" fontSize={10} fontWeight={700} fill={occColors[occ]}>{txt}</text>
                              </g>
                            );
                          };
                          return (
                            <Line
                              key={occ}
                              type="monotone"
                              dataKey={occ}
                              stroke={occColors[occ]}
                              strokeWidth={2.5}
                              dot={{ r: 5, fill: occColors[occ], stroke: '#fff', strokeWidth: 2 }}
                              activeDot={{ r: 7 }}
                              connectNulls={false}
                            >
                              <LabelList dataKey={occ} content={renderLabel} />
                            </Line>
                          );
                        })}
                        <Line
                          type="monotone"
                          dataKey="เฉลี่ยรวม"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          strokeDasharray="6 4"
                          dot={{ r: 3, fill: '#94a3b8', stroke: '#fff', strokeWidth: 1 }}
                          connectNulls={false}
                        >
                          <LabelList dataKey="เฉลี่ยรวม" position="bottom" offset={10} style={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                        </Line>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}

              <div className="grid grid-cols-10 gap-4 items-stretch">
              <div className="col-span-3 flex">
              {/* ════════ เวลาอนุมัติเฉลี่ย แต่ละ Step ของธนาคาร + JD ════════ */}
              {(() => {
                const parseD = (d: string) => { const [dd,mm,yy] = d.split('/'); return new Date(+yy, +mm-1, +dd); };
                const daysDiff = (a: string | null, b: string | null) => {
                  if (!a || !b) return null;
                  return Math.round((parseD(b).getTime() - parseD(a).getTime()) / 86400000);
                };

                // ธนาคารทั้งหมดตาม master (ไม่รวม CASH)
                const allBanks = ['GHB','GSB','SCB','KBANK','KTB','TTB','BAY','LH','BBL','UOB','CIMB','KKP','iBank','TISCO','สหกรณ์','JD'];
                const bankColors: Record<string, string> = {
                  'GHB': '#e11d48', 'GSB': '#f472b6', 'SCB': '#7c3aed', 'KBANK': '#16a34a',
                  'KTB': '#0891b2', 'TTB': '#ea580c', 'BAY': '#eab308', 'LH': '#84cc16',
                  'BBL': '#2563eb', 'UOB': '#db2777', 'CIMB': '#b91c1c', 'KKP': '#6366f1',
                  'iBank': '#0d9488', 'TISCO': '#a855f7', 'สหกรณ์': '#78716c', 'JD': '#059669',
                };

                const stepNames = ['ส่ง → บูโร', 'บูโร → เบื้องต้น', 'เบื้องต้น → อนุมัติจริง', 'รวม ส่ง → อนุมัติจริง'];

                // Collect per-bank step data
                type BankStep = { bank: string; vals: (number | null)[] };
                const bankStepMap: Record<string, number[][]> = {};

                globalFilteredBookings.forEach(b => {
                  const bureauDate = b.bureau_actual_result_date;
                  b.banks_submitted.forEach(bs => {
                    if (bs.bank === 'CASH' || !bs.submit_date) return;
                    if (!bankStepMap[bs.bank]) bankStepMap[bs.bank] = [[], [], [], []];
                    const arr = bankStepMap[bs.bank];

                    // Step 0: ส่ง → บูโร
                    const d0 = daysDiff(bs.submit_date, bureauDate);
                    if (d0 !== null && d0 >= 0) arr[0].push(d0);

                    if (bs.bank === 'JD') {
                      // JD: ไม่มีเบื้องต้น, step 2 = บูโร → อนุมัติจริง
                      const d2 = daysDiff(bureauDate, bs.result_date);
                      if (d2 !== null && d2 >= 0) arr[2].push(d2);
                    } else {
                      // Step 1: บูโร → เบื้องต้น
                      const d1 = daysDiff(bureauDate, bs.preapprove_date);
                      if (d1 !== null && d1 >= 0) arr[1].push(d1);
                      // Step 2: เบื้องต้น → อนุมัติจริง
                      const d2 = daysDiff(bs.preapprove_date, bs.result_date);
                      if (d2 !== null && d2 >= 0) arr[2].push(d2);
                    }

                    // Step 3: รวม ส่ง → อนุมัติจริง
                    const dTotal = daysDiff(bs.submit_date, bs.result_date);
                    if (dTotal !== null && dTotal >= 0) arr[3].push(dTotal);
                  });
                });

                // Build heatmap data: rows = banks, cols = steps
                const heatData = allBanks.map(bk => {
                  const row: { bank: string; values: (number | null)[] } = { bank: bk, values: [] };
                  stepNames.forEach((_, si) => {
                    const vals = bankStepMap[bk]?.[si] || [];
                    row.values.push(vals.length > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null);
                  });
                  return row;
                });

                // Rank per step column (เร็วสุด = ลำดับ 1, ค่าเท่ากัน = ลำดับเดียวกัน)
                // rankMap[stepIdx][bank] = { rank, total }
                const rankMap: Record<number, Record<string, { rank: number; total: number }>> = {};
                stepNames.forEach((_, si) => {
                  const entries = heatData
                    .filter(r => r.values[si] !== null)
                    .map(r => ({ bank: r.bank, val: r.values[si] as number }));
                  // sort by value ascending
                  entries.sort((a, b) => a.val - b.val);
                  // assign rank — tied values get the same rank
                  rankMap[si] = {};
                  const total = entries.length;
                  let currentRank = 1;
                  entries.forEach((e, idx) => {
                    if (idx > 0 && e.val > entries[idx - 1].val) currentRank = idx + 1;
                    rankMap[si][e.bank] = { rank: currentRank, total };
                  });
                });

                // Color by rank ratio — Excel-style gradient: เขียวจัด → เขียว → เหลือง → ส้ม → แดง → แดงจัด
                const heatColorByRank = (si: number, bank: string, v: number | null): string => {
                  if (v === null) return '';
                  const info = rankMap[si]?.[bank];
                  if (!info || info.total <= 1) return 'text-white';
                  const ratio = (info.rank - 1) / (info.total - 1); // 0=best → 1=worst
                  // interpolate: green(34,197,94) → yellow(250,204,21) → orange(249,115,22) → red(220,38,38) → darkred(153,27,27)
                  let r: number, g: number, b: number;
                  if (ratio <= 0.25) {
                    const t = ratio / 0.25;
                    r = Math.round(34 + t * (250 - 34));
                    g = Math.round(197 + t * (204 - 197));
                    b = Math.round(94 + t * (21 - 94));
                  } else if (ratio <= 0.5) {
                    const t = (ratio - 0.25) / 0.25;
                    r = Math.round(250 + t * (249 - 250));
                    g = Math.round(204 + t * (115 - 204));
                    b = Math.round(21 + t * (22 - 21));
                  } else if (ratio <= 0.75) {
                    const t = (ratio - 0.5) / 0.25;
                    r = Math.round(249 + t * (220 - 249));
                    g = Math.round(115 + t * (38 - 115));
                    b = Math.round(22 + t * (38 - 22));
                  } else {
                    const t = (ratio - 0.75) / 0.25;
                    r = Math.round(220 + t * (153 - 220));
                    g = Math.round(38 + t * (27 - 38));
                    b = Math.round(38 + t * (27 - 38));
                  }
                  return ratio > 0.5 ? 'text-white' : 'text-slate-900';
                };
                const heatBg = (si: number, bank: string, v: number | null): string | undefined => {
                  if (v === null) return '#f8fafc';
                  const info = rankMap[si]?.[bank];
                  if (!info || info.total <= 1) return 'rgb(34,197,94)';
                  const ratio = (info.rank - 1) / (info.total - 1);
                  let r: number, g: number, b: number;
                  if (ratio <= 0.25) {
                    const t = ratio / 0.25;
                    r = Math.round(34 + t * (250 - 34));  g = Math.round(197 + t * (204 - 197));  b = Math.round(94 + t * (21 - 94));
                  } else if (ratio <= 0.5) {
                    const t = (ratio - 0.25) / 0.25;
                    r = Math.round(250 + t * (249 - 250));  g = Math.round(204 + t * (115 - 204));  b = Math.round(21 + t * (22 - 21));
                  } else if (ratio <= 0.75) {
                    const t = (ratio - 0.5) / 0.25;
                    r = Math.round(249 + t * (220 - 249));  g = Math.round(115 + t * (38 - 115));  b = Math.round(22 + t * (38 - 22));
                  } else {
                    const t = (ratio - 0.75) / 0.25;
                    r = Math.round(220 + t * (153 - 220));  g = Math.round(38 + t * (27 - 38));  b = Math.round(38 + t * (27 - 38));
                  }
                  return `rgb(${r},${g},${b})`;
                };

                // Count bookings per bank
                const bankCount: Record<string, number> = {};
                globalFilteredBookings.forEach(b => {
                  b.banks_submitted.forEach(bs => {
                    if (bs.bank !== 'CASH' && bs.submit_date) bankCount[bs.bank] = (bankCount[bs.bank] || 0) + 1;
                  });
                });

                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-3 w-full">
                    <div className="mb-2">
                      <h2 className="font-semibold text-slate-900 text-sm">เวลาอนุมัติเฉลี่ย</h2>
                      <p className="text-[10px] text-slate-400">สีเข้ม = ใช้เวลามาก</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[9px] table-fixed">
                        <thead>
                          <tr>
                            <th className="text-left py-1 px-1 text-slate-500 font-semibold" style={{ width: '56px' }}></th>
                            <th className="text-center py-1 px-0.5 text-slate-400 font-medium" style={{ width: '22px' }}>N</th>
                            {['ส่ง→บูโร', 'บูโร→ต้น', 'ต้น→จริง', 'รวม'].map(s => (
                              <th key={s} className="text-center py-1 px-0.5 text-slate-500 font-semibold">{s}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {heatData.map(row => (
                            <tr key={row.bank}>
                              <td className="py-0 px-1 font-bold text-slate-700 whitespace-nowrap border border-white text-[9px]">
                                <span className="inline-block w-1.5 h-1.5 rounded-sm mr-0.5" style={{ backgroundColor: bankColors[row.bank] }} />
                                {row.bank}
                              </td>
                              <td className="text-center py-0 px-0.5 text-slate-400 tabular-nums border border-white">{bankCount[row.bank] || '—'}</td>
                              {row.values.map((v, ci) => {
                                const info = rankMap[ci]?.[row.bank];
                                return (
                                  <td key={ci} className={`text-center py-1 px-0.5 font-bold tabular-nums border border-white ${heatColorByRank(ci, row.bank, v)}`} style={{ backgroundColor: heatBg(ci, row.bank, v) }}>
                                    {v !== null ? (<>{v}d<span className="text-[7px] opacity-60"> #{info?.rank}</span></>) : <span className="text-slate-300">—</span>}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center gap-0.5 mt-3 text-[10px] text-slate-400">
                      <span className="mr-1">เร็ว</span>
                      <span className="w-6 h-3 rounded" style={{ backgroundColor: 'rgb(34,197,94)' }} />
                      <span className="w-6 h-3 rounded" style={{ backgroundColor: 'rgb(142,200,57)' }} />
                      <span className="w-6 h-3 rounded" style={{ backgroundColor: 'rgb(250,204,21)' }} />
                      <span className="w-6 h-3 rounded" style={{ backgroundColor: 'rgb(249,159,22)' }} />
                      <span className="w-6 h-3 rounded" style={{ backgroundColor: 'rgb(249,115,22)' }} />
                      <span className="w-6 h-3 rounded" style={{ backgroundColor: 'rgb(220,38,38)' }} />
                      <span className="w-6 h-3 rounded" style={{ backgroundColor: 'rgb(153,27,27)' }} />
                      <span className="ml-1">ช้า</span>
                    </div>
                  </div>
                );
              })()}
              </div>
              <div className="col-span-7 flex">
              {/* ════════ Stacked Bar — จำนวนยื่นสินเชื่อรายธนาคาร ════════ */}
              {(() => {
                const allBanksSb = ['GHB','GSB','SCB','KBANK','KTB','TTB','BAY','LH','BBL','UOB','CIMB','KKP','iBank','TISCO','สหกรณ์'];
                const sbColors: Record<string, string> = {
                  'GHB': '#e11d48', 'GSB': '#f472b6', 'SCB': '#7c3aed', 'KBANK': '#16a34a',
                  'KTB': '#0891b2', 'TTB': '#ea580c', 'BAY': '#eab308', 'LH': '#84cc16',
                  'BBL': '#2563eb', 'UOB': '#db2777', 'CIMB': '#b91c1c', 'KKP': '#6366f1',
                  'iBank': '#0d9488', 'TISCO': '#a855f7', 'สหกรณ์': '#78716c', 'JD': '#059669',
                };

                // Count per bank per status
                const bankData: Record<string, { approved: number; rejected: number; pending: number }> = {};
                allBanksSb.forEach(bk => { bankData[bk] = { approved: 0, rejected: 0, pending: 0 }; });

                globalFilteredBookings.forEach(b => {
                  b.banks_submitted.forEach(bs => {
                    if (bs.bank === 'CASH' || bs.bank === 'JD') return;
                    if (!bankData[bs.bank]) return;
                    if (!bs.result || bs.result === 'รอผล') {
                      bankData[bs.bank].pending++;
                    } else if (bs.result.includes('ไม่อนุมัติ')) {
                      bankData[bs.bank].rejected++;
                    } else if (bs.result.includes('อนุมัติ')) {
                      bankData[bs.bank].approved++;
                    } else {
                      bankData[bs.bank].pending++;
                    }
                  });
                });

                const chartData = allBanksSb
                  .map(bk => {
                    const t = bankData[bk].approved + bankData[bk].rejected + bankData[bk].pending;
                    return {
                      bank: bk,
                      อนุมัติ: bankData[bk].approved,
                      ไม่อนุมัติ: bankData[bk].rejected,
                      งานค้าง: bankData[bk].pending,
                      total: t,
                      approveRate: t > 0 ? Math.round((bankData[bk].approved / t) * 100) : 0,
                      rejectRate: t > 0 ? Math.round((bankData[bk].rejected / t) * 100) : 0,
                    };
                  })
                  .sort((a, b) => b.total - a.total);

                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 w-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h2 className="font-semibold text-slate-900 text-sm">จำนวนยื่นสินเชื่อ — รายธนาคาร</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">แท่งซ้าย = ส่ง, แท่งขวา = อนุมัติ+ไม่อนุมัติ</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] text-slate-600">
                          <span className="w-3 h-3 rounded-sm bg-slate-400" /> ส่ง
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-600">
                          <span className="w-3 h-3 rounded-sm bg-emerald-500" /> อนุมัติ
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-600">
                          <span className="w-3 h-3 rounded-sm bg-red-500" /> ไม่อนุมัติ
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-600">
                          <span className="w-2.5 h-0.5 rounded bg-amber-500" /> รออนุมัติ
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ left: 0, right: 10, top: 25, bottom: 5 }} barGap={2} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="bank" tick={{ fontSize: 9, fontWeight: 600 }} interval={0} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(value, name) => [`${value} ใบ`, name]} />
                        <Bar dataKey="ไม่อนุมัติ" stackId="result" fill="#ef4444">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <LabelList content={(props: any) => {
                            const { x, y, width, height, index } = props;
                            const d = chartData[index];
                            if (!d || d['ไม่อนุมัติ'] === 0) return null;
                            return <text x={x + width / 2} y={y - 4} textAnchor="middle" style={{ fontSize: 8, fontWeight: 700, fill: '#dc2626' }}>{d['ไม่อนุมัติ']} ({d.rejectRate}%)</text>;
                          }} />
                        </Bar>
                        <Bar dataKey="อนุมัติ" stackId="result" fill="#22c55e">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <LabelList content={(props: any) => {
                            const { x, y, width, height, index } = props;
                            const d = chartData[index];
                            if (!d || d['อนุมัติ'] === 0) return null;
                            return <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 8, fontWeight: 700, fill: '#065f46' }}>{d['อนุมัติ']} ({d.approveRate}%)</text>;
                          }} />
                        </Bar>
                        <Bar dataKey="total" name="ส่ง" fill="#94a3b8">
                          <LabelList dataKey="total" position="top" style={{ fontSize: 9, fontWeight: 700, fill: '#334155' }} formatter={((v: any) => Number(v) > 0 ? `${v}` : '') as any} />
                        </Bar>
                        <Line type="monotone" dataKey="งานค้าง" name="รออนุมัติ" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }}>
                          <LabelList dataKey="งานค้าง" position="top" style={{ fontSize: 8, fontWeight: 700, fill: '#d97706' }} formatter={((v: any) => Number(v) > 0 ? `${v}` : '') as any} />
                        </Line>
                      </ComposedChart>
                    </ResponsiveContainer>
                    </div>
                  </div>
                );
              })()}
              </div>
              </div>


              {/* Stage Pipeline - 2 Rows with Backlog spanning both */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Pipeline</h2>
                {(() => {
                  // Calculate Credit sub-steps
                  const creditBookings = globalFilteredBookings.filter(b => b.stage === 'credit');
                  const creditDoc = creditBookings.filter(b => !b.bureau_result); // รอเอกสาร
                  const creditBank = creditBookings.filter(b => b.bureau_result && !b.bank_final_result); // รอธนาคาร
                  const creditResult = creditBookings.filter(b => b.bank_final_result); // ธนาคารแจ้งผล (อนุมัติ/ไม่อนุมัติ)
                  const creditDocValue = creditDoc.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);
                  const creditBankValue = creditBank.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);
                  const creditResultValue = creditResult.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);

                  // Backlog data
                  const backlogStageData = filteredSummary.byStage.find(s => s.stage === 'booking');
                  const backlogCount = backlogStageData?.count ?? 0;
                  const backlogValue = backlogStageData?.value ?? 0;

                  // Ready & Transferred data
                  const readyStageData = filteredSummary.byStage.find(s => s.stage === 'ready');
                  const transferredStageData = filteredSummary.byStage.find(s => s.stage === 'transferred');

                  // Inspection by round (ตรวจ 1, 2, 3)
                  const activeBookings = globalFilteredBookings.filter(b =>
                    b.stage !== 'transferred' && b.stage !== 'cancelled' && b.stage !== 'booking'
                  );
                  const insp1 = activeBookings.filter(b => b.inspect1_appointment_date && !b.inspect1_actual_date);
                  const insp2 = activeBookings.filter(b => b.inspect2_appointment_date && !b.inspect2_actual_date);
                  const insp3 = activeBookings.filter(b => b.inspect3_appointment_date && !b.inspect3_actual_date);

                  // Contract data
                  const contractStageData = filteredSummary.byStage.find(s => s.stage === 'contract');

                  // Row 1: Credit flow steps - white cards with indigo border
                  const creditSteps = [
                    { key: 'credit-doc', label: 'รอเอกสาร', bgClass: 'bg-white', textClass: 'text-teal-700', borderClass: 'border-teal-300', count: creditDoc.length, value: creditDocValue },
                    { key: 'credit-bank', label: 'รอธนาคาร', bgClass: 'bg-white', textClass: 'text-teal-700', borderClass: 'border-teal-300', count: creditBank.length, value: creditBankValue },
                    { key: 'credit-result', label: 'ธนาคารแจ้งผล', bgClass: 'bg-white', textClass: 'text-teal-700', borderClass: 'border-teal-300', count: creditResult.length, value: creditResultValue },
                  ];

                  // Row 2: Inspection steps - white cards with indigo border
                  const inspSteps = [
                    { key: 'insp1', label: 'ตรวจ 1', bgClass: 'bg-white', textClass: 'text-teal-700', borderClass: 'border-teal-300', count: insp1.length, value: insp1.reduce((s, b) => s + (b.net_contract_value || 0), 0) },
                    { key: 'insp2', label: 'ตรวจ 2', bgClass: 'bg-white', textClass: 'text-teal-700', borderClass: 'border-teal-300', count: insp2.length, value: insp2.reduce((s, b) => s + (b.net_contract_value || 0), 0) },
                    { key: 'insp3', label: 'ตรวจ 3', bgClass: 'bg-white', textClass: 'text-teal-700', borderClass: 'border-teal-300', count: insp3.length, value: insp3.reduce((s, b) => s + (b.net_contract_value || 0), 0) },
                  ];

                  // Row 3: Cancelled in process
                  const cancelledData = globalFilteredBookings.filter(b => b.stage === 'cancelled');
                  const cancelledValue = cancelledData.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);

                  // Row 4: Livnex (เช่าซื้อ) - All steps defined in arrays
                  const livnexBookings = globalFilteredBookings.filter(b => b.sale_offer_livnex_flag);
                  const bookLiv = livnexBookings.filter(b => !b.doc_bureau_date);
                  const bookLivNew = bookLiv.filter(b => b.sale_type_flag === 'ขายใหม่');
                  const bookLivFromCancel = bookLiv.filter(b => b.sale_type_flag === 'Re-sale');
                  const livDocWait = livnexBookings.filter(b => b.doc_bureau_date && !b.doc_complete_bank_jd_date);
                  const livJdWait = livnexBookings.filter(b => b.doc_complete_bank_jd_date && !b.livnex_complete_date);
                  const livJdResult = livnexBookings.filter(b => b.livnex_complete_date && !b.livnex_contract_appointment_date);
                  const livContract = livnexBookings.filter(b => b.livnex_contract_appointment_date && !b.livnex_contract_actual_date);
                  const livPreparing = livnexBookings.filter(b => b.livnex_contract_actual_date && !b.inspect1_appointment_date);
                  const livInspecting = livnexBookings.filter(b => b.inspect1_appointment_date && !b.handover_accept_date);
                  const livMoveIn = livnexBookings.filter(b => b.handover_accept_date);

                  // Livnex step arrays - white cards with amber border
                  const livBookSteps = [
                    { key: 'liv-new', label: 'เช่าซื้อใหม่', count: bookLivNew.length, value: bookLivNew.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-amber-600', borderClass: 'border-amber-300' },
                    { key: 'liv-cancel', label: 'จาก Cancel', count: bookLivFromCancel.length, value: bookLivFromCancel.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-amber-500', borderClass: 'border-amber-200' },
                  ];
                  // เตรียมเอกสาร - separate step to align with Contract column
                  const livDocWaitStep = { key: 'liv-doc-wait', label: 'เตรียมเอกสาร', count: livDocWait.length, value: livDocWait.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-amber-600', borderClass: 'border-amber-300' };
                  const livApprovalSteps = [
                    { key: 'liv-jd-wait', label: 'รอใจดี', count: livJdWait.length, value: livJdWait.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-amber-600', borderClass: 'border-amber-300' },
                    { key: 'liv-jd-result', label: 'ใจดีแจ้งผล', count: livJdResult.length, value: livJdResult.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-amber-600', borderClass: 'border-amber-300' },
                    { key: 'liv-contract', label: 'สัญญา', count: livContract.length, value: livContract.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-amber-700', borderClass: 'border-amber-400' },
                  ];
                  const livContractSteps = [
                    { key: 'liv-preparing', label: 'เตรียมห้อง', count: livPreparing.length, value: livPreparing.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-amber-600', borderClass: 'border-amber-300' },
                  ];
                  const livEndSteps = [
                    { key: 'liv-inspect', label: 'ตรวจรับ', count: livInspecting.length, value: livInspecting.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-amber-600', borderClass: 'border-amber-300' },
                    { key: 'liv-movein', label: 'เข้าอยู่', count: livMoveIn.length, value: livMoveIn.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-emerald-600', borderClass: 'border-emerald-400' },
                  ];

                  // Row 5: Pre-LivNex (เช่า) - same structure as Livnex
                  const preLivnexBookings = globalFilteredBookings.filter(b => b.pre_livnex_contract_appointment_date || b.obj_purchase === 'ลงทุน');
                  const bookRent = preLivnexBookings.filter(b => !b.doc_bureau_date);
                  const bookRentNew = bookRent.filter(b => b.sale_type_flag === 'ขายใหม่');
                  const bookRentFromCancel = bookRent.filter(b => b.sale_type_flag === 'Re-sale');
                  const rentDocWait = preLivnexBookings.filter(b => b.doc_bureau_date && !b.doc_complete_bank_jd_date);
                  const rentContract = preLivnexBookings.filter(b => b.pre_livnex_contract_appointment_date && !b.livnex_contract_actual_date);
                  const rentInspecting = preLivnexBookings.filter(b => b.inspect1_appointment_date && !b.handover_accept_date);
                  const rentMoveIn = preLivnexBookings.filter(b => b.handover_accept_date);

                  // Pre-LivNex step arrays - white cards with sky border
                  const rentBookSteps = [
                    { key: 'rent-new', label: 'เช่าใหม่', count: bookRentNew.length, value: bookRentNew.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-sky-600', borderClass: 'border-sky-300' },
                    { key: 'rent-cancel', label: 'จาก Cancel', count: bookRentFromCancel.length, value: bookRentFromCancel.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-sky-500', borderClass: 'border-sky-200' },
                  ];
                  const rentDocWaitStep = { key: 'rent-doc-wait', label: 'เตรียมเอกสาร', count: rentDocWait.length, value: rentDocWait.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-sky-600', borderClass: 'border-sky-300' };
                  // Pre-LivNex middle section: สัญญาเช่า (wide) - sky
                  const rentContractStep = { key: 'rent-contract', label: 'สัญญาเช่า', count: rentContract.length, value: rentContract.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-sky-700', borderClass: 'border-sky-400' };
                  // Pre-LivNex end steps: ตรวจรับ, เข้าอยู่
                  const rentEndSteps = [
                    { key: 'rent-inspect', label: 'ตรวจรับ', count: rentInspecting.length, value: rentInspecting.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-sky-600', borderClass: 'border-sky-300' },
                    { key: 'rent-movein', label: 'เข้าอยู่', count: rentMoveIn.length, value: rentMoveIn.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-emerald-600', borderClass: 'border-emerald-400' },
                  ];

                  // Calculate percentages based on total backlog value
                  const totalBacklogValue = backlogValue || 1;
                  const getPct = (v: number) => ((v / totalBacklogValue) * 100).toFixed(1);

                  // Sales this month (ขายในเดือน) - filter by dec_period
                  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();
                  const salesThisMonth = globalFilteredBookings.filter(b =>
                    b.dec_period === currentMonth || b.dec_period === 'JAN' || b.dec_period === 'FEB'
                  );
                  const salesThisMonthValue = salesThisMonth.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);

                  return (
                    <>
                    {/* Main Pipeline Section */}
                    <div className="bg-teal-200 rounded-lg p-3 border border-teal-400">
                      <div className="text-xs font-semibold text-teal-900 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                        สินเชื่อ (Credit)
                      </div>
                      <div className="flex gap-2 items-stretch">
                        {/* Backlog & Sales - 2 rows */}
                      <div className="flex-1 flex flex-col gap-2">
                        {/* Row 1: Backlog */}
                        <div className="flex-1 flex items-center">
                          <div className="relative flex-1 h-full rounded-lg p-3 text-center bg-white border-2 border-teal-300 flex flex-col justify-center">
                            <div className="absolute top-1 right-1.5 text-[8px] font-bold text-teal-400">100%</div>
                            <div className="text-sm font-bold text-teal-700">฿{formatMoney(backlogValue)}</div>
                            <div className="text-[10px] font-medium text-teal-600">Backlog</div>
                            <div className="text-[9px] text-teal-500">{backlogCount} หลัง</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-teal-400 mx-1 flex-shrink-0" />
                        </div>
                        {/* Row 2: Sales This Month */}
                        <div className="flex-1 flex items-center">
                          <div className="relative flex-1 h-full rounded-lg p-3 text-center bg-white border-2 border-teal-300 flex flex-col justify-center">
                            <div className="text-sm font-bold text-teal-600">฿{formatMoney(salesThisMonthValue)}</div>
                            <div className="text-[10px] font-medium text-teal-600">ขายในเดือน</div>
                            <div className="text-[9px] text-teal-500">{salesThisMonth.length} หลัง</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-teal-400 mx-1 flex-shrink-0" />
                        </div>
                      </div>

                      {/* Contract - spans 2 rows (Credit + Inspection) */}
                      <div className="flex items-center flex-1">
                        <div className="relative rounded-lg p-4 text-center bg-white border-2 border-teal-400 w-full h-full flex flex-col justify-center">
                          <div className="absolute top-1 right-1.5 text-[8px] font-bold text-teal-400">{getPct(contractStageData?.value ?? 0)}%</div>
                          <div className="text-base font-bold text-teal-700">฿{formatMoney(contractStageData?.value ?? 0)}</div>
                          <div className="text-sm font-medium text-teal-600">Contract</div>
                          <div className="text-xs text-teal-500">{contractStageData?.count ?? 0} หลัง</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-teal-400 mx-1 flex-shrink-0" />
                      </div>

                      {/* Two rows section - 3 columns grid, stretch to fill height */}
                      <div className="flex-[3] flex flex-col gap-2">
                        {/* Row 1: Credit Flow - flex-1 to stretch */}
                        <div className="flex-1 flex items-stretch gap-2">
                          <div className="text-[10px] font-medium text-teal-700 w-12 flex items-center">สินเชื่อ</div>
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            {creditSteps.map((step) => {
                              const count = step.count ?? 0;
                              const value = step.value ?? 0;
                              return (
                                <div key={step.key} className={`relative rounded-lg p-2 text-center border-2 flex flex-col justify-center ${step.bgClass} ${step.borderClass}`}>
                                  <div className="absolute top-1 right-1.5 text-[8px] font-bold text-teal-400">{getPct(value)}%</div>
                                  <div className={`text-sm font-bold ${step.textClass}`}>฿{formatMoney(value)}</div>
                                  <div className="text-[10px] font-medium text-teal-800">{step.label}</div>
                                  <div className="text-[9px] text-teal-600">{count} หลัง</div>
                                </div>
                              );
                            })}
                          </div>
                          <ChevronRight className="w-4 h-4 text-teal-400 mx-1 flex-shrink-0 self-center" />
                        </div>

                        {/* Row 2: Inspection Flow - flex-1 to stretch */}
                        <div className="flex-1 flex items-stretch gap-2">
                          <div className="text-[10px] font-medium text-teal-700 w-12 flex items-center">ตรวจรับ</div>
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            {inspSteps.map((step) => (
                              <div key={step.key} className={`relative rounded-lg p-2 text-center border-2 flex flex-col justify-center ${step.bgClass} ${step.borderClass}`}>
                                <div className="absolute top-1 right-1.5 text-[8px] font-bold text-teal-400">{getPct(step.value)}%</div>
                                <div className={`text-sm font-bold ${step.textClass}`}>฿{formatMoney(step.value)}</div>
                                <div className="text-[10px] font-medium text-teal-800">{step.label}</div>
                                <div className="text-[9px] text-teal-600">{step.count} หลัง</div>
                              </div>
                            ))}
                          </div>
                          <ChevronRight className="w-4 h-4 text-teal-400 mx-1 flex-shrink-0 self-center" />
                        </div>
                      </div>

                      {/* Ready - spans 2 rows - green border for success */}
                      <div className="flex items-center flex-1">
                        <div className="relative rounded-lg p-4 text-center bg-white border-2 border-emerald-400 w-full h-full flex flex-col justify-center">
                          <div className="absolute top-1 right-1.5 text-[8px] font-bold text-slate-400">{getPct(readyStageData?.value ?? 0)}%</div>
                          <div className="text-base font-bold text-emerald-600">฿{formatMoney(readyStageData?.value ?? 0)}</div>
                          <div className="text-sm font-medium text-slate-600">Ready</div>
                          <div className="text-xs text-slate-500">{readyStageData?.count ?? 0} หลัง</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0" />
                      </div>

                      {/* Transferred - spans 2 rows - green border for success */}
                      <div className="flex items-center flex-1">
                        <div className="relative rounded-lg p-4 text-center bg-emerald-50 border-2 border-emerald-500 w-full h-full flex flex-col justify-center">
                          <div className="absolute top-1 right-1.5 text-[8px] font-bold text-slate-400">{getPct(transferredStageData?.value ?? 0)}%</div>
                          <div className="text-base font-bold text-emerald-600">฿{formatMoney(transferredStageData?.value ?? 0)}</div>
                          <div className="text-sm font-medium text-slate-600">Transferred</div>
                          <div className="text-xs text-slate-500">{transferredStageData?.count ?? 0} หลัง</div>
                        </div>
                      </div>
                    </div>

                    {/* Cancelled Row - Matches exact structure above */}
                    <div className="flex gap-2 items-stretch mt-2">
                      {/* Spacer for Backlog/Sales column */}
                      <div className="flex-1" />

                      {/* Spacer for Contract column */}
                      <div className="flex items-center flex-1">
                        <div className="w-full" />
                        <ChevronRight className="w-4 h-4 text-transparent mx-1 flex-shrink-0" />
                      </div>

                      {/* Cancelled box - same grid structure as above */}
                      <div className="flex-[3]">
                        <div className="flex items-stretch gap-2">
                          <div className="text-[10px] font-medium text-red-500 w-12 flex items-center">ยกเลิก</div>
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            {/* Cancelled spans all 3 columns */}
                            <div className="col-span-3 relative rounded-lg p-2 text-center border-2 border-red-300 bg-white">
                              <div className="text-sm font-bold text-red-500">฿{formatMoney(cancelledValue)}</div>
                              <div className="text-[10px] font-medium text-slate-600">Cancelled</div>
                              <div className="text-[9px] text-slate-500">{cancelledData.length} หลัง</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-transparent mx-1 flex-shrink-0 self-center" />
                        </div>
                      </div>

                      {/* Spacer for Ready column */}
                      <div className="flex items-center flex-1">
                        <div className="w-full" />
                        <ChevronRight className="w-4 h-4 text-transparent mx-1 flex-shrink-0" />
                      </div>

                      {/* Spacer for Transferred column */}
                      <div className="flex-1" />
                      </div>
                    </div>

                    {/* Livnex Section with background */}
                    <div className="bg-amber-100 rounded-lg p-3 mt-3 border border-amber-300">
                      <div className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                        Livnex (เช่าซื้อ)
                      </div>
                      <div className="flex gap-2 items-stretch">
                      {/* Book-Liv column - 2 cards stacked, equal height */}
                      <div className="flex-1 flex items-stretch">
                        <div className="flex-1 flex flex-col gap-2">
                          {livBookSteps.map((step) => (
                            <div key={step.key} className={`relative basis-1/2 rounded-lg p-2 text-center border-2 flex flex-col justify-center ${step.bgClass} ${step.borderClass}`}>
                              <div className={`text-sm font-bold ${step.textClass}`}>฿{formatMoney(step.value)}</div>
                              <div className="text-[10px] font-medium text-slate-700">{step.label}</div>
                              <div className="text-[9px] text-slate-500">{step.count} หลัง</div>
                            </div>
                          ))}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0 self-center" />
                      </div>

                      {/* รอเอกสาร - aligns with Contract column */}
                      <div className="flex items-stretch flex-1">
                        <div className={`relative rounded-lg p-4 text-center border-2 w-full h-full flex flex-col justify-center ${livDocWaitStep.bgClass} ${livDocWaitStep.borderClass}`}>
                          <div className="absolute top-1 right-1.5 text-[8px] font-bold text-slate-400">{getPct(livDocWaitStep.value)}%</div>
                          <div className={`text-base font-bold ${livDocWaitStep.textClass}`}>฿{formatMoney(livDocWaitStep.value)}</div>
                          <div className="text-sm font-medium text-slate-700">{livDocWaitStep.label}</div>
                          <div className="text-xs text-slate-500">{livDocWaitStep.count} หลัง</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0 self-center" />
                      </div>

                      {/* Livnex middle - 2 rows */}
                      <div className="flex-[3] flex flex-col gap-2">
                        {/* Row 1: ใจดี approval - 2 columns (รอใจดี, ใจดีแจ้งผล) */}
                        <div className="flex items-stretch gap-2">
                          <div className="text-[10px] font-medium text-amber-600 w-12 flex items-center">ใจดี</div>
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            {livApprovalSteps.map((step) => (
                              <div key={step.key} className={`relative rounded-lg p-2 text-center border-2 flex flex-col justify-center ${step.bgClass} ${step.borderClass}`}>
                                <div className="absolute top-1 right-1.5 text-[8px] font-bold text-slate-400">{getPct(step.value)}%</div>
                                <div className={`text-sm font-bold ${step.textClass}`}>฿{formatMoney(step.value)}</div>
                                <div className="text-[10px] font-medium text-slate-700">{step.label}</div>
                                <div className="text-[9px] text-slate-500">{step.count} หลัง</div>
                              </div>
                            ))}
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0 self-center" />
                        </div>

                        {/* Row 2: Contract flow */}
                        <div className="flex items-stretch gap-2">
                          <div className="text-[10px] font-medium text-amber-700 w-12 flex items-center">Livnex</div>
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            {livContractSteps.map((step) => (
                              <div key={step.key} className={`col-span-3 relative rounded-lg p-2 text-center border-2 flex flex-col justify-center ${step.bgClass} ${step.borderClass}`}>
                                <div className="absolute top-1 right-1.5 text-[8px] font-bold text-slate-400">{getPct(step.value)}%</div>
                                <div className={`text-sm font-bold ${step.textClass}`}>฿{formatMoney(step.value)}</div>
                                <div className="text-[10px] font-medium text-slate-700">{step.label}</div>
                                <div className="text-[9px] text-slate-500">{step.count} หลัง</div>
                              </div>
                            ))}
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0 self-center" />
                        </div>
                      </div>

                      {/* End steps: ตรวจรับ, เข้าอยู่ */}
                      {livEndSteps.map((step, idx) => (
                        <div key={step.key} className="flex items-stretch flex-1">
                          <div className={`relative rounded-lg p-2 text-center border-2 w-full flex flex-col justify-center ${step.bgClass} ${step.borderClass}`}>
                            <div className="absolute top-1 right-1.5 text-[8px] font-bold text-slate-400">{getPct(step.value)}%</div>
                            <div className={`text-sm font-bold ${step.textClass}`}>฿{formatMoney(step.value)}</div>
                            <div className="text-[10px] font-medium text-slate-700">{step.label}</div>
                            <div className="text-[9px] text-slate-500">{step.count} หลัง</div>
                          </div>
                          {idx < livEndSteps.length - 1 && <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0 self-center" />}
                        </div>
                      ))}
                      </div>
                    </div>

                    {/* Rentnex Section with background */}
                    <div className="bg-sky-100 rounded-lg p-3 mt-3 border border-sky-300">
                      <div className="text-xs font-semibold text-sky-800 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                        Rentnex (เช่า)
                      </div>
                      <div className="flex gap-2 items-stretch">
                        {/* Book-Rent column - 2 cards stacked, equal height */}
                      <div className="flex-1 flex items-stretch">
                        <div className="flex-1 flex flex-col gap-2">
                          {rentBookSteps.map((step) => (
                            <div key={step.key} className={`relative basis-1/2 rounded-lg p-2 text-center border-2 flex flex-col justify-center ${step.bgClass} ${step.borderClass}`}>
                              <div className={`text-sm font-bold ${step.textClass}`}>฿{formatMoney(step.value)}</div>
                              <div className="text-[10px] font-medium text-slate-700">{step.label}</div>
                              <div className="text-[9px] text-slate-500">{step.count} หลัง</div>
                            </div>
                          ))}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0 self-center" />
                      </div>

                      {/* เตรียมเอกสาร - aligns with Contract column */}
                      <div className="flex items-stretch flex-1">
                        <div className={`relative rounded-lg p-4 text-center border-2 w-full h-full flex flex-col justify-center ${rentDocWaitStep.bgClass} ${rentDocWaitStep.borderClass}`}>
                          <div className="absolute top-1 right-1.5 text-[8px] font-bold text-slate-400">{getPct(rentDocWaitStep.value)}%</div>
                          <div className={`text-base font-bold ${rentDocWaitStep.textClass}`}>฿{formatMoney(rentDocWaitStep.value)}</div>
                          <div className="text-sm font-medium text-slate-700">{rentDocWaitStep.label}</div>
                          <div className="text-xs text-slate-500">{rentDocWaitStep.count} หลัง</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0 self-center" />
                      </div>

                      {/* Rentnex middle - สัญญาเช่า (wide) */}
                      <div className="flex-[3] flex items-stretch gap-2">
                        <div className="text-[10px] font-medium text-sky-600 w-12 flex items-center">Rentnex</div>
                        <div className={`flex-1 relative rounded-lg p-4 text-center border-2 flex flex-col justify-center ${rentContractStep.bgClass} ${rentContractStep.borderClass}`}>
                          <div className="absolute top-1 right-1.5 text-[8px] font-bold text-slate-400">{getPct(rentContractStep.value)}%</div>
                          <div className={`text-base font-bold ${rentContractStep.textClass}`}>฿{formatMoney(rentContractStep.value)}</div>
                          <div className="text-sm font-medium text-slate-700">{rentContractStep.label}</div>
                          <div className="text-xs text-slate-500">{rentContractStep.count} หลัง</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0 self-center" />
                      </div>

                      {/* End steps: ตรวจรับ, เข้าอยู่ (align with Livnex) */}
                      {rentEndSteps.map((step, idx) => (
                        <div key={step.key} className="flex items-stretch flex-1">
                          <div className={`relative rounded-lg p-2 text-center border-2 w-full flex flex-col justify-center ${step.bgClass} ${step.borderClass}`}>
                            <div className="absolute top-1 right-1.5 text-[8px] font-bold text-slate-400">{getPct(step.value)}%</div>
                            <div className={`text-sm font-bold ${step.textClass}`}>฿{formatMoney(step.value)}</div>
                            <div className="text-[10px] font-medium text-slate-700">{step.label}</div>
                            <div className="text-[9px] text-slate-500">{step.count} หลัง</div>
                          </div>
                          {idx < rentEndSteps.length - 1 && <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0 self-center" />}
                        </div>
                      ))}
                      </div>
                    </div>
                    </>
                  );
                })()}
              </div>

              {/* Backlog Aging Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="mb-4">
                  <h2 className="font-semibold text-slate-900">Backlog Aging</h2>
                  <p className="text-xs text-slate-500">จำนวน Booking ตาม Aging (นับจากวันจอง)</p>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={(() => {
                      const activeBookings = globalFilteredBookings.filter(b =>
                        b.stage !== 'transferred' && b.stage !== 'cancelled'
                      );
                      const ranges = [
                        { range: '0-15', min: 0, max: 15, color: '#10b981' },
                        { range: '16-30', min: 16, max: 30, color: '#3b82f6' },
                        { range: '31-45', min: 31, max: 45, color: '#f59e0b' },
                        { range: '46-60', min: 46, max: 60, color: '#f97316' },
                        { range: '61-90', min: 61, max: 90, color: '#ef4444' },
                        { range: '90+', min: 91, max: 9999, color: '#dc2626' },
                      ];
                      return ranges.map(r => {
                        const matchingBookings = activeBookings.filter(b => b.aging_days >= r.min && b.aging_days <= r.max);
                        const value = matchingBookings.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);
                        // Format value in millions (M) for compact display
                        const valueInM = value / 1000000;
                        const valueLabel = valueInM >= 1 ? `${valueInM.toFixed(1)}M` : formatMoney(value);
                        return {
                          range: r.range,
                          count: matchingBookings.length,
                          value,
                          color: r.color,
                          countLabel: matchingBookings.length,
                          valueLabel: valueLabel,
                        };
                      });
                    })()}
                    margin={{ top: 40, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border border-slate-200 rounded shadow-lg text-xs">
                              <p className="font-semibold text-slate-900">{payload[0].payload.range} วัน</p>
                              <p style={{ color: payload[0].payload.color }}>{payload[0].value} รายการ</p>
                              <p className="text-slate-600">มูลค่า: {formatMoney(payload[0].payload.value)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      <LabelList
                        dataKey="countLabel"
                        position="top"
                        fontSize={10}
                        fill="#334155"
                        offset={18}
                        formatter={(v) => typeof v === 'number' ? `${v} หลัง` : ''}
                      />
                      <LabelList
                        dataKey="valueLabel"
                        position="top"
                        fontSize={9}
                        fill="#64748b"
                        offset={5}
                      />
                      {(() => {
                        const ranges = [
                          { color: '#10b981' },
                          { color: '#3b82f6' },
                          { color: '#f59e0b' },
                          { color: '#f97316' },
                          { color: '#ef4444' },
                          { color: '#dc2626' },
                        ];
                        return ranges.map((r, index) => (
                          <Cell key={`cell-${index}`} fill={r.color} />
                        ));
                      })()}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Blocked Items */}
              <div className="bg-white rounded-xl border border-red-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    รายการติดปัญหา ({blockedBookings.length})
                  </h2>
                  <button
                    onClick={() => setCurrentView('blocked')}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    ดูทั้งหมด →
                  </button>
                </div>
                {blockedBookings.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3 max-h-64 overflow-auto">
                    {blockedBookings.slice(0, 8).map(booking => (
                      <div
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-900">{booking.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800">
                            {booking.aging_days} วัน
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 mb-1 truncate">{booking.customer_name}</div>
                        <div className="text-sm text-red-700 font-medium truncate">{booking.current_blocker}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    <div>ไม่มีรายการติดปัญหา</div>
                  </div>
                )}
              </div>

              {/* Aging Overview */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Aging Overview - Active Bookings</h2>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: '0-15 วัน', min: 0, max: 15, color: 'emerald' },
                    { label: '16-30 วัน', min: 16, max: 30, color: 'blue' },
                    { label: '31-45 วัน', min: 31, max: 45, color: 'amber' },
                    { label: '45+ วัน', min: 46, max: 9999, color: 'red' },
                  ].map(range => {
                    const activeOnly = globalFilteredBookings.filter(b =>
                      b.stage !== 'transferred' && b.stage !== 'cancelled'
                    );
                    const count = activeOnly.filter(b =>
                      b.aging_days >= range.min && b.aging_days <= range.max
                    ).length;
                    const percentage = activeOnly.length > 0
                      ? ((count / activeOnly.length) * 100).toFixed(0)
                      : '0';

                    return (
                      <div key={range.label} className={`p-4 rounded-lg bg-${range.color}-50 border border-${range.color}-200`}>
                        <div className={`text-2xl font-bold text-${range.color}-600`}>{count}</div>
                        <div className="text-sm text-slate-700 mt-1">{range.label}</div>
                        <div className="text-xs text-slate-500 mt-1">{percentage}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team Workload Tracking */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">งานค้างแต่ละทีม</h2>
                <div className="space-y-3">
                  {filteredSummary.byTeam.map(item => {
                    const teamBlockedCount = blockedBookings.filter(b => b.current_owner_team === item.team).length;
                    return (
                      <div key={item.team} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: TEAM_CONFIG[item.team]?.color ?? '#64748b' }}
                        />
                        <span className="text-sm font-medium text-slate-700 w-24">{TEAM_CONFIG[item.team]?.label ?? item.team}</span>
                        <div className="flex-1">
                          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min((item.count / Math.max(filteredSummary.activeBookings, 1)) * 100, 100)}%`,
                                backgroundColor: TEAM_CONFIG[item.team]?.color ?? '#64748b'
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <span className="text-lg font-bold text-slate-900">{item.count}</span>
                          <span className="text-sm text-slate-500 ml-2">รายการ</span>
                          {teamBlockedCount > 0 && (
                            <span className="text-xs text-red-600 ml-2">({teamBlockedCount} ติดปัญหา)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* After Transfer Tasks */}
              <div className="grid grid-cols-3 gap-4">
                {/* เงินทอน */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-amber-500" />
                    เงินทอน
                  </h3>
                  <div className="space-y-2">
                    {['ค้างจ่าย', 'รอดำเนินการ'].map(status => {
                      const count = globalFilteredBookings.filter(b =>
                        b.stage === 'transferred' &&
                        b.refund_status === status
                      ).length;
                      return (
                        <div key={status} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-700">{status}</span>
                          <span className="text-lg font-bold text-amber-600">{count}</span>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-sm font-medium text-amber-700">รวมค้าง</span>
                      <span className="text-lg font-bold text-amber-600">
                        {globalFilteredBookings.filter(b =>
                          b.stage === 'transferred' &&
                          b.refund_status &&
                          b.refund_status !== 'ไม่มี' &&
                          b.refund_status !== 'จ่ายแล้ว'
                        ).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* มิเตอร์ */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    มิเตอร์น้ำ-ไฟ
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">รอเปลี่ยนมิเตอร์น้ำ</span>
                      <span className="text-lg font-bold text-blue-600">
                        {globalFilteredBookings.filter(b => b.stage === 'transferred' && !b.water_meter_change_date).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">รอเปลี่ยนมิเตอร์ไฟ</span>
                      <span className="text-lg font-bold text-blue-600">
                        {globalFilteredBookings.filter(b => b.stage === 'transferred' && !b.electricity_meter_change_date).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-blue-700">รวมค้าง</span>
                      <span className="text-lg font-bold text-blue-600">
                        {globalFilteredBookings.filter(b =>
                          b.stage === 'transferred' &&
                          (!b.water_meter_change_date || !b.electricity_meter_change_date)
                        ).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ของแถม */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    ของแถม / เอกสาร
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">รอส่งมอบเอกสาร</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {globalFilteredBookings.filter(b => b.stage === 'transferred' && !b.handover_document_received_date).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-sm font-medium text-emerald-700">รวมค้าง</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {globalFilteredBookings.filter(b => b.stage === 'transferred' && !b.handover_document_received_date).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== PIPELINE VIEW ========== */}
          {currentView === 'pipeline' && (
            <div className="space-y-6">
              {/* Pipeline Cards */}
              <div className="grid grid-cols-6 gap-4">
                {filteredSummary.byStage.filter(s => s.stage !== 'cancelled').map((item) => (
                  <div
                    key={item.stage}
                    onClick={() => { setCurrentView('list'); setStageFilter(item.stage); }}
                    className="bg-white rounded-xl border-2 p-5 cursor-pointer hover:shadow-lg transition"
                    style={{ borderColor: STAGE_CONFIG[item.stage]?.color ?? '#e2e8f0' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: STAGE_CONFIG[item.stage]?.color ?? '#64748b' }}
                      />
                      <span className="text-xs text-slate-500">
                        {((item.count / Math.max(filteredSummary.activeBookings, 1)) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div
                      className="text-3xl font-bold mb-1"
                      style={{ color: STAGE_CONFIG[item.stage]?.color ?? '#475569' }}
                    >
                      {item.count}
                    </div>
                    <div className="text-sm font-medium text-slate-700">{STAGE_CONFIG[item.stage]?.label ?? item.stage}</div>
                    <div className="text-xs text-slate-500 mt-1">฿{formatMoney(item.value)}</div>
                  </div>
                ))}
              </div>

              {/* Stage Details */}
              {Object.entries(STAGE_CONFIG).filter(([key]) => key !== 'cancelled').map(([stage, config]) => {
                const stageBookings = globalFilteredBookings.filter(b => b.stage === stage);
                if (stageBookings.length === 0) return null;
                return (
                  <div key={stage} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div
                      className="px-5 py-3 flex items-center gap-3"
                      style={{ backgroundColor: config.bg }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                      <h3 className="font-semibold" style={{ color: config.color }}>{config.label}</h3>
                      <span className="text-sm text-slate-500">({stageBookings.length} รายการ)</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {stageBookings.slice(0, 5).map(booking => (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-teal-600">{booking.id}</span>
                            <span className="text-slate-700">{booking.customer_name}</span>
                            <span className="text-slate-500 text-sm">{booking.project_name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold">฿{formatMoney(booking.net_contract_value)}</span>
                            <span className={`text-sm ${booking.aging_days > 45 ? 'text-red-600' : booking.aging_days > 30 ? 'text-amber-600' : 'text-slate-500'}`}>
                              {booking.aging_days} วัน
                            </span>
                          </div>
                        </div>
                      ))}
                      {stageBookings.length > 5 && (
                        <div
                          onClick={() => { setCurrentView('list'); setStageFilter(stage as Stage); }}
                          className="px-5 py-2 text-center text-sm text-teal-600 hover:bg-indigo-50 cursor-pointer"
                        >
                          ดูทั้งหมด {stageBookings.length} รายการ →
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========== BLOCKED VIEW ========== */}
          {currentView === 'blocked' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <div>
                  <div className="font-semibold text-amber-800">รายการติดปัญหา</div>
                  <div className="text-sm text-amber-600">รวม {blockedBookings.length} รายการที่ต้องแก้ไข</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {blockedBookings.map(booking => (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md hover:border-amber-300 transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-900">{booking.id}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                        {booking.aging_days} วัน
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-900 mb-1">{booking.customer_name}</div>
                    <div className="text-sm text-slate-500 mb-3">{booking.project_name} • {booking.unit_no}</div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-3">
                      <div className="text-sm font-medium text-amber-800">{booking.current_blocker}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: (TEAM_CONFIG[booking.current_owner_team]?.color ?? '#64748b') + '20',
                          color: TEAM_CONFIG[booking.current_owner_team]?.color ?? '#64748b'
                        }}
                      >
                        {TEAM_CONFIG[booking.current_owner_team]?.label ?? booking.current_owner_team}
                      </span>
                      <span className="font-semibold text-slate-900">฿{formatMoney(booking.net_contract_value)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {blockedBookings.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                  <div className="font-medium">ไม่มีรายการติดปัญหา</div>
                </div>
              )}
            </div>
          )}

          {/* ========== LIST VIEW ========== */}
          {(currentView === 'list' || currentView === 'after-transfer' || currentView === 'refund' || currentView === 'meter' || currentView === 'freebie' || currentView === 'pending-work') && (
            <div>
              {/* Booking Cards */}
              <div className="space-y-2">
                {filteredBookings.map(booking => (
                  <BookingListItem
                    key={booking.id}
                    booking={booking}
                    currentView={currentView}
                    onClick={() => setSelectedBooking(booking)}
                  />
                ))}
              </div>

              {filteredBookings.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center text-slate-500">
                  ไม่พบรายการที่ตรงกับเงื่อนไข
                </div>
              )}
            </div>
          )}

          {/* ========== TEAM VIEW ========== */}
          {currentView === 'team' && (
            <div className="space-y-4">
              {/* Team Tabs */}
              <div className="bg-white rounded-xl border border-slate-200 p-2 flex gap-2">
                {Object.entries(TEAM_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTeam(key as Team)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition
                      ${selectedTeam === key ? 'text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    style={selectedTeam === key ? { backgroundColor: config.color } : {}}
                  >
                    {config.label}
                    <span className="ml-2 opacity-75">({getBookingsByTeam(key as Team).length})</span>
                  </button>
                ))}
              </div>

              {/* Team Bookings */}
              <div className="grid grid-cols-3 gap-4">
                {teamBookings.map(booking => (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-900">{booking.id}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: STAGE_CONFIG[booking.stage]?.bg ?? '#f1f5f9',
                          color: STAGE_CONFIG[booking.stage]?.color ?? '#475569',
                        }}
                      >
                        {STAGE_CONFIG[booking.stage]?.label ?? booking.stage}
                      </span>
                    </div>
                    <div className="text-sm text-slate-900 font-medium mb-1">{booking.customer_name}</div>
                    <div className="text-sm text-slate-500 mb-3">{booking.project_name} • {booking.unit_no}</div>
                    <div className="text-lg font-bold text-slate-900 mb-3">฿{formatMoney(booking.net_contract_value)}</div>
                    {booking.current_blocker && (
                      <div className="p-2 bg-amber-50 rounded-lg mb-3">
                        <div className="text-xs font-medium text-amber-700">{booking.current_blocker}</div>
                      </div>
                    )}
                    {booking.next_action && (
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <div className="text-xs font-medium text-teal-700">{booking.next_action}</div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">{booking.aging_days} วัน</span>
                    </div>
                  </div>
                ))}
                {teamBookings.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-slate-500">
                    ไม่มีรายการสำหรับทีมนี้
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== CANCEL VIEWS ========== */}
          {(currentView === 'cancel-onprocess' || currentView === 'cancel-livnex' || currentView === 'cancel-pre-livnex' || currentView === 'cancel-actual') && (
            <div className="space-y-4">
              {/* Header Banner */}
              <div className={`rounded-xl p-4 flex items-center gap-3 ${
                currentView === 'cancel-onprocess' ? 'bg-amber-50 border border-amber-200' :
                currentView === 'cancel-livnex' ? 'bg-purple-50 border border-purple-200' :
                currentView === 'cancel-pre-livnex' ? 'bg-cyan-50 border border-cyan-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  currentView === 'cancel-onprocess' ? 'bg-amber-100' :
                  currentView === 'cancel-livnex' ? 'bg-purple-100' :
                  currentView === 'cancel-pre-livnex' ? 'bg-cyan-100' :
                  'bg-red-100'
                }`}>
                  {currentView === 'cancel-onprocess' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {currentView === 'cancel-livnex' && <ArrowUpRight className="w-5 h-5 text-purple-600" />}
                  {currentView === 'cancel-pre-livnex' && <ArrowUpRight className="w-5 h-5 text-cyan-600" />}
                  {currentView === 'cancel-actual' && <X className="w-5 h-5 text-red-600" />}
                </div>
                <div>
                  <div className={`font-semibold ${
                    currentView === 'cancel-onprocess' ? 'text-amber-800' :
                    currentView === 'cancel-livnex' ? 'text-purple-800' :
                    currentView === 'cancel-pre-livnex' ? 'text-cyan-800' :
                    'text-red-800'
                  }`}>
                    {currentView === 'cancel-onprocess' && 'Cancel - Onprocess'}
                    {currentView === 'cancel-livnex' && 'Cancel - ไป LivNex'}
                    {currentView === 'cancel-pre-livnex' && 'Cancel - ไป Pre-LivNex'}
                    {currentView === 'cancel-actual' && 'Cancel - ยกเลิกจริง'}
                  </div>
                  <div className={`text-sm ${
                    currentView === 'cancel-onprocess' ? 'text-amber-600' :
                    currentView === 'cancel-livnex' ? 'text-purple-600' :
                    currentView === 'cancel-pre-livnex' ? 'text-cyan-600' :
                    'text-red-600'
                  }`}>
                    {currentView === 'cancel-onprocess' && `${globalFilteredBookings.filter(b => b.cancel_flag && !b.livnex_cancel_date && !b.pre_livnex_cancel_date && b.stage !== 'cancelled').length} รายการกำลังดำเนินการยกเลิก`}
                    {currentView === 'cancel-livnex' && `${globalFilteredBookings.filter(b => b.livnex_cancel_date).length} รายการไปยัง LivNex`}
                    {currentView === 'cancel-pre-livnex' && `${globalFilteredBookings.filter(b => b.pre_livnex_cancel_date).length} รายการไปยัง Pre-LivNex`}
                    {currentView === 'cancel-actual' && `${globalFilteredBookings.filter(b => b.stage === 'cancelled').length} รายการยกเลิกจริง`}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ลูกค้า</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">โครงการ</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">มูลค่า</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                        {currentView === 'cancel-actual' ? 'วันที่ยกเลิก' : 'สถานะ'}
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">เหตุผล</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalFilteredBookings
                      .filter(b => {
                        if (currentView === 'cancel-onprocess') return b.cancel_flag && !b.livnex_cancel_date && !b.pre_livnex_cancel_date && b.stage !== 'cancelled';
                        if (currentView === 'cancel-livnex') return b.livnex_cancel_date;
                        if (currentView === 'cancel-pre-livnex') return b.pre_livnex_cancel_date;
                        if (currentView === 'cancel-actual') return b.stage === 'cancelled';
                        return false;
                      })
                      .map(booking => (
                        <tr
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                        >
                          <td className="px-4 py-3">
                            <span className="font-semibold text-teal-600">{booking.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{booking.customer_name}</div>
                            <div className="text-xs text-slate-500">{booking.customer_tel}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-900">{booking.project_name}</div>
                            <div className="text-xs text-slate-500">{booking.unit_no}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="font-semibold text-slate-900">฿{formatMoney(booking.net_contract_value)}</div>
                          </td>
                          <td className="px-4 py-3">
                            {currentView === 'cancel-actual' ? (
                              <span className="text-sm text-slate-600">{booking.cancel_date ?? '-'}</span>
                            ) : currentView === 'cancel-livnex' ? (
                              <span className="text-sm text-purple-600">{booking.livnex_cancel_date ?? '-'}</span>
                            ) : currentView === 'cancel-pre-livnex' ? (
                              <span className="text-sm text-cyan-600">{booking.pre_livnex_cancel_date ?? '-'}</span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                                กำลังดำเนินการ
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-600 truncate max-w-xs">
                              {currentView === 'cancel-livnex' ? booking.livnex_cancel_reason :
                               currentView === 'cancel-pre-livnex' ? booking.pre_livnex_cancel_reason :
                               booking.cancel_reason ?? '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {globalFilteredBookings.filter(b => {
                  if (currentView === 'cancel-onprocess') return b.cancel_flag && !b.livnex_cancel_date && !b.pre_livnex_cancel_date && b.stage !== 'cancelled';
                  if (currentView === 'cancel-livnex') return b.livnex_cancel_date;
                  if (currentView === 'cancel-pre-livnex') return b.pre_livnex_cancel_date;
                  if (currentView === 'cancel-actual') return b.stage === 'cancelled';
                  return false;
                }).length === 0 && (
                  <div className="px-6 py-12 text-center text-slate-500">
                    ไม่มีรายการ
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Panel */}
      {selectedBooking && (
        <BookingDetailPanel booking={selectedBooking} onClose={() => setSelectedBooking(null)} currentView={currentView} />
      )}
    </div>
  );
}

