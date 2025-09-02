"use client";

import { useAuth } from "@/context/AuthContext";
import TopicManager from "@/components/TopicManager";

export default function HomePage() {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  return (
    <main className="container mt-4">
      <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <h1>Hub de Conhecimento</h1>
        {!loading && (
          <div>
            {user ? (
              <button className="btn btn-secondary" onClick={logout}>
                Sair
              </button>
            ) : (
              <button className="btn btn-primary" onClick={signInWithGoogle}>
                Login com Google
              </button>
            )}
          </div>
        )}
      </header>

      <div>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : user ? (
          <TopicManager />
        ) : (
          <div className="alert alert-info">Por favor, faça login para gerenciar seus tópicos.</div>
        )}
      </div>
    </main>
  );
}