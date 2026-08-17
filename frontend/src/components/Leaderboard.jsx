import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Zap, Flame, Medal } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

/**
 * Leaderboard Component
 * Displays top users ranked by XP. Can receive real-time updates via props.
 */
const Leaderboard = ({ realTimeUsers = null }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If real-time users list passed via prop (Stage 4), use it directly
    if (realTimeUsers && Array.isArray(realTimeUsers)) {
      setUsers(realTimeUsers);
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        const response = await axiosInstance.get('/leaderboard');
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [realTimeUsers]);

  // Rank Badge Render Helper
  const renderRankBadge = (index) => {
    if (index === 0) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30">
          <Crown className="w-5 h-5 fill-slate-950" />
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 flex items-center justify-center text-slate-950 shadow-md">
          <Medal className="w-4 h-4 text-slate-800" />
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 flex items-center justify-center text-amber-100 shadow-md">
          <Medal className="w-4 h-4 text-amber-200" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm border border-slate-700">
        #{index + 1}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-slate-400">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Trophy className="w-8 h-8 text-indigo-400" />
          <p>Loading Leaderboard Champions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-rose-400 border border-rose-500/30">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl border border-indigo-500/20">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Global Leaderboard
            </h2>
            <p className="text-xs text-slate-400">Top champions ranked by total XP</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30">
          Live Rankings
        </span>
      </div>

      {users.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          No champions on the leaderboard yet. Complete quests to claim rank #1!
        </div>
      ) : (
        <div className="space-y-2.5">
          {users.map((user, index) => {
            const isTop3 = index < 3;
            return (
              <div
                key={user._id || index}
                className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                  isTop3
                    ? 'bg-slate-800/80 border border-amber-500/20 shadow-md'
                    : 'bg-slate-900/40 border border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {renderRankBadge(index)}

                  <div>
                    <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      {user.username}
                      <span className="text-xs font-normal text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        Lvl {user.level}
                      </span>
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <Flame className="w-3 h-3 fill-amber-400" />
                        {user.currentStreak || 0} day streak
                      </span>
                    </div>
                  </div>
                </div>

                {/* XP Pill */}
                <div className="flex items-center gap-1 font-extrabold text-sm text-amber-400 bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-500/30">
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{user.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
