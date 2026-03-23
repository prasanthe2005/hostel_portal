import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../services/student.service';
import StudentLayout from '../components/StudentLayout';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { BACKEND_ORIGIN } from '../config/apiConfig';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadProfile = async () => {
    // Only show loading spinner on initial load, not on auto-refresh
    if (!profile) setLoading(true);
    setError(null);
    try{
      const me = await studentService.getProfile();
      setProfile(me);
      setError(null); // Clear any previous errors
    }catch(err){ 
      console.error('Error loading profile:', err);
      const errorMsg = err.message || 'Failed to load profile data';
      setError(errorMsg);
      
      // Only redirect to login if it's a clear authentication error
      if (errorMsg.includes('Unauthorized') || errorMsg.includes('Invalid token') || errorMsg.includes('Forbidden')) {
        console.log('Authentication error detected, redirecting to login in 2 seconds...');
        setTimeout(() => {
          // Clear only this tab's session, not all tabs
          navigate('/login');
        }, 2000);
      }
    } finally {
      if (!profile) setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds and sync across tabs
  const { refresh, isRefreshing, lastRefreshed } = useAutoRefresh(
    loadProfile,
    30000, // 30 seconds
    'student-dashboard'
  );

  useEffect(() => {
    loadProfile();
  }, []);

  const name = profile?.name || 'Student';
  const email = profile?.email || '';
  const rollNumber = profile?.roll_number || 'N/A';
  const year = profile?.year ? `${profile.year}${['st','nd','rd','th'][Math.min(profile.year-1,3)]} Year` : 'N/A';
  const department = profile?.department || 'N/A';
  const address = profile?.address || 'N/A';
  const phone = profile?.phone || 'N/A';
  const parentContact = profile?.parent_contact || 'N/A';
  const gender = profile?.gender || 'N/A';
  const residenceType = profile?.residence_type || 'N/A';
  const preferredRoomType = profile?.preferred_room_type || 'N/A';
  const allocationStatus = profile?.allocation_status || 'Pending';
  const studentId = profile?.student_id || '';
  const registeredDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const lastLogin = profile?.last_login ? new Date(profile.last_login).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const hostelName = profile?.hostel_name || 'Not assigned';
  const roomNumber = profile?.room_number || 'Not assigned';
  const floorNumber = profile?.floor_number || 'N/A';
  const roomType = profile?.type || 'N/A';
  const allocatedDate = profile?.allocated_at ? new Date(profile.allocated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const hasAllocation = allocationStatus === 'Allocated' && profile?.room_number;
  const hasPendingRequest = profile?.has_pending_request || false;
  const pendingRequestDate = profile?.pending_request_date ? new Date(profile.pending_request_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <StudentLayout title="Dashboard">
      <div className="p-8">

        {/* Loading State */}
        {loading && !profile && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="flex-1">
                <p className="text-blue-800 dark:text-blue-300 font-semibold">Loading your profile...</p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Please wait while we fetch your information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert with Retry */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-600 text-2xl">error</span>
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-300 font-semibold">Error Loading Data</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {error}
                </p>
                {!error.includes('Unauthorized') && !error.includes('Invalid token') && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Please make sure the backend server is running on {BACKEND_ORIGIN}
                  </p>
                )}
              </div>
              <button
                onClick={loadProfile}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Auto-refresh indicator */}
        {!loading && !error && profile && (
          <div className="mb-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${isRefreshing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
              <span>
                {isRefreshing ? 'Refreshing...' : lastRefreshed ? `Last updated: ${lastRefreshed.toLocaleTimeString()}` : 'Auto-refresh enabled (30s)'}
              </span>
            </div>
            <button
              onClick={() => refresh('manual')}
              disabled={isRefreshing}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400 flex items-center gap-1 font-medium"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
              Refresh Now
            </button>
          </div>
        )}


        {/* Profile Card */}
<section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-6 py-4 mb-6">
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

    {/* Avatar + Info */}
    <div className="flex items-center gap-4">
      <div
        className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-blue-100 dark:border-blue-900 flex-shrink-0"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAcAtE5chVKnohzueKBydUS5pdI7Aka50_jGjA2I9xgyhhlHDxzzRY1VMWyhOApnwrBZPfoOE5yIC5StJDZolZPzeBrzdQvj9KI-gKlmn94GQM4cn4DYBZGpD7g-GDKTmMrys9XmEhQGcGMCWebmb7cLgCbstX8-1QAWAkhEdqzMSIgfKXBJylAkeB7vacUwwJhAvQLswYB26RBqTpE9uNfEyofKMOU3ShFC9DtX98WG8Q8K2gIDBA4WORAjzOWLOOvK4nfJgyF_l0")',
        }}
      />
              <div>
                <h1 className="text-2xl font-bold">{name}</h1>
                <p className="text-sm text-gray-500">Student ID: {studentId}</p>
                <p className="text-sm text-gray-600 font-medium">Roll: {rollNumber} | {year} | {department}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  {email}
                </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex items-center gap-2 flex-wrap">

      {/* Icon-only utility buttons */}
      <div className="flex items-center gap-1.5">
        <button
          title="Edit Profile"
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
        </button>
        <button
          title="ID Card"
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-purple-600 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>badge</span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

      {/* Complaint */}
      <button
        className="h-10 px-3 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        onClick={() => navigate('/student/submit-complaint')}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>report_problem</span>
        Complaint
      </button>

      {/* Room Change */}
      {hasAllocation && !hasPendingRequest && (
        <button
          className="h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          onClick={() => navigate('/student/request-room-change')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>swap_horiz</span>
          Room Change
        </button>
      )}

      {/* Pending */}
      {hasPendingRequest && (
        <div className="h-8 px-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 text-xs font-semibold flex items-center gap-1.5 select-none cursor-not-allowed">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
          Pending
        </div>
      )}

    </div>
  </div>
</section>

        {/* Grid Layout */}
        <div className="space-y-8">

            {/* Room Details */}
           <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 mb-6">

  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Current Room Allocation</h2>
    {hasAllocation && (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-2.5 py-1 rounded-full">
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
        Allocated
      </span>
    )}
    {allocationStatus === 'Pending' && (
      <span className="flex items-center gap-1 text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-2.5 py-1 rounded-full">
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
        Pending
      </span>
    )}
  </div>

  {/* Loading */}
  {loading ? (
    <div className="flex items-center justify-center py-10 gap-3">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
      <p className="text-sm text-gray-400">Loading allocation details...</p>
    </div>

  /* Day Scholar */
  ) : allocationStatus === 'Not Applicable' ? (
    <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <span className="material-symbols-outlined text-blue-500 mt-0.5" style={{ fontSize: 20 }}>info</span>
      <div>
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Day Scholar</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 leading-relaxed">
          You are registered as a Day Scholar. Hostel room allocation is not applicable for you.
        </p>
      </div>
    </div>

  /* Pending */
  ) : allocationStatus === 'Pending' ? (
    <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <span className="material-symbols-outlined text-yellow-500 mt-0.5" style={{ fontSize: 20 }}>schedule</span>
      <div>
        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Room Allocation Pending</p>
        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1 leading-relaxed">
          You have requested a <strong>{preferredRoomType}</strong> room. Your request is awaiting admin review and will be assigned on a First Come First Serve basis.
        </p>
      </div>
    </div>

  /* Allocated */
  ) : hasAllocation ? (
    <div className="space-y-4">

      {/* 4 Info Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">Hostel</p>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 16 }}>apartment</span>
            <p className="text-sm font-bold text-blue-900 dark:text-blue-100 truncate">{hostelName}</p>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wide mb-1">Room</p>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: 16 }}>meeting_room</span>
            <p className="text-sm font-bold text-green-900 dark:text-green-100">{roomNumber}</p>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wide mb-1">Floor</p>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400" style={{ fontSize: 16 }}>layers</span>
            <p className="text-sm font-bold text-purple-900 dark:text-purple-100">Floor {floorNumber}</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wide mb-1">Type</p>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-orange-600 dark:text-orange-400" style={{ fontSize: 16 }}>ac_unit</span>
            <p className="text-sm font-bold text-orange-900 dark:text-orange-100 truncate">{roomType}</p>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
        {hasPendingRequest ? (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 16 }}>schedule</span>
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Room Change Request Under Review</span>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              Submitted: <span className="font-semibold">{pendingRequestDate}</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500" style={{ fontSize: 16 }}>check_circle</span>
              <span className="text-xs font-semibold text-green-800 dark:text-green-300">Allocation Confirmed</span>
            </div>
            <span className="text-xs text-green-600 dark:text-green-400">
              Allocated on: <span className="font-semibold">{allocatedDate}</span>
            </span>
          </div>
        )}
      </div>
    </div>

  /* Error */
  ) : (
    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <span className="material-symbols-outlined text-red-500 mt-0.5" style={{ fontSize: 20 }}>error</span>
      <div>
        <p className="text-sm font-semibold text-red-800 dark:text-red-300">No Room Allocated</p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Unable to retrieve room allocation. Please contact the admin office.</p>
      </div>
    </div>
  )}

</section>
{/* Student Details */}
            <section className="card">
              <h2 className="card-title mb-6">Student Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">person</span>
                    Personal Details
                  </h3>
                  <DetailRow icon="badge" label="Full Name" value={name} />
                  <DetailRow icon="fingerprint" label="Student ID" value={studentId} />
                  <DetailRow icon="confirmation_number" label="Roll Number" value={rollNumber} />
                  <DetailRow icon="school" label="Year" value={year} />
                  <DetailRow icon="account_balance" label="Department" value={department} />
                  <DetailRow icon="wc" label="Gender" value={gender} />
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">contact_phone</span>
                    Contact Details
                  </h3>
                  <DetailRow icon="email" label="Email" value={email} valueClass="text-blue-600" />
                  <DetailRow icon="call" label="Phone Number" value={phone} />
                  <DetailRow icon="contacts" label="Parent Contact" value={parentContact} />
                  <DetailRow icon="home" label="Address" value={address} multiline />
                </div>

                {/* Hostel & Account Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">apartment</span>
                    Hostel & Account
                  </h3>
                  <DetailRow icon="home_work" label="Residence Type" value={residenceType} />
                  {residenceType === 'Hosteller' && (
                    <>
                      <DetailRow icon="meeting_room" label="Preferred Room Type" value={preferredRoomType} />
                      <DetailRow icon="check_circle" label="Allocation Status" value={allocationStatus} statusBadge />
                    </>
                  )}
                  <DetailRow icon="event" label="Registered On" value={registeredDate} />
                  <DetailRow icon="login" label="Last Login" value={lastLogin} />
                </div>
              </div>
            </section>
        </div>
      </div>
    </StudentLayout>
  );
}

/* ---------- Reusable Components ---------- */

function Detail({ icon, label, value, highlight }) {
  return (
    <div className="flex gap-4">
      <span className="material-symbols-outlined text-blue-500">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 uppercase">{label}</p>
        <p className={`font-bold ${highlight ? "text-blue-500 text-2xl" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, valueClass = '', multiline = false, statusBadge = false }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        {statusBadge ? (
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
            value === 'Allocated' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
            value === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}>
            {value}
          </span>
        ) : (
          <p className={`font-medium ${valueClass} ${multiline ? '' : 'truncate'}`} title={value}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}