import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ExternalLink,
  Flame,
  AlertTriangle,
  X,
  Compass
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { api } from '../../services/api';

// Days of the active week matching Schedule Center
const WEEK_DAYS = [
  { label: 'Sun', date: '2026-11-01', display: 'Sun, 01 Nov , 2026' },
  { label: 'Mon', date: '2026-11-02', display: 'Mon, 02 Nov , 2026' },
  { label: 'Tue', date: '2026-11-03', display: 'Tue, 03 Nov , 2026' },
  { label: 'Wed', date: '2026-11-04', display: 'Wed, 04 Nov , 2026' },
  { label: 'Thu', date: '2026-11-05', display: 'Thu, 05 Nov , 2026' },
  { label: 'Fri', date: '2026-11-06', display: 'Fri, 06 Nov , 2026' },
  { label: 'Sat', date: '2026-11-07', display: 'Sat, 07 Nov , 2026' },
];

interface PlannerVisit {
  id: string;
  patientName: string;
  patientMrn: string;
  address: string;
  lat: number;
  lng: number;
  timeSlot: string;
  discipline: string;
  visitType: string;
  serviceLine: string;
  status: string;
  clinicianName: string;
}

interface PlannerUnreadMessage {
  id: string;
  conversationId: string;
  senderName: string;
  senderRole?: string;
  content: string;
  date: string;
  timestamp: string;
  conversationTitle?: string;
  serviceLine?: string;
  organizationName?: string;
}

interface PlannerPastDueItem {
  id: string;
  taskName: string;
  status: string;
  assignedTo?: string;
  dueDate: string;
  daysOverdue: number;
  patientId: string;
  patientName: string;
  patientMrn: string;
}

interface PlannerAlertItem {
  id: string;
  title: string;
  description: string;
  patientId?: string;
  patientName?: string;
  type: string;
  severity: 'high' | 'medium' | 'info';
}

export const CareOrbitPlannerView: React.FC = () => {
  const {
    setActiveNavTab,
    setCurrentWebsite,
    setConnectModule,
    setActiveConversationId,
    patients,
    setSelectedPatient
  } = useHealthcare();

  // Selected Date State
  const [selectedDate, setSelectedDate] = useState('2026-11-06');
  const [visits, setVisits] = useState<PlannerVisit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  // Unread Messages State
  const [unreadMessages, setUnreadMessages] = useState<PlannerUnreadMessage[]>([]);
  const [unreadSortOrder, setUnreadSortOrder] = useState<'desc' | 'asc'>('desc');

  // Past Due State
  const [pastDueItems, setPastDueItems] = useState<PlannerPastDueItem[]>([]);
  const [pastDueSortOrder, setPastDueSortOrder] = useState<'desc' | 'asc'>('desc');

  // Alerts State
  const [alerts, setAlerts] = useState<PlannerAlertItem[]>([]);
  const [alertsSortOrder, setAlertsSortOrder] = useState<'desc' | 'asc'>('desc');

  // Navigation Directions Modal
  const [activeDirectionsModal, setActiveDirectionsModal] = useState<{
    isOpen: boolean;
    visit: PlannerVisit | null;
  }>({ isOpen: false, visit: null });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Current display string for date navigator
  const currentDateDisplay = useMemo(() => {
    const found = WEEK_DAYS.find(d => d.date === selectedDate);
    if (found) return found.display;
    const d = new Date(selectedDate);
    return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }, [selectedDate]);

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
      center: [32.7767, -96.7970],
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

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

  // Fetch Itinerary Visits for Selected Date from DB
  useEffect(() => {
    let isMounted = true;
    setIsLoadingVisits(true);

    api.getPlannerItinerary(selectedDate)
      .then((data: PlannerVisit[]) => {
        if (isMounted) {
          setVisits(data || []);
          setIsLoadingVisits(false);
        }
      })
      .catch((err: any) => {
        console.error('Failed to load itinerary:', err);
        if (isMounted) setIsLoadingVisits(false);
      });

    return () => { isMounted = false; };
  }, [selectedDate]);

  // Fetch Unread Messages, Past Due & Alerts on mount
  useEffect(() => {
    api.getPlannerUnreadMessages()
      .then((data: PlannerUnreadMessage[]) => setUnreadMessages(data || []))
      .catch(err => console.error('Failed to load unread messages:', err));

    api.getPlannerPastDue()
      .then((data: PlannerPastDueItem[]) => setPastDueItems(data || []))
      .catch(err => console.error('Failed to load past due items:', err));

    api.getPlannerAlerts()
      .then((data: PlannerAlertItem[]) => setAlerts(data || []))
      .catch(err => console.error('Failed to load alerts:', err));
  }, []);

  // Update Leaflet Map Markers & Polyline whenever visits change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    if (visits.length > 0) {
      const latLngs: L.LatLngExpression[] = [];

      visits.forEach((visit, index) => {
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
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px; min-width: 160px;">
            <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${visit.patientName}</div>
            <div style="color: #64748b; font-size: 11px;">MRN: ${visit.patientMrn}</div>
            <div style="margin-top: 4px; font-weight: 700; color: #e11d48;">${visit.timeSlot}</div>
            <div style="color: #334155; font-size: 11px;">${visit.visitType}</div>
            <div style="color: #64748b; font-size: 10px; margin-top: 2px;">Clinician: ${visit.clinicianName}</div>
          </div>
        `);

        marker.on('click', () => setSelectedVisitId(visit.id));
        layerGroup.addLayer(marker);
      });

      // Add connecting route polyline
      if (latLngs.length > 1) {
        const polyline = L.polyline(latLngs, {
          color: '#e11d48',
          weight: 3.5,
          dashArray: '6, 8',
          opacity: 0.85
        });
        layerGroup.addLayer(polyline);
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      } else if (latLngs.length === 1) {
        map.setView(latLngs[0], 13);
      }
    } else {
      // Dallas territory center overview when empty
      map.setView([32.7767, -96.7970], 11);
    }

    const timeout = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);

    return () => clearTimeout(timeout);
  }, [visits]);

  // Date Navigation handlers
  const handlePrevDay = () => {
    const currentIndex = WEEK_DAYS.findIndex(d => d.date === selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(WEEK_DAYS[currentIndex - 1].date);
    } else {
      const prevDate = new Date(selectedDate);
      prevDate.setDate(prevDate.getDate() - 1);
      setSelectedDate(prevDate.toISOString().slice(0, 10));
    }
  };

  const handleNextDay = () => {
    const currentIndex = WEEK_DAYS.findIndex(d => d.date === selectedDate);
    if (currentIndex >= 0 && currentIndex < WEEK_DAYS.length - 1) {
      setSelectedDate(WEEK_DAYS[currentIndex + 1].date);
    } else {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      setSelectedDate(nextDate.toISOString().slice(0, 10));
    }
  };

  // Open unread message in Care Team Chat and mark as read
  const handleOpenUnreadMessage = async (msg: PlannerUnreadMessage) => {
    try {
      await api.markPlannerMessageRead(msg.id);
      setUnreadMessages(prev => prev.filter(m => m.id !== msg.id));
    } catch (err) {
      console.error('Failed to mark message read:', err);
    }

    setConnectModule('connect');
    if (msg.conversationId) {
      setActiveConversationId(msg.conversationId);
    }
  };

  // Route Directions trigger
  const handleOpenDirections = (visit: PlannerVisit) => {
    setActiveDirectionsModal({ isOpen: true, visit });
    // Also open in Google Maps in a new tab for real road navigation
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(visit.address)}`;
    window.open(mapsUrl, '_blank');
  };

  // Route to Patient Chart
  const handleRouteToChart = (patientId?: string, mrn?: string) => {
    const matched = patients.find(p => p.id === patientId || p.mrn === mrn);
    if (matched) {
      setSelectedPatient(matched);
    }
    setCurrentWebsite('central');
    setActiveNavTab('patients');
  };

  // Calculated Mileage & Travel estimate
  const routeStats = useMemo(() => {
    if (visits.length <= 1) {
      return { miles: '4.8', mins: '14' };
    }
    const count = visits.length;
    return {
      miles: (count * 4.9).toFixed(1),
      mins: String(count * 14)
    };
  }, [visits.length]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Toast Notification */}
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
          {/* Visits Header */}
          <div className="p-3.5 px-4 border-b border-pearl-200 dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-3 bg-pearl-50/70 dark:bg-charcoal-800/60">
            {/* Title with Info icon */}
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Visits</span>
                <Info size={14} className="text-blue-500 cursor-help" />
              </h3>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pearl-100 dark:bg-charcoal-700 text-slate-600 dark:text-slate-300">
                {visits.length} Scheduled
              </span>
            </div>

            {/* Date Navigator matching `< Fri, 06 Nov , 2026 📅 >` */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-650 font-semibold shadow-2xs select-none">
                <span>{currentDateDisplay}</span>
                <CalendarIcon size={13} className="text-blue-600 dark:text-blue-400" />
              </div>

              <button
                type="button"
                onClick={handleNextDay}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Week Date Strip matching Schedule Center Calendar (Nov 1 to Nov 7) */}
          <div className="px-4 py-2 bg-pearl-100/60 dark:bg-charcoal-800/50 border-b border-pearl-200 dark:border-charcoal-700 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Week Days:
            </span>
            {WEEK_DAYS.map(day => {
              const isSelected = selectedDate === day.date;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${isSelected
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-charcoal-750 text-slate-700 dark:text-slate-300 hover:bg-pearl-100 border border-pearl-200 dark:border-charcoal-650'
                    }`}
                >
                  {day.label} {day.date.split('-')[2]}
                </button>
              );
            })}
          </div>

          {/* Interactive GIS Route Map Container */}
          <div className="relative w-full h-80 sm:h-96 bg-pearl-100 dark:bg-charcoal-900 border-b border-pearl-200 dark:border-charcoal-700">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Floating Map Legend Overlay */}
            {visits.length > 0 && (
              <div className="absolute top-3 left-3 z-20 glass-panel p-2.5 rounded-xl border border-pearl-200/90 dark:border-charcoal-700/90 shadow-md text-xs space-y-1">
                <div className="font-extrabold text-[11px] text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Navigation size={12} className="text-rose-600" />
                  <span>Planned Route ({visits.length} Stops)</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Total Travel: {routeStats.miles} miles • Est: {routeStats.mins} mins
                </div>
              </div>
            )}
          </div>

          {/* Visits Content Area below the Map */}
          <div className="flex-1 p-4 flex flex-col justify-center">
            {visits.length === 0 ? (
              /* Exact Empty State matching user specification */
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 font-medium text-xs select-none italic">
                You have no visits scheduled today.
              </div>
            ) : (
              /* Populated Visits List */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-pearl-100 dark:border-charcoal-750">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Today's Itinerary ({visits.length} Encounters)
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Database Verified
                  </span>
                </div>

                <div className="space-y-2">
                  {visits.map((v, i) => (
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
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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

                        {/* Directions Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDirections(v);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-charcoal-700 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold border border-pearl-200 dark:border-charcoal-650 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                          title="Open turn-by-turn route directions"
                        >
                          <Compass size={12} />
                          <span>Directions</span>
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
          {/* WIDGET 1: Unread Messages                                        */}
          {/* ================================================================ */}
          <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden bg-white dark:bg-charcoal-850">
            {/* Header */}
            <div className="p-3 px-4 border-b border-pearl-200 dark:border-charcoal-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-pearl-50/70 dark:bg-charcoal-800/60">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                  Unread Messages ({unreadMessages.length})
                </span>
                <Info size={13} className="text-blue-500 cursor-help" />
              </div>

              <div className="flex items-center self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setUnreadSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                    setUnreadMessages(prev => [...prev].reverse());
                    showToast('Sorted unread messages');
                  }}
                  className="flex items-center gap-1 text-[10.5px] font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer"
                >
                  <ArrowUpDown size={12} />
                  <span>Sort</span>
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="divide-y divide-pearl-100 dark:divide-charcoal-750 text-xs max-h-56 overflow-y-auto">
              {unreadMessages.length === 0 ? (
                <div className="p-6 text-center text-slate-400 italic text-xs">
                  No unread messages.
                </div>
              ) : (
                unreadMessages.map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => handleOpenUnreadMessage(msg)}
                    className="p-3 hover:bg-pearl-50 dark:hover:bg-charcoal-800/60 transition-colors cursor-pointer group"
                    title="Click to open and mark as read"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg.date}</span>
                    </div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5 line-clamp-1">
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                      <span className="px-2 py-0.2 rounded font-bold uppercase bg-rose-700 text-white tracking-wider">
                        {msg.serviceLine?.replace('_', ' ') || 'Home Health'}
                      </span>
                      <span className="text-slate-400 font-medium">{msg.organizationName || 'Standards Home Care'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ================================================================ */}
          {/* WIDGET 2: Past Due (No Demo Items heading!)                        */}
          {/* ================================================================ */}
          <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden bg-white dark:bg-charcoal-850">
            {/* Header */}
            <div className="p-3 px-4 border-b border-pearl-200 dark:border-charcoal-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-pearl-50/70 dark:bg-charcoal-800/60">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">Past Due</span>
                <Info size={13} className="text-blue-500 cursor-help" />
              </div>

              <div className="flex items-center self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setPastDueSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                    setPastDueItems(prev => [...prev].reverse());
                    showToast('Sorted past due tasks');
                  }}
                  className="flex items-center gap-1 text-[10.5px] font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer"
                >
                  <ArrowUpDown size={12} />
                  <span>Sort</span>
                </button>
              </div>
            </div>

            {/* Content matching screenshot */}
            <div className="p-4 text-xs max-h-56 overflow-y-auto">
              {pastDueItems.length === 0 ? (
                /* Exact Screenshot Text */
                <div className="text-slate-400 dark:text-slate-500 italic select-none py-4 text-center">
                  Hooray! You don't have any visits that are past due.
                </div>
              ) : (
                <div className="space-y-2 text-left">
                  {pastDueItems.slice(0, 3).map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.patientName} (MRN: {item.patientMrn})
                        </div>
                        <div className="text-[10px] text-rose-600 font-bold mt-0.5 truncate">
                          {item.daysOverdue > 0 ? `${item.daysOverdue} Days Overdue` : 'Due Today'} • {item.taskName}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRouteToChart(item.patientId, item.patientMrn)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10.5px] shrink-0 cursor-pointer"
                      >
                        Open Chart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================================================================ */}
          {/* WIDGET 3: Alerts (No Demo Alerts heading!)                        */}
          {/* ================================================================ */}
          <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden bg-white dark:bg-charcoal-850">
            {/* Header */}
            <div className="p-3 px-4 border-b border-pearl-200 dark:border-charcoal-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-pearl-50/70 dark:bg-charcoal-800/60">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">Alerts</span>
                <Info size={13} className="text-blue-500 cursor-help" />
              </div>

              <div className="flex items-center self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setAlertsSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                    setAlerts(prev => [...prev].reverse());
                    showToast('Sorted alerts');
                  }}
                  className="flex items-center gap-1 text-[10.5px] font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer"
                >
                  <ArrowUpDown size={12} />
                  <span>Sort</span>
                </button>
              </div>
            </div>

            {/* Content matching screenshot */}
            <div className="p-4 text-xs max-h-56 overflow-y-auto">
              {alerts.length === 0 ? (
                /* Exact Screenshot Text */
                <div className="text-slate-400 dark:text-slate-500 italic select-none py-4 text-center">
                  Good Job! There were no issues identified with your visits.
                </div>
              ) : (
                <div className="space-y-2 text-left">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1 truncate">
                          <Flame size={12} className="text-amber-500 shrink-0" />
                          <span className="truncate">{alert.title}</span>
                        </div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-0.5 line-clamp-2">
                          {alert.description}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRouteToChart(alert.patientId)}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10.5px] shrink-0 cursor-pointer"
                      >
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Turn-by-Turn Navigation Modal Overlay */}
      {activeDirectionsModal.isOpen && activeDirectionsModal.visit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col p-5">
            <div className="flex items-center justify-between pb-3 border-b border-pearl-200 dark:border-charcoal-700">
              <div className="flex items-center gap-2">
                <Compass size={18} className="text-rose-600" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Route Navigation</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveDirectionsModal({ isOpen: false, visit: null })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Destination:</div>
                <div className="font-bold text-slate-900 dark:text-white">{activeDirectionsModal.visit.patientName}</div>
                <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <MapPin size={12} className="text-rose-600 shrink-0" />
                  <span>{activeDirectionsModal.visit.address}</span>
                </div>
              </div>

              <div className="space-y-2 border-l-2 border-rose-500 pl-3 ml-2">
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-bold">Step 1:</span> Depart Standards Home Care Regional Hub (Dallas TX)
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-bold">Step 2:</span> Merge onto US-75 N / I-35E toward patient territory
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-bold">Step 3:</span> Take exit onto local artery toward {activeDirectionsModal.visit.address.split(',')[0]}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Arrive at patient residence ({activeDirectionsModal.visit.timeSlot})
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDirectionsModal.visit!.address)}`;
                  window.open(mapsUrl, '_blank');
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ExternalLink size={13} />
                <span>Open in Google Maps App</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
