'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Park, calculateDistance } from '@/lib/parks';
import { MapPin, Navigation } from 'lucide-react';

interface MapViewProps {
  parks: Park[];
  userLocation: { lat: number; lng: number } | null;
  onParkSelect: (park: Park) => void;
  onGetDirections: (park: Park) => void;
}

// Fix default Leaflet icons for Next.js bundling
function fixLeafletIcons() {
  // @ts-expect-error - leaflet icon hack
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Component to handle map updates (center on user, etc.)
function MapController({ 
  userLocation, 
  parks 
}: { 
  userLocation: { lat: number; lng: number } | null; 
  parks: Park[] 
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 8, { duration: 1.2 });
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (parks.length > 0 && !userLocation) {
      // Fit bounds to show all current parks nicely
      const bounds = L.latLngBounds(
        parks.filter((p) => p.lat != null && p.lng != null).map((p) => [p.lat!, p.lng!] as [number, number])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12, duration: 0.8 });
      }
    }
  }, [parks, map, userLocation]);

  return null;
}

export default function MapView({ parks, userLocation, onParkSelect, onGetDirections }: MapViewProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [39.8, -98.5]; // US center

  const zoom = userLocation ? 8 : 4;

  return (
    <div className="map-container border border-slate-700 bg-slate-900 rounded-3xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController userLocation={userLocation} parks={parks} />

        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-marker',
              html: `<div style="background:#f59e0b;width:16px;height:16px;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(245,158,11,0.4)"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <div className="text-sm font-medium">You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Park markers */}
        {parks.filter((p) => p.lat != null && p.lng != null).map((park) => {
          let distanceText = '';
          if (userLocation) {
            const dist = calculateDistance(userLocation.lat, userLocation.lng, park.lat!, park.lng!);
            distanceText = `${dist.toFixed(0)} mi away`;
          }

          return (
            <Marker 
              key={park.id} 
              position={[park.lat!, park.lng!]}
            >
              <Popup>
                <div className="min-w-[200px] p-1">
                  <div className="font-semibold text-base text-white leading-tight mb-1">{park.name}</div>
                  <div className="text-emerald-400 text-xs mb-2">{park.city}, {park.state}</div>
                  
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <span className="font-semibold">★ {park.rating}</span>
                    <span className="text-amber-600">•</span>
                    <span className="font-semibold">${park.price}/night</span>
                    {distanceText && <span className="text-emerald-300 ml-auto text-xs">{distanceText}</span>}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => onParkSelect(park)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 transition text-white text-xs font-semibold py-2 px-3 rounded-2xl flex items-center justify-center gap-1"
                    >
                      <MapPin className="w-3 h-3" /> Details
                    </button>
                    <button 
                      onClick={() => onGetDirections(park)}
                      className="flex-1 bg-orange-600 hover:bg-orange-500 transition text-white text-xs font-semibold py-2 px-3 rounded-2xl flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Directions
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
