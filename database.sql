-- ========================================================
-- SCHEMA DATABASE PRESENSIKU (POSTGRESQL / SUPABASE / NEON)
-- Jalankan skrip ini di SQL Editor Supabase atau PostgreSQL
-- ========================================================

-- 1. Tabel Master Kantor & Geofence
CREATE TABLE IF NOT EXISTS offices (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 150,
    is_default BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data Default Kantor
INSERT INTO offices (id, name, address, latitude, longitude, radius_meters, is_default)
VALUES (
    'off-1',
    'Kantor Pusat - PT Solusi Digital',
    'Jl. Jenderal Sudirman Kav. 21, Jakarta Selatan',
    -6.2088,
    106.8456,
    150,
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 2. Tabel Master Shift Kerja
CREATE TABLE IF NOT EXISTS shifts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_time VARCHAR(10) NOT NULL, -- Format '08:00'
    end_time VARCHAR(10) NOT NULL,   -- Format '17:00'
    grace_period_minutes INTEGER NOT NULL DEFAULT 15,
    color VARCHAR(20) DEFAULT '#0284c7',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data Default Shift
INSERT INTO shifts (id, name, start_time, end_time, grace_period_minutes, color, description)
VALUES 
    ('shift-1', 'Shift Reguler (08:30 - 17:30)', '08:30', '17:30', 15, '#0284c7', 'Jam kerja kantor reguler'),
    ('shift-2', 'Shift Pagi (07:00 - 15:30)', '07:00', '15:30', 15, '#10b981', 'Shift pagi operasional'),
    ('shift-3', 'Shift Siang (14:30 - 22:30)', '14:30', '22:30', 15, '#f59e0b', 'Shift siang operasional'),
    ('shift-4', 'Shift Malam (22:00 - 06:30)', '22:00', '06:30', 15, '#6366f1', 'Shift malam / standby')
ON CONFLICT (id) DO NOTHING;

-- 3. Tabel Karyawan (Users)
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    nik VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'employee', -- 'admin' atau 'employee'
    avatar TEXT,
    shift_id VARCHAR(50) REFERENCES shifts(id) ON DELETE SET NULL,
    leave_balance INTEGER NOT NULL DEFAULT 12,
    phone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data Default Karyawan & Admin Awal
INSERT INTO employees (id, nik, name, email, password, department, position, role, avatar, shift_id, leave_balance, phone)
VALUES 
    ('emp-1', 'KRY-2024-001', 'Budi Santoso', 'budi.santoso@perusahaan.com', 'karyawan123', 'Teknologi Informasi', 'Fullstack Developer', 'employee', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', 'shift-1', 12, '081234567890'),
    ('emp-2', 'KRY-2024-002', 'Siti Rahmawati', 'siti.rahma@perusahaan.com', 'admin123', 'Human Resources (HR)', 'HR & GA Manager', 'admin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250', 'shift-1', 10, '081298765432')
ON CONFLICT (id) DO NOTHING;

-- 4. Tabel Log Kehadiran (Attendance)
CREATE TABLE IF NOT EXISTS attendances (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    date DATE NOT NULL, -- Format YYYY-MM-DD
    
    -- Clock In
    clock_in_time VARCHAR(10) NOT NULL,
    clock_in_photo TEXT NOT NULL, -- Base64 data URL atau URL CDN Supabase Storage
    clock_in_lat DOUBLE PRECISION NOT NULL,
    clock_in_lng DOUBLE PRECISION NOT NULL,
    clock_in_address TEXT,
    clock_in_distance_meters INTEGER NOT NULL,
    is_clock_in_within_radius BOOLEAN NOT NULL DEFAULT TRUE,
    clock_in_status VARCHAR(20) NOT NULL DEFAULT 'ontime', -- 'ontime' atau 'late'
    late_minutes INTEGER DEFAULT 0,

    -- Clock Out
    clock_out_time VARCHAR(10),
    clock_out_photo TEXT,
    clock_out_lat DOUBLE PRECISION,
    clock_out_lng DOUBLE PRECISION,
    clock_out_address TEXT,
    clock_out_distance_meters INTEGER,
    is_clock_out_within_radius BOOLEAN,
    clock_out_status VARCHAR(20),
    overtime_hours DOUBLE PRECISION DEFAULT 0,

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk mempercepat query rekap kehadiran per tanggal dan per karyawan
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(date);
CREATE INDEX IF NOT EXISTS idx_attendances_emp_date ON attendances(employee_id, date);

-- 5. Tabel Pengajuan Cuti & Izin
CREATE TABLE IF NOT EXISTS leave_requests (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'cuti_tahunan', 'sakit', 'izin', 'dinas_luar'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    attachment_name VARCHAR(255),
    attachment_data TEXT, -- Base64 file atau URL Storage
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(150),
    review_note TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================================
-- 6. PENGATURAN HAK AKSES & ROW LEVEL SECURITY (RLS)
-- PENTING: Jalankan bagian ini di SQL Editor Supabase agar
-- aplikasi web (via anon/public key) dapat mengubah data
-- seperti mengedit nama karyawan, clock in/out, dsb.
-- ========================================================

-- Nonaktifkan RLS agar operasi UPDATE/INSERT/DELETE tidak diblokir oleh Supabase
ALTER TABLE offices DISABLE ROW LEVEL SECURITY;
ALTER TABLE shifts DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendances DISABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;

-- Berikan hak akses penuh kepada role anon dan authenticated
GRANT ALL ON TABLE offices TO anon, authenticated, service_role;
GRANT ALL ON TABLE shifts TO anon, authenticated, service_role;
GRANT ALL ON TABLE employees TO anon, authenticated, service_role;
GRANT ALL ON TABLE attendances TO anon, authenticated, service_role;
GRANT ALL ON TABLE leave_requests TO anon, authenticated, service_role;

