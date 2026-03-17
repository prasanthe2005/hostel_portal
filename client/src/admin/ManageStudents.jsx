import { useState, useEffect } from 'react';
import adminService from '../services/admin.service';
import { clearSessionData } from '../utils/sessionManager';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      console.log('🔄 Loading students and rooms data...');
      const [studentsData, roomsData] = await Promise.all([
        adminService.getAllStudents(),
        adminService.getRooms()
      ]);
      console.log('📊 Students loaded:', studentsData.length, 'students');
      console.log('Students data:', studentsData);
      console.log('📊 Rooms loaded:', roomsData.length, 'rooms');
      setStudents(studentsData);
      setRooms(roomsData);
    } catch (err) {
      console.error('❌ Error loading data:', err);
      console.error('Error details:', err.response || err.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleRefresh() {
    console.log('🔄 Force refreshing students data...');
    // Clear cached data
    clearSessionData('admin_students');
    clearSessionData('admin_rooms');
    setLoading(true);
    await loadData();
  }

  async function handleAllocateRoom() {
    if (!selectedStudent || !selectedRoom) {
      alert('Please select both student and room');
      return;
    }

    try {
      console.log('Allocating room:', {
        student: selectedStudent.student_id,
        studentName: selectedStudent.name,
        room: selectedRoom
      });
      
      const result = await adminService.allocateRoomToStudent(selectedStudent.student_id, selectedRoom);
      
      console.log('Allocation result:', result);
      alert(`✅ Room allocated successfully!\n${selectedStudent.name} → Room ${result.room || ''}`);
      
      // Clear selections
      setSelectedStudent(null);
      setSelectedRoom('');
      
      // Clear cache and reload fresh data
      clearSessionData('admin_students');
      clearSessionData('admin_rooms');
      await loadData();
    } catch (err) {
      console.error('❌ Error allocating room:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        data: err.response?.data
      });
      
      // Show detailed error message
      const errorMessage = err.response?.data?.error || err.message || 'Failed to allocate room';
      alert(`❌ Failed to allocate room\n\n${errorMessage}`);
    }
  }

  async function handleBulkAllocate() {
    if (!window.confirm('Allocate rooms to all unassigned students on first-come-first-serve basis?')) {
      return;
    }

    try {
      const result = await adminService.allocateRooms();
      console.log('Bulk allocation result:', result);
      alert('✅ Bulk allocation completed!');
      
      // Clear cache and reload
      clearSessionData('admin_students');
      clearSessionData('admin_rooms');
      await loadData();
    } catch (err) {
      console.error('❌ Error in bulk allocation:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to allocate rooms';
      alert(`❌ Failed to allocate rooms\n\n${errorMessage}`);
    }
  }

  async function handleDeallocate(studentId) {
    if (!window.confirm('Remove this student from their current room?')) {
      return;
    }

    try {
      await adminService.deallocateRoom(studentId);
      alert('✅ Room deallocated successfully!');
      
      // Clear cache and reload
      clearSessionData('admin_students');
      clearSessionData('admin_rooms');
      await loadData();
    } catch (err) {
      console.error('❌ Error deallocating room:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to deallocate room';
      alert(`❌ Failed to deallocate room\n\n${errorMessage}`);
    }
  }

  const availableRooms = rooms.filter(r => (r.assigned || 0) < (r.capacity || 1));
  const allocatedStudents = students.filter(s => s.room_number);
  const unallocatedStudents = students.filter(s => !s.room_number);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Students</h2>
          <p className="text-slate-500 text-sm mt-1">
            View student profiles and allocate rooms
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            disabled={loading}
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh
          </button>
          <button
            onClick={handleBulkAllocate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Auto-Allocate (FCFS)
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Total Students</p>
          <h3 className="text-2xl font-bold">{students.length}</h3>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
          <p className="text-sm text-green-700">Allocated</p>
          <h3 className="text-2xl font-bold text-green-700">{allocatedStudents.length}</h3>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 shadow-sm">
          <p className="text-sm text-orange-700">Unallocated</p>
          <h3 className="text-2xl font-bold text-orange-700">{unallocatedStudents.length}</h3>
        </div>
      </div>

      {/* Manual Allocation Panel */}
      {selectedStudent && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Allocate Room to: {selectedStudent.name}</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm mb-1">Select Available Room</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Select Room --</option>
                {availableRooms.map(room => (
                  <option key={room.room_id} value={room.room_id}>
                    Room {room.room_number} - {room.type} 
                    (Available: {room.capacity - (room.assigned || 0)}/{room.capacity})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAllocateRoom}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Allocate
            </button>
            <button
              onClick={() => { setSelectedStudent(null); setSelectedRoom(''); }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Unallocated Students Table */}
      {unallocatedStudents.length > 0 && (
        <div className="bg-white rounded-lg border shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Unallocated Students</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Roll Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Year</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unallocatedStudents.map((student) => (
                  <tr key={student.student_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{student.student_id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                    <td className="px-4 py-3 text-sm">{student.roll_number || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{student.year ? `${student.year}${['st','nd','rd','th'][Math.min(student.year-1,3)]}` : 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{student.department || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{student.email}</td>
                    <td className="px-4 py-3 text-sm">{student.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Allocate Room
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allocated Students Table */}
      <div className="bg-white rounded-lg border shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Allocated Students</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Roll Number</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Year</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Hostel</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Room</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocatedStudents.map((student) => (
                <tr key={student.student_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{student.student_id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                  <td className="px-4 py-3 text-sm">{student.roll_number || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{student.year ? `${student.year}${['st','nd','rd','th'][Math.min(student.year-1,3)]}` : 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{student.department || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{student.email}</td>
                  <td className="px-4 py-3 text-sm">{student.phone || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{student.hostel_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">
                    {student.room_number}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleDeallocate(student.student_id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
