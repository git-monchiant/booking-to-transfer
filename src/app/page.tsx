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
} from '@/data/bookings';
import { Sidebar, View } from '@/components/Sidebar';
import { SearchableSelect } from '@/components/SearchableSelect';
import { PerformanceCharts } from '@/components/PerformanceCharts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Banknote,
  ChevronRight,
  Search,
  Filter,
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
    bu: 'all' as string,
    project: 'all' as string,
    datePreset: 'all' as string,
    dateFrom: '' as string,
    dateTo: '' as string,
  });
  const [showGlobalFilter, setShowGlobalFilter] = useState(true);

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

  // Get unique values for filters
  const uniqueBUs = useMemo(() => Array.from(new Set(bookings.map(b => b.BUD).filter(Boolean))).sort(), []);
  const uniqueProjects = useMemo(() => Array.from(new Set(bookings.map(b => b.project_name))).sort(), []);

  const summary = useMemo(() => getSummary(), []);

  // Apply global filters first, then local filters
  const globalFilteredBookings = useMemo(() => {
    let result = [...bookings];
    if (globalFilters.bu !== 'all') {
      result = result.filter(b => b.BUD === globalFilters.bu);
    }
    if (globalFilters.project !== 'all') {
      result = result.filter(b => b.project_name === globalFilters.project);
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
    if (stageFilter !== 'all') {
      result = result.filter(b => b.stage === stageFilter);
    }
    return result;
  }, [globalFilteredBookings, searchQuery, stageFilter]);

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

    // Grade distribution (active only)
    const gradeGroups = (['A', 'B', 'C', 'D', 'F'] as const).map(grade => ({
      grade,
      count: active.filter(b => b.backlog_grade === grade).length,
      value: active.filter(b => b.backlog_grade === grade).reduce((sum, b) => sum + b.net_contract_value, 0),
    }));

    // Credit status distribution (active only)
    const creditStatuses = ['โอนสด', 'อนุมัติแล้ว', 'รอผล Bureau', 'รอเอกสาร'];
    const creditGroups = creditStatuses.map(status => ({
      status,
      count: active.filter(b => b.credit_status === status || (status === 'รอเอกสาร' && !creditStatuses.slice(0, 3).includes(b.credit_status))).length,
    }));

    // Transfer target status (active only)
    const transferTargetGroups = [
      { status: 'โอนเดือนนี้', count: active.filter(b => b.transfer_target_status === 'โอนเดือนนี้').length },
      { status: 'มีเงื่อนไข', count: active.filter(b => b.transfer_target_status === 'มีเงื่อนไขโอนเดือนอื่น').length },
      { status: 'อื่นๆ', count: active.filter(b => !['โอนเดือนนี้', 'มีเงื่อนไขโอนเดือนอื่น'].includes(b.transfer_target_status)).length },
    ];

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
      byGrade: gradeGroups,
      byCredit: creditGroups,
      byTransferTarget: transferTargetGroups,
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {(currentView === 'dashboard' || currentView === 'dashboard-performance') && 'Dashboard - Performance'}
              {currentView === 'dashboard-tracking' && 'Dashboard - Tracking'}
              {currentView === 'pipeline' && 'Pipeline'}
              {currentView === 'list' && (stageFilter === 'all' ? 'รายการ Booking ทั้งหมด' : `Booking - ${STAGE_CONFIG[stageFilter]?.label}`)}
              {currentView === 'blocked' && 'รายการติดปัญหา'}
              {currentView === 'team' && `ทีม ${TEAM_CONFIG[selectedTeam]?.label}`}
              {currentView === 'after-transfer' && 'After Transfer - ภาพรวม'}
              {currentView === 'refund' && 'คืนเงิน / Refund'}
              {currentView === 'meter' && 'เปลี่ยนมิเตอร์'}
              {currentView === 'freebie' && 'ของแถม'}
              {currentView === 'pending-work' && 'งานค้าง'}
              {currentView === 'cancel-onprocess' && 'Cancel - Onprocess'}
              {currentView === 'cancel-livnex' && 'Cancel - ไป LivNex'}
              {currentView === 'cancel-rentnex' && 'Cancel - ไป RentNex'}
              {currentView === 'cancel-actual' && 'Cancel - ยกเลิกจริง'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหา ID, ชื่อ, โครงการ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-9 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowGlobalFilter(!showGlobalFilter)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                showGlobalFilter || Object.values(globalFilters).some(v => v !== 'all')
                  ? 'bg-indigo-100 text-teal-700 border border-teal-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {Object.values(globalFilters).filter(v => v !== 'all').length > 0 && (
                <span className="bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {Object.values(globalFilters).filter(v => v !== 'all').length}
                </span>
              )}
            </button>
            <div className="text-sm text-slate-500">
              {new Date().toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </header>

        {/* Global Filter Panel */}
        {showGlobalFilter && (
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 uppercase">BU</label>
                <SearchableSelect
                  value={globalFilters.bu}
                  onChange={(value) => setGlobalFilters(prev => ({ ...prev, bu: value }))}
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    ...uniqueBUs.map(bu => ({ value: bu, label: bu })),
                  ]}
                  placeholder="เลือก BU"
                  className="w-48"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 uppercase">โครงการ</label>
                <SearchableSelect
                  value={globalFilters.project}
                  onChange={(value) => setGlobalFilters(prev => ({ ...prev, project: value }))}
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    ...uniqueProjects.map(p => ({ value: p, label: p })),
                  ]}
                  placeholder="เลือกโครงการ"
                  className="w-72"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 uppercase">ช่วงวันที่</label>
                <input
                  type="date"
                  value={globalFilters.dateFrom}
                  onChange={(e) => setGlobalFilters(prev => ({ ...prev, datePreset: 'custom', dateFrom: e.target.value }))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={globalFilters.dateTo}
                  onChange={(e) => setGlobalFilters(prev => ({ ...prev, datePreset: 'custom', dateTo: e.target.value }))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {[
                  { value: 'ytd', label: 'YTD' },
                  { value: '3-months', label: '3 เดือน' },
                  { value: '6-months', label: '6 เดือน' },
                  { value: '1-year', label: '1 ปี' },
                  { value: 'all', label: 'ทั้งหมด' },
                ].map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => handleDatePresetChange(preset.value)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      globalFilters.datePreset === preset.value
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              {(globalFilters.bu !== 'all' || globalFilters.project !== 'all' || globalFilters.datePreset !== 'all') && (
                <button
                  onClick={() => setGlobalFilters({ bu: 'all', project: 'all', datePreset: 'all', dateFrom: '', dateTo: '' })}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                  ล้าง Filter
                </button>
              )}
              <div className="text-sm text-slate-500">
                แสดง {globalFilteredBookings.length} จาก {bookings.length} รายการ
              </div>
            </div>
          </div>
        )}

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

                {/* 6. RentNex - สีฟ้า */}
                {(() => {
                  const rentnexData = globalFilteredBookings.filter(b => b.rentnex_contract_appointment_date);
                  const value = rentnexData.reduce((sum, b) => sum + (b.net_contract_value || 0), 0);
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
                      <div className="text-xs font-medium text-slate-700">RentNex</div>
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

              {/* 4-Column Layout: Grade, Credit, Transfer Target, Team */}
              <div className="grid grid-cols-4 gap-4">
                {/* Grade Distribution */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="font-semibold text-slate-900 mb-4">Grade</h2>
                  <div className="space-y-2">
                    {filteredSummary.byGrade.map(item => (
                      <div key={item.grade} className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          item.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                          item.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                          item.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.grade}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{item.count} รายการ</span>
                            <span className="text-xs text-slate-500">฿{formatMoney(item.value)}</span>
                          </div>
                          <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.grade === 'A' ? 'bg-emerald-500' :
                                item.grade === 'B' ? 'bg-blue-500' :
                                item.grade === 'C' ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.max((item.count / Math.max(filteredSummary.activeBookings, 1)) * 100, 2)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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

                {/* Transfer Target */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="font-semibold text-slate-900 mb-4">เป้าโอน</h2>
                  <div className="space-y-3">
                    {filteredSummary.byTransferTarget.map(item => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'โอนเดือนนี้' ? 'bg-emerald-500' :
                            item.status === 'มีเงื่อนไข' ? 'bg-amber-500' :
                            'bg-slate-400'
                          }`} />
                          <span className="text-sm text-slate-700">{item.status}</span>
                        </div>
                        <span className={`text-lg font-bold ${
                          item.status === 'โอนเดือนนี้' ? 'text-emerald-600' :
                          item.status === 'มีเงื่อนไข' ? 'text-amber-600' :
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
              {/* Tracking KPI Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-amber-200 bg-amber-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-amber-700">รอดำเนินการ (Pipeline)</span>
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold text-amber-600">{filteredSummary.activeBookings}</div>
                  <div className="text-sm text-amber-600 mt-1">รายการ</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-red-200 bg-red-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-red-700">ติดปัญหา</span>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-3xl font-bold text-red-600">{blockedBookings.length}</div>
                  <div className="text-sm text-red-500 mt-1">รายการ</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-blue-200 bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-blue-700">รอโอนจริง (After Transfer)</span>
                    <ArrowUpRight className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {globalFilteredBookings.filter(b => b.transferred_actual_flag).length}
                  </div>
                  <div className="text-sm text-blue-500 mt-1">รายการ</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">Aging เฉลี่ย</span>
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{filteredSummary.avgAgingDays}</div>
                  <div className="text-sm text-slate-500 mt-1">วัน</div>
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
                  const bookLiv = livnexBookings.filter(b => !b.doc_submit_date);
                  const bookLivNew = bookLiv.filter(b => b.sale_type_flag === 'ขายใหม่');
                  const bookLivFromCancel = bookLiv.filter(b => b.sale_type_flag === 'Re-sale');
                  const livDocWait = livnexBookings.filter(b => b.doc_submit_date && !b.doc_complete_bank_jd_date);
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

                  // Row 5: Rentnex (เช่า) - same structure as Livnex
                  const rentnexBookings = globalFilteredBookings.filter(b => b.rentnex_contract_appointment_date || b.obj_purchase === 'ลงทุน');
                  const bookRent = rentnexBookings.filter(b => !b.doc_submit_date);
                  const bookRentNew = bookRent.filter(b => b.sale_type_flag === 'ขายใหม่');
                  const bookRentFromCancel = bookRent.filter(b => b.sale_type_flag === 'Re-sale');
                  const rentDocWait = rentnexBookings.filter(b => b.doc_submit_date && !b.doc_complete_bank_jd_date);
                  const rentContract = rentnexBookings.filter(b => b.rentnex_contract_appointment_date && !b.livnex_contract_actual_date);
                  const rentInspecting = rentnexBookings.filter(b => b.inspect1_appointment_date && !b.handover_accept_date);
                  const rentMoveIn = rentnexBookings.filter(b => b.handover_accept_date);

                  // Rentnex step arrays - white cards with sky border
                  const rentBookSteps = [
                    { key: 'rent-new', label: 'เช่าใหม่', count: bookRentNew.length, value: bookRentNew.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-sky-600', borderClass: 'border-sky-300' },
                    { key: 'rent-cancel', label: 'จาก Cancel', count: bookRentFromCancel.length, value: bookRentFromCancel.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-sky-500', borderClass: 'border-sky-200' },
                  ];
                  const rentDocWaitStep = { key: 'rent-doc-wait', label: 'เตรียมเอกสาร', count: rentDocWait.length, value: rentDocWait.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-sky-600', borderClass: 'border-sky-300' };
                  // Rentnex middle section: สัญญาเช่า (wide) - sky
                  const rentContractStep = { key: 'rent-contract', label: 'สัญญาเช่า', count: rentContract.length, value: rentContract.reduce((s, b) => s + (b.net_contract_value || 0), 0), bgClass: 'bg-white', textClass: 'text-sky-700', borderClass: 'border-sky-400' };
                  // Rentnex end steps: ตรวจรับ, เข้าอยู่
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
                        b.transferred_actual_flag &&
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
                          b.transferred_actual_flag &&
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
                        {globalFilteredBookings.filter(b => b.transferred_actual_flag && !b.water_meter_change_date).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">รอเปลี่ยนมิเตอร์ไฟ</span>
                      <span className="text-lg font-bold text-blue-600">
                        {globalFilteredBookings.filter(b => b.transferred_actual_flag && !b.electricity_meter_change_date).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-blue-700">รวมค้าง</span>
                      <span className="text-lg font-bold text-blue-600">
                        {globalFilteredBookings.filter(b =>
                          b.transferred_actual_flag &&
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
                        {globalFilteredBookings.filter(b => b.transferred_actual_flag && !b.handover_document_received_date).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-sm font-medium text-emerald-700">รวมค้าง</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {globalFilteredBookings.filter(b => b.transferred_actual_flag && !b.handover_document_received_date).length}
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
          {currentView === 'list' && (
            <div className="space-y-4">
              {/* Header with Filters */}
              <div className="bg-white rounded-xl border border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {stageFilter === 'all' ? 'All Bookings' : STAGE_CONFIG[stageFilter]?.label}
                    </h2>
                    <p className="text-sm text-slate-500">
                      แสดง {filteredBookings.length} จาก {globalFilteredBookings.length} รายการ
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ค้นหา ID, ชื่อ, โครงการ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-56 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <select
                      value={stageFilter}
                      onChange={(e) => setStageFilter(e.target.value as Stage | 'all')}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">ทุกสถานะ</option>
                      {Object.entries(STAGE_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => { setStageFilter('all'); setSearchQuery(''); }}
                      className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-indigo-50 rounded-lg transition whitespace-nowrap"
                    >
                      ดูทั้งหมด
                    </button>
                  </div>
                </div>
              </div>

              {/* Booking Cards - Compact */}
              <div className="space-y-2">
                {filteredBookings.map(booking => (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition"
                  >
                    <div className="flex items-stretch">
                      {/* Grade Indicator */}
                      <div className={`w-1 rounded-l-lg flex-shrink-0 ${
                        booking.backlog_grade === 'A' ? 'bg-emerald-500' :
                        booking.backlog_grade === 'B' ? 'bg-blue-500' :
                        booking.backlog_grade === 'C' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`} />

                      {/* Main Content */}
                      <div className="flex-1 px-4 py-3">
                        {/* Row 1: Header */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base text-teal-700">{booking.id}</span>
                            <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white ${
                              booking.backlog_grade === 'A' ? 'bg-emerald-500' :
                              booking.backlog_grade === 'B' ? 'bg-blue-500' :
                              booking.backlog_grade === 'C' ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}>{booking.backlog_grade}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{
                              backgroundColor: STAGE_CONFIG[booking.stage]?.bg ?? '#f1f5f9',
                              color: STAGE_CONFIG[booking.stage]?.color ?? '#475569',
                            }}>{STAGE_CONFIG[booking.stage]?.label ?? booking.stage}</span>
                            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
                              backgroundColor: (TEAM_CONFIG[booking.current_owner_team]?.color ?? '#64748b') + '20',
                              color: TEAM_CONFIG[booking.current_owner_team]?.color ?? '#64748b'
                            }}>{TEAM_CONFIG[booking.current_owner_team]?.label ?? booking.current_owner_team}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-base font-bold text-slate-900">฿{formatMoney(booking.net_contract_value)}</span>
                              <span className="text-xs text-slate-400 ml-1">Pro ฿{formatMoney(booking.pro_transfer_bonus)}</span>
                            </div>
                            <div className={`px-2 py-1 rounded flex items-center gap-1 ${
                              booking.aging_days > 45 ? 'bg-red-100' : booking.aging_days > 30 ? 'bg-amber-100' : 'bg-slate-100'
                            }`}>
                              <span className={`text-base font-bold ${
                                booking.aging_days > 45 ? 'text-red-600' : booking.aging_days > 30 ? 'text-amber-600' : 'text-slate-600'
                              }`}>{booking.aging_days}</span>
                              <span className="text-xs text-slate-500">วัน</span>
                            </div>
                          </div>
                        </div>

                        {/* Row 1.5: Column Headers */}
                        <div className="flex text-[10px] text-slate-400 font-bold uppercase mb-1">
                          <div className="w-[400px] shrink-0 pr-3 mr-3">
                            <span className="text-sm font-semibold text-slate-900 normal-case truncate">{booking.customer_name}</span>
                          </div>
                          <div className="w-[250px] shrink-0 pr-3 mr-3 flex justify-between">
                            <span>สินเชื่อ</span>
                            <span className={`font-semibold normal-case ${
                              booking.credit_status === 'อนุมัติแล้ว' || booking.credit_status === 'โอนสด' ? 'text-emerald-600' :
                              booking.credit_status === 'รอผล Bureau' ? 'text-amber-600' : 'text-slate-700'
                            }`}>{booking.credit_status}</span>
                          </div>
                          <div className="w-[250px] shrink-0 pr-3 mr-3 flex justify-between">
                            <span>ตรวจบ้าน</span>
                            <span className={`px-1.5 py-0.5 rounded font-semibold normal-case ${
                              booking.inspection_method === 'จ้างตรวจ' ? 'bg-violet-100 text-violet-600' : 'bg-sky-100 text-sky-600'
                            }`}>{booking.inspection_method || '-'}</span>
                          </div>
                          <div className="w-[250px] shrink-0 pr-3 mr-3">โอน</div>
                          <div className="flex-1">ติดตาม</div>
                        </div>

                        {/* Row 2: Content */}
                        <div className="flex text-xs">
                          {/* Col 1: Customer - fixed 400px */}
                          <div className="w-[400px] shrink-0 leading-snug border-r border-slate-200 pr-3 mr-3">
                            <div className="text-slate-600">{booking.customer_tel}</div>
                            <div className="text-slate-700 truncate">{booking.project_name}</div>
                            <div className="text-slate-500 truncate">Unit {booking.unit_no} • {booking.sale_name}</div>
                          </div>

                          {/* Col 2: Credit - fixed 250px */}
                          <div className="w-[250px] shrink-0 leading-snug border-r border-slate-200 pr-3 mr-3">
                            {/* ธนาคาร - แบ่ง 2 columns มีเส้นคั่น */}
                            {(() => {
                              const banks = booking.banks_submitted.filter(b => b.bank !== 'เงินสดใจดี');
                              const half = Math.ceil(banks.length / 2);
                              const col1 = banks.slice(0, half);
                              const col2 = banks.slice(half);
                              return (
                                <div className="flex gap-2 mt-0.5">
                                  {/* Column 1 */}
                                  <div className="flex-1 space-y-0">
                                    {col1.map((b, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-[11px]">
                                        <span className={`flex items-center gap-0.5 ${
                                          b.result === 'อนุมัติ' ? 'text-emerald-700' :
                                          b.result === 'ไม่อนุมัติ' ? 'text-red-600' :
                                          'text-slate-600'
                                        }`}>
                                          <span className={`w-3 h-3 rounded-sm flex items-center justify-center text-white text-[8px] ${
                                            b.result === 'อนุมัติ' ? 'bg-emerald-500' :
                                            b.result === 'ไม่อนุมัติ' ? 'bg-red-500' :
                                            'bg-slate-400'
                                          }`}>{b.result === 'อนุมัติ' ? '✓' : b.result === 'ไม่อนุมัติ' ? '✗' : '-'}</span>
                                          {b.bank}
                                        </span>
                                        <span className={`font-medium ${b.result === 'อนุมัติ' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                          {b.result === 'อนุมัติ' && b.approved_amount ? `${(b.approved_amount / 1000000).toFixed(1)}M` : '-'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  {/* Separator */}
                                  <div className="w-px bg-slate-200"></div>
                                  {/* Column 2 */}
                                  <div className="flex-1 space-y-0">
                                    {col2.map((b, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-[11px]">
                                        <span className={`flex items-center gap-0.5 ${
                                          b.result === 'อนุมัติ' ? 'text-emerald-700' :
                                          b.result === 'ไม่อนุมัติ' ? 'text-red-600' :
                                          'text-slate-600'
                                        }`}>
                                          <span className={`w-3 h-3 rounded-sm flex items-center justify-center text-white text-[8px] ${
                                            b.result === 'อนุมัติ' ? 'bg-emerald-500' :
                                            b.result === 'ไม่อนุมัติ' ? 'bg-red-500' :
                                            'bg-slate-400'
                                          }`}>{b.result === 'อนุมัติ' ? '✓' : b.result === 'ไม่อนุมัติ' ? '✗' : '-'}</span>
                                          {b.bank}
                                        </span>
                                        <span className={`font-medium ${b.result === 'อนุมัติ' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                          {b.result === 'อนุมัติ' && b.approved_amount ? `${(b.approved_amount / 1000000).toFixed(1)}M` : '-'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                            {/* เงินสดใจดี - ล่างสุด */}
                            {(() => {
                              const cash = booking.banks_submitted.find(b => b.bank === 'เงินสดใจดี');
                              return (
                                <div className={`mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] ${
                                  cash?.result === 'อนุมัติ' ? 'text-amber-700' :
                                  cash?.result === 'ไม่อนุมัติ' ? 'text-red-600' :
                                  'text-slate-500'
                                }`}>
                                  <span className="font-medium">เงินสดใจดี</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                    cash?.result === 'อนุมัติ' ? 'bg-amber-100 text-amber-700' :
                                    cash?.result === 'ไม่อนุมัติ' ? 'bg-red-100 text-red-600' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                    {cash?.result === 'อนุมัติ' ? '✓ อนุมัติ' : cash?.result === 'ไม่อนุมัติ' ? '✗ ไม่อนุมัติ' : 'รอผล'}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Col 3: Inspection - fixed 250px */}
                          <div className="w-[250px] shrink-0 leading-snug border-r border-slate-200 pr-3 mr-3">
                            {/* Table Header */}
                            <div className="flex text-[9px] text-slate-400 pb-0.5 border-b border-slate-100">
                              <div className="w-8">รอบ</div>
                              <div className="flex-1">วันที่</div>
                              <div className="w-14 text-right">สถานะ</div>
                            </div>
                            {/* Inspection Rows - แสดงจนกว่าจะผ่าน */}
                            {(() => {
                              const formatDate = (d: string | null) => d || '-';
                              const rows = [];
                              for (let round = 1; round <= 3; round++) {
                                const appointmentDate = booking[`inspect${round}_appointment_date` as keyof typeof booking] as string | null;
                                const actualDate = booking[`inspect${round}_actual_date` as keyof typeof booking] as string | null;
                                const readyDate = booking[`inspect${round}_ready_date` as keyof typeof booking] as string | null;
                                const nextAppointment = round < 3 ? booking[`inspect${round + 1}_appointment_date` as keyof typeof booking] as string | null : null;
                                const status = readyDate ? 'passed' : actualDate ? 'inprogress' : appointmentDate ? 'scheduled' : 'pending';
                                const statusText = status === 'passed' ? 'ผ่าน' : status === 'inprogress' ? 'ไม่ผ่าน' : status === 'scheduled' ? 'รอตรวจ' : '-';

                                // แสดงรอบนี้
                                rows.push(
                                  <div key={round} className="flex items-center text-[11px] py-0.5">
                                    <div className="w-8 font-medium text-slate-700">{round}</div>
                                    <div className="flex-1">
                                      {status === 'passed' ? (
                                        <span className="text-emerald-600">{formatDate(actualDate)}</span>
                                      ) : status === 'inprogress' ? (
                                        <span>
                                          <span className="text-red-500">{formatDate(actualDate)}</span>
                                          {nextAppointment && <span className="text-slate-400 ml-1">→ {formatDate(nextAppointment)}</span>}
                                        </span>
                                      ) : status === 'scheduled' ? (
                                        <span className="text-sky-500">{formatDate(appointmentDate)}</span>
                                      ) : (
                                        <span className="text-slate-400">-</span>
                                      )}
                                    </div>
                                    <div className={`w-14 text-right font-medium ${
                                      status === 'passed' ? 'text-emerald-600' :
                                      status === 'inprogress' ? 'text-red-500' :
                                      status === 'scheduled' ? 'text-sky-600' :
                                      'text-slate-400'
                                    }`}>{statusText}</div>
                                  </div>
                                );
                                // ถ้าผ่านแล้ว หยุดแสดงรอบถัดไป
                                if (status === 'passed') break;
                              }
                              return rows;
                            })()}
                            {/* Footer: ผู้จ้างตรวจ + สินค้า */}
                            <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              {booking.inspection_method === 'จ้างตรวจ' && booking.hired_inspector ? (
                                <span className="text-violet-600 truncate max-w-[160px]" title={booking.hired_inspector}>
                                  {booking.hired_inspector}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                              <span className={`font-medium ${booking.product_status === 'พร้อมโอน' ? 'text-emerald-600' : 'text-slate-600'}`}>
                                {booking.product_status}
                              </span>
                            </div>
                          </div>

                          {/* Col 4: Transfer - fixed 250px */}
                          <div className="w-[250px] shrink-0 leading-snug border-r border-slate-200 pr-3 mr-3">
                            <div><span className="text-slate-500">Target:</span> <span className="font-semibold text-slate-800">{booking.transfer_target_date || '-'}</span></div>
                            <div><span className="text-slate-500">นัด:</span> <span className="text-slate-700">{booking.transfer_appointment_date || '-'}</span></div>
                            <div className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5 ${
                              booking.transfer_target_status === 'โอนเดือนนี้' ? 'bg-emerald-100 text-emerald-700' :
                              booking.transfer_target_status === 'โอนแล้ว' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                            }`}>{booking.transfer_target_status}</div>
                          </div>

                          {/* Col 5: Action - flex เต็มพื้นที่ที่เหลือ */}
                          <div className="flex-1 min-w-0 leading-snug">
                            {booking.current_blocker ? (
                              <div className="p-1.5 bg-amber-50 rounded border border-amber-200 text-[11px]">
                                <span className="text-amber-600 font-medium">Blocker: </span>
                                <span className="text-amber-700">{booking.current_blocker}</span>
                              </div>
                            ) : booking.next_action ? (
                              <div className="p-1.5 bg-indigo-50 rounded border border-indigo-200 text-[11px]">
                                <span className="text-indigo-600 font-medium">Next: </span>
                                <span className="text-indigo-700">{booking.next_action}</span>
                              </div>
                            ) : (
                              <div className="text-slate-400">-</div>
                            )}
                            <div className="flex gap-1 mt-1">
                              <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${booking.call_customer_within_2_days === 'PASS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                โทร{booking.call_customer_within_2_days === 'PASS' ? '✓' : '✗'}
                              </span>
                              <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${booking.inspection_within_15_days === 'PASS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                ตรวจ{booking.inspection_within_15_days === 'PASS' ? '✓' : '✗'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        booking.backlog_grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                        booking.backlog_grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        booking.backlog_grade === 'C' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        Grade {booking.backlog_grade}
                      </span>
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

          {/* ========== AFTER TRANSFER LIST ========== */}
          {currentView === 'after-transfer' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Header with Filters */}
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">After Transfer</h2>
                    <p className="text-sm text-slate-500">
                      แสดง {globalFilteredBookings.filter(b => b.transferred_actual_flag).length} รายการที่โอนแล้ว
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ค้นหา ID, ชื่อ, โครงการ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-56 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">ลูกค้า</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">โครงการ</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">มูลค่า</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">คืนเงิน</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">มิเตอร์น้ำ</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">มิเตอร์ไฟ</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">เอกสาร</th>
                  </tr>
                </thead>
                <tbody>
                  {globalFilteredBookings
                    .filter(b => b.transferred_actual_flag)
                    .filter(b => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return b.id.toLowerCase().includes(q) ||
                        b.customer_name.toLowerCase().includes(q) ||
                        b.project_name.toLowerCase().includes(q);
                    })
                    .map(booking => (
                    <tr
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="px-6 py-3">
                        <span className="font-semibold text-teal-600">{booking.id}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-900">{booking.customer_name}</div>
                        <div className="text-xs text-slate-500">{booking.customer_tel}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm text-slate-900">{booking.project_name}</div>
                        <div className="text-xs text-slate-500">{booking.unit_no}</div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="font-semibold text-slate-900">฿{formatMoney(booking.net_contract_value)}</div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.refund_status === 'คืนแล้ว' ? 'bg-emerald-100 text-emerald-700' :
                          booking.refund_status === 'ไม่มี' ? 'bg-slate-100 text-slate-500' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.refund_status ?? '-'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`text-lg ${booking.water_meter_change_date ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {booking.water_meter_change_date ? '✓' : '○'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`text-lg ${booking.electricity_meter_change_date ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {booking.electricity_meter_change_date ? '✓' : '○'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`text-lg ${booking.handover_document_received_date ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {booking.handover_document_received_date ? '✓' : '○'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {globalFilteredBookings.filter(b => b.transferred_actual_flag).length === 0 && (
                <div className="px-5 py-12 text-center text-slate-500">ยังไม่มีรายการโอน</div>
              )}
            </div>
          )}

          {/* ========== REFUND VIEW ========== */}
          {currentView === 'refund' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <Wallet className="w-6 h-6 text-amber-500" />
                <div>
                  <div className="font-semibold text-amber-800">รายการคืนเงิน / Refund</div>
                  <div className="text-sm text-amber-600">รวม {globalFilteredBookings.filter(b => b.refund_status && b.refund_status !== 'ไม่มี').length} รายการ</div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ลูกค้า</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">จำนวนเงิน</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Aging</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">วันที่โอน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalFilteredBookings.filter(b => b.refund_status && b.refund_status !== 'ไม่มี').map(booking => (
                      <tr
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <span className="font-semibold text-teal-600">{booking.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{booking.customer_name}</div>
                          <div className="text-xs text-slate-500">{booking.project_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.refund_status === 'คืนแล้ว' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {booking.refund_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold">฿{formatMoney(booking.refund_amount ?? 0)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${(booking.refund_aging ?? 0) > 30 ? 'text-red-600' : 'text-slate-600'}`}>
                            {booking.refund_aging ?? '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {booking.refund_transfer_date ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========== METER VIEW ========== */}
          {currentView === 'meter' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-500" />
                <div>
                  <div className="font-semibold text-blue-800">เปลี่ยนมิเตอร์น้ำ / ไฟฟ้า</div>
                  <div className="text-sm text-blue-600">ติดตามสถานะการเปลี่ยนมิเตอร์</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {globalFilteredBookings.filter(b => b.transferred_actual_flag).map(booking => (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-slate-900">{booking.id}</span>
                      <span className="text-sm text-slate-500">{booking.customer_name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg ${booking.water_meter_change_date ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="text-xs text-slate-500 mb-1">มิเตอร์น้ำ</div>
                        <div className={`font-medium ${booking.water_meter_change_date ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {booking.water_meter_change_date ?? 'รอดำเนินการ'}
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${booking.electricity_meter_change_date ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="text-xs text-slate-500 mb-1">มิเตอร์ไฟฟ้า</div>
                        <div className={`font-medium ${booking.electricity_meter_change_date ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {booking.electricity_meter_change_date ?? 'รอดำเนินการ'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== CANCEL VIEWS ========== */}
          {(currentView === 'cancel-onprocess' || currentView === 'cancel-livnex' || currentView === 'cancel-rentnex' || currentView === 'cancel-actual') && (
            <div className="space-y-4">
              {/* Header Banner */}
              <div className={`rounded-xl p-4 flex items-center gap-3 ${
                currentView === 'cancel-onprocess' ? 'bg-amber-50 border border-amber-200' :
                currentView === 'cancel-livnex' ? 'bg-purple-50 border border-purple-200' :
                currentView === 'cancel-rentnex' ? 'bg-cyan-50 border border-cyan-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  currentView === 'cancel-onprocess' ? 'bg-amber-100' :
                  currentView === 'cancel-livnex' ? 'bg-purple-100' :
                  currentView === 'cancel-rentnex' ? 'bg-cyan-100' :
                  'bg-red-100'
                }`}>
                  {currentView === 'cancel-onprocess' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {currentView === 'cancel-livnex' && <ArrowUpRight className="w-5 h-5 text-purple-600" />}
                  {currentView === 'cancel-rentnex' && <ArrowUpRight className="w-5 h-5 text-cyan-600" />}
                  {currentView === 'cancel-actual' && <X className="w-5 h-5 text-red-600" />}
                </div>
                <div>
                  <div className={`font-semibold ${
                    currentView === 'cancel-onprocess' ? 'text-amber-800' :
                    currentView === 'cancel-livnex' ? 'text-purple-800' :
                    currentView === 'cancel-rentnex' ? 'text-cyan-800' :
                    'text-red-800'
                  }`}>
                    {currentView === 'cancel-onprocess' && 'Cancel - Onprocess'}
                    {currentView === 'cancel-livnex' && 'Cancel - ไป LivNex'}
                    {currentView === 'cancel-rentnex' && 'Cancel - ไป RentNex'}
                    {currentView === 'cancel-actual' && 'Cancel - ยกเลิกจริง'}
                  </div>
                  <div className={`text-sm ${
                    currentView === 'cancel-onprocess' ? 'text-amber-600' :
                    currentView === 'cancel-livnex' ? 'text-purple-600' :
                    currentView === 'cancel-rentnex' ? 'text-cyan-600' :
                    'text-red-600'
                  }`}>
                    {currentView === 'cancel-onprocess' && `${globalFilteredBookings.filter(b => b.cancel_flag && !b.livnex_cancel_date && !b.rentnex_cancel_date && b.stage !== 'cancelled').length} รายการกำลังดำเนินการยกเลิก`}
                    {currentView === 'cancel-livnex' && `${globalFilteredBookings.filter(b => b.livnex_cancel_date).length} รายการไปยัง LivNex`}
                    {currentView === 'cancel-rentnex' && `${globalFilteredBookings.filter(b => b.rentnex_cancel_date).length} รายการไปยัง RentNex`}
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
                        if (currentView === 'cancel-onprocess') return b.cancel_flag && !b.livnex_cancel_date && !b.rentnex_cancel_date && b.stage !== 'cancelled';
                        if (currentView === 'cancel-livnex') return b.livnex_cancel_date;
                        if (currentView === 'cancel-rentnex') return b.rentnex_cancel_date;
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
                            ) : currentView === 'cancel-rentnex' ? (
                              <span className="text-sm text-cyan-600">{booking.rentnex_cancel_date ?? '-'}</span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                                กำลังดำเนินการ
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-600 truncate max-w-xs">
                              {currentView === 'cancel-livnex' ? booking.livnex_cancel_reason :
                               currentView === 'cancel-rentnex' ? booking.rentnex_cancel_reason :
                               booking.cancel_reason ?? '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {globalFilteredBookings.filter(b => {
                  if (currentView === 'cancel-onprocess') return b.cancel_flag && !b.livnex_cancel_date && !b.rentnex_cancel_date && b.stage !== 'cancelled';
                  if (currentView === 'cancel-livnex') return b.livnex_cancel_date;
                  if (currentView === 'cancel-rentnex') return b.rentnex_cancel_date;
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
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedBooking(null)} />
          <div className="relative w-full max-w-3xl bg-white shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-slate-900">{selectedBooking.id}</div>
                  <div className="text-sm text-slate-500">{selectedBooking.project_name} • Unit {selectedBooking.unit_no}</div>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Status Bar - Always visible */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: STAGE_CONFIG[selectedBooking.stage]?.bg ?? '#f1f5f9', color: STAGE_CONFIG[selectedBooking.stage]?.color ?? '#475569' }}>
                  {STAGE_CONFIG[selectedBooking.stage]?.label ?? selectedBooking.stage}
                </span>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${selectedBooking.backlog_grade === 'A' ? 'bg-emerald-100 text-emerald-700' : selectedBooking.backlog_grade === 'B' ? 'bg-blue-100 text-blue-700' : selectedBooking.backlog_grade === 'C' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  Grade {selectedBooking.backlog_grade}
                </span>
                <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium">Aging: {selectedBooking.aging_days} วัน</span>
                {selectedBooking.livnex_able_status && (
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    selectedBooking.livnex_able_status === 'ได้' ? 'bg-emerald-100 text-emerald-700' :
                    selectedBooking.livnex_able_status === 'ไม่ได้' ? 'bg-red-100 text-red-700' :
                    selectedBooking.livnex_able_status === 'รอตรวจสอบ' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    LivNex Able: {selectedBooking.livnex_able_status}
                  </span>
                )}
                {selectedBooking.transferred_actual_flag && <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">โอนแล้ว ✓</span>}
              </div>

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* GROUP A: ข้อมูลพื้นฐาน */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <div className="border-l-4 border-indigo-500 pl-3 mb-1">
                    <h2 className="text-sm font-bold text-indigo-700">ข้อมูลพื้นฐาน</h2>
                  </div>

                  {/* Project & Unit */}
                  <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center text-xs font-bold text-indigo-600">1</div>
                      <h3 className="text-xs font-bold text-indigo-600 uppercase">โครงการ / ห้อง</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm">
                      <div className="col-span-2"><span className="text-slate-400">โครงการ:</span> <span className="font-medium text-slate-800">{selectedBooking.project_name}</span></div>
                      <div><span className="text-slate-400">รหัส:</span> <span className="font-medium">{selectedBooking.project_code}</span></div>
                      <div><span className="text-slate-400">No.:</span> <span className="font-medium">{selectedBooking.row_no}</span></div>
                      <div><span className="text-slate-400">โซน/อาคาร:</span> <span className="font-medium">{selectedBooking.building_zone}</span></div>
                      <div><span className="text-slate-400">เลขที่ห้อง:</span> <span className="font-semibold text-indigo-600">{selectedBooking.unit_no}</span></div>
                      <div><span className="text-slate-400">ทะเบียนบ้าน:</span> <span className="font-medium">{selectedBooking.house_reg_no}</span></div>
                      <div><span className="text-slate-400">แบบบ้าน:</span> <span className="font-medium">{selectedBooking.house_type}</span></div>
                    </div>
                  </div>

                  {/* Customer & Sale - Side by Side */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Customer */}
                    <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                          <User className="w-3 h-3 text-blue-600" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-600 uppercase">ลูกค้า</h3>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="font-semibold text-slate-800">{selectedBooking.customer_name}</div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <Phone className="w-3 h-3" /> {selectedBooking.customer_tel}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-slate-500 mt-2 pt-2 border-t">
                          <div>อาชีพ: <span className="text-slate-700">{selectedBooking.customer_occupation || '-'}</span></div>
                          <div>อายุ: <span className="text-slate-700">{selectedBooking.customer_age || '-'} ปี</span></div>
                          <div>รายได้: <span className="text-slate-700">฿{formatMoney(selectedBooking.customer_monthly_income || 0)}</span></div>
                          <div>LTV: <span className="text-slate-700">{selectedBooking.customer_ltv || '-'}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Sale */}
                    <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">
                          <Banknote className="w-3 h-3 text-indigo-600" />
                        </div>
                        <h3 className="text-xs font-bold text-indigo-600 uppercase">Sale / ผู้ดูแล</h3>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="font-semibold text-slate-800">{selectedBooking.sale_name}</div>
                        <div className="text-slate-600">{selectedBooking.sale_type} • {selectedBooking.credit_request_type}</div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-slate-500 mt-2 pt-2 border-t">
                          <div>CO: <span className="text-slate-700">{selectedBooking.credit_owner || '-'}</span></div>
                          <div>วันครบดาวน์: <span className="text-slate-700">{selectedBooking.down_payment_complete_date || '-'}</span></div>
                          <div>CS: <span className="text-slate-700">{selectedBooking.cs_owner || '-'}</span></div>
                          <div>Backlog Owner: <span className="text-slate-700">{selectedBooking.backlog_owner || '-'}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ═══════════════════════════════════════════════════════════════ */}
                  {/* GROUP B: มูลค่า & สัญญา */}
                  {/* ═══════════════════════════════════════════════════════════════ */}
                  <div className="border-l-4 border-blue-500 pl-3 mb-1 mt-4">
                    <h2 className="text-sm font-bold text-blue-700">มูลค่า & สัญญา</h2>
                  </div>

                  <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-xs text-slate-500">มูลค่าสัญญาสุทธิ</div>
                        <div className="text-2xl font-bold text-slate-800">฿{formatMoney(selectedBooking.net_contract_value)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Pro ปิดโอน</div>
                        <div className="text-lg font-semibold text-slate-700">฿{formatMoney(selectedBooking.pro_transfer_bonus)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-sm border-t border-slate-100 pt-3">
                      <div><span className="text-slate-400">วันจอง:</span> <span className="font-medium">{selectedBooking.booking_date}</span></div>
                      <div><span className="text-slate-400">วันสัญญา:</span> <span className="font-medium">{selectedBooking.contract_date || '-'}</span></div>
                      <div><span className="text-slate-400">กำหนดโอน:</span> <span className="font-medium">{selectedBooking.contract_transfer_due_date || '-'}</span></div>
                      <div><span className="text-slate-400">Aging:</span> <span className="font-medium">{selectedBooking.aging_N_minus_U} วัน</span></div>
                    </div>
                    {selectedBooking.reason_not_transfer_this_month && (
                      <div className="mt-2 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                        เหตุผลโอนไม่ทัน: {selectedBooking.reason_not_transfer_this_month}
                      </div>
                    )}
                  </div>

                  {/* ═══════════════════════════════════════════════════════════════ */}
                  {/* GROUP C: กระบวนการสินเชื่อ */}
                  {/* ═══════════════════════════════════════════════════════════════ */}
                  <div className="border-l-4 border-cyan-500 pl-3 mb-1 mt-4">
                    <h2 className="text-sm font-bold text-cyan-700">กระบวนการสินเชื่อ</h2>
                  </div>

                  {/* Banks Submitted */}
                  <div className="bg-cyan-50/50 rounded-xl border border-cyan-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-cyan-600 uppercase">ธนาคารที่ยื่น</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        selectedBooking.credit_status === 'อนุมัติแล้ว' || selectedBooking.credit_status === 'โอนแล้ว'
                          ? 'bg-emerald-100 text-emerald-700'
                          : selectedBooking.credit_status === 'โอนสด'
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>{selectedBooking.credit_status}</span>
                    </div>
                    <div className="space-y-2">
                      {selectedBooking.banks_submitted.map((b, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${
                          b.result === 'อนุมัติ' ? 'bg-emerald-50 border border-emerald-200' :
                          b.result === 'ไม่อนุมัติ' ? 'bg-red-50 border border-red-200' :
                          'bg-white border border-slate-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              b.result === 'อนุมัติ' ? 'bg-emerald-500' : b.result === 'ไม่อนุมัติ' ? 'bg-red-500' : 'bg-slate-300'
                            }`}>
                              {b.result === 'อนุมัติ' ? '✓' : b.result === 'ไม่อนุมัติ' ? '✗' : '?'}
                            </div>
                            <div>
                              <span className="font-semibold text-sm">{b.bank}</span>
                              <span className="text-xs text-slate-400 ml-2">ยื่น: {b.submit_date || '-'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {b.result === 'อนุมัติ' && b.approved_amount && (
                              <span className="font-bold text-emerald-600">฿{formatMoney(b.approved_amount)}</span>
                            )}
                            {b.result === 'ไม่อนุมัติ' && <span className="text-xs text-red-500">ไม่อนุมัติ</span>}
                            {b.result === 'รอผล' && <span className="text-xs text-slate-400">รอผล</span>}
                            {b.remark && <div className="text-[10px] text-slate-400">{b.remark}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Credit Timeline */}
                  <div className="bg-cyan-50/50 rounded-xl border border-cyan-100 p-4">
                    <h3 className="text-xs font-bold text-cyan-600 uppercase mb-3">ขั้นตอนอนุมัติ</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {/* Bureau */}
                      <div className={`p-3 rounded-lg text-center ${selectedBooking.bureau_result === 'ผ่าน' ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}`}>
                        <div className="text-[10px] text-slate-500 uppercase">Bureau</div>
                        <div className={`text-sm font-bold ${selectedBooking.bureau_result === 'ผ่าน' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {selectedBooking.bureau_result || 'รอผล'}
                        </div>
                        <div className="text-[10px] text-slate-400">{selectedBooking.bureau_actual_result_date || '-'}</div>
                      </div>
                      {/* Pre-approve */}
                      <div className={`p-3 rounded-lg text-center ${selectedBooking.bank_preapprove_result ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'}`}>
                        <div className="text-[10px] text-slate-500 uppercase">Pre-approve</div>
                        <div className={`text-sm font-bold ${selectedBooking.bank_preapprove_result ? 'text-blue-600' : 'text-slate-400'}`}>
                          {selectedBooking.bank_preapprove_result ? 'ผ่าน' : 'รอ'}
                        </div>
                        <div className="text-[10px] text-slate-400">{selectedBooking.bank_preapprove_actual_date || '-'}</div>
                      </div>
                      {/* Bank Final */}
                      <div className={`p-3 rounded-lg text-center ${selectedBooking.bank_final_result?.includes('อนุมัติ') ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}`}>
                        <div className="text-[10px] text-slate-500 uppercase">Bank Final</div>
                        <div className={`text-sm font-bold ${selectedBooking.bank_final_result?.includes('อนุมัติ') ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {selectedBooking.bank_final_result?.includes('อนุมัติ') ? 'อนุมัติ' : 'รอ'}
                        </div>
                        <div className="text-[10px] text-slate-400">{selectedBooking.bank_final_actual_date || '-'}</div>
                      </div>
                      {/* JD Final */}
                      <div className={`p-3 rounded-lg text-center ${selectedBooking.jd_final_result === 'อนุมัติ' ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}`}>
                        <div className="text-[10px] text-slate-500 uppercase">JD Final</div>
                        <div className={`text-sm font-bold ${selectedBooking.jd_final_result === 'อนุมัติ' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {selectedBooking.jd_final_result || 'รอ'}
                        </div>
                        <div className="text-[10px] text-slate-400">{selectedBooking.jd_final_actual_date || '-'}</div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-slate-400">ยื่นเอกสาร:</span> <span className="font-medium">{selectedBooking.doc_submit_date || '-'}</span></div>
                      <div><span className="text-slate-400">ครบ Bank/JD:</span> <span className="font-medium">{selectedBooking.doc_complete_bank_jd_date || '-'}</span></div>
                      <div><span className="text-slate-400">ครบ JD:</span> <span className="font-medium">{selectedBooking.doc_complete_jd_date || '-'}</span></div>
                    </div>

                    {selectedBooking.co_remark && (
                      <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600">
                        <span className="font-semibold">หมายเหตุ CO:</span> {selectedBooking.co_remark}
                      </div>
                    )}
                  </div>

                  {/* ═══════════════════════════════════════════════════════════════ */}
                  {/* GROUP D: ตรวจบ้าน & โอน */}
                  {/* ═══════════════════════════════════════════════════════════════ */}
                  <div className="border-l-4 border-emerald-500 pl-3 mb-1 mt-4">
                    <h2 className="text-sm font-bold text-emerald-700">ตรวจบ้าน & โอน</h2>
                  </div>

                  {/* Inspection */}
                  <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-emerald-600 uppercase">ตรวจบ้าน / Inspection</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        selectedBooking.inspection_status === 'ผ่านแล้ว' || selectedBooking.inspection_status === 'โอนแล้ว'
                          ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>{selectedBooking.inspection_status}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div><span className="text-slate-500">วิธีตรวจ:</span> <span className="font-medium">{selectedBooking.inspection_method}</span></div>
                      <div><span className="text-slate-500">วันพร้อมตรวจ:</span> <span className="font-medium">{selectedBooking.unit_ready_inspection_date || '-'}</span></div>
                      <div><span className="text-slate-500">เจ้าหน้าที่:</span> <span className="font-medium">{selectedBooking.inspection_officer || '-'}</span></div>
                    </div>

                    {/* Inspection Rounds Table */}
                    <div className="bg-emerald-50 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-emerald-100">
                          <tr>
                            <th className="px-2 py-1.5 text-left text-emerald-700">ครั้งที่</th>
                            <th className="px-2 py-1.5 text-left text-emerald-700">นัด</th>
                            <th className="px-2 py-1.5 text-left text-emerald-700">ตรวจจริง</th>
                            <th className="px-2 py-1.5 text-left text-emerald-700">พร้อมส่งมอบ</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="px-2 py-1.5 font-medium">1</td>
                            <td className="px-2 py-1.5">{selectedBooking.inspect1_appointment_date || '-'}</td>
                            <td className="px-2 py-1.5">{selectedBooking.inspect1_actual_date || '-'}</td>
                            <td className="px-2 py-1.5">{selectedBooking.inspect1_ready_date || '-'}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="px-2 py-1.5 font-medium">2</td>
                            <td className="px-2 py-1.5">{selectedBooking.inspect2_appointment_date || '-'}</td>
                            <td className="px-2 py-1.5">{selectedBooking.inspect2_actual_date || '-'}</td>
                            <td className="px-2 py-1.5">{selectedBooking.inspect2_ready_date || '-'}</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1.5 font-medium">3</td>
                            <td className="px-2 py-1.5">{selectedBooking.inspect3_appointment_date || '-'}</td>
                            <td className="px-2 py-1.5">{selectedBooking.inspect3_actual_date || '-'}</td>
                            <td className="px-2 py-1.5 font-semibold text-emerald-600">{selectedBooking.handover_accept_date || '-'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Transfer */}
                  <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-emerald-600 uppercase">การโอน / Transfer</h3>
                      {selectedBooking.transferred_actual_flag && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-700 text-white">โอนแล้ว ✓</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div><span className="text-slate-500">สัญญา Bank:</span> <span className="font-medium">{selectedBooking.bank_contract_date || '-'}</span></div>
                      <div><span className="text-slate-500">ส่งชุดโอน:</span> <span className="font-medium">{selectedBooking.transfer_package_sent_date || '-'}</span></div>
                      <div><span className="text-slate-500">ปลอดโฉนด:</span> <span className="font-medium">{selectedBooking.title_clear_date || '-'}</span></div>
                      <div><span className="text-slate-500">เป้าโอน:</span> <span className="font-semibold text-slate-700">{selectedBooking.transfer_target_date || '-'}</span></div>
                      <div><span className="text-slate-500">นัดโอน:</span> <span className="font-medium">{selectedBooking.transfer_appointment_date || '-'}</span></div>
                      <div><span className="text-slate-500">โอนจริง:</span> <span className="font-bold text-slate-700">{selectedBooking.transfer_actual_date || '-'}</span></div>
                    </div>
                    {selectedBooking.cancel_flag && (
                      <div className="mt-3 p-2 bg-red-100 rounded-lg border border-red-300 text-sm text-red-700">
                        <span className="font-bold">ยกเลิก:</span> {selectedBooking.cancel_date} - {selectedBooking.cancel_reason}
                      </div>
                    )}
                  </div>

                  {/* ═══════════════════════════════════════════════════════════════ */}
                  {/* GROUP E: LivNex / RentNex */}
                  {/* ═══════════════════════════════════════════════════════════════ */}
                  <div className="border-l-4 border-orange-500 pl-3 mb-1 mt-4">
                    <h2 className="text-sm font-bold text-orange-700">LivNex / RentNex</h2>
                  </div>

                  {/* LivNex Full Section */}
                  <div className="bg-orange-50/50 rounded-xl border border-orange-100 p-4">
                    <h3 className="text-xs font-bold text-orange-600 uppercase mb-3">LivNex ติดตาม</h3>

                    {/* LivNex Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-orange-100">
                            <th className="border border-orange-200 px-2 py-1.5 text-left font-semibold text-orange-700">Livnex Able</th>
                            <th className="border border-orange-200 px-2 py-1.5 text-left font-semibold text-orange-700">วันที่ รับ CASE</th>
                            <th className="border border-orange-200 px-2 py-1.5 text-left font-semibold text-orange-700">สถานะสินเชื่อ</th>
                            <th className="border border-orange-200 px-2 py-1.5 text-left font-semibold text-orange-700">วันที่นัดเซ็นสัญญา</th>
                            <th className="border border-orange-200 px-2 py-1.5 text-left font-semibold text-orange-700">วันที่เข้าอยู่</th>
                            <th className="border border-orange-200 px-2 py-1.5 text-left font-semibold text-orange-700">เหตุผล Livnex Able</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-orange-200 px-2 py-1.5 font-medium">{selectedBooking.livnex_able_status || '-'}</td>
                            <td className="border border-orange-200 px-2 py-1.5">{selectedBooking.livnex_case_receive_date || '-'}</td>
                            <td className={`border border-orange-200 px-2 py-1.5 ${
                              selectedBooking.livnex_credit_status?.includes('เซ็นสัญญา') ? 'text-emerald-600 font-semibold' :
                              selectedBooking.livnex_credit_status?.includes('ไม่อนุมัติ') ? 'text-red-600 font-semibold' :
                              ''
                            }`}>{selectedBooking.livnex_credit_status || '-'}</td>
                            <td className={`border border-orange-200 px-2 py-1.5 ${
                              selectedBooking.livnex_contract_sign_status?.includes('เซ็นสัญญาแล้ว') ? 'text-emerald-600 font-semibold' : ''
                            }`}>{selectedBooking.livnex_contract_sign_status || '-'}</td>
                            <td className="border border-orange-200 px-2 py-1.5">{selectedBooking.livnex_move_in_date || '-'}</td>
                            <td className={`border border-orange-200 px-2 py-1.5 ${
                              selectedBooking.livnex_able_reason?.includes('อนุมัติ') && !selectedBooking.livnex_able_reason?.includes('ไม่') ? 'text-emerald-600' :
                              selectedBooking.livnex_able_reason?.includes('ไม่อนุมัติ') ? 'text-red-600' :
                              ''
                            }`}>{selectedBooking.livnex_able_reason || '-'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Follow-up Note */}
                    {selectedBooking.livnex_followup_note && (
                      <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-xs font-semibold text-orange-700 mb-1">เหตุผล ติดตาม LIVNEX</div>
                        <div className="text-xs text-orange-600">{selectedBooking.livnex_followup_note}</div>
                      </div>
                    )}

                    {/* Additional LivNex Info */}
                    <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">ผล:</span> <span className="font-medium">{selectedBooking.livnex_able_completion_result || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Sale เสนอ:</span> <span className="font-medium">{selectedBooking.sale_offer_livnex_flag ? '✓' : '-'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">สัญญา Livnex:</span> <span className="font-medium">{selectedBooking.livnex_contract_actual_date || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Complete:</span> <span className="font-medium">{selectedBooking.livnex_complete_date || '-'}</span></div>
                    </div>

                    {(selectedBooking.livnex_cancel_date || selectedBooking.rentnex_cancel_date) && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700">
                        {selectedBooking.livnex_cancel_date && <div><span className="font-semibold">LivNex ยกเลิก:</span> {selectedBooking.livnex_cancel_date} - {selectedBooking.livnex_cancel_reason}</div>}
                        {selectedBooking.rentnex_cancel_date && <div><span className="font-semibold">RentNex ยกเลิก:</span> {selectedBooking.rentnex_cancel_date} - {selectedBooking.rentnex_cancel_reason}</div>}
                      </div>
                    )}
                  </div>

                  {/* ═══════════════════════════════════════════════════════════════ */}
                  {/* GROUP E2: Finance (After Transfer) */}
                  {/* ═══════════════════════════════════════════════════════════════ */}
                  <div className="border-l-4 border-teal-500 pl-3 mb-1 mt-4">
                    <h2 className="text-sm font-bold text-teal-700">Finance</h2>
                  </div>

                  {/* Finance */}
                  <div className="bg-teal-50/50 rounded-xl border border-teal-100 p-4">
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">เงินทอน:</span> <span className="font-medium">{selectedBooking.refund_status || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">จำนวนทอน:</span> <span className="font-medium">{selectedBooking.refund_amount ? `฿${formatMoney(selectedBooking.refund_amount)}` : '-'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">มิเตอร์น้ำ:</span> <span className="font-medium">{selectedBooking.water_meter_change_date || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">มิเตอร์ไฟ:</span> <span className="font-medium">{selectedBooking.electricity_meter_change_date || '-'}</span></div>
                    </div>
                  </div>

                  {/* ═══════════════════════════════════════════════════════════════ */}
                  {/* GROUP F: การติดตาม & KPI */}
                  {/* ═══════════════════════════════════════════════════════════════ */}
                  <div className="border-l-4 border-violet-500 pl-3 mb-1 mt-4">
                    <h2 className="text-sm font-bold text-violet-700">การติดตาม & KPI</h2>
                  </div>

                  {/* KPI Cards */}
                  <div className="bg-violet-50/50 rounded-xl border border-violet-100 p-4">
                    <h3 className="text-xs font-bold text-violet-600 uppercase mb-3">KPI</h3>
                    <div className="grid grid-cols-5 gap-2">
                      <div className={`p-2 rounded-lg text-center ${selectedBooking.call_customer_within_2_days === 'PASS' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        <div className="text-[10px] text-slate-500">โทรแจ้ง 2 วัน</div>
                        <div className={`text-sm font-bold ${selectedBooking.call_customer_within_2_days === 'PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{selectedBooking.call_customer_within_2_days}</div>
                      </div>
                      <div className={`p-2 rounded-lg text-center ${selectedBooking.inspection_within_15_days === 'PASS' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        <div className="text-[10px] text-slate-500">ตรวจ 15 วัน</div>
                        <div className={`text-sm font-bold ${selectedBooking.inspection_within_15_days === 'PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{selectedBooking.inspection_within_15_days}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center bg-slate-50">
                        <div className="text-[10px] text-slate-500">Aging</div>
                        <div className="text-sm font-bold text-slate-700">{selectedBooking.aging_days} วัน</div>
                      </div>
                      <div className={`p-2 rounded-lg text-center ${selectedBooking.efficiency_cycle_status === 'On Track' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                        <div className="text-[10px] text-slate-500">วงจร</div>
                        <div className={`text-sm font-bold ${selectedBooking.efficiency_cycle_status === 'On Track' ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedBooking.efficiency_cycle_status === 'On Track' ? 'On' : 'Delay'}</div>
                      </div>
                      <div className={`p-2 rounded-lg text-center ${(selectedBooking.ahead_delay_days || 0) >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        <div className="text-[10px] text-slate-500">Ahead/Delay</div>
                        <div className={`text-sm font-bold ${(selectedBooking.ahead_delay_days || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{selectedBooking.ahead_delay_days || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Management & Backlog */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Management */}
                    <div className="bg-violet-50/50 rounded-xl border border-violet-100 p-4">
                      <h3 className="text-xs font-bold text-violet-600 uppercase mb-3">Management</h3>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Team:</span> <span className="font-semibold" style={{ color: TEAM_CONFIG[selectedBooking.current_owner_team]?.color }}>{TEAM_CONFIG[selectedBooking.current_owner_team]?.label}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">สถานะเป้าโอน:</span> <span className="font-medium">{selectedBooking.transfer_target_status || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">สถานะสินค้า:</span> <span className="font-medium">{selectedBooking.product_status || '-'}</span></div>
                      </div>
                      {selectedBooking.current_blocker && (
                        <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-700">
                          <span className="font-semibold">Blocker:</span> {selectedBooking.current_blocker}
                        </div>
                      )}
                      {selectedBooking.next_action && (
                        <div className="mt-1 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          <span className="font-semibold">Next:</span> {selectedBooking.next_action}
                        </div>
                      )}
                    </div>

                    {/* Backlog Info */}
                    <div className="bg-violet-50/50 rounded-xl border border-violet-100 p-4">
                      <h3 className="text-xs font-bold text-violet-600 uppercase mb-3">Backlog</h3>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">สถานะ:</span> <span className="font-medium">{selectedBooking.backlog_status}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">ขายใหม่/Re-sale:</span> <span className="font-medium">{selectedBooking.sale_type_flag}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">OBJ การซื้อ:</span> <span className="font-medium">{selectedBooking.obj_purchase}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Backlog เก่า:</span> <span className="font-medium">{selectedBooking.backlog_old_flag ? 'ใช่' : 'ไม่'}</span></div>
                      </div>
                      <div className="mt-2 pt-2 border-t text-xs text-slate-500">
                        <div>OPM: {selectedBooking.OPM} | BUD: {selectedBooking.BUD}</div>
                        <div>Period: {selectedBooking.dec_period} | FY: {selectedBooking.fiscal_year}</div>
                      </div>
                    </div>
                  </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
