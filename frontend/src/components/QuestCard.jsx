import React from 'react';
import { CheckCircle2, Trash2, Zap, Shield, Sparkles } from 'lucide-react';

/**
 * QuestCard Component
 * Displays individual daily quest details, difficulty badge, XP reward pill,
 * and completion/deletion actions.
 */
const QuestCard = ({ quest, onComplete, onDelete, isCompleting = false }) => {
  const { _id, title, difficulty, xpValue, completed } = quest;

  // Difficulty badge color configurations
  const difficultyStyles = {
    easy: {
      bg: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300',
      label: 'Easy',
    },
    medium: {
      bg: 'bg-amber-950/60 border-amber-500/30 text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300',
      label: 'Medium',
    },
    hard: {
      bg: 'bg-rose-950/60 border-rose-500/30 text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300',
      label: 'Hard',
    },
  };

  const style = difficultyStyles[difficulty] || difficultyStyles.easy;

  return (
    <div
      className={`glass-card rounded-xl p-4 transition-all duration-300 border ${
        completed
          ? 'opacity-60 bg-slate-900/40 border-slate-800'
          : 'glass-card-hover border-slate-700/60 hover:border-indigo-500/40'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Checkbox / Completion Toggle */}
        <button
          onClick={() => !completed && onComplete(_id)}
          disabled={completed || isCompleting}
          aria-label={completed ? 'Quest completed' : 'Complete quest'}
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            completed
              ? 'bg-emerald-500 text-slate-950 cursor-default'
              : 'border-2 border-slate-600 hover:border-indigo-400 hover:bg-indigo-500/10 text-transparent'
          }`}
        >
          <CheckCircle2 className={`w-5 h-5 ${completed ? 'block' : 'opacity-0 hover:opacity-100 text-indigo-400'}`} />
        </button>

        {/* Quest Info */}
        <div className="flex-1 min-w-0">
          <h4
            className={`font-semibold text-base truncate transition-all ${
              completed ? 'line-through text-slate-500' : 'text-slate-100'
            }`}
          >
            {title}
          </h4>

          <div className="flex items-center gap-2 mt-1.5">
            {/* Difficulty Badge */}
            <span
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border ${style.bg}`}
            >
              <Shield className="w-3 h-3" />
              {style.label}
            </span>

            {/* XP Reward Pill */}
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/20">
              <Zap className="w-3 h-3 fill-amber-400" />
              +{xpValue} XP
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!completed && (
            <button
              onClick={() => onComplete(_id)}
              disabled={isCompleting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Complete
            </button>
          )}

          <button
            onClick={() => onDelete(_id)}
            aria-label="Delete quest"
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestCard;
