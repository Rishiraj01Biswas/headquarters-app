import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, FileText, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Project, LifeBucket } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

const BUCKETS: LifeBucket[] = ['Career', 'Health', 'Personal', 'Finance', 'Relationships'];
const STATUSES: Project['status'][] = ['Not Started', 'In Progress', 'Blocked', 'Completed'];

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, projectToEdit }) => {
  const { addProject, updateProject, deleteProject } = useAppStore();

  const [title, setTitle] = useState('');
  const [bucket, setBucket] = useState<LifeBucket>('Career');
  const [status, setStatus] = useState<Project['status']>('In Progress');
  const [bottlenecksText, setBottlenecksText] = useState('');
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setBucket(projectToEdit.bucket);
      setStatus(projectToEdit.status);
      setBottlenecksText((projectToEdit.bottlenecks || []).join('\n'));
      setNotesText((projectToEdit.notes || []).join('\n'));
    } else {
      setTitle('');
      setBucket('Career');
      setStatus('In Progress');
      setBottlenecksText('');
      setNotesText('');
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const bottlenecks = bottlenecksText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const notes = notesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (projectToEdit) {
      updateProject(projectToEdit.id, {
        title,
        bucket,
        status,
        bottlenecks,
        notes,
      });
    } else {
      addProject(title, bucket, bottlenecks, notes);
    }
    onClose();
  };

  const handleDelete = () => {
    if (projectToEdit && window.confirm(`Delete project "${projectToEdit.title}"?`)) {
      deleteProject(projectToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {projectToEdit ? 'Edit Active Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Tree & Graph Algorithms"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Life Bucket
              </label>
              <select
                value={bucket}
                onChange={(e) => setBucket(e.target.value as LifeBucket)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {BUCKETS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Project['status'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Bottlenecks (1 per line)
            </label>
            <textarea
              rows={2}
              value={bottlenecksText}
              onChange={(e) => setBottlenecksText(e.target.value)}
              placeholder="e.g. Waiting on API credentials&#10;Need reference architecture review"
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono placeholder:font-sans"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              <FileText className="w-3.5 h-3.5" /> Reference Notes (1 per line)
            </label>
            <textarea
              rows={2}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="e.g. Target completion by end of next sprint"
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
            {projectToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-red-500 hover:text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-600/20 transition-all"
              >
                <Check className="w-4 h-4" /> {projectToEdit ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
