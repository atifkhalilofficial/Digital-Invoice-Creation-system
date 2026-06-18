import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ showBack, backTo, backLabel }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <nav className="navbar px-6 h-14 flex items-center justify-between sticky top-0 z-10">

      <h1 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">
        Smart<span className="text-indigo-500">Bill</span>
      </h1>

      <div className="flex items-center gap-5">

        {showBack ? (
          <Link
            to={backTo || '/'}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors no-underline"
          >
            ← {backLabel || 'Back'}
          </Link>
        ) : (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/invoices" className="nav-link">Invoices</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/schedules" className="nav-link">Schedules</Link>
            {user && (
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors border-none bg-transparent cursor-pointer"
              >
                Logout
              </button>
            )}
          </>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {user && !showBack && (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
        )}

      </div>
    </nav>
  );
}