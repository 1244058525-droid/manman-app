# 画像探索机制更新包说明

这个更新包解决两个问题：

1. **问卷不能一次问太深，后续怎么慢慢了解用户？**
2. **AI 怎么避免把推测当事实？**

本包建议放在原来的 `persona_system/` 文件夹里，文件名已经做了区分：

```text
persona_system/
├── 01_persona_dimensions_v2_field_schema.md
├── 02_persona_yaml_template_v2_with_confidence.md
└── 03_profile_exploration_rules_v1.md
```

## 使用方式

### 1. 先看 `01_persona_dimensions_v2_field_schema.md`

它定义画像字段和新增的“置信度/确认状态”规则。

### 2. 再看 `02_persona_yaml_template_v2_with_confidence.md`

它是模型可以读取的用户画像模板。

### 3. 最后看 `03_profile_exploration_rules_v1.md`

它规定 AI 什么时候可以探索式提问、什么时候不能问、怎么问才不打扰用户。

## 核心原则

> 初始问卷只建立第一版画像。  
> 深层信息靠后续对话慢慢长出来。  
> 推测不能当事实。  
> 关键事实必须确认。  
> 情绪状态下不做探索式追问。
