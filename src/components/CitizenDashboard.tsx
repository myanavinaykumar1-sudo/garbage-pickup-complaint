import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapView } from './MapView';
import { ComplaintStatus, ComplaintCategory } from '../types';
import { COMPLAINT_CATEGORIES } from '../data/mockData';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Trash2,
  PackageX,
  CalendarX,
  Truck,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const {
    complaints,
    currentUser,
    setIsNewComplaintModalOpen,
    setSelectedComplaintId,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [trackInput, setTrackInput] = useState('');
  const [trackError, setTrackError] = useState('');

  // Filter complaints filed by current user (or all if demo)
  const myComplaints = complaints.filter(
    (c) => c.citizenId === currentUser.id || currentUser.id === 'user-c1'
  );

  const pendingCount = myComplaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = myComplaints.filter(
    (c) => c.status === 'Assigned' || c.status === 'In Progress'
  ).length;
  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved').length;

  const filteredComplaints = myComplaints.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    return true;
  });

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    if (!trackInput.trim()) return;

    const match = complaints.find(
      (c) => c.id.toLowerCase() === trackInput.trim().toLowerCase()
    );

    if (match) {
      setSelectedComplaintId(match.id);
      setTrackInput('');
    } else {
      setTrackError(`Complaint ID "${trackInput.trim()}" not found. Try e.g. CC-2026-7841`);
    }
  };

  const getCategoryIcon = (category: ComplaintCategory) => {
    switch (category) {
      case 'overflowing_bins':
        return <Trash2 className="w-4 h-4 text-amber-600" />;
      case 'not_collected':
        return <PackageX className="w-4 h-4 text-sky-600" />;
      case 'missed_schedule':
        return <CalendarX className="w-4 h-4 text-indigo-600" />;
      case 'illegal_dumping':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'vehicle_not_arriving':
        return <Truck className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Pending
          </span>
        );
      case 'Assigned':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Assigned
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Citizen Welcome & Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-sky-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Citizen Grievance Redressal Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Keep Our City Clean, Green & Healthy
          </h1>
          <p className="text-sm text-emerald-100 mt-2 leading-relaxed">
            Report uncollected trash, overflowing public dumpsters, or missed garbage pickup
            schedules. Municipal authorities dispatch sanitation crews with live tracking.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setIsNewComplaintModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 text-xs sm:text-sm font-extrabold shadow-md transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>File New Complaint</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats overlay */}
        <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-3 gap-3 max-w-lg">
          <div>
            <div className="text-2xl font-black">{myComplaints.length}</div>
            <div className="text-[11px] text-emerald-200">Total Reported</div>
          </div>
          <div>
            <div className="text-2xl font-black">{inProgressCount + pendingCount}</div>
            <div className="text-[11px] text-emerald-200">Active / In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-300">{resolvedCount}</div>
            <div className="text-[11px] text-emerald-200">Resolved & Clean</div>
          </div>
        </div>
      </div>

      {/* Quick Track Input Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Track Complaint by ID</h3>
              <p className="text-xs text-slate-500">
                Enter your unique complaint reference number to view real-time status
              </p>
            </div>
          </div>

          <form onSubmit={handleTrackSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. CC-2026-7841"
              value={trackInput}
              onChange={(e) => setTrackInput(e.target.value)}
              className="w-full sm:w-56 px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shrink-0"
            >
              Track Now
            </button>
          </form>
        </div>
        {trackError && <p className="text-xs text-rose-600 mt-2">{trackError}</p>}
      </div>

      {/* Main Grid: My Complaints List & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: My Complaints List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">My Complaint History</h2>
                <p className="text-xs text-slate-500">Track and monitor your reported garbage issues</p>
              </div>

              {/* Status Filter Pill Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({myComplaints.length})
                </button>
                <button
                  onClick={() => setStatusFilter('In Progress')}
                  className={`px-2 py-1 rounded-lg transition ${
                    statusFilter === 'In Progress'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter('Resolved')}
                  className={`px-2 py-1 rounded-lg transition ${
                    statusFilter === 'Resolved'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* Complaints Cards */}
            <div className="space-y-3">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Trash2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No complaints matching filter</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click "File New Complaint" above to register an issue
                  </p>
                </div>
              ) : (
                filteredComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedComplaintId(c.id)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition bg-white cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={c.imageUrl}
                          alt={c.categoryLabel}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{c.categoryLabel}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-semibold">
                            {c.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">
                            {c.location.street}, {c.location.area}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Reported {new Date(c.createdAt).toLocaleDateString()}</span>
                          {c.assignedWorkerName && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">
                                Worker: {c.assignedWorkerName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      {getStatusBadge(c.status)}
                      <div className="text-[11px] font-semibold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1">
                        <span>View Progress</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Map & Category Help (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Live Municipal Complaint Map
              </h3>
              <span className="text-[11px] text-slate-400">Click marker to inspect</span>
            </div>
            <MapView complaints={complaints} heightClass="h-[360px]" />
          </div>

          {/* Quick Problem Guide */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Common Garbage Categories
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {COMPLAINT_CATEGORIES.slice(0, 4).map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setIsNewComplaintModalOpen(true)}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 cursor-pointer transition flex items-center gap-2"
                >
                  <div className="p-1.5 rounded-lg bg-slate-50">{getCategoryIcon(cat.id)}</div>
                  <span className="font-medium text-slate-700 text-[11px]">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
