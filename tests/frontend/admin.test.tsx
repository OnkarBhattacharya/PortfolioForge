
import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/page';
import { vi } from 'vitest';
import { useCollection } from '@/firebase';

// Mock the Firebase hooks synchronously
vi.mock('@/firebase', () => ({
  useFirebase: vi.fn(() => ({ firestore: {} })),
  useCollection: vi.fn(),
  useMemoFirebase: (cb: () => any) => cb(),
}));

// Mock lucide-react synchronously and robustly
vi.mock('lucide-react', () => {
  // This proxy returns a dummy component for any requested icon,
  // ensuring the component doesn't crash if it uses other icons.
  return new Proxy({}, {
    get: (target, prop) => {
      if (prop === 'Loader2') {
        return (props: any) => <div data-testid="loader" {...props} />;
      }
      return (props: any) => <div data-testid={`mock-icon-${String(prop)}`} {...props} />;
    }
  });
});

describe('AdminDashboardPage', () => {

  beforeEach(() => {
    vi.mocked(useCollection).mockClear();
  });

  it('renders a loading state initially', () => {
    vi.mocked(useCollection).mockReturnValue({ data: null, isLoading: true, error: null });
    render(<AdminDashboardPage />);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders the user table with correct data', () => {
    const mockUsers = [
      { id: '1', fullName: 'Admin User', email: 'admin@example.com', subscriptionTier: 'pro', role: 'admin' },
      { id: '2', fullName: 'Free User', email: 'free@example.com', subscriptionTier: 'free', role: 'user' },
    ];
    vi.mocked(useCollection).mockReturnValue({ data: mockUsers, isLoading: false, error: null });

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
    expect(screen.getByRole('cell', { name: 'pro' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'admin' })).toBeInTheDocument();

    expect(screen.getByRole('cell', { name: /Free User/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /free@example.com/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'free' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'user' })).toBeInTheDocument();
  });

  it('renders an empty state when there are no users', () => {
    vi.mocked(useCollection).mockReturnValue({ data: [], isLoading: false, error: null });
    render(<AdminDashboardPage />);

    expect(screen.getByRole('heading', { name: /User Management/i })).toBeInTheDocument();
    expect(screen.queryByRole('cell')).not.toBeInTheDocument();
  });
});
