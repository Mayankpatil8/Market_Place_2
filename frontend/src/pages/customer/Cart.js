import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; } });
  const [address, setAddress] = useState({ street:'', city:'', state:'', country:'India', pincode:'' });
  const [loading, setLoading] = useState(false);

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

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

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
      <p style={{marginBottom:24}}>Discover industrial products and add them to your cart</p>
      <Link to="/products" className="btn btn-accent">Browse Products</Link>
    </div>
  );

  return (
    <div style={{maxWidth:1000}}>
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>{cart.length} item(s) — Total: ₹{total.toLocaleString()}</p>
      </div>

      <div className="grid-2">
        {/* Cart items */}
        <div>
          {cart.map(item => (
            <div key={item._id} className="card" style={{padding:16,marginBottom:14,display:'flex',gap:14}}>
              <div style={{width:72,height:72,borderRadius:8,background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>
                {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}}/> : '📦'}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,marginBottom:4}}>{item.name}</div>
                <div style={{fontSize:13,color:'var(--muted)',marginBottom:8}}>₹{item.price?.toLocaleString()} per {item.unit}</div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{display:'flex',alignItems:'center',border:'1px solid var(--border)',borderRadius:6}}>
                    <button className="btn btn-outline btn-sm" style={{border:'none',borderRadius:0,padding:'4px 10px'}} onClick={()=>updateQty(item._id, item.qty-1)}>−</button>
                    <span style={{padding:'0 10px',fontWeight:700,fontSize:14}}>{item.qty}</span>
                    <button className="btn btn-outline btn-sm" style={{border:'none',borderRadius:0,padding:'4px 10px'}} onClick={()=>updateQty(item._id, item.qty+1)}>+</button>
                  </div>
                  <span style={{fontFamily:'Syne',fontWeight:800}}>₹{(item.price*item.qty).toLocaleString()}</span>
                  <button className="btn btn-sm" style={{background:'#fee2e2',color:'#991b1b',marginLeft:'auto'}} onClick={()=>removeItem(item._id)}><FiTrash2/></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div>
          <div className="card" style={{padding:24,marginBottom:16}}>
            <h3 style={{fontFamily:'Syne',marginBottom:16}}>Shipping Address</h3>
            {['street','city','state','pincode'].map(f => (
              <div key={f} className="form-group">
                <label className="input-label">{f.charAt(0).toUpperCase()+f.slice(1)}</label>
                <input className="input" placeholder={f} value={address[f]} onChange={e=>setAddress({...address,[f]:e.target.value})} />
              </div>
            ))}
          </div>

          <div className="card" style={{padding:24}}>
            <h3 style={{fontFamily:'Syne',marginBottom:16}}>Order Summary</h3>
            <div style={{borderBottom:'1px solid var(--border)',paddingBottom:12,marginBottom:12}}>
              {cart.map(i=>(
                <div key={i._id} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}>
                  <span>{i.name} × {i.qty}</span>
                  <span>₹{(i.price*i.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{color:'var(--muted)'}}>Subtotal</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <span style={{color:'var(--muted)'}}>Shipping</span>
              <span style={{color:'var(--success)'}}>Free</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontFamily:'Syne',fontSize:20,fontWeight:800,marginBottom:20}}>
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <button className="btn btn-accent" style={{width:'100%',justifyContent:'center'}} disabled={loading} onClick={placeOrder}>
              {loading ? 'Placing Order...' : '🛒 Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
