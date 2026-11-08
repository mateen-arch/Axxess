import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowUpDown,
  CheckCircle2,
  MapPin,
  Navigation,
  Flame
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

const TODAY_VISITS = [
  {
    id: 'plan-v1',
    patientName: 'Abuissa, Heather',
    patientMrn: '1061',
    address: '33 James Signet Way, Stoughton, MA',
    lat: 42.1248,
    lng: -71.1017,
    timeSlot: '09:00 AM - 10:00 AM',
    discipline: 'Nursing (RN)',
    visitType: 'Skilled Nursing Assessment',
    serviceLine: 'home_health',
    status: 'scheduled',
    clinicianName: 'Melissa Sweeney, RN'
  },
  {
    id: 'plan-v2',
    patientName: 'Anis, Marie V.',
    patientMrn: '1035',
    address: '142 Elmwood Ave, Boston, MA',
    lat: 42.3398,
    lng: -71.0891,
    timeSlot: '11:30 AM - 12:30 PM',
    discipline: 'Nursing (RN)',
    visitType: 'Cardiac Rehab & Med Recon',
    serviceLine: 'home_health',
    status: 'scheduled',
    clinicianName: 'Nathalie Bernadeau, RN'
  },
  {
    id: 'plan-v3',
    patientName: 'Antoine, Louis',
    patientMrn: '1002',
    address: '89 Commonwealth Ave, Boston, MA',
    lat: 42.3520,
    lng: -71.0740,
    timeSlot: '02:00 PM - 03:00 PM',
    discipline: 'Physical Therapy (PT)',
    visitType: 'COPD Oxygen Mobility Eval',
    serviceLine: 'home_health',
    status: 'scheduled',
    clinicianName: 'David Lee, PT'
  }
];

export const AxxessPlannerView: React.FC = () => {
  const {
    setActiveNavTab,
    setConnectModule,
    setActiveConversationId
  } = useHealthcare();

  // Date Navigation
  const [currentDate] = useState('Fri, 06 Nov , 2026');

  // Map & Visits View Controls
  const [showEmptyVisits, setShowEmptyVisits] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  // Widget States (Allow toggling empty state for demonstration)
  const [showEmptyPastDue, setShowEmptyPastDue] = useState(true);
  const [showEmptyAlerts, setShowEmptyAlerts] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Map Container & Instance
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [42.25, -71.09],
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    // Standard OpenStreetMap Tile Layer (Zero API keys, completely free & reliable)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    if (!showEmptyVisits) {
      const latLngs: L.LatLngExpression[] = [];

      TODAY_VISITS.forEach((visit, index) => {
        const latLng: [number, number] = [visit.lat, visit.lng];
        latLngs.push(latLng);

        // Custom Numbered Pin
        const markerIcon = L.divIcon({
          className: 'custom-pin',
          html: `
            <div style="
              background: linear-gradient(135deg, #e11d48, #be123c);
              color: white;
              font-size: 11px;
              font-weight: 800;
              width: 28px;
              height: 28px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 10px rgba(225, 29, 72, 0.4);
              border: 2px solid white;
            ">
              <span style="transform: rotate(45deg);">${index + 1}</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 28]
        });

        const marker = L.marker(latLng, { icon: markerIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px; min-width: 150px;">
            <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${visit.patientName}</div>
            <div style="color: #64748b; font-size: 11px;">MRN: ${visit.patientMrn}</div>
            <div style="margin-top: 4px; font-weight: 700; color: #e11d48;">${visit.timeSlot}</div>
            <div style="color: #334155; font-size: 11px;">${visit.visitType}</div>
            <div style="color: #64748b; font-size: 10px; margin-top: 2px;">${visit.clinicianName}</div>
          </div>
        `);

        marker.on('click', () => setSelectedVisitId(visit.id));
        layerGroup.addLayer(marker);
      });

      // Add connecting dashed route line
      if (latLngs.length > 1) {
        const polyline = L.polyline(latLngs, {
          color: '#e11d48',
          weight: 3.5,
          dashArray: '6, 8',
          opacity: 0.85
        });
        layerGroup.addLayer(polyline);
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }
    } else {
      // Reset to default US overview when empty
      map.setView([38.0, -97.0], 4);
    }

    const timeout = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);

    return () => clearTimeout(timeout);
  }, [showEmptyVisits]);

  const handleOpenConnectMessage = (conversationId: string) => {
    setConnectModule('connect');
    setActiveConversationId(conversationId);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-charcoal-800 text-white px-4 py-2.5 rounded-xl shadow-xl border border-pearl-700 dark:border-charcoal-600 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TWO-COLUMN GRID: LEFT VISITS PANEL vs RIGHT WIDGETS STACK             */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ================================================================== */}
        {/* LEFT COLUMN: VISITS PANEL (62% width on desktop)                   */}
        {/* ================================================================== */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden bg-white dark:bg-charcoal-850 min-h-[640px]">
          {/* Visits Header matching media_1793910433084_38d1926a */}
          <div className="p-3.5 px-4 border-b border-pearl-200 dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-3 bg-pearl-50/70 dark:bg-charcoal-800/60">
            {/* Title with Info icon matching screenshot */}
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Visits</span>
                <Info size={14} className="text-blue-500 cursor-help" />
              </h3>

              {/* View toggle badge (Demo toggle between populated & empty screenshot state) */}
              <button
                type="button"
                onClick={() => setShowEmptyVisits(!showEmptyVisits)}
                className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pearl-100 dark:bg-charcoal-700 hover:bg-rose-50 text-slate-600 dark:text-slate-300 hover:text-rose-600 border border-pearl-200 dark:border-charcoal-650 transition-colors cursor-pointer"
                title="Toggle between scheduled visits and empty state"
              >
                {showEmptyVisits ? 'Show Today\'s Visits' : 'Show Empty State'}
              </button>
            </div>

            {/* Date Navigator matching `< Fri, 06 Nov , 2026 📅 >` */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={() => showToast('Navigated to previous day')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-650 font-semibold shadow-2xs select-none">
                <span>{currentDate}</span>
                <CalendarIcon size={13} className="text-blue-600 dark:text-blue-400" />
              </div>

              <button
                type="button"
                onClick={() => showToast('Navigated to next day')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Interactive GIS Route Map Container */}
          <div className="relative w-full h-80 sm:h-96 bg-pearl-100 dark:bg-charcoal-900 border-b border-pearl-200 dark:border-charcoal-700">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Floating Map Legend Overlay */}
            {!showEmptyVisits && (
              <div className="absolute top-3 left-3 z-20 glass-panel p-2.5 rounded-xl border border-pearl-200/90 dark:border-charcoal-700/90 shadow-md text-xs space-y-1">
                <div className="font-extrabold text-[11px] text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Navigation size={12} className="text-rose-600" />
                  <span>Planned Route ({TODAY_VISITS.length} Stops)</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Total Travel: 14.8 miles • Est: 42 mins
                </div>
              </div>
            )}
          </div>

          {/* Visits Content Area below the Map */}
          <div className="flex-1 p-4 flex flex-col justify-center">
            {showEmptyVisits ? (
              /* Exact Empty State matching media_1793910433084_38d1926a */
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 font-medium text-xs select-none italic">
                You have no visits scheduled today.
              </div>
            ) : (
              /* Populated Visits List */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-pearl-100 dark:border-charcoal-750">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Today's Itinerary ({TODAY_VISITS.length} Encounters)
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    All Clinicians Confirmed
                  </span>
                </div>

                <div className="space-y-2">
                  {TODAY_VISITS.map((v, i) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVisitId(v.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${selectedVisitId === v.id
                          ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs'
                          : 'border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 hover:bg-pearl-100/60'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {v.patientName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">MRN: {v.patientMrn}</span>
                            <span className="px-2 py-0.2 rounded-md text-[9px] font-bold uppercase bg-pearl-100 dark:bg-charcoal-700 text-slate-600 dark:text-slate-300">
                              {v.discipline}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin size={11} className="text-slate-400 shrink-0" />
                            <span>{v.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 text-xs shrink-0">
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block text-xs">
                            {v.timeSlot}
                          </span>
                          <span className="text-[10px] text-slate-400">{v.clinicianName}</span>
                        </div>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            showToast(`Navigating to ${v.patientName}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-charcoal-700 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold border border-pearl-200 dark:border-charcoal-650 shadow-2xs transition-all cursor-pointer"
                        >
                          Directions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: 3 STACKED WIDGETS (38% width on desktop)             */}
        {/* ================================================================== */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 flex flex-col">
          {/* ================================================================ */}
          {/* WIDGET 1: Unread Messages (170)                                  */}
          {/* ================================================================ */}
          <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden bg-white dark:bg-charcoal-850">
            {/* Header matching media_1793910433084_38d1926a */}
            <div className="p-3 px-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/70 dark:bg-charcoal-800/60">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">Unread Messages (170)</span>
                <Info size={13} className="text-blue-500 cursor-help" />
              </div>

              <button
                type="button"
                onClick={() => showToast('Sorting unread messages')}
                className="flex items-center gap-1 text-[10.5px] font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer"
              >
                <ArrowUpDown size={12} />
                <span>Sort</span>
              </button>
            </div>

            {/* Messages List matching media_1793910433084_38d1926a */}
            <div className="divide-y divide-pearl-100 dark:divide-charcoal-750 text-xs">
              {/* Message 1: Carla Rania RN */}
              <div
                onClick={() => handleOpenConnectMessage('conv-care-abuissa')}
                className="p-3 hover:bg-pearl-50 dark:hover:bg-charcoal-800/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                    Carla Rania RN
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">11/05/26</span>
                </div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                  inservice canceled
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px]">
                  <span className="px-2 py-0.2 rounded font-bold uppercase bg-rose-700 text-white tracking-wider">
                    Home Health
                  </span>
                  <span className="text-slate-400 font-medium">Standards Home Care</span>
                </div>
              </div>

              {/* Message 2: Alexandria Nelson */}
              <div
                onClick={() => handleOpenConnectMessage('conv-triage-channel')}
                className="p-3 hover:bg-pearl-50 dark:hover:bg-charcoal-800/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                    Alexandria Nelson
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">11/02/26</span>
                </div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                  Scheduling Visits on Mobile
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px]">
                  <span className="px-2 py-0.2 rounded font-bold uppercase bg-slate-700 text-white tracking-wider">
                    Home Care
                  </span>
                  <span className="text-slate-400 font-medium">Standards Home Care</span>
                </div>
              </div>

              {/* Message 3: Melissa Sweeney RN */}
              <div
                onClick={() => handleOpenConnectMessage('conv-melissa-sweeney')}
                className="p-3 hover:bg-pearl-50 dark:hover:bg-charcoal-800/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                    Melissa Sweeney, RN
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">10/30/26</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5 truncate">
                  Wound measurement update: 2.1cm x 1.4cm granulation
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px]">
                  <span className="px-2 py-0.2 rounded font-bold uppercase bg-rose-700 text-white tracking-wider">
                    Home Health
                  </span>
                  <span className="text-slate-400 font-medium">Standards Home Care</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* WIDGET 2: Past Due                                               */}
          {/* ================================================================ */}
          <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden bg-white dark:bg-charcoal-850">
            {/* Header matching media_1793910433084_38d1926a */}
            <div className="p-3 px-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/70 dark:bg-charcoal-800/60">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">Past Due</span>
                <Info size={13} className="text-blue-500 cursor-help" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmptyPastDue(!showEmptyPastDue)}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-bold cursor-pointer"
                >
                  {showEmptyPastDue ? 'Demo Item' : 'Clear'}
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Sorting past due items')}
                  className="flex items-center gap-1 text-[10.5px] font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer"
                >
                  <ArrowUpDown size={12} />
                  <span>Sort</span>
                </button>
              </div>
            </div>

            {/* Content matching screenshot */}
            <div className="p-6 text-center text-xs">
              {showEmptyPastDue ? (
                /* Exact Screenshot Text */
                <div className="text-slate-400 dark:text-slate-500 italic select-none py-4">
                  Hooray! You don't have any visits that are past due.
                </div>
              ) : (
                <div className="space-y-2 text-left">
                  <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        Jeffrey Antoniotti (MRN 1193)
                      </div>
                      <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                        2 Days Overdue • Physical Assessment
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Task rescheduled')}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10.5px]"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================================================================ */}
          {/* WIDGET 3: Alerts                                                 */}
          {/* ================================================================ */}
          <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden bg-white dark:bg-charcoal-850">
            {/* Header matching media_1793910433084_38d1926a */}
            <div className="p-3 px-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/70 dark:bg-charcoal-800/60">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">Alerts</span>
                <Info size={13} className="text-blue-500 cursor-help" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmptyAlerts(!showEmptyAlerts)}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-bold cursor-pointer"
                >
                  {showEmptyAlerts ? 'Demo Alerts' : 'Clear'}
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Sorting alerts')}
                  className="flex items-center gap-1 text-[10.5px] font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer"
                >
                  <ArrowUpDown size={12} />
                  <span>Sort</span>
                </button>
              </div>
            </div>

            {/* Content matching screenshot */}
            <div className="p-6 text-center text-xs">
              {showEmptyAlerts ? (
                /* Exact Screenshot Text */
                <div className="text-slate-400 dark:text-slate-500 italic select-none py-4">
                  Good Job! There were no issues identified with your visits.
                </div>
              ) : (
                <div className="space-y-2 text-left">
                  <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                        <Flame size={12} className="text-amber-500" />
                        <span>60-Day Recert Window (Heather Abuissa)</span>
                      </div>
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                        6 days remaining in certification period.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveNavTab('patients')}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[10.5px]"
                    >
                      Open
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
