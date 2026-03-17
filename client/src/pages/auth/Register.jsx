import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
    year: '',
    department: '',
    address: '',
    phone: '',
    parentContact: '',
    gender: '',
    residenceType: 'Hosteller',
    preferredRoomType: 'Non-AC',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
    setSuccess(false);
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '' };
    if (password.length < 6) return { strength: 1, text: 'Weak' };
    if (password.length < 8) return { strength: 2, text: 'Medium Strength' };
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 4, text: 'Strong' };
    }
    return { strength: 3, text: 'Good' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      // Prepare payload expected by backend
      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        roll_number: formData.rollNumber,
        year: parseInt(formData.year) || null,
        department: formData.department,
        address: formData.address,
        phone: formData.phone,
        parent_contact: formData.parentContact,
        gender: formData.gender,
        residence_type: formData.residenceType,
        preferred_room_type: formData.preferredRoomType
      };

      console.log('Sending registration data:', { ...payload, password: '***' });

      // Call backend register endpoint - this stores data in students table
      const registerRes = await api.post('/auth/register', payload);
      
      console.log('Registration successful! Response:', registerRes);
      
      // Show success message (no token returned, registration returns success message)
      if (registerRes && (registerRes.message || registerRes.user)) {
        setSuccess(true);
        setError('');
        
        // Wait 2 seconds then redirect to login page with success message
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: registerRes.message || 'Registration successful! Please login with your credentials.',
              email: formData.email 
            } 
          });
        }, 2000);
      } else {
        setError('Unexpected response from server');
      }
    } catch (err) {
      console.error('Registration failed with error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      const msg = err && err.message ? err.message : 'Registration failed';
      setError(msg);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center">
      <div className="flex h-screen w-full overflow-hidden flex-col md:flex-row">
        {/* Left Side - Marketing Content */}
        <div className="hidden md:flex md:w-2/5 lg:w-2/5 bg-blue-600 relative overflow-hidden">
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
                Start your campus journey with us.
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Join thousands of students who enjoy a seamless hostel experience with our integrated management system.
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

        {/* Right Side - Registration Form */}
        <div className="w-full md:w-3/5 lg:w-3/5 flex flex-col justify-start items-center p-6 lg:p-10 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="w-full max-w-[680px] py-4">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-xl">domain</span>
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">HostelHub</span>
            </div>

            {/* Form Header */}
            <div className="mb-6">
              <h1 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight mb-1">
                Create Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Join the hostel community. Fill in your details to get started.
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <span className="font-semibold">Registration Successful!</span>
                  <div className="text-sm">Your account has been created. Redirecting to login...</div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Registration Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Two Column Layout for Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Full Name</label>
                  <div className="relative">
                    <input 
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-gray-400" 
                      placeholder="John Doe" 
                      required 
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Roll Number */}
                <div className="space-y-1.5">
                  <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Roll Number</label>
                  <div className="relative">
                    <input 
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-gray-400" 
                      placeholder="e.g. 2023CS001" 
                      required 
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Year */}
                <div className="space-y-1.5">
                  <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Year</label>
                  <div className="relative">
                    <select 
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all" 
                      required 
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Department</label>
                  <div className="relative">
                    <select 
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all" 
                      required 
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Business Administration">Business Administration</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Email Address - Full Width */}
              <div className="space-y-1.5">
                <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Email Address</label>
                <div className="relative">
                  <input 
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-gray-400" 
                    placeholder="resident@campus.edu" 
                    required 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Address - Full Width */}
              <div className="space-y-1.5">
                <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Address</label>
                <div className="relative">
                  <textarea 
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-gray-400" 
                    placeholder="Enter your full address" 
                    required 
                    rows="2"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Phone and Parent Contact - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Phone Number</label>
                  <div className="relative">
                    <input 
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-gray-400" 
                      placeholder="+1 (555) 000-0000" 
                      required 
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Parent Contact */}
                <div className="space-y-1.5">
                  <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Parent/Guardian Contact</label>
                  <div className="relative">
                    <input 
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-gray-400" 
                      placeholder="+1 (555) 000-0000" 
                      required 
                      type="tel"
                      name="parentContact"
                      value={formData.parentContact}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Gender</label>
                  <div className="relative">
                    <select 
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all" 
                      required 
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Residence Type */}
              <div className="space-y-1.5">
                <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Residence Type</label>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20 border-gray-300 dark:border-gray-700">
                    <input 
                      type="radio" 
                      name="residenceType" 
                      value="Hosteller"
                      checked={formData.residenceType === 'Hosteller'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Hosteller</div>
                      <div className="text-xs text-gray-500">Need hostel accommodation</div>
                    </div>
                  </label>
                  <label className="flex-1 flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20 border-gray-300 dark:border-gray-700">
                    <input 
                      type="radio" 
                      name="residenceType" 
                      value="DayScholar"
                      checked={formData.residenceType === 'DayScholar'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Day Scholar</div>
                      <div className="text-xs text-gray-500">Commute from home</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preferred Room Type - Only for Hostellers */}
              {formData.residenceType === 'Hosteller' && (
                <div className="space-y-1.5">
                  <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Preferred Room Type</label>
                  <div className="flex gap-3">
                    <label className="flex-1 flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20 border-gray-300 dark:border-gray-700">
                      <input 
                        type="radio" 
                        name="preferredRoomType" 
                        value="AC"
                        checked={formData.preferredRoomType === 'AC'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">ac_unit</span>
                          AC Room
                        </div>
                        <div className="text-xs text-gray-500">Air conditioned (Capacity: 2)</div>
                      </div>
                    </label>
                    <label className="flex-1 flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20 border-gray-300 dark:border-gray-700">
                      <input 
                        type="radio" 
                        name="preferredRoomType" 
                        value="Non-AC"
                        checked={formData.preferredRoomType === 'Non-AC'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">air</span>
                          Non-AC Room
                        </div>
                        <div className="text-xs text-gray-500">Standard room (Capacity: 4)</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold leading-normal">Create Password</label>
                  {passwordStrength.text && (
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      passwordStrength.strength <= 1 ? 'text-red-500' :
                      passwordStrength.strength <= 2 ? 'text-orange-500' :
                      passwordStrength.strength === 3 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input 
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-11 px-4 pr-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-gray-400" 
                    placeholder="At least 8 characters" 
                    required 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button 
                    className="absolute right-4 text-gray-600 hover:text-blue-600 transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          level <= passwordStrength.strength 
                            ? (passwordStrength.strength <= 1 ? 'bg-red-500' :
                               passwordStrength.strength <= 2 ? 'bg-orange-400' :
                               passwordStrength.strength === 3 ? 'bg-yellow-400' : 'bg-green-500')
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      ></div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-bold text-base shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50" 
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'Creating Account...' : 'Register Now'}</span>
                  <span className="material-symbols-outlined text-xl">person_add</span>
                </button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-800 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Already have an account? 
                <Link className="text-blue-600 font-bold hover:underline ml-1" to="/login">Sign In</Link>
              </p>
            </div>

            {/* Footer Links */}
            <div className="mt-8 flex justify-center gap-6">
              <a className="text-gray-600 hover:text-blue-600 transition-colors" href="#" title="Support">
                <span className="material-symbols-outlined">help</span>
              </a>
              <a className="text-gray-600 hover:text-blue-600 transition-colors" href="#" title="Privacy Policy">
                <span className="material-symbols-outlined">description</span>
              </a>
              <a className="text-gray-600 hover:text-blue-600 transition-colors" href="#" title="Language">
                <span className="material-symbols-outlined">language</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;