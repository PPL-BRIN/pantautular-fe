import { useEffect, useState } from "react";
import { ILocationPermissionService } from "../services/LocationPermissionService";

export const useLocationPermission = (
  open: boolean,
  onAllow: () => void,
  onClose: () => void,
  permissionService: ILocationPermissionService
) => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (open) {
      const storedPermission = permissionService.getPermission();
      if (storedPermission === "granted") {
        setPermissionGranted(true);
        onClose();
        onAllow();
      }
    }
  }, [open, onAllow, onClose, permissionService]);

  const allowPermission = () => {
    permissionService.setPermission("granted");
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