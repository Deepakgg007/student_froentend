import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './ContributionCalendar.css';

const ContributionCalendar = ({ userId }) => {
  const [contributionData, setContributionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    // Generate available years (last 5 years including current)
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    setAvailableYears(years);
  }, []);

  useEffect(() => {
    fetchContributionData();
  }, [userId, selectedYear]);

  const fetchContributionData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/student/profile/${userId}/contributions/?year=${selectedYear}`);
      setContributionData(response.data.contributions || []);
    } catch (error) {
      console.error('Error fetching contribution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContributionLevel = (count) => {
    if (count === 0) return 'level-0';
    if (count <= 2) return 'level-1';
    if (count <= 5) return 'level-2';
    if (count <= 8) return 'level-3';
    return 'level-4';
  };

  const generateCalendarData = () => {
    const weeks = [];

    // For selected year, show from Jan 1 to Dec 31
    const startDate = new Date(selectedYear, 0, 1); // January 1
    const endDate = new Date(selectedYear, 11, 31); // December 31

    // Find the Sunday before or on start date
    const startDay = startDate.getDay();
    const firstSunday = new Date(startDate);
    if (startDay !== 0) {
      firstSunday.setDate(startDate.getDate() - startDay);
    }

    // Create a map for quick lookup of contributions
    const contributionMap = {};
    contributionData.forEach(item => {
      contributionMap[item.date] = item;
    });

    // Generate calendar grid
    let currentDate = new Date(firstSunday);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      const week = [];

      for (let i = 0; i < 7; i++) {
        const dateString = currentDate.toISOString().split('T')[0];
        const contribution = contributionMap[dateString] || { date: dateString, count: 0, details: [] };
        const isFuture = currentDate > today;
        const isOutsideYear = currentDate.getFullYear() !== selectedYear;

        week.push({
          date: dateString,
          count: contribution.count || 0,
          details: contribution.details || [],
          isFuture: isFuture,
          isOutsideYear: isOutsideYear,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(week);
    }

    return weeks;
  };

  const getMonthLabels = (weeks) => {
    const months = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const date = new Date(week[0].date);
      const month = date.getMonth();
      const year = date.getFullYear();

      // Only process if it's the selected year
      if (year === selectedYear && month !== lastMonth) {
        // Check if there's enough space for the label (at least 2 weeks)
        const nextMonthIndex = weeks.findIndex((w, idx) => {
          const wDate = new Date(w[0].date);
          return idx > weekIndex && (wDate.getMonth() !== month || wDate.getFullYear() !== year);
        });

        const weeksInMonth = nextMonthIndex === -1
          ? weeks.length - weekIndex
          : nextMonthIndex - weekIndex;

        if (weeksInMonth >= 2) {
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });

          months.push({
            name: monthName,
            weekIndex: weekIndex,
          });
        }

        lastMonth = month;
      }
    });

    return months;
  };

  const formatTooltipDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleMouseEnter = (day, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setHoveredDay(day);
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  if (loading) {
    return (
      <div className="contribution-calendar-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const weeks = generateCalendarData();
  const months = getMonthLabels(weeks);
  const totalContributions = contributionData.reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <div className="contribution-calendar">
      <div className="contribution-calendar-header">
        <div className="header-left">
          <h5 className="contribution-calendar-title">Coding Activity</h5>
          <span className="contribution-count">
            {totalContributions} challenges solved in {selectedYear}
          </span>
        </div>

        {/* Year Selector */}
        <div className="year-selector">
          <button
            className="year-nav-btn"
            onClick={() => handleYearChange(selectedYear - 1)}
            disabled={selectedYear <= availableYears[availableYears.length - 1]}
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          <select
            className="year-select"
            value={selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button
            className="year-nav-btn"
            onClick={() => handleYearChange(selectedYear + 1)}
            disabled={selectedYear >= availableYears[0]}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="contribution-graph">
        <div className="graph-wrapper">
          {/* Month labels */}
          <div className="month-labels-row">
            <div className="day-label-spacer"></div>
            <div className="month-labels-container">
              {months.map((month, index) => (
                <div
                  key={index}
                  className="month-label"
                  style={{
                    gridColumnStart: month.weekIndex + 1,
                    gridColumnEnd: month.weekIndex + 2
                  }}
                >
                  {month.name}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar grid */}
          <div className="calendar-container">
            {/* Day labels */}
            <div className="day-labels">
              <div className="day-label">Mon</div>
              <div className="day-label">Wed</div>
              <div className="day-label">Fri</div>
            </div>

            {/* Weeks grid */}
            <div className="weeks-grid">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="week-column">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`day ${getContributionLevel(day.count)} ${
                        day.isFuture || day.isOutsideYear ? 'future-day' : ''
                      }`}
                      onMouseEnter={(e) => !day.isFuture && !day.isOutsideYear && handleMouseEnter(day, e)}
                      onMouseLeave={handleMouseLeave}
                      data-date={day.date}
                      data-count={day.count}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="legend">
          <span className="legend-label">Less</span>
          <div className="day level-0" />
          <div className="day level-1" />
          <div className="day level-2" />
          <div className="day level-3" />
          <div className="day level-4" />
          <span className="legend-label">More</span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && !hoveredDay.isFuture && !hoveredDay.isOutsideYear && (
        <div
          className="contribution-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="tooltip-content">
            <strong>
              {hoveredDay.count} {hoveredDay.count === 1 ? 'challenge' : 'challenges'}
            </strong>
            <div className="tooltip-date">{formatTooltipDate(hoveredDay.date)}</div>
            {hoveredDay.details && hoveredDay.details.length > 0 && (
              <div className="tooltip-details">
                {hoveredDay.details.map((detail, index) => (
                  <div key={index} className="detail-item">
                    <span className={`difficulty-badge ${detail.difficulty?.toLowerCase()}`}>
                      {detail.difficulty}
                    </span>
                    <span className="challenge-title">{detail.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributionCalendar;
