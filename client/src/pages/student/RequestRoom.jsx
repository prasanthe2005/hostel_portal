import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/student.service.js';

const RequestRoom = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sample room data
  const rooms = [
    {
      id: 'R-402',
      name: 'Room R-402',
      floor: '4th Floor',
      wing: 'East Wing',
      type: 'Premium AC Double',
      vacancies: 1,
      available: true,
      selected: true
    },
    {
      id: 'R-210',
      name: 'Room R-210',
      floor: '2nd Floor',
      wing: 'West Wing',
      type: 'Standard AC Single',
      vacancies: 1,
      available: true,
      selected: false
    },
    {
      id: 'R-305',
      name: 'Room R-305',
      floor: '3rd Floor',
      wing: 'North Wing',
      type: 'Non-AC Double',
      vacancies: 2,
      available: true,
      selected: false
    },
    {
      id: 'R-102',
      name: 'Room R-102',
      floor: '1st Floor',
      wing: 'North Wing',
      type: 'Non-AC Triple',
      vacancies: 0,
      available: false,
      selected: false
    }
  ];

  // Sample requests data
  const requests = [
    {
      id: '#CR-8921',
      date: 'Oct 24, 2023',
      preferredRooms: ['R-402', 'R-210'],
      status: 'pending'
    },
    {
      id: '#CR-8405',
      date: 'Sep 12, 2023',
      preferredRooms: ['R-105'],
      status: 'approved'
    },
    {
      id: '#CR-7811',
      date: 'Aug 05, 2023',
      preferredRooms: ['R-301', 'R-302'],
      status: 'rejected'
    }
  ];

  const handleLogout = async () => {
    await studentService.logout();
    navigate('/login');
  };

  const navigateToDashboard = () => {
    navigate('/student/dashboard');
  };

  const handleAddPreference = (roomId) => {
    if (selectedPreferences.length < 3 && !selectedPreferences.includes(roomId)) {
      setSelectedPreferences([...selectedPreferences, roomId]);
    }
  };

  const handleRemovePreference = (roomId) => {
    setSelectedPreferences(selectedPreferences.filter(id => id !== roomId));
  };

  const handleSubmit = async () => {
    if (selectedPreferences.length === 0) {
      alert('Please select at least one room preference');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason for your request');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting room request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };

    const statusDot = {
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig[status]}`}>
        <span className={`size-1.5 rounded-full ${statusDot[status]}`}></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">
            <span className="material-symbols-outlined text-6xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400">Your room change request has been submitted successfully.</p>
          <p className="text-sm text-slate-400 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-display text-slate-900 bg-slate-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Same as Student Dashboard */}
        <aside className="w-64 bg-blue-900 text-white flex flex-col shrink-0">
          <div className="p-6 flex items-center gap-3">
            <div className="size-8 text-white">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight">HostelPortal</h2>
          </div>
          <nav className="flex-1 px-4 mt-4 space-y-1">
            <a 
              onClick={navigateToDashboard}
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </a>
            <a className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-lg font-medium transition-all cursor-pointer">
              <span className="material-symbols-outlined">swap_horiz</span>
              Room Change
            </a>
          </nav>
          <div className="p-4 border-t border-white/10">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:text-red-300 hover:bg-white/5 rounded-lg font-medium transition-all"
            >
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Student Room Change & Tracking</h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined">notifications</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="p-8 max-w-[1400px] w-full mx-auto space-y-12">
            {/* Select Preferred Rooms Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Select Preferred Rooms</h2>
                  <p className="text-sm text-slate-500">Pick up to 3 rooms for your change request</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  {/* Search and Filter */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap gap-4 shadow-sm">
                    <div className="relative flex-1 min-w-[200px]">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                      <input 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20" 
                        placeholder="Search rooms..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <select 
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-4 py-2 min-w-[120px] focus:ring-2 focus:ring-blue-500/20"
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                      >
                        <option value="">Floor</option>
                        <option value="1">1st Floor</option>
                        <option value="2">2nd Floor</option>
                        <option value="3">3rd Floor</option>
                      </select>
                      <select 
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-4 py-2 min-w-[120px] focus:ring-2 focus:ring-blue-500/20"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                      >
                        <option value="">Type</option>
                        <option value="ac">AC</option>
                        <option value="non-ac">Non-AC</option>
                      </select>
                    </div>
                  </div>

                  {/* Room Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rooms.map((room) => (
                      <div 
                        key={room.id}
                        className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm transition-all ${
                          selectedPreferences.includes(room.id) 
                            ? 'border-2 border-blue-600 ring-4 ring-blue-600/5' 
                            : room.available 
                              ? 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 group' 
                              : 'border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        {selectedPreferences.includes(room.id) && (
                          <div className="absolute top-4 right-4 text-blue-600">
                            <span className="material-symbols-outlined">check_circle</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`p-3 rounded-xl ${
                            selectedPreferences.includes(room.id) 
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                              : room.available 
                                ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 transition-colors' 
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                          }`}>
                            <span className="material-symbols-outlined">
                              {room.available ? 'meeting_room' : 'lock'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{room.name}</h3>
                            <p className="text-xs text-slate-500 uppercase font-semibold">{room.floor} • {room.wing}</p>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500">{room.type}</span>
                          <span className={`font-bold ${room.vacancies > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {room.vacancies > 0 ? `${room.vacancies} Vacancy${room.vacancies > 1 ? 'ies' : ''}` : 'No Vacancy'}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            if (selectedPreferences.includes(room.id)) {
                              handleRemovePreference(room.id);
                            } else {
                              handleAddPreference(room.id);
                            }
                          }}
                          disabled={!room.available || (selectedPreferences.length >= 3 && !selectedPreferences.includes(room.id))}
                          className={`w-full py-2 text-sm font-bold rounded-lg transition-colors ${
                            selectedPreferences.includes(room.id)
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                              : room.available && selectedPreferences.length < 3
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {selectedPreferences.includes(room.id) 
                            ? 'Preference Selected' 
                            : !room.available 
                              ? 'Full'
                              : selectedPreferences.length >= 3
                                ? 'Max Preferences Reached'
                                : 'Add to Preferences'
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preferences Sidebar */}
                <aside className="lg:col-span-4 h-fit sticky top-[100px]">
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">playlist_add_check</span>
                        Selected Preferences
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Pick up to 3 rooms in order of priority.</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {[0, 1, 2].map((index) => {
                        const roomId = selectedPreferences[index];
                        const room = rooms.find(r => r.id === roomId);
                        
                        return (
                          <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                            room 
                              ? 'bg-blue-600/5 border border-blue-600/20' 
                              : 'border border-dashed border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}>
                            <div className={`size-6 text-xs font-bold rounded flex items-center justify-center shrink-0 ${
                              room 
                                ? 'bg-blue-600 text-white' 
                                : 'border border-slate-200 dark:border-slate-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              {room ? (
                                <>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{room.name}</p>
                                  <p className="text-[10px] text-slate-500">{room.type.split(' ')[0]} {room.type.includes('AC') ? room.type.split(' ')[1] : 'Non-AC'} • {room.floor.charAt(0)}F</p>
                                </>
                              ) : (
                                <p className="text-xs font-medium italic">Empty preference slot</p>
                              )}
                            </div>
                            {room && (
                              <button 
                                onClick={() => handleRemovePreference(roomId)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">close</span>
                              </button>
                            )}
                          </div>
                        );
                      })}

                      <div className="pt-4 mt-2 space-y-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reason for Request</label>
                          <textarea 
                            className="w-full text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-blue-500/20 placeholder:text-slate-400" 
                            placeholder="e.g., Medical reasons..." 
                            rows="3"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                          ></textarea>
                        </div>
                        <button 
                          onClick={handleSubmit}
                          disabled={loading || selectedPreferences.length === 0 || !reason.trim()}
                          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Submitting...' : 'Submit Request'}
                          <span className="material-symbols-outlined text-sm">send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </section>

            {/* Request Status Tracking Section */}
            <section className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Request Status Tracking</h2>
                <p className="text-sm text-slate-500">Monitor the progress of your room change applications</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Request ID</th>
                        <th className="px-6 py-4">Date Submitted</th>
                        <th className="px-6 py-4">Preferred Rooms</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {requests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{request.id}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{request.date}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              {request.preferredRooms.map((room) => (
                                <span key={room} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[11px]">
                                  {room}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-600 hover:underline font-medium">View details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestRoom;