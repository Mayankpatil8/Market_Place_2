import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import API from '../../utils/api';
import { FiUsers, FiBox, FiPackage, FiBriefcase, FiTrendingUp, FiArrowRight, FiArrowUp, FiArrowDown, FiGlobe, FiEye, FiSearch, FiTruck, FiDollarSign } from 'react-icons/fi';
import './AdminDash.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#f5a623','#00d4ff','#00e676','#ff4757','#9c6afe','#ff8c00','#00bcd4'];

const eur = v => `€${Number(v||0).toLocaleString()}`;
const num = v => Number(v||0).toLocaleString();

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'var(--surface-3)',border:'1px solid var(--border-2)',borderRadius:10,padding:'12px 16px',fontSize:12}}>
      <div style={{fontWeight:800,marginBottom:8,color:'var(--text-2)'}}>{label}</div>
      {payload.map(p=>(
        <div key={p.name} style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:p.color}} />
          <span style={{color:'var(--text-2)'}}>{p.name}:</span>
          <strong style={{color:'var(--text)'}}>{p.name.includes('Revenue')||p.name.includes('Fee')||p.name.includes('€') ? eur(p.value) : num(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

const TABS = [
  { key:'overview',   label:'Overview' },
  { key:'sales',      label:'Sales Analytics' },
  { key:'activity',   label:'AI Activity Report' },
  { key:'freight',    label:'Freight Forwarders' },
  { key:'revenue',    label:'Master Revenue' },
];

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [sales, setSales]       = useState(null);
  const [activity, setActivity] = useState(null);
  const [freight, setFreight]   = useState([]);
  const [masterRev, setMasterRev] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('overview');
  const [activeChart, setActiveChart] = useState('overview');

  useEffect(() => {
    API.get('/admin/dashboard').then(({ data }) => { setStats(data.stats); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'sales'    && !sales)     API.get('/admin/sales-analytics').then(r=>setSales(r.data.data)).catch(()=>{});
    if (tab === 'activity' && !activity)  API.get('/admin/activity-report').then(r=>setActivity(r.data.data)).catch(()=>{});
    if (tab === 'freight'  && !freight.length) API.get('/admin/freight-forwarders').then(r=>setFreight(r.data.data)).catch(()=>{});
    if (tab === 'revenue'  && !masterRev) API.get('/admin/master-revenue').then(r=>setMasterRev(r.data.data)).catch(()=>{});
  }, [tab]);

  if (loading) return (
    <div className="loading-spinner">
      <div style={{textAlign:'center'}}>
        <div className="spinner" style={{margin:'0 auto 16px'}} />
        <div style={{fontSize:13,color:'var(--text-2)'}}>Loading dashboard data…</div>
      </div>
    </div>
  );

  const kpis = [
    {label:'Total Users',value:stats?.totalUsers||0,fmt:'num',icon:FiUsers,color:'var(--cyan)',delta:'+12%',up:true,bg:'rgba(0,212,255,0.08)'},
    {label:'Products Listed',value:stats?.totalProducts||0,fmt:'num',icon:FiBox,color:'var(--green)',delta:'+8%',up:true,bg:'rgba(0,230,118,0.08)'},
    {label:'Platform Revenue (€)',value:stats?.revenue?.totalFees||0,fmt:'eur',icon:FiTrendingUp,color:'var(--accent)',delta:'+24%',up:true,bg:'rgba(245,166,35,0.08)'},
    {label:'Active Deals',value:stats?.totalDeals||0,fmt:'num',icon:FiBriefcase,color:'var(--purple)',delta:'+5%',up:true,bg:'rgba(156,106,254,0.08)'},
  ];

  const monthlyData = (stats?.monthlyRevenue||[]).map(m=>({ month:MONTHS[m._id.month-1], 'Gross Revenue':m.revenue, 'Platform Fees':m.fees, Orders:m.orders }));
  const pieData     = (stats?.usersByRole||[]).map(r=>({name:r._id,value:r.count}));
  const orderStatus = (stats?.ordersByStatus||[]).map(o=>({name:o._id,value:o.count}));

  return (
    <div className="admin-dash">
      {/* Header */}
      <div className="page-header flex-between">
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
            <div style={{width:8,height:8,background:'var(--green)',borderRadius:'50%',animation:'pulse 2s infinite'}} />
            <span style={{fontSize:11,color:'var(--green)',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em'}}>Live Dashboard</span>
          </div>
          <h1>Platform Overview</h1>
          <p>Real-time analytics and business intelligence</p>
        </div>
        <div style={{display:'flex',gap:12}}>
          <Link to="/admin/profit-loss" className="btn btn-secondary"><FiTrendingUp /> P&L Report</Link>
          <Link to="/admin/users" className="btn btn-primary">Manage Users <FiArrowRight /></Link>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar" style={{marginBottom:24}}>
        {TABS.map(t=>(
          <button key={t.key} className={`tab-btn ${tab===t.key?'active':''}`} onClick={()=>setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* ═══ TAB: OVERVIEW ═══ */}
      {tab==='overview' && (
        <>
          <div className="grid-4" style={{marginBottom:28}}>
            {kpis.map((k,i)=>(
              <div key={k.label} className={`card stat-card anim-fade-up d${i+1}`} style={{background:k.bg,borderColor:`${k.color}25`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                  <div style={{width:44,height:44,borderRadius:12,background:`${k.color}20`,color:k.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}><k.icon /></div>
                  <span className={`badge ${k.up?'badge-green':'badge-red'}`} style={{fontSize:10}}>{k.up?<FiArrowUp />:<FiArrowDown />} {k.delta}</span>
                </div>
                <div className="stat-value" style={{color:k.color}}>
                  {k.fmt==='eur' ? eur(k.value) : num(k.value)}
                </div>
                <div className="stat-label">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{marginBottom:24}}>
            <div className="card anim-fade-up d1" style={{padding:24}}>
              <div className="ad-card-title">Order Revenue Breakdown</div>
              <div className="rev-grid">
                {[{label:'Gross Revenue',val:stats?.revenue?.totalRevenue||0,color:'var(--text)'},{label:'Platform Fee (2%)',val:stats?.revenue?.totalFees||0,color:'var(--green)'},{label:'Supplier Payout',val:(stats?.revenue?.totalRevenue||0)-(stats?.revenue?.totalFees||0),color:'var(--text-2)'}].map(r=>(
                  <div key={r.label} className="rev-row"><span className="rev-label">{r.label}</span><span className="rev-val" style={{color:r.color}}>{eur(r.val)}</span></div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text-3)',marginTop:12}}>
                <span>From {stats?.revenue?.totalOrders||0} paid orders</span><span>{stats?.totalOrders||0} total orders</span>
              </div>
            </div>
            <div className="card anim-fade-up d2" style={{padding:24}}>
              <div className="ad-card-title">Deal Revenue</div>
              <div className="rev-grid">
                {[{label:'Total Deal Value',val:stats?.dealRevenue?.totalValue||0,color:'var(--text)'},{label:'Platform Commission (1.5%)',val:stats?.dealRevenue?.totalFees||0,color:'var(--green)'}].map(r=>(
                  <div key={r.label} className="rev-row"><span className="rev-label">{r.label}</span><span className="rev-val" style={{color:r.color}}>{eur(r.val)}</span></div>
                ))}
              </div>
              <div style={{marginTop:20,padding:16,background:'rgba(245,166,35,0.07)',borderRadius:10,border:'1px solid rgba(245,166,35,0.2)'}}>
                <div style={{fontSize:11,color:'var(--text-3)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:800}}>Total Platform Income</div>
                <div style={{fontSize:30,fontWeight:800,color:'var(--accent)'}}>{eur((stats?.revenue?.totalFees||0)+(stats?.dealRevenue?.totalFees||0))}</div>
              </div>
            </div>
          </div>

          {monthlyData.length > 0 && (
            <div className="card anim-fade-up" style={{padding:28,marginBottom:24}}>
              <div className="flex-between" style={{marginBottom:24}}>
                <div className="ad-card-title" style={{margin:0}}>Monthly Revenue Trend</div>
                <div className="tab-bar" style={{width:'auto',padding:'3px'}}>
                  {['overview','fees'].map(t=>(
                    <button key={t} className={`tab-btn ${activeChart===t?'active':''}`} style={{padding:'6px 14px',fontSize:12}} onClick={()=>setActiveChart(t)}>
                      {t==='overview'?'Gross Revenue':'Platform Fees'}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f5a623" stopOpacity="0.3" /><stop offset="100%" stopColor="#f5a623" stopOpacity="0.02" /></linearGradient>
                    <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" /><stop offset="100%" stopColor="#00d4ff" stopOpacity="0.02" /></linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:'#55557a'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:11,fill:'#55557a'}} axisLine={false} tickLine={false} tickFormatter={v=>`€${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize:12}} />
                  {activeChart==='overview'
                    ? <Area type="monotone" dataKey="Gross Revenue" stroke="#f5a623" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
                    : <Area type="monotone" dataKey="Platform Fees" stroke="#00d4ff" strokeWidth={2.5} fill="url(#feeGrad)" dot={false} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid-2" style={{marginBottom:24}}>
            <div className="card" style={{padding:24}}>
              <div className="ad-card-title">Users by Role</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={44} paddingAngle={3}>
                    {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip formatter={v=>[v,'Users']} contentStyle={{background:'var(--surface-3)',border:'1px solid var(--border-2)',borderRadius:8,fontSize:12}} />
                  <Legend wrapperStyle={{fontSize:12}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{padding:24}}>
              <div className="ad-card-title">Orders by Status</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={orderStatus} barSize={24}>
                  <XAxis dataKey="name" tick={{fontSize:10,fill:'#55557a'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:10,fill:'#55557a'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{background:'var(--surface-3)',border:'1px solid var(--border-2)',borderRadius:8,fontSize:12}} />
                  <Bar dataKey="value" radius={[6,6,0,0]}>{orderStatus.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{padding:24}}>
            <div className="flex-between" style={{marginBottom:20}}>
              <div className="ad-card-title" style={{margin:0}}>Top Selling Products</div>
              <Link to="/admin/products" className="btn btn-secondary btn-sm">View All <FiArrowRight /></Link>
            </div>
            {!(stats?.topProducts||[]).length ? <div className="empty-state">No sales data yet</div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Product</th><th>Category</th><th>Price (€)</th><th>Units Sold</th><th>Revenue (€)</th><th>Performance</th></tr></thead>
                  <tbody>{(stats.topProducts||[]).map((p,i)=>{
                    const maxSold = stats.topProducts[0]?.totalSold||1;
                    const pct = Math.round((p.totalSold/maxSold)*100);
                    return (
                      <tr key={p._id}>
                        <td><span style={{fontWeight:800,color:i===0?'var(--accent)':'var(--text-3)'}}>#{i+1}</span></td>
                        <td><strong>{p.name}</strong></td>
                        <td><span className="badge badge-gray">{p.category}</span></td>
                        <td>{eur(p.price)}</td>
                        <td><strong>{p.totalSold||0}</strong></td>
                        <td style={{color:'var(--green)'}}>{eur((p.totalSold||0)*(p.price||0))}</td>
                        <td><div style={{display:'flex',alignItems:'center',gap:10}}><div className="progress-bar" style={{width:80}}><div className="progress-fill progress-gold" style={{width:`${pct}%`}} /></div><span style={{fontSize:11,color:'var(--text-3)'}}>{pct}%</span></div></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ TAB: SALES ANALYTICS ═══ */}
      {tab==='sales' && (
        <>
          {!sales ? <div className="loading-spinner"><div className="spinner" /></div> : (
            <>
              {/* Today / Week / Month */}
              <div className="grid-3" style={{marginBottom:24}}>
                {[
                  {label:"Today's Sales",data:sales.todaySales,color:'var(--cyan)'},
                  {label:'This Week',data:sales.weekSales,color:'var(--green)'},
                  {label:'This Month',data:sales.monthSales,color:'var(--accent)'},
                ].map(({label,data,color})=>(
                  <div key={label} className="card stat-card" style={{borderColor:`${color}25`}}>
                    <div style={{fontSize:12,color:'var(--text-3)',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>{label}</div>
                    <div style={{fontSize:28,fontWeight:800,color}}>{eur(data.revenue)}</div>
                    <div style={{fontSize:13,color:'var(--text-2)',marginTop:4}}>{num(data.count)} orders</div>
                  </div>
                ))}
              </div>

              <div className="grid-2" style={{marginBottom:24}}>
                {/* Parts-wise sales */}
                <div className="card" style={{padding:24}}>
                  <div className="ad-card-title">Parts / Product-Wise Sales (Top 10)</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Product</th><th>Qty Sold</th><th>Revenue (€)</th></tr></thead>
                      <tbody>
                        {(sales.partsSales||[]).map((p,i)=>(
                          <tr key={i}>
                            <td style={{fontSize:12}}>{p._id||'Unknown'}</td>
                            <td><strong>{p.totalQty}</strong></td>
                            <td style={{color:'var(--green)'}}>{eur(p.totalRevenue)}</td>
                          </tr>
                        ))}
                        {!sales.partsSales?.length && <tr><td colSpan={3} style={{textAlign:'center',color:'var(--text-3)',padding:24}}>No sales data yet</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Manufacturer-wise sales */}
                <div className="card" style={{padding:24}}>
                  <div className="ad-card-title">Manufacturer-Wise Sales</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Manufacturer</th><th>Orders</th><th>Revenue (€)</th></tr></thead>
                      <tbody>
                        {(sales.mfgSales||[]).map((m,i)=>(
                          <tr key={i}>
                            <td><strong style={{fontSize:12}}>{m.company||m.name||'Unknown'}</strong></td>
                            <td>{m.totalOrders}</td>
                            <td style={{color:'var(--green)'}}>{eur(m.revenue)}</td>
                          </tr>
                        ))}
                        {!sales.mfgSales?.length && <tr><td colSpan={3} style={{textAlign:'center',color:'var(--text-3)',padding:24}}>No data yet</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Country-wise sales */}
              <div className="card" style={{padding:24}}>
                <div className="ad-card-title"><FiGlobe style={{marginRight:8}} />Country-Wise Sales</div>
                {(sales.countrySales||[]).length === 0 ? (
                  <div className="empty-state">No country data yet</div>
                ) : (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
                    {sales.countrySales.map((c,i)=>{
                      const maxRev = sales.countrySales[0]?.revenue||1;
                      const pct = Math.round((c.revenue/maxRev)*100);
                      return (
                        <div key={i} style={{padding:'12px 16px',background:'var(--surface-2)',borderRadius:10,border:'1px solid var(--border)'}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                            <strong style={{fontSize:13}}>{c._id||'Unknown'}</strong>
                            <span style={{fontSize:12,color:'var(--text-3)'}}>{c.count} orders</span>
                          </div>
                          <div style={{fontSize:15,fontWeight:800,color:'var(--accent)',marginBottom:6}}>{eur(c.revenue)}</div>
                          <div className="progress-bar"><div className="progress-fill progress-gold" style={{width:`${pct}%`}} /></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ TAB: AI ACTIVITY REPORT ═══ */}
      {tab==='activity' && (
        <>
          {!activity ? <div className="loading-spinner"><div className="spinner" /></div> : (
            <>
              <div className="grid-2" style={{marginBottom:24}}>
                {/* Hot products */}
                <div className="card" style={{padding:24}}>
                  <div className="ad-card-title"><FiEye style={{marginRight:8}} />Most Viewed Products</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Product</th><th>Category</th><th>Price (€)</th><th>Views</th></tr></thead>
                      <tbody>
                        {(activity.hotProducts||[]).map((p,i)=>(
                          <tr key={i}>
                            <td style={{fontSize:12,maxWidth:200}}>{p.name}</td>
                            <td><span className="badge badge-gray">{p.category}</span></td>
                            <td>{eur(p.price)}</td>
                            <td><strong style={{color:'var(--cyan)'}}>{p.views||0}</strong></td>
                          </tr>
                        ))}
                        {!activity.hotProducts?.length && <tr><td colSpan={4} style={{textAlign:'center',color:'var(--text-3)',padding:24}}>No view data yet</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Top searches */}
                <div className="card" style={{padding:24}}>
                  <div className="ad-card-title"><FiSearch style={{marginRight:8}} />Top Search Queries</div>
                  {(activity.topSearches||[]).length===0 ? <div className="empty-state">No search data yet</div> : (
                    <div>
                      {activity.topSearches.map((s,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <span style={{fontSize:11,color:'var(--text-3)',width:20}}>#{i+1}</span>
                            <span style={{fontSize:13,fontWeight:600}}>{s.query}</span>
                          </div>
                          <span className="badge badge-blue" style={{fontSize:11}}>{s.count} searches</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Active users — who is looking at what */}
              <div className="card" style={{padding:24}}>
                <div className="ad-card-title">👁 Who Is Looking At What — Active Users</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>User</th><th>Company</th><th>Role</th><th>Last Active</th><th>Recent Searches</th><th>Viewed Products</th></tr></thead>
                    <tbody>
                      {(activity.activeUsers||[]).map((u,i)=>(
                        <tr key={i}>
                          <td><strong style={{fontSize:13}}>{u.name}</strong><div style={{fontSize:11,color:'var(--text-3)'}}>{u.email}</div></td>
                          <td style={{fontSize:12}}>{u.company||'—'}</td>
                          <td><span className={`badge badge-${u.role==='supplier'?'green':u.role==='admin'?'red':'blue'}`}>{u.role}</span></td>
                          <td style={{fontSize:11,color:'var(--text-3)'}}>{u.lastActive ? new Date(u.lastActive).toLocaleDateString() : '—'}</td>
                          <td style={{fontSize:11,maxWidth:150}}>
                            {(u.searchHistory||[]).slice(-3).map((s,si)=><span key={si} className="badge badge-gray" style={{fontSize:10,marginRight:3}}>{s.query}</span>)}
                            {!(u.searchHistory||[]).length && '—'}
                          </td>
                          <td style={{fontSize:11}}>
                            {(u.viewedProducts||[]).slice(-3).map((p,pi)=><span key={pi} className="badge badge-gray" style={{fontSize:10,marginRight:3}}>{typeof p === 'object' ? p.name?.slice(0,20) : '—'}</span>)}
                            {!(u.viewedProducts||[]).length && '—'}
                          </td>
                        </tr>
                      ))}
                      {!activity.activeUsers?.length && <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-3)',padding:32}}>No activity data yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ TAB: FREIGHT FORWARDERS ═══ */}
      {tab==='freight' && (
        <>
          <div style={{marginBottom:20,padding:'14px 18px',background:'rgba(0,212,255,0.07)',border:'1px solid rgba(0,212,255,0.2)',borderRadius:10,fontSize:13,color:'var(--text-2)',display:'flex',alignItems:'center',gap:10}}>
            <FiTruck style={{fontSize:18,color:'var(--cyan)',flexShrink:0}} />
            Country-wise freight forwarder master sheet. Modes: Air / Sea / Road / Rail. Transit days shown for EU, UK, Ukraine.
          </div>
          {!freight.length ? <div className="loading-spinner"><div className="spinner" /></div> : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))',gap:16}}>
              {freight.map((country,ci)=>(
                <div key={ci} className="card" style={{padding:20}}>
                  <div style={{fontFamily:'Syne',fontWeight:700,fontSize:15,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                    <FiGlobe style={{color:'var(--accent)'}} />{country.country} ({country.code})
                  </div>
                  {country.forwarders.map((f,fi)=>(
                    <div key={fi} style={{padding:'10px 12px',background:'var(--surface-2)',borderRadius:8,marginBottom:8,border:'1px solid var(--border)'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                        <strong style={{fontSize:13}}>{f.name}</strong>
                        <div style={{display:'flex',gap:4}}>
                          {f.modes.map(m=><span key={m} className="badge badge-blue" style={{fontSize:9,padding:'2px 6px'}}>{m}</span>)}
                        </div>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:6}}>
                        {[['EU',f.transitDays?.eu],['UK',f.transitDays?.uk],['🇺🇦 UA',f.transitDays?.ua]].map(([lbl,d])=>(
                          <div key={lbl} style={{textAlign:'center',background:'var(--surface-3)',padding:'4px 0',borderRadius:6}}>
                            <div style={{fontSize:9,color:'var(--text-3)',marginBottom:2}}>{lbl}</div>
                            <div style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{d}d</div>
                          </div>
                        ))}
                      </div>
                      <div style={{fontSize:11,color:'var(--text-3)'}}>{f.contact} · {f.website}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ TAB: MASTER REVENUE ═══ */}
      {tab==='revenue' && (
        <>
          {!masterRev ? <div className="loading-spinner"><div className="spinner" /></div> : (
            <>
              {/* Grand total */}
              <div style={{padding:28,background:'linear-gradient(135deg,rgba(245,166,35,0.12),rgba(245,166,35,0.04))',border:'1px solid rgba(245,166,35,0.25)',borderRadius:16,marginBottom:24,textAlign:'center'}}>
                <div style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-3)',marginBottom:8}}>Platform Grand Total Revenue</div>
                <div style={{fontSize:48,fontWeight:800,color:'var(--accent)'}}>{eur(masterRev.grandTotal)}</div>
                <div style={{fontSize:13,color:'var(--text-2)',marginTop:6}}>Across Module A (Marketplace) + Module B (Certifications) + Module C (Consulting)</div>
              </div>

              {/* Module breakdown */}
              <div className="grid-3" style={{marginBottom:24}}>
                {/* Module A */}
                <div className="card" style={{padding:24}}>
                  <div style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--cyan)',marginBottom:12}}>Module A · Marketplace</div>
                  <div className="rev-grid">
                    {[
                      {l:'Order Revenue (Platform Fees)',v:masterRev.moduleA.orderFees},
                      {l:'Deal Commissions',v:masterRev.moduleA.dealFees},
                      {l:'Membership Revenue',v:masterRev.moduleA.membershipRevenue},
                      {l:'Bank Commission (Loans 1.5%)',v:masterRev.moduleA.bankCommission},
                    ].map(r=>(
                      <div key={r.l} className="rev-row"><span className="rev-label">{r.l}</span><span className="rev-val" style={{color:'var(--green)'}}>{eur(r.v)}</span></div>
                    ))}
                  </div>
                  <div style={{marginTop:12,padding:'10px 14px',background:'rgba(0,212,255,0.07)',borderRadius:8}}>
                    <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>Gross Order Volume</div>
                    <div style={{fontWeight:800,color:'var(--cyan)'}}>{eur(masterRev.moduleA.orderGross)}</div>
                  </div>
                </div>
                {/* Module B */}
                <div className="card" style={{padding:24}}>
                  <div style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--purple)',marginBottom:12}}>Module B · Defence Certifications</div>
                  <div className="rev-grid">
                    <div className="rev-row"><span className="rev-label">Certification Fees Collected</span><span className="rev-val" style={{color:'var(--green)'}}>{eur(masterRev.moduleB.revenue)}</span></div>
                    <div className="rev-row"><span className="rev-label">Certifications Issued</span><span className="rev-val">{masterRev.moduleB.count}</span></div>
                  </div>
                  <div style={{marginTop:12,padding:'10px 14px',background:'rgba(156,106,254,0.07)',borderRadius:8}}>
                    <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>Avg Fee / Certification</div>
                    <div style={{fontWeight:800,color:'var(--purple)'}}>{masterRev.moduleB.count ? eur(Math.round(masterRev.moduleB.revenue/masterRev.moduleB.count)) : '€0'}</div>
                  </div>
                </div>
                {/* Module C */}
                <div className="card" style={{padding:24}}>
                  <div style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--green)',marginBottom:12}}>Module C · Business Consulting</div>
                  <div className="rev-grid">
                    <div className="rev-row"><span className="rev-label">Consulting Fees Collected</span><span className="rev-val" style={{color:'var(--green)'}}>{eur(masterRev.moduleC.revenue)}</span></div>
                    <div className="rev-row"><span className="rev-label">Engagements Completed</span><span className="rev-val">{masterRev.moduleC.count}</span></div>
                  </div>
                  <div style={{marginTop:12,padding:'10px 14px',background:'rgba(0,230,118,0.07)',borderRadius:8}}>
                    <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>Avg Fee / Engagement</div>
                    <div style={{fontWeight:800,color:'var(--green)'}}>{masterRev.moduleC.count ? eur(Math.round(masterRev.moduleC.revenue/masterRev.moduleC.count)) : '€0'}</div>
                  </div>
                </div>
              </div>

              {/* Bank commission detail */}
              <div className="card" style={{padding:24}}>
                <div className="ad-card-title"><FiDollarSign style={{marginRight:8}} />Bank Commission Revenue (Loan Referrals)</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
                  {[
                    {name:'Nordea Bank',flag:'🇫🇮',rate:'4.5%'},
                    {name:'S-Bank',flag:'🇫🇮',rate:'5.2%'},
                    {name:'Deutsche Bank',flag:'🇩🇪',rate:'3.9%'},
                  ].map((b,i)=>(
                    <div key={i} style={{padding:'14px 18px',background:'var(--surface-2)',borderRadius:10,border:'1px solid var(--border)'}}>
                      <div style={{fontSize:18,marginBottom:6}}>{b.flag}</div>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{b.name}</div>
                      <div style={{fontSize:12,color:'var(--text-3)',marginBottom:8}}>Interest rate: {b.rate} | Our commission: 1.5% of loan amount</div>
                      <div style={{fontSize:13,fontWeight:800,color:'var(--accent)'}}>{eur(masterRev.bankCommission / 3)}</div>
                      <div style={{fontSize:10,color:'var(--text-3)'}}>estimated commission</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
