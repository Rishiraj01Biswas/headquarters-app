import { TaskEngine } from "./components/TaskEngine";
import { ProjectModal } from "./components/ProjectModal";
import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { 
  Circle, Flame, Calendar as CalendarIcon, 
  Trash2, Square, Plus, BookOpen, 
  X, Check, AlertTriangle, TrendingUp, Clock, Filter, Layers, Zap,
  FileText, ArrowRight, FolderPlus, Sun, Download, Upload, Moon, ChevronLeft, ChevronRight,
  History, Compass
} from 'lucide-react';
import type { LifeBucket, Project } from './types';
import { 
  format, addDays, isSameDay, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths,
  isBefore, startOfDay
} from 'date-fns';

const BUCKETS: (LifeBucket | 'All')[] = ['All', 'Career', 'Health', 'Personal', 'Finance', 'Relationships'];
const STATES_OF_MIND = ['Deep Work', 'Flow State', 'Admin / Logistics', 'Creative & Research', 'Recovery / Low Energy'];

export default function App() {
  const { 
    tasks, projects, notes, toggleTask, addTask, deleteTask,
    updateTask, 
    logTime, addProject, addNote, deleteNote, moveTaskQuadrant 
  } = useAppStore();
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Calendar View
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('month');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterBySelectedDate, setFilterBySelectedDate] = useState(false);

  // State of Mind per date
  const [stateOfMindMap, setStateOfMindMap] = useState<Record<string, string>>({
    [format(new Date(), 'yyyy-MM-dd')]: 'Deep Work'
  });

  // Timer state
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Modals & Panels
  const [showModal, setShowModal] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [activeProjectModal, setActiveProjectModal] = useState<Project | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Scope filter
  const [selectedBucket, setSelectedBucket] = useState<LifeBucket | 'All'>('All');

  // Task form state
  const [title, setTitle] = useState('');
  const [bucket, setBucket] = useState<LifeBucket>('Career');
  const [projectId, setProjectId] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [isFrog, setIsFrog] = useState(false);
  const [movesTheNeedle, setMovesTheNeedle] = useState(false);

  // Project form state
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectBucket, setNewProjectBucket] = useState<LifeBucket>('Career');

  // Note form state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Bottleneck & Journal
  const [bottleneckInput, setBottleneckInput] = useState('');
  const [bottlenecks, setBottlenecks] = useState<string[]>([
    'Context switching between multiple tabs',
    'Waiting on external client feedback'
  ]);
  const [journalReflection, setJournalReflection] = useState('');

  // Date ranges
  const today = startOfDay(new Date());
  const daysStrip = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const activeDateKey = format(selectedDate, 'yyyy-MM-dd');
  const isSelectedDatePast = isBefore(startOfDay(selectedDate), today);
  const isSelectedDateToday = isSameDay(selectedDate, today);
  const currentStateOfMind = stateOfMindMap[activeDateKey] || 'Deep Work';

  const updateStateOfMind = (newFlow: string) => {
    setStateOfMindMap(prev => ({ ...prev, [activeDateKey]: newFlow }));
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (activeTaskId) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTaskId]);

  const handleStopTimer = () => {
    if (activeTaskId && secondsElapsed > 0) {
      const minutes = Math.max(1, Math.round(secondsElapsed / 60));
      logTime(activeTaskId, minutes);
    }
    setActiveTaskId(null);
    setSecondsElapsed(0);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title,
      bucket,
      projectId: projectId || undefined,
      isUrgent,
      isImportant,
      isFrog,
      movesTheNeedle,
      dueDate: format(selectedDate, 'yyyy-MM-dd')
    });
    setTitle('');
    setProjectId('');
    setIsUrgent(false);
    setIsImportant(false);
    setIsFrog(false);
    setMovesTheNeedle(false);
    setShowModal(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    addProject(newProjectTitle.trim(), newProjectBucket);
    setNewProjectTitle('');
    setShowNewProjectModal(false);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    addNote(newNoteTitle.trim(), newNoteContent.trim(), selectedBucket === 'All' ? 'Career' : selectedBucket);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleAddBottleneck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bottleneckInput.trim()) return;
    setBottlenecks([...bottlenecks, bottleneckInput.trim()]);
    setBottleneckInput('');
  };

  // Filter tasks
  const filteredTasks = tasks
    .filter(t => (selectedBucket === 'All' ? true : t.bucket === selectedBucket))
    .filter(t => (!filterBySelectedDate ? true : t.dueDate === format(selectedDate, 'yyyy-MM-dd')));

  const filteredProjects = selectedBucket === 'All'
    ? projects 
    : projects.filter(p => p.bucket === selectedBucket);

  const filteredNotes = selectedBucket === 'All'
    ? notes
    : notes.filter(n => n.bucket === selectedBucket);

  // Selected date stats
  const selectedDateTasks = tasks.filter(t => t.dueDate === activeDateKey);
  const selectedDateCompleted = selectedDateTasks.filter(t => t.completed);
  const selectedDatePending = selectedDateTasks.filter(t => !t.completed);
  const selectedDateMinutes = selectedDateTasks.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0);
  const selectedDateNeedleMovers = selectedDateCompleted.filter(t => t.movesTheNeedle);

  // Derived tasks
  const frogs = filteredTasks.filter((t) => t.isFrog && !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const needleMoversCompleted = completedTasks.filter((t) => t.movesTheNeedle);
  
        
  const totalMinutesTracked = tasks.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0);
  const minutesByBucket = (['Career', 'Health', 'Personal', 'Finance', 'Relationships'] as LifeBucket[]).map(b => ({
    bucket: b,
    minutes: tasks.filter(t => t.bucket === b).reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0)
  })).filter(item => item.minutes > 0);

  // Theme styles
  const themeClasses = isDarkMode 
    ? 'bg-neutral-950 text-neutral-100' 
    : 'bg-[#f8f9fa] text-neutral-900';
  const cardClasses = isDarkMode 
    ? 'bg-neutral-900/60 border-neutral-800' 
    : 'bg-white border-neutral-200 shadow-sm';
  const itemClasses = isDarkMode 
    ? 'bg-neutral-800/50 border-neutral-800 text-neutral-200' 
    : 'bg-neutral-50/80 border-neutral-200 text-neutral-800';

  return (
    <div className={`min-h-screen ${themeClasses} p-6 lg:p-8 font-sans transition-colors duration-200`}>
      {/* Top Header */}
      <header className={`mb-6 border-b pb-5 flex flex-wrap justify-between items-center gap-4 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Headquarters</h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
              Live & Synced
            </span>
          </div>
          <p className={`${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'} text-sm mt-1`}>
            Second Brain & High-Impact Productivity System
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border transition-all ${
              isDarkMode 
                ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-amber-400' 
                : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 shadow-sm'
            }`}
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <button 
            onClick={() => setShowNotesDrawer(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800' : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700 shadow-sm'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-500" /> Notes ({filteredNotes.length})
          </button>

          <button 
            onClick={() => setShowReview(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800' : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700 shadow-sm'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" /> Dynamic Review
            {completedTasks.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-400/20 text-amber-600 rounded-full text-xs font-mono font-bold">
                {completedTasks.length}
              </span>
            )}
          </button>
          
          {/* Backup & Restore Controls */}
          <div className="flex items-center gap-1 border-r pr-2.5 mr-0.5 border-neutral-700/30">
            <button
              onClick={() => useAppStore.getState().exportData()}
              className={`p-2 rounded-lg border transition-all ${
                isDarkMode 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-emerald-400' 
                  : 'bg-white border-neutral-200 text-neutral-600 hover:text-emerald-600 shadow-sm'
              }`}
              title="Backup Workspace (Export JSON)"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              className={`p-2 rounded-lg border cursor-pointer transition-all ${
                isDarkMode 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-sky-400' 
                  : 'bg-white border-neutral-200 text-neutral-600 hover:text-sky-600 shadow-sm'
              }`}
              title="Restore Workspace (Import JSON)"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const text = event.target?.result as string;
                    if (text) {
                      const success = useAppStore.getState().importData(text);
                      if (success) {
                        alert("Workspace restored successfully!");
                      } else {
                        alert("Invalid backup file format.");
                      }
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </header>

      {/* Scope Filter Bar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className={`text-xs uppercase tracking-wider font-mono mr-2 flex items-center gap-1.5 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
            <Filter className="w-3.5 h-3.5" /> Scope:
          </span>
          {BUCKETS.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBucket(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedBucket === b
                  ? (isDarkMode ? 'bg-neutral-100 text-neutral-900 font-semibold shadow' : 'bg-neutral-900 text-neutral-100 font-semibold shadow-sm')
                  : (isDarkMode ? 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-neutral-800' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 shadow-sm')
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <button
          onClick={() => setFilterBySelectedDate(!filterBySelectedDate)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            filterBySelectedDate 
              ? 'bg-indigo-600/10 border-indigo-500 text-indigo-600 font-semibold shadow-sm' 
              : (isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-neutral-200 text-neutral-600 shadow-sm')
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          {filterBySelectedDate ? `Filtered: ${format(selectedDate, 'MMM d')}` : 'Show All Days'}
        </button>
      </div>

      {/* Monthly Planning & Retrospective Engine */}
      <section className={`mb-6 border rounded-xl p-5 ${cardClasses}`}>
        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider font-mono text-indigo-600">
              <CalendarIcon className="w-4 h-4" />
              {calendarView === 'week' ? '7-Day Planning & Flow' : format(currentMonth, 'MMMM yyyy')}
            </div>
            
            <div className={`flex items-center gap-1 p-0.5 rounded border text-[11px] ${isDarkMode ? 'bg-neutral-800/40 border-neutral-700/50' : 'bg-neutral-100 border-neutral-200'}`}>
              <button 
                onClick={() => setCalendarView('week')}
                className={`px-2 py-0.5 rounded ${calendarView === 'week' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setCalendarView('month')}
                className={`px-2 py-0.5 rounded ${calendarView === 'month' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                Month
              </button>
            </div>

            {calendarView === 'month' && (
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className={`p-1 rounded border ${isDarkMode ? 'border-neutral-800 hover:bg-neutral-800' : 'border-neutral-200 hover:bg-neutral-100'}`}>
                  <ChevronLeft className="w-3.5 h-3.5 text-neutral-500" />
                </button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className={`p-1 rounded border ${isDarkMode ? 'border-neutral-800 hover:bg-neutral-800' : 'border-neutral-200 hover:bg-neutral-100'}`}>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                </button>
              </div>
            )}
          </div>

          {/* Interactive State of Mind Tab */}
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className={isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}>State of Mind ({format(selectedDate, 'MMM d')}):</span>
            <select
              value={currentStateOfMind}
              onChange={(e) => updateStateOfMind(e.target.value)}
              className={`text-xs rounded px-2.5 py-1 border font-medium focus:outline-none ${
                isDarkMode 
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-200' 
                  : 'bg-white border-neutral-300 text-neutral-800 shadow-sm'
              }`}
            >
              {STATES_OF_MIND.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Date Context Banner (Future Plan vs. Retrospective Audit) */}
        <div className={`mb-4 p-3 rounded-lg border flex flex-wrap justify-between items-center gap-3 text-xs ${
          isSelectedDatePast 
            ? (isDarkMode ? 'bg-amber-500/5 border-amber-500/20 text-amber-300' : 'bg-amber-50/70 border-amber-200 text-amber-900')
            : (isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50/70 border-indigo-200 text-indigo-900')
        }`}>
          <div className="flex items-center gap-2">
            {isSelectedDatePast ? (
              <>
                <History className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  <strong>Retrospective for {format(selectedDate, 'MMMM d, yyyy')}:</strong> {selectedDateCompleted.length} tasks completed ({selectedDateMinutes}m focus logged).
                </span>
              </>
            ) : isSelectedDateToday ? (
              <>
                <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>
                  <strong>Today ({format(selectedDate, 'MMM d')}):</strong> {selectedDatePending.length} pending commitments, {selectedDateCompleted.length} completed.
                </span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>
                  <strong>Future Plan for {format(selectedDate, 'MMMM d, yyyy')}:</strong> {selectedDatePending.length} planned task(s) scheduled.
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono">
            {selectedDateNeedleMovers.length > 0 && (
              <span className="bg-amber-500/20 text-amber-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                {selectedDateNeedleMovers.length} 80/20 Needle Movers Hit
              </span>
            )}
            <span className="text-[11px] opacity-80">Flow: {currentStateOfMind}</span>
          </div>
        </div>

        {/* Calendar Views */}
        {calendarView === 'week' ? (
          <div className="grid grid-cols-7 gap-2">
            {daysStrip.map((day, idx) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const dayTasks = tasks.filter(t => t.dueDate === format(day, 'yyyy-MM-dd'));
              const doneCount = dayTasks.filter(t => t.completed).length;
              const pendingCount = dayTasks.filter(t => !t.completed).length;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(day);
                    setFilterBySelectedDate(true);
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-sm' 
                      : (isDarkMode ? 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700' : 'border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/80')
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono">{format(day, 'EEE')}</span>
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                  </div>
                  <div className="text-base font-bold">{format(day, 'd')}</div>
                  <div className="flex gap-1.5 mt-1 text-[10px] font-mono">
                    {pendingCount > 0 && <span className="text-indigo-500">{pendingCount} plan</span>}
                    {doneCount > 0 && <span className="text-emerald-600 font-medium">✓{doneCount}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Dual-Mode Month Grid: Future Planning & Retrospective Log */
          <div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2 text-[11px] font-mono font-semibold text-neutral-400 uppercase">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {monthDays.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const isPast = isBefore(startOfDay(day), today);
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const dayTasks = tasks.filter(t => t.dueDate === format(day, 'yyyy-MM-dd'));
                const doneTasks = dayTasks.filter(t => t.completed);
                const pendingTasks = dayTasks.filter(t => !t.completed);
                const hasNeedle = doneTasks.some(t => t.movesTheNeedle);
                const dayMinutes = dayTasks.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0);

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(day);
                      setFilterBySelectedDate(true);
                    }}
                    className={`min-h-[74px] p-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                      isSelected 
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-900/20' 
                        : (isDarkMode ? 'border-neutral-800/80 bg-neutral-900/30 hover:border-neutral-700' : 'border-neutral-200 bg-white hover:border-neutral-300 shadow-sm')
                    } ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-bold ${isToday ? 'text-indigo-600 font-extrabold' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      <div className="flex items-center gap-1">
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Today"></span>}
                        {hasNeedle && <span className="text-[9px]" title="Needle Mover accomplished">⭐</span>}
                      </div>
                    </div>

                    {/* Dual Info: Retrospective Audit vs Planning Commitments */}
                    <div className="space-y-1 w-full mt-1">
                      {/* Retrospective Completed Badges */}
                      {doneTasks.length > 0 && (
                        <div className="flex items-center justify-between text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-medium">
                          <span>✓ {doneTasks.length} done</span>
                          {dayMinutes > 0 && <span>{dayMinutes}m</span>}
                        </div>
                      )}

                      {/* Future Planned Badges */}
                      {pendingTasks.length > 0 && (
                        <div className="text-[9px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono font-medium truncate">
                          {pendingTasks.length} {pendingTasks.length === 1 ? 'task' : 'tasks'}
                        </div>
                      )}

                      {dayTasks.length === 0 && isPast && isCurrentMonth && (
                        <span className="text-[9px] text-neutral-300 dark:text-neutral-600 font-mono block">
                          —
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <section className={`border rounded-xl p-5 ${cardClasses}`}>
            <div className="flex items-center gap-2 mb-4 text-emerald-600">
              <Flame className="w-5 h-5" />
              <h2 className="font-semibold text-sm">Eat The Frog (Daily #1)</h2>
            </div>
            {frogs.length === 0 ? (
              <p className="text-neutral-400 text-xs italic">No frogs pending in this scope.</p>
            ) : (
              <div className="space-y-2">
                {frogs.map((task) => (
                  <div key={task.id} className={`p-3 border rounded-lg flex items-center justify-between ${itemClasses}`}>
                    <span className="font-medium text-sm">{task.title}</span>
                    <button onClick={() => toggleTask(task.id)} className="text-neutral-400 hover:text-emerald-500">
                      <Circle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={`border rounded-xl p-5 ${cardClasses}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4 text-indigo-500" /> Active Projects
              </h2>
              <button 
                onClick={() => setShowNewProjectModal(true)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
            {filteredProjects.length === 0 ? (
              <p className="text-neutral-400 text-xs italic">No projects found for this bucket.</p>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map((proj) => (
                  <div 
                    key={proj.id} 
                    onClick={() => setActiveProjectModal(proj)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all group ${itemClasses}`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-sm group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        {proj.title} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <span className="text-[11px] text-indigo-600 font-mono bg-indigo-500/10 px-2 py-0.5 rounded font-medium">
                        {proj.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1 block font-mono">
                      {proj.bucket}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={`border rounded-xl p-5 ${cardClasses}`}>
            <h2 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" /> Focus Tracker
            </h2>
            {activeTaskId ? (
              <div className={`flex items-center justify-between p-3 rounded-lg border mb-4 ${itemClasses}`}>
                <div className="truncate mr-2">
                  <p className="text-xs text-neutral-500 truncate">
                    {tasks.find(t => t.id === activeTaskId)?.title || 'Tracking...'}
                  </p>
                  <p className="text-2xl font-mono text-emerald-600 font-bold">
                    {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <button 
                  onClick={handleStopTimer}
                  className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg"
                  title="Stop & Log Time"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-neutral-400 text-xs mb-4">Click play on any task to log focus minutes.</p>
            )}

            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
              <div className="flex justify-between text-xs text-neutral-500 mb-2">
                <span>Total Time Logged</span>
                <span className="font-mono font-bold text-emerald-600">{totalMinutesTracked}m</span>
              </div>
              <div className="space-y-1.5">
                {minutesByBucket.map(item => (
                  <div key={item.bucket} className="text-[11px] flex justify-between text-neutral-500">
                    <span>{item.bucket}</span>
                    <span className="font-mono text-neutral-700 dark:text-neutral-300 font-medium">{item.minutes}m</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Columns: Smart Task Engine */}
        <div className="lg:col-span-3">
          <TaskEngine
            tasks={filteredTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onMove={moveTaskQuadrant}
            onUpdateTask={updateTask}
            activeTaskId={activeTaskId}
            onStartTimer={setActiveTaskId}
            itemClasses={itemClasses}
            cardClasses={cardClasses}
          />
        </div>
      </div>

      {/* Slide-over Notes Drawer */}
      {showNotesDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className={`w-full max-w-md border-l h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <FileText className="w-5 h-5 text-sky-500" /> Notes & Resources
                </div>
                <button onClick={() => setShowNotesDrawer(false)} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNote} className={`space-y-3 p-3.5 rounded-xl border ${cardClasses}`}>
                <h4 className="text-xs font-semibold uppercase tracking-wide">Quick Note</h4>
                <input 
                  type="text" 
                  placeholder="Note Title..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none ${itemClasses}`}
                />
                <textarea 
                  rows={2}
                  placeholder="Content or link reference..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none ${itemClasses}`}
                />
                <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-1.5 rounded-lg text-xs">
                  Save Note
                </button>
              </form>

              <div className="space-y-3">
                {filteredNotes.map((n) => (
                  <div key={n.id} className={`p-3 rounded-xl border space-y-1 group ${itemClasses}`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-xs">{n.title}</h4>
                      <button onClick={() => deleteNote(n.id)} className="text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">{n.content}</p>
                    <span className="text-[10px] text-neutral-400 font-mono block uppercase pt-1">{n.bucket}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setShowNotesDrawer(false)} className="w-full py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Dynamic Review Drawer */}
      {showReview && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className={`w-full max-w-lg border-l h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <BookOpen className="w-5 h-5 text-amber-500" /> Dynamic Review & Journal
                </div>
                <button onClick={() => setShowReview(false)} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-neutral-400">
                  Embedded Completed Tasks ({completedTasks.length})
                </h3>
                {completedTasks.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    No completed tasks yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {completedTasks.map((task) => (
                      <div key={task.id} className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${itemClasses}`}>
                        <div className="flex items-center gap-2 truncate">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="truncate">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {task.movesTheNeedle && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1 rounded font-semibold">
                              Needle Mover
                            </span>
                          )}
                          <span className="font-mono text-neutral-500">{task.timeSpentMinutes}m</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-600 font-medium text-xs mb-2">
                  <TrendingUp className="w-4 h-4" /> Pareto Principle (Moved the Needle)
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  You accomplished <span className="font-semibold text-neutral-800 dark:text-neutral-200">{needleMoversCompleted.length}</span> high-leverage task(s).
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-neutral-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Bottleneck Analysis
                </h3>
                <form onSubmit={handleAddBottleneck} className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    placeholder="Log a roadblock..." 
                    value={bottleneckInput}
                    onChange={(e) => setBottleneckInput(e.target.value)}
                    className={`flex-1 border rounded-lg px-3 py-1.5 text-xs focus:outline-none ${itemClasses}`}
                  />
                  <button type="submit" className="border px-3 py-1.5 rounded-lg text-xs font-medium">Add</button>
                </form>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {bottlenecks.map((item, idx) => (
                    <div key={idx} className={`p-2 rounded border text-xs flex items-center justify-between ${itemClasses}`}>
                      <span>• {item}</span>
                      <button onClick={() => setBottlenecks(bottlenecks.filter((_, i) => i !== idx))} className="text-neutral-400 hover:text-rose-500">×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 text-neutral-400">Daily Reflection Notes</h3>
                <textarea 
                  rows={4}
                  value={journalReflection}
                  onChange={(e) => setJournalReflection(e.target.value)}
                  placeholder="What worked today? What needs adjustment tomorrow?"
                  className={`w-full border rounded-lg p-3 text-xs leading-relaxed focus:outline-none ${itemClasses}`}
                />
              </div>
            </div>

            <button onClick={() => setShowReview(false)} className="w-full py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium">
              Close & Resume Focus
            </button>
          </div>
        </div>
      )}

      {/* Project Modal (Edit / Delete / Create) */}
      <ProjectModal
        isOpen={Boolean(activeProjectModal || showNewProjectModal)}
        projectToEdit={activeProjectModal}
        onClose={() => {
          setActiveProjectModal(null);
          setShowNewProjectModal(false);
        }}
      />

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateProject} className={`border rounded-xl p-6 w-full max-w-md space-y-4 ${cardClasses}`}>
            <h3 className="text-lg font-semibold">Create New Project</h3>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Project Name</label>
              <input 
                type="text" 
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="e.g. Master C++ System Design"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${itemClasses}`}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Life Bucket</label>
              <select 
                value={newProjectBucket}
                onChange={(e) => setNewProjectBucket(e.target.value as LifeBucket)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${itemClasses}`}
              >
                <option value="Career">Career</option>
                <option value="Health">Health</option>
                <option value="Personal">Personal</option>
                <option value="Finance">Finance</option>
                <option value="Relationships">Relationships</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button type="button" onClick={() => setShowNewProjectModal(false)} className="px-4 py-2 text-sm text-neutral-400">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium">Create Project</button>
            </div>
          </form>
        </div>
      )}

      {/* Task Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateTask} className={`border rounded-xl p-6 w-full max-w-md space-y-4 ${cardClasses}`}>
            <h3 className="text-lg font-semibold">Add New Task</h3>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Task Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Practice Segment Tree Problems"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${itemClasses}`}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Life Bucket</label>
                <select 
                  value={bucket} 
                  onChange={(e) => setBucket(e.target.value as LifeBucket)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${itemClasses}`}
                >
                  <option value="Career">Career</option>
                  <option value="Health">Health</option>
                  <option value="Personal">Personal</option>
                  <option value="Finance">Finance</option>
                  <option value="Relationships">Relationships</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Assign to Project</label>
                <select 
                  value={projectId} 
                  onChange={(e) => setProjectId(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${itemClasses}`}
                >
                  <option value="">None (Stand-alone)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="rounded accent-indigo-600" />
                Urgent
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} className="rounded accent-indigo-600" />
                Important
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isFrog} onChange={(e) => setIsFrog(e.target.checked)} className="rounded accent-emerald-500" />
                Daily Frog 🐸
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={movesTheNeedle} onChange={(e) => setMovesTheNeedle(e.target.checked)} className="rounded accent-amber-500" />
                Moves Needle (80/20)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-neutral-400">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 font-medium rounded-lg text-white">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
