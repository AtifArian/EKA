// Activity Tab Content Component for MyProfile
// This is a helper to generate the Activity tab UI with charts

export const ActivityTabContent = ({ activityData }) => {
  if (!activityData) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading activity data...</p>
      </div>
    );
  }

  const { summary, mood_timeline, journal_list, articles_read_list, articles_liked_list, 
          mood_timeline: moodData, journal_timeline, articles_read_timeline, 
          articles_liked_timeline, article_comments_timeline } = activityData;

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

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '1.5rem',
          borderRadius: '15px',
          color: 'white',
          boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)'
        }}>
          <h3 style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Journal Entries</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{summary.total_journals}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '1.5rem',
          borderRadius: '15px',
          color: 'white',
          boxShadow: '0 8px 20px rgba(79, 172, 254, 0.3)'
        }}>
          <h3 style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Articles Read</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{summary.total_articles_read}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          padding: '1.5rem',
          borderRadius: '15px',
          color: 'white',
          boxShadow: '0 8px 20px rgba(250, 112, 154, 0.3)'
        }}>
          <h3 style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Articles Liked</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{summary.total_articles_liked}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          padding: '1.5rem',
          borderRadius: '15px',
          color: '#1f2937',
          boxShadow: '0 8px 20px rgba(168, 237, 234, 0.3)'
        }}>
          <h3 style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Comments</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{summary.total_article_comments}</div>
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
