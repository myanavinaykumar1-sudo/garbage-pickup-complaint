import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Complaint, ComplaintStatus } from '../types';
import { useApp } from '../context/AppContext';
import { Layers, Crosshair, Route, RefreshCw, Eye } from 'lucide-react';

interface MapViewProps {
  complaints: Complaint[];
  selectedId?: string | null;
  onSelectComplaint?: (id: string) => void;
  showRoute?: boolean;
  workerMode?: boolean;
  heightClass?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  complaints,
  selectedId,
  onSelectComplaint,
  showRoute = false,
  workerMode = false,
  heightClass = 'h-[460px] md:h-[540px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const { setSelectedComplaintId } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return '#f59e0b'; // Amber
      case 'Assigned':
        return '#2563eb'; // Blue
      case 'In Progress':
        return '#8b5cf6'; // Purple
      case 'Resolved':
        return '#10b981'; // Emerald
      default:
        return '#64748b';
    }
  };

  const createCustomIcon = (status: ComplaintStatus, isSelected: boolean) => {
    const color = getStatusColor(status);
    const pulseRing = isSelected
      ? `<span className="absolute -inset-2 rounded-full animate-ping opacity-60" style="background-color: ${color}"></span>`
      : '';

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div className="relative flex items-center justify-center">
          ${pulseRing}
          <div style="background-color: ${color}; width: ${isSelected ? '32px' : '26px'}; height: ${
        isSelected ? '32px' : '26px'
      }; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);" className="rounded-full flex items-center justify-center text-white text-[11px] font-bold transition-transform hover:scale-125">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([12.9716, 77.5982], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    const filtered = complaints.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      return true;
    });

    const routeLatLngs: L.LatLngTuple[] = [];

    filtered.forEach((complaint) => {
      const isSelected = selectedId === complaint.id;
      const marker = L.marker([complaint.location.lat, complaint.location.lng], {
        icon: createCustomIcon(complaint.status, isSelected),
      });

      const popupHtml = `
        <div style="min-width: 220px; max-width: 260px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="height: 100px; overflow: hidden; position: relative;">
            <img src="${complaint.imageUrl}" alt="${complaint.categoryLabel}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 6px; right: 6px; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background-color: #1e293b; color: #ffffff;">
              ${complaint.status}
            </span>
          </div>
          <div style="padding: 10px 12px;">
            <div style="font-size: 10px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em;">
              ${complaint.id}
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; line-height: 1.2;">
              ${complaint.categoryLabel}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
              📍 ${complaint.location.street}, ${complaint.location.area}
            </div>
            ${
              complaint.assignedWorkerName
                ? `<div style="font-size: 11px; color: #059669; font-weight: 600; margin-top: 4px;">
                    🚛 Assigned: ${complaint.assignedWorkerName}
                   </div>`
                : ''
            }
            <button id="view-complaint-${complaint.id}" style="width: 100%; margin-top: 8px; padding: 6px 10px; background-color: #059669; color: #ffffff; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 4px;">
              View Full Progress
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-complaint-${complaint.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectComplaint) onSelectComplaint(complaint.id);
            else setSelectedComplaintId(complaint.id);
          };
        }
      });

      marker.addTo(markersLayerRef.current!);

      if (complaint.status === 'Assigned' || complaint.status === 'In Progress') {
        routeLatLngs.push([complaint.location.lat, complaint.location.lng]);
      }
    });

    // Draw route if enabled
    if (showRoute && routeLatLngs.length > 1) {
      const polyline = L.polyline(routeLatLngs, {
        color: '#0284c7',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85,
      }).addTo(map);
      routeLayerRef.current = polyline;
    }

    // Auto-focus selected
    if (selectedId) {
      const target = complaints.find((c) => c.id === selectedId);
      if (target) {
        map.flyTo([target.location.lat, target.location.lng], 15, { duration: 1.2 });
      }
    }
  }, [complaints, statusFilter, selectedId, showRoute]);

  const fitAllMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map || complaints.length === 0) return;

    const bounds = L.latLngBounds(
      complaints.map((c) => [c.location.lat, c.location.lng] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  };

  const handleLocateUser = () => {
    setIsLocating(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const map = mapInstanceRef.current;
        if (map) {
          const { latitude, longitude } = position.coords;
          map.flyTo([latitude, longitude], 15, { duration: 1.5 });

          // Add temporary pulse marker for user location
          const userIcon = L.divIcon({
            className: 'user-gps-marker',
            html: `
              <div className="relative flex items-center justify-center">
                <span className="absolute -inset-2 rounded-full animate-ping bg-sky-500 opacity-75"></span>
                <div className="w-5 h-5 rounded-full bg-sky-600 border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
            `,
            iconSize: [20, 20],
          });

          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>Your Current Location</b>')
            .openPopup();
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setGpsError('GPS permission denied. Using municipal coordinates.');
        setTimeout(() => setGpsError(null), 4000);
      },
      { timeout: 7000 }
    );
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 pr-2 border-r border-slate-200">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Filter:</span>
        </div>

        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            statusFilter === 'ALL'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({complaints.length})
        </button>

        <button
          onClick={() => setStatusFilter('Pending')}
          className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition ${
            statusFilter === 'Pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-amber-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Pending
        </button>

        <button
          onClick={() => setStatusFilter('Assigned')}
          className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition ${
            statusFilter === 'Assigned'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-blue-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          Assigned
        </button>

        <button
          onClick={() => setStatusFilter('In Progress')}
          className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition ${
            statusFilter === 'In Progress'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-purple-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          In Progress
        </button>

        <button
          onClick={() => setStatusFilter('Resolved')}
          className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition ${
            statusFilter === 'Resolved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          Resolved
        </button>
      </div>

      {/* Top Right Actions */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <button
          onClick={handleLocateUser}
          title="Detect My Location"
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs font-semibold transition active:scale-95"
        >
          <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">My GPS</span>
        </button>

        <button
          onClick={fitAllMarkers}
          title="Fit All Complaint Markers"
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs font-semibold transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Fit View</span>
        </button>
      </div>

      {/* GPS Notification Warning Toast */}
      {gpsError && (
        <div className="absolute top-16 left-3 z-[1000] bg-amber-50 border border-amber-300 text-amber-800 text-xs px-3 py-1.5 rounded-lg shadow-md animate-fade-in">
          {gpsError}
        </div>
      )}

      {/* Worker Route Legend Badge */}
      {showRoute && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-2">
          <Route className="w-3.5 h-3.5 text-sky-600" />
          <span>Active Worker Dispatch Route (Blue Dashed Path)</span>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} className={heightClass} />
    </div>
  );
};
