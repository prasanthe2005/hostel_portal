import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaint.service';
import StudentLayout from '../../components/StudentLayout';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import tabSession from '../../utils/tabSession';

const COMPLAINT_TYPES = [
  'Electrical Issue',
  'Plumbing Issue',
  'Furniture Damage',
  'Cleanliness',
  'AC/Heating Problem',
  'Internet/Wi-Fi Issue',
  'Security Concern',
  'Other'
];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    complaint_type: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Use the hook just for broadcasting updates (no auto-refresh needed on submit page)
  const { broadcastUpdate } = useAutoRefresh(() => {}, 0, 'student-complaints');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.complaint_type || !formData.description) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await complaintService.submitComplaint(formData);
      setMessage({ type: 'success', text: 'Complaint submitted successfully! The hostel caretaker has been notified and will resolve it soon.' });
      setFormData({ complaint_type: '', description: '' });
      
      // Broadcast update to other tabs (both student complaints and caretaker dashboard)
      broadcastUpdate();
      
      // Also create a broadcast for caretaker dashboard with proper role info
      if (typeof BroadcastChannel !== 'undefined') {
        const caretakerChannel = new BroadcastChannel('caretaker-dashboard');
        caretakerChannel.postMessage({ 
          type: 'data-update', 
          timestamp: new Date().toISOString(),
          userRole: 'caretaker', // Target role
          tabId: tabSession.getTabId(), // Source tab
          source: 'new-complaint'
        });
        caretakerChannel.close();
      }
      
      // Redirect to complaints list after 2 seconds
      setTimeout(() => {
        navigate('/student/complaints');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to submit complaint' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout title="Submit Complaint">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-500 text-4xl">report_problem</span>
            Submit a Complaint
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Report any issues in your hostel. Your complaint will be forwarded to the caretaker for immediate action.
          </p>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">description</span>
              Complaint Details
            </h3>

            {/* Complaint Type */}
            <div className="mb-6">
              <label
                htmlFor="complaint_type"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Complaint Type <span className="text-red-500">*</span>
              </label>
              <select
                id="complaint_type"
                name="complaint_type"
                value={formData.complaint_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                required
              >
                <option value="">-- Select complaint type --</option>
                {COMPLAINT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Please describe the issue in detail... (e.g., location, severity, when it started)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all resize-none"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Provide clear and detailed information for faster resolution
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  Submit Complaint
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/student/complaints')}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all font-semibold flex items-center gap-2"
            >
              <span className="material-symbols-outlined">list</span>
              My Complaints
            </button>
          </div>
        </form>

        {/* Info Card */}
        <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">info</span>
            Important Information
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
              <span>Your complaint will be automatically forwarded to your hostel caretaker</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
              <span>You can track the status (Pending, In Progress, Resolved) in 'My Complaints'</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
              <span>Please provide clear and detailed information for faster resolution</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-base mt-0.5">warning</span>
              <span>For emergencies, please contact the hostel office directly at +91-XXXXXXXXXX</span>
            </li>
          </ul>
        </div>
      </div>
    </StudentLayout>
  );
}
