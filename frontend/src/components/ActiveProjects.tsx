import React, { useState } from 'react';
import { Briefcase, AlertCircle, FileText, ChevronRight, Plus, Edit2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { LifeBucket, Project } from '../types';
import { ProjectModal } from './ProjectModal';

interface ActiveProjectsProps {
  currentBucket: LifeBucket | 'All';
}

export const ActiveProjects: React.FC<ActiveProjectsProps> = ({ currentBucket }) => {
  const { projects } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(
    (p) => currentBucket === 'All' || p.bucket === currentBucket
  );

  const handleOpenEdit = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Active Projects</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {filteredProjects.length}
            </span>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
            <p className="text-sm text-neutral-500">No active projects in this bucket.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              + Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpenEdit(project)}
                className="group relative p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
                      {project.bucket}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          project.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : project.status === 'Blocked'
                            ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                            : project.status === 'Not Started'
                            ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                        }`}
                      >
                        {project.status}
                      </span>
                      <Edit2 className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  <h3 className="font-semibold text-base text-neutral-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {project.title}
                  </h3>

                  {project.bottlenecks && project.bottlenecks.length > 0 && (
                    <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400 mb-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Bottlenecks</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-neutral-700 dark:text-neutral-300">
                        {project.bottlenecks.map((b, idx) => (
                          <li key={idx} className="truncate">{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.notes && project.notes.length > 0 && (
                    <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {project.notes.map((note, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{note}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400 group-hover:text-indigo-500 transition-colors">
                  <span>Click to edit or manage</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectToEdit={selectedProject}
      />
    </>
  );
};
