/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  auth,
  onAuthStateChanged,
  testFirestoreConnection,
  FirebaseUser,
} from './firebase';
import { Navbar } from './components/Navbar';
import { AuthForm } from './components/AuthForm';
import { AccountCustomization } from './components/AccountCustomization';
import { SecurityAuditLogs } from './components/SecurityAuditLogs';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { LegalModal } from './components/LegalModal';
import { ErrorScreen } from './components/ErrorScreens';
import { AuthFormSkeleton } from './components/SkeletonLoaders';
import { ErrorScreenType, ToastMessage } from './types';
import {
  Shield,
  Lock,
  UserCheck,
  FileText,
  AlertCircle,
  X,
  CheckCircle,
  Info,
  Layers,
  Database
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSkeletonPreview, setIsSkeletonPreview] = useState(false);
  const [activeErrorScreen, setActiveErrorScreen] = useState<ErrorScreenType>('none');
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Modals
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms'>('terms');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Theme
  const [isDark, setIsDark] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Setup auth observer and initial connection check
  useEffect(() => {
    // Run connection test required by skill
    testFirestoreConnection().catch(err => {
      console.warn('Initial Firestore ping note:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync dark class on document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleOpenLegal = (tab: 'privacy' | 'terms') => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  const handleAccountDeleted = () => {
    setDeleteModalOpen(false);
    setCurrentUser(null);
    addToast('success', 'Account Deleted', 'Your profile and associated credentials have been permanently removed.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/95 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : toast.type === 'error'
                ? 'bg-rose-50/95 dark:bg-rose-950/95 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                : toast.type === 'warning'
                ? 'bg-amber-50/95 dark:bg-amber-950/95 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                : 'bg-indigo-50/95 dark:bg-indigo-950/95 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div className="flex-1 text-xs">
              <h5 className="font-bold text-sm leading-tight mb-0.5">{toast.title}</h5>
              {toast.message && <p className="opacity-90 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <Navbar
        user={currentUser}
        onOpenLegal={handleOpenLegal}
        onToggleSkeletonPreview={() => setIsSkeletonPreview(!isSkeletonPreview)}
        isSkeletonPreview={isSkeletonPreview}
        activeErrorScreen={activeErrorScreen}
        onSelectErrorScreen={setActiveErrorScreen}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Body */}
      <main className="flex-1 flex flex-col">
        {/* If Error Screen is simulated or active */}
        {activeErrorScreen !== 'none' ? (
          <ErrorScreen
            type={activeErrorScreen}
            onReset={() => setActiveErrorScreen('none')}
            onNavigateHome={() => {
              setActiveErrorScreen('none');
              setActiveTab('profile');
            }}
          />
        ) : authLoading ? (
          /* Initial app load skeleton */
          <div className="flex-1 flex items-center justify-center p-6">
            <AuthFormSkeleton />
          </div>
        ) : !currentUser ? (
          /* Logged-out Landing & Authentication Flow */
          <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Feature Highlights */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  Production-Grade Security System
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  Secure Authentication & Account Suite
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Complete authentication infrastructure with Google OAuth, email verification,
                  rate-limiting protection, GDPR privacy controls, and full account customization.
                </p>

                {/* Badges of 8 required pillars */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Email & Google Auth</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Lock className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Rate-Limit Guard</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Privacy & Terms</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Database className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Account Deletion</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Auth Form or Skeleton Preview */}
              <div className="lg:col-span-6 w-full flex justify-center">
                {isSkeletonPreview ? (
                  <AuthFormSkeleton />
                ) : (
                  <AuthForm
                    onSuccess={() => {}}
                    onOpenLegal={handleOpenLegal}
                    onShowToast={addToast}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Logged-In User Dashboard */
          <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden rounded-xl p-1 bg-slate-200 dark:bg-slate-800 mb-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Profile Customization
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'security'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Security Audit Logs
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'profile' ? (
              <AccountCustomization
                onOpenDeleteModal={() => setDeleteModalOpen(true)}
                isLoading={isSkeletonPreview}
                onShowToast={addToast}
              />
            ) : (
              <SecurityAuditLogs isLoading={isSkeletonPreview} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            <span>AuthSphere Security & Identity Portal</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => handleOpenLegal('terms')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => handleOpenLegal('privacy')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveErrorScreen('404')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Error Screens
            </button>
          </div>

          <div>
            <span>© 2026 AuthSphere. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        defaultTab={legalModalTab}
        showAcceptButton={!currentUser}
        onAccept={() => {
          addToast('success', 'Accepted', 'You have accepted the Privacy Policy & Terms.');
        }}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onAccountDeleted={handleAccountDeleted}
        userEmail={currentUser?.email}
      />
    </div>
  );
}
