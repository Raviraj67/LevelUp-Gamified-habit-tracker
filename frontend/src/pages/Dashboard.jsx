import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import XPBar from '../components/XPBar';
import StreakTracker from '../components/StreakTracker';
import QuestCard from '../components/QuestCard';
import { PlusCircle, Target, Sparkles, CheckCircle2, Trophy, Award } from 'lucide-react';

/**
 * Dashboard Page Component
 * Main user hub for managing daily quests, earning XP, leveling up, and maintaining streaks.
 */
const Dashboard = () => {
  const { user, updateUserProgress } = useAuth();

  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [creating, setCreating] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [error, setError] = useState(null);

  // Level-up celebration modal state
  const [levelUpModal, setLevelUpModal] = useState({ open: false, newLevel: 1 });

  // Fetch today's quests for user
  const fetchQuests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/quests');
      setQuests(response.data);
    } catch (err) {
      console.error('Error fetching quests:', err);
      setError('Could not load your daily quests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  // Handle new quest submission
  const handleCreateQuest = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      const response = await axiosInstance.post('/quests', {
        title: title.trim(),
        difficulty,
      });
      setQuests((prev) => [response.data, ...prev]);
      setTitle('');
      setDifficulty('easy');
    } catch (err) {
      console.error('Error creating quest:', err);
      setError(err.response?.data?.message || 'Failed to create quest');
    } finally {
      setCreating(false);
    }
  };

  // Handle completing a quest
  const handleCompleteQuest = async (questId) => {
    try {
      setCompletingId(questId);
      const response = await axiosInstance.patch(`/quests/${questId}/complete`);
      const { quest, userProgress } = response.data;

      // 1. Update quest list locally
      setQuests((prev) =>
        prev.map((q) => (q._id === questId ? { ...q, completed: true } : q))
      );

      // 2. Update user profile XP/level/streak in AuthContext
      updateUserProgress(userProgress);

      // 3. Trigger level up modal if leveledUp is true
      if (userProgress.leveledUp) {
        setLevelUpModal({ open: true, newLevel: userProgress.level });
      }
    } catch (err) {
      console.error('Error completing quest:', err);
      setError(err.response?.data?.message || 'Failed to complete quest');
    } finally {
      setCompletingId(null);
    }
  };

  // Handle deleting a quest
  const handleDeleteQuest = async (questId) => {
    try {
      await axiosInstance.delete(`/quests/${questId}`);
      setQuests((prev) => prev.filter((q) => q._id !== questId));
    } catch (err) {
      console.error('Error deleting quest:', err);
      setError(err.response?.data?.message || 'Failed to delete quest');
    }
  };

  const completedCount = quests.filter((q) => q.completed).length;
  const totalCount = quests.length;

  return (
    <div className="space-y-8 pb-12">
      {/* Level Up Celebration Modal */}
      {levelUpModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-3xl p-8 max-w-sm w-full text-center border-2 border-amber-400/50 shadow-2xl shadow-amber-500/20 animate-levelup relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-purple-500/10 to-transparent pointer-events-none" />
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 mb-4 shadow-xl shadow-amber-400/30">
              <Trophy className="w-10 h-10 fill-slate-950" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight uppercase">
              Level Up!
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              Congratulations hero! You reached <strong className="text-amber-400 font-bold">Level {levelUpModal.newLevel}</strong>.
            </p>

            <button
              onClick={() => setLevelUpModal({ open: false, newLevel: 1 })}
              className="mt-6 w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-400/30 transition-all active:scale-95"
            >
              Claim Rewards & Continue
            </button>
          </div>
        </div>
      )}

      {/* Top Hero Section: Profile Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <XPBar xp={user?.xp} level={user?.level} />
        </div>
        <div>
          <StreakTracker
            currentStreak={user?.currentStreak}
            longestStreak={user?.longestStreak}
          />
        </div>
      </div>

      {/* Quest Section Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Quest Form */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 shadow-xl border border-indigo-500/20 sticky top-24">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-100">Add Daily Quest</h3>
            </div>

            <form onSubmit={handleCreateQuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Quest Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solve 2 LeetCode problems"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'easy', label: 'Easy', xp: '10 XP' },
                    { id: 'medium', label: 'Medium', xp: '25 XP' },
                    { id: 'hard', label: 'Hard', xp: '50 XP' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDifficulty(item.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        difficulty === item.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold shadow-sm'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-amber-400 font-medium">{item.xp}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={creating || !title.trim()}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {creating ? 'Creating Quest...' : 'Add Quest'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Today's Quests List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-extrabold text-slate-100">Today's Quests</h3>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Progress: <strong className="text-slate-200">{completedCount} / {totalCount}</strong>
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 glass-card rounded-xl animate-pulse" />
              ))}
            </div>
          ) : quests.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-slate-400 border border-dashed border-slate-800">
              <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="font-bold text-slate-200 text-base">No Quests Scheduled for Today</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Use the quest creator form to add your daily study or habit goals and start earning XP!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quests.map((quest) => (
                <QuestCard
                  key={quest._id}
                  quest={quest}
                  onComplete={handleCompleteQuest}
                  onDelete={handleDeleteQuest}
                  isCompleting={completingId === quest._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
