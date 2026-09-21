# clash_config

自用的 Mihomo 内核配置，开箱即用。

`多订阅管理` `规则分流` `DNS 防泄漏` `Bettbox` `Sparkle`

---

## ✨ 特性

- **DNS 防泄漏**：fake-ip + 全 DoH（无明文 UDP 53），`nameserver-policy` 按规则集分组，`fake-ip-filter` 排除私有/国内域名，`nameserver` / `fallback` 带 `#PROXY` 实现国内外出口分离。
- **规则分流**：rule-providers 按需加载 `.mrs`，覆盖常用服务与地区策略组，支持 `RULE-SET` / `GEOSITE` / `PROCESS-NAME` 等。
- **开箱即用**：只有 `config.yaml` 需要改订阅地址即可运行；其余 6 个 `Full_control` / `config_Override_*` 覆写文件（YAML + JS）可叠加在任意订阅上。
- **CDN 与 raw 双通道**：配置内所有远程资源（`.mrs` 规则集、图标）统一走 `cdn.jsdelivr.net`，避开 `raw.githubusercontent.com` 的国内不稳定；每个文件在 [配置文件说明](./配置文件说明.md) 中都同时提供 CDN 与 raw 两种下载地址。

---

## 📦 配置文件

只有 [`config.yaml`](https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/config.yaml) 是**可直接加载的完整配置**，其余 8 个**全为覆写文件 / 覆写脚本**，需叠加在订阅上使用，不能单独加载。

> 📄 全部 9 个文件的清单、下载地址（CDN / raw）、三档规则量级对比与使用方式速查，见 **[配置文件说明](./配置文件说明.md)**。
> **`Full_control` 是权威模板**：`config_Override_Full` 由它裁掉 Twitch / Pixiv / Line / Discord 得到，YAML 锚点也随之展开为显式写法。
> YAML 与 JS 是同一份配置的两种书写形式：`Full_control.yaml` ↔ `Full_control.js`、`config_Override_Full.yaml` ↔ `config_Override_Full.js`，lite 同理。

---

## 🚀 使用方式

### config.yaml（唯一的完整配置，直接使用）

> 其余文件均为覆写，不在此列，见下方两节。

1. 下载 `config.yaml`，修改 `proxy-providers` 中的订阅地址：

   ```yaml
   proxy-providers:
     节点1:                  # 订阅名称，可自定义，不可重复
       url: "你的订阅链接"    # ← 替换为你的订阅地址
       type: http
       interval: 1800        # 订阅自动更新间隔（秒）
       health-check:
         enable: true
         url: "https://www.gstatic.com/generate_204"
         interval: 100       # 节点健康检查间隔（秒）
       override:
         additional-prefix: "[]"  # 节点名称前缀
   ```

   需添加多个订阅时，复制 `节点1` 整块，改名为 `节点2`、`节点3` 即可（名称不可重复）。

2. 用 Mihomo / Clash Meta 加载配置并启动。

### YAML / JS 覆写（叠加在订阅上使用）

`Full_control.*`、`config_Override_Full.*`、`config_Override_lite.*` 共 6 个文件**都是覆写**，两种用法：

- **YAML 覆写**：客户端支持「覆写配置 / 覆写 YAML」时，导入对应 `.yaml`
- **JS 覆写**：客户端支持「覆写脚本」时，导入对应 `.js`

YAML 与 JS 是同一份配置的两种书写形式，产物一一对应：

| 档位 | YAML 覆写 | JS 覆写 |
| --- | --- | --- |
| 全量 | `Full_control.yaml` | `Full_control.js` |
| 全量精简 | `config_Override_Full.yaml` | `config_Override_Full.js` |
| 轻量 | `config_Override_lite.yaml` | `config_Override_lite.js` |

下载链接见 [配置文件说明](./配置文件说明.md)（CDN / raw 二选一）。

### JS 覆写脚本（Bettbox / Sparkle）

三个 JS 脚本（`Full_control.js`、`config_Override_Full.js`、`config_Override_lite.js`，下载地址见 [配置文件说明](./配置文件说明.md)）
是上述 YAML 覆写的 **JS 等价版本**（锚点已展开，产物一一对应）：

1. 下载对应 js 文件到本地
2. 在客户端「覆写脚本」中导入该文件
3. 在订阅 / profile 上开启「使用脚本覆写」，更新订阅后生效

脚本约定 `const main = (config) => { ... }`，`config` 为已合并的完整配置对象，返回值即写入内核前的最终配置。

JS 为**整段赋值**语义（`config['dns'] = {...}` 等价于 YAML 的 `dns!:`），覆写范围比 YAML 版多出运行参数、`tun`、`sniffer`、`dns`：

| 覆写项 | YAML 版 | JS 版 |
| --- | :---: | :---: |
| `rule-providers` / `proxy-groups` / `rules` | ✅ | ✅ |
| 运行参数 / `tun` / `sniffer` / `dns`（含防泄漏配置） | ✅ | ✅ |
| `proxy-providers` / `proxies` / `mixed-port` / 认证 / `secret` / `external-controller` | ❌ 交由订阅与客户端接管 | ❌ 同左 |

> JS 文件不含 `!` / `+` 后缀——这些是 YAML 专有语法，在 JS 中直接赋值即为整体替换。

脚本头部内嵌完整的「规则集 → 策略组」分流对照表（AI / 油管 / 谷歌 / 微软 / 苹果 / 电报 / 游戏平台 / 短视频 / 推特 / 图享 / 奈飞 / 影音 / 网盘 / 音乐 / 加密货币 / 图站 / 直播 / 插画 / 通讯 / 语音 / 代码托管），改规则前可直接查阅。

### SubConverter 配置（订阅转换，非覆写）

适用于自建 SubConverter 订阅转换服务：

1. 部署 [SubConverter](https://github.com/tindy2013/subconverter)
2. 将 `.ini` 文件放入 SubConverter 的 `config` 目录
3. 转换时通过 `config` 参数指定配置名（不带 `.ini` 后缀）：

   ```
   https://你的域名/sub?target=mihomo&url=订阅链接&config=SubConverter_config_Full
   ```

---

## 🙏 致谢

配置思路与规则集参考了 [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)、[blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)、[AIsouler/MyClash](https://github.com/AIsouler/MyClash)、[appshubcc/bett-rules](https://github.com/appshubcc/bett-rules)、[MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo)、[SubConverter](https://github.com/tindy2013/subconverter) 等项目，感谢开源。

客户端适配验证：[Bettbox](https://github.com/appshubcc/Bettbox)、[Sparkle](https://github.com/xishang0128/sparkle)。

---

## 📄 License

本项目基于 [MIT License](./LICENSE) 开源。规则集及相关资源版权归原作者所有。
