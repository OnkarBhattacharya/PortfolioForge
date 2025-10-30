/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/page';
import { Loader2 } from 'lucide-react';

// Mock the Firebase hooks
jest.mock('@/firebase', () => ({
  ...jest.requireActual('@/firebase'),
  useFirebase: jest.fn(() => ({ firestore: {} })), // Mock firestore instance
  useCollection: jest.fn(),
  useMemoFirebase: (cb: () => any) => cb(),
}));

// Mock lucide-react
jest.mock('lucide-react', () => {
    const original = jest.requireActual('lucide-react');
    return {
        ...original,
        Loader2: (props: any) => <div data-testid="loader" {...props} />,
    };
});


describe('AdminDashboardPage', () => {
  const { useCollection } = require('@/firebase');

  beforeEach(() => {
    (useCollection as jest.Mock).mockClear();
  });

  it('renders a loading state initially', () => {
    useCollection.mockReturnValue({ data: null, isLoading: true });
    render(<AdminDashboardPage />);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders the user table with correct data', () => {
    const mockUsers = [
      { id: '1', fullName: 'Admin User', email: 'admin@example.com', subscriptionTier: 'pro', role: 'admin' },
      { id: '2', fullName: 'Free User', email: 'free@example.com', subscriptionTier: 'free', role: 'user' },
    ];
    useCollection.mockReturnValue({ data: mockUsers, isLoading: false });

    render(<AdminDashboardPage />);

    expect(screen.getByRole('heading', { name: /User Management/i })).toBeInTheDocument();
    
    // Check table headers
    expect(screen.getByRole('columnheader', { name: /Full Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Email/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Subscription/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Role/i })).toBeInTheDocument();

    // Check table content
    expect(screen.getByRole('cell', { name: /Admin User/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /admin@example.com/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /pro/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /admin/i })).toBeInTheDocument();

    expect(screen.getByRole('cell', { name: /Free User/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /free@example.com/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /free/i, exact: false })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /user/i })).toBeInTheDocument();
  });

  it('renders an empty state when there are no users', () => {
    useCollection.mockReturnValue({ data: [], isLoading: false });
    render(<AdminDashboardPage />);

    expect(screen.getByRole('heading', { name: /User Management/i })).toBeInTheDocument();
    expect(screen.queryByRole('cell')).not.toBeInTheDocument();
  });
});
