import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSwitch from '@/components/ThemeSwitch';
import { useTheme } from '@/context/ThemeContext';
jest.mock('@/context/ThemeContext', () => ({
  useTheme: jest.fn()
}));

jest.mock('@/context/ThemeContext');

describe('ThemeSwitch', () => {
  it('renders the switch unchecked in light mode', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light', toggleTheme: jest.fn() });
    render(<ThemeSwitch />);
    const switchInput = screen.getByRole('checkbox');
    expect(switchInput).not.toBeChecked();
  });

  it('renders the switch checked in dark mode', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark', toggleTheme: jest.fn() });
    render(<ThemeSwitch />);
    const switchInput = screen.getByRole('checkbox');
    expect(switchInput).toBeChecked();
  });

  it('calls toggleTheme when clicked', () => {
    const mockToggleTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });
    render(<ThemeSwitch />);
    const switchInput = screen.getByRole('checkbox');
    fireEvent.click(switchInput);
    expect(mockToggleTheme).toHaveBeenCalled();
  });
});
