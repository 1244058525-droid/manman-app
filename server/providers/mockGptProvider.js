const { generateChatRuntime } = require("../services/chatRuntimeService");

function getMockCompanionReply(payload = {}) {
  return generateChatRuntime(payload);
}

module.exports = { getMockCompanionReply };
