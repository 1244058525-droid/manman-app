export const remoteConfigDefaults = {
  welcome_slogan: "慢慢说，我会慢慢懂你。",
  intro_lines_json: JSON.stringify([
    "慢慢是一款会逐渐认识你的AI陪伴产品",
    "它不急着给你答案",
    "而是先理解你的状态，再用适合你的方式",
    "陪你聊天、整理情绪、靠近下一步"
  ]),
  chat_placeholder: "把现在想说的话放到这里",
  composer_note: "慢慢不是心理诊断工具。它会陪你整理，但重要风险请及时寻求现实支持。",
  prompt_extra:
    "降低情绪配置和画像配置的权重。回复内容优先来自用户刚刚说的话：抓一个具体线索，给一点真实回应，再自然抛出一个可继续聊的问题。输出前做一遍语言润色，把配置味、报告味、识别过程改成自然口语。",
  questionnaire_overrides_json: "{}",
  remote_notice_success: "已同步云端配置。",
  remote_notice_failure: "暂时使用本地默认配置。"
};
