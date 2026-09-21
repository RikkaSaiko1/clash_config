# clash_config

自用的 Mihomo 内核配置，开箱即用。

`多订阅管理` `规则分流` `DNS 防泄漏` `Bettbox` `Sparkle`

---

## 📱 推荐平台

以下是我自己长期在用、确认能正常加载本配置的客户端，按平台分：

| 平台 | 客户端 | 说明 |
| --- | --- | --- |
| 移动端 / 桌面 | [Bettbox](https://github.com/appshubcc/Bettbox) | 自带规则覆写（`Full_control.js` / `config_Override_*.js`），配置里的 `.mrs` 规则集直接吃 |
| iOS / macOS | [Sparkle](https://github.com/xishang0128/sparkle) | 支持 JS 覆写脚本，`config.yaml` 和覆写脚本都能直接用 |
| Windows / macOS / Linux | [Mihomo](https://github.com/MetaCubeX/mihomo) | 内核本体，`config.yaml` 直接加载；覆写走 `Full_control.yaml` / `config_Override_*.yaml` |

> 只要客户端是 Mihomo 内核且支持覆写，理论上都能跑；上表是我实际验证过的组合，没验证过的就不往上写了。

---


## 📥 下载地址

下面每个文件都给两条链接，**内容完全一样，任选一条**：CDN 那条国内直连一般没问题，raw 那条是 GitHub 官方源。

| 文件 | CDN（推荐） | raw |
| --- | --- | --- |
| `config.yaml` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/config.yaml) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config.yaml) |
| `Full_control.yaml` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/Full_control.yaml) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/Full_control.yaml) |
| `Full_control.js` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/Full_control.js) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/Full_control.js) |
| `config_Override_Full.yaml` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/config_Override_Full.yaml) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_Full.yaml) |
| `config_Override_Full.js` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/config_Override_Full.js) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_Full.js) |
| `config_Override_lite.yaml` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/config_Override_lite.yaml) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_lite.yaml) |
| `config_Override_lite.js` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/config_Override_lite.js) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_lite.js) |
| `SubConverter_config_Full.ini` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/SubConverter_config_Full.ini) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/SubConverter_config_Full.ini) |
| `SubConverter_config_lite.ini` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/SubConverter_config_lite.ini) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/SubConverter_config_lite.ini) |

> **该用哪条**：平时用 `cdn.jsdelivr.net`——它在全国各地都有缓存节点，访问快也稳，我自己的配置里所有远程资源（`.mrs` 规则集、图标）走的都是它。`raw.githubusercontent.com` 是 GitHub 的官方地址，没有缓存、内容永远是最新的，但国内直连基本打不开，得有代理才行。两条链接指向同一份文件，今天用这条明天用那条都无所谓。

---

## 🚀 快速上手

**本仓库只有 [`config.yaml`](./config.yaml) 是可直接加载的完整配置**，其余 8 个文件**全为覆写 / 转换文件**，不能单独加载。

1. 下载 `config.yaml`，把 `proxy-providers` 里的订阅地址改成你自己的：

   ```yaml
   proxy-providers:
     节点1:                  # 订阅名称，可自定义，不可重复
       url: "你的订阅链接"    # ← 替换为你的订阅地址
   ```

2. 用 Mihomo / Clash Meta 加载该配置并启动。

已有订阅、只想叠加分流规则时，改用 `Full_control.*` 或 `config_Override_*.*` 作为覆写导入即可。

---

## 📖 详细配置说明

文件清单、三档规则量级对比、YAML 与 JS 两种覆写写法详解、SubConverter 订阅转换配置，全部见：

**➡️ [配置文件说明](./配置文件说明.md)**


## 🙏 致谢

配置思路与规则集参考了 [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)、[blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)、[AIsouler/MyClash](https://github.com/AIsouler/MyClash)、[appshubcc/bett-rules](https://github.com/appshubcc/bett-rules)、[MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo)、[SubConverter](https://github.com/tindy2013/subconverter) 等项目，感谢开源。

---

## 📄 License

本项目基于 [MIT License](./LICENSE) 开源。规则集及相关资源版权归原作者所有。
