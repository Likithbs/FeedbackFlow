import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { User, Feedback } from '../types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response.users);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
};

export const useFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFeedback();
      setFeedback(response.feedback);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const createFeedback = async (feedbackData: {
    employeeId: string;
    strengths: string;
    areasToImprove: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }) => {
    try {
      await apiService.createFeedback(feedbackData);
      await fetchFeedback(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create feedback');
      return false;
    }
  };

  const updateFeedback = async (feedbackId: string, feedbackData: {
    strengths?: string;
    areasToImprove?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }) => {
    try {
      await apiService.updateFeedback(feedbackId, feedbackData);
      await fetchFeedback(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feedback');
      return false;
    }
  };

  const acknowledgeFeedback = async (feedbackId: string) => {
    try {
      await apiService.acknowledgeFeedback(feedbackId);
      await fetchFeedback(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge feedback');
      return false;
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return { 
    feedback, 
    loading, 
    error, 
    refetch: fetchFeedback,
    createFeedback,
    updateFeedback,
    acknowledgeFeedback
  };
};