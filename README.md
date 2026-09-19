# REAL ENGLISH — Grammar Through Chunks

**Estado atual: protótipo técnico + planejamento A1–C1 + exemplo original A0/Aula 01 recuperado do PDF. A migração integral do curso permanece pendente.**

O repositório `cascaoconcurseiro/flow` continha somente `README.md` na `main` quando foi inspecionado. O código de um aplicativo anterior, caso exista em outro local, **não estava aqui**. Esta branch foi criada para dar ao Codex um ponto de partida executável, com navegação de A1 a C1, acesso separado à primeira aula demonstrativa A0 documentada no PDF e mecanismos de estudo reais.

## O que já funciona nesta branch

- Navegação pelos cinco níveis A1–C1 e pelos módulos/aulas que têm planejamento recuperado; acesso separado à Aula 01 do exemplo A0 no PDF.
- **A0 · Unidade 01 · Aula 01 — I am / You are / He is:** exemplo original do PDF (páginas 6–10) transcrito por seção, com três chunks e explicações documentadas; acrescentamos questões, gabaritos, transformações, explorador, diálogo e escrita expressamente rotulados como prática NOVA para a versão web.\n- Uma aula-piloto adicional, explicitamente demonstrativa e não original, acessível no nível B1, com leitura em inglês, questões de compreensão e feedback por alternativa.
- Tradução revelável **somente depois de corrigir a compreensão**, explicações contextualizadas, flashcards com Errei/Difícil/Fácil, diálogo com feedback e tarefas de escrita.
- Rascunhos, respostas e avaliações da **demonstração** salvos em `localStorage` neste navegador; exportação local das respostas escritas em JSON.
- **Leitor privado dentro do app:** botão *Abrir acervo local* carrega um `conversations.json` escolhido no dispositivo, lista conversas e exibe integralmente as mensagens textuais de todas as ramificações presentes na fonte. Permite conferir o código de botões, contar componentes e baixar uma conversa bruta selecionada. O arquivo escolhido não é enviado à rede nem salvo no `localStorage` pelo leitor.
- Importador local de exportação do ChatGPT com seleção explícita de conversas, preservação de cada objeto integral e hashes SHA-256, sem enviar material bruto ao repositório.

**Ainda não existe:** conjunto integral de aulas históricas A1–B1, banco de dados, login, sincronização entre dispositivos, calendário de spaced repetition, geração/correção por IA, áudio/avaliação oral, hospedagem privada ou publicação do app. Não chamar o piloto de aula original.

## Executar no próprio computador

Requisitos: Node.js 20 ou posterior, sem dependências npm adicionais.

```sh
npm run dev
```

Abrir **http://127.0.0.1:4173/** no mesmo computador. O servidor de desenvolvimento escuta somente na interface local. NÃO é hospedagem pública nem persistência segura de dados multiusuário.

Verificações de dados e testes automatizados:

```sh
npm test
```

## Arquivos essenciais

| Arquivo | Propósito |
| --- | --- |
| [index.html](index.html), [src/app.js](src/app.js), [src/styles.css](src/styles.css) | Casca do app e componentes interativos demonstrativos. |
| [src/archive-browser.mjs](src/archive-browser.mjs), [src/archive-core.mjs](src/archive-core.mjs) | Inspeção privada das conversas originais e inventário textual de componentes, sem executar o código exportado. |
| [data/demo-lesson.json](data/demo-lesson.json) | Aula-piloto técnica, diferente do texto original completo da Parte 32 do B1. |\n| [data/pdf-a0-aula-01.json](data/pdf-a0-aula-01.json) | Exemplo A0 Aula 01 recuperado das páginas 6–10 do PDF, com transcrição do texto original e prática interativa NOVA claramente separada. |\n| [data/pdf-initial-curriculum.json](data/pdf-initial-curriculum.json) | Mapa inicial A0–B2, 12 tópicos da unidade TO BE e oito etapas do método documentados no PDF. |\n| [PDF_SOURCE_AUDIT.md](PDF_SOURCE_AUDIT.md) | Auditoria das 526 páginas: 14 com proposta e exemplo, 505 praticamente vazias e 7 com discussão sobre GitHub. |
| [curriculum/real_english_curriculum.json](curriculum/real_english_curriculum.json) | Catálogo do A1 ao C1: A1/A2 ainda sem originais, B1 com 33 posições; B2 e C1 com 40 partes planejadas cada. |
| [curriculum/real_english_system_prompt.md](curriculum/real_english_system_prompt.md) | Contrato de criação, importação, exibição e correção de aulas em português. |
| [AGENTS.md](AGENTS.md) | Instruções de continuidade para Codex. |
| [AUDIT_REAL_ENGLISH.md](AUDIT_REAL_ENGLISH.md) | Auditoria de cobertura do acervo e requisitos de preservação. |

## Recuperação privada do curso desde o A1

No protótipo, use **Abrir acervo local** para selecionar a cópia extraída de `conversations.json` diretamente no navegador. Filtre conversas candidatas, confira individualmente as mensagens e ramificações, revele o código textual dos controles e baixe somente as conversas escolhidas. O filtro de títulos é apenas indicativo; não exclua uma conversa sem examiná-la. Arquivos grandes podem precisar do importador abaixo. Não confunda visualizar a mensagem bruta com reconstruir o widget original.

1. Solicite a exportação de dados da conta ChatGPT. **Guarde o ZIP original intacto em local privado**. Extraia uma cópia do arquivo `conversations.json`.
2. Confira os IDs relevantes *no seu computador*, sem importar automaticamente conversas pessoais:
   ```sh
   node scripts/import-chatgpt-export.mjs --list /caminho/conversations.json
   ```
3. Escreva um arquivo `.private/selected-ids.txt` com **um ID de conversa do curso por linha**, revisado manualmente.
4. Arquive somente as conversas escolhidas:
   ```sh
   node scripts/import-chatgpt-export.mjs --source /caminho/conversations.json --ids-file .private/selected-ids.txt
   ```
5. O resultado fica em `.private/real-english-archive/` (ignorado pelo Git), com uma cópia integral em JSON de cada conversa escolhida e `manifest.json` com hashes e contagens. Isso **não** garante recuperar estados efêmeros de widgets, anexos nem aulas que não constem da exportação. Confirme as fontes originais por aula e por versão.
6. Gere um **índice privado completo de mensagens e todas as ramificações**, preservando o nó original integral e a fonte de cada mensagem:
   ```sh
   node scripts/index-private-archive.mjs
   ```
   O arquivo `.private/real-english-archive/normalized-message-index.json` contém todos os nós presentes nas conversas selecionadas, com IDs, pais, filhos, texto para busca e estrutura original. **É um arquivo histórico privado, não uma aula pronta nem um arquivo para publicar**. O programa recusa sobrescrever o índice existente.

> Uma obra adicional encontrada na Biblioteca do usuário, “Gramática Completa de Inglês — A0–B2”, pode ser catalogada como **fonte suplementar distinta**; ela não deve substituir silenciosamente o histórico do curso interativo A1–C1. Não adicione sua cópia à branch pública sem revisão de conteúdo e autorização adequada.

## Status de integridade

- A0: somente o exemplo inicial da Aula 01 recuperado do PDF, não uma sequência completa de aulas.\n- A1 e A2: aulas originais do REAL ENGLISH não importadas; quantidade e títulos originais permanecem não verificados.
- B1: 33 posições; títulos conhecidos das Partes 28–33; nenhum conteúdo integral importado no GitHub.
- B2 e C1: planejamento de 40 partes cada; aulas não redigidas/importadas.
- Demonstração funcional: separada do conteúdo histórico, identificada como `technical_demo_not_original`.

A próxima etapa da migração é vincular a exportação privada selecionada às unidades curriculares, extrair as aulas originais **sem resumo**, converter cada tipo de atividade para os componentes do app e validar novas aulas contra suas fontes. O PDF de 526 páginas fornece o exemplo A0 Aula 01 e o planejamento inicial, mas não as demais aulas completas. **Sem exportação e comparação, não afirmar que nada foi perdido.**

Nunca comitar ZIP da conta, `conversations.json`, `.private/`, respostas pessoais, segredos ou dados de alunos em repositório público. Não fazer merge nem deploy sem uma decisão específica do mantenedor.
