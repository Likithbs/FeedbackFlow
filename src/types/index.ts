export interface User {
  id: string;
  email: string;
  name: string;
  role: 'manager' | 'employee';
  teamId: string;
  managerId?: string;
}

export interface Feedback {
  id: string;
  managerId: string;
  employeeId: string;
  strengths: string;
  areasToImprove: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: string;
  updatedAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}