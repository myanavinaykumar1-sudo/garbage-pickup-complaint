import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapView } from './MapView';
import { HotspotReport } from './HotspotReport';
import { ComplaintStatus, Priority, Complaint } from '../types';
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Truck,
  Filter,
  Search,
  Download,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  Star,
  FileSpreadsheet,
  RefreshCw,
  PlusCircle,
  Eye,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    complaints,
    workers,
    setSelectedComplaintId,
    setAssignTargetComplaint,
    setResolveTargetComplaint,
    updateComplaintStatus,
    setIsNewComplaintModalOpen,
    exportDataJson,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'table' | 'map' | 'workers' | 'hotspots'>('table');
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // KPI calculations
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const assigned = complaints.filter((c) => c.status === 'Assigned').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  // Overdue: created more than 48 hours ago and not resolved
  const now = new Date().getTime();
  const overdueComplaints = complaints.filter((c) => {
    if (c.status === 'Resolved') return false;
    const diffHours = (now - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
    return diffHours > 48;
  });
  const overdueCount = overdueComplaints.length;

  // Filtered complaints for table
  const filtered = complaints.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        c.id.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.location.street.toLowerCase().includes(q) ||
        c.categoryLabel.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (wardFilter !== 'ALL' && c.location.area !== wardFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
    return true;
  });

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            Assigned
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Resolved
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Emergency':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
            Emergency
          </span>
        );
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
            Low
          </span>
        );
    }
  };

  // Export Table to CSV
  const exportToCsv = () => {
    const headers = [
      'Complaint ID',
      'Category',
      'Citizen Name',
      'Phone',
      'Street',
      'Ward',
      'Status',
      'Priority',
      'Assigned Worker',
      'Created At',
      'Resolved At',
    ];

    const rows = filtered.map((c) => [
      c.id,
      `"${c.categoryLabel}"`,
      `"${c.citizenName}"`,
      c.citizenPhone,
      `"${c.location.street}"`,
      `"${c.location.area}"`,
      c.status,
      c.priority,
      `"${c.assignedWorkerName || 'None'}"`,
      c.createdAt,
      c.resolvedAt || 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cleancity-complaints-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Municipal Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Municipal Sanitation Command Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">City Waste Management & Redressal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch sanitation crews, monitor SLA compliance, and verify garbage cleanup resolutions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportToCsv}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportDataJson}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => setIsNewComplaintModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Total, Pending, Assigned, In Progress, Resolved, Overdue) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Complaints
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all wards</div>
        </div>

        {/* Pending */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Action
          </div>
          <div className="text-2xl font-black text-amber-950 mt-1">{pending}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Awaiting dispatch</div>
        </div>

        {/* Assigned */}
        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            Assigned
          </div>
          <div className="text-2xl font-black text-blue-950 mt-1">{assigned}</div>
          <div className="text-[10px] text-blue-700 mt-0.5">Worker dispatched</div>
        </div>

        {/* In Progress */}
        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            In Progress
          </div>
          <div className="text-2xl font-black text-purple-950 mt-1">{inProgress}</div>
          <div className="text-[10px] text-purple-700 mt-0.5">On-site pickup</div>
        </div>

        {/* Resolved */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1">{resolved}</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">
            {total > 0 ? Math.round((resolved / total) * 100) : 0}% success rate
          </div>
        </div>

        {/* Overdue (>48h) */}
        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Overdue (&gt;48h)
          </div>
          <div className="text-2xl font-black text-rose-950 mt-1">{overdueCount}</div>
          <div className="text-[10px] text-rose-700 mt-0.5">SLA escalation alert</div>
        </div>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'table'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Complaint Records ({filtered.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Citywide Dispatch Map</span>
          </button>

          <button
            onClick={() => setActiveTab('workers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'workers'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Sanitation Fleet ({workers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hotspots')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'hotspots'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ward Hotspots Report</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 pr-3 hidden sm:block">
          Active Municipal Admin: Dir. Sarah Vance
        </div>
      </div>

      {/* Tab 1: Complaint Master Table with Filters */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Search & Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID, Citizen, Street..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Ward Filter */}
            <div>
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Wards / Areas</option>
                <option value="Ward 4 – Green Valley">Ward 4 – Green Valley</option>
                <option value="Ward 7 – Metro Center">Ward 7 – Metro Center</option>
                <option value="Ward 12 – Riverside Colony">Ward 12 – Riverside Colony</option>
                <option value="Ward 2 – High Street">Ward 2 – High Street</option>
                <option value="Ward 9 – Industrial Park">Ward 9 – Industrial Park</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="Emergency">Emergency</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">ID / Photo</th>
                  <th className="p-3">Category & Details</th>
                  <th className="p-3">Location & Ward</th>
                  <th className="p-3">Urgency</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assigned Crew</th>
                  <th className="p-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No complaints found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      {/* ID & Photo thumbnail */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={c.imageUrl}
                            alt="thumbnail"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-mono font-bold text-slate-900 block">{c.id}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Details */}
                      <td className="p-3 max-w-xs">
                        <div className="font-bold text-slate-800">{c.categoryLabel}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{c.description}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">By {c.citizenName}</div>
                      </td>

                      {/* Location & Ward */}
                      <td className="p-3">
                        <div className="text-slate-800 font-semibold">{c.location.street}</div>
                        <div className="text-[11px] text-slate-500">{c.location.area}</div>
                      </td>

                      {/* Urgency */}
                      <td className="p-3">{getPriorityBadge(c.priority)}</td>

                      {/* Status */}
                      <td className="p-3">{getStatusBadge(c.status)}</td>

                      {/* Assigned Worker */}
                      <td className="p-3">
                        {c.assignedWorkerName ? (
                          <div>
                            <div className="font-bold text-slate-800">{c.assignedWorkerName}</div>
                            <div className="text-[10px] text-slate-500">{c.assignedWorkerVehicle}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedComplaintId(c.id)}
                            title="View Progress & Details"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setAssignTargetComplaint(c)}
                            title="Assign to Sanitation Worker"
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition"
                          >
                            {c.assignedWorkerName ? 'Reassign' : 'Assign'}
                          </button>

                          {c.status !== 'Resolved' && (
                            <button
                              onClick={() => setResolveTargetComplaint(c)}
                              title="Verify Cleanup with Photo"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Map Dispatch View */}
      {activeTab === 'map' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Citywide Real-Time Sanitation Map</h3>
              <p className="text-xs text-slate-500">
                Interactive spatial view of complaints across all wards with status coding
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700">
              Showing {complaints.length} municipal coordinates
            </span>
          </div>

          <MapView complaints={complaints} showRoute={true} heightClass="h-[540px]" />
        </div>
      )}

      {/* Tab 3: Sanitation Workers & Fleet */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Field Sanitation Workers & Fleet Directory
            </h3>
            <span className="text-xs text-slate-500">{workers.length} active crew units</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workers.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={w.avatar}
                    alt={w.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{w.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      {w.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                    <span>{w.vehicleType}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">Reg: {w.vehicleNumber}</div>
                  <div className="text-[11px] text-slate-500">Coverage: {w.zone}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div>
                    <div className="font-bold text-blue-600">{w.activeComplaints}</div>
                    <div className="text-[10px] text-slate-400">Active Tasks</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-600">{w.completedComplaints}</div>
                    <div className="text-[10px] text-slate-400">Completed</div>
                  </div>
                  <div>
                    <div className="font-bold text-amber-500 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {w.rating}
                    </div>
                    <div className="text-[10px] text-slate-400">Rating</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Ward Hotspots Report */}
      {activeTab === 'hotspots' && <HotspotReport />}
    </div>
  );
};
