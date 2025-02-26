import React from "react";
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

const LocationPermissionPopup: React.FC<LocationPermissionPopupProps> = ({ open, onClose, onAllow, onDeny }) => {
  if (typeof window === "undefined") return null; // Cek apakah di server-side

  return open ? (
    <Overlay>
      <Modal>
        <WarningHeader>Lokasi Diperlukan</WarningHeader>
        <Message>Fitur ini memerlukan akses lokasi Anda. Izinkan akses?</Message>
        <ButtonContainer>
          <Button onClick={onDeny}>Tolak</Button>
          <Button $primary onClick={onAllow}>Izinkan</Button>
        </ButtonContainer>
      </Modal>
    </Overlay>
  ) : null;
};

export default LocationPermissionPopup;