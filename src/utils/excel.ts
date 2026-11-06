import * as XLSX from 'xlsx';
import { Guest, Expense, EventInfo } from '../types';

export function exportGuestsToExcel(guests: Guest[], eventInfo?: EventInfo) {
  const data = guests.map((g, idx) => ({
    'STT': idx + 1,
    'Mã khách': g.code,
    'Họ và tên': g.name,
    'Địa chỉ / Quan hệ': g.address,
    'Tiền mừng (VNĐ)': g.amount,
    'Trạng thái': g.status,
    'Ghi chú': g.note,
    'Ngày thêm': g.createdAt,
    'Ngày cập nhật': g.updatedAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'KhachMoi');

  // Generate file name with date
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `Danh_Sach_Khach_Moi_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}

export function exportExpensesToExcel(expenses: Expense[], eventInfo?: EventInfo) {
  const data = expenses.map((e, idx) => ({
    'STT': idx + 1,
    'Mã chi phí': e.code,
    'Ngày chi': e.date,
    'Tên khoản chi': e.title,
    'Số tiền (VNĐ)': e.amount,
    'Ghi chú': e.note,
    'Ngày thêm': e.createdAt,
    'Ngày cập nhật': e.updatedAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ChiPhi');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `Bang_Tong_Hop_Chi_Tieu_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}

export function exportAllWorkbook(guests: Guest[], expenses: Expense[]) {
  const guestData = guests.map((g, idx) => ({
    'STT': idx + 1,
    'Mã khách': g.code,
    'Họ và tên': g.name,
    'Địa chỉ / Quan hệ': g.address,
    'Tiền mừng (VNĐ)': g.amount,
    'Trạng thái': g.status,
    'Ghi chú': g.note,
    'Ngày thêm': g.createdAt,
    'Ngày cập nhật': g.updatedAt,
  }));

  const expenseData = expenses.map((e, idx) => ({
    'STT': idx + 1,
    'Mã chi phí': e.code,
    'Ngày chi': e.date,
    'Tên khoản chi': e.title,
    'Số tiền (VNĐ)': e.amount,
    'Ghi chú': e.note,
    'Ngày thêm': e.createdAt,
    'Ngày cập nhật': e.updatedAt,
  }));

  const totalGift = guests.reduce((sum, g) => sum + (g.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining = totalGift - totalExpense;

  const summaryData = [
    { 'Chỉ số': 'Tổng số khách mời', 'Giá trị': guests.length },
    { 'Chỉ số': 'Số khách đã mừng', 'Giá trị': guests.filter(g => g.amount > 0).length },
    { 'Chỉ số': 'Số khách chưa mừng', 'Giá trị': guests.filter(g => g.amount === 0).length },
    { 'Chỉ số': 'Tổng tiền mừng', 'Giá trị': totalGift },
    { 'Chỉ số': 'Tổng chi tiêu', 'Giá trị': totalExpense },
    { 'Chỉ số': 'Số tiền còn lại', 'Giá trị': remaining },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryData), 'TongKet');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(guestData), 'KhachMoi');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expenseData), 'ChiPhi');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `So_Quan_Ly_Cuoi_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
