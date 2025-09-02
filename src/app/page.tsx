"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import TopicManager from "@/components/TopicManager";
import styles from "./page.module.css";
import { db } from "@/firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function HomePage() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateTopic = async () => {
    if (!user || newTopicTitle.trim() === "") return;
    try {
      await addDoc(collection(db, "users", user.uid, "topics"), {
        title: newTopicTitle,
        timestamp: serverTimestamp(),
      });
      setNewTopicTitle("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error creating topic: ", error);
    }
  };

  return (
    <main className={styles.main}>
      <header
        className={`${styles.header} ${
          isAdding || isSearching ? styles.headerExpanded : ""
        }`}
      >
        <div className={styles.mainHeader}>
          <h1 className={styles.title}>HUB DE CONHECIMENTO</h1>
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={() => {
                setIsAdding(!isAdding);
                setIsSearching(false);
              }}
            >
              ➕
            </button>
            <button
              className={styles.actionButton}
              onClick={() => {
                setIsSearching(!isSearching);
                setIsAdding(false);
              }}
            >
              🔍
            </button>
            <div className={styles.profile}>
              {user ? (
                <button className={styles.actionButton} onClick={logout}>
                  👤
                </button>
              ) : (
                <button
                  className={styles.actionButton}
                  onClick={signInWithGoogle}
                >
                  👤
                </button>
              )}
            </div>
          </div>
        </div>
        <div className={styles.expandableContent}>
          {isAdding && (
            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.input}
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Título do novo tópico"
              />
              <button className={styles.button} onClick={handleCreateTopic}>
                Criar
              </button>
              <button
                className={`${styles.button} ${styles.cancelButton}`}
                onClick={() => setIsAdding(false)}
              >
                Cancelar
              </button>
            </div>
          )}
          {isSearching && (
            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.input}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título..."
              />
              <button
                className={`${styles.button} ${styles.cancelButton}`}
                onClick={() => setIsSearching(false)}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </header>

      <div className={styles.content}>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : user ? (
          <TopicManager searchQuery={searchQuery} />
        ) : (
          <div className="alert alert-info">
            Por favor, faça login para gerenciar seus tópicos.
          </div>
        )}
      </div>
    </main>
  );
}