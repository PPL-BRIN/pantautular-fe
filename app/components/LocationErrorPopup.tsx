"use client"

import { LocationErrorType } from '../../services/LocationService';
import { useEffect, useState } from "react";

interface LocationErrorPopupProps {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  errorType?: LocationErrorType;
}

interface Reason {
  id: string;
  text: string;
}

interface ErrorDetails {
  title: string;
  description: string;
  reasons: Reason[];
}

export default function LocationErrorPopup({ 
  open = false, 
  onOpenChange,
  errorType = "UNKNOWN"
}: Readonly<LocationErrorPopupProps>) {
  const [errorDetails, setErrorDetails] = useState<ErrorDetails>({
    title: "Lokasi Tidak Ditemukan",
    description: "Kami tidak dapat menentukan lokasi Anda saat ini.",
    reasons: [
      { id: "weak-gps", text: "Sinyal GPS perangkat Anda lemah atau terhalang" },
      { id: "bad-coverage", text: "Anda berada di area dengan cakupan GPS yang buruk" },
      { id: "unavailable", text: "Layanan lokasi perangkat Anda mungkin sementara tidak tersedia" },
      { id: "hardware-issue", text: "Ada masalah dengan perangkat keras lokasi perangkat Anda" }
    ]
  });

  useEffect(() => {
    console.log("Error type changed:", errorType);
    
    switch (errorType) {
      case "BROWSER_UNSUPPORTED":
        setErrorDetails({
          title: "Browser Tidak Mendukung",
          description: "Browser Anda tidak mendukung fitur geolokasi.",
          reasons: [
            { id: "outdated", text: "Browser Anda mungkin sudah usang" },
            { id: "disabled", text: "Fitur geolokasi mungkin dinonaktifkan di browser Anda" },
            { id: "try-other", text: "Coba gunakan browser lain seperti Chrome atau Firefox terbaru" }
          ]
        });
        break;
        
      case "PERMISSION_DENIED":
        setErrorDetails({
          title: "Akses Lokasi Ditolak",
          description: "Anda telah menolak akses ke lokasi Anda.",
          reasons: [
            { id: "disabled-settings", text: "Izin lokasi dinonaktifkan di pengaturan browser Anda" },
            { id: "previous-denied", text: "Anda mungkin telah menolak izin lokasi sebelumnya" },
            { id: "check-settings", text: "Periksa pengaturan izin di browser Anda" },
            { id: "refresh", text: "Coba refresh halaman dan izinkan akses lokasi" }
          ]
        });
        break;
        
      case "POSITION_UNAVAILABLE":
        setErrorDetails({
          title: "Lokasi Tidak Tersedia",
          description: "Sistem tidak dapat menentukan lokasi Anda saat ini.",
          reasons: [
            { id: "weak-gps", text: "Sinyal GPS perangkat Anda lemah atau terhalang" },
            { id: "bad-coverage", text: "Anda berada di area dengan cakupan GPS yang buruk" },
            { id: "unstable-internet", text: "Koneksi internet Anda mungkin tidak stabil" },
            { id: "unavailable", text: "Layanan lokasi perangkat Anda mungkin sementara tidak tersedia" }
          ]
        });
        break;
        
      case "TIMEOUT":
        setErrorDetails({
          title: "Waktu Permintaan Habis",
          description: "Waktu untuk mendapatkan lokasi Anda telah habis.",
          reasons: [
            { id: "slow-internet", text: "Koneksi internet Anda lambat atau tidak stabil" },
            { id: "weak-signal", text: "Sinyal GPS lemah di lokasi Anda berada" },
            { id: "more-time", text: "Perangkat Anda mungkin membutuhkan waktu lebih lama untuk menentukan lokasi" },
            { id: "better-signal", text: "Coba lagi di lokasi dengan sinyal yang lebih baik" }
          ]
        });
        break;
        
      default:
        setErrorDetails({
          title: "Lokasi Tidak Ditemukan",
          description: "Kami tidak dapat menentukan lokasi Anda saat ini.",
          reasons: [
            { id: "weak-gps", text: "Sinyal GPS perangkat Anda lemah atau terhalang" },
            { id: "bad-coverage", text: "Anda berada di area dengan cakupan GPS yang buruk" },
            { id: "unavailable", text: "Layanan lokasi perangkat Anda mungkin sementara tidak tersedia" },
            { id: "hardware-issue", text: "Ada masalah dengan perangkat keras lokasi perangkat Anda" }
          ]
        });
    }
  }, [errorType]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    data-testid="location-error-popup"
    >
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-red-600 dark:text-red-400"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold">{errorDetails.title}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {errorDetails.description}
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-700/50">
          <h3 className="mb-2 font-medium">Ini mungkin terjadi karena:</h3>
          <ul className="ml-5 list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
            {errorDetails.reasons.map((reason) => (
              <li key={reason.id}>{reason.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}