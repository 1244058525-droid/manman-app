const http = require("http");
const fs = require("fs");
const path = require("path");
const { getQuestionnaireConfig } = require("./services/questionnaireService");
const { buildPersonaResult } = require("./services/personaService");
const {
  generateCompanionResponse,
  sanitizeModelConfig,
  testModelConnection
} = require("./services/modelRuntimeService");
const {
  appendConversationMessage,
  deleteUser,
  getModelConfig,
  getRecentConversationMessages,
  getRemoteConfig,
  getUser,
  saveModelConfig,
  saveRemoteConfig,
  upsertUser
} = require("./services/storageService");

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT, "app");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("请求内容太大"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("请求格式不是有效 JSON"));
      }
    });
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const rawPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const safePath = path.normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(APP_DIR, safePath);

  if (!filePath.startsWith(APP_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const contentType = mimeTypes[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/onboarding/questionnaire") {
      sendJson(res, 200, getQuestionnaireConfig());
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/onboarding/submit") {
      const payload = await readBody(req);
      const userId = payload.user_id || "local-demo-user";
      const result = buildPersonaResult(payload.answers || {});
      if (result.ok) {
        upsertUser(userId, {
          user_id: userId,
          questionnaire_submitted: true,
          onboarding_completed: true,
          result_saved: false,
          answers: payload.answers || {},
          persona_result: result.persona_result,
          user_profile: result.profile_patch,
          result_page: result.result_page,
          pending_persona_result: result.persona_result,
          pending_profile_patch: result.profile_patch,
          pending_result_page: result.result_page
        });
      }
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/onboarding/save-result") {
      const payload = await readBody(req);
      const userId = payload.user_id || "local-demo-user";
      const user = getUser(userId) || {};
      const userAction = payload.user_action || payload.action || "save";

      if (userAction === "skip") {
        const saved = upsertUser(userId, {
          user_id: userId,
          onboarding_completed: true,
          result_saved: false,
          persona_result: {
            primary_persona_id: "fog_organizer",
            primary_persona_name: "雾中整理者",
            secondary_persona_id: null,
            secondary_persona_name: null,
            confidence: "low",
            status: "default",
            user_visible: true
          },
          user_profile: {
            communication_preference: {
              preferred_role: "gentle_organizer",
              response_length: "medium",
              recovery_need: "陪伴"
            }
          }
        });
        sendJson(res, 200, { ok: true, next_route: "/chat", user: saved });
        return;
      }

      const personaResult = payload.persona_result || user.pending_persona_result || {};
      if (userAction === "reject_persona_name") {
        personaResult.status = "rejected";
      }

      const saved = upsertUser(userId, {
        user_id: userId,
        onboarding_completed: true,
        result_saved: userAction !== "reject_persona_name",
        persona_result: personaResult,
        user_profile: payload.profile_patch || user.pending_profile_patch || {},
        result_page: payload.result_page || user.pending_result_page || null
      });

      sendJson(res, 200, { ok: true, next_route: "/chat", user: saved });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/admin/model-config") {
      sendJson(res, 200, { ok: true, config: sanitizeModelConfig(getModelConfig()) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/model-config") {
      const payload = await readBody(req);
      sendJson(res, 200, { ok: true, config: sanitizeModelConfig(saveModelConfig(payload.config || payload)) });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/admin/remote-config") {
      sendJson(res, 200, { ok: true, config: getRemoteConfig() });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/remote-config") {
      const payload = await readBody(req);
      sendJson(res, 200, { ok: true, config: saveRemoteConfig(payload.config || payload) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/model-test") {
      const payload = await readBody(req);
      try {
        sendJson(res, 200, await testModelConnection(payload.message));
      } catch (error) {
        sendJson(res, 502, {
          ok: false,
          error: error.message || "模型测试失败",
          config: sanitizeModelConfig(getModelConfig())
        });
      }
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/user/profile") {
      const userId = url.searchParams.get("user_id") || "local-demo-user";
      sendJson(res, 200, { ok: true, user: getUser(userId) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/user/reset") {
      const payload = await readBody(req);
      const userId = payload.user_id || "local-demo-user";
      deleteUser(userId);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && (url.pathname === "/api/chat" || url.pathname === "/api/chat/message")) {
      const payload = await readBody(req);
      const userId = payload.user_id || "local-demo-user";
      const conversationId = payload.conversation_id || "local-demo-conversation";
      const user = getUser(userId) || {};
      const message = String(payload.message || "").trim();

      if (!message) {
        sendJson(res, 400, { ok: false, error: "消息不能为空" });
        return;
      }

      appendConversationMessage(userId, conversationId, { role: "user", content: message });
      const result = await generateCompanionResponse({
        ...payload,
        message,
        persona_result: payload.persona_result || user.persona_result || user.pending_persona_result,
        user_profile: payload.user_profile || user.user_profile || user.pending_profile_patch,
        recent_messages: getRecentConversationMessages(userId, conversationId, 8)
      });
      appendConversationMessage(userId, conversationId, { role: "assistant", content: result.message });

      sendJson(res, 200, {
        ...result,
        assistant_reply: result.message
      });
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 400, { error: error.message || "请求处理失败" });
  }
});

if (process.env.VERCEL) {
  module.exports = server;
} else {
  server.listen(PORT, HOST, () => {
    console.log(`慢慢后端已启动：http://${HOST}:${PORT}`);
  });
}
