import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import type { EventUserLocation } from 'react-native-maps';

interface UseUserLocationOptions {
  requestPermission: boolean;
  onUserLocationChange?(e: EventUserLocation): void;
  followUserLocation: boolean;
}

export function useUserLocation(options: UseUserLocationOptions) {
  const [location, setLocation] = useState<Location.LocationObject>();

  const [watchPositionSubscription, setWatchPositionSubscription] =
    useState<Location.LocationSubscription>();

  const [permission] = Location.useForegroundPermissions({
    request: options.requestPermission,
    get: true,
  });

  const handleLocationChange = useCallback(
    function (e: Location.LocationObject) {
      setLocation(e);
      options.onUserLocationChange?.({
        nativeEvent: {
          coordinate: {
            ...e.coords,
            timestamp: Date.now(),
            altitude: e.coords.altitude || 0,
            heading: e.coords.heading || 0,
            accuracy: e.coords.accuracy || Location.Accuracy.Balanced,
            isFromMockProvider: e.mocked || false,
            speed: e.coords.speed || 0,
          },
        },
      } as unknown as EventUserLocation);
    },
    [options.onUserLocationChange]
  );

  useEffect(() => {
    if (permission?.granted && options.followUserLocation) {
      Location.getCurrentPositionAsync().then(handleLocationChange);
      // Watch position
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced },
        handleLocationChange
      ).then(setWatchPositionSubscription);
    }

    return () => watchPositionSubscription?.remove();
  }, [permission, options.followUserLocation]);

  return location;
}
