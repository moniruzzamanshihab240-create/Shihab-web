import React from 'react';

export const AuthFormSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl animate-pulse">
      {/* Logo & Header Skeleton */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 mb-3" />
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
        <div className="h-4 w-64 bg-slate-100 dark:bg-slate-850 rounded-md" />
      </div>

      {/* Social Button Skeleton */}
      <div className="h-11 w-full bg-slate-200 dark:bg-slate-800 rounded-xl mb-6" />

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Inputs Skeleton */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
          <div className="h-11 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        </div>
        <div>
          <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
          <div className="h-11 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        </div>
      </div>

      {/* Action button */}
      <div className="h-11 w-full bg-slate-300 dark:bg-slate-700 rounded-xl mb-4" />

      {/* Footer link */}
      <div className="h-4 w-52 mx-auto bg-slate-200 dark:bg-slate-800 rounded" />
    </div>
  );
};

export const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="flex-1 text-center sm:text-left space-y-3 w-full">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto sm:mx-0" />
          <div className="h-4 w-64 bg-slate-100 dark:bg-slate-850 rounded mx-auto sm:mx-0" />
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfileSettingsSkeleton: React.FC = () => {
  return (
    <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-8">
      <div>
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
        <div className="h-4 w-72 bg-slate-100 dark:bg-slate-850 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
            <div className="h-11 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
          <div>
            <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
            <div className="h-11 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>

      <div>
        <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
        <div className="h-24 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-10 w-32 bg-slate-300 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );
};

export const SecurityLogsSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-4">
      <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
      {[1, 2, 3, 4].map(idx => (
        <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-48 bg-slate-100 dark:bg-slate-850 rounded" />
            </div>
          </div>
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
      ))}
    </div>
  );
};
