import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ComplaintStatus, Priority } from '../types';
import {
  X,
  MapPin,
  Clock,
  User as UserIcon,
  Truck,
  CheckCircle2,
  Calendar,
  Star,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
  Phone,
  FileCheck,
} from 'lucide-react';

export const ComplaintDetailsModal: React.FC = () => {
  const {
    selectedComplaintId,
    setSelectedComplaintId,
    complaints,
    currentUser,
    setAssignTargetComplaint,
    setResolveTargetComplaint,
    updateComplaintStatus,
    submitFeedback,
  } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  if (!selectedComplaintId) return null;

  const complaint = complaints.find((c) => c.id === selectedComplaintId);
  if (!complaint) return null;

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pending Assignment
          </span>
        );
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Assigned to Sanitation Worker
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Pickup In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved & Cleaned
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Emergency':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Emergency
          </span>
        );
      case 'High':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            Medium Priority
          </span>
        );
      case 'Low':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Low Priority
          </span>
        );
    }
  };

  // Timeline Progress Steps
  const steps: { key: ComplaintStatus; label: string; desc: string }[] = [
    { key: 'Pending', label: 'Reported', desc: 'Received in system' },
    { key: 'Assigned', label: 'Assigned', desc: 'Crew dispatched' },
    { key: 'In Progress', label: 'In Progress', desc: 'On-site cleanup' },
    { key: 'Resolved', label: 'Resolved', desc: 'Verified clean' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === complaint.status);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback(complaint.id, rating, feedbackComment);
    setFeedbackSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold tracking-wider">
              {complaint.id}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {complaint.categoryLabel}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                Reported {new Date(complaint.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedComplaintId(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status & Priority Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-emerald-50/30 to-blue-50/30 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Current Status:</span>
              {getStatusBadge(complaint.status)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Urgency:</span>
              {getPriorityBadge(complaint.priority)}
            </div>
          </div>

          {/* 4-Step Visual Progress Bar */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Real-Time Tracking Progress
            </h3>

            <div className="relative flex items-center justify-between">
              {/* Progress Line */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {steps.map((st, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={st.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition shadow-xs ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-bold mt-2 ${
                        isCurrent ? 'text-emerald-700' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">{st.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo Section: Before & After Comparison */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Evidence & Resolution Photographs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reported Photo */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                <div className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-between">
                  <span>Reported Condition (Citizen)</span>
                  <span className="text-[10px] text-slate-500">Initial State</span>
                </div>
                <div className="h-48 overflow-hidden bg-black/5">
                  <img
                    src={complaint.imageUrl}
                    alt="Citizen uploaded problem"
                    className="w-full h-full object-cover transition hover:scale-105 duration-300"
                  />
                </div>
              </div>

              {/* Resolved Photo */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                <div className="px-3 py-1.5 bg-emerald-100/70 text-emerald-900 text-xs font-bold flex items-center justify-between">
                  <span>Cleanup Verification (Worker)</span>
                  <span className="text-[10px] text-emerald-700">Completed State</span>
                </div>
                <div className="h-48 overflow-hidden bg-emerald-50/50 flex items-center justify-center">
                  {complaint.resolutionImageUrl ? (
                    <img
                      src={complaint.resolutionImageUrl}
                      alt="Sanitation verified cleanup"
                      className="w-full h-full object-cover transition hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-pulse" />
                      <p className="text-xs font-medium">Awaiting Cleanup Completion</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Worker will upload verified photo after clearing site
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {complaint.resolutionNotes && (
              <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <span className="font-bold">Sanitation Crew Field Note: </span>
                {complaint.resolutionNotes}
              </div>
            )}
          </div>

          {/* Details & Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Description & Citizen Info */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Complaint Information
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {complaint.description}
              </p>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Reported By:</span>
                  <span className="font-semibold text-slate-800">{complaint.citizenName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Contact:</span>
                  <span className="font-mono text-slate-700">{complaint.citizenPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Status Update:</span>
                  <span className="text-slate-600">
                    {new Date(complaint.updatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Location & Worker Assigned */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Location & Dispatch
              </h4>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-start gap-2 text-slate-800 font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {complaint.location.street}, {complaint.location.area}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pl-6">
                  Postal Code: <span className="font-mono">{complaint.location.postalCode}</span>
                  {complaint.location.landmark && ` • Landmark: ${complaint.location.landmark}`}
                </div>
              </div>

              {complaint.assignedWorkerName ? (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {complaint.assignedWorkerName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-950">
                        {complaint.assignedWorkerName}
                      </div>
                      <div className="text-[11px] text-blue-700 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>{complaint.assignedWorkerVehicle}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-200/80 text-blue-800">
                    On Duty
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                  <span>No worker assigned yet</span>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => setAssignTargetComplaint(complaint)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition"
                    >
                      Assign Worker
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timeline Audit Log */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Detailed Action Audit History
            </h3>

            <div className="space-y-2.5">
              {complaint.timeline.map((event, idx) => (
                <div
                  key={event.id || idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3 text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {event.actor} ({event.actorRole})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5">{event.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Feedback Section (when Resolved) */}
          {complaint.status === 'Resolved' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Citizen Service Rating & Feedback
                </h4>
                {complaint.feedback && (
                  <span className="text-[11px] font-bold text-emerald-700">Verified Citizen Review</span>
                )}
              </div>

              {complaint.feedback ? (
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= complaint.feedback!.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">
                      {complaint.feedback.rating}/5 Stars
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{complaint.feedback.comment}"</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Submitted on {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              ) : feedbackSubmitted ? (
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold text-center">
                  Thank you for your rating! Your feedback helps us improve municipal waste management.
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <p className="text-xs text-emerald-800">
                    How satisfied are you with the pickup timeliness and area cleanliness?
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-emerald-950 ml-2">{rating} out of 5</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Add your comments or appreciation for the sanitation crew..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Rating</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Contextual Actions based on Active Role */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 block">Actions available for your role:</span>
              <span className="text-xs font-bold text-emerald-400">
                {currentUser.role.toUpperCase()} MODE ({currentUser.name})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentUser.role === 'admin' && (
                <>
                  <button
                    onClick={() => setAssignTargetComplaint(complaint)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Assign / Reassign Worker
                  </button>
                  {complaint.status !== 'Resolved' && (
                    <button
                      onClick={() => setResolveTargetComplaint(complaint)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Verify & Resolve
                    </button>
                  )}
                </>
              )}

              {currentUser.role === 'worker' && complaint.status !== 'Resolved' && (
                <>
                  {complaint.status === 'Assigned' && (
                    <button
                      onClick={() =>
                        updateComplaintStatus(
                          complaint.id,
                          'In Progress',
                          'Crew on site. Pickup started.'
                        )
                      }
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Start Cleanup (In Progress)
                    </button>
                  )}
                  <button
                    onClick={() => setResolveTargetComplaint(complaint)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Cleanup & Upload Photo</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setSelectedComplaintId(null)}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
