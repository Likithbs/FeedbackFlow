import React from 'react';
import { MessageSquare, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers, useFeedback } from '../../hooks/useApi';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { users, loading: usersLoading } = useUsers();
  const { feedback: myFeedback, loading: feedbackLoading, acknowledgeFeedback } = useFeedback();

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

  const manager = users.find(u => u.id === user?.managerId);

  const handleAcknowledge = async (feedbackId: string) => {
    await acknowledgeFeedback(feedbackId);
  };

  const acknowledgedCount = myFeedback.filter(f => f.acknowledged).length;
  const pendingCount = myFeedback.filter(f => !f.acknowledged).length;
  const sentimentCounts = {
    positive: myFeedback.filter(f => f.sentiment === 'positive').length,
    neutral: myFeedback.filter(f => f.sentiment === 'neutral').length,
    negative: myFeedback.filter(f => f.sentiment === 'negative').length
  };

  const stats = [
    {
      title: 'Total Feedback',
      value: myFeedback.length,
      icon: MessageSquare,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Acknowledged',
      value: acknowledgedCount,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Review',
      value: pendingCount,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Positive Feedback',
      value: sentimentCounts.positive,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const sortedFeedback = myFeedback.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Dashboard</h1>
        <p className="text-gray-600">
          Your feedback timeline and insights from {manager ? manager.name : 'your manager'}
        </p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Feedback Timeline</h2>
        </div>
        
        <div className="p-6">
          {sortedFeedback.length > 0 ? (
            <div className="space-y-6">
              {sortedFeedback.map((feedback) => (
                <div key={feedback.id} className="relative">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        feedback.acknowledged ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {feedback.acknowledged ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {manager?.name || 'Manager'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              feedback.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                              feedback.sentiment === 'neutral' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {feedback.sentiment}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-green-800 mb-1">Strengths</h4>
                            <p className="text-sm text-gray-700">{feedback.strengths}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-orange-800 mb-1">Areas to Improve</h4>
                            <p className="text-sm text-gray-700">{feedback.areasToImprove}</p>
                          </div>
                        </div>
                        
                        {!feedback.acknowledged && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => handleAcknowledge(feedback.id)}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                            >
                              Mark as Acknowledged
                            </button>
                          </div>
                        )}
                        
                        {feedback.acknowledged && feedback.acknowledgedAt && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-green-600">
                              ✓ Acknowledged on {new Date(feedback.acknowledgedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
              <p className="text-gray-600">You haven't received any feedback from your manager yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;