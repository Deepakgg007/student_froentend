// component/course/ContentDisplay.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import PageContent from './PageContent';
import VideoContent from './VideoContent';
import DocumentContent from './DocumentContent';
import MCQContent from "./MCQContent";
import CodingQuestionContent from "./CodingQuestionContent";

// Import progress service with error handling
let markContentComplete;
try {
    const progressService = require('../../services/contentProgressService');
    markContentComplete = progressService.markContentComplete;
} catch (err) {
    console.warn('ContentProgress service not available:', err);
    markContentComplete = null;
}

const ContentDisplay = ({
    taskId,
    contentType,
    contentId,
    topics,
    courseId,
    isDarkMode = false,
    onContentComplete,
    onContentNavigation,
    refreshCourse
}) => {
    const [currentContent, setCurrentContent] = useState(null);
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [completionSuccess, setCompletionSuccess] = useState(false);

    useEffect(() => {
        if (taskId && topics.length > 0) {
            loadContent();
        }
    }, [taskId, contentType, contentId, topics]);

    const loadContent = async () => {
        try {
            setLoading(true);
            setError('');

            let foundTask = null;
            let foundContent = null;
            let foundTopic = null;

            for (const topic of topics) {
                for (const t of topic.tasks) {
                    if (t.id.toString() === taskId.toString()) {
                        foundTask = t;
                        foundTopic = topic;

                        foundContent = t.contentItems.find(item => {
                            const itemIdStr = item.id?.toString();
                            const contentIdStr = contentId?.toString();

                            if (contentType === 'mcq_group') {
                                return item.type === 'mcq_group' && itemIdStr === `mcq_group_${taskId}`;
                            }
                            return item.type === contentType && itemIdStr === contentIdStr;
                        });
                        break;
                    }
                }
                if (foundTask) break;
            }

            if (!foundTask) {
                console.warn('Task not in topics cache, fetching from API');
                const taskResponse = await api.get(`/tasks/${taskId}/`);
                const taskData = taskResponse.data.data || taskResponse.data;
                setTask(taskData);
                setError('Task data stale. Refreshing course...');
                refreshCourse();
                return;
            }

            setTask(foundTask);

            if (!foundContent && foundTask.contentItems.length > 0) {
                foundContent = foundTask.contentItems[0];
                onContentNavigation(taskId, foundContent.type, foundContent.id.toString());
                return;
            }

            if (!foundContent) {
                setError('Content not found in this task');
                return;
            }

            setCurrentContent({
                ...foundContent,
                task: foundTask,
                topic: foundTopic
            });

        } catch (err) {
            console.error('Failed to load content:', err.response?.data || err);
            setError('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const getAllContentsSequence = () => {
        const sequence = [];
        topics.forEach(topic => {
            topic.tasks.forEach(task => {
                task.contentItems.forEach(item => {
                    sequence.push({ ...item, taskId: task.id, topicId: topic.id });
                });
            });
        });
        return sequence;
    };

    const handleNextContent = () => {
        if (!task || !currentContent) return;

        const allContents = getAllContentsSequence();
        const currentIndex = allContents.findIndex(item =>
            item.taskId.toString() === taskId.toString() &&
            item.id.toString() === currentContent.id.toString() &&
            item.type === currentContent.type  // Use currentContent.type for reliability
        );

        const nextItem = allContents[currentIndex + 1];
        if (nextItem) {
            onContentNavigation(nextItem.taskId.toString(), nextItem.type, nextItem.id.toString());
        }
    };

    const handlePrevContent = () => {
        if (!task || !currentContent) return;

        const allContents = getAllContentsSequence();
        const currentIndex = allContents.findIndex(item =>
            item.taskId.toString() === taskId.toString() &&
            item.id.toString() === currentContent.id.toString() &&
            item.type === currentContent.type
        );

        const prevItem = allContents[currentIndex - 1];
        if (prevItem) {
            onContentNavigation(prevItem.taskId.toString(), prevItem.type, prevItem.id.toString());
        }
    };

    const handleContentComplete = async () => {
        try {
            // Call parent handler (course-view's handleContentComplete)
            if (onContentComplete) {
                try {
                    await onContentComplete(contentId, contentType);
                } catch (legacyError) {
                    console.error('❌ Parent completion handler failed:', legacyError);
                    throw legacyError; // Re-throw to trigger error handling in child components
                }
            } else {
                console.warn('⚠️ No onContentComplete handler provided');
            }

            setCompletionSuccess(true);

            // Show success message for 3 seconds
            setTimeout(() => setCompletionSuccess(false), 3000);
        } catch (err) {
            console.error('❌ Failed to mark content complete:', err);
            throw err; // Re-throw so child components can handle error
        }
    };

    if (loading) {
        return (
            <div className="container-fluid h-100 d-flex align-items-center justify-content-center" style={{
                backgroundColor: isDarkMode ? '#1e1e1e' : 'transparent'
            }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !currentContent) {
        return (
            <div className="container-fluid h-100 d-flex align-items-center justify-content-center" style={{
                backgroundColor: isDarkMode ? '#1e1e1e' : 'transparent'
            }}>
                <div className="alert text-center" style={{
                    backgroundColor: isDarkMode ? '#2d2d2d' : '#fff3cd',
                    color: isDarkMode ? '#ffc107' : '#856404',
                    borderColor: isDarkMode ? '#444' : '#ffc107'
                }}>
                    <p>Select a different item from the sidebar.</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (currentContent.type) {
            case 'page':
                return (
                    <PageContent
                        content={currentContent}  // Standardized prop name
                        task={task}
                        isDarkMode={isDarkMode}
                        onComplete={handleContentComplete}
                        onNext={handleNextContent}
                        onPrev={handlePrevContent}
                    />
                );

            case 'video':
                return (
                    <VideoContent
                        content={currentContent}
                        task={task}
                        isDarkMode={isDarkMode}
                        onComplete={handleContentComplete}
                        onNext={handleNextContent}
                        onPrev={handlePrevContent}
                    />
                );

            case 'document':
                return (
                    <DocumentContent
                        content={currentContent}
                        task={task}
                        isDarkMode={isDarkMode}
                        onComplete={handleContentComplete}
                        onNext={handleNextContent}
                        onPrev={handlePrevContent}
                    />
                );

            case 'mcq_group':
                return (
                    <MCQContent
                        questions={currentContent.questions || []}
                        task={task}
                        isDarkMode={isDarkMode}
                        onComplete={(contentId, contentType) => onContentComplete(contentId || currentContent.id, contentType || 'mcq_group')}
                        onRefresh={refreshCourse}
                        onNext={handleNextContent}
                        onPrev={handlePrevContent}
                    />
                );

            case 'mcq_set':
                // Transform MCQ Set questions to match the expected format
                const transformedQuestions = (currentContent.questions || []).map(q => ({
                    id: q.id,
                    question_text: q.question_text,
                    marks: q.marks,
                    order: q.order,
                    is_completed: q.is_completed,
                    question_type: 'mcq',
                    mcq_details: {
                        choice_1_text: q.choice_1_text,
                        choice_1_is_correct: q.choice_1_is_correct,
                        choice_2_text: q.choice_2_text,
                        choice_2_is_correct: q.choice_2_is_correct,
                        choice_3_text: q.choice_3_text,
                        choice_3_is_correct: q.choice_3_is_correct,
                        choice_4_text: q.choice_4_text,
                        choice_4_is_correct: q.choice_4_is_correct,
                        solution_explanation: q.solution_explanation
                    }
                }));

                return (
                    <MCQContent
                        questions={transformedQuestions}
                        task={task}
                        isDarkMode={isDarkMode}
                        onComplete={(contentId, contentType) => onContentComplete(contentId || currentContent.id, contentType || 'mcq_set')}
                        onRefresh={refreshCourse}
                        onNext={handleNextContent}
                        onPrev={handlePrevContent}
                        mcqSetTitle={currentContent.title}
                        mcqSetDescription={currentContent.description}
                    />
                );

            case 'coding_question':
                return (
                    <CodingQuestionContent
                        question={currentContent.question}
                        task={task}
                        isDarkMode={isDarkMode}
                        onComplete={refreshCourse}
                    />
                );

            default:
                return (
                    <div className="container-fluid h-100 d-flex align-items-center justify-content-center" style={{
                        backgroundColor: isDarkMode ? '#1e1e1e' : 'transparent'
                    }}>
                        <div className="alert" style={{
                            backgroundColor: isDarkMode ? '#2d2d2d' : '#d1ecf1',
                            color: isDarkMode ? '#6ec1e4' : '#0c5460',
                            borderColor: isDarkMode ? '#444' : '#bee5eb'
                        }}>
                            <h5>Content Type Not Supported</h5>
                            <p>This content type ({currentContent.type}) is not yet implemented.</p>
                        </div>
                    </div>
                );
        }
    };

    const allContents = getAllContentsSequence();
    const currentGlobalIndex = allContents.findIndex(item => 
        item.taskId.toString() === taskId.toString() &&
        item.id.toString() === currentContent.id.toString() &&
        item.type === currentContent.type
    );
    const hasPrev = currentGlobalIndex > 0;
    const hasNext = currentGlobalIndex < allContents.length - 1;

    return (
        <div className="container-fluid h-100">
            {/* Success Toast */}
            {completionSuccess && (
                <div className="alert alert-dismissible fade show position-fixed"
                     style={{
                         top: '100px',
                         right: '20px',
                         zIndex: 1050,
                         minWidth: '300px',
                         backgroundColor: isDarkMode ? '#2d5016' : '#d4edda',
                         color: isDarkMode ? '#90ee90' : '#155724',
                         borderColor: isDarkMode ? '#4caf50' : '#c3e6cb'
                     }}
                     role="alert">
                    <i className="icofont-check-circled me-2"></i>
                    Content marked as complete!
                </div>
            )}

            <div className="row h-100">
                <div className="col-12">



                    {/* Main Content Area - NO AUTO-SCROLL */}
                    <div id="main-content-area" className="content-area rounded shadow-sm p-2"
                         style={{
                             minHeight: '600px',
                             overflow: 'visible',
                             backgroundColor: isDarkMode ? '#2d2d2d' : '#fff'
                         }}>
                        {renderContent()}
                    </div>

                     {/* Enhanced Navigation Bar */}
                    <div className="mb-4 p-3 rounded shadow-sm content-navigation-bar" style={{
                        backgroundColor: isDarkMode ? '#2d2d2d' : '#fff'
                    }}>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <button
                                className="btn content-nav-btn content-nav-prev"
                                onClick={handlePrevContent}
                                disabled={!hasPrev}
                                style={{
                                    minWidth: '120px',
                                    padding: '12px 20px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
                                    color: isDarkMode ? '#adb5bd' : '#6c757d',
                                    borderColor: isDarkMode ? '#444' : '#6c757d',
                                    border: '2px solid'
                                }}
                            >
                                <i className="icofont-arrow-left me-2"></i>
                                <span className="btn-text">Previous</span>
                            </button>
                            <button
                                className="btn content-nav-btn content-nav-next"
                                onClick={handleNextContent}
                                disabled={!hasNext}
                                style={{
                                    minWidth: '120px',
                                    padding: '12px 20px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    backgroundColor: isDarkMode ? '#1a3a4a' : '#0d6efd',
                                    color: '#fff',
                                    borderColor: isDarkMode ? '#6ec1e4' : '#0d6efd',
                                    border: '2px solid'
                                }}
                            >
                                <span className="btn-text">Next</span>
                                <i className="icofont-arrow-right ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile-Responsive Styles */}
            <style>{`
                /* Mobile responsive navigation */
                @media (max-width: 768px) {
                    .content-navigation-bar {
                        padding: 16px !important;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        z-index: 1000;
                        margin: 0 !important;
                        border-radius: 0 !important;
                        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15) !important;
                    }

                    .content-navigation-bar .d-flex {
                        width: 100%;
                        gap: 12px !important;
                    }

                    .content-nav-btn {
                        flex: 1 !important;
                        min-width: auto !important;
                        max-width: 50% !important;
                        padding: 14px 16px !important;
                        font-size: 14px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        white-space: nowrap !important;
                    }

                    .content-nav-btn i {
                        font-size: 16px !important;
                    }

                    .content-nav-btn .btn-text {
                        display: inline !important;
                    }

                    /* Add padding to content area to prevent overlap with fixed navigation */
                    .content-area {
                        margin-bottom: 80px !important;
                    }
                }

                /* Tablet responsive */
                @media (min-width: 769px) and (max-width: 1024px) {
                    .content-nav-btn {
                        min-width: 140px !important;
                        padding: 12px 24px !important;
                    }
                }

                /* Ensure buttons are visible on small screens */
                @media (max-width: 400px) {
                    .content-nav-btn {
                        font-size: 13px !important;
                        padding: 12px 12px !important;
                    }

                    .content-nav-btn i {
                        margin: 0 4px !important;
                    }
                }

                /* Disabled button styles */
                .content-nav-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default ContentDisplay;