import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  User,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { EmployeeClinician, EmployeeVisit } from '../../types';
import { VisitDetailModal } from './VisitDetailModal';

// Mock GPS coordinates for Boston territory visits
const CLINICIAN_LOCATIONS: Record<string, { lat: number; lng: number; address: string; status: string }> = {
  'emp-01': { lat: 42.3551, lng: -71.0656, address: 'Beacon Hill, Boston MA', status: 'On Visit' },
  'emp-02': { lat: 42.3736, lng: -71.1097, address: 'Harvard Square, Cambridge MA', status: 'In Transit' },
  'emp-03': { lat: 42.3398, lng: -71.0891, address: 'Roxbury, Boston MA', status: 'Available' },
  'emp-04': { lat: 42.4184, lng: -71.1062, address: 'Medford Square, MA', status: 'On Visit' },
  'emp-05': { lat: 42.3318, lng: -71.1212, address: 'Brookline Village, MA', status: 'Scheduled' },
  'emp-06': { lat: 42.0834, lng: -71.0184, address: 'Brockton, MA', status: 'Available' },
  'emp-07': { lat: 42.3917, lng: -71.0328, address: 'Chelsea, MA', status: 'Available' },
  'emp-08': { lat: 42.3789, lng: -71.0300, address: 'East Boston, MA', status: 'Available' }
};

const PATIENT_VISIT_STOPS: Record<string, { lat: number; lng: number }> = {
  'v-108': { lat: 42.3584, lng: -71.0598 }, // Latia Williams 09:00 AM
  'v-109': { lat: 42.3520, lng: -71.0740 }, // Latia Williams 02:00 PM
  'v-110': { lat: 42.3560, lng: -71.0620 }, // Clifford Singleton 10:30 AM
  'v-111': { lat: 42.3505, lng: -71.0900 }, // Geminie Niles 04:00 PM
  'v-203': { lat: 42.3505, lng: -71.0900 }, // Carolyn Akuke -> Geminie Niles
  'v-402': { lat: 42.4184, lng: -71.1062 }, // Prince Akukwe -> Robert Hernandez
  'v-403': { lat: 42.3876, lng: -71.0995 }, // Prince Akukwe -> Evelyn Bauer
  'v-501': { lat: 42.3318, lng: -71.1212 }  // Megan Armstrong -> Gerald O'Connor
};

export const ScheduleMapView: React.FC = () => {
  const { clinicians, employeeVisits, theme } = useHealthcare();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedClinicianId, setSelectedClinicianId] = useState<string>('emp-01');
  const [selectedVisit, setSelectedVisit] = useState<EmployeeVisit | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Filter clinicians
  const filteredClinicians = clinicians.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.credentials.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = selectedService === 'all' || c.serviceLines.includes(selectedService as any);
    return matchesSearch && matchesService;
  });

  const selectedClinician = clinicians.find(c => c.id === selectedClinicianId) || clinicians[0];

  // Today's visits for selected clinician (dayOfWeek = 2 is Tuesday Nov 3)
  const clinicianTodayVisits = employeeVisits.filter(
    v => v.employeeId === selectedClinicianId && v.dayOfWeek === 2
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [42.3551, -71.0656],
        zoom: 13,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Routes when selected clinician or theme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const clinicianLoc = CLINICIAN_LOCATIONS[selectedClinicianId] || { lat: 42.3551, lng: -71.0656 };
    const routeCoordinates: [number, number][] = [[clinicianLoc.lat, clinicianLoc.lng]];

    // 1. Clinician Live Beacon Marker
    const clinicianIcon = L.divIcon({
      className: 'custom-clinician-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: rgba(225, 29, 72, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 36px; height: 36px; border-radius: 9999px; background: linear-gradient(135deg, #e11d48, #be123c); color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); border: 2.5px solid white;">
            ${selectedClinician.credentials}
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const clinicianMarker = L.marker([clinicianLoc.lat, clinicianLoc.lng], { icon: clinicianIcon }).addTo(layerGroup);
    clinicianMarker.bindPopup(`
      <div style="padding: 4px; font-family: inherit;">
        <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${selectedClinician.name}</div>
        <div style="font-size: 11px; color: #e11d48; font-weight: 700;">Live EVV Location: ${clinicianLoc.address}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Status: <b style="color: #10b981;">${clinicianLoc.status}</b></div>
      </div>
    `);

    // 2. Patient Stop Markers
    clinicianTodayVisits.forEach((visit, index) => {
      const stopLoc = PATIENT_VISIT_STOPS[visit.id] || {
        lat: clinicianLoc.lat + (index + 1) * 0.009 * (index % 2 === 0 ? 1 : -1),
        lng: clinicianLoc.lng + (index + 1) * 0.008 * (index % 2 === 0 ? -1 : 1)
      };

      routeCoordinates.push([stopLoc.lat, stopLoc.lng]);

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background-color: ${visit.status === 'completed' ? '#059669' : visit.status === 'in_progress' ? '#2563eb' : '#4f46e5'}; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); white-space: nowrap; border: 2px solid white; display: flex; align-items: center; gap: 4px;">
              <span>#${index + 1}</span>
              <span>${visit.timeSlot}</span>
            </div>
            <div style="width: 2px; height: 8px; background-color: #334155;"></div>
            <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #334155;"></div>
          </div>
        `,
        iconSize: [80, 42],
        iconAnchor: [40, 42]
      });

      const marker = L.marker([stopLoc.lat, stopLoc.lng], { icon: stopIcon }).addTo(layerGroup);
      marker.on('click', () => {
        setSelectedVisit(visit);
        setIsDetailOpen(true);
      });
      marker.bindPopup(`
        <div style="padding: 4px; font-family: inherit;">
          <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Stop #${index + 1} • ${visit.timeSlot}</div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-top: 2px;">${visit.patientName}</div>
          <div style="font-size: 11px; color: #e11d48; font-weight: 600;">${visit.visitType}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${visit.address || '1420 Harvard St, Boston MA'}</div>
        </div>
      `);
    });

    // 3. Connect Stops with Route Polyline
    if (routeCoordinates.length > 1) {
      L.polyline(routeCoordinates, {
        color: '#e11d48',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round'
      }).addTo(layerGroup);
    }

    // Zoom & pan map to fit clinician route
    const bounds = L.latLngBounds(routeCoordinates);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

  }, [selectedClinicianId, clinicianTodayVisits.length, theme]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[720px] rounded-3xl overflow-hidden glass-panel border border-pearl-200 dark:border-charcoal-700 p-2.5">
      
      {/* Left Roster Side Panel */}
      <div className="w-full lg:w-[360px] shrink-0 flex flex-col bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Territory Clinicians
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live GPS Dispatch • Tue, Nov 3
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {filteredClinicians.length} Active
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clinician by name, RN, HHA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-xl bg-white dark:bg-charcoal-900 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Service Line Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-bold">
            {['all', 'home_health', 'home_care'].map(s => (
              <button
                key={s}
                onClick={() => setSelectedService(s)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedService === s
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-650 text-slate-600 dark:text-slate-300'
                }`}
              >
                {s === 'all' ? 'All Services' : s === 'home_health' ? 'Home Health' : 'Home Care'}
              </button>
            ))}
          </div>
        </div>

        {/* Clinicians List */}
        <div className="flex-1 overflow-y-auto divide-y divide-pearl-100 dark:divide-charcoal-750 p-2 space-y-1.5">
          {filteredClinicians.map(c => {
            const isSelected = c.id === selectedClinicianId;
            const loc = CLINICIAN_LOCATIONS[c.id] || { status: 'Available', address: 'Boston MA' };
            const todayCount = employeeVisits.filter(v => v.employeeId === c.id && v.dayOfWeek === 2).length;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedClinicianId(c.id)}
                className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300/80 dark:border-rose-800 shadow-2xs ring-1 ring-rose-500/20'
                    : 'hover:bg-pearl-50 dark:hover:bg-charcoal-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                    c.credentials === 'RN'
                      ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                      : c.credentials === 'OT' || c.credentials === 'PT'
                      ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                  }`}>
                    {c.credentials}
                  </div>

                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {c.title} • {c.branch}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone size={10} /> {c.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    loc.status === 'On Visit'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : loc.status === 'In Transit'
                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                      : 'bg-slate-500/10 text-slate-700 dark:text-slate-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      loc.status === 'On Visit'
                        ? 'bg-emerald-500'
                        : loc.status === 'In Transit'
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-slate-400'
                    }`} />
                    {loc.status}
                  </span>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {todayCount} {todayCount === 1 ? 'visit' : 'visits'} today
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Clinician Route Overview Bar */}
        <div className="p-3 bg-pearl-50 dark:bg-charcoal-800 border-t border-pearl-200 dark:border-charcoal-700 text-xs">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-900 dark:text-white">
            <span>Today's Route Schedule</span>
            <span className="text-rose-600 dark:text-rose-400">{clinicianTodayVisits.length} Stops</span>
          </div>

          <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {clinicianTodayVisits.length === 0 ? (
              <div className="text-[11px] text-slate-400 py-1">No scheduled visits today</div>
            ) : (
              clinicianTodayVisits.map((v, i) => (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVisit(v);
                    setIsDetailOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between text-[11px] cursor-pointer hover:border-rose-400"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-charcoal-750 flex items-center justify-center font-black text-[9px] text-slate-600 dark:text-slate-300 shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {v.patientName}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {v.timeSlot}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right Map Canvas Container */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-pearl-200 dark:border-charcoal-700 shadow-inner bg-slate-100 dark:bg-charcoal-900">
        
        {/* Leaflet Mount Point */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Map Legend & Overlay */}
        <div className="absolute top-4 right-4 z-10 p-3 rounded-2xl bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-md border border-pearl-200 dark:border-charcoal-700 shadow-lg text-xs space-y-2 pointer-events-auto">
          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Layers size={13} className="text-rose-600" />
            <span>Territory Legend</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-300" />
              <span>Clinician GPS Beacon</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Completed Visit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>In Progress Visit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span>Scheduled Stop</span>
            </div>
          </div>
        </div>

      </div>

      {/* Visit Detail Modal */}
      <VisitDetailModal
        visit={selectedVisit}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedVisit(null);
        }}
      />

    </div>
  );
};

