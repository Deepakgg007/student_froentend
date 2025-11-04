// JobCard Component
// Displays a single job posting card

import React from 'react';
import { Link } from 'react-router-dom';
import { formatSalary, getJobTypeDisplay, getExperienceLevelDisplay, getDaysRemaining, isDeadlinePassed } from '../../services/api';

const JobCard = ({ job }) => {
  const {
    id,
    slug,
    company_name,
    company_logo,
    title,
    job_type,
    experience_level,
    location,
    salary_min,
    salary_max,
    salary_currency,
    application_deadline,
    is_featured,
  } = job;

  const daysRemaining = getDaysRemaining(application_deadline);
  const deadlinePassed = isDeadlinePassed(application_deadline);

  return (
    <div 
      className={`card job-card h-100 border-0 position-relative overflow-hidden`}
      style={{
        borderRadius: '16px',
        transition: 'all 0.3s ease-in-out',
        background: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(0)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      }}
    >
      {/* Featured Badge */}
      {is_featured && (
        <div 
          style={{
            position: 'absolute',
            top: '1rem',
            right: '-2rem',
            transform: 'rotate(45deg)',
            backgroundColor: '#0061ff',
            color: 'white',
            padding: '0.25rem 2.5rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1
          }}
        >
          <i className="fas fa-star me-1"></i>
          Featured
        </div>
      )}

      <div className="card-body p-4">
        {/* Company Logo and Name */}
        <div className="d-flex align-items-center mb-4">
          {company_logo ? (
            <div className="me-3 position-relative" style={{ 
              width: '48px', 
              height: '48px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <img 
                src={company_logo} 
                alt={company_name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  padding: '4px',
                  background: 'white'
                }}
              />
            </div>
          ) : (
            <div 
              className="me-3 d-flex align-items-center justify-content-center"
              style={{ 
                width: '48px', 
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f6f8fb 0%, #f0f4f8 100%)'
              }}
            >
              <i className="fas fa-building text-primary" style={{ fontSize: '1.5rem', opacity: 0.7 }}></i>
            </div>
          )}
          <div>
            <h6 className="mb-1" style={{ color: '#4a5568', fontWeight: '600' }}>{company_name}</h6>
            <div className="d-flex align-items-center">
              {location && (
                <span className="small text-muted">
                  <i className="fas fa-map-marker-alt me-1"></i>
                  {location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Job Title */}
        <h5 className="card-title mb-4" style={{ 
          fontWeight: '700',
          fontSize: '1.25rem',
          color: '#1a202c',
          lineHeight: '1.4'
        }}>{title}</h5>

        {/* Job Details Grid */}
        <div className="row g-3 mb-4">
          <div className="col-6">
            <div className="p-3" style={{ 
              background: 'linear-gradient(135deg, #f6f8fb 0%, #f0f4f8 100%)',
              borderRadius: '10px'
            }}>
              <div className="d-flex align-items-center">
                <i className="fas fa-briefcase text-primary me-2" style={{ opacity: 0.8 }}></i>
                <span className="small fw-medium" style={{ color: '#4a5568' }}>
                  {getJobTypeDisplay(job_type)}
                </span>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="p-3" style={{ 
              background: 'linear-gradient(135deg, #f6f8fb 0%, #f0f4f8 100%)',
              borderRadius: '10px'
            }}>
              <div className="d-flex align-items-center">
                <i className="fas fa-layer-group text-primary me-2" style={{ opacity: 0.8 }}></i>
                <span className="small fw-medium" style={{ color: '#4a5568' }}>
                  {getExperienceLevelDisplay(experience_level)}
                </span>
              </div>
            </div>
          </div>
          {(salary_min || salary_max) && (
            <div className="col-12">
              <div className="p-3" style={{ 
                background: 'linear-gradient(135deg, #f6f8fb 0%, #f0f4f8 100%)',
                borderRadius: '10px'
              }}>
                <div className="d-flex align-items-center">
                  <i className="fas fa-money-bill-wave text-primary me-2" style={{ opacity: 0.8 }}></i>
                  <span className="small fw-medium" style={{ color: '#4a5568' }}>
                    {formatSalary(salary_min, salary_max, salary_currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Application Deadline */}
        {application_deadline && (
          <div className="mb-4">
            {deadlinePassed ? (
              <div className="d-inline-flex align-items-center px-3 py-2" style={{
                background: '#FED7D7',
                color: '#C53030',
                borderRadius: '20px',
                fontSize: '0.875rem'
              }}>
                <i className="fas fa-times-circle me-2"></i>
                Applications Closed
              </div>
            ) : daysRemaining !== null && (
              <div className="d-inline-flex align-items-center px-3 py-2" style={{
                background: daysRemaining <= 7 ? '#FEFCBF' : '#BEE3F8',
                color: daysRemaining <= 7 ? '#975A16' : '#2B6CB0',
                borderRadius: '20px',
                fontSize: '0.875rem'
              }}>
                <i className="fas fa-clock me-2"></i>
                {daysRemaining} days left to apply
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Card Footer */}
      <div className="card-footer bg-transparent border-0 p-4 pt-0">
        <Link 
          to={`/jobs/${slug}`}
          className="btn w-100 position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            padding: '0.75rem 1.5rem',
            transition: 'all 0.3s ease',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 97, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span className="d-flex align-items-center justify-content-center">
            <i className="fas fa-external-link-alt me-2"></i>
            View Position
          </span>
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
