import React, { useState } from 'react';
import Leaderboard from '../components/Leaderboard';
import useSocket from '../hooks/useSocket';

/**
 * LeaderboardPage Component
 * Full page container rendering the leaderboard rankings with real-time updates.
 */
const LeaderboardPage = () => {
  const [realTimeUsers, setRealTimeUsers] = useState(null);

  // Hook into the leaderboardUpdate event to listen for real-time changes
  useSocket('leaderboardUpdate', (updatedUsers) => {
    setRealTimeUsers(updatedUsers);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Leaderboard realTimeUsers={realTimeUsers} />
    </div>
  );
};

export default LeaderboardPage;

