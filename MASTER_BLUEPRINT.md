# Master Blueprint — REAL ENGLISH

## Objetivo

Aplicativo local e auditável de gramática por chunks, navegável de A1 a C1. O sistema deve preservar o conteúdo histórico literalmente, exibir o planejamento sem tratá-lo como aula pronta e converter materiais recuperados para atividades executáveis apenas após conferência com a fonte.

## Arquitetura atual

- Aplicativo estático em HTML, CSS e módulos JavaScript, sem dependências npm.
- `curriculum/real_english_curriculum.json`: catálogo público A1–C1.
- `data/recovered-source-index.json`: índice público de planejamento e fontes recuperadas.
- `data/demo-lesson.json`: demonstração técnica funcional, explicitamente não original.
- `.private/source-archives/real-english-course-package.json`: pacote local ignorado pelo Git, com texto literal e hashes.
- `src/archive-browser.mjs`: inspeção local de `conversations.json` e do pacote literal.
- `scripts/import-chatgpt-export.mjs` e `scripts/index-private-archive.mjs`: preservação de exportações privadas.

## Estados de proveniência

- `historical_original`: cópia comprovada da fonte histórica.
- `historical_variant`: versão recuperada, ainda sem confirmação de que era a versão publicada.
- `technical_demo_not_original`: conteúdo criado somente para validar componentes.
- `planned_not_authored`: item de currículo, não uma aula escrita.
- Sufixo `unverified`: fonte localizada, mas ainda não normalizada e comparada campo a campo.

## Decisões de arquitetura

| Data | Decisão | Motivo |
| --- | --- | --- |
| 2026-09-19 | Substituir a implementação Vinext pela branch `feat/real-english-curriculum-spec` | Seguir a base explicitamente indicada pelo usuário e pelo chat compartilhado. |
| 2026-09-19 | Manter fontes brutas em `.private/` e publicar somente índices sem conteúdo sensível | Preservar literalidade sem expor conversas e dados privados. |
| 2026-09-19 | Armazenar hashes SHA-256 por página e documento | Detectar perda ou alteração durante a migração. |
| 2026-09-19 | Manter catálogo, planejamento, fonte histórica e aula executável em camadas distintas | Impedir que títulos e planos sejam apresentados como curso já criado. |
| 2026-09-19 | Não gerar silenciosamente as aulas ausentes | A exigência é copiar o que existe; lacunas precisam continuar visíveis. |

## Limites atuais

- A1/A2: contagem e sequência históricas completas continuam ausentes.
- B1: 33 posições catalogadas; conteúdo histórico integral ainda não normalizado.
- B2/C1: 40 partes planejadas em cada nível, não 80 aulas redigidas.
- Não há login, banco, sincronização, IA, áudio real ou deploy.
