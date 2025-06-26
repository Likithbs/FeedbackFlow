import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers, useFeedback } from '../../hooks/useApi';
import { User as UserIcon, MessageSquare, TrendingUp, CheckCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeamMembers: React.FC = () => {
  const { user } = useAuth();
  const { users: teamMembers, loading: usersLoading } = useUsers();
  const { feedback: feedbackData, loading: feedbackLoading } = useFeedback();

  if (usersLoading || feedbackLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-8"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getEmployeeStats = (employeeId: string) => {
    const employeeFeedback = feedbackData.filter(f => f.employeeId === employeeId);
    return {
      totalFeedback: employeeFeedback.length,
      acknowledged: employeeFeedback.filter(f => f.acknowledged).length,
      pending: employeeFeedback.filter(f => !f.acknowledged).length,
      lastFeedback: employeeFeedback.length > 0 
        ? new Date(Math.max(...employeeFeedback.map(f => new Date(f.createdAt).getTime())))
        : null,
      sentiment: {
        positive: employeeFeedback.filter(f => f.sentiment === 'positive').length,
        neutral: employeeFeedback.filter(f => f.sentiment === 'neutral').length,
        negative: employeeFeedback.filter(f => f.sentiment === 'negative').length
      }
    };
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Members</h1>
        <p className="text-gray-600">Manage and review your team member's feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => {
          const stats = getEmployeeStats(member.id);
          
          return (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Mail className="h-3 w-3" />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Feedback</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalFeedback}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Acknowledged</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">{stats.acknowledged}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-orange-600">{stats.pending}</span>
                </div>

                {stats.lastFeedback && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Feedback</span>
                    <span className="text-sm text-gray-500">
                      {stats.lastFeedback.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Sentiment Distribution</div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-green-100 rounded p-2 text-center">
                    <div className="text-xs text-green-800 font-medium">{stats.sentiment.positive}</div>
                    <div className="text-xs text-green-600">Positive</div>
                  </div>
                  <div className="flex-1 bg-yellow-100 rounded p-2 text-center">
                    <div className="text-xs text-yellow-800 font-medium">{stats.sentiment.neutral}</div>
                    <div className="text-xs text-yellow-600">Neutral</div>
                  </div>
                  <div className="flex-1 bg-red-100 rounded p-2 text-center">
                    <div className="text-xs text-red-800 font-medium">{stats.sentiment.negative}</div>
                    <div className="text-xs text-red-600">Needs Attention</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  to="/feedback/new"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 px-3 text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Give Feedback</span>
                </Link>
                
                <Link
                  to="/feedback/history"
                  className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-3 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>View History</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
          <p className="text-gray-600">You don't have any team members assigned to you yet.</p>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;