# AI 陪伴产品｜Codex App 开发任务书 V1

## 0. 文件定位

这份文件是给 Codex / 开发 agent 使用的第一版 App 开发任务书。

用户本人不负责开发 App，也不懂技术细节。Codex 需要根据本任务书，优先搭建一个可运行的 MVP App，而不是继续扩展概念。

MVP 的目标不是一次性做完整产品，而是先跑通第一条核心路径：

```text
进入 App
→ 填写初始问卷
→ 生成陪伴说明
→ 保存或跳过
→ 进入聊天
→ 用户发消息
→ AI 根据画像和状态正确回复
```

---

## 1. 产品一句话

```text
一个越来越懂用户、能先陪伴，再在用户准备好时帮助她整理、分析和行动的 AI 陪伴产品。
```

它不是普通聊天机器人，也不是心理诊断工具。

第一版 App 的核心体验是：

> 用户完成一个低压问卷后，AI 会更知道该怎么陪她说话。

---

## 2. MVP 开发目标

## 2.1 必须跑通的主链路

```text
1. 用户打开 App
2. 看到 onboarding start page
3. 点击开始问卷
4. 完成 Q1-Q12，Q13-Q14 可跳过
5. 提交问卷
6. 后端根据配置计算陪伴人格和画像
7. 前端展示结果页
8. 用户点击保存 / 跳过 / 名字不像我
9. 进入聊天页
10. 用户发送第一句话
11. 后端判断 readiness_state
12. 后端选择 response_mode
13. 后端构建 prompt context
14. 模型生成回复
15. Humanize Pass 去 AI 味
16. 前端展示最终回复
```

## 2.2 第一版不追求

```yaml
not_required_in_mvp_v1:
  - 完整账号体系
  - 复杂个人中心
  - 完整画像编辑页
  - 主动推送
  - 语音聊天
  - 支付系统
  - 社区功能
  - 分享海报
  - 高级动效
  - 多端同步
  - 复杂长期记忆图谱
```

## 2.3 App 类型建议

第一版建议先做：

```yaml
recommended_first_build:
  type: "mobile-first web app or simple cross-platform app"
  priority: "先验证体验，不要陷入原生 App 复杂度"
```

如果必须做 App，可以用 Expo / React Native 或其他 Codex 能快速搭建的方案。核心是先跑通体验。

---

## 3. 推荐技术方向

> 以下是建议，不是强制。Codex 可根据当前项目环境选择最稳定方案。

```yaml
frontend:
  preferred:
    - React Native with Expo
    - or Next.js mobile-first web app
  reason: "快速搭建移动端体验，适合 MVP。"

backend:
  preferred:
    - Node.js / TypeScript API routes
    - or Next.js API routes
  reason: "方便处理问卷、画像、聊天请求和模型调用。"

database:
  mvp_options:
    - Supabase
    - PostgreSQL
    - SQLite for local prototype
    - JSON file storage for very early mock demo
  recommended: "Supabase or PostgreSQL"

llm_provider:
  recommended: "OpenAI API"
  note: "模型具体名称从环境变量配置，不要硬编码。"
```

---

## 4. 项目文件结构建议

Codex 可以按这个结构创建项目：

```text
ai-companion-app/
├── app/
│   ├── onboarding/
│   │   ├── start/
│   │   ├── questionnaire/
│   │   └── result/
│   └── chat/
├── api/
│   ├── onboarding/
│   │   ├── questionnaire
│   │   ├── submit
│   │   └── save-result
│   └── chat/
│       └── message
├── config/
│   ├── questionnaire_config_v1.yaml
│   ├── questionnaire_persona_mapping_v1.yaml
│   ├── companion_persona_config_v1.yaml
│   ├── companion_result_page_template_v1.md
│   ├── runtime_prompt_rules_v1.yaml
│   └── mvp_response_test_cases_v1.yaml
├── rules/
│   ├── SOUL.md
│   ├── READINESS_DETECTOR.md
│   ├── RESPONSE_MODES.md
│   ├── HUMANIZE_PASS.md
│   └── PROFILE_EXPLORATION_RULES.md
├── services/
│   ├── personaScoringEngine.ts
│   ├── profilePatchMerger.ts
│   ├── resultPageBuilder.ts
│   ├── readinessDetector.ts
│   ├── responseModeSelector.ts
│   ├── promptContextBuilder.ts
│   ├── chatReplyGenerator.ts
│   ├── humanizePass.ts
│   └── memoryUpdateDetector.ts
├── db/
│   ├── schema.sql
│   └── seed.ts
├── tests/
│   └── mvp_response_test_cases.yaml
└── README.md
```

---

## 5. 核心配置文件说明

Codex 应优先读取并实现这些文件：

```yaml
core_files:
  questionnaire_config_v1.yaml:
    purpose: "渲染问卷页面。"
    used_by:
      - frontend questionnaire page
      - backend validation

  questionnaire_persona_mapping_v1.yaml:
    purpose: "把问卷答案映射为陪伴人格和画像字段。"
    used_by:
      - personaScoringEngine
      - profilePatchMerger

  companion_persona_config_v1.yaml:
    purpose: "定义陪伴人格的文案、支持方式、禁忌表达、回复风格。"
    used_by:
      - resultPageBuilder
      - promptContextBuilder

  companion_result_page_template_v1.md:
    purpose: "定义问卷结果页文案结构。"
    used_by:
      - resultPageBuilder
      - onboarding result page

  runtime_prompt_rules_v1.yaml:
    purpose: "定义聊天运行时如何判断状态、选择回复模式、加载规则。"
    used_by:
      - readinessDetector
      - responseModeSelector
      - promptContextBuilder
      - chatReplyGenerator

  mvp_response_test_cases_v1.yaml:
    purpose: "验证 AI 回复是否正确。"
    used_by:
      - manual tests
      - automated evaluation later
```

---

## 6. 页面开发任务

# 6.1 Onboarding Start Page

## Route

```text
/onboarding/start
```

## 目标

告诉用户：这是一个低压问卷，用来让 AI 更好地陪她，不是心理测试。

## UI 内容

使用 `questionnaire_config_v1.yaml` 中的 `opening_page`。

## 必须包含

```yaml
components:
  - title
  - subtitle
  - description
  - safety_note
  - primary_button
  - secondary_button
```

## 交互

```yaml
primary_button:
  action: "go_to_questionnaire"
  next_route: "/onboarding/questionnaire"

secondary_button:
  action: "skip_onboarding_go_chat"
  next_route: "/chat"
  backend_action: "create_default_profile"
```

---

# 6.2 Questionnaire Page

## Route

```text
/onboarding/questionnaire
```

## 目标

渲染 Q1-Q12 主问卷，Q13-Q14 可跳过。

## 数据来源

```text
GET /api/onboarding/questionnaire
```

或直接读取：

```text
config/questionnaire_config_v1.yaml
```

## UI 要求

```yaml
layout:
  mobile_first: true
  one_question_per_screen: true
  show_progress: true
  allow_back: true
  autosave_answers: true
```

## 交互要求

```yaml
single_choice:
  component: "radio_card"

multi_choice:
  component: "checkbox_card"
  validate_max_selected: true

open_text:
  component: "textarea"
  optional: true
```

## 提交

提交到：

```text
POST /api/onboarding/submit
```

提交数据：

```json
{
  "user_id": "user_001",
  "answers": {
    "Q1": "B",
    "Q2": ["A", "C"],
    "Q3": ["C", "D"],
    "Q4": "B"
  }
}
```

---

# 6.3 Onboarding Result Page

## Route

```text
/onboarding/result
```

## 目标

展示第一版陪伴说明书。

## 数据来源

来自 `POST /api/onboarding/submit` 返回值。

## 页面模块

```yaml
sections:
  - persona_header
  - current_understanding
  - support_methods
  - avoid_methods
  - profile_summary_collapsible
  - editable_notice
  - action_buttons
```

## 按钮

```yaml
buttons:
  save:
    label: "保存我的陪伴说明"
    action: "save_persona_profile"

  edit:
    label: "我想改一改"
    action: "open_basic_edit_modal"

  skip:
    label: "先跳过"
    action: "skip_profile_save"

  reject_name:
    label: "这个名字不太像我"
    action: "reject_persona_name"
```

## 保存接口

```text
POST /api/onboarding/save-result
```

保存成功后跳转：

```text
/chat
```

---

# 6.4 Chat Page

## Route

```text
/chat
```

## 目标

提供核心陪伴聊天体验。

## 页面组件

```yaml
components:
  - message_list
  - input_box
  - send_button
  - optional_feedback_buttons
```

## 首次进入开场文案

如果用户保存了画像：

```text
我记住了你的第一版陪伴说明。

之后你不用每次都重新解释自己。
你可以直接说现在发生了什么，或者只丢一句很乱的话给我。
```

如果用户跳过问卷：

```text
也可以，我们先不做画像。

你可以直接说现在想说的事。
我会先根据你这一句话判断：你是想被陪一下，还是想让我帮你分析。
```

## 发送消息接口

```text
POST /api/chat/message
```

请求：

```json
{
  "user_id": "user_001",
  "conversation_id": "conv_001",
  "message": "我今天又刷了两个小时短视频，感觉自己好废"
}
```

返回：

```json
{
  "assistant_reply": "嗯……刷完以后突然空下来，再开始怪自己，这一下会很难受。",
  "runtime_state": {
    "readiness_state": "emotional",
    "current_scene": "emotional_dump",
    "recommended_response_mode": "companion_mode"
  }
}
```

前端只展示：

```text
assistant_reply
```

---

## 7. 后端 API 任务

# 7.1 GET /api/onboarding/questionnaire

## 作用

返回问卷配置。

## 输入

无。

## 输出

从 `questionnaire_config_v1.yaml` 返回问题列表。

## Codex 任务

```yaml
tasks:
  - 读取 questionnaire_config_v1.yaml
  - 返回 opening_page 和 questions
  - 不返回 scoring 规则
```

---

# 7.2 POST /api/onboarding/submit

## 作用

提交问卷并生成陪伴人格、画像补丁和结果页内容。

## Codex 任务

```yaml
tasks:
  - 校验问卷答案
  - 保存 questionnaire_record
  - 调用 personaScoringEngine
  - 调用 profilePatchMerger
  - 调用 resultPageBuilder
  - 返回 persona_result、profile_patch、result_page
```

## 关键服务

```yaml
services:
  personaScoringEngine:
    input: questionnaire_answers
    config: questionnaire_persona_mapping_v1.yaml
    output: persona_scores, primary_persona_id, secondary_persona_id, confidence, evidence

  profilePatchMerger:
    input: option profile_patch values
    output: merged_user_profile_patch

  resultPageBuilder:
    input: persona_result, profile_patch, companion_persona_config_v1.yaml
    output: result_page content
```

---

# 7.3 POST /api/onboarding/save-result

## 作用

根据用户选择保存、跳过或拒绝人格名。

## Codex 任务

```yaml
tasks:
  - if user_action == save: save persona_result and profile_patch
  - if user_action == skip: create minimal default profile
  - if user_action == reject_persona_name: set persona_result.status to rejected
  - return next_route /chat
```

---

# 7.4 POST /api/chat/message

## 作用

核心聊天接口。

## Codex 任务

```yaml
tasks:
  - 保存 user message
  - 读取 user_profile
  - 读取 persona_result
  - 读取 recent conversation
  - 调用 readinessDetector
  - 调用 responseModeSelector
  - 调用 promptContextBuilder
  - 调用 chatReplyGenerator
  - 调用 humanizePass
  - 调用 memoryUpdateDetector，可选
  - 保存 assistant message
  - 返回 assistant_reply
```

---

## 8. 服务模块规格

# 8.1 personaScoringEngine

## 输入

```yaml
questionnaire_answers: object
questionnaire_persona_mapping_config: yaml
```

## 输出

```yaml
persona_scoring_output:
  persona_scores: object
  primary_persona_id: string
  secondary_persona_id: string | null
  confidence: low | medium | high
  profile_patch: object
  evidence: array
```

## 重要说明

```text
问卷打分不需要调用大模型。
MVP 阶段直接按 YAML 权重规则计算即可。
```

---

# 8.2 resultPageBuilder

## 输入

```yaml
input:
  persona_result: object
  profile_patch: object
  persona_config: companion_persona_config_v1.yaml
  result_template: companion_result_page_template_v1.md
```

## 输出

```yaml
result_page:
  headline: string
  one_sentence: string
  current_understanding_copy: string
  support_methods: array
  avoid_methods: array
  profile_summary_display: object
  editable_notice: string
```

---

# 8.3 readinessDetector

## 输入

```yaml
input:
  user_message: string
  user_profile_summary: object
  recent_conversation_summary: string
```

## 输出

```yaml
runtime_state:
  readiness_state: emotional | mixed | rational | action_ready
  current_scene: emotional_dump | self_doubt | analysis_request | action_request | consumption_decision | relationship_boundary | low_energy_action | daily_chat | other
  emotional_intensity: low | medium | high
  user_requested_solution: boolean
  recommended_response_mode: companion_mode | reflection_mode | analysis_mode | action_mode
  reason: string
```

## 说明

可以先用 LLM 判断，也可以未来加入规则判断。

---

# 8.4 responseModeSelector

## 输入

```yaml
input:
  runtime_state: object
  communication_preference: object
```

## 输出

```yaml
response_mode: companion_mode | reflection_mode | analysis_mode | action_mode
response_mode_rules: object
scene_rules: object
```

## 规则来源

```text
runtime_prompt_rules_v1.yaml
```

---

# 8.5 promptContextBuilder

## 输入

```yaml
input:
  runtime_state: object
  response_mode_rules: object
  scene_rules: object
  user_profile: object
  persona_result: object
  persona_config: object
  recent_conversation_summary: string
  user_message: string
```

## 输出

```yaml
prompt_context:
  system_prompt: string
  developer_prompt: string
  user_profile_context: string
  conversation_context: string
  user_message: string
```

## 关键要求

```text
不要每次加载全部 Markdown。
只加载 runtime_prompt_rules_v1.yaml 指定的必要字段和规则。
```

---

# 8.6 chatReplyGenerator

## 输入

```yaml
prompt_context: object
```

## 输出

```yaml
draft_reply: string
```

## 模型配置

模型名称不在代码里硬编码，应从环境变量或 model_orchestration_config 读取。

---

# 8.7 humanizePass

## 输入

```yaml
input:
  draft_reply: string
  runtime_state: object
  response_mode: string
  user_voice_profile: object
```

## 输出

```yaml
assistant_reply: string
```

## 要求

```text
去除 AI 味、客服感、报告感、过早分析、建议过载和空泛安慰。
```

---

# 8.8 memoryUpdateDetector

## 输入

```yaml
input:
  user_message: string
  assistant_reply: string
  user_profile: object
  runtime_state: object
```

## 输出

```yaml
memory_update_suggestion:
  should_update: boolean
  field_path: string | null
  new_value: any
  confidence: low | medium | high | null
  needs_user_confirmation: boolean
  suggested_confirmation_copy: string | null
```

## MVP 说明

第一版可以只生成建议，不一定马上写入长期画像。

---

## 9. 数据库最小表结构

Codex 可以先实现简单版本。

```yaml
tables:
  users:
    fields:
      - id
      - created_at
      - onboarding_completed
      - questionnaire_submitted
      - persona_result_saved

  questionnaire_records:
    fields:
      - id
      - user_id
      - answers_json
      - submitted_at

  persona_results:
    fields:
      - id
      - user_id
      - primary_persona_id
      - secondary_persona_id
      - confidence
      - status
      - evidence_json
      - generated_at

  user_profiles:
    fields:
      - id
      - user_id
      - profile_json
      - updated_at

  conversations:
    fields:
      - id
      - user_id
      - created_at
      - updated_at

  chat_messages:
    fields:
      - id
      - conversation_id
      - user_id
      - role
      - content
      - runtime_state_json
      - response_mode
      - created_at

  memory_update_suggestions:
    fields:
      - id
      - user_id
      - source_message_id
      - field_path
      - new_value_json
      - confidence
      - needs_user_confirmation
      - status
      - created_at
```

---

## 10. 环境变量

```yaml
env:
  OPENAI_API_KEY:
    required: true
    description: "用于调用模型。"

  CHAT_REPLY_MODEL:
    required: true
    example: "gpt-5.5"

  READINESS_DETECTOR_MODEL:
    required: true
    example: "gpt-5-mini"

  HUMANIZE_PASS_MODEL:
    required: true
    example: "gpt-5.5"

  MEMORY_UPDATE_MODEL:
    required: false
    example: "gpt-5-mini"

  DATABASE_URL:
    required: true
```

不要把 API Key 写进代码。

---

## 11. 开发阶段顺序

## Phase 1｜静态页面和 Mock 数据

目标：先看 App 路径是否顺。

```yaml
phase_1_tasks:
  - 创建 /onboarding/start
  - 创建 /onboarding/questionnaire
  - 创建 /onboarding/result
  - 创建 /chat
  - 使用 questionnaire_config_v1.yaml 渲染问卷
  - 使用 mock result_page 数据展示结果页
  - 使用 mock assistant_reply 展示聊天
```

验收：

```yaml
phase_1_acceptance:
  - 可以从 start 进入 questionnaire
  - 可以完成问卷 UI
  - 可以进入 result
  - 可以点击保存进入 chat
  - chat 可以发送消息并看到 mock 回复
```

---

## Phase 2｜问卷评分接入

目标：问卷提交后真正生成陪伴人格和画像。

```yaml
phase_2_tasks:
  - 实现 GET /api/onboarding/questionnaire
  - 实现 POST /api/onboarding/submit
  - 实现 personaScoringEngine
  - 实现 profilePatchMerger
  - 实现 resultPageBuilder
  - 实现 POST /api/onboarding/save-result
```

验收：

```yaml
phase_2_acceptance:
  - 提交问卷可以生成 primary_persona_id
  - 可以生成 secondary_persona_id 或 null
  - 可以生成 confidence
  - 可以生成 result_page
  - 保存后 user_profile 可被读取
```

---

## Phase 3｜聊天运行时接入

目标：AI 能根据用户状态正确回复。

```yaml
phase_3_tasks:
  - 实现 POST /api/chat/message
  - 实现 readinessDetector
  - 实现 responseModeSelector
  - 实现 promptContextBuilder
  - 接入 OpenAI 模型生成 draft_reply
  - 实现 humanizePass
  - 返回 assistant_reply
```

验收：

```yaml
phase_3_acceptance:
  - 用户说“我好累”时进入 emotional / companion_mode
  - 用户说“我是不是太敏感”时进入 mixed / reflection_mode
  - 用户说“帮我分析”时进入 rational / analysis_mode
  - 用户说“我该怎么办”时进入 action_ready / action_mode
  - 回复不出现明显禁忌表达
```

---

## Phase 4｜测试用例验证

目标：用测试表检查回复质量。

```yaml
phase_4_tasks:
  - 读取 mvp_response_test_cases_v1.yaml
  - 手动或半自动运行测试
  - 记录 actual_readiness_state
  - 记录 actual_response_mode
  - 记录 assistant_reply
  - 标记 pass / fail
  - 调整 runtime_prompt_rules_v1.yaml
```

验收：

```yaml
phase_4_acceptance:
  - 16 个测试用例至少通过 12 个
  - critical cases 必须通过
  - emotional 场景不能急着给方案
  - inferred fact 不能当 confirmed 使用
  - rejected persona 不能继续主动提
```

---

## 12. 模型接入建议

第一版可以这样分工：

```yaml
model_usage_mvp:
  persona_scoring_engine:
    type: rule_based
    reason: "问卷打分用 YAML 规则，不需要模型。"

  readiness_detector:
    type: llm_or_rule_based
    suggested_model_env: READINESS_DETECTOR_MODEL
    reason: "判断用户当前状态，适合使用较快较便宜模型。"

  chat_reply_generator:
    type: llm
    suggested_model_env: CHAT_REPLY_MODEL
    reason: "核心陪伴体验，优先保证回复质量。"

  humanize_pass:
    type: llm
    suggested_model_env: HUMANIZE_PASS_MODEL
    reason: "语言质感关键，第一版建议与主回复模型一致或接近。"

  memory_update_detector:
    type: llm_optional
    suggested_model_env: MEMORY_UPDATE_MODEL
    reason: "可以后置，如果成本高，第一版可先关闭。"
```

重要：

```text
不要把模型名称写死在业务代码里。
全部从环境变量读取，方便之后更换模型。
```

---

## 13. MVP 验收标准

MVP V1 完成条件：

```yaml
mvp_v1_done_when:
  onboarding:
    - 用户可以完成问卷
    - 可以生成结果页
    - 可以保存或跳过

  profile:
    - user_profile 可以保存
    - persona_result 可以被聊天接口读取

  chat:
    - 用户可以发消息
    - 系统可以判断 readiness_state
    - 系统可以选择 response_mode
    - 系统可以生成 assistant_reply
    - assistant_reply 经过 humanize pass

  testing:
    - mvp_response_test_cases_v1.yaml 至少 12/16 通过
    - critical cases 全部通过

  product_feeling:
    - emotional 场景不急着解决
    - mixed 场景不下定义
    - rational 场景可以分析但不冷
    - action_ready 场景只给一个小动作
```

---

## 14. Codex 工作方式要求

Codex 在开发时应遵守：

```yaml
codex_rules:
  - "先搭主链路，不要扩展多余功能。"
  - "先用 mock 数据跑通页面，再接后端。"
  - "问卷打分用规则计算，不调用模型。"
  - "聊天主流程必须返回 runtime_state 供调试。"
  - "前端只展示 assistant_reply，不展示内部 runtime_state。"
  - "所有模型名称从环境变量读取。"
  - "不要在代码里写死 prompt，大段规则应来自 config/rules 文件。"
  - "不要把 Markdown 当普通文章展示给用户。"
  - "不要做心理诊断功能。"
```

---

## 15. 给 Codex 的第一条开发指令示例

可以把下面这段直接发给 Codex：

```text
请根据《Codex App 开发任务书 V1》搭建 AI 陪伴产品的第一个 MVP。

优先目标：跑通主链路，不要扩展其他功能。

请按 Phase 1 → Phase 2 → Phase 3 → Phase 4 的顺序开发。

第一步请先创建移动端优先的 App 页面：
/onboarding/start
/onboarding/questionnaire
/onboarding/result
/chat

使用 questionnaire_config_v1.yaml 渲染问卷页面。
先用 mock 数据跑通页面跳转和聊天 UI。
不要先做主动推送、付费、社区、画像编辑页或复杂账号系统。

完成 Phase 1 后，输出已完成内容、文件结构、如何运行、下一步计划。
```

---

## 16. V1 总结

这份任务书的目的，是让 Codex 不迷路。

第一版只做一件事：

> 用户填完问卷后，AI 能根据她的陪伴说明，在聊天里更正确地回应她。

先不要追求完整产品。
先把这条路径跑顺。

```text
问卷不是重点。
人格名不是重点。
App 页面也不是重点。

重点是：
用户发来一句话时，AI 是否知道现在该陪、该映照、该分析，还是该给一个小动作。
```

