import { useEffect, useState } from 'react';
import adminService from '../services/admin.service';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  hostel_id: ''
};

export default function ManageWardens() {
  const [wardens, setWardens] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWarden, setSelectedWarden] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [credentialsModal, setCredentialsModal] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const hostelsRes = await adminService.getHostels(true);
      setHostels(hostelsRes || []);
    } catch (err) {
      setHostels([]);
      setError(err.message || 'Failed to load hostels');
    }

    try {
      const wardensRes = await adminService.getWardens();
      setWardens(wardensRes || []);
    } catch (err) {
      setWardens([]);
      setError((prev) => {
        const current = typeof prev === 'string' ? prev : '';
        const next = err.message || 'Failed to load wardens';
        return current ? `${current} | ${next}` : next;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setFormData(emptyForm);
    setShowAddModal(true);
  };

  const openEditModal = (warden) => {
    setSelectedWarden(warden);
    setFormData({
      name: warden.name || '',
      email: warden.email || '',
      password: '',
      phone: warden.phone || '',
      hostel_id: warden.hostel_id || ''
    });
    setShowEditModal(true);
  };

  const handleAddWarden = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        hostel_id: Number(formData.hostel_id)
      };
      const result = await adminService.createWarden(payload);
      setShowAddModal(false);
      setCredentialsModal({
        email: result?.credentials?.email,
        password: result?.credentials?.password,
        name: result?.warden?.name,
        hostel_name: result?.warden?.hostel_name
      });
      setFormData(emptyForm);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to create warden');
    }
  };

  const handleEditWarden = async (e) => {
    e.preventDefault();
    if (!selectedWarden) return;

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        hostel_id: Number(formData.hostel_id)
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      await adminService.updateWarden(selectedWarden.warden_id, payload);
      setShowEditModal(false);
      setSelectedWarden(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update warden');
    }
  };

  const handleDeleteWarden = async (warden) => {
    const confirmed = confirm(`Delete warden "${warden.name}"?`);
    if (!confirmed) return;

    try {
      await adminService.deleteWarden(warden.warden_id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete warden');
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i += 1) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password }));
  };

  const initials = (name) =>
    name ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '??';

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedWarden(null);
    setFormData(emptyForm);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isModalOpen = showAddModal || showEditModal;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Warden Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add, edit, delete and reassign wardens by hostel</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
          Add Warden
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

      {/* ── Stats Tiles ── */}
      {wardens.length > 0 && (
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">Total Wardens</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 16 }}>shield_person</span>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{wardens.length}</p>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wide mb-1">Hostels Covered</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: 16 }}>apartment</span>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {new Set(wardens.map(w => w.hostel_id).filter(Boolean)).size}
                </p>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wide mb-1">Total Students</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400" style={{ fontSize: 16 }}>group</span>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {wardens.reduce((s, w) => s + (w.assigned_students || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Wardens Table ── */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Wardens</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{wardens.length} warden{wardens.length !== 1 ? 's' : ''} registered</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                {['Warden', 'Phone', 'Assigned Hostel', 'Students', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {wardens.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center">
                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-3">shield_person</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No wardens found.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add your first warden using the button above.</p>
                  </td>
                </tr>
              ) : (
                wardens.map((warden) => (
                  <tr key={warden.warden_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">

                    {/* Name + email avatar */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {initials(warden.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{warden.name}</p>
                          <p className="text-xs text-gray-400 truncate">{warden.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{warden.phone || 'N/A'}</td>

                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>apartment</span>
                        {warden.hostel_name || 'N/A'}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 14 }}>group</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{warden.assigned_students || 0}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(warden)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteWarden(warden)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_remove</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {wardens.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40">
            <p className="text-xs text-gray-400">{wardens.length} warden{wardens.length !== 1 ? 's' : ''} registered</p>
          </div>
        )}
      </section>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">

              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-b border-gray-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {showAddModal ? 'Add Warden' : 'Edit Warden'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {showAddModal ? 'Create login credentials for a new warden' : `Editing: ${selectedWarden?.name}`}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={showAddModal ? handleAddWarden : handleEditWarden} className="p-6 space-y-4">

                {/* Personal Info section */}
                <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 14 }}>person</span>
                    Personal Info
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Name *</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Assigned Hostel *</label>
                    <select
                      required
                      value={formData.hostel_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hostel_id: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">— Select Hostel —</option>
                      {hostels.map((hostel) => (
                        <option key={hostel.hostel_id} value={hostel.hostel_id}>
                          {hostel.hostel_name}
                        </option>
                      ))}
                    </select>
                    {hostels.length === 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>
                        No hostels found. Please create a hostel first.
                      </p>
                    )}
                  </div>
                </section>

                {/* Credentials section */}
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
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="warden@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                      Password {showAddModal ? '*' : '(leave blank to keep current)'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required={showAddModal}
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder={showAddModal ? 'Set a password' : 'Leave blank to keep current'}
                      />
                      {showAddModal && (
                        <button
                          type="button"
                          onClick={generatePassword}
                          title="Generate random password"
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>casino</span>
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                {/* Footer buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={hostels.length === 0}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {showAddModal ? 'person_add' : 'save'}
                    </span>
                    {showAddModal ? 'Create Warden' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Credentials Modal ── */}
      {credentialsModal && (
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
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Warden Created</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Share these credentials with {credentialsModal.name}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Credentials detail rows */}
                <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4 space-y-0">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 14 }}>lock</span>
                    Login Credentials
                  </h4>

                  {[
                    { icon: 'person', label: 'Name', value: credentialsModal.name },
                    { icon: 'apartment', label: 'Hostel', value: credentialsModal.hostel_name || 'N/A' },
                    { icon: 'mail', label: 'Email', value: credentialsModal.email },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 py-2">
                      <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{value}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-start gap-3 py-2">
                    <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">key</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Password</p>
                      <p className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg mt-0.5 inline-block">
                        {credentialsModal.password}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-2 pt-3 border-t border-gray-200 dark:border-slate-700">
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
                  onClick={() => setCredentialsModal(null)}
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