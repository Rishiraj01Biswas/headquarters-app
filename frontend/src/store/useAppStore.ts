import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Project, Note, EisenhowerQuadrant } from '../types';

interface AppState {
  tasks: Task[];
  projects: Project[];
  notes: Note[];
  addTask: (task: Omit<Task, 'id' | 'quadrant' | 'completed' | 'timeSpentMinutes'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  moveTaskQuadrant: (id: string, quadrant: EisenhowerQuadrant) => void;
  logTime: (id: string, minutes: number) => void;
  addProject: (title: string, bucket: Project['bucket'], bottlenecks?: string[], notes?: string[]) => void;
  updateProject: (id: string, updatedFields: Partial<Omit<Project, 'id'>>) => void;
  deleteProject: (id: string) => void;
  addNote: (title: string, content: string, bucket: Note['bucket']) => void;
  deleteNote: (id: string) => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
}

const resolveQuadrant = (isUrgent: boolean, isImportant: boolean): EisenhowerQuadrant => {
  if (isUrgent && isImportant) return 'do_first';
  if (!isUrgent && isImportant) return 'schedule';
  if (isUrgent && !isImportant) return 'delegate';
  return 'eliminate';
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [
        {
          id: '1',
          title: 'Batch Make 10 Social Posts',
          bucket: 'Career',
          isUrgent: true,
          isImportant: true,
          quadrant: 'do_first',
          isFrog: true,
          movesTheNeedle: true,
          completed: false,
          timeSpentMinutes: 0,
        },
        {
          id: '2',
          title: 'Upload New Blog',
          bucket: 'Career',
          isUrgent: false,
          isImportant: false,
          quadrant: 'eliminate',
          isFrog: false,
          movesTheNeedle: false,
          completed: false,
          timeSpentMinutes: 0,
        },
      ],
      projects: [
        {
          id: 'p1',
          title: 'Get a New Job',
          bucket: 'Career',
          status: 'In Progress',
          bottlenecks: ['Portfolio review pending'],
          notes: ['Target remote roles or Tier-1 tech hubs'],
        },
      ],
      notes: [
        {
          id: 'n1',
          title: 'System Architecture Checklist',
          content: 'Clean decoupled components with typed stores and local storage fallback.',
          bucket: 'Career',
          createdAt: new Date().toISOString(),
        },
      ],
      addTask: (newTask) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...newTask,
              id: Date.now().toString(),
              quadrant: resolveQuadrant(newTask.isUrgent, newTask.isImportant),
              completed: false,
              timeSpentMinutes: 0,
            },
          ],
        })),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      moveTaskQuadrant: (id, quadrant) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  quadrant,
                  isUrgent: quadrant === 'do_first' || quadrant === 'delegate',
                  isImportant: quadrant === 'do_first' || quadrant === 'schedule',
                }
              : t
          ),
        })),
      logTime: (id, minutes) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, timeSpentMinutes: (t.timeSpentMinutes || 0) + minutes } : t
          ),
        })),
      addProject: (title, bucket, bottlenecks = [], notes = []) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              id: Date.now().toString(),
              title,
              bucket,
              status: 'In Progress',
              bottlenecks,
              notes,
            },
          ],
        })),
      updateProject: (id, updatedFields) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updatedFields } : p
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),
      addNote: (title, content, bucket) =>
        set((state) => ({
          notes: [
            ...state.notes,
            { id: Date.now().toString(), title, content, bucket, createdAt: new Date().toISOString() },
          ],
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),
      exportData: () => {
        const state = get();
        const exportObject = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          tasks: state.tasks,
          projects: state.projects,
          notes: state.notes,
        };
        const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `headquarters-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      importData: (jsonData: string) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (Array.isArray(parsed.tasks) && Array.isArray(parsed.projects)) {
            set({
              tasks: parsed.tasks,
              projects: parsed.projects,
              notes: Array.isArray(parsed.notes) ? parsed.notes : [],
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'headquarters-storage',
    }
  )
);
