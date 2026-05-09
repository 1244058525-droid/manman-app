const crypto = require("crypto");
const mapping = require("../questionnairePersonaMapping.json");
const personaConfig = require("../companionPersonaConfig.json");
const questionnaireConfig = require("../../app/data/questionnaireConfig.json");

const REQUIRED_QUESTIONS = new Set(questionnaireConfig.backend_validation_rules.required_questions);
const OPTIONAL_QUESTIONS = new Set(questionnaireConfig.backend_validation_rules.optional_questions);
const MAX_SELECTED = questionnaireConfig.backend_validation_rules.max_selected || {};
const OPEN_TEXT_MAX = questionnaireConfig.backend_validation_rules.open_text_max_length || {};
const MVP_PERSONAS = new Set(mapping.mvp_persona_ids || []);

function getQuestion(questionId) {
  return questionnaireConfig.questions.find((question) => question.id === questionId);
}

function getMappingQuestion(questionId) {
  return mapping.questions[questionId];
}

function normalizeSelected(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value) return [value];
  return [];
}

function validateAnswers(answers) {
  const errors = [];

  REQUIRED_QUESTIONS.forEach((questionId) => {
    const question = getQuestion(questionId);
    const value = answers[questionId];
    const missing =
      question?.type === "multi_choice"
        ? !Array.isArray(value) || value.length === 0
        : typeof value !== "string" || value.trim() === "";

    if (missing) errors.push(`${questionId} 还没有选择`);
  });

  Object.entries(answers).forEach(([questionId, value]) => {
    const question = getQuestion(questionId);
    if (!question) {
      errors.push(`${questionId} 不是已知题目`);
      return;
    }

    if (question.type === "open_text") {
      const maxLength = OPEN_TEXT_MAX[questionId] || question.max_length;
      if (typeof value === "string" && maxLength && value.length > maxLength) {
        errors.push(`${questionId} 最多 ${maxLength} 个字`);
      }
      return;
    }

    const selected = normalizeSelected(value);
    const allowedIds = new Set(question.options.map((option) => option.id));
    selected.forEach((optionId) => {
      if (!allowedIds.has(optionId)) errors.push(`${questionId} 包含未知选项 ${optionId}`);
    });

    const maxSelected = MAX_SELECTED[questionId] || question.max_selected;
    if (question.type === "multi_choice" && maxSelected && selected.length > maxSelected) {
      errors.push(`${questionId} 最多可选 ${maxSelected} 个`);
    }
  });

  return errors;
}

function mergePatch(target, patch) {
  if (!patch || typeof patch !== "object") return target;

  Object.entries(patch).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const current = Array.isArray(target[key]) ? target[key] : [];
      target[key] = Array.from(new Set([...current, ...value]));
      return;
    }

    if (value && typeof value === "object") {
      target[key] = mergePatch(target[key] && typeof target[key] === "object" ? target[key] : {}, value);
      return;
    }

    target[key] = value;
  });

  return target;
}

function addScores(scores, personaScores) {
  Object.entries(personaScores || {}).forEach(([personaId, score]) => {
    scores[personaId] = (scores[personaId] || 0) + Number(score || 0);
  });
}

function scoreOpenText(questionId, text, scores, profilePatch, evidence) {
  const questionMap = getMappingQuestion(questionId);
  if (!questionMap || typeof text !== "string" || !text.trim()) return;

  const rules =
    questionMap.extraction_rules?.persona_semantic_keywords ||
    questionMap.extraction_rules?.preference_semantic_keywords ||
    {};

  Object.entries(rules).forEach(([ruleId, rule]) => {
    const matched = (rule.keywords || []).some((keyword) => text.includes(keyword));
    if (!matched) return;

    if (rule.score) addScores(scores, { [ruleId]: rule.score });
    if (rule.persona_scores) addScores(scores, rule.persona_scores);
    mergePatch(profilePatch, rule.profile_patch);
    evidence.push({
      question_id: questionId,
      option_id: "open_text",
      reason: `开放题里提到「${(rule.keywords || []).find((keyword) => text.includes(keyword))}」`,
      added_scores: rule.score ? { [ruleId]: rule.score } : rule.persona_scores || {}
    });
  });
}

function calculateConfidence(primaryScore, secondaryScore, answeredCount) {
  const high = mapping.confidence_rules.high;
  const medium = mapping.confidence_rules.medium;
  const gap = primaryScore - secondaryScore;

  if (
    primaryScore >= high.min_primary_score &&
    answeredCount >= high.min_answered_questions
  ) {
    return "high";
  }

  if (
    primaryScore >= medium.min_primary_score &&
    gap >= medium.min_gap_from_secondary &&
    answeredCount >= medium.min_answered_questions
  ) {
    return "medium";
  }

  return "low";
}

function getPersona(personaId) {
  return personaConfig.personas.find((persona) => persona.id === personaId);
}

function chooseSecondary(sortedScores, confidence) {
  if (confidence === "low" || sortedScores.length < 2) return null;
  const [primary, secondary] = sortedScores;
  if (!secondary || secondary.score <= 0) return null;
  if (secondary.score >= primary.score * 0.7 || primary.score - secondary.score <= 3) {
    return secondary;
  }
  return null;
}

function buildCurrentSummary(profilePatch, evidence) {
  const summary = [];
  const latestReasons = evidence.map((item) => item.reason).filter(Boolean).slice(0, 3);

  if (profilePatch.communication_preference?.recovery_need) {
    summary.push(`你更适合先被${profilePatch.communication_preference.recovery_need}，再进入分析或行动。`);
  }
  if (profilePatch.action_barrier?.barrier_type || profilePatch.action_barrier?.fail_reason) {
    summary.push(`你卡住时，重点可能在「${profilePatch.action_barrier.barrier_type || profilePatch.action_barrier.fail_reason}」。`);
  }
  if (profilePatch.decision_pattern?.fear_point || profilePatch.decision_pattern?.decision_style) {
    summary.push(`做选择时，我会帮你降低后悔感和比较压力。`);
  }
  if (latestReasons.length && summary.length < 3) {
    summary.push(latestReasons[0]);
  }

  return summary.slice(0, 4);
}

function renderResultPage(primaryPersona, secondaryPersona, confidence, profilePatch, evidence) {
  const support = primaryPersona.support_methods || [];
  const avoid = primaryPersona.avoid_phrases || [];
  const lowConfidence = confidence === "low";
  const introCopy = lowConfidence
    ? `我先试着认识你一点。根据你刚刚愿意告诉我的部分，你现在有一点像「${primaryPersona.name}」。这只是很初步的理解，不一定完全准确。`
    : `根据你刚刚的回答，你现在更像「${primaryPersona.name}」。这不是一个固定标签，也不是在定义你。`;

  return {
    headline: `你现在更像「${primaryPersona.name}」`,
    intro_copy: secondaryPersona
      ? `${introCopy} 同时，你身上也有一点「${secondaryPersona.name}」的影子。`
      : introCopy,
    one_sentence: primaryPersona.one_sentence,
    how_i_understand_you:
      primaryPersona.result_page_copy ||
      `你现在更像「${primaryPersona.name}」。我会先把这当作一份可修改的陪伴说明，而不是结论。`,
    how_i_should_support_you: support.slice(0, 5),
    how_i_should_not_talk_to_you: avoid.slice(0, 5),
    current_profile_summary: buildCurrentSummary(profilePatch, evidence),
    editable_notice: "这只是第一版，你之后随时可以改。"
  };
}

function buildPersonaResult(answers) {
  const validationErrors = validateAnswers(answers);
  if (validationErrors.length) {
    return { ok: false, errors: validationErrors };
  }

  const scores = {};
  const profilePatch = {};
  const evidence = [];
  let answeredCount = 0;

  Object.entries(answers).forEach(([questionId, value]) => {
    const question = getQuestion(questionId);
    const questionMap = getMappingQuestion(questionId);
    if (!question || !questionMap) return;

    if (question.type === "open_text") {
      if (typeof value === "string" && value.trim()) {
        answeredCount += 1;
        scoreOpenText(questionId, value.trim(), scores, profilePatch, evidence);
      }
      return;
    }

    const selected = normalizeSelected(value);
    if (selected.length) answeredCount += 1;

    selected.forEach((optionId) => {
      const option = questionMap.options?.[optionId];
      if (!option) return;
      addScores(scores, option.persona_scores);
      mergePatch(profilePatch, option.profile_patch);
      evidence.push({
        question_id: questionId,
        option_id: optionId,
        label: option.label,
        reason: option.interpretation || option.label,
        added_scores: option.persona_scores || {}
      });
    });
  });

  const sortedScores = Object.entries(scores)
    .map(([id, score]) => ({ id, score }))
    .filter((item) => MVP_PERSONAS.has(item.id) || item.score > 0)
    .sort((a, b) => b.score - a.score);

  const primaryScore = sortedScores[0] || { id: "fog_organizer", score: 0 };
  const secondaryScore = sortedScores[1] || { id: null, score: 0 };
  const confidence = calculateConfidence(primaryScore.score, secondaryScore.score, answeredCount);
  const secondary = chooseSecondary(sortedScores, confidence);
  const primaryPersona = getPersona(primaryScore.id) || getPersona("fog_organizer");
  const secondaryPersona = secondary ? getPersona(secondary.id) : null;

  return {
    ok: true,
    questionnaire_record_id: crypto.randomUUID(),
    persona_result: {
      primary_persona_id: primaryPersona.id,
      primary_persona_name: primaryPersona.name,
      secondary_persona_id: secondaryPersona?.id || null,
      secondary_persona_name: secondaryPersona?.name || null,
      confidence,
      status: "inferred",
      evidence,
      scores,
      generated_at: new Date().toISOString(),
      user_visible: true
    },
    profile_patch: profilePatch,
    result_page: renderResultPage(primaryPersona, secondaryPersona, confidence, profilePatch, evidence)
  };
}

module.exports = { buildPersonaResult };
