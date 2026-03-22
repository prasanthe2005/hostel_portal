import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import tabSession from '../utils/tabSession';

const ManageHostels = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hostelName, setHostelName] = useState('');
  const [location, setLocation] = useState('');
  const [totalFloors, setTotalFloors] = useState(4);
  const [floorRooms, setFloorRooms] = useState([12, 15, 15, 0]);
  const [floorTypes, setFloorTypes] = useState(['Non-AC', 'Non-AC', 'Non-AC', 'Non-AC']);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const normalizeHostelsResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.hostels)) return data.hostels;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  useEffect(() => {
    const token = tabSession.getToken();
    const userRole = tabSession.getUserRole();

    if (!token) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    if (userRole !== 'admin') {
      alert('Access denied. Admin only.');
      navigate('/');
      return;
    }

    fetchHostels();
  }, [navigate]);

  const fetchHostels = async (forceRefresh = false) => {
    try {
      setLoading(true);
      console.log('Fetching hostels...');
      const data = await adminService.getHostels(forceRefresh);
      console.log('Hostels fetched:', data);
      const normalizedHostels = normalizeHostelsResponse(data);
      setHostels(normalizedHostels);
    } catch (error) {
      console.error('Failed to fetch hostels:', error);
      if (error.message && (error.message.includes('Forbidden') || error.message.includes('Unauthorized'))) {
        alert('Session expired or unauthorized. Please login again.');
        await adminService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHostel = async (hostelId, hostelName) => {
    if (!confirm(`Are you sure you want to delete ${hostelName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteHostel(hostelId);
      alert('Hostel deleted successfully!');
      await fetchHostels(true);
    } catch (error) {
      console.error('Failed to delete hostel:', error);
      alert(error.message || 'Failed to delete hostel. Please ensure no students are allocated.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hostelName.trim()) {
      alert('Please enter a hostel name');
      return;
    }

    if (!location.trim()) {
      alert('Please enter a location');
      return;
    }

    try {
      setSubmitting(true);

      const floors = floorRooms.map((rooms, index) => ({
        rooms,
        type: floorTypes[index] || 'Non-AC'
      }));

      const payload = {
        hostel_name: hostelName,
        location: location,
        floors: floors,
        icon: 'home',
        bg_color: 'bg-blue-50 dark:bg-blue-900/20',
        text_color: 'text-blue-600'
      };

      console.log('Creating hostel with payload:', payload);

      await adminService.createHostel(payload);

      await fetchHostels(true);

      setHostelName('');
      setLocation('');
      setTotalFloors(4);
      setFloorRooms([12, 15, 15, 0]);
      setFloorTypes(['Non-AC', 'Non-AC', 'Non-AC', 'Non-AC']);
      setIsModalOpen(false);

      alert('Hostel created successfully!');
    } catch (error) {
      console.error('Failed to create hostel:', error);
      const errorMessage = error.message || 'Failed to create hostel. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHostelClick = (hostel) => {
    console.log('Viewing hostel details:', hostel.hostel_name);
    navigate('/admin/rooms', { state: { selectedHostel: hostel.hostel_name } });
  };

  const getOccupancyStatus = (occupancy) => {
    if (occupancy === 100) return { text: 'Full Capacity', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' };
    if (occupancy >= 90) return { text: `${occupancy}% Occupied`, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' };
    if (occupancy >= 70) return { text: `${occupancy}% Occupied`, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' };
    return { text: `${occupancy}% Occupied`, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' };
  };

  const hostelList = Array.isArray(hostels) ? hostels : [];
  const totalRooms = hostelList.reduce((sum, h) => sum + (h.total_rooms || 0), 0);
  const totalOccupied = hostelList.reduce((sum, h) => sum + (h.occupied_count || 0), 0);

  return (
    <div className="p-6 space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Hostels</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all existing hostels and their configurations</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          Add Hostel
        </button>
      </div>

      {/* ── Stats Tiles (only show when data loaded) ── */}
      {!loading && hostelList.length > 0 && (
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Hostel Overview</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">Total Hostels</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 16 }}>apartment</span>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{hostelList.length}</p>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wide mb-1">Total Rooms</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: 16 }}>meeting_room</span>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{totalRooms}</p>
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wide mb-1">Occupied Rooms</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400" style={{ fontSize: 16 }}>groups</span>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{totalOccupied}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && hostelList.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 py-16 text-center">
          <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-3">apartment</span>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">No Hostels Yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Get started by clicking "Add Hostel" above</p>
        </div>
      )}

      {/* ── Hostels Grid ── */}
      {!loading && hostelList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {hostelList.map((hostel) => {
            const occupancyStatus = getOccupancyStatus(hostel.occupancy || 0);
            return (
              <div
                key={hostel.hostel_id}
                className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-5 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group cursor-pointer"
                onClick={() => handleHostelClick(hostel)}
              >
                {/* Card top: icon + delete */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 22 }}>
                      {hostel.icon || 'apartment'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHostel(hostel.hostel_id, hostel.hostel_name);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete Hostel"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  </button>
                </div>

                {/* Name + location */}
                <h4 className="font-bold text-base text-gray-900 dark:text-white mb-1">{hostel.hostel_name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-4">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>
                  {hostel.location || 'Main Campus'}
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-slate-700 mb-3">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Floors</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{hostel.total_floors || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Rooms</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{hostel.total_rooms || 0}</p>
                  </div>
                </div>

                {/* Footer: occupancy + view link */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${occupancyStatus.color}`}>
                    {occupancyStatus.text}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHostelClick(hostel);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                  >
                    View Rooms
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Hostel Modal ── */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-[640px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">

              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-b border-gray-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Hostel</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Define the structure and room capacity for your new building.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* Basic Info */}
                <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 14 }}>apartment</span>
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Hostel Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., North Wing Residence"
                        value={hostelName}
                        onChange={(e) => setHostelName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Location *</label>
                      <input
                        type="text"
                        placeholder="e.g., Main Campus"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </section>

                {/* Total Floors */}
                <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 14 }}>layers</span>
                    Building Structure
                  </h4>
                  <div className="max-w-[160px]">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Total Floors</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={totalFloors}
                      onChange={(e) => {
                        const floors = parseInt(e.target.value) || 0;
                        setTotalFloors(floors);
                        setFloorRooms(prev => {
                          const newRooms = [...prev];
                          while (newRooms.length < floors) newRooms.push(0);
                          return newRooms.slice(0, floors);
                        });
                        setFloorTypes(prev => {
                          const newTypes = [...prev];
                          while (newTypes.length < floors) newTypes.push('Non-AC');
                          return newTypes.slice(0, floors);
                        });
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </section>

                {/* Floor Details */}
                <section className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 14 }}>view_list</span>
                      Floor Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const avgRooms = Math.max(...floorRooms);
                        setFloorRooms(prev => prev.map(() => avgRooms));
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>done_all</span>
                      Apply Max to All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {Array.from({ length: totalFloors }, (_, index) => {
                      const floorNum = index + 1;
                      const isWarning = floorRooms[index] === 0;
                      return (
                        <div
                          key={floorNum}
                          className={`p-3 rounded-lg border ${
                            isWarning
                              ? 'bg-orange-50/60 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/40'
                              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            {/* Floor label */}
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isWarning
                                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              }`}>
                                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>layers</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Floor {floorNum}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {floorNum === 1 ? 'Ground Level' : floorNum === totalFloors && totalFloors > 3 ? 'Top Floor' : 'Residential'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Room Type toggle */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setFloorTypes(prev => prev.map((t, i) => i === index ? 'AC' : t))}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                                    floorTypes[index] === 'AC'
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600'
                                  }`}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 11 }}>ac_unit</span>
                                  AC
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFloorTypes(prev => prev.map((t, i) => i === index ? 'Non-AC' : t))}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                                    floorTypes[index] === 'Non-AC'
                                      ? 'bg-green-600 text-white border-green-600'
                                      : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600'
                                  }`}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 11 }}>air</span>
                                  Non-AC
                                </button>
                              </div>

                              {/* Room counter */}
                              <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 px-1 py-0.5">
                                <button
                                  type="button"
                                  onClick={() => setFloorRooms(prev => prev.map((rooms, i) => i === index ? Math.max(0, rooms - 1) : rooms))}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 transition-colors"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>remove</span>
                                </button>
                                <input
                                  type="text"
                                  value={floorRooms[index] || 0}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    setFloorRooms(prev => prev.map((rooms, i) => i === index ? value : rooms));
                                  }}
                                  className={`w-8 text-center bg-transparent border-none p-0 focus:ring-0 text-sm font-bold ${
                                    isWarning ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setFloorRooms(prev => prev.map((rooms, i) => i === index ? rooms + 1 : rooms))}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 transition-colors"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-100 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-900/60 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Projected Capacity</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {floorRooms.reduce((sum, rooms) => sum + rooms, 0)} Rooms Total
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_business</span>
                    {submitting ? 'Creating...' : 'Create Hostel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageHostels;