import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, TrendingUp, CheckCircle, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export const HotspotReport: React.FC = () => {
  const { complaints, workers } = useApp();

  // Aggregate by Ward/Area
  const wardMap = new Map<string, { total: number; resolved: number; pending: number; categories: Record<string, number> }>();

  complaints.forEach((c) => {
    const area = c.location.area || 'Other';
    if (!wardMap.has(area)) {
      wardMap.set(area, { total: 0, resolved: 0, pending: 0, categories: {} });
    }
    const current = wardMap.get(area)!;
    current.total += 1;
    if (c.status === 'Resolved') current.resolved += 1;
    else current.pending += 1;

    current.categories[c.categoryLabel] = (current.categories[c.categoryLabel] || 0) + 1;
  });

  const hotspots = Array.from(wardMap.entries()).map(([area, stats]) => {
    // find top category
    let topCat = 'General Waste';
    let maxCount = 0;
    Object.entries(stats.categories).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCat = cat;
      }
    });

    const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 100;
    const riskLevel: 'Critical' | 'Moderate' | 'Low' =
      stats.pending >= 3 ? 'Critical' : stats.pending >= 1 ? 'Moderate' : 'Low';

    return {
      area,
      total: stats.total,
      resolved: stats.resolved,
      pending: stats.pending,
      resolutionRate,
      topIssue: topCat,
      riskLevel,
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Ward Vulnerability & Chronic Dumping Analysis</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Frequently Affected Municipal Areas</h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Identifies garbage hotspots prone to overflowing public dumpsters, illegal dumping,
            and vehicle route delays to optimize sanitation fleet deployment.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Active Wards Analyzed: {hotspots.length}</span>
        </div>
      </div>

      {/* Hotspots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotspots.map((h) => {
          const isCritical = h.riskLevel === 'Critical';
          const isModerate = h.riskLevel === 'Moderate';

          return (
            <div
              key={h.area}
              className={`p-5 rounded-2xl border transition bg-white shadow-sm space-y-4 ${
                isCritical
                  ? 'border-rose-300 ring-1 ring-rose-300/50'
                  : isModerate
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">{h.area}</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isCritical
                      ? 'bg-rose-100 text-rose-800'
                      : isModerate
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {h.riskLevel} Risk
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{h.total}</div>
                  <div className="text-[10px] text-slate-500">Reports</div>
                </div>
                <div>
                  <div className="font-bold text-amber-600 text-sm">{h.pending}</div>
                  <div className="text-[10px] text-slate-500">Pending</div>
                </div>
                <div>
                  <div className="font-bold text-emerald-600 text-sm">{h.resolutionRate}%</div>
                  <div className="text-[10px] text-slate-500">Resolved</div>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <div className="text-slate-400 text-[11px]">Primary Recurring Issue:</div>
                <div className="font-semibold text-slate-700 bg-slate-100/80 px-2.5 py-1.5 rounded-lg text-[11px]">
                  ⚠️ {h.topIssue}
                </div>
              </div>

              {/* Municipal Action Recommendation */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <span className="font-bold text-slate-800">Recommendation: </span>
                {isCritical
                  ? 'Deploy secondary compactor truck shift and install CCTV monitoring for illegal dumping.'
                  : isModerate
                  ? 'Increase bin clearance frequency from daily to twice-daily.'
                  : 'Standard scheduled sanitation vehicle route operating normally.'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
