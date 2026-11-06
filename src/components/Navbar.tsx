import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Printer, 
  FileSpreadsheet, 
  HelpCircle, 
  LogOut, 
  Settings, 
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { ActiveTab } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  username: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  onOpenSettings,
  username,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'guests', label: 'Khách mời', icon: <Users className="w-4 h-4" /> },
    { id: 'expenses', label: 'Chi tiêu', icon: <Receipt className="w-4 h-4" /> },
    { id: 'print', label: 'In ấn A4', icon: <Printer className="w-4 h-4" /> },
    { id: 'sheets', label: 'Google Sheets', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'guide', label: 'Hướng dẫn', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Top Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & App Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/20">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                  QUẢN LÝ KHÁCH MỜI
                </span>
                <span className="text-[11px] font-semibold text-rose-600 hidden sm:block">
                  SỔ MỪNG CƯỚI & CHI TIÊU
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User & Security Actions */}
            <div className="flex items-center gap-2">
              {/* Security Pill */}
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phiên an toàn</span>
              </div>

              {/* PWA Install Button */}
              <PWAInstallButton variant="compact" />

              {/* Settings Button */}
              <button
                onClick={onOpenSettings}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cài đặt tài khoản & thông tin đám cưới"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Cài đặt</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200/80 transition-all cursor-pointer"
                title="Đăng xuất khỏi hệ thống ngay lập tức"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Very thumb-friendly) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 flex justify-around items-center no-print">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                isActive ? 'text-rose-600 scale-105' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-rose-50 text-rose-600' : ''}`}>
                {item.icon}
              </div>
              <span className="mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
