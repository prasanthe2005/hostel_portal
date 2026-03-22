import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wardenService } from '../services/warden.service';

export default function WardenDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({ warden: null, students: [] });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState('');

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatYear = (yearValue) => {
    if (!yearValue) return 'N/A';
    const yearNum = Number(yearValue);
    if (!Number.isFinite(yearNum) || yearNum <= 0) return String(yearValue);

    const suffix = (n) => {
      if (n % 100 >= 11 && n % 100 <= 13) return 'th';
      if (n % 10 === 1) return 'st';
      if (n % 10 === 2) return 'nd';
      if (n % 10 === 3) return 'rd';
      return 'th';
    };

    return `${yearNum}${suffix(yearNum)} Year`;
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await wardenService.getDashboard();
      setDashboardData({
        warden: data.warden,
        students: data.students || []
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load warden dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = async () => {
    await wardenService.logout();
    navigate('/login');
  };

  const initials = (name) =>
    name ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '??';

  const filtered = dashboardData.students.filter((s) => {
    const q = search.toLowerCase();
    return !q
      || s.name?.toLowerCase().includes(q)
      || s.room_number?.toLowerCase().includes(q)
      || s.roll_number?.toLowerCase().includes(q)
      || s.department?.toLowerCase().includes(q)
      || s.email?.toLowerCase().includes(q);
  });

  const stats = {
    total: dashboardData.students.length,
    allocated: dashboardData.students.filter((s) => s.allocation_status === 'Allocated').length,
    pending: dashboardData.students.filter((s) => s.allocation_status === 'Pending').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
        <div className="max-w-lg w-full bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">Unable to Load Warden Dashboard</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white">

      {/* ── Header ── */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>shield_person</span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Warden Dashboard</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Assigned Hostel: {dashboardData.warden?.hostel_name}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
          Logout
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Warden Profile Card (mirrors student profile card) ── */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xl font-bold flex-shrink-0 border-2 border-blue-200 dark:border-blue-800">
                {initials(dashboardData.warden?.name || 'WD')}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{dashboardData.warden?.name || 'Warden'}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hostel Warden</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-0.5">
                  {dashboardData.warden?.hostel_name}
                </p>
                {dashboardData.warden?.email && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>mail</span>
                    {dashboardData.warden.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Tiles (mirrors student room allocation tiles) ── */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Hostel Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">Total Students</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 16 }}>group</span>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wide mb-1">Allocated</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: 16 }}>check_circle</span>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.allocated}</p>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-yellow-500 dark:text-yellow-400 uppercase tracking-wide mb-1">Pending</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400" style={{ fontSize: 16 }}>schedule</span>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Students Table ── */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">

          {/* Section header + search */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Students in Your Hostel</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Showing {filtered.length} of {stats.total} students — {dashboardData.warden?.hostel_name}
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 16 }}>search</span>
              <input
                type="text"
                placeholder="Search name, room, dept…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 h-9 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Roll No.</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Room</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Phone</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-4xl block mb-2">person_search</span>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {search ? `No students matching "${search}"` : 'No students are currently allocated in this hostel.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">

                      {/* Name + avatar */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials(student.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{student.name}</p>
                            <p className="text-xs text-gray-400 truncate">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{student.roll_number || 'N/A'}</td>

                      <td className="px-5 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                          {student.department || 'N/A'}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        {student.room_number ? (
                          <div className="flex items-center gap-1 text-sm">
                            <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 14 }}>meeting_room</span>
                            <span className="font-medium">{student.room_number}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{student.phone || 'N/A'}</td>

                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          student.allocation_status === 'Allocated'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
                            : student.allocation_status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        }`}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>
                            {student.allocation_status === 'Allocated' ? 'check_circle' : 'schedule'}
                          </span>
                          {student.allocation_status || 'N/A'}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40">
              <p className="text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''} shown</p>
            </div>
          )}
        </section>
      </main>

      {/* ── Student Detail Modal ── */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm flex-shrink-0">
                  {initials(selectedStudent.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">Student Details</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                    {selectedStudent.name} &bull; {selectedStudent.hostel_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
                aria-label="Close details"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Allocation tiles inside modal */}
            {selectedStudent.allocation_status === 'Allocated' && selectedStudent.room_number && (
              <div className="px-6 pt-5 pb-2">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Current Room Allocation</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">Hostel</p>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 16 }}>apartment</span>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100 truncate">{selectedStudent.hostel_name}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wide mb-1">Room</p>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: 16 }}>meeting_room</span>
                      <p className="text-sm font-bold text-green-900 dark:text-green-100">{selectedStudent.room_number}</p>
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wide mb-1">Preferred</p>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-purple-600 dark:text-purple-400" style={{ fontSize: 16 }}>bed</span>
                      <p className="text-sm font-bold text-purple-900 dark:text-purple-100 truncate">{selectedStudent.preferred_room_type || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wide mb-1">Status</p>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-orange-600 dark:text-orange-400" style={{ fontSize: 16 }}>check_circle</span>
                      <p className="text-sm font-bold text-orange-900 dark:text-orange-100">{selectedStudent.allocation_status}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedStudent.allocation_status === 'Pending' && (
              <div className="px-6 pt-5 pb-2">
                <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <span className="material-symbols-outlined text-yellow-500 mt-0.5" style={{ fontSize: 20 }}>schedule</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Room Allocation Pending</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                      Requested: <strong>{selectedStudent.preferred_room_type}</strong>. Awaiting admin review.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4-section detail grid — same as student dashboard */}
            <div className="p-6 pt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4">
                <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-blue-500">person</span>
                  Personal Details
                </h4>
                <div className="space-y-0">
                  <DetailRow icon="badge" label="Full Name" value={selectedStudent.name} />
                  <DetailRow icon="fingerprint" label="Student ID" value={selectedStudent.student_id} />
                  <DetailRow icon="confirmation_number" label="Roll Number" value={selectedStudent.roll_number} />
                  <DetailRow icon="school" label="Year" value={formatYear(selectedStudent.year)} />
                  <DetailRow icon="account_balance" label="Department" value={selectedStudent.department} />
                  <DetailRow icon="wc" label="Gender" value={selectedStudent.gender} />
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4">
                <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-blue-500">contact_phone</span>
                  Contact Details
                </h4>
                <div className="space-y-0">
                  <DetailRow icon="email" label="Email" value={selectedStudent.email} valueClass="text-blue-600 dark:text-blue-400" />
                  <DetailRow icon="call" label="Phone Number" value={selectedStudent.phone} />
                  <DetailRow icon="contacts" label="Parent Contact" value={selectedStudent.parent_contact} />
                  <DetailRow icon="home" label="Address" value={selectedStudent.address} multiline />
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4">
                <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-blue-500">apartment</span>
                  Hostel & Account
                </h4>
                <div className="space-y-0">
                  <DetailRow icon="home_work" label="Hostel Name" value={selectedStudent.hostel_name} />
                  <DetailRow icon="meeting_room" label="Residence Type" value={selectedStudent.residence_type} />
                  <DetailRow icon="bed" label="Preferred Room Type" value={selectedStudent.preferred_room_type} />
                  <DetailRow icon="door_front" label="Room Number" value={selectedStudent.room_number} />
                  <DetailRow icon="check_circle" label="Allocation Status" value={selectedStudent.allocation_status} statusBadge />
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4">
                <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-blue-500">schedule</span>
                  Activity Info
                </h4>
                <div className="space-y-0">
                  <DetailRow icon="event" label="Registered On" value={formatDateTime(selectedStudent.created_at)} />
                  <DetailRow icon="login" label="Last Login" value={formatDateTime(selectedStudent.last_login)} />
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reusable DetailRow — same component as student dashboard ── */
function DetailRow({ icon, label, value, valueClass = '', multiline = false, statusBadge = false }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        {statusBadge ? (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
            value === 'Allocated'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
              : value === 'Pending'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
              {value === 'Allocated' ? 'check_circle' : 'schedule'}
            </span>
            {value}
          </span>
        ) : (
          <p className={`font-medium text-sm ${valueClass} ${multiline ? '' : 'truncate'}`} title={String(value || '')}>
            {value || 'N/A'}
          </p>
        )}
      </div>
    </div>
  );
}