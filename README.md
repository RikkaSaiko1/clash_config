# clash_config

自用的 Mihomo / Clash Meta 配置，开箱即用。

`多订阅管理` `规则分流` `SubConverter`



***

## 📦 配置文件



| 文件                                                               | 说明                      |
| ---------------------------------------------------------------- | ----------------------- |
| [config.yaml](./config.yaml)                                     | 完整配置（直接加载使用）            |
| [config\_Override\_Full.yaml](./config_Override_Full.yaml)       | 覆写配置（全规则版）              |
| [config\_Override\_lite.yaml](./config_Override_lite.yaml)       | 覆写配置（轻量版）               |
| [SubConverter\_config\_Full.ini](./SubConverter_config_Full.ini) | SubConverter 订阅转换（全规则版） |
| [SubConverter\_config\_lite.ini](./SubConverter_config_lite.ini) | SubConverter 订阅转换（轻量版）  |

> **Full**
> 规则覆盖全面，
> **Lite**
> 精简规则、占用更低，按需选用。



***

## 🚀 使用方式

### config.yaml（直接使用）



1. 下载 `config.yaml`，修改订阅地址：



```
proxy-providers:

\&#x20; 节点1:

\&#x20;   url: "你的订阅链接"   # 替换 your\\\_subscription\\\_url
```


### 覆写配置（Override）

适用于 Clash Verge Rev、FlClash 等支持覆写的客户端，在原始订阅上叠加规则与策略组：



1. 复制覆写文件的 raw 链接，例如：

* 全规则：`https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_Full.yaml`

* 轻量：`https://raw.githubusercontent.com/RikkaSaiko1/clash_config/main/config_Override_lite.yaml`

1. 在客户端「覆写」设置中粘贴该链接

2. 更新订阅后生效

### SubConverter 配置

适用于自建 SubConverter 订阅转换服务：



1. 部署 [SubConverter](https://github.com/tindy2013/subconverter)

2. 将 `.ini` 文件放入 SubConverter 的 `config` 目录

3. 转换时通过 `config` 参数指定配置名（不带 `.ini` 后缀）：



```
https://你的域名/sub?target=mihomo\\\&url=订阅链接\\\&config=SubConverter\\\_config\\\_Full
```



***

## 🙏 致谢

配置思路与规则集参考了 [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)、[blackmatrix7/ios\_rule\_script](https://github.com/blackmatrix7/ios_rule_script)、[AIsouler/MyClash](https://github.com/AIsouler/MyClash)、[appshubcc/bett-rules](https://github.com/appshubcc/bett-rules)、[MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo)、[SubConverter](https://github.com/tindy2013/subconverter) 等项目，感谢开源。



***

## 📄 License

本项目基于 [MIT License](./LICENSE) 开源。规则集及相关资源版权归原作者所有。
