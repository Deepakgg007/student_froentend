// CompanyCard Component - Enhanced Modern Design
// Displays a single company card with logo, info, stats, and actions

import { useState } from 'react';
import { Link } from 'react-router-dom';

const CompanyCard = ({ company }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    slug,
    name,
    image,
    image_display,
    industry,
    location,
    employee_count,
    is_hiring_open,
    hiring_period_start,
    hiring_period_end,
    total_concepts,
    total_challenges,
  } = company;

  // Use image_display if available, fallback to image
  const logoUrl = image_display || image;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className="company-card h-100 border-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: isHovered ? '0 12px 32px rgba(0, 0, 0, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Company Logo Banner */}
      <div
        style={{
          height: '120px',
          background: isHovered
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />

        {logoUrl && !imageError ? (
          <img
            src={logoUrl}
            alt={name}
            onError={handleImageError}
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
              transition: 'all 0.3s ease',
              zIndex: 2,
            }}
          />
        ) : (
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              zIndex: 2,
            }}
          >
            <i
              className="fas fa-building"
              style={{
                fontSize: '2.5rem',
                color: isHovered ? 'white' : '#6c757d',
              }}
            />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
        {/* Company Name and Industry */}
        <div className="mb-3">
          <h5
            style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: '#1a1a1a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </h5>
          {industry && (
            <span
              style={{
                fontSize: '0.85rem',
                color: '#667eea',
                fontWeight: '500',
                textTransform: 'capitalize',
              }}
            >
              {industry}
            </span>
          )}
        </div>

        {/* Hiring Status Badge */}
        <div className="mb-3">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '6px',
              paddingBottom: '6px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              background: is_hiring_open ? '#d4edda' : '#e2e3e5',
              color: is_hiring_open ? '#155724' : '#656565',
            }}
          >
            <i className={`fas ${is_hiring_open ? 'fa-check-circle' : 'fa-pause-circle'}`} />
            {is_hiring_open ? 'Actively Hiring' : 'Not Hiring'}
          </div>
        </div>

        {/* Company Details */}
        <div style={{ marginBottom: '16px', flex: 1 }}>
          {location && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '0.9rem',
              }}
            >
              <i className="fas fa-map-marker-alt" style={{ color: '#667eea', width: '16px' }} />
              <span style={{ color: '#495057' }}>{location}</span>
            </div>
          )}
          {employee_count && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '0.9rem',
              }}
            >
              <i className="fas fa-users" style={{ color: '#667eea', width: '16px' }} />
              <span style={{ color: '#495057' }}>{employee_count} employees</span>
            </div>
          )}
          {hiring_period_start && hiring_period_end && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
              }}
            >
              <i className="fas fa-calendar-alt" style={{ color: '#667eea', width: '16px' }} />
              <span style={{ color: '#495057' }}>
                {new Date(hiring_period_start).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {new Date(hiring_period_end).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            background: '#e9ecef',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '16px',
          }}
        >
          {/* Concepts */}
          <div
            style={{
              background: 'white',
              padding: '12px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#667eea' }}>
              {total_concepts || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#868e96', fontWeight: '500' }}>
              Concepts
            </div>
          </div>

          {/* Challenges */}
          <div
            style={{
              background: 'white',
              padding: '12px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#22c55e' }}>
              {total_challenges || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#868e96', fontWeight: '500' }}>
              Challenges
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <Link
          to={`/companies/${slug}`}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: isHovered ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f1f3',
            color: isHovered ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isHovered) {
              e.currentTarget.style.background = '#e9ecef';
            }
          }}
          onMouseLeave={(e) => {
            if (!isHovered) {
              e.currentTarget.style.background = '#f0f1f3';
            }
          }}
        >
          <i className="fas fa-arrow-right" />
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;
