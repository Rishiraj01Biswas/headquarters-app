export type LifeBucket = 
  | 'Career' 
  | 'Health' 
  | 'Personal' 
  | 'Finance' 
  | 'Relationships'
  | 'Job'
  | 'Business'
  | 'Fitness'
  | 'Family & Friends'
  | 'Study'
  | 'Admin';

export type CognitiveLoad = 'Flow State' | 'Quick' | 'Easy' | 'Personal';

export type EisenhowerQuadrant = 'do_first' | 'schedule' | 'delegate' | 'eliminate';

export interface Task {
  id: string;
  title: string;
  projectId?: string;
  bucket: LifeBucket;
  isUrgent: boolean;
  isImportant: boolean;
  quadrant: EisenhowerQuadrant;
  cognitiveLoad?: CognitiveLoad;
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

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  durationMinutes: number;
  timestamp: string; // ISO date
  cognitiveLoad?: CognitiveLoad;
  movesTheNeedle?: boolean;
}
