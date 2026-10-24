export type UserRole = 'employee' | 'admin' | 'manager';

export interface Employee {
  id: string;
  nik: string;
  name: string;
  email: string;
  password?: string;
  department: string;
  position: string;
  role: UserRole;
  avatar: string;
  shiftId: string;
  leaveBalance: number; // sisa cuti tahunan
  phone?: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // '08:00'
  endTime: string;   // '17:00'
  gracePeriodMinutes: number; // toleransi keterlambatan (e.g. 15 mins)
  color: string;
  description?: string;
}

export interface OfficeLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // radius toleransi absensi
  isDefault: boolean;
}

export type AttendanceStatus = 'ontime' | 'late' | 'early_leave' | 'overtime' | 'absent';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  
  // Clock In
  clockInTime: string; // HH:mm:ss
  clockInPhoto: string; // base64 or URL
  clockInLat: number;
  clockInLng: number;
  clockInAddress?: string;
  clockInDistanceMeters: number;
  isClockInWithinRadius: boolean;
  clockInStatus: AttendanceStatus;
  lateMinutes: number;

  // Clock Out
  clockOutTime?: string; // HH:mm:ss
  clockOutPhoto?: string;
  clockOutLat?: number;
  clockOutLng?: number;
  clockOutAddress?: string;
  clockOutDistanceMeters?: number;
  isClockOutWithinRadius?: boolean;
  clockOutStatus?: AttendanceStatus;
  overtimeHours?: number;
  notes?: string;
}

export type LeaveType = 'cuti_tahunan' | 'sakit' | 'izin' | 'dinas_luar';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentName?: string;
  attachmentData?: string; // base64 data URL
  status: LeaveStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: string;
}
