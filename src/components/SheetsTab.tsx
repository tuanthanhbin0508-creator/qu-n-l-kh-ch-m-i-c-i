import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Link, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { SheetsConfig } from '../types';

interface SheetsTabProps {
  sheetsConfig: SheetsConfig;
  onSaveConfig: (scriptUrl: string, autoSync: boolean) => Promise<void>;
  onTestConnection: (scriptUrl: string) => Promise<{ success: boolean; message: string }>;
  onSyncNow: () => Promise<{ success: boolean; message: string }>;
}

export const SheetsTab: React.FC<SheetsTabProps> = ({
  sheetsConfig,
  onSaveConfig,
  onTestConnection,
  onSyncNow,
}) => {
  const [scriptUrl, setScriptUrl] = useState(sheetsConfig.scriptUrl || '');
  const [autoSync, setAutoSync] = useState(sheetsConfig.autoSync || false);
  const [isCopied, setIsCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Pre-built Google Apps Script code for 2 tabs: KhachMoi and ChiPhi
  const appsScriptCode = `/**
 * GOOGLE APPS SCRIPT CHO ỨNG DỤNG "QUẢN LÝ KHÁCH MỜI"
 * Tự động tạo 2 trang tính: "KhachMoi" và "ChiPhi"
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Google Apps Script đang hoạt động sẵn sàng nhận dữ liệu."
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. CẬP NHẬT TRANG TÍNH "KhachMoi"
    var guestSheet = ss.getSheetByName("KhachMoi");
    if (!guestSheet) {
      guestSheet = ss.insertSheet("KhachMoi");
    }
    guestSheet.clear();
    
    // Tiêu đề cột KhachMoi
    guestSheet.appendRow([
      "Mã khách",
      "Ngày thêm",
      "Họ và tên",
      "Địa chỉ / Quan hệ",
      "Tiền mừng",
      "Trạng thái",
      "Ghi chú",
      "Ngày cập nhật"
    ]);

    // Định dạng tiêu đề KhachMoi
    guestSheet.getRange(1, 1, 1, 8).setBackground("#1E3A8A").setFontColor("#FFFFFF").setFontWeight("bold");

    if (data.guests && data.guests.length > 0) {
      var guestRows = [];
      for (var i = 0; i < data.guests.length; i++) {
        var g = data.guests[i];
        guestRows.push([
          g.code || "",
          g.createdAt || "",
          g.name || "",
          g.address || "",
          g.amount || 0,
          g.status || "",
          g.note || "",
          g.updatedAt || ""
        ]);
      }
      guestSheet.getRange(2, 1, guestRows.length, 8).setValues(guestRows);
    }

    // 2. CẬP NHẬT TRANG TÍNH "ChiPhi"
    var expenseSheet = ss.getSheetByName("ChiPhi");
    if (!expenseSheet) {
      expenseSheet = ss.insertSheet("ChiPhi");
    }
    expenseSheet.clear();

    // Tiêu đề cột ChiPhi
    expenseSheet.appendRow([
      "Mã chi phí",
      "Ngày chi",
      "Tên khoản chi",
      "Số tiền",
      "Ghi chú",
      "Ngày cập nhật"
    ]);

    // Định dạng tiêu đề ChiPhi
    expenseSheet.getRange(1, 1, 1, 6).setBackground("#881337").setFontColor("#FFFFFF").setFontWeight("bold");

    if (data.expenses && data.expenses.length > 0) {
      var expenseRows = [];
      for (var j = 0; j < data.expenses.length; j++) {
        var exp = data.expenses[j];
        expenseRows.push([
          exp.code || "",
          exp.date || "",
          exp.title || "",
          exp.amount || 0,
          exp.note || "",
          exp.updatedAt || ""
        ]);
      }
      expenseSheet.getRange(2, 1, expenseRows.length, 6).setValues(expenseRows);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Đã lưu thành công " + (data.guests ? data.guests.length : 0) + " khách mời và " + (data.expenses ? data.expenses.length : 0) + " khoản chi vào Google Sheets."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveAndTest = async () => {
    if (!scriptUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập đường dẫn Google Apps Script Web App.' });
      return;
    }

    setIsTesting(true);
    setStatusMessage({ type: 'info', text: 'Đang kiểm tra kết nối với Google Sheets...' });

    await onSaveConfig(scriptUrl.trim(), autoSync);
    const result = await onTestConnection(scriptUrl.trim());

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
    setIsTesting(false);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Đang đồng bộ dữ liệu sang Google Sheets...' });

    const result = await onSyncNow();
    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
    setIsSyncing(false);
  };

  const isConnected = !!sheetsConfig.scriptUrl;

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${isConnected ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}">
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã cấu hình đường dẫn Google Sheets</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chưa kết nối Google Sheets (Dữ liệu đang lưu an toàn tại máy chủ)</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              <span>KẾT NỐI & ĐỒNG BỘ GOOGLE SHEETS</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Lưu trữ vĩnh viễn trên tài khoản Google cá nhân của bạn, không giới hạn dung lượng, xem trên Google Drive.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncNow}
              disabled={!isConnected || isSyncing}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'ĐỒNG BỘ NGAY'}</span>
            </button>
          </div>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div className={`mt-4 p-3.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-start gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            {statusMessage.type === 'info' && <RefreshCw className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-spin" />}
            <div className="flex-1">{statusMessage.text}</div>
          </div>
        )}

        {sheetsConfig.lastSyncTime && (
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Lần đồng bộ thành công gần nhất: <strong className="text-slate-700">{sheetsConfig.lastSyncTime}</strong></span>
          </div>
        )}
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Link className="w-5 h-5 text-slate-700" />
          <span>Cấu hình Đường Dẫn Google Apps Script Web App</span>
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            URL Triển khai Web App (exec)
          </label>
          <div className="relative">
            <input
              type="url"
              value={scriptUrl}
              onChange={(e) => setScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="w-full pl-3.5 pr-28 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleSaveAndTest}
              disabled={isTesting}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isTesting ? 'Đang thử...' : 'Lưu & Thử'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Đường dẫn phải có dạng kết thúc bằng <code className="text-slate-600 font-bold">/exec</code>.
          </p>
        </div>
      </div>

      {/* Step-by-Step Instructions for Non-Technical Users */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>HƯỚNG DẪN TỪNG BƯỚC KẾT NỐI GOOGLE SHEETS (DÀNH CHO NGƯỜI MỚI)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bạn chỉ cần làm theo 5 bước đơn giản dưới đây một lần duy nhất để kết nối bảng tính miễn phí.
            </p>
          </div>
        </div>

        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bước 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="font-bold text-sm text-slate-900">Tạo trang tính Google Sheets mới</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Truy cập <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a> hoặc vào Google Drive tạo một bảng tính mới. Đặt tên file là <strong>"QUẢN LÝ KHÁCH MỜI ĐÁM CƯỚI"</strong>.
            </p>
          </div>

          {/* Bước 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="font-bold text-sm text-slate-900">Mở Tiện ích mở rộng &gt; Apps Script</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trên thanh menu của Google Sheets, bấm vào <strong>Tiện ích mở rộng (Extensions)</strong> &rarr; Chọn <strong>Apps Script</strong>. Trình soạn thảo mã của Google sẽ mở ra.
            </p>
          </div>

          {/* Bước 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h4 className="font-bold text-sm text-slate-900">Dán đoạn mã bên dưới vào</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Xóa sạch nội dung cũ trong tệp <code className="bg-slate-200 px-1 rounded">Code.gs</code>, sau đó bấm nút <strong>"Sao chép toàn bộ mã"</strong> màu xanh ở khung dưới và dán vào. Bấm biểu tượng <strong>Lưu (Hình đĩa mềm)</strong>.
            </p>
          </div>

          {/* Bước 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">4</span>
              <h4 className="font-bold text-sm text-slate-900">Triển khai thành Ứng dụng Web</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bấm nút <strong>Triển khai (Deploy)</strong> ở góc trên bên phải &rarr; Chọn <strong>Tùy chọn triển khai mới (New deployment)</strong> &rarr; Chọn loại bánh răng: <strong>Ứng dụng web (Web app)</strong>.
            </p>
          </div>
        </div>

        {/* Note on Permission */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>LƯU Ý QUAN TRỌNG KHI TRIỂN KHAI APPS SCRIPT:</span>
          </div>
          <p>
            - Ở mục <strong>Người có quyền truy cập (Who has access)</strong>: Chọn <strong>Bất kỳ ai (Anyone)</strong> để ứng dụng gửi được dữ liệu.
          </p>
          <p>
            - Bấm <strong>Triển khai</strong> &rarr; Cấp quyền truy cập cho tài khoản Google của bạn &rarr; Sao chép <strong>URL Ứng dụng web</strong> (kết thúc bằng <code className="font-mono bg-white px-1 rounded">/exec</code>).
          </p>
          <p>
            - Dán URL vào ô cấu hình ở trên và bấm <strong>"Lưu & Thử"</strong>.
          </p>
        </div>

        {/* Script Code Block with 1-click copy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase">
              Mã Google Apps Script (Sẵn sàng 100%)
            </span>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs border border-blue-200 transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Đã sao chép vào bộ nhớ tạm!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép toàn bộ mã</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto max-h-72 border border-slate-800">
            {appsScriptCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
