import { useEffect, useState } from "react";

const LOCATION_PERMISSION_KEY = "locationPermission";

export const useLocationPermission = (
  open: boolean,
  onAllow: () => void,
  onClose: () => void
) => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (open) {
      const storedPermission = localStorage.getItem(LOCATION_PERMISSION_KEY);
      if (storedPermission === "granted") {
        setPermissionGranted(true);
        onClose();
        onAllow();
      }
    }
  }, [open, onAllow, onClose]);

  const allowPermission = () => {
    localStorage.setItem(LOCATION_PERMISSION_KEY, "granted");
    setPermissionGranted(true);
    onAllow();
    onClose();
  };

  const denyPermission = () => {
    setPermissionGranted(false);
    onClose();
  };

  return { permissionGranted, allowPermission, denyPermission };
};
