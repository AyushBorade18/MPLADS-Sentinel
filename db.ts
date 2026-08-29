import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'sentinel.db');

export const db = new Database(dbPath, { verbose: console.log });

export function initDb() {
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      projectId TEXT PRIMARY KEY,
      refCode TEXT,
      title TEXT NOT NULL,
      workDescription TEXT,
      mpName TEXT,
      state TEXT,
      district TEXT,
      constituency TEXT,
      sector TEXT,
      implementingAgency TEXT,
      financialYear TEXT,
      sanctionedAmountLakhs REAL,
      releasedAmountLakhs REAL,
      spentAmountLakhs REAL,
      status TEXT,
      riskScore INTEGER,
      riskLevel TEXT,
      primaryFlag TEXT,
      recommendationDate TEXT,
      sanctionDate TEXT,
      tenderDate TEXT,
      workOrderDate TEXT,
      completedDate TEXT,
      latitude REAL,
      longitude REAL,
      physicalProgressPercent REAL,
      fundUtilizationPercent REAL
    );

    CREATE TABLE IF NOT EXISTS project_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId TEXT,
      step TEXT,
      date TEXT,
      status TEXT,
      description TEXT,
      FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_risk_factors (
      id TEXT PRIMARY KEY,
      projectId TEXT,
      type TEXT,
      title TEXT,
      description TEXT,
      severity TEXT,
      FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_evidence (
      id TEXT PRIMARY KEY,
      projectId TEXT,
      title TEXT,
      description TEXT,
      imageUrl TEXT,
      missing BOOLEAN,
      verifiedBy TEXT,
      timestamp TEXT,
      latitude REAL,
      longitude REAL,
      locationName TEXT,
      FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_audit_logs (
      id TEXT PRIMARY KEY,
      projectId TEXT,
      timestamp TEXT,
      actor TEXT,
      role TEXT,
      action TEXT,
      details TEXT,
      FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE
    );
  `);
  
  // Seed demo user if no users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    console.log('Seeding initial admin user...');
    // Password is 'admin123'
    // pre-hashed with bcrypt 10 rounds
    const adminHash = '$2a$10$T1K.1gGZ.9T0D7p8y1n/.OQyK1hF9xW0qT/3sM/X8F6M0E1/4zO2C'; 
    db.prepare('INSERT INTO users (email, passwordHash, role) VALUES (?, ?, ?)').run('admin@sentinel.gov.in', adminHash, 'admin');
  }

  console.log('SQLite Database initialized successfully.');
}
