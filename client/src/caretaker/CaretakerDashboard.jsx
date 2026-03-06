import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { caretakerService } from '../services/caretaker.service';

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

export default function CaretakerDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching caretaker dashboard...');
      console.log('📦 Token from localStorage:', localStorage.getItem('token')?.substring(0, 30) + '...');
      console.log('👤 UserRole from localStorage:', localStorage.getItem('userRole'));
      
      const data = await caretakerService.getDashboard();
      console.log('✅ Dashboard data received:', data);
      setDashboardData(data);
      setError('');
    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
      console.error('❌ Error message:', err.message);
      
      // Show the actual error to the user
      const errorMsg = err.message || 'Failed to fetch dashboard';
      setError(errorMsg);
      
      // Only redirect on actual authentication errors (401 or 403)
      if (errorMsg.includes('401') || errorMsg.includes('403') || 
          errorMsg.includes('Unauthorized') || errorMsg.includes('Forbidden')) {
        console.warn('⚠️ Authentication error detected - redirecting to login in 3 seconds...');
        setTimeout(() => {
          console.log('🔄 Redirecting to login...');
          localStorage.clear();
          navigate('/login');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      setUpdatingId(complaintId);
      await caretakerService.updateComplaintStatus(complaintId, newStatus);
      // Refresh dashboard
      await fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const filteredComplaints = dashboardData?.complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  }) || [];

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
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-display bg-gray-50 dark:bg-slate-900 text-[#111418] dark:text-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800 p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-red-600 text-4xl">error</span>
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-300">Error</h2>
          </div>
          <p className="text-red-700 dark:text-red-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">login</span>
            Go to Login
          </button>
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
            <span className="material-symbols-outlined text-3xl">engineering</span>
            <h2 className="text-lg font-bold">Caretaker Portal</h2>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a className="text-blue-500 font-semibold border-b-2 border-blue-500 pb-1">
              Dashboard
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {dashboardData?.caretaker.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {dashboardData?.caretaker.hostel_name || 'All Hostels'}
            </p>
          </div>
          <button 
            className="icon-btn" 
            onClick={fetchDashboard}
            title="Refresh"
          >
            <span className="material-symbols-outlined">refresh</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-500 text-4xl">dashboard</span>
            Complaint Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and resolve hostel complaints for your assigned hostel
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {dashboardData?.statistics.total_complaints || 0}
                </p>
              </div>
              <span className="material-symbols-outlined text-5xl text-gray-400 opacity-30">folder</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">Pending</p>
                <p className="text-3xl font-black text-yellow-800 dark:text-yellow-300">
                  {dashboardData?.statistics.pending || 0}
                </p>
              </div>
              <span className="material-symbols-outlined text-5xl text-yellow-500 opacity-30">schedule</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">In Progress</p>
                <p className="text-3xl font-black text-blue-800 dark:text-blue-300">
                  {dashboardData?.statistics.in_progress || 0}
                </p>
              </div>
              <span className="material-symbols-outlined text-5xl text-blue-500 opacity-30">construction</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-6 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">Resolved</p>
                <p className="text-3xl font-black text-purple-800 dark:text-purple-300">
                  {dashboardData?.statistics.resolved || 0}
                </p>
              </div>
              <span className="material-symbols-outlined text-5xl text-purple-500 opacity-30">check_circle</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-6 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Completed</p>
                <p className="text-3xl font-black text-green-800 dark:text-green-300">
                  {dashboardData?.statistics.completed || 0}
                </p>
              </div>
              <span className="material-symbols-outlined text-5xl text-green-500 opacity-30">check_circle</span>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
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

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">inbox</span>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              {filter === 'all'
                ? 'No complaints to display'
                : `No ${filter.toLowerCase()} complaints`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <div 
                key={complaint.complaint_id} 
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-orange-500 text-2xl">
                        report_problem
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {complaint.complaint_type}
                      </h3>
                      <span className={`px-4 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 ${STATUS_COLORS[complaint.status]}`}>
                        <span className="material-symbols-outlined text-base">
                          {STATUS_ICONS[complaint.status]}
                        </span>
                        {complaint.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined text-base">person</span>
                        <span><strong>Student:</strong> {complaint.student_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined text-base">badge</span>
                        <span><strong>Roll:</strong> {complaint.roll_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined text-base">meeting_room</span>
                        <span><strong>Room:</strong> {complaint.room_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined text-base">apartment</span>
                        <span><strong>Hostel:</strong> {complaint.hostel_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined text-base">call</span>
                        <span><strong>Contact:</strong> {complaint.student_phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description:</p>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    {complaint.description}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
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
                  
                  <div className="flex gap-2 flex-wrap">
                    {complaint.status !== 'In Progress' && (
                      <button
                        onClick={() => handleStatusChange(complaint.complaint_id, 'In Progress')}
                        disabled={updatingId === complaint.complaint_id}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                      >
                        {updatingId === complaint.complaint_id ? (
                          <>
                            <span className="material-symbols-outlined animate-spin">refresh</span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">construction</span>
                            Mark In Progress
                          </>
                        )}
                      </button>
                    )}
                    {complaint.status !== 'Resolved' && complaint.status !== 'Completed' && (
                      <button
                        onClick={() => handleStatusChange(complaint.complaint_id, 'Resolved')}
                        disabled={updatingId === complaint.complaint_id}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                      >
                        {updatingId === complaint.complaint_id ? (
                          <>
                            <span className="material-symbols-outlined animate-spin">refresh</span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">check_circle</span>
                            Mark Resolved
                          </>
                        )}
                      </button>
                    )}
                    {complaint.status === 'Resolved' && (
                      <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600">check_circle</span>
                        <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">Awaiting Student Confirmation</span>
                      </div>
                    )}
                    {complaint.status === 'Completed' && (
                      <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600">verified</span>
                        <span className="text-sm font-semibold text-green-800 dark:text-green-300">Completed & Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
