import { supabase, isSupabaseConfigured } from './supabase';
import { Employee, Shift, OfficeLocation, AttendanceRecord, LeaveRequest } from './types';

export const dbService = {
  // 1. Fetch All Data from Supabase
  fetchAll: async () => {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const [
        { data: officeData },
        { data: shiftsData },
        { data: employeesData },
        { data: attendancesData },
        { data: leavesData },
      ] = await Promise.all([
        supabase.from('offices').select('*').limit(1).maybeSingle(),
        supabase.from('shifts').select('*').order('start_time'),
        supabase.from('employees').select('*').order('created_at'),
        supabase.from('attendances').select('*').order('created_at', { ascending: false }),
        supabase.from('leave_requests').select('*').order('created_at', { ascending: false }),
      ]);

      return {
        office: officeData
          ? {
              id: officeData.id,
              name: officeData.name,
              address: officeData.address,
              latitude: officeData.latitude,
              longitude: officeData.longitude,
              radiusMeters: officeData.radius_meters,
              isDefault: officeData.is_default,
            }
          : null,
        shifts: shiftsData?.map((s) => ({
          id: s.id,
          name: s.name,
          startTime: s.start_time,
          endTime: s.end_time,
          gracePeriodMinutes: s.grace_period_minutes,
          color: s.color,
          description: s.description,
        })),
        employees: employeesData?.map((e) => ({
          id: e.id,
          nik: e.nik,
          name: e.name,
          email: e.email,
          password: e.password,
          department: e.department,
          position: e.position,
          role: e.role,
          avatar: e.avatar,
          shiftId: e.shift_id,
          leaveBalance: e.leave_balance,
          phone: e.phone,
        })),
        attendances: attendancesData?.map((a) => ({
          id: a.id,
          employeeId: a.employee_id,
          employeeName: a.employee_name,
          department: a.department,
          date: a.date,
          clockInTime: a.clock_in_time,
          clockInPhoto: a.clock_in_photo,
          clockInLat: a.clock_in_lat,
          clockInLng: a.clock_in_lng,
          clockInAddress: a.clock_in_address,
          clockInDistanceMeters: a.clock_in_distance_meters,
          isClockInWithinRadius: a.is_clock_in_within_radius,
          clockInStatus: a.clock_in_status,
          lateMinutes: a.late_minutes,
          clockOutTime: a.clock_out_time,
          clockOutPhoto: a.clock_out_photo,
          clockOutLat: a.clock_out_lat,
          clockOutLng: a.clock_out_lng,
          clockOutAddress: a.clock_out_address,
          clockOutDistanceMeters: a.clock_out_distance_meters,
          isClockOutWithinRadius: a.is_clock_out_within_radius,
          clockOutStatus: a.clock_out_status,
          overtimeHours: a.overtime_hours,
          notes: a.notes,
        })),
        leaves: leavesData?.map((l) => ({
          id: l.id,
          employeeId: l.employee_id,
          employeeName: l.employee_name,
          department: l.department,
          type: l.type,
          startDate: l.start_date,
          endDate: l.end_date,
          totalDays: l.total_days,
          reason: l.reason,
          attachmentName: l.attachment_name,
          attachmentData: l.attachment_data,
          status: l.status,
          createdAt: l.created_at,
          reviewedBy: l.reviewed_by,
          reviewNote: l.review_note,
          reviewedAt: l.reviewed_at,
        })),
      };
    } catch (err) {
      console.warn('Error fetching data from Supabase:', err);
      return null;
    }
  },

  // 2. Insert or Update Attendance Record
  saveAttendance: async (record: AttendanceRecord) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('attendances').upsert({
        id: record.id,
        employee_id: record.employeeId,
        employee_name: record.employeeName,
        department: record.department,
        date: record.date,
        clock_in_time: record.clockInTime,
        clock_in_photo: record.clockInPhoto,
        clock_in_lat: record.clockInLat,
        clock_in_lng: record.clockInLng,
        clock_in_address: record.clockInAddress,
        clock_in_distance_meters: record.clockInDistanceMeters,
        is_clock_in_within_radius: record.isClockInWithinRadius,
        clock_in_status: record.clockInStatus,
        late_minutes: record.lateMinutes,
        clock_out_time: record.clockOutTime,
        clock_out_photo: record.clockOutPhoto,
        clock_out_lat: record.clockOutLat,
        clock_out_lng: record.clockOutLng,
        clock_out_address: record.clockOutAddress,
        clock_out_distance_meters: record.clockOutDistanceMeters,
        is_clock_out_within_radius: record.isClockOutWithinRadius,
        clock_out_status: record.clockOutStatus,
        overtime_hours: record.overtimeHours,
        notes: record.notes,
      });
    } catch (err) {
      console.warn('Error saving attendance to Supabase:', err);
    }
  },

  // 3. Insert or Update Leave Request
  saveLeave: async (leave: LeaveRequest) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('leave_requests').upsert({
        id: leave.id,
        employee_id: leave.employeeId,
        employee_name: leave.employeeName,
        department: leave.department,
        type: leave.type,
        start_date: leave.startDate,
        end_date: leave.endDate,
        total_days: leave.totalDays,
        reason: leave.reason,
        attachment_name: leave.attachmentName,
        attachment_data: leave.attachmentData,
        status: leave.status,
        created_at: leave.createdAt,
        reviewed_by: leave.reviewedBy,
        review_note: leave.reviewNote,
        reviewed_at: leave.reviewedAt,
      });
    } catch (err) {
      console.warn('Error saving leave request to Supabase:', err);
    }
  },

  // 4. Save Employee
  saveEmployee: async (emp: Employee) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('employees').upsert({
        id: emp.id,
        nik: emp.nik,
        name: emp.name,
        email: emp.email,
        password: emp.password,
        department: emp.department,
        position: emp.position,
        role: emp.role,
        avatar: emp.avatar,
        shift_id: emp.shiftId,
        leave_balance: emp.leaveBalance,
        phone: emp.phone,
      });
    } catch (err) {
      console.warn('Error saving employee to Supabase:', err);
    }
  },

  // 5. Delete Employee
  deleteEmployee: async (id: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('employees').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting employee from Supabase:', err);
    }
  },

  // 6. Save Office Location
  saveOffice: async (office: OfficeLocation) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('offices').upsert({
        id: office.id,
        name: office.name,
        address: office.address,
        latitude: office.latitude,
        longitude: office.longitude,
        radius_meters: office.radiusMeters,
        is_default: office.isDefault,
      });
    } catch (err) {
      console.warn('Error saving office to Supabase:', err);
    }
  },

  // 7. Save Shifts
  saveShifts: async (shifts: Shift[]) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const records = shifts.map((s) => ({
        id: s.id,
        name: s.name,
        start_time: s.startTime,
        end_time: s.endTime,
        grace_period_minutes: s.gracePeriodMinutes,
        color: s.color,
        description: s.description,
      }));
      await supabase.from('shifts').upsert(records);
    } catch (err) {
      console.warn('Error saving shifts to Supabase:', err);
    }
  },
};
