import React, { useState, useEffect } from 'react';
import { getArticles, getTopArticles } from '../services/api';
import ArticleTile from '../components/ArticleTile';
import Chatbot from '../components/Chatbot';

function Articles({ user }) {
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
          {topArticles.map((article, index) => (
            <div key={article.id} className={`slide ${index === currentSlide ? 'active' : ''}`}>
              <h2>⭐ Featured Article</h2>
              <h3>{article.title}</h3>
              <p>{article.content?.substring(0, 200)}...</p>
              <div>👍 {article.like_count} likes • 💬 {article.comment_count} comments</div>
            </div>
          ))}
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
