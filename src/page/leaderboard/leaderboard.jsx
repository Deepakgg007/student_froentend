// edukon/src/page/leaderboard/leaderboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../component/layout/header';
import Footer from '../../component/layout/footer';
import api from '../../services/api';
import './leaderboard.css';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');
  const [userPosition, setUserPosition] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      let endpoint = `/student/leaderboard/${activeTab}/`;
      if (activeTab === 'global') {
        endpoint = `/student/leaderboard/global/`;
      }
      
      const response = await api.get(endpoint, {
        params: { limit }
      });
      
      const data = response.data;
      
      if (activeTab === 'global' || activeTab === 'college') {
        setLeaderboard(Array.isArray(data) ? data : data.leaderboard || []);
        if (data.user_position) setUserPosition(data.user_position);
        if (data.total_users) setTotalUsers(data.total_users);
      } else {
        setLeaderboard(Array.isArray(data) ? data : []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
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
        <Header />
        <div className="leaderboard-loading">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
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

          {/* User Position Card */}
          {userPosition && (
            <div className="user-position-card">
              <div className="position-label">Your Ranking</div>
              <div className="position-stats">
                <div className="position-rank" style={{ color: getRankColor(userPosition.rank) }}>
                  #{userPosition.rank || 'N/A'}
                </div>
                <div className="position-details">
                  <span><i className="fas fa-trophy"></i> {userPosition.total_points} pts</span>
                  <span><i className="fas fa-check-circle"></i> {userPosition.challenges_solved} solved</span>
                </div>
              </div>
            </div>
          )}
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
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="podium-section">
            {/* 2nd Place */}
            <div className="podium-card second">
              <div className="podium-rank">🥈</div>
              <div 
                className="podium-avatar"
                onClick={() => navigate(`/profile/${leaderboard[1].user}`)}
                style={{ cursor: 'pointer' }}
              >
                {leaderboard[1].profile_picture ? (
                  <img src={leaderboard[1].profile_picture} alt={leaderboard[1].username} />
                ) : (
                  <div className="avatar-placeholder">
                    {leaderboard[1].username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="podium-username">{leaderboard[1].username}</h3>
              <p className="podium-college">{leaderboard[1].college_name}</p>
              <div className="podium-stats">
                <div className="podium-points">{formatNumber(leaderboard[1].total_points)} pts</div>
                <div className="podium-solved">{leaderboard[1].challenges_solved} solved</div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="podium-card first">
              <div className="podium-rank">🥇</div>
              <div className="podium-crown">👑</div>
              <div 
                className="podium-avatar"
                onClick={() => navigate(`/profile/${leaderboard[0].user}`)}
                style={{ cursor: 'pointer' }}
              >
                {leaderboard[0].profile_picture ? (
                  <img src={leaderboard[0].profile_picture} alt={leaderboard[0].username} />
                ) : (
                  <div className="avatar-placeholder">
                    {leaderboard[0].username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="podium-username">{leaderboard[0].username}</h3>
              <p className="podium-college">{leaderboard[0].college_name}</p>
              <div className="podium-stats">
                <div className="podium-points">{formatNumber(leaderboard[0].total_points)} pts</div>
                <div className="podium-solved">{leaderboard[0].challenges_solved} solved</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="podium-card third">
              <div className="podium-rank">🥉</div>
              <div 
                className="podium-avatar"
                onClick={() => navigate(`/profile/${leaderboard[2].user}`)}
                style={{ cursor: 'pointer' }}
              >
                {leaderboard[2].profile_picture ? (
                  <img src={leaderboard[2].profile_picture} alt={leaderboard[2].username} />
                ) : (
                  <div className="avatar-placeholder">
                    {leaderboard[2].username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="podium-username">{leaderboard[2].username}</h3>
              <p className="podium-college">{leaderboard[2].college_name}</p>
              <div className="podium-stats">
                <div className="podium-points">{formatNumber(leaderboard[2].total_points)} pts</div>
                <div className="podium-solved">{leaderboard[2].challenges_solved} solved</div>
              </div>
            </div>
          </div>
        )}

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

            {leaderboard.slice(3).map((user, index) => {
              const rank = index + 4;
              const isCurrentUser = userPosition && user.user === userPosition.user_id;
              
              return (
                <div 
                  key={user.user} 
                  className={`table-row ${isCurrentUser ? 'current-user' : ''}`}
                  onClick={() => navigate(`/profile/${user.user}`)}
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
                          alt={user.username}
                          className="user-avatar-small"
                        />
                      ) : (
                        <div className="user-avatar-small placeholder">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="user-details">
                        <div className="user-name">{user.username}</div>
                        <div className="user-college">{user.college_name}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-points">
                    <span className="points-value">{formatNumber(user.total_points)}</span>
                  </div>
                  
                  <div className="col-solved">
                    <span className="solved-value">{user.challenges_solved}</span>
                  </div>
                  
                  <div className="col-streak">
                    <span className="streak-value">
                      {user.current_streak > 0 && <i className="fas fa-fire"></i>}
                      {user.current_streak}
                    </span>
                  </div>
                  
                  <div className="col-difficulty">
                    <div className="difficulty-chips">
                      <span className="chip easy">{user.easy_solved}E</span>
                      <span className="chip medium">{user.medium_solved}M</span>
                      <span className="chip hard">{user.hard_solved}H</span>
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
    <Footer />
    </>
  );
};

export default Leaderboard;
