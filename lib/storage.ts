import { Employee, Shift, OfficeLocation, AttendanceRecord, LeaveRequest } from './types';

// Default mock office location (e.g. Jakarta Pusat or user's office)
export const DEFAULT_OFFICE: OfficeLocation = {
  id: 'off-1',
  name: 'Kantor Pusat - PT Solusi Digital',
  address: 'Jl. Jenderal Sudirman Kav. 21, Jakarta Selatan',
  latitude: -6.2088,
  longitude: 106.8456,
  radiusMeters: 150, // 150 meter geofencing radius
  isDefault: true,
};

export const DEFAULT_SHIFTS: Shift[] = [
  {
    id: 'shift-1',
    name: 'Shift Reguler (08:30 - 17:30)',
    startTime: '08:30',
    endTime: '17:30',
    gracePeriodMinutes: 15,
    color: '#0284c7', // Sky blue
    description: 'Jam kerja operasional kantor standar',
  },
  {
    id: 'shift-2',
    name: 'Shift Pagi (07:00 - 15:30)',
    startTime: '07:00',
    endTime: '15:30',
    gracePeriodMinutes: 15,
    color: '#10b981', // Emerald
    description: 'Shift operasional pagi',
  },
  {
    id: 'shift-3',
    name: 'Shift Siang (14:30 - 22:30)',
    startTime: '14:30',
    endTime: '22:30',
    gracePeriodMinutes: 15,
    color: '#f59e0b', // Amber
    description: 'Shift operasional siang',
  },
  {
    id: 'shift-4',
    name: 'Shift Malam (22:00 - 06:30)',
    startTime: '22:00',
    endTime: '06:30',
    gracePeriodMinutes: 15,
    color: '#6366f1', // Indigo
    description: 'Shift operasional malam / standby',
  },
];

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    nik: 'KRY-2024-001',
    name: 'Budi Santoso',
    email: 'budi.santoso@perusahaan.com',
    password: 'karyawan123',
    department: 'Teknologi Informasi',
    position: 'Fullstack Developer',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    shiftId: 'shift-1',
    leaveBalance: 12,
    phone: '081234567890',
  },
  {
    id: 'emp-2',
    nik: 'KRY-2024-002',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@perusahaan.com',
    password: 'admin123',
    department: 'Human Resources (HR)',
    position: 'HR & GA Manager',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    shiftId: 'shift-1',
    leaveBalance: 10,
    phone: '081298765432',
  },
  {
    id: 'emp-3',
    nik: 'KRY-2024-003',
    name: 'Ahmad Wijaya',
    email: 'ahmad.wijaya@perusahaan.com',
    password: 'karyawan123',
    department: 'Operasional & Gudang',
    position: 'Supervisor Operasional',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    shiftId: 'shift-2',
    leaveBalance: 8,
    phone: '081377889900',
  },
  {
    id: 'emp-4',
    nik: 'KRY-2024-004',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@perusahaan.com',
    password: 'karyawan123',
    department: 'Finance & Akuntansi',
    position: 'Staff Keuangan',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    shiftId: 'shift-1',
    leaveBalance: 14,
    phone: '081566778899',
  },
];

// Helper to get today's date formatted as YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DEFAULT_ATTENDANCES: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    employeeName: 'Budi Santoso',
    department: 'Teknologi Informasi',
    date: getTodayDateString(),
    clockInTime: '08:24:12',
    clockInPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    clockInLat: -6.20875,
    clockInLng: 106.84565,
    clockInAddress: 'Radius Kantor Utama (15m)',
    clockInDistanceMeters: 15,
    isClockInWithinRadius: true,
    clockInStatus: 'ontime',
    lateMinutes: 0,
  },
  {
    id: 'att-2',
    employeeId: 'emp-3',
    employeeName: 'Ahmad Wijaya',
    department: 'Operasional & Gudang',
    date: getTodayDateString(),
    clockInTime: '07:22:45',
    clockInPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    clockInLat: -6.20882,
    clockInLng: 106.84558,
    clockInAddress: 'Radius Kantor Utama (22m)',
    clockInDistanceMeters: 22,
    isClockInWithinRadius: true,
    clockInStatus: 'late',
    lateMinutes: 22,
  },
];

export const DEFAULT_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-4',
    employeeName: 'Dewi Lestari',
    department: 'Finance & Akuntansi',
    type: 'sakit',
    startDate: getTodayDateString(),
    endDate: getTodayDateString(),
    totalDays: 1,
    reason: 'Demam tinggi dan flu, istirahat dokter 1 hari',
    attachmentName: 'surat_keterangan_dokter_dewi.pdf',
    status: 'approved',
    createdAt: `${getTodayDateString()} 07:15:00`,
    reviewedBy: 'Siti Rahmawati (HR)',
    reviewNote: 'Semoga lekas sembuh, disetujui.',
    reviewedAt: `${getTodayDateString()} 08:00:00`,
  },
];

const KEYS = {
  EMPLOYEES: 'absensi_employees',
  SHIFTS: 'absensi_shifts',
  OFFICE: 'absensi_office',
  ATTENDANCE: 'absensi_attendance',
  LEAVES: 'absensi_leaves',
  CURRENT_USER_ID: 'absensi_current_user_id',
  AUTH_USER: 'absensi_auth_user',
};

// Storage Utilities safe for Client-Side Next.js
export const storage = {
  getOffice: (): OfficeLocation => {
    if (typeof window === 'undefined') return DEFAULT_OFFICE;
    const data = localStorage.getItem(KEYS.OFFICE);
    return data ? JSON.parse(data) : DEFAULT_OFFICE;
  },
  saveOffice: (office: OfficeLocation) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.OFFICE, JSON.stringify(office));
  },

  getShifts: (): Shift[] => {
    if (typeof window === 'undefined') return DEFAULT_SHIFTS;
    const data = localStorage.getItem(KEYS.SHIFTS);
    return data ? JSON.parse(data) : DEFAULT_SHIFTS;
  },
  saveShifts: (shifts: Shift[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.SHIFTS, JSON.stringify(shifts));
  },

  getEmployees: (): Employee[] => {
    if (typeof window === 'undefined') return DEFAULT_EMPLOYEES;
    const data = localStorage.getItem(KEYS.EMPLOYEES);
    if (!data) return DEFAULT_EMPLOYEES;
    try {
      const parsed: Employee[] = JSON.parse(data);
      // Ensure password exists
      return parsed.map(e => ({
        ...e,
        password: e.password || (e.role === 'admin' ? 'admin123' : 'karyawan123')
      }));
    } catch {
      return DEFAULT_EMPLOYEES;
    }
  },
  saveEmployees: (employees: Employee[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  getAttendances: (): AttendanceRecord[] => {
    if (typeof window === 'undefined') return DEFAULT_ATTENDANCES;
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : DEFAULT_ATTENDANCES;
  },
  saveAttendances: (records: AttendanceRecord[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  },

  getLeaves: (): LeaveRequest[] => {
    if (typeof window === 'undefined') return DEFAULT_LEAVES;
    const data = localStorage.getItem(KEYS.LEAVES);
    return data ? JSON.parse(data) : DEFAULT_LEAVES;
  },
  saveLeaves: (leaves: LeaveRequest[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.LEAVES, JSON.stringify(leaves));
  },

  getAuthUser: (): Employee | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(KEYS.AUTH_USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },
  setAuthUser: (user: Employee | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
      localStorage.setItem(KEYS.CURRENT_USER_ID, user.id);
    } else {
      localStorage.removeItem(KEYS.AUTH_USER);
    }
  },

  getCurrentUserId: (): string => {
    if (typeof window === 'undefined') return DEFAULT_EMPLOYEES[0].id;
    return localStorage.getItem(KEYS.CURRENT_USER_ID) || DEFAULT_EMPLOYEES[0].id;
  },
  setCurrentUserId: (id: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.CURRENT_USER_ID, id);
  },

  resetToDefault: () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.OFFICE, JSON.stringify(DEFAULT_OFFICE));
    localStorage.setItem(KEYS.SHIFTS, JSON.stringify(DEFAULT_SHIFTS));
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(DEFAULT_EMPLOYEES));
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(DEFAULT_ATTENDANCES));
    localStorage.setItem(KEYS.LEAVES, JSON.stringify(DEFAULT_LEAVES));
    localStorage.setItem(KEYS.CURRENT_USER_ID, DEFAULT_EMPLOYEES[0].id);
    localStorage.removeItem(KEYS.AUTH_USER);
  }
};
