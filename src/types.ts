export interface Guest {
  id: string;
  code: string; // KM001, KM002...
  name: string;
  address: string;
  amount: number;
  status: 'Đã mừng' | 'Chưa mừng';
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  code: string; // CP001, CP002...
  date: string;
  title: string;
  amount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface SheetsConfig {
  scriptUrl: string;
  autoSync: boolean;
  lastSyncTime: string | null;
}

export interface EventInfo {
  title: string;
  subTitle: string;
  eventDate: string;
  brideName: string;
  groomName: string;
}

export type ActiveTab = 'overview' | 'guests' | 'expenses' | 'print' | 'sheets' | 'settings' | 'guide';

export type PrintTemplate = 'bw' | 'color' | 'expense';
