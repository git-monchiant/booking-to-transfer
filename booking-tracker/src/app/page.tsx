'use client';

import { useState, useMemo, Fragment } from 'react';
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
  CHAT_ROLE_CONFIG,
  type ChatRole,
} from '@/data/bookings';
import { Sidebar, View } from '@/components/Sidebar';
import { MultiSelect } from '@/components/MultiSelect';
import { BookingDetailPanel } from '@/components/BookingDetailPanel';
import { TransferCharts } from '@/components/TransferCharts';
import {
  MONTHLY_SALES_DATA, MONTHLY_TRANSFER_DATA, MONTHLY_CANCEL_DATA,
  BACKLOG_INITIAL,
} from '@/data/chart-data';
import { PROCESS_BACKLOG, PROCESS_INPROGRESS, GROUP_COLORS, AGING_BUCKETS, AGING_COLORS, SLA_COMPLIANCE_DATA, BACKLOG_BY_PROJECT_DATA, PROJECT_BOOKING_ITEMS, BANK_CREDIT_STATUS, PERSON_WORKLOAD, PERSON_BOOKING_ITEMS, PERSON_MONTHLY_SLA } from '@/data/chart-data-tracking';
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
  ResponsiveContainer,
  Cell,
  LabelList,
  Legend,
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
  CheckCircle2,
  ArrowUpRight,
  Layers,
  Bell,
} from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard-tracking');
  const [selectedTeam, setSelectedTeam] = useState<Team>('Sale');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all');
const [notiOpen, setNotiOpen] = useState(false);
  const [budDisplayMode, setBudDisplayMode] = useState<'unit' | 'net' | 'contract'>('unit');
  const [heatmapMode, setHeatmapMode] = useState<'pending' | 'inprogress'>('pending');
  const [selectedProcess, setSelectedProcess] = useState<string>(PROCESS_BACKLOG[0].key);
  const [heatmapCell, setHeatmapCell] = useState<{ processKey: string; agingDay: string } | null>(
    () => {
      const first = PROCESS_BACKLOG[0];
      if (!first) return null;
      const firstBucket = AGING_BUCKETS.find(b => first.aging[b] > 0);
      return firstBucket ? { processKey: first.key, agingDay: firstBucket } : null;
    }
  );
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => {
      const s = new Set<string>();
      // ทุกกลุ่ม: เปิดอันแรก ปิดที่เหลือ
      const seenGroup = new Set<string>();
      const seenSg = new Set<string>();
      PROCESS_BACKLOG.forEach(p => {
        const sg = (p as any).subGroup as string | undefined;
        if (sg && !seenSg.has(sg)) {
          seenSg.add(sg);
          if (seenGroup.has(p.group)) {
            s.add(sg); // subGroup ที่เหลือ — ปิด
          } else {
            seenGroup.add(p.group); // subGroup แรกของ group — เปิด
          }
        }
      });
      return s;
    }
  );
  const [defaultTab, setDefaultTab] = useState<'detail' | 'sla' | 'followup' | 'ai' | undefined>(undefined);
  const [projectSlaView, setProjectSlaView] = useState<'backlog' | 'transferred'>('backlog');
  const [selectedProject, setSelectedProject] = useState<string | null>(
    () => [...BACKLOG_BY_PROJECT_DATA].sort((a, b) => b.n - a.n)[0]?.pName ?? null
  );
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [perfTeamFilter, setPerfTeamFilter] = useState<'all' | 'CO' | 'CS' | 'CON' | 'Sale'>('all');

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
    slaOverdue: false,
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

  // ─── Backlog booking map: process+aging → actual bookings (round-robin) ───
  const backlogBookingMap = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    let idx = 0;
    for (const proc of PROCESS_BACKLOG) {
      for (const bucket of AGING_BUCKETS) {
        const count = proc.aging[bucket];
        const key = `${proc.key}|${bucket}`;
        map[key] = [];
        for (let i = 0; i < count; i++) {
          map[key].push(bookings[idx % bookings.length]);
          idx++;
        }
      }
    }
    return map;
  }, []);

  // ─── Project booking map: ProjectBookingItem index → actual Booking (round-robin) ───
  const projectBookingRealMap = useMemo(() => {
    const map = new Map<string, Booking>();
    PROJECT_BOOKING_ITEMS.forEach((item, i) => {
      map.set(item.bookingNo, bookings[i % bookings.length]);
    });
    return map;
  }, []);

  // ─── Person booking map: PersonBookingItem index → actual Booking (round-robin) ───
  const personBookingRealMap = useMemo(() => {
    const map = new Map<string, Booking>();
    PERSON_BOOKING_ITEMS.forEach((item, i) => {
      map.set(item.bookingNo, bookings[i % bookings.length]);
    });
    return map;
  }, []);

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

  // SLA thresholds per process step (days)
  const SLA_STEPS: { prev: (b: Booking) => string | null; curr: (b: Booking) => string | null; sla: number }[] = [
    { prev: b => b.contract_date, curr: b => b.doc_bureau_date, sla: 2 },
    { prev: b => b.doc_bureau_date, curr: b => b.banks_submitted[0]?.submit_date ?? null, sla: 5 },
    { prev: b => b.banks_submitted[0]?.submit_date ?? null, curr: b => b.bureau_actual_result_date, sla: 1 },
    { prev: b => b.bureau_actual_result_date, curr: b => b.bank_preapprove_actual_date, sla: 7 },
    { prev: b => b.bank_preapprove_actual_date, curr: b => b.bank_final_actual_date, sla: 7 },
    { prev: b => b.inspect1_appt, curr: b => b.inspect1_date, sla: 5 },
    { prev: b => b.bank_final_actual_date, curr: b => b.bank_contract_date, sla: 7 },
    { prev: b => b.bank_contract_date, curr: b => b.transfer_package_sent_date, sla: 7 },
    { prev: b => b.title_clear_date, curr: b => b.transfer_appointment_date, sla: 1 },
    { prev: b => b.transfer_appointment_date, curr: b => b.transfer_actual_date, sla: 4 },
  ];

  const parseDate = (d: string) => { const [dd,mm,yy] = d.split('/'); return new Date(+yy, +mm-1, +dd); };
  const today = new Date();

  const isBookingOverSLA = (b: Booking): boolean => {
    if (b.stage === 'transferred' || b.stage === 'cancelled') return false;
    return SLA_STEPS.some(step => {
      const prevDate = step.prev(b);
      const currDate = step.curr(b);
      if (!prevDate || currDate) return false; // step not started or already completed
      const days = Math.round((today.getTime() - parseDate(prevDate).getTime()) / 86400000);
      return days > step.sla;
    });
  };

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
    if (globalFilters.slaOverdue) {
      result = result.filter(b => isBookingOverSLA(b));
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

  // Notification: recent chat messages across all bookings
  const notifications = useMemo(() => {
    return bookings
      .filter(b => b.chat_messages && b.chat_messages.length > 0)
      .map(b => {
        const last = b.chat_messages[b.chat_messages.length - 1];
        return { booking: b, lastMessage: last };
      })
      .sort((a, b) => b.lastMessage.timestamp.localeCompare(a.lastMessage.timestamp))
      .slice(0, 8);
  }, []);

  const notiCount = notifications.length;

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
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotiOpen(!notiOpen)}
                className="relative p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-4.5 h-4.5 text-slate-500" />
                {notiCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notiCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notiOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotiOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">แจ้งเตือนแชท</span>
                      <span className="text-[10px] text-slate-400">{notiCount} ข้อความ</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {notifications.map((n) => {
                        const roleConfig = CHAT_ROLE_CONFIG[n.lastMessage.role as ChatRole];
                        return (
                          <button
                            key={n.booking.id}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3 items-start"
                            onClick={() => {
                              setDefaultTab('followup');
                              setSelectedBooking(n.booking);
                              setNotiOpen(false);
                            }}
                          >
                            <div className={`w-7 h-7 rounded-full ${roleConfig?.bg || 'bg-slate-400'} text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              {roleConfig?.avatar || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-800 truncate">{n.lastMessage.sender}</span>
                                <span className="text-[10px] text-slate-400">{n.lastMessage.role}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 truncate mt-0.5">{n.lastMessage.text}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-indigo-500 font-medium truncate">{n.booking.project_name}</span>
                                <span className="text-[10px] text-slate-300">·</span>
                                <span className="text-[10px] text-slate-400">{n.lastMessage.timestamp}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Search */}
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
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">SLA</label>
                <select value={globalFilters.slaOverdue ? 'overdue' : 'all'}
                  onChange={e => setGlobalFilters(prev => ({ ...prev, slaOverdue: e.target.value === 'overdue' }))}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-300">
                  <option value="all">ทั้งหมด</option>
                  <option value="overdue">เลยกำหนด SLA ({bookings.filter(b => isBookingOverSLA(b)).length})</option>
                </select>
              </div>
              <div className={`flex flex-col gap-1 ${currentView !== 'dashboard' && currentView !== 'dashboard-performance' ? 'hidden' : ''}`}>
                <label className="text-[10px] font-semibold text-slate-400 uppercase">หน่วย</label>
                <select value={budDisplayMode} onChange={e => setBudDisplayMode(e.target.value as 'unit' | 'net' | 'contract')}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-300">
                  <option value="unit">จำนวน (Unit)</option>
                  <option value="net">ราคาขายสุทธิ (ล้าน฿)</option>
                  <option value="contract">ราคาหน้าสัญญา (ล้าน฿)</option>
                </select>
              </div>
              <div className="flex-1" />
              {(globalFilters.bu.length > 0 || globalFilters.opm.length > 0 || globalFilters.project.length > 0 || globalFilters.status.length > 0 || globalFilters.responsible.length > 0 || globalFilters.dateFrom || globalFilters.dateTo || globalFilters.slaOverdue) && (
                <button
                  onClick={() => setGlobalFilters({ bu: [], opm: [], project: [], status: [], responsible: [], datePreset: 'all', dateFrom: '', dateTo: '', slaOverdue: false })}
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
              {/* KPI Cards — ข้อมูลจาก chart-data.ts ตรงกับ graph ด้านล่าง */}
              {(() => {
                const kBook = MONTHLY_SALES_DATA.reduce((s, d) => s + d.Book, 0);
                const kContract = MONTHLY_SALES_DATA.reduce((s, d) => s + d.Contract, 0);
                const kMTOPBook = MONTHLY_SALES_DATA.reduce((s, d) => s + d.เป้าBook, 0);
                const kUnsigned = kBook - kContract;

                const kTransfer = MONTHLY_TRANSFER_DATA.reduce((s, d) => s + d.โอนจากBacklog + d.โอนจากขายในเดือน, 0);
                const kFromBacklog = MONTHLY_TRANSFER_DATA.reduce((s, d) => s + d.โอนจากBacklog, 0);
                const kFromNew = MONTHLY_TRANSFER_DATA.reduce((s, d) => s + d.โอนจากขายในเดือน, 0);
                const kMTOPTransfer = MONTHLY_TRANSFER_DATA.reduce((s, d) => s + d.MTOP, 0);

                const kLivNex = MONTHLY_SALES_DATA.reduce((s, d) => s + d.LivNex, 0);
                const kLivNexNew = MONTHLY_SALES_DATA.reduce((s, d) => s + d.LivNexใหม่, 0);
                const kLivNexCancel = MONTHLY_SALES_DATA.reduce((s, d) => s + d.LivNexจากยกเลิก, 0);
                const kTargetLivNex = MONTHLY_SALES_DATA.reduce((s, d) => s + d.เป้าLivNex, 0);

                const kPreLivNex = MONTHLY_SALES_DATA.reduce((s, d) => s + d.PreLivNex, 0);
                const kPreLivNexNew = MONTHLY_SALES_DATA.reduce((s, d) => s + d.PreLivNexใหม่, 0);
                const kPreLivNexCancel = MONTHLY_SALES_DATA.reduce((s, d) => s + d.PreLivNexจากยกเลิก, 0);
                const kTargetPreLivNex = MONTHLY_SALES_DATA.reduce((s, d) => s + d.เป้าPreLivNex, 0);

                const kCancel = MONTHLY_CANCEL_DATA.reduce((s, d) => s + d.ยกเลิก, 0);
                const kCancelToLN = MONTHLY_CANCEL_DATA.reduce((s, d) => s + d.ซื้อLivNex, 0);
                const kCancelToPLN = MONTHLY_CANCEL_DATA.reduce((s, d) => s + d.ซื้อPreLivNex, 0);
                const kNetCancel = kCancel - kCancelToLN - kCancelToPLN;
                const kRecoveryPct = kCancel > 0 ? Math.round((kCancelToLN + kCancelToPLN) / kCancel * 100) : 0;

                // Backlog = initial + total book - total transfer
                const kBacklog = BACKLOG_INITIAL + kBook - kTransfer;

                // หาเดือนล่าสุดที่มีข้อมูลจริง
                const lastActualIdx = MONTHLY_SALES_DATA.reduce((last, d, i) => d.Book > 0 ? i : last, -1);
                const ytdSlice = lastActualIdx >= 0 ? lastActualIdx + 1 : 0;

                // เป้า YTD (สะสมเฉพาะเดือนที่มีข้อมูลจริง)
                const kMTOPBookYTD = MONTHLY_SALES_DATA.slice(0, ytdSlice).reduce((s, d) => s + d.เป้าBook, 0);
                const kMTOPTransferYTD = MONTHLY_TRANSFER_DATA.slice(0, ytdSlice).reduce((s, d) => s + d.MTOP, 0);
                const kTargetLivNexYTD = MONTHLY_SALES_DATA.slice(0, ytdSlice).reduce((s, d) => s + d.เป้าLivNex, 0);
                const kTargetPreLivNexYTD = MONTHLY_SALES_DATA.slice(0, ytdSlice).reduce((s, d) => s + d.เป้าPreLivNex, 0);

                const pctBook = kMTOPBook > 0 ? Math.round(kBook / kMTOPBook * 100) : 0;
                const pctTransfer = kMTOPTransfer > 0 ? Math.round(kTransfer / kMTOPTransfer * 100) : 0;
                const pctLivNex = kTargetLivNex > 0 ? Math.round(kLivNex / kTargetLivNex * 100) : 0;
                const pctPreLivNex = kTargetPreLivNex > 0 ? Math.round(kPreLivNex / kTargetPreLivNex * 100) : 0;

                return (
                  <div className="grid grid-cols-6 gap-3">
                    {/* 1. ยอดจอง */}
                    <div className="bg-emerald-600 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="text-right leading-tight">
                          <div className="text-[10px] font-medium text-emerald-200">เป้ารวม {kMTOPBook.toLocaleString()}</div>
                          <div className="text-[10px] font-medium text-emerald-300">YTD {kMTOPBookYTD.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white leading-tight">{kBook.toLocaleString()}</div>
                      <div className="text-[11px] font-semibold text-emerald-100">ยอดจอง (Book)</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-emerald-800/40 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(pctBook, 100)}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold ${pctBook >= 80 ? 'text-emerald-100' : pctBook >= 60 ? 'text-yellow-200' : 'text-red-200'}`}>{pctBook}%</span>
                      </div>
                      <div className="text-[10px] text-emerald-200 mt-1">สัญญา {kContract.toLocaleString()} | รอสัญญา {kUnsigned.toLocaleString()}</div>
                    </div>

                    {/* 2. โอนจริง */}
                    <div className="bg-blue-600 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Banknote className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="text-right leading-tight">
                          <div className="text-[10px] font-medium text-blue-200">เป้ารวม {kMTOPTransfer.toLocaleString()}</div>
                          <div className="text-[10px] font-medium text-blue-300">YTD {kMTOPTransferYTD.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white leading-tight">{kTransfer.toLocaleString()}</div>
                      <div className="text-[11px] font-semibold text-blue-100">โอนจริง (Transfer)</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-blue-800/40 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(pctTransfer, 100)}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold ${pctTransfer >= 80 ? 'text-blue-100' : pctTransfer >= 60 ? 'text-yellow-200' : 'text-red-200'}`}>{pctTransfer}%</span>
                      </div>
                      <div className="text-[10px] text-blue-200 mt-1">Backlog {kFromBacklog.toLocaleString()} | ขายใหม่ {kFromNew.toLocaleString()}</div>
                    </div>

                    {/* 3. LivNex */}
                    <div className="bg-orange-600 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Layers className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="text-right leading-tight">
                          <div className="text-[10px] font-medium text-orange-200">เป้ารวม {kTargetLivNex.toLocaleString()}</div>
                          <div className="text-[10px] font-medium text-orange-300">YTD {kTargetLivNexYTD.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white leading-tight">{kLivNex.toLocaleString()}</div>
                      <div className="text-[11px] font-semibold text-orange-100">LivNex</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-orange-800/40 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(pctLivNex, 100)}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold ${pctLivNex >= 80 ? 'text-orange-100' : pctLivNex >= 60 ? 'text-yellow-200' : 'text-red-200'}`}>{pctLivNex}%</span>
                      </div>
                      <div className="text-[10px] text-orange-200 mt-1">ขายใหม่ {kLivNexNew} | จากยกเลิก {kLivNexCancel}</div>
                    </div>

                    {/* 4. Pre-LivNex */}
                    <div className="bg-cyan-600 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center">
                          <Layers className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="text-right leading-tight">
                          <div className="text-[10px] font-medium text-cyan-200">เป้ารวม {kTargetPreLivNex.toLocaleString()}</div>
                          <div className="text-[10px] font-medium text-cyan-300">YTD {kTargetPreLivNexYTD.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white leading-tight">{kPreLivNex.toLocaleString()}</div>
                      <div className="text-[11px] font-semibold text-cyan-100">Pre-LivNex</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-cyan-800/40 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(pctPreLivNex, 100)}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold ${pctPreLivNex >= 80 ? 'text-cyan-100' : pctPreLivNex >= 60 ? 'text-yellow-200' : 'text-red-200'}`}>{pctPreLivNex}%</span>
                      </div>
                      <div className="text-[10px] text-cyan-200 mt-1">ขายใหม่ {kPreLivNexNew} | จากยกเลิก {kPreLivNexCancel}</div>
                    </div>

                    {/* 5. ยกเลิก */}
                    <div className="bg-red-600 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center">
                          <X className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className={`text-[10px] font-bold ${kRecoveryPct >= 30 ? 'text-emerald-200' : 'text-yellow-200'}`}>Recovery {kRecoveryPct}%</span>
                      </div>
                      <div className="text-lg font-bold text-white leading-tight">{kCancel.toLocaleString()}</div>
                      <div className="text-[11px] font-semibold text-red-100">ยกเลิก</div>
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-800 text-white font-medium">ยกเลิกจริง {kNetCancel}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-600 text-white font-medium">LN {kCancelToLN}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-600 text-white font-medium">PLN {kCancelToPLN}</span>
                      </div>
                    </div>

                    {/* 6. Backlog */}
                    <div className="bg-amber-600 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-amber-200">เริ่มปี {BACKLOG_INITIAL.toLocaleString()}</span>
                      </div>
                      <div className="text-lg font-bold text-white leading-tight">{kBacklog.toLocaleString()}</div>
                      <div className="text-[11px] font-semibold text-amber-100">Backlog (รอโอน)</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-amber-800/40 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(kBacklog / BACKLOG_INITIAL * 100, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-amber-100">{kBacklog > BACKLOG_INITIAL ? '+' : ''}{kBacklog - BACKLOG_INITIAL}</span>
                      </div>
                      <div className="text-[10px] text-amber-200 mt-1">+จอง {kBook.toLocaleString()} −โอน {kTransfer.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })()}

              <TransferCharts budDisplayMode={budDisplayMode} />
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
                const approved = allBankSubs.filter(bs => bs.result_flag === 'pass').length;
                const rejected = allBankSubs.filter(bs => bs.result_flag === 'fail').length;
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
                    {/* Row 1: Hero Cards — hidden */}
                    {false && <div className="grid grid-cols-2 gap-4">
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
                    </div>}

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
                const activeData = heatmapMode === 'pending' ? PROCESS_BACKLOG : PROCESS_INPROGRESS;
                const agingKeys = [...AGING_BUCKETS];

                // สีตาม SLA: ภายใน SLA = เขียว, เลย SLA = เหลือง→ส้ม→แดง
                const GREEN_SHADES = ['#064e3b','#065f46','#047857','#059669','#0d9448','#16a34a'];
                const OVER_COLORS = ['#eab308','#f59e0b','#f97316','#ea580c','#dc2626','#b91c1c','#991b1b','#7f1d1d'];
                const getAgingColor = (bucket: string, sla: number) => {
                  const day = bucket === '15+' ? 16 : parseInt(bucket);
                  // ไม่มี SLA (sla=0) → ดำทุกช่อง
                  if (sla <= 0) return '#1e293b';
                  if (day <= sla) {
                    // ภายใน SLA → เขียวไล่เฉด
                    const idx = Math.min(Math.floor((day - 1) / Math.max(sla / GREEN_SHADES.length, 1)), GREEN_SHADES.length - 1);
                    return GREEN_SHADES[idx];
                  } else {
                    // เลย SLA → เหลือง→แดง ตามจำนวนวันที่เกิน
                    const overDays = day - sla;
                    const maxOver = 16 - sla;
                    const idx = Math.min(Math.floor((overDays - 1) / Math.max(maxOver / OVER_COLORS.length, 1)), OVER_COLORS.length - 1);
                    return OVER_COLORS[idx];
                  }
                };

                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    {/* Header + Dropdown */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="font-semibold text-slate-900">
                          {heatmapMode === 'pending' ? 'งานค้างในกระบวนการ 30 วันแยกตาม process' : 'งานค้างที่กำลังดำเนินการ'}
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {heatmapMode === 'pending'
                            ? 'จำนวน Booking ที่ยังไม่ได้เริ่มดำเนินการ แยกตาม Aging'
                            : 'จำนวน Booking ที่เริ่มดำเนินการแล้ว แต่ยังไม่เสร็จ แยกตาม Aging'}
                        </p>
                      </div>
                      <select
                        className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={heatmapMode}
                        onChange={e => { setHeatmapMode(e.target.value as 'pending' | 'inprogress'); setHeatmapCell(null); }}>
                        <option value="pending">ยังไม่ได้ดำเนินการ</option>
                        <option value="inprogress">กำลังดำเนินการ</option>
                      </select>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center h-3 rounded overflow-hidden">
                          {GREEN_SHADES.slice(0, 3).map((c, i) => <div key={i} className="h-full w-3" style={{ backgroundColor: c }} />)}
                        </div>
                        <span className="text-[10px] text-slate-500">ภายใน SLA</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center h-3 rounded overflow-hidden">
                          {OVER_COLORS.map((c, i) => <div key={i} className="h-full w-3" style={{ backgroundColor: c }} />)}
                        </div>
                        <span className="text-[10px] text-slate-500">เกิน SLA</span>
                      </div>
                    </div>

                    {/* ─── Heatmap Table + Booking List ─── */}
                    {(() => {
                      const filteredBookings = heatmapCell
                        ? (backlogBookingMap[`${heatmapCell.processKey}|${heatmapCell.agingDay}`] || [])
                        : [];
                      const selProc = heatmapCell ? activeData.find(p => p.key === heatmapCell.processKey) : null;
                      return (
                      <div className="grid grid-cols-10 gap-3">
                        <div className="flex items-center gap-3 col-span-10 mb-1">
                          <span className="text-[10px] text-slate-400 font-medium">หมวด:</span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-600"><span className="w-3 h-3 rounded-sm bg-indigo-500" /> เอกสาร</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-600"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#4ade80' }} /> LivNex</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-600"><span className="w-3 h-3 rounded-sm bg-amber-500" /> สินเชื่อ</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-600"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#0891b2' }} /> CS Inspect</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-600"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#7c3aed' }} /> Con Review</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-600"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> โอน</div>
                        </div>
                        {/* ซ้าย: Heatmap */}
                        <div className="col-span-7 overflow-x-auto">
                          <table className="w-full text-[11px]" style={{ tableLayout: 'fixed' }}>
                            <colgroup>
                              <col style={{ width: 72 }} />
                              <col style={{ width: 180 }} />
                              <col style={{ width: 36 }} />
                              <col style={{ width: 36 }} />
                              {agingKeys.map(b => <col key={b} />)}
                            </colgroup>
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="text-left py-1.5 px-2 text-slate-500 font-medium whitespace-nowrap">หมวด</th>
                                <th className="text-left py-1.5 px-1 text-slate-500 font-medium whitespace-nowrap">กระบวนการ</th>
                                <th className="text-center py-1.5 px-1 text-slate-500 font-medium">SLA</th>
                                <th className="text-center py-1.5 px-2 text-slate-500 font-medium">ค้าง</th>
                                {agingKeys.map(b => <th key={b} className="text-center py-1.5 px-0 text-slate-500 font-medium text-[10px]">{b}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const rows: React.ReactNode[] = [];
                                let lastGroup = '';
                                let lastSubGroup = '';
                                // กลุ่มที่มี subGroup (สินเชื่อ, ตรวจบ้าน)
                                const groupsWithSub = new Set(activeData.filter(p => (p as any).subGroup).map(p => p.group));

                                const renderGroupHeader = (key: string, label: string, group: string, total: number) => {
                                  const grpColor = GROUP_COLORS[group] || '#94a3b8';
                                  const isCollapsed = collapsedGroups.has(key);
                                  return (
                                    <tr key={`grp-${key}`}
                                      className="border-b cursor-pointer hover:brightness-95 transition-colors"
                                      style={{ backgroundColor: grpColor + '18', borderColor: grpColor + '40' }}
                                      onClick={() => setCollapsedGroups(prev => {
                                        const next = new Set(prev);
                                        next.has(key) ? next.delete(key) : next.add(key);
                                        return next;
                                      })}>
                                      <td className="py-1 px-2" colSpan={2}>
                                        <span className="inline-flex items-center gap-1.5">
                                          <span style={{ color: grpColor }} className="text-[10px]">{isCollapsed ? '▶' : '▼'}</span>
                                          <span style={{ color: grpColor }} className="font-semibold text-[11px]">{label}</span>
                                        </span>
                                      </td>
                                      <td className="py-1 px-1 text-center text-[10px]" style={{ color: grpColor }}>—</td>
                                      <td className="py-1 px-2 text-center font-bold text-[11px]" style={{ color: grpColor }}>{total}</td>
                                      {agingKeys.map(b => <td key={b} style={{ backgroundColor: grpColor + '18' }} />)}
                                    </tr>
                                  );
                                };

                                for (const p of activeData) {
                                  const sg = (p as any).subGroup as string | undefined;

                                  // Main group header — แสดงครั้งแรกที่เจอ group ใหม่
                                  if (p.group !== lastGroup) {
                                    lastGroup = p.group;
                                    lastSubGroup = '';
                                    const grpTotal = activeData.filter(pp => pp.group === p.group).reduce((s, pp) => s + pp.count, 0);
                                    rows.push(renderGroupHeader(p.group, p.group, p.group, grpTotal));
                                  }

                                  // Sub-group header — แสดงเมื่อเจอ subGroup ใหม่
                                  if (sg && sg !== lastSubGroup) {
                                    lastSubGroup = sg;
                                    const sgTotal = activeData.filter(pp => (pp as any).subGroup === sg).reduce((s, pp) => s + pp.count, 0);
                                    rows.push(renderGroupHeader(sg, sg, p.group, sgTotal));
                                  }

                                  // ถ้า collapse อยู่ ไม่แสดงแถว process
                                  if (collapsedGroups.has(p.group)) continue;
                                  if (sg && collapsedGroups.has(sg)) continue;

                                  rows.push(
                                    <tr key={p.key} className="border-b border-slate-100 hover:bg-slate-50">
                                      <td className="py-1 px-2">
                                        <span className="inline-flex items-center gap-1">
                                          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: GROUP_COLORS[p.group] }} />
                                          <span className="text-slate-500"></span>
                                        </span>
                                      </td>
                                      <td className="py-1 px-2 font-medium text-slate-800 whitespace-nowrap">{p.label}</td>
                                      <td className="py-1 px-1 text-center text-[10px] font-bold text-blue-600 cursor-help" title={p.slaDesc || undefined}>{p.sla > 0 ? `${p.sla}d` : '-'}</td>
                                      <td className="py-1 px-2 text-center font-bold text-slate-900">{p.count}</td>
                                      {agingKeys.map(b => {
                                        const v = p.aging[b];
                                        const isSelected = heatmapCell?.processKey === p.key && heatmapCell?.agingDay === b;
                                        const cellColor = getAgingColor(b, p.sla);
                                        return (
                                          <td key={b}
                                            className={`text-center font-bold cursor-pointer transition-colors ${isSelected ? 'outline outline-3 outline-yellow-400 -outline-offset-1' : 'border border-white/20'}`}
                                            style={{ backgroundColor: v > 0 ? (isSelected ? '#1e293b' : cellColor) : '#f1f5f9', color: v > 0 ? (isSelected ? '#fde047' : '#fff') : '#cbd5e1' }}
                                            onClick={() => v > 0 && setHeatmapCell(
                                              heatmapCell?.processKey === p.key && heatmapCell?.agingDay === b ? null : { processKey: p.key, agingDay: b }
                                            )}>
                                            {v > 0 ? v : '-'}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                }
                                return rows;
                              })()}
                            </tbody>
                          </table>
                        </div>

                        {/* ขวา: Booking List */}
                        <div className="col-span-3 border-l border-slate-200 pl-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-slate-700">
                              {heatmapCell && selProc
                                ? <>{selProc.group}{(selProc as any).subGroup ? ` (${(selProc as any).subGroup})` : ''} › {selProc.label} › <span style={{ color: AGING_COLORS[heatmapCell.agingDay as keyof typeof AGING_COLORS] }}>{heatmapCell.agingDay} วัน</span></>
                                : 'คลิกที่ช่องใน Heatmap เพื่อดูรายการ'}
                            </h4>
                            {heatmapCell && <span className="text-[10px] font-bold text-slate-500">{filteredBookings.length} รายการ</span>}
                          </div>
                          {heatmapCell && (
                            <button onClick={() => setHeatmapCell(null)} className="text-[10px] text-blue-600 hover:underline mb-2">ยกเลิก filter</button>
                          )}
                          <div className="overflow-y-auto space-y-1" style={{ maxHeight: 520 }}>
                            {!heatmapCell ? (
                              <div className="text-center text-slate-400 text-xs py-12">
                                <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                                คลิกช่องสีใน Heatmap<br/>เพื่อแสดงรายการใบจอง
                              </div>
                            ) : filteredBookings.length === 0 ? (
                              <div className="text-center text-slate-400 text-xs py-8">ไม่มีรายการ</div>
                            ) : filteredBookings.map((bk, i) => (
                              <div key={`${bk.id}-${i}`}
                                className="flex items-start gap-2 p-2 rounded bg-white border border-slate-100 hover:border-blue-400 hover:bg-blue-50 cursor-pointer text-[11px] transition"
                                onClick={() => { setDefaultTab(undefined); setSelectedBooking(bk); }}>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-blue-700">{bk.id}</div>
                                  <div className="text-slate-700 truncate">{bk.customer_name}</div>
                                  <div className="text-slate-400 truncate">{bk.project_name} • Unit {bk.unit_no}</div>
                                  <div className="text-slate-500 truncate">{bk.sale_name} <span className="text-slate-400">({bk.current_owner_team})</span></div>
                                </div>
                                <div className="text-right shrink-0 space-y-0.5">
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                                    style={{ backgroundColor: AGING_COLORS[heatmapCell.agingDay as keyof typeof AGING_COLORS] || '#94a3b8' }}>
                                    {heatmapCell.agingDay} วัน
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      );
                    })()}

                  </div>
                );
              })()}




              {/* ════════ SLA Compliance — รายโครงการ (dropdown สลับ งานค้าง/โอนแล้ว) ════════ */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {projectSlaView === 'backlog' ? 'สถานะงานค้าง — รายโครงการ' : 'SLA Compliance — โอนแล้ว (รายโครงการ)'}
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {projectSlaView === 'backlog'
                        ? 'ภาพรวมงานค้างแต่ละโครงการ ทำได้ตาม SLA หรือไม่'
                        : 'ภาพรวมแต่ละโครงการ ทำได้ตาม SLA หรือไม่ — เฉพาะ Booking ที่โอนแล้ว'}
                    </p>
                  </div>
                  <select
                    value={projectSlaView}
                    onChange={e => { setProjectSlaView(e.target.value as 'backlog' | 'transferred'); setSelectedProject(null); }}
                    className="text-[11px] border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="backlog">งานค้าง</option>
                    <option value="transferred">งานที่จบแล้ว</option>
                  </select>
                </div>

                {(() => {
                  const panelItems = selectedProject
                    ? PROJECT_BOOKING_ITEMS.filter(b => b.project === selectedProject && b.status === projectSlaView)
                    : [];
                  return (
                  <div className="grid grid-cols-10 gap-3">
                    {/* ซ้าย: ตาราง */}
                    <div className="col-span-7 overflow-x-auto">
                {projectSlaView === 'transferred' ? (
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2 text-slate-500 font-medium" style={{ width: 200 }}>โครงการ</th>
                        <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 50 }}>โอนแล้ว</th>
                        <th className="text-center py-2 px-2 text-slate-500 font-medium whitespace-nowrap" style={{ width: 55 }}>≤30d</th>
                        <th className="text-center py-2 px-2 text-slate-500 font-medium whitespace-nowrap" style={{ width: 55 }}>&gt;30d</th>
                        <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 60 }}>เฉลี่ย</th>
                        <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 50 }}>%SLA</th>
                        <th className="py-2 px-2 text-slate-500 font-medium text-[9px]" style={{ minWidth: 100 }}>
                          <div className="flex justify-between"><span className="text-emerald-500">≤30d</span><span className="text-red-400">&gt;30d</span></div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...SLA_COMPLIANCE_DATA].sort((a, b) => b.n - a.n).map(row => {
                        const barW30 = row.n > 0 ? (row.within30 / row.n) * 100 : 0;
                        const isSelected = selectedProject === row.pName;
                        return (
                          <tr key={row.pName}
                            className={`border-b border-slate-100 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}
                            onClick={() => setSelectedProject(isSelected ? null : row.pName)}>
                            <td className="py-1 px-2 font-medium text-slate-800 truncate" title={row.pName}>{row.pName}</td>
                            <td className="py-1 px-2 text-center font-bold text-slate-700 tabular-nums">{row.n}</td>
                            <td className="py-1 px-2 text-center font-bold text-emerald-600 tabular-nums">{row.within30}</td>
                            <td className="py-1 px-2 text-center font-bold text-red-500 tabular-nums">{row.over30}</td>
                            <td className="py-1 px-2 text-center tabular-nums">
                              <span className={`font-bold ${row.avgE2E <= 30 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {row.avgE2E}d
                              </span>
                            </td>
                            <td className="py-1 px-2 text-center">
                              <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                row.pct >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                row.pct >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {row.pct}%
                              </span>
                            </td>
                            <td className="p-0 relative">
                              <div className="absolute inset-y-[2px] inset-x-0 flex overflow-hidden">
                                <div className="h-full flex items-center justify-center" style={{ width: `${barW30}%`, backgroundColor: '#059669' }}>
                                  {row.within30 > 0 && barW30 > 25 && <span className="text-[8px] font-bold text-white">{row.within30}</span>}
                                </div>
                                {row.over30 > 0 && (
                                  <div className="h-full flex items-center justify-center" style={{ width: `${100 - barW30}%`, backgroundColor: '#dc2626' }}>
                                    {(100 - barW30) > 25 && <span className="text-[8px] font-bold text-white">{row.over30}</span>}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2 text-slate-500 font-medium" style={{ width: 200 }}>โครงการ</th>
                        <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 50 }}>ค้าง</th>
                        <th className="text-center py-2 px-2 text-slate-500 font-medium whitespace-nowrap" style={{ width: 55 }}>ตาม</th>
                        <th className="text-center py-2 px-2 text-slate-500 font-medium whitespace-nowrap" style={{ width: 55 }}>เกิน</th>
                        <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 60 }}>เฉลี่ย</th>
                        <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 50 }}>%SLA</th>
                        <th className="py-2 px-2 text-slate-500 font-medium text-[9px]" style={{ minWidth: 100 }}>
                          <div className="flex justify-between"><span className="text-emerald-500">ตาม</span><span className="text-red-400">เกิน</span></div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...BACKLOG_BY_PROJECT_DATA].sort((a, b) => b.n - a.n).map(row => {
                        const barOk = row.n > 0 ? (row.withinSla / row.n) * 100 : 0;
                        const isSelected = selectedProject === row.pName;
                        return (
                          <tr key={row.pName}
                            className={`border-b border-slate-100 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}
                            onClick={() => setSelectedProject(isSelected ? null : row.pName)}>
                            <td className="py-1 px-2 font-medium text-slate-800 truncate" title={row.pName}>{row.pName}</td>
                            <td className="py-1 px-2 text-center font-bold text-slate-700 tabular-nums">{row.n}</td>
                            <td className="py-1 px-2 text-center font-bold text-emerald-600 tabular-nums">{row.withinSla}</td>
                            <td className="py-1 px-2 text-center font-bold text-red-500 tabular-nums">{row.overSla}</td>
                            <td className="py-1 px-2 text-center tabular-nums">
                              <span className={`font-bold ${row.avgAging <= 5 ? 'text-emerald-600' : row.avgAging <= 8 ? 'text-amber-600' : 'text-red-500'}`}>
                                {row.avgAging}d
                              </span>
                            </td>
                            <td className="py-1 px-2 text-center">
                              <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                row.pct >= 70 ? 'bg-emerald-100 text-emerald-700' :
                                row.pct >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {row.pct}%
                              </span>
                            </td>
                            <td className="p-0 relative">
                              <div className="absolute inset-y-[2px] inset-x-0 flex overflow-hidden">
                                <div className="h-full flex items-center justify-center" style={{ width: `${barOk}%`, backgroundColor: '#059669' }}>
                                  {row.withinSla > 0 && barOk > 25 && <span className="text-[8px] font-bold text-white">{row.withinSla}</span>}
                                </div>
                                {row.overSla > 0 && (
                                  <div className="h-full flex items-center justify-center" style={{ width: `${100 - barOk}%`, backgroundColor: '#dc2626' }}>
                                    {(100 - barOk) > 25 && <span className="text-[8px] font-bold text-white">{row.overSla}</span>}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                    </div>

                    {/* ขวา: Booking List Panel */}
                    <div className="col-span-3 border-l border-slate-200 pl-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-700">
                          {selectedProject
                            ? <>{selectedProject}</>
                            : 'คลิกแถวโครงการเพื่อดูรายการ'}
                        </h4>
                        {selectedProject && <span className="text-[10px] font-bold text-slate-500">{panelItems.length} รายการ</span>}
                      </div>
                      {selectedProject && (
                        <button onClick={() => setSelectedProject(null)} className="text-[10px] text-blue-600 hover:underline mb-2">ยกเลิก filter</button>
                      )}
                      <div className="overflow-y-auto space-y-1" style={{ maxHeight: 520 }}>
                        {!selectedProject ? (
                          <div className="text-center text-slate-400 text-xs py-12">
                            <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                            คลิกแถวโครงการ<br/>เพื่อแสดงรายการใบจอง
                          </div>
                        ) : panelItems.length === 0 ? (
                          <div className="text-center text-slate-400 text-xs py-8">ไม่มีรายการ</div>
                        ) : panelItems.map((bk, i) => {
                          const real = projectBookingRealMap.get(bk.bookingNo);
                          return (
                          <div key={`${bk.bookingNo}-${i}`}
                            className="flex items-start gap-2 p-2 rounded bg-white border border-slate-100 hover:border-blue-400 hover:bg-blue-50 cursor-pointer text-[11px] transition"
                            onClick={() => { if (real) { setDefaultTab(undefined); setSelectedBooking(real); } }}>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-blue-700">{real?.id ?? bk.bookingNo}</div>
                              <div className="text-slate-700 truncate">{real?.customer_name ?? bk.customer}</div>
                              <div className="text-slate-400 truncate">{real?.project_name ?? bk.project} • Unit {real?.unit_number ?? bk.unit}</div>
                              <div className="text-slate-500 truncate">{real?.sale_name ?? bk.saleName}</div>
                            </div>
                            <div className="text-right shrink-0 space-y-0.5">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${bk.withinSla ? 'bg-emerald-500' : 'bg-red-400'}`}>
                                {bk.days} วัน
                              </span>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  );
                })()}
              </div>

              {/* ════════ Workload รายบุคคล ════════ */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900">Workload รายบุคคล</h2>
                <p className="text-[10px] text-slate-400 mt-0.5 mb-4">ภาพรวมงานค้างและ SLA แยกตามผู้รับผิดชอบ — คลิกแถวเพื่อดูใบจอง</p>
                {(() => {
                  const personPanelItems = selectedPerson
                    ? PERSON_BOOKING_ITEMS.filter(b => b.personName === selectedPerson)
                    : [];
                  return (
                  <div className="grid grid-cols-10 gap-3">
                    {/* ซ้าย: ตาราง */}
                    <div className="col-span-7 overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-2 text-slate-500 font-medium" style={{ width: 180 }}>ชื่อ</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 50 }}>งานค้าง</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 55 }}>ตาม</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 55 }}>เกิน</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 60 }}>เฉลี่ย</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 50 }}>%SLA</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 50 }}>โอนแล้ว</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium" style={{ width: 60 }}>E2E</th>
                      <th className="py-2 px-2 text-slate-500 font-medium text-[9px]" style={{ minWidth: 100 }}>
                        <div className="flex justify-between"><span className="text-emerald-500">ตาม</span><span className="text-red-400">เกิน</span></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['CO', 'CS', 'CON', 'Sale'] as const).map(team => {
                      const members = PERSON_WORKLOAD.filter(p => p.team === team);
                      if (members.length === 0) return null;
                      const teamColor = team === 'CO' ? '#8b5cf6' : team === 'CS' ? '#10b981' : team === 'CON' ? '#f59e0b' : '#3b82f6';
                      const teamLabel = team === 'CON' ? 'ก่อสร้าง' : team === 'Sale' ? 'ฝ่ายขาย' : team;
                      const sumWithin = members.reduce((s, p) => s + p.withinSla, 0);
                      const sumOver = members.reduce((s, p) => s + p.overSla, 0);
                      const sumTransferred = members.reduce((s, p) => s + p.transferred, 0);
                      return (
                        <Fragment key={team}>
                          <tr style={{ backgroundColor: `${teamColor}10` }}>
                            <td className="py-1.5 px-2 font-bold text-[11px]" style={{ color: teamColor }} colSpan={2}>
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: teamColor }} />
                                {teamLabel}
                                <span className="text-[10px] font-normal text-slate-400">({members.length} คน)</span>
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-center font-bold text-emerald-600 tabular-nums text-[10px]">{sumWithin}</td>
                            <td className="py-1.5 px-2 text-center font-bold text-red-500 tabular-nums text-[10px]">{sumOver}</td>
                            <td className="py-1.5 px-2" colSpan={2} />
                            <td className="py-1.5 px-2 text-center font-bold tabular-nums text-[10px]" style={{ color: teamColor }}>{sumTransferred}</td>
                            <td className="py-1.5 px-2" colSpan={2} />
                          </tr>
                          {members.map(p => {
                            const barOk = p.backlog > 0 ? (p.withinSla / p.backlog) * 100 : 0;
                            const isPersonSelected = selectedPerson === p.name;
                            return (
                              <tr key={p.name}
                                className={`border-b border-slate-100 cursor-pointer transition-colors ${isPersonSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}
                                onClick={() => setSelectedPerson(isPersonSelected ? null : p.name)}>
                                <td className="py-1 px-2 font-medium text-slate-800 truncate" title={p.name}>
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold text-white" style={{ backgroundColor: teamColor }}>{team}</span>
                                    {p.name}
                                  </span>
                                </td>
                                <td className="py-1 px-2 text-center font-bold text-slate-700 tabular-nums">{p.backlog}</td>
                                <td className="py-1 px-2 text-center font-bold text-emerald-600 tabular-nums">{p.withinSla}</td>
                                <td className="py-1 px-2 text-center font-bold text-red-500 tabular-nums">{p.overSla}</td>
                                <td className="py-1 px-2 text-center tabular-nums">
                                  <span className={`font-bold ${p.avgAging <= 5 ? 'text-emerald-600' : p.avgAging <= 8 ? 'text-amber-600' : 'text-red-500'}`}>
                                    {p.avgAging}d
                                  </span>
                                </td>
                                <td className="py-1 px-2 text-center">
                                  <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    p.pctSla >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                    p.pctSla >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {p.pctSla}%
                                  </span>
                                </td>
                                <td className="py-1 px-2 text-center font-bold text-slate-600 tabular-nums">{p.transferred}</td>
                                <td className="py-1 px-2 text-center tabular-nums">
                                  <span className={`font-bold ${p.avgE2E <= 25 ? 'text-emerald-600' : p.avgE2E <= 30 ? 'text-amber-600' : 'text-red-500'}`}>
                                    {p.avgE2E}d
                                  </span>
                                </td>
                                <td className="p-0 relative">
                                  <div className="absolute inset-y-[2px] inset-x-0 flex overflow-hidden">
                                    <div className="h-full flex items-center justify-center" style={{ width: `${barOk}%`, backgroundColor: '#059669' }}>
                                      {p.withinSla > 0 && barOk > 25 && <span className="text-[8px] font-bold text-white">{p.withinSla}</span>}
                                    </div>
                                    {p.overSla > 0 && (
                                      <div className="h-full flex items-center justify-center" style={{ width: `${100 - barOk}%`, backgroundColor: '#dc2626' }}>
                                        {(100 - barOk) > 25 && <span className="text-[8px] font-bold text-white">{p.overSla}</span>}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
                    </div>

                    {/* ขวา: Booking List Panel */}
                    <div className="col-span-3 border-l border-slate-200 pl-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-700">
                          {selectedPerson
                            ? <>{selectedPerson}</>
                            : 'คลิกแถวเพื่อดูรายการ'}
                        </h4>
                        {selectedPerson && <span className="text-[10px] font-bold text-slate-500">{personPanelItems.length} รายการ</span>}
                      </div>
                      {selectedPerson && (
                        <button onClick={() => setSelectedPerson(null)} className="text-[10px] text-blue-600 hover:underline mb-2">ยกเลิก filter</button>
                      )}
                      <div className="overflow-y-auto space-y-1" style={{ maxHeight: 520 }}>
                        {!selectedPerson ? (
                          <div className="text-center text-slate-400 text-xs py-12">
                            <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                            คลิกแถวบุคคล<br/>เพื่อแสดงรายการใบจอง
                          </div>
                        ) : personPanelItems.length === 0 ? (
                          <div className="text-center text-slate-400 text-xs py-8">ไม่มีรายการ</div>
                        ) : personPanelItems.map((bk, i) => {
                          const real = personBookingRealMap.get(bk.bookingNo);
                          return (
                          <div key={`${bk.bookingNo}-${i}`}
                            className="flex items-start gap-2 p-2 rounded bg-white border border-slate-100 hover:border-blue-400 hover:bg-blue-50 cursor-pointer text-[11px] transition"
                            onClick={() => { if (real) { setDefaultTab(undefined); setSelectedBooking(real); } }}>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-blue-700">{real?.id ?? bk.bookingNo}</div>
                              <div className="text-slate-700 truncate">{real?.customer_name ?? bk.customer}</div>
                              <div className="text-slate-400 truncate">{real?.project_name ?? bk.project} • Unit {real?.unit_number ?? bk.unit}</div>
                            </div>
                            <div className="text-right shrink-0 space-y-0.5">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${bk.withinSla ? 'bg-emerald-500' : 'bg-red-400'}`}>
                                {bk.days} วัน
                              </span>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  );
                })()}
              </div>

              {/* ════════ Performance พนักงาน — %SLA รายเดือน ════════ */}
              {(() => {
                const teamColors: Record<string, string> = { CO: '#8b5cf6', CS: '#10b981', CON: '#f59e0b', Sale: '#3b82f6' };
                // 13 สีแตกต่างชัดเจน — แต่ละคนคนละสี
                const DISTINCT_COLORS = [
                  '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
                  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990',
                  '#dcbeff', '#9A6324', '#800000',
                ];
                const personColors: Record<string, string> = {};
                PERSON_WORKLOAD.forEach((p, i) => { personColors[p.name] = DISTINCT_COLORS[i % DISTINCT_COLORS.length]; });

                const filteredPersons = perfTeamFilter === 'all'
                  ? PERSON_WORKLOAD
                  : PERSON_WORKLOAD.filter(p => p.team === perfTeamFilter);

                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="font-semibold text-slate-900">Performance พนักงาน — %SLA รายเดือน</h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">แต่ละเส้นคือพนักงาน 1 คน</p>
                      </div>
                      <select
                        value={perfTeamFilter}
                        onChange={e => setPerfTeamFilter(e.target.value as typeof perfTeamFilter)}
                        className="text-[11px] border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="all">ทุกทีม</option>
                        <option value="CO">CO</option>
                        <option value="CS">CS</option>
                        <option value="CON">ก่อสร้าง (CON)</option>
                        <option value="Sale">ฝ่ายขาย</option>
                      </select>
                    </div>
                    {/* Legend แยกทีม */}
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
                      {(['CO', 'CS', 'CON', 'Sale'] as const)
                        .filter(team => perfTeamFilter === 'all' || team === perfTeamFilter)
                        .map(team => {
                        const members = PERSON_WORKLOAD.filter(p => p.team === team);
                        return (
                          <div key={team} className="flex items-center gap-2">
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold text-white" style={{ backgroundColor: teamColors[team] }}>{team}</span>
                            {members.map(p => (
                              <div key={p.name} className="flex items-center gap-1 text-[10px] text-slate-600">
                                <div className="w-4 h-1 rounded-full" style={{ backgroundColor: personColors[p.name] }} />
                                {p.name.replace(/\s*\(.*\)/, '')}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    <ResponsiveContainer width="100%" height={360}>
                      <ComposedChart data={PERSON_MONTHLY_SLA} margin={{ left: 0, right: 10, top: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis unit="%" tick={{ fontSize: 11 }} domain={[20, 100]} />
                        <Tooltip
                          contentStyle={{ fontSize: 11, borderRadius: 8, maxHeight: 300, overflowY: 'auto' }}
                          formatter={(value: number, name: string) => [`${value}%`, name]}
                        />
                        {filteredPersons.map(p => (
                          <Line
                            key={p.name}
                            type="monotone"
                            dataKey={p.name}
                            stroke={personColors[p.name]}
                            strokeWidth={2}
                            dot={{ r: 3, fill: personColors[p.name], stroke: '#fff', strokeWidth: 1 }}
                            activeDot={{ r: 5 }}
                            label={{ fontSize: 9, fill: personColors[p.name], position: 'top', formatter: (v: number) => `${v}%` }}
                          />
                        ))}
                        {/* เส้น SLA target 80% */}
                        <Line
                          type="monotone"
                          dataKey={() => 80}
                          stroke="#dc2626"
                          strokeWidth={1}
                          strokeDasharray="6 4"
                          dot={false}
                          activeDot={false}
                          name="เป้า 80%"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}

              {/* ════════ สถานะสินเชื่อรายธนาคาร ════════ */}
              {(() => {
                const totalSubmitted = BANK_CREDIT_STATUS.reduce((s, r) => s + r.approved + r.pendingFinal + r.pendingPreapprove + r.rejected, 0);
                const totalApproved = BANK_CREDIT_STATUS.reduce((s, r) => s + r.approved, 0);
                const totalPending = BANK_CREDIT_STATUS.reduce((s, r) => s + r.pendingFinal + r.pendingPreapprove, 0);
                const totalRejected = BANK_CREDIT_STATUS.reduce((s, r) => s + r.rejected, 0);
                const pctApproved = totalSubmitted > 0 ? Math.round((totalApproved / totalSubmitted) * 100) : 0;
                const pctPending = totalSubmitted > 0 ? Math.round((totalPending / totalSubmitted) * 100) : 0;
                const pctRejected = totalSubmitted > 0 ? Math.round((totalRejected / totalSubmitted) * 100) : 0;

                const chartData = BANK_CREDIT_STATUS.map(r => ({
                  ...r,
                  total: r.approved + r.pendingFinal + r.pendingPreapprove + r.rejected,
                }));

                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="text-base font-bold text-slate-700 mb-4">สถานะสินเชื่อรายธนาคาร</h3>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-5">
                      <div className="border-l-4 border-slate-400 bg-slate-50 rounded-r-lg px-4 py-3">
                        <div className="text-xs text-slate-500">ยื่นทั้งหมด</div>
                        <div className="text-2xl font-bold text-slate-700">{totalSubmitted}</div>
                        <div className="text-xs text-slate-400">รายการ</div>
                      </div>
                      <div className="border-l-4 bg-emerald-50 rounded-r-lg px-4 py-3" style={{ borderColor: '#059669' }}>
                        <div className="text-xs text-slate-500">อนุมัติ</div>
                        <div className="text-2xl font-bold" style={{ color: '#059669' }}>{totalApproved}</div>
                        <div className="text-xs text-slate-400">{pctApproved}%</div>
                      </div>
                      <div className="border-l-4 bg-amber-50 rounded-r-lg px-4 py-3" style={{ borderColor: '#d97706' }}>
                        <div className="text-xs text-slate-500">รออนุมัติ</div>
                        <div className="text-2xl font-bold" style={{ color: '#d97706' }}>{totalPending}</div>
                        <div className="text-xs text-slate-400">{pctPending}%</div>
                      </div>
                      <div className="border-l-4 bg-red-50 rounded-r-lg px-4 py-3" style={{ borderColor: '#dc2626' }}>
                        <div className="text-xs text-slate-500">ไม่อนุมัติ</div>
                        <div className="text-2xl font-bold" style={{ color: '#dc2626' }}>{totalRejected}</div>
                        <div className="text-xs text-slate-400">{pctRejected}%</div>
                      </div>
                    </div>

                    {/* Stacked Bar Chart */}
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="bank" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          formatter={(value: number, name: string) => [value, name]}
                          contentStyle={{ fontSize: 12 }}
                        />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="square"
                          iconSize={10}
                          wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                        />
                        <Bar dataKey="approved" name="อนุมัติจริง" stackId="a" fill="#059669">
                          <LabelList dataKey="approved" position="center" style={{ fill: '#fff', fontSize: 10, fontWeight: 700 }} formatter={(v: number) => v > 0 ? v : ''} />
                        </Bar>
                        <Bar dataKey="pendingFinal" name="รอ Final" stackId="a" fill="#0284c7">
                          <LabelList dataKey="pendingFinal" position="center" style={{ fill: '#fff', fontSize: 10, fontWeight: 700 }} formatter={(v: number) => v > 0 ? v : ''} />
                        </Bar>
                        <Bar dataKey="pendingPreapprove" name="รอเบื้องต้น" stackId="a" fill="#d97706">
                          <LabelList dataKey="pendingPreapprove" position="center" style={{ fill: '#fff', fontSize: 10, fontWeight: 700 }} formatter={(v: number) => v > 0 ? v : ''} />
                        </Bar>
                        <Bar dataKey="rejected" name="ไม่อนุมัติ" stackId="a" fill="#dc2626" radius={[3, 3, 0, 0]}>
                          <LabelList dataKey="rejected" position="center" style={{ fill: '#fff', fontSize: 10, fontWeight: 700 }} formatter={(v: number) => v > 0 ? v : ''} />
                          <LabelList dataKey="total" position="top" style={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}

              {/* ════════ รายการติดปัญหา ════════ */}
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
                        onClick={() => { setDefaultTab(undefined); setSelectedBooking(booking); }}
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
                          onClick={() => { setDefaultTab(undefined); setSelectedBooking(booking); }}
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
                    onClick={() => { setDefaultTab(undefined); setSelectedBooking(booking); }}
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
                    onClick={() => { setDefaultTab(undefined); setSelectedBooking(booking); }}
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
                    onClick={() => { setDefaultTab(undefined); setSelectedBooking(booking); }}
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
                          onClick={() => { setDefaultTab(undefined); setSelectedBooking(booking); }}
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
        <BookingDetailPanel key={`${selectedBooking.id}-${defaultTab || 'detail'}`} booking={selectedBooking} onClose={() => { setSelectedBooking(null); setDefaultTab(undefined); }} currentView={currentView} stageFilter={stageFilter} defaultTab={defaultTab} />
      )}
    </div>
  );
}

