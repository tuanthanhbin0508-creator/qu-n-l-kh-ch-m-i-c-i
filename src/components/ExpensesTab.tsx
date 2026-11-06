import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Download, 
  Printer, 
  Coins, 
  Wallet, 
  AlertTriangle, 
  Search, 
  X, 
  AlertCircle,
  ArrowLeft,
  Calendar,
  Sparkles,
  Tag,
  LayoutGrid,
  List
} from 'lucide-react';
import { Expense, Guest, EventInfo, ActiveTab } from '../types';
import { formatVND, formatNumberWithDots, parseNumberFromDots } from '../utils/format';
import { exportExpensesToExcel } from '../utils/excel';

interface ExpensesTabProps {
  expenses: Expense[];
  guests: Guest[];
  eventInfo: EventInfo;
  setActiveTab: (tab: ActiveTab) => void;
  onAddExpense: (expenseData: { title: string; amount: number; date: string; note: string }) => Promise<void>;
  onEditExpense: (id: string, expenseData: { title: string; amount: number; date: string; note: string }) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onOpenPrint: () => void;
}

const COMMON_EXPENSE_SUGGESTIONS = [
  'Thuê rạp & phông bạt',
  'Cỗ tiệc & đồ ăn',
  'Bia & Nước ngọt',
  'Trang trí gia tiên & hoa tươi',
  'Bàn ghế & bát đĩa',
  'Âm thanh & Ánh sáng',
  'Quay phim & Chụp ảnh cưới',
  'Thuê xe hoa & xe đưa dâu',
  'Tiền thuê địa điểm / Nhà hàng',
  'Trang điểm cô dâu & Chú rể',
  'Trang phục cưới (Váy / Vest / Áo dài)',
  'Lì xì bê tráp',
  'Bánh cưới & Rượu sâm banh',
  'Thiệp cưới & In ấn',
  'Các khoản chi phát sinh khác',
];

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  expenses,
  guests,
  eventInfo,
  setActiveTab,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onOpenPrint,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    amountStr: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  // Financial calculations
  const totalGiftMoney = guests.reduce((sum, g) => sum + (Number(g.amount) || 0), 0);
  const totalExpenseMoney = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remainingMoney = totalGiftMoney - totalExpenseMoney;
  const isDeficit = remainingMoney < 0;

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    if (!searchTerm.trim()) return expenses;
    const term = searchTerm.toLowerCase().trim();
    return expenses.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        e.code.toLowerCase().includes(term) ||
        (e.note && e.note.toLowerCase().includes(term))
    );
  }, [expenses, searchTerm]);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      amountStr: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amountStr: expense.amount ? formatNumberWithDots(expense.amount) : '',
      date: expense.date || new Date().toISOString().split('T')[0],
      note: expense.note || '',
    });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await onAddExpense({
      title: formData.title.trim(),
      amount: parseNumberFromDots(formData.amountStr),
      date: formData.date,
      note: formData.note.trim(),
    });
    setIsAddModalOpen(false);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !formData.title.trim()) return;

    await onEditExpense(editingExpense.id, {
      title: formData.title.trim(),
      amount: parseNumberFromDots(formData.amountStr),
      date: formData.date,
      note: formData.note.trim(),
    });
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Top Navigation & Action Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setActiveTab('guests')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại sổ khách mời</span>
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-6 h-6 text-rose-600" />
              <span>QUẢN LÝ CHI TIÊU</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Theo dõi toàn bộ các khoản chi cho đám cưới, tự động cân đối với tổng tiền mừng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm Khoản Chi</span>
            </button>
            <button
              onClick={() => exportExpensesToExcel(expenses, eventInfo)}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs sm:text-sm border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
            <button
              onClick={onOpenPrint}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">In Bảng Chi Tiêu</span>
            </button>
          </div>
        </div>

        {/* Financial Summary Trio (PHẦN 7) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5 pt-4 border-t border-slate-100">
          {/* 1. Tổng tiền mừng */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Tổng Tiền Mừng</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 truncate">
              {formatVND(totalGiftMoney)}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 font-medium">
              Từ sổ khách mời ({guests.filter(g => g.amount > 0).length} khách đã mừng)
            </div>
          </div>

          {/* 2. Tổng chi tiêu */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
            <div className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-rose-600" />
              <span>Tổng Chi Tiêu</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1 truncate">
              {formatVND(totalExpenseMoney)}
            </div>
            <div className="text-[11px] text-rose-600 mt-1 font-medium">
              Gồm {expenses.length} khoản chi phí thực tế
            </div>
          </div>

          {/* 3. Số tiền còn lại */}
          <div className={`rounded-2xl p-4 border transition-all ${
            isDeficit 
              ? 'bg-rose-100/90 border-rose-300' 
              : 'bg-indigo-50/80 border-indigo-200'
          }`}>
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-800">
              <Wallet className="w-4 h-4 text-indigo-600" />
              <span>Số Tiền Còn Lại</span>
            </div>
            <div className={`text-xl sm:text-2xl font-black mt-1 truncate ${
              isDeficit ? 'text-rose-600' : 'text-indigo-900'
            }`}>
              {formatVND(remainingMoney)}
            </div>
            <div className="text-[11px] font-semibold mt-1 text-slate-600">
              = Tổng Tiền Mừng - Tổng Chi Tiêu
            </div>
          </div>
        </div>
      </div>

      {/* Warning Deficit Banner */}
      {isDeficit && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 shadow-xs">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-extrabold text-sm text-amber-950">
              CẢNH BÁO: CHI TIÊU ĐANG VƯỢT TỔNG TIỀN MỪNG
            </div>
            <div className="text-xs text-amber-800 mt-0.5">
              Số tiền âm hiện tại là <span className="font-black text-rose-600">{formatVND(Math.abs(remainingMoney))}</span>. Hãy cân đối chi tiêu hoặc theo dõi tiếp tiền mừng phát sinh.
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm khoản chi theo tên, mã (CP001), ghi chú..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
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
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Hiển thị: {filteredExpenses.length} / {expenses.length} khoản
          </div>

          {/* View Mode Toggle */}
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
              title="Dạng bảng (Chi tiết như Word & Excel)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bảng</span>
            </button>
          </div>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs text-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Chưa có khoản chi nào</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Bắt đầu ghi chép các khoản chi (thuê rạp, đồ ăn, nước uống, chụp ảnh...) để tự động quản lý ngân sách.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
          >
            + Thêm Khoản Chi Đầu Tiên
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* DẠNG THẺ (CARD VIEW - Tối ưu di động) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredExpenses.map((expense, idx) => (
            <div
              key={expense.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {expense.code}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {expense.date}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {expense.title}
                  </h3>
                  {expense.note && (
                    <div className="text-xs text-slate-500 mt-1 italic">
                      Ghi chú: {expense.note}
                    </div>
                  )}
                </div>

                <div className="mt-3.5 p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 uppercase">Số tiền chi:</span>
                  <span className="text-base font-black text-rose-700">
                    {formatVND(expense.amount)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(expense)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa khoản chi</span>
                </button>
                <button
                  onClick={() => setDeletingExpense(expense)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa khoản chi</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* DẠNG BẢNG (TABLE VIEW - Word & Excel Aesthetic) */
        <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-md p-4 sm:p-8 overflow-hidden">
          {/* Document Header */}
          <div className="text-center pb-6 border-b-2 border-slate-800">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {eventInfo.title} • {eventInfo.eventDate || 'NĂM 2026'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 uppercase font-serif">
              BẢNG TỔNG HỢP CHI TIÊU
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              (Bảng kê chi tiết các khoản chi phí tổ chức lễ cưới hỏi)
            </p>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left text-sm border-2 border-slate-800 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-800">
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center w-12">STT</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 w-24">Mã chi</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 w-28">Ngày chi</th>
                  <th className="py-2.5 px-3 border-r border-slate-400">Tên khoản chi</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-right w-36">Số tiền (VNĐ)</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 hidden sm:table-cell">Ghi chú</th>
                  <th className="py-2.5 px-3 text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b-2 border-slate-800">
                {filteredExpenses.map((expense, idx) => {
                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50 transition-colors border-b border-slate-300"
                    >
                      {/* STT */}
                      <td className="py-2.5 px-3 border-r border-slate-300 text-center font-bold text-slate-700 text-xs">
                        {idx + 1}
                      </td>

                      {/* Mã chi */}
                      <td className="py-2.5 px-3 border-r border-slate-300 font-mono font-bold text-slate-800 text-xs">
                        {expense.code}
                      </td>

                      {/* Ngày chi */}
                      <td className="py-2.5 px-3 border-r border-slate-300 text-xs text-slate-700 whitespace-nowrap">
                        {expense.date}
                      </td>

                      {/* Tên khoản chi */}
                      <td className="py-2.5 px-3 border-r border-slate-300">
                        <div className="font-extrabold text-slate-900 text-sm">{expense.title}</div>
                        {/* On mobile, show note */}
                        <div className="sm:hidden text-[11px] text-slate-500 mt-0.5 italic">
                          {expense.note}
                        </div>
                      </td>

                      {/* Số tiền */}
                      <td className="py-2.5 px-3 border-r border-slate-300 text-right font-black text-slate-900 text-sm">
                        {formatVND(expense.amount)}
                      </td>

                      {/* Ghi chú */}
                      <td className="py-2.5 px-3 border-r border-slate-300 text-xs text-slate-600 hidden sm:table-cell">
                        {expense.note || '-'}
                      </td>

                      {/* Thao tác */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(expense)}
                            className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Sửa khoản chi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingExpense(expense)}
                            className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa khoản chi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Spreadsheet Summary Footer */}
              <tfoot className="bg-slate-100 font-extrabold text-xs text-slate-900">
                <tr className="border-b border-slate-300">
                  <td colSpan={4} className="py-2.5 px-3 border-r border-slate-400 text-right uppercase font-black">
                    TỔNG CỘNG CHI TIÊU:
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-400 text-right font-black text-rose-700 text-sm">
                    {formatVND(totalExpenseMoney)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 hidden sm:table-cell text-slate-500">
                    {expenses.length} khoản chi
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td colSpan={4} className="py-2 px-3 border-r border-slate-400 text-right uppercase text-slate-700">
                    TỔNG TIỀN MỪNG THỰC TẾ:
                  </td>
                  <td className="py-2 px-3 border-r border-slate-400 text-right font-black text-emerald-700 text-sm">
                    {formatVND(totalGiftMoney)}
                  </td>
                  <td colSpan={2} className="py-2 px-3 hidden sm:table-cell text-slate-500">
                    Từ sổ khách mừng
                  </td>
                </tr>
                <tr className="bg-slate-200">
                  <td colSpan={4} className="py-2.5 px-3 border-r border-slate-400 text-right uppercase font-black">
                    SỐ TIỀN CÒN LẠI (CÂN ĐỐI):
                  </td>
                  <td className={`py-2.5 px-3 border-r border-slate-400 text-right font-black text-sm ${
                    isDeficit ? 'text-rose-600' : 'text-indigo-900'
                  }`}>
                    {formatVND(remainingMoney)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 hidden sm:table-cell">
                    {isDeficit ? (
                      <span className="text-rose-600 font-bold">Thâm hụt cần bù</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">Dư sau đám cưới</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Thêm Khoản Chi */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-rose-600" />
                <span>Thêm Khoản Chi Mới</span>
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
                  Tên khoản chi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ví dụ: Thuê rạp, Cỗ tiệc, Nước ngọt..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />

                {/* Quick suggestions */}
                <div className="mt-2 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 w-full mb-0.5">
                    Gợi ý khoản chi thường gặp:
                  </span>
                  {COMMON_EXPENSE_SUGGESTIONS.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setFormData({ ...formData, title: item })}
                      className="px-2 py-0.5 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-md text-[11px] font-medium border border-slate-200 cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Số tiền chi (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    placeholder="0"
                    value={formData.amountStr}
                    onChange={(e) => {
                      const formatted = formatNumberWithDots(e.target.value);
                      setFormData({ ...formData, amountStr: formatted });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-rose-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    VNĐ
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ngày chi
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ghi chú thêm
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đặt cọc trước 50%, bên dịch vụ A..."
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
                  Lưu Khoản Chi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Sửa Khoản Chi */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <span>Sửa Khoản Chi ({editingExpense.code})</span>
              </h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tên khoản chi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Số tiền chi (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={formData.amountStr}
                    onChange={(e) => {
                      const formatted = formatNumberWithDots(e.target.value);
                      setFormData({ ...formData, amountStr: formatted });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-rose-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    VNĐ
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ngày chi
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Cập Nhật Khoản Chi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: Xóa Khoản Chi */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Xác nhận xóa khoản chi?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Bạn có chắc chắn muốn xóa khoản chi <strong className="text-slate-900">{deletingExpense.title}</strong> ({formatVND(deletingExpense.amount)})? Khoản này sẽ được trừ khỏi tổng chi tiêu.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = deletingExpense.id;
                  setDeletingExpense(null);
                  await onDeleteExpense(id);
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
