import React, { useState } from 'react';
import { MessageCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  const demoAccounts = [
    { 
      category: 'Managers',
      accounts: [
        { email: 'sarah.manager@company.com', name: 'Sarah Johnson', team: 'Engineering Team' },
        { email: 'alex.manager@company.com', name: 'Alex Wilson', team: 'Design Team' },
        { email: 'maria.manager@company.com', name: 'Maria Rodriguez', team: 'Marketing Team' },
        { email: 'david.manager@company.com', name: 'David Chen', team: 'Sales Team' },
        { email: 'jennifer.manager@company.com', name: 'Jennifer Taylor', team: 'Product Team' }
      ]
    },
    {
      category: 'Employees',
      accounts: [
        { email: 'john.smith@company.com', name: 'John Smith', team: 'Engineering' },
        { email: 'emily.davis@company.com', name: 'Emily Davis', team: 'Engineering' },
        { email: 'lisa.jones@company.com', name: 'Lisa Jones', team: 'Design' },
        { email: 'james.miller@company.com', name: 'James Miller', team: 'Marketing' },
        { email: 'natalie.adams@company.com', name: 'Natalie Adams', team: 'Sales' },
        { email: 'olivia.martinez@company.com', name: 'Olivia Martinez', team: 'Product' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl w-fit mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to FeedbackFlow</h1>
            <p className="text-gray-600">Sign in to access your feedback dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4 text-center">
              Demo Accounts (Password: <span className="font-mono bg-gray-100 px-2 py-1 rounded">password123</span>)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoAccounts.map((category) => (
                <div key={category.category} className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-2">
                    {category.category}
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {category.accounts.map((account) => (
                      <button
                        key={account.email}
                        onClick={() => {
                          setEmail(account.email);
                          setPassword('password123');
                        }}
                        className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      >
                        <div className="font-medium text-gray-900">{account.name}</div>
                        <div className="text-gray-600">{account.email}</div>
                        <div className="text-gray-500 text-xs">{account.team}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;