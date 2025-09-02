import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Mock firebase auth functions used in AuthContext
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((auth: any, cb: any) => {
    // call with null initially
    cb(null);
    return () => { };
  }),
  signInWithPopup: jest.fn(() => Promise.resolve()),
  GoogleAuthProvider: jest.fn(),
  signOut: jest.fn(() => Promise.resolve()),
}));

const Consumer = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="user">{auth.user ? 'has-user' : 'no-user'}</span>
    </div>
  );
};

describe('AuthContext', () => {
  it('provides loading and user state', () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('no-user');
  });
});
