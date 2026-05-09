# AI 陪伴产品 MVP Markdown Kit

这套文件用于搭建第一版 MVP 的两个核心底盘：

1. **陪伴语言系统**：决定 AI 如何像一个有温度的陪伴者回应用户。
2. **用户画像系统**：决定 AI 如何理解用户，并根据画像调整陪伴方式。

核心原则：

> 不是判断“用户是哪种人”，而是告诉 AI “此刻该如何陪这个人”。

## 文件结构

```text
companion_ai_mvp_markdown_kit/
├── 00_README.md
├── language_system/
│   ├── 01_SOUL.md
│   ├── 02_READINESS_DETECTOR.md
│   ├── 03_RESPONSE_MODES.md
│   ├── 04_HUMANIZE_PASS.md
│   ├── 05_USER_VOICE_PROFILE_TEMPLATE.md
│   └── 06_PUSH_MESSAGE_STYLE.md
├── persona_system/
│   ├── 01_USER_PERSONA_DIMENSIONS.md
│   └── 02_PERSONA_YAML_TEMPLATE.md
└── implementation/
    └── 01_HOW_TO_EMBED_MARKDOWN_IN_MODEL.md
```

## MVP 推荐使用顺序

1. 用 `persona_system/01_USER_PERSONA_DIMENSIONS.md` 定义用户画像底盘。
2. 用 8-12 个问题采集第一版用户画像。
3. 将画像转成 `persona_system/02_PERSONA_YAML_TEMPLATE.md` 这种结构。
4. 每次用户发消息时，先用 `language_system/02_READINESS_DETECTOR.md` 判断用户状态。
5. 根据状态调用 `language_system/03_RESPONSE_MODES.md`。
6. 最后用 `language_system/04_HUMANIZE_PASS.md` 做去 AI 味改写。
7. 用 `implementation/01_HOW_TO_EMBED_MARKDOWN_IN_MODEL.md` 规划 App 接入方式。

## 最小可执行逻辑

```text
用户输入
↓
读取用户画像 YAML
↓
判断 readiness_state
↓
选择 response_mode
↓
生成陪伴回复
↓
通过 HUMANIZE_PASS 去 AI 味
↓
输出给用户
↓
必要时更新用户画像
```
