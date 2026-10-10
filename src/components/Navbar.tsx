import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Trash2,
  Search,
  Bell,
  Shield,
  Truck,
  User,
  PlusCircle,
  Database,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchRole,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSelectedComplaintId,
    setIsNewComplaintModalOpen,
    setIsSchemaModalOpen,
    resetToDemoData,
    complaints,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    // Check if matches a complaint ID exactly or partially
    const match = complaints.find(
      (c) =>
        c.id.toLowerCase().includes(searchInput.trim().toLowerCase()) ||
        c.location.street.toLowerCase().includes(searchInput.trim().toLowerCase())
    );

    if (match) {
      setSelectedComplaintId(match.id);
      setSearchQuery('');
    } else {
      setSearchQuery(searchInput.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Clean<span className="text-emerald-600">City</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                  Gov Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">
                Garbage Pickup Complaint Tracker & Sanitation Dispatch
              </p>
            </div>
          </div>

          {/* Quick Search for Complaint ID Tracking */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Track Complaint ID (e.g. CC-2026-7841)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </form>

          {/* Role Switcher Pill Bar (College & Client Demo Essential) */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => switchRole('citizen')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                currentUser.role === 'citizen'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Citizen View"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Citizen</span>
            </button>

            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                currentUser.role === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Municipal Administrator View"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            <button
              onClick={() => switchRole('worker')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                currentUser.role === 'worker'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Sanitation Worker View"
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Worker</span>
            </button>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2">
            {/* Database & Architecture Button (College Project Feature) */}
            <button
              onClick={() => setIsSchemaModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
              title="View SQL Schemas & System Architecture"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Project DB & ERD</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={resetToDemoData}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition hidden sm:flex"
              title="Reset Sample Complaints & Workers Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notification Menu Box */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
                  <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold">Notifications</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                        {unreadNotificationCount} new
                      </span>
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-slate-300 hover:text-white transition"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.complaintId) {
                              setSelectedComplaintId(n.complaintId);
                              setIsNotifOpen(false);
                            }
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition flex items-start gap-2.5 ${
                            !n.read ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <div className="font-bold text-slate-800">{n.title}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick File Complaint Button */}
            <button
              onClick={() => setIsNewComplaintModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">File Complaint</span>
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500/50 shadow-xs"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold uppercase">
                  {currentUser.role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
