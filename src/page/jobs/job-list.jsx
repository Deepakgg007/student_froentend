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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); // ✅ NEW: mobile filter toggle

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
      const params = { is_active: true };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const response = await getJobs(params);
      const jobsData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || response.data?.data || [];
      setJobs(jobsData);
    } catch (error) {
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
      const jobsData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || response.data?.data || [];
      const uniqueLocations = [...new Set(jobsData.map(j => j.location).filter(Boolean))];
      setLocations(uniqueLocations.sort());
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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

      {/* ✅ Enhanced Page Header (more compact for mobile) */}
      <div
        className="page-header-content text-center"
        style={{
          paddingTop: '100px',
          paddingBottom: '50px',
          background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)',
        }}
      >
        <div className="container">
          <h2
            className="text-white fw-bold mb-3"
            style={{
              fontSize: 'clamp(1.6rem, 4.5vw, 2.8rem)',
              lineHeight: '1.2',
            }}
          >
            Job Opportunities
          </h2>
          <p
            className="text-white opacity-90 mb-4"
            style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.2rem)' }}
          >
            Find your next opportunity at top tech companies
          </p>

          {/* Stats badges */}
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <div className="badge bg-white text-primary px-3 py-2 fw-semibold">
              <i className="fas fa-briefcase me-1"></i> {jobs.length} Open Positions
            </div>
            <div className="badge bg-white text-primary px-3 py-2 fw-semibold">
              <i className="fas fa-map-marker-alt me-1"></i> {locations.length} Locations
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-5" style={{ background: '#f8fafc' }}>
        {/* ✅ Mobile Filter Toggle Button */}
        <div className="d-md-none text-center mb-3">
          <button
            className="btn btn-outline-primary w-100 d-flex justify-content-center align-items-center"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            style={{ borderRadius: '10px' }}
          >
            <i className="fas fa-filter me-2"></i>
            {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* ✅ Filter Card — visible always on desktop, toggled on mobile */}
        <div
          className={`card shadow-lg border-0 mb-5 ${isMobileFilterOpen ? 'd-block' : 'd-none d-md-block'}`}
          style={{ borderRadius: '16px', background: 'white' }}
        >
          <div className="card-body p-4">
            <div className="d-flex align-items-center mb-4">
              <i className="fas fa-filter text-primary me-2"></i>
              <h5 className="card-title mb-0">Filter Opportunities</h5>
            </div>

            <form onSubmit={handleSearchSubmit} className="row g-4">
              {/* Search */}
              <div className="col-md-3 col-12">
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
                  />
                </div>
              </div>

              {/* Job Type */}
              <div className="col-md-2 col-6">
                <select
                  className="form-select"
                  value={filters.job_type}
                  onChange={(e) => handleFilterChange('job_type', e.target.value)}
                >
                  <option value="">All Job Types</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{getJobTypeDisplay(type)}</option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div className="col-md-2 col-6">
                <select
                  className="form-select"
                  value={filters.experience_level}
                  onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                >
                  <option value="">All Levels</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{getExperienceLevelDisplay(level)}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="col-md-3 col-12">
                <select
                  className="form-select"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="col-md-2 col-12">
                <button type="submit" className="btn btn-primary w-100">
                  <i className="fas fa-search me-2"></i> Search
                </button>
              </div>
            </form>

            {/* Featured toggle + Reset */}
            <div className="row mt-3">
              <div className="col-md-6 col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="featuredCheck"
                    checked={filters.is_featured}
                    onChange={(e) => handleFilterChange('is_featured', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="featuredCheck">
                    <i className="fas fa-star text-warning me-1"></i> Featured Only
                  </label>
                </div>
              </div>
              {(filters.search || filters.job_type || filters.experience_level || filters.location || filters.is_featured) && (
                <div className="col-md-6 text-end">
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={resetFilters}
                  >
                    <i className="fas fa-redo-alt me-1"></i> Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Job Results (unchanged logic) */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
            <p className="mt-3 text-muted">Loading opportunities...</p>
          </div>
        ) : (
          <div className="row g-4">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="col-lg-4 col-md-6 col-sm-12">
                  <JobCard job={job} />
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <h5 className="text-muted">No jobs found</h5>
                <button className="btn btn-primary mt-3" onClick={resetFilters}>
                  <i className="fas fa-redo-alt me-2"></i> Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </Fragment>
  );
};

export default JobList;
