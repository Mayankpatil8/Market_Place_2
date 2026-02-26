import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API from '../../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ProfitLoss() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/admin/profit-loss?year=${year}`).then(({ data }) => {
      setData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [year]);

  const chartData = MONTHS.map((m, i) => {
    const row = data?.monthly?.find(r => r._id === i + 1) || {};
    const deal = data?.dealMonthly?.find(r => r._id === i + 1) || {};
    return {
      month: m,
      'Order Revenue': row.grossRevenue || 0,
      'Platform Fees': (row.platformFees || 0) + (deal.dealFees || 0),
      'Deal Revenue': deal.dealRevenue || 0,
      'Supplier Payout': row.supplierPayouts || 0,
    };
  });

  const totals = chartData.reduce((acc, r) => ({
    revenue: acc.revenue + r['Order Revenue'],
    fees: acc.fees + r['Platform Fees'],
    deals: acc.deals + r['Deal Revenue'],
    payout: acc.payout + r['Supplier Payout'],
  }), { revenue: 0, fees: 0, deals: 0, payout: 0 });

  return (
    <div style={{maxWidth: 1100}}>
      <div className="page-header flex-between">
        <div>
          <h1>Profit &amp; Loss Report</h1>
          <p>Complete financial overview of the platform</p>
        </div>
        <select className="input" style={{width: 120}} value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="grid-4" style={{marginBottom: 28}}>
        {[
          { label: 'Gross Order Revenue', value: totals.revenue, color: '#dbeafe', textColor: '#1e40af' },
          { label: 'Total Deal Revenue', value: totals.deals, color: '#d1fae5', textColor: '#065f46' },
          { label: 'Total Platform Income', value: totals.fees, color: '#fef3c7', textColor: '#92400e' },
          { label: 'Supplier Payouts', value: totals.payout, color: '#fee2e2', textColor: '#991b1b' },
        ].map(({ label, value, color, textColor }) => (
          <div key={label} className="card stat-card" style={{background: color, border: 'none'}}>
            <div className="stat-value" style={{color: textColor}}>₹{Math.round(value).toLocaleString()}</div>
            <div className="stat-label" style={{color: textColor, opacity: .8}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Net Profit highlight */}
      <div className="card" style={{padding: 24, marginBottom: 28, background: '#0f172a', color: '#fff'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <div style={{fontSize: 13, opacity: .6, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px'}}>Net Platform Profit ({year})</div>
            <div style={{fontFamily: 'Syne', fontSize: 42, fontWeight: 800, color: '#f59e0b'}}>
              ₹{Math.round(totals.fees).toLocaleString()}
            </div>
            <div style={{fontSize: 13, opacity: .5, marginTop: 4}}>From {data?.monthly?.reduce((a,m) => a + m.orderCount, 0) || 0} paid orders</div>
          </div>
          <div style={{fontSize: 64}}>📈</div>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="card" style={{padding: 24, marginBottom: 28}}>
        <div className="card-title" style={{fontFamily:'Syne',fontSize:16,fontWeight:700,marginBottom:20}}>Monthly Breakdown — {year}</div>
        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} barSize={16}>
              <XAxis dataKey="month" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="Order Revenue" fill="#0f172a" radius={[3,3,0,0]} />
              <Bar dataKey="Platform Fees" fill="#f59e0b" radius={[3,3,0,0]} />
              <Bar dataKey="Deal Revenue" fill="#06b6d4" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly table */}
      <div className="card" style={{padding: 24}}>
        <div className="card-title" style={{fontFamily:'Syne',fontSize:16,fontWeight:700,marginBottom:16}}>Month-by-Month Details</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Order Revenue</th>
                <th>Platform Fee</th>
                <th>Deal Revenue</th>
                <th>Deal Fee</th>
                <th>Total Earnings</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => {
                const d = data?.dealMonthly?.find(r => r._id === i + 1) || {};
                const earnings = row['Platform Fees'];
                return (
                  <tr key={row.month}>
                    <td><strong>{row.month}</strong></td>
                    <td>₹{row['Order Revenue'].toLocaleString()}</td>
                    <td style={{color: 'var(--success)'}}>₹{((data?.monthly?.find(m=>m._id===i+1)?.platformFees)||0).toLocaleString()}</td>
                    <td>₹{row['Deal Revenue'].toLocaleString()}</td>
                    <td style={{color: 'var(--success)'}}>₹{(d.dealFees||0).toLocaleString()}</td>
                    <td><strong style={{color: earnings > 0 ? 'var(--success)' : 'var(--danger)'}}>₹{earnings.toLocaleString()}</strong></td>
                  </tr>
                );
              })}
              <tr style={{background:'#f8fafc', fontWeight:700}}>
                <td>TOTAL</td>
                <td>₹{Math.round(totals.revenue).toLocaleString()}</td>
                <td style={{color:'var(--success)'}}>₹{Math.round(totals.fees - (data?.dealMonthly?.reduce((a,m)=>a+m.dealFees,0)||0)).toLocaleString()}</td>
                <td>₹{Math.round(totals.deals).toLocaleString()}</td>
                <td style={{color:'var(--success)'}}>₹{Math.round(data?.dealMonthly?.reduce((a,m)=>a+m.dealFees,0)||0).toLocaleString()}</td>
                <td><strong style={{color:'var(--success)'}}>₹{Math.round(totals.fees).toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
