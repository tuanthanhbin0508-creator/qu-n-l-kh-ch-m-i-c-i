import React, { useState } from 'react';
import { 
  Printer, 
  FileText, 
  Palette, 
  Receipt, 
  Check, 
  Download,
  Type,
  Maximize2,
  Sparkles,
  Heart,
  Sliders
} from 'lucide-react';
import { Guest, Expense, EventInfo, PrintTemplate } from '../types';
import { formatVND } from '../utils/format';

interface PrintTabProps {
  guests: Guest[];
  expenses: Expense[];
  eventInfo: EventInfo;
}

type FontStyle = 'royal' | 'calligraphy' | 'modern';
type PrintFontSize = 'compact' | 'standard' | 'large';

export const PrintTab: React.FC<PrintTabProps> = ({ guests, expenses, eventInfo }) => {
  const [template, setTemplate] = useState<PrintTemplate>('bw');
  const [fontStyle, setFontStyle] = useState<FontStyle>('royal');
  const [fontSize, setFontSize] = useState<PrintFontSize>('standard');
  const [showOrnament, setShowOrnament] = useState(true);

  const now = new Date();
  const printDateTimeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const totalGuests = guests.length;
  const contributedGuests = guests.filter((g) => (g.amount || 0) > 0).length;
  const pendingGuests = guests.filter((g) => (g.amount || 0) === 0).length;
  const totalGiftMoney = guests.reduce((sum, g) => sum + (Number(g.amount) || 0), 0);
  const totalExpenseMoney = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remainingMoney = totalGiftMoney - totalExpenseMoney;

  const handlePrint = () => {
    window.print();
  };

  // Font family class mapping
  const getFontFamilyClass = () => {
    switch (fontStyle) {
      case 'royal':
        return 'font-wedding-serif';
      case 'calligraphy':
        return 'font-wedding-luxury';
      case 'modern':
        return 'font-wedding-sans';
      default:
        return 'font-wedding-serif';
    }
  };

  // Font size class mapping
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'compact':
        return 'text-[9.5pt] leading-tight';
      case 'large':
        return 'text-[12pt] leading-relaxed';
      case 'standard':
      default:
        return 'text-[10.5pt] leading-normal';
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Control Panel (Hidden during print) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs no-print space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Printer className="w-6 h-6 text-rose-600" />
              <span>TRUNG TÂM IN ẤN A4 & TÙY CHỌN PHÔNG CHỮ ĐẸP</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tùy chỉnh phông chữ thư pháp, phông hoàng gia, cỡ chữ in và hoa văn theo sở thích.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-5 h-5" />
            <span>BẮT ĐẦU IN (A4)</span>
          </button>
        </div>

        {/* 3 Template Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-slate-100">
          {/* Option 1: Trắng đen */}
          <div
            onClick={() => setTemplate('bw')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
              template === 'bw'
                ? 'border-slate-900 bg-slate-50 text-slate-950 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${template === 'bw' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <span>Mẫu Trắng Đen A4</span>
                {template === 'bw' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tiết kiệm mực, viền đôi trang trọng, chuẩn Lễ Vu Quy.
              </p>
            </div>
          </div>

          {/* Option 2: Màu */}
          <div
            onClick={() => setTemplate('color')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
              template === 'color'
                ? 'border-blue-600 bg-blue-50/50 text-blue-950 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${template === 'color' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <span>Mẫu In Màu A4</span>
                {template === 'color' && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                4 thẻ màu nổi bật, tiêu đề xanh đậm, chữ trắng sang trọng.
              </p>
            </div>
          </div>

          {/* Option 3: Bảng chi tiêu */}
          <div
            onClick={() => setTemplate('expense')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
              template === 'expense'
                ? 'border-rose-600 bg-rose-50/50 text-rose-950 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${template === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <span>In Bảng Chi Tiêu</span>
                {template === 'expense' && <Check className="w-4 h-4 text-rose-600" />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bảng tổng hợp chi phí đám cưới & số tiền còn lại.
              </p>
            </div>
          </div>
        </div>

        {/* Font Customization Controls */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Phông chữ in */}
          <div>
            <label className="font-extrabold text-slate-700 uppercase block mb-1.5 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-rose-600" />
              <span>Kiểu Phông Chữ In:</span>
            </label>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setFontStyle('royal')}
                className={`px-3 py-2 rounded-xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  fontStyle === 'royal'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="font-wedding-serif text-sm">Hoàng Gia Sang Trọng (Playfair)</span>
                {fontStyle === 'royal' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setFontStyle('calligraphy')}
                className={`px-3 py-2 rounded-xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  fontStyle === 'calligraphy'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="font-wedding-luxury text-sm">Thư Pháp Tinh Tế (Garamond)</span>
                {fontStyle === 'calligraphy' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setFontStyle('modern')}
                className={`px-3 py-2 rounded-xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  fontStyle === 'modern'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="font-wedding-sans text-xs">Hiện Đại Sắc Nét (Vietnam Pro)</span>
                {fontStyle === 'modern' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Cỡ chữ in */}
          <div>
            <label className="font-extrabold text-slate-700 uppercase block mb-1.5 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-blue-600" />
              <span>Cỡ Chữ Trang In:</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setFontSize('compact')}
                className={`py-2 px-2 rounded-xl font-bold text-center transition-all cursor-pointer ${
                  fontSize === 'compact'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Nhỏ</div>
                <div className="text-[10px] opacity-80">9.5pt (Nhiều khách)</div>
              </button>
              <button
                type="button"
                onClick={() => setFontSize('standard')}
                className={`py-2 px-2 rounded-xl font-bold text-center transition-all cursor-pointer ${
                  fontSize === 'standard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Chuẩn</div>
                <div className="text-[10px] opacity-80">10.5pt (Đẹp nhất)</div>
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`py-2 px-2 rounded-xl font-bold text-center transition-all cursor-pointer ${
                  fontSize === 'large'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Lớn</div>
                <div className="text-[10px] opacity-80">12pt (Dễ đọc)</div>
              </button>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              💡 <em>Mẹo:</em> Nếu danh sách có trên 50 khách, chọn cỡ <strong>"Nhỏ"</strong> để tiết kiệm số trang in giấy A4.
            </div>
          </div>

          {/* Họa tiết hoa văn */}
          <div>
            <label className="font-extrabold text-slate-700 uppercase block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Họa Tiết & Hoa Văn Cưới:</span>
            </label>
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Viền Hoa Văn Cưới</span>
                <span className="text-[11px] text-slate-400">Thêm họa tiết hoa văn quý phái trên đầu trang</span>
              </div>
              <input
                type="checkbox"
                checked={showOrnament}
                onChange={(e) => setShowOrnament(e.target.checked)}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Bật hoa văn để tạo nét trang trọng, lãng mạn đúng chất ngày cưới.
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PRINT PREVIEW CONTAINER ==================== */}
      <div className={`bg-white rounded-3xl p-6 sm:p-12 border border-slate-300 shadow-xl max-w-4xl mx-auto print:max-w-none print:p-0 print:border-none print:shadow-none ${getFontFamilyClass()} ${getFontSizeClass()}`}>

        {/* -------------------- TEMPLATE 1: TRẮNG ĐEN (PHẦN 9) -------------------- */}
        {template === 'bw' && (
          <div className="text-black">
            {/* Top Ornamental Flourish */}
            {showOrnament && (
              <div className="text-center text-xs tracking-[0.5em] text-black mb-2 opacity-80">
                ❖ ─── ❖ ─── ❖
              </div>
            )}

            {/* Header with Double Border */}
            <div className="text-center pb-4 border-b-4 border-double border-black">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest font-wedding-serif">
                {eventInfo.title}
              </h1>
              
              <div className="text-base sm:text-lg font-bold uppercase tracking-wider mt-1.5">
                {eventInfo.subTitle}
              </div>

              {eventInfo.brideName && eventInfo.groomName && (
                <div className="text-sm font-semibold italic mt-1.5">
                  Cô Dâu: <span className="font-bold uppercase tracking-wide">{eventInfo.brideName}</span> &nbsp;❦&nbsp; Chú Rể: <span className="font-bold uppercase tracking-wide">{eventInfo.groomName}</span>
                </div>
              )}

              <div className="text-[10pt] text-black mt-1.5 italic">
                Ngày in sổ: {printDateTimeStr}
              </div>
            </div>

            {/* Statistics Bar (Trắng đen hoàn toàn, đường nét sắc sảo, không màu nền) */}
            <div className="grid grid-cols-4 border-2 border-black my-4 text-center divide-x-2 divide-black">
              <div className="py-2.5 px-1">
                <div className="font-bold text-[9.5pt] uppercase tracking-wider">TỔNG KHÁCH</div>
                <div className="text-base font-black mt-0.5 tabular-nums">{totalGuests} <span className="text-[9pt] font-normal">người</span></div>
              </div>
              <div className="py-2.5 px-1">
                <div className="font-bold text-[9.5pt] uppercase tracking-wider">ĐÃ MỪNG</div>
                <div className="text-base font-black mt-0.5 tabular-nums">{contributedGuests} <span className="text-[9pt] font-normal">người</span></div>
              </div>
              <div className="py-2.5 px-1">
                <div className="font-bold text-[9.5pt] uppercase tracking-wider">CHƯA MỪNG</div>
                <div className="text-base font-black mt-0.5 tabular-nums">{pendingGuests} <span className="text-[9pt] font-normal">người</span></div>
              </div>
              <div className="py-2.5 px-1">
                <div className="font-bold text-[9.5pt] uppercase tracking-wider">TỔNG TIỀN MỪNG</div>
                <div className="text-base font-black mt-0.5 tabular-nums truncate px-1">{formatVND(totalGiftMoney)}</div>
              </div>
            </div>

            {/* Data Table with Repeated Header and Crisp Lines */}
            <table className="w-full text-left border-2 border-black border-collapse">
              <thead>
                <tr className="border-b-2 border-black font-black uppercase text-center bg-white">
                  <th className="py-2 px-2 border-r-2 border-black w-12 text-center">STT</th>
                  <th className="py-2 px-2 border-r-2 border-black w-24 text-center">Mã khách</th>
                  <th className="py-2 px-3 border-r-2 border-black text-left">Họ và tên</th>
                  <th className="py-2 px-3 border-r-2 border-black text-left">Địa chỉ / Quan hệ</th>
                  <th className="py-2 px-3 border-r-2 border-black text-right w-32">Tiền mừng</th>
                  <th className="py-2 px-2 border-r-2 border-black text-center w-28">Trạng thái</th>
                  <th className="py-2 px-3 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {guests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center italic text-black">
                      Chưa có dữ liệu khách mời trong sổ
                    </td>
                  </tr>
                ) : (
                  guests.map((g, idx) => (
                    <tr key={g.id} className="border-b border-black">
                      <td className="py-2 px-2 border-r border-black text-center font-bold tabular-nums">{idx + 1}</td>
                      <td className="py-2 px-2 border-r border-black text-center font-mono font-bold">{g.code}</td>
                      <td className="py-2 px-3 border-r border-black font-extrabold">{g.name}</td>
                      <td className="py-2 px-3 border-r border-black">{g.address || '-'}</td>
                      <td className="py-2 px-3 border-r border-black text-right font-black tabular-nums">
                        {g.amount > 0 ? formatVND(g.amount) : '0 ₫'}
                      </td>
                      <td className="py-2 px-2 border-r border-black text-center font-bold">
                        {g.amount > 0 ? 'Đã mừng' : 'Chưa mừng'}
                      </td>
                      <td className="py-2 px-3">{g.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Print Footer */}
            <div className="mt-8 flex justify-between items-center text-[10pt] text-black pt-3 border-t-2 border-black font-wedding-serif italic">
              <div>Sổ Quản Lý Khách Mời & Tiền Mừng Cưới</div>
              <div>Hạnh Phúc Trọn Vẹn ❦ Khổ In Chuẩn A4</div>
            </div>
          </div>
        )}

        {/* -------------------- TEMPLATE 2: MÀU (PHẦN 10) -------------------- */}
        {template === 'color' && (
          <div>
            {/* Top Wedding Crest */}
            {showOrnament && (
              <div className="text-center text-rose-500 mb-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>TRĂM NĂM TÌNH VIÊN MÃN</span>
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                </div>
              </div>
            )}

            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-blue-900">
              <div className="text-xs font-extrabold text-blue-700 uppercase tracking-widest">
                QUẢN LÝ KHÁCH MỜI
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase mt-1 tracking-wider font-wedding-serif">
                {eventInfo.title}
              </h1>
              <h2 className="text-base font-bold text-slate-700 uppercase mt-0.5 tracking-wide">
                {eventInfo.subTitle}
              </h2>
              {eventInfo.brideName && eventInfo.groomName && (
                <div className="text-sm font-semibold text-rose-600 mt-1 italic">
                  Cô Dâu: <span className="font-bold text-slate-900 uppercase not-italic">{eventInfo.brideName}</span> &nbsp;❤&nbsp; Chú Rể: <span className="font-bold text-slate-900 uppercase not-italic">{eventInfo.groomName}</span>
                </div>
              )}
              <div className="text-[10pt] text-slate-500 mt-1">
                Ngày giờ in: {printDateTimeStr}
              </div>
            </div>

            {/* 4 Color Stat Cards (PHẦN 10) */}
            <div className="grid grid-cols-4 gap-3 my-5 text-center">
              {/* Tổng khách màu xanh dương */}
              <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-3 shadow-xs">
                <div className="text-[10pt] font-extrabold text-blue-700 uppercase">Tổng khách</div>
                <div className="text-xl font-black text-blue-950 mt-0.5 tabular-nums">{totalGuests}</div>
              </div>

              {/* Đã mừng màu xanh lá */}
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-3 shadow-xs">
                <div className="text-[10pt] font-extrabold text-emerald-700 uppercase">Đã mừng</div>
                <div className="text-xl font-black text-emerald-950 mt-0.5 tabular-nums">{contributedGuests}</div>
              </div>

              {/* Chưa mừng màu cam */}
              <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-3 shadow-xs">
                <div className="text-[10pt] font-extrabold text-amber-700 uppercase">Chưa mừng</div>
                <div className="text-xl font-black text-amber-950 mt-0.5 tabular-nums">{pendingGuests}</div>
              </div>

              {/* Tổng tiền mừng có màu chuyển sắc xanh tím */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-xl p-3 shadow-sm border border-indigo-900">
                <div className="text-[10pt] font-extrabold text-blue-100 uppercase">Tổng tiền mừng</div>
                <div className="text-lg font-black mt-0.5 truncate tabular-nums">{formatVND(totalGiftMoney)}</div>
              </div>
            </div>

            {/* Table with deep blue header and white text */}
            <table className="w-full text-left border-2 border-blue-950 border-collapse">
              <thead>
                <tr className="bg-blue-950 text-white font-extrabold uppercase text-center tracking-wider">
                  <th className="py-2.5 px-2 border-r border-blue-900 w-12">STT</th>
                  <th className="py-2.5 px-2 border-r border-blue-900 w-24">Mã khách</th>
                  <th className="py-2.5 px-3 border-r border-blue-900 text-left">Họ và tên</th>
                  <th className="py-2.5 px-3 border-r border-blue-900 text-left">Địa chỉ / Quan hệ</th>
                  <th className="py-2.5 px-3 border-r border-blue-900 text-right w-32">Tiền mừng</th>
                  <th className="py-2.5 px-2 border-r border-blue-900 w-28">Trạng thái</th>
                  <th className="py-2.5 px-3 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {guests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center italic text-slate-500">
                      Chưa có dữ liệu khách mời trong sổ
                    </td>
                  </tr>
                ) : (
                  guests.map((g, idx) => {
                    const isPaid = g.amount > 0;
                    return (
                      <tr key={g.id} className="border-b border-slate-300 odd:bg-white even:bg-slate-50/70">
                        <td className="py-2 px-2 border-r border-slate-300 text-center font-bold text-slate-600 tabular-nums">{idx + 1}</td>
                        <td className="py-2 px-2 border-r border-slate-300 text-center font-mono font-bold text-blue-900">{g.code}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-extrabold text-slate-900">{g.name}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-slate-700">{g.address || '-'}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-right font-black text-slate-900 tabular-nums">
                          {isPaid ? formatVND(g.amount) : '0 ₫'}
                        </td>
                        {/* Trạng thái đã mừng màu xanh lá, chưa mừng màu cam */}
                        <td className="py-2 px-2 border-r border-slate-300 text-center font-bold">
                          {isPaid ? (
                            <span className="text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full font-black border border-emerald-300 inline-block text-[10pt]">
                              Đã mừng
                            </span>
                          ) : (
                            <span className="text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full font-black border border-amber-300 inline-block text-[10pt]">
                              Chưa mừng
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{g.note || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Print Footer */}
            <div className="mt-8 flex justify-between items-center text-[10pt] text-slate-500 pt-3 border-t border-slate-200">
              <div>Hệ thống Quản lý Khách mời & Tiền mừng cưới</div>
              <div>Trang in màu A4 sắc nét</div>
            </div>
          </div>
        )}

        {/* -------------------- TEMPLATE 3: IN BẢNG CHI TIÊU (PHẦN 11) -------------------- */}
        {template === 'expense' && (
          <div>
            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                QUẢN LÝ TÀI CHÍNH ĐÁM CƯỚI
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase mt-1 font-wedding-serif tracking-wide">
                BẢNG TỔNG HỢP CHI TIÊU
              </h1>
              <div className="text-[10pt] text-slate-600 mt-1 italic">
                Ngày giờ in: {printDateTimeStr}
              </div>
            </div>

            {/* 3 Summary Blocks */}
            <div className="grid grid-cols-3 gap-3 my-5 text-center">
              <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
                <div className="text-[10pt] font-extrabold uppercase text-slate-600">Tổng tiền mừng</div>
                <div className="text-lg font-black text-emerald-700 mt-1 tabular-nums">{formatVND(totalGiftMoney)}</div>
              </div>
              <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
                <div className="text-[10pt] font-extrabold uppercase text-slate-600">Tổng chi tiêu</div>
                <div className="text-lg font-black text-rose-700 mt-1 tabular-nums">{formatVND(totalExpenseMoney)}</div>
              </div>
              <div className={`border rounded-xl p-3 ${remainingMoney < 0 ? 'bg-rose-50 border-rose-300' : 'bg-slate-100 border-slate-300'}`}>
                <div className="text-[10pt] font-extrabold uppercase text-slate-800">Số tiền còn lại</div>
                <div className={`text-lg font-black mt-1 tabular-nums ${remainingMoney < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {formatVND(remainingMoney)}
                </div>
              </div>
            </div>

            {/* Expense Table */}
            <table className="w-full text-left border-2 border-slate-900 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-900 font-black uppercase text-center text-slate-900">
                  <th className="py-2.5 px-2 border-r border-slate-400 w-12">STT</th>
                  <th className="py-2.5 px-2 border-r border-slate-400 w-24">Mã chi</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 w-28">Ngày chi</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-left">Tên khoản chi</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-right w-36">Số tiền (VNĐ)</th>
                  <th className="py-2.5 px-3 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center italic text-slate-500">
                      Chưa có khoản chi nào được ghi nhận
                    </td>
                  </tr>
                ) : (
                  expenses.map((e, idx) => (
                    <tr key={e.id} className="border-b border-slate-300">
                      <td className="py-2 px-2 border-r border-slate-300 text-center font-bold text-slate-600 tabular-nums">{idx + 1}</td>
                      <td className="py-2 px-2 border-r border-slate-300 text-center font-mono font-bold text-slate-800">{e.code}</td>
                      <td className="py-2 px-3 border-r border-slate-300 tabular-nums">{e.date}</td>
                      <td className="py-2 px-3 border-r border-slate-300 font-extrabold text-slate-900">{e.title}</td>
                      <td className="py-2 px-3 border-r border-slate-300 text-right font-black text-slate-900 tabular-nums">
                        {formatVND(e.amount)}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{e.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="font-extrabold">
                <tr className="bg-slate-100 border-t-2 border-slate-800">
                  <td colSpan={4} className="py-2.5 px-3 border-r border-slate-400 text-right uppercase">
                    TỔNG CỘNG CHI TIÊU:
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-400 text-right font-black text-rose-700 tabular-nums">
                    {formatVND(totalExpenseMoney)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {expenses.length} khoản chi
                  </td>
                </tr>
                <tr className="bg-slate-50 border-t border-slate-300">
                  <td colSpan={4} className="py-2 px-3 border-r border-slate-400 text-right uppercase text-slate-700">
                    TỔNG TIỀN MỪNG THỰC TẾ:
                  </td>
                  <td className="py-2 px-3 border-r border-slate-400 text-right font-black text-emerald-700 tabular-nums">
                    {formatVND(totalGiftMoney)}
                  </td>
                  <td className="py-2 px-3 text-slate-500">
                    Từ danh sách khách
                  </td>
                </tr>
                <tr className="bg-slate-200 border-t border-slate-400">
                  <td colSpan={4} className="py-2.5 px-3 border-r border-slate-400 text-right uppercase font-black">
                    SỐ TIỀN CÒN LẠI:
                  </td>
                  <td className={`py-2.5 px-3 border-r border-slate-400 text-right font-black tabular-nums ${
                    remainingMoney < 0 ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {formatVND(remainingMoney)}
                  </td>
                  <td className="py-2.5 px-3">
                    {remainingMoney < 0 ? 'Cần bù chi tiêu' : 'Dư sau cưới'}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Print Footer */}
            <div className="mt-8 flex justify-between items-center text-[10pt] text-slate-500 pt-3 border-t border-slate-200">
              <div>Bảng Tổng Hợp Chi Tiêu Cưới Hỏi</div>
              <div>Trang in A4 chuẩn kế toán</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
