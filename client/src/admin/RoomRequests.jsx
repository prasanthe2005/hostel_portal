import { useEffect, useState } from 'react';
import adminService from '../services/admin.service';

const RoomRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminComment, setAdminComment] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, selectedFilter, searchQuery]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRoomRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(r => r.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.roll_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.current_room?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const openModal = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminComment('');
    // Auto-select first choice if approving
    if (action === 'approve' && request.choice1) {
      setSelectedRoomId(request.choice1);
    } else {
      setSelectedRoomId('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setActionType('');
    setAdminComment('');
    setSelectedRoomId('');
  };

  const handleSubmitAction = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      if (actionType === 'approve') {
        await adminService.approveRoomRequest(
          selectedRequest.request_id,
          adminComment,
          selectedRoomId || null
        );
      } else {
        await adminService.rejectRoomRequest(
          selectedRequest.request_id,
          adminComment
        );
      }

      // Reload requests
      await loadRequests();
      closeModal();
    } catch (err) {
      console.error('Error processing request:', err);
      alert(err.error || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold flex items- gap-1 w-fit',
      approved: 'px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold flex items-center gap-1 w-fit',
      rejected: 'px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold flex items-center gap-1 w-fit',
    };
    return badges[status] || badges.pending;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const getInitials = (name) => {
    if (!name) return 'NA';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return parts[0][0];
  };

  const getAvatarColor = (index) => {
    const colors = [
      { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600' },
      { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-600' },
      { bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-600' },
      { bg: 'bg-rose-100 dark:bg-rose-900', text: 'text-rose-600' },
      { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-600' },
    ];
    return colors[index % colors.length];
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedToday = requests.filter(r => {
    if (r.status !== 'approved') return false;
    const date = new Date(r.created_at);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;
  const rejectedToday = requests.filter(r => {
    if (r.status !== 'rejected') return false;
    const date = new Date(r.created_at);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;


  const avgResponseTime = '4.2h'; // This can be calculated from actual data if needed

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full space-y-8">
      {/* Top Header Search */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 transition-all" 
            placeholder="Search students, room numbers, or dates..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Title & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Room Change Requests</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and process student relocation requests</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button 
            onClick={loadRequests}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pending</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-2xl font-black">{pendingCount}</p>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Today</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-2xl font-black">{approvedToday}</p>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected Today</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-2xl font-black">{rejectedToday}</p>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg. Response Time</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-2xl font-black">{avgResponseTime}</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-500">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
          <div className="size-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6 mx-auto">
            <span className="material-symbols-outlined text-5xl">inventory_2</span>
          </div>
          <h3 className="text-xl font-bold">No requests found</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            {searchQuery ? 'No requests match your search criteria.' : 'There are no room change requests at this moment.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Room</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Preferences</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.map((request, index) => {
                  const avatarColor = getAvatarColor(index);
                  return (
                    <tr key={request.request_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-9 rounded-full ${avatarColor.bg} flex items-center justify-center ${avatarColor.text} font-bold text-xs`}>
                            {getInitials(request.student_name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{request.student_name}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-tighter">
                              Roll: {request.roll_number || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium text-slate-700 dark:text-slate-300">
                          {request.current_hostel ? `${request.current_hostel} - ${request.current_room}` : 'Not Assigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {request.choice1 && (
                            <div className="text-xs">
                              <span className="font-semibold text-blue-600">1st:</span> {request.choice1_hostel} - {request.choice1_room} ({request.choice1_type})
                            </div>
                          )}
                          {request.choice2 && (
                            <div className="text-xs">
                              <span className="font-semibold text-purple-600">2nd:</span> {request.choice2_hostel} - {request.choice2_room} ({request.choice2_type})
                            </div>
                          )}
                          {request.choice3 && (
                            <div className="text-xs">
                              <span className="font-semibold text-green-600">3rd:</span> {request.choice3_hostel} - {request.choice3_room} ({request.choice3_type})
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate" title={request.reason}>
                          {request.reason || 'No reason provided'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{formatDate(request.created_at)}</p>
                        <p className="text-[10px] text-slate-400">{getTimeAgo(request.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(request.status)}>
                          <span className={`size-1.5 rounded-full ${getStatusColor(request.status)}`}></span>
                          {getStatusText(request.status)}
                        </span>
                        {request.admin_comment && (
                          <p className="text-[10px] text-slate-400 mt-1" title={request.admin_comment}>
                            Note: {request.admin_comment}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {request.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openModal(request, 'approve')}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => openModal(request, 'reject')}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Approve/Reject */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Room Change Request
            </h3>
            
            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm font-semibold">{selectedRequest.student_name}</p>
              <p className="text-xs text-slate-500">Roll: {selectedRequest.roll_number}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                <span className="font-semibold">Reason:</span> {selectedRequest.reason}
              </p>
            </div>

            {actionType === 'approve' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Select Room to Allocate</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  {selectedRequest.choice1 && (
                    <option value={selectedRequest.choice1}>
                      1st: {selectedRequest.choice1_hostel} - {selectedRequest.choice1_room} ({selectedRequest.choice1_type})
                    </option>
                  )}
                  {selectedRequest.choice2 && (
                    <option value={selectedRequest.choice2}>
                      2nd: {selectedRequest.choice2_hostel} - {selectedRequest.choice2_room} ({selectedRequest.choice2_type})
                    </option>
                  )}
                  {selectedRequest.choice3 && (
                    <option value={selectedRequest.choice3}>
                      3rd: {selectedRequest.choice3_hostel} - {selectedRequest.choice3_room} ({selectedRequest.choice3_type})
                    </option>
                  )}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Admin Comment (Optional)</label>
              <textarea 
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                rows="3"
                placeholder="Add a comment..."
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitAction}
                className={`px-4 py-2 ${
                  actionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50`}
                disabled={processing}
              >
                {processing ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomRequests;