// ============================================================================
// clash 覆写脚本 轻量 (mihomo JS Override)
// 仓库 https://github.com/RikkaSaiko1/clash_config
//
// - DNS 防泄漏
// - 轻量规则集: 精简策略组 + 精简规则链

const main = (config) => {

  // ------------------------------------------------ 通用 / 运行参数
  config['allow-lan'] = true;
  config['bind-address'] = '*';
  config['ipv6'] = false;
  config['unified-delay'] = true;
  config['tcp-concurrent'] = true;
  config['log-level'] = 'info';
  config['keep-alive-idle'] = 600;
  config['keep-alive-interval'] = 15;

  config['profile'] = {
    'store-selected': true,
    'store-fake-ip': true,
  };

  config['external-ui'] = 'ui';
  config['external-ui-name'] = 'zashboard';
  config['external-ui-url'] = 'https://github.com/Zephyruso/zashboard/archive/refs/heads/gh-pages.zip';

  config['geox-url'] = {
    geoip: 'https://github.com/appshubcc/bett-rules/releases/download/latest/geoip.dat',
    geosite: 'https://github.com/appshubcc/bett-rules/releases/download/latest/geosite.dat',
    mmdb: 'https://github.com/appshubcc/bett-rules/releases/download/latest/geoip.metadb',
    asn: 'https://github.com/appshubcc/bett-rules/releases/download/latest/GeoLite2-ASN.mmdb',
  };

  config['ntp'] = {
    enable: true,
    'write-to-system': true,
  };

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

  // ------------------------------------------------ DNS (防泄漏)
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

  // ------------------------------------------------ 规则集 (rule-providers)
  config['rule-providers'] = {
    private: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/private.mrs',
      path: './ruleset/private.mrs',
      'path-in-bundle': 'geo/geosite/private.mrs',
    },
    private_ip: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'ipcidr',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/private.mrs',
      path: './ruleset/private_ip.mrs',
      'path-in-bundle': 'geo/geoip/private.mrs',
    },
    games_cn: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/category-games@cn.mrs',
      path: './ruleset/category-games@cn.mrs',
      'path-in-bundle': 'geo/geosite/category-games@cn.mrs',
    },
    epicgames: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/epicgames.mrs',
      path: './ruleset/epicgames.mrs',
      'path-in-bundle': 'geo/geosite/epicgames.mrs',
    },
    nvidia_cn: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/nvidia@cn.mrs',
      path: './ruleset/nvidia@cn.mrs',
      'path-in-bundle': 'geo/geosite/nvidia@cn.mrs',
    },
    apple_cn: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/apple@cn.mrs',
      path: './ruleset/apple@cn.mrs',
      'path-in-bundle': 'geo/geosite/apple@cn.mrs',
    },
    microsoft_cn: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/microsoft@cn.mrs',
      path: './ruleset/microsoft@cn.mrs',
      'path-in-bundle': 'geo/geosite/microsoft@cn.mrs',
    },
    'geolocation-cn': {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/geolocation-cn.mrs',
      path: './ruleset/geolocation-cn.mrs',
      'path-in-bundle': 'geo/geosite/geolocation-cn.mrs',
    },
    cn_ip: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'ipcidr',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/cn.mrs',
      path: './ruleset/cn_ip.mrs',
      'path-in-bundle': 'geo/geoip/cn.mrs',
    },
    youtube: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/youtube.mrs',
      path: './ruleset/youtube.mrs',
      'path-in-bundle': 'geo/geosite/youtube.mrs',
    },
    googlefcm: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/googlefcm.mrs',
      path: './ruleset/googlefcm.mrs',
      'path-in-bundle': 'geo/geosite/googlefcm.mrs',
    },
    google: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/google.mrs',
      path: './ruleset/google.mrs',
      'path-in-bundle': 'geo/geosite/google.mrs',
    },
    google_ip: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'ipcidr',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/google.mrs',
      path: './ruleset/google_ip.mrs',
      'path-in-bundle': 'geo/geoip/google.mrs',
    },
    ai: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/category-ai-!cn.mrs',
      path: './ruleset/ai.mrs',
      'path-in-bundle': 'geo/geosite/category-ai-!cn.mrs',
    },
    telegram: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/telegram.mrs',
      path: './ruleset/telegram.mrs',
      'path-in-bundle': 'geo/geosite/telegram.mrs',
    },
    telegram_ip: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'ipcidr',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/telegram.mrs',
      path: './ruleset/telegram_ip.mrs',
      'path-in-bundle': 'geo/geoip/telegram.mrs',
    },
    twitter: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/twitter.mrs',
      path: './ruleset/twitter.mrs',
      'path-in-bundle': 'geo/geosite/twitter.mrs',
    },
    twitter_ip: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'ipcidr',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/twitter.mrs',
      path: './ruleset/twitter_ip.mrs',
      'path-in-bundle': 'geo/geoip/twitter.mrs',
    },
    'geolocation-!cn': {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/geolocation-!cn.mrs',
      path: './ruleset/geolocation-!cn.mrs',
      'path-in-bundle': 'geo/geosite/geolocation-!cn.mrs',
    },
    adblockmihomolite: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/217heidai/adblockfilters@main/rules/adblockmihomolite.mrs',
      path: './ruleset/adblockmihomolite.mrs',
      'path-in-bundle': 'geo/geosite/category-ads-all.mrs',
    },
    cn_additional: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://static-file-global.353355.xyz/rules/cn-additional-list.mrs',
      path: './ruleset/cn-additional-list.mrs',
      'path-in-bundle': 'geo/geosite/cn.mrs',
    },
    cn: {
      type: 'http',
      format: 'mrs',
      interval: 86400,
      behavior: 'domain',
      url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/cn.mrs',
      path: './ruleset/cn.mrs',
      'path-in-bundle': 'geo/geosite/cn.mrs',
    },
    fakeipfilter_cn: {
      type: 'http',
      interval: 86400,
      behavior: 'domain',
      format: 'text',
      url: 'https://raw.githubusercontent.com/qichiyuhub/rule/refs/heads/main/rules/fakeipfilter-cn.list',
      path: './ruleset/fakeipfilter-cn.list',
    },
    'fakeipfilter_!cn': {
      type: 'http',
      interval: 86400,
      behavior: 'domain',
      format: 'text',
      url: 'https://raw.githubusercontent.com/qichiyuhub/rule/refs/heads/main/rules/fakeipfilter-!cn.list',
      path: './ruleset/fakeipfilter-!cn.list',
    },
  };

  // ------------------------------------------------ 策略组 (proxy-groups)
  config['proxy-groups'] = [
    // PROXY
    {
      name: 'PROXY',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
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
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png',
    },

    // AUTO
    {
      name: 'AUTO',
      type: 'url-test',
      interval: 60,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      tolerance: 50,
      'include-all': true,
      'exclude-type': 'DIRECT',
      hidden: false,
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png',
    },

    // YouTube
    {
      name: 'YouTube',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      proxies: [
        'PROXY',
        'AUTO',
        'HK Group',
        'SG Group',
        'JP Group',
        'US Group',
        'TW Group',
        'KR Group',
        'Other Group',
      ],
      icon: 'https://fastly.jsdelivr.net/gh/MiToverG422/Qure@master/IconSet/Color/YouTube.png',
    },

    // Google
    {
      name: 'Google',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      proxies: [
        'PROXY',
        'AUTO',
        'HK Group',
        'SG Group',
        'JP Group',
        'US Group',
        'TW Group',
        'KR Group',
        'Other Group',
      ],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png',
    },

    // AI
    {
      name: 'AI',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      proxies: [
        'PROXY',
        'SG Group',
        'JP Group',
        'US Group',
        'KR Group',
      ],
      'default-selected': 'US Group',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ChatGPT.png',
    },

    // Telegram
    {
      name: 'Telegram',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      proxies: [
        'PROXY',
        'AUTO',
        'HK Group',
        'SG Group',
        'JP Group',
        'US Group',
        'TW Group',
        'KR Group',
        'Other Group',
      ],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png',
    },

    // Twitter
    {
      name: 'Twitter',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      proxies: [
        'PROXY',
        'AUTO',
        'HK Group',
        'SG Group',
        'JP Group',
        'US Group',
        'TW Group',
        'KR Group',
        'Other Group',
      ],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Twitter.png',
    },

    // HK Group
    {
      name: 'HK Group',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      filter: '(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong)',
      'include-all': true,
      proxies: [
        'HK Auto Group',
      ],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png',
    },

    // HK Auto Group
    {
      name: 'HK Auto Group',
      type: 'url-test',
      interval: 60,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      tolerance: 50,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong)',
      hidden: true,
    },

    // JP Group
    {
      name: 'JP Group',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      filter: '(?i)(🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan)',
      'include-all': true,
      proxies: [
        'JP Auto Group',
      ],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png',
    },

    // JP Auto Group
    {
      name: 'JP Auto Group',
      type: 'url-test',
      interval: 60,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      tolerance: 50,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan)',
      hidden: true,
    },

    // US Group
    {
      name: 'US Group',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      filter: '(?i)(🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|圣地亚哥|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states)',
      'include-all': true,
      proxies: [
        'US Auto Group',
      ],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png',
    },

    // US Auto Group
    {
      name: 'US Auto Group',
      type: 'url-test',
      interval: 60,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      tolerance: 50,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|圣地亚哥|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states)',
      hidden: true,
    },

    // SG Group
    {
      name: 'SG Group',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      filter: '(?i)(🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore)',
      'include-all': true,
      proxies: [
        'SG Auto Group',
      ],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png',
    },

    // SG Auto Group
    {
      name: 'SG Auto Group',
      type: 'url-test',
      interval: 60,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      tolerance: 50,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore)',
      hidden: true,
    },

    // TW Group
    {
      name: 'TW Group',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      filter: '(?i)(🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan)',
      'include-all': true,
      proxies: [
        'TW Auto Group',
      ],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png',
    },

    // TW Auto Group
    {
      name: 'TW Auto Group',
      type: 'url-test',
      interval: 60,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      tolerance: 50,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan)',
      hidden: true,
    },

    // KR Group
    {
      name: 'KR Group',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      filter: '(?i)(🇰🇷|韩国|首尔|釜山|仁川|大邱|(?<![A-Za-z])KOR?(?![A-Za-z])|korea|south\\s*korea)',
      'include-all': true,
      proxies: [
        'KR Auto Group',
      ],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Korea.png',
    },

    // KR Auto Group
    {
      name: 'KR Auto Group',
      type: 'url-test',
      interval: 60,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      tolerance: 50,
      'include-all': true,
      'exclude-type': 'DIRECT',
      filter: '(?i)(🇰🇷|韩国|首尔|釜山|仁川|大邱|(?<![A-Za-z])KOR?(?![A-Za-z])|korea|south\\s*korea)',
      hidden: true,
    },

    // Other Group
    {
      name: 'Other Group',
      type: 'select',
      interval: 300,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      'exclude-filter': '(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong|🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan|🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|圣地亚哥|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states|🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore|🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan|🇰🇷|韩国|首尔|釜山|仁川|大邱|(?<![A-Za-z])KOR?(?![A-Za-z])|korea|south\\s*korea)',
      'exclude-type': 'DIRECT',
      'include-all': true,
      proxies: [
        'Other Auto Group',
      ],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/World_Map.png',
    },

    // Other Auto Group
    {
      name: 'Other Auto Group',
      type: 'url-test',
      interval: 60,
      timeout: 1500,
      'max-failed-times': 5,
      'empty-fallback': 'REJECT',
      url: 'https://www.apple.com/library/test/success.html',
      lazy: true,
      tolerance: 50,
      'include-all': true,
      'exclude-type': 'DIRECT',
      'exclude-filter': '(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong|🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan|🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|圣地亚哥|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states|🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore|🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan|🇰🇷|韩国|首尔|釜山|仁川|大邱|(?<![A-Za-z])KOR?(?![A-Za-z])|korea|south\\s*korea)',
      hidden: true,
    },

  ];

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
    // 拦截 STUN/TURN 探测（3478-3481 STUN/TURN、5349 STUN-over-TLS、19302-19309 Google STUN）
    'AND,((NETWORK,UDP),(OR,((DST-PORT,3478-3481),(DST-PORT,5349),(DST-PORT,19302-19309)))),REJECT',
    // 禁用国外 QUIC 流量
    'AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((OR,((RULE-SET,cn_additional),(RULE-SET,cn_ip,no-resolve)))))),REJECT',
    // 广告拦截
    'RULE-SET,adblockmihomolite,REJECT',
    // 代理规则
    'RULE-SET,youtube,YouTube',
    'RULE-SET,googlefcm,DIRECT',
    'RULE-SET,google,Google',
    'RULE-SET,google_ip,Google,no-resolve',
    'RULE-SET,ai,AI',
    'RULE-SET,telegram,Telegram',
    'RULE-SET,telegram_ip,Telegram,no-resolve',
    'RULE-SET,twitter,Twitter',
    'RULE-SET,twitter_ip,Twitter,no-resolve',
    'RULE-SET,geolocation-!cn,PROXY',
    'RULE-SET,cn_ip,DIRECT',
    'MATCH,PROXY',
  ];

  return config;
};
