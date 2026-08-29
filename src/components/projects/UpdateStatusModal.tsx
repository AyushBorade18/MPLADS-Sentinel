import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Project, ProjectStatus, RiskLevel } from '../../types';
import { projectService } from '../../services/projectService';
import { useApp } from '../../context/AppContext';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdated: (updated: Project) => void;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdated,
}) => {
  const { addToast } = useApp();
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(project.riskLevel);
  const [physicalProgress, setPhysicalProgress] = useState(project.physicalProgressPercent);
  const [spentAmount, setSpentAmount] = useState(project.spentAmountLakhs);
  const [auditorNote, setAuditorNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await projectService.updateProjectStatus(project.projectId, {
        status,
        riskLevel,
        physicalProgressPercent: physicalProgress,
        spentAmountLakhs: spentAmount,
        note: auditorNote || `Auditor updated status to ${status} with ${physicalProgress}% progress.`,
        actor: 'Ayush Borade (MoSPI Nodal Auditor)',
      });

      addToast('success', `Project ${project.projectId} updated successfully`);
      onUpdated(updated);
      onClose();
    } catch (err) {
      addToast('error', 'Failed to update project status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Project Status: ${project.projectId}`}
      subtitle="Modify physical progress, risk tier, or administrative milestone"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Execution Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 bg-white"
            >
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
              <option value="Sanctioned">Sanctioned</option>
              <option value="Proposed">Proposed</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Risk Oversight Tier</label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 bg-white"
            >
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Physical Progress ({physicalProgress}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={physicalProgress}
              onChange={(e) => setPhysicalProgress(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Expenditure Incurred (₹ Lakhs)
            </label>
            <input
              type="number"
              step="0.01"
              value={spentAmount}
              onChange={(e) => setSpentAmount(parseFloat(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded px-3 py-1.5 font-mono text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Audit Note / Ground Inspection Remark *
          </label>
          <textarea
            rows={3}
            required
            value={auditorNote}
            onChange={(e) => setAuditorNote(e.target.value)}
            placeholder="Document reasons for delay, material reconciliation, or contractor status..."
            className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
          >
            {submitting ? 'Saving Changes...' : 'Commit Status Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
