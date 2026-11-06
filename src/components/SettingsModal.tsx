import React, { useState } from 'react';
import { Settings, Lock, X, Check, AlertCircle, Heart, User, Calendar } from 'lucide-react';
import { EventInfo } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventInfo: EventInfo;
  onUpdateEventInfo: (info: EventInfo) => Promise<void>;
  onChangePassword: (currentPass: string, newPass: string, newUsername?: string) => Promise<{ success: boolean; message: string }>;
  currentUsername: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  eventInfo,
  onUpdateEventInfo,
  onChangePassword,
  currentUsername,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'event' | 'auth'>('event');

  // Event info form
  const [eventData, setEventData] = useState<EventInfo>({ ...eventInfo });

  // Auth form
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSaveEventInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateEventInfo(eventData);
    onClose();
  };

  const handleChangeAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!currentPassword) {
      setAuthError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    if (newPassword.length < 4) {
      setAuthError('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setAuthError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    setIsSubmitting(true);
    const result = await onChangePassword(currentPassword, newPassword, newUsername);
    if (result.success) {
      setAuthSuccess('Đổi thông tin đăng nhập thành công! Hãy ghi nhớ mật khẩu mới.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setAuthError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <span>Cài Đặt Hệ Thống</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 mt-4">
          <button
            onClick={() => setActiveSubTab('event')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'event'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Thông Tin Lễ Cưới
          </button>
          <button
            onClick={() => setActiveSubTab('auth')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'auth'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Đổi Mật Khẩu Đăng Nhập
          </button>
        </div>

        {/* SUBTAB 1: EVENT INFO */}
        {activeSubTab === 'event' && (
          <form onSubmit={handleSaveEventInfo} className="space-y-3.5 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tiêu đề buổi lễ
              </label>
              <input
                type="text"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                placeholder="LỄ VU QUY / LỄ THÀNH HÔN / TIỆC BÁO HỶ"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phụ đề sổ
              </label>
              <input
                type="text"
                value={eventData.subTitle}
                onChange={(e) => setEventData({ ...eventData, subTitle: e.target.value })}
                placeholder="SỔ QUẢN LÝ KHÁCH MỜI VÀ TIỀN MỪNG CƯỚI"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tên Cô Dâu
                </label>
                <input
                  type="text"
                  value={eventData.brideName}
                  onChange={(e) => setEventData({ ...eventData, brideName: e.target.value })}
                  placeholder="Ví dụ: Thanh Bình"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tên Chú Rể
                </label>
                <input
                  type="text"
                  value={eventData.groomName}
                  onChange={(e) => setEventData({ ...eventData, groomName: e.target.value })}
                  placeholder="Ví dụ: Tuấn Thành"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Ngày tổ chức
              </label>
              <input
                type="date"
                value={eventData.eventDate}
                onChange={(e) => setEventData({ ...eventData, eventDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Lưu Thông Tin Lễ
              </button>
            </div>
          </form>
        )}

        {/* SUBTAB 2: AUTHENTICATION (CHANGE PASSWORD) */}
        {activeSubTab === 'auth' && (
          <form onSubmit={handleChangeAuth} className="space-y-3.5 mt-4">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>{authError}</div>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>{authSuccess}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tài khoản đăng nhập
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Mật khẩu hiện tại <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu đang dùng"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 4 ký tự"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
