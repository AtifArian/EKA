// Activity Tab Content Component for MyProfile
// This is a helper to generate the Activity tab UI with charts

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ActivityTabContent = ({ activityData, onRefresh }) => {
  const navigate = useNavigate();
  const [showDetailView, setShowDetailView] = useState(null); // 'journals', 'articles_read', 'articles_liked', 'comments'

  if (!activityData) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading activity data...</p>
      </div>
    );
  }

  const { summary, mood_timeline, journal_list, articles_read_list, articles_liked_list, 
          journal_timeline, articles_read_timeline, 
          articles_liked_timeline, article_comments_timeline, article_comments_list, 
          period_type = 'days', time_period = '30' } = activityData;

  // Use mood_timeline as moodData
  const moodData = mood_timeline;

  // Enhanced User-Friendly Line Chart Component with Tooltips and Labels
  const LineChart = ({ data, label, color, yAxisLabel, isMoodChart = false, isYearView = false }) => {
    const [hoveredPoint, setHoveredPoint] = React.useState(null);
    
    if (!data || data.length === 0) {
      return (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '2rem', 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '10px',
          color: '#6b7280'
        }}>
          <p>No data available for this period</p>
        </div>
      );
    }
    
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const minValue = Math.min(...data.map(d => d.value), 0);
    const width = 760;
    const height = 300;
    const paddingLeft = 60;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 70;  // Increased for rotated labels
    
    // Calculate realistic Y-axis scale with proper bounds
    let yAxisMin, yAxisMax, yAxisSteps;
    if (isMoodChart) {
      yAxisMin = 0;
      yAxisMax = 5;
      yAxisSteps = [0, 1, 2, 3, 4, 5];
    } else {
      // Add 20% padding above and below for realistic bounds
      const range = maxValue - minValue;
      const padding = Math.max(range * 0.2, 1); // At least 1 unit padding
      yAxisMin = Math.max(0, Math.floor(minValue - padding));
      yAxisMax = Math.ceil(maxValue + padding);
      
      // Create 6 evenly spaced steps
      const step = (yAxisMax - yAxisMin) / 5;
      yAxisSteps = Array.from({length: 6}, (_, i) => Math.round(yAxisMin + (step * i)));
    }
    
    const points = data.map((d, i) => {
      const x = paddingLeft + (i / (data.length - 1 || 1)) * (width - paddingLeft - paddingRight);
      const y = height - paddingBottom - ((d.value - yAxisMin) / (yAxisMax - yAxisMin)) * (height - paddingTop - paddingBottom);
      return `${x},${y}`;
    }).join(' ');
    
    // Format day/month label for display
    const formatLabel = (index, totalPoints, dataPoint) => {
      if (dataPoint.month) {
        // For year view or all time, show month labels (e.g., "January" or "Jan 2024")
        return dataPoint.month;
      } else {
        // For days view, show day numbers
        return `Day ${index + 1}`;
      }
    };
    
    // Get mood emoji and label
    const getMoodInfo = (value) => {
      if (value >= 4.5) return { emoji: '😄', label: 'Great' };
      if (value >= 3.5) return { emoji: '🙂', label: 'Good' };
      if (value >= 2.5) return { emoji: '😐', label: 'Okay' };
      if (value >= 1.5) return { emoji: '😟', label: 'Low' };
      return { emoji: '😢', label: 'Very Low' };
    };
    
    return (
      <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
        <h4 style={{ 
          marginBottom: '1rem', 
          color: '#1f2937', 
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}>
          {label}
        </h4>
        
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <svg 
            width={width} 
            height={height} 
            style={{ 
              background: '#f8f9ff', 
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(68, 77, 136, 0.12)',
              border: '1px solid rgba(107,125,184,0.18)'
            }}
          >
            {/* Grid lines */}
            {yAxisSteps.map((step, i) => {
              const y = height - paddingBottom - ((step - yAxisMin) / (yAxisMax - yAxisMin)) * (height - paddingTop - paddingBottom);
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  {/* Y-axis labels */}
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#6b7280"
                    fontWeight="500"
                  >
                    {isMoodChart && step > 0 ? `${step} ${getMoodInfo(step).emoji}` : step}
                  </text>
                </g>
              );
            })}
            
            {/* X-axis line */}
            <line
              x1={paddingLeft}
              y1={height - paddingBottom}
              x2={width - paddingRight}
              y2={height - paddingBottom}
              stroke="#9ca3af"
              strokeWidth="2"
            />
            
            {/* Y-axis line */}
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={paddingLeft}
              y2={height - paddingBottom}
              stroke="#9ca3af"
              strokeWidth="2"
            />
            
            {/* Area fill under the line */}
            <polygon
              points={`${paddingLeft},${height - paddingBottom} ${points} ${width - paddingRight},${height - paddingBottom}`}
              fill={color}
              opacity="0.1"
            />
            
            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points with interactivity */}
            {data.map((d, i) => {
              const x = paddingLeft + (i / (data.length - 1 || 1)) * (width - paddingLeft - paddingRight);
              const y = height - paddingBottom - ((d.value - yAxisMin) / (yAxisMax - yAxisMin)) * (height - paddingTop - paddingBottom);
              const isHovered = hoveredPoint === i;
              
              return (
                <g key={i}>
                  {/* Larger invisible hit area for better hover */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="12" 
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Visible point */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isHovered ? "6" : "5"} 
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      filter: isHovered ? 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' : 'none'
                    }}
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  
                  {/* Show mood emoji on data point for mood charts in year/all-time views */}
                  {isMoodChart && isYearView && d.value > 0 && (
                    <text
                      x={x}
                      y={y - 15}
                      textAnchor="middle"
                      fontSize="16"
                      style={{ pointerEvents: 'none' }}
                    >
                      {getMoodInfo(d.value).emoji}
                    </text>
                  )}
                  
                  {/* X-axis labels - show ALL for year/all-time views */}
                  <text
                    x={x}
                    y={height - paddingBottom + 25}
                    textAnchor="end"
                    fontSize="9"
                    fill="#374151"
                    fontWeight="600"
                    transform={`rotate(-45, ${x}, ${height - paddingBottom + 25})`}
                  >
                    {d.month || `Day ${i + 1}`}
                  </text>
                  
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={x - 55}
                        y={y - 60}
                        width="110"
                        height={isMoodChart ? "52" : "44"}
                        fill="white"
                        stroke={color}
                        strokeWidth="2"
                        rx="8"
                        style={{
                          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                        }}
                      />
                      <text
                        x={x}
                        y={y - 38}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#6b7280"
                        fontWeight="600"
                      >
                        {formatLabel(i, data.length, d)}
                      </text>
                      <text
                        x={x}
                        y={y - 22}
                        textAnchor="middle"
                        fontSize="16"
                        fill={color}
                        fontWeight="bold"
                      >
                        {isMoodChart ? `${d.value.toFixed(1)} ${getMoodInfo(d.value).emoji}` : d.value}
                      </text>
                      {isMoodChart && (
                        <text
                          x={x}
                          y={y - 8}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#6b7280"
                        >
                          {getMoodInfo(d.value).label}
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })}
            
            {/* Y-axis label */}
            <text
              x={-height / 2}
              y={20}
              textAnchor="middle"
              fontSize="13"
              fill="#374151"
              fontWeight="600"
              transform={`rotate(-90)`}
            >
              {yAxisLabel || 'Value'}
            </text>
            
            {/* X-axis label */}
            <text
              x={width / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="13"
              fill="#374151"
              fontWeight="600"
            >
              {isYearView || period_type === 'all' ? 'Months' : `Days (Last ${data.length} Days)`}
            </text>
          </svg>
          
          {/* Legend */}
          <div style={{
            marginTop: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.85rem',
            color: '#6b7280'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '20px',
                height: '3px',
                background: color,
                borderRadius: '2px'
              }}></div>
              <span>{data.length} data points</span>
            </div>
            <div>
              Range: {minValue.toFixed(1)} - {maxValue.toFixed(1)} | Y-axis: {yAxisMin} - {yAxisMax}
            </div>
            {isMoodChart && (
              <div style={{ fontStyle: 'italic' }}>
                💡 Hover over points for details
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Generate date range or months based on period type
  const generateDateRange = (periodType, timePeriod) => {
    if (periodType === 'year') {
      // For year view, generate months with year (e.g., "Jan 2024", "Feb 2024")
      const year = timePeriod; // e.g., "2024" or "2025"
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => `${month} ${year}`);
    } else if (periodType === 'all') {
      // For all time, generate ALL months from earliest data to now
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-11
      
      // Start from earliest year that might have data (2024 or earlier)
      const startYear = 2024;
      const allMonths = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let year = startYear; year <= currentYear; year++) {
        const startMonth = (year === startYear) ? 0 : 0; // Start from January
        const endMonth = (year === currentYear) ? currentMonth : 11; // End at current month or December
        
        for (let month = startMonth; month <= endMonth; month++) {
          allMonths.push(`${monthNames[month]} ${year}`);
        }
      }
      
      return allMonths;
    } else {
      // For days view
      const dates = [];
      const today = new Date();
      const numDays = parseInt(timePeriod) || 30;
      
      for (let i = numDays - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
      }
      
      return dates;
    }
  };

  // Get date range based on period type
  const allDatesOrMonths = generateDateRange(period_type, time_period);

  // Prepare timeline data for charts
  const prepareTimelineData = (timeline) => {
    if (period_type === 'year') {
      // Group by month for year view (with year in label like "Jan 2024")
      const monthCounts = {};
      allDatesOrMonths.forEach(month => {
        monthCounts[month] = 0;
      });
      
      Object.keys(timeline).forEach(date => {
        const dateObj = new Date(date);
        // Format as "MMM YYYY" (Jan 2024, Feb 2024, etc.)
        const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
        const year = dateObj.getFullYear();
        const monthLabel = `${month} ${year}`;
        if (monthCounts[monthLabel] !== undefined) {
          monthCounts[monthLabel] += timeline[date];
        }
      });
      
      return allDatesOrMonths.map(month => ({
        date: month,
        value: monthCounts[month],
        month: month
      }));
    } else if (period_type === 'all') {
      // Group by month for all time view - fill ALL months from 2024 to now
      const monthCounts = {};
      
      // Initialize all months with 0
      allDatesOrMonths.forEach(month => {
        monthCounts[month] = 0;
      });
      
      // Fill in actual data
      Object.keys(timeline).forEach(date => {
        const dateObj = new Date(date);
        const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
        const year = dateObj.getFullYear();
        const monthLabel = `${month} ${year}`;
        if (monthCounts[monthLabel] !== undefined) {
          monthCounts[monthLabel] += timeline[date];
        }
      });
      
      // Return all months in order
      return allDatesOrMonths.map(month => ({
        date: month,
        value: monthCounts[month],
        month: month
      }));
    } else {
      // For days view, fill missing dates with zeros
      return allDatesOrMonths.map(date => ({
        date,
        value: timeline[date] || 0
      }));
    }
  };

  // Prepare mood data
  const prepareMoodTimelineData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const getMonthLabelFromEntry = (entry) => {
      if (!entry) return null;
      if (entry.month) return entry.month; // Backend-supplied label
      if (entry.year_month) {
        const [year, monthNum] = entry.year_month.split('-');
        const monthIndex = parseInt(monthNum, 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${monthNames[monthIndex]} ${year}`;
        }
      }

      const rawDate = entry.created_at || entry.date;
      if (!rawDate) return null;
      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return null;
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${month} ${year}`;
    };

    if (period_type === 'year') {
      // Group mood by month for year view (average mood per month with year in label)
      const monthMoods = {};
      const monthCounts = {};
      
      allDatesOrMonths.forEach(month => {
        monthMoods[month] = 0;
        monthCounts[month] = 0;
      });
      
      moodData?.forEach(m => {
        const monthLabel = getMonthLabelFromEntry(m);
        if (monthMoods[monthLabel] !== undefined) {
          monthMoods[monthLabel] += m.mood_level;
          monthCounts[monthLabel] += 1;
        }
      });
      
      return allDatesOrMonths.map(month => ({
        date: month,
        value: monthCounts[month] > 0 ? monthMoods[month] / monthCounts[month] : 0,
        month: month
      }));
    } else if (period_type === 'all') {
      // Group mood by month for all time view - fill ALL months from 2024 to now
      const monthMoods = {};
      const monthCounts = {};
      
      // Initialize all months with 0
      allDatesOrMonths.forEach(month => {
        monthMoods[month] = 0;
        monthCounts[month] = 0;
      });
      
      // Fill in actual data
      moodData?.forEach(m => {
        const monthLabel = getMonthLabelFromEntry(m);
        if (monthMoods[monthLabel] !== undefined) {
          monthMoods[monthLabel] += m.mood_level;
          monthCounts[monthLabel] += 1;
        }
      });
      
      // Return all months with averages
      return allDatesOrMonths.map(month => ({
        date: month,
        value: monthCounts[month] > 0 ? monthMoods[month] / monthCounts[month] : 0,
        month: month
      }));
    } else {
      // For days view, fill missing dates with zeros
      return allDatesOrMonths.map(date => {
        const moodEntry = moodData?.find(m => m.date === date);
        return {
          date,
          value: moodEntry ? moodEntry.mood_level : 0
        };
      });
    }
  };

  const consistentMoodData = prepareMoodTimelineData();

  const trendsShellStyle = {
    background: 'linear-gradient(180deg, rgba(108,119,197,0.12) 0%, rgba(212,190,198,0.14) 100%)',
    borderRadius: '22px',
    padding: '1.75rem',
    border: '1px solid rgba(255,255,255,0.35)',
    boxShadow: '0 18px 40px rgba(79, 88, 158, 0.18)',
    marginBottom: '2rem',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)'
  };

  const timeButtonBase = {
    padding: '0.6rem 1.05rem',
    borderRadius: '12px',
    border: '1px solid rgba(130, 139, 190, 0.25)',
    background: 'rgba(255,255,255,0.7)',
    color: '#1f2937',
    fontWeight: 700,
    fontSize: '0.92rem',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 10px rgba(56, 68, 126, 0.12)'
  };

  const timeButtonActive = {
    ...timeButtonBase,
    background: 'linear-gradient(135deg, #6779e6 0%, #7e5fd3 100%)',
    color: '#ffffff',
    border: '1px solid #7181e8',
    boxShadow: '0 10px 22px rgba(103, 121, 230, 0.35)'
  };

  // Handle time period change
  const handleTimePeriodChange = (newPeriod) => {
    if (onRefresh) {
      onRefresh(newPeriod);
    }
  };

  return (
    <div>
      {/* Detail View Modal/Section */}
      {showDetailView && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }} onClick={() => setShowDetailView(null)}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '100%'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937' }}>
                {showDetailView === 'journals' && '📝 My Journal Entries'}
                {showDetailView === 'articles_read' && '📰 Articles I\'ve Read'}
                {showDetailView === 'articles_liked' && '❤️ Articles I Liked'}
                {showDetailView === 'comments' && '💬 My Comments'}
              </h2>
              <button 
                onClick={() => setShowDetailView(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Journals Detail View */}
            {showDetailView === 'journals' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {journal_list.length > 0 ? journal_list.map(journal => (
                  <div key={journal.id} style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => navigate(`/journals/${journal.id}`)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{journal.title}</h4>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', opacity: 0.9 }}>
                      <span>📅 {new Date(journal.created_at).toLocaleDateString()}</span>
                      {journal.emotion && (
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '0.2rem 0.8rem',
                          borderRadius: '10px'
                        }}>
                          {journal.emotion}
                        </span>
                      )}
                      {journal.sentiment_score !== null && (
                        <span>😊 Score: {journal.sentiment_score.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                )) : <p style={{ textAlign: 'center', color: '#6b7280' }}>No journal entries yet</p>}
              </div>
            )}

            {/* Articles Read Detail View */}
            {showDetailView === 'articles_read' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {articles_read_list.length > 0 ? articles_read_list.map(read => (
                  <div key={read.id} style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => navigate(`/articles/${read.article_id}`)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                      {read.article_title || `Article #${read.article_id}`}
                    </h4>
                    <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                      📅 Read on {new Date(read.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )) : <p style={{ textAlign: 'center', color: '#6b7280' }}>No articles read yet</p>}
              </div>
            )}

            {/* Articles Liked Detail View */}
            {showDetailView === 'articles_liked' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {articles_liked_list.length > 0 ? articles_liked_list.map(liked => (
                  <div key={liked.id} style={{
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => navigate(`/articles/${liked.article_id}`)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                      {liked.article_title || `Article #${liked.article_id}`}
                    </h4>
                    <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                      ❤️ Liked on {new Date(liked.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )) : <p style={{ textAlign: 'center', color: '#6b7280' }}>No liked articles yet</p>}
              </div>
            )}

            {/* Comments Detail View */}
            {showDetailView === 'comments' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {article_comments_list && article_comments_list.length > 0 ? article_comments_list.map(comment => (
                  <div key={comment.id} style={{
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => navigate(`/articles/${comment.article_id}`)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <p style={{ fontSize: '1rem', marginBottom: '0.8rem', color: '#1f2937', fontWeight: '500' }}>
                      "{comment.content}"
                    </p>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      <span>📰 On: {comment.article_title || `Article #${comment.article_id}`}</span>
                      <br />
                      <span>📅 {new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )) : <p style={{ textAlign: 'center', color: '#6b7280' }}>No comments yet</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
        📊 My Activity Dashboard
      </h2>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1.5rem',
          borderRadius: '15px',
          color: 'white',
          boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
        }}>
          <h3 style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Mood Entries</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{summary.total_mood_entries}</div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Avg: {summary.avg_mood_level.toFixed(1)}/5
          </p>
        </div>

        <div 
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '1.5rem',
            borderRadius: '15px',
            color: 'white',
            boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onClick={() => setShowDetailView('journals')}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(240, 147, 251, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(240, 147, 251, 0.3)';
          }}
        >
          <h3 style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Journal Entries</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{summary.total_journals}</div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>
            👆 Click to view all
          </p>
        </div>

        <div 
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '1.5rem',
            borderRadius: '15px',
            color: 'white',
            boxShadow: '0 8px 20px rgba(79, 172, 254, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onClick={() => setShowDetailView('articles_read')}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(79, 172, 254, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 172, 254, 0.3)';
          }}
        >
          <h3 style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Articles Read</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{summary.total_articles_read}</div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>
            👆 Click to view all
          </p>
        </div>

        <div 
          style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '1.5rem',
            borderRadius: '15px',
            color: 'white',
            boxShadow: '0 8px 20px rgba(250, 112, 154, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onClick={() => setShowDetailView('articles_liked')}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(250, 112, 154, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(250, 112, 154, 0.3)';
          }}
        >
          <h3 style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Articles Liked</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{summary.total_articles_liked}</div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>
            👆 Click to view all
          </p>
        </div>

        <div 
          style={{
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            padding: '1.5rem',
            borderRadius: '15px',
            color: '#1f2937',
            boxShadow: '0 8px 20px rgba(168, 237, 234, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onClick={() => setShowDetailView('comments')}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 237, 234, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(168, 237, 234, 0.3)';
          }}
        >
          <h3 style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Comments</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{summary.total_article_comments}</div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.6 }}>
            👆 Click to view all
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={trendsShellStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            📈 Activity Trends {period_type === 'year' ? `(${time_period})` : 
                              period_type === 'all' ? '(All Time)' : 
                              `(Last ${time_period} Days)`}
          </h3>
          
          {/* Time Period Selector */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }}>
              View:
            </span>
            {[
              { value: '7', label: '7 Days' },
              { value: '15', label: '15 Days' },
              { value: '30', label: '30 Days' },
              { value: '2024', label: '2024' },
              { value: '2025', label: '2025' },
              { value: 'all', label: 'All Time' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleTimePeriodChange(option.value)}
                style={String(time_period) === String(option.value) ? timeButtonActive : timeButtonBase}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <LineChart 
          data={consistentMoodData} 
          label={`Mood Levels Over Time${period_type === 'year' ? ` (${time_period})` : period_type === 'all' ? ' (All Time)' : ` (${time_period} Days)`}`}
          color="#667eea" 
          yAxisLabel="Mood Level (1-5)"
          isMoodChart={true}
          isYearView={period_type === 'year' || period_type === 'all'}
        />
        
        {(Object.keys(journal_timeline).length > 0 || allDatesOrMonths.length > 0) && (
          <LineChart 
            data={prepareTimelineData(journal_timeline)} 
            label={`Journal Entries${period_type === 'year' || period_type === 'all' ? ' Per Month' : ' Per Day'}${period_type === 'year' ? ` (${time_period})` : period_type === 'all' ? ' (All Time)' : ` (${time_period} Days)`}`}
            color="#f093fb" 
            yAxisLabel="Number of Entries"
            isYearView={period_type === 'year' || period_type === 'all'}
          />
        )}
        
        {(Object.keys(articles_read_timeline).length > 0 || allDatesOrMonths.length > 0) && (
          <LineChart 
            data={prepareTimelineData(articles_read_timeline)} 
            label={`Articles Read${period_type === 'year' || period_type === 'all' ? ' Per Month' : ' Per Day'}${period_type === 'year' ? ` (${time_period})` : period_type === 'all' ? ' (All Time)' : ` (${time_period} Days)`}`}
            color="#4facfe" 
            yAxisLabel="Number of Articles"
            isYearView={period_type === 'year' || period_type === 'all'}
          />
        )}
      </div>

      {/* Recent Journal Entries */}
      {journal_list.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '1.5rem',
          borderRadius: '15px',
          marginBottom: '2rem',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 'bold', color: '#1f2937' }}>
            📝 Recent Journal Entries
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {journal_list.slice(0, 5).map(journal => (
              <div key={journal.id} style={{
                background: 'rgba(255, 255, 255, 0.35)',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <h4 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>{journal.title}</h4>
                <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.85rem' }}>
                  <span>{new Date(journal.created_at).toLocaleDateString()}</span>
                  {journal.emotion && (
                    <span style={{
                      background: journal.emotion.includes('sad') ? '#fca5a5' : 
                                 journal.emotion.includes('Happy') ? '#86efac' : '#d1d5db',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '10px',
                      color: '#1f2937'
                    }}>
                      {journal.emotion}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Articles Read */}
      {articles_read_list.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '1.5rem',
          borderRadius: '15px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 'bold', color: '#1f2937' }}>
            📰 Recently Read Articles
          </h3>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {articles_read_list.slice(0, 10).map(read => (
              <div key={read.id} style={{
                background: 'rgba(255, 255, 255, 0.35)',
                padding: '0.8rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>
                  {read.article_title || `Article #${read.article_id}`}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {new Date(read.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
