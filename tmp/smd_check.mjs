// src/console/ScoreModelDetail.tsx
import { useEffect as useEffect6, useState as useState6 } from "react";

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

// src/console/scoreData.ts
import { useSyncExternalStore } from "react";
var SCORE_PROD_LABEL = {
  zhicha: "\u667A\u5BDF\u5206",
  zhixin: "\u667A\u4FE1\u5206",
  zhirong: "\u667A\u878D\u5206"
};
var COLLISION_SEED = {
  zhicha: [
    { id: "zc-1", conflict: "\u547D\u4E2D\u5916\u90E8\u9ED1\u7070\u540D\u5355", result: "\u5F3A\u5236\u62D2\u7EDD\uFF08\u5206\u6570\u5C01\u9876 95\uFF0C\u8986\u76D6\u6A21\u578B\u5206\uFF09", priority: "\u62E6\u622A\u4F18\u5148", enabled: true },
    { id: "zc-2", conflict: "XGB \u4E2D\u98CE\u9669(40-69) \u2229 \u8BBE\u5907\u6A21\u62DF\u5668\u7279\u5F81\u547D\u4E2D", result: "\u5347\u7EA7\u4E3A\u9AD8\u98CE\u9669\u9884\u8B66\uFF0C\u5F3A\u5316\u6838\u9A8C", priority: "\u8F6C\u4EBA\u5DE5", enabled: true },
    { id: "zc-3", conflict: "\u89C4\u5219\u96C6\u7ED3\u679C\u4E0E\u6A21\u578B\u5206\u65B9\u5411\u76F8\u53CD", result: "\u751F\u6210\u300C\u6B3A\u8BC8\u8986\u76D6\u300D\u9884\u8B66\uFF0C\u8F6C\u4EBA\u5DE5\u590D\u6838", priority: "\u62E6\u622A\u4F18\u5148", enabled: true }
  ],
  zhixin: [
    { id: "zx-1", conflict: "\u4FE1\u7528\u5206 781-900(\u63D0\u989D) \u2229 \u5386\u53F2 M3+ \u903E\u671F\u22652(\u62D2\u7EDD)", result: "\u62D2\u7EDD\u4F18\u5148\uFF0C\u751F\u6210\u300C\u8BC4\u5206-\u89C4\u5219\u51B2\u7A81\u300D\u9884\u8B66\u8F6C\u4EBA\u5DE5", priority: "\u62E6\u622A\u4F18\u5148", enabled: true },
    { id: "zx-2", conflict: "\u8D1F\u503A\u6536\u5165\u6BD4\u226570% \u2229 \u6807\u51C6\u989D\u5EA6", result: "\u964D\u4E3A\u5BA1\u614E\u6388\u4FE1", priority: "\u5206\u6570\u4F18\u5148", enabled: true }
  ],
  zhirong: [
    { id: "zr-1", conflict: "\u667A\u5BDF(\u6B3A\u8BC8\u9AD8\u98CE\u9669) \u2229 \u667A\u878D(\u9AD8\u4EF7\u503C)", result: "\u6B3A\u8BC8\u4F18\u5148\u62D2\u7EDD\uFF0C\u751F\u6210\u300C\u6B3A\u8BC8\u8986\u76D6\u9AD8\u4EF7\u503C\u300D\u9884\u8B66", priority: "\u62E6\u622A\u4F18\u5148", enabled: true },
    { id: "zr-2", conflict: "\u5174\u8DA3 \u2229 \u8D44\u4EA7 \u7EF4\u5EA6\u51B2\u7A81", result: "\u53D6\u4FDD\u5B88\u7B56\u7565\uFF0C\u6807\u51C6\u7ECF\u8425", priority: "\u5206\u6570\u4F18\u5148", enabled: true }
  ]
};
var ZHIXIN_SCORECARD = [
  { key: "m3", name: "\u5386\u53F2\u903E\u671F\u8BB0\u5F55\uFF08\u8FD12\u5E74 M3+ \u6B21\u6570\uFF09", bins: [
    { label: "0 \u6B21", points: 48, min: 0, max: 0 },
    { label: "1 \u6B21", points: 30, min: 1, max: 1 },
    { label: "2 \u6B21", points: 0, min: 2, max: 2 },
    { label: "\u22653 \u6B21", points: -48, min: 3 }
  ] },
  { key: "dir", name: "\u8D1F\u503A\u6536\u5165\u6BD4\uFF08%\uFF09", bins: [
    { label: "\u226440%", points: 44, max: 40 },
    { label: "41\u201360%", points: 26, min: 41, max: 60 },
    { label: "61\u201370%", points: -10, min: 61, max: 70 },
    { label: ">70%", points: -44, gt: 70 }
  ] },
  { key: "inc", name: "\u6536\u5165\u7A33\u5B9A\u6027\uFF08\u8FDE\u7EED\u6309\u65F6\u8FD8\u6B3E\u6708\u6570\uFF09", bins: [
    { label: "\u226524 \u6708", points: 40, min: 24 },
    { label: "12\u201323 \u6708", points: 28, min: 12, max: 23 },
    { label: "6\u201311 \u6708", points: -5, min: 6, max: 11 },
    { label: "<6 \u6708", points: -40, lt: 6 }
  ] },
  { key: "q6", name: "\u5F81\u4FE1\u67E5\u8BE2\u9891\u6B21\uFF08\u8FD16\u6708\u6B21\u6570\uFF09", bins: [
    { label: "\u22644 \u6B21", points: 40, max: 4 },
    { label: "5\u20139 \u6B21", points: 16, min: 5, max: 9 },
    { label: "10\u201315 \u6B21", points: -22, min: 10, max: 15 },
    { label: ">15 \u6B21", points: -40, gt: 15 }
  ] },
  { key: "util", name: "\u6388\u4FE1\u4F7F\u7528\u7387\uFF08%\uFF09", bins: [
    { label: "\u226430%", points: 36, max: 30 },
    { label: "31\u201350%", points: 12, min: 31, max: 50 },
    { label: "51\u201370%", points: -14, min: 51, max: 70 },
    { label: ">70%", points: -36, gt: 70 }
  ] }
];
var SEED_SCORE = {
  models: [
    {
      prod: "zhicha",
      name: "\u667A\u5BDF\u5206",
      range: [0, 100],
      color: "#ef4444",
      score: 78,
      dims: [
        { name: "\u591A\u5934\u501F\u8D37\u5F3A\u5EA6", value: "7 \u5BB6 / 30\u5929", weight: 28 },
        { name: "\u8BBE\u5907\u73AF\u5883\u98CE\u9669", value: "\u6A21\u62DF\u5668\u7279\u5F81\u547D\u4E2D", weight: 22 },
        { name: "\u9ED1\u7070\u540D\u5355\u547D\u4E2D", value: "\u5916\u90E8\u7070\u540D\u5355", weight: 20 },
        { name: "\u540C\u8BBE\u5907\u5173\u8054", value: "3 \u4E2A\u5173\u8054\u8D26\u53F7", weight: 18 }
      ],
      enabled: true,
      version: "v2.3.1",
      updatedAt: "2026-07-28",
      algoType: "\u68AF\u5EA6\u63D0\u5347\u6811 XGBoost + \u89C4\u5219\u786C\u62E6\u622A + \u89C4\u5219\u4FEE\u6B63",
      algoCode: `# \u667A\u5BDF\u5206 \xB7 \u6B3A\u8BC8\u8BC6\u522B\u6A21\u578B\uFF08XGBoost + \u89C4\u5219\u786C\u62E6\u622A + \u4E3B\u7EBF\u89C4\u5219\u4FEE\u6B63\uFF09
# \u8F93\u51FA 0-100\uFF0C\u5206\u6570\u8D8A\u9AD8\u6B3A\u8BC8\u98CE\u9669\u8D8A\u9AD8
def score_zhicha(req):
    feats = extract_features(req)                 # \u8BBE\u5907/\u7F51\u7EDC/\u884C\u4E3A/\u540D\u5355
    base = xgb_model.predict_proba(feats)['fraud'] * 100   # \u6B3A\u8BC8\u57FA\u7840\u5206 0-100
    if hit_blacklist(req):                        # \u89C4\u5219\u786C\u62E6\u622A\uFF1A\u547D\u4E2D\u5916\u90E8\u9ED1\u7070\u540D\u5355\u76F4\u63A5\u5C01\u9876
        base = max(base, 95)
    # \u4E3B\u7EBF\u98CE\u9669\u89C4\u5219\u4FEE\u6B63\u5F15\u64CE\uFF08\u72EC\u7ACB\u5224\u5B9A\u3001\u7D2F\u52A0\uFF0C\u5C01\u9876 100\uFF09
    adjust = 0
    if device_multi_apply_tag == 1:  adjust += 12   # Rule-001 \u540C\u8BBE\u5907\u77ED\u671F\u591A\u6B21\u7533\u8BF7
    if ip_risk_tag == 1:            adjust += 10   # Rule-002 \u7533\u8BF7IP\u98CE\u9669\u753B\u50CF
    if black_contact_tag == 1:      adjust += 15   # Rule-003 \u7D27\u6025\u8054\u7CFB\u4EBA\u547D\u4E2D\u98CE\u9669\u540D\u5355
    if mobile_register_months < 3:  adjust += 8    # Rule-004 \u624B\u673A\u53F7\u5165\u7F51\u4E0D\u8DB33\u4E2A\u6708
    final = min(base + adjust, 100)                # \u5206\u6570\u4E0A\u9650100\uFF0C\u4E0D\u6EA2\u51FA
    return round(final, 1)

# \u7279\u5F81\u5206\u88C2\u589E\u76CA\uFF08\u5F52\u4E00\u5316\uFF09
WEIGHTS = {
    '\u8FD130\u5929\u7533\u8D37\u5E73\u53F0\u6570': 0.28,
    '\u8BBE\u5907\u73AF\u5883\u98CE\u9669':     0.22,
    '\u547D\u4E2D\u9ED1\u7070\u540D\u5355':     0.20,
    '\u540C\u8BBE\u5907\u5173\u8054\u8D26\u53F7':   0.18,
    '\u8D1F\u503A\u6536\u5165\u6BD4':       0.12,
}`,
      versions: [
        { version: "v2.3.1", date: "2026-07-28", note: "\u4F18\u5316\u8BBE\u5907\u98CE\u9669\u8BC6\u522B\uFF0C\u6B3A\u8BC8\u53EC\u56DE\u63D0\u5347 3.1pp", current: true },
        { version: "v1.3.0", date: "2026-06-15", note: "\u4E09\u6A21\u578B\u7EDF\u4E00\u8BC4\u5206\u670D\u52A1\u5316\uFF0C\u652F\u6301\u6279\u91CF\u4E0E API", current: false }
      ],
      factors: [
        { name: "\u8FD130\u5929\u7533\u8D37\u5E73\u53F0\u6570", weight: 28 },
        { name: "\u8BBE\u5907\u73AF\u5883\u98CE\u9669", weight: 22 },
        { name: "\u547D\u4E2D\u9ED1\u7070\u540D\u5355", weight: 20 },
        { name: "\u540C\u8BBE\u5907\u5173\u8054\u8D26\u53F7", weight: 18 },
        { name: "\u8D1F\u503A\u6536\u5165\u6BD4", weight: 12 }
      ],
      /* 主线规则修正引擎（数据落地：规则集与算法分离，改内容只动此处） */
      bins: [
        { key: "rule_001", name: "Rule-001 \u540C\u4E00\u8BBE\u5907\u77ED\u671F\u5185\u591A\u6B21\u7533\u8BF7", bins: [{ label: "device_multi_apply_tag == 1", points: 12 }] },
        { key: "rule_002", name: "Rule-002 \u7533\u8BF7IP\u5B58\u5728\u98CE\u9669\u753B\u50CF", bins: [{ label: "ip_risk_tag == 1", points: 10 }] },
        { key: "rule_003", name: "Rule-003 \u7D27\u6025\u8054\u7CFB\u4EBA\u547D\u4E2D\u98CE\u9669\u540D\u5355", bins: [{ label: "black_contact_tag == 1", points: 15 }] },
        { key: "rule_004", name: "Rule-004 \u624B\u673A\u53F7\u5165\u7F51\u4E0D\u8DB33\u4E2A\u6708", bins: [{ label: "mobile_register_months < 3", points: 8 }] }
      ],
      collisionRules: COLLISION_SEED.zhicha.map((r) => ({ ...r }))
    },
    {
      prod: "zhixin",
      name: "\u667A\u4FE1\u5206",
      range: [300, 900],
      color: "#22c55e",
      score: 712,
      dims: [
        { name: "\u5386\u53F2\u903E\u671F\u8BB0\u5F55", value: "\u8FD12\u5E74 M3+ 1 \u6B21", weight: 26 },
        { name: "\u8D1F\u503A\u6536\u5165\u6BD4", value: "58%", weight: 22 },
        { name: "\u5F81\u4FE1\u67E5\u8BE2\u9891\u6B21", value: "\u8FD16\u6708 8 \u6B21", weight: 18 },
        { name: "\u6536\u5165\u7A33\u5B9A\u6027", value: "\u8FDE\u7EED 14 \u6708", weight: 20 },
        { name: "\u6388\u4FE1\u4F7F\u7528\u7387", value: "43%", weight: 14 }
      ],
      enabled: true,
      version: "v3.1.0",
      updatedAt: "2026-08-02",
      algoType: "\u8BC4\u5206\u5361 \xB7 \u903B\u8F91\u56DE\u5F52\uFF08Logistic Regression\uFF09",
      algoCode: `# \u667A\u4FE1\u5206 \xB7 \u8BC4\u5206\u5361\u7B97\u6CD5\uFF08\u903B\u8F91\u56DE\u5F52\uFF09
# Score = A - B * ln(odds)\uFF0C\u57FA\u7840\u5206 A=600\uFF0C\u659C\u7387 B=20
def score_zhixin(features):
    points = 600                         # \u57FA\u7840\u5206
    points += w_\u5386\u53F2\u903E\u671F\u8BB0\u5F55(features['m3_overdue'])
    points += w_\u8D1F\u503A\u6536\u5165\u6BD4(features['dir'])
    points += w_\u5F81\u4FE1\u67E5\u8BE2\u9891\u6B21(features['query_6m'])
    points += w_\u6536\u5165\u7A33\u5B9A\u6027(features['income_stable'])
    points += w_\u6388\u4FE1\u4F7F\u7528\u7387(features['util_rate'])
    return clip(points, 300, 900)

# \u56E0\u5B50\u6743\u91CD\uFF08WOE \u7CFB\u6570 * B\uFF09
WEIGHTS = {
    '\u5386\u53F2\u903E\u671F\u8BB0\u5F55': 0.26,
    '\u8D1F\u503A\u6536\u5165\u6BD4':   0.22,
    '\u5F81\u4FE1\u67E5\u8BE2\u9891\u6B21': 0.18,
    '\u6536\u5165\u7A33\u5B9A\u6027':   0.20,
    '\u6388\u4FE1\u4F7F\u7528\u7387':   0.14,
}`,
      versions: [
        { version: "v3.1.0", date: "2026-08-02", note: "\u65B0\u589E\u8D1F\u503A\u6536\u5165\u6BD4\u7279\u5F81\uFF0CKS \u63D0\u5347\u81F3 0.38", current: true },
        { version: "v1.3.0", date: "2026-06-15", note: "\u4E09\u6A21\u578B\u7EDF\u4E00\u8BC4\u5206\u670D\u52A1\u5316\uFF0C\u652F\u6301\u6279\u91CF\u4E0E API", current: false }
      ],
      factors: [
        { name: "\u5386\u53F2\u903E\u671F\u8BB0\u5F55", weight: 26 },
        { name: "\u8D1F\u503A\u6536\u5165\u6BD4", weight: 22 },
        { name: "\u5F81\u4FE1\u67E5\u8BE2\u9891\u6B21", weight: 18 },
        { name: "\u6536\u5165\u7A33\u5B9A\u6027", weight: 20 },
        { name: "\u6388\u4FE1\u4F7F\u7528\u7387", weight: 14 }
      ],
      collisionRules: COLLISION_SEED.zhixin.map((r) => ({ ...r })),
      bins: ZHIXIN_SCORECARD.map((f) => ({ ...f, bins: f.bins.map((b) => ({ ...b })) }))
    },
    {
      prod: "zhirong",
      name: "\u667A\u878D\u5206",
      range: [350, 950],
      color: "#8b5cf6",
      score: 655,
      dims: [
        { name: "\u8FDD\u7EA6\u7EF4\u5EA6\uFF08\u667A\u4FE1\u5206\uFF09", value: "\u4FE1\u7528\u5206 712", weight: 34 },
        { name: "\u501F\u8D37\u5174\u8DA3", value: "\u8FD130\u5929\u6D3B\u8DC3 18 \u5929", weight: 24 },
        { name: "\u8F6C\u5316\u610F\u613F", value: "\u6D3B\u52A8\u54CD\u5E94 2 \u6B21", weight: 18 },
        { name: "\u8D44\u4EA7\u72B6\u51B5", value: "\u623F\u4EA7+\u7406\u8D22\u6301\u4ED3", weight: 24 }
      ],
      enabled: true,
      version: "v1.4.2",
      updatedAt: "2026-07-31",
      algoType: "\u68AF\u5EA6\u63D0\u5347\u6811GBDT + \u903B\u8F91\u56DE\u5F52\u878D\u5408\u6A21\u578B \xB7 \u4FE1\u7528\u89C4\u5219\u4FEE\u6B63 + \u52A0\u6743\u878D\u5408",
      algoCode: `# \u667A\u878D\u5206 \xB7 \u7EFC\u5408\u4EF7\u503C\u6A21\u578B\uFF08GBDT+LR \u57FA\u7840\u6A21\u578B + \u4FE1\u7528\u89C4\u5219\u4FEE\u6B63 + \u52A0\u6743\u878D\u5408\uFF09
# \u5206\u6570\u533A\u95F4 350-950\uFF0C\u57FA\u7840\u5206 600\uFF1B\u5206\u6570\u8D8A\u9AD8\u4FE1\u7528\u8D44\u8D28\u8D8A\u597D\u3001\u8FDD\u7EA6\u6982\u7387\u8D8A\u4F4E
def score_zhirong(cust):
    # \u57FA\u7840\u6A21\u578B\uFF1AGBDT+LR \u878D\u5408\u8FDD\u7EA6/\u5174\u8DA3/\u8F6C\u5316/\u8D44\u4EA7\uFF0C\u8F93\u51FA base_credit_score\uFF08350-950\uFF09
    base = gbdt_lr_model.predict(cust_features(cust))
    # \u4E3B\u7EBF\u4FE1\u7528\u89C4\u5219\u4FEE\u6B63\u5F15\u64CE\uFF08\u72EC\u7ACB\u5224\u5B9A\u3001\u7D2F\u52A0\uFF1B\u8D1F\u5411\u6263\u51CF\u3001\u6B63\u5411\u52A0\u5206\uFF1B\u5C01\u9876\u533A\u95F4\uFF09
    adjust = 0
    if current_overdue_status == 1:                 adjust -= 60   # Rule-001 \u5F53\u524D\u5B58\u5728\u903E\u671F
    if twentyfour_month_overdue_cnt >= 3:           adjust -= 40   # Rule-002 \u8FD124\u6708\u591A\u6B21\u903E\u671F
    if credit_util_ratio > 0.85:                    adjust -= 35   # Rule-003 \u6388\u4FE1\u4F7F\u7528\u7387\u8FC7\u9AD8
    if dti_ratio > 0.8:                             adjust -= 30   # Rule-004 \u8D1F\u503A\u6536\u5165\u6BD4\u8D85\u6807
    if six_month_query_cnt > 12:                    adjust -= 25   # Rule-005 \u5F81\u4FE1\u67E5\u8BE2\u9891\u7E41
    if overdue == 0 and util < 0.5 and dti < 0.4:   adjust += 20   # Rule-006 \u5F81\u4FE1\u4F18\u8D28\u8D1F\u503A\u5065\u5EB7
    final_credit_score = clip(base + adjust, 350, 950)            # \u5F3A\u5236\u7EA6\u675F\u533A\u95F4\uFF0C\u65E0\u6EA2\u51FA
    # \u7EFC\u5408\u4EF7\u503C\u878D\u5408\uFF08\u8FDD\u7EA6\u7EF4\u5EA6\u7531\u667A\u4FE1\u5206\u63D0\u4F9B\uFF09
    value = (0.34 * normalize(zhixin(cust)) +
             0.24 * interest(cust) +
             0.18 * conversion(cust) +
             0.24 * asset(cust)) * 600 + 300
    return value

# \u878D\u5408\u6743\u91CD
WEIGHTS = {
    '\u8FDD\u7EA6\u7EF4\u5EA6\uFF08\u667A\u4FE1\u5206\uFF09': 0.34,
    '\u501F\u8D37\u5174\u8DA3':           0.24,
    '\u8F6C\u5316\u610F\u613F':           0.18,
    '\u8D44\u4EA7\u72B6\u51B5':           0.24,
}`,
      versions: [
        { version: "v1.4.2", date: "2026-07-31", note: "\u878D\u5408\u8D44\u4EA7\u7EF4\u5EA6\uFF0C\u7EFC\u5408\u533A\u5206\u529B\u63D0\u5347", current: true },
        { version: "v1.3.0", date: "2026-06-15", note: "\u4E09\u6A21\u578B\u7EDF\u4E00\u8BC4\u5206\u670D\u52A1\u5316\uFF0C\u652F\u6301\u6279\u91CF\u4E0E API", current: false }
      ],
      factors: [
        { name: "\u8FDD\u7EA6\u7EF4\u5EA6\uFF08\u667A\u4FE1\u5206\uFF09", weight: 34 },
        { name: "\u501F\u8D37\u5174\u8DA3", weight: 24 },
        { name: "\u8F6C\u5316\u610F\u613F", weight: 18 },
        { name: "\u8D44\u4EA7\u72B6\u51B5", weight: 24 }
      ],
      /* 主线信用规则修正引擎（数据落地：规则集与算法分离，改内容只动此处） */
      bins: [
        { key: "rule_001", name: "Rule-001 \u5F53\u524D\u5B58\u5728\u903E\u671F", bins: [{ label: "current_overdue_status == 1", points: -60 }] },
        { key: "rule_002", name: "Rule-002 \u8FD124\u4E2A\u6708\u591A\u6B21\u903E\u671F", bins: [{ label: "twentyfour_month_overdue_cnt >= 3", points: -40 }] },
        { key: "rule_003", name: "Rule-003 \u5FAA\u73AF\u6388\u4FE1\u4F7F\u7528\u7387\u8FC7\u9AD8", bins: [{ label: "credit_util_ratio > 0.85", points: -35 }] },
        { key: "rule_004", name: "Rule-004 \u8D1F\u503A\u6536\u5165\u6BD4\u8D85\u6807", bins: [{ label: "dti_ratio > 0.8", points: -30 }] },
        { key: "rule_005", name: "Rule-005 \u77ED\u671F\u5F81\u4FE1\u67E5\u8BE2\u9891\u7E41", bins: [{ label: "six_month_query_cnt > 12", points: -25 }] },
        { key: "rule_006", name: "Rule-006 \u5F81\u4FE1\u4F18\u8D28\u8D1F\u503A\u5065\u5EB7", bins: [{ label: "overdue == 0 && util < 0.5 && dti < 0.4", points: 20 }] }
      ],
      collisionRules: COLLISION_SEED.zhirong.map((r) => ({ ...r }))
    }
  ],
  records: [
    { id: "R-001", time: "2026-08-11 09:12", custId: "CUST-100891", custName: "\u5F20\u4F1F", model: "zhicha", score: 82, level: "\u9AD8", source: "\u5B9E\u65F6", status: "success" },
    { id: "R-002", time: "2026-08-11 09:15", custId: "CUST-100892", custName: "\u674E\u5A1C", model: "zhixin", score: 688, level: "B", source: "\u5B9E\u65F6", status: "success" },
    { id: "R-003", time: "2026-08-11 09:21", custId: "CUST-100893", custName: "\u738B\u82B3", model: "zhirong", score: 642, level: "B", source: "API", status: "success" },
    { id: "R-004", time: "2026-08-11 09:33", custId: "CUST-100894", custName: "\u5218\u5F3A", model: "zhicha", score: 41, level: "\u4F4E", source: "\u5B9E\u65F6", status: "success" },
    { id: "R-005", time: "2026-08-11 09:40", custId: "CUST-100895", custName: "\u9648\u9759", model: "zhixin", score: 521, level: "C", source: "\u6279\u91CF", status: "fail" },
    { id: "R-006", time: "2026-08-11 09:52", custId: "CUST-100896", custName: "\u6768\u5149", model: "zhirong", score: 703, level: "A", source: "\u5B9E\u65F6", status: "success" },
    { id: "R-007", time: "2026-08-11 10:01", custId: "CUST-100897", custName: "\u8D75\u654F", model: "zhicha", score: 67, level: "\u4E2D", source: "API", status: "success" },
    { id: "R-008", time: "2026-08-11 10:14", custId: "CUST-100898", custName: "\u5B59\u78CA", model: "zhixin", score: 745, level: "A", source: "\u5B9E\u65F6", status: "success" },
    { id: "R-009", time: "2026-08-11 10:22", custId: "CUST-100899", custName: "\u5468\u5A77", model: "zhirong", score: 598, level: "C", source: "\u6279\u91CF", status: "success" },
    { id: "R-010", time: "2026-08-11 10:31", custId: "CUST-100900", custName: "\u5434\u660A", model: "zhicha", score: 91, level: "\u9AD8", source: "\u5B9E\u65F6", status: "success" },
    { id: "R-011", time: "2026-08-11 10:44", custId: "CUST-100901", custName: "\u90D1\u723D", model: "zhixin", score: 612, level: "B", source: "API", status: "fail" },
    { id: "R-012", time: "2026-08-11 10:58", custId: "CUST-100902", custName: "\u51AF\u96EA", model: "zhirong", score: 668, level: "B", source: "\u5B9E\u65F6", status: "success" },
    { id: "R-013", time: "2026-08-10 14:09", custId: "CUST-100903", custName: "\u848B\u52C7", model: "zhicha", score: 55, level: "\u4E2D", source: "\u6279\u91CF", status: "success" },
    { id: "R-014", time: "2026-08-10 14:20", custId: "CUST-100904", custName: "\u97E9\u6885", model: "zhixin", score: 729, level: "A", source: "\u5B9E\u65F6", status: "success" },
    { id: "R-015", time: "2026-08-10 14:37", custId: "CUST-100905", custName: "\u66F9\u9896", model: "zhirong", score: 631, level: "B", source: "API", status: "success" },
    { id: "R-016", time: "2026-08-10 15:02", custId: "CUST-100906", custName: "\u9093\u8D85", model: "zhicha", score: 33, level: "\u4F4E", source: "\u5B9E\u65F6", status: "success" },
    { id: "R-017", time: "2026-08-10 15:19", custId: "CUST-100907", custName: "\u8BB8\u6674", model: "zhixin", score: 489, level: "D", source: "\u6279\u91CF", status: "fail" },
    { id: "R-018", time: "2026-08-10 15:33", custId: "CUST-100908", custName: "\u9AD8\u5CF0", model: "zhirong", score: 690, level: "A", source: "\u5B9E\u65F6", status: "success" },
    { id: "R-019", time: "2026-08-10 16:01", custId: "CUST-100909", custName: "\u6797\u6D9B", model: "zhicha", score: 74, level: "\u4E2D", source: "API", status: "success" },
    { id: "R-020", time: "2026-08-10 16:18", custId: "CUST-100910", custName: "\u9A6C\u8389", model: "zhixin", score: 701, level: "A", source: "\u5B9E\u65F6", status: "success" }
  ],
  crowds: [
    { id: "g-high", name: "\u9AD8\u4EF7\u503C\u5BA2\u6237", rule: "\u667A\u878D\u5206 \u5927\u4E8E 680", logic: "and", count: 0, conds: [{ field: "score.zhirong", op: "gt", value: "680" }] },
    { id: "g-active", name: "\u6D3B\u8DC3\u5BA2\u6237", rule: "\u8D37\u6B3E\u72B6\u6001 \u7B49\u4E8E \u5728\u8D37 \u4E14 \u989D\u5EA6\u4F7F\u7528\u7387 \u533A\u95F4 30~80", logic: "and", count: 0, conds: [{ field: "loanStatus", op: "eq", value: "\u5728\u8D37" }, { field: "utilization", op: "range", value: "30", rangeMax: "80" }] },
    { id: "g-lowval", name: "\u4F4E\u4EF7\u503C\u5BA2\u6237", rule: "\u667A\u878D\u5206 \u5C0F\u4E8E 600", logic: "and", count: 0, conds: [{ field: "score.zhirong", op: "lt", value: "600" }] },
    { id: "g-risk", name: "\u9AD8\u98CE\u9669\u5BA2\u6237", rule: "\u667A\u5BDF\u5206 \u5927\u4E8E 70", logic: "and", count: 0, conds: [{ field: "score.zhicha", op: "gt", value: "70" }] },
    { id: "g-watch", name: "\u89C2\u6D4B\u5BA2\u6237", rule: "\u667A\u4FE1\u5206 \u533A\u95F4 600~660", logic: "and", count: 0, conds: [{ field: "score.zhixin", op: "range", value: "600", rangeMax: "660" }] }
  ],
  dist: [
    { prod: "zhicha", labels: ["0-20", "21-40", "41-60", "61-80", "81-100"], data: [12, 28, 35, 18, 7] },
    { prod: "zhixin", labels: ["300-420", "421-540", "541-660", "661-780", "781-900"], data: [5, 14, 30, 34, 17] },
    { prod: "zhirong", labels: ["300-420", "421-540", "541-660", "661-780", "781-900"], data: [8, 18, 32, 29, 13] }
  ],
  hits: [
    { rule: "\u8FD130\u5929\u7533\u8D37\u5E73\u53F0\u6570\u22655", model: "zhicha", hits: 1842, rate: 11.3 },
    { rule: "\u8BBE\u5907\u6A21\u62DF\u5668\u7279\u5F81\u547D\u4E2D", model: "zhicha", hits: 1320, rate: 8.1 },
    { rule: "\u547D\u4E2D\u5916\u90E8\u9ED1\u7070\u540D\u5355", model: "zhicha", hits: 980, rate: 6 },
    { rule: "\u5386\u53F2 M3+ \u903E\u671F\u22652", model: "zhixin", hits: 760, rate: 4.7 },
    { rule: "\u8D1F\u503A\u6536\u5165\u6BD4\u226570%", model: "zhixin", hits: 1120, rate: 6.9 },
    { rule: "\u5F81\u4FE1\u6708\u67E5\u8BE2\u226510", model: "zhixin", hits: 640, rate: 3.9 },
    { rule: "\u8F6C\u5316\u610F\u613F\u4F4E\u4E14\u8D44\u4EA7\u7F3A\u5931", model: "zhirong", hits: 510, rate: 3.1 },
    { rule: "\u591A\u5934\u501F\u8D37\u5F3A\u5EA6\u9AD8", model: "zhirong", hits: 880, rate: 5.4 }
  ],
  funnel: [
    { label: "\u89E6\u53D1\u9884\u8B66", value: 18420 },
    { label: "\u89C4\u5219\u547D\u4E2D", value: 9630 },
    { label: "\u6838\u5B9E\u4E3A\u771F\u5B9E\u98CE\u9669", value: 5420 },
    { label: "\u53D1\u8D77\u5904\u7F6E", value: 4180 },
    { label: "\u5904\u7F6E\u95ED\u73AF", value: 3860 }
  ],
  ops: [
    {
      prod: "zhicha",
      coverage: 98.5,
      accuracy: 86.2,
      timely: 92,
      calls: 12480,
      psi: 0.11,
      psiStatus: "\u7A33\u5B9A",
      trend: [
        { month: "03\u6708", coverage: 97.8, accuracy: 85.1, timely: 90.4, calls: 10230 },
        { month: "04\u6708", coverage: 98, accuracy: 85.6, timely: 91, calls: 10980 },
        { month: "05\u6708", coverage: 98.2, accuracy: 85.9, timely: 91.5, calls: 11340 },
        { month: "06\u6708", coverage: 98.3, accuracy: 86, timely: 91.8, calls: 11920 },
        { month: "07\u6708", coverage: 98.4, accuracy: 86.1, timely: 91.9, calls: 12210 },
        { month: "08\u6708", coverage: 98.5, accuracy: 86.2, timely: 92, calls: 12480 }
      ]
    },
    {
      prod: "zhixin",
      coverage: 97.2,
      accuracy: 88.4,
      timely: 90.1,
      calls: 9820,
      psi: 0.24,
      psiStatus: "\u4E34\u754C",
      trend: [
        { month: "03\u6708", coverage: 96.4, accuracy: 87, timely: 88.6, calls: 8120 },
        { month: "04\u6708", coverage: 96.7, accuracy: 87.4, timely: 89, calls: 8560 },
        { month: "05\u6708", coverage: 96.9, accuracy: 87.9, timely: 89.5, calls: 8940 },
        { month: "06\u6708", coverage: 97, accuracy: 88.1, timely: 89.8, calls: 9410 },
        { month: "07\u6708", coverage: 97.1, accuracy: 88.3, timely: 90, calls: 9650 },
        { month: "08\u6708", coverage: 97.2, accuracy: 88.4, timely: 90.1, calls: 9820 }
      ]
    },
    {
      prod: "zhirong",
      coverage: 95.8,
      accuracy: 84,
      timely: 89.3,
      calls: 7610,
      psi: 0.31,
      psiStatus: "\u504F\u79FB",
      trend: [
        { month: "03\u6708", coverage: 94.5, accuracy: 82.1, timely: 87.2, calls: 6420 },
        { month: "04\u6708", coverage: 94.9, accuracy: 82.8, timely: 87.9, calls: 6780 },
        { month: "05\u6708", coverage: 95.2, accuracy: 83.2, timely: 88.4, calls: 7050 },
        { month: "06\u6708", coverage: 95.5, accuracy: 83.7, timely: 88.9, calls: 7340 },
        { month: "07\u6708", coverage: 95.7, accuracy: 83.9, timely: 89.1, calls: 7480 },
        { month: "08\u6708", coverage: 95.8, accuracy: 84, timely: 89.3, calls: 7610 }
      ]
    }
  ],
  thresholds: [
    { prod: "zhicha", range: "0-39", level: "\u4F4E\u98CE\u9669", meaning: "\u6B3A\u8BC8\u6982\u7387\u6781\u4F4E", action: "\u81EA\u52A8\u901A\u8FC7" },
    { prod: "zhicha", range: "40-69", level: "\u4E2D\u98CE\u9669", meaning: "\u5B58\u5728\u4E00\u5B9A\u6B3A\u8BC8\u7279\u5F81", action: "\u8F6C\u4EBA\u5DE5\u590D\u6838" },
    { prod: "zhicha", range: "70-100", level: "\u9AD8\u98CE\u9669", meaning: "\u5F3A\u6B3A\u8BC8\u7279\u5F81\u547D\u4E2D", action: "\u62D2\u7EDD / \u5F3A\u5316\u6838\u9A8C" },
    { prod: "zhixin", range: "300-540", level: "D", meaning: "\u8FDD\u7EA6\u6982\u7387\u9AD8", action: "\u62D2\u7EDD" },
    { prod: "zhixin", range: "541-660", level: "C", meaning: "\u8FDD\u7EA6\u6982\u7387\u504F\u9AD8", action: "\u5BA1\u614E\u6388\u4FE1" },
    { prod: "zhixin", range: "661-780", level: "B", meaning: "\u8FDD\u7EA6\u6982\u7387\u53EF\u63A7", action: "\u6807\u51C6\u989D\u5EA6" },
    { prod: "zhixin", range: "781-900", level: "A", meaning: "\u8FDD\u7EA6\u6982\u7387\u4F4E", action: "\u63D0\u989D + \u4F18\u5148\u7ECF\u8425" },
    { prod: "zhirong", range: "350-499", level: "D", meaning: "\u7EFC\u5408\u4EF7\u503C\u4F4E\u4E14\u9AD8\u98CE\u9669", action: "\u62D2\u7EDD\u6216\u4EC5\u8425\u9500\u4F4E\u98CE\u9669\u4EA7\u54C1" },
    { prod: "zhirong", range: "500-649", level: "C", meaning: "\u7EFC\u5408\u4EF7\u503C\u4E00\u822C", action: "\u6807\u51C6\u7B56\u7565" },
    { prod: "zhirong", range: "650-799", level: "B", meaning: "\u4EF7\u503C\u4E0E\u98CE\u9669\u5747\u8861", action: "\u5E38\u89C4\u7ECF\u8425" },
    { prod: "zhirong", range: "800-950", level: "A", meaning: "\u9AD8\u4EF7\u503C\u4F4E\u98CE\u9669\u7684\u4F18\u8D28\u5BA2\u6237", action: "\u63D0\u989D + \u4F18\u5148\u7ECF\u8425" }
  ],
  alertRules: [
    { id: "AR-1", name: "\u667A\u5BDF\u5206\u9608\u503C\u9884\u8B66", cond: "\u667A\u5BDF\u5206 \u2265 70", threshold: 70, level: "\u9AD8", enabled: true },
    { id: "AR-2", name: "\u667A\u4FE1\u5206\u9608\u503C\u9884\u8B66", cond: "\u667A\u4FE1\u5206 \u2264 540", threshold: 540, level: "\u9AD8", enabled: true },
    { id: "AR-3", name: "\u667A\u878D\u5206\u9608\u503C\u9884\u8B66", cond: "\u667A\u878D\u5206 \u2264 540", threshold: 540, level: "\u4E2D", enabled: true },
    { id: "AR-4", name: "\u591A\u5934\u501F\u8D37\u89C4\u5219\u547D\u4E2D", cond: "\u547D\u4E2D\u300C\u8FD130\u5929\u7533\u8D37\u5E73\u53F0\u6570\u22655\u300D", threshold: 5, level: "\u4E2D", enabled: true },
    { id: "AR-5", name: "\u9ED1\u7070\u540D\u5355\u547D\u4E2D", cond: "\u547D\u4E2D\u5916\u90E8\u9ED1\u7070\u540D\u5355", threshold: 1, level: "\u9AD8", enabled: false },
    { id: "AR-6", name: "PSI \u504F\u79FB\u9884\u8B66", cond: "\u6A21\u578B PSI \u2265 0.25", threshold: 0.25, level: "\u4E2D", enabled: true }
  ],
  callTrend: [
    { month: "03\u6708", zhicha: 9200, zhixin: 7600, zhirong: 5400 },
    { month: "04\u6708", zhicha: 9800, zhixin: 8100, zhirong: 5900 },
    { month: "05\u6708", zhicha: 10400, zhixin: 8600, zhirong: 6300 },
    { month: "06\u6708", zhicha: 11200, zhixin: 9100, zhirong: 6900 },
    { month: "07\u6708", zhicha: 11800, zhixin: 9500, zhirong: 7200 },
    { month: "08\u6708", zhicha: 12480, zhixin: 9820, zhirong: 7610 }
  ],
  riskRate: 6.8,
  monthlyCount: 29910
};
var FILE = "scoreData.json";
var data = JSON.parse(JSON.stringify(SEED_SCORE));
var version = 0;
var saveStatus = null;
var listeners = /* @__PURE__ */ new Set();
var statusListeners = /* @__PURE__ */ new Set();
function emit() {
  version++;
  listeners.forEach((fn) => fn());
}
function emitStatus() {
  statusListeners.forEach((fn) => fn());
}
async function loadOne(file) {
  try {
    const r = await fetch(`/api/load-mid?file=${encodeURIComponent(file)}`);
    if (r.ok) return await r.json();
    return null;
  } catch {
    return null;
  }
}
function saveOne(file, body) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then((r) => {
    saveStatus = r.ok ? "ok" : "error";
    emitStatus();
  }).catch(() => {
    saveStatus = "error";
    emitStatus();
  });
}
async function bootstrap() {
  const saved = await loadOne(FILE);
  const hasNewShape = saved && typeof saved === "object" && Array.isArray(saved.models) && saved.models.every((m) => "algoCode" in m && Array.isArray(m.versions));
  if (hasNewShape) {
    data = saved;
  } else {
    data = JSON.parse(JSON.stringify(SEED_SCORE));
    saveOne(FILE, data);
  }
  emit();
}
void bootstrap();
function useSnap(sel) {
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => version
  );
  return sel();
}
function useScore() {
  return useSnap(() => data);
}
function updateScore(fn) {
  data = fn(data);
  emit();
  saveOne(FILE, data);
}

// src/components/ui.tsx
import { useState as useState3, useRef as useRef3, useEffect as useEffect3, useLayoutEffect as useLayoutEffect3 } from "react";
import { createPortal } from "react-dom";

// src/console/sourceTagConfig.ts
import { useSyncExternalStore as useSyncExternalStore2 } from "react";
var showSourceTags = true;
var listeners2 = /* @__PURE__ */ new Set();
function emit2() {
  listeners2.forEach((l) => l());
}
function loadFromDisk() {
  fetch("/api/load-source-tag").then((r) => r.ok ? r.json() : null).then((data2) => {
    if (data2 && typeof data2.showSourceTags === "boolean") {
      if (data2.showSourceTags !== showSourceTags) {
        showSourceTags = data2.showSourceTags;
        emit2();
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
  listeners2.add(cb);
  return () => {
    listeners2.delete(cb);
  };
}
function useShowSourceTags() {
  return useSyncExternalStore2(subscribe, getShowSourceTags, getShowSourceTags);
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

// src/components/charts.tsx
import { useState as useState4, useRef as useRef4, useEffect as useEffect4 } from "react";
import { Fragment as Fragment5, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function useContainerWidth(fallback = 640) {
  const ref = useRef4(null);
  const [w, setW] = useState4(fallback);
  useEffect4(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const cw = el.clientWidth;
      if (cw > 0) setW(Math.floor(cw));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}
function LineChart({
  labels,
  series,
  height = 240,
  width,
  yMax,
  yMin = 0,
  unit = ""
}) {
  const [wrapRef, measured] = useContainerWidth(640);
  const W = width ?? measured;
  const H = height;
  const padL = 46;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = yMax ?? Math.max(yMin, ...series.flatMap((s) => s.data));
  const min = Math.min(yMin, ...series.flatMap((s) => s.data));
  const x = (i) => padL + (labels.length <= 1 ? plotW / 2 : i / (labels.length - 1) * plotW);
  const y = (v) => padT + plotH - (v - min) / (max - min || 1) * plotH;
  const grid = 4;
  const [hover, setHover] = useState4(null);
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = rect.width / W;
    const px = e.clientX - rect.left;
    const idx = Math.round((px / ratio - padL) / plotW * (labels.length - 1));
    setHover(idx >= 0 && idx < labels.length ? idx : null);
  };
  return /* @__PURE__ */ jsxs4("div", { ref: wrapRef, children: [
    /* @__PURE__ */ jsxs4("svg", { viewBox: `0 0 ${W} ${H}`, style: { height, width: width ?? "100%" }, onMouseMove: onMove, onMouseLeave: () => setHover(null), children: [
      Array.from({ length: grid + 1 }).map((_, i) => {
        const gy = padT + i / grid * plotH;
        const val = max - i / grid * (max - min);
        return /* @__PURE__ */ jsxs4("g", { children: [
          /* @__PURE__ */ jsx4("line", { x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: "#eef2f7", strokeWidth: 1 }),
          /* @__PURE__ */ jsxs4("text", { x: padL - 8, y: gy + 4, textAnchor: "end", className: "fill-slate-400", fontSize: 11, children: [
            Math.round(val),
            unit
          ] })
        ] }, i);
      }),
      labels.map((lb, i) => /* @__PURE__ */ jsx4("text", { x: x(i), y: H - 10, textAnchor: "middle", className: "fill-slate-400", fontSize: 11, children: lb }, lb)),
      series.map((s) => /* @__PURE__ */ jsx4(
        "polyline",
        {
          points: s.data.map((v, i) => `${x(i)},${y(v)}`).join(" "),
          fill: "none",
          stroke: s.color,
          strokeWidth: 2.5,
          strokeLinejoin: "round",
          strokeLinecap: "round"
        },
        s.name
      )),
      series.map(
        (s) => s.data.map((v, i) => /* @__PURE__ */ jsx4(
          "circle",
          {
            cx: x(i),
            cy: y(v),
            r: hover === i ? 5 : 3,
            fill: s.color,
            stroke: hover === i ? "#fff" : "none",
            strokeWidth: 2,
            style: { cursor: "crosshair", transition: "r .12s" },
            children: /* @__PURE__ */ jsx4("title", { children: `${labels[i]} \xB7 ${s.name}: ${v}${unit}` })
          },
          `${s.name}-${i}`
        ))
      ),
      hover != null && /* @__PURE__ */ jsxs4("g", { pointerEvents: "none", children: [
        /* @__PURE__ */ jsx4("line", { x1: x(hover), y1: padT, x2: x(hover), y2: padT + plotH, stroke: "#CBD5E1", strokeDasharray: "4 3", strokeWidth: 1 }),
        series.map((s) => {
          const v = s.data[hover] ?? 0;
          return /* @__PURE__ */ jsxs4("g", { children: [
            /* @__PURE__ */ jsx4("rect", { x: x(hover) - 34, y: Math.min(y(v) - 26, padT), width: 68, height: 20, rx: 6, fill: "#0F172A", opacity: 0.85 }),
            /* @__PURE__ */ jsxs4("text", { x: x(hover), y: Math.min(y(v) - 12, padT + 13), textAnchor: "middle", fontSize: 11, fontWeight: 600, fill: "#fff", children: [
              v,
              unit
            ] })
          ] }, s.name);
        }),
        /* @__PURE__ */ jsx4("text", { x: x(hover), y: H - 24, textAnchor: "middle", fontSize: 10, fill: "#64748B", children: labels[hover] })
      ] })
    ] }),
    /* @__PURE__ */ jsx4("div", { className: "mt-2 flex flex-wrap gap-4", children: series.map((s) => /* @__PURE__ */ jsxs4("span", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
      /* @__PURE__ */ jsx4("span", { className: "h-2.5 w-2.5 rounded-full", style: { background: s.color } }),
      s.name
    ] }, s.name)) })
  ] });
}

// src/console/ModelDecisionGraph.tsx
import { useState as useState5, useRef as useRef5, useEffect as useEffect5, useMemo as useMemo3 } from "react";

// src/console/modelGraphData.ts
var NODE_W = 212;
var NODE_H = 116;
var GNODE_META = {
  source: { label: "\u6570\u636E\u6E90", color: "#0EA5E9" },
  transform: { label: "\u7279\u5F81\u53D8\u6362", color: "#8B5CF6" },
  model: { label: "\u6A21\u578B / \u5B50\u5206", color: "#334155" },
  ruleset: { label: "\u89C4\u5219\u96C6", color: "#F59E0B" },
  collision: { label: "\u89C4\u5219\u78B0\u649E \xB7 \u51B2\u7A81\u88C1\u51B3", color: "#E11D48" },
  decision: { label: "\u9608\u503C\u51B3\u7B56", color: "#475569" },
  output: { label: "\u8BC4\u5206\u8F93\u51FA", color: "#16A34A" },
  graph: { label: "\u56FE\u8C31\u8BA1\u7B97", color: "#0D9488" },
  block: { label: "\u5F3A\u62E6\u622A", color: "#B91C1C" },
  alert: { label: "\u5E76\u884C\u9884\u8B66\u652F\u7EBF", color: "#0891B2" }
};
var MODEL_DECISION_GRAPH = {
  /* ============ 智察分（反欺诈：XGBoost + 黑灰名单硬拦截 + 设备行为规则） ============ */
  zhicha: {
    width: 1250,
    height: 640,
    nodes: [
      { id: "s1", type: "source", title: "\u767E\u884C\u591A\u5934\u501F\u8D37\u67E5\u8BE2", subtitle: "\u6807\u51C6\u5316\u8F93\u5165", meta: ["\u8FD130\u5929\u7533\u8D37\u5E73\u53F0\u6570"], x: 24, y: 36 },
      { id: "s2", type: "source", title: "\u8BBE\u5907\u6307\u7EB9\u5E93", subtitle: "\u6807\u51C6\u5316\u8F93\u5165", meta: ["\u8BBE\u5907\u73AF\u5883\u98CE\u9669"], x: 24, y: 168 },
      { id: "s3", type: "source", title: "\u5185\u90E8\u9ED1\u7070\u540D\u5355", subtitle: "\u786C\u62E6\u622A\u6E90", meta: ["\u547D\u4E2D\u9ED1\u7070\u540D\u5355"], x: 24, y: 300 },
      { id: "s4", type: "source", title: "\u592E\u884C\u5F81\u4FE1 \xB7 \u8D1F\u503A", subtitle: "\u6807\u51C6\u5316\u8F93\u5165", meta: ["\u8D1F\u503A\u6536\u5165\u6BD4"], x: 24, y: 432 },
      { id: "t1", type: "transform", title: "\u7279\u5F81\u5DE5\u7A0B \xB7 \u6807\u51C6\u5316", subtitle: "\u7F3A\u5931\u503C / \u7F16\u7801 / \u5F52\u4E00", x: 276, y: 234, meta: ["5 \u7EF4\u7279\u5F81 \u2192 \u6A21\u578B\u8F93\u5165"] },
      {
        id: "m1",
        type: "model",
        title: "XGBoost \u53CD\u6B3A\u8BC8\u6A21\u578B",
        subtitle: "\u68AF\u5EA6\u63D0\u5347\u6811",
        badge: "5 \u56E0\u5B50",
        x: 516,
        y: 96,
        meta: ["\u8FD130\u5929\u7533\u8D37\u5E73\u53F0\u6570 0.28", "\u8BBE\u5907\u73AF\u5883\u98CE\u9669 0.22", "\u547D\u4E2D\u9ED1\u7070\u540D\u5355 0.20", "\u540C\u8BBE\u5907\u5173\u8054\u8D26\u53F7 0.18", "\u8D1F\u503A\u6536\u5165\u6BD4 0.12"]
      },
      {
        id: "r1",
        type: "ruleset",
        title: "\u4E3B\u7EBF\u98CE\u9669\u89C4\u5219\u4FEE\u6B63\u5F15\u64CE",
        subtitle: "score_adjust_rule \xB7 4 \u6761",
        badge: "4 \u89C4\u5219",
        x: 516,
        y: 336,
        meta: ["Rule-001: \u540C\u8BBE\u5907\u77ED\u671F\u591A\u6B21\u7533\u8BF7 \u2192 +12", "Rule-002: \u7533\u8BF7IP\u98CE\u9669\u753B\u50CF \u2192 +10", "Rule-003: \u7D27\u6025\u8054\u7CFB\u4EBA\u547D\u4E2D\u98CE\u9669\u540D\u5355 \u2192 +15", "Rule-004: \u624B\u673A\u53F7\u5165\u7F51<3\u6708 \u2192 +8", "final = min(base+adjust, 100)"]
      },
      {
        id: "r2",
        type: "ruleset",
        title: "\u8BBE\u5907\u884C\u4E3A\u89C4\u5219\u96C6",
        subtitle: "\u98CE\u9669\u52A0\u6743",
        badge: "2 \u89C4\u5219",
        x: 516,
        y: 472,
        meta: ["\u8BBE\u5907\u6A21\u62DF\u5668\u7279\u5F81\u547D\u4E2D", "\u8FD130\u5929\u7533\u8D37\u5E73\u53F0\u6570\u22655"]
      },
      {
        id: "c1",
        type: "collision",
        title: "\u89C4\u5219\u78B0\u649E \xB7 \u51B2\u7A81\u88C1\u51B3",
        subtitle: "\u9010\u6761\u89C4\u5219 \xB7 \u6EE1\u8DB3\u6761\u4EF6\u5373\u89E6\u53D1",
        badge: "3 \u6761\u89C4\u5219",
        x: 776,
        y: 250,
        meta: ["\u3010za-1\u3011\u9ED1\u7070\u540D\u5355\u547D\u4E2D \u2192 \u5F3A\u5236\u62D2\u7EDD\uFF08\u8986\u76D6\u5206\u6570\uFF09", "\u3010za-2\u3011XGB\u4E2D\u98CE\u9669(40-69)\u2229\u8BBE\u5907\u6A21\u62DF\u5668\u547D\u4E2D \u2192 \u5347\u7EA7\u9AD8\u98CE\u9669\u9884\u8B66", "\u3010za-3\u3011\u7ED3\u679C\u51B2\u7A81 \u2192 \u751F\u6210\u300C\u6B3A\u8BC8\u8986\u76D6\u300D\u9884\u8B66", "\u53EF\u80FD\u88C1\u51B3\u7C7B\u578B\uFF1A\u62E6\u622A\u4F18\u5148 / \u5206\u6570\u4F18\u5148 / \u8F6C\u4EBA\u5DE5"]
      },
      {
        id: "d1",
        type: "decision",
        title: "\u9608\u503C\u51B3\u7B56",
        subtitle: "\u4E09\u6BB5\u5206\u7EA7",
        badge: "3 \u6863",
        x: 1004,
        y: 200,
        meta: ["0-39 \u81EA\u52A8\u901A\u8FC7", "40-69 \u8F6C\u4EBA\u5DE5\u590D\u6838", "70-100 \u62D2\u7EDD / \u5F3A\u5316\u6838\u9A8C"]
      },
      { id: "o1", type: "output", title: "\u667A\u5BDF\u5206\u8F93\u51FA", subtitle: "0 \u2013 100", badge: "0-100", x: 1004, y: 392, meta: ["\u6700\u7EC8\u8F93\u51FA\uFF1A0\u2013100 \u5206\uFF0C\u4E09\u6BB5\u6388\u4FE1\u51B3\u7B56\uFF08\u89C1\u9608\u503C\u51B3\u7B56\uFF09"] }
    ],
    edges: [
      { from: "s1", to: "t1" },
      { from: "s2", to: "t1" },
      { from: "s4", to: "t1" },
      { from: "s3", to: "r1" },
      { from: "t1", to: "m1" },
      { from: "m1", to: "c1" },
      { from: "r1", to: "c1" },
      { from: "r2", to: "c1" },
      { from: "c1", to: "d1" },
      { from: "d1", to: "o1" }
    ]
  },
  /* 智信分标准模型已移除（用户要求）：现以「授信流水线 V1.0」为准，见下方 PIPELINE_GRAPHS.zhixin_credit_v1 */
  /* ============ 智融分（综合：违约维度+兴趣+转化+资产 加权融合 + 跨模型碰撞） ============ */
  zhirong: {
    width: 1280,
    height: 800,
    nodes: [
      { id: "s1", type: "source", title: "\u667A\u4FE1\u5206\u8F93\u51FA\uFF08\u4FE1\u7528\u5B50\u5206\uFF09", subtitle: "\u8FDD\u7EA6\u7EF4\u5EA6", meta: ["\u4FE1\u7528\u5206\uFF08\u5B50\u5206\u8F93\u5165\uFF09"], x: 24, y: 60 },
      { id: "s2", type: "source", title: "App \u884C\u4E3A\u65F6\u5E8F", subtitle: "\u5174\u8DA3\u7EF4\u5EA6", meta: ["\u8FD130\u5929\u6D3B\u8DC3\u5929\u6570"], x: 24, y: 192 },
      { id: "s3", type: "source", title: "\u8425\u9500\u6D3B\u52A8\u54CD\u5E94", subtitle: "\u8F6C\u5316\u7EF4\u5EA6", meta: ["\u6D3B\u52A8\u54CD\u5E94\u6B21\u6570"], x: 24, y: 324 },
      { id: "s4", type: "source", title: "\u8D44\u4EA7 / \u7406\u8D22\u6301\u4ED3", subtitle: "\u8D44\u4EA7\u7EF4\u5EA6", meta: ["\u8D44\u4EA7\u7C7B\u522B / \u7406\u8D22\u6301\u4ED3"], x: 24, y: 456 },
      { id: "s5", type: "source", title: "\u667A\u5BDF\u5206\u8F93\u51FA\uFF08\u6B3A\u8BC8\u5B50\u5206\uFF09", subtitle: "\u8DE8\u6A21\u578B\u8F93\u5165", meta: ["\u6B3A\u8BC8\u5B50\u5206\uFF080-100\uFF09"], x: 24, y: 600 },
      { id: "m1", type: "model", title: "\u8FDD\u7EA6\u7EF4\u5EA6 \xB7 \u667A\u4FE1\u5206", subtitle: "\u6743\u91CD 0.34", x: 280, y: 60, meta: ["\u4FE1\u7528\u5206\u5F52\u4E00\u5316 \xD7 0.34"] },
      {
        id: "m2",
        type: "model",
        title: "\u5174\u8DA3 / \u8F6C\u5316 / \u8D44\u4EA7",
        subtitle: "\u6743\u91CD 0.24/0.18/0.24",
        x: 280,
        y: 300,
        meta: ["\u501F\u8D37\u5174\u8DA3 0.24", "\u8F6C\u5316\u610F\u613F 0.18", "\u8D44\u4EA7\u72B6\u51B5 0.24"]
      },
      {
        id: "f1",
        type: "model",
        title: "\u52A0\u6743\u878D\u5408",
        subtitle: "\u591A\u6A21\u578B\u96C6\u6210",
        badge: "\u878D\u5408",
        x: 540,
        y: 176,
        meta: ["0.34\xD7\u667A\u4FE1 + 0.24\xD7\u5174\u8DA3", "+ 0.18\xD7\u8F6C\u5316 + 0.24\xD7\u8D44\u4EA7", "\u2192 \u6620\u5C04 300-900"]
      },
      {
        id: "r1",
        type: "ruleset",
        title: "\u4E3B\u7EBF\u4FE1\u7528\u89C4\u5219\u4FEE\u6B63\u5F15\u64CE",
        subtitle: "score_adjust_rule \xB7 6 \u6761",
        badge: "6 \u89C4\u5219",
        x: 540,
        y: 432,
        meta: ["Rule-001: \u5F53\u524D\u903E\u671F \u2192 \u221260", "Rule-002: \u8FD124\u6708\u903E\u671F\u22653 \u2192 \u221240", "Rule-003: \u6388\u4FE1\u4F7F\u7528\u7387>85% \u2192 \u221235", "Rule-004: \u8D1F\u503A\u6536\u5165\u6BD4>0.8 \u2192 \u221230", "Rule-005: \u5F81\u4FE1\u67E5\u8BE2>12 \u2192 \u221225", "Rule-006: \u5F81\u4FE1\u4F18\u8D28\u8D1F\u503A\u5065\u5EB7 \u2192 +20", "final = clip(base+adjust, 350-950)"]
      },
      {
        id: "c1",
        type: "collision",
        title: "\u89C4\u5219\u78B0\u649E \xB7 \u51B2\u7A81\u88C1\u51B3",
        subtitle: "\u9010\u6761\u89C4\u5219 \xB7 \u6EE1\u8DB3\u6761\u4EF6\u5373\u89E6\u53D1",
        badge: "2 \u6761\u89C4\u5219",
        x: 800,
        y: 268,
        meta: ["\u3010zr-1\u3011\u667A\u5BDF(\u6B3A\u8BC8\u9AD8\u98CE\u9669) \u2229 \u667A\u878D(\u9AD8\u4EF7\u503C) \u2192 \u6B3A\u8BC8\u4F18\u5148\u62D2\u7EDD", "\u3010zr-2\u3011\u5174\u8DA3 \u2229 \u8D44\u4EA7 \u51B2\u7A81 \u2192 \u53D6\u4FDD\u5B88\u7B56\u7565", "\u53EF\u80FD\u88C1\u51B3\u7C7B\u578B\uFF1A\u62E6\u622A\u4F18\u5148 / \u5206\u6570\u4F18\u5148 / \u8F6C\u4EBA\u5DE5"]
      },
      {
        id: "d1",
        type: "decision",
        title: "\u9608\u503C\u51B3\u7B56",
        subtitle: "\u56DB\u6BB5\u5206\u7EA7",
        badge: "4 \u6863",
        x: 1028,
        y: 236,
        meta: ["300-540 \u62D2\u7EDD / \u8425\u9500\u4F4E\u9669", "541-660 \u6807\u51C6\u7B56\u7565", "661-780 \u5E38\u89C4\u7ECF\u8425", "781-900 \u63D0\u989D + \u4F18\u5148\u7ECF\u8425"]
      },
      { id: "o1", type: "output", title: "\u667A\u878D\u5206\u8F93\u51FA", subtitle: "300 \u2013 900", badge: "300-900", x: 1028, y: 428, meta: ["\u6700\u7EC8\u8F93\u51FA\uFF1A300\u2013900 \u5206\uFF0C\u56DB\u6863\u7ECF\u8425\u7B56\u7565\uFF08\u89C1\u9608\u503C\u51B3\u7B56\uFF09"] }
    ],
    edges: [
      { from: "s1", to: "m1" },
      { from: "s2", to: "m2" },
      { from: "s3", to: "m2" },
      { from: "s4", to: "m2" },
      { from: "s5", to: "c1", dashed: true },
      { from: "m1", to: "f1" },
      { from: "m2", to: "f1" },
      { from: "f1", to: "c1" },
      { from: "r1", to: "c1" },
      { from: "c1", to: "d1" },
      { from: "d1", to: "o1" }
    ]
  }
};
var PIPELINE_GRAPHS = {
  zhixin_credit_v1: {
    width: 1460,
    height: 720,
    nodes: [
      {
        id: "s1",
        type: "source",
        title: "\u8FDB\u4EF6 & \u5F81\u4FE1\u539F\u59CB\u5B57\u6BB5",
        subtitle: "13 \u4E2A\u6807\u51C6\u5316\u91C7\u96C6\u5B57\u6BB5",
        badge: "13 \u5B57\u6BB5",
        x: 24,
        y: 180,
        meta: ["\u5BA2\u6237\u59D3\u540D / \u8EAB\u4EFD\u8BC1\u53F7 / \u624B\u673A\u53F7", "\u624B\u673A\u53F7\u5165\u7F51\u65E5\u671F", "\u8FD124\u6708\u903E\u671F\u6B21\u6570 overdue_24m_cnt", "\u4FE1\u7528\u5361\u603B\u989D\u5EA6 / \u5DF2\u7528\u989D\u5EA6", "\u5B9A\u5411\u8D37\u6B3E\u4F59\u989D / \u603B\u4FE1\u8D37\u4F59\u989D", "\u6708\u7A0E\u540E\u6536\u5165 / \u6708\u4FE1\u8D37\u6708\u4F9B", "\u8FD16\u6708\u786C\u67E5\u8BE2\u6B21\u6570 query_hard_6m", "\u662F\u5426\u5931\u4FE1\u88AB\u6267\u884C\u4EBA is_dishonest"]
      },
      {
        id: "g1",
        type: "graph",
        title: "\u5173\u8054\u56FE\u8C31\u8BA1\u7B97\u8282\u70B9",
        subtitle: "graph_mining \xB7 \u793E\u7FA4\u53D1\u73B0",
        badge: "\u56FE\u8BA1\u7B97",
        x: 264,
        y: 40,
        meta: ["\u8F93\u5165: \u8EAB\u4EFD\u8BC1\u53F7, \u624B\u673A\u53F7", "\u7B97\u6CD5: \u8FDE\u901A\u5B50\u56FE\u793E\u7FA4\u53D1\u73B0", "\u8F93\u51FA: \u56E2\u4F19\u6B3A\u8BC8\u5173\u8054\u6807\u8BB0 group_fraud_tag", "0 = \u5426 / 1 = \u662F\uFF08\u5B9E\u65F6\u8BA1\u7B97\uFF0C\u975E\u8FDB\u4EF6\u5B57\u6BB5\uFF09"]
      },
      {
        id: "f1",
        type: "transform",
        title: "\u7279\u5F81\u5DE5\u7A0B\u8282\u70B9",
        subtitle: "feature_transform \xB7 \u884D\u751F\u6307\u6807",
        badge: "\u884D\u751F",
        x: 264,
        y: 300,
        meta: ["\u7F3A\u5931\u503C\u586B\u5145 / \u5355\u4F4D\u5F52\u4E00\u5316", "util_ratio = \u5DF2\u7528\u989D\u5EA6 / \u603B\u989D\u5EA6", "dir_ratio = \u5B9A\u5411\u4F59\u989D / \u603B\u4F59\u989D", "dti_ratio = \u6708\u4F9B / \u6708\u6536\u5165", "mobile_age = \u5F53\u524D\u6708 \u2212 \u5165\u7F51\u6708", "query_6m = \u8FD16\u6708\u786C\u67E5\u8BE2(\u900F\u4F20)"]
      },
      {
        id: "b1",
        type: "block",
        title: "Block \u524D\u7F6E\u5F3A\u62E6\u622A",
        subtitle: "rule_filter \xB7 \u53EF\u7EC8\u6B62",
        badge: "\u53EF\u7EC8\u6B62",
        x: 504,
        y: 300,
        meta: ["\u4EC5 1 \u6761\u751F\u6548\u89C4\u5219\uFF08\u8FDE\u7EED\u7F16\u53F7\uFF0C\u65E0\u9884\u7559\u7A7AID\uFF09", "Block-001: \u662F\u5426\u5931\u4FE1\u88AB\u6267\u884C\u4EBA = \u662F", "\u2192 \u6D41\u6C34\u7EBF\u7EC8\u6B62 \xB7 \u76F4\u63A5\u62D2\u7EDD\u6388\u4FE1", "\u547D\u4E2D\u5219\u62E6\u622A\uFF0C\u4E0D\u8FDB\u5165\u8BC4\u5206"]
      },
      {
        id: "m1",
        type: "model",
        title: "\u903B\u8F91\u56DE\u5F52\u667A\u4FE1\u5206\u6A21\u578B",
        subtitle: "logistic_regression_scorecard",
        badge: "\u8BC4\u5206\u5361",
        x: 504,
        y: 40,
        meta: ["BaseScore=600 \xB7 Odds\u2080=1:19 \xB7 PDO=50", "\u8F93\u5165: util / dir / dti / mobile_age / query_6m / overdue", "\u8F93\u51FA: base_score\uFF08\u521D\u59CB\u667A\u4FE1\u5206\uFF09", "\u7CFB\u6570\u7531\u8BAD\u7EC3\u62DF\u5408\uFF08\u03B2\xB7WOE\uFF09\uFF0C\u975E\u4E1A\u52A1\u62CD\u7ED9"]
      },
      {
        id: "r1",
        type: "ruleset",
        title: "\u4E3B\u7EBF Rule \u6263\u5206\u5F15\u64CE",
        subtitle: "rule_calculate \xB7 4 \u6761",
        badge: "4 \u89C4\u5219",
        x: 744,
        y: 40,
        meta: ["Rule-001: dir_ratio > 70% \u2192 \u221250", "Rule-002: dti_ratio > 80% \u2192 \u221250", "Rule-003: query_6m > 15 \u2192 \u221250", "Rule-004: util_ratio > 70% \u2192 \u221250", "final_score = base_score \u2212 total_deduct\uFF08\u9010\u6761\u5224\u5B9A\xB7\u7D2F\u52A0\uFF09"]
      },
      {
        id: "w1",
        type: "ruleset",
        title: "\u4E3B\u7EBF\u884D\u751F\u9884\u8B66\u5224\u5B9A",
        subtitle: "condition_judge",
        badge: "\u4E3B\u7EBF\u9884\u8B66",
        x: 744,
        y: 300,
        meta: ["\u8F93\u5165: \u547D\u4E2D\u4E3B\u7EBFRule\u6570\u91CF hit_rule_cnt", "hit_rule_cnt \u2265 3 \u2192 \u4E3B\u7EBF\u884D\u751F-\u4E8C\u7EA7\u9AD8\u98CE\u9669\u9884\u8B66", "\u5426\u5219 main_alert_tag = \u7A7A", "\u8F93\u51FA: main_alert_tag"]
      },
      {
        id: "k1",
        type: "decision",
        title: "\u5BA1\u6279\u7ED3\u8BBA\u51B3\u7B56",
        subtitle: "approval_decision \xB7 \u5168\u679A\u4E3E",
        badge: "\u5BA1\u6279\u7ED3\u8BBA",
        x: 984,
        y: 180,
        meta: [
          "\u8F93\u5165: final_score / main_alert_tag / parallel_alert_list / block_result",
          "\u2460 block_result=\u62E6\u622A(\u5931\u4FE1) \u2192 \u76F4\u63A5\u62D2\u7EDD(\u6D41\u6C34\u7EBF\u5DF2\u7EC8\u6B62)",
          "\u2461 \u5E76\u884C L1 \u4E00\u7EA7\u7D27\u6025(\u56E2\u4F19\u6B3A\u8BC8) \u2192 \u76F4\u63A5\u62D2\u7EDD",
          "\u2462 \u4E3B\u7EBF\u4E8C\u7EA7\u9AD8\u98CE\u9669(\u547D\u4E2D\u22653) \u2192 \u4EBA\u5DE5\u590D\u6838",
          "\u2463 \u5E76\u884C L3 \u4E09\u7EA7\u5173\u6CE8(\u65B0\u53F7<6\u6708) \u2192 \u4EBA\u5DE5\u590D\u6838",
          "\u2464 \u5176\u4F59\u65E0\u9884\u8B66 \u2192 \u81EA\u52A8\u901A\u884C",
          "\u8F93\u51FA: pipeline_result(\u901A\u884C/\u590D\u6838/\u62D2\u7EDD)"
        ]
      },
      {
        id: "a1",
        type: "alert",
        title: "\u652F\u7EBF Alert \u72EC\u7ACB\u9884\u8B66\u5F15\u64CE",
        subtitle: "parallel_alert \xB7 \u5E76\u884C",
        badge: "\u5E76\u884C\u652F\u7EBF",
        x: 504,
        y: 560,
        meta: ["\u4E0E\u8BC4\u5206\u5361\u540C\u6B65\u6267\u884C \xB7 \u4E0D\u963B\u585E\u4E3B\u7EBF", "\u4E0D\u4FEE\u6539\u667A\u4FE1\u5206 \xB7 \u4EC5\u98CE\u9669\u63D0\u793A", "Alert-L1-001: \u56E2\u4F19\u6B3A\u8BC8\u6807\u8BB0=1 \u2192 \u4E00\u7EA7\u7D27\u6025", "Alert-L3-001: mobile_age<6 \u2192 \u4E09\u7EA7\u5173\u6CE8", "L2/L4 \u6846\u67B6\u9884\u7559 \xB7 \u5F53\u524D\u65E0\u751F\u6548\u89C4\u5219"]
      },
      {
        id: "o1",
        type: "output",
        title: "\u6D41\u6C34\u7EBF\u6700\u7EC8\u8F93\u51FA",
        subtitle: "final_output",
        badge: "\u8F93\u51FA",
        x: 1224,
        y: 180,
        meta: ["final_score \u6700\u7EC8\u667A\u4FE1\u5206", "main_alert_tag \u4E3B\u7EBF\u884D\u751F\u9884\u8B66", "parallel_alert_list \u652F\u7EBF\u5E76\u884C\u9884\u8B66\u6570\u7EC4", "pipeline_result \u5BA1\u6279\u7ED3\u8BBA(\u7531\u300C\u5BA1\u6279\u7ED3\u8BBA\u51B3\u7B56\u300D\u8282\u70B9\u8BA1\u7B97)"]
      }
    ],
    edges: [
      { from: "s1", to: "g1" },
      { from: "s1", to: "f1" },
      { from: "g1", to: "f1" },
      { from: "f1", to: "b1" },
      { from: "b1", to: "m1" },
      { from: "m1", to: "r1" },
      { from: "r1", to: "w1" },
      { from: "w1", to: "k1" },
      { from: "a1", to: "k1", dashed: true, color: "#0891B2" },
      { from: "k1", to: "o1" },
      { from: "f1", to: "a1", dashed: true, color: "#0891B2" },
      { from: "g1", to: "a1", dashed: true, color: "#0891B2" }
    ]
  }
};

// src/console/ModelDecisionGraph.tsx
import { Fragment as Fragment6, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var NODE_CATEGORY = [
  { label: "\u8F93\u5165\u5C42", types: ["source", "transform"] },
  { label: "\u8BA1\u7B97\u5C42", types: ["model", "graph", "ruleset"] },
  { label: "\u51B3\u7B56\u5C42", types: ["collision", "decision", "block"] },
  { label: "\u8F93\u51FA\u5C42", types: ["output", "alert"] }
];
function ScoreCardView({ bins }) {
  return /* @__PURE__ */ jsxs5("div", { className: "text-[11px] leading-tight", children: [
    /* @__PURE__ */ jsx5("div", { className: "mb-1 font-semibold text-slate-700", children: "\u57FA\u7840\u5206 600 + \u5404\u56E0\u5B50\u67E5\u8868\u52A0\u5206" }),
    bins.map((f) => /* @__PURE__ */ jsxs5("div", { className: "mb-1", children: [
      /* @__PURE__ */ jsx5("div", { className: "text-slate-600", children: f.name }),
      /* @__PURE__ */ jsx5("div", { className: "text-slate-400", children: f.bins.map((b) => /* @__PURE__ */ jsxs5("span", { className: "mr-2 inline-block", children: [
        b.label,
        " ",
        /* @__PURE__ */ jsxs5("span", { className: b.points >= 0 ? "text-emerald-600" : "text-rose-600", children: [
          b.points >= 0 ? "+" : "",
          b.points
        ] })
      ] }, b.label)) })
    ] }, f.key)),
    /* @__PURE__ */ jsx5("div", { className: "mt-1 border-t border-slate-100 pt-1 text-slate-500", children: "\u5408\u8BA1 = 600 + \u03A3\u52A0\u5206\uFF0C\u88C1\u526A [300,900]" })
  ] });
}
var HINT_TONE = {
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  safe: "bg-emerald-50 text-emerald-700 border-emerald-200",
  neutral: "bg-slate-50 text-slate-600 border-slate-200"
};
function hintTone(text) {
  const t = (text ?? "").replace(/\s/g, "");
  if (/拒绝|高危|高风险|危险|欺诈|逾期|不良|拦截|冻结|告警|红/.test(t)) return HINT_TONE.danger;
  if (/关注|临界|降级|审慎|待观察|中风险|预警|黄/.test(t)) return HINT_TONE.warn;
  if (/正常|通过|标准|低风|核准|绿/.test(t)) return HINT_TONE.safe;
  return HINT_TONE.neutral;
}
function ModelDecisionGraph({
  prod,
  model,
  thresholds,
  onJumpRules,
  onJumpStrategy,
  onSaveCollisions,
  graph: graphProp,
  nodeResults,
  currentScore,
  editable,
  onSaveGraph
}) {
  const graphBase = graphProp ?? MODEL_DECISION_GRAPH[prod];
  const [localGraph, setLocalGraph] = useState5(null);
  const graph = localGraph ?? graphBase;
  const isPipeline = !!graphProp;
  const isEditable = editable ?? !!onSaveCollisions;
  const containerRef = useRef5(null);
  const [scale, setScale] = useState5(1);
  const [tx, setTx] = useState5(0);
  const [ty, setTy] = useState5(0);
  const [hi, setHi] = useState5("all");
  const [focus, setFocus] = useState5(null);
  const [selected, setSelected] = useState5(null);
  const [editingCollision, setEditingCollision] = useState5(false);
  const [localRules, setLocalRules] = useState5([]);
  const [isFs, setIsFs] = useState5(false);
  const [openNodes, setOpenNodes] = useState5(/* @__PURE__ */ new Set());
  const [pos, setPos] = useState5({});
  const dragRef = useRef5(null);
  const [dragging, setDragging] = useState5(false);
  const [editMode, setEditMode] = useState5(false);
  const [linkMode, setLinkMode] = useState5(false);
  const [linkFrom, setLinkFrom] = useState5(null);
  const [nodeFilter, setNodeFilter] = useState5("");
  const dirty = !!localGraph || Object.keys(pos).length > 0;
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const ppos = (n) => pos[n.id] ?? { x: n.x, y: n.y };
  const anchorR = (n) => ({ x: ppos(n).x + NODE_W, y: ppos(n).y + NODE_H / 2 });
  const anchorL = (n) => ({ x: ppos(n).x, y: ppos(n).y + NODE_H / 2 });
  const isAlertEdge = (e) => nodeMap.get(e.from)?.type === "alert" || nodeMap.get(e.to)?.type === "alert";
  const rows = thresholds.filter((t) => t.prod === prod);
  const hitRow = currentScore != null ? rows.find((t) => {
    const [lo, hi2] = t.range.split("-").map(Number);
    return currentScore >= lo && currentScore <= hi2;
  }) : void 0;
  const effectiveRules = model.collisionRules?.length ? model.collisionRules : COLLISION_SEED[prod];
  const metaOf = (n) => {
    if (n.type === "collision" && effectiveRules.length) {
      return effectiveRules.map((r) => `${r.enabled ? "" : "\u3010\u505C\u7528\u3011"}${r.conflict} \u2192 ${r.result}`);
    }
    return n.meta ?? [];
  };
  const zoom = (d) => setScale((s) => +Math.min(2, Math.max(0.4, +(s + d).toFixed(2))));
  const pan = (dx, dy) => {
    setTx((x) => x + dx);
    setTy((y) => y + dy);
  };
  const resetView = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };
  const fit = () => {
    const el = containerRef.current;
    if (!el) return;
    const s = Math.min(el.clientWidth / graph.width, el.clientHeight / graph.height);
    setScale(+Math.min(2, Math.max(0.4, s)).toFixed(2));
    setTx(0);
    setTy(0);
  };
  useEffect5(() => {
    const onCh = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onCh);
    return () => document.removeEventListener("fullscreenchange", onCh);
  }, []);
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen?.();
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(graph, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decision-graph-${isPipeline ? "pipeline" : prod}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const print = () => window.print();
  const ensureEditable = () => {
    if (localGraph) return localGraph;
    return {
      ...graphBase,
      nodes: graphBase.nodes.map((n) => ({ ...n })),
      edges: graphBase.edges.map((e) => ({ ...e }))
    };
  };
  const addNode = (type) => {
    const g = ensureEditable();
    const n = g.nodes.length;
    const COLS = 4;
    const x = 40 + n % COLS * (NODE_W + 28);
    const y = 40 + Math.floor(n / COLS) * (NODE_H + 28);
    const id = `${type}_${Date.now().toString(36)}`;
    const newNode = { id, type, title: GNODE_META[type].label, x, y };
    setLocalGraph({
      ...g,
      nodes: [...g.nodes, newNode],
      width: Math.max(g.width, x + NODE_W + 40),
      height: Math.max(g.height, y + NODE_H + 40)
    });
  };
  const addEdge = (from, to) => {
    if (from === to) return;
    const g = ensureEditable();
    if (g.edges.some((e) => e.from === from && e.to === to)) return;
    setLocalGraph({ ...g, edges: [...g.edges, { from, to }] });
  };
  const removeNode = (id) => {
    const g = ensureEditable();
    setLocalGraph({
      ...g,
      nodes: g.nodes.filter((n) => n.id !== id),
      edges: g.edges.filter((e) => e.from !== id && e.to !== id)
    });
    setSelected(null);
    setFocus(null);
  };
  const removeEdge = (i) => {
    const g = ensureEditable();
    setLocalGraph({ ...g, edges: g.edges.filter((_, j) => j !== i) });
  };
  const renameNode = (id, title) => {
    const g = ensureEditable();
    setLocalGraph({ ...g, nodes: g.nodes.map((n) => n.id === id ? { ...n, title: title || GNODE_META[n.type].label } : n) });
  };
  const saveGraph = () => {
    if (!onSaveGraph) return;
    const g = localGraph ?? graph;
    const merged = {
      ...g,
      nodes: g.nodes.map((n) => {
        const p = pos[n.id];
        return p ? { ...n, x: p.x, y: p.y } : n;
      })
    };
    onSaveGraph(merged);
    setLocalGraph(null);
    setPos({});
    setEditMode(false);
    setLinkMode(false);
    setLinkFrom(null);
  };
  const startDrag = (e, n) => {
    e.stopPropagation();
    const cur = pos[n.id] ?? { x: n.x, y: n.y };
    dragRef.current = { id: n.id, sx: e.clientX, sy: e.clientY, px: cur.x, py: cur.y, moved: false };
    setDragging(true);
    const onMove = (ev) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (ev.clientX - d.sx) / scale;
      const dy = (ev.clientY - d.sy) / scale;
      if (Math.abs(ev.clientX - d.sx) > 3 || Math.abs(ev.clientY - d.sy) > 3) d.moved = true;
      setPos((p) => ({ ...p, [d.id]: { x: Math.round(d.px + dx), y: Math.round(d.py + dy) } }));
    };
    const onUp = () => {
      const d = dragRef.current;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setDragging(false);
      if (d && !d.moved) {
        if (editMode && linkMode) {
          if (!linkFrom) setLinkFrom(d.id);
          else if (linkFrom !== d.id) {
            addEdge(linkFrom, d.id);
            setLinkMode(false);
            setLinkFrom(null);
          } else setLinkFrom(null);
        } else {
          setSelected(nodeMap.get(d.id) ?? null);
          setFocus(d.id);
        }
      }
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const focusPath = useMemo3(() => {
    if (!focus) return null;
    const anc = /* @__PURE__ */ new Set();
    const dec = /* @__PURE__ */ new Set([focus]);
    let st = [focus];
    while (st.length) {
      const c = st.pop();
      graph.edges.forEach((e) => {
        if (e.to === c && !anc.has(e.from)) {
          anc.add(e.from);
          st.push(e.from);
        }
      });
    }
    st = [focus];
    while (st.length) {
      const c = st.pop();
      graph.edges.forEach((e) => {
        if (e.from === c && !dec.has(e.to)) {
          dec.add(e.to);
          st.push(e.to);
        }
      });
    }
    return /* @__PURE__ */ new Set([...anc, ...dec]);
  }, [focus, graph]);
  const nodeDim = (n) => focusPath ? !focusPath.has(n.id) : hi === "main" && n.type === "alert" || hi === "branch" && n.type !== "alert";
  const edgeDim = (e) => focusPath ? !(focusPath.has(e.from) && focusPath.has(e.to)) : hi === "main" && isAlertEdge(e) || hi === "branch" && !isAlertEdge(e);
  const inputsOf = (id) => graph.edges.filter((e) => e.to === id).map((e) => nodeMap.get(e.from)?.title ?? e.from);
  const outputsOf = (id) => graph.edges.filter((e) => e.from === id).map((e) => nodeMap.get(e.to)?.title ?? e.to);
  const toggleNode = (id) => setOpenNodes((prev) => {
    const s = new Set(prev);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    return s;
  });
  const openCollision = () => {
    setLocalRules(effectiveRules.map((r) => ({ ...r })));
    setEditingCollision(true);
  };
  const updateRule = (id, key, val) => setLocalRules((rs) => rs.map((r) => r.id === id ? { ...r, [key]: val } : r));
  const toggleRule = (id) => setLocalRules((rs) => rs.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  const removeRule = (id) => setLocalRules((rs) => rs.filter((r) => r.id !== id));
  const addRule = () => setLocalRules((rs) => [...rs, { id: `cc-${Date.now().toString(36)}`, conflict: "", result: "", priority: "\u8F6C\u4EBA\u5DE5", enabled: true }]);
  const saveCollision = () => {
    onSaveCollisions(localRules);
    setEditingCollision(false);
  };
  const TBtn = ({ onClick, title, children }) => /* @__PURE__ */ jsx5("button", { onClick, title, className: "h-7 min-w-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 hover:border-brand-400 hover:bg-slate-50", children });
  return /* @__PURE__ */ jsxs5("div", { children: [
    /* @__PURE__ */ jsxs5(
      "div",
      {
        ref: containerRef,
        className: "relative flex overflow-hidden rounded-xl border border-slate-200 bg-[#FAFBFC]",
        style: isFs ? { height: "100vh" } : { maxHeight: 600 },
        children: [
          isEditable && editMode && /* @__PURE__ */ jsxs5("aside", { className: "z-30 flex w-[188px] shrink-0 flex-col border-r border-slate-200 bg-white", children: [
            /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between border-b border-slate-100 px-3 py-2", children: [
              /* @__PURE__ */ jsx5("span", { className: "text-xs font-semibold text-slate-600", children: "\u6DFB\u52A0\u8282\u70B9" }),
              /* @__PURE__ */ jsxs5("span", { className: "rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400", children: [
                graph.nodes.length,
                " \u4E2A"
              ] })
            ] }),
            /* @__PURE__ */ jsx5("div", { className: "px-3 pb-2 pt-2", children: /* @__PURE__ */ jsx5(
              "input",
              {
                value: nodeFilter,
                onChange: (e) => setNodeFilter(e.target.value),
                placeholder: "\u7B5B\u9009\u8282\u70B9\u7C7B\u578B",
                className: "w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand-400"
              }
            ) }),
            /* @__PURE__ */ jsx5("div", { className: "flex-1 space-y-3 overflow-y-auto px-3 pb-3", children: NODE_CATEGORY.map((cat) => {
              const items = cat.types.filter((t) => GNODE_META[t].label.includes(nodeFilter) || nodeFilter === "");
              if (!items.length) return null;
              return /* @__PURE__ */ jsxs5("div", { children: [
                /* @__PURE__ */ jsx5("div", { className: "mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400", children: cat.label }),
                /* @__PURE__ */ jsx5("div", { className: "space-y-1", children: items.map((t) => /* @__PURE__ */ jsxs5(
                  "button",
                  {
                    onClick: () => addNode(t),
                    className: "flex w-full items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:border-brand-400 hover:bg-slate-50",
                    children: [
                      /* @__PURE__ */ jsx5("span", { className: "h-3 w-3 shrink-0 rounded-sm", style: { background: GNODE_META[t].color } }),
                      /* @__PURE__ */ jsx5("span", { className: "truncate", children: GNODE_META[t].label })
                    ]
                  },
                  t
                )) })
              ] }, cat.label);
            }) }),
            /* @__PURE__ */ jsx5("div", { className: "border-t border-slate-100 p-2", children: /* @__PURE__ */ jsx5(
              "button",
              {
                onClick: () => {
                  setLinkMode((v) => !v);
                  setLinkFrom(null);
                },
                title: "\u8FDB\u5165\u8FDE\u7EBF\u6A21\u5F0F\u540E\uFF0C\u5148\u70B9\u8D77\u70B9\u8282\u70B9\u3001\u518D\u70B9\u7EC8\u70B9\u8282\u70B9\u5373\u53EF\u8FDE\u63A5",
                className: `w-full rounded-lg border px-2 py-1.5 text-xs font-medium ${linkMode ? "border-cyan-400 bg-cyan-50 text-cyan-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`,
                children: linkMode ? linkFrom ? "\u8FDE\u7EBF\u4E2D\u2026 \u70B9\u7EC8\u70B9 \u2713" : "\u8FDE\u7EBF\u6A21\u5F0F\uFF08\u5F00\u542F\uFF09" : "\u8FDE\u7EBF\u6A21\u5F0F"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs5("div", { className: "flex min-w-0 flex-1 flex-col", children: [
            /* @__PURE__ */ jsxs5("div", { className: "sticky top-0 z-20 flex shrink-0 flex-wrap items-center gap-1 border-b border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur", children: [
              /* @__PURE__ */ jsx5("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u7F29\u653E" }),
              /* @__PURE__ */ jsx5(TBtn, { onClick: () => zoom(-0.1), title: "\u7F29\u5C0F", children: "\u2212" }),
              /* @__PURE__ */ jsxs5("span", { className: "w-12 text-center text-xs tabular-nums text-slate-500", children: [
                Math.round(scale * 100),
                "%"
              ] }),
              /* @__PURE__ */ jsx5(TBtn, { onClick: () => zoom(0.1), title: "\u653E\u5927", children: "\uFF0B" }),
              /* @__PURE__ */ jsx5(TBtn, { onClick: fit, title: "\u9002\u5E94\u5C4F\u5E55", children: "\u9002\u5E94" }),
              /* @__PURE__ */ jsx5(TBtn, { onClick: () => setScale(1), title: "\u539F\u59CB\u5927\u5C0F 100%", children: "1:1" }),
              /* @__PURE__ */ jsx5("span", { className: "mx-1 h-5 w-px bg-slate-200" }),
              /* @__PURE__ */ jsx5("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u89C6\u56FE" }),
              /* @__PURE__ */ jsx5(TBtn, { onClick: resetView, title: "\u590D\u4F4D\uFF08\u7F29\u653E+\u5E73\u79FB\u5F52\u96F6\uFF09", children: "\u590D\u4F4D" }),
              /* @__PURE__ */ jsx5(TBtn, { onClick: toggleFs, title: isFs ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F", children: isFs ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F" }),
              /* @__PURE__ */ jsx5("span", { className: "mx-1 h-5 w-px bg-slate-200" }),
              /* @__PURE__ */ jsx5("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u9AD8\u4EAE" }),
              /* @__PURE__ */ jsx5(TBtn, { onClick: () => {
                setHi("main");
                setFocus(null);
              }, title: "\u4EC5\u9AD8\u4EAE\u4E3B\u7EBF\uFF08\u4E32\u884C\u94FE\u8DEF\uFF09", children: "\u4E3B\u7EBF" }),
              /* @__PURE__ */ jsx5(TBtn, { onClick: () => {
                setHi("branch");
                setFocus(null);
              }, title: "\u4EC5\u9AD8\u4EAE\u652F\u7EBF\uFF08\u5E76\u884C\u9884\u8B66\uFF09", children: "\u652F\u7EBF" }),
              /* @__PURE__ */ jsx5(TBtn, { onClick: () => {
                setHi("all");
                setFocus(null);
              }, title: "\u5168\u90E8\u663E\u793A\uFF08\u53D6\u6D88\u9AD8\u4EAE\uFF09", children: "\u5168\u90E8" }),
              isEditable && /* @__PURE__ */ jsxs5(Fragment6, { children: [
                /* @__PURE__ */ jsx5("span", { className: "mx-1 h-5 w-px bg-slate-200" }),
                /* @__PURE__ */ jsx5("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u7F16\u8F91" }),
                /* @__PURE__ */ jsx5(TBtn, { onClick: () => {
                  setEditMode((v) => !v);
                  setLinkMode(false);
                  setLinkFrom(null);
                }, title: editMode ? "\u9000\u51FA\u753B\u5E03\u7F16\u8F91" : "\u8FDB\u5165\u753B\u5E03\u7F16\u8F91\uFF08\u6DFB\u52A0\u8282\u70B9 / \u8FDE\u7EBF / \u5220\u9664\uFF09", children: editMode ? "\u5B8C\u6210\u7F16\u8F91" : "\u7F16\u8F91\u753B\u5E03" }),
                editMode && dirty && /* @__PURE__ */ jsx5("button", { onClick: saveGraph, title: "\u4FDD\u5B58\u5F53\u524D\u753B\u5E03\uFF08\u8282\u70B9 / \u8FDE\u7EBF / \u4F4D\u7F6E\uFF09\u5230\u6A21\u578B\u914D\u7F6E", className: "h-7 rounded-md bg-brand-600 px-3 text-xs font-medium text-white hover:bg-brand-700", children: "\u4FDD\u5B58\u753B\u5E03" })
              ] }),
              /* @__PURE__ */ jsx5("span", { className: "ml-2 text-[11px] text-slate-300", children: editMode && linkMode ? linkFrom ? "\u8FDE\u7EBF\u4E2D \xB7 \u70B9\u51FB\u7EC8\u70B9\u8282\u70B9\u5B8C\u6210\u8FDE\u7EBF" : "\u8FDE\u7EBF\u6A21\u5F0F \xB7 \u70B9\u51FB\u8D77\u70B9\u8282\u70B9" : "\u62D6\u62FD\u8282\u70B9\u53EF\u8C03\u6574\u4F4D\u7F6E \xB7 \u70B9\u51FB\u8282\u70B9\u67E5\u770B\u8BE6\u60C5\u5E76\u9AD8\u4EAE\u5176\u6574\u6761\u94FE\u8DEF" })
            ] }),
            /* @__PURE__ */ jsx5("div", { className: "relative flex-1 overflow-auto", children: /* @__PURE__ */ jsxs5(
              "div",
              {
                style: {
                  width: graph.width * scale,
                  height: graph.height * scale,
                  transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                  transformOrigin: "top left",
                  backgroundImage: "radial-gradient(#E2E8F0 1px, transparent 1px)",
                  backgroundSize: "18px 18px"
                },
                children: [
                  /* @__PURE__ */ jsxs5("svg", { width: graph.width, height: graph.height, className: "pointer-events-none absolute left-0 top-0", children: [
                    /* @__PURE__ */ jsx5("defs", { children: /* @__PURE__ */ jsx5("marker", { id: "arrow", markerWidth: "10", markerHeight: "10", refX: "8", refY: "3", orient: "auto", markerUnits: "strokeWidth", children: /* @__PURE__ */ jsx5("path", { d: "M0,0 L8,3 L0,6 Z", fill: "#94A3B8" }) }) }),
                    graph.edges.map((e, i) => {
                      const a = anchorR(nodeMap.get(e.from));
                      const b = anchorL(nodeMap.get(e.to));
                      const midX = (a.x + b.x) / 2;
                      const d = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
                      const col = e.color ?? (isAlertEdge(e) ? "#0891B2" : "#CBD5E1");
                      const dim = edgeDim(e);
                      return /* @__PURE__ */ jsxs5("g", { style: { opacity: dim ? 0.18 : 1, transition: "opacity .15s" }, children: [
                        /* @__PURE__ */ jsx5("path", { d, fill: "none", stroke: col, strokeWidth: isAlertEdge(e) ? 2 : 1.5, strokeDasharray: e.dashed ? "5 4" : void 0, markerEnd: "url(#arrow)" }),
                        e.label && /* @__PURE__ */ jsx5("text", { x: midX, y: (a.y + b.y) / 2 - 6, textAnchor: "middle", fontSize: 11, fill: col, children: e.label }),
                        editMode && /* @__PURE__ */ jsx5(
                          "path",
                          {
                            d,
                            fill: "none",
                            stroke: "transparent",
                            strokeWidth: 14,
                            style: { pointerEvents: "stroke", cursor: "pointer" },
                            onClick: () => removeEdge(i),
                            children: /* @__PURE__ */ jsx5("title", { children: "\u70B9\u51FB\u5220\u9664\u8BE5\u8FDE\u7EBF" })
                          }
                        )
                      ] }, i);
                    })
                  ] }),
                  graph.nodes.map((n) => {
                    const meta = GNODE_META[n.type];
                    const isModel = n.type === "model";
                    const isAlertNode = n.type === "alert";
                    const cardBins = isPipeline ? void 0 : isModel && prod === "zhixin" ? model.bins?.length ? model.bins : ZHIXIN_SCORECARD : void 0;
                    const headerBg = isModel ? model.color : meta.color;
                    const isCollision = n.type === "collision";
                    const dim = nodeDim(n);
                    const cp = pos[n.id] ?? { x: n.x, y: n.y };
                    return /* @__PURE__ */ jsxs5(
                      "div",
                      {
                        className: `absolute flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-opacity ${dim ? "opacity-20" : "opacity-100"} ${isCollision ? "cursor-grab hover:border-rose-400 hover:ring-2 hover:ring-rose-200 active:cursor-grabbing" : "cursor-grab hover:border-slate-400 hover:ring-2 hover:ring-slate-200 active:cursor-grabbing"}`,
                        style: { left: cp.x, top: cp.y, width: NODE_W, height: NODE_H, ...isAlertNode ? { borderStyle: "dashed", borderColor: "#0891B2" } : {} },
                        onMouseDown: (e) => startDrag(e, n),
                        children: [
                          /* @__PURE__ */ jsxs5("div", { className: "flex shrink-0 items-center justify-between rounded-t-xl px-3 py-1.5", style: { background: headerBg }, children: [
                            /* @__PURE__ */ jsx5("span", { className: "text-xs font-semibold text-white", children: n.title }),
                            /* @__PURE__ */ jsxs5("span", { className: "flex items-center gap-1.5", children: [
                              isCollision && onSaveCollisions && /* @__PURE__ */ jsx5("span", { className: "rounded bg-white/25 px-1 py-0.5 text-[10px] font-medium text-white", children: "\u53EF\u7F16\u8F91" }),
                              n.badge && /* @__PURE__ */ jsx5("span", { className: "rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-medium text-white", children: n.badge })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs5("div", { className: "min-h-0 flex-1 overflow-y-auto px-3 py-1.5", children: [
                            nodeResults?.[n.id] && /* @__PURE__ */ jsx5("div", { className: "mb-1.5 rounded-md border px-1.5 py-1 text-[11px] font-semibold leading-snug " + hintTone(nodeResults?.[n.id]), children: nodeResults[n.id] }),
                            cardBins ? /* @__PURE__ */ jsx5(ScoreCardView, { bins: cardBins }) : /* @__PURE__ */ jsxs5(Fragment6, { children: [
                              n.subtitle && /* @__PURE__ */ jsx5("div", { className: "mb-1 text-[11px] text-slate-400", children: n.subtitle }),
                              /* @__PURE__ */ jsx5("div", { className: "space-y-0.5 opacity-60", children: metaOf(n).map((m, i) => /* @__PURE__ */ jsx5("div", { className: `whitespace-normal break-words text-[10.5px] leading-tight text-slate-500 ${!openNodes.has(n.id) && i > 0 ? "hidden" : ""}`, children: m }, i)) }),
                              metaOf(n).length > 1 && /* @__PURE__ */ jsx5("button", { onClick: () => toggleNode(n.id), className: "mt-0.5 text-[10px] text-blue-500 hover:underline", children: openNodes.has(n.id) ? "\u6536\u8D77\u8BF4\u660E" : "\u5C55\u5F00\u8BF4\u660E" })
                            ] })
                          ] })
                        ]
                      },
                      n.id
                    );
                  })
                ]
              }
            ) })
          ] }),
          selected && /* @__PURE__ */ jsxs5("div", { className: "absolute right-0 top-10 bottom-0 z-30 flex w-[360px] max-w-[80%] flex-col border-l border-slate-200 bg-white shadow-2xl", children: [
            /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between border-b border-slate-100 px-4 py-3", children: [
              /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx5("span", { className: "h-3 w-3 rounded-sm", style: { background: GNODE_META[selected.type].color } }),
                /* @__PURE__ */ jsx5("span", { className: "text-sm font-semibold text-slate-800", children: selected.title })
              ] }),
              /* @__PURE__ */ jsx5("button", { onClick: () => {
                setSelected(null);
                setFocus(null);
              }, className: "rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100", children: "\u5173\u95ED" })
            ] }),
            /* @__PURE__ */ jsxs5("div", { className: "flex-1 space-y-3 overflow-y-auto px-4 py-3", children: [
              /* @__PURE__ */ jsxs5("div", { className: "flex flex-wrap items-center gap-2 text-xs", children: [
                /* @__PURE__ */ jsx5("span", { className: "rounded-full bg-slate-100 px-2 py-0.5 text-slate-500", children: GNODE_META[selected.type].label }),
                selected.subtitle && /* @__PURE__ */ jsx5("span", { className: "text-slate-400", children: selected.subtitle }),
                selected.badge && /* @__PURE__ */ jsx5("span", { className: "rounded-full bg-brand-50 px-2 py-0.5 text-brand-600", children: selected.badge })
              ] }),
              /* @__PURE__ */ jsxs5("div", { children: [
                /* @__PURE__ */ jsx5("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u672C\u5BA2\u6237\u503C" }),
                /* @__PURE__ */ jsx5("div", { className: "rounded-lg border px-3 py-2 text-[12.5px] font-semibold leading-relaxed " + hintTone(nodeResults?.[selected.id]), children: nodeResults?.[selected.id] ?? "\u2014\uFF08\u8BE5\u8282\u70B9\u65E0\u672C\u5BA2\u6237\u53D6\u503C\uFF09" })
              ] }),
              /* @__PURE__ */ jsxs5("div", { children: [
                /* @__PURE__ */ jsx5("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8BF4\u660E" }),
                /* @__PURE__ */ jsx5("div", { className: "rounded-lg bg-slate-50 px-3 py-2 text-[12px] leading-relaxed text-slate-600", children: (metaOf(selected).length ? metaOf(selected) : ["\uFF08\u8BE5\u8282\u70B9\u65E0\u989D\u5916\u914D\u7F6E\u8BF4\u660E\uFF09"]).map((m, i) => /* @__PURE__ */ jsx5("div", { className: "whitespace-pre-wrap", children: m }, i)) })
              ] }),
              /* @__PURE__ */ jsxs5("div", { children: [
                /* @__PURE__ */ jsx5("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8F93\u5165\uFF08\u4E0A\u6E38\u8282\u70B9\uFF09" }),
                /* @__PURE__ */ jsxs5("div", { className: "flex flex-wrap gap-1.5", children: [
                  inputsOf(selected.id).map((t, i) => /* @__PURE__ */ jsx5("span", { className: "rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600", children: t }, i)),
                  inputsOf(selected.id).length === 0 && /* @__PURE__ */ jsx5("span", { className: "text-[11px] text-slate-300", children: "\u65E0\uFF08\u8D77\u70B9\u8282\u70B9\uFF09" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs5("div", { children: [
                /* @__PURE__ */ jsx5("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8F93\u51FA\uFF08\u4E0B\u6E38\u8282\u70B9\uFF09" }),
                /* @__PURE__ */ jsxs5("div", { className: "flex flex-wrap gap-1.5", children: [
                  outputsOf(selected.id).map((t, i) => /* @__PURE__ */ jsx5("span", { className: "rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600", children: t }, i)),
                  outputsOf(selected.id).length === 0 && /* @__PURE__ */ jsx5("span", { className: "text-[11px] text-slate-300", children: "\u65E0\uFF08\u7EC8\u70B9\u8282\u70B9\uFF09" })
                ] })
              ] }),
              selected.type === "collision" && onSaveCollisions && /* @__PURE__ */ jsxs5(Fragment6, { children: [
                /* @__PURE__ */ jsx5("p", { className: "text-xs leading-relaxed text-slate-400", children: "\u5F53\u591A\u6761\u89C4\u5219\u540C\u65F6\u547D\u4E2D\u4EA7\u751F\u51B2\u7A81\u65F6\uFF0C\u6309\u6B64\u88C1\u51B3\u903B\u8F91\u53D6\u820D\u5E76\u751F\u6210\u5BF9\u5E94\u7684\u9884\u8B66\u7B49\u7EA7\u3002\u4FEE\u6539\u4EC5\u5F71\u54CD\u672C\u6A21\u578B\u7684\u914D\u7F6E\uFF0C\u4FDD\u5B58\u540E\u968F\u6A21\u578B\u6301\u4E45\u5316\u3002" }),
                /* @__PURE__ */ jsx5("button", { onClick: () => {
                  setSelected(null);
                  setFocus(null);
                  openCollision();
                }, className: "w-full rounded-lg border border-rose-200 bg-rose-50 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100", children: "\u7F16\u8F91\u51B2\u7A81\u88C1\u51B3\u89C4\u5219 \u2192" })
              ] }),
              editMode && /* @__PURE__ */ jsxs5(Fragment6, { children: [
                /* @__PURE__ */ jsxs5("div", { children: [
                  /* @__PURE__ */ jsx5("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8282\u70B9\u6807\u9898" }),
                  /* @__PURE__ */ jsx5(
                    "input",
                    {
                      value: selected.title,
                      onChange: (e) => renameNode(selected.id, e.target.value),
                      className: "w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx5(
                  "button",
                  {
                    onClick: () => removeNode(selected.id),
                    className: "w-full rounded-lg border border-rose-200 bg-rose-50 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100",
                    children: "\u5220\u9664\u8BE5\u8282\u70B9\uFF08\u542B\u76F8\u5173\u8FDE\u7EBF\uFF09"
                  }
                )
              ] })
            ] })
          ] }),
          editingCollision && onSaveCollisions && /* @__PURE__ */ jsx5("div", { className: "absolute inset-0 z-40 flex justify-end bg-black/20", onClick: () => setEditingCollision(false), children: /* @__PURE__ */ jsxs5("div", { className: "flex h-full w-[440px] max-w-[90%] flex-col bg-white shadow-xl", onClick: (e) => e.stopPropagation(), children: [
            /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between border-b border-slate-100 px-4 py-3", children: [
              /* @__PURE__ */ jsxs5("div", { className: "text-sm font-semibold text-slate-800", children: [
                "\u89C4\u5219\u78B0\u649E \xB7 \u51B2\u7A81\u88C1\u51B3 ",
                /* @__PURE__ */ jsx5("span", { className: "ml-1 text-xs font-normal text-slate-400", children: SCORE_PROD_LABEL[prod] })
              ] }),
              /* @__PURE__ */ jsx5("button", { onClick: () => setEditingCollision(false), className: "rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100", children: "\u5173\u95ED" })
            ] }),
            /* @__PURE__ */ jsxs5("div", { className: "flex-1 space-y-3 overflow-y-auto px-4 py-3", children: [
              /* @__PURE__ */ jsx5("p", { className: "text-xs text-slate-400", children: "\u5B9A\u4E49\u5F53\u591A\u6761\u89C4\u5219\u540C\u65F6\u547D\u4E2D\u4EA7\u751F\u51B2\u7A81\u65F6\u5982\u4F55\u88C1\u51B3\u3001\u5E76\u751F\u6210\u4F55\u79CD\u9884\u8B66\u3002\u6B64\u5373\u6A21\u578B\u914D\u7F6E\u9636\u6BB5\u7684\u51B2\u7A81\u903B\u8F91\uFF0C\u4FDD\u5B58\u540E\u968F\u6A21\u578B\u6301\u4E45\u5316\u3002" }),
              localRules.map((r, i) => /* @__PURE__ */ jsxs5("div", { className: "rounded-xl border border-slate-200 p-3", children: [
                /* @__PURE__ */ jsxs5("div", { className: "mb-2 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs5("span", { className: "text-xs font-medium text-slate-500", children: [
                    "\u88C1\u51B3\u89C4\u5219 ",
                    i + 1
                  ] }),
                  /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxs5("label", { className: "flex items-center gap-1 text-xs text-slate-500", children: [
                      /* @__PURE__ */ jsx5("input", { type: "checkbox", checked: r.enabled, onChange: () => toggleRule(r.id), className: "accent-rose-500" }),
                      " \u542F\u7528"
                    ] }),
                    /* @__PURE__ */ jsx5("button", { onClick: () => removeRule(r.id), className: "text-xs text-rose-500 hover:underline", children: "\u5220\u9664" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx5(
                  "input",
                  {
                    className: "mb-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400",
                    placeholder: "\u51B2\u7A81\u6761\u4EF6\uFF08\u5982\uFF1A\u9ED1\u7070\u540D\u5355\u547D\u4E2D \u2229 XGB \u4E2D\u98CE\u9669\uFF09",
                    value: r.conflict,
                    onChange: (e) => updateRule(r.id, "conflict", e.target.value)
                  }
                ),
                /* @__PURE__ */ jsx5(
                  "input",
                  {
                    className: "mb-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400",
                    placeholder: "\u88C1\u51B3\u7ED3\u679C / \u751F\u6210\u7684\u9884\u8B66\uFF08\u5982\uFF1A\u5F3A\u5236\u62D2\u7EDD\uFF0C\u751F\u6210\u6B3A\u8BC8\u9884\u8B66\uFF09",
                    value: r.result,
                    onChange: (e) => updateRule(r.id, "result", e.target.value)
                  }
                ),
                /* @__PURE__ */ jsxs5(
                  "select",
                  {
                    className: "w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400",
                    value: r.priority,
                    onChange: (e) => updateRule(r.id, "priority", e.target.value),
                    children: [
                      /* @__PURE__ */ jsx5("option", { value: "\u62E6\u622A\u4F18\u5148", children: "\u4F18\u5148\u7EA7\uFF1A\u62E6\u622A\u4F18\u5148\uFF08\u89C4\u5219/\u540D\u5355\u538B\u8FC7\u5206\u6570\uFF09" }),
                      /* @__PURE__ */ jsx5("option", { value: "\u5206\u6570\u4F18\u5148", children: "\u4F18\u5148\u7EA7\uFF1A\u5206\u6570\u4F18\u5148\uFF08\u6A21\u578B\u5206\u51B3\u5B9A\uFF09" }),
                      /* @__PURE__ */ jsx5("option", { value: "\u8F6C\u4EBA\u5DE5", children: "\u4F18\u5148\u7EA7\uFF1A\u8F6C\u4EBA\u5DE5\u590D\u6838" })
                    ]
                  }
                )
              ] }, r.id)),
              localRules.length === 0 && /* @__PURE__ */ jsx5("div", { className: "rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400", children: "\u6682\u65E0\u51B2\u7A81\u88C1\u51B3\u89C4\u5219\uFF0C\u70B9\u51FB\u4E0B\u65B9\u65B0\u589E\u3002" }),
              /* @__PURE__ */ jsx5("button", { onClick: addRule, className: "w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600", children: "\uFF0B \u65B0\u589E\u51B2\u7A81\u88C1\u51B3\u89C4\u5219" })
            ] }),
            /* @__PURE__ */ jsxs5("div", { className: "flex gap-2 border-t border-slate-100 px-4 py-3", children: [
              /* @__PURE__ */ jsx5("button", { onClick: saveCollision, className: "flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700", children: "\u4FDD\u5B58" }),
              /* @__PURE__ */ jsx5("button", { onClick: () => setEditingCollision(false), className: "rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50", children: "\u53D6\u6D88" })
            ] })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs5("div", { className: "mt-2 flex flex-wrap items-center gap-3", children: [
      Object.keys(GNODE_META).map((t) => /* @__PURE__ */ jsxs5("span", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
        /* @__PURE__ */ jsx5("span", { className: "h-2.5 w-2.5 rounded-sm", style: { background: GNODE_META[t].color } }),
        GNODE_META[t].label
      ] }, t)),
      /* @__PURE__ */ jsxs5("span", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
        /* @__PURE__ */ jsx5("span", { className: "inline-block h-0 w-5 border-t-2 border-dashed border-cyan-500" }),
        "\u5E76\u884C\u9884\u8B66\uFF08\u865A\u7EBF\uFF09"
      ] })
    ] }),
    /* @__PURE__ */ jsxs5("div", { className: "mt-4 overflow-hidden rounded-xl border border-slate-200", children: [
      /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2", children: [
        /* @__PURE__ */ jsx5("div", { className: "text-sm font-semibold text-slate-800", children: "\u8282\u70B9\u660E\u7EC6 \xB7 \u6BCF\u4E2A\u8282\u70B9\u7684\u8BF4\u660E / \u8F93\u5165 / \u8F93\u51FA" }),
        /* @__PURE__ */ jsx5(
          "button",
          {
            onClick: () => setOpenNodes(openNodes.size === graph.nodes.length ? /* @__PURE__ */ new Set() : new Set(graph.nodes.map((n) => n.id))),
            className: "text-xs text-blue-600 hover:underline",
            children: openNodes.size === graph.nodes.length ? "\u5168\u90E8\u5C55\u5F00\u8BF4\u660E" : "\u5168\u90E8\u6536\u8D77\u8BF4\u660E"
          }
        )
      ] }),
      /* @__PURE__ */ jsx5("div", { className: "max-h-[340px] overflow-auto", children: /* @__PURE__ */ jsxs5("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx5("thead", { className: "sticky top-0 bg-slate-50", children: /* @__PURE__ */ jsxs5("tr", { className: "text-left text-xs text-slate-400", children: [
          /* @__PURE__ */ jsx5("th", { className: "px-3 py-2 font-medium", children: "\u8282\u70B9" }),
          /* @__PURE__ */ jsx5("th", { className: "px-3 py-2 font-medium", children: "\u7C7B\u578B" }),
          /* @__PURE__ */ jsx5("th", { className: "px-3 py-2 font-medium", children: "\u7ED3\u679C\uFF08\u672C\u5BA2\u6237\u5728\u6B64\u8282\u70B9\u7684\u8F93\u51FA\uFF09" }),
          /* @__PURE__ */ jsx5("th", { className: "px-3 py-2 font-medium", children: "\u8BF4\u660E" }),
          /* @__PURE__ */ jsx5("th", { className: "px-3 py-2 font-medium", children: "\u8F93\u5165\uFF08\u4E0A\u6E38\uFF09" }),
          /* @__PURE__ */ jsx5("th", { className: "px-3 py-2 font-medium", children: "\u8F93\u51FA\uFF08\u4E0B\u6E38\uFF09" })
        ] }) }),
        /* @__PURE__ */ jsx5("tbody", { children: graph.nodes.map((n) => {
          const open = openNodes.has(n.id);
          const ins = inputsOf(n.id);
          const outs = outputsOf(n.id);
          const m = metaOf(n);
          return /* @__PURE__ */ jsxs5("tr", { className: "border-t border-slate-50 align-top", children: [
            /* @__PURE__ */ jsx5("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxs5("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx5("span", { className: "h-2.5 w-2.5 shrink-0 rounded-sm", style: { background: GNODE_META[n.type].color } }),
              /* @__PURE__ */ jsx5("span", { className: "font-medium text-slate-700", children: n.title }),
              n.badge && /* @__PURE__ */ jsx5("span", { className: "rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-600", children: n.badge })
            ] }) }),
            /* @__PURE__ */ jsx5("td", { className: "px-3 py-2 text-slate-500", children: GNODE_META[n.type].label }),
            /* @__PURE__ */ jsx5("td", { className: "px-3 py-2", children: nodeResults?.[n.id] ? /* @__PURE__ */ jsx5("span", { className: "inline-block max-w-[240px] whitespace-pre-wrap rounded-md border px-2 py-1 text-[11px] font-medium leading-snug " + hintTone(nodeResults?.[n.id]), children: nodeResults[n.id] }) : /* @__PURE__ */ jsx5("span", { className: "text-[11px] text-slate-300", children: "\u2014" }) }),
            /* @__PURE__ */ jsxs5("td", { className: "px-3 py-2 text-slate-600", children: [
              /* @__PURE__ */ jsx5("div", { className: "space-y-0.5", children: m.length ? m.map((t, i) => /* @__PURE__ */ jsx5("div", { className: `whitespace-pre-wrap text-[12px] leading-tight ${!open && i > 0 ? "hidden" : ""}`, children: t }, i)) : /* @__PURE__ */ jsx5("span", { className: "text-[12px] text-slate-300", children: "\uFF08\u65E0\uFF09" }) }),
              m.length > 1 && /* @__PURE__ */ jsx5("button", { onClick: () => toggleNode(n.id), className: "mt-1 text-[11px] text-blue-600 hover:underline", children: open ? "\u6536\u8D77" : "\u5C55\u5F00\u8BF4\u660E" })
            ] }),
            /* @__PURE__ */ jsx5("td", { className: "px-3 py-2 text-slate-600", children: ins.length ? ins.map((t, i) => /* @__PURE__ */ jsx5("span", { className: "mr-1 mb-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600", children: t }, i)) : /* @__PURE__ */ jsx5("span", { className: "text-[11px] text-slate-300", children: "\u65E0" }) }),
            /* @__PURE__ */ jsx5("td", { className: "px-3 py-2 text-slate-600", children: outs.length ? outs.map((t, i) => /* @__PURE__ */ jsx5("span", { className: "mr-1 mb-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600", children: t }, i)) : /* @__PURE__ */ jsx5("span", { className: "text-[11px] text-slate-300", children: "\u65E0" }) })
          ] }, n.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs5("div", { className: "mt-4 overflow-hidden rounded-xl border border-slate-200", children: [
      /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 text-sm font-semibold text-slate-800", children: [
          "\u51B3\u7B56\u6620\u5C04 \xB7 \u8F93\u51FA\u5206\u6570\u5982\u4F55\u53D8\u6210\u5904\u7F6E\u52A8\u4F5C",
          /* @__PURE__ */ jsx5("span", { className: "rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-normal text-slate-400", children: "\u53EA\u8BFB \xB7 \u6570\u636E\u6765\u81EA\u300C\u8BC4\u5206\u9608\u503C\u300D" })
        ] }),
        /* @__PURE__ */ jsx5("button", { onClick: onJumpStrategy, className: "text-xs text-blue-600 hover:underline", children: "\u5728\u89C4\u5219\u5F15\u64CE\u914D\u7F6E \u2192" })
      ] }),
      /* @__PURE__ */ jsxs5("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx5("thead", { children: /* @__PURE__ */ jsxs5("tr", { className: "text-left text-xs text-slate-400", children: [
          /* @__PURE__ */ jsx5("th", { className: "px-3 py-2 font-medium", children: "\u5206\u6570\u6BB5" }),
          /* @__PURE__ */ jsx5("th", { className: "px-3 py-2 font-medium", children: "\u7B49\u7EA7" }),
          /* @__PURE__ */ jsx5("th", { className: "px-3 py-2 font-medium", children: "\u542B\u4E49" }),
          /* @__PURE__ */ jsx5("th", { className: "px-3 py-2 font-medium", children: "\u5EFA\u8BAE\u52A8\u4F5C\uFF08\u9608\u503C\u89C4\u5219\uFF09" }),
          /* @__PURE__ */ jsx5("th", { className: "px-3 py-2 font-medium", children: "\u6267\u884C\u5F15\u64CE" })
        ] }) }),
        /* @__PURE__ */ jsxs5("tbody", { children: [
          rows.map((t) => {
            const hit = hitRow?.range === t.range;
            return /* @__PURE__ */ jsxs5("tr", { className: "border-t border-slate-50", style: hit ? { background: "#EFF6FF", boxShadow: "inset 3px 0 0 #2563EB" } : void 0, children: [
              /* @__PURE__ */ jsxs5("td", { className: "px-3 py-2 tabular-nums text-slate-700", children: [
                t.range,
                hit && /* @__PURE__ */ jsxs5("span", { className: "ml-2 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white", children: [
                  "\u25C0 \u672C\u5BA2\u6237 ",
                  currentScore,
                  " \u5206"
                ] })
              ] }),
              /* @__PURE__ */ jsx5("td", { className: "px-3 py-2 font-semibold", style: hit ? { color: "#1D4ED8" } : { color: "#334155" }, children: t.level }),
              /* @__PURE__ */ jsx5("td", { className: "px-3 py-2", style: hit ? { color: "#1E40AF" } : { color: "#64748B" }, children: t.meaning }),
              /* @__PURE__ */ jsx5("td", { className: "px-3 py-2", style: hit ? { color: "#1E40AF", fontWeight: 600 } : { color: "#334155" }, children: t.action }),
              /* @__PURE__ */ jsx5("td", { className: "px-3 py-2 text-sky-500", children: "\u89C4\u5219\u5F15\u64CE" })
            ] }, t.range);
          }),
          rows.length === 0 && /* @__PURE__ */ jsx5("tr", { children: /* @__PURE__ */ jsx5("td", { colSpan: 5, className: "px-3 py-3 text-center text-xs text-slate-400", children: "\u5F53\u524D\u6A21\u578B\u6682\u65E0\u9608\u503C\u51B3\u7B56\u914D\u7F6E" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-400", children: [
        /* @__PURE__ */ jsx5("span", { children: "\u9608\u503C\u89C4\u5219\u4E0E\u9884\u8B66\u89C4\u5219\u5747\u7531\u89C4\u5219\u5F15\u64CE\u5B50\u7CFB\u7EDF\u7EDF\u4E00\u6267\u884C\uFF1B\u94FE\u8DEF\u5B9E\u4F53\u5747\u6765\u81EA\u771F\u5B9E\u914D\u7F6E\uFF08scoreData.json / ruleHub.json\uFF09\uFF0C\u975E\u793A\u610F\u3002" }),
        /* @__PURE__ */ jsx5("button", { onClick: onJumpRules, className: "ml-3 shrink-0 text-xs text-blue-600 hover:underline", children: "\u5728\u89C4\u5219\u5F15\u64CE\u67E5\u770B\u5168\u90E8\u89C4\u5219 \u2192" })
      ] })
    ] })
  ] });
}

// src/console/ScoreModelDetail.tsx
import { Fragment as Fragment7, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var MODEL_COLOR = {
  zhicha: "#ef4444",
  zhixin: "#22c55e",
  zhirong: "#8b5cf6"
};
var PSI_KIND = { \u7A33\u5B9A: "green", \u4E34\u754C: "amber", \u504F\u79FB: "red" };
var DETAIL_TABS = [
  { key: "base", label: "\u57FA\u672C\u4FE1\u606F" },
  { key: "algo", label: "\u7B97\u6CD5\u7F16\u8F91" },
  { key: "effect", label: "\u6A21\u578B\u6548\u679C" },
  { key: "threshold", label: "\u8BC4\u5206\u9608\u503C" },
  { key: "alert", label: "\u9884\u8B66\u89C4\u5219" }
];
function levelKind(level) {
  if (level.includes("\u4F4E") || level === "A") return "green";
  if (level.includes("\u4E2D") || level === "B") return "blue";
  if (level.includes("\u9AD8") || level === "C") return "amber";
  if (level === "D") return "red";
  return "gray";
}
function alertLevelKind(level) {
  if (level === "\u9AD8") return "red";
  if (level === "\u4E2D") return "amber";
  if (level === "\u4F4E") return "blue";
  return "gray";
}
function ScoreModelDetailPage() {
  const data2 = useScore();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const prod = params.get("prod") ?? "zhicha";
  const m = data2.models.find((x) => x.prod === prod) ?? data2.models[0];
  const color = MODEL_COLOR[m.prod];
  const tabParam = params.get("tab");
  const [tab, setTab] = useState6(
    DETAIL_TABS.some((t) => t.key === tabParam) ? tabParam : "base"
  );
  useEffect6(() => {
    if (tabParam && DETAIL_TABS.some((t) => t.key === tabParam)) setTab(tabParam);
  }, [tabParam]);
  const [infoOpen, setInfoOpen] = useState6(false);
  const [info, setInfo] = useState6({
    name: m.name,
    version: m.version,
    algoType: m.algoType,
    enabled: m.enabled,
    range0: m.range[0],
    range1: m.range[1]
  });
  useEffect6(() => {
    setInfo({
      name: m.name,
      version: m.version,
      algoType: m.algoType,
      enabled: m.enabled,
      range0: m.range[0],
      range1: m.range[1]
    });
  }, [prod]);
  const openInfo = () => {
    setInfo({
      name: m.name,
      version: m.version,
      algoType: m.algoType,
      enabled: m.enabled,
      range0: m.range[0],
      range1: m.range[1]
    });
    setInfoOpen(true);
  };
  const saveInfo = () => updateScore((d) => ({
    ...d,
    models: d.models.map(
      (mm) => mm.prod === prod ? {
        ...mm,
        name: info.name,
        version: info.version,
        algoType: info.algoType,
        enabled: info.enabled,
        range: [Number(info.range0), Number(info.range1)]
      } : mm
    )
  }));
  const [onlineOpen, setOnlineOpen] = useState6(false);
  const [onlineVer, setOnlineVer] = useState6(m.version);
  const [onlineNote, setOnlineNote] = useState6("");
  const [algoTab, setAlgoTab] = useState6("visual");
  const [code, setCode] = useState6(m.algoCode);
  useEffect6(() => {
    setCode(m.algoCode);
  }, [prod]);
  const saveCode = () => updateScore((d) => ({
    ...d,
    models: d.models.map((mm) => mm.prod === prod ? { ...mm, algoCode: code } : mm)
  }));
  const rollback = (ver) => updateScore((d) => ({
    ...d,
    models: d.models.map(
      (mm) => mm.prod === prod ? { ...mm, versions: mm.versions.map((v) => ({ ...v, current: v.version === ver })) } : mm
    )
  }));
  const verCols = [
    { key: "version", label: "\u7248\u672C", width: "110px" },
    { key: "date", label: "\u65E5\u671F", width: "130px" },
    { key: "note", label: "\u66F4\u65B0\u8BF4\u660E" },
    { key: "current", label: "\u5F53\u524D", type: "badge", badgeKind: "green", width: "90px" },
    {
      key: "op",
      label: "\u64CD\u4F5C",
      width: "90px",
      render: (r) => {
        const ver = r.id;
        const v = m.versions.find((x) => x.version === ver);
        return v.current ? /* @__PURE__ */ jsx6("span", { className: "text-xs text-slate-300", children: "\u2014" }) : /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "ghost", onClick: () => rollback(ver), children: "\u56DE\u6EDA" });
      }
    }
  ];
  const verRows = m.versions.map((v) => ({
    id: v.version,
    version: v.version,
    date: v.date,
    note: v.note,
    current: v.current ? { v: "\u5F53\u524D", kind: "green" } : { v: "\u5386\u53F2", kind: "gray" }
  }));
  const current = m.versions.find((v) => v.current);
  const [thEditId, setThEditId] = useState6(null);
  const [thAction, setThAction] = useState6("");
  const [thNewOpen, setThNewOpen] = useState6(false);
  const [thDraft, setThDraft] = useState6({ range: "", level: "", meaning: "", action: "" });
  const thKey = (t) => `${t.prod}|${t.range}|${t.level}`;
  const thRows = data2.thresholds.filter((t) => t.prod === prod).map((t) => ({ id: thKey(t), range: t.range, level: { v: t.level, kind: levelKind(t.level) }, meaning: t.meaning, action: t.action }));
  const thCols = [
    { key: "range", label: "\u5206\u6570\u533A\u95F4", width: "160px" },
    { key: "level", label: "\u7B49\u7EA7", type: "badge", badgeKind: "gray", width: "120px" },
    { key: "meaning", label: "\u542B\u4E49" },
    {
      key: "action",
      label: "\u5EFA\u8BAE\u52A8\u4F5C",
      render: (r) => {
        const id = r.id;
        if (thEditId === id) {
          return /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx6(
              "input",
              {
                value: thAction,
                onChange: (e) => setThAction(e.target.value),
                className: "w-40 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400"
              }
            ),
            /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "primary", onClick: () => {
              updateScore((d) => ({ ...d, thresholds: d.thresholds.map((t) => thKey(t) === id ? { ...t, action: thAction } : t) }));
              setThEditId(null);
            }, children: "\u4FDD\u5B58" }),
            /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "ghost", onClick: () => setThEditId(null), children: "\u53D6\u6D88" })
          ] });
        }
        return /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx6("span", { className: "text-sm", children: r.action }),
          /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "ghost", onClick: () => {
            const [p, range, level] = id.split("|");
            const t = data2.thresholds.find((x) => x.prod === p && x.range === range && x.level === level);
            setThAction(t.action);
            setThEditId(id);
          }, children: "\u7F16\u8F91" })
        ] });
      }
    }
  ];
  const confirmThNew = () => {
    const range = thDraft.range.trim();
    const level = thDraft.level.trim();
    if (!range || !level) return;
    updateScore((d) => ({ ...d, thresholds: [...d.thresholds, { prod, range, level, meaning: thDraft.meaning.trim(), action: thDraft.action.trim() }] }));
    setThNewOpen(false);
  };
  const [arOpen, setArOpen] = useState6(false);
  const [arForm, setArForm] = useState6({ name: "", cond: "", threshold: 0, level: "\u4E2D" });
  const toggleRule = (id) => updateScore((d) => ({ ...d, alertRules: d.alertRules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r) }));
  const addRule = () => {
    updateScore((d) => ({
      ...d,
      alertRules: [
        ...d.alertRules,
        { id: `AR-${Date.now()}`, name: arForm.name || "\u672A\u547D\u540D\u89C4\u5219", cond: arForm.cond || "\u81EA\u5B9A\u4E49\u6761\u4EF6", threshold: Number(arForm.threshold) || 0, level: arForm.level, enabled: true }
      ]
    }));
    setArForm({ name: "", cond: "", threshold: 0, level: "\u4E2D" });
    setArOpen(false);
  };
  const arCols = [
    { key: "name", label: "\u89C4\u5219\u540D\u79F0", width: "200px" },
    { key: "cond", label: "\u6761\u4EF6", width: "260px" },
    { key: "threshold", label: "\u9608\u503C", type: "text", width: "100px" },
    { key: "level", label: "\u7B49\u7EA7", type: "badge", badgeKind: "gray", width: "100px" },
    { key: "status", label: "\u751F\u6548\u72B6\u6001", type: "badge", badgeKind: "gray", width: "100px" },
    {
      key: "op",
      label: "\u64CD\u4F5C",
      width: "100px",
      render: (r) => {
        const r0 = data2.alertRules.find((x) => x.id === r.id);
        return /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "ghost", onClick: () => toggleRule(r0.id), children: r0.enabled ? "\u505C\u7528" : "\u542F\u7528" });
      }
    }
  ];
  const arRows = data2.alertRules.map((r) => ({
    id: r.id,
    name: r.name,
    cond: r.cond,
    threshold: r.threshold,
    level: { v: r.level, kind: alertLevelKind(r.level) },
    status: r.enabled ? { v: "\u542F\u7528", kind: "green" } : { v: "\u505C\u7528", kind: "gray" }
  }));
  const ops = data2.ops.find((x) => x.prod === prod);
  return /* @__PURE__ */ jsxs6(Fragment7, { children: [
    /* @__PURE__ */ jsx6(
      PageShell,
      {
        title: m.name,
        subtitle: `${SCORE_PROD_LABEL[m.prod]} \xB7 \u6A21\u578B\u8BE6\u60C5\uFF08\u57FA\u672C\u4FE1\u606F / \u7B97\u6CD5\u7F16\u8F91 / \u6A21\u578B\u6548\u679C / \u8BC4\u5206\u9608\u503C / \u9884\u8B66\u89C4\u5219 / \u7248\u672C\u65E5\u5FD7\uFF09`,
        crumb: "\u8BC4\u5206\u4EA7\u54C1 / \u6A21\u578B\u7BA1\u7406",
        actions: /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "secondary", onClick: () => nav("/console/sc/model-manage"), children: "\u2190 \u8FD4\u56DE\u6A21\u578B\u5217\u8868" })
      }
    ),
    /* @__PURE__ */ jsxs6("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx6("div", { className: "flex flex-wrap gap-1 border-b border-slate-100 pb-2", children: DETAIL_TABS.map((t) => /* @__PURE__ */ jsx6(
        "button",
        {
          onClick: () => setTab(t.key),
          className: `rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${tab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`,
          children: t.label
        },
        t.key
      )) }),
      tab === "base" && /* @__PURE__ */ jsxs6(Fragment7, { children: [
        /* @__PURE__ */ jsx6(
          Panel,
          {
            title: "\u57FA\u672C\u4FE1\u606F",
            desc: infoOpen ? "\u7F16\u8F91\u540E\u70B9\u51FB\u4FDD\u5B58" : "\u70B9\u51FB\u300C\u5C55\u5F00\u7F16\u8F91\u300D\u4FEE\u6539\u6A21\u578B\u4FE1\u606F",
            actions: infoOpen ? /* @__PURE__ */ jsxs6("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "primary", onClick: saveInfo, children: "\u4FDD\u5B58" }),
              /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "ghost", onClick: () => setInfoOpen(false), children: "\u6536\u8D77" })
            ] }) : /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "ghost", onClick: openInfo, children: "\u5C55\u5F00\u7F16\u8F91" }),
            children: infoOpen ? /* @__PURE__ */ jsxs6("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
              /* @__PURE__ */ jsx6(Field, { label: "\u6A21\u578B\u540D\u79F0", children: /* @__PURE__ */ jsx6("input", { className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400", value: info.name, onChange: (e) => setInfo({ ...info, name: e.target.value }) }) }),
              /* @__PURE__ */ jsx6(Field, { label: "\u7B97\u6CD5\u7C7B\u578B", children: /* @__PURE__ */ jsx6("input", { className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400", value: info.algoType, onChange: (e) => setInfo({ ...info, algoType: e.target.value }) }) }),
              /* @__PURE__ */ jsx6(Field, { label: "\u7248\u672C", children: /* @__PURE__ */ jsx6("input", { className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400", value: info.version, onChange: (e) => setInfo({ ...info, version: e.target.value }) }) }),
              /* @__PURE__ */ jsx6(Field, { label: "\u5206\u6570\u533A\u95F4", children: /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx6("input", { className: "w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400", value: info.range0, onChange: (e) => setInfo({ ...info, range0: e.target.value }) }),
                /* @__PURE__ */ jsx6("span", { className: "text-slate-400", children: "\u2013" }),
                /* @__PURE__ */ jsx6("input", { className: "w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400", value: info.range1, onChange: (e) => setInfo({ ...info, range1: e.target.value }) })
              ] }) }),
              /* @__PURE__ */ jsx6(Field, { label: "\u542F\u7528\u72B6\u6001", children: /* @__PURE__ */ jsx6(
                "button",
                {
                  onClick: () => setInfo({ ...info, enabled: !info.enabled }),
                  className: `rounded-lg px-3 py-1.5 text-sm font-medium ${info.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`,
                  children: info.enabled ? "\u5DF2\u542F\u7528\uFF08\u70B9\u51FB\u505C\u7528\uFF09" : "\u5DF2\u505C\u7528\uFF08\u70B9\u51FB\u542F\u7528\uFF09"
                }
              ) })
            ] }) : /* @__PURE__ */ jsxs6("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: [
              /* @__PURE__ */ jsxs6("div", { children: [
                /* @__PURE__ */ jsx6("div", { className: "text-xs text-slate-400", children: "\u5F53\u524D\u5F97\u5206" }),
                /* @__PURE__ */ jsx6("div", { className: "text-2xl font-bold tabular-nums", style: { color }, children: m.score })
              ] }),
              /* @__PURE__ */ jsxs6("div", { children: [
                /* @__PURE__ */ jsx6("div", { className: "text-xs text-slate-400", children: "\u5206\u6570\u533A\u95F4" }),
                /* @__PURE__ */ jsxs6("div", { className: "mt-1 text-sm", children: [
                  m.range[0],
                  " \u2013 ",
                  m.range[1]
                ] })
              ] }),
              /* @__PURE__ */ jsxs6("div", { children: [
                /* @__PURE__ */ jsx6("div", { className: "text-xs text-slate-400", children: "\u7248\u672C" }),
                /* @__PURE__ */ jsx6("div", { className: "mt-1 text-sm", children: m.version })
              ] }),
              /* @__PURE__ */ jsxs6("div", { children: [
                /* @__PURE__ */ jsx6("div", { className: "text-xs text-slate-400", children: "\u66F4\u65B0\u65F6\u95F4" }),
                /* @__PURE__ */ jsx6("div", { className: "mt-1 text-sm", children: m.updatedAt })
              ] }),
              /* @__PURE__ */ jsxs6("div", { className: "col-span-2 md:col-span-4 flex items-center gap-3", children: [
                /* @__PURE__ */ jsx6(Badge, { kind: m.enabled ? "green" : "gray", children: m.enabled ? "\u5DF2\u542F\u7528" : "\u5DF2\u505C\u7528" }),
                /* @__PURE__ */ jsx6("span", { className: "text-sm text-slate-500", children: m.algoType })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsx6(
          Panel,
          {
            title: "\u4E0A\u7EBF\u7BA1\u7406",
            desc: "\u6A21\u578B\u6295\u4EA7\u4E0E\u4E0B\u7EBF\u63A7\u5236\uFF1B\u4E0A\u7EBF\u65F6\u53EF\u6307\u5B9A\u7248\u672C\u4E0E\u53D8\u66F4\u5185\u5BB9\uFF0C\u81EA\u52A8\u8BB0\u5165\u7248\u672C\u65E5\u5FD7",
            actions: /* @__PURE__ */ jsx6(Cfg, { value: "scoreData.json" }),
            children: /* @__PURE__ */ jsxs6("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsx6(Badge, { kind: m.enabled ? "green" : "gray", children: m.enabled ? "\u5DF2\u4E0A\u7EBF" : "\u5DF2\u4E0B\u7EBF" }),
              /* @__PURE__ */ jsxs6("span", { className: "text-sm text-slate-500", children: [
                "\u5F53\u524D\u7248\u672C ",
                m.version
              ] }),
              /* @__PURE__ */ jsx6("div", { className: "flex-1" }),
              m.enabled ? /* @__PURE__ */ jsx6(
                Button,
                {
                  size: "sm",
                  variant: "secondary",
                  onClick: () => updateScore((d) => ({
                    ...d,
                    models: d.models.map((mm) => mm.prod === prod ? { ...mm, enabled: false } : mm)
                  })),
                  children: "\u4E0B\u7EBF"
                }
              ) : /* @__PURE__ */ jsx6(
                Button,
                {
                  size: "sm",
                  variant: "primary",
                  onClick: () => {
                    setOnlineVer(m.version);
                    setOnlineNote("");
                    setOnlineOpen(true);
                  },
                  children: "\u4E0A\u7EBF"
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsx6(Panel, { title: "\u90E8\u7F72\u4E0E\u5BF9\u63A5", desc: "\u6A21\u578B\u751F\u4EA7\u5316\u5BF9\u63A5\u65B9\u5F0F\uFF08\u53EA\u8BFB\uFF09", actions: /* @__PURE__ */ jsx6(Cal, {}), children: /* @__PURE__ */ jsxs6("dl", { className: "grid grid-cols-1 gap-x-8 gap-y-2 text-sm md:grid-cols-2", children: [
          /* @__PURE__ */ jsx6(Def, { k: "\u670D\u52A1\u5730\u5740", v: `POST /api/score/${m.prod}` }),
          /* @__PURE__ */ jsx6(Def, { k: "\u8C03\u7528\u65B9\u5F0F", v: "\u5B9E\u65F6 API / \u6279\u91CF\u6587\u4EF6" }),
          /* @__PURE__ */ jsx6(Def, { k: "\u7248\u672C\u6807\u8BC6", v: "\u8BF7\u6C42\u5934 x-model-version" }),
          /* @__PURE__ */ jsx6(Def, { k: "\u7070\u5EA6\u53D1\u5E03", v: "\u51A0\u519B / \u6311\u6218\u8005\uFF08Champion-Challenger\uFF09" }),
          /* @__PURE__ */ jsx6(Def, { k: "\u76D1\u63A7\u6307\u6807", v: `PSI \u2265 0.25 \u89E6\u53D1\u81EA\u52A8\u56DE\u6EDA` }),
          /* @__PURE__ */ jsx6(Def, { k: "\u5F53\u524D\u7EBF\u4E0A\u7248\u672C", v: current?.version ?? "\u2014" })
        ] }) }),
        /* @__PURE__ */ jsx6(Panel, { title: "\u7248\u672C\u65E5\u5FD7", desc: "\u672C\u6A21\u578B\u7248\u672C\u5386\u53F2\uFF0C\u53EF\u56DE\u6EDA\u81F3\u5386\u53F2\u7248\u672C", actions: /* @__PURE__ */ jsx6(Cfg, { value: "scoreData.json" }), children: /* @__PURE__ */ jsx6(DataTable, { columns: verCols, rows: verRows, empty: "\u6682\u65E0\u7248\u672C", pager: true, defaultPageSize: 10 }) })
      ] }),
      tab === "algo" && /* ===== 算法编辑 ===== */
      /* @__PURE__ */ jsxs6(
        Panel,
        {
          title: "\u7B97\u6CD5\u7F16\u8F91",
          desc: "\u4EE5\u300C\u53EF\u89C6\u5316\u300D\u67E5\u770B\u672C\u6A21\u578B\u771F\u5B9E\u8BA1\u7B97\u94FE\u8DEF\uFF08\u6570\u636E\u6E90 \u2192 \u7B97\u6CD5\u4E0E\u56E0\u5B50 \u2192 \u89C4\u5219\u96C6 \u2192 \u8F93\u51FA\u5206\u6570 \u2192 \u51B3\u7B56\u6620\u5C04\uFF09\uFF0C\u6216\u4EE5\u300C\u4EE3\u7801\u300D\u67E5\u770B\u6A21\u578B\u7B97\u6CD5\uFF08Model-as-Code\uFF09",
          actions: /* @__PURE__ */ jsxs6("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx6(Button, { size: "sm", variant: algoTab === "visual" ? "primary" : "secondary", onClick: () => setAlgoTab("visual"), children: "\u53EF\u89C6\u5316" }),
            /* @__PURE__ */ jsx6(Button, { size: "sm", variant: algoTab === "code" ? "primary" : "secondary", onClick: () => setAlgoTab("code"), children: "\u4EE3\u7801" })
          ] }),
          children: [
            algoTab === "visual" ? /* @__PURE__ */ jsx6("div", { children: /* @__PURE__ */ jsx6(
              ModelDecisionGraph,
              {
                prod: m.prod,
                model: m,
                thresholds: data2.thresholds,
                graph: m.decisionGraph ?? (m.prod === "zhixin" ? PIPELINE_GRAPHS.zhixin_credit_v1 : void 0),
                onJumpRules: () => nav("/console/cm/rule-hub"),
                onJumpStrategy: () => nav("/console/sc/model-detail?prod=" + prod + "&tab=threshold"),
                onSaveCollisions: (rules) => updateScore((d) => ({
                  ...d,
                  models: d.models.map((mm) => mm.prod === prod ? { ...mm, collisionRules: rules } : mm)
                })),
                editable: true,
                onSaveGraph: (g) => updateScore((d) => ({
                  ...d,
                  models: d.models.map((mm) => mm.prod === prod ? { ...mm, decisionGraph: g } : mm)
                }))
              }
            ) }) : /* @__PURE__ */ jsxs6("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs6("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs6("span", { className: "text-xs text-slate-400", children: [
                  m.name,
                  " \xB7 \u7B97\u6CD5\u4EE3\u7801\uFF08Python\uFF09"
                ] }),
                /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "primary", onClick: saveCode, children: "\u4FDD\u5B58\u4EE3\u7801" })
              ] }),
              /* @__PURE__ */ jsx6(
                "textarea",
                {
                  value: code,
                  onChange: (e) => setCode(e.target.value),
                  spellCheck: false,
                  className: "h-72 w-full rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100 outline-none focus:border-brand-400"
                }
              )
            ] }),
            /* @__PURE__ */ jsx6("div", { className: "mt-3", children: /* @__PURE__ */ jsx6(Cfg, { value: "scoreData.json" }) })
          ]
        }
      ),
      tab === "effect" && /* ===== 模型效果（本模型） ===== */
      /* @__PURE__ */ jsxs6(Fragment7, { children: [
        /* @__PURE__ */ jsxs6(Panel, { title: "\u6A21\u578B\u6548\u679C", desc: `${SCORE_PROD_LABEL[prod]} \xB7 \u8FD0\u8425\u6548\u679C\u6307\u6807\u4E0E 6 \u4E2A\u6708\u8D8B\u52BF\uFF08\u5355\u6A21\u578B\u89C6\u89D2\uFF1B\u4E09\u6A21\u578B\u6A2A\u5411\u5BF9\u6BD4\u89C1\u300C\u6A21\u578B\u6548\u679C\u300D\u9875\uFF09`, actions: /* @__PURE__ */ jsxs6(Fragment7, { children: [
          /* @__PURE__ */ jsx6(Cal, {}),
          /* @__PURE__ */ jsx6(Sam, { value: "scoreData.json" })
        ] }), children: [
          /* @__PURE__ */ jsxs6("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: [
            /* @__PURE__ */ jsxs6("div", { children: [
              /* @__PURE__ */ jsx6("div", { className: "text-xs text-slate-400", children: "\u8BC4\u5206\u8986\u76D6\u7387" }),
              /* @__PURE__ */ jsxs6("div", { className: "text-2xl font-bold tabular-nums", style: { color }, children: [
                ops.coverage,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs6("div", { children: [
              /* @__PURE__ */ jsx6("div", { className: "text-xs text-slate-400", children: "\u9884\u8B66\u51C6\u786E\u7387" }),
              /* @__PURE__ */ jsxs6("div", { className: "text-2xl font-bold tabular-nums", style: { color }, children: [
                ops.accuracy,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs6("div", { children: [
              /* @__PURE__ */ jsx6("div", { className: "text-xs text-slate-400", children: "\u5904\u7F6E\u53CA\u65F6\u7387" }),
              /* @__PURE__ */ jsxs6("div", { className: "text-2xl font-bold tabular-nums", style: { color }, children: [
                ops.timely,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs6("div", { children: [
              /* @__PURE__ */ jsx6("div", { className: "text-xs text-slate-400", children: "\u672C\u6708\u8C03\u7528" }),
              /* @__PURE__ */ jsx6("div", { className: "text-2xl font-bold tabular-nums", style: { color }, children: ops.calls.toLocaleString() })
            ] })
          ] }),
          /* @__PURE__ */ jsxs6("div", { className: "mt-4 flex items-center gap-2 border-t border-slate-100 pt-3", children: [
            /* @__PURE__ */ jsx6("span", { className: "text-xs text-slate-500", children: "PSI" }),
            /* @__PURE__ */ jsxs6(Badge, { kind: PSI_KIND[ops.psiStatus], children: [
              ops.psi,
              " \xB7 ",
              ops.psiStatus
            ] }),
            /* @__PURE__ */ jsx6("span", { className: "text-xs text-slate-400", children: "PSI \u2265 0.25 \u89E6\u53D1\u6F02\u79FB\u9884\u8B66" }),
            /* @__PURE__ */ jsx6("div", { className: "flex-1" }),
            /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "ghost", onClick: () => nav("/console/sc/model-effect"), children: "\u67E5\u770B\u4E09\u6A21\u578B\u5BF9\u6BD4 \u2192" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs6("div", { className: "grid gap-4 lg:grid-cols-2", children: [
          /* @__PURE__ */ jsx6(Panel, { title: "\u8986\u76D6\u7387 / \u51C6\u786E\u7387\u8D8B\u52BF", actions: /* @__PURE__ */ jsx6(Cal, {}), children: /* @__PURE__ */ jsx6(
            LineChart,
            {
              labels: ops.trend.map((t) => t.month),
              series: [
                { name: "\u8986\u76D6\u7387", color: MODEL_COLOR[prod], data: ops.trend.map((t) => t.coverage) },
                { name: "\u51C6\u786E\u7387", color: "#3b82f6", data: ops.trend.map((t) => t.accuracy) }
              ],
              unit: "%",
              height: 220
            }
          ) }),
          /* @__PURE__ */ jsx6(Panel, { title: "\u53CA\u65F6\u7387 / \u8C03\u7528\u91CF\u8D8B\u52BF", actions: /* @__PURE__ */ jsx6(Cal, {}), children: /* @__PURE__ */ jsx6(
            LineChart,
            {
              labels: ops.trend.map((t) => t.month),
              series: [
                { name: "\u53CA\u65F6\u7387", color: "#8b5cf6", data: ops.trend.map((t) => t.timely) },
                { name: "\u8C03\u7528\u91CF", color: "#f59e0b", data: ops.trend.map((t) => t.calls) }
              ],
              height: 220
            }
          ) })
        ] })
      ] }),
      tab === "threshold" && /* ===== 评分阈值（本模型） ===== */
      /* @__PURE__ */ jsx6(
        Panel,
        {
          title: `\u8BC4\u5206\u9608\u503C\u914D\u7F6E \xB7 ${SCORE_PROD_LABEL[prod]}`,
          desc: "\u5206\u6570\u533A\u95F4 \u2192 \u7B49\u7EA7 \u2192 \u542B\u4E49 \u2192 \u5EFA\u8BAE\u52A8\u4F5C\uFF08\u672C\u6A21\u578B\u8F93\u51FA\u6620\u5C04\uFF0C\u968F\u6A21\u578B\u7BA1\u7406\uFF09",
          actions: /* @__PURE__ */ jsxs6(Fragment7, { children: [
            /* @__PURE__ */ jsx6(Cfg, { value: "scoreData.json" }),
            /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "primary", onClick: () => {
              setThDraft({ range: "", level: "", meaning: "", action: "" });
              setThNewOpen(true);
            }, children: "\u65B0\u589E\u9608\u503C" })
          ] }),
          children: /* @__PURE__ */ jsx6(DataTable, { columns: thCols, rows: thRows, empty: "\u6682\u65E0\u9608\u503C", pager: true, defaultPageSize: 10 })
        }
      ),
      tab === "alert" && /* ===== 预警规则（全局） ===== */
      /* @__PURE__ */ jsx6(
        Panel,
        {
          title: "\u9884\u8B66\u89C4\u5219",
          desc: "\u5206\u503C\u9608\u503C\u9884\u8B66\u4E0E\u89C4\u5219\u547D\u4E2D\u9884\u8B66\u7684\u89E6\u53D1\u6761\u4EF6\uFF08\u5168\u5C40\u89C4\u5219\uFF0C\u4F5C\u7528\u4E8E\u5168\u90E8\u4E09\u4E2A\u6A21\u578B\uFF09",
          actions: /* @__PURE__ */ jsxs6(Fragment7, { children: [
            /* @__PURE__ */ jsx6(Cfg, { value: "scoreData.json" }),
            /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "primary", onClick: () => setArOpen(true), children: "\u65B0\u589E\u89C4\u5219" })
          ] }),
          children: /* @__PURE__ */ jsx6(DataTable, { columns: arCols, rows: arRows, empty: "\u6682\u65E0\u89C4\u5219", pager: true, defaultPageSize: 10 })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs6(Modal, { open: onlineOpen, onClose: () => setOnlineOpen(false), title: `\u4E0A\u7EBF \xB7 ${SCORE_PROD_LABEL[prod]}`, children: [
      /* @__PURE__ */ jsxs6("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs6("label", { className: "block", children: [
          /* @__PURE__ */ jsx6("span", { className: "mb-1 block text-xs text-slate-400", children: "\u4E0A\u7EBF\u7248\u672C" }),
          /* @__PURE__ */ jsx6(
            "input",
            {
              value: onlineVer,
              onChange: (e) => setOnlineVer(e.target.value),
              placeholder: "\u5982 v2.3.1",
              className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs6("label", { className: "block", children: [
          /* @__PURE__ */ jsx6("span", { className: "mb-1 block text-xs text-slate-400", children: "\u53D8\u66F4\u5185\u5BB9" }),
          /* @__PURE__ */ jsx6(
            "textarea",
            {
              value: onlineNote,
              onChange: (e) => setOnlineNote(e.target.value),
              placeholder: "\u672C\u6B21\u4E0A\u7EBF\u7684\u4E3B\u8981\u53D8\u66F4\u8BF4\u660E\uFF08\u5C06\u8BB0\u5165\u7248\u672C\u65E5\u5FD7\uFF09",
              className: "h-24 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs6("div", { className: "mt-4 flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "ghost", onClick: () => setOnlineOpen(false), children: "\u53D6\u6D88" }),
        /* @__PURE__ */ jsx6(
          Button,
          {
            size: "sm",
            variant: "primary",
            onClick: () => {
              const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
              const ver = onlineVer.trim() || m.version;
              updateScore((d) => ({
                ...d,
                models: d.models.map(
                  (mm) => mm.prod === prod ? {
                    ...mm,
                    enabled: true,
                    version: ver,
                    versions: [
                      { version: ver, date: today, note: onlineNote.trim() || "\u4E0A\u7EBF\u6295\u4EA7", current: true },
                      ...mm.versions.map((v) => ({ ...v, current: false }))
                    ]
                  } : mm
                )
              }));
              setOnlineOpen(false);
            },
            children: "\u786E\u8BA4\u4E0A\u7EBF"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs6(Modal, { open: thNewOpen, onClose: () => setThNewOpen(false), title: `\u65B0\u589E\u9608\u503C \xB7 ${SCORE_PROD_LABEL[prod]}`, children: [
      /* @__PURE__ */ jsxs6("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs6("label", { className: "block", children: [
          /* @__PURE__ */ jsx6("span", { className: "mb-1 block text-xs text-slate-400", children: "\u5206\u6570\u533A\u95F4\uFF08\u5982 0-40 / 41-69\uFF09" }),
          /* @__PURE__ */ jsx6(
            "input",
            {
              value: thDraft.range,
              onChange: (e) => setThDraft({ ...thDraft, range: e.target.value }),
              placeholder: "0-40",
              className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs6("label", { className: "block", children: [
          /* @__PURE__ */ jsx6("span", { className: "mb-1 block text-xs text-slate-400", children: "\u7B49\u7EA7\uFF08\u5982 \u9AD8 / \u4E2D / \u4F4E \u6216 A-E\uFF09" }),
          /* @__PURE__ */ jsx6(
            "input",
            {
              value: thDraft.level,
              onChange: (e) => setThDraft({ ...thDraft, level: e.target.value }),
              placeholder: "\u9AD8",
              className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs6("label", { className: "block", children: [
          /* @__PURE__ */ jsx6("span", { className: "mb-1 block text-xs text-slate-400", children: "\u542B\u4E49" }),
          /* @__PURE__ */ jsx6(
            "input",
            {
              value: thDraft.meaning,
              onChange: (e) => setThDraft({ ...thDraft, meaning: e.target.value }),
              placeholder: "\u6B3A\u8BC8\u98CE\u9669\u6781\u9AD8\uFF0C\u76F4\u63A5\u62D2\u7EDD",
              className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs6("label", { className: "block", children: [
          /* @__PURE__ */ jsx6("span", { className: "mb-1 block text-xs text-slate-400", children: "\u5EFA\u8BAE\u52A8\u4F5C" }),
          /* @__PURE__ */ jsx6(
            "input",
            {
              value: thDraft.action,
              onChange: (e) => setThDraft({ ...thDraft, action: e.target.value }),
              placeholder: "\u62D2\u7EDD / \u5BA1\u614E\u6388\u4FE1 / \u6807\u51C6\u989D\u5EA6",
              className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs6("div", { className: "mt-4 flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "ghost", onClick: () => setThNewOpen(false), children: "\u53D6\u6D88" }),
        /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "primary", onClick: confirmThNew, children: "\u786E\u8BA4\u65B0\u589E" })
      ] })
    ] }),
    /* @__PURE__ */ jsx6(Modal, { open: arOpen, onClose: () => setArOpen(false), title: "\u65B0\u589E\u9884\u8B66\u89C4\u5219", children: /* @__PURE__ */ jsxs6("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs6("label", { className: "block", children: [
        /* @__PURE__ */ jsx6("span", { className: "text-sm text-slate-500", children: "\u89C4\u5219\u540D\u79F0" }),
        /* @__PURE__ */ jsx6("input", { value: arForm.name, onChange: (e) => setArForm((f) => ({ ...f, name: e.target.value })), className: "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" })
      ] }),
      /* @__PURE__ */ jsxs6("label", { className: "block", children: [
        /* @__PURE__ */ jsx6("span", { className: "text-sm text-slate-500", children: "\u6761\u4EF6" }),
        /* @__PURE__ */ jsx6("input", { value: arForm.cond, onChange: (e) => setArForm((f) => ({ ...f, cond: e.target.value })), className: "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" })
      ] }),
      /* @__PURE__ */ jsxs6("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs6("label", { className: "block", children: [
          /* @__PURE__ */ jsx6("span", { className: "text-sm text-slate-500", children: "\u9608\u503C" }),
          /* @__PURE__ */ jsx6("input", { type: "number", value: arForm.threshold, onChange: (e) => setArForm((f) => ({ ...f, threshold: Number(e.target.value) })), className: "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" })
        ] }),
        /* @__PURE__ */ jsxs6("label", { className: "block", children: [
          /* @__PURE__ */ jsx6("span", { className: "text-sm text-slate-500", children: "\u7B49\u7EA7" }),
          /* @__PURE__ */ jsxs6("select", { value: arForm.level, onChange: (e) => setArForm((f) => ({ ...f, level: e.target.value })), className: "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400", children: [
            /* @__PURE__ */ jsx6("option", { value: "\u9AD8", children: "\u9AD8" }),
            /* @__PURE__ */ jsx6("option", { value: "\u4E2D", children: "\u4E2D" }),
            /* @__PURE__ */ jsx6("option", { value: "\u4F4E", children: "\u4F4E" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs6("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsx6(Button, { variant: "ghost", onClick: () => setArOpen(false), children: "\u53D6\u6D88" }),
        /* @__PURE__ */ jsx6(Button, { variant: "primary", onClick: addRule, children: "\u786E\u8BA4\u65B0\u589E" })
      ] })
    ] }) })
  ] });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxs6("div", { children: [
    /* @__PURE__ */ jsx6("div", { className: "mb-1 text-xs text-slate-400", children: label }),
    children
  ] });
}
function Def({ k, v }) {
  return /* @__PURE__ */ jsxs6("div", { className: "flex justify-between border-b border-slate-50 py-1.5", children: [
    /* @__PURE__ */ jsx6("dt", { className: "text-slate-500", children: k }),
    /* @__PURE__ */ jsx6("dd", { className: "font-medium text-ink-900", children: v })
  ] });
}
export {
  ScoreModelDetailPage as default
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
