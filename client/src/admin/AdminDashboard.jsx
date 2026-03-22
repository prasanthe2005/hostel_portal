import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import adminService from '../services/admin.service';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeToArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.items)) return value.items;
    return [];
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [h, s, r, reqs] = await Promise.all([
          adminService.getHostels(),
          adminService.getAllStudents(),
          adminService.getRooms(),
          adminService.getRoomRequests()
        ]);
        const safeHostels = normalizeToArray(h);
        const safeStudents = normalizeToArray(s);
        const safeRooms = normalizeToArray(r);
        const safeRequests = normalizeToArray(reqs);

        setHostels(safeHostels);
        setStudents(safeStudents);
        setRooms(safeRooms);
        setRequests(safeRequests);

        console.log('📊 Admin Dashboard Data:');
        console.log('Hostels:', safeHostels.length);
        console.log('Students:', safeStudents.length);
        console.log('Rooms:', safeRooms.length);
        console.log('Sample room data:', safeRooms.slice(0, 3));
        console.log('Room types:', {
          AC: safeRooms.filter(room => room.type === 'AC').length,
          'Non-AC': safeRooms.filter(room => room.type === 'Non-AC').length
        });
        console.log('Total allocated beds:', safeRooms.reduce((acc, x) => acc + (x.assigned || 0), 0));
        console.log('Available rooms (with space):', safeRooms.filter(room => (room.assigned || 0) < (room.capacity || 0)).length);
        console.log('Fully occupied rooms:', safeRooms.filter(room => (room.assigned || 0) >= (room.capacity || 0)).length);
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
        const errorMsg = err.message || 'Failed to load dashboard data';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const safeHostels = Array.isArray(hostels) ? hostels : [];
  const safeStudents = Array.isArray(students) ? students : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeRequests = Array.isArray(requests) ? requests : [];

  const totalHostels = safeHostels.length;
  const totalStudents = safeStudents.length;
  const allocated = safeRooms.reduce((acc, x) => acc + (x.assigned || 0), 0);
  const totalCapacity = safeRooms.reduce((acc, x) => acc + (x.capacity || 0), 0);

  console.log('📊 Dashboard Calculations:');
  console.log('  Total students:', totalStudents);
  console.log('  Allocated beds (sum of room.assigned):', allocated);
  console.log('  Rooms data sample:', safeRooms.slice(0, 5).map(r => ({
    room: r.room_number,
    capacity: r.capacity,
    assigned: r.assigned
  })));

  const availableRooms = safeRooms.filter(r => (r.assigned || 0) < (r.capacity || 0)).length;
  const acRooms = safeRooms.filter(r => r.type === 'AC').length;
  const nonAcRooms = safeRooms.filter(r => r.type === 'Non-AC').length;
  const occupiedRooms = safeRooms.filter(r => (r.assigned || 0) >= (r.capacity || 0)).length;

  const initials = (name) =>
    name ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : 'S';

  return (
    <div className="p-6 space-y-6">

      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Welcome back — {loading ? 'loading data...' : 'data loaded from current session.'}
        </p>
      </div>

      {/* ── Error Alert ── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">error</span>
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-300 font-semibold text-sm">Error Loading Data</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Primary Stats Tiles ── */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Hostel Overview</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          <div
            onClick={() => navigate('/admin/hostels')}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-4 py-3 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">Total Hostels</p>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 16 }}>apartment</span>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalHostels}</p>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wide mb-1">Total Students</p>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400" style={{ fontSize: 16 }}>school</span>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{totalStudents}</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/admin/rooms')}
            className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-4 py-3 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <p className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wide mb-1">Available Rooms</p>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: 16 }}>meeting_room</span>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{availableRooms}</p>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wide mb-1">Allocated Beds</p>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-orange-600 dark:text-orange-400" style={{ fontSize: 16 }}>groups</span>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{allocated}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Room Type Stats ── */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Room Breakdown</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">AC Rooms</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 16 }}>ac_unit</span>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{acRooms}</p>
              </div>
              <span className="text-xs font-semibold text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                {safeRooms.length > 0 ? Math.round((acRooms / safeRooms.length) * 100) : 0}%
              </span>
            </div>
            <p className="text-xs text-blue-500/70 dark:text-blue-400/60 mt-1">Air Conditioned</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wide mb-1">Non-AC Rooms</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: 16 }}>air</span>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{nonAcRooms}</p>
              </div>
              <span className="text-xs font-semibold text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                {safeRooms.length > 0 ? Math.round((nonAcRooms / safeRooms.length) * 100) : 0}%
              </span>
            </div>
            <p className="text-xs text-green-500/70 dark:text-green-400/60 mt-1">Standard Rooms</p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wide mb-1">Occupied Rooms</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400" style={{ fontSize: 16 }}>bed</span>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{occupiedRooms}</p>
              </div>
              <span className="text-xs font-semibold text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
                {safeRooms.length > 0 ? Math.round((occupiedRooms / safeRooms.length) * 100) : 0}%
              </span>
            </div>
            <p className="text-xs text-red-500/70 dark:text-red-400/60 mt-1">Currently Used</p>
          </div>
        </div>
      </section>

      {/* ── Recent Room Change Requests ── */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">

        {/* Section header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Recent Room Change Requests</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Latest student relocation requests</p>
          </div>
          <button
            onClick={() => navigate('/admin/room-requests')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            View All
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
          </button>
        </div>

        {/* Requests list */}
        {safeRequests.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-3">inbox</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No room change requests yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Requests will appear here when students submit them</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {safeRequests.slice(0, 5).map((r, index) => {
              const isPending = r.status === 'pending';
              const isApproved = r.status === 'approved';
              const isRejected = r.status === 'rejected';

              return (
                <div
                  key={r.request_id || index}
                  onClick={() => navigate('/admin/room-requests')}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">

                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {initials(r.student_name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + meta */}
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.student_name || 'Unknown Student'}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>badge</span>
                            {r.roll_number || 'N/A'}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 truncate">
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>email</span>
                            {r.email || 'N/A'}
                          </span>
                        </div>

                        {/* Current room */}
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>
                          <span>Current: <span className="font-medium text-gray-700 dark:text-gray-300">{r.current_hostel || 'Not allocated'} — {r.current_room || 'N/A'}</span></span>
                        </div>

                        {/* Preferences */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {r.choice1_hostel && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                              1st: {r.choice1_hostel} — {r.choice1_room}
                            </span>
                          )}
                          {r.choice2_hostel && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                              2nd: {r.choice2_hostel} — {r.choice2_room}
                            </span>
                          )}
                          {r.choice3_hostel && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                              3rd: {r.choice3_hostel} — {r.choice3_room}
                            </span>
                          )}
                        </div>

                        {/* Reason */}
                        {r.reason && (
                          <div className="flex items-start gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined mt-0.5" style={{ fontSize: 12 }}>comment</span>
                            <p className="italic line-clamp-1">"{r.reason}"</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status + date */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        isPending
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                          : isApproved
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                      }`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 11 }}>
                          {isPending ? 'schedule' : isApproved ? 'check_circle' : 'cancel'}
                        </span>
                        {r.status || 'pending'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {safeRequests.length > 5 && (
              <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 text-center">
                <button
                  onClick={() => navigate('/admin/room-requests')}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
                >
                  View {safeRequests.length - 5} more requests →
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="h-4"></div>
    </div>
  );
};

export default AdminDashboard;