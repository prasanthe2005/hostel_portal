import { useState, useEffect } from 'react';
import adminService from '../services/admin.service';

export default function ManageCaretakers() {
  const [caretakers, setCaretakers] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);
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
      setError(''); // Clear previous errors
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
      
      // Show credentials to admin
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Caretakers
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add and manage hostel caretakers who handle complaints
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Caretaker
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Caretakers List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Assigned Hostel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Complaints
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {caretakers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No caretakers found. Add your first caretaker.
                </td>
              </tr>
            ) : (
              caretakers.map((caretaker) => (
                <tr key={caretaker.caretaker_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {caretaker.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {caretaker.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {caretaker.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {caretaker.hostel_name || 'All Hostels'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {caretaker.resolved_complaints}/{caretaker.total_complaints} resolved
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(caretaker.caretaker_id, caretaker.name)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Caretaker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Caretaker
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="caretaker@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Generate random password"
                  >
                    🎲
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Hostel
                </label>
                <select
                  value={formData.hostel_id}
                  onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Hostels</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.hostel_id} value={hostel.hostel_id}>
                      {hostel.hostel_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Caretaker
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4">
              ✅ Caretaker Created Successfully!
            </h2>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-3">
                📧 Login Credentials - Share these with the caretaker:
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">{showCredentials.name}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">{showCredentials.email}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Password:</span>
                  <span className="ml-2 font-mono font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {showCredentials.password}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Hostel:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                    {showCredentials.hostel_name || 'All Hostels'}
                  </span>
                </div>
                <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                  <span className="text-gray-600 dark:text-gray-400">Login Instructions:</span>
                  <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">
                    Main login page, select "Staff" role
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                ⚠️ <strong>Important:</strong> Save these credentials now! The password will not be shown again.
              </p>
            </div>

            <button
              onClick={() => setShowCredentials(null)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              OK, I've Noted the Credentials
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
