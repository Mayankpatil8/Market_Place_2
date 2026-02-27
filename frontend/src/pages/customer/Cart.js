import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { FiTrash2, FiShoppingCart, FiCreditCard } from 'react-icons/fi';

const LOAN_BANKS = [
  { id:'nordea', name:'Nordea Bank', rate:4.5, flag:'🇫🇮' },
  { id:'s_bank', name:'S-Bank', rate:5.2, flag:'🇫🇮' },
  { id:'deutsche_bank', name:'Deutsche Bank', rate:3.9, flag:'🇩🇪' },
];

const LOAN_THRESHOLD = 500;

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; } });
  const [address, setAddress] = useState({ street:'', city:'', state:'', country:'', pincode:'' });
  const [loading, setLoading] = useState(false);
  const [showLoan, setShowLoan] = useState(false);
  const [loanBank, setLoanBank] = useState('nordea');
  const [loanTerm, setLoanTerm] = useState(12);
  const [emiResult, setEmiResult] = useState(null);

  const updateQty = (id, qty) => {
    const updated = qty < 1 ? cart.filter(i => i._id !== id) : cart.map(i => i._id === id ? { ...i, qty } : i);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter(i => i._id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const itemPrice = (item) => (item.isOnSale && item.discountPrice) ? item.discountPrice : item.price;
  const total = cart.reduce((s, i) => s + itemPrice(i) * i.qty, 0);
  const loanEligible = total >= LOAN_THRESHOLD;

  const calcEmi = () => {
    const b = LOAN_BANKS.find(b => b.id === loanBank);
    const P = total, r = b.rate/100/12, n = Number(loanTerm);
    const emi = Math.ceil(P * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1));
    setEmiResult({ emi, total: emi*n, interest: emi*n - P, bankName: b.name, rate: b.rate });
  };

  const placeOrder = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (!address.street || !address.city || !address.pincode) return toast.error('Please fill shipping address');
    setLoading(true);
    try {
      await API.post('/orders', {
        items: cart.map(i => ({ product: i._id, quantity: i.qty })),
        shippingAddress: address,
        paymentMethod: 'online',
      });
      localStorage.removeItem('cart');
      setCart([]);
      toast.success('Order placed successfully! 🎉');
      navigate('/my-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally { setLoading(false); }
  };

  if (cart.length === 0) return (
    <div className="empty-state" style={{paddingTop:100}}>
      <div style={{fontSize:64}}>🛒</div>
      <h2 style={{marginTop:16,marginBottom:8}}>Your cart is empty</h2>
      <p style={{marginBottom:24}}>Discover industrial products from EU & Ukraine manufacturers</p>
      <Link to="/products" className="btn btn-accent">Browse Products</Link>
    </div>
  );

  return (
    <div style={{maxWidth:1000}}>
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>{cart.length} item(s) — Total: €{total.toLocaleString()}</p>
      </div>

      <div className="grid-2">
        {/* Cart items */}
        <div>
          {cart.map(item => {
            const price = itemPrice(item);
            return (
              <div key={item._id} className="card" style={{padding:16,marginBottom:14,display:'flex',gap:14}}>
                <div style={{width:72,height:72,borderRadius:8,background:'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0,overflow:'hidden'}}>
                  {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}}/> : '📦'}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,marginBottom:2,fontSize:14}}>{item.name}</div>
                  <div style={{fontSize:11,color:'var(--text-3)',marginBottom:6,display:'flex',gap:6,flexWrap:'wrap'}}>
                    {item.ceCertified && <span className="badge badge-blue" style={{fontSize:9}}>CE</span>}
                    {item.isoCertification && <span className="badge badge-green" style={{fontSize:9}}>ISO</span>}
                    {item.countryOfOrigin && <span style={{color:'var(--text-3)'}}>🏭 {item.countryOfOrigin}</span>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{display:'flex',alignItems:'center',border:'1px solid var(--border)',borderRadius:6}}>
                      <button className="btn btn-outline btn-sm" style={{border:'none',borderRadius:0,padding:'4px 10px'}} onClick={()=>updateQty(item._id, item.qty-1)}>−</button>
                      <span style={{padding:'0 10px',fontWeight:700,fontSize:14}}>{item.qty}</span>
                      <button className="btn btn-outline btn-sm" style={{border:'none',borderRadius:0,padding:'4px 10px'}} onClick={()=>updateQty(item._id, item.qty+1)}>+</button>
                    </div>
                    <div>
                      {item.isOnSale && item.discountPrice && <div style={{fontSize:10,color:'var(--text-3)',textDecoration:'line-through'}}>€{(item.price*item.qty).toLocaleString()}</div>}
                      <span style={{fontFamily:'Syne',fontWeight:800,color:'var(--accent)'}}>€{(price*item.qty).toLocaleString()}</span>
                    </div>
                    <button className="btn btn-sm" style={{background:'#fee2e2',color:'#991b1b',marginLeft:'auto'}} onClick={()=>removeItem(item._id)}><FiTrash2/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout */}
        <div>
          <div className="card" style={{padding:24,marginBottom:16}}>
            <h3 style={{fontFamily:'Syne',marginBottom:16}}>Shipping Address</h3>
            {[
              {key:'street', label:'Street Address'},
              {key:'city', label:'City'},
              {key:'state', label:'State / Region'},
              {key:'country', label:'Country'},
              {key:'pincode', label:'Postal Code'},
            ].map(f => (
              <div key={f.key} className="form-group" style={{marginBottom:10}}>
                <label className="input-label">{f.label}</label>
                <input className="input" placeholder={f.label} value={address[f.key]} onChange={e=>setAddress({...address,[f.key]:e.target.value})} />
              </div>
            ))}
          </div>

          <div className="card" style={{padding:24}}>
            <h3 style={{fontFamily:'Syne',marginBottom:16}}>Order Summary</h3>
            <div style={{borderBottom:'1px solid var(--border)',paddingBottom:12,marginBottom:12}}>
              {cart.map(i=>(
                <div key={i._id} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}>
                  <span style={{color:'var(--text-2)'}}>{i.name} × {i.qty}</span>
                  <span style={{fontWeight:600}}>€{(itemPrice(i)*i.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:14}}>
              <span style={{color:'var(--text-2)'}}>Subtotal</span>
              <span>€{total.toLocaleString()}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,fontSize:14}}>
              <span style={{color:'var(--text-2)'}}>Shipping</span>
              <span style={{color:'var(--green)',fontWeight:700}}>Free</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontFamily:'Syne',fontSize:22,fontWeight:800,marginBottom:16}}>
              <span>Total</span>
              <span style={{color:'var(--accent)'}}>€{total.toLocaleString()}</span>
            </div>

            {/* Loan option for orders >= €500 */}
            {loanEligible && (
              <div style={{marginBottom:16}}>
                <button className="btn btn-secondary btn-sm" style={{width:'100%',justifyContent:'center',marginBottom:8}} onClick={()=>setShowLoan(!showLoan)}>
                  <FiCreditCard /> {showLoan ? 'Hide' : 'Finance this order — EMI options'}
                </button>
                {showLoan && (
                  <div style={{background:'rgba(245,166,35,0.05)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:10,padding:14}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:'var(--accent)'}}>🏦 Order value €{total.toLocaleString()} — Finance via partner banks</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                      <div>
                        <label style={{fontSize:10,color:'var(--text-3)',display:'block',marginBottom:4,fontWeight:700}}>Bank</label>
                        <select className="input" style={{fontSize:12}} value={loanBank} onChange={e=>setLoanBank(e.target.value)}>
                          {LOAN_BANKS.map(b=><option key={b.id} value={b.id}>{b.flag} {b.name} ({b.rate}%)</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{fontSize:10,color:'var(--text-3)',display:'block',marginBottom:4,fontWeight:700}}>Term</label>
                        <select className="input" style={{fontSize:12}} value={loanTerm} onChange={e=>setLoanTerm(e.target.value)}>
                          {[6,12,18,24,36,48,60].map(t=><option key={t} value={t}>{t} months</option>)}
                        </select>
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{marginBottom:10}} onClick={calcEmi}>Calculate EMI</button>
                    {emiResult && (
                      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                        {[['Monthly EMI',`€${emiResult.emi}`,'var(--green)'],['Total',`€${emiResult.total}`,'var(--text)'],['Interest',`€${emiResult.interest}`,'var(--accent)']].map(([l,v,c])=>(
                          <div key={l} style={{textAlign:'center',padding:8,background:'var(--surface-2)',borderRadius:8}}>
                            <div style={{fontSize:9,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',marginBottom:4}}>{l}</div>
                            <div style={{fontWeight:800,color:c,fontSize:14}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{fontSize:10,color:'var(--text-3)',marginTop:10,textAlign:'center'}}>Apply directly with your bank · No personal data shared</div>
                  </div>
                )}
              </div>
            )}

            <button className="btn btn-accent" style={{width:'100%',justifyContent:'center'}} disabled={loading} onClick={placeOrder}>
              {loading ? 'Placing Order…' : '🛒 Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
