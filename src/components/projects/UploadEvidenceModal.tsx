import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Project } from '../../types';
import { projectService } from '../../services/projectService';
import { useApp } from '../../context/AppContext';
import { UploadCloud, Camera, MapPin, Check } from 'lucide-react';

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onEvidenceAdded: (updated: Project) => void;
}

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  isOpen,
  onClose,
  project,
  onEvidenceAdded,
}) => {
  const { addToast } = useApp();
  const [title, setTitle] = useState('Plinth Foundation Concrete Inspection');
  const [description, setDescription] = useState(
    'Geotagged high-resolution inspection snapshot of completed foundation trenches and reinforcement bars.'
  );
  const [verifiedBy, setVerifiedBy] = useState('Ramesh K. (District Field Auditor)');
  const [previewUrl, setPreviewUrl] = useState(
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80'
  );
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      addToast('info', `Loaded image file: ${file.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await projectService.addEvidencePhoto(project.projectId, {
        title,
        description,
        imageUrl: previewUrl,
        verifiedBy,
      });

      addToast('success', 'Geotagged site inspection photo verified and attached');
      onEvidenceAdded(updated);
      onClose();
    } catch (err) {
      addToast('error', 'Failed to upload evidence');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Geotagged Site Evidence"
      subtitle={`Project: ${project.projectId} - ${project.district}, ${project.state}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Drag and drop or file selector */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Site Photo / Drone Inspection Capture *
          </label>
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-4 text-center bg-slate-50 transition-colors">
            {previewUrl ? (
              <div className="space-y-2">
                <img
                  src={previewUrl}
                  alt="Site Evidence Preview"
                  className="max-h-40 mx-auto rounded object-cover border border-slate-200"
                />
                <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-medium">
                  <Check className="w-4 h-4" />
                  <span>GPS Metadata Encoded: {project.latitude.toFixed(4)}° N, {project.longitude.toFixed(4)}° E</span>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-medium text-slate-700">Drag inspection photos here or click to browse</p>
                <p className="text-[11px] text-slate-500 mt-1">Supports JPG, PNG with EXIF GPS coordinates</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="mt-2 text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Evidence Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Inspector Verification Note</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Verified By (Auditor Name)</label>
          <input
            type="text"
            value={verifiedBy}
            onChange={(e) => setVerifiedBy(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-1.5 text-slate-800"
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
            {submitting ? 'Verifying Coordinates...' : 'Submit Verified Evidence'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
