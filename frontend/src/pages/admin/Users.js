import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { FiSearch, FiCheck, FiX } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    API.get(`/admin/users?${params}`).then(({ data }) => {
      setUsers(data.users); setTotal(data.total); setLoading(false);
    });
  };

  useEffect(() => { fetchUsers(); }, [page, role]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const toggleActive = async (id, current) => {
    try {
      await API.put(`/admin/users/${id}`, { isActive: !current });
      toast.success('User status updated');
      fetchUsers();
    } catch { toast.error('Failed to update'); }
  };

  const toggleVerified = async (id, current) => {
    try {
      await API.put(`/admin/users/${id}`, { 'supplierInfo.verified': !current });
      toast.success('Supplier verification updated');
      fetchUsers();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div style={{maxWidth: 1100}}>
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage all platform users — customers, suppliers, and admins</p>
      </div>

      <div className="card" style={{padding: 24}}>
        <div className="flex-between" style={{marginBottom: 20, gap: 12}}>
          <form onSubmit={handleSearch} style={{display:'flex',gap:10,flex:1}}>
            <div style={{position:'relative',flex:1}}>
              <FiSearch style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}} />
              <input className="input" style={{paddingLeft:36}} placeholder="Search by name, email, company..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
          <select className="input" style={{width:150}} value={role} onChange={e=>{setRole(e.target.value);setPage(1);}}>
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="supplier">Supplier</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div style={{fontSize:13,color:'var(--muted)',marginBottom:16}}>Total: <strong>{total}</strong> users</div>

        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Company</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.role==='admin'?'red':u.role==='supplier'?'green':'blue'}`}>{u.role}</span>
                    </td>
                    <td>{u.company || '—'}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge badge-${u.isActive?'green':'red'}`}>{u.isActive?'Active':'Inactive'}</span>
                    </td>
                    <td>
                      <div style={{display:'flex',gap:8}}>
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => toggleActive(u._id, u.isActive)}
                        >
                          {u.isActive ? <FiX /> : <FiCheck />}
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                        {u.role === 'supplier' && (
                          <button
                            className={`btn btn-sm ${u.supplierInfo?.verified ? 'btn-outline' : 'btn-accent'}`}
                            onClick={() => toggleVerified(u._id, u.supplierInfo?.verified)}
                          >
                            {u.supplierInfo?.verified ? 'Unverify' : '✓ Verify'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'center'}}>
          <button className="btn btn-outline btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
          <span style={{fontSize:14,alignSelf:'center'}}>Page {page}</span>
          <button className="btn btn-outline btn-sm" disabled={users.length<20} onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
