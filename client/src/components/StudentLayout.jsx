import { useNavigate, useLocation } from 'react-router-dom';

const StudentLayout = ({ children, title = 'Student Dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const sidebarItems = [
    { path: '/student/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/student/submit-complaint', icon: 'report_problem', label: 'Submit Complaint' },
    { path: '/student/complaints', icon: 'assignment', label: 'My Complaints' },
    { path: '/student/request-room-change', icon: 'swap_horiz', label: 'Room Change' },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <div className="flex h-screen overflow-hidden">
        {/* Persistent Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="bg-blue-500 rounded-lg p-1.5 text-white">
              <span className="material-symbols-outlined text-2xl">apartment</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">HostelPortal</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Student Portal</p>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <div className="pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</div>
            {sidebarItems.map((item) => (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'sidebar-active'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
            
            <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support</div>
            <button 
              onClick={() => navigate('/student/help')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive('/student/help')
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined">help</span>
              <span className="text-sm font-medium">Help & Support</span>
            </button>
            <button 
              onClick={() => navigate('/student/rules')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive('/student/rules')
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined">gavel</span>
              <span className="text-sm font-medium">Hostel Rules</span>
            </button>
          </nav>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button 
              onClick={handleLogout}
              className="w-full py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
          {/* Header */}
          <header className="h-16 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg relative transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
              <div className="flex items-center gap-3 pl-2">
                <button 
                  onClick={() => navigate('/student/dashboard')}
                  className="flex items-center gap-3"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold leading-none">Student</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">View Profile</p>
                  </div>
                  <div 
                    className="size-9 rounded-full bg-slate-200 bg-cover bg-center ring-2 ring-blue-500/10" 
                    style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAcAtE5chVKnohzueKBydUS5pdI7Aka50_jGjA2I9xgyhhlHDxzzRY1VMWyhOApnwrBZPfoOE5yIC5StJDZolZPzeBrzdQvj9KI-gKlmn94GQM4cn4DYBZGpD7g-GDKTmMrys9XmEhQGcGMCWebmb7cLgCbstX8-1QAWAkhEdqzMSIgfKXBJylAkeB7vacUwwJhAvQLswYB26RBqTpE9uNfEyofKMOU3ShFC9DtX98WG8Q8K2gIDBA4WORAjzOWLOOvK4nfJgyF_l0')"}}
                  ></div>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
