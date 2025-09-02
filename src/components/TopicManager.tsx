'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/firebase/config';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import styles from './TopicManager.module.css';

interface Topic {
  id: string;
  title: string;
}

interface TopicManagerProps {
  searchQuery: string;
}

export default function TopicManager({ searchQuery }: TopicManagerProps) {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'users', user.uid, 'topics'),
        orderBy('timestamp', 'desc')
      );
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

  const handleDeleteTopic = async (topicId: string) => {
    if (!user) return;
    if (window.confirm('Tem certeza que deseja excluir este tópico?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'topics', topicId));
      } catch (error) {
        console.error('Error deleting topic: ', error);
      }
    }
  };

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p>Carregando tópicos...</p>;
  }

  return (
    <div className="row">
      {filteredTopics.length > 0 ? (
        filteredTopics.map((topic) => (
          <div key={topic.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className={styles.card}>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteTopic(topic.id)}
              >
                X
              </button>
              <Link href={`/topic?id=${topic.id}`} className={styles.cardLink}>
                <h3 className={styles.cardTitle}>{topic.title}</h3>
                <p className={styles.cardDescription}>0 itens cadastrados</p>
              </Link>
            </div>
          </div>
        ))
      ) : (
        <div className="col-12">
          <p>Nenhum tópico encontrado. Comece criando um!</p>
        </div>
      )}
    </div>
  );
}
