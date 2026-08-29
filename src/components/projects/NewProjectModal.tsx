import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Project, Sector } from '../../types';
import { projectService } from '../../services/projectService';
import { useApp } from '../../context/AppContext';
import { mockStatesData, stateDistrictsMap } from '../../data/mockStates';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const { addToast } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    workDescription: '',
    mpName: '',
    state: 'Uttar Pradesh',
    district: 'Gorakhpur',
    constituency: 'Gorakhpur',
    sector: 'Infrastructure' as Sector,
    implementingAgency: 'District Public Works Department',
    financialYear: '2023-2024',
    sanctionedAmountLakhs: 50.0,
    releasedAmountLakhs: 25.0,
    spentAmountLakhs: 0,
    status: 'Sanctioned' as const,
    riskScore: 20,
    riskLevel: 'Low' as const,
    recommendationDate: new Date().toISOString().split('T')[0],
    sanctionDate: new Date().toISOString().split('T')[0],
    latitude: 26.7606,
    longitude: 83.3732,
  });

  const [submitting, setSubmitting] = useState(false);

  const districts = stateDistrictsMap[formData.state] || ['Default District'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.mpName.trim()) {
      addToast('error', 'Please fill in all mandatory project fields');
      return;
    }

    setSubmitting(true);
    try {
      const randomIdNum = Math.floor(1000 + Math.random() * 9000);
      const stateCode = formData.state.substring(0, 2).toUpperCase();
      const newProject = await projectService.createProject({
        ...formData,
        projectId: `PRJ-24-${randomIdNum}`,
        refCode: `MP/${stateCode}/${Math.floor(10 + Math.random() * 80)}/2024`,
        physicalProgressPercent: 0,
        fundUtilizationPercent: 0,
      });

      addToast('success', `Project ${newProject.projectId} created successfully`);
      onProjectCreated(newProject);
      onClose();
    } catch (err) {
      addToast('error', 'Failed to create project record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New MPLADS Allocation"
      subtitle="Register recommended scheme for technical & administrative sanction"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Project Title / Work Name *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Construction of Community Center at Ward 5"
            className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Work Description</label>
          <textarea
            rows={2}
            value={formData.workDescription}
            onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
            placeholder="Detailed scope of physical deliverables and beneficiary communities..."
            className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Recommending MP *</label>
            <input
              type="text"
              required
              value={formData.mpName}
              onChange={(e) => setFormData({ ...formData, mpName: e.target.value })}
              placeholder="e.g. Ravi Kishan"
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sector *</label>
            <select
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector })}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="Infrastructure">Infrastructure</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Energy">Energy</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Community Facilities">Community Facilities</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">State *</label>
            <select
              value={formData.state}
              onChange={(e) => {
                const newState = e.target.value;
                const dList = stateDistrictsMap[newState] || ['Default'];
                setFormData({
                  ...formData,
                  state: newState,
                  district: dList[0],
                  constituency: dList[0],
                });
              }}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {mockStatesData.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">District *</label>
            <select
              value={formData.district}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  district: e.target.value,
                  constituency: e.target.value,
                })
              }
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Implementing Agency</label>
            <input
              type="text"
              value={formData.implementingAgency}
              onChange={(e) => setFormData({ ...formData, implementingAgency: e.target.value })}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Sanctioned Amount (₹ Lakhs) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.sanctionedAmountLakhs}
              onChange={(e) =>
                setFormData({ ...formData, sanctionedAmountLakhs: parseFloat(e.target.value) || 0 })
              }
              className="w-full border border-slate-300 rounded px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Released Tranche 1 (₹ Lakhs)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.releasedAmountLakhs}
              onChange={(e) =>
                setFormData({ ...formData, releasedAmountLakhs: parseFloat(e.target.value) || 0 })
              }
              className="w-full border border-slate-300 rounded px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
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
            {submitting ? 'Creating Project...' : 'Register Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
