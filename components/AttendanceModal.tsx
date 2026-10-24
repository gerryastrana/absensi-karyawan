'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Employee, OfficeLocation, Shift, AttendanceRecord } from '@/lib/types';
import { calculateDistanceInMeters, evaluateLate, evaluateOvertime } from '@/lib/utils';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  Navigation,
  Compass
} from 'lucide-react';

interface AttendanceModalProps {
  isOpen: boolean;
  type: 'clockIn' | 'clockOut';
  employee: Employee;
  shift: Shift;
  office: OfficeLocation;
  existingRecord?: AttendanceRecord;
  onClose: () => void;
  onSubmit: (attendanceData: Partial<AttendanceRecord>) => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  type,
  employee,
  shift,
  office,
  existingRecord,
  onClose,
  onSubmit,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Geolocation states
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Setup Camera and GPS when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Reset states
    setPhotoData(null);
    setCameraError(null);
    setGeoError(null);
    setIsLocating(true);

    // 1. Start Geolocation
    fetchCurrentLocation();

    // 2. Start Camera
    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Peramban tidak mendukung akses kamera langsung.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // selfie camera
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError(
        'Kamera tidak dapat diakses. Pastikan izin kamera aktif atau periksa ketersediaan webcam.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const fetchCurrentLocation = () => {
    setIsLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Peramban tidak mendukung fitur Geolocation.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });

        const dist = calculateDistanceInMeters(
          userLat,
          userLng,
          office.latitude,
          office.longitude
        );
        setDistanceMeters(dist);
        setIsWithinRadius(dist <= office.radiusMeters);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback or explain
        setGeoError(
          'Tidak dapat membaca lokasi GPS. Aktifkan izin lokasi (GPS) pada peramban Anda.'
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const takeSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw mirrored image for natural selfie feel
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Watermark with timestamp and employee name
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.fillStyle = 'rgba(0, 0, 0, 0.6)';
      context.fillRect(0, canvas.height - 40, canvas.width, 40);
      context.fillStyle = '#ffffff';
      context.font = '14px sans-serif';
      const watermarkText = `${employee.name} • ${new Date().toLocaleTimeString('id-ID')} WIB • ${new Date().toLocaleDateString('id-ID')}`;
      context.fillText(watermarkText, 15, canvas.height - 15);

      const capturedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoData(capturedBase64);
    }
    setIsCapturing(false);
  };

  const retakeSelfie = () => {
    setPhotoData(null);
    if (!stream) {
      startCamera();
    }
  };

  const handleSubmit = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });
    
    // Fallback photo if camera failed in dev environment
    const finalPhoto =
      photoData ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

    const currentLat = coords?.lat || office.latitude;
    const currentLng = coords?.lng || office.longitude;
    const currentDist = distanceMeters ?? 0;

    if (type === 'clockIn') {
      const { isLate, lateMinutes } = evaluateLate(
        timeStr,
        shift.startTime,
        shift.gracePeriodMinutes
      );

      onSubmit({
        clockInTime: timeStr,
        clockInPhoto: finalPhoto,
        clockInLat: currentLat,
        clockInLng: currentLng,
        clockInDistanceMeters: currentDist,
        isClockInWithinRadius: isWithinRadius || currentDist <= office.radiusMeters,
        clockInStatus: isLate ? 'late' : 'ontime',
        lateMinutes: lateMinutes,
        clockInAddress: isWithinRadius
          ? `${office.name} (${currentDist}m)`
          : `Di luar area kantor (${currentDist}m dari ${office.name})`,
      });
    } else {
      // Clock Out
      const overtime = evaluateOvertime(timeStr, shift.endTime);

      onSubmit({
        clockOutTime: timeStr,
        clockOutPhoto: finalPhoto,
        clockOutLat: currentLat,
        clockOutLng: currentLng,
        clockOutDistanceMeters: currentDist,
        isClockOutWithinRadius: isWithinRadius || currentDist <= office.radiusMeters,
        clockOutStatus: overtime > 0 ? 'overtime' : 'ontime',
        overtimeHours: overtime,
        clockOutAddress: isWithinRadius
          ? `${office.name} (${currentDist}m)`
          : `Di luar area kantor (${currentDist}m)`,
      });
    }

    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              {type === 'clockIn' ? 'Pencatatan Masuk (Clock In)' : 'Pencatatan Pulang (Clock Out)'}
            </h3>
            <p className="text-xs text-slate-500">
              {employee.name} • {shift.name}
            </p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* 1. Camera / Selfie Viewport */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-sky-600" />
                Verifikasi Wajah (Selfie Real-time)
              </span>
              {photoData && (
                <button
                  onClick={retakeSelfie}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Foto Ulang
                </button>
              )}
            </div>

            <div className="relative aspect-4/3 bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              {photoData ? (
                // Captured Image Preview
                <img
                  src={photoData}
                  alt="Selfie Preview"
                  className="w-full h-full object-cover"
                />
              ) : cameraError ? (
                // Camera Error / Permission Fallback
                <div className="p-6 text-center text-slate-300">
                  <Camera className="w-10 h-10 mx-auto mb-2 text-rose-400" />
                  <p className="text-xs text-rose-300 font-medium">{cameraError}</p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Izinkan akses kamera di peramban untuk mengambil foto selfie verifikasi kehadiran.
                  </p>
                  <button
                    onClick={startCamera}
                    className="mt-3 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg inline-flex items-center gap-1.5 border border-slate-700"
                  >
                    <RefreshCw className="w-3 h-3" /> Coba Lagi
                  </button>
                </div>
              ) : (
                // Live Camera Stream
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  {/* Face Guide Oval */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-44 h-56 border-2 border-dashed border-sky-400/70 rounded-[50%] shadow-lg"></div>
                    <span className="absolute bottom-4 bg-slate-900/70 text-white text-[11px] px-3 py-1 rounded-full backdrop-blur-xs">
                      Posisikan wajah di dalam bingkai
                    </span>
                  </div>
                </>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Take Photo Button */}
            {!photoData && !cameraError && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={takeSelfie}
                  disabled={isCapturing}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-sky-600/30 transition active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  Ambil Foto Selfie
                </button>
              </div>
            )}
          </div>

          {/* 2. Geolocation & Geofencing Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-600" />
                Status Geolocation & Geofencing
              </span>
              <button
                onClick={fetchCurrentLocation}
                disabled={isLocating}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                title="Perbarui GPS"
              >
                <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                {isLocating ? 'Mendeteksi...' : 'Cek Ulang GPS'}
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Titik Kantor:</span>
                <span className="font-medium text-slate-800 truncate max-w-[200px]">
                  {office.name}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Radius Izin Kantor:</span>
                <span className="font-medium text-slate-800">{office.radiusMeters} meter</span>
              </div>

              {coords && (
                <div className="flex justify-between text-slate-500 text-[11px] font-mono">
                  <span>Koordinat Anda:</span>
                  <span>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
                </div>
              )}
            </div>

            {/* Geofencing Verification Badge */}
            <div className="pt-1">
              {isLocating ? (
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 flex items-center gap-2 text-xs">
                  <Compass className="w-4 h-4 text-slate-400 animate-spin" />
                  <span>Sedang membaca akurasi titik GPS Anda...</span>
                </div>
              ) : isWithinRadius ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Lokasi Terverifikasi (Dalam Radius)</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Jarak Anda: <strong>{distanceMeters} meter</strong> dari kantor (Maks. {office.radiusMeters}m).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Peringatan: Di Luar Radius Kantor</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Jarak Anda: <strong>{distanceMeters ?? '?'} meter</strong> dari {office.name} (Batas radius kantor: {office.radiusMeters}m). Kehadiran akan tercatat di luar area.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shift Time Info Summary */}
          <div className="flex items-center justify-between text-xs px-2 text-slate-500">
            <span>Jadwal Shift: <strong>{shift.startTime} - {shift.endTime}</strong></span>
            <span>Toleransi Telat: <strong>{shift.gracePeriodMinutes} Menit</strong></span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition text-sm"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!photoData}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-white text-sm shadow-md transition flex items-center justify-center gap-2 ${
                type === 'clockIn'
                  ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              } ${!photoData ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ShieldCheck className="w-4 h-4" />
              {type === 'clockIn' ? 'Konfirmasi Masuk' : 'Konfirmasi Pulang'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
