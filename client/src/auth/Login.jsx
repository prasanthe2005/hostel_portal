import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { adminService } from '../services/admin.service.js';
import { studentService } from '../services/student.service.js';
import { caretakerService } from '../services/caretaker.service.js';
import tabSession from '../utils/tabSession.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
    userType: 'student',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Show success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleUserTypeChange = (userType) => {
    setFormData({
      ...formData,
      userType
    });
    setError('');
  };

  // Demo mode for testing - bypasses authentication
  const handleDemoLogin = (userType) => {
    // Set demo credentials using tab session
    const demoData = {
      token: 'demo-token-' + userType,
      userRole: userType,
      userName: userType === 'admin' ? 'Admin Demo' : 'Student Demo',
      userData: {
        name: userType === 'admin' ? 'Admin Demo' : 'Student Demo',
        email: userType === 'admin' ? 'admin@demo.com' : 'student@demo.com',
        id: userType === 'admin' ? 'admin-001' : 'student-001'
      }
    };
    
    tabSession.setAuth(demoData.token, demoData.userRole, demoData.userName, demoData.userData);
    console.log(`🎭 Demo login: Tab ${tabSession.getTabId()} logged in as ${userType}`);
    
    // Navigate to appropriate dashboard
    if (userType === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const credentials = {
        email: formData.email,
        password: formData.password
      };

      let response;
      if (formData.userType === 'admin') {
        // Only allow admin@example.com to access admin panel
        if (formData.email !== 'admin@example.com') {
          setError('Unauthorized admin access. Only admin@example.com can access the admin panel.');
          setLoading(false);
          return;
        }
        
        response = await adminService.login(credentials);
        
        // Verify the response contains admin role
        if (!response || !response.token || !response.user) {
          setError('Invalid response from server.');
          setLoading(false);
          return;
        }
        
        if (response.user.role !== 'admin') {
          setError('Invalid admin credentials.');
          setLoading(false);
          return;
        }
        
        // Save all auth data using tab session
        tabSession.setAuth(response.token, 'admin', response.user.name, response.user);
        console.log(`✅ Admin login: Tab ${tabSession.getTabId()} authenticated`);
        
        navigate('/admin/dashboard');
      } else if (formData.userType === 'staff') {
        // Staff (Caretaker) login
        console.log('=== STAFF LOGIN START ===');
        console.log('Email:', credentials.email);
        
        response = await caretakerService.login(credentials.email, credentials.password);
        
        console.log('Caretaker login response:', response);
        
        // Verify the response
        if (!response || !response.token || !response.user) {
          console.error('❌ Invalid response from server:', response);
          setError('Invalid response from server.');
          setLoading(false);
          return;
        }
        
        // Save auth data using tab session
        tabSession.setAuth(response.token, 'caretaker', response.user.name, response.user);
        console.log(`✅ Caretaker login: Tab ${tabSession.getTabId()} authenticated as ${response.user.name}`);
        
        navigate('/caretaker/dashboard');
      } else {
        // Student login
        response = await studentService.login(credentials);
        
        // Verify the response contains student role
        if (!response || !response.token || !response.user) {
          setError('Invalid response from server.');
          setLoading(false);
          return;
        }
        
        if (response.user.role !== 'student') {
          setError('Invalid student credentials.');
          setLoading(false);
          return;
        }
        
        // Save all auth data using tab session
        tabSession.setAuth(response.token, 'student', response.user.name, response.user);
        console.log(`✅ Student login: Tab ${tabSession.getTabId()} authenticated as ${response.user.name}`);
        
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center font-display">
      <div className="flex h-screen w-full overflow-hidden flex-col md:flex-row">
        {/* Left Side: Campus Image & Branding */}
        <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-blue-600 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCF3wlPEBDyHRZRSrEUsGO5d4PGe9WT0BrJZrFZizN6NGOcm6Pk1WQq6R283PaDQPNRfqAtqTdWYkHBh5aPe74E0OrNM6WDU7hDb7PT2WbQ2kFvA1NgcmfIfyzUYalEooxcfEeFM-eOXfk-2gEXrnd1jceMR-ewdGo2fBAuilt_8GPSFwznX-UB7RTQWgAf8tQ1f1ULdSufYdYXCyueNlIv7upxq3dqEQh76fPGqX6IaxV4QQO_i8UzSNV0A70Cw1C_C7xErA4QPGM')"}}
          ></div>
          <div className="absolute inset-0 bg-blue-600/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-lg">
                <span className="material-symbols-outlined text-3xl font-bold">domain</span>
              </div>
              <span className="text-2xl font-black tracking-tight">HostelHub</span>
            </div>
            <div className="max-w-md">
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                The ultimate stay management experience.
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Streamlining room allocations, facility bookings, and student lifestyle management for modern educational institutions.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex -space-x-2">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden bg-cover bg-center" 
                  style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKndoUqJmoXECNc9_jmZybAmGpgPkC2yEKL10xbbQ3L20shwl9_TzhX6F5YIXGnj2qaaV7PBZs4praVVtd8m7Wdbs3TvHO7G85G5SidGar8-fwFguX80NyWp0gAW4UjbFURSfBHdzaW86h0_SJ-b1AkusDpm5DI9geuJQg-Uf06XYGoO2h_SzO6wZNgjhzJofMKsIwbL-li4mFjCismyRtFVzfKjaMAMYmA0vX6emLPAK7t5W8Y2lHo7a0crxtRfjWnTyf6IA5BoI')"}}
                ></div>
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden bg-cover bg-center" 
                  style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDppE8nY5kOM2GyH9--vN8XBMFoIZpsI2JOQKn3k7lAnELvs2vOgVwHMmveGI9X7awyZ5OgGtdpvVjFkVmpKs50I7bT89EL5Ms5Ti30cA-Xbfvp_-4kJCnNMwUEAxsT510AvTM_BY4Dxzt5z-9BkCAlJXHRg8uAVkwL8fWthQvZVr_i0oDyhXW0_WJb5qhzupZMuQnOxgYqA6MoehxW5OksW0z6QENBAVZm4o0fpVM9TrJOKyc8EgSMwtLd6hmpQH4u5Bv5MsRsYKQ')"}}
                ></div>
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden bg-cover bg-center" 
                  style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBecYB57hzrt49fyTGA6vHQdbj50qYozQLtzpa8Mf74xu8n4WHWhtk91ikFXHkeKsTGcXyAE3wrNkgk3A2r6TtCtk4oRw0kHQRSvBf_eD3RMC8kDf7WOlc5IwfiYRrFLZ_6vdz1XdmyYyuJ8f-LbdYFjVhCEuBfqE2EiUr6esjm0LFIluzXOPpGRh507eBXcRbeeZoFN79bzQy_1-mdB6uZ7I6UsyDmQqFODxE4lllAXOWVWMPOxcQ5Q5dPWXxGg642rNVrJ1Llbdk')"}}
                ></div>
              </div>
              <span>Trusted by over 5,000+ residents worldwide.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center p-8 lg:p-16 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="w-full max-w-[420px]">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-2 mb-10">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-xl">domain</span>
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">HostelHub</span>
            </div>

            {/* Role Icon Display */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 mb-2 ring-4 ring-blue-50/50 dark:ring-blue-900/10 transition-all duration-300">
                <span className="material-symbols-outlined text-5xl">
                  {formData.userType === 'student' ? 'school' : 
                   formData.userType === 'staff' ? 'assignment_ind' : 
                   'admin_panel_settings'}
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base">
                Access your personalized hostel portal
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-5 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">
                  Email Address / Username
                </label>
                <div className="relative">
                  <input 
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-12 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-gray-600" 
                    placeholder="e.g. resident@campus.edu" 
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input 
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-12 px-4 pr-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-gray-600" 
                    placeholder="Enter your password" 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button 
                    className="absolute right-4 text-gray-600 hover:text-blue-600 transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-3 pt-2">
                <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal block">
                  Select Your Role
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative">
                    <label 
                      className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer hover:border-blue-500/50 transition-all text-sm font-bold ${
                        formData.userType === 'student' 
                          ? 'border-blue-600 bg-blue-600/5 text-blue-600' 
                          : 'border-gray-300 dark:border-gray-700 text-gray-600'
                      }`}
                      onClick={() => handleUserTypeChange('student')}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 mb-2 transition-all ${
                        formData.userType === 'student' 
                          ? 'border-blue-600 border-[5px]' 
                          : 'border-gray-300'
                      }`}></span>
                      Student
                    </label>
                  </div>
                  <div className="relative">
                    <label 
                      className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer hover:border-blue-500/50 transition-all text-sm font-bold ${
                        formData.userType === 'staff' 
                          ? 'border-blue-600 bg-blue-600/5 text-blue-600' 
                          : 'border-gray-300 dark:border-gray-700 text-gray-600'
                      }`}
                      onClick={() => handleUserTypeChange('staff')}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 mb-2 transition-all ${
                        formData.userType === 'staff' 
                          ? 'border-blue-600 border-[5px]' 
                          : 'border-gray-300'
                      }`}></span>
                      Staff
                    </label>
                  </div>
                  <div className="relative">
                    <label 
                      className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer hover:border-blue-500/50 transition-all text-sm font-bold ${
                        formData.userType === 'admin' 
                          ? 'border-blue-600 bg-blue-600/5 text-blue-600' 
                          : 'border-gray-300 dark:border-gray-700 text-gray-600'
                      }`}
                      onClick={() => handleUserTypeChange('admin')}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 mb-2 transition-all ${
                        formData.userType === 'admin' 
                          ? 'border-blue-600 border-[5px]' 
                          : 'border-gray-300'
                      }`}></span>
                      Admin
                    </label>
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-700 bg-transparent text-blue-600 checked:bg-blue-600 checked:border-blue-600 focus:ring-0 focus:ring-offset-0 transition-colors" 
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <span className="text-gray-900 dark:text-gray-300 text-sm font-medium group-hover:text-blue-600 transition-colors">
                    Remember me
                  </span>
                </label>
                <a 
                  className="text-blue-600 text-sm font-semibold hover:underline decoration-2 underline-offset-4" 
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-bold text-base shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                <span className="material-symbols-outlined text-xl">login</span>
              </button>
            </form>

            {/* Register Link - Only for Students */}
            <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-800 text-center">
              <p className="text-gray-600 text-sm leading-relaxed">
                {formData.userType === 'student' ? (
                  <>
                    Don't have an account yet? 
                    <Link className="text-blue-600 font-bold hover:underline ml-1" to="/register">
                      Register here
                    </Link>
                  </>
                ) : (
                  <>
                    {formData.userType === 'staff' ? 'Staff credentials are provided by administration' : 'Admin access is restricted'}
                  </>
                )}
                <span className="mx-2">•</span>
                <a className="text-gray-600 hover:text-blue-600 transition-colors" href="#">
                  Contact Support
                </a>
              </p>
            </div>

            {/* Footer Links */}
            <div className="mt-8 flex justify-center gap-6">
              <a className="text-gray-500 hover:text-blue-600 transition-colors" href="#" title="Support">
                <span className="material-symbols-outlined text-xl">help</span>
              </a>
              <a className="text-gray-500 hover:text-blue-600 transition-colors" href="#" title="Privacy Policy">
                <span className="material-symbols-outlined text-xl">description</span>
              </a>
              <a className="text-gray-500 hover:text-blue-600 transition-colors" href="#" title="Language">
                <span className="material-symbols-outlined text-xl">language</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}