import React, { useState, useEffect, useRef, useMemo } from 'react';
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

export const PatientMapView: React.FC = () => {
  const { employeeVisits, patients, theme } = useHealthcare();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [selectedPatientKey, setSelectedPatientKey] = useState<string>('');
  const [selectedVisit, setSelectedVisit] = useState<EmployeeVisit | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Filter visits by service line and day
  const filteredVisits = useMemo(() => {
    return employeeVisits.filter(v => {
      if (selectedService !== 'all' && v.serviceLine !== selectedService) return false;
      if (selectedDayFilter !== 'all' && String(v.dayOfWeek) !== selectedDayFilter) return false;
      return true;
    });
  }, [employeeVisits, selectedService, selectedDayFilter]);

  // Group visits by patient
  const patientMap = useMemo(() => {
    const map = new Map<string, {
      patientName: string;
      patientMrn: string;
      visits: EmployeeVisit[];
      address: string;
      latitude: number;
      longitude: number;
    }>();

    filteredVisits.forEach((v, idx) => {
      if (!map.has(v.patientName)) {
        // Find matching patient in patients list for accurate lat/lng
        const matchedPat = patients.find(p =>
          `${p.firstName} ${p.lastName}`.toLowerCase() === v.patientName.toLowerCase() ||
          p.mrn === v.patientMrn
        );

        const lat = (v as any).latitude || matchedPat?.address?.latitude || (32.7767 + (idx % 5) * 0.02 - 0.04);
        const lng = (v as any).longitude || matchedPat?.address?.longitude || (-96.7970 + (idx % 4) * 0.02 - 0.03);

        map.set(v.patientName, {
          patientName: v.patientName,
          patientMrn: v.patientMrn || 'MRN-78210',
          visits: [],
          address: v.address || matchedPat?.address?.street || 'Dallas, TX',
          latitude: lat,
          longitude: lng
        });
      }
      map.get(v.patientName)!.visits.push(v);
    });

    return map;
  }, [filteredVisits, patients]);

  const displayedPatients = useMemo(() => Array.from(patientMap.values()), [patientMap]);

  useEffect(() => {
    if (displayedPatients.length > 0 && (!selectedPatientKey || !patientMap.has(selectedPatientKey))) {
      setSelectedPatientKey(displayedPatients[0].patientName);
    }
  }, [displayedPatients, selectedPatientKey, patientMap]);

  // Filter patients by search term
  const filteredPatients = useMemo(() => {
    return displayedPatients.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        p.patientName.toLowerCase().includes(term) ||
        p.address.toLowerCase().includes(term) ||
        p.visits.some(v => v.employeeName.toLowerCase().includes(term) || v.visitType.toLowerCase().includes(term));
      return matchesSearch;
    });
  }, [displayedPatients, searchTerm]);

  const activePatient = patientMap.get(selectedPatientKey) || displayedPatients[0];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [32.7767, -96.7970],
        zoom: 11,
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

    if (displayedPatients.length === 0) return;

    const allCoordinates: [number, number][] = [];

    // 1. Plot all patient residences
    displayedPatients.forEach(p => {
      const isSelected = p.patientName === selectedPatientKey;
      const lat = p.latitude;
      const lng = p.longitude;
      allCoordinates.push([lat, lng]);

      const hasCompleted = p.visits.some(v => v.status === 'completed' || v.evvStatus === 'verified');
      const hasInProgress = p.visits.some(v => v.status === 'in_progress');
      const markerColor = hasCompleted ? '#059669' : hasInProgress ? '#2563eb' : '#e11d48';

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
        iconSize: [110, 44],
        iconAnchor: [55, 44]
      });

      const marker = L.marker([lat, lng], { icon: patientIcon }).addTo(layerGroup);

      marker.on('click', () => {
        setSelectedPatientKey(p.patientName);
        if (p.visits[0]) {
          setSelectedVisit(p.visits[0]);
          setIsDetailOpen(true);
        }
      });

      marker.bindPopup(`
        <div style="padding: 6px; font-family: inherit;">
          <div style="font-size: 10px; font-weight: 800; color: #e11d48; text-transform: uppercase;">Patient Residence</div>
          <div style="font-weight: 900; font-size: 13px; color: #0f172a; margin-top: 2px;">${p.patientName} (MRN: ${p.patientMrn})</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${p.address}</div>
          <div style="font-size: 11px; color: #10b981; font-weight: 700; margin-top: 4px;">${p.visits.length} scheduled visits</div>
        </div>
      `);

      // 2. If selected, add authorized EVV geofence radius circle (120 meters)
      if (isSelected) {
        L.circle([lat, lng], {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.15,
          radius: 140,
          weight: 2,
          dashArray: '4, 4'
        }).addTo(layerGroup);

        // Add inbound clinician vehicle pin
        const firstVisit = p.visits[0];
        if (firstVisit) {
          const clinicianLat = lat + 0.008;
          const clinicianLng = lng - 0.007;
          allCoordinates.push([clinicianLat, clinicianLng]);

          const vehicleIcon = L.divIcon({
            className: 'custom-vehicle-marker',
            html: `
              <div style="background-color: #0f172a; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px;">
                <span>🚗</span>
                <span>${firstVisit.employeeName}</span>
              </div>
            `,
            iconSize: [120, 30],
            iconAnchor: [60, 15]
          });

          L.marker([clinicianLat, clinicianLng], { icon: vehicleIcon }).addTo(layerGroup);

          // Route dashed line connecting clinician to patient residence
          L.polyline([[clinicianLat, clinicianLng], [lat, lng]], {
            color: '#2563eb',
            weight: 3,
            opacity: 0.8,
            dashArray: '6, 8'
          }).addTo(layerGroup);
        }
      }
    });

    if (allCoordinates.length > 0) {
      const bounds = L.latLngBounds(allCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [displayedPatients, selectedPatientKey, theme]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[720px] rounded-3xl overflow-hidden glass-panel border border-pearl-200 dark:border-charcoal-700 p-2.5">
      {/* Left Patient Roster Panel */}
      <div className="w-full lg:w-[360px] shrink-0 flex flex-col bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        {/* Panel Header */}
        <div className="p-4 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Patient Residences
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                EVV Geofences & Active Scheduled Stops
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

          {/* Service Filter */}
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
            const hasCompleted = p.visits.some(v => v.status === 'completed' || v.evvStatus === 'verified');
            const hasInProgress = p.visits.some(v => v.status === 'in_progress');

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
                <div className="min-w-0">
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                    {p.patientName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                    <MapPin size={10} className="text-slate-400 shrink-0" />
                    <span>{p.address}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    MRN: {p.patientMrn} • {p.visits.length} scheduled visits
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    hasCompleted
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : hasInProgress
                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      hasCompleted ? 'bg-emerald-500' : hasInProgress ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    {hasCompleted ? 'EVV Done' : hasInProgress ? 'In Progress' : 'Due'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Map Canvas */}
      <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-pearl-200 dark:border-charcoal-700 relative">
        {/* Top Schedule Day Filter Pills */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 bg-white/90 dark:bg-charcoal-850/90 backdrop-blur-md p-1.5 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-md text-xs font-bold">
          <span className="text-[11px] text-slate-500 px-2 flex items-center gap-1">
            <Calendar size={13} className="text-rose-600" />
            <span>Schedule Filter:</span>
          </span>
          {[
            { id: 'all', label: 'All Weekly Visits' },
            { id: '1', label: 'Mon Nov 2' },
            { id: '2', label: 'Tue Nov 3 (Today)' },
            { id: '3', label: 'Wed Nov 4' },
            { id: '4', label: 'Thu Nov 5' },
            { id: '5', label: 'Fri Nov 6' },
          ].map(day => (
            <button
              key={day.id}
              onClick={() => setSelectedDayFilter(day.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                selectedDayFilter === day.id
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>

        {/* Selected Patient Floating Pill */}
        {activePatient && (
          <div className="absolute bottom-4 left-4 z-20 max-w-sm bg-white/95 dark:bg-charcoal-850/95 backdrop-blur-md p-3.5 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xl space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600">
                  Authorized EVV Geofence Active (140m Radius)
                </div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {activePatient.patientName}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {activePatient.visits.length} Visits
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin size={13} className="text-rose-600 shrink-0" />
              <span className="truncate">{activePatient.address}</span>
            </div>

            <div className="space-y-1 pt-1 border-t border-pearl-200 dark:border-charcoal-700 max-h-32 overflow-y-auto">
              {activePatient.visits.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVisit(v);
                    setIsDetailOpen(true);
                  }}
                  className="flex items-center justify-between text-[11px] p-1.5 rounded-lg hover:bg-pearl-100 dark:hover:bg-charcoal-750 cursor-pointer"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                    {v.timeSlot} • {v.employeeName}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                    v.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : v.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaflet Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />
      </div>

      {/* Visit Details Modal */}
      {selectedVisit && (
        <VisitDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          visit={selectedVisit}
          onStatusChange={() => {}}
        />
      )}
    </div>
  );
};
