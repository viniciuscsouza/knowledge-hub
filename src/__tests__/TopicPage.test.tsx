import React from 'react';
import { render, screen } from '@testing-library/react';

// next/navigation's useSearchParams must be mocked in tests
jest.mock('next/navigation', () => ({ useSearchParams: () => ({ get: (k: string) => null }) }));

jest.mock('@/firebase/config', () => ({ db: {} }));
const mockGetDoc = jest.fn(() => Promise.resolve({ exists: () => false }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: function () { return mockGetDoc.apply(null, arguments as any); },
}));

jest.mock('@/components/ResourceManager', () => () => <div>ResourceManager</div>);
jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));

import TopicPage from '@/app/topic/page';
import { useAuth } from '@/context/AuthContext';

describe('TopicPage', () => {
  beforeEach(() => jest.resetAllMocks());

  test('shows not-found message when topic does not exist', async () => {
    (useAuth as any).mockReturnValue({ user: { uid: 'u1' } });
    render(<TopicPage />);
    expect(await screen.findByText(/Tópico não encontrado/i)).toBeInTheDocument();
  });
});
