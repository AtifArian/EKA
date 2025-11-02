import React, { useState, useEffect } from 'react';
import { getArticles } from '../services/api';
import ArticleTile from '../components/ArticleTile';

function Articles({ user }) {
  const [articles, setArticles] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    keywords: '',
    sort: 'highest'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [filters]);

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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginBottom: '2rem' }}>Articles</h1>
      
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
    </div>
  );
}

export default Articles;
