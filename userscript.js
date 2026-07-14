// ==UserScript==
// @name         ChatGPT DCCon Renderer Optimized
// @namespace    local.aicon.chatgpt.optimized
// @version      3.1.0
// @description  Render AIcon tags as DCCon images on ChatGPT via GM_xmlhttpRequest and Blob URLs.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        GM_xmlhttpRequest
// @connect      dcimg5.dcinside.com
// @run-at       document-end
// @noframes
// ==/UserScript==

(function () {
  'use strict';
  if (!new Set(['chatgpt.com', 'chat.openai.com']).has(location.hostname)) return;

  const CONFIG = Object.freeze({ iconSize: 128, showBadge: false, badgeText: 'AIcon', statusStorageKey: '__AICON_STATUS__', statusFlushDelayMs: 750 });
  // [canonical name, numeric legacy prefix, direct DCCon URL]
  const ICON_ROWS = [
    ['행복','01','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ad83400021'],
    ['나야','02','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ae83400021'],
    ['누나야','03','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306af83400021'],
    ['어머머','04','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306a883400021'],
    ['개추','05','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306a983400021'],
    ['무시','06','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306aa83400021'],
    ['사료가','07','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ab83400021'],
    ['삐삐','08','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306a483400021'],
    ['기다리','09','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306a583400021'],
    ['가만히','10','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ad9d1e1e2848'],
    ['휴지','11','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ad9c1e1e2814'],
    ['몸매','12','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ad9f1e1e289f'],
    ['기대','13','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ad9e1e1e2845'],
    ['하두','14','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ad991e1e2857'],
    ['헉헉헉','15','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ad981e1e2825'],
    ['열심히','16','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ad9b1e1e2800'],
    ['완장','17','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ad9a1e1e2820'],
    ['죄송할','18','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ad951e1e28e8'],
    ['잘자','19','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ad941e1e28d4'],
    ['으아앙','20','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ae9d1e1e28f5'],
    ['잘자2','21','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ae9c1e1e28cd'],
    ['레알3','22','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ae9f1e1e28a6'],
    ['자연사','23','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ae9e1e1e28cc'],
    ['레알','24','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ae991e1e2827'],
    ['레알2','25','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ae981e1e28af'],
    ['눈떠','26','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ae9b1e1e28f5'],
    ['다시','27','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ae9a1e1e2812'],
    ['당함','28','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ae951e1e2817'],
    ['주문','29','https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b651ee276e03551ca8f889297a784025c6e259437413c1f483673a321d1186ef8e71d97f1d1f0349787d9bafe7a07306ae941e1e281c']
  ];
  const ICONS = Object.create(null), ALIASES = Object.create(null);
  for (const [name, number, src] of ICON_ROWS) {
    const alias = number + name;
    ICONS[name] = { name, src };
    ALIASES[name] = ALIASES[alias] = name;
  }

  const TOKEN = /\[\[\s*icon\s*:\s*([^\]\s]+)\s*\]\]|\[\s*([0-9]{2}[^\]\s]+)\s*\]/g;
  const STYLE_ID = 'aicon-renderer-optimized-styles', BADGE_ID = 'aicon-renderer-optimized-badge';
  const SKIP = 'script,style,noscript,template,textarea,input,select,option,optgroup,button,output,code,pre,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[data-aicon-rendered="true"],[data-aicon-owned="true"]';
  let pendingStatus = Object.create(null), statusTimer = null, scanScheduled = false;
  const pendingRoots = new Set();
  const now = () => new Date().toISOString();
  const normalize = (value) => String(value || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, '').trim();
  const resolve = (value) => ALIASES[normalize(value)] || '';
  function hasToken(text) { TOKEN.lastIndex = 0; const result = !!text && TOKEN.test(text); TOKEN.lastIndex = 0; return result; }
  function ignored(element) { return !!(element && (element.isContentEditable || element.matches(SKIP) || element.closest(SKIP))); }
  function skipText(node) { return !node || node.nodeType !== Node.TEXT_NODE || !node.parentElement || node.parentElement.isContentEditable || !!node.parentElement.closest(SKIP); }
  function canScan(root) {
    if (!root || (typeof root.isConnected === 'boolean' && !root.isConnected)) return false;
    return root.nodeType === Node.TEXT_NODE ? !skipText(root) : root.nodeType === Node.ELEMENT_NODE ? !ignored(root) : root.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
  }

  function ensureUI() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID; style.dataset.aiconOwned = 'true';
      style.textContent = `.aicon-renderer-icon{display:inline-flex;align-items:center;justify-content:center;margin:0 4px;vertical-align:middle;line-height:1}.aicon-renderer-icon>img{display:inline-block;width:${CONFIG.iconSize}px;height:${CONFIG.iconSize}px;max-width:${CONFIG.iconSize}px;max-height:${CONFIG.iconSize}px;margin:0;vertical-align:middle;object-fit:contain;background:transparent;border:0;border-radius:0;box-shadow:none}.aicon-renderer-icon--error{display:inline;margin:0;white-space:pre-wrap}#${BADGE_ID}{position:fixed;right:10px;bottom:10px;z-index:2147483647;padding:3px 6px;border-radius:999px;background:rgba(0,0,0,.35);color:rgba(255,255,255,.75);font:600 10px/1 Arial,sans-serif;box-shadow:none;pointer-events:none;opacity:.45}`;
      (document.head || document.documentElement).appendChild(style);
    }
    const badge = document.getElementById(BADGE_ID);
    if (!CONFIG.showBadge) { if (badge) badge.remove(); return; }
    if (!badge && document.body) {
      const next = document.createElement('div');
      next.id = BADGE_ID; next.className = 'aicon-renderer-badge'; next.dataset.aiconOwned = 'true';
      next.setAttribute('aria-hidden', 'true'); next.textContent = CONFIG.badgeText; document.body.appendChild(next);
    }
  }
  function readStatus() { try { return JSON.parse(localStorage.getItem(CONFIG.statusStorageKey) || '{}'); } catch (_) { return {}; } }
  function flushStatus() {
    if (statusTimer !== null) { clearTimeout(statusTimer); statusTimer = null; }
    const update = pendingStatus; pendingStatus = Object.create(null);
    try { localStorage.setItem(CONFIG.statusStorageKey, JSON.stringify(Object.assign({}, readStatus(), update, { href: location.href, updatedAt: now() }))); }
    catch (error) { console.warn('[AIcon] Unable to update localStorage status.', error); }
  }
  function status(update, immediate) {
    Object.assign(pendingStatus, update);
    if (immediate) return flushStatus();
    if (statusTimer === null) statusTimer = setTimeout(flushStatus, CONFIG.statusFlushDelayMs);
  }

  const dcconBlobUrls = new Map(), dcconRequests = new Map();
  function getDcconBlobUrl(src) {
    const cached = dcconBlobUrls.get(src);
    if (cached) return Promise.resolve(cached);
    const inFlight = dcconRequests.get(src);
    if (inFlight) return inFlight;

    const request = new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: src,
        headers: {
          Referer: 'https://gall.dcinside.com/',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
        },
        responseType: 'blob',
        timeout: 15000,
        onload(response) {
          if (response.status < 200 || response.status >= 300) {
            reject(new Error(`DCCon HTTP ${response.status}`));
            return;
          }
          const blob = response.response;
          if (!blob || !blob.size) {
            reject(new Error('DCCon returned an empty image response.'));
            return;
          }
          if (blob.type && !blob.type.startsWith('image/')) {
            reject(new Error(`DCCon returned a non-image response: ${blob.type}`));
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          dcconBlobUrls.set(src, blobUrl);
          resolve(blobUrl);
        },
        onerror() { reject(new Error('DCCon image request failed.')); },
        ontimeout() { reject(new Error('DCCon image request timed out.')); }
      });
    }).finally(() => dcconRequests.delete(src));

    dcconRequests.set(src, request);
    return request;
  }

  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    for (const blobUrl of dcconBlobUrls.values()) URL.revokeObjectURL(blobUrl);
    dcconBlobUrls.clear();
  });

  function makeIcon(name, originalToken) {
    const wrapper = document.createElement('span'), image = document.createElement('img');
    wrapper.className = 'aicon-renderer-icon'; wrapper.dataset.aiconRendered = 'true'; wrapper.dataset.aiconSourceToken = originalToken;
    Object.assign(image, { alt: name, title: name, loading: 'lazy', decoding: 'async' });
    const restoreToken = () => {
      if (wrapper.dataset.aiconLoadError === 'true') return;
      wrapper.dataset.aiconLoadError = 'true'; wrapper.classList.add('aicon-renderer-icon--error');
      wrapper.title = `${name}: image failed to load`; wrapper.replaceChildren(document.createTextNode(originalToken));
      status({ lastImageError: name, lastImageErrorAt: now() });
    };
    image.addEventListener('error', restoreToken, { once: true });
    wrapper.appendChild(image);
    getDcconBlobUrl(ICONS[name].src)
      .then((blobUrl) => { if (wrapper.dataset.aiconLoadError !== 'true') image.src = blobUrl; })
      .catch((error) => { console.warn(`[AIcon] ${name} image request failed.`, error); restoreToken(); });
    return wrapper;
  }
  function replaceText(node) {
    if (skipText(node)) return false;
    const text = node.nodeValue || ''; if (!hasToken(text)) return false;
    const fragment = document.createDocumentFragment(); let cursor = 0, changed = false, match;
    TOKEN.lastIndex = 0;
    while ((match = TOKEN.exec(text))) {
      const raw = match[0], name = resolve(match[1] || match[2]);
      if (match.index > cursor) fragment.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      fragment.appendChild(name ? makeIcon(name, raw) : document.createTextNode(raw));
      changed ||= !!name; cursor = match.index + raw.length;
    }
    TOKEN.lastIndex = 0;
    if (!changed || !node.parentNode) return false;
    if (cursor < text.length) fragment.appendChild(document.createTextNode(text.slice(cursor)));
    node.parentNode.replaceChild(fragment, node); return true;
  }
  function scan(root) {
    const result = { foundTextNodes: 0, replacedTextNodes: 0 }; if (!canScan(root)) return result;
    const nodes = [];
    if (root.nodeType === Node.TEXT_NODE) { if (hasToken(root.nodeValue)) nodes.push(root); }
    else {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (node) => !skipText(node) && hasToken(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
      while (walker.nextNode()) nodes.push(walker.currentNode);
    }
    result.foundTextNodes = nodes.length;
    for (const node of nodes) result.replacedTextNodes += +replaceText(node);
    return result;
  }
  function scanRoots(roots) {
    const total = { scannedRoots: 0, foundTextNodes: 0, replacedTextNodes: 0 };
    for (const root of roots) { const result = scan(root); total.scannedRoots++; total.foundTextNodes += result.foundTextNodes; total.replacedTextNodes += result.replacedTextNodes; }
    return total;
  }
  function record(total, loaded) {
    status(Object.assign({ loaded: true, lastScanAt: now(), lastScannedRoots: total.scannedRoots, lastFoundTextNodes: total.foundTextNodes, lastReplacedNodes: total.replacedTextNodes, iconSize: CONFIG.iconSize, badgeVisible: CONFIG.showBadge }, loaded ? { loadedAt: now() } : {}), !!loaded);
    if (total.foundTextNodes || total.replacedTextNodes) console.debug('[AIcon] scanned roots:', total.scannedRoots, 'found:', total.foundTextNodes, 'replaced:', total.replacedTextNodes);
  }
  function queue(root) { if (!canScan(root)) return false; pendingRoots.add(root); return true; }
  function takeRoots() {
    const roots = [...pendingRoots].filter(canScan); pendingRoots.clear();
    return roots.filter((root) => !roots.some((other) => other !== root && other.contains(root)));
  }
  function processScans() { scanScheduled = false; ensureUI(); const roots = takeRoots(); if (roots.length) record(scanRoots(roots)); }
  function scheduleScans() { if (!scanScheduled) { scanScheduled = true; (typeof queueMicrotask === 'function' ? queueMicrotask : (fn) => Promise.resolve().then(fn))(processScans); } }
  function mutations(records) {
    let relevant = false;
    for (const record of records) {
      if (record.type === 'characterData') relevant = queue(record.target) || relevant;
      else {
        for (const node of record.addedNodes) relevant = queue(node) || relevant;
        if (CONFIG.showBadge && !document.getElementById(BADGE_ID)) relevant = true;
      }
    }
    if (relevant) scheduleScans();
  }
  function start() {
    ensureUI(); const initial = scanRoots([document.body]); record(initial, true);
    new MutationObserver(mutations).observe(document.body, { childList: true, subtree: true, characterData: true });
    console.info('[AIcon] optimized ChatGPT web renderer loaded:', location.href);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
