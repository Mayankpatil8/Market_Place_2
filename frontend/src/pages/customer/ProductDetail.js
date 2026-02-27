import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiShoppingCart, FiCheck, FiShield, FiStar, FiArrowLeft, FiCreditCard, FiPackage, FiGlobe, FiAlertCircle } from 'react-icons/fi';

const LOAN_BANKS = [
  { id:'nordea', name:'Nordea Bank', rate:4.5, flag:'🇫🇮', url:'https://www.nordea.com' },
  { id:'s_bank', name:'S-Bank', rate:5.2, flag:'🇫🇮', url:'https://www.s-bank.fi' },
  { id:'deutsche_bank', name:'Deutsche Bank', rate:3.9, flag:'🇩🇪', url:'https://www.db.com' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [loanBank, setLoanBank] = useState('nordea');
  const [loanTerm, setLoanTerm] = useState(12);
  const [emiResult, setEmiResult] = useState(null);
  const [activeTab, setActiveTab] = useState('specs');

  useEffect(() => {
    setLoading(true);
    API.get('/products/' + id).then(({ data }) => {
      setProduct(data.product);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const ex = cart.find(i => i._id === product._id);
    const updated = ex ? cart.map(i => i._id === product._id ? { ...i, qty: i.qty + qty } : i) : [...cart, { ...product, qty }];
    localStorage.setItem('cart', JSON.stringify(updated));
    if (user) API.post('/suggestions/track-view', { productId: product._id }).catch(() => {});
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const calcEmi = () => {
    const price = product.isOnSale && product.discountPrice ? product.discountPrice : product.price;
    const b = LOAN_BANKS.find(b => b.id === loanBank);
    const P = price * qty, r = b.rate/100/12, n = Number(loanTerm);
    const emi = Math.ceil(P * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1));
    setEmiResult({ emi, total: emi*n, interest: emi*n - P, bankName: b.name, principal: P });
  };

  if (loading) return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 24 }}>
        <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
        <div>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 18, marginBottom: 16, borderRadius: 8, width: `${[85, 60, 40, 70, 50][i]}%` }} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="empty-state"><FiAlertCircle style={{ fontSize: 48 }} /><h3>Product not found</h3><Link to="/products" className="btn btn-accent">Back to Marketplace</Link></div>
  );

  const price = product.isOnSale && product.discountPrice ? product.discountPrice : product.price;
  const loanEligible = price >= 500;
  const specMap = product.specifications ? Object.fromEntries(product.specifications) : {};

  return (
    <div style={{ maxWidth: 1100 }}>
      <Link to="/products" className="btn btn-secondary btn-sm" style={{ marginBottom: 20, display: 'inline-flex' }}>
        <FiArrowLeft /> Back to Marketplace
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
        {/* Image */}
        <div>
          <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--border)', height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ fontSize: 80 }}>{{ motors:'⚙️', semiconductors:'💡', defence:'🛡️', electronics:'🔌', mechanical:'🔩', hydraulics:'💧', automation:'🤖', sensors:'📡' }[product.category] || '📦'}</div>}
          </div>
          {/* Compliance badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {product.ceCertified && <span className="badge badge-blue" style={{ padding: '6px 12px', fontSize: 12 }}>✓ CE Certified</span>}
            {product.isoCertification && <span className="badge badge-green" style={{ padding: '6px 12px', fontSize: 12 }}>✓ {product.isoCertification}</span>}
            {product.msdsCertified && <span className="badge badge-purple" style={{ padding: '6px 12px', fontSize: 12 }}>✓ MSDS Available</span>}
            {(product.certifications || []).filter(c => c !== 'CE').map(c => (
              <span key={c} className="badge badge-gray" style={{ padding: '6px 12px', fontSize: 12 }}>✓ {c}</span>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          {/* Category + origin */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-gray">{product.category}</span>
            {product.countryOfOrigin && <span style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}><FiGlobe style={{ fontSize: 11 }} />Made in {product.countryOfOrigin}</span>}
            {product.supplier?.supplierInfo?.verified && <span className="badge badge-green" style={{ fontSize: 11 }}>✓ Verified Manufacturer</span>}
          </div>

          <h1 style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>{product.name}</h1>

          <div style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 4 }}>
            by <strong>{product.supplier?.company || product.supplier?.name}</strong>
            {product.supplier?.phone && <span style={{ color: 'var(--text-3)' }}> · {product.supplier.phone}</span>}
          </div>

          {product.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, color: 'var(--accent)', fontWeight: 700 }}>
              <FiStar /> {product.rating?.toFixed(1)} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({product.reviewCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div style={{ marginBottom: 16 }}>
            {product.isOnSale && product.discountPrice && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, color: 'var(--text-3)', textDecoration: 'line-through' }}>€{product.price?.toLocaleString()}</span>
                <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>SAVE {product.discountPercent}%</span>
              </div>
            )}
            <div style={{ fontSize: 36, fontWeight: 800, color: product.isOnSale ? '#ef4444' : 'var(--accent)', fontFamily: 'Syne' }}>
              €{price?.toLocaleString()}
              <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-3)' }}>/{product.unit}</span>
            </div>
            {product.isOnSale && product.discountValidUntil && (
              <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, marginTop: 2 }}>
                🔥 Sale ends {new Date(product.discountValidUntil).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Stock + MOQ */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13, color: 'var(--text-2)' }}>
            <span style={{ color: product.stock === 0 ? '#ef4444' : product.stock < 10 ? '#f59e0b' : 'var(--green)', fontWeight: 700 }}>
              {product.stock === 0 ? '❌ Out of stock' : product.stock < 10 ? `⚠️ Only ${product.stock} left` : `✓ ${product.stock} in stock`}
            </span>
            <span><FiPackage style={{ marginRight: 4 }} />Min. order: {product.minOrderQty} {product.unit}</span>
          </div>

          {/* Qty + Add to Cart */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8 }}>
              <button className="btn btn-outline btn-sm" style={{ border: 'none', padding: '8px 14px' }} onClick={() => setQty(q => Math.max(product.minOrderQty, q - 1))}>−</button>
              <span style={{ padding: '0 14px', fontWeight: 700, fontFamily: 'Syne' }}>{qty}</span>
              <button className="btn btn-outline btn-sm" style={{ border: 'none', padding: '8px 14px' }} onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button className={'btn flex-1 ' + (added ? 'btn-success' : 'btn-accent')} style={{ justifyContent: 'center' }}
              onClick={addToCart} disabled={product.stock === 0}>
              {added ? <><FiCheck /> Added to Cart!</> : <><FiShoppingCart /> Add {qty} to Cart — €{(price * qty)?.toLocaleString()}</>}
            </button>
          </div>

          {/* Warranty */}
          {product.warrantyTerms && (
            <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: 'var(--text-2)', display: 'flex', gap: 8 }}>
              🔧 <div><strong>Warranty:</strong> {product.warrantyTerms}</div>
            </div>
          )}

          {/* Loan / EMI Section */}
          {loanEligible && (
            <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontWeight: 700, fontSize: 14 }}>
                <FiCreditCard style={{ color: 'var(--accent)' }} /> Finance with EMI
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4, fontWeight: 700 }}>Bank</label>
                  <select className="input" style={{ fontSize: 12 }} value={loanBank} onChange={e => setLoanBank(e.target.value)}>
                    {LOAN_BANKS.map(b => <option key={b.id} value={b.id}>{b.flag} {b.name} ({b.rate}%)</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4, fontWeight: 700 }}>Term</label>
                  <select className="input" style={{ fontSize: 12 }} value={loanTerm} onChange={e => setLoanTerm(e.target.value)}>
                    {[6, 12, 18, 24, 36, 48, 60].map(t => <option key={t} value={t}>{t} months</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ marginBottom: 10 }} onClick={calcEmi}>Calculate EMI for {qty} unit(s)</button>
              {emiResult && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[['Monthly EMI', `€${emiResult.emi}`, 'var(--green)'], ['Total Amount', `€${emiResult.total}`, 'var(--text)'], ['Interest Paid', `€${emiResult.interest}`, 'var(--accent)']].map(([l, v, c]) => (
                    <div key={l} style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--surface-2)', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontWeight: 800, color: c, fontSize: 16 }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs: specs, description, warranty */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[['specs', '📋 Specifications'], ['description', '📝 Description'], ['warranty', '🔧 Warranty & Origin']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ padding: '14px 24px', border: 'none', background: activeTab === key ? 'rgba(245,166,35,0.08)' : 'transparent', color: activeTab === key ? 'var(--accent)' : 'var(--text-2)', fontWeight: activeTab === key ? 800 : 500, fontSize: 13, cursor: 'pointer', borderBottom: activeTab === key ? '2px solid var(--accent)' : '2px solid transparent', fontFamily: 'inherit' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ padding: 24 }}>
          {activeTab === 'specs' && (
            <>
              {product.technicalSpec && (
                <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 16, marginBottom: 16, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8, color: 'var(--text-2)', whiteSpace: 'pre-wrap', border: '1px solid var(--border)' }}>
                  {product.technicalSpec}
                </div>
              )}
              {Object.keys(specMap).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                  {Object.entries(specMap).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 13 }}>
                      <span style={{ color: 'var(--text-3)', fontWeight: 600 }}>{k}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {!product.technicalSpec && Object.keys(specMap).length === 0 && <p style={{ color: 'var(--text-3)' }}>No technical specifications listed.</p>}
            </>
          )}
          {activeTab === 'description' && (
            <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)', maxWidth: 720 }}>{product.description || 'No description available.'}</div>
          )}
          {activeTab === 'warranty' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Warranty Terms</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>{product.warrantyTerms || 'Contact manufacturer for warranty information.'}</div>
                {product.warrantyMonths > 0 && <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(0,212,255,0.07)', borderRadius: 8, fontSize: 13, color: 'var(--cyan)', fontWeight: 700 }}>Duration: {product.warrantyMonths} months</div>}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Origin & Logistics</div>
                {[
                  ['Country of Origin', product.countryOfOrigin],
                  ['HS Code', product.hsCode],
                  ['Weight', product.weight ? `${product.weight} kg` : null],
                  ['Min Order', `${product.minOrderQty} ${product.unit}`],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-3)' }}>{k}</span>
                    <span style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
