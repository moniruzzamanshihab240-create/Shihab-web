import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { auth, db, deleteDoc, doc, deleteUser, handleFirestoreError, OperationType } from '../firebase';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountDeleted: () => void;
  userEmail?: string | null;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountDeleted,
  userEmail,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmationInput.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setErrorMessage(null);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setErrorMessage('No active authenticated session found. Please sign in again.');
      setIsDeleting(false);
      return;
    }

    try {
      // 1. Delete user profile document from Firestore
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid));
      } catch (firestoreErr) {
        console.warn('Firestore profile cleanup warning (proceeding with auth deletion):', firestoreErr);
      }

      // 2. Delete user account from Firebase Auth
      await deleteUser(currentUser);

      // Clean local storage
      localStorage.removeItem('authsphere_rate_limit');

      onAccountDeleted();
    } catch (err: any) {
      console.error('Account deletion error:', err);
      if (err.code === 'auth/requires-recent-login') {
        setErrorMessage(
          'For security reasons, deleting your account requires a recent sign-in. Please log out, sign back in, and try again.'
        );
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred while deleting your account.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-950/60 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-rose-100 dark:border-rose-950/40 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Delete Account
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Irreversible Permanent Action
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-sm text-rose-800 dark:text-rose-200 flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">This will permanently destroy all account data:</p>
              <ul className="list-disc pl-4 text-xs space-y-1 text-rose-700 dark:text-rose-300">
                <li>Your profile settings, preferences, and custom avatar</li>
                <li>All security audit logs and session history</li>
                <li>Your linked Google / Email authentication credentials</li>
                <li>Access to all associated workspace services</li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Type <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={e => setConfirmationInput(e.target.value)}
              placeholder="DELETE"
              disabled={isDeleting}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm tracking-wider"
            />
            {userEmail && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Target account: <span className="font-medium text-slate-700 dark:text-slate-300">{userEmail}</span>
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${
              isConfirmed && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting Account...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Permanently Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
