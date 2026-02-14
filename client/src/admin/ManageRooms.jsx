import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/admin.service';

const ManageRooms = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchHostels();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const data = await adminService.getHostels();
      setHostels(data);
    } catch (error) {
      console.error('Failed to fetch hostels:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'available': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'maintenance': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const getTypeColor = (type) => {
    return type === 'AC' 
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  const filteredRooms = rooms.filter(room => {
    if (selectedFilter !== 'all' && room.status !== selectedFilter) return false;
    if (selectedHostel !== 'all' && room.hostel_id !== parseInt(selectedHostel)) return false;
    if (selectedType !== 'all' && room.type !== selectedType) return false;
    if (searchTerm && !room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !room.hostel_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await adminService.deleteRoom(roomId);
      await fetchRooms();
      alert('Room deleted successfully!');
    } catch (error) {
      alert(error.message || 'Failed to delete room');
    }
  };

  const handleConvertRoomType = async (roomId, currentType) => {
    // Find the room to check if it has assigned students
    const room = rooms.find(r => r.room_id === roomId);
    if (room && room.assigned > 0) {
      alert(`Cannot convert room type! This room has ${room.assigned} student(s) assigned. Please deallocate students first.`);
      return;
    }
    
    const newType = currentType === 'AC' ? 'Non-AC' : 'AC';
    if (!confirm(`Convert this room from ${currentType} to ${newType}?`)) return;
    
    try {
      await adminService.updateRoom(roomId, { type: newType });
      await fetchRooms();
      alert(`Room converted to ${newType} successfully!`);
    } catch (error) {
      alert(error.error || error.message || 'Failed to convert room type');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Manage Rooms</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage all hostel rooms</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="Search room number, hostel..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <select 
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium"
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
          >
            <option value="all">All Hostels</option>
            {hostels.map(h => (
              <option key={h.hostel_id} value={h.hostel_id}>{h.hostel_name}</option>
            ))}
          </select>
          
          <select 
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="AC">AC</option>
            <option value="Non-AC">Non-AC</option>
          </select>
          
          <select 
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">Loading rooms...</div>
        </div>
      )}

      {/* Rooms Table */}
      {!loading && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Room Number</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Hostel</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Floor</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Capacity</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Occupied</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No rooms found
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr key={room.room_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-6 py-4 text-sm font-semibold dark:text-white">
                        {room.room_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {room.hostel_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {room.floor_number ? `Floor ${room.floor_number}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(room.type)}`}>
                          {room.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {room.capacity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {room.assigned || 0}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(room.status)}`}>
                          {room.status?.charAt(0).toUpperCase() + room.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleConvertRoomType(room.room_id, room.type)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium flex items-center gap-1"
                            title={`Convert to ${room.type === 'AC' ? 'Non-AC' : 'AC'}`}
                          >
                            <span className="material-symbols-outlined text-sm">sync_alt</span>
                            Convert
                          </button>
                          <button 
                            onClick={() => handleDeleteRoom(room.room_id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 font-medium flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics */}
      {!loading && rooms.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Rooms</p>
            <p className="text-2xl font-bold dark:text-white">{rooms.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
            <p className="text-2xl font-bold text-green-600">{rooms.filter(r => r.status === 'available').length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Occupied</p>
            <p className="text-2xl font-bold text-red-600">{rooms.filter(r => r.status === 'occupied').length}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">ac_unit</span>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">AC Rooms</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{rooms.filter(r => r.type === 'AC').length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600">air</span>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Non-AC Rooms</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{rooms.filter(r => r.type === 'Non-AC').length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
