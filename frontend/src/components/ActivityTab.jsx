// Activity Tab Content Component for MyProfile
// This is a helper to generate the Activity tab UI with charts

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ActivityTabContent = ({ activityData }) => {
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
          mood_timeline: moodData, journal_timeline, articles_read_timeline, 
          articles_liked_timeline, article_comments_timeline, article_comments_list } = activityData;

  // Simple Line Chart Component
  const LineChart = ({ data, label, color }) => {
    if (!data || data.length === 0) return <p>No data available</p>;
    
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const width = 600;
    const height = 200;
    const padding = 40;
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
      const y = height - padding - (d.value / maxValue) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#1f2937' }}>{label}</h4>
        <svg width={width} height={height} style={{ background: 'rgba(255, 255, 255, 0.5)', borderRadius: '10px' }}>
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="3"
          />
          {data.map((d, i) => {
            const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
            const y = height - padding - (d.value / maxValue) * (height - 2 * padding);
            return <circle key={i} cx={x} cy={y} r="4" fill={color} />;
          })}
        </svg>
      </div>
    );
  };

  // Prepare mood chart data
  const moodChartData = moodData?.map(m => ({
    date: m.date,
    value: m.mood_level
  })) || [];

  // Prepare timeline data for charts
  const prepareTimelineData = (timeline) => {
    const dates = Object.keys(timeline).sort();
    return dates.map(date => ({
      date,
      value: timeline[date]
    }));
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
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
          📈 Activity Trends (Last 30 Days)
        </h3>
        
        {moodChartData.length > 0 && (
          <LineChart 
            data={moodChartData} 
            label="Mood Levels Over Time" 
            color="#667eea" 
          />
        )}
        
        {Object.keys(journal_timeline).length > 0 && (
          <LineChart 
            data={prepareTimelineData(journal_timeline)} 
            label="Journal Entries Per Day" 
            color="#f093fb" 
          />
        )}
        
        {Object.keys(articles_read_timeline).length > 0 && (
          <LineChart 
            data={prepareTimelineData(articles_read_timeline)} 
            label="Articles Read Per Day" 
            color="#4facfe" 
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
