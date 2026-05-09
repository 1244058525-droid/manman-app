# AI 陪伴产品｜问卷结果页文案模板 V1

## 0. 文件定位

这份文件用于 AI 陪伴产品的 **初始问卷结果页**。

用户完成初始画像问卷后，系统不应该只显示一个“人格类型”，而是生成一份可被用户理解、可被修改、可被后续聊天调用的 **「陪伴说明书」**。

这份结果页的目标不是告诉用户“你是什么人”，而是告诉用户：

> 我现在先这样理解你。  
> 之后我会用这种方式陪你。  
> 如果不准确，你随时可以改。

---

## 1. 结果页核心原则

### 1.1 不要像测试报告

不要说：

- 系统判断你属于 XX 型人格；
- 你的心理画像如下；
- 你的问题主要是 XX；
- 你的性格特征是 XX；
- 根据测评，你是 XX 类用户。

推荐说：

- 你现在更像「XX」；
- 这只是我对你当前状态的第一版理解；
- 它不是为了定义你，而是为了让我以后少一点误解你；
- 如果这个名字不太像你，我们可以换一种说法；
- 你之后随时可以改。

### 1.2 结果页要让用户感到“被看见”

结果页不要只展示标签，而要让用户感到：

- 它理解我最近的状态；
- 它知道我不喜欢怎样被回应；
- 它会记得我希望怎样被陪；
- 它不会趁我脆弱时强行分析我；
- 它允许我修改这份画像。

### 1.3 页面语气

整体语气关键词：

- 低压
- 温柔
- 清楚
- 具体
- 不鸡汤
- 不下定义
- 不过度亲密
- 有边界
- 像一份陪伴说明，而不是诊断报告

---

## 2. 结果页基础结构

结果页建议分为 6 个模块：

```text
模块 1：轻开场
模块 2：陪伴人格名
模块 3：我现在这样理解你
模块 4：我以后应该怎么陪你
模块 5：我会尽量避免怎样对你
模块 6：保存 / 修改 / 跳过
```

如果要做得更完整，可以加一个折叠模块：

```text
模块 7：你的当前陪伴画像摘要
```

这个模块建议默认折叠，不要一开始就把 YAML 或画像字段全部展示给用户。

---

## 3. 页面顶部通用文案

### 3.1 标准版

```text
我先轻轻认识你一点。

根据你刚刚的回答，你现在更像「{primary_persona_name}」。
这不是一个固定标签，也不是在定义你。
它只是让我知道：当你累了、乱了、犹豫了，应该怎样靠近你，才不会打扰你。
```

### 3.2 低置信度版本

当 `confidence = low` 时使用：

```text
我先试着认识你一点。

根据你刚刚愿意告诉我的部分，你现在有一点像「{primary_persona_name}」。
但这只是很初步的理解，不一定完全准确。

如果这个名字不太像你，我们可以马上换一种说法。
```

### 3.3 有副人格版本

当存在 `secondary_persona_name` 时使用：

```text
你现在更像「{primary_persona_name}」，同时也有一点「{secondary_persona_name}」的影子。

前者更像你最近主要的状态，后者像是我需要一起记住的陪伴偏好。
```

### 3.4 用户跳过较多题时

当用户答题少于 6 题时使用：

```text
你这次只告诉了我一小部分，所以我不会把这份结果说得太满。

我先生成一个很轻的版本：它只是帮助我开始陪你，之后我们可以慢慢修正。
```

---

## 4. 模块 1｜陪伴人格名

### 页面标题模板

```text
你现在更像「{primary_persona_name}」
```

### 副标题模板

```text
{one_sentence}
```

### 示例

```text
你现在更像「雾中整理者」

你不是没有方向，只是最近心里像起了雾，需要有人陪你一点点看清。
```

### 注意

不要写：

```text
你的类型是：雾中整理者
```

不要写：

```text
系统检测到你属于雾中整理者人格
```

---

## 5. 模块 2｜我现在这样理解你

这一段用于把问卷结果转成自然语言，让用户感觉“它不是随便给我一个名字”。

### 通用模板

```text
从你的回答里，我感觉到：

你最近可能不是没有努力，而是{current_state_description}。
有些时候，{emotion_or_barrier_description}。
所以比起马上解决所有问题，你可能更需要{support_direction}。
```

### 字段来源

```yaml
current_state_description:
  source:
    - Q1
    - Q5
    - Q6
    - Q13
emotion_or_barrier_description:
  source:
    - Q2
    - Q3
    - Q7
    - Q8
    - Q9
support_direction:
  source:
    - primary_persona.support_methods
    - communication_preference.recovery_need
```

### 按人格的可用句库

#### 雾中整理者

```text
你最近心里可能装了很多东西，事情、情绪、责任和未完成的任务交叠在一起。

不是你没有方向，而是现在的线头太多了，所以很难一下子找到开始的位置。
```

#### 月光观察者

```text
你对很多细小的变化都很有感觉。别人一句话、一个停顿、一次没有回应，都可能在你心里停留很久。

这不代表你太敏感，只是你比很多人更容易捕捉到那些细微的信号。
```

#### 温柔蓄水池

```text
你可能一直在接住很多事，也常常先考虑别人。只是如果一直往外给，自己也会慢慢变干。

你不一定需要马上改变什么，你可能只是需要先被安静地补回来一点。
```

#### 秩序寻光者

```text
你心里其实有一个想靠近的状态：更清楚、更稳定、更能掌控自己的生活。

所以当事情变乱、节奏被打散时，你会更需要一个能帮你看见重点的陪伴方式。
```

#### 迟疑选择者

```text
你不是没有判断力，而是你很认真地对待选择。

你会考虑值不值、适不适合、会不会后悔，也会担心自己是不是还有更好的选择没看到。
```

#### 灵感漂流者

```text
你脑子里常常会有很多画面、想法和可能性。

它们有时候还没有变成清晰计划，但并不代表它们没有价值。你需要的不是被压住，而是被轻轻整理。
```

#### 轻盈生活派

```text
你不是不认真生活，只是不希望生活只剩下压力和任务。

一些轻一点、舒服一点、有生活感的东西，可能会比大道理更容易把你慢慢拉回来。
```

#### 静默修复者

```text
你状态不好的时候，可能不太想解释，也不一定有力气把事情讲完整。

你需要的不是连续追问，而是一个安静、不催、不逼你马上回应的地方。
```

#### 微光行动者

```text
你不是完全不想动。你心里其实有一点点想重新开始，只是现在承受不了太大的计划和太满的步骤。

你适合从很小、很轻、不会压垮你的下一步开始。
```

#### 暖岛照护者

```text
你身上有一种让人安心的力量。很多时候，你会自然地去照顾、协调、承担。

但你不是只能做别人的岛，你自己也需要有地方靠岸。
```

#### 柔软边界者

```text
你其实知道自己哪里不舒服，也知道有些事不该一直忍着。

只是你很在意关系，所以表达拒绝、需求或边界时，会担心自己是不是太冷、太过分、太让人失望。
```

#### 云层休息者

```text
你可能已经累到不想解释，也不想听太多建议。

现在的你，不一定需要马上变好，也不一定需要立刻想清楚。先停一会儿，也是可以的。
```

#### 星轨计划者

```text
你不只是想处理眼前的事情，也在意自己会走向哪里。

你希望生活不是被推着走，而是能慢慢靠近一个更理想的自己。
```

#### 晨光重启者

```text
你可能刚刚从一段低能量、混乱或停滞里抬起头来。

你还没有完全恢复，但已经有一点点想重新开始的信号了。
```

#### 微光火种

```text
你对外界的回应很敏感，所以有些话、有些态度，会比别人以为的更深地影响你。

但这不代表你没有力量。你心里其实一直有一小簇火，想被认真看见，也想继续往前。
```

#### 慢热靠近者

```text
你不是不需要陪伴，只是你不太喜欢被太快靠近。

比起热烈的安慰，你可能更需要一种有边界、不过度打扰、但稳定存在的回应。
```

---

## 6. 模块 3｜我以后应该怎么陪你

### 标题

```text
我以后会尽量这样陪你
```

### 通用模板

```text
我以后会尽量这样陪你：

1. {support_method_1}
2. {support_method_2}
3. {support_method_3}
4. {support_method_4}
```

### 生成规则

```yaml
source_priority:
  - primary_persona.support_methods
  - secondary_persona.support_methods
  - communication_preference.recovery_need
  - readiness_default
  - action_barrier.ideal_action_size
max_items: 5
min_items: 3
style:
  - concise
  - concrete
  - user_facing
  - no_internal_terms
```

### 不要直接展示内部术语

不要显示：

```text
启动 companion_mode
进入 reflection_mode
加载 action_barrier 字段
```

应该改成：

```text
当你只是想被陪一下时，我会先不急着分析。
当你开始想理解原因时，我再轻轻帮你梳理。
当你明确想行动时，我只给一个小下一步。
```

### 按状态生成的陪伴方式句库

#### 情绪态偏好

```text
当你情绪很满时，我会先陪你待一会儿，不急着讲道理。
```

```text
如果你只是说“我好累”，我不会马上给你列建议。
```

```text
我会先确认你的感受，而不是急着判断你哪里做得不对。
```

#### 映照偏好

```text
当你说不清自己怎么了，我会先帮你把感受慢慢说清楚。
```

```text
我会陪你区分：哪些是事实，哪些是担心，哪些只是因为你太累了。
```

```text
我会尽量把你没说完整的部分轻轻接住，而不是替你下结论。
```

#### 分析偏好

```text
当你准备好分析时，我会先给你一个清楚的框架，再慢慢展开。
```

```text
我会帮你看重点，但不会把话说得像报告一样冷。
```

```text
如果问题很复杂，我会先帮你分层，而不是一次给你一堆判断。
```

#### 行动偏好

```text
当你想行动时，我会尽量只给一个很小的下一步。
```

```text
我不会一上来给你完整计划，而是先帮你降低开始成本。
```

```text
如果你能量不高，我们就从 3 分钟也能做的小事开始。
```

#### 决策偏好

```text
当你纠结选择时，我会先帮你缩小范围，而不是继续增加选项。
```

```text
我会帮你找回真实偏好，而不是只看参数、评价或别人怎么说。
```

```text
如果你怕后悔，我会陪你把“为什么选它”说清楚一点。
```

#### 边界偏好

```text
当你不知道怎么拒绝时，我会帮你找到一种温柔但不委屈自己的说法。
```

```text
我不会逼你突然变得强硬，而是陪你慢慢练习表达边界。
```

#### 低追问偏好

```text
如果你不想说太多，我不会一直追问为什么。
```

```text
你可以只说一句话，甚至只发一个很短的回应，我也会尽量接住。
```

---

## 7. 模块 4｜我会尽量避免怎样对你

### 标题

```text
我会尽量避开这些说法
```

### 通用模板

```text
我会尽量避开：

- {avoid_1}
- {avoid_2}
- {avoid_3}
- {avoid_4}
```

### 生成规则

```yaml
source_priority:
  - Q3 selected options
  - primary_persona.avoid_phrases
  - secondary_persona.avoid_phrases
  - Q14 open preference
max_items: 5
min_items: 3
style:
  - specific
  - not too negative
  - avoid repeating hurtful phrases too many times
```

### 可用句库

#### 过早分析

```text
一上来就分析你为什么这样。
```

```text
在你还没准备好时，就急着拆原因、讲逻辑。
```

#### 直接下定义

```text
直接说“你就是在逃避”或“你就是想太多”。
```

```text
把你的状态简单归成某一个问题。
```

#### 建议过载

```text
一次给你列很多建议，让你更累。
```

```text
在你能量很低时，给你一整套计划。
```

#### 鸡汤

```text
用“你已经很棒了”这种太泛的安慰糊弄过去。
```

```text
用听起来正确、但离你很远的话安慰你。
```

#### 过度积极

```text
要求你马上积极起来。
```

```text
把你的疲惫说成“不够乐观”。
```

#### 连续追问

```text
一直问你“为什么”，让你像在被审问。
```

```text
在你不想说的时候继续追问细节。
```

#### 客服感

```text
用太冷静、太客观、像客服一样的语气回应你。
```

```text
只给标准答案，却没有真正接住你的感受。
```

#### 过度亲密

```text
假装我已经完全懂你。
```

```text
在你还没准备好时，靠得太近、说得太满。
```

---

## 8. 模块 5｜当前陪伴画像摘要

这个模块建议默认折叠，标题可以轻一点。

### 标题方案

```text
我先记住这些陪伴偏好
```

或：

```text
你的第一版陪伴说明
```

### 用户可见版本

```text
我先记住这些：

- 你现在更需要：{main_support_need}
- 你不太喜欢：{main_dislike_response}
- 当你情绪很满时：{emotional_response_rule}
- 当你想解决问题时：{action_response_rule}
- 你的长期方向：{ideal_self_summary}
- 主动找你的方式：{push_preference_summary}
```

### 示例

```text
我先记住这些：

- 你现在更需要先被接住，再慢慢整理。
- 你不太喜欢一上来就分析、直接下定义、给一堆建议。
- 当你情绪很满时，我会先陪你待一会儿。
- 当你想解决问题时，我会只给一个很小的下一步。
- 你希望以后少一点内耗，做选择时更轻松。
- 如果你愿意，我可以在晚上轻轻问你一句。
```

### Codex 字段结构

```yaml
profile_summary_display:
  main_support_need: string
  main_dislike_response: string
  emotional_response_rule: string
  action_response_rule: string
  ideal_self_summary: string
  push_preference_summary: string
```

### 注意

不要在用户可见结果页中直接显示：

```yaml
readiness_state: emotional
barrier_type: low_activation_energy
question_tolerance: low
```

除非这是开发者调试页，正式用户界面不要这样写。

---

## 9. 模块 6｜保存 / 修改 / 跳过

### 说明文案

```text
这只是第一版。
以后你和我聊天时，我会慢慢修正它。

如果哪里不像你，可以现在改，也可以之后再改。
```

### 按钮建议

```yaml
primary_button:
  label: "保存我的陪伴说明"
  action: "save_persona_profile"
secondary_button:
  label: "我想改一改"
  action: "edit_persona_profile"
tertiary_button:
  label: "先跳过"
  action: "skip_persona_profile_save"
optional_button:
  label: "这个名字不太像我"
  action: "reject_or_regenerate_persona_name"
```

### 用户点击「这个名字不太像我」后

弹出文案：

```text
没关系，这个名字不是固定标签。

你可以选择：

1. 换一个更像我的名字
2. 只保留陪伴偏好，不显示人格名
3. 我想自己选一个
```

### 用户点击「先跳过」后

```text
好的，我们先不保存。

之后如果你愿意，我也可以根据聊天慢慢重新认识你。
```

---

## 10. 结果页完整模板

```markdown
# 你现在更像「{primary_persona_name}」

{one_sentence}

我先轻轻认识你一点。

根据你刚刚的回答，你现在更像「{primary_persona_name}」。
{secondary_persona_sentence_if_any}

这不是一个固定标签，也不是在定义你。
它只是让我知道：当你累了、乱了、犹豫了，应该怎样靠近你，才不会打扰你。

## 我现在这样理解你

{current_understanding_copy}

## 我以后会尽量这样陪你

1. {support_method_1}
2. {support_method_2}
3. {support_method_3}
4. {support_method_4_optional}

## 我会尽量避开这些说法

- {avoid_method_1}
- {avoid_method_2}
- {avoid_method_3}
- {avoid_method_4_optional}

## 我先记住这些陪伴偏好

- 你现在更需要：{main_support_need}
- 你不太喜欢：{main_dislike_response}
- 当你情绪很满时：{emotional_response_rule}
- 当你想解决问题时：{action_response_rule}
- 你的长期方向：{ideal_self_summary}
- 主动找你的方式：{push_preference_summary}

这只是第一版。
以后你和我聊天时，我会慢慢修正它。
如果哪里不像你，可以现在改，也可以之后再改。

[保存我的陪伴说明] [我想改一改] [先跳过]
```

---

## 11. 按人格的结果页完整示例

## 示例 1｜雾中整理者 + 迟疑选择者

适用场景：用户 Q1 选「脑子很乱，事情很多」，Q8 选择「信息太多」「怕选错」，Q3 不喜欢建议过载或直接下定义。

```markdown
# 你现在更像「雾中整理者」

你不是没有方向，只是最近心里像起了雾，需要有人陪你一点点看清。

我先轻轻认识你一点。

根据你刚刚的回答，你现在更像「雾中整理者」，同时也有一点「迟疑选择者」的影子。

这不是一个固定标签，也不是在定义你。
它只是让我知道：当你累了、乱了、犹豫了，应该怎样靠近你，才不会打扰你。

## 我现在这样理解你

你最近心里可能装了很多东西。事情、情绪、责任、未完成的任务，还有一些需要做决定的事，都挤在一起。

所以你不是没有方向，而是现在的线头太多了，很难一下子找到开始的位置。

在选择上，你也可能会很认真地比较，担心选错、后悔，或者错过更好的选项。比起让我继续给你更多信息，你可能更需要我帮你把重点变少一点。

## 我以后会尽量这样陪你

1. 当你情绪很满时，我会先不急着分析。
2. 当你说不清哪里乱时，我会陪你把情绪、事实、担心和下一步分开。
3. 当你纠结选择时，我会先帮你缩小范围，而不是继续增加选项。
4. 当你准备行动时，我会只给一个很小的下一步。

## 我会尽量避开这些说法

- 直接说“你就是想太多”。
- 一上来就分析你为什么这样。
- 一次给你列很多建议，让你更累。
- 在你还没准备好时催你马上行动。

## 我先记住这些陪伴偏好

- 你现在更需要：先被接住，再慢慢整理。
- 你不太喜欢：过早分析、直接下定义、建议过载。
- 当你情绪很满时：我会先陪你待一会儿。
- 当你想解决问题时：我会帮你找到一个最小的开始点。
- 你的长期方向：少一点内耗，做选择时更轻松。
- 主动找你的方式：如果你愿意，我可以在晚上轻轻问你一句。

这只是第一版。
以后你和我聊天时，我会慢慢修正它。
如果哪里不像你，可以现在改，也可以之后再改。

[保存我的陪伴说明] [我想改一改] [先跳过]
```

---

## 示例 2｜温柔蓄水池 + 云层休息者

适用场景：用户 Q1 选「很累，但停不下来」，Q5/Q6 出现照护、团队、家庭责任，Q4 选择「先别分析，陪我待一会儿」。

```markdown
# 你现在更像「温柔蓄水池」

你一直在给别人力量，但你自己也需要被安静地补回来。

我先轻轻认识你一点。

根据你刚刚的回答，你现在更像「温柔蓄水池」，同时也有一点「云层休息者」的影子。

这不是一个固定标签，也不是在定义你。
它只是让我知道：当你累了、撑不住了、不想解释了，应该怎样靠近你，才不会打扰你。

## 我现在这样理解你

你可能一直在接住很多事，也常常先考虑别人。工作、团队、关系、家庭或照护责任，都可能在消耗你的能量。

你不是不想变好，也不是不想处理问题，只是如果一直往外给，自己也会慢慢变干。

现在的你，可能不适合被马上分析、马上规划、马上要求振作。你更需要先有一个不用负责的地方，安静地补回来一点。

## 我以后会尽量这样陪你

1. 当你说累的时候，我会先相信这份累是真的。
2. 我不会急着要求你改变，也不会马上说你应该怎样做。
3. 如果你不想说太多，我会少一点追问，多一点陪着。
4. 等你有一点力气时，我再陪你找一个可以轻轻补回来的地方。

## 我会尽量避开这些说法

- “你要学会拒绝”这种听起来正确、但会让你更有压力的话。
- 在你很累的时候给你列一堆建议。
- 一上来就分析你为什么会这样。
- 要求你马上积极起来。

## 我先记住这些陪伴偏好

- 你现在更需要：被接住，而不是被催着解决。
- 你不太喜欢：过早分析、空泛鼓励、建议过载。
- 当你情绪很满时：我会先陪你待一会儿。
- 当你想解决问题时：我会帮你找一个不会继续消耗你的做法。
- 你的长期方向：情绪来的时候不那么孤单，也能慢慢照顾回自己。
- 主动找你的方式：不要太频繁，轻轻问一句就够了。

这只是第一版。
以后你和我聊天时，我会慢慢修正它。
如果哪里不像你，可以现在改，也可以之后再改。

[保存我的陪伴说明] [我想改一改] [先跳过]
```

---

## 示例 3｜微光行动者 + 晨光重启者

适用场景：用户 Q1 选「想变好，但就是动不起来」，Q7 选「我知道该做什么，但启动不了」，Q9 出现目标太大、不知道第一步。

```markdown
# 你现在更像「微光行动者」

你已经有一点想往前走了，只是下一步必须足够小，才不会压垮你。

我先轻轻认识你一点。

根据你刚刚的回答，你现在更像「微光行动者」，同时也有一点「晨光重启者」的影子。

这不是一个固定标签，也不是在定义你。
它只是让我知道：当你想开始、但又启动不了时，应该怎样陪你把事情变小一点。

## 我现在这样理解你

你不是完全不想动。你心里其实有一点点想重新开始，也知道有些事应该慢慢推进。

只是现在的你，可能承受不了太大的计划、太满的步骤、太用力的改变。

所以你需要的不是一套完整方案，而是一个小到不用很有状态，也能试着开始的动作。

## 我以后会尽量这样陪你

1. 当你想改变时，我不会一上来给你完整计划。
2. 我会先帮你找到一个很小的开始点。
3. 如果你能量不高，我们就从 3 分钟也能完成的事开始。
4. 当你完成一点点时，我会帮你看见：这已经是在往前了。

## 我会尽量避开这些说法

- “你要自律一点”。
- “从今天开始每天坚持”。
- 一次给你列太多步骤。
- 把启动困难说成你不够努力。

## 我先记住这些陪伴偏好

- 你现在更需要：一个很小、很轻的开始点。
- 你不太喜欢：建议过载、被催促、被要求马上坚持。
- 当你情绪很满时：我会先不急着推你行动。
- 当你想解决问题时：我会只给一个小下一步。
- 你的长期方向：想做的事能慢慢开始。
- 主动找你的方式：只在重要事情后轻轻跟进，不做打卡式催促。

这只是第一版。
以后你和我聊天时，我会慢慢修正它。
如果哪里不像你，可以现在改，也可以之后再改。

[保存我的陪伴说明] [我想改一改] [先跳过]
```

---

## 示例 4｜月光观察者 + 柔软边界者

适用场景：用户 Q2 选择人际不舒服，Q3 不喜欢被说太敏感或被直接定义，Q10/Q11 指向表达和边界。

```markdown
# 你现在更像「月光观察者」

你很会感受到细微的变化，也因此更需要被认真、温柔地理解。

我先轻轻认识你一点。

根据你刚刚的回答，你现在更像「月光观察者」，同时也有一点「柔软边界者」的影子。

这不是一个固定标签，也不是在定义你。
它只是让我知道：当你因为关系、语气或细节感到不舒服时，我应该先认真听见你，而不是马上否定你的感受。

## 我现在这样理解你

你对很多细小的变化都很有感觉。别人一句话、一个停顿、一次没有回应，都可能在你心里停留很久。

这不代表你太敏感，只是你比很多人更容易捕捉到那些细微的信号。

同时，你可能也很在意关系。所以当你想表达不舒服、拒绝别人或说明边界时，会担心自己是不是太冷、太过分、太让人失望。

## 我以后会尽量这样陪你

1. 我会先认真听你感受到的东西，而不是急着说你想多了。
2. 当你开始想理解原因时，我会陪你区分事实、担心和情绪。
3. 当你不知道怎么表达边界时，我会帮你找一种温柔但不委屈自己的说法。
4. 我不会逼你突然变得强硬，也不会把你的敏感当成问题。

## 我会尽量避开这些说法

- “你太敏感了”。
- “别想那么多”。
- 直接说“你就是在内耗”。
- 在你还没准备好时，就要求你立刻表达清楚。

## 我先记住这些陪伴偏好

- 你现在更需要：先确认感受被看见，再慢慢分辨。
- 你不太喜欢：被否定、被下定义、被说想太多。
- 当你情绪很满时：我会先接住，不急着分析。
- 当你想解决问题时：我会帮你整理一版可以直接说出口的话。
- 你的长期方向：更敢表达自己的感受，也更能保护自己的边界。
- 主动找你的方式：轻一点，不要太频繁。

这只是第一版。
以后你和我聊天时，我会慢慢修正它。
如果哪里不像你，可以现在改，也可以之后再改。

[保存我的陪伴说明] [我想改一改] [先跳过]
```

---

## 12. Codex 可用页面配置

```yaml
result_page_template_config:
  schema_version: "1.0.0"
  page_name: "onboarding_persona_result"
  route_suggestion: "/onboarding/result"

  data_inputs:
    persona_result:
      primary_persona_id: string
      primary_persona_name: string
      secondary_persona_id: string_or_null
      secondary_persona_name: string_or_null
      confidence: low_or_medium_or_high
      status: inferred_or_confirmed_or_rejected_or_outdated
    persona_config:
      one_sentence: string
      result_page_copy: string
      support_methods: array
      avoid_phrases: array
      response_style: object
    profile_patch:
      current_state: object
      emotion_pattern: object
      communication_preference: object
      action_barrier: object
      ideal_self: object
      push_preference: object

  sections:
    - id: intro
      title: null
      component_type: "text_block"
      visible: true
      copy_rule: "use confidence-specific intro copy"

    - id: persona_header
      title_template: "你现在更像「{primary_persona_name}」"
      component_type: "hero_card"
      visible: true
      fields:
        - primary_persona_name
        - one_sentence

    - id: current_understanding
      title: "我现在这样理解你"
      component_type: "text_block"
      visible: true
      copy_source:
        - primary_persona.result_page_copy
        - secondary_persona.result_copy_hint
        - profile_patch.current_state
        - profile_patch.emotion_pattern

    - id: support_methods
      title: "我以后会尽量这样陪你"
      component_type: "bullet_list"
      visible: true
      max_items: 5
      source:
        - primary_persona.support_methods
        - secondary_persona.support_methods
        - communication_preference.recovery_need

    - id: avoid_methods
      title: "我会尽量避开这些说法"
      component_type: "bullet_list"
      visible: true
      max_items: 5
      source:
        - selected_q3_options
        - primary_persona.avoid_phrases
        - secondary_persona.avoid_phrases
        - q14_user_preference

    - id: profile_summary
      title: "我先记住这些陪伴偏好"
      component_type: "collapsible_summary"
      default_open: false
      visible: true
      max_items: 6
      source:
        - profile_patch

    - id: editable_notice
      title: null
      component_type: "notice"
      visible: true
      copy: "这只是第一版。以后你和我聊天时，我会慢慢修正它。如果哪里不像你，可以现在改，也可以之后再改。"

    - id: actions
      component_type: "button_group"
      visible: true
      buttons:
        - id: save
          label: "保存我的陪伴说明"
          action: "save_persona_profile"
          style: "primary"
        - id: edit
          label: "我想改一改"
          action: "edit_persona_profile"
          style: "secondary"
        - id: skip
          label: "先跳过"
          action: "skip_persona_profile_save"
          style: "tertiary"
        - id: reject_name
          label: "这个名字不太像我"
          action: "reject_or_regenerate_persona_name"
          style: "text"

  copy_rules:
    use_soft_language: true
    avoid_fixed_label_language: true
    avoid_psychological_diagnosis_language: true
    use_primary_persona_name_frequency: "low"
    max_visible_bullets_per_section: 5

  confidence_behavior:
    low:
      intro_variant: "low_confidence"
      show_secondary_persona: false
      show_profile_summary: true
      profile_summary_default_open: false
      required_notice: "我现在只是根据你愿意告诉我的部分，先试着理解你一点。如果不准确，你可以随时改。"
    medium:
      intro_variant: "standard"
      show_secondary_persona: true
      show_profile_summary: true
      profile_summary_default_open: false
    high:
      intro_variant: "standard"
      show_secondary_persona: true
      show_profile_summary: true
      profile_summary_default_open: false

  user_actions_behavior:
    save_persona_profile:
      update_status_to: "confirmed_by_user"
      next_route: "/chat"
    edit_persona_profile:
      open_modal: "edit_companion_profile"
    skip_persona_profile_save:
      save_result: false
      next_route: "/chat"
    reject_or_regenerate_persona_name:
      update_status_to: "rejected"
      open_modal: "persona_name_options"
```

---

## 13. 开发注意事项

### 13.1 不建议一次展示太多

用户刚答完问卷时，最重要的是被看见，而不是看到一整套系统字段。

建议页面层级：

```text
第一屏：人格名 + 一句话 + 温柔说明
第二屏：我现在这样理解你
第三屏：应该怎么陪你 / 不该怎么说
折叠区：陪伴画像摘要
底部：保存 / 修改 / 跳过
```

### 13.2 不要把结果页做成“诊断感”

避免使用这些 UI 标题：

- 心理画像
- 人格诊断
- 测评结果
- 情绪类型
- 问题分析

推荐使用：

- 陪伴说明
- 我的陪伴说明书
- 我该怎么陪你
- 第一版理解
- 陪伴偏好

### 13.3 用户必须有控制权

结果页至少提供：

- 保存
- 修改
- 跳过
- 名字不像我

如果没有这些控制权，用户容易觉得被系统定义。

---

## 14. V1 总结

问卷结果页不是为了展示“AI 很懂心理学”，而是为了让用户第一次感到：

> 它没有急着判断我。  
> 它知道我不喜欢怎样被回应。  
> 它以后会换一种更适合我的方式陪我。  
> 如果不准确，我还可以改。

这就是初始画像问卷最重要的产品价值。

