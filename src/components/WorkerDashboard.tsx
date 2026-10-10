import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapView } from './MapView';
import { Complaint, ComplaintStatus } from '../types';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Camera,
  Star,
  Navigation,
  Check,
  Eye,
  Route,
  Sparkles,
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const {
    complaints,
    workers,
    currentUser,
    setSelectedComplaintId,
    setResolveTargetComplaint,
    updateComplaintStatus,
  } = useApp();

  const [tab, setTab] = useState<'assigned' | 'completed' | 'map'>('assigned');

  // Match logged in worker or fallback to first worker (Rajesh Kumar)
  const currentWorker =
    workers.find((w) => w.id === currentUser.id || w.name.includes(currentUser.name.split(' ')[0])) ||
    workers[0];

  // Worker's assigned complaints
  const myTasks = complaints.filter(
    (c) => c.assignedWorkerId === currentWorker.id || !c.assignedWorkerId
  );

  const activeTasks = myTasks.filter((c) => c.status === 'Assigned' || c.status === 'In Progress');
  const completedTasks = myTasks.filter((c) => c.status === 'Resolved');

  return (
    <div className="space-y-6">
      {/* Shift Greeting & Fleet Vehicle Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentWorker.avatar}
            alt={currentWorker.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{currentWorker.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                {currentWorker.status}
              </span>
            </div>
            <div className="text-xs text-blue-200 flex items-center gap-2 mt-1">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {currentWorker.vehicleType} • <span className="font-mono">{currentWorker.vehicleNumber}</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Assigned Sector: {currentWorker.zone}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
          <div className="text-right">
            <div className="text-xs font-bold text-white">Driver Performance</div>
            <div className="text-[11px] text-amber-300 flex items-center justify-end gap-1 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>{currentWorker.rating} / 5.0 Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Assigned Tasks
            </div>
            <div className="text-2xl font-black text-blue-600 mt-1">{activeTasks.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Awaiting cleanup</div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              In Progress
            </div>
            <div className="text-2xl font-black text-purple-600 mt-1">
              {activeTasks.filter((t) => t.status === 'In Progress').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Vehicle on site</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resolved & Cleaned
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{completedTasks.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Photos verified</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl max-w-md">
        <button
          onClick={() => setTab('assigned')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            tab === 'assigned'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Active Tasks ({activeTasks.length})</span>
        </button>

        <button
          onClick={() => setTab('map')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            tab === 'map'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>Route Map</span>
        </button>

        <button
          onClick={() => setTab('completed')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            tab === 'completed'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed ({completedTasks.length})</span>
        </button>
      </div>

      {/* Tab 1: Active Assigned Tasks */}
      {tab === 'assigned' && (
        <div className="space-y-4">
          {activeTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">All Assigned Pickups Completed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                No active complaints pending for your vehicle route at this moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header bar */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                          {task.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            task.priority === 'Emergency'
                              ? 'bg-rose-100 text-rose-800'
                              : task.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          task.status === 'In Progress'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {/* Task image and info */}
                    <div className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img
                            src={task.imageUrl}
                            alt={task.categoryLabel}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {task.categoryLabel}
                          </h4>
                          <div className="text-xs text-slate-600 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              {task.location.street}, {task.location.area}
                            </span>
                          </div>
                          {task.location.landmark && (
                            <div className="text-[11px] text-slate-400">
                              Landmark: {task.location.landmark}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400">
                            Reported by {task.citizenName} ({task.citizenPhone})
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-100">
                        "{task.description}"
                      </div>
                    </div>
                  </div>

                  {/* Worker Action Buttons */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedComplaintId(task.id)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {task.status === 'Assigned' && (
                        <button
                          onClick={() =>
                            updateComplaintStatus(
                              task.id,
                              'In Progress',
                              `Vehicle ${currentWorker.vehicleNumber} arrived on site. Clearing waste.`
                            )
                          }
                          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Start Pickup</span>
                        </button>
                      )}

                      <button
                        onClick={() => setResolveTargetComplaint(task)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Resolve & Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Map & Optimal Route */}
      {tab === 'map' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Optimal Collection Route for {currentWorker.vehicleNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing assigned pickup stops in sequential dispatch order
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
              <Route className="w-4 h-4" />
              <span>{activeTasks.length} Active Waypoints</span>
            </span>
          </div>

          <MapView complaints={myTasks} showRoute={true} workerMode={true} heightClass="h-[520px]" />
        </div>
      )}

      {/* Tab 3: Completed History & Feedback */}
      {tab === 'completed' && (
        <div className="space-y-3">
          {completedTasks.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200 text-xs text-slate-400">
              No completed pickups yet in this session.
            </div>
          ) : (
            completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={task.resolutionImageUrl || task.imageUrl}
                      alt="Resolved site"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{task.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Resolved
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">
                      {task.categoryLabel} • {task.location.street}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Resolved {task.resolvedAt ? new Date(task.resolvedAt).toLocaleString() : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right sm:max-w-xs">
                  {task.feedback ? (
                    <div>
                      <div className="flex items-center justify-end gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= task.feedback!.rating ? 'fill-amber-500' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-600 italic mt-0.5">
                        "{task.feedback.comment}"
                      </p>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Awaiting citizen review rating
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
