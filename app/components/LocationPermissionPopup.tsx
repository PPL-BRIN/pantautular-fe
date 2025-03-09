import React, { useEffect, useState } from "react";
import { LocationService } from "../../services/LocationService";
import { 
  Overlay, 
  Modal, 
  WarningHeader, 
  Message, 
  ButtonContainer, 
  Button 
} from "../../styles/LocationPermissionPopup.styles";

interface LocationPermissionPopupProps {
  onClose: () => void;
  onAllow: () => void;
  onDeny: () => void;
}

const LocationPermissionPopup: React.FC<LocationPermissionPopupProps> = ({
  onClose,
  onAllow,
  onDeny,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Gunakan LocationService untuk mengecek izin lokasi
    LocationService.checkPermission().then((permissionStatus) => {
      if (permissionStatus.state !== "granted") {
        setOpen(true);
      } else {
        onAllow(); // Jika sudah diizinkan, langsung panggil fitur lain
      }
    });
  }, [onAllow]);

  const handleAllow = () => {
    // Gunakan LocationService untuk meminta akses lokasi
    LocationService.requestLocation(
      () => {
        setOpen(false);
        onAllow(); // Jika pengguna memilih "Izinkan", panggil fitur lain
      },
      () => {
        setOpen(false);
        onDeny(); // Panggil onDeny untuk menangani error di tempat lain
      }
    );
  };

  const handleDeny = () => {
    setOpen(false);
    onDeny();
  };

  if (!open) return null;

  return (
    <Overlay>
      <Modal>
        <WarningHeader>Izin Lokasi Diperlukan</WarningHeader>
        <Message>
          Fitur ini membutuhkan akses lokasi Anda. 
          Izinkan akses?
        </Message>
        <ButtonContainer>
          <Button onClick={handleDeny}>Batal</Button>
          <Button $primary onClick={handleAllow}>Lanjutkan</Button>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
};

export default LocationPermissionPopup;