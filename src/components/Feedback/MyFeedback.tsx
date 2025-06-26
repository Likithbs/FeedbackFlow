import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers, useFeedback } from '../../hooks/useApi';
import { CheckCircle, Clock, MessageSquare, User as UserIcon } from 'lucide-react';

const MyFeedback: React.FC = () => {
  const { user } = useAuth();
  const { users, loading: usersLoading } = useUsers();
  const { feedback: myFeedback, loading: feedbackLoading, acknowledgeFeedback } = useFeedback();

  if (usersLoading || feedbackLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
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

  const sortedFeedback = myFeedback.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const acknowledgedCount = myFeedback.filter(f => f.acknowledged).length;
  const pendingCount = myFeedback.filter(f => !f.acknowledged).length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Feedback</h1>
        <p className="text-gray-600">
          Review feedback from {manager ? manager.name : 'your manager'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{myFeedback.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Acknowledged</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{acknowledgedCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{pendingCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Feedback History</h2>
        </div>
        
        <div className="p-6">
          {sortedFeedback.length > 0 ? (
            <div className="space-y-6">
              {sortedFeedback.map((feedback) => (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                        <UserIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {manager?.name || 'Your Manager'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        feedback.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        feedback.sentiment === 'neutral' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {feedback.sentiment}
                      </span>
                      
                      {feedback.acknowledged ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs">Acknowledged</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-orange-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-800 mb-2">✓ Strengths</h4>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                        {feedback.strengths}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-orange-800 mb-2">→ Areas to Improve</h4>
                      <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg">
                        {feedback.areasToImprove}
                      </p>
                    </div>
                  </div>
                  
                  {!feedback.acknowledged && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleAcknowledge(feedback.id)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark as Acknowledged</span>
                      </button>
                    </div>
                  )}
                  
                  {feedback.acknowledged && feedback.acknowledgedAt && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-green-600 flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Acknowledged on {new Date(feedback.acknowledgedAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  )}
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

export default MyFeedback;