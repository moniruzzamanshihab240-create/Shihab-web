import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Info,
  Loader2,
  FileText
} from 'lucide-react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  doc,
  setDoc,
} from '../firebase';
import {
  getRateLimitStatus,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  resetRateLimit,
  simulateLockout
} from '../utils/rateLimiter';
import { AuthMode, RateLimitStatus } from '../types';

interface AuthFormProps {
  onSuccess: () => void;
  onOpenLegal: (tab: 'privacy' | 'terms') => void;
  onShowToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onSuccess,
  onOpenLegal,
  onShowToast,
}) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus>(getRateLimitStatus());
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Rate limit countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const current = getRateLimitStatus();
      setRateLimit(current);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Too short', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 15, label: 'Very Weak', color: 'bg-rose-400' };
    }
  };

  const strength = getPasswordStrength(password);

  // Format seconds into MM:SS
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleGoogleSignIn = async () => {
    if (rateLimit.isLocked) {
      setErrorMessage(`Rate limit active. Please wait ${formatSeconds(rateLimit.secondsRemaining)}.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signInWithPopup(auth, googleProvider);
      recordSuccessfulAttempt();
      setRateLimit(getRateLimitStatus());

      // Ensure profile doc exists in firestore
      if (res.user) {
        const userRef = doc(db, 'users', res.user.uid);
        await setDoc(
          userRef,
          {
            uid: res.user.uid,
            email: res.user.email || '',
            displayName: res.user.displayName || 'Google User',
            photoURL: res.user.photoURL || '',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      onShowToast('success', 'Welcome!', `Signed in as ${res.user.displayName || res.user.email}`);
      onSuccess();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in cancelled. The Google popup was closed before completion.');
      } else {
        const updated = recordFailedAttempt();
        setRateLimit(updated);
        setErrorMessage(mapAuthError(err.code, err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rateLimit.isLocked) {
      setErrorMessage(`Too many failed attempts. Locked out for ${formatSeconds(rateLimit.secondsRemaining)}.`);
      return;
    }

    if (mode === 'signup' && !agreeTerms) {
      setErrorMessage('You must accept the Terms & Conditions and Privacy Policy to create an account.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setDemoNotice(null);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmailAndPassword(auth, email, password);
        recordSuccessfulAttempt();
        setRateLimit(getRateLimitStatus());
        onShowToast('success', 'Sign In Successful', `Welcome back, ${res.user.email}!`);
        onSuccess();
      } else if (mode === 'signup') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(res.user, { displayName: name.trim() });
        }
        // Save initial profile
        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          email: res.user.email || email,
          displayName: name.trim() || email.split('@')[0],
          photoURL: '',
          bio: 'Welcome to AuthSphere!',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          theme: 'system',
          notifications: true,
          createdAt: new Date().toISOString(),
        });

        recordSuccessfulAttempt();
        setRateLimit(getRateLimitStatus());
        onShowToast('success', 'Account Created!', 'Your account has been successfully configured.');
        onSuccess();
      } else if (mode === 'forgot-password') {
        await sendPasswordResetEmail(auth, email);
        onShowToast('info', 'Password Reset Sent', 'Check your inbox for password recovery instructions.');
        setMode('signin');
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      const updated = recordFailedAttempt();
      setRateLimit(updated);

      if (err.code === 'auth/operation-not-allowed') {
        setDemoNotice(
          'Notice: Email/Password provider is disabled in Firebase console by default. You can sign in instantly with Google, or enable Email/Password provider under Firebase Authentication > Sign-in method.'
        );
      }
      setErrorMessage(mapAuthError(err.code, err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const mapAuthError = (code: string, fallback: string) => {
    switch (code) {
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please verify your credentials and try again.';
      case 'auth/user-not-found':
        return 'No account exists with this email address. Please sign up first.';
      case 'auth/wrong-password':
        return 'Incorrect password. Click "Forgot Password" if you need to reset it.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please provide a valid email address format.';
      case 'auth/too-many-requests':
        return 'Too many requests. Access temporarily restricted. Try again later.';
      case 'auth/operation-not-allowed':
        return 'Email/Password authentication is currently not enabled in Firebase project.';
      default:
        return fallback || 'Authentication encountered an error. Please try again.';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl relative">
      {/* Rate Limiter Status Banner */}
      {rateLimit.isLocked ? (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm mb-1 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Security Lockout Active
          </div>
          <p className="mb-2">
            Too many consecutive failed attempts detected. Authentication endpoints are locked to prevent brute force attacks.
          </p>
          <div className="flex items-center justify-between font-mono bg-rose-100 dark:bg-rose-900/40 p-2 rounded-lg">
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock className="w-3.5 h-3.5" /> Unlock countdown:
            </span>
            <span className="font-bold text-sm">{formatSeconds(rateLimit.secondsRemaining)}</span>
          </div>
          <button
            onClick={() => setRateLimit(resetRateLimit())}
            className="mt-2 text-rose-600 dark:text-rose-400 underline font-medium hover:text-rose-800 text-[11px] block"
          >
            [Developer Testing]: Reset rate limiter lockout now
          </button>
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between text-[11px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Shield className="w-3 h-3 text-emerald-500" />
            Rate Limit Protection:
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {rateLimit.attemptsRemaining}/5 attempts remaining
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {mode === 'signin' && 'Sign In to Your Account'}
          {mode === 'signup' && 'Create Your Account'}
          {mode === 'forgot-password' && 'Reset Account Password'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {mode === 'signin' && 'Enter your credentials to access your dashboard'}
          {mode === 'signup' && 'Sign up to get started with full account management'}
          {mode === 'forgot-password' && 'Enter your email to receive recovery instructions'}
        </p>
      </div>

      {/* Google Sign In Button */}
      {mode !== 'forgot-password' && (
        <>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || rateLimit.isLocked}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Or with email</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
        </>
      )}

      {/* Main Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {mode !== 'forgot-password' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('forgot-password');
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength meter for signup */}
            {mode === 'signup' && password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Strength: {strength.label}</span>
                  <span>{strength.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Terms & Privacy checkbox for signup */}
        {mode === 'signup' && (
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms-check"
              checked={agreeTerms}
              onChange={e => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="terms-check" className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
              I have read and agree to the{' '}
              <button
                type="button"
                onClick={() => onOpenLegal('terms')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold underline inline"
              >
                Terms & Conditions
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => onOpenLegal('privacy')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold underline inline"
              >
                Privacy Policy
              </button>
              .
            </label>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Demo Notice */}
        {demoNotice && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{demoNotice}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || rateLimit.isLocked}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot-password' && 'Send Reset Email'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Mode switch footer */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        {mode === 'signin' && (
          <p>
            Don&apos;t have an account yet?{' '}
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setMode('signup');
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Sign Up Free
            </button>
          </p>
        )}
        {mode === 'signup' && (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setMode('signin');
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        )}
        {mode === 'forgot-password' && (
          <p>
            Remember your credentials?{' '}
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setMode('signin');
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Back to Sign In
            </button>
          </p>
        )}
      </div>

      {/* Simulator Tools Section for User Testing Requirement #4 & #5 */}
      <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800/80">
        <details className="text-left text-xs">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium select-none flex items-center justify-between">
            <span>🛠️ Testing & Rate Limiter Tools</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Toggle</span>
          </summary>
          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Easily simulate brute-force attempts and test rate limiting:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRateLimit(simulateLockout())}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors"
              >
                Trigger 2-min Lockout
              </button>
              <button
                type="button"
                onClick={() => setRateLimit(resetRateLimit())}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
              >
                Reset Rate Limits
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};
