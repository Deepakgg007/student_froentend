import axios from 'axios';

// export const API_BASE_URL = 'https://shobhaconsultancy.in';
// export const API_BASE_URL = 'https://krishik-abiuasd.in';
export const API_BASE_URL = 'http://localhost:8000';

// ========== Simple In-Memory Cache ==========
// Cache API responses for faster subsequent loads
const cache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const getCacheKey = (url, params) => {
  return `${url}?${JSON.stringify(params || {})}`;
};

const getCached = (url, params) => {
  const key = getCacheKey(url, params);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCached = (url, params, data) => {
  const key = getCacheKey(url, params);
  cache.set(key, { data, timestamp: Date.now() });
};

// Clear cache on logout or profile update
export const clearCache = () => cache.clear();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token and check cache
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('student_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check cache for GET requests only
    if (config.method === 'get') {
      const cached = getCached(config.url, config.params);
      if (cached) {
        config.adapter = () => Promise.resolve({
          data: cached,
          status: 200,
          statusText: 'OK (cached)',
          headers: {},
          config,
          request: {},
        });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.status === 200) {
      setCached(response.config.url, response.config.params, response.data);
    }
    return response;
  },
  (error) => {
    // List of endpoints where errors are expected/handled gracefully - don't log these
    const silentErrors = [
      '/student/profile/me/stats/',
      '/student/profile/',
    ];

    const url = error.config?.url;
    const shouldSilence = silentErrors.some(path => url?.includes(path));

    // Log error details for debugging (except for silent errors)
    if (!shouldSilence) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    }

    // Check for session invalidation error (logged in from another device)
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.detail || '';
      if (errorMessage.includes('session is no longer valid') ||
          errorMessage.includes('logged in from another device')) {
        localStorage.clear();
        window.location.href = '/login?session_expired=true';
      }
    }

    // Only redirect to login on 401 if the request had a token (authenticated request)
    // This allows public pages to work without login
    if (error.response?.status === 401) {
      const token = localStorage.getItem('student_access_token');
      if (token) {
        // User was logged in but token is invalid - redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
      // If no token, let the component handle the error (public pages)
    }
    return Promise.reject(error);
  }
);

// ========== Authentication APIs ==========

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Remember me flag (optional)
 */
export const loginUser = (email, password, rememberMe = false) => {
  return api.post('/auth/login/', {
    email,
    password,
    remember_me: rememberMe,
  });
};

/**
 * Logout user and clear session
 */
export const logoutUser = () => {
  return api.post('/auth/logout/');
};

/**
 * Get current user profile with college details
 */
export const getCurrentUserProfile = () => {
  return api.get('/student/profile/');
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 */
export const registerUser = (userData) => {
  return api.post('/auth/register/', userData);
};

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

/**
 * Get companies for a specific challenge
 * @param {number|string} challengeIdOrSlug - Challenge ID or slug
 */
export const getChallengeCompanies = (challengeIdOrSlug) => {
  return api.get(`/coding/challenges/${challengeIdOrSlug}/companies/`);
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

// ========== Certification/Exam APIs ==========

/**
 * Get all available certifications for a course
 * @param {number} courseId - Course ID
 * @param {Object} params - Query parameters
 */
export const getCertifications = async (params = {}) => {
  try {
    // The backend routes: /api/student/certifications/certifications/
    const response = await api.get('/student/certifications/certifications/', { params });

    // Check if response contains URLs instead of data
    if (response.data && typeof response.data === 'object') {
      // If it's a dict with 'certifications' key pointing to a URL, fetch from that URL
      if (response.data.certifications && typeof response.data.certifications === 'string') {
        const certsResponse = await api.get(response.data.certifications);
        return certsResponse;
      }
      // If it's a dict with data key, return the data
      if (response.data.data) {
        return { data: response.data.data };
      }
      // If it's already the array, return it
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
    }

    return response;
  } catch (err) {
    console.error('Error fetching certifications:', err);
    throw err;
  }
};

/**
 * Get certification by ID
 * @param {number} id - Certification ID
 */
export const getCertificationById = async (id) => {
  try {
    // The backend routes: /api/student/certifications/certifications/{id}/
    const response = await api.get(`/student/certifications/certifications/${id}/`);

    // Check if response is a URL or actual data
    if (response.data && typeof response.data === 'object') {
      // If it has questions key pointing to URL, this is likely the detail endpoint
      if (response.data.questions && typeof response.data.questions === 'string') {
        return response;
      }
      // If it's already the data, return it
      if (response.data.id && response.data.title) {
        return response;
      }
    }

    return response;
  } catch (err) {
    console.error('Error fetching certification:', err);
    throw err;
  }
};

/**
 * Get questions for a certification (without showing correct answers)
 * @param {number} certificationId - Certification ID
 */
export const getCertificationQuestions = async (certificationId, limit = 30) => {
  try {
    // The backend routes: /api/student/certifications/certifications/{id}/questions/
    // Optional limit parameter controls how many random questions to show (default: 30)
    const response = await api.get(`/student/certifications/certifications/${certificationId}/questions/`, {
      params: { limit }
    });

    // Handle URL responses
    if (response.data && typeof response.data === 'object') {
      // If it's an array of questions, return it
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      // If it has results key (paginated response)
      if (response.data.results) {
        return { data: response.data.results };
      }
      // If it's a dict with data key
      if (response.data.data) {
        return { data: response.data.data };
      }
    }

    return response;
  } catch (err) {
    console.error('Error fetching questions:', err);
    throw err;
  }
};

/**
 * Get student's certification attempts
 * @param {number} certificationId - Certification ID
 */
export const getCertificationAttempts = async (certificationId) => {
  try {
    // The backend routes: /api/student/certifications/certifications/{id}/my_attempts/
    const response = await api.get(`/student/certifications/certifications/${certificationId}/my_attempts/`);

    // Handle URL responses
    if (response.data && typeof response.data === 'object') {
      // If it's an array of attempts, return it
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      // If it has results key (paginated response)
      if (response.data.results) {
        return { data: response.data.results };
      }
      // If it's a dict with data key
      if (response.data.data) {
        return { data: response.data.data };
      }
    }

    return response;
  } catch (err) {
    console.error('Error fetching attempts:', err);
    throw err;
  }
};

/**
 * Get a specific certification attempt with full details (including college info)
 * @param {number} certificationId - Certification ID
 * @param {number} attemptId - Attempt ID
 */
export const getCertificationAttemptById = async (certificationId, attemptId) => {
  try {
    // Try direct attempts endpoint first (returns full details including college)
    try {
      const response = await api.get(`/student/certifications/attempts/${attemptId}/`);
      return response;
    } catch (err) {
    }
    
    // Fallback: try the nested route (via my_attempts action)
    const response = await api.get(`/student/certifications/certifications/${certificationId}/my_attempts/`);
    
    // Extract the specific attempt from the list
    let attempts = response.data.results || response.data.data || response.data;
    if (Array.isArray(attempts)) {
      const attempt = attempts.find(a => a.id === attemptId);
      if (attempt) {
        return { data: attempt };
      }
    }
    
    throw new Error('Could not find attempt in either endpoint');
  } catch (err) {
    console.error('Error fetching attempt details:', err);
    throw err;
  }
};

/**
 * Start a new certification attempt
 * @param {number} certificationId - Certification ID
 */
export const startCertificationAttempt = (certificationId) => {
  // The backend routes: /api/student/certifications/attempts/start/
  return api.post(`/student/certifications/attempts/start/`, {
    certification: certificationId
  });
};

/**
 * Submit certification attempt with answers
 * @param {number} attemptId - Certification Attempt ID
 * @param {Array} answers - Array of {question_id, selected_options}
 */
export const submitCertificationAttempt = (attemptId, answers) => {
  return api.post(`/student/certifications/attempts/${attemptId}/submit/`, {
    answers
  });
};

/**
 * Download certificate PDF
 * @param {number} attemptId - Certification Attempt ID
 */
export const downloadCertificate = (attemptId) => {
  // Create a separate axios instance to avoid DRF content negotiation issues
  // that cause 406 Not Acceptable errors
  const downloadApi = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 30000, // 30 second timeout for PDF generation
  });

  // Add auth token
  const token = localStorage.getItem('student_access_token');
  if (token) {
    downloadApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }


  // Don't send Content-Type header to avoid content negotiation conflicts
  return downloadApi.get(`/student/certifications/attempts/${attemptId}/download_certificate/`, {
    responseType: 'blob'
  }).catch(error => {
    console.error('Certificate download error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  });
};

export default api;
