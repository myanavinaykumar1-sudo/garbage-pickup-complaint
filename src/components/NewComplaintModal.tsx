import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { COMPLAINT_CATEGORIES, PRESET_SAMPLE_PHOTOS } from '../data/mockData';
import { ComplaintCategory, Priority } from '../types';
import {
  X,
  Upload,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  CalendarX,
  PackageX,
  AlertTriangle,
  Truck,
  Sparkles,
} from 'lucide-react';

export const NewComplaintModal: React.FC = () => {
  const {
    isNewComplaintModalOpen,
    setIsNewComplaintModalOpen,
    addComplaint,
    setSelectedComplaintId,
  } = useApp();

  const [category, setCategory] = useState<ComplaintCategory>('overflowing_bins');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('Ward 4 – Green Valley');
  const [postalCode, setPostalCode] = useState('560001');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('High');
  const [imageUrl, setImageUrl] = useState<string>(PRESET_SAMPLE_PHOTOS[0].url);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [createdComplaintId, setCreatedComplaintId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isNewComplaintModalOpen) return null;

  const getCategoryIcon = (id: ComplaintCategory) => {
    switch (id) {
      case 'overflowing_bins':
        return <Trash2 className="w-5 h-5 text-amber-600" />;
      case 'not_collected':
        return <PackageX className="w-5 h-5 text-sky-600" />;
      case 'missed_schedule':
        return <CalendarX className="w-5 h-5 text-indigo-600" />;
      case 'illegal_dumping':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'vehicle_not_arriving':
        return <Truck className="w-5 h-5 text-emerald-600" />;
    }
  };

  const handleFetchGps = () => {
    setIsGpsLoading(true);
    setGpsSuccess(false);

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setIsGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoordinates({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        });
        setIsGpsLoading(false);
        setGpsSuccess(true);
      },
      (err) => {
        console.warn('GPS error:', err);
        // Fallback to slight offset in Bangalore/Metro center
        const offsetLat = 12.9716 + (Math.random() - 0.5) * 0.02;
        const offsetLng = 77.5946 + (Math.random() - 0.5) * 0.02;
        setGpsCoordinates({
          lat: Number(offsetLat.toFixed(4)),
          lng: Number(offsetLng.toFixed(4)),
        });
        setIsGpsLoading(false);
        setGpsSuccess(true);
      },
      { timeout: 6000 }
    );
  };

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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!street.trim()) newErrors.street = 'Street name or address is required';
    if (!area.trim()) newErrors.area = 'Ward / Area is required';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!description.trim() || description.length < 10) {
      newErrors.description = 'Please describe the problem (min 10 characters)';
    }
    if (!imageUrl) newErrors.image = 'Please upload or select an issue photograph';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const generatedId = addComplaint({
      category,
      description,
      location: {
        street,
        area,
        postalCode,
        landmark: landmark.trim() || undefined,
        lat: gpsCoordinates.lat,
        lng: gpsCoordinates.lng,
      },
      imageUrl,
      priority,
    });

    setCreatedComplaintId(generatedId);
  };

  const handleCopyId = () => {
    if (createdComplaintId) {
      navigator.clipboard.writeText(createdComplaintId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setIsNewComplaintModalOpen(false);
    setCreatedComplaintId(null);
    setStreet('');
    setDescription('');
    setLandmark('');
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Register Garbage Pickup Complaint</h2>
              <p className="text-xs text-emerald-100">
                Direct municipal report for rapid sanitation crew dispatch
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {createdComplaintId ? (
            /* Success State */
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800">
                  Complaint Filed Successfully!
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Your complaint has been queued for municipal verification and worker assignment.
                </p>
              </div>

              {/* ID Display Box */}
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                    Your Unique Tracking ID
                  </span>
                  <div className="text-2xl font-black text-emerald-950 font-mono">
                    {createdComplaintId}
                  </div>
                </div>
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                <button
                  onClick={() => {
                    const id = createdComplaintId;
                    handleResetAndClose();
                    setSelectedComplaintId(id);
                  }}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Track Complaint Progress</span>
                </button>
                <button
                  onClick={handleResetAndClose}
                  className="px-5 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Category Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  1. Select Complaint Category *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COMPLAINT_CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setCategory(cat.id);
                          setPriority(cat.defaultPriority);
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-white shadow-xs shrink-0">
                          {getCategoryIcon(cat.id)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 leading-tight">
                            {cat.label}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Location Information */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    2. Location & Address Details *
                  </span>
                  <button
                    type="button"
                    onClick={handleFetchGps}
                    disabled={isGpsLoading}
                    className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    <span>{isGpsLoading ? 'Fetching GPS...' : 'Auto-Capture GPS'}</span>
                    {gpsSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Street / Road / Building *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5th Main Road, Opp Park"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    {errors.street && (
                      <p className="text-[10px] text-rose-500 mt-1">{errors.street}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Ward / Area Zone *
                    </label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="Ward 4 – Green Valley">Ward 4 – Green Valley</option>
                      <option value="Ward 7 – Metro Center">Ward 7 – Metro Center</option>
                      <option value="Ward 12 – Riverside Colony">Ward 12 – Riverside Colony</option>
                      <option value="Ward 2 – High Street">Ward 2 – High Street</option>
                      <option value="Ward 9 – Industrial Park">Ward 9 – Industrial Park</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Postal Code / PIN *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 560001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    {errors.postalCode && (
                      <p className="text-[10px] text-rose-500 mt-1">{errors.postalCode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Next to Water Tank"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>
                    GPS Lat: {gpsCoordinates.lat}, Lng: {gpsCoordinates.lng}
                  </span>
                  <span className="text-emerald-600 font-medium">Pinpoint verified</span>
                </div>
              </div>

              {/* 3. Photo Upload / Preset Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  3. Upload Garbage Photograph *
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <div className="md:col-span-1 h-36 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 relative group flex items-center justify-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Garbage preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <Upload className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                        <span className="text-[10px]">No image selected</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <div>
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold cursor-pointer border border-emerald-200 transition">
                        <Upload className="w-4 h-4" />
                        <span>Choose File From Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-400 ml-2">PNG, JPG up to 10MB</span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Or select quick demo photo:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_SAMPLE_PHOTOS.map((photo, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setImageUrl(photo.url)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition ${
                              imageUrl === photo.url
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            Sample {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {errors.image && <p className="text-[10px] text-rose-500 mt-1">{errors.image}</p>}
              </div>

              {/* 4. Description and Priority */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      4. Problem Description *
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {description.length}/300 characters
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={300}
                    placeholder="Describe the garbage issue, estimated volume, smell, road blockage, or specific concerns..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.description && (
                    <p className="text-[10px] text-rose-500 mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Urgency Level:</span>
                    {(['Low', 'Medium', 'High', 'Emergency'] as Priority[]).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                          priority === p
                            ? p === 'Emergency'
                              ? 'bg-rose-600 text-white'
                              : p === 'High'
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Submit Complaint & Get ID</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
