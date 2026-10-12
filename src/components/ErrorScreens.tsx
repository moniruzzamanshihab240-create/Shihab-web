import React from 'react';
import { 
  AlertTriangle, 
  WifiOff, 
  ShieldAlert, 
  FileQuestion, 
  RefreshCw, 
  Home, 
  LogIn, 
  DatabaseZap,
  ArrowLeft
} from 'lucide-react';
import { ErrorScreenType } from '../types';

interface ErrorScreensProps {
  type: ErrorScreenType;
  onReset: () => void;
  onNavigateHome?: () => void;
  customMessage?: string;
}

export const ErrorScreen: React.FC<ErrorScreensProps> = ({
  type,
  onReset,
  onNavigateHome,
  customMessage,
}) => {
  if (type === 'none') return null;

  const renderContent = () => {
    switch (type) {
      case '404':
        return {
          icon: <FileQuestion className="w-16 h-16 text-indigo-500 animate-bounce" />,
          code: '404',
          title: 'Page Not Found',
          description: customMessage || 'The page or resource you are looking for has been moved, removed, or never existed in AuthSphere.',
          primaryActionText: 'Back to Safety',
          primaryActionIcon: <Home className="w-4 h-4" />,
          primaryAction: onNavigateHome || onReset,
          badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300',
        };
      case '500':
        return {
          icon: <WifiOff className="w-16 h-16 text-rose-500 animate-pulse" />,
          code: '500',
          title: 'Internal System or Network Interruption',
          description: customMessage || 'We encountered an unexpected server or network timeout while communicating with authentication services.',
          primaryActionText: 'Retry Request',
          primaryActionIcon: <RefreshCw className="w-4 h-4" />,
          primaryAction: onReset,
          badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
        };
      case '401':
        return {
          icon: <AlertTriangle className="w-16 h-16 text-amber-500" />,
          code: '401',
          title: 'Session Expired or Unauthorized',
          description: customMessage || 'Your security credentials or session token have expired. Please re-authenticate to continue safely.',
          primaryActionText: 'Sign In Again',
          primaryActionIcon: <LogIn className="w-4 h-4" />,
          primaryAction: onReset,
          badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
        };
      case '403':
        return {
          icon: <ShieldAlert className="w-16 h-16 text-red-600" />,
          code: '403',
          title: 'Access Denied / Insufficient Privileges',
          description: customMessage || 'You do not have administrative or authorization rights to perform this operation or view this partition.',
          primaryActionText: 'Return to Account',
          primaryActionIcon: <ArrowLeft className="w-4 h-4" />,
          primaryAction: onNavigateHome || onReset,
          badgeColor: 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300',
        };
      case 'quota':
        return {
          icon: <DatabaseZap className="w-16 h-16 text-purple-600" />,
          code: 'Quota Exceeded',
          title: 'Firestore Quota Limit Reached',
          description: customMessage || 'Free daily read/write quota for the current Firebase project has temporarily peaked. Quotas reset automatically daily.',
          primaryActionText: 'Check Status / Dismiss',
          primaryActionIcon: <RefreshCw className="w-4 h-4" />,
          primaryAction: onReset,
          badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
        };
      default:
        return null;
    }
  };

  const details = renderContent();
  if (!details) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Code Badge */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 shadow-inner">
            {details.icon}
          </div>
        </div>

        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 ${details.badgeColor}`}>
          Error Code: {details.code}
        </span>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
          {details.title}
        </h2>

        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          {details.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={details.primaryAction}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {details.primaryActionIcon}
            {details.primaryActionText}
          </button>

          <button
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset State
          </button>
        </div>
      </div>
    </div>
  );
};
