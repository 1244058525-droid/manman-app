const { generateChatRuntime, languagePolishPass } = require("./chatRuntimeService");
const { getModelConfig } = require("./storageService");

function readAssistantMessage(data, fallbackMessage) {
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === "string" ? item : item.text || item.content || ""))
      .join("")
      .trim();
  }
  return fallbackMessage;
}

async function callOpenAICompatible(config, promptContext, fallbackMessage, polishContext = {}) {
  const apiKey = config.api_key || process.env[config.api_key_env || "OPENAI_API_KEY"];
  if (!apiKey) {
    return {
      provider: "local-runtime-mock",
      model: "local-runtime-mock",
      message: fallbackMessage,
      warning: `没有找到环境变量 ${config.api_key_env || "OPENAI_API_KEY"}，已使用本地规则回复。`
    };
  }

  const previousTlsSetting = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  const shouldRelaxTls =
    config.provider === "mimo" && config.allow_insecure_tls_for_local_dev === true;

  const headers = {
    "Content-Type": "application/json"
  };

  if (config.provider === "mimo") {
    headers["api-key"] = apiKey;
    headers.Authorization = `Bearer ${apiKey}`;
  } else {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  if (config.provider === "openrouter") {
    headers["HTTP-Referer"] = "http://127.0.0.1:8787";
    headers["X-Title"] = "Manman AI Companion MVP";
  }

  const body = {
    model: config.model,
    temperature: Number(config.temperature ?? 0.7),
    messages: [
      {
        role: "system",
        content: config.system_rule_summary
      },
      {
        role: "user",
        content: promptContext
      }
    ]
  };

  if (config.provider === "mimo") {
    body.max_completion_tokens = Number(config.max_tokens ?? 700);
  } else {
    body.max_tokens = Number(config.max_tokens ?? 700);
  }

  const endpoints = Array.from(
    new Set([
      config.endpoint || "https://api.openai.com/v1/chat/completions",
      ...(Array.isArray(config.fallback_endpoints) ? config.fallback_endpoints : [])
    ])
  );
  const errors = [];
  let data = null;

  try {
    if (shouldRelaxTls) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          const text = await response.text();
          const message = `${endpoint} 返回 ${response.status}: ${text.slice(0, 180)}`;
          errors.push(message);
          if (response.status === 401 || response.status === 403) break;
          continue;
        }

        data = await response.json();
        break;
      } catch (error) {
        errors.push(`${endpoint} 请求失败: ${error.cause?.code || error.message}`);
      }
    }
  } finally {
    if (shouldRelaxTls) {
      if (previousTlsSetting === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousTlsSetting;
      }
    }
  }

  if (!data) {
    throw new Error(`模型接口调用失败：${errors.join("；")}`);
  }
  const rawMessage = readAssistantMessage(data, fallbackMessage);
  return {
    provider: config.provider,
    model: config.model,
    message: languagePolishPass(rawMessage || fallbackMessage, polishContext),
    raw: data
  };
}

async function generateCompanionResponse(payload = {}) {
  const config = getModelConfig();
  const localRuntime = generateChatRuntime({
    ...payload,
    conversation_mode: config.conversation_mode || "companion"
  });

  if (!config.use_real_model || config.provider === "local") {
    return {
      ...localRuntime,
      provider: "local-runtime-mock",
      model_config: sanitizeModelConfig(config)
    };
  }

  try {
    const modelResult = await callOpenAICompatible(config, localRuntime.prompt_context, localRuntime.message, {
      message: payload.message,
      conversation_mode: config.conversation_mode || "companion",
      runtime_state: localRuntime.runtime_state
    });
    return {
      ...localRuntime,
      provider: modelResult.provider,
      model_slot: modelResult.model,
      message: modelResult.message,
      model_warning: modelResult.warning || null,
      model_config: sanitizeModelConfig(config)
    };
  } catch (error) {
    return {
      ...localRuntime,
      provider: "model-error",
      model_slot: config.model,
      message: `MiMo 模型暂时没有连上：${error.message}`,
      model_warning: error.message,
      model_config: sanitizeModelConfig(config)
    };
  }
}

async function testModelConnection(testMessage = "只回复：配置测试成功") {
  const config = getModelConfig();
  const result = await callOpenAICompatible(
    config,
    [
      "这是一条模型连通性测试。",
      "请不要解释，不要输出多余内容。",
      `用户测试消息：${testMessage}`
    ].join("\n"),
    "",
    { conversation_mode: config.conversation_mode || "companion" }
  );

  return {
    ok: true,
    provider: result.provider,
    model: result.model,
    message: result.message,
    model_config: sanitizeModelConfig(config)
  };
}

function sanitizeModelConfig(config) {
  return {
    provider: config.provider,
    conversation_mode: config.conversation_mode || "companion",
    model: config.model,
    api_key_env: config.api_key_env,
    endpoint: config.endpoint,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
    use_real_model: config.use_real_model,
    system_rule_summary: config.system_rule_summary,
    fallback_endpoints: config.fallback_endpoints || [],
    allow_insecure_tls_for_local_dev: config.allow_insecure_tls_for_local_dev === true,
    updated_at: config.updated_at
  };
}

module.exports = { generateCompanionResponse, sanitizeModelConfig, testModelConnection };
