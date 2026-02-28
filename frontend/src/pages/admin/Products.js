import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { FiSearch, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    API.get(`/products?${params}`).then(({ data }) => {
      setProducts(data.products);
      setTotal(data.total);
      setLoading(false);
    });
  };

  useEffect(() => { fetchProducts(); }, [page, category]);

  const toggleActive = async (id, current) => {
    try {
      await API.put(`/products/${id}`, { isActive: !current });
      toast.success('Product status updated');
      fetchProducts();
    } catch { toast.error('Failed'); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      <div className="page-header flex-between">
        <div><h1>Product Management</h1><p>All products across platform — {total} total</p></div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input className="input" style={{ paddingLeft: 36 }} placeholder="Search products…" value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchProducts()} />
          </div>
          <select className="input" style={{ width: 160 }} value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {['motors', 'semiconductors', 'defence', 'electronics', 'mechanical', 'other'].map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => fetchProducts()}>Search</button>
        </div>

        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Product</th><th>Supplier</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Views</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.name}</strong>
                      {p.isRestricted && <span className="badge badge-red" style={{ marginLeft: 6, fontSize: 9 }}>🛡️ Restricted</span>}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{p.supplier?.company || p.supplier?.name}</td>
                    <td><span className="badge badge-gray">{p.category}</span></td>
                    <td>€{p.price?.toLocaleString()}</td>
                    <td style={{ color: p.stock < 10 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>{p.stock}</td>
                    <td>{p.totalSold || 0}</td>
                    <td>{p.views || 0}</td>
                    <td><span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Active' : 'Hidden'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => toggleActive(p._id, p.isActive)} title={p.isActive ? 'Deactivate' : 'Activate'}>
                          {p.isActive ? <FiToggleRight style={{ color: 'var(--green)', fontSize: 20 }} /> : <FiToggleLeft style={{ color: 'var(--text-3)', fontSize: 20 }} />}
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => deleteProduct(p._id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Page {page} of {Math.ceil(total / 20)}</span>
          <button className="btn btn-secondary btn-sm" disabled={products.length < 20} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
    </div>
  );
}
