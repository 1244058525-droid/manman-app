# HOW_TO_EMBED_MARKDOWN_IN_MODEL.md - 如何把 Markdown 嵌入模型

## 先说结论

这些 Markdown 文件不是“训练模型”的材料。

MVP 阶段，不建议微调模型，也不建议一开始做复杂技术。

更现实的方法是：

> 把 Markdown 当作“产品说明书 / prompt 规则库”，在每次模型回复前，按需加载给模型。

你可以把它理解成：

- `SOUL.md`：长期固定系统规则；
- `READINESS_DETECTOR.md`：判断用户当前状态；
- `RESPONSE_MODES.md`：选择回复模式；
- `HUMANIZE_PASS.md`：最后去 AI 味；
- `USER_PERSONA_YAML`：每个用户自己的画像；
- `PUSH_MESSAGE_STYLE.md`：主动消息场景才调用。

---

## 一、最小 MVP 接入方法

适合你现在这种“懂基础 agent，不懂技术”的阶段。

### 方式

用 Agent 平台或低代码工作流，把 Markdown 粘贴到不同模块中：

1. 系统提示词模块：放 `SOUL.md` 的压缩版。
2. 状态判断模块：放 `READINESS_DETECTOR.md`。
3. 回复生成模块：放 `RESPONSE_MODES.md` + 用户画像 YAML。
4. 改写模块：放 `HUMANIZE_PASS.md`。
5. 用户画像存储：先用表格、Notion、数据库或平台变量存储 YAML。

### 工作流

```text
用户发消息
↓
模块 1：判断 readiness_state
↓
模块 2：读取用户画像
↓
模块 3：按 response_mode 生成回复
↓
模块 4：HUMANIZE_PASS 改写
↓
输出给用户
↓
模块 5：判断是否更新用户画像
```

这就是最小可执行版本。

---

## 二、未来手机 App 的标准架构

手机 App 不应该直接把全部 Markdown 塞在用户手机里跑。

更推荐：

```text
手机 App 前端
↓
你的后端服务
↓
读取用户画像 + 规则文件
↓
调用大模型 API
↓
返回回复给 App
↓
保存对话摘要和画像更新
```

### 为什么需要后端

1. 保护模型 API Key。
2. 管理每个用户的画像。
3. 控制每次加载哪些 Markdown。
4. 降低 token 成本。
5. 做安全过滤和日志。
6. 后续方便更新规则，不需要用户重新下载 App。

---

## 三、每次请求应该加载什么

不要每次把所有 Markdown 都塞给模型，成本会高，也容易混乱。

建议分层加载。

### 永远加载：核心短规则

每次都加载压缩版：

- SOUL 核心原则
- readiness_state 判断标准
- 当前用户画像摘要
- 本轮回复要求

### 按需加载：场景规则

只有对应场景才加载：

| 场景 | 加载内容 |
|---|---|
| 情绪倾诉 | `READINESS_DETECTOR.md` 中 emotional / mixed 部分 |
| 用户要求分析 | `RESPONSE_MODES.md` 中 analysis_mode |
| 用户要求行动 | `RESPONSE_MODES.md` 中 action_mode |
| 主动推送 | `PUSH_MESSAGE_STYLE.md` |
| 语言改写 | `HUMANIZE_PASS.md` |

### 用户画像

每次只加载当前需要的字段。

比如：

情绪倾诉：

```yaml
emotion_pattern
communication_preference
ideal_self
runtime_state
```

消费选择：

```yaml
decision_pattern
aesthetic_value
communication_preference
runtime_state
```

拖延执行：

```yaml
action_barrier
communication_preference
ideal_self
runtime_state
```

---

## 四、推荐的 App 后端流程

### Step 1：用户发来消息

App 发送：

```json
{
  "user_id": "123",
  "message": "我今天又刷了两个小时短视频，感觉自己好废"
}
```

### Step 2：后端读取用户画像

后端根据 `user_id` 读取该用户的画像 YAML。

### Step 3：判断 readiness_state

用一个小模型调用，或者同一个模型的第一步，判断：

```yaml
runtime_state:
  readiness_state: emotional
  current_scene: 情绪倾诉
  emotional_intensity: medium
  user_requested_solution: false
  recommended_response_mode: companion_mode
```

### Step 4：生成回复

给模型传入：

```text
SOUL 核心原则
+
READINESS_DETECTOR 对应状态
+
RESPONSE_MODES 对应模式
+
用户画像相关字段
+
用户消息
```

### Step 5：去 AI 味

再调用一次模型，或者同一次输出前要求执行 `HUMANIZE_PASS`。

### Step 6：返回给 App

App 只展示最终回复。

### Step 7：画像更新

对话结束后，让模型判断是否有新信息需要更新画像。

比如：

```yaml
memory_update:
  should_update: true
  field: emotion_pattern.triggers
  new_value: "睡前刷短视频后容易自责"
  confidence: medium
  ask_user_confirmation: true
```

推荐 MVP 阶段让用户确认：

> “我刚刚更了解你一点：你睡前刷完短视频后容易自责。要把这点加入你的陪伴画像吗？”

---

## 五、Markdown 到模型的三种技术方式

### 方式 A：直接拼进 prompt

适合 MVP。

优点：

- 最简单；
- 不需要复杂技术；
- 适合测试产品感觉。

缺点：

- token 成本较高；
- 文件多了会乱。

使用方式：

```text
system_prompt = SOUL.md 精简版
developer_prompt = READINESS_DETECTOR + RESPONSE_MODES
user_context = 用户画像 YAML
user_message = 用户输入
```

---

### 方式 B：规则库检索 RAG

适合中期。

把 Markdown 切成小块，存到向量库或普通规则库里。

每次根据场景只取相关片段。

优点：

- 成本更低；
- 可扩展；
- 规则文件可以越来越多。

缺点：

- 需要一点技术实现。

---

### 方式 C：微调 / 本地模型

不建议 MVP 阶段做。

适合产品验证成功后，再考虑。

原因：

- 成本高；
- 调试慢；
- 风格容易固化；
- 你现在最重要的是验证用户是否喜欢这套体验，而不是训练模型。

---

## 六、推荐给你的实际落地方案

### 第 1 阶段：Agent / 低代码验证

先用：

- Markdown 文件；
- 表单收集用户画像；
- Agent 工作流；
- 用户画像 YAML；
- 手动或半自动更新画像。

目标：验证“陪伴感”和“画像驱动回复”是否成立。

### 第 2 阶段：Web Demo

做一个简单网页：

- 登录；
- 首次画像测试；
- 聊天页面；
- 用户画像后台存储；
- 简单主动消息模拟。

目标：验证留存和真实使用频率。

### 第 3 阶段：手机 App

App 负责：

- 聊天界面；
- 推送通知；
- 语音输入；
- 画像查看与修改；
- 主动消息设置。

后端负责：

- 调用模型；
- 存储画像；
- 规则加载；
- 记忆更新；
- 安全过滤；
- 推送触发。

---

## 七、最推荐的系统 Prompt 组织方式

每次请求可以组织为：

```text
[System]
你是一个陪伴优先的 AI。严格遵守 SOUL 核心原则：情绪态不解决，混合态不下定义，理性态可分析，行动态才给方案。

[Developer]
根据 READINESS_DETECTOR 判断用户状态。
根据 RESPONSE_MODES 选择回复模式。
根据 HUMANIZE_PASS 做最终改写。
不要直接给用户下定义。
不要急着解决情绪需求。

[User Profile]
这里放用户画像 YAML 的相关字段。

[Conversation]
这里放最近几轮对话。

[User]
用户本轮输入。
```

---

## 八、核心技术提醒

### 不要把 Markdown 当作“知识库文章”

这些文件不是给用户看的普通文档，而是给模型看的行为规则。

所以后续要做两版：

1. **完整版**：给团队维护。
2. **压缩版**：给模型每次调用。

### 不要一次塞全部

每次只加载必要规则。

### 不要把用户全部历史都塞进去

长期记忆要结构化成画像字段，而不是无限堆聊天记录。

### 不要一开始微调

你的核心壁垒不是模型参数，而是：

- 用户画像结构；
- 情绪 / 理性切换机制；
- 陪伴语言系统；
- 动态记忆更新。

---

## 九、一句话架构

> 手机 App 是入口，后端是大脑，Markdown 是人格和规则，用户画像是长期记忆，模型只是执行者。

最终状态不是“把 Markdown 放进模型里”，而是：

> 每次对话时，系统根据用户状态和画像，把最合适的 Markdown 规则片段交给模型，让模型按这套规则说话。
