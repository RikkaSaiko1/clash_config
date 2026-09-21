// ============================================================================
// clash 覆写脚本 全规则 + 自定义 DNS (mihomo JS Override)
// 仓库 https://github.com/RikkaSaiko1/clash_config
//
// - DNS 防泄漏: fake-ip + 全 DoH(无明文 UDP 53), nameserver-policy 按规则集分组,
//   fake-ip-filter 排除私有/国内域名; nameserver / fallback 带 #PROXY, 出口分离
// - 全规则: proxy-groups 全部策略组 + 地区组, rules 完整规则链, rule-providers 全量
//
// ◆ 分流到策略组
//     分类        规则集                                策略组
//     ─────────────────────────────────────────────────────────────────────
//     AI          ai                                    AI（默认 PROXY）
//     油管        youtube                               YouTube
//     谷歌        google / google_ip                    Google
//     微软        microsoft                             Microsoft
//     苹果        apple                                 Apple
//     电报        telegram / telegram_ip                Telegram
//     游戏平台    steam / steam_ip                      Steam
//     短视频      tiktok / tiktok_ip                    TikTok
//     推特        twitter / twitter_ip                  Twitter
//     图享        instagram                             Instagram
//     奈飞        netflix / netflix_ip                  Netflix
//     影音        emby / emos + Emby 相关域名与 9 条进程名   Emby
//     网盘        pikpak                                PikPak
//     音乐        spotify / spotify_ip                  Spotify
//     加密货币    cryptocurrency                        Crypto（默认 PROXY）
//     图站        ehentai                               EHentai（默认 PROXY）
//     代码托管    github                                PROXY



const main = (config) => {

  config['tun'] = {
    enable: true,
    stack: 'mixed',
    'dns-hijack': ['any:53', 'tcp://any:53'],
    'auto-route': true,
    'auto-redirect': true,
    'auto-detect-interface': true,
    'route-exclude-address-set': ['cn_ip'],
  };

  config['sniffer'] = {
    enable: true,
    'override-destination': false,
    'force-dns-mapping': false,
    'parse-pure-ip': true,
    sniff: {
      HTTP: { ports: [80, '8080-8880'] },
      TLS: { ports: [443, 8443] },
      QUIC: { ports: [443, 8443] },
    },
    'skip-domain': ['Mijia Cloud', '+.push.apple.com'],
  };

  // ------------------------------------------------ 规则集 (rule-providers)
const RULE_BASE = { type: 'http', format: 'mrs', interval: 86400 };
const RULE_DOMAIN = { ...RULE_BASE, behavior: 'domain' };
const RULE_IPCIDR = { ...RULE_BASE, behavior: 'ipcidr' };

config['rule-providers'] = {
    private: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/private.mrs',
      path: './ruleset/private.mrs',
      'path-in-bundle': 'geo/geosite/private.mrs',
    },
    private_ip: {
      ...RULE_IPCIDR,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/private.mrs',
      path: './ruleset/private_ip.mrs',
      'path-in-bundle': 'geo/geoip/private.mrs',
    },
    games_cn: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/category-games@cn.mrs',
      path: './ruleset/category-games@cn.mrs',
      'path-in-bundle': 'geo/geosite/category-games@cn.mrs',
    },
    epicgames: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/epicgames.mrs',
      path: './ruleset/epicgames.mrs',
      'path-in-bundle': 'geo/geosite/epicgames.mrs',
    },
    nvidia_cn: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/nvidia@cn.mrs',
      path: './ruleset/nvidia@cn.mrs',
      'path-in-bundle': 'geo/geosite/nvidia@cn.mrs',
    },
    apple_cn: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/apple@cn.mrs',
      path: './ruleset/apple@cn.mrs',
      'path-in-bundle': 'geo/geosite/apple@cn.mrs',
    },
    microsoft_cn: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/microsoft@cn.mrs',
      path: './ruleset/microsoft@cn.mrs',
      'path-in-bundle': 'geo/geosite/microsoft@cn.mrs',
    },
    'geolocation-cn': {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/geolocation-cn.mrs',
      path: './ruleset/geolocation-cn.mrs',
      'path-in-bundle': 'geo/geosite/geolocation-cn.mrs',
    },
    cn_ip: {
      ...RULE_IPCIDR,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/cn.mrs',
      path: './ruleset/cn_ip.mrs',
      'path-in-bundle': 'geo/geoip/cn.mrs',
    },
    cn: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/cn.mrs',
      path: './ruleset/cn.mrs',
      'path-in-bundle': 'geo/geosite/cn.mrs',
    },
    youtube: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/youtube.mrs',
      path: './ruleset/youtube.mrs',
      'path-in-bundle': 'geo/geosite/youtube.mrs',
    },
    googlefcm: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/googlefcm.mrs',
      path: './ruleset/googlefcm.mrs',
      'path-in-bundle': 'geo/geosite/googlefcm.mrs',
    },
    google: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/google.mrs',
      path: './ruleset/google.mrs',
      'path-in-bundle': 'geo/geosite/google.mrs',
    },
    google_ip: {
      ...RULE_IPCIDR,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/google.mrs',
      path: './ruleset/google_ip.mrs',
      'path-in-bundle': 'geo/geoip/google.mrs',
    },
    ai: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/category-ai-!cn.mrs',
      path: './ruleset/ai.mrs',
      'path-in-bundle': 'geo/geosite/category-ai-!cn.mrs',
    },
    github: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/github.mrs',
      path: './ruleset/github.mrs',
      'path-in-bundle': 'geo/geosite/github.mrs',
    },
    microsoft: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/microsoft.mrs',
      path: './ruleset/microsoft.mrs',
      'path-in-bundle': 'geo/geosite/microsoft.mrs',
    },
    apple: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/apple.mrs',
      path: './ruleset/apple.mrs',
      'path-in-bundle': 'geo/geosite/apple.mrs',
    },
    telegram: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/telegram.mrs',
      path: './ruleset/telegram.mrs',
      'path-in-bundle': 'geo/geosite/telegram.mrs',
    },
    telegram_ip: {
      ...RULE_IPCIDR,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/telegram.mrs',
      path: './ruleset/telegram_ip.mrs',
      'path-in-bundle': 'geo/geoip/telegram.mrs',
    },
    steam: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/steam.mrs',
      path: './ruleset/steam.mrs',
      'path-in-bundle': 'geo/geosite/steam.mrs',
    },
    steam_ip: {
      ...RULE_IPCIDR,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/steam.mrs',
      path: './ruleset/steam_ip.mrs',
      'path-in-bundle': 'geo/geoip/steam.mrs',
    },
    tiktok: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/tiktok.mrs',
      path: './ruleset/tiktok.mrs',
      'path-in-bundle': 'geo/geosite/tiktok.mrs',
    },
    tiktok_ip: {
      ...RULE_IPCIDR,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/tiktok.mrs',
      path: './ruleset/tiktok_ip.mrs',
      'path-in-bundle': 'geo/geoip/tiktok.mrs',
    },
    twitter: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/twitter.mrs',
      path: './ruleset/twitter.mrs',
      'path-in-bundle': 'geo/geosite/twitter.mrs',
    },
    twitter_ip: {
      ...RULE_IPCIDR,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/twitter.mrs',
      path: './ruleset/twitter_ip.mrs',
      'path-in-bundle': 'geo/geoip/twitter.mrs',
    },
    instagram: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/instagram.mrs',
      path: './ruleset/instagram.mrs',
      'path-in-bundle': 'geo/geosite/instagram.mrs',
    },
    netflix: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/netflix.mrs',
      path: './ruleset/netflix.mrs',
      'path-in-bundle': 'geo/geosite/netflix.mrs',
    },
    netflix_ip: {
      ...RULE_IPCIDR,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/netflix.mrs',
      path: './ruleset/netflix_ip.mrs',
      'path-in-bundle': 'geo/geoip/netflix.mrs',
    },
    emby: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/666OS/rules@release/mihomo/domain/Emby.mrs',
      path: './ruleset/emby.mrs',
      'path-in-bundle': 'geo/geosite/category-emby.mrs',
    },
    emos: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/binaryu/emos-proxy-rule@main/rules/emos-mihomo.mrs',
      path: './ruleset/emos.mrs',
      'path-in-bundle': 'geo/geosite/category-emby.mrs',
    },
    pikpak: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/pikpak.mrs',
      path: './ruleset/pikpak.mrs',
      'path-in-bundle': 'geo/geosite/pikpak.mrs',
    },
    spotify: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/spotify.mrs',
      path: './ruleset/spotify.mrs',
      'path-in-bundle': 'geo/geosite/spotify.mrs',
    },
    spotify_ip: {
      ...RULE_IPCIDR,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/spotify.mrs',
      path: './ruleset/spotify_ip.mrs',
      'path-in-bundle': 'geo/geoip/spotify.mrs',
    },
    cryptocurrency: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/category-cryptocurrency.mrs',
      path: './ruleset/cryptocurrency.mrs',
      'path-in-bundle': 'geo/geosite/category-cryptocurrency.mrs',
    },
    ehentai: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/ehentai.mrs',
      path: './ruleset/ehentai.mrs',
      'path-in-bundle': 'geo/geosite/ehentai.mrs',
    },
    'geolocation-!cn': {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/geolocation-!cn.mrs',
      path: './ruleset/geolocation-!cn.mrs',
      'path-in-bundle': 'geo/geosite/geolocation-!cn.mrs',
    },
    adblockmihomolite: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/217heidai/adblockfilters@main/rules/adblockmihomolite.mrs',
      path: './ruleset/adblockmihomolite.mrs',
      'path-in-bundle': 'geo/geosite/category-ads-all.mrs',
    },
    fakeip_filter: {
      ...RULE_DOMAIN,
      url: 'https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/fakeip-filter.mrs',
      path: './ruleset/fakeip-filter.mrs',
      'path-in-bundle': 'geo/geosite/fakeip-filter.mrs',
    },
    cn_additional: {
      ...RULE_DOMAIN,
      url: 'https://static-file-global.353355.xyz/rules/cn-additional-list.mrs',
      path: './ruleset/cn-additional-list.mrs',
      'path-in-bundle': 'geo/geosite/cn.mrs',
    },
    // --- Fake IP 过滤 (文本格式列表) ---
    fakeipfilter_cn: {
      type: 'http',
      interval: 86400,
      behavior: 'domain',
      format: 'text',
      url: 'https://cdn.jsdelivr.net/gh/qichiyuhub/rule@main/rules/fakeipfilter-cn.list',
      path: './ruleset/fakeipfilter-cn.list',
    },
    'fakeipfilter_!cn': {
      type: 'http',
      interval: 86400,
      behavior: 'domain',
      format: 'text',
      url: 'https://cdn.jsdelivr.net/gh/qichiyuhub/rule@main/rules/fakeipfilter-!cn.list',
      path: './ruleset/fakeipfilter-!cn.list',
    },
  };

  // ------------------------------------------------ 策略组 (proxy-groups)
const GROUP_COMMON = {
  timeout: 1500,
  'max-failed-times': 5,
  'empty-fallback': 'REJECT',
  url: 'https://www.apple.com/library/test/success.html',
  lazy: true,
};
const RULE_GROUP = { type: 'select', interval: 300, ...GROUP_COMMON };
const RULE_GROUP_TEST = { type: 'url-test', interval: 60, ...GROUP_COMMON, tolerance: 50 };

const PROXIES_ALL = [
  'PROXY',
  'AUTO',
  'HK Group',
  'SG Group',
  'JP Group',
  'US Group',
  'TW Group',
  'KR Group',
  'Other Group',
];
const PROXIES_ALL_DIRECT = [...PROXIES_ALL, 'DIRECT'];

config['proxy-groups'] = [
    // PROXY
    {
      name: 'PROXY',
      ...RULE_GROUP,
      proxies: [
        'AUTO',
        'HK Group',
        'JP Group',
        'US Group',
        'SG Group',
        'TW Group',
        'KR Group',
        'Other Group',
      ],
      'include-all-proxies': true,
      icon: 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/Static.png',
    },

    // AUTO
    {
      name: 'AUTO',
      ...RULE_GROUP_TEST,
      'include-all': true,
      'exclude-type': 'DIRECT',
      hidden: false,
      icon: 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/Roundrobin.png',
    },

    // YouTube
    {
      name: 'YouTube',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/youtube.svg',
    },

    // Google FCM
    {
      name: 'Google',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/google.svg',
    },

    // AI
    {
      name: 'AI',
      ...RULE_GROUP,
      proxies: [
        'PROXY',
        'SG Group',
        'JP Group',
        'US Group',
        'KR Group',
      ],
      'default-selected': 'US Group',
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/deepseek.svg',
    },

    // Microsoft
    {
      name: 'Microsoft',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL_DIRECT],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/microsoft.svg',
    },

    // Apple
    {
      name: 'Apple',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL_DIRECT],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/apple.svg',
    },

    // Telegram
    {
      name: 'Telegram',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/telegram.svg',
    },

    // Steam
    {
      name: 'Steam',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL_DIRECT],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/steam.svg',
    },

    // TikTok
    {
      name: 'TikTok',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL],
      'default-selected': 'JP Group',
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/tiktok.svg',
    },

    // Twitter
    {
      name: 'Twitter',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/twitter.svg',
    },

    // Instagram
    {
      name: 'Instagram',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/instagram.svg',
    },

    // Netflix
    {
      name: 'Netflix',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/netflix.svg',
    },

    // Emby
    {
      name: 'Emby',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL_DIRECT],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/emby.svg',
    },

    // PikPak
    {
      name: 'PikPak',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL_DIRECT],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/pikpak.svg',
    },

    // Spotify
    {
      name: 'Spotify',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL_DIRECT],
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/spotify.svg',
    },

    // Crypto
    {
      name: 'Crypto',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL],
      'default-selected': 'JP Group',
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/Crypto.svg',
    },

    // EHentai
    {
      name: 'EHentai',
      ...RULE_GROUP,
      proxies: [...PROXIES_ALL],
      'default-selected': 'US Group',
      icon: 'https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/EHentai.svg',
    },

    // AdBlock
    {
      name: 'AdBlock',
      ...RULE_GROUP,
      proxies: [
        'REJECT',
        'REJECT-DROP',
        'PASS',
      ],
      icon: 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/Adblock.png',
    },

    // HK Group
    {
      name: 'HK Group',
      ...RULE_GROUP,
      filter: '(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong)',
      'include-all': true,
      proxies: [
        'HK Auto Group',
      ],
      icon: 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/HK.png',
    },

    // HK Auto Group
    {
      name: 'HK Auto Group',
      ...RULE_GROUP_TEST,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong)',
      hidden: true,
    },

    // JP Group
    {
      name: 'JP Group',
      ...RULE_GROUP,
      filter: '(?i)(🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan)',
      'include-all': true,
      proxies: [
        'JP Auto Group',
      ],
      icon: 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/JP.png',
    },

    // JP Auto Group
    {
      name: 'JP Auto Group',
      ...RULE_GROUP_TEST,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan)',
      hidden: true,
    },

    // US Group
    {
      name: 'US Group',
      ...RULE_GROUP,
      filter: '(?i)(🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|圣地亚哥|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states)',
      'include-all': true,
      proxies: [
        'US Auto Group',
      ],
      icon: 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/US.png',
    },

    // US Auto Group
    {
      name: 'US Auto Group',
      ...RULE_GROUP_TEST,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|圣地亚哥|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states)',
      hidden: true,
    },

    // SG Group
    {
      name: 'SG Group',
      ...RULE_GROUP,
      filter: '(?i)(🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore)',
      'include-all': true,
      proxies: [
        'SG Auto Group',
      ],
      icon: 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/SG.png',
    },

    // SG Auto Group
    {
      name: 'SG Auto Group',
      ...RULE_GROUP_TEST,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore)',
      hidden: true,
    },

    // TW Group
    {
      name: 'TW Group',
      ...RULE_GROUP,
      filter: '(?i)(🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan)',
      'include-all': true,
      proxies: [
        'TW Auto Group',
      ],
      icon: 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/TW.png',
    },

    // TW Auto Group
    {
      name: 'TW Auto Group',
      ...RULE_GROUP_TEST,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan)',
      hidden: true,
    },

    // KR Group
    {
      name: 'KR Group',
      ...RULE_GROUP,
      filter: '(?i)(🇰🇷|韩国|首尔|釜山|仁川|大邱|(?<![A-Za-z])KOR?(?![A-Za-z])|korea|south\\s*korea)',
      'include-all': true,
      proxies: [
        'KR Auto Group',
      ],
      icon: 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/KR.png',
    },

    // KR Auto Group
    {
      name: 'KR Auto Group',
      ...RULE_GROUP_TEST,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇰🇷|韩国|首尔|釜山|仁川|大邱|(?<![A-Za-z])KOR?(?![A-Za-z])|korea|south\\s*korea)',
      hidden: true,
    },

    // Other Group
    {
      name: 'Other Group',
      ...RULE_GROUP,
      'exclude-filter': '(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong|🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan|🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|圣地亚哥|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states|🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore|🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan|🇰🇷|韩国|首尔|釜山|仁川|大邱|(?<![A-Za-z])KOR?(?![A-Za-z])|korea|south\\s*korea)',
      'exclude-type': 'DIRECT',
      'include-all': true,
      proxies: [
        'Other Auto Group',
      ],
      icon: 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/Global.png',
    },

    // Other Auto Group
    {
      name: 'Other Auto Group',
      ...RULE_GROUP_TEST,
      'include-all': true,
      'exclude-type': 'DIRECT',
      'exclude-filter': '(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong|🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan|🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|圣地亚哥|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states|🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore|🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan|🇰🇷|韩国|首尔|釜山|仁川|大邱|(?<![A-Za-z])KOR?(?![A-Za-z])|korea|south\\s*korea)',
      hidden: true,
    },

  ];

  config['dns'] = {
    enable: true,
    'cache-algorithm': 'arc',
    ipv6: false,
    'enhanced-mode': 'fake-ip',
    'fake-ip-ttl': 1,
    'fake-ip-range': '198.18.0.0/16',
    'fake-ip-filter-mode': 'blacklist',
    'default-nameserver': [
      'https://223.5.5.5/dns-query',
    ],
    'proxy-server-nameserver': [
      'https://dns.alidns.com/dns-query',
      'https://doh.pub/dns-query',
    ],
    'direct-nameserver': [
      'https://dns.alidns.com/dns-query',
      'https://doh.pub/dns-query',
    ],
    nameserver: [
      'https://8.8.8.8/dns-query#PROXY&ecs=223.5.5.0/24',
    ],
    fallback: [
      'https://8.8.8.8/dns-query#PROXY',
    ],
    'fallback-filter': {
      geoip: true,
      'geoip-code': 'CN',
    },
    // nameserver-policy
    'nameserver-policy': {
      'rule-set:cn,private,fakeipfilter_cn,games_cn,microsoft_cn,apple_cn': [
        'https://dns.alidns.com/dns-query#disable-qtype-65=true',
        'https://doh.pub/dns-query#disable-qtype-65=true',
      ],
      'rule-set:fakeipfilter_!cn': [
        'https://8.8.8.8/dns-query#PROXY&disable-qtype-65=true',
      ],
    },
    'fake-ip-filter': [
      'rule-set:fakeipfilter_cn',
      'rule-set:fakeipfilter_!cn',
      'rule-set:private',
      'rule-set:cn',
      'rule-set:microsoft_cn',
      'rule-set:apple_cn',
      'rule-set:games_cn',
    ],
  };

  // ------------------------------------------------ 分流规则 (rules)
  config['rules'] = [
    // 私有网络直连
    'RULE-SET,private,DIRECT',
    'RULE-SET,private_ip,DIRECT,no-resolve',
    // 国内直连
    'RULE-SET,geolocation-cn,DIRECT',
    'RULE-SET,games_cn,DIRECT', // 已包含 steam 下载域名
    'RULE-SET,epicgames,DIRECT',
    'RULE-SET,nvidia_cn,DIRECT',
    'RULE-SET,apple_cn,DIRECT',
    'RULE-SET,microsoft_cn,DIRECT',
    'DOMAIN,fsend.cn,DIRECT',
    'DOMAIN,international-gfe.download.nvidia.com,DIRECT',
    // 禁用国外 QUIC 流量
    'AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((OR,((RULE-SET,cn_additional),(RULE-SET,cn_ip,no-resolve)))))),REJECT',
    // 广告拦截 | 拦截 STUN/TURN 探测
    'RULE-SET,adblockmihomolite,AdBlock',
    'AND,((NETWORK,UDP),(OR,((DST-PORT,3478-3481),(DST-PORT,5349),(DST-PORT,19302-19309)))),REJECT',
    // emby
    'RULE-SET,emby,Emby',
    'RULE-SET,emos,Emby',
    'DOMAIN-SUFFIX,mb3admin.com,Emby',
    'DOMAIN-SUFFIX,nubebelle.com,Emby',
    'DOMAIN-KEYWORD,emby,Emby',
    'PROCESS-NAME,com.mb.android,Emby',
    'PROCESS-NAME,tv.emby.embyatv,Emby',
    'PROCESS-NAME,com.hush.yamby,Emby',
    'PROCESS-NAME,com.jellycine.app,Emby',
    'PROCESS-NAME,com.mountains.hills,Emby',
    'PROCESS-NAME,RodelPlayer.App.exe,Emby',
    'PROCESS-NAME,com.feifeiduck.capyplayer,Emby',
    // 代理规则
    'RULE-SET,ai,AI',
    'RULE-SET,youtube,YouTube',
    'RULE-SET,googlefcm,DIRECT',
    'RULE-SET,google,Google',
    'RULE-SET,google_ip,Google,no-resolve',
    'RULE-SET,github,PROXY',
    'RULE-SET,microsoft,Microsoft',
    'RULE-SET,apple,Apple',
    'RULE-SET,telegram,Telegram',
    'RULE-SET,telegram_ip,Telegram,no-resolve',
    'RULE-SET,steam,Steam',
    'RULE-SET,steam_ip,Steam,no-resolve',
    'RULE-SET,tiktok,TikTok',
    'RULE-SET,tiktok_ip,TikTok,no-resolve',
    'RULE-SET,twitter,Twitter',
    'RULE-SET,twitter_ip,Twitter,no-resolve',
    'RULE-SET,instagram,Instagram',
    'RULE-SET,netflix,Netflix',
    'RULE-SET,netflix_ip,Netflix,no-resolve',
    'RULE-SET,pikpak,PikPak',
    'RULE-SET,spotify,Spotify',
    'RULE-SET,spotify_ip,Spotify,no-resolve',
    'RULE-SET,cryptocurrency,Crypto',
    'RULE-SET,ehentai,EHentai',
    // 兜底规则
    'RULE-SET,geolocation-!cn,PROXY',
    'RULE-SET,cn_ip,DIRECT',
    'MATCH,PROXY',
  ];

  return config;
};
