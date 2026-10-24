import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates distance in meters between two GPS coordinates using Haversine Formula
 */
export function calculateDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Format date in Indonesian locale (e.g. "Senin, 24 Oktober 2026")
 */
export function formatIndonesianDate(dateStrOrObj: string | Date): string {
  const d = typeof dateStrOrObj === 'string' ? new Date(dateStrOrObj) : dateStrOrObj;
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Check if current time is late compared to shift start time + grace period
 */
export function evaluateLate(
  clockInTime: string, // "08:15:00"
  shiftStartTime: string, // "08:00"
  gracePeriodMinutes: number = 15
): { isLate: boolean; lateMinutes: number } {
  const [inHour, inMin] = clockInTime.split(':').map(Number);
  const [shiftHour, shiftMin] = shiftStartTime.split(':').map(Number);

  const inTotalMinutes = inHour * 60 + inMin;
  const shiftTotalMinutes = shiftHour * 60 + shiftMin;

  const diffMinutes = inTotalMinutes - shiftTotalMinutes;
  if (diffMinutes > gracePeriodMinutes) {
    return {
      isLate: true,
      lateMinutes: diffMinutes,
    };
  }

  return {
    isLate: false,
    lateMinutes: 0,
  };
}

/**
 * Calculate overtime hours (jam lembur) if clocked out after shift end time
 */
export function evaluateOvertime(
  clockOutTime: string, // "19:30:00"
  shiftEndTime: string // "17:00"
): number {
  const [outHour, outMin] = clockOutTime.split(':').map(Number);
  const [shiftHour, shiftMin] = shiftEndTime.split(':').map(Number);

  const outTotalMinutes = outHour * 60 + outMin;
  const shiftTotalMinutes = shiftHour * 60 + shiftMin;

  const diffMinutes = outTotalMinutes - shiftTotalMinutes;
  if (diffMinutes >= 60) {
    return parseFloat((diffMinutes / 60).toFixed(1));
  }
  return 0;
}
