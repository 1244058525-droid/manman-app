# PERSONA_YAML_TEMPLATE.md - 用户画像 YAML 模板

这个模板用于让模型读取用户画像。

MVP 阶段可以直接把这段 YAML 存到数据库里。每次用户对话时，后端读取这份画像，和语言系统规则一起传给模型。

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
  work_learning_role: 创作设计内容型工作者
  household_role: 独居者
  relationship_role: 低社交需求型
  care_role: 养宠人
  self_management_role: 情绪整理者
  consumption_role: 审美驱动者
  current_role_pressure:
    - 工作输出压力
    - 信息过载
    - 睡前空虚
  role_conflict:
    - 理想自我 vs 现实能量
    - 松弛愿望 vs 自律焦虑
  desired_role_shift:
    from: 被任务和情绪牵着走
    to: 更稳定、更轻盈地管理生活

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
  fear_point: 选错和后悔
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
```
