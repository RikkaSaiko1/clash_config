# clash_config

自用的 Mihomo 内核配置，开箱即用。

`多订阅管理` `规则分流` `DNS 防泄漏` `Bettbox` `Sparkle`

---

## ✨ 特性

- **DNS 防泄漏**：fake-ip + 全 DoH（无明文 UDP 53），`nameserver-policy` 按规则集分组，`fake-ip-filter` 排除私有/国内域名，`nameserver` / `fallback` 带 `#PROXY` 实现国内外出口分离。
- **规则分流**：rule-providers 按需加载 `.mrs`，覆盖常用服务与地区策略组，支持 `RULE-SET` / `GEOSITE` / `PROCESS-NAME` 等。
- **开箱即用**：`config.yaml` 改完订阅地址即可运行，覆写版可叠加在任意订阅上。

---

## 📦 配置文件

| 文件 | 说明 |
| --- | --- |
| [`config.yaml`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config.yaml) | 完整配置（直接加载使用） |
| [`config_Override_Full.yaml`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_Full.yaml) | YAML 覆写配置（全规则版） |
| [`config_Override_lite.yaml`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_lite.yaml) | YAML 覆写配置（轻量版） |
| [`config_Override_Full.js`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_Full.js) | JS 覆写脚本（全规则版） |
| [`config_Override_lite.js`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_lite.js) | JS 覆写脚本（轻量版） |
| [`SubConverter_config_Full.ini`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/SubConverter_config_Full.ini) | SubConverter 订阅转换（全规则版） |
| [`SubConverter_config_lite.ini`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/SubConverter_config_lite.ini) | SubConverter 订阅转换（轻量版） |

> **Full** 规则覆盖全面，**Lite** 精简规则、占用更低，按需选用。
> YAML 与 JS 为同一份配置的两种书写形式，内容完全等价：[`config_Override_Full.yaml`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_Full.yaml) ↔ [`config_Override_Full.js`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_Full.js)，lite 同理。

---

## 🚀 使用方式

### config.yaml（直接使用）

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
=
### JS 覆写脚本（Bettbox / Sparkle）

[`config_Override_Full.js`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_Full.js) 与
[`config_Override_lite.js`](https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_lite.js)
是上述两份 YAML 覆写的 **JS 等价版本**（锚点已展开，产物一一对应）：

1. 下载对应 js 文件到本地
2. 在客户端「覆写脚本」中导入该文件
3. 在订阅 / profile 上开启「使用脚本覆写」，更新订阅后生效

脚本约定 `const main = (config) => { ... }`，`config` 为已合并的完整配置对象，返回值即写入内核前的最终配置。

JS 为**整段赋值**语义（`config['dns'] = {...}` 等价于 YAML 的 `dns!:`），覆写范围比 YAML 版多出运行参数、`tun`、`sniffer`、`dns`：

| 覆写项 | YAML 版 | JS 版 |
| --- | --- | --- |
| `rule-providers` / `proxy-groups` / `rules` | ✅ | ✅ |
| 运行参数 / `tun` / `sniffer` / `dns`（含防泄漏配置） | ✅ | ✅ |
| `proxy-providers` / `proxies` / `mixed-port` / 认证 / `secret` / `external-controller` | ❌ 交由订阅与客户端接管 | ❌ 同左 |

> JS 文件不含 `!` / `+` 后缀——这些是 YAML 专有语法，在 JS 中直接赋值即为整体替换。

### SubConverter 配置

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
