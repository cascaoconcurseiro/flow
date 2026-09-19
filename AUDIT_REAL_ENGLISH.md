# Auditoria de integridade — REAL ENGLISH A1–C1

**Data:** 2026-09-19  
**Escopo auditado:** repositório `cascaoconcurseiro/flow`, branch `main` e branch `feat/real-english-curriculum-spec`; PR #1.  
**Veredito:** **NÃO CONFORME — migração integral NÃO realizada.** O PR contém especificação, catálogo parcial e um visualizador estático. Não contém aulas completas nem um app de estudo funcional.

## 1. Fontes e método

- Consultada a listagem recursiva completa de arquivos Git das branches `main` e de trabalho; `truncated=false` em ambas.
- Lidos os conteúdos de `curriculum/real_english_curriculum.json`, `curriculum/real_english_system_prompt.md` e `index.html` na branch de trabalho.
- JSON analisado como estrutura de dados; contados registros por nível, módulos e aulas, títulos recuperados, campos de conteúdo presentes e estados de proveniência; verificada unicidade dos IDs.
- **Fora do escopo verificável no momento:** exportação integral das conversas A1–B1, anexos e mídias, versões antigas, estado de interação temporário do ChatGPT, código do aplicativo alegadamente pronto fora deste repositório. Não se pode confirmar preservação integral sem esses materiais. Nenhum teste E2E de interface ou teste de áudio/fala foi executado.

## 2. Inventário real do repositório

`main`: apenas `README.md` (`# flow`).  
Branch de trabalho: `README.md`, `index.html`, `curriculum/real_english_curriculum.json` e `curriculum/real_english_system_prompt.md`. A árvore contém também o diretório `curriculum/`, não um quinto arquivo. Nenhum componente React, backend, banco, autenticação, dataset de lições completas, mídia de áudio, teste ou serviço de correção foi localizado.

## 3. Cobertura por nível

| Nível | Posições no catálogo | Títulos identificáveis | Aulas com payload integral (textos, questões etc.) | Situação |
|---|---:|---:|---:|---|
| A1 | 0 | 0 | 0 | Número, títulos e aulas dependem da exportação original. |
| A2 | 0 | 0 | 0 | Número, títulos e aulas dependem da exportação original. |
| B1 | 33 | 6 (28–33) | 0 | Partes 1–27 sem títulos, todas as 33 sem payload da aula. |
| B2 | 40, em 8 módulos | 40 planejados | 0 | Planejamento definido, conteúdo das aulas ainda não redigido/importado. |
| C1 | 40, em 8 módulos | 40 planejados | 0 | Planejamento definido, conteúdo das aulas ainda não redigido/importado. |

B1: as partes 30–33 foram redigidas no chat atual, porém **não foram extraídas para o repositório**; 28–29 estão identificadas pelo histórico resumido, não pelo texto integral. A1/A2 não devem ser preenchidos com tópicos genéricos de gramática substituindo os originais.

## 4. Auditoria das funções pedagógicas

| Recurso | Situação no GitHub |
|---|---|
| Textos completos originais de cada aula | Ausentes |
| Traduções integrais reveláveis por ação | Especificadas no prompt; payload e UI ausentes |
| Questões, alternativas, gabaritos, explicação individual | Especificados no prompt; dados e UI ausentes |
| Diagnósticos, transformações e respostas-modelo | Dados e UI ausentes |
| Exploradores interativos / controles dependentes de estado | Dados e UI ausentes |
| Simuladores de diálogo e possíveis ramificações | Dados, máquina de estados e UI ausentes |
| Flashcards com frente/verso e Errei/Difícil/Fácil | Dados, UI e persistência ausentes |
| Tarefas de escrita e correção individual | Dados, armazenamento e integração de correção ausentes |
| Progresso e revisão adaptativa | Ausentes |
| Áudios, testes auditivos e interação oral | Ausentes |
| Navegação no catálogo por nível/módulo | Implementada somente no visualizador estático; não é navegador de aulas completas |
| Versionamento, proveniência e importação auditada por aula | Regras descritas, importador e evidências de verificação ausentes |

**Aviso:** a presença de palavras como `multiple_choice` no prompt e `activity_types` no JSON é **requisito/documentação**, não implementação. A navegação HTML tem botões de níveis e abertura de módulos, não botões de exercício.

## 5. Verificações que passaram e seu limite

- `real_english_curriculum.json` é JSON válido e tem IDs de registros únicos.
- B2 e C1 possuem 8 módulos de 5 partes no planejamento cada; B1 possui 33 posições.
- O visualizador e o prompt estão presentes na branch.
- **Nenhuma dessas verificações mede fidelidade do conteúdo histórico, funcionamento das aulas ou completude do aplicativo.**

## 6. Critério rigoroso para futura declaração de 'sem faltar nada'

1. Obter e preservar em local **privado** exportação original do ChatGPT e arquivos/mídias do curso; registrar SHA-256 dos originais e manifesto de arquivos.
2. Localizar todos os chats e mensagens de curso, planos, versões alternativas, correções do aluno quando autorizadas e anexos; registrar lacunas e contagens por fonte sem inventar dados.
3. Para cada aula, extrair todas as seções preservando ordem, enunciados, alternativas, gabaritos, justificativas, traduções, chunks, notas de pronúncia, cards, estados/turnos de diálogo, tarefas de produção, rubricas e checklists. Guardar identificadores de origem e versão.
4. Distinguir conteúdo recuperado do ChatGPT, conteúdo novo gerado, plano ainda não redigido e funcionalidade de interface implementada. Não confundir estado temporário de widgets com dados exportáveis; registrar o que não foi recuperável.
5. Implementar/importar em ambiente de teste o menor piloto que exercite todos os tipos de atividade encontrados; testar clique, revelação, correção, persistência, reinício e acessibilidade; registrar resultados e inconsistências.
6. Comparar contagens e amostras de texto originais/importados; verificar TODOS os itens sinalizados e executar testes por tipo de atividade. Marcar uma aula `imported_verified` só depois de conferir seu conteúdo e comportamento. Relatório final deve apresentar por aula: `present`, `missing`, `ambiguous`, `not_exported`, `implemented`, `tested`.
7. Somente com inventário sem lacunas não resolvidas e testes relevantes aprovados é permitido afirmar 'migração integral'. Sem arquivos de origem completos ou estado dos widgets, essa alegação fica vedada.

## 7. Privacidade e próximos passos

O repositório é **público**. NÃO enviar ZIP integral de exportação do ChatGPT, dados pessoais, respostas privadas de alunos, senhas ou anexos não autorizados. A primeira providência é recuperar as fontes e identificar o repositório/código real do aplicativo existente; em seguida, criar manifesto completo privado e uma aula-piloto, preservando esta branch apenas para planejamento público.

**Estado do PR #1:** rascunho; não fazer merge nem publicar como app concluído.


## 8. Segunda passagem — protótipo técnico implementado na branch

Após a auditoria inicial, foi criado **código novo de demonstração**, separado do acervo histórico:

| Item implementado | Escopo comprovável no código |
|---|---|
| `index.html`, `src/app.js`, `src/styles.css` | UI responsiva com navegação A1–C1 e abertura de **um piloto técnico** no B1. |
| `data/demo-lesson.json` | Um texto fictício e tradução revelável após correção, 4 questões com gabaritos/feedback, 2 transformações com respostas reveláveis, um explorador de estratégias, 4 chunks/cards, 3 turnos de diálogo, 2 tarefas de escrita e notas de pronúncia (sem áudio). **Não é a aula original completa B1 Parte 32.** |
| `localStorage` | Guarda respostas, revisão de cards, histórico de demonstração e rascunhos neste navegador. Não é login, sincronização, backup nem armazenamento seguro multiusuário. |
| Exportação de respostas do piloto | Salva um JSON local com respostas escritas; não oferece avaliação por IA. |
| `scripts/import-chatgpt-export.mjs` | Arquiva **objetos integrais das conversas selecionadas por ID** em pasta privada, com hash e manifesto; exige o `conversations.json` original para executar. Não é ainda o extrator estruturado de aulas e não recupera estados efêmeros dos widgets. |
| `AGENTS.md` | Instruções de continuidade dirigidas ao Codex, com preservação do conteúdo histórico e limites de publicação. |
| `scripts/validate-data.mjs`, `tests/importer.test.mjs`, GitHub Actions | Validação de catálogos, consistência do piloto e segurança básica de seleção na importação. Resultados de execução devem ser registrados separadamente. |

**Atualização do veredito:** existe agora um **protótipo técnico executável no código**, mas o requisito de migração integral continua **NÃO CONFORME**. A auditoria histórica das aulas A1–B1 não pode ser completada sem a exportação original; o planejamento B2/C1 ainda não foi convertido em aulas completas. As ausências de banco, autenticação, geração/correção por IA e áudio/fala permanecem intencionais nesta etapa. Nenhum deploy ou merge foi realizado.

**Critério de honestidade:** campos e opções do piloto são uma demonstração construída no projeto; não podem entrar na contagem de 'aulas originais preservadas'. Comprovar que botões funcionam no piloto é diferente de comprovar que todos os botões das aulas históricas foram recuperados.

## 9. Inspeção privada do histórico dentro do aplicativo

Foi adicionada a funcionalidade **Abrir acervo local** (`src/archive-browser.mjs` e `src/archive-core.mjs`). Ela permite selecionar manualmente `conversations.json` no dispositivo, listar títulos candidatos, inspecionar **todas as ramificações que constarem do `mapping`**, distinguir caminho ativo, mostrar integralmente as mensagens textuais e o nó bruto em JSON, inventariar ocorrências dos nomes de componentes e baixar uma conversa selecionada sem resumir. O arquivo carregado fica em memória durante a sessão, sem envio por rede nem armazenamento no `localStorage` pelo leitor; a cópia bruta só é salva localmente mediante ação de download. A lista por título é indicativa e precisa de verificação manual.

**Limites:** ainda não existe importação normalizada das mensagens para as telas de estudo, nem emulação do código original dos widgets DIL. Contar tags de interface não recupera automaticamente estados de seleção, gabaritos embutidos em scripts ou recursos multimodais não presentes na exportação. Os testes automatizados de inspeção e preservação de ramificações usam dados fictícios e não comprovam recuperação real do A1–B1. Sem `conversations.json` fornecido ou disponível no ambiente, zero aulas históricas continuam efetivamente importadas.

**Fonte adicional encontrada:** a Biblioteca contém o documento `Gramatica_Completa_Ingles_A0_B2.docx`, que não segue a mesma numeração das aulas interativas do REAL ENGLISH; é uma fonte suplementar, não uma cópia comprovada dos originais. Não a misturar ou publicar silenciosamente como se fossem os volumes interativos originais.
