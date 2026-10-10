import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CitizenDashboard } from './components/CitizenDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { NewComplaintModal } from './components/NewComplaintModal';
import { ComplaintDetailsModal } from './components/ComplaintDetailsModal';
import { AssignWorkerModal } from './components/AssignWorkerModal';
import { ResolveModal } from './components/ResolveModal';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { NotificationToast } from './components/NotificationToast';
import { Trash2, ShieldCheck, Heart, Sparkles, Database, ExternalLink } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser, setIsSchemaModalOpen } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentUser.role === 'citizen' && <CitizenDashboard />}
        {currentUser.role === 'admin' && <AdminDashboard />}
        {currentUser.role === 'worker' && <WorkerDashboard />}
      </main>

      {/* Global Action Modals & Notification Toasts */}
      <NewComplaintModal />
      <ComplaintDetailsModal />
      <AssignWorkerModal />
      <ResolveModal />
      <DatabaseSchemaModal />
      <NotificationToast />

      {/* Municipal Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-700">CleanCity</span>
            <span>— Smart Municipal Garbage Pickup & Grievance Redressal System</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSchemaModalOpen(true)}
              className="hover:text-emerald-600 font-semibold flex items-center gap-1 transition"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Database DDL & API Specs</span>
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Production-Ready Academic Capstone Prototype</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
