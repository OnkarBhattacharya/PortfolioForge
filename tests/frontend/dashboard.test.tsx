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
  useFirebase: jest.fn(() => ({})),
  useCollection: jest.fn(() => ({ data: [], isLoading: false })),
  useMemoFirebase: (cb) => cb(),
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
}));


describe('DashboardPage', () => {
  const { useUser } = require('@/firebase');

  it('renders the dashboard heading', () => {
    // Simulate a logged-in user
    useUser.mockReturnValue({ user: { isAnonymous: false }, isUserLoading: false });
    render(<DashboardPage />);
    
    // Check if the main heading is present
    const heading = screen.getByRole('heading', { name: /Dashboard/i });
    expect(heading).toBeInTheDocument();
  });

  it('shows read-only mode for anonymous users', () => {
    // Simulate a guest/anonymous user
    useUser.mockReturnValue({ user: { isAnonymous: true }, isUserLoading: false });
    render(<DashboardPage />);

    // Check for the "Read-Only Mode" card
    const readOnlyTitle = screen.getByText(/Read-Only Mode/i);
    expect(readOnlyTitle).toBeInTheDocument();
  });

  it('shows welcome card and quick links', () => {
    useUser.mockReturnValue({ user: { isAnonymous: false }, isUserLoading: false });
    render(<DashboardPage />);

    // Check for key components on the dashboard
    expect(screen.getByText(/Welcome to PortfolioForge/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /AI Assistant/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Live Site/i })).toBeInTheDocument();
  });
});
