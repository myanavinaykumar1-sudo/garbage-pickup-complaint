import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRESET_RESOLUTION_PHOTOS } from '../data/mockData';
import { X, CheckCircle2, Upload, Sparkles, Camera } from 'lucide-react';

export const ResolveModal: React.FC = () => {
  const {
    resolveTargetComplaint,
    setResolveTargetComplaint,
    resolveComplaint,
  } = useApp();

  const [imageUrl, setImageUrl] = useState<string>(
    PRESET_RESOLUTION_PHOTOS[0].url
  );
  const [notes, setNotes] = useState<string>(
    'Site completely cleared of accumulated waste, disinfected with lime powder, and street bin sanitized.'
  );
  const [error, setError] = useState<string | null>(null);

  if (!resolveTargetComplaint) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setError('Please provide a completion verification photograph.');
      return;
    }
    if (!notes.trim()) {
      setError('Please provide cleanup notes for municipal verification.');
      return;
    }

    resolveComplaint(resolveTargetComplaint.id, notes, imageUrl);
    setResolveTargetComplaint(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-base font-bold">Verify & Mark as Resolved</h3>
              <p className="text-xs text-emerald-100">
                Resolution verification for {resolveTargetComplaint.id}
              </p>
            </div>
          </div>
          <button
            onClick={() => setResolveTargetComplaint(null)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="font-bold text-slate-800">{resolveTargetComplaint.categoryLabel}</div>
            <div className="text-slate-500">
              📍 {resolveTargetComplaint.location.street}, {resolveTargetComplaint.location.area}
            </div>
          </div>

          {/* Completion Photograph */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Upload Cleanup Completion Photograph *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Resolved clean site"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3 text-slate-400">
                    <Camera className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-[10px]">No photo chosen</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold cursor-pointer border border-emerald-200 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Or choose sample:</span>
                  <div className="flex gap-1.5">
                    {PRESET_RESOLUTION_PHOTOS.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setImageUrl(p.url)}
                        className={`text-[10px] px-2 py-1 rounded-md border font-medium transition ${
                          imageUrl === p.url
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        Sample {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Cleanup & Resolution Notes *
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail actions taken (waste weight cleared, disposal location, chemicals used)..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setResolveTargetComplaint(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Complete</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
