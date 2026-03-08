import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';

export default function HelpSupport() {
  const navigate = useNavigate();

  return (
    <StudentLayout title="Help & Support">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-500 text-4xl">help</span>
            Help & Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get assistance with common issues and learn how to use the hostel portal effectively.
          </p>
        </div>

        {/* Contact Information */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">phone</span>
            Emergency Contact
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hostel Office</p>
              <p className="text-lg font-bold text-blue-600">+91-9876543210</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Emergency Hotline (24/7)</p>
              <p className="text-lg font-bold text-red-600">+91-9123456789</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-600">quiz</span>
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-blue-500">check_circle</span>
                How do I submit a complaint?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 ml-7">
                Click on "Submit Complaint" in the sidebar, select the complaint type, describe the issue, and submit. 
                The hostel caretaker will be notified immediately and will work to resolve it.
              </p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-blue-500">check_circle</span>
                How do I request a room change?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 ml-7">
                Go to "Room Change" in the sidebar. You can select up to 3 room preferences and provide a reason. 
                Your request will be reviewed by the admin on a first-come, first-served basis.
              </p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-blue-500">check_circle</span>
                How can I track my complaint status?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 ml-7">
                Navigate to "My Complaints" from the sidebar. You'll see all your complaints with their current status:
                <span className="font-semibold"> Pending, In Progress, Resolved, Completed, or Reopened</span>.
              </p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-blue-500">check_circle</span>
                What should I do if my issue is urgent?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 ml-7">
                For urgent issues like electrical hazards, water leakage, or security concerns, submit a complaint 
                immediately and also contact the hostel office directly at <span className="font-bold text-blue-600">+91-9876543210</span>.
              </p>
            </div>

            <div className="pb-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-blue-500">check_circle</span>
                Can I reopen a resolved complaint?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 ml-7">
                Yes! If a complaint was marked as resolved but the issue persists, you can reject the resolution 
                and provide additional details. The complaint will be reopened for further action.
              </p>
            </div>
          </div>
        </section>

        {/* Common Issues */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">build</span>
            Common Issues & Solutions
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-orange-500 text-xl">power_off</span>
                <div>
                  <h4 className="font-bold mb-1">Power Outage</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check the main switch in your room. If issue persists, submit an "Electrical Issue" complaint.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-500 text-xl">water_drop</span>
                <div>
                  <h4 className="font-bold mb-1">Water Supply Issues</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check your water tap and report "Plumbing Issue" if there's leakage or no water supply.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 text-xl">wifi</span>
                <div>
                  <h4 className="font-bold mb-1">Internet Connectivity</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Restart your router first. If problem continues, submit "Internet/Wi-Fi Issue" complaint.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
                <div>
                  <h4 className="font-bold mb-1">Security Concerns</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Report immediately via "Security Concern" complaint and call the emergency hotline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Using the Portal */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">lightbulb</span>
            Using the Portal
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-500">dashboard</span>
              <div>
                <p className="font-semibold">Dashboard</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View your profile, room allocation details, and account information.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-orange-500">report_problem</span>
              <div>
                <p className="font-semibold">Submit Complaint</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Report hostel issues like electrical, plumbing, furniture damage, cleanliness, etc.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-500">assignment</span>
              <div>
                <p className="font-semibold">My Complaints</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track all your complaints, filter by status, and manage resolutions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-purple-500">swap_horiz</span>
              <div>
                <p className="font-semibold">Room Change</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Request a room change by selecting up to 3 preferences with a valid reason.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">contact_support</span>
            Still Need Help?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you couldn't find the answer to your question, please contact us directly:
          </p>
          <div className="space-y-3">
            <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hostel Warden</p>
              <p className="font-bold text-lg">Dr. Rajesh Sharma</p>
              <p className="text-sm text-blue-600 font-semibold">Phone: +91-9876543210</p>
              <p className="text-sm text-blue-600 font-semibold">Email: rajesh.sharma@university.edu</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 flex-1 min-w-[200px]">
                <p className="text-xs text-gray-500 dark:text-gray-400">Office Hours</p>
                <p className="font-semibold">Monday - Saturday: 9 AM - 6 PM</p>
                <p className="text-xs text-gray-500 mt-1">Sunday: 10 AM - 2 PM</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 flex-1 min-w-[200px]">
                <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-semibold">Hostel Administration Office</p>
                <p className="text-xs text-gray-500 mt-1">Block A, Ground Floor, Room 101</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
