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
  addProject: (title: string, bucket: Project['bucket']) => void;
  addNote: (title: string, content: string, bucket: Note['bucket']) => void;
  deleteNote: (id: string) => void;
}

const resolveQuadrant = (isUrgent: boolean, isImportant: boolean): EisenhowerQuadrant => {
  if (isUrgent && isImportant) return 'do_first';
  if (!isUrgent && isImportant) return 'schedule';
  if (isUrgent && !isImportant) return 'delegate';
  return 'eliminate';
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
          notes: ['Target remote roles or Tier-1 tech hubs']
        },
      ],
      notes: [
        {
          id: 'n1',
          title: 'System Architecture Checklist',
          content: 'Clean decoupled components with typed stores and local storage fallback.',
          bucket: 'Career',
          createdAt: new Date().toISOString()
        }
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
      addProject: (title, bucket) =>
        set((state) => ({
          projects: [
            ...state.projects,
            { id: Date.now().toString(), title, bucket, status: 'In Progress', bottlenecks: [], notes: [] },
          ],
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
    }),
    {
      name: 'headquarters-storage',
    }
  )
);
