# REAL ENGLISH — Especificação mestre de design, UX e funcionamento

DOCUMENTO MESTRE · A1–C1

# REAL ENGLISH
## Grammar Through Chunks

Uma identidade visual consistente para todas as aulas, com complexidade pedagógica crescente e componentes interativos reutilizáveis.

* Ler e compreender
* Interagir e produzir inglês
* Revisar chunks e acompanhar o progresso

---

## 1. Regra principal: reproduzir a experiência, não exibir o código

O REAL ENGLISH foi criado com elementos visuais como caixas, títulos, badges, linhas divisórias, tabelas, seletores, botões e estados interativos. O sistema de destino não precisa utilizar a mesma tecnologia do ChatGPT, mas deve reproduzir o resultado visual e funcional de cada elemento.

| O que aparece no arquivo original | O que o aluno deve ver no aplicativo |
| --- | --- |
| `<box>` | Cartão, painel ou contêiner com o fundo, as bordas e o espaçamento correspondentes. |
| `<title>` | Título com tamanho, peso, cor e hierarquia adequados. |
| `<badge>` | Etiqueta visual de nível, etapa ou categoria. |
| `<radio-group>` e `<radio>` | Pergunta com alternativas clicáveis, cada uma em sua própria linha. |
| `<button>` | Botão funcional com a ação prevista no conteúdo. |
| `<checkbox>` | Caixa de seleção funcional. |
| `<select>` e `<segmented-control>` | Controles para modificar exemplos e estruturas. |
| `{@body ...}` | Declarações de dados e estado que devem ser convertidas para a lógica do aplicativo; nunca mostradas ao aluno. |
| `{#if ...}` | Regra que determina quando uma explicação, resposta ou tradução aparece. |
| `{#each ...}` | Conjunto de elementos que devem ser repetidos com os dados da aula. |

É proibido apresentar ao aluno blocos de JSON, comandos de programação ou tags como substitutos das atividades. O arquivo original deve continuar acessível em um ambiente de autoria e auditoria, separado da página de estudo.

---

## 2. Identidade visual: cores, tipografia e espaçamento

### Paleta de cores e Design Tokens

| Token | Cor | Aplicação |
| --- | --- | --- |
| `brand.primary` | `#14283C` | Capa, cabeçalho e painéis principais. |
| `brand.secondary` | `#203D55` | Cartões internos em fundos escuros. |
| `brand.textOnDark` | `#FFFFFF` | Títulos e ações em áreas escuras. |
| `brand.mutedOnDark` | `#D5E8FF` | Descrições e subtítulos nas capas. |
| `brand.dividerOnDark` | `#536A7E` | Divisórias em áreas escuras. |
| `surface.page` | `#F3F6F9` | Fundo geral da área de estudo. |
| `surface.card` | `#FFFFFF` | Cartões de leitura e questões. |
| `surface.soft` | `#F0F6FA` | Exemplos e explicações secundárias. |
| `text.primary` | `#182D43` | Texto principal em fundo claro. |
| `text.secondary` | `#52667B` | Legendas, instruções e observações. |
| `feedback.success` | `#238456` | Acertos e estados concluídos. |
| `feedback.warning` | `#A66B19` | Revisões e respostas que exigem atenção. |
| `feedback.error` | `#B64747` | Erros identificados. |

As cores de feedback não podem ser o único sinal de acerto ou erro. Cada resultado deve incluir um texto como «Correto», «Vamos revisar» ou «Resposta ainda não corrigida».

### Padrões de composição

Use cartões com cantos arredondados, bordas discretas, respiro entre blocos e títulos que se destaquem do texto explicativo. Uma questão não deve ficar visualmente misturada com a explicação da questão anterior.

No celular, todos os cartões ocupam a largura útil da tela; os botões de resposta ficam empilhados verticalmente, com área de toque confortável. No desktop, o conteúdo de leitura deve ter largura limitada para que os parágrafos não se tornem linhas excessivamente longas.

---

## 3. Estrutura das páginas do aplicativo

O sistema terá quatro páginas principais para o aluno:

### Página A — Painel inicial
- Continuação de estudos da aula em andamento
- Atalhos para: Meu curso, Meus chunks, Meu progresso, Praticar inglês

### Página B — Meu curso
A navegação será `Nível → Parte → Aula → Etapa`. Cada item terá um estado explícito: planejado, disponível, em andamento, concluído ou revisão necessária.

### Página C — Leitor da aula
Cabeçalho com nível, parte e título; indicador de etapas; conteúdo principal; controles de interação; e ações de voltar, continuar e retomar.

### Página D — Revisão e progresso
Reúne os flashcards selecionados, os erros de exercícios, as atividades escritas pendentes de correção e a posição atual no curso.

---

## 4. Componentes obrigatórios dentro de uma aula

### 4.1. Reading — inglês primeiro
Diálogo inicial apresentando interlocutores em cartões de fala separados (Emma, Daniel), seguido por perguntas de compreensão e tradução revelável somente após tentativa de compreensão.

### 4.2. Questões de múltipla escolha
Pergunta como componente independente, com enunciado claro, alternativas verticais, botão de correção e feedback próprio com explicação.

### 4.3. Tradução revelável
A tradução fica oculta antes da tentativa de resposta. Só pode ser revelada após a correção/envio da compreensão.

### 4.4. Card de chunk
Apresenta etiqueta, frase em destaque, tradução, explicação gramatical, variações úteis e inglês real cotidiano.

### 4.5. Explorador de gramática
Componente interativo onde escolhas do aluno (sujeito, situação, modo de frase) modificam em tempo real a frase montada e sua respectiva tradução.

### 4.6. Diálogo interativo com caminhos diferentes
Simulação com ramificações onde a opção escolhida pelo aluno direciona a próxima pergunta do interlocutor.

### 4.7. Flashcards completos
Frase em inglês na frente; verso com tradução, chunk principal e gaveta expansível de detalhes (Gramática, Outros exemplos, Inglês real); botões de autoavaliação Errei / Difícil / Fácil e estatísticas.

### 4.8. Produção independente e correção
Perguntas abertas com campo de resposta, dica revelável, botão de envio e status explícito («Resposta salva; correção pendente»).

---

## 5. A sequência exata de estudo dentro da aula

1. **Abertura e objetivos**: Capa da aula, nível, parte, título e metas comunicativas.
2. **Compreensão inicial**: Reading ou diálogo em inglês primeiro, questões e tradução revelável.
3. **Chunk principal e gramática**: Expressão contextualizada, função comunicativa e contrastes.
4. **Família de chunks e exploradores**: Variações interativas da estrutura estudada.
5. **Situações reais e diálogo**: Aplicação em cenário comunicativo concreto.
6. **Exercícios progressivos**: Atividades com correção e feedback detalhado.
7. **Produção ativa**: Respostas próprias com modelos e critérios.
8. **Revisão e consolidação**: Flashcards seletivos, checklist e autoavaliação.

---

## 6. Como manter o mesmo padrão do A1 ao C1

A identidade visual permanece a mesma em todos os níveis. O que muda é a complexidade e a profundidade das tarefas.

- **A1**: Frases fundamentais, diálogos curtos, perguntas diretas, variações controladas.
- **A2**: Relatos simples, passado, futuro, experiências, situações cotidianas.
- **B1**: Narrativas, opiniões justificadas, hipóteses, diálogos extensos.
- **B2 (40 partes planejadas)**: Nuances de tempo verbal, dedução, condicionais, argumentação.
- **C1 (40 partes planejadas)**: Registro, interpretação implícita, síntese, precisão lexical.

---

## 7. O contrato técnico para reproduzir uma aula

Cada aula deve ser armazenada como conteúdo estruturado:
- `lesson_id`, `source_status`, `source_reference`, `level`, `volume`, `part`, `title`, `theme`.
- `sections`: array contendo objetos com `type` específicos (`english_first_reading`, `grammar_explanation`, `grammar_explorer`, `branching_dialogue`, `flashcard_deck`, `independent_writing`).
- `source_integrity`: rastreamento de integridade e revisão.
- Registro de progresso persistido por aluno e por atividade.
