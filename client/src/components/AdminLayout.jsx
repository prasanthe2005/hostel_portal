import { useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = ({ children, title = 'Admin Dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const sidebarItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/hostels', icon: 'corporate_fare', label: 'Hostels' },
    { path: '/admin/rooms', icon: 'bed', label: 'Rooms' },
    { path: '/admin/students', icon: 'group', label: 'Students' },
    { path: '/admin/caretakers', icon: 'engineering', label: 'Caretakers' },
    { path: '/admin/wardens', icon: 'shield_person', label: 'Warden' },
    { path: '/admin/room-requests', icon: 'swap_horiz', label: 'Room Requests' },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <div className="flex h-screen overflow-hidden">
        {/* Persistent Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="bg-primary rounded-lg p-1.5 text-white">
              <span className="material-symbols-outlined text-2xl">apartment</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">Hostel Admin</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Management Portal</p>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
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
              onClick={() => navigate('/admin/reports')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined">analytics</span>
              <span className="text-sm font-medium">Reports</span>
            </button>
            <button 
              onClick={() => navigate('/admin/settings')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </button>
          </nav>
          <div className="p-4">
            <button className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-sm transition-all">
              <span className="material-symbols-outlined text-lg">person_add</span>
              New Registration
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
          {/* Header */}
          <header className="h-16 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
              <div className="relative w-full max-w-md ml-8">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400" 
                  placeholder="Search for students, rooms, or transactions..." 
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg relative transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right">
                  <p className="text-sm font-semibold leading-none">James Wilson</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Super Admin</p>
                </div>
                <div 
                  className="size-9 rounded-full bg-slate-200 bg-cover bg-center ring-2 ring-primary/10" 
                  style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBJZ4WMg1L_CW8bXMBJsMufV6FbwzAasxoD-3ycuNpqrXUPoFkuOSj7xIpRo-Zj-D05l54ywAyft0Jc4o9beI1KuHFFE-uPCRE2EAfq4XSUNy4RQYybBnuPnf4FWUkSt7oH_dzEphDAMUaxNE4YFAs53CqOYVzETegELmMkNZEdHM03JXFwRGwFaFvK51NaHcU5fDukvBUpgGxPrWllozZWtU7M6W_z700GhQ5aFBozZj0QIv_TadvIw9rs_slWeoCDZtJsqPjGRgs')"}}
                ></div>
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

export default AdminLayout;