import { firebaseConfig, remoteConfigOptions } from "./firebase-config.js";
import { remoteConfigDefaults } from "./remote-config-defaults.js";

const API_BASE = window.location.protocol === "file:" ? "http://localhost:8787" : "";

function publishRemoteConfig(config, meta) {
  window.ManmanRemoteConfig = { values: config, meta };
  window.dispatchEvent(
    new CustomEvent("manman:remote-config", {
      detail: window.ManmanRemoteConfig
    })
  );
}

function normalizeValues(remoteConfig, getValue) {
  return Object.fromEntries(
    Object.keys(remoteConfigDefaults).map((key) => [key, getValue(remoteConfig, key).asString()])
  );
}

async function loadFromServer() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/remote-config`);
    if (!response.ok) throw new Error("服务器配置接口返回错误");
    const data = await response.json();
    const serverConfig = data.config || {};

    // Merge: server values override defaults
    const merged = {};
    for (const key of Object.keys(remoteConfigDefaults)) {
      merged[key] = serverConfig[key] !== undefined ? serverConfig[key] : remoteConfigDefaults[key];
    }

    publishRemoteConfig(merged, {
      source: "remote",
      ok: true,
      enabled: true,
      message: "已从服务器加载配置。"
    });
  } catch (error) {
    publishRemoteConfig(remoteConfigDefaults, {
      source: "default",
      ok: false,
      enabled: true,
      message: "服务器配置加载失败，使用本地默认值。"
    });
  }
}

async function loadFromFirebase() {
  const FIREBASE_APP_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
  const FIREBASE_REMOTE_CONFIG_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-remote-config.js";

  try {
    const [{ initializeApp }, remoteConfigModule] = await Promise.all([
      import(FIREBASE_APP_URL),
      import(FIREBASE_REMOTE_CONFIG_URL)
    ]);
    const { fetchAndActivate, getRemoteConfig, getValue } = remoteConfigModule;
    const app = initializeApp(firebaseConfig);
    const remoteConfig = getRemoteConfig(app);

    remoteConfig.settings = {
      minimumFetchIntervalMillis: remoteConfigOptions.minimumFetchIntervalMillis,
      fetchTimeoutMillis: remoteConfigOptions.fetchTimeoutMillis
    };
    remoteConfig.defaultConfig = remoteConfigDefaults;

    const activated = await fetchAndActivate(remoteConfig);
    publishRemoteConfig(normalizeValues(remoteConfig, getValue), {
      source: activated ? "remote" : "cache",
      ok: true,
      enabled: true,
      message: activated ? "Remote config activated." : "Remote config loaded from cache."
    });
  } catch (error) {
    // Firebase failed, fall back to server
    loadFromServer();
  }
}

async function loadRemoteConfig() {
  if (!firebaseConfig.enabled) {
    // Use server-side config
    await loadFromServer();
    return;
  }

  // Try Firebase first, fall back to server
  await loadFromFirebase();
}

loadRemoteConfig();
