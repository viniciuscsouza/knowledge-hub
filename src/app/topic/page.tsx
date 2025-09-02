"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import ResourceManager from '@/components/ResourceManager';

function TopicContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('id');
  const [topicTitle, setTopicTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && topicId) {
      const getTitle = async () => {
        const topicDoc = await getDoc(doc(db, 'users', user.uid, 'topics', topicId));
        if (topicDoc.exists()) {
          setTopicTitle(topicDoc.data().title);
        }
        setLoading(false);
      };
      getTitle();
    } else {
      setLoading(false);
    }
  }, [user, topicId]);

  return (
    <main className="container mt-4">
      <header className="pb-3 mb-4 border-bottom">
        <Link href="/" className='btn btn-light me-3'>← Voltar</Link>
        <h1 className='d-inline-block'>{loading ? 'Carregando...' : topicTitle || 'Tópico não encontrado'}</h1>
      </header>

      {user && topicId ? (
        <ResourceManager topicId={topicId} />
      ) : (
        <p>Por favor, faça login e selecione um tópico.</p>
      )}
    </main>
  );
}

// A Suspense boundary is required by Next.js when using useSearchParams
export default function TopicPage() {
  return (
    <Suspense fallback={<div>Carregando página...</div>}>
      <TopicContent />
    </Suspense>
  );
}
