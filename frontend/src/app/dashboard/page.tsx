import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="pt-24 pb-16 px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="md:flex md:items-center md:justify-between mb-12">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-bold leading-7 text-white sm:truncate sm:text-4xl sm:tracking-tight">
            Student Dashboard
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Enrolled Courses */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-6">My Courses</h3>
          <div className="bg-slate-900 overflow-hidden shadow rounded-2xl border border-slate-800 p-6">
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">You haven't enrolled in any courses yet.</p>
              <Link href="/courses" className="text-cyan-400 hover:text-cyan-300 font-medium">Browse courses &rarr;</Link>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white mb-6">Profile</h3>
          <div className="bg-slate-900 shadow rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-800">
                <span className="text-cyan-400 font-bold">U</span>
              </div>
              <div>
                <p className="text-white font-medium">Demo User</p>
                <p className="text-gray-400 text-sm">user@vantgate.com</p>
              </div>
            </div>
            <dl className="space-y-4 divide-y divide-slate-800">
              <div className="pt-4 flex justify-between">
                <dt className="text-sm text-gray-400">Courses Completed</dt>
                <dd className="text-sm font-medium text-white">0</dd>
              </div>
              <div className="pt-4 flex justify-between">
                <dt className="text-sm text-gray-400">Certificates Earned</dt>
                <dd className="text-sm font-medium text-white">0</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
