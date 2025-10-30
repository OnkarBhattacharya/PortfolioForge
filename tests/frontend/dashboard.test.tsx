
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import DashboardPage from '@/app/page';
import { vi } from 'vitest';
import { useUser } from '@/firebase';

// Mock the Firebase hooks synchronously
vi.mock('@/firebase', () => ({
  useFirebase: vi.fn(() => ({ firestore: null })),
  useCollection: vi.fn(() => ({ data: [], isLoading: false, error: null })),
  useMemoFirebase: (cb: () => any) => cb(),
  useUser: vi.fn(),
}));

// Mock the placeholder image function synchronously
vi.mock('@/lib/placeholder-images', () => ({
  getPlaceholderImage: () => ({
    imageUrl: 'https://picsum.photos/seed/1/600/400',
    imageHint: 'sample hint',
  }),
}));

// Mock Next.js router synchronously
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
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

  beforeEach(() => {
    vi.mocked(useUser).mockClear();
    window.localStorage.clear();
  });

  it('renders the dashboard heading', () => {
    // Simulate a logged-in user
    vi.mocked(useUser).mockReturnValue({ user: { uid: '123', isAnonymous: false }, isUserLoading: false, userError: null });
    render(<DashboardPage />);
    
    // Check if the main heading is present
    const heading = screen.getByRole('heading', { name: /Dashboard/i });
    expect(heading).toBeInTheDocument();
  });

  it('shows read-only mode for anonymous users', () => {
    // Simulate a guest/anonymous user
    vi.mocked(useUser).mockReturnValue({ user: { uid: 'anon123', isAnonymous: true }, isUserLoading: false, userError: null });
    render(<DashboardPage />);

    // Check for the "Read-Only Mode" card
    const readOnlyTitle = screen.getByText(/Read-Only Mode/i);
    expect(readOnlyTitle).toBeInTheDocument();
  });

  it('shows welcome card and quick links', () => {
    vi.mocked(useUser).mockReturnValue({ user: { uid: '123', isAnonymous: false }, isUserLoading: false, userError: null });
    render(<DashboardPage />);

    // Check for key components on the dashboard
    expect(screen.getByText(/Welcome to PortfolioForge/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /AI Assistant/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Live Site/i })).toBeInTheDocument();
  });

  it('shows checkmark for uploaded CV if data is in localStorage', async () => {
    vi.mocked(useUser).mockReturnValue({ user: { uid: '123', isAnonymous: false }, isUserLoading: false, userError: null });
    
    act(() => {
      window.localStorage.setItem('cvUploadSuccess', 'true');
    });
    
    render(<DashboardPage />);
    
    const cvItem = screen.getByText('CV Uploaded');
    const parentElement = cvItem.parentElement;
    
    // Check for the CheckCircle SVG, which is now a mock icon
    const checkIcon = parentElement?.querySelector('svg');
    expect(checkIcon).toBeInTheDocument();
    // Verify it's the green check by checking the class on a real element
    expect(parentElement?.querySelector('.text-green-500')).toBeInTheDocument();
  });
});
