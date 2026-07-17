import Link from 'next/link';

export default function Register() {
  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-white">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Already have an account? <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">Sign in here</Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <form className="space-y-6" action="#" method="POST">
          <div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-300">Username</label>
            <div className="mt-2">
              <input id="username" name="username" type="text" required className="block w-full rounded-md border-0 bg-slate-950 py-1.5 text-white shadow-sm ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-300">Email address</label>
            <div className="mt-2">
              <input id="email" name="email" type="email" required className="block w-full rounded-md border-0 bg-slate-950 py-1.5 text-white shadow-sm ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-300">Password</label>
            <div className="mt-2">
              <input id="password" name="password" type="password" required className="block w-full rounded-md border-0 bg-slate-950 py-1.5 text-white shadow-sm ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div>
            <button type="submit" className="flex w-full justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-colors">
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
