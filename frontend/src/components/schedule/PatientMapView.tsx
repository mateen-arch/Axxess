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
  ChevronRight,
  Home
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { EmployeeVisit } from '../../types';
import { VisitDetailModal } from './VisitDetailModal';

// Mock GPS coordinates for Boston territory patient residences
const PATIENT_RESIDENCE_LOCATIONS: Record<string, { lat: number; lng: number; address: string; branch: string }> = {
  'Williams, Latia': { lat: 42.3584, lng: -71.0598, address: '1420 Harvard St, Boston MA', branch: 'Standards Home Care' },
  'Singleton Jr., Clifford': { lat: 42.3560, lng: -71.0620, address: '88 Tremont St, Boston MA', branch: 'Standards Home Care' },
  'Niles, Geminie': { lat: 42.3505, lng: -71.0900, address: '500 Commonwealth Ave, Boston MA', branch: 'Standards Home Care' },
  'Doshi, Kundanika': { lat: 42.3736, lng: -71.1097, address: '221 Mass Ave, Cambridge MA', branch: 'Standards Home Care' },
  'Hernandez, Robert': { lat: 42.4184, lng: -71.1062, address: '42 Forest St, Medford MA', branch: 'Standards Home Care' },
  'Bauer, Evelyn': { lat: 42.3876, lng: -71.0995, address: '77 Elm St, Somerville MA', branch: 'Standards Home Care' },
  'O\'Connor, Gerald': { lat: 42.3318, lng: -71.1212, address: '19 Walnut St, Brookline MA', branch: 'Standards Home Care' },
  'Abuissa, Heather': { lat: 42.3412, lng: -71.0823, address: '351 Washington St, Boston MA', branch: 'Standards Home Care' },
  'Anis, Marie V.': { lat: 42.3210, lng: -71.0745, address: '617 Columbia Rd, Dorchester MA', branch: 'Standards Home Care' },
  'Antoine, Louis': { lat: 42.3689, lng: -71.0421, address: '863 Saratoga St, Boston MA', branch: 'Standards Home Care' }
};

export const PatientMapView: React.FC = () => {
  const { employeeVisits, theme } = useHealthcare();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedPatientKey, setSelectedPatientKey] = useState<string>('Williams, Latia');
  const [selectedVisit, setSelectedVisit] = useState<EmployeeVisit | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Today's scheduled visits (dayOfWeek = 2 is Tuesday Nov 3)
  const todayVisits = employeeVisits.filter(v => v.dayOfWeek === 2);

  // Group visits by patient
  const patientMap = new Map<string, { patientName: string; visits: EmployeeVisit[]; address: string }>();
  todayVisits.forEach(v => {
    if (!patientMap.has(v.patientName)) {
      const loc = PATIENT_RESIDENCE_LOCATIONS[v.patientName] || {
        address: v.address || 'Boston, MA'
      };
      patientMap.set(v.patientName, {
        patientName: v.patientName,
        visits: [],
        address: loc.address
      });
    }
    patientMap.get(v.patientName)!.visits.push(v);
  });

  const todayPatients = Array.from(patientMap.values());

  // Filter patients
  const filteredPatients = todayPatients.filter(p => {
    const matchesSearch = p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.visits.some(v => v.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesService = selectedService === 'all' || p.visits.some(v => v.serviceLine === selectedService);
    return matchesSearch && matchesService;
  });

  const activePatient = patientMap.get(selectedPatientKey) || todayPatients[0];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [42.3584, -71.0598],
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

  // Update Markers & Geofences
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const selectedLoc = PATIENT_RESIDENCE_LOCATIONS[selectedPatientKey] || { lat: 42.3584, lng: -71.0598, address: 'Boston MA' };

    // 1. Plot all today's patient residences
    todayPatients.forEach(p => {
      const isSelected = p.patientName === selectedPatientKey;
      const loc = PATIENT_RESIDENCE_LOCATIONS[p.patientName] || { lat: 42.3584, lng: -71.0598 };
      const hasCompleted = p.visits.some(v => v.status === 'completed');
      const hasInProgress = p.visits.some(v => v.status === 'in_progress');

      const markerColor = hasCompleted ? '#059669' : hasInProgress ? '#2563eb' : '#4f46e5';

      const patientIcon = L.divIcon({
        className: 'custom-patient-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${isSelected ? '<div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: rgba(225, 29, 72, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; top: -4px;"></div>' : ''}
            <div style="position: relative; background-color: ${isSelected ? '#e11d48' : markerColor}; color: white; padding: 4px 9px; border-radius: 9999px; font-size: 11px; font-weight: 800; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; gap: 4px;">
              <span>${p.patientName.split(',')[0]}</span>
              <span style="font-size: 9px; opacity: 0.9;">(${p.visits.length})</span>
            </div>
            <div style="width: 2px; height: 8px; background-color: #334155;"></div>
            <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #334155;"></div>
          </div>
        `,
        iconSize: [100, 44],
        iconAnchor: [50, 44]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: patientIcon }).addTo(layerGroup);

      marker.on('click', () => {
        setSelectedPatientKey(p.patientName);
        if (p.visits[0]) {
          setSelectedVisit(p.visits[0]);
          setIsDetailOpen(true);
        }
      });

      marker.bindPopup(`
        <div style="padding: 4px; font-family: inherit;">
          <div style="font-size: 10px; font-weight: 800; color: #e11d48; text-transform: uppercase;">Patient Residence</div>
          <div style="font-weight: 900; font-size: 13px; color: #0f172a; margin-top: 2px;">${p.patientName}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${p.address}</div>
          <div style="font-size: 11px; color: #10b981; font-weight: 700; margin-top: 4px;">${p.visits.length} scheduled visits today</div>
        </div>
      `);

      // 2. If selected, add authorized EVV geofence radius circle (100 meters / 35 ft circle)
      if (isSelected) {
        L.circle([loc.lat, loc.lng], {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.12,
          radius: 120,
          weight: 2,
          dashArray: '4, 4'
        }).addTo(layerGroup);

        // Add inbound clinician vehicle pin
        const firstVisit = p.visits[0];
        if (firstVisit) {
          const clinicianLat = loc.lat + 0.007;
          const clinicianLng = loc.lng - 0.006;

          const vehicleIcon = L.divIcon({
            className: 'custom-vehicle-marker',
            html: `
              <div style="background-color: #0f172a; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px;">
                <span>🚗</span>
                <span>${firstVisit.employeeName.split(',')[0]}</span>
              </div>
            `,
            iconSize: [90, 30],
            iconAnchor: [45, 15]
          });

          L.marker([clinicianLat, clinicianLng], { icon: vehicleIcon }).addTo(layerGroup);

          // Route dashed line connecting clinician to patient residence
          L.polyline([[clinicianLat, clinicianLng], [loc.lat, loc.lng]], {
            color: '#2563eb',
            weight: 3,
            opacity: 0.8,
            dashArray: '6, 8'
          }).addTo(layerGroup);
        }
      }
    });

    // Center map on selected patient
    map.setView([selectedLoc.lat, selectedLoc.lng], 14, { animate: true });

  }, [selectedPatientKey, todayVisits.length, theme]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[720px] rounded-3xl overflow-hidden glass-panel border border-pearl-200 dark:border-charcoal-700 p-2.5">
      
      {/* Left Patient Roster Side Panel */}
      <div className="w-full lg:w-[360px] shrink-0 flex flex-col bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Patient Residences
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scheduled Locations • Tue, Nov 3
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {filteredPatients.length} Patients
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient or address..."
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

        {/* Patients List */}
        <div className="flex-1 overflow-y-auto divide-y divide-pearl-100 dark:divide-charcoal-750 p-2 space-y-1.5">
          {filteredPatients.map(p => {
            const isSelected = p.patientName === selectedPatientKey;
            const primaryService = p.visits[0]?.serviceLine || 'home_health';
            const initials = p.patientName.split(',').map(s => s.trim()[0]).filter(Boolean).join('');

            return (
              <div
                key={p.patientName}
                onClick={() => setSelectedPatientKey(p.patientName)}
                className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300/80 dark:border-rose-800 shadow-2xs ring-1 ring-rose-500/20'
                    : 'hover:bg-pearl-50 dark:hover:bg-charcoal-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                    primaryService === 'home_health'
                      ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                      : 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                  }`}>
                    {initials || 'PT'}
                  </div>

                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                      {p.patientName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                      <MapPin size={10} className="shrink-0 text-slate-400" />
                      <span className="truncate">{p.address}</span>
                    </div>
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                      {p.visits[0]?.visitType}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300">
                    {p.visits[0]?.timeSlot || 'AM'}
                  </span>
                  <div className="text-[10px] font-bold text-slate-400 mt-1">
                    {p.visits.length} {p.visits.length === 1 ? 'visit' : 'visits'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Patient Dispatch Overview Bar */}
        <div className="p-3.5 bg-pearl-50 dark:bg-charcoal-800 border-t border-pearl-200 dark:border-charcoal-700 text-xs">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-900 dark:text-white">
            <span>Today's Arriving Clinicians</span>
            <span className="text-rose-600 dark:text-rose-400">{activePatient?.visits.length || 0} Encounters</span>
          </div>

          <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {activePatient?.visits.map((v, i) => (
              <div
                key={v.id}
                onClick={() => {
                  setSelectedVisit(v);
                  setIsDetailOpen(true);
                }}
                className="p-2 rounded-xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between text-[11px] cursor-pointer hover:border-rose-400"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-[9px] shrink-0">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-800 dark:text-slate-200 truncate">
                      {v.employeeName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{v.visitType}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {v.timeSlot}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Map Canvas Container */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-pearl-200 dark:border-charcoal-700 shadow-inner bg-slate-100 dark:bg-charcoal-900">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Map Legend & Overlay */}
        <div className="absolute top-4 right-4 z-10 p-3 rounded-2xl bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-md border border-pearl-200 dark:border-charcoal-700 shadow-lg text-xs space-y-2 pointer-events-auto">
          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Layers size={13} className="text-rose-600" />
            <span>Patient Dispatch Legend</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-300" />
              <span>Selected Patient Residence</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Authorized Geofence (35 ft)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Clinician In-Transit Route</span>
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

