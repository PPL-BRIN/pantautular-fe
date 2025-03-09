export const LocationService = {
    checkPermission: async () => {
      return navigator.permissions.query({ name: "geolocation" });
    },
    requestLocation: (onSuccess: () => void, onError: () => void) => {
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    },
  };  