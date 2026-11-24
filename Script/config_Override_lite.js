// ============================================================================
// clash 覆写脚本 · 轻量 (mihomo JS Override)
// 仓库 https://github.com/RikkaSaiko1/clash_config
// ============================================================================

// ============================================================================
// Bettbox 适配（Bettbox v1.18.8+）
//   ruleOptionsEnable  : 开关对象，Bettbox 读它生成可视化开关
//   policyGroupOptions : 声明哪些开关属于「策略组」，其余归入「其他设置」
//   serviceConfigs     : 开关在 UI 上显示的图标
// ============================================================================
const Compatible_With_Bettbox = { ruleOptionsEnable: true };

/**
 * 自定义配置选项
 * true = 启用 / false = 禁用（关闭后对应分组与规则不写入产物）
 */
const ruleOptionsEnable = {
  // 分流策略组开关
  YouTube: true,        // YouTube
  AI: true,             // 国外 AI
  // 其他功能开关
  AdBlock: true,        // 广告拦截
  BlockQUIC: true,      // 屏蔽国外 QUIC
  BlockSTUN: true,      // 拦截 STUN/TURN
};

// 声明属于策略组的开关，需与 ruleOptionsEnable 的键完全一致
Compatible_With_Bettbox.policyGroupOptions = ['YouTube', 'AI'];

// 开关在 Bettbox 开关列表里显示的图标
const serviceConfigs = [
  { name: 'YouTube', icon: 'https://fastly.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/youtube.svg' },
  { name: 'AI', icon: 'https://fastly.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/deepseek.svg' },
];

// 按需在此添加静态节点；名称需唯一
const CUSTOM_PROXIES = [
  // { name: 'JP 手动节点', type: 'socks5', server: '1.2.3.4', port: 1080, username: '用户名', password: '密码' },
];
// 可粘贴 Mihomo 分享链接或 WireGuard .conf；完整节点对象可放入上方数组
const CUSTOM_PROXY_URLS = [
  // 'vless://uuid@example.com:443?security=tls&type=xhttp&host=example.com&path=%2Fpath&mode=auto#节点名称',
];
const CUSTOM_ECH_DNS_SERVERS = new Map();

const getCustomProxies = () => {
  const proxies = [...CUSTOM_PROXIES, ...CUSTOM_PROXY_URLS.map(parseProxyUri)];
  const names = new Set();
  for (const proxy of proxies) {
    if (!proxy || typeof proxy.name !== 'string' || !proxy.name.trim()) {
      throw new Error('每个手动节点都必须设置非空名称。');
    }
    if (names.has(proxy.name)) throw new Error(`手动节点名称重复：${proxy.name}`);
    names.add(proxy.name);
  }
  return proxies;
};

const decodeUriValue = (value, formEncoded) => {
  try {
    return decodeURIComponent(formEncoded ? value.replace(/\+/g, ' ') : value);
  } catch {
    throw new Error('分享链接包含无效的 URL 编码。');
  }
};

const decodeBase64 = (value) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const input = value.replace(/-/g, '+').replace(/_/g, '/').replace(/\s|=/g, '');
  if (!input || input.length % 4 === 1 || /[^A-Za-z0-9+/]/.test(input)) {
    throw new Error('分享链接包含无效的 Base64 数据。');
  }
  const bytes = [];
  let buffer = 0;
  let bits = 0;
  for (const char of input) {
    buffer = (buffer << 6) | alphabet.indexOf(char);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 255);
    }
  }
  try {
    return decodeURIComponent(bytes.map((byte) => `%${byte.toString(16).padStart(2, '0')}`).join(''));
  } catch {
    throw new Error('分享链接包含无法解码的 Base64 文本。');
  }
};

const parseProxyUriParts = (uri) => {
  const match = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]+)\/?(?:\?([^#]*))?(?:#(.*))?$/i.exec(uri.trim());
  if (!match) throw new Error('手动节点链接格式无效。');
  const params = new Map();
  for (const pair of (match[3] || '').split('&')) {
    if (!pair) continue;
    const separator = pair.indexOf('=');
    const key = decodeUriValue(separator < 0 ? pair : pair.slice(0, separator), true);
    if (!params.has(key)) {
      params.set(key, decodeUriValue(separator < 0 ? '' : pair.slice(separator + 1), true));
    }
  }
  const atIndex = match[2].lastIndexOf('@');
  const userInfo = atIndex >= 0 ? decodeUriValue(match[2].slice(0, atIndex)) : '';
  const address = match[2].slice(atIndex + 1);
  let server;
  let portText;
  if (address.startsWith('[')) {
    const closingBracket = address.indexOf(']');
    if (closingBracket < 0 || address[closingBracket + 1] !== ':') {
      throw new Error('分享链接中的 IPv6 地址或端口无效。');
    }
    server = address.slice(1, closingBracket);
    portText = address.slice(closingBracket + 2);
  } else {
    const separator = address.lastIndexOf(':');
    if (separator < 1) throw new Error('分享链接缺少服务器端口。');
    server = address.slice(0, separator);
    portText = address.slice(separator + 1);
  }
  const port = Number(portText);
  if (!server || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('分享链接必须包含有效的服务器地址和端口。');
  }
  const name = match[4] ? decodeUriValue(match[4]) : `${server}:${port}`;
  const credentials = userInfo.indexOf(':');
  return {
    scheme: match[1].toLowerCase(),
    server,
    port,
    name,
    user: credentials < 0 ? userInfo : userInfo.slice(0, credentials),
    password: credentials < 0 ? '' : userInfo.slice(credentials + 1),
    params,
  };
};

const uriBoolean = (value) => /^(1|true|yes)$/i.test(String(value || ''));

const applyTlsUriOptions = (proxy, params, defaultTls) => {
  if (defaultTls || params.has('security') && ['tls', 'reality'].includes(params.get('security').toLowerCase())) {
    proxy.tls = true;
  }
  const sni = params.get('sni') || params.get('servername') || params.get('peer');
  if (sni) {
    if (proxy.type === 'hysteria' || proxy.type === 'hysteria2' || proxy.type === 'tuic' || proxy.type === 'anytls') proxy.sni = sni;
    else proxy.servername = sni;
  }
  const fingerprint = params.get('fp') || params.get('client-fingerprint');
  if (fingerprint) proxy['client-fingerprint'] = fingerprint;
  const alpn = params.get('alpn');
  if (alpn) proxy.alpn = alpn.split(',').filter(Boolean);
  const insecure = params.get('insecure') || params.get('allowInsecure') || params.get('allow_insecure');
  if (insecure !== null) proxy['skip-cert-verify'] = uriBoolean(insecure);
  if (params.get('security') === 'reality' || params.has('pbk')) {
    proxy.tls = true;
    const realityOptions = {};
    if (params.has('pbk')) realityOptions['public-key'] = params.get('pbk');
    if (params.has('sid')) realityOptions['short-id'] = params.get('sid');
    if (Object.keys(realityOptions).length > 0) proxy['reality-opts'] = realityOptions;
  }
};

const applyV2rayTransport = (proxy, network, params) => {
  if (!network || network === 'tcp') return;
  if (network === 'ws' || network === 'httpupgrade') {
    proxy.network = 'ws';
    const options = { path: params.get('path') || '/', headers: {} };
    if (params.has('host')) options.headers.Host = params.get('host');
    if (network === 'httpupgrade') options['v2ray-http-upgrade'] = true;
    proxy['ws-opts'] = options;
  } else if (network === 'grpc') {
    proxy.network = 'grpc';
    proxy['grpc-opts'] = { 'grpc-service-name': params.get('serviceName') || '' };
  } else if (network === 'h2' || network === 'http') {
    proxy.network = 'h2';
    proxy['h2-opts'] = {
      path: params.get('path') || '/',
      ...(params.has('host') ? { host: params.get('host').split(',') } : {}),
    };
  } else if (network === 'xhttp') {
    proxy.network = 'xhttp';
    proxy['xhttp-opts'] = {
      ...(params.has('host') ? { host: params.get('host') } : {}),
      ...(params.has('path') ? { path: params.get('path') } : {}),
      ...(params.has('mode') ? { mode: params.get('mode') } : {}),
    };
  } else {
    throw new Error(`暂不支持 VLESS/VMess 传输类型：${network}`);
  }
};

const parseWireGuardConfig = (text) => {
  const interfaceOptions = {};
  const peerOptions = {};
  let section = '';
  let peerCount = 0;
  for (const line of text.split(/\r?\n/)) {
    const value = line.trim();
    if (!value || value.startsWith('#') || value.startsWith(';')) continue;
    const sectionMatch = /^\[([^\]]+)\]$/.exec(value);
    if (sectionMatch) {
      section = sectionMatch[1].toLowerCase();
      if (section === 'peer') peerCount += 1;
      continue;
    }
    const separator = value.indexOf('=');
    if (separator < 1) continue;
    const key = value.slice(0, separator).trim().toLowerCase();
    const fieldValue = value.slice(separator + 1).trim();
    const options = section === 'interface' ? interfaceOptions : section === 'peer' ? peerOptions : null;
    if (options && fieldValue) {
      options[key] = options[key] ? `${options[key]},${fieldValue}` : fieldValue;
    }
  }
  if (peerCount !== 1) throw new Error('WireGuard 配置必须且只能包含一个 [Peer]。');
  if (!interfaceOptions.privatekey || !interfaceOptions.address || !peerOptions.publickey || !peerOptions.endpoint) {
    throw new Error('WireGuard 配置缺少 PrivateKey、Address、PublicKey 或 Endpoint。');
  }
  if (!peerOptions.allowedips) throw new Error('WireGuard 配置缺少 Peer 的 AllowedIPs。');

  const endpoint = parseProxyUriParts(`wireguard://${peerOptions.endpoint}`);
  const addresses = interfaceOptions.address.split(',').map((address) => address.trim()).filter(Boolean);
  const ipv4 = addresses.find((address) => !address.includes(':'));
  const ipv6 = addresses.find((address) => address.includes(':'));
  if (!ipv4 && !ipv6) throw new Error('WireGuard 配置中的 Address 无效。');
  const proxy = {
    name: endpoint.name,
    type: 'wireguard',
    server: endpoint.server,
    port: endpoint.port,
    'private-key': interfaceOptions.privatekey,
    'public-key': peerOptions.publickey,
    'allowed-ips': peerOptions.allowedips.split(',').map((address) => address.trim()).filter(Boolean),
    udp: true,
  };
  if (ipv4) proxy.ip = ipv4.split('/')[0];
  if (ipv6) proxy.ipv6 = ipv6.split('/')[0];
  if (peerOptions.presharedkey) proxy['pre-shared-key'] = peerOptions.presharedkey;
  if (interfaceOptions.dns) {
    proxy.dns = interfaceOptions.dns.split(',').map((address) => address.trim()).filter(Boolean);
    proxy['remote-dns-resolve'] = true;
  }
  if (peerOptions.persistentkeepalive) {
    const keepalive = Number(peerOptions.persistentkeepalive);
    if (!Number.isInteger(keepalive) || keepalive < 0) throw new Error('WireGuard PersistentKeepalive 必须是非负整数。');
    proxy['persistent-keepalive'] = keepalive;
  }
  if (interfaceOptions.mtu) {
    const mtu = Number(interfaceOptions.mtu);
    if (!Number.isInteger(mtu) || mtu < 1) throw new Error('WireGuard MTU 必须是正整数。');
    proxy.mtu = mtu;
  }
  return proxy;
};

const parseProxyUri = (uri) => {
  const value = uri.trim();
  if (/^\[Interface\]\s*$/im.test(value)) return parseWireGuardConfig(value);
  const schemeMatch = /^([a-z][a-z0-9+.-]*):\/\//i.exec(value);
  if (!schemeMatch) throw new Error('手动节点链接必须包含协议 scheme。');
  const scheme = schemeMatch[1].toLowerCase();
  if (scheme === 'vless') return parseVlessUri(uri);
  if (scheme === 'vmess') {
    const value = uri.trim().slice(schemeMatch[0].length).split('#')[0].replace(/\/$/, '');
    let data;
    try {
      data = JSON.parse(decodeBase64(value));
    } catch (error) {
      throw new Error(`VMess 分享链接无法解析：${error.message}`);
    }
    const server = data.add || data.server;
    const port = Number(data.port);
    const uuid = data.id || data.uuid;
    if (!server || !uuid || !Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('VMess 分享链接缺少有效的服务器、端口或 UUID。');
    }
    const fragment = uri.trim().split('#').slice(1).join('#');
    const proxy = {
      name: fragment ? decodeUriValue(fragment) : (data.ps || `${server}:${port}`),
      type: 'vmess',
      server,
      port,
      uuid,
      alterId: Number(data.aid || data.alterId || 0),
      cipher: data.scy || data.cipher || 'auto',
      udp: true,
    };
    const tls = data.tls === true || data.tls === 'tls' || data.tls === 'true';
    const params = new Map();
    for (const [key, value] of Object.entries({
      sni: data.sni,
      fp: data.fp,
      alpn: data.alpn,
      host: data.host,
      path: data.path,
    })) {
      if (value !== undefined && value !== '') params.set(key, String(value));
    }
    applyTlsUriOptions(proxy, params, tls);
    applyV2rayTransport(proxy, (data.net || data.network || 'tcp').toLowerCase(), params);
    return proxy;
  }

  if (scheme === 'ssr') {
    let payload;
    try {
      payload = decodeBase64(uri.trim().slice(schemeMatch[0].length));
    } catch (error) {
      throw new Error(`ShadowsocksR 分享链接无法解析：${error.message}`);
    }
    const [main, queryString = ''] = payload.split('/?');
    const fields = main.split(':');
    if (fields.length < 6) throw new Error('ShadowsocksR 分享链接格式不完整。');
    const details = new Map();
    for (const pair of queryString.split('&')) {
      if (!pair) continue;
      const separator = pair.indexOf('=');
      const key = decodeUriValue(separator < 0 ? pair : pair.slice(0, separator), false);
      const value = decodeUriValue(separator < 0 ? '' : pair.slice(separator + 1), false);
      details.set(key, value);
    }
    const decodeField = (key) => details.has(key) ? decodeBase64(details.get(key)) : '';
    const port = Number(fields[1]);
    if (!fields[0] || !Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('ShadowsocksR 分享链接中的服务器地址或端口无效。');
    }
    return {
      name: decodeField('remarks') || `${fields[0]}:${port}`,
      type: 'ssr',
      server: fields[0],
      port,
      protocol: fields[2],
      cipher: fields[3],
      obfs: fields[4],
      password: decodeBase64(fields.slice(5).join(':')),
      ...(decodeField('protoparam') ? { 'protocol-param': decodeField('protoparam') } : {}),
      ...(decodeField('obfsparam') ? { 'obfs-param': decodeField('obfsparam') } : {}),
      udp: true,
    };
  }

  if (scheme === 'ss') {
    let parts;
    try {
      parts = parseProxyUriParts(uri);
    } catch {
      const payload = uri.trim().slice(schemeMatch[0].length).split('#')[0].replace(/\/$/, '');
      parts = parseProxyUriParts(`ss://${decodeBase64(payload)}${uri.includes('#') ? `#${uri.split('#').slice(1).join('#')}` : ''}`);
    }
    let userInfo = parts.password ? `${parts.user}:${parts.password}` : parts.user;
    if (!userInfo.includes(':')) userInfo = decodeBase64(userInfo);
    const separator = userInfo.indexOf(':');
    if (separator < 1) throw new Error('Shadowsocks 分享链接缺少加密方式或密码。');
    const proxy = {
      name: parts.name,
      type: 'ss',
      server: parts.server,
      port: parts.port,
      cipher: userInfo.slice(0, separator),
      password: userInfo.slice(separator + 1),
      udp: true,
    };
    const plugin = parts.params.get('plugin');
    if (plugin) {
      const [pluginName, ...pluginParameters] = plugin.split(';');
      const pluginOptions = {};
      for (const parameter of pluginParameters) {
        const [key, value = ''] = parameter.split('=');
        pluginOptions[key] = value;
      }
      proxy.plugin = pluginName === 'obfs-local' ? 'obfs' : pluginName;
      if (pluginName === 'obfs-local') {
        proxy['plugin-opts'] = { mode: pluginOptions.obfs || 'http', host: pluginOptions['obfs-host'] || '' };
      } else {
        proxy['plugin-opts'] = pluginOptions;
      }
    }
    return proxy;
  }

  const parts = parseProxyUriParts(uri);
  const params = parts.params;
  if (scheme === 'trojan') {
    if (!parts.user) throw new Error('Trojan 分享链接缺少密码。');
    const proxy = { name: parts.name, type: 'trojan', server: parts.server, port: parts.port, password: parts.user, udp: true };
    applyTlsUriOptions(proxy, params, true);
    applyV2rayTransport(proxy, params.get('type') || 'tcp', params);
    return proxy;
  }
  if (scheme === 'socks' || scheme === 'socks5' || scheme === 'socks5h') {
    const proxy = { name: parts.name, type: 'socks5', server: parts.server, port: parts.port, udp: uriBoolean(params.get('udp')) };
    if (parts.user) proxy.username = parts.user;
    if (parts.password) proxy.password = parts.password;
    return proxy;
  }
  if (scheme === 'http' || scheme === 'https') {
    const proxy = { name: parts.name, type: 'http', server: parts.server, port: parts.port };
    if (parts.user) proxy.username = parts.user;
    if (parts.password) proxy.password = parts.password;
    applyTlsUriOptions(proxy, params, scheme === 'https');
    return proxy;
  }
  if (scheme === 'hysteria2' || scheme === 'hy2') {
    if (!parts.user) throw new Error('Hysteria2 分享链接缺少密码。');
    const proxy = { name: parts.name, type: 'hysteria2', server: parts.server, port: parts.port, password: parts.user, udp: true };
    applyTlsUriOptions(proxy, params, true);
    for (const [source, target] of [['obfs', 'obfs'], ['obfs-password', 'obfs-password'], ['up', 'up'], ['down', 'down'], ['ports', 'ports'], ['hop-interval', 'hop-interval']]) {
      if (params.has(source)) proxy[target] = params.get(source);
    }
    return proxy;
  }
  if (scheme === 'tuic') {
    const credentials = parts.password ? `${parts.user}:${parts.password}` : parts.user;
    const separator = credentials.indexOf(':');
    if (separator < 1) throw new Error('TUIC 分享链接需要 UUID 和密码。');
    const proxy = {
      name: parts.name,
      type: 'tuic',
      server: parts.server,
      port: parts.port,
      uuid: credentials.slice(0, separator),
      password: credentials.slice(separator + 1),
      udp: true,
    };
    applyTlsUriOptions(proxy, params, true);
    for (const [source, target] of [['congestion_control', 'congestion-controller'], ['udp_relay_mode', 'udp-relay-mode'], ['heartbeat', 'heartbeat-interval']]) {
      if (params.has(source)) proxy[target] = params.get(source);
    }
    if (params.has('reduce_rtt')) proxy['reduce-rtt'] = uriBoolean(params.get('reduce_rtt'));
    return proxy;
  }
  if (scheme === 'anytls') {
    if (!parts.user) throw new Error('AnyTLS 分享链接缺少密码。');
    const proxy = { name: parts.name, type: 'anytls', server: parts.server, port: parts.port, password: parts.user, udp: true };
    applyTlsUriOptions(proxy, params, true);
    for (const key of ['idle-session-check-interval', 'idle-session-timeout', 'min-idle-session']) {
      if (params.has(key)) proxy[key] = Number(params.get(key));
    }
    return proxy;
  }
  if (scheme === 'hysteria') {
    const proxy = { name: parts.name, type: 'hysteria', server: parts.server, port: parts.port, udp: true };
    const auth = params.get('auth') || params.get('auth_str') || parts.user;
    if (auth) proxy['auth-str'] = auth;
    applyTlsUriOptions(proxy, params, true);
    for (const [source, target] of [['protocol', 'protocol'], ['obfs', 'obfs'], ['up', 'up'], ['down', 'down'], ['ports', 'ports'], ['hop-interval', 'hop-interval']]) {
      if (params.has(source)) proxy[target] = params.get(source);
    }
    return proxy;
  }
  if (scheme === 'snell') {
    const proxy = { name: parts.name, type: 'snell', server: parts.server, port: parts.port, psk: params.get('psk') || parts.user };
    if (params.has('version')) proxy.version = Number(params.get('version'));
    if (params.has('obfs')) proxy['obfs-opts'] = { mode: params.get('obfs'), host: params.get('obfs-host') || '' };
    return proxy;
  }
  if (scheme === 'ssh') {
    const proxy = { name: parts.name, type: 'ssh', server: parts.server, port: parts.port, username: parts.user };
    if (parts.password) proxy.password = parts.password;
    for (const [source, target] of [['private-key', 'private-key'], ['private-key-passphrase', 'private-key-passphrase'], ['host-key', 'host-key'], ['client-version', 'client-version']]) {
      if (params.has(source)) proxy[target] = params.get(source);
    }
    return proxy;
  }
  if (scheme === 'wireguard' || scheme === 'wg') {
    const proxy = { name: parts.name, type: 'wireguard', server: parts.server, port: parts.port, 'private-key': parts.user, udp: true };
    if (params.has('publickey')) proxy['public-key'] = params.get('publickey');
    if (params.has('public-key')) proxy['public-key'] = params.get('public-key');
    if (params.has('presharedkey')) proxy['pre-shared-key'] = params.get('presharedkey');
    if (params.has('pre-shared-key')) proxy['pre-shared-key'] = params.get('pre-shared-key');
    const addresses = (params.get('address') || params.get('ip') || '').split(',').filter(Boolean);
    const ipv4 = addresses.find((address) => !address.includes(':'));
    const ipv6 = addresses.find((address) => address.includes(':'));
    if (ipv4) proxy.ip = ipv4.split('/')[0];
    if (ipv6) proxy.ipv6 = ipv6.split('/')[0];
    if (params.has('allowedips')) proxy['allowed-ips'] = params.get('allowedips').split(',').map((address) => address.trim()).filter(Boolean);
    if (params.has('allowed-ips')) proxy['allowed-ips'] = params.get('allowed-ips').split(',').map((address) => address.trim()).filter(Boolean);
    if (params.has('dns')) {
      proxy.dns = params.get('dns').split(',').map((address) => address.trim()).filter(Boolean);
      proxy['remote-dns-resolve'] = true;
    }
    const keepaliveText = params.get('persistentkeepalive') || params.get('persistent-keepalive');
    if (keepaliveText) {
      const keepalive = Number(keepaliveText);
      if (!Number.isInteger(keepalive) || keepalive < 0) throw new Error('WireGuard 分享链接中的 PersistentKeepalive 必须是非负整数。');
      proxy['persistent-keepalive'] = keepalive;
    }
    if (params.has('mtu')) {
      const mtu = Number(params.get('mtu'));
      if (!Number.isInteger(mtu) || mtu < 1) throw new Error('WireGuard 分享链接中的 MTU 必须是正整数。');
      proxy.mtu = mtu;
    }
    if (params.has('reserved')) proxy.reserved = params.get('reserved').split(',').map(Number);
    return proxy;
  }
  if (scheme === 'mierus' || scheme === 'mieru') {
    if (!parts.user) throw new Error('Mieru 分享链接缺少用户名。');
    const proxy = {
      name: parts.name,
      type: 'mieru',
      server: parts.server,
      port: parts.port,
      username: parts.user,
      password: parts.password,
    };
    for (const key of ['transport', 'multiplexing', 'bandwidth']) {
      if (params.has(key)) proxy[key] = params.get(key);
    }
    return proxy;
  }
  throw new Error(`暂不支持该分享链接协议：${scheme}。请将节点填写为 CUSTOM_PROXIES 中的 Mihomo 格式对象。`);
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

// 静态域名映射
const overwriteHosts = (config) => {
  config['hosts'] = {
    // DNS 服务器域名固定解析为国内公共 DNS，避免解析自身失败
    'doh.pub': ['1.12.12.12', '120.53.53.53'],
    'cloudflare-dns.com': ['1.1.1.1', '1.0.0.1'],
    'dns.google': ['8.8.8.8', '8.8.4.4'],

    // 解决谷歌商店无法下载的问题
    'services.googleapis.cn': 'services.googleapis.com',

    // 屏蔽哔哩哔哩 PCDN，解决访问视频/直播卡顿问题
    '+.mcdn.bilivideo.com': ['0.0.0.0'],
    '+.mcdn.bilivideo.cn': ['0.0.0.0'],
    '+.edge.mountaintoys.cn': ['0.0.0.0'],
    '+.h2.smtcdns.net': ['0.0.0.0'],
  };
};

// DNS
const overwriteDns = (config, ctx) => {
  const { nodeDomains } = ctx;
  // 公共 DNS 黑名单：命中即视为公共 DNS 过滤
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
  const echDnsPolicy = {};
  for (const [queryServerName, resolver] of CUSTOM_ECH_DNS_SERVERS) {
    echDnsPolicy[queryServerName] = [`${resolver}#DIRECT`];
  }

  config['dns'] = {
    'enable': true,
    'cache-algorithm': 'arc',
    'ipv6': false,
    'use-hosts': true,
    'use-system-hosts': false,
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

    ],
    'nameserver-policy': {
      ...proxyPolicy, // 动态：节点域名走代理 DNS
      ...echDnsPolicy,
      'rule-set:cn,games_cn,microsoft_cn,apple_cn,private,fakeipfilter_cn': [
        'https://dns.alidns.com/dns-query#disable-qtype-65=true',
        'https://doh.pub/dns-query#disable-qtype-65=true',
      ],
      'rule-set:douyin,bytedance,kuaishou,bilibili': ['system'],

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

// 规则集 (rule-providers)
const overwriteRuleProviders = (config) => {
  const RULE_BASE = { 'type': 'http', 'format': 'mrs', 'interval': 86400, 'dialer-proxy': 'DIRECT' };
  const RULE_DOMAIN = { ...RULE_BASE, 'behavior': 'domain' };
  const RULE_IPCIDR = { ...RULE_BASE, 'behavior': 'ipcidr' };
  const RULE_FAKEIPFILTER = { 'type': 'http', 'format': 'text', 'interval': 86400, 'behavior': 'domain', 'dialer-proxy': 'DIRECT' };

  const mrs_domain = (bundle, file = bundle) => ({
    ...RULE_DOMAIN,
    'url': `https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/${bundle}.mrs`,
    'path': `./ruleset/${file}.mrs`,
    'path-in-bundle': `geo/geosite/${bundle}.mrs`,
  });

  // geoip mrs
  const mrs_ipcidr = (bundle, file) => ({
    ...RULE_IPCIDR,
    'url': `https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/${bundle}.mrs`,
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
    'douyin': mrs_domain('douyin'),
    'bytedance': mrs_domain('bytedance'),
    'kuaishou': mrs_domain('kuaishou'),
    'bilibili': mrs_domain('bilibili'),

    // --- 应用规则集 ---
    'youtube': mrs_domain('youtube'),
    'googlefcm': mrs_domain('googlefcm'),
    'ai': mrs_domain('category-ai-!cn', 'ai'),

    // --- 其他规则集 ---
    'geolocation-!cn': mrs_domain('geolocation-!cn'),
    'ads': {
      ...RULE_DOMAIN,
      'url': 'https://fastly.jsdelivr.net/gh/TG-Twilight/AWAvenue-Ads-Rule@main/Filters/AWAvenue-Ads-Rule-Clash.mrs',
      'path': './ruleset/ads.mrs',
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
      'url': 'https://fastly.jsdelivr.net/gh/qichiyuhub/rule@main/rules/fakeipfilter-cn.list',
      'path': './ruleset/fakeipfilter-cn.list',
    },
    'fakeipfilter_!cn': {
      ...RULE_FAKEIPFILTER,
      'url': 'https://fastly.jsdelivr.net/gh/qichiyuhub/rule@main/rules/fakeipfilter-!cn.list',
      'path': './ruleset/fakeipfilter-!cn.list',
    },
  };
};

// 策略组 (proxy-groups)
const overwriteProxyGroups = (config, ctx) => {
  const { topProxyNames, fallbackUse: FALLBACK_USE, manualProxyNames } = ctx;

  // 判断地区是否有节点：可读到节点名就按 filter 匹配（空地区组隐藏），
  // 读不到（远程 provider）则保持显示；(?i) 前缀转成 JS 的 i 标志
  const makeRegionHasNodes = (topProxyNames) => {
    const canInspectNodes = topProxyNames.length > 0;
    const regexCache = new Map(); // 每个 filter 只编译一次

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
  const PROXIES_DEFAULT = ['PROXY', 'AUTO', 'HK', 'SG', 'JP', 'US', 'TW', 'KR', 'Other', ...(manualProxyNames.length > 0 ? ['Private'] : [])];
  const PROXIES_DIRECT = [...PROXIES_DEFAULT, 'DIRECT'];
  const PROXIES_AI = ['PROXY', 'SG', 'JP', 'US', 'KR', ...(manualProxyNames.length > 0 ? ['Private'] : [])];
  const PROXIES_PROXY = ['AUTO', 'HK', 'JP', 'US', 'SG', 'TW', 'KR', 'Other', ...(manualProxyNames.length > 0 ? ['Private'] : [])];

  const FILTER_HK = '(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong)';
  const FILTER_JP = '(?i)(🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan)';
  const FILTER_US = '(?i)(🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|圣地亚哥|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states)';
  const FILTER_SG = '(?i)(🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore)';
  const FILTER_TW = '(?i)(🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan)';
  const FILTER_KR = '(?i)(🇰🇷|韩国|首尔|釜山|仁川|大邱|(?<![A-Za-z])KOR?(?![A-Za-z])|korea|south\\s*korea)';
  const EXCLUDE_FILTER = `(?i)(${[FILTER_HK, FILTER_JP, FILTER_US, FILTER_SG, FILTER_TW, FILTER_KR]
    .map((pattern) => pattern.slice('(?i)('.length, -1))
    .join('|')})`;

  const svg = (name) =>
    `https://fastly.jsdelivr.net/gh/RikkaSaiko1/clash_config@main/svg/${name}.svg`;

  const group = (name) =>
    `https://fastly.jsdelivr.net/gh/Orz-3/mini@master/Color/${name}.png`;

  config['proxy-groups'] = [
    // 基础策略组（PROXY 在纯 provider 订阅时追加 use 兜底）
    { 'name': 'PROXY', ...RULE_GROUP, 'proxies': PROXIES_PROXY, ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': group('Static') },
    { 'name': 'AUTO', ...RULE_GROUP_TEST, 'hidden': false, 'icon': group('Urltest') },
    ...(manualProxyNames.length > 0 ? [{ 'name': 'Private', ...RULE_GROUP, 'proxies': manualProxyNames, 'icon': group('Personal') }] : []),
    // 应用策略组
    ...(ruleOptionsEnable.YouTube ? [{ 'name': 'YouTube', ...RULE_GROUP, 'proxies': PROXIES_DEFAULT, 'icon': svg('youtube') }] : []),
    ...(ruleOptionsEnable.AI ? [{ 'name': 'AI', ...RULE_GROUP, 'proxies': PROXIES_AI, 'default-selected': 'US', 'icon': svg('deepseek') }] : []),
    // 地区策略组（按关键字匹配节点，空组自动隐藏）
    { 'name': 'HK', ...RULE_GROUP, 'filter': FILTER_HK, 'include-all': true, 'proxies': ['HK Auto'], 'hidden': !regionHasNodes(FILTER_HK), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': group('HK') },
    { 'name': 'HK Auto', ...RULE_GROUP_TEST, 'filter': FILTER_HK, 'hidden': true },
    { 'name': 'JP', ...RULE_GROUP, 'filter': FILTER_JP, 'include-all': true, 'proxies': ['JP Auto'], 'hidden': !regionHasNodes(FILTER_JP), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': group('JP') },
    { 'name': 'JP Auto', ...RULE_GROUP_TEST, 'filter': FILTER_JP, 'hidden': true },
    { 'name': 'US', ...RULE_GROUP, 'filter': FILTER_US, 'include-all': true, 'proxies': ['US Auto'], 'hidden': !regionHasNodes(FILTER_US), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': group('US') },
    { 'name': 'US Auto', ...RULE_GROUP_TEST, 'filter': FILTER_US, 'hidden': true },
    { 'name': 'SG', ...RULE_GROUP, 'filter': FILTER_SG, 'include-all': true, 'proxies': ['SG Auto'], 'hidden': !regionHasNodes(FILTER_SG), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': group('SG') },
    { 'name': 'SG Auto', ...RULE_GROUP_TEST, 'filter': FILTER_SG, 'hidden': true },
    { 'name': 'TW', ...RULE_GROUP, 'filter': FILTER_TW, 'include-all': true, 'proxies': ['TW Auto'], 'hidden': !regionHasNodes(FILTER_TW), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': group('TW') },
    { 'name': 'TW Auto', ...RULE_GROUP_TEST, 'filter': FILTER_TW, 'hidden': true },
    { 'name': 'KR', ...RULE_GROUP, 'filter': FILTER_KR, 'include-all': true, 'proxies': ['KR Auto'], 'hidden': !regionHasNodes(FILTER_KR), ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': group('KR') },
    { 'name': 'KR Auto', ...RULE_GROUP_TEST, 'filter': FILTER_KR, 'hidden': true },
    // 其他地区
    { 'name': 'Other', ...RULE_GROUP, 'exclude-filter': EXCLUDE_FILTER, 'exclude-type': 'DIRECT', 'include-all': true, 'proxies': ['Other Auto'], ...(FALLBACK_USE ? { 'use': FALLBACK_USE } : {}), 'icon': group('Global') },
    { 'name': 'Other Auto', ...RULE_GROUP_TEST, 'exclude-filter': EXCLUDE_FILTER, 'hidden': true },
  ];
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
    // 拦截 STUN/TURN 探测
    ...(ruleOptionsEnable.BlockSTUN ? ['AND,((NETWORK,UDP),(OR,((DST-PORT,3478-3481),(DST-PORT,5349),(DST-PORT,19302-19309)))),REJECT'] : []),
    // 屏蔽国外 QUIC
    ...(ruleOptionsEnable.BlockQUIC ? ['AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((OR,((RULE-SET,cn_additional),(RULE-SET,cn_ip,no-resolve)))))),REJECT'] : []),
    // 广告拦截
    ...(ruleOptionsEnable.AdBlock ? ['RULE-SET,ads,REJECT'] : []),
    // 代理规则
    ...(ruleOptionsEnable.YouTube ? ['RULE-SET,youtube,YouTube'] : []),
    'RULE-SET,googlefcm,DIRECT',
    ...(ruleOptionsEnable.AI ? ['RULE-SET,ai,AI'] : []),
    'RULE-SET,geolocation-!cn,PROXY',
    'RULE-SET,cn_ip,DIRECT',
    'MATCH,PROXY',
  ];
};

// 入口：收集节点上下文后按区块依次覆写
const main = (config) => {
  config = config || {};
  const customProxies = getCustomProxies();
  if (customProxies.length > 0) {
    const existingNames = new Set(
      (Array.isArray(config['proxies']) ? config['proxies'] : [])
        .map((proxy) => (typeof proxy === 'string' ? proxy : proxy && proxy.name))
        .filter(Boolean),
    );
    for (const proxy of customProxies) {
      if (existingNames.has(proxy.name)) {
        throw new Error(`手动节点名称与现有节点重复：${proxy.name}`);
      }
    }
    config['proxies'] = [
      ...(Array.isArray(config['proxies']) ? config['proxies'] : []),
      ...customProxies,
    ];
  }
  const ctx = {
    ...collectNodeSources(config),
    manualProxyNames: customProxies.map((proxy) => proxy.name),
  };
  overwriteTun(config);
  overwriteSniffer(config);
  overwriteHosts(config);
  overwriteDns(config, ctx);
  overwriteRuleProviders(config);
  overwriteProxyGroups(config, ctx);
  overwriteRules(config);
  return config;
};

const parseVlessUri = (uri) => {
  const match = /^vless:\/\/([^/?#]+)(?:\?([^#]*))?(?:#(.*))?$/i.exec(uri.trim());
  if (!match) throw new Error('手动节点链接必须是有效的 VLESS 分享链接。');
  const authority = match[1];
  const atIndex = authority.lastIndexOf('@');
  if (atIndex < 1) throw new Error('VLESS 分享链接缺少 UUID。');
  const decode = (value, formEncoded = false) => {
    try {
      return decodeURIComponent(formEncoded ? value.replace(/\+/g, ' ') : value);
    } catch {
      throw new Error('VLESS 分享链接包含无效的 URL 编码。');
    }
  };
  const uuid = decode(authority.slice(0, atIndex));
  const address = authority.slice(atIndex + 1);
  let server;
  let portText;
  if (address.startsWith('[')) {
    const closingBracket = address.indexOf(']');
    if (closingBracket < 0 || address[closingBracket + 1] !== ':') {
      throw new Error('VLESS 分享链接中的 IPv6 地址或端口无效。');
    }
    server = address.slice(1, closingBracket);
    portText = address.slice(closingBracket + 2);
  } else {
    const separator = address.lastIndexOf(':');
    if (separator < 1) throw new Error('VLESS 分享链接缺少服务器端口。');
    server = address.slice(0, separator);
    portText = address.slice(separator + 1);
  }
  const port = Number(portText);
  if (!uuid || !server || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('VLESS 分享链接必须包含有效的 UUID、服务器地址和端口。');
  }

  const params = new Map();
  for (const pair of (match[2] || '').split('&')) {
    if (!pair) continue;
    const separator = pair.indexOf('=');
    const key = decode(separator < 0 ? pair : pair.slice(0, separator), true);
    if (!params.has(key)) params.set(key, decode(separator < 0 ? '' : pair.slice(separator + 1), key !== 'ech'));
  }
  const security = (params.get('security') || 'none').toLowerCase();
  if (!['none', 'tls', 'reality'].includes(security)) {
    throw new Error(`暂不支持 VLESS 安全类型：${security}`);
  }

  const name = match[3] ? decode(match[3]) : `${server}:${port}`;
  const proxy = { name, type: 'vless', server, port, uuid, udp: true };
  const encryption = params.get('encryption');
  if (encryption && encryption.toLowerCase() !== 'none') proxy.encryption = encryption;
  if (params.has('flow')) proxy.flow = params.get('flow');
  if (security === 'tls' || security === 'reality') {
    proxy.tls = true;
    if (params.has('sni')) proxy.servername = params.get('sni');
    if (params.has('fp')) proxy['client-fingerprint'] = params.get('fp');
    if (params.has('alpn')) proxy.alpn = params.get('alpn').split(',').filter(Boolean);
  }
  if (params.has('ech')) {
    if (security !== 'tls') throw new Error('VLESS ECH 需要 security=tls。');
    const echValue = params.get('ech');
    const separator = echValue.indexOf('+');
    const queryServerName = (separator < 0 ? echValue : echValue.slice(0, separator)).trim();
    if (!queryServerName) throw new Error('VLESS ECH 参数缺少查询域名。');
    if (separator >= 0) {
      const resolver = echValue.slice(separator + 1).trim();
      if (!/^https:\/\/[^#\s]+$/i.test(resolver)) {
        throw new Error('VLESS ECH 自定义 DNS 只支持有效的 HTTPS DoH 地址。');
      }
      const existingResolver = CUSTOM_ECH_DNS_SERVERS.get(queryServerName);
      if (existingResolver && existingResolver !== resolver) {
        throw new Error(`ECH 查询域名 ${queryServerName} 配置了多个不同的 DNS 服务器。`);
      }
      CUSTOM_ECH_DNS_SERVERS.set(queryServerName, resolver);
    }
    proxy['ech-opts'] = { enable: true, 'query-server-name': queryServerName };
  }
  if (security === 'reality') {
    const realityOptions = {};
    if (params.has('pbk')) realityOptions['public-key'] = params.get('pbk');
    if (params.has('sid')) realityOptions['short-id'] = params.get('sid');
    if (Object.keys(realityOptions).length > 0) proxy['reality-opts'] = realityOptions;
  }

  const network = (params.get('type') || 'tcp').toLowerCase();
  if (!['tcp', 'ws', 'grpc', 'httpupgrade', 'xhttp'].includes(network)) {
    throw new Error(`暂不支持 VLESS 传输类型：${network}`);
  }
  proxy.network = network;
  if (network === 'xhttp') {
    const xhttpOptions = {};
    for (const key of ['host', 'path', 'mode']) {
      if (params.has(key)) xhttpOptions[key] = params.get(key);
    }

    if (params.has('extra')) {
      let extra;
      try {
        extra = JSON.parse(params.get('extra'));
      } catch {
        throw new Error('VLESS XHTTP 的 extra 参数不是有效的 JSON。');
      }
      if (!extra || typeof extra !== 'object' || Array.isArray(extra)) {
        throw new Error('VLESS XHTTP 的 extra 参数必须是 JSON 对象。');
      }
      for (const key of ['host', 'path', 'mode']) {
        if (!params.has(key) && typeof extra[key] === 'string') xhttpOptions[key] = extra[key];
      }
      if (extra.headers && typeof extra.headers === 'object' && !Array.isArray(extra.headers)) {
        xhttpOptions.headers = extra.headers;
      }
      const stringFields = {
        xPaddingBytes: 'x-padding-bytes',
        xPaddingKey: 'x-padding-key',
        xPaddingHeader: 'x-padding-header',
        xPaddingPlacement: 'x-padding-placement',
        xPaddingMethod: 'x-padding-method',
        uplinkHTTPMethod: 'uplink-http-method',
        sessionIDPlacement: 'session-placement',
        sessionIDKey: 'session-key',
        sessionIDTable: 'session-table',
        sessionIDLength: 'session-length',
        seqPlacement: 'seq-placement',
        seqKey: 'seq-key',
        uplinkDataPlacement: 'uplink-data-placement',
        uplinkDataKey: 'uplink-data-key',
        uplinkChunkSize: 'uplink-chunk-size',
        scMaxEachPostBytes: 'sc-max-each-post-bytes',
        scMinPostsIntervalMs: 'sc-min-posts-interval-ms',
      };
      for (const [source, target] of Object.entries(stringFields)) {
        const value = extra[source];
        if (typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) {
          xhttpOptions[target] = String(value);
        }
      }
      if (typeof extra.xPaddingObfsMode === 'boolean') {
        xhttpOptions['x-padding-obfs-mode'] = extra.xPaddingObfsMode;
        if (extra.xPaddingObfsMode) {
          if (!xhttpOptions['x-padding-key']) xhttpOptions['x-padding-key'] = 'x_padding';
          if (!xhttpOptions['x-padding-header']) xhttpOptions['x-padding-header'] = 'X-Padding';
          if (!xhttpOptions['x-padding-placement']) xhttpOptions['x-padding-placement'] = 'queryInHeader';
          if (!xhttpOptions['x-padding-method']) xhttpOptions['x-padding-method'] = 'repeat-x';
        }
      }
      if (typeof extra.noGRPCHeader === 'boolean') {
        xhttpOptions['no-grpc-header'] = extra.noGRPCHeader;
      }
      if (extra.xmux && typeof extra.xmux === 'object' && !Array.isArray(extra.xmux)) {
        const reuseSettings = {};
        const reuseFields = {
          maxConcurrency: 'max-concurrency',
          maxConnections: 'max-connections',
          cMaxReuseTimes: 'c-max-reuse-times',
          hMaxRequestTimes: 'h-max-request-times',
          hMaxReusableSecs: 'h-max-reusable-secs',
        };
        for (const [source, target] of Object.entries(reuseFields)) {
          const value = extra.xmux[source];
          if (typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) {
            reuseSettings[target] = String(value);
          }
        }
        if (typeof extra.xmux.hKeepAlivePeriod === 'number' && Number.isFinite(extra.xmux.hKeepAlivePeriod)) {
          reuseSettings['h-keep-alive-period'] = extra.xmux.hKeepAlivePeriod;
        }
        if (Object.keys(reuseSettings).length > 0) xhttpOptions['reuse-settings'] = reuseSettings;
      }
    }
    proxy['xhttp-opts'] = xhttpOptions;
  } else if (network === 'ws' || network === 'httpupgrade') {
    const wsOptions = { path: params.get('path') || '/', headers: {} };
    if (params.has('host')) wsOptions.headers.Host = params.get('host');
    if (network === 'httpupgrade') wsOptions['v2ray-http-upgrade'] = true;
    proxy.network = 'ws';
    proxy['ws-opts'] = wsOptions;
  } else if (network === 'grpc') {
    proxy['grpc-opts'] = { 'grpc-service-name': params.get('serviceName') || '' };
  }
  return proxy;
};
