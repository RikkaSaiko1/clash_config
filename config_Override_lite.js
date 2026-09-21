// ============================================================================
//  clash 覆写脚本 轻量 + 自定义 DNS (mihomo JS Override)
//  仓库 https://github.com/RikkaSaiko1/clash_config
//
//  ◆ 分流到策略组
//      分类        规则集                                策略组
//      ─────────────────────────────────────────────────────────────────────
//      油管        youtube                               YouTube
//      AI          ai                                    AI（默认 US Group）
//      国内直连    private / private_ip / geolocation-cn / games_cn /
//                  epicgames / nvidia_cn / apple_cn / microsoft_cn / cn_ip
//                  + fsend.cn / international-gfe.download.nvidia.com
//      广告拦截    adblockmihomolite                     REJECT
//      兜底        geolocation-!cn                      PROXY
// ============================================================================
const main = (config) => {
config['tun'] = {
  'enable': true,
  'stack': 'mixed',
  'dns-hijack': ['any:53', 'tcp://any:53'],
  'auto-route': true,
  'auto-redirect': true,
  'auto-detect-interface': true,
  'route-exclude-address-set': ['cn_ip'],
};

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

// ------------------------------------------------ DNS (防泄漏)
config['dns'] = {
  'enable': true,
  'cache-algorithm': 'arc',
  'ipv6': false,
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
  'nameserver': [
    'https://8.8.8.8/dns-query#PROXY&ecs=223.5.5.0/24',
  ],
  'fallback': [
    'https://8.8.8.8/dns-query#PROXY',
  ],
  'fallback-filter': {
    'geoip': true,
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
const RULE_BASE = { 'type': 'http', 'format': 'mrs', 'interval': 86400 };
const RULE_DOMAIN = { ...RULE_BASE, 'behavior': 'domain' };
const RULE_IPCIDR = { ...RULE_BASE, 'behavior': 'ipcidr' };
const RULE_FAKEIPFILTER = { 'type': 'http', 'format': 'text', 'interval': 86400, 'behavior': 'domain' };

const mrs_domain = (bundle, file = bundle) => ({
  ...RULE_DOMAIN,
  'url': `https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/${bundle}.mrs`,
  'path': `./ruleset/${file}.mrs`,
  'path-in-bundle': `geo/geosite/${bundle}.mrs`,
});

// appshubcc/bett-rules 的 geoip mrs
const mrs_ipcidr = (bundle, file) => ({
  ...RULE_IPCIDR,
  'url': `https://cdn.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/${bundle}.mrs`,
  'path': `./ruleset/${file}.mrs`,
  'path-in-bundle': `geo/geoip/${bundle}.mrs`,
});

config['rule-providers'] = {
  // --- 直连规则集 ---
  'private': mrs_domain('private'),
  'private_ip': mrs_ipcidr('private', 'private_ip'),
  'games_cn': mrs_domain('category-games@cn'),
  'epicgames': mrs_domain('epicgames'),
  'nvidia_cn': mrs_domain('nvidia@cn'),
  'apple_cn': mrs_domain('apple@cn'),
  'microsoft_cn': mrs_domain('microsoft@cn'),
  'geolocation-cn': mrs_domain('geolocation-cn'),
  'cn': mrs_domain('cn'),
  'cn_ip': mrs_ipcidr('cn', 'cn_ip'),

  // --- 应用规则集 ---
  'youtube': mrs_domain('youtube'),
  'googlefcm': mrs_domain('googlefcm'),
  'ai': mrs_domain('category-ai-!cn', 'ai'),

  // --- 其他规则集 ---
  'geolocation-!cn': mrs_domain('geolocation-!cn'),
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

  // --- Fake IP 过滤 ---
  'fakeipfilter_cn': {
    ...RULE_FAKEIPFILTER,
    'url': 'https://cdn.jsdelivr.net/gh/qichiyuhub/rule@main/rules/fakeipfilter-cn.list',
    'path': './ruleset/fakeipfilter-cn.list',
  },
  'fakeipfilter_!cn': {
    ...RULE_FAKEIPFILTER,
    'url': 'https://cdn.jsdelivr.net/gh/qichiyuhub/rule@main/rules/fakeipfilter-!cn.list',
    'path': './ruleset/fakeipfilter-!cn.list',
  },
};

// ------------------------------------------------ 策略组 (proxy-groups)
const GROUP_COMMON = {
  'timeout': 1500,
  'max-failed-times': 5,
  'empty-fallback': 'REJECT',
  'url': 'https://www.apple.com/library/test/success.html',
  'lazy': true,
};
const RULE_GROUP = { 'type': 'select', 'interval': 300, ...GROUP_COMMON };
const RULE_GROUP_TEST = {
  'type': 'url-test',
  'interval': 60,
  ...GROUP_COMMON,
  'tolerance': 50,
  'include-all': true,
  'exclude-type': 'DIRECT',
};

const PROXIES_DEFAULT = ['PROXY', 'AUTO', 'HK Group', 'SG Group', 'JP Group', 'US Group', 'TW Group', 'KR Group', 'Other Group'];
const PROXIES_DIRECT = [...PROXIES_DEFAULT, 'DIRECT'];
const PROXIES_AI = ['PROXY', 'SG Group', 'JP Group', 'US Group', 'KR Group'];
const PROXIES_PROXY = ['AUTO', 'HK Group', 'JP Group', 'US Group', 'SG Group', 'TW Group', 'KR Group', 'Other Group'];

const FILTER_HK = '(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong)';
const FILTER_JP = '(?i)(🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan)';
const FILTER_US = '(?i)(🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|圣地亚哥|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states)';
const FILTER_SG = '(?i)(🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore)';
const FILTER_TW = '(?i)(🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan)';
const FILTER_KR = '(?i)(🇰🇷|韩国|首尔|釜山|仁川|大邱|(?<![A-Za-z])KOR?(?![A-Za-z])|korea|south\\s*korea)';
const EXCLUDE_FILTER = `(?i)(${[FILTER_HK, FILTER_JP, FILTER_US, FILTER_SG, FILTER_TW, FILTER_KR]
  .map((pattern) => pattern.slice('(?i)('.length, -1))
  .join('|')})`;

const regionIcons = {
  'HK': 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/HK.png',
  'JP': 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/JP.png',
  'US': 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/US.png',
  'SG': 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/SG.png',
  'TW': 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/TW.png',
  'KR': 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/KR.png',
  'Other': 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/Global.png',
};

const svg = (name) =>
  `https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/${name}.svg`;

config['proxy-groups'] = [
  // ---------------------------------------- 基础策略组
  { 'name': 'PROXY', ...RULE_GROUP, 'proxies': PROXIES_PROXY, 'include-all-proxies': true, 'icon': 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/Static.png' },
  { 'name': 'AUTO', ...RULE_GROUP_TEST, 'hidden': false, 'icon': 'https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/Roundrobin.png' },
  // ---------------------------------------- 应用策略组
  { 'name': 'YouTube', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'icon': svg('youtube') },
  { 'name': 'AI', ...RULE_GROUP, 'proxies': PROXIES_AI, 'default-selected': 'US Group', 'icon': svg('deepseek') },
  // ---------------------------------------- 地区策略组
  { 'name': 'HK Group', ...RULE_GROUP, 'filter': FILTER_HK, 'include-all': true, 'proxies': ['HK Auto Group'], 'icon': regionIcons.HK },
  { 'name': 'HK Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_HK, 'hidden': true },
  { 'name': 'JP Group', ...RULE_GROUP, 'filter': FILTER_JP, 'include-all': true, 'proxies': ['JP Auto Group'], 'icon': regionIcons.JP },
  { 'name': 'JP Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_JP, 'hidden': true },
  { 'name': 'US Group', ...RULE_GROUP, 'filter': FILTER_US, 'include-all': true, 'proxies': ['US Auto Group'], 'icon': regionIcons.US },
  { 'name': 'US Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_US, 'hidden': true },
  { 'name': 'SG Group', ...RULE_GROUP, 'filter': FILTER_SG, 'include-all': true, 'proxies': ['SG Auto Group'], 'icon': regionIcons.SG },
  { 'name': 'SG Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_SG, 'hidden': true },
  { 'name': 'TW Group', ...RULE_GROUP, 'filter': FILTER_TW, 'include-all': true, 'proxies': ['TW Auto Group'], 'icon': regionIcons.TW },
  { 'name': 'TW Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_TW, 'hidden': true },
  { 'name': 'KR Group', ...RULE_GROUP, 'filter': FILTER_KR, 'include-all': true, 'proxies': ['KR Auto Group'], 'icon': regionIcons.KR },
  { 'name': 'KR Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_KR, 'hidden': true },
  // ---------------------------------------- 其他地区
  { 'name': 'Other Group', ...RULE_GROUP, 'exclude-filter': EXCLUDE_FILTER, 'exclude-type': 'DIRECT', 'include-all': true, 'proxies': ['Other Auto Group'], 'icon': regionIcons.Other },
  { 'name': 'Other Auto Group', ...RULE_GROUP_TEST, 'exclude-filter': EXCLUDE_FILTER, 'hidden': true },
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
  'RULE-SET,ai,AI',
  'RULE-SET,geolocation-!cn,PROXY',
  'RULE-SET,cn_ip,DIRECT',
  'MATCH,PROXY',
];
  return config;
}