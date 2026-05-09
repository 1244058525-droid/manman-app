# Firebase Remote Config 集成说明

## 1. Firebase 项目与配置文件

1. 打开 Firebase 控制台，创建项目。
2. 在项目里添加一个 Web App。
3. 复制 Firebase Web 配置，填入：

```text
app/firebase-config.js
```

把 `enabled` 改成 `true`，并替换 `apiKey/projectId/appId` 等字段。

如果后面打 iOS / Android 原生包：

```text
ios/App/App/GoogleService-Info.plist
android/app/google-services.json
```

这两个文件从 Firebase 控制台对应的 iOS / Android App 设置里下载。

## 2. Remote Config 参数

在 Firebase Remote Config 控制台创建这些参数：

```text
welcome_slogan
intro_lines_json
chat_placeholder
composer_note
prompt_extra
questionnaire_overrides_json
remote_notice_success
remote_notice_failure
```

示例：

```json
{
  "welcome_slogan": "慢慢说，我在听。",
  "intro_lines_json": "[\"慢慢会先认识你一点\",\"再用适合你的方式陪你说话\"]",
  "chat_placeholder": "把现在最真实的一句话放到这里",
  "composer_note": "慢慢不是心理诊断工具。重要风险请及时寻求现实支持。",
  "prompt_extra": "回复时更少模板感，多抓住用户话里的细节。",
  "questionnaire_overrides_json": "{\"questions\":{\"Q1\":{\"title\":\"最近的你，更接近哪种状态？\"}}}"
}
```

## 3. 当前代码放置位置

```text
app/firebase-config.js
app/remote-config-defaults.js
app/remote-config.js
app/app.js
server/services/chatRuntimeService.js
```

App 启动时会先用内嵌默认值，再尝试从 Firebase 拉取云端配置。成功后覆盖页面文案、问卷配置和聊天提示词补充；失败时继续使用默认值，并显示非阻塞提醒。

## 4. Capacitor 安装

当前项目已经添加：

```text
capacitor.config.json
```

安装基础 Capacitor：

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
npx cap sync
```

如果要使用原生 Remote Config 插件：

```bash
npm install @capacitor-firebase/remote-config
npx cap sync
```

当前 MVP 先使用 Firebase Web SDK，适合 Web/PWA 和 Capacitor WebView。等你准备上架 iOS / Android，再切原生插件也可以。
