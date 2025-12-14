import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArticles, getTopArticles } from '../services/api';
import ArticleTile from '../components/ArticleTile';
import Chatbot from '../components/Chatbot';

function Articles({ user }) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    keywords: '',
    sort: 'highest'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
    fetchTopArticles();
  }, [filters]);

  useEffect(() => {
    if (topArticles.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % topArticles.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [topArticles]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await getArticles(filters);
      setArticles(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopArticles = async () => {
    try {
      const data = await getTopArticles();
      setTopArticles(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginBottom: '2rem' }}>Articles</h1>

      {topArticles.length > 0 && (
        <div className="slideshow-container">
          {topArticles.map((article, index) => {
            const API_BASE = process.env.REACT_APP_API_URL 
              ? process.env.REACT_APP_API_URL.replace('/api', '') 
              : 'http://127.0.0.1:5050';
            const coverImageUrl = article.cover_image 
              ? `${API_BASE}${article.cover_image}` 
              : 'https://via.placeholder.com/150x150?text=Article';
            
            return (
              <div 
                key={article.id} 
                className={`slide ${index === currentSlide ? 'active' : ''}`}
                onClick={() => navigate(`/articles/${article.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <img 
                    src={coverImageUrl} 
                    alt={article.title}
                    style={{
                      width: '250px',
                      height: '200px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h2>⭐ Featured Article</h2>
                    <h3>{article.title}</h3>
                    <p>{article.content?.substring(0, 200)}...</p>
                    <div>👍 {article.like_count} likes • 💬 {article.comment_count} comments</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="search-filter-bar">
        <input
          type="text"
          name="search"
          placeholder="Search articles..."
          value={filters.search}
          onChange={handleFilterChange}
          className="search-input"
        />
        <select name="sort" value={filters.sort} onChange={handleFilterChange} className="sort-select">
          <option value="highest">Most Liked</option>
          <option value="lowest">Least Liked</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="article-grid">
          {articles.map(article => (
            <ArticleTile key={article.id} article={article} />
          ))}
        </div>
      )}
      <Chatbot />
    </div>
  );
}

export default Articles;
