// abstraction untuk permission storage

export interface ILocationPermissionService {
    getPermission(): string | null;
    setPermission(value: string): void;
  }
  
  export class LocalStoragePermissionService implements ILocationPermissionService {
    private static LOCATION_PERMISSION_KEY = "locationPermission";
  
    getPermission(): string | null {
      return localStorage.getItem(LocalStoragePermissionService.LOCATION_PERMISSION_KEY);
    }
  
    setPermission(value: string): void {
      localStorage.setItem(LocalStoragePermissionService.LOCATION_PERMISSION_KEY, value);
    }
  }  