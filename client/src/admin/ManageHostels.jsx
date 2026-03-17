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
  const [floorTypes, setFloorTypes] = useState(['Non-AC', 'Non-AC', 'Non-AC', 'Non-AC']); // Room type for each floor
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch hostels on component mount
  useEffect(() => {
    // Check if user is logged in as admin
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
      setHostels(data);
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
      // Force refresh to get fresh data
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
      
      // Prepare floors data with room types
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
      
      // Refresh hostels list with force refresh to get latest data
      await fetchHostels(true);
      
      // Reset form and close modal
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
    // Navigate to rooms page with hostel filter or details
    console.log('Viewing hostel details:', hostel.hostel_name);
    // You can navigate to a specific hostel details page or rooms filtered by hostel
    navigate('/admin/rooms', { state: { selectedHostel: hostel.hostel_name } });
  };

  const getOccupancyStatus = (occupancy) => {
    if (occupancy === 100) return { text: 'Full Capacity', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' };
    if (occupancy >= 90) return { text: `${occupancy}% Occupied`, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' };
    if (occupancy >= 70) return { text: `${occupancy}% Occupied`, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' };
    return { text: `${occupancy}% Occupied`, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
  };

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-semibold">Active Hostels</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage all existing hostels and their configurations</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Add Hostel</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">Loading hostels...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && hostels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">apartment</span>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Hostels Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Get started by clicking the "Add Hostel" button above</p>
        </div>
      )}

      {/* Hostels Grid */}
      {!loading && hostels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hostels.map((hostel) => {
            const occupancyStatus = getOccupancyStatus(hostel.occupancy || 0);
            return (
              <div 
                key={hostel.hostel_id} 
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => handleHostelClick(hostel)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`size-12 ${hostel.bg_color || 'bg-blue-50 dark:bg-blue-900/20'} rounded-xl flex items-center justify-center ${hostel.text_color || 'text-blue-600'}`}>
                    <span className="material-symbols-outlined text-3xl">{hostel.icon || 'home'}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHostel(hostel.hostel_id, hostel.hostel_name);
                    }}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete Hostel"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
                <h4 className="font-bold text-lg mb-1">{hostel.hostel_name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {hostel.location || 'Main Campus'}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Floors</p>
                    <p className="font-bold">{hostel.total_floors || 0} Floors</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Total Rooms</p>
                    <p className="font-bold">{hostel.total_rooms || 0} Rooms</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-1 ${occupancyStatus.color} rounded`}>
                    {occupancyStatus.text}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHostelClick(hostel);
                    }}
                    className="text-primary text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                  >
                    View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statistics Cards */}
      {!loading && hostels.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <span className="material-symbols-outlined text-2xl">apartment</span>
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Total Hostels</p>
                <p className="text-3xl font-bold text-white">{hostels.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
                <span className="material-symbols-outlined text-2xl">meeting_room</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Rooms</p>
                <p className="text-3xl font-bold dark:text-white">
                  {hostels.reduce((sum, h) => sum + (h.total_rooms || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Occupied Rooms</p>
                <p className="text-3xl font-bold dark:text-white">
                  {hostels.reduce((sum, h) => sum + (h.occupied_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Hostel Modal */}
      {isModalOpen && (
        <>
          {/* Modal Overlay Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setIsModalOpen(false)}></div>
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-[640px] bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Hostel</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Define the structure and room capacity for your new building.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hostel Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hostel Name *</label>
                    <input 
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      placeholder="e.g., North Wing Residence" 
                      type="text" 
                      value={hostelName}
                      onChange={(e) => setHostelName(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Location */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location *</label>
                    <input 
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      placeholder="e.g., Main Campus" 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {/* Number of Floors */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Floors</label>
                  <div className="relative flex items-center">
                    <input 
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
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
                    />
                  </div>
                </div>
                
                {/* Floor Configuration Header */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Floor Details</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Specify number of rooms for each level</p>
                    </div>
                    <button 
                      onClick={() => {
                        const avgRooms = Math.max(...floorRooms);
                        setFloorRooms(prev => prev.map(() => avgRooms));
                      }}
                      className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">done_all</span>
                      Apply to all
                    </button>
                  </div>
                  
                  {/* Dynamic Floor List */}
                  <div className="space-y-3">
                    {Array.from({ length: totalFloors }, (_, index) => {
                      const floorNum = index + 1;
                      const isWarning = floorRooms[index] === 0;
                      return (
                        <div 
                          key={floorNum}
                          className={`p-4 rounded-xl border ${
                            isWarning 
                              ? 'bg-background-light dark:bg-slate-800/50 border-orange-200 dark:border-orange-900/30' 
                              : 'bg-background-light dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`size-10 rounded-lg flex items-center justify-center ${
                                isWarning 
                                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' 
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                <span className="material-symbols-outlined">layers</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">Floor {floorNum}</p>
                                  {isWarning && <span className="material-symbols-outlined text-orange-500 text-sm">info</span>}
                                </div>
                                <p className="text-xs text-slate-500">
                                  {floorNum === 1 ? 'Ground Level' : floorNum === totalFloors && totalFloors > 3 ? 'Penthouse / Roof' : 'Residential'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1">
                              <button 
                                onClick={() => setFloorRooms(prev => prev.map((rooms, i) => i === index ? Math.max(0, rooms - 1) : rooms))}
                                className="size-8 rounded flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                              >
                                <span className="material-symbols-outlined text-lg">remove</span>
                              </button>
                              <input 
                                className={`w-8 text-center bg-transparent border-none p-0 focus:ring-0 text-sm font-bold ${
                                  isWarning ? 'text-orange-600' : ''
                                }`}
                                type="text" 
                                value={floorRooms[index] || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setFloorRooms(prev => prev.map((rooms, i) => i === index ? value : rooms));
                                }}
                              />
                              <button 
                                onClick={() => setFloorRooms(prev => prev.map((rooms, i) => i === index ? rooms + 1 : rooms))}
                                className="size-8 rounded flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                              >
                                <span className="material-symbols-outlined text-lg">add</span>
                              </button>
                            </div>
                          </div>
                          
                          {/* Room Type Selection */}
                          <div className="flex items-center gap-2 ml-[52px]">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Room Type:</label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setFloorTypes(prev => prev.map((t, i) => i === index ? 'AC' : t))}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${ 
                                  floorTypes[index] === 'AC' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                              >
                                <span className="material-symbols-outlined text-xs mr-1 align-middle">ac_unit</span>
                                AC
                              </button>
                              <button
                                type="button"
                                onClick={() => setFloorTypes(prev => prev.map((t, i) => i === index ? 'Non-AC' : t))}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                                  floorTypes[index] === 'Non-AC' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                              >
                                <span className="material-symbols-outlined text-xs mr-1 align-middle">air</span>
                                Non-AC
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Sticky Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Projected Capacity</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{floorRooms.reduce((sum, rooms) => sum + rooms, 0)} Rooms Total</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 sm:flex-none px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 sm:flex-none px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-lg">add_business</span>
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