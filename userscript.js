// ==UserScript==
// @name         ChatGPT AIcon Semantic
// @namespace    local.aicon.chatgpt.semantic
// @version      6.0.1
// @description  Render the 32-icon tidy-bob AIcon set from Firebase Storage; exact and semantic tags.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        GM_xmlhttpRequest
// @connect      firebasestorage.googleapis.com
// @run-at       document-end
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const AGENT_ID = "gpt";
  const ALLOWED_HOSTS = new Set(["chatgpt.com","chat.openai.com"]);
  if (!ALLOWED_HOSTS.has(location.hostname)) return;
  if (AGENT_ID === 'grok' && location.hostname === 'x.com' && !location.pathname.startsWith('/i/grok')) return;

  const CONFIG = Object.freeze({
    iconSize: 128,
    showBadge: false,
    badgeText: 'AIcon',
    statusStorageKey: '__AICON_STATUS_' + AGENT_ID.toUpperCase() + '__',
    statusFlushDelayMs: 750,
  });
  const FIREBASE_BUCKET = YOUR_BUCKET;
  const FIREBASE_FOLDER = 'aicons4/' + AGENT_ID;
  const ICON_ROWS = [
  [
    "대기중",
    "01-idle.png"
  ],
  [
    "접수",
    "02-acknowledged.png"
  ],
  [
    "생각중",
    "03-thinking.png"
  ],
  [
    "작업중",
    "04-working.png"
  ],
  [
    "주인님?",
    "05-question.png"
  ],
  [
    "해냈다",
    "06-done.png"
  ],
  [
    "왜안됨",
    "07-blocked.png"
  ],
  [
    "계획대로",
    "08-smug.png"
  ],
  [
    "안녕",
    "09-greeting.png"
  ],
  [
    "어디보자",
    "10-inspecting.png"
  ],
  [
    "잘보세요",
    "11-explaining.png"
  ],
  [
    "찾았다",
    "12-discovery.png"
  ],
  [
    "잠깐",
    "13-caution.png"
  ],
  [
    "미안해요",
    "14-sorry.png"
  ],
  [
    "좋았어",
    "15-happy.png"
  ],
  [
    "진짜?",
    "16-skeptical.png"
  ],
  [
    "어흐~",
    "17-eohu.png"
  ],
  [
    "우헤헤",
    "18-uhehe.png"
  ],
  [
    "븅신",
    "19-insult.png"
  ],
  [
    "펀치",
    "20-punch.png"
  ],
  [
    "조금애매함",
    "21-uncertain.png"
  ],
  [
    "아닌데?",
    "22-disagree.png"
  ],
  [
    "그건안돼",
    "23-not-allowed.png"
  ],
  [
    "파일줘봐",
    "24-file-request.png"
  ],
  [
    "검토완료",
    "25-reviewed.png"
  ],
  [
    "출처있음",
    "26-source.png"
  ],
  [
    "수정완료",
    "27-fixed.png"
  ],
  [
    "ㄹㅇㅋㅋ",
    "28-lol.png"
  ],
  [
    "정말이지",
    "29-good-grief.png"
  ],
  [
    "윙크",
    "30-wink.png"
  ],
  [
    "하트",
    "31-heart.png"
  ],
  [
    "잘자",
    "32-sleep.png"
  ]
];
  const LEGACY_ALIASES = {};
  const CATEGORY_ROWS = {
  "질문": [
    "주인님?"
  ],
  "확인": [
    "검토완료"
  ],
  "검색": [
    "어디보자"
  ],
  "완료": [
    "해냈다"
  ],
  "긍정": [
    "좋았어"
  ],
  "부정": [
    "아닌데?",
    "그건안돼"
  ],
  "웃기": [
    "우헤헤",
    "ㄹㅇㅋㅋ"
  ],
  "사랑": [
    "하트",
    "윙크",
    "어흐~"
  ],
  "화남": [
    "펀치"
  ],
  "당황": [
    "왜안됨"
  ],
  "잠": [
    "잘자"
  ],
  "미안": [
    "미안해요"
  ],
  "요청": [
    "파일줘봐"
  ],
  "작업중": [
    "작업중"
  ],
  "자랑": [
    "계획대로"
  ],
  "오류": [
    "왜안됨"
  ],
  "응원": [
    "하트"
  ],
  "인사": [
    "안녕"
  ],
  "대기": [
    "대기중"
  ],
  "생각": [
    "생각중"
  ],
  "설명": [
    "잘보세요"
  ],
  "발견": [
    "찾았다"
  ],
  "주의": [
    "잠깐"
  ],
  "의심": [
    "진짜?"
  ],
  "애매": [
    "조금애매함"
  ],
  "근거": [
    "출처있음"
  ]
};
  const CATEGORY_ALIASES = {
  "의문": "질문",
  "궁금": "질문",
  "묻기": "질문",
  "검토": "확인",
  "확인하기": "확인",
  "찾기": "검색",
  "조사": "검색",
  "성공": "완료",
  "끝": "완료",
  "좋아": "긍정",
  "찬성": "긍정",
  "추천": "긍정",
  "싫어": "부정",
  "반대": "부정",
  "거절": "부정",
  "웃음": "웃기",
  "웃는행위": "웃기",
  "웃겨": "웃기",
  "애정": "사랑",
  "귀여움": "사랑",
  "분노": "화남",
  "공격": "화남",
  "화내기": "화남",
  "혼란": "당황",
  "당황함": "당황",
  "졸림": "잠",
  "피곤": "잠",
  "수면": "잠",
  "사과": "미안",
  "부탁": "요청",
  "주세요": "요청",
  "로딩": "작업중",
  "진행중": "작업중",
  "실패": "오류",
  "문제": "오류",
  "뽐내기": "자랑",
  "잘난척": "자랑",
  "격려": "응원",
  "힘내": "응원"
};

  const normalize = (value) => String(value || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase();

  const ICONS = Object.create(null);
  const ALIASES = Object.create(null);
  for (const [name, objectFile] of ICON_ROWS) {
    const objectPath = FIREBASE_FOLDER + '/' + objectFile;
    const src = 'https://firebasestorage.googleapis.com/v0/b/' + FIREBASE_BUCKET + '/o/' + encodeURIComponent(objectPath) + '?alt=media';
    ICONS[name] = { name, src };
    ALIASES[normalize(name)] = name;
    ALIASES[normalize(objectFile.replace(/\.png$/i, ''))] = name;
  }
  for (const [alias, name] of Object.entries(LEGACY_ALIASES)) ALIASES[normalize(alias)] = name;

  const CATEGORIES = Object.create(null);
  for (const [category, names] of Object.entries(CATEGORY_ROWS)) {
    CATEGORIES[normalize(category)] = names.filter((name) => ICONS[name]);
  }
  const CATEGORY_LOOKUP = Object.create(null);
  for (const category of Object.keys(CATEGORY_ROWS)) CATEGORY_LOOKUP[normalize(category)] = normalize(category);
  for (const [alias, category] of Object.entries(CATEGORY_ALIASES)) CATEGORY_LOOKUP[normalize(alias)] = normalize(category);
  const lastCategoryChoice = new Map();

  function chooseCategory(categoryKey) {
    const choices = CATEGORIES[categoryKey] || [];
    if (!choices.length) return '';
    const previous = lastCategoryChoice.get(categoryKey);
    const pool = choices.length > 1 ? choices.filter((name) => name !== previous) : choices;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    lastCategoryChoice.set(categoryKey, selected);
    return selected;
  }

  function resolve(value) {
    const key = normalize(value);
    if (ALIASES[key]) return ALIASES[key];
    const categoryKey = CATEGORY_LOOKUP[key];
    return categoryKey ? chooseCategory(categoryKey) : '';
  }

  const TOKEN = /\[\[\s*icon\s*:\s*([^\]\r\n]+?)\s*\]\]|\[\s*([0-9]{2}[^\]\r\n]+?)\s*\]/g;
  const STYLE_ID = 'aicon-renderer-semantic-styles-' + AGENT_ID;
  const BADGE_ID = 'aicon-renderer-semantic-badge-' + AGENT_ID;
  const SKIP = 'script,style,noscript,template,textarea,input,select,option,optgroup,button,output,code,pre,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[data-aicon-rendered="true"],[data-aicon-owned="true"]';
  let pendingStatus = Object.create(null), statusTimer = null, scanScheduled = false;
  const pendingRoots = new Set();
  const now = () => new Date().toISOString();
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
      style.textContent = '.aicon-renderer-icon{display:inline-flex;align-items:center;justify-content:center;margin:0 4px;vertical-align:middle;line-height:1}.aicon-renderer-icon>img{display:inline-block;width:' + CONFIG.iconSize + 'px;height:' + CONFIG.iconSize + 'px;max-width:' + CONFIG.iconSize + 'px;max-height:' + CONFIG.iconSize + 'px;margin:0;vertical-align:middle;object-fit:contain;background:transparent;border:0;border-radius:0;box-shadow:none}.aicon-renderer-icon--error{display:inline;margin:0;white-space:pre-wrap}#' + BADGE_ID + '{position:fixed;right:10px;bottom:10px;z-index:2147483647;padding:3px 6px;border-radius:999px;background:rgba(0,0,0,.35);color:rgba(255,255,255,.75);font:600 10px/1 Arial,sans-serif;pointer-events:none;opacity:.45}';
      (document.head || document.documentElement).appendChild(style);
    }
    const badge = document.getElementById(BADGE_ID);
    if (!CONFIG.showBadge) { if (badge) badge.remove(); return; }
    if (!badge && document.body) {
      const next = document.createElement('div');
      next.id = BADGE_ID; next.dataset.aiconOwned = 'true'; next.setAttribute('aria-hidden', 'true'); next.textContent = CONFIG.badgeText;
      document.body.appendChild(next);
    }
  }

  function readStatus() { try { return JSON.parse(localStorage.getItem(CONFIG.statusStorageKey) || '{}'); } catch (_) { return {}; } }
  function flushStatus() {
    if (statusTimer !== null) { clearTimeout(statusTimer); statusTimer = null; }
    const update = pendingStatus; pendingStatus = Object.create(null);
    try { localStorage.setItem(CONFIG.statusStorageKey, JSON.stringify(Object.assign({}, readStatus(), update, { href: location.href, updatedAt: now() }))); }
    catch (error) { console.warn('[AIcon] Unable to update status.', error); }
  }
  function status(update, immediate) {
    Object.assign(pendingStatus, update);
    if (immediate) return flushStatus();
    if (statusTimer === null) statusTimer = setTimeout(flushStatus, CONFIG.statusFlushDelayMs);
  }

  const iconBlobUrls = new Map(), iconRequests = new Map();
  function getIconBlobUrl(src) {
    if (iconBlobUrls.has(src)) return Promise.resolve(iconBlobUrls.get(src));
    if (iconRequests.has(src)) return iconRequests.get(src);
    const request = new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET', url: src, responseType: 'blob', timeout: 15000,
        headers: { Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' },
        onload(response) {
          if (response.status < 200 || response.status >= 300) return reject(new Error('AIcon HTTP ' + response.status));
          const blob = response.response;
          if (!blob || !blob.size || (blob.type && !blob.type.startsWith('image/'))) return reject(new Error('AIcon invalid image response'));
          const blobUrl = URL.createObjectURL(blob); iconBlobUrls.set(src, blobUrl); resolve(blobUrl);
        },
        onerror() { reject(new Error('AIcon image request failed')); },
        ontimeout() { reject(new Error('AIcon image request timed out')); },
      });
    }).finally(() => iconRequests.delete(src));
    iconRequests.set(src, request); return request;
  }

  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    for (const blobUrl of iconBlobUrls.values()) URL.revokeObjectURL(blobUrl);
    iconBlobUrls.clear();
  });

  function makeIcon(name, originalToken) {
    const wrapper = document.createElement('span'), image = document.createElement('img');
    wrapper.className = 'aicon-renderer-icon'; wrapper.dataset.aiconRendered = 'true'; wrapper.dataset.aiconSourceToken = originalToken;
    Object.assign(image, { alt: name, title: name, loading: 'lazy', decoding: 'async' });
    const restoreToken = () => {
      if (wrapper.dataset.aiconLoadError === 'true') return;
      wrapper.dataset.aiconLoadError = 'true'; wrapper.classList.add('aicon-renderer-icon--error');
      wrapper.title = name + ': image failed to load'; wrapper.replaceChildren(document.createTextNode(originalToken));
      status({ lastImageError: name, lastImageErrorAt: now() });
    };
    image.addEventListener('error', restoreToken, { once: true }); wrapper.appendChild(image);
    getIconBlobUrl(ICONS[name].src).then((blobUrl) => { if (wrapper.dataset.aiconLoadError !== 'true') image.src = blobUrl; }).catch(restoreToken);
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
    status(Object.assign({ loaded: true, lastScanAt: now(), lastScannedRoots: total.scannedRoots, lastFoundTextNodes: total.foundTextNodes, lastReplacedNodes: total.replacedTextNodes, iconSize: CONFIG.iconSize }, loaded ? { loadedAt: now() } : {}), !!loaded);
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
      else for (const node of record.addedNodes) relevant = queue(node) || relevant;
    }
    if (relevant) scheduleScans();
  }
  function start() {
    ensureUI(); record(scanRoots([document.body]), true);
    new MutationObserver(mutations).observe(document.body, { childList: true, subtree: true, characterData: true });
    console.info('[AIcon] semantic renderer loaded:', AGENT_ID, ICON_ROWS.length, 'icons', Object.keys(CATEGORY_ROWS).length, 'categories');
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
