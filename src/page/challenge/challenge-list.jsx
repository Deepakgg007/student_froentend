import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../component/layout/header';
import Footer from '../../component/layout/footer';
import UserStatsWidget from '../../component/sidebar/user-stats-widget';

const ChallengeList = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
  });

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
      const params = {};
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.category) params.category = filters.category;

      const response = await api.get('/challenges/', { params });
      // Handle paginated response
      const data = response.data.results || response.data.data || response.data;
      setChallenges(Array.isArray(data) ? data : []);
      console.log('Challenges loaded:', data);
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
    });
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '80px' }}>
        <div className="container-fluid py-4 px-5">
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body text-center py-4">
              <h1 className="h2 fw-bold mb-3" style={{ color: '#2d3748' }}>
                <i className="fas fa-code-branch me-3" style={{ color: '#7b61ff' }}></i>
                Coding Challenges
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>
                {challenges.length} coding challenges ready to be solved
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-9">
              {challenges.length > 0 ? (
                challenges.map((challenge) => (
                  <div 
                    key={challenge.id} 
                    className="card mb-3 border-0"
                    style={{
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
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
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h5 className="mb-2 d-flex align-items-center">
                            <Link
                              to={`/challenge/${challenge.slug}`}
                              className="text-dark text-decoration-none"
                              style={{ 
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                color: '#2d3748',
                                transition: 'color 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#7b61ff'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#2d3748'}
                            >
                              {challenge.title}
                            </Link>
                          </h5>

                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <span className={`badge px-3 py-2 rounded-pill bg-${difficultyColors[challenge.difficulty]} text-uppercase`} 
                                  style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              {challenge.difficulty}
                            </span>
                            <span className="badge px-3 py-2 rounded-pill bg-light text-dark" 
                                  style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                              {challenge.category}
                            </span>
                          </div>

                          <div className="d-flex align-items-center gap-3 mb-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
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

                        {challenge.submission_status ? (
                          // User has attempted this challenge
                          challenge.submission_status === 'ACCEPTED' ? (
                            <Link
                              to={`/challenge/${challenge.slug}`}
                              className="btn d-inline-flex align-items-center btn-success"
                              style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                              }}
                            >
                              <i className="fas fa-check-circle me-2"></i>
                              Score: {challenge.submission_score || 0} - View Code
                            </Link>
                          ) : (
                            <Link
                              to={`/challenge/${challenge.slug}`}
                              className="btn d-inline-flex align-items-center btn-warning"
                              style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                              }}
                            >
                              <i className="fas fa-times-circle me-2"></i>
                              Failed - Try Again
                            </Link>
                          )
                        ) : (
                          // User hasn't attempted yet
                          <Link
                            to={`/challenge/${challenge.slug}`}
                            className="btn d-inline-flex align-items-center"
                            style={{
                              background: 'linear-gradient(135deg, #7b61ff 0%, #00c6ff 100%)',
                              color: '#fff',
                              padding: '10px 20px',
                              borderRadius: '12px',
                              boxShadow: '0 8px 24px rgba(123,97,255,0.25)',
                              border: 'none',
                              transition: 'all 0.2s ease',
                              textDecoration: 'none',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              letterSpacing: '0.3px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = '0 12px 28px rgba(123,97,255,0.35)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'none';
                              e.currentTarget.style.boxShadow = '0 8px 24px rgba(123,97,255,0.25)';
                            }}
                          >
                            <i className="fas fa-bolt me-2"></i>
                            Solve Challenge
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-5 border-0 shadow-sm">
                  <div className="card-body">
                    <i className="fas fa-search fa-3x text-muted mb-4"></i>
                    <h3 className="mb-3">No challenges found</h3>
                    <button className="btn btn-primary" onClick={clearFilters}>
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="col-lg-3">
              {/* User Stats Widget */}
              <div style={{ position: 'sticky', top: '100px' }}>
                <UserStatsWidget />
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Filters</h5>

                  <form>
                    <div className="mb-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-code me-2"></i>Category
                      </label>
                      <select className="form-select form-select-sm" name="category" value={filters.category} onChange={handleFilterChange}>
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
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="difficulty"
                            value=""
                            checked={filters.difficulty === ''}
                            onChange={handleFilterChange}
                            id="difficulty-all"
                          />
                          <label className="form-check-label" htmlFor="difficulty-all">
                            All Levels
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="difficulty"
                            value="EASY"
                            checked={filters.difficulty === 'EASY'}
                            onChange={handleFilterChange}
                            id="difficulty-easy"
                          />
                          <label className="form-check-label" htmlFor="difficulty-easy">
                            Easy
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="difficulty"
                            value="MEDIUM"
                            checked={filters.difficulty === 'MEDIUM'}
                            onChange={handleFilterChange}
                            id="difficulty-medium"
                          />
                          <label className="form-check-label" htmlFor="difficulty-medium">
                            Medium
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="difficulty"
                            value="HARD"
                            checked={filters.difficulty === 'HARD'}
                            onChange={handleFilterChange}
                            id="difficulty-hard"
                          />
                          <label className="form-check-label" htmlFor="difficulty-hard">
                            Hard
                          </label>
                        </div>
                      </div>
                    </div>

                    {(filters.difficulty || filters.category) && (
                      <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={clearFilters}>
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
      <Footer />
    </>
  );
};

export default ChallengeList;
