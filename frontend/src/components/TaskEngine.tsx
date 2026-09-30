import React, { useState } from 'react';
import { 
  Target, Calendar as CalendarIcon, Users, Trash2, CheckCircle2, Circle, 
  Play, Zap, Brain, Coffee, User, ArrowUpDown, LayoutGrid, Layers, SunMedium
} from 'lucide-react';
import type { Task, CognitiveLoad, EisenhowerQuadrant } from '../types';

interface TaskEngineProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, q: EisenhowerQuadrant) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  activeTaskId: string | null;
  onStartTimer: (id: string) => void;
  itemClasses: string;
  cardClasses: string;
}

type TabType = 'order' | 'matrix' | 'state' | 'contexts' | 'tomorrow';

export const TaskEngine: React.FC<TaskEngineProps> = ({
  tasks,
  onToggle,
  onDelete,
  onMove,
  onUpdateTask,
  activeTaskId,
  onStartTimer,
  itemClasses,
  cardClasses
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('order');
  const [selectedStateFilter, setSelectedStateFilter] = useState<CognitiveLoad | 'All'>('All');

  const quadrantScore: Record<EisenhowerQuadrant, number> = {
    do_first: 4,
    schedule: 3,
    delegate: 2,
    eliminate: 1
  };

  const getSortedTasks = (items: Task[]) => {
    return [...items].sort((a, b) => {
      if (a.isFrog !== b.isFrog) return a.isFrog ? -1 : 1;
      const qDiff = (quadrantScore[b.quadrant] || 0) - (quadrantScore[a.quadrant] || 0);
      if (qDiff !== 0) return qDiff;
      if (a.movesTheNeedle !== b.movesTheNeedle) return a.movesTheNeedle ? -1 : 1;
      return 0;
    });
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const sortedPendingTasks = getSortedTasks(pendingTasks);

  const getCognitiveBadge = (task: Task) => {
    const load = task.cognitiveLoad;
    if (!load) {
      return (
        <button
          onClick={() => onUpdateTask(task.id, { cognitiveLoad: 'Flow State' })}
          className="text-[10px] text-neutral-400 hover:text-neutral-200 border border-dashed border-neutral-600 rounded px-1.5 py-0.5"
          title="Tag Cognitive Load"
        >
          + Load
        </button>
      );
    }

    const configs: Record<CognitiveLoad, { label: string; icon: any; color: string; next: CognitiveLoad }> = {
      'Flow State': { label: 'Flow', icon: Brain, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', next: 'Quick' },
      'Quick': { label: '≤5m', icon: Zap, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', next: 'Easy' },
      'Easy': { label: 'Easy', icon: Coffee, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', next: 'Personal' },
      'Personal': { label: 'Personal', icon: User, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', next: 'Flow State' }
    };

    const cfg = configs[load];
    const Icon = cfg.icon;

    return (
      <button
        onClick={() => onUpdateTask(task.id, { cognitiveLoad: cfg.next })}
        className={`flex items-center gap-1 text-[10px] border px-1.5 py-0.5 rounded font-medium ${cfg.color}`}
        title={`Cognitive Load: ${load} (Click to cycle)`}
      >
        <Icon className="w-3 h-3" />
        <span>{cfg.label}</span>
      </button>
    );
  };

  const renderTaskItem = (task: Task) => (
    <div
      key={task.id}
      className={`p-3 border rounded-lg flex items-center justify-between gap-3 transition-colors group ${itemClasses}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          onClick={() => onToggle(task.id)}
          className="text-neutral-400 hover:text-emerald-500 flex-shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>
        <div className="truncate">
          <p className={`text-sm truncate ${task.completed ? 'line-through text-neutral-400' : ''}`}>
            {task.title}
          </p>
          <div className="flex gap-2 items-center mt-1">
            <span className="text-[10px] text-neutral-400 font-mono uppercase">{task.bucket}</span>
            {task.isFrog && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-medium">
                🐸 FROG
              </span>
            )}
            {task.movesTheNeedle && (
              <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.2 rounded font-medium">
                80/20
              </span>
            )}
            {task.timeSpentMinutes > 0 && (
              <span className="text-[10px] text-neutral-400 font-mono">{task.timeSpentMinutes}m</span>
            )}
            {getCognitiveBadge(task)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <select
          value={task.quadrant}
          onChange={(e) => onMove(task.id, e.target.value as EisenhowerQuadrant)}
          className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-[10px] text-neutral-500 rounded px-1.5 py-1 focus:outline-none"
          title="Reshuffle Quadrant"
        >
          <option value="do_first">Do First</option>
          <option value="schedule">Schedule</option>
          <option value="delegate">Delegate</option>
          <option value="eliminate">Don't Do</option>
        </select>

        <button
          onClick={() => onStartTimer(task.id)}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700/50 transition-colors ${
            activeTaskId === task.id ? 'text-emerald-500' : 'text-neutral-400'
          }`}
          title="Start Focus Timer"
        >
          <Play className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 transition-all"
          title="Delete Task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('order')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'order'
                ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Order (Priority)</span>
            <span className="text-[10px] opacity-75 font-mono">({pendingTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'matrix'
                ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Matrix (4Q)</span>
          </button>

          <button
            onClick={() => setActiveTab('state')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'state'
                ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>State (Cognitive)</span>
          </button>

          <button
            onClick={() => setActiveTab('contexts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'contexts'
                ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Contexts (Buckets)</span>
          </button>

          <button
            onClick={() => setActiveTab('tomorrow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'tomorrow'
                ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <SunMedium className="w-3.5 h-3.5" />
            <span>Tomorrow & Plan</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ORDER (AUTO-SORTED QUEUE) */}
      {activeTab === 'order' && (
        <div className={`p-4 border rounded-xl space-y-3 ${cardClasses}`}>
          <div className="flex justify-between items-center text-xs text-neutral-400 pb-2 border-b border-neutral-800">
            <span>⚡ Auto-Ranked Execution Queue (Frogs &gt; Do First &gt; Schedule)</span>
            <span className="font-mono">{sortedPendingTasks.length} active</span>
          </div>
          {sortedPendingTasks.length === 0 ? (
            <p className="text-neutral-400 text-xs italic py-4 text-center">No active tasks remaining. Clean slate!</p>
          ) : (
            <div className="space-y-2">
              {sortedPendingTasks.map(renderTaskItem)}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EISENHOWER MATRIX 4Q GRID */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`border border-amber-500/30 rounded-xl p-4 ${cardClasses}`}>
            <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs">
                <Target className="w-4 h-4" /> Urgent &amp; Important (Do First)
              </div>
              <span className="text-xs text-neutral-400">
                {tasks.filter(t => t.quadrant === 'do_first' && !t.completed).length}
              </span>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.quadrant === 'do_first' && !t.completed).map(renderTaskItem)}
            </div>
          </div>

          <div className={`border border-blue-500/30 rounded-xl p-4 ${cardClasses}`}>
            <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                <CalendarIcon className="w-4 h-4" /> Not Urgent &amp; Important (Schedule)
              </div>
              <span className="text-xs text-neutral-400">
                {tasks.filter(t => t.quadrant === 'schedule' && !t.completed).length}
              </span>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.quadrant === 'schedule' && !t.completed).map(renderTaskItem)}
            </div>
          </div>

          <div className={`border border-purple-500/30 rounded-xl p-4 ${cardClasses}`}>
            <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <Users className="w-4 h-4" /> Urgent &amp; Not Important (Delegate)
              </div>
              <span className="text-xs text-neutral-400">
                {tasks.filter(t => t.quadrant === 'delegate' && !t.completed).length}
              </span>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.quadrant === 'delegate' && !t.completed).map(renderTaskItem)}
            </div>
          </div>

          <div className={`border border-neutral-700/50 rounded-xl p-4 ${cardClasses}`}>
            <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-neutral-400 font-semibold text-xs">
                <Trash2 className="w-4 h-4" /> Not Urgent &amp; Not Important (Don't Do)
              </div>
              <span className="text-xs text-neutral-400">
                {tasks.filter(t => t.quadrant === 'eliminate' && !t.completed).length}
              </span>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.quadrant === 'eliminate' && !t.completed).map(renderTaskItem)}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATE (COGNITIVE LOAD FILTER) */}
      {activeTab === 'state' && (
        <div className={`p-4 border rounded-xl space-y-4 ${cardClasses}`}>
          <div className="flex flex-wrap gap-2 pb-3 border-b border-neutral-800">
            {(['All', 'Flow State', 'Quick', 'Easy', 'Personal'] as const).map(state => (
              <button
                key={state}
                onClick={() => setSelectedStateFilter(state)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedStateFilter === state
                    ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
                    : 'bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {state}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {pendingTasks
              .filter(t => selectedStateFilter === 'All' || t.cognitiveLoad === selectedStateFilter)
              .map(renderTaskItem)}
          </div>
        </div>
      )}

      {/* TAB 4: CONTEXTS (GROUPED BY LIFE BUCKET) */}
      {activeTab === 'contexts' && (
        <div className="space-y-4">
          {Array.from(new Set(pendingTasks.map(t => t.bucket))).map(bucket => {
            const bucketTasks = pendingTasks.filter(t => t.bucket === bucket);
            return (
              <div key={bucket} className={`p-4 border rounded-xl space-y-2 ${cardClasses}`}>
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <h3 className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider">{bucket}</h3>
                  <span className="text-xs text-neutral-400 font-mono">{bucketTasks.length} pending</span>
                </div>
                <div className="space-y-2">
                  {bucketTasks.map(renderTaskItem)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: TOMORROW & UNPLANNED */}
      {activeTab === 'tomorrow' && (
        <div className={`p-4 border rounded-xl space-y-3 ${cardClasses}`}>
          <div className="flex justify-between items-center text-xs text-neutral-400 pb-2 border-b border-neutral-800">
            <span>📅 Upcoming &amp; Future Backlog Tasks</span>
            <span className="font-mono">
              {tasks.filter(t => !t.completed && (!t.dueDate || t.dueDate > new Date().toISOString().split('T')[0])).length} tasks
            </span>
          </div>
          <div className="space-y-2">
            {tasks
              .filter(t => !t.completed && (!t.dueDate || t.dueDate > new Date().toISOString().split('T')[0]))
              .map(renderTaskItem)}
          </div>
        </div>
      )}
    </div>
  );
};
