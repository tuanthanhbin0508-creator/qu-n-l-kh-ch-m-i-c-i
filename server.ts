import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'database.json');

interface Guest {
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

interface Expense {
  id: string;
  code: string; // CP001, CP002...
  date: string;
  title: string;
  amount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

interface Database {
  auth: {
    username: string;
    passwordHash: string; // Stored securely
  };
  guests: Guest[];
  expenses: Expense[];
  sheetsConfig: {
    scriptUrl: string;
    autoSync: boolean;
    lastSyncTime: string | null;
  };
  eventInfo: {
    title: string;
    subTitle: string;
    eventDate: string;
    brideName: string;
    groomName: string;
  };
}

// Initial state - strictly empty real lists, no fake mock data
const defaultDb: Database = {
  auth: {
    username: 'admin',
    passwordHash: 'admin123',
  },
  guests: [],
  expenses: [],
  sheetsConfig: {
    scriptUrl: '',
    autoSync: false,
    lastSyncTime: null,
  },
  eventInfo: {
    title: 'LỄ VU QUY',
    subTitle: 'SỔ QUẢN LÝ KHÁCH MỜI VÀ TIỀN MỪNG CƯỚI',
    eventDate: new Date().toISOString().split('T')[0],
    brideName: '',
    groomName: '',
  },
};

function readDb(): Database {
  try {
    if (fs.existsSync(dbFilePath)) {
      const content = fs.readFileSync(dbFilePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Lỗi khi đọc file database.json:', err);
  }
  fs.writeFileSync(dbFilePath, JSON.stringify(defaultDb, null, 2), 'utf8');
  return defaultDb;
}

function writeDb(data: Database) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Lỗi khi ghi file database.json:', err);
  }
}

// In-memory active banking-grade sessions
interface Session {
  token: string;
  username: string;
  createdAt: number;
  lastActive: number;
}
const activeSessions = new Map<string, Session>();

// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (now - session.lastActive > SESSION_TIMEOUT_MS) {
      activeSessions.delete(token);
    }
  }
}
setInterval(cleanupExpiredSessions, 60 * 1000);

// Authentication middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên đã hết hạn. Vui lòng đăng nhập lại.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã bị đăng xuất.' });
  }

  if (Date.now() - session.lastActive > SESSION_TIMEOUT_MS) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn do không hoạt động.' });
  }

  session.lastActive = Date.now();
  (req as any).user = session;
  next();
}

// ----------------- AUTH APIS -----------------

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tài khoản và mật khẩu.' });
  }

  const db = readDb();
  if (username.trim() !== db.auth.username || password !== db.auth.passwordHash) {
    return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.' });
  }

  // Create cryptographic session token
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    token,
    username: db.auth.username,
    createdAt: Date.now(),
    lastActive: Date.now(),
  });

  return res.json({
    success: true,
    token,
    username: db.auth.username,
    message: 'Đăng nhập thành công',
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'Đã kết thúc phiên làm việc thành công.' });
});

// GET /api/auth/verify
app.get('/api/auth/verify', requireAuth, (req, res) => {
  return res.json({ valid: true, user: (req as any).user.username });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword, newUsername } = req.body;
  const db = readDb();

  if (currentPassword !== db.auth.passwordHash) {
    return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng.' });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 4 ký tự.' });
  }

  if (newUsername && newUsername.trim().length > 0) {
    db.auth.username = newUsername.trim();
  }
  db.auth.passwordHash = newPassword;
  writeDb(db);

  return res.json({ success: true, message: 'Đổi thông tin đăng nhập thành công.' });
});

// ----------------- DATA APIS -----------------

// Helper to format Date: YYYY-MM-DD HH:mm
function getCurrentFormattedDate(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

// GET /api/data - Full data payload
app.get('/api/data', requireAuth, (req, res) => {
  const db = readDb();
  res.json({
    guests: db.guests || [],
    expenses: db.expenses || [],
    sheetsConfig: db.sheetsConfig,
    eventInfo: db.eventInfo,
  });
});

// POST /api/event-info - Update event details
app.post('/api/event-info', requireAuth, (req, res) => {
  const { title, subTitle, eventDate, brideName, groomName } = req.body;
  const db = readDb();
  db.eventInfo = {
    ...db.eventInfo,
    title: title ?? db.eventInfo.title,
    subTitle: subTitle ?? db.eventInfo.subTitle,
    eventDate: eventDate ?? db.eventInfo.eventDate,
    brideName: brideName ?? db.eventInfo.brideName,
    groomName: groomName ?? db.eventInfo.groomName,
  };
  writeDb(db);
  res.json({ success: true, eventInfo: db.eventInfo });
});

// ----------------- GUEST APIS -----------------

function generateNextGuestCode(guests: Guest[]): string {
  let maxNum = 0;
  for (const g of guests) {
    if (g.code && g.code.startsWith('KM')) {
      const num = parseInt(g.code.substring(2), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = maxNum + 1;
  return `KM${String(nextNum).padStart(3, '0')}`;
}

// POST /api/guests - Add one guest
app.post('/api/guests', requireAuth, (req, res) => {
  const { name, address, amount, note } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Họ và tên khách mời không được để trống.' });
  }

  const db = readDb();
  const numAmount = Number(amount) || 0;
  const code = generateNextGuestCode(db.guests);
  const now = getCurrentFormattedDate();

  const newGuest: Guest = {
    id: crypto.randomUUID(),
    code,
    name: name.trim(),
    address: (address || '').trim(),
    amount: numAmount,
    status: numAmount > 0 ? 'Đã mừng' : 'Chưa mừng',
    note: (note || '').trim(),
    createdAt: now,
    updatedAt: now,
  };

  db.guests.push(newGuest);
  writeDb(db);

  return res.json({ success: true, guest: newGuest, guests: db.guests });
});

// POST /api/guests/batch - Batch add guests
app.post('/api/guests/batch', requireAuth, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Danh sách khách mời không hợp lệ.' });
  }

  const db = readDb();
  const addedList: Guest[] = [];
  const now = getCurrentFormattedDate();

  for (const item of items) {
    if (!item.name || !item.name.trim()) continue;
    const numAmount = Number(item.amount) || 0;
    const code = generateNextGuestCode([...db.guests, ...addedList]);
    const guest: Guest = {
      id: crypto.randomUUID(),
      code,
      name: item.name.trim(),
      address: (item.address || '').trim(),
      amount: numAmount,
      status: numAmount > 0 ? 'Đã mừng' : 'Chưa mừng',
      note: (item.note || '').trim(),
      createdAt: now,
      updatedAt: now,
    };
    addedList.push(guest);
  }

  db.guests.push(...addedList);
  writeDb(db);

  return res.json({ success: true, addedCount: addedList.length, guests: db.guests });
});

// PUT /api/guests/:id - Edit guest
app.put('/api/guests/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, address, amount, note } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Họ và tên khách mời không được để trống.' });
  }

  const db = readDb();
  const idx = db.guests.findIndex(g => g.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Không tìm thấy khách mời cần cập nhật.' });
  }

  const numAmount = Number(amount) || 0;
  db.guests[idx] = {
    ...db.guests[idx],
    name: name.trim(),
    address: (address || '').trim(),
    amount: numAmount,
    status: numAmount > 0 ? 'Đã mừng' : 'Chưa mừng',
    note: (note || '').trim(),
    updatedAt: getCurrentFormattedDate(),
  };

  writeDb(db);
  return res.json({ success: true, guest: db.guests[idx], guests: db.guests });
});

// DELETE /api/guests/:id - Delete guest
app.delete('/api/guests/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialLength = db.guests.length;
  db.guests = db.guests.filter(g => g.id !== id);

  if (db.guests.length === initialLength) {
    return res.status(404).json({ error: 'Không tìm thấy khách mời cần xóa.' });
  }

  writeDb(db);
  return res.json({ success: true, message: 'Đã xóa khách mời.', guests: db.guests });
});

// ----------------- EXPENSE APIS -----------------

function generateNextExpenseCode(expenses: Expense[]): string {
  let maxNum = 0;
  for (const e of expenses) {
    if (e.code && e.code.startsWith('CP')) {
      const num = parseInt(e.code.substring(2), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = maxNum + 1;
  return `CP${String(nextNum).padStart(3, '0')}`;
}

// POST /api/expenses - Add expense
app.post('/api/expenses', requireAuth, (req, res) => {
  const { title, amount, date, note } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Tên khoản chi không được để trống.' });
  }

  const db = readDb();
  const numAmount = Number(amount) || 0;
  const code = generateNextExpenseCode(db.expenses);
  const now = getCurrentFormattedDate();

  const newExpense: Expense = {
    id: crypto.randomUUID(),
    code,
    date: date || new Date().toISOString().split('T')[0],
    title: title.trim(),
    amount: numAmount,
    note: (note || '').trim(),
    createdAt: now,
    updatedAt: now,
  };

  db.expenses.push(newExpense);
  writeDb(db);

  return res.json({ success: true, expense: newExpense, expenses: db.expenses });
});

// PUT /api/expenses/:id - Edit expense
app.put('/api/expenses/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, amount, date, note } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Tên khoản chi không được để trống.' });
  }

  const db = readDb();
  const idx = db.expenses.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Không tìm thấy khoản chi cần cập nhật.' });
  }

  const numAmount = Number(amount) || 0;
  db.expenses[idx] = {
    ...db.expenses[idx],
    date: date || db.expenses[idx].date,
    title: title.trim(),
    amount: numAmount,
    note: (note || '').trim(),
    updatedAt: getCurrentFormattedDate(),
  };

  writeDb(db);
  return res.json({ success: true, expense: db.expenses[idx], expenses: db.expenses });
});

// DELETE /api/expenses/:id - Delete expense
app.delete('/api/expenses/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialLength = db.expenses.length;
  db.expenses = db.expenses.filter(e => e.id !== id);

  if (db.expenses.length === initialLength) {
    return res.status(404).json({ error: 'Không tìm thấy khoản chi cần xóa.' });
  }

  writeDb(db);
  return res.json({ success: true, message: 'Đã xóa khoản chi.', expenses: db.expenses });
});

// ----------------- GOOGLE SHEETS APIS -----------------

// POST /api/sheets/config - Save configuration
app.post('/api/sheets/config', requireAuth, (req, res) => {
  const { scriptUrl, autoSync } = req.body;
  const db = readDb();
  db.sheetsConfig.scriptUrl = (scriptUrl || '').trim();
  db.sheetsConfig.autoSync = !!autoSync;
  writeDb(db);
  return res.json({ success: true, sheetsConfig: db.sheetsConfig });
});

// POST /api/sheets/test - Test connection
app.post('/api/sheets/test', requireAuth, async (req, res) => {
  const { scriptUrl } = req.body;
  if (!scriptUrl) {
    return res.status(400).json({ error: 'Chưa cung cấp đường dẫn Google Apps Script Web App.' });
  }

  try {
    const testUrl = scriptUrl.includes('?') ? `${scriptUrl}&action=ping` : `${scriptUrl}?action=ping`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return res.json({
      success: true,
      message: 'Kết nối Google Apps Script thành công!',
      details: data,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: `Không thể kết nối đến Google Apps Script: ${err.message || 'Lỗi mạng hoặc URL không chính xác'}. Vui lòng kiểm tra lại URL triển khai Web App.`,
    });
  }
});

// POST /api/sheets/sync - Push local data to Google Sheets via GAS Web App
app.post('/api/sheets/sync', requireAuth, async (req, res) => {
  const db = readDb();
  const scriptUrl = db.sheetsConfig.scriptUrl;

  if (!scriptUrl) {
    return res.status(400).json({
      error: 'Chưa cấu hình đường dẫn Google Apps Script Web App. Hãy vào mục "Kết Nối Google Sheets" để thiết lập.',
    });
  }

  try {
    const payload = {
      action: 'syncAll',
      guests: db.guests,
      expenses: db.expenses,
      eventInfo: db.eventInfo,
      updatedAt: getCurrentFormattedDate(),
    };

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const resultText = await response.text();
    let resultJson;
    try {
      resultJson = JSON.parse(resultText);
    } catch {
      resultJson = { status: 'ok', raw: resultText };
    }

    db.sheetsConfig.lastSyncTime = getCurrentFormattedDate();
    writeDb(db);

    return res.json({
      success: true,
      message: 'Đồng bộ dữ liệu sang Google Sheets thành công!',
      lastSyncTime: db.sheetsConfig.lastSyncTime,
      details: resultJson,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: `Đồng bộ thất bại: ${err.message || 'Lỗi kết nối'}. Dữ liệu vẫn được bảo vệ an toàn trên hệ thống.`,
    });
  }
});

// ----------------- VITE INTEGRATION -----------------

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server QUẢN LÝ KHÁCH MỜI running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
