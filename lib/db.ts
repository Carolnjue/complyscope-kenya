import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var __csPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var __csMigrated: Promise<void> | undefined;
}

export function pool(): mysql.Pool {
  if (!global.__csPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    global.__csPool = mysql.createPool({ uri: url, connectionLimit: 5, waitForConnections: true, dateStrings: true, charset: 'utf8mb4', timezone: '+03:00' });
  }
  return global.__csPool;
}

const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NULL,
    password_hash VARCHAR(100) NOT NULL,
    email_verified_at DATETIME NULL,
    is_admin TINYINT(1) NOT NULL DEFAULT 0,
    is_disabled TINYINT(1) NOT NULL DEFAULT 0,
    remind_email TINYINT(1) NOT NULL DEFAULT 1,
    remind_sms TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id CHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id)
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_hash CHAR(64) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    user_id INT NULL,
    email VARCHAR(190) NULL,
    business_id INT NULL,
    role VARCHAR(20) NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS businesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(190) NOT NULL,
    profile JSON NOT NULL,
    track_from DATE NOT NULL,
    plan VARCHAR(20) NOT NULL DEFAULT 'pilot',
    plan_expires_at DATETIME NULL,
    calendar_token CHAR(32) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    INDEX (owner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS memberships (
    business_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (business_id, user_id),
    INDEX (user_id)
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS records (
    business_id INT NOT NULL,
    inst_id VARCHAR(80) NOT NULL,
    data JSON NOT NULL,
    updated_by INT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (business_id, inst_id)
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS filings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    inst_id VARCHAR(80) NOT NULL,
    period VARCHAR(40) NOT NULL,
    filed_on DATE NOT NULL,
    ref VARCHAR(120) NOT NULL DEFAULT '',
    title VARCHAR(190) NOT NULL,
    loc VARCHAR(120) NOT NULL DEFAULT '',
    kind VARCHAR(20) NOT NULL DEFAULT 'filing',
    created_by INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (business_id, inst_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    inst_id VARCHAR(80) NULL,
    filing_id INT NULL,
    filename VARCHAR(190) NOT NULL,
    stored_name VARCHAR(80) NOT NULL,
    mime VARCHAR(100) NOT NULL,
    size INT NOT NULL,
    uploaded_by INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (business_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS reminders_sent (
    business_id INT NOT NULL,
    inst_id VARCHAR(80) NOT NULL,
    period VARCHAR(40) NOT NULL,
    days_before INT NOT NULL,
    channel VARCHAR(10) NOT NULL,
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (business_id, inst_id, period, days_before, channel)
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    user_id INT NOT NULL,
    plan VARCHAR(20) NOT NULL,
    amount INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    checkout_request_id VARCHAR(80) NULL,
    receipt VARCHAR(40) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    result_desc VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (checkout_request_id)
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS email_outbox (
    id INT AUTO_INCREMENT PRIMARY KEY,
    to_email VARCHAR(190) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html MEDIUMTEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    error VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NULL,
    user_id INT NULL,
    action VARCHAR(60) NOT NULL,
    detail VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (business_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS settings (
    k VARCHAR(60) PRIMARY KEY,
    v TEXT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_hash CHAR(64) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (key_hash, created_at)
  ) ENGINE=InnoDB`,
];

export function migrate(): Promise<void> {
  if (!global.__csMigrated) {
    global.__csMigrated = (async () => {
      const p = pool();
      for (const sql of SCHEMA) await p.query(sql);
    })().catch((e) => { global.__csMigrated = undefined; throw e; });
  }
  return global.__csMigrated;
}

export async function q<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  await migrate();
  const [rows] = await pool().query(sql, params);
  return rows as T[];
}

export async function one<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await q<T>(sql, params);
  return rows[0] || null;
}

export async function exec(sql: string, params: any[] = []): Promise<{ insertId: number; affectedRows: number }> {
  await migrate();
  const [res] = await pool().query(sql, params);
  return res as any;
}

export function asJson<T = any>(v: any): T {
  if (v == null) return v;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch { return v as any; } }
  return v;
}
