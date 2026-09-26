// ============================================================================
// clash 覆写脚本 · 全规则 (mihomo JS Override)
// 仓库 https://github.com/RikkaSaiko1/clash_config
// ============================================================================

// 配置开关：true 启用 / false 禁用（关闭后对应分组与规则不写入产物）
const OPTIONS = {
  // 分流组
  FCM: true,        // Google FCM
  YouTube: true,    // YouTube
  Google: true,     // Google
  AI: true,         // 国外 AI
  Microsoft: true,  // Microsoft
  Apple: true,      // Apple
  Telegram: true,   // Telegram
  Steam: true,      // Steam
  TikTok: true,     // TikTok
  Twitter: true,    // Twitter
  Instagram: true,  // Instagram
  Netflix: true,    // Netflix
  Emby: true,       // Emby
  PikPak: true,     // PikPak
  Spotify: true,    // Spotify
  Crypto: true,     // 加密货币
  EHentai: true,    // E-Hentai
  GitHub: true,     // GitHub
  AdBlock: true,    // 广告拦截
  // 功能开关
  BlockQUIC: true,  // 屏蔽国外 QUIC
};

// 去重并过滤空值；传 getter 时按字段去重
const dedupe = (arr, getter) => {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const value = getter ? getter(item) : item;
    if (!value) continue;
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
};

// 收集节点来源（顶层 proxies + provider），提取节点域名；
// 顶层无节点但存在 provider 时，fallbackUse 兜底 use 全部 provider
const collectNodeSources = (config) => {
  config['proxies'] = Array.isArray(config['proxies']) ? config['proxies'] : [];

  // 顶层节点名
  const topProxyNames = dedupe(
    config['proxies'],
    (p) => (typeof p === 'string' ? p : p && p.name),
  );

  // provider 名
  const providers = config['proxy-providers'];
  const providerNames = dedupe(
    providers && typeof providers === 'object' ? Object.keys(providers) : [],
  );

  // 节点 server 里的域名（非纯 IP）
  const isIp = (s) => /^\d{1,3}(\.\d{1,3}){3}$/.test(s) || s.includes(':');
  const nodeDomains = dedupe(
    config['proxies']
      .filter((p) => p && typeof p === 'object')
      .map((p) => p.server)
      .filter((s) => typeof s === 'string' && s && !isIp(s)),
  );

  // 顶层无节点但有 provider 时兜底 use 所有 provider
  const fallbackUse = (topProxyNames.length === 0 && providerNames.length > 0) ? providerNames : null;

  return { topProxyNames, providerNames, fallbackUse, nodeDomains };
};

// TUN
const overwriteTun = (config) => {
  config['tun'] = {
    'enable': true,
    'stack': 'mips',
    'dns-hijack': ['any:53', 'tcp://any:53'],
    'auto-route': true,
    'auto-redirect': true,
    'auto-detect-interface': true,
    'route-exclude-address-set': ['cn_ip'],
  };
};

// Sniffer
const overwriteSniffer = (config) => {
  config['sniffer'] = {
    'enable': true,
    'override-destination': false,
    'force-dns-mapping': false,
    'parse-pure-ip': true,
    'sniff': {
      'HTTP': { 'ports': [80, '8080-8880'] },
      'TLS': { 'ports': [443, 8443] },
      'QUIC': { 'ports': [443, 8443] },
    },
    'skip-domain': ['Mijia Cloud', '+.push.apple.com'],
  };
};

// 规则集 (rule-providers)
const overwriteRuleProviders = (config) => {
  const RULE_BASE = { 'type': 'http', 'format': 'mrs', 'interval': 86400, 'dialer-proxy': 'DIRECT' };
  const RULE_DOMAIN = { ...RULE_BASE, 'behavior': 'domain' };
  const RULE_IPCIDR = { ...RULE_BASE, 'behavior': 'ipcidr' };

  const mrs_domain = (bundle, file = bundle) => ({...RULE_DOMAIN,'url': `https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/${bundle}.mrs`,'path': `./ruleset/${file}.mrs`,'path-in-bundle': `geo/geosite/${bundle}.mrs`,});
  const mrs_ipcidr = (bundle, file) => ({...RULE_IPCIDR,'url': `https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/${bundle}.mrs`,'path': `./ruleset/${file}.mrs`,'path-in-bundle': `geo/geoip/${bundle}.mrs`,});

  config['rule-providers'] = {
    'private': mrs_domain('private'),
    'private_ip': mrs_ipcidr('private', 'private_ip'),
    'games_cn': mrs_domain('category-games@cn'),
    'epicgames': mrs_domain('epicgames'),
    'nvidia_cn': mrs_domain('nvidia@cn'),
    'apple_cn': mrs_domain('apple@cn'),
    'microsoft_cn': mrs_domain('microsoft@cn'),
    'geolocation-cn': mrs_domain('geolocation-cn'),
    'cn_ip': mrs_ipcidr('cn', 'cn_ip'),
    'cn': mrs_domain('cn'),
    'youtube': mrs_domain('youtube'),
    'googlefcm': mrs_domain('googlefcm'),
    'google': mrs_domain('google'),
    'google_ip': mrs_ipcidr('google', 'google_ip'),
    'ai': mrs_domain('category-ai-!cn', 'ai'),
    'github': mrs_domain('github'),
    'microsoft': mrs_domain('microsoft'),
    'apple': mrs_domain('apple'),
    'telegram': mrs_domain('telegram'),
    'telegram_ip': mrs_ipcidr('telegram', 'telegram_ip'),
    'steam': mrs_domain('steam'),
    'steam_ip': mrs_ipcidr('steam', 'steam_ip'),
    'tiktok': mrs_domain('tiktok'),
    'tiktok_ip': mrs_ipcidr('tiktok', 'tiktok_ip'),
    'twitter': mrs_domain('twitter'),
    'twitter_ip': mrs_ipcidr('twitter', 'twitter_ip'),
    'instagram': mrs_domain('instagram'),
    'netflix': mrs_domain('netflix'),
    'netflix_ip': mrs_ipcidr('netflix', 'netflix_ip'),
    'pikpak': mrs_domain('pikpak'),
    'spotify': mrs_domain('spotify'),
    'spotify_ip': mrs_ipcidr('spotify', 'spotify_ip'),
    'cryptocurrency': mrs_domain('category-cryptocurrency', 'cryptocurrency'),
    'ehentai': mrs_domain('ehentai'),
    'geolocation-!cn': mrs_domain('geolocation-!cn', 'geolocation-!cn'),
    'fakeip_filter': mrs_domain('fakeip-filter'),
    'emby': {
      ...RULE_DOMAIN,
      'url': 'https://cdn.jsdelivr.net/gh/666OS/rules@release/mihomo/domain/Emby.mrs',
      'path': './ruleset/emby.mrs',
      'path-in-bundle': 'geo/geosite/category-emby.mrs',
    },
    'emos': {
      ...RULE_DOMAIN,
      'url': 'https://cdn.jsdelivr.net/gh/binaryu/emos-proxy-rule@main/rules/emos-mihomo.mrs',
      'path': './ruleset/emos.mrs',
      'path-in-bundle': 'geo/geosite/category-emos.mrs',
    },

    'adblockmihomolite': {
      ...RULE_DOMAIN,
      'url': 'https://cdn.jsdelivr.net/gh/217heidai/adblockfilters@main/rules/adblockmihomolite.mrs',
      'path': './ruleset/adblockmihomolite.mrs',
      'path-in-bundle': 'geo/geosite/category-ads-all.mrs',
    },
    'cn_additional': {
      ...RULE_DOMAIN,
      'url': 'https://static-file-global.353355.xyz/rules/cn-additional-list.mrs',
      'path': './ruleset/cn-additional-list.mrs',
      'path-in-bundle': 'geo/geosite/cn.mrs',
    },
    'fakeipfilter_cn': {
      'type': 'http',
      'interval': 86400,
      'behavior': 'domain',
      'format': 'text',
      'dialer-proxy': 'DIRECT',
      'url': 'https://cdn.jsdelivr.net/gh/qichiyuhub/rule@main/rules/fakeipfilter-cn.list',
      'path': './ruleset/fakeipfilter-cn.list',
    },
    'fakeipfilter_!cn': {
      'type': 'http',
      'interval': 86400,
      'behavior': 'domain',
      'format': 'text',
      'dialer-proxy': 'DIRECT',
      'url': 'https://cdn.jsdelivr.net/gh/qichiyuhub/rule@main/rules/fakeipfilter-!cn.list',
      'path': './ruleset/fakeipfilter-!cn.list',
    },
  };
};

// 策略组 (proxy-groups)
const overwriteProxyGroups = (config, ctx) => {
  const { topProxyNames, fallbackUse: FALLBACK_USE } = ctx;

  // 判断地区是否有节点：可读到节点名就按 filter 匹配（空地区组隐藏），
  // 读不到（远程 provider）则保持显示；(?i) 前缀转成 JS 的 i 标志
  const makeRegionHasNodes = (topProxyNames) => {
    const canInspectNodes = topProxyNames.length > 0;
    const regexCache = new Map();

    const compile = (filter) => {
      let re = regexCache.get(filter);
      if (!re) {
        re = new RegExp(filter.replace(/^\(\?i\)/, ''), 'i');
        regexCache.set(filter, re);
      }
      return re;
    };

    return (filter) => {
      if (!canInspectNodes) return true;
      const re = compile(filter);
      return topProxyNames.some((n) => re.test(n));
    };
  };
  const regionHasNodes = makeRegionHasNodes(topProxyNames);

  const GROUP_COMMON = {'timeout': 1500,'max-failed-times': 5,'empty-fallback': 'REJECT','url': 'https://www.apple.com/library/test/success.html','lazy': true,};
  const RULE_GROUP = { 'type': 'select', 'interval': 300, ...GROUP_COMMON };
  const RULE_GROUP_TEST = { 'type': 'url-test', 'interval': 60, ...GROUP_COMMON, 'tolerance': 50 };
  const PROXIES_ALL = ['PROXY','AUTO','HK Group','SG Group','JP Group','US Group','TW Group','KR Group', 'Other Group',];
  const list = (arr) => [...arr];
  const PROXIES_ALL_DIRECT = [...PROXIES_ALL, 'DIRECT'];

  const svg = (name) => `https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/${name}.svg`;
  const png = (name) => `https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/${name}.png`;

  const PROXIES_PROXY = ['AUTO','HK Group','JP Group','US Group','SG Group','TW Group','KR Group','Other Group',];
  const PROXIES_AI = ['PROXY', 'SG Group', 'JP Group', 'US Group', 'KR Group'];
  const PROXIES_REJECT = ['REJECT', 'REJECT-DROP', 'PASS'];
  const FILTER_HK = '(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong)';
  const FILTER_JP = '(?i)(🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan)';
  const FILTER_US = '(?i)(🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|圣地亚哥|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states)';
  const FILTER_SG = '(?i)(🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore)';
  const FILTER_TW = '(?i)(🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan)';
  const FILTER_KR = '(?i)(🇰🇷|韩国|首尔|釜山|仁川|大邱|(?<![A-Za-z])KOR?(?![A-Za-z])|korea|south\\s*korea)';
  const EXCLUDE_FILTER = `(?i)(${[FILTER_HK, FILTER_JP, FILTER_US, FILTER_SG, FILTER_TW, FILTER_KR]
    .map((pattern) => pattern.slice('(?i)('.length, -1))
    .join('|')})`;


  config['proxy-groups'] = [
    { 'name': 'PROXY', ...RULE_GROUP, 'proxies': list(PROXIES_PROXY), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': png('Static') },
    { 'name': 'AUTO', ...RULE_GROUP_TEST, 'include-all': true, 'exclude-type': 'DIRECT', 'hidden': false, 'icon': png('Urltest') },
    ...(OPTIONS.YouTube ? [{ 'name': 'YouTube', ...RULE_GROUP, 'proxies': list(PROXIES_ALL), 'icon': svg('youtube') }] : []),
    ...(OPTIONS.Google ? [{ 'name': 'Google', ...RULE_GROUP, 'proxies': list(PROXIES_ALL), 'icon': svg('google') }] : []),
    ...(OPTIONS.AI ? [{ 'name': 'AI', ...RULE_GROUP, 'proxies': list(PROXIES_AI), 'default-selected': 'US Group', 'icon': svg('deepseek') }] : []),
    ...(OPTIONS.Microsoft ? [{ 'name': 'Microsoft', ...RULE_GROUP, 'proxies': list(PROXIES_ALL_DIRECT), 'icon': svg('microsoft') }] : []),
    ...(OPTIONS.Apple ? [{ 'name': 'Apple', ...RULE_GROUP, 'proxies': list(PROXIES_ALL_DIRECT), 'icon': svg('apple') }] : []),
    ...(OPTIONS.Telegram ? [{ 'name': 'Telegram', ...RULE_GROUP, 'proxies': list(PROXIES_ALL), 'icon': svg('telegram') }] : []),
    ...(OPTIONS.Steam ? [{ 'name': 'Steam', ...RULE_GROUP, 'proxies': list(PROXIES_ALL_DIRECT), 'icon': svg('steam') }] : []),
    ...(OPTIONS.TikTok ? [{ 'name': 'TikTok', ...RULE_GROUP, 'proxies': list(PROXIES_ALL), 'default-selected': 'JP Group', 'icon': svg('tiktok') }] : []),
    ...(OPTIONS.Twitter ? [{ 'name': 'Twitter', ...RULE_GROUP, 'proxies': list(PROXIES_ALL), 'icon': svg('twitter') }] : []),
    ...(OPTIONS.Instagram ? [{ 'name': 'Instagram', ...RULE_GROUP, 'proxies': list(PROXIES_ALL), 'icon': svg('instagram') }] : []),
    ...(OPTIONS.Netflix ? [{ 'name': 'Netflix', ...RULE_GROUP, 'proxies': list(PROXIES_ALL), 'icon': svg('netflix') }] : []),
    ...(OPTIONS.Emby ? [{ 'name': 'Emby', ...RULE_GROUP, 'proxies': list(PROXIES_ALL_DIRECT), 'icon': svg('emby') }] : []),
    ...(OPTIONS.PikPak ? [{ 'name': 'PikPak', ...RULE_GROUP, 'proxies': list(PROXIES_ALL_DIRECT), 'icon': svg('pikpak') }] : []),
    ...(OPTIONS.Spotify ? [{ 'name': 'Spotify', ...RULE_GROUP, 'proxies': list(PROXIES_ALL_DIRECT), 'icon': svg('spotify') }] : []),
    ...(OPTIONS.Crypto ? [{ 'name': 'Crypto', ...RULE_GROUP, 'proxies': list(PROXIES_ALL), 'default-selected': 'JP Group', 'icon': svg('Crypto') }] : []),
    ...(OPTIONS.EHentai ? [{ 'name': 'EHentai', ...RULE_GROUP, 'proxies': list(PROXIES_ALL), 'default-selected': 'US Group', 'icon': svg('EHentai') }] : []),
    ...(OPTIONS.AdBlock ? [{ 'name': 'AdBlock', ...RULE_GROUP, 'proxies': list(PROXIES_REJECT), 'icon': png('Adblock') }] : []),
    { 'name': 'HK Group', ...RULE_GROUP, 'filter': FILTER_HK, 'include-all': true, 'proxies': ['HK Auto Group'], 'hidden': !regionHasNodes(FILTER_HK), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': png('HK') },
    { 'name': 'HK Auto Group', ...RULE_GROUP_TEST, 'include-all': true, 'exclude-type': 'DIRECT', 'filter': FILTER_HK, 'hidden': true },
    { 'name': 'JP Group', ...RULE_GROUP, 'filter': FILTER_JP, 'include-all': true, 'proxies': ['JP Auto Group'], 'hidden': !regionHasNodes(FILTER_JP), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': png('JP') },
    { 'name': 'JP Auto Group', ...RULE_GROUP_TEST, 'include-all': true, 'exclude-type': 'DIRECT', 'filter': FILTER_JP, 'hidden': true },
    { 'name': 'US Group', ...RULE_GROUP, 'filter': FILTER_US, 'include-all': true, 'proxies': ['US Auto Group'], 'hidden': !regionHasNodes(FILTER_US), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': png('US') },
    { 'name': 'US Auto Group', ...RULE_GROUP_TEST, 'include-all': true, 'exclude-type': 'DIRECT', 'filter': FILTER_US, 'hidden': true },
    { 'name': 'SG Group', ...RULE_GROUP, 'filter': FILTER_SG, 'include-all': true, 'proxies': ['SG Auto Group'], 'hidden': !regionHasNodes(FILTER_SG), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': png('SG') },
    { 'name': 'SG Auto Group', ...RULE_GROUP_TEST, 'include-all': true, 'exclude-type': 'DIRECT', 'filter': FILTER_SG, 'hidden': true },
    { 'name': 'TW Group', ...RULE_GROUP, 'filter': FILTER_TW, 'include-all': true, 'proxies': ['TW Auto Group'], 'hidden': !regionHasNodes(FILTER_TW), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': png('TW') },
    { 'name': 'TW Auto Group', ...RULE_GROUP_TEST, 'include-all': true, 'exclude-type': 'DIRECT', 'filter': FILTER_TW, 'hidden': true },
    { 'name': 'KR Group', ...RULE_GROUP, 'filter': FILTER_KR, 'include-all': true, 'proxies': ['KR Auto Group'], 'hidden': !regionHasNodes(FILTER_KR), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': png('KR') },
    { 'name': 'KR Auto Group', ...RULE_GROUP_TEST, 'include-all': true, 'exclude-type': 'DIRECT', 'filter': FILTER_KR, 'hidden': true },
    { 'name': 'Other Group', ...RULE_GROUP, 'exclude-filter': EXCLUDE_FILTER, 'exclude-type': 'DIRECT', 'include-all': true, 'proxies': ['Other Auto Group'], ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': png('Global') },
    { 'name': 'Other Auto Group', ...RULE_GROUP_TEST, 'include-all': true, 'exclude-type': 'DIRECT', 'exclude-filter': EXCLUDE_FILTER, 'hidden': true },
  ];
};

// DNS
const overwriteDns = (config, ctx) => {
  const { nodeDomains } = ctx;

  // 公共 DNS 黑名单：订阅 nameserver 命中这些即视为公共 DNS 过滤
  const COMMON_DNS = ['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1', '9.9.9.9',
    '223.5.5.5', '223.6.6.6', '119.29.29.29', '114.114.114.114', '1.12.12.12',
    '180.76.76.76', 'dns.google', 'dns.cloudflare', 'cloudflare-dns', 'doh.pub',
    'alidns', 'dnspod', 'system'];

  const isCommonDns = (dns) => {
    const v = String(dns).trim().toLowerCase();
    return COMMON_DNS.some((k) => v.includes(k.toLowerCase()));
  };

  // 剥掉 DNS 的 # 后缀；含 direct/直连 时改为 #DIRECT
  const stripDnsSuffix = (dns) => {
    const str = String(dns);
    const i = str.indexOf('#');
    if (i === -1) return str;

    const prefix = str.slice(0, i).trim();
    const suffix = str.slice(i + 1).toLowerCase().trim();
    if (suffix.includes('direct') || suffix.includes('直连')) return prefix + '#DIRECT';
    return prefix;
  };

  // 为节点域名生成 DNS：走代理解析 + 跳过 fake-ip；
  // 解析回退顺序：hosts → 私有 nameserver → 8.8.8.8#PROXY
  const buildNodeDomainDns = (config, nodeDomains) => {
    if (nodeDomains.length === 0) return { proxyPolicy: {}, fakeIpFilter: [] };

    // ① hosts 已覆盖的域名，无需走 DNS
    const hosts = config['hosts'];
    const hostsMap = hosts && typeof hosts === 'object' ? hosts : {};
    const resolvable = new Set();
    for (const d of nodeDomains) {
      const v = hostsMap[d];
      if (typeof v === 'string' && v) resolvable.add(d);
      else if (Array.isArray(v) && v.length) resolvable.add(d);
    }

    // ② 私有 nameserver：剥 # 后缀 + 过滤公共 DNS，剩下的才算私有
    const dnsCfg = config['dns'] || {};
    const rawNameserver = dnsCfg['nameserver'];
    const privateNameserver = dedupe(
      Array.isArray(rawNameserver) ? rawNameserver : [],
      (d) => {
        const stripped = stripDnsSuffix(d);
        return stripped && !isCommonDns(stripped) ? stripped : null;
      },
    );
    const hasPrivateNameserver = privateNameserver.length > 0;

    // ③ 回退公共 DNS
    const FALLBACK_DNS = ['https://8.8.8.8/dns-query#PROXY'];

    const needPolicyDomains = nodeDomains.filter((d) => !resolvable.has(d));
    const policyDns = hasPrivateNameserver ? privateNameserver : FALLBACK_DNS;

    const proxyPolicy = {};
    for (const d of needPolicyDomains) {
      proxyPolicy[d] = policyDns;
    }

    // 节点域名全部跳过 fake-ip
    const fakeIpFilter = [...nodeDomains];

    return { proxyPolicy, fakeIpFilter };
  };

  const { proxyPolicy, fakeIpFilter } = buildNodeDomainDns(config, nodeDomains);

  config['dns'] = {
  'enable': true,
  'cache-algorithm': 'arc',
  'ipv6': false,
  'enhanced-mode': 'fake-ip',
  'fake-ip-ttl': 1,
  'fake-ip-range': '198.18.0.0/16',
  'fake-ip-filter-mode': 'blacklist',
  // 解析 DNS 服务器域名（需填 IP）
  'default-nameserver': [
    'https://223.5.5.5/dns-query',
  ],
  // 节点域名解析
  'proxy-server-nameserver': [
    'https://dns.alidns.com/dns-query',
    'https://doh.pub/dns-query',
  ],
  // 直连域名解析
  'direct-nameserver': [
    'https://dns.alidns.com/dns-query',
    'https://doh.pub/dns-query',
  ],
  
  'fallback-filter': {
    'geoip': true,
    'geoip-code': 'CN',
  },
  // 绕过 fake-ip
  'fake-ip-filter': [
    ...fakeIpFilter, // 动态：节点域名跳过 fake-ip
    'rule-set:fakeipfilter_cn',
    'rule-set:fakeipfilter_!cn',
    'rule-set:private',
    'rule-set:cn',
    'rule-set:microsoft_cn',
    'rule-set:apple_cn',
    'rule-set:games_cn',
  ],
  // 域名查询使用的 DNS
  'nameserver-policy': {
    ...proxyPolicy, // 动态：节点域名走代理 DNS
    'rule-set:cn,private,fakeipfilter_cn,games_cn,microsoft_cn,apple_cn': [
      'https://dns.alidns.com/dns-query#disable-qtype-65=true',
      'https://doh.pub/dns-query#disable-qtype-65=true',
    ],
    'rule-set:fakeipfilter_!cn': [
      'https://8.8.8.8/dns-query#PROXY&disable-qtype-65=true',
    ],
  },
  // 未匹配 nameserver-policy 的域名使用的 DNS
  'nameserver': [
    "https://8.8.8.8/dns-query#PROXY&ecs=120.76.0.0/14&ecs-override=true",
  ],
  // 非 CN IP 查询使用的 DNS
  'fallback': [
    'https://8.8.8.8/dns-query#PROXY',
  ],
  };
};

// 分流规则 (rules)
const overwriteRules = (config) => {
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
    ...(OPTIONS.BlockQUIC ? ['AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((OR,((RULE-SET,cn_additional),(RULE-SET,cn_ip,no-resolve)))))),REJECT'] : []),
    // 广告拦截
    ...(OPTIONS.AdBlock ? ['RULE-SET,adblockmihomolite,AdBlock'] : []),
    'AND,((NETWORK,UDP),(OR,((DST-PORT,3478-3481),(DST-PORT,5349),(DST-PORT,19302-19309)))),REJECT',
    // emby
    ...(OPTIONS.Emby ? [
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
    ] : []),
    // 代理规则
    ...(OPTIONS.AI ? ['RULE-SET,ai,AI'] : []),
    ...(OPTIONS.YouTube ? ['RULE-SET,youtube,YouTube'] : []),
    ...(OPTIONS.FCM ? ['RULE-SET,googlefcm,DIRECT'] : []),
    ...(OPTIONS.Google ? ['RULE-SET,google,Google', 'RULE-SET,google_ip,Google,no-resolve'] : []),
    ...(OPTIONS.GitHub ? ['RULE-SET,github,PROXY'] : []),
    ...(OPTIONS.Microsoft ? ['RULE-SET,microsoft,Microsoft'] : []),
    ...(OPTIONS.Apple ? ['RULE-SET,apple,Apple'] : []),
    ...(OPTIONS.Telegram ? ['RULE-SET,telegram,Telegram', 'RULE-SET,telegram_ip,Telegram,no-resolve'] : []),
    ...(OPTIONS.Steam ? ['RULE-SET,steam,Steam', 'RULE-SET,steam_ip,Steam,no-resolve'] : []),
    ...(OPTIONS.TikTok ? ['RULE-SET,tiktok,TikTok', 'RULE-SET,tiktok_ip,TikTok,no-resolve'] : []),
    ...(OPTIONS.Twitter ? ['RULE-SET,twitter,Twitter', 'RULE-SET,twitter_ip,Twitter,no-resolve'] : []),
    ...(OPTIONS.Instagram ? ['RULE-SET,instagram,Instagram'] : []),
    ...(OPTIONS.Netflix ? ['RULE-SET,netflix,Netflix', 'RULE-SET,netflix_ip,Netflix,no-resolve'] : []),
    ...(OPTIONS.PikPak ? ['RULE-SET,pikpak,PikPak'] : []),
    ...(OPTIONS.Spotify ? ['RULE-SET,spotify,Spotify', 'RULE-SET,spotify_ip,Spotify,no-resolve'] : []),
    ...(OPTIONS.Crypto ? ['RULE-SET,cryptocurrency,Crypto'] : []),
    ...(OPTIONS.EHentai ? ['RULE-SET,ehentai,EHentai'] : []),
    // 兜底规则
    'RULE-SET,geolocation-!cn,PROXY',
    'RULE-SET,cn_ip,DIRECT',
    'MATCH,PROXY',
  ];
};

// 入口：收集节点上下文后按区块依次覆写
const main = (config) => {
  config = config || {};
  const ctx = collectNodeSources(config);
  overwriteTun(config);
  overwriteSniffer(config);
  overwriteDns(config, ctx);
  overwriteRuleProviders(config);
  overwriteProxyGroups(config, ctx);
  overwriteRules(config);
  return config;
};
