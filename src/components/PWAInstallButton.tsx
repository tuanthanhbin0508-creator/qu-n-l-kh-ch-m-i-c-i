import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed and running standalone, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions modal for browsers where prompt isn't fired yet
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className={`bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white p-3.5 sm:p-4 rounded-2xl shadow-md flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5">
                <span>Cài đặt ứng dụng QUẢN LÝ KHÁCH MỜI</span>
                <span className="bg-white/25 text-[10px] px-1.5 py-0.5 rounded font-black uppercase">App</span>
              </div>
              <div className="text-[11px] text-rose-100 mt-0.5">
                Mở nhanh từ màn hình chính điện thoại, máy tính bảng & máy tính
              </div>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="px-3.5 py-2 bg-white text-rose-700 hover:bg-rose-50 font-bold rounded-xl text-xs shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95"
          >
            {isInstalling ? 'Đang cài...' : 'Cài Đặt Ngay'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white shadow-sm shadow-rose-500/20 transition-all cursor-pointer active:scale-95 ${className}`}
          title="Cài đặt ứng dụng lên màn hình chính thiết bị"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isInstalling ? 'Đang cài...' : 'Cài App'}</span>
        </button>
      )}

      {/* iOS & Mobile Installation Guided Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fade-in relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">
              {isIOS ? 'Cài Đặt Trên iPhone / iPad' : 'Thêm Vào Màn Hình Chính'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sử dụng ứng dụng mượt mà, toàn màn hình và mở nhanh như ứng dụng native:
            </p>

            {isIOS ? (
              <div className="mt-4 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">1</div>
                  <div>
                    Bấm vào nút <strong>Chia sẻ</strong> <Share className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" /> ở thanh công cụ dưới cùng của trình duyệt Safari.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">2</div>
                  <div>
                    Cuộn xuống và chọn <strong className="text-slate-900">"Thêm vào MH chính" (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 mx-0.5" />.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">3</div>
                  <div>
                    Bấm nút <strong>Thêm</strong> ở góc trên bên phải để hoàn thành!
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">1</div>
                  <div>
                    Bấm vào biểu tượng <strong>3 chấm (⋮)</strong> ở góc trên trình duyệt Chrome/Edge.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">2</div>
                  <div>
                    Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào màn hình chính"</strong>.
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Đã Hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
