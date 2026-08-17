import React from 'react';
import { Flame, Trophy, CalendarCheck } from 'lucide-react';

/**
 * StreakTracker Component
 * Displays user's current active streak and personal best record.
 */
const StreakTracker = ({ currentStreak = 0, longestStreak = 0 }) => {
  const isStreakActive = currentStreak > 0;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-lg border border-amber-500/20 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <CalendarCheck className="w-4 h-4 text-amber-400" />
          Daily Consistency
        </span>
        
        {/* Personal Best Record */}
        <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/40">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Best: <strong className="text-slate-200">{longestStreak} days</strong></span>
        </div>
      </div>

      {/* Main Flame Counter */}
      <div className="flex items-center space-x-3 my-2">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
            isStreakActive
              ? 'bg-gradient-to-tr from-amber-500 to-red-500 text-white shadow-lg shadow-amber-500/30 animate-pulse'
              : 'bg-slate-800 text-slate-500 border border-slate-700'
          }`}
        >
          <Flame className={`w-7 h-7 ${isStreakActive ? 'fill-amber-300 text-red-500' : ''}`} />
        </div>

        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {currentStreak}
            </span>
            <span className="text-sm font-semibold text-amber-400">
              {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isStreakActive
              ? 'Complete 1 quest today to keep it burning!'
              : 'Complete a quest today to ignite your streak!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreakTracker;
