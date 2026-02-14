import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/student.service.js';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const profile = await studentService.getProfile();
      const roomDetails = await studentService.getRoomDetails();
      const feeDetails = await studentService.getFeeDetails();
      
      setStudentData({
        profile,
        room: roomDetails,
        fees: feeDetails
      });
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navigateToRoomChange = () => {
    navigate('/student/request-room');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-display text-slate-900 bg-slate-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
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
            <a className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-lg font-medium transition-all cursor-pointer">
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </a>
            <a 
              onClick={navigateToRoomChange}
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all cursor-pointer"
            >
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
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
            <h1 className="text-xl font-bold text-slate-800">Student Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">
                  {studentData?.profile?.name || 'Alex Johnson'}
                </p>
                <p className="text-xs text-slate-500">
                  {studentData?.profile?.studentId || '2021CSE0452'}
                </p>
              </div>
              <div 
                className="size-10 rounded-full bg-slate-200 border border-slate-300 bg-cover bg-center" 
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAcAtE5chVKnohzueKBydUS5pdI7Aka50_jGjA2I9xgyhhlHDxzzRY1VMWyhOApnwrBZPfoOE5yIC5StJDZolZPzeBrzdQvj9KI-gKlmn94GQM4cn4DYBZGpD7g-GDKTmMrys9XmEhQGcGMCWebmb7cLgCbstX8-1QAWAkhEdqzMSIgfKXBJylAkeB7vacUwwJhAvQLswYB26RBqTpE9uNfEyofKMOU3ShFC9DtX98WG8Q8K2gIDBA4WORAjzOWLOOvK4nfJgyF_l0')"
                }}
              ></div>
            </div>
          </header>

          {/* Content */}
          <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Personal Information Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-900">person</span>
                <h2 className="font-bold text-slate-800 tracking-tight">Personal Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Student Name</p>
                    <p className="text-slate-900 font-semibold text-lg">
                      {studentData?.profile?.name || 'Alex Johnson'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Roll Number</p>
                    <p className="text-slate-900 font-semibold text-lg">
                      {studentData?.profile?.studentId || '2021CSE0452'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                    <p className="text-slate-900 font-semibold text-lg">
                      {studentData?.profile?.department || 'Computer Science & Engineering'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Year</p>
                    <p className="text-slate-900 font-semibold text-lg">
                      {studentData?.profile?.academicYear || '3rd Year (Junior)'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Residential Address</p>
                    <p className="text-slate-900 font-medium">
                      {studentData?.profile?.address || '452 Academic Avenue, Research Park District, Silicon Valley, CA 94025'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Hostel Allocation Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-900">apartment</span>
                <h2 className="font-bold text-slate-800 tracking-tight">Hostel Allocation</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hostel</p>
                    <p className="text-slate-900 font-bold">
                      {studentData?.room?.hostel || 'Evergreen Residency'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Floor</p>
                    <p className="text-slate-900 font-bold">
                      {studentData?.room?.floor || '3rd Floor'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Room No</p>
                    <p className="text-slate-900 font-bold">
                      {studentData?.room?.room || 'R-304'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Type</p>
                    <p className="text-slate-900 font-bold">
                      {studentData?.room?.roomType || 'Premium AC'}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;