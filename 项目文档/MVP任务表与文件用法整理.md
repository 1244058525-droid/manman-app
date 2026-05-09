# AI 陪伴产品 MVP｜任务表与文件用法整理

## 0. 这份文档怎么用

这份文档用于把当前文件夹里的产品资料整理成一条可执行开发路线。

核心目标不是继续扩展概念，而是把第一版 MVP 跑通：

```text
进入 App
→ 填写问卷
→ 生成第一版陪伴画像
→ 展示结果页
→ 保存或跳过
→ 进入聊天
→ 判断用户状态
→ 选择回复模式
→ 生成陪伴回复
→ 去 AI 味
→ 返回给用户
```

---

## 1. MVP 总任务表

| 阶段 | 优先级 | 任务 | 目标 | 主要输入文件 | 交付物 | 验收标准 |
|---|---:|---|---|---|---|---|
| 0. 项目理解 | P0 | 阅读产品总控资料 | 明确产品不是普通聊天机器人，而是陪伴优先的画像型 AI 产品 | `ai_companion_mvp_runtime_spec_v_1.md`、`codex_app_build_brief_v_1.md`、`codex_document_usage_guide_v_1.md` | MVP 范围说明 | 能清楚说出主链路、非目标、成功指标 |
| 1. 信息架构 | P0 | 定义 App 页面结构 | 确定第一版只做必要页面 | `codex_app_build_brief_v_1.md`、`questionnaire_config_v_1_yaml.yaml` | 页面清单与路由 | 包含 start、questionnaire、result、chat 四个核心页面 |
| 2. 问卷前端 | P0 | 渲染初始问卷 | 用户可以完成 Q1-Q12，Q13-Q14 可跳过 | `questionnaire_config_v_1_yaml.yaml`、`initial_persona_questionnaire_v1.md` | 可交互问卷页 | 单选、多选、开放题、进度、返回、校验可用 |
| 3. 问卷数据结构 | P0 | 保存用户答案 | 为后续画像计算提供结构化输入 | `questionnaire_config_v_1_yaml.yaml` | answer schema / 本地或后端存储 | 每题答案能按 question_id 和 option_id 保存 |
| 4. 人格匹配 | P0 | 根据问卷生成陪伴人格 | 产出 primary persona、secondary persona、confidence、evidence | `questionnaire_persona_mapping_v_1_yaml.yaml`、`companion_persona_config_v_1_yaml.yaml` | persona matching function | 不依赖单题判断；低置信度能降级表达 |
| 5. 用户画像生成 | P0 | 生成第一版用户画像 | 把问卷答案转成可被聊天运行时读取的 profile | `updated_user_persona_dimensions.md`、`companion_ai_mvp_markdown_kit/persona_system/02_PERSONA_YAML_TEMPLATE.md`、`persona_exploration_update_pack/02_persona_yaml_template_v2_with_confidence.md` | user persona YAML / JSON | 字段完整，推测字段标记 inferred，用户可修改 |
| 6. 结果页 | P0 | 展示陪伴说明书 | 让用户感到被看见，而不是被诊断 | `companion_result_page_template_v_1.md`、`companion_persona_config_v_1_yaml.yaml` | onboarding result page | 有人格名、理解摘要、陪伴方式、避免方式、保存/跳过 |
| 7. 聊天基础页 | P0 | 搭建聊天界面 | 用户可以进入聊天并发送第一句话 | `codex_app_build_brief_v_1.md` | chat page | 可输入、发送、显示用户和 AI 消息 |
| 8. 运行时状态判断 | P0 | 判断 readiness_state | 先判断用户需要陪伴、映照、分析还是行动 | `runtime_prompt_rules_v_1_yaml.yaml`、`companion_ai_mvp_markdown_kit/language_system/02_READINESS_DETECTOR.md` | readiness detector | 能输出 emotional、mixed、rational、action_ready |
| 9. 回复模式选择 | P0 | 选择 response_mode | 根据状态选择 companion、reflection、analysis、action | `companion_ai_mvp_markdown_kit/language_system/03_RESPONSE_MODES.md`、`runtime_prompt_rules_v_1_yaml.yaml` | response mode selector | emotional 不给方案，action_ready 才给具体行动 |
| 10. Prompt 组装 | P0 | 构建模型上下文 | 按需加载画像、人格、语言规则，不一次性塞全部文档 | `runtime_prompt_rules_v_1_yaml.yaml`、`companion_language_system_integrated.md` | prompt builder | 每次回复能带上必要画像和当前模式规则 |
| 11. 陪伴回复生成 | P0 | 生成第一版 AI 回复 | 回复体现陪伴优先、低压、具体、有边界 | `companion_ai_mvp_markdown_kit/language_system/01_SOUL.md`、`03_RESPONSE_MODES.md` | assistant draft reply | 不像客服，不急着分析，不给用户下定义 |
| 12. 去 AI 味改写 | P0 | Humanize Pass | 把正确但生硬的回复改得自然一点 | `companion_ai_mvp_markdown_kit/language_system/04_HUMANIZE_PASS.md`、`companion_language_system_integrated.md` | final assistant reply | 避免“我理解你的感受”“以下是几点建议”等套话 |
| 13. 测试用例验证 | P0 | 跑 MVP 回复测试 | 验证状态判断、模式选择、语言质量 | `mvp_response_test_cases_v_1_yaml.yaml` | 测试报告 | 核心用例评分 >= 3 |
| 14. 画像更新建议 | P1 | 根据对话提出画像更新 | 当用户表达稳定偏好或否定画像时，提出更新建议 | `persona_exploration_update_pack/03_profile_exploration_rules_v1.md`、`runtime_prompt_rules_v_1_yaml.yaml` | profile update suggestion | 不擅自确认敏感事实，用户确认后再更新 |
| 15. 反馈按钮 | P1 | 让用户反馈回复风格 | 收集“太急着解决/太长/太像 AI”等偏好 | `companion_ai_mvp_markdown_kit/language_system/05_USER_VOICE_PROFILE_TEMPLATE.md` | feedback UI + voice profile update | 反馈能影响后续回复长度、语气、提问频率 |
| 16. 主动陪伴 | P2 | 晚间或事件跟进消息 | 做低压主动陪伴，不做运营式唤回 | `companion_ai_mvp_markdown_kit/language_system/06_PUSH_MESSAGE_STYLE.md` | push message prototype | 用户可关闭；不制造焦虑；不催促 |
| 17. 数据与隐私 | P0 | 定义用户数据边界 | 保证画像可查看、修改、隐藏、删除 | `companion_persona_config_v_1_yaml.yaml`、`codex_app_build_brief_v_1.md` | privacy / profile controls | 用户知道这不是诊断，也能控制自己的画像 |
| 18. MVP 验收 | P0 | 检查第一条主链路 | 确认用户能从进入到聊天完整走通 | `ai_companion_mvp_runtime_spec_v_1.md`、`mvp_response_test_cases_v_1_yaml.yaml` | MVP 验收清单 | 问卷完成、结果保存、首聊、二次回复链路可用 |

---

## 2. 推荐开发顺序

### 第一轮：先跑通主链路

1. 做 start page。
2. 做 questionnaire page。
3. 保存问卷答案。
4. 用 mapping 生成 persona result。
5. 做 result page。
6. 进入 chat page。
7. 接入最小版聊天回复规则。

这一轮不要做主动推送、完整账号、复杂画像编辑、长期记忆、支付、社区。

### 第二轮：让回复真的像这个产品

1. 加 readiness_state 判断。
2. 加 response_mode 选择。
3. 加 user persona 读取。
4. 加 Humanize Pass。
5. 用测试用例反复修正。

### 第三轮：增加可成长感

1. 加用户反馈按钮。
2. 加画像更新建议。
3. 加简单画像查看和修改。
4. 再考虑低频主动陪伴。

---

## 3. 文件用法总览

| 文件/文件夹 | 类型 | 开发阶段 | 主要用途 | 是否进代码 | 使用方式 |
|---|---|---|---|---|---|
| `codex_document_usage_guide_v_1.md` | 文档说明 | 开发前 | 告诉 Codex 每个文档怎么用 | 否 | 第一个读，用来确定阅读顺序 |
| `ai_companion_mvp_runtime_spec_v_1.md` | 产品总控 | 开发前 / 验收 | 定义 MVP 主链路、目标、成功指标、运行时逻辑 | 部分 | 作为产品规格，不整篇塞进 prompt |
| `codex_app_build_brief_v_1.md` | 开发任务书 | 开发前 / 开发中 | 指导 App 要做什么、不做什么 | 部分 | 作为页面和功能范围依据 |
| `ai_companion_project_context_summary.txt` | 项目背景 | 开发前 | 快速理解项目来龙去脉、战略判断 | 否 | 只读参考，不直接写入代码 |
| `ai_companion_execution_roadmap.canvas` | 路线图 | 规划阶段 | 展示从画像底盘到 MVP、验证、扩张的路线 | 否 | 作为执行顺序参考 |
| `initial_persona_questionnaire_v1.md` | 问卷原始设计 | 问卷开发 | 查看题目设计原则、每题意图、映射字段 | 部分 | 和 YAML 对照，避免前端只懂选项不懂意图 |
| `questionnaire_config_v_1_yaml.yaml` | 问卷配置 | 前端开发 | 前端渲染问卷页面、题型、选项、校验、文案 | 是 | 作为前端可读取配置 |
| `questionnaire_persona_mapping_v_1_yaml.yaml` | 问卷映射 | 后端 / 逻辑层 | 把问卷答案映射到人格分数和画像字段 | 是 | 作为 scoring / mapping 规则 |
| `companion_persona_config_v_1_yaml.yaml` | 人格配置 | 结果页 / 回复 | 定义人格名、显示文案、陪伴方式、避免方式、置信度规则 | 是 | 结果页和聊天运行时都可读取 |
| `companion_result_page_template_v_1.md` | 结果页模板 | 结果页开发 | 定义结果页模块和文案原则 | 部分 | 作为 UI 文案和布局依据 |
| `updated_user_persona_dimensions.md` | 画像维度表 | 数据设计 | 定义用户画像应该有哪些字段 | 部分 | 转成 profile schema，不直接展示全部 |
| `persona_exploration_update_pack/` | 画像升级包 | P1/P2 | 支持更细的画像字段、置信度、持续探索规则 | 部分 | 第一版可先少用，后续做动态画像时启用 |
| `companion_ai_mvp_markdown_kit/00_README.md` | 规则包说明 | 开发前 | 说明 markdown kit 的组成 | 否 | 快速了解规则包结构 |
| `companion_ai_mvp_markdown_kit/persona_system/01_USER_PERSONA_DIMENSIONS.md` | 画像维度旧版/基础版 | 数据设计 | 用户画像维度说明 | 部分 | 与 `updated_user_persona_dimensions.md` 对照使用 |
| `companion_ai_mvp_markdown_kit/persona_system/02_PERSONA_YAML_TEMPLATE.md` | 画像模板 | 数据设计 / 运行时 | 定义模型可读取的用户画像格式 | 是 | 可转成 JSON/YAML 存储模板 |
| `companion_ai_mvp_markdown_kit/language_system/01_SOUL.md` | 灵魂规则 | 聊天运行时 | 定义 AI 陪伴者的基本信条 | 是 | 长期系统规则，压缩后常驻 |
| `companion_ai_mvp_markdown_kit/language_system/02_READINESS_DETECTOR.md` | 状态判断 | 聊天运行时 | 判断 emotional、mixed、rational、action_ready | 是 | 用于状态分类模块 |
| `companion_ai_mvp_markdown_kit/language_system/03_RESPONSE_MODES.md` | 回复模式 | 聊天运行时 | 定义四类回复模式和结构 | 是 | 根据 readiness_state 按需加载 |
| `companion_ai_mvp_markdown_kit/language_system/04_HUMANIZE_PASS.md` | 去 AI 味 | 聊天运行时 | 检查和改写回复，让语言更自然 | 是 | 作为最终改写模块或检查规则 |
| `companion_ai_mvp_markdown_kit/language_system/05_USER_VOICE_PROFILE_TEMPLATE.md` | 用户语言偏好 | P1 | 记录用户喜欢/不喜欢的回复风格 | 是 | 作为 voice profile schema |
| `companion_ai_mvp_markdown_kit/language_system/06_PUSH_MESSAGE_STYLE.md` | 主动消息规则 | P2 | 定义低压推送和事件跟进文案 | 部分 | 主动陪伴功能上线时再用 |
| `companion_ai_mvp_markdown_kit/implementation/01_HOW_TO_EMBED_MARKDOWN_IN_MODEL.md` | 技术接入说明 | 开发中 | 说明 Markdown 规则如何嵌入模型调用 | 否 | 开发实现参考 |
| `companion_language_system_integrated.md` | 语言系统整合版 | 聊天运行时 | 把 SOUL、状态、模式、人味规则合并成一份 | 部分 | 可作为首版 prompt 规则来源 |
| `runtime_prompt_rules_v_1_yaml.yaml` | 运行时配置 | 后端核心 | 定义每次聊天消息的处理流水线 | 是 | 作为 prompt builder / runtime pipeline 依据 |
| `mvp_response_test_cases_v_1_yaml.yaml` | 测试用例 | 测试验收 | 验证状态判断、回复模式、禁用表达、语言质量 | 是 | 作为自动/人工测试集 |
| `xiaohongshu_strategy_recap.txt` | 增长/内容策略 | MVP 后 | 小红书内容、获客和定位参考 | 否 | 不进入 MVP 核心开发 |
| `微信图片_20260507075844_321_30.png` | 图片素材 | UI 视觉 | 可作为品牌图形、占位视觉、结果页装饰素材 | 可选 | 如视觉方向匹配，可进入前端 assets |

---

## 4. 文件分层建议

### A. 必须先读

```text
codex_document_usage_guide_v_1.md
ai_companion_mvp_runtime_spec_v_1.md
codex_app_build_brief_v_1.md
```

这三份决定产品边界。

### B. 前端必须用

```text
questionnaire_config_v_1_yaml.yaml
companion_result_page_template_v_1.md
companion_persona_config_v_1_yaml.yaml
codex_app_build_brief_v_1.md
```

它们决定页面、问卷、结果页和核心文案。

### C. 后端/逻辑层必须用

```text
questionnaire_persona_mapping_v_1_yaml.yaml
companion_persona_config_v_1_yaml.yaml
runtime_prompt_rules_v_1_yaml.yaml
mvp_response_test_cases_v_1_yaml.yaml
```

它们决定问卷如何算出人格、聊天如何判断状态、如何测试是否合格。

### D. 模型回复必须用

```text
companion_ai_mvp_markdown_kit/language_system/01_SOUL.md
companion_ai_mvp_markdown_kit/language_system/02_READINESS_DETECTOR.md
companion_ai_mvp_markdown_kit/language_system/03_RESPONSE_MODES.md
companion_ai_mvp_markdown_kit/language_system/04_HUMANIZE_PASS.md
runtime_prompt_rules_v_1_yaml.yaml
```

这些是“它为什么不像普通 AI”的核心。

### E. 第一版可以暂缓

```text
companion_ai_mvp_markdown_kit/language_system/06_PUSH_MESSAGE_STYLE.md
persona_exploration_update_pack/
xiaohongshu_strategy_recap.txt
```

它们重要，但不应该挡住第一版主链路。

---

## 5. 不同角色怎么读这些文件

### 产品设计师

优先读：

```text
ai_companion_mvp_runtime_spec_v_1.md
initial_persona_questionnaire_v1.md
companion_result_page_template_v_1.md
companion_language_system_integrated.md
```

关注点：

```text
用户是否感到被看见
问卷是否低压
结果页是否不下定义
聊天是否先陪伴再分析
```

### 前端开发

优先读：

```text
codex_app_build_brief_v_1.md
questionnaire_config_v_1_yaml.yaml
companion_result_page_template_v_1.md
companion_persona_config_v_1_yaml.yaml
```

关注点：

```text
页面路由
组件类型
问卷渲染
结果页模块
聊天页面状态
```

### 后端开发

优先读：

```text
questionnaire_persona_mapping_v_1_yaml.yaml
companion_persona_config_v_1_yaml.yaml
runtime_prompt_rules_v_1_yaml.yaml
mvp_response_test_cases_v_1_yaml.yaml
```

关注点：

```text
答案保存
人格计算
用户画像存储
聊天运行时流水线
测试用例
```

### Prompt / AI 规则设计

优先读：

```text
companion_ai_mvp_markdown_kit/language_system/01_SOUL.md
companion_ai_mvp_markdown_kit/language_system/02_READINESS_DETECTOR.md
companion_ai_mvp_markdown_kit/language_system/03_RESPONSE_MODES.md
companion_ai_mvp_markdown_kit/language_system/04_HUMANIZE_PASS.md
runtime_prompt_rules_v_1_yaml.yaml
```

关注点：

```text
状态判断是否准确
回复模式是否正确
语言是否低压自然
是否避免过早分析和建议
```

---

## 6. 第一版 App 最小页面清单

| 页面 | 路由建议 | 必须功能 | 输入文件 |
|---|---|---|---|
| 开始页 | `/onboarding/start` | 产品开场、开始问卷、跳过聊天 | `questionnaire_config_v_1_yaml.yaml` |
| 问卷页 | `/onboarding/questionnaire` | Q1-Q12 必答、Q13-Q14 可跳过、进度、返回 | `questionnaire_config_v_1_yaml.yaml` |
| 结果页 | `/onboarding/result` | 人格名、陪伴说明、避免方式、保存/跳过 | `companion_result_page_template_v_1.md`、`companion_persona_config_v_1_yaml.yaml` |
| 聊天页 | `/chat` | 消息输入、AI 回复、基础历史 | `runtime_prompt_rules_v_1_yaml.yaml`、language system |
| 画像页 | `/profile` | 查看和修改第一版画像 | P1，可暂缓 |

---

## 7. 第一版数据对象建议

### questionnaire_answers

```yaml
user_id: string
questionnaire_id: initial_persona_questionnaire_v1
answers:
  - question_id: q1
    type: single_choice
    selected_option_ids:
      - A
    raw_text: null
completed_required_questions: true
created_at: datetime
```

### persona_result

```yaml
primary_persona_id: fog_organizer
primary_persona_name: 雾中整理者
secondary_persona_id: null
confidence: medium
evidence:
  - question_id: q1
    reason: 用户选择了高压力和混乱相关选项
source_type: questionnaire
status: inferred
user_visible: true
```

### user_profile

```yaml
current_state:
  stress_level:
    value: high
    confidence: medium
    source: questionnaire
    status: inferred

communication_preference:
  tone:
    value: 生活化、低压、具体
    confidence: medium
    source: questionnaire
    status: inferred
```

### runtime_state

```yaml
readiness_state: emotional
response_mode: companion_mode
should_update_profile: false
debug_reason: 用户主要在表达情绪，没有明确请求方案
```

---

## 8. MVP 验收清单

| 验收项 | 是否必须 | 通过标准 |
|---|---|---|
| 用户能从开始页进入问卷 | 是 | 点击后进入问卷页 |
| 用户能完成 Q1-Q12 | 是 | 必答题校验正确 |
| Q13-Q14 可跳过 | 是 | 不阻断提交 |
| 系统能生成 persona_result | 是 | 有 primary persona 和 confidence |
| 结果页不把用户固定成标签 | 是 | 文案包含“这只是第一版”“可以修改” |
| 用户能进入聊天 | 是 | 保存或跳过后进入 chat |
| 聊天能判断 readiness_state | 是 | 至少四类状态可区分 |
| emotional 状态不急着给建议 | 是 | 不出现行动方案和强分析 |
| final reply 经过 Humanize Pass | 是 | 不出现全局禁用套话 |
| 测试用例能跑 | 是 | `mvp_response_test_cases_v_1_yaml.yaml` 核心用例通过 |
| 用户画像可修改/删除 | 是 | 至少提供基础入口或明确下一版实现 |
| 主动推送 | 否 | 第一版可不做 |
| 账号体系 | 否 | 第一版可用本地或简单匿名用户 |
| 付费系统 | 否 | 第一版不做 |

---

## 9. 当前资料的设计判断

这套文件已经具备搭建 MVP 的基础，不需要再继续补很多概念文档。

最应该优先做的是：

```text
把 YAML 配置变成可运行的问卷和结果页
把 language system 变成聊天运行时
用测试用例反复校准回复
```

最容易走偏的是：

```text
继续扩展人格名和画像字段
过早做主动推送
过早做复杂长期记忆
把所有 Markdown 一次性塞进模型
把结果页做得像人格测试报告
```

第一版真正要验证的是：

```text
用户是否愿意答完问卷
用户是否觉得结果页有被看见
用户是否愿意进入聊天说第一句话
AI 第一条回复是否没有急着修理用户
用户是否愿意继续说第二句
```

