import React from "react";
import { 
  Overlay, 
  Modal, 
  WarningHeader, 
  Message, 
  ButtonContainer, 
  Button 
} from "../../styles/LocationPermissionPopup.styles";
import { useLocationPermission } from "../../hooks/useLocationPermission";
import { LocalStoragePermissionService } from "../../services/LocationPermissionService";

interface LocationPermissionPopupProps {
  open: boolean;
  onClose: () => void;
  onAllow: () => void;
  onDeny: () => void;
}

// Inisialisasi service untuk penyimpanan izin lokasi
const permissionService = new LocalStoragePermissionService();

const LocationPermissionPopup: React.FC<LocationPermissionPopupProps> = ({ open, onClose, onAllow, onDeny }) => {
  // Gunakan custom hook untuk mengelola izin lokasi
  const { permissionGranted, allowPermission, denyPermission } = useLocationPermission(open, onAllow, onClose, permissionService);

  if (!open || permissionGranted) return null;

  return (
    <Overlay>
      <Modal>
        <WarningHeader>Lokasi Diperlukan</WarningHeader>
        <Message>Fitur ini memerlukan akses lokasi Anda. Izinkan akses?</Message>
        <ButtonContainer>
          <Button onClick={() => { denyPermission(); onDeny(); }}>Tolak</Button>
          <Button $primary onClick={allowPermission}>Lanjutkan</Button>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
};

export default LocationPermissionPopup;