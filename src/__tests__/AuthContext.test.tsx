import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Use shared mock from src/__mocks__/firebase/auth.ts
jest.mock('firebase/auth');

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

  it('calls signInWithPopup when signInWithGoogle is invoked and logs on reject', async () => {
    const firebase = require('firebase/auth');
    jest.clearAllMocks();

    // make signInWithPopup resolve first
    firebase.signInWithPopup.mockResolvedValueOnce({});

    const SignInConsumer = () => {
      const { signInWithGoogle } = useAuth();
      return <button onClick={signInWithGoogle}>signin</button>;
    };

    render(
      <AuthProvider>
        <SignInConsumer />
      </AuthProvider>
    );

    // clicking should call signInWithPopup
    screen.getByText('signin').click();
    expect(firebase.signInWithPopup).toHaveBeenCalled();

    // now simulate rejection and ensure console.error is called
    const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
    firebase.signInWithPopup.mockRejectedValueOnce(new Error('fail'));
    screen.getByText('signin').click();
    // allow microtask queue
    await Promise.resolve();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('calls signOut when logout is invoked and logs on reject', async () => {
    const firebase = require('firebase/auth');
    jest.clearAllMocks();

    const LogoutConsumer = () => {
      const { logout } = useAuth();
      return <button onClick={logout}>logout</button>;
    };

    // successful signOut
    firebase.signOut.mockResolvedValueOnce(undefined);
    render(
      <AuthProvider>
        <LogoutConsumer />
      </AuthProvider>
    );
    screen.getByText('logout').click();
    expect(firebase.signOut).toHaveBeenCalled();

    // failing signOut triggers console.error
    const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
    firebase.signOut.mockRejectedValueOnce(new Error('bad'));
    screen.getByText('logout').click();
    await Promise.resolve();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('useAuth throws when used outside provider', () => {
    function Outside() {
      useAuth();
      return null;
    }
    expect(() => render(<Outside />)).toThrow('useAuth must be used within an AuthProvider');
  });
});
