import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';
import { useAuth } from '@/context/AuthContext';

// Mocking the useAuth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mocking the TopicManager component to isolate the HomePage test
// eslint-disable-next-line react/display-name
jest.mock('@/components/TopicManager', () => () => <div>Topic Manager Component</div>);

describe('HomePage', () => {
  it('shows login button when user is not authenticated', () => {
    // Arrange: Simulate a logged-out user
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });

    // Act
    render(<HomePage />);

    // Assert
    const loginButton = screen.getByRole('button', { name: /login com google/i });
    expect(loginButton).toBeInTheDocument();

    const welcomeMessage = screen.queryByText(/bem-vindo/i);
    expect(welcomeMessage).not.toBeInTheDocument();
  });

  it('shows TopicManager when user is authenticated', () => {
    // Arrange: Simulate a logged-in user
    (useAuth as jest.Mock).mockReturnValue({
      user: { displayName: 'Test User' },
      loading: false,
    });

    // Act
    render(<HomePage />);

    // Assert
    const topicManager = screen.getByText('Topic Manager Component');
    expect(topicManager).toBeInTheDocument();

    const loginButton = screen.queryByRole('button', { name: /login com google/i });
    expect(loginButton).not.toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    // Arrange: Simulate loading state
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: true });

    // Act
    render(<HomePage />);

    // Assert
    const loadingSpinner = screen.getByRole('status');
    expect(loadingSpinner).toBeInTheDocument();
  });
});
