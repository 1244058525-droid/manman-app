const personaConfig = require("../companionPersonaConfig.json");

const bannedPhrases = [
  "我理解你的感受",
  "你已经很棒了",
  "保持积极心态",
  "以下是几点建议",
  "从心理学角度来看",
  "你的问题是",
  "你其实是在逃避",
  "作为一个 AI",
  "先不急着给它下结论",
  "先别急着解决"
];

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function getPersona(personaResult = {}) {
  const personaId = personaResult.primary_persona_id;
  return (
    personaConfig.personas.find((persona) => persona.id === personaId) ||
    personaConfig.personas.find((persona) => persona.id === "fog_organizer")
  );
}

function getSecondaryPersona(personaResult = {}) {
  return personaConfig.personas.find((persona) => persona.id === personaResult.secondary_persona_id) || null;
}

function detectIntensity(message) {
  if (includesAny(message, ["活不下去", "不想活", "想死", "自杀"])) {
    return "high";
  }
  if (includesAny(message, ["撑不住", "崩溃", "绷不住", "好累", "很累", "难受", "想哭", "好烦", "废", "麻木", "没电", "空", "不想说", "反正就那样"])) {
    return "medium";
  }
  return "low";
}

function detectTopicExpansion(message) {
  const rules = [
    {
      id: "work_or_project",
      keywords: ["工作", "项目", "老板", "同事", "需求", "改稿", "进度", "客户", "代码", "页面", "上线"],
      focus: "这件事像是卡在工作/项目里",
      observation: "最消耗人的往往不是事情本身，而是反复被打断、被要求、还要自己撑住节奏。",
      question: "是某个具体环节卡住了，还是你已经被整个节奏磨得有点没力气了？"
    },
    {
      id: "relationship",
      keywords: ["朋友", "对象", "家人", "妈妈", "爸爸", "伴侣", "消息", "冷淡", "关系", "她", "他"],
      focus: "这里面像是有一段关系让你悬着",
      observation: "这种悬着很累，因为你不只是处理一句话，也在猜对方的态度和自己的位置。",
      question: "最让你卡住的是对方做了什么，还是你不知道自己该不该开口？"
    },
    {
      id: "decision",
      keywords: ["纠结", "选择", "要不要", "买", "下单", "后悔", "决定", "选"],
      focus: "你像是卡在一个选择上",
      observation: "它可能不只是值不值，也有一点“我现在到底需要什么”的味道。",
      question: "你更怕选错带来的损失，还是怕自己其实是在用这个选择补偿当下的累？"
    },
    {
      id: "low_energy",
      keywords: ["撑不住", "绷不住", "崩溃", "今天", "起不来", "动不了", "启动不了", "拖延", "没力气", "什么都不想做", "躺", "没电"],
      focus: "你现在像是能量被压得很低",
      observation: "这种时候很多话听起来都像任务，连“振作一点”都会变成新的负担。",
      question: "今天最耗电的是身体累、脑子乱，还是有件事一直在心里占位置？"
    },
    {
      id: "self_doubt",
      keywords: ["我是不是", "太敏感", "想太多", "不够好", "是不是我", "内耗", "自责"],
      focus: "你像是在把矛头往自己身上转",
      observation: "这不一定说明你真的做错了，也可能是你太想把局面解释清楚。",
      question: "如果先不审判自己，刚刚触发你的那个点是什么？"
    }
  ];

  return (
    rules.find((rule) => includesAny(message, rule.keywords)) || {
      id: "open_topic",
      focus: "你这句话不像只是随口一说",
      observation: "它后面应该有一个具体的瞬间，或者一团还没来得及说清楚的东西。",
      question: "如果从最容易开口的地方说，刚刚发生了什么，或者你脑子里反复冒出来的是哪句话？"
    }
  );
}

function detectFunctionalIntent(message) {
  const intents = [
    {
      intent: "rewrite_or_generate",
      keywords: ["帮我写", "改写", "润色", "生成", "文案", "回复一下", "怎么回复", "翻译", "总结成"],
      mode: "action_mode",
      label: "文本处理"
    },
    {
      intent: "decision",
      keywords: ["要不要", "选哪个", "帮我选", "做决定", "纠结", "值不值", "买不买", "该不该", "想买", "怕后悔", "后悔", "划算"],
      mode: "action_mode",
      label: "决策判断"
    },
    {
      intent: "plan",
      keywords: ["计划", "步骤", "怎么做", "下一步", "安排", "路线", "方案", "行动建议"],
      mode: "action_mode",
      label: "行动规划"
    },
    {
      intent: "analysis",
      keywords: ["分析", "为什么", "原因", "拆解", "怎么看", "判断一下", "评估"],
      mode: "analysis_mode",
      label: "问题分析"
    },
    {
      intent: "info_capture",
      keywords: ["记住", "我家", "我有", "我的", "以后", "偏好", "不要", "喜欢", "不喜欢"],
      mode: "reflection_mode",
      label: "信息识别"
    }
  ];

  return intents.find((item) => includesAny(message, item.keywords)) || {
    intent: detectIntensity(message) !== "low" ? "state_check" : "general_help",
    mode: "reflection_mode",
    label: detectIntensity(message) !== "low" ? "状态识别" : "普通协助"
  };
}

function detectUserSignals(message) {
  const signals = [];
  const push = (type, text) => signals.push({ type, text });

  if (includesAny(message, ["我家", "猫", "狗", "孩子", "室友", "对象", "父母"])) {
    push("life_context", "出现生活背景线索");
  }
  if (includesAny(message, ["喜欢", "不喜欢", "希望", "不要", "更想", "偏好"])) {
    push("preference", "出现偏好或禁忌线索");
  }
  if (includesAny(message, ["今天", "最近", "昨晚", "明天", "这周"])) {
    push("time_context", "出现时间线索");
  }
  if (detectIntensity(message) !== "low") {
    push("state", "出现状态或情绪线索");
  }

  return signals;
}

function detectCurrentScene(message) {
  if (includesAny(message, ["要不要买", "买", "下单", "购物车", "评价", "香薰", "包", "沙发", "材质"])) {
    return "consumption_decision";
  }
  if (includesAny(message, ["怎么回复", "拒绝", "不想答应", "冷淡", "不开心", "关系", "她", "他"])) {
    return "relationship_boundary";
  }
  if (includesAny(message, ["启动不了", "动不起来", "第一步", "不知道先做什么"])) {
    return "low_energy_action";
  }
  if (includesAny(message, ["帮我分析", "分析一下", "为什么", "理清楚", "怎么看", "拆一下"])) {
    return "analysis_request";
  }
  if (includesAny(message, ["怎么办", "下一步", "怎么做", "给我方案", "直接说", "做个决定"])) {
    return "action_request";
  }
  if (includesAny(message, ["是不是太敏感", "是不是想太多", "是不是又", "我是不是", "内耗"])) {
    return "self_doubt";
  }
  if (detectIntensity(message) !== "low") {
    return "emotional_dump";
  }
  return "daily_chat";
}

function detectReadinessState(message) {
  const emotionalIntensity = detectIntensity(message);
  const currentScene = detectCurrentScene(message);
  const explicitAnalysis = includesAny(message, ["帮我分析", "分析一下", "为什么", "理清楚", "怎么看", "拆一下"]);
  const explicitAction = includesAny(message, [
    "怎么办",
    "该怎么",
    "下一步",
    "怎么回复",
    "帮我写",
    "改写",
    "润色",
    "生成",
    "要不要买",
    "帮我选",
    "推荐",
    "直接说",
    "做个决定",
    "给我方案"
  ]);
  const selfDoubt = currentScene === "self_doubt";
  const highEmotionWithAmbiguousHelp =
    emotionalIntensity === "high" && includesAny(message, ["怎么办", "不知道"]);

  if (highEmotionWithAmbiguousHelp || (emotionalIntensity === "high" && !explicitAnalysis && !explicitAction)) {
    return {
      readiness_state: "emotional",
      current_scene: "emotional_dump",
      emotional_intensity: emotionalIntensity,
      user_requested_solution: explicitAction || explicitAnalysis,
      recommended_response_mode: "companion_mode",
      reason: "情绪强度高，先陪伴，不急着进入解决。"
    };
  }

  if (emotionalIntensity === "medium" && !explicitAnalysis && !explicitAction && currentScene !== "emotional_dump") {
    return {
      readiness_state: "mixed",
      current_scene: currentScene,
      emotional_intensity: emotionalIntensity,
      user_requested_solution: false,
      recommended_response_mode: "reflection_mode",
      reason: "有情绪，但也有可展开的话题线索，先承接再顺着具体内容聊。"
    };
  }

  if (currentScene === "consumption_decision" && includesAny(message, ["怕只是", "心情不好", "冲动", "怕后悔"])) {
    return {
      readiness_state: "mixed",
      current_scene: currentScene,
      emotional_intensity: "medium",
      user_requested_solution: false,
      recommended_response_mode: "reflection_mode",
      reason: "消费选择里带着情绪补偿和犹豫，先映照再给低压冷静方式。"
    };
  }

  if (explicitAction) {
    return {
      readiness_state: "action_ready",
      current_scene: currentScene === "daily_chat" ? "action_request" : currentScene,
      emotional_intensity: emotionalIntensity,
      user_requested_solution: true,
      recommended_response_mode: "action_mode",
      reason: "用户明确请求判断、回复或下一步。"
    };
  }

  if (explicitAnalysis) {
    return {
      readiness_state: "rational",
      current_scene: currentScene,
      emotional_intensity: emotionalIntensity,
      user_requested_solution: true,
      recommended_response_mode: "analysis_mode",
      reason: "用户明确请求分析或拆解。"
    };
  }

  if (selfDoubt || currentScene === "relationship_boundary" || currentScene === "low_energy_action") {
    return {
      readiness_state: "mixed",
      current_scene: currentScene,
      emotional_intensity: emotionalIntensity === "low" ? "medium" : emotionalIntensity,
      user_requested_solution: false,
      recommended_response_mode: "reflection_mode",
      reason: "用户有情绪，也开始观察自己或关系里的具体点。"
    };
  }

  if (emotionalIntensity !== "low") {
    return {
      readiness_state: "mixed",
      current_scene: "open_topic",
      emotional_intensity: emotionalIntensity,
      user_requested_solution: false,
      recommended_response_mode: "reflection_mode",
      reason: "情绪存在，但不把回复停在安抚，顺着用户话题轻轻展开。"
    };
  }

  return {
    readiness_state: "mixed",
    current_scene: "daily_chat",
    emotional_intensity: "low",
    user_requested_solution: false,
    recommended_response_mode: "reflection_mode",
    reason: "信息还少，先低压承接并给表达入口。"
  };
}

function detectFunctionalRuntimeState(message) {
  const intent = detectFunctionalIntent(message);
  const emotionalIntensity = detectIntensity(message);
  const signals = detectUserSignals(message);

  return {
    readiness_state: intent.intent === "plan" || intent.intent === "decision" ? "action_ready" : "rational",
    current_scene: intent.intent,
    emotional_intensity: emotionalIntensity,
    user_requested_solution: intent.intent !== "general_help" && intent.intent !== "info_capture",
    recommended_response_mode: intent.mode,
    functional_intent: intent.intent,
    functional_label: intent.label,
    user_signals: signals,
    reason: "功能模式：优先识别用户信息和任务意图，再选择处理方式。"
  };
}

function buildPersonaHint(persona, secondaryPersona, personaResult = {}) {
  if (!persona || personaResult.status === "rejected") return "";
  const secondary = secondaryPersona ? `，也带一点「${secondaryPersona.name}」的影子` : "";
  return `我会按「${persona.name}」的陪伴偏好轻轻靠近${secondary}。`;
}

function buildCompanionReply(message, persona, personaResult) {
  const topic = detectTopicExpansion(message);

  if (persona?.id === "silent_repairer" || includesAny(message, ["不想说", "不想解释", "反正就那样"])) {
    return [
      "好，那就先不说。",
      "你不用把它讲完整，也不用现在解释给我听。",
      "我在这儿，先陪你安静一会儿。"
    ].join("\n");
  }

  if (includesAny(message, ["废", "什么都没做", "自责"])) {
    return [
      "我不想跟着你一起把今天判成“我很废”。",
      "什么都没做之后，那种空下来又开始怪自己的感觉，会很难受。",
      `${topic.question}`
    ].join("\n");
  }

  if (includesAny(message, ["撑不住", "绷不住", "崩溃"])) {
    return [
      "你说到这个程度，应该不是普通的“有点烦”。",
      topic.focus,
      topic.observation,
      topic.question
    ].join("\n");
  }

  return [
    "我听到的不是一句泛泛的难受。",
    topic.focus,
    topic.observation,
    topic.question
  ].join("\n");
}

function buildReflectionReply(message, persona) {
  const topic = detectTopicExpansion(message);

  if (includesAny(message, ["太敏感", "想太多"])) {
    if (includesAny(message, ["冷淡", "消息", "她", "他"])) {
      return [
        "我不太想马上把它归成你想太多。",
        "这里面可能有两部分：一部分是对方的回复确实让你感觉冷，另一部分是你开始担心关系是不是变了。",
        "你可以把那句话原样发我。我们先只看文字和语气，不急着替谁定性。"
      ].join("\n");
    }

    return [
      "“太敏感”这个词有点太快了。",
      "有时候不是你反应太大，而是某句话刚好碰到了你很在意的地方。",
      "你可以把那句话原样丢给我，我们一起看看它到底刺在哪里。"
    ].join("\n");
  }

  if (includesAny(message, ["启动不了", "动不起来", "知道要做"])) {
    return [
      "这不一定是你懒。",
      "更像是那件事的入口太大了，你一想到要开始，就已经先被压住了。",
      "我们可以不做完整计划。要不要只把它拆成一个 3 分钟能碰一下的动作？"
    ].join("\n");
  }

  if (includesAny(message, ["冷淡", "不开心", "很烦", "怕显得"])) {
    return [
      "你不是单纯想追问对方，你是在担心：如果问了，会不会显得自己太用力。",
      "先不直接判断对方是不是不开心，也不把这件事都揽到你身上。",
      "可以先用一个不压人的版本：",
      "“我感觉你刚刚好像有点累，如果是我理解错了也没关系。只是想确认一下，你还好吗？”"
    ].join("\n");
  }

  if (includesAny(message, ["香薰", "心情不好", "花钱", "冲动", "怕后悔"])) {
    return [
      "这里面可能不只是“想买这个东西”，也有一点想让今天的自己好受一点。",
      "这不丢人，也不代表你乱花钱。审美和一点舒服感，对你也可能是真的重要。",
      "我更想先问一句：你纠结的是价格和值不值，还是它刚好像一种“让我今天好过一点”的补偿？"
    ].join("\n");
  }

  if (includesAny(message, ["猫", "睡不好"])) {
    return [
      "它晚上一直叫，你被吵醒之后还要接着撑第二天，这会很消耗。",
      "我先不只把它当成宠物问题看，也把你的睡不好一起放进来。",
      "如果你愿意，我可以先记一下：你家里有猫。以后聊到睡眠、生活节奏或者买东西，我会把这点考虑进去，可以吗？"
    ].join("\n");
  }

  return [
    topic.focus,
    topic.observation,
    topic.question
  ].join("\n");
}

function buildAnalysisReply(message, persona) {
  if (includesAny(message, ["刷手机", "短视频", "停不下来"])) {
    return [
      "可以，我陪你拆。",
      "我先不把它简单归成“自控力差”。这件事大概有三层：",
      "第一，晚上终于没有外部要求了，人会本能地想找一点补偿。",
      "第二，刷手机很轻，不需要再做决定，所以它会变成最低成本的放松。",
      "第三，停下来以后，白天没处理完的压力会重新冒出来，所以你会更想继续刷。",
      "所以它不只是刷手机，也可能是在躲开那一下空下来。我们下一步可以只看一个点：你晚上最不想面对的，通常是哪类事情？"
    ].join("\n");
  }

  if (includesAny(message, ["拒绝", "愧疚"])) {
    return [
      "可以，我陪你拆一下。",
      "我先不把它说成“你太软”。更像是：你不是不知道自己不想答应，而是一想到对方可能失望，身体就先开始有压力。",
      "这里可能有两层：一层是你在保护关系，另一层是你把“拒绝”理解成了“伤害对方”。",
      "所以后面要练的不是变冷，而是找到一种温柔但不委屈自己的说法。"
    ].join("\n");
  }

  return [
    "可以，我陪你拆。",
    "先不急着判断谁对谁错，我会先把它分成少数几层来看。",
    "一层是事实：现在确实发生了什么。另一层是感受：它让你哪里不舒服。还有一层是担心：你害怕接下来会变成什么。",
    "如果只看现在的信息，我会先建议我们从事实开始。你把最关键的一句话或一个场景发我，我帮你理顺。"
  ].join("\n");
}

function buildActionReply(message, persona) {
  if (includesAny(message, ["要不要买", "包", "评价", "纠结"])) {
    return [
      "你现在不是缺信息，是信息已经太多了。",
      "我先帮你缩小到一个判断：如果它不是你这周就能想到 3 个搭配场景的包，先别急着买。",
      "这不是否定它，只是先帮你把后悔的概率降下来。"
    ].join("\n");
  }

  if (includesAny(message, ["沙发", "耐抓", "材质"])) {
    return [
      "我先确认一个实际信息：家里有没有宠物会抓沙发？",
      "这个会影响材质建议。",
      "如果不想说也没关系；不考虑宠物的话，我会优先看耐磨、好清洁和触感。"
    ].join("\n");
  }

  if (includesAny(message, ["怎么回复", "不想答应", "拒绝"])) {
    return [
      "你不是不知道要拒绝，是怕这个拒绝会让关系变僵。",
      "可以这样回：",
      "“我想了一下，这次我可能没办法答应你。不是不重视你，是我现在确实接不住这件事。”",
      "这句话保留了温度，也没有把自己再往里推。"
    ].join("\n");
  }

  if (includesAny(message, ["继续这个项目", "项目"])) {
    return [
      "如果只看你现在的状态，我不建议立刻放弃。",
      "但也不建议继续硬扛原方案。",
      "下一步只做一件事：把这个项目缩成一个 7 天内能验证的小版本。7 天后再决定要不要继续投入。"
    ].join("\n");
  }

  return [
    "好，那我们先不做大计划。",
    "你现在只做一件事：把最烦的那件事写成一句话。",
    "不用解决，不用解释完整。你发给我以后，我帮你拆第一步。"
  ].join("\n");
}

function buildFunctionalReply(message, runtimeState) {
  const signals = runtimeState.user_signals || [];
  const signalText = signals.length
    ? `我先识别到这些信息：${signals.map((item) => item.text).join("、")}。`
    : "我先按你这句话本身来判断。";

  if (runtimeState.functional_intent === "rewrite_or_generate") {
    return [
      signalText,
      "这更像是一个文本处理任务。我会先确认目标、语气和使用场景，再给你可直接用的版本。",
      "你把原文或想表达的意思发我；如果有对象、平台、语气要求，也一起带上。"
    ].join("\n");
  }

  if (runtimeState.functional_intent === "decision") {
    return [
      signalText,
      "这更像是一个决策问题。我会先帮你拆成：目的、成本、风险、后悔概率、是否符合你当前状态。",
      "你先告诉我两个候选项，或者把你纠结的点列出来，我会直接给一个倾向判断。"
    ].join("\n");
  }

  if (runtimeState.functional_intent === "plan") {
    return [
      signalText,
      "这更像是行动规划。我会把它处理成小步骤，不先讲大道理。",
      "你现在的目标是什么？如果已经有截止时间、限制条件或卡住的地方，也一起告诉我。"
    ].join("\n");
  }

  if (runtimeState.functional_intent === "analysis") {
    return [
      signalText,
      "这更像是分析问题。我会先分清事实、推测、风险和下一步。",
      "你把关键背景补两三句就行：发生了什么、你在意什么、现在最想判断哪一点？"
    ].join("\n");
  }

  if (runtimeState.functional_intent === "info_capture") {
    return [
      signalText,
      "这里可能有可以被长期记住的偏好或背景，但我不会直接替你确认。",
      "你希望我把它当成临时上下文，还是以后也记进你的陪伴偏好里？"
    ].join("\n");
  }

  if (runtimeState.functional_intent === "state_check") {
    return [
      signalText,
      "我判断这不是一个明确任务，更像是在告诉我你现在的状态。",
      "如果按功能处理，我会先帮你定位：是身体能量低、脑子负荷高，还是某件具体事在持续占用你。你想让我直接帮你分辨一下吗？"
    ].join("\n");
  }

  return [
    signalText,
    "我还需要一点上下文才能判断该走分析、决策、行动方案还是文本处理。",
    "你直接补一句目标就行：你是想让我帮你判断、写东西、做计划，还是整理原因？"
  ].join("\n");
}

function humanizeReply(reply) {
  let output = reply;
  bannedPhrases.forEach((phrase) => {
    output = output.replaceAll(phrase, "");
  });
  output = output.replaceAll("你应该", "可以先");
  output = output.replaceAll("建议你", "可以先");
  output = output.replaceAll("我们先不急着", "我们可以暂时不");
  output = output.replaceAll("先不急着", "暂时不");
  output = output.replaceAll("先别急着", "暂时别");
  output = output.replace(/\n{3,}/g, "\n\n").trim();
  return output;
}

function polishSignalText(text = "") {
  return text
    .replaceAll("出现时间线索", "这一段时间里的状态")
    .replaceAll("出现状态或情绪线索", "状态已经被压得有点低")
    .replaceAll("出现生活背景线索", "这里有生活背景需要一起考虑")
    .replaceAll("出现偏好或禁忌线索", "里面有你的偏好或边界");
}

function buildNaturalSignalLine(signals = "") {
  const text = polishSignalText(signals);
  if (text.includes("偏好") || text.includes("边界")) {
    return "这句话里有你的偏好和边界，我会先按这点来理解。";
  }
  if (text.includes("生活背景")) {
    return "这里有一些生活背景要一起考虑。";
  }
  if (text.includes("状态") && text.includes("这一段时间")) {
    return "我会把你这一段时间的状态也放进来，不只当成一个任务处理。";
  }
  if (text.includes("状态")) {
    return "我会先把你现在的状态也放进去看。";
  }
  return "我会先按你这句话里的具体信息来处理。";
}

function languagePolishPass(draft, context = {}) {
  let output = humanizeReply(String(draft || ""));
  const mode = context.conversation_mode === "functional" ? "functional" : "companion";

  output = output
    .replaceAll("我先按你这句话本身来判断。", "")
    .replace(/我先识别到这些信息：([^。]+)。/g, (_, signals) => {
      return buildNaturalSignalLine(signals);
    })
    .replaceAll("这更像是一个文本处理任务。", "这件事可以直接往可用版本上走。")
    .replaceAll("这更像是一个决策问题。", "那就不绕了，我们按决策来处理。")
    .replaceAll("这更像是行动规划。", "那就先把它落到小步骤里。")
    .replaceAll("这更像是分析问题。", "那我们就把它拆开看。")
    .replaceAll(
      "我判断这不是一个明确任务，更像是在告诉我你现在的状态。",
      "这不像是在要一个方案，更像是在告诉我：你现在的状态已经有点顶不住了。"
    )
    .replaceAll("如果按功能处理，我会先帮你定位：", "如果按功能模式处理，我会帮你分清：")
    .replaceAll(
      "我会先确认目标、语气和使用场景，再给你可直接用的版本。",
      "我先确认目标、语气和使用场景，再给你一版能直接发的。"
    )
    .replaceAll("我会先帮你拆成：", "我会帮你拆成：")
    .replaceAll(
      "你先告诉我两个候选项，或者把你纠结的点列出来，我会直接给一个倾向判断。",
      "你把候选项或纠结点丢给我就行，我会直接给倾向判断。"
    )
    .replaceAll("我会把它处理成小步骤，不先讲大道理。", "我会把它拆成小步骤，不讲大道理。")
    .replaceAll("你把关键背景补两三句就行：", "你补两三句背景就够：")
    .replaceAll(
      "这里可能有可以被长期记住的偏好或背景，但我不会直接替你确认。",
      "这里可能有一条值得记住的偏好或背景，但我不会替你擅自确认。"
    )
    .replaceAll("这件事像是卡在工作/项目里", "听起来，你像是被工作/项目卡住了")
    .replaceAll("这里面像是有一段关系让你悬着", "这段关系好像让你一直悬着")
    .replaceAll("你现在像是能量被压得很低", "你现在的能量像是被压得很低")
    .replaceAll("你这句话不像只是随口一说", "这句话不像只是随口一说");

  if (mode === "functional") {
    output = output
      .replaceAll("功能模式：", "")
      .replaceAll("状态识别", "状态分辨")
      .replaceAll("普通协助", "先把目标弄清楚");
  }

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildPromptContext(payload = {}, runtimeState, persona, secondaryPersona) {
  const message = String(payload.message || "").trim();
  const conversationMode = payload.conversation_mode === "functional" ? "functional" : "companion";
  const profile = payload.user_profile || {};
  const remotePromptExtra = payload.remote_config?.prompt_extra;
  const recentMessages = Array.isArray(payload.recent_messages) ? payload.recent_messages.slice(-6) : [];
  const personaTone = [
    persona?.core_temperament,
    ...(persona?.support_methods || []).slice(0, 3)
  ]
    .filter(Boolean)
    .join("；");
  const secondaryTone = secondaryPersona?.core_temperament
    ? `可轻微参考另一种倾向：${secondaryPersona.core_temperament}`
    : "";

  return [
    "请直接回复用户，不要输出分析过程。",
    "",
    "先把下面信息当作观察材料，而不是必须逐条执行的脚本。",
    `用户刚刚说：${message}`,
    "",
    "本轮状态判断：",
    `- conversation_mode: ${conversationMode}`,
    `- readiness_state: ${runtimeState.readiness_state}`,
    `- response_mode: ${runtimeState.recommended_response_mode}`,
    `- scene: ${runtimeState.current_scene}`,
    `- intensity: ${runtimeState.emotional_intensity}`,
    runtimeState.functional_intent ? `- functional_intent: ${runtimeState.functional_intent}` : "",
    runtimeState.user_signals?.length
      ? `- user_signals: ${JSON.stringify(runtimeState.user_signals)}`
      : "",
    "",
    "用户的陪伴偏好，隐性参考即可，不要复述标签：",
    personaTone ? `- ${personaTone}` : "- 低压、具体、自然，不急着推动。",
    secondaryTone ? `- ${secondaryTone}` : "",
    profile.communication_preference
      ? `- 沟通偏好：${JSON.stringify(profile.communication_preference)}`
      : "",
    recentMessages.length
      ? `最近对话片段：${JSON.stringify(recentMessages)}`
      : "",
    "",
    conversationMode === "functional"
      ? "当前是功能模式：优先识别用户提供的信息、任务意图和隐含约束，自己判断该分析、决策、行动规划、文本处理还是继续追问。回复要更直接、更可执行；保留温度，但不要把情绪安抚放在主位。"
      : "当前是陪伴模式：优先让用户感觉被听见，再顺着话题展开；不要急着变成工具。", 
    "生成方式必须分两步：先在心里生成一个内容草稿，再做 Language Polish Pass，只输出润色后的最终回复。",
    "Language Polish Pass 的目标：把配置味、报告味、标签味改成自然口语；保留判断，但让句子有停顿、有呼吸、有真实对话感。",
    "最终回复不要直接复述配置词，例如“低压、温柔、情绪态、功能模式、识别到线索”。这些只能在内部影响表达。",
    "回复时请像真的听懂了这句话：抓住一个具体细节或隐含矛盾，给出自然回应。",
    "降低画像、人格和情绪配置的权重：它们只决定靠近方式，不决定内容。内容必须来自用户刚刚说的话。",
    "每次回复都要有一点“展开话题”的能力：指出一个可继续聊的线索，再问一个具体、低压、能回答的问题。",
    "不要为了显得温柔而套用固定开头，比如反复说“先不急着”。",
    "如果用户只是情绪表达，可以短一点、有呼吸感，但不要只停在安抚；要顺着人、事、关系、选择、身体状态或卡点展开。",
    "配置是方向盘，不是铁轨。若规则让表达变僵，优先自然、具体、有判断力。",
    remotePromptExtra ? `云端补充提示：${remotePromptExtra}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function detectMemoryUpdate(message, runtimeState) {
  if (runtimeState.emotional_intensity === "high") {
    return { should_update: false, reason: "情绪强度高时不做画像更新弹窗。" };
  }

  if (includesAny(message, ["猫"])) {
    return {
      should_update: true,
      field_path: "pet_profile",
      confidence: "high",
      needs_user_confirmation: true,
      confirmation_copy: "我可以记住你家里有猫吗？以后聊到睡眠、生活节奏或购买选择时，我会把这点考虑进去。"
    };
  }

  if (includesAny(message, ["刷手机", "短视频", "停不下来"])) {
    return {
      should_update: true,
      field_path: "emotion_pattern.coping_style",
      confidence: "medium",
      needs_user_confirmation: true,
      confirmation_copy: "我注意到晚上刷手机停不下来可能是你最近的一个消耗点，要先记一下吗？"
    };
  }

  if (includesAny(message, ["冷淡", "太敏感", "想太多"])) {
    return {
      should_update: true,
      field_path: "emotion_pattern.triggers",
      confidence: "medium",
      needs_user_confirmation: true,
      confirmation_copy: "关系里对方回复冷淡时，你可能会更容易不安。这个要先记进陪伴偏好吗？"
    };
  }

  return { should_update: false };
}

function generateChatRuntime(payload = {}) {
  const message = String(payload.message || "").trim();
  const conversationMode = payload.conversation_mode === "functional" ? "functional" : "companion";
  const personaResult = payload.persona_result || {};
  const persona = getPersona(personaResult);
  const secondaryPersona = getSecondaryPersona(personaResult);
  const runtimeState = conversationMode === "functional"
    ? detectFunctionalRuntimeState(message)
    : detectReadinessState(message);

  let reply;
  if (conversationMode === "functional") {
    reply = buildFunctionalReply(message, runtimeState);
  } else if (runtimeState.recommended_response_mode === "companion_mode") {
    reply = buildCompanionReply(message, persona, personaResult);
  } else if (runtimeState.recommended_response_mode === "reflection_mode") {
    reply = buildReflectionReply(message, persona, personaResult);
  } else if (runtimeState.recommended_response_mode === "analysis_mode") {
    reply = buildAnalysisReply(message, persona, personaResult);
  } else {
    reply = buildActionReply(message, persona, personaResult);
  }

  const personaHint = buildPersonaHint(persona, secondaryPersona, personaResult);
  const assistantReply = languagePolishPass(reply, {
    message,
    conversation_mode: conversationMode,
    runtime_state: runtimeState
  });
  const promptContext = buildPromptContext(payload, runtimeState, persona, secondaryPersona);

  return {
    ok: true,
    provider: "local-runtime-mock",
    model_slot: "reserved_for_real_model_api",
    runtime_state: runtimeState,
    conversation_mode: conversationMode,
    response_mode: runtimeState.recommended_response_mode,
    persona_guidance: personaHint,
    prompt_context: promptContext,
    memory_update_suggestion: detectMemoryUpdate(message, runtimeState),
    draft_message: reply,
    language_polish_applied: true,
    message: assistantReply
  };
}

module.exports = { generateChatRuntime, detectReadinessState, humanizeReply, languagePolishPass };
