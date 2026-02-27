import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiFilter, FiStar, FiShoppingCart, FiCheck, FiShield, FiTag, FiCreditCard } from 'react-icons/fi';
import './ProductList.css';

const CATEGORIES = ['', 'motors', 'semiconductors', 'defence', 'electronics', 'mechanical', 'automation', 'hydraulics', 'sensors', 'other'];
const CAT_ICONS = { motors:'⚙️', semiconductors:'💡', defence:'🛡️', electronics:'🔌', mechanical:'🔩', automation:'🤖', hydraulics:'💧', sensors:'📡', other:'📦' };

const LOAN_BANKS = [
  { id:'nordea', name:'Nordea Bank', rate:4.5, flag:'🇫🇮' },
  { id:'s_bank', name:'S-Bank', rate:5.2, flag:'🇫🇮' },
  { id:'deutsche_bank', name:'Deutsche Bank', rate:3.9, flag:'🇩🇪' },
];

function LoanModal({ product, onClose }) {
  const [bank, setBank] = useState('nordea');
  const [term, setTerm] = useState(12);
  const [result, setResult] = useState(null);
  const amount = product.discountPrice && product.isOnSale ? product.discountPrice : product.price;

  const calc = () => {
    const b = LOAN_BANKS.find(b => b.id === bank);
    const P = amount, r = b.rate/100/12, n = Number(term);
    const emi = Math.ceil(P * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1));
    setResult({ emi, total: emi*n, interest: emi*n - P, bank: b.name, rate: b.rate });
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:16,padding:28,maxWidth:480,width:'100%',boxShadow:'0 24px 80px rgba(0,0,0,0.5)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h3 style={{fontFamily:'Syne',fontSize:17,margin:0}}>🏦 Finance This Product</h3>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'var(--text-3)'}}>×</button>
        </div>
        <div style={{background:'rgba(245,166,35,0.08)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:10,padding:14,marginBottom:20}}>
          <div style={{fontSize:13,color:'var(--text-2)',marginBottom:4}}>{product.name}</div>
          <div style={{fontSize:24,fontWeight:800,color:'var(--accent)'}}>€{amount?.toLocaleString()}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <label style={{fontSize:11,color:'var(--text-3)',display:'block',marginBottom:6,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>Bank</label>
            <select className="input" value={bank} onChange={e=>setBank(e.target.value)}>
              {LOAN_BANKS.map(b=><option key={b.id} value={b.id}>{b.flag} {b.name} — {b.rate}% p.a.</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--text-3)',display:'block',marginBottom:6,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>Loan Term</label>
            <select className="input" value={term} onChange={e=>setTerm(e.target.value)}>
              {[6,12,18,24,36,48,60].map(t=><option key={t} value={t}>{t} months</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-accent" style={{width:'100%',marginBottom:16,justifyContent:'center'}} onClick={calc}>Calculate EMI</button>
        {result && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
            {[['Monthly EMI',`€${result.emi}`,'var(--green)'],['Total Cost',`€${result.total}`,'var(--text)'],['Interest',`€${result.interest}`,'var(--accent)']].map(([l,v,c])=>(
              <div key={l} style={{textAlign:'center',padding:12,background:'var(--surface-2)',borderRadius:10,border:'1px solid var(--border)'}}>
                <div style={{fontSize:10,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>{l}</div>
                <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{fontSize:11,color:'var(--text-3)',textAlign:'center'}}>
          Contact your bank to apply · Nordea: nordea.com · S-Bank: s-bank.fi · Deutsche Bank: db.com
        </div>
      </div>
    </div>
  );
}

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
  const [loanProduct, setLoanProduct] = useState(null);

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

  const displayPrice = (p) => p.isOnSale && p.discountPrice ? p.discountPrice : p.price;

  return (
    <div style={{ maxWidth: 1240 }}>
      <div className="page-header flex-between">
        <div><h1>Marketplace</h1><p>{total.toLocaleString()} industrial products — All prices in EUR</p></div>
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
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search products, certifications, origin…" value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setPage(1), fetchProducts())} />
        </div>
        <select className="input" style={{ width: 200 }} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
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
          {products.map((p, i) => {
            const price = displayPrice(p);
            const onSale = p.isOnSale && p.discountPrice;
            const loanEligible = price >= 500;
            return (
              <div key={p._id} className={'product-card card card-hover anim-fade-up d' + ((i % 4) + 1)}>
                <Link to={'/products/' + p._id}>
                  <div className="pc-image">
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} /> : <div className="pc-placeholder">{CAT_ICONS[p.category] || '📦'}</div>}
                    <div className="pc-badges">
                      <span className="badge badge-gray" style={{ fontSize: 9 }}>{p.category}</span>
                      {p.ceCertified && <span className="badge badge-blue" style={{ fontSize: 9 }}>CE</span>}
                      {p.isoCertification && <span className="badge badge-green" style={{ fontSize: 9 }}>ISO</span>}
                      {p.msdsCertified && <span className="badge badge-purple" style={{ fontSize: 9 }}>MSDS</span>}
                      {onSale && <span className="badge badge-red" style={{ fontSize: 9 }}>SALE {p.discountPercent}% OFF</span>}
                      {p.supplier?.supplierInfo?.verified && <span className="badge badge-green" style={{ fontSize: 9 }}>✓ Verified</span>}
                    </div>
                    {p.countryOfOrigin && (
                      <div style={{ position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,0.6)', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:4 }}>
                        🏭 {p.countryOfOrigin}
                      </div>
                    )}
                  </div>
                  <div className="pc-body">
                    <div className="pc-supplier">{p.supplier?.company || p.supplier?.name}</div>
                    <div className="pc-name">{p.name}</div>
                    <div className="pc-meta">
                      <div>
                        {onSale && <div style={{ fontSize:11, color:'var(--text-3)', textDecoration:'line-through', lineHeight:1 }}>€{p.price?.toLocaleString()}</div>}
                        <div className="pc-price" style={{ color: onSale ? '#ef4444' : 'var(--accent)' }}>
                          €{price?.toLocaleString()}<span>/{p.unit}</span>
                        </div>
                      </div>
                      {p.rating > 0 && <div className="pc-rating"><FiStar />{p.rating?.toFixed(1)}</div>}
                    </div>
                    {onSale && p.discountValidUntil && (
                      <div style={{ fontSize:10, color:'#ef4444', fontWeight:700, marginBottom:4 }}>
                        <FiTag style={{marginRight:3}} />
                        Sale ends {new Date(p.discountValidUntil).toLocaleDateString()}
                      </div>
                    )}
                    <div className="pc-stock">
                      <span style={{ color: p.stock < 10 ? 'var(--red)' : 'var(--text-3)' }}>
                        {p.stock === 0 ? '❌ Out of stock' : p.stock < 10 ? '⚠️ Low stock' : '✓ In stock'}
                      </span>
                      <span>Min: {p.minOrderQty}</span>
                    </div>
                    {/* Warranty + certifications row */}
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:6 }}>
                      {p.warrantyMonths > 0 && <span style={{ fontSize:9, background:'rgba(0,212,255,0.1)', color:'var(--cyan)', padding:'2px 5px', borderRadius:4, fontWeight:700 }}>🔧 {p.warrantyMonths}m warranty</span>}
                      {loanEligible && <span style={{ fontSize:9, background:'rgba(245,166,35,0.1)', color:'var(--accent)', padding:'2px 5px', borderRadius:4, fontWeight:700 }}>🏦 EMI available</span>}
                    </div>
                  </div>
                </Link>
                <div className="pc-footer" style={{ display:'flex', gap:6 }}>
                  <button className={'btn ' + (addedMap[p._id] ? 'btn-success' : 'btn-primary')} style={{ flex:1 }}
                    onClick={() => addToCart(p)} disabled={p.stock === 0}>
                    {addedMap[p._id] ? <><FiCheck /> Added!</> : <><FiShoppingCart /> Add to Cart</>}
                  </button>
                  {loanEligible && (
                    <button className="btn btn-secondary btn-sm" title="Finance / EMI options" onClick={() => setLoanProduct(p)}>
                      <FiCreditCard />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && total > 12 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: 'var(--text-2)', alignSelf: 'center' }}>Page {page} of {Math.ceil(total / 12)}</span>
          <button className="btn btn-secondary btn-sm" disabled={products.length < 12} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {loanProduct && <LoanModal product={loanProduct} onClose={() => setLoanProduct(null)} />}
    </div>
  );
}
