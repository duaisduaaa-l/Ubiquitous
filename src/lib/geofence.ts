export const CAMPUS_LOCATION = {
    // lat: 30.771972863020316,
    // lng: 76.56376098460782,
    lat:30.77090509432338,
    lng: 76.57029968083211,
    radiusMeters: 100, // allow within 100 metres
  };
  
  export function getDistanceMeters(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    const R = 6371000; // Earth radius in metres
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  
  export function isWithinCampus(lat: number, lng: number): boolean {
    const dist = getDistanceMeters(lat, lng, CAMPUS_LOCATION.lat, CAMPUS_LOCATION.lng);
    return dist <= CAMPUS_LOCATION.radiusMeters;
  }