import React from 'react';
import { Zap, Award } from 'lucide-react';

/**
 * XPBar Component
 * Computes and renders server-aligned level progress.
 * Formula: Level N requires N * 100 cumulative XP.
 */
const XPBar = ({ xp = 0, level = 1 }) => {
  // Current level baseline and target XP bounds
  const currentLevelStartXP = (level - 1) * 100;
  const nextLevelXP = level * 100;
  
  // XP progress within the current level
  const xpInCurrentLevel = Math.max(0, xp - currentLevelStartXP);
  const xpNeededForNextLevel = 100; // Each level step is 100 XP
  
  // Calculate percentage (clamped between 0 and 100)
  const progressPercent = Math.min(
    100,
    Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100)
  );

  return (
    <div className="w-full glass-card rounded-2xl p-5 shadow-lg border border-indigo-500/20">
      <div className="flex items-center justify-between mb-3">
        {/* Level Badge */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-lg shadow-md shadow-indigo-500/30">
            {level}
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" />
              Level {level} Explorer
            </h3>
            <p className="text-xs text-slate-400">
              {100 - xpInCurrentLevel} XP until Level {level + 1}
            </p>
          </div>
        </div>

        {/* XP Count Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-bold text-sm">
          <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{xp} Total XP</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-4 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        {/* Fill Bar */}
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-700 ease-out relative overflow-hidden shadow-inner"
          style={{ width: `${progressPercent}%` }}
        >
          {/* Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Numerical Progress Subtitle */}
      <div className="flex justify-between items-center text-xs font-medium text-slate-400 mt-2 px-1">
        <span>Lvl {level} ({currentLevelStartXP} XP)</span>
        <span className="text-indigo-300 font-semibold">{Math.round(progressPercent)}%</span>
        <span>Lvl {level + 1} ({nextLevelXP} XP)</span>
      </div>
    </div>
  );
};

export default XPBar;
