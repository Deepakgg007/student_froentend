import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

import UserStatsWidget from '../../component/sidebar/user-stats-widget';

const ChallengeList = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    attempt_status: '',
  });
  const [showFilter, setShowFilter] = useState(false); // For mobile toggle

  const difficultyColors = {
    EASY: 'success',
    MEDIUM: 'warning',
    HARD: 'danger',
  };

  const algorithmCategories = [
    { value: 'arrays', label: 'Arrays' },
    { value: 'strings', label: 'Strings' },
    { value: 'sorting', label: 'Sorting' },
    { value: 'searching', label: 'Searching' },
    { value: 'dynamic_programming', label: 'Dynamic Programming' },
    { value: 'greedy', label: 'Greedy' },
    { value: 'graphs', label: 'Graph Theory' },
    { value: 'trees', label: 'Trees' },
    { value: 'linked_lists', label: 'Linked Lists' },
    { value: 'stacks_queues', label: 'Stacks and Queues' },
    { value: 'recursion', label: 'Recursion' },
    { value: 'bit_manipulation', label: 'Bit Manipulation' },
    { value: 'maths', label: 'Mathematics' },
    { value: 'basic', label: 'Basic' },
  ];

  useEffect(() => {
    fetchChallenges();
  }, [filters]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.category) params.category = filters.category;
      if (filters.attempt_status) params.attempt_status = filters.attempt_status;

      const response = await api.get('/challenges/', { params });
      const data = response.data.results || response.data.data || response.data;
      setChallenges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      difficulty: '',
      category: '',
      attempt_status: '',
    });
  };

  const getAttemptStatusBadge = (challenge) => {
    if (challenge.is_solved) {
      return {
        label: 'Solved',
        icon: 'fa-check-circle',
        bgColor: '#10b981',
        textColor: '#fff',
      };
    } else if (challenge.is_attempted) {
      if (challenge.failed) {
        return {
          label: 'Failed',
          icon: 'fa-times-circle',
          bgColor: '#ef4444',
          textColor: '#fff',
        };
      } else {
        return {
          label: 'Attempted',
          icon: 'fa-play-circle',
          bgColor: '#3b82f6',
          textColor: '#fff',
        };
      }
    }
    return null;
  };

  return (
    <>
      {/* Page Header */}
      <div style={{ background: '#ffffff', paddingTop: '100px', paddingBottom: '40px', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container-fluid px-3 px-md-5">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
                <i className="fas fa-code me-3" style={{ color: '#7b61ff' }}></i>Coding Challenges
              </h1>
              <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: 0 }}>
                Solve real-world coding problems and improve your programming skills
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <div style={{
                padding: '12px 20px',
                background: '#f3f4f6',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>
                  <i className="fas fa-tasks me-2" style={{ color: '#10b981' }}></i>
                  Total Challenges: <strong>{challenges.length}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '80px' }}>
        <div className="container-fluid py-4 px-3 px-md-5">
          

          {/* 🔹 Mobile Filter Toggle Button */}
          <div className="d-block d-lg-none mb-3">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="btn btn-primary w-100 fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #7b61ff 0%, #00c6ff 100%)',
                border: 'none',
                borderRadius: '10px',
              }}
            >
              {showFilter ? (
                <>
                  <i className="fas fa-times me-2"></i>Hide Filters
                </>
              ) : (
                <>
                  <i className="fas fa-filter me-2"></i>Show Filters
                </>
              )}
            </button>
          </div>

          {/* 🔹 Mobile Filters */}
          {showFilter && (
            <div className="d-block d-lg-none mb-4 animate__animated animate__fadeInDown">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Filters</h5>
                  <form>
                    <div className="mb-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-code me-2"></i>Category
                      </label>
                      <select
                        className="form-select form-select-sm"
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Categories</option>
                        {algorithmCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-signal me-2"></i>Difficulty
                      </label>
                      <div>
                        {['', 'EASY', 'MEDIUM', 'HARD'].map((level) => (
                          <div className="form-check mb-2" key={level}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name="difficulty"
                              value={level}
                              checked={filters.difficulty === level}
                              onChange={handleFilterChange}
                              id={`difficulty-${level || 'all'}-mobile`}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`difficulty-${level || 'all'}-mobile`}
                            >
                              {level || 'All Levels'}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-check me-2"></i>Attempt Status
                      </label>
                      <div>
                        {[
                          { value: '', label: 'All Challenges' },
                          { value: 'not_attempted', label: 'Not Attempted' },
                          { value: 'attempted', label: 'Attempted' },
                          { value: 'solved', label: 'Solved' },
                        ].map((status) => (
                          <div className="form-check mb-2" key={status.value}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name="attempt_status"
                              value={status.value}
                              checked={filters.attempt_status === status.value}
                              onChange={handleFilterChange}
                              id={`status-${status.value || 'all'}-mobile`}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`status-${status.value || 'all'}-mobile`}
                            >
                              {status.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(filters.difficulty || filters.category || filters.attempt_status) && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm w-100"
                        onClick={clearFilters}
                      >
                        <i className="fas fa-times me-2"></i>Clear Filters
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="row">
            <div className="col-lg-9">
              {challenges.length > 0 ? (
                challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="card mb-3 border-0"
                    style={{
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                    }}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start flex-wrap">
                        <div className="flex-grow-1">
                          <h5 className="mb-2 d-flex align-items-center">
                            <Link
                              to={`/challenge/${challenge.slug}`}
                              className="text-dark text-decoration-none fw-bold"
                              style={{ fontSize: '1.1rem', color: '#2d3748' }}
                            >
                              {challenge.title}
                            </Link>
                          </h5>

                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <span
                              className={`badge px-3 py-2 rounded-pill bg-${difficultyColors[challenge.difficulty]} text-uppercase`}
                              style={{ fontSize: '0.8rem', fontWeight: 600 }}
                            >
                              {challenge.difficulty}
                            </span>
                            <span
                              className="badge px-3 py-2 rounded-pill bg-light text-dark"
                              style={{ fontSize: '0.8rem', fontWeight: 500 }}
                            >
                              {challenge.category}
                            </span>
                            {getAttemptStatusBadge(challenge) && (
                              <span
                                className="badge px-3 py-2 rounded-pill text-uppercase"
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  backgroundColor: getAttemptStatusBadge(challenge).bgColor,
                                  color: getAttemptStatusBadge(challenge).textColor,
                                }}
                              >
                                <i className={`fas ${getAttemptStatusBadge(challenge).icon} me-1`}></i>
                                {getAttemptStatusBadge(challenge).label}
                              </span>
                            )}
                          </div>

                          <div
                            className="d-flex align-items-center gap-3 mb-2"
                            style={{ fontSize: '0.85rem', color: '#6c757d' }}
                          >
                            <span>
                              <i className="fas fa-star-half-alt me-1"></i>
                              {challenge.max_score} points
                            </span>
                            <span>
                              <i className="fas fa-chart-line me-1"></i>
                              {(challenge.success_rate || 0).toFixed(1)}% success
                            </span>
                            <span>
                              <i className="fas fa-code-branch me-1"></i>
                              {challenge.total_submissions} attempts
                            </span>
                          </div>
                        </div>

                        {/* Desktop Button */}
                        <Link
                          to={`/challenge/${challenge.slug}`}
                          className="btn d-none d-md-inline-flex align-items-center"
                          style={{
                            background: challenge.is_solved
                              ? '#10b981'
                              : challenge.is_attempted && challenge.failed
                              ? '#ef4444'
                              : 'linear-gradient(135deg, #7b61ff 0%, #00c6ff 100%)',
                            color: '#fff',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            boxShadow: challenge.is_solved
                              ? '0 8px 24px rgba(16,185,129,0.25)'
                              : challenge.is_attempted && challenge.failed
                              ? '0 8px 24px rgba(239,68,68,0.25)'
                              : '0 8px 24px rgba(123,97,255,0.25)',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                          }}
                        >
                          <i className={`fas ${
                            challenge.is_solved
                              ? 'fa-check-circle'
                              : challenge.is_attempted && challenge.failed
                              ? 'fa-redo'
                              : challenge.is_attempted
                              ? 'fa-play'
                              : 'fa-bolt'
                          } me-2`}></i>
                          {challenge.is_solved
                            ? 'View Solution'
                            : challenge.is_attempted && challenge.failed
                            ? 'Try Again'
                            : challenge.is_attempted
                            ? 'Continue'
                            : 'Solve Challenge'}
                        </Link>
                      </div>

                      {/* Mobile Button */}
                      <div className="d-block d-md-none mt-3">
                        <Link
                          to={`/challenge/${challenge.slug}`}
                          className="btn w-100 d-flex justify-content-center align-items-center"
                          style={{
                            background: challenge.is_solved
                              ? '#10b981'
                              : challenge.is_attempted && challenge.failed
                              ? '#ef4444'
                              : 'linear-gradient(135deg, #7b61ff 0%, #00c6ff 100%)',
                            color: '#fff',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                          }}
                        >
                          <i className={`fas ${
                            challenge.is_solved
                              ? 'fa-check-circle'
                              : challenge.is_attempted && challenge.failed
                              ? 'fa-redo'
                              : challenge.is_attempted
                              ? 'fa-play'
                              : 'fa-bolt'
                          } me-2`}></i>
                          {challenge.is_solved
                            ? 'View Solution'
                            : challenge.is_attempted && challenge.failed
                            ? 'Try Again'
                            : challenge.is_attempted
                            ? 'Continue'
                            : 'Solve Challenge'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : loading ? (
                <div className="card text-center py-5 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="spinner-border text-primary mb-4" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h3 className="mb-3">Loading challenges...</h3>
                    <p className="text-muted">Please wait while we fetch your challenges</p>
                  </div>
                </div>
              ) : (
                <div className="card text-center py-5 border-0 shadow-sm">
                  <div className="card-body">
                    <i className="fas fa-search fa-3x text-muted mb-4"></i>
                    <h3 className="mb-3">No challenges found</h3>
                    <p className="text-muted mb-3">Try adjusting your filters or clearing them to see all challenges</p>
                    <button className="btn btn-primary" onClick={clearFilters}>
                      <i className="fas fa-redo me-2"></i>Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Sidebar */}
            <div className="col-lg-3 d-none d-lg-block">
              <div style={{ position: 'sticky', top: '100px' }}>
                <UserStatsWidget />
              </div>

              <div className="card border-0 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Filters</h5>
                  <form>
                    <div className="mb-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-code me-2"></i>Category
                      </label>
                      <select
                        className="form-select form-select-sm"
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Categories</option>
                        {algorithmCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-signal me-2"></i>Difficulty
                      </label>
                      <div>
                        {['', 'EASY', 'MEDIUM', 'HARD'].map((level) => (
                          <div className="form-check mb-2" key={level}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name="difficulty"
                              value={level}
                              checked={filters.difficulty === level}
                              onChange={handleFilterChange}
                              id={`difficulty-${level || 'all'}-desktop`}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`difficulty-${level || 'all'}-desktop`}
                            >
                              {level || 'All Levels'}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-check me-2"></i>Attempt Status
                      </label>
                      <div>
                        {[
                          { value: '', label: 'All Challenges' },
                          { value: 'not_attempted', label: 'Not Attempted' },
                          { value: 'attempted', label: 'Attempted' },
                          { value: 'solved', label: 'Solved' },
                        ].map((status) => (
                          <div className="form-check mb-2" key={status.value}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name="attempt_status"
                              value={status.value}
                              checked={filters.attempt_status === status.value}
                              onChange={handleFilterChange}
                              id={`status-${status.value || 'all'}-desktop`}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`status-${status.value || 'all'}-desktop`}
                            >
                              {status.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(filters.difficulty || filters.category || filters.attempt_status) && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm w-100"
                        onClick={clearFilters}
                      >
                        <i className="fas fa-times me-2"></i>Clear Filters
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChallengeList;
