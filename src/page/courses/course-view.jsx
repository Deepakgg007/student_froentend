import { Fragment, useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import api, { getCertifications } from "../../services/api";
import CourseSidebar from "../../component/course/CourseSidebar";
import ContentDisplay from "../../component/course/ContentDisplay";
import './course-view.css';

// Import progress service with error handling
let getCourseProgress;
try {
    const progressService = require("../../services/contentProgressService");
    getCourseProgress = progressService.getCourseProgress;
} catch (err) {
    console.warn('ContentProgress service not available:', err);
    getCourseProgress = null;
}

// Cache for course content - survives for 10 minutes
const courseContentCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const getCachedContent = (courseId) => {
    const cached = courseContentCache.get(courseId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

const setCachedContent = (courseId, data) => {
    courseContentCache.set(courseId, {
        data,
        timestamp: Date.now()
    });
};

const CourseView = () => {
    const params = useParams();
    const { courseId, collegeSlug } = params;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [course, setCourse] = useState(null);
    const [topics, setTopics] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const fetchInProgress = useRef(false);

    const taskId = searchParams.get('taskId');
    const contentType = searchParams.get('contentType');
    const contentId = searchParams.get('contentId');

    useEffect(() => {
        if (courseId && courseId !== 'undefined' && !fetchInProgress.current) {
            fetchCourseContent();
        } else if (!courseId || courseId === 'undefined') {
            console.error('❌ Invalid courseId:', courseId);
            setError('Invalid course ID');
            setLoading(false);
        }
    }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (courseId && courseId !== 'undefined') {
            fetchCertifications();
        }
    }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchRealProgress = async () => {
        if (!getCourseProgress) {
            return;
        }

        try {
            const progressData = await getCourseProgress(courseId);
            setProgress(progressData.percentage || 0);
        } catch (error) {
            console.error('Failed to fetch real progress:', error);
            // Don't set progress on error, let the old calculation handle it
        }
    };

    const fetchCourseContent = async () => {
        // Prevent duplicate fetches
        if (fetchInProgress.current) return;
        fetchInProgress.current = true;

        // Check cache first
        const cached = getCachedContent(courseId);
        if (cached) {
            console.log('Using cached course content for', courseId);
            setCourse(cached.course);
            setTopics(cached.topics);
            setProgress(cached.progress);
            setLoading(false);
            setTimeout(() => setReady(true), 50);

            // Still fetch in background for fresh data
            fetchFreshContent();
            return;
        }

        await fetchFreshContent();
    };

    const fetchFreshContent = async () => {
        try {
            setLoading(true);
            setError('');

            // PARALLEL API CALLS - Fetch all independent data at once
            const [courseResponse, syllabiResponse, topicsResponse] = await Promise.all([
                api.get(`/courses/${courseId}/`),
                api.get(`/syllabi/?course=${courseId}`).catch(() => ({ data: [] })),
                api.get(`/topics/?course=${courseId}`).catch(() => ({ data: [] }))
            ]);

            const courseData = courseResponse.data.data || courseResponse.data;
            setCourse(courseData);

            // Process syllabus data
            let syllabiData = syllabiResponse.data.data || syllabiResponse.data.results || syllabiResponse.data || [];
            if (!Array.isArray(syllabiData)) syllabiData = [syllabiData];
            const primarySyllabus = syllabiData[0] || {};
            let syllabusTopics = primarySyllabus.ordered_topics || [];

            // Fallback to direct topics if no syllabus topics
            if (syllabusTopics.length === 0) {
                let directTopics = topicsResponse.data.data || topicsResponse.data.results || topicsResponse.data || [];
                if (!Array.isArray(directTopics)) directTopics = [directTopics];

                syllabusTopics = directTopics.map(topic => ({
                    topic: topic.id,
                    topic_id: topic.id,
                    topic_title: topic.title,
                    topic_description: topic.description,
                    order: topic.order || 0
                }));
            }

            // PARALLEL: Fetch all tasks for all topics at once
            const topicIds = syllabusTopics
                .map(st => st.topic?.id || st.topic_id || st.topic)
                .filter(id => id && id !== 'undefined');

            // Batch fetch all tasks for all topics in parallel
            const tasksByTopic = await Promise.all(
                topicIds.map(topicId =>
                    api.get(`/tasks/?topic=${topicId}`)
                        .then(res => ({
                            topicId: topicId.toString(),
                            tasks: res.data.data || res.data.results || res.data || []
                        }))
                        .catch(() => ({ topicId: topicId.toString(), tasks: [] }))
                )
            );

            // Create a map of topicId -> tasks
            const topicTasksMap = new Map(
                tasksByTopic.map(item => [item.topicId, item.tasks])
            );

            // PARALLEL: Fetch all task details and MCQ sets in one batch
            const allTasks = tasksByTopic.flatMap(item => item.tasks.filter(t => t.status === 'active'));
            const taskIds = allTasks.map(t => t.id.toString());

            // Batch fetch task details for tasks that need them
            const tasksNeedingDetails = allTasks.filter(task =>
                !task.richtext_pages && !task.videos && !task.documents && !task.questions
            );

            const taskDetailsMap = new Map();
            await Promise.all(
                tasksNeedingDetails.map(task =>
                    api.get(`/tasks/${task.id}/`)
                        .then(res => taskDetailsMap.set(task.id.toString(), res.data.data || res.data))
                        .catch(() => {})
                )
            );

            // Batch fetch all MCQ sets for all tasks
            const mcqSetsByTask = await Promise.all(
                taskIds.map(taskId =>
                    api.get(`/task-mcq-sets/?task=${taskId}`)
                        .then(res => ({ taskId, mcqSets: res.data.results || res.data || [] }))
                        .catch(() => ({ taskId, mcqSets: [] }))
                )
            );

            const mcqSetsMap = new Map(
                mcqSetsByTask.map(item => [item.taskId, item.mcqSets])
            );

            // Build topics with content (no more API calls here!)
            const topicsWithContent = syllabusTopics.map((syllabusTopic) => {
                const topicIdRaw = syllabusTopic.topic?.id || syllabusTopic.topic_id || syllabusTopic.topic;
                const topicId = topicIdRaw?.toString();
                const topicTitle = syllabusTopic.topic?.title || syllabusTopic.topic_title || 'Untitled Topic';
                const topicDescription = syllabusTopic.topic?.description || syllabusTopic.topic_description || '';

                if (!topicId || topicId === 'undefined') {
                    return null;
                }

                const topicTasks = topicTasksMap.get(topicId) || [];
                const activeTasks = topicTasks.filter(task => task.status === 'active');

                const tasksWithContent = activeTasks.map((task) => {
                    const taskDetail = taskDetailsMap.get(task.id.toString()) || task;
                    const mcqSets = mcqSetsMap.get(task.id.toString()) || [];

                    const contentItems = [];

                    // --- Pages ---
                    if (taskDetail.richtext_pages?.length > 0) {
                        taskDetail.richtext_pages.forEach(page => {
                            contentItems.push({
                                ...page,
                                type: 'page',
                                order: page.order || 0,
                                id: page.id.toString()
                            });
                        });
                    }

                    // --- Videos ---
                    if (taskDetail.videos?.length > 0) {
                        taskDetail.videos.forEach(video => {
                            contentItems.push({
                                ...video,
                                type: 'video',
                                order: video.order || 0,
                                id: video.id.toString(),
                                is_completed: video.is_completed || false
                            });
                        });
                    }

                    // --- Documents ---
                    if (taskDetail.documents?.length > 0) {
                        taskDetail.documents.forEach(doc => {
                            contentItems.push({
                                ...doc,
                                type: 'document',
                                order: doc.order || 0,
                                id: doc.id.toString(),
                                is_completed: doc.is_completed || false
                            });
                        });
                    }

                    // --- MCQ Sets ---
                    if (mcqSets.length > 0) {
                        mcqSets.forEach(mcqSet => {
                            const allQuestionsCompleted = mcqSet.mcq_questions?.every(q => q.is_completed === true) || false;

                            contentItems.push({
                                id: mcqSet.id.toString(),
                                type: 'mcq_set',
                                title: mcqSet.title || 'MCQ Set',
                                order: mcqSet.order || 999,
                                questions: mcqSet.mcq_questions || [],
                                task_id: task.id.toString(),
                                is_completed: allQuestionsCompleted,
                                total_marks: mcqSet.total_marks || 0,
                                description: mcqSet.description || ''
                            });
                        });
                    }

                    // --- Coding Questions ---
                    if (taskDetail.questions?.length > 0) {
                        const codingQuestions = taskDetail.questions.filter(q => q.question_type === 'coding');

                        codingQuestions.forEach(question => {
                            contentItems.push({
                                id: question.id.toString(),
                                type: 'coding_question',
                                title: question.question_text?.substring(0, 50) + '...',
                                order: question.order || 1000,
                                question,
                                task_id: task.id.toString(),
                                is_completed: question.is_completed || false
                            });
                        });
                    }

                    contentItems.sort((a, b) => (a.order || 0) - (b.order || 0));

                    return { ...taskDetail, contentItems };
                });

                return {
                    id: topicId,
                    title: topicTitle,
                    description: topicDescription,
                    tasks: tasksWithContent
                };
            }).filter(Boolean);

            const validTopics = topicsWithContent;
            setTopics(validTopics);

            // Cache the results
            setCachedContent(courseId, {
                course: courseData,
                topics: validTopics,
                progress: 0
            });

            // --- Progress ---
            let totalItems = 0;
            let completedItems = 0;
            validTopics.forEach(topic => {
                topic?.tasks.forEach(task => {
                    task.contentItems.forEach(item => {
                        if (item.type !== 'page') {
                            totalItems++;
                            if (item.is_completed) completedItems++;
                        }
                    });
                });
            });
            const currentProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
            setProgress(currentProgress);

            // --- Auto-redirect to first content ---
            if (!taskId && validTopics.length > 0) {
                const firstTopic = validTopics[0];
                const firstTask = firstTopic.tasks?.[0];
                const firstContent = firstTask?.contentItems?.[0];

                if (firstContent) {
                    const currentPath = window.location.pathname;
                    const pathParts = currentPath.split('/').filter(p => p);

                    let baseUrl;
                    if (pathParts.length >= 3 && pathParts[1] === 'course-view') {
                        const collegeSlug = pathParts[0];
                        baseUrl = `/${collegeSlug}/course-view/${courseId}`;
                    } else {
                        baseUrl = `/course-view/${courseId}`;
                    }

                    const redirectUrl = `${baseUrl}?taskId=${firstTask.id.toString()}&contentType=${firstContent.type}&contentId=${firstContent.id.toString()}`;
                    navigate(redirectUrl, { replace: true });
                }
            }

            // Trigger smooth fade-in
            setTimeout(() => setReady(true), 50);

            // Fetch real progress in background
            fetchRealProgress();

        } catch (err) {
            console.error('Failed to fetch course content:', err.response?.data || err);
            setError('Failed to load course content. Please try again later.');
        } finally {
            setLoading(false);
            fetchInProgress.current = false;
        }
    };

    const fetchCertifications = async () => {
        try {
            // Use getCertifications which handles URL following
            const response = await getCertifications();
            const data = response.data;
            const allCerts = Array.isArray(data) ? data : data.results || [];


            // Filter certifications for this course
            const filteredCerts = allCerts.filter(cert =>
                cert.course_id === parseInt(courseId) || cert.course === parseInt(courseId)
            );

            setCertifications(filteredCerts);
        } catch (err) {
            console.error('Error fetching certifications:', err);
            setCertifications([]);
        }
    };

    const handleContentNavigation = (taskId, contentType, contentId) => {
        const params = new URLSearchParams({
            taskId: taskId.toString(),
            contentType,
            contentId: contentId.toString()
        });

        // Preserve the college slug in the URL if it exists
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/').filter(p => p);

        // Check if the current path has a college slug
        let baseUrl;
        if (pathParts.length >= 3 && pathParts[1] === 'course-view') {
            // Has college slug: /college-slug/course-view/courseId
            const collegeSlug = pathParts[0];
            baseUrl = `/${collegeSlug}/course-view/${courseId}`;
        } else {
            // No college slug: /course-view/courseId
            baseUrl = `/course-view/${courseId}`;
        }

        navigate(`${baseUrl}?${params.toString()}`, { replace: true });
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleContentComplete = async (contentId, contentType) => {
        try {
            const response = await api.post(`/student/content/mark-complete/`, {
                content_id: contentId,
                content_type: contentType,
                task_id: taskId,
                course_id: courseId
            });

            // Immediately update the topics state to mark content as completed
            setTopics(prevTopics => {
                const updatedTopics = prevTopics.map(topic => ({
                    ...topic,
                    tasks: topic.tasks.map(task => ({
                        ...task,
                        contentItems: task.contentItems.map(item => {
                            // Match by content type and id
                            if (item.type === contentType && item.id.toString() === contentId.toString()) {
                                return { ...item, is_completed: true };
                            }
                            return item;
                        })
                    }))
                }));
                return updatedTopics;
            });

            // Update progress immediately
            // Only count videos, documents, and questions (NOT rich text pages)
            let totalItems = 0;
            let completedItems = 0;
            topics.forEach(topic => {
                topic?.tasks.forEach(task => {
                    task.contentItems.forEach(item => {
                        // Exclude rich text pages from progress calculation
                        if (item.type !== 'page') {
                            totalItems++;
                            if (item.is_completed || (item.type === contentType && item.id.toString() === contentId.toString())) {
                                completedItems++;
                            }
                        }
                    });
                });
            });

            const currentProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
            setProgress(currentProgress);

            // If progress hits 100%, update the course as completed in backend
            if (Math.round(currentProgress) === 100) {
                (async () => {
                    try {
                        // Try to find the current enrollment ID
                        const enrollRes = await api.get(`/student/enrollments/?course=${courseId}`);
                        const enrollments = enrollRes.data.results || enrollRes.data.data || enrollRes.data || [];
                        const enrollment = Array.isArray(enrollments)
                            ? enrollments.find(e => e.course === courseId || e.course_id === courseId)
                            : enrollments;

                        if (enrollment && enrollment.id && enrollment.status !== 'completed') {
                            await api.post(`/enrollments/${enrollment.id}/complete/`);
                            // Update enrollment status locally
                            enrollment.status = 'completed';
                        }
                    } catch (err) {
                        console.warn(`Failed to mark course ${courseId} as completed after content completion:`, err.message);
                    }
                })();
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            return response.data;
        } catch (err) {
            console.error('❌ course-view: Failed to mark content as complete:', err.response?.data || err);
            throw err;
        }
    };

    if (loading) {
        return (
            <Fragment>
                {/* Skeleton Header */}
                <div className="course-header border-bottom shadow-sm skeleton-pulse" style={{
                    padding: '20px 0',
                    paddingTop: '20px',
                    backgroundColor: '#fff',
                    minHeight: '80px'
                }}>
                    <div className="container-fluid" style={{ maxWidth: '1600px' }}>
                        <div className="row align-items-center">
                            <div className="col-md-8 d-flex align-items-center">
                                <div className="skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '4px', marginRight: '12px' }}></div>
                                <div className="skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '4px', marginRight: '12px' }}></div>
                                <div className="skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '4px', marginRight: '20px' }}></div>
                                <div className="skeleton-box" style={{ width: '300px', height: '24px', borderRadius: '4px' }}></div>
                            </div>
                            <div className="col-md-4">
                                <div className="skeleton-box" style={{ width: '100px', height: '16px', borderRadius: '4px', margin: '0 auto 8px' }}></div>
                                <div className="skeleton-box" style={{ width: '100%', height: '10px', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skeleton Content */}
                <div className="d-flex" style={{ minHeight: 'calc(100vh - 140px)', background: '#f8f9fa' }}>
                    {/* Skeleton Sidebar */}
                    <div style={{ width: '320px', flexShrink: 0, padding: '20px', background: '#fff', borderRight: '1px solid #e0e0e0' }}>
                        <div className="skeleton-box mb-3" style={{ width: '150px', height: '24px', borderRadius: '4px' }}></div>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="skeleton-box mb-3" style={{ width: '100%', height: '40px', borderRadius: '4px' }}></div>
                        ))}
                    </div>

                    {/* Skeleton Main Content */}
                    <div className="flex-grow-1" style={{ padding: '24px', background: '#fafafa' }}>
                        <div className="skeleton-box mb-4" style={{ width: '60%', height: '32px', borderRadius: '4px' }}></div>
                        <div className="skeleton-box mb-3" style={{ width: '100%', height: '200px', borderRadius: '8px' }}></div>
                        <div className="skeleton-box mb-2" style={{ width: '100%', height: '16px', borderRadius: '4px' }}></div>
                        <div className="skeleton-box mb-2" style={{ width: '90%', height: '16px', borderRadius: '4px' }}></div>
                        <div className="skeleton-box" style={{ width: '70%', height: '16px', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </Fragment>
        );
    }

    if (error) {
        return (
            <Fragment>
                <div className="container py-5" style={{ paddingTop: '20px' }}>
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                </div>
           </Fragment>
        );
    }

    return (
        <Fragment>
            <div className="course-header border-bottom shadow-sm" style={{
                padding: '20px 0',
                paddingTop: '20px',
                backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
                opacity: ready ? 1 : 0,
                transition: 'opacity 0.3s ease-out'
            }}>
                <div className="container-fluid" style={{ maxWidth: '1600px' }}>
                    <div className="row align-items-center">
                        <div className="col-md-8 d-flex align-items-center">
                            <button
                                className="btn btn-outline-secondary me-2"
                                onClick={() => navigate('/course')}
                                style={{
                                    padding: '10px 16px',
                                    backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
                                    color: isDarkMode ? '#fff' : '#6c757d',
                                    borderColor: isDarkMode ? '#444' : '#6c757d'
                                }}
                                title="Back to Course List"
                            >
                                <i className="icofont-arrow-left"></i>
                            </button>
                            <button
                                className="btn btn-outline-primary me-3"
                                onClick={toggleSidebar}
                                style={{
                                    padding: '10px 10px',
                                    backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
                                    color: isDarkMode ? '#6ec1e4' : '#0d6efd',
                                    borderColor: isDarkMode ? '#444' : '#0d6efd'
                                }}
                                title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                            >
                                <i className={`icofont-${sidebarOpen ? 'close' : 'navigation-menu'}`}></i>
                            </button>
                            <button
                                className="btn btn-outline-secondary me-3"
                                onClick={toggleDarkMode}
                                style={{
                                    padding: '10px 10px',
                                    backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
                                    color: isDarkMode ? '#ffd700' : '#6c757d',
                                    borderColor: isDarkMode ? '#444' : '#6c757d'
                                }}
                                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                            >
                                <i className={`icofont-${isDarkMode ? 'sun' : 'moon'}`}></i>
                            </button>
                            <div>
                                <h4 className="mb-1" style={{ color: isDarkMode ? '#fff' : '#212529' }}>{course?.title}</h4>
                                <small style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>
                                    <i className="icofont-users me-1"></i>
                                    {course?.current_enrollments} students •
                                    <i className="icofont-chart-bar-graph ms-2 me-1"></i>
                                    {course?.difficulty_level}
                                </small>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-end">
                                <small className="d-block mb-1" style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>
                                    Course Progress: {Math.round(progress)}%
                                </small>
                                <div className="progress" style={{
                                    height: '10px',
                                    backgroundColor: isDarkMode ? '#2d2d2d' : '#e9ecef'
                                }}>
                                    <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: `${progress}%` }}
                                        aria-valuenow={progress}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout */}
            <div className="d-flex" style={{
                minHeight: 'calc(100vh - 140px)',
                background: isDarkMode ? '#121212' : '#f8f9fa',
                opacity: ready ? 1 : 0,
                transition: 'opacity 0.3s ease-out 0.1s'
            }}>
                {sidebarOpen && (
                    <div style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', width: '320px', flexShrink: 0 }}>
                        <CourseSidebar
                            topics={topics}
                            isOpen={sidebarOpen}
                            currentTaskId={taskId}
                            currentContentType={contentType}
                            currentContentId={contentId}
                            courseId={courseId}
                            progress={progress}
                            isDarkMode={isDarkMode}
                            onContentSelect={handleContentNavigation}
                        />
                    </div>
                )}

                <div className="flex-grow-1" style={{
        background: isDarkMode ? '#1e1e1e' : '#fafafa',
        padding: '24px',
        width: sidebarOpen ? 'auto' : '100%'
    }}>
                    <ContentDisplay
                        taskId={taskId}
                        contentType={contentType}
                        contentId={contentId}
                        topics={topics}
                        courseId={courseId}
                        isDarkMode={isDarkMode}
                        onContentComplete={handleContentComplete}
                        onContentNavigation={handleContentNavigation}
                        refreshCourse={fetchCourseContent}
                    />

                    {/* Certifications Section */}
                    {certifications.length > 0 && (
                        <div style={{
                            marginTop: '40px',
                            padding: '24px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <h3 style={{ marginBottom: '20px', color: '#333' }}>
                                <i className="fas fa-certificate" style={{ marginRight: '8px', color: '#2196f3' }}></i>
                                Available Certifications
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                {certifications.map(cert => (
                                    <div key={cert.id} style={{
                                        padding: '16px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '6px',
                                        backgroundColor: '#f9f9f9',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <h5 style={{ marginBottom: '8px', color: '#333' }}>{cert.title}</h5>
                                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                                            <div>⏱️ Duration: {cert.duration_minutes} minutes</div>
                                            <div>✓ Passing Score: {cert.passing_score}%</div>
                                            <div>📝 Questions: {cert.total_questions || 'N/A'}</div>
                                        </div>
                                        <Link
                                            to={collegeSlug ? `/${collegeSlug}/certification/${cert.id}` : `/certification/${cert.id}`}
                                            style={{
                                                display: 'inline-block',
                                                padding: '10px 16px',
                                                backgroundColor: '#ff9800',
                                                color: 'white',
                                                borderRadius: '4px',
                                                textDecoration: 'none',
                                                fontWeight: 'bold',
                                                fontSize: '14px',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            📝 Start Exam
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
};

export default CourseView;
