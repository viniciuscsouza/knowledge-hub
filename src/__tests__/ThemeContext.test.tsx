import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function Consumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span>theme:{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    // ensure localStorage is clean
    localStorage.removeItem('theme');
  });

  test('provides default theme and toggles', async () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );
    expect(screen.getByText(/theme:light/)).toBeInTheDocument();
    act(() => {
      screen.getByText('toggle').click();
    });
    await waitFor(() => expect(screen.getByText(/theme:dark/)).toBeInTheDocument());
  });
});
