import api from './api';


/**
 * Mark a content item as completed
 * @param {string} contentType - 'video', 'document', or 'question'
 * @param {number} contentId - ID of the content
 * @param {number} taskId - ID of the task
 * @param {number} courseId - ID of the course
 * @returns {Promise}
 */
export const markContentComplete = async (contentType, contentId, taskId, courseId) => {
    try {
        const response = await api.post('/student/content/mark-complete/', {
            content_type: contentType,
            content_id: contentId,
            task_id: taskId,
            course_id: courseId
        });

        return response.data;
    } catch (error) {
        console.error(`❌ Error marking ${contentType} as complete:`, error);
        throw error;
    }
};

/**
 * Get course progress summary
 * @param {number} courseId - ID of the course
 * @returns {Promise<{completed_count, total_count, percentage}>}
 */
export const getCourseProgress = async (courseId) => {
    try {
        const response = await api.get(`/student/courses/${courseId}/progress/`);
        return response.data.data;
    } catch (error) {
        console.error('❌ Error fetching course progress:', error);
        throw error;
    }
};

/**
 * Get list of completed content for a course
 * @param {number} courseId - ID of the course
 * @returns {Promise<Array>}
 */
export const getContentProgressList = async (courseId) => {
    try {
        const response = await api.get(`/student/courses/${courseId}/content-progress/`);
        return response.data.data;
    } catch (error) {
        console.error('❌ Error fetching content progress list:', error);
        throw error;
    }
};

/**
 * Check if a content item is completed
 * @param {Array} progressList - List of completed content
 * @param {string} contentType - 'video', 'document', or 'question'
 * @param {number} contentId - ID of the content
 * @returns {boolean}
 */
export const isContentCompleted = (progressList, contentType, contentId) => {
    if (!progressList || !Array.isArray(progressList)) return false;

    return progressList.some(
        item => item.content_type === contentType &&
                item.content_id === contentId &&
                item.is_completed
    );
};

const contentProgressService = {
    markContentComplete,
    getCourseProgress,
    getContentProgressList,
    isContentCompleted
};

export default contentProgressService;
