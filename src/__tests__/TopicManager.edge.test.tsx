import { render, screen } from '@testing-library/react';
import TopicManager from '@/components/TopicManager';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/firebase/config', () => ({ app: {}, auth: {}, db: {} }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  onSnapshot: (q: any, cb: any) => {
    // call with empty docs
    cb({ docs: [], forEach: (fn: any) => { } });
    return () => { };
  },
  query: jest.fn(),
  orderBy: jest.fn(),
  getCountFromServer: jest.fn(() => Promise.resolve({ data: () => ({ count: 0 }) })),
}));

describe('TopicManager edge cases', () => {
  it('shows empty state when no topics', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'u1' } });
    render(<TopicManager searchQuery="" />);
    expect(await screen.findByText(/Nenhum tópico encontrado/i)).toBeInTheDocument();
  });
});
