'use client';

import { Clock, Heart, Home } from 'lucide-react';

interface TabBarProps {
  activeTab: 'home' | 'favorites' | 'schedules';
  onTabChange: (tab: 'home' | 'favorites' | 'schedules') => void;
  favoritesCount?: number;
}

export function TabBar({
  activeTab,
  onTabChange,
  favoritesCount = 0,
}: TabBarProps) {
  const tabs = [
    { id: 'home' as const, label: 'Início', icon: Home },
    { id: 'favorites' as const, label: 'Favoritos', icon: Heart, badge: favoritesCount },
    { id: 'schedules' as const, label: 'Horários', icon: Clock },
  ];

  return (
    <div className="bg-white border-t border-gray-200 sticky bottom-0 z-40">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-4 px-3 flex flex-col items-center justify-center gap-1 transition-colors relative ${
                isActive
                  ? 'text-primary-600 border-t-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
