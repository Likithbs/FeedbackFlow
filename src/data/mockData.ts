import { User, Feedback, Team } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'sarah.manager@company.com',
    name: 'Sarah Johnson',
    role: 'manager',
    teamId: 'team1'
  },
  {
    id: '2',
    email: 'john.smith@company.com',
    name: 'John Smith',
    role: 'employee',
    teamId: 'team1',
    managerId: '1'
  },
  {
    id: '3',
    email: 'emily.davis@company.com',
    name: 'Emily Davis',
    role: 'employee',
    teamId: 'team1',
    managerId: '1'
  },
  {
    id: '4',
    email: 'michael.brown@company.com',
    name: 'Michael Brown',
    role: 'employee',
    teamId: 'team1',
    managerId: '1'
  },
  {
    id: '5',
    email: 'alex.manager@company.com',
    name: 'Alex Wilson',
    role: 'manager',
    teamId: 'team2'
  },
  {
    id: '6',
    email: 'lisa.jones@company.com',
    name: 'Lisa Jones',
    role: 'employee',
    teamId: 'team2',
    managerId: '5'
  }
];

export const mockTeams: Team[] = [
  {
    id: 'team1',
    name: 'Engineering Team',
    managerId: '1'
  },
  {
    id: 'team2',
    name: 'Design Team',
    managerId: '5'
  }
];

export const mockFeedback: Feedback[] = [
  {
    id: 'fb1',
    managerId: '1',
    employeeId: '2',
    strengths: 'Excellent problem-solving skills and always delivers high-quality code. Great team collaboration and willingness to help others.',
    areasToImprove: 'Could benefit from improving time estimation for tasks and communicating blockers earlier.',
    sentiment: 'positive',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    acknowledged: true,
    acknowledgedAt: '2024-01-16T09:30:00Z'
  },
  {
    id: 'fb2',
    managerId: '1',
    employeeId: '3',
    strengths: 'Outstanding attention to detail and thorough testing. Excellent documentation skills.',
    areasToImprove: 'Could be more proactive in suggesting process improvements and taking on leadership opportunities.',
    sentiment: 'positive',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    acknowledged: false
  },
  {
    id: 'fb3',
    managerId: '1',
    employeeId: '4',
    strengths: 'Strong technical knowledge and quick learner. Good at asking the right questions.',
    areasToImprove: 'Needs to work on confidence in presenting ideas and be more vocal in team discussions.',
    sentiment: 'neutral',
    createdAt: '2024-01-08T11:15:00Z',
    updatedAt: '2024-01-08T11:15:00Z',
    acknowledged: true,
    acknowledgedAt: '2024-01-09T08:45:00Z'
  },
  {
    id: 'fb4',
    managerId: '1',
    employeeId: '2',
    strengths: 'Showed great initiative in the recent project and excellent mentoring of junior developers.',
    areasToImprove: 'Focus on reducing technical debt in legacy code and improving code review thoroughness.',
    sentiment: 'positive',
    createdAt: '2024-01-20T16:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
    acknowledged: false
  }
];

// Mock authentication
export const authenticateUser = (email: string, password: string): User | null => {
  // Simple mock authentication - in production, this would be handled by a backend
  const user = mockUsers.find(u => u.email === email);
  if (user && password === 'password123') {
    return user;
  }
  return null;
};

// Local storage helpers
export const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadFromStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const initializeStorage = () => {
  if (!loadFromStorage('users')) {
    saveToStorage('users', mockUsers);
  }
  if (!loadFromStorage('teams')) {
    saveToStorage('teams', mockTeams);
  }
  if (!loadFromStorage('feedback')) {
    saveToStorage('feedback', mockFeedback);
  }
};