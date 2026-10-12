import React, { useState } from 'react';
import { Shield, FileText, X, CheckCircle, Search, Printer, Lock } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'terms',
  onAccept,
  showAcceptButton = false,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {activeTab === 'terms' ? <FileText className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {activeTab === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last revised: October 2026 • Version 2.4.0
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'terms'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'privacy'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search clause..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handlePrint}
              title="Print document"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {activeTab === 'terms' ? (
            <div className="space-y-6">
              <section className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  1. Acceptance of Terms
                </h4>
                <p>
                  By creating an account, signing in, or utilizing any services provided by AuthSphere,
                  you acknowledge that you have read, understood, and agreed to be bound by these Terms and
                  our Privacy Policy. If you do not accept these terms, you must refrain from registering
                  or using this platform immediately.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-2">
                  2. User Account & Security Safeguards
                </h4>
                <p className="mb-2">
                  You are responsible for maintaining the confidentiality of your login credentials,
                  including your email, password, and multi-factor verification tokens. You agree to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <li>Provide accurate, truthful, and updated account information.</li>
                  <li>Refrain from sharing account access credentials with unauthorized third parties.</li>
                  <li>Notify administrators immediately upon discovering unauthorized account activity.</li>
                  <li>Abide by automated rate-limiting protections designed to safeguard server integrity.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-2">
                  3. Rate Limiting & Abuse Prevention
                </h4>
                <p>
                  AuthSphere employs active rate-limiting countermeasures. Automated brute-force login attempts,
                  credential-stuffing attacks, or systematic spamming of authentication endpoints will trigger
                  an automatic progressive lockout mechanism. Persistent abuse will result in permanent IP restriction.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-2">
                  4. Account Deletion & Right to Erasure
                </h4>
                <p>
                  You hold an absolute right to terminate your account at any moment via the Account Deletion
                  segment in your dashboard. Upon confirmation, all personal profiles, stored credentials,
                  and subcollection audit logs are permanently wiped in adherence with international data erasure protocols.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-2">
                  5. Limitation of Liability & Disclaimers
                </h4>
                <p>
                  The services are provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis. AuthSphere disclaims all
                  warranties to the fullest extent permitted by law. In no event shall AuthSphere be liable
                  for indirect or consequential damages resulting from unauthorized network access.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-500" />
                  1. Information We Collect
                </h4>
                <p>
                  We prioritize data minimization. When you register or configure your account, we collect:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <li><strong>Account Credentials:</strong> Email address and hashed passwords (via secure Firebase Authentication).</li>
                  <li><strong>OAuth Identity Data:</strong> Display name, verified email, and profile avatar URL from Google OAuth.</li>
                  <li><strong>Profile Customization:</strong> User-defined biography, preferred timezone, and interface theme settings.</li>
                  <li><strong>Security Auditing:</strong> Timestamp, device user-agent, and IP hash for login monitoring and rate limiting.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-2">
                  2. How We Utilize Your Data
                </h4>
                <p>
                  Your information is processed strictly for:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <li>Authenticating user identities and managing secure sessions.</li>
                  <li>Preventing fraudulent access and enforcing client rate limits.</li>
                  <li>Syncing your custom profile settings across active sessions.</li>
                  <li>Providing security notification alerts regarding suspicious login attempts.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-2">
                  3. Zero Third-Party Monetization
                </h4>
                <p>
                  We never sell, rent, or trade your personal data, profile pictures, or browsing activity to third-party
                  advertisers or data brokers. Data is stored strictly within encrypted cloud databases under role-based
                  Attribute Access Controls (ABAC).
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-2">
                  4. GDPR & CCPA Compliance (Your Legal Rights)
                </h4>
                <p>
                  Regardless of your jurisdiction, you enjoy the right to:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <li>Access and export your complete profile records.</li>
                  <li>Rectify inaccurate or outdated account information.</li>
                  <li>Request complete, irrevocable deletion of all records (Right to be Forgotten).</li>
                  <li>Restrict processing or revoke OAuth tokens at any time.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-2">
                  5. Contact Data Protection Officer
                </h4>
                <p>
                  For privacy inquiries, audit requests, or compliance questions, reach our security desk at{' '}
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">privacy@authsphere.local</span>.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            By using this application, you agree to our standard terms.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Close
            </button>
            {showAcceptButton && onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                Accept & Proceed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
