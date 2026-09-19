# REAL ENGLISH — Grammar Through Chunks

**Estado atual: protótipo técnico + catálogo curricular, NÃO migração integral do curso.**

O repositório `cascaoconcurseiro/flow` continha somente `README.md` na `main` quando foi inspecionado. O código de um aplicativo anterior, caso exista em outro local, **não estava aqui**. Esta branch foi criada para dar ao Codex um ponto de partida executável, com navegação de A1 a C1 e mecanismos de estudo reais.

## O que já funciona nesta branch

- Navegação pelos cinco níveis e pelos módulos/aulas que têm planejamento recuperado.
- Uma **aula-piloto explicitamente demonstrativa, não a aula original**, acessível no nível B1, com leitura em inglês, questões de compreensão e feedback por alternativa.
- Tradução revelável **somente depois de corrigir a compreensão**, explicações contextualizadas, flashcards com Errei/Difícil/Fácil, diálogo com feedback e tarefas de escrita.
- Rascunhos, respostas e avaliações da **demonstração** salvos em `localStorage` neste navegador; exportação local das respostas escritas em JSON.
- Importador local de exportação do ChatGPT com seleção explícita de conversas, preservação de cada objeto integral e hashes SHA-256, sem enviar material bruto ao repositório.

**Ainda não existe:** aula histórica integralmente importada, banco de dados, login, sincronização entre dispositivos, calendário de spaced repetition, geração/correção por IA, áudio/avaliação oral, hospedagem privada ou publicação do app. Não chamar o piloto de aula original.

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
| [data/demo-lesson.json](data/demo-lesson.json) | Aula-piloto técnica, diferente do texto original completo da Parte 32 do B1. |
| [curriculum/real_english_curriculum.json](curriculum/real_english_curriculum.json) | Catálogo do A1 ao C1: A1/A2 ainda sem originais, B1 com 33 posições; B2 e C1 com 40 partes planejadas cada. |
| [curriculum/real_english_system_prompt.md](curriculum/real_english_system_prompt.md) | Contrato de criação, importação, exibição e correção de aulas em português. |
| [AGENTS.md](AGENTS.md) | Instruções de continuidade para Codex. |
| [AUDIT_REAL_ENGLISH.md](AUDIT_REAL_ENGLISH.md) | Auditoria de cobertura do acervo e requisitos de preservação. |

## Recuperação privada do curso desde o A1

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

> Uma obra adicional encontrada na Biblioteca do usuário, “Gramática Completa de Inglês — A0–B2”, pode ser catalogada como **fonte suplementar distinta**; ela não deve substituir silenciosamente o histórico do curso interativo A1–C1. Não adicione sua cópia à branch pública sem revisão de conteúdo e autorização adequada.

## Status de integridade

- A1 e A2: aulas originais do REAL ENGLISH não importadas; quantidade e títulos originais permanecem não verificados.
- B1: 33 posições; títulos conhecidos das Partes 28–33; nenhum conteúdo integral importado no GitHub.
- B2 e C1: planejamento de 40 partes cada; aulas não redigidas/importadas.
- Demonstração funcional: separada do conteúdo histórico, identificada como `technical_demo_not_original`.

A próxima etapa da migração é vincular a exportação privada selecionada às unidades curriculares, extrair as aulas originais **sem resumo**, converter cada tipo de atividade para os componentes do app e validar uma aula-piloto contra sua fonte. **Sem exportação e comparação, não afirmar que nada foi perdido.**

Nunca comitar ZIP da conta, `conversations.json`, `.private/`, respostas pessoais, segredos ou dados de alunos em repositório público. Não fazer merge nem deploy sem uma decisão específica do mantenedor.
