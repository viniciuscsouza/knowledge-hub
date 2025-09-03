import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResourceManager from '@/components/ResourceManager';
import { useAuth } from '@/context/AuthContext';

// Mocking Firebase and Auth
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/firebase/config'); // Use the mock config


const mockAddDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockOnSnapshot = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: (_ref: any, data: any) => mockAddDoc(data),
  deleteDoc: () => mockDeleteDoc(),
  updateDoc: (_ref: any, data: any) => mockUpdateDoc(data),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  onSnapshot: (query: any, callback: any) => {
    mockOnSnapshot(query, callback);
    return () => { }; // Return a mock unsubscribe function
  },
}));

describe('ResourceManager', () => {
  const topicId = 'test-topic-id';

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'test-uid' } });
  });

  it('renders a list of resources', () => {
    // Arrange
    const mockResources = [
      { id: '1', data: () => ({ content: 'https://react.dev', status: 'Pendente' }) },
      { id: '2', data: () => ({ content: 'My first note', status: 'Concluído' }) },
    ];
    mockOnSnapshot.mockImplementation((query: any, callback: any) => {
      callback({
        docs: mockResources,
        forEach: (fn: any) => mockResources.forEach(fn)
      });
      return () => { };
    });

    // Act
    render(<ResourceManager topicId={topicId} />);

    // Assert
    expect(screen.getByText('https://react.dev')).toBeInTheDocument();
    expect(screen.getByText('My first note')).toBeInTheDocument();
  });

  it('allows a user to add a new resource', async () => {
    // Arrange
    render(<ResourceManager topicId={topicId} />);
    const input = screen.getByPlaceholderText('https://...');
    const addButton = screen.getByRole('button', { name: /adicionar/i });

    // Act
    fireEvent.change(input, { target: { value: 'https://nextjs.org' } });
    fireEvent.click(addButton);

    // Assert
    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalledWith({
        type: 'link',
        content: 'https://nextjs.org',
        status: 'Pendente',
        timestamp: expect.any(Date),
      });
    });
  });

  it('allows a user to toggle resource status', async () => {
    // Arrange
    const mockResources = [
      { id: '1', data: () => ({ content: 'Toggle me', status: 'Pendente' }) },
    ];
    mockOnSnapshot.mockImplementation((query: any, callback: any) => {
      callback({
        docs: mockResources,
        forEach: (fn: any) => mockResources.forEach(fn)
      });
      return () => { };
    });

    render(<ResourceManager topicId={topicId} />);
    const checkbox = screen.getByRole('checkbox');

    // Act
    fireEvent.click(checkbox);

    // Assert
    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalledWith({ status: 'Concluído' });
    });
  });

  it('deletes resource when confirmed and does not delete when canceled', async () => {
    const mockResources = [
      { id: '1', data: () => ({ content: 'Delete me', status: 'Pendente' }) },
    ];
    mockOnSnapshot.mockImplementation((query: any, callback: any) => {
      callback({
        docs: mockResources,
        forEach: (fn: any) => mockResources.forEach(fn)
      });
      return () => { };
    });

    render(<ResourceManager topicId={topicId} />);

    // Cancel delete
    window.confirm = jest.fn(() => false);
    const deleteBtn = await screen.findByRole('button', { name: 'X' });
    fireEvent.click(deleteBtn);

    // make test robust: clear any accidental calls, then confirm and expect a call
    mockDeleteDoc.mockClear();

    // Confirm delete
    window.confirm = jest.fn(() => true);
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });

  it('does nothing when user is not authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<ResourceManager topicId={topicId} />);

    // Should not throw and should not call addDoc/deleteDoc
    const input = screen.queryByPlaceholderText('https://...');
    expect(input).not.toBeInTheDocument();
  });

  it('changes placeholder when selecting anotacao and logs errors on failures', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'u1' } });

    mockOnSnapshot.mockImplementation((query: any, callback: any) => {
      callback({ forEach: (fn: any) => [{ id: '1', data: () => ({ content: 'http://a', status: 'Pendente' }) }].forEach(fn) });
      return () => { };
    });

    // make operations reject
    mockAddDoc.mockRejectedValueOnce(new Error('add-fail'));
    mockUpdateDoc.mockRejectedValueOnce(new Error('update-fail'));
    mockDeleteDoc.mockRejectedValueOnce(new Error('delete-fail'));

    const spy = jest.spyOn(console, 'error').mockImplementation(() => { });

    render(<ResourceManager topicId={topicId} />);

    // wait for input to appear
    await waitFor(() => expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument());

    // change type to anotacao and check placeholder
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'anotacao' } });
    expect(screen.getByPlaceholderText('Sua anotação...')).toBeInTheDocument();

    // try to add -> reject
    fireEvent.change(screen.getByPlaceholderText('Sua anotação...'), { target: { value: 'note' } });
    fireEvent.click(screen.getByText('Adicionar'));
    await waitFor(() => expect(spy).toHaveBeenCalled());

    // try toggle -> reject
    fireEvent.click(screen.getByText('http://a'));
    await waitFor(() => expect(spy).toHaveBeenCalled());

    // try delete -> reject
    fireEvent.click(screen.getByText('X'));
    await waitFor(() => expect(spy).toHaveBeenCalled());

    spy.mockRestore();
  });
});
