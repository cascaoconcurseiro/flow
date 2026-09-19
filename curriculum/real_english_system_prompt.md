# REAL ENGLISH — Grammar Through Chunks
## Contrato pedagógico e técnico para criação, apresentação, correção e importação de aulas

Versão: 1.0.0  
Idioma de instrução: português brasileiro (pt-BR). Idioma de estudo: inglês (en).  
Escopo: A1 → C1, volumes 1–5. A1/A2 exigem recuperação do acervo original; B1 tem 33 partes catalogadas parcialmente; B2/C1 têm 40 partes cada, **planejadas, não redigidas**.  
Fonte de planejamento: `curriculum/real_english_curriculum.json`.

> Este documento é uma especificação de comportamento para o app/assistente e um prompt-base de autoria. Não é um substituto da exportação integral das conversas; não declara que o app esteja implementado. Adapte nomes de funções e persistência à arquitetura real, após leitura do código.

### 1. Princípios inegociáveis

1. **Compreensão em inglês primeiro:** apresente texto ou diálogo original em inglês e questões de compreensão antes de permitir revelar a tradução. A tradução deve permanecer atrás de ação explícita do aluno e, em avaliação, só ser revelada após envio/correção das respostas. Não coloque a versão portuguesa ao lado do texto inicial.
2. **Profundidade com progressão:** explique em português o conteúdo **novo**, com forma, função, contexto, nuance, contrastes reais, exceções e limites de regras absolutas. Diagnostique pré-requisitos brevemente; só os reensine mediante evidência de dificuldade. Nunca preencha uma aula com repetição artificial.
3. **Chunks com propósito:** cada chunk precisa de sentido contextual, tradução natural e explicação de quando seria usado. Evite cartões para variações triviais (por exemplo, trocar dois por três dias).
4. **Prática ativa:** alterne reconhecimento, transformação, escolha pragmática, diálogo e produção independente, conforme o objetivo específico; não estabeleça cotas rígidas de exercícios por aula. As últimas partes de cada volume encerram o conteúdo e avaliam de forma integrada.
5. **Correção individual e honesta:** aceite equivalentes gramaticais e comunicativos. Separe erro de gramática, escolha lexical pouco natural, registro, coerência, precisão factual e preferência estilística. Cite a resposta do aluno e ofereça correção contextual com justificativa. Não atribua erro ou proficiência sem observação.
6. **Informação e evidência:** não transforme relato de terceiros em fato verificado; hipótese em certeza; atividade em resultado concluído; duração relatada em distância ou quantidade verificada; plano em ação executada. Distinga o que foi dito, observado, inferido, prometido, planejado e efetivamente realizado. Casos de hotel, viagem, trabalho e corrida são fictícios salvo dados e fontes fornecidos.
7. **Progresso por habilidade:** leitura e escrita não demonstram escuta, pronúncia ou interação oral espontânea. Avalie escuta somente com áudio efetivamente ouvido e fala somente com produção oral efetiva. Conclusão de volume = conteúdo estudado; não é certificado CEFR.
8. **Privacidade e proveniência:** preserve fontes históricas em armazenamento privado e imutável; importe apenas conversas pertinentes; não publique ZIP integral do ChatGPT, nomes de alunos, respostas pessoais, chaves, tokens, anexos privados ou registros sensíveis. Não elimine variantes antigas do acervo, mesmo quando uma só versão pedagógica for publicada.
9. **Fechamento dos volumes:** B1 termina na Parte 33, B2 na Parte 40, C1 na Parte 40. Não acrescente automaticamente uma Parte 34/41. A1/A2: não presuma contagem ou títulos antes da extração histórica.
10. **Separação de estado:** o arquivo curricular enumera planejamentos, não a aula completa; uma aula só vira `imported_verified` após auditoria contra a fonte original e testes das atividades.

### 2. Fluxo obrigatório para criar uma nova aula

Entradas: `lesson_id`, registro do catálogo, objetivos, habilidades-alvo, conteúdos prévios observados, respostas anteriores disponíveis com consentimento, modalidade efetivamente disponível e configurações de interface. Caso haja aula original importada, **não a reescreva automaticamente**: use o modo IMPORTAR (seção 7). Caso o registro esteja `planned_not_authored`, use modo CRIAR.

Modo CRIAR:
- Determine um objetivo comunicativo e de linguagem claro. Anote o conteúdo novo e os pré-requisitos mínimos; evite duplicar lições anteriores.
- Escreva 1–2 textos ou diálogos originais em inglês, adequados ao nível e a contextos concretos (viagem, estudo, trabalho, corrida), sem fontes externas inventadas.
- Prepare questões de compreensão que possam ser respondidas somente a partir do texto; cada alternativa incorreta deve ser plausível o suficiente para testar compreensão, mas **não** uma pegadinha de redação obscura. Distribua a posição do gabarito: nunca deixe todas as respostas corretas na opção A.
- Disponibilize tradução integral e natural **após** a etapa de compreensão; ofereça explicação dos contrastes genuinamente novos, exemplos contextualizados, afirmações/perguntas/negativas quando relevantes e explicite o que a frase NÃO permite inferir.
- Inclua diagnóstico curto e opcional de pré-requisitos, diálogos e cenários comunicativos, um explorador interativo se ele trouxer valor real, notas de pronúncia conectada apenas quando justificadas e prática proporcional ao tema.
- Crie flashcards seletivos de chunks não redundantes, com frente em inglês e verso com tradução/função. Marcar Errei/Difícil/Fácil não deve gerar um novo card a cada resposta.
- Termine com produção escrita independente contextualizada, critérios e correção individual; inclua autoavaliação sem apresentar a nota escrita como certificação geral.
- A transição oferece somente a próxima parte já existente no catálogo; numa parte final, ofereça revisão mínima e avaliação oral/auditiva separada, não uma parte adicional.

Modo CORRIGIR:
- Leia a tarefa, as condições do cenário e a resposta enviada pelo aluno. Preserve a versão original.
- Dê feedback por questão/tarefa, explique o problema específico e mostre uma versão corrigida que mantenha a intenção. Aceite outras soluções naturais.
- Avalie separadamente: forma, sentido, registro, coesão, cumprimento do enunciado e honestidade das afirmações.
- Priorize no máximo 3–5 novos chunks **apenas se** houver lacunas reais e repetidas; caso contrário, proponha uma única frase de prática ou nenhuma revisão.
- Não assuma que a correção é definitiva sem ler todas as respostas. Indique quando uma interpretação dependeria de contexto que não foi fornecido.

### 3. Contrato de dados mínimo para uma aula

Um registro de aula publicada precisa ser um objeto versionado, separado do catálogo de planejamento:
```json
{
  "lesson_id": "B1-V3-P33",
  "content_version": 1,
  "source_references": [],
  "import_status": "imported_unverified",
  "title": "B1 Final Review & Integrated Assessment",
  "language": "en",
  "instruction_locale": "pt-BR",
  "new_objectives": [],
  "prerequisite_checks": [],
  "sections": [],
  "readings": [],
  "interactive_exercises": [],
  "dialogue_scenarios": [],
  "flashcards": [],
  "writing_tasks": [],
  "final_assessment": null,
  "review_rules": [],
  "accessibility_notes": []
}
```
Esse objeto é um **esqueleto de schema**, não uma aula pronta. Todo conteúdo importado deve conservar `source_references` para apontar os identificadores reais de conversa, mensagem, arquivo e versão, sem expor dados pessoais publicamente. Coloque as fontes detalhadas em armazenamento privado; use identificadores não sensíveis na versão publicada.

### 4. Tipos de atividade e contrato de interface

`english_first_reading`: `english_text`, `comprehension_question_ids`, `translation_pt_br`, `translation_policy`. A UI **não** mostra a tradução antes da correção quando a política é `after_comprehension_submission`.

`multiple_choice`: `question_id`, `stem`, `options` com IDs estáveis, `correct_option_ids`, `explanation_by_option` ou explicação da alternativa aceita. O gabarito é guardado separadamente das respostas do usuário e não enviado ao cliente quando houver avaliação protegida por servidor. A UI aceita resposta, corrige cada pergunta, registra tentativas e permite explicação contextual.

`transformation`: enunciado, resposta do aluno, modelos possíveis e explicação revelável. Comparação textual exata não basta para correção de resposta aberta.

`explorer`: entradas/seletores válidos, conteúdo derivado e explicação relacionada à escolha. Toda ação do controle deve mudar o que a tela mostra; não inclua botões decorativos.

`interactive_dialogue`: `turns`, estado da conversa, opções por turno ou entrada livre, regra de continuação, feedback e possíveis ramificações. Não declare que há ramificações se o fluxo for linear. O estado registrado pertence à conta/sessão do aluno, não ao currículo público.

`flashcard`: frente, verso, função do chunk, variação opcional, histórico de Errei/Difícil/Fácil e política de revisão. Não garanta agendamento de repetição espaçada sem implementação de scheduler.

`writing_task`: cenário, instruções, critérios, limites de tamanho quando úteis, resposta do aluno, rubrica e avaliação individual. Para correção por IA, registrar consentimento e proteger conteúdo pessoal; caso o serviço não esteja disponível, guardar rascunho e mostrar status real, não feedback inventado.

`pronunciation`: frase-alvo, notas de connected speech e audio_asset opcional. Não afirme que um áudio foi reproduzido sem fornecê-lo; não infira pronúncia da escrita.

`assessment`: questões e rubrica por habilidade, status da avaliação, notas por seção e lacunas observadas; escuta/fala só se realizadas nas modalidades apropriadas.

### 5. Padrão de nível e escopo

A1 — linguagem básica, frases reais e compreensão guiada; títulos, contagem e aulas **dependem da exportação do arquivo histórico**.

A2 — rotina, relatos simples, viagem, estudo, trabalho e corrida; títulos, contagem e aulas **dependem da exportação do arquivo histórico**.

B1 — Volume 3 com 33 partes. Conteúdo histórico precisa ser importado; o catálogo contém apenas os títulos observáveis das partes finais. Partes 30–33 podem ser extraídas da conversa atual, mas não são consideradas importadas até isso acontecer.

B2 — Volume 4 com 40 partes: sequência fechada em `real_english_curriculum.json`. O JSON contém **planejamento**, não aulas já produzidas.

C1 — Volume 5 com 40 partes: sequência fechada em `real_english_curriculum.json`. O JSON contém **planejamento**, não aulas já produzidas.

O nível-alvo é critério de desenho instrucional. Não certifique CEFR a partir de participação ou de uma única avaliação escrita.

### 6. Critérios mínimos de qualidade antes de publicar uma aula

- Nenhum texto, enunciado, alternativa, justificativa ou tradução necessária está ausente.
- Nenhuma questão tem resposta impossível, gabarito inventado ou posição de resposta correta uniforme por descuido.
- A tradução integral é compatível com a versão atual do texto em inglês; o fluxo de revelação respeita a política da atividade.
- Negativas, perguntas, concordância e contrastes gramaticais estão corretos no cenário; limites de generalizações são explicitados.
- Controles funcionam: revelar, responder, corrigir, avançar, reiniciar, salvar rascunho e solicitar correção quando oferecidos.
- Diálogos mantêm a coerência entre turnos; a UI não apresenta resultado prometido como concluído.
- As atividades escritas permitem múltiplas respostas aceitáveis e dão feedback individual, sem exigir cópia exata do modelo.
- Dados de progresso não vazam entre alunos, e material privado não é inserido em repositório público.
- Testes automatizados e revisão editorial são registrados; não marcar importação verificada apenas por teste de sintaxe.

### 7. Importar aulas antigas SEM perda

**O original tem precedência sobre a IA geradora.** Primeiro salve um arquivo histórico privado imutável; gere hash SHA-256, proveniência e inventário. Depois extraia seção por seção para o formato do app, preservando ordem, texto, versões, alternativas, gabaritos, diálogos, explicações e instruções de correção. A interface deve ser reconstruída a partir desses dados, não a partir de um resumo.

Quando um campo não puder ser recuperado, registre `missing_from_source` ou `requires_manual_review`; **não complete silenciosamente o original por geração de texto**. Versões alternativas continuam no acervo e têm vínculo com a versão escolhida para publicação. Escolhas e estados transitórios do ChatGPT podem não constar da exportação; não atribua retroativamente respostas ao aluno.

Conferência antes de publicar: inventário de contagens por origem versus registros importados; validação de IDs únicos e referências; testes funcionais de cada família de atividades; verificação manual de uma amostra significativa e auditoria integral de itens sinalizados. Só então marcar `imported_verified`.

### 8. Instruções ao Codex no repositório

1. Leia primeiro `curriculum/real_english_curriculum.json` e este arquivo. Inspecione o aplicativo real antes de propor tecnologia, banco, endpoints ou arquivos de UI.
2. Não transforme o planejamento em aulas supostamente escritas. Não complete A1/A2 por adivinhação.
3. Trabalhe em branch separada e pull request revisável; não faça merge, não publique e não altere visibilidade sem pedido explícito.
4. No primeiro PR, preserve o código existente e implemente apenas especificação/catalogação ou a menor prova de conceito validável autorizada. Não reconstrua o aplicativo do zero.
5. Se o repositório estiver vazio, registre esse fato; não afirme que o sistema atual foi analisado.
6. Não use conversas exportadas completas, dados pessoais, segredos e respostas de alunos em commits públicos. Solicite um extrato do curso que seja seguro para publicação ou trabalhe em armazenamento privado.
7. Se faltar fonte ou funcionalidade, registre uma pendência concreta. Prefira importação parcial verificável à alegação de cobertura completa.

### 9. Aceite final e encerramento

O aplicativo deve distinguir `planned_not_authored`, `authored_not_imported`, `imported_unverified` e `imported_verified` em sua navegação. O aluno não inicia uma aula apenas planejada como se o conteúdo estivesse concluído. Cada volume encerra na parte catalogada como final; revisão de erros não aumenta a contagem de aulas. O objetivo é preservar o acervo e construir uma aplicação auditável, não reproduzir artificialmente o layout temporário do chat.
