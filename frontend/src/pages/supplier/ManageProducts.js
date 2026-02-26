import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const CATEGORIES = ['motors', 'semiconductors', 'defence', 'electronics', 'mechanical', 'other'];
const EMPTY = { name:'', description:'', category:'motors', price:'', stock:'', unit:'piece', minOrderQty:1, tags:'', isRestricted:false };

export default function ManageProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = () => {
    API.get('/products?limit=50').then(({ data }) => {
      // Filter by current supplier in real app — API already filters via token
      setProducts(data.products.filter(p => p.supplier?._id === user._id || p.supplier === user._id));
      setTotal(data.total);
    });
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error('Name and price required');
    setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) };
      if (editId) {
        await API.put(`/products/${editId}`, payload);
        toast.success('Product updated');
      } else {
        await API.post('/products', payload);
        toast.success('Product created');
      }
      setForm(EMPTY); setEditId(null); setShowForm(false); fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleEdit = (p) => {
    setForm({ name:p.name, description:p.description, category:p.category, price:p.price, stock:p.stock, unit:p.unit, minOrderQty:p.minOrderQty, tags:(p.tags||[]).join(', '), isRestricted:p.isRestricted });
    setEditId(p._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await API.delete(`/products/${id}`); toast.success('Deleted'); fetchProducts(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{maxWidth:1100}}>
      <div className="page-header flex-between">
        <div><h1>My Products</h1><p>Manage your listed products</p></div>
        <button className="btn btn-accent" onClick={()=>{setForm(EMPTY);setEditId(null);setShowForm(!showForm);}}>
          <FiPlus /> {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{padding:28,marginBottom:28}}>
          <h3 style={{fontFamily:'Syne',marginBottom:20}}>{editId?'Edit Product':'New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label className="input-label">Product Name *</label><input className="input" name="name" value={form.name} onChange={handleChange} /></div>
              <div className="form-group"><label className="input-label">Category *</label>
                <select className="input" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="input-label">Description</label><textarea className="input" name="description" rows={3} value={form.description} onChange={handleChange} /></div>
            <div className="form-row">
              <div className="form-group"><label className="input-label">Price (₹) *</label><input className="input" type="number" name="price" value={form.price} onChange={handleChange} /></div>
              <div className="form-group"><label className="input-label">Stock Quantity</label><input className="input" type="number" name="stock" value={form.stock} onChange={handleChange} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="input-label">Unit</label><input className="input" name="unit" value={form.unit} onChange={handleChange} /></div>
              <div className="form-group"><label className="input-label">Min. Order Qty</label><input className="input" type="number" name="minOrderQty" value={form.minOrderQty} onChange={handleChange} /></div>
            </div>
            <div className="form-group"><label className="input-label">Tags (comma separated)</label><input className="input" name="tags" placeholder="motor, 3-phase, 5HP" value={form.tags} onChange={handleChange} /></div>
            <div className="form-group" style={{display:'flex',alignItems:'center',gap:10}}>
              <input type="checkbox" id="restricted" name="isRestricted" checked={form.isRestricted} onChange={handleChange} />
              <label htmlFor="restricted" style={{fontSize:14,fontWeight:500}}>🛡️ Restricted Product (Defence grade)</label>
            </div>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editId?'Update Product':'Create Product'}</button>
          </form>
        </div>
      )}

      <div className="card" style={{padding:24}}>
        {products.length === 0 ? (
          <div className="empty-state"><p>No products yet. Click "Add Product" to get started.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Views</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong>{p.isRestricted && <span title="Defence grade" style={{marginLeft:6}}>🛡️</span>}</td>
                    <td><span className="badge badge-blue">{p.category}</span></td>
                    <td>₹{p.price?.toLocaleString()}</td>
                    <td><span style={{color: p.stock < 10 ? 'var(--danger)' : 'inherit', fontWeight: p.stock < 10 ? 700 : 400}}>{p.stock}</span></td>
                    <td>{p.totalSold || 0}</td>
                    <td>{p.views || 0}</td>
                    <td><span className={`badge badge-${p.isActive?'green':'red'}`}>{p.isActive?'Active':'Hidden'}</span></td>
                    <td>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn btn-outline btn-sm" onClick={()=>handleEdit(p)}><FiEdit2/></button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(p._id)}><FiTrash2/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
