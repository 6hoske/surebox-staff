PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS staff (
 id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, pass TEXT, role TEXT NOT NULL DEFAULT 'Хелпер',
 mutes INTEGER NOT NULL DEFAULT 0, bans INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0,
 lifetime_total INTEGER NOT NULL DEFAULT 0, warns INTEGER NOT NULL DEFAULT 0, warn_reason TEXT,
 warn_required INTEGER NOT NULL DEFAULT 0, warn_progress INTEGER NOT NULL DEFAULT 0,
 warn_work_type TEXT NOT NULL DEFAULT 'mutes', suriki INTEGER NOT NULL DEFAULT 0,
 profile_points INTEGER NOT NULL DEFAULT 0, profile_frame TEXT DEFAULT 'none', profile_title TEXT,
 profile_artifact TEXT, avatar TEXT, banner_url TEXT, created_at INTEGER NOT NULL,
 warn_history TEXT NOT NULL DEFAULT '[]', role_history TEXT NOT NULL DEFAULT '[]',
 shop_inventory TEXT NOT NULL DEFAULT '[]', custom_badges TEXT NOT NULL DEFAULT '[]',
 hidden_achievements TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, author TEXT, target TEXT NOT NULL, cmd TEXT NOT NULL, duration TEXT, reason TEXT NOT NULL, img TEXT, time TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS news (id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL DEFAULT '', author TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS vacations (id TEXT PRIMARY KEY, staff_name TEXT NOT NULL, start_date TEXT, end_date TEXT, reason TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS promotions (id TEXT PRIMARY KEY, staff_name TEXT NOT NULL, old_role TEXT, new_role TEXT, reason TEXT, author TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '', assignee TEXT, status TEXT NOT NULL DEFAULT 'open', author TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT DEFAULT '', target TEXT, is_read INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS week_archives (id TEXT PRIMARY KEY, week_start TEXT NOT NULL, week_end TEXT, payload TEXT NOT NULL DEFAULT '{}', created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS anti_abuse_flags (id TEXT PRIMARY KEY, staff_name TEXT, signature TEXT, repeat_count INTEGER NOT NULL DEFAULT 1, details TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS weekly_top_awards (id TEXT PRIMARY KEY, week_start TEXT, staff_name TEXT NOT NULL, award TEXT, reward TEXT, author TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS logs (id TEXT PRIMARY KEY, action TEXT NOT NULL, author TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, sender TEXT, recipient TEXT, content TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS hall_of_fame (id TEXT PRIMARY KEY, staff_name TEXT NOT NULL, title TEXT, details TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS academy_progress (id TEXT PRIMARY KEY, staff_name TEXT NOT NULL, course TEXT, progress INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
INSERT OR IGNORE INTO settings(key,value) VALUES ('norms','{"helperMutes":50,"modMutes":55,"modBans":15}');
INSERT OR IGNORE INTO settings(key,value) VALUES ('salaries','{"Хелпер":300,"Ст. Хелпер":400,"Мл. Модератор":500,"Модератор":600,"Ст. Модератор":700}');
