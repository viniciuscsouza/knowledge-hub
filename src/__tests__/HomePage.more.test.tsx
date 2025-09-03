import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/components/TopicManager', () => (props: any) => <div>Topic Manager Component. Search query: {props.searchQuery}</div>);
jest.mock('@/components/ThemeSwitch', () => () => <button>Theme Switch</button>);
jest.mock('@/firebase/config', () => ({ app: {}, auth: {}, db: {} }));

jest.mock('firebase/firestore');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const firestore = require('firebase/firestore');

describe('HomePage - additional behaviors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs error when addDoc throws', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'uid' }, loading: false, signInWithGoogle: jest.fn(), logout: jest.fn() });

    firestore.addDoc.mockRejectedValueOnce(new Error('fail'));

    render(<HomePage />);

    // open add input
    fireEvent.click(screen.getByRole('button', { name: '➕' }));
    fireEvent.change(screen.getByPlaceholderText('Título do novo tópico'), { target: { value: 'X' } });
    fireEvent.click(screen.getByText('Criar'));

    await waitFor(() => expect(firestore.addDoc).toHaveBeenCalled());
    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalled());

    consoleErrorSpy.mockRestore();
  });

  it('cancel buttons hide inputs and header class toggles', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false, signInWithGoogle: jest.fn(), logout: jest.fn() });

    const { container } = render(<HomePage />);

    const header = container.querySelector('header');
    const initialClass = header?.className || '';

    // open adding
    fireEvent.click(screen.getByRole('button', { name: '➕' }));
    expect(screen.getByPlaceholderText('Título do novo tópico')).toBeInTheDocument();

    // header class should change (expanded)
    const expandedClass = header?.className || '';
    expect(expandedClass).not.toBe(initialClass);

    // cancel add
    fireEvent.click(screen.getByText('Cancelar'));
    await waitFor(() => expect(screen.queryByPlaceholderText('Título do novo tópico')).not.toBeInTheDocument());

    // open searching
    fireEvent.click(screen.getByRole('button', { name: '🔍' }));
    expect(screen.getByPlaceholderText('Buscar por título...')).toBeInTheDocument();

    // cancel search
    fireEvent.click(screen.getByText('Cancelar'));
    await waitFor(() => expect(screen.queryByPlaceholderText('Buscar por título...')).not.toBeInTheDocument());
  });
});
