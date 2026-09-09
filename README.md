# clash_config

一个自用的 **Mihomo / Clash Meta** 内核配置文件，适合搭配 Web 面板使用。

配置以日常代理使用为主，提供多订阅源管理、规则分流、DNS、TUN 以及常用策略组，整体结构清晰，方便维护和二次定制。

---

## 📦 配置文件

| 文件                                                                                                                              | 说明                        |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| [`config.yaml`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/refs/heads/main/config.yaml)                         | 完整 Mihomo / Clash Meta 配置 |
| [`config_Override.yaml`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/refs/heads/main/config_Override.yaml)       | Clash 覆写配置                |
| [`SubConverter_config.ini`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/refs/heads/main/SubConverter_config.ini) | SubConverter INI 格式配置     |

---

## ✨ 主要特性

### 📡 订阅管理

* 支持多个 `proxy-provider`
* 统一管理不同订阅源
* 支持节点自动测速与策略组管理
* 可根据节点地区及服务类型进行选择

### 🎯 规则分流

针对常见使用场景提供独立策略组与规则集，包括：

* 🇨🇳 国内网站与服务
* ▶️ YouTube
* 🌐 Google
* 🤖 OpenAI / AI 服务
* 📲 Telegram
* 🐙 GitHub
* 🎮 Steam
* 🪟 Microsoft
* 🍎 Apple
* 🎵 Spotify
* 🎬 Netflix
* ☁️ PikPak
* 📺 Emby
* ₿ Cryptocurrency
* 🔞 EHentai
* 🛑 广告拦截

规则与策略组可根据实际需求继续扩展。

### 🌐 DNS

* 启用 `fake-ip` 模式
* 针对常见应用进行兼容处理
* 配合规则分流降低 DNS 泄漏与解析异常问题
* 支持国内外域名的差异化解析

### 🛡️ TUN 模式

开启 TUN 模式，可实现更完整的系统级流量接管。

适合以下场景：

* 系统应用代理
* 游戏代理
* 不支持传统系统代理的软件
* 移动端与桌面端部分特殊应用

### 🖥️ Web 面板

支持搭配 Mihomo / Clash Meta Web 面板使用，可方便查看：

* 节点状态
* 策略组
* 延迟与测速结果
* 当前连接
* 规则命中情况
* DNS 状态

---

## 🚀 使用方式

### 1. 下载配置

获取 [`config.yaml`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/refs/heads/main/config.yaml)。

### 2. 修改订阅地址

打开 `config.yaml`，找到订阅配置，将：

```yaml
your_subscription_url
```

替换为你自己的节点订阅链接。

### 3. 按需修改配置

根据个人需求调整：

* `proxy-providers`
* 策略组
* 节点筛选规则
* Rule Providers
* DNS
* TUN
* 分流规则

### 4. 启动 Mihomo

使用 Mihomo / Clash Meta 加载配置文件并启动核心。

### 5. 打开 Web 面板

启动后进入对应 Web 面板，即可查看节点、策略组、连接以及规则状态。

---

## 🧩 策略组结构

配置采用分层设计：

```text
原始节点
   │
   ├── ♻️ AUTO
   │
   ├── 🇭🇰 HK
   ├── 🇯🇵 JP
   ├── 🇺🇸 US
   ├── 🇸🇬 SG
   ├── 🇹🇼 TW
   ├── 🇰🇷 KR
   └── 🌐 Other
           │
           ↓
      🚀 PROXY
           │
           ↓
       服务策略组
   Google / YouTube / AI / Telegram / ...
```

其中：

* `♻️ AUTO`：自动测速并选择延迟较低的节点
* `🇭🇰 HK`：匹配香港节点
* `🇯🇵 JP`：匹配日本节点
* `🇺🇸 US`：匹配美国节点
* `🇸🇬 SG`：匹配新加坡节点
* `🇹🇼 TW`：匹配台湾节点
* `🇰🇷 KR`：匹配韩国节点
* `🌐 Other`：排除已划分地区后的其他节点
* `🚀 PROXY`：主代理策略组，用于统一调用各地区组及自动测速组
* `YouTube` / `Google` / `AI` 等：针对具体服务的独立策略组

---

## 📚 Rule Providers

配置使用远程规则集，并按照用途划分为多个类别。

### 直连规则集

```text
直连规则集
├── LocalAreaNetwork
├── UnBan
├── GoogleCN
├── SteamCN
├── ChinaDomain
├── ChinaCompanyIp
├── Download
├── GEOIP,CN
└── 自定义直连域名
```

### 代理规则集

```text
代理规则集
├── Google FCM
├── Google
├── Telegram
├── AI
├── OpenAI
├── YouTube
├── Microsoft
├── Apple
├── Steam
├── TikTok
├── Twitter
├── Instagram
├── Netflix
├── Emby
├── PikPak
├── Spotify
├── Cryptocurrency
├── EHentai
├── GFW
└── GitHub
```

### 其他规则集

```text
其他规则集
└── AdBlock
```

实际规则集会根据配置版本以及上游规则项目的更新情况进行调整。

---

## ⚙️ 适用环境

本配置主要面向：

* **Mihomo**
* **Clash Meta**
* 支持 Mihomo 内核的 Web 面板

建议使用较新的 Mihomo / Clash Meta 内核版本，以获得更完整的配置项支持。

---

## 📝 备注

> 本项目为个人自用配置模板。

实际使用时需要根据自己的：

* 订阅地址
* 节点命名
* 网络环境
* 使用需求
* DNS 环境

进行适当调整。

配置中的订阅地址、节点名称以及规则策略均可根据个人需求修改。

---

## 🔧 自定义

你可以在现有配置基础上继续扩展，例如：

* 🌏 增加其他地区策略组
* 📡 增加更多机场订阅
* 🎯 自定义服务分流
* 🤖 增加更多 AI 服务规则
* 🌐 优化 DNS 解析
* ⚡ 调整测速与自动选择策略
* 🛡️ 增加更多广告过滤规则
* 🎮 增加游戏专用策略组

---

## 🙏 致谢

本项目的配置思路、规则集及相关实现参考了以下优秀项目，感谢各位开发者的开源与分享：

### [ACL4SSR/ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)

提供 Clash / Mihomo 配置框架、规则集以及相关分流方案，是本配置的重要参考来源之一。

### [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)

提供大量适用于 Clash、Surge、Loon 等代理工具的规则集，本配置中的部分服务规则来源于该项目。

### [AIsouler/MyClash](https://github.com/AIsouler/MyClash)

提供 Mihomo（Clash Meta）覆写脚本和配置文件，包含 DNS 防泄漏、多项分流策略、地区策略、节点倍率识别等功能。

### [appshubcc/bett-rules](https://github.com/appshubcc/bett-rules)

提供 Mihomo 及相关项目使用的自定义 `rules-dat` / `MRS` 规则集。

### [MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo)

Mihomo 项目本身及相关生态，为本配置提供核心支持。

感谢这些开源项目及贡献者的工作，使本配置能够更加完善。

> 本项目仅对相关思路、配置方式及规则资源进行整理与集成，具体代码、规则集及相关资源的版权归原作者所有。

---

## 📄 License

本项目配置仅供个人学习与使用。

规则集及相关资源的版权归其原作者所有，请遵循对应项目的 License 与使用条款。
