import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/admin.service';
import studentService from '../services/student.service';

export default function RequestRoomChange() {
  const [rooms, setRooms] = useState([]);
  const [profile, setProfile] = useState(null);
  const [choice1, setChoice1] = useState('');
  const [choice2, setChoice2] = useState('');
  const [choice3, setChoice3] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load(){
      try{
        const [r, p] = await Promise.all([adminService.getPublicRooms(), studentService.getProfile()]);
        console.log('Loaded rooms from API:', r);
        console.log('Student profile:', p);
        
        // Show ALL rooms that have available capacity
        // Students can request any room type (AC or Non-AC) regardless of their current preference
        const availableRooms = r.filter(room => {
          const assigned = room.assigned || 0;
          const capacity = room.capacity || 0;
          const hasSpace = assigned < capacity;
          console.log(`Room ${room.room_number}: type=${room.type}, assigned=${assigned}/${capacity}, hasSpace=${hasSpace}`);
          return hasSpace && capacity > 0;
        });
        
        console.log(`Total rooms: ${r.length}, Available rooms: ${availableRooms.length}`);
        setRooms(availableRooms);
        setProfile(p);
      }catch(err){ 
        console.error('Error loading data:', err);
        setMessage({ type: 'error', text: 'Failed to load data' });
      }
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!choice1 && !choice2 && !choice3) {
      setMessage({ type: 'error', text: 'Please select at least one room preference' });
      return;
    }

    if (!reason.trim()) {
      setMessage({ 
        type: 'error', 
        text: profile?.room_number 
          ? 'Please provide a reason for room change' 
          : 'Please provide a reason for room request' 
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await studentService.submitRoomRequest({
        choice1: choice1 || null,
        choice2: choice2 || null,
        choice3: choice3 || null,
        reason: reason.trim()
      });
      
      setMessage({ 
        type: 'success', 
        text: profile?.room_number 
          ? 'Room change request submitted successfully!' 
          : 'Room request submitted successfully!' 
      });
      
      // Clear form
      setChoice1('');
      setChoice2('');
      setChoice3('');
      setReason('');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.error || 'Failed to submit request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 text-[#111418] dark:text-gray-100 min-h-screen flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-blue-500">
            <span className="material-symbols-outlined text-3xl">apartment</span>
            <h2 className="text-lg font-bold">HostelPortal</h2>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a onClick={() => navigate('/student/dashboard')} className="nav-link cursor-pointer">Dashboard</a>
            <a className="text-blue-500 font-semibold border-b-2 border-blue-500 pb-1">
              {profile?.room_number ? 'Room Change' : 'Room Request'}
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="icon-btn" onClick={() => navigate('/student/dashboard')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">
            {profile?.room_number ? 'Room Change Request' : 'Room Request'}
          </h1>
          <p className="text-gray-500">
            {profile?.room_number 
              ? 'Select up to 3 room preferences and provide a reason for the change.'
              : 'Select up to 3 room preferences and provide a reason for your room request.'}
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">
                {message.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">

            {/* Current Room */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">info</span>
                Current Room Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4 bg-blue-500/5 p-4 rounded-lg">
                <Info label="Hostel / Block" value={profile?.hostel_name || 'Not assigned'} />
                <Info label="Room Number" value={profile?.room_number || 'Not assigned'} />
                <Info label="Room Type" value={profile?.type || '—'} />
              </div>
            </section>

            {/* Request Form */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">edit_square</span>
                New Request Form
              </h3>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select 
                    label="1st Preference" 
                    rooms={rooms} 
                    value={choice1}
                    onChange={(e) => setChoice1(e.target.value)}
                    excludeValues={[choice2, choice3]}
                  />
                  <Select 
                    label="2nd Preference" 
                    rooms={rooms} 
                    value={choice2}
                    onChange={(e) => setChoice2(e.target.value)}
                    excludeValues={[choice1, choice3]}
                  />
                  <Select 
                    label="3rd Preference" 
                    rooms={rooms} 
                    value={choice3}
                    onChange={(e) => setChoice3(e.target.value)}
                    excludeValues={[choice1, choice2]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {profile?.room_number ? 'Reason for Change *' : 'Reason for Request *'}
                  </label>
                  <textarea
                    rows="5"
                    placeholder={profile?.room_number 
                      ? "Type your reason here... (e.g., Need to be closer to library, Medical reasons, etc.)"
                      : "Type your reason here... (e.g., Prefer AC room, Need specific floor, etc.)"}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 rounded-lg p-4">
                  <span className="material-symbols-outlined text-amber-600">
                    warning
                  </span>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Only one pending request is allowed at a time. Please wait for admin review.
                  </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    type="button" 
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => navigate('/student/dashboard')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">send</span>
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Help */}
            <section className="bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-xl p-6 text-white">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">help</span>
                Need Help?
              </h4>
              <p className="text-sm opacity-90 mb-4">
                Contact the hostel warden for assistance with room change requests.
              </p>
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                Contact Admin
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </section>

            {/* Guidelines */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">info</span>
                Guidelines
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-xs mt-0.5">check</span>
                  <span>Select up to 3 room preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-xs mt-0.5">check</span>
                  <span>You can select any room type (AC or Non-AC) regardless of your current preference</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-xs mt-0.5">check</span>
                  <span>Provide a valid reason for the change</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-xs mt-0.5">check</span>
                  <span>Admin will review and approve based on availability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-xs mt-0.5">check</span>
                  <span>You can only have one pending request at a time</span>
                </li>
              </ul>
            </section>
          </div>
        </div>

        {/* All Available Rooms - Full Width Section */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="material-symbols-outlined text-green-600 text-2xl">hotel</span>
              </div>
              <div>
                <h3 className="text-xl font-bold dark:text-white">All Available Rooms</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total: {rooms.length} rooms available for room change</p>
              </div>
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">hotel</span>
              <p className="text-gray-600 dark:text-gray-400 font-medium">No available rooms at the moment</p>
              <p className="text-sm text-gray-500 mt-1">Please check back later or contact the admin</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Room No.</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Hostel</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Floor</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Capacity</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Available Beds</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.room_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{room.room_number}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-500 text-sm">apartment</span>
                          <span className="font-medium text-sm dark:text-white">{room.hostel_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        Floor {room.floor_number || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          room.type === 'AC' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {room.type === 'AC' && <span className="material-symbols-outlined text-xs">ac_unit</span>}
                          {room.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {room.capacity} beds
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px] bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all" 
                              style={{width: `${((room.capacity - (room.assigned || 0)) / room.capacity) * 100}%`}}
                            />
                          </div>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {room.capacity - (room.assigned || 0)} / {room.capacity}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-xs text-gray-500">
          © 2024 Hostel Management Portal
        </p>
      </footer>
    </div>
  );
}

/* ---------- Reusable Components ---------- */

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-medium mt-1">{value}</p>
    </div>
  );
}

function Select({ label, rooms, value, onChange, excludeValues = [] }) {
  console.log(`Select ${label}:`, { roomsCount: rooms?.length, value, excludeValues });
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <select 
        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer" 
        value={value} 
        onChange={onChange}
      >
        <option value="">Select Room</option>
        {rooms && rooms.length > 0 ? (
          rooms
            .filter(r => !excludeValues.includes(String(r.room_id)))
            .map(r => (
              <option key={r.room_id} value={r.room_id}>
                {r.hostel_name} - {r.room_number} ({r.type}) - {r.capacity - (r.assigned || 0)} available
              </option>
            ))
        ) : (
          <option disabled>No rooms available</option>
        )}
      </select>
      {(!rooms || rooms.length === 0) && (
        <p className="text-xs text-red-500 mt-1">No available rooms found. Please contact admin.</p>
      )}
    </div>
  );
}
