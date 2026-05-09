# AI 陪伴产品｜Codex 文档使用说明 V1

## 0. 这份文件的作用

这份文件是给你和 Codex 使用的「文档交接说明书」。

你现在已经有很多产品文档、配置文件、规则文件。它们不是都要一次性丢给 Codex，也不是每个文件都在同一阶段使用。

这份说明会告诉 Codex：

1. 每个文档是做什么的；
2. 哪些文件是开发 App 必须先读的；
3. 哪些文件是聊天回复时才需要用的；
4. 哪些文件只是产品参考，不要直接写进代码；
5. 开发时应该按什么顺序使用这些文档；
6. 每一阶段应该交付什么结果。

你可以把这份文件作为 **第一份交给 Codex 的说明文档**。

---

## 1. 给 Codex 的总说明

请 Codex 先理解这一点：

```text
这个项目不是普通聊天机器人。

它的 MVP 目标是：
用户进入 App，填写一个低压问卷，生成第一版陪伴画像，然后进入聊天。
之后每次用户发消息，AI 都需要先判断用户当前状态，再选择正确回复方式。

核心不是“回答得多聪明”，而是“是否用对方式陪用户”。
```

第一版只跑通主链路：

```text
进入 App
→ 填写问卷
→ 生成陪伴说明
→ 保存或跳过
→ 进入聊天
→ 判断 readiness_state
→ 选择 response_mode
→ 生成正确回复
```

不要一上来做主动推送、付费、社区、完整画像编辑页、语音、复杂长期记忆。

---

## 2. 文档分层总览

当前文档可以分成 6 类。

```text
A. 产品总蓝图
B. 问卷与结果页
C. 陪伴人格系统
D. 聊天运行时规则
E. 测试与验收
F. 给 Codex 开发 App 的任务书
```

建议 Codex 按这个顺序读，而不是按文件创建时间读。

---

# A. 产品总蓝图

## 1. ai_companion_mvp_runtime_spec_v1.md

### 文件定位

这是 MVP 的总蓝图。

它回答：

```text
这个 App 第一版到底要跑通什么？
页面有哪些？
接口有哪些？
问卷如何进入聊天？
聊天时如何判断状态？
什么算 MVP 完成？
```

### Codex 应该怎么用

Codex 开发前必须先读这个文件。

它是整个项目的主说明，优先级最高。

### 使用阶段

```yaml
use_stage:
  - 项目初始化
  - 页面规划
  - API 规划
  - 后端服务拆分
  - MVP 验收
```

### 不能怎么用

不要把它当成前端页面文案直接展示给用户。

它是开发说明，不是用户界面文案。

---

# B. 问卷与结果页

## 2. questionnaire_config_v1.yaml

### 文件定位

这是问卷前端渲染配置。

它回答：

```text
问卷有哪些题？
每题是单选、多选还是开放题？
每题最多选几个？
哪些题必填？
按钮文案是什么？
前端怎么渲染？
后端怎么校验？
```

### Codex 应该怎么用

用于开发：

```text
/onboarding/start
/onboarding/questionnaire
```

Codex 应根据这个文件生成问卷页面，而不是手写散乱题目。

### 使用阶段

```yaml
use_stage:
  - Phase 1 静态页面
  - Phase 2 问卷提交接口
```

### 代码中对应模块

```text
frontend questionnaire renderer
GET /api/onboarding/questionnaire
backend answer validation
```

---

## 3. questionnaire_persona_mapping_v1.yaml

### 文件定位

这是问卷答案到陪伴人格和画像字段的映射规则。

它回答：

```text
用户选 Q1=B，会给哪些人格加分？
会更新哪些画像字段？
怎么选出主陪伴人格？
怎么选副人格？
开放题如何识别关键词？
```

### Codex 应该怎么用

用于实现：

```text
personaScoringEngine
profilePatchMerger
```

这部分不需要调用大模型。直接用规则打分即可。

### 使用阶段

```yaml
use_stage:
  - Phase 2 问卷评分接入
```

### 重要提醒

```text
问卷打分 = 规则计算
不是 LLM 生成
```

---

## 4. companion_result_page_template_v1.md

### 文件定位

这是问卷结果页文案和页面结构说明。

它回答：

```text
用户答完问卷后看到什么？
结果页有哪些模块？
低置信度时怎么说？
有副人格时怎么说？
按钮怎么设计？
```

### Codex 应该怎么用

用于开发：

```text
/onboarding/result
resultPageBuilder
```

### 使用阶段

```yaml
use_stage:
  - Phase 1 mock 结果页
  - Phase 2 真实结果页生成
```

### 不能怎么用

不要把里面所有示例一次性展示给用户。

真实页面只展示当前用户对应的那一版。

---

# C. 陪伴人格系统

## 5. companion_persona_naming_system_v1.md

### 文件定位

这是陪伴人格命名体系的产品说明版。

它回答：

```text
为什么需要陪伴人格？
每个人格的感觉是什么？
它不是 MBTI 式分类，而是陪伴说明。
```

### Codex 应该怎么用

这个文件主要给 Codex 理解产品语气和人格体系，不一定直接进代码。

### 使用阶段

```yaml
use_stage:
  - 产品理解
  - 文案调整
  - 结果页风格校准
```

### 不能怎么用

不要把整篇 Markdown 作为 prompt 每次塞给模型。

---

## 6. companion_persona_config_v1.yaml

### 文件定位

这是陪伴人格的结构化配置文件。

它回答：

```text
每个人格的 id 是什么？
显示名称是什么？
一句话说明是什么？
AI 应该怎么陪？
AI 不该怎么说？
对应哪些画像标签？
聊天时应该使用哪些 response_style？
```

### Codex 应该怎么用

用于：

```text
resultPageBuilder
promptContextBuilder
chat runtime personalization
```

### 使用阶段

```yaml
use_stage:
  - Phase 2 结果页生成
  - Phase 3 聊天个性化
```

### 重要提醒

聊天时不要频繁说人格名。

人格主要用于控制回复方式，不是拿来一直称呼用户。

---

# D. 聊天运行时规则

## 7. runtime_prompt_rules_v1.yaml

### 文件定位

这是聊天运行时的核心调度规则。

它回答：

```text
用户发一句话后，系统怎么判断状态？
怎么选择回复模式？
应该加载哪些画像字段？
应该加载哪些规则？
怎么构建 prompt？
怎么去 AI 味？
是否需要更新画像？
```

### Codex 应该怎么用

用于实现这些服务：

```text
readinessDetector
responseModeSelector
promptContextBuilder
chatReplyGenerator
humanizePass
memoryUpdateDetector
```

### 使用阶段

```yaml
use_stage:
  - Phase 3 聊天运行时接入
  - Phase 4 回复测试与调优
```

### 重要提醒

不要每次把全部规则都塞给模型。

每一轮聊天只加载当前场景需要的规则和画像字段。

---

## 8. SOUL.md

### 文件定位

这是陪伴 AI 的灵魂规则。

它定义：

```text
情绪优先，不急着解决
不给用户下定义
陪伴不是沉默，而是低压在场
解决方案需要用户准备好
像朋友，但不要假装真人
```

### Codex 应该怎么用

用于压缩成系统 prompt 的核心原则。

### 使用阶段

```yaml
use_stage:
  - promptContextBuilder
  - chatReplyGenerator
  - humanizePass
```

### 不能怎么用

不要全文每次塞给模型。应该从 `runtime_prompt_rules_v1.yaml` 读取压缩版。

---

## 9. READINESS_DETECTOR.md

### 文件定位

这是判断用户当前状态的规则。

它定义 4 种状态：

```text
emotional：情绪态
mixed：混合态
rational：理性态
action_ready：行动态
```

### Codex 应该怎么用

用于实现：

```text
readinessDetector
```

### 使用阶段

```yaml
use_stage:
  - Phase 3 聊天运行时接入
```

### 重要提醒

用户倾诉不等于用户求解。

如果不确定，先给选择权。

---

## 10. RESPONSE_MODES.md

### 文件定位

这是四种回复模式的完整说明。

它定义：

```text
companion_mode：陪伴轨
reflection_mode：映照轨
analysis_mode：分析轨
action_mode：行动轨
```

### Codex 应该怎么用

用于实现：

```text
responseModeSelector
chatReplyGenerator
```

### 使用阶段

```yaml
use_stage:
  - Phase 3 聊天运行时接入
  - Phase 4 测试调优
```

### 重要提醒

最关键不是回答内容多完整，而是选对模式。

---

## 11. HUMANIZE_PASS.md

### 文件定位

这是去 AI 味改写规则。

它回答：

```text
如何把正确但有距离的回复，改成自然、低压、具体、有陪伴感的回复？
```

### Codex 应该怎么用

用于实现：

```text
humanizePass
```

### 使用阶段

```yaml
use_stage:
  - Phase 3 聊天运行时接入
  - Phase 4 语言质量调优
```

### 重要提醒

即使状态判断和回复内容都对，最后也要检查有没有客服感、报告感、鸡汤感。

---

## 12. USER_VOICE_PROFILE_TEMPLATE.md

### 文件定位

这是单个用户的语言偏好模板。

它回答：

```text
用户喜欢怎样被回应？
用户讨厌哪些说法？
用户喜欢短一点还是详细一点？
用户能不能接受提问？
```

### Codex 应该怎么用

用于：

```text
user_profile
promptContextBuilder
humanizePass
```

### 使用阶段

```yaml
use_stage:
  - Phase 3 聊天个性化
  - 未来用户反馈按钮
```

---

## 13. USER_PERSONA_DIMENSIONS.md / USER_PERSONA_DIMENSIONS_V2.md

### 文件定位

这是用户画像维度表。

它回答：

```text
画像里应该记录哪些维度？
这些维度如何影响 AI 回复？
```

### Codex 应该怎么用

用于设计：

```text
user_profile schema
profilePatchMerger
promptContextBuilder
```

### 使用阶段

```yaml
use_stage:
  - 数据结构设计
  - user_profile 存储
  - 画像字段读取
```

### 重要提醒

MVP 不需要一开始实现全部画像字段。

先实现核心字段：

```text
emotion_pattern
communication_preference
decision_pattern
action_barrier
ideal_self
persona_result
```

---

## 14. user_persona_yaml_template_v2_with_confidence.md

### 文件定位

这是用户画像 YAML 模板 V2，包含置信度和确认状态。

它回答：

```text
哪些信息是 confirmed？
哪些只是 inferred？
哪些需要用户确认？
事实型画像应该怎么存？
```

### Codex 应该怎么用

用于：

```text
user_profile storage
fact profile handling
promptContextBuilder
memoryUpdateDetector
```

### 使用阶段

```yaml
use_stage:
  - Phase 2 保存画像
  - Phase 3 聊天读取画像
  - Phase 3/4 画像更新建议
```

### 重要提醒

inferred 信息不能当事实使用。

例如：用户问卷选择了“宠物、照护、陪伴责任”，不能直接说“你家宠物”。必须先确认。

---

## 15. PROFILE_EXPLORATION_RULES.md

### 文件定位

这是后续对话中如何低压探索用户画像的规则。

它回答：

```text
什么时候可以多问一点？
什么时候不能问？
怎么问才不像审问？
用户回答后怎么更新画像？
```

### Codex 应该怎么用

用于：

```text
memoryUpdateDetector
profileExplorationRuntime
```

### 使用阶段

```yaml
use_stage:
  - Phase 3 可选
  - Phase 4 调优
  - 后续长期记忆版本
```

### 重要提醒

情绪很浓的时候，不探索画像。

---

## 16. PUSH_MESSAGE_STYLE.md

### 文件定位

这是主动消息风格规则。

它回答：

```text
如果未来 App 做主动消息，应该怎么说？
怎么避免像运营通知？
```

### Codex 应该怎么用

MVP V1 暂时不要用。

这是后续主动推送功能的参考文件。

### 使用阶段

```yaml
use_stage:
  - not_in_mvp_v1
  - future_push_message_feature
```

### 重要提醒

第一版 App 不要做主动推送。

---

# E. 测试与验收

## 17. mvp_response_test_cases_v1.yaml

### 文件定位

这是 MVP 回复质量测试表。

它回答：

```text
什么叫回复正确？
什么场景必须测？
每个场景 expected readiness_state 是什么？
expected response_mode 是什么？
必须包含什么？
绝对不能说什么？
```

### Codex 应该怎么用

用于：

```text
manual testing
future automated evaluation
Phase 4 验收
```

### 使用阶段

```yaml
use_stage:
  - Phase 4 测试与调优
```

### 重要提醒

先手动测，再考虑自动化。

陪伴感很细，不能完全依赖自动测试。

---

# F. 给 Codex 开发 App 的任务书

## 18. codex_app_build_brief_v1.md

### 文件定位

这是给 Codex 的正式 App 开发任务书。

它回答：

```text
Codex 应该先做什么？
页面怎么搭？
接口怎么搭？
服务模块有哪些？
开发分几阶段？
每阶段怎么验收？
```

### Codex 应该怎么用

这是开发时第二重要的文件，仅次于 MVP 总蓝图。

### 使用阶段

```yaml
use_stage:
  - Codex 开始开发前
  - Phase 1 到 Phase 4 全程
```

### 推荐使用方式

你可以把这个文件和 `questionnaire_config_v1.yaml` 一起先交给 Codex，让它先做 Phase 1。

---

## 19. model_orchestration_config_v1.yaml

### 当前状态

尚未设计。

### 文件定位

这个文件之后会定义：

```text
哪个环节用哪个模型？
状态判断用什么模型？
聊天回复用什么模型？
去 AI 味用什么模型？
画像更新判断用什么模型？
模型名称如何从环境变量读取？
```

### 是否必须

如果现在就开始 App 页面开发，它不是第一优先级。

但在接入真实模型前，建议补上。

---

## 3. 推荐交给 Codex 的顺序

不要一次性把所有文件都让 Codex“完整实现”。

建议这样分批给。

---

# 第一批：让 Codex 先搭 App 壳子

## 交给 Codex 的文件

```text
1. codex_app_build_brief_v1.md
2. ai_companion_mvp_runtime_spec_v1.md
3. questionnaire_config_v1.yaml
```

## 给 Codex 的指令

```text
请先只做 Phase 1：静态页面和 Mock 数据。

目标：跑通页面路径，不接真实模型。

需要完成：
/onboarding/start
/onboarding/questionnaire
/onboarding/result
/chat

使用 questionnaire_config_v1.yaml 渲染问卷。
结果页和聊天回复先用 mock 数据。
不要做主动推送、付费、社区、完整画像编辑页。

完成后请输出：
1. 文件结构
2. 如何运行
3. 已完成页面
4. 下一步要接的 API
```

## 这一阶段不要给 Codex 的文件

```text
runtime_prompt_rules_v1.yaml
mvp_response_test_cases_v1.yaml
PROFILE_EXPLORATION_RULES.md
PUSH_MESSAGE_STYLE.md
```

原因：第一阶段只搭页面，不需要复杂聊天规则。

---

# 第二批：接入问卷评分和结果页

## 交给 Codex 的文件

```text
1. questionnaire_persona_mapping_v1.yaml
2. companion_persona_config_v1.yaml
3. companion_result_page_template_v1.md
4. user_persona_yaml_template_v2_with_confidence.md
```

## 给 Codex 的指令

```text
现在进入 Phase 2：问卷评分接入。

请实现：
1. GET /api/onboarding/questionnaire
2. POST /api/onboarding/submit
3. POST /api/onboarding/save-result
4. personaScoringEngine
5. profilePatchMerger
6. resultPageBuilder

问卷打分必须使用 questionnaire_persona_mapping_v1.yaml 的规则，不要调用大模型。

结果页使用 companion_persona_config_v1.yaml 和 companion_result_page_template_v1.md 生成。

保存时，将 persona_result 和 user_profile 存入数据库或本地存储。
```

---

# 第三批：接入聊天运行时

## 交给 Codex 的文件

```text
1. runtime_prompt_rules_v1.yaml
2. SOUL.md
3. READINESS_DETECTOR.md
4. RESPONSE_MODES.md
5. HUMANIZE_PASS.md
6. USER_VOICE_PROFILE_TEMPLATE.md
```

## 给 Codex 的指令

```text
现在进入 Phase 3：聊天运行时接入。

请实现：
1. POST /api/chat/message
2. readinessDetector
3. responseModeSelector
4. promptContextBuilder
5. chatReplyGenerator
6. humanizePass
7. memoryUpdateDetector 可先做可选或 mock

要求：
- 用户发消息后，必须返回 assistant_reply。
- 后端内部必须返回 runtime_state 供调试。
- 前端只展示 assistant_reply，不展示 runtime_state。
- 不要每次加载全部 Markdown。
- 按 runtime_prompt_rules_v1.yaml 选择必要规则和画像字段。
```

---

# 第四批：测试与调优

## 交给 Codex 的文件

```text
1. mvp_response_test_cases_v1.yaml
2. runtime_prompt_rules_v1.yaml
3. HUMANIZE_PASS.md
4. RESPONSE_MODES.md
```

## 给 Codex 的指令

```text
现在进入 Phase 4：回复测试与调优。

请根据 mvp_response_test_cases_v1.yaml 逐条测试 /api/chat/message。

每个测试记录：
1. expected_readiness_state
2. actual_readiness_state
3. expected_response_mode
4. actual_response_mode
5. assistant_reply
6. 是否出现 must_not_include
7. 是否满足 must_include
8. pass / fail

要求：
- 16 个测试至少通过 12 个。
- critical cases 必须全部通过。
- emotional 场景不能急着给方案。
- inferred fact 不能当 confirmed 使用。
- rejected persona 不能继续主动提。
```

---

## 4. 当前文件优先级

## 最高优先级

Codex 开发 App 必须先读：

```text
1. codex_app_build_brief_v1.md
2. ai_companion_mvp_runtime_spec_v1.md
3. questionnaire_config_v1.yaml
```

## 第二优先级

问卷评分和结果页必须用：

```text
4. questionnaire_persona_mapping_v1.yaml
5. companion_persona_config_v1.yaml
6. companion_result_page_template_v1.md
```

## 第三优先级

聊天运行时必须用：

```text
7. runtime_prompt_rules_v1.yaml
8. SOUL.md
9. READINESS_DETECTOR.md
10. RESPONSE_MODES.md
11. HUMANIZE_PASS.md
```

## 第四优先级

画像、记忆和测试：

```text
12. user_persona_yaml_template_v2_with_confidence.md
13. USER_VOICE_PROFILE_TEMPLATE.md
14. PROFILE_EXPLORATION_RULES.md
15. mvp_response_test_cases_v1.yaml
```

## 暂时不要用

```text
16. PUSH_MESSAGE_STYLE.md
```

原因：主动消息不属于第一版主链路。

---

## 5. 给 Codex 的总提示词

你可以把下面这段作为第一条消息发给 Codex。

```text
你现在是这个 AI 陪伴产品的 App 开发 agent。

请先阅读这些文件：
1. codex_app_build_brief_v1.md
2. ai_companion_mvp_runtime_spec_v1.md
3. questionnaire_config_v1.yaml

项目目标：开发第一个 MVP App。

第一版只跑通主链路：
进入 App → 填写问卷 → 生成陪伴说明 → 保存或跳过 → 进入聊天 → AI 根据画像和用户状态正确回复。

不要做主动推送、付费、社区、完整画像编辑页、语音、复杂账号系统。

请按 Phase 1 → Phase 2 → Phase 3 → Phase 4 开发。

当前先执行 Phase 1：
- 创建 /onboarding/start
- 创建 /onboarding/questionnaire
- 创建 /onboarding/result
- 创建 /chat
- 使用 questionnaire_config_v1.yaml 渲染问卷
- 结果页和聊天先用 mock 数据

完成 Phase 1 后，请输出：
1. 你创建了哪些文件
2. 如何运行项目
3. 页面路径是否都能访问
4. 哪些地方用了 mock 数据
5. 下一步进入 Phase 2 需要接哪些接口
```

---

## 6. 你本人怎么使用这些文档

你不需要理解每个字段。

你只需要知道：

```text
如果 Codex 要搭页面：给它 codex_app_build_brief + questionnaire_config。

如果 Codex 要做问卷结果：给它 questionnaire_persona_mapping + persona_config + result_page_template。

如果 Codex 要做聊天回复：给它 runtime_prompt_rules + SOUL + READINESS + RESPONSE_MODES + HUMANIZE。

如果 Codex 要测试回复：给它 mvp_response_test_cases。
```

你可以把它想成装修：

```text
MVP Runtime Spec = 整栋房子的总设计图
Codex Build Brief = 施工队任务书
Questionnaire Config = 问卷页面的施工图
Persona Mapping = 问卷结果计算方式
Persona Config = 每种陪伴人格的说明书
Runtime Prompt Rules = AI 聊天时的大脑调度表
Response Test Cases = 质检表
SOUL / RESPONSE / HUMANIZE = 说话风格手册
```

---

## 7. 下一步建议

当前已经可以让 Codex 开始 Phase 1。

在接入真实模型前，建议再补一个文件：

```text
model_orchestration_config_v1.yaml
```

它会规定：

```text
状态判断用哪个模型
聊天回复用哪个模型
去 AI 味用哪个模型
记忆更新用哪个模型
模型名称如何从环境变量读取
失败时怎么 fallback
```

但它不阻碍现在开始搭 App 页面。

所以当前顺序建议是：

```text
1. 先把本文件 + Codex App Build Brief + Questionnaire Config 交给 Codex
2. 让 Codex 做 Phase 1 App 壳子
3. 同时补 model_orchestration_config_v1.yaml
4. Phase 1 完成后再接问卷评分
5. 最后接聊天模型
```

