import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { FiStar, FiShoppingCart, FiUsers, FiBriefcase } from 'react-icons/fi';

export default function Suggestions() {
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/suggestions/products').then(r => setProducts(r.data.suggestions || [])),
      API.get('/suggestions/deals').then(r => setDeals(r.data.suggestedDeals || [])),
      API.get('/suggestions/companies').then(r => setCompanies(r.data.companies || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const joinDeal = async (id) => {
    try {
      await API.put(`/deals/${id}/assign-buyer`);
      alert('✅ Request sent! The supplier will contact you soon.');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>;

  return (
    <div style={{maxWidth:1100}}>
      <div className="page-header">
        <h1>For You ✨</h1>
        <p>AI-powered suggestions based on your activity, search history, and company profile</p>
      </div>

      {/* Suggested Products */}
      <section style={{marginBottom:40}}>
        <div className="flex-between" style={{marginBottom:20}}>
          <h2 style={{fontFamily:'Syne',fontSize:20}}>🛒 Recommended Products</h2>
          <Link to="/products" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {products.length === 0 ? (
          <div className="empty-state"><p>Browse some products first to get recommendations!</p><Link to="/products" className="btn btn-accent btn-sm" style={{marginTop:12}}>Browse Now</Link></div>
        ) : (
          <div className="grid-4">
            {products.slice(0,8).map(p => (
              <div key={p._id} className="card" style={{overflow:'hidden'}}>
                <Link to={`/products/${p._id}`}>
                  <div style={{height:140,background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40}}>📦</div>
                  <div style={{padding:14}}>
                    <span className="badge badge-blue" style={{marginBottom:8}}>{p.category}</span>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{p.name}</div>
                    <div style={{fontFamily:'Syne',fontSize:18,fontWeight:800}}>€{p.price?.toLocaleString()}</div>
                    <div style={{display:'flex',alignItems:'center',gap:4,fontSize:12,color:'var(--accent)',marginTop:4}}><FiStar/>{p.rating?.toFixed(1)||'New'}</div>
                  </div>
                </Link>
                <div style={{padding:'10px 14px',borderTop:'1px solid var(--border)'}}>
                  <button className="btn btn-primary btn-sm" style={{width:'100%',justifyContent:'center'}}
                    onClick={()=>{const c=JSON.parse(localStorage.getItem('cart')||'[]');localStorage.setItem('cart',JSON.stringify([...c,{...p,qty:1}]));}}>
                    <FiShoppingCart/> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Open Deals */}
      <section style={{marginBottom:40}}>
        <h2 style={{fontFamily:'Syne',fontSize:20,marginBottom:20}}>🤝 Open TradeConnect Deals for You</h2>
        {deals.length === 0 ? (
          <div className="empty-state"><p>No open deals available right now. Check back later!</p></div>
        ) : (
          <div className="grid-2">
            {deals.map(d => (
              <div key={d._id} className="card" style={{padding:22}}>
                <div className="flex-between" style={{marginBottom:10}}>
                  <span className="badge badge-yellow">Open Deal</span>
                  <span className="badge badge-blue">{d.dealType}</span>
                </div>
                <h3 style={{fontFamily:'Syne',fontSize:16,marginBottom:8}}>{d.title}</h3>
                <p style={{fontSize:13,color:'var(--muted)',marginBottom:12,lineHeight:1.6}}>{d.description?.slice(0,120)}{d.description?.length>120?'...':''}</p>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
                  <div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>Deal Value</div>
                    <div style={{fontFamily:'Syne',fontSize:18,fontWeight:800}}>€{d.totalValue?.toLocaleString()}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:11,color:'var(--muted)'}}>Supplier</div>
                    <div style={{fontWeight:600,fontSize:13}}>{d.supplier?.company||d.supplier?.name}</div>
                  </div>
                </div>
                <button className="btn btn-accent" style={{width:'100%',justifyContent:'center'}} onClick={()=>joinDeal(d._id)}>
                  Request to Join Deal
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Suggested Companies */}
      <section>
        <h2 style={{fontFamily:'Syne',fontSize:20,marginBottom:20}}><FiUsers style={{verticalAlign:'middle'}}/> Top Verified Suppliers</h2>
        {companies.length === 0 ? (
          <div className="empty-state"><p>No verified suppliers yet.</p></div>
        ) : (
          <div className="grid-3">
            {companies.map(c => (
              <div key={c._id} className="card" style={{padding:20}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <div style={{width:44,height:44,borderRadius:12,background:'#0f172a',color:'#f59e0b',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne',fontWeight:800,fontSize:18}}>
                    {c.company?.charAt(0)||c.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{fontWeight:700}}>{c.company||c.name}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>{c.supplierInfo?.businessType||'Manufacturer'}</div>
                  </div>
                  <span className="badge badge-green" style={{marginLeft:'auto'}}>✓ Verified</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                  <span style={{color:'var(--muted)'}}>Rating</span>
                  <strong style={{color:'var(--accent)'}}>{c.supplierInfo?.rating?.toFixed(1)||'New'} ⭐</strong>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginTop:6}}>
                  <span style={{color:'var(--muted)'}}>Total Deals</span>
                  <strong>{c.supplierInfo?.totalDeals||0}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
