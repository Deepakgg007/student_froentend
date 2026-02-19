// Job Detail Page
// Displays full job information and application details

import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobBySlug, getCompanyBySlug, formatSalary, getJobTypeDisplay, getExperienceLevelDisplay, getDaysRemaining, isDeadlinePassed } from '../../services/api';
import Swal from 'sweetalert2';
import { useSmoothData } from '../../hooks/useSmoothData';

const JobDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [companyUrl, setCompanyUrl] = useState(null);

  // Fetch job data with smooth transition
  const { data: job, loading, error } = useSmoothData(
    () => getJobBySlug(slug),
    [slug]
  );

  // When job data is available, try to resolve the company's website via API
  useEffect(() => {
    const resolveCompanyWebsite = async () => {
      if (!job) return;

      // If job already has a website field, use it immediately
      if (job.website) {
        setCompanyUrl(job.website);
        return;
      }

      // Try fetching company details by slug/id (job.company is expected to be slug or id)
      try {
        const resp = await getCompanyBySlug(job.company);
        const site = resp.data?.website || resp.data?.website_url || null;
        if (site) {
          setCompanyUrl(site);
          return;
        }
      } catch (err) {
        // ignore and fall back to generated URL
        // console.debug('Could not fetch company by slug', err);
      }

      // Fallback: generate a simple www.companyname.com from company_name
      if (job.company_name) {
        const gen = `https://www.${job.company_name.toLowerCase().replace(/\s+/g, '')}.com`;
        setCompanyUrl(gen);
      }
    };

    resolveCompanyWebsite();
  }, [job]);

  // Handle error
  useEffect(() => {
    if (error) {
      console.error('Error fetching job data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load job details. Please try again.',
      });
    }
  }, [error]);

  const handleApply = () => {
    if (!job) return;

    if (job.application_url) {
      window.open(job.application_url, '_blank');
    } else if (job.contact_email) {
      window.location.href = `mailto:${job.contact_email}?subject=Application for ${job.title}`;
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Application Information',
        text: 'Please contact the company directly for application details.',
      });
    }
  };

  if (loading) {
    return (
      <Fragment>
        <div style={{ paddingTop: '100px' }}></div>
        <div className="container-fluid px-5 py-5">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-2 text-center">
                  <div className="skeleton-line" style={{ width: '100px', height: '100px', margin: '0 auto' }}></div>
                </div>
                <div className="col-md-7">
                  <div className="skeleton-line mb-3" style={{ width: '60%', height: '28px' }}></div>
                  <div className="d-flex gap-2 mb-3">
                    <div className="skeleton-line rounded" style={{ width: '100px', height: '32px' }}></div>
                    <div className="skeleton-line rounded" style={{ width: '120px', height: '32px' }}></div>
                  </div>
                  <div className="skeleton-line" style={{ width: '40%', height: '24px' }}></div>
                </div>
                <div className="col-md-3">
                  <div className="skeleton-line rounded" style={{ width: '100%', height: '48px' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <div className="skeleton-line mb-2" style={{ width: '30%', height: '24px' }}></div>
                  <div className="skeleton-line mb-2" style={{ width: '100%', height: '16px' }}></div>
                  <div className="skeleton-line mb-2" style={{ width: '100%', height: '16px' }}></div>
                  <div className="skeleton-line" style={{ width: '80%', height: '16px' }}></div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <div className="skeleton-line mb-3" style={{ width: '40%', height: '20px' }}></div>
                  <div className="skeleton-line mb-2" style={{ width: '100%', height: '16px' }}></div>
                  <div className="skeleton-line mb-2" style={{ width: '90%', height: '16px' }}></div>
                  <div className="skeleton-line" style={{ width: '70%', height: '16px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  if (!job) {
    return (
      <Fragment>
        <div style={{ paddingTop: '100px' }}></div>
        <div className="container-fluid px-5 py-5">
        <div className="text-center py-5">
          <i className="fas fa-exclamation-circle fa-4x text-danger mb-3"></i>
          <h4>Job not found</h4>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/jobs')}>
            Back to Jobs
          </button>
        </div>
      </div>
      </Fragment>
    );
  }

  const daysRemaining = getDaysRemaining(job.application_deadline);
  const deadlinePassed = isDeadlinePassed(job.application_deadline);

  return (
    <Fragment>
      
      {/* Page Header with proper spacing */}
      <div style={{ paddingTop: '100px' }}></div>

      <div
        className="container-fluid px-5 py-4"
        style={{
          opacity: job ? 1 : 0,
          transform: job ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
        }}
      >
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/jobs">Jobs</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {job.title}
          </li>
        </ol>
      </nav>

      {/* Job Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                {/* Company Logo */}
                <div className="col-md-2 text-center">
                  {job.company_logo ? (
                    <img
                      src={job.company_logo}
                      alt={job.company_name}
                      className="img-fluid"
                      style={{ maxHeight: '100px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center bg-light rounded"
                      style={{ height: '100px' }}
                    >
                      <i className="fas fa-building fa-3x text-muted"></i>
                    </div>
                  )}
                </div>

                {/* Job Info */}
                <div className="col-md-7">
                  <h6 className="text-muted mb-2">{job.company_name}</h6>
                  <h2 className="mb-3">{job.title}</h2>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-primary">
                      <i className="fas fa-briefcase me-1"></i>
                      {getJobTypeDisplay(job.job_type)}
                    </span>
                    <span className="badge bg-info">
                      <i className="fas fa-layer-group me-1"></i>
                      {getExperienceLevelDisplay(job.experience_level)}
                    </span>
                    {job.location && (
                      <span className="badge bg-secondary">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {job.location}
                      </span>
                    )}
                    {job.is_featured && (
                      <span className="badge bg-warning text-dark">
                        <i className="fas fa-star me-1"></i>
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Deadline */}
                  {job.application_deadline && (
                    <div>
                      {deadlinePassed ? (
                        <span className="badge bg-danger fs-6">
                          <i className="fas fa-times-circle me-1"></i>
                          Applications Closed
                        </span>
                      ) : daysRemaining !== null && (
                        <span className={`badge ${daysRemaining <= 7 ? 'bg-warning text-dark' : 'bg-success'} fs-6`}>
                          <i className="fas fa-clock me-1"></i>
                          {daysRemaining} days left to apply
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <div className="col-md-3 text-md-end mt-3 mt-md-0">
                  {!deadlinePassed ? (
                    <button
                      className="btn btn-primary btn-lg w-100"
                      onClick={handleApply}
                    >
                      <i className="fas fa-paper-plane me-2"></i>
                      Apply Now
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary btn-lg w-100"
                      disabled
                    >
                      <i className="fas fa-times-circle me-2"></i>
                      Applications Closed
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Job Description */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">
                <i className="fas fa-file-alt me-2"></i>
                Job Description
              </h4>
            </div>
            <div className="card-body">
              <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                {job.description}
              </p>
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h4 className="mb-0">
                  <i className="fas fa-tasks me-2"></i>
                  Responsibilities
                </h4>
              </div>
              <div className="card-body">
                <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                  {job.responsibilities}
                </p>
              </div>
            </div>
          )}

          {/* Qualifications */}
          {job.qualifications && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h4 className="mb-0">
                  <i className="fas fa-graduation-cap me-2"></i>
                  Qualifications
                </h4>
              </div>
              <div className="card-body">
                <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                  {job.qualifications}
                </p>
              </div>
            </div>
          )}

          {/* Required Skills */}
          {job.required_skills && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h4 className="mb-0">
                  <i className="fas fa-code me-2"></i>
                  Required Skills
                </h4>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {job.required_skills.split(',').map((skill, index) => (
                    <span key={index} className="badge bg-light text-dark border" style={{ fontSize: '0.9rem' }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Job Summary */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Job Summary</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-3">
                  <i className="fas fa-briefcase text-primary me-2"></i>
                  <strong>Job Type:</strong>
                  <br />
                  <span className="text-muted">{getJobTypeDisplay(job.job_type)}</span>
                </li>
                <li className="mb-3">
                  <i className="fas fa-layer-group text-primary me-2"></i>
                  <strong>Experience Level:</strong>
                  <br />
                  <span className="text-muted">{getExperienceLevelDisplay(job.experience_level)}</span>
                </li>
                {job.location && (
                  <li className="mb-3">
                    <i className="fas fa-map-marker-alt text-primary me-2"></i>
                    <strong>Location:</strong>
                    <br />
                    <span className="text-muted">{job.location}</span>
                  </li>
                )}
                {(job.salary_min || job.salary_max) && (
                  <li className="mb-3">
                    <i className="fas fa-money-bill-wave text-primary me-2"></i>
                    <strong>Salary:</strong>
                    <br />
                    <span className="text-muted">
                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                    </span>
                  </li>
                )}
                {job.application_deadline && (
                  <li className="mb-3">
                    <i className="fas fa-calendar-alt text-primary me-2"></i>
                    <strong>Deadline:</strong>
                    <br />
                    <span className="text-muted">
                      {new Date(job.application_deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </li>
                )}
                <li className="mb-3">
                  <i className="fas fa-clock text-primary me-2"></i>
                  <strong>Posted:</strong>
                  <br />
                  <span className="text-muted">
                    {new Date(job.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Company Info */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">About Company</h5>
            </div>
            <div className="card-body text-center">
              {job.company_logo && (
                <img
                  src={job.company_logo}
                  alt={job.company_name}
                  className="img-fluid mb-3"
                  style={{ maxHeight: '80px', objectFit: 'contain' }}
                />
              )}
              <h5>{job.company_name}</h5>
              {job.college_name && (
                <p className="text-muted small mb-3">
                  <i className="fas fa-university me-1"></i>
                  {job.college_name}
                </p>
              )}
              <a
                href={companyUrl || `https://www.${job.company_name.toLowerCase().replace(/\s+/g, '')}.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                <i className="fas fa-external-link-alt me-1"></i>
                Visit Company Website
              </a>
            </div>
          </div>

          {/* Contact */}
          {job.contact_email && (
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Contact</h5>
              </div>
              <div className="card-body">
                <p className="mb-2">
                  <i className="fas fa-envelope text-primary me-2"></i>
                  <strong>Email:</strong>
                </p>
                <p className="text-muted">
                  <a href={`mailto:${job.contact_email}`}>{job.contact_email}</a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="row mt-4">
        <div className="col-12 text-center">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/jobs')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Jobs
          </button>
        </div>
      </div>
    </div>
    </Fragment>
  );
};

export default JobDetail;
