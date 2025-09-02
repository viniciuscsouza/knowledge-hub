jest.mock('../firebase/config', () => ({
  app: {},
  auth: {},
  db: {},
}));
global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  status: 200,
  redirected: false,
  statusText: '',
  type: 'basic',
  url: '',
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  headers: { get: () => null },
}));
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../app/page';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

// Mocking the useAuth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mocking the useTheme hook
jest.mock('@/context/ThemeContext', () => ({
  useTheme: jest.fn()
}));

// Mocking the TopicManager component to isolate the HomePage test
// eslint-disable-next-line react/display-name
jest.mock('@/components/TopicManager', () => (props: any) => <div>Topic Manager Component. Search query: {props.searchQuery}</div>);

// Mocking the ThemeSwitch component
// eslint-disable-next-line react/display-name
jest.mock('@/components/ThemeSwitch', () => () => <button>Theme Switch</button>);

describe('HomePage', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: { displayName: 'Test User' }, loading: false });
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light', toggleTheme: jest.fn() });
  });

  // ...existing code...

  it('shows TopicManager when user is authenticated', () => {
    render(<HomePage />);
    const topicManager = screen.getByText(/Topic Manager Component/);
    expect(topicManager).toBeInTheDocument();
  });

  it('shows the search input when the search button is clicked', () => {
    render(<HomePage />);
    const searchButton = screen.getByRole('button', { name: '🔍' });
    fireEvent.click(searchButton);
    const searchInput = screen.getByPlaceholderText('Buscar por título...');
    expect(searchInput).toBeInTheDocument();
  });

  it('passes the search query to TopicManager', () => {
    render(<HomePage />);
    const searchButton = screen.getByRole('button', { name: '🔍' });
    fireEvent.click(searchButton);
    const searchInput = screen.getByPlaceholderText('Buscar por título...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    const topicManager = screen.getByText(/Topic Manager Component. Search query: test query/);
    expect(topicManager).toBeInTheDocument();
  });

  it('renders the theme switch', () => {
    render(<HomePage />);
    const themeSwitch = screen.getByRole('button', { name: 'Theme Switch' });
    expect(themeSwitch).toBeInTheDocument();
  });
});
