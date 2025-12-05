import React, { useState, useRef } from 'react';
import { Collapse } from 'react-bootstrap';

const CourseSidebar = ({
    topics,
    isOpen,
    currentTaskId,
    currentContentType,
    currentContentId,
    courseId,
    onContentSelect,
    progress = 0,
    isDarkMode = false
}) => {
    const [expandedTopics, setExpandedTopics] = useState({});
    const [expandedTasks, setExpandedTasks] = useState({});

    /* ----------  helpers  ---------- */
    const toggleTopic = (topicId) => {
        setExpandedTopics((prev) => ({
            ...prev,
            [topicId]: !prev[topicId]
        }));
    };

    const getFirstContent = (task) => {
        if (!task.contentItems || task.contentItems.length === 0) return null;
        return task.contentItems[0];
    };

    const handleTaskClick = (e, task) => {
        e.stopPropagation();
        const firstContent = getFirstContent(task);
        if (firstContent) {
            onContentSelect(task.id.toString(), firstContent.type, firstContent.id.toString());
        } else {
            onContentSelect(task.id.toString(), null, null);
        }
    };

    const handleContentClick = (e, taskId, contentType, contentId) => {
        e.stopPropagation();
        onContentSelect(taskId.toString(), contentType, contentId.toString());
    };

    const isTaskExpanded = (task) => {
        const taskIdStr = task.id.toString();
        if (currentTaskId === taskIdStr) return true;
        return task.contentItems.some((item) => {
            const itemIdStr = item.id.toString();
            const contentIdStr = currentContentId?.toString();
            if (currentContentType === 'mcq_group') {
                return item.type === 'mcq_group' && itemIdStr === `mcq_group_${taskIdStr}`;
            }
            return item.type === currentContentType && itemIdStr === contentIdStr;
        });
    };

    const isContentActive = (taskId, contentType, contentId) => {
        const taskIdStr = taskId.toString();
        const contentIdStr = contentId?.toString();
        if (currentTaskId !== taskIdStr) return false;
        if (contentType === 'mcq_group') {
            return currentContentType === 'mcq_group' && currentContentId === `mcq_group_${taskIdStr}`;
        }
        return currentContentType === contentType && currentContentId === contentIdStr;
    };

    /* ----------  render  ---------- */
    if (!isOpen) {
        return (
            <div className="d-none d-lg-block" style={{
                width: '300px',
                background: isDarkMode ? '#1e1e1e' : 'white',
                borderRight: isDarkMode ? '1px solid #333' : '1px solid #e5e5e5'
            }}>
                <div className="p-3">
                    <small style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>Click menu to open sidebar</small>
                </div>
            </div>
        );
    }

    if (!topics || topics.length === 0) {
        return (
            <div className="d-flex flex-column" style={{
                width: '300px',
                background: isDarkMode ? '#1e1e1e' : 'white',
                borderRight: isDarkMode ? '1px solid #333' : '1px solid #e5e5e5',
                overflowY: 'hidden'
            }}>
                <div className="p-3">
                    <small style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>No topics available</small>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* -------------------------------------------------
                 Global styles – only affect this component
            ------------------------------------------------- */}
            <style jsx>{`
                .sidebar-wrapper {
                    position: sticky;
                    top: 0;                     /* stick to top of viewport */
                    height: 100vh;              /* full viewport height */
                    overflow-y: auto;           /* allow scrolling inside the sidebar */
                    -ms-overflow-style: none;   /* IE & Edge */
                    scrollbar-width: none;      /* Firefox */
                }
                .sidebar-wrapper::-webkit-scrollbar {
                    display: none;              /* Chrome, Safari, Opera */
                }
                .sidebar-content {
                    padding-bottom: 2rem;       /* a little breathing room at the bottom */
                }
                .content-item.completed .content-icon { color: #4caf50 !important; }
                .completion-indicator .fas.fa-check-circle { color: #4caf50; }
                .completion-indicator .far.fa-circle { color: #ccc; }
            `}</style>

            {/* -------------------------------------------------
                 Sidebar container – sticky + hidden scrollbars
            ------------------------------------------------- */}
            <div className="sidebar-wrapper d-flex flex-column"
                 style={{
                     width: '320px',
                     background: isDarkMode ? '#1e1e1e' : 'white',
                     borderRight: isDarkMode ? '1px solid #333' : '1px solid #e5e5e5',
                 }}>

                {/* ----  Scrollable content area  ---- */}
                <div className="sidebar-content p-2">
                    {topics.map((topic) => {
                        const topicIdStr = topic.id.toString();
                        const isExpanded = expandedTopics[topicIdStr] || topic.tasks.some(isTaskExpanded);

                        return (
                            <div key={topicIdStr} className="mb-1">
                                {/* Topic header */}
                                <div
                                    className="text-uppercase small mb-2 d-flex justify-content-between align-items-center p-2 rounded"
                                    style={{
                                        cursor: 'pointer',
                                        border: isDarkMode ? '1px solid #444' : '1px solid #dee2e6',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#e0e0e0' : '#495057',
                                        backgroundColor: isDarkMode ? '#2d2d2d' : 'transparent',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => toggleTopic(topicIdStr)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && toggleTopic(topicIdStr)}
                                >
                                    <span>
                                        <i className={`icofont-${isExpanded ? 'book-alt' : 'folder'} me-2`}></i>
                                        {topic.title}
                                    </span>
                                    <i className={`icofont-rounded-${isExpanded ? 'down' : 'right'}`}
                                       style={{ fontSize: '16px', fontWeight: 'bold' }}></i>
                                </div>

                                {/* Tasks / Content */}
                                <Collapse in={isExpanded}>
                                    <div style={{ marginLeft: '16px' }}>
                                        {topic.tasks?.map((task) => {
                                            const taskIdStr = task.id.toString();
                                            const hasContent = task.contentItems && task.contentItems.length > 0;

                                            return (
                                                <div key={taskIdStr} className="mb-2">
                                                    {hasContent && (
                                                        <div>
                                                            {task.contentItems.map((content) => {
                                                                const contentIdStr = content.id.toString();
                                                                const active = isContentActive(taskIdStr, content.type, contentIdStr);
                                                                const isCompleted = content.is_completed;

                                                                return (
                                                                    <div
                                                                        key={contentIdStr}
                                                                        className={`content-item p-2 rounded small mb-1 d-flex justify-content-between align-items-center ${isCompleted ? 'completed' : ''}`}
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            fontSize: '0.875rem',
                                                                            border: active
                                                                                ? (isDarkMode ? '1px solid #6ec1e4' : '1px solid var(--bs-primary)')
                                                                                : (isDarkMode ? '1px solid #444' : '1px solid #e5e5e5'),
                                                                            backgroundColor: active
                                                                                ? (isDarkMode ? '#1a3a4a' : '#cfe2ff')
                                                                                : (isDarkMode ? '#2d2d2d' : 'transparent'),
                                                                            color: active
                                                                                ? (isDarkMode ? '#6ec1e4' : '#0d6efd')
                                                                                : (isDarkMode ? '#adb5bd' : '#6c757d'),
                                                                            transition: 'all 0.2s'
                                                                        }}
                                                                        onClick={(e) => handleContentClick(e, taskIdStr, content.type, contentIdStr)}
                                                                        role="button"
                                                                        tabIndex={0}
                                                                        onKeyPress={(e) => e.key === 'Enter' && handleContentClick(e, taskIdStr, content.type, contentIdStr)}
                                                                    >
                                                                        <div className="flex-grow-1">
                                                                            <i className={`me-2 content-icon ${
                                                                                content.type === 'page' ? 'icofont-file-text text-primary' :
                                                                                content.type === 'video' ? 'icofont-play-alt-2 text-danger' :
                                                                                content.type === 'document' ? 'icofont-file-pdf text-warning' :
                                                                                content.type === 'mcq_group' ? 'icofont-question-circle text-info' :
                                                                                content.type === 'coding_question' ? 'icofont-code text-success' :
                                                                                'icofont-file'
                                                                            }`} style={{ fontSize: '16px' }}></i>
                                                                            <span className="text-truncate d-inline-block" style={{ maxWidth: '180px' }}>
                                                                                {content.title ||
                                                                                 (content.type === 'coding_question' && content.question?.question_text?.substring(0, 30) + '...') ||
                                                                                 'Untitled'}
                                                                            </span>
                                                                        </div>

                                                                        {content.type !== 'page' && (
                                                                            <div className="ms-2" style={{ minWidth: '16px' }}>
                                                                                {isCompleted ? (
                                                                                    <span style={{
                                                                                        display: 'inline-flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        width: '14px',
                                                                                        height: '14px',
                                                                                        borderRadius: '50%',
                                                                                        backgroundColor: '#4caf50',
                                                                                        color: 'white',
                                                                                        fontSize: '10px',
                                                                                        fontWeight: 'bold'
                                                                                    }}>✓</span>
                                                                                ) : (
                                                                                    <span style={{
                                                                                        display: 'inline-block',
                                                                                        width: '12px',
                                                                                        height: '12px',
                                                                                        borderRadius: '50%',
                                                                                        border: '2px solid #ccc'
                                                                                    }}></span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {!hasContent && (
                                                        <div className="ms-3 mt-2 small" style={{
                                                            color: isDarkMode ? '#adb5bd' : '#6c757d'
                                                        }}>
                                                            No content items available
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Collapse>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default CourseSidebar;