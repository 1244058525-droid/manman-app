# 01｜用户画像维度表 V2 - 字段结构与确认机制

> 目标：让 AI 不只是“记住用户”，而是**可靠地、低压地、可修正地理解用户**。

这一版在原画像表基础上新增了画像字段的可信状态。

---

# 一、为什么需要 V2

原来的画像表解决的是：

> AI 需要理解用户哪些维度？

V2 额外解决：

> 这些信息到底是用户明确说的，还是 AI 推测的？  
> 能不能直接用于回复？  
> 要不要先确认？  
> 如果用户否认了，系统要怎么处理？

这一步很重要。

因为 AI 陪伴产品最怕：

> AI 自以为懂我，但其实在瞎猜。

---

# 二、画像字段分两类

## 1. 稳定画像字段

这些字段描述用户长期倾向。

例如：

- `emotion_pattern`
- `communication_preference`
- `decision_pattern`
- `action_barrier`
- `ideal_self`
- `aesthetic_value`

这些字段可以慢慢更新。

---

## 2. 事实型画像字段

这些字段不能乱猜，必须确认。

例如：

- 用户是否养宠物；
- 是否有伴侣；
- 是否独居；
- 是否有孩子；
- 是否照顾老人；
- 是否正在创业；
- 是否有某个具体长期项目；
- 是否存在某个具体消费限制。

这些字段必须带有：

```yaml
status:
confidence:
evidence:
needs_confirmation:
last_updated:
```

---

# 三、新增元字段说明

| 字段 | 含义 | 示例 |
|---|---|---|
| `status` | 该信息当前状态 | `unknown` / `inferred` / `confirmed` / `rejected` / `outdated` |
| `confidence` | AI 对该信息的置信度 | `low` / `medium` / `high` |
| `evidence` | 这个判断来自哪里 | 用户问卷选择 / 用户明确说过 / 多轮对话线索 |
| `needs_confirmation` | 是否需要用户确认 | `true` / `false` |
| `last_updated` | 最近更新时间 | `2026-05-04` |
| `source_type` | 信息来源类型 | `questionnaire` / `conversation` / `user_confirmation` / `system_inference` |
| `user_visible` | 是否建议在“我的画像”里展示 | `true` / `false` |

---

# 四、status 状态定义

| 状态 | 含义 | AI 是否能直接使用 |
|---|---|---|
| `unknown` | 不知道 | 不能使用 |
| `inferred` | 有线索，但只是推测 | 不能当事实，只能柔性确认 |
| `confirmed` | 用户明确确认过 | 可以自然使用 |
| `rejected` | 用户否认过 | 不能再提，除非用户主动重新提起 |
| `outdated` | 以前成立，但可能变化 | 使用前要重新确认 |

---

# 五、confidence 置信度定义

| 置信度 | 含义 | 示例 |
|---|---|---|
| `low` | 只有轻微信号 | 用户说“我喜欢看宠物视频”，不能推断养宠 |
| `medium` | 有较强线索，但未确认 | 用户问卷选择“宠物、照护、陪伴责任” |
| `high` | 用户明确说过 | 用户说“我有一只猫” |

---

# 六、字段使用规则

## 1. inferred 不能当事实使用

不要说：

> “你家宠物最近怎么样？”

如果只是 `inferred`，应该说：

> “我不确定这一点，所以轻轻问一句：宠物这块是你自己在照顾，还是只是比较关注？”

---

## 2. confirmed 可以自然使用

如果用户明确说过：

> “我有一只猫。”

之后可以说：

> “我会把你家有猫这点考虑进去。”

---

## 3. rejected 不要再提

如果用户说：

> “我没有养宠物，只是喜欢看。”

系统应更新：

```yaml
pet_profile:
  status: rejected
  confirmed_pet_owner: false
```

之后不要再主动提“你家宠物”。

---

## 4. outdated 使用前要确认

例如用户之前说“正在备考”，半年后可能已经变化。

可以问：

> “我之前记的是你在备考阶段，现在还是这个状态吗？不对的话我改掉。”

---

# 七、推荐新增的事实型子画像

## 1. 宠物画像 `pet_profile`

用于记录用户是否养宠物，以及宠物相关信息。

```yaml
pet_profile:
  status: unknown
  confidence: low
  confirmed_pet_owner: false
  pet_type: null
  pet_name: null
  pet_count: null
  care_responsibility: null
  evidence: []
  needs_confirmation: false
  last_updated: null
  source_type: null
  user_visible: true
```

---

## 2. 居住画像 `living_profile`

用于记录独居、合租、与家人同住等信息。

```yaml
living_profile:
  status: unknown
  confidence: low
  living_arrangement: null
  city_context: null
  home_responsibility: null
  evidence: []
  needs_confirmation: false
  last_updated: null
  source_type: null
  user_visible: true
```

---

## 3. 关系画像 `relationship_profile`

用于记录用户当前是否处于关系议题中。  
注意：不要主动追问隐私，只有用户主动提起或场景需要时才更新。

```yaml
relationship_profile:
  status: unknown
  confidence: low
  relationship_context: null
  main_relationship_pressure: null
  evidence: []
  needs_confirmation: false
  last_updated: null
  source_type: null
  user_visible: true
```

---

## 4. 照护画像 `care_profile`

用于记录用户是否照顾孩子、老人、家人、宠物、团队等。

```yaml
care_profile:
  status: unknown
  confidence: low
  care_targets: []
  care_pressure_level: null
  care_boundary_issue: null
  evidence: []
  needs_confirmation: false
  last_updated: null
  source_type: null
  user_visible: true
```

---

## 5. 工作/学习画像 `work_learning_profile`

用于记录用户当前工作/学习状态。

```yaml
work_learning_profile:
  status: unknown
  confidence: low
  role_type: null
  current_phase: null
  main_pressure: null
  output_style: null
  evidence: []
  needs_confirmation: false
  last_updated: null
  source_type: null
  user_visible: true
```

---

# 八、原画像维度主表 V2

| 维度 | 字段名 | 作用 | 是否需要置信度 |
|---|---|---|---|
| 当前生活状态 | `current_state` | 判断用户所处生活语境 | 部分需要 |
| 生活角色组合 | `life_role_profile` | 理解用户被哪些生活责任牵引 | 需要 |
| 宠物画像 | `pet_profile` | 判断用户是否有宠物相关生活责任 | 必须 |
| 居住画像 | `living_profile` | 判断用户生活空间和日常责任 | 必须 |
| 关系画像 | `relationship_profile` | 判断用户是否有关系议题 | 必须 |
| 照护画像 | `care_profile` | 判断用户是否承担长期照护 | 必须 |
| 工作/学习画像 | `work_learning_profile` | 判断用户主要责任来源 | 部分需要 |
| 情绪模式 | `emotion_pattern` | 识别常见情绪与触发点 | 建议 |
| 决策模式 | `decision_pattern` | 判断用户如何做选择 | 建议 |
| 沟通偏好 | `communication_preference` | 定义 AI 说话方式 | 建议 |
| 行动阻力 | `action_barrier` | 找到用户为什么做不到 | 建议 |
| 审美与价值观 | `aesthetic_value` | 理解用户向往的生活感 | 建议 |
| 理想自我 | `ideal_self` | 定义长期陪伴方向 | 建议 |

---

# 九、最小稳定规则

MVP 阶段不要给每个小字段都加复杂元信息。

只对这些“容易误判、误用会冒犯用户”的字段加：

- `pet_profile`
- `living_profile`
- `relationship_profile`
- `care_profile`
- `work_learning_profile`

其他字段可以先用普通结构，必要时再加证据和置信度。

---

# 十、核心原则

> 可以推测，但不能冒充确定。  
> 可以记住，但要允许用户看见和修改。  
> 可以探索，但不能在用户情绪很浓的时候追问。
