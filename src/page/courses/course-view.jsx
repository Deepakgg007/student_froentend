import { Fragment, useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import api, { getCertifications } from "../../services/api";
import CourseSidebar from "../../component/course/CourseSidebar";
import ContentDisplay from "../../component/course/ContentDisplay";

// Import progress service with error handling
let getCourseProgress;
try {
    const progressService = require("../../services/contentProgressService");
    getCourseProgress = progressService.getCourseProgress;
} catch (err) {
    console.warn('ContentProgress service not available:', err);
    getCourseProgress = null;
}

const CourseView = () => {
    const params = useParams();
    const { courseId, collegeSlug } = params;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [course, setCourse] = useState(null);
    const [topics, setTopics] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const taskId = searchParams.get('taskId');
    const contentType = searchParams.get('contentType');
    const contentId = searchParams.get('contentId');

    useEffect(() => {
        if (courseId && courseId !== 'undefined') {
            fetchCourseContent(); // This will call fetchRealProgress internally
        } else {
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
        try {
            setLoading(true);
            setError('');

            // 1. Fetch course details
            const courseResponse = await api.get(`/courses/${courseId}/`);
            const courseData = courseResponse.data.data || courseResponse.data;
            setCourse(courseData);

            let courseTasks = courseData.tasks || [];

            // 2. Fetch syllabi for ordered topics
            let syllabiResponse;
            try {
                syllabiResponse = await api.get(`/syllabi/?course=${courseId}`);
            } catch (err) {
                console.warn('Failed to fetch syllabi, will try topics directly:', err.response?.data || err);
                syllabiResponse = { data: [] };
            }

            let syllabiData = syllabiResponse.data.data || syllabiResponse.data.results || syllabiResponse.data || [];
            if (!Array.isArray(syllabiData)) syllabiData = [syllabiData];
            const primarySyllabus = syllabiData[0] || {};
            let syllabusTopics = primarySyllabus.ordered_topics || [];

            // Fallback: If no syllabus or no ordered topics, fetch topics directly by course
            if (syllabusTopics.length === 0) {
                try {
                    const directTopicsResponse = await api.get(`/topics/?course=${courseId}`);
                    let directTopics = directTopicsResponse.data.data || directTopicsResponse.data.results || directTopicsResponse.data || [];
                    if (!Array.isArray(directTopics)) directTopics = [directTopics];

                    // Convert direct topics to syllabus topic format
                    syllabusTopics = directTopics.map(topic => ({
                        topic: topic.id,
                        topic_id: topic.id,
                        topic_title: topic.title,
                        topic_description: topic.description,
                        order: topic.order || 0
                    }));
                } catch (err) {
                    console.error('Failed to fetch topics directly:', err.response?.data || err);
                }
            }

            // 3. Build topics with content
            const topicsWithContent = await Promise.all(
                syllabusTopics.map(async (syllabusTopic) => {
                    const topicIdRaw = syllabusTopic.topic?.id || syllabusTopic.topic_id || syllabusTopic.topic;
                    const topicId = topicIdRaw ? topicIdRaw.toString() : null;
                    const topicTitle = syllabusTopic.topic?.title || syllabusTopic.topic_title || 'Untitled Topic';
                    const topicDescription = syllabusTopic.topic?.description || syllabusTopic.topic_description || '';

                    if (!topicId || topicId === 'undefined') {
                        console.warn('Skipping syllabus topic without valid ID', syllabusTopic);
                        return null;
                    }

                    let topicTasks = [];
                    try {
                        const tasksResponse = await api.get(`/tasks/?topic=${topicId}`);
                        topicTasks = tasksResponse.data.data || tasksResponse.data.results || tasksResponse.data || [];
                        if (!Array.isArray(topicTasks)) topicTasks = [];
                    } catch (err) {
                        console.error(`Failed to fetch tasks for topic ${topicId}:`, err.response?.data || err);
                        topicTasks = courseTasks.filter(t => t.topic?.toString() === topicId);
                    }

                    const activeTasks = topicTasks.filter(task => task.status === 'active');

                    const tasksWithContent = await Promise.all(
                        activeTasks.map(async (task) => {
                            let taskDetail = task;
                            if (!task.richtext_pages && !task.videos && !task.documents && !task.questions) {
                                try {
                                    const detailResponse = await api.get(`/tasks/${task.id}/`);
                                    taskDetail = detailResponse.data.data || detailResponse.data;
                                } catch (err) {
                                    console.warn(`Failed to fetch detail for task ${task.id}:`, err.response?.data || err);
                                }
                            }

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

                            // --- Questions ---
                            if (taskDetail.questions?.length > 0) {
                                const mcqs = taskDetail.questions.filter(q => q.question_type === 'mcq');
                                const codingQuestions = taskDetail.questions.filter(q => q.question_type === 'coding');

                                if (mcqs.length > 0) {
                                    // Check if ALL MCQs are completed
                                    const allMcqsCompleted = mcqs.every(q => q.is_completed === true);

                                    contentItems.push({
                                        id: `mcq_group_${task.id}`.toString(),
                                        type: 'mcq_group',
                                        title: 'MCQ Quiz',
                                        order: Math.min(...mcqs.map(q => q.order || 999)) || 999,
                                        questions: mcqs,
                                        task_id: task.id.toString(),
                                        is_completed: allMcqsCompleted
                                    });
                                }

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
                        })
                    );

                    return {
                        id: topicId,
                        title: topicTitle,
                        description: topicDescription,
                        tasks: tasksWithContent
                    };
                })
            );

            const validTopics = topicsWithContent.filter(Boolean);
            setTopics(validTopics);


            // --- Progress ---
            // Only count videos, documents, and questions (NOT rich text pages)
            let totalItems = 0;
            let completedItems = 0;
            validTopics.forEach(topic => {
                topic?.tasks.forEach(task => {
                    task.contentItems.forEach(item => {
                        // Exclude rich text pages from progress calculation
                        if (item.type !== 'page') {
                            totalItems++;
                            if (item.is_completed) completedItems++;
                        }
                    });
                });
            });
            const currentProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
            setProgress(currentProgress);

            // If progress hits 100%, update the course as completed in backend
            if (Math.round(currentProgress) === 100) {
                try {
                    // Try to find the current enrollment ID
                    const enrollRes = await api.get(`/student/enrollments/?course=${courseId}`);
                    const enrollments = enrollRes.data.results || enrollRes.data.data || enrollRes.data || [];
                    const enrollment = Array.isArray(enrollments)
                        ? enrollments.find(e => e.course === courseId || e.course_id === courseId)
                        : enrollments;

                    if (enrollment && enrollment.id && enrollment.status !== 'completed') {
                        await api.post(`/student/enrollments/${enrollment.id}/complete/`);
                    }
                } catch (err) {
                    console.warn(`Failed to mark course ${courseId} as completed:`, err.message);
                }
            }

            // --- Auto-redirect to first content ---
            if (!taskId && validTopics.length > 0) {
                const firstTopic = validTopics[0];
                const firstTask = firstTopic.tasks?.[0];
                const firstContent = firstTask?.contentItems?.[0];

                if (firstContent) {
                    // Preserve the college slug in the URL if it exists
                    const currentPath = window.location.pathname;
                    const pathParts = currentPath.split('/').filter(p => p);

                    // Check if the current path has a college slug (format: /college-slug/course-view/id)
                    let baseUrl;
                    if (pathParts.length >= 3 && pathParts[1] === 'course-view') {
                        // Has college slug: /college-slug/course-view/courseId
                        const collegeSlug = pathParts[0];
                        baseUrl = `/${collegeSlug}/course-view/${courseId}`;
                    } else {
                        // No college slug: /course-view/courseId
                        baseUrl = `/course-view/${courseId}`;
                    }

                    const redirectUrl = `${baseUrl}?taskId=${firstTask.id.toString()}&contentType=${firstContent.type}&contentId=${firstContent.id.toString()}`;
                    navigate(redirectUrl, { replace: true });
                } else {
                    console.warn('⚠️ No content found in first task');
                }
            } 

            // Fetch real progress from backend
            await fetchRealProgress();

        } catch (err) {
            console.error('Failed to fetch course content:', err.response?.data || err);
            setError('Failed to load course content. Please try again later.');
        } finally {
            setLoading(false);
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
                <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: '20px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
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
            {/* Header */}
            <div className="course-header bg-white border-bottom shadow-sm" style={{ padding: '20px 0', paddingTop: '20px' }}>
                <div className="container-fluid" style={{ maxWidth: '1600px' }}>
                    <div className="row align-items-center">
                        <div className="col-md-8 d-flex align-items-center">
                            <button
                                className="btn btn-outline-secondary me-2"
                                onClick={() => navigate('/course')}
                                style={{ padding: '10px 16px' }}
                                title="Back to Course List"
                            >
                                <i className="icofont-arrow-left"></i>
                            </button>
                            <button
                                className="btn btn-outline-primary me-3"
                                onClick={toggleSidebar}
                                style={{ padding: '10px 10px' }}
                                title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                            >
                                <i className={`icofont-${sidebarOpen ? 'close' : 'navigation-menu'}`}></i>
                            </button>
                            <div>
                                <h4 className="mb-1 text-dark">{course?.title}</h4>
                                <small className="text-muted">
                                    <i className="icofont-users me-1"></i>
                                    {course?.current_enrollments} students • 
                                    <i className="icofont-chart-bar-graph ms-2 me-1"></i>
                                    {course?.difficulty_level}
                                </small>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-end">
                                <small className="text-muted d-block mb-1">
                                    Course Progress: {Math.round(progress)}%
                                </small>
                                <div className="progress" style={{ height: '10px' }}>
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
            <div className="d-flex" style={{ minHeight: 'calc(100vh - 140px)', background: '#f8f9fa' }}>
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
                            onContentSelect={handleContentNavigation}
                        />
                    </div>
                )}

                <div className="flex-grow-1" style={{
        background: '#fafafa',
        padding: '24px',
        width: sidebarOpen ? 'auto' : '100%'
    }}>
                    <ContentDisplay
                        taskId={taskId}
                        contentType={contentType}
                        contentId={contentId}
                        topics={topics}
                        courseId={courseId}
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
