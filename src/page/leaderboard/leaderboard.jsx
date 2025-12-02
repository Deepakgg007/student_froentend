// edukon/src/page/leaderboard/leaderboard.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import './leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');
  const [userPosition, setUserPosition] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit, setLimit] = useState(100);
  const [userCollegeId, setUserCollegeId] = useState(null);

  useEffect(() => {
    // Fetch user's college info on mount
    fetchUserCollege();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, limit, userCollegeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserCollege = async () => {
    try {
      const response = await api.get('/student/profile/me/');
      if (response.data && response.data.user && response.data.user.college_id) {
        // Extract college ID from the user data
        setUserCollegeId(response.data.user.college_id);
        console.log('User college ID:', response.data.user.college_id);
      } else {
        console.warn('No college found for user:', response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user college:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      let endpoint = `/student/leaderboard/`;
      const params = { limit };

      if (activeTab === 'global') {
        endpoint = `/student/leaderboard/global/`;
      } else if (activeTab === 'college') {
        // For college leaderboard, pass the user's college ID
        if (userCollegeId) {
          endpoint = `/student/leaderboard/college/${userCollegeId}/`;
        } else {
          // If no college found, fall back to general leaderboard
          endpoint = `/student/leaderboard/`;
          params.type = 'college';
        }
      }

      console.log(`Fetching leaderboard from: ${endpoint}`, { activeTab, userCollegeId, params });

      const response = await api.get(endpoint, { params });

      const data = response.data;

      console.log('Leaderboard response:', data);

      // Handle both direct array response and object with leaderboard key
      if (Array.isArray(data)) {
        setLeaderboard(data);
        setUserPosition(null);
        setTotalUsers(0);
      } else if (data.leaderboard) {
        const leaderboardData = Array.isArray(data.leaderboard) ? data.leaderboard : [];
        setLeaderboard(leaderboardData);

        // Log sample user data for debugging
        if (leaderboardData.length > 0) {
          console.log('Sample user from leaderboard:', {
            username: leaderboardData[0].username,
            total_points: leaderboardData[0].total_points,
            challenges_solved: leaderboardData[0].challenges_solved,
            current_streak: leaderboardData[0].current_streak,
            easy_solved: leaderboardData[0].easy_solved,
            medium_solved: leaderboardData[0].medium_solved,
            hard_solved: leaderboardData[0].hard_solved,
            first_name: leaderboardData[0].first_name,
            last_name: leaderboardData[0].last_name,
            college_name: leaderboardData[0].college_name,
          });
        }

        if (data.user_position) {
          console.log('User position:', data.user_position);
          setUserPosition(data.user_position);
        }
        if (data.total_users) setTotalUsers(data.total_users);
      } else if (data.results) {
        // Handle paginated response
        setLeaderboard(Array.isArray(data.results) ? data.results : []);
        if (data.user_position) {
          console.log('User position:', data.user_position);
          setUserPosition(data.user_position);
        }
        if (data.total_users) setTotalUsers(data.total_users);
      } else {
        console.warn('Unexpected response format:', data);
        setLeaderboard([]);
        setUserPosition(null);
        setTotalUsers(0);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
      setLoading(false);
    }
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank) => {
    if (rank <= 3) return '#FFD700';
    if (rank <= 10) return '#C0C0C0';
    if (rank <= 100) return '#CD7F32';
    return '#8b5cf6';
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (loading) {
    return (
      <>
        <div className="leaderboard-loading">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="leaderboard-page">
      {/* Header */}
      <div className="leaderboard-header">
        <div className="leaderboard-header-content">
          <div className="header-title-section">
            <h1 className="leaderboard-title">
              <i className="fas fa-trophy"></i> Leaderboard
            </h1>
            <p className="leaderboard-subtitle">
              Compete with {formatNumber(totalUsers)} coders worldwide
            </p>
          </div>

          {/* User Position Card - Show current user's ranking from leaderboard */}
          {/* {userPosition && userPosition.rank && (
            <div className="user-position-card">
              <div className="position-label">
                <i className="fas fa-user-circle me-2"></i>Your Ranking
              </div>
              <div className="position-stats">
                <div className="position-rank" style={{ color: getRankColor(userPosition.rank) }}>
                  {getRankMedal(userPosition.rank)} #{userPosition.rank}
                </div>
                <div className="position-details">
                  <span>
                    <i className="fas fa-star me-1"></i>
                    <strong>{userPosition.total_points || 0}</strong> pts
                  </span>
                  <span>
                    <i className="fas fa-check-circle me-1"></i>
                    <strong>{userPosition.challenges_solved || 0}</strong> solved
                  </span>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* Tabs */}
      <div className="leaderboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
          onClick={() => setActiveTab('global')}
        >
          <i className="fas fa-globe"></i> Global
        </button>
        <button 
          className={`tab-button ${activeTab === 'college' ? 'active' : ''}`}
          onClick={() => setActiveTab('college')}
        >
          <i className="fas fa-university"></i> College
        </button>
      </div>

      {/* Leaderboard Content */}
      <div className="leaderboard-content">

        {/* Ranking Table */}
        <div className="ranking-table-container">
          <div className="ranking-table-header">
            <h2><i className="fas fa-list-ol"></i> Rankings</h2>
            <div className="table-controls">
              <select 
                value={limit} 
                onChange={(e) => setLimit(Number(e.target.value))}
                className="limit-select"
              >
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
                <option value={500}>Top 500</option>
              </select>
            </div>
          </div>

          <div className="ranking-table">
            <div className="table-header">
              <div className="col-rank">Rank</div>
              <div className="col-user">User</div>
              <div className="col-points">Points</div>
              <div className="col-solved">Solved</div>
              <div className="col-streak">Streak</div>
              <div className="col-difficulty">Difficulty</div>
            </div>

            {leaderboard.map((user, index) => {
              const rank = index + 1;
              const userId = user.user || user.id; // Handle both user and id fields
              const isCurrentUser = userPosition && userId === userPosition.user_id;

              // Provide fallback values for all fields
              const totalPoints = user.total_points || 0;
              const challengesSolved = user.challenges_solved || 0;
              const currentStreak = user.current_streak || 0;
              const easySolved = user.easy_solved || 0;
              const mediumSolved = user.medium_solved || 0;
              const hardSolved = user.hard_solved || 0;
              const userName = user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username || 'N/A';
              const collegeName = user.college_name || 'N/A';

              return (
                <div
                  key={userId}
                  className={`table-row ${isCurrentUser ? 'current-user' : ''}`}
                >
                  <div className="col-rank">
                    <span
                      className="rank-number"
                      style={{ color: getRankColor(rank) }}
                    >
                      {getRankMedal(rank) || `#${rank}`}
                    </span>
                  </div>

                  <div className="col-user">
                    <div className="user-info">
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt={userName}
                          className="user-avatar-small"
                        />
                      ) : (
                        <div className="user-avatar-small placeholder">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="user-details">
                        <div className="user-name">{userName}</div>
                        <div className="user-college">{collegeName}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-points">
                    <span className="points-value">{formatNumber(totalPoints)}</span>
                  </div>

                  <div className="col-solved">
                    <span className="solved-value">{challengesSolved}</span>
                  </div>

                  <div className="col-streak">
                    <span className="streak-value">
                      {currentStreak > 0 && <i className="fas fa-fire"></i>}
                      {currentStreak}
                    </span>
                  </div>

                  <div className="col-difficulty">
                    <div className="difficulty-chips">
                      <span className="chip easy">{easySolved}E</span>
                      <span className="chip medium">{mediumSolved}M</span>
                      <span className="chip hard">{hardSolved}H</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {leaderboard.length === 0 && (
          <div className="no-data">
            <i className="fas fa-trophy"></i>
            <p>No leaderboard data available</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Leaderboard;
