# 初始画像问卷 V1｜AI 陪伴产品

> 目标：这不是“性格测试”，也不是心理诊断。  
> 它的作用是让 AI 先学会怎样陪你：什么时候先陪着，什么时候轻轻映照，什么时候再进入分析和行动。

---

## 0. 产品开场文案

### 标题

**我想先认识你一点，再陪你。**

### 副文案

不用一次把自己讲清楚。  
你只要凭感觉选就好，大概 3 分钟。

答完后，我会生成一份属于你的「陪伴说明书」：  
我该怎么和你说话、什么时候不要急着分析、什么时候可以陪你一起拆问题。

你之后随时可以改。

### 安全边界文案

这不是心理诊断，也不会把你固定成某一种人。  
它只是帮助我更温柔、更准确地理解你。

---

## 1. 问卷设计原则

| 原则 | 说明 |
|---|---|
| 第一题必须轻 | 第一题不要让用户用力回忆，也不要问隐私问题 |
| 先状态，后深度 | 先问“最近的你”，再问“你习惯怎样被陪伴” |
| 少问判断题 | 不让用户觉得自己被审问、被分类 |
| 多用生活化表达 | 避免“人格倾向”“心理机制”等距离感强的词 |
| 每题都有画像用途 | 每个答案都要能映射到画像字段 |
| 允许跳过 | 用户不想答时，不能产生压力 |
| 结果要立刻有用 | 答完不是给标签，而是给“AI 如何陪我”的说明书 |

---

## 2. 问卷结构

| 阶段 | 题目 | 目标 |
|---|---|---|
| A. 最近状态 | Q1-Q2 | 判断当前生活状态、情绪主线 |
| B. 被陪伴方式 | Q3-Q4 | 判断沟通偏好、情绪态回复方式 |
| C. 生活角色组合 | Q5-Q6 | 判断用户被哪些生活责任牵引 |
| D. 决策与行动 | Q7-Q9 | 判断决策模式、行动阻力 |
| E. 审美与理想自我 | Q10-Q11 | 判断生活向往和长期陪伴方向 |
| F. 主动陪伴边界 | Q12 | 判断主动消息接受度 |
| G. 可选开放题 | Q13-Q14 | 增加个性化深度和首轮“被看见感” |

---

# 3. 正式问卷

## Q1. 最近的你，更像哪一种状态？

### 页面文案

不用选“最准确”的，选第一眼最像的就好。

### 题型

单选

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | 很累，但停不下来 | `current_state.stress_level=high`；`emotion_pattern.primary_emotion=疲惫` |
| B | 脑子很乱，事情很多 | `emotion_pattern.primary_emotion=焦虑`；`triggers=信息过载` |
| C | 有点空，不太知道自己想要什么 | `emotion_pattern.primary_emotion=空虚`；`low_mood_time=独处/睡前` |
| D | 表面正常，但心里消耗很大 | `emotion_pattern.secondary_emotion=内耗` |
| E | 想变好，但就是动不起来 | `action_barrier.barrier_type=低能量/启动困难` |
| F | 其实还可以，只是想找个更懂我的 AI | `current_state.stress_level=medium/low`；`recent_goal=更被理解` |

---

## Q2. 你通常在什么时候，最想有人陪你一下？

### 页面文案

这里不是问“你脆弱吗”，只是帮我知道该在哪些时刻更轻一点。

### 题型

多选，最多 3 个

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | 睡前，脑子开始乱的时候 | `emotion_pattern.low_mood_time=睡前` |
| B | 工作/学习被打断、被否定之后 | `triggers=被否定/工作压力` |
| C | 做选择，不知道该怎么办的时候 | `decision_pattern.decision_style=犹豫型` |
| D | 和别人相处不舒服之后 | `relationship_role=关系消耗型`；`triggers=人际摩擦` |
| E | 刷手机刷到空下来的时候 | `coping_style=刷短视频逃避`；`primary_emotion=空虚` |
| F | 一个人吃饭、通勤、散步的时候 | `relationship_role=单身独处型/高连接需求型` |
| G | 买东西前，想让人帮我判断一下 | `consumption_role=犹豫比较者/冲动购买者` |

---

## Q3. 你状态不好的时候，最不想听到哪种话？

### 页面文案

这题很重要。它会告诉我，以后哪些话不要对你说。

### 题型

多选，最多 3 个

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | “你要积极一点” | `communication_preference.dislike_phrases+=过度积极` |
| B | “你已经很棒了”这种泛泛鼓励 | `dislike_phrases+=鸡汤` |
| C | 一上来就给我分析原因 | `dislike_phrases+=过早分析` |
| D | 直接告诉我“你就是在逃避/内耗” | `dislike_phrases+=直接下定义` |
| E | 给我列一堆建议 | `dislike_phrases+=建议过载` |
| F | 一直问我“为什么” | `question_tolerance=low` |
| G | 太冷静、太客观，像客服 | `tone_preference=生活化/有温度` |

---

## Q4. 如果你不开心，我更适合先怎么陪你？

### 页面文案

不是永远这样，只是先让我知道你的默认偏好。

### 题型

单选

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | 先别分析，陪我待一会儿 | `recovery_need=先陪伴`；`readiness_default=emotional` |
| B | 先帮我把感受说清楚 | `recovery_need=轻轻映照`；`response_mode=reflection_mode` |
| C | 可以温柔地帮我分析 | `recovery_need=陪伴后分析`；`response_mode=mixed_to_analysis` |
| D | 我更喜欢直接一点，别绕 | `tone=直接清醒`；`readiness_default=rational` |
| E | 先问我一句要不要解决 | `communication_preference.need_choice=true` |
| F | 看情况，你先判断我是不是准备好了 | `runtime_rule=detect_readiness_first` |

---

## Q5. 最近你的生活，主要被哪些事情牵着走？

### 页面文案

一个人不只有职业。这里是想知道你最近真正被什么占用。

### 题型

多选，最多 4 个

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | 工作/学习任务 | `primary_life_domains+=工作/学习` |
| B | 创作、设计、内容、表达 | `work_learning_role=创作设计内容型工作者` |
| C | 团队、沟通、管理责任 | `work_learning_role=管理者负责人/团队照护者` |
| D | 家庭、伴侣、孩子、父母 | `primary_life_domains+=家庭/关系/照护` |
| E | 宠物、照护、陪伴责任 | `care_role=养宠人/照护者` |
| F | 自己的情绪和状态 | `self_management_role=情绪整理者` |
| G | 花钱、选择、购物纠结 | `primary_life_domains+=消费选择` |
| H | 转型、迷茫、方向感 | `current_state.stability=过渡期`；`key_pain=方向迷茫` |

---

## Q6. 最近最消耗你的，比较像哪种拉扯？

### 页面文案

有时候累不是因为一件事，而是几个自己在打架。

### 题型

多选，最多 2 个

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | 想变好，但真的没能量 | `role_conflict+=理想自我 vs 现实能量` |
| B | 想松弛，但又怕自己落后 | `role_conflict+=松弛愿望 vs 自律焦虑` |
| C | 想照顾别人，但自己也很累 | `role_conflict+=照护别人 vs 照顾自己` |
| D | 想买点东西奖励自己，但又怕后悔 | `role_conflict+=消费欲望 vs 理性控制` |
| E | 想独立，但也很想被理解 | `role_conflict+=独立需求 vs 被理解需求` |
| F | 不想社交，但又怕关系变远 | `role_conflict+=社交期待 vs 自我边界` |
| G | 想做出成绩，但生活已经被挤压 | `role_conflict+=工作自我 vs 生活自我` |

---

## Q7. 当你说“我不知道怎么办”时，通常是哪一种？

### 页面文案

我会根据这个，决定是先陪你，还是帮你拆。

### 题型

单选

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | 其实我只是太乱了，想先有人听我说 | `readiness_default=emotional`；`recovery_need=被陪伴` |
| B | 我想知道自己为什么这样 | `readiness_default=mixed/rational`；`recovery_need=分析原因` |
| C | 我需要有人帮我判断哪个更好 | `decision_pattern.decision_style=依赖确认型` |
| D | 我知道该做什么，但启动不了 | `action_barrier.barrier_type=启动困难` |
| E | 我想直接知道下一步怎么做 | `readiness_default=action_ready` |
| F | 我自己也不确定，需要你先判断 | `runtime_rule=detect_readiness_first` |

---

## Q8. 做选择时，你最容易卡在哪里？

### 页面文案

比如买东西、回消息、做决定，都算。

### 题型

多选，最多 2 个

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | 信息太多，越看越乱 | `decision_pattern.info_tolerance=信息太多更乱` |
| B | 怕选错，怕后悔 | `decision_pattern.fear_point=选错/后悔` |
| C | 总想找到最优解 | `decision_style=完美比较型` |
| D | 很容易被别人推荐带走 | `influence_source=博主/朋友/评论` |
| E | 当下喜欢就想买/做，之后又后悔 | `purchase_style=情绪驱动`；`regret_pattern=冲动后悔` |
| F | 其实我能判断，但需要被确认一下 | `decision_style=确认需求型` |

---

## Q9. 你想改变一件事时，最容易卡在哪里？

### 页面文案

这里不是看你有没有自律，是看我以后怎么把事情帮你变小。

### 题型

多选，最多 2 个

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | 一开始目标定太大 | `action_barrier.fail_reason=目标过大` |
| B | 不知道第一步是什么 | `fail_reason=没有第一步` |
| C | 太累了，没电 | `energy_level=low` |
| D | 容易三分钟热度 | `barrier_type=三分钟热度` |
| E | 怕做不好，所以干脆不开始 | `barrier_type=完美主义/害怕失败` |
| F | 很容易被手机、短视频打断 | `fail_reason=被娱乐分心` |

---

## Q10. 你更向往哪种生活感？

### 页面文案

这题会影响我以后怎么给你建议、推荐和表达。

### 题型

多选，最多 3 个

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | 轻一点，不用太用力 | `aesthetic_value.life_aspiration=轻盈` |
| B | 有秩序，心里更稳 | `life_aspiration=有秩序/安心` |
| C | 更松弛，不总是紧绷 | `life_aspiration=松弛` |
| D | 更有行动力，不总是卡住 | `ideal_self.desired_state=更有行动力` |
| E | 更会选择，少后悔 | `ideal_self.growth_direction=消费判断/决策` |
| F | 更像自己，而不是一直迎合别人 | `growth_direction=表达/边界` |
| G | 生活更有审美和质感 | `style_keywords=审美/生活感` |

---

## Q11. 如果我长期陪你，你最希望我帮你靠近哪种状态？

### 页面文案

不用宏大，选一个你最想慢慢靠近的方向。

### 题型

单选

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | 少一点内耗 | `ideal_self.desired_state=更少内耗` |
| B | 睡前更平静 | `success_signal=睡前更平静` |
| C | 做决定更轻松 | `success_signal=选择更快` |
| D | 情绪来的时候不那么孤单 | `long_term_support=更被陪伴` |
| E | 想做的事能慢慢开始 | `growth_direction=行动力` |
| F | 买东西更清醒 | `growth_direction=消费判断` |
| G | 更敢表达自己的感受 | `growth_direction=表达/关系边界` |

---

## Q12. 你愿意我主动来找你吗？

### 页面文案

像朋友轻轻问一句，不是打卡，也不是催你。

### 题型

单选

| 选项 | 用户看到的文案 | 映射字段 |
|---|---|---|
| A | 可以，晚上轻轻问我一句就好 | `push_tolerance=low`；`push_time=晚间` |
| B | 可以，但不要太频繁 | `push_tolerance=medium_low` |
| C | 只有我提过重要事情时，你再跟进 | `push_type=event_followup_only` |
| D | 我不太喜欢主动提醒 | `push_tolerance=low/off` |
| E | 以后再说，先别主动找我 | `push_enabled=false` |

---

# 4. 可选开放题

## Q13. 最近最让你消耗的一件事是什么？

### 页面文案

可以只写一句，不用讲完整。

### 题型

开放题，可跳过

### 映射字段

- `current_state.key_pain`
- `emotion_pattern.triggers`
- `life_role_profile.current_role_pressure`
- `runtime personalization seed`

---

## Q14. 如果我以后陪你，你最希望我记住你哪一点？

### 页面文案

可以是一个偏好、一句禁忌、一个习惯，或者一句“别这样对我”。

### 题型

开放题，可跳过

### 映射字段

- `communication_preference`
- `ideal_self.no_go_zone`
- `user_voice_profile`
- `long_term_memory`

---

# 5. 结果页结构

用户答完后，不要只显示人格类型。

推荐结果页分成 5 个模块：

---

## 模块 1：陪伴人格名

示例：

> 你现在更像「雾中整理者」。

说明：

> 你不是没有方向，而是最近脑子里同时装了太多东西。你很想把生活理顺，但又不适合被强行催促。比起马上解决，你更需要先被接住，然后再慢慢把事情拆小。

---

## 模块 2：我应该怎么陪你

示例：

```text
我以后会尽量这样陪你：

1. 当你情绪很满时，先不急着分析。
2. 当你开始想理解原因时，我会轻轻帮你映照。
3. 当你明确想解决时，我再陪你拆下一步。
4. 我会少用鸡汤、少下定义、少催你。
5. 如果你愿意，我会在晚上低压地问你一句。
```

---

## 模块 3：我不应该怎么对你

示例：

```text
我会尽量避开：

- 一上来讲道理；
- 直接说“你是在逃避”；
- 给你列一堆建议；
- 用“你已经很棒了”这种空话；
- 在你还没准备好时催你行动。
```

---

## 模块 4：你的当前画像摘要

示例：

```yaml
persona_name: 雾中整理者
current_state:
  stress_level: high
  recent_goal: 少内耗
emotion_pattern:
  primary_emotion: 焦虑/空虚
  recovery_need: 先陪伴，再轻轻映照
communication_preference:
  tone: 生活化、低压、具体
  dislike_phrases:
    - 鸡汤
    - 直接下定义
    - 建议过载
action_barrier:
  ideal_action_size: 表达一句话或 3 分钟小动作
ideal_self:
  desired_state: 更稳定、更少内耗
```

---

## 模块 5：确认保存

### 页面文案

这份画像只是第一版。  
以后你和我聊天时，我会慢慢修正它。

按钮：

- 保存我的陪伴画像
- 我想改一改
- 先跳过

---

# 6. 简易评分 / 映射方法

MVP 阶段不需要复杂算法。

推荐使用标签累计法：

1. 每个选项对应 1-3 个标签。
2. 用户选择后，标签计数。
3. 每个维度取权重最高的 1-3 个标签。
4. 开放题作为高优先级个性化记忆。
5. 最后由模型生成自然语言报告和 YAML 画像。

---

## 核心维度映射

| 画像维度 | 主要来源题目 |
|---|---|
| `current_state` | Q1、Q5、Q13 |
| `life_role_profile` | Q5、Q6、Q13 |
| `emotion_pattern` | Q1、Q2、Q3、Q7、Q13 |
| `decision_pattern` | Q7、Q8 |
| `communication_preference` | Q3、Q4、Q12、Q14 |
| `action_barrier` | Q7、Q9 |
| `aesthetic_value` | Q10 |
| `ideal_self` | Q10、Q11、Q14 |
| `push_tolerance` | Q12 |

---

# 7. 问卷语气规范

## 可以使用

- 不用选最准确的，选第一眼最像的就好。
- 这里不是要给你分类，只是让我知道怎么更好地陪你。
- 可以跳过。
- 不用讲完整。
- 我不会急着分析你。
- 这只是第一版，之后可以改。

## 不要使用

- 请根据真实情况作答。
- 以下问题将用于评估你的人格类型。
- 你的选择将决定你的心理画像。
- 请认真完成测试。
- 系统将生成诊断结果。
- 你属于以下类型。

---

# 8. MVP 版本建议

第一版不要超过 12 个主问题。

如果担心太长，可以做成两版：

## 短版：7 题

Q1、Q2、Q3、Q4、Q5、Q7、Q11

适合快速验证。

## 标准版：12 题

Q1-Q12

适合生成完整画像。

## 深度版：12 题 + 2 个开放题

适合愿意深度体验的用户。

推荐 MVP 用：

> 标准版 12 题 + 开放题可跳过。
