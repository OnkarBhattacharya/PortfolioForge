/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/page';

// Mock the Firebase hooks to simulate different user states
jest.mock('@/firebase', () => ({
  ...jest.requireActual('@/firebase'),
  useUser: jest.fn(),
  useFirebase: jest.fn(() => ({ firestore: null })), // Mock firestore instance
  useCollection: jest.fn(() => ({ data: [], isLoading: false })),
  useMemoFirebase: (cb: () => any) => cb(),
}));

// Mock the placeholder image function
jest.mock('@/lib/placeholder-images', () => ({
  getPlaceholderImage: () => ({
    imageUrl: 'https://picsum.photos/seed/1/600/400',
    imageHint: 'sample hint',
  }),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('DashboardPage', () => {
  const { useUser } = require('@/firebase');

  beforeEach(() => {
    // Reset mocks before each test
    (useUser as jest.Mock).mockClear();
    window.localStorage.clear();
  });

  it('renders the dashboard heading', () => {
    // Simulate a logged-in user
    useUser.mockReturnValue({ user: { uid: '123', isAnonymous: false }, isUserLoading: false });
    render(<DashboardPage />);
    
    // Check if the main heading is present
    const heading = screen.getByRole('heading', { name: /Dashboard/i });
    expect(heading).toBeInTheDocument();
  });

  it('shows read-only mode for anonymous users', () => {
    // Simulate a guest/anonymous user
    useUser.mockReturnValue({ user: { uid: 'anon123', isAnonymous: true }, isUserLoading: false });
    render(<DashboardPage />);

    // Check for the "Read-Only Mode" card
    const readOnlyTitle = screen.getByText(/Read-Only Mode/i);
    expect(readOnlyTitle).toBeInTheDocument();
  });

  it('shows welcome card and quick links', () => {
    useUser.mockReturnValue({ user: { uid: '123', isAnonymous: false }, isUserLoading: false });
    render(<DashboardPage />);

    // Check for key components on the dashboard
    expect(screen.getByText(/Welcome to PortfolioForge/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /AI Assistant/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Live Site/i })).toBeInTheDocument();
  });

  it('shows checkmark for uploaded CV if data is in localStorage', () => {
    useUser.mockReturnValue({ user: { uid: '123', isAnonymous: false }, isUserLoading: false });
    window.localStorage.setItem('cvData', JSON.stringify({ profession: 'Test' }));
    
    render(<DashboardPage />);

    const cvItem = screen.getByText('CV Uploaded').parentElement;
    expect(cvItem?.querySelector('svg.text-green-500')).toBeInTheDocument();
  });
});
