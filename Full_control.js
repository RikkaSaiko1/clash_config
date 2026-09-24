//  ============================================================================
//  clash 覆写脚本 全规则 + 自定义 DNS
//  对应配置：Full_control.yaml
//  仓库：https://github.com/RikkaSaiko1/clash_config
// 
//  ◆ 分流到策略组
//      分类        规则集                                          策略组
//      ────────────────────────────────────────────────────────────────────────
//      AI          ai                                          AI（默认 US Group）
//      油管        youtube                                     YouTube
//      谷歌        google / google_ip                          Google
//      微软        microsoft                                   Microsoft
//      苹果        apple                                       Apple
//      电报        telegram / telegram_ip                      Telegram
//      游戏平台    steam / steam_ip                            Steam
//      短视频      tiktok / tiktok_ip                          TikTok（默认 JP Group）
//      推特        twitter / twitter_ip                        Twitter
//      图享        instagram                                   Instagram
//      奈飞        netflix / netflix_ip                        Netflix
//      影音        emby / emos + Emby 相关域名与 9 条进程名     Emby
//      网盘        pikpak                                      PikPak
//      音乐        spotify / spotify_ip                        Spotify
//      加密货币    cryptocurrency                              Crypto（默认 JP Group）
//      图站        ehentai                                     EHentai（默认 US Group）
//      直播        twitch                                      Twitch
//      插画        pixiv                                       Pixiv（默认 JP Group）
//      通讯        line                                        Line
//      语音        discord                                     Discord
//      代码托管    github                                      PROXY
//  ============================================================================

const main = (config) => {
    // ------------------------------------------------ TUN
    config['tun'] = {
    'enable': true,
    'stack': 'mixed',
    'dns-hijack': ['any:53', 'tcp://any:53'],
    'auto-route': true,
    'auto-redirect': true,
    'auto-detect-interface': true,
    'route-exclude-address-set': ['cn_ip'],
  };

  // ------------------------------------------------ 流量嗅探
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

// ------------------------------------------------ DNS
config['dns'] = {
  'enable': true,
  'cache-algorithm': 'arc',
  'ipv6': false,
  'enhanced-mode': 'fake-ip',
  'fake-ip-ttl': 1,
  'fake-ip-range': '198.18.0.0/16',
  'fake-ip-filter-mode': 'blacklist',
  // 解析 "DNS 服务器域名" 的 DNS，需要填 IP 地址
  'default-nameserver': [
    'https://223.5.5.5/dns-query',
  ],
  // 用于节点域名解析的 DNS服务器
  'proxy-server-nameserver': [
    'https://dns.alidns.com/dns-query',
    'https://doh.pub/dns-query',
  ],
  // 用于直连域名解析的 DNS服务器
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
    'rule-set:fakeipfilter_cn',
    'rule-set:fakeipfilter_!cn',
    'rule-set:private',
    'rule-set:cn',
    'rule-set:microsoft_cn',
    'rule-set:apple_cn',
    'rule-set:games_cn',
  ],
  //  配置查询域名使用的 DNS 
  'nameserver-policy': {
    'rule-set:cn,private,fakeipfilter_cn,games_cn,microsoft_cn,apple_cn': [
      'https://dns.alidns.com/dns-query#disable-qtype-65=true',
      'https://doh.pub/dns-query#disable-qtype-65=true',
    ],
    'rule-set:fakeipfilter_!cn': [
      'https://8.8.8.8/dns-query#PROXY&disable-qtype-65=true',
    ],
  },
  // 查询未配置 nameserver-policy 或者 nameserver-policy 中未匹配到的域名时使用的 DNS
  'nameserver': [
    "https://8.8.8.8/dns-query#PROXY&ecs=120.76.0.0/14&ecs-override=true",
  ],
  // 非CN IP 查询时使用的 DNS
  'fallback': [
    'https://8.8.8.8/dns-query#PROXY',
  ],
};

  // ------------------------------------------------ 规则集 (rule-providers)
  const RULE_BASE = { 'type': 'http', 'interval': 86400 };
  const RULE_DOMAIN = { ...RULE_BASE, 'format': 'mrs', 'behavior': 'domain' };
  const RULE_IPCIDR = { ...RULE_BASE, 'format': 'mrs', 'behavior': 'ipcidr' };
  const RULE_FAKEIP = { ...RULE_BASE, 'format': 'text', 'behavior': 'domain' };

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
    'twitch': mrs_domain('twitch'),
    'pixiv': mrs_domain('pixiv'),
    'line': mrs_domain('line'),
    'discord': mrs_domain('discord'),
    'geolocation-!cn': mrs_domain('geolocation-!cn', 'geolocation-!cn'),
    'fakeip_filter': mrs_domain('fakeip-filter'),

    'adblockmihomolite': {
      ...RULE_DOMAIN,
      'url': 'https://cdn.jsdelivr.net/gh/217heidai/adblockfilters@main/rules/adblockmihomolite.mrs',
      'path': './ruleset/adblockmihomolite.mrs',
      'path-in-bundle': 'geo/geosite/category-ads-all.mrs',
    },
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
    'cn_additional': {
      ...RULE_DOMAIN,
      'url': 'https://static-file-global.353355.xyz/rules/cn-additional-list.mrs',
      'path': './ruleset/cn-additional-list.mrs',
      'path-in-bundle': 'geo/geosite/cn.mrs',
    },
    'fakeipfilter_cn': {
      ...RULE_FAKEIP,
      'url': 'https://cdn.jsdelivr.net/gh/qichiyuhub/rule@main/rules/fakeipfilter-cn.list',
      'path': './ruleset/fakeipfilter-cn.list',
    },
    'fakeipfilter_!cn': {
      ...RULE_FAKEIP,
      'url': 'https://cdn.jsdelivr.net/gh/qichiyuhub/rule@main/rules/fakeipfilter-!cn.list',
      'path': './ruleset/fakeipfilter-!cn.list',
    },
  };


  // ------------------------------------------------ 策略组 (proxy-groups)
  const GROUP_COMMON = {'timeout': 1500,'max-failed-times': 5,'empty-fallback': 'REJECT','url': 'https://www.apple.com/library/test/success.html','lazy': true,};
  const RULE_GROUP = { 'type': 'select', 'interval': 300, ...GROUP_COMMON };
  const RULE_GROUP_TEST = {'type': 'url-test','interval': 60,...GROUP_COMMON,'tolerance': 50,'include-all': true,'exclude-type': 'DIRECT',};
  const PROXIES_DEFAULT = ['PROXY','AUTO','HK Group','SG Group','JP Group','US Group','TW Group','KR Group','Other Group',];
  const PROXIES_DIRECT = [...PROXIES_DEFAULT, 'DIRECT'];
  const PROXIES_PROXY = ['AUTO','HK Group','JP Group','US Group','SG Group','TW Group','KR Group','Other Group',];
  const PROXIES_AI = ['PROXY', 'SG Group', 'JP Group', 'US Group', 'KR Group'];
  const PROXIES_REJECT = ['REJECT', 'REJECT-DROP', 'PASS'];

  const svg = (name) =>
    `https://cdn.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/${name}.svg`;
  const png = (name) =>
    `https://cdn.jsdelivr.net/gh/Orz-3/mini@master/Color/${name}.png`;


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
    // ---------------------------------------- 基础策略组
    { 'name': 'PROXY', ...RULE_GROUP, 'proxies': PROXIES_PROXY, 'include-all-proxies': true, 'icon': png('Static') },
    { 'name': 'AUTO', ...RULE_GROUP_TEST, 'hidden': false, 'icon': png('Urltest') },
    // ---------------------------------------- 应用策略组
    { 'name': 'YouTube', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'icon': svg('youtube') },
    { 'name': 'Google', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'icon': svg('google') },
    { 'name': 'AI', ...RULE_GROUP, 'proxies': PROXIES_AI, 'default-selected': 'US Group', 'icon': svg('deepseek') },
    { 'name': 'Microsoft', ...RULE_GROUP, 'proxies': PROXIES_DIRECT, 'icon': svg('microsoft') },
    { 'name': 'Apple', ...RULE_GROUP, 'proxies': PROXIES_DIRECT, 'icon': svg('apple') },
    { 'name': 'Telegram', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'icon': svg('telegram') },
    { 'name': 'Steam', ...RULE_GROUP, 'proxies': PROXIES_DIRECT, 'icon': svg('steam') },
    { 'name': 'TikTok', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'default-selected': 'JP Group', 'icon': svg('tiktok') },
    { 'name': 'Twitter', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'icon': svg('twitter') },
    { 'name': 'Instagram', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'icon': svg('instagram') },
    { 'name': 'Netflix', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'icon': svg('netflix') },
    { 'name': 'Emby', ...RULE_GROUP, 'proxies': PROXIES_DIRECT, 'icon': svg('emby') },
    { 'name': 'PikPak', ...RULE_GROUP, 'proxies': PROXIES_DIRECT, 'icon': svg('pikpak') },
    { 'name': 'Spotify', ...RULE_GROUP, 'proxies': PROXIES_DIRECT, 'icon': svg('spotify') },
    { 'name': 'Crypto', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'default-selected': 'JP Group', 'icon': svg('Crypto') },
    { 'name': 'EHentai', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'default-selected': 'US Group', 'icon': svg('EHentai') },
    { 'name': 'Twitch', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'icon': svg('twitch') },
    { 'name': 'Pixiv', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'default-selected': 'JP Group', 'icon': svg('pixiv') },
    { 'name': 'Line', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'icon': svg('line') },
    { 'name': 'Discord', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'icon': svg('discord') },
    { 'name': 'AdBlock', ...RULE_GROUP, 'proxies': PROXIES_REJECT, 'icon': png('Adblock') },
    // ---------------------------------------- 地区策略组
    { 'name': 'HK Group', ...RULE_GROUP, 'filter': FILTER_HK, 'include-all': true, 'proxies': ['HK Auto Group'], 'icon': png('HK') },
    { 'name': 'HK Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_HK, 'hidden': true },
    { 'name': 'JP Group', ...RULE_GROUP, 'filter': FILTER_JP, 'include-all': true, 'proxies': ['JP Auto Group'], 'icon': png('JP') },
    { 'name': 'JP Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_JP, 'hidden': true },
    { 'name': 'US Group', ...RULE_GROUP, 'filter': FILTER_US, 'include-all': true, 'proxies': ['US Auto Group'], 'icon': png('US') },
    { 'name': 'US Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_US, 'hidden': true },
    { 'name': 'SG Group', ...RULE_GROUP, 'filter': FILTER_SG, 'include-all': true, 'proxies': ['SG Auto Group'], 'icon': png('SG') },
    { 'name': 'SG Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_SG, 'hidden': true },
    { 'name': 'TW Group', ...RULE_GROUP, 'filter': FILTER_TW, 'include-all': true, 'proxies': ['TW Auto Group'], 'icon': png('TW') },
    { 'name': 'TW Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_TW, 'hidden': true },
    { 'name': 'KR Group', ...RULE_GROUP, 'filter': FILTER_KR, 'include-all': true, 'proxies': ['KR Auto Group'], 'icon': png('KR') },
    { 'name': 'KR Auto Group', ...RULE_GROUP_TEST, 'filter': FILTER_KR, 'hidden': true },
    // ---------------------------------------- 其他地区
    { 'name': 'Other Group', ...RULE_GROUP, 'exclude-filter': EXCLUDE_FILTER, 'exclude-type': 'DIRECT', 'include-all': true, 'proxies': ['Other Auto Group'], 'icon': png('Global') },
    { 'name': 'Other Auto Group', ...RULE_GROUP_TEST, 'exclude-filter': EXCLUDE_FILTER, 'hidden': true },
  ];

  // ------------------------------------------------ 路由规则 (rules)
  config.rules = [
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

    // 广告拦截 | 拦截 STUN/TURN 协议的 UDP 流量
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
    'RULE-SET,twitch,Twitch',
    'RULE-SET,pixiv,Pixiv',
    'RULE-SET,line,Line',
    'RULE-SET,discord,Discord',

    // 兜底规则
    'RULE-SET,geolocation-!cn,PROXY',
    'RULE-SET,cn_ip,DIRECT',
    'MATCH,PROXY',
  ];

  return config;
}