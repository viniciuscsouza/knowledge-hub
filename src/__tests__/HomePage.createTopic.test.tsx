import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/components/TopicManager', () => (props: any) => <div>Topic Manager Component. Search query: {props.searchQuery}</div>);
jest.mock('@/components/ThemeSwitch', () => () => <button>Theme Switch</button>);
jest.mock('@/firebase/config', () => ({ app: {}, auth: {}, db: {} }));

// Define mock implementation inside the factory to avoid jest.mock hoisting referencing uninitialized variables.
jest.mock('firebase/firestore');

const firestore = require('firebase/firestore');

describe('HomePage - create topic and profile actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a topic when user is present and title provided', async () => {
    const logout = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'uid' }, loading: false, signInWithGoogle: jest.fn(), logout });

    firestore.addDoc.mockResolvedValueOnce({ id: 'docid' });

    render(<HomePage />);

    // click add button to show input
    const addButton = screen.getByRole('button', { name: '➕' });
    fireEvent.click(addButton);

    const input = screen.getByPlaceholderText('Título do novo tópico');
    fireEvent.change(input, { target: { value: 'New Topic' } });

    const createButton = screen.getByText('Criar');
    fireEvent.click(createButton);

    await waitFor(() => expect(firestore.collection).toHaveBeenCalledWith({}, 'users', 'uid', 'topics'));
    await waitFor(() => expect(firestore.addDoc).toHaveBeenCalledWith(expect.any(Object), { title: 'New Topic', timestamp: 'ts' }));

    // after creation the input should be cleared/hidden
    await waitFor(() => expect(screen.queryByPlaceholderText('Título do novo tópico')).not.toBeInTheDocument());
  });

  it('does not create a topic when user is not present or title empty', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false, signInWithGoogle: jest.fn(), logout: jest.fn() });

    render(<HomePage />);

    const addButton = screen.getByRole('button', { name: '➕' });
    fireEvent.click(addButton);

    const createButton = screen.getByText('Criar');
    fireEvent.click(createButton);

    await waitFor(() => expect(firestore.addDoc).not.toHaveBeenCalled());
  });

  it('calls logout when profile button clicked and user is present', () => {
    const logout = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'uid' }, loading: false, signInWithGoogle: jest.fn(), logout });

    render(<HomePage />);

    const profileButton = screen.getByRole('button', { name: '👤' });
    fireEvent.click(profileButton);
    expect(logout).toHaveBeenCalled();
  });

  it('calls signInWithGoogle when profile button clicked and user is null', () => {
    const signInWithGoogle = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false, signInWithGoogle, logout: jest.fn() });

    render(<HomePage />);

    const profileButton = screen.getByRole('button', { name: '👤' });
    fireEvent.click(profileButton);
    expect(signInWithGoogle).toHaveBeenCalled();
  });
});
