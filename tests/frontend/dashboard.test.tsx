
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import DashboardPage from '@/app/page';
import { vi } from 'vitest';
import { useUser, useCollection } from '@/firebase';

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

// Mock lucide-react icons
vi.mock('lucide-react', () => {
    const original = vi.importActual('lucide-react');
    return {
        ...original,
        CheckCircle: (props: any) => <svg data-testid="check-icon" {...props} className="text-green-500" />,
        Circle: (props: any) => <svg data-testid="circle-icon" {...props} />,
        KeyRound: (props: any) => <div data-testid="key-round-icon" />,
    };
});

describe('DashboardPage', () => {
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
        // Dispatch storage event to trigger useEffect in component
        window.dispatchEvent(new Event('storage'));
      },
      clear: () => {
        store = {};
      },
      removeItem: (key: string) => {
        delete store[key];
      }
    };
  })();

  beforeEach(() => {
    vi.mock('@/firebase', async () => {
        const original = await vi.importActual('@/firebase');
        return {
            ...original as any,
            useFirebase: vi.fn(() => ({ firestore: {} })),
            useCollection: vi.fn(() => ({ data: [], isLoading: false, error: null })),
            useMemoFirebase: (cb: () => any) => cb(),
            useUser: vi.fn(),
        };
    });
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });


  it('renders the dashboard heading', () => {
    vi.mocked(useUser).mockReturnValue({ user: { uid: '123', isAnonymous: false }, isUserLoading: false, userError: null } as any);
    render(<DashboardPage />);
    
    const heading = screen.getByRole('heading', { name: /Dashboard/i });
    expect(heading).toBeInTheDocument();
  });

  it('shows read-only mode for anonymous users', () => {
    vi.mocked(useUser).mockReturnValue({ user: { uid: 'anon123', isAnonymous: true }, isUserLoading: false, userError: null } as any);
    render(<DashboardPage />);

    const readOnlyTitle = screen.getByText(/Read-Only Mode/i);
    expect(readOnlyTitle).toBeInTheDocument();
  });

  it('shows welcome card and quick links', () => {
    vi.mocked(useUser).mockReturnValue({ user: { uid: '123', isAnonymous: false }, isUserLoading: false, userError: null } as any);
    render(<DashboardPage />);

    expect(screen.getByText(/Welcome to PortfolioForge/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /AI Assistant/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Live Site/i })).toBeInTheDocument();
  });

  it('shows checkmark for uploaded CV if data is in localStorage', () => {
    vi.mocked(useUser).mockReturnValue({ user: { uid: '123', isAnonymous: false }, isUserLoading: false, userError: null } as any);
    
    render(<DashboardPage />);
    
    // Check initial state (no checkmark)
    const cvItem = screen.getByText('CV Uploaded');
    const parentElement = cvItem.parentElement!;
    expect(parentElement.querySelector('[data-testid="circle-icon"]')).toBeInTheDocument();
    expect(parentElement.querySelector('[data-testid="check-icon"]')).not.toBeInTheDocument();

    // Simulate the update
    act(() => {
      window.localStorage.setItem('cvUploadSuccess', 'true');
    });

    // Check updated state (checkmark is present)
    expect(parentElement.querySelector('[data-testid="check-icon"]')).toBeInTheDocument();
    expect(parentElement.querySelector('[data-testid="circle-icon"]')).not.toBeInTheDocument();
  });
});
