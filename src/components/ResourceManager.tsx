"use client";

import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface Resource {
  id: string;
  type: 'link' | 'anotacao';
  content: string;
  status: 'Pendente' | 'Concluído';
}

export default function ResourceManager({ topicId }: { topicId: string }) {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResourceType, setNewResourceType] = useState<'link' | 'anotacao'>('link');
  const [newResourceContent, setNewResourceContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'topics', topicId, 'resources'), orderBy('timestamp', 'asc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const resourcesData: Resource[] = [];
        querySnapshot.forEach((doc) => {
          resourcesData.push({ id: doc.id, ...doc.data() } as Resource);
        });
        setResources(resourcesData);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, topicId]);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newResourceContent.trim() === '' || !user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'topics', topicId, 'resources'), {
        type: newResourceType,
        content: newResourceContent,
        status: 'Pendente',
        timestamp: serverTimestamp(),
      });
      setNewResourceContent('');
    } catch (error) {
      console.error('Error adding resource: ', error);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'topics', topicId, 'resources', resourceId));
    } catch (error) {
      console.error('Error deleting resource: ', error);
    }
  };

  const handleToggleStatus = async (resource: Resource) => {
    if (!user) return;
    const newStatus = resource.status === 'Pendente' ? 'Concluído' : 'Pendente';
    try {
      await updateDoc(doc(db, 'users', user.uid, 'topics', topicId, 'resources', resource.id), {
        status: newStatus,
      });
    } catch (error) {
      console.error('Error updating resource status: ', error);
    }
  };

  if (loading) return <p>Carregando recursos...</p>;

  return (
    <div>
      <form onSubmit={handleAddResource} className="mb-4">
        <div className="input-group mb-2">
          <select className="form-select" value={newResourceType} onChange={(e) => setNewResourceType(e.target.value as 'link' | 'anotacao')} style={{ maxWidth: '120px' }}>
            <option value="link">Link</option>
            <option value="anotacao">Anotação</option>
          </select>
          <input
            type="text"
            className="form-control"
            value={newResourceContent}
            onChange={(e) => setNewResourceContent(e.target.value)}
            placeholder={newResourceType === 'link' ? 'https://...' : 'Sua anotação...'}
          />
          <button className="btn btn-primary" type="submit">Adicionar</button>
        </div>
      </form>

      <ul className="list-group">
        {resources.map(resource => (
          <li key={resource.id} className={`list-group-item d-flex justify-content-between align-items-center ${resource.status === 'Concluído' ? 'list-group-item-light text-muted' : ''}`}>
            <span onClick={() => handleToggleStatus(resource)} style={{ cursor: 'pointer' }}>
              <input type="checkbox" className="form-check-input me-2" checked={resource.status === 'Concluído'} readOnly />
              {resource.content}
            </span>
            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteResource(resource.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
