import React from 'react';
import { Modal } from '../common/Modal';
import { ShieldCheck, Scale, Cpu, AlertTriangle, FileSpreadsheet, MapPin } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MPLADS Sentinel Institutional Guide"
      subtitle="Operational guidelines, anomaly detection criteria & oversight protocols"
      maxWidth="2xl"
    >
      <div className="space-y-6 text-sm text-slate-700">
        <div className="flex gap-4 items-start p-3 bg-blue-50/70 rounded-lg border border-blue-100">
          <ShieldCheck className="w-6 h-6 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">Core Mandate of MPLADS Sentinel</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Designed under Ministry of Statistics and Programme Implementation (MoSPI) transparency directives, Sentinel performs automated forensic cross-checking of Member of Parliament Local Area Development Scheme allocations against physical progress, geotagging coordinates, and schedule of rates.
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            Anomaly Scoring & Risk Hierarchy
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-red-50/60 border border-red-200 rounded">
              <span className="font-bold text-red-700 block mb-1">High Risk (70-100)</span>
              <p className="text-slate-600">Requires urgent verification. Tranche expenditure &gt; 50% ahead of physical progress, vendor clustering, or duplicate land allocation.</p>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded">
              <span className="font-bold text-amber-700 block mb-1">Medium Risk (35-69)</span>
              <p className="text-slate-600">Milestone delays &gt; 45 days, procurement velocity deviations, or missing photographic evidence.</p>
            </div>
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded">
              <span className="font-bold text-emerald-700 block mb-1">Low Risk (0-34)</span>
              <p className="text-slate-600">Nominal execution adhering strictly to sanctioned timeline, verified GPS coordinates, and standard rate ledgers.</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-700" />
            Institutional Terminology Standard
          </h4>
          <p className="text-xs text-slate-600 mb-2">
            Per judicial oversight standards, Sentinel utilizes strictly objective forensic labels:
          </p>
          <ul className="text-xs list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>High Risk:</strong> Statistical anomaly warranting physical inspection.</li>
            <li><strong>Anomaly Detected:</strong> Mathematical outlier compared against district benchmarks.</li>
            <li><strong>Requires Verification:</strong> Documentation or geotagging record pending from implementing agency.</li>
            <li><strong>Unusual Pattern:</strong> Repeated supplier award concentration or expenditure spikes.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
          >
            Got it, return to Dashboard
          </button>
        </div>
      </div>
    </Modal>
  );
};
