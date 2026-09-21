# clash_config

自用的 Mihomo 内核配置，开箱即用。

`多订阅管理` `规则分流` `DNS 防泄漏` `Bettbox` `Sparkle`

---

## ✨ 特性

- **DNS 防泄漏**：fake-ip + 全 DoH（无明文 UDP 53），`nameserver-policy` 按规则集分组，`fake-ip-filter` 排除私有/国内域名，`nameserver` / `fallback` 带 `#PROXY` 实现国内外出口分离。
- **规则分流**：rule-providers 按需加载 `.mrs`，覆盖常用服务与地区策略组，支持 `RULE-SET` / `GEOSITE` / `PROCESS-NAME` 等。
- **开箱即用**：只有 `config.yaml` 需要改订阅地址即可运行；其余 8 个 `Full_control` / `config_Override_*` / `SubConverter_config_*` 覆写与转换文件，可叠加在任意订阅上。
- **CDN 与 raw 双通道**：配置内所有远程资源（`.mrs` 规则集、图标）统一走 `cdn.jsdelivr.net`，避开 `raw.githubusercontent.com` 的国内不稳定；每个文件在 [配置文件说明](./配置文件说明.md) 中都同时提供 CDN 与 raw 两种下载地址。

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

## 📖 详细配置说明

文件清单、三档规则量级对比、YAML 与 JS 两种覆写写法详解、SubConverter 订阅转换配置，全部见：

**➡️ [配置文件说明](./配置文件说明.md)**


## 🙏 致谢

配置思路与规则集参考了 [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)、[blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)、[AIsouler/MyClash](https://github.com/AIsouler/MyClash)、[appshubcc/bett-rules](https://github.com/appshubcc/bett-rules)、[MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo)、[SubConverter](https://github.com/tindy2013/subconverter) 等项目，感谢开源。

客户端适配验证：[Bettbox](https://github.com/appshubcc/Bettbox)、[Sparkle](https://github.com/xishang0128/sparkle)。

---

## 📄 License

本项目基于 [MIT License](./LICENSE) 开源。规则集及相关资源版权归原作者所有。
