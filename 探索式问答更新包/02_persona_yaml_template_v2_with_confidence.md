# 02｜用户画像 YAML 模板 V2 - 含置信度与确认状态

这个模板用于给模型读取用户画像。

MVP 阶段可以直接存成 YAML / JSON。

---

# 一、完整模板

```yaml
persona_name: 雾中整理者

current_state:
  life_stage: 职场上升期
  stress_level: high
  stability: 过渡期
  recent_goal: 少内耗
  key_pain: 工作压力 + 方向混乱

life_role_profile:
  primary_life_domains:
    - 工作/学习
    - 自我管理
    - 消费选择
  role_conflict:
    - 理想自我 vs 现实能量
    - 松弛愿望 vs 自律焦虑
  desired_role_shift:
    from: 被任务和情绪牵着走
    to: 更稳定、更轻盈地管理生活

pet_profile:
  status: inferred
  confidence: medium
  confirmed_pet_owner: false
  pet_type: null
  pet_name: null
  pet_count: null
  care_responsibility: null
  evidence:
    - 用户在初始问卷中选择了“宠物、照护、陪伴责任”
  needs_confirmation: true
  last_updated: 2026-05-04
  source_type: questionnaire
  user_visible: true

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

care_profile:
  status: inferred
  confidence: medium
  care_targets:
    - 可能与宠物相关
  care_pressure_level: null
  care_boundary_issue: null
  evidence:
    - 用户在初始问卷中选择了“宠物、照护、陪伴责任”
  needs_confirmation: true
  last_updated: 2026-05-04
  source_type: questionnaire
  user_visible: true

work_learning_profile:
  status: inferred
  confidence: medium
  role_type: 创作设计内容型工作者
  current_phase: 输出压力期
  main_pressure:
    - 创作输出
    - 信息过载
  output_style: 审美/内容/表达相关
  evidence:
    - 用户在初始问卷中选择了“创作、设计、内容、表达”
  needs_confirmation: false
  last_updated: 2026-05-04
  source_type: questionnaire
  user_visible: true

emotion_pattern:
  primary_emotion: 焦虑
  secondary_emotion: 自责
  triggers:
    - 信息过载
    - 他人评价
    - 睡前独处
  low_mood_time: 睡前
  coping_style: 刷短视频逃避
  recovery_need: 先被陪伴，再被轻轻映照

decision_pattern:
  decision_style: 犹豫型
  fear_point:
    - 选错
    - 后悔
  info_tolerance: 信息太多会更乱
  influence_source:
    - 博主
    - 自己直觉
  purchase_style: 感性先行
  regret_pattern: 晚上冲动下单

communication_preference:
  preferred_role: 温柔但清醒的朋友
  tone: 生活化、低压、具体
  response_length: 中等偏短
  dislike_phrases:
    - 鸡汤
    - 命令式
    - 过度积极
    - 直接下定义
    - 被指出问题
  question_tolerance: medium
  push_tolerance: low

action_barrier:
  barrier_type:
    - 完美主义
    - 低能量
  energy_level: low
  ideal_action_size: 表达一句话或 3 分钟小动作
  fail_reason: 目标过大
  accountability_style: 轻提醒，不催促

aesthetic_value:
  life_aspiration: 轻盈、有秩序、不用太用力
  style_keywords:
    - 自然
    - 安静
    - 克制
    - 舒适
  anti_keywords:
    - 浮夸
    - 过度热闹
    - 用力过猛
  purchase_motive:
    - 氛围
    - 身份感
  identity_projection:
    - 温柔
    - 稳定
    - 有品位

ideal_self:
  desired_state:
    - 更稳定
    - 更少内耗
  growth_direction:
    - 情绪稳定
    - 行动力
  long_term_support: 少自责，多一点被陪着完成的感觉
  no_go_zone:
    - 不要说教
    - 不要高压推动
    - 不要直接下定义
  success_signal:
    - 睡前更平静
    - 选择更快
    - 刷完手机后更少自责

runtime_state:
  readiness_state: emotional
  current_scene: 情绪倾诉
  emotional_intensity: medium
  user_requested_solution: false
  recommended_response_mode: companion_mode

profile_exploration:
  allow_exploration_now: false
  reason: 用户当前处于 emotional，不适合追问画像
  possible_next_question: null
```

---

# 二、宠物信息更新示例

## 1. 只有问卷线索时

```yaml
pet_profile:
  status: inferred
  confidence: medium
  confirmed_pet_owner: false
  pet_type: null
  evidence:
    - 用户在初始问卷中选择了“宠物、照护、陪伴责任”
  needs_confirmation: true
```

AI 不能说：

> 你家宠物……

只能问：

> 我不确定这一点，所以轻轻问一句：宠物这块是你自己在照顾，还是只是比较关注？

---

## 2. 用户明确确认后

用户说：

> 我有一只猫。

更新为：

```yaml
pet_profile:
  status: confirmed
  confidence: high
  confirmed_pet_owner: true
  pet_type: 猫
  pet_name: null
  evidence:
    - 用户明确说“我有一只猫”
  needs_confirmation: false
  last_updated: 2026-05-04
  source_type: user_confirmation
  user_visible: true
```

AI 以后可以自然使用：

> 我会把你家有猫这点考虑进去。

---

## 3. 用户否认后

用户说：

> 我没有养宠物，只是喜欢看宠物内容。

更新为：

```yaml
pet_profile:
  status: rejected
  confidence: high
  confirmed_pet_owner: false
  pet_type: null
  evidence:
    - 用户明确说“我没有养宠物，只是喜欢看宠物内容”
  needs_confirmation: false
  last_updated: 2026-05-04
  source_type: user_confirmation
  user_visible: true
```

AI 以后不要主动提“你家宠物”。

---

# 三、模型读取提示

每次模型回复时，只需要读取相关片段。

## 情绪倾诉场景

读取：

```yaml
emotion_pattern
communication_preference
ideal_self
runtime_state
```

## 消费选择场景

读取：

```yaml
decision_pattern
aesthetic_value
communication_preference
runtime_state
```

## 宠物相关场景

读取：

```yaml
pet_profile
care_profile
decision_pattern
aesthetic_value
runtime_state
```

## 关系困扰场景

读取：

```yaml
relationship_profile
emotion_pattern
communication_preference
runtime_state
```

---

# 四、MVP 简化建议

MVP 阶段只强制维护这些字段的状态：

- `pet_profile`
- `living_profile`
- `relationship_profile`
- `care_profile`
- `work_learning_profile`

其他字段先用普通画像结构即可。
