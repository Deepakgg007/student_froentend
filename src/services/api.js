import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('student_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details for debugging
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== Company APIs ==========

/**
 * Get all companies with optional filters
 * @param {Object} params - Query parameters
 */
export const getCompanies = (params = {}) => {
  return api.get('/company/companies/', { params });
};

/**
 * Get company by slug
 * @param {string} slug - Company slug
 */
export const getCompanyBySlug = (slug) => {
  return api.get(`/company/companies/${slug}/`);
};

/**
 * Get all concepts for a company
 * @param {string} slug - Company slug
 */
export const getCompanyConcepts = (slug) => {
  return api.get(`/company/companies/${slug}/concepts/`);
};

/**
 * Get company statistics
 * @param {string} slug - Company slug
 */
export const getCompanyStats = (slug) => {
  return api.get(`/company/companies/${slug}/stats/`);
};

// ========== Concepts ==========

/**
 * Get all concepts with optional filters
 * @param {Object} params - Query parameters
 */
export const getConcepts = (params = {}) => {
  return api.get('/company/concepts/', { params });
};

/**
 * Get concept by ID or slug
 * @param {number|string} idOrSlug - Concept ID or slug (backend uses slug)
 */
export const getConceptById = (idOrSlug) => {
  return api.get(`/company/concepts/${idOrSlug}/`);
};

/**
 * Get all challenges for a concept
 * @param {number|string} conceptIdOrSlug - Concept ID or slug (backend uses slug)
 */
export const getConceptChallenges = (conceptIdOrSlug) => {
  return api.get(`/company/concepts/${conceptIdOrSlug}/challenges/`);
};

// ========== Concept Challenges ==========

/**
 * Get concept challenges with optional filters
 * @param {Object} params - Query parameters
 */
export const getConceptChallengesList = (params = {}) => {
  return api.get('/company/concept-challenges/', { params });
};

/**
 * Get concept challenge by ID
 * @param {number} id - Concept Challenge ID
 */
export const getConceptChallengeById = (id) => {
  return api.get(`/company/concept-challenges/${id}/`);
};

// ========== Jobs ==========

/**
 * Get all jobs with optional filters
 * @param {Object} params - Query parameters
 */
export const getJobs = (params = {}) => {
  return api.get('/company/jobs/', { params });
};

/**
 * Get job by ID
 * @param {number} id - Job ID
 */
export const getJobById = (id) => {
  return api.get(`/company/jobs/${id}/`);
};

/**
 * Get job by slug
 * @param {string} slug - Job slug
 */
export const getJobBySlug = (slug) => {
  return api.get(`/company/jobs/${slug}/`);
};

/**
 * Get all jobs for a specific company
 * @param {number} companyId - Company ID
 * @param {Object} params - Additional query parameters
 */
export const getCompanyJobs = (companyId, params = {}) => {
  return api.get('/company/jobs/', { 
    params: { ...params, company: companyId } 
  });
};

// ========== Helper Functions ==========

/**
 * Get difficulty badge color
 * @param {string} difficulty - Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
 * @returns {string} Bootstrap color class
 */
export const getDifficultyColor = (difficulty) => {
  const colors = {
    BEGINNER: 'success',
    INTERMEDIATE: 'warning',
    ADVANCED: 'orange',
    EXPERT: 'danger',
  };
  return colors[difficulty] || 'secondary';
};

/**
 * Get job type display name
 * @param {string} jobType - Job type code
 * @returns {string} Display name
 */
export const getJobTypeDisplay = (jobType) => {
  const types = {
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    INTERNSHIP: 'Internship',
    CONTRACT: 'Contract',
    FREELANCE: 'Freelance',
  };
  return types[jobType] || jobType;
};

/**
 * Get experience level display name
 * @param {string} level - Experience level code
 * @returns {string} Display name
 */
export const getExperienceLevelDisplay = (level) => {
  const levels = {
    ENTRY: 'Entry Level',
    MID: 'Mid Level',
    SENIOR: 'Senior Level',
    LEAD: 'Lead/Manager',
  };
  return levels[level] || level;
};

/**
 * Format salary range
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @param {string} currency - Currency code
 * @returns {string} Formatted salary range
 */
export const formatSalary = (min, max, currency = 'INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  });
  
  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  } else if (min) {
    return `${formatter.format(min)}+`;
  } else if (max) {
    return `Up to ${formatter.format(max)}`;
  }
  return 'Not disclosed';
};

/**
 * Calculate days remaining until deadline
 * @param {string} deadline - ISO date string
 * @returns {number} Days remaining (negative if past)
 */
export const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if deadline has passed
 * @param {string} deadline - ISO date string
 * @returns {boolean} True if deadline passed
 */
export const isDeadlinePassed = (deadline) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

export default api;
