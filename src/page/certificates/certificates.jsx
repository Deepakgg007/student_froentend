// edukon/src/page/certificates/certificates.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserCertificates from '../../component/certification/UserCertificates';
import api, { API_BASE_URL } from '../../services/api';
import { useSmoothData } from '../../hooks/useSmoothData';
import './certificates.css';

const Certificates = () => {
  const { collegeSlug } = useParams();
  const navigate = useNavigate();

  // Fetch profile with smooth transition (no flash)
  const { data: profile, loading, error } = useSmoothData(
    async () => {
      const profileRes = await api.get(`/student/profile/me/`);
      const profileData = profileRes.data;
      return { data: profileData };
    },
    []
  );

  // Show skeleton while loading instead of spinner
  if (loading) {
    return (
      <>
        <div className="certificates-page">
          {/* Header Skeleton */}
          <div className="certificates-header">
            <div className="certificates-header-content">
              <div className="certificates-avatar-section">
                <div className="skeleton-circle" style={{ width: '80px', height: '80px' }}></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton-line" style={{ width: '200px', height: '28px', marginBottom: '8px' }}></div>
                  <div className="skeleton-line" style={{ width: '300px', height: '18px' }}></div>
                </div>
              </div>
            </div>
          </div>
          {/* Nav Skeleton */}
          <div className="certificates-nav">
            <div className="skeleton-line" style={{ width: '150px', height: '40px', borderRadius: '8px' }}></div>
          </div>
          {/* Content Skeleton */}
          <div className="certificates-content">
            <div className="skeleton-line" style={{ width: '100%', height: '60px', borderRadius: '10px', marginBottom: '20px' }}></div>
            <div className="skeleton-line" style={{ width: '100%', height: '200px', borderRadius: '10px' }}></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <div className="certificates-error">
          <h2>Profile not found</h2>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="certificates-page">
        {/* Header Section */}
        <div className="certificates-header">
          <div className="certificates-header-content">
            <div className="certificates-avatar-section">
              {profile.user.profile_picture ? (
                <img src={profile.user.profile_picture} alt={profile.user.username} className="certificates-avatar" />
              ) : (
                <div className="certificates-avatar-placeholder">
                  {profile.user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="certificates-header-info">
                <h1 className="certificates-title">My Certificates</h1>
                <p className="certificates-subtitle">
                  <i className="fas fa-user"></i> {profile.user.first_name} {profile.user.last_name}
                </p>
                <p className="certificates-college">
                  <i className="fas fa-university"></i> {profile.user.college_name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Profile Button */}
        <div className="certificates-nav">
          <Link
            to={collegeSlug ? `/${collegeSlug}/profile` : '/profile'}
            className="btn-back"
          >
            <i className="fas fa-arrow-left"></i> Back to Profile
          </Link>
        </div>

        {/* Certificates Content */}
        <div className="certificates-content">

          <UserCertificates collegeSlug={collegeSlug} />
        </div>
      </div>
    </>
  );
};

export default Certificates;
