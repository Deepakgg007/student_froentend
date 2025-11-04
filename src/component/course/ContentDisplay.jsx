// component/course/ContentDisplay.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import PageContent from './PageContent';
import VideoContent from './VideoContent';
import DocumentContent from './DocumentContent';
import MCQContent from "./MCQContent";
import CodingQuestionContent from "./CodingQuestionContent";

const ContentDisplay = ({ 
    taskId, 
    contentType, 
    contentId, 
    topics, 
    courseId, 
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
        } else {
            console.log('No next content');
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
        } else {
            console.log('No previous content');
        }
    };

    const handleContentComplete = async () => {
        try {
            await onContentComplete(contentId, contentType);  // Pass from URL/state
            setCompletionSuccess(true);

            // Refresh course data immediately to show green checkmark
            if (refreshCourse) {
                await refreshCourse();
            }

            // Show success message
            setTimeout(() => setCompletionSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to mark content complete:', err);
        }
    };

    if (loading) {
        return (
            <div className="container-fluid h-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !currentContent) {
        return (
            <div className="container-fluid h-100 d-flex align-items-center justify-content-center">
                <div className="alert alert-warning text-center">
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
                        onComplete={(contentId, contentType) => onContentComplete(contentId || currentContent.id, contentType || 'mcq_group')}
                        onRefresh={refreshCourse}
                        onNext={handleNextContent}
                        onPrev={handlePrevContent}
                    />
                );

            case 'coding_question':
                return (
                    <CodingQuestionContent
                        question={currentContent.question}
                        task={task}
                        onComplete={refreshCourse}
                    />
                );

            default:
                return (
                    <div className="container-fluid h-100 d-flex align-items-center justify-content-center">
                        <div className="alert alert-info">
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
                <div className="alert alert-success alert-dismissible fade show position-fixed" 
                     style={{ top: '100px', right: '20px', zIndex: 1050, minWidth: '300px' }}
                     role="alert">
                    <i className="icofont-check-circled me-2"></i>
                    Content marked as complete!
                </div>
            )}

            <div className="row h-100">
                <div className="col-12">

                   

                    {/* Main Content Area - NO AUTO-SCROLL */}
                    <div id="main-content-area" className="content-area bg-white rounded shadow-sm p-2" 
                         style={{ minHeight: '600px', overflow: 'visible' }}>
                        {renderContent()}
                    </div>

                     {/* Enhanced Navigation Bar */}
                    <div className="mb-4 p-2 bg-white rounded shadow-sm">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <button 
                                    className="btn btn-outline-secondary me-3"
                                    onClick={handlePrevContent}
                                    disabled={!hasPrev}
                                    style={{ minWidth: '100px' }}
                                >
                                    <i className="icofont-arrow-left me-2"></i>
                                    Previous
                                </button>
                            </div>
                            <button 
                                className="btn btn-primary"
                                onClick={handleNextContent}
                                disabled={!hasNext}
                                style={{ minWidth: '100px' }}
                            >
                                Next
                                <i className="icofont-arrow-right ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentDisplay;