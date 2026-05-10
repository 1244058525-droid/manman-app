const isGitHubPages = window.location.hostname.includes("github.io");
const API_BASE = window.location.protocol === "file:" ? "http://localhost:8787" : "";
const USER_ID = "local-demo-user-onboarding-v2";
const CONVERSATION_ID = "local-demo-conversation";
const LOCAL_PROFILE_KEY = "manman.localProfile.v2";
const SEARCH_PARAMS = new URLSearchParams(window.location.search);

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  navigator.serviceWorker.register("/service-worker.js").catch(() => {});
}

let questionnaireConfig = null;
let questions = [];
let answers = {};
let currentPersonaResult = null;
let currentProfilePatch = null;
let currentResultPage = null;
let activeRemoteConfig = {};

const panels = document.querySelectorAll("[data-panel]");
const navButtons = document.querySelectorAll("[data-view]");
const questionnaireForm = document.querySelector("#questionnaireForm");
const questionnaireHeading = document.querySelector("#questionnaireHeading");
const questionnaireProgress = document.querySelector("#questionnaireProgress");
const questionProgressText = document.querySelector("#questionProgressText");
const progressFill = document.querySelector("#progressFill");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatThread = document.querySelector("#chatThread");
const chatSlogan = document.querySelector("#chatSlogan");
const chatModeLabel = document.querySelector("#chatModeLabel");
const topbarTitle = document.querySelector("#topbarTitle");
const resultContent = document.querySelector("#resultContent");
const resultStartButton = document.querySelector("#resultStartButton");
const resultSkipButton = document.querySelector("#resultSkipButton");
const modelConfigForm = document.querySelector("#modelConfigForm");
const modelProvider = document.querySelector("#modelProvider");
const conversationMode = document.querySelector("#conversationMode");
const modelName = document.querySelector("#modelName");
const modelEndpoint = document.querySelector("#modelEndpoint");
const modelApiKeyEnv = document.querySelector("#modelApiKeyEnv");
const modelTemperature = document.querySelector("#modelTemperature");
const modelMaxTokens = document.querySelector("#modelMaxTokens");
const modelUseReal = document.querySelector("#modelUseReal");
const modelRuleSummary = document.querySelector("#modelRuleSummary");
const modelConfigStatus = document.querySelector("#modelConfigStatus");
const modelTestButton = document.querySelector("#modelTestButton");
const resetOnboardingButton = document.querySelector("#resetOnboardingButton");
const remoteConfigStatus = document.querySelector("#remoteConfigStatus");
const remoteConfigPreviewButton = document.querySelector("#remoteConfigPreviewButton");
const remoteConfigPreview = document.querySelector("#remoteConfigPreview");
const drawerToggle = document.querySelector("#drawerToggle");
const drawerBackdrop = document.querySelector(".drawer-backdrop");
const choiceButtons = document.querySelectorAll(".choice-button");
const introOnboarding = document.querySelector("#introOnboarding");
const introSlides = document.querySelectorAll(".intro-slide");
const introDots = document.querySelectorAll(".intro-progress span");
const generateResultButton = document.querySelector("#generateResult");
const skipToChatButton = document.querySelector("#skipToChat");
const profileSummaryCard = document.querySelector("#profileSummaryCard");
const profileFieldList = document.querySelector("#profileFieldList");
const learnedList = document.querySelector("#learnedList");
const profileStatus = document.querySelector("#profileStatus");
const editProfileButton = document.querySelector("#editProfileButton");
const pauseMemoryButton = document.querySelector("#pauseMemoryButton");
const deleteProfileButton = document.querySelector("#deleteProfileButton");
const todayMoodGrid = document.querySelector("#todayMoodGrid");
const todayCompanionText = document.querySelector("#todayCompanionText");
const continueTopicText = document.querySelector("#continueTopicText");
const todayJournal = document.querySelector("#todayJournal");
const exportDataButton = document.querySelector("#exportDataButton");
const deleteAllDataButton = document.querySelector("#deleteAllDataButton");
const replyLengthSelect = document.querySelector("#replyLengthSelect");
const replyToneSelect = document.querySelector("#replyToneSelect");

let introIndex = 0;
let introAnimating = false;
let currentQuestionIndex = 0;
let questionAnimating = false;
let hasStartedChat = false;
let isSubmittingQuestionnaire = false;
let shouldEnterChatAfterIntro = false;
let forceFreshOnboarding = SEARCH_PARAMS.get("reset") === "1" || SEARCH_PARAMS.get("fresh") === "1";
let lastTopic = "";

const viewTitles = {
  home: "慢慢",
  questionnaire: "先认识你一点",
  result: "陪伴画像",
  chat: "聊天",
  today: "今日",
  profile: "画像",
  settings: "我的"
};

const modeLabels = {
  companion_mode: "当前模式：陪伴中",
  reflection_mode: "当前模式：帮你梳理",
  analysis_mode: "当前模式：分析问题",
  action_mode: "当前模式：行动计划"
};

const conversationModeLabels = {
  companion: "陪伴模式",
  functional: "功能模式"
};

function parseJsonConfig(value, fallback) {
  try {
    return JSON.parse(value || "");
  } catch (error) {
    return fallback;
  }
}

function showConfigNotice(text, tone = "info") {
  if (!text) return;
  const notice = document.createElement("div");
  notice.className = `config-notice ${tone}`;
  notice.textContent = text;
  document.body.appendChild(notice);
  window.setTimeout(() => {
    notice.classList.add("leaving");
    window.setTimeout(() => notice.remove(), 360);
  }, 2200);
}

function mergeQuestionnaireOverrides(baseConfig, overrides) {
  if (!baseConfig || !overrides || typeof overrides !== "object") return baseConfig;
  const questionOverrides = overrides.questions || {};
  return {
    ...baseConfig,
    opening_page: {
      ...baseConfig.opening_page,
      ...(overrides.opening_page || {})
    },
    questionnaire_page: {
      ...baseConfig.questionnaire_page,
      ...(overrides.questionnaire_page || {})
    },
    questions: (baseConfig.questions || []).map((question) => {
      const patch = questionOverrides[question.id] || {};
      return {
        ...question,
        ...patch,
        options: patch.options || question.options
      };
    })
  };
}

function applyRemoteConfigPayload(payload) {
  const values = payload?.values || {};
  const meta = payload?.meta || {};
  activeRemoteConfig = values;

  if (remoteConfigStatus) {
    const sourceText = meta.source === "remote" ? "云端配置" : meta.source === "cache" ? "缓存配置" : "本地默认配置";
    remoteConfigStatus.textContent = meta.ok
      ? `当前使用：${sourceText}`
      : `当前使用：${sourceText}。${meta.enabled ? "云端拉取失败，已自动兜底。" : "Firebase 尚未启用。"}`;
  }

  if (values.welcome_slogan) {
    document.querySelectorAll(".slogan, #chatSlogan").forEach((item) => {
      item.textContent = values.welcome_slogan;
    });
  }

  const introLines = parseJsonConfig(values.intro_lines_json, null);
  if (Array.isArray(introLines) && introLines.length) {
    const introText = document.querySelector(".intro-text-only p");
    if (introText) {
      introText.innerHTML = introLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("");
    }
  }

  if (values.chat_placeholder) {
    chatInput.placeholder = values.chat_placeholder;
  }

  if (values.composer_note) {
    const note = document.querySelector(".composer-note");
    if (note) note.textContent = values.composer_note;
  }

  if (questionnaireConfig) {
    const overrides = parseJsonConfig(values.questionnaire_overrides_json, {});
    questionnaireConfig = mergeQuestionnaireOverrides(questionnaireConfig, overrides);
    questions = questionnaireConfig.questions;
    renderQuestionnaire();
  }

  if (meta.source !== "default" && meta.ok) {
    showConfigNotice(values.remote_notice_success || "已同步云端配置。", "success");
  } else if (meta.ok === false && meta.enabled) {
    showConfigNotice(values.remote_notice_failure || "暂时使用本地默认配置。", "info");
  }
}

window.ManmanApplyRemoteConfig = applyRemoteConfigPayload;
window.addEventListener("manman:remote-config", (event) => {
  applyRemoteConfigPayload(event.detail);
});

remoteConfigPreviewButton?.addEventListener("click", () => {
  if (!remoteConfigPreview) return;
  const payload = window.ManmanRemoteConfig || { values: activeRemoteConfig, meta: {} };
  remoteConfigPreview.textContent = JSON.stringify(payload, null, 2);
  remoteConfigPreview.classList.toggle("active");
});

function readLocalProfile() {
  try {
    const stored = localStorage.getItem(LOCAL_PROFILE_KEY) || sessionStorage.getItem(LOCAL_PROFILE_KEY);
    return JSON.parse(stored || "null");
  } catch (error) {
    return null;
  }
}

if (forceFreshOnboarding) {
  localStorage.removeItem(LOCAL_PROFILE_KEY);
  sessionStorage.removeItem(LOCAL_PROFILE_KEY);
  shouldEnterChatAfterIntro = false;
}

function writeLocalProfile(patch) {
  const next = {
    ...(readLocalProfile() || {}),
    ...patch,
    updated_at: new Date().toISOString()
  };
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(next));
  sessionStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(next));
  return next;
}

function updateSavedProfile(patch) {
  return writeLocalProfile(patch);
}

function applySavedProfile(savedProfile) {
  if (!savedProfile) return false;
  currentPersonaResult = savedProfile.persona_result || savedProfile.pending_persona_result || currentPersonaResult;
  currentProfilePatch = savedProfile.user_profile || savedProfile.profile_patch || savedProfile.pending_profile_patch || currentProfilePatch;
  currentResultPage = savedProfile.result_page || savedProfile.pending_result_page || currentResultPage;
  answers = savedProfile.answers || answers;
  return Boolean(savedProfile.onboarding_completed || savedProfile.result_saved || savedProfile.persona_result);
}

shouldEnterChatAfterIntro = applySavedProfile(readLocalProfile());

function markOnboardingCompleted(profilePatch = {}) {
  writeLocalProfile({
    onboarding_completed: true,
    ...profilePatch
  });
  shouldEnterChatAfterIntro = true;
  forceFreshOnboarding = false;
}

async function restoreUserProfile() {
  const localProfile = readLocalProfile();
  const hasLocalProfile = applySavedProfile(localProfile);

  try {
    const result = await apiRequest(`/api/user/profile?user_id=${encodeURIComponent(USER_ID)}`);
    if (result.user && applySavedProfile(result.user)) {
      writeLocalProfile({
        onboarding_completed: true,
        result_saved: Boolean(result.user.result_saved),
        persona_result: result.user.persona_result || result.user.pending_persona_result,
        profile_patch: result.user.user_profile || result.user.pending_profile_patch,
        result_page: result.user.result_page || result.user.pending_result_page,
        answers: result.user.answers || answers
      });
      return true;
    }
  } catch (error) {
    return hasLocalProfile;
  }

  return hasLocalProfile;
}

async function apiRequest(path, options = {}) {
  if (isGitHubPages) {
    return await apiRequestLocal(path, options);
  }
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data;
}

async function apiRequestLocal(path, options = {}) {
  if (path === "/api/onboarding/questionnaire") {
    const resp = await fetch("./data/questionnaireConfig.json");
    return await resp.json();
  }
  if (path === "/api/chat/message") {
    return await callMiMoDirectly(options);
  }
  if (path === "/api/health") return { ok: true, mode: "client-side" };
  if (path.startsWith("/api/user/")) return handleUserApi(path, options);
  if (path.startsWith("/api/onboarding/")) return handleOnboardingApi(path, options);
  if (path.startsWith("/api/admin/")) return handleAdminApi(path, options);
  throw new Error("此功能需要后端支持");
}

async function callMiMoDirectly(options) {
  const payload = JSON.parse(options.body || "{}");
  const message = payload.message || "";
  const personaResult = payload.persona_result || "";
  const userProfile = payload.user_profile || "";
  const recentMessages = payload.recent_messages || [];

  let systemPrompt = "你是「慢慢」，一款 AI 陪伴产品。你不急着给答案，而是先理解用户的状态，再用适合的方式陪伴。回复要自然口语化，不要报告腔。";
  if (personaResult) systemPrompt += "\n用户画像：" + (typeof personaResult === 'object' ? JSON.stringify(personaResult) : personaResult);
  if (userProfile) systemPrompt += "\n用户偏好：" + (typeof userProfile === 'object' ? JSON.stringify(userProfile) : userProfile);

  const messages = [{ role: "system", content: systemPrompt }];
  for (const msg of recentMessages) messages.push({ role: msg.role, content: msg.content });
  messages.push({ role: "user", content: message });

  const mimoResp = await fetch("https://api.xiaomimimo.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer sk-cu1illm6esunhj8tag6wa5yqq14zwhi30utb27ghmh0j30ih"
    },
    body: JSON.stringify({ model: "mimo-v2-pro", messages, temperature: 0.85, max_tokens: 900 })
  });

  if (!mimoResp.ok) throw new Error("AI 回复生成失败");
  const mimoData = await mimoResp.json();
  const reply = mimoData.choices?.[0]?.message?.content || "抱歉，我现在没能生成回复。";
  return { ok: true, message: reply, assistant_reply: reply, mode: "client-direct" };
}

function handleUserApi(path, options) {
  const profileKey = "manman_user_profile";
  if (path.includes("/profile") && (!options.method || options.method === "GET")) {
    const saved = localStorage.getItem(profileKey);
    return saved ? JSON.parse(saved) : { user_id: "local-demo-user" };
  }
  if (options.method === "POST" || options.method === "PUT") {
    localStorage.setItem(profileKey, options.body || "{}");
    return { ok: true };
  }
  if (path.includes("/reset")) {
    localStorage.removeItem(profileKey);
    localStorage.removeItem("manman_conversation");
    return { ok: true };
  }
  return { ok: true };
}

function handleOnboardingApi(path, options) {
  if (path === "/api/onboarding/submit" || path === "/api/onboarding/save-result") {
    const body = JSON.parse(options.body || "{}");
    const profileKey = "manman_user_profile";
    const existing = JSON.parse(localStorage.getItem(profileKey) || "{}");
    localStorage.setItem(profileKey, JSON.stringify({ ...existing, ...body, saved_at: new Date().toISOString() }));
    return { ok: true, persona_result: body.persona_result || body };
  }
  return { ok: true };
}

function handleAdminApi(path, options) {
  if (path === "/api/admin/model-config" && (!options.method || options.method === "GET")) {
    return { provider: "mimo", model: "mimo-v2-pro", conversation_mode: "companion", use_real_model: true, temperature: 0.85, max_tokens: 900 };
  }
  if (path === "/api/admin/model-test") return { ok: true, message: "客户端直连模式" };
  return { ok: true };
}

function showView(view) {
  document.body.dataset.currentView = view;

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === view);
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  document.querySelectorAll(".bottom-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  if (topbarTitle) topbarTitle.textContent = viewTitles[view] || "慢慢";

  if (view === "profile") renderProfileView();
  if (view === "today") renderTodayView();
  if (view === "settings") syncPreferenceControls();

  closeDrawer();

  if (view === "questionnaire" && !document.body.classList.contains("intro-active")) {
    playQuestionnaireOpening();
  }

  if (view === "result") {
    playResultIntro();
  }
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.view === "home" && shouldEnterChatAfterIntro) {
      showView("chat");
      return;
    }
    showView(button.dataset.view);
  });
});

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    choiceButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

function updateIntroDots(index) {
  introDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === index);
  });
}

function finishIntro() {
  introOnboarding.classList.add("hidden");
  document.body.classList.remove("intro-active");
}

function exitIntroToQuestionnaire() {
  if (introAnimating) return;
  shouldEnterChatAfterIntro =
    !forceFreshOnboarding && (shouldEnterChatAfterIntro || applySavedProfile(readLocalProfile()));

  introAnimating = true;
  const currentSlide = introSlides[introIndex];
  currentSlide.classList.add("leaving-up");
  currentSlide.classList.remove("active");
  introOnboarding.classList.add("exiting");

  if (shouldEnterChatAfterIntro) {
    showView("chat");
  } else {
    showView("questionnaire");
    showQuestion(0, { animate: false, lineIntro: false });
  }

  window.setTimeout(() => {
    finishIntro();
    introSlides.forEach((slide) => {
      slide.classList.remove("active", "leaving", "leaving-up");
    });
    introOnboarding.classList.remove("exiting");
    if (!shouldEnterChatAfterIntro) {
      playQuestionnaireOpening();
    }
    introAnimating = false;
  }, 760);
}

function playQuestionnaireOpening() {
  if (!questions.length) return;
  showQuestion(0, { animate: false, lineIntro: false });
  const firstBlock = questionnaireForm.querySelector('[data-question-index="0"]');
  firstBlock?.classList.add("pre-intro");
  animateQuestionnaireIntro();

  window.setTimeout(() => {
    firstBlock?.classList.remove("pre-intro");
    showQuestion(0, { animate: true, lineIntro: true });
  }, 260);
}

function animateQuestionnaireIntro() {
  questionnaireHeading.classList.remove("line-intro", "ready");
  questionnaireProgress.classList.remove("line-intro", "ready");
  void questionnaireHeading.offsetWidth;
  questionnaireHeading.classList.add("line-intro");
  questionnaireProgress.classList.add("line-intro");

  window.setTimeout(() => {
    questionnaireHeading.classList.remove("line-intro");
    questionnaireProgress.classList.remove("line-intro");
    questionnaireHeading.classList.add("ready");
    questionnaireProgress.classList.add("ready");
  }, 1200);
}

function goToIntroSlide(nextIndex) {
  if (introAnimating) return;

  const currentSlide = introSlides[introIndex];
  const nextSlide = introSlides[nextIndex];
  introAnimating = true;

  currentSlide.classList.add("leaving");
  currentSlide.classList.remove("active");

  window.setTimeout(() => {
    currentSlide.classList.remove("leaving");
    nextSlide.classList.add("active");
    introIndex = nextIndex;
    updateIntroDots(introIndex);

    window.setTimeout(() => {
      introAnimating = false;
    }, 820);
  }, 440);
}

function advanceIntro() {
  if (introAnimating) return;

  if (introIndex >= introSlides.length - 1) {
    exitIntroToQuestionnaire();
    return;
  }

  goToIntroSlide(introIndex + 1);
}

introOnboarding.addEventListener("pointerup", advanceIntro);

function openDrawer() {
  document.body.classList.add("drawer-open");
  drawerToggle.setAttribute("aria-expanded", "true");
}

function closeDrawer() {
  document.body.classList.remove("drawer-open");
  drawerToggle.setAttribute("aria-expanded", "false");
}

function toggleDrawer() {
  if (document.body.classList.contains("drawer-open")) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

drawerToggle.addEventListener("click", toggleDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);

function getSelectedValues(question) {
  if (question.type === "open_text") {
    return questionnaireForm.querySelector(`[name="${question.id}"]`)?.value.trim() || "";
  }

  const checked = Array.from(questionnaireForm.querySelectorAll(`[name="${question.id}"]:checked`));
  if (question.type === "single_choice") return checked[0]?.value || "";
  return checked.map((input) => input.value);
}

function persistQuestionAnswer(question) {
  answers[question.id] = getSelectedValues(question);
}

function renderQuestionnaire() {
  questionnaireForm.innerHTML = "";

  questions.forEach((question, index) => {
    const block = document.createElement("section");
    block.className = "question-block";
    block.dataset.questionIndex = String(index);

    const title = document.createElement("div");
    title.className = "question-title";
    title.style.setProperty("--line-index", "4");
    title.textContent = `${index + 1}. ${question.title}`;
    block.appendChild(title);

    let lineIndex = 5;

    if (question.description) {
      const hint = document.createElement("div");
      hint.className = "question-hint";
      hint.style.setProperty("--line-index", String(lineIndex));
      hint.textContent = question.description;
      block.appendChild(hint);
      lineIndex += 1;
    }

    if (question.type === "open_text") {
      const textarea = document.createElement("textarea");
      textarea.className = "text-answer";
      textarea.name = question.id;
      textarea.maxLength = question.max_length || 300;
      textarea.placeholder = question.placeholder || "想写就写一点，不想写也没关系";
      textarea.style.setProperty("--line-index", String(lineIndex));
      textarea.addEventListener("input", () => {
        persistQuestionAnswer(question);
        updateProgress();
      });
      block.appendChild(textarea);
      lineIndex += 1;
    } else {
      const options = document.createElement("div");
      options.className = "option-grid";

      question.options.forEach((item, optionIndex) => {
        const option = document.createElement("label");
        option.className = "option";
        option.style.setProperty("--line-index", String(lineIndex + optionIndex));

        const input = document.createElement("input");
        input.type = question.type === "single_choice" ? "radio" : "checkbox";
        input.name = question.id;
        input.value = item.id;
        input.addEventListener("change", () => {
          enforceMaxSelected(question, input);
          persistQuestionAnswer(question);
          updateProgress();
        });

        const text = document.createElement("span");
        text.textContent = item.label;

        option.append(input, text);
        options.appendChild(option);
      });

      block.appendChild(options);
      lineIndex += question.options.length;
    }

    const controls = document.createElement("div");
    controls.className = "question-controls";
    controls.style.setProperty("--line-index", String(lineIndex));

    if (index > 0) {
      const previousButton = document.createElement("button");
      previousButton.className = "secondary-button";
      previousButton.type = "button";
      previousButton.textContent = "上一题";
      previousButton.addEventListener("click", () => goToQuestion(index - 1));
      controls.appendChild(previousButton);
    }

    const nextButton = document.createElement("button");
    nextButton.className = "primary-button";
    nextButton.type = "button";
    nextButton.textContent = index === questions.length - 1 ? "生成我的陪伴说明" : "下一题";
    nextButton.addEventListener("click", () => {
      if (index === questions.length - 1) {
        submitQuestionnaire();
        return;
      }

      goToQuestion(index + 1);
    });
    controls.appendChild(nextButton);
    block.appendChild(controls);
    questionnaireForm.appendChild(block);
  });

  showQuestion(0, { animate: false, lineIntro: false });
}

function enforceMaxSelected(question, changedInput) {
  if (question.type !== "multi_choice" || !question.max_selected) return;
  const selected = Array.from(questionnaireForm.querySelectorAll(`[name="${question.id}"]:checked`));
  if (selected.length <= question.max_selected) return;

  changedInput.checked = false;
  const block = changedInput.closest(".question-block");
  const hint = block?.querySelector(".question-hint");
  if (hint) {
    const original = question.description || "";
    hint.textContent = `这题最多可以选 ${question.max_selected} 个。`;
    window.setTimeout(() => {
      hint.textContent = original;
    }, 1500);
  }
}

function updateProgress() {
  if (!questions.length) return;
  const answeredRequired = questions.filter((question, index) => question.required && isQuestionAnswered(index)).length;
  const requiredTotal = questions.filter((question) => question.required).length;
  progressFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
  if (questionProgressText) {
    const question = questions[currentQuestionIndex];
    const optionalText = question && !question.required ? " · 可跳过" : "";
    questionProgressText.textContent = `第 ${currentQuestionIndex + 1} 题 / 共 ${questions.length} 题${optionalText}`;
  }
  generateResultButton.disabled = answeredRequired < requiredTotal || isSubmittingQuestionnaire;
  generateResultButton.classList.toggle("is-disabled", generateResultButton.disabled);
  updateQuestionControls(currentQuestionIndex);
}

function isQuestionAnswered(index) {
  const question = questions[index];
  if (!question) return false;
  if (!question.required) return true;
  const value = getSelectedValues(question);
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

function updateQuestionControls(index) {
  const block = questionnaireForm.querySelector(`[data-question-index="${index}"]`);
  if (!block) return;
  const nextButton = block.querySelector(".question-controls .primary-button");
  if (!nextButton) return;
  nextButton.disabled = isSubmittingQuestionnaire;
  nextButton.classList.toggle("is-disabled", nextButton.disabled);
}

function showQuestion(index, options = {}) {
  const shouldAnimate = options.animate !== false;
  const shouldAnimateLines = options.lineIntro !== false;
  const blocks = questionnaireForm.querySelectorAll(".question-block");

  blocks.forEach((block) => {
    block.classList.remove("active", "entering", "leaving-up", "line-intro", "line-out");
  });

  requestAnimationFrame(() => {
    const targetBlock = questionnaireForm.querySelector(
      `[data-question-index="${index}"]`
    );
    if (targetBlock) {
      targetBlock.classList.add("active");
      if (shouldAnimate) {
        targetBlock.classList.add("entering");
      }
      if (shouldAnimateLines) {
        requestAnimationFrame(() => {
          targetBlock.classList.add("line-intro");
          setTimeout(() => targetBlock.classList.remove("line-intro"), 1300);
        });
      }
    }

    currentQuestionIndex = index;
    updateProgress();
    updateQuestionControls(index);
  });
}

function goToQuestion(nextIndex) {
  if (questionAnimating || nextIndex < 0 || nextIndex >= questions.length) return;

  const currentBlock = questionnaireForm.querySelector(
    `[data-question-index="${currentQuestionIndex}"]`
  );
  const nextBlock = questionnaireForm.querySelector(`[data-question-index="${nextIndex}"]`);

  if (!currentBlock || !nextBlock || currentBlock === nextBlock) return;

  questionAnimating = true;
  currentBlock.classList.add("line-out");
  currentBlock.classList.remove("active");

  window.setTimeout(() => {
    currentBlock.classList.remove("line-out");
    showQuestion(nextIndex, { animate: true, lineIntro: true });

    window.setTimeout(() => {
      questionAnimating = false;
    }, 1120);
  }, 700);
}

function renderList(items) {
  return (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function humanConfidence(value) {
  if (value === "high") return "较高";
  if (value === "medium") return "中等";
  return "还在了解";
}

function flattenProfileFields(profile = {}) {
  const fields = [];
  const push = (label, value) => {
    if (value === undefined || value === null || value === "") return;
    const text = typeof value === "object" ? Object.values(value).filter(Boolean).join("、") : String(value);
    if (text) fields.push({ label, value: text });
  };

  push("压力状态", profile.current_state?.stress_level?.value || profile.current_state?.stress_level);
  push("沟通偏好", profile.communication_preference?.tone || profile.communication_preference?.preferred_role);
  push("情绪处理方式", profile.communication_preference?.recovery_need || profile.emotion_pattern?.coping_style);
  push("行动偏好", profile.action_preference?.next_step_style || profile.action_barrier?.barrier_type);
  push("不喜欢的回复方式", profile.communication_preference?.avoid || profile.avoidance_preference);
  push("生活线索", profile.pet_profile || profile.life_context);

  return fields;
}

function renderProfileView() {
  const saved = readLocalProfile() || {};
  const persona = saved.persona_result || currentPersonaResult || {};
  const profile = saved.profile_patch || saved.user_profile || currentProfilePatch || {};
  const resultPage = saved.result_page || currentResultPage || {};
  const personaName = persona.primary_persona_name || "雾中整理者";
  const confidence = humanConfidence(persona.confidence || "low");

  if (profileSummaryCard) {
    profileSummaryCard.innerHTML = `
      <div class="profile-persona-name">${escapeHtml(personaName)}</div>
      <p>${escapeHtml(resultPage.one_sentence || resultPage.how_i_understand_you || "我会先低压地陪你把话说出来，再根据你的状态决定要不要一起整理下一步。")}</p>
      <span>置信度：${escapeHtml(confidence)}</span>
    `;
  }

  if (profileFieldList) {
    const fields = flattenProfileFields(profile);
    profileFieldList.innerHTML = fields.length
      ? fields.map((item) => `<div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join("")
      : `<p class="muted">还没有保存太多画像。你可以重新做问卷，或在聊天里慢慢让我了解。</p>`;
  }

  if (learnedList) {
    const learned = (saved.learned_preferences || []).map((item) => item.copy).filter(Boolean);
    const summary = learned.length ? learned : resultPage.current_profile_summary || [
      "你压力大时，更适合先被接住，再进入分析或行动。"
    ];
    learnedList.innerHTML = renderList(summary);
  }
}

function renderTodayView() {
  const saved = readLocalProfile() || {};
  const personaName = saved.persona_result?.primary_persona_name || currentPersonaResult?.primary_persona_name || "";
  const mood = saved.today_mood || "";
  if (todayCompanionText) {
    todayCompanionText.textContent = mood
      ? `今天是「${mood}」也可以。${personaName ? `我会按「${personaName}」的方式，` : ""}先陪你把最重的那一块放下来。`
      : "你不用把今天过得很漂亮。先把自己放稳一点，就已经算是在往前了。";
  }
  if (continueTopicText) {
    continueTopicText.textContent = lastTopic
      ? `上次我们停在：“${lastTopic.slice(0, 38)}${lastTopic.length > 38 ? "..." : ""}”`
      : "还没有未结束的话题。你可以从一句很小的话开始。";
  }
  if (todayJournal && saved.today_journal) todayJournal.value = saved.today_journal;
}

function syncPreferenceControls() {
  const saved = readLocalProfile() || {};
  if (replyLengthSelect && saved.reply_length) replyLengthSelect.value = saved.reply_length;
  if (replyToneSelect && saved.reply_tone) replyToneSelect.value = saved.reply_tone;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderResult(result) {
  const page = result.result_page;
  currentPersonaResult = result.persona_result;
  currentProfilePatch = result.profile_patch;
  currentResultPage = result.result_page;

  resultContent.innerHTML = `
    <div class="page-kicker result-line" style="--line-index: 0">你的第一版陪伴画像</div>
    <div class="persona-result-card result-line" style="--line-index: 1">
      <div class="persona-card-top">
        <span>陪伴说明书</span>
        <strong>置信度：${escapeHtml(humanConfidence(result.persona_result.confidence))}</strong>
      </div>
      <h2>${escapeHtml(page.headline)}</h2>
      <p>${escapeHtml(page.intro_copy)}</p>
      <p class="persona-notice">这是我对你的第一版理解。它不是结论，也不是标签，之后你可以随时修改，我也会慢慢修正。</p>
    </div>

    <div class="plain-section soft-section result-line" style="--line-index: 2">
      <h3>我目前理解你</h3>
      <p>${escapeHtml(page.one_sentence || page.how_i_understand_you)}</p>
    </div>

    <div class="plain-section soft-section result-line" style="--line-index: 3">
      <h3>我以后会这样陪你</h3>
      <ul>${renderList(page.how_i_should_support_you)}</ul>
    </div>

    <div class="plain-section soft-section result-line" style="--line-index: 4">
      <h3>我会尽量避免</h3>
      <ul>${renderList(page.how_i_should_not_talk_to_you)}</ul>
    </div>

    <div class="plain-section soft-section result-line" style="--line-index: 5">
      <h3>我会先记住这些</h3>
      <ul>${renderList(page.current_profile_summary)}</ul>
    </div>

    <div class="action-row result-line result-actions" style="--line-index: 6">
      <button class="primary-button" id="resultStartButton" type="button">保存并开始使用</button>
      <button class="secondary-button" id="resultEditButton" type="button">我想改一改</button>
      <button class="secondary-button" id="resultSkipButton" type="button">先跳过</button>
    </div>
  `;

  resultContent.querySelector("#resultStartButton").addEventListener("click", () => savePersonaResult("save"));
  resultContent.querySelector("#resultEditButton").addEventListener("click", () => {
    markOnboardingCompleted({
      result_saved: true,
      persona_result: currentPersonaResult,
      profile_patch: currentProfilePatch,
      result_page: currentResultPage,
      answers
    });
    showView("profile");
  });
  resultContent.querySelector("#resultSkipButton").addEventListener("click", () => savePersonaResult("skip"));
}

async function submitQuestionnaire() {
  if (isSubmittingQuestionnaire) return;
  questions.forEach(persistQuestionAnswer);

  isSubmittingQuestionnaire = true;
  generateResultButton.textContent = "正在生成...";
  updateProgress();

  try {
    const result = await apiRequest("/api/onboarding/submit", {
      method: "POST",
      body: JSON.stringify({ user_id: USER_ID, answers })
    });

    if (!result.ok) {
      const firstError = result.errors?.[0] || "还有题目需要补一下";
      appendMessage("assistant", firstError);
      return;
    }

    renderResult(result);
    markOnboardingCompleted({
      result_saved: false,
      persona_result: result.persona_result,
      profile_patch: result.profile_patch,
      result_page: result.result_page,
      answers
    });
    showView("result");
  } catch (error) {
    appendMessage("assistant", "后端暂时没有连上。请先启动本地服务，再回来生成陪伴说明。");
  } finally {
    isSubmittingQuestionnaire = false;
    generateResultButton.textContent = "生成我的陪伴说明";
    updateProgress();
  }
}

function appendMessage(role, text, options = {}) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  if (options.fromComposer) {
    message.classList.add("from-composer");
  }

  if (role === "assistant") {
    const avatar = document.createElement("img");
    avatar.src = "./assets/manman-logo.png";
    avatar.alt = "";
    avatar.className = "message-avatar";
    message.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;
  message.appendChild(bubble);

  if (role === "assistant" && options.showFeedback !== false) {
    const feedback = document.createElement("div");
    feedback.className = "reply-feedback";
    ["有被理解", "太像 AI", "太长了", "太急着给建议", "想听具体方法"].forEach((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => {
        feedback.querySelectorAll("button").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        const saved = readLocalProfile() || {};
        const nextFeedback = [...(saved.reply_feedback || []), { label, created_at: new Date().toISOString() }].slice(-20);
        updateSavedProfile({ reply_feedback: nextFeedback });
      });
      feedback.appendChild(button);
    });
    message.appendChild(feedback);
  }

  chatThread.appendChild(message);
  window.requestAnimationFrame(() => {
    chatThread.scrollTop = chatThread.scrollHeight;
  });
}

function appendMemorySuggestion(suggestion) {
  const message = document.createElement("div");
  message.className = "message assistant memory-suggestion";

  const avatar = document.createElement("img");
  avatar.src = "./assets/manman-logo.png";
  avatar.alt = "";
  avatar.className = "message-avatar";

  const box = document.createElement("div");
  box.className = "memory-card";
  box.innerHTML = `
    <p>${escapeHtml(suggestion.confirmation_copy || "我好像记住了一点，要加入你的陪伴偏好吗？")}</p>
    <div class="memory-actions">
      <button type="button" data-memory-action="remember">记住</button>
      <button type="button" data-memory-action="ignore">不要记</button>
      <button type="button" data-memory-action="edit">改一下</button>
    </div>
  `;

  box.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.memoryAction;
      const saved = readLocalProfile() || {};
      if (action === "remember") {
        const learned = [...(saved.learned_preferences || []), {
          field_path: suggestion.field_path,
          copy: suggestion.confirmation_copy,
          confidence: suggestion.confidence,
          created_at: new Date().toISOString()
        }];
        updateSavedProfile({ learned_preferences: learned });
        box.querySelector("p").textContent = "好，我会先轻轻记住。你之后也可以在画像页删掉。";
      } else if (action === "edit") {
        showView("profile");
      } else {
        box.querySelector("p").textContent = "好，这条我不记。";
      }
      box.querySelector(".memory-actions")?.remove();
    });
  });

  message.append(avatar, box);
  chatThread.appendChild(message);
  window.requestAnimationFrame(() => {
    chatThread.scrollTop = chatThread.scrollHeight;
  });
}

generateResultButton.addEventListener("click", submitQuestionnaire);

skipToChatButton.addEventListener("click", () => {
  savePersonaResult("skip");
});

function playResultIntro() {
  resultContent.classList.remove("line-intro", "line-out", "ready");
  void resultContent.offsetWidth;
  resultContent.classList.add("line-intro");

  window.setTimeout(() => {
    resultContent.classList.remove("line-intro");
    resultContent.classList.add("ready");
  }, 1300);
}

function leaveResult(nextView) {
  resultContent.classList.add("line-out");
  resultContent.classList.remove("line-intro", "ready");

  window.setTimeout(() => {
    showView(nextView);
    resultContent.classList.remove("line-out");
  }, 1220);
}

async function savePersonaResult(action) {
  try {
    const result = await apiRequest("/api/onboarding/save-result", {
      method: "POST",
      body: JSON.stringify({
        user_id: USER_ID,
        user_action: action,
        persona_result: currentPersonaResult,
        profile_patch: currentProfilePatch,
        result_page: currentResultPage
      })
    });
    markOnboardingCompleted({
      result_saved: action === "save",
      persona_result: result.user?.persona_result || currentPersonaResult,
      profile_patch: result.user?.user_profile || currentProfilePatch,
      result_page: result.user?.result_page || currentResultPage,
      answers
    });
  } catch (error) {
    markOnboardingCompleted({
      result_saved: action === "save",
      persona_result: currentPersonaResult || {
        primary_persona_id: "fog_organizer",
        primary_persona_name: "雾中整理者",
        confidence: "low",
        status: "default"
      },
      profile_patch: currentProfilePatch,
      result_page: currentResultPage,
      answers
    });
    appendMessage("assistant", "保存暂时没有成功，但你可以先继续聊天。");
  }

  if (document.querySelector('[data-panel="result"]').classList.contains("active")) {
    leaveResult("chat");
  } else {
    showView("chat");
  }
}

resultStartButton.addEventListener("click", () => savePersonaResult("save"));
resultSkipButton.addEventListener("click", () => savePersonaResult("skip"));

function dismissChatSlogan() {
  if (hasStartedChat) return;
  hasStartedChat = true;
  chatSlogan.classList.add("leaving");
  window.setTimeout(() => {
    chatSlogan.classList.add("hidden");
  }, 760);
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  dismissChatSlogan();
  appendMessage("user", text, { fromComposer: true });
  lastTopic = text;
  chatInput.value = "";
  chatInput.style.height = "auto";
  const savedProfile = readLocalProfile() || {};

  try {
    const result = await apiRequest("/api/chat/message", {
      method: "POST",
      body: JSON.stringify({
        user_id: USER_ID,
        conversation_id: CONVERSATION_ID,
        message: text,
        persona_result: currentPersonaResult,
        user_profile: savedProfile.profile_patch || savedProfile.user_profile || currentProfilePatch,
        profile_answers: answers,
        remote_config: {
          prompt_extra: [
            activeRemoteConfig.prompt_extra || "",
            savedProfile.reply_length ? `用户偏好回复长度：${savedProfile.reply_length}` : "",
            savedProfile.reply_tone ? `用户偏好回复语气：${savedProfile.reply_tone}` : ""
          ].filter(Boolean).join("\n")
        }
      })
    });
    if (chatModeLabel) {
      const modePrefix = conversationModeLabels[result.conversation_mode] || "陪伴模式";
      if (result.conversation_mode === "functional") {
        const label = result.runtime_state?.functional_label || "自动判断";
        chatModeLabel.textContent = `${modePrefix}：${label}`;
      } else {
        chatModeLabel.textContent = modeLabels[result.response_mode] || "当前模式：陪伴中";
      }
    }
    appendMessage("assistant", result.assistant_reply || result.message, { fromComposer: true });
    if (result.memory_update_suggestion?.should_update) {
      appendMemorySuggestion(result.memory_update_suggestion);
    }
  } catch (error) {
    appendMessage("assistant", "我这边暂时没连上后端，但我还在。你可以先启动本地服务后继续。", {
      fromComposer: true,
      showFeedback: false
    });
  }
});

async function initModelConfig() {
  if (!modelConfigForm) return;

  try {
    const result = await apiRequest("/api/admin/model-config");
    const config = result.config || {};
    modelProvider.value = config.provider || "local";
    if (conversationMode) conversationMode.value = config.conversation_mode || "companion";
    modelName.value = config.model || "local-runtime-mock";
    modelEndpoint.value = config.endpoint || "";
    modelApiKeyEnv.value = config.api_key_env || "OPENAI_API_KEY";
    modelTemperature.value = config.temperature ?? 0.7;
    modelMaxTokens.value = config.max_tokens ?? 700;
    modelUseReal.checked = Boolean(config.use_real_model);
    modelRuleSummary.value = config.system_rule_summary || "";
  } catch (error) {
    modelConfigStatus.textContent = "后台配置暂时读取失败，请先启动本地服务。";
  }
}

modelConfigForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  modelConfigStatus.textContent = "正在保存...";

  try {
    const result = await apiRequest("/api/admin/model-config", {
      method: "POST",
      body: JSON.stringify({
        config: {
          provider: modelProvider.value.trim() || "local",
          conversation_mode: conversationMode?.value || "companion",
          model: modelName.value.trim() || "local-runtime-mock",
          endpoint: modelEndpoint.value.trim(),
          api_key_env: modelApiKeyEnv.value.trim() || "OPENAI_API_KEY",
          temperature: modelTemperature.value,
          max_tokens: modelMaxTokens.value,
          use_real_model: modelUseReal.checked,
          system_rule_summary: modelRuleSummary.value.trim()
        }
      })
    });
    modelConfigStatus.textContent = result.config.use_real_model
      ? `已保存。当前为${conversationModeLabels[result.config.conversation_mode] || "陪伴模式"}，后端会在找到 API Key 时调用真实模型。`
      : `已保存。当前为${conversationModeLabels[result.config.conversation_mode] || "陪伴模式"}，使用本地规则运行。`;
  } catch (error) {
    modelConfigStatus.textContent = "保存失败，请确认本地服务已经启动。";
  }
});

modelTestButton?.addEventListener("click", async () => {
  modelConfigStatus.textContent = "正在测试 MiMo 模型...";

  try {
    const result = await apiRequest("/api/admin/model-test", {
      method: "POST",
      body: JSON.stringify({ message: "只回复：配置测试成功" })
    });
    modelConfigStatus.textContent = `测试成功：${result.provider} / ${result.model} / ${result.message}`;
  } catch (error) {
    modelConfigStatus.textContent = `模型测试失败：${error.message}`;
  }
});

resetOnboardingButton?.addEventListener("click", () => {
  localStorage.removeItem(LOCAL_PROFILE_KEY);
  sessionStorage.removeItem(LOCAL_PROFILE_KEY);
  apiRequest("/api/user/reset", {
    method: "POST",
    body: JSON.stringify({ user_id: USER_ID })
  }).catch(() => {});
  currentPersonaResult = null;
  currentProfilePatch = null;
  currentResultPage = null;
  answers = {};
  shouldEnterChatAfterIntro = false;
  forceFreshOnboarding = true;
  showView("questionnaire");
  playQuestionnaireOpening();
});

document.querySelectorAll("[data-quick-message]").forEach((button) => {
  button.addEventListener("click", () => {
    chatInput.value = button.dataset.quickMessage || "";
    chatInput.focus();
    chatInput.style.height = "auto";
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 160)}px`;
  });
});

todayMoodGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mood]");
  if (!button) return;
  todayMoodGrid.querySelectorAll("button").forEach((item) => item.classList.remove("selected"));
  button.classList.add("selected");
  updateSavedProfile({ today_mood: button.dataset.mood });
  renderTodayView();
});

todayJournal?.addEventListener("input", () => {
  updateSavedProfile({ today_journal: todayJournal.value.trim() });
});

editProfileButton?.addEventListener("click", () => {
  profileStatus.textContent = "第一版先通过重新问卷来修改画像；聊天里出现稳定偏好时，我也会先询问再记住。";
});

pauseMemoryButton?.addEventListener("click", () => {
  const saved = readLocalProfile() || {};
  const paused = !saved.memory_paused;
  updateSavedProfile({ memory_paused: paused });
  profileStatus.textContent = paused ? "已暂停长期记忆。聊天仍可继续，但不会主动加入新画像。" : "已恢复记忆建议。";
});

deleteProfileButton?.addEventListener("click", () => {
  updateSavedProfile({
    persona_result: null,
    profile_patch: null,
    user_profile: null,
    result_page: null,
    result_saved: false
  });
  currentPersonaResult = null;
  currentProfilePatch = null;
  currentResultPage = null;
  profileStatus.textContent = "已删除本地画像。";
  renderProfileView();
});

exportDataButton?.addEventListener("click", () => {
  const data = readLocalProfile() || {};
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "manman-profile-export.json";
  link.click();
  URL.revokeObjectURL(url);
});

deleteAllDataButton?.addEventListener("click", () => {
  localStorage.removeItem(LOCAL_PROFILE_KEY);
  sessionStorage.removeItem(LOCAL_PROFILE_KEY);
  apiRequest("/api/user/reset", {
    method: "POST",
    body: JSON.stringify({ user_id: USER_ID })
  }).catch(() => {});
  currentPersonaResult = null;
  currentProfilePatch = null;
  currentResultPage = null;
  answers = {};
  shouldEnterChatAfterIntro = false;
  showConfigNotice("已清空本地演示数据。", "success");
  showView("home");
});

replyLengthSelect?.addEventListener("change", () => updateSavedProfile({ reply_length: replyLengthSelect.value }));
replyToneSelect?.addEventListener("change", () => updateSavedProfile({ reply_tone: replyToneSelect.value }));

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, 160)}px`;
});

async function initQuestionnaire() {
  try {
    questionnaireConfig = await apiRequest("/api/onboarding/questionnaire");
    questions = questionnaireConfig.questions;
  } catch (error) {
    const localResponse = await fetch("./data/questionnaireConfig.json");
    questionnaireConfig = await localResponse.json();
    questions = questionnaireConfig.questions;
  }

  renderQuestionnaire();
}

async function initApp() {
  if (window.ManmanRemoteConfig) {
    applyRemoteConfigPayload(window.ManmanRemoteConfig);
  }

  if (forceFreshOnboarding) {
    await apiRequest("/api/user/reset", {
      method: "POST",
      body: JSON.stringify({ user_id: USER_ID })
    }).catch(() => {});
  }
  const hasSavedProfile = !forceFreshOnboarding && (shouldEnterChatAfterIntro || (await restoreUserProfile()));
  shouldEnterChatAfterIntro = hasSavedProfile;
  if (hasSavedProfile) {
    showView("chat");
  }

  await initQuestionnaire();
  initModelConfig();
}

initApp();
