import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Priority } from '../types';
import { X, Truck, Check, Star, AlertCircle, UserCheck } from 'lucide-react';

export const AssignWorkerModal: React.FC = () => {
  const {
    assignTargetComplaint,
    setAssignTargetComplaint,
    workers,
    assignWorkerToComplaint,
  } = useApp();

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    workers[0]?.id || ''
  );
  const [priority, setPriority] = useState<Priority>(
    assignTargetComplaint?.priority || 'High'
  );

  if (!assignTargetComplaint) return null;

  const handleAssign = () => {
    if (!selectedWorkerId) return;
    assignWorkerToComplaint(assignTargetComplaint.id, selectedWorkerId, priority);
    setAssignTargetComplaint(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold">Assign Sanitation Crew</h3>
              <p className="text-xs text-slate-400">
                Dispatch vehicle for {assignTargetComplaint.id}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAssignTargetComplaint(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="font-bold text-slate-800 mb-0.5">
              {assignTargetComplaint.categoryLabel}
            </div>
            <div className="text-slate-500">
              📍 {assignTargetComplaint.location.street}, {assignTargetComplaint.location.area}
            </div>
          </div>

          {/* Priority override */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Set Dispatch Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Low', 'Medium', 'High', 'Emergency'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition border ${
                    priority === p
                      ? p === 'Emergency'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : p === 'High'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Worker list */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Field Sanitation Worker ({workers.length} Available)
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {workers.map((worker) => {
                const isSelected = selectedWorkerId === worker.id;
                return (
                  <div
                    key={worker.id}
                    onClick={() => setSelectedWorkerId(worker.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          {worker.name}
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                            {worker.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Truck className="w-3 h-3 text-slate-400" />
                          <span>
                            {worker.vehicleType} ({worker.vehicleNumber})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-700">
                        {worker.activeComplaints} active tasks
                      </div>
                      <div className="text-[11px] text-amber-500 flex items-center justify-end gap-1 font-semibold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>{worker.rating}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setAssignTargetComplaint(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Assignment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
