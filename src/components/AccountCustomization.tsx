import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  Camera,
  Check,
  AlertTriangle,
  Loader2,
  Trash2,
  Sparkles,
  Globe,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  Save,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfileData } from '../types';
import {
  auth,
  db,
  doc,
  setDoc,
  getDoc,
  updateProfile,
  updatePassword,
  updateEmail,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { ProfileHeaderSkeleton, ProfileSettingsSkeleton } from './SkeletonLoaders';

interface AccountCustomizationProps {
  onOpenDeleteModal: () => void;
  isLoading?: boolean;
  onShowToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

// Preset avatars using high-quality Unsplash portraits and illustrations
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
];

export const AccountCustomization: React.FC<AccountCustomizationProps> = ({
  onOpenDeleteModal,
  isLoading = false,
  onShowToast,
}) => {
  const [profile, setProfile] = useState<UserProfileData>({
    uid: '',
    email: '',
    displayName: '',
    photoURL: '',
    bio: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    theme: 'system',
    notifications: true,
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Email state
  const [editEmail, setEditEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoadingProfile(true);
    const user = auth.currentUser;
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfileData;
        setProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: data.displayName || user.displayName || '',
          photoURL: data.photoURL || user.photoURL || '',
          bio: data.bio || '',
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          theme: data.theme || 'system',
          notifications: data.notifications ?? true,
        });
        setSelectedAvatar(data.photoURL || user.photoURL || '');
        setEditEmail(user.email || '');
      } else {
        // Initial defaults from auth
        const defaultProfile: UserProfileData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || '',
          bio: 'Hey there! Exploring secure authentication features with AuthSphere.',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          theme: 'system',
          notifications: true,
          createdAt: new Date().toISOString(),
        };
        setProfile(defaultProfile);
        setSelectedAvatar(user.photoURL || '');
        setEditEmail(user.email || '');

        // Persist initial document
        try {
          await setDoc(docRef, defaultProfile);
        } catch (e) {
          console.warn('Initial profile doc save warning:', e);
        }
      }
    } catch (err) {
      console.error('Error loading profile doc:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('error', 'Invalid File', 'Please upload a valid JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      onShowToast('warning', 'File Too Large', 'Please select an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setSelectedAvatar(result);
      setProfile(prev => ({ ...prev, photoURL: result }));
      onShowToast('info', 'Avatar Selected', 'Click "Save Profile" to apply changes.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setSelectedAvatar(url);
    setProfile(prev => ({ ...prev, photoURL: url }));
  };

  const handleRemovePhoto = () => {
    setSelectedAvatar('');
    setProfile(prev => ({ ...prev, photoURL: '' }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setIsSaving(true);
    try {
      // 1. Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: profile.displayName,
        photoURL: selectedAvatar || null,
      });

      // 2. Update Firestore Doc
      const docRef = doc(db, 'users', user.uid);
      const updatedData: Partial<UserProfileData> = {
        uid: user.uid,
        email: user.email || profile.email,
        displayName: profile.displayName,
        photoURL: selectedAvatar,
        bio: profile.bio,
        timezone: profile.timezone,
        theme: profile.theme,
        notifications: profile.notifications,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(docRef, updatedData, { merge: true });

      onShowToast('success', 'Profile Updated', 'Your profile details and avatar have been saved.');
    } catch (err: any) {
      console.error('Save profile error:', err);
      onShowToast('error', 'Update Failed', err.message || 'Could not save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      onShowToast('warning', 'Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      onShowToast('error', 'Mismatch', 'Passwords do not match.');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setIsUpdatingPassword(true);
    try {
      await updatePassword(user, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      onShowToast('success', 'Password Changed', 'Your account password has been updated.');
    } catch (err: any) {
      console.error('Password update error:', err);
      if (err.code === 'auth/requires-recent-login') {
        onShowToast(
          'error',
          'Security Check',
          'Please sign out and sign in again before updating your password.'
        );
      } else {
        onShowToast('error', 'Error', err.message || 'Failed to update password.');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmail || editEmail === profile.email) return;

    const user = auth.currentUser;
    if (!user) return;

    setIsUpdatingEmail(true);
    try {
      await updateEmail(user, editEmail);
      setProfile(prev => ({ ...prev, email: editEmail }));
      onShowToast('success', 'Email Updated', 'Your account email has been updated.');
    } catch (err: any) {
      console.error('Email update error:', err);
      if (err.code === 'auth/requires-recent-login') {
        onShowToast(
          'error',
          'Security Check',
          'Updating your email requires a recent sign-in. Please log in again.'
        );
      } else {
        onShowToast('error', 'Error', err.message || 'Failed to update email.');
      }
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  if (loadingProfile || isLoading) {
    return (
      <div className="space-y-6">
        <ProfileHeaderSkeleton />
        <ProfileSettingsSkeleton />
      </div>
    );
  }

  const user = auth.currentUser;
  const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com');

  return (
    <div className="space-y-8">
      {/* Profile Overview Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar & Photo Picker */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-indigo-100 dark:border-indigo-950/60 shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {selectedAvatar ? (
                <img
                  src={selectedAvatar}
                  alt={profile.displayName || 'User Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl font-bold uppercase">
                  {profile.displayName?.charAt(0) || profile.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all hover:scale-105"
              title="Upload custom image"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* User Meta Information */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {profile.displayName || 'Anonymous User'}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Active Session
                </span>
                {isGoogleUser && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                    Google Connected
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {profile.email}
            </p>

            {profile.bio && (
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl italic pt-1">
                &ldquo;{profile.bio}&rdquo;
              </p>
            )}

            {/* Avatar presets quick picker */}
            <div className="pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Or pick a curated avatar preset:
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {AVATAR_PRESETS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                      selectedAvatar === url
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                {selectedAvatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-rose-500 hover:text-rose-600 hover:underline ml-2"
                  >
                    Reset Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Account Customization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personalize your identity, timezone, and communication preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Full Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={profile.displayName}
                onChange={e => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Jane Doe"
                maxLength={100}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Preferred Timezone
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={profile.timezone}
                onChange={e => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London (GMT+0)</option>
                <option value="Europe/Paris">Paris, Berlin (GMT+1)</option>
                <option value="Asia/Dhaka">Dhaka (GMT+6)</option>
                <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                <option value="UTC">Universal Coordinated Time (UTC)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Biography / Description
            </label>
            <span className="text-xs text-slate-400">{profile.bio?.length || 0}/500</span>
          </div>
          <textarea
            value={profile.bio || ''}
            onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            rows={3}
            maxLength={500}
            placeholder="Tell us a little bit about yourself or your team..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Security Alerts</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive alerts for new device logins</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.notifications ?? true}
              onChange={e => setProfile(prev => ({ ...prev, notifications: e.target.checked }))}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Theme Preference</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Select application visual tone</p>
              </div>
            </div>
            <select
              value={profile.theme || 'system'}
              onChange={e => setProfile(prev => ({ ...prev, theme: e.target.value as any }))}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security: Email & Password Update */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Address */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Account Email</h4>
              <p className="text-xs text-slate-500">Change your primary communication address</p>
            </div>
          </div>

          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <input
                type="email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingEmail || editEmail === profile.email}
              className="w-full py-2.5 px-4 rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isUpdatingEmail ? 'Updating Email...' : 'Update Email Address'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Security Password</h4>
              <p className="text-xs text-slate-500">Update your sign-in authentication password</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingPassword || !newPassword}
              className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone: Account Deletion (Requirement #3) */}
      <div className="p-6 md:p-8 rounded-3xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Danger Zone: Account Deletion
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mt-0.5">
                Permanently purge your account, profile photos, credentials, and audit logs.
                Once confirmed, this action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenDeleteModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-600/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
