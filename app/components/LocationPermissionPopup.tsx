import React, { useEffect, useState } from "react";
import { 
  Overlay, 
  Modal, 
  WarningHeader, 
  Message, 
  ButtonContainer, 
  Button 
} from "../../styles/LocationPermissionPopup.styles";

interface LocationPermissionPopupProps {
  open: boolean;
  onClose: () => void;
  onAllow: () => void;
  onDeny: () => void;
}

const LOCATION_PERMISSION_KEY = "locationPermission";

const LocationPermissionPopup: React.FC<LocationPermissionPopupProps> = ({ open, onClose, onAllow, onDeny }) => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (open) {
      const storedPermission = localStorage.getItem(LOCATION_PERMISSION_KEY);

      if (storedPermission === "granted") {
        setPermissionGranted(true);
        onClose(); // Tutup popup
        onAllow(); // Jika izin sudah ada, langsung jalankan onAllow
      } else {
        setPermissionGranted(false); // Reset permissionGranted jika tidak granted
      }
    }
  }, [open, onAllow, onClose]);

  const handleAllow = () => {
    localStorage.setItem(LOCATION_PERMISSION_KEY, "granted");
    setPermissionGranted(true);
    onAllow(); // Panggil callback untuk halaman
    onClose();
  };

  const handleDeny = () => {
    setPermissionGranted(false);
    onClose();
    onDeny(); // Panggil callback untuk halaman
  };

  if (!open || permissionGranted) return null; // Jika sudah diizinkan, tidak tampilkan popup lagi

  return (
    <Overlay>
      <Modal>
        <WarningHeader>Lokasi Diperlukan</WarningHeader>
        <Message>Fitur ini memerlukan akses lokasi Anda. Izinkan akses?</Message>
        <ButtonContainer>
          <Button onClick={handleDeny}>Tolak</Button>
          <Button $primary onClick={handleAllow}>Lanjutkan</Button>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
};

export default LocationPermissionPopup;