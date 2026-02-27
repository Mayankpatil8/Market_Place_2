import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiShield, FiTag, FiInfo } from 'react-icons/fi';

const CATEGORIES = ['motors', 'semiconductors', 'defence', 'electronics', 'mechanical', 'automation', 'hydraulics', 'sensors', 'other'];

const EMPTY = {
  // Basic
  name:'', description:'', category:'motors', price:'', stock:'', unit:'piece', minOrderQty:1, tags:'', isRestricted:false,
  // Images
  images:'',
  // Technical
  technicalSpec:'', countryOfOrigin:'', countryCode:'',
  // Certifications
  isoCertification:'', ceCertified:false, msdsCertified:false, msdsUrl:'',
  certifications:'',
  // Warranty
  warrantyTerms:'', warrantyMonths:12,
  // Discount / sale
  discountPrice:'', discountValidUntil:'',
  // Logistics
  weight:'', hsCode:'',
};

function Section({ title, icon: Icon, children }) {
  return (
    <div style={{marginBottom:24}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>
        {Icon && <Icon style={{color:'var(--accent)',fontSize:15}} />}
        <span style={{fontFamily:'Syne',fontWeight:700,fontSize:14}}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function ManageProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = () => {
    API.get('/products?limit=100').then(({ data }) => {
      setProducts((data.products || []).filter(p => p.supplier?._id === user._id || p.supplier === user._id));
    }).catch(() => {});
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name) return toast.error('Product name required');
    if (!form.price || Number(form.price) < 200) return toast.error('Price must be at least €200');
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        minOrderQty: Number(form.minOrderQty) || 1,
        warrantyMonths: Number(form.warrantyMonths) || 12,
        weight: form.weight ? Number(form.weight) : undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        images: form.images ? form.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
        certifications: form.certifications ? form.certifications.split(',').map(c => c.trim()).filter(Boolean) : [],
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        discountValidUntil: form.discountValidUntil || undefined,
      };
      if (editId) {
        await API.put('/products/' + editId, payload);
        toast.success('Product updated ✓');
      } else {
        await API.post('/products', payload);
        toast.success('Product listed ✓');
      }
      setForm(EMPTY); setEditId(null); setShowForm(false); fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving product'); }
    finally { setLoading(false); }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name || '', description: p.description || '', category: p.category || 'motors',
      price: p.price || '', stock: p.stock || '', unit: p.unit || 'piece', minOrderQty: p.minOrderQty || 1,
      tags: (p.tags || []).join(', '), isRestricted: p.isRestricted || false,
      images: (p.images || []).join('\n'),
      technicalSpec: p.technicalSpec || '', countryOfOrigin: p.countryOfOrigin || '', countryCode: p.countryCode || '',
      isoCertification: p.isoCertification || '', ceCertified: p.ceCertified || false,
      msdsCertified: p.msdsCertified || false, msdsUrl: p.msdsUrl || '',
      certifications: (p.certifications || []).join(', '),
      warrantyTerms: p.warrantyTerms || '', warrantyMonths: p.warrantyMonths || 12,
      discountPrice: p.discountPrice || '', discountValidUntil: p.discountValidUntil ? p.discountValidUntil.slice(0,10) : '',
      weight: p.weight || '', hsCode: p.hsCode || '',
    });
    setEditId(p._id); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await API.delete('/products/' + id); toast.success('Deleted'); fetchProducts(); }
    catch { toast.error('Failed to delete'); }
  };

  const Label = ({ children, hint }) => (
    <label className="input-label" style={{display:'flex',alignItems:'center',gap:6}}>
      {children}
      {hint && <span title={hint} style={{cursor:'help',color:'var(--text-3)',fontSize:11}}><FiInfo /></span>}
    </label>
  );

  return (
    <div style={{maxWidth:1100}}>
      <div className="page-header flex-between">
        <div><h1>My Products</h1><p>Manage your listings — All prices in EUR, minimum €200</p></div>
        <button className="btn btn-accent" onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(!showForm); }}>
          <FiPlus /> {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{padding:28,marginBottom:28}}>
          <h3 style={{fontFamily:'Syne',marginBottom:24,fontSize:18}}>{editId ? '✏️ Edit Product' : '➕ New Product Listing'}</h3>
          <form onSubmit={handleSubmit}>

            {/* Basic Info */}
            <Section title="Basic Information" icon={FiInfo}>
              <div className="form-row">
                <div className="form-group">
                  <Label>Product Name *</Label>
                  <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. 3-Phase Induction Motor 11kW IE3" required />
                </div>
                <div className="form-group">
                  <Label>Category *</Label>
                  <select className="input" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <Label>Description *</Label>
                <textarea className="input" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Detailed product description for buyers…" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Label hint="Must be ≥ €200">Price (€) *</Label>
                  <input className="input" type="number" name="price" min="200" value={form.price} onChange={handleChange} placeholder="e.g. 2850" required />
                </div>
                <div className="form-group">
                  <Label>Stock Quantity</Label>
                  <input className="input" type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="0" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Label>Unit</Label>
                  <input className="input" name="unit" value={form.unit} onChange={handleChange} placeholder="piece, reel, unit, set…" />
                </div>
                <div className="form-group">
                  <Label>Min. Order Qty</Label>
                  <input className="input" type="number" name="minOrderQty" min="1" value={form.minOrderQty} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <Label hint="Comma-separated keywords">Tags</Label>
                <input className="input" name="tags" value={form.tags} onChange={handleChange} placeholder="motor, 3-phase, IE3, 11kW, induction" />
              </div>
            </Section>

            {/* Product Images */}
            <Section title="Product Images" icon={FiTag}>
              <div className="form-group">
                <Label hint="One URL per line">Image URLs (one per line)</Label>
                <textarea className="input" name="images" rows={3} value={form.images} onChange={handleChange} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
                {form.images && form.images.split('\n').filter(Boolean).length > 0 && (
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
                    {form.images.split('\n').filter(Boolean).map((url,i) => (
                      <img key={i} src={url.trim()} alt={`Preview ${i+1}`} style={{width:72,height:72,objectFit:'cover',borderRadius:8,border:'1px solid var(--border)'}} onError={e=>e.target.style.display='none'} />
                    ))}
                  </div>
                )}
              </div>
            </Section>

            {/* Technical Specifications */}
            <Section title="Technical Specification" icon={FiInfo}>
              <div className="form-group">
                <Label hint="Key specs formatted as text, e.g. Power: 11kW | Voltage: 400V | Speed: 1450rpm">Technical Specification</Label>
                <textarea className="input" name="technicalSpec" rows={4} value={form.technicalSpec} onChange={handleChange} placeholder="Power: 11kW | Voltage: 400V/690V | Speed: 1450rpm | Frame: 160M | IP Class: IP55 | Insulation: Class F" style={{fontFamily:'monospace',fontSize:12}} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Label>Country of Origin</Label>
                  <input className="input" name="countryOfOrigin" value={form.countryOfOrigin} onChange={handleChange} placeholder="e.g. Germany" />
                </div>
                <div className="form-group">
                  <Label>Country Code (ISO 2)</Label>
                  <input className="input" name="countryCode" value={form.countryCode} onChange={handleChange} placeholder="DE, FR, PL, UA…" maxLength={2} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Label>Weight (kg)</Label>
                  <input className="input" type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="0.5" />
                </div>
                <div className="form-group">
                  <Label hint="Harmonised System tariff code for customs">HS Code (Customs)</Label>
                  <input className="input" name="hsCode" value={form.hsCode} onChange={handleChange} placeholder="8501520000" />
                </div>
              </div>
            </Section>

            {/* Certifications */}
            <Section title="Certifications & Compliance" icon={FiShield}>
              <div className="form-row">
                <div className="form-group">
                  <Label hint="e.g. ISO 9001:2015">ISO Certification</Label>
                  <input className="input" name="isoCertification" value={form.isoCertification} onChange={handleChange} placeholder="ISO 9001:2015" />
                </div>
                <div className="form-group">
                  <Label>Additional Certifications</Label>
                  <input className="input" name="certifications" value={form.certifications} onChange={handleChange} placeholder="RoHS, REACH, ATEX, MIL-SPEC…" />
                </div>
              </div>
              <div style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:8}}>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14}}>
                  <input type="checkbox" name="ceCertified" checked={form.ceCertified} onChange={handleChange} />
                  🔵 <strong>CE Certified</strong> — EU conformity mark
                </label>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14}}>
                  <input type="checkbox" name="msdsCertified" checked={form.msdsCertified} onChange={handleChange} />
                  🟣 <strong>MSDS/SDS Available</strong> — Material Safety Data Sheet
                </label>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14}}>
                  <input type="checkbox" name="isRestricted" checked={form.isRestricted} onChange={handleChange} />
                  🛡️ <strong>Defence Grade</strong> — Restricted product
                </label>
              </div>
              {form.msdsCertified && (
                <div className="form-group">
                  <Label>MSDS Document URL</Label>
                  <input className="input" name="msdsUrl" value={form.msdsUrl} onChange={handleChange} placeholder="https://example.com/msds.pdf" />
                </div>
              )}
            </Section>

            {/* Warranty */}
            <Section title="Warranty Terms" icon={FiInfo}>
              <div className="form-group">
                <Label>Warranty Description</Label>
                <textarea className="input" name="warrantyTerms" rows={2} value={form.warrantyTerms} onChange={handleChange} placeholder="e.g. 24 months against manufacturing defects. On-site warranty available in DE, FR, PL." />
              </div>
              <div className="form-group" style={{maxWidth:200}}>
                <Label>Warranty Duration (months)</Label>
                <input className="input" type="number" name="warrantyMonths" min="0" value={form.warrantyMonths} onChange={handleChange} />
              </div>
            </Section>

            {/* Discount / Sale */}
            <Section title="Discount / Sale Price (30-day window)" icon={FiTag}>
              <div style={{padding:'10px 14px',background:'rgba(245,166,35,0.07)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:8,fontSize:12,color:'var(--text-2)',marginBottom:14}}>
                💡 Set a discount price valid for up to 30 days. Sale badge will appear automatically on the product card.
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Label hint="Must be less than regular price">Sale Price (€)</Label>
                  <input className="input" type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} placeholder="Leave blank for no discount" min="200" />
                </div>
                <div className="form-group">
                  <Label>Sale Ends On</Label>
                  <input className="input" type="date" name="discountValidUntil" value={form.discountValidUntil} onChange={handleChange}
                    min={new Date().toISOString().slice(0,10)}
                    max={new Date(Date.now()+30*24*3600000).toISOString().slice(0,10)} />
                </div>
              </div>
              {form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
                <div style={{padding:'8px 14px',background:'rgba(239,68,68,0.07)',borderRadius:8,fontSize:12,color:'#ef4444',fontWeight:700}}>
                  🔥 Discount: {Math.round((1 - form.discountPrice/form.price)*100)}% off — buyers will see both prices
                </div>
              )}
            </Section>

            <div style={{display:'flex',gap:12}}>
              <button className="btn btn-accent" type="submit" disabled={loading}>{loading ? 'Saving…' : editId ? '✓ Update Product' : '✓ List Product'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Product table */}
      <div className="card" style={{padding:24}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <h3 style={{fontFamily:'Syne',fontSize:16,margin:0}}>Listed Products ({products.length})</h3>
        </div>
        {products.length === 0 ? (
          <div className="empty-state">
            <p>No products listed yet.</p>
            <button className="btn btn-accent btn-sm" style={{marginTop:12}} onClick={() => { setShowForm(true); window.scrollTo({top:0,behavior:'smooth'}); }}>+ Add Your First Product</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price (€)</th>
                  <th>Sale</th>
                  <th>Stock</th>
                  <th>Compliance</th>
                  <th>Origin</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{width:36,height:36,objectFit:'cover',borderRadius:6,flexShrink:0}} onError={e=>e.target.style.display='none'} />}
                        <div>
                          <strong style={{fontSize:13}}>{p.name}</strong>
                          {p.warrantyMonths > 0 && <div style={{fontSize:10,color:'var(--text-3)'}}>🔧 {p.warrantyMonths}m warranty</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{p.category}</span></td>
                    <td style={{fontWeight:700,color:'var(--accent)'}}>€{p.price?.toLocaleString()}</td>
                    <td>
                      {p.isOnSale && p.discountPrice
                        ? <span style={{color:'#ef4444',fontWeight:700,fontSize:12}}>€{p.discountPrice?.toLocaleString()} <span style={{fontSize:9,fontWeight:800,background:'#fee2e2',padding:'1px 4px',borderRadius:3}}>-{p.discountPercent}%</span></span>
                        : <span style={{color:'var(--text-3)',fontSize:12}}>—</span>}
                    </td>
                    <td><span style={{color:p.stock<10?'var(--danger)':'inherit',fontWeight:p.stock<10?700:400}}>{p.stock}</span></td>
                    <td>
                      <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                        {p.ceCertified && <span className="badge badge-blue" style={{fontSize:9}}>CE</span>}
                        {p.isoCertification && <span className="badge badge-green" style={{fontSize:9}}>ISO</span>}
                        {p.msdsCertified && <span className="badge badge-purple" style={{fontSize:9}}>MSDS</span>}
                        {p.isRestricted && <span title="Defence grade" style={{fontSize:12}}>🛡️</span>}
                      </div>
                    </td>
                    <td style={{fontSize:12,color:'var(--text-3)'}}>{p.countryOfOrigin || '—'}</td>
                    <td style={{color:'var(--text-3)'}}>{p.views || 0}</td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)}><FiEdit2 /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
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
