import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sliders,
  Bell,
  ShieldCheck,
  Save,
  RotateCcw,
  Building2,
  Lock,
  Mail,
  UserCheck,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { addToast } = useApp();

  // Thresholds
  const [costVariance, setCostVariance] = useState(25);
  const [delayDays, setDelayDays] = useState(45);
  const [geofenceRadius, setGeofenceRadius] = useState(250);
  const [vendorConcentration, setVendorConcentration] = useState(50);

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [highRiskInstantNotify, setHighRiskInstantNotify] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [autoDailyScan, setAutoDailyScan] = useState(true);

  // Auditor Profile
  const [auditorName, setAuditorName] = useState('Ayush Borade');
  const [auditorEmail, setAuditorEmail] = useState('ayush.borade@nic.in');
  const [nodalDesignation, setNodalDesignation] = useState('Lead Institutional Auditor (MoSPI)');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Institutional anomaly thresholds and preferences saved successfully');
  };

  const handleReset = () => {
    setCostVariance(25);
    setDelayDays(45);
    setGeofenceRadius(250);
    setVendorConcentration(50);
    addToast('info', 'Thresholds reset to statutory MoSPI defaults');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
          System Settings & Thresholds
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure forensic anomaly triggers, GIS geofence tolerances, and statutory audit alerts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Anomaly Detection Triggers */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Forensic Anomaly Thresholds
              </h3>
              <p className="text-xs text-slate-500">
                Automated rule benchmarks that trigger investigation alerts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Cost Variance */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <label className="text-slate-700">Material Cost Variance Flag</label>
                <span className="font-mono text-blue-600">+{costVariance}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={costVariance}
                onChange={(e) => setCostVariance(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500">
                Flags projects when unit material pricing exceeds district Schedule of Rates by {costVariance}%.
              </p>
            </div>

            {/* Delay Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <label className="text-slate-700">Milestone Delay Tolerance</label>
                <span className="font-mono text-blue-600">{delayDays} Days</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500">
                Triggers schedule overrun risk when unfulfilled milestones exceed {delayDays} days.
              </p>
            </div>

            {/* Geofence Proximity */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <label className="text-slate-700">GIS Geofence Cadastral Radius</label>
                <span className="font-mono text-blue-600">{geofenceRadius} Meters</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500">
                Permitted variance between reported milestone coordinates and registered plot boundary.
              </p>
            </div>

            {/* Vendor Concentration */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <label className="text-slate-700">Vendor Award Concentration Cap</label>
                <span className="font-mono text-blue-600">{vendorConcentration}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="80"
                step="5"
                value={vendorConcentration}
                onChange={(e) => setVendorConcentration(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500">
                Triggers collusion flags when a single contractor exceeds {vendorConcentration}% of block works.
              </p>
            </div>
          </div>
        </div>

        {/* Auditor Profile & Institutional Authority */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Auditor Institutional Profile
              </h3>
              <p className="text-xs text-slate-500">
                Nodal authority credentials attached to generated audit trails
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Auditor Name</label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official NIC Email</label>
              <input
                type="email"
                value={auditorEmail}
                onChange={(e) => setAuditorEmail(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nodal Designation</label>
              <input
                type="text"
                value={nodalDesignation}
                onChange={(e) => setNodalDesignation(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Scan Automation */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Notification & Scan Automation
              </h3>
              <p className="text-xs text-slate-500">Automated alerts for high-risk flags</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={highRiskInstantNotify}
                onChange={(e) => setHighRiskInstantNotify(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-800 font-medium">
                Instant alert notification on High-Severity anomaly detection (&gt;75 risk score)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoDailyScan}
                onChange={(e) => setAutoDailyScan(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-800 font-medium">
                Automated 24-hour background ledger scan and recalculation
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-800 font-medium">
                Generate and email weekly parliamentary constituency briefing digest
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Statutory Defaults
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
