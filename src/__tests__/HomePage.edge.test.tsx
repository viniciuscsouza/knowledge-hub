import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/firebase/config', () => ({ app: {}, auth: {}, db: {} }));
jest.mock('@/components/ThemeSwitch', () => () => <div>Theme</div>);
jest.mock('@/components/TopicManager', () => () => <div>TopicManager</div>);

describe('HomePage edge cases', () => {
  it('shows login prompt when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
    render(<HomePage />);
    expect(screen.getByText(/Por favor, faça login/i)).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: true });
    render(<HomePage />);
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });
});
