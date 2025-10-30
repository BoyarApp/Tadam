import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import { LOCATION_PERMISSIONS } from '@constants';
import type { Location } from '@types';

export class LocationService {
  private static instance: LocationService;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Request location permission
  async requestPermission(): Promise<string> {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');

      if (auth === 'granted') {
        return LOCATION_PERMISSIONS.GRANTED;
      } else if (auth === 'denied') {
        return LOCATION_PERMISSIONS.DENIED;
      } else {
        return LOCATION_PERMISSIONS.BLOCKED;
      }
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Tadam needs access to your location to show district news',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return LOCATION_PERMISSIONS.GRANTED;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        return LOCATION_PERMISSIONS.BLOCKED;
      } else {
        return LOCATION_PERMISSIONS.DENIED;
      }
    }

    return LOCATION_PERMISSIONS.DENIED;
  }

  // Check if permission is granted
  async hasPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted;
    }

    return false;
  }

  // Get current position
  async getCurrentPosition(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  // Watch position (for continuous tracking)
  watchPosition(
    onSuccess: (location: Location) => void,
    onError: (error: any) => void
  ): number {
    return Geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        onSuccess(location);
      },
      onError,
      {
        enableHighAccuracy: true,
        distanceFilter: 100, // Update every 100 meters
        interval: 5000, // Update every 5 seconds
      }
    );
  }

  // Clear watch
  clearWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export default LocationService.getInstance();
