import React from 'react';
import { render, screen } from '@testing-library/react';

// next/navigation's useSearchParams must be mocked in tests
jest.mock('next/navigation', () => ({ useSearchParams: () => ({ get: (k: string) => 'topic1' }) }));

jest.mock('@/firebase/config', () => ({ db: {} }));
const mockGetDoc = jest.fn(() => Promise.resolve({ exists: () => false }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: function () { return mockGetDoc.apply(null, arguments as any); },
}));

jest.mock('@/components/ResourceManager', () => (props: any) => <div>ResourceManager for {props.topicId}</div>);
jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));

import TopicPage from '@/app/topic/page';
import { useAuth } from '@/context/AuthContext';

describe('TopicPage', () => {
  beforeEach(() => jest.resetAllMocks());

  test('shows not-found message when topic does not exist', async () => {
    (useAuth as any).mockReturnValue({ user: { uid: 'u1' } });
    mockGetDoc.mockResolvedValueOnce({ exists: () => false });
    render(<TopicPage />);
    expect(await screen.findByText(/Tópico não encontrado/i)).toBeInTheDocument();
  });

  test('shows title and ResourceManager when doc exists', async () => {
    (useAuth as any).mockReturnValue({ user: { uid: 'u1' } });
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ title: 'MyTopic' }) });
    render(<TopicPage />);
    expect(await screen.findByText('MyTopic')).toBeInTheDocument();
    expect(screen.getByText(/ResourceManager for topic1/)).toBeInTheDocument();
  });

  test('shows login/select message when no user', async () => {
    (useAuth as any).mockReturnValue({ user: null });
    render(<TopicPage />);
    expect(screen.getByText(/Por favor, faça login e selecione um tópico/)).toBeInTheDocument();
  });
});
