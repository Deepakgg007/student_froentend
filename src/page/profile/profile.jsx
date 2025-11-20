// edukon/src/page/profile/profile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../component/layout/header';
import Footer from '../../component/layout/footer';
import UserCertificates from '../../component/certification/UserCertificates';
import api, { API_BASE_URL } from '../../services/api';
import './profile.css';

const Profile = () => {
  const { userId, collegeSlug } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [activities, setActivities] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching profile, userId:', userId);
      
      // Fetch profile using api service
      // Use auth/me endpoint for current user, profile endpoint for other users
      const profileEndpoint = userId
        ? `/student/profile/${userId}/`
        : `/student/profile/me/`;
      
      console.log('📡 Profile URL:', `${API_BASE_URL}/api${profileEndpoint}`);
      
      const profileRes = await api.get(profileEndpoint);
      
      console.log('📦 Profile Response Status:', profileRes.status);
      console.log('✅ Profile Data:', profileRes.data);
      
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

      // Fetch badges (optional - don't fail if not available)
      try {
        const badgesEndpoint = userId
          ? `/student/badges/user/${userId}/`
          : `/student/badges/user/${profileData.user.id}/`;
        
        const badgesRes = await api.get(badgesEndpoint);
        setBadges(badgesRes.data.badges || badgesRes.data || []);
      } catch (err) {
        console.warn('⚠️ Badges not available:', err.message);
        setBadges([]);
      }

      // Fetch activities (optional - don't fail if not available)
      try {
        const activitiesEndpoint = userId
          ? `/student/profile/${userId}/activity/?limit=20`
          : `/student/profile/${profileData.user.id}/activity/?limit=20`;

        const activitiesRes = await api.get(activitiesEndpoint);
        const activitiesData = activitiesRes.data.activities || activitiesRes.data.results || activitiesRes.data.data || activitiesRes.data || [];
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      } catch (err) {
        console.warn('⚠️ Activities not available:', err.message);
        setActivities([]);
      }

      // Fetch enrolled courses (optional)
      try {
        // Prefer student namespace to avoid router differences
        const coursesRes = await api.get('/student/enrollments/');
        console.log('✅ Enrolled courses response:', coursesRes.data);
        // Extract courses from enrollments
        const enrollments = coursesRes.data.results || coursesRes.data.data || coursesRes.data || [];
        console.log('📚 Enrollments array:', enrollments);

        // Use progress from backend enrollment (already calculated via ContentProgress)
        const courses = enrollments.map(enrollment => {
          const course = enrollment.course || {};
          const courseId = course.id || enrollment.course_id;
          console.log('📖 Course:', course.title, 'Progress:', enrollment.progress_percentage, '%');

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

        console.log('✅ Processed courses:', courses);
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

  const getRarityColor = (rarity) => {
    const colors = {
      'COMMON': '#94a3b8',
      'RARE': '#3b82f6',
      'EPIC': '#a855f7',
      'LEGENDARY': '#f59e0b'
    };
    return colors[rarity] || '#94a3b8';
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      await api.post('/auth/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="profile-error">
          <h2>Profile not found</h2>
          <button onClick={() => navigate('/leaderboard')}>View Leaderboard</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
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
              <h1 className="profile-username">{profile.user.username}</h1>
              <p className="profile-full-name">{profile.user.first_name} {profile.user.last_name}</p>
              <p className="profile-college">
                <i className="fas fa-university"></i> {profile.user.college_name}
              </p>
              <div className="profile-rank-badge" style={{ background: `linear-gradient(135deg, ${getRankColor(profile.global_rank)} 0%, ${getRankColor(profile.global_rank)}CC 100%)` }}>
                {profile.rank_badge}
              </div>
            </div>
          </div>

          {/* Stats Overview Cards */}
          <div className="profile-stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <i className="fas fa-trophy"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{profile.total_points}</div>
                <div className="stat-label">Total Points</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                <i className="fas fa-medal"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">#{profile.global_rank || 'N/A'}</div>
                <div className="stat-label">Global Rank</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{profile.challenges_solved}</div>
                <div className="stat-label">Solved</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <i className="fas fa-fire"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{profile.current_streak}</div>
                <div className="stat-label">Day Streak</div>
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
          className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
          style={{
            ':hover': { color: '#000' },
            color: activeTab === 'badges' ? '#000' : undefined
          }}
        >
          <i className="fas fa-award"></i> Badges ({badges.length})
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
        {!userId && (
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            style={{ 
              ':hover': { color: '#000' },
              color: activeTab === 'settings' ? '#000' : undefined 
            }}
          >
            <i className="fas fa-cog"></i> Settings
          </button>
        )}
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
                    <span className="stats-label">Total Submissions</span>
                    <span className="stats-value">{profile.total_submissions || 0}</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-label">Accepted</span>
                    <span className="stats-value success">{profile.successful_submissions || 0}</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-label">Accuracy</span>
                    <span className="stats-value">{profile.accuracy_percentage || 0}%</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-label">Longest Streak</span>
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
                  <div className="stats-item"><span className="stats-label">Enrolled</span><span className="stats-value">{stats?.course_stats?.total_enrollments || 0}</span></div>
                  <div className="stats-item"><span className="stats-label">Completed</span><span className="stats-value success">{stats?.course_stats?.completed_enrollments || 0}</span></div>
                  <div className="stats-item"><span className="stats-label">Completion</span><span className="stats-value">{stats?.course_stats?.overall_course_completion_pct || 0}%</span></div>
                </div>
              </div>

              <div className="stats-card">
                <h3><i className="fas fa-clock"></i> Learning Hours</h3>
                <div className="stats-list">
                  <div className="stats-item"><span className="stats-label">Total Planned</span><span className="stats-value">{stats?.course_stats?.total_course_hours || 0} h</span></div>
                  <div className="stats-item"><span className="stats-label">Completed</span><span className="stats-value success">{stats?.course_stats?.completed_course_hours || 0} h</span></div>
                  <div className="stats-item"><span className="stats-label">In-Progress</span><span className="stats-value">{stats?.course_stats?.inprogress_completed_hours || 0} h</span></div>
                </div>
              </div>
            </div>

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

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="badges-tab">
            {badges.length > 0 ? (
              <div className="badges-grid">
                {badges.map((userBadge) => (
                  <div
                    key={userBadge.id}
                    className="badge-card"
                    style={{ borderColor: getRarityColor(userBadge.badge.rarity) }}
                  >
                    <div className="badge-icon" style={{ background: getRarityColor(userBadge.badge.rarity) }}>
                      {userBadge.badge.icon}
                    </div>
                    <div className="badge-info">
                      <h4 className="badge-name">{userBadge.badge.name}</h4>
                      <p className="badge-description">{userBadge.badge.description}</p>
                      <div className="badge-meta">
                        <span className="badge-rarity" style={{ color: getRarityColor(userBadge.badge.rarity) }}>
                          {userBadge.badge.rarity}
                        </span>
                        <span className="badge-date">
                          {new Date(userBadge.earned_at).toLocaleDateString()}
                        </span>
                      </div>
                      {userBadge.badge.bonus_points > 0 && (
                        <div className="badge-bonus">+{userBadge.badge.bonus_points} pts</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-badges">
                <i className="fas fa-award"></i>
                <p>No badges earned yet. Start solving challenges!</p>
              </div>
            )}
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
                        console.log('🚀 Navigating to course:', course.id);
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
            <h2><i className="fas fa-history"></i> Recent Activity</h2>
            
            {/* Activity Analysis */}
            {profile && (
              <div className="activity-analysis">
                <div className="analysis-card">
                  <h3><i className="fas fa-chart-bar"></i> Activity Overview</h3>
                  <div className="analysis-stats">
                    <div className="analysis-stat">
                      <div className="stat-circle" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <span>{profile.challenges_solved}</span>
                      </div>
                      <p>Challenges Solved</p>
                    </div>
                    <div className="analysis-stat">
                      <div className="stat-circle" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                        <span>{profile.total_submissions || 0}</span>
                      </div>
                      <p>Total Submissions</p>
                    </div>
                    <div className="analysis-stat">
                      <div className="stat-circle" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <span>{profile.current_streak}</span>
                      </div>
                      <p>Current Streak</p>
                    </div>
                    <div className="analysis-stat">
                      <div className="stat-circle" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                        <span>{badges.length}</span>
                      </div>
                      <p>Badges Earned</p>
                    </div>
                  </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="analysis-card">
                  <h3><i className="fas fa-chart-pie"></i> Difficulty Breakdown</h3>
                  <div className="difficulty-bars">
                    <div className="difficulty-bar-item">
                      <div className="difficulty-bar-header">
                        <span className="difficulty-label easy">Easy</span>
                        <span className="difficulty-count">{profile.easy_solved}</span>
                      </div>
                      <div className="difficulty-bar-track">
                        <div 
                          className="difficulty-bar-fill easy" 
                          style={{ width: `${(profile.easy_solved / Math.max(profile.challenges_solved, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="difficulty-bar-item">
                      <div className="difficulty-bar-header">
                        <span className="difficulty-label medium">Medium</span>
                        <span className="difficulty-count">{profile.medium_solved}</span>
                      </div>
                      <div className="difficulty-bar-track">
                        <div 
                          className="difficulty-bar-fill medium" 
                          style={{ width: `${(profile.medium_solved / Math.max(profile.challenges_solved, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="difficulty-bar-item">
                      <div className="difficulty-bar-header">
                        <span className="difficulty-label hard">Hard</span>
                        <span className="difficulty-count">{profile.hard_solved}</span>
                      </div>
                      <div className="difficulty-bar-track">
                        <div 
                          className="difficulty-bar-fill hard" 
                          style={{ width: `${(profile.hard_solved / Math.max(profile.challenges_solved, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="activity-timeline-section">
              <h3>Activity Timeline</h3>
              
              {!userId && activities.length === 0 && (
                <div className="info-message" style={{
                  background: '#f59e0b10',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  color: '#f59e0b'
                }}>
                  <i className="fas fa-info-circle"></i> Your activity will appear here as you solve challenges and earn badges
                </div>
              )}
              
            {activities.length > 0 ? (
              <div className="activity-timeline">
                {activities.map((activity, index) => (
                  <div key={activity.id || index} className="activity-item">
                    <div className="activity-icon">
                      {activity.activity_type === 'CHALLENGE_SOLVED' && <i className="fas fa-check-circle"></i>}
                      {activity.activity_type === 'BADGE_EARNED' && <i className="fas fa-award"></i>}
                      {activity.activity_type === 'SUBMISSION' && <i className="fas fa-code"></i>}
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <span className="activity-type">{activity.activity_type_display || activity.activity_type}</span>
                        {activity.points_earned > 0 && (
                          <span className="activity-points">+{activity.points_earned} pts</span>
                        )}
                      </div>
                      <div className="activity-details">
                        {activity.details?.challenge_title && (
                          <span>{activity.details.challenge_title}</span>
                        )}
                        {activity.details?.badge_name && (
                          <span>{activity.details.badge_icon} {activity.details.badge_name}</span>
                        )}
                      </div>
                      <div className="activity-date">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-activity">
                <i className="fas fa-history"></i>
                <p>No recent activity</p>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && !userId && (
          <div className="settings-tab">
            <h2><i className="fas fa-cog"></i> Account Settings</h2>
            
            <div className="settings-section">
              <h3><i className="fas fa-lock"></i> Change Password</h3>
              <p className="settings-description">Update your password to keep your account secure</p>
              
              <button className="btn-change-password" onClick={() => setShowPasswordModal(true)}>
                <i className="fas fa-key"></i> Change Password
              </button>
            </div>

            <div className="settings-section">
              <h3><i className="fas fa-user"></i> Profile Information</h3>
              <p className="settings-description">Your profile information</p>
              <div className="info-grid">
                <div className="info-item">
                  <label>Username</label>
                  <p>{profile.user.username}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{profile.user.email}</p>
                </div>
                <div className="info-item">
                  <label>College</label>
                  <p>{profile.user.college_name}</p>
                </div>
                <div className="info-item">
                  <label>Member Since</label>
                  <p>{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-lock"></i> Change Password</h2>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="password-form">
              {passwordError && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i> {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle"></i> {passwordSuccess}
                </div>
              )}

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                  placeholder="Enter new password (min 8 characters)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i> Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
};

export default Profile;
