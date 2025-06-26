import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers, useFeedback } from '../../hooks/useApi';
import { Save, User as UserIcon } from 'lucide-react';

const FeedbackForm: React.FC = () => {
  const { user } = useAuth();
  const { users: teamMembers, loading: usersLoading } = useUsers();
  const { createFeedback } = useFeedback();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [strengths, setStrengths] = useState('');
  const [areasToImprove, setAreasToImprove] = useState('');
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await createFeedback({
      employeeId: selectedEmployee,
      strengths,
      areasToImprove,
      sentiment
    });

    if (success) {
      // Reset form
      setSelectedEmployee('');
      setStrengths('');
      setAreasToImprove('');
      setSentiment('positive');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setIsSubmitting(false);
  };

  if (usersLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Give Feedback</h1>
        <p className="text-gray-600">Provide structured feedback to help your team members grow</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Feedback submitted successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-2">
                Select Team Member
              </label>
              <div className="relative">
                <select
                  id="employee"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  required
                >
                  <option value="">Choose a team member...</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
                Strengths
              </label>
              <textarea
                id="strengths"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What are this person's key strengths? What have they done well?"
                required
              />
            </div>

            <div>
              <label htmlFor="areasToImprove" className="block text-sm font-medium text-gray-700 mb-2">
                Areas to Improve
              </label>
              <textarea
                id="areasToImprove"
                value={areasToImprove}
                onChange={(e) => setAreasToImprove(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What areas could they focus on for growth and development?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Sentiment
              </label>
              <div className="flex space-x-4">
                {[
                  { value: 'positive', label: 'Positive', color: 'text-green-600 bg-green-50 border-green-200' },
                  { value: 'neutral', label: 'Neutral', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
                  { value: 'negative', label: 'Needs Attention', color: 'text-red-600 bg-red-50 border-red-200' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sentiment"
                      value={option.value}
                      checked={sentiment === option.value}
                      onChange={(e) => setSentiment(e.target.value as any)}
                      className="sr-only"
                    />
                    <span className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      sentiment === option.value 
                        ? option.color 
                        : 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;