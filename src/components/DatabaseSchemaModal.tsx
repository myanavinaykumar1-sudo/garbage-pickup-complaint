import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Database,
  Server,
  Code2,
  Copy,
  Check,
  Layers,
  BookOpen,
  ArrowRight,
  Shield,
} from 'lucide-react';

export const DatabaseSchemaModal: React.FC = () => {
  const { isSchemaModalOpen, setIsSchemaModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState<'sql' | 'api' | 'erd' | 'arch'>('sql');
  const [copied, setCopied] = useState(false);

  if (!isSchemaModalOpen) return null;

  const SQL_DDL = `-- ==========================================================
-- CleanCity Database Schema (PostgreSQL / MySQL 8.0+)
-- Municipal Waste Management & Complaint Resolution Engine
-- ==========================================================

-- 1. Users Table (Citizens, Admins, Workers)
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('citizen', 'admin', 'worker')),
    avatar_url TEXT,
    ward_assigned VARCHAR(80),
    badge_number VARCHAR(40),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sanitation Workers & Fleet Vehicles Table
CREATE TABLE sanitation_workers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(60) NOT NULL, -- 'Compactor Truck', 'Hydraulic Tipper', 'Mini Dumper'
    coverage_zone VARCHAR(80) NOT NULL,
    status VARCHAR(20) DEFAULT 'On Duty' CHECK (status IN ('Available', 'On Duty', 'Off Duty')),
    rating NUMERIC(2, 1) DEFAULT 5.0,
    active_complaints INT DEFAULT 0,
    completed_complaints INT DEFAULT 0
);

-- 3. Complaints Master Table
CREATE TABLE complaints (
    id VARCHAR(40) PRIMARY KEY, -- Formatted: CC-YYYY-XXXX
    citizen_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(40) NOT NULL CHECK (
        category IN ('overflowing_bins', 'not_collected', 'missed_schedule', 'illegal_dumping', 'vehicle_not_arriving')
    ),
    description TEXT NOT NULL,
    street_address VARCHAR(200) NOT NULL,
    ward_area VARCHAR(100) NOT NULL,
    postal_code VARCHAR(15) NOT NULL,
    landmark VARCHAR(120),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    reported_image_url TEXT NOT NULL,
    status VARCHAR(25) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Resolved')),
    priority VARCHAR(15) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
    assigned_worker_id VARCHAR(64) REFERENCES sanitation_workers(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    resolution_image_url TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Status History & Audit Timeline Table
CREATE TABLE complaint_timeline (
    id BIGSERIAL PRIMARY KEY,
    complaint_id VARCHAR(40) REFERENCES complaints(id) ON DELETE CASCADE,
    status VARCHAR(25) NOT NULL,
    actor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(120) NOT NULL,
    actor_role VARCHAR(40) NOT NULL,
    note TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Citizen Feedback & Quality Rating Table
CREATE TABLE citizen_feedback (
    id BIGSERIAL PRIMARY KEY,
    complaint_id VARCHAR(40) UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. In-App Notifications Table
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    complaint_id VARCHAR(40) REFERENCES complaints(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notif_type VARCHAR(30) DEFAULT 'status_change',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Fast Querying & Analytics
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_ward ON complaints(ward_area);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);
CREATE INDEX idx_complaints_worker ON complaints(assigned_worker_id);`;

  const copySql = () => {
    navigator.clipboard.writeText(SQL_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                CleanCity – Database Schema & Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Production relational schema, REST API contracts, and College Project Viva guide
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSchemaModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-white border-emerald-600 text-emerald-800 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>PostgreSQL / MySQL Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'bg-white border-emerald-600 text-emerald-800 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>REST API Endpoints</span>
          </button>

          <button
            onClick={() => setActiveTab('erd')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'erd'
                ? 'bg-white border-emerald-600 text-emerald-800 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Visual Entity-Relationship (ERD)</span>
          </button>

          <button
            onClick={() => setActiveTab('arch')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'arch'
                ? 'bg-white border-emerald-600 text-emerald-800 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Project Viva & Architecture</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  SQL Data Definition Language (DDL) with foreign keys, constraints, and audit indexes:
                </span>
                <button
                  onClick={copySql}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied SQL!' : 'Copy DDL'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-slate-100 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {SQL_DDL}
              </pre>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                RESTful API endpoints bridging the React frontend, Express Node.js server, and database:
              </p>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <div className="grid grid-cols-12 bg-slate-100 p-2.5 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  <div className="col-span-2">Method</div>
                  <div className="col-span-4">Endpoint</div>
                  <div className="col-span-3">Role / Auth</div>
                  <div className="col-span-3">Purpose</div>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50">
                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px]">
                        POST
                      </span>
                    </div>
                    <div className="col-span-4 font-mono text-slate-900 font-semibold">
                      /api/complaints
                    </div>
                    <div className="col-span-3 text-slate-600">Citizen (JWT)</div>
                    <div className="col-span-3 text-slate-600">File new complaint with GPS & photo</div>
                  </div>

                  <div className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50">
                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold font-mono text-[10px]">
                        GET
                      </span>
                    </div>
                    <div className="col-span-4 font-mono text-slate-900 font-semibold">
                      /api/complaints/:id
                    </div>
                    <div className="col-span-3 text-slate-600">Public / Citizen</div>
                    <div className="col-span-3 text-slate-600">Track progress by unique ID</div>
                  </div>

                  <div className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50">
                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold font-mono text-[10px]">
                        GET
                      </span>
                    </div>
                    <div className="col-span-4 font-mono text-slate-900 font-semibold">
                      /api/complaints
                    </div>
                    <div className="col-span-3 text-slate-600">Admin / Worker</div>
                    <div className="col-span-3 text-slate-600">Query complaints with ward & status filters</div>
                  </div>

                  <div className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50">
                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold font-mono text-[10px]">
                        PATCH
                      </span>
                    </div>
                    <div className="col-span-4 font-mono text-slate-900 font-semibold">
                      /api/complaints/:id/assign
                    </div>
                    <div className="col-span-3 text-slate-600">Admin Only</div>
                    <div className="col-span-3 text-slate-600">Assign complaint to sanitation worker</div>
                  </div>

                  <div className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50">
                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold font-mono text-[10px]">
                        PATCH
                      </span>
                    </div>
                    <div className="col-span-4 font-mono text-slate-900 font-semibold">
                      /api/complaints/:id/status
                    </div>
                    <div className="col-span-3 text-slate-600">Worker / Admin</div>
                    <div className="col-span-3 text-slate-600">Update status to 'In Progress'</div>
                  </div>

                  <div className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50">
                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold font-mono text-[10px]">
                        POST
                      </span>
                    </div>
                    <div className="col-span-4 font-mono text-slate-900 font-semibold">
                      /api/complaints/:id/resolve
                    </div>
                    <div className="col-span-3 text-slate-600">Worker / Admin</div>
                    <div className="col-span-3 text-slate-600">Submit completion photo & mark resolved</div>
                  </div>

                  <div className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50">
                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px]">
                        POST
                      </span>
                    </div>
                    <div className="col-span-4 font-mono text-slate-900 font-semibold">
                      /api/complaints/:id/feedback
                    </div>
                    <div className="col-span-3 text-slate-600">Citizen</div>
                    <div className="col-span-3 text-slate-600">Submit 1-5 star rating & remarks</div>
                  </div>

                  <div className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50">
                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold font-mono text-[10px]">
                        GET
                      </span>
                    </div>
                    <div className="col-span-4 font-mono text-slate-900 font-semibold">
                      /api/analytics/hotspots
                    </div>
                    <div className="col-span-3 text-slate-600">Admin</div>
                    <div className="col-span-3 text-slate-600">Ward problem heatmaps and SLA breach rates</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'erd' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Visual entity relationships model showcasing normalized primary and foreign keys:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Users Box */}
                <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-slate-800">USERS (Citizen / Staff)</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 rounded-md font-mono">
                      PK: id
                    </span>
                  </div>
                  <ul className="text-[11px] space-y-1 text-slate-600 font-mono">
                    <li>🔑 id (VARCHAR)</li>
                    <li>• name (VARCHAR)</li>
                    <li>• email (UNIQUE)</li>
                    <li>• phone (VARCHAR)</li>
                    <li>• role ('citizen'|'admin'|'worker')</li>
                    <li>• ward_assigned (VARCHAR)</li>
                  </ul>
                </div>

                {/* Complaints Box */}
                <div className="border-2 border-emerald-500 rounded-2xl p-4 bg-emerald-50/50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200">
                    <span className="font-bold text-xs text-emerald-950">COMPLAINTS (Master)</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded-md font-mono">
                      PK: id
                    </span>
                  </div>
                  <ul className="text-[11px] space-y-1 text-slate-700 font-mono">
                    <li>🔑 id (CC-YYYY-XXXX)</li>
                    <li>🔗 citizen_id ➔ USERS.id</li>
                    <li>• category (ENUM)</li>
                    <li>• status (Pending/Assigned/..)</li>
                    <li>• latitude, longitude (GPS)</li>
                    <li>• reported_image_url</li>
                    <li>🔗 assigned_worker_id ➔ WORKERS.id</li>
                    <li>• resolution_image_url</li>
                  </ul>
                </div>

                {/* Workers Box */}
                <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-slate-800">SANITATION_WORKERS</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 rounded-md font-mono">
                      PK: id
                    </span>
                  </div>
                  <ul className="text-[11px] space-y-1 text-slate-600 font-mono">
                    <li>🔑 id (VARCHAR)</li>
                    <li>🔗 user_id ➔ USERS.id</li>
                    <li>• vehicle_number</li>
                    <li>• vehicle_type</li>
                    <li>• coverage_zone</li>
                    <li>• rating (NUMERIC)</li>
                    <li>• active_complaints</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Timeline Box */}
                <div className="border border-slate-200 rounded-2xl p-3 bg-white">
                  <div className="font-bold text-xs text-slate-800 mb-1">
                    COMPLAINT_TIMELINE (1:N Audit Logs)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Stores timestamped transitions, actor IDs, status changes, and site photos.
                    Foreign key: <code className="text-emerald-700">complaint_id</code>
                  </p>
                </div>

                {/* Feedback Box */}
                <div className="border border-slate-200 rounded-2xl p-3 bg-white">
                  <div className="font-bold text-xs text-slate-800 mb-1">
                    CITIZEN_FEEDBACK (1:1 Resolution Survey)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Captures 1 to 5 star rating and post-cleanup feedback remarks.
                    Foreign key: <code className="text-emerald-700">complaint_id</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'arch' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  College Project Viva Key Talking Points
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>
                    <strong>Problem Statement:</strong> Traditional municipal grievance redressal
                    suffers from lack of visibility, missed bins, and unverified cleanup reports.
                  </li>
                  <li>
                    <strong>Core Innovation:</strong> Real-time 4-stage tracking timeline, GPS
                    auto-tagging, Leaflet spatial mapping, and cryptographic/photographic proof of
                    work (before vs after comparison).
                  </li>
                  <li>
                    <strong>Role-Based Access Control (RBAC):</strong> Three explicit boundaries
                    (Citizen for filing & rating, Worker for field dispatch & resolution upload, Admin
                    for assignment & citywide hotspot analysis).
                  </li>
                  <li>
                    <strong>Tech Stack:</strong> React + TypeScript frontend, Tailwind styling,
                    Leaflet OpenStreetMap spatial engine, Express REST API backend, and PostgreSQL /
                    MySQL relational persistence.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>CleanCity Academic & Production Architecture Spec</span>
          <button
            onClick={() => setIsSchemaModalOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition"
          >
            Close Schema
          </button>
        </div>
      </div>
    </div>
  );
};
