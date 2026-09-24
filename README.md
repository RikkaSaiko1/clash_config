# clash_config

自用的 Mihomo 内核配置，开箱即用。

`多订阅管理` `规则分流` `DNS 防泄漏` `Bettbox` `Sparkle`

---

## 📱 推荐客户端

| 客户端 | Stars | 特点 |
| --- | :---: | --- |
| [Bettbox](https://github.com/appshubcc/Bettbox) | [![Stars](https://img.shields.io/github/stars/appshubcc/Bettbox?style=flat&label=%E2%98%85&color=yellow)](https://github.com/appshubcc/Bettbox/stargazers) | 占用低、性能好，轻量省电 |
| [Sparkle](https://github.com/xishang0128/sparkle) | [![Stars](https://img.shields.io/github/stars/xishang0128/sparkle?style=flat&label=%E2%98%85&color=yellow)](https://github.com/xishang0128/sparkle/stargazers) | UI 现代化，配置项覆盖得比较全；内置稳定版和预览版两个内核可随时切换；支持 WebDAV 备份恢复和任意覆写配置文件 |

以上客户端经测试可用,其他客户端未经测试可用性,理论mihomo内核通用

---

## 📥 下载地址

> ⚠️ **下载前先读这几条**：
> - 覆写脚本/配置**只针对机场订阅**
> - 代理软件的 DNS 覆写关掉
> - 开启 [严格路由](https://wiki.metacubex.one/config/inbound/tun/#strict-route)

| 文件 | CDN（国内加速） | raw (官方推荐) |
| --- | --- | --- |
| `Full_control.yaml` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/Full_control.yaml) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/Full_control.yaml) |
| `Full_control.js` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/Full_control.js) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/Full_control.js) |
| `config_Override_Full.yaml` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/config_Override_Full.yaml) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_Full.yaml) |
| `config_Override_Full.js` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/config_Override_Full.js) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_Full.js) |
| `config_Override_lite.yaml` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/config_Override_lite.yaml) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_lite.yaml) |
| `config_Override_lite.js` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/config_Override_lite.js) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_lite.js) |
| `SubConverter_config_Full.ini` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/SubConverter_config_Full.ini) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/SubConverter_config_Full.ini) |
| `SubConverter_config_lite.ini` | [`jsdelivr`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/SubConverter_config_lite.ini) | [`raw`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/SubConverter_config_lite.ini) |

> **两条链接内容一样，任选一条**：CDN 国内直连快且稳，raw 是官方源、最新但需代理。

**`config.yaml` 是唯一能直接加载的完整配置**，其余 8 个都是覆写 / 转换文件，不能单独加载。各文件的区别：

- `Full_control.*`：全规则，37 个策略组，最全
- `config_Override_Full.*`：全规则精简版，33 个策略组
- `config_Override_lite.*`：轻量版，18 个策略组，规则最少
- `SubConverter_*.ini`：SubConverter 订阅转换用，不适用于覆写



---

## 🚀 快速上手

1. 下载 [`config.yaml`](./config.yaml)，把 `proxy-providers` 里的订阅地址改成你自己的：

   ```yaml
   proxy-providers:
     节点1:                  # 订阅名称，可自定义，不可重复
       url: "你的订阅链接"    # ← 替换为你的订阅地址
   ```

2. 用 Mihomo / Clash Meta 加载该配置并启动。

---

## 📖 详细配置说明

文件清单、三档规则量级对比、YAML 与 JS 两种覆写写法详解、SubConverter 订阅转换配置，全部见：

**➡️ [配置文件说明](./配置文件说明.md)**


## 🙏 致谢

配置思路与规则集参考了 [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)、[blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)、[AIsouler/MyClash](https://github.com/AIsouler/MyClash)、[appshubcc/bett-rules](https://github.com/appshubcc/bett-rules)、[MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo)、[SubConverter](https://github.com/tindy2013/subconverter) 等项目，感谢开源。

---

## 📄 License

本项目基于 [MIT License](./LICENSE) 开源。规则集及相关资源版权归原作者所有。
