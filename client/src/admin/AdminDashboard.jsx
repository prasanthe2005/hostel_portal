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

  useEffect(() => {
    async function load(){
      setLoading(true);
      setError(null);
      try{
        const [h, s, r, reqs] = await Promise.all([
          adminService.getHostels(),
          adminService.getAllStudents(),
          adminService.getRooms(),
          adminService.getRoomRequests()
        ]);
        setHostels(h);
        setStudents(s);
        setRooms(r);
        setRequests(reqs);
        
        // Debug logging
        console.log('📊 Admin Dashboard Data:');
        console.log('Hostels:', h.length);
        console.log('Students:', s.length);
        console.log('Rooms:', r.length);
        console.log('Sample room data:', r.slice(0, 3));
        console.log('Room types:', {
          AC: r.filter(room => room.type === 'AC').length,
          'Non-AC': r.filter(room => room.type === 'Non-AC').length
        });
        console.log('Total allocated beds:', r.reduce((acc, x) => acc + (x.assigned || 0), 0));
        console.log('Available rooms (with space):', r.filter(room => (room.assigned || 0) < (room.capacity || 0)).length);
        console.log('Fully occupied rooms:', r.filter(room => (room.assigned || 0) >= (room.capacity || 0)).length);
      }catch(err){ 
        console.error('Error loading admin dashboard:', err);
        const errorMsg = err.message || 'Failed to load dashboard data';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalHostels = hostels.length;
  const totalStudents = students.length;
  const allocated = rooms.reduce((acc, x) => acc + (x.assigned || 0), 0);
  const totalCapacity = rooms.reduce((acc, x) => acc + (x.capacity || 0), 0);
  
  // Debug: log calculation
  console.log('📊 Dashboard Calculations:');
  console.log('  Total students:', totalStudents);
  console.log('  Allocated beds (sum of room.assigned):', allocated);
  console.log('  Rooms data sample:', rooms.slice(0, 5).map(r => ({
    room: r.room_number,
    capacity: r.capacity,
    assigned: r.assigned
  })));
  
  // Available rooms = rooms with space (not fully occupied)
  const availableRooms = rooms.filter(r => (r.assigned || 0) < (r.capacity || 0)).length;
  
  const acRooms = rooms.filter(r => r.type === 'AC').length;
  const nonAcRooms = rooms.filter(r => r.type === 'Non-AC').length;
  
  // Occupied rooms = rooms that are fully occupied (assigned >= capacity)
  const occupiedRooms = rooms.filter(r => (r.assigned || 0) >= (r.capacity || 0)).length;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Welcome back — {loading ? 'loading data...' : 'data loaded from current session.'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 text-2xl">error</span>
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-300 font-semibold">Error Loading Data</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => navigate('/admin/hostels')} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="material-symbols-outlined text-blue-600">apartment</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Hostels</p>
          </div>
          <h3 className="text-3xl font-bold dark:text-white">{totalHostels}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="material-symbols-outlined text-purple-600">school</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
          </div>
          <h3 className="text-3xl font-bold dark:text-white">{totalStudents}</h3>
        </div>

        <div onClick={() => navigate('/admin/rooms')} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="material-symbols-outlined text-green-600">meeting_room</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Available Rooms</p>
          </div>
          <h3 className="text-3xl font-bold text-green-600">{availableRooms}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <span className="material-symbols-outlined text-orange-600">groups</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Allocated Beds</p>
          </div>
          <h3 className="text-3xl font-bold text-orange-600">{allocated}</h3>
        </div>
      </div>

      {/* Room Type Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <span className="material-symbols-outlined text-2xl">ac_unit</span>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm font-medium">AC Rooms</p>
              <h3 className="text-4xl font-bold">{acRooms}</h3>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Air Conditioned</span>
            <span className="font-semibold">{rooms.length > 0 ? Math.round((acRooms/rooms.length)*100) : 0}%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <span className="material-symbols-outlined text-2xl">air</span>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm font-medium">Non-AC Rooms</p>
              <h3 className="text-4xl font-bold">{nonAcRooms}</h3>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Standard Rooms</span>
            <span className="font-semibold">{rooms.length > 0 ? Math.round((nonAcRooms/rooms.length)*100) : 0}%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <span className="material-symbols-outlined text-2xl">bed</span>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm font-medium">Occupied Rooms</p>
              <h3 className="text-4xl font-bold">{occupiedRooms}</h3>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Currently Used</span>
            <span className="font-semibold">{rooms.length > 0 ? Math.round((occupiedRooms/rooms.length)*100) : 0}%</span>
          </div>
        </div>
      </div>

      {/* Recent Room Change Requests - Enhanced */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="material-symbols-outlined text-blue-600">swap_horiz</span>
            </div>
            <div>
              <h4 className="font-bold text-lg dark:text-white">Recent Room Change Requests</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Latest student relocation requests</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/admin/room-requests')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            View All
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">inbox</span>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No room change requests yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Requests will appear here when students submit them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.slice(0, 5).map((r, index) => {
              const isPending = r.status === 'pending';
              const isApproved = r.status === 'approved';
              const isRejected = r.status === 'rejected';
              
              return (
                <div 
                  key={r.request_id || index} 
                  onClick={() => navigate('/admin/room-requests')}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer hover:shadow-md bg-white dark:bg-slate-800/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {r.student_name ? r.student_name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold dark:text-white truncate">{r.student_name || 'Unknown Student'}</h5>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined text-xs">badge</span>
                            <span>{r.roll_number || 'N/A'}</span>
                            <span className="mx-1">•</span>
                            <span className="material-symbols-outlined text-xs">email</span>
                            <span className="truncate">{r.email || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-13 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-xs text-gray-400">location_on</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Current: <span className="font-medium dark:text-white">{r.current_hostel || 'Not allocated'} - {r.current_room || 'N/A'}</span>
                          </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          <span className="material-symbols-outlined text-xs text-blue-500 mt-0.5">favorite</span>
                          <div className="flex-1">
                            <span className="text-gray-600 dark:text-gray-400">Preferences: </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {r.choice1_hostel && (
                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                  1st: {r.choice1_hostel} - {r.choice1_room}
                                </span>
                              )}
                              {r.choice2_hostel && (
                                <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                                  2nd: {r.choice2_hostel} - {r.choice2_room}
                                </span>
                              )}
                              {r.choice3_hostel && (
                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                                  3rd: {r.choice3_hostel} - {r.choice3_room}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {r.reason && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="material-symbols-outlined text-xs text-gray-400 mt-0.5">comment</span>
                            <p className="text-gray-600 dark:text-gray-400 italic line-clamp-2">"{r.reason}"</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        isPending ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                        isApproved ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        <span className="material-symbols-outlined text-xs">
                          {isPending ? 'schedule' : isApproved ? 'check_circle' : 'cancel'}
                        </span>
                        {r.status || 'pending'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {requests.length > 5 && (
              <div className="text-center pt-3">
                <button 
                  onClick={() => navigate('/admin/room-requests')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View {requests.length - 5} more requests →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-10"></div>
    </div>
  );
};

export default AdminDashboard;
