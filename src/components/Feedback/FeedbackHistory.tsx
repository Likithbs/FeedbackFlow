import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers, useFeedback } from '../../hooks/useApi';
import { Edit2, Save, X, CheckCircle, Clock } from 'lucide-react';

const FeedbackHistory: React.FC = () => {
  const { user } = useAuth();
  const { users: teamMembers, loading: usersLoading } = useUsers();
  const { feedback: feedbackData, loading: feedbackLoading, updateFeedback } = useFeedback();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    strengths: '',
    areasToImprove: '',
    sentiment: 'positive' as 'positive' | 'neutral' | 'negative'
  });

  if (usersLoading || feedbackLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = (feedback: any) => {
    setEditingId(feedback.id);
    setEditForm({
      strengths: feedback.strengths,
      areasToImprove: feedback.areasToImprove,
      sentiment: feedback.sentiment
    });
  };

  const handleSave = async (feedbackId: string) => {
    const success = await updateFeedback(feedbackId, editForm);
    if (success) {
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ strengths: '', areasToImprove: '', sentiment: 'positive' });
  };

  const sortedFeedback = feedbackData.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getEmployeeName = (employeeId: string) => {
    const employee = teamMembers.find(m => m.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Feedback History</h1>
        <p className="text-gray-600">Review and manage all feedback you've given to your team</p>
      </div>

      <div className="space-y-6">
        {sortedFeedback.length > 0 ? (
          sortedFeedback.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getEmployeeName(feedback.employeeId)}
                  </h3>
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
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                  {editingId !== feedback.id && (
                    <button
                      onClick={() => handleEdit(feedback)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {editingId === feedback.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Strengths
                    </label>
                    <textarea
                      value={editForm.strengths}
                      onChange={(e) => setEditForm({ ...editForm, strengths: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Areas to Improve
                    </label>
                    <textarea
                      value={editForm.areasToImprove}
                      onChange={(e) => setEditForm({ ...editForm, areasToImprove: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sentiment
                    </label>
                    <div className="flex space-x-3">
                      {[
                        { value: 'positive', label: 'Positive' },
                        { value: 'neutral', label: 'Neutral' },
                        { value: 'negative', label: 'Needs Attention' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="editSentiment"
                            value={option.value}
                            checked={editForm.sentiment === option.value}
                            onChange={(e) => setEditForm({ ...editForm, sentiment: e.target.value as any })}
                            className="sr-only"
                          />
                          <span className={`px-3 py-1 rounded-lg text-sm border ${
                            editForm.sentiment === option.value
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}>
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => handleSave(feedback.id)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-800 mb-2">Strengths</h4>
                    <p className="text-gray-700">{feedback.strengths}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-orange-800 mb-2">Areas to Improve</h4>
                    <p className="text-gray-700">{feedback.areasToImprove}</p>
                  </div>
                  
                  {feedback.updatedAt !== feedback.createdAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {new Date(feedback.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback history</h3>
            <p className="text-gray-600">You haven't given any feedback yet. Start by giving feedback to your team members.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackHistory;