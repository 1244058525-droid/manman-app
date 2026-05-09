# USER_PERSONA_DIMENSIONS.md - 用户画像维度表

> 目标：不是判断“用户是哪种人”，而是告诉 AI “该如何陪这个人”。

这套画像系统用于 AI 陪伴产品 MVP。

它强调：

- 垂直；
- 精细；
- 可被模型读取；
- 可持续更新；
- 能直接影响回复方式。

---

## 一、主表

| 维度 | 字段名 | 作用 | 需要采集的内容 | AI 如何使用 |
|---|---|---|---|---|
| 当前生活状态 | `current_state` | 判断用户所处生活语境，避免回复脱离现实 | `life_stage`、`life_role_profile`、`stress_level`、`stability`、`recent_goal`、`key_pain` | 调整判断基准，理解这句话背后的生活背景 |
| 生活角色组合 | `life_role_profile` | 比“社会角色”更细，识别用户被哪些生活责任牵引 | `primary_life_domains`、`work_learning_role`、`household_role`、`relationship_role`、`care_role`、`self_management_role`、`consumption_role`、`role_conflict` | 让 AI 理解用户不是单一职业，而是多重生活角色的组合 |
| 情绪模式 | `emotion_pattern` | 识别用户最常见情绪与触发点 | `primary_emotion`、`secondary_emotion`、`triggers`、`low_mood_time`、`coping_style`、`recovery_need` | 决定先陪伴、先映照，还是进入分析 |
| 决策模式 | `decision_pattern` | 判断用户如何做选择、怕什么、容易卡在哪里 | `decision_style`、`fear_point`、`info_tolerance`、`influence_source`、`purchase_style`、`regret_pattern` | 给更适合的建议方式，减少冲动或犹豫 |
| 沟通偏好 | `communication_preference` | 定义 AI 的说话方式 | `preferred_role`、`tone`、`response_length`、`dislike_phrases`、`question_tolerance`、`push_tolerance` | 控制语气、结构、提问方式和提醒方式 |
| 行动阻力 | `action_barrier` | 找到用户为什么做不到 | `barrier_type`、`energy_level`、`ideal_action_size`、`fail_reason`、`accountability_style` | 判断用户是否能接住行动建议，并决定行动颗粒度 |
| 审美与价值观 | `aesthetic_value` | 理解用户向往的生活感与选择动机 | `life_aspiration`、`style_keywords`、`anti_keywords`、`purchase_motive`、`identity_projection` | 让表达、推荐、判断更贴近用户气质 |
| 理想自我 | `ideal_self` | 定义长期陪伴方向 | `desired_state`、`growth_direction`、`long_term_support`、`no_go_zone`、`success_signal` | 回复不只迎合当下，而是帮助用户靠近理想状态 |

---

## 二、字段展开说明

### 1. 当前生活状态 `current_state`

| 字段 | 含义 | 示例值 |
|---|---|---|
| `life_stage` | 用户当前人生阶段 | 刚毕业 / 职场上升期 / 创业期 / 稳定家庭期 / 转型期 |
| `life_role_profile` | 用户当前生活角色组合 | 见下方独立维度 |
| `stress_level` | 当前压力等级 | low / medium / high |
| `stability` | 当前生活稳定度 | 稳定 / 过渡期 / 混乱 |
| `recent_goal` | 最近最想改善的状态 | 少内耗 / 更自律 / 更松弛 / 少冲动消费 |
| `key_pain` | 当前主要困扰 | 工作压力 / 关系消耗 / 方向迷茫 / 选择困难 |

---

### 2. 生活角色组合 `life_role_profile`

这个字段替代原本粗糙的 `role_context`。

不要只问用户“你是什么职业”。  
更应该理解：

> 用户现在被哪些生活角色、责任、关系、期待和冲突牵引。

| 字段 | 含义 | 示例值 |
|---|---|---|
| `primary_life_domains` | 当前最牵引用户的生活领域 | 工作/学习 / 自我管理 / 关系 / 家庭 / 消费选择 / 照护 |
| `work_learning_role` | 工作/学习责任位置 | 学习者 / 执行型职场人 / 创作设计内容型工作者 / 管理者负责人 / 自由职业者 / 创业者经营者 / 家庭主要照顾者 / 暂时空档期 |
| `household_role` | 居住与家庭角色 | 独居者 / 与伴侣同住 / 与父母同住 / 已婚有家庭 / 有孩子家庭 / 合租者 / 频繁迁移者 |
| `relationship_role` | 关系中的情绪位置 | 单身独处型 / 恋爱关系中 / 婚姻关系中 / 关系受挫期 / 社交消耗型 / 低社交需求型 / 高连接需求型 |
| `care_role` | 是否承担照护责任 | 无明显照护责任 / 养宠人 / 照顾孩子 / 照顾老人 / 照顾伴侣家人 / 团队照护者 / 情绪照顾者 |
| `self_management_role` | 正在管理自己的哪一部分 | 情绪整理者 / 时间管理者 / 消费控制者 / 生活秩序重建者 / 身体状态恢复者 / 自我认知探索者 / 成长行动者 |
| `consumption_role` | 消费或选择中的典型模式 | 冲动购买者 / 犹豫比较者 / 理性筛选者 / 审美驱动者 / 安全感购买者 / 奖励型消费者 / 低欲望控制者 |
| `current_role_pressure` | 当前主要角色压力 | 工作输出压力 / 照护压力 / 关系压力 / 经济压力 / 信息过载 |
| `role_conflict` | 多角色之间的冲突 | 工作自我 vs 生活自我 / 理想自我 vs 现实能量 / 照护别人 vs 照顾自己 / 消费欲望 vs 理性控制 |
| `desired_role_shift` | 用户希望从什么状态转向什么状态 | 从被任务和情绪牵着走，转向更稳定、更轻盈地管理生活 |

#### 角色组合示例

```yaml
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
```

---

### 3. 情绪模式 `emotion_pattern`

| 字段 | 含义 | 示例值 |
|---|---|---|
| `primary_emotion` | 最常见核心情绪 | 焦虑 / 空虚 / 委屈 / 麻木 / 愤怒 |
| `secondary_emotion` | 次级情绪 | 自责 / 失控感 / 孤独 / 疲惫 |
| `triggers` | 常见触发点 | 信息过载 / 他人评价 / 被否定 / 睡前独处 |
| `low_mood_time` | 容易低落的时间段 | 睡前 / 下班后 / 周末 / 独处时 |
| `coping_style` | 情绪低落时的应对方式 | 刷短视频 / 冲动购物 / 暴饮暴食 / 沉默 |
| `recovery_need` | 低落时真正需要的支持 | 被陪伴 / 被安抚 / 被映照 / 被分析 / 被带着行动 |

---

### 4. 决策模式 `decision_pattern`

| 字段 | 含义 | 示例值 |
|---|---|---|
| `decision_style` | 做决定的主风格 | 冲动型 / 犹豫型 / 比较型 / 依赖确认型 |
| `fear_point` | 最怕什么 | 选错 / 后悔 / 浪费钱 / 错过机会 |
| `info_tolerance` | 对信息量的承受度 | 信息越多越安心 / 信息太多更乱 |
| `influence_source` | 最容易受谁影响 | 博主 / 朋友 / 评论 / 自己直觉 |
| `purchase_style` | 购买倾向 | 感性先行 / 理性比对 / 情绪驱动 |
| `regret_pattern` | 常见后悔模式 | 晚上冲动下单 / 比较太久错过 / 跟风购买 |

---

### 5. 沟通偏好 `communication_preference`

| 字段 | 含义 | 示例值 |
|---|---|---|
| `preferred_role` | 希望 AI 像谁 | 朋友 / 姐姐 / 顾问 / 树洞 / 搭子 |
| `tone` | 喜欢的语气 | 温柔低压 / 冷静理性 / 生活化陪伴 / 直接清醒 |
| `response_length` | 偏好的回复长度 | 简短 / 中等 / 详细 |
| `dislike_phrases` | 讨厌的表达 | 鸡汤 / 命令式 / 过度积极 / 说教 / 直接下定义 |
| `question_tolerance` | 可接受提问密度 | 低 / 中 / 高 |
| `push_tolerance` | 可接受提醒和推动强度 | 低 / 中 / 高 |

---

### 6. 行动阻力 `action_barrier`

| 字段 | 含义 | 示例值 |
|---|---|---|
| `barrier_type` | 行动阻碍类型 | 完美主义 / 低能量 / 三分钟热度 / 害怕失败 |
| `energy_level` | 当前行动能量 | low / medium / high |
| `ideal_action_size` | 最适合的行动颗粒度 | 表达一句话 / 3 分钟动作 / 今日仅 1 件事 |
| `fail_reason` | 过去常失败的原因 | 目标过大 / 没有第一步 / 太累 / 被打断 |
| `accountability_style` | 适合的监督方式 | 不催促 / 轻提醒 / 明确跟进 |

---

### 7. 审美与价值观 `aesthetic_value`

| 字段 | 含义 | 示例值 |
|---|---|---|
| `life_aspiration` | 向往的生活感 | 轻盈 / 有秩序 / 松弛 / 精致 / 安心 |
| `style_keywords` | 喜欢的关键词 | 自然 / 安静 / 克制 / 都会 / 柔和 |
| `anti_keywords` | 反感的关键词 | 浮夸 / 用力过猛 / 廉价感 / 过度热闹 |
| `purchase_motive` | 消费时买的是什么 | 功能 / 氛围 / 身份感 / 安全感 |
| `identity_projection` | 希望别人感知到的自我形象 | 有品位 / 温柔 / 稳定 / 轻松 / 专业 |

---

### 8. 理想自我 `ideal_self`

| 字段 | 含义 | 示例值 |
|---|---|---|
| `desired_state` | 最希望变成的状态 | 更稳定 / 更松弛 / 更有行动力 / 更少内耗 |
| `growth_direction` | 想重点提升的方向 | 情绪 / 表达 / 关系 / 消费判断 / 生活秩序 |
| `long_term_support` | 长期最需要的支持 | 少自责 / 更被陪伴 / 多行动 / 更会判断 |
| `no_go_zone` | 不希望被触碰的方式 | 不要说教 / 不要高压推动 / 不要直接下定义 |
| `success_signal` | 用户如何感知自己变好了 | 更少刷空视频 / 更快做决定 / 睡前更平静 |

---

## 三、运行时状态字段 `runtime_state`

这个字段不是长期画像，而是每次对话时临时判断。

```yaml
runtime_state:
  readiness_state: emotional | mixed | rational | action_ready
  current_scene: 情绪倾诉 | 自我怀疑 | 消费选择 | 关系困扰 | 拖延执行 | 睡前空虚
  emotional_intensity: low | medium | high
  user_requested_solution: true | false
  recommended_response_mode: companion_mode | reflection_mode | analysis_mode | action_mode
```

它决定本轮对话应该陪伴，还是分析，还是行动。

---

## 四、模型调用规则

| 用户场景 | 优先调用字段 | 回复策略 |
|---|---|---|
| 情绪倾诉 | `runtime_state` + `emotion_pattern` + `communication_preference` | 先陪伴，不急着解决 |
| 自我怀疑 | `runtime_state` + `emotion_pattern` + `ideal_self` | 停止自我贴标签，柔性映照 |
| 消费 / 选择 | `runtime_state` + `decision_pattern` + `aesthetic_value` | 如果用户未准备好，先理解纠结；准备好后再给判断 |
| 拖延 / 执行 | `runtime_state` + `action_barrier` + `communication_preference` | 情绪态先陪伴，行动态再缩小动作 |
| 主动消息 | `current_state` + `emotion_pattern` + `ideal_self` | 像朋友一样低压跟进，不打扰 |

---

## 五、统一原则

1. 用户情绪态时，不解决。
2. 用户混合态时，不下定义。
3. 用户理性态时，可以分析。
4. 用户行动态时，才给具体方案。
5. 所有回复都要结合用户沟通偏好。
6. 用户画像是为了更好地陪伴，不是为了控制用户。
