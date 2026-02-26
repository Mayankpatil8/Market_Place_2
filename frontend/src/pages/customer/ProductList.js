import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiFilter, FiStar, FiShoppingCart, FiCheck } from 'react-icons/fi';
import './ProductList.css';

const CATEGORIES = ['', 'motors', 'semiconductors', 'defence', 'electronics', 'mechanical', 'other'];
const CAT_ICONS = { motors: '⚙️', semiconductors: '💡', defence: '🛡️', electronics: '🔌', mechanical: '🔩', other: '📦' };

export default function ProductList() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [addedMap, setAddedMap] = useState({});

  const fetchProducts = () => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit: 12 });
    if (search) q.append('search', search);
    if (category) q.append('category', category);
    if (sort) q.append('sort', sort);
    API.get('/products?' + q).then(({ data }) => {
      setProducts(data.products); setTotal(data.total); setLoading(false);
      if (search && user) API.post('/suggestions/track-search', { query: search }).catch(() => {});
    });
  };

  useEffect(() => { fetchProducts(); }, [page, category, sort]);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const ex = cart.find(i => i._id === product._id);
    const updated = ex ? cart.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { ...product, qty: 1 }];
    localStorage.setItem('cart', JSON.stringify(updated));
    if (user) API.post('/suggestions/track-view', { productId: product._id }).catch(() => {});
    setAddedMap(m => ({ ...m, [product._id]: true }));
    setTimeout(() => setAddedMap(m => ({ ...m, [product._id]: false })), 2200);
  };

  return (
    <div style={{ maxWidth: 1240 }}>
      <div className="page-header flex-between">
        <div><h1>Marketplace</h1><p>{total.toLocaleString()} industrial products</p></div>
        {user && <Link to="/cart" className="btn btn-secondary"><FiShoppingCart /> Cart</Link>}
      </div>

      <div className="cat-pills">
        {CATEGORIES.map(c => (
          <button key={c} className={'cat-pill' + (category === c ? ' cat-pill-active' : '')} onClick={() => { setCategory(c); setPage(1); }}>
            {c ? <>{CAT_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</> : '🔍 All Products'}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1 }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 15, pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search products…" value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setPage(1), fetchProducts())} />
        </div>
        <select className="input" style={{ width: 190 }} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
          <option value="">Sort: Latest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
        <button className="btn btn-primary" onClick={() => { setPage(1); fetchProducts(); }}><FiFilter /> Filter</button>
      </div>

      {loading ? (
        <div className="product-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 180, borderRadius: '11px 11px 0 0' }} />
              <div style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 14, marginBottom: 8, width: '75%', borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '55%', borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No products found</h3>
          <p>Try a different search or category</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p, i) => (
            <div key={p._id} className={'product-card card card-hover anim-fade-up d' + ((i % 4) + 1)}>
              <Link to={'/products/' + p._id}>
                <div className="pc-image">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} /> : <div className="pc-placeholder">{CAT_ICONS[p.category] || '📦'}</div>}
                  <div className="pc-badges">
                    <span className="badge badge-gray" style={{ fontSize: 9 }}>{p.category}</span>
                    {p.isRestricted && <span className="badge badge-red" style={{ fontSize: 9 }}>🛡️</span>}
                    {p.supplier?.supplierInfo?.verified && <span className="badge badge-green" style={{ fontSize: 9 }}>✓</span>}
                  </div>
                </div>
                <div className="pc-body">
                  <div className="pc-supplier">{p.supplier?.company || p.supplier?.name}</div>
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-meta">
                    <div className="pc-price">₹{p.price?.toLocaleString()}<span>/{p.unit}</span></div>
                    {p.rating > 0 && <div className="pc-rating"><FiStar />{p.rating?.toFixed(1)}</div>}
                  </div>
                  <div className="pc-stock">
                    <span style={{ color: p.stock < 10 ? 'var(--red)' : 'var(--text-3)' }}>
                      {p.stock === 0 ? '❌ Out of stock' : p.stock < 10 ? '⚠️ Low stock' : '✓ In stock'}
                    </span>
                    <span>Min: {p.minOrderQty}</span>
                  </div>
                </div>
              </Link>
              <div className="pc-footer">
                <button className={'btn ' + (addedMap[p._id] ? 'btn-success' : 'btn-primary')} style={{ width: '100%' }}
                  onClick={() => addToCart(p)} disabled={p.stock === 0}>
                  {addedMap[p._id] ? <><FiCheck /> Added!</> : <><FiShoppingCart /> Add to Cart</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && total > 12 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: 'var(--text-2)', alignSelf: 'center' }}>Page {page} of {Math.ceil(total / 12)}</span>
          <button className="btn btn-secondary btn-sm" disabled={products.length < 12} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
