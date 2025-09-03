import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('@/firebase/config', () => ({ db: {} }));
const mockAddDoc = jest.fn(() => Promise.resolve());
jest.mock('firebase/firestore', () => ({
  addDoc: function () { return mockAddDoc.apply(null, arguments as any); },
  collection: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock('@/components/TopicManager', () => () => <div>TopicManager</div>);
jest.mock('@/components/ThemeSwitch', () => () => <div>ThemeSwitch</div>);

const mockSignIn = jest.fn();
const mockLogout = jest.fn();

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import HomePage from '@/app/page';
import { useAuth } from '@/context/AuthContext';

describe('HomePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('shows login prompt when no user', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: false, signInWithGoogle: mockSignIn, logout: mockLogout });
    render(<HomePage />);
    expect(screen.getByText(/Por favor, faça login/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('👤'));
    expect(mockSignIn).toHaveBeenCalled();
  });

  test('shows TopicManager when user exists and can create topic', async () => {
    (useAuth as any).mockReturnValue({ user: { uid: 'u1' }, loading: false, signInWithGoogle: mockSignIn, logout: mockLogout });
    render(<HomePage />);
    expect(screen.getByText('TopicManager')).toBeInTheDocument();

    // open add form
    fireEvent.click(screen.getByText('➕'));
    const input = await screen.findByPlaceholderText('Título do novo tópico');
    fireEvent.change(input, { target: { value: 'Novo Tópico' } });
    fireEvent.click(screen.getByText('Criar'));

    await waitFor(() => expect(mockAddDoc).toHaveBeenCalled());
  });
});
