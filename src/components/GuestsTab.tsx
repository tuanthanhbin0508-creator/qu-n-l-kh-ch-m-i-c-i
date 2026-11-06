import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Layers, 
  Edit3, 
  Trash2, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Coins, 
  AlertCircle,
  X,
  FileSpreadsheet,
  ArrowUpDown,
  LayoutGrid,
  List
} from 'lucide-react';
import { Guest, EventInfo } from '../types';
import { formatVND, formatNumberWithDots, parseNumberFromDots } from '../utils/format';
import { exportGuestsToExcel } from '../utils/excel';

interface GuestsTabProps {
  guests: Guest[];
  eventInfo: EventInfo;
  onAddGuest: (guestData: { name: string; address: string; amount: number; note: string }) => Promise<void>;
  onBatchAddGuests: (items: { name: string; address: string; amount: number; note: string }[]) => Promise<void>;
  onEditGuest: (id: string, guestData: { name: string; address: string; amount: number; note: string }) => Promise<void>;
  onDeleteGuest: (id: string) => Promise<void>;
  onOpenPrint: () => void;
}

export const GuestsTab: React.FC<GuestsTabProps> = ({
  guests,
  eventInfo,
  onAddGuest,
  onBatchAddGuests,
  onEditGuest,
  onDeleteGuest,
  onOpenPrint,
}) => {
  // Search, filter & sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [sortBy, setSortBy] = useState<'stt_asc' | 'stt_desc' | 'name_asc' | 'amount_desc' | 'amount_asc'>('stt_asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<Guest | null>(null);

  // Form states for Single Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    amountStr: '',
    note: '',
  });

  // Batch modal text
  const [batchText, setBatchText] = useState('');
  const [batchError, setBatchError] = useState<string | null>(null);

  // Stats calculation
  const totalGuests = guests.length;
  const contributedGuests = guests.filter((g) => (g.amount || 0) > 0).length;
  const pendingGuests = guests.filter((g) => (g.amount || 0) === 0).length;
  const totalGiftMoney = guests.reduce((sum, g) => sum + (Number(g.amount) || 0), 0);

  // Filter & Search logic
  const filteredGuests = useMemo(() => {
    let result = [...guests];

    // Status Filter
    if (statusFilter === 'paid') {
      result = result.filter((g) => g.amount > 0);
    } else if (statusFilter === 'unpaid') {
      result = result.filter((g) => g.amount === 0);
    }

    // Search term: match Name, Code, Address, or STT (1-indexed)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((g, idx) => {
        const originalIndex = guests.findIndex((item) => item.id === g.id) + 1;
        return (
          g.name.toLowerCase().includes(term) ||
          g.code.toLowerCase().includes(term) ||
          (g.address && g.address.toLowerCase().includes(term)) ||
          (g.note && g.note.toLowerCase().includes(term)) ||
          String(originalIndex) === term
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      const indexA = guests.findIndex((item) => item.id === a.id);
      const indexB = guests.findIndex((item) => item.id === b.id);

      if (sortBy === 'stt_asc') return indexA - indexB;
      if (sortBy === 'stt_desc') return indexB - indexA;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'vi');
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [guests, statusFilter, searchTerm, sortBy]);

  // Open Single Add Modal
  const handleOpenAdd = () => {
    setFormData({ name: '', address: '', amountStr: '', note: '' });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      address: guest.address || '',
      amountStr: guest.amount ? formatNumberWithDots(guest.amount) : '',
      note: guest.note || '',
    });
  };

  // Submit Single Add
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    await onAddGuest({
      name: formData.name.trim(),
      address: formData.address.trim(),
      amount: parseNumberFromDots(formData.amountStr),
      note: formData.note.trim(),
    });
    setIsAddModalOpen(false);
  };

  // Submit Edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest || !formData.name.trim()) return;

    await onEditGuest(editingGuest.id, {
      name: formData.name.trim(),
      address: formData.address.trim(),
      amount: parseNumberFromDots(formData.amountStr),
      note: formData.note.trim(),
    });
    setEditingGuest(null);
  };

  // Submit Batch Add
  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchError(null);

    const lines = batchText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setBatchError('Vui lòng nhập ít nhất một dòng thông tin khách mời.');
      return;
    }

    const items: { name: string; address: string; amount: number; note: string }[] = [];

    for (const line of lines) {
      // Support formats:
      // "Nguyễn Văn A, Hà Nội, 500000, Bạn chú rể" OR "Nguyễn Văn A - 500000" OR "Nguyễn Văn A"
      const parts = line.split(/[,;\t|]/).map((p) => p.trim());
      if (parts.length > 0 && parts[0]) {
        const name = parts[0];
        const address = parts[1] || '';
        let amount = 0;
        let note = parts[3] || '';

        // If part 2 is numeric, treat as amount; else as note
        if (parts[2]) {
          const parsed = parseNumberFromDots(parts[2]);
          if (!isNaN(parsed)) amount = parsed;
          else note = (note ? note + ' ' : '') + parts[2];
        }

        items.push({ name, address, amount, note });
      }
    }

    if (items.length === 0) {
      setBatchError('Không tìm thấy dòng hợp lệ để thêm.');
      return;
    }

    await onBatchAddGuests(items);
    setBatchText('');
    setIsBatchModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      {/* Top Header & Fast Actions */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-rose-600" />
              <span>SỔ QUẢN LÝ KHÁCH MỜI</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Quản lý danh sách khách dự đám cưới, theo dõi tiền mừng và trạng thái chi tiết.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm 1 Khách</span>
            </button>
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Thêm Hàng Loạt</span>
            </button>
            <button
              onClick={() => exportGuestsToExcel(guests, eventInfo)}
              className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs sm:text-sm border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Xuất file Excel"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
            <button
              onClick={onOpenPrint}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="In sổ A4"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">In A4</span>
            </button>
          </div>
        </div>

        {/* 4 Fast Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng khách</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {totalGuests.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">người</span>
            </div>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/60">
            <div className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã mừng
            </div>
            <div className="text-lg font-black text-emerald-700 mt-0.5">
              {contributedGuests.toLocaleString('vi-VN')} <span className="text-xs font-normal text-emerald-600">người</span>
            </div>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60">
            <div className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Chưa mừng
            </div>
            <div className="text-lg font-black text-amber-700 mt-0.5">
              {pendingGuests.toLocaleString('vi-VN')} <span className="text-xs font-normal text-amber-600">người</span>
            </div>
          </div>
          <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-200/60">
            <div className="text-[11px] font-bold text-indigo-700 uppercase flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> Tổng tiền mừng
            </div>
            <div className="text-base sm:text-lg font-black text-indigo-900 mt-0.5 truncate">
              {formatVND(totalGiftMoney)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo Tên khách, Mã (KM001), Địa chỉ, STT..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({totalGuests})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Đã mừng ({contributedGuests})
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'unpaid'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Chưa mừng ({pendingGuests})
          </button>

          {/* Sort Selector */}
          <div className="relative ml-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-3 pr-7 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="stt_asc">STT Tăng dần</option>
              <option value="stt_desc">STT Giảm dần</option>
              <option value="name_asc">Tên (A → Z)</option>
              <option value="amount_desc">Tiền mừng: Cao → Thấp</option>
              <option value="amount_asc">Tiền mừng: Thấp → Cao</option>
            </select>
          </div>

          {/* View Mode Toggle (Cards vs Table) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 px-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dạng thẻ (Dễ xem trên điện thoại)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thẻ</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 px-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dạng bảng (Chi tiết như Excel)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bảng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Either Cards or Table */}
      {filteredGuests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs text-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Chưa có khách mời nào trong danh sách</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Không tìm thấy khách phù hợp với điều kiện tìm kiếm/lọc hiện tại.'
              : 'Hãy bắt đầu thêm khách mời để theo dõi tiền mừng đám cưới.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
            >
              + Thêm Khách Mới
            </button>
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* DẠNG THẺ (CARD VIEW - Tối ưu di động & máy tính bảng) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredGuests.map((guest) => {
            const originalIndex = guests.findIndex((item) => item.id === guest.id) + 1;
            const isPaid = (guest.amount || 0) > 0;

            return (
              <div
                key={guest.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge: STT, Code & Status */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center">
                        {originalIndex}
                      </span>
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {guest.code}
                      </span>
                    </div>

                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đã mừng</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Chưa mừng</span>
                      </span>
                    )}
                  </div>

                  {/* Guest Name & Details */}
                  <div className="mt-3">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {guest.name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span>Quan hệ:</span>
                      <strong className="text-slate-700">{guest.address || 'Chưa nhập'}</strong>
                    </div>
                    {guest.note && (
                      <div className="text-xs text-slate-500 mt-0.5 italic">
                        Ghi chú: {guest.note}
                      </div>
                    )}
                  </div>

                  {/* Gift Amount */}
                  <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Tiền mừng:</span>
                    <span className={`text-base font-black ${isPaid ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {guest.amount > 0 ? formatVND(guest.amount) : '0 ₫'}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons (Big touch targets for phones) */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(guest)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa</span>
                  </button>
                  <button
                    onClick={() => setDeletingGuest(guest)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa khách</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DẠNG BẢNG (TABLE VIEW) */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-3 sm:px-4 text-center w-12">STT</th>
                  <th className="py-3 px-3 sm:px-4 w-24">Mã khách</th>
                  <th className="py-3 px-3 sm:px-4">Họ và tên</th>
                  <th className="py-3 px-3 sm:px-4 hidden sm:table-cell">Địa chỉ / Quan hệ</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Tiền mừng</th>
                  <th className="py-3 px-3 sm:px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-3 sm:px-4 hidden lg:table-cell">Ghi chú</th>
                  <th className="py-3 px-3 sm:px-4 hidden xl:table-cell">Ngày thêm</th>
                  <th className="py-3 px-3 sm:px-4 text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGuests.map((guest) => {
                  const originalIndex = guests.findIndex((item) => item.id === guest.id) + 1;
                  const isPaid = (guest.amount || 0) > 0;

                  return (
                    <tr
                      key={guest.id}
                      className="hover:bg-rose-50/40 transition-colors group"
                    >
                      <td className="py-3 px-3 sm:px-4 text-center font-bold text-slate-500 text-xs">
                        {originalIndex}
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono font-bold text-slate-700 text-xs">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {guest.code}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{guest.name}</div>
                        <div className="sm:hidden text-[11px] text-slate-500 mt-0.5">
                          {guest.address && <span>{guest.address}</span>}
                          {guest.note && <span className="ml-1 text-slate-400 italic">• {guest.note}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-slate-600 text-xs hidden sm:table-cell">
                        {guest.address || <span className="text-slate-300 italic">Chưa nhập</span>}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <div className={`font-black text-sm ${isPaid ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}`}>
                          {guest.amount > 0 ? formatVND(guest.amount) : '0 ₫'}
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Đã mừng</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Chưa mừng</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-slate-500 text-xs hidden lg:table-cell">
                        {guest.note || '-'}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-slate-400 text-[11px] hidden xl:table-cell">
                        {guest.createdAt || '-'}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(guest)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Sửa thông tin khách"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingGuest(guest)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa khách mời"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Thêm 1 Khách Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-600" />
                <span>Thêm Khách Mời Mới</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Họ và tên khách mời <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ví dụ: Bác Ba Hàng Xóm, Bạn Tuấn Anh..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Địa chỉ / Mối quan hệ
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bạn cấp 3, Họ nội, Hà Nội..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tiền mừng (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0 (nếu chưa mừng, để trống hoặc nhập 0)"
                    value={formData.amountStr}
                    onChange={(e) => {
                      const formatted = formatNumberWithDots(e.target.value);
                      setFormData({ ...formData, amountStr: formatted });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-emerald-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    VNĐ
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Quy tắc: Nhập &gt; 0 đồng → Trạng thái tự động là "Đã mừng". Nhập 0 → "Chưa mừng".
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ghi chú thêm
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Gửi phong bì qua bạn Hùng, đi 2 người..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  Lưu Khách Mời
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Sửa Khách Mời */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <span>Sửa Khách Mời ({editingGuest.code})</span>
              </h3>
              <button
                onClick={() => setEditingGuest(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Họ và tên khách mời <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Địa chỉ / Mối quan hệ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tiền mừng (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.amountStr}
                    onChange={(e) => {
                      const formatted = formatNumberWithDots(e.target.value);
                      setFormData({ ...formData, amountStr: formatted });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-emerald-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    VNĐ
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ghi chú thêm
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Cập Nhật Khách Mời
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Thêm Hàng Loạt */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <span>Thêm Khách Mời Hàng Loạt</span>
              </h3>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBatch} className="space-y-4 mt-4">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-xs text-purple-900 leading-relaxed">
                <div className="font-bold text-purple-950 mb-1">Cách nhập hàng loạt (mỗi khách 1 dòng):</div>
                <p>Cú pháp: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-purple-200">Họ và tên, Địa chỉ, Tiền mừng, Ghi chú</span></p>
                <p className="mt-1 text-purple-700">Ví dụ:<br />
                  Nguyễn Văn Nam, Hà Nội, 500000, Bạn chú rể<br />
                  Trần Thị Lan, Đà Nẵng, 1000000, Chị gái<br />
                  Lê Hoàng Phúc, TP.HCM, 0, Chưa mừng
                </p>
              </div>

              {batchError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {batchError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Danh sách khách mời (Dán vào đây)
                </label>
                <textarea
                  rows={7}
                  required
                  placeholder="Dán hoặc gõ danh sách tại đây..."
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  Xác Nhận Thêm Hàng Loạt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: Xóa Khách Mời */}
      {deletingGuest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Xác nhận xóa khách mời?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Bạn có chắc chắn muốn xóa khách mời <strong className="text-slate-900">{deletingGuest.name}</strong> ({deletingGuest.code})? Dữ liệu tiền mừng sẽ được trừ khỏi tổng sổ cưới.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeletingGuest(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = deletingGuest.id;
                  setDeletingGuest(null);
                  await onDeleteGuest(id);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
