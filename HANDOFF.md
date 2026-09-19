# Handoff — REAL ENGLISH

## Estado em 2026-09-19

A implementação Vinext anterior foi preservada em `C:\Users\Wesley\Documents\ChatGPT\Flow-backups\pre-github-replacement-20260919-165830` e removida da árvore ativa. A raiz agora usa a branch `feat/real-english-curriculum-spec` do repositório indicado pelo usuário.

Foram preservadas literalmente duas fontes em `.private/source-archives/real-english-course-package.json`: 78 páginas do PDF anterior e 9 páginas do PDF atualizado. O pacote contém o currículo A1–C1, a demonstração técnica, texto de cada página, hashes por página, hashes por fonte e intervalos de proveniência. O leitor local do app agora aceita esse formato além de `conversations.json`.

`data/recovered-source-index.json` expõe sem dados brutos:

- variante de 12 módulos A1 recuperada das páginas 45–46;
- direções curriculares A1–C1 recuperadas da página 46;
- unidade A1 das páginas 68–69 como `historical_variant_unverified`;
- aula “Have you ever...?” das páginas 24–42 como `historical_original_unverified`;
- B2/C1 como planejamento, não aulas prontas.

## Próximo passo concreto

Normalizar primeiro `SOURCE-A1-FIRST-CONTACT` (páginas 68–69) para um JSON executável em `data/lessons/`, preservando o texto literal e ligando cada campo ao hash/página de origem. Depois normalizar `SOURCE-A2-B1-PRESENT-PERFECT` (páginas 24–42) e comparar todas as perguntas, alternativas, respostas, traduções, chunks e ações com o pacote privado.

## Bloqueios

- O histórico completo A1/A2/B1 não está no PDF atualizado, na conversa compartilhada nem nas pastas pesquisadas. É necessária a exportação `conversations.json` ou os arquivos originais para copiar as aulas restantes.
- B2/C1 possuem 40 partes planejadas por nível, mas não 80 aulas já redigidas.
- Não fazer merge, push, deploy ou publicação sem autorização explícita.
