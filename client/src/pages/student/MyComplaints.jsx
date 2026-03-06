import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaint.service';

const STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'Resolved': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
};

const STATUS_ICONS = {
  'Pending': 'schedule',
  'In Progress': 'construction',
  'Resolved': 'check_circle',
  'Completed': 'verified'
};

export default function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolution = async (complaintId) => {
    try {
      setConfirmingId(complaintId);
      const result = await complaintService.confirmResolution(complaintId);
      if (result.success) {
        await fetchComplaints();
      } else {
        setError(result.error || 'Failed to confirm resolution');
      }
    } catch (err) {
      setError(err.message || 'Failed to confirm resolution');
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="font-display bg-gray-50 dark:bg-slate-900 text-[#111418] dark:text-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-display bg-gray-50 dark:bg-slate-900 text-[#111418] dark:text-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-blue-500">
            <span className="material-symbols-outlined text-3xl">apartment</span>
            <h2 className="text-lg font-bold">HostelPortal</h2>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a onClick={() => navigate('/student/dashboard')} className="nav-link cursor-pointer">Dashboard</a>
            <a className="text-blue-500 font-semibold border-b-2 border-blue-500 pb-1">
              My Complaints
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="icon-btn" 
            onClick={fetchComplaints}
            title="Refresh"
          >
            <span className="material-symbols-outlined">refresh</span>
          </button>
          <button className="icon-btn" onClick={() => navigate('/student/dashboard')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-500 text-4xl">list_alt</span>
              My Complaints
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage all your hostel complaints
            </p>
          </div>
          <button
            onClick={() => navigate('/student/submit-complaint')}
            className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-semibold shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            New Complaint
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">error</span>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'Pending', 'In Progress', 'Resolved', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                filter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {status === 'all' ? 'All Complaints' : status}
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">Pending</p>
                <p className="text-3xl font-black text-yellow-800 dark:text-yellow-300">
                  {complaints.filter(c => c.status === 'Pending').length}
                </p>
              </div>
              <span className="material-symbols-outlined text-5xl text-yellow-500 opacity-30">schedule</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">In Progress</p>
                <p className="text-3xl font-black text-blue-800 dark:text-blue-300">
                  {complaints.filter(c => c.status === 'In Progress').length}
                </p>
              </div>
              <span className="material-symbols-outlined text-5xl text-blue-500 opacity-30">construction</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">Resolved</p>
                <p className="text-3xl font-black text-purple-800 dark:text-purple-300">
                  {complaints.filter(c => c.status === 'Resolved').length}
                </p>
              </div>
              <span className="material-symbols-outlined text-5xl text-purple-500 opacity-30">check_circle</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-6 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Completed</p>
                <p className="text-3xl font-black text-green-800 dark:text-green-300">
                  {complaints.filter(c => c.status === 'Completed').length}
                </p>
              </div>
              <span className="material-symbols-outlined text-5xl text-green-500 opacity-30">check_circle</span>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">inbox</span>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              {filter === 'all'
                ? 'No complaints submitted yet.'
                : `No ${filter.toLowerCase()} complaints.`}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              {filter === 'all' && 'Submit your first complaint to get started!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint.complaint_id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-orange-500 text-2xl">
                        report_problem
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {complaint.complaint_type}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">meeting_room</span>
                        Room {complaint.room_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">apartment</span>
                        {complaint.hostel_name}
                      </span>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 ${STATUS_COLORS[complaint.status]}`}>
                    <span className="material-symbols-outlined text-base">
                      {STATUS_ICONS[complaint.status]}
                    </span>
                    {complaint.status}
                  </span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                  {complaint.description}
                </p>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    Submitted: {formatDate(complaint.created_at)}
                  </span>
                  {complaint.updated_at !== complaint.created_at && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">update</span>
                      Updated: {formatDate(complaint.updated_at)}
                    </span>
                  )}
                </div>
                
                {complaint.status === 'Resolved' && (
                  <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <p className="text-sm text-purple-800 dark:text-purple-300 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">info</span>
                        <strong>Caretaker Has Resolved This Issue</strong> - Please confirm if the problem is truly fixed.
                      </p>
                      <button
                        onClick={() => handleConfirmResolution(complaint.complaint_id)}
                        disabled={confirmingId === complaint.complaint_id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shrink-0"
                      >
                        {confirmingId === complaint.complaint_id ? (
                          <>
                            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                            Confirming...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-base">verified</span>
                            Mark as Completed
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {complaint.status === 'Completed' && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">verified</span>
                      <strong>Status: Rectified & Completed</strong> - This issue has been resolved and confirmed.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
