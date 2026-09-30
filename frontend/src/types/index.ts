export type LifeBucket = 'Career' | 'Health' | 'Personal' | 'Finance' | 'Relationships';

export type EisenhowerQuadrant = 'do_first' | 'schedule' | 'delegate' | 'eliminate';

export interface Task {
  id: string;
  title: string;
  projectId?: string;
  bucket: LifeBucket;
  isUrgent: boolean;
  isImportant: boolean;
  quadrant: EisenhowerQuadrant;
  isFrog: boolean;
  movesTheNeedle: boolean;
  completed: boolean;
  dueDate?: string;
  timeSpentMinutes: number;
}

export interface Project {
  id: string;
  title: string;
  bucket: LifeBucket;
  status: 'Not Started' | 'In Progress' | 'Blocked' | 'Completed';
  targetDate?: string;
  bottlenecks?: string[];
  notes?: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  bucket: LifeBucket;
  createdAt: string;
}
