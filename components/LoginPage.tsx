import { useState } from 'react';
import { Lock, User, Building2 } from 'lucide-react';

type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface LoginPageProps {
  onLogin: (userData: any) => void;
}

const userAccounts = [
  { email: 'admin@example.com', password: 'password123', role: 'Admin' as Role, name: 'System Admin' },
  { email: 'sarah@example.com', password: 'password123', role: 'Engineer' as Role, name: 'Sarah Engineer' },
  { email: 'michael@example.com', password: 'password123', role: 'Approver' as Role, name: 'Michael Approver' },
  { email: 'john@example.com', password: 'password123', role: 'Operations' as Role, name: 'John Operations' },
  { email: 'emma@example.com', password: 'password123', role: 'Engineer' as Role, name: 'Emma Engineer' },
  { email: 'david@example.com', password: 'password123', role: 'Admin' as Role, name: 'David Admin' },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userAccount: typeof userAccounts[0]) => {
    setEmail(userAccount.email);
    setPassword(userAccount.password);
    // Automatically trigger submit
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userAccount.email, password: userAccount.password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">ECOSetu</h1>
              <p className="text-slate-400">Enterprise Edition</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="font-semibold mb-2">Engineering Change Management</h3>
              <p className="text-sm text-slate-400">
                Comprehensive solution for managing products, bills of materials, and engineering change orders across manufacturing domains.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="font-semibold mb-2">Version Control & Approvals</h3>
              <p className="text-sm text-slate-400">
                Track product versions, manage approval workflows, and maintain complete audit trails for regulatory compliance.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="font-semibold mb-2">Multi-Industry Support</h3>
              <p className="text-sm text-slate-400">
                Designed for furniture, electronics, automotive, mechanical parts, and industrial equipment manufacturing.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-slate-600">Sign in to your account to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-600 mb-3 text-center">Quick Login (Demo Accounts)</p>
                <div className="grid grid-cols-2 gap-2">
                  {userAccounts.slice(0, 4).map((account) => (
                    <button
                      key={account.email}
                      onClick={() => handleQuickLogin(account)}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-medium text-slate-900">{account.name}</div>
                      <div className="text-slate-500">{account.role}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleQuickLogin(userAccounts[5])}
                  className="w-full mt-2 px-3 py-2 text-xs border border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="font-medium text-blue-900">{userAccounts[5].name}</div>
                  <div className="text-blue-600">{userAccounts[5].role}</div>
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500">
                  Demo credentials: Use any account above or<br />
                  Email: admin@example.com | Password: password123
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">
                © 2024 ECOSetu. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
