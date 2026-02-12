/**
 * 간단한 SPA 라우터 (함수형)
 */

const BASE_PATH = import.meta.env.PROD ? "/front_6th_chapter1-1" : "";

// --- 상태 (클로저로 유지)
const routes = new Map();
let currentRoute = null;
const subscribers = [];

// --- 구독
const subscribe = (fn) => {
  subscribers.push(fn);
};

const notify = () => {
  subscribers.forEach((fn) => fn());
};

// --- 경로/쿼리 유틸
const getAppPath = (fullPath = window.location.pathname) => {
  return fullPath.startsWith(BASE_PATH) ? fullPath.slice(BASE_PATH.length) || "/" : fullPath;
};

/**
 * 쿼리 파라미터를 객체로 파싱
 * @param {string} search
 * @returns {Object}
 */
const parseQuery = (search = window.location.search) => {
  const params = new URLSearchParams(search);
  const query = {};
  for (const [key, value] of params) {
    query[key] = value;
  }
  return query;
};

/**
 * 객체를 쿼리 문자열로 변환
 * @param {Object} query
 * @returns {string}
 */
const stringifyQuery = (query) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  return params.toString();
};

/**
 * 현재 pathname + 새 쿼리로 URL 생성
 * @param {Object} newQuery
 * @returns {string}
 */
const getUrl = (newQuery) => {
  const currentQuery = parseQuery();
  const updatedQuery = { ...currentQuery, ...newQuery };
  Object.keys(updatedQuery).forEach((key) => {
    if (updatedQuery[key] == null || updatedQuery[key] === "") {
      delete updatedQuery[key];
    }
  });
  const queryString = stringifyQuery(updatedQuery);
  const path = getAppPath();
  return `${BASE_PATH}${path}${queryString ? `?${queryString}` : ""}`;
};

// --- 라우트 매칭
/**
 * path 패턴을 정규식으로 변환 (예: "/product/:id" -> regex + paramNames)
 * @param {string} path
 * @returns {{ regex: RegExp, paramNames: string[] }}
 */
const pathToRegex = (path) => {
  const paramNames = [];
  const regexPath = path
    .replace(/:\w+/g, (match) => {
      paramNames.push(match.slice(1));
      return "([^/]+)";
    })
    .replace(/\//g, "\\/");
  const baseEscaped = BASE_PATH.replace(/\//g, "\\/");
  const regex = new RegExp(`^${baseEscaped}${regexPath}$`);
  return { regex, paramNames };
};

/**
 * 현재 URL에 맞는 라우트 찾기
 * @param {string} url
 * @returns {{ path: string, params: Object, handler: Function } | null}
 */
const findRoute = (url = window.location.pathname) => {
  const pathname = new URL(url, window.location.origin).pathname;
  for (const [routePath, route] of routes) {
    const match = pathname.match(route.regex);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      return {
        path: routePath,
        params,
        handler: route.handler,
      };
    }
  }
  return null;
};

/**
 * 라우트 등록
 * @param {string} path - 경로 패턴 (예: "/product/:id")
 * @param {Function} handler - 라우트 핸들러
 */
const addRoute = (path, handler) => {
  if (routes.has(path)) return;
  const { regex, paramNames } = pathToRegex(path);
  routes.set(path, { regex, paramNames, handler });
};

/**
 * 네비게이션 (pushState)
 * @param {string} url - 이동할 경로
 */
const push = (url) => {
  try {
    const fullUrl = url.startsWith(BASE_PATH) ? url : BASE_PATH + (url.startsWith("/") ? url : "/" + url);
    const prevFull = `${window.location.pathname}${window.location.search}`;
    if (prevFull !== fullUrl) {
      window.history.pushState(null, "", fullUrl);
    }
    currentRoute = findRoute(fullUrl);
    notify();
  } catch (e) {
    console.error("라우터 네비게이션 오류:", e);
  }
};

/**
 * 브라우저 뒤로가기/앞으로가기 시 호출
 */
const onPopState = () => {
  currentRoute = findRoute();
  notify();
};

/**
 * 라우터 시작 (popstate 등록 + 초기 매칭 + 렌더)
 */
const start = () => {
  window.addEventListener("popstate", onPopState);
  currentRoute = findRoute();
  notify();
};

// --- getters
const getRoute = () => currentRoute;
const getTarget = () => currentRoute?.handler ?? null;
const getParams = () => currentRoute?.params ?? {};
const getQuery = () => parseQuery();
const getBaseUrl = () => BASE_PATH;

/**
 * query 객체 설정 (현재 path 유지, 쿼리만 변경 후 push)
 * @param {Object} newQuery
 */
const setQuery = (newQuery) => {
  push(getUrl(newQuery));
};

export {
  addRoute,
  push,
  start,
  subscribe,
  getRoute,
  getTarget,
  getParams,
  getQuery,
  getBaseUrl,
  getAppPath,
  setQuery,
  parseQuery,
  stringifyQuery,
  getUrl,
};
