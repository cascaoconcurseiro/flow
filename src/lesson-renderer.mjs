// src/lesson-renderer.mjs
// Renderizador interativo e formatado para as aulas históricas do REAL ENGLISH

export function extractLessonData(text) {
  const data = {};
  const marker = "{@body const ";
  let pos = 0;
  while ((pos = text.indexOf(marker, pos)) !== -1) {
    const varStart = pos + marker.length;
    const eqIdx = text.indexOf("=", varStart);
    if (eqIdx === -1) break;
    const varName = text.slice(varStart, eqIdx).trim();

    let depth = 1;
    let i = pos + 1;
    let inString = null;
    while (i < text.length && depth > 0) {
      const ch = text[i];
      if (inString) {
        if (ch === inString && text[i - 1] !== "\\") {
          inString = null;
        }
      } else {
        if (ch === '"' || ch === "'" || ch === "`") {
          inString = ch;
        } else if (ch === "{") {
          depth++;
        } else if (ch === "}") {
          depth--;
          if (depth === 0) break;
        }
      }
      i++;
    }

    const bodyContent = text.slice(eqIdx + 1, i).trim();
    const cleanExpr = bodyContent.replace(/;\s*$/, "");
    if (cleanExpr.startsWith("[") || cleanExpr.startsWith("{")) {
      try {
        data[varName] = new Function("return " + cleanExpr)();
      } catch (e) {
        // Ignora expressões dinâmicas que não sejam literais diretos
      }
    }
    pos = i + 1;
  }
  return data;
}

export function renderHistoricalLessonView(container, lesson, onBack) {
  container.replaceChildren();

  // Header panel with metadata and View Switcher
  const headerPanel = document.createElement("section");
  headerPanel.className = "panel lesson-header-panel";

  const topNav = document.createElement("div");
  topNav.className = "toolbar";
  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "btn secondary";
  backBtn.textContent = "← Voltar ao catálogo (" + lesson.level + ")";
  backBtn.addEventListener("click", onBack);
  topNav.append(backBtn);

  const titleRow = document.createElement("div");
  titleRow.className = "lesson-title-row";
  const titleH1 = document.createElement("h1");
  titleH1.className = "lesson-main-title";
  titleH1.textContent = `${lesson.level} · Parte ${String(lesson.part).padStart(2, "0")} — ${lesson.title}`;
  titleRow.append(titleH1);

  const pillsRow = document.createElement("div");
  pillsRow.className = "hero-pills";
  const p1 = document.createElement("span");
  p1.className = "pill good";
  p1.textContent = "HISTÓRICO ORIGINAL · TURNO " + lesson.turn_ordinal;
  const p2 = document.createElement("span");
  p2.className = "pill";
  p2.textContent = Math.round(lesson.character_count / 1000) + "k caracteres";
  const p3 = document.createElement("span");
  p3.className = "pill info";
  p3.textContent = "CONVERSA ORIGINAL PRESERVADA";
  pillsRow.append(p1, p2, p3);

  // View Mode Tabs
  const tabGroup = document.createElement("div");
  tabGroup.className = "lesson-tab-group";
  const tabFormatted = document.createElement("button");
  tabFormatted.type = "button";
  tabFormatted.className = "btn tab-btn active";
  tabFormatted.textContent = "📖 Aula Interativa Formatada";

  const tabRaw = document.createElement("button");
  tabRaw.type = "button";
  tabRaw.className = "btn tab-btn";
  tabRaw.textContent = "🔍 Texto Original (Auditoria)";

  tabGroup.append(tabFormatted, tabRaw);

  headerPanel.append(topNav, titleRow, pillsRow, tabGroup);
  container.append(headerPanel);

  // Content Containers
  const formattedContainer = document.createElement("div");
  formattedContainer.className = "lesson-formatted-content";

  const rawContainer = document.createElement("div");
  rawContainer.className = "lesson-raw-content hidden";

  tabFormatted.addEventListener("click", () => {
    tabFormatted.classList.add("active");
    tabRaw.classList.remove("active");
    formattedContainer.classList.remove("hidden");
    rawContainer.classList.add("hidden");
  });

  tabRaw.addEventListener("click", () => {
    tabRaw.classList.add("active");
    tabFormatted.classList.remove("active");
    rawContainer.classList.remove("hidden");
    formattedContainer.classList.add("hidden");
  });

  // 1. Build Raw Content Panel
  const rawPanel = document.createElement("section");
  rawPanel.className = "panel";
  const rawNotice = document.createElement("p");
  rawNotice.className = "notice";
  rawNotice.textContent = "Esta transcrição reflete literalmente a resposta do turno original no ChatGPT, com os marcadores de layout e código. Hash SHA-256: " + lesson.sha256;
  const rawPre = document.createElement("pre");
  rawPre.className = "archive-pre reading";
  rawPre.textContent = lesson.raw_markdown;
  rawPanel.append(rawNotice, rawPre);
  rawContainer.append(rawPanel);

  // 2. Build Formatted Interactive View
  const extractedData = extractLessonData(lesson.raw_markdown);
  renderFormattedView(formattedContainer, lesson.raw_markdown, extractedData);

  container.append(formattedContainer, rawContainer);
}

function renderFormattedView(container, rawMarkdown, data) {
  // Extract and clean content
  const cleanedHtml = cleanMarkdownToHtml(rawMarkdown);

  const mainPanel = document.createElement("section");
  mainPanel.className = "panel formatted-article";
  mainPanel.innerHTML = cleanedHtml;

  // Enhance interactive elements inside mainPanel
  enhanceCollapsibleTranslations(mainPanel);
  enhanceInteractiveDrills(mainPanel);

  container.append(mainPanel);

  // Append Interactive Structured Widgets
  // 1. Grammar Explorer
  if (data.subjects && data.descriptions) {
    container.append(createGrammarExplorerWidget(data.subjects, data.descriptions));
  } else if (data.beSubjects && data.beComplements) {
    container.append(createBeTransformExplorerWidget(data.beSubjects, data.beComplements));
  }

  // 2. Question / Response Explorer
  if (data.questionTypes) {
    container.append(createQuestionExplorerWidget(data.questionTypes));
  }
  if (data.greetings) {
    container.append(createGreetingsWidget(data.greetings));
  }
  if (data.responseDrills) {
    container.append(createSpeakingDrillsWidget(data.responseDrills));
  }

  // 3. Conversation Simulator
  if (data.conversationSteps) {
    container.append(createConversationSimulatorWidget(data.conversationSteps));
  }

  // 4. Grammar Map Accordion
  if (data.grammarMap) {
    container.append(createGrammarMapWidget(data.grammarMap));
  }

  // 5. Active Practice / Writing tasks
  const practiceTasks = data.activePractice || data.tasks || data.writingTasks || data.finalTasks;
  if (Array.isArray(practiceTasks) && practiceTasks.length > 0) {
    container.append(createActivePracticeWidget(practiceTasks));
  }

  // 6. Interactive Flashcards Deck
  const deck = data.deck || data.cards || data.flashcards;
  if (Array.isArray(deck) && deck.length > 0) {
    container.append(createFlashcardsWidget(deck));
  }

  // 7. Interactive Exam / Final Quiz
  const exam = data.exam || data.finalTest || data.practice || data.test || data.articleQuiz;
  if (Array.isArray(exam) && exam.length > 0) {
    container.append(createExamWidget(exam));
  }

  // 8. Personal Questions Challenge
  if (data.personalQuestions) {
    container.append(createPersonalQuestionsWidget(data.personalQuestions));
  }

  // 9. Completion Goals Checklist
  const goals = data.completionGoals || data.goals || data.part2Goals;
  if (Array.isArray(goals) && goals.length > 0) {
    container.append(createCompletionChecklistWidget(goals));
  }
}

function cleanMarkdownToHtml(raw) {
  let s = raw;

  // Strip script blocks and JSX loops/conditions that would pollute the output
  s = s.replace(/\{@body\s+[\s\S]*?(?:;\s*\}|\}\s*\n?)/g, "");
  s = s.replace(/\{#each\s+[\s\S]*?\{/g, "");
  s = s.replace(/\{\/each\}/g, "");
  s = s.replace(/\{#if\s+[^}]+\}/g, "");
  s = s.replace(/\{:else\}/g, "");
  s = s.replace(/\{\/if\}/g, "");
  s = s.replace(/\{[a-zA-Z0-9_.]+\}/g, "");

  // Transform <box ...>
  s = s.replace(/<box([^>]*)>/g, (m, attrs) => {
    const cls = ["canvas-box"];
    const styles = [];
    if (/background="#([0-9a-fA-F]+)"/.test(attrs)) {
      styles.push("background:#" + attrs.match(/background="#([0-9a-fA-F]+)"/)[1]);
    } else if (/background="surface-secondary"/.test(attrs)) {
      cls.push("surface-secondary");
    } else if (/background="surface-tertiary"/.test(attrs)) {
      cls.push("surface-tertiary");
    }
    if (/theme="dark"/.test(attrs)) cls.push("theme-dark");
    if (/\bborder\b/.test(attrs)) cls.push("border");
    if (/radius="([^"]+)"/.test(attrs)) cls.push("radius-" + attrs.match(/radius="([^"]+)"/)[1]);
    return `<div class="${cls.join(" ")}"${styles.length ? ` style="${styles.join(";")}"` : ""}>`;
  });
  s = s.replace(/<\/box>/g, "</div>");

  // Transform <badge color="...">
  s = s.replace(/<badge([^>]*)>([\s\S]*?)<\/badge>/g, (m, attrs, content) => {
    let col = "default";
    const cMatch = attrs.match(/color="([^"]+)"/);
    if (cMatch) col = cMatch[1];
    return `<span class="pill pill-${col}">${content.trim()}</span>`;
  });

  // Transform <title size="...">
  s = s.replace(/<title([^>]*)>([\s\S]*?)<\/title>/g, (m, attrs, content) => {
    let size = "xl";
    const sMatch = attrs.match(/size="([^"]+)"/);
    if (sMatch) size = sMatch[1];
    const styles = [];
    const colMatch = attrs.match(/color="([^"]+)"/);
    if (colMatch) styles.push("color:" + colMatch[1]);
    const alignMatch = attrs.match(/textAlign="([^"]+)"/);
    if (alignMatch) styles.push("text-align:" + alignMatch[1]);
    const tag = size === "2xl" ? "h2" : size === "xl" ? "h3" : "h4";
    return `<${tag} class="canvas-title title-${size}"${styles.length ? ` style="${styles.join(";")}"` : ""}>${content.trim()}</${tag}>`;
  });

  // Transform <text ...>
  s = s.replace(/<text([^>]*)>([\s\S]*?)<\/text>/g, (m, attrs, content) => {
    const styles = [];
    const colMatch = attrs.match(/color="([^"]+)"/);
    if (colMatch) styles.push("color:" + colMatch[1]);
    const alignMatch = attrs.match(/textAlign="([^"]+)"/);
    if (alignMatch) styles.push("text-align:" + alignMatch[1]);
    const cls = ["canvas-text"];
    const wMatch = attrs.match(/weight="([^"]+)"/);
    if (wMatch) cls.push("weight-" + wMatch[1]);
    const szMatch = attrs.match(/size="([^"]+)"/);
    if (szMatch) cls.push("text-" + szMatch[1]);
    return `<p class="${cls.join(" ")}"${styles.length ? ` style="${styles.join(";")}"` : ""}>${content.trim()}</p>`;
  });

  // Transform <divider .../>
  s = s.replace(/<divider[^>]*\/>/g, '<hr class="divider"/>');

  // Transform <row ...>
  s = s.replace(/<row([^>]*)>/g, '<div class="canvas-row">');
  s = s.replace(/<\/row>/g, "</div>");

  // Transform <grid columns={3} ...>
  s = s.replace(/<grid([^>]*)>/g, (m, attrs) => {
    let cols = 2;
    const cMatch = attrs.match(/columns=\{?(\d+)\}?/);
    if (cMatch) cols = cMatch[1];
    return `<div class="canvas-grid cols-${cols}">`;
  });
  s = s.replace(/<\/grid>/g, "</div>");
  s = s.replace(/<grid-item([^>]*)>/g, '<div class="canvas-grid-item">').replace(/<\/grid-item>/g, "</div>");

  // Transform tables
  s = s.replace(/<table-row>/g, "<tr>").replace(/<\/table-row>/g, "</tr>");
  s = s.replace(/<table-cell([^>]*)>/g, "<td>").replace(/<\/table-cell>/g, "</td>");

  // Transform lists
  s = s.replace(/<list([^>]*)>/g, '<ul class="canvas-list">').replace(/<\/list>/g, "</ul>");
  s = s.replace(/<list-item>/g, "<li>").replace(/<\/list-item>/g, "</li>");

  // Transform icons
  s = s.replace(/<icon\s+name="([^"]+)"[^>]*\/>/g, '<span class="icon-tag">◆</span>');

  // Clean remaining buttons with code
  s = s.replace(/<button[^>]*onClick=[^>]*>([\s\S]*?)<\/button>/g, '<button type="button" class="btn secondary lesson-toggle-btn">$1</button>');

  // Markdown headers
  s = s.replace(/^### (.*$)/gim, '<h4 class="md-h3">$1</h4>');
  s = s.replace(/^## (.*$)/gim, '<h3 class="md-h2">$1</h3>');
  s = s.replace(/^# (.*$)/gim, '<h2 class="md-h1">$1</h2>');

  // Bold & Italics
  s = s.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Horizontal rules
  s = s.replace(/^---$/gim, '<hr class="divider"/>');

  // Clean empty paragraphs and broken braces
  s = s.replace(/<p class="[^"]*">\s*<\/p>/g, "");

  return s;
}

function enhanceCollapsibleTranslations(root) {
  // If there are buttons with text containing "tradução" or "português", make them toggle next sibling
  const btns = root.querySelectorAll(".lesson-toggle-btn");
  btns.forEach((btn) => {
    const text = btn.textContent.toLowerCase();
    if (text.includes("tradução") || text.includes("português") || text.includes("revelar")) {
      const nextBox = btn.nextElementSibling;
      if (nextBox && (nextBox.classList.contains("canvas-box") || nextBox.tagName === "P" || nextBox.tagName === "DIV")) {
        nextBox.classList.add("hidden");
        let shown = false;
        btn.addEventListener("click", () => {
          shown = !shown;
          if (shown) {
            nextBox.classList.remove("hidden");
            btn.textContent = btn.textContent.replace("Revelar", "Ocultar");
          } else {
            nextBox.classList.add("hidden");
            btn.textContent = btn.textContent.replace("Ocultar", "Revelar");
          }
        });
      }
    }
  });
}

function enhanceInteractiveDrills(root) {
  // Any remaining interactive hooks can be handled here
}

// ----------------------------------------------------
// Interactive Component Widgets
// ----------------------------------------------------

function createFlashcardsWidget(deck) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel flashcards-widget";

  const topRow = document.createElement("div");
  topRow.className = "widget-header";
  topRow.innerHTML = `
    <div class="toolbar">
      <span class="pill pill-success">FLASHCARDS REAIS · ANKI STYLE</span>
      <span class="pill">${deck.length} CARDS</span>
    </div>
    <h2>Revisão por Chunks (Flashcards)</h2>
    <p class="muted">Leia a frente em inglês e tente compreender o sentido antes de virar o card.</p>
  `;
  panel.append(topRow);

  let currentIndex = 0;
  let isBack = false;
  let showDetails = false;
  const grades = {};

  const cardCounter = document.createElement("div");
  cardCounter.className = "card-counter muted subtle";

  const progressBar = document.createElement("div");
  progressBar.className = "progress-track";
  const progressFill = document.createElement("div");
  progressFill.className = "progress-fill";
  progressBar.append(progressFill);

  const cardContainer = document.createElement("div");
  cardContainer.className = "flashcard-interactive";

  const actionsRow = document.createElement("div");
  actionsRow.className = "toolbar justify-center";

  const statsRow = document.createElement("div");
  statsRow.className = "notice flashcards-stats subtle";

  function renderCard() {
    const card = deck[currentIndex];
    const pct = Math.round(((currentIndex + 1) / deck.length) * 100);
    cardCounter.textContent = `Card ${currentIndex + 1} de ${deck.length} · ${card.tag || "CHUNK"}`;
    progressFill.style.width = pct + "%";

    cardContainer.replaceChildren();

    const tagBadge = document.createElement("div");
    tagBadge.className = "pill pill-info subtle";
    tagBadge.textContent = isBack ? "VERSO" : "FRENTE";
    cardContainer.append(tagBadge);

    const mainText = document.createElement("h3");
    mainText.className = "flashcard-text";
    mainText.textContent = card.en;
    cardContainer.append(mainText);

    if (!isBack) {
      const hint = document.createElement("p");
      hint.className = "muted subtle";
      hint.textContent = "Leia a frase em inglês. Tente recordar a tradução e a função do chunk.";
      cardContainer.append(hint);
    } else {
      const trans = document.createElement("div");
      trans.className = "flashcard-translation";
      trans.textContent = card.pt;
      cardContainer.append(trans);

      if (card.chunk) {
        const chunkBox = document.createElement("div");
        chunkBox.className = "tile subtle";
        chunkBox.innerHTML = `<strong>Chunk principal:</strong> ${card.chunk}`;
        cardContainer.append(chunkBox);
      }

      if (card.grammar || card.variation || card.natural) {
        const detailsBtn = document.createElement("button");
        detailsBtn.type = "button";
        detailsBtn.className = "btn small secondary";
        detailsBtn.textContent = showDetails ? "Ocultar explicação e variações" : "Ver explicação gramatical e variações";
        detailsBtn.addEventListener("click", () => {
          showDetails = !showDetails;
          renderCard();
        });
        cardContainer.append(detailsBtn);

        if (showDetails) {
          const detailBox = document.createElement("div");
          detailBox.className = "tile muted subtle";
          let html = "";
          if (card.grammar) html += `<p><strong>Gramática:</strong> ${card.grammar}</p>`;
          if (card.variation) html += `<p><strong>Outros exemplos:</strong> ${card.variation}</p>`;
          if (card.natural) html += `<p><strong>Inglês real:</strong> ${card.natural}</p>`;
          detailBox.innerHTML = html;
          cardContainer.append(detailBox);
        }
      }
    }

    actionsRow.replaceChildren();

    if (!isBack) {
      const revealBtn = document.createElement("button");
      revealBtn.type = "button";
      revealBtn.className = "btn primary";
      revealBtn.textContent = "Revelar resposta";
      revealBtn.addEventListener("click", () => {
        isBack = true;
        renderCard();
      });
      actionsRow.append(revealBtn);
    } else {
      for (const grade of ["Errei", "Difícil", "Fácil"]) {
        const gBtn = document.createElement("button");
        gBtn.type = "button";
        gBtn.className = `btn small ${grade === "Errei" ? "btn-danger" : grade === "Difícil" ? "btn-warning" : "btn-success"}`;
        gBtn.textContent = grade;
        gBtn.addEventListener("click", () => {
          grades[currentIndex] = grade;
          if (currentIndex < deck.length - 1) {
            currentIndex++;
            isBack = false;
            showDetails = false;
          }
          renderCard();
        });
        actionsRow.append(gBtn);
      }
    }

    // Nav buttons
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "btn secondary small";
    prevBtn.textContent = "← Anterior";
    prevBtn.disabled = currentIndex === 0;
    prevBtn.addEventListener("click", () => {
      currentIndex--;
      isBack = false;
      showDetails = false;
      renderCard();
    });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "btn secondary small";
    nextBtn.textContent = "Próximo →";
    nextBtn.disabled = currentIndex === deck.length - 1;
    nextBtn.addEventListener("click", () => {
      currentIndex++;
      isBack = false;
      showDetails = false;
      renderCard();
    });

    actionsRow.prepend(prevBtn);
    actionsRow.append(nextBtn);

    // Stats
    const evaluated = Object.keys(grades).length;
    const errei = Object.values(grades).filter((v) => v === "Errei").length;
    const dificil = Object.values(grades).filter((v) => v === "Difícil").length;
    const facil = Object.values(grades).filter((v) => v === "Fácil").length;
    statsRow.innerHTML = `<strong>Avaliados:</strong> ${evaluated}/${deck.length} · <span style="color:#d9534f">Errei: ${errei}</span> · <span style="color:#f0ad4e">Difícil: ${dificil}</span> · <span style="color:#5cb85c">Fácil: ${facil}</span>`;
  }

  renderCard();
  panel.append(cardCounter, progressBar, cardContainer, actionsRow, statsRow);
  return panel;
}

function createExamWidget(questions) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel exam-widget";

  panel.innerHTML = `
    <div class="toolbar">
      <span class="pill pill-info">AVALIAÇÃO INTERATIVA</span>
      <span class="pill">${questions.length} QUESTÕES</span>
    </div>
    <h2>Avaliação de Consolidação</h2>
    <p class="muted">Teste seus conhecimentos. Selecione uma resposta para cada pergunta e clique em "Corrigir avaliação".</p>
  `;

  const answers = {};
  let submitted = false;

  const questionsList = document.createElement("div");
  questionsList.className = "exam-questions-list";

  const submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.className = "btn primary";
  submitBtn.textContent = "Corrigir avaliação";

  const resultBox = document.createElement("div");
  resultBox.className = "exam-result-box hidden";

  function renderQuestions() {
    questionsList.replaceChildren();

    questions.forEach((q, idx) => {
      const qBox = document.createElement("div");
      qBox.className = "exercise exam-question-item";

      const title = document.createElement("h4");
      title.textContent = `${idx + 1}. ${q.q || q.stem || q.question}`;
      qBox.append(title);

      const optsContainer = document.createElement("div");
      optsContainer.className = "options";

      const options = q.options || [];
      options.forEach((opt, optIdx) => {
        const optLabel = document.createElement("label");
        optLabel.className = "option";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `exam-q-${idx}`;
        radio.value = optIdx;
        radio.checked = answers[idx] === optIdx;
        radio.disabled = submitted;

        radio.addEventListener("change", () => {
          answers[idx] = optIdx;
          submitBtn.disabled = Object.keys(answers).length !== questions.length;
        });

        const spanText = document.createElement("span");
        spanText.textContent = typeof opt === "string" ? opt : opt.text;

        optLabel.append(radio, spanText);
        optsContainer.append(optLabel);
      });

      qBox.append(optsContainer);

      if (submitted) {
        const correctIdx = q.correct !== undefined ? q.correct : q.correct_option_id;
        const isCorrect = answers[idx] === correctIdx || (typeof correctIdx === "string" && options[answers[idx]]?.id === correctIdx);

        const feedback = document.createElement("div");
        feedback.className = `feedback ${isCorrect ? "" : "wrong"}`;
        feedback.innerHTML = `
          <strong>${isCorrect ? "✓ Correto!" : "✗ Incorreto."}</strong>
          ${!isCorrect ? `<p><strong>Resposta esperada:</strong> ${typeof options[correctIdx] === "string" ? options[correctIdx] : options[correctIdx]?.text || correctIdx}</p>` : ""}
          <p class="muted">${q.why || q.explanation || ""}</p>
        `;
        qBox.append(feedback);
      }

      questionsList.append(qBox);
    });
  }

  submitBtn.disabled = true;
  submitBtn.addEventListener("click", () => {
    submitted = true;
    renderQuestions();

    let score = 0;
    questions.forEach((q, idx) => {
      const correctIdx = q.correct !== undefined ? q.correct : q.correct_option_id;
      const isCorrect = answers[idx] === correctIdx || (typeof correctIdx === "string" && (q.options || [])[answers[idx]]?.id === correctIdx);
      if (isCorrect) score++;
    });

    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `
      <div class="notice">
        <h3>Resultado: ${score}/${questions.length} acertos (${Math.round((score / questions.length) * 100)}%)</h3>
        <p>${score === questions.length ? "Excelente! Você acertou todas as questões!" : score >= Math.ceil(questions.length * 0.7) ? "Bom desempenho! Revise os pontos em que houve dúvida." : "Vale a pena revisar a aula e os flashcards antes de avançar."}</p>
      </div>
    `;
    submitBtn.classList.add("hidden");
  });

  renderQuestions();
  panel.append(questionsList, submitBtn, resultBox);
  return panel;
}

function createActivePracticeWidget(tasks) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel practice-widget";

  panel.innerHTML = `
    <div class="toolbar">
      <span class="pill pill-success">PRODUÇÃO ATIVA</span>
      <span class="pill">${tasks.length} TAREFAS</span>
    </div>
    <h2>Construa suas próprias frases</h2>
    <p class="muted">Traduza ou responda à situação antes de conferir a resposta-modelo.</p>
  `;

  let currentIdx = 0;
  let showHint = false;
  let showModel = false;
  const userAnswers = {};

  const cardBox = document.createElement("div");
  cardBox.className = "tile practice-card";

  function renderTask() {
    const task = tasks[currentIdx];
    cardBox.replaceChildren();

    const header = document.createElement("div");
    header.className = "toolbar justify-between";
    header.innerHTML = `
      <strong>Situação ${currentIdx + 1}/${tasks.length}</strong>
      <span class="pill">${task.title || "PRÁTICA"}</span>
    `;
    cardBox.append(header);

    const promptText = document.createElement("p");
    promptText.className = "reading";
    promptText.textContent = task.pt || task.prompt || task.situation;
    cardBox.append(promptText);

    const inputArea = document.createElement("textarea");
    inputArea.className = "input-area";
    inputArea.placeholder = "Escreva sua frase em inglês...";
    inputArea.value = userAnswers[currentIdx] || "";
    inputArea.rows = 3;
    inputArea.addEventListener("input", (e) => {
      userAnswers[currentIdx] = e.target.value;
    });
    cardBox.append(inputArea);

    const buttonRow = document.createElement("div");
    buttonRow.className = "toolbar";

    if (task.hint) {
      const hintBtn = document.createElement("button");
      hintBtn.type = "button";
      hintBtn.className = "btn secondary small";
      hintBtn.textContent = showHint ? "Ocultar dica" : "Ver dica";
      hintBtn.addEventListener("click", () => {
        showHint = !showHint;
        renderTask();
      });
      buttonRow.append(hintBtn);
    }

    const modelBtn = document.createElement("button");
    modelBtn.type = "button";
    modelBtn.className = "btn primary small";
    modelBtn.textContent = showModel ? "Ocultar modelo" : "Revelar resposta-modelo";
    modelBtn.addEventListener("click", () => {
      showModel = !showModel;
      renderTask();
    });
    buttonRow.append(modelBtn);
    cardBox.append(buttonRow);

    if (showHint && task.hint) {
      const hintBox = document.createElement("div");
      hintBox.className = "feedback wrong";
      hintBox.innerHTML = `<strong>Dica:</strong> ${task.hint}`;
      cardBox.append(hintBox);
    }

    if (showModel) {
      const modelBox = document.createElement("div");
      modelBox.className = "feedback";
      modelBox.innerHTML = `
        <strong>Resposta-modelo:</strong> ${task.model || task.model_answer || task.en}
        <p class="muted subtle">Compare sua versão com a resposta-modelo. Outras formulações naturais também são aceitas.</p>
      `;
      cardBox.append(modelBox);
    }

    // Navigation
    const navRow = document.createElement("div");
    navRow.className = "toolbar justify-between";
    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "btn secondary small";
    prev.textContent = "← Anterior";
    prev.disabled = currentIdx === 0;
    prev.addEventListener("click", () => {
      currentIdx--;
      showHint = false;
      showModel = false;
      renderTask();
    });

    const next = document.createElement("button");
    next.type = "button";
    next.className = "btn secondary small";
    next.textContent = "Próxima →";
    next.disabled = currentIdx === tasks.length - 1;
    next.addEventListener("click", () => {
      currentIdx++;
      showHint = false;
      showModel = false;
      renderTask();
    });

    navRow.append(prev, next);
    cardBox.append(navRow);
  }

  renderTask();
  panel.append(cardBox);
  return panel;
}

function createGrammarExplorerWidget(subjects, descriptions) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel explorer-widget";

  panel.innerHTML = `
    <div class="toolbar">
      <span class="pill pill-info">EXPLORADOR GRAMATICAL</span>
    </div>
    <h2>Monte sua frase (Sujeito + TO BE + Complemento)</h2>
    <p class="muted">Selecione o sujeito e a situação para observar a concordância do verbo.</p>
  `;

  let subjIdx = 0;
  let descIdx = 0;
  let isFull = false;

  const subjRow = document.createElement("div");
  subjRow.className = "toolbar";
  const descRow = document.createElement("div");
  descRow.className = "toolbar";

  const previewBox = document.createElement("div");
  previewBox.className = "flashcard";

  function renderExplorer() {
    subjRow.replaceChildren();
    subjects.forEach((s, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn small ${subjIdx === idx ? "primary" : "secondary"}`;
      btn.textContent = s.label || s.name;
      btn.addEventListener("click", () => {
        subjIdx = idx;
        renderExplorer();
      });
      subjRow.append(btn);
    });

    descRow.replaceChildren();
    descriptions.forEach((d, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn small ${descIdx === idx ? "primary" : "secondary"}`;
      btn.textContent = d.label || d.en;
      btn.addEventListener("click", () => {
        descIdx = idx;
        renderExplorer();
      });
      descRow.append(btn);
    });

    const s = subjects[subjIdx];
    const d = descriptions[descIdx];

    const enText = isFull ? `${s.label} ${s.be} ${d.en}.` : `${s.short} ${d.en}.`;
    const ptText = Array.isArray(d.pt) ? `${s.pt} ${d.pt[subjIdx]}.` : `${s.pt} ${d.pt}.`;

    previewBox.innerHTML = `
      <span class="pill pill-good">FRASE CONSTRUÍDA</span>
      <h3 style="font-size:1.6rem;margin:0.5rem 0;">${enText}</h3>
      <p class="muted">${ptText}</p>
      <p class="subtle muted">Forma completa: ${s.label} ${s.be} ${d.en}.</p>
    `;
  }

  const toggleFull = document.createElement("label");
  toggleFull.className = "option subtle";
  const chk = document.createElement("input");
  chk.type = "checkbox";
  chk.addEventListener("change", (e) => {
    isFull = e.target.checked;
    renderExplorer();
  });
  toggleFull.append(chk, document.createTextNode(" Mostrar forma completa sem contração"));

  panel.append(
    document.createTextNode("1. Escolha o sujeito:"),
    subjRow,
    document.createTextNode("2. Escolha a situação:"),
    descRow,
    toggleFull,
    previewBox
  );

  renderExplorer();
  return panel;
}

function createBeTransformExplorerWidget(beSubjects, beComplements) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel explorer-widget";
  panel.innerHTML = `
    <div class="toolbar"><span class="pill pill-info">TRANSFORMAÇÃO</span></div>
    <h2>Afirmação, Negação e Pergunta com TO BE</h2>
  `;

  let sIdx = 0;
  let cIdx = 0;
  let mode = "affirmative"; // affirmative, negative, question

  const sRow = document.createElement("div");
  sRow.className = "toolbar";
  const modeRow = document.createElement("div");
  modeRow.className = "toolbar";
  const preview = document.createElement("div");
  preview.className = "flashcard";

  function render() {
    sRow.replaceChildren();
    beSubjects.forEach((s, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `btn small ${sIdx === idx ? "primary" : "secondary"}`;
      b.textContent = s.name;
      b.addEventListener("click", () => {
        sIdx = idx;
        render();
      });
      sRow.append(b);
    });

    modeRow.replaceChildren();
    for (const [mKey, mLabel] of [
      ["affirmative", "Afirmar"],
      ["negative", "Negar"],
      ["question", "Perguntar"]
    ]) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `btn small ${mode === mKey ? "primary" : "secondary"}`;
      b.textContent = mLabel;
      b.addEventListener("click", () => {
        mode = mKey;
        render();
      });
      modeRow.append(b);
    }

    const s = beSubjects[sIdx];
    const comp = beComplements[cIdx] || "ready";
    let text = "";
    if (mode === "affirmative") text = `${s.short} ${comp}.`;
    else if (mode === "negative") text = `${s.neg} ${comp}.`;
    else text = `${s.question} ${comp}?`;

    preview.innerHTML = `
      <h3 style="font-size:1.6rem;margin:0.5rem 0;">${text}</h3>
      ${mode === "question" ? `<p class="subtle muted">Respostas: <strong>${s.yes}</strong> / <strong>${s.no}</strong></p>` : ""}
    `;
  }

  panel.append(sRow, modeRow, preview);
  render();
  return panel;
}

function createQuestionExplorerWidget(types) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel";
  panel.innerHTML = `
    <div class="toolbar"><span class="pill pill-info">QUESTION EXPLORER</span></div>
    <h2>Perguntas essenciais (What, Where, How, Who)</h2>
  `;

  let activeIdx = 0;
  let revealed = false;

  const btnRow = document.createElement("div");
  btnRow.className = "toolbar";
  const display = document.createElement("div");
  display.className = "tile";

  function render() {
    btnRow.replaceChildren();
    types.forEach((t, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `btn small ${activeIdx === idx ? "primary" : "secondary"}`;
      b.textContent = t.label;
      b.addEventListener("click", () => {
        activeIdx = idx;
        revealed = false;
        render();
      });
      btnRow.append(b);
    });

    const item = types[activeIdx];
    display.innerHTML = `
      <h3 style="font-size:1.4rem;">${item.q}</h3>
      <p class="muted">${item.pt}</p>
      <p class="subtle"><strong>Padrão:</strong> ${item.pattern || ""}</p>
      <button type="button" class="btn small primary" id="rev-q-btn">${revealed ? "Ocultar resposta" : "Revelar resposta possível"}</button>
      <div id="q-ans-box" class="${revealed ? "" : "hidden"}" style="margin-top:0.8rem;">
        <h4>${item.a}</h4>
        <p class="muted">${item.apt}</p>
      </div>
    `;

    display.querySelector("#rev-q-btn").addEventListener("click", () => {
      revealed = !revealed;
      render();
    });
  }

  panel.append(btnRow, display);
  render();
  return panel;
}

function createGreetingsWidget(greetings) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel";
  panel.innerHTML = `
    <div class="toolbar"><span class="pill pill-success">REAL ENGLISH LAB</span></div>
    <h2>Cumprimentos e Respostas Naturais</h2>
  `;

  const container = document.createElement("div");
  container.className = "grid";

  greetings.forEach((g) => {
    const card = document.createElement("div");
    card.className = "tile";
    card.innerHTML = `
      <h4>${g.q}</h4>
      <p class="muted subtle">${g.pt}</p>
      <hr class="divider"/>
      <p><strong>Resposta natural:</strong> ${g.a}</p>
      <p class="muted subtle">${g.apt}</p>
      ${g.usage ? `<p class="subtle muted"><em>${g.usage}</em></p>` : ""}
    `;
    container.append(card);
  });

  panel.append(container);
  return panel;
}

function createSpeakingDrillsWidget(drills) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel";
  panel.innerHTML = `
    <div class="toolbar"><span class="pill pill-info">SPEAKING DRILLS</span></div>
    <h2>Prática de respostas rápidas</h2>
  `;

  let idx = 0;
  let show = false;

  const card = document.createElement("div");
  card.className = "flashcard";

  function render() {
    const d = drills[idx];
    card.innerHTML = `
      <h3 style="font-size:1.4rem;">${d.q}</h3>
      <p class="muted">${d.pt}</p>
      <button type="button" class="btn small primary" id="drill-rev">${show ? "Ocultar respostas" : "Revelar respostas"}</button>
      <div class="${show ? "" : "hidden"}" style="margin-top:0.8rem;">
        <p><span class="pill pill-success">SIM</span> ${d.yes}</p>
        <p><span class="pill pill-danger">NÃO</span> ${d.no}</p>
        ${d.alt ? `<p><span class="pill">COLOQUIAL</span> ${d.alt}</p>` : ""}
      </div>
      <div class="toolbar justify-between" style="width:100%;margin-top:1rem;">
        <button type="button" class="btn small secondary" id="prev-d" ${idx === 0 ? "disabled" : ""}>← Anterior</button>
        <button type="button" class="btn small secondary" id="next-d" ${idx === drills.length - 1 ? "disabled" : ""}>Próxima →</button>
      </div>
    `;

    card.querySelector("#drill-rev").addEventListener("click", () => {
      show = !show;
      render();
    });
    card.querySelector("#prev-d").addEventListener("click", () => {
      idx--;
      show = false;
      render();
    });
    card.querySelector("#next-d").addEventListener("click", () => {
      idx++;
      show = false;
      render();
    });
  }

  panel.append(card);
  render();
  return panel;
}

function createConversationSimulatorWidget(steps) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel";
  panel.innerHTML = `
    <div class="toolbar"><span class="pill pill-info">SIMULADOR DE CONVERSA</span></div>
    <h2>Meeting someone at a café</h2>
    <p class="muted">Interaja no diálogo escolhendo como responder em cada turno.</p>
  `;

  let nodeIdx = 0;
  const history = [];

  const historyBox = document.createElement("div");
  historyBox.className = "conversation-history";

  const activeBox = document.createElement("div");
  activeBox.className = "tile";

  function render() {
    historyBox.replaceChildren();
    history.forEach((h) => {
      const turn = document.createElement("div");
      turn.className = "dialogue-turn";
      turn.innerHTML = `<strong>ALEX:</strong> ${h.q}<br/><strong>YOU:</strong> ${h.a}`;
      historyBox.append(turn);
    });

    activeBox.replaceChildren();
    if (nodeIdx < 0 || nodeIdx >= steps.length) {
      activeBox.innerHTML = `
        <div class="notice">
          <h3>✓ Conversa concluída!</h3>
          <p>Você interagiu do início ao fim usando os chunks da aula. Tente agora praticar em voz alta.</p>
          <button type="button" class="btn primary small" id="restart-conv">Reiniciar conversa</button>
        </div>
      `;
      activeBox.querySelector("#restart-conv").addEventListener("click", () => {
        nodeIdx = 0;
        history.length = 0;
        render();
      });
      return;
    }

    const step = steps[nodeIdx];
    const qHeading = document.createElement("h4");
    qHeading.textContent = `Alex: "${step.q}"`;
    const qPt = document.createElement("p");
    qPt.className = "muted subtle";
    qPt.textContent = step.pt;
    activeBox.append(qHeading, qPt);

    const optsList = document.createElement("div");
    optsList.className = "toolbar";
    step.opts.forEach((opt) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn full secondary";
      b.innerHTML = `<strong>${opt.en}</strong> <span class="muted subtle">(${opt.pt})</span>`;
      b.addEventListener("click", () => {
        history.push({ q: step.q, a: opt.en });
        nodeIdx = opt.next;
        render();
      });
      optsList.append(b);
    });

    activeBox.append(optsList);
  }

  panel.append(historyBox, activeBox);
  render();
  return panel;
}

function createGrammarMapWidget(map) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel";
  panel.innerHTML = `
    <div class="toolbar"><span class="pill pill-success">MAPA DE CHUNKS</span></div>
    <h2>Mapa de Estruturas Gramaticais</h2>
  `;

  map.forEach((grp) => {
    const d = document.createElement("details");
    d.className = "module";
    d.innerHTML = `<summary>${grp.title} (${grp.items.length})</summary>`;
    const body = document.createElement("div");
    body.className = "module-body";
    grp.items.forEach(([en, pt]) => {
      const row = document.createElement("div");
      row.className = "tile subtle";
      row.innerHTML = `<strong>${en}</strong> — <span class="muted">${pt}</span>`;
      body.append(row);
    });
    d.append(body);
    panel.append(d);
  });

  return panel;
}

function createPersonalQuestionsWidget(questions) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel";
  panel.innerHTML = `
    <div class="toolbar"><span class="pill pill-info">FINAL CHALLENGE</span></div>
    <h2>Fale sobre você (Introduce Yourself)</h2>
    <p class="muted">Responda às perguntas com informações reais sobre sua vida.</p>
  `;

  questions.forEach((q, idx) => {
    const box = document.createElement("div");
    box.className = "exercise";
    box.innerHTML = `
      <h4>${idx + 1}. ${q.q}</h4>
      <p class="muted subtle">${q.pt}</p>
      <textarea class="input-area" rows="2" placeholder="Write your answer in English..."></textarea>
      ${q.hint ? `<p class="subtle muted"><em>Dica: ${q.hint}</em></p>` : ""}
    `;
    panel.append(box);
  });

  return panel;
}

function createCompletionChecklistWidget(goals) {
  const panel = document.createElement("section");
  panel.className = "panel widget-panel";
  panel.innerHTML = `
    <div class="toolbar"><span class="pill pill-success">AUTOAVALIAÇÃO</span></div>
    <h2>Seu Checklist de Aprendizagem</h2>
    <p class="muted">Marque as competências que você já se sente seguro para utilizar:</p>
  `;

  const checkedCount = document.createElement("div");
  checkedCount.className = "subtle muted";

  const track = document.createElement("div");
  track.className = "progress-track";
  const fill = document.createElement("div");
  fill.className = "progress-fill";
  track.append(fill);

  const list = document.createElement("div");
  list.className = "options";

  const checked = new Set();

  function update() {
    checkedCount.textContent = `${checked.size} de ${goals.length} dominados`;
    fill.style.width = Math.round((checked.size / goals.length) * 100) + "%";
  }

  goals.forEach((g, idx) => {
    const label = document.createElement("label");
    label.className = "option";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.addEventListener("change", (e) => {
      if (e.target.checked) checked.add(idx);
      else checked.delete(idx);
      update();
    });
    label.append(cb, document.createTextNode(" " + g));
    list.append(label);
  });

  panel.append(checkedCount, track, list);
  update();
  return panel;
}
