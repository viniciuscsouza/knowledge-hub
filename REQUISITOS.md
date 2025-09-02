# Estrutura do Layout - Hub de Conhecimento

---

# TELA INICIAL

## Cabeçalho

* **Título:** "HUB DE CONHECIMENTO" (alinhado à esquerda).
* **Ícones de ação (alinhados à direita):**

  * ➕ Adicionar novo tópico.
  * 🔍 Buscar tópico/item.
  * 👤 Perfil do usuário.

📌 **Responsividade:**

* Em telas menores, os ícones podem se agrupar em um menu lateral ou dropdown.

## Lista de Tópicos

* **Cada card de tópico contém:**

  * **Título:** "Nome do tópico" (texto em destaque).
  * **Descrição:** "x itens cadastrados" (texto menor).
  * **Botão de exclusão:** Ícone "X" no canto superior direito do card.

📌 **Funcionalidades:**

* Clique no card → abre a página/lista de itens do tópico.
* Clique no "X" → remove o tópico (com confirmação).

📌 **Responsividade:**

* Cards exibidos em **coluna única** (mobile-first).
* Em telas maiores (desktop/tablet), podem ser exibidos em **grid responsivo** (ex: 2 ou 3 colunas).

## Rodapé

* Último card visível segue o mesmo padrão dos anteriores.
* O layout é **scrollável verticalmente** para navegar pelos tópicos.

## Considerações de Estilo

* **Cards:** Bordas arredondadas, sombra leve para destaque.
* **Botões (ícones):** Clicáveis, com `hover/focus` para acessibilidade.
* **Tipografia:**

  * Cabeçalho → destaque maior.
  * Nome do tópico → peso médio/semibold.
  * Descrição → menor, cor secundária.

---

