// Job List Page
// Displays all job openings with filters

import React, { useState, useEffect, Fragment } from 'react';
import { getJobs, getJobTypeDisplay, getExperienceLevelDisplay } from '../../services/api';
import JobCard from '../../component/cards/JobCard';
import Header from '../../component/layout/header';
import Footer from '../../component/layout/footer';
import Swal from 'sweetalert2';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    job_type: '',
    experience_level: '',
    location: '',
    is_featured: false,
  });

  const jobTypes = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE'];
  const experienceLevels = ['ENTRY', 'MID', 'SENIOR', 'LEAD'];

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const params = {
        is_active: true,
      };

      if (filters.search) {
        params.search = filters.search;
      }

      if (filters.job_type) {
        params.job_type = filters.job_type;
      }

      if (filters.experience_level) {
        params.experience_level = filters.experience_level;
      }

      if (filters.location) {
        params.location = filters.location;
      }

      if (filters.is_featured) {
        params.is_featured = true;
      }

      const response = await getJobs(params);
      console.log('Jobs API Response:', response);
      console.log('Jobs Data:', response.data);
      console.log('Total Jobs:', response.data?.length || 0);
      
      // Handle both array response and paginated response
      const jobsData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.results || response.data?.data || [];
      
      setJobs(jobsData);
      console.log('Jobs set to state:', jobsData.length);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load jobs. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await getJobs({ is_active: true });
      const uniqueLocations = [...new Set(
        response.data
          .map(job => job.location)
          .filter(loc => loc && loc.trim())
      )];
      setLocations(uniqueLocations.sort());
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      job_type: '',
      experience_level: '',
      location: '',
      is_featured: false,
    });
  };

  return (
    <Fragment>
      <Header />
      
      {/* Enhanced Page Header */}
      <div className="page-header-content text-center" style={{
        paddingTop: '120px',
        paddingBottom: '60px',
        background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <h2 className="display-4 text-white mb-3" style={{ fontWeight: '700' }}>
            Job Opportunities
          </h2>
          <p className="text-white mb-4" style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Find your next opportunity at top tech companies
          </p>
          <div className="d-flex justify-content-center gap-3">
            <div className="badge bg-white text-primary px-4 py-2" style={{ borderRadius: '20px' }}>
              <i className="fas fa-briefcase me-2"></i>{jobs.length} Open Positions
            </div>
            <div className="badge bg-white text-primary px-4 py-2" style={{ borderRadius: '20px' }}>
              <i className="fas fa-building me-2"></i>Top Companies
            </div>
            <div className="badge bg-white text-primary px-4 py-2" style={{ borderRadius: '20px' }}>
              <i className="fas fa-map-marker-alt me-2"></i>{locations.length} Locations
            </div>
          </div>
        </div>
        {/* Modern background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 56 28\' width=\'56\' height=\'28\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'0.4\' d=\'M56 26v2h-7.75c2.3-1.27 4.94-2 7.75-2zm-26 2a2 2 0 1 0-4 0h-4.09A25.98 25.98 0 0 0 0 16v-2c.67 0 1.34.02 2 .07V14a2 2 0 0 0-2-2v-2a4 4 0 0 1 3.98 3.6 28.09 28.09 0 0 1 2.8-3.86A8 8 0 0 0 0 6V4a9.99 9.99 0 0 1 8.17 4.23c.94-.95 1.96-1.83 3.03-2.63A13.98 13.98 0 0 0 0 0h7.75c2 1.1 3.73 2.63 5.1 4.45 1.12-.72 2.3-1.37 3.53-1.93A20.1 20.1 0 0 0 14.28 0h2.7c.45.56.88 1.14 1.29 1.74 1.3-.48 2.63-.87 4-1.15-.11-.2-.23-.4-.36-.59H26v.07a28.4 28.4 0 0 1 4 0V0h4.09l-.37.59c1.38.28 2.72.67 4.01 1.15.4-.6.84-1.18 1.3-1.74h2.69a20.1 20.1 0 0 0-2.1 2.52c1.23.56 2.41 1.2 3.54 1.93A16.08 16.08 0 0 1 48.25 0H56c-4.58 0-8.65 2.2-11.2 5.6 1.07.8 2.09 1.68 3.03 2.63A9.99 9.99 0 0 1 56 4v2a8 8 0 0 0-6.77 3.74c1.03 1.2 1.97 2.5 2.79 3.86A4 4 0 0 1 56 10v2a2 2 0 0 0-2 2.07 28.4 28.4 0 0 1 2-.07v2c-9.2 0-17.3 4.78-21.91 12H30zM7.75 28H0v-2c2.81 0 5.46.73 7.75 2zM56 20v2c-5.6 0-10.65 2.3-14.28 6h-2.7c4.04-4.89 10.15-8 16.98-8zm-39.03 8h-2.69C10.65 24.3 5.6 22 0 22v-2c6.83 0 12.94 3.11 16.97 8zm15.01-.4a28.09 28.09 0 0 1 2.8-3.86 8 8 0 0 0-13.55 0c1.03 1.2 1.97 2.5 2.79 3.86a4 4 0 0 1 7.96 0zm14.29-11.86c1.3-.48 2.63-.87 4-1.15a25.99 25.99 0 0 0-44.55 0c1.38.28 2.72.67 4.01 1.15a21.98 21.98 0 0 1 36.54 0z\'%3E%3C/path%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      <div className="container-fluid px-4 py-5" style={{ background: '#f8fafc' }}>
      {/* Filters Section */}
      <div className="text-center mb-4">
      </div>

      {/* Enhanced Filters Section */}
      <div className="row g-4 mb-5">
        <div className="col-12">
          <div className="card shadow-lg border-0" style={{ borderRadius: '16px', background: 'white' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <i className="fas fa-filter text-primary me-2" style={{ fontSize: '1.25rem' }}></i>
                <h5 className="card-title mb-0">Filter Opportunities</h5>
              </div>
              
              <form onSubmit={handleSearchSubmit} className="row g-4">
                {/* Enhanced Search Input */}
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search jobs..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      style={{ fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                {/* Enhanced Job Type Filter */}
                <div className="col-md-2">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <i className="fas fa-briefcase text-muted"></i>
                    </span>
                    <select
                      className="form-select border-start-0 ps-0"
                      value={filters.job_type}
                      onChange={(e) => handleFilterChange('job_type', e.target.value)}
                      style={{ fontSize: '0.95rem' }}
                    >
                      <option value="">All Job Types</option>
                      {jobTypes.map(type => (
                        <option key={type} value={type}>
                          {getJobTypeDisplay(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Enhanced Experience Level Filter */}
                <div className="col-md-2">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <i className="fas fa-layer-group text-muted"></i>
                    </span>
                    <select
                      className="form-select border-start-0 ps-0"
                      value={filters.experience_level}
                      onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                      style={{ fontSize: '0.95rem' }}
                    >
                      <option value="">All Levels</option>
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>
                          {getExperienceLevelDisplay(level)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Enhanced Location Filter */}
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <i className="fas fa-map-marker-alt text-muted"></i>
                    </span>
                    <select
                      className="form-select border-start-0 ps-0"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      style={{ fontSize: '0.95rem' }}
                    >
                      <option value="">All Locations</option>
                      {locations.map(location => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Enhanced Search Button */}
                <div className="col-md-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    style={{
                      background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      height: '40px'
                    }}
                  >
                    <i className="fas fa-search me-2"></i>
                    Search
                  </button>
                </div>
              </form>

              {/* Enhanced Featured Jobs Toggle and Reset */}
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="featuredCheck"
                      checked={filters.is_featured}
                      onChange={(e) => handleFilterChange('is_featured', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label className="form-check-label" htmlFor="featuredCheck" style={{ cursor: 'pointer' }}>
                      <i className="fas fa-star text-warning me-2"></i>
                      Featured Jobs Only
                    </label>
                  </div>
                </div>

                {/* Enhanced Reset Filters */}
                {(filters.search || filters.job_type || filters.experience_level || filters.location || filters.is_featured) && (
                  <div className="col-md-6 text-end">
                    <button
                      type="button"
                      className="btn btn-light btn-sm d-inline-flex align-items-center"
                      onClick={resetFilters}
                      style={{ 
                        borderRadius: '20px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      <i className="fas fa-redo-alt me-2"></i>
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="position-relative d-inline-block" style={{ width: '120px', height: '120px' }}>
            <div className="spinner-grow text-primary position-absolute" style={{ 
              width: '3rem', 
              height: '3rem',
              animation: 'spinner-grow 1s ease-in-out infinite',
              opacity: '0.2',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }} role="status"></div>
            <div className="spinner-grow text-primary position-absolute" style={{ 
              width: '3rem', 
              height: '3rem',
              animation: 'spinner-grow 1s ease-in-out infinite',
              animationDelay: '0.2s',
              opacity: '0.4',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }} role="status"></div>
            <div className="spinner-grow text-primary position-absolute" style={{ 
              width: '3rem', 
              height: '3rem',
              animation: 'spinner-grow 1s ease-in-out infinite',
              animationDelay: '0.4s',
              opacity: '0.6',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }} role="status"></div>
          </div>
          <p className="mt-4 text-muted" style={{ fontSize: '1.1rem' }}>
            <i className="fas fa-sync-alt fa-spin me-2"></i>
            Discovering opportunities...
          </p>
        </div>
      ) : (
        <>
          {/* Enhanced Results Count */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex align-items-center">
                <div className="bg-light rounded-pill px-3 py-2 me-3">
                  <span className="text-primary fw-medium">
                    <i className="fas fa-briefcase me-2"></i>
                    {jobs.length}
                  </span>
                </div>
                <h6 className="mb-0 text-muted">
                  {jobs.length === 0 ? 'No opportunities found' : 
                   jobs.length === 1 ? 'Opportunity found' : 
                   'Opportunities found'}
                </h6>
                {jobs.length > 0 && filters.is_featured && (
                  <span className="badge bg-warning text-dark ms-3" style={{ fontSize: '0.8rem' }}>
                    <i className="fas fa-star me-1"></i>
                    Featured Only
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Jobs Grid */}
          {jobs.length > 0 ? (
            <div className="row g-4">
              {jobs.map((job, index) => (
                <div
                  key={job.id}
                  className="col-lg-4 col-md-6 col-sm-12 wow fadeInUp"
                  data-wow-delay={`${0.1 * (index % 3)}s`}
                  style={{ transition: 'all 0.3s ease-in-out' }}
                >
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                  style={{ width: '100px', height: '100px' }}>
                  <i className="fas fa-briefcase fa-3x text-primary opacity-75"></i>
                </div>
                <h4 className="mb-3" style={{ color: '#2d3748' }}>No opportunities found</h4>
                <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                  We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.
                </p>
                <button
                  className="btn btn-primary px-4 py-2"
                  onClick={resetFilters}
                  style={{
                    background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                >
                  <i className="fas fa-redo-alt me-2"></i>
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
    <Footer />
    </Fragment>
  );
};

export default JobList;
