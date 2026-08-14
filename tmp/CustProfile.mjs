// src/console/CustProfile.tsx
import { useState as useState5, useEffect as useEffect5, useMemo as useMemo4 } from "react";

// node_modules/react-router-dom/dist/index.js
import * as React2 from "react";
import * as ReactDOM from "react-dom";

// node_modules/react-router/dist/index.js
import * as React from "react";

// node_modules/@remix-run/router/dist/router.js
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
var Action;
(function(Action2) {
  Action2["Pop"] = "POP";
  Action2["Push"] = "PUSH";
  Action2["Replace"] = "REPLACE";
})(Action || (Action = {}));
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined") console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
}
function createPath(_ref) {
  let {
    pathname = "/",
    search = "",
    hash = ""
  } = _ref;
  if (search && search !== "?") pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#") pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
function parsePath(path) {
  let parsedPath = {};
  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
    }
    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}
var ResultType;
(function(ResultType2) {
  ResultType2["data"] = "data";
  ResultType2["deferred"] = "deferred";
  ResultType2["redirect"] = "redirect";
  ResultType2["error"] = "error";
})(ResultType || (ResultType = {}));
function convertRouteMatchToUiMatch(match, loaderData) {
  let {
    route,
    pathname,
    params
  } = match;
  return {
    id: route.id,
    pathname,
    params,
    data: loaderData[route.id],
    handle: route.handle
  };
}
function matchPath(pattern, pathname) {
  if (typeof pattern === "string") {
    pattern = {
      path: pattern,
      caseSensitive: false,
      end: true
    };
  }
  let [matcher, compiledParams] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);
  let match = pathname.match(matcher);
  if (!match) return null;
  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params = compiledParams.reduce((memo2, _ref, index) => {
    let {
      paramName,
      isOptional
    } = _ref;
    if (paramName === "*") {
      let splatValue = captureGroups[index] || "";
      pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
    }
    const value = captureGroups[index];
    if (isOptional && !value) {
      memo2[paramName] = void 0;
    } else {
      memo2[paramName] = (value || "").replace(/%2F/g, "/");
    }
    return memo2;
  }, {});
  return {
    params,
    pathname: matchedPathname,
    pathnameBase,
    pattern
  };
}
function compilePath(path, caseSensitive, end) {
  if (caseSensitive === void 0) {
    caseSensitive = false;
  }
  if (end === void 0) {
    end = true;
  }
  warning(path === "*" || !path.endsWith("*") || path.endsWith("/*"), 'Route path "' + path + '" will be treated as if it were ' + ('"' + path.replace(/\*$/, "/*") + '" because the `*` character must ') + "always follow a `/` in the pattern. To get rid of this warning, " + ('please change the route path to "' + path.replace(/\*$/, "/*") + '".'));
  let params = [];
  let regexpSource = "^" + path.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (_, paramName, isOptional) => {
    params.push({
      paramName,
      isOptional: isOptional != null
    });
    return isOptional ? "/?([^\\/]+)?" : "/([^\\/]+)";
  });
  if (path.endsWith("*")) {
    params.push({
      paramName: "*"
    });
    regexpSource += path === "*" || path === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$";
  } else if (end) {
    regexpSource += "\\/*$";
  } else if (path !== "" && path !== "/") {
    regexpSource += "(?:(?=\\/|$))";
  } else ;
  let matcher = new RegExp(regexpSource, caseSensitive ? void 0 : "i");
  return [matcher, params];
}
function stripBasename(pathname, basename) {
  if (basename === "/") return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    return null;
  }
  return pathname.slice(startIndex) || "/";
}
var ABSOLUTE_URL_REGEX$1 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
var isAbsoluteUrl = (url) => ABSOLUTE_URL_REGEX$1.test(url);
function resolvePath(to, fromPathname) {
  if (fromPathname === void 0) {
    fromPathname = "/";
  }
  let {
    pathname: toPathname,
    search = "",
    hash = ""
  } = typeof to === "string" ? parsePath(to) : to;
  let pathname;
  if (toPathname) {
    if (isAbsoluteUrl(toPathname)) {
      pathname = toPathname;
    } else {
      if (toPathname.includes("//")) {
        let oldPathname = toPathname;
        toPathname = removeDoubleSlashes(toPathname);
        warning(false, "Pathnames cannot have embedded double slashes - normalizing " + (oldPathname + " -> " + toPathname));
      }
      if (toPathname.startsWith("/")) {
        pathname = resolvePathname(toPathname.substring(1), "/");
      } else {
        pathname = resolvePathname(toPathname, fromPathname);
      }
    }
  } else {
    pathname = fromPathname;
  }
  return {
    pathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash)
  };
}
function resolvePathname(relativePath, fromPathname) {
  let segments = fromPathname.replace(/\/+$/, "").split("/");
  let relativeSegments = relativePath.split("/");
  relativeSegments.forEach((segment) => {
    if (segment === "..") {
      if (segments.length > 1) segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });
  return segments.length > 1 ? segments.join("/") : "/";
}
function getInvalidPathError(char, field, dest, path) {
  return "Cannot include a '" + char + "' character in a manually specified " + ("`to." + field + "` field [" + JSON.stringify(path) + "].  Please separate it out to the ") + ("`to." + dest + "` field. Alternatively you may provide the full path as ") + 'a string in <Link to="..."> and the router will parse it for you.';
}
function getPathContributingMatches(matches) {
  return matches.filter((match, index) => index === 0 || match.route.path && match.route.path.length > 0);
}
function getResolveToMatches(matches, v7_relativeSplatPath) {
  let pathMatches = getPathContributingMatches(matches);
  if (v7_relativeSplatPath) {
    return pathMatches.map((match, idx) => idx === pathMatches.length - 1 ? match.pathname : match.pathnameBase);
  }
  return pathMatches.map((match) => match.pathnameBase);
}
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative) {
  if (isPathRelative === void 0) {
    isPathRelative = false;
  }
  let to;
  if (typeof toArg === "string") {
    to = parsePath(toArg);
  } else {
    to = _extends({}, toArg);
    invariant(!to.pathname || !to.pathname.includes("?"), getInvalidPathError("?", "pathname", "search", to));
    invariant(!to.pathname || !to.pathname.includes("#"), getInvalidPathError("#", "pathname", "hash", to));
    invariant(!to.search || !to.search.includes("#"), getInvalidPathError("#", "search", "hash", to));
  }
  let isEmptyPath = toArg === "" || to.pathname === "";
  let toPathname = isEmptyPath ? "/" : to.pathname;
  let from;
  if (toPathname == null) {
    from = locationPathname;
  } else {
    let routePathnameIndex = routePathnames.length - 1;
    if (!isPathRelative && toPathname.startsWith("..")) {
      let toSegments = toPathname.split("/");
      while (toSegments[0] === "..") {
        toSegments.shift();
        routePathnameIndex -= 1;
      }
      to.pathname = toSegments.join("/");
    }
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
  }
  let path = resolvePath(to, from);
  let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
  let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
  if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) {
    path.pathname += "/";
  }
  return path;
}
var removeDoubleSlashes = (path) => path.replace(/\/\/+/g, "/");
var joinPaths = (paths) => removeDoubleSlashes(paths.join("/"));
var normalizeSearch = (search) => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
var normalizeHash = (hash) => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;
var validMutationMethodsArr = ["post", "put", "patch", "delete"];
var validMutationMethods = new Set(validMutationMethodsArr);
var validRequestMethodsArr = ["get", ...validMutationMethodsArr];
var validRequestMethods = new Set(validRequestMethodsArr);
var UNSAFE_DEFERRED_SYMBOL = Symbol("deferred");

// node_modules/react-router/dist/index.js
function _extends2() {
  return _extends2 = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends2.apply(null, arguments);
}
var DataRouterContext = /* @__PURE__ */ React.createContext(null);
if (true) {
  DataRouterContext.displayName = "DataRouter";
}
var DataRouterStateContext = /* @__PURE__ */ React.createContext(null);
if (true) {
  DataRouterStateContext.displayName = "DataRouterState";
}
var AwaitContext = /* @__PURE__ */ React.createContext(null);
if (true) {
  AwaitContext.displayName = "Await";
}
var NavigationContext = /* @__PURE__ */ React.createContext(null);
if (true) {
  NavigationContext.displayName = "Navigation";
}
var LocationContext = /* @__PURE__ */ React.createContext(null);
if (true) {
  LocationContext.displayName = "Location";
}
var RouteContext = /* @__PURE__ */ React.createContext({
  outlet: null,
  matches: [],
  isDataRoute: false
});
if (true) {
  RouteContext.displayName = "Route";
}
var RouteErrorContext = /* @__PURE__ */ React.createContext(null);
if (true) {
  RouteErrorContext.displayName = "RouteError";
}
function useHref(to, _temp) {
  let {
    relative
  } = _temp === void 0 ? {} : _temp;
  !useInRouterContext() ? true ? invariant(
    false,
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useHref() may be used only in the context of a <Router> component."
  ) : invariant(false) : void 0;
  let {
    basename,
    navigator
  } = React.useContext(NavigationContext);
  let {
    hash,
    pathname,
    search
  } = useResolvedPath(to, {
    relative
  });
  let joinedPathname = pathname;
  if (basename !== "/") {
    joinedPathname = pathname === "/" ? basename : joinPaths([basename, pathname]);
  }
  return navigator.createHref({
    pathname: joinedPathname,
    search,
    hash
  });
}
function useInRouterContext() {
  return React.useContext(LocationContext) != null;
}
function useLocation() {
  !useInRouterContext() ? true ? invariant(
    false,
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useLocation() may be used only in the context of a <Router> component."
  ) : invariant(false) : void 0;
  return React.useContext(LocationContext).location;
}
var navigateEffectWarning = "You should call navigate() in a React.useEffect(), not when your component is first rendered.";
function useIsomorphicLayoutEffect(cb) {
  let isStatic = React.useContext(NavigationContext).static;
  if (!isStatic) {
    React.useLayoutEffect(cb);
  }
}
function useNavigate() {
  let {
    isDataRoute
  } = React.useContext(RouteContext);
  return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}
function useNavigateUnstable() {
  !useInRouterContext() ? true ? invariant(
    false,
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useNavigate() may be used only in the context of a <Router> component."
  ) : invariant(false) : void 0;
  let dataRouterContext = React.useContext(DataRouterContext);
  let {
    basename,
    future,
    navigator
  } = React.useContext(NavigationContext);
  let {
    matches
  } = React.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches, future.v7_relativeSplatPath));
  let activeRef = React.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = React.useCallback(function(to, options) {
    if (options === void 0) {
      options = {};
    }
    true ? warning(activeRef.current, navigateEffectWarning) : void 0;
    if (!activeRef.current) return;
    if (typeof to === "number") {
      navigator.go(to);
      return;
    }
    let path = resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, options.relative === "path");
    if (dataRouterContext == null && basename !== "/") {
      path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
    }
    (!!options.replace ? navigator.replace : navigator.push)(path, options.state, options);
  }, [basename, navigator, routePathnamesJson, locationPathname, dataRouterContext]);
  return navigate;
}
function useResolvedPath(to, _temp2) {
  let {
    relative
  } = _temp2 === void 0 ? {} : _temp2;
  let {
    future
  } = React.useContext(NavigationContext);
  let {
    matches
  } = React.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches, future.v7_relativeSplatPath));
  return React.useMemo(() => resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, relative === "path"), [to, routePathnamesJson, locationPathname, relative]);
}
var DataRouterHook = /* @__PURE__ */ function(DataRouterHook3) {
  DataRouterHook3["UseBlocker"] = "useBlocker";
  DataRouterHook3["UseRevalidator"] = "useRevalidator";
  DataRouterHook3["UseNavigateStable"] = "useNavigate";
  return DataRouterHook3;
}(DataRouterHook || {});
var DataRouterStateHook = /* @__PURE__ */ function(DataRouterStateHook3) {
  DataRouterStateHook3["UseBlocker"] = "useBlocker";
  DataRouterStateHook3["UseLoaderData"] = "useLoaderData";
  DataRouterStateHook3["UseActionData"] = "useActionData";
  DataRouterStateHook3["UseRouteError"] = "useRouteError";
  DataRouterStateHook3["UseNavigation"] = "useNavigation";
  DataRouterStateHook3["UseRouteLoaderData"] = "useRouteLoaderData";
  DataRouterStateHook3["UseMatches"] = "useMatches";
  DataRouterStateHook3["UseRevalidator"] = "useRevalidator";
  DataRouterStateHook3["UseNavigateStable"] = "useNavigate";
  DataRouterStateHook3["UseRouteId"] = "useRouteId";
  return DataRouterStateHook3;
}(DataRouterStateHook || {});
function getDataRouterConsoleError(hookName) {
  return hookName + " must be used within a data router.  See https://reactrouter.com/v6/routers/picking-a-router.";
}
function useDataRouterContext(hookName) {
  let ctx = React.useContext(DataRouterContext);
  !ctx ? true ? invariant(false, getDataRouterConsoleError(hookName)) : invariant(false) : void 0;
  return ctx;
}
function useDataRouterState(hookName) {
  let state = React.useContext(DataRouterStateContext);
  !state ? true ? invariant(false, getDataRouterConsoleError(hookName)) : invariant(false) : void 0;
  return state;
}
function useRouteContext(hookName) {
  let route = React.useContext(RouteContext);
  !route ? true ? invariant(false, getDataRouterConsoleError(hookName)) : invariant(false) : void 0;
  return route;
}
function useCurrentRouteId(hookName) {
  let route = useRouteContext(hookName);
  let thisRoute = route.matches[route.matches.length - 1];
  !thisRoute.route.id ? true ? invariant(false, hookName + ' can only be used on routes that contain a unique "id"') : invariant(false) : void 0;
  return thisRoute.route.id;
}
function useRouteId() {
  return useCurrentRouteId(DataRouterStateHook.UseRouteId);
}
function useNavigation() {
  let state = useDataRouterState(DataRouterStateHook.UseNavigation);
  return state.navigation;
}
function useMatches() {
  let {
    matches,
    loaderData
  } = useDataRouterState(DataRouterStateHook.UseMatches);
  return React.useMemo(() => matches.map((m) => convertRouteMatchToUiMatch(m, loaderData)), [matches, loaderData]);
}
function useNavigateStable() {
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseNavigateStable);
  let id = useCurrentRouteId(DataRouterStateHook.UseNavigateStable);
  let activeRef = React.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = React.useCallback(function(to, options) {
    if (options === void 0) {
      options = {};
    }
    true ? warning(activeRef.current, navigateEffectWarning) : void 0;
    if (!activeRef.current) return;
    if (typeof to === "number") {
      router.navigate(to);
    } else {
      router.navigate(to, _extends2({
        fromRouteId: id
      }, options));
    }
  }, [router, id]);
  return navigate;
}
var alreadyWarned = {};
function warnOnce(key, message) {
  if (!alreadyWarned[message]) {
    alreadyWarned[message] = true;
    console.warn(message);
  }
}
var logDeprecation = (flag, msg, link) => warnOnce(flag, "\u26A0\uFE0F React Router Future Flag Warning: " + msg + ". " + ("You can use the `" + flag + "` future flag to opt-in early. ") + ("For more information, see " + link + "."));
function logV6DeprecationWarnings(renderFuture, routerFuture) {
  if ((renderFuture == null ? void 0 : renderFuture.v7_startTransition) === void 0) {
    logDeprecation("v7_startTransition", "React Router will begin wrapping state updates in `React.startTransition` in v7", "https://reactrouter.com/v6/upgrading/future#v7_starttransition");
  }
  if ((renderFuture == null ? void 0 : renderFuture.v7_relativeSplatPath) === void 0 && (!routerFuture || routerFuture.v7_relativeSplatPath === void 0)) {
    logDeprecation("v7_relativeSplatPath", "Relative route resolution within Splat routes is changing in v7", "https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath");
  }
  if (routerFuture) {
    if (routerFuture.v7_fetcherPersist === void 0) {
      logDeprecation("v7_fetcherPersist", "The persistence behavior of fetchers is changing in v7", "https://reactrouter.com/v6/upgrading/future#v7_fetcherpersist");
    }
    if (routerFuture.v7_normalizeFormMethod === void 0) {
      logDeprecation("v7_normalizeFormMethod", "Casing of `formMethod` fields is being normalized to uppercase in v7", "https://reactrouter.com/v6/upgrading/future#v7_normalizeformmethod");
    }
    if (routerFuture.v7_partialHydration === void 0) {
      logDeprecation("v7_partialHydration", "`RouterProvider` hydration behavior is changing in v7", "https://reactrouter.com/v6/upgrading/future#v7_partialhydration");
    }
    if (routerFuture.v7_skipActionErrorRevalidation === void 0) {
      logDeprecation("v7_skipActionErrorRevalidation", "The revalidation behavior after 4xx/5xx `action` responses is changing in v7", "https://reactrouter.com/v6/upgrading/future#v7_skipactionerrorrevalidation");
    }
  }
}
var START_TRANSITION = "startTransition";
var startTransitionImpl = React[START_TRANSITION];
function Router(_ref5) {
  let {
    basename: basenameProp = "/",
    children = null,
    location: locationProp,
    navigationType = Action.Pop,
    navigator,
    static: staticProp = false,
    future
  } = _ref5;
  !!useInRouterContext() ? true ? invariant(false, "You cannot render a <Router> inside another <Router>. You should never have more than one in your app.") : invariant(false) : void 0;
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = React.useMemo(() => ({
    basename,
    navigator,
    static: staticProp,
    future: _extends2({
      v7_relativeSplatPath: false
    }, future)
  }), [basename, future, navigator, staticProp]);
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }
  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default"
  } = locationProp;
  let locationContext = React.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);
    if (trailingPathname == null) {
      return null;
    }
    return {
      location: {
        pathname: trailingPathname,
        search,
        hash,
        state,
        key
      },
      navigationType
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);
  true ? warning(locationContext != null, '<Router basename="' + basename + '"> is not able to match the URL ' + ('"' + pathname + search + hash + '" because it does not start with the ') + "basename, so the <Router> won't render anything.") : void 0;
  if (locationContext == null) {
    return null;
  }
  return /* @__PURE__ */ React.createElement(NavigationContext.Provider, {
    value: navigationContext
  }, /* @__PURE__ */ React.createElement(LocationContext.Provider, {
    children,
    value: locationContext
  }));
}
var neverSettledPromise = new Promise(() => {
});

// node_modules/react-router-dom/dist/index.js
function _extends3() {
  return _extends3 = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends3.apply(null, arguments);
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}
var defaultMethod = "get";
var defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
  return object != null && typeof object.tagName === "string";
}
function isButtonElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && // Ignore everything but left clicks
  (!target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event);
}
function createSearchParams(init) {
  if (init === void 0) {
    init = "";
  }
  return new URLSearchParams(typeof init === "string" || Array.isArray(init) || init instanceof URLSearchParams ? init : Object.keys(init).reduce((memo2, key) => {
    let value = init[key];
    return memo2.concat(Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]);
  }, []));
}
function getSearchParamsForLocation(locationSearch, defaultSearchParams) {
  let searchParams = createSearchParams(locationSearch);
  if (defaultSearchParams) {
    defaultSearchParams.forEach((_, key) => {
      if (!searchParams.has(key)) {
        defaultSearchParams.getAll(key).forEach((value) => {
          searchParams.append(key, value);
        });
      }
    });
  }
  return searchParams;
}
var _formDataSupportsSubmitter = null;
function isFormDataSubmitterSupported() {
  if (_formDataSupportsSubmitter === null) {
    try {
      new FormData(
        document.createElement("form"),
        // @ts-expect-error if FormData supports the submitter parameter, this will throw
        0
      );
      _formDataSupportsSubmitter = false;
    } catch (e) {
      _formDataSupportsSubmitter = true;
    }
  }
  return _formDataSupportsSubmitter;
}
var supportedFormEncTypes = /* @__PURE__ */ new Set(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]);
function getFormEncType(encType) {
  if (encType != null && !supportedFormEncTypes.has(encType)) {
    true ? warning(false, '"' + encType + '" is not a valid `encType` for `<Form>`/`<fetcher.Form>` ' + ('and will default to "' + defaultEncType + '"')) : void 0;
    return null;
  }
  return encType;
}
function getFormSubmissionInfo(target, basename) {
  let method;
  let action;
  let encType;
  let formData;
  let body;
  if (isFormElement(target)) {
    let attr = target.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(target);
  } else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
    let form = target.form;
    if (form == null) {
      throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');
    }
    let attr = target.getAttribute("formaction") || form.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(form, target);
    if (!isFormDataSubmitterSupported()) {
      let {
        name,
        type,
        value
      } = target;
      if (type === "image") {
        let prefix = name ? name + "." : "";
        formData.append(prefix + "x", "0");
        formData.append(prefix + "y", "0");
      } else if (name) {
        formData.append(name, value);
      }
    }
  } else if (isHtmlElement(target)) {
    throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');
  } else {
    method = defaultMethod;
    action = null;
    encType = defaultEncType;
    body = target;
  }
  if (formData && encType === "text/plain") {
    body = formData;
    formData = void 0;
  }
  return {
    action,
    method: method.toLowerCase(),
    encType,
    formData,
    body
  };
}
var _excluded = ["onClick", "relative", "reloadDocument", "replace", "state", "target", "to", "preventScrollReset", "viewTransition"];
var _excluded2 = ["aria-current", "caseSensitive", "className", "end", "style", "to", "viewTransition", "children"];
var _excluded3 = ["fetcherKey", "navigate", "reloadDocument", "replace", "state", "method", "action", "onSubmit", "relative", "preventScrollReset", "viewTransition"];
var REACT_ROUTER_VERSION = "6";
try {
  window.__reactRouterVersion = REACT_ROUTER_VERSION;
} catch (e) {
}
var ViewTransitionContext = /* @__PURE__ */ React2.createContext({
  isTransitioning: false
});
if (true) {
  ViewTransitionContext.displayName = "ViewTransition";
}
var FetchersContext = /* @__PURE__ */ React2.createContext(/* @__PURE__ */ new Map());
if (true) {
  FetchersContext.displayName = "Fetchers";
}
var START_TRANSITION2 = "startTransition";
var startTransitionImpl2 = React2[START_TRANSITION2];
var FLUSH_SYNC = "flushSync";
var flushSyncImpl = ReactDOM[FLUSH_SYNC];
var USE_ID = "useId";
var useIdImpl = React2[USE_ID];
function HistoryRouter(_ref6) {
  let {
    basename,
    children,
    future,
    history
  } = _ref6;
  let [state, setStateImpl] = React2.useState({
    action: history.action,
    location: history.location
  });
  let {
    v7_startTransition
  } = future || {};
  let setState = React2.useCallback((newState) => {
    v7_startTransition && startTransitionImpl2 ? startTransitionImpl2(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  React2.useLayoutEffect(() => history.listen(setState), [history, setState]);
  React2.useEffect(() => logV6DeprecationWarnings(future), [future]);
  return /* @__PURE__ */ React2.createElement(Router, {
    basename,
    children,
    location: state.location,
    navigationType: state.action,
    navigator: history,
    future
  });
}
if (true) {
  HistoryRouter.displayName = "unstable_HistoryRouter";
}
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
var ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
var Link = /* @__PURE__ */ React2.forwardRef(function LinkWithRef(_ref7, ref) {
  let {
    onClick,
    relative,
    reloadDocument,
    replace: replace2,
    state,
    target,
    to,
    preventScrollReset,
    viewTransition
  } = _ref7, rest = _objectWithoutPropertiesLoose(_ref7, _excluded);
  let {
    basename
  } = React2.useContext(NavigationContext);
  let absoluteHref;
  let isExternal = false;
  if (typeof to === "string" && ABSOLUTE_URL_REGEX.test(to)) {
    absoluteHref = to;
    if (isBrowser) {
      try {
        let currentUrl = new URL(window.location.href);
        let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
        let path = stripBasename(targetUrl.pathname, basename);
        if (targetUrl.origin === currentUrl.origin && path != null) {
          to = path + targetUrl.search + targetUrl.hash;
        } else {
          isExternal = true;
        }
      } catch (e) {
        true ? warning(false, '<Link to="' + to + '"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.') : void 0;
      }
    }
  }
  let href = useHref(to, {
    relative
  });
  let internalOnClick = useLinkClickHandler(to, {
    replace: replace2,
    state,
    target,
    preventScrollReset,
    relative,
    viewTransition
  });
  function handleClick(event) {
    if (onClick) onClick(event);
    if (!event.defaultPrevented) {
      internalOnClick(event);
    }
  }
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    /* @__PURE__ */ React2.createElement("a", _extends3({}, rest, {
      href: absoluteHref || href,
      onClick: isExternal || reloadDocument ? onClick : handleClick,
      ref,
      target
    }))
  );
});
if (true) {
  Link.displayName = "Link";
}
var NavLink = /* @__PURE__ */ React2.forwardRef(function NavLinkWithRef(_ref8, ref) {
  let {
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    className: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    viewTransition,
    children
  } = _ref8, rest = _objectWithoutPropertiesLoose(_ref8, _excluded2);
  let path = useResolvedPath(to, {
    relative: rest.relative
  });
  let location = useLocation();
  let routerState = React2.useContext(DataRouterStateContext);
  let {
    navigator,
    basename
  } = React2.useContext(NavigationContext);
  let isTransitioning = routerState != null && // Conditional usage is OK here because the usage of a data router is static
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useViewTransitionState(path) && viewTransition === true;
  let toPathname = navigator.encodeLocation ? navigator.encodeLocation(path).pathname : path.pathname;
  let locationPathname = location.pathname;
  let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
  if (!caseSensitive) {
    locationPathname = locationPathname.toLowerCase();
    nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
    toPathname = toPathname.toLowerCase();
  }
  if (nextLocationPathname && basename) {
    nextLocationPathname = stripBasename(nextLocationPathname, basename) || nextLocationPathname;
  }
  const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
  let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
  let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
  let renderProps = {
    isActive,
    isPending,
    isTransitioning
  };
  let ariaCurrent = isActive ? ariaCurrentProp : void 0;
  let className;
  if (typeof classNameProp === "function") {
    className = classNameProp(renderProps);
  } else {
    className = [classNameProp, isActive ? "active" : null, isPending ? "pending" : null, isTransitioning ? "transitioning" : null].filter(Boolean).join(" ");
  }
  let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
  return /* @__PURE__ */ React2.createElement(Link, _extends3({}, rest, {
    "aria-current": ariaCurrent,
    className,
    ref,
    style,
    to,
    viewTransition
  }), typeof children === "function" ? children(renderProps) : children);
});
if (true) {
  NavLink.displayName = "NavLink";
}
var Form = /* @__PURE__ */ React2.forwardRef((_ref9, forwardedRef) => {
  let {
    fetcherKey,
    navigate,
    reloadDocument,
    replace: replace2,
    state,
    method = defaultMethod,
    action,
    onSubmit,
    relative,
    preventScrollReset,
    viewTransition
  } = _ref9, props = _objectWithoutPropertiesLoose(_ref9, _excluded3);
  let submit = useSubmit();
  let formAction = useFormAction(action, {
    relative
  });
  let formMethod = method.toLowerCase() === "get" ? "get" : "post";
  let submitHandler = (event) => {
    onSubmit && onSubmit(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    let submitter = event.nativeEvent.submitter;
    let submitMethod = (submitter == null ? void 0 : submitter.getAttribute("formmethod")) || method;
    submit(submitter || event.currentTarget, {
      fetcherKey,
      method: submitMethod,
      navigate,
      replace: replace2,
      state,
      relative,
      preventScrollReset,
      viewTransition
    });
  };
  return /* @__PURE__ */ React2.createElement("form", _extends3({
    ref: forwardedRef,
    method: formMethod,
    action: formAction,
    onSubmit: reloadDocument ? onSubmit : submitHandler
  }, props));
});
if (true) {
  Form.displayName = "Form";
}
function ScrollRestoration(_ref0) {
  let {
    getKey,
    storageKey
  } = _ref0;
  useScrollRestoration({
    getKey,
    storageKey
  });
  return null;
}
if (true) {
  ScrollRestoration.displayName = "ScrollRestoration";
}
var DataRouterHook2;
(function(DataRouterHook3) {
  DataRouterHook3["UseScrollRestoration"] = "useScrollRestoration";
  DataRouterHook3["UseSubmit"] = "useSubmit";
  DataRouterHook3["UseSubmitFetcher"] = "useSubmitFetcher";
  DataRouterHook3["UseFetcher"] = "useFetcher";
  DataRouterHook3["useViewTransitionState"] = "useViewTransitionState";
})(DataRouterHook2 || (DataRouterHook2 = {}));
var DataRouterStateHook2;
(function(DataRouterStateHook3) {
  DataRouterStateHook3["UseFetcher"] = "useFetcher";
  DataRouterStateHook3["UseFetchers"] = "useFetchers";
  DataRouterStateHook3["UseScrollRestoration"] = "useScrollRestoration";
})(DataRouterStateHook2 || (DataRouterStateHook2 = {}));
function getDataRouterConsoleError2(hookName) {
  return hookName + " must be used within a data router.  See https://reactrouter.com/v6/routers/picking-a-router.";
}
function useDataRouterContext2(hookName) {
  let ctx = React2.useContext(DataRouterContext);
  !ctx ? true ? invariant(false, getDataRouterConsoleError2(hookName)) : invariant(false) : void 0;
  return ctx;
}
function useDataRouterState2(hookName) {
  let state = React2.useContext(DataRouterStateContext);
  !state ? true ? invariant(false, getDataRouterConsoleError2(hookName)) : invariant(false) : void 0;
  return state;
}
function useLinkClickHandler(to, _temp) {
  let {
    target,
    replace: replaceProp,
    state,
    preventScrollReset,
    relative,
    viewTransition
  } = _temp === void 0 ? {} : _temp;
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, {
    relative
  });
  return React2.useCallback((event) => {
    if (shouldProcessLinkClick(event, target)) {
      event.preventDefault();
      let replace2 = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
      navigate(to, {
        replace: replace2,
        state,
        preventScrollReset,
        relative,
        viewTransition
      });
    }
  }, [location, navigate, path, replaceProp, state, target, to, preventScrollReset, relative, viewTransition]);
}
function useSearchParams(defaultInit) {
  true ? warning(typeof URLSearchParams !== "undefined", "You cannot use the `useSearchParams` hook in a browser that does not support the URLSearchParams API. If you need to support Internet Explorer 11, we recommend you load a polyfill such as https://github.com/ungap/url-search-params.") : void 0;
  let defaultSearchParamsRef = React2.useRef(createSearchParams(defaultInit));
  let hasSetSearchParamsRef = React2.useRef(false);
  let location = useLocation();
  let searchParams = React2.useMemo(() => (
    // Only merge in the defaults if we haven't yet called setSearchParams.
    // Once we call that we want those to take precedence, otherwise you can't
    // remove a param with setSearchParams({}) if it has an initial value
    getSearchParamsForLocation(location.search, hasSetSearchParamsRef.current ? null : defaultSearchParamsRef.current)
  ), [location.search]);
  let navigate = useNavigate();
  let setSearchParams = React2.useCallback((nextInit, navigateOptions) => {
    const newSearchParams = createSearchParams(typeof nextInit === "function" ? nextInit(searchParams) : nextInit);
    hasSetSearchParamsRef.current = true;
    navigate("?" + newSearchParams, navigateOptions);
  }, [navigate, searchParams]);
  return [searchParams, setSearchParams];
}
function validateClientSideSubmission() {
  if (typeof document === "undefined") {
    throw new Error("You are calling submit during the server render. Try calling submit within a `useEffect` or callback instead.");
  }
}
var fetcherId = 0;
var getUniqueFetcherId = () => "__" + String(++fetcherId) + "__";
function useSubmit() {
  let {
    router
  } = useDataRouterContext2(DataRouterHook2.UseSubmit);
  let {
    basename
  } = React2.useContext(NavigationContext);
  let currentRouteId = useRouteId();
  return React2.useCallback(function(target, options) {
    if (options === void 0) {
      options = {};
    }
    validateClientSideSubmission();
    let {
      action,
      method,
      encType,
      formData,
      body
    } = getFormSubmissionInfo(target, basename);
    if (options.navigate === false) {
      let key = options.fetcherKey || getUniqueFetcherId();
      router.fetch(key, currentRouteId, options.action || action, {
        preventScrollReset: options.preventScrollReset,
        formData,
        body,
        formMethod: options.method || method,
        formEncType: options.encType || encType,
        flushSync: options.flushSync
      });
    } else {
      router.navigate(options.action || action, {
        preventScrollReset: options.preventScrollReset,
        formData,
        body,
        formMethod: options.method || method,
        formEncType: options.encType || encType,
        replace: options.replace,
        state: options.state,
        fromRouteId: currentRouteId,
        flushSync: options.flushSync,
        viewTransition: options.viewTransition
      });
    }
  }, [router, basename, currentRouteId]);
}
function useFormAction(action, _temp2) {
  let {
    relative
  } = _temp2 === void 0 ? {} : _temp2;
  let {
    basename
  } = React2.useContext(NavigationContext);
  let routeContext = React2.useContext(RouteContext);
  !routeContext ? true ? invariant(false, "useFormAction must be used inside a RouteContext") : invariant(false) : void 0;
  let [match] = routeContext.matches.slice(-1);
  let path = _extends3({}, useResolvedPath(action ? action : ".", {
    relative
  }));
  let location = useLocation();
  if (action == null) {
    path.search = location.search;
    let params = new URLSearchParams(path.search);
    let indexValues = params.getAll("index");
    let hasNakedIndexParam = indexValues.some((v) => v === "");
    if (hasNakedIndexParam) {
      params.delete("index");
      indexValues.filter((v) => v).forEach((v) => params.append("index", v));
      let qs = params.toString();
      path.search = qs ? "?" + qs : "";
    }
  }
  if ((!action || action === ".") && match.route.index) {
    path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
  }
  if (basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }
  return createPath(path);
}
var SCROLL_RESTORATION_STORAGE_KEY = "react-router-scroll-positions";
var savedScrollPositions = {};
function useScrollRestoration(_temp4) {
  let {
    getKey,
    storageKey
  } = _temp4 === void 0 ? {} : _temp4;
  let {
    router
  } = useDataRouterContext2(DataRouterHook2.UseScrollRestoration);
  let {
    restoreScrollPosition,
    preventScrollReset
  } = useDataRouterState2(DataRouterStateHook2.UseScrollRestoration);
  let {
    basename
  } = React2.useContext(NavigationContext);
  let location = useLocation();
  let matches = useMatches();
  let navigation = useNavigation();
  React2.useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);
  usePageHide(React2.useCallback(() => {
    if (navigation.state === "idle") {
      let key = (getKey ? getKey(location, matches) : null) || location.key;
      savedScrollPositions[key] = window.scrollY;
    }
    try {
      sessionStorage.setItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY, JSON.stringify(savedScrollPositions));
    } catch (error) {
      true ? warning(false, "Failed to save scroll positions in sessionStorage, <ScrollRestoration /> will not work properly (" + error + ").") : void 0;
    }
    window.history.scrollRestoration = "auto";
  }, [storageKey, getKey, navigation.state, location, matches]));
  if (typeof document !== "undefined") {
    React2.useLayoutEffect(() => {
      try {
        let sessionPositions = sessionStorage.getItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY);
        if (sessionPositions) {
          savedScrollPositions = JSON.parse(sessionPositions);
        }
      } catch (e) {
      }
    }, [storageKey]);
    React2.useLayoutEffect(() => {
      let getKeyWithoutBasename = getKey && basename !== "/" ? (location2, matches2) => getKey(
        // Strip the basename to match useLocation()
        _extends3({}, location2, {
          pathname: stripBasename(location2.pathname, basename) || location2.pathname
        }),
        matches2
      ) : getKey;
      let disableScrollRestoration = router == null ? void 0 : router.enableScrollRestoration(savedScrollPositions, () => window.scrollY, getKeyWithoutBasename);
      return () => disableScrollRestoration && disableScrollRestoration();
    }, [router, basename, getKey]);
    React2.useLayoutEffect(() => {
      if (restoreScrollPosition === false) {
        return;
      }
      if (typeof restoreScrollPosition === "number") {
        window.scrollTo(0, restoreScrollPosition);
        return;
      }
      if (location.hash) {
        let el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (el) {
          el.scrollIntoView();
          return;
        }
      }
      if (preventScrollReset === true) {
        return;
      }
      window.scrollTo(0, 0);
    }, [location, restoreScrollPosition, preventScrollReset]);
  }
}
function usePageHide(callback, options) {
  let {
    capture
  } = options || {};
  React2.useEffect(() => {
    let opts = capture != null ? {
      capture
    } : void 0;
    window.addEventListener("pagehide", callback, opts);
    return () => {
      window.removeEventListener("pagehide", callback, opts);
    };
  }, [callback, capture]);
}
function useViewTransitionState(to, opts) {
  if (opts === void 0) {
    opts = {};
  }
  let vtContext = React2.useContext(ViewTransitionContext);
  !(vtContext != null) ? true ? invariant(false, "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?") : invariant(false) : void 0;
  let {
    basename
  } = useDataRouterContext2(DataRouterHook2.useViewTransitionState);
  let path = useResolvedPath(to, {
    relative: opts.relative
  });
  if (!vtContext.isTransitioning) {
    return false;
  }
  let currentPath = stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
  let nextPath = stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
  return matchPath(path.pathname, nextPath) != null || matchPath(path.pathname, currentPath) != null;
}

// src/components/ui.tsx
import { useState as useState3, useRef as useRef3, useEffect as useEffect3, useLayoutEffect as useLayoutEffect3 } from "react";
import { createPortal } from "react-dom";

// src/console/sourceTagConfig.ts
import { useSyncExternalStore } from "react";
var showSourceTags = true;
var listeners = /* @__PURE__ */ new Set();
function emit() {
  listeners.forEach((l) => l());
}
function loadFromDisk() {
  fetch("/api/load-source-tag").then((r) => r.ok ? r.json() : null).then((data2) => {
    if (data2 && typeof data2.showSourceTags === "boolean") {
      if (data2.showSourceTags !== showSourceTags) {
        showSourceTags = data2.showSourceTags;
        emit();
      }
    } else {
      saveToDisk(true);
    }
  }).catch(() => {
  });
}
function saveToDisk(v) {
  fetch("/api/save-source-tag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ showSourceTags: v })
  }).catch(() => {
  });
}
loadFromDisk();
function getShowSourceTags() {
  return showSourceTags;
}
function subscribe(cb) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function useShowSourceTags() {
  return useSyncExternalStore(subscribe, getShowSourceTags, getShowSourceTags);
}

// src/console/SourceTag.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var tagS = {
  display: "inline-block",
  fontSize: 9,
  fontFamily: "monospace",
  padding: "0 3px",
  borderRadius: 2,
  marginLeft: 3,
  verticalAlign: "middle",
  lineHeight: "14px",
  fontWeight: 400,
  whiteSpace: "nowrap"
};
var KIND_META = {
  cfg: { label: "\u914D\u7F6EJSON", bg: "#DBEAFE", fg: "#1D4ED8", bd: "#93C5FD" },
  sample: { label: "\u6837\u4F8BJSON", bg: "#FFF7ED", fg: "#C2410C", bd: "#FDBA74" },
  calc: { label: "\u5B9E\u65F6\u8BA1\u7B97", bg: "#F3F4F6", fg: "#6B7280", bd: "#D1D5DB" }
};
function SourceTag({ kind, label, value }) {
  if (!useShowSourceTags()) return null;
  const m = KIND_META[kind];
  const showLabel = label && label !== m.label ? `\xB7${label}` : "";
  const text = `${m.label}${showLabel}${value !== void 0 ? `:${value}` : ""}`;
  return /* @__PURE__ */ jsx(
    "span",
    {
      style: {
        ...tagS,
        background: m.bg,
        color: m.fg,
        border: `1px solid ${m.bd}`
      },
      title: `\u6570\u636E\u6765\u6E90\uFF1A${m.label}${showLabel}`,
      children: text
    }
  );
}
var Cfg = (props) => /* @__PURE__ */ jsx(SourceTag, { kind: "cfg", ...props });
var Sam = (props) => /* @__PURE__ */ jsx(SourceTag, { kind: "sample", ...props });
var Cal = (props) => /* @__PURE__ */ jsx(SourceTag, { kind: "calc", ...props });
function SourceTagLegend() {
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10, alignItems: "center", margin: "8px 0 16px", fontSize: 11, color: "#94A3B8" }, children: [
    /* @__PURE__ */ jsx("span", { style: { fontWeight: 500, color: "#64748B" }, children: "\u6570\u636E\u6765\u6E90\uFF1A" }),
    /* @__PURE__ */ jsx(Cfg, {}),
    /* @__PURE__ */ jsx(Sam, {}),
    /* @__PURE__ */ jsx(Cal, {}),
    /* @__PURE__ */ jsx("span", { style: { marginLeft: 2 }, children: "\uFF08\u84DD=\u914D\u7F6EJSON \uFF5C \u6A58=\u6837\u4F8BJSON \uFF5C \u7070=\u5B9E\u65F6\u8BA1\u7B97\uFF09" })
  ] });
}

// src/components/ui.tsx
import { Fragment as Fragment3, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function PageHeader({
  title,
  subtitle,
  actions,
  crumb
}) {
  return /* @__PURE__ */ jsxs2("div", { className: "sticky top-14 z-30 -mx-4 border-b border-slate-100 bg-slate-50 px-4 pb-5 pt-1 lg:-mx-8 lg:px-8", children: [
    crumb && /* @__PURE__ */ jsx2("div", { className: "text-xs text-slate-400", children: crumb }),
    /* @__PURE__ */ jsxs2("div", { className: "mt-2 flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs2("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx2("h1", { className: "text-2xl font-bold tracking-tight text-ink-900", children: title }),
        subtitle && /* @__PURE__ */ jsx2("p", { className: "mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500", children: subtitle })
      ] }),
      actions && /* @__PURE__ */ jsx2("div", { className: "flex flex-wrap items-center gap-2", children: actions })
    ] })
  ] });
}
function Panel({
  title,
  desc,
  note,
  actions,
  children,
  id,
  className = "",
  hoverTip
}) {
  return /* @__PURE__ */ jsxs2("section", { id, className: `scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-5 shadow-card ${className}`, children: [
    (title || actions) && /* @__PURE__ */ jsxs2("div", { className: "mb-4 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1.5", children: [
          title && (typeof title === "string" ? /* @__PURE__ */ jsx2("h3", { className: "text-base font-semibold text-ink-900", children: title }) : /* @__PURE__ */ jsx2("h3", { className: "text-base font-semibold text-ink-900", children: title })),
          hoverTip && /* @__PURE__ */ jsxs2("span", { className: "group relative inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400", children: [
            "?",
            /* @__PURE__ */ jsx2("span", { className: "pointer-events-none absolute left-1/2 top-full z-40 mt-1.5 w-52 -translate-x-1/2 whitespace-normal rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-normal leading-relaxed text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100", children: hoverTip })
          ] })
        ] }),
        desc && /* @__PURE__ */ jsx2("p", { className: "mt-0.5 text-xs text-slate-400", children: desc })
      ] }),
      actions
    ] }),
    note && /* @__PURE__ */ jsxs2("div", { className: "mb-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-xs leading-relaxed text-brand-800", children: [
      "\u{1F4A1} ",
      note
    ] }),
    children
  ] });
}
function DetailHeader({
  title,
  crumb,
  subtitle,
  backLabel,
  onBack,
  actions,
  id,
  flowBar,
  sticky = true
}) {
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      id,
      className: (sticky ? "sticky top-14 z-30 " : "") + "-mx-4 bg-slate-50 px-4 pb-4 pt-1 lg:-mx-8 lg:px-8",
      children: [
        /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap items-center gap-3", children: [
          onBack && /* @__PURE__ */ jsx2(
            "button",
            {
              type: "button",
              onClick: onBack,
              className: "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100",
              children: backLabel ?? "\u2190 \u8FD4\u56DE"
            }
          ),
          crumb && /* @__PURE__ */ jsx2("span", { className: "text-xs text-slate-400", children: crumb })
        ] }),
        flowBar,
        /* @__PURE__ */ jsxs2("div", { className: "mt-2 flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs2("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx2("h1", { className: "text-xl font-bold text-ink-900", children: title }),
            subtitle && /* @__PURE__ */ jsx2("div", { className: "mt-0.5 text-xs text-slate-400", children: subtitle })
          ] }),
          actions && /* @__PURE__ */ jsx2("div", { className: "flex flex-wrap items-center justify-end gap-2", children: actions })
        ] })
      ]
    }
  );
}
var badgeStyles = {
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blue: "bg-brand-50 text-brand-700 ring-brand-200",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  gray: "bg-slate-100 text-slate-600 ring-slate-200"
};
function Badge({ kind = "gray", children, className }) {
  return /* @__PURE__ */ jsx2("span", { className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeStyles[kind]} ${className ?? ""}`, children });
}
function ProgressBar({ value, color = "bg-brand-500" }) {
  return /* @__PURE__ */ jsx2("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-slate-100", children: /* @__PURE__ */ jsx2("div", { className: `h-full rounded-full ${color}`, style: { width: `${Math.min(100, Math.max(0, value))}%` } }) });
}
function DataTable({
  columns,
  rows,
  empty = "\u6682\u65E0\u6570\u636E",
  clickableKey,
  onCellClick,
  actions,
  pager = false,
  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100]
}) {
  const [page, setPage] = useState3(1);
  const [ps, setPs] = useState3(defaultPageSize);
  const actionsRef = useRef3(null);
  const [actionsW, setActionsW] = useState3(0);
  useLayoutEffect3(() => {
    if (actionsRef.current) setActionsW(actionsRef.current.offsetWidth);
  }, [actions, rows]);
  const total = rows.length;
  const totalPages = pager ? Math.max(1, Math.ceil(total / ps)) : 1;
  const curPage = pager ? Math.min(page, totalPages) : 1;
  const view = pager ? rows.slice((curPage - 1) * ps, curPage * ps) : rows;
  useEffect3(() => {
    setPage(1);
  }, [rows, ps]);
  return /* @__PURE__ */ jsxs2("div", { children: [
    /* @__PURE__ */ jsx2("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs2("table", { className: "w-full border-collapse text-sm", children: [
      /* @__PURE__ */ jsx2("thead", { children: /* @__PURE__ */ jsxs2("tr", { className: "border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400", children: [
        columns.map((c, i) => /* @__PURE__ */ jsx2(
          "th",
          {
            className: `whitespace-nowrap px-3 py-3 bg-white ${c.fixed === "left" || i === 0 ? "sticky left-0 z-20" : ""} ${c.fixed === "right" ? "sticky z-20" : ""}`,
            style: { width: c.width, textAlign: c.align ?? "left", ...c.fixed === "right" ? { right: actionsW } : {} },
            children: /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx2("span", { children: c.label }),
              c.tag && /* @__PURE__ */ jsx2(ColumnTag, { tag: c.tag })
            ] })
          },
          c.key
        )),
        actions && /* @__PURE__ */ jsx2("th", { ref: actionsRef, className: "whitespace-nowrap px-3 py-3 bg-white sticky right-0 z-20 text-left", children: "\u64CD\u4F5C" })
      ] }) }),
      /* @__PURE__ */ jsx2("tbody", { children: view.length === 0 ? /* @__PURE__ */ jsx2("tr", { children: /* @__PURE__ */ jsx2("td", { colSpan: columns.length + (actions ? 1 : 0), className: "px-3 py-10 text-center text-sm text-slate-400", children: empty }) }) : view.map((r) => /* @__PURE__ */ jsxs2("tr", { className: "group border-b border-slate-50 transition hover:bg-slate-50/60", children: [
        columns.map((c, i) => {
          const clickable = !!clickableKey && c.key === clickableKey;
          return /* @__PURE__ */ jsx2(
            "td",
            {
              className: `whitespace-nowrap px-3 py-3 text-slate-600 ${c.fixed === "left" || i === 0 ? "sticky left-0 z-10 bg-white group-hover:bg-slate-50/60" : ""} ${c.fixed === "right" ? "sticky z-10 bg-white group-hover:bg-slate-50/60" : ""}`,
              style: { textAlign: c.align ?? "left", ...c.fixed === "right" ? { right: actionsW } : {} },
              children: clickable ? /* @__PURE__ */ jsx2(
                "button",
                {
                  type: "button",
                  onClick: () => onCellClick?.(r),
                  className: "font-medium text-brand-600 hover:underline",
                  children: renderCell(r, c)
                }
              ) : renderCell(r, c)
            },
            c.key
          );
        }),
        actions && /* @__PURE__ */ jsx2("td", { className: "whitespace-nowrap px-3 py-3 text-left sticky right-0 z-10 bg-white group-hover:bg-slate-50/60", children: actions(r) })
      ] }, r.id)) })
    ] }) }),
    pager && total > 0 && /* @__PURE__ */ jsxs2("div", { className: "mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500", children: [
      /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx2("span", { children: "\u6BCF\u9875\u663E\u793A" }),
        /* @__PURE__ */ jsx2(
          "select",
          {
            value: ps,
            onChange: (e) => setPs(Number(e.target.value)),
            style: { height: 30, border: "1px solid #CBD5E1", borderRadius: 6, padding: "0 6px", fontSize: 12, background: "#fff" },
            children: pageSizeOptions.map((o) => /* @__PURE__ */ jsxs2("option", { value: o, children: [
              o,
              " \u884C"
            ] }, o))
          }
        ),
        /* @__PURE__ */ jsxs2("span", { children: [
          "\u5171 ",
          total,
          " \u6761"
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs2("span", { children: [
          "\u7B2C ",
          curPage,
          " / ",
          totalPages,
          " \u9875"
        ] }),
        /* @__PURE__ */ jsx2(
          "button",
          {
            type: "button",
            disabled: curPage <= 1,
            onClick: () => setPage(curPage - 1),
            style: { padding: "4px 10px", borderRadius: 6, border: "1px solid #E2E8F0", background: curPage <= 1 ? "#F1F5F9" : "#fff", color: curPage <= 1 ? "#94A3B8" : "#334155", cursor: curPage <= 1 ? "not-allowed" : "pointer" },
            children: "\u4E0A\u4E00\u9875"
          }
        ),
        /* @__PURE__ */ jsx2(
          "button",
          {
            type: "button",
            disabled: curPage >= totalPages,
            onClick: () => setPage(curPage + 1),
            style: { padding: "4px 10px", borderRadius: 6, border: "1px solid #E2E8F0", background: curPage >= totalPages ? "#F1F5F9" : "#fff", color: curPage >= totalPages ? "#94A3B8" : "#334155", cursor: curPage >= totalPages ? "not-allowed" : "pointer" },
            children: "\u4E0B\u4E00\u9875"
          }
        )
      ] })
    ] })
  ] });
}
function ColumnTag({ tag }) {
  if (!tag) return null;
  if (typeof tag === "string") return /* @__PURE__ */ jsx2(SourceTag, { kind: tag });
  return /* @__PURE__ */ jsx2(SourceTag, { kind: tag.kind, value: tag.value });
}
function renderCell(r, c) {
  const v = r[c.key];
  const t = c.type ?? "text";
  if (c.render) return c.render(r);
  if (typeof v === "object" && v !== null && "kind" in v && "v" in v) {
    const b = v;
    return /* @__PURE__ */ jsx2(Badge, { kind: b.kind ?? "gray", children: b.v });
  }
  if (t === "badge") {
    return /* @__PURE__ */ jsx2(Badge, { kind: c.badgeKind ?? "gray", children: v });
  }
  if (t === "progress")
    return /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx2(ProgressBar, { value: Number(v), color: c.progressColor ?? "bg-brand-500" }),
      /* @__PURE__ */ jsxs2("span", { className: "w-10 text-right text-xs tabular-nums text-slate-500", children: [
        v,
        "%"
      ] })
    ] });
  if (t === "money") return /* @__PURE__ */ jsxs2("span", { className: "tabular-nums text-slate-700", children: [
    "\xA5",
    v.toLocaleString()
  ] });
  if (t === "number") return /* @__PURE__ */ jsx2("span", { className: "tabular-nums text-slate-700", children: v });
  if (t === "percent") return /* @__PURE__ */ jsxs2("span", { className: "tabular-nums text-slate-700", children: [
    v,
    "%"
  ] });
  if (t === "score") return /* @__PURE__ */ jsx2("span", { className: "font-semibold tabular-nums text-ink-900", children: v });
  if (t === "mask-name" || t === "mask-id" || t === "mask-phone") return /* @__PURE__ */ jsx2("span", { className: "font-mono text-slate-700", children: v });
  if (t === "datetime") return /* @__PURE__ */ jsx2("span", { className: "text-slate-500", children: v });
  return /* @__PURE__ */ jsx2("span", { className: "text-slate-700", children: v });
}
function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100"
  };
  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3.5 py-2 text-sm"
  };
  return /* @__PURE__ */ jsx2(
    "button",
    {
      ...rest,
      className: `inline-flex items-center gap-1.5 rounded-lg font-medium transition ${sizes[size]} ${variants[variant]} ${className}`
    }
  );
}
function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-lg",
  zIndex = 50
}) {
  if (!open) return null;
  return createPortal(
    /* @__PURE__ */ jsxs2("div", { className: "fixed inset-0 flex items-center justify-center p-4", style: { zIndex }, children: [
      /* @__PURE__ */ jsx2("div", { className: "absolute inset-0 bg-slate-900/40", onClick: onClose }),
      /* @__PURE__ */ jsxs2("div", { className: `relative w-full ${width} overflow-hidden rounded-2xl bg-white shadow-2xl`, children: [
        /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between border-b border-slate-100 px-6 py-4", children: [
          /* @__PURE__ */ jsx2("h2", { className: "text-lg font-semibold text-ink-900", children: title }),
          /* @__PURE__ */ jsx2(
            "button",
            {
              type: "button",
              onClick: onClose,
              "aria-label": "\u5173\u95ED",
              className: "rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600",
              children: "\u2715"
            }
          )
        ] }),
        /* @__PURE__ */ jsx2("div", { className: "max-h-[70vh] overflow-y-auto px-6 py-5", children }),
        footer && /* @__PURE__ */ jsx2("div", { className: "flex justify-end gap-2 border-t border-slate-100 px-6 py-4", children: footer })
      ] })
    ] }),
    document.body
  );
}

// src/console/PageShell.tsx
import { Fragment as Fragment4, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function PageShell({
  title,
  subtitle,
  crumb,
  actions,
  header,
  legend = true
}) {
  return /* @__PURE__ */ jsxs3(Fragment4, { children: [
    header ?? /* @__PURE__ */ jsx3(PageHeader, { title: title ?? "", subtitle, crumb, actions }),
    legend && /* @__PURE__ */ jsx3(SourceTagLegend, {})
  ] });
}

// src/console/RelationGraphView.tsx
import { useEffect as useEffect4, useMemo as useMemo3, useRef as useRef4, useState as useState4 } from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function parseCollectedAt(s) {
  const m = /(\d{4}-\d{2}-\d{2})/.exec(s);
  if (!m) return new Date(2026, 7, 10);
  const [y, mo, d] = m[1].split("-").map(Number);
  return new Date(y, mo - 1, d);
}
function fmtDate(d) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}
function cutoffOf(now, days) {
  if (!isFinite(days)) return "";
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return fmtDate(d);
}
function shade(hex, percent) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const num = parseInt(h, 16);
  let r = num >> 16 & 255;
  let g = num >> 8 & 255;
  let b = num & 255;
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
function inWindow(since, lo, hi) {
  if (!since) return true;
  if (lo && since < lo) return false;
  if (hi && since > hi) return false;
  return true;
}
var TYPE_COLOR = {
  self: "#8B5CF6",
  person: "#7C3AED",
  company: "#2563EB",
  account: "#0EA5E9",
  device: "#F59E0B",
  product: "#10B981",
  org: "#64748B"
};
var TYPE_LABEL = {
  self: "\u672C\u4EBA",
  person: "\u4E2A\u4EBA",
  company: "\u4F01\u4E1A",
  account: "\u8D26\u6237",
  device: "\u8BBE\u5907",
  product: "\u4EA7\u54C1",
  org: "\u673A\u6784"
};
var THEME_COLOR = {
  \u5BB6\u65CF: "#7C3AED",
  \u793E\u4EA4: "#0EA5E9",
  \u8D44\u91D1: "#10B981",
  \u7ECF\u8425: "#2563EB",
  \u5171\u503A: "#DC2626",
  \u62C5\u4FDD: "#D97706",
  \u8BBE\u5907: "#F59E0B"
};
var GROUP_PRIORITY = ["\u7ECF\u8425", "\u5171\u503A", "\u62C5\u4FDD", "\u5BB6\u65CF", "\u793E\u4EA4", "\u8BBE\u5907", "\u8D44\u91D1"];
function primaryGroup(nodeId, edges, theme) {
  if (theme !== "\u7EFC\u5408") return theme;
  const selfEdges = edges.filter(
    (e) => e.source === "self" && e.target === nodeId || e.target === "self" && e.source === nodeId
  );
  for (const g of GROUP_PRIORITY) if (selfEdges.some((e) => e.theme === g)) return g;
  if (selfEdges.length) return selfEdges[0].theme;
  const any = edges.find((e) => e.source === nodeId || e.target === nodeId);
  return any ? any.theme : "\u793E\u4EA4";
}
function chipW(name) {
  return Math.min(128, 26 + [...name].length * 11);
}
function RelationGraphView({
  graph,
  theme,
  onTheme,
  sel,
  onPick,
  nodeMap
}) {
  const W = 820;
  const H = 520;
  const cx = W / 2;
  const cy = H / 2;
  const now = useMemo3(() => parseCollectedAt(graph.collectedAt), [graph.collectedAt]);
  const nowStr = useMemo3(() => fmtDate(now), [now]);
  const defStart = useMemo3(() => cutoffOf(now, 365), [now]);
  const [customStart, setCustomStart] = useState4(defStart);
  const [customEnd, setCustomEnd] = useState4(nowStr);
  const periodInfo = useMemo3(() => {
    const lo = customStart || defStart;
    const hi = customEnd || nowStr;
    return { lo, hi };
  }, [customStart, customEnd, defStart, nowStr]);
  const { nodes, pos, highRisk } = useMemo3(() => {
    let active2 = theme === "\u7EFC\u5408" ? graph.edges : graph.edges.filter((e) => e.theme === theme);
    if (periodInfo.lo || periodInfo.hi) {
      active2 = active2.filter((e) => inWindow(e.since, periodInfo.lo, periodInfo.hi));
    }
    const activeIds = /* @__PURE__ */ new Set(["self"]);
    active2.forEach((e) => {
      activeIds.add(e.source);
      activeIds.add(e.target);
    });
    const ns = graph.nodes.filter((n) => activeIds.has(n.id));
    const ps = {};
    const self = ns.find((n) => n.type === "self");
    if (self) ps[self.id] = { x: cx, y: cy };
    const grp = {};
    ns.filter((n) => n.type !== "self").forEach((n) => {
      const g = primaryGroup(n.id, active2, theme);
      (grp[g] ??= []).push(n);
    });
    const order = (theme === "\u7EFC\u5408" ? Object.keys(THEME_COLOR) : [theme]).filter(
      (g) => (grp[g]?.length ?? 0) > 0
    );
    const total = order.reduce((s, g) => s + Math.sqrt(grp[g].length), 0) || 1;
    let angle = -Math.PI / 2;
    const R1 = 140;
    const R2 = 214;
    order.forEach((g) => {
      const cnt = grp[g].length;
      const span = Math.sqrt(cnt) / total * Math.PI * 2;
      const start = angle + span * 0.14;
      const end = angle + span * 0.86;
      grp[g].forEach((n, i) => {
        const t = cnt === 1 ? 0.5 : i / (cnt - 1);
        const a = start + t * (end - start);
        const ring = i % 2 === 0 ? R1 : R2;
        ps[n.id] = { x: cx + Math.cos(a) * ring, y: cy + Math.sin(a) * ring };
      });
      angle += span;
    });
    const hr = ns.filter((n) => n.risk === "\u9AD8\u5371").length;
    return { nodes: ns, pos: ps, highRisk: hr };
  }, [graph, theme, periodInfo]);
  const persons = useMemo3(() => nodes.filter((n) => n.type !== "self"), [nodes]);
  const rowRefs = useRef4({});
  useEffect4(() => {
    if (sel?.kind === "node") rowRefs.current[sel.node.id]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [sel]);
  const themeList = graph.themes ?? ["\u7EFC\u5408"];
  const active = useMemo3(() => {
    let es = theme === "\u7EFC\u5408" ? graph.edges : graph.edges.filter((e) => e.theme === theme);
    if (periodInfo.lo || periodInfo.hi) es = es.filter((e) => inWindow(e.since, periodInfo.lo, periodInfo.hi));
    return es;
  }, [graph.edges, theme, periodInfo]);
  const edgePath = (ax, ay, bx, by) => {
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const len = Math.hypot(dx, dy) || 1;
    const push = Math.min(44, len * 0.16);
    const cxp = mx + dx / len * push;
    const cyp = my + dy / len * push;
    return `M ${ax} ${ay} Q ${cxp} ${cyp} ${bx} ${by}`;
  };
  return /* @__PURE__ */ jsxs4("div", { children: [
    /* @__PURE__ */ jsxs4(
      "div",
      {
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center",
          fontSize: 12,
          color: "#64748B",
          marginBottom: 8
        },
        children: [
          /* @__PURE__ */ jsxs4("span", { children: [
            "\u{1F4E1} \u6765\u6E90\uFF1A",
            /* @__PURE__ */ jsx4("b", { style: { color: "#334155" }, children: graph.source })
          ] }),
          /* @__PURE__ */ jsxs4("span", { children: [
            "\u8282\u70B9 ",
            /* @__PURE__ */ jsx4("b", { style: { color: "#334155" }, children: nodes.length })
          ] }),
          /* @__PURE__ */ jsxs4("span", { children: [
            "\u5173\u7CFB ",
            /* @__PURE__ */ jsx4("b", { style: { color: "#334155" }, children: active.length })
          ] }),
          highRisk > 0 && /* @__PURE__ */ jsxs4("span", { style: { color: "#DC2626", fontWeight: 600 }, children: [
            "\u9AD8\u5371\u8282\u70B9 ",
            highRisk
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs4("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }, children: [
      /* @__PURE__ */ jsx4("span", { style: { fontSize: 12, color: "#94A3B8", marginRight: 2 }, children: "\u56FE\u8C31\u4E3B\u9898" }),
      themeList.map((th) => {
        const on = th === theme;
        const col = THEME_COLOR[th] ?? "#8B5CF6";
        return /* @__PURE__ */ jsxs4(
          "button",
          {
            title: th,
            onClick: () => {
              onTheme(th);
              onPick(null);
            },
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 10,
              border: "none",
              background: `linear-gradient(135deg, ${col} 0%, ${shade(col, -16)} 100%)`,
              color: "#fff",
              cursor: "pointer",
              fontWeight: on ? 700 : 500,
              opacity: on ? 1 : 0.5,
              boxShadow: on ? `0 0 0 2px #fff, 0 0 0 4px ${col}, 0 4px 10px ${col}55` : "0 1px 3px rgba(15,23,42,.12)",
              transform: on ? "scale(1.06)" : "scale(1)",
              transition: "all .15s ease"
            },
            children: [
              on && /* @__PURE__ */ jsx4("span", { style: { fontSize: 11, lineHeight: 1 }, children: "\u2713" }),
              th
            ]
          },
          th
        );
      }),
      /* @__PURE__ */ jsx4("span", { style: { width: 1, height: 18, background: "#E2E8F0", margin: "0 6px" } }),
      /* @__PURE__ */ jsx4("span", { style: { fontSize: 12, color: "#94A3B8", marginRight: 2 }, children: "\u65F6\u95F4\u6BB5" }),
      /* @__PURE__ */ jsxs4("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 4 }, children: [
        /* @__PURE__ */ jsx4(
          "input",
          {
            type: "date",
            value: customStart,
            max: customEnd || nowStr,
            onChange: (e) => setCustomStart(e.target.value),
            style: { fontSize: 12, padding: "4px 8px", borderRadius: 8, border: "1px solid #E2E8F0", color: "#475569" }
          }
        ),
        /* @__PURE__ */ jsx4("span", { style: { color: "#94A3B8", fontSize: 12 }, children: "~" }),
        /* @__PURE__ */ jsx4(
          "input",
          {
            type: "date",
            value: customEnd,
            min: customStart || void 0,
            max: nowStr,
            onChange: (e) => setCustomEnd(e.target.value),
            style: { fontSize: 12, padding: "4px 8px", borderRadius: 8, border: "1px solid #E2E8F0", color: "#475569" }
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs4("div", { style: { display: "flex", gap: 18, alignItems: "stretch", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs4("div", { style: { flex: "1 1 520px", minWidth: 480, position: "relative" }, children: [
        /* @__PURE__ */ jsxs4(
          "svg",
          {
            viewBox: `0 0 ${W} ${H}`,
            style: {
              width: "100%",
              height: "auto",
              background: "radial-gradient(circle at 50% 45%, #FBFCFE 0%, #EEF2F7 100%)",
              borderRadius: 14,
              border: "1px solid #E2E8F0",
              display: "block"
            },
            onClick: () => onPick(null),
            children: [
              active.map((e, i) => {
                const a = pos[e.source];
                const b = pos[e.target];
                if (!a || !b) return null;
                const inc = sel?.kind === "node" && (e.source === sel.node.id || e.target === sel.node.id);
                const isSel = sel?.kind === "edge" && sel.edge === e;
                const dim = sel ? !inc && !isSel : false;
                const col = e.danger ? "#DC2626" : THEME_COLOR[e.theme] ?? "#CBD5E1";
                const d = edgePath(a.x, a.y, b.x, b.y);
                const mx = (a.x + b.x) / 2;
                const my = (a.y + b.y) / 2;
                return /* @__PURE__ */ jsxs4(
                  "g",
                  {
                    style: { cursor: "pointer" },
                    onClick: (ev) => {
                      ev.stopPropagation();
                      onPick({ kind: "edge", edge: e });
                    },
                    children: [
                      /* @__PURE__ */ jsx4(
                        "path",
                        {
                          d,
                          fill: "none",
                          stroke: col,
                          strokeWidth: isSel ? 3 : inc ? 2.4 : e.danger ? 1.8 : 1.2,
                          strokeDasharray: e.danger ? "5 3" : void 0,
                          strokeOpacity: dim ? 0.14 : inc || isSel ? 1 : 0.62
                        }
                      ),
                      /* @__PURE__ */ jsx4("path", { d, fill: "none", stroke: "transparent", strokeWidth: 14 }),
                      e.danger && /* @__PURE__ */ jsx4(
                        "text",
                        {
                          x: mx,
                          y: my - 4,
                          textAnchor: "middle",
                          fontSize: 9,
                          fontWeight: 700,
                          fill: "#DC2626",
                          style: { paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 },
                          children: e.rel
                        }
                      )
                    ]
                  },
                  i
                );
              }),
              nodes.map((n) => {
                const p = pos[n.id];
                if (!p) return null;
                const c = TYPE_COLOR[n.type] ?? "#64748B";
                const isSelf = n.type === "self";
                const seld = sel?.kind === "node" && sel.node.id === n.id;
                const w = isSelf ? Math.min(150, 34 + [...n.name].length * 13) : chipW(n.name);
                const h = isSelf ? 36 : 28;
                return /* @__PURE__ */ jsxs4(
                  "g",
                  {
                    transform: `translate(${p.x},${p.y})`,
                    style: { cursor: "pointer" },
                    onClick: (ev) => {
                      ev.stopPropagation();
                      onPick({ kind: "node", node: n });
                    },
                    children: [
                      seld && /* @__PURE__ */ jsx4(
                        "rect",
                        {
                          x: -w / 2 - 5,
                          y: -h / 2 - 5,
                          width: w + 10,
                          height: h + 10,
                          rx: 16,
                          fill: "none",
                          stroke: c,
                          strokeWidth: 2,
                          strokeOpacity: 0.5
                        }
                      ),
                      /* @__PURE__ */ jsx4(
                        "rect",
                        {
                          x: -w / 2,
                          y: -h / 2,
                          width: w,
                          height: h,
                          rx: isSelf ? 18 : 14,
                          fill: isSelf ? c : "#fff",
                          stroke: c,
                          strokeWidth: seld ? 2.2 : n.risk === "\u9AD8\u5371" ? 1.8 : 1.3,
                          strokeDasharray: n.risk === "\u5173\u6CE8" ? "4 2" : void 0
                        }
                      ),
                      /* @__PURE__ */ jsx4(
                        "circle",
                        {
                          cx: -w / 2 + (isSelf ? 16 : 14),
                          cy: 0,
                          r: isSelf ? 6 : 5,
                          fill: isSelf ? "#fff" : c,
                          stroke: isSelf ? "rgba(255,255,255,.6)" : "none"
                        }
                      ),
                      /* @__PURE__ */ jsx4(
                        "text",
                        {
                          x: -w / 2 + (isSelf ? 30 : 26),
                          y: isSelf ? 5 : 4,
                          fontSize: isSelf ? 13 : 11.5,
                          fontWeight: 600,
                          fill: isSelf ? "#fff" : "#334155",
                          children: n.name
                        }
                      ),
                      !!n.openAlerts && /* @__PURE__ */ jsxs4("g", { children: [
                        /* @__PURE__ */ jsx4("circle", { cx: w / 2 - 12, cy: -h / 2 + 12, r: 8, fill: "#DC2626", stroke: "#fff", strokeWidth: 1.5 }),
                        /* @__PURE__ */ jsx4(
                          "text",
                          {
                            x: w / 2 - 12,
                            y: -h / 2 + 15.5,
                            textAnchor: "middle",
                            fontSize: 10,
                            fontWeight: 700,
                            fill: "#fff",
                            children: n.openAlerts
                          }
                        )
                      ] }),
                      n.risk === "\u9AD8\u5371" && !n.openAlerts && /* @__PURE__ */ jsx4("circle", { cx: w / 2 - 10, cy: -h / 2 + 10, r: 5, fill: "#DC2626", stroke: "#fff", strokeWidth: 1.5 })
                    ]
                  },
                  n.id
                );
              })
            ]
          }
        ),
        /* @__PURE__ */ jsx4("div", { style: { position: "absolute", top: 12, right: 12, width: 218, zIndex: 5 }, children: /* @__PURE__ */ jsx4(RelDetail, { sel, nodeMap, onClose: () => onPick(null) }) }),
        /* @__PURE__ */ jsxs4("div", { style: { display: "flex", gap: 14, fontSize: 11, color: "#64748B", marginTop: 10, flexWrap: "wrap" }, children: [
          Object.keys(TYPE_COLOR).filter((k) => k !== "self").map((k) => /* @__PURE__ */ jsxs4("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
            /* @__PURE__ */ jsx4("span", { style: { width: 9, height: 9, borderRadius: "50%", background: TYPE_COLOR[k], display: "inline-block" } }),
            TYPE_LABEL[k] ?? k
          ] }, k)),
          /* @__PURE__ */ jsxs4("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
            /* @__PURE__ */ jsx4("span", { style: { width: 16, height: 0, borderTop: "2px dashed #DC2626", display: "inline-block" } }),
            "\u9AD8\u5371 / \u98CE\u9669\u5173\u7CFB"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx4(RelSide, { persons, sel, nodeMap, onPick, rowRefs })
    ] })
  ] });
}
function KV({ k, v, danger }) {
  return /* @__PURE__ */ jsxs4("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, padding: "3px 0", fontSize: 12 }, children: [
    /* @__PURE__ */ jsx4("span", { style: { color: "#94A3B8" }, children: k }),
    /* @__PURE__ */ jsx4("span", { style: { color: danger ? "#DC2626" : "#334155", fontWeight: 500, textAlign: "right" }, children: v })
  ] });
}
function RelDetail({
  sel,
  nodeMap,
  onClose
}) {
  if (!sel) {
    return /* @__PURE__ */ jsxs4(
      "div",
      {
        style: {
          border: "1px dashed #CBD5E1",
          borderRadius: 12,
          padding: "16px",
          fontSize: 12,
          color: "#94A3B8",
          background: "#F8FAFC",
          lineHeight: 1.6
        },
        children: [
          "\u70B9\u51FB\u5DE6\u4FA7\u56FE\u8C31\u4E2D\u7684 ",
          /* @__PURE__ */ jsx4("b", { style: { color: "#8B5CF6" }, children: "\u8282\u70B9" }),
          " \u6216 ",
          /* @__PURE__ */ jsx4("b", { style: { color: "#DC2626" }, children: "\u5173\u7CFB" }),
          "\uFF0C\u6216\u4E0B\u65B9\u6E05\u5355\u4E2D\u7684\u4EFB\u4E00\u5173\u7CFB\u4EBA\uFF0C\u67E5\u770B\u5BF9\u8C61\u5C5E\u6027\u3002"
        ]
      }
    );
  }
  if (sel.kind === "node") {
    const n = sel.node;
    return /* @__PURE__ */ jsxs4(
      "div",
      {
        style: {
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(15,23,42,.1)",
          padding: "12px 14px"
        },
        children: [
          /* @__PURE__ */ jsxs4("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
            /* @__PURE__ */ jsx4("span", { style: { fontSize: 14, fontWeight: 700, color: "#0F172A" }, children: n.name }),
            /* @__PURE__ */ jsx4(
              "button",
              {
                onClick: onClose,
                style: { border: "none", background: "none", cursor: "pointer", color: "#94A3B8", fontSize: 16, lineHeight: 1 },
                children: "\xD7"
              }
            )
          ] }),
          /* @__PURE__ */ jsx4(KV, { k: "\u7C7B\u578B", v: TYPE_LABEL[n.type] ?? n.type }),
          /* @__PURE__ */ jsx4(KV, { k: "\u5173\u7CFB", v: n.rel }),
          n.risk && /* @__PURE__ */ jsx4(KV, { k: "\u98CE\u9669\u7B49\u7EA7", v: n.risk, danger: n.risk !== "\u6B63\u5E38" }),
          n.phone && /* @__PURE__ */ jsx4(KV, { k: "\u8054\u7CFB\u7535\u8BDD", v: n.phone }),
          n.openAlerts != null && /* @__PURE__ */ jsx4(KV, { k: "\u5173\u8054\u9884\u8B66", v: `${n.openAlerts} \u6761`, danger: n.openAlerts > 0 }),
          n.detail && /* @__PURE__ */ jsx4(KV, { k: "\u8BF4\u660E", v: n.detail })
        ]
      }
    );
  }
  const e = sel.edge;
  const sName = nodeMap[e.source]?.name ?? e.source;
  const tName = nodeMap[e.target]?.name ?? e.target;
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      style: {
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(15,23,42,.1)",
        padding: "12px 14px"
      },
      children: [
        /* @__PURE__ */ jsxs4("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
          /* @__PURE__ */ jsx4("span", { style: { fontSize: 14, fontWeight: 700, color: "#0F172A" }, children: "\u5173\u7CFB\u5C5E\u6027" }),
          /* @__PURE__ */ jsx4(
            "button",
            {
              onClick: onClose,
              style: { border: "none", background: "none", cursor: "pointer", color: "#94A3B8", fontSize: 16, lineHeight: 1 },
              children: "\xD7"
            }
          )
        ] }),
        /* @__PURE__ */ jsx4(KV, { k: "\u5173\u7CFB\u7C7B\u578B", v: e.rel, danger: e.danger }),
        /* @__PURE__ */ jsx4(KV, { k: "\u8D77\u70B9", v: sName }),
        /* @__PURE__ */ jsx4(KV, { k: "\u7EC8\u70B9", v: tName }),
        /* @__PURE__ */ jsx4(KV, { k: "\u6240\u5C5E\u4E3B\u9898", v: e.theme }),
        /* @__PURE__ */ jsx4(KV, { k: "\u6700\u8FD1\u6D3B\u8DC3", v: e.since ?? "\u2014" }),
        /* @__PURE__ */ jsx4(KV, { k: "\u98CE\u9669\u6807\u8BB0", v: e.danger ? "\u9AD8\u5371 / \u98CE\u9669\u8FB9" : "\u6B63\u5E38", danger: e.danger })
      ]
    }
  );
}
function RelSide({
  persons,
  sel,
  nodeMap,
  onPick,
  rowRefs
}) {
  return /* @__PURE__ */ jsxs4("div", { style: { flex: "0 0 320px", minWidth: 280, display: "flex", flexDirection: "column", gap: 10, height: "100%" }, children: [
    /* @__PURE__ */ jsxs4(
      "div",
      {
        style: {
          fontSize: 12,
          color: "#64748B",
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between"
        },
        children: [
          /* @__PURE__ */ jsx4("span", { children: "\u5173\u7CFB\u4EBA\u6E05\u5355" }),
          /* @__PURE__ */ jsxs4("span", { children: [
            persons.length,
            " \u4EBA"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx4("div", { style: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 4 }, children: persons.map((n) => {
      const seld = sel?.kind === "node" && sel.node.id === n.id;
      const c = TYPE_COLOR[n.type] ?? "#64748B";
      return /* @__PURE__ */ jsxs4(
        "div",
        {
          ref: (el) => {
            rowRefs.current[n.id] = el;
          },
          onClick: () => onPick({ kind: "node", node: n }),
          style: {
            border: `1px solid ${seld ? "#8B5CF6" : "#E2E8F0"}`,
            borderLeft: `3px solid ${c}`,
            borderRadius: 10,
            padding: "8px 10px",
            background: seld ? "#F5F3FF" : n.risk === "\u9AD8\u5371" ? "#FEF2F2" : "#fff",
            cursor: "pointer"
          },
          children: [
            /* @__PURE__ */ jsxs4("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }, children: [
              /* @__PURE__ */ jsx4("span", { style: { fontSize: 13, fontWeight: 600, color: "#334155" }, children: n.name }),
              /* @__PURE__ */ jsx4("span", { style: { fontSize: 11, color: c }, children: TYPE_LABEL[n.type] ?? n.type })
            ] }),
            /* @__PURE__ */ jsxs4("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 3 }, children: [
              n.rel,
              n.risk && n.risk !== "\u6B63\u5E38" ? ` \xB7 ${n.risk}` : ""
            ] }),
            n.detail && /* @__PURE__ */ jsx4("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 2, lineHeight: 1.45 }, children: n.detail })
          ]
        },
        n.id
      );
    }) })
  ] });
}

// src/console/custProfileData.ts
import { useSyncExternalStore as useSyncExternalStore2 } from "react";
var SEED_CUST = {
  customers: [
    {
      custId: "CUST-100237",
      name: "\u5F20\u660E\u8FDC",
      maskedId: "3301**********1234",
      status: "\u6B63\u5E38",
      tags: ["\u4F18\u8D28\u5BA2\u6237", "\u989D\u5EA6\u5185\u7528\u4FE1"],
      avatarText: "\u5F20",
      gender: "\u7537",
      age: 34,
      region: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02",
      occupation: "\u8F6F\u4EF6\u5DE5\u7A0B\u5E08",
      employer: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280\u6709\u9650\u516C\u53F8",
      income: 28e3,
      education: "\u672C\u79D1",
      marital: "\u5DF2\u5A5A",
      phone: "138****6621",
      phones: [
        { number: "138****6621", verified: true },
        { number: "139****8800", verified: true }
      ],
      email: "mingyuan.z@cloudcalc.com",
      addresses: [
        { type: "\u6237\u7C4D\u5730\u5740", value: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02\u897F\u6E56\u533A\u6587\u4E09\u8DEF 100 \u53F7" },
        { type: "\u5C45\u4F4F\u5730\u5740", value: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02\u4F59\u676D\u533A\u672A\u6765\u79D1\u6280\u57CE 8 \u680B 1502" },
        { type: "\u516C\u53F8\u5730\u5740", value: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02\u6EE8\u6C5F\u533A\u7F51\u5546\u8DEF 599 \u53F7" }
      ],
      creditLimit: 2e5,
      usedLimit: 86e3,
      availLimit: 114e3,
      totalDebt: 86e3,
      monthlyPay: 2680,
      overdueDays: 0,
      overdueAmt: 0,
      loans: [
        { id: "LN-88231", product: "\u968F\u501F\u968F\u8FD8\xB7\u6D88\u8D39\u8D37", principal: 1e5, balance: 56e3, rate: 11.8, term: 36, monthly: 0, status: "\u6B63\u5E38" },
        { id: "LN-90115", product: "\u73B0\u91D1\u5206\u671F\xB7\u6559\u80B2", principal: 5e4, balance: 3e4, rate: 12.6, term: 24, monthly: 2680, status: "\u6B63\u5E38" }
      ],
      behavior: [
        { name: "\u7528\u4FE1\u7B14\u6570", count: 42, category: "\u7528\u4FE1", desc: "\u7D2F\u8BA1\u501F\u6B3E\u652F\u7528\u6B21\u6570" },
        { name: "\u63D0\u524D\u8FD8\u6B3E", count: 3, category: "\u8FD8\u6B3E", desc: "\u63D0\u524D\u7ED3\u6E05\u7B14\u6570" },
        { name: "\u6B63\u5E38\u8FD8\u6B3E", count: 39, category: "\u8FD8\u6B3E", desc: "\u6309\u671F\u8FD8\u6B3E\u7B14\u6570" },
        { name: "\u903E\u671F\u8FD8\u6B3E", count: 0, danger: true, category: "\u8FD8\u6B3E", desc: "\u53D1\u751F\u903E\u671F\u7684\u7B14\u6570" },
        { name: "\u673A\u6784\u67E5\u8BE2", count: 6, category: "\u67E5\u8BE2", desc: "\u8FD1 90 \u5929\u673A\u6784\u5F81\u4FE1\u67E5\u8BE2\u6B21\u6570" },
        { name: "\u591A\u5934\u501F\u8D37", count: 1, danger: true, category: "\u67E5\u8BE2", desc: "\u540C\u65F6\u5728\u8D37\u673A\u6784\u6570" },
        { name: "\u591C\u95F4\u7528\u4FE1", count: 8, category: "\u7528\u4FE1", desc: "23:00-05:00 \u7528\u4FE1\u7B14\u6570" },
        { name: "\u989D\u5EA6\u4F7F\u7528\u7387", count: 43, category: "\u7528\u4FE1", desc: "\u5DF2\u7528 / \u6388\u4FE1\uFF08%\uFF09" }
      ],
      alerts: [
        { id: "AL-2026-0312", rule: "\u989D\u5EA6\u4F7F\u7528\u7387\u8D85 40% \u6301\u7EED 60 \u5929", level: "\u84DD", date: "2026-07-28", desc: "\u5BA2\u6237\u989D\u5EA6\u4F7F\u7528\u7387\u957F\u671F\u504F\u9AD8\uFF0C\u5173\u6CE8\u518D\u878D\u8D44\u503E\u5411", status: "\u5DF2\u95ED\u73AF" },
        { id: "AL-2026-0288", rule: "\u8FD1 90 \u5929\u673A\u6784\u67E5\u8BE2 \u2265 5", level: "\u9EC4", date: "2026-06-15", desc: "\u67E5\u8BE2\u6B21\u6570\u504F\u591A\uFF0C\u5B58\u5728\u591A\u5934\u7533\u8BF7\u8FF9\u8C61", status: "\u5904\u7F6E\u4E2D" }
      ],
      scores: {
        zhiCha: {
          name: "\u667A\u5BDF\uFF08\u53CD\u6B3A\u8BC8\uFF09",
          score: 892,
          level: "\u4F18"
        },
        zhiXin: {
          name: "\u667A\u4FE1\uFF08\u4FE1\u7528\uFF09",
          score: 768,
          level: "\u826F"
        },
        zhiRong: {
          name: "\u667A\u878D\uFF08\u7EFC\u5408\uFF09",
          score: 815,
          level: "\u826F"
        },
        limitSuggest: { suggested: 2e5, current: 2e5 }
      },
      credit: {
        header: { reportNo: "PBOC-2026-0812-0007", queryTime: "2026-08-12 09:30:15", queriedBy: "\u5F20\u4F1F", idNo: "3301**********1234" },
        recentQueries: [
          { org: "\u672C\u884C", date: "2026-07-12", type: "\u8D37\u540E\u7BA1\u7406" },
          { org: "\u62DB\u5546\u94F6\u884C", date: "2026-06-15", type: "\u4FE1\u7528\u5361\u5BA1\u6279" },
          { org: "\u8682\u8681\u6D88\u91D1", date: "2026-05-20", type: "\u8D37\u6B3E\u5BA1\u6279" }
        ],
        selfQueries: [
          { date: "2026-07-01", type: "\u672C\u4EBA\u67E5\u8BE2\uFF08\u81EA\u52A9\u67E5\u8BE2\u673A\uFF09" }
        ],
        accounts: [
          { type: "\u4F4F\u623F\u8D37\u6B3E", bank: "\u5DE5\u5546\u94F6\u884C", openDate: "2019-03-12", dueDate: "2049-03-11", creditLimit: 18e5, balance: 12e5, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u62B5\u62BC", overdueMonths: 0, overdueAmt: 0, status: "\u6B63\u5E38" },
          { type: "\u4FE1\u7528\u5361", bank: "\u62DB\u5546\u94F6\u884C", openDate: "2021-06-01", dueDate: "--", creditLimit: 5e4, balance: 18e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 0, overdueAmt: 0, status: "\u6B63\u5E38" },
          { type: "\u6D88\u8D39\u8D37", bank: "\u672C\u884C", openDate: "2024-11-08", dueDate: "2027-11-07", creditLimit: 2e5, balance: 86e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 0, overdueAmt: 0, status: "\u6B63\u5E38" }
        ],
        agreements: [
          { id: "AG-ICBC-001", org: "\u5DE5\u5546\u94F6\u884C", limit: 18e5, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2019-03-12", expireDate: "2049-03-11", status: "\u6B63\u5E38" },
          { id: "AG-CMB-002", org: "\u62DB\u5546\u94F6\u884C", limit: 5e4, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2021-06-01", expireDate: "\u957F\u671F", status: "\u6B63\u5E38" },
          { id: "AG-BANK-003", org: "\u672C\u884C", limit: 2e5, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2024-11-08", expireDate: "2027-11-07", status: "\u6B63\u5E38" }
        ],
        summary: { creditCards: 1, loans: 2, overdueAccounts: 0, overdue90Plus: 0, guaranteeCount: 0, relatedRepay: 0 },
        summaryAmount: { firstBizYear: 2019, openCreditLimit: 203e4, usedBalance: 1298e3, maxMonthlyOverdue: 0, longestOverdueMonths: 0 },
        relatedRepayList: [],
        publicRecords: [],
        overdue: { count: 0, amount: 0 },
        guarantee: [],
        annotations: []
      },
      device: {
        device: "iPhone 15 Pro",
        model: "iPhone15,3",
        os: "iOS 17.4",
        envRiskScore: 8,
        simulator: false,
        sameDeviceAccounts: [],
        loginRegion: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02",
        lastLogin: "2026-08-09 21:34"
      },
      externalChecks: [
        { source: "\u516C\u5B89", item: "\u8BC1\u4EF6\u6838\u9A8C", result: "\u8BC1\u4EF6\u53F7\u4E0E\u59D3\u540D\u4E00\u81F4", status: "\u4E00\u81F4", field: "maskedId", verifyOrg: "\u516C\u5B89\u90E8\u516C\u6C11\u8EAB\u4EFD\u4FE1\u606F\u5E93", verifyTime: "2026-08-09 10:02", cost: 0 },
        { source: "\u8FD0\u8425\u5546", item: "\u624B\u673A\u53F7\u5B9E\u540D", result: "\u5B9E\u540D\u8BA4\u8BC1\u4E00\u81F4", status: "\u4E00\u81F4", field: "phone", verifyOrg: "\u4E2D\u56FD\u79FB\u52A8\u5B9E\u540D\u5E93", verifyTime: "2026-08-09 10:03", cost: 0.2 },
        { source: "\u90AE\u7BB1\u670D\u52A1", item: "\u90AE\u7BB1\u6709\u6548\u6027", result: "\u53EF\u9001\u8FBE\u3001\u65E0\u9000\u4FE1", status: "\u4E00\u81F4", field: "email", verifyOrg: "\u90AE\u7BB1\u670D\u52A1\u5546", verifyTime: "2026-08-09 10:03", cost: 0 },
        { source: "\u5DE5\u5546", item: "\u540D\u4E0B\u4F01\u4E1A", result: "\u65E0\u5173\u8054\u4F01\u4E1A", status: "\u4E00\u81F4", verifyOrg: "\u56FD\u5BB6\u4F01\u4E1A\u4FE1\u7528\u4FE1\u606F\u516C\u793A\u7CFB\u7EDF", verifyTime: "2026-08-09 10:05", cost: 0.5 },
        { source: "\u53F8\u6CD5", item: "\u6D89\u8BC9\u67E5\u8BE2", result: "\u65E0\u672A\u7ED3\u6848\u4EF6", status: "\u4E00\u81F4", verifyOrg: "\u4E2D\u56FD\u6267\u884C\u4FE1\u606F\u516C\u5F00\u7F51", verifyTime: "2026-08-09 10:06", cost: 0.5 },
        { source: "\u7A0E\u52A1", item: "\u4E2A\u7A0E\u7F34\u7EB3", result: "\u8FDE\u7EED\u7F34\u7EB3 36 \u4E2A\u6708", status: "\u4E00\u81F4", field: "income", verifyOrg: "\u81EA\u7136\u4EBA\u7535\u5B50\u7A0E\u52A1\u5C40", verifyTime: "2026-08-09 10:07", cost: 0.3 },
        { source: "\u793E\u4FDD\u516C\u79EF\u91D1", item: "\u793E\u4FDD\u72B6\u6001", result: "\u5728\u7F34\u3001\u57FA\u6570\u6B63\u5E38", status: "\u4E00\u81F4", field: "income", verifyOrg: "\u4EBA\u793E / \u516C\u79EF\u91D1\u4E2D\u5FC3", verifyTime: "2026-08-09 10:08", cost: 0.3 }
      ],
      collateralBiz: {
        collateral: [],
        business: [
          { name: "\u660E\u8FDC\u7F51\u7EDC\u5DE5\u4F5C\u5BA4", role: "\u7ECF\u8425\u8005\uFF08\u4E2A\u4F53\u5DE5\u5546\u6237\uFF09", status: "\u5B58\u7EED", creditCode: "92330106MA2G8XK21", legalRep: "\u5F20\u660E\u8FDC", regCapital: 10, regDate: "2021-03-15", industry: "\u8F6F\u4EF6\u548C\u4FE1\u606F\u6280\u672F\u670D\u52A1\u4E1A", risk: "\u6B63\u5E38", riskTags: [], healthScore: 88, verifyOrg: "\u56FD\u5BB6\u4F01\u4E1A\u4FE1\u7528\u4FE1\u606F\u516C\u793A\u7CFB\u7EDF", verifyTime: "2026-08-09 10:05", verified: true }
        ],
        bizHealth: { years: 5, monthlyRevenue: 46e3, stability: "\u7A33\u5B9A", score: 88 }
      },
      relationGraph: {
        nodes: [
          { id: "self", name: "\u5F20\u660E\u8FDC", type: "self", rel: "\u672C\u4EBA" },
          // 家族
          { id: "spouse", name: "\u674E\u82B8", type: "person", rel: "\u914D\u5076", risk: "\u6B63\u5E38", phone: "139****2048", detail: "\u5171\u540C\u5C45\u4F4F \xB7 \u7D27\u6025\u8054\u7CFB\u4EBA \xB7 \u8FDE\u5E26\u62C5\u4FDD" },
          { id: "father", name: "\u5F20\u5EFA\u56FD", type: "person", rel: "\u7236\u4EB2", phone: "137****7711", detail: "\u9000\u4F11 \xB7 \u7D27\u6025\u8054\u7CFB\u4EBA" },
          { id: "mother", name: "\u738B\u79C0\u82F1", type: "person", rel: "\u6BCD\u4EB2", detail: "\u9000\u4F11" },
          { id: "brother", name: "\u5F20\u660E\u6770", type: "person", rel: "\u5F1F\u5F1F", risk: "\u5173\u6CE8", detail: "\u81EA\u7531\u804C\u4E1A \xB7 \u8FD1\u671F\u67E5\u8BE2\u504F\u591A" },
          { id: "father_in_law", name: "\u674E\u56FD\u5F3A", type: "person", rel: "\u5CB3\u7236", detail: "\u5F02\u5730" },
          // 社交
          { id: "colleague", name: "\u8D75\u78CA", type: "person", rel: "\u540C\u4E8B", detail: "\u540C\u90E8\u95E8" },
          { id: "friend1", name: "\u738B\u6D9B", type: "person", rel: "\u670B\u53CB", risk: "\u5173\u6CE8", detail: "\u6709\u5171\u503A\u4EA4\u96C6" },
          { id: "friend2", name: "\u9648\u9759", type: "person", rel: "\u540C\u5B66", detail: "\u5F02\u5730" },
          { id: "ec", name: "\u5218\u6885", type: "person", rel: "\u7D27\u6025\u8054\u7CFB\u4EBA", phone: "135****6620", detail: "\u4EB2\u5C5E\u4E4B\u5916\u5907\u7528\u8054\u7CFB\u4EBA" },
          // 账户
          { id: "acc_bank", name: "\u672C\u884C\u50A8\u84C4\u5361", type: "account", rel: "\u7ED3\u7B97\u8D26\u6237", detail: "6217****8821" },
          { id: "acc_wx", name: "\u5FAE\u4FE1\u652F\u4ED8", type: "account", rel: "\u5173\u8054\u8D26\u6237", detail: "wxid_****m9k2" },
          { id: "acc_zfb", name: "\u652F\u4ED8\u5B9D", type: "account", rel: "\u5173\u8054\u8D26\u6237", detail: "2088****3391" },
          { id: "acc_other", name: "\u62DB\u884C\u501F\u8BB0\u5361", type: "account", rel: "\u4ED6\u884C\u8D26\u6237", detail: "6225****1109" },
          // 经营 / 企业
          { id: "emp", name: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280", type: "company", rel: "\u4EFB\u804C\u5355\u4F4D", detail: "\u8F6F\u4EF6\u5DE5\u7A0B\u5E08 \xB7 \u5DE5\u8D44\u53D1\u653E\u65B9" },
          { id: "biz", name: "\u660E\u8FDC\u7F51\u7EDC\u5DE5\u4F5C\u5BA4", type: "company", rel: "\u7ECF\u8425\u4E3B\u4F53", detail: "\u4E2A\u4F53\u5DE5\u5546\u6237 \xB7 \u672C\u4EBA\u7ECF\u8425" },
          { id: "supplier", name: "\u665F\u8FBE\u4F9B\u5E94\u94FE", type: "company", rel: "\u5408\u4F5C\u65B9", risk: "\u5173\u6CE8", detail: "\u7ECF\u8425\u5F80\u6765" },
          // 共债
          { id: "co1", name: "\u5468\u654F", type: "person", rel: "\u5171\u503A\u5173\u8054", risk: "\u9AD8\u5371", openAlerts: 2, detail: "\u540C\u5171\u503A\u5708" },
          { id: "co2", name: "\u5218\u6D0B", type: "person", rel: "\u5171\u503A\u5173\u8054", risk: "\u9AD8\u5371", openAlerts: 1, detail: "\u540C\u5171\u503A\u5708" },
          { id: "co3", name: "\u6797\u6653", type: "person", rel: "\u540C\u8BBE\u5907\u8D26\u53F7", risk: "\u9AD8\u5371", openAlerts: 1, detail: "\u5171\u4EAB\u8BBE\u5907" },
          { id: "org_a", name: "\u82B1\u5457", type: "org", rel: "\u5171\u503A\u673A\u6784", detail: "\u6D88\u8D39\u4FE1\u8D37" },
          { id: "org_b", name: "\u501F\u5457", type: "org", rel: "\u5171\u503A\u673A\u6784", detail: "\u6D88\u8D39\u4FE1\u8D37" },
          { id: "org_c", name: "\u67D0\u6D88\u8D39\u91D1\u878D", type: "org", rel: "\u5171\u503A\u673A\u6784", risk: "\u5173\u6CE8", detail: "\u6301\u724C\u673A\u6784" },
          // 担保
          { id: "guar_biz", name: "\u660E\u8FDC\u5DE5\u4F5C\u5BA4\u62C5\u4FDD", type: "company", rel: "\u62C5\u4FDD\u4E3B\u4F53", detail: "\u7ECF\u8425\u5B9E\u4F53\u62C5\u4FDD" },
          // 设备
          { id: "dev1", name: "iPhone 14", type: "device", rel: "\u5E38\u7528\u8BBE\u5907", detail: "\u5E38\u7528\u767B\u5F55" },
          { id: "dev2", name: "\u5171\u4EAB\u8BBE\u5907\xB7OPPO", type: "device", rel: "\u5171\u4EAB\u8BBE\u5907", risk: "\u9AD8\u5371", detail: "\u591A\u4EBA\u5171\u7528" }
        ],
        edges: [
          // 家族
          { source: "self", target: "spouse", rel: "\u914D\u5076", theme: "\u5BB6\u65CF", since: "2026-08-08" },
          { source: "self", target: "father", rel: "\u7236\u5B50", theme: "\u5BB6\u65CF", since: "2026-08-01" },
          { source: "self", target: "mother", rel: "\u6BCD\u5B50", theme: "\u5BB6\u65CF", since: "2026-07-20" },
          { source: "self", target: "brother", rel: "\u5144\u5F1F", theme: "\u5BB6\u65CF", since: "2026-07-25" },
          { source: "spouse", target: "father_in_law", rel: "\u7FC1\u5A7F", theme: "\u5BB6\u65CF", since: "2026-06-15" },
          // 社交
          { source: "self", target: "colleague", rel: "\u540C\u4E8B", theme: "\u793E\u4EA4", since: "2026-08-07" },
          { source: "self", target: "friend1", rel: "\u670B\u53CB", theme: "\u793E\u4EA4", since: "2026-08-05" },
          { source: "self", target: "friend2", rel: "\u540C\u5B66", theme: "\u793E\u4EA4", since: "2026-03-01" },
          { source: "self", target: "ec", rel: "\u7D27\u6025\u8054\u7CFB\u4EBA", theme: "\u793E\u4EA4", since: "2026-07-10" },
          { source: "friend1", target: "co2", rel: "\u793E\u4EA4\u4EA4\u96C6", theme: "\u793E\u4EA4", since: "2026-07-03" },
          // 资金
          { source: "self", target: "acc_bank", rel: "\u672C\u884C\u8D26\u6237", theme: "\u8D44\u91D1", since: "2026-08-09" },
          { source: "self", target: "acc_wx", rel: "\u5FAE\u4FE1", theme: "\u8D44\u91D1", since: "2026-08-09" },
          { source: "self", target: "acc_zfb", rel: "\u652F\u4ED8\u5B9D", theme: "\u8D44\u91D1", since: "2026-08-09" },
          { source: "self", target: "acc_other", rel: "\u4ED6\u884C\u8D26\u6237", theme: "\u8D44\u91D1", since: "2026-08-02" },
          { source: "emp", target: "self", rel: "\u5DE5\u8D44\u5165\u8D26", theme: "\u8D44\u91D1", since: "2026-08-05" },
          { source: "self", target: "biz", rel: "\u7ECF\u8425\u6536\u6B3E", theme: "\u8D44\u91D1", since: "2026-08-06" },
          // 经营
          { source: "self", target: "emp", rel: "\u4EFB\u804C", theme: "\u7ECF\u8425", since: "2026-08-05" },
          { source: "self", target: "biz", rel: "\u7ECF\u8425", theme: "\u7ECF\u8425", since: "2026-08-06" },
          { source: "biz", target: "supplier", rel: "\u4F9B\u5E94\u94FE", theme: "\u7ECF\u8425", since: "2026-07-28" },
          { source: "emp", target: "biz", rel: "\u5173\u8054", theme: "\u7ECF\u8425", since: "2026-08-06" },
          // 共债
          { source: "self", target: "co1", rel: "\u5171\u503A", theme: "\u5171\u503A", danger: true, since: "2026-06-20" },
          { source: "self", target: "co2", rel: "\u5171\u503A", theme: "\u5171\u503A", danger: true, since: "2026-07-03" },
          { source: "self", target: "co3", rel: "\u5171\u503A/\u540C\u8BBE\u5907", theme: "\u5171\u503A", danger: true, since: "2026-07-15" },
          { source: "self", target: "org_a", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true, since: "2026-05-12" },
          { source: "self", target: "org_b", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true, since: "2026-05-12" },
          { source: "self", target: "org_c", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true, since: "2026-06-08" },
          { source: "co1", target: "co2", rel: "\u5171\u503A\u94FE\u6761", theme: "\u5171\u503A", danger: true, since: "2026-07-03" },
          { source: "co1", target: "co3", rel: "\u540C\u8BBE\u5907", theme: "\u5171\u503A", danger: true, since: "2026-07-15" },
          { source: "org_a", target: "org_b", rel: "\u591A\u5934", theme: "\u5171\u503A", danger: true, since: "2026-05-12" },
          // 担保
          { source: "self", target: "spouse", rel: "\u62C5\u4FDD\uFF08\u914D\u5076\uFF09", theme: "\u62C5\u4FDD", since: "2026-08-08" },
          { source: "self", target: "guar_biz", rel: "\u62C5\u4FDD\uFF08\u7ECF\u8425\u5B9E\u4F53\uFF09", theme: "\u62C5\u4FDD", since: "2026-08-06" },
          { source: "guar_biz", target: "org_a", rel: "\u62C5\u4FDD\u4EE3\u507F", theme: "\u62C5\u4FDD", since: "2026-05-12" },
          // 设备
          { source: "self", target: "dev1", rel: "\u5E38\u7528\u8BBE\u5907", theme: "\u8BBE\u5907", since: "2026-08-09" },
          { source: "self", target: "dev2", rel: "\u5171\u4EAB\u8BBE\u5907", theme: "\u8BBE\u5907", danger: true, since: "2026-07-28" },
          { source: "co3", target: "dev2", rel: "\u540C\u8BBE\u5907", theme: "\u8BBE\u5907", danger: true, since: "2026-07-28" }
        ],
        themes: ["\u7EFC\u5408", "\u5BB6\u65CF", "\u793E\u4EA4", "\u8D44\u91D1", "\u7ECF\u8425", "\u5171\u503A", "\u62C5\u4FDD", "\u8BBE\u5907"],
        collectedAt: "2026-08-10 02:15\uFF08T+1 \u6279\u8DD1\uFF09",
        source: "\u5173\u7CFB\u6316\u6398\u5F15\u64CE \xB7 \u878D\u5408\u7533\u8BF7 / \u8BBE\u5907 / \u5F81\u4FE1 / \u5171\u503A"
      },
      coDebt: {
        applications30d: 1,
        orgs: [{ org: "\u672C\u884C", product: "\u6D88\u8D39\u8D37", balance: 86e3, status: "\u5728\u8D37" }],
        chain: ["\u672C\u884C\u6D88\u8D39\u8D37 \u2192 \u672C\u884C\u6559\u80B2\u5206\u671F\uFF08\u540C\u4E00\u5BA2\u6237\uFF09"]
      },
      collections: [],
      postRisk: {
        fundFlow: [
          { date: "2026-08-05", direction: "\u51FA", counterparty: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280", amount: 28e3, flag: "\u5DE5\u8D44\u5165\u8D26" },
          { date: "2026-08-06", direction: "\u51FA", counterparty: "\u623F\u8D37\u6263\u6B3E", amount: 6800, flag: "\u6B63\u5E38\u8FD8\u6B3E" }
        ],
        blacklist: [{ list: "\u672C\u884C\u9ED1\u540D\u5355", hit: "\u672A\u547D\u4E2D", status: "\u6B63\u5E38" }]
      },
      disposeLog: [
        { time: "2026-07-28 10:12", kind: "op", title: "\u989D\u5EA6\u4F7F\u7528\u7387\u9884\u8B66\u95ED\u73AF", sub: "\u7CFB\u7EDF\u81EA\u52A8\u590D\u6838\u540E\u5173\u95ED" },
        { time: "2026-06-15 14:30", kind: "task", title: "\u67E5\u8BE2\u504F\u591A\u6838\u67E5", sub: "\u5DF2\u6838\u67E5\u4E3A\u6B63\u5E38\u4FE1\u8D37\u9700\u6C42", status: "\u5DF2\u95ED\u73AF" }
      ],
      creditReportLog: [
        { time: "2026-08-09 10:09", kind: "credit", title: "\u592E\u884C\u5F81\u4FE1\u8C03\u53D6\uFF08\u8FDB\u4EF6\u6388\u6743\u786C\u67E5\u8BE2\uFF09", sub: "\u5BA2\u6237\u6388\u6743\u540E\u62C9\u53D6 \xB7 \u62A5\u544A\u7F16\u53F7 PBOC-2026-0809-100237 \xB7 \u673A\u6784\u6570 3" },
        { time: "2026-08-10 02:15", kind: "credit", title: "\u592E\u884C\u5F81\u4FE1\u590D\u62C9\uFF08\u8D37\u4E2D\u591C\u95F4\u8F6F\u67E5\u8BE2\uFF09", sub: "\u589E\u91CF\u6279\u8DD1\u5237\u65B0\u76D1\u63A7\u7279\u5F81 \xB7 \u65E0\u65B0\u589E\u786C\u67E5\u8BE2" }
      ],
      litigation: [],
      followed: false
    },
    {
      custId: "CUST-100891",
      name: "\u9648\u6653\u6960",
      maskedId: "4401**********5566",
      status: "\u903E\u671F",
      tags: ["\u5171\u503A\u5ACC\u7591", "\u8D37\u4E2D\u9884\u8B66"],
      avatarText: "\u9648",
      gender: "\u5973",
      age: 29,
      region: "\u5E7F\u4E1C\u7701\u6DF1\u5733\u5E02",
      occupation: "\u81EA\u7531\u804C\u4E1A",
      employer: "\u4E2A\u4F53\u7ECF\u8425\uFF08\u7535\u5546\uFF09",
      income: 15e3,
      education: "\u5927\u4E13",
      marital: "\u672A\u5A5A",
      phone: "159****3380",
      phones: [
        { number: "159****3380", verified: true },
        { number: "158****7712", verified: false }
      ],
      email: "chen.xn@shop.com",
      addresses: [
        { type: "\u6237\u7C4D\u5730\u5740", value: "\u5E7F\u4E1C\u7701\u6DF1\u5733\u5E02\u798F\u7530\u533A\u534E\u5F3A\u5317\u8DEF 12 \u53F7" },
        { type: "\u5C45\u4F4F\u5730\u5740", value: "\u5E7F\u4E1C\u7701\u6DF1\u5733\u5E02\u9F99\u534E\u533A\u6C11\u6CBB\u8857\u9053 33 \u680B" },
        { type: "\u516C\u53F8\u5730\u5740", value: "\u5E7F\u4E1C\u7701\u6DF1\u5733\u5E02\u9F99\u5C97\u533A\u534E\u5357\u57CE\u7535\u5546\u5927\u53A6 5F" }
      ],
      creditLimit: 12e4,
      usedLimit: 118e3,
      availLimit: 2e3,
      totalDebt: 118e3,
      monthlyPay: 6120,
      overdueDays: 23,
      overdueAmt: 6120,
      loans: [
        { id: "LN-77320", product: "\u5927\u989D\u5206\u671F\xB7\u7ECF\u8425", principal: 8e4, balance: 71e3, rate: 15.4, term: 24, monthly: 4120, status: "\u903E\u671F", dueDays: 23 },
        { id: "LN-79002", product: "\u968F\u501F\u968F\u8FD8\xB7\u6D88\u8D39\u8D37", principal: 6e4, balance: 47e3, rate: 16.8, term: 12, monthly: 2e3, status: "\u903E\u671F", dueDays: 11 }
      ],
      behavior: [
        { name: "\u7528\u4FE1\u7B14\u6570", count: 71, category: "\u7528\u4FE1", desc: "\u7D2F\u8BA1\u501F\u6B3E\u652F\u7528\u6B21\u6570" },
        { name: "\u63D0\u524D\u8FD8\u6B3E", count: 0, category: "\u8FD8\u6B3E", desc: "\u63D0\u524D\u7ED3\u6E05\u7B14\u6570" },
        { name: "\u6B63\u5E38\u8FD8\u6B3E", count: 14, category: "\u8FD8\u6B3E", desc: "\u6309\u671F\u8FD8\u6B3E\u7B14\u6570" },
        { name: "\u903E\u671F\u8FD8\u6B3E", count: 9, danger: true, category: "\u8FD8\u6B3E", desc: "\u53D1\u751F\u903E\u671F\u7684\u7B14\u6570" },
        { name: "\u673A\u6784\u67E5\u8BE2", count: 19, category: "\u67E5\u8BE2", desc: "\u8FD1 90 \u5929\u673A\u6784\u5F81\u4FE1\u67E5\u8BE2\u6B21\u6570" },
        { name: "\u591A\u5934\u501F\u8D37", count: 6, danger: true, category: "\u67E5\u8BE2", desc: "\u540C\u65F6\u5728\u8D37\u673A\u6784\u6570" },
        { name: "\u591C\u95F4\u7528\u4FE1", count: 33, danger: true, category: "\u7528\u4FE1", desc: "23:00-05:00 \u7528\u4FE1\u7B14\u6570" },
        { name: "\u989D\u5EA6\u4F7F\u7528\u7387", count: 98, danger: true, category: "\u7528\u4FE1", desc: "\u5DF2\u7528 / \u6388\u4FE1\uFF08%\uFF09" }
      ],
      alerts: [
        { id: "AL-2026-0401", rule: "\u8FDE\u7EED\u903E\u671F \u2265 20 \u5929", level: "\u7EA2", date: "2026-08-02", desc: "\u4E3B\u501F\u4EA7\u54C1\u903E\u671F\u8D85 20 \u5929\uFF0C\u89E6\u53D1\u7EA2\u706F\u9884\u8B66", status: "\u5F85\u5904\u7F6E" },
        { id: "AL-2026-0388", rule: "\u591A\u5934\u501F\u8D37 \u2265 5 \u5BB6\u673A\u6784", level: "\u7EA2", date: "2026-07-22", desc: "\u8DE8\u673A\u6784\u501F\u8D37\u96C6\u4E2D\uFF0C\u5171\u503A\u98CE\u9669\u9AD8", status: "\u5904\u7F6E\u4E2D" },
        { id: "AL-2026-0410", rule: "\u8BBE\u5907\u73AF\u5883\u98CE\u9669 \u2265 80", level: "\u7EA2", date: "2026-08-09", desc: "\u6A21\u62DF\u5668 + \u540C\u8BBE\u5907\u591A\u8D26\u53F7\uFF0C\u7591\u4F3C\u56E2\u4F19\u6B3A\u8BC8", status: "\u5F85\u5904\u7F6E" },
        { id: "AL-2026-0399", rule: "\u5173\u8054\u8D26\u6237\u8D44\u91D1\u56DE\u6D41", level: "\u9EC4", date: "2026-08-03", desc: "\u8D37\u540E\u8D44\u91D1\u6D41\u5411\u5171\u503A\u5173\u8054\u4EBA\uFF0C\u7591\u4F3C\u4EE5\u8D37\u517B\u8D37", status: "\u5904\u7F6E\u4E2D" },
        { id: "AL-2026-0355", rule: "\u989D\u5EA6\u4F7F\u7528\u7387 \u2265 95%", level: "\u9EC4", date: "2026-07-05", desc: "\u989D\u5EA6\u8FD1\u4E4E\u7528\u6EE1\uFF0C\u518D\u878D\u8D44\u7A7A\u95F4\u6781\u4F4E", status: "\u5DF2\u95ED\u73AF" }
      ],
      scores: {
        zhiCha: {
          name: "\u667A\u5BDF\uFF08\u53CD\u6B3A\u8BC8\uFF09",
          score: 412,
          level: "\u5DEE"
        },
        zhiXin: {
          name: "\u667A\u4FE1\uFF08\u4FE1\u7528\uFF09",
          score: 388,
          level: "\u5DEE"
        },
        zhiRong: {
          name: "\u667A\u878D\uFF08\u7EFC\u5408\uFF09",
          score: 351,
          level: "\u5DEE"
        },
        limitSuggest: { suggested: 0, current: 12e4 }
      },
      credit: {
        header: { reportNo: "PBOC-2026-0812-0023", queryTime: "2026-08-12 14:05:40", queriedBy: "\u674E\u5F3A", idNo: "4401**********5678" },
        recentQueries: [
          { org: "\u672C\u884C", date: "2026-07-22", type: "\u8D37\u540E\u7BA1\u7406" },
          { org: "\u9A6C\u4E0A\u6D88\u91D1", date: "2026-07-18", type: "\u8D37\u6B3E\u5BA1\u6279" },
          { org: "360 \u501F\u6761", date: "2026-07-10", type: "\u8D37\u6B3E\u5BA1\u6279" },
          { org: "\u4EAC\u4E1C\u91D1\u6761", date: "2026-06-29", type: "\u8D37\u6B3E\u5BA1\u6279" },
          { org: "\u5FAE\u7C92\u8D37", date: "2026-06-21", type: "\u8D37\u6B3E\u5BA1\u6279" }
        ],
        selfQueries: [
          { date: "2026-06-10", type: "\u672C\u4EBA\u67E5\u8BE2\uFF08\u5546\u4E1A\u94F6\u884C\u7F51\u4E0A\u94F6\u884C\uFF09" }
        ],
        accounts: [
          { type: "\u6D88\u8D39\u8D37", bank: "\u672C\u884C", openDate: "2025-02-20", dueDate: "2027-02-19", creditLimit: 2e5, balance: 118e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 2, overdueAmt: 3900, status: "\u903E\u671F" },
          { type: "\u6D88\u8D39\u8D37", bank: "\u9A6C\u4E0A\u6D88\u91D1", openDate: "2025-05-11", dueDate: "2026-05-10", creditLimit: 6e4, balance: 42e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 1, overdueAmt: 2220, status: "\u903E\u671F" },
          { type: "\u73B0\u91D1\u8D37", bank: "360 \u501F\u6761", openDate: "2025-09-03", dueDate: "2026-09-02", creditLimit: 3e4, balance: 28e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 0, overdueAmt: 0, status: "\u6B63\u5E38" },
          { type: "\u4FE1\u7528\u5361", bank: "\u5E7F\u53D1\u94F6\u884C", openDate: "2023-08-15", dueDate: "--", creditLimit: 4e4, balance: 35e3, currency: "\u4EBA\u6C11\u5E01", guarantee: "\u4FE1\u7528", overdueMonths: 0, overdueAmt: 0, status: "\u5173\u6CE8" }
        ],
        agreements: [
          { id: "AG-BANK-101", org: "\u672C\u884C", limit: 2e5, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2025-02-20", expireDate: "2027-02-19", status: "\u6B63\u5E38" },
          { id: "AG-MASHANG-102", org: "\u9A6C\u4E0A\u6D88\u91D1", limit: 6e4, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2025-05-11", expireDate: "2026-05-10", status: "\u6B63\u5E38" },
          { id: "AG-360-103", org: "360 \u501F\u6761", limit: 3e4, currency: "\u4EBA\u6C11\u5E01", shareAccounts: 1, effectiveDate: "2025-09-03", expireDate: "2026-09-02", status: "\u6B63\u5E38" }
        ],
        summary: { creditCards: 1, loans: 3, overdueAccounts: 2, overdue90Plus: 0, guaranteeCount: 1, relatedRepay: 1 },
        summaryAmount: { firstBizYear: 2023, openCreditLimit: 33e4, usedBalance: 223e3, maxMonthlyOverdue: 3900, longestOverdueMonths: 2 },
        relatedRepayList: [
          { name: "\u738B\u82B3", relation: "\u914D\u5076", org: "\u672C\u884C", product: "\u6D88\u8D39\u8D37", amount: 118e3, status: "\u6B63\u5E38" }
        ],
        publicRecords: [
          { type: "\u5F3A\u5236\u6267\u884C", org: "\u676D\u5DDE\u5E02\u897F\u6E56\u533A\u4EBA\u6C11\u6CD5\u9662", date: "2026-05-12", content: "\u91D1\u878D\u501F\u6B3E\u5408\u540C\u7EA0\u7EB7\uFF0C\u6267\u884C\u6807\u7684 \xA538,000", status: "\u672A\u5C65\u884C" }
        ],
        overdue: { count: 2, amount: 6120 },
        guarantee: [{ name: "\u4E3A\u5468\u654F\u62C5\u4FDD", amount: 5e4, status: "\u5173\u6CE8" }],
        annotations: [
          { type: "\u5F02\u8BAE\u6807\u6CE8", content: "\u5BA2\u6237\u5BF9\u300C\u9A6C\u4E0A\u6D88\u91D1\u300D\u4E00\u7B14\u903E\u671F\u8BB0\u5F55\u63D0\u51FA\u5F02\u8BAE\uFF0C\u7ECF\u529E\u673A\u6784\u6838\u67E5\u4E2D", date: "2026-07-15" }
        ]
      },
      device: {
        device: "\u672A\u77E5 Android",
        model: "Pixel_Emulator",
        os: "Android 13 (\u6A21\u62DF\u5668)",
        envRiskScore: 86,
        simulator: true,
        sameDeviceAccounts: [
          { custId: "CUST-100891", name: "\u9648\u6653\u6960" },
          { custId: "CUST-100902", name: "\u6797\u6653" },
          { custId: "CUST-100915", name: "\u8D75\u857E" }
        ],
        loginRegion: "\u5E7F\u4E1C\u7701\u4E1C\u839E\u5E02",
        lastLogin: "2026-08-09 02:11"
      },
      externalChecks: [
        { source: "\u516C\u5B89", item: "\u8BC1\u4EF6\u6838\u9A8C", result: "\u8BC1\u4EF6\u53F7\u4E0E\u59D3\u540D\u4E00\u81F4", status: "\u4E00\u81F4", field: "maskedId", verifyOrg: "\u516C\u5B89\u90E8\u516C\u6C11\u8EAB\u4EFD\u4FE1\u606F\u5E93", verifyTime: "2026-08-09 09:58", cost: 0 },
        { source: "\u8FD0\u8425\u5546", item: "\u624B\u673A\u53F7\u5B9E\u540D", result: "\u5B9E\u540D\u8BA4\u8BC1\u4E00\u81F4", status: "\u4E00\u81F4", field: "phone", verifyOrg: "\u4E2D\u56FD\u79FB\u52A8\u5B9E\u540D\u5E93", verifyTime: "2026-08-09 09:59", cost: 0.2 },
        { source: "\u90AE\u7BB1\u670D\u52A1", item: "\u90AE\u7BB1\u6709\u6548\u6027", result: "\u9000\u4FE1\u3001\u7591\u4F3C\u5931\u6548", status: "\u5F02\u5E38", field: "email", verifyOrg: "\u90AE\u7BB1\u670D\u52A1\u5546", verifyTime: "2026-08-09 09:59", cost: 0 },
        { source: "\u5DE5\u5546", item: "\u540D\u4E0B\u4F01\u4E1A", result: "\u4E2A\u4F53\u6237\xB7\u7535\u5546\uFF08\u5B58\u7EED\uFF09", status: "\u4E00\u81F4", verifyOrg: "\u56FD\u5BB6\u4F01\u4E1A\u4FE1\u7528\u4FE1\u606F\u516C\u793A\u7CFB\u7EDF", verifyTime: "2026-08-09 10:01", cost: 0.5 },
        { source: "\u53F8\u6CD5", item: "\u6D89\u8BC9\u67E5\u8BE2", result: "\u6C11\u95F4\u501F\u8D37\u7EA0\u7EB7 1 \u8D77", status: "\u5F02\u5E38", verifyOrg: "\u4E2D\u56FD\u6267\u884C\u4FE1\u606F\u516C\u5F00\u7F51", verifyTime: "2026-08-09 10:02", cost: 0.5 },
        { source: "\u7A0E\u52A1", item: "\u4E2A\u7A0E\u7F34\u7EB3", result: "\u8FD1 6 \u6708\u65E0\u7533\u62A5", status: "\u5F02\u5E38", field: "income", verifyOrg: "\u81EA\u7136\u4EBA\u7535\u5B50\u7A0E\u52A1\u5C40", verifyTime: "2026-08-09 10:03", cost: 0.3 },
        { source: "\u793E\u4FDD\u516C\u79EF\u91D1", item: "\u793E\u4FDD\u72B6\u6001", result: "\u65AD\u7F34\u8D85 12 \u4E2A\u6708", status: "\u5F02\u5E38", field: "income", verifyOrg: "\u4EBA\u793E / \u516C\u79EF\u91D1\u4E2D\u5FC3", verifyTime: "2026-08-09 10:04", cost: 0.3 }
      ],
      collateralBiz: {
        collateral: [{ name: "\u7535\u5546\u5E97\u94FA\u7ECF\u8425\u6743", type: "\u7ECF\u8425\u6743\u8D28\u62BC", value: 6e4, status: "\u8BC4\u4F30\u4E2D", verifyOrg: "\u7ECF\u8425\u6743\u767B\u8BB0\u5E73\u53F0", verifyTime: "2026-08-09 11:20", verified: false }],
        business: [{ name: "\u6DF1\u5733\u5E02\u67D0\u7535\u5546\u5546\u884C", role: "\u7ECF\u8425\u8005\uFF08\u4E2A\u4F53\u5DE5\u5546\u6237\uFF09", status: "\u5B58\u7EED", creditCode: "92440300MA5F3XK88", legalRep: "\u9648\u6653\u6960", regCapital: 20, regDate: "2024-07-22", industry: "\u96F6\u552E\u4E1A", risk: "\u5173\u6CE8", riskTags: ["\u7ECF\u8425\u5F02\u5E38 1 \u6B21", "\u53F8\u6CD5\u6D89\u8BC9 1 \u8D77"], riskItems: [{ type: "\u7ECF\u8425\u5F02\u5E38", date: "2026-03-10", reason: "\u901A\u8FC7\u767B\u8BB0\u7684\u4F4F\u6240\u6216\u8005\u7ECF\u8425\u573A\u6240\u65E0\u6CD5\u8054\u7CFB\uFF0C\u88AB\u5217\u5165\u7ECF\u8425\u5F02\u5E38\u540D\u5F55" }, { type: "\u53F8\u6CD5\u6D89\u8BC9", date: "2026-05-18", reason: "\u6C11\u95F4\u501F\u8D37\u7EA0\u7EB7\uFF08\u88AB\u544A\uFF09\uFF0C\u6848\u53F7 (2026)\u7CA40305\u6C11\u521D1234\uFF0C\u6DF1\u5733\u5E02\u5357\u5C71\u533A\u4EBA\u6C11\u6CD5\u9662" }], litigationCount: 1, penaltyCount: 0, healthScore: 45, verifyOrg: "\u56FD\u5BB6\u4F01\u4E1A\u4FE1\u7528\u4FE1\u606F\u516C\u793A\u7CFB\u7EDF", verifyTime: "2026-08-09 10:01", verified: true }],
        guaranteeAlert: { level: "\u9EC4", rule: "\u62B5\u62BC\u7269\u8BC4\u4F30\u672A\u5B8C\u6210", desc: "\u7535\u5546\u5E97\u94FA\u7ECF\u8425\u6743\u8D28\u62BC\u8BC4\u4F30\u4E2D\uFF0C\u62C5\u4FDD\u80FD\u529B\u5B58\u7591\uFF0C\u5EFA\u8BAE\u8865\u5145\u7B2C\u4E8C\u987A\u4F4D\u62C5\u4FDD" },
        bizHealth: { years: 2, monthlyRevenue: 22e3, stability: "\u6CE2\u52A8", score: 52 }
      },
      relationGraph: {
        nodes: [
          { id: "self", name: "\u9648\u6653\u6960", type: "self", rel: "\u672C\u4EBA", risk: "\u9AD8\u5371", openAlerts: 5 },
          { id: "zhou", name: "\u5468\u654F", type: "person", rel: "\u5171\u503A\u5173\u8054", risk: "\u9AD8\u5371", openAlerts: 2 },
          { id: "liu", name: "\u5218\u6D0B", type: "person", rel: "\u5171\u503A\u5173\u8054", risk: "\u9AD8\u5371", openAlerts: 1 },
          { id: "lin", name: "\u6797\u6653", type: "person", rel: "\u540C\u8BBE\u5907\u8D26\u53F7", risk: "\u9AD8\u5371", openAlerts: 1 },
          { id: "wang", name: "\u738B\u82B3", type: "person", rel: "\u4EB2\u5C5E" },
          { id: "shop", name: "\u6DF1\u5733\u67D0\u7535\u5546\u5546\u884C", type: "company", rel: "\u7ECF\u8425\u4E3B\u4F53", detail: "\u7ECF\u8425\u8005" },
          { id: "acc_wx", name: "\u5FAE\u4FE1\u652F\u4ED8", type: "account", rel: "\u5173\u8054\u8D26\u6237", detail: "wxid_****x3k" },
          { id: "acc_zfb", name: "\u652F\u4ED8\u5B9D", type: "account", rel: "\u5173\u8054\u8D26\u6237", detail: "2088****7712" },
          { id: "org_a", name: "\u82B1\u5457", type: "org", rel: "\u5171\u503A\u673A\u6784" },
          { id: "org_b", name: "\u501F\u5457", type: "org", rel: "\u5171\u503A\u673A\u6784" },
          { id: "org_c", name: "\u67D0\u6D88\u8D39\u91D1\u878D", type: "org", rel: "\u5171\u503A\u673A\u6784" },
          { id: "dev1", name: "\u5E38\u7528\u8BBE\u5907\xB7\u534E\u4E3A", type: "device", rel: "\u5E38\u7528\u8BBE\u5907" },
          { id: "dev2", name: "\u5171\u4EAB\u8BBE\u5907\xB7OPPO", type: "device", rel: "\u5171\u4EAB\u8BBE\u5907", risk: "\u9AD8\u5371" }
        ],
        edges: [
          { source: "self", target: "zhou", rel: "\u5171\u503A", theme: "\u5171\u503A", danger: true, since: "2026-07-20" },
          { source: "self", target: "liu", rel: "\u5171\u503A", theme: "\u5171\u503A", danger: true, since: "2026-07-25" },
          { source: "self", target: "lin", rel: "\u540C\u8BBE\u5907", theme: "\u5171\u503A", danger: true, since: "2026-07-22" },
          { source: "self", target: "org_a", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true, since: "2026-06-30" },
          { source: "self", target: "org_b", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true, since: "2026-06-30" },
          { source: "self", target: "org_c", rel: "\u5171\u503A\u673A\u6784", theme: "\u5171\u503A", danger: true, since: "2026-07-10" },
          { source: "zhou", target: "liu", rel: "\u5171\u503A\u94FE\u6761", theme: "\u5171\u503A", danger: true, since: "2026-07-25" },
          { source: "zhou", target: "lin", rel: "\u540C\u8BBE\u5907", theme: "\u5171\u503A", danger: true, since: "2026-07-22" },
          { source: "self", target: "shop", rel: "\u7ECF\u8425", theme: "\u7ECF\u8425", since: "2026-07-15" },
          { source: "self", target: "wang", rel: "\u4EB2\u5C5E", theme: "\u5BB6\u65CF", since: "2026-07-05" },
          { source: "self", target: "acc_wx", rel: "\u5FAE\u4FE1", theme: "\u8D44\u91D1", since: "2026-08-08" },
          { source: "self", target: "acc_zfb", rel: "\u652F\u4ED8\u5B9D", theme: "\u8D44\u91D1", since: "2026-08-08" },
          { source: "self", target: "dev1", rel: "\u5E38\u7528\u8BBE\u5907", theme: "\u8BBE\u5907", since: "2026-08-09" },
          { source: "self", target: "dev2", rel: "\u5171\u4EAB\u8BBE\u5907", theme: "\u8BBE\u5907", danger: true, since: "2026-07-28" },
          { source: "lin", target: "dev2", rel: "\u540C\u8BBE\u5907", theme: "\u8BBE\u5907", danger: true, since: "2026-07-28" }
        ],
        themes: ["\u7EFC\u5408", "\u5BB6\u65CF", "\u793E\u4EA4", "\u8D44\u91D1", "\u7ECF\u8425", "\u5171\u503A", "\u62C5\u4FDD", "\u8BBE\u5907"],
        collectedAt: "2026-08-10 02:15\uFF08T+1 \u6279\u8DD1\uFF09",
        source: "\u5173\u7CFB\u6316\u6398\u5F15\u64CE \xB7 \u878D\u5408\u7533\u8BF7 / \u8BBE\u5907 / \u5F81\u4FE1 / \u5171\u503A"
      },
      coDebt: {
        applications30d: 6,
        orgs: [
          { org: "\u672C\u884C", product: "\u7ECF\u8425\u8D37", balance: 71e3, status: "\u903E\u671F" },
          { org: "\u9A6C\u4E0A\u6D88\u91D1", product: "\u6D88\u8D39\u8D37", balance: 42e3, status: "\u903E\u671F" },
          { org: "360 \u501F\u6761", product: "\u73B0\u91D1\u8D37", balance: 28e3, status: "\u6B63\u5E38" },
          { org: "\u5FAE\u7C92\u8D37", product: "\u6D88\u8D39\u8D37", balance: 19e3, status: "\u5173\u6CE8" },
          { org: "\u4EAC\u4E1C\u91D1\u6761", product: "\u6D88\u8D39\u8D37", balance: 23e3, status: "\u6B63\u5E38" },
          { org: "\u5206\u671F\u4E50", product: "\u6D88\u8D39\u8D37", balance: 15e3, status: "\u903E\u671F" }
        ],
        chain: ["\u9648\u6653\u6960 \u2192 \u5468\u654F \u2192 \u5218\u6D0B\uFF08\u540C\u4E00\u8D44\u91D1\u4E2D\u4ECB\u5171\u503A\u94FE\u6761\uFF09", "\u9648\u6653\u6960 \u2194 \u6797\u6653\uFF08\u540C\u8BBE\u5907\u591A\u8D26\u53F7\uFF09"]
      },
      collections: [
        {
          id: "COL-2026-00771",
          stage: "M3+",
          product: "\u5927\u989D\u5206\u671F\xB7\u7ECF\u8425",
          status: "\u59D4\u5916",
          owner: "\u50AC\u6536\u5458\xB7\u5434\u654F",
          lastTouch: "2026-08-08",
          overdueAmt: 71e3,
          overdueDays: 23,
          dueDate: "2026-07-16",
          calls: 18,
          sms: 32,
          notes: [
            { time: "2026-08-08 10:02", who: "\u5434\u654F", what: "\u7B2C 3 \u6B21\u7535\u8BDD\uFF0C\u63A5\u901A\u540E\u627F\u8BFA\u672C\u5468\u8FD8\u6B3E 5000" },
            { time: "2026-08-05 19:30", who: "\u7CFB\u7EDF", what: "\u81EA\u52A8 SMS \u63D0\u9192\u5DF2\u53D1\u9001" },
            { time: "2026-08-01 09:15", who: "\u5434\u654F", what: "\u8054\u7CFB\u7D27\u6025\u8054\u7CFB\u4EBA\u738B\u6D69\uFF0C\u8F6C\u544A\u903E\u671F\u60C5\u51B5" }
          ]
        },
        {
          id: "COL-2026-00772",
          stage: "M2",
          product: "\u968F\u501F\u968F\u8FD8\xB7\u6D88\u8D39\u8D37",
          status: "\u627F\u8BFA\u8FD8\u6B3E",
          owner: "\u50AC\u6536\u5458\xB7\u5434\u654F",
          lastTouch: "2026-08-07",
          overdueAmt: 47e3,
          overdueDays: 11,
          dueDate: "2026-07-28",
          calls: 9,
          sms: 21,
          notes: [{ time: "2026-08-07 14:20", who: "\u5434\u654F", what: "\u5BA2\u6237\u8868\u793A\u8D44\u91D1\u5468\u8F6C\u4E2D\uFF0C\u627F\u8BFA 8 \u6708\u5E95\u524D\u7ED3\u6E05" }]
        }
      ],
      postRisk: {
        fundFlow: [
          { date: "2026-08-03", direction: "\u51FA", counterparty: "\u5468\u654F", amount: 12e3, flag: "\u7591\u4F3C\u8D44\u91D1\u56DE\u6D41" },
          { date: "2026-08-01", direction: "\u5165", counterparty: "\u672A\u77E5\u4E2A\u4EBA\u8D26\u6237", amount: 3e4, flag: "\u6765\u6E90\u4E0D\u660E" },
          { date: "2026-07-28", direction: "\u51FA", counterparty: "\u5206\u671F\u4E50", amount: 8e3, flag: "\u62C6\u501F\u8FD8\u6B3E" }
        ],
        blacklist: [
          { list: "\u672C\u884C\u9ED1\u540D\u5355", hit: "\u547D\u4E2D\uFF08\u8D37\u540E\uFF09", status: "\u9AD8\u98CE\u9669" },
          { list: "\u4E92\u91D1\u534F\u4F1A\u7070\u540D\u5355", hit: "\u547D\u4E2D", status: "\u5173\u6CE8" }
        ]
      },
      disposeLog: [
        { time: "2026-08-02 09:00", kind: "task", title: "\u8FDE\u7EED\u903E\u671F\u7EA2\u706F\u5904\u7F6E", sub: "\u6D3E\u53D1\u5904\u7F6E\u5DE5\u5355 D-2026-0401", status: "\u5F85\u5904\u7F6E" },
        { time: "2026-07-22 16:40", kind: "task", title: "\u591A\u5934\u5171\u503A\u6838\u67E5", sub: "\u6D3E\u53D1\u6838\u67E5\u5DE5\u5355 D-2026-0388", status: "\u5904\u7F6E\u4E2D" },
        { time: "2026-07-05 11:20", kind: "op", title: "\u989D\u5EA6\u4F7F\u7528\u7387\u9884\u8B66\u95ED\u73AF", sub: "\u7CFB\u7EDF\u81EA\u52A8\u590D\u6838\u540E\u5173\u95ED" }
      ],
      creditReportLog: [
        { time: "2026-08-09 10:05", kind: "credit", title: "\u592E\u884C\u5F81\u4FE1\u8C03\u53D6\uFF08\u8FDB\u4EF6\u6388\u6743\u786C\u67E5\u8BE2\uFF09", sub: "\u5BA2\u6237\u6388\u6743\u540E\u62C9\u53D6 \xB7 \u62A5\u544A\u7F16\u53F7 PBOC-2026-0809-100891 \xB7 \u673A\u6784\u6570 7", status: "\u5F02\u5E38" },
        { time: "2026-08-03 09:30", kind: "credit", title: "\u592E\u884C\u5F81\u4FE1\u590D\u62C9\uFF08\u903E\u671F\u89E6\u53D1\u8F6F\u67E5\u8BE2\uFF09", sub: "\u903E\u671F\u4E8B\u4EF6\u89E6\u53D1\u590D\u62C9 \xB7 \u8FD11\u6708\u67E5\u8BE2+4 \u6B21", status: "\u5F02\u5E38" }
      ],
      litigation: [
        { type: "\u88C1\u5224\u6587\u4E66", caseNo: "(2026)\u7CA40305\u6C11\u521D1234\u53F7", court: "\u6DF1\u5733\u5E02\u5357\u5C71\u533A\u4EBA\u6C11\u6CD5\u9662", filingDate: "2026-06-18", role: "\u88AB\u544A", amount: 85e3, status: "\u672A\u7ED3", desc: "\u6C11\u95F4\u501F\u8D37\u7EA0\u7EB7\uFF1A\u539F\u544A\u4E3B\u5F20\u507F\u8FD8\u501F\u6B3E\u672C\u91D1\u53CA\u5229\u606F\uFF0C\u5C1A\u5728\u5BA1\u7406\u4E2D" }
      ],
      followed: false
    }
  ]
};
var data = JSON.parse(JSON.stringify(SEED_CUST));
var version = 0;
var listeners2 = /* @__PURE__ */ new Set();
function emit2() {
  version++;
  listeners2.forEach((fn) => fn());
}
function useSnap(sel) {
  useSyncExternalStore2(
    (l) => {
      listeners2.add(l);
      return () => {
        listeners2.delete(l);
      };
    },
    () => version
  );
  return sel();
}
function useCustData() {
  return useSnap(() => data);
}
function toggleFollowCust(custId) {
  data = {
    ...data,
    customers: data.customers.map((c) => c.custId === custId ? { ...c, followed: !c.followed } : c)
  };
  emit2();
}

// src/console/CustProfile.tsx
import { Fragment as Fragment5, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var CRUMB = "\u96F6\u552E\u4FE1\u8D37\u98CE\u63A7 / \u8D37\u4E2D\u76D1\u63A7 / \u5355\u5BA2\u8BE6\u60C5";
function useScreenCols() {
  const calc = () => {
    if (typeof window === "undefined") return 3;
    const w = window.innerWidth;
    if (w >= 1080) return 3;
    if (w >= 720) return 2;
    return 1;
  };
  const [cols, setCols] = useState5(calc);
  useEffect5(() => {
    const onResize = () => setCols(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return cols;
}
function SummaryCard({ label, value, unit, danger }) {
  return /* @__PURE__ */ jsxs5("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "10px 12px" }, children: [
    /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, color: "#94A3B8" }, children: label }),
    /* @__PURE__ */ jsxs5("div", { style: { fontSize: 24, fontWeight: 500, color: danger ? "#DC2626" : "#1E293B", marginTop: 2 }, children: [
      value,
      /* @__PURE__ */ jsx5("span", { style: { fontSize: 12, color: "#94A3B8", marginLeft: 2 }, children: unit })
    ] })
  ] });
}
function OverviewTags({ cur }) {
  const redCount = cur.alerts.filter((a) => a.level === "\u7EA2").length;
  const items = [
    { label: "\u98CE\u9669\u7B49\u7EA7", value: cur.status, danger: cur.status !== "\u6B63\u5E38" },
    { label: "\u6388\u4FE1\u603B\u989D", value: money(cur.creditLimit) },
    { label: "\u5DF2\u7528\u989D\u5EA6", value: money(cur.usedLimit) },
    { label: "\u5728\u8D37\u4F59\u989D", value: money(cur.totalDebt) },
    { label: "\u5F53\u524D\u903E\u671F", value: money(cur.overdueAmt), danger: cur.overdueAmt > 0 },
    { label: "\u98CE\u9669\u9884\u8B66", value: `${cur.alerts.length} \u6761`, danger: redCount > 0 },
    { label: "\u5171\u503A\u673A\u6784", value: `${cur.coDebt.orgs.length} \u5BB6`, danger: cur.coDebt.orgs.some((o) => o.status === "\u903E\u671F") },
    { label: "\u8FD130\u5929\u591A\u5934", value: `${cur.coDebt.applications30d} \u6B21`, danger: cur.coDebt.applications30d >= 5 }
  ];
  return /* @__PURE__ */ jsx5("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 }, children: items.map((it) => /* @__PURE__ */ jsxs5(
    "span",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        padding: "5px 11px",
        borderRadius: 999,
        background: it.danger ? "#FEF2F2" : "#F1F5F9",
        border: it.danger ? "1px solid #FECACA" : "1px solid #E2E8F0",
        color: "#475569",
        whiteSpace: "nowrap"
      },
      children: [
        /* @__PURE__ */ jsx5("span", { style: { color: "#94A3B8" }, children: it.label }),
        /* @__PURE__ */ jsx5("b", { style: { color: it.danger ? "#DC2626" : "#1E293B", fontWeight: 600 }, children: it.value })
      ]
    },
    it.label
  )) });
}
function tabBadge(t, cur) {
  switch (t) {
    case "\u98CE\u9669\u9884\u8B66":
      return `${cur.alerts.length} \u9884\u8B66 \xB7 ${cur.litigation.length} \u6D89\u8BC9`;
    case "\u592E\u884C\u5F81\u4FE1":
      return `${cur.credit.accounts.length} \u6237`;
    case "\u62C5\u4FDD\u4E0E\u7ECF\u8425":
      return `${cur.collateralBiz.collateral.length} \u62BC\u54C1 \xB7 ${cur.collateralBiz.business.length} \u5B9E\u4F53`;
    case "\u6388\u4FE1\u8D1F\u503A\u4E0E\u5171\u503A":
      return `${cur.loans.length} \u501F\u636E \xB7 ${cur.coDebt.orgs.length} \u5171\u503A \xB7 ${cur.collections.length} \u50AC\u6536`;
    case "\u5173\u7CFB\u7F51\u7EDC":
      return `${cur.relationGraph.nodes.length} \u8282\u70B9`;
    default:
      return "";
  }
}
var STATUS_KIND = {
  \u6B63\u5E38: "green",
  \u5173\u6CE8: "amber",
  \u903E\u671F: "red",
  \u51BB\u7ED3: "gray"
};
var STAGE_KIND = { M1: "blue", M2: "amber", "M3+": "red" };
var SCORE_KIND = { \u4F18: "green", \u826F: "blue", \u4E2D: "amber", \u5DEE: "red" };
var TABS = [
  "\u57FA\u672C\u4FE1\u606F",
  "\u98CE\u9669\u9884\u8B66",
  "\u592E\u884C\u5F81\u4FE1",
  "\u62C5\u4FDD\u4E0E\u7ECF\u8425",
  "\u6388\u4FE1\u8D1F\u503A\u4E0E\u5171\u503A",
  "\u5173\u7CFB\u7F51\u7EDC"
];
function money(n) {
  return `\xA5${n.toLocaleString()}`;
}
function VerifyMark({ checks }) {
  const [hover, setHover] = useState5(false);
  const hasFail = checks.some((c) => c.status === "\u5F02\u5E38");
  const pending = checks.some((c) => c.status === "\u5F85\u6838");
  const status = hasFail ? "\u5F02\u5E38" : pending ? "\u5F85\u6838" : "\u4E00\u81F4";
  const color = status === "\u4E00\u81F4" ? "#16A34A" : status === "\u5F02\u5E38" ? "#CA8A04" : "#94A3B8";
  const icon = status === "\u4E00\u81F4" ? "\u2713" : status === "\u5F02\u5E38" ? "\u26A0" : "?";
  const tip = checks.map((c) => {
    const tail = [c.verifyOrg, c.verifyTime, c.cost != null ? `\xA5${c.cost}` : null].filter(Boolean).join(" \xB7 ");
    return `${c.source}\xB7${c.item}\uFF1A${c.result}\uFF08${c.status}\uFF09${tail ? ` \uFF5C ${tail}` : ""}`;
  }).join("\uFF1B");
  return /* @__PURE__ */ jsxs5(
    "span",
    {
      title: tip,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: { position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 6, cursor: "help" },
      children: [
        /* @__PURE__ */ jsx5("span", { style: { color, fontSize: 13, fontWeight: 700 }, children: icon }),
        status === "\u4E00\u81F4" && /* @__PURE__ */ jsx5("span", { style: { color, fontSize: 9, fontWeight: 700, marginLeft: 0.5 }, children: "!" }),
        hover && /* @__PURE__ */ jsx5(
          "span",
          {
            style: {
              position: "absolute",
              bottom: "150%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#0F172A",
              color: "#fff",
              fontSize: 11,
              lineHeight: 1.5,
              padding: "6px 9px",
              borderRadius: 8,
              whiteSpace: "nowrap",
              zIndex: 50,
              boxShadow: "0 4px 12px rgba(0,0,0,.18)"
            },
            children: tip
          }
        )
      ]
    }
  );
}
function ModelScorePanel({ scores, custId, source }) {
  const nav = useNavigate();
  const cards = [
    { prod: "zhicha", c: scores.zhiCha },
    { prod: "zhixin", c: scores.zhiXin },
    { prod: "zhirong", c: scores.zhiRong }
  ];
  const go = (prod) => {
    const back = source === "sc" ? "/console/cr/mid-single-cust?cust=" + custId + "&source=sc" : null;
    nav(`/console/cr/mid-cust-score?cust=${custId}&prod=${prod}` + (back ? "&back=" + encodeURIComponent(back) : ""));
  };
  return /* @__PURE__ */ jsxs5("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8, flex: 1, minHeight: 0 }, children: [
    /* @__PURE__ */ jsxs5("div", { style: { border: "1px solid #EDE9FE", borderRadius: 10, padding: 10, background: "#F5F3FF", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }, children: [
      /* @__PURE__ */ jsx5("div", { style: { fontSize: 11, fontWeight: 600, color: "#6D28D9" }, children: "\u989D\u5EA6\u5EFA\u8BAE" }),
      /* @__PURE__ */ jsx5("div", { style: { fontSize: 18, fontWeight: 800, color: "#6D28D9", marginTop: 3 }, children: money(scores.limitSuggest.suggested) }),
      /* @__PURE__ */ jsxs5("div", { style: { fontSize: 11, color: "#64748B", marginTop: 2 }, children: [
        "\u5F53\u524D ",
        money(scores.limitSuggest.current)
      ] })
    ] }),
    cards.map(({ prod, c }) => /* @__PURE__ */ jsxs5(
      "button",
      {
        onClick: () => go(prod),
        title: `\u67E5\u770B ${c.name} \u8BE6\u60C5`,
        style: {
          border: "1px solid #E2E8F0",
          borderRadius: 10,
          padding: 10,
          background: "#fff",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          height: "100%",
          justifyContent: "center",
          transition: "border-color .15s, box-shadow .15s"
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.borderColor = "#A78BFA";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(139,92,246,.12)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.borderColor = "#E2E8F0";
          e.currentTarget.style.boxShadow = "none";
        },
        children: [
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsx5("span", { style: { fontSize: 11, fontWeight: 600, color: "#334155" }, children: c.name }),
            /* @__PURE__ */ jsx5(Badge, { kind: SCORE_KIND[c.level], children: c.level })
          ] }),
          /* @__PURE__ */ jsx5("div", { style: { fontSize: 18, fontWeight: 800, color: "#0F172A" }, children: c.score }),
          /* @__PURE__ */ jsx5("div", { style: { height: 4, borderRadius: 3, background: "#EEF2FF", overflow: "hidden" }, children: /* @__PURE__ */ jsx5("div", { style: { height: "100%", width: `${Math.min(100, Math.round(c.score / 10))}%`, background: "#8B5CF6" } }) }),
          /* @__PURE__ */ jsx5("div", { style: { fontSize: 10, color: "#8B5CF6" }, children: "\u203A \u67E5\u770B\u6A21\u578B\u8BE6\u60C5" })
        ]
      },
      prod
    ))
  ] });
}
function logDotColor(e) {
  if (e.kind === "task") return "#2563EB";
  if (e.kind === "op") return "#7C3AED";
  if (e.kind === "verify") return e.status === "\u5F02\u5E38" ? "#DC2626" : "#10B981";
  return "#0EA5E9";
}
function logBadgeKind(e) {
  if (e.kind === "verify" || e.kind === "credit") return e.status === "\u5F02\u5E38" ? "red" : e.status === "\u5F85\u6838" ? "amber" : "green";
  return e.status === "\u5F85\u5904\u7F6E" ? "red" : e.status === "\u5904\u7F6E\u4E2D" ? "amber" : "green";
}
function logCat(e) {
  if (e.kind === "task") return "\u5904\u7F6E\u5DE5\u5355";
  if (e.kind === "op") return "\u5386\u53F2\u64CD\u4F5C";
  if (e.kind === "verify") return "\u81EA\u52A8\u6838\u9A8C";
  return "\u5F81\u4FE1\u8C03\u53D6";
}
function Timeline({ items }) {
  if (!items.length) return /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u6682\u65E0\u8BB0\u5F55" });
  return /* @__PURE__ */ jsxs5("div", { style: { position: "relative", paddingLeft: 18 }, children: [
    /* @__PURE__ */ jsx5("div", { style: { position: "absolute", left: 5, top: 4, bottom: 4, width: 2, background: "#E2E8F0" } }),
    items.map((e, i) => /* @__PURE__ */ jsxs5("div", { style: { position: "relative", paddingBottom: 16 }, children: [
      /* @__PURE__ */ jsx5("span", { style: { position: "absolute", left: -16, top: 4, width: 10, height: 10, borderRadius: 999, background: logDotColor(e), border: "2px solid #fff" } }),
      /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsx5("span", { style: { fontSize: 11, padding: "1px 8px", borderRadius: 999, background: "#F1F5F9", color: "#64748B", whiteSpace: "nowrap" }, children: logCat(e) }),
        /* @__PURE__ */ jsx5("span", { style: { fontSize: 13, fontWeight: 600, color: "#1E293B" }, children: e.title }),
        e.status && /* @__PURE__ */ jsx5(Badge, { kind: logBadgeKind(e), children: e.status })
      ] }),
      /* @__PURE__ */ jsxs5("div", { style: { fontSize: 12, color: "#64748B", marginTop: 2 }, children: [
        e.time,
        " \xB7 ",
        e.sub
      ] })
    ] }, i))
  ] });
}
function CustProfile({ custId, title = "\u5355\u5BA2\u8BE6\u60C5" }) {
  const d = useCustData();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const source = sp.get("source") ?? void 0;
  const isSc = source === "sc";
  const backParam = sp.get("back");
  const backTarget = backParam ? decodeURIComponent(backParam) : isSc ? "/console/sc/overview" : null;
  const cur = custId ? d.customers.find((c) => c.custId === custId) ?? d.customers[0] : d.customers[0];
  const [tab, setTab] = useState5("\u57FA\u672C\u4FE1\u606F");
  const [alertDetail, setAlertDetail] = useState5(null);
  const [relTheme, setRelTheme] = useState5("\u7EFC\u5408");
  const [relSel, setRelSel] = useState5(null);
  const [logFilter, setLogFilter] = useState5("\u5168\u90E8");
  const [logLimit, setLogLimit] = useState5(5);
  const fieldCols = useScreenCols();
  if (!cur) return /* @__PURE__ */ jsx5("div", { style: { padding: 24 }, children: "\u6682\u65E0\u5355\u5BA2\u6863\u6848" });
  const infoDefs = [
    { field: "custId", label: "\u5BA2\u6237\u6807\u8BC6", value: cur.custId },
    { field: "maskedId", label: "\u8BC1\u4EF6\u53F7\uFF08\u8131\u654F\uFF09", value: cur.maskedId },
    { field: "gender", label: "\u6027\u522B", value: cur.gender },
    { field: "age", label: "\u5E74\u9F84", value: `${cur.age} \u5C81` },
    { field: "education", label: "\u5B66\u5386", value: cur.education },
    { field: "marital", label: "\u5A5A\u59FB\u72B6\u51B5", value: cur.marital },
    { field: "region", label: "\u6240\u5728\u5730", value: cur.region }
  ];
  const jobDefs = [
    { field: "occupation", label: "\u804C\u4E1A", value: cur.occupation },
    { field: "employer", label: "\u5DE5\u4F5C\u5355\u4F4D", value: cur.employer },
    { field: "income", label: "\u6708\u6536\u5165", value: money(cur.income) }
  ];
  const contactDefs = [
    { field: "phone", label: "\u624B\u673A\u53F7", value: cur.phones[0].number },
    { field: "email", label: "\u90AE\u7BB1", value: cur.email },
    ...cur.addresses.map((a) => ({ field: "", label: a.type, value: a.value }))
  ];
  const [phoneHover, setPhoneHover] = useState5(false);
  const taxShots = cur.externalChecks.filter((e) => e.field === "income").map((e) => ({ title: `${e.source}\xB7${e.item}`, note: e.result, status: e.status }));
  const checksByField = {};
  cur.externalChecks.forEach((e) => {
    if (e.field) (checksByField[e.field] ??= []).push(e);
  });
  const verifyLogs = cur.externalChecks.map((e) => ({
    time: e.verifyTime ?? "",
    kind: "verify",
    title: `${e.source} \xB7 ${e.item}`,
    sub: `${e.result} \uFF5C ${e.verifyOrg ?? "\u6570\u636E\u6E90"}${e.cost != null ? ` \uFF5C \u82B1\u8D39 \xA5${e.cost}` : ""}`,
    status: e.status === "\u4E00\u81F4" ? "\u901A\u8FC7" : e.status === "\u5F02\u5E38" ? "\u5F02\u5E38" : "\u5F85\u6838"
  })).sort((a, b) => b.time.localeCompare(a.time));
  const creditLogs = [...cur.creditReportLog ?? []].sort((a, b) => b.time.localeCompare(a.time));
  const allLogs = [...cur.disposeLog, ...verifyLogs, ...creditLogs].sort((a, b) => b.time.localeCompare(a.time));
  const filteredLogs = logFilter === "\u5168\u90E8" ? allLogs : allLogs.filter((e) => logCat(e) === logFilter);
  const redCount = cur.alerts.filter((a) => a.level === "\u7EA2").length;
  const yellowCount = cur.alerts.filter((a) => a.level === "\u9EC4").length;
  const pendingCount = cur.alerts.filter((a) => a.status === "\u5F85\u5904\u7F6E").length;
  const alertCols = [
    { key: "id", label: "\u9884\u8B66\u53F7", type: "text", width: "140px" },
    { key: "rule", label: "\u547D\u4E2D\u89C4\u5219", type: "text" },
    { key: "level", label: "\u7B49\u7EA7", type: "badge", badgeKind: "red", width: "90px" },
    { key: "date", label: "\u89E6\u53D1\u65E5\u671F", type: "text", width: "120px" },
    { key: "desc", label: "\u8BF4\u660E", type: "text" },
    { key: "status", label: "\u5904\u7F6E\u72B6\u6001", type: "badge", badgeKind: "blue", width: "110px" }
  ];
  const alertRows = cur.alerts.map((a) => ({
    id: a.id,
    rule: a.rule,
    level: { v: a.level, kind: a.level === "\u7EA2" ? "red" : a.level === "\u9EC4" ? "amber" : "blue" },
    date: a.date,
    desc: a.desc,
    status: { v: a.status, kind: a.status === "\u5F85\u5904\u7F6E" ? "red" : a.status === "\u5904\u7F6E\u4E2D" ? "amber" : "green" }
  }));
  const BEHAVIOR_GROUPS = [
    { key: "\u7528\u4FE1", title: "\u7528\u4FE1\u884C\u4E3A", desc: "\u501F\u6B3E\u652F\u7528\u9891\u6B21\u3001\u65F6\u6BB5\u4E0E\u989D\u5EA6\u5360\u7528\uFF0C\u53CD\u6620\u8D44\u91D1\u9965\u6E34\u5EA6\u4E0E\u518D\u878D\u8D44\u503E\u5411" },
    { key: "\u8FD8\u6B3E", title: "\u8FD8\u6B3E\u884C\u4E3A", desc: "\u5386\u53F2\u8FD8\u6B3E\u5C65\u7EA6\u60C5\u51B5\uFF0C\u662F\u4FE1\u7528\u8BC4\u4F30\u6700\u6838\u5FC3\u7684\u56DE\u770B\u4FE1\u53F7" },
    { key: "\u67E5\u8BE2", title: "\u67E5\u8BE2\u4E0E\u591A\u5934", desc: "\u673A\u6784\u67E5\u8BE2\u4E0E\u8DE8\u673A\u6784\u501F\u8D37\u5BC6\u5EA6\uFF0C\u9884\u8B66\u591A\u5934\u5171\u503A\u4E0E\u4EE5\u8D37\u517B\u8D37" },
    { key: "\u98CE\u9669", title: "\u98CE\u9669\u6807\u8BB0", desc: "\u547D\u4E2D\u53CD\u6B3A\u8BC8 / \u98CE\u9669\u89C4\u5219\u7684\u884C\u4E3A\u4FE1\u53F7" }
  ];
  const dangerBehavior = cur.behavior.filter((b) => b.danger && b.count > 0).length;
  const devDanger = cur.device.envRiskScore >= 60 || cur.device.simulator;
  const sameDevRows = cur.device.sameDeviceAccounts.map((s, i) => ({ id: `d${i}`, name: s.name, custId: s.custId }));
  const queryCols = [
    { key: "org", label: "\u67E5\u8BE2\u673A\u6784", type: "text", fixed: "left", width: "200px" },
    { key: "date", label: "\u65E5\u671F", type: "text", width: "140px" },
    { key: "type", label: "\u67E5\u8BE2\u7C7B\u578B", type: "text" }
  ];
  const queryRows = cur.credit.recentQueries.map((q, i) => ({ id: `q${i}`, org: q.org, date: q.date, type: q.type }));
  const acctCols = [
    { key: "type", label: "\u8D26\u6237\u7C7B\u578B", type: "text", fixed: "left", width: "150px" },
    { key: "bank", label: "\u673A\u6784", type: "text", width: "150px" },
    { key: "openDate", label: "\u5F00\u7ACB\u65E5\u671F", type: "text", width: "120px" },
    { key: "dueDate", label: "\u5230\u671F\u65E5", type: "text", width: "120px" },
    { key: "creditLimit", label: "\u6388\u4FE1\u989D\u5EA6", type: "money", width: "130px" },
    { key: "balance", label: "\u4F59\u989D", type: "money", width: "130px" },
    { key: "guarantee", label: "\u62C5\u4FDD\u65B9\u5F0F", type: "text", width: "90px" },
    { key: "currency", label: "\u5E01\u79CD", type: "text", width: "90px" },
    { key: "overdue", label: "\u5F53\u524D\u903E\u671F", type: "text", width: "150px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "100px" }
  ];
  const acctRows = cur.credit.accounts.map((a, i) => ({
    id: `a${i}`,
    type: a.type,
    bank: a.bank,
    openDate: a.openDate,
    dueDate: a.dueDate,
    creditLimit: a.creditLimit,
    balance: a.balance,
    guarantee: a.guarantee,
    currency: a.currency,
    overdue: a.overdueMonths > 0 ? `${a.overdueMonths} \u671F \xB7 ${money(a.overdueAmt)}` : "\u2014",
    status: {
      v: a.status,
      kind: a.status === "\u903E\u671F" || a.status === "\u5446\u8D26" || a.status === "\u51BB\u7ED3" || a.status === "\u6B62\u4ED8" ? "red" : a.status === "\u5173\u6CE8" ? "amber" : "green"
    }
  }));
  const selfQueryCols = [
    { key: "date", label: "\u65E5\u671F", type: "text", width: "140px" },
    { key: "type", label: "\u67E5\u8BE2\u539F\u56E0", type: "text" }
  ];
  const selfQueryRows = cur.credit.selfQueries.map((q, i) => ({ id: `sq${i}`, date: q.date, type: q.type }));
  const agreeCols = [
    { key: "org", label: "\u7BA1\u7406\u673A\u6784", type: "text", fixed: "left", width: "160px" },
    { key: "limit", label: "\u6388\u4FE1\u989D\u5EA6", type: "money", width: "130px" },
    { key: "currency", label: "\u5E01\u79CD", type: "text", width: "90px" },
    { key: "shareAccounts", label: "\u534F\u8BAE\u8D26\u6237\u6570", type: "text", width: "100px" },
    { key: "effectiveDate", label: "\u751F\u6548\u65E5", type: "text", width: "120px" },
    { key: "expireDate", label: "\u5230\u671F\u65E5", type: "text", width: "120px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "100px" }
  ];
  const agreeRows = cur.credit.agreements.map((a, i) => ({
    id: `ag${i}`,
    org: a.org,
    limit: a.limit,
    currency: a.currency,
    shareAccounts: a.shareAccounts,
    effectiveDate: a.effectiveDate,
    expireDate: a.expireDate,
    status: { v: a.status, kind: a.status === "\u7EC8\u6B62" ? "red" : a.status === "\u5173\u6CE8" ? "amber" : "green" }
  }));
  const repayCols = [
    { key: "name", label: "\u8D23\u4EFB\u4EBA", type: "text", fixed: "left", width: "120px" },
    { key: "relation", label: "\u5173\u7CFB", type: "text", width: "90px" },
    { key: "org", label: "\u7BA1\u7406\u673A\u6784", type: "text", width: "150px" },
    { key: "product", label: "\u4E1A\u52A1\u54C1\u79CD", type: "text", width: "120px" },
    { key: "amount", label: "\u8D23\u4EFB\u91D1\u989D", type: "money", width: "130px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "100px" }
  ];
  const repayRows = cur.credit.relatedRepayList.map((r, i) => ({
    id: `rp${i}`,
    name: r.name,
    relation: r.relation,
    org: r.org,
    product: r.product,
    amount: r.amount,
    status: { v: r.status, kind: r.status === "\u903E\u671F" ? "red" : r.status === "\u5173\u6CE8" ? "amber" : "green" }
  }));
  const pubCols = [
    { key: "type", label: "\u8BB0\u5F55\u7C7B\u578B", type: "text", fixed: "left", width: "120px" },
    { key: "org", label: "\u8BB0\u5F55\u673A\u6784", type: "text", width: "220px" },
    { key: "date", label: "\u53D1\u751F\u65E5\u671F", type: "text", width: "130px" },
    { key: "content", label: "\u5185\u5BB9", type: "text" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "gray", width: "100px" }
  ];
  const pubRows = cur.credit.publicRecords.map((p, i) => ({
    id: `pr${i}`,
    type: p.type,
    org: p.org,
    date: p.date,
    content: p.content,
    status: { v: p.status, kind: p.status === "\u672A\u5C65\u884C" || p.status === "\u903E\u671F" ? "red" : p.status === "\u5DF2\u5C65\u884C" || p.status === "\u5DF2\u7ED3\u6E05" ? "green" : "amber" }
  }));
  const limitCols = [
    { key: "product", label: "\u8D37\u6B3E\u4EA7\u54C1", type: "text", fixed: "left", width: "220px" },
    { key: "balance", label: "\u5DF2\u7528\u989D\u5EA6", type: "money", width: "140px", tag: "calc" },
    { key: "rate", label: "\u5E74\u5316\u5229\u7387", type: "percent", width: "120px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "110px" }
  ];
  const limitRows = cur.loans.map((l) => ({
    id: l.id,
    product: l.product,
    balance: l.balance,
    rate: l.rate,
    status: { v: l.status, kind: l.status === "\u903E\u671F" ? "red" : l.status === "\u7ED3\u6E05" ? "gray" : "green" }
  }));
  const debtCols = [
    { key: "id", label: "\u501F\u636E\u53F7", type: "text", fixed: "left", width: "130px" },
    { key: "product", label: "\u4EA7\u54C1", type: "text", width: "200px" },
    { key: "principal", label: "\u5408\u540C\u672C\u91D1", type: "money", width: "140px" },
    { key: "balance", label: "\u5F53\u524D\u4F59\u989D", type: "money", width: "140px" },
    { key: "rate", label: "\u5E74\u5316", type: "percent", width: "90px" },
    { key: "term", label: "\u671F\u9650(\u6708)", type: "number", width: "100px" },
    { key: "monthly", label: "\u6708\u4F9B", type: "money", width: "120px" },
    { key: "dueDays", label: "\u903E\u671F\u5929\u6570", type: "number", width: "100px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "100px" }
  ];
  const debtRows = cur.loans.map((l) => ({
    id: l.id,
    product: l.product,
    principal: l.principal,
    balance: l.balance,
    rate: l.rate,
    term: l.term,
    monthly: l.monthly,
    dueDays: l.dueDays ?? 0,
    status: { v: l.status, kind: l.status === "\u903E\u671F" ? "red" : l.status === "\u7ED3\u6E05" ? "gray" : "green" }
  }));
  const coDebtCols = [
    { key: "org", label: "\u673A\u6784", type: "text", fixed: "left", width: "200px" },
    { key: "product", label: "\u4EA7\u54C1", type: "text", width: "200px" },
    { key: "balance", label: "\u4F59\u989D", type: "money", width: "140px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "110px" }
  ];
  const coDebtRows = cur.coDebt.orgs.map((o, i) => ({ id: `o${i}`, org: o.org, product: o.product, balance: o.balance, status: { v: o.status, kind: o.status === "\u903E\u671F" ? "red" : o.status === "\u5173\u6CE8" ? "amber" : "green" } }));
  const relNodeMap = useMemo4(() => {
    const m = {};
    cur.relationGraph.nodes.forEach((nn) => m[nn.id] = nn);
    return m;
  }, [cur.relationGraph]);
  return /* @__PURE__ */ jsxs5("div", { style: { padding: 24, maxWidth: 1360 }, children: [
    /* @__PURE__ */ jsx5(
      PageShell,
      {
        header: /* @__PURE__ */ jsx5(
          DetailHeader,
          {
            title,
            crumb: (isSc ? "\u8BC4\u5206\u4EA7\u54C1" : CRUMB) + " / " + cur.name,
            backLabel: isSc ? "\u2190 \u8FD4\u56DE\u8BC4\u5206\u4EA7\u54C1" : "\u2190 \u8FD4\u56DE",
            onBack: backTarget ? () => nav(backTarget) : void 0,
            actions: /* @__PURE__ */ jsxs5(Fragment5, { children: [
              /* @__PURE__ */ jsx5(Sam, { label: "\u5355\u5BA2\u6837\u4F8B", value: "custProfileData.ts" }),
              /* @__PURE__ */ jsx5(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
            ] })
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs5("div", { style: { display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: 12, alignItems: "stretch", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxs5("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, background: "#fff" }, children: [
        /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
            /* @__PURE__ */ jsx5(
              "div",
              {
                style: {
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#8B5CF6,#D946EF)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700
                },
                children: cur.avatarText
              }
            ),
            /* @__PURE__ */ jsxs5("div", { children: [
              /* @__PURE__ */ jsxs5("div", { style: { fontSize: 18, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }, children: [
                cur.name,
                " ",
                /* @__PURE__ */ jsx5(Badge, { kind: STATUS_KIND[cur.status], children: cur.status })
              ] }),
              /* @__PURE__ */ jsx5("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }, children: cur.tags.map((t) => /* @__PURE__ */ jsx5(Badge, { kind: "blue", children: t }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsx5("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: /* @__PURE__ */ jsx5(Button, { size: "sm", variant: cur.followed ? "secondary" : "primary", onClick: () => toggleFollowCust(cur.custId), children: cur.followed ? "\u5DF2\u5173\u6CE8" : "\uFF0B \u5173\u6CE8" }) })
        ] }),
        /* @__PURE__ */ jsxs5("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", marginTop: 6, fontSize: 12, color: "#64748B" }, children: [
          /* @__PURE__ */ jsxs5("span", { children: [
            "\u8BC1\u4EF6\u53F7\uFF1A",
            cur.maskedId
          ] }),
          /* @__PURE__ */ jsxs5("span", { children: [
            "\u624B\u673A\u53F7\uFF1A",
            cur.phone
          ] }),
          /* @__PURE__ */ jsxs5("span", { children: [
            "\u6240\u5728\u5730\uFF1A",
            cur.region
          ] })
        ] }),
        /* @__PURE__ */ jsxs5("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", marginTop: 6, fontSize: 12, color: "#64748B" }, children: [
          /* @__PURE__ */ jsxs5("span", { children: [
            "\u6027\u522B\uFF1A",
            cur.gender
          ] }),
          /* @__PURE__ */ jsxs5("span", { children: [
            "\u5E74\u9F84\uFF1A",
            cur.age,
            " \u5C81"
          ] }),
          /* @__PURE__ */ jsxs5("span", { children: [
            "\u5B66\u5386\uFF1A",
            cur.education
          ] }),
          /* @__PURE__ */ jsxs5("span", { children: [
            "\u5A5A\u59FB\u72B6\u51B5\uFF1A",
            cur.marital
          ] }),
          /* @__PURE__ */ jsxs5("span", { children: [
            "\u5BA2\u6237\u6807\u8BC6\uFF1A",
            cur.custId
          ] })
        ] }),
        /* @__PURE__ */ jsx5("div", { style: { marginTop: 12, paddingTop: 12, borderTop: "1px dashed #E2E8F0" }, children: /* @__PURE__ */ jsx5(OverviewTags, { cur }) })
      ] }),
      /* @__PURE__ */ jsxs5("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: 12, background: "#fff", display: "flex", flexDirection: "column" }, children: [
        /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }, children: [
          /* @__PURE__ */ jsx5("span", { style: { fontSize: 13, fontWeight: 700, color: "#0F172A" }, children: "\u6A21\u578B\u8BC4\u5206" }),
          /* @__PURE__ */ jsxs5("span", { style: { fontSize: 11, color: "#94A3B8" }, children: [
            "\u70B9\u51FB\u5361\u7247\u67E5\u770B\u660E\u7EC6 ",
            /* @__PURE__ */ jsx5(Sam, { label: "\u6837\u4F8B", value: "custProfileData.ts" })
          ] })
        ] }),
        /* @__PURE__ */ jsx5(ModelScorePanel, { scores: cur.scores, custId: cur.custId, source })
      ] })
    ] }),
    /* @__PURE__ */ jsx5("div", { style: { position: "sticky", top: 56, zIndex: 35, background: "rgba(248,250,252,0.96)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", padding: "10px 0", borderBottom: "1px solid #E2E8F0", marginBottom: 14 }, children: /* @__PURE__ */ jsx5("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" }, children: TABS.map((t) => {
      const badge = tabBadge(t, cur);
      return /* @__PURE__ */ jsxs5(
        "button",
        {
          onClick: () => setTab(t),
          style: {
            padding: "8px 14px",
            fontSize: 13,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: t === tab ? "#8B5CF6" : "#64748B",
            fontWeight: t === tab ? 700 : 400,
            borderBottom: t === tab ? "2px solid #8B5CF6" : "2px solid transparent",
            marginBottom: -1
          },
          children: [
            t,
            badge && /* @__PURE__ */ jsxs5("span", { style: { fontSize: 11, opacity: 0.7, marginLeft: 2 }, children: [
              "\uFF08",
              badge,
              "\uFF09"
            ] })
          ]
        },
        t
      );
    }) }) }),
    tab === "\u57FA\u672C\u4FE1\u606F" && /* @__PURE__ */ jsxs5("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
      devDanger && /* @__PURE__ */ jsxs5("div", { style: { borderRadius: 12, border: "1px solid #FECACA", background: "#FEF2F2", padding: "10px 14px", fontSize: 13, color: "#B91C1C" }, children: [
        "\u26A0 \u73AF\u5883\u98CE\u9669\u5206 ",
        cur.device.envRiskScore,
        "\uFF08",
        cur.device.simulator ? "\u68C0\u6D4B\u5230\u6A21\u62DF\u5668" : "\u504F\u9AD8",
        "\uFF09\uFF0C\u540C\u8BBE\u5907\u5173\u8054 ",
        cur.device.sameDeviceAccounts.length,
        " \u4E2A\u8D26\u53F7\uFF0C\u7591\u4F3C\u56E2\u4F19\u6B3A\u8BC8\u3002"
      ] }),
      /* @__PURE__ */ jsxs5(Panel, { title: "\u57FA\u7840\u6863\u6848", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u8EAB\u4EFD / \u804C\u4E1A / \u8054\u7CFB \xB7 \u5B57\u6BB5\u7EA7\u5916\u90E8\u6838\u9A8C\u6807\u8BB0 \xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), children: [
        /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "2px 0 8px" }, children: "\u8EAB\u4EFD\u4FE1\u606F" }),
        /* @__PURE__ */ jsx5("div", { style: { display: "grid", gridTemplateColumns: fieldCols === 3 ? "1fr 1fr 1fr" : fieldCols === 2 ? "1fr 1fr" : "1fr", gap: "6px 24px", fontSize: 13, marginBottom: 16 }, children: infoDefs.map((def) => {
          const cs = checksByField[def.field];
          return /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
            /* @__PURE__ */ jsx5("span", { style: { color: "#94A3B8", whiteSpace: "nowrap" }, children: def.label }),
            /* @__PURE__ */ jsxs5("span", { style: { color: "#334155", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 2 }, children: [
              def.value,
              cs && /* @__PURE__ */ jsx5(VerifyMark, { checks: cs })
            ] })
          ] }, def.field);
        }) }),
        /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "2px 0 8px" }, children: "\u8054\u7CFB\u65B9\u5F0F" }),
        /* @__PURE__ */ jsx5("div", { style: { display: "grid", gridTemplateColumns: fieldCols === 3 ? "1fr 1fr 1fr" : fieldCols === 2 ? "1fr 1fr" : "1fr", gap: "6px 24px", fontSize: 13, marginBottom: 16 }, children: contactDefs.map((def, i) => {
          const cs = def.field ? checksByField[def.field] : void 0;
          if (def.field === "phone") {
            return /* @__PURE__ */ jsxs5(
              "div",
              {
                onMouseEnter: () => setPhoneHover(true),
                onMouseLeave: () => setPhoneHover(false),
                style: { position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 },
                children: [
                  /* @__PURE__ */ jsx5("span", { style: { color: "#94A3B8", whiteSpace: "nowrap" }, children: def.label }),
                  /* @__PURE__ */ jsxs5("span", { style: { color: "#334155", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }, children: [
                    def.value,
                    cur.phones.length > 1 && /* @__PURE__ */ jsxs5("span", { style: { fontSize: 11, lineHeight: 1, background: "#EEF2FF", color: "#534AB7", borderRadius: 999, padding: "2px 7px" }, children: [
                      "\u5171 ",
                      cur.phones.length,
                      " \u4E2A"
                    ] })
                  ] }),
                  phoneHover && cur.phones.length > 1 && /* @__PURE__ */ jsxs5("div", { style: { position: "absolute", top: "100%", left: 0, marginTop: 6, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, boxShadow: "0 8px 24px rgba(15,23,42,.12)", padding: 10, zIndex: 20, minWidth: 230 }, children: [
                    /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, color: "#64748B", marginBottom: 6 }, children: "\u5168\u90E8\u624B\u673A\u53F7\uFF08\u8131\u654F \xB7 \u6838\u9A8C\uFF09" }),
                    cur.phones.map((p, j) => /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "5px 0", borderBottom: j < cur.phones.length - 1 ? "1px dashed #F1F5F9" : "none" }, children: [
                      /* @__PURE__ */ jsxs5("span", { style: { color: "#334155" }, children: [
                        p.number,
                        j === 0 && /* @__PURE__ */ jsx5("span", { style: { color: "#94A3B8", fontSize: 11, marginLeft: 4 }, children: "\u4E3B\u53F7" })
                      ] }),
                      /* @__PURE__ */ jsx5("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: p.verified ? "#16A34A" : "#D97706" }, children: p.verified ? "\u2713 \u5DF2\u6838\u9A8C" : "\u5F85\u6838" })
                    ] }, j))
                  ] })
                ]
              },
              i
            );
          }
          return /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
            /* @__PURE__ */ jsx5("span", { style: { color: "#94A3B8", whiteSpace: "nowrap" }, children: def.label }),
            /* @__PURE__ */ jsxs5("span", { style: { color: "#334155", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 2, textAlign: "right" }, children: [
              def.value,
              cs && /* @__PURE__ */ jsx5(VerifyMark, { checks: cs })
            ] })
          ] }, i);
        }) }),
        /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "2px 0 8px" }, children: "\u804C\u4E1A\u4E0E\u6536\u5165" }),
        /* @__PURE__ */ jsx5("div", { style: { display: "grid", gridTemplateColumns: fieldCols === 3 ? "1fr 1fr 1fr" : fieldCols === 2 ? "1fr 1fr" : "1fr", gap: "6px 24px", fontSize: 13 }, children: jobDefs.map((def) => {
          const cs = checksByField[def.field];
          return /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
            /* @__PURE__ */ jsx5("span", { style: { color: "#94A3B8", whiteSpace: "nowrap" }, children: def.label }),
            /* @__PURE__ */ jsxs5("span", { style: { color: "#334155", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 2 }, children: [
              def.value,
              cs && /* @__PURE__ */ jsx5(VerifyMark, { checks: cs })
            ] })
          ] }, def.field);
        }) })
      ] }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u5B9E\u540D\u4E0E\u8BBE\u5907\u6838\u9A8C", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u8BBE\u5907\u6307\u7EB9 / \u73AF\u5883\u53CD\u6B3A\u8BC8 \xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ jsx5("div", { style: { display: "grid", gridTemplateColumns: fieldCols === 3 ? "1fr 1fr 1fr" : fieldCols === 2 ? "1fr 1fr" : "1fr", gap: "6px 24px", fontSize: 13 }, children: [
        ["\u8BBE\u5907\u53F7", cur.device.device],
        ["\u673A\u578B", cur.device.model],
        ["\u64CD\u4F5C\u7CFB\u7EDF", cur.device.os],
        ["\u5E38\u7528\u767B\u5F55\u5730", cur.device.loginRegion],
        ["\u6700\u8FD1\u767B\u5F55", cur.device.lastLogin],
        ["\u73AF\u5883\u98CE\u9669\u5206", String(cur.device.envRiskScore)],
        ["\u6A21\u62DF\u5668", cur.device.simulator ? "\u662F\uFF08\u98CE\u9669\uFF09" : "\u5426"]
      ].map(([k, v]) => /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
        /* @__PURE__ */ jsx5("span", { style: { color: "#94A3B8" }, children: k }),
        /* @__PURE__ */ jsx5("span", { style: { color: "#334155", fontWeight: 500 }, children: v })
      ] }, k)) }) }),
      cur.device.sameDeviceAccounts.length > 0 && /* @__PURE__ */ jsx5(Panel, { title: "\u540C\u8BBE\u5907\u591A\u8D26\u53F7", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u540C\u8BBE\u5907\u767B\u5F55\u7684\u5176\u4ED6\u501F\u8D37\u8D26\u53F7 \xB7 ",
        /* @__PURE__ */ jsx5(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: /* @__PURE__ */ jsx5(
        DataTable,
        {
          columns: [{ key: "name", label: "\u59D3\u540D", type: "text", fixed: "left" }, { key: "custId", label: "\u5BA2\u6237\u6807\u8BC6", type: "text" }],
          rows: sameDevRows,
          empty: "\u65E0",
          pager: true,
          defaultPageSize: 8
        }
      ) }),
      /* @__PURE__ */ jsxs5(Panel, { title: "\u884C\u4E3A\u753B\u50CF", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u7528\u4FE1 / \u8FD8\u6B3E / \u67E5\u8BE2 / \u98CE\u9669\u7684\u884C\u4E3A\u7279\u5F81 \xB7 ",
        /* @__PURE__ */ jsx5(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: [
        dangerBehavior > 0 && /* @__PURE__ */ jsxs5("div", { style: { marginBottom: 12, borderRadius: 12, border: "1px solid #FECACA", background: "#FEF2F2", padding: "10px 14px", fontSize: 13, color: "#B91C1C" }, children: [
          "\u26A0 \u547D\u4E2D ",
          dangerBehavior,
          " \u9879\u98CE\u9669\u884C\u4E3A\uFF08\u903E\u671F\u8FD8\u6B3E / \u591A\u5934\u501F\u8D37 / \u591C\u95F4\u7528\u4FE1 / \u989D\u5EA6\u4F7F\u7528\u7387\u8FC7\u9AD8\uFF09\uFF0C\u5EFA\u8BAE\u7ED3\u5408\u98CE\u9669\u9884\u8B66\u8054\u52A8\u5904\u7F6E\u3002"
        ] }),
        /* @__PURE__ */ jsx5("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: BEHAVIOR_GROUPS.map((g) => {
          const items = cur.behavior.filter((b) => (b.category ?? "\u98CE\u9669") === g.key);
          if (!items.length) return null;
          return /* @__PURE__ */ jsxs5("div", { children: [
            /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569" }, children: g.title }),
            /* @__PURE__ */ jsx5("div", { style: { fontSize: 11, color: "#94A3B8", margin: "2px 0 8px" }, children: g.desc }),
            /* @__PURE__ */ jsx5("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }, children: items.map((it) => /* @__PURE__ */ jsxs5(
              "div",
              {
                style: {
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: it.danger ? "#FEF2F2" : "#fff"
                },
                children: [
                  /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsx5("span", { style: { fontSize: 12, color: it.danger ? "#DC2626" : "#475569" }, children: it.name }),
                    /* @__PURE__ */ jsx5("span", { style: { fontSize: 13, fontWeight: 600, color: it.danger ? "#DC2626" : "#334155" }, children: it.count })
                  ] }),
                  it.desc && /* @__PURE__ */ jsx5("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 3 }, children: it.desc })
                ]
              },
              it.name
            )) })
          ] }, g.key);
        }) })
      ] }),
      /* @__PURE__ */ jsxs5(Panel, { title: "\u64CD\u4F5C\u65E5\u5FD7", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u5904\u7F6E\u5DE5\u5355 + \u81EA\u52A8\u6838\u9A8C + \u592E\u884C\u5F81\u4FE1\u8C03\u53D6 \xB7 \u5171 ",
        allLogs.length,
        " \u6761 \xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), children: [
        /* @__PURE__ */ jsx5("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }, children: ["\u5168\u90E8", "\u5904\u7F6E\u5DE5\u5355", "\u5386\u53F2\u64CD\u4F5C", "\u81EA\u52A8\u6838\u9A8C", "\u5F81\u4FE1\u8C03\u53D6"].map((c) => /* @__PURE__ */ jsxs5(
          "button",
          {
            type: "button",
            onClick: () => {
              setLogFilter(c);
              setLogLimit(5);
            },
            style: {
              fontSize: 12,
              padding: "4px 12px",
              borderRadius: 999,
              cursor: "pointer",
              background: logFilter === c ? "#1E293B" : "#fff",
              color: logFilter === c ? "#fff" : "#64748B",
              border: logFilter === c ? "1px solid #1E293B" : "1px solid #E2E8F0"
            },
            children: [
              c,
              c !== "\u5168\u90E8" && /* @__PURE__ */ jsx5("span", { style: { opacity: 0.7, marginLeft: 4 }, children: allLogs.filter((e) => logCat(e) === c).length })
            ]
          },
          c
        )) }),
        /* @__PURE__ */ jsx5(Timeline, { items: filteredLogs.slice(0, logLimit) }),
        filteredLogs.length > logLimit && /* @__PURE__ */ jsxs5(
          "button",
          {
            type: "button",
            onClick: () => setLogLimit(logLimit + 10),
            style: { marginTop: 4, fontSize: 12.5, color: "#185FA5", background: "none", border: "none", padding: "6px 0", cursor: "pointer" },
            children: [
              "\u663E\u793A\u66F4\u591A\uFF08\u8FD8\u6709 ",
              filteredLogs.length - logLimit,
              " \u6761\uFF09\u2193"
            ]
          }
        )
      ] })
    ] }),
    tab === "\u98CE\u9669\u9884\u8B66" && /* @__PURE__ */ jsxs5("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
      /* @__PURE__ */ jsxs5(Panel, { title: "\u98CE\u9669\u9884\u8B66", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u8D37\u4E2D\u76D1\u63A7\u547D\u4E2D\u89C4\u5219 \xB7 \u4F18\u5148\u5904\u7F6E\u5165\u53E3 \xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), children: [
        /* @__PURE__ */ jsxs5("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }, children: [
          /* @__PURE__ */ jsxs5("span", { style: { fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#FEF2F2", color: "#DC2626" }, children: [
            "\u7EA2 ",
            redCount
          ] }),
          /* @__PURE__ */ jsxs5("span", { style: { fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#FFFBEB", color: "#D97706" }, children: [
            "\u9EC4 ",
            yellowCount
          ] }),
          /* @__PURE__ */ jsxs5("span", { style: { fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#EFF6FF", color: "#2563EB" }, children: [
            "\u5F85\u5904\u7F6E ",
            pendingCount
          ] })
        ] }),
        /* @__PURE__ */ jsx5(
          DataTable,
          {
            columns: alertCols,
            rows: alertRows,
            empty: "\u65E0\u9884\u8B66\u8BB0\u5F55",
            pager: true,
            defaultPageSize: 10,
            actions: (r) => /* @__PURE__ */ jsx5(
              "button",
              {
                type: "button",
                onClick: () => setAlertDetail(cur.alerts.find((a) => a.id === r.id) ?? null),
                style: { fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#475569", cursor: "pointer", fontWeight: 500 },
                children: "\u67E5\u770B\u8BE6\u60C5"
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u9ED1\u540D\u5355\u53CD\u6B3A\u8BC8", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u672C\u884C\u9ED1\u540D\u5355 + \u4E92\u91D1\u534F\u4F1A\u7070\u540D\u5355\u7B49\u53CD\u6B3A\u8BC8\u547D\u4E2D \xB7 ",
        /* @__PURE__ */ jsx5(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: cur.postRisk.blacklist.length ? /* @__PURE__ */ jsx5("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: cur.postRisk.blacklist.map((b, i) => {
        const danger = b.status === "\u9AD8\u98CE\u9669";
        const kind = b.status === "\u6B63\u5E38" ? "green" : danger ? "red" : "amber";
        return /* @__PURE__ */ jsxs5(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${danger ? "#FECACA" : kind === "amber" ? "#FDE68A" : "#E2E8F0"}`,
              background: danger ? "#FEF2F2" : kind === "amber" ? "#FFFBEB" : "#F8FAFC"
            },
            children: [
              /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
                /* @__PURE__ */ jsx5("span", { style: { width: 4, height: 32, borderRadius: 2, background: danger ? "#DC2626" : kind === "amber" ? "#D97706" : "#94A3B8" } }),
                /* @__PURE__ */ jsxs5("div", { children: [
                  /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, fontWeight: 600, color: "#1E293B" }, children: b.list }),
                  /* @__PURE__ */ jsxs5("div", { style: { fontSize: 12, color: "#64748B", marginTop: 2 }, children: [
                    "\u547D\u4E2D\u72B6\u6001\uFF1A",
                    b.hit
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx5(Badge, { kind, children: b.status })
            ]
          },
          i
        );
      }) }) : /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u672A\u547D\u4E2D\u4EFB\u4F55\u9ED1\u540D\u5355" }) }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u8D37\u540E\u98CE\u9669", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u8D44\u91D1\u6D41\u5411\u76D1\u63A7 \xB7 \u4E0E\u98CE\u9669\u9884\u8B66\u540C\u5C5E\u8D37\u4E2D\u76D1\u63A7 \xB7 ",
        /* @__PURE__ */ jsx5(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: /* @__PURE__ */ jsx5(
        DataTable,
        {
          columns: [
            { key: "date", label: "\u65E5\u671F", type: "text", width: "130px" },
            { key: "direction", label: "\u65B9\u5411", type: "text", width: "80px" },
            { key: "counterparty", label: "\u4EA4\u6613\u5BF9\u624B", type: "text" },
            { key: "amount", label: "\u91D1\u989D", type: "money", width: "140px" },
            { key: "flag", label: "\u6807\u8BB0", type: "badge", badgeKind: "red", width: "140px" }
          ],
          rows: cur.postRisk.fundFlow.map((f, i) => ({ id: `f${i}`, date: f.date, direction: f.direction, counterparty: f.counterparty, amount: f.amount, flag: { v: f.flag, kind: f.flag.includes("\u7591\u4F3C") || f.flag.includes("\u4E0D\u660E") ? "red" : "blue" } })),
          empty: "\u65E0\u8D44\u91D1\u6D41\u5411",
          pager: true,
          defaultPageSize: 8
        }
      ) }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u53F8\u6CD5\u6D89\u8BC9", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u88C1\u5224\u6587\u4E66 / \u88AB\u6267\u884C\u4EBA / \u5931\u4FE1\u540D\u5355\u7B49\u6D89\u8BC9\u4FE1\u606F \xB7 \u7ED3\u6784\u5316\u5C55\u793A \xB7 ",
        /* @__PURE__ */ jsx5(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: cur.litigation.length ? /* @__PURE__ */ jsx5("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: cur.litigation.map((l, i) => {
        const danger = l.status === "\u672A\u7ED3" || l.status === "\u6267\u884C\u4E2D";
        return /* @__PURE__ */ jsxs5(
          "div",
          {
            style: {
              border: `1px solid ${danger ? "#FECACA" : "#E2E8F0"}`,
              borderRadius: 10,
              padding: "12px 14px",
              background: danger ? "#FEF2F2" : "#fff"
            },
            children: [
              /* @__PURE__ */ jsxs5("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }, children: [
                /* @__PURE__ */ jsx5("span", { style: { fontSize: 14, fontWeight: 700, color: "#1E293B" }, children: l.type }),
                /* @__PURE__ */ jsx5(Badge, { kind: danger ? "red" : "green", children: l.status }),
                /* @__PURE__ */ jsx5("span", { style: { fontSize: 12, color: "#94A3B8" }, children: l.role }),
                /* @__PURE__ */ jsxs5("span", { style: { fontSize: 11, color: "#94A3B8", marginLeft: "auto" }, children: [
                  "\u7ACB\u6848/\u88C1\u5224\uFF1A",
                  l.filingDate
                ] })
              ] }),
              /* @__PURE__ */ jsxs5("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, fontSize: 13 }, children: [
                /* @__PURE__ */ jsxs5("div", { style: { color: "#64748B" }, children: [
                  "\u6848\u53F7\uFF1A",
                  /* @__PURE__ */ jsx5("b", { style: { color: "#334155" }, children: l.caseNo })
                ] }),
                /* @__PURE__ */ jsxs5("div", { style: { color: "#64748B" }, children: [
                  "\u5BA1\u7406\u6CD5\u9662\uFF1A",
                  /* @__PURE__ */ jsx5("b", { style: { color: "#334155" }, children: l.court })
                ] }),
                /* @__PURE__ */ jsxs5("div", { style: { color: "#64748B" }, children: [
                  "\u6D89\u8BC9\u91D1\u989D\uFF1A",
                  /* @__PURE__ */ jsx5("b", { style: { color: danger ? "#DC2626" : "#334155" }, children: money(l.amount) })
                ] })
              ] }),
              l.desc && /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, color: "#64748B", marginTop: 8, paddingTop: 8, borderTop: "1px dashed #F1F5F9" }, children: l.desc })
            ]
          },
          i
        );
      }) }) : /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#16A34A" }, children: "\u2713 \u6682\u65E0\u53F8\u6CD5\u6D89\u8BC9\u8BB0\u5F55\uFF08\u6D89\u8BC9\u67E5\u8BE2\u65E0\u672A\u7ED3\u6848\u4EF6\uFF09" }) })
    ] }),
    tab === "\u62C5\u4FDD\u4E0E\u7ECF\u8425" && /* @__PURE__ */ jsxs5("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
      cur.collateralBiz.guaranteeAlert && /* @__PURE__ */ jsxs5("div", { style: { borderRadius: 12, border: "1px solid #FECACA", background: "#FEF2F2", padding: "10px 14px", fontSize: 13, color: "#B91C1C" }, children: [
        "\u26A0 \u62C5\u4FDD\u9884\u8B66\uFF08",
        cur.collateralBiz.guaranteeAlert.level,
        "\uFF09\uFF1A",
        cur.collateralBiz.guaranteeAlert.rule,
        " \u2014 ",
        cur.collateralBiz.guaranteeAlert.desc
      ] }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u62C5\u4FDD\u4E0E\u7ECF\u8425\u6982\u89C8", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u62C5\u4FDD\u8986\u76D6 + \u7ECF\u8425\u5065\u5EB7\u5EA6 \xB7 ",
        /* @__PURE__ */ jsx5(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: /* @__PURE__ */ jsxs5("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
        /* @__PURE__ */ jsx5(SummaryCard, { label: "\u62C5\u4FDD\u7269\u6570\u91CF", value: cur.collateralBiz.collateral.length, unit: "\u9879" }),
        /* @__PURE__ */ jsx5(SummaryCard, { label: "\u7ECF\u8425\u5B9E\u4F53\u6570", value: cur.collateralBiz.business.length, unit: "\u5BB6" }),
        cur.collateralBiz.bizHealth && (() => {
          const bh = cur.collateralBiz.bizHealth;
          const stabColor = bh.stability === "\u7A33\u5B9A" ? "#16A34A" : bh.stability === "\u6CE2\u52A8" ? "#D97706" : "#DC2626";
          return /* @__PURE__ */ jsxs5(Fragment5, { children: [
            /* @__PURE__ */ jsx5(SummaryCard, { label: "\u7ECF\u8425\u5E74\u9650", value: bh.years, unit: "\u5E74" }),
            /* @__PURE__ */ jsx5(SummaryCard, { label: "\u6708\u5747\u8425\u6536", value: bh.monthlyRevenue, unit: "\u5143" }),
            /* @__PURE__ */ jsxs5("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: 12, background: "#fff" }, children: [
              /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, color: "#94A3B8" }, children: "\u7ECF\u8425\u7A33\u5B9A\u6027" }),
              /* @__PURE__ */ jsx5("div", { style: { fontSize: 22, fontWeight: 800, color: stabColor, marginTop: 4 }, children: bh.stability })
            ] }),
            /* @__PURE__ */ jsx5(SummaryCard, { label: "\u7ECF\u8425\u5065\u5EB7\u5206", value: bh.score, unit: "/100", danger: bh.score < 60 })
          ] });
        })()
      ] }) }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u62C5\u4FDD\u62B5\u62BC\u7269", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u62B5\u62BC / \u8D28\u62BC\u7269 \xB7 \u542B\u7B2C\u4E09\u65B9\u6838\u9A8C \xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), children: cur.collateralBiz.collateral.length ? /* @__PURE__ */ jsxs5("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
        cur.collateralBiz.collateral.map((c, i) => /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ jsxs5("span", { style: { color: "#64748B" }, children: [
            c.name,
            "\uFF08",
            c.type,
            "\uFF09"
          ] }),
          /* @__PURE__ */ jsxs5("span", { style: { color: "#334155", display: "inline-flex", alignItems: "center", gap: 6 }, children: [
            money(c.value),
            " \xB7 ",
            /* @__PURE__ */ jsx5(Badge, { kind: c.status === "\u8BC4\u4F30\u4E2D" ? "amber" : "gray", children: c.status }),
            c.verified != null && /* @__PURE__ */ jsx5(Badge, { kind: c.verified ? "green" : "amber", children: c.verified ? "\u5DF2\u6838\u9A8C" : "\u5F85\u6838\u9A8C" })
          ] })
        ] }, i)),
        cur.collateralBiz.collateral.some((c) => c.verifyOrg) && /* @__PURE__ */ jsxs5("div", { style: { fontSize: 11, color: "#94A3B8" }, children: [
          "\u6838\u9A8C\u6765\u6E90\uFF1A",
          cur.collateralBiz.collateral.filter((c) => c.verifyOrg).map((c) => `${c.name}\xB7${c.verifyOrg}${c.verifyTime ? `(${c.verifyTime})` : ""}`).join("\uFF1B")
        ] })
      ] }) : /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u62C5\u4FDD\u62B5\u62BC\u7269\uFF08\u7EAF\u4FE1\u7528\u5BA2\u6237\uFF09" }) }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u7ECF\u8425\u5B9E\u4F53", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u540D\u4E0B\u7ECF\u8425\u4E3B\u4F53 \xB7 \u542B\u57FA\u672C\u4FE1\u606F\u4E0E\u98CE\u9669\u4FE1\u606F \xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), children: cur.collateralBiz.business.length ? /* @__PURE__ */ jsx5("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: cur.collateralBiz.business.map((b, i) => {
        const riskKind = b.risk === "\u9AD8\u98CE\u9669" ? "red" : b.risk === "\u5173\u6CE8" ? "amber" : "green";
        return /* @__PURE__ */ jsxs5("div", { style: { border: `1px solid ${b.risk === "\u9AD8\u98CE\u9669" ? "#FECACA" : b.risk === "\u5173\u6CE8" ? "#FDE68A" : "#E2E8F0"}`, borderRadius: 10, padding: "12px 14px", background: b.risk === "\u9AD8\u98CE\u9669" ? "#FEF2F2" : "#fff" }, children: [
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 10 }, children: [
            /* @__PURE__ */ jsx5("span", { style: { fontSize: 14, fontWeight: 700, color: "#1E293B" }, children: b.name }),
            /* @__PURE__ */ jsx5(Badge, { kind: b.status === "\u5B58\u7EED" ? "green" : "gray", children: b.status }),
            b.risk && /* @__PURE__ */ jsxs5(Badge, { kind: riskKind, children: [
              "\u4E3B\u4F53\u98CE\u9669\xB7",
              b.risk
            ] }),
            b.healthScore != null && /* @__PURE__ */ jsxs5(Badge, { kind: b.healthScore >= 75 ? "green" : b.healthScore >= 55 ? "amber" : "red", children: [
              "\u7ECF\u8425\u5065\u5EB7 ",
              b.healthScore
            ] }),
            b.verified != null && /* @__PURE__ */ jsx5(Badge, { kind: b.verified ? "green" : "amber", children: b.verified ? "\u5DF2\u6838\u9A8C" : "\u5F85\u6838\u9A8C" })
          ] }),
          /* @__PURE__ */ jsxs5("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, fontSize: 13 }, children: [
            /* @__PURE__ */ jsxs5("div", { style: { color: "#64748B" }, children: [
              "\u7EDF\u4E00\u4FE1\u7528\u4EE3\u7801\uFF1A",
              /* @__PURE__ */ jsx5("b", { style: { color: "#334155" }, children: b.creditCode ?? "\u2014" })
            ] }),
            /* @__PURE__ */ jsxs5("div", { style: { color: "#64748B" }, children: [
              "\u6CD5\u5B9A\u4EE3\u8868\u4EBA\uFF1A",
              /* @__PURE__ */ jsx5("b", { style: { color: "#334155" }, children: b.legalRep ?? "\u2014" })
            ] }),
            /* @__PURE__ */ jsxs5("div", { style: { color: "#64748B" }, children: [
              "\u6CE8\u518C\u8D44\u672C\uFF1A",
              /* @__PURE__ */ jsx5("b", { style: { color: "#334155" }, children: b.regCapital != null ? `${b.regCapital} \u4E07\u5143` : "\u2014" })
            ] }),
            /* @__PURE__ */ jsxs5("div", { style: { color: "#64748B" }, children: [
              "\u6210\u7ACB\u65E5\u671F\uFF1A",
              /* @__PURE__ */ jsx5("b", { style: { color: "#334155" }, children: b.regDate ?? "\u2014" })
            ] }),
            /* @__PURE__ */ jsxs5("div", { style: { color: "#64748B" }, children: [
              "\u6240\u5C5E\u884C\u4E1A\uFF1A",
              /* @__PURE__ */ jsx5("b", { style: { color: "#334155" }, children: b.industry ?? "\u2014" })
            ] }),
            /* @__PURE__ */ jsxs5("div", { style: { color: "#64748B" }, children: [
              "\u89D2\u8272\uFF1A",
              /* @__PURE__ */ jsx5("b", { style: { color: "#334155" }, children: b.role })
            ] }),
            /* @__PURE__ */ jsxs5("div", { style: { color: "#64748B" }, children: [
              "\u6D89\u8BC9\u6848\u4EF6\uFF1A",
              /* @__PURE__ */ jsxs5("b", { style: { color: b.litigationCount ? "#DC2626" : "#334155" }, children: [
                b.litigationCount ?? 0,
                " \u8D77"
              ] })
            ] }),
            /* @__PURE__ */ jsxs5("div", { style: { color: "#64748B" }, children: [
              "\u884C\u653F\u5904\u7F5A\uFF1A",
              /* @__PURE__ */ jsxs5("b", { style: { color: b.penaltyCount ? "#DC2626" : "#334155" }, children: [
                b.penaltyCount ?? 0,
                " \u6B21"
              ] })
            ] })
          ] }),
          b.riskTags && b.riskTags.length > 0 && /* @__PURE__ */ jsx5("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }, children: b.riskTags.map((t, j) => {
            const isLitigation = t.includes("\u53F8\u6CD5\u6D89\u8BC9");
            return isLitigation ? /* @__PURE__ */ jsxs5(
              "button",
              {
                type: "button",
                onClick: () => setTab("\u98CE\u9669\u9884\u8B66"),
                style: { fontSize: 11, padding: "2px 9px", borderRadius: 999, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", cursor: "pointer", fontWeight: 600 },
                title: "\u67E5\u770B\u53F8\u6CD5\u6D89\u8BC9\u660E\u7EC6\uFF08\u98CE\u9669\u9884\u8B66 Tab\uFF09",
                children: [
                  t,
                  " \u203A"
                ]
              },
              j
            ) : /* @__PURE__ */ jsx5("span", { style: { fontSize: 11, padding: "2px 9px", borderRadius: 999, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }, children: t }, j);
          }) }),
          b.riskItems && b.riskItems.length > 0 && /* @__PURE__ */ jsxs5("div", { style: { marginTop: 10, borderTop: "1px dashed #F1F5F9", paddingTop: 8 }, children: [
            /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }, children: "\u98CE\u9669\u660E\u7EC6" }),
            /* @__PURE__ */ jsx5("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: b.riskItems.map((r, j) => /* @__PURE__ */ jsxs5("div", { style: { borderLeft: "3px solid #DC2626", paddingLeft: 10, background: "#FEF2F2", borderRadius: 6, padding: "6px 10px" }, children: [
              /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748B", marginBottom: 2 }, children: [
                /* @__PURE__ */ jsx5("span", { style: { fontWeight: 600, color: "#B91C1C" }, children: r.type }),
                /* @__PURE__ */ jsx5("span", { children: r.date })
              ] }),
              /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, color: "#475569", lineHeight: 1.5 }, children: r.reason })
            ] }, j)) })
          ] }),
          b.verifyOrg && /* @__PURE__ */ jsxs5("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 8 }, children: [
            "\u6838\u9A8C\u6765\u6E90\uFF1A",
            b.verifyOrg,
            b.verifyTime ? `\uFF08${b.verifyTime}\uFF09` : ""
          ] })
        ] }, i);
      }) }) : /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u7ECF\u8425\u5B9E\u4F53" }) })
    ] }),
    tab === "\u592E\u884C\u5F81\u4FE1" && /* @__PURE__ */ jsxs5(Fragment5, { children: [
      /* @__PURE__ */ jsxs5("div", { style: { display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 16px" }, children: [
        /* @__PURE__ */ jsxs5("span", { style: { fontSize: 13, color: "#475569" }, children: [
          "\u62A5\u544A\u7F16\u53F7\uFF1A",
          /* @__PURE__ */ jsx5("b", { style: { color: "#1E293B" }, children: cur.credit.header.reportNo })
        ] }),
        /* @__PURE__ */ jsxs5("span", { style: { fontSize: 13, color: "#475569" }, children: [
          "\u67E5\u8BE2\u65F6\u95F4\uFF1A",
          /* @__PURE__ */ jsx5("b", { style: { color: "#1E293B" }, children: cur.credit.header.queryTime })
        ] }),
        /* @__PURE__ */ jsxs5("span", { style: { fontSize: 13, color: "#475569" }, children: [
          "\u88AB\u67E5\u8BE2\u8005\uFF1A",
          /* @__PURE__ */ jsx5("b", { style: { color: "#1E293B" }, children: cur.credit.header.queriedBy }),
          "\uFF08",
          cur.credit.header.idNo,
          "\uFF09"
        ] }),
        /* @__PURE__ */ jsx5("span", { style: { marginLeft: "auto", fontSize: 11, color: "#94A3B8" }, children: "\u6570\u636E\u6765\u6E90\uFF1A\u4EBA\u884C\u5F81\u4FE1\u63A5\u53E3\uFF08\u6837\u4F8B\uFF09" })
      ] }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u6807\u6CE8\u53CA\u58F0\u660E\u4FE1\u606F", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u672C\u4EBA\u58F0\u660E / \u5F02\u8BAE\u6807\u6CE8 \xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: cur.credit.annotations.length ? /* @__PURE__ */ jsx5("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: cur.credit.annotations.map((a, i) => /* @__PURE__ */ jsxs5("div", { style: { borderLeft: `3px solid ${a.type === "\u5F02\u8BAE\u6807\u6CE8" ? "#D97706" : "#2563EB"}`, paddingLeft: 10, background: "#F8FAFC", borderRadius: 6, padding: "8px 10px" }, children: [
        /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748B", marginBottom: 2 }, children: [
          /* @__PURE__ */ jsx5(Badge, { kind: a.type === "\u5F02\u8BAE\u6807\u6CE8" ? "amber" : "blue", children: a.type }),
          /* @__PURE__ */ jsx5("span", { children: a.date })
        ] }),
        /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#334155" }, children: a.content })
      ] }, i)) }) : /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u6807\u6CE8\u53CA\u58F0\u660E\u4FE1\u606F" }) }),
      /* @__PURE__ */ jsxs5(Panel, { title: "\u4FE1\u606F\u6982\u8981", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u8D26\u6237\u6570\u6C47\u603B \xB7 \u4EBA\u884C\u5F81\u4FE1\u53E3\u5F84\uFF08\u4E0E\u4ED6\u884C\u6388\u4FE1/\u4F59\u989D\u7684\u5408\u5E76\u89C6\u89D2\uFF09\xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: [
        /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, color: "#94A3B8", marginBottom: 8 }, children: "\u2460 \u8D26\u6237\u6570" }),
        /* @__PURE__ */ jsxs5("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
          /* @__PURE__ */ jsx5(SummaryCard, { label: "\u4FE1\u7528\u5361\u8D26\u6237", value: cur.credit.summary.creditCards, unit: "\u4E2A" }),
          /* @__PURE__ */ jsx5(SummaryCard, { label: "\u8D37\u6B3E\u7B14\u6570", value: cur.credit.summary.loans, unit: "\u7B14" }),
          /* @__PURE__ */ jsx5(SummaryCard, { label: "\u903E\u671F\u8D26\u6237", value: cur.credit.summary.overdueAccounts, unit: "\u4E2A", danger: cur.credit.summary.overdueAccounts > 0 }),
          /* @__PURE__ */ jsx5(SummaryCard, { label: "90\u5929\u4EE5\u4E0A\u903E\u671F", value: cur.credit.summary.overdue90Plus, unit: "\u4E2A", danger: cur.credit.summary.overdue90Plus > 0 }),
          /* @__PURE__ */ jsx5(SummaryCard, { label: "\u5BF9\u5916\u62C5\u4FDD", value: cur.credit.summary.guaranteeCount, unit: "\u7B14", danger: cur.credit.summary.guaranteeCount > 0 }),
          /* @__PURE__ */ jsx5(SummaryCard, { label: "\u76F8\u5173\u8FD8\u6B3E\u8D23\u4EFB", value: cur.credit.summary.relatedRepay, unit: "\u4E2A", danger: cur.credit.summary.relatedRepay > 0 })
        ] }),
        /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, color: "#94A3B8", margin: "16px 0 8px" }, children: "\u2461 \u91D1\u989D\u7EF4\u5EA6\uFF08\u672A\u7ED3\u6E05\u8D26\u6237 \xB7 \u4EBA\u884C\u53E3\u5F84\uFF09" }),
        /* @__PURE__ */ jsxs5("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
          /* @__PURE__ */ jsx5(SummaryCard, { label: "\u9996\u7B14\u4E1A\u52A1\u5E74\u4EFD", value: cur.credit.summaryAmount.firstBizYear, unit: "\u5E74" }),
          /* @__PURE__ */ jsx5(SummaryCard, { label: "\u6388\u4FE1\u603B\u989D", value: cur.credit.summaryAmount.openCreditLimit, unit: "\u5143" }),
          /* @__PURE__ */ jsx5(SummaryCard, { label: "\u4F59\u989D\u5408\u8BA1", value: cur.credit.summaryAmount.usedBalance, unit: "\u5143" }),
          /* @__PURE__ */ jsx5(SummaryCard, { label: "\u5355\u6708\u6700\u9AD8\u903E\u671F", value: cur.credit.summaryAmount.maxMonthlyOverdue, unit: "\u5143", danger: cur.credit.summaryAmount.maxMonthlyOverdue > 0 }),
          /* @__PURE__ */ jsx5(SummaryCard, { label: "\u6700\u957F\u903E\u671F", value: cur.credit.summaryAmount.longestOverdueMonths, unit: "\u6708", danger: cur.credit.summaryAmount.longestOverdueMonths > 0 })
        ] })
      ] }),
      /* @__PURE__ */ jsxs5("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ jsx5(Panel, { title: "\u5F81\u4FE1\u903E\u671F", desc: /* @__PURE__ */ jsxs5("span", { children: [
          "\u5F53\u524D\u5F81\u4FE1\u903E\u671F \xB7 ",
          /* @__PURE__ */ jsx5(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
        ] }), children: /* @__PURE__ */ jsxs5("div", { style: { fontSize: 13, color: "#475569" }, children: [
          "\u903E\u671F\u7B14\u6570\uFF1A",
          /* @__PURE__ */ jsx5("b", { style: { color: cur.credit.overdue.count > 0 ? "#DC2626" : "#16A34A" }, children: cur.credit.overdue.count }),
          " \u7B14 \uFF5C \u903E\u671F\u91D1\u989D\uFF1A",
          /* @__PURE__ */ jsx5("b", { style: { color: cur.credit.overdue.amount > 0 ? "#DC2626" : "#16A34A" }, children: money(cur.credit.overdue.amount) })
        ] }) }),
        /* @__PURE__ */ jsx5(Panel, { title: "\u5BF9\u5916\u62C5\u4FDD", desc: /* @__PURE__ */ jsxs5("span", { children: [
          "\u62C5\u4FDD\u8D23\u4EFB \xB7 ",
          /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
        ] }), children: cur.credit.guarantee.length ? /* @__PURE__ */ jsx5("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: cur.credit.guarantee.map((g, i) => /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ jsx5("span", { style: { color: "#64748B" }, children: g.name }),
          /* @__PURE__ */ jsxs5("span", { style: { color: "#334155" }, children: [
            money(g.amount),
            " \xB7 ",
            /* @__PURE__ */ jsx5(Badge, { kind: g.status === "\u5173\u6CE8" ? "amber" : "gray", children: g.status })
          ] })
        ] }, i)) }) : /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u5BF9\u5916\u62C5\u4FDD" }) })
      ] }),
      /* @__PURE__ */ jsxs5(Panel, { title: "\u8FD1 6 \u6708\u67E5\u8BE2\u8BB0\u5F55", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u5F81\u4FE1\u67E5\u8BE2\u660E\u7EC6 \xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: [
        /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, color: "#94A3B8", marginBottom: 8 }, children: "\u673A\u6784\u67E5\u8BE2" }),
        /* @__PURE__ */ jsx5(DataTable, { columns: queryCols, rows: queryRows, empty: "\u65E0\u673A\u6784\u67E5\u8BE2\u8BB0\u5F55", pager: true, defaultPageSize: 8 }),
        /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, color: "#94A3B8", margin: "16px 0 8px" }, children: "\u672C\u4EBA\u67E5\u8BE2" }),
        cur.credit.selfQueries.length ? /* @__PURE__ */ jsx5(DataTable, { columns: selfQueryCols, rows: selfQueryRows, empty: "\u65E0\u672C\u4EBA\u67E5\u8BE2", pager: true, defaultPageSize: 8 }) : /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u672C\u4EBA\u67E5\u8BE2\u8BB0\u5F55" })
      ] }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u4FE1\u8D37\u8D26\u6237\u660E\u7EC6", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u4EBA\u884C\u5F81\u4FE1\u8D26\u6237 \xB7 \u4EBA\u884C\u53E3\u5F84\uFF08\u542B\u4ED6\u884C\u8D26\u6237\uFF1B\u672C\u884C\u501F\u636E\u89C1\u300C\u6388\u4FE1\u8D1F\u503A\u4E0E\u5171\u503A\u300DTab\uFF09\xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: /* @__PURE__ */ jsx5(DataTable, { columns: acctCols, rows: acctRows, empty: "\u65E0\u4FE1\u8D37\u8D26\u6237", pager: true, defaultPageSize: 8 }) }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u6388\u4FE1\u534F\u8BAE\u4FE1\u606F", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u5FAA\u73AF\u989D\u5EA6\u5171\u4EAB\u534F\u8BAE \xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: /* @__PURE__ */ jsx5(DataTable, { columns: agreeCols, rows: agreeRows, empty: "\u65E0\u6388\u4FE1\u534F\u8BAE", pager: true, defaultPageSize: 8 }) }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u76F8\u5173\u8FD8\u6B3E\u8D23\u4EFB\uFF08\u5171\u540C\u501F\u6B3E\uFF09", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u5171\u540C\u501F\u6B3E / \u8FDE\u5E26\u8D23\u4EFB \xB7 \u4E0E\u4ED6\u884C\u5171\u540C\u627F\u62C5\uFF08\u533A\u522B\u4E8E\u300C\u6388\u4FE1\u8D1F\u503A\u4E0E\u5171\u503A\u300DTab \u7684\u72EC\u7ACB\u8DE8\u673A\u6784\u501F\u8D37\uFF09\xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: cur.credit.relatedRepayList.length ? /* @__PURE__ */ jsx5(DataTable, { columns: repayCols, rows: repayRows, empty: "\u65E0\u76F8\u5173\u8FD8\u6B3E\u8D23\u4EFB", pager: true, defaultPageSize: 8 }) : /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u76F8\u5173\u8FD8\u6B3E\u8D23\u4EFB\u8BB0\u5F55" }) }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u516C\u5171\u8BB0\u5F55\u660E\u7EC6", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u6B20\u7A0E / \u6C11\u4E8B\u5224\u51B3 / \u5F3A\u5236\u6267\u884C / \u884C\u653F\u5904\u7F5A \xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), className: "mt-3", children: cur.credit.publicRecords.length ? /* @__PURE__ */ jsx5(DataTable, { columns: pubCols, rows: pubRows, empty: "\u65E0\u516C\u5171\u8BB0\u5F55", pager: true, defaultPageSize: 8 }) : /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u65E0\u516C\u5171\u8BB0\u5F55\uFF08\u6B20\u7A0E / \u6C11\u4E8B\u5224\u51B3 / \u5F3A\u5236\u6267\u884C / \u884C\u653F\u5904\u7F5A\uFF09" }) })
    ] }),
    tab === "\u6388\u4FE1\u8D1F\u503A\u4E0E\u5171\u503A" && /* @__PURE__ */ jsxs5("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
      /* @__PURE__ */ jsx5(Panel, { title: "\u989D\u5EA6\u4E0E\u8D1F\u503A\u6982\u89C8", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u672C\u884C\u53E3\u5F84\uFF1A\u672C\u884C\u6388\u4FE1\u4E0E\u5728\u8D37\u603B\u89C8\uFF08\u91D1\u989D\u4E0E\u592E\u884C\u5F81\u4FE1\u53E3\u5F84\u4E0D\u540C\uFF0C\u52FF\u6DF7\u6DC6\uFF09\xB7 ",
        /* @__PURE__ */ jsx5(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: /* @__PURE__ */ jsxs5("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
        /* @__PURE__ */ jsx5(SummaryCard, { label: "\u6388\u4FE1\u603B\u989D", value: cur.creditLimit, unit: "\u5143" }),
        /* @__PURE__ */ jsx5(SummaryCard, { label: "\u5DF2\u7528\u989D\u5EA6", value: cur.usedLimit, unit: "\u5143", danger: cur.usedLimit / Math.max(cur.creditLimit, 1) > 0.9 }),
        /* @__PURE__ */ jsx5(SummaryCard, { label: "\u53EF\u7528\u989D\u5EA6", value: cur.availLimit, unit: "\u5143" }),
        /* @__PURE__ */ jsx5(SummaryCard, { label: "\u5728\u8D37\u4F59\u989D", value: cur.totalDebt, unit: "\u5143" }),
        /* @__PURE__ */ jsx5(SummaryCard, { label: "\u6708\u4F9B\u5408\u8BA1", value: cur.monthlyPay, unit: "\u5143" }),
        /* @__PURE__ */ jsx5(SummaryCard, { label: "\u6700\u5927\u903E\u671F\u5929\u6570", value: cur.overdueDays, unit: "\u5929", danger: cur.overdueDays > 0 })
      ] }) }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u50AC\u6536\u6848\u4EF6", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u903E\u671F\u50AC\u6536\u8FDB\u5C55 \xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), children: cur.collections.length ? /* @__PURE__ */ jsx5("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: cur.collections.map((cs) => /* @__PURE__ */ jsxs5("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" }, children: [
        /* @__PURE__ */ jsxs5("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 10 }, children: [
          /* @__PURE__ */ jsx5("span", { style: { fontSize: 14, fontWeight: 700, color: "#1E293B" }, children: cs.id }),
          /* @__PURE__ */ jsx5(Badge, { kind: STAGE_KIND[cs.stage], children: cs.stage }),
          /* @__PURE__ */ jsx5("span", { style: { fontSize: 12, color: "#64748B" }, children: cs.product }),
          /* @__PURE__ */ jsx5(Badge, { kind: cs.status === "\u59D4\u5916" || cs.status === "\u6838\u9500" ? "red" : cs.status === "\u627F\u8BFA\u8FD8\u6B3E" ? "green" : "blue", children: cs.status }),
          /* @__PURE__ */ jsxs5("span", { style: { fontSize: 12, color: "#94A3B8", marginLeft: "auto" }, children: [
            "\u50AC\u6536\u5458 ",
            cs.owner,
            " \uFF5C \u6700\u8FD1\u89E6\u8FBE ",
            cs.lastTouch
          ] })
        ] }),
        /* @__PURE__ */ jsxs5("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 10 }, children: [
          /* @__PURE__ */ jsxs5("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ jsx5("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u903E\u671F\u91D1\u989D" }),
            /* @__PURE__ */ jsx5("div", { style: { fontSize: 16, fontWeight: 700, color: "#DC2626" }, children: money(cs.overdueAmt) })
          ] }),
          /* @__PURE__ */ jsxs5("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ jsx5("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u903E\u671F\u5929\u6570" }),
            /* @__PURE__ */ jsxs5("div", { style: { fontSize: 16, fontWeight: 700, color: "#1E293B" }, children: [
              cs.overdueDays,
              " \u5929"
            ] })
          ] }),
          /* @__PURE__ */ jsxs5("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ jsx5("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u5E94\u8FD8\u65E5" }),
            /* @__PURE__ */ jsx5("div", { style: { fontSize: 16, fontWeight: 700, color: "#1E293B" }, children: cs.dueDate })
          ] }),
          /* @__PURE__ */ jsxs5("div", { style: { background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }, children: [
            /* @__PURE__ */ jsx5("div", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u89E6\u8FBE" }),
            /* @__PURE__ */ jsxs5("div", { style: { fontSize: 16, fontWeight: 700, color: "#1E293B" }, children: [
              cs.calls,
              " \u547C / ",
              cs.sms,
              " \u4FE1"
            ] })
          ] })
        ] }),
        cs.notes.length > 0 && /* @__PURE__ */ jsxs5("div", { style: { borderTop: "1px dashed #E2E8F0", paddingTop: 8 }, children: [
          /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 4 }, children: "\u50AC\u6536\u8BB0\u5F55" }),
          cs.notes.slice(0, 3).map((n, i) => /* @__PURE__ */ jsxs5("div", { style: { display: "flex", gap: 8, fontSize: 12, padding: "3px 0", color: "#334155" }, children: [
            /* @__PURE__ */ jsx5("span", { style: { color: "#94A3B8", flexShrink: 0 }, children: n.time }),
            /* @__PURE__ */ jsx5("span", { style: { color: "#64748B", flexShrink: 0 }, children: n.who }),
            /* @__PURE__ */ jsx5("span", { children: n.what })
          ] }, i))
        ] })
      ] }, cs.id)) }) : /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#94A3B8" }, children: "\u8BE5\u5BA2\u6237\u5F53\u524D\u65E0\u50AC\u6536\u6848\u4EF6" }) }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u989D\u5EA6\u660E\u7EC6", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u5404\u4EA7\u54C1\u5DF2\u7528\u989D\u5EA6 \xB7 ",
        /* @__PURE__ */ jsx5(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: /* @__PURE__ */ jsx5(DataTable, { columns: limitCols, rows: limitRows, empty: "\u65E0", pager: true, defaultPageSize: 10 }) }),
      /* @__PURE__ */ jsx5(Panel, { title: "\u8D37\u6B3E\u53F0\u8D26", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u5728\u8D37\u501F\u636E\u660E\u7EC6 \xB7 \u672C\u884C\u6838\u5FC3\u7CFB\u7EDF\uFF08\u672C\u884C\u53E3\u5F84\uFF09\xB7 ",
        /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
      ] }), children: /* @__PURE__ */ jsx5(DataTable, { columns: debtCols, rows: debtRows, empty: "\u65E0\u5728\u8D37\u8BB0\u5F55", pager: true, defaultPageSize: 10 }) }),
      /* @__PURE__ */ jsxs5(Panel, { title: "\u591A\u5934\u5171\u503A", desc: /* @__PURE__ */ jsxs5("span", { children: [
        "\u8DE8\u673A\u6784\u72EC\u7ACB\u501F\u8D37\uFF08\u5171\u540C\u501F\u6B3E / \u8FDE\u5E26\u8D23\u4EFB\u89C1\u300C\u592E\u884C\u5F81\u4FE1\u300DTab \u76F8\u5173\u8FD8\u6B3E\u8D23\u4EFB\uFF09\xB7 \u8FD1 30 \u5929\u591A\u5934\u7533\u8BF7 ",
        cur.coDebt.applications30d,
        " \u6B21 \xB7 ",
        /* @__PURE__ */ jsx5(Cal, { label: "\u5B9E\u65F6\u805A\u5408" })
      ] }), children: [
        /* @__PURE__ */ jsx5(DataTable, { columns: coDebtCols, rows: coDebtRows, empty: "\u65E0\u5171\u503A", pager: true, defaultPageSize: 8 }),
        cur.coDebt.chain.length > 0 && /* @__PURE__ */ jsxs5("div", { style: { marginTop: 12 }, children: [
          /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, color: "#94A3B8", marginBottom: 8 }, children: "\u5171\u503A\u94FE\u6761" }),
          /* @__PURE__ */ jsx5("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: cur.coDebt.chain.map((c, i) => /* @__PURE__ */ jsx5("div", { style: { fontSize: 13, color: "#334155", borderLeft: "3px solid #DC2626", paddingLeft: 10 }, children: c }, i)) })
        ] })
      ] })
    ] }),
    tab === "\u5173\u7CFB\u7F51\u7EDC" && /* @__PURE__ */ jsx5(Panel, { title: "\u5173\u7CFB\u56FE\u8C31", desc: /* @__PURE__ */ jsxs5("span", { children: [
      "\u878D\u5408\u8054\u7CFB\u4EBA\u3001\u5171\u503A\u3001\u8D44\u91D1\u3001\u62C5\u4FDD\u3001\u8BBE\u5907\u7B49\u591A\u7EF4\u5173\u7CFB \xB7 \u70B9\u51FB\u8282\u70B9/\u5173\u7CFB\u67E5\u770B\u5C5E\u6027 \xB7 \u53F3\u4FA7\u6E05\u5355\u4E0E\u56FE\u8C31\u8054\u52A8 \xB7 ",
      /* @__PURE__ */ jsx5(Sam, { value: "custProfileData.ts" })
    ] }), children: /* @__PURE__ */ jsx5(
      RelationGraphView,
      {
        graph: cur.relationGraph,
        theme: relTheme,
        onTheme: setRelTheme,
        sel: relSel,
        onPick: setRelSel,
        nodeMap: relNodeMap
      }
    ) }),
    /* @__PURE__ */ jsx5(Modal, { open: !!alertDetail, onClose: () => setAlertDetail(null), title: "\u9884\u8B66\u660E\u7EC6", width: "max-w-lg", children: alertDetail && /* @__PURE__ */ jsxs5("div", { children: [
      /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }, children: [
        /* @__PURE__ */ jsx5(Badge, { kind: alertDetail.level === "\u7EA2" ? "red" : alertDetail.level === "\u9EC4" ? "amber" : "blue", children: alertDetail.level }),
        /* @__PURE__ */ jsx5(Badge, { kind: alertDetail.status === "\u5F85\u5904\u7F6E" ? "red" : alertDetail.status === "\u5904\u7F6E\u4E2D" ? "amber" : "green", children: alertDetail.status }),
        /* @__PURE__ */ jsx5("span", { style: { fontSize: 12, color: "#94A3B8", marginLeft: "auto" }, children: alertDetail.id })
      ] }),
      /* @__PURE__ */ jsxs5("div", { style: { display: "grid", gridTemplateColumns: "110px 1fr", rowGap: 12, columnGap: 12, fontSize: 13 }, children: [
        /* @__PURE__ */ jsx5("div", { style: { color: "#64748B" }, children: "\u547D\u4E2D\u89C4\u5219" }),
        /* @__PURE__ */ jsx5("div", { style: { color: "#1E293B", fontWeight: 600 }, children: alertDetail.rule }),
        /* @__PURE__ */ jsx5("div", { style: { color: "#64748B" }, children: "\u89E6\u53D1\u65E5\u671F" }),
        /* @__PURE__ */ jsx5("div", { style: { color: "#1E293B" }, children: alertDetail.date }),
        /* @__PURE__ */ jsx5("div", { style: { color: "#64748B" }, children: "\u89C4\u5219\u8BF4\u660E" }),
        /* @__PURE__ */ jsx5("div", { style: { color: "#475569", lineHeight: 1.6 }, children: alertDetail.desc }),
        /* @__PURE__ */ jsx5("div", { style: { color: "#64748B" }, children: "\u5904\u7F6E\u72B6\u6001" }),
        /* @__PURE__ */ jsx5("div", { style: { color: "#1E293B" }, children: alertDetail.status }),
        /* @__PURE__ */ jsx5("div", { style: { color: "#64748B" }, children: "\u5904\u7F6E\u5EFA\u8BAE" }),
        /* @__PURE__ */ jsx5("div", { style: { color: "#475569", lineHeight: 1.6 }, children: alertDetail.level === "\u7EA2" && alertDetail.status === "\u5F85\u5904\u7F6E" ? "\u7EA2\u706F\u9884\u8B66\u4E14\u672A\u5904\u7F6E\uFF0C\u5EFA\u8BAE\u7ACB\u5373\u4ECB\u5165\uFF1A\u7535\u8BDD/\u4E0A\u95E8\u6838\u5B9E\u3001\u89C6\u60C5\u51B5\u51BB\u7ED3\u989D\u5EA6\u6216\u542F\u52A8\u50AC\u6536\u3002" : alertDetail.level === "\u7EA2" ? "\u7EA2\u706F\u9884\u8B66\u5904\u7F6E\u4E2D\uFF0C\u6301\u7EED\u8DDF\u8FDB\u5904\u7F6E\u8FDB\u5C55\u5E76\u590D\u6838\u95ED\u73AF\u6761\u4EF6\u3002" : alertDetail.level === "\u9EC4" ? "\u9EC4\u706F\u9884\u8B66\uFF0C\u7EB3\u5165\u89C2\u5BDF\u540D\u5355\u5E76\u5B89\u6392\u590D\u6838\uFF0C\u5FC5\u8981\u65F6\u5347\u7EA7\u5904\u7F6E\u3002" : "\u84DD\u706F\u9884\u8B66\uFF0C\u5DF2\u95ED\u73AF\uFF0C\u8F6C\u4E3A\u5E38\u89C4\u89C2\u5BDF\u5373\u53EF\u3002" })
      ] }),
      /* @__PURE__ */ jsx5("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: 18 }, children: /* @__PURE__ */ jsx5(Button, { variant: "secondary", onClick: () => setAlertDetail(null), children: "\u5173\u95ED" }) })
    ] }) })
  ] });
}
export {
  CustProfile
};
/*! Bundled license information:

@remix-run/router/dist/router.js:
  (**
   * @remix-run/router v1.23.3
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

react-router/dist/index.js:
  (**
   * React Router v6.30.4
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

react-router-dom/dist/index.js:
  (**
   * React Router DOM v6.30.4
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)
*/
