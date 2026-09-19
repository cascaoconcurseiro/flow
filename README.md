# REAL ENGLISH — Grammar Through Chunks

Este repositório continha apenas o README inicial quando esta estrutura foi criada. O código do aplicativo mencionado pelo autor **ainda não estava aqui**; portanto, esta branch entrega o catálogo, as regras pedagógicas e um visualizador estático, não a migração do app existente.

## Arquivos
- [Página de navegação do currículo](index.html): visualizador A1–C1 de metadados e planejamento, sem login, banco ou reprodução de aulas.
- [Catálogo JSON](curriculum/real_english_curriculum.json): esquema A1–C1 com estados de proveniência. A1/A2 sem títulos ou contagens inventados, B1 com 33 posições e títulos das partes finais identificáveis, B2/C1 com 40 partes planejadas cada.
- [Contrato de criação, interação, correção e importação](curriculum/real_english_system_prompt.md): prompt de trabalho para Codex ou implementação posterior.

## Abrir a página
A página carrega o JSON via fetch; um servidor local pode ser iniciado, por exemplo, com `python -m http.server 8000`, acessando `http://localhost:8000/`. Também pode ser servida por hospedagem estática após autorização. Abrir `index.html` diretamente como arquivo local pode bloquear a leitura do JSON por restrições de origem.

## Integridade e privacidade
O catálogo **não** contém as aulas completas e não deve ser interpretado como prova de que A1–B1 foram recuperados ou de que B2/C1 foram redigidos. O conteúdo original deve ser extraído seletivamente de um arquivo de exportação privado, inventariado e verificado antes de entrar no aplicativo.

O repositório é público. Nunca adicione o ZIP integral do ChatGPT, respostas pessoais, arquivos privados, chaves, tokens ou dados de alunos. O aplicativo e seu repositório real devem ser analisados antes de qualquer alteração de arquitetura.

## Próximas etapas
1. Identificar onde está o código do aplicativo existente e protegê-lo com cópia/branch.
2. Recuperar de modo privado apenas o acervo do curso desde A1, mantendo as fontes originais.
3. Importar uma aula interativa completa como piloto, com validação da fidelidade de texto, alternativas, gabaritos, revelação de traduções, diálogo, cartões e produção escrita.
4. Migrar por lotes após revisão. Não ativar publicação automaticamente.
