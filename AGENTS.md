# AGENTS.md — REAL ENGLISH

Leia este arquivo antes de trabalhar neste repositório. A especificação principal está em [curriculum/real_english_system_prompt.md](curriculum/real_english_system_prompt.md); o catálogo é [curriculum/real_english_curriculum.json](curriculum/real_english_curriculum.json).

## Objetivo
Transformar o histórico original A1–B1, os planejamentos B2/C1 e as funcionalidades pedagógicas criadas nas conversas do REAL ENGLISH — Grammar Through Chunks em um sistema de estudo auditável. **Não reconstruir o currículo original a partir de suposições nem substituir aulas originais por amostras geradas.**

## Estado real desta branch
Esta branch contém um protótipo estático funcional e **uma aula demonstrativa criada para testar componentes**, identificada por `DEMO-`. Não contém aulas históricas completas, banco de dados, login, serviço de IA ou hospedagem. O GitHub fornecido inicialmente tinha apenas README; o app anterior informado pelo usuário não foi localizado neste repositório.

## Antes de alterar o código
1. Ler o README, o catálogo, o prompt completo, `AUDIT_REAL_ENGLISH.md` e o contrato de atividades presente em `data/demo-lesson.json`.
2. Identificar a fonte exata do conteúdo: `historical_original`, `historical_variant`, `technical_demo_not_original` ou `planned_not_authored`. Não mover entre estados sem evidência.
3. Executar `npm test`. Se não puder executar, declarar isso; nunca afirmar teste realizado sem resultado.
4. Trabalhar na branch apropriada e entregar mudanças revisáveis. Não fazer merge, deploy nem ampliar visibilidade sem instrução explícita.

## Preservação
- ZIP de exportação e `conversations.json` ficam privados, fora do GitHub público. Arquivo original intacto com hash SHA-256. O importador só arquiva IDs selecionados.
- Extrair integralmente conversas e versões; preservar texto, ordem, tradução, alternativas e IDs, gabarito, feedback, código original dos controles, diálogos, cartões, tarefas de escrita, critérios e notas.
- Separar *fonte histórica imutável* de *conteúdo normalizado para o app*. Não apagar variantes antigas só porque a UI mostra outra versão.
- Estado de clique/seleção no ChatGPT pode não constar do arquivo exportado; registrar como indisponível, não criar dados fictícios do aluno.
- A obra suplementar “Gramática Completa de Inglês — A0–B2” é uma fonte diferente das aulas interativas e não deve ser mesclada automaticamente.
- Uma aula não vira `imported_verified` por ter título, planejamento ou demonstração: exige comparação item a item com original e testes dos comportamentos.

## Contrato de produto
- Inglês primeiro. Tradução revelável somente no ponto determinado pela política de cada atividade.
- Correção por pergunta e explicação individual. Em texto livre, preservar resposta e aceitar diferentes formulações; sem IA ou correção humana disponível, indicar que a correção está pendente.
- Flashcard com frente/verso, função do chunk, estados Errei/Difícil/Fácil e nenhuma proliferação automática de cards redundantes.
- Diálogo fiel a turnos, estados, feedback e ramificações somente se presentes no original.
- Dados de progresso separados por usuário quando houver autenticação; no piloto local atual, `localStorage` é apenas demonstração, NÃO solução multiusuário segura.
- Reading e writing não certificam listening, speaking ou CEFR.
- A1/A2: números e títulos ainda não foram recuperados do REAL ENGLISH original. B1: 33 partes; B2 e C1: 40 planejadas cada. Não criar automaticamente uma Parte 34/41.

## Critério de aceite de próxima etapa
Priorizar o importador/normalizador com proveniência, uma única aula original integralmente importada e testes funcionais de todos os seus controles; **somente depois** importar volumes em lote. Não confundir um protótipo útil com migração completa.
