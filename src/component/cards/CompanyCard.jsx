// CompanyCard Component
// Displays a single company card with logo, info, stats, and actions

import React from 'react';
import { Link } from 'react-router-dom';

const CompanyCard = ({ company }) => {
  const {
    slug,
    name,
    image,
    industry,
    location,
    employee_count,
    website,
    is_hiring_open,
    days_until_hiring_ends,
    hiring_period_start,
    hiring_period_end,
    total_concepts,
    total_challenges,
  } = company;

  return (
    <div className="card company-card h-100 border-0 shadow-sm">
      {/* Company Header */}
      <div className="card-header bg-white border-0 pb-0">
        <div className="d-flex align-items-center">
          {image ? (
            <img 
              src={image} 
              className="company-logo-inline me-3" 
              alt={name}
              style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px' }}
            />
          ) : (
            <div 
              className="company-logo-inline me-3 bg-light rounded d-flex align-items-center justify-content-center" 
              style={{ width: '60px', height: '60px' }}
            >
              <i className="fas fa-building text-muted"></i>
            </div>
          )}
          <div className="flex-grow-1">
            <h5 className="mb-1 fw-bold">{name}</h5>
            {industry && (
              <span className="text-muted small">{industry}</span>
            )}
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Hiring Status Badge */}
        <div className="mb-3">
          {is_hiring_open ? (
            <>
              <span className="badge rounded-pill bg-success px-3 py-2">
                <i className="fas fa-check-circle me-1"></i> Actively Hiring
              </span>
              {days_until_hiring_ends > 0 && (
                <span className="badge rounded-pill bg-warning text-dark px-3 py-2 ms-2">
                  <i className="fas fa-clock me-1"></i> {days_until_hiring_ends} days left
                </span>
              )}
            </>
          ) : (
            <span className="badge rounded-pill bg-secondary px-3 py-2">
              <i className="fas fa-pause-circle me-1"></i> Not Hiring
            </span>
          )}
        </div>

        {/* Company Info */}
        <div className="company-info-grid mb-3">
          {location && (
            <div className="d-flex align-items-center mb-2">
              <i className="fas fa-map-marker-alt text-primary me-2" style={{ width: '20px' }}></i>
              <span className="text-muted small">{location}</span>
            </div>
          )}
          {employee_count && (
            <div className="d-flex align-items-center mb-2">
              <i className="fas fa-users text-primary me-2" style={{ width: '20px' }}></i>
              <span className="text-muted small">{employee_count} employees</span>
            </div>
          )}
          {hiring_period_start && hiring_period_end && (
            <div className="d-flex align-items-center mb-2">
              <i className="fas fa-calendar-alt text-primary me-2" style={{ width: '20px' }}></i>
              <span className="text-muted small">
                {new Date(hiring_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                {new Date(hiring_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="stats-section bg-light rounded p-3 mb-3">
          <div className="row text-center">
            <div className="col-4">
              <div className="stat-item">
                <h4 className="mb-0 text-primary fw-bold">{total_concepts || 0}</h4>
                <small className="text-muted">Concepts</small>
              </div>
            </div>
            <div className="col-4 border-start border-end">
              <div className="stat-item">
                <h4 className="mb-0 text-success fw-bold">{total_challenges || 0}</h4>
                <small className="text-muted">Challenges</small>
              </div>
            </div>
            <div className="col-4">
              <div className="stat-item">
                {website ? (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    <h4 className="mb-0"><i className="fas fa-globe text-info"></i></h4>
                    <small>Website</small>
                  </a>
                ) : (
                  <>
                    <h4 className="mb-0 text-muted">-</h4>
                    <small className="text-muted">No Website</small>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer with Action Buttons */}
      <div className="card-footer bg-white border-0 pt-0">
        <div className="d-grid gap-2">
          <Link 
            to={`/companies/${slug}`} 
            className="btn btn-primary"
          >
            <i className="fas fa-eye me-2"></i>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
