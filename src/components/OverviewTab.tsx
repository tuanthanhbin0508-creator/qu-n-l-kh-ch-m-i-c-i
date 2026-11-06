import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Coins, 
  Receipt, 
  Wallet, 
  AlertTriangle, 
  ArrowRight, 
  UserPlus, 
  PlusCircle, 
  Printer, 
  Download,
  Calendar,
  Heart
} from 'lucide-react';
import { Guest, Expense, EventInfo, ActiveTab } from '../types';
import { formatVND } from '../utils/format';
import { exportAllWorkbook } from '../utils/excel';
import { PWAInstallButton } from './PWAInstallButton';

interface OverviewTabProps {
  guests: Guest[];
  expenses: Expense[];
  eventInfo: EventInfo;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddGuest: () => void;
  onOpenAddExpense: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  guests,
  expenses,
  eventInfo,
  setActiveTab,
  onOpenAddGuest,
  onOpenAddExpense,
}) => {
  const totalGuests = guests.length;
  const contributedGuests = guests.filter((g) => (g.amount || 0) > 0).length;
  const pendingGuests = guests.filter((g) => (g.amount || 0) === 0).length;

  const totalGiftMoney = guests.reduce((sum, g) => sum + (Number(g.amount) || 0), 0);
  const totalExpenseMoney = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remainingMoney = totalGiftMoney - totalExpenseMoney;
  const isDeficit = remainingMoney < 0;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Event Header Card */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-500/15 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Heart className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-2 text-rose-100">
              <Calendar className="w-3.5 h-3.5" />
              <span>{eventInfo.eventDate || 'Ngày trọng đại'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              {eventInfo.title}
            </h2>
            <p className="text-rose-100 text-sm sm:text-base mt-1 font-medium">
              {eventInfo.subTitle}
              {eventInfo.brideName && eventInfo.groomName && (
                <span className="block mt-1 font-bold text-white">
                  Cô Dâu: {eventInfo.brideName} & Chú Rể: {eventInfo.groomName}
                </span>
              )}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
            <button
              onClick={onOpenAddGuest}
              className="px-4 py-2.5 bg-white text-rose-700 hover:bg-rose-50 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-rose-600" />
              <span>Thêm Khách Mời</span>
            </button>
            <button
              onClick={onOpenAddExpense}
              className="px-4 py-2.5 bg-rose-700/80 hover:bg-rose-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-white/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm Khoản Chi</span>
            </button>
          </div>
        </div>
      </div>

      {/* PWA Install Banner on Mobile & Tablet */}
      <PWAInstallButton variant="banner" />

      {/* Warning Alert if Expenses exceed Contributions */}
      {isDeficit && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 flex items-start gap-4 text-amber-900 shadow-md">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-extrabold text-base text-amber-900">
              CẢNH BÁO: TỔNG CHI TIÊU ĐANG VƯỢT TỔNG TIỀN MỪNG!
            </h4>
            <p className="text-sm text-amber-800 mt-1 leading-relaxed">
              Hiện tại tổng chi tiêu ({formatVND(totalExpenseMoney)}) đã vượt quá tổng tiền mừng thực tế ({formatVND(totalGiftMoney)}) là{' '}
              <span className="font-black text-rose-600">{formatVND(Math.abs(remainingMoney))}</span>. Hãy kiểm tra lại các khoản chi hoặc cập nhật tiền mừng kịp thời.
            </p>
          </div>
        </div>
      )}

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {/* Card 1: Tổng khách */}
        <div 
          onClick={() => setActiveTab('guests')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Tổng Khách Mời
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalGuests.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">khách</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Xem danh sách</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Đã mừng */}
        <div 
          onClick={() => setActiveTab('guests')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Khách Đã Mừng
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {contributedGuests.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">khách</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-medium">
            Tỷ lệ: {totalGuests > 0 ? Math.round((contributedGuests / totalGuests) * 100) : 0}%
          </div>
        </div>

        {/* Card 3: Chưa mừng */}
        <div 
          onClick={() => setActiveTab('guests')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Khách Chưa Mừng
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {pendingGuests.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">khách</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-medium">
            Chưa vào sổ / chưa nhận
          </div>
        </div>

        {/* Card 4: Tổng tiền mừng */}
        <div 
          onClick={() => setActiveTab('guests')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Tổng Tiền Mừng
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 break-words">
              {formatVND(totalGiftMoney)}
            </div>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            Từ {contributedGuests} lượt khách mừng
          </div>
        </div>

        {/* Card 5: Tổng chi tiêu */}
        <div 
          onClick={() => setActiveTab('expenses')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Tổng Chi Tiêu
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-rose-700 break-words">
              {formatVND(totalExpenseMoney)}
            </div>
          </div>
          <div className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Chi tiết {expenses.length} khoản chi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 6: Số tiền còn lại */}
        <div className={`col-span-2 lg:col-span-1 rounded-2xl p-4 sm:p-5 border transition-all ${
          isDeficit 
            ? 'bg-rose-50/80 border-rose-300 text-rose-950 shadow-sm' 
            : 'bg-gradient-to-br from-indigo-50/90 to-emerald-50/90 border-indigo-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              Số Tiền Còn Lại
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDeficit ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-xl sm:text-2xl font-black break-words ${
              isDeficit ? 'text-rose-600' : 'text-indigo-900'
            }`}>
              {formatVND(remainingMoney)}
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500">
            = Tổng Mừng ({formatVND(totalGiftMoney)}) - Tổng Chi ({formatVND(totalExpenseMoney)})
          </div>
        </div>
      </div>

      {/* Quick Access Tools */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Công Cụ Thao Tác Nhanh
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('guests')}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 transition-colors group cursor-pointer"
          >
            <Users className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm text-slate-900">Sổ Khách Mời</div>
            <div className="text-xs text-slate-500 mt-0.5">Thêm, sửa, tìm kiếm khách</div>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 transition-colors group cursor-pointer"
          >
            <Receipt className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm text-slate-900">Bảng Chi Tiêu</div>
            <div className="text-xs text-slate-500 mt-0.5">Thuê rạp, cỗ tiệc, âm thanh</div>
          </button>

          <button
            onClick={() => setActiveTab('print')}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 transition-colors group cursor-pointer"
          >
            <Printer className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm text-slate-900">In Ấn A4</div>
            <div className="text-xs text-slate-500 mt-0.5">Mẫu trắng đen & màu chuẩn A4</div>
          </button>

          <button
            onClick={() => exportAllWorkbook(guests, expenses)}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 transition-colors group cursor-pointer"
          >
            <Download className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm text-slate-900">Xuất Excel (.xlsx)</div>
            <div className="text-xs text-slate-500 mt-0.5">Tải trọn bộ sổ cưới về máy</div>
          </button>
        </div>
      </div>
    </div>
  );
};
