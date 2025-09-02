"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/firebase/config';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface Topic {
  id: string;
  title: string;
}

export default function TopicManager() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'topics'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const topicsData: Topic[] = [];
        querySnapshot.forEach((doc) => {
          topicsData.push({ id: doc.id, ...doc.data() } as Topic);
        });
        setTopics(topicsData);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setTopics([]);
      setLoading(false);
    }
  }, [user]);

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopicTitle.trim() === '' || !user) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'topics'), {
        title: newTopicTitle,
        timestamp: serverTimestamp(),
      });
      setNewTopicTitle('');
    } catch (error) {
      console.error("Error adding topic: ", error);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'topics', topicId));
    } catch (error) {
      console.error("Error deleting topic: ", error);
    }
  };

  if (loading) {
    return <p>Carregando tópicos...</p>;
  }

  return (
    <div>
      <form onSubmit={handleAddTopic} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            placeholder="Novo tópico de estudo"
          />
          <button className="btn btn-primary" type="submit">Adicionar</button>
        </div>
      </form>

      <ul className="list-group">
        {topics.length > 0 ? (
          topics.map((topic) => (
            <li key={topic.id} className="list-group-item d-flex justify-content-between align-items-center">
              <Link href={`/topic?id=${topic.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {topic.title}
              </Link>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTopic(topic.id)}>
                Excluir
              </button>
            </li>
          ))
        ) : (
          <p>Nenhum tópico adicionado ainda. Comece criando um!</p>
        )}
      </ul>
    </div>
  );
}
