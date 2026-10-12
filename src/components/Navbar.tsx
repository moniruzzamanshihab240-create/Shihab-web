import React from 'react';
import {
  Shield,
  Moon,
  Sun,
  LogOut,
  Layers,
  AlertTriangle,
  User,
  FileText,
  Lock,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { auth, signOut, FirebaseUser } from '../firebase';
import { ErrorScreenType } from '../types';

interface NavbarProps {
  user: FirebaseUser | null;
  onOpenLegal: (tab: 'privacy' | 'terms') => void;
  onToggleSkeletonPreview: () => void;
  isSkeletonPreview: boolean;
  activeErrorScreen: ErrorScreenType;
  onSelectErrorScreen: (type: ErrorScreenType) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  activeTab: 'profile' | 'security';
  onSelectTab: (tab: 'profile' | 'security') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenLegal,
  onToggleSkeletonPreview,
  isSkeletonPreview,
  activeErrorScreen,
  onSelectErrorScreen,
  isDark,
  onToggleTheme,
  activeTab,
  onSelectTab,
}) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              AuthSphere
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                Hub
              </span>
            </span>
          </div>
        </div>

        {/* Center Nav tabs when logged in */}
        {user && activeErrorScreen === 'none' && (
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
            <button
              onClick={() => onSelectTab('profile')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Account Profile
            </button>
            <button
              onClick={() => onSelectTab('security')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Security Audit Logs
            </button>
          </nav>
        )}

        {/* Right Action Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Legal document quick links */}
          <button
            onClick={() => onOpenLegal('terms')}
            className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors px-2 py-1"
          >
            <FileText className="w-3.5 h-3.5" />
            Terms
          </button>
          <button
            onClick={() => onOpenLegal('privacy')}
            className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors px-2 py-1"
          >
            <Lock className="w-3.5 h-3.5" />
            Privacy
          </button>

          {/* Skeleton Preview Toggle (Requirement #6) */}
          <button
            onClick={onToggleSkeletonPreview}
            title="Toggle Skeleton Loading Preview"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isSkeletonPreview
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Skeleton Mode</span>
          </button>

          {/* Error Screen Simulator Dropdown (Requirement #7) */}
          <div className="relative group">
            <select
              value={activeErrorScreen}
              onChange={e => onSelectErrorScreen(e.target.value as ErrorScreenType)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              title="Test Error Screens"
            >
              <option value="none">Normal View</option>
              <option value="404">Test 404 Not Found</option>
              <option value="500">Test 500 Network Error</option>
              <option value="401">Test 401 Session Expired</option>
              <option value="403">Test 403 Forbidden</option>
              <option value="quota">Test Quota Exceeded</option>
            </select>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Status / Sign out */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'
                )}
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
