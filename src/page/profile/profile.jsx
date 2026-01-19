// edukon/src/page/profile/profile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import UserCertificates from '../../component/certification/UserCertificates';
import api, { API_BASE_URL } from '../../services/api';
import './profile.css';

const Profile = () => {
  const { userId, collegeSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Check for tab query parameter on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'courses', 'certificates', 'activity'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProfileData();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      
      // Fetch profile using api service
      // Use auth/me endpoint for current user, profile endpoint for other users
      const profileEndpoint = userId
        ? `/student/profile/${userId}/`
        : `/student/profile/me/`;
      
      
      const profileRes = await api.get(profileEndpoint);
            
      const profileData = profileRes.data;
      setProfile(profileData);

      // Fetch detailed stats (optional - don't fail if not available)
      try {
        const statsEndpoint = userId
          ? `/student/profile/${userId}/stats/`
          : `/student/profile/${profileData.user.id}/stats/`;
        
        const statsRes = await api.get(statsEndpoint);
        // Ensure course_stats exists
        const s = statsRes.data || {};
        s.course_stats = s.course_stats || {
          total_enrollments: 0,
          completed_enrollments: 0,
          overall_course_completion_pct: 0,
          total_course_hours: 0,
          completed_course_hours: 0,
          inprogress_completed_hours: 0,
          hours_completed_overall: 0,
        };
        // Ensure difficulty_breakdown exists
        s.difficulty_breakdown = s.difficulty_breakdown || {
          easy: { total: 0 },
          medium: { total: 0 },
          hard: { total: 0 },
        };
        // Ensure submissions exists
        s.submissions = s.submissions || { total: 0, accepted: 0, accuracy: 0 };
        // Ensure recent_submissions exists
        s.recent_submissions = s.recent_submissions || [];
        setStats(s);
      } catch (err) {
        console.warn('⚠️ Stats not available:', err.message);
        // Provide safe defaults so UI renders
        setStats({
          submissions: { total: 0, accepted: 0, accuracy: 0 },
          difficulty_breakdown: {
            easy: { total: 0 },
            medium: { total: 0 },
            hard: { total: 0 },
          },
          recent_submissions: [],
          course_stats: {
            total_enrollments: 0,
            completed_enrollments: 0,
            overall_course_completion_pct: 0,
            total_course_hours: 0,
            completed_course_hours: 0,
            inprogress_completed_hours: 0,
            hours_completed_overall: 0,
          },
        });
      }

      // Fetch activities (optional - don't fail if not available)
      try {
        const userIdForActivities = userId || profileData.user.id;
        const activitiesEndpoint = `/student/profile/${userIdForActivities}/activity/?limit=100`;
        const activitiesRes = await api.get(activitiesEndpoint);

        // Handle different response formats from backend
        let activitiesData = [];
        if (activitiesRes.data.activities && Array.isArray(activitiesRes.data.activities)) {
          activitiesData = activitiesRes.data.activities;
        } else if (activitiesRes.data.results && Array.isArray(activitiesRes.data.results)) {
          activitiesData = activitiesRes.data.results;
        } else if (activitiesRes.data.data && Array.isArray(activitiesRes.data.data)) {
          activitiesData = activitiesRes.data.data;
        } else if (Array.isArray(activitiesRes.data)) {
          activitiesData = activitiesRes.data;
        }

        setActivities(activitiesData);
      } catch (err) {
        console.warn('⚠️ Activities not available:', err.message);
        console.error('⚠️ Full error:', err);
        setActivities([]);
      }

      // Fetch enrolled courses (optional)
      try {
        // Prefer student namespace to avoid router differences
        const coursesRes = await api.get('/student/enrollments/');
        // Extract courses from enrollments
        const enrollments = coursesRes.data.results || coursesRes.data.data || coursesRes.data || [];

        // Use progress from backend enrollment (already calculated via ContentProgress)
        const courses = enrollments.map(enrollment => {
          const course = enrollment.course || {};
          const courseId = course.id || enrollment.course_id;

          return {
            ...course,
            id: courseId,
            progress: enrollment.progress_percentage || 0, // Use backend calculated progress
            enrolled_at: enrollment.enrolled_at || enrollment.created_at,
            status: enrollment.status,
            completion_status: enrollment.completion_status,
            last_accessed: enrollment.last_accessed,
            completed_topics: enrollment.completed_topics || 0,
            total_topics: course.total_topics || course.topics_count || 0
          };
        });

        setEnrolledCourses(courses);

        // Update stats with backend progress
        const completedCourses = courses.filter(c => c.status === 'completed' || c.progress >= 100).length;
        const totalProgress = courses.reduce((sum, c) => sum + (c.progress || 0), 0);
        const avgProgress = courses.length > 0 ? totalProgress / courses.length : 0;

        setStats(prevStats => ({
          ...prevStats,
          course_stats: {
            ...(prevStats?.course_stats || {}),
            total_enrollments: courses.length,
            completed_enrollments: completedCourses,
            overall_course_completion_pct: Math.round(avgProgress)
          }
        }));
      } catch (err) {
        console.warn('⚠️ Enrolled courses not available:', err.message);
        setEnrolledCourses([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setProfile(null);
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (!rank) return '#8b5cf6';
    if (rank <= 3) return '#FFD700';
    if (rank <= 10) return '#C0C0C0';
    if (rank <= 100) return '#CD7F32';
    return '#8b5cf6';
  };

  if (loading) {
    return (
      <>
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  if (!profile) {
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
      <div className="profile-page">
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
        <button
          className={`tab-btn ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
          style={{
            ':hover': { color: '#000' },
            color: activeTab === 'certificates' ? '#000' : undefined
          }}
        >
          <i className="fas fa-certificate"></i> Certificates
        </button>
        <button
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
          style={{
            ':hover': { color: '#000' },
            color: activeTab === 'activity' ? '#000' : undefined
          }}
        >
          <i className="fas fa-history"></i> Activity
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


        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="certificates-tab">
            <UserCertificates collegeSlug={collegeSlug} />
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

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="activity-tab">

            {/* Recent Submissions */}
            {stats?.recent_submissions && stats.recent_submissions.length > 0 && (
              <div className="recent-submissions">
                <h3><i className="fas fa-history"></i> Recent Submissions</h3>
                <div className="submissions-list">
                  {stats.recent_submissions.map((submission, index) => (
                    <div key={index} className="submission-item">
                      <div className="submission-title">{submission.challenge__title}</div>
                      <div className="submission-details">
                        <span className={`submission-status ${submission.status.toLowerCase()}`}>
                          {submission.status}
                        </span>
                        <span className="submission-language">{submission.language}</span>
                        <span className="submission-date">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
