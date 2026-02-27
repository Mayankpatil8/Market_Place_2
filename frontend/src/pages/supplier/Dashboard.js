import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiBox, FiBriefcase, FiPackage, FiTrendingUp, FiArrowRight, FiPlus, FiShield, FiCreditCard, FiCheckCircle, FiAlertCircle, FiTag } from 'react-icons/fi';

const LOAN_BANKS = [
  { id:'nordea', name:'Nordea Bank', rate:4.5, flag:'🇫🇮' },
  { id:'s_bank', name:'S-Bank', rate:5.2, flag:'🇫🇮' },
  { id:'deutsche_bank', name:'Deutsche Bank', rate:3.9, flag:'🇩🇪' },
];

function MembershipCard({ membership }) {
  const [plans, setPlans] = useState(null);
  const [showPlans, setShowPlans] = useState(false);
  const [emi, setEmi] = useState({ bank:'nordea', term:12, amount:1000 });
  const [emiResult, setEmiResult] = useState(null);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => { API.get('/membership/plans').then(r=>setPlans(r.data.data)).catch(()=>{}); }, []);

  const calcEmi = async () => {
    try { const r = await API.post('/membership/emi-calculate', {amount:emi.amount, bankId:emi.bank, termMonths:emi.term}); setEmiResult(r.data.data); } catch {}
  };
  const subscribe = async (planType) => {
    setSubscribing(planType);
    try { await API.post('/membership/subscribe', {planType}); window.location.reload(); }
    catch (err) { alert(err.response?.data?.message||'Failed'); setSubscribing(null); }
  };

  const isActive = membership?.status === 'active';
  const supplierPlans = plans?.plans?.supplier;

  return (
    <div className="card" style={{padding:24}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h3 style={{fontFamily:'Syne',fontSize:16,margin:0,display:'flex',alignItems:'center',gap:8}}><FiCreditCard style={{color:'var(--accent)'}} /> Manufacturer Membership</h3>
        {!isActive && <button className="btn btn-accent btn-sm" onClick={()=>setShowPlans(!showPlans)}>Get Membership</button>}
      </div>
      {isActive ? (
        <div>
          <div style={{background:'rgba(0,230,118,0.08)',border:'1px solid rgba(0,230,118,0.2)',borderRadius:10,padding:16,marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><FiCheckCircle style={{color:'var(--green)'}} /><strong style={{color:'var(--green)'}}>Active — {membership.planLabel}</strong></div>
            <div style={{fontSize:12,color:'var(--text-2)'}}>€{membership.fee} {membership.planType==='one_time'?'one-time':`/ ${membership.planType}`}</div>
            {membership.discount>0 && <div style={{fontSize:11,color:'var(--accent)',marginTop:4}}>✓ {membership.discount}% discount on all services</div>}
          </div>
        </div>
      ) : (
        <div>
          <div style={{padding:'10px 14px',background:'rgba(255,70,85,0.07)',border:'1px solid rgba(255,70,85,0.15)',borderRadius:8,fontSize:12,color:'var(--text-2)',marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
            <FiAlertCircle style={{color:'#ff4655'}} /> No active membership. Manufacturer plans from €300/month or €1,000 one-time.
          </div>
          {showPlans && supplierPlans && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
                {Object.values(supplierPlans).map(p => (
                  <div key={p.id} style={{border:'1px solid var(--border)',borderRadius:10,padding:14,position:'relative'}}>
                    {p.type==='annual'&&<div style={{position:'absolute',top:-8,left:'50%',transform:'translateX(-50%)',background:'var(--accent)',color:'#000',fontSize:9,fontWeight:800,padding:'2px 8px',borderRadius:4,whiteSpace:'nowrap'}}>BEST VALUE</div>}
                    <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>{p.label}</div>
                    {p.originalFee&&<div style={{fontSize:10,color:'var(--text-3)',textDecoration:'line-through'}}>€{p.originalFee}</div>}
                    <div style={{fontSize:22,fontWeight:800,color:'var(--accent)',marginBottom:6}}>€{p.fee}</div>
                    {p.features.map(f=><div key={f} style={{fontSize:11,color:'var(--text-2)',marginBottom:2}}>✓ {f}</div>)}
                    <button className="btn btn-accent btn-sm" style={{width:'100%',marginTop:10}} disabled={subscribing===p.type} onClick={()=>subscribe(p.type)}>
                      {subscribing===p.type?'Activating…':'Subscribe'}
                    </button>
                  </div>
                ))}
              </div>
              <div style={{background:'rgba(0,212,255,0.05)',border:'1px solid rgba(0,212,255,0.15)',borderRadius:10,padding:14}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>🏦 Loan / EMI Calculator</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:8,alignItems:'end'}}>
                  <div><label style={{fontSize:11,color:'var(--text-3)',display:'block',marginBottom:4}}>Bank</label>
                    <select className="input" style={{fontSize:12}} value={emi.bank} onChange={e=>setEmi({...emi,bank:e.target.value})}>
                      {LOAN_BANKS.map(b=><option key={b.id} value={b.id}>{b.flag} {b.name} ({b.rate}%)</option>)}
                    </select></div>
                  <div><label style={{fontSize:11,color:'var(--text-3)',display:'block',marginBottom:4}}>Amount (€)</label>
                    <input className="input" type="number" style={{fontSize:12}} value={emi.amount} onChange={e=>setEmi({...emi,amount:e.target.value})} /></div>
                  <div><label style={{fontSize:11,color:'var(--text-3)',display:'block',marginBottom:4}}>Term (months)</label>
                    <select className="input" style={{fontSize:12}} value={emi.term} onChange={e=>setEmi({...emi,term:e.target.value})}>
                      {[6,12,24,36,48].map(t=><option key={t} value={t}>{t}</option>)}
                    </select></div>
                  <button className="btn btn-secondary btn-sm" onClick={calcEmi}>Calculate</button>
                </div>
                {emiResult && (
                  <div style={{marginTop:10,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    {[['Monthly EMI',`€${emiResult.emiAmount}`,'var(--green)'],['Total Payable',`€${emiResult.totalPayable}`,'var(--text)'],['Interest',`€${emiResult.totalInterest}`,'var(--accent)']].map(([l,v,c])=>(
                      <div key={l} style={{textAlign:'center',padding:8,background:'var(--surface-2)',borderRadius:8}}>
                        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>{l}</div>
                        <div style={{fontWeight:800,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products:0, deals:0, orders:0, revenue:0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);
  const [membership, setMembership] = useState(null);
  const [saleProducts, setSaleProducts] = useState([]);

  useEffect(() => {
    Promise.all([
      API.get('/products?limit=1').then(r => r.data.total),
      API.get('/deals?limit=5').then(r => { setRecentDeals(r.data.deals||[]); return r.data.total; }),
      API.get('/orders/supplier').then(r => {
        const orders = r.data.orders||[];
        setRecentOrders(orders.slice(0,5));
        const revenue = orders.filter(o=>o.paymentStatus==='paid').reduce((sum,o) => {
          const myItems = o.items.filter(i=>i.supplier?.toString()===user._id);
          return sum + myItems.reduce((s,i)=>s+i.price*i.quantity,0);
        },0);
        return { count:orders.length, revenue };
      }),
      API.get('/membership/my').then(r => { setMembership(r.data.data); }),
      API.get('/products?limit=50').then(r => {
        const mine = (r.data.products||[]).filter(p=>p.supplier?._id===user._id||p.supplier===user._id);
        setSaleProducts(mine.filter(p=>p.isOnSale));
      }),
    ]).then(([products, deals, orderInfo]) => {
      setStats({ products, deals, orders:orderInfo.count, revenue:orderInfo.revenue });
    }).catch(()=>{});
  }, []);

  // Check certifications on user object
  const hasMsds = user.supplierInfo?.msdsCertified;
  const hasIso  = user.supplierInfo?.isoCertification;
  const hasCe   = user.supplierInfo?.ceCertification;

  return (
    <div style={{maxWidth:1100}}>
      <div className="page-header flex-between">
        <div>
          <h1>Manufacturer Dashboard</h1>
          <p>Welcome back, {user.name} — {user.company || 'Your Company'}
            {user.countryCode ? ` · ${user.countryCode}` : ''}
            {user.vatNumber ? ` · VAT: ${user.vatNumber}` : ''}</p>
        </div>
        <Link to="/supplier/products" className="btn btn-accent"><FiPlus /> Add Product</Link>
      </div>

      {/* Certifications bar */}
      <div className="card" style={{padding:'12px 20px',marginBottom:20,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
        <FiShield style={{color:'var(--accent)',flexShrink:0}} />
        <strong style={{fontSize:13,color:'var(--text-2)'}}>Compliance:</strong>
        <span className={`badge ${hasIso?'badge-green':'badge-gray'}`}>ISO: {hasIso||'Not added'}</span>
        <span className={`badge ${hasCe?'badge-green':'badge-gray'}`}>CE: {hasCe||'Not added'}</span>
        <span className={`badge ${hasMsds?'badge-green':'badge-gray'}`}>MSDS: {hasMsds?'Certified':'Not certified'}</span>
        {(user.supplierInfo?.otherCertifications||[]).map((c,i)=><span key={i} className="badge badge-blue">{c.name}</span>)}
        <Link to="/supplier/profile" className="btn btn-secondary btn-sm" style={{marginLeft:'auto'}}>Edit Profile</Link>
      </div>

      {/* On-sale products alert */}
      {saleProducts.length > 0 && (
        <div style={{background:'rgba(245,166,35,0.08)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:10,padding:'12px 18px',marginBottom:20,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <FiTag style={{color:'var(--accent)',flexShrink:0}} />
          <strong style={{fontSize:13}}>Active Sales ({saleProducts.length} products):</strong>
          {saleProducts.slice(0,3).map(p=>(
            <span key={p._id} style={{fontSize:12,color:'var(--text-2)'}}>
              {p.name.slice(0,30)}… <strong style={{color:'var(--accent)'}}>€{p.discountPrice}</strong>
              <span style={{color:'var(--text-3)',textDecoration:'line-through',marginLeft:4}}>€{p.price}</span>
            </span>
          ))}
          {saleProducts.length>3 && <span style={{fontSize:12,color:'var(--text-3)'}}>+{saleProducts.length-3} more</span>}
        </div>
      )}

      <div className="grid-4" style={{marginBottom:28}}>
        {[
          {label:'My Products',value:stats.products,icon:FiBox,to:'/supplier/products',color:'#dbeafe',ic:'#1e40af'},
          {label:'My Deals',value:stats.deals,icon:FiBriefcase,to:'/supplier/deals',color:'#d1fae5',ic:'#065f46'},
          {label:'Total Orders',value:stats.orders,icon:FiPackage,to:'/supplier/orders',color:'#fef3c7',ic:'#92400e'},
          {label:'Revenue (€)',value:`€${Math.round(stats.revenue).toLocaleString()}`,icon:FiTrendingUp,to:'/supplier/orders',color:'#fce7f3',ic:'#9d174d'},
        ].map(({label,value,icon:Icon,to,color,ic})=>(
          <Link key={label} to={to} className="card stat-card" style={{textDecoration:'none'}}>
            <div style={{width:44,height:44,borderRadius:10,background:color,color:ic,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:12}}><Icon /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div style={{color:'var(--accent2)',fontSize:12,marginTop:8,display:'flex',alignItems:'center',gap:4}}>View <FiArrowRight /></div>
          </Link>
        ))}
      </div>

      <div className="grid-2" style={{marginBottom:24}}>
        <div className="card" style={{padding:24}}>
          <div className="flex-between" style={{marginBottom:16}}>
            <h3 style={{fontFamily:'Syne',fontSize:16}}>Recent Orders</h3>
            <Link to="/supplier/orders" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {recentOrders.length===0 ? <div className="empty-state">No orders yet</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order</th><th>Customer</th><th>Amount (€)</th><th>Status</th></tr></thead>
                <tbody>{recentOrders.map(o=>(
                  <tr key={o._id}>
                    <td style={{fontSize:11}}>{o.orderNumber}</td>
                    <td>{o.customer?.name}</td>
                    <td>€{o.totalAmount?.toLocaleString()}</td>
                    <td><span className={`badge badge-${o.status==='delivered'?'green':o.status==='pending'?'yellow':'blue'}`}>{o.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card" style={{padding:24}}>
          <div className="flex-between" style={{marginBottom:16}}>
            <h3 style={{fontFamily:'Syne',fontSize:16}}>Recent Deals</h3>
            <Link to="/supplier/deals" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {recentDeals.length===0 ? <div className="empty-state">No deals yet. <Link to="/supplier/deals">Create one</Link></div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Deal</th><th>Value (€)</th><th>Status</th></tr></thead>
                <tbody>{recentDeals.map(d=>(
                  <tr key={d._id}>
                    <td><strong style={{fontSize:13}}>{d.title}</strong></td>
                    <td>€{d.totalValue?.toLocaleString()}</td>
                    <td><span className={`badge badge-${d.status==='completed'?'green':d.status==='proposed'?'yellow':'blue'}`}>{d.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <MembershipCard membership={membership} />
    </div>
  );
}
