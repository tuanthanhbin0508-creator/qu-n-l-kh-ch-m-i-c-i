import React from 'react';
import { 
  HelpCircle, 
  Smartphone, 
  ShieldCheck, 
  Share2, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  Laptop
} from 'lucide-react';

export const GuideTab: React.FC = () => {
  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              CẨM NANG HƯỚNG DẪN SỬ DỤNG CHI TIẾT
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Dành cho người mới hoàn toàn: Hướng dẫn cài đặt lên điện thoại, chia sẻ Zalo và bảo mật dữ liệu.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Đăng nhập chuẩn ngân hàng */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              1. Cơ Chế Đăng Nhập & Bảo Mật Chuẩn Ngân Hàng
            </h3>
            <p className="text-xs text-slate-500">Mỗi lần thoát hoặc đóng tab ứng dụng sẽ yêu cầu đăng nhập lại</p>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Tự động kết thúc phiên:</strong> Khi bạn đóng tab trình duyệt, đóng ứng dụng trên điện thoại, phiên làm việc sẽ kết thúc ngay lập tức. Người khác cầm máy mở lại sẽ bắt buộc phải nhập lại mật khẩu.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Không mất phiên khi chuyển trang:</strong> Khi bạn chuyển giữa trang Khách mời &rarr; Chi tiêu &rarr; Thống kê &rarr; In ấn, phiên đăng nhập hoàn toàn giữ nguyên, thao tác mượt mà không bị gián đoạn.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Đổi mật khẩu theo ý muốn:</strong> Bạn có thể bấm vào nút <strong>"Cài đặt"</strong> trên góc phải bất kỳ lúc nào để đổi mật khẩu quản trị riêng của bạn.
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Cài đặt lên điện thoại (Android & iPhone) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              2. Thêm Ứng Dụng Ra Màn Hình Chính Điện Thoại (Dùng Như App)
            </h3>
            <p className="text-xs text-slate-500">Mở nhanh trên iPhone hoặc điện thoại Android mà không cần tải từ App Store</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hướng dẫn cho iPhone (Safari) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span>Trên iPhone (Trình duyệt Safari)</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
              <li>Mở đường dẫn ứng dụng bằng trình duyệt <strong>Safari</strong>.</li>
              <li>Bấm vào biểu tượng <strong>Chia sẻ (Hình vuông có mũi tên trỏ lên)</strong> ở cạnh dưới màn hình.</li>
              <li>Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.</li>
              <li>Đặt tên là <strong>QUẢN LÝ KHÁCH MỜI</strong> và bấm <strong>Thêm</strong>.</li>
              <li>Biểu tượng ứng dụng sẽ xuất hiện trên màn hình điện thoại như một app thật.</li>
            </ol>
          </div>

          {/* Hướng dẫn cho Android (Chrome) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span>Trên Android (Trình duyệt Chrome)</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
              <li>Mở đường dẫn ứng dụng bằng <strong>Google Chrome</strong>.</li>
              <li>Bấm vào biểu tượng <strong>3 dấu chấm (⋮)</strong> ở góc trên bên phải.</li>
              <li>Chọn <strong>"Thêm vào Màn hình chính" (Add to Home screen)</strong> hoặc <strong>"Cài đặt ứng dụng"</strong>.</li>
              <li>Bấm <strong>Cài đặt / Thêm</strong> để hoàn tất.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Section 3: Chia sẻ qua Zalo */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              3. Chia Sẻ Ứng Dụng Cho Người Thân Qua Zalo
            </h3>
            <p className="text-xs text-slate-500">Dùng chung trên nhiều điện thoại và máy tính cùng lúc</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Bạn chỉ cần sao chép đường dẫn (URL) của ứng dụng và gửi qua tin nhắn Zalo cho người thân hoặc những người được phép kiểm tra sổ mừng. Cung cấp cho họ tài khoản và mật khẩu để đăng nhập. Mọi người đều có thể xem cùng một dữ liệu được đồng bộ liên tục.
        </p>
      </div>

      {/* Section 4: Sao lưu và In ấn */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              4. Sao Lưu Dữ Liệu & In Ấn A4
            </h3>
            <p className="text-xs text-slate-500">Giữ dữ liệu vĩnh viễn và in ra giấy lưu kỷ niệm</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">Xuất File Excel (.xlsx):</div>
            Bấm vào nút <strong>"Xuất Excel"</strong> ở trang Khách mời hoặc Chi tiêu để tải ngay file Excel chuẩn về máy tính hoặc điện thoại. File này có thể mở bằng Microsoft Excel, WPS Office hoặc Google Sheets.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">In Sổ Cưới A4:</div>
            Mục <strong>"In ấn A4"</strong> cung cấp sẵn 3 mẫu in: Mẫu trắng đen tiết kiệm mực, Mẫu màu sang trọng và Mẫu bảng chi tiêu. Trang in được thiết kế tự động chia trang và không bao giờ cắt đôi dòng chữ.
          </div>
        </div>
      </div>
    </div>
  );
};
