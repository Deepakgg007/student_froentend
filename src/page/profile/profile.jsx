// edukon/src/page/profile/profile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ContributionCalendar from '../../component/profile/ContributionCalendar';
import api from '../../services/api';
import { useSmoothData } from '../../hooks/useSmoothData';
import './profile.css';

const Profile = () => {
  const { userId, collegeSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Progressive loading: First load profile fast (critical data)
  const { data: profileData, loading: profileLoading, error: profileError } = useSmoothData(
    async () => {
      const profileEndpoint = userId
        ? `/student/profile/${userId}/`
        : `/student/profile/me/`;

      const profileRes = await api.get(profileEndpoint);
      return { data: profileRes.data };
    },
    [userId]
  );

  // Load stats in background (non-blocking)
  const { data: statsData } = useSmoothData(
    async () => {
      const statsEndpoint = userId
        ? `/student/profile/${userId}/stats/`
        : '/student/profile/me_stats/';

      try {
        const statsRes = await api.get(statsEndpoint);
        return { data: statsRes.data || {} };
      } catch {
        return { data: {} };
      }
    },
    [userId]
  );

  // Load courses in background (non-blocking, loads after profile)
  const { data: coursesData } = useSmoothData(
    async () => {
      try {
        const coursesRes = await api.get('/student/enrollments/');
        const enrollments = coursesRes.data.results || coursesRes.data.data || coursesRes.data || [];

        const enrolledCourses = enrollments.map(enrollment => {
          const course = enrollment.course || {};
          const courseId = course.id || enrollment.course_id;

          return {
            ...course,
            id: courseId,
            progress: enrollment.progress_percentage || 0,
            enrolled_at: enrollment.enrolled_at || enrollment.created_at,
            status: enrollment.status,
            completion_status: enrollment.completion_status,
            last_accessed: enrollment.last_accessed,
            completed_topics: enrollment.completed_topics || 0,
            total_topics: course.total_topics || course.topics_count || 0
          };
        });

        return { data: enrolledCourses };
      } catch {
        return { data: [] };
      }
    },
    []
  );

  const profile = profileData;
  const stats = statsData || {
    submissions: { total: 0, accepted: 0, accuracy: 0 },
    difficulty_breakdown: { easy: { total: 0 }, medium: { total: 0 }, hard: { total: 0 } },
    recent_submissions: [],
    course_stats: {
      total_enrollments: 0,
      completed_enrollments: 0,
      overall_course_completion_pct: 0,
    },
  };
  const enrolledCourses = coursesData || [];

  // Calculate course stats from enrolled courses
  if (enrolledCourses.length > 0) {
    const completedCourses = enrolledCourses.filter(c => c.status === 'completed' || c.progress >= 100).length;
    const totalProgress = enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0);
    const avgProgress = enrolledCourses.length > 0 ? totalProgress / enrolledCourses.length : 0;

    stats.course_stats = {
      ...stats.course_stats,
      total_enrollments: enrolledCourses.length,
      completed_enrollments: completedCourses,
      overall_course_completion_pct: Math.round(avgProgress)
    };
  }

  const loading = profileLoading;
  const error = profileError;

  // Check for tab query parameter on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'courses'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const getRankColor = (rank) => {
    if (!rank) return '#8b5cf6';
    if (rank <= 3) return '#FFD700';
    if (rank <= 10) return '#C0C0C0';
    if (rank <= 100) return '#CD7F32';
    return '#8b5cf6';
  };

  if (loading) {
    return (
      <div className="profile-page">
        {/* Skeleton Header */}
        <div className="profile-header" style={{ minHeight: '200px' }}>
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="skeleton-line" style={{ width: '100px', height: '100px', borderRadius: '50%' }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton-line mb-2" style={{ width: '40%', height: '28px' }}></div>
                <div className="skeleton-line mb-2" style={{ width: '60%', height: '16px' }}></div>
                <div className="skeleton-line" style={{ width: '30%', height: '20px' }}></div>
              </div>
            </div>
            <div className="profile-stats-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card" style={{ pointerEvents: 'none' }}>
                  <div className="skeleton-line" style={{ width: '55px', height: '55px', borderRadius: '10px' }}></div>
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-line mb-1" style={{ width: '40%', height: '22px' }}></div>
                    <div className="skeleton-line" style={{ width: '60%', height: '12px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton Tabs */}
        <div className="profile-tabs">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-line" style={{ width: '120px', height: '40px', borderRadius: '4px' }}></div>
          ))}
        </div>

        {/* Skeleton Content */}
        <div className="profile-content">
          <div className="overview-grid">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="progress-card">
                <div className="skeleton-line mb-3" style={{ width: '40%', height: '22px' }}></div>
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="skeleton-line mb-2" style={{ width: '100%', height: '50px', borderRadius: '8px' }}></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <>
        <div className="profile-error">
          <h2>Profile not found</h2>
          <button onClick={() => navigate('/leaderboard')}>View Leaderboard</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="profile-page"
        style={{
          opacity: profile ? 1 : 0,
          transition: 'opacity 0.3s ease-out'
        }}
      >
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            {profile.user.profile_picture ? (
              <img src={profile.user.profile_picture} alt={profile.user.username} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {profile.user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="profile-header-info">
              <h1 className="profile-full-name" style={{fontSize:`25px`}}>{profile.user.first_name} {profile.user.last_name}</h1>
              <p className="profile-college">
                <i className="fas fa-university"></i> {profile.user.college_name}
              </p>
              <div className="profile-rank-badge" style={{ background: `linear-gradient(135deg, ${getRankColor(profile.global_rank)} 0%, ${getRankColor(profile.global_rank)}CC 100%)` }}>
                {profile.user.usn}
              </div>
            </div>
          </div>

          {/* Stats Overview Cards */}
          <div className="profile-stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f86541ff', fontSize: '1.6rem' }}>
                ⭐
              </div>
              <div className="stat-content">
                <div className="stat-value">{profile.total_points || 0}</div>
                <div className="stat-label">Total Points</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ecc2e2ff', fontSize: '1.6rem' }}>
                ✅
              </div>
              <div className="stat-content">
                <div className="stat-value">{profile.challenges_solved || 0}</div>
                <div className="stat-label">Solved</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#c6baf8ff', fontSize: '1.6rem' }}>
                🔥
              </div>
              <div className="stat-content">
                <div className="stat-value">{profile.current_streak || 0}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ffedcbff', fontSize: '1.6rem' }}>
                💻
              </div>
              <div className="stat-content">
                <div className="stat-value">{profile.total_submissions || 0}</div>
                <div className="stat-label">Attempted</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Calendar */}
      <ContributionCalendar userId={userId || profile.user.id} />

      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          style={{
            ':hover': { color: '#000' },
            color: activeTab === 'overview' ? '#000' : undefined
          }}
        >
          <i className="fas fa-chart-line"></i> Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
          style={{
            ':hover': { color: '#000' },
            color: activeTab === 'courses' ? '#000' : undefined
          }}
        >
          <i className="fas fa-book"></i> Courses ({enrolledCourses.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Challenge Progress */}
              <div className="progress-card">
                <h3><i className="fas fa-tasks"></i> Challenge Progress</h3>
                <div className="difficulty-progress">
                  <div className="difficulty-item easy">
                    <div className="difficulty-header">
                      <span className="difficulty-label">Easy</span>
                      <span className="difficulty-count">{profile.easy_solved || 0}/{(stats?.difficulty_breakdown?.easy?.total) || 0}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${((profile.easy_solved || 0) / Math.max((stats?.difficulty_breakdown?.easy?.total) || 0, 1) * 100) || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="difficulty-item medium">
                    <div className="difficulty-header">
                      <span className="difficulty-label">Medium</span>
                      <span className="difficulty-count">{profile.medium_solved || 0}/{(stats?.difficulty_breakdown?.medium?.total) || 0}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${((profile.medium_solved || 0) / Math.max((stats?.difficulty_breakdown?.medium?.total) || 0, 1) * 100) || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="difficulty-item hard">
                    <div className="difficulty-header">
                      <span className="difficulty-label">Hard</span>
                      <span className="difficulty-count">{profile.hard_solved || 0}/{(stats?.difficulty_breakdown?.hard?.total) || 0}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${((profile.hard_solved || 0) / Math.max((stats?.difficulty_breakdown?.hard?.total) || 0, 1) * 100) || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Stats */}
              <div className="stats-card">
                <h3><i className="fas fa-code"></i> Submission Statistics</h3>
                <div className="stats-list">
                  <div className="stats-item">
                    <span className="stats-label"><i className="fas fa-arrow-up"></i> Total Submissions</span>
                    <span className="stats-value">{profile.total_submissions || 0}</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-label"><i className="fas fa-check" style={{ color: '#10b981' }}></i> Accepted</span>
                    <span className="stats-value success">{profile.successful_submissions || 0}</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-label"><i className="fas fa-bullseye" style={{ color: '#f59e0b' }}></i> Accuracy</span>
                    <span className="stats-value">{profile.accuracy_percentage || 0}%</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-label"><i className="fas fa-crown" style={{ color: '#fbbf24' }}></i> Longest Streak</span>
                    <span className="stats-value">{profile.longest_streak || 0} days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Overview */}
            <div className="overview-grid">
              <div className="stats-card">
                <h3><i className="fas fa-book"></i> Course Overview</h3>
                <div className="stats-list">
                  <div className="stats-item"><span className="stats-label"><i className="fas fa-plus-circle" style={{ color: '#3b82f6' }}></i> Enrolled</span><span className="stats-value">{stats?.course_stats?.total_enrollments || 0}</span></div>
                  <div className="stats-item"><span className="stats-label"><i className="fas fa-flag-checkered" style={{ color: '#10b981' }}></i> Completed</span><span className="stats-value success">{stats?.course_stats?.completed_enrollments || 0}</span></div>
                  <div className="stats-item"><span className="stats-label"><i className="fas fa-percentage" style={{ color: '#8b5cf6' }}></i> Completion</span><span className="stats-value">{stats?.course_stats?.overall_course_completion_pct || 0}%</span></div>
                </div>
              </div>

              <div className="stats-card">
                <h3><i className="fas fa-clock"></i> Learning Hours</h3>
                <div className="stats-list">
                  <div className="stats-item"><span className="stats-label"><i className="fas fa-hourglass-start" style={{ color: '#f59e0b' }}></i> Total Planned</span><span className="stats-value">{stats?.course_stats?.total_course_hours || 0} h</span></div>
                  <div className="stats-item"><span className="stats-label"><i className="fas fa-hourglass-end" style={{ color: '#10b981' }}></i> Completed</span><span className="stats-value success">{stats?.course_stats?.completed_course_hours || 0} h</span></div>
                  <div className="stats-item"><span className="stats-label"><i className="fas fa-hourglass-half" style={{ color: '#3b82f6' }}></i> In-Progress</span><span className="stats-value">{stats?.course_stats?.inprogress_completed_hours || 0} h</span></div>
                </div>
              </div>
            </div>

          </div>
        )}
        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="courses-tab">
            <h2><i className="fas fa-book"></i> Enrolled Courses</h2>
            
            {/* Show info if user is viewing their own profile */}
            {!userId && enrolledCourses.length === 0 && (
              <div className="info-message" style={{
                background: '#3b82f610',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#3b82f6'
              }}>
                <i className="fas fa-info-circle"></i> Enroll in courses from the Courses page to see them here
              </div>
            )}
            
            {enrolledCourses.length > 0 ? (
              <div className="courses-grid">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="course-card"
                    onClick={() => {
                      if (course.id) {
                        navigate(`/course-view/${course.id}`);
                      } else {
                        console.error('❌ Course ID is missing:', course);
                      }
                    }}
                  >
                    <div className="course-image">
                      {course.thumbnail || course.image ? (
                        <img 
                          src={course.thumbnail || course.image} 
                          alt={course.title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="course-placeholder" style={{ display: (course.thumbnail || course.image) ? 'none' : 'flex' }}>
                        <i className="fas fa-book-open"></i>
                      </div>
                      <div className="course-progress-overlay">
                        <small style={{ color: '#fff', display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Course Progress: {Math.round(course.progress || 0)}%
                        </small>
                        <div className="progress" style={{ height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ 
                                    width: `${Math.round(course.progress || 0)}%`,
                                    backgroundColor: '#fff'
                                }}
                                aria-valuenow={Math.round(course.progress || 0)}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                      </div>
                    </div>
                    <div className="course-info">
                      <h3>{course.title}</h3>
                      {course.instructor && (
                        <p className="course-instructor">
                          <i className="fas fa-user"></i> {course.instructor.first_name} {course.instructor.last_name}
                        </p>
                      )}

                      {/* Progress Details */}
                      <div style={{ marginBottom: '0.75rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                          <span style={{ color: '#6c757d' }}>Progress</span>
                          <span style={{ fontWeight: '600', color: '#212529' }}>{Math.round(course.progress || 0)}%</span>
                        </div>
                        {course.completed_topics !== undefined && course.total_topics > 0 && (
                          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                            {course.completed_topics} of {course.total_topics} topics completed
                          </div>
                        )}
                      </div>

                      <div className="course-meta">
                        <span><i className="fas fa-book"></i> {course.total_topics || 0} Topics</span>
                        {course.enrolled_at && (
                          <span><i className="fas fa-calendar"></i> {new Date(course.enrolled_at).toLocaleDateString()}</span>
                        )}
                      </div>

                      {course.last_accessed && (
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem' }}>
                          <i className="fas fa-clock"></i> Last accessed: {new Date(course.last_accessed).toLocaleDateString()}
                        </div>
                      )}

                      {course.status && (
                        <div className="course-status" style={{
                          padding: '0.5rem',
                          marginTop: '0.75rem',
                          marginBottom: '0.5rem',
                          borderRadius: '5px',
                          textAlign: 'center',
                          background: course.status === 'completed' ? '#10b98120' : '#8b5cf620',
                          color: course.status === 'completed' ? '#10b981' : '#8b5cf6',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}>
                          {course.status === 'completed' ? '✅ Completed' : '📚 In Progress'}
                        </div>
                      )}
                      <button className="course-continue-btn" style={{
                        backgroundColor: Math.round(course.progress) === 100 ? '#10b981' : undefined
                      }}>
                        {Math.round(course.progress) === 100 
                          ? '✅ Completed'
                          : course.progress > 0 
                            ? 'Continue Learning' 
                            : 'Start Course'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-courses">
                <i className="fas fa-book"></i>
                <p>No courses enrolled yet</p>
                <button className="btn-primary" onClick={() => navigate('/course')}>
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
    </>
  );
};

export default Profile;
