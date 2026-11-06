/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { GuestsTab } from './components/GuestsTab';
import { ExpensesTab } from './components/ExpensesTab';
import { PrintTab } from './components/PrintTab';
import { SheetsTab } from './components/SheetsTab';
import { GuideTab } from './components/GuideTab';
import { SettingsModal } from './components/SettingsModal';
import { Guest, Expense, SheetsConfig, EventInfo, ActiveTab } from './types';
import { CheckCircle2, AlertCircle, X, ShieldAlert, WifiOff } from 'lucide-react';
import { useOnlineStatus } from './hooks/useOnlineStatus';

export default function App() {
  const isOnline = useOnlineStatus();
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('admin');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // App data state
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig>({
    scriptUrl: '',
    autoSync: false,
    lastSyncTime: null,
  });
  const [eventInfo, setEventInfo] = useState<EventInfo>({
    title: 'LỄ VU QUY',
    subTitle: 'SỔ QUẢN LÝ KHÁCH MỜI VÀ TIỀN MỪNG CƯỚI',
    eventDate: new Date().toISOString().split('T')[0],
    brideName: '',
    groomName: '',
  });

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Check banking-grade session from sessionStorage
  useEffect(() => {
    const savedToken = sessionStorage.getItem('auth_token');
    const savedUser = sessionStorage.getItem('auth_user') || 'admin';

    if (!savedToken) {
      setIsInitializing(false);
      return;
    }

    // Verify session on server
    fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((res) => {
        if (res.ok) {
          setToken(savedToken);
          setUsername(savedUser);
          loadAppData(savedToken);
        } else {
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_user');
          setToken(null);
        }
      })
      .catch(() => {
        sessionStorage.removeItem('auth_token');
        setToken(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  // Load application data from backend
  const loadAppData = async (authToken: string) => {
    try {
      const response = await fetch('/api/data', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGuests(data.guests || []);
        setExpenses(data.expenses || []);
        if (data.sheetsConfig) setSheetsConfig(data.sheetsConfig);
        if (data.eventInfo) setEventInfo(data.eventInfo);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu ứng dụng:', err);
    }
  };

  // Handle Login success
  const handleLoginSuccess = (newToken: string, user: string) => {
    setToken(newToken);
    setUsername(user);
    loadAppData(newToken);
    showToast('success', 'Đăng nhập thành công! Chúc bạn quản lý đám cưới thuận lợi.');
  };

  // Handle Logout (Invalidate session on server & clear sessionStorage)
  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        // Ignore network errors on logout
      }
    }
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    setToken(null);
    showToast('success', 'Đã đăng xuất an toàn khỏi hệ thống.');
  };

  // Helper fetch with auth
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!token) throw new Error('Chưa đăng nhập');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      };
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Phiên đăng nhập đã hết hạn.');
      }
      return res;
    },
    [token]
  );

  // ---------------- GUEST OPERATIONS ----------------
  const handleAddGuest = async (guestData: {
    name: string;
    address: string;
    amount: number;
    note: string;
  }) => {
    try {
      const res = await authFetch('/api/guests', {
        method: 'POST',
        body: JSON.stringify(guestData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGuests(data.guests);
      showToast('success', `Đã thêm khách mời "${guestData.name}" vào sổ.`);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi thêm khách mời.');
    }
  };

  const handleBatchAddGuests = async (
    items: { name: string; address: string; amount: number; note: string }[]
  ) => {
    try {
      const res = await authFetch('/api/guests/batch', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGuests(data.guests);
      showToast('success', `Đã thêm thành công ${data.addedCount} khách mời hàng loạt!`);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi thêm khách hàng loạt.');
    }
  };

  const handleEditGuest = async (
    id: string,
    guestData: { name: string; address: string; amount: number; note: string }
  ) => {
    try {
      const res = await authFetch(`/api/guests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(guestData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGuests(data.guests);
      showToast('success', `Đã cập nhật thông tin khách "${guestData.name}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi cập nhật khách mời.');
    }
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      const res = await authFetch(`/api/guests/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGuests(data.guests);
      showToast('success', 'Đã xóa khách mời khỏi sổ.');
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi xóa khách mời.');
    }
  };

  // ---------------- EXPENSE OPERATIONS ----------------
  const handleAddExpense = async (expenseData: {
    title: string;
    amount: number;
    date: string;
    note: string;
  }) => {
    try {
      const res = await authFetch('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setExpenses(data.expenses);
      showToast('success', `Đã ghi nhận khoản chi "${expenseData.title}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi thêm khoản chi.');
    }
  };

  const handleEditExpense = async (
    id: string,
    expenseData: { title: string; amount: number; date: string; note: string }
  ) => {
    try {
      const res = await authFetch(`/api/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setExpenses(data.expenses);
      showToast('success', `Đã cập nhật khoản chi "${expenseData.title}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi sửa khoản chi.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await authFetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setExpenses(data.expenses);
      showToast('success', 'Đã xóa khoản chi khỏi danh sách.');
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi xóa khoản chi.');
    }
  };

  // ---------------- GOOGLE SHEETS OPERATIONS ----------------
  const handleSaveSheetsConfig = async (scriptUrl: string, autoSync: boolean) => {
    try {
      const res = await authFetch('/api/sheets/config', {
        method: 'POST',
        body: JSON.stringify({ scriptUrl, autoSync }),
      });
      const data = await res.json();
      if (res.ok) {
        setSheetsConfig(data.sheetsConfig);
        showToast('success', 'Đã lưu cấu hình Google Sheets.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi lưu cấu hình Google Sheets.');
    }
  };

  const handleTestSheetsConnection = async (scriptUrl: string) => {
    try {
      const res = await authFetch('/api/sheets/test', {
        method: 'POST',
        body: JSON.stringify({ scriptUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Kiểm tra thất bại.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối mạng.' };
    }
  };

  const handleSyncSheetsNow = async () => {
    try {
      const res = await authFetch('/api/sheets/sync', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSheetsConfig((prev) => ({ ...prev, lastSyncTime: data.lastSyncTime }));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Đồng bộ thất bại.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối máy chủ.' };
    }
  };

  // ---------------- EVENT INFO OPERATIONS ----------------
  const handleUpdateEventInfo = async (info: EventInfo) => {
    try {
      const res = await authFetch('/api/event-info', {
        method: 'POST',
        body: JSON.stringify(info),
      });
      const data = await res.json();
      if (res.ok) {
        setEventInfo(data.eventInfo);
        showToast('success', 'Đã cập nhật thông tin lễ cưới.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi cập nhật thông tin.');
    }
  };

  // ---------------- AUTH OPERATIONS ----------------
  const handleChangePassword = async (
    currentPass: string,
    newPass: string,
    newUsername?: string
  ) => {
    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass, newUsername }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (newUsername) setUsername(newUsername);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Đổi mật khẩu thất bại.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi mạng.' };
    }
  };

  // Initializing spinner
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">Đang khởi tạo ứng dụng QUẢN LÝ KHÁCH MỜI...</h2>
        <p className="text-xs text-slate-400 mt-1">Kiểm tra phiên bảo mật và cấu hình hệ thống</p>
      </div>
    );
  }

  // Not logged in -> Show Bank-grade Login
  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs no-print">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Bạn đang ở chế độ ngoại tuyến (Mất kết nối mạng). Dữ liệu vẫn được giữ an toàn trên máy.</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        username={username}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-fade-in no-print">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-500/95 text-white border-emerald-600'
                : 'bg-rose-600/95 text-white border-rose-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs sm:text-sm font-semibold">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              className="text-white/80 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {activeTab === 'overview' && (
          <OverviewTab
            guests={guests}
            expenses={expenses}
            eventInfo={eventInfo}
            setActiveTab={setActiveTab}
            onOpenAddGuest={() => setActiveTab('guests')}
            onOpenAddExpense={() => setActiveTab('expenses')}
          />
        )}

        {activeTab === 'guests' && (
          <GuestsTab
            guests={guests}
            eventInfo={eventInfo}
            onAddGuest={handleAddGuest}
            onBatchAddGuests={handleBatchAddGuests}
            onEditGuest={handleEditGuest}
            onDeleteGuest={handleDeleteGuest}
            onOpenPrint={() => setActiveTab('print')}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            expenses={expenses}
            guests={guests}
            eventInfo={eventInfo}
            setActiveTab={setActiveTab}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onOpenPrint={() => setActiveTab('print')}
          />
        )}

        {activeTab === 'print' && (
          <PrintTab
            guests={guests}
            expenses={expenses}
            eventInfo={eventInfo}
          />
        )}

        {activeTab === 'sheets' && (
          <SheetsTab
            sheetsConfig={sheetsConfig}
            onSaveConfig={handleSaveSheetsConfig}
            onTestConnection={handleTestSheetsConnection}
            onSyncNow={handleSyncSheetsNow}
          />
        )}

        {activeTab === 'guide' && <GuideTab />}
      </main>

      {/* Settings & Change Password Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        eventInfo={eventInfo}
        onUpdateEventInfo={handleUpdateEventInfo}
        onChangePassword={handleChangePassword}
        currentUsername={username}
      />
    </div>
  );
}
