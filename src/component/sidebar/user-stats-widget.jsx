// edukon/src/component/sidebar/user-stats-widget.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './user-stats-widget.css';

const API_BASE_URL = 'http://localhost:8000/api/student';

const UserStatsWidget = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-stats-widget loading">
        <div className="spinner-small"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="user-stats-widget">
      <div className="stats-header">
        <h4>Your Progress</h4>
        <Link to="/profile" className="view-profile-link">
          <i className="icofont-user"></i> View Profile
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-item points">
          <div className="stat-icon">
            <i className="icofont-trophy"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.total_points}</div>
            <div className="stat-label">Points</div>
          </div>
        </div>

        <div className="stat-item rank">
          <div className="stat-icon">
            <i className="icofont-medal"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">#{stats.global_rank || 'N/A'}</div>
            <div className="stat-label">Rank</div>
          </div>
        </div>

        <div className="stat-item solved">
          <div className="stat-icon">
            <i className="icofont-check-circled"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.challenges_solved}</div>
            <div className="stat-label">Solved</div>
          </div>
        </div>

        <div className="stat-item streak">
          <div className="stat-icon">
            <i className="icofont-fire-burn"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.current_streak}</div>
            <div className="stat-label">Streak</div>
          </div>
        </div>
      </div>

      <div className="stats-progress">
        <div className="progress-header">
          <span>Difficulty Progress</span>
          <span>{stats.challenges_solved} challenges</span>
        </div>
        
        <div className="difficulty-bars">
          <div className="difficulty-row easy">
            <span className="difficulty-label">Easy</span>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: '60%' }}></div>
            </div>
            <span className="difficulty-count">{stats.easy_solved}</span>
          </div>

          <div className="difficulty-row medium">
            <span className="difficulty-label">Medium</span>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: '40%' }}></div>
            </div>
            <span className="difficulty-count">{stats.medium_solved}</span>
          </div>

          <div className="difficulty-row hard">
            <span className="difficulty-label">Hard</span>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: '20%' }}></div>
            </div>
            <span className="difficulty-count">{stats.hard_solved}</span>
          </div>
        </div>
      </div>

      <div className="stats-actions">
        <Link to="/leaderboard" className="action-btn leaderboard-btn">
          <i className="icofont-trophy"></i> Leaderboard
        </Link>
        <Link to="/profile" className="action-btn profile-btn">
          <i className="icofont-user-alt-3"></i> My Profile
        </Link>
      </div>

      {stats.rank_badge && (
        <div className="rank-badge-display">
          {stats.rank_badge}
        </div>
      )}
    </div>
  );
};

export default UserStatsWidget;
