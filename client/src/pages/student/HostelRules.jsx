import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';

export default function HostelRules() {
  const navigate = useNavigate();

  return (
    <StudentLayout title="Hostel Rules">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-purple-500 text-4xl">gavel</span>
            Hostel Rules & Regulations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please read and follow these rules to maintain a safe, clean, and comfortable living environment for all residents.
          </p>
        </div>

        {/* Important Notice */}
        <section className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6 mb-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
            <div>
              <h2 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">Important Notice</h2>
              <p className="text-red-700 dark:text-red-400">
                Violation of hostel rules may result in disciplinary action, including fines, suspension, or expulsion from the hostel. 
                Please respect these rules for everyone's benefit.
              </p>
            </div>
          </div>
        </section>

        {/* General Rules */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">rule</span>
            General Rules
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
              <div className="flex-1">
                <p className="font-semibold">Entry & Exit Timings</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hostel gate closes at <span className="font-bold text-red-600">11:00 PM</span>. 
                  Late entry requires prior permission from the hostel warden. Visitors are allowed only between 
                  <span className="font-bold"> 10:00 AM - 6:00 PM</span>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
              <div className="flex-1">
                <p className="font-semibold">ID Card Mandatory</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Students must carry their ID cards at all times within the hostel premises. Visitors must register 
                  at the gate with valid ID proof.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
              <div className="flex-1">
                <p className="font-semibold">Cleanliness & Hygiene</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep your room and common areas clean. Dispose of garbage in designated bins. Room inspections 
                  are conducted monthly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
              <div className="flex-1">
                <p className="font-semibold">Noise Levels</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Maintain silence after <span className="font-bold">10:00 PM</span>. Use headphones for music/videos. 
                  Loud gatherings or parties are strictly prohibited.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
              <div className="flex-1">
                <p className="font-semibold">Attendance & Leave</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Attendance is mandatory during roll calls. Inform the warden in advance if leaving the hostel for 
                  more than 24 hours.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Prohibited Items & Activities */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">block</span>
            Strictly Prohibited
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600">dangerous</span>
                <div>
                  <p className="font-bold mb-1">Alcohol & Drugs</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Possession or consumption of alcohol, cigarettes, or any drugs is strictly prohibited and will result in immediate expulsion.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600">local_fire_department</span>
                <div>
                  <p className="font-bold mb-1">Fire Hazards</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    No candles, incense sticks, or open flames. Cooking inside rooms is prohibited. Use only approved electrical appliances.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600">person_off</span>
                <div>
                  <p className="font-bold mb-1">Opposite Gender Entry</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Entry to opposite gender hostel blocks is strictly prohibited except in designated common areas.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600">videogame_asset_off</span>
                <div>
                  <p className="font-bold mb-1">Gambling & Gaming</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Gambling, betting, or any form of gaming for money is strictly prohibited within hostel premises.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600">report</span>
                <div>
                  <p className="font-bold mb-1">Ragging & Bullying</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Any form of ragging, harassment, or bullying is a punishable offense and will lead to severe disciplinary action.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600">pets</span>
                <div>
                  <p className="font-bold mb-1">Pets Not Allowed</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Keeping pets or any animals inside the hostel rooms or premises is not permitted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Electricity & Water Usage */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-600">bolt</span>
            Electricity & Water Conservation
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-500">lightbulb</span>
              <div>
                <p className="font-semibold">Energy Conservation</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Switch off lights, fans, and AC when leaving the room. Use energy-efficient appliances. Excessive 
                  power consumption may be billed separately.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-500">water_drop</span>
              <div>
                <p className="font-semibold">Water Usage</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avoid wastage of water. Report any leakages immediately. Do not wash clothes in bathrooms or block drains.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-500">ac_unit</span>
              <div>
                <p className="font-semibold">AC/Heater Usage</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set AC temperature to 24°C or above. Keep doors and windows closed when AC is running. 
                  Heaters are allowed only during winter months (November-February).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Room & Furniture */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">chair</span>
            Room & Furniture Care
          </h2>

          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-green-500 text-sm mt-1">check</span>
              <p className="text-gray-700 dark:text-gray-300">
                Do not remove or rearrange furniture from your room. Report any damages immediately.
              </p>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-green-500 text-sm mt-1">check</span>
              <p className="text-gray-700 dark:text-gray-300">
                Do not paste posters, stickers, or paint on walls. Use notice boards for decorations.
              </p>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-green-500 text-sm mt-1">check</span>
              <p className="text-gray-700 dark:text-gray-300">
                Keep your room key safely. Lost keys will be charged ₹500 for replacement.
              </p>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-green-500 text-sm mt-1">check</span>
              <p className="text-gray-700 dark:text-gray-300">
                Damages to hostel property (intentional or negligent) will be charged to the responsible student.
              </p>
            </li>
          </ul>
        </section>

        {/* Mess & Dining */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-600">restaurant</span>
            Mess & Dining Rules
          </h2>

          <div className="space-y-2">
            <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
              <span className="material-symbols-outlined text-orange-500 text-sm mt-1">arrow_right</span>
              Meal timings: Breakfast (7:30-9:30 AM), Lunch (12:30-2:30 PM), Dinner (7:30-9:30 PM)
            </p>
            <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
              <span className="material-symbols-outlined text-orange-500 text-sm mt-1">arrow_right</span>
              Maintain discipline in the mess. Do not waste food.
            </p>
            <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
              <span className="material-symbols-outlined text-orange-500 text-sm mt-1">arrow_right</span>
              Return plates and utensils to designated areas after eating.
            </p>
            <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
              <span className="material-symbols-outlined text-orange-500 text-sm mt-1">arrow_right</span>
              Footwear must be removed before entering the dining hall.
            </p>
          </div>
        </section>

        {/* Contact Warden */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">contact_phone</span>
            Contact Hostel Warden
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            For any queries regarding hostel rules or to report violations, please contact:
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
            <p className="font-bold text-xl mb-2">Dr. Rajesh Sharma</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Hostel Warden</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-sm">phone</span>
                <p className="text-blue-600 font-semibold">+91-9876543210</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-sm">email</span>
                <p className="text-blue-600 font-semibold">rajesh.sharma@university.edu</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500 text-sm">location_on</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">Block A, Ground Floor, Room 101</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500 text-sm">schedule</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">Office Hours: Mon-Sat 9 AM - 6 PM</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
