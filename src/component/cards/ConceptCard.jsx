// ConceptCard Component
// Displays a single concept card with challenges, difficulty, and progress

import React from 'react';
import { Link } from 'react-router-dom';
import { getDifficultyColor } from '../../services/api';

const ConceptCard = ({ concept, companySlug, showProgress = false, userProgress = null }) => {
  const {
    id,
    slug,
    name,
    description,
    difficulty_level,
    estimated_time_minutes,
    challenge_count,
    max_score,
  } = concept;

  // Calculate progress percentage if user has started
  const getProgressPercentage = () => {
    if (!userProgress) return 0;
    return userProgress.completion_percentage || 0;
  };

  const progressPercentage = getProgressPercentage();
  const difficultyColor = getDifficultyColor(difficulty_level);

  return (
    <div className="card concept-card mb-4 shadow-sm">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-md-8">
            {/* Concept Title and Difficulty */}
            <div className="d-flex align-items-center mb-2">
              <h4 className="mb-0 me-3">{name}</h4>
              <span className={`badge bg-${difficultyColor} difficulty-badge`}>
                {difficulty_level}
              </span>
            </div>

            {/* Description */}
            {description && (
              <p className="text-muted mb-3">{description}</p>
            )}

            {/* Concept Metadata */}
            <div className="concept-meta d-flex flex-wrap gap-3">
              <small className="text-muted">
                <i className="fas fa-code me-1"></i>
                {challenge_count || 0} challenges
              </small>
              <small className="text-muted">
                <i className="fas fa-clock me-1"></i>
                ~{estimated_time_minutes || 0} minutes
              </small>
              <small className="text-muted">
                <i className="fas fa-trophy me-1"></i>
                {max_score || 0} max points
              </small>
            </div>

            {/* Progress Bar (if user has started) */}
            {showProgress && userProgress && (
              <div className="mt-3">
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${progressPercentage}%` }}
                    aria-valuenow={progressPercentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <small className="text-muted mt-1">
                  {userProgress.challenges_completed || 0}/{challenge_count || 0} challenges completed
                  {' '}({progressPercentage.toFixed(0)}%)
                </small>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <Link
              to={`/companies/${companySlug}/concepts/${slug || id}`}
              className="btn btn-primary btn-lg"
            >
              {showProgress && progressPercentage > 0 ? (
                <>
                  <i className="fas fa-play me-2"></i>
                  Continue
                </>
              ) : (
                <>
                  <i className="fas fa-rocket me-2"></i>
                  Start Concept
                </>
              )}
            </Link>

            {userProgress && userProgress.is_completed && (
              <div className="mt-2">
                <span className="badge bg-success">
                  <i className="fas fa-check-circle me-1"></i>
                  Completed
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptCard;
