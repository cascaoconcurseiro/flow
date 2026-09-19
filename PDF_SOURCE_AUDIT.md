# Auditoria específica do PDF fornecido

**Fonte:** `Curso de Gramática por Chunks.pdf` (arquivo anexado pelo usuário nesta conversa).  
**SHA-256 do original:** `d41d3b77fa500f3a55c1df6c85597196b670b1f451040e5aaa46b96dd15300fd`  
**Páginas no arquivo:** 526  
**Método:** extração de texto vetorial por página, conferência da presença de imagens e análise visual de páginas intermediárias; NÃO foi utilizada OCR indiscriminada.

## Cobertura comprovada

| Páginas | Conteúdo efetivamente encontrado | Uso na aplicação |
| --- | --- | --- |
| 1–2 | Proposta do método por chunks e exemplos de Present Perfect | Referência para método; não são aulas completas. |
| 3–5 | Planejamento INICIAL A0–B2, objetivos e chunks por nível; início do mapa TO BE | `data/pdf-initial-curriculum.json`, identificado como plano original. |
| 6–10 | **A0 · Unidade 01 · Aula 01 — I am / You are / He is**, explicitamente denominada no documento de **exemplo de uma aula**. Três chunks iniciais, explicações, expansão por contexto/sujeito e indicação de assuntos futuros. | `data/pdf-a0-aula-01.json` conserva a transcrição das cinco páginas por seção, a proveniência e exemplos. A aplicação mostra o material com exercícios novos, destacados como NÃO presentes no PDF. |
| 11–14 | Oito etapas do método, revisão seletiva de cards, índice inicial e exemplos com SHOULD | `data/pdf-initial-curriculum.json` e contrato pedagógico. |
| **15–519** | **505 páginas** com cabeçalho, rodapé e numeração do PDF; nenhuma contém texto adicional de aula, e as páginas inspecionadas não possuem conteúdo rasterizado. | Nenhuma aula é inventada para preencher essas páginas. |
| 520–526 | Mensagens finais da conversa discutindo GitHub, auditoria, protótipo e envio do ZIP de exportação; não são aulas A1–B1 nem o plano completo do C1. | Referência histórica, não importada como conteúdo de aluno. |

**Conclusão de integridade:** embora o arquivo tenha **526 páginas**, não contém 526 páginas de lições: são **14 páginas iniciais de proposta e exemplo + 505 páginas praticamente vazias + 7 páginas finais sobre a construção do aplicativo**. Não há evidência no PDF da sequência inteira A1–B1, das 33 aulas completas do B1, do conteúdo das 40 aulas B2 e C1, nem dos estados internos dos botões originais do ChatGPT.

### Regra de identificação da aula 01

A primeira aula disponível no PDF é o **exemplo A0 · Unidade 01 · Aula 01**, nas páginas 6–10. Não é identificado como **A1 · Parte 1** e não demonstra a existência das demais aulas. Não renomear para A1/V1/P01 ou declarar que a exportação histórica foi concluída.

### O que foi reproduzido e o que foi criado para a web

- **Da fonte:** três chunks centrais com traduções, explicações do TO BE, variações e pronúncia aproximada, opções do explorador de afirmação/pergunta/negação, exemplos com outros sujeitos e referência às aulas futuras. Transcrição das páginas 6–10 armazenada no campo `sourceSections` do JSON e renderizada separadamente.
- **NOVO para o site:** quatro perguntas objetivas e seus gabaritos/feedbacks, duas transformações reveláveis, cinco opções no explorador interativo, dois turnos de diálogo, tarefa de escrita e controles de flashcards. O PDF apresenta o método e exemplos, mas **não traz um gabarito interativo completo desses itens**. Não atribuir ao documento o que foi criado para esta edição.
- **Planejamento:** do PDF original A0–B2 em `data/pdf-initial-curriculum.json`; o catálogo `curriculum/real_english_curriculum.json` contém o planejamento B2/C1 posterior e separado. Não mesclar as versões como se fossem a mesma lista de aulas concluídas.

### Limite de publicação e fonte bruta

O **PDF binário original não foi comitado** nesta branch. O conector de escrita usado na sessão suporta arquivos textuais UTF-8; o repositório fornecido é público e a impressão da conversa inclui referências identificáveis. O arquivo original anexo deve ser guardado fora da branch pública até existir um método apropriado de transferência do binário e uma revisão da visibilidade/conteúdo. O hash acima permite identificar a cópia original para futura auditoria; o JSON da aula fornece os trechos necessários ao primeiro protótipo.

**Bloqueio restante para "site com TUDO desde A1":** fornecer a exportação integral das conversas de aulas e, separadamente, o código do aplicativo anterior se existir fora deste repositório. Não é legítimo reconstruir supostas aulas faltantes a partir da numeração impressa em páginas vazias.
