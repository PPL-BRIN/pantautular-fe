"use client";

export const useLocationHandlers = (
  setShowPopup: (value: boolean) => void,
  onAllowCallback: () => void,
  onDenyCallback: () => void
) => {
  const handleAllow = () => {
    setShowPopup(false);
    console.log("Izin lokasi diberikan.");
    onAllowCallback(); // Gunakan callback agar bisa dikustomisasi
  };

  const handleDeny = () => {
    setShowPopup(false);
    console.log("Izin lokasi ditolak.");
    onDenyCallback(); // Gunakan callback agar bisa dikustomisasi
  };

  return { handleAllow, handleDeny };
};