const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname, "../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const MODEL_CONFIG_FILE = path.join(DATA_DIR, "modelConfig.json");
const REMOTE_CONFIG_FILE = path.join(DATA_DIR, "remoteConfig.json");
const LOCAL_SECRETS_FILE = path.join(DATA_DIR, "localSecrets.json");

const defaultModelConfig = {
  provider: "local",
  conversation_mode: "companion",
  model: "local-runtime-mock",
  api_key_env: "OPENAI_API_KEY",
  endpoint: "https://api.openai.com/v1/chat/completions",
  temperature: 0.7,
  max_tokens: 700,
  use_real_model: false,
  system_rule_summary:
    "画像、人格和情绪态只是参考，权重低于用户当下这句话。先抓住用户话里的具体线索，再自然展开话题：可以承接情绪，但不要只安抚；可以轻轻追问，但问题要具体、低压、容易回答。生成时分两步：先形成内容草稿，再做语言润色，只输出最终润色版。不要把配置词、模式名、识别过程直接写给用户。避免客服腔、报告腔、心理诊断和固定模板。",
  updated_at: null
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(filePath, fallback) {
  ensureDataDir();
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
}

function writeJson(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function getUsers() {
  return readJson(USERS_FILE, {});
}

function saveUsers(users) {
  writeJson(USERS_FILE, users);
}

function getUser(userId = "local-demo-user") {
  const users = getUsers();
  return users[userId] || null;
}

function deleteUser(userId = "local-demo-user") {
  const users = getUsers();
  delete users[userId];
  saveUsers(users);
  return true;
}

function upsertUser(userId = "local-demo-user", patch = {}) {
  const users = getUsers();
  const current = users[userId] || {
    user_id: userId,
    onboarding_completed: false,
    questionnaire_submitted: false,
    result_saved: false,
    conversations: []
  };
  users[userId] = {
    ...current,
    ...patch,
    updated_at: new Date().toISOString()
  };
  saveUsers(users);
  return users[userId];
}

function appendConversationMessage(userId, conversationId, message) {
  const user = getUser(userId) || upsertUser(userId);
  const conversations = Array.isArray(user.conversations) ? user.conversations : [];
  const conversation =
    conversations.find((item) => item.conversation_id === conversationId) ||
    { conversation_id: conversationId, messages: [], created_at: new Date().toISOString() };

  if (!conversations.includes(conversation)) conversations.push(conversation);
  conversation.messages.push({ ...message, created_at: new Date().toISOString() });
  upsertUser(userId, { conversations });
  return conversation;
}

function getRecentConversationMessages(userId, conversationId, limit = 8) {
  const user = getUser(userId);
  const conversations = Array.isArray(user?.conversations) ? user.conversations : [];
  const conversation = conversations.find((item) => item.conversation_id === conversationId);
  if (!conversation || !Array.isArray(conversation.messages)) return [];
  return conversation.messages.slice(-limit).map((item) => ({
    role: item.role,
    content: item.content
  }));
}

function getModelConfig() {
  const localSecrets = readJson(LOCAL_SECRETS_FILE, {});
  return {
    ...defaultModelConfig,
    ...readJson(MODEL_CONFIG_FILE, {}),
    api_key: localSecrets.api_key || null
  };
}

function saveModelConfig(config = {}) {
  const current = getModelConfig();
  const next = {
    ...current,
    ...config,
    conversation_mode: ["companion", "functional"].includes(config.conversation_mode)
      ? config.conversation_mode
      : current.conversation_mode || "companion",
    use_real_model: Boolean(config.use_real_model),
    temperature: Number(config.temperature ?? current.temperature),
    max_tokens: Number(config.max_tokens ?? current.max_tokens),
    updated_at: new Date().toISOString()
  };
  writeJson(MODEL_CONFIG_FILE, next);
  return next;
}

const defaultRemoteConfig = {
  welcome_slogan: "慢慢说，我会慢慢懂你。",
  intro_lines_json: JSON.stringify([
    "慢慢是一款会逐渐认识你的AI陪伴产品",
    "它不急着给你答案",
    "而是先理解你的状态，再用适合你的方式",
    "陪你聊天、整理情绪、靠近下一步"
  ]),
  chat_placeholder: "把现在想说的话放到这里",
  composer_note: "慢慢不是心理诊断工具。它会陪你整理，但重要风险请及时寻求现实支持。",
  prompt_extra: "降低情绪配置和画像配置的权重。回复内容优先来自用户刚刚说的话：抓一个具体线索，给一点真实回应，再自然抛出一个可继续聊的问题。输出前做一遍语言润色，把配置味、报告味、识别过程改成自然口语。",
  questionnaire_overrides_json: "{}",
  remote_notice_success: "已同步云端配置。",
  remote_notice_failure: "暂时使用本地默认配置。"
};

function getRemoteConfig() {
  return { ...defaultRemoteConfig, ...readJson(REMOTE_CONFIG_FILE, {}) };
}

function saveRemoteConfig(values = {}) {
  const current = getRemoteConfig();
  const next = { ...current, ...values, updated_at: new Date().toISOString() };
  writeJson(REMOTE_CONFIG_FILE, next);
  return next;
}

module.exports = {
  appendConversationMessage,
  deleteUser,
  getModelConfig,
  getRecentConversationMessages,
  getRemoteConfig,
  getUser,
  saveModelConfig,
  saveRemoteConfig,
  upsertUser
};
