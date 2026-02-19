import { Fragment, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useUserApproval, showApprovalPendingAlert, showNotVerifiedAlert, showAccountRejectedAlert } from "../../hooks/useUserApproval";
import './course-single.css';

const CourseSingle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [syllabus, setSyllabus] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState('');
    const [activeTab, setActiveTab] = useState('topic0');
    const { user, isApproved, isVerified, approvalStatus } = useUserApproval();

    // Suppress YouTube embed errors caused by ad blockers
    useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            const message = args[0]?.toString() || '';
            // Filter out YouTube-related errors from ad blockers
            if (message.includes('ERR_BLOCKED_BY_CLIENT') ||
                message.includes('youtube') ||
                message.includes('log_event')) {
                return; // Suppress these errors
            }
            originalError.apply(console, args);
        };
        return () => {
            console.error = originalError;
        };
    }, []);

    useEffect(() => {
        fetchCourseDetails();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            setError('');

            const [courseResponse, syllabusResponse, enrollmentResponse] = await Promise.all([
                api.get(`/courses/${id}/`),
                api.get(`/syllabi/?course=${id}`).catch(() => ({ data: { results: [] } })),
                api.get(`/student/enrollments/?course=${id}`).catch(() => ({ data: { data: [] } }))
            ]);

            const courseData = courseResponse.data.data || courseResponse.data;
            setCourse(courseData);

            const syllabusData = syllabusResponse.data.results?.[0] || syllabusResponse.data.data?.[0] || syllabusResponse.data[0];
            if (syllabusData) {
                setSyllabus(syllabusData);
            }

            // Handle enrollment response - check different formats
            let enrollmentList = [];
            if (enrollmentResponse.data && enrollmentResponse.data.data) {
                // StandardResponseMixin format: { success: true, data: [...], pagination: {...} }
                enrollmentList = Array.isArray(enrollmentResponse.data.data)
                    ? enrollmentResponse.data.data
                    : [];
            } else if (enrollmentResponse.data && enrollmentResponse.data.results) {
                // Alternative format with results
                enrollmentList = Array.isArray(enrollmentResponse.data.results)
                    ? enrollmentResponse.data.results
                    : [];
            }

            // Set enrollment if user is enrolled in this course
            const enrollmentData = enrollmentList?.[0];
            if (enrollmentData) {
                setEnrollment(enrollmentData);
            } else {
                setEnrollment(null);
            }

            // Trigger smooth fade-in transition
            setTimeout(() => setReady(true), 50);
        } catch (err) {
            console.error('Failed to fetch course details:', err);
            setError('Failed to load course details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        // Check if user is logged in before attempting enrollment
        const token = localStorage.getItem('student_access_token');
        if (!token) {
            // Redirect to login with return URL
            window.location.href = `/login?next=/course-single/${id}`;
            return;
        }

        // Check approval status before allowing enrollment
        if (!isVerified) {
            showNotVerifiedAlert(user);
            return;
        }

        if (approvalStatus === 'rejected') {
            showAccountRejectedAlert(user);
            return;
        }

        if (!isApproved) {
            showApprovalPendingAlert(user);
            return;
        }

        try {
            setEnrolling(true);
            setEnrollError('');
            // Use the course enroll endpoint instead of direct enrollment creation
            await api.post(`/courses/${course.id}/enroll/`);
            await fetchCourseDetails();
            setEnrollError('');
        } catch (err) {
            console.error('Enrollment error:', err.response?.data);

            // If 401 (not authenticated), redirect to login
            if (err.response?.status === 401) {
                window.location.href = `/login?next=/course-single/${id}`;
                return;
            }

            let errorMessage = 'Failed to enroll in course';

            if (err.response?.data) {
                const data = err.response.data;
                errorMessage = data.message || data.detail || data.error || errorMessage;
            }

            setEnrollError(errorMessage);
        } finally {
            setEnrolling(false);
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'assets/images/course/01.jpg';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${imageUrl}`;
    };

    const getDifficultyBadgeClass = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'beginner': return 'bg-success';
            case 'intermediate': return 'bg-warning';
            case 'advanced': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    // Convert YouTube watch URL to embed URL with privacy-enhanced parameters
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';
        // Convert watch URL to embed URL
        let embedUrl = url.replace('watch?v=', 'embed/');
        // Use youtube-nocookie.com for better privacy
        embedUrl = embedUrl.replace('youtube.com', 'youtube-nocookie.com');
        // Add parameters to reduce tracking
        const separator = embedUrl.includes('?') ? '&' : '?';
        return `${embedUrl}${separator}rel=0&modestbranding=1`;
    };

    if (loading) {
        return (
            <Fragment>
                <div className="pageheader-section style-2" style={{paddingTop: '100px'}}>
                    <div className="container">
                        <div className="row justify-content-center justify-content-lg-between align-items-center flex-row-reverse">
                            <div className="col-lg-7 col-12">
                                <div className="pageheader-thumb">
                                    <div className="ratio ratio-16x9 skeleton-pulse" style={{
                                        background: '#e0e0e0',
                                        borderRadius: '8px',
                                        minHeight: '400px'
                                    }}></div>
                                </div>
                            </div>
                            <div className="col-lg-5 col-12">
                                <div className="pageheader-content">
                                    <div className="course-category mb-3">
                                        <div className="skeleton-pulse" style={{ width: '120px', height: '30px', borderRadius: '4px', display: 'inline-block' }}></div>
                                    </div>
                                    <h2 className="phs-title">
                                        <div className="skeleton-pulse" style={{ width: '80%', height: '40px', borderRadius: '4px', marginBottom: '10px' }}></div>
                                    </h2>
                                    <p className="phs-desc">
                                        <div className="skeleton-pulse" style={{ width: '100%', height: '20px', borderRadius: '4px', marginBottom: '8px' }}></div>
                                        <div className="skeleton-pulse" style={{ width: '60%', height: '20px', borderRadius: '4px' }}></div>
                                    </p>
                                    <div className="phs-thumb mb-3">
                                        <div className="skeleton-pulse" style={{ width: '150px', height: '24px', borderRadius: '4px' }}></div>
                                    </div>
                                    <div className="skeleton-pulse" style={{ width: '180px', height: '50px', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="course-single-section padding-tb section-bg">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="main-part">
                                    <div className="skeleton-pulse mb-3" style={{ width: '80px', height: '40px', borderRadius: '4px' }}></div>
                                    <div className="skeleton-pulse mb-4" style={{ width: '200px', height: '32px', borderRadius: '4px' }}></div>
                                    <div className="skeleton-pulse mb-2" style={{ width: '100%', height: '16px', borderRadius: '4px' }}></div>
                                    <div className="skeleton-pulse mb-2" style={{ width: '100%', height: '16px', borderRadius: '4px' }}></div>
                                    <div className="skeleton-pulse mb-4" style={{ width: '70%', height: '16px', borderRadius: '4px' }}></div>
                                    <div className="skeleton-pulse mb-2" style={{ width: '100%', height: '16px', borderRadius: '4px' }}></div>
                                    <div className="skeleton-pulse" style={{ width: '50%', height: '16px', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="skeleton-pulse" style={{ width: '100%', height: '200px', borderRadius: '8px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }

    if (error) {
        return (
            <Fragment>
                <div className="course-single-section padding-tb section-bg">
                    <div className="container">
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                        <Link to="/course" className="lab-btn">
                            <span>Back to Courses</span>
                        </Link>
                    </div>
                </div>
            </Fragment>
        );
    }

    if (!course) {
        return (
            <Fragment>
                <div className="course-single-section padding-tb section-bg">
                    <div className="container">
                        <div className="alert alert-warning" role="alert">
                            Course not found
                        </div>
                        <Link to="/course" className="lab-btn">
                            <span>Back to Courses</span>
                        </Link>
                    </div>
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <div className="pageheader-section style-2" style={{
                paddingTop: '100px',
                opacity: ready ? 1 : 0,
                transition: 'opacity 0.3s ease-out'
            }}>
                <div className="container">
                    <div className="row justify-content-center justify-content-lg-between align-items-center flex-row-reverse">
                        <div className="col-lg-7 col-12">
                            <div className="pageheader-thumb">
                                {course.video_intro_url || course.intro_video ? (
                                    <div className="ratio ratio-16x9">
                                        {course.video_intro_url ? (
                                            <iframe
                                                src={getYouTubeEmbedUrl(course.video_intro_url)}
                                                title="Course Introduction Video"
                                                allowFullScreen
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            ></iframe>
                                        ) : (
                                            <video controls className="w-100">
                                                <source src={course.intro_video} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                    </div>
                                ) : (
                                    <img
                                        src={getImageUrl(course.thumbnail)}
                                        alt={course.title}
                                        className="w-100"
                                        onError={(e) => {
                                            e.target.src = 'assets/images/course/01.jpg';
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="col-lg-5 col-12">
                            <div className="pageheader-content">
                                <div className="course-category">
                                    <span className={`course-cate badge ${getDifficultyBadgeClass(course.difficulty_level)}`}>
                                        <i className="icofont-signal"></i> {course.difficulty_level?.toUpperCase() || 'BEGINNER'}
                                    </span>
                                    {course.is_featured && (
                                        <span className="course-offer badge bg-warning">
                                            <i className="icofont-star"></i> Featured
                                        </span>
                                    )}
                                </div>
                                <h2 className="phs-title">{course.title}</h2>
                                <p className="phs-desc">{course.short_description || course.description?.substring(0, 150)}</p>
                                <div className="phs-thumb mb-3">
                                    <span>Course ID: {course.course_id}</span>
                                </div>

                                {enrollError && (
                                    <div className="alert alert-danger mb-3" role="alert">
                                        {enrollError}
                                    </div>
                                )}

                                {enrollment ? (
                                    <div className="d-flex gap-2 flex-wrap align-items-center">
                                        <Link to={`/course-view/${id}`} className="lab-btn">
                                            <i className="icofont-play-alt-2 me-2" style={{ color: "white" }}></i>
                                            <span>Continue Learning</span>
                                        </Link>
                                        <span className="badge bg-success align-self-center px-3 py-2">
                                            <i className="icofont-check-circled me-1"></i> Enrolled
                                        </span>
                                    </div>
                                ) : user && !isApproved ? (
                                    // Show approval pending button for logged-in but not approved users
                                    <button
                                        className="lab-btn"
                                        disabled={true}
                                        style={{ opacity: '0.7', cursor: 'not-allowed' }}
                                    >
                                        <i className="icofont-lock me-2"></i>
                                        <span>{approvalStatus === 'rejected' ? 'Account Rejected' : 'Approval Pending'}</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEnroll}
                                        className="lab-btn"
                                        disabled={enrolling}
                                    >
                                        {enrolling ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                <span>Enrolling...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="icofont-plus me-2"></i>
                                                <span>Enroll Now</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="course-single-section padding-tb section-bg" style={{
                opacity: ready ? 1 : 0,
                transition: 'opacity 0.3s ease-out 0.1s'
            }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="main-part">
                                <div className="course-item">
                                    <div className="course-inner">
                                        <div className="course-content">
                                             <button
        onClick={() => navigate(-1)}
        className="lab-btn mb-3"
    >
        <i className="icofont-simple-left me-2" style={{ color: "white" }}></i>
        <span>Back</span>
    </button>
                                            <h3>Course Overview</h3>
                                            <div dangerouslySetInnerHTML={{ __html: course.description || 'No description available for this course.' }} />

                                            {course.learning_outcomes && (
                                                <>
                                                    <h4 className="mt-4">What You'll Learn:</h4>
                                                    <div dangerouslySetInnerHTML={{ __html: course.learning_outcomes }} />
                                                </>
                                            )}

                                            {course.prerequisites && (
                                                <div className="mt-4">
                                                    <h4>Prerequisites:</h4>
                                                    <div dangerouslySetInnerHTML={{ __html: course.prerequisites }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {syllabus && (syllabus.ordered_topics?.length > 0 || syllabus.topics?.length > 0) && (
                                    <div className="course-video mt-4">
                                        <div className="course-video-title">
                                            <h4>Course Topics</h4>
                                        </div>
                                        <div className="course-video-content">
                                            <div className="accordion" id="accordionExample">
                                                {(syllabus.ordered_topics || syllabus.topics || []).map((topic, index) => {
                                                    const topicKey = `topic${index}`;
                                                    const isOpen = activeTab === topicKey;

                                                    return (
                                                        <div className="accordion-item" key={topic.id || index}>
                                                            <div className="accordion-header" id={`accordion${index}`}>
                                                                <button
                                                                    type="button"
                                                                    className="d-flex flex-wrap justify-content-between align-items-center w-100"
                                                                    onClick={() => setActiveTab(isOpen ? '' : topicKey)}
                                                                    aria-expanded={isOpen ? 'true' : 'false'}
                                                                    aria-controls={topicKey}
                                                                >
                                                                    <span className="me-2">{topic.topic_title || topic.name || topic.title}</span>

                                                                    <span className="d-flex align-items-center ms-auto">
                                                                        {topic.estimated_hours && (
                                                                            <span className="badge bg-primary me-2">{topic.estimated_hours}h</span>
                                                                        )}
                                                                        {/* Arrow icon that rotates when open */}
                                                                        <i
                                                                            className="icofont-simple-down"
                                                                            style={{
                                                                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                                transition: 'transform .18s ease-in-out'
                                                                            }}
                                                                            aria-hidden="true"
                                                                        ></i>
                                                                    </span>
                                                                </button>
                                                            </div>
                                                            <div
                                                                id={topicKey}
                                                                className={`accordion-collapse ${isOpen ? 'show' : ''}`}
                                                                aria-labelledby={`accordion${index}`}
                                                                style={{
                                                                    maxHeight: isOpen ? '2000px' : '0',
                                                                    overflow: 'hidden',
                                                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    opacity: isOpen ? '1' : '0',
                                                                    transform: isOpen ? 'translateY(0)' : 'translateY(-10px)'
                                                                }}
                                                            >
                                                                <div className="p-4">
                                                                    {(topic.topic_description || topic.description) ? (
                                                                        <div style={{ whiteSpace: 'pre-wrap' }}>{topic.topic_description || topic.description}</div>
                                                                    ) : (
                                                                        <p className="text-muted">No description available for this topic.</p>
                                                                    )}
                                                                    {topic.tasks && topic.tasks.length > 0 && (
                                                                        <>
                                                                            <h6 className="mt-3">Tasks:</h6>
                                                                            <ul className="lab-ul">
                                                                                {topic.tasks.map((task, idx) => (
                                                                                    <li key={idx}>
                                                                                        <i className="icofont-tick-mark"></i>
                                                                                        {task.title || task.name || task}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="sidebar-part">
                                <div className="course-side-detail">
                                    <div className="csd-title">
                                        <div className="csdt-left">
                                            <h4 className="mb-0">Course Details</h4>
                                        </div>
                                    </div>
                                    <div className="csd-content">
                                        <div className="csdc-lists">
                                            <ul className="lab-ul">
                                                <li>
                                                    <div className="csdc-left">
                                                        <i className="icofont-clock-time"></i>Duration
                                                    </div>
                                                    <div className="csdc-right">{course.duration_hours || 0} Hours</div>
                                                </li>
                                                <li>
                                                    <div className="csdc-left">
                                                        <i className="icofont-ui-user"></i>Enrolled
                                                    </div>
                                                    <div className="csdc-right">{course.current_enrollments || 0}</div>
                                                </li>
                                                <li>
                                                    <div className="csdc-left">
                                                        <i className="icofont-signal"></i>Difficulty
                                                    </div>
                                                    <div className="csdc-right">{course.difficulty_level?.toUpperCase() || 'BEGINNER'}</div>
                                                </li>
                                                <li>
                                                    <div className="csdc-left">
                                                        <i className="icofont-ui-copy"></i>Course ID
                                                    </div>
                                                    <div className="csdc-right">{course.course_id}</div>
                                                </li>
                                                {course.status && (
                                                    <li>
                                                        <div className="csdc-left">
                                                            <i className="icofont-tag"></i>Status
                                                        </div>
                                                        <div className="csdc-right">{course.status?.toUpperCase()}</div>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </Fragment>
    );
}

export default CourseSingle;