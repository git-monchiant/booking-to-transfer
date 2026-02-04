'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  List,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Building2,
  CheckCircle2,
  Layers,
  Settings,
  Wallet,
  FileText,
  LucideIcon,
} from 'lucide-react';
import { STAGE_CONFIG, TEAM_CONFIG, Stage, Team, Booking, formatMoney } from '@/data/bookings';

// Types for menu configuration
export type View =
  | 'dashboard'
  | 'pipeline'
  | 'list'
  | 'list-stage'
  | 'blocked'
  | 'team'
  | 'after-transfer'
  | 'refund'
  | 'meter'
  | 'handover';

interface MenuItemBase {
  id: string;
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: number | string;
  badgeColor?: string;
  disabled?: boolean;
}

interface MenuItemAction extends MenuItemBase {
  view: View;
  stageFilter?: Stage | 'all';
  teamFilter?: Team;
}

interface MenuItemStage extends MenuItemBase {
  view: 'list';
  stageFilter: Stage;
  color: string;
}

interface MenuItemTeam extends MenuItemBase {
  view: 'team';
  teamFilter: Team;
  color: string;
}

type MenuItem = MenuItemAction | MenuItemStage | MenuItemTeam;

interface MenuGroup {
  id: string;
  label: string;
  icon?: LucideIcon;
  defaultExpanded?: boolean;
  disabled?: boolean;
  disabledLabel?: string;
  items?: MenuItem[];
  dynamicItems?: 'stages' | 'teams';
}

// Menu configuration object
export const createMenuConfig = (
  globalFilteredBookings: Booking[],
  blockedCount: number
): MenuGroup[] => [
  {
    id: 'overview',
    label: 'Overview',
    defaultExpanded: true,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        view: 'dashboard',
      },
      {
        id: 'pipeline',
        label: 'Pipeline',
        icon: Layers,
        view: 'pipeline',
      },
    ],
  },
  {
    id: 'bookings',
    label: 'Bookings',
    defaultExpanded: true,
    items: [
      {
        id: 'all-bookings',
        label: 'All Bookings',
        icon: List,
        view: 'list',
        stageFilter: 'all',
        badge: globalFilteredBookings.length,
        badgeColor: 'bg-slate-700',
      },
      // Dynamic stage items will be added
      ...Object.entries(STAGE_CONFIG).map(([key, config]) => ({
        id: `stage-${key}`,
        label: config.label,
        view: 'list' as const,
        stageFilter: key as Stage,
        color: config.color,
        badge: globalFilteredBookings.filter(b => b.stage === key).length,
      })),
      {
        id: 'blocked',
        label: 'Blocked',
        icon: AlertTriangle,
        view: 'blocked',
        badge: blockedCount,
        badgeColor: 'bg-amber-600',
      },
      {
        id: 'after-transfer-overview',
        label: 'After Transfer',
        icon: List,
        view: 'after-transfer',
        badge: globalFilteredBookings.filter(b => b.transferred_actual_flag).length,
        badgeColor: 'bg-slate-700',
      },
      {
        id: 'refund',
        label: 'เงินทอน',
        icon: Wallet,
        iconColor: '#f59e0b',
        view: 'refund' as const,
        badge: globalFilteredBookings.filter(b => b.refund_status && b.refund_status !== 'ไม่มี').length,
      },
      {
        id: 'freebie',
        label: 'ของแถม',
        icon: FileText,
        iconColor: '#10b981',
        view: 'handover' as const,
        badge: globalFilteredBookings.filter(b => b.transferred_actual_flag && !b.handover_document_received_date).length,
      },
      {
        id: 'meter',
        label: 'มิเตอร์น้ำ-ไฟ',
        icon: Settings,
        iconColor: '#3b82f6',
        view: 'meter' as const,
        badge: globalFilteredBookings.filter(b => b.transferred_actual_flag && (!b.water_meter_change_date || !b.electricity_meter_change_date)).length,
      },
      {
        id: 'pending-work',
        label: 'งานค้าง',
        icon: AlertTriangle,
        iconColor: '#ef4444',
        view: 'handover' as const,
        badge: globalFilteredBookings.filter(b => b.transferred_actual_flag && !b.handover_document_received_date).length,
      },
    ],
  },
  {
    id: 'teams',
    label: 'Teams',
    defaultExpanded: false,
    items: [
      {
        id: 'all-teams',
        label: 'All Teams',
        icon: List,
        view: 'team',
        teamFilter: 'Sale' as Team,
        badge: globalFilteredBookings.filter(
          b => b.stage !== 'transferred' && b.stage !== 'cancelled'
        ).length,
        badgeColor: 'bg-slate-700',
      },
      ...Object.entries(TEAM_CONFIG).map(([key, config]) => ({
        id: `team-${key}`,
        label: config.label,
        view: 'team' as const,
        teamFilter: key as Team,
        color: config.color,
        badge: globalFilteredBookings.filter(
          b => b.current_owner_team === key && b.stage !== 'transferred' && b.stage !== 'cancelled'
        ).length,
      })),
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    disabled: true,
    disabledLabel: 'Soon',
  },
];

interface SidebarProps {
  currentView: View;
  stageFilter: Stage | 'all';
  selectedTeam: Team;
  globalFilteredBookings: Booking[];
  blockedCount: number;
  onViewChange: (view: View) => void;
  onStageFilterChange: (stage: Stage | 'all') => void;
  onTeamChange: (team: Team) => void;
}

export function Sidebar({
  currentView,
  stageFilter,
  selectedTeam,
  globalFilteredBookings,
  blockedCount,
  onViewChange,
  onStageFilterChange,
  onTeamChange,
}: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    overview: true,
    bookings: true,
    teams: false,
    afterTransfer: false,
  });

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const menuConfig = createMenuConfig(globalFilteredBookings, blockedCount);

  const handleMenuItemClick = (item: MenuItem) => {
    if ('view' in item) {
      onViewChange(item.view);
      if ('stageFilter' in item && item.stageFilter !== undefined) {
        onStageFilterChange(item.stageFilter);
      }
      if ('teamFilter' in item && item.teamFilter !== undefined) {
        onTeamChange(item.teamFilter);
      }
    }
  };

  const isActive = (item: MenuItem) => {
    if (!('view' in item)) return false;

    if (item.view === 'list') {
      return currentView === 'list' && stageFilter === (item.stageFilter ?? 'all');
    }
    if (item.view === 'team') {
      return currentView === 'team' && selectedTeam === item.teamFilter;
    }
    return currentView === item.view;
  };

  const getItemStyle = (item: MenuItem, active: boolean) => {
    if (!active) return {};

    // Use iconColor for items with colored icons
    if ('iconColor' in item && (item as any).iconColor) {
      return { backgroundColor: (item as any).iconColor };
    }
    if ('color' in item && item.color) {
      return { backgroundColor: item.color };
    }
    if (item.view === 'blocked') {
      return { backgroundColor: '#f59e0b' }; // amber-500
    }
    return { backgroundColor: '#6366f1' }; // indigo-500
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
        <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-base">SENA</div>
          <div className="text-[10px] text-slate-400 -mt-0.5">Booking Tracker</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuConfig.map(group => (
          <div key={group.id} className={`mb-2 ${group.disabled ? 'opacity-50' : ''}`}>
            <button
              onClick={() => !group.disabled && toggleMenu(group.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider ${
                group.disabled ? 'cursor-not-allowed' : 'hover:text-slate-300'
              }`}
            >
              <span>{group.label}</span>
              {group.disabled && group.disabledLabel ? (
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">{group.disabledLabel}</span>
              ) : (
                expandedMenus[group.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {!group.disabled && expandedMenus[group.id] && group.items && (
              <div className="mt-1 space-y-1">
                {group.items.map(item => {
                  const active = isActive(item);
                  const Icon = 'icon' in item ? item.icon : undefined;
                  const iconColor = 'iconColor' in item ? (item as any).iconColor : undefined;
                  const hasColor = 'color' in item && item.color && !Icon;
                  const isIndented = hasColor || item.id.startsWith('stage-') || item.id.startsWith('team-') || iconColor;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
                        ${isIndented ? 'pl-6' : ''}
                        ${active ? 'text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                      style={getItemStyle(item, active)}
                    >
                      {Icon && <Icon className="w-4 h-4" style={iconColor && !active ? { color: iconColor } : undefined} />}
                      {hasColor && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: (item as any).color }}
                        />
                      )}
                      {item.label}
                      {item.badge !== undefined && (
                        <span
                          className={`ml-auto text-xs px-2 py-0.5 rounded ${
                            item.badgeColor || (active ? 'bg-white/20' : 'text-slate-500')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

    </aside>
  );
}
