"use client";

export const useLocationHandlers = (setShowPopup: (value: boolean) => void) => {
  const handleAllow = () => {
    setShowPopup(false);
    console.log("Izin lokasi diberikan, lanjutkan ke fitur lain...");

    // #TODO di sini panggil fitur lokasi saya
  };

  const handleDeny = () => {
    setShowPopup(false);
    console.log("Izin lokasi ditolak, tampilkan error atau lakukan tindakan lain...");

    // #TODO di sini panggil popup error
  };

  return { handleAllow, handleDeny };
};