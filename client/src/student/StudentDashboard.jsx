import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../services/student.service';
import adminService from '../services/admin.service';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load(){
      try{
        const me = await studentService.getProfile();
        setProfile(me);
      }catch(err){ 
        console.error(err); 
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadRooms(){
      try{
        const rooms = await adminService.getPublicRooms();
        // Show all rooms with available capacity (both AC and Non-AC)
        const available = rooms.filter(room => {
          const assigned = room.assigned || 0;
          const capacity = room.capacity || 0;
          return assigned < capacity && capacity > 0;
        });
        setAvailableRooms(available);
      }catch(err){ 
        console.error('Error loading rooms:', err); 
      } finally {
        setRoomsLoading(false);
      }
    }
    loadRooms();
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

  return (
    <div className="font-display bg-gray-50 dark:bg-slate-900 text-[#111418] dark:text-gray-100 min-h-screen">

      {/* Top Navbar */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 md:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-blue-500">
            <span className="material-symbols-outlined text-3xl">apartment</span>
            <h2 className="text-xl font-bold">HostelPortal</h2>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a className="text-blue-500 text-sm font-semibold border-b-2 border-blue-500 pb-1">
              Dashboard
            </a>
            <a className="nav-link">Room Service</a>
            <a className="nav-link">Payments</a>
            <a className="nav-link">Rules</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="icon-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="icon-btn">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">

        {/* Profile Card */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-blue-500/10"
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

            <div className="flex gap-3 flex-wrap">
              <button className="primary-btn">
                <span className="material-symbols-outlined text-lg">edit</span>
                Edit Profile
              </button>
              <button className="secondary-btn">
                <span className="material-symbols-outlined text-lg">description</span>
                ID Card
              </button>
              {hasAllocation && (
                <button 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm shadow-sm transition-all flex items-center gap-2"
                  onClick={() => navigate('/student/request-room-change')}
                >
                  <span className="material-symbols-outlined text-sm">swap_horiz</span>
                  Room Change
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Grid Layout */}
        <div className="space-y-8">

            {/* Room Details */}
            <section className="card">
              <h2 className="card-title mb-4">Current Room Allocation</h2>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-500 ml-3">Loading...</p>
                </div>
              ) : allocationStatus === 'Not Applicable' ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-blue-600 text-2xl">info</span>
                    <p className="text-blue-800 dark:text-blue-300 font-semibold text-lg">Day Scholar</p>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-400 ml-11">
                    You are registered as a Day Scholar. Hostel room allocation is not applicable for you.
                  </p>
                </div>
              ) : allocationStatus === 'Pending' ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-yellow-600 text-2xl">schedule</span>
                    <p className="text-yellow-800 dark:text-yellow-300 font-semibold text-lg">Room Allocation Pending</p>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 ml-11 mb-2">
                    You are a Hosteller with preference for <strong>{preferredRoomType}</strong> rooms.
                    Your room has not been assigned yet. Please wait for admin approval.
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 ml-11">
                    Rooms are allocated on a First Come First Serve (FCFS) basis within your preferred room type.
                  </p>
                </div>
              ) : hasAllocation ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-blue-600 text-3xl">apartment</span>
                        <div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">Hostel Name</p>
                          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{hostelName}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-green-600 text-3xl">meeting_room</span>
                        <div>
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase">Room Number</p>
                          <p className="text-lg font-bold text-green-900 dark:text-green-100">{roomNumber}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-purple-600 text-3xl">layers</span>
                        <div>
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase">Floor Number</p>
                          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">Floor {floorNumber}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-orange-600 text-3xl">ac_unit</span>
                        <div>
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase">Room Type</p>
                          <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{roomType}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600">check_circle</span>
                        <span className="text-sm font-semibold text-green-800 dark:text-green-300">Status: Allocated</span>
                      </div>
                      <span className="text-sm text-green-700 dark:text-green-400">
                        <span className="font-medium">Allocated on:</span> {allocatedDate}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-600 text-2xl">error</span>
                    <div>
                      <p className="text-red-800 dark:text-red-300 font-semibold">No Room Allocated</p>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        Unable to retrieve room allocation. Please contact the admin office.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Available Rooms */}
            <section className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title">Available Rooms</h2>
                <span className="text-sm text-gray-500">
                  {roomsLoading ? 'Loading...' : `${availableRooms.length} rooms available`}
                </span>
              </div>

              {roomsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-500 ml-3">Loading available rooms...</p>
                </div>
              ) : availableRooms.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                  <span className="material-symbols-outlined text-gray-400 text-5xl mb-2">hotel</span>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No rooms available at the moment</p>
                  <p className="text-sm text-gray-500 mt-1">Please check back later or contact the admin</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Hostel</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Room No.</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Floor</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Capacity</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableRooms.slice(0, 10).map((room) => (
                        <tr key={room.room_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-blue-500 text-lg">apartment</span>
                              <span className="font-medium text-sm">{room.hostel_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-blue-600">{room.room_number}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            Floor {room.floor_number}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                              room.type === 'AC' 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
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
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400">
                              <span className="material-symbols-outlined text-lg">check_circle</span>
                              {room.capacity - (room.assigned || 0)} beds
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {availableRooms.length > 10 && (
                    <div className="mt-4 text-center">
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => navigate('/student/request-room-change')}
                      >
                        View all {availableRooms.length} available rooms →
                      </button>
                    </div>
                  )}
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
      </main>
    </div>
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


