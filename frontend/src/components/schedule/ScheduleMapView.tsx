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
  Eye
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { EmployeeClinician, EmployeeVisit } from '../../types';
import { VisitDetailModal } from './VisitDetailModal';

export const ScheduleMapView: React.FC = () => {
  const { clinicians, employeeVisits, theme } = useHealthcare();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedClinicianId, setSelectedClinicianId] = useState<string>('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all'); // 'all', '1', '2', '3', '4', '5'
  const [selectedVisit, setSelectedVisit] = useState<EmployeeVisit | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Auto-select first clinician if none selected
  useEffect(() => {
    if (clinicians.length > 0 && (!selectedClinicianId || !clinicians.some(c => c.id === selectedClinicianId))) {
      setSelectedClinicianId(clinicians[0].id);
    }
  }, [clinicians, selectedClinicianId]);

  // Filter clinicians
  const filteredClinicians = useMemo(() => {
    return clinicians.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.credentials.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesService =
        selectedService === 'all' || (c.serviceLines && c.serviceLines.includes(selectedService as any));
      return matchesSearch && matchesService;
    });
  }, [clinicians, searchTerm, selectedService]);

  const selectedClinician = useMemo(() => {
    return clinicians.find(c => c.id === selectedClinicianId) || filteredClinicians[0] || clinicians[0];
  }, [clinicians, selectedClinicianId, filteredClinicians]);

  // Visits for selected clinician matching day filter
  const clinicianFilteredVisits = useMemo(() => {
    if (!selectedClinician) return [];
    return employeeVisits.filter(v => {
      if (v.employeeId !== selectedClinician.id) return false;
      if (selectedDayFilter === 'all') return true;
      return String(v.dayOfWeek) === selectedDayFilter;
    });
  }, [employeeVisits, selectedClinician, selectedDayFilter]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Dallas-Fort Worth metro area coordinates
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

  // Update Markers & Routes when selected clinician or visits change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    if (!selectedClinician) return;

    const clinLat = (selectedClinician as any)?.latitude || 32.7767;
    const clinLng = (selectedClinician as any)?.longitude || -96.7970;
    const clinAddr = (selectedClinician as any)?.currentAddress || selectedClinician.territory || 'Dallas TX';
    const clinStatus = (selectedClinician as any)?.workStatus || 'Available';

    const routeCoordinates: [number, number][] = [[clinLat, clinLng]];

    // 1. Clinician Live Beacon Marker
    const clinicianIcon = L.divIcon({
      className: 'custom-clinician-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: rgba(225, 29, 72, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 36px; height: 36px; border-radius: 9999px; background: linear-gradient(135deg, #e11d48, #be123c); color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); border: 2.5px solid white;">
            ${selectedClinician?.credentials || 'RN'}
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const clinicianMarker = L.marker([clinLat, clinLng], { icon: clinicianIcon }).addTo(layerGroup);
    clinicianMarker.bindPopup(`
      <div style="padding: 6px; font-family: inherit;">
        <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${selectedClinician?.name}</div>
        <div style="font-size: 11px; color: #e11d48; font-weight: 700; margin-top: 2px;">Base Location: ${clinAddr}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Status: <b style="color: #10b981;">${clinStatus}</b></div>
        <div style="font-size: 10px; color: #475569; margin-top: 2px;">Phone: ${selectedClinician?.phone || '(214) 555-0100'}</div>
      </div>
    `);

    // 2. Patient Stop Markers from Real Visits
    clinicianFilteredVisits.forEach((visit, index) => {
      const stopLat = (visit as any).latitude || (clinLat + (index + 1) * 0.015 * (index % 2 === 0 ? 1 : -1));
      const stopLng = (visit as any).longitude || (clinLng + (index + 1) * 0.015 * (index % 2 === 0 ? -1 : 1));

      routeCoordinates.push([stopLat, stopLng]);

      const isCompleted = visit.status === 'completed' || visit.evvStatus === 'verified';
      const isInProgress = visit.status === 'in_progress';
      const badgeBg = isCompleted ? '#059669' : isInProgress ? '#2563eb' : '#e11d48';

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background-color: ${badgeBg}; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); white-space: nowrap; border: 2px solid white; display: flex; align-items: center; gap: 4px;">
              <span>#${index + 1}</span>
              <span>${visit.timeSlot}</span>
              ${isCompleted ? '✓' : ''}
            </div>
            <div style="width: 2px; height: 8px; background-color: #334155;"></div>
            <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #334155;"></div>
          </div>
        `,
        iconSize: [90, 42],
        iconAnchor: [45, 42]
      });

      const marker = L.marker([stopLat, stopLng], { icon: stopIcon }).addTo(layerGroup);
      marker.on('click', () => {
        setSelectedVisit(visit);
        setIsDetailOpen(true);
      });
      marker.bindPopup(`
        <div style="padding: 6px; font-family: inherit;">
          <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">
            Stop #${index + 1} • ${visit.timeSlot} (${visit.date})
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-top: 2px;">
            ${visit.patientName}
          </div>
          <div style="font-size: 11px; color: #e11d48; font-weight: 600;">${visit.visitType}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${visit.address || 'Dallas TX'}</div>
          <div style="font-size: 11px; font-weight: 700; color: ${badgeBg}; margin-top: 2px;">
            Status: ${visit.status.toUpperCase()} ${isCompleted ? '(EVV Verified)' : ''}
          </div>
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
    if (routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    }
  }, [selectedClinician, clinicianFilteredVisits, theme]);

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
                Live GPS Dispatch • Dallas Metro
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
            const isSelected = c.id === selectedClinician?.id;
            const clinicianVisits = employeeVisits.filter(v => v.employeeId === c.id);
            const status = (c as any).workStatus || (clinicianVisits.length > 0 ? 'On Visit' : 'Available');

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
                      {c.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone size={10} /> {c.phone || '(214) 555-0100'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    status === 'On Visit'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      status === 'On Visit' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />
                    {status}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    {clinicianVisits.length} visits this week
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Map Canvas & Route Timeline */}
      <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-pearl-200 dark:border-charcoal-700 relative">
        {/* Top Controls Overlay: Day Filter Pills */}
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

        {/* Floating Clinician Summary Pill */}
        {selectedClinician && (
          <div className="absolute bottom-4 left-4 z-20 max-w-sm bg-white/95 dark:bg-charcoal-850/95 backdrop-blur-md p-3.5 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xl space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-rose-600">
                  Active Dispatch Route
                </div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {selectedClinician.name}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {clinicianFilteredVisits.length} Stops Plotted
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin size={13} className="text-rose-600 shrink-0" />
              <span className="truncate">
                Base: {(selectedClinician as any)?.currentAddress || selectedClinician.territory || 'Dallas TX'}
              </span>
            </div>

            {clinicianFilteredVisits.length === 0 ? (
              <div className="text-[11px] text-slate-400 italic">
                No visits scheduled for selected filter. Try "All Weekly Visits".
              </div>
            ) : (
              <div className="space-y-1 pt-1 border-t border-pearl-200 dark:border-charcoal-700 max-h-32 overflow-y-auto">
                {clinicianFilteredVisits.map((v, i) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      setSelectedVisit(v);
                      setIsDetailOpen(true);
                    }}
                    className="flex items-center justify-between text-[11px] p-1.5 rounded-lg hover:bg-pearl-100 dark:hover:bg-charcoal-750 cursor-pointer"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      #{i + 1} {v.patientName} ({v.timeSlot})
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
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
            )}
          </div>
        )}

        {/* Leaflet Map Canvas */}
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
