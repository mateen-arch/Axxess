import React, { useState } from 'react';
import {
  FileText,
  UserCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface OrdersManagementViewProps {
  onNavigate: (tab: string) => void;
}

export const OrdersManagementView: React.FC<OrdersManagementViewProps> = ({ onNavigate }) => {
  const { orders, faceToFaceEncounters } = useHealthcare();
  const [activeTab, setActiveTab] = useState<'orders' | 'f2f'>('orders');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(
    (o) =>
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.attendingPhysician.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredF2F = faceToFaceEncounters.filter(
    (f) =>
      f.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.physician.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-pearl-200 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-charcoal-700 dark:bg-charcoal-850/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ClipboardList size={18} />
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Orders & Face-to-Face Management
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Track physician orders, Plan of Care updates, and CMS-compliant Face-to-Face Encounter certifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('orders-pending-co-signature')}
            className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-400 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
          >
            <span>Pending Co-Signature</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('orders-to-be-sent')}
            className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-400 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
          >
            <span>To Be Sent</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('orders-pending-md-signature')}
            className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-400 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
          >
            <span>Pending MD Signature</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('orders-history')}
            className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-400 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
          >
            <span>Orders History</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('create-order')}
            className="flex items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.6} />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-pearl-200 bg-white p-4 shadow-xs dark:border-charcoal-700 dark:bg-charcoal-850">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">Total Orders</span>
            <FileText size={16} className="text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {orders.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Physician signed & active
          </div>
        </div>

        <div className="rounded-2xl border border-pearl-200 bg-white p-4 shadow-xs dark:border-charcoal-700 dark:bg-charcoal-850">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">Pending Encounters</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {faceToFaceEncounters.filter((e) => e.status === 'Pending').length}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
            Awaiting MD certification
          </div>
        </div>

        <div className="rounded-2xl border border-pearl-200 bg-white p-4 shadow-xs dark:border-charcoal-700 dark:bg-charcoal-850">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">Certified Encounters</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {faceToFaceEncounters.filter((e) => e.status === 'Certified').length}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            CMS compliant & documented
          </div>
        </div>

        <div className="rounded-2xl border border-pearl-200 bg-white p-4 shadow-xs dark:border-charcoal-700 dark:bg-charcoal-850">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">Order Types</span>
            <Filter size={16} className="text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">5</div>
          <div className="mt-1 text-[11px] text-purple-600 dark:text-purple-400">
            Medication, POC, Discipline, Supply
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-pearl-200 bg-white shadow-xs overflow-hidden dark:border-charcoal-700 dark:bg-charcoal-850">
        {/* Navigation & Search Subheader */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-pearl-200 p-4 dark:border-charcoal-700">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-pearl-100 text-slate-600 hover:text-slate-900 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              Physician Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('f2f')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition cursor-pointer ${
                activeTab === 'f2f'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-pearl-100 text-slate-600 hover:text-slate-900 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              Face-to-Face Encounters ({faceToFaceEncounters.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, physician..."
              className="w-full rounded-xl border border-pearl-200 bg-pearl-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Orders Table */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <FileText size={36} className="text-slate-300 dark:text-charcoal-600 mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No physician orders recorded yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Create medication, plan of care, discipline frequency, or supply orders.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('create-order')}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Create First Order
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-pearl-200 bg-pearl-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-800/75 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Order Type</th>
                    <th className="py-3 px-4">Summary / Title</th>
                    <th className="py-3 px-4">Attending Physician</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Effective Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-pearl-50/50 dark:hover:bg-charcoal-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {order.patientName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-lg bg-rose-50 px-2 py-0.5 font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                          {order.orderType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {order.summaryTitle || 'Physician Order'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                        {order.attendingPhysician}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {order.date}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {order.effectiveDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40">
                          <CheckCircle2 size={12} />
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Face-to-Face Encounters Table */}
        {activeTab === 'f2f' && (
          <div className="overflow-x-auto">
            {filteredF2F.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <UserCheck size={36} className="text-slate-300 dark:text-charcoal-600 mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Face-to-Face encounters recorded yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Log physician certification documents certifying homebound status.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('create-face-to-face-encounter')}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Create Face-to-Face Encounter
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-pearl-200 bg-pearl-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-800/75 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Episode</th>
                    <th className="py-3 px-4">Certifying Physician</th>
                    <th className="py-3 px-4">Certifying Type</th>
                    <th className="py-3 px-4">Request Date</th>
                    <th className="py-3 px-4">Patient Status</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
                  {filteredF2F.map((enc) => (
                    <tr
                      key={enc.id}
                      className="hover:bg-pearl-50/50 dark:hover:bg-charcoal-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {enc.patientName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {enc.episodeAssociated}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {enc.physician}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-lg bg-pearl-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-charcoal-750 dark:text-slate-300">
                          {enc.certifyingType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {enc.requestDate}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            enc.patientStatus === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-charcoal-750 dark:text-slate-400'
                          }`}
                        >
                          {enc.patientStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border ${
                            enc.status === 'Certified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40'
                          }`}
                        >
                          {enc.status === 'Certified' ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <Clock size={12} />
                          )}
                          {enc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

