import { useState, useEffect } from 'react';
import adminService from '../services/admin.service';
import { clearSessionData } from '../utils/sessionManager';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('unallocated');

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

      setSelectedStudent(null);
      setSelectedRoom('');

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

  const initials = (name) =>
    name ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '??';

  const formatYear = (year) =>
    year ? `${year}${['st', 'nd', 'rd', 'th'][Math.min(year - 1, 3)]} Year` : 'N/A';

  const activeList = activeTab === 'unallocated' ? unallocatedStudents : allocatedStudents;
  const filtered = activeList.filter((s) => {
    const q = search.toLowerCase();
    return !q
      || s.name?.toLowerCase().includes(q)
      || s.roll_number?.toLowerCase().includes(q)
      || s.department?.toLowerCase().includes(q)
      || s.email?.toLowerCase().includes(q)
      || s.room_number?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Students</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View student profiles and allocate rooms</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
            Refresh
          </button>
          <button
            onClick={handleBulkAllocate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
            Auto-Allocate (FCFS)
          </button>
        </div>
      </div>

      {/* ── Stats Tiles (same style as warden/caretaker) ── */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Student Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">Total Students</p>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 16 }}>group</span>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{students.length}</p>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wide mb-1">Allocated</p>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400" style={{ fontSize: 16 }}>check_circle</span>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{allocatedStudents.length}</p>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wide mb-1">Unallocated</p>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-orange-600 dark:text-orange-400" style={{ fontSize: 16 }}>schedule</span>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{unallocatedStudents.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Manual Allocation Panel ── */}
      {selectedStudent && (
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-100 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold flex-shrink-0">
              {initials(selectedStudent.name)}
            </div>
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Allocating Room For</p>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{selectedStudent.name} &bull; {selectedStudent.roll_number}</p>
            </div>
          </div>
          <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Select Available Room
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select a Room —</option>
                {availableRooms.map(room => (
                  <option key={room.room_id} value={room.room_id}>
                    {room.hostel_name || 'Hostel'} · Room {room.room_number} · {room.type} · Available: {room.capacity - (room.assigned || 0)}/{room.capacity}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAllocateRoom}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                Allocate
              </button>
              <button
                onClick={() => { setSelectedStudent(null); setSelectedRoom(''); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Students Table Section ── */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">

        {/* Section header: tabs + search */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('unallocated')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                activeTab === 'unallocated'
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
              Unallocated
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === 'unallocated' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                {unallocatedStudents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('allocated')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                activeTab === 'allocated'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
              Allocated
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === 'allocated' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                {allocatedStudents.length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 16 }}>search</span>
            <input
              type="text"
              placeholder="Search name, roll, dept…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-9 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sub-label */}
        <div className="px-6 py-2 border-b border-gray-50 dark:border-slate-700/50">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Showing {filtered.length} of {activeList.length} {activeTab === 'unallocated' ? 'unallocated' : 'allocated'} students
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-3">person_search</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {search ? `No students matching "${search}"` : `No ${activeTab} students`}
              </p>
            </div>
          ) : activeTab === 'unallocated' ? (
            /* ── Unallocated Table ── */
            <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  {['Student', 'Roll No.', 'Year', 'Department', 'Phone', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {initials(student.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{student.name}</p>
                          <p className="text-xs text-gray-400 truncate">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{student.roll_number || 'N/A'}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{formatYear(student.year)}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        {student.department || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{student.phone || 'N/A'}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>meeting_room</span>
                        Allocate Room
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* ── Allocated Table ── */
            <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  {['Student', 'Roll No.', 'Year', 'Department', 'Phone', 'Hostel', 'Room', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {initials(student.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{student.name}</p>
                          <p className="text-xs text-gray-400 truncate">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{student.roll_number || 'N/A'}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{formatYear(student.year)}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        {student.department || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{student.phone || 'N/A'}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{student.hostel_name || 'N/A'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-green-500" style={{ fontSize: 14 }}>meeting_room</span>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">{student.room_number}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDeallocate(student.student_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_remove</span>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40">
            <p className="text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''} shown</p>
          </div>
        )}
      </section>
    </div>
  );
}