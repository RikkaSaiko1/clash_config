# clash_config

自用的 **Mihomo / Clash Meta** 内核配置文件，支持多订阅管理、规则分流、DNS、TUN，搭配 Web 面板使用。

---

## 📦 配置文件

| 文件 | 说明 |
| --- | --- |
| [`config.yaml`](./config.yaml) | 完整配置（订阅、策略组、规则、DNS、TUN） |
| [`config_Override_Full.yaml`](./config_Override_Full.yaml) | 覆写配置（全规则版） |
| [`config_Override_lite.yaml`](./config_Override_lite.yaml) | 覆写配置（轻量版） |
| [`SubConverter_config_Full.ini`](./SubConverter_config_Full.ini) | SubConverter 配置（全规则版） |
| [`SubConverter_config_lite.ini`](./SubConverter_config_lite.ini) | SubConverter 配置（轻量版） |

---


## 🚀 使用方式

1. 下载 `config.yaml`，将 `proxy-providers` 中的 `your_subscription_url` 替换为自己的订阅链接
2. 按需调整策略组、规则、DNS、TUN 等配置
3. 用 Mihomo / Clash Meta 加载并启动

> 核心参数：混合端口 `7890`，API `127.0.0.1:9091`，secret 见配置文件（建议修改）。

### 覆写配置（Override）

适用于 Clash Verge Rev、FlClash 等支持覆写功能的客户端，在原始订阅基础上叠加自定义规则与策略组：

1. 复制对应覆写文件的 raw 链接（Full 全规则 / Lite 轻量）
2. 在客户端「覆写」设置中添加该链接
3. 更新订阅后自动生效

### SubConverter 配置

适用于自建 SubConverter 订阅转换服务：

1. 部署 [SubConverter](https://github.com/tindy2013/subconverter)
2. 将 `.ini` 文件放入 SubConverter 的 `config` 目录
3. 转换时通过 `&config=配置名` 参数指定，例如：
   `https://your-subconverter-domain/sub?target=mihomo&url=你的订阅&config=SubConverter_config_Full`

---

## 🙏 致谢

配置思路与规则集参考了 [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)、[blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)、[AIsouler/MyClash](https://github.com/AIsouler/MyClash)、[appshubcc/bett-rules](https://github.com/appshubcc/bett-rules)、[MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo)、[SubConverter](https://github.com/tindy2013/subconverter) 等项目，感谢开源。

---

## 📄 License

本项目基于 [MIT License](./LICENSE) 开源。规则集及相关资源版权归原作者所有。
