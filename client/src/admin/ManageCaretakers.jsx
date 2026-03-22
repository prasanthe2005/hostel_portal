import { useState, useEffect } from 'react';
import adminService from '../services/admin.service';

export default function ManageCaretakers() {
  const [caretakers, setCaretakers] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);
  const [expandedCaretaker, setExpandedCaretaker] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    hostel_id: ''
  });

  useEffect(() => {
    loadCaretakers();
    loadHostels();
  }, []);

  const loadCaretakers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getCaretakers();
      setCaretakers(data);
    } catch (err) {
      console.error('Error loading caretakers:', err);
      setError(err.message || 'Failed to load caretakers. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadHostels = async () => {
    try {
      const data = await adminService.getHostels();
      setHostels(data);
    } catch (err) {
      console.error('Failed to load hostels:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await adminService.createCaretaker(formData);
      setShowCredentials({
        name: result.caretaker.name,
        email: result.credentials.email,
        password: result.credentials.password,
        hostel_name: result.caretaker.hostel_name
      });
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', phone: '', hostel_id: '' });
      loadCaretakers();
    } catch (err) {
      alert(err.message || 'Failed to create caretaker');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete caretaker "${name}"?`)) return;
    try {
      await adminService.deleteCaretaker(id);
      loadCaretakers();
    } catch (err) {
      alert(err.message || 'Failed to delete caretaker');
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const initials = (name) =>
    name ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '??';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Caretakers</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add and manage hostel caretakers who handle complaints</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
          Add Caretaker
        </button>
      </div>

      {/* ── Error Alert ── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">error</span>
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* ── Stats Tile ── */}
      {caretakers.length > 0 && (
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">Total</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 16 }}>engineering</span>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{caretakers.length}</p>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-yellow-500 dark:text-yellow-400 uppercase tracking-wide mb-1">Pending</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400" style={{ fontSize: 16 }}>schedule</span>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {caretakers.reduce((s, c) => s + (c.pending_complaints || 0), 0)}
                </p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">In Progress</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 16 }}>construction</span>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {caretakers.reduce((s, c) => s + (c.in_progress_complaints || 0), 0)}
                </p>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wide mb-1">Completed</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: 16 }}>verified</span>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {caretakers.reduce((s, c) => s + (c.completed_complaints || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Caretakers Table ── */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Caretakers</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{caretakers.length} caretaker{caretakers.length !== 1 ? 's' : ''} registered</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                {['Caretaker', 'Phone', 'Assigned Hostel', 'Complaints', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {caretakers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center">
                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-3">engineering</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No caretakers found.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add your first caretaker using the button above.</p>
                  </td>
                </tr>
              ) : (
                caretakers.map((caretaker) => (
                  <>
                    <tr key={caretaker.caretaker_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">

                      {/* Name + email */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials(caretaker.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{caretaker.name}</p>
                            <p className="text-xs text-gray-400 truncate">{caretaker.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{caretaker.phone || 'N/A'}</td>

                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>apartment</span>
                          {caretaker.hostel_name || 'All Hostels'}
                        </span>
                      </td>

                      {/* Complaints count + expand */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {caretaker.total_complaints}
                          </span>
                          <button
                            onClick={() => setExpandedCaretaker(expandedCaretaker === caretaker.caretaker_id ? null : caretaker.caretaker_id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                              {expandedCaretaker === caretaker.caretaker_id ? 'expand_less' : 'expand_more'}
                            </span>
                            {expandedCaretaker === caretaker.caretaker_id ? 'Hide' : 'Details'}
                          </button>
                        </div>
                      </td>

                      {/* Delete */}
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleDelete(caretaker.caretaker_id, caretaker.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_remove</span>
                          Delete
                        </button>
                      </td>
                    </tr>

                    {/* ── Expanded Stats Row ── */}
                    {expandedCaretaker === caretaker.caretaker_id && (
                      <tr className="bg-gray-50/80 dark:bg-slate-900/50">
                        <td colSpan="5" className="px-5 py-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                              Complaint Statistics — {caretaker.name}
                            </p>

                            {/* Stats tiles */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg px-3 py-2.5">
                                <p className="text-xs font-semibold text-yellow-500 dark:text-yellow-400 uppercase tracking-wide mb-1">Pending</p>
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400" style={{ fontSize: 14 }}>schedule</span>
                                  <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">{caretaker.pending_complaints || 0}</p>
                                </div>
                              </div>
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-3 py-2.5">
                                <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">In Progress</p>
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 14 }}>construction</span>
                                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{caretaker.in_progress_complaints || 0}</p>
                                </div>
                              </div>
                              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg px-3 py-2.5">
                                <p className="text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wide mb-1">Resolved</p>
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400" style={{ fontSize: 14 }}>check_circle</span>
                                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{caretaker.resolved_complaints || 0}</p>
                                </div>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-3 py-2.5">
                                <p className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wide mb-1">Completed</p>
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: 14 }}>verified</span>
                                  <p className="text-xl font-bold text-green-900 dark:text-green-100">{caretaker.completed_complaints || 0}</p>
                                </div>
                              </div>
                              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg px-3 py-2.5">
                                <p className="text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wide mb-1">Reopened</p>
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-orange-600 dark:text-orange-400" style={{ fontSize: 14 }}>replay</span>
                                  <p className="text-xl font-bold text-orange-900 dark:text-orange-100">{caretaker.reopened_complaints || 0}</p>
                                </div>
                              </div>
                            </div>

                            {/* Performance summary */}
                            <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex flex-wrap items-center gap-5 text-sm">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-green-500" style={{ fontSize: 14 }}>trending_up</span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">Success Rate:</span>
                                <span className="font-semibold text-green-600 dark:text-green-400 text-xs">
                                  {caretaker.total_complaints > 0
                                    ? ((caretaker.completed_complaints || 0) / caretaker.total_complaints * 100).toFixed(1)
                                    : 0}%
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 14 }}>pending_actions</span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">Active:</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs">
                                  {(caretaker.pending_complaints || 0) + (caretaker.in_progress_complaints || 0)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-orange-500" style={{ fontSize: 14 }}>priority_high</span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">Needs Attention:</span>
                                <span className="font-semibold text-orange-600 dark:text-orange-400 text-xs">
                                  {caretaker.reopened_complaints || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {caretakers.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40">
            <p className="text-xs text-gray-400">{caretakers.length} caretaker{caretakers.length !== 1 ? 's' : ''} registered</p>
          </div>
        )}
      </section>

      {/* ── Add Caretaker Modal ── */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">

              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-b border-gray-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Caretaker</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Create login credentials for a new caretaker</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 14 }}>person</span>
                    Personal Info
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Assigned Hostel *</label>
                    <select
                      required
                      value={formData.hostel_id}
                      onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">— Select Hostel —</option>
                      {hostels.map((hostel) => (
                        <option key={hostel.hostel_id} value={hostel.hostel_id}>
                          {hostel.hostel_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 14 }}>lock</span>
                    Login Credentials
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="caretaker@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Password *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="Set a password"
                      />
                      <button
                        type="button"
                        onClick={generatePassword}
                        title="Generate random password"
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-600 text-sm transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>casino</span>
                      </button>
                    </div>
                  </div>
                </section>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                    Create Caretaker
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Credentials Modal ── */}
      {showCredentials && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: 18 }}>check_circle</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Caretaker Created</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Share these credentials with the caretaker</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Credentials section */}
                <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 14 }}>lock</span>
                    Login Credentials
                  </h4>
                  {[
                    { icon: 'person', label: 'Name', value: showCredentials.name },
                    { icon: 'mail', label: 'Email', value: showCredentials.email },
                    { icon: 'apartment', label: 'Hostel', value: showCredentials.hostel_name || 'All Hostels' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 py-1.5">
                      <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 py-1.5">
                    <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">key</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Password</p>
                      <p className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg mt-0.5 inline-block">
                        {showCredentials.password}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-1.5 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">login</span>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Login Instructions</p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Main login page → select "Staff" role</p>
                    </div>
                  </div>
                </section>

                {/* Warning */}
                <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <span className="material-symbols-outlined text-yellow-500 mt-0.5" style={{ fontSize: 18 }}>warning</span>
                  <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">
                    <strong>Important:</strong> Save these credentials now. The password will not be shown again.
                  </p>
                </div>

                <button
                  onClick={() => setShowCredentials(null)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                  OK, I've Noted the Credentials
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}