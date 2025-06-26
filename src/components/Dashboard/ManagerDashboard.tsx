import React from 'react';
import { Users, MessageSquare, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers, useFeedback } from '../../hooks/useApi';

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { users: teamMembers, loading: usersLoading } = useUsers();
  const { feedback: feedbackData, loading: feedbackLoading } = useFeedback();

  if (usersLoading || feedbackLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sentimentCounts = {
    positive: feedbackData.filter(f => f.sentiment === 'positive').length,
    neutral: feedbackData.filter(f => f.sentiment === 'neutral').length,
    negative: feedbackData.filter(f => f.sentiment === 'negative').length
  };

  const acknowledgedCount = feedbackData.filter(f => f.acknowledged).length;
  const pendingCount = feedbackData.filter(f => !f.acknowledged).length;

  const stats = [
    {
      title: 'Team Members',
      value: teamMembers.length,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Feedback',
      value: feedbackData.length,
      icon: MessageSquare,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Acknowledged',
      value: acknowledgedCount,
      icon: CheckCircle,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending Review',
      value: pendingCount,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  const recentFeedback = feedbackData
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
        <p className="text-gray-600">Overview of your team's feedback and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 text-white ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feedback Sentiment</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Positive</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{sentimentCounts.positive}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Neutral</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{sentimentCounts.neutral}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Negative</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{sentimentCounts.negative}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h2>
          <div className="space-y-3">
            {recentFeedback.length > 0 ? (
              recentFeedback.map((feedback) => {
                const employee = teamMembers.find(m => m.id === feedback.employeeId);
                return (
                  <div key={feedback.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{employee?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        feedback.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        feedback.sentiment === 'neutral' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {feedback.sentiment}
                      </span>
                      {feedback.acknowledged && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No feedback given yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;