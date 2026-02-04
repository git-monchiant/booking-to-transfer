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
} from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
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
              {currentView === 'dashboard' && 'Dashboard'}
              {currentView === 'pipeline' && 'Pipeline'}
              {currentView === 'list' && (stageFilter === 'all' ? 'รายการ Booking ทั้งหมด' : `Booking - ${STAGE_CONFIG[stageFilter]?.label}`)}
              {currentView === 'blocked' && 'รายการติดปัญหา'}
              {currentView === 'team' && `ทีม ${TEAM_CONFIG[selectedTeam]?.label}`}
              {currentView === 'after-transfer' && 'After Transfer - ภาพรวม'}
              {currentView === 'refund' && 'คืนเงิน / Refund'}
              {currentView === 'meter' && 'เปลี่ยนมิเตอร์'}
              {currentView === 'handover' && 'ส่งมอบเอกสาร'}
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
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
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
                        ? 'bg-white text-indigo-600 shadow-sm'
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
          {/* ========== DASHBOARD VIEW ========== */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">กำลังดำเนินการ</span>
                    <Clock className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{filteredSummary.activeBookings}</div>
                  <div className="text-sm text-slate-500 mt-1">รายการ</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">โอนแล้ว</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-600">{filteredSummary.transferredBookings}</div>
                  <div className="text-sm text-slate-500 mt-1">รายการ</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">มูลค่ารวม</span>
                    <Banknote className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">฿{formatMoney(summary.totalValue)}</div>
                  <div className="text-sm text-emerald-600 mt-1">โอนแล้ว ฿{formatMoney(summary.transferredValue)}</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">Aging เฉลี่ย</span>
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{filteredSummary.avgAgingDays}</div>
                  <div className="text-sm text-slate-500 mt-1">วัน</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-red-200 bg-red-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-red-600">ติดปัญหา</span>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-3xl font-bold text-red-600">{filteredSummary.blockedCount}</div>
                  <div className="text-sm text-red-500 mt-1">รายการ</div>
                </div>
              </div>

              {/* Stage Pipeline */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Pipeline</h2>
                <div className="flex items-center gap-2">
                  {filteredSummary.byStage.filter(s => s.stage !== 'cancelled').map((item, index, arr) => (
                    <div key={item.stage} className="flex items-center flex-1">
                      <div
                        className="flex-1 rounded-lg p-4 text-center"
                        style={{ backgroundColor: STAGE_CONFIG[item.stage]?.bg ?? '#f1f5f9' }}
                      >
                        <div
                          className="text-2xl font-bold"
                          style={{ color: STAGE_CONFIG[item.stage]?.color ?? '#475569' }}
                        >
                          {item.count}
                        </div>
                        <div className="text-sm font-medium text-slate-700 mt-1">{STAGE_CONFIG[item.stage]?.label ?? item.stage}</div>
                        <div className="text-xs text-slate-500 mt-0.5">฿{formatMoney(item.value)}</div>
                      </div>
                      {index < arr.length - 1 && (
                        <ChevronRight className="w-5 h-5 text-slate-300 mx-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Blocked Items */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      ติดปัญหา ({blockedBookings.length})
                    </h2>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-auto">
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
                        <div className="text-sm text-slate-700 mb-1">{booking.customer_name} • {booking.project_name}</div>
                        <div className="text-sm text-amber-700 font-medium">{booking.current_blocker}</div>
                        <div className="text-xs text-slate-500 mt-2">
                          Owner: {TEAM_CONFIG[booking.current_owner_team]?.label ?? booking.current_owner_team}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Workload */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="font-semibold text-slate-900 mb-4">งานตามทีม</h2>
                  <div className="space-y-3">
                    {filteredSummary.byTeam.map(item => (
                      <div key={item.team} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium text-slate-700">
                          {TEAM_CONFIG[item.team]?.label ?? item.team}
                        </div>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg flex items-center justify-end px-3 text-sm font-semibold text-white"
                            style={{
                              width: `${Math.max((item.count / Math.max(filteredSummary.activeBookings, 1)) * 100, 10)}%`,
                              backgroundColor: TEAM_CONFIG[item.team]?.color ?? '#64748b',
                            }}
                          >
                            {item.count}
                          </div>
                        </div>
                      </div>
                    ))}
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
                            <span className="font-semibold text-indigo-600">{booking.id}</span>
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
                          className="px-5 py-2 text-center text-sm text-indigo-600 hover:bg-indigo-50 cursor-pointer"
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
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Header with Filters */}
              <div className="px-6 py-4 border-b border-slate-100">
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
                      className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition whitespace-nowrap"
                    >
                      ดูทั้งหมด
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">ลูกค้า</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">โครงการ</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">มูลค่า</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">สถานะ</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Owner</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Aging</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">ปัญหา</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="px-6 py-3">
                        <span className="font-semibold text-indigo-600">{booking.id}</span>
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
                      <td className="px-6 py-3">
                        <span
                          className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: STAGE_CONFIG[booking.stage]?.bg ?? '#f1f5f9',
                            color: STAGE_CONFIG[booking.stage]?.color ?? '#475569',
                          }}
                        >
                          {STAGE_CONFIG[booking.stage]?.label ?? booking.stage}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: (TEAM_CONFIG[booking.current_owner_team]?.color ?? '#64748b') + '20',
                            color: TEAM_CONFIG[booking.current_owner_team]?.color ?? '#64748b'
                          }}
                        >
                          {TEAM_CONFIG[booking.current_owner_team]?.label ?? booking.current_owner_team}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`font-semibold ${booking.aging_days > 45 ? 'text-red-600' : booking.aging_days > 30 ? 'text-amber-600' : 'text-slate-900'}`}>
                          {booking.aging_days}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {booking.current_blocker ? (
                          <span className="text-sm text-amber-600">{booking.current_blocker}</span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                        <div className="text-xs font-medium text-indigo-700">{booking.next_action}</div>
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
                    <th className="text-left px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">ลูกค้า</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">โครงการ</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">มูลค่า</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">คืนเงิน</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">มิเตอร์น้ำ</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">มิเตอร์ไฟ</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">เอกสาร</th>
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
                        <span className="font-semibold text-indigo-600">{booking.id}</span>
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
                          <span className="font-semibold text-indigo-600">{booking.id}</span>
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

          {/* ========== HANDOVER VIEW ========== */}
          {currentView === 'handover' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-500" />
                <div>
                  <div className="font-semibold text-purple-800">ส่งมอบเอกสาร</div>
                  <div className="text-sm text-purple-600">ติดตามการส่งมอบเอกสารให้ลูกค้า</div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ลูกค้า</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">โครงการ</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">สถานะเอกสาร</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">วันที่รับ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalFilteredBookings.filter(b => b.transferred_actual_flag).map(booking => (
                      <tr
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <span className="font-semibold text-indigo-600">{booking.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{booking.customer_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-600">{booking.project_name}</div>
                          <div className="text-xs text-slate-400">{booking.unit_no}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.handover_document_received_date ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {booking.handover_document_received_date ? 'ส่งมอบแล้ว' : 'รอส่งมอบ'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {booking.handover_document_received_date ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Panel */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedBooking(null)} />
          <div className="relative w-full max-w-xl bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <div className="text-xl font-bold text-slate-900">{selectedBooking.id}</div>
                <div className="text-sm text-slate-500">{selectedBooking.project_name} • {selectedBooking.unit_no}</div>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{
                    backgroundColor: STAGE_CONFIG[selectedBooking.stage]?.bg ?? '#f1f5f9',
                    color: STAGE_CONFIG[selectedBooking.stage]?.color ?? '#475569',
                  }}
                >
                  {STAGE_CONFIG[selectedBooking.stage]?.label ?? selectedBooking.stage}
                </span>
                <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                  Aging: {selectedBooking.aging_days} วัน
                </span>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  selectedBooking.backlog_grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                  selectedBooking.backlog_grade === 'B' ? 'bg-blue-100 text-blue-700' :
                  selectedBooking.backlog_grade === 'C' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Grade {selectedBooking.backlog_grade}
                </span>
              </div>

              {/* Customer */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">ข้อมูลลูกค้า</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{selectedBooking.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{selectedBooking.customer_tel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">
                      {selectedBooking.customer_occupation ?? '-'} • รายได้ ฿{formatMoney(selectedBooking.customer_monthly_income ?? 0)}/เดือน
                    </span>
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="bg-indigo-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-indigo-600 uppercase mb-3">มูลค่า</h3>
                <div className="text-3xl font-bold text-indigo-700">฿{formatMoney(selectedBooking.net_contract_value)}</div>
                <div className="text-sm text-indigo-600 mt-1">โบนัสโอน: ฿{formatMoney(selectedBooking.pro_transfer_bonus)}</div>
              </div>

              {/* Blocker */}
              {selectedBooking.current_blocker && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-800">คอขวด</h3>
                      <p className="text-amber-700">{selectedBooking.current_blocker}</p>
                      <p className="text-xs text-amber-600 mt-1">
                        ทีมรับผิดชอบ: {TEAM_CONFIG[selectedBooking.current_owner_team]?.label ?? selectedBooking.current_owner_team}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Action */}
              {selectedBooking.next_action && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ArrowUpRight className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-emerald-800">Next Action</h3>
                      <p className="text-emerald-700">{selectedBooking.next_action}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Owners */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">ทีมงาน</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500">Sale</div>
                    <div className="font-medium text-slate-900">{selectedBooking.sale_name}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500">CO</div>
                    <div className="font-medium text-slate-900">{selectedBooking.credit_owner || '-'}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500">CS</div>
                    <div className="font-medium text-slate-900">{selectedBooking.cs_owner || '-'}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500">Current Owner</div>
                    <div className="font-medium" style={{ color: TEAM_CONFIG[selectedBooking.current_owner_team]?.color ?? '#475569' }}>
                      {TEAM_CONFIG[selectedBooking.current_owner_team]?.label ?? selectedBooking.current_owner_team}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">วันที่สำคัญ</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Booking</span>
                    <span className="font-medium text-slate-900">{selectedBooking.booking_date ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Contract</span>
                    <span className="font-medium text-slate-900">{selectedBooking.contract_date ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Target Transfer</span>
                    <span className="font-medium text-slate-900">{selectedBooking.contract_transfer_due_date ?? '-'}</span>
                  </div>
                  {selectedBooking.transferred_actual_flag && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600">โอนแล้ว</span>
                      <span className="font-medium text-emerald-700">✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Credit */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">สินเชื่อ</h3>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    selectedBooking.credit_request_type === 'โอนสด' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedBooking.credit_request_type}
                  </span>
                  {selectedBooking.bank_submitted && selectedBooking.bank_submitted !== 'CASH' && (
                    <span className="text-slate-700">ธนาคาร: {selectedBooking.bank_submitted}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
