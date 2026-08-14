// src/console/CustScoreDetail.tsx
import { useMemo as useMemo5, useState as useState9 } from "react";

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

// src/components/ScoreGauge.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function ScoreGauge({
  value,
  min,
  max,
  label,
  color = "#3366ff",
  hint
}) {
  const radius = 70;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const dash = circumference * pct;
  return /* @__PURE__ */ jsxs3("div", { className: "flex flex-col items-center", children: [
    /* @__PURE__ */ jsxs3("div", { className: "relative grid place-items-center", children: [
      /* @__PURE__ */ jsxs3("svg", { width: "180", height: "180", viewBox: "0 0 180 180", className: "-rotate-90", children: [
        /* @__PURE__ */ jsx3(
          "circle",
          {
            cx: "90",
            cy: "90",
            r: radius,
            fill: "none",
            stroke: "#eef2ff",
            strokeWidth: stroke
          }
        ),
        /* @__PURE__ */ jsx3(
          "circle",
          {
            cx: "90",
            cy: "90",
            r: radius,
            fill: "none",
            stroke: color,
            strokeWidth: stroke,
            strokeLinecap: "round",
            strokeDasharray: `${dash} ${circumference - dash}`,
            style: { transition: "stroke-dasharray 1.2s cubic-bezier(.16,1,.3,1)" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "absolute flex flex-col items-center", children: [
        /* @__PURE__ */ jsx3("span", { className: "text-4xl font-bold tabular-nums text-ink-900", children: value }),
        /* @__PURE__ */ jsxs3("span", { className: "text-xs text-slate-400", children: [
          min,
          " \u2013 ",
          max
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx3("p", { className: "mt-3 text-sm font-semibold text-ink-900", children: label }),
    hint && /* @__PURE__ */ jsx3("p", { className: "mt-1 text-xs text-slate-500", children: hint })
  ] });
}

// src/components/charts.tsx
import { useState as useState4, useRef as useRef4, useEffect as useEffect4 } from "react";
import { Fragment as Fragment4, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
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

// src/console/PageShell.tsx
import { Fragment as Fragment5, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function PageShell({
  title,
  subtitle,
  crumb,
  actions,
  header,
  legend = true
}) {
  return /* @__PURE__ */ jsxs5(Fragment5, { children: [
    header ?? /* @__PURE__ */ jsx5(PageHeader, { title: title ?? "", subtitle, crumb, actions }),
    legend && /* @__PURE__ */ jsx5(SourceTagLegend, {})
  ] });
}

// src/console/midStore.ts
import { useSyncExternalStore as useSyncExternalStore2 } from "react";

// src/console/midDashboardSeed.ts
var SEED_DASHBOARDS = [
  {
    "id": "db-001",
    "key": "cr:mid-p1",
    "name": "\u5BA2\u7FA4\u753B\u50CF\u603B\u89C8",
    "group": "\u5BA2\u7FA4",
    "order": 0,
    "enabled": true,
    "desc": "\u5BA2\u7FA4\u753B\u50CF\u603B\u89C8\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u5BA2\u7FA4\u753B\u50CF\u603B\u89C8\xB7risk_level\u5206\u5E03",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u672C\u6708\u65B0\u589E\u5BA2\u6237\u6570",
        "datasetId": "ds_customer",
        "metricId": "m_new_cust",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u5BA2\u7FA4\u753B\u50CF\u603B\u89C8\u660E\u7EC6",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-002",
    "key": "cr:mid-p2",
    "name": "\u65B0\u5BA2\u83B7\u53D6\u5206\u6790",
    "group": "\u5BA2\u7FA4",
    "order": 1,
    "enabled": true,
    "desc": "\u65B0\u5BA2\u83B7\u53D6\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u65B0\u5BA2\u83B7\u53D6\u5206\u6790\xB7risk_level\u5206\u5E03",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u672C\u6708\u65B0\u589E\u5BA2\u6237\u6570",
        "datasetId": "ds_customer",
        "metricId": "m_new_cust",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u65B0\u5BA2\u83B7\u53D6\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-003",
    "key": "cr:mid-p3",
    "name": "\u6D3B\u8DC3\u5BA2\u7FA4\u76D1\u63A7",
    "group": "\u5BA2\u7FA4",
    "order": 2,
    "enabled": true,
    "desc": "\u6D3B\u8DC3\u5BA2\u7FA4\u76D1\u63A7\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u6D3B\u8DC3\u5BA2\u7FA4\u76D1\u63A7\xB7risk_level\u5206\u5E03",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u672C\u6708\u65B0\u589E\u5BA2\u6237\u6570",
        "datasetId": "ds_customer",
        "metricId": "m_new_cust",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u6D3B\u8DC3\u5BA2\u7FA4\u76D1\u63A7\u660E\u7EC6",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-004",
    "key": "cr:mid-p4",
    "name": "\u5BA2\u7FA4\u5206\u5C42\u770B\u677F",
    "group": "\u5BA2\u7FA4",
    "order": 3,
    "enabled": true,
    "desc": "\u5BA2\u7FA4\u5206\u5C42\u770B\u677F\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u5BA2\u7FA4\u5206\u5C42\u770B\u677F\xB7risk_level\u5206\u5E03",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u672C\u6708\u65B0\u589E\u5BA2\u6237\u6570",
        "datasetId": "ds_customer",
        "metricId": "m_new_cust",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u5BA2\u7FA4\u5206\u5C42\u770B\u677F\u660E\u7EC6",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-005",
    "key": "cr:mid-p5",
    "name": "\u9AD8\u4EF7\u503C\u5BA2\u7FA4\u6D1E\u5BDF",
    "group": "\u5BA2\u7FA4",
    "order": 4,
    "enabled": true,
    "desc": "\u9AD8\u4EF7\u503C\u5BA2\u7FA4\u6D1E\u5BDF\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u9AD8\u4EF7\u503C\u5BA2\u7FA4\u6D1E\u5BDF\xB7risk_level\u5206\u5E03",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u672C\u6708\u65B0\u589E\u5BA2\u6237\u6570",
        "datasetId": "ds_customer",
        "metricId": "m_new_cust",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u9AD8\u4EF7\u503C\u5BA2\u7FA4\u6D1E\u5BDF\u660E\u7EC6",
        "datasetId": "ds_customer",
        "metricId": "m_cust_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-006",
    "key": "cr:mid-p6",
    "name": "\u98CE\u9669\u603B\u89C8\u9A7E\u9A76\u8231",
    "group": "\u98CE\u9669",
    "order": 5,
    "enabled": true,
    "desc": "\u98CE\u9669\u603B\u89C8\u9A7E\u9A76\u8231\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u98CE\u9669\u603B\u89C8\u9A7E\u9A76\u8231\xB7scene\u5206\u5E03",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u903E\u671F\u91D1\u989D",
        "datasetId": "ds_alert",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u98CE\u9669\u603B\u89C8\u9A7E\u9A76\u8231\u660E\u7EC6",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-007",
    "key": "cr:mid-p7",
    "name": "\u4FE1\u7528\u98CE\u9669\u8BC4\u4F30",
    "group": "\u98CE\u9669",
    "order": 6,
    "enabled": true,
    "desc": "\u4FE1\u7528\u98CE\u9669\u8BC4\u4F30\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u4FE1\u7528\u98CE\u9669\u8BC4\u4F30\xB7product\u5206\u5E03",
        "datasetId": "ds_loan",
        "metricId": "m_loan_balance",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u903E\u671F\u91D1\u989D",
        "datasetId": "ds_loan",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u4FE1\u7528\u98CE\u9669\u8BC4\u4F30\u660E\u7EC6",
        "datasetId": "ds_loan",
        "metricId": "m_loan_balance",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-008",
    "key": "cr:mid-p8",
    "name": "\u98CE\u9669\u7B49\u7EA7\u5206\u5E03",
    "group": "\u98CE\u9669",
    "order": 7,
    "enabled": true,
    "desc": "\u98CE\u9669\u7B49\u7EA7\u5206\u5E03\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u98CE\u9669\u7B49\u7EA7\u5206\u5E03\xB7scene\u5206\u5E03",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u903E\u671F\u91D1\u989D",
        "datasetId": "ds_alert",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u98CE\u9669\u7B49\u7EA7\u5206\u5E03\u660E\u7EC6",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-009",
    "key": "cr:mid-p9",
    "name": "\u98CE\u9669\u8D8B\u52BF\u76D1\u63A7",
    "group": "\u98CE\u9669",
    "order": 8,
    "enabled": true,
    "desc": "\u98CE\u9669\u8D8B\u52BF\u76D1\u63A7\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u98CE\u9669\u8D8B\u52BF\u76D1\u63A7\xB7month\u5206\u5E03",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_balance",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u903E\u671F\u91D1\u989D",
        "datasetId": "ds_behavior",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u98CE\u9669\u8D8B\u52BF\u76D1\u63A7\u660E\u7EC6",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_balance",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "\u6708\u5EA6\u8D8B\u52BF",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_balance",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-010",
    "key": "cr:mid-p10",
    "name": "\u98CE\u9669\u655E\u53E3\u770B\u677F",
    "group": "\u98CE\u9669",
    "order": 9,
    "enabled": true,
    "desc": "\u98CE\u9669\u655E\u53E3\u770B\u677F\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u98CE\u9669\u655E\u53E3\u770B\u677F\xB7product\u5206\u5E03",
        "datasetId": "ds_loan",
        "metricId": "m_loan_balance",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u903E\u671F\u91D1\u989D",
        "datasetId": "ds_loan",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u98CE\u9669\u655E\u53E3\u770B\u677F\u660E\u7EC6",
        "datasetId": "ds_loan",
        "metricId": "m_loan_balance",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-011",
    "key": "cr:mid-p11",
    "name": "\u8D37\u540E\u98CE\u9669\u9884\u8B66",
    "group": "\u98CE\u9669",
    "order": 10,
    "enabled": true,
    "desc": "\u8D37\u540E\u98CE\u9669\u9884\u8B66\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u8D37\u540E\u98CE\u9669\u9884\u8B66\xB7scene\u5206\u5E03",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u903E\u671F\u91D1\u989D",
        "datasetId": "ds_alert",
        "metricId": "m_overdue_amt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u8D37\u540E\u98CE\u9669\u9884\u8B66\u660E\u7EC6",
        "datasetId": "ds_alert",
        "metricId": "m_loan_balance",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-012",
    "key": "cr:mid-p12",
    "name": "\u7EA2\u9EC4\u706F\u9884\u8B66",
    "group": "\u9884\u8B66",
    "order": 11,
    "enabled": true,
    "desc": "\u7EA2\u9EC4\u706F\u9884\u8B66\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u7EA2\u9EC4\u706F\u9884\u8B66\xB7scene\u5206\u5E03",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u7EA2\u706F\u9884\u8B66\u6570",
        "datasetId": "ds_alert",
        "metricId": "m_red_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u7EA2\u9EC4\u706F\u9884\u8B66\u660E\u7EC6",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-013",
    "key": "cr:mid-p13",
    "name": "\u9884\u8B66\u7B49\u7EA7\u5206\u5E03",
    "group": "\u9884\u8B66",
    "order": 12,
    "enabled": true,
    "desc": "\u9884\u8B66\u7B49\u7EA7\u5206\u5E03\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u9884\u8B66\u7B49\u7EA7\u5206\u5E03\xB7scene\u5206\u5E03",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u7EA2\u706F\u9884\u8B66\u6570",
        "datasetId": "ds_alert",
        "metricId": "m_red_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u9884\u8B66\u7B49\u7EA7\u5206\u5E03\u660E\u7EC6",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-014",
    "key": "cr:mid-p14",
    "name": "\u9884\u8B66\u5904\u7F6E\u65F6\u6548",
    "group": "\u9884\u8B66",
    "order": 13,
    "enabled": true,
    "desc": "\u9884\u8B66\u5904\u7F6E\u65F6\u6548\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u9884\u8B66\u5904\u7F6E\u65F6\u6548\xB7scene\u5206\u5E03",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u7EA2\u706F\u9884\u8B66\u6570",
        "datasetId": "ds_alert",
        "metricId": "m_red_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u9884\u8B66\u5904\u7F6E\u65F6\u6548\u660E\u7EC6",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-015",
    "key": "cr:mid-p15",
    "name": "\u9884\u8B66\u6765\u6E90\u5206\u6790",
    "group": "\u9884\u8B66",
    "order": 14,
    "enabled": true,
    "desc": "\u9884\u8B66\u6765\u6E90\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u9884\u8B66\u6765\u6E90\u5206\u6790\xB7scene\u5206\u5E03",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u7EA2\u706F\u9884\u8B66\u6570",
        "datasetId": "ds_alert",
        "metricId": "m_red_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u9884\u8B66\u6765\u6E90\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_alert",
        "metricId": "m_alert_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-016",
    "key": "cr:mid-p16",
    "name": "\u5904\u7F6E\u95ED\u73AF\u603B\u89C8",
    "group": "\u5904\u7F6E",
    "order": 15,
    "enabled": true,
    "desc": "\u5904\u7F6E\u95ED\u73AF\u603B\u89C8\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u5904\u7F6E\u95ED\u73AF\u603B\u89C8\xB7scene\u5206\u5E03",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u5904\u7F6E\u7387",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_rate",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u5904\u7F6E\u95ED\u73AF\u603B\u89C8\u660E\u7EC6",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-017",
    "key": "cr:mid-p17",
    "name": "\u5904\u7F6E\u7B56\u7565\u6548\u679C",
    "group": "\u5904\u7F6E",
    "order": 16,
    "enabled": true,
    "desc": "\u5904\u7F6E\u7B56\u7565\u6548\u679C\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u5904\u7F6E\u7B56\u7565\u6548\u679C\xB7scene\u5206\u5E03",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u5904\u7F6E\u7387",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_rate",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u5904\u7F6E\u7B56\u7565\u6548\u679C\u660E\u7EC6",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-018",
    "key": "cr:mid-p18",
    "name": "\u81EA\u52A8\u5904\u7F6E\u76D1\u63A7",
    "group": "\u5904\u7F6E",
    "order": 17,
    "enabled": true,
    "desc": "\u81EA\u52A8\u5904\u7F6E\u76D1\u63A7\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u81EA\u52A8\u5904\u7F6E\u76D1\u63A7\xB7scene\u5206\u5E03",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u5904\u7F6E\u7387",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_rate",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u81EA\u52A8\u5904\u7F6E\u76D1\u63A7\u660E\u7EC6",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-019",
    "key": "cr:mid-p19",
    "name": "\u5904\u7F6E\u5DE5\u5355\u5206\u6790",
    "group": "\u5904\u7F6E",
    "order": 18,
    "enabled": true,
    "desc": "\u5904\u7F6E\u5DE5\u5355\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u5904\u7F6E\u5DE5\u5355\u5206\u6790\xB7scene\u5206\u5E03",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "scene"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "alert_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u5904\u7F6E\u7387",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_rate",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u5904\u7F6E\u5DE5\u5355\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_alert",
        "metricId": "m_dispose_cnt",
        "dimensions": [
          "alert_id",
          "cust_id",
          "cust_name",
          "scene",
          "level"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-020",
    "key": "cr:mid-p20",
    "name": "\u6388\u4FE1\u5BA1\u6279\u76D1\u63A7",
    "group": "\u6388\u4FE1",
    "order": 19,
    "enabled": true,
    "desc": "\u6388\u4FE1\u5BA1\u6279\u76D1\u63A7\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u6388\u4FE1\u5BA1\u6279\u76D1\u63A7\xB7product\u5206\u5E03",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u989D\u5EA6\u4F7F\u7528\u7387>90%\u5BA2\u6237\u6570",
        "datasetId": "ds_loan",
        "metricId": "m_util_high_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u6388\u4FE1\u5BA1\u6279\u76D1\u63A7\u660E\u7EC6",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-021",
    "key": "cr:mid-p21",
    "name": "\u6388\u4FE1\u989D\u5EA6\u4F7F\u7528",
    "group": "\u6388\u4FE1",
    "order": 20,
    "enabled": true,
    "desc": "\u6388\u4FE1\u989D\u5EA6\u4F7F\u7528\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u6388\u4FE1\u989D\u5EA6\u4F7F\u7528\xB7product\u5206\u5E03",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u989D\u5EA6\u4F7F\u7528\u7387>90%\u5BA2\u6237\u6570",
        "datasetId": "ds_loan",
        "metricId": "m_util_high_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u6388\u4FE1\u989D\u5EA6\u4F7F\u7528\u660E\u7EC6",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-022",
    "key": "cr:mid-p22",
    "name": "\u6388\u4FE1\u653F\u7B56\u6548\u679C",
    "group": "\u6388\u4FE1",
    "order": 21,
    "enabled": true,
    "desc": "\u6388\u4FE1\u653F\u7B56\u6548\u679C\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u6388\u4FE1\u653F\u7B56\u6548\u679C\xB7product\u5206\u5E03",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u989D\u5EA6\u4F7F\u7528\u7387>90%\u5BA2\u6237\u6570",
        "datasetId": "ds_loan",
        "metricId": "m_util_high_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u6388\u4FE1\u653F\u7B56\u6548\u679C\u660E\u7EC6",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-023",
    "key": "cr:mid-p23",
    "name": "\u6388\u4FE1\u901A\u8FC7\u7387\u5206\u6790",
    "group": "\u6388\u4FE1",
    "order": 22,
    "enabled": true,
    "desc": "\u6388\u4FE1\u901A\u8FC7\u7387\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u6388\u4FE1\u901A\u8FC7\u7387\u5206\u6790\xB7product\u5206\u5E03",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u989D\u5EA6\u4F7F\u7528\u7387>90%\u5BA2\u6237\u6570",
        "datasetId": "ds_loan",
        "metricId": "m_util_high_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u6388\u4FE1\u901A\u8FC7\u7387\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_loan",
        "metricId": "m_credit_remain",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-024",
    "key": "cr:mid-p24",
    "name": "\u6388\u4FE1\u5BA2\u7FA4\u5206\u6790",
    "group": "\u6388\u4FE1",
    "order": 23,
    "enabled": true,
    "desc": "\u6388\u4FE1\u5BA2\u7FA4\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u6388\u4FE1\u5BA2\u7FA4\u5206\u6790\xB7risk_level\u5206\u5E03",
        "datasetId": "ds_customer",
        "metricId": "m_credit_remain",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u989D\u5EA6\u4F7F\u7528\u7387>90%\u5BA2\u6237\u6570",
        "datasetId": "ds_customer",
        "metricId": "m_util_high_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u6388\u4FE1\u5BA2\u7FA4\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_customer",
        "metricId": "m_credit_remain",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-025",
    "key": "cr:mid-p25",
    "name": "\u8D37\u6B3E\u4E1A\u52A1\u603B\u89C8",
    "group": "\u8D37\u6B3E",
    "order": 24,
    "enabled": true,
    "desc": "\u8D37\u6B3E\u4E1A\u52A1\u603B\u89C8\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u8D37\u6B3E\u4E1A\u52A1\u603B\u89C8\xB7product\u5206\u5E03",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u8D37\u6B3E\u53D1\u653E\u603B\u989D",
        "datasetId": "ds_loan",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u8D37\u6B3E\u4E1A\u52A1\u603B\u89C8\u660E\u7EC6",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-026",
    "key": "cr:mid-p26",
    "name": "\u8D37\u6B3E\u4F59\u989D\u76D1\u63A7",
    "group": "\u8D37\u6B3E",
    "order": 25,
    "enabled": true,
    "desc": "\u8D37\u6B3E\u4F59\u989D\u76D1\u63A7\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u8D37\u6B3E\u4F59\u989D\u76D1\u63A7\xB7product\u5206\u5E03",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u8D37\u6B3E\u53D1\u653E\u603B\u989D",
        "datasetId": "ds_loan",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u8D37\u6B3E\u4F59\u989D\u76D1\u63A7\u660E\u7EC6",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-027",
    "key": "cr:mid-p27",
    "name": "\u8D37\u6B3E\u903E\u671F\u5206\u6790",
    "group": "\u8D37\u6B3E",
    "order": 26,
    "enabled": true,
    "desc": "\u8D37\u6B3E\u903E\u671F\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u8D37\u6B3E\u903E\u671F\u5206\u6790\xB7product\u5206\u5E03",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u8D37\u6B3E\u53D1\u653E\u603B\u989D",
        "datasetId": "ds_loan",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u8D37\u6B3E\u903E\u671F\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-028",
    "key": "cr:mid-p28",
    "name": "\u8D37\u6B3E\u8D28\u91CF\u770B\u677F",
    "group": "\u8D37\u6B3E",
    "order": 27,
    "enabled": true,
    "desc": "\u8D37\u6B3E\u8D28\u91CF\u770B\u677F\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u8D37\u6B3E\u8D28\u91CF\u770B\u677F\xB7product\u5206\u5E03",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u8D37\u6B3E\u53D1\u653E\u603B\u989D",
        "datasetId": "ds_loan",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u8D37\u6B3E\u8D28\u91CF\u770B\u677F\u660E\u7EC6",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-029",
    "key": "cr:mid-p29",
    "name": "\u8FD8\u6B3E\u884C\u4E3A\u5206\u6790",
    "group": "\u8D37\u6B3E",
    "order": 28,
    "enabled": true,
    "desc": "\u8FD8\u6B3E\u884C\u4E3A\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u8FD8\u6B3E\u884C\u4E3A\u5206\u6790\xB7month\u5206\u5E03",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u8D37\u6B3E\u53D1\u653E\u603B\u989D",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u8FD8\u6B3E\u884C\u4E3A\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "\u6708\u5EA6\u8D8B\u52BF",
        "datasetId": "ds_behavior",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-030",
    "key": "cr:mid-p30",
    "name": "\u8D37\u6B3E\u53D1\u653E\u8D8B\u52BF",
    "group": "\u8D37\u6B3E",
    "order": 29,
    "enabled": true,
    "desc": "\u8D37\u6B3E\u53D1\u653E\u8D8B\u52BF\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u8D37\u6B3E\u53D1\u653E\u8D8B\u52BF\xB7product\u5206\u5E03",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "product"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u8D37\u6B3E\u53D1\u653E\u603B\u989D",
        "datasetId": "ds_loan",
        "metricId": "m_loan_total",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u8D37\u6B3E\u53D1\u653E\u8D8B\u52BF\u660E\u7EC6",
        "datasetId": "ds_loan",
        "metricId": "m_loan_cnt",
        "dimensions": [
          "cust_id",
          "product",
          "loan_balance",
          "overdue_amt",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-031",
    "key": "cr:mid-p31",
    "name": "\u5BA2\u6237\u884C\u4E3A\u5206\u6790",
    "group": "\u884C\u4E3A",
    "order": 30,
    "enabled": true,
    "desc": "\u5BA2\u6237\u884C\u4E3A\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u5BA2\u6237\u884C\u4E3A\u5206\u6790\xB7month\u5206\u5E03",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u4EA4\u6613\u7B14\u6570",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u5BA2\u6237\u884C\u4E3A\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "\u6708\u5EA6\u8D8B\u52BF",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-032",
    "key": "cr:mid-p32",
    "name": "\u884C\u4E3A\u8BC4\u5206\u76D1\u63A7",
    "group": "\u884C\u4E3A",
    "order": 31,
    "enabled": true,
    "desc": "\u884C\u4E3A\u8BC4\u5206\u76D1\u63A7\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u884C\u4E3A\u8BC4\u5206\u76D1\u63A7\xB7month\u5206\u5E03",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u4EA4\u6613\u7B14\u6570",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u884C\u4E3A\u8BC4\u5206\u76D1\u63A7\u660E\u7EC6",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "\u6708\u5EA6\u8D8B\u52BF",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-033",
    "key": "cr:mid-p33",
    "name": "\u884C\u4E3A\u8D8B\u52BF\u770B\u677F",
    "group": "\u884C\u4E3A",
    "order": 32,
    "enabled": true,
    "desc": "\u884C\u4E3A\u8D8B\u52BF\u770B\u677F\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u884C\u4E3A\u8D8B\u52BF\u770B\u677F\xB7month\u5206\u5E03",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u4EA4\u6613\u7B14\u6570",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u884C\u4E3A\u8D8B\u52BF\u770B\u677F\u660E\u7EC6",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "\u6708\u5EA6\u8D8B\u52BF",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-034",
    "key": "cr:mid-p34",
    "name": "\u7528\u4FE1\u884C\u4E3A\u5206\u6790",
    "group": "\u884C\u4E3A",
    "order": 33,
    "enabled": true,
    "desc": "\u7528\u4FE1\u884C\u4E3A\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u7528\u4FE1\u884C\u4E3A\u5206\u6790\xB7month\u5206\u5E03",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u4EA4\u6613\u7B14\u6570",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u7528\u4FE1\u884C\u4E3A\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "\u6708\u5EA6\u8D8B\u52BF",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-035",
    "key": "cr:mid-p35",
    "name": "\u6C89\u7761\u5BA2\u6237\u9884\u8B66",
    "group": "\u884C\u4E3A",
    "order": 34,
    "enabled": true,
    "desc": "\u6C89\u7761\u5BA2\u6237\u9884\u8B66\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u6C89\u7761\u5BA2\u6237\u9884\u8B66\xB7month\u5206\u5E03",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u4EA4\u6613\u7B14\u6570",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u6C89\u7761\u5BA2\u6237\u9884\u8B66\u660E\u7EC6",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "cust_id",
          "month",
          "score",
          "new_loans",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w4",
        "type": "line",
        "title": "\u6708\u5EA6\u8D8B\u52BF",
        "datasetId": "ds_behavior",
        "metricId": "m_txn_amt",
        "dimensions": [
          "month"
        ],
        "span": 2
      }
    ]
  },
  {
    "id": "db-036",
    "key": "cr:mid-p36",
    "name": "\u6B3A\u8BC8\u98CE\u9669\u603B\u89C8",
    "group": "\u6B3A\u8BC8",
    "order": 35,
    "enabled": true,
    "desc": "\u6B3A\u8BC8\u98CE\u9669\u603B\u89C8\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "\u6B3A\u8BC8\u547D\u4E2D\u5BA2\u6237\u6570",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit_cust",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "\u6B3A\u8BC8\u98CE\u9669\u603B\u89C8\u660E\u7EC6",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "dimensions": [
          "id_no",
          "score",
          "query_cnt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "\u6B3A\u8BC8\u547D\u4E2D\u6B21\u6570",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "span": 1
      }
    ]
  },
  {
    "id": "db-037",
    "key": "cr:mid-p37",
    "name": "\u6B3A\u8BC8\u8BC6\u522B\u76D1\u63A7",
    "group": "\u6B3A\u8BC8",
    "order": 36,
    "enabled": true,
    "desc": "\u6B3A\u8BC8\u8BC6\u522B\u76D1\u63A7\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "\u6B3A\u8BC8\u547D\u4E2D\u5BA2\u6237\u6570",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit_cust",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "\u6B3A\u8BC8\u8BC6\u522B\u76D1\u63A7\u660E\u7EC6",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "dimensions": [
          "id_no",
          "score",
          "query_cnt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "\u6B3A\u8BC8\u547D\u4E2D\u6B21\u6570",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "span": 1
      }
    ]
  },
  {
    "id": "db-038",
    "key": "cr:mid-p38",
    "name": "\u6B3A\u8BC8\u6848\u4EF6\u5206\u6790",
    "group": "\u6B3A\u8BC8",
    "order": 37,
    "enabled": true,
    "desc": "\u6B3A\u8BC8\u6848\u4EF6\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "\u6B3A\u8BC8\u547D\u4E2D\u5BA2\u6237\u6570",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit_cust",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "\u6B3A\u8BC8\u6848\u4EF6\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "dimensions": [
          "id_no",
          "score",
          "query_cnt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "\u6B3A\u8BC8\u547D\u4E2D\u6B21\u6570",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "span": 1
      }
    ]
  },
  {
    "id": "db-039",
    "key": "cr:mid-p39",
    "name": "\u8BBE\u5907\u6307\u7EB9\u98CE\u9669",
    "group": "\u6B3A\u8BC8",
    "order": 38,
    "enabled": true,
    "desc": "\u8BBE\u5907\u6307\u7EB9\u98CE\u9669\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "\u6B3A\u8BC8\u547D\u4E2D\u5BA2\u6237\u6570",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit_cust",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "\u8BBE\u5907\u6307\u7EB9\u98CE\u9669\u660E\u7EC6",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "dimensions": [
          "id_no",
          "score",
          "query_cnt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "\u6B3A\u8BC8\u547D\u4E2D\u6B21\u6570",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "span": 1
      }
    ]
  },
  {
    "id": "db-040",
    "key": "cr:mid-p40",
    "name": "\u5F02\u5E38\u884C\u4E3A\u9884\u8B66",
    "group": "\u6B3A\u8BC8",
    "order": 39,
    "enabled": true,
    "desc": "\u5F02\u5E38\u884C\u4E3A\u9884\u8B66\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "\u6B3A\u8BC8\u547D\u4E2D\u5BA2\u6237\u6570",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit_cust",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "\u5F02\u5E38\u884C\u4E3A\u9884\u8B66\u660E\u7EC6",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "dimensions": [
          "id_no",
          "score",
          "query_cnt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "\u6B3A\u8BC8\u547D\u4E2D\u6B21\u6570",
        "datasetId": "ds_api_demo",
        "metricId": "m_fraud_hit",
        "span": 1
      }
    ]
  },
  {
    "id": "db-041",
    "key": "cr:mid-p41",
    "name": "\u8425\u9500\u6D3B\u52A8\u6548\u679C",
    "group": "\u8425\u9500",
    "order": 40,
    "enabled": true,
    "desc": "\u8425\u9500\u6D3B\u52A8\u6548\u679C\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u8425\u9500\u6D3B\u52A8\u6548\u679C\xB7risk_level\u5206\u5E03",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u63D0\u989D\u9080\u8BF7\u6570",
        "datasetId": "ds_customer",
        "metricId": "m_invite_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u8425\u9500\u6D3B\u52A8\u6548\u679C\u660E\u7EC6",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-042",
    "key": "cr:mid-p42",
    "name": "\u8425\u9500\u673A\u4F1A\u6316\u6398",
    "group": "\u8425\u9500",
    "order": 41,
    "enabled": true,
    "desc": "\u8425\u9500\u673A\u4F1A\u6316\u6398\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u8425\u9500\u673A\u4F1A\u6316\u6398\xB7risk_level\u5206\u5E03",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u63D0\u989D\u9080\u8BF7\u6570",
        "datasetId": "ds_customer",
        "metricId": "m_invite_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u8425\u9500\u673A\u4F1A\u6316\u6398\u660E\u7EC6",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-043",
    "key": "cr:mid-p43",
    "name": "\u8425\u9500\u54CD\u5E94\u5206\u6790",
    "group": "\u8425\u9500",
    "order": 42,
    "enabled": true,
    "desc": "\u8425\u9500\u54CD\u5E94\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u8425\u9500\u54CD\u5E94\u5206\u6790\xB7risk_level\u5206\u5E03",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u63D0\u989D\u9080\u8BF7\u6570",
        "datasetId": "ds_customer",
        "metricId": "m_invite_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u8425\u9500\u54CD\u5E94\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-044",
    "key": "cr:mid-p44",
    "name": "\u7CBE\u51C6\u8425\u9500\u770B\u677F",
    "group": "\u8425\u9500",
    "order": 43,
    "enabled": true,
    "desc": "\u7CBE\u51C6\u8425\u9500\u770B\u677F\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u7CBE\u51C6\u8425\u9500\u770B\u677F\xB7risk_level\u5206\u5E03",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u63D0\u989D\u9080\u8BF7\u6570",
        "datasetId": "ds_customer",
        "metricId": "m_invite_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u7CBE\u51C6\u8425\u9500\u770B\u677F\u660E\u7EC6",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-045",
    "key": "cr:mid-p45",
    "name": "\u5BA2\u6237\u751F\u547D\u5468\u671F",
    "group": "\u8425\u9500",
    "order": 44,
    "enabled": true,
    "desc": "\u5BA2\u6237\u751F\u547D\u5468\u671F\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u5BA2\u6237\u751F\u547D\u5468\u671F\xB7risk_level\u5206\u5E03",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "risk_level"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "cust_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u63D0\u989D\u9080\u8BF7\u6570",
        "datasetId": "ds_customer",
        "metricId": "m_invite_cnt",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u5BA2\u6237\u751F\u547D\u5468\u671F\u660E\u7EC6",
        "datasetId": "ds_customer",
        "metricId": "m_promo_cnt",
        "dimensions": [
          "cust_id",
          "cust_name",
          "product",
          "risk_level",
          "credit_line"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-046",
    "key": "cr:mid-p46",
    "name": "\u5408\u89C4\u6307\u6807\u76D1\u63A7",
    "group": "\u5408\u89C4",
    "order": 45,
    "enabled": true,
    "desc": "\u5408\u89C4\u6307\u6807\u76D1\u63A7\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "\u62E8\u5907\u8986\u76D6\u7387",
        "datasetId": "ds_sql_demo",
        "metricId": "m_provision",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "\u5408\u89C4\u6307\u6807\u76D1\u63A7\u660E\u7EC6",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "dimensions": [
          "cust_id",
          "loan_balance",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "\u8D44\u672C\u5145\u8DB3\u7387",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "span": 1
      }
    ]
  },
  {
    "id": "db-047",
    "key": "cr:mid-p47",
    "name": "\u76D1\u7BA1\u62A5\u9001\u770B\u677F",
    "group": "\u5408\u89C4",
    "order": 46,
    "enabled": true,
    "desc": "\u76D1\u7BA1\u62A5\u9001\u770B\u677F\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "\u62E8\u5907\u8986\u76D6\u7387",
        "datasetId": "ds_sql_demo",
        "metricId": "m_provision",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "\u76D1\u7BA1\u62A5\u9001\u770B\u677F\u660E\u7EC6",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "dimensions": [
          "cust_id",
          "loan_balance",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "\u8D44\u672C\u5145\u8DB3\u7387",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "span": 1
      }
    ]
  },
  {
    "id": "db-048",
    "key": "cr:mid-p48",
    "name": "\u5408\u89C4\u98CE\u9669\u9884\u8B66",
    "group": "\u5408\u89C4",
    "order": 47,
    "enabled": true,
    "desc": "\u5408\u89C4\u98CE\u9669\u9884\u8B66\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "metric",
        "title": "\u62E8\u5907\u8986\u76D6\u7387",
        "datasetId": "ds_sql_demo",
        "metricId": "m_provision",
        "span": 1
      },
      {
        "id": "w2",
        "type": "table",
        "title": "\u5408\u89C4\u98CE\u9669\u9884\u8B66\u660E\u7EC6",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "dimensions": [
          "cust_id",
          "loan_balance",
          "overdue_amt"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      },
      {
        "id": "w3",
        "type": "metric",
        "title": "\u8D44\u672C\u5145\u8DB3\u7387",
        "datasetId": "ds_sql_demo",
        "metricId": "m_car_ratio",
        "span": 1
      }
    ]
  },
  {
    "id": "db-049",
    "key": "cr:mid-p49",
    "name": "\u4E8B\u4EF6\u5206\u6790\u603B\u89C8",
    "group": "\u4E8B\u4EF6\u5206\u6790",
    "order": 48,
    "enabled": true,
    "desc": "\u4E8B\u4EF6\u5206\u6790\u603B\u89C8\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u4E8B\u4EF6\u5206\u6790\u603B\u89C8\xB7country\u5206\u5E03",
        "datasetId": "ds_event",
        "metricId": "m_web_stay_7d",
        "dimensions": [
          "country"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "user_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u76F4\u64AD\u95F4-\u70B9\u51FB\u7ACB\u5373\u8D2D\u4E70\u7684\u4EBA\u5747\u6B21\u6570",
        "datasetId": "ds_event",
        "metricId": "m_live_buy_peruser",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u4E8B\u4EF6\u5206\u6790\u603B\u89C8\u660E\u7EC6",
        "datasetId": "ds_event",
        "metricId": "m_web_stay_7d",
        "dimensions": [
          "user_id",
          "ip",
          "startup_dur",
          "country",
          "web_stay_7d"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  },
  {
    "id": "db-050",
    "key": "cr:mid-p50",
    "name": "\u7528\u6237\u542F\u52A8\u65F6\u957F\u5206\u6790",
    "group": "\u4E8B\u4EF6\u5206\u6790",
    "order": 49,
    "enabled": true,
    "desc": "\u7528\u6237\u542F\u52A8\u65F6\u957F\u5206\u6790\u5B9E\u65F6\u76D1\u63A7\u770B\u677F",
    "widgets": [
      {
        "id": "w1",
        "type": "donut",
        "title": "\u7528\u6237\u542F\u52A8\u65F6\u957F\u5206\u6790\xB7country\u5206\u5E03",
        "datasetId": "ds_event",
        "metricId": "m_web_stay_7d",
        "dimensions": [
          "country"
        ],
        "span": 1,
        "drill": {
          "type": "detail",
          "rowKey": "user_id",
          "title": "\u660E\u7EC6"
        }
      },
      {
        "id": "w2",
        "type": "metric",
        "title": "\u76F4\u64AD\u95F4-\u70B9\u51FB\u7ACB\u5373\u8D2D\u4E70\u7684\u4EBA\u5747\u6B21\u6570",
        "datasetId": "ds_event",
        "metricId": "m_live_buy_peruser",
        "span": 1
      },
      {
        "id": "w3",
        "type": "table",
        "title": "\u7528\u6237\u542F\u52A8\u65F6\u957F\u5206\u6790\u660E\u7EC6",
        "datasetId": "ds_event",
        "metricId": "m_web_stay_7d",
        "dimensions": [
          "user_id",
          "ip",
          "startup_dur",
          "country",
          "web_stay_7d"
        ],
        "span": 2,
        "drill": {
          "type": "none",
          "title": ""
        }
      }
    ]
  }
];

// src/console/midData.ts
var HOUR_SLOTS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
var FREQ_TO_GRAN = {
  realtime: "realtime",
  every5m: "minute",
  hourly: "hour",
  daily: "day",
  weekly: "week",
  monthly: "month"
};
function normalizeStrategy(input) {
  const raw = input ?? {};
  const tasks = Array.isArray(raw.tasks) ? raw.tasks.map((t) => {
    let period = t.period;
    if (!period && typeof t.schedule === "string") {
      const hh = String(t.schedule).split(":")[0];
      if (hh) period = { hours: [hh] };
    }
    const granularity = (FREQ_TO_GRAN[t.frequency] ?? t.granularity) || "day";
    return {
      id: t.id,
      name: t.name ?? "",
      crowd: t.crowd ?? "",
      granularity,
      period,
      metricIds: Array.isArray(t.metricIds) ? t.metricIds : [],
      output: t.output ?? "web",
      enabled: t.enabled ?? true,
      desc: t.desc,
      scene: t.scene,
      flowKey: t.flowKey,
      flowState: t.flowState
    };
  }) : [];
  const rules2 = Array.isArray(raw.rules) ? raw.rules.map((r) => {
    const normCond = (c, i) => {
      const op = ["gt", "gte", "lt", "lte", "eq", "neq", "exists", "contains"].includes(c.op) ? c.op : "gt";
      let value = "";
      if (op === "exists") value = "";
      else if (op === "contains") value = typeof c.value === "string" ? c.value : String(c.value ?? "");
      else value = typeof c.value === "number" ? c.value : Number(c.value) || 0;
      return { id: c.id ?? `${r.id}__c${i}`, metricId: c.metricId ?? "", op, value };
    };
    const conds = Array.isArray(r.conds) && r.conds.length ? r.conds.map((c, i) => normCond(c, i)) : [normCond({ metricId: r.metricId, op: r.op, value: r.value }, 0)];
    return {
      id: r.id,
      name: r.name ?? "",
      logic: r.logic === "or" ? "or" : "and",
      conds,
      level: r.level ?? "RED",
      groupValue: Array.isArray(r.groupValue) ? r.groupValue : ["\u603B\u4F53"],
      triggerMode: r.triggerMode === "ratio" ? "ratio" : "int",
      compare: ["lt", "gt", "eq"].includes(r.compare) ? r.compare : "lt",
      baseline: ["yesterday", "lastWeek", "lastMonth"].includes(r.baseline) ? r.baseline : "yesterday",
      threshold: typeof r.threshold === "number" ? r.threshold : 0,
      alertType: r.alertType,
      desc: r.desc
    };
  }) : [];
  const disposes = Array.isArray(raw.disposes) ? raw.disposes : [];
  return { tasks, rules: rules2, disposes };
}
var SEED_DATA_SOURCES = [
  {
    id: "ds_customer",
    name: "\u5BA2\u6237\u4FE1\u606F",
    type: "sql",
    category: "\u5BA2\u6237\u57DF",
    desc: "\u5728\u8D37\u5BA2\u6237\u4E3B\u6863",
    conn: { dbType: "mysql", host: "10.20.30.11", port: 3306, database: "crm", username: "crm_rw", password: "Crm@2026****", connStr: "mysql://crm_rw:***@10.20.30.11:3306/crm", query: "SELECT cust_id, cust_name, product, risk_level, credit_line, loan_balance, behavior_score FROM cust_master" },
    fields: [
      { key: "cust_id", label: "\u5BA2\u6237ID", kind: "dim", type: "string" },
      { key: "cust_name", label: "\u5BA2\u6237\u59D3\u540D", kind: "dim", type: "string" },
      { key: "product", label: "\u4EA7\u54C1", kind: "dim", type: "string" },
      { key: "risk_level", label: "\u98CE\u9669\u7B49\u7EA7", kind: "dim", type: "string" },
      { key: "credit_line", label: "\u6388\u4FE1\u989D\u5EA6", kind: "measure", type: "number", unit: "\u5143" },
      { key: "loan_balance", label: "\u5728\u8D37\u4F59\u989D", kind: "measure", type: "number", unit: "\u5143" },
      { key: "behavior_score", label: "\u884C\u4E3A\u5206", kind: "measure", type: "number" }
    ],
    rows: [
      { cust_id: "C0001", cust_name: "\u5F20*\u660E", product: "\u4FE1\u7528\u8D37", risk_level: "\u9AD8\u98CE\u9669", credit_line: 8e4, loan_balance: 42e3, behavior_score: 33 },
      { cust_id: "C0002", cust_name: "\u674E*\u534E", product: "\u6D88\u8D39\u8D37", risk_level: "\u4E2D\u98CE\u9669", credit_line: 5e4, loan_balance: 18e3, behavior_score: 52 },
      { cust_id: "C0003", cust_name: "\u738B*\u82B3", product: "\u4FE1\u7528\u8D37", risk_level: "\u4F4E\u98CE\u9669", credit_line: 1e5, loan_balance: 35e3, behavior_score: 78 },
      { cust_id: "C0004", cust_name: "\u8D75*\u5F3A", product: "\u7ECF\u8425\u8D37", risk_level: "\u9AD8\u98CE\u9669", credit_line: 2e5, loan_balance: 156e3, behavior_score: 28 },
      { cust_id: "C0005", cust_name: "\u9648*\u654F", product: "\u6D88\u8D39\u8D37", risk_level: "\u4E2D\u98CE\u9669", credit_line: 3e4, loan_balance: 9e3, behavior_score: 61 }
    ],
    status: "connected"
  },
  {
    id: "ds_alert",
    name: "\u9884\u8B66\u660E\u7EC6",
    type: "sql",
    category: "\u9884\u8B66\u57DF",
    desc: "\u7EA2\u9EC4\u706F\u9884\u8B66\u4E8B\u4EF6",
    conn: { dbType: "oracle", host: "10.20.30.22", port: 1521, database: "risk_db", username: "alert_ro", password: "Alert@2026****", connStr: "oracle://alert_ro:***@10.20.30.22:1521/risk_db", query: "SELECT alert_id, cust_id, cust_name, scene, level, alert_date, rule_name, metric_value, threshold FROM alert_event" },
    fields: [
      { key: "alert_id", label: "\u9884\u8B66ID", kind: "dim", type: "string" },
      { key: "cust_id", label: "\u5BA2\u6237ID", kind: "dim", type: "string" },
      { key: "cust_name", label: "\u5BA2\u6237\u59D3\u540D", kind: "dim", type: "string" },
      { key: "scene", label: "\u9884\u8B66\u573A\u666F", kind: "dim", type: "string" },
      { key: "level", label: "\u9884\u8B66\u7B49\u7EA7", kind: "dim", type: "string" },
      { key: "alert_date", label: "\u9884\u8B66\u65E5\u671F", kind: "dim", type: "date" },
      { key: "rule_name", label: "\u547D\u4E2D\u89C4\u5219", kind: "dim", type: "string" },
      { key: "metric_value", label: "\u6307\u6807\u503C", kind: "measure", type: "number" },
      { key: "threshold", label: "\u9608\u503C", kind: "measure", type: "number" }
    ],
    rows: [
      { alert_id: "AL240804-001", cust_id: "C0001", cust_name: "\u5F20*\u660E", scene: "\u8D1F\u503A\u6FC0\u589E", level: "RED", alert_date: "2026-08-04", rule_name: "\u8FD130\u5929\u65B0\u589E\u8D37\u6B3E\u22653\u7B14", metric_value: 5, threshold: 3 },
      { alert_id: "AL240804-002", cust_id: "C0004", cust_name: "\u8D75*\u5F3A", scene: "\u53F8\u6CD5\u6D89\u8BC9", level: "RED", alert_date: "2026-08-04", rule_name: "\u65B0\u589E\u88AB\u6267\u884C\u8BB0\u5F55", metric_value: 1, threshold: 0 },
      { alert_id: "AL240804-003", cust_id: "C0002", cust_name: "\u674E*\u534E", scene: "\u8BBE\u5907\u5F02\u5E38", level: "YELLOW", alert_date: "2026-08-04", rule_name: "7\u65E5\u5185\u66F4\u6362\u8BBE\u5907", metric_value: 2, threshold: 1 },
      { alert_id: "AL240803-004", cust_id: "C0005", cust_name: "\u9648*\u654F", scene: "\u8FD8\u6B3E\u80FD\u529B", level: "YELLOW", alert_date: "2026-08-03", rule_name: "\u4E34\u671F\u4F59\u989D\u4E0D\u8DB3", metric_value: 1, threshold: 0 },
      { alert_id: "AL240803-005", cust_id: "C0001", cust_name: "\u5F20*\u660E", scene: "\u884C\u4E3A\u8BC4\u5206", level: "RED", alert_date: "2026-08-03", rule_name: "\u884C\u4E3A\u5206<40", metric_value: 33, threshold: 40 },
      { alert_id: "AL240802-006", cust_id: "C0003", cust_name: "\u738B*\u82B3", scene: "\u9700\u6C42\u4E0A\u5347", level: "OPPORTUNITY", alert_date: "2026-08-02", rule_name: "\u989D\u5EA6\u4F7F\u7528\u7387>80%", metric_value: 88, threshold: 80 }
    ],
    status: "connected"
  },
  {
    id: "ds_loan",
    name: "\u8D37\u6B3E\u53F0\u8D26",
    type: "sql",
    category: "\u4FE1\u8D37\u57DF",
    desc: "\u5728\u8D37\u4F59\u989D\u4E0E\u903E\u671F\u53F0\u8D26",
    conn: { dbType: "mysql", host: "10.20.30.33", port: 3306, database: "core_loan", username: "loan_rw", password: "Loan@2026****", connStr: "mysql://loan_rw:***@10.20.30.33:3306/core_loan", query: "SELECT cust_id, product, loan_balance, overdue_amt, credit_line FROM loan_ledger" },
    fields: [
      { key: "cust_id", label: "\u5BA2\u6237ID", kind: "dim", type: "string" },
      { key: "product", label: "\u4EA7\u54C1", kind: "dim", type: "string" },
      { key: "loan_balance", label: "\u5728\u8D37\u4F59\u989D", kind: "measure", type: "number", unit: "\u5143" },
      { key: "overdue_amt", label: "\u903E\u671F\u91D1\u989D", kind: "measure", type: "number", unit: "\u5143" },
      { key: "credit_line", label: "\u6388\u4FE1\u989D\u5EA6", kind: "measure", type: "number", unit: "\u5143" }
    ],
    rows: [
      { cust_id: "C0001", product: "\u4FE1\u7528\u8D37", loan_balance: 42e3, overdue_amt: 3200, credit_line: 8e4 },
      { cust_id: "C0002", product: "\u6D88\u8D39\u8D37", loan_balance: 18e3, overdue_amt: 0, credit_line: 5e4 },
      { cust_id: "C0003", product: "\u4FE1\u7528\u8D37", loan_balance: 35e3, overdue_amt: 0, credit_line: 1e5 },
      { cust_id: "C0004", product: "\u7ECF\u8425\u8D37", loan_balance: 156e3, overdue_amt: 12800, credit_line: 2e5 },
      { cust_id: "C0005", product: "\u6D88\u8D39\u8D37", loan_balance: 9e3, overdue_amt: 450, credit_line: 3e4 }
    ],
    status: "connected"
  },
  {
    id: "ds_behavior",
    name: "\u884C\u4E3A\u6307\u6807\u6708\u8868",
    type: "sql",
    category: "\u884C\u4E3A\u57DF",
    desc: "\u5BA2\u6237\u6708\u5EA6\u884C\u4E3A\u6307\u6807",
    conn: { dbType: "postgres", host: "10.20.30.44", port: 5432, database: "behavior", username: "beh_ro", password: "Beh@2026****", connStr: "postgres://beh_ro:***@10.20.30.44:5432/behavior", query: "SELECT cust_id, month, score, new_loans, overdue_amt, active_days FROM behavior_monthly" },
    fields: [
      { key: "cust_id", label: "\u5BA2\u6237ID", kind: "dim", type: "string" },
      { key: "month", label: "\u6708\u4EFD", kind: "dim", type: "date" },
      { key: "score", label: "\u884C\u4E3A\u5206", kind: "measure", type: "number" },
      { key: "new_loans", label: "\u65B0\u589E\u8D37\u6B3E\u7B14\u6570", kind: "measure", type: "number" },
      { key: "overdue_amt", label: "\u903E\u671F\u91D1\u989D", kind: "measure", type: "number", unit: "\u5143" },
      { key: "active_days", label: "\u6D3B\u8DC3\u5929\u6570", kind: "measure", type: "number" }
    ],
    rows: [
      { cust_id: "C0001", month: "2026-03", score: 58, new_loans: 1, overdue_amt: 0, active_days: 12 },
      { cust_id: "C0001", month: "2026-04", score: 51, new_loans: 2, overdue_amt: 0, active_days: 9 },
      { cust_id: "C0001", month: "2026-05", score: 44, new_loans: 3, overdue_amt: 1200, active_days: 6 },
      { cust_id: "C0001", month: "2026-06", score: 38, new_loans: 4, overdue_amt: 2400, active_days: 4 },
      { cust_id: "C0001", month: "2026-07", score: 33, new_loans: 5, overdue_amt: 3200, active_days: 3 },
      { cust_id: "C0003", month: "2026-07", score: 78, new_loans: 0, overdue_amt: 0, active_days: 18 },
      { cust_id: "C0004", month: "2026-07", score: 28, new_loans: 6, overdue_amt: 12800, active_days: 2 }
    ],
    status: "connected"
  },
  {
    id: "ds_api_demo",
    name: "\u5916\u90E8\u5F81\u4FE1\u5E93",
    type: "sql",
    category: "\u5916\u90E8\u6570\u636E",
    desc: "\u7B2C\u4E09\u65B9\u5F81\u4FE1\u6570\u636E\uFF08\u6F14\u793A\u8FDE\u63A5\u914D\u7F6E\uFF09",
    conn: { dbType: "mysql", host: "10.20.30.55", port: 3306, database: "credit_ref", username: "ref_ro", password: "Ref@2026****", connStr: "mysql://ref_ro:***@10.20.30.55:3306/credit_ref", query: "SELECT id_no, score, query_cnt FROM credit_report" },
    fields: [
      { key: "id_no", label: "\u8BC1\u4EF6\u53F7", kind: "dim", type: "string" },
      { key: "score", label: "\u5F81\u4FE1\u5206", kind: "measure", type: "number" },
      { key: "query_cnt", label: "\u67E5\u8BE2\u6B21\u6570", kind: "measure", type: "number" }
    ],
    rows: [
      { id_no: "3301**********1234", score: 682, query_cnt: 3 },
      { id_no: "4401**********5678", score: 551, query_cnt: 7 }
    ],
    status: "connected"
  },
  {
    id: "ds_sql_demo",
    name: "\u6838\u5FC3\u4FE1\u8D37\u5E93",
    type: "sql",
    category: "\u4FE1\u8D37\u57DF",
    desc: "\u6838\u5FC3\u7CFB\u7EDF\u6570\u636E\u5E93\uFF08\u6F14\u793A\u8FDE\u63A5\u914D\u7F6E\uFF09",
    conn: { dbType: "mysql", host: "10.20.30.40", port: 3306, database: "core_loan", username: "etl_rw", password: "Core@2026****", connStr: "mysql://etl_rw:***@10.20.30.40:3306/core_loan", query: "SELECT cust_id, loan_balance, overdue_amt FROM loan_ledger" },
    fields: [
      { key: "cust_id", label: "\u5BA2\u6237ID", kind: "dim", type: "string" },
      { key: "loan_balance", label: "\u5728\u8D37\u4F59\u989D", kind: "measure", type: "number", unit: "\u5143" },
      { key: "overdue_amt", label: "\u903E\u671F\u91D1\u989D", kind: "measure", type: "number", unit: "\u5143" }
    ],
    rows: [
      { cust_id: "C0001", loan_balance: 42e3, overdue_amt: 3200 },
      { cust_id: "C0004", loan_balance: 156e3, overdue_amt: 12800 }
    ],
    status: "connected"
  },
  {
    // 神策「事件分析」导出对应的事件数据源（record/temp/event）——用于承载 A/B/C 指标与全局筛选条件
    id: "ds_event",
    name: "\u4E8B\u4EF6\u5206\u6790\u6570\u636E\u6E90",
    type: "sql",
    category: "\u884C\u4E3A\u57DF",
    desc: "\u795E\u7B56\u4E8B\u4EF6\u5206\u6790\u5BFC\u51FA\uFF08Web \u89C6\u533A\u505C\u7559 / \u76F4\u64AD\u95F4\u70B9\u51FB\u8D2D\u4E70 / IP\xB7\u542F\u52A8\u65F6\u957F\xB7\u56FD\u5BB6 \u7B49\u4E8B\u4EF6\u5C5E\u6027\uFF09",
    conn: { dbType: "mysql", host: "10.20.30.66", port: 3306, database: "sens_event", username: "evt_ro", password: "Evt@2026****", connStr: "mysql://evt_ro:***@10.20.30.66:3306/sens_event", query: "SELECT user_id, ip, startup_dur, country, web_stay_7d, live_buy_peruser, live_buy_users, live_buy_total FROM event_analysis" },
    fields: [
      { key: "user_id", label: "\u7528\u6237ID", kind: "dim", type: "string" },
      { key: "ip", label: "IP", kind: "dim", type: "string" },
      { key: "startup_dur", label: "$\u542F\u52A8\u65F6\u957F", kind: "measure", type: "number", unit: "s" },
      { key: "country", label: "\u56FD\u5BB6", kind: "dim", type: "string" },
      { key: "web_stay_7d", label: "Web\u89C6\u533A\u505C\u7559\xB7\u8FC7\u53BB7\u5929\u603B\u6B21\u6570", kind: "measure", type: "number" },
      { key: "live_buy_peruser", label: "\u76F4\u64AD\u95F4\u70B9\u51FB\u8D2D\u4E70\xB7\u4EBA\u5747\u6B21\u6570", kind: "measure", type: "number" },
      { key: "live_buy_users", label: "\u76F4\u64AD\u95F4\u70B9\u51FB\u8D2D\u4E70\xB7\u7528\u6237\u6570", kind: "measure", type: "number" },
      { key: "live_buy_total", label: "\u76F4\u64AD\u95F4\u70B9\u51FB\u8D2D\u4E70\xB7\u603B\u6B21\u6570", kind: "measure", type: "number" }
    ],
    rows: [
      { user_id: "U0001", ip: "112.10.2.31", startup_dur: 42, country: "\u4E2D\u56FD", web_stay_7d: 18, live_buy_peruser: 0.6, live_buy_users: 12, live_buy_total: 20 },
      { user_id: "U0002", ip: "8.34.9.7", startup_dur: 71, country: "\u7F8E\u56FD", web_stay_7d: 33, live_buy_peruser: 1.2, live_buy_users: 30, live_buy_total: 25 },
      { user_id: "U0003", ip: "", startup_dur: 12, country: "\u65E5\u672C", web_stay_7d: 9, live_buy_peruser: 0.2, live_buy_users: 4, live_buy_total: 18 },
      { user_id: "U0004", ip: "200.18.4.2", startup_dur: 58, country: "\u745E\u58EB", web_stay_7d: 27, live_buy_peruser: 0.9, live_buy_users: 21, live_buy_total: 23 },
      { user_id: "U0005", ip: "61.3.8.9", startup_dur: 95, country: "\u5FB7\u56FD", web_stay_7d: 41, live_buy_peruser: 1.5, live_buy_users: 38, live_buy_total: 25 }
    ],
    status: "connected"
  },
  {
    "id": "ds_pre_apply",
    "name": "\u8FDB\u4EF6\u7533\u8BF7",
    "type": "sql",
    "category": "\u8D37\u524D\u57DF",
    "desc": "\u8D37\u524D\u8FDB\u4EF6\u7533\u8BF7\uFF08\u8FDB\u4EF6\u5BA1\u6838/\u4FE1\u606F\u6838\u9A8C/\u4FE1\u7528\u98CE\u63A7/\u6B3A\u8BC8\u8BC6\u522B\uFF09",
    "conn": {
      "dbType": "mysql",
      "host": "10.20.30.33",
      "port": 3306,
      "database": "pre_apply",
      "username": "pre_rw",
      "password": "Pre@2026****",
      "connStr": "mysql://pre_rw:***@10.20.30.33:3306/pre_apply",
      "query": "SELECT apply_id, apply_date, cust_name, channel, product, verify_pass, credit_score, fraud_hit, decision FROM pre_apply"
    },
    "fields": [
      {
        "key": "apply_id",
        "label": "\u8FDB\u4EF6ID",
        "kind": "dim",
        "type": "string"
      },
      {
        "key": "apply_date",
        "label": "\u7533\u8BF7\u65E5\u671F",
        "kind": "dim",
        "type": "string"
      },
      {
        "key": "cust_name",
        "label": "\u5BA2\u6237\u59D3\u540D",
        "kind": "dim",
        "type": "string"
      },
      {
        "key": "channel",
        "label": "\u8FDB\u4EF6\u6E20\u9053",
        "kind": "dim",
        "type": "string"
      },
      {
        "key": "product",
        "label": "\u7533\u8BF7\u4EA7\u54C1",
        "kind": "dim",
        "type": "string"
      },
      {
        "key": "verify_pass",
        "label": "\u4FE1\u606F\u6838\u9A8C",
        "kind": "dim",
        "type": "string"
      },
      {
        "key": "credit_score",
        "label": "\u9884\u6388\u4FE1\u8BC4\u5206",
        "kind": "measure",
        "type": "number"
      },
      {
        "key": "fraud_hit",
        "label": "\u6B3A\u8BC8\u547D\u4E2D",
        "kind": "dim",
        "type": "string"
      },
      {
        "key": "decision",
        "label": "\u5BA1\u6279\u7ED3\u8BBA",
        "kind": "dim",
        "type": "string"
      }
    ],
    "rows": [
      {
        "apply_id": "AP20260808-001",
        "apply_date": "2026-08-08",
        "cust_name": "\u5F20*\u660E",
        "channel": "\u7EBF\u4E0AApp",
        "product": "\u4FE1\u7528\u8D37",
        "verify_pass": "\u901A\u8FC7",
        "credit_score": 620,
        "fraud_hit": "\u5426",
        "decision": "\u901A\u8FC7"
      },
      {
        "apply_id": "AP20260808-002",
        "apply_date": "2026-08-08",
        "cust_name": "\u674E*\u534E",
        "channel": "\u5408\u4F5C\u6E20\u9053",
        "product": "\u6D88\u8D39\u8D37",
        "verify_pass": "\u901A\u8FC7",
        "credit_score": 585,
        "fraud_hit": "\u5426",
        "decision": "\u901A\u8FC7"
      },
      {
        "apply_id": "AP20260808-003",
        "apply_date": "2026-08-08",
        "cust_name": "\u738B*\u82B3",
        "channel": "\u7EBF\u4E0AApp",
        "product": "\u4FE1\u7528\u8D37",
        "verify_pass": "\u672A\u901A\u8FC7",
        "credit_score": 540,
        "fraud_hit": "\u5426",
        "decision": "\u62D2\u7EDD"
      },
      {
        "apply_id": "AP20260808-004",
        "apply_date": "2026-08-08",
        "cust_name": "\u8D75*\u5F3A",
        "channel": "\u7EBF\u4E0B\u95E8\u5E97",
        "product": "\u7ECF\u8425\u8D37",
        "verify_pass": "\u901A\u8FC7",
        "credit_score": 645,
        "fraud_hit": "\u5426",
        "decision": "\u4EBA\u5DE5\u590D\u6838"
      },
      {
        "apply_id": "AP20260808-005",
        "apply_date": "2026-08-08",
        "cust_name": "\u9648*\u654F",
        "channel": "\u5FAE\u4FE1\u5C0F\u7A0B\u5E8F",
        "product": "\u6D88\u8D39\u8D37",
        "verify_pass": "\u901A\u8FC7",
        "credit_score": 598,
        "fraud_hit": "\u5426",
        "decision": "\u901A\u8FC7"
      },
      {
        "apply_id": "AP20260808-006",
        "apply_date": "2026-08-08",
        "cust_name": "\u5B59*\u534E",
        "channel": "\u5408\u4F5C\u6E20\u9053",
        "product": "\u4FE1\u7528\u8D37",
        "verify_pass": "\u901A\u8FC7",
        "credit_score": 660,
        "fraud_hit": "\u662F",
        "decision": "\u62D2\u7EDD"
      },
      {
        "apply_id": "AP20260808-007",
        "apply_date": "2026-08-08",
        "cust_name": "\u5468*\u4F1F",
        "channel": "\u7EBF\u4E0AApp",
        "product": "\u62B5\u62BC\u8D37",
        "verify_pass": "\u672A\u901A\u8FC7",
        "credit_score": 570,
        "fraud_hit": "\u5426",
        "decision": "\u62D2\u7EDD"
      },
      {
        "apply_id": "AP20260808-008",
        "apply_date": "2026-08-08",
        "cust_name": "\u5434*\u519B",
        "channel": "\u7EBF\u4E0B\u95E8\u5E97",
        "product": "\u7ECF\u8425\u8D37",
        "verify_pass": "\u901A\u8FC7",
        "credit_score": 615,
        "fraud_hit": "\u5426",
        "decision": "\u901A\u8FC7"
      },
      {
        "apply_id": "AP20260808-009",
        "apply_date": "2026-08-08",
        "cust_name": "\u90D1*\u4E3D",
        "channel": "\u5FAE\u4FE1\u5C0F\u7A0B\u5E8F",
        "product": "\u6D88\u8D39\u8D37",
        "verify_pass": "\u901A\u8FC7",
        "credit_score": 630,
        "fraud_hit": "\u662F",
        "decision": "\u4EBA\u5DE5\u590D\u6838"
      },
      {
        "apply_id": "AP20260808-010",
        "apply_date": "2026-08-08",
        "cust_name": "\u51AF*\u519B",
        "channel": "\u7EBF\u4E0AApp",
        "product": "\u4FE1\u7528\u8D37",
        "verify_pass": "\u901A\u8FC7",
        "credit_score": 590,
        "fraud_hit": "\u5426",
        "decision": "\u901A\u8FC7"
      }
    ],
    "status": "connected"
  }
];
var SEED_METRICS = [
  // 客群
  { id: "m_cust_cnt", name: "\u5728\u8D37\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", dataSourceId: "ds_customer", type: "base", field: "cust_id", agg: "count", precision: 0, enabled: true },
  { id: "m_new_cust", name: "\u672C\u6708\u65B0\u589E\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", dataSourceId: "ds_customer", type: "base", field: "new_loans", agg: "sum", precision: 0, enabled: false },
  { id: "m_active_days", name: "\u5E73\u5747\u6D3B\u8DC3\u5929\u6570", group: "\u5BA2\u7FA4", dataSourceId: "ds_customer", type: "base", field: "active_days", agg: "avg", precision: 1, enabled: false },
  // 风险
  { id: "m_loan_balance", name: "\u5728\u8D37\u4F59\u989D", group: "\u98CE\u9669", dataSourceId: "ds_loan", type: "base", field: "loan_balance", agg: "sum", unit: "\u5143", precision: 0, enabled: true, groupBy: ["product"], vizType: "bar", vizSampleId: "vs_product_loan" },
  { id: "m_overdue_amt", name: "\u903E\u671F\u91D1\u989D", group: "\u98CE\u9669", dataSourceId: "ds_loan", type: "base", field: "overdue_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true, groupBy: ["product"], vizType: "line", vizSampleId: "vs_monthly_overdue" },
  { id: "m_credit_line", name: "\u6388\u4FE1\u989D\u5EA6", group: "\u98CE\u9669", dataSourceId: "ds_loan", type: "base", field: "credit_line", agg: "sum", unit: "\u5143", precision: 0, enabled: true, vizType: "bar", vizSampleId: "vs_quarter_revenue" },
  { id: "m_score_avg", name: "\u884C\u4E3A\u5747\u5206", group: "\u98CE\u9669", dataSourceId: "ds_behavior", type: "base", field: "score", agg: "avg", precision: 1, enabled: true, groupBy: ["month"], vizType: "radar", vizSampleId: "vs_region_score" },
  { id: "m_overdue_rate", name: "\u903E\u671F\u7387", group: "\u98CE\u9669", dataSourceId: "ds_loan", type: "derived", formula: "m_overdue_amt / m_loan_balance * 100", unit: "%", precision: 2, enabled: true, vizType: "line", vizSampleId: "vs_monthly_overdue" },
  { id: "m_util_rate", name: "\u989D\u5EA6\u4F7F\u7528\u7387", group: "\u98CE\u9669", dataSourceId: "ds_loan", type: "derived", formula: "m_loan_balance / m_credit_line * 100", unit: "%", precision: 1, enabled: true, vizType: "pie", vizSampleId: "vs_risk_level" },
  { id: "m_npl_amt", name: "\u4E0D\u826F\u91D1\u989D", group: "\u98CE\u9669", dataSourceId: "ds_loan", type: "base", field: "overdue_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true, vizType: "bar", vizSampleId: "vs_product_loan" },
  { id: "m_npl_rate", name: "\u4E0D\u826F\u7387", group: "\u98CE\u9669", dataSourceId: "ds_loan", type: "derived", formula: "m_npl_amt / m_loan_balance * 100", unit: "%", precision: 2, enabled: false, vizType: "pie", vizSampleId: "vs_risk_level" },
  // 预警
  { id: "m_alert_cnt", name: "\u9884\u8B66\u603B\u6570", group: "\u9884\u8B66", dataSourceId: "ds_alert", type: "base", field: "alert_id", agg: "count", precision: 0, enabled: true, groupBy: ["level"], vizType: "pie", vizSampleId: "vs_risk_level" },
  { id: "m_red_cnt", name: "\u7EA2\u706F\u9884\u8B66\u6570", group: "\u9884\u8B66", dataSourceId: "ds_alert", type: "base", field: "alert_id", agg: "count", precision: 0, enabled: true, vizType: "bar", vizSampleId: "vs_age_risk" },
  { id: "m_opp_cnt", name: "\u673A\u4F1A\u9884\u8B66\u6570", group: "\u9884\u8B66", dataSourceId: "ds_alert", type: "base", field: "alert_id", agg: "count", precision: 0, enabled: true, vizType: "hbar", vizSampleId: "vs_channel_approval" },
  // 处置
  { id: "m_dispose_cnt", name: "\u5904\u7F6E\u6B21\u6570", group: "\u5904\u7F6E", dataSourceId: "ds_alert", type: "base", field: "alert_id", agg: "count", precision: 0, enabled: true, vizType: "burndown", vizSampleId: "vs_burndown_task" },
  { id: "m_dispose_rate", name: "\u5904\u7F6E\u7387", group: "\u5904\u7F6E", dataSourceId: "ds_alert", type: "derived", formula: "m_dispose_cnt / m_alert_cnt * 100", unit: "%", precision: 1, enabled: true, vizType: "area", vizSampleId: "vs_channel_approval" },
  // ---- 事件分析（record/temp/event）指标：A/B/C + 三个事件属性（供预警规则引用） ----
  { id: "m_web_stay_7d", name: "Web \u89C6\u533A\u505C\u7559\u7684\u8FC7\u53BB 7 \u5929\u603B\u6B21\u6570", group: "\u4E8B\u4EF6\u5206\u6790", dataSourceId: "ds_event", type: "base", field: "web_stay_7d", agg: "sum", precision: 0, enabled: true, vizType: "bar", vizSampleId: "vs_product_loan" },
  { id: "m_live_buy_peruser", name: "\u76F4\u64AD\u95F4-\u70B9\u51FB\u7ACB\u5373\u8D2D\u4E70\u7684\u4EBA\u5747\u6B21\u6570", group: "\u4E8B\u4EF6\u5206\u6790", dataSourceId: "ds_event", type: "base", field: "live_buy_peruser", agg: "avg", precision: 2, enabled: true, vizType: "line", vizSampleId: "vs_monthly_overdue" },
  { id: "m_live_buy_users", name: "\u76F4\u64AD\u95F4-\u70B9\u51FB\u7ACB\u5373\u8D2D\u4E70\xB7\u7528\u6237\u6570", group: "\u4E8B\u4EF6\u5206\u6790", dataSourceId: "ds_event", type: "base", field: "live_buy_users", agg: "sum", precision: 0, enabled: true, vizType: "bar", vizSampleId: "vs_quarter_revenue" },
  { id: "m_live_buy_total", name: "\u76F4\u64AD\u95F4-\u70B9\u51FB\u7ACB\u5373\u8D2D\u4E70\xB7\u603B\u6B21\u6570", group: "\u4E8B\u4EF6\u5206\u6790", dataSourceId: "ds_event", type: "base", field: "live_buy_total", agg: "sum", precision: 0, enabled: true, vizType: "bar", vizSampleId: "vs_product_loan" },
  { id: "m_custom_idx2", name: "\u81EA\u5B9A\u4E49\u6307\u68072", group: "\u4E8B\u4EF6\u5206\u6790", dataSourceId: "ds_event", type: "derived", formula: "m_live_buy_users / m_live_buy_total * 100", unit: "%", precision: 1, enabled: true, vizType: "pie", vizSampleId: "vs_risk_level" },
  { id: "m_ip", name: "IP\uFF08\u4E8B\u4EF6\u5C5E\u6027\uFF09", group: "\u4E8B\u4EF6\u5C5E\u6027", dataSourceId: "ds_event", type: "base", field: "ip", agg: "count", precision: 0, enabled: true, vizType: "bar", vizSampleId: "vs_age_risk" },
  { id: "m_startup_dur", name: "$\u542F\u52A8\u65F6\u957F\uFF08\u4E8B\u4EF6\u5C5E\u6027\uFF09", group: "\u4E8B\u4EF6\u5C5E\u6027", dataSourceId: "ds_event", type: "base", field: "startup_dur", agg: "avg", unit: "s", precision: 1, enabled: true, vizType: "bar", vizSampleId: "vs_quarter_revenue" },
  { id: "m_country", name: "\u56FD\u5BB6\uFF08\u4E8B\u4EF6\u5C5E\u6027\uFF09", group: "\u4E8B\u4EF6\u5C5E\u6027", dataSourceId: "ds_event", type: "base", field: "country", agg: "count", precision: 0, enabled: true, vizType: "hbar", vizSampleId: "vs_channel_approval" },
  { id: "m_age_avg", name: "\u5BA2\u6237\u5E73\u5747\u5E74\u9F84", group: "\u5BA2\u7FA4", desc: "\u5728\u8D37\u5BA2\u6237\u5E73\u5747\u5E74\u9F84", dataSourceId: "ds_customer", type: "base", field: "age_avg", agg: "avg", unit: "\u5C81", precision: 0, enabled: true },
  { id: "m_age_dist", name: "\u5BA2\u6237\u5E74\u9F84\u5206\u5E03", group: "\u5BA2\u7FA4", desc: "\u6309\u5E74\u9F84\u5206\u7EC4\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "age_dist", agg: "distinct", unit: "\u4EBA", precision: 0, enabled: true, vizType: "bar" },
  { id: "m_gender_cnt", name: "\u7537\u6027\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u6027\u522B=\u7537\u7684\u5728\u8D37\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "gender_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true, vizType: "hbar" },
  { id: "m_married_cnt", name: "\u5DF2\u5A5A\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u5A5A\u59FB\u72B6\u6001=\u5DF2\u5A5A\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "married_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_edu_cnt", name: "\u672C\u79D1\u53CA\u4EE5\u4E0A\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u5B66\u5386=\u672C\u79D1/\u7855\u58EB/\u535A\u58EB\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "edu_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_house_cnt", name: "\u6709\u623F\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u4F4F\u623F\u6027\u8D28=\u81EA\u6709\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "house_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_car_cnt", name: "\u6709\u8F66\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u62E5\u6709\u8F66\u8F86\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "car_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_work_years_avg", name: "\u5E73\u5747\u5DE5\u4F5C\u5E74\u9650", group: "\u5BA2\u7FA4", desc: "\u5728\u8D37\u5BA2\u6237\u5E73\u5747\u5DE5\u4F5C\u5E74\u9650", dataSourceId: "ds_customer", type: "base", field: "work_years_avg", agg: "avg", unit: "\u5E74", precision: 1, enabled: true },
  { id: "m_income_avg", name: "\u5BA2\u6237\u5E73\u5747\u6708\u6536\u5165", group: "\u5BA2\u7FA4", desc: "\u5BA2\u6237\u5E73\u5747\u6708\u6536\u5165", dataSourceId: "ds_customer", type: "base", field: "income_avg", agg: "avg", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_income_high_cnt", name: "\u9AD8\u6536\u5165\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u6708\u6536\u5165\u22653\u4E07\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "income_high_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_social_cnt", name: "\u7F34\u7EB3\u793E\u4FDD\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u6709\u793E\u4FDD\u8BB0\u5F55\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "social_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_fund_cnt", name: "\u7F34\u7EB3\u516C\u79EF\u91D1\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u6709\u516C\u79EF\u91D1\u8BB0\u5F55\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "fund_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_company_avg", name: "\u5E73\u5747\u4F01\u4E1A\u89C4\u6A21", group: "\u5BA2\u7FA4", desc: "\u5BA2\u6237\u6240\u5728\u4F01\u4E1A\u5E73\u5747\u4EBA\u6570", dataSourceId: "ds_customer", type: "base", field: "company_avg", agg: "avg", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_industry_cnt", name: "\u884C\u4E1A\u5206\u5E03\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u6309\u884C\u4E1A\u5206\u7EC4\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "industry_cnt", agg: "distinct", unit: "\u4EBA", precision: 0, enabled: true, vizType: "bar" },
  { id: "m_city_cnt", name: "\u57CE\u5E02\u5206\u5E03\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u6309\u57CE\u5E02\u5206\u7EC4\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "city_cnt", agg: "distinct", unit: "\u4EBA", precision: 0, enabled: true, vizType: "bar" },
  { id: "m_blacklist_cnt", name: "\u9ED1\u540D\u5355\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u547D\u4E2D\u5916\u90E8\u9ED1\u540D\u5355\u7684\u5728\u8D37\u5BA2\u6237\u6570", dataSourceId: "ds_api_demo", type: "base", field: "blacklist_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_credit_remain", name: "\u5269\u4F59\u6388\u4FE1\u989D\u5EA6", group: "\u6388\u4FE1", desc: "\u6388\u4FE1\u989D\u5EA6-\u5DF2\u7528\u989D\u5EA6", dataSourceId: "ds_customer", type: "base", field: "credit_remain", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_util_high_cnt", name: "\u989D\u5EA6\u4F7F\u7528\u7387>90%\u5BA2\u6237\u6570", group: "\u6388\u4FE1", desc: "\u989D\u5EA6\u4F7F\u7528\u7387\u8D85\u8FC790%\u7684\u5BA2\u6237", dataSourceId: "ds_loan", type: "base", field: "util_high_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_temp_credit", name: "\u4E34\u65F6\u6388\u4FE1\u989D\u5EA6", group: "\u6388\u4FE1", desc: "\u4E34\u65F6\u63D0\u989D\u989D\u5EA6\u603B\u989D", dataSourceId: "ds_customer", type: "base", field: "temp_credit", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_cycle_credit", name: "\u5FAA\u73AF\u6388\u4FE1\u989D\u5EA6", group: "\u6388\u4FE1", desc: "\u5FAA\u73AF\u989D\u5EA6\u603B\u989D", dataSourceId: "ds_customer", type: "base", field: "cycle_credit", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_upgrade_cnt", name: "\u63D0\u989D\u6B21\u6570", group: "\u6388\u4FE1", desc: "\u8FD112\u4E2A\u6708\u63D0\u989D\u6B21\u6570", dataSourceId: "ds_customer", type: "base", field: "upgrade_cnt", agg: "sum", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_downgrade_cnt", name: "\u964D\u989D\u6B21\u6570", group: "\u6388\u4FE1", desc: "\u8FD112\u4E2A\u6708\u964D\u989D\u6B21\u6570", dataSourceId: "ds_customer", type: "base", field: "downgrade_cnt", agg: "sum", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_freeze_amt", name: "\u51BB\u7ED3\u6388\u4FE1\u989D\u5EA6", group: "\u6388\u4FE1", desc: "\u88AB\u51BB\u7ED3\u7684\u6388\u4FE1\u989D\u5EA6", dataSourceId: "ds_customer", type: "base", field: "freeze_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_avail_credit", name: "\u53EF\u7528\u6388\u4FE1\u989D\u5EA6", group: "\u6388\u4FE1", desc: "\u5F53\u524D\u53EF\u7528\u7684\u6388\u4FE1\u989D\u5EA6", dataSourceId: "ds_customer", type: "base", field: "avail_credit", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_credit_avg", name: "\u4EBA\u5747\u6388\u4FE1\u989D\u5EA6", group: "\u6388\u4FE1", desc: "\u6388\u4FE1\u989D\u5EA6/\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "credit_avg", agg: "avg", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_credit_peak", name: "\u6388\u4FE1\u4F7F\u7528\u5CF0\u503C", group: "\u6388\u4FE1", desc: "\u5386\u53F2\u6388\u4FE1\u4F7F\u7528\u5CF0\u503C", dataSourceId: "ds_loan", type: "base", field: "credit_peak", agg: "max", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_credit_recover", name: "\u989D\u5EA6\u56DE\u6536\u91D1\u989D", group: "\u6388\u4FE1", desc: "\u903E\u671F\u540E\u56DE\u6536\u7684\u6388\u4FE1\u989D\u5EA6", dataSourceId: "ds_loan", type: "base", field: "credit_recover", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_credit_review", name: "\u989D\u5EA6\u590D\u8BAE\u6B21\u6570", group: "\u6388\u4FE1", desc: "\u989D\u5EA6\u590D\u8BAE\u7533\u8BF7\u6B21\u6570", dataSourceId: "ds_customer", type: "base", field: "credit_review", agg: "sum", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_guarantee_credit", name: "\u62C5\u4FDD\u6388\u4FE1\u989D\u5EA6", group: "\u6388\u4FE1", desc: "\u62C5\u4FDD\u7C7B\u6388\u4FE1\u603B\u989D", dataSourceId: "ds_loan", type: "base", field: "guarantee_credit", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_pledge_credit", name: "\u8D28\u62BC\u6388\u4FE1\u989D\u5EA6", group: "\u6388\u4FE1", desc: "\u8D28\u62BC\u7C7B\u6388\u4FE1\u603B\u989D", dataSourceId: "ds_loan", type: "base", field: "pledge_credit", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_instal_credit", name: "\u5206\u671F\u6388\u4FE1\u989D\u5EA6", group: "\u6388\u4FE1", desc: "\u5206\u671F\u7C7B\u6388\u4FE1\u603B\u989D", dataSourceId: "ds_loan", type: "base", field: "instal_credit", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_cash_credit", name: "\u53D6\u73B0\u6388\u4FE1\u989D\u5EA6", group: "\u6388\u4FE1", desc: "\u53EF\u53D6\u73B0\u7684\u6388\u4FE1\u989D\u5EA6", dataSourceId: "ds_loan", type: "base", field: "cash_credit", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_credit_expire", name: "\u5373\u5C06\u5230\u671F\u6388\u4FE1", group: "\u6388\u4FE1", desc: "30\u5929\u5185\u5230\u671F\u7684\u6388\u4FE1\u989D\u5EA6", dataSourceId: "ds_customer", type: "base", field: "credit_expire", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_credit_gap", name: "\u6388\u4FE1\u7F3A\u53E3", group: "\u6388\u4FE1", desc: "\u5BA2\u6237\u7528\u4FE1\u9700\u6C42\u4E0E\u6388\u4FE1\u5DEE\u989D", dataSourceId: "ds_loan", type: "base", field: "credit_gap", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_cnt", name: "\u8D37\u6B3E\u7B14\u6570", group: "\u8D37\u6B3E", desc: "\u5F53\u524D\u5728\u8D37\u8D37\u6B3E\u7B14\u6570", dataSourceId: "ds_loan", type: "base", field: "loan_cnt", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_loan_total", name: "\u8D37\u6B3E\u53D1\u653E\u603B\u989D", group: "\u8D37\u6B3E", desc: "\u5386\u53F2\u7D2F\u8BA1\u53D1\u653E\u8D37\u6B3E\u91D1\u989D", dataSourceId: "ds_loan", type: "base", field: "loan_total", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_principal", name: "\u5269\u4F59\u672C\u91D1", group: "\u8D37\u6B3E", desc: "\u8D37\u6B3E\u672A\u8FD8\u672C\u91D1\u5408\u8BA1", dataSourceId: "ds_loan", type: "base", field: "loan_principal", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_interest", name: "\u5E94\u6536\u5229\u606F", group: "\u8D37\u6B3E", desc: "\u5DF2\u8BA1\u63D0\u672A\u6536\u5229\u606F", dataSourceId: "ds_loan", type: "base", field: "loan_interest", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_rate_avg", name: "\u5E73\u5747\u8D37\u6B3E\u5229\u7387", group: "\u8D37\u6B3E", desc: "\u5728\u8D37\u8D37\u6B3E\u52A0\u6743\u5E73\u5747\u5229\u7387", dataSourceId: "ds_loan", type: "base", field: "loan_rate_avg", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_loan_term_avg", name: "\u5E73\u5747\u8D37\u6B3E\u671F\u9650", group: "\u8D37\u6B3E", desc: "\u8D37\u6B3E\u5E73\u5747\u671F\u9650\uFF08\u6708\uFF09", dataSourceId: "ds_loan", type: "base", field: "loan_term_avg", agg: "avg", unit: "\u6708", precision: 0, enabled: true },
  { id: "m_loan_remain_term", name: "\u5269\u4F59\u671F\u6570", group: "\u8D37\u6B3E", desc: "\u5168\u90E8\u8D37\u6B3E\u5269\u4F59\u8FD8\u6B3E\u671F\u6570", dataSourceId: "ds_loan", type: "base", field: "loan_remain_term", agg: "sum", unit: "\u671F", precision: 0, enabled: true },
  { id: "m_loan_paid_term", name: "\u5DF2\u8FD8\u671F\u6570", group: "\u8D37\u6B3E", desc: "\u7D2F\u8BA1\u5DF2\u8FD8\u671F\u6570", dataSourceId: "ds_loan", type: "base", field: "loan_paid_term", agg: "sum", unit: "\u671F", precision: 0, enabled: true },
  { id: "m_monthly_pay", name: "\u6708\u4F9B\u5408\u8BA1", group: "\u8D37\u6B3E", desc: "\u5BA2\u6237\u6708\u8FD8\u6B3E\u989D\u5408\u8BA1", dataSourceId: "ds_loan", type: "base", field: "monthly_pay", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_prepay", name: "\u63D0\u524D\u8FD8\u6B3E\u91D1\u989D", group: "\u8D37\u6B3E", desc: "\u63D0\u524D\u8FD8\u6B3E\u91D1\u989D\u5408\u8BA1", dataSourceId: "ds_loan", type: "base", field: "loan_prepay", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_prepay_cnt", name: "\u63D0\u524D\u8FD8\u6B3E\u6B21\u6570", group: "\u8D37\u6B3E", desc: "\u63D0\u524D\u8FD8\u6B3E\u7B14\u6570", dataSourceId: "ds_loan", type: "base", field: "loan_prepay_cnt", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_loan_extend", name: "\u5C55\u671F\u8D37\u6B3E\u91D1\u989D", group: "\u8D37\u6B3E", desc: "\u5C55\u671F\u8D37\u6B3E\u4F59\u989D", dataSourceId: "ds_loan", type: "base", field: "loan_extend", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_renew", name: "\u501F\u65B0\u8FD8\u65E7\u91D1\u989D", group: "\u8D37\u6B3E", desc: "\u501F\u65B0\u8FD8\u65E7\u6D89\u53CA\u91D1\u989D", dataSourceId: "ds_loan", type: "base", field: "loan_renew", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_new_cnt", name: "\u5F53\u6708\u65B0\u589E\u8D37\u6B3E\u7B14\u6570", group: "\u8D37\u6B3E", desc: "\u672C\u6708\u65B0\u53D1\u653E\u8D37\u6B3E\u7B14\u6570", dataSourceId: "ds_loan", type: "base", field: "loan_new_cnt", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_loan_mature", name: "\u5F53\u6708\u5230\u671F\u8D37\u6B3E", group: "\u8D37\u6B3E", desc: "\u5F53\u6708\u5230\u671F\u5E94\u8FD8\u672C\u91D1", dataSourceId: "ds_loan", type: "base", field: "loan_mature", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_fine", name: "\u7F5A\u606F\u91D1\u989D", group: "\u8D37\u6B3E", desc: "\u903E\u671F\u7F5A\u606F\u5408\u8BA1", dataSourceId: "ds_loan", type: "base", field: "loan_fine", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_compound", name: "\u590D\u5229\u91D1\u989D", group: "\u8D37\u6B3E", desc: "\u590D\u5229\u8BA1\u63D0\u91D1\u989D", dataSourceId: "ds_loan", type: "base", field: "loan_compound", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_latefee", name: "\u6EDE\u7EB3\u91D1\u91D1\u989D", group: "\u8D37\u6B3E", desc: "\u6EDE\u7EB3\u91D1\u5408\u8BA1", dataSourceId: "ds_loan", type: "base", field: "loan_latefee", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_status_dist", name: "\u8D37\u6B3E\u72B6\u6001\u5206\u5E03", group: "\u8D37\u6B3E", desc: "\u6309\u8D37\u6B3E\u72B6\u6001\u5206\u7EC4\u7B14\u6570", dataSourceId: "ds_loan", type: "base", field: "loan_status_dist", agg: "distinct", unit: "\u7B14", precision: 0, enabled: true, vizType: "pie" },
  { id: "m_loan_product_dist", name: "\u4EA7\u54C1\u5206\u5E03", group: "\u8D37\u6B3E", desc: "\u6309\u4EA7\u54C1\u5206\u7EC4\u7684\u8D37\u6B3E\u4F59\u989D", dataSourceId: "ds_loan", type: "base", field: "loan_product_dist", agg: "distinct", unit: "\u5143", precision: 0, enabled: true, vizType: "pie" },
  { id: "m_loan_stage5", name: "\u4E94\u7EA7\u5206\u7C7B\u5206\u5E03", group: "\u8D37\u6B3E", desc: "\u6B63\u5E38/\u5173\u6CE8/\u6B21\u7EA7/\u53EF\u7591/\u635F\u5931\u5206\u5E03", dataSourceId: "ds_loan", type: "base", field: "loan_stage5", agg: "distinct", unit: "\u5143", precision: 0, enabled: true, vizType: "bar" },
  { id: "m_loan_disbursed", name: "\u672C\u6708\u653E\u6B3E\u91D1\u989D", group: "\u8D37\u6B3E", desc: "\u672C\u6708\u5B9E\u9645\u653E\u6B3E\u91D1\u989D", dataSourceId: "ds_loan", type: "base", field: "loan_disbursed", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_loan_due_amt", name: "\u672C\u6708\u5E94\u8FD8\u91D1\u989D", group: "\u8D37\u6B3E", desc: "\u672C\u6708\u5168\u90E8\u5E94\u8FD8\u672C\u606F", dataSourceId: "ds_loan", type: "base", field: "loan_due_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_overdue_days", name: "\u5E73\u5747\u903E\u671F\u5929\u6570", group: "\u98CE\u9669", desc: "\u903E\u671F\u5BA2\u6237\u5E73\u5747\u903E\u671F\u5929\u6570", dataSourceId: "ds_loan", type: "base", field: "overdue_days", agg: "avg", unit: "\u5929", precision: 0, enabled: true },
  { id: "m_overdue_cnt", name: "\u903E\u671F\u5BA2\u6237\u6570", group: "\u98CE\u9669", desc: "\u5B58\u5728\u903E\u671F\u8BB0\u5F55\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_loan", type: "base", field: "overdue_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_m1_amt", name: "M1\u903E\u671F\u91D1\u989D", group: "\u98CE\u9669", desc: "\u903E\u671F1-30\u5929\u91D1\u989D", dataSourceId: "ds_loan", type: "base", field: "m1_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_m2_amt", name: "M2\u903E\u671F\u91D1\u989D", group: "\u98CE\u9669", desc: "\u903E\u671F31-60\u5929\u91D1\u989D", dataSourceId: "ds_loan", type: "base", field: "m2_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_m3_amt", name: "M3\u903E\u671F\u91D1\u989D", group: "\u98CE\u9669", desc: "\u903E\u671F61-90\u5929\u91D1\u989D", dataSourceId: "ds_loan", type: "base", field: "m3_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_m4p_amt", name: "M4+\u903E\u671F\u91D1\u989D", group: "\u98CE\u9669", desc: "\u903E\u671F90\u5929\u4EE5\u4E0A\u91D1\u989D", dataSourceId: "ds_loan", type: "base", field: "m4p_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_risk_level_dist", name: "\u98CE\u9669\u7B49\u7EA7\u5206\u5E03", group: "\u98CE\u9669", desc: "\u4F4E/\u4E2D/\u9AD8\u98CE\u9669\u5BA2\u6237\u5206\u5E03", dataSourceId: "ds_customer", type: "base", field: "risk_level_dist", agg: "distinct", unit: "\u4EBA", precision: 0, enabled: true, vizType: "pie" },
  { id: "m_high_risk_cnt", name: "\u9AD8\u98CE\u9669\u5BA2\u6237\u6570", group: "\u98CE\u9669", desc: "\u98CE\u9669\u7B49\u7EA7=\u9AD8\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "high_risk_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_score_low_cnt", name: "\u4F4E\u884C\u4E3A\u5206\u5BA2\u6237\u6570", group: "\u98CE\u9669", desc: "\u884C\u4E3A\u5206\u4F4E\u4E8E40\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_behavior", type: "base", field: "score_low_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_anti_fraud_score", name: "\u53CD\u6B3A\u8BC8\u5747\u5206", group: "\u98CE\u9669", desc: "\u53CD\u6B3A\u8BC8\u8BC4\u5206\u5747\u503C", dataSourceId: "ds_api_demo", type: "base", field: "anti_fraud_score", agg: "avg", unit: "\u5206", precision: 0, enabled: true },
  { id: "m_credit_score", name: "\u4FE1\u7528\u5747\u5206", group: "\u98CE\u9669", desc: "\u5916\u90E8\u4FE1\u7528\u8BC4\u5206\u5747\u503C", dataSourceId: "ds_api_demo", type: "base", field: "credit_score", agg: "avg", unit: "\u5206", precision: 0, enabled: true },
  { id: "m_dti_ratio", name: "\u6536\u5165\u8D1F\u503A\u6BD4", group: "\u98CE\u9669", desc: "\u6708\u8D1F\u503A/\u6708\u6536\u5165\xD7100", dataSourceId: "ds_loan", type: "base", field: "dti_ratio", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_inq_cnt", name: "\u5F81\u4FE1\u67E5\u8BE2\u6B21\u6570", group: "\u98CE\u9669", desc: "\u8FD16\u4E2A\u6708\u5F81\u4FE1\u786C\u67E5\u8BE2\u6B21\u6570", dataSourceId: "ds_api_demo", type: "base", field: "inq_cnt", agg: "sum", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_inq_high_cnt", name: "\u67E5\u8BE2\u9891\u7E41\u5BA2\u6237\u6570", group: "\u98CE\u9669", desc: "\u8FD16\u4E2A\u6708\u67E5\u8BE2\u226510\u6B21\u5BA2\u6237", dataSourceId: "ds_api_demo", type: "base", field: "inq_high_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_rule_hit_cnt", name: "\u547D\u4E2D\u89C4\u5219\u6570", group: "\u98CE\u9669", desc: "\u9884\u8B66\u89C4\u5219\u547D\u4E2D\u6B21\u6570", dataSourceId: "ds_alert", type: "base", field: "rule_hit_cnt", agg: "sum", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_yellow_cnt", name: "\u9EC4\u706F\u9884\u8B66\u6570", group: "\u98CE\u9669", desc: "\u9EC4\u706F\u7EA7\u522B\u9884\u8B66\u6570", dataSourceId: "ds_alert", type: "base", field: "yellow_cnt", agg: "count", unit: "\u6761", precision: 0, enabled: true },
  { id: "m_multi_debt_cnt", name: "\u591A\u5934\u501F\u8D37\u5BA2\u6237\u6570", group: "\u98CE\u9669", desc: "\u8FD130\u5929\u7533\u8D37\u22653\u5BB6\u5BA2\u6237\u6570", dataSourceId: "ds_api_demo", type: "base", field: "multi_debt_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_court_cnt", name: "\u6D89\u8BC9\u5BA2\u6237\u6570", group: "\u98CE\u9669", desc: "\u6709\u6CD5\u5F8B\u8BC9\u8BBC\u8BB0\u5F55\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_api_demo", type: "base", field: "court_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_lost_debt_cnt", name: "\u5931\u4FE1\u5BA2\u6237\u6570", group: "\u98CE\u9669", desc: "\u5931\u4FE1\u88AB\u6267\u884C\u5BA2\u6237\u6570", dataSourceId: "ds_api_demo", type: "base", field: "lost_debt_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_relate_risk", name: "\u5173\u8054\u98CE\u9669\u5BA2\u6237\u6570", group: "\u98CE\u9669", desc: "\u5173\u8054\u4F01\u4E1A/\u62C5\u4FDD\u5708\u98CE\u9669\u5BA2\u6237", dataSourceId: "ds_sql_demo", type: "base", field: "relate_risk", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_txn_amt", name: "\u4EA4\u6613\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u4EA4\u6613\u91D1\u989D\u5408\u8BA1", dataSourceId: "ds_behavior", type: "base", field: "txn_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_txn_cnt", name: "\u4EA4\u6613\u7B14\u6570", group: "\u884C\u4E3A", desc: "\u4EA4\u6613\u7B14\u6570\u5408\u8BA1", dataSourceId: "ds_behavior", type: "base", field: "txn_cnt", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_txn_daily_avg", name: "\u65E5\u5747\u4EA4\u6613\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u6BCF\u65E5\u5E73\u5747\u4EA4\u6613\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "txn_daily_avg", agg: "avg", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_txn_month_avg", name: "\u6708\u5747\u6D88\u8D39\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u6BCF\u6708\u5E73\u5747\u6D88\u8D39\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "txn_month_avg", agg: "avg", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_txn_large_cnt", name: "\u5927\u989D\u4EA4\u6613\u7B14\u6570", group: "\u884C\u4E3A", desc: "\u5355\u7B14\u22655\u4E07\u4EA4\u6613\u7B14\u6570", dataSourceId: "ds_behavior", type: "base", field: "txn_large_cnt", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_txn_abnormal", name: "\u5F02\u5E38\u4EA4\u6613\u7B14\u6570", group: "\u884C\u4E3A", desc: "\u98CE\u63A7\u89C4\u5219\u6807\u8BB0\u7684\u5F02\u5E38\u4EA4\u6613", dataSourceId: "ds_behavior", type: "base", field: "txn_abnormal", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_login_cnt", name: "\u767B\u5F55\u6B21\u6570", group: "\u884C\u4E3A", desc: "\u7D2F\u8BA1\u767B\u5F55\u6B21\u6570", dataSourceId: "ds_behavior", type: "base", field: "login_cnt", agg: "sum", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_login_dev_cnt", name: "\u767B\u5F55\u8BBE\u5907\u6570", group: "\u884C\u4E3A", desc: "\u767B\u5F55\u8BBE\u5907\u53BB\u91CD\u6570", dataSourceId: "ds_behavior", type: "base", field: "login_dev_cnt", agg: "distinct", unit: "\u53F0", precision: 0, enabled: true },
  { id: "m_active_ratio", name: "\u6D3B\u8DC3\u7387", group: "\u884C\u4E3A", desc: "\u6D3B\u8DC3\u5BA2\u6237\u5360\u6BD4", dataSourceId: "ds_behavior", type: "base", field: "active_ratio", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_txn_type_dist", name: "\u6D88\u8D39\u7C7B\u578B\u5206\u5E03", group: "\u884C\u4E3A", desc: "\u6309\u6D88\u8D39\u7C7B\u578B\u5206\u7EC4\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "txn_type_dist", agg: "distinct", unit: "\u5143", precision: 0, enabled: true, vizType: "pie" },
  { id: "m_online_amt", name: "\u7EBF\u4E0A\u6D88\u8D39\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u7EBF\u4E0A\u6E20\u9053\u6D88\u8D39\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "online_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_offline_amt", name: "\u7EBF\u4E0B\u6D88\u8D39\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u7EBF\u4E0B\u6E20\u9053\u6D88\u8D39\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "offline_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_transfer_amt", name: "\u8F6C\u8D26\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u8F6C\u8D26\u652F\u51FA\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "transfer_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_transfer_cnt", name: "\u8F6C\u8D26\u7B14\u6570", group: "\u884C\u4E3A", desc: "\u8F6C\u8D26\u7B14\u6570", dataSourceId: "ds_behavior", type: "base", field: "transfer_cnt", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_receive_amt", name: "\u6536\u6B3E\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u6536\u6B3E\u5165\u8D26\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "receive_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_receive_cnt", name: "\u6536\u6B3E\u7B14\u6570", group: "\u884C\u4E3A", desc: "\u6536\u6B3E\u7B14\u6570", dataSourceId: "ds_behavior", type: "base", field: "receive_cnt", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_game_amt", name: "\u6E38\u620F\u5145\u503C\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u6E38\u620F\u7C7B\u5145\u503C\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "game_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_dining_amt", name: "\u9910\u996E\u6D88\u8D39\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u9910\u996E\u7C7B\u6D88\u8D39\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "dining_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_shopping_amt", name: "\u7F51\u8D2D\u6D88\u8D39\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u7535\u5546\u7C7B\u6D88\u8D39\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "shopping_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_travel_amt", name: "\u51FA\u884C\u6D88\u8D39\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u51FA\u884C\u7C7B\u6D88\u8D39\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "travel_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_pay_fail_cnt", name: "\u652F\u4ED8\u5931\u8D25\u7B14\u6570", group: "\u884C\u4E3A", desc: "\u652F\u4ED8\u5931\u8D25\u4EA4\u6613\u7B14\u6570", dataSourceId: "ds_behavior", type: "base", field: "pay_fail_cnt", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_refund_amt", name: "\u9000\u6B3E\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u9000\u6B3E\u91D1\u989D\u5408\u8BA1", dataSourceId: "ds_behavior", type: "base", field: "refund_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_withdraw_cnt", name: "\u63D0\u73B0\u6B21\u6570", group: "\u884C\u4E3A", desc: "\u63D0\u73B0\u6B21\u6570", dataSourceId: "ds_behavior", type: "base", field: "withdraw_cnt", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_fraud_hit", name: "\u6B3A\u8BC8\u547D\u4E2D\u6B21\u6570", group: "\u6B3A\u8BC8", desc: "\u6B3A\u8BC8\u89C4\u5219\u547D\u4E2D\u6B21\u6570", dataSourceId: "ds_api_demo", type: "base", field: "fraud_hit", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_fraud_hit_cust", name: "\u6B3A\u8BC8\u547D\u4E2D\u5BA2\u6237\u6570", group: "\u6B3A\u8BC8", desc: "\u547D\u4E2D\u6B3A\u8BC8\u89C4\u5219\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_api_demo", type: "base", field: "fraud_hit_cust", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_fraud_score", name: "\u6B3A\u8BC8\u8BC4\u5206", group: "\u6B3A\u8BC8", desc: "\u6B3A\u8BC8\u98CE\u9669\u8BC4\u5206\u5747\u503C", dataSourceId: "ds_api_demo", type: "base", field: "fraud_score", agg: "avg", unit: "\u5206", precision: 0, enabled: true },
  { id: "m_device_cnt", name: "\u8BBE\u5907\u6307\u7EB9\u6570", group: "\u6B3A\u8BC8", desc: "\u8BBE\u5907\u6307\u7EB9\u53BB\u91CD\u6570", dataSourceId: "ds_behavior", type: "base", field: "device_cnt", agg: "distinct", unit: "\u53F0", precision: 0, enabled: true },
  { id: "m_device_risk", name: "\u9AD8\u5371\u8BBE\u5907\u6570", group: "\u6B3A\u8BC8", desc: "\u6807\u8BB0\u9AD8\u5371\u8BBE\u5907\u6570\u91CF", dataSourceId: "ds_behavior", type: "base", field: "device_risk", agg: "count", unit: "\u53F0", precision: 0, enabled: true },
  { id: "m_ip_risk_cnt", name: "\u98CE\u9669IP\u4EA4\u6613\u7B14\u6570", group: "\u6B3A\u8BC8", desc: "\u98CE\u9669IP\u53D1\u8D77\u7684\u4EA4\u6613\u7B14\u6570", dataSourceId: "ds_behavior", type: "base", field: "ip_risk_cnt", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_geo_abnormal", name: "\u5F02\u5730\u767B\u5F55\u6B21\u6570", group: "\u6B3A\u8BC8", desc: "\u4E0E\u5E38\u7528\u5730\u4E0D\u7B26\u7684\u767B\u5F55", dataSourceId: "ds_behavior", type: "base", field: "geo_abnormal", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_stolen_cnt", name: "\u76D7\u5237\u4EA4\u6613\u7B14\u6570", group: "\u6B3A\u8BC8", desc: "\u7591\u4F3C\u76D7\u5237\u4EA4\u6613\u7B14\u6570", dataSourceId: "ds_api_demo", type: "base", field: "stolen_cnt", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_cashout_cnt", name: "\u5957\u73B0\u4EA4\u6613\u7B14\u6570", group: "\u6B3A\u8BC8", desc: "\u7591\u4F3C\u5957\u73B0\u4EA4\u6613\u7B14\u6570", dataSourceId: "ds_behavior", type: "base", field: "cashout_cnt", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_cashout_amt", name: "\u5957\u73B0\u4EA4\u6613\u91D1\u989D", group: "\u6B3A\u8BC8", desc: "\u7591\u4F3C\u5957\u73B0\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "cashout_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_aml_cnt", name: "\u53CD\u6D17\u94B1\u9884\u8B66\u6B21\u6570", group: "\u6B3A\u8BC8", desc: "\u53EF\u7591\u6D17\u94B1\u4EA4\u6613\u9884\u8B66\u6B21\u6570", dataSourceId: "ds_sql_demo", type: "base", field: "aml_cnt", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_aml_amt", name: "\u53EF\u7591\u4EA4\u6613\u91D1\u989D", group: "\u6B3A\u8BC8", desc: "\u53EF\u7591\u8D44\u91D1\u6D41\u52A8\u91D1\u989D", dataSourceId: "ds_sql_demo", type: "base", field: "aml_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_sybil_cnt", name: "\u56E2\u4F19\u5173\u8054\u5BA2\u6237\u6570", group: "\u6B3A\u8BC8", desc: "\u5173\u8054\u56E2\u4F19\u5BA2\u6237\u6570", dataSourceId: "ds_sql_demo", type: "base", field: "sybil_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_wool_cnt", name: "\u7F8A\u6BDB\u515A\u547D\u4E2D\u6B21\u6570", group: "\u6B3A\u8BC8", desc: "\u8425\u9500\u6D3B\u52A8\u5957\u5229\u547D\u4E2D\u6B21\u6570", dataSourceId: "ds_behavior", type: "base", field: "wool_cnt", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_proxy_ip", name: "\u4EE3\u7406IP\u4EA4\u6613\u7B14\u6570", group: "\u6B3A\u8BC8", desc: "\u4EE3\u7406/\u533F\u540DIP\u4EA4\u6613\u7B14\u6570", dataSourceId: "ds_behavior", type: "base", field: "proxy_ip", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_emu_cnt", name: "\u6A21\u62DF\u5668\u8BBE\u5907\u6570", group: "\u6B3A\u8BC8", desc: "\u6A21\u62DF\u5668\u73AF\u5883\u8BBE\u5907\u6570", dataSourceId: "ds_behavior", type: "base", field: "emu_cnt", agg: "count", unit: "\u53F0", precision: 0, enabled: true },
  { id: "m_root_cnt", name: "\u8D8A\u72F1\u8BBE\u5907\u6570", group: "\u6B3A\u8BC8", desc: "root/\u8D8A\u72F1\u8BBE\u5907\u6570", dataSourceId: "ds_behavior", type: "base", field: "root_cnt", agg: "count", unit: "\u53F0", precision: 0, enabled: true },
  { id: "m_batch_open", name: "\u6279\u91CF\u5F00\u6237\u6570\u91CF", group: "\u6B3A\u8BC8", desc: "\u540C\u8BBE\u5907\u6279\u91CF\u5F00\u6237\u6570", dataSourceId: "ds_sql_demo", type: "base", field: "batch_open", agg: "count", unit: "\u6237", precision: 0, enabled: true },
  { id: "m_cred_stuff", name: "\u649E\u5E93\u653B\u51FB\u6B21\u6570", group: "\u6B3A\u8BC8", desc: "\u649E\u5E93\u767B\u5F55\u653B\u51FB\u6B21\u6570", dataSourceId: "ds_sql_demo", type: "base", field: "cred_stuff", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_phish_cnt", name: "\u9493\u9C7C\u6295\u8BC9\u6B21\u6570", group: "\u6B3A\u8BC8", desc: "\u9493\u9C7C\u6B3A\u8BC8\u6295\u8BC9\u6B21\u6570", dataSourceId: "ds_sql_demo", type: "base", field: "phish_cnt", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_open_abn", name: "\u5F00\u6237\u5F02\u5E38\u7B14\u6570", group: "\u6B3A\u8BC8", desc: "\u5F00\u6237\u4FE1\u606F\u5F02\u5E38\u7B14\u6570", dataSourceId: "ds_sql_demo", type: "base", field: "open_abn", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_txn_abn_amt", name: "\u5F02\u5E38\u4EA4\u6613\u91D1\u989D", group: "\u6B3A\u8BC8", desc: "\u98CE\u63A7\u6807\u8BB0\u5F02\u5E38\u4EA4\u6613\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "txn_abn_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_collect_cnt", name: "\u50AC\u6536\u6B21\u6570", group: "\u5904\u7F6E", desc: "\u50AC\u6536\u8054\u7CFB\u6B21\u6570\u5408\u8BA1", dataSourceId: "ds_alert", type: "base", field: "collect_cnt", agg: "sum", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_recover_rate", name: "\u56DE\u6B3E\u7387", group: "\u5904\u7F6E", desc: "\u50AC\u6536\u56DE\u6B3E\u91D1\u989D/\u5E94\u6536\u91D1\u989D", dataSourceId: "ds_alert", type: "base", field: "recover_rate", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_recover_amt", name: "\u50AC\u6536\u56DE\u6B3E\u91D1\u989D", group: "\u5904\u7F6E", desc: "\u50AC\u6536\u5B9E\u9645\u56DE\u6B3E\u91D1\u989D", dataSourceId: "ds_alert", type: "base", field: "recover_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_promise_cnt", name: "\u627F\u8BFA\u8FD8\u6B3E\u6B21\u6570", group: "\u5904\u7F6E", desc: "\u5BA2\u6237\u627F\u8BFA\u8FD8\u6B3E\u6B21\u6570", dataSourceId: "ds_alert", type: "base", field: "promise_cnt", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_promise_keep", name: "\u627F\u8BFA\u5C65\u7EA6\u7387", group: "\u5904\u7F6E", desc: "\u627F\u8BFA\u6309\u671F\u5C65\u7EA6\u6BD4\u4F8B", dataSourceId: "ds_alert", type: "base", field: "promise_keep", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_workorder_cnt", name: "\u50AC\u6536\u5DE5\u5355\u6570", group: "\u5904\u7F6E", desc: "\u50AC\u6536\u5DE5\u5355\u6570\u91CF", dataSourceId: "ds_alert", type: "base", field: "workorder_cnt", agg: "count", unit: "\u5355", precision: 0, enabled: true },
  { id: "m_workorder_overdue", name: "\u5DE5\u5355\u8D85\u65F6\u6570", group: "\u5904\u7F6E", desc: "\u8D85\u8FC7SLA\u672A\u5904\u7406\u5DE5\u5355", dataSourceId: "ds_alert", type: "base", field: "workorder_overdue", agg: "count", unit: "\u5355", precision: 0, enabled: true },
  { id: "m_lost_contact", name: "\u5931\u8054\u5BA2\u6237\u6570", group: "\u5904\u7F6E", desc: "\u50AC\u6536\u5931\u8054\u5BA2\u6237\u6570", dataSourceId: "ds_alert", type: "base", field: "lost_contact", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_contact_rate", name: "\u7535\u8BDD\u63A5\u901A\u7387", group: "\u5904\u7F6E", desc: "\u50AC\u6536\u7535\u8BDD\u63A5\u901A\u6BD4\u4F8B", dataSourceId: "ds_alert", type: "base", field: "contact_rate", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_outsource", name: "\u59D4\u5916\u50AC\u6536\u91D1\u989D", group: "\u5904\u7F6E", desc: "\u59D4\u5916\u673A\u6784\u627F\u63A5\u91D1\u989D", dataSourceId: "ds_alert", type: "base", field: "outsource", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_visit_cnt", name: "\u4E0A\u95E8\u50AC\u6536\u6B21\u6570", group: "\u5904\u7F6E", desc: "\u4E0A\u95E8\u50AC\u6536\u6B21\u6570", dataSourceId: "ds_alert", type: "base", field: "visit_cnt", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_lawsuit_cnt", name: "\u8BC9\u8BBC\u6848\u4EF6\u6570", group: "\u5904\u7F6E", desc: "\u50AC\u6536\u8BC9\u8BBC\u6848\u4EF6\u6570\u91CF", dataSourceId: "ds_alert", type: "base", field: "lawsuit_cnt", agg: "count", unit: "\u4EF6", precision: 0, enabled: true },
  { id: "m_writeoff_amt", name: "\u6838\u9500\u91D1\u989D", group: "\u5904\u7F6E", desc: "\u4E0D\u826F\u8D37\u6B3E\u6838\u9500\u91D1\u989D", dataSourceId: "ds_alert", type: "base", field: "writeoff_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_writeoff_recover", name: "\u6838\u9500\u56DE\u6536\u91D1\u989D", group: "\u5904\u7F6E", desc: "\u6838\u9500\u540E\u8FFD\u56DE\u91D1\u989D", dataSourceId: "ds_alert", type: "base", field: "writeoff_recover", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_relief_amt", name: "\u51CF\u514D\u91D1\u989D", group: "\u5904\u7F6E", desc: "\u51CF\u514D\u672C\u91D1\u5229\u606F\u91D1\u989D", dataSourceId: "ds_alert", type: "base", field: "relief_amt", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_collect_eff", name: "\u6709\u6548\u50AC\u6536\u7387", group: "\u5904\u7F6E", desc: "\u6709\u6548\u50AC\u6536\u8054\u7CFB/\u603B\u8054\u7CFB", dataSourceId: "ds_alert", type: "base", field: "collect_eff", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_promo_cnt", name: "\u4FC3\u6D3B\u5BA2\u6237\u6570", group: "\u8425\u9500", desc: "\u4FC3\u6D3B\u8425\u9500\u89E6\u8FBE\u5BA2\u6237\u6570", dataSourceId: "ds_behavior", type: "base", field: "promo_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_invite_cnt", name: "\u63D0\u989D\u9080\u8BF7\u6570", group: "\u8425\u9500", desc: "\u63D0\u989D\u9080\u8BF7\u53D1\u9001\u6B21\u6570", dataSourceId: "ds_customer", type: "base", field: "invite_cnt", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_cross_sell", name: "\u4EA4\u53C9\u9500\u552E\u6570", group: "\u8425\u9500", desc: "\u4EA4\u53C9\u9500\u552E\u6210\u4EA4\u6B21\u6570", dataSourceId: "ds_behavior", type: "base", field: "cross_sell", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_resp_rate", name: "\u8425\u9500\u54CD\u5E94\u7387", group: "\u8425\u9500", desc: "\u8425\u9500\u6D3B\u52A8\u54CD\u5E94\u6BD4\u4F8B", dataSourceId: "ds_behavior", type: "base", field: "resp_rate", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_conv_rate", name: "\u8F6C\u5316\u7387", group: "\u8425\u9500", desc: "\u8425\u9500\u7EBF\u7D22\u8F6C\u5316\u6BD4\u4F8B", dataSourceId: "ds_behavior", type: "base", field: "conv_rate", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_activate_rate", name: "\u6FC0\u6D3B\u7387", group: "\u8425\u9500", desc: "\u65B0\u5BA2\u6FC0\u6D3B\u6BD4\u4F8B", dataSourceId: "ds_behavior", type: "base", field: "activate_rate", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_retain_rate", name: "\u7559\u5B58\u7387", group: "\u8425\u9500", desc: "\u6B21\u6708\u7559\u5B58\u6BD4\u4F8B", dataSourceId: "ds_behavior", type: "base", field: "retain_rate", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_rebuy_rate", name: "\u590D\u8D2D\u7387", group: "\u8425\u9500", desc: "\u91CD\u590D\u6D88\u8D39\u6BD4\u4F8B", dataSourceId: "ds_behavior", type: "base", field: "rebuy_rate", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_refer_cnt", name: "\u63A8\u8350\u5BA2\u6237\u6570", group: "\u8425\u9500", desc: "\u8001\u5E26\u65B0\u63A8\u8350\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "refer_cnt", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_coupon_use", name: "\u4F18\u60E0\u5238\u4F7F\u7528\u6570", group: "\u8425\u9500", desc: "\u4F18\u60E0\u5238\u6838\u9500\u6570\u91CF", dataSourceId: "ds_behavior", type: "base", field: "coupon_use", agg: "count", unit: "\u5F20", precision: 0, enabled: true },
  { id: "m_activity_join", name: "\u6D3B\u52A8\u53C2\u4E0E\u4EBA\u6570", group: "\u8425\u9500", desc: "\u8425\u9500\u6D3B\u52A8\u53C2\u4E0E\u4EBA\u6570", dataSourceId: "ds_behavior", type: "base", field: "activity_join", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_sleep_wake", name: "\u6C89\u7761\u5524\u9192\u6570", group: "\u8425\u9500", desc: "\u6C89\u7761\u5BA2\u6237\u5524\u9192\u6570\u91CF", dataSourceId: "ds_behavior", type: "base", field: "sleep_wake", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_churn_warn", name: "\u6D41\u5931\u9884\u8B66\u5BA2\u6237\u6570", group: "\u8425\u9500", desc: "\u9884\u8B66\u6D41\u5931\u98CE\u9669\u5BA2\u6237\u6570", dataSourceId: "ds_behavior", type: "base", field: "churn_warn", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_churn_save", name: "\u6D41\u5931\u633D\u56DE\u6570", group: "\u8425\u9500", desc: "\u633D\u56DE\u6D41\u5931\u5BA2\u6237\u6570\u91CF", dataSourceId: "ds_behavior", type: "base", field: "churn_save", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_page_view", name: "\u9875\u9762\u6D4F\u89C8\u6B21\u6570", group: "\u4E8B\u4EF6\u5206\u6790", desc: "\u9875\u9762\u6D4F\u89C8 PV", dataSourceId: "ds_event", type: "base", field: "page_view", agg: "sum", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_btn_click", name: "\u6309\u94AE\u70B9\u51FB\u6B21\u6570", group: "\u4E8B\u4EF6\u5206\u6790", desc: "\u5173\u952E\u6309\u94AE\u70B9\u51FB\u6B21\u6570", dataSourceId: "ds_event", type: "base", field: "btn_click", agg: "sum", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_car_ratio", name: "\u8D44\u672C\u5145\u8DB3\u7387", group: "\u5408\u89C4", desc: "\u8D44\u672C\u5145\u8DB3\u7387\u76D1\u7BA1\u6307\u6807", dataSourceId: "ds_sql_demo", type: "base", field: "car_ratio", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_provision", name: "\u62E8\u5907\u8986\u76D6\u7387", group: "\u5408\u89C4", desc: "\u62E8\u5907\u8986\u76D6\u7387\u76D1\u7BA1\u6307\u6807", dataSourceId: "ds_sql_demo", type: "base", field: "provision", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_leverage", name: "\u6760\u6746\u7387", group: "\u5408\u89C4", desc: "\u6760\u6746\u7387\u76D1\u7BA1\u6307\u6807", dataSourceId: "ds_sql_demo", type: "base", field: "leverage", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_age_lt25", name: "25\u5C81\u4EE5\u4E0B\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u5E74\u9F84<25\u5C81\u7684\u5728\u8D37\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "age_lt25", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_age_50p", name: "50\u5C81\u4EE5\u4E0A\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u5E74\u9F84\u226550\u5C81\u7684\u5728\u8D37\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "age_50p", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_local_cust", name: "\u672C\u5730\u6237\u7C4D\u5BA2\u6237\u6570", group: "\u5BA2\u7FA4", desc: "\u6237\u7C4D\u5730\u4E0E\u5E38\u9A7B\u5730\u4E00\u81F4\u7684\u5BA2\u6237\u6570", dataSourceId: "ds_customer", type: "base", field: "local_cust", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_credit_fixed", name: "\u56FA\u5B9A\u6388\u4FE1\u989D\u5EA6", group: "\u6388\u4FE1", desc: "\u56FA\u5B9A\u989D\u5EA6\u6388\u4FE1\u603B\u989D", dataSourceId: "ds_customer", type: "base", field: "credit_fixed", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_credit_self", name: "\u81EA\u52A9\u63D0\u989D\u6B21\u6570", group: "\u6388\u4FE1", desc: "\u5BA2\u6237\u81EA\u52A9\u7533\u8BF7\u63D0\u989D\u6B21\u6570", dataSourceId: "ds_customer", type: "base", field: "credit_self", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_credit_reval", name: "\u989D\u5EA6\u91CD\u4F30\u6B21\u6570", group: "\u6388\u4FE1", desc: "\u7CFB\u7EDF\u989D\u5EA6\u91CD\u4F30\u6B21\u6570", dataSourceId: "ds_customer", type: "base", field: "credit_reval", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_loan_settle", name: "\u5F53\u6708\u7ED3\u6E05\u8D37\u6B3E", group: "\u8D37\u6B3E", desc: "\u5F53\u6708\u6B63\u5E38\u7ED3\u6E05\u8D37\u6B3E\u7B14\u6570", dataSourceId: "ds_loan", type: "base", field: "loan_settle", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_loan_migrate", name: "\u8D37\u6B3E\u8FC1\u5F99\u7387", group: "\u8D37\u6B3E", desc: "M0\u2192M1\u8FC1\u5F99\u6BD4\u4F8B", dataSourceId: "ds_loan", type: "base", field: "loan_migrate", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_loan_util_days", name: "\u8D37\u6B3E\u4F7F\u7528\u5929\u6570", group: "\u8D37\u6B3E", desc: "\u8D37\u6B3E\u5E73\u5747\u5B9E\u9645\u4F7F\u7528\u5929\u6570", dataSourceId: "ds_loan", type: "base", field: "loan_util_days", agg: "avg", unit: "\u5929", precision: 0, enabled: true },
  { id: "m_first_overdue", name: "\u9996\u903E\u7387", group: "\u98CE\u9669", desc: "\u65B0\u53D1\u653E\u8D37\u6B3E\u9996\u6B21\u903E\u671F\u6BD4\u4F8B", dataSourceId: "ds_loan", type: "base", field: "first_overdue", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_three_six", name: "\u8FDE\u4E09\u7D2F\u516D\u5BA2\u6237\u6570", group: "\u98CE\u9669", desc: "\u8FDE\u7EED3\u6B21/\u7D2F\u8BA16\u6B21\u903E\u671F\u5BA2\u6237", dataSourceId: "ds_loan", type: "base", field: "three_six", agg: "count", unit: "\u4EBA", precision: 0, enabled: true },
  { id: "m_sleep_cust", name: "\u7761\u7720\u5BA2\u6237\u5360\u6BD4", group: "\u98CE\u9669", desc: "30\u5929\u65E0\u4EA4\u6613\u5BA2\u6237\u5360\u6BD4", dataSourceId: "ds_behavior", type: "base", field: "sleep_cust", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_night_txn", name: "\u591C\u95F4\u6D88\u8D39\u91D1\u989D", group: "\u884C\u4E3A", desc: "22:00-06:00\u6D88\u8D39\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "night_txn", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_offsite_txn", name: "\u5F02\u5730\u6D88\u8D39\u91D1\u989D", group: "\u884C\u4E3A", desc: "\u975E\u5E38\u9A7B\u5730\u6D88\u8D39\u91D1\u989D", dataSourceId: "ds_behavior", type: "base", field: "offsite_txn", agg: "sum", unit: "\u5143", precision: 0, enabled: true },
  { id: "m_fake_info", name: "\u865A\u5047\u8D44\u6599\u7533\u8BF7\u6570", group: "\u6B3A\u8BC8", desc: "\u7533\u8BF7\u8D44\u6599\u9020\u5047\u7B14\u6570", dataSourceId: "ds_sql_demo", type: "base", field: "fake_info", agg: "count", unit: "\u7B14", precision: 0, enabled: true },
  { id: "m_collect_complaint", name: "\u50AC\u6536\u6295\u8BC9\u6B21\u6570", group: "\u5904\u7F6E", desc: "\u50AC\u6536\u76F8\u5173\u5BA2\u6237\u6295\u8BC9\u6B21\u6570", dataSourceId: "ds_alert", type: "base", field: "collect_complaint", agg: "count", unit: "\u6B21", precision: 0, enabled: true },
  { id: "m_pay_intent", name: "\u8FD8\u6B3E\u610F\u613F\u8BC4\u5206", group: "\u5904\u7F6E", desc: "\u5BA2\u6237\u8FD8\u6B3E\u610F\u613F\u8BC4\u5206\u5747\u503C", dataSourceId: "ds_alert", type: "base", field: "pay_intent", agg: "avg", unit: "\u5206", precision: 0, enabled: true },
  { id: "m_click_rate", name: "\u6309\u94AE\u70B9\u51FB\u7387", group: "\u4E8B\u4EF6\u5206\u6790", desc: "\u6309\u94AE\u70B9\u51FB/\u66DD\u5149\u6BD4\u4F8B", dataSourceId: "ds_event", type: "base", field: "click_rate", agg: "avg", unit: "%", precision: 2, enabled: true },
  { id: "m_stay_dur", name: "\u5E73\u5747\u505C\u7559\u65F6\u957F", group: "\u4E8B\u4EF6\u5206\u6790", desc: "\u9875\u9762\u5E73\u5747\u505C\u7559\u65F6\u957F", dataSourceId: "ds_event", type: "base", field: "stay_dur", agg: "avg", unit: "\u79D2", precision: 0, enabled: true },
  { "id": "m_pre_in_cnt", "name": "\u4ECA\u65E5\u8FDB\u4EF6\u91CF", "group": "\u8D37\u524D", "dataSourceId": "ds_pre_apply", "type": "base", "field": "apply_id", "agg": "count", "unit": "\u7B14", "precision": 0, "enabled": true, "desc": "\u4ECA\u65E5\u8FDB\u4EF6\u7533\u8BF7\u603B\u7B14\u6570" },
  { "id": "m_pre_pass_cnt", "name": "\u8FDB\u4EF6\u901A\u8FC7\u6570", "group": "\u8D37\u524D", "dataSourceId": "ds_pre_apply", "type": "base", "field": "apply_id", "agg": "count", "filters": [{ "field": "decision", "op": "eq", "value": "\u901A\u8FC7" }], "unit": "\u7B14", "precision": 0, "enabled": true, "desc": "\u5BA1\u6279\u7ED3\u8BBA=\u901A\u8FC7\u7684\u8FDB\u4EF6\u6570" },
  { "id": "m_pre_pass_rate", "name": "\u8FDB\u4EF6\u901A\u8FC7\u7387", "group": "\u8D37\u524D", "dataSourceId": "ds_pre_apply", "type": "derived", "formula": "m_pre_pass_cnt / m_pre_in_cnt * 100", "unit": "%", "precision": 1, "enabled": true, "desc": "\u901A\u8FC7\u6570/\u8FDB\u4EF6\u91CF" },
  { "id": "m_pre_fraud_cnt", "name": "\u6B3A\u8BC8\u547D\u4E2D\u4EF6\u6570", "group": "\u8D37\u524D", "dataSourceId": "ds_pre_apply", "type": "base", "field": "apply_id", "agg": "count", "filters": [{ "field": "fraud_hit", "op": "eq", "value": "\u662F" }], "unit": "\u4EF6", "precision": 0, "enabled": true, "desc": "\u6B3A\u8BC8\u547D\u4E2D=\u662F\u7684\u8FDB\u4EF6\u6570" },
  { "id": "m_pre_fraud_rate", "name": "\u6B3A\u8BC8\u547D\u4E2D\u7387", "group": "\u8D37\u524D", "dataSourceId": "ds_pre_apply", "type": "derived", "formula": "m_pre_fraud_cnt / m_pre_in_cnt * 100", "unit": "%", "precision": 1, "enabled": true, "desc": "\u6B3A\u8BC8\u547D\u4E2D\u4EF6\u6570/\u8FDB\u4EF6\u91CF" }
];
var SEED_STRATEGY = {
  tasks: [
    {
      id: "t001",
      name: "\u5168\u91CF\u5728\u8D37\u5BA2\u6237\u903E\u671F\u7387\u65E5\u626B",
      crowd: "\u5168\u91CF\u5728\u8D37\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "day",
      period: { "hours": ["00"] },
      metricIds: ["m_overdue_rate", "m_overdue_cnt"],
      output: "web",
      enabled: true,
      desc: "\u6BCF\u65E5 00:00 \u626B\u63CF\u5168\u91CF\u5728\u8D37\u5BA2\u7FA4\u903E\u671F\u7387\u4E0E\u903E\u671F\u5BA2\u6237\u6570\uFF0C\u8D85\u9608\u503C\u89E6\u53D1\u7EA2\u9EC4\u706F\u9884\u8B66",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t002",
      name: "\u4FE1\u7528\u5361\u5BA2\u7FA4\u903E\u671F\u62AC\u5934\u76D1\u63A7",
      crowd: "\u5B58\u91CF\u4FE1\u7528\u5361\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "day",
      period: { "hours": ["00"] },
      metricIds: ["m_overdue_rate", "m_m1_amt"],
      output: "web",
      enabled: true,
      desc: "\u4FE1\u7528\u5361\u5BA2\u7FA4 M1 \u903E\u671F\u91D1\u989D\u65E5\u7EA7\u8DDF\u8E2A\uFF0C\u62AC\u5934\u5373\u9884\u8B66",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t003",
      name: "\u6D88\u8D39\u8D37\u8D44\u4EA7\u8D28\u91CF\u65E5\u76D1\u63A7",
      crowd: "\u6D88\u8D39\u8D37\u5728\u8D37\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "day",
      period: { "hours": ["01"] },
      metricIds: ["m_overdue_rate", "m_loan_balance"],
      output: "web",
      enabled: true,
      desc: "\u6D88\u8D39\u8D37\u8D44\u4EA7\u8D28\u91CF\u4E0E\u4F59\u989D\u65E5\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t004",
      name: "\u7ECF\u8425\u8D37\u903E\u671F\u7387\u5468\u62A5",
      crowd: "\u7ECF\u8425\u8D37\u5728\u8D37\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "week",
      period: { "days": ["mon", "wed", "fri"], "hours": ["09"] },
      metricIds: ["m_overdue_rate"],
      output: "web",
      enabled: true,
      desc: "\u7ECF\u8425\u8D37\u903E\u671F\u7387\u5468\u5EA6\u8D8B\u52BF\uFF0C\u5468\u4E94 09:00 \u590D\u6838",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t005",
      name: "M1 \u903E\u671F\u91D1\u989D\u6EDA\u52A8\u76D1\u63A7",
      crowd: "\u5168\u91CF\u5728\u8D37\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "day",
      period: { "hours": ["02"] },
      metricIds: ["m_m1_amt", "m_overdue_cnt"],
      output: "web",
      enabled: true,
      desc: "M1 \u903E\u671F\u91D1\u989D\u6EDA\u52A8\u76D1\u63A7\uFF0C\u9632\u9996\u903E\u6076\u5316",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t006",
      name: "M2 \u903E\u671F\u8D44\u4EA7\u5468\u76D1\u63A7",
      crowd: "M1/M2 \u903E\u671F\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "week",
      period: { "days": ["tue"], "hours": ["09"] },
      metricIds: ["m_m2_amt"],
      output: "web",
      enabled: true,
      desc: "M2 \u903E\u671F\u8D44\u4EA7\u6BCF\u5468\u76D8\u70B9",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t007",
      name: "M3+ \u4E25\u91CD\u903E\u671F\u8D44\u4EA7\u76D1\u63A7",
      crowd: "M3+ \u903E\u671F\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "week",
      period: { "days": ["thu"], "hours": ["10"] },
      metricIds: ["m_m3_amt", "m_m4p_amt"],
      output: "web",
      enabled: true,
      desc: "M3+ \u4E25\u91CD\u903E\u671F\u8D44\u4EA7\u76D1\u63A7\uFF0C\u8054\u52A8\u5904\u7F6E\u7B56\u7565",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t008",
      name: "\u9996\u903E\u7387\u8D8B\u52BF\u76D1\u63A7",
      crowd: "\u65B0\u589E\u653E\u6B3E\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["09"] },
      metricIds: ["m_first_overdue"],
      output: "web",
      enabled: true,
      desc: "\u65B0\u5BA2\u9996\u903E\u7387\u5468\u76D1\u63A7\uFF0C\u8BC4\u4F30\u8FDB\u4EF6\u8D28\u91CF",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t009",
      name: "\u8FDE\u4E09\u7D2F\u516D\u9AD8\u98CE\u9669\u5BA2\u6237\u8BC6\u522B",
      crowd: "\u5168\u91CF\u5728\u8D37\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "month",
      period: { "hours": ["02"] },
      metricIds: ["m_three_six"],
      output: "web",
      enabled: true,
      desc: "\u8FDE\u4E09\u7D2F\u516D\uFF08\u8FDE\u7EED3\u671F/\u7D2F\u8BA16\u671F\u903E\u671F\uFF09\u5BA2\u6237\u6708\u5EA6\u8BC6\u522B",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t010",
      name: "\u903E\u671F\u5929\u6570\u5747\u503C\u76D1\u63A7",
      crowd: "\u903E\u671F\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "day",
      period: { "hours": ["03"] },
      metricIds: ["m_overdue_days"],
      output: "web",
      enabled: true,
      desc: "\u5E73\u5747\u903E\u671F\u5929\u6570\u65E5\u76D1\u63A7\uFF0C\u89C2\u5BDF\u50AC\u6536\u8FDB\u5C55",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t011",
      name: "\u7F5A\u606F\u6EDE\u7EB3\u91D1\u589E\u957F\u76D1\u63A7",
      crowd: "\u903E\u671F\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "month",
      period: { "hours": ["03"] },
      metricIds: ["m_loan_fine", "m_loan_latefee"],
      output: "web",
      enabled: true,
      desc: "\u7F5A\u606F/\u6EDE\u7EB3\u91D1\u6708\u5EA6\u589E\u957F\u76D1\u63A7\uFF0C\u8BC4\u4F30\u8BA1\u606F\u5408\u89C4",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t012",
      name: "\u4E94\u7EA7\u5206\u7C7B\u8FC1\u5F99\u76D1\u63A7",
      crowd: "\u5168\u91CF\u8D37\u6B3E\u8D44\u4EA7",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "month",
      period: { "hours": ["04"] },
      metricIds: ["m_loan_stage5", "m_loan_migrate"],
      output: "web",
      enabled: true,
      desc: "\u8D37\u6B3E\u4E94\u7EA7\u5206\u7C7B\u8FC1\u5F99\u6708\u5EA6\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t013",
      name: "\u4E0D\u826F\u8D37\u6B3E\u65B0\u589E\u76D1\u63A7",
      crowd: "\u5168\u91CF\u5728\u8D37\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "week",
      period: { "days": ["fri"], "hours": ["09"] },
      metricIds: ["m_npl_amt", "m_npl_rate"],
      output: "web",
      enabled: true,
      desc: "\u65B0\u589E\u4E0D\u826F\u8D37\u6B3E\u5468\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t014",
      name: "\u884C\u4E3A\u5206\u9AA4\u964D\u9884\u8B66",
      crowd: "\u884C\u4E3A\u5206\u226570 \u7684\u5B58\u91CF\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "day",
      period: { "hours": ["08"] },
      metricIds: ["m_score_avg"],
      output: "web",
      enabled: true,
      desc: "\u5BA2\u6237\u884C\u4E3A\u5206\u5355\u65E5\u9AA4\u964D\u89E6\u53D1\u5173\u6CE8",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t015",
      name: "\u4F4E\u884C\u4E3A\u5206\u5BA2\u6237\u6E05\u5355",
      crowd: "\u5168\u91CF\u6D3B\u8DC3\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "week",
      period: { "days": ["tue", "thu"], "hours": ["09"] },
      metricIds: ["m_score_low_cnt"],
      output: "web",
      enabled: true,
      desc: "\u884C\u4E3A\u5206\u6301\u7EED\u8D70\u4F4E\u5BA2\u6237\u540D\u5355\u5468\u66F4\u65B0",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t016",
      name: "\u9AD8\u989D\u5EA6\u5BA2\u6237\u7528\u4FE1\u7387\u76D1\u63A7",
      crowd: "\u6388\u4FE1\u989D\u5EA6\u226550\u4E07\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["10"] },
      metricIds: ["m_util_rate"],
      output: "web",
      enabled: true,
      desc: "\u9AD8\u655E\u53E3\u5BA2\u6237\u989D\u5EA6\u4F7F\u7528\u7387\u5468\u76D1\u63A7\uFF0C\u63A5\u8FD1\u4E0A\u9650\u63D0\u524D\u9884\u8B66",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t017",
      name: "\u989D\u5EA6\u4F7F\u7528\u7387\u8D8590%\u9884\u8B66",
      crowd: "\u5168\u90E8\u6388\u4FE1\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "day",
      period: { "hours": ["09"] },
      metricIds: ["m_util_high_cnt"],
      output: "web",
      enabled: true,
      desc: "\u989D\u5EA6\u4F7F\u7528\u7387>90% \u5BA2\u6237\u65E5\u9884\u8B66\uFF0C\u9632\u8FC7\u5EA6\u7528\u4FE1",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t018",
      name: "\u6388\u4FE1\u7F3A\u53E3\u5BA2\u6237\u76D1\u63A7",
      crowd: "\u6709\u6388\u4FE1\u7F3A\u53E3\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "week",
      period: { "days": ["wed"], "hours": ["10"] },
      metricIds: ["m_credit_gap"],
      output: "web",
      enabled: true,
      desc: "\u6388\u4FE1\u7F3A\u53E3\u5BA2\u6237\u5468\u76D8\u70B9\uFF0C\u8BC4\u4F30\u8865\u5145\u6388\u4FE1",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t019",
      name: "\u53EF\u7528\u989D\u5EA6\u9AA4\u964D\u76D1\u63A7",
      crowd: "\u5168\u90E8\u5728\u7528\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "day",
      period: { "hours": ["10"] },
      metricIds: ["m_avail_credit"],
      output: "web",
      enabled: true,
      desc: "\u53EF\u7528\u989D\u5EA6\u5355\u65E5\u9AA4\u964D\u76D1\u63A7\uFF0C\u9632\u5F02\u5E38\u900F\u652F",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t020",
      name: "\u5373\u5C06\u5230\u671F\u6388\u4FE1\u56DE\u6536\u76D1\u63A7",
      crowd: "\u6388\u4FE1\u4E34\u671F\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "month",
      period: { "hours": ["05"] },
      metricIds: ["m_credit_expire"],
      output: "web",
      enabled: true,
      desc: "\u5373\u5C06\u5230\u671F\u6388\u4FE1\u6708\u5EA6\u56DE\u6536\u8BA1\u5212\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t021",
      name: "\u6D89\u8BC9\u5BA2\u6237\u98CE\u9669\u76D1\u63A7",
      crowd: "\u5168\u91CF\u5728\u8D37\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["11"] },
      metricIds: ["m_court_cnt"],
      output: "web",
      enabled: true,
      desc: "\u65B0\u589E\u53F8\u6CD5\u6D89\u8BC9\u5BA2\u6237\u5468\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t022",
      name: "\u5931\u4FE1\u88AB\u6267\u884C\u4EBA\u76D1\u63A7",
      crowd: "\u5168\u91CF\u5728\u8D37\u5BA2\u6237",
      scene: "\u8D37\u4E2D\u98CE\u63A7",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["11"] },
      metricIds: ["m_lost_debt_cnt"],
      output: "web",
      enabled: true,
      desc: "\u65B0\u589E\u5931\u4FE1\u88AB\u6267\u884C\u4EBA\u5468\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t023",
      name: "\u5F02\u5E38\u767B\u5F55\u4E8B\u4EF6\u76D1\u63A7",
      crowd: "\u5168\u90E8\u767B\u5F55\u7528\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "hour",
      period: { "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], "hours": ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"] },
      metricIds: ["m_login_cnt", "m_login_dev_cnt"],
      output: "web",
      enabled: true,
      desc: "\u6309\u5C0F\u65F6\u626B\u63CF\u5F02\u5E38\u767B\u5F55\uFF08\u767B\u5F55\u9891\u6B21/\u8BBE\u5907\u6570\u7A81\u53D8\uFF09",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t024",
      name: "\u5F02\u5730\u767B\u5F55\u4E0E\u591C\u95F4\u6D88\u8D39\u76D1\u63A7",
      crowd: "\u5168\u90E8\u5728\u7528\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "day",
      period: { "hours": ["11"] },
      metricIds: ["m_geo_abnormal", "m_offsite_txn", "m_night_txn"],
      output: "web",
      enabled: true,
      desc: "\u5F02\u5730\u767B\u5F55+\u591C\u95F4/\u5F02\u5730\u6D88\u8D39\u7EC4\u5408\u5F02\u5E38\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t025",
      name: "\u5927\u989D\u4EA4\u6613\u5B9E\u65F6\u76D1\u63A7",
      crowd: "\u5355\u7B14\u226510\u4E07\u4EA4\u6613\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "minute",
      period: {},
      metricIds: ["m_txn_large_cnt"],
      output: "web",
      enabled: true,
      desc: "\u5927\u989D\u4EA4\u6613\u5206\u949F\u7EA7\u5B9E\u65F6\u9884\u8B66",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t026",
      name: "\u652F\u4ED8\u5931\u8D25\u7387\u76D1\u63A7",
      crowd: "\u5168\u90E8\u5728\u7528\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "day",
      period: { "hours": ["12"] },
      metricIds: ["m_pay_fail_cnt"],
      output: "web",
      enabled: true,
      desc: "\u652F\u4ED8\u5931\u8D25\u7B14\u6570\u65E5\u76D1\u63A7\uFF0C\u8BC6\u522B\u5361\u76D7\u5237/\u8D26\u6237\u5F02\u5E38",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t027",
      name: "\u53CD\u6B3A\u8BC8\u547D\u4E2D\u5B9E\u65F6\u76D1\u63A7",
      crowd: "\u5168\u90E8\u7533\u8BF7/\u5728\u7528\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "hour",
      period: { "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], "hours": ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"] },
      metricIds: ["m_fraud_hit", "m_fraud_hit_cust"],
      output: "web",
      enabled: true,
      desc: "\u53CD\u6B3A\u8BC8\u89C4\u5219\u547D\u4E2D\u5B9E\u65F6\u76D1\u63A7\uFF08\u542B\u9ED1\u540D\u5355\u547D\u4E2D\uFF09",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t028",
      name: "\u9AD8\u5371\u8BBE\u5907\u4E0E\u6A21\u62DF\u5668\u76D1\u63A7",
      crowd: "\u5168\u90E8\u5728\u7528\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "day",
      period: { "hours": ["13"] },
      metricIds: ["m_device_risk", "m_emu_cnt", "m_root_cnt"],
      output: "web",
      enabled: true,
      desc: "\u9AD8\u5371\u8BBE\u5907/\u6A21\u62DF\u5668/\u8D8A\u72F1\u8BBE\u5907\u65E5\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t029",
      name: "\u98CE\u9669IP\u4EA4\u6613\u76D1\u63A7",
      crowd: "\u5168\u90E8\u5728\u7528\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "day",
      period: { "hours": ["13"] },
      metricIds: ["m_ip_risk_cnt", "m_proxy_ip"],
      output: "web",
      enabled: true,
      desc: "\u98CE\u9669IP/\u4EE3\u7406IP\u4EA4\u6613\u65E5\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t030",
      name: "\u76D7\u5237\u4EA4\u6613\u76D1\u63A7",
      crowd: "\u5168\u90E8\u5728\u7528\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "hour",
      period: { "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], "hours": ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"] },
      metricIds: ["m_stolen_cnt"],
      output: "web",
      enabled: true,
      desc: "\u76D7\u5237\u4EA4\u6613\u5C0F\u65F6\u7EA7\u5B9E\u65F6\u9884\u8B66",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t031",
      name: "\u5957\u73B0\u4EA4\u6613\u76D1\u63A7",
      crowd: "\u4FE1\u7528\u5361/\u53D6\u73B0\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "day",
      period: { "hours": ["14"] },
      metricIds: ["m_cashout_cnt", "m_cashout_amt"],
      output: "web",
      enabled: true,
      desc: "\u4FE1\u7528\u5361\u5957\u73B0\u4EA4\u6613\u65E5\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t032",
      name: "\u53CD\u6D17\u94B1\u53EF\u7591\u4EA4\u6613\u76D1\u63A7",
      crowd: "\u5168\u90E8\u5728\u7528\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "hour",
      period: { "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], "hours": ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"] },
      metricIds: ["m_aml_cnt", "m_aml_amt"],
      output: "web",
      enabled: true,
      desc: "\u53EF\u7591\u8DE8\u5883\u8D44\u91D1\u6D41\u52A8\u5C0F\u65F6\u7EA7\u5B9E\u65F6\u9884\u8B66",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t033",
      name: "\u56E2\u4F19\u5173\u8054\u98CE\u9669\u76D1\u63A7",
      crowd: "\u5168\u90E8\u5728\u7528\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["14"] },
      metricIds: ["m_sybil_cnt"],
      output: "web",
      enabled: true,
      desc: "\u6B3A\u8BC8\u56E2\u4F19\u5173\u8054\u5BA2\u6237\u5468\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t034",
      name: "\u6279\u91CF\u5F00\u6237\u4E0E\u649E\u5E93\u76D1\u63A7",
      crowd: "\u5F00\u6237/\u767B\u5F55\u7528\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "day",
      period: { "hours": ["15"] },
      metricIds: ["m_batch_open", "m_cred_stuff"],
      output: "web",
      enabled: true,
      desc: "\u540CIP\u6279\u91CF\u5F00\u6237/\u649E\u5E93\u653B\u51FB\u65E5\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t035",
      name: "\u591A\u5934\u501F\u8D37\u5BA2\u6237\u76D1\u63A7",
      crowd: "\u5168\u91CF\u5728\u8D37\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["15"] },
      metricIds: ["m_multi_debt_cnt"],
      output: "web",
      enabled: true,
      desc: "\u591A\u5934\u501F\u8D37\uFF08\u591A\u5E73\u53F0\u5171\u503A\uFF09\u5BA2\u6237\u5468\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t036",
      name: "\u5F81\u4FE1\u67E5\u8BE2\u6FC0\u589E\u76D1\u63A7",
      crowd: "\u5168\u91CF\u5728\u8D37\u5BA2\u6237",
      scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["15"] },
      metricIds: ["m_inq_high_cnt", "m_inq_cnt"],
      output: "web",
      enabled: true,
      desc: "\u5F81\u4FE1\u67E5\u8BE2\u9891\u6B21\u6FC0\u589E\u5468\u76D1\u63A7\uFF0C\u8BC6\u522B\u5171\u503A\u98CE\u9669",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t037",
      name: "\u50AC\u6536\u5DE5\u5355\u54CD\u5E94\u76D1\u63A7",
      crowd: "\u50AC\u6536\u961F\u5217\u5BA2\u6237",
      scene: "\u8D37\u540E\u50AC\u6536",
      granularity: "day",
      period: { "hours": ["17"] },
      metricIds: ["m_workorder_cnt", "m_workorder_overdue"],
      output: "web",
      enabled: true,
      desc: "\u50AC\u6536\u5DE5\u5355 2 \u5C0F\u65F6\u54CD\u5E94\u7387\u65E5\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t038",
      name: "\u5931\u8054\u5BA2\u6237\u76D1\u63A7",
      crowd: "\u903E\u671F\u5BA2\u6237",
      scene: "\u8D37\u540E\u50AC\u6536",
      granularity: "day",
      period: { "hours": ["18"] },
      metricIds: ["m_lost_contact", "m_contact_rate"],
      output: "web",
      enabled: true,
      desc: "\u5931\u8054\u5BA2\u6237\u6570\u4E0E\u7535\u8BDD\u63A5\u901A\u7387\u65E5\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t039",
      name: "\u627F\u8BFA\u8FD8\u6B3E\u5C65\u7EA6\u76D1\u63A7",
      crowd: "\u627F\u8BFA\u8FD8\u6B3E\u5BA2\u6237",
      scene: "\u8D37\u540E\u50AC\u6536",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["16"] },
      metricIds: ["m_promise_cnt", "m_promise_keep"],
      output: "web",
      enabled: true,
      desc: "\u627F\u8BFA\u8FD8\u6B3E\u5C65\u7EA6\u7387\u5468\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t040",
      name: "\u50AC\u6536\u56DE\u6B3E\u7387\u76D1\u63A7",
      crowd: "\u50AC\u6536\u961F\u5217\u5BA2\u6237",
      scene: "\u8D37\u540E\u50AC\u6536",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["16"] },
      metricIds: ["m_recover_rate", "m_recover_amt"],
      output: "web",
      enabled: true,
      desc: "\u50AC\u6536\u56DE\u6B3E\u7387\u4E0E\u56DE\u6B3E\u91D1\u989D\u5468\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5DF2\u4E0A\u7EBF"
    },
    {
      id: "t041",
      name: "\u59D4\u5916\u50AC\u6536\u8FDB\u5EA6\u76D1\u63A7",
      crowd: "\u59D4\u5916\u8D44\u4EA7\u5BA2\u6237",
      scene: "\u8D37\u540E\u50AC\u6536",
      granularity: "month",
      period: { "hours": ["06"] },
      metricIds: ["m_outsource"],
      output: "web",
      enabled: true,
      desc: "\u59D4\u5916\u50AC\u6536\u91D1\u989D\u4E0E\u8FDB\u5EA6\u6708\u5EA6\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u590D\u5BA1\u4E2D"
    },
    {
      id: "t042",
      name: "\u8BC9\u8BBC\u4E0E\u6838\u9500\u76D1\u63A7",
      crowd: "\u8BC9\u8BBC/\u6838\u9500\u8D44\u4EA7",
      scene: "\u8D37\u540E\u50AC\u6536",
      granularity: "month",
      period: { "hours": ["07"] },
      metricIds: ["m_lawsuit_cnt", "m_writeoff_amt"],
      output: "web",
      enabled: true,
      desc: "\u8BC9\u8BBC\u6848\u4EF6\u4E0E\u6838\u9500\u91D1\u989D\u6708\u5EA6\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u590D\u5BA1\u4E2D"
    },
    {
      id: "t043",
      name: "\u6838\u9500\u56DE\u6536\u8BC4\u4F30",
      crowd: "\u6838\u9500\u8D44\u4EA7",
      scene: "\u8D37\u540E\u50AC\u6536",
      granularity: "month",
      period: { "hours": ["07"] },
      metricIds: ["m_writeoff_recover"],
      output: "web",
      enabled: true,
      desc: "\u6838\u9500\u5BA2\u6237\u56DE\u6536\u7387\u6708\u5EA6\u8BC4\u4F30",
      flowKey: "f-online-approve",
      flowState: "\u590D\u5BA1\u4E2D"
    },
    {
      id: "t044",
      name: "\u50AC\u6536\u6295\u8BC9\u5408\u89C4\u76D1\u63A7",
      crowd: "\u50AC\u6536\u961F\u5217\u5BA2\u6237",
      scene: "\u8D37\u540E\u50AC\u6536",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["17"] },
      metricIds: ["m_collect_complaint"],
      output: "web",
      enabled: true,
      desc: "\u50AC\u6536\u6295\u8BC9\u96C6\u4E2D\u5EA6\u5468\u76D1\u63A7\uFF0C\u5408\u89C4\u7EA2\u7EBF",
      flowKey: "f-online-approve",
      flowState: "\u590D\u5BA1\u4E2D"
    },
    {
      id: "t045",
      name: "\u6709\u6548\u50AC\u6536\u7387\u76D1\u63A7",
      crowd: "\u50AC\u6536\u961F\u5217\u5BA2\u6237",
      scene: "\u8D37\u540E\u50AC\u6536",
      granularity: "day",
      period: { "hours": ["19"] },
      metricIds: ["m_collect_eff"],
      output: "web",
      enabled: true,
      desc: "\u6709\u6548\u50AC\u6536\u7387\u65E5\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u590D\u5BA1\u4E2D"
    },
    {
      id: "t046",
      name: "\u7761\u7720\u5BA2\u6237\u5524\u9192\u76D1\u63A7",
      crowd: "\u7761\u7720\u5BA2\u6237",
      scene: "\u5B58\u91CF\u8FD0\u8425",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["18"] },
      metricIds: ["m_sleep_wake", "m_sleep_cust"],
      output: "web",
      enabled: true,
      desc: "\u7761\u7720\u5BA2\u6237\u5524\u9192\u6D3B\u52A8\u6548\u679C\u5468\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u521D\u5BA1\u4E2D"
    },
    {
      id: "t047",
      name: "\u63D0\u989D\u673A\u4F1A\u8BC6\u522B",
      crowd: "\u6D3B\u8DC3\u4F18\u8D28\u5BA2\u6237",
      scene: "\u5B58\u91CF\u8FD0\u8425",
      granularity: "week",
      period: { "days": ["mon"], "hours": ["18"] },
      metricIds: ["m_invite_cnt", "m_util_rate"],
      output: "web",
      enabled: true,
      desc: "\u63D0\u989D\u9080\u8BF7\u5019\u9009\u8BC6\u522B\uFF0C\u4FC3\u7528\u4FE1\u589E\u6536",
      flowKey: "f-online-approve",
      flowState: "\u521D\u5BA1\u4E2D"
    },
    {
      id: "t048",
      name: "\u6D41\u5931\u9884\u8B66\u4E0E\u633D\u56DE",
      crowd: "\u6D3B\u8DC3\u5EA6\u9AA4\u964D\u5BA2\u6237",
      scene: "\u5B58\u91CF\u8FD0\u8425",
      granularity: "week",
      period: { "days": ["tue"], "hours": ["18"] },
      metricIds: ["m_churn_warn", "m_churn_save"],
      output: "web",
      enabled: true,
      desc: "\u8001\u5BA2\u6D41\u5931\u9884\u8B66\u4E0E\u633D\u56DE\u5468\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u521D\u5BA1\u4E2D"
    },
    {
      id: "t049",
      name: "\u8001\u5BA2\u4FC3\u6D3B\u76D1\u63A7",
      crowd: "\u5B58\u91CF\u5728\u8D37\u5BA2\u6237",
      scene: "\u5B58\u91CF\u8FD0\u8425",
      granularity: "week",
      period: { "days": ["wed"], "hours": ["18"] },
      metricIds: ["m_promo_cnt", "m_activity_join"],
      output: "web",
      enabled: true,
      desc: "\u4FC3\u6D3B\u6D3B\u52A8\u53C2\u4E0E\u5EA6\u5468\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5F85\u4E0A\u7EBF"
    },
    {
      id: "t050",
      name: "\u4EA4\u53C9\u9500\u552E\u673A\u4F1A\u76D1\u63A7",
      crowd: "\u5B58\u91CF\u4F18\u8D28\u5BA2\u6237",
      scene: "\u5B58\u91CF\u8FD0\u8425",
      granularity: "week",
      period: { "days": ["thu"], "hours": ["18"] },
      metricIds: ["m_cross_sell", "m_resp_rate"],
      output: "web",
      enabled: true,
      desc: "\u4EA4\u53C9\u9500\u552E\u673A\u4F1A\u8BC6\u522B\u4E0E\u54CD\u5E94\u7387\u5468\u76D1\u63A7",
      flowKey: "f-online-approve",
      flowState: "\u5F85\u4E0A\u7EBF"
    }
  ],
  rules: [
    {
      id: "r_ip",
      name: "IP \u6709\u503C",
      logic: "and",
      conds: [{ id: "c_ip", metricId: "m_ip", op: "exists", value: "" }],
      level: "YELLOW",
      groupValue: ["\u603B\u4F53"],
      triggerMode: "int",
      compare: "lt",
      baseline: "yesterday",
      threshold: 0,
      desc: "IP \u5B57\u6BB5\u6709\u503C\uFF08\u4E8B\u4EF6\u5C5E\u6027\u975E\u7A7A\uFF09",
      alertType: "\u53CD\u6B3A\u8BC8\u547D\u4E2D"
    },
    {
      id: "r_startup",
      name: "$\u542F\u52A8\u65F6\u957F \u5927\u4E8E\u9608\u503C",
      logic: "and",
      conds: [{ id: "c_su", metricId: "m_startup_dur", op: "gt", value: 0 }],
      level: "YELLOW",
      groupValue: ["\u603B\u4F53"],
      triggerMode: "int",
      compare: "lt",
      baseline: "yesterday",
      threshold: 0,
      desc: "$\u542F\u52A8\u65F6\u957F \u5927\u4E8E\u9608\u503C\uFF1B\u9608\u503C\u6587\u4EF6\u672A\u89E3\u6790\uFF0C\u6682\u7F6E 0\uFF0C\u5F85\u4F60\u786E\u8BA4\u771F\u5B9E\u503C",
      alertType: "\u884C\u4E3A\u8BC4\u5206\u4E0B\u964D"
    },
    {
      id: "r_country",
      name: "\u56FD\u5BB6 \u5305\u542B\u767D\u540D\u5355",
      logic: "and",
      conds: [{ id: "c_ct", metricId: "m_country", op: "contains", value: "\u4E2D\u56FD,\u7F8E\u56FD,\u65E5\u672C,\u745E\u58EB,\u5FB7\u56FD,\u571F\u8033\u5176,\u5370\u5EA6,\u82F1\u56FD,\u5965\u5730\u5229" }],
      level: "RED",
      groupValue: ["\u603B\u4F53"],
      triggerMode: "int",
      compare: "lt",
      baseline: "yesterday",
      threshold: 0,
      desc: "\u56FD\u5BB6 \u5305\u542B\uFF08\u4E2D\u56FD/\u7F8E\u56FD/\u65E5\u672C/\u745E\u58EB/\u5FB7\u56FD/\u571F\u8033\u5176/\u5370\u5EA6/\u82F1\u56FD/\u5965\u5730\u5229\uFF09",
      alertType: "\u53CD\u6B3A\u8BC8\u547D\u4E2D"
    }
  ],
  disposes: [
    {
      id: "d1",
      name: "\u7EA2\u706F\xB7\u81EA\u52A8\u51BB\u7ED3",
      triggerLevel: "RED",
      action: "\u51BB\u7ED3",
      targetSystem: "\u6838\u5FC3\u4FE1\u8D37\u7CFB\u7EDF",
      needApprove: true,
      needNotify: true,
      assignTo: "\u98CE\u63A7\u4E3B\u7BA1",
      desc: "\u903E\u671F90\u5929\u4EE5\u4E0A\u6216\u6B3A\u8BC8\u89C4\u5219\u547D\u4E2D\uFF1A\u81EA\u52A8\u51BB\u7ED3\u6388\u4FE1\u989D\u5EA6\uFF0C\u7981\u6B62\u65B0\u589E\u7528\u4FE1"
    },
    {
      id: "d2",
      name: "\u7EA2\u706F\xB7\u7ACB\u5373\u6B62\u4ED8",
      triggerLevel: "RED",
      action: "\u6B62\u4ED8",
      targetSystem: "\u6838\u5FC3\u4FE1\u8D37\u7CFB\u7EDF",
      needApprove: true,
      needNotify: true,
      assignTo: "\u98CE\u63A7\u4E3B\u7BA1",
      desc: "\u76D7\u5237/\u5957\u73B0/\u53CD\u6D17\u94B1\u5ACC\u7591\uFF1A\u7ACB\u5373\u6B62\u4ED8\u8D26\u6237\uFF0C\u963B\u65AD\u8D44\u91D1\u6D41\u51FA"
    },
    {
      id: "d3",
      name: "\u7EA2\u706F\xB7\u7D27\u6025\u964D\u989D",
      triggerLevel: "RED",
      action: "\u964D\u989D",
      targetSystem: "\u6838\u5FC3\u4FE1\u8D37\u7CFB\u7EDF",
      needApprove: true,
      needNotify: true,
      assignTo: "\u98CE\u63A7\u4E3B\u7BA1",
      desc: "\u591A\u5934\u501F\u8D37\u6216\u5F81\u4FE1\u5927\u5E45\u6076\u5316\uFF1A\u989D\u5EA6\u964D\u81F3\u539F 50%\uFF0C\u63A7\u5236\u655E\u53E3"
    },
    {
      id: "d4",
      name: "\u7EA2\u706F\xB7\u59D4\u5916\u9884\u50AC",
      triggerLevel: "RED",
      action: "\u9884\u50AC",
      targetSystem: "\u50AC\u6536\u7CFB\u7EDF",
      needApprove: false,
      needNotify: true,
      assignTo: "\u50AC\u6536\u4E13\u5458",
      desc: "M3+ \u59D4\u5916\u524D\u96C6\u4E2D\u9884\u50AC\u4E00\u8F6E\uFF0C\u540C\u6B65\u66F4\u65B0\u8054\u7CFB\u65B9\u5F0F"
    },
    {
      id: "d5",
      name: "\u9EC4\u706F\xB7\u9884\u8B66\u964D\u989D",
      triggerLevel: "YELLOW",
      action: "\u964D\u989D",
      targetSystem: "\u6838\u5FC3\u4FE1\u8D37\u7CFB\u7EDF",
      needApprove: false,
      needNotify: true,
      assignTo: "\u98CE\u63A7\u4E3B\u7BA1",
      desc: "\u884C\u4E3A\u5206\u8FDE\u7EED\u4E0B\u964D\uFF1A\u989D\u5EA6\u4E0B\u8C03 20% \u89C2\u5BDF\u671F 3 \u4E2A\u6708"
    },
    {
      id: "d6",
      name: "\u9EC4\u706F\xB7\u77ED\u4FE1\u9884\u50AC",
      triggerLevel: "YELLOW",
      action: "\u9884\u50AC",
      targetSystem: "\u6D88\u606F\u4E2D\u5FC3",
      needApprove: false,
      needNotify: true,
      assignTo: "\u50AC\u6536\u4E13\u5458",
      desc: "M1 \u903E\u671F\uFF1A\u77ED\u4FE1+\u667A\u80FD\u8BED\u97F3\u53CC\u6E20\u9053\u63D0\u9192\u8FD8\u6B3E"
    },
    {
      id: "d7",
      name: "\u9EC4\u706F\xB7\u9996\u903E\u5173\u6CE8",
      triggerLevel: "YELLOW",
      action: "\u5173\u6CE8",
      targetSystem: "\u5DE5\u5355\u7CFB\u7EDF",
      needApprove: false,
      needNotify: false,
      assignTo: "\u5BA2\u6237\u7ECF\u7406",
      desc: "\u9996\u6B21\u903E\u671F\u5BA2\u6237\u52A0\u5165\u5173\u6CE8\u540D\u5355\uFF0C\u4EBA\u5DE5\u7535\u8BDD\u56DE\u8BBF\u4E86\u89E3\u539F\u56E0"
    },
    {
      id: "d8",
      name: "\u9EC4\u706F\xB7\u5927\u989D\u4EBA\u5DE5\u590D\u6838",
      triggerLevel: "YELLOW",
      action: "\u5173\u6CE8",
      targetSystem: "\u5DE5\u5355\u7CFB\u7EDF",
      needApprove: true,
      needNotify: false,
      assignTo: "\u5BA2\u6237\u7ECF\u7406",
      desc: "\u5355\u7B14\u5927\u989D\u63D0\u73B0/\u8F6C\u8D26\u89E6\u53D1\u4EBA\u5DE5\u590D\u6838\uFF0C\u6838\u5B9E\u7528\u9014"
    },
    {
      id: "d9",
      name: "\u673A\u4F1A\xB7\u4F18\u8D28\u63D0\u989D",
      triggerLevel: "OPPORTUNITY",
      action: "\u63D0\u989D",
      targetSystem: "\u8425\u9500\u7CFB\u7EDF",
      needApprove: true,
      needNotify: true,
      assignTo: "\u5BA2\u6237\u7ECF\u7406",
      desc: "\u6D3B\u8DC3\u4F18\u8D28\u5BA2\u6237\uFF1A\u989D\u5EA6\u4E0A\u6D6E 20% \u4FC3\u8FDB\u7528\u4FE1\uFF0C\u63D0\u5347\u8D44\u4EA7\u6536\u76CA"
    },
    {
      id: "d10",
      name: "\u673A\u4F1A\xB7\u7761\u7720\u5524\u9192",
      triggerLevel: "OPPORTUNITY",
      action: "\u4FC3\u6D3B",
      targetSystem: "\u8425\u9500\u7CFB\u7EDF",
      needApprove: false,
      needNotify: true,
      assignTo: "\u8FD0\u8425\u4E13\u5458",
      desc: "30 \u5929\u65E0\u4EA4\u6613\u7761\u7720\u6237\uFF1A\u5B9A\u5411\u6743\u76CA\u89E6\u8FBE\uFF0C\u5524\u9192\u590D\u8D37"
    },
    {
      id: "d11",
      name: "\u7EFF\u706F\xB7\u5065\u5EB7\u4FDD\u6301",
      triggerLevel: "GREEN",
      action: "\u5173\u6CE8",
      targetSystem: "\u5DE5\u5355\u7CFB\u7EDF",
      needApprove: false,
      needNotify: false,
      assignTo: "\u5BA2\u6237\u7ECF\u7406",
      desc: "\u98CE\u9669\u6062\u590D\u6B63\u5E38\u5BA2\u6237\uFF1A\u6301\u7EED\u89C2\u5BDF 3 \u4E2A\u6708\uFF0C\u65E0\u5F02\u5E38\u540E\u89E3\u9664\u76D1\u63A7"
    },
    {
      id: "d12",
      name: "\u7EFF\u706F\xB7\u5B9A\u671F\u4FC3\u6D3B",
      triggerLevel: "GREEN",
      action: "\u4FC3\u6D3B",
      targetSystem: "\u8425\u9500\u7CFB\u7EDF",
      needApprove: false,
      needNotify: true,
      assignTo: "\u8FD0\u8425\u4E13\u5458",
      desc: "\u5065\u5EB7\u5BA2\u7FA4\uFF1A\u5B9A\u671F\u8425\u9500\u6D3B\u52A8\u7EF4\u6301\u6D3B\u8DC3\u5EA6\u4E0E\u9ECF\u6027"
    }
  ]
};
var SEED_ALERTS = [
  {
    alert_id: "AL0808-001",
    cust_id: "C0001",
    cust_name: "\u5F20*\u660E",
    alert_type: "\u8D1F\u503A\u6FC0\u589E",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "RED",
    alert_date: "2026-08-08",
    rule_name: "\u8FD130\u5929\u65B0\u589E\u8D37\u6B3E\u22653\u7B14",
    metric_value: 5,
    threshold: 3,
    flowKey: "f-alert-limit",
    flowState: "\u98CE\u9669\u7814\u5224\u4E2D"
  },
  {
    alert_id: "AL0808-002",
    cust_id: "C0009",
    cust_name: "\u4F55*\u6770",
    alert_type: "\u8D1F\u503A\u6FC0\u589E",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "YELLOW",
    alert_date: "2026-08-08",
    rule_name: "\u6708\u8FD8\u6B3E\u989D/\u6708\u6536\u5165>70%",
    metric_value: 73,
    threshold: 70,
    flowKey: "f-alert-watch",
    flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-003",
    cust_id: "C0010",
    cust_name: "\u7F57*\u5CF0",
    alert_type: "\u591A\u5934\u501F\u8D37",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "RED",
    alert_date: "2026-08-08",
    rule_name: "\u8FD17\u5929\u5F81\u4FE1\u67E5\u8BE2\u22655\u6B21",
    metric_value: 7,
    threshold: 5,
    flowKey: "f-alert-limit",
    flowState: "\u964D\u989D\u6267\u884C\u4E2D"
  },
  {
    alert_id: "AL0808-004",
    cust_id: "C0002",
    cust_name: "\u674E*\u534E",
    alert_type: "\u591A\u5934\u501F\u8D37",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "YELLOW",
    alert_date: "2026-08-08",
    rule_name: "\u540C\u65F6\u5728\u8D37\u5E73\u53F0\u22654\u5BB6",
    metric_value: 5,
    threshold: 4,
    flowKey: "f-alert-watch",
    flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-005",
    cust_id: "C0005",
    cust_name: "\u9648*\u654F",
    alert_type: "\u903E\u671F\u9884\u8B66",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "RED",
    alert_date: "2026-08-08",
    rule_name: "\u8FD8\u6B3E\u65E5\u4E34\u8FD1\u4E14\u4F59\u989D\u4E0D\u8DB3",
    metric_value: 1,
    threshold: 0,
    flowKey: "f-alert-precollect",
    flowState: "\u9884\u50AC\u6267\u884C\u4E2D"
  },
  {
    alert_id: "AL0808-006",
    cust_id: "C0011",
    cust_name: "\u8BB8*\u6587",
    alert_type: "\u903E\u671F\u9884\u8B66",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "YELLOW",
    alert_date: "2026-08-08",
    rule_name: "\u5386\u53F2\u8FD8\u6B3E\u65E5\u5EF6\u8FDF\u22652\u5929",
    metric_value: 2,
    threshold: 1,
    flowKey: "f-alert-precollect",
    flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-007",
    cust_id: "C0004",
    cust_name: "\u8D75*\u5F3A",
    alert_type: "\u53F8\u6CD5\u6D89\u8BC9",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "RED",
    alert_date: "2026-08-08",
    rule_name: "\u65B0\u589E\u88AB\u6267\u884C\u8BB0\u5F55",
    metric_value: 1,
    threshold: 0,
    flowKey: "f-alert-freeze",
    flowState: "\u51BB\u7ED3\u6B62\u4ED8\u4E2D"
  },
  {
    alert_id: "AL0808-008",
    cust_id: "C0012",
    cust_name: "\u97E9*\u78CA",
    alert_type: "\u53F8\u6CD5\u6D89\u8BC9",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "YELLOW",
    alert_date: "2026-08-08",
    rule_name: "\u65B0\u589E\u5F00\u5EAD\u516C\u544A",
    metric_value: 1,
    threshold: 0,
    flowKey: "f-alert-watch",
    flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-009",
    cust_id: "C0008",
    cust_name: "\u5434*\u519B",
    alert_type: "\u5173\u8054\u4F01\u4E1A\u98CE\u9669",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "RED",
    alert_date: "2026-08-08",
    rule_name: "\u5173\u8054\u4F01\u4E1A\u7ECF\u8425\u5F02\u5E38",
    metric_value: 1,
    threshold: 0,
    flowKey: "f-alert-limit",
    flowState: "\u964D\u989D\u6267\u884C\u4E2D"
  },
  {
    alert_id: "AL0808-010",
    cust_id: "C0013",
    cust_name: "\u66F9*\u521A",
    alert_type: "\u5173\u8054\u4F01\u4E1A\u98CE\u9669",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "YELLOW",
    alert_date: "2026-08-08",
    rule_name: "\u62C5\u4FDD\u4F01\u4E1A\u51FA\u73B0\u903E\u671F",
    metric_value: 2,
    threshold: 1,
    flowKey: "f-alert-watch",
    flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-011",
    cust_id: "C0002",
    cust_name: "\u674E*\u534E",
    alert_type: "\u8BBE\u5907\u5F02\u5E38",
    scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
    level: "RED",
    alert_date: "2026-08-08",
    rule_name: "7\u65E5\u5185\u66F4\u6362\u8BBE\u5907\u22652\u6B21",
    metric_value: 2,
    threshold: 1,
    flowKey: "f-alert-freeze",
    flowState: "\u51BB\u7ED3\u6B62\u4ED8\u4E2D"
  },
  {
    alert_id: "AL0808-012",
    cust_id: "C0014",
    cust_name: "\u5510*\u971E",
    alert_type: "\u8BBE\u5907\u5F02\u5E38",
    scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
    level: "YELLOW",
    alert_date: "2026-08-08",
    rule_name: "\u65B0\u8BBE\u5907\u6DF1\u591C\u767B\u5F55",
    metric_value: 1,
    threshold: 0,
    flowKey: "f-alert-watch",
    flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-013",
    cust_id: "C0004",
    cust_name: "\u8D75*\u5F3A",
    alert_type: "\u53CD\u6B3A\u8BC8\u547D\u4E2D",
    scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
    level: "RED",
    alert_date: "2026-08-08",
    rule_name: "\u547D\u4E2D\u9ED1\u540D\u5355\u624B\u673A\u53F7",
    metric_value: 1,
    threshold: 0,
    flowKey: "f-alert-freeze",
    flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-014",
    cust_id: "C0015",
    cust_name: "\u51AF*\u519B",
    alert_type: "\u53CD\u6B3A\u8BC8\u547D\u4E2D",
    scene: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B",
    level: "YELLOW",
    alert_date: "2026-08-08",
    rule_name: "\u8D44\u6599\u4E0E\u5386\u53F2\u7533\u8BF7\u51B2\u7A81",
    metric_value: 1,
    threshold: 0,
    flowKey: "f-alert-watch",
    flowState: "\u4EBA\u5DE5\u590D\u6838\u4E2D"
  },
  {
    alert_id: "AL0808-015",
    cust_id: "C0001",
    cust_name: "\u5F20*\u660E",
    alert_type: "\u884C\u4E3A\u8BC4\u5206\u4E0B\u964D",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "RED",
    alert_date: "2026-08-08",
    rule_name: "\u884C\u4E3A\u5206\u5355\u65E5\u964D\u5E45>15%",
    metric_value: 18,
    threshold: 15,
    flowKey: "f-alert-limit",
    flowState: "\u98CE\u9669\u7814\u5224\u4E2D"
  },
  {
    alert_id: "AL0808-016",
    cust_id: "C0003",
    cust_name: "\u738B*\u82B3",
    alert_type: "\u884C\u4E3A\u8BC4\u5206\u4E0B\u964D",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "YELLOW",
    alert_date: "2026-08-08",
    rule_name: "\u884C\u4E3A\u5206\u8FDE\u7EED3\u65E5\u8D70\u4F4E",
    metric_value: 5,
    threshold: 3,
    flowKey: "f-alert-watch",
    flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-017",
    cust_id: "C0005",
    cust_name: "\u9648*\u654F",
    alert_type: "\u8FD8\u6B3E\u80FD\u529B\u4E0D\u8DB3",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "RED",
    alert_date: "2026-08-08",
    rule_name: "\u6708\u4F9B/\u6536\u5165>65%",
    metric_value: 68,
    threshold: 65,
    flowKey: "f-alert-limit",
    flowState: "\u964D\u989D\u6267\u884C\u4E2D"
  },
  {
    alert_id: "AL0808-018",
    cust_id: "C0016",
    cust_name: "\u9093*\u5E73",
    alert_type: "\u8FD8\u6B3E\u80FD\u529B\u4E0D\u8DB3",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "YELLOW",
    alert_date: "2026-08-08",
    rule_name: "\u4E34\u671F\u4F59\u989D\u4E0D\u8DB3",
    metric_value: 1,
    threshold: 0,
    flowKey: "f-alert-precollect",
    flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-019",
    cust_id: "C0003",
    cust_name: "\u738B*\u82B3",
    alert_type: "\u56DE\u8BBF\u5931\u8054",
    scene: "\u8D37\u540E\u50AC\u6536",
    level: "RED",
    alert_date: "2026-08-08",
    rule_name: "\u56DE\u8BBF\u5931\u8054\u22652\u6B21",
    metric_value: 2,
    threshold: 1,
    flowKey: "f-alert-precollect",
    flowState: "\u50AC\u6536\u4ECB\u5165\u4E2D"
  },
  {
    alert_id: "AL0808-020",
    cust_id: "C0017",
    cust_name: "\u66FE*\u7433",
    alert_type: "\u56DE\u8BBF\u5931\u8054",
    scene: "\u8D37\u540E\u50AC\u6536",
    level: "YELLOW",
    alert_date: "2026-08-08",
    rule_name: "\u7535\u8BDD\u62D2\u63A5\u22653\u6B21",
    metric_value: 3,
    threshold: 2,
    flowKey: "f-alert-watch",
    flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-021",
    cust_id: "C0007",
    cust_name: "\u5468*\u4F1F",
    alert_type: "\u8206\u60C5\u8D1F\u9762",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "RED",
    alert_date: "2026-08-08",
    rule_name: "\u6D89\u501F\u8D37\u7EA0\u7EB7\u8D1F\u9762\u8206\u60C5",
    metric_value: 2,
    threshold: 1,
    flowKey: "f-alert-limit",
    flowState: "\u98CE\u9669\u7814\u5224\u4E2D"
  },
  {
    alert_id: "AL0808-022",
    cust_id: "C0018",
    cust_name: "\u8881*\u534E",
    alert_type: "\u8206\u60C5\u8D1F\u9762",
    scene: "\u8D37\u4E2D\u98CE\u63A7",
    level: "YELLOW",
    alert_date: "2026-08-08",
    rule_name: "\u88AB\u6295\u8BC9\u50AC\u6536\u5173\u8054",
    metric_value: 1,
    threshold: 0,
    flowKey: "f-alert-watch",
    flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-023",
    cust_id: "C0003",
    cust_name: "\u738B*\u82B3",
    alert_type: "\u63D0\u989D\u673A\u4F1A",
    scene: "\u5B58\u91CF\u8FD0\u8425",
    level: "OPPORTUNITY",
    alert_date: "2026-08-08",
    rule_name: "\u989D\u5EA6\u4F7F\u7528\u7387>80%\u4E14\u5C65\u7EA6\u826F\u597D",
    metric_value: 88,
    threshold: 80,
    flowKey: "f-alert-promote",
    flowState: "\u4EF7\u503C\u7814\u5224\u4E2D"
  },
  {
    alert_id: "AL0808-024",
    cust_id: "C0001",
    cust_name: "\u5F20*\u660E",
    alert_type: "\u63D0\u989D\u673A\u4F1A",
    scene: "\u5B58\u91CF\u8FD0\u8425",
    level: "OPPORTUNITY",
    alert_date: "2026-08-08",
    rule_name: "\u8FD190\u5929\u65E0\u903E\u671F\u4E14\u6536\u5165\u63D0\u5347",
    metric_value: 0,
    threshold: 0,
    flowKey: "f-alert-promote",
    flowState: "\u673A\u4F1A\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-025",
    cust_id: "C0019",
    cust_name: "\u848B*\u6885",
    alert_type: "\u9700\u6C42\u4E0A\u5347",
    scene: "\u5B58\u91CF\u8FD0\u8425",
    level: "OPPORTUNITY",
    alert_date: "2026-08-08",
    rule_name: "\u8FD1\u671F\u501F\u6B3E\u9700\u6C42\u4E0A\u5347",
    metric_value: 1,
    threshold: 0,
    flowKey: "f-alert-promote",
    flowState: "\u673A\u4F1A\u786E\u8BA4\u4E2D"
  },
  {
    alert_id: "AL0808-026",
    cust_id: "C0006",
    cust_name: "\u5B59*\u534E",
    alert_type: "\u9700\u6C42\u4E0A\u5347",
    scene: "\u5B58\u91CF\u8FD0\u8425",
    level: "OPPORTUNITY",
    alert_date: "2026-08-08",
    rule_name: "\u6D3B\u8DC3\u5EA6\u6301\u7EED\u63D0\u5347",
    metric_value: 1,
    threshold: 0,
    flowKey: "f-alert-promote",
    flowState: "\u673A\u4F1A\u786E\u8BA4\u4E2D"
  }
];
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function photoPlaceholder(text, accent) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' rx='8' fill='#F1F5F9'/><circle cx='60' cy='44' r='19' fill='#${accent}'/><rect x='36' y='72' width='48' height='26' rx='6' fill='#${accent}'/><text x='60' y='113' text-anchor='middle' font-size='11' fill='#64748B'>${text}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
function withCustGraph(c) {
  const base = c.riskLevel === "\u9AD8\u98CE\u9669" ? 72 : c.riskLevel === "\u4E2D\u98CE\u9669" ? 48 : 22;
  const h = hashStr(c.custId);
  const baseRels = (c.relations ?? [
    { id: c.custId + "-r0", name: "\u534E\u4FE1\u5546\u8D38", rel: "\u6CD5\u4EBA", type: "company" },
    { id: c.custId + "-r1", name: "IMEI-86" + c.custId.slice(1), rel: "\u8BBE\u5907", type: "device" }
  ]).map((r, i) => {
    const openAlerts = i === 0 ? 2 : i % 3;
    const riskLevel = openAlerts >= 2 ? "\u9AD8" : openAlerts === 1 ? "\u4E2D" : "\u4F4E";
    return {
      ...r,
      risk: r.risk ?? (riskLevel === "\u9AD8" ? "\u9AD8\u5371" : void 0),
      idCard: r.type === "person" ? "3301**********" + String(1e3 + i * 137).slice(-4) : void 0,
      phone: r.type === "person" || r.type === "contact" ? "138****" + String(1e3 + (h % 6e3 + i * 311) % 9e3).slice(-4) : void 0,
      riskLevel,
      openAlerts,
      channel: r.type === "company" ? "\u5DE5\u5546\u767B\u8BB0" : r.type === "device" ? "\u8BBE\u5907\u6307\u7EB9\u5E93" : r.type === "contact" ? "\u7D27\u6025\u8054\u7CFB\u4EBA" : "\u5173\u7CFB\u7F51\u7EDC",
      regCapital: r.type === "company" ? 300 + h % 7 * 150 + "\u4E07" : void 0,
      legalPerson: r.type === "company" ? c.name : void 0,
      note: riskLevel === "\u9AD8" ? "\u5173\u8054\u5B9E\u4F53\u547D\u4E2D\u98CE\u9669\uFF0C\u5DF2\u7EB3\u5165\u8054\u5408\u76D1\u63A7" : "\u6B63\u5E38\u5173\u8054\u5B9E\u4F53"
    };
  });
  const ringKey = (r) => r.type === "company" || r.type === "person" || (r.rel ?? "").includes("\u62C5\u4FDD") || (r.rel ?? "").includes("\u5171\u501F") ? 1 : 2;
  const ringHi = {};
  baseRels.forEach((r) => {
    const k = ringKey(r);
    if (r.riskLevel === "\u9AD8") ringHi[k] = true;
  });
  const relations = baseRels.map((r) => {
    const k = ringKey(r);
    return {
      ...r,
      ringId: k,
      ringName: k === 1 ? "\u4E3B\u4F53\u5173\u8054\u56E2\u4F19" : "\u4ECB\u8D28\u5173\u8054\u7FA4\u4F53",
      ringRisk: ringHi[k] ? "\u9AD8" : "\u4E2D"
    };
  });
  const riskDims = c.riskDims ?? ["\u8D1F\u503A", "\u591A\u5934", "\u6B3A\u8BC8", "\u53F8\u6CD5", "\u884C\u4E3A", "\u8206\u60C5"].map((dim, i) => ({ dim, score: Math.max(8, Math.min(96, base + i * 3)) }));
  const credit = c.credit ?? {
    term: [6, 12, 24, 36][h % 4],
    rate: Number((7.2 + h % 50 / 10).toFixed(2)),
    repayMethod: h % 2 ? "\u7B49\u989D\u672C\u606F" : "\u6309\u6708\u4ED8\u606F\u5230\u671F\u8FD8\u672C",
    branch: ["\u57CE\u4E1C\u652F\u884C", "\u9AD8\u65B0\u652F\u884C", "\u6EE8\u6C5F\u652F\u884C", "\u603B\u884C\u8425\u4E1A\u90E8"][h % 4],
    loanDate: "2025-" + String(h % 12 + 1).padStart(2, "0") + "-" + String(h % 27 + 1).padStart(2, "0"),
    lastRepay: "2026-0" + (h % 8 + 1) + "-" + String(h % 27 + 1).padStart(2, "0"),
    overdue: h % 3,
    curDue: Math.round(c.loanBalance * (0.03 + h % 5 / 100))
  };
  const env = c.env ?? {
    device: ["iPhone 14", "\u534E\u4E3A Mate60", "\u5C0F\u7C73 14", "OPPO Reno"][h % 4],
    region: ["\u6D59\u6C5F\u676D\u5DDE", "\u6D59\u6C5F\u5B81\u6CE2", "\u6C5F\u82CF\u82CF\u5DDE", "\u4E0A\u6D77"][h % 4],
    network: h % 2 ? "WiFi" : "4G/5G",
    lastLogin: "2026-08-0" + (h % 8 + 1) + " 09:" + String(h % 60).padStart(2, "0"),
    city: ["\u676D\u5DDE", "\u5B81\u6CE2", "\u82CF\u5DDE", "\u4E0A\u6D77"][h % 4]
  };
  const behavior = c.behavior ?? {
    login30d: 8 + h % 20,
    deviceChange: h % 3,
    activeDays: 10 + h % 18,
    repayOnTime: 70 + h % 30,
    nightTxnRatio: h % 25,
    recentEvents: [
      { time: "2026-08-0" + (h % 8 + 1) + " 09:12", type: "\u767B\u5F55", detail: "APP \u767B\u5F55\uFF08" + env.network + "\xB7" + env.region + "\uFF09" },
      { time: "2026-08-0" + (h % 8 || 8) + " 21:40", type: "\u4EA4\u6613", detail: "\u6D88\u8D39\u5206\u671F \xA5" + (500 + h % 30 * 100) },
      { time: "2026-07-" + String(h % 27 + 1).padStart(2, "0") + " 10:05", type: "\u8FD8\u6B3E", detail: "\u6309\u671F\u5F52\u8FD8\u5F53\u671F \xA5" + credit.curDue }
    ]
  };
  const photos = c.photos ?? {
    user: photoPlaceholder(c.name?.[0] ?? "\u5BA2", "\u7528\u6237\u7167\u7247", "2563EB"),
    idCard: photoPlaceholder("\u8EAB\u4EFD\u8BC1", "\u8EAB\u4EFD\u8BC1\u7167\u7247", "475569"),
    latest: photoPlaceholder("\u6700\u65B0\u91C7\u96C6", "\u6700\u65B0\u7167\u7247", "0891B2")
  };
  const risk = c.riskLevel, hi = risk === "\u9AD8\u98CE\u9669", mid = risk === "\u4E2D\u98CE\u9669";
  const income = c.income ?? (() => {
    const monthIncome = 8e3 + h % 30 * 500;
    const monthRepay = hi ? Math.round(c.loanBalance / 12) : Math.round(c.loanBalance / 24);
    const debtTotal = c.loanBalance + h % 8 * 2e4;
    const assetTotal = Math.max(1, c.creditLine * (2 + h % 4));
    return {
      monthIncome,
      monthRepay,
      dti: Math.round(monthRepay / monthIncome * 100),
      debtTotal,
      assetTotal,
      liabilityRatio: Math.min(95, Math.round(debtTotal / assetTotal * 100))
    };
  })();
  const INSTS = ["A\u94F6\u884C", "B\u6D88\u8D39\u91D1\u878D", "C\u5C0F\u8D37", "D\u5E73\u53F0\u8D37", "E\u94F6\u884C", "F\u6D88\u91D1"];
  const creditReport = c.creditReport ?? (() => {
    const qBase = hi ? 5 : mid ? 3 : 1;
    const months2 = ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"];
    const queries = months2.map((m, i) => {
      const cnt = Math.max(0, qBase + (h >> i) % 3 - 1);
      return { month: m, count: cnt, institutions: cnt ? [INSTS[(h + i) % 6], INSTS[(h + i + 2) % 6]].slice(0, cnt > 1 ? 2 : 1) : [] };
    });
    const accounts = [
      { institution: "\u672C\u884C", type: c.product, limit: c.creditLine, balance: c.loanBalance, status: "\u6B63\u5E38", openDate: "2025-" + String(h % 12 + 1).padStart(2, "0") + "-" + String(h % 27 + 1).padStart(2, "0") },
      { institution: INSTS[(h + 1) % 6], type: "\u6D88\u8D39\u8D37", limit: 5e4 + h % 5 * 1e4, balance: 12e3 + h % 9 * 5e3, status: hi ? "\u903E\u671F" : "\u6B63\u5E38", openDate: "2025-" + String((h + 3) % 12 + 1).padStart(2, "0") + "-" + String(h % 27 + 1).padStart(2, "0") },
      { institution: INSTS[(h + 3) % 6], type: "\u4FE1\u7528\u5361", limit: 2e4 + h % 4 * 1e4, balance: 6e3 + h % 8 * 2e3, status: "\u6B63\u5E38", openDate: "2024-" + String((h + 6) % 12 + 1).padStart(2, "0") + "-" + String(h % 27 + 1).padStart(2, "0") }
    ];
    const overdues = hi ? [{ date: "2026-06-12", institution: INSTS[(h + 1) % 6], days: 8, amount: 3200 + h % 5 * 1e3 }, { date: "2026-04-03", institution: INSTS[(h + 3) % 6], days: 3, amount: 1500 + h % 4 * 500 }] : mid ? [{ date: "2026-05-20", institution: INSTS[(h + 3) % 6], days: 2, amount: 800 + h % 4 * 300 }] : [];
    const guaranties = hi || mid ? [{ org: "\u676D\u5DDE" + c.name.slice(1) + "\u5546\u8D38", amount: 5e5 + h % 5 * 1e5, remain: 2e5 + h % 4 * 5e4 }] : [];
    return { queries, accounts, overdues, guaranties };
  })();
  const hasBiz = c.product === "\u7ECF\u8425\u8D37" || c.product === "\u62B5\u62BC\u8D37";
  const collaterals = c.collaterals ?? (hasBiz ? [
    { type: "\u623F\u4EA7", name: "\u4F4F\u5B85\u62B5\u62BC\uFF08" + ["\u57CE\u897F", "\u6EE8\u6C5F", "\u62F1\u5885"][h % 3] + "\uFF09", valuation: 18e5 + h % 9 * 1e5, loanAmount: c.creditLine, ratio: Math.round(c.creditLine / (18e5 + h % 9 * 1e5) * 100), status: "\u8DB3\u503C" },
    ...hi ? [{ type: "\u8F66\u8F86", name: "\u6D59A\xB7" + (1e3 + h % 9e3) + " \u8F7F\u8F66", valuation: 18e4, loanAmount: 12e4, ratio: 67, status: "\u8DB3\u503C" }] : []
  ] : []);
  const PERS = ["\u738B*\u5F3A", "\u674E*\u4E3D", "\u8D75*\u519B", "\u9648*\u654F", "\u5218*\u534E"];
  const guarantors = c.guarantors ?? (hasBiz ? [
    { name: PERS[h % 5], relation: "\u914D\u5076", credit: "\u5F81\u4FE1\u6B63\u5E38" },
    ...hi ? [{ name: PERS[(h + 2) % 5], relation: "\u80A1\u4E1C", credit: "\u5F81\u4FE1\u6709 1 \u7B14\u903E\u671F" }] : []
  ] : []);
  const business = c.business ?? (hasBiz ? {
    companyName: ["\u676D\u5DDE", "\u5B81\u6CE2", "\u7ECD\u5174"][h % 3] + c.name.slice(1) + "\u5546\u8D38\u6709\u9650\u516C\u53F8",
    industry: ["\u6279\u53D1\u96F6\u552E", "\u7535\u5546", "\u9910\u996E", "\u5EFA\u6750"][h % 4],
    monthRevenue: 3e5 + h % 60 * 1e4,
    taxMonthly: 6e3 + h % 30 * 1e3,
    invoiceYear: 4e6 + h % 80 * 5e4,
    employees: 8 + h % 25,
    operateYears: 2 + h % 8,
    accountBalance: 8e4 + h % 20 * 1e4
  } : void 0);
  const fundFlow = c.fundFlow ?? {
    purpose: "\u7ECF\u8425\u5468\u8F6C",
    riskFlag: hi ? "\u7591\u4F3C\u56DE\u6D41" : "\u6B63\u5E38",
    flows: [
      { date: "2026-07-15", amount: Math.round(c.loanBalance * 0.4), to: "\u4F9B\u5E94\u5546 A\uFF08\u5BF9\u516C\uFF09", note: "\u8D27\u6B3E\u7ED3\u7B97", risk: "\u6B63\u5E38" },
      { date: "2026-07-16", amount: Math.round(c.loanBalance * 0.3), to: "\u4F9B\u5E94\u5546 B\uFF08\u5BF9\u516C\uFF09", note: "\u8D27\u6B3E\u7ED3\u7B97", risk: "\u6B63\u5E38" },
      ...hi ? [{ date: "2026-07-18", amount: Math.round(c.loanBalance * 0.2), to: "\u4E2A\u4EBA\u8D26\u6237 \u738B**", note: "\u5927\u989D\u8F6C\u4E2A\u4EBA", risk: "\u7591\u4F3C\u56DE\u6D41" }] : [],
      { date: "2026-07-22", amount: Math.round(c.loanBalance * 0.1), to: "\u7ECF\u8425\u573A\u6240\u79DF\u91D1", note: "\u79DF\u91D1\u652F\u4ED8", risk: "\u6B63\u5E38" }
    ]
  };
  const blacklist = c.blacklist ?? {
    hits: hi ? [{ list: "\u7F51\u8D37\u9ED1\u540D\u5355", matched: "\u624B\u673A\u53F7\u547D\u4E2D", date: "2026-06-20", score: 86 }, { list: "\u53CD\u6B3A\u8BC8\u540D\u5355", matched: "\u8BBE\u5907\u5173\u8054\u6B3A\u8BC8\u7528\u6237", date: "2026-07-02", score: 78 }] : mid ? [{ list: "\u89C2\u5BDF\u540D\u5355", matched: "IP \u6BB5\u805A\u96C6", date: "2026-07-10", score: 52 }] : [],
    fraudTags: hi ? ["\u8BBE\u5907\u805A\u96C6", "\u6DF1\u591C\u7533\u8BF7"] : mid ? ["\u8D44\u6599\u9891\u7E41\u4FEE\u6539"] : [],
    riskScore: hi ? 82 : mid ? 45 : 12
  };
  const zc = hi ? 82 : mid ? 55 : 28;
  const zx = hi ? 560 : mid ? 650 : 782;
  const zr = hi ? 520 : mid ? 640 : 760;
  const scores = c.scores ?? (() => {
    const mk = (score, range, unit, hint) => ({ score, range, unit, hint });
    const limit = hi ? Math.round(c.creditLine * 0.5) : mid ? Math.round(c.creditLine * 0.85) : c.creditLine;
    return {
      zhicha: mk(zc, [0, 100], "\u6B3A\u8BC8\u5206", "\u8D8A\u9AD8\u6B3A\u8BC8\u98CE\u9669\u8D8A\u9AD8"),
      zhixin: mk(zx, [300, 900], "\u4FE1\u7528\u5206", "\u8D8A\u9AD8\u8FDD\u7EA6\u6982\u7387\u8D8A\u4F4E"),
      zhirong: mk(zr, [300, 900], "\u7EFC\u5408\u5206", "\u7EFC\u5408\u98CE\u9669\u4E0E\u4EF7\u503C"),
      limitSuggest: hi ? "\u5EFA\u8BAE\u62D2\u8D37 / \u964D\u989D" : mid ? "\u5EFA\u8BAE\u5BA1\u614E\u6388\u4FE1\u5E76\u52A0\u5F3A\u76D1\u6D4B" : "\u5EFA\u8BAE\u6B63\u5E38\u6388\u4FE1",
      limit
    };
  })();
  const externalChecks = c.externalChecks ?? [
    { category: "\u5DE5\u5546", item: "\u7ECF\u8425\u72B6\u6001 / \u6CE8\u518C\u8D44\u672C", result: "\u5B58\u7EED\u6B63\u5E38", status: "\u6B63\u5E38" },
    { category: "\u53F8\u6CD5", item: "\u6D89\u8BC9 / \u88AB\u6267\u884C", result: hi ? "\u5B58\u5728 1 \u6761\u6C11\u95F4\u501F\u8D37\u7EA0\u7EB7" : "\u65E0\u91CD\u5927\u6D89\u8BC9\u8BB0\u5F55", status: hi ? "\u5F02\u5E38" : "\u6B63\u5E38" },
    { category: "\u7A0E\u52A1", item: "\u7EB3\u7A0E\u4FE1\u7528", result: "\u8FD1 12 \u6708\u7EB3\u7A0E\u6B63\u5E38", status: "\u6B63\u5E38" },
    { category: "\u793E\u4FDD", item: "\u793E\u4FDD / \u516C\u79EF\u91D1", result: hasBiz ? "\u5355\u4F4D\u6B63\u5E38\u7F34\u7EB3" : "\u4E2A\u4EBA\u7075\u6D3B\u5C31\u4E1A\u53C2\u4FDD", status: "\u6B63\u5E38" }
  ];
  const approvalRecords = c.approvalRecords ?? [
    { time: credit.loanDate, kind: "\u6388\u4FE1\u51C6\u5165", result: hi ? "\u8F6C\u4EBA\u5DE5" : "\u901A\u8FC7", opinion: hi ? "\u98CE\u9669\u504F\u9AD8\uFF0C\u8F6C\u4EBA\u5DE5\u590D\u6838\u540E\u51C6\u5165" : "\u8D44\u8D28\u7B26\u5408\u8981\u6C42\uFF0C\u6B63\u5E38\u51C6\u5165", operator: "\u51C6\u5165\u521D\u5BA1\u5C97" },
    { time: credit.loanDate, kind: "\u6388\u4FE1\u5BA1\u6279", result: hi ? "\u8F6C\u4EBA\u5DE5" : "\u901A\u8FC7", opinion: `\u6838\u5B9A\u6388\u4FE1\u989D\u5EA6 \xA5${hi ? Math.round(c.creditLine * 0.5).toLocaleString() : c.creditLine.toLocaleString()}`, operator: "\u6388\u4FE1\u5BA1\u6279\u5C97" },
    ...hi ? [{ time: "2026-08-04", kind: "\u9884\u8B66\u5904\u7F6E", result: "\u8F6C\u4EBA\u5DE5", opinion: "\u9AD8\u5371\u9884\u8B66\uFF0C\u8F6C\u4EBA\u5DE5\u6838\u67E5\u5E76\u542F\u52A8\u9884\u50AC", operator: "\u8D37\u4E2D\u76D1\u63A7" }] : []
  ];
  const months = ["2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07"];
  const clamp = (v, lo, hi2) => Math.max(lo, Math.min(hi2, v));
  const walkDown = (cur, delta) => {
    let v = cur;
    const a = [];
    for (let i = months.length - 1; i >= 0; i--) {
      a[i] = Math.round(v);
      v = v - delta - (h + i) % 3;
    }
    return a;
  };
  const walkUp = (cur, delta) => {
    let v = cur;
    const a = [];
    for (let i = months.length - 1; i >= 0; i--) {
      a[i] = Math.round(v);
      v = v + delta + (h + i) % 3;
    }
    return a;
  };
  const modelScoreHistory = c.modelScoreHistory ?? (() => {
    const zcS = walkDown(zc, 5).map((v) => clamp(v, 5, 98));
    const zxS = walkUp(zx, 26).map((v) => clamp(v, 320, 880));
    const zrS = walkUp(zr, 26).map((v) => clamp(v, 320, 880));
    return months.map((m, i) => ({ month: m, zhicha: zcS[i], zhixin: zxS[i], zhirong: zrS[i] }));
  })();
  return { ...c, relations, riskDims, credit, env, behavior, photos, creditReport, income, collaterals, guarantors, business, fundFlow, blacklist, scores, externalChecks, approvalRecords, modelScoreHistory };
}
var SEED_CUSTOMERS = [
  {
    custId: "C0001",
    name: "\u5F20*\u660E",
    idCard: "3301**********1234",
    product: "\u4FE1\u7528\u8D37",
    creditLine: 8e4,
    loanBalance: 42e3,
    loanStatus: "\u5728\u8D37",
    riskLevel: "\u9AD8\u98CE\u9669",
    scoreHistory: [
      { month: "2026-02", score: 62, cohortAvg: 74 },
      { month: "2026-03", score: 58, cohortAvg: 74 },
      { month: "2026-04", score: 51, cohortAvg: 73 },
      { month: "2026-05", score: 44, cohortAvg: 72 },
      { month: "2026-06", score: 38, cohortAvg: 72 },
      { month: "2026-07", score: 33, cohortAvg: 71 }
    ],
    alerts: [
      { time: "2026-07-03", level: "YELLOW", scene: "\u8D1F\u503A\u4E0A\u5347", ruleName: "\u8FD130\u5929\u65B0\u589E\u8D37\u6B3E\u22652\u7B14", metricValue: 2, threshold: 2, status: "\u5DF2\u89E3\u9664" },
      { time: "2026-07-18", level: "RED", scene: "\u884C\u4E3A\u8BC4\u5206", ruleName: "\u884C\u4E3A\u5206<40", metricValue: 38, threshold: 40, status: "\u5904\u7F6E\u4E2D" },
      { time: "2026-08-04", level: "RED", scene: "\u8D1F\u503A\u6FC0\u589E", ruleName: "\u8FD130\u5929\u65B0\u589E\u8D37\u6B3E\u22653\u7B14", metricValue: 5, threshold: 3, status: "\u5F85\u5904\u7F6E" }
    ],
    disposes: [
      { time: "2026-07-18", operator: "\u674E\u56DB", action: "\u7535\u8BDD\u6838\u5B9E", result: "\u786E\u8BA4\u591A\u7B14\u7F51\u8D37\uFF0C\u6536\u5165\u4E0B\u964D", note: "\u5EFA\u8BAE\u964D\u989D\u5E76\u9884\u50AC" },
      { time: "2026-07-19", operator: "\u738B\u4E94", action: "\u964D\u989D", result: "\u5DF2\u6267\u884C\uFF1A80000\u219240000", note: "\u5BA1\u6279\u901A\u8FC7" }
    ]
  },
  {
    custId: "C0002",
    name: "\u674E*\u534E",
    idCard: "3301**********5678",
    product: "\u6D88\u8D39\u8D37",
    creditLine: 5e4,
    loanBalance: 18e3,
    loanStatus: "\u5728\u8D37",
    riskLevel: "\u4E2D\u98CE\u9669",
    scoreHistory: [
      { month: "2026-02", score: 55, cohortAvg: 74 },
      { month: "2026-03", score: 54, cohortAvg: 74 },
      { month: "2026-04", score: 56, cohortAvg: 73 },
      { month: "2026-05", score: 53, cohortAvg: 72 },
      { month: "2026-06", score: 52, cohortAvg: 72 },
      { month: "2026-07", score: 52, cohortAvg: 71 }
    ],
    alerts: [
      { time: "2026-08-04", level: "YELLOW", scene: "\u8BBE\u5907\u5F02\u5E38", ruleName: "7\u65E5\u5185\u66F4\u6362\u8BBE\u5907", metricValue: 2, threshold: 1, status: "\u5F85\u5904\u7F6E" }
    ],
    disposes: []
  },
  {
    custId: "C0003",
    name: "\u738B*\u82B3",
    idCard: "3301**********9012",
    product: "\u4FE1\u7528\u8D37",
    creditLine: 1e5,
    loanBalance: 35e3,
    loanStatus: "\u5728\u8D37",
    riskLevel: "\u4F4E\u98CE\u9669",
    scoreHistory: [
      { month: "2026-02", score: 76, cohortAvg: 74 },
      { month: "2026-03", score: 77, cohortAvg: 74 },
      { month: "2026-04", score: 76, cohortAvg: 73 },
      { month: "2026-05", score: 78, cohortAvg: 72 },
      { month: "2026-06", score: 78, cohortAvg: 72 },
      { month: "2026-07", score: 78, cohortAvg: 71 }
    ],
    alerts: [
      { time: "2026-08-02", level: "OPPORTUNITY", scene: "\u9700\u6C42\u4E0A\u5347", ruleName: "\u989D\u5EA6\u4F7F\u7528\u7387>80%", metricValue: 88, threshold: 80, status: "\u5F85\u5904\u7F6E" }
    ],
    disposes: []
  },
  {
    custId: "C0004",
    name: "\u8D75*\u5F3A",
    idCard: "3301**********3456",
    product: "\u7ECF\u8425\u8D37",
    creditLine: 2e5,
    loanBalance: 156e3,
    loanStatus: "\u5728\u8D37",
    riskLevel: "\u9AD8\u98CE\u9669",
    scoreHistory: [
      { month: "2026-02", score: 50, cohortAvg: 74 },
      { month: "2026-03", score: 45, cohortAvg: 74 },
      { month: "2026-04", score: 41, cohortAvg: 73 },
      { month: "2026-05", score: 36, cohortAvg: 72 },
      { month: "2026-06", score: 31, cohortAvg: 72 },
      { month: "2026-07", score: 28, cohortAvg: 71 }
    ],
    alerts: [
      { time: "2026-07-25", level: "RED", scene: "\u53F8\u6CD5\u6D89\u8BC9", ruleName: "\u65B0\u589E\u88AB\u6267\u884C\u8BB0\u5F55", metricValue: 1, threshold: 0, status: "\u5904\u7F6E\u4E2D" },
      { time: "2026-08-04", level: "RED", scene: "\u53F8\u6CD5\u6D89\u8BC9", ruleName: "\u65B0\u589E\u88AB\u6267\u884C\u8BB0\u5F55", metricValue: 1, threshold: 0, status: "\u5F85\u5904\u7F6E" }
    ],
    disposes: [
      { time: "2026-07-26", operator: "\u674E\u56DB", action: "\u51BB\u7ED3\u989D\u5EA6", result: "\u5DF2\u51BB\u7ED3\u5168\u90E8\u53EF\u7528\u989D\u5EA6", note: "\u5F85\u8BC4\u4F30" }
    ]
  },
  {
    custId: "C0005",
    name: "\u9648*\u654F",
    idCard: "3301**********7890",
    product: "\u6D88\u8D39\u8D37",
    creditLine: 3e4,
    loanBalance: 9e3,
    loanStatus: "\u5728\u8D37",
    riskLevel: "\u4E2D\u98CE\u9669",
    scoreHistory: [
      { month: "2026-02", score: 60, cohortAvg: 74 },
      { month: "2026-03", score: 61, cohortAvg: 74 },
      { month: "2026-04", score: 60, cohortAvg: 73 },
      { month: "2026-05", score: 61, cohortAvg: 72 },
      { month: "2026-06", score: 61, cohortAvg: 72 },
      { month: "2026-07", score: 61, cohortAvg: 71 }
    ],
    alerts: [
      { time: "2026-08-03", level: "YELLOW", scene: "\u8FD8\u6B3E\u80FD\u529B", ruleName: "\u4E34\u671F\u4F59\u989D\u4E0D\u8DB3", metricValue: 1, threshold: 0, status: "\u5F85\u5904\u7F6E" }
    ],
    disposes: []
  }
];
var SEED_DISPOSE_TASKS = [
  {
    id: "DP240804-001",
    alertId: "AL240804-001",
    custId: "C0001",
    custName: "\u5F20*\u660E",
    action: "\u964D\u989D",
    targetSystem: "\u6838\u5FC3\u4FE1\u8D37\u7CFB\u7EDF",
    needApprove: true,
    assignTo: "\u98CE\u63A7\u4E3B\u7BA1",
    status: "\u5F85\u5904\u7F6E",
    operator: "\u98CE\u63A7\u4E13\u5458-\u5F20\u4E09",
    updatedAt: "2026-08-04 02:10",
    logs: [{ time: "2026-08-04 02:10", who: "\u7CFB\u7EDF", what: "\u6309\u5904\u7F6E\u7B56\u7565\u300C\u7EA2\u706F\u964D\u989D\u300D\u81EA\u52A8\u751F\u6210\u5DE5\u5355\uFF0C\u7B49\u5F85\u5BA1\u6279" }]
  },
  {
    id: "DP240804-002",
    alertId: "AL240804-002",
    custId: "C0004",
    custName: "\u8D75*\u5F3A",
    action: "\u51BB\u7ED3",
    targetSystem: "\u6838\u5FC3\u4FE1\u8D37\u7CFB\u7EDF",
    needApprove: true,
    assignTo: "\u98CE\u63A7\u4E3B\u7BA1",
    status: "\u6838\u5B9E\u4E2D",
    operator: "\u98CE\u63A7\u4E13\u5458-\u674E\u56DB",
    updatedAt: "2026-08-04 09:30",
    logs: [
      { time: "2026-08-04 09:15", who: "\u674E\u56DB", what: "\u7535\u8BDD\u6838\u5B9E\uFF1A\u786E\u8BA4\u65B0\u589E\u6267\u884C\u8BB0\u5F55\u5C5E\u5B9E" },
      { time: "2026-08-04 09:30", who: "\u7CFB\u7EDF", what: "\u63D0\u4EA4\u5BA1\u6279\uFF1A\u51BB\u7ED3\u5168\u90E8\u53EF\u7528\u989D\u5EA6" }
    ]
  },
  {
    id: "DP240804-003",
    alertId: "AL240804-003",
    custId: "C0002",
    custName: "\u674E*\u534E",
    action: "\u5173\u6CE8",
    targetSystem: "\u5DE5\u5355\u7CFB\u7EDF",
    needApprove: false,
    assignTo: "\u5BA2\u6237\u7ECF\u7406",
    status: "\u5904\u7F6E\u4E2D",
    operator: "\u5BA2\u6237\u7ECF\u7406-\u8D75\u654F",
    updatedAt: "2026-08-04 10:00",
    logs: [{ time: "2026-08-04 10:00", who: "\u8D75\u654F", what: "\u8054\u7CFB\u5BA2\u6237\u786E\u8BA4\u6362\u673A\u539F\u56E0\uFF0C\u7EB3\u5165\u89C2\u5BDF\u540D\u5355" }]
  },
  {
    id: "DP240804-004",
    alertId: "AL240802-006",
    custId: "C0003",
    custName: "\u738B*\u82B3",
    action: "\u63D0\u989D",
    targetSystem: "\u8425\u9500\u7CFB\u7EDF",
    needApprove: true,
    assignTo: "\u5BA2\u6237\u7ECF\u7406",
    status: "\u5F85\u5904\u7F6E",
    operator: "\u5BA2\u6237\u7ECF\u7406-\u8D75\u654F",
    updatedAt: "2026-08-04 02:15",
    logs: [{ time: "2026-08-04 02:15", who: "\u7CFB\u7EDF", what: "\u6309\u5904\u7F6E\u7B56\u7565\u300C\u673A\u4F1A\u63D0\u989D\u300D\u751F\u6210\u5DE5\u5355\uFF08\u673A\u4F1A\u4FE1\u53F7\uFF09" }]
  },
  {
    id: "DP240803-005",
    alertId: "AL240803-004",
    custId: "C0005",
    custName: "\u9648*\u654F",
    action: "\u5173\u6CE8",
    targetSystem: "\u5DE5\u5355\u7CFB\u7EDF",
    needApprove: false,
    assignTo: "\u5BA2\u6237\u7ECF\u7406",
    status: "\u5DF2\u89E3\u9664",
    operator: "\u5BA2\u6237\u7ECF\u7406-\u8D75\u654F",
    updatedAt: "2026-08-03 17:00",
    logs: [
      { time: "2026-08-03 15:00", who: "\u8D75\u654F", what: "\u6838\u5B9E\uFF1A\u8FD8\u6B3E\u65E5\u81EA\u52A8\u6263\u6B3E\u5931\u8D25\uFF0C\u5BA2\u6237\u5DF2\u624B\u52A8\u8FD8\u6B3E" },
      { time: "2026-08-03 17:00", who: "\u8D75\u654F", what: "\u89E3\u9664\u9884\u8B66\uFF0C\u5DE5\u5355\u5173\u95ED" }
    ]
  },
  {
    id: "DP240803-006",
    alertId: "AL240803-005",
    custId: "C0001",
    custName: "\u5F20*\u660E",
    action: "\u9884\u50AC",
    targetSystem: "\u50AC\u6536\u7CFB\u7EDF",
    needApprove: false,
    assignTo: "\u50AC\u6536\u4E13\u5458",
    status: "\u5DF2\u5347\u7EA7",
    operator: "\u50AC\u6536\u4E13\u5458-\u94B1\u4E03",
    updatedAt: "2026-08-03 20:00",
    logs: [
      { time: "2026-08-03 14:00", who: "\u94B1\u4E03", what: "\u9884\u50AC\u77ED\u4FE1\u5DF2\u53D1\u9001\uFF0C\u5BA2\u6237\u672A\u54CD\u5E94" },
      { time: "2026-08-03 20:00", who: "\u7CFB\u7EDF", what: "\u98CE\u9669\u6301\u7EED\u6076\u5316\uFF08\u65B0\u7EA2\u706F\u9884\u8B66\uFF09\uFF0C\u5DE5\u5355\u5347\u7EA7" }
    ]
  }
];
var SEED_VIZ_SAMPLES = [
  {
    id: "vs_product_loan",
    name: "\u5404\u4EA7\u54C1\u5728\u8D37\u4F59\u989D\u5206\u5E03",
    unit: "\u4E07\u5143",
    precision: 0,
    data: [
      { key: "\u4FE1\u7528\u8D37", value: 45200 },
      { key: "\u62B5\u62BC\u8D37", value: 38600 },
      { key: "\u8F66\u8D37", value: 21800 },
      { key: "\u6D88\u8D39\u8D37", value: 16400 },
      { key: "\u7ECF\u8425\u8D37", value: 12900 },
      { key: "\u5176\u4ED6", value: 5300 }
    ]
  },
  {
    id: "vs_monthly_overdue",
    name: "\u6708\u5EA6\u903E\u671F\u91D1\u989D\u8D8B\u52BF",
    unit: "\u4E07\u5143",
    precision: 0,
    data: [
      { key: "1\u6708", value: 3200 },
      { key: "2\u6708", value: 2850 },
      { key: "3\u6708", value: 4100 },
      { key: "4\u6708", value: 3650 },
      { key: "5\u6708", value: 5200 },
      { key: "6\u6708", value: 4800 },
      { key: "7\u6708", value: 5900 },
      { key: "8\u6708", value: 5400 },
      { key: "9\u6708", value: 6300 },
      { key: "10\u6708", value: 5800 },
      { key: "11\u6708", value: 6700 },
      { key: "12\u6708", value: 7200 }
    ]
  },
  {
    id: "vs_risk_level",
    name: "\u98CE\u9669\u7B49\u7EA7\u5206\u5E03",
    unit: "\u4EBA",
    precision: 0,
    data: [
      { key: "\u4F4E\u98CE\u9669", value: 12450 },
      { key: "\u4E2D\u98CE\u9669", value: 5230 },
      { key: "\u9AD8\u98CE\u9669", value: 1860 },
      { key: "\u6781\u9AD8\u98CE\u9669", value: 420 }
    ]
  },
  {
    id: "vs_region_score",
    name: "\u5404\u533A\u57DF\u98CE\u63A7\u8BC4\u5206",
    unit: "\u5206",
    precision: 1,
    data: [
      { key: "\u534E\u4E1C", value: 82.5 },
      { key: "\u534E\u5357", value: 76.3 },
      { key: "\u534E\u5317", value: 79.8 },
      { key: "\u534E\u4E2D", value: 71.2 },
      { key: "\u897F\u5357", value: 68.5 },
      { key: "\u897F\u5317", value: 65 }
    ]
  },
  {
    id: "vs_channel_approval",
    name: "\u5404\u6E20\u9053\u5BA1\u6279\u901A\u8FC7\u7387",
    unit: "%",
    precision: 1,
    data: [
      { key: "APP\u7533\u8BF7", value: 78.5 },
      { key: "\u7F51\u9875\u7533\u8BF7", value: 72.3 },
      { key: "\u7EBF\u4E0B\u7F51\u70B9", value: 85.1 },
      { key: "\u5408\u4F5C\u65B9", value: 69.8 },
      { key: "\u7535\u9500", value: 63.2 }
    ]
  },
  {
    id: "vs_burndown_task",
    name: "\u98CE\u63A7\u4EFB\u52A1\u71C3\u5C3D\u8FFD\u8E2A",
    unit: "\u4E2A",
    precision: 0,
    data: [
      { key: "D1", value: 120 },
      { key: "D2", value: 105 },
      { key: "D3", value: 92 },
      { key: "D4", value: 78 },
      { key: "D5", value: 65 },
      { key: "D6", value: 51 },
      { key: "D7", value: 38 },
      { key: "D8", value: 25 },
      { key: "D9", value: 15 },
      { key: "D10", value: 6 }
    ]
  },
  {
    id: "vs_age_risk",
    name: "\u5E74\u9F84\u6BB5\u8FDD\u7EA6\u7387",
    unit: "%",
    precision: 1,
    data: [
      { key: "18-25", value: 5.8 },
      { key: "26-35", value: 3.2 },
      { key: "36-45", value: 2.1 },
      { key: "46-55", value: 1.5 },
      { key: "56-65", value: 2.7 },
      { key: "65+", value: 4.3 }
    ]
  },
  {
    id: "vs_quarter_revenue",
    name: "\u5B63\u5EA6\u653E\u6B3E\u91D1\u989D",
    unit: "\u4E07\u5143",
    precision: 0,
    data: [
      { key: "Q1-2025", value: 8600 },
      { key: "Q2-2025", value: 12300 },
      { key: "Q3-2025", value: 15800 },
      { key: "Q4-2025", value: 19200 },
      { key: "Q1-2026", value: 16500 },
      { key: "Q2-2026", value: 21400 }
    ]
  }
];

// src/console/midStore.ts
var FILES = {
  dataSources: "midDataSources.json",
  metrics: "midMetrics.json",
  strategy: "midStrategy.json",
  dashboards: "midDashboards.json",
  alerts: "midAlerts.json",
  customers: "midCustomers.json",
  disposeTasks: "midDisposeTasks.json",
  vizSamples: "midVizSamples.json"
};
function loadOne(file) {
  return fetch(`/api/load-mid?file=${encodeURIComponent(file)}`).then((r) => r.ok ? r.json() : null).catch(() => null);
}
function saveOne(file, data2) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data2)
  }).then((r) => setSaveStatus(r.ok ? "saved" : "error")).catch(() => setSaveStatus("error"));
}
var dataSources = [...SEED_DATA_SOURCES];
var metrics = [...SEED_METRICS];
var strategy = {
  tasks: [...SEED_STRATEGY.tasks],
  rules: [...SEED_STRATEGY.rules],
  disposes: [...SEED_STRATEGY.disposes]
};
var dashboards = [...SEED_DASHBOARDS];
var alerts = [...SEED_ALERTS];
var customers = [...SEED_CUSTOMERS].map(withCustGraph);
var disposeTasks = [...SEED_DISPOSE_TASKS];
var vizSamples = [...SEED_VIZ_SAMPLES];
var version = 0;
var listeners2 = /* @__PURE__ */ new Set();
var saveStatus = "idle";
var statusListeners = /* @__PURE__ */ new Set();
var timers = {};
function notify() {
  version += 1;
  listeners2.forEach((l) => l());
}
function setSaveStatus(s) {
  saveStatus = s;
  statusListeners.forEach((l) => l(s));
}
function scheduleSave(file, data2) {
  if (timers[file]) clearTimeout(timers[file]);
  setSaveStatus("saving");
  timers[file] = setTimeout(() => saveOne(FILES[file], data2), 350);
}
async function bootstrap() {
  const [ds, mt, st, db, al, cu, dp, vz] = await Promise.all([
    loadOne(FILES.dataSources),
    loadOne(FILES.metrics),
    loadOne(FILES.strategy),
    loadOne(FILES.dashboards),
    loadOne(FILES.alerts),
    loadOne(FILES.customers),
    loadOne(FILES.disposeTasks),
    loadOne(FILES.vizSamples)
  ]);
  if (import.meta.env.DEV) {
    for (const [file, data2, arr] of [
      ["midDataSources.json", ds, true],
      ["midMetrics.json", mt, true],
      ["midStrategy.json", st, false],
      ["midDashboards.json", db, true],
      ["midAlerts.json", al, true],
      ["midCustomers.json", cu, true],
      ["midDisposeTasks.json", dp, true]
    ]) {
      if (data2 == null) console.warn(`[mid][dev] ${file} \u7F3A\u5931\uFF0C\u5DF2\u7528 SEED \u843D\u76D8`);
      else if (arr && !Array.isArray(data2)) console.warn(`[mid][dev] ${file} \u671F\u671B\u6570\u7EC4\uFF0C\u5B9E\u9645\u4E3A ${typeof data2}`);
      else if (!arr && (typeof data2 !== "object" || Array.isArray(data2))) console.warn(`[mid][dev] ${file} \u671F\u671B\u5BF9\u8C61`);
    }
  }
  if (Array.isArray(ds) && ds.length) dataSources = ds;
  else saveOne(FILES.dataSources, dataSources);
  if (Array.isArray(mt) && mt.length) metrics = mt;
  else saveOne(FILES.metrics, metrics);
  if (st && Array.isArray(st.tasks)) strategy = normalizeStrategy(st);
  else saveOne(FILES.strategy, strategy);
  if (Array.isArray(db) && db.length) dashboards = db;
  else saveOne(FILES.dashboards, dashboards);
  if (Array.isArray(al) && al.length) alerts = al;
  else saveOne(FILES.alerts, alerts);
  if (Array.isArray(cu) && cu.length) customers = cu.map(withCustGraph);
  else saveOne(FILES.customers, customers);
  if (Array.isArray(dp) && dp.length) disposeTasks = dp;
  else saveOne(FILES.disposeTasks, disposeTasks);
  if (Array.isArray(vz) && vz.length) vizSamples = vz;
  else saveOne(FILES.vizSamples, vizSamples);
  notify();
}
void bootstrap();
function subscribe2(l) {
  listeners2.add(l);
  return () => {
    listeners2.delete(l);
  };
}
function getVersion() {
  return version;
}
function useSnap(sel) {
  useSyncExternalStore2(subscribe2, getVersion);
  return sel();
}
function useMidAlerts() {
  return useSnap(() => alerts);
}
function useMidCustomers() {
  return useSnap(() => customers);
}
function updateAlerts(fn) {
  alerts = fn(alerts);
  notify();
  scheduleSave("alerts", alerts);
}

// src/console/FlowActionBar.tsx
import { useState as useState6 } from "react";

// src/console/flowStore.ts
import { useSyncExternalStore as useSyncExternalStore3 } from "react";

// src/console/bizFlows.json
var bizFlows_default = [
  {
    id: "f-online-approve",
    domain: "online_approve",
    name: "\u4E0A\u7EBF\u4E0B\u7EBF\u5BA1\u6838\u6D41\u7A0B",
    desc: "\u4E1A\u52A1\u6D41\u7A0B\u4E0A\u7EBF/\u4E0B\u7EBF\u5BA1\u6279\uFF1A\u5F85\u4E0A\u7EBF\uFF08\u9ED8\u8BA4\u65E0\u64CD\u4F5C\uFF09\u2192 \u521D\u5BA1 \u2192 \u590D\u5BA1 \u2192 \u5DF2\u4E0A\u7EBF",
    suggestionText: "",
    passNeedConfirm: true,
    passConfirmRole: "\u521D\u5BA1\u5458",
    rejectAllowRecheck: true,
    recheckSubmitRole: "\u590D\u5BA1\u5458",
    recheckApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    manualSuggestRole: "\u521D\u5BA1\u5458",
    manualApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    pageNames: [
      "\u76D1\u63A7\u4EFB\u52A1",
      "\u5904\u7F6E\u7B56\u7565",
      "\u6307\u6807\u5E93",
      "\u9875\u9762\u914D\u7F6E"
    ],
    pageRoutes: [
      "/console/cm/mid-strategy",
      "/console/cm/mid-dispose-strategy",
      "/console/cm/mid-metric",
      "/console/cm/mid-dashboard-config"
    ],
    flowGraphs: [
      {
        name: "\u4E0A\u7EBF\u5BA1\u6838",
        nodes: [
          {
            id: "n_start",
            type: "start",
            label: "\u5F85\u4E0A\u7EBF",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u63D0\u4EA4"
            ],
            resultStates: {
              \u63D0\u4EA4: "\u521D\u5BA1\u4E2D"
            }
          },
          {
            id: "n_audit1",
            type: "normal",
            label: "\u521D\u5BA1",
            x: 280,
            y: 140,
            role: "\u521D\u5BA1\u5458",
            buttonName: "\u521D\u5BA1",
            checkItems: [
              "\u914D\u7F6E\u5B8C\u6574\u6027\u68C0\u67E5",
              "\u53C2\u6570\u5408\u7406\u6027\u6821\u9A8C"
            ],
            results: [
              "\u901A\u8FC7",
              "\u9A73\u56DE"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u914D\u7F6E\u5B8C\u6574\uFF0C\u51C6\u4E88\u4E0A\u7EBF"
              ],
              \u9A73\u56DE: [
                "\u914D\u7F6E\u6709\u8BEF\uFF0C\u8BF7\u4FEE\u6539"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u590D\u5BA1\u4E2D",
              \u9A73\u56DE: "\u5F85\u4E0A\u7EBF"
            }
          },
          {
            id: "n_audit2",
            type: "normal",
            label: "\u590D\u5BA1",
            x: 520,
            y: 140,
            role: "\u98CE\u63A7\u4E3B\u7BA1",
            buttonName: "\u590D\u5BA1",
            checkItems: [
              "\u98CE\u63A7\u5F71\u54CD\u8BC4\u4F30",
              "\u5408\u89C4\u6027\u590D\u6838"
            ],
            results: [
              "\u901A\u8FC7",
              "\u9A73\u56DE"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u590D\u5BA1\u901A\u8FC7\uFF0C\u51C6\u4E88\u4E0A\u7EBF"
              ],
              \u9A73\u56DE: [
                "\u5B58\u5728\u98CE\u9669\uFF0C\u9A73\u56DE"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5DF2\u4E0A\u7EBF",
              \u9A73\u56DE: "\u521D\u5BA1\u4E2D"
            }
          },
          {
            id: "n_end",
            type: "end",
            label: "\u5DF2\u4E0A\u7EBF",
            x: 760,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [],
            opinionPresets: {}
          }
        ],
        edges: [
          {
            id: "e1",
            from: "n_start",
            to: "n_audit1",
            result: "\u63D0\u4EA4"
          },
          {
            id: "e2",
            from: "n_audit1",
            to: "n_audit2",
            result: "\u901A\u8FC7"
          },
          {
            id: "e3",
            from: "n_audit1",
            to: "n_start",
            result: "\u9A73\u56DE"
          },
          {
            id: "e4",
            from: "n_audit2",
            to: "n_end",
            result: "\u901A\u8FC7"
          },
          {
            id: "e5",
            from: "n_audit2",
            to: "n_audit1",
            result: "\u9A73\u56DE"
          }
        ]
      }
    ],
    flowState: "\u5DF2\u4E0A\u7EBF",
    flowSteps: [
      {
        state: "\u5F85\u4E0A\u7EBF",
        action: "\u63D0\u4EA4",
        next: "\u521D\u5BA1\u4E2D",
        color: "#D97706"
      },
      {
        state: "\u521D\u5BA1\u4E2D",
        action: "\u521D\u5BA1",
        next: "\u590D\u5BA1\u4E2D",
        color: "#2563EB"
      },
      {
        state: "\u590D\u5BA1\u4E2D",
        action: "\u590D\u5BA1",
        next: "\u5DF2\u4E0A\u7EBF",
        color: "#2563EB"
      },
      {
        state: "\u5DF2\u4E0A\u7EBF",
        action: "\u4E0B\u7EBF",
        next: "\u5DF2\u4E0B\u7EBF",
        color: "#059669"
      },
      {
        state: "\u5DF2\u4E0B\u7EBF",
        action: "",
        next: "",
        color: "#94A3B8"
      }
    ],
    pageRoute: "/console/cm/mid-strategy"
  },
  {
    id: "f-loan-collect",
    domain: "loan_collect",
    name: "\u903E\u671F\u50AC\u6536\u6D41\u7A0B",
    desc: "\u8D37\u6B3E\u53F0\u8D26\u7EC4\u4EF6\uFF1A\u903E\u671F\u5BA2\u6237 \u2192 \u50AC\u6536 \u2192 \u50AC\u6536\u4E2D \u2192 \u7ED3\u6E05",
    suggestionText: "",
    passNeedConfirm: true,
    passConfirmRole: "\u521D\u5BA1\u5458",
    rejectAllowRecheck: true,
    recheckSubmitRole: "\u590D\u5BA1\u5458",
    recheckApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    manualSuggestRole: "\u521D\u5BA1\u5458",
    manualApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    flowState: "\u5F85\u50AC\u6536",
    flowSteps: [
      {
        state: "\u5F85\u50AC\u6536",
        action: "\u50AC\u6536",
        next: "\u50AC\u6536\u4E2D",
        color: "#D97706"
      },
      {
        state: "\u50AC\u6536\u4E2D",
        action: "\u7ED3\u6E05",
        next: "\u5DF2\u7ED3\u6E05",
        color: "#2563EB"
      },
      {
        state: "\u5DF2\u7ED3\u6E05",
        action: "",
        color: "#059669"
      }
    ],
    flowGraphs: [
      {
        name: "\u903E\u671F\u50AC\u6536\u6D41\u7A0B",
        nodes: [
          {
            id: "n0",
            type: "start",
            label: "\u5F85\u50AC\u6536",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u50AC\u6536"
            ],
            resultStates: {
              \u50AC\u6536: "\u50AC\u6536\u4E2D"
            }
          },
          {
            id: "n1",
            type: "normal",
            label: "\u50AC\u6536\u4E2D",
            x: 300,
            y: 140,
            role: "\u50AC\u6536\u4E13\u5458",
            buttonName: "\u7ED3\u6E05",
            checkItems: [
              "\u6838\u5BF9\u903E\u671F\u5929\u6570\u4E0E\u91D1\u989D",
              "\u786E\u8BA4\u8FD8\u6B3E\u8BA1\u5212"
            ],
            results: [
              "\u7ED3\u6E05"
            ],
            opinionPresets: {
              \u7ED3\u6E05: [
                "\u5BA2\u6237\u5DF2\u7ED3\u6E05"
              ]
            },
            resultStates: {
              \u7ED3\u6E05: "\u5DF2\u7ED3\u6E05"
            }
          },
          {
            id: "n2",
            type: "end",
            label: "\u5DF2\u7ED3\u6E05",
            x: 560,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [],
            opinionPresets: {}
          }
        ],
        edges: [
          {
            id: "e1",
            from: "n0",
            to: "n1",
            result: "\u50AC\u6536"
          },
          {
            id: "e2",
            from: "n1",
            to: "n2",
            result: "\u7ED3\u6E05"
          }
        ]
      }
    ],
    pageRoutes: [],
    pageNames: []
  },
  {
    id: "f-cust-operate",
    domain: "cust_operate",
    name: "\u5BA2\u7FA4\u8FD0\u8425\u6D41\u7A0B",
    desc: "\u5BA2\u6237\u4FE1\u606F\u7EC4\u4EF6\uFF1A\u5B58\u91CF\u5BA2\u7FA4 \u2192 \u89E6\u8FBE \u2192 \u8425\u9500\u4E2D \u2192 \u8F6C\u5316",
    suggestionText: "",
    passNeedConfirm: true,
    passConfirmRole: "\u521D\u5BA1\u5458",
    rejectAllowRecheck: true,
    recheckSubmitRole: "\u590D\u5BA1\u5458",
    recheckApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    manualSuggestRole: "\u521D\u5BA1\u5458",
    manualApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    flowState: "\u5F85\u89E6\u8FBE",
    flowSteps: [
      {
        state: "\u5F85\u89E6\u8FBE",
        action: "\u89E6\u8FBE",
        next: "\u8425\u9500\u4E2D",
        color: "#D97706"
      },
      {
        state: "\u8425\u9500\u4E2D",
        action: "\u8F6C\u5316",
        next: "\u5DF2\u8F6C\u5316",
        color: "#2563EB"
      },
      {
        state: "\u5DF2\u8F6C\u5316",
        action: "",
        color: "#059669"
      }
    ],
    flowGraphs: [
      {
        name: "\u5BA2\u7FA4\u8FD0\u8425\u6D41\u7A0B",
        nodes: [
          {
            id: "n0",
            type: "start",
            label: "\u5F85\u89E6\u8FBE",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u89E6\u8FBE"
            ],
            resultStates: {
              \u89E6\u8FBE: "\u8425\u9500\u4E2D"
            }
          },
          {
            id: "n1",
            type: "normal",
            label: "\u8425\u9500\u4E2D",
            x: 300,
            y: 140,
            role: "\u5BA2\u6237\u7ECF\u7406",
            buttonName: "\u8F6C\u5316",
            checkItems: [
              "\u8BC4\u4F30\u5BA2\u7FA4\u89E6\u8FBE\u4EF7\u503C",
              "\u786E\u8BA4\u8425\u9500\u65B9\u6848"
            ],
            results: [
              "\u8F6C\u5316"
            ],
            opinionPresets: {
              \u8F6C\u5316: [
                "\u5BA2\u6237\u5DF2\u8F6C\u5316"
              ]
            },
            resultStates: {
              \u8F6C\u5316: "\u5DF2\u8F6C\u5316"
            }
          },
          {
            id: "n2",
            type: "end",
            label: "\u5DF2\u8F6C\u5316",
            x: 560,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [],
            opinionPresets: {}
          }
        ],
        edges: [
          {
            id: "e1",
            from: "n0",
            to: "n1",
            result: "\u89E6\u8FBE"
          },
          {
            id: "e2",
            from: "n1",
            to: "n2",
            result: "\u8F6C\u5316"
          }
        ]
      }
    ],
    pageRoutes: [],
    pageNames: []
  },
  {
    id: "f-behavior-promote",
    domain: "behavior_promote",
    name: "\u4FC3\u6D3B\u8BC4\u4F30\u6D41\u7A0B",
    desc: "\u884C\u4E3A\u6708\u8868\u7EC4\u4EF6\uFF1A\u6C89\u7761\u5BA2\u7FA4 \u2192 \u8BC4\u4F30 \u2192 \u8DDF\u8FDB\u4E2D \u2192 \u5B8C\u6210",
    suggestionText: "",
    passNeedConfirm: true,
    passConfirmRole: "\u521D\u5BA1\u5458",
    rejectAllowRecheck: true,
    recheckSubmitRole: "\u590D\u5BA1\u5458",
    recheckApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    manualSuggestRole: "\u521D\u5BA1\u5458",
    manualApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    flowState: "\u5F85\u8BC4\u4F30",
    flowSteps: [
      {
        state: "\u5F85\u8BC4\u4F30",
        action: "\u8BC4\u4F30",
        next: "\u8DDF\u8FDB\u4E2D",
        color: "#D97706"
      },
      {
        state: "\u8DDF\u8FDB\u4E2D",
        action: "\u5B8C\u6210",
        next: "\u5DF2\u5B8C\u6210",
        color: "#2563EB"
      },
      {
        state: "\u5DF2\u5B8C\u6210",
        action: "",
        color: "#059669"
      }
    ],
    flowGraphs: [
      {
        name: "\u4FC3\u6D3B\u8BC4\u4F30\u6D41\u7A0B",
        nodes: [
          {
            id: "n0",
            type: "start",
            label: "\u5F85\u8BC4\u4F30",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u8BC4\u4F30"
            ],
            resultStates: {
              \u8BC4\u4F30: "\u8DDF\u8FDB\u4E2D"
            }
          },
          {
            id: "n1",
            type: "normal",
            label: "\u8DDF\u8FDB\u4E2D",
            x: 300,
            y: 140,
            role: "\u8FD0\u8425\u4E13\u5458",
            buttonName: "\u5B8C\u6210",
            checkItems: [
              "\u5206\u6790\u6C89\u7761\u539F\u56E0",
              "\u5236\u5B9A\u4FC3\u6D3B\u7B56\u7565"
            ],
            results: [
              "\u5B8C\u6210"
            ],
            opinionPresets: {
              \u5B8C\u6210: [
                "\u4FC3\u6D3B\u8DDF\u8FDB\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u5B8C\u6210: "\u5DF2\u5B8C\u6210"
            }
          },
          {
            id: "n2",
            type: "end",
            label: "\u5DF2\u5B8C\u6210",
            x: 560,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [],
            opinionPresets: {}
          }
        ],
        edges: [
          {
            id: "e1",
            from: "n0",
            to: "n1",
            result: "\u8BC4\u4F30"
          },
          {
            id: "e2",
            from: "n1",
            to: "n2",
            result: "\u5B8C\u6210"
          }
        ]
      }
    ],
    pageRoutes: [],
    pageNames: []
  },
  {
    id: "f-credit-check",
    domain: "credit_check",
    name: "\u5F81\u4FE1\u6838\u9A8C\u6D41\u7A0B",
    desc: "\u5F81\u4FE1\u6570\u636E\u7EC4\u4EF6\uFF1A\u5916\u90E8\u5F81\u4FE1 \u2192 \u6838\u9A8C \u2192 \u6838\u9A8C\u4E2D \u2192 \u5DF2\u6838\u9A8C",
    suggestionText: "",
    passNeedConfirm: true,
    passConfirmRole: "\u521D\u5BA1\u5458",
    rejectAllowRecheck: true,
    recheckSubmitRole: "\u590D\u5BA1\u5458",
    recheckApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    manualSuggestRole: "\u521D\u5BA1\u5458",
    manualApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    flowState: "\u5DF2\u4E0A\u7EBF",
    flowSteps: [
      {
        state: "\u5F85\u6838\u9A8C",
        action: "\u6838\u9A8C",
        next: "\u6838\u9A8C\u4E2D",
        color: "#D97706"
      },
      {
        state: "\u6838\u9A8C\u4E2D",
        action: "\u5B8C\u6210",
        next: "\u5DF2\u6838\u9A8C",
        color: "#2563EB"
      },
      {
        state: "\u5DF2\u6838\u9A8C",
        action: "",
        color: "#059669"
      }
    ],
    flowGraphs: [
      {
        name: "\u5F81\u4FE1\u6838\u9A8C\u6D41\u7A0B",
        nodes: [
          {
            id: "n0",
            type: "start",
            label: "\u5F85\u6838\u9A8C",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u6838\u9A8C"
            ],
            resultStates: {
              \u6838\u9A8C: "\u6838\u9A8C\u4E2D"
            }
          },
          {
            id: "n1",
            type: "normal",
            label: "\u6838\u9A8C\u4E2D",
            x: 300,
            y: 140,
            role: "\u6838\u9A8C\u5458",
            buttonName: "\u5B8C\u6210",
            checkItems: [
              "\u6838\u5BF9\u5F81\u4FE1\u62A5\u544A",
              "\u786E\u8BA4\u6838\u9A8C\u7ED3\u8BBA"
            ],
            results: [
              "\u5B8C\u6210"
            ],
            opinionPresets: {
              \u5B8C\u6210: [
                "\u6838\u9A8C\u7ED3\u8BBA\u5DF2\u786E\u8BA4"
              ]
            },
            resultStates: {
              \u5B8C\u6210: "\u5DF2\u6838\u9A8C"
            }
          },
          {
            id: "n2",
            type: "end",
            label: "\u5DF2\u6838\u9A8C",
            x: 560,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [],
            opinionPresets: {}
          }
        ],
        edges: [
          {
            id: "e1",
            from: "n0",
            to: "n1",
            result: "\u6838\u9A8C"
          },
          {
            id: "e2",
            from: "n1",
            to: "n2",
            result: "\u5B8C\u6210"
          }
        ]
      },
      {
        name: "\u8F6C\u4EBA\u5DE5\u5BA1\u6838",
        nodes: [
          {
            id: "n_start",
            type: "start",
            label: "\u8F6C\u4EBA\u5DE5\u5BA1\u6838",
            buttonName: "\u8F6C\u4EBA\u5DE5\u5BA1\u6838",
            x: 40,
            y: 120
          },
          {
            id: "n_suggest",
            type: "normal",
            label: "\u63D0\u4EA4\u5EFA\u8BAE",
            x: 320,
            y: 120,
            role: "\u521D\u5BA1\u5458",
            checkItems: [
              "\u8EAB\u4EFD\u771F\u5B9E\u6027\u6838\u9A8C",
              "\u6536\u5165\u4E0E\u8D1F\u503A\u8BC4\u4F30"
            ],
            results: [
              "\u901A\u8FC7",
              "\u8F6C\u4EBA\u5DE5",
              "\u62D2\u7EDD"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u8C03\u6574\u5229\u7387",
                "\u8C03\u6574\u501F\u8D37\u91D1\u989D"
              ],
              \u8F6C\u4EBA\u5DE5: [
                "\u4FE1\u606F\u5B58\u7591\uFF0C\u8BF7\u4EBA\u5DE5\u590D\u6838"
              ],
              \u62D2\u7EDD: [
                "\u98CE\u63A7\u8BC4\u5206\u4E0D\u8DB3",
                "\u53CD\u6B3A\u8BC8\u89C4\u5219\u547D\u4E2D"
              ]
            },
            postState: "\u5F85\u4EBA\u5DE5"
          },
          {
            id: "n_approve",
            type: "normal",
            label: "\u5BA1\u6838\u5EFA\u8BAE",
            x: 600,
            y: 120,
            role: "\u98CE\u63A7\u4E3B\u7BA1",
            checkItems: [
              "\u5F81\u4FE1\u62A5\u544A\u590D\u6838",
              "\u989D\u5EA6\u4E0E\u5229\u7387\u5408\u7406\u6027"
            ],
            results: [
              "\u901A\u8FC7",
              "\u8F6C\u4EBA\u5DE5",
              "\u62D2\u7EDD"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u8C03\u6574\u5229\u7387",
                "\u8C03\u6574\u501F\u8D37\u91D1\u989D"
              ],
              \u8F6C\u4EBA\u5DE5: [
                "\u4FE1\u606F\u5B58\u7591\uFF0C\u8BF7\u4EBA\u5DE5\u590D\u6838"
              ],
              \u62D2\u7EDD: [
                "\u98CE\u63A7\u8BC4\u5206\u4E0D\u8DB3",
                "\u53CD\u6B3A\u8BC8\u89C4\u5219\u547D\u4E2D"
              ]
            },
            postState: "\u5DF2\u5BA1\u6838"
          },
          {
            id: "n_end",
            type: "end",
            label: "\u7ED3\u675F",
            x: 860,
            y: 120,
            showButton: true
          }
        ],
        edges: [
          {
            id: "e_n_start_n_suggest",
            from: "n_start",
            to: "n_suggest"
          },
          {
            id: "e_n_suggest_n_approve",
            from: "n_suggest",
            to: "n_approve"
          },
          {
            id: "e_n_approve_n_end",
            from: "n_approve",
            to: "n_end"
          }
        ]
      }
    ],
    pageRoutes: [],
    pageNames: []
  },
  {
    id: "f-event-analyze",
    domain: "event_analyze",
    name: "\u884C\u4E3A\u5206\u6790\u6D41\u7A0B",
    desc: "\u4E8B\u4EF6\u6570\u636E\u7EC4\u4EF6\uFF1A\u884C\u4E3A\u4E8B\u4EF6 \u2192 \u5206\u6790 \u2192 \u5206\u6790\u4E2D \u2192 \u5DF2\u5B8C\u6210",
    suggestionText: "",
    passNeedConfirm: true,
    passConfirmRole: "\u521D\u5BA1\u5458",
    rejectAllowRecheck: true,
    recheckSubmitRole: "\u590D\u5BA1\u5458",
    recheckApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    manualSuggestRole: "\u521D\u5BA1\u5458",
    manualApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    flowState: "\u5F85\u5206\u6790",
    flowSteps: [
      {
        state: "\u5F85\u5206\u6790",
        action: "\u5206\u6790",
        next: "\u5206\u6790\u4E2D",
        color: "#D97706"
      },
      {
        state: "\u5206\u6790\u4E2D",
        action: "\u5B8C\u6210",
        next: "\u5DF2\u5B8C\u6210",
        color: "#2563EB"
      },
      {
        state: "\u5DF2\u5B8C\u6210",
        action: "",
        color: "#059669"
      }
    ],
    flowGraphs: [
      {
        name: "\u884C\u4E3A\u5206\u6790\u6D41\u7A0B",
        nodes: [
          {
            id: "n0",
            type: "start",
            label: "\u5F85\u5206\u6790",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u5206\u6790"
            ],
            resultStates: {
              \u5206\u6790: "\u5206\u6790\u4E2D"
            }
          },
          {
            id: "n1",
            type: "normal",
            label: "\u5206\u6790\u4E2D",
            x: 300,
            y: 140,
            role: "\u5206\u6790\u5E08",
            buttonName: "\u5B8C\u6210",
            checkItems: [
              "\u786E\u8BA4\u4E8B\u4EF6\u53E3\u5F84",
              "\u590D\u6838\u5206\u6790\u7ED3\u679C"
            ],
            results: [
              "\u5B8C\u6210"
            ],
            opinionPresets: {
              \u5B8C\u6210: [
                "\u5206\u6790\u7ED3\u8BBA\u5DF2\u786E\u8BA4"
              ]
            },
            resultStates: {
              \u5B8C\u6210: "\u5DF2\u5B8C\u6210"
            }
          },
          {
            id: "n2",
            type: "end",
            label: "\u5DF2\u5B8C\u6210",
            x: 560,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [],
            opinionPresets: {}
          }
        ],
        edges: [
          {
            id: "e1",
            from: "n0",
            to: "n1",
            result: "\u5206\u6790"
          },
          {
            id: "e2",
            from: "n1",
            to: "n2",
            result: "\u5B8C\u6210"
          }
        ]
      }
    ],
    pageRoutes: [],
    pageNames: []
  },
  {
    id: "f-alert-dispose",
    name: "\u9884\u8B66\u5904\u7F6E\u6D41\u7A0B",
    desc: "\u6309\u9884\u8B66\u7C7B\u578B+\u7B49\u7EA7\u5206\u914D\u5177\u4F53\u5904\u7F6E\u6D41\u7A0B\uFF08\u4E00\u6761\u914D\u7F6E\uFF0C\u591A\u6761\u5177\u4F53\u6D41\u7A0B\uFF09",
    pageRoutes: [
      "/console/cr/mid-alert-workbench"
    ],
    pageNames: [
      "\u9884\u8B66\u5DE5\u4F5C\u53F0"
    ],
    flowGraphs: [
      {
        name: "\u7EA2\u706F\xB7\u51BB\u7ED3\u6B62\u4ED8\u5904\u7F6E\u6D41\u7A0B",
        match: [
          {
            field: "level",
            value: "RED"
          },
          {
            field: "alert_type",
            value: "\u53F8\u6CD5\u6D89\u8BC9,\u8BBE\u5907\u5F02\u5E38,\u53CD\u6B3A\u8BC8\u547D\u4E2D"
          }
        ],
        flowSteps: [
          {
            state: "\u9884\u8B66\u786E\u8BA4\u4E2D",
            action: "\u786E\u8BA4",
            next: "\u98CE\u9669\u7814\u5224\u4E2D",
            color: "#DC2626"
          },
          {
            state: "\u98CE\u9669\u7814\u5224\u4E2D",
            action: "\u7814\u5224",
            next: "\u51BB\u7ED3\u6B62\u4ED8\u4E2D",
            color: "#DC2626"
          },
          {
            state: "\u51BB\u7ED3\u6B62\u4ED8\u4E2D",
            action: "\u6267\u884C\u51BB\u7ED3",
            next: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            color: "#DC2626"
          },
          {
            state: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            action: "\u901A\u77E5\u5BA2\u6237",
            next: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            color: "#F59E0B"
          },
          {
            state: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            action: "\u8DDF\u8E2A\u8BC4\u4F30",
            next: "\u5DF2\u7ED3\u6848",
            color: "#059669"
          },
          {
            state: "\u5DF2\u7ED3\u6848",
            action: "",
            next: "",
            color: "#059669"
          }
        ],
        nodes: [
          {
            id: "n_0",
            type: "start",
            label: "\u9884\u8B66\u786E\u8BA4\u4E2D",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u786E\u8BA4"
            ],
            resultStates: {
              \u786E\u8BA4: "\u98CE\u9669\u7814\u5224\u4E2D"
            },
            timeLimit: 30
          },
          {
            id: "n_1",
            type: "normal",
            label: "\u98CE\u9669\u7814\u5224\u4E2D",
            x: 280,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u7814\u5224",
            checkItems: [
              "\u98CE\u9669\u7814\u5224\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u98CE\u9669\u7814\u5224\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u51BB\u7ED3\u6B62\u4ED8\u4E2D"
            },
            timeLimit: 60
          },
          {
            id: "n_2",
            type: "normal",
            label: "\u51BB\u7ED3\u6B62\u4ED8\u4E2D",
            x: 520,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u6267\u884C\u51BB\u7ED3",
            checkItems: [
              "\u51BB\u7ED3\u6B62\u4ED8\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u51BB\u7ED3\u6B62\u4ED8\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5BA2\u6237\u901A\u77E5\u4E2D"
            },
            timeLimit: 120
          },
          {
            id: "n_3",
            type: "normal",
            label: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            x: 760,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u901A\u77E5\u5BA2\u6237",
            checkItems: [
              "\u5BA2\u6237\u901A\u77E5\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u5BA2\u6237\u901A\u77E5\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u6548\u679C\u8DDF\u8E2A\u4E2D"
            },
            timeLimit: 1440
          },
          {
            id: "n_4",
            type: "normal",
            label: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            x: 1e3,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u8DDF\u8E2A\u8BC4\u4F30",
            checkItems: [
              "\u6548\u679C\u8DDF\u8E2A\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u6548\u679C\u8DDF\u8E2A\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5DF2\u7ED3\u6848"
            },
            timeLimit: 4320
          },
          {
            id: "n_5",
            type: "end",
            label: "\u5DF2\u7ED3\u6848",
            x: 1240,
            y: 140,
            timeLimit: 7200
          }
        ],
        edges: [
          {
            id: "e_0",
            from: "n_0",
            to: "n_1"
          },
          {
            id: "e_1",
            from: "n_1",
            to: "n_2"
          },
          {
            id: "e_2",
            from: "n_2",
            to: "n_3"
          },
          {
            id: "e_3",
            from: "n_3",
            to: "n_4"
          },
          {
            id: "e_4",
            from: "n_4",
            to: "n_5"
          }
        ]
      },
      {
        name: "\u7EA2\u706F\xB7\u964D\u989D\u5904\u7F6E\u6D41\u7A0B",
        match: [
          {
            field: "level",
            value: "RED"
          },
          {
            field: "alert_type",
            value: "\u8D1F\u503A\u6FC0\u589E,\u591A\u5934\u501F\u8D37,\u5173\u8054\u4F01\u4E1A\u98CE\u9669,\u884C\u4E3A\u8BC4\u5206\u4E0B\u964D,\u8FD8\u6B3E\u80FD\u529B\u4E0D\u8DB3,\u8206\u60C5\u8D1F\u9762"
          }
        ],
        flowSteps: [
          {
            state: "\u9884\u8B66\u786E\u8BA4\u4E2D",
            action: "\u786E\u8BA4",
            next: "\u98CE\u9669\u7814\u5224\u4E2D",
            color: "#DC2626"
          },
          {
            state: "\u98CE\u9669\u7814\u5224\u4E2D",
            action: "\u7814\u5224",
            next: "\u964D\u989D\u6267\u884C\u4E2D",
            color: "#DC2626"
          },
          {
            state: "\u964D\u989D\u6267\u884C\u4E2D",
            action: "\u6267\u884C\u964D\u989D",
            next: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            color: "#DC2626"
          },
          {
            state: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            action: "\u901A\u77E5\u5BA2\u6237",
            next: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            color: "#F59E0B"
          },
          {
            state: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            action: "\u8DDF\u8E2A\u8BC4\u4F30",
            next: "\u5DF2\u7ED3\u6848",
            color: "#059669"
          },
          {
            state: "\u5DF2\u7ED3\u6848",
            action: "",
            next: "",
            color: "#059669"
          }
        ],
        nodes: [
          {
            id: "n_0",
            type: "start",
            label: "\u9884\u8B66\u786E\u8BA4\u4E2D",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u786E\u8BA4"
            ],
            resultStates: {
              \u786E\u8BA4: "\u98CE\u9669\u7814\u5224\u4E2D"
            },
            timeLimit: 30
          },
          {
            id: "n_1",
            type: "normal",
            label: "\u98CE\u9669\u7814\u5224\u4E2D",
            x: 280,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u7814\u5224",
            checkItems: [
              "\u98CE\u9669\u7814\u5224\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u98CE\u9669\u7814\u5224\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u964D\u989D\u6267\u884C\u4E2D"
            },
            timeLimit: 120
          },
          {
            id: "n_2",
            type: "normal",
            label: "\u964D\u989D\u6267\u884C\u4E2D",
            x: 520,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u6267\u884C\u964D\u989D",
            checkItems: [
              "\u964D\u989D\u6267\u884C\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u964D\u989D\u6267\u884C\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5BA2\u6237\u901A\u77E5\u4E2D"
            },
            timeLimit: 240
          },
          {
            id: "n_3",
            type: "normal",
            label: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            x: 760,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u901A\u77E5\u5BA2\u6237",
            checkItems: [
              "\u5BA2\u6237\u901A\u77E5\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u5BA2\u6237\u901A\u77E5\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u6548\u679C\u8DDF\u8E2A\u4E2D"
            },
            timeLimit: 1440
          },
          {
            id: "n_4",
            type: "normal",
            label: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            x: 1e3,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u8DDF\u8E2A\u8BC4\u4F30",
            checkItems: [
              "\u6548\u679C\u8DDF\u8E2A\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u6548\u679C\u8DDF\u8E2A\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5DF2\u7ED3\u6848"
            },
            timeLimit: 4320
          },
          {
            id: "n_5",
            type: "end",
            label: "\u5DF2\u7ED3\u6848",
            x: 1240,
            y: 140,
            timeLimit: 7200
          }
        ],
        edges: [
          {
            id: "e_0",
            from: "n_0",
            to: "n_1"
          },
          {
            id: "e_1",
            from: "n_1",
            to: "n_2"
          },
          {
            id: "e_2",
            from: "n_2",
            to: "n_3"
          },
          {
            id: "e_3",
            from: "n_3",
            to: "n_4"
          },
          {
            id: "e_4",
            from: "n_4",
            to: "n_5"
          }
        ]
      },
      {
        name: "\u9884\u8B66\u9884\u50AC\u5904\u7F6E\u6D41\u7A0B",
        match: [
          {
            field: "alert_type",
            value: "\u903E\u671F\u9884\u8B66,\u56DE\u8BBF\u5931\u8054"
          }
        ],
        flowSteps: [
          {
            state: "\u9884\u8B66\u786E\u8BA4\u4E2D",
            action: "\u786E\u8BA4",
            next: "\u98CE\u9669\u7814\u5224\u4E2D",
            color: "#F59E0B"
          },
          {
            state: "\u98CE\u9669\u7814\u5224\u4E2D",
            action: "\u7814\u5224",
            next: "\u9884\u50AC\u6267\u884C\u4E2D",
            color: "#F59E0B"
          },
          {
            state: "\u9884\u50AC\u6267\u884C\u4E2D",
            action: "\u6267\u884C\u9884\u50AC",
            next: "\u50AC\u6536\u4ECB\u5165\u4E2D",
            color: "#F59E0B"
          },
          {
            state: "\u50AC\u6536\u4ECB\u5165\u4E2D",
            action: "\u50AC\u6536\u4ECB\u5165",
            next: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            color: "#F59E0B"
          },
          {
            state: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            action: "\u901A\u77E5\u5BA2\u6237",
            next: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            color: "#2563EB"
          },
          {
            state: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            action: "\u8DDF\u8E2A\u8BC4\u4F30",
            next: "\u5DF2\u7ED3\u6848",
            color: "#059669"
          },
          {
            state: "\u5DF2\u7ED3\u6848",
            action: "",
            next: "",
            color: "#059669"
          }
        ],
        nodes: [
          {
            id: "n_0",
            type: "start",
            label: "\u9884\u8B66\u786E\u8BA4\u4E2D",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u786E\u8BA4"
            ],
            resultStates: {
              \u786E\u8BA4: "\u98CE\u9669\u7814\u5224\u4E2D"
            },
            timeLimit: 30
          },
          {
            id: "n_1",
            type: "normal",
            label: "\u98CE\u9669\u7814\u5224\u4E2D",
            x: 280,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u7814\u5224",
            checkItems: [
              "\u98CE\u9669\u7814\u5224\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u98CE\u9669\u7814\u5224\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u9884\u50AC\u6267\u884C\u4E2D"
            },
            timeLimit: 120
          },
          {
            id: "n_2",
            type: "normal",
            label: "\u9884\u50AC\u6267\u884C\u4E2D",
            x: 520,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u6267\u884C\u9884\u50AC",
            checkItems: [
              "\u9884\u50AC\u6267\u884C\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u9884\u50AC\u6267\u884C\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u50AC\u6536\u4ECB\u5165\u4E2D"
            },
            timeLimit: 120
          },
          {
            id: "n_3",
            type: "normal",
            label: "\u50AC\u6536\u4ECB\u5165\u4E2D",
            x: 760,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u50AC\u6536\u4ECB\u5165",
            checkItems: [
              "\u50AC\u6536\u4ECB\u5165\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u50AC\u6536\u4ECB\u5165\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5BA2\u6237\u901A\u77E5\u4E2D"
            },
            timeLimit: 240
          },
          {
            id: "n_4",
            type: "normal",
            label: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            x: 1e3,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u901A\u77E5\u5BA2\u6237",
            checkItems: [
              "\u5BA2\u6237\u901A\u77E5\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u5BA2\u6237\u901A\u77E5\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u6548\u679C\u8DDF\u8E2A\u4E2D"
            },
            timeLimit: 1440
          },
          {
            id: "n_5",
            type: "normal",
            label: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            x: 1240,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u8DDF\u8E2A\u8BC4\u4F30",
            checkItems: [
              "\u6548\u679C\u8DDF\u8E2A\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u6548\u679C\u8DDF\u8E2A\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5DF2\u7ED3\u6848"
            },
            timeLimit: 4320
          },
          {
            id: "n_6",
            type: "end",
            label: "\u5DF2\u7ED3\u6848",
            x: 1480,
            y: 140,
            timeLimit: 7200
          }
        ],
        edges: [
          {
            id: "e_0",
            from: "n_0",
            to: "n_1"
          },
          {
            id: "e_1",
            from: "n_1",
            to: "n_2"
          },
          {
            id: "e_2",
            from: "n_2",
            to: "n_3"
          },
          {
            id: "e_3",
            from: "n_3",
            to: "n_4"
          },
          {
            id: "e_4",
            from: "n_4",
            to: "n_5"
          },
          {
            id: "e_5",
            from: "n_5",
            to: "n_6"
          }
        ]
      },
      {
        name: "\u9EC4\u706F\xB7\u5173\u6CE8\u5904\u7F6E\u6D41\u7A0B",
        match: [
          {
            field: "level",
            value: "YELLOW"
          },
          {
            field: "alert_type",
            value: "\u8D1F\u503A\u6FC0\u589E,\u591A\u5934\u501F\u8D37,\u53F8\u6CD5\u6D89\u8BC9,\u5173\u8054\u4F01\u4E1A\u98CE\u9669,\u8BBE\u5907\u5F02\u5E38,\u53CD\u6B3A\u8BC8\u547D\u4E2D,\u884C\u4E3A\u8BC4\u5206\u4E0B\u964D,\u8FD8\u6B3E\u80FD\u529B\u4E0D\u8DB3,\u8206\u60C5\u8D1F\u9762"
          }
        ],
        flowSteps: [
          {
            state: "\u9884\u8B66\u786E\u8BA4\u4E2D",
            action: "\u786E\u8BA4",
            next: "\u98CE\u9669\u7814\u5224\u4E2D",
            color: "#F59E0B"
          },
          {
            state: "\u98CE\u9669\u7814\u5224\u4E2D",
            action: "\u7814\u5224",
            next: "\u4EBA\u5DE5\u590D\u6838\u4E2D",
            color: "#F59E0B"
          },
          {
            state: "\u4EBA\u5DE5\u590D\u6838\u4E2D",
            action: "\u4EBA\u5DE5\u590D\u6838",
            next: "\u5173\u6CE8\u89C2\u5BDF\u4E2D",
            color: "#F59E0B"
          },
          {
            state: "\u5173\u6CE8\u89C2\u5BDF\u4E2D",
            action: "\u5F00\u59CB\u5173\u6CE8",
            next: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            color: "#F59E0B"
          },
          {
            state: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            action: "\u901A\u77E5\u5BA2\u6237",
            next: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            color: "#2563EB"
          },
          {
            state: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            action: "\u8DDF\u8E2A\u8BC4\u4F30",
            next: "\u5DF2\u7ED3\u6848",
            color: "#059669"
          },
          {
            state: "\u5DF2\u7ED3\u6848",
            action: "",
            next: "",
            color: "#059669"
          }
        ],
        nodes: [
          {
            id: "n_0",
            type: "start",
            label: "\u9884\u8B66\u786E\u8BA4\u4E2D",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u786E\u8BA4"
            ],
            resultStates: {
              \u786E\u8BA4: "\u98CE\u9669\u7814\u5224\u4E2D"
            },
            timeLimit: 30
          },
          {
            id: "n_1",
            type: "normal",
            label: "\u98CE\u9669\u7814\u5224\u4E2D",
            x: 280,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u7814\u5224",
            checkItems: [
              "\u98CE\u9669\u7814\u5224\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u98CE\u9669\u7814\u5224\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u4EBA\u5DE5\u590D\u6838\u4E2D"
            },
            timeLimit: 120
          },
          {
            id: "n_2",
            type: "normal",
            label: "\u4EBA\u5DE5\u590D\u6838\u4E2D",
            x: 520,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u4EBA\u5DE5\u590D\u6838",
            checkItems: [
              "\u4EBA\u5DE5\u590D\u6838\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u4EBA\u5DE5\u590D\u6838\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5173\u6CE8\u89C2\u5BDF\u4E2D"
            },
            timeLimit: 240
          },
          {
            id: "n_3",
            type: "normal",
            label: "\u5173\u6CE8\u89C2\u5BDF\u4E2D",
            x: 760,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u5F00\u59CB\u5173\u6CE8",
            checkItems: [
              "\u5173\u6CE8\u89C2\u5BDF\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u5173\u6CE8\u89C2\u5BDF\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5BA2\u6237\u901A\u77E5\u4E2D"
            },
            timeLimit: 4320
          },
          {
            id: "n_4",
            type: "normal",
            label: "\u5BA2\u6237\u901A\u77E5\u4E2D",
            x: 1e3,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u901A\u77E5\u5BA2\u6237",
            checkItems: [
              "\u5BA2\u6237\u901A\u77E5\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u5BA2\u6237\u901A\u77E5\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u6548\u679C\u8DDF\u8E2A\u4E2D"
            },
            timeLimit: 1440
          },
          {
            id: "n_5",
            type: "normal",
            label: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            x: 1240,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u8DDF\u8E2A\u8BC4\u4F30",
            checkItems: [
              "\u6548\u679C\u8DDF\u8E2A\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u6548\u679C\u8DDF\u8E2A\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5DF2\u7ED3\u6848"
            },
            timeLimit: 4320
          },
          {
            id: "n_6",
            type: "end",
            label: "\u5DF2\u7ED3\u6848",
            x: 1480,
            y: 140,
            timeLimit: 7200
          }
        ],
        edges: [
          {
            id: "e_0",
            from: "n_0",
            to: "n_1"
          },
          {
            id: "e_1",
            from: "n_1",
            to: "n_2"
          },
          {
            id: "e_2",
            from: "n_2",
            to: "n_3"
          },
          {
            id: "e_3",
            from: "n_3",
            to: "n_4"
          },
          {
            id: "e_4",
            from: "n_4",
            to: "n_5"
          },
          {
            id: "e_5",
            from: "n_5",
            to: "n_6"
          }
        ]
      },
      {
        name: "\u673A\u4F1A\xB7\u63D0\u989D\u5904\u7F6E\u6D41\u7A0B",
        match: [
          {
            field: "level",
            value: "OPPORTUNITY"
          }
        ],
        flowSteps: [
          {
            state: "\u673A\u4F1A\u786E\u8BA4\u4E2D",
            action: "\u786E\u8BA4",
            next: "\u4EF7\u503C\u7814\u5224\u4E2D",
            color: "#059669"
          },
          {
            state: "\u4EF7\u503C\u7814\u5224\u4E2D",
            action: "\u7814\u5224",
            next: "\u63D0\u989D\u6267\u884C\u4E2D",
            color: "#059669"
          },
          {
            state: "\u63D0\u989D\u6267\u884C\u4E2D",
            action: "\u6267\u884C\u63D0\u989D",
            next: "\u5BA2\u6237\u89E6\u8FBE\u4E2D",
            color: "#059669"
          },
          {
            state: "\u5BA2\u6237\u89E6\u8FBE\u4E2D",
            action: "\u89E6\u8FBE\u5BA2\u6237",
            next: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            color: "#2563EB"
          },
          {
            state: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            action: "\u8DDF\u8E2A\u8BC4\u4F30",
            next: "\u5DF2\u7ED3\u6848",
            color: "#059669"
          },
          {
            state: "\u5DF2\u7ED3\u6848",
            action: "",
            next: "",
            color: "#059669"
          }
        ],
        nodes: [
          {
            id: "n_0",
            type: "start",
            label: "\u673A\u4F1A\u786E\u8BA4\u4E2D",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u786E\u8BA4"
            ],
            resultStates: {
              \u786E\u8BA4: "\u4EF7\u503C\u7814\u5224\u4E2D"
            },
            timeLimit: 30
          },
          {
            id: "n_1",
            type: "normal",
            label: "\u4EF7\u503C\u7814\u5224\u4E2D",
            x: 280,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u7814\u5224",
            checkItems: [
              "\u4EF7\u503C\u7814\u5224\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u4EF7\u503C\u7814\u5224\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u63D0\u989D\u6267\u884C\u4E2D"
            },
            timeLimit: 120
          },
          {
            id: "n_2",
            type: "normal",
            label: "\u63D0\u989D\u6267\u884C\u4E2D",
            x: 520,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u6267\u884C\u63D0\u989D",
            checkItems: [
              "\u63D0\u989D\u6267\u884C\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u63D0\u989D\u6267\u884C\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5BA2\u6237\u89E6\u8FBE\u4E2D"
            },
            timeLimit: 240
          },
          {
            id: "n_3",
            type: "normal",
            label: "\u5BA2\u6237\u89E6\u8FBE\u4E2D",
            x: 760,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u89E6\u8FBE\u5BA2\u6237",
            checkItems: [
              "\u5BA2\u6237\u89E6\u8FBE\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u5BA2\u6237\u89E6\u8FBE\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u6548\u679C\u8DDF\u8E2A\u4E2D"
            },
            timeLimit: 1440
          },
          {
            id: "n_4",
            type: "normal",
            label: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            x: 1e3,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u8DDF\u8E2A\u8BC4\u4F30",
            checkItems: [
              "\u6548\u679C\u8DDF\u8E2A\u4E2D\u68C0\u67E5\u98791"
            ],
            results: [
              "\u901A\u8FC7"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u6548\u679C\u8DDF\u8E2A\u4E2D\u5904\u7406\u5B8C\u6210"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5DF2\u7ED3\u6848"
            },
            timeLimit: 4320
          },
          {
            id: "n_5",
            type: "end",
            label: "\u5DF2\u7ED3\u6848",
            x: 1240,
            y: 140,
            timeLimit: 7200
          }
        ],
        edges: [
          {
            id: "e_0",
            from: "n_0",
            to: "n_1"
          },
          {
            id: "e_1",
            from: "n_1",
            to: "n_2"
          },
          {
            id: "e_2",
            from: "n_2",
            to: "n_3"
          },
          {
            id: "e_3",
            from: "n_3",
            to: "n_4"
          },
          {
            id: "e_4",
            from: "n_4",
            to: "n_5"
          }
        ]
      }
    ]
  },
  {
    id: "f-loan-review",
    name: "\u8D37\u524D\u5BA1\u6838\u6D41\u7A0B",
    desc: "\u8D37\u524D\u56DB\u9875\uFF08\u8FDB\u4EF6\u5BA1\u6838/\u4FE1\u606F\u6838\u9A8C/\u4FE1\u7528\u98CE\u63A7/\u6B3A\u8BC8\u8BC6\u522B\uFF09\u5171\u7528\u5BA1\u6838\u6D41\u7A0B\uFF1A\u4E00\u6761\u914D\u7F6E\u5173\u8054\u56DB\u9875\uFF0C\u5217\u8868\u663E\u793A\u6D41\u7A0B\u72B6\u6001\u5217\u3001\u8BE6\u60C5\u663E\u793A\u6D41\u7A0B\u64CD\u4F5C\u6761\u3002\u5BA1\u6838\u8282\u70B9\u5E26\u68C0\u67E5\u9879/\u610F\u89C1\u9884\u8BBE/\u89D2\u8272\uFF08\u6CBF\u7528 0805 \u7248\u4E1A\u52A1\u5185\u5BB9\uFF09",
    pageRoutes: [
      "/console/cr/pre-report",
      "/console/cr/pre-report-detail",
      "/console/cr/pre-verify",
      "/console/cr/pre-verify-detail",
      "/console/cr/credit-kimi",
      "/console/cr/credit-kimi-detail",
      "/console/cr/pre-fraud",
      "/console/cr/pre-fraud-detail"
    ],
    pageNames: [
      "\u8FDB\u4EF6\u5BA1\u6838",
      "\u4FE1\u606F\u6838\u9A8C",
      "\u4FE1\u7528\u98CE\u63A7",
      "\u6B3A\u8BC8\u8BC6\u522B"
    ],
    flowGraphs: [
      {
        nodes: [
          {
            id: "n_0",
            type: "start",
            label: "\u5F85\u5BA1\u6838",
            buttonName: "\u521D\u5BA1",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [
              "\u5F00\u59CB\u5BA1\u6838"
            ],
            resultStates: {
              \u5F00\u59CB\u5BA1\u6838: "\u5BA1\u6838\u4E2D"
            },
            timeLimit: 30
          },
          {
            id: "n_1",
            type: "normal",
            label: "\u5BA1\u6838\u4E2D",
            x: 360,
            y: 140,
            role: "\u98CE\u63A7\u4E3B\u7BA1",
            buttonName: "\u590D\u5BA1",
            checkItems: [
              "\u8EAB\u4EFD\u771F\u5B9E\u6027\u6838\u9A8C",
              "\u8D44\u6599\u5B8C\u6574\u6027\u68C0\u67E5",
              "\u4FE1\u7528\u4E0E\u6B3A\u8BC8\u7EFC\u5408\u7814\u5224",
              "\u989D\u5EA6\u4E0E\u5229\u7387\u5408\u7406\u6027"
            ],
            results: [
              "\u901A\u8FC7",
              "\u8F6C\u4EBA\u5DE5",
              "\u62D2\u7EDD"
            ],
            opinionPresets: {
              \u901A\u8FC7: [
                "\u98CE\u9669\u53EF\u63A7\uFF0C\u6B63\u5E38\u901A\u8FC7"
              ],
              \u8F6C\u4EBA\u5DE5: [
                "\u4FE1\u606F\u5B58\u7591\uFF0C\u8BF7\u4EBA\u5DE5\u590D\u6838"
              ],
              \u62D2\u7EDD: [
                "\u7EFC\u5408\u98CE\u9669\u8F83\u9AD8\uFF0C\u62D2\u7EDD\u6388\u4FE1"
              ]
            },
            resultStates: {
              \u901A\u8FC7: "\u5DF2\u901A\u8FC7"
            },
            timeLimit: 60
          },
          {
            id: "n_2",
            type: "end",
            label: "\u5DF2\u901A\u8FC7",
            x: 680,
            y: 140,
            showButton: false,
            timeLimit: 0
          }
        ],
        edges: [
          {
            id: "e_0",
            from: "n_0",
            to: "n_1"
          },
          {
            id: "e_1",
            from: "n_1",
            to: "n_2"
          }
        ],
        name: "\u8D37\u524D\u5BA1\u6838\u6D41\u7A0B",
        match: [],
        flowSteps: [
          {
            state: "\u5F85\u5BA1\u6838",
            action: "\u5F00\u59CB\u5BA1\u6838",
            next: "\u5BA1\u6838\u4E2D",
            color: "#D97706"
          },
          {
            state: "\u5BA1\u6838\u4E2D",
            action: "\u5BA1\u6838\u901A\u8FC7",
            next: "\u5DF2\u901A\u8FC7",
            color: "#2563EB"
          },
          {
            state: "\u5DF2\u901A\u8FC7",
            action: "",
            next: "",
            color: "#059669"
          }
        ]
      }
    ]
  },
  {
    id: "f-score-dispose",
    name: "\u8BC4\u5206\u9884\u8B66\u5904\u7F6E\u6D41\u7A0B",
    desc: "\u8BC4\u5206\u4EA7\u54C1\xB7\u5F97\u5206\u8BE6\u60C5\u9875\u9884\u8B66\u5904\u7F6E\uFF1A\u6309\u9884\u8B66\u7B49\u7EA7\uFF08\u7EA2\u706F/\u9EC4\u706F/\u673A\u4F1A\uFF09\u5339\u914D\u4E0D\u540C\u5904\u7F6E\u6D41\u7A0B\uFF0C\u8BE6\u60C5\u9875\u300C\u9884\u8B66\u5904\u7F6E\u300D\u6CBF\u6D41\u7A0B\u6D41\u8F6C",
    pageRoutes: [
      "/console/cr/mid-cust-score"
    ],
    pageNames: [
      "\u8BC4\u5206\u5F97\u5206\u8BE6\u60C5"
    ],
    flowGraphs: [
      {
        name: "\u7EA2\u706F\u9884\u8B66\u5904\u7F6E",
        match: [
          {
            field: "level",
            value: "RED"
          }
        ],
        flowSteps: [
          {
            state: "\u5F85\u53D7\u7406",
            action: "\u53D7\u7406",
            next: "\u6838\u5B9E\u4E2D",
            color: "#DC2626"
          },
          {
            state: "\u6838\u5B9E\u4E2D",
            action: "\u6838\u5B9E",
            next: "\u5904\u7F6E\u4E2D",
            color: "#DC2626"
          },
          {
            state: "\u5904\u7F6E\u4E2D",
            action: "\u6267\u884C\u5904\u7F6E",
            next: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            color: "#F59E0B"
          },
          {
            state: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            action: "\u8DDF\u8E2A\u8BC4\u4F30",
            next: "\u5DF2\u95ED\u73AF",
            color: "#059669"
          },
          {
            state: "\u5DF2\u95ED\u73AF",
            action: "",
            next: "",
            color: "#059669"
          }
        ]
      },
      {
        name: "\u9EC4\u706F\u9884\u8B66\u5904\u7F6E",
        match: [
          {
            field: "level",
            value: "YELLOW"
          }
        ],
        flowSteps: [
          {
            state: "\u5F85\u53D7\u7406",
            action: "\u53D7\u7406",
            next: "\u6838\u5B9E\u4E2D",
            color: "#D97706"
          },
          {
            state: "\u6838\u5B9E\u4E2D",
            action: "\u6838\u5B9E",
            next: "\u5904\u7F6E\u4E2D",
            color: "#D97706"
          },
          {
            state: "\u5904\u7F6E\u4E2D",
            action: "\u6267\u884C\u5904\u7F6E",
            next: "\u5DF2\u95ED\u73AF",
            color: "#059669"
          },
          {
            state: "\u5DF2\u95ED\u73AF",
            action: "",
            next: "",
            color: "#059669"
          }
        ]
      },
      {
        name: "\u673A\u4F1A\u9884\u8B66\u5904\u7F6E",
        match: [
          {
            field: "level",
            value: "OPPORTUNITY"
          }
        ],
        flowSteps: [
          {
            state: "\u5F85\u53D7\u7406",
            action: "\u53D7\u7406",
            next: "\u8BC4\u4F30\u4E2D",
            color: "#0891B2"
          },
          {
            state: "\u8BC4\u4F30\u4E2D",
            action: "\u8BC4\u4F30",
            next: "\u5DF2\u95ED\u73AF",
            color: "#059669"
          },
          {
            state: "\u5DF2\u95ED\u73AF",
            action: "",
            next: "",
            color: "#059669"
          }
        ]
      }
    ]
  },
  {
    id: "f-ent-alert",
    name: "\u4F01\u4E1A\u9884\u8B66\u5904\u7F6E\u6D41\u7A0B",
    desc: "\u4F01\u4E1A\u98CE\u63A7\xB7\u9884\u8B66\u5904\u7F6E\u5DE5\u4F5C\u53F0\u7EDF\u4E00\u6D41\u7A0B\uFF1A\u6309\u9884\u8B66\u7B49\u7EA7\uFF08\u7EA2\u706F/\u9EC4\u706F\uFF09\u5339\u914D\u5177\u4F53\u5904\u7F6E\u6D41\u7A0B\uFF0C\u5217\u8868\u663E\u793A\u300C\u65F6\u9650\u5012\u8BA1\u65F6\u300D\u4E0E\u300C\u6D41\u7A0B\u72B6\u6001\u300D\u5217\uFF0C\u72B6\u6001\u6CBF\u6D41\u7A0B\u6D41\u8F6C\uFF08\u53C2\u7167\u8D37\u4E2D\u9884\u8B66\u5904\u7F6E\u6D41\u7A0B\u67B6\u6784\uFF09",
    pageRoutes: [
      "/console/ep/alert-workbench"
    ],
    pageNames: [
      "\u9884\u8B66\u5904\u7F6E\u5DE5\u4F5C\u53F0"
    ],
    flowGraphs: [
      {
        name: "\u7EA2\u706F\xB7\u9AD8\u98CE\u9669\u5904\u7F6E\u6D41\u7A0B",
        match: [
          {
            field: "level",
            value: "RED"
          }
        ],
        flowSteps: [
          { state: "\u9884\u8B66\u786E\u8BA4\u4E2D", action: "\u786E\u8BA4", next: "\u98CE\u9669\u7814\u5224\u4E2D", color: "#DC2626" },
          { state: "\u98CE\u9669\u7814\u5224\u4E2D", action: "\u7814\u5224", next: "\u5904\u7F6E\u6267\u884C\u4E2D", color: "#DC2626" },
          { state: "\u5904\u7F6E\u6267\u884C\u4E2D", action: "\u6267\u884C\u5904\u7F6E", next: "\u6548\u679C\u8DDF\u8E2A\u4E2D", color: "#F59E0B" },
          { state: "\u6548\u679C\u8DDF\u8E2A\u4E2D", action: "\u8DDF\u8E2A\u8BC4\u4F30", next: "\u5DF2\u7ED3\u6848", color: "#059669" },
          { state: "\u5DF2\u7ED3\u6848", action: "", next: "", color: "#059669" }
        ],
        nodes: [
          {
            id: "n_0",
            type: "start",
            label: "\u9884\u8B66\u786E\u8BA4\u4E2D",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: ["\u786E\u8BA4"],
            resultStates: { \u786E\u8BA4: "\u98CE\u9669\u7814\u5224\u4E2D" },
            timeLimit: 24
          },
          {
            id: "n_1",
            type: "normal",
            label: "\u98CE\u9669\u7814\u5224\u4E2D",
            x: 280,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u7814\u5224",
            checkItems: ["\u9884\u8B66\u771F\u5B9E\u6027\u4E0E\u5F71\u54CD\u8BC4\u4F30"],
            results: ["\u901A\u8FC7"],
            opinionPresets: { \u901A\u8FC7: ["\u98CE\u9669\u7814\u5224\u5B8C\u6210\uFF0C\u8FDB\u5165\u5904\u7F6E\u6267\u884C"] },
            resultStates: { \u901A\u8FC7: "\u5904\u7F6E\u6267\u884C\u4E2D" },
            timeLimit: 48
          },
          {
            id: "n_2",
            type: "normal",
            label: "\u5904\u7F6E\u6267\u884C\u4E2D",
            x: 520,
            y: 140,
            role: "\u98CE\u63A7\u4E3B\u7BA1",
            buttonName: "\u6267\u884C\u5904\u7F6E",
            checkItems: ["\u5904\u7F6E\u65B9\u6848\u786E\u8BA4\u4E0E\u6267\u884C"],
            results: ["\u901A\u8FC7"],
            opinionPresets: { \u901A\u8FC7: ["\u5904\u7F6E\u6267\u884C\u5B8C\u6210"] },
            resultStates: { \u901A\u8FC7: "\u6548\u679C\u8DDF\u8E2A\u4E2D" },
            timeLimit: 72
          },
          {
            id: "n_3",
            type: "normal",
            label: "\u6548\u679C\u8DDF\u8E2A\u4E2D",
            x: 760,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u8DDF\u8E2A\u8BC4\u4F30",
            checkItems: ["\u5904\u7F6E\u6548\u679C\u590D\u6838"],
            results: ["\u901A\u8FC7"],
            opinionPresets: { \u901A\u8FC7: ["\u5904\u7F6E\u6548\u679C\u8FBE\u6807\uFF0C\u7ED3\u6848"] },
            resultStates: { \u901A\u8FC7: "\u5DF2\u7ED3\u6848" },
            timeLimit: 168
          },
          {
            id: "n_4",
            type: "end",
            label: "\u5DF2\u7ED3\u6848",
            x: 1e3,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [],
            opinionPresets: {}
          }
        ],
        edges: [
          { id: "e1", from: "n_0", to: "n_1", result: "\u786E\u8BA4" },
          { id: "e2", from: "n_1", to: "n_2", result: "\u901A\u8FC7" },
          { id: "e3", from: "n_2", to: "n_3", result: "\u901A\u8FC7" },
          { id: "e4", from: "n_3", to: "n_4", result: "\u901A\u8FC7" }
        ]
      },
      {
        name: "\u9EC4\u706F\xB7\u4E2D\u98CE\u9669\u7814\u5224\u6D41\u7A0B",
        match: [
          {
            field: "level",
            value: "YELLOW"
          }
        ],
        flowSteps: [
          { state: "\u9884\u8B66\u786E\u8BA4\u4E2D", action: "\u786E\u8BA4", next: "\u98CE\u9669\u7814\u5224\u4E2D", color: "#D97706" },
          { state: "\u98CE\u9669\u7814\u5224\u4E2D", action: "\u7814\u5224", next: "\u5DF2\u7ED3\u6848", color: "#059669" },
          { state: "\u5DF2\u7ED3\u6848", action: "", next: "", color: "#059669" }
        ],
        nodes: [
          {
            id: "n_0",
            type: "start",
            label: "\u9884\u8B66\u786E\u8BA4\u4E2D",
            x: 40,
            y: 140,
            showButton: false,
            checkItems: [],
            results: ["\u786E\u8BA4"],
            resultStates: { \u786E\u8BA4: "\u98CE\u9669\u7814\u5224\u4E2D" },
            timeLimit: 48
          },
          {
            id: "n_1",
            type: "normal",
            label: "\u98CE\u9669\u7814\u5224\u4E2D",
            x: 280,
            y: 140,
            role: "\u98CE\u63A7\u4E13\u5458",
            buttonName: "\u7814\u5224",
            checkItems: ["\u9884\u8B66\u7814\u5224"],
            results: ["\u901A\u8FC7"],
            opinionPresets: { \u901A\u8FC7: ["\u7814\u5224\u5B8C\u6210\uFF0C\u7ED3\u6848"] },
            resultStates: { \u901A\u8FC7: "\u5DF2\u7ED3\u6848" },
            timeLimit: 72
          },
          {
            id: "n_2",
            type: "end",
            label: "\u5DF2\u7ED3\u6848",
            x: 520,
            y: 140,
            showButton: false,
            checkItems: [],
            results: [],
            opinionPresets: {}
          }
        ],
        edges: [
          { id: "e1", from: "n_0", to: "n_1", result: "\u786E\u8BA4" },
          { id: "e2", from: "n_1", to: "n_2", result: "\u901A\u8FC7" }
        ]
      }
    ]
  }
];

// src/console/flowStore.ts
var SEED_FLOWS = Array.isArray(bizFlows_default) ? bizFlows_default : bizFlows_default.flows ?? [];
var DEFAULT_FLOW_STEPS = [
  { state: "\u5F85\u521D\u5BA1", action: "\u521D\u5BA1", next: "\u5F85\u590D\u5BA1" },
  { state: "\u5F85\u590D\u5BA1", action: "\u590D\u5BA1", next: "\u5DF2\u4E0A\u7EBF" },
  { state: "\u5DF2\u4E0A\u7EBF", action: "\u4E0B\u7EBF", next: "\u5DF2\u4E0B\u7EBF" },
  { state: "\u5DF2\u4E0B\u7EBF", action: "", next: "" }
];
function stepColorOf(st) {
  if (st.includes("\u5F85")) return "#D97706";
  if (st.includes("\u4E2D")) return "#2563EB";
  if (st.includes("\u5DF2")) return "#059669";
  return "#94A3B8";
}
function flowStepOf(f) {
  const steps = f.flowSteps?.length ? f.flowSteps : DEFAULT_FLOW_STEPS;
  const state = f.flowState ?? steps[0]?.state ?? "";
  const step = steps.find((s) => s.state === state);
  return { steps, state, step };
}
function matchFlowGraph(item, obj) {
  if (!item) return { graph: void 0, steps: [], name: "" };
  const graphs = item.flowGraphs ?? [];
  const condHit = (g) => (g.match ?? []).length > 0 && g.match.every((c) => {
    const v = String(obj[c.field] ?? "");
    return String(c.value ?? "").split(/[,，、\s]+/).filter(Boolean).includes(v);
  });
  const hit = graphs.find(condHit);
  const fallback = hit ?? graphs.find((g) => !g.match?.length);
  if (!fallback) return { graph: void 0, steps: [], name: "" };
  const rawSteps = fallback.flowSteps?.length ? fallback.flowSteps : item.flowSteps?.length ? item.flowSteps : DEFAULT_FLOW_STEPS;
  const nodes = fallback.nodes ?? [];
  const steps = rawSteps.map((s) => {
    const node = nodes.find((n) => (n.label ?? "") === s.state);
    return node?.buttonName ? { ...s, action: node.buttonName } : s;
  });
  return { graph: fallback, steps, name: fallback.name ?? item.name };
}
function nodeTimeLimitOf(graph, flowState) {
  if (!graph || !flowState) return void 0;
  const n = (graph.nodes ?? []).find((x) => (x.label ?? "") === flowState || (x.buttonName ?? "") === flowState);
  return n?.timeLimit;
}
var flows = [...SEED_FLOWS];
var version2 = 0;
void (async () => {
  try {
    const saved = await fetch("/api/load-bizflows").then((r) => r.ok ? r.json() : null).catch(() => null);
    if (saved) {
      const list = Array.isArray(saved) ? saved : saved.flows;
      if (Array.isArray(list) && list.length) flows = list;
    }
  } catch {
  }
})();
var listeners3 = /* @__PURE__ */ new Set();
function subscribe3(fn) {
  listeners3.add(fn);
  return () => {
    listeners3.delete(fn);
  };
}
function getSnapshot() {
  return version2;
}
function useFlowsVersion() {
  return useSyncExternalStore3(subscribe3, getSnapshot);
}
function useFlows() {
  useFlowsVersion();
  return flows;
}

// src/console/FlowConfirmModal.tsx
import { useState as useState5 } from "react";
import { Fragment as Fragment6, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function FlowConfirmModal({
  open,
  flowName,
  action,
  from,
  to,
  onClose,
  onConfirm
}) {
  const [opinion, setOpinion] = useState5("");
  const [lastOpen, setLastOpen] = useState5(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setOpinion("");
  }
  return /* @__PURE__ */ jsx6(
    Modal,
    {
      title: `${flowName} \xB7 ${action}`,
      open,
      onClose,
      zIndex: 200,
      footer: /* @__PURE__ */ jsxs6(Fragment6, { children: [
        /* @__PURE__ */ jsx6(Button, { variant: "ghost", onClick: onClose, children: "\u53D6\u6D88" }),
        /* @__PURE__ */ jsx6(Button, { variant: "primary", onClick: () => onConfirm(opinion.trim()), children: "\u786E\u8BA4\u6D41\u8F6C" })
      ] }),
      children: /* @__PURE__ */ jsxs6("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs6("div", { className: "text-xs text-slate-400", children: [
          "\u4E1A\u52A1\u6D41\u7A0B\uFF1A",
          /* @__PURE__ */ jsx6("span", { className: "font-medium text-slate-600", children: flowName })
        ] }),
        /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsx6("span", { className: "rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700", children: from }),
          /* @__PURE__ */ jsxs6("span", { className: "text-slate-400", children: [
            "\u2500[",
            action,
            "]\u2192"
          ] }),
          /* @__PURE__ */ jsx6("span", { className: "rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700", children: to })
        ] }),
        /* @__PURE__ */ jsxs6("div", { children: [
          /* @__PURE__ */ jsx6("div", { className: "mb-1 text-xs text-slate-400", children: "\u5BA1\u6279\u610F\u89C1\uFF08\u53EF\u9009\uFF09" }),
          /* @__PURE__ */ jsx6(
            "textarea",
            {
              value: opinion,
              onChange: (e) => setOpinion(e.target.value),
              placeholder: "\u586B\u5199\u672C\u6B21\u6D41\u8F6C\u7684\u5BA1\u6279\u610F\u89C1\u2026",
              className: "h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
            }
          )
        ] })
      ] })
    }
  );
}

// src/console/FlowActionBar.tsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function FlowActionBar({ flowId, state, onStateChange, onSave, saveLabel = "\u4FDD\u5B58", matchObj }) {
  const flows2 = useFlows();
  const f = flowId ? flows2.find((x) => x.id === flowId) : void 0;
  const { graph, steps, name } = matchFlowGraph(f, matchObj ?? {});
  const [confirm, setConfirm] = useState6(null);
  const hasFlow = !!(f && steps.length);
  if (!hasFlow && !onSave) return null;
  return /* @__PURE__ */ jsxs7("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 10, padding: "8px 12px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10 }, children: [
    onSave && /* @__PURE__ */ jsx7(
      "button",
      {
        type: "button",
        onClick: onSave,
        style: { height: 28, padding: "0 16px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", background: "#2563EB", color: "#fff" },
        children: saveLabel
      }
    ),
    f && steps.length > 0 && (() => {
      const { state: st, step } = flowStepOf({ flowSteps: steps, flowState: state });
      const sc = step?.color ?? stepColorOf(st);
      const tl = nodeTimeLimitOf(graph, state);
      return /* @__PURE__ */ jsxs7("span", { style: { display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, padding: "3px 8px" }, children: [
        /* @__PURE__ */ jsx7("span", { style: { fontSize: 12, color: "#64748B" }, children: name || f.name }),
        /* @__PURE__ */ jsxs7("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: sc, background: `${sc}1A`, borderRadius: 10, padding: "1px 9px" }, children: [
          /* @__PURE__ */ jsx7("span", { style: { width: 6, height: 6, borderRadius: "50%", background: sc, display: "inline-block" } }),
          st
        ] }),
        step?.next && onStateChange && /* @__PURE__ */ jsx7(
          "button",
          {
            type: "button",
            onClick: () => setConfirm({ f, step }),
            style: { height: 22, padding: "0 12px", fontSize: 12, borderRadius: 6, border: "none", cursor: "pointer", background: "#2563EB", color: "#fff", fontWeight: 500 },
            children: step.action
          }
        ),
        tl != null && /* @__PURE__ */ jsxs7("span", { style: { fontSize: 12, fontWeight: 600, color: "#B45309", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, padding: "1px 9px", whiteSpace: "nowrap" }, children: [
          "\u8282\u70B9\u65F6\u9650 ",
          tl,
          " \u5206\u949F"
        ] })
      ] });
    })(),
    /* @__PURE__ */ jsx7(
      FlowConfirmModal,
      {
        open: confirm != null,
        flowName: confirm ? name || f?.name || "" : "",
        action: confirm?.step.action ?? "",
        from: confirm ? flowStepOf({ flowSteps: steps, flowState: state }).state : "",
        to: confirm?.step.next ?? "",
        onClose: () => setConfirm(null),
        onConfirm: () => {
          if (confirm) onStateChange?.(confirm.step.next);
          setConfirm(null);
        }
      }
    )
  ] });
}

// src/console/data.ts
function maskName(name) {
  return name.length <= 1 ? name : name[0] + "*".repeat(name.length - 1);
}
function maskId(id) {
  return id.slice(0, 4) + "**********" + id.slice(-4);
}
function maskPhone(p) {
  return p.slice(0, 3) + "****" + p.slice(-4);
}
var names = ["\u5F20\u4F1F", "\u738B\u82B3", "\u674E\u5A1C", "\u5218\u5F3A", "\u9648\u9759", "\u6768\u6D0B", "\u8D75\u78CA", "\u9EC4\u654F", "\u5468\u6770", "\u5434\u5A77", "\u5F90\u52C7", "\u5B59\u4E3D", "\u9A6C\u8D85", "\u6731\u7433", "\u80E1\u519B", "\u90ED\u6D9B", "\u6797\u5CF0", "\u4F55\u9759", "\u9AD8\u7FD4", "\u7F57\u521A"];
var products = ["\u6D88\u8D39\u5206\u671F", "\u73B0\u91D1\u8D37", "\u4FE1\u7528\u5361", "\u6C7D\u8F66\u91D1\u878D", "\u7ECF\u8425\u8D37", "\u52A9\u5B66\u8D37"];
var channels = ["\u81EA\u6709APP", "\u5408\u4F5C\u6E20\u9053A", "\u7EBF\u4E0B\u95E8\u5E97", "\u5FAE\u4FE1\u5C0F\u7A0B\u5E8F", "\u7B2C\u4E09\u65B9\u5BFC\u6D41"];
var decisions = [
  { v: "\u81EA\u52A8\u901A\u8FC7", kind: "green" },
  { v: "\u81EA\u52A8\u62D2\u7EDD", kind: "red" },
  { v: "\u8F6C\u4EBA\u5DE5", kind: "amber" },
  { v: "\u4EBA\u5DE5\u901A\u8FC7", kind: "blue" },
  { v: "\u4EBA\u5DE5\u62D2\u7EDD", kind: "red" }
];
var times = ["2026-07-18 09:12", "2026-07-18 10:03", "2026-07-18 11:21", "2026-07-18 13:45", "2026-07-18 14:30", "2026-07-18 15:08", "2026-07-17 16:22", "2026-07-17 18:40"];
var applications = names.slice(0, 18).map((nm, i) => {
  const d = decisions[i % decisions.length];
  const fraud = 8 + i * 7 % 88;
  const credit = 420 + i * 53 % 470;
  return {
    id: "J" + (2026071800001 + i),
    name: maskName(nm),
    idNo: maskId("3201" + (199e9 + i * 137) + "1234"),
    phone: maskPhone("138" + (1e7 + i * 911111)),
    product: products[i % products.length],
    channel: channels[i % channels.length],
    amount: [5e3, 12e3, 3e4, 8e4, 15e4, 5e3][i % 6],
    applyTime: times[i % times.length],
    fraudScore: fraud,
    creditScore: credit,
    decision: { v: d.v, kind: d.kind },
    operator: i % 4 === 0 ? "\u7CFB\u7EDF\u81EA\u52A8" : "\u5BA1\u6838\u5458" + (i % 6 + 1)
  };
});
var alertLevels = [
  { v: "\u7EA2\u706F", kind: "red" },
  { v: "\u9EC4\u706F", kind: "amber" }
];
var triggers = ["\u591A\u5934\u501F\u8D37\u6FC0\u589E", "\u8BBE\u5907\u73AF\u5883\u5F02\u5E38", "\u5171\u503A\u6500\u5347", "\u4FE1\u7528\u8BC4\u5206\u6076\u5316", "\u6D3B\u8DC3\u5EA6\u9AA4\u964D", "\u540C\u8BBE\u5907\u591A\u8D26\u53F7", "\u5F02\u5730\u9AD8\u9891\u7533\u8BF7"];
var suggestions = [
  { v: "\u5EFA\u8BAE\u964D\u989D", kind: "red" },
  { v: "\u5EFA\u8BAE\u9884\u50AC", kind: "orange" },
  { v: "\u6301\u7EED\u5173\u6CE8", kind: "amber" },
  { v: "\u5EFA\u8BAE\u633D\u7559", kind: "blue" }
];
var alerts2 = names.slice(2, 17).map((nm, i) => {
  const lv = alertLevels[i % 2];
  const sg = suggestions[i % suggestions.length];
  return {
    id: "A" + (2026071800001 + i),
    name: maskName(nm),
    level: { v: lv.v, kind: lv.kind },
    trigger: triggers[i % triggers.length],
    product: products[i % products.length],
    suggestion: { v: sg.v, kind: sg.kind },
    monitorTime: times[(i + 1) % times.length]
  };
});
var scenes = ["\u8D37\u4E2D\u98CE\u63A7", "\u5B58\u91CF\u5BA2\u7FA4\u8FD0\u8425", "\u8D37\u524D\u51C6\u5165", "\u9884\u6388\u4FE1"];
var freqs = ["\u65E5\u9891", "\u5468\u9891", "\u5B9E\u65F6", "T+1"];
var monitorTasks = scenes.map((s, i) => ({
  id: "T" + (1001 + i),
  name: s + "\u76D1\u6D4B\u4EFB\u52A1" + (i + 1),
  scene: s,
  product: products[i % products.length],
  freq: freqs[i % freqs.length],
  indicators: 6 + i % 9,
  status: i % 3 === 0 ? { v: "\u5DF2\u6682\u505C", kind: "gray" } : { v: "\u8FD0\u884C\u4E2D", kind: "green" },
  lastRun: times[i % times.length],
  coverage: 12 + i * 7 + "\u4E07"
}));
var ruleTypes = ["\u89C4\u5219\u8868", "\u51B3\u7B56\u6811", "\u51B3\u7B56\u77E9\u9635"];
var rules = [
  "\u8FD130\u5929\u7533\u8D37\u5E73\u53F0\u6570\u22655",
  "\u540C\u8BBE\u5907\u5173\u8054\u8D26\u53F7\u22653",
  "\u8EAB\u4EFD\u8BC1\u4E09\u8981\u7D20\u4E0D\u4E00\u81F4",
  "\u547D\u4E2D\u5916\u90E8\u9ED1\u7070\u540D\u5355",
  "\u8D1F\u503A\u6536\u5165\u6BD4>70%",
  "\u6D3B\u4F53\u68C0\u6D4B\u5931\u8D25",
  "\u5F02\u5730\u767B\u5F55\u4E14\u9AD8\u9891\u7533\u8BF7",
  "\u5171\u503A\u673A\u6784\u6570\u22654"
].map((nm, i) => ({
  id: "R" + (2001 + i),
  name: nm,
  type: ruleTypes[i % ruleTypes.length],
  hit: 120 + i * 37,
  passRate: 38 + i * 5 % 50,
  status: i % 5 === 0 ? { v: "\u505C\u7528", kind: "gray" } : { v: "\u542F\u7528", kind: "green" },
  updated: times[i % times.length]
}));
var models = [
  { id: "M-\u667A\u5BDF\u5206", name: "\u667A\u5BDF\u5206 V3.2", type: "\u6B3A\u8BC8\u8BC4\u5206", status: { v: "\u4E0A\u7EBF", kind: "green" }, auc: 0.92, ks: 0.45, lastTrain: "2026-06-20" },
  { id: "M-\u667A\u4FE1\u5206", name: "\u667A\u4FE1\u5206 V4.0", type: "\u8FDD\u7EA6\u8BC4\u5206", status: { v: "\u4E0A\u7EBF", kind: "green" }, auc: 0.88, ks: 0.41, lastTrain: "2026-05-18" },
  { id: "M-\u667A\u878D\u5206", name: "\u667A\u878D\u5206 V2.1", type: "\u7EFC\u5408\u8BC4\u5206", status: { v: "\u4E0A\u7EBF", kind: "green" }, auc: 0.85, ks: 0.38, lastTrain: "2026-04-30" },
  { id: "M-\u8BBE\u5907\u5206", name: "\u8BBE\u5907\u98CE\u9669\u5206 V1.4", type: "\u8BBE\u5907\u6307\u7EB9", status: { v: "\u9A8C\u8BC1", kind: "amber" }, auc: 0.79, ks: 0.33, lastTrain: "2026-07-02" },
  { id: "M-\u5171\u503A", name: "\u5171\u503A\u9884\u8B66\u6A21\u578B V1.0", type: "\u5173\u7CFB\u7F51\u7EDC", status: { v: "\u8BAD\u7EC3", kind: "blue" }, auc: 0.81, ks: 0.36, lastTrain: "2026-07-10" }
];

// src/console/scoreData.ts
import { useSyncExternalStore as useSyncExternalStore4 } from "react";
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
var ZHIXIN_BASE = 600;
function computeZhixin(raw) {
  let total = 0;
  const steps = [];
  for (const f of ZHIXIN_SCORECARD) {
    const v = Number(raw[f.key]);
    const hit = f.bins.find(
      (b) => (b.min === void 0 || v >= b.min) && (b.max === void 0 || v <= b.max) && (b.gt === void 0 || v > b.gt) && (b.lt === void 0 || v < b.lt)
    );
    if (hit) {
      total += hit.points;
      steps.push({ factor: f.name, input: v, bin: hit.label, points: hit.points });
    } else {
      steps.push({ factor: f.name, input: v, bin: "\u672A\u8986\u76D6\u533A\u95F4", points: 0 });
    }
  }
  return { score: Math.max(300, Math.min(900, ZHIXIN_BASE + total)), total, steps };
}
function resolveRisk(prod, score) {
  for (const t of SEED_SCORE.thresholds) {
    if (t.prod !== prod) continue;
    const m = t.range.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
    if (!m) continue;
    const min = Number(m[1]);
    const max = Number(m[2]);
    if (score >= min && score <= max) return { level: t.level, meaning: t.meaning, action: t.action, range: t.range };
  }
  return null;
}
function thresholdRows(prod) {
  return SEED_SCORE.thresholds.filter((t) => t.prod === prod).map((t) => {
    const m = t.range.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
    return { min: Number(m?.[1]), max: Number(m?.[2]), level: t.level, range: t.range, action: t.action };
  }).sort((a, b) => a.min - b.min);
}
function nextUpgrade(prod, score) {
  const rows = thresholdRows(prod);
  if (!rows.length) return null;
  if (prod === "zhicha") {
    const hi = rows.find((r) => r.level === "\u9AD8\u98CE\u9669");
    if (hi && score < hi.min) return { toLevel: "\u9AD8\u98CE\u9669", gap: hi.min - score };
    return null;
  }
  const better = rows.filter((r) => r.min > score).sort((a, b) => a.min - b.min)[0];
  return better ? { toLevel: better.level, gap: better.min - score } : null;
}
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
var version3 = 0;
var saveStatus2 = null;
var listeners4 = /* @__PURE__ */ new Set();
var statusListeners2 = /* @__PURE__ */ new Set();
function emit2() {
  version3++;
  listeners4.forEach((fn) => fn());
}
function emitStatus() {
  statusListeners2.forEach((fn) => fn());
}
async function loadOne2(file) {
  try {
    const r = await fetch(`/api/load-mid?file=${encodeURIComponent(file)}`);
    if (r.ok) return await r.json();
    return null;
  } catch {
    return null;
  }
}
function saveOne2(file, body) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then((r) => {
    saveStatus2 = r.ok ? "ok" : "error";
    emitStatus();
  }).catch(() => {
    saveStatus2 = "error";
    emitStatus();
  });
}
async function bootstrap2() {
  const saved = await loadOne2(FILE);
  const hasNewShape = saved && typeof saved === "object" && Array.isArray(saved.models) && saved.models.every((m) => "algoCode" in m && Array.isArray(m.versions));
  if (hasNewShape) {
    data = saved;
  } else {
    data = JSON.parse(JSON.stringify(SEED_SCORE));
    saveOne2(FILE, data);
  }
  emit2();
}
void bootstrap2();
function useSnap2(sel) {
  useSyncExternalStore4(
    (l) => {
      listeners4.add(l);
      return () => {
        listeners4.delete(l);
      };
    },
    () => version3
  );
  return sel();
}
function useScore() {
  return useSnap2(() => data);
}

// src/console/ModelDecisionGraph.tsx
import { useState as useState7, useRef as useRef5, useEffect as useEffect5, useMemo as useMemo3 } from "react";

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
import { Fragment as Fragment7, jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
var NODE_CATEGORY = [
  { label: "\u8F93\u5165\u5C42", types: ["source", "transform"] },
  { label: "\u8BA1\u7B97\u5C42", types: ["model", "graph", "ruleset"] },
  { label: "\u51B3\u7B56\u5C42", types: ["collision", "decision", "block"] },
  { label: "\u8F93\u51FA\u5C42", types: ["output", "alert"] }
];
function ScoreCardView({ bins }) {
  return /* @__PURE__ */ jsxs8("div", { className: "text-[11px] leading-tight", children: [
    /* @__PURE__ */ jsx8("div", { className: "mb-1 font-semibold text-slate-700", children: "\u57FA\u7840\u5206 600 + \u5404\u56E0\u5B50\u67E5\u8868\u52A0\u5206" }),
    bins.map((f) => /* @__PURE__ */ jsxs8("div", { className: "mb-1", children: [
      /* @__PURE__ */ jsx8("div", { className: "text-slate-600", children: f.name }),
      /* @__PURE__ */ jsx8("div", { className: "text-slate-400", children: f.bins.map((b) => /* @__PURE__ */ jsxs8("span", { className: "mr-2 inline-block", children: [
        b.label,
        " ",
        /* @__PURE__ */ jsxs8("span", { className: b.points >= 0 ? "text-emerald-600" : "text-rose-600", children: [
          b.points >= 0 ? "+" : "",
          b.points
        ] })
      ] }, b.label)) })
    ] }, f.key)),
    /* @__PURE__ */ jsx8("div", { className: "mt-1 border-t border-slate-100 pt-1 text-slate-500", children: "\u5408\u8BA1 = 600 + \u03A3\u52A0\u5206\uFF0C\u88C1\u526A [300,900]" })
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
  const [localGraph, setLocalGraph] = useState7(null);
  const graph = localGraph ?? graphBase;
  const isPipeline = !!graphProp;
  const isEditable = editable ?? !!onSaveCollisions;
  const containerRef = useRef5(null);
  const [scale, setScale] = useState7(1);
  const [tx, setTx] = useState7(0);
  const [ty, setTy] = useState7(0);
  const [hi, setHi] = useState7("all");
  const [focus, setFocus] = useState7(null);
  const [selected, setSelected] = useState7(null);
  const [editingCollision, setEditingCollision] = useState7(false);
  const [localRules, setLocalRules] = useState7([]);
  const [isFs, setIsFs] = useState7(false);
  const [openNodes, setOpenNodes] = useState7(/* @__PURE__ */ new Set());
  const [pos, setPos] = useState7({});
  const dragRef = useRef5(null);
  const [dragging, setDragging] = useState7(false);
  const [editMode, setEditMode] = useState7(false);
  const [linkMode, setLinkMode] = useState7(false);
  const [linkFrom, setLinkFrom] = useState7(null);
  const [nodeFilter, setNodeFilter] = useState7("");
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
  const TBtn = ({ onClick, title, children }) => /* @__PURE__ */ jsx8("button", { onClick, title, className: "h-7 min-w-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 hover:border-brand-400 hover:bg-slate-50", children });
  return /* @__PURE__ */ jsxs8("div", { children: [
    /* @__PURE__ */ jsxs8(
      "div",
      {
        ref: containerRef,
        className: "relative flex overflow-hidden rounded-xl border border-slate-200 bg-[#FAFBFC]",
        style: isFs ? { height: "100vh" } : { maxHeight: 600 },
        children: [
          isEditable && editMode && /* @__PURE__ */ jsxs8("aside", { className: "z-30 flex w-[188px] shrink-0 flex-col border-r border-slate-200 bg-white", children: [
            /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between border-b border-slate-100 px-3 py-2", children: [
              /* @__PURE__ */ jsx8("span", { className: "text-xs font-semibold text-slate-600", children: "\u6DFB\u52A0\u8282\u70B9" }),
              /* @__PURE__ */ jsxs8("span", { className: "rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400", children: [
                graph.nodes.length,
                " \u4E2A"
              ] })
            ] }),
            /* @__PURE__ */ jsx8("div", { className: "px-3 pb-2 pt-2", children: /* @__PURE__ */ jsx8(
              "input",
              {
                value: nodeFilter,
                onChange: (e) => setNodeFilter(e.target.value),
                placeholder: "\u7B5B\u9009\u8282\u70B9\u7C7B\u578B",
                className: "w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand-400"
              }
            ) }),
            /* @__PURE__ */ jsx8("div", { className: "flex-1 space-y-3 overflow-y-auto px-3 pb-3", children: NODE_CATEGORY.map((cat) => {
              const items = cat.types.filter((t) => GNODE_META[t].label.includes(nodeFilter) || nodeFilter === "");
              if (!items.length) return null;
              return /* @__PURE__ */ jsxs8("div", { children: [
                /* @__PURE__ */ jsx8("div", { className: "mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400", children: cat.label }),
                /* @__PURE__ */ jsx8("div", { className: "space-y-1", children: items.map((t) => /* @__PURE__ */ jsxs8(
                  "button",
                  {
                    onClick: () => addNode(t),
                    className: "flex w-full items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:border-brand-400 hover:bg-slate-50",
                    children: [
                      /* @__PURE__ */ jsx8("span", { className: "h-3 w-3 shrink-0 rounded-sm", style: { background: GNODE_META[t].color } }),
                      /* @__PURE__ */ jsx8("span", { className: "truncate", children: GNODE_META[t].label })
                    ]
                  },
                  t
                )) })
              ] }, cat.label);
            }) }),
            /* @__PURE__ */ jsx8("div", { className: "border-t border-slate-100 p-2", children: /* @__PURE__ */ jsx8(
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
          /* @__PURE__ */ jsxs8("div", { className: "flex min-w-0 flex-1 flex-col", children: [
            /* @__PURE__ */ jsxs8("div", { className: "sticky top-0 z-20 flex shrink-0 flex-wrap items-center gap-1 border-b border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur", children: [
              /* @__PURE__ */ jsx8("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u7F29\u653E" }),
              /* @__PURE__ */ jsx8(TBtn, { onClick: () => zoom(-0.1), title: "\u7F29\u5C0F", children: "\u2212" }),
              /* @__PURE__ */ jsxs8("span", { className: "w-12 text-center text-xs tabular-nums text-slate-500", children: [
                Math.round(scale * 100),
                "%"
              ] }),
              /* @__PURE__ */ jsx8(TBtn, { onClick: () => zoom(0.1), title: "\u653E\u5927", children: "\uFF0B" }),
              /* @__PURE__ */ jsx8(TBtn, { onClick: fit, title: "\u9002\u5E94\u5C4F\u5E55", children: "\u9002\u5E94" }),
              /* @__PURE__ */ jsx8(TBtn, { onClick: () => setScale(1), title: "\u539F\u59CB\u5927\u5C0F 100%", children: "1:1" }),
              /* @__PURE__ */ jsx8("span", { className: "mx-1 h-5 w-px bg-slate-200" }),
              /* @__PURE__ */ jsx8("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u89C6\u56FE" }),
              /* @__PURE__ */ jsx8(TBtn, { onClick: resetView, title: "\u590D\u4F4D\uFF08\u7F29\u653E+\u5E73\u79FB\u5F52\u96F6\uFF09", children: "\u590D\u4F4D" }),
              /* @__PURE__ */ jsx8(TBtn, { onClick: toggleFs, title: isFs ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F", children: isFs ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F" }),
              /* @__PURE__ */ jsx8("span", { className: "mx-1 h-5 w-px bg-slate-200" }),
              /* @__PURE__ */ jsx8("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u9AD8\u4EAE" }),
              /* @__PURE__ */ jsx8(TBtn, { onClick: () => {
                setHi("main");
                setFocus(null);
              }, title: "\u4EC5\u9AD8\u4EAE\u4E3B\u7EBF\uFF08\u4E32\u884C\u94FE\u8DEF\uFF09", children: "\u4E3B\u7EBF" }),
              /* @__PURE__ */ jsx8(TBtn, { onClick: () => {
                setHi("branch");
                setFocus(null);
              }, title: "\u4EC5\u9AD8\u4EAE\u652F\u7EBF\uFF08\u5E76\u884C\u9884\u8B66\uFF09", children: "\u652F\u7EBF" }),
              /* @__PURE__ */ jsx8(TBtn, { onClick: () => {
                setHi("all");
                setFocus(null);
              }, title: "\u5168\u90E8\u663E\u793A\uFF08\u53D6\u6D88\u9AD8\u4EAE\uFF09", children: "\u5168\u90E8" }),
              isEditable && /* @__PURE__ */ jsxs8(Fragment7, { children: [
                /* @__PURE__ */ jsx8("span", { className: "mx-1 h-5 w-px bg-slate-200" }),
                /* @__PURE__ */ jsx8("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u7F16\u8F91" }),
                /* @__PURE__ */ jsx8(TBtn, { onClick: () => {
                  setEditMode((v) => !v);
                  setLinkMode(false);
                  setLinkFrom(null);
                }, title: editMode ? "\u9000\u51FA\u753B\u5E03\u7F16\u8F91" : "\u8FDB\u5165\u753B\u5E03\u7F16\u8F91\uFF08\u6DFB\u52A0\u8282\u70B9 / \u8FDE\u7EBF / \u5220\u9664\uFF09", children: editMode ? "\u5B8C\u6210\u7F16\u8F91" : "\u7F16\u8F91\u753B\u5E03" }),
                editMode && dirty && /* @__PURE__ */ jsx8("button", { onClick: saveGraph, title: "\u4FDD\u5B58\u5F53\u524D\u753B\u5E03\uFF08\u8282\u70B9 / \u8FDE\u7EBF / \u4F4D\u7F6E\uFF09\u5230\u6A21\u578B\u914D\u7F6E", className: "h-7 rounded-md bg-brand-600 px-3 text-xs font-medium text-white hover:bg-brand-700", children: "\u4FDD\u5B58\u753B\u5E03" })
              ] }),
              /* @__PURE__ */ jsx8("span", { className: "ml-2 text-[11px] text-slate-300", children: editMode && linkMode ? linkFrom ? "\u8FDE\u7EBF\u4E2D \xB7 \u70B9\u51FB\u7EC8\u70B9\u8282\u70B9\u5B8C\u6210\u8FDE\u7EBF" : "\u8FDE\u7EBF\u6A21\u5F0F \xB7 \u70B9\u51FB\u8D77\u70B9\u8282\u70B9" : "\u62D6\u62FD\u8282\u70B9\u53EF\u8C03\u6574\u4F4D\u7F6E \xB7 \u70B9\u51FB\u8282\u70B9\u67E5\u770B\u8BE6\u60C5\u5E76\u9AD8\u4EAE\u5176\u6574\u6761\u94FE\u8DEF" })
            ] }),
            /* @__PURE__ */ jsx8("div", { className: "relative flex-1 overflow-auto", children: /* @__PURE__ */ jsxs8(
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
                  /* @__PURE__ */ jsxs8("svg", { width: graph.width, height: graph.height, className: "pointer-events-none absolute left-0 top-0", children: [
                    /* @__PURE__ */ jsx8("defs", { children: /* @__PURE__ */ jsx8("marker", { id: "arrow", markerWidth: "10", markerHeight: "10", refX: "8", refY: "3", orient: "auto", markerUnits: "strokeWidth", children: /* @__PURE__ */ jsx8("path", { d: "M0,0 L8,3 L0,6 Z", fill: "#94A3B8" }) }) }),
                    graph.edges.map((e, i) => {
                      const a = anchorR(nodeMap.get(e.from));
                      const b = anchorL(nodeMap.get(e.to));
                      const midX = (a.x + b.x) / 2;
                      const d = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
                      const col = e.color ?? (isAlertEdge(e) ? "#0891B2" : "#CBD5E1");
                      const dim = edgeDim(e);
                      return /* @__PURE__ */ jsxs8("g", { style: { opacity: dim ? 0.18 : 1, transition: "opacity .15s" }, children: [
                        /* @__PURE__ */ jsx8("path", { d, fill: "none", stroke: col, strokeWidth: isAlertEdge(e) ? 2 : 1.5, strokeDasharray: e.dashed ? "5 4" : void 0, markerEnd: "url(#arrow)" }),
                        e.label && /* @__PURE__ */ jsx8("text", { x: midX, y: (a.y + b.y) / 2 - 6, textAnchor: "middle", fontSize: 11, fill: col, children: e.label }),
                        editMode && /* @__PURE__ */ jsx8(
                          "path",
                          {
                            d,
                            fill: "none",
                            stroke: "transparent",
                            strokeWidth: 14,
                            style: { pointerEvents: "stroke", cursor: "pointer" },
                            onClick: () => removeEdge(i),
                            children: /* @__PURE__ */ jsx8("title", { children: "\u70B9\u51FB\u5220\u9664\u8BE5\u8FDE\u7EBF" })
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
                    return /* @__PURE__ */ jsxs8(
                      "div",
                      {
                        className: `absolute flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-opacity ${dim ? "opacity-20" : "opacity-100"} ${isCollision ? "cursor-grab hover:border-rose-400 hover:ring-2 hover:ring-rose-200 active:cursor-grabbing" : "cursor-grab hover:border-slate-400 hover:ring-2 hover:ring-slate-200 active:cursor-grabbing"}`,
                        style: { left: cp.x, top: cp.y, width: NODE_W, height: NODE_H, ...isAlertNode ? { borderStyle: "dashed", borderColor: "#0891B2" } : {} },
                        onMouseDown: (e) => startDrag(e, n),
                        children: [
                          /* @__PURE__ */ jsxs8("div", { className: "flex shrink-0 items-center justify-between rounded-t-xl px-3 py-1.5", style: { background: headerBg }, children: [
                            /* @__PURE__ */ jsx8("span", { className: "text-xs font-semibold text-white", children: n.title }),
                            /* @__PURE__ */ jsxs8("span", { className: "flex items-center gap-1.5", children: [
                              isCollision && onSaveCollisions && /* @__PURE__ */ jsx8("span", { className: "rounded bg-white/25 px-1 py-0.5 text-[10px] font-medium text-white", children: "\u53EF\u7F16\u8F91" }),
                              n.badge && /* @__PURE__ */ jsx8("span", { className: "rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-medium text-white", children: n.badge })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs8("div", { className: "min-h-0 flex-1 overflow-y-auto px-3 py-1.5", children: [
                            nodeResults?.[n.id] && /* @__PURE__ */ jsx8("div", { className: "mb-1.5 rounded-md border px-1.5 py-1 text-[11px] font-semibold leading-snug " + hintTone(nodeResults?.[n.id]), children: nodeResults[n.id] }),
                            cardBins ? /* @__PURE__ */ jsx8(ScoreCardView, { bins: cardBins }) : /* @__PURE__ */ jsxs8(Fragment7, { children: [
                              n.subtitle && /* @__PURE__ */ jsx8("div", { className: "mb-1 text-[11px] text-slate-400", children: n.subtitle }),
                              /* @__PURE__ */ jsx8("div", { className: "space-y-0.5 opacity-60", children: metaOf(n).map((m, i) => /* @__PURE__ */ jsx8("div", { className: `whitespace-normal break-words text-[10.5px] leading-tight text-slate-500 ${!openNodes.has(n.id) && i > 0 ? "hidden" : ""}`, children: m }, i)) }),
                              metaOf(n).length > 1 && /* @__PURE__ */ jsx8("button", { onClick: () => toggleNode(n.id), className: "mt-0.5 text-[10px] text-blue-500 hover:underline", children: openNodes.has(n.id) ? "\u6536\u8D77\u8BF4\u660E" : "\u5C55\u5F00\u8BF4\u660E" })
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
          selected && /* @__PURE__ */ jsxs8("div", { className: "absolute right-0 top-10 bottom-0 z-30 flex w-[360px] max-w-[80%] flex-col border-l border-slate-200 bg-white shadow-2xl", children: [
            /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between border-b border-slate-100 px-4 py-3", children: [
              /* @__PURE__ */ jsxs8("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx8("span", { className: "h-3 w-3 rounded-sm", style: { background: GNODE_META[selected.type].color } }),
                /* @__PURE__ */ jsx8("span", { className: "text-sm font-semibold text-slate-800", children: selected.title })
              ] }),
              /* @__PURE__ */ jsx8("button", { onClick: () => {
                setSelected(null);
                setFocus(null);
              }, className: "rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100", children: "\u5173\u95ED" })
            ] }),
            /* @__PURE__ */ jsxs8("div", { className: "flex-1 space-y-3 overflow-y-auto px-4 py-3", children: [
              /* @__PURE__ */ jsxs8("div", { className: "flex flex-wrap items-center gap-2 text-xs", children: [
                /* @__PURE__ */ jsx8("span", { className: "rounded-full bg-slate-100 px-2 py-0.5 text-slate-500", children: GNODE_META[selected.type].label }),
                selected.subtitle && /* @__PURE__ */ jsx8("span", { className: "text-slate-400", children: selected.subtitle }),
                selected.badge && /* @__PURE__ */ jsx8("span", { className: "rounded-full bg-brand-50 px-2 py-0.5 text-brand-600", children: selected.badge })
              ] }),
              /* @__PURE__ */ jsxs8("div", { children: [
                /* @__PURE__ */ jsx8("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u672C\u5BA2\u6237\u503C" }),
                /* @__PURE__ */ jsx8("div", { className: "rounded-lg border px-3 py-2 text-[12.5px] font-semibold leading-relaxed " + hintTone(nodeResults?.[selected.id]), children: nodeResults?.[selected.id] ?? "\u2014\uFF08\u8BE5\u8282\u70B9\u65E0\u672C\u5BA2\u6237\u53D6\u503C\uFF09" })
              ] }),
              /* @__PURE__ */ jsxs8("div", { children: [
                /* @__PURE__ */ jsx8("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8BF4\u660E" }),
                /* @__PURE__ */ jsx8("div", { className: "rounded-lg bg-slate-50 px-3 py-2 text-[12px] leading-relaxed text-slate-600", children: (metaOf(selected).length ? metaOf(selected) : ["\uFF08\u8BE5\u8282\u70B9\u65E0\u989D\u5916\u914D\u7F6E\u8BF4\u660E\uFF09"]).map((m, i) => /* @__PURE__ */ jsx8("div", { className: "whitespace-pre-wrap", children: m }, i)) })
              ] }),
              /* @__PURE__ */ jsxs8("div", { children: [
                /* @__PURE__ */ jsx8("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8F93\u5165\uFF08\u4E0A\u6E38\u8282\u70B9\uFF09" }),
                /* @__PURE__ */ jsxs8("div", { className: "flex flex-wrap gap-1.5", children: [
                  inputsOf(selected.id).map((t, i) => /* @__PURE__ */ jsx8("span", { className: "rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600", children: t }, i)),
                  inputsOf(selected.id).length === 0 && /* @__PURE__ */ jsx8("span", { className: "text-[11px] text-slate-300", children: "\u65E0\uFF08\u8D77\u70B9\u8282\u70B9\uFF09" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs8("div", { children: [
                /* @__PURE__ */ jsx8("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8F93\u51FA\uFF08\u4E0B\u6E38\u8282\u70B9\uFF09" }),
                /* @__PURE__ */ jsxs8("div", { className: "flex flex-wrap gap-1.5", children: [
                  outputsOf(selected.id).map((t, i) => /* @__PURE__ */ jsx8("span", { className: "rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600", children: t }, i)),
                  outputsOf(selected.id).length === 0 && /* @__PURE__ */ jsx8("span", { className: "text-[11px] text-slate-300", children: "\u65E0\uFF08\u7EC8\u70B9\u8282\u70B9\uFF09" })
                ] })
              ] }),
              selected.type === "collision" && onSaveCollisions && /* @__PURE__ */ jsxs8(Fragment7, { children: [
                /* @__PURE__ */ jsx8("p", { className: "text-xs leading-relaxed text-slate-400", children: "\u5F53\u591A\u6761\u89C4\u5219\u540C\u65F6\u547D\u4E2D\u4EA7\u751F\u51B2\u7A81\u65F6\uFF0C\u6309\u6B64\u88C1\u51B3\u903B\u8F91\u53D6\u820D\u5E76\u751F\u6210\u5BF9\u5E94\u7684\u9884\u8B66\u7B49\u7EA7\u3002\u4FEE\u6539\u4EC5\u5F71\u54CD\u672C\u6A21\u578B\u7684\u914D\u7F6E\uFF0C\u4FDD\u5B58\u540E\u968F\u6A21\u578B\u6301\u4E45\u5316\u3002" }),
                /* @__PURE__ */ jsx8("button", { onClick: () => {
                  setSelected(null);
                  setFocus(null);
                  openCollision();
                }, className: "w-full rounded-lg border border-rose-200 bg-rose-50 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100", children: "\u7F16\u8F91\u51B2\u7A81\u88C1\u51B3\u89C4\u5219 \u2192" })
              ] }),
              editMode && /* @__PURE__ */ jsxs8(Fragment7, { children: [
                /* @__PURE__ */ jsxs8("div", { children: [
                  /* @__PURE__ */ jsx8("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8282\u70B9\u6807\u9898" }),
                  /* @__PURE__ */ jsx8(
                    "input",
                    {
                      value: selected.title,
                      onChange: (e) => renameNode(selected.id, e.target.value),
                      className: "w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx8(
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
          editingCollision && onSaveCollisions && /* @__PURE__ */ jsx8("div", { className: "absolute inset-0 z-40 flex justify-end bg-black/20", onClick: () => setEditingCollision(false), children: /* @__PURE__ */ jsxs8("div", { className: "flex h-full w-[440px] max-w-[90%] flex-col bg-white shadow-xl", onClick: (e) => e.stopPropagation(), children: [
            /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between border-b border-slate-100 px-4 py-3", children: [
              /* @__PURE__ */ jsxs8("div", { className: "text-sm font-semibold text-slate-800", children: [
                "\u89C4\u5219\u78B0\u649E \xB7 \u51B2\u7A81\u88C1\u51B3 ",
                /* @__PURE__ */ jsx8("span", { className: "ml-1 text-xs font-normal text-slate-400", children: SCORE_PROD_LABEL[prod] })
              ] }),
              /* @__PURE__ */ jsx8("button", { onClick: () => setEditingCollision(false), className: "rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100", children: "\u5173\u95ED" })
            ] }),
            /* @__PURE__ */ jsxs8("div", { className: "flex-1 space-y-3 overflow-y-auto px-4 py-3", children: [
              /* @__PURE__ */ jsx8("p", { className: "text-xs text-slate-400", children: "\u5B9A\u4E49\u5F53\u591A\u6761\u89C4\u5219\u540C\u65F6\u547D\u4E2D\u4EA7\u751F\u51B2\u7A81\u65F6\u5982\u4F55\u88C1\u51B3\u3001\u5E76\u751F\u6210\u4F55\u79CD\u9884\u8B66\u3002\u6B64\u5373\u6A21\u578B\u914D\u7F6E\u9636\u6BB5\u7684\u51B2\u7A81\u903B\u8F91\uFF0C\u4FDD\u5B58\u540E\u968F\u6A21\u578B\u6301\u4E45\u5316\u3002" }),
              localRules.map((r, i) => /* @__PURE__ */ jsxs8("div", { className: "rounded-xl border border-slate-200 p-3", children: [
                /* @__PURE__ */ jsxs8("div", { className: "mb-2 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs8("span", { className: "text-xs font-medium text-slate-500", children: [
                    "\u88C1\u51B3\u89C4\u5219 ",
                    i + 1
                  ] }),
                  /* @__PURE__ */ jsxs8("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxs8("label", { className: "flex items-center gap-1 text-xs text-slate-500", children: [
                      /* @__PURE__ */ jsx8("input", { type: "checkbox", checked: r.enabled, onChange: () => toggleRule(r.id), className: "accent-rose-500" }),
                      " \u542F\u7528"
                    ] }),
                    /* @__PURE__ */ jsx8("button", { onClick: () => removeRule(r.id), className: "text-xs text-rose-500 hover:underline", children: "\u5220\u9664" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx8(
                  "input",
                  {
                    className: "mb-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400",
                    placeholder: "\u51B2\u7A81\u6761\u4EF6\uFF08\u5982\uFF1A\u9ED1\u7070\u540D\u5355\u547D\u4E2D \u2229 XGB \u4E2D\u98CE\u9669\uFF09",
                    value: r.conflict,
                    onChange: (e) => updateRule(r.id, "conflict", e.target.value)
                  }
                ),
                /* @__PURE__ */ jsx8(
                  "input",
                  {
                    className: "mb-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400",
                    placeholder: "\u88C1\u51B3\u7ED3\u679C / \u751F\u6210\u7684\u9884\u8B66\uFF08\u5982\uFF1A\u5F3A\u5236\u62D2\u7EDD\uFF0C\u751F\u6210\u6B3A\u8BC8\u9884\u8B66\uFF09",
                    value: r.result,
                    onChange: (e) => updateRule(r.id, "result", e.target.value)
                  }
                ),
                /* @__PURE__ */ jsxs8(
                  "select",
                  {
                    className: "w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400",
                    value: r.priority,
                    onChange: (e) => updateRule(r.id, "priority", e.target.value),
                    children: [
                      /* @__PURE__ */ jsx8("option", { value: "\u62E6\u622A\u4F18\u5148", children: "\u4F18\u5148\u7EA7\uFF1A\u62E6\u622A\u4F18\u5148\uFF08\u89C4\u5219/\u540D\u5355\u538B\u8FC7\u5206\u6570\uFF09" }),
                      /* @__PURE__ */ jsx8("option", { value: "\u5206\u6570\u4F18\u5148", children: "\u4F18\u5148\u7EA7\uFF1A\u5206\u6570\u4F18\u5148\uFF08\u6A21\u578B\u5206\u51B3\u5B9A\uFF09" }),
                      /* @__PURE__ */ jsx8("option", { value: "\u8F6C\u4EBA\u5DE5", children: "\u4F18\u5148\u7EA7\uFF1A\u8F6C\u4EBA\u5DE5\u590D\u6838" })
                    ]
                  }
                )
              ] }, r.id)),
              localRules.length === 0 && /* @__PURE__ */ jsx8("div", { className: "rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400", children: "\u6682\u65E0\u51B2\u7A81\u88C1\u51B3\u89C4\u5219\uFF0C\u70B9\u51FB\u4E0B\u65B9\u65B0\u589E\u3002" }),
              /* @__PURE__ */ jsx8("button", { onClick: addRule, className: "w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600", children: "\uFF0B \u65B0\u589E\u51B2\u7A81\u88C1\u51B3\u89C4\u5219" })
            ] }),
            /* @__PURE__ */ jsxs8("div", { className: "flex gap-2 border-t border-slate-100 px-4 py-3", children: [
              /* @__PURE__ */ jsx8("button", { onClick: saveCollision, className: "flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700", children: "\u4FDD\u5B58" }),
              /* @__PURE__ */ jsx8("button", { onClick: () => setEditingCollision(false), className: "rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50", children: "\u53D6\u6D88" })
            ] })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs8("div", { className: "mt-2 flex flex-wrap items-center gap-3", children: [
      Object.keys(GNODE_META).map((t) => /* @__PURE__ */ jsxs8("span", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
        /* @__PURE__ */ jsx8("span", { className: "h-2.5 w-2.5 rounded-sm", style: { background: GNODE_META[t].color } }),
        GNODE_META[t].label
      ] }, t)),
      /* @__PURE__ */ jsxs8("span", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
        /* @__PURE__ */ jsx8("span", { className: "inline-block h-0 w-5 border-t-2 border-dashed border-cyan-500" }),
        "\u5E76\u884C\u9884\u8B66\uFF08\u865A\u7EBF\uFF09"
      ] })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "mt-4 overflow-hidden rounded-xl border border-slate-200", children: [
      /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2", children: [
        /* @__PURE__ */ jsx8("div", { className: "text-sm font-semibold text-slate-800", children: "\u8282\u70B9\u660E\u7EC6 \xB7 \u6BCF\u4E2A\u8282\u70B9\u7684\u8BF4\u660E / \u8F93\u5165 / \u8F93\u51FA" }),
        /* @__PURE__ */ jsx8(
          "button",
          {
            onClick: () => setOpenNodes(openNodes.size === graph.nodes.length ? /* @__PURE__ */ new Set() : new Set(graph.nodes.map((n) => n.id))),
            className: "text-xs text-blue-600 hover:underline",
            children: openNodes.size === graph.nodes.length ? "\u5168\u90E8\u5C55\u5F00\u8BF4\u660E" : "\u5168\u90E8\u6536\u8D77\u8BF4\u660E"
          }
        )
      ] }),
      /* @__PURE__ */ jsx8("div", { className: "max-h-[340px] overflow-auto", children: /* @__PURE__ */ jsxs8("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx8("thead", { className: "sticky top-0 bg-slate-50", children: /* @__PURE__ */ jsxs8("tr", { className: "text-left text-xs text-slate-400", children: [
          /* @__PURE__ */ jsx8("th", { className: "px-3 py-2 font-medium", children: "\u8282\u70B9" }),
          /* @__PURE__ */ jsx8("th", { className: "px-3 py-2 font-medium", children: "\u7C7B\u578B" }),
          /* @__PURE__ */ jsx8("th", { className: "px-3 py-2 font-medium", children: "\u7ED3\u679C\uFF08\u672C\u5BA2\u6237\u5728\u6B64\u8282\u70B9\u7684\u8F93\u51FA\uFF09" }),
          /* @__PURE__ */ jsx8("th", { className: "px-3 py-2 font-medium", children: "\u8BF4\u660E" }),
          /* @__PURE__ */ jsx8("th", { className: "px-3 py-2 font-medium", children: "\u8F93\u5165\uFF08\u4E0A\u6E38\uFF09" }),
          /* @__PURE__ */ jsx8("th", { className: "px-3 py-2 font-medium", children: "\u8F93\u51FA\uFF08\u4E0B\u6E38\uFF09" })
        ] }) }),
        /* @__PURE__ */ jsx8("tbody", { children: graph.nodes.map((n) => {
          const open = openNodes.has(n.id);
          const ins = inputsOf(n.id);
          const outs = outputsOf(n.id);
          const m = metaOf(n);
          return /* @__PURE__ */ jsxs8("tr", { className: "border-t border-slate-50 align-top", children: [
            /* @__PURE__ */ jsx8("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxs8("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx8("span", { className: "h-2.5 w-2.5 shrink-0 rounded-sm", style: { background: GNODE_META[n.type].color } }),
              /* @__PURE__ */ jsx8("span", { className: "font-medium text-slate-700", children: n.title }),
              n.badge && /* @__PURE__ */ jsx8("span", { className: "rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-600", children: n.badge })
            ] }) }),
            /* @__PURE__ */ jsx8("td", { className: "px-3 py-2 text-slate-500", children: GNODE_META[n.type].label }),
            /* @__PURE__ */ jsx8("td", { className: "px-3 py-2", children: nodeResults?.[n.id] ? /* @__PURE__ */ jsx8("span", { className: "inline-block max-w-[240px] whitespace-pre-wrap rounded-md border px-2 py-1 text-[11px] font-medium leading-snug " + hintTone(nodeResults?.[n.id]), children: nodeResults[n.id] }) : /* @__PURE__ */ jsx8("span", { className: "text-[11px] text-slate-300", children: "\u2014" }) }),
            /* @__PURE__ */ jsxs8("td", { className: "px-3 py-2 text-slate-600", children: [
              /* @__PURE__ */ jsx8("div", { className: "space-y-0.5", children: m.length ? m.map((t, i) => /* @__PURE__ */ jsx8("div", { className: `whitespace-pre-wrap text-[12px] leading-tight ${!open && i > 0 ? "hidden" : ""}`, children: t }, i)) : /* @__PURE__ */ jsx8("span", { className: "text-[12px] text-slate-300", children: "\uFF08\u65E0\uFF09" }) }),
              m.length > 1 && /* @__PURE__ */ jsx8("button", { onClick: () => toggleNode(n.id), className: "mt-1 text-[11px] text-blue-600 hover:underline", children: open ? "\u6536\u8D77" : "\u5C55\u5F00\u8BF4\u660E" })
            ] }),
            /* @__PURE__ */ jsx8("td", { className: "px-3 py-2 text-slate-600", children: ins.length ? ins.map((t, i) => /* @__PURE__ */ jsx8("span", { className: "mr-1 mb-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600", children: t }, i)) : /* @__PURE__ */ jsx8("span", { className: "text-[11px] text-slate-300", children: "\u65E0" }) }),
            /* @__PURE__ */ jsx8("td", { className: "px-3 py-2 text-slate-600", children: outs.length ? outs.map((t, i) => /* @__PURE__ */ jsx8("span", { className: "mr-1 mb-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600", children: t }, i)) : /* @__PURE__ */ jsx8("span", { className: "text-[11px] text-slate-300", children: "\u65E0" }) })
          ] }, n.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "mt-4 overflow-hidden rounded-xl border border-slate-200", children: [
      /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2", children: [
        /* @__PURE__ */ jsxs8("div", { className: "flex items-center gap-2 text-sm font-semibold text-slate-800", children: [
          "\u51B3\u7B56\u6620\u5C04 \xB7 \u8F93\u51FA\u5206\u6570\u5982\u4F55\u53D8\u6210\u5904\u7F6E\u52A8\u4F5C",
          /* @__PURE__ */ jsx8("span", { className: "rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-normal text-slate-400", children: "\u53EA\u8BFB \xB7 \u6570\u636E\u6765\u81EA\u300C\u8BC4\u5206\u9608\u503C\u300D" })
        ] }),
        /* @__PURE__ */ jsx8("button", { onClick: onJumpStrategy, className: "text-xs text-blue-600 hover:underline", children: "\u5728\u89C4\u5219\u5F15\u64CE\u914D\u7F6E \u2192" })
      ] }),
      /* @__PURE__ */ jsxs8("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx8("thead", { children: /* @__PURE__ */ jsxs8("tr", { className: "text-left text-xs text-slate-400", children: [
          /* @__PURE__ */ jsx8("th", { className: "px-3 py-2 font-medium", children: "\u5206\u6570\u6BB5" }),
          /* @__PURE__ */ jsx8("th", { className: "px-3 py-2 font-medium", children: "\u7B49\u7EA7" }),
          /* @__PURE__ */ jsx8("th", { className: "px-3 py-2 font-medium", children: "\u542B\u4E49" }),
          /* @__PURE__ */ jsx8("th", { className: "px-3 py-2 font-medium", children: "\u5EFA\u8BAE\u52A8\u4F5C\uFF08\u9608\u503C\u89C4\u5219\uFF09" }),
          /* @__PURE__ */ jsx8("th", { className: "px-3 py-2 font-medium", children: "\u6267\u884C\u5F15\u64CE" })
        ] }) }),
        /* @__PURE__ */ jsxs8("tbody", { children: [
          rows.map((t) => {
            const hit = hitRow?.range === t.range;
            return /* @__PURE__ */ jsxs8("tr", { className: "border-t border-slate-50", style: hit ? { background: "#EFF6FF", boxShadow: "inset 3px 0 0 #2563EB" } : void 0, children: [
              /* @__PURE__ */ jsxs8("td", { className: "px-3 py-2 tabular-nums text-slate-700", children: [
                t.range,
                hit && /* @__PURE__ */ jsxs8("span", { className: "ml-2 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white", children: [
                  "\u25C0 \u672C\u5BA2\u6237 ",
                  currentScore,
                  " \u5206"
                ] })
              ] }),
              /* @__PURE__ */ jsx8("td", { className: "px-3 py-2 font-semibold", style: hit ? { color: "#1D4ED8" } : { color: "#334155" }, children: t.level }),
              /* @__PURE__ */ jsx8("td", { className: "px-3 py-2", style: hit ? { color: "#1E40AF" } : { color: "#64748B" }, children: t.meaning }),
              /* @__PURE__ */ jsx8("td", { className: "px-3 py-2", style: hit ? { color: "#1E40AF", fontWeight: 600 } : { color: "#334155" }, children: t.action }),
              /* @__PURE__ */ jsx8("td", { className: "px-3 py-2 text-sky-500", children: "\u89C4\u5219\u5F15\u64CE" })
            ] }, t.range);
          }),
          rows.length === 0 && /* @__PURE__ */ jsx8("tr", { children: /* @__PURE__ */ jsx8("td", { colSpan: 5, className: "px-3 py-3 text-center text-xs text-slate-400", children: "\u5F53\u524D\u6A21\u578B\u6682\u65E0\u9608\u503C\u51B3\u7B56\u914D\u7F6E" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-400", children: [
        /* @__PURE__ */ jsx8("span", { children: "\u9608\u503C\u89C4\u5219\u4E0E\u9884\u8B66\u89C4\u5219\u5747\u7531\u89C4\u5219\u5F15\u64CE\u5B50\u7CFB\u7EDF\u7EDF\u4E00\u6267\u884C\uFF1B\u94FE\u8DEF\u5B9E\u4F53\u5747\u6765\u81EA\u771F\u5B9E\u914D\u7F6E\uFF08scoreData.json / ruleHub.json\uFF09\uFF0C\u975E\u793A\u610F\u3002" }),
        /* @__PURE__ */ jsx8("button", { onClick: onJumpRules, className: "ml-3 shrink-0 text-xs text-blue-600 hover:underline", children: "\u5728\u89C4\u5219\u5F15\u64CE\u67E5\u770B\u5168\u90E8\u89C4\u5219 \u2192" })
      ] })
    ] })
  ] });
}

// src/console/RelationGraphView.tsx
import { useEffect as useEffect6, useMemo as useMemo4, useRef as useRef6, useState as useState8 } from "react";
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
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
  const now = useMemo4(() => parseCollectedAt(graph.collectedAt), [graph.collectedAt]);
  const nowStr = useMemo4(() => fmtDate(now), [now]);
  const defStart = useMemo4(() => cutoffOf(now, 365), [now]);
  const [customStart, setCustomStart] = useState8(defStart);
  const [customEnd, setCustomEnd] = useState8(nowStr);
  const periodInfo = useMemo4(() => {
    const lo = customStart || defStart;
    const hi = customEnd || nowStr;
    return { lo, hi };
  }, [customStart, customEnd, defStart, nowStr]);
  const { nodes, pos, highRisk } = useMemo4(() => {
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
  const persons = useMemo4(() => nodes.filter((n) => n.type !== "self"), [nodes]);
  const rowRefs = useRef6({});
  useEffect6(() => {
    if (sel?.kind === "node") rowRefs.current[sel.node.id]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [sel]);
  const themeList = graph.themes ?? ["\u7EFC\u5408"];
  const active = useMemo4(() => {
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
  return /* @__PURE__ */ jsxs9("div", { children: [
    /* @__PURE__ */ jsxs9(
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
          /* @__PURE__ */ jsxs9("span", { children: [
            "\u{1F4E1} \u6765\u6E90\uFF1A",
            /* @__PURE__ */ jsx9("b", { style: { color: "#334155" }, children: graph.source })
          ] }),
          /* @__PURE__ */ jsxs9("span", { children: [
            "\u8282\u70B9 ",
            /* @__PURE__ */ jsx9("b", { style: { color: "#334155" }, children: nodes.length })
          ] }),
          /* @__PURE__ */ jsxs9("span", { children: [
            "\u5173\u7CFB ",
            /* @__PURE__ */ jsx9("b", { style: { color: "#334155" }, children: active.length })
          ] }),
          highRisk > 0 && /* @__PURE__ */ jsxs9("span", { style: { color: "#DC2626", fontWeight: 600 }, children: [
            "\u9AD8\u5371\u8282\u70B9 ",
            highRisk
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs9("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }, children: [
      /* @__PURE__ */ jsx9("span", { style: { fontSize: 12, color: "#94A3B8", marginRight: 2 }, children: "\u56FE\u8C31\u4E3B\u9898" }),
      themeList.map((th) => {
        const on = th === theme;
        const col = THEME_COLOR[th] ?? "#8B5CF6";
        return /* @__PURE__ */ jsxs9(
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
              on && /* @__PURE__ */ jsx9("span", { style: { fontSize: 11, lineHeight: 1 }, children: "\u2713" }),
              th
            ]
          },
          th
        );
      }),
      /* @__PURE__ */ jsx9("span", { style: { width: 1, height: 18, background: "#E2E8F0", margin: "0 6px" } }),
      /* @__PURE__ */ jsx9("span", { style: { fontSize: 12, color: "#94A3B8", marginRight: 2 }, children: "\u65F6\u95F4\u6BB5" }),
      /* @__PURE__ */ jsxs9("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 4 }, children: [
        /* @__PURE__ */ jsx9(
          "input",
          {
            type: "date",
            value: customStart,
            max: customEnd || nowStr,
            onChange: (e) => setCustomStart(e.target.value),
            style: { fontSize: 12, padding: "4px 8px", borderRadius: 8, border: "1px solid #E2E8F0", color: "#475569" }
          }
        ),
        /* @__PURE__ */ jsx9("span", { style: { color: "#94A3B8", fontSize: 12 }, children: "~" }),
        /* @__PURE__ */ jsx9(
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
    /* @__PURE__ */ jsxs9("div", { style: { display: "flex", gap: 18, alignItems: "stretch", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs9("div", { style: { flex: "1 1 520px", minWidth: 480, position: "relative" }, children: [
        /* @__PURE__ */ jsxs9(
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
                return /* @__PURE__ */ jsxs9(
                  "g",
                  {
                    style: { cursor: "pointer" },
                    onClick: (ev) => {
                      ev.stopPropagation();
                      onPick({ kind: "edge", edge: e });
                    },
                    children: [
                      /* @__PURE__ */ jsx9(
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
                      /* @__PURE__ */ jsx9("path", { d, fill: "none", stroke: "transparent", strokeWidth: 14 }),
                      e.danger && /* @__PURE__ */ jsx9(
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
                return /* @__PURE__ */ jsxs9(
                  "g",
                  {
                    transform: `translate(${p.x},${p.y})`,
                    style: { cursor: "pointer" },
                    onClick: (ev) => {
                      ev.stopPropagation();
                      onPick({ kind: "node", node: n });
                    },
                    children: [
                      seld && /* @__PURE__ */ jsx9(
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
                      /* @__PURE__ */ jsx9(
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
                      /* @__PURE__ */ jsx9(
                        "circle",
                        {
                          cx: -w / 2 + (isSelf ? 16 : 14),
                          cy: 0,
                          r: isSelf ? 6 : 5,
                          fill: isSelf ? "#fff" : c,
                          stroke: isSelf ? "rgba(255,255,255,.6)" : "none"
                        }
                      ),
                      /* @__PURE__ */ jsx9(
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
                      !!n.openAlerts && /* @__PURE__ */ jsxs9("g", { children: [
                        /* @__PURE__ */ jsx9("circle", { cx: w / 2 - 12, cy: -h / 2 + 12, r: 8, fill: "#DC2626", stroke: "#fff", strokeWidth: 1.5 }),
                        /* @__PURE__ */ jsx9(
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
                      n.risk === "\u9AD8\u5371" && !n.openAlerts && /* @__PURE__ */ jsx9("circle", { cx: w / 2 - 10, cy: -h / 2 + 10, r: 5, fill: "#DC2626", stroke: "#fff", strokeWidth: 1.5 })
                    ]
                  },
                  n.id
                );
              })
            ]
          }
        ),
        /* @__PURE__ */ jsx9("div", { style: { position: "absolute", top: 12, right: 12, width: 218, zIndex: 5 }, children: /* @__PURE__ */ jsx9(RelDetail, { sel, nodeMap, onClose: () => onPick(null) }) }),
        /* @__PURE__ */ jsxs9("div", { style: { display: "flex", gap: 14, fontSize: 11, color: "#64748B", marginTop: 10, flexWrap: "wrap" }, children: [
          Object.keys(TYPE_COLOR).filter((k) => k !== "self").map((k) => /* @__PURE__ */ jsxs9("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
            /* @__PURE__ */ jsx9("span", { style: { width: 9, height: 9, borderRadius: "50%", background: TYPE_COLOR[k], display: "inline-block" } }),
            TYPE_LABEL[k] ?? k
          ] }, k)),
          /* @__PURE__ */ jsxs9("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
            /* @__PURE__ */ jsx9("span", { style: { width: 16, height: 0, borderTop: "2px dashed #DC2626", display: "inline-block" } }),
            "\u9AD8\u5371 / \u98CE\u9669\u5173\u7CFB"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx9(RelSide, { persons, sel, nodeMap, onPick, rowRefs })
    ] })
  ] });
}
function KV({ k, v, danger }) {
  return /* @__PURE__ */ jsxs9("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, padding: "3px 0", fontSize: 12 }, children: [
    /* @__PURE__ */ jsx9("span", { style: { color: "#94A3B8" }, children: k }),
    /* @__PURE__ */ jsx9("span", { style: { color: danger ? "#DC2626" : "#334155", fontWeight: 500, textAlign: "right" }, children: v })
  ] });
}
function RelDetail({
  sel,
  nodeMap,
  onClose
}) {
  if (!sel) {
    return /* @__PURE__ */ jsxs9(
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
          /* @__PURE__ */ jsx9("b", { style: { color: "#8B5CF6" }, children: "\u8282\u70B9" }),
          " \u6216 ",
          /* @__PURE__ */ jsx9("b", { style: { color: "#DC2626" }, children: "\u5173\u7CFB" }),
          "\uFF0C\u6216\u4E0B\u65B9\u6E05\u5355\u4E2D\u7684\u4EFB\u4E00\u5173\u7CFB\u4EBA\uFF0C\u67E5\u770B\u5BF9\u8C61\u5C5E\u6027\u3002"
        ]
      }
    );
  }
  if (sel.kind === "node") {
    const n = sel.node;
    return /* @__PURE__ */ jsxs9(
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
          /* @__PURE__ */ jsxs9("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
            /* @__PURE__ */ jsx9("span", { style: { fontSize: 14, fontWeight: 700, color: "#0F172A" }, children: n.name }),
            /* @__PURE__ */ jsx9(
              "button",
              {
                onClick: onClose,
                style: { border: "none", background: "none", cursor: "pointer", color: "#94A3B8", fontSize: 16, lineHeight: 1 },
                children: "\xD7"
              }
            )
          ] }),
          /* @__PURE__ */ jsx9(KV, { k: "\u7C7B\u578B", v: TYPE_LABEL[n.type] ?? n.type }),
          /* @__PURE__ */ jsx9(KV, { k: "\u5173\u7CFB", v: n.rel }),
          n.risk && /* @__PURE__ */ jsx9(KV, { k: "\u98CE\u9669\u7B49\u7EA7", v: n.risk, danger: n.risk !== "\u6B63\u5E38" }),
          n.phone && /* @__PURE__ */ jsx9(KV, { k: "\u8054\u7CFB\u7535\u8BDD", v: n.phone }),
          n.openAlerts != null && /* @__PURE__ */ jsx9(KV, { k: "\u5173\u8054\u9884\u8B66", v: `${n.openAlerts} \u6761`, danger: n.openAlerts > 0 }),
          n.detail && /* @__PURE__ */ jsx9(KV, { k: "\u8BF4\u660E", v: n.detail })
        ]
      }
    );
  }
  const e = sel.edge;
  const sName = nodeMap[e.source]?.name ?? e.source;
  const tName = nodeMap[e.target]?.name ?? e.target;
  return /* @__PURE__ */ jsxs9(
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
        /* @__PURE__ */ jsxs9("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
          /* @__PURE__ */ jsx9("span", { style: { fontSize: 14, fontWeight: 700, color: "#0F172A" }, children: "\u5173\u7CFB\u5C5E\u6027" }),
          /* @__PURE__ */ jsx9(
            "button",
            {
              onClick: onClose,
              style: { border: "none", background: "none", cursor: "pointer", color: "#94A3B8", fontSize: 16, lineHeight: 1 },
              children: "\xD7"
            }
          )
        ] }),
        /* @__PURE__ */ jsx9(KV, { k: "\u5173\u7CFB\u7C7B\u578B", v: e.rel, danger: e.danger }),
        /* @__PURE__ */ jsx9(KV, { k: "\u8D77\u70B9", v: sName }),
        /* @__PURE__ */ jsx9(KV, { k: "\u7EC8\u70B9", v: tName }),
        /* @__PURE__ */ jsx9(KV, { k: "\u6240\u5C5E\u4E3B\u9898", v: e.theme }),
        /* @__PURE__ */ jsx9(KV, { k: "\u6700\u8FD1\u6D3B\u8DC3", v: e.since ?? "\u2014" }),
        /* @__PURE__ */ jsx9(KV, { k: "\u98CE\u9669\u6807\u8BB0", v: e.danger ? "\u9AD8\u5371 / \u98CE\u9669\u8FB9" : "\u6B63\u5E38", danger: e.danger })
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
  return /* @__PURE__ */ jsxs9("div", { style: { flex: "0 0 320px", minWidth: 280, display: "flex", flexDirection: "column", gap: 10, height: "100%" }, children: [
    /* @__PURE__ */ jsxs9(
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
          /* @__PURE__ */ jsx9("span", { children: "\u5173\u7CFB\u4EBA\u6E05\u5355" }),
          /* @__PURE__ */ jsxs9("span", { children: [
            persons.length,
            " \u4EBA"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx9("div", { style: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 4 }, children: persons.map((n) => {
      const seld = sel?.kind === "node" && sel.node.id === n.id;
      const c = TYPE_COLOR[n.type] ?? "#64748B";
      return /* @__PURE__ */ jsxs9(
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
            /* @__PURE__ */ jsxs9("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }, children: [
              /* @__PURE__ */ jsx9("span", { style: { fontSize: 13, fontWeight: 600, color: "#334155" }, children: n.name }),
              /* @__PURE__ */ jsx9("span", { style: { fontSize: 11, color: c }, children: TYPE_LABEL[n.type] ?? n.type })
            ] }),
            /* @__PURE__ */ jsxs9("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 3 }, children: [
              n.rel,
              n.risk && n.risk !== "\u6B63\u5E38" ? ` \xB7 ${n.risk}` : ""
            ] }),
            n.detail && /* @__PURE__ */ jsx9("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 2, lineHeight: 1.45 }, children: n.detail })
          ]
        },
        n.id
      );
    }) })
  ] });
}

// src/console/CustScoreDetail.tsx
import { Fragment as Fragment8, jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
var PROD_KEYS = ["zhicha", "zhixin", "zhirong"];
var PROD_META = {
  zhicha: { label: "\u667A\u5BDF\u5206", sub: "\u53CD\u6B3A\u8BC8", color: "#ef4444", danger: true },
  zhixin: { label: "\u667A\u4FE1\u5206", sub: "\u4FE1\u7528", color: "#16a34a", danger: false },
  zhirong: { label: "\u667A\u878D\u5206", sub: "\u7EFC\u5408", color: "#8b5cf6", danger: false }
};
var LEVEL_COLOR = { \u9AD8: "#DC2626", \u4E2D: "#D97706", \u4F4E: "#16A34A" };
var DIM_WEIGHT = { \u6B3A\u8BC8: 0.3, \u591A\u5934: 0.25, \u884C\u4E3A: 0.2, \u53F8\u6CD5: 0.15, \u8D1F\u503A: 0.1, \u8206\u60C5: 0.05 };
function deriveFallback(cust, prod) {
  const dims = cust.riskDims ?? [];
  const used = dims.filter((d) => DIM_WEIGHT[d.dim] != null);
  if (!used.length) return null;
  const wsum = used.reduce((s, d) => s + DIM_WEIGHT[d.dim], 0);
  const riskAvg = used.reduce((s, d) => s + d.score * DIM_WEIGHT[d.dim], 0) / wsum;
  let score, range, unit, hint;
  if (prod === "zhicha") {
    score = Math.round(riskAvg);
    range = [0, 100];
    unit = "\u6B3A\u8BC8\u5206";
    hint = "\u6B3A\u8BC8\u98CE\u9669\u8BC4\u5206\uFF0C\u5206\u6570\u8D8A\u9AD8\u6B3A\u8BC8\u98CE\u9669\u8D8A\u5927";
  } else if (prod === "zhixin") {
    score = Math.round(900 - riskAvg * 3.4);
    range = [300, 900];
    unit = "\u4FE1\u7528\u5206";
    hint = "\u4FE1\u7528\u8BC4\u5206\uFF0C\u5206\u6570\u8D8A\u9AD8\u4FE1\u7528\u8D8A\u597D";
  } else {
    score = Math.round(900 - riskAvg * 3.8);
    range = [300, 900];
    unit = "\u7EFC\u5408\u5206";
    hint = "\u7EFC\u5408\u98CE\u9669\u4E0E\u4EF7\u503C\u8BC4\u5206\uFF0C\u5206\u6570\u8D8A\u9AD8\u7EFC\u5408\u8868\u73B0\u8D8A\u597D";
  }
  score = Math.max(range[0], Math.min(range[1], score));
  return { score, range, unit, hint };
}
var RISK_LEVEL_COLOR = {
  "\u4F4E\u98CE\u9669": "#16A34A",
  "A": "#16A34A",
  "\u4E2D\u98CE\u9669": "#D97706",
  "B": "#65A30D",
  "C": "#D97706",
  "\u9AD8\u98CE\u9669": "#DC2626",
  "D": "#DC2626"
};
function riskBand(prod, score) {
  const r = resolveRisk(prod, score) ?? { level: "\u2014", meaning: "", action: "", range: "\u2014" };
  return { level: r.level, meaning: r.meaning, action: r.action, range: r.range, color: RISK_LEVEL_COLOR[r.level] ?? "#64748B" };
}
var GRADE_LABEL = { A: "\u4F18\u8D28", B: "\u826F\u597D", C: "\u4E00\u822C", D: "\u8F83\u5DEE", \u9AD8\u98CE\u9669: "\u9AD8\u98CE\u9669", \u4E2D\u98CE\u9669: "\u4E2D\u98CE\u9669", \u4F4E\u98CE\u9669: "\u4F4E\u98CE\u9669" };
function enrich(item, prod) {
  const band = riskBand(prod, item.score);
  const isFraud = prod === "zhicha";
  const probability = item.probability ?? (isFraud ? item.score >= 70 ? "72.5%" : item.score >= 40 ? "38.2%" : "9.6%" : band.level === "A" ? "3.1%" : band.level === "B" ? "6.8%" : band.level === "C" ? "14.2%" : "26.5%");
  const grade = item.grade ?? band.level;
  const gradeLabel = item.gradeLabel ?? GRADE_LABEL[band.level] ?? "";
  const modelVersion = item.modelVersion ?? (prod === "zhicha" ? "\u667A\u5BDFV3.2" : prod === "zhixin" ? "\u667A\u4FE1V4.0" : "\u667A\u878DV2.1");
  const calcedAt = item.calcedAt ?? "2026-08-08 10:30:12";
  return { ...item, probability, grade, gradeLabel, modelVersion, calcedAt };
}
var PROD_TO_MODEL = { zhicha: "M-\u667A\u5BDF\u5206", zhixin: "M-\u667A\u4FE1\u5206", zhirong: "M-\u667A\u878D\u5206" };
var MODEL_CAPA = {
  zhicha: {
    method: "XGBoost + \u89C4\u5219\u5F15\u64CE\u878D\u5408\uFF1A\u57FA\u4E8E 2019\u20132025 \u5E74\u5386\u53F2\u6B3A\u8BC8\u6837\u672C\u8BAD\u7EC3\uFF0C\u53E0\u52A0\u53CD\u6B3A\u8BC8\u4E13\u5BB6\u89C4\u5219\u4E0E\u4EBA\u5DE5\u590D\u6838\u5E72\u9884",
    owner: "\u53CD\u6B3A\u8BC8\u6A21\u578B\u7EC4 \xB7 \u5468\u660E",
    applicable: "\u5168\u4EA7\u54C1\u8D37\u524D/\u8D37\u4E2D\u53CD\u6B3A\u8BC8\u7B5B\u67E5",
    psi: 0.08,
    monitor: "\u65E5\u7EA7 PSI \u76D1\u63A7\uFF0C\u9608\u503C 0.25 \u89E6\u53D1\u544A\u8B66\u590D\u6838",
    lineage: [
      { stage: "\u6570\u636E\u63A5\u5165", detail: "\u8BBE\u5907\u6307\u7EB9 / \u591A\u5934\u501F\u8D37 / \u9ED1\u7070\u540D\u5355 / \u7533\u8BF7\u884C\u4E3A\uFF08\u8F93\u5165\u6570\u636E\u7248\u672C 2026Q2\uFF09" },
      { stage: "\u7279\u5F81\u5DE5\u7A0B", detail: "36 \u4E2A\u53CD\u6B3A\u8BC8\u7279\u5F81\uFF08\u805A\u96C6\u5EA6\u3001\u7533\u8BF7\u9891\u6B21\u3001\u73AF\u5883\u98CE\u9669\u2026\uFF09" },
      { stage: "\u6A21\u578B\u8BA1\u7B97", detail: "\u667A\u5BDF\u5206 V3.2\uFF08XGBoost\uFF09\u8F93\u51FA 0\u2013100 \u6B3A\u8BC8\u5206" },
      { stage: "\u4E13\u5BB6\u89C4\u5219", detail: "\u53E0\u52A0\u4E13\u5BB6\u89C4\u5219\u4E0E\u4EBA\u5DE5\u590D\u6838\uFF0C\u5F62\u6210\u6700\u7EC8\u6B3A\u8BC8\u5206" }
    ],
    global: [{ name: "\u8BBE\u5907\u805A\u96C6", importance: 24 }, { name: "\u7533\u8BF7\u9891\u6B21", importance: 21 }, { name: "\u9ED1\u4EA7\u7279\u5F81", importance: 16 }, { name: "\u540C\u8BBE\u5907\u5173\u8054", importance: 12 }, { name: "IP/\u5B9A\u4F4D\u5F02\u5E38", importance: 10 }],
    versions: [
      { version: "V3.2", date: "2026-04-18", note: "\u65B0\u589E\u8BBE\u5907\u805A\u96C6\u7279\u5F81\uFF0C\u63D0\u5347\u6A21\u62DF\u5668\u8BC6\u522B\u51C6\u786E\u7387\uFF1B\u591A\u5934\u9608\u503C\u7531 \u22656 \u8C03\u6574\u4E3A \u22655\uFF0C\u964D\u4F4E\u6F0F\u62A5" },
      { version: "V3.1", date: "2025-11-02", note: "\u8C03\u6574\u7533\u8BF7\u9891\u6B21\u6743\u91CD\uFF0C\u51CF\u5C11\u65FA\u5B63\u8BEF\u62A5\uFF1B\u8865\u5145\u7070\u540D\u5355\u5173\u8054\u89C4\u5219" },
      { version: "V3.0", date: "2025-06-15", note: "\u57FA\u7EBF\u7248\u672C\uFF08XGBoost + \u89C4\u5219\u5F15\u64CE\u878D\u5408\uFF09\uFF0C36 \u4E2A\u53CD\u6B3A\u8BC8\u7279\u5F81" }
    ]
  },
  zhixin: {
    method: "LightGBM \u8BC4\u5206\u5361\uFF1A\u57FA\u4E8E\u8FD1 5 \u5E74\u4FE1\u8D37\u8868\u73B0\u6837\u672C\u8BAD\u7EC3\uFF0C\u53E0\u52A0\u4FE1\u7528\u4E13\u5BB6\u89C4\u5219\u4E0E\u4EBA\u5DE5\u590D\u6838\u5E72\u9884",
    owner: "\u4FE1\u7528\u6A21\u578B\u7EC4 \xB7 \u674E\u822A",
    applicable: "\u4FE1\u7528\u8D37/\u6D88\u8D39\u8D37\u6388\u4FE1\u4E0E\u5B9A\u4EF7",
    psi: 0.06,
    monitor: "\u5468\u7EA7 PSI \u76D1\u63A7\uFF0C\u9608\u503C 0.20 \u89E6\u53D1\u544A\u8B66\u590D\u6838",
    lineage: [
      { stage: "\u6570\u636E\u63A5\u5165", detail: "\u4EBA\u884C\u5F81\u4FE1 / \u8D1F\u503A\u7ED3\u6784 / \u6536\u5165\u6D41\u6C34 / \u5386\u53F2\u8FD8\u6B3E\uFF08\u8F93\u5165\u6570\u636E\u7248\u672C 2026Q2\uFF09" },
      { stage: "\u7279\u5F81\u5DE5\u7A0B", detail: "42 \u4E2A\u4FE1\u7528\u7279\u5F81\uFF08\u903E\u671F\u5386\u53F2\u3001\u8D1F\u503A\u6BD4\u3001\u7A33\u5B9A\u6027\u2026\uFF09" },
      { stage: "\u6A21\u578B\u8BA1\u7B97", detail: "\u667A\u4FE1\u5206 V4.0\uFF08LightGBM\uFF09\u8F93\u51FA 300\u2013900 \u4FE1\u7528\u5206" },
      { stage: "\u4E13\u5BB6\u89C4\u5219", detail: "\u53E0\u52A0\u4E13\u5BB6\u89C4\u5219\u4E0E\u4EBA\u5DE5\u590D\u6838\uFF0C\u5F62\u6210\u6700\u7EC8\u4FE1\u7528\u5206" }
    ],
    global: [{ name: "\u5386\u53F2\u8FD8\u6B3E", importance: 28 }, { name: "\u8D1F\u503A\u7ED3\u6784", importance: 22 }, { name: "\u6536\u5165\u7A33\u5B9A", importance: 20 }, { name: "\u5F81\u4FE1\u67E5\u8BE2", importance: 14 }, { name: "\u804C\u4E1A\u5C5E\u6027", importance: 9 }],
    versions: [
      { version: "V4.0", date: "2026-03-10", note: "\u5F15\u5165\u6536\u5165\u6D41\u6C34\u7279\u5F81\uFF0812 \u4E2A\u6708\uFF09\uFF0C\u7279\u5F81\u6269\u81F3 42 \u4E2A\uFF1B\u91CD\u65B0\u6821\u51C6\u8FDD\u7EA6\u6982\u7387\u8F93\u51FA" },
      { version: "V3.9", date: "2025-10-21", note: "\u8D1F\u503A\u6536\u5165\u6BD4\u9608\u503C\u7531 75% \u6536\u7D27\u81F3 70%\uFF1B\u4FEE\u590D\u4F4E\u5206\u6BB5\u6982\u7387\u504F\u79FB" },
      { version: "V3.8", date: "2025-05-08", note: "\u57FA\u7EBF\u7248\u672C\uFF08LightGBM \u8BC4\u5206\u5361\uFF09\uFF0C38 \u4E2A\u4FE1\u7528\u7279\u5F81" }
    ]
  },
  zhirong: {
    method: "\u878D\u5408\u6A21\u578B\uFF1A\u5F15\u7528\u667A\u4FE1\u5206(\u4FE1\u7528) + \u667A\u5BDF\u5206(\u6B3A\u8BC8) + \u4EF7\u503C/\u8D44\u4EA7\u81EA\u6709\u7279\u5F81\uFF0C\u903B\u8F91\u56DE\u5F52\u878D\u5408",
    owner: "\u7EFC\u5408\u6A21\u578B\u7EC4 \xB7 \u9648\u7490",
    applicable: "\u7EFC\u5408\u6388\u4FE1\u4E0E\u989D\u5EA6\u6838\u5B9A",
    psi: 0.1,
    monitor: "\u65E5\u7EA7 PSI \u76D1\u63A7\uFF0C\u9608\u503C 0.25 \u89E6\u53D1\u544A\u8B66\u590D\u6838",
    lineage: [
      { stage: "\u6570\u636E\u63A5\u5165", detail: "\u667A\u4FE1\u5206 / \u667A\u5BDF\u5206 / \u4EF7\u503C\u4E0E\u8D44\u4EA7\u7279\u5F81\uFF08\u8F93\u5165\u6570\u636E\u7248\u672C 2026Q2\uFF09" },
      { stage: "\u7279\u5F81\u5DE5\u7A0B", detail: "\u8FDD\u7EA6\u7EF4\u5EA6 + \u6B3A\u8BC8\u7EF4\u5EA6 + \u4EF7\u503C\u7EF4\u5EA6 + \u8D44\u4EA7\u7EF4\u5EA6" },
      { stage: "\u6A21\u578B\u8BA1\u7B97", detail: "\u667A\u878D\u5206 V2.1\uFF08\u878D\u5408\u903B\u8F91\u56DE\u5F52\uFF09\u8F93\u51FA 300\u2013900 \u7EFC\u5408\u5206" },
      { stage: "\u4E13\u5BB6\u89C4\u5219", detail: "\u53E0\u52A0\u4E13\u5BB6\u89C4\u5219\u4E0E\u4EBA\u5DE5\u590D\u6838\uFF0C\u5F62\u6210\u6700\u7EC8\u7EFC\u5408\u5206" }
    ],
    global: [{ name: "\u8FDD\u7EA6\u7EF4\u5EA6", importance: 34 }, { name: "\u6B3A\u8BC8\u7EF4\u5EA6", importance: 28 }, { name: "\u4EF7\u503C\u7EF4\u5EA6", importance: 24 }, { name: "\u8D44\u4EA7\u7EF4\u5EA6", importance: 14 }],
    versions: [
      { version: "V2.1", date: "2026-02-06", note: "\u8C03\u6574\u667A\u4FE1\u5206/\u667A\u5BDF\u5206\u878D\u5408\u6743\u91CD\uFF08\u4FE1\u7528 0.55 / \u6B3A\u8BC8 0.45\uFF09\uFF1B\u52A0\u5165\u501F\u8D37\u5174\u8DA3\u4EF7\u503C\u7279\u5F81" },
      { version: "V2.0", date: "2025-12-01", note: "\u57FA\u7EBF\u878D\u5408\u7248\u672C\uFF08\u903B\u8F91\u56DE\u5F52\u878D\u5408\u667A\u4FE1\u5206 + \u667A\u5BDF\u5206 + \u4EF7\u503C/\u8D44\u4EA7\u7279\u5F81\uFF09" }
    ]
  }
};
var DIM_SOURCE = {
  zhicha: {
    "\u8BBE\u5907\u805A\u96C6": { from: "\u6B3A\u8BC8", fb: 72 },
    "\u7533\u8BF7\u9891\u6B21": { from: "\u884C\u4E3A", fb: 55 },
    "\u9ED1\u4EA7\u7279\u5F81": { from: "\u53F8\u6CD5", fb: 50 },
    "\u540C\u8BBE\u5907\u5173\u8054": { from: "\u591A\u5934", fb: 45 },
    "IP/\u5B9A\u4F4D\u5F02\u5E38": { fb: 60 }
  },
  zhixin: {
    "\u5386\u53F2\u8FD8\u6B3E": { from: "\u884C\u4E3A", fb: 60 },
    "\u8D1F\u503A\u7ED3\u6784": { from: "\u8D1F\u503A", fb: 62 },
    "\u6536\u5165\u7A33\u5B9A": { from: "\u884C\u4E3A", fb: 50 },
    "\u5F81\u4FE1\u67E5\u8BE2": { from: "\u591A\u5934", fb: 45 },
    "\u804C\u4E1A\u5C5E\u6027": { fb: 40 }
  },
  zhirong: {
    "\u8FDD\u7EA6\u7EF4\u5EA6": { from: "\u8D1F\u503A", fb: 60 },
    "\u6B3A\u8BC8\u7EF4\u5EA6": { from: "\u6B3A\u8BC8", fb: 65 },
    "\u4EF7\u503C\u7EF4\u5EA6": { from: "\u884C\u4E3A", fb: 45 },
    "\u8D44\u4EA7\u7EF4\u5EA6": { fb: 40 }
  }
};
function dimsOf(prod, riskDims) {
  return MODEL_CAPA[prod].global.map((g) => {
    const cfg = DIM_SOURCE[prod][g.name] ?? { fb: 55 };
    const hit = cfg.from ? riskDims.find((d) => d.dim === cfg.from) : void 0;
    const score = (cfg.from && hit?.score) ?? cfg.fb;
    return { dim: g.name, score, lvl: score >= 75 ? "\u9AD8" : score >= 55 ? "\u4E2D" : "\u4F4E", importance: g.importance, src: hit ? "\u5B9E\u6D4B" : "\u515C\u5E95" };
  });
}
function CapCell({ label, value, danger }) {
  return /* @__PURE__ */ jsxs10("div", { style: { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px" }, children: [
    /* @__PURE__ */ jsx10("div", { style: { fontSize: 11, color: "#94A3B8" }, children: label }),
    /* @__PURE__ */ jsx10("div", { style: { fontSize: 13, fontWeight: 600, color: danger ? "#DC2626" : "#1E293B", marginTop: 2 }, children: value })
  ] });
}
function FieldRow({ k, v, strong }) {
  return /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "baseline", gap: 10, padding: "4px 0", borderBottom: "1px dashed #E8EEF5" }, children: [
    /* @__PURE__ */ jsx10("span", { style: { flexShrink: 0, width: 90, fontSize: 12, color: "#94A3B8" }, children: k }),
    /* @__PURE__ */ jsx10("span", { style: { flex: 1, minWidth: 0, fontSize: 12.5, color: strong ? "#0F172A" : "#334155", fontWeight: strong ? 700 : 400 }, children: v })
  ] });
}
var INPUT_DETAILS = {
  zhicha: [
    {
      name: "\u8FD130\u5929\u7533\u8D37\u7B14\u6570",
      source: "\u591A\u5934\u501F\u8D37\u6570\u636E",
      window: "2026-07-10 ~ 08-08",
      value: "7 \u7B14\uFF08\u9608\u503C \u22655\uFF09",
      status: "\u89E6\u53D1",
      feat: "\u591A\u5934\u805A\u96C6",
      detailTitle: "\u7533\u8D37\u8BB0\u5F55\uFF08\u8FD1 30 \u5929 \xB7 \u9010\u7B14\uFF09",
      cols: ["\u7533\u8BF7\u65E5\u671F", "\u673A\u6784", "\u4EA7\u54C1", "\u72B6\u6001"],
      rows: [
        ["07-12", "\u67D0\u94F6\u884C", "\u6D88\u8D39\u8D37", "\u5DF2\u653E\u6B3E"],
        ["07-15", "\u67D0\u6D88\u8D39\u91D1\u878D", "\u73B0\u91D1\u8D37", "\u5DF2\u653E\u6B3E"],
        ["07-18", "\u67D0\u7F51\u8D37\u5E73\u53F0", "\u5C0F\u989D\u8D37", "\u62D2\u7EDD"],
        ["07-23", "\u67D0\u94F6\u884C", "\u4FE1\u7528\u8D37", "\u5BA1\u6279\u4E2D"],
        ["07-27", "\u67D0\u6D88\u91D1", "\u5FAA\u73AF\u989D\u5EA6", "\u5DF2\u653E\u6B3E"],
        ["08-02", "\u67D0\u5E73\u53F0", "\u73B0\u91D1\u5206\u671F", "\u5BA1\u6279\u4E2D"],
        ["08-06", "\u67D0\u94F6\u884C", "\u6D88\u8D39\u5206\u671F", "\u7533\u8BF7"]
      ]
    },
    {
      name: "\u540C\u65F6\u5728\u8D37\u5E73\u53F0\u6570",
      source: "\u591A\u5934\u501F\u8D37\u6570\u636E",
      window: "\u5F53\u524D\u65F6\u70B9",
      value: "5 \u5BB6\uFF08\u9608\u503C \u22654\uFF09",
      status: "\u89E6\u53D1",
      feat: "\u591A\u5934\u805A\u96C6",
      detailTitle: "\u5728\u8D37\u5E73\u53F0\uFF08\u5F53\u524D\uFF09",
      cols: ["\u5E73\u53F0", "\u5728\u8D37\u4F59\u989D", "\u72B6\u6001"],
      rows: [
        ["\u5E73\u53F0A", "\xA512,000", "\u6B63\u5E38"],
        ["\u5E73\u53F0B", "\xA58,500", "\u6B63\u5E38"],
        ["\u5E73\u53F0C", "\xA515,000", "\u5173\u6CE8\uFF08\u8FD130\u5929\u6709\u7533\u8BF7\uFF09"],
        ["\u5E73\u53F0D", "\xA56,000", "\u6B63\u5E38"],
        ["\u5E73\u53F0E", "\xA520,000", "\u6B63\u5E38"]
      ]
    },
    {
      name: "\u8BBE\u5907\u73AF\u5883",
      source: "\u8BBE\u5907\u6307\u7EB9",
      window: "\u7533\u8BF7\u65F6\u70B9",
      value: "\u6A21\u62DF\u5668\u7279\u5F81\u547D\u4E2D",
      status: "\u89E6\u53D1",
      feat: "\u8BBE\u5907\u73AF\u5883",
      detailTitle: "\u8BBE\u5907\u6307\u7EB9\uFF08\u7533\u8BF7\u65F6\u70B9\u91C7\u96C6\uFF09",
      cols: ["\u68C0\u6D4B\u9879", "\u7ED3\u679C"],
      rows: [
        ["\u8BBE\u5907\u6307\u7EB9", "DEV-A3F8-9C21\uFF08\u8FD130\u5929 3 \u53F0\u5173\u8054\u8BBE\u5907\uFF09"],
        ["\u73AF\u5883\u7279\u5F81", "\u6A21\u62DF\u5668\u7279\u5F81\u547D\u4E2D\uFF08\u7F6E\u4FE1\u5EA6 0.92\uFF09"],
        ["IP \u5F52\u5C5E", "202.xx.xx.16 \xB7 \u5F02\u5730\uFF08\u4E0E\u5E38\u9A7B\u5730\u4E0D\u7B26\uFF09"]
      ]
    },
    {
      name: "\u9ED1\u540D\u5355\u547D\u4E2D",
      source: "\u9ED1\u7070\u540D\u5355\u5E93",
      window: "\u5F53\u524D",
      value: "\u5916\u90E8\u7070\u540D\u5355 ID#88231",
      status: "\u89E6\u53D1",
      feat: "\u9ED1\u4EA7\u5173\u8054",
      detailTitle: "\u540D\u5355\u547D\u4E2D\uFF08\u9ED1\u7070\u540D\u5355\u5E93\u8BB0\u5F55\uFF09",
      cols: ["\u9879", "\u5185\u5BB9"],
      rows: [
        ["\u540D\u5355\u7C7B\u578B", "\u5916\u90E8\u7070\u540D\u5355\uFF08\u4E92\u91D1\u534F\u4F1A\u5171\u4EAB\uFF09"],
        ["\u540D\u5355\u7F16\u53F7", "ID#88231"],
        ["\u5165\u540D\u5355\u539F\u56E0", "2025-11 \u7591\u4F3C\u7EC4\u56E2\u7533\u8D37"],
        ["\u547D\u4E2D\u65F6\u70B9", "2026-08-08 10:30:12"]
      ]
    },
    {
      name: "\u540C\u8BBE\u5907\u5173\u8054\u8D26\u53F7",
      source: "\u8D26\u53F7\u5173\u7CFB\u56FE\u8C31",
      window: "\u5F53\u524D",
      value: "3 \u4E2A\uFF08\u9608\u503C \u22655 \u89E6\u53D1\uFF09",
      status: "\u5173\u6CE8",
      feat: "\u7F51\u7EDC\u5173\u8054",
      detailTitle: "\u540C\u8BBE\u5907\u8D26\u53F7\uFF08\u8BBE\u5907\u7EF4\u5EA6\u5173\u8054\uFF09",
      cols: ["\u8D26\u53F7", "\u5173\u7CFB", "\u98CE\u9669"],
      rows: [
        ["\u5F20*\u660E", "\u672C\u4EBA", "\u6B63\u5E38"],
        ["\u738B*\u82B3", "\u540C\u8BBE\u5907\u767B\u5F55 2 \u6B21", "\u5173\u6CE8"],
        ["\u674E*\u534E", "\u540C\u8BBE\u5907\u767B\u5F55 1 \u6B21", "\u5173\u6CE8"]
      ]
    },
    {
      name: "\u5F81\u4FE1\u67E5\u8BE2\u6B21\u6570",
      source: "\u4EBA\u884C\u5F81\u4FE1",
      window: "\u8FD1 6 \u6708",
      value: "8 \u6B21\uFF08\u9608\u503C \u226510\uFF09",
      status: "\u6B63\u5E38",
      feat: "\u7533\u8BF7\u884C\u4E3A",
      detailTitle: "\u5F81\u4FE1\u67E5\u8BE2\u8BB0\u5F55\uFF08\u8FD1 6 \u6708 \xB7 \u9010\u7B14\uFF09",
      cols: ["\u67E5\u8BE2\u65E5\u671F", "\u67E5\u8BE2\u673A\u6784", "\u67E5\u8BE2\u7C7B\u578B"],
      rows: [
        ["03-02", "\u67D0\u94F6\u884C", "\u8D37\u524D\u5BA1\u6279\uFF08\u4FE1\u7528\u5361\uFF09"],
        ["03-15", "\u67D0\u6D88\u8D39\u91D1\u878D", "\u8D37\u524D\u5BA1\u6279"],
        ["04-11", "\u67D0\u94F6\u884C", "\u8D37\u524D\u5BA1\u6279\uFF08\u8D37\u6B3E\uFF09"],
        ["05-06", "\u67D0\u6D88\u91D1", "\u8D37\u524D\u5BA1\u6279"],
        ["06-20", "\u672C\u4EBA", "\u672C\u4EBA\u67E5\u8BE2"],
        ["07-08", "\u67D0\u7F51\u8D37\u5E73\u53F0", "\u8D37\u524D\u5BA1\u6279"],
        ["07-22", "\u67D0\u94F6\u884C", "\u8D37\u540E\u7BA1\u7406"],
        ["08-02", "\u67D0\u6D88\u8D39\u91D1\u878D", "\u8D37\u540E\u7BA1\u7406"]
      ]
    },
    {
      name: "\u6536\u5165\u6D41\u6C34\u7A33\u5B9A\u6027",
      source: "\u94F6\u884C\u6D41\u6C34",
      window: "\u8FD1 12 \u6708",
      value: "\u8FDE\u7EED 14 \u6708\u7A33\u5B9A",
      status: "\u6B63\u5E38",
      feat: "\u2014",
      detailTitle: "\u6536\u5165\u6D41\u6C34\uFF08\u8FD1 12 \u6708\u6C47\u603B\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u6708\u5747\u5165\u8D26", "\xA518,000\uFF08\u4EE3\u53D1\u5DE5\u8D44\uFF09"],
        ["\u8FDE\u7EED\u5165\u8D26\u6708\u6570", "14 \u4E2A\u6708"],
        ["\u5927\u989D\u5F02\u52A8", "\u65E0"]
      ]
    },
    {
      name: "\u53F8\u6CD5\u6D89\u8BC9",
      source: "\u53F8\u6CD5\u6570\u636E",
      window: "\u8FD1 2 \u5E74",
      value: "\u65E0\u8BB0\u5F55",
      status: "\u6B63\u5E38",
      feat: "\u53F8\u6CD5\u6D89\u8BC9",
      detailTitle: "\u6D89\u8BC9\u8BB0\u5F55\uFF08\u8FD1 2 \u5E74\uFF09",
      cols: ["\u7C7B\u578B", "\u7ED3\u679C"],
      rows: [
        ["\u88AB\u6267\u884C", "\u65E0\u8BB0\u5F55"],
        ["\u5931\u4FE1\u540D\u5355", "\u65E0\u8BB0\u5F55"],
        ["\u5F00\u5EAD\u516C\u544A", "\u65E0\u8BB0\u5F55"]
      ]
    }
  ],
  zhixin: [
    {
      name: "\u5386\u53F2\u903E\u671F\u8BB0\u5F55",
      source: "\u4EBA\u884C\u5F81\u4FE1",
      window: "\u8FD1 2 \u5E74",
      value: "M3+ \u903E\u671F 1 \u6B21",
      status: "\u89E6\u53D1",
      feat: "\u8FD8\u6B3E\u8BB0\u5F55",
      detailTitle: "\u903E\u671F\u8BB0\u5F55\uFF08\u8FD1 2 \u5E74 \xB7 \u9010\u7B14\uFF09",
      cols: ["\u65E5\u671F", "\u8D26\u6237", "\u660E\u7EC6"],
      rows: [
        ["2024-09", "\u67D0\u94F6\u884C\u4FE1\u7528\u5361", "\u903E\u671F 95 \u5929\uFF08M3+\uFF09"],
        ["2024-12", "\u67D0\u6D88\u91D1", "\u903E\u671F 12 \u5929\uFF08M1\uFF09\u5DF2\u7ED3\u6E05"],
        ["2025-06", "\u67D0\u5E73\u53F0", "\u903E\u671F 5 \u5929\uFF08\u5DF2\u7ED3\u6E05\uFF09"]
      ]
    },
    {
      name: "\u8D1F\u503A\u6536\u5165\u6BD4",
      source: "\u5F81\u4FE1 + \u6536\u5165\u6D41\u6C34",
      window: "\u5F53\u524D",
      value: "58%\uFF08\u9608\u503C 70%\uFF09",
      status: "\u5173\u6CE8",
      feat: "\u8D1F\u503A\u7ED3\u6784",
      detailTitle: "\u8D1F\u503A\u6784\u6210\uFF08\u5F53\u524D\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u6708\u6536\u5165", "\xA518,000"],
        ["\u6708\u8FD8\u6B3E\u989D", "\xA510,440"],
        ["\u8D1F\u503A\u6536\u5165\u6BD4", "58%"],
        ["\u5728\u8D37\u4F59\u989D\u5408\u8BA1", "\xA561,500"]
      ]
    },
    {
      name: "\u5F81\u4FE1\u67E5\u8BE2\u9891\u6B21",
      source: "\u4EBA\u884C\u5F81\u4FE1",
      window: "\u8FD1 6 \u6708",
      value: "8 \u6B21\uFF08\u9608\u503C \u226510\uFF09",
      status: "\u6B63\u5E38",
      feat: "\u5F81\u4FE1\u884C\u4E3A",
      detailTitle: "\u5F81\u4FE1\u67E5\u8BE2\u8BB0\u5F55\uFF08\u8FD1 6 \u6708 \xB7 \u9010\u7B14\uFF09",
      cols: ["\u67E5\u8BE2\u65E5\u671F", "\u67E5\u8BE2\u673A\u6784", "\u67E5\u8BE2\u7C7B\u578B"],
      rows: [
        ["03-02", "\u67D0\u94F6\u884C", "\u8D37\u524D\u5BA1\u6279\uFF08\u4FE1\u7528\u5361\uFF09"],
        ["03-15", "\u67D0\u6D88\u8D39\u91D1\u878D", "\u8D37\u524D\u5BA1\u6279"],
        ["04-11", "\u67D0\u94F6\u884C", "\u8D37\u524D\u5BA1\u6279\uFF08\u8D37\u6B3E\uFF09"],
        ["05-06", "\u67D0\u6D88\u91D1", "\u8D37\u524D\u5BA1\u6279"],
        ["06-20", "\u672C\u4EBA", "\u672C\u4EBA\u67E5\u8BE2"],
        ["07-08", "\u67D0\u7F51\u8D37\u5E73\u53F0", "\u8D37\u524D\u5BA1\u6279"],
        ["07-22", "\u67D0\u94F6\u884C", "\u8D37\u540E\u7BA1\u7406"],
        ["08-02", "\u67D0\u6D88\u8D39\u91D1\u878D", "\u8D37\u540E\u7BA1\u7406"]
      ]
    },
    {
      name: "\u6536\u5165\u7A33\u5B9A\u6027",
      source: "\u94F6\u884C\u6D41\u6C34",
      window: "\u8FD1 12 \u6708",
      value: "\u8FDE\u7EED 14 \u6708\u7A33\u5B9A",
      status: "\u6B63\u5E38",
      feat: "\u6536\u5165\u7A33\u5B9A",
      detailTitle: "\u6536\u5165\u6D41\u6C34\uFF08\u8FD1 12 \u6708\u6C47\u603B\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u6708\u5747\u5165\u8D26", "\xA518,000\uFF08\u4EE3\u53D1\u5DE5\u8D44\uFF09"],
        ["\u8FDE\u7EED\u5165\u8D26\u6708\u6570", "14 \u4E2A\u6708"],
        ["\u5927\u989D\u5F02\u52A8", "\u65E0"]
      ]
    },
    {
      name: "\u804C\u4E1A\u5C5E\u6027",
      source: "\u7533\u8BF7\u4FE1\u606F",
      window: "\u5F53\u524D",
      value: "\u5236\u9020\u4E1A \xB7 \u5728\u804C",
      status: "\u6B63\u5E38",
      feat: "\u804C\u4E1A\u7A33\u5B9A",
      detailTitle: "\u804C\u4E1A\u4FE1\u606F\uFF08\u7533\u8BF7\u65F6\u70B9\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u5355\u4F4D", "\u67D0\u5236\u9020\u96C6\u56E2\uFF08\u5728\u804C 4 \u5E74\uFF09"],
        ["\u5C97\u4F4D", "\u751F\u4EA7\u7BA1\u7406"],
        ["\u793E\u4FDD\u7F34\u7EB3", "\u8FDE\u7EED 36 \u4E2A\u6708"]
      ]
    },
    {
      name: "\u53F8\u6CD5\u6D89\u8BC9",
      source: "\u53F8\u6CD5\u6570\u636E",
      window: "\u8FD1 2 \u5E74",
      value: "\u65E0\u8BB0\u5F55",
      status: "\u6B63\u5E38",
      feat: "\u53F8\u6CD5\u6D89\u8BC9",
      detailTitle: "\u6D89\u8BC9\u8BB0\u5F55\uFF08\u8FD1 2 \u5E74\uFF09",
      cols: ["\u7C7B\u578B", "\u7ED3\u679C"],
      rows: [
        ["\u88AB\u6267\u884C", "\u65E0\u8BB0\u5F55"],
        ["\u5931\u4FE1\u540D\u5355", "\u65E0\u8BB0\u5F55"]
      ]
    }
  ],
  zhirong: [
    {
      name: "\u6B3A\u8BC8\u7EF4\u5EA6\uFF08\u5F15\u7528\u667A\u5BDF\u5206\uFF09",
      source: "\u667A\u5BDF\u5206",
      window: "\u672C\u6B21\u8BC4\u5206",
      value: "\u6B3A\u8BC8\u5206 78",
      status: "\u89E6\u53D1",
      feat: "\u6B3A\u8BC8\u98CE\u9669",
      detailTitle: "\u667A\u5BDF\u5206\u5F15\u7528\uFF08\u672C\u6B21\u8BC4\u5206\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u6B3A\u8BC8\u5206", "78\uFF08\u9AD8\u98CE\u9669\u6863\uFF09"],
        ["\u4E3B\u8981\u89E6\u53D1", "\u591A\u5934\u501F\u8D37\u5F3A\u5EA6 28% \xB7 \u8BBE\u5907\u73AF\u5883\u98CE\u9669 22%"]
      ]
    },
    {
      name: "\u8FDD\u7EA6\u7EF4\u5EA6\uFF08\u5F15\u7528\u667A\u4FE1\u5206\uFF09",
      source: "\u667A\u4FE1\u5206",
      window: "\u672C\u6B21\u8BC4\u5206",
      value: "\u4FE1\u7528\u5206 688",
      status: "\u5173\u6CE8",
      feat: "\u4FE1\u7528\u98CE\u9669",
      detailTitle: "\u667A\u4FE1\u5206\u5F15\u7528\uFF08\u672C\u6B21\u8BC4\u5206\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u4FE1\u7528\u5206", "688\uFF08C \u6863 \xB7 \u4E00\u822C\uFF09"],
        ["\u4E3B\u8981\u6263\u5206\u9879", "\u5386\u53F2\u903E\u671F M3+ 1 \u6B21 \xB7 \u8D1F\u503A\u6536\u5165\u6BD4 58%"]
      ]
    },
    {
      name: "\u4EF7\u503C\u7EF4\u5EA6\uFF08\u501F\u8D37\u5174\u8DA3\uFF09",
      source: "\u884C\u4E3A\u6570\u636E",
      window: "\u8FD1 30 \u5929",
      value: "\u6D3B\u8DC3 18 \u5929",
      status: "\u6B63\u5E38",
      feat: "\u4EF7\u503C\u6F5C\u529B",
      detailTitle: "\u884C\u4E3A\u6D3B\u8DC3\uFF08\u8FD1 30 \u5929\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u6D3B\u8DC3\u5929\u6570", "18 / 30 \u5929"],
        ["\u504F\u597D\u4EA7\u54C1", "\u6D88\u8D39\u5206\u671F \xB7 \u73B0\u91D1\u5206\u671F"]
      ]
    },
    {
      name: "\u8D44\u4EA7\u7EF4\u5EA6",
      source: "\u8D44\u4EA7\u753B\u50CF",
      window: "\u5F53\u524D",
      value: "\u623F\u4EA7 + \u7406\u8D22\u6301\u4ED3",
      status: "\u6B63\u5E38",
      feat: "\u8D44\u4EA7\u5B9E\u529B",
      detailTitle: "\u8D44\u4EA7\uFF08\u5F53\u524D\uFF09",
      cols: ["\u9879", "\u503C"],
      rows: [
        ["\u623F\u4EA7", "\u81EA\u6709\u4F4F\u623F\uFF08\u6309\u63ED\u4E2D\uFF09"],
        ["\u7406\u8D22\u6301\u4ED3", "\xA580,000\uFF08\u8D27\u5E01\u57FA\u91D1\uFF09"]
      ]
    }
  ]
};
var REL_THEME = { company: "\u7ECF\u8425", device: "\u8BBE\u5907", person: "\u793E\u4EA4", contact: "\u793E\u4EA4" };
var RISK_MAP = { \u9AD8\u5371: "\u9AD8\u5371", \u4E2D: "\u5173\u6CE8", \u4F4E: "\u6B63\u5E38" };
function toRelationGraph(cust, prod) {
  const rels = (cust?.relations ?? []).filter((r) => relRelevance(r, prod));
  const nodes = [
    { id: "self", type: "self", name: cust?.name ?? "\u672C\u4EBA", rel: "\u672C\u4EBA" },
    ...rels.map((r) => ({
      id: r.id,
      type: r.type === "contact" ? "person" : r.type,
      name: r.name,
      rel: r.rel,
      risk: RISK_MAP[r.risk ?? ""],
      openAlerts: r.openAlerts
    }))
  ];
  const edges = rels.map((r) => ({
    source: "self",
    target: r.id,
    theme: REL_THEME[r.type] ?? "\u793E\u4EA4",
    rel: r.rel,
    danger: r.risk === "\u9AD8\u5371"
  }));
  const themeSet = /* @__PURE__ */ new Set(["\u7EFC\u5408"]);
  edges.forEach((e) => themeSet.add(e.theme));
  return { nodes, edges, themes: [...themeSet], collectedAt: "\u2014", source: "\u5173\u8054\u5173\u7CFB\uFF08\u6A21\u578B\u76F8\u5173\u56E0\u5B50\uFF09" };
}
function relRelevance(r, prod) {
  if (prod === "zhicha") {
    if (r.type === "device") return { impact: "\u62C9\u9AD8", desc: "\u8BBE\u5907/\u7F51\u7EDC\u5173\u8054\uFF08\u53CD\u6B3A\u8BC8\u5165\u6A21\uFF09" };
    if (r.type === "company" && r.risk === "\u9AD8\u5371") return { impact: "\u62C9\u9AD8", desc: "\u9AD8\u5371\u5B9E\u4F53 \xB7 \u9ED1\u4EA7\u5173\u8054" };
    if (r.rel.includes("\u5171\u501F") || r.rel.includes("\u62C5\u4FDD")) return { impact: "\u62C9\u9AD8", desc: "\u5171\u501F/\u62C5\u4FDD\uFF08\u6B3A\u8BC8\u4F20\u5BFC\u5019\u9009\uFF09" };
    if (r.type === "contact") return { impact: "\u62C9\u9AD8", desc: "\u8054\u7CFB\u4EBA\u98CE\u9669\u4F20\u5BFC\uFF08\u5019\u9009\uFF09" };
    return null;
  }
  if (prod === "zhixin") {
    if (r.rel.includes("\u5171\u501F") || r.rel.includes("\u62C5\u4FDD")) return { impact: "\u62C9\u4F4E", desc: "\u5171\u503A/\u62C5\u4FDD\u98CE\u9669\u4F20\u5BFC\uFF08\u5165\u6A21\uFF09" };
    if (r.type === "company") return { impact: "\u62C9\u4F4E", desc: "\u7ECF\u8425\u98CE\u9669\uFF08\u5173\u8054\u4F01\u4E1A\uFF09" };
    if (r.type === "contact") return { impact: "\u62C9\u4F4E", desc: "\u8054\u7CFB\u4EBA\u98CE\u9669\u4F20\u5BFC" };
    return null;
  }
  if (r.type === "device") return { impact: "\u62C9\u4F4E", desc: "\u7ECF\u667A\u5BDF\u5206\u95F4\u63A5\u5F71\u54CD\xB7\u8BBE\u5907\u5173\u8054" };
  if (r.type === "company") return { impact: "\u62C9\u4F4E", desc: r.risk === "\u9AD8\u5371" ? "\u7ECF\u667A\u5BDF\u5206\xB7\u9AD8\u5371\u5B9E\u4F53\u9ED1\u4EA7\u5173\u8054" : "\u7ECF\u667A\u4FE1\u5206\xB7\u7ECF\u8425\u98CE\u9669" };
  if (r.rel.includes("\u5171\u501F") || r.rel.includes("\u62C5\u4FDD")) return { impact: "\u62C9\u4F4E", desc: "\u7ECF\u667A\u4FE1\u5206\xB7\u5171\u503A/\u62C5\u4FDD\u4F20\u5BFC" };
  if (r.type === "contact") return { impact: "\u62C9\u4F4E", desc: "\u7ECF\u667A\u4FE1\u5206\xB7\u8054\u7CFB\u4EBA\u4F20\u5BFC" };
  return null;
}
var ALERT_MODEL = {
  \u8BBE\u5907\u5F02\u5E38: "zhicha",
  \u53CD\u6B3A\u8BC8\u547D\u4E2D: "zhicha",
  \u591A\u5934\u501F\u8D37: "zhicha",
  \u884C\u4E3A\u8BC4\u5206\u4E0B\u964D: "zhicha",
  \u8206\u60C5\u8D1F\u9762: "zhicha",
  \u8D1F\u503A\u6FC0\u589E: "zhixin",
  \u903E\u671F\u9884\u8B66: "zhixin",
  \u53F8\u6CD5\u6D89\u8BC9: "zhixin",
  \u8FD8\u6B3E\u80FD\u529B\u4E0D\u8DB3: "zhixin",
  \u56DE\u8BBF\u5931\u8054: "zhixin",
  \u5173\u8054\u4F01\u4E1A\u98CE\u9669: "zhixin",
  \u63D0\u989D\u673A\u4F1A: "zhirong",
  \u9700\u6C42\u4E0A\u5347: "zhirong"
};
function alertModelOf(type) {
  return type ? ALERT_MODEL[type] ?? null : null;
}
function buildEvents(cust, calcedAt, prod) {
  const ev = [];
  (cust.modelScoreHistory ?? []).forEach((p) => {
    const v = p[prod];
    if (v != null) ev.push({
      time: p.month,
      tag: "\u8BC4\u5206",
      text: `${PROD_META[prod].label}\u8BC4\u5206\uFF1A${v} \u5206\uFF08\u6708\u5EA6\u5FEB\u7167\uFF09`,
      kind: "cyan"
    });
  });
  (cust.alerts ?? []).forEach((a) => ev.push({
    time: a.time,
    tag: a.level === "RED" ? "\u9884\u8B66" : a.level === "OPPORTUNITY" ? "\u673A\u4F1A" : "\u9884\u8B66",
    text: `${a.scene}\uFF08${a.ruleName}\uFF09\u89E6\u53D1 \xB7 \u5F53\u524D${a.status}`,
    kind: a.level === "RED" ? "red" : a.level === "YELLOW" ? "amber" : "green"
  }));
  (cust.disposes ?? []).forEach((d) => ev.push({
    time: d.time,
    tag: "\u5904\u7F6E",
    text: `${d.action}\uFF1A${d.result}${d.note ? `\uFF08${d.note}\uFF09` : ""}`,
    kind: "blue"
  }));
  (cust.approvalRecords ?? []).forEach((r) => ev.push({
    time: r.time,
    tag: "\u5BA1\u6279",
    text: `${r.kind} \xB7 ${r.result}\uFF08${r.opinion}\uFF09\xB7 ${r.operator}`,
    kind: "green"
  }));
  (cust.externalChecks ?? []).forEach((c) => ev.push({
    time: calcedAt,
    tag: "\u6838\u9A8C",
    text: `\u5916\u90E8\u6838\u9A8C \xB7 ${c.category}\xB7${c.item} \u2192 ${c.result}\uFF08${c.status}\uFF09`,
    kind: "amber"
  }));
  return ev.sort((a, b) => b.time.localeCompare(a.time));
}
function EventLine({ ev }) {
  const tagColor = { red: "#DC2626", amber: "#D97706", blue: "#185FA5", cyan: "#0891B2", green: "#16A34A" };
  return /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: "1px dashed #F1F5F9" }, children: [
    /* @__PURE__ */ jsx10("span", { style: { fontSize: 11, color: "#fff", background: tagColor[ev.kind], borderRadius: 6, padding: "2px 8px", flexShrink: 0 }, children: ev.tag }),
    /* @__PURE__ */ jsx10("span", { style: { fontSize: 12, color: "#94A3B8", width: 90, flexShrink: 0, fontVariantNumeric: "tabular-nums" }, children: ev.time }),
    /* @__PURE__ */ jsx10("span", { style: { fontSize: 12.5, color: "#334155", lineHeight: 1.6 }, children: ev.text })
  ] });
}
var TABS = [
  { key: "score", label: "\u6A21\u578B\u5206" },
  { key: "graph", label: "\u5173\u8054\u56FE\u8C31" },
  { key: "alert", label: "\u9884\u8B66\u5904\u7F6E" },
  { key: "data", label: "\u7528\u6237\u6570\u636E" },
  { key: "model", label: "\u6A21\u578B\u4FE1\u606F" }
];
function CustScoreDetail() {
  const [params] = useSearchParams();
  const custId = params.get("cust") ?? "";
  const prodParam = params.get("prod") ?? "zhicha";
  const prod = PROD_KEYS.includes(prodParam) ? prodParam : "zhicha";
  const fromAlertId = params.get("id") ?? "";
  const backParam = params.get("back");
  const backTarget = backParam ? decodeURIComponent(backParam) : null;
  const source = params.get("source") ?? void 0;
  const nav = useNavigate();
  const customers2 = useMidCustomers();
  const globalAlerts = useMidAlerts();
  const [tab, setTab] = useState9("score");
  const [openInput, setOpenInput] = useState9({});
  const [graphTheme, setGraphTheme] = useState9("\u7EFC\u5408");
  const [sel, setSel] = useState9(null);
  const cust = useMemo5(
    () => customers2.find((c) => c.custId === custId) ?? customers2[0],
    [customers2, custId]
  );
  const meta = PROD_META[prod];
  const item = useMemo5(() => {
    if (!cust) return null;
    const raw = cust.scores?.[prod] ?? deriveFallback(cust, prod);
    return raw ? enrich(raw, prod) : null;
  }, [cust, prod]);
  const backTo = () => nav(backTarget ?? "/console/cr/mid-single-cust?cust=" + custId + (fromAlertId ? "&id=" + fromAlertId : "") + (source ? "&source=sc" : ""));
  const reg = models.find((m) => m.id === PROD_TO_MODEL[prod]) ?? {};
  const capa = MODEL_CAPA[prod];
  const history = cust?.modelScoreHistory ?? [];
  const isFraud = prod === "zhicha";
  const data2 = useScore();
  const gModel = data2.models.find((x) => x.prod === prod) ?? data2.models[0];
  const nodeResults = useMemo5(() => {
    if (!cust || !item) return {};
    const alerts3 = cust.alerts ?? [];
    const rels = cust.relations ?? [];
    const dims2 = cust.riskDims ?? [];
    const nonOpp = alerts3.filter((a) => a.level !== "OPPORTUNITY");
    const opp = alerts3.filter((a) => a.level === "OPPORTUNITY");
    const detailVal = (name) => {
      const d = INPUT_DETAILS[prod].find((x) => x.name === name);
      return d ? `${d.value}${d.status !== "\u6B63\u5E38" ? " \xB7 " + d.status : ""}` : null;
    };
    const r = {};
    if (prod === "zhixin") {
      r.s1 = "\u8FDB\u4EF6 13 \u5B57\u6BB5\u5DF2\u91C7\u96C6 \xB7 \u5F81\u4FE1\u5DF2\u8C03\u53D6";
      r.g1 = `\u5173\u8054\u5B9E\u4F53 ${rels.length} \u4E2A${rels.some((x) => x.ringId) ? " \xB7 \u56E2\u4F19\u8BC6\u522B\u547D\u4E2D" : " \xB7 \u672A\u5165\u56E2\u4F19"}`;
      r.f1 = `util ${detailVal("\u4FE1\u7528\u5361\u5DF2\u7528/\u603B\u989D\u5EA6") ?? "43%"} \xB7 dti ${detailVal("\u6708\u4F9B/\u6708\u6536\u5165") ?? "58%"}`;
      r.b1 = cust.alerts?.some((a) => a.scene.includes("\u5931\u4FE1")) ? "\u547D\u4E2D\u5931\u4FE1\u540D\u5355 \u2192 \u62E6\u622A" : "\u672A\u547D\u4E2D\u5931\u4FE1 \u2192 \u653E\u884C";
      r.m1 = `\u57FA\u7840\u5206 600 + \u56E0\u5B50\u52A0\u5206 = ${item.score}`;
      r.r1 = nonOpp.length ? `\u547D\u4E2D\u4E3B\u7EBF\u89C4\u5219 ${nonOpp.length} \u6761 \u2192 \u6263\u5206` : "\u672A\u547D\u4E2D\u6263\u5206\u89C4\u5219 \u2192 \u7EF4\u6301";
      r.w1 = nonOpp.length ? `\u4E3B\u7EBF\u884D\u751F\u9884\u8B66 ${nonOpp.length} \u6761` : "\u4E3B\u7EBF\u9884\u8B66\u672A\u89E6\u53D1";
      r.k1 = `${item.grade ?? "\u2014"}${item.gradeLabel ? " \xB7 " + item.gradeLabel : ""}`;
      r.a1 = opp.length ? `\u5E76\u884C\u9884\u8B66 ${opp.length} \u6761` : "\u5E76\u884C\u9884\u8B66\u672A\u89E6\u53D1";
      r.o1 = `\u667A\u4FE1\u5206 ${item.score} \u2192 ${item.grade ?? "\u2014"}`;
    } else if (prod === "zhicha") {
      r.s1 = detailVal("\u8FD130\u5929\u7533\u8D37\u7B14\u6570") ?? "\u2014";
      r.s2 = detailVal("\u8BBE\u5907\u73AF\u5883") ?? "\u2014";
      r.s3 = detailVal("\u9ED1\u540D\u5355\u547D\u4E2D") ?? "\u2014";
      r.s4 = detailVal("\u540C\u65F6\u5728\u8D37\u5E73\u53F0\u6570") ?? "\u2014";
      r.m1 = `XGBoost \u6B3A\u8BC8\u6982\u7387 ${item.probability ?? "\u2014"}`;
      r.r1 = nonOpp.length ? `\u547D\u4E2D ${nonOpp.length} \u6761\u53CD\u6B3A\u8BC8\u89C4\u5219 \u2192 \u4FEE\u6B63\u540E ${item.score} \u5206` : `\u672A\u547D\u4E2D\u53CD\u6B3A\u8BC8\u89C4\u5219 \u2192 \u6A21\u578B\u8F93\u51FA ${item.score} \u5206`;
      r.r2 = detailVal("\u540C\u8BBE\u5907\u5173\u8054\u8D26\u53F7") ?? "\u2014";
      r.c1 = nonOpp.length ? `\u51B2\u7A81\u88C1\u51B3 \u2192 \u751F\u6210\u300C${(nonOpp.find((a) => a.level === "RED") ?? nonOpp[0]).scene}\u300D${nonOpp.length > 1 ? `\u7B49 ${nonOpp.length} \u6761` : ""}\u9884\u8B66` : "\u65E0\u89C4\u5219\u51B2\u7A81";
      r.d1 = `\u843D\u5165 ${riskBand("zhicha", item.score).range} \u6863`;
      r.o1 = `\u667A\u5BDF\u5206 ${item.score} \u2192 ${item.grade ?? "\u2014"}`;
    } else {
      r.s1 = `\u4FE1\u7528\u5B50\u5206 ${cust.scores?.zhixin?.score ?? item.score}`;
      r.s2 = detailVal("\u8FD130\u5929\u6D3B\u8DC3\u5929\u6570") ?? "\u2014";
      r.s3 = detailVal("\u6D3B\u52A8\u54CD\u5E94\u6B21\u6570") ?? "\u2014";
      r.s4 = detailVal("\u7406\u8D22\u6301\u4ED3") ?? "\u2014";
      r.s5 = `\u6B3A\u8BC8\u5B50\u5206 ${cust.scores?.zhicha?.score ?? "\u2014"}`;
      r.m1 = `0.34 \xD7 \u4FE1\u7528\u5B50\u5206 = ${((cust.scores?.zhixin?.score ?? 700) / 1e3 * 0.34).toFixed(3)}`;
      r.m2 = "0.24/0.18/0.24 \u52A0\u6743";
      r.f1 = `\u52A0\u6743\u878D\u5408 \u2192 ${item.score}`;
      r.r1 = nonOpp.length ? `\u547D\u4E2D\u4FE1\u7528\u89C4\u5219 ${nonOpp.length} \u6761 \u2192 \u6263\u5206` : "\u672A\u547D\u4E2D\u6263\u5206\u89C4\u5219 \u2192 \u7EF4\u6301";
      r.c1 = opp.length ? `\u8DE8\u6A21\u578B\u78B0\u649E \u2192 ${opp[0].scene}` : "\u65E0\u51B2\u7A81\u88C1\u51B3";
      r.d1 = `\u843D\u5165 ${riskBand("zhirong", item.score).range} \u6863`;
      r.o1 = `\u667A\u878D\u5206 ${item.score} \u2192 ${item.grade ?? "\u2014"}`;
    }
    return r;
  }, [cust, item, prod]);
  const graphRelevant = useMemo5(
    () => (cust?.relations ?? []).filter((r) => relRelevance(r, prod)).map((r) => ({ name: r.name, ...relRelevance(r, prod) })),
    [cust, prod]
  );
  const relationGraph = useMemo5(() => toRelationGraph(cust, prod), [cust, prod]);
  const nodeMap = useMemo5(() => Object.fromEntries(relationGraph.nodes.map((n) => [n.id, n])), [relationGraph]);
  if (!cust || !item) {
    return /* @__PURE__ */ jsxs10("div", { style: { padding: 24 }, children: [
      /* @__PURE__ */ jsx10(PageShell, { header: /* @__PURE__ */ jsx10(DetailHeader, { title: "\u5F97\u5206\u8BE6\u60C5", crumb: (source ? "\u8BC4\u5206\u4EA7\u54C1" : "\u8D37\u4E2D\u76D1\u63A7") + " / \u5355\u5BA2\u8BE6\u60C5 / \u5F97\u5206\u8BE6\u60C5", backLabel: "\u2190 \u8FD4\u56DE\u5355\u5BA2\u8BE6\u60C5", onBack: backTo }) }),
      /* @__PURE__ */ jsx10(Panel, { title: "\u6682\u65E0\u8BC4\u5206\u6570\u636E", desc: "\u8BE5\u5BA2\u6237\u6CA1\u6709\u6A21\u578B\u8BC4\u5206\u5FEB\u7167", children: /* @__PURE__ */ jsx10("div", { style: { fontSize: 13, color: "#94A3B8", padding: "16px 0" }, children: "\u8BF7\u8FD4\u56DE\u5355\u5BA2\u8BE6\u60C5\u9875\u67E5\u770B\u5176\u5B83\u677F\u5757\u3002" }) })
    ] });
  }
  const band = riskBand(prod, item.score);
  const scoreColor = band.color;
  const gradeBadgeKind = band.level === "\u9AD8\u98CE\u9669" || band.level === "D" ? "red" : band.level === "\u4E2D\u98CE\u9669" || band.level === "C" ? "amber" : "green";
  const dims = dimsOf(prod, cust.riskDims ?? []);
  const nonOppCount = (cust.alerts ?? []).filter((a) => a.level !== "OPPORTUNITY").length;
  const gap = nextUpgrade(prod, item.score);
  const scoreNote = isFraud ? `\u6A21\u578B\u5148\u8F93\u51FA\u6B3A\u8BC8\u6982\u7387 ${item.probability}\uFF0C\u518D\u7ECF\u89C4\u5219\u4FEE\u6B63\uFF08\u547D\u4E2D ${nonOppCount} \u6761\u53CD\u6B3A\u8BC8\u89C4\u5219\uFF09\u5F97\u5230\u6700\u7EC8\u5206 ${item.score}\u3002\u6982\u7387\u4E0E\u5F97\u5206\u540C\u6E90\u4E0D\u540C\u53E3\u5F84\u3002` : `\u57FA\u7840\u5206\u53E0\u52A0\u5404\u7EF4\u5EA6\u52A0\u6743\uFF08\u6743\u91CD\u89C1\u53F3\u680F\uFF09\u5F97\u5230\u6700\u7EC8\u5206 ${item.score}\uFF1B\u7EF4\u5EA6\u5F97\u5206\u6765\u6E90\u89C1\u53F3\u680F\u6807\u6CE8\u3002`;
  const allEvents = buildEvents(cust, item?.calcedAt ?? "", prod);
  const custGlobalAlerts = globalAlerts.filter((a) => a.cust_id === cust.custId);
  const alertCards = custGlobalAlerts.filter((a) => alertModelOf(a.alert_type) === prod);
  const otherAlerts = custGlobalAlerts.filter((a) => alertModelOf(a.alert_type) !== prod);
  const flow = alertCards.find((a) => a.flowKey) ?? custGlobalAlerts.find((a) => a.flowKey);
  const goAlertDetail = (alertId) => {
    if (alertId) nav("/console/cr/mid-alert-detail?id=" + alertId);
  };
  const hist = history.filter((p) => p[prod] != null);
  const lastScore = hist.length ? hist[hist.length - 1][prod] : null;
  const prevScore = hist.length > 1 ? hist[hist.length - 2][prod] : null;
  const delta = lastScore != null && prevScore != null ? lastScore - prevScore : null;
  let trend = null;
  if (hist.length >= 3) {
    const vals = hist.slice(-3).map((p) => p[prod]);
    const peak = Math.max(...vals);
    const trough = Math.min(...vals);
    const swing = peak - trough;
    const dirUp = lastScore > prevScore;
    const touchedRiskLine = isFraud ? peak >= 70 : false;
    const bigSwing = swing >= (isFraud ? 15 : 80);
    const worsened = isFraud ? dirUp || touchedRiskLine : !dirUp || bigSwing;
    const note = touchedRiskLine ? "\uFF08\u66FE\u89E6\u53CA\u9AD8\u98CE\u9669\u7EBF\uFF09" : bigSwing ? "\uFF08\u533A\u95F4\u5185\u6CE2\u52A8\u660E\u663E\uFF09" : "";
    trend = worsened ? { t: "\u8FD1 3 \u6708\u98CE\u9669" + (isFraud ? "\u4E0A\u5347" : "\u6076\u5316") + note, c: "#DC2626" } : { t: "\u8FD1 3 \u6708\u98CE\u9669\u8D8B\u7A33 / \u5411\u597D", c: "#16A34A" };
  }
  const custTags = [];
  if (cust.riskLevel) custTags.push({ label: cust.riskLevel, kind: cust.riskLevel === "\u9AD8\u98CE\u9669" ? "red" : cust.riskLevel === "\u4E2D\u98CE\u9669" ? "amber" : "green" });
  if ((cust.alerts ?? []).some((a) => a.level === "RED")) custTags.push({ label: "\u8D37\u4E2D\u9884\u8B66", kind: "red" });
  if ((cust.alerts ?? []).some((a) => a.scene.includes("\u903E\u671F") || a.ruleName.includes("\u903E\u671F"))) custTags.push({ label: "\u903E\u671F", kind: "amber" });
  if ((cust.alerts ?? []).some((a) => a.scene.includes("\u8D1F\u503A") || a.scene.includes("\u591A\u5934"))) custTags.push({ label: "\u5171\u503A\u5ACC\u7591", kind: "amber" });
  custTags.push({ label: "\u6A21\u578B\u8BC4\u5206", kind: "gray" });
  const scoreOf = (k) => {
    if (cust.scores?.[k]?.score != null) return cust.scores[k].score;
    const d = deriveFallback(cust, k);
    return d ? d.score : null;
  };
  const infoRow = (label, value, strong) => /* @__PURE__ */ jsxs10("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9", padding: "9px 0" }, children: [
    /* @__PURE__ */ jsx10("span", { style: { color: "#64748B" }, children: label }),
    /* @__PURE__ */ jsx10("span", { style: strong ? { fontWeight: 700, color: "#1E293B" } : { color: "#334155" }, children: value })
  ] });
  return /* @__PURE__ */ jsxs10("div", { style: { padding: 24, maxWidth: 1160 }, children: [
    /* @__PURE__ */ jsx10(PageShell, { header: /* @__PURE__ */ jsx10(DetailHeader, { title: `${meta.label} \xB7 ${cust.name}`, crumb: (source ? "\u8BC4\u5206\u4EA7\u54C1" : "\u8D37\u4E2D\u76D1\u63A7") + " / \u5355\u5BA2\u8BE6\u60C5 / \u5F97\u5206\u8BE6\u60C5", subtitle: `\u5BA2\u6237\u53F7 ${cust.custId} \uFF5C \u4EA7\u54C1 ${cust.product ?? ""} \uFF5C \u8BC1\u4EF6\u53F7 ${cust.idCard}`, backLabel: "\u2190 \u8FD4\u56DE\u5355\u5BA2\u8BE6\u60C5", onBack: backTo, sticky: false }) }),
    /* @__PURE__ */ jsxs10("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs10("div", { style: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: "12px 16px" }, children: [
        /* @__PURE__ */ jsxs10("div", { style: { flex: "1 1 340px", minWidth: 0 }, children: [
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 15, fontWeight: 700, color: "#1E293B" }, children: [
            cust.name,
            custTags.map((t) => /* @__PURE__ */ jsx10(Badge, { kind: t.kind, children: t.label }, t.label))
          ] }),
          /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12, color: "#64748B", marginTop: 6, lineHeight: 1.7 }, children: [
            "\u5BA2\u6237\u53F7 ",
            cust.custId,
            " \uFF5C \u4EA7\u54C1 ",
            cust.product ?? "\u2014",
            " \uFF5C \u8BC1\u4EF6\u53F7 ",
            cust.idCard,
            " \uFF5C \u8D37\u6B3E\u72B6\u6001 ",
            cust.loanStatus ?? "\u2014",
            " \uFF5C \u6570\u636E\u6765\u6E90 ",
            /* @__PURE__ */ jsx10(Sam, { label: "\u6837\u4F8B", value: "midCustomers.json" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs10("div", { style: { flexShrink: 0 }, children: [
          /* @__PURE__ */ jsx10("div", { style: { fontSize: 11, color: "#94A3B8", marginBottom: 6 }, children: "\u6A21\u578B\u8BC4\u5206\u5FEB\u6377\u5165\u53E3" }),
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }, children: [
            PROD_KEYS.map((k) => {
              const m = PROD_META[k];
              const s = scoreOf(k);
              const active = k === prod;
              return /* @__PURE__ */ jsxs10(
                "button",
                {
                  type: "button",
                  title: `\u8FDB\u5165 ${m.label} \u5F97\u5206\u9875\u9762`,
                  onClick: () => nav("/console/cr/mid-cust-score?cust=" + custId + "&prod=" + k + (fromAlertId ? "&id=" + fromAlertId : "") + (backTarget ? "&back=" + encodeURIComponent(backTarget) : source ? "&source=sc" : "")),
                  style: {
                    border: active ? "1.5px solid " + m.color : "1px solid #E2E8F0",
                    background: active ? m.color + "0f" : "#fff",
                    borderRadius: 8,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 5
                  },
                  children: [
                    /* @__PURE__ */ jsx10("span", { style: { width: 6, height: 6, borderRadius: 999, background: m.color } }),
                    /* @__PURE__ */ jsx10("span", { style: { fontWeight: active ? 600 : 500, color: active ? m.color : "#475569" }, children: m.label }),
                    /* @__PURE__ */ jsx10("b", { style: { color: "#334155", fontVariantNumeric: "tabular-nums" }, children: s ?? "\u2014" })
                  ]
                },
                k
              );
            }),
            /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12, color: "#64748B", borderLeft: "1px solid #E2E8F0", paddingLeft: 12, marginLeft: 4 }, children: [
              "\u989D\u5EA6\u5EFA\u8BAE ",
              /* @__PURE__ */ jsx10("b", { style: { color: "#6D28D9" }, children: cust.scores?.limitSuggest ?? "\u2014" }),
              cust.scores?.limit ? /* @__PURE__ */ jsxs10("span", { style: { color: "#94A3B8" }, children: [
                " / \xA5",
                cust.scores.limit.toLocaleString()
              ] }) : null
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx10("div", { style: { position: "sticky", top: 56, zIndex: 30, background: "#fff", borderBottom: "1px solid #E2E8F0", margin: "12px 0 0", padding: "6px 2px 0", display: "flex", gap: 2 }, children: TABS.map((t) => /* @__PURE__ */ jsx10(
        "button",
        {
          type: "button",
          onClick: () => setTab(t.key),
          style: {
            padding: "9px 16px",
            fontSize: 13.5,
            cursor: "pointer",
            background: "none",
            border: "none",
            borderBottom: tab === t.key ? "2px solid #1E293B" : "2px solid transparent",
            color: tab === t.key ? "#1E293B" : "#64748B",
            fontWeight: tab === t.key ? 600 : 400
          },
          children: t.label
        },
        t.key
      )) }),
      tab === "score" && /* @__PURE__ */ jsxs10(Fragment8, { children: [
        /* @__PURE__ */ jsx10(Panel, { title: "\u6A21\u578B\u5206\u6982\u89C8", desc: "\u6A21\u578B\u8BC4\u5206\u5FEB\u7167 + \u7EF4\u5EA6\u62C6\u89E3", children: /* @__PURE__ */ jsxs10("div", { className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]", children: [
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }, children: [
            /* @__PURE__ */ jsxs10("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }, children: [
              /* @__PURE__ */ jsx10("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }, children: "\u603B\u5206" }),
              /* @__PURE__ */ jsx10(ScoreGauge, { value: item.score, min: item.range[0], max: item.range[1], label: `${item.unit}\uFF08${item.range[0]}-${item.range[1]}\uFF09`, color: meta.color, hint: void 0 }),
              /* @__PURE__ */ jsx10("div", { style: { fontSize: 11.5, color: "#94A3B8", marginTop: 2 }, children: isFraud ? "\u5206\u6570\u8D8A\u9AD8\uFF0C\u6B3A\u8BC8\u98CE\u9669\u8D8A\u5927" : "\u5206\u6570\u8D8A\u9AD8\uFF0C\u8868\u73B0\u8D8A\u597D" })
            ] }),
            /* @__PURE__ */ jsxs10("div", { style: { flex: 1, minWidth: 240, fontSize: 13 }, children: [
              infoRow("\u5F53\u524D\u5F97\u5206", /* @__PURE__ */ jsx10("b", { style: { fontSize: 18, color: scoreColor, fontVariantNumeric: "tabular-nums" }, children: item.score })),
              infoRow("\u98CE\u9669\u7B49\u7EA7", /* @__PURE__ */ jsxs10(Badge, { kind: gradeBadgeKind, children: [
                item.grade,
                item.gradeLabel ? ` \xB7 ${item.gradeLabel}` : ""
              ] })),
              infoRow(isFraud ? "\u6B3A\u8BC8\u6982\u7387" : "\u8FDD\u7EA6\u6982\u7387", item.probability),
              infoRow("\u6A21\u578B\u7248\u672C", item.modelVersion),
              infoRow("\u8BC4\u5206\u65F6\u95F4", item.calcedAt),
              infoRow("\u6240\u5904\u6863\u4F4D", /* @__PURE__ */ jsxs10("span", { style: { fontSize: 12 }, children: [
                /* @__PURE__ */ jsx10("b", { style: { color: scoreColor }, children: band.range }),
                " \xB7 ",
                band.level
              ] })),
              /* @__PURE__ */ jsx10("div", { style: { fontSize: 11.5, color: "#64748B", marginTop: 2, paddingLeft: 2 }, children: gap ? `\u8DDD\u300C${gap.toLevel}\u300D\u8FD8\u5DEE ${gap.gap} \u5206` : /* @__PURE__ */ jsx10("span", { style: { color: "#16A34A" }, children: "\u5DF2\u5904\u4E8E\u6700\u4F18\u6863\u4F4D" }) }),
              /* @__PURE__ */ jsxs10("div", { style: { fontSize: 11.5, color: "#64748B", marginTop: 8, lineHeight: 1.65, borderTop: "1px dashed #F1F5F9", paddingTop: 8 }, children: [
                "\u8BF4\u660E\uFF1A",
                scoreNote
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs10("div", { style: { minWidth: 0, display: "flex", flexDirection: "column" }, children: [
            /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 8 }, children: [
              "\u7EF4\u5EA6\u62C6\u89E3 ",
              /* @__PURE__ */ jsx10("span", { style: { fontSize: 11, fontWeight: 400, color: "#94A3B8" }, children: "\u6A21\u578B\u7EF4\u5EA6\u5F97\u5206 0-100 \xB7 \u6743\u91CD\u6765\u81EA\u6A21\u578B\u4FE1\u606F" })
            ] }),
            /* @__PURE__ */ jsx10("div", { style: { flex: 1, border: "1px solid #F1F5F9", borderRadius: 10, padding: "2px 12px" }, children: dims.map((d, i) => {
              const lvl = d.lvl;
              return /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: "10px 0", borderBottom: i < dims.length - 1 ? "1px dashed #F1F5F9" : "none" }, children: [
                /* @__PURE__ */ jsx10("span", { style: { width: 88, flexShrink: 0, color: "#334155", fontWeight: 600 }, children: d.dim }),
                /* @__PURE__ */ jsx10("div", { style: { flex: 1, height: 6, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }, children: /* @__PURE__ */ jsx10("div", { style: { width: `${Math.min(d.score, 100)}%`, height: "100%", background: LEVEL_COLOR[lvl], borderRadius: 999 } }) }),
                /* @__PURE__ */ jsx10("span", { style: { width: 26, textAlign: "right", color: "#475569", fontVariantNumeric: "tabular-nums" }, children: d.score }),
                /* @__PURE__ */ jsxs10("span", { style: { width: 38, textAlign: "right", color: "#94A3B8", fontSize: 11 }, children: [
                  d.importance,
                  "%"
                ] }),
                /* @__PURE__ */ jsx10("span", { style: { width: 30, textAlign: "right", fontSize: 10, color: d.src === "\u5B9E\u6D4B" ? "#0891B2" : "#94A3B8" }, title: d.src === "\u5B9E\u6D4B" ? "\u6765\u81EA\u5BA2\u6237\u98CE\u9669\u7EF4\u5EA6\u5B9E\u6D4B\u503C" : "\u7F3A\u5B9E\u6D4B\u503C\uFF0C\u4F7F\u7528\u6A21\u578B\u515C\u5E95\u7EBF", children: d.src }),
                /* @__PURE__ */ jsx10(Badge, { kind: lvl === "\u9AD8" ? "red" : lvl === "\u4E2D" ? "amber" : "green", children: lvl })
              ] }, i);
            }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs10(Panel, { title: "\u6A21\u578B\u5206\u8D8B\u52BF", desc: "\u8D37\u4E2D\u91CD\u8BC4\u8F68\u8FF9\u4E0E\u5F71\u54CD\u4E8B\u4EF6", children: [
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 14 }, children: [
            /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "baseline", gap: 8 }, children: [
              /* @__PURE__ */ jsx10("span", { style: { fontSize: 11, color: "#94A3B8" }, children: "\u6700\u65B0\u5F97\u5206" }),
              /* @__PURE__ */ jsx10("span", { style: { fontSize: 30, fontWeight: 800, color: scoreColor, fontVariantNumeric: "tabular-nums", lineHeight: 1 }, children: lastScore ?? "\u2014" }),
              delta != null && /* @__PURE__ */ jsxs10("span", { style: { fontSize: 13, fontWeight: 700, color: (isFraud ? delta > 0 : delta < 0) ? "#DC2626" : "#16A34A" }, children: [
                delta > 0 ? "\u25B2" : delta < 0 ? "\u25BC" : "\uFF1D",
                " ",
                Math.abs(delta)
              ] })
            ] }),
            /* @__PURE__ */ jsx10("div", { style: { fontSize: 12, color: "#64748B" }, children: prevScore != null ? `\u8F83\u4E0A\u6B21\u91CD\u8BC4\uFF08${hist[hist.length - 2]?.month ?? ""} \xB7 ${prevScore} \u5206\uFF09` : "\u5C1A\u65E0\u5386\u53F2\u5BF9\u6BD4" }),
            (() => {
              const trig = [...cust.alerts ?? []].filter((a) => a.level !== "OPPORTUNITY").sort((a, b) => String(b.time).localeCompare(String(a.time)))[0];
              return /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12, color: "#64748B", marginTop: 2 }, children: [
                "\u91CD\u8BC4\u89E6\u53D1\uFF1A",
                trig ? `${trig.scene}\uFF08${trig.ruleName} \xB7 ${trig.time}\uFF09` : "\u5468\u671F\u6027\u6708\u5EA6\u91CD\u8BC4"
              ] });
            })(),
            trend && /* @__PURE__ */ jsx10(Badge, { kind: trend.c === "#DC2626" ? "red" : "green", children: trend.t })
          ] }),
          history.length ? /* @__PURE__ */ jsx10(
            LineChart,
            {
              labels: history.map((p) => p.month),
              series: [{ name: meta.label, color: meta.color, data: history.map((p) => p[prod]) }],
              unit: "\u5206",
              height: 200
            }
          ) : /* @__PURE__ */ jsx10("div", { style: { fontSize: 13, color: "#94A3B8", padding: "6px 0" }, children: "\u6682\u65E0\u91CD\u8BC4\u8F68\u8FF9\uFF08\u8D37\u4E2D\u91CD\u8BC4\u8BB0\u5F55\u968F\u9884\u8B66/\u5904\u7F6E\u751F\u6210\u540E\u7559\u75D5\uFF09\u3002" }),
          /* @__PURE__ */ jsxs10("div", { style: { fontSize: 11.5, color: "#94A3B8", marginTop: 6 }, children: [
            "\u7EB5\u8F74\uFF1A",
            meta.label,
            "\uFF08",
            isFraud ? "0\u2013100\uFF0C\u8D8A\u9AD8\u6B3A\u8BC8\u98CE\u9669\u8D8A\u5927" : item.range[0] + "\u2013" + item.range[1] + "\uFF0C\u8D8A\u9AD8\u8868\u73B0\u8D8A\u597D",
            "\uFF09\uFF5C\u73AF\u6BD4\u5FBD\u6807\u6309\u300C\u6700\u65B0 vs \u4E0A\u6B21\u300D\u65B9\u5411\u5224\u5B9A\uFF0C\u5E76\u8BA1\u5165\u533A\u95F4\u5185\u662F\u5426\u89E6\u53CA\u98CE\u9669\u7EBF\u3002"
          ] }),
          (cust.alerts ?? []).filter((a) => a.level !== "OPPORTUNITY").length > 0 && /* @__PURE__ */ jsxs10(Fragment8, { children: [
            /* @__PURE__ */ jsx10("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "12px 0 8px" }, children: "\u8FD1\u671F\u5F71\u54CD\u5F97\u5206\u7684\u4E8B\u4EF6" }),
            /* @__PURE__ */ jsx10("div", { className: "space-y-1.5", children: (cust.alerts ?? []).filter((a) => a.level !== "OPPORTUNITY").slice(0, 4).map((a, i) => /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, borderBottom: "1px dashed #F1F5F9", padding: "6px 0" }, children: [
              /* @__PURE__ */ jsx10("span", { style: { fontSize: 11, color: "#fff", background: a.level === "RED" ? "#DC2626" : "#D97706", borderRadius: 6, padding: "2px 8px" }, children: a.level === "RED" ? "\u7EA2" : "\u9EC4" }),
              /* @__PURE__ */ jsx10("span", { style: { color: "#94A3B8", width: 90, flexShrink: 0 }, children: a.time }),
              /* @__PURE__ */ jsxs10("span", { style: { color: "#334155", flex: 1 }, children: [
                a.scene,
                "\uFF08",
                a.ruleName,
                "\uFF09"
              ] }),
              /* @__PURE__ */ jsx10("span", { style: { color: a.level === "RED" ? "#DC2626" : "#D97706", flexShrink: 0 }, children: isFraud ? "\u62C9\u9AD8\u6B3A\u8BC8\u98CE\u9669" : "\u5F71\u54CD\u4FE1\u7528/\u7EFC\u5408\u5206" })
            ] }, i)) }),
            /* @__PURE__ */ jsx10("div", { style: { fontSize: 11.5, color: "#94A3B8", marginTop: 8, lineHeight: 1.6, background: "#F8FAFC", border: "1px dashed #E2E8F0", borderRadius: 8, padding: "8px 12px" }, children: "\u6570\u636E\u6765\u6E90\uFF1A\u5BA2\u6237\u672C\u5730\u9884\u8B66\u5FEB\u7167\uFF08cust.alerts\uFF09\uFF0C\u53CD\u6620\u672C\u5BA2\u6237\u5728\u6A21\u578B\u4FA7\u7684\u5F97\u5206\u5F71\u54CD\u4E8B\u4EF6\uFF1B\u4E0E\u300C\u9884\u8B66\u5904\u7F6E\u300DTab \u7684\u5168\u5C40\u9884\u8B66\u5E73\u53F0\uFF08midAlerts\uFF09\u53E3\u5F84\u4E0D\u540C\uFF0C\u4E8C\u8005\u53EF\u80FD\u4E0D\u4E00\u81F4\u3002\u5EFA\u8BAE\u7EDF\u4E00\u4E3A\u540C\u4E00\u6570\u636E\u6E90\uFF08\u7531 midAlerts \u6309\u5BA2\u6237\u8FC7\u6EE4\u6D3E\u751F\uFF09\uFF0C\u907F\u514D\u53CC\u8F68\u7EF4\u62A4\u3002" })
          ] })
        ] }),
        /* @__PURE__ */ jsx10(Panel, { title: "\u5BA1\u6279\u7ED3\u8BBA\u4E0E\u5EFA\u8BAE\u52A8\u4F5C", desc: "\u7EFC\u5408\u5F53\u524D\u98CE\u9669\u7B49\u7EA7\u4E0E\u6700\u65B0\u5BA1\u6279\u8BB0\u5F55\uFF0C\u7ED9\u51FA\u672C\u5BA2\u6237\u7684\u6700\u7EC8\u7ED3\u8BBA", children: (() => {
          const apps = (cust.approvalRecords ?? []).slice().sort((a, b) => String(b.time).localeCompare(String(a.time)));
          const latest = apps[0];
          return /* @__PURE__ */ jsxs10("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
            /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxs10(Badge, { kind: gradeBadgeKind, children: [
                band.level,
                band.meaning ? ` \xB7 ${band.meaning}` : ""
              ] }),
              /* @__PURE__ */ jsxs10("span", { style: { fontSize: 13, color: "#334155" }, children: [
                "\u5EFA\u8BAE\u5904\u7F6E\uFF1A",
                /* @__PURE__ */ jsx10("b", { style: { color: band.color }, children: band.action })
              ] })
            ] }),
            latest ? /* @__PURE__ */ jsxs10("div", { style: { border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", background: "#F8FAFC" }, children: [
              /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12, color: "#64748B", marginBottom: 4 }, children: [
                "\u6700\u65B0\u5BA1\u6279\u8BB0\u5F55\uFF08",
                latest.time,
                "\uFF09"
              ] }),
              /* @__PURE__ */ jsxs10("div", { style: { fontSize: 13, color: "#1E293B" }, children: [
                /* @__PURE__ */ jsx10("b", { children: latest.kind }),
                " \xB7 \u7ED3\u8BBA ",
                /* @__PURE__ */ jsx10("b", { children: latest.result }),
                "\uFF08",
                latest.opinion,
                "\uFF09\xB7 \u5BA1\u6279\u4EBA ",
                latest.operator
              ] })
            ] }) : /* @__PURE__ */ jsx10("div", { style: { fontSize: 12.5, color: "#94A3B8" }, children: "\u6682\u65E0\u5BA1\u6279\u8BB0\u5F55\uFF08\u8D37\u4E2D\u5BA1\u6279\u52A8\u4F5C\u968F\u9884\u8B66/\u5904\u7F6E\u5B8C\u6210\u540E\u7559\u75D5\uFF09\u3002" }),
            /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12.5, color: "#475569", lineHeight: 1.7 }, children: [
              "\u7EFC\u5408\u5EFA\u8BAE\uFF1A\u5F53\u524D ",
              meta.label,
              " ",
              item.score,
              " \u5206\uFF0C\u843D\u5165\u300C",
              band.range,
              "\u300D\u6863\uFF08",
              band.meaning,
              "\uFF09\uFF0C\u6309\u9608\u503C\u914D\u7F6E\u89E6\u53D1\u300C",
              band.action,
              "\u300D\uFF1B",
              latest ? `\u6700\u65B0\u5BA1\u6279\u7ED3\u8BBA\u4E3A\u300C${latest.result}\u300D\uFF0C${latest.opinion}\u3002` : "\u5EFA\u8BAE\u7ED3\u5408\u8D37\u4E2D\u9884\u8B66\u4E0E\u5904\u7F6E\u7ED3\u679C\u4EBA\u5DE5\u6838\u5B9A\u6700\u7EC8\u52A8\u4F5C\u3002"
            ] })
          ] });
        })() })
      ] }),
      tab === "graph" && /* @__PURE__ */ jsx10(Panel, { title: "\u5173\u8054\u56E0\u5B50\u56FE\u8C31", desc: `\u590D\u7528\u5355\u5BA2\u8BE6\u60C5\u5173\u7CFB\u56FE\u8C31\u7EC4\u4EF6 \xB7 \u4EC5\u5C55\u793A\u5F71\u54CD\u300C${meta.label}\u300D\u7684\u5173\u8054\u56E0\u5B50\uFF08\u5171 ${graphRelevant.length} \u9879\uFF09`, children: graphRelevant.length ? /* @__PURE__ */ jsxs10(Fragment8, { children: [
        /* @__PURE__ */ jsx10(
          RelationGraphView,
          {
            graph: relationGraph,
            theme: graphTheme,
            onTheme: setGraphTheme,
            sel,
            onPick: setSel,
            nodeMap
          }
        ),
        /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12, color: "#64748B", marginTop: 10, lineHeight: 1.7, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px" }, children: [
          "\u4EE5\u4E0B\u4E3A\u5F71\u54CD ",
          /* @__PURE__ */ jsx10("b", { style: { color: meta.color }, children: meta.label }),
          " \u7684\u5173\u8054\u56E0\u5B50\uFF1A",
          graphRelevant.map((f, i) => /* @__PURE__ */ jsxs10("span", { style: { marginLeft: 6, color: f.impact === "\u62C9\u9AD8" ? "#A32D2D" : "#3B6D11" }, children: [
            f.name,
            "\uFF08",
            f.impact === "\u62C9\u9AD8" ? "\u62C9\u9AD8" : "\u62C9\u4F4E",
            prod === "zhicha" ? "\u6B3A\u8BC8\u98CE\u9669" : "\u5F97\u5206",
            "\uFF09"
          ] }, i))
        ] })
      ] }) : /* @__PURE__ */ jsx10("div", { style: { fontSize: 13, color: "#94A3B8", padding: "12px 0" }, children: "\u8BE5\u5BA2\u6237\u6682\u65E0\u5F71\u54CD\u672C\u6A21\u578B\u7684\u5173\u8054\u56E0\u5B50\u3002" }) }),
      tab === "alert" && /* @__PURE__ */ jsxs10(Fragment8, { children: [
        /* @__PURE__ */ jsxs10(Panel, { title: "\u9884\u8B66\u5904\u7F6E", desc: "\u5206\u503C/\u89C4\u5219\u9884\u8B66 \u2192 \u5DE5\u5355\u5904\u7F6E\uFF08\u7BA1\u7406\u4E2D\u5FC3 f-score-dispose \u6D41\u7A0B\u8054\u52A8\uFF09\u2192 \u5904\u7F6E\u52A8\u4F5C", children: [
          (() => {
            const band2 = riskBand(prod, item.score);
            return /* @__PURE__ */ jsx10("div", { style: { border: "1px solid " + band2.color + "55", background: band2.color + "0d", borderRadius: 10, padding: "10px 14px" }, children: /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 13 }, children: [
              /* @__PURE__ */ jsx10(Badge, { kind: band2.color === "#DC2626" ? "red" : band2.color === "#D97706" ? "amber" : "green", children: band2.grade }),
              /* @__PURE__ */ jsxs10("span", { style: { fontWeight: 600, color: "#1E293B" }, children: [
                meta.label,
                " ",
                item.score
              ] }),
              /* @__PURE__ */ jsxs10("span", { style: { color: "#64748B" }, children: [
                "\u843D\u5165\u300C",
                band2.range,
                "\u300D\u533A\u95F4\uFF08",
                band2.label,
                "\uFF09\u2192 \u89E6\u53D1\u5206\u503C\u9884\u8B66"
              ] }),
              /* @__PURE__ */ jsxs10("span", { style: { marginLeft: "auto", fontSize: 12, color: "#64748B" }, children: [
                "\u5EFA\u8BAE\u5904\u7F6E\uFF1A",
                /* @__PURE__ */ jsx10("b", { style: { color: band2.color }, children: band2.action })
              ] })
            ] }) });
          })(),
          flow ? /* @__PURE__ */ jsxs10("div", { style: { border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", margin: "12px 0" }, children: [
            /* @__PURE__ */ jsxs10("div", { style: { fontSize: 11, color: "#94A3B8", marginBottom: 8 }, children: [
              "\u5DE5\u5355\u7531\u300C",
              flow.alert_type,
              "\u300D\u9884\u8B66\u9A71\u52A8\uFF08",
              flow.alert_date,
              " \xB7 \u6D41\u7A0B ",
              flow.flowKey,
              "\uFF09",
              alertModelOf(flow.alert_type) === prod ? /* @__PURE__ */ jsxs10("span", { style: { color: meta.color, fontWeight: 600 }, children: [
                "\uFF08\u4E0E\u5F53\u524D ",
                meta.label,
                " \u76F8\u5173\uFF09"
              ] }) : /* @__PURE__ */ jsxs10("span", { children: [
                "\uFF08\u8BE5\u9884\u8B66\u4E3B\u8981\u5F71\u54CD ",
                flow.alert_type ? PROD_META[alertModelOf(flow.alert_type) ?? "zhicha"].label : "",
                "\uFF09"
              ] })
            ] }),
            /* @__PURE__ */ jsx10(
              FlowActionBar,
              {
                flowId: "f-score-dispose",
                state: String(flow.flowState ?? ""),
                matchObj: { level: flow.level ?? "", alert_type: flow.alert_type ?? "" },
                onStateChange: (next) => updateAlerts((list) => list.map((a) => a.alert_id === flow.alert_id ? { ...a, flowState: next, flowStateAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ") } : a))
              }
            ),
            /* @__PURE__ */ jsx10("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: 8 }, children: /* @__PURE__ */ jsx10(
              "button",
              {
                type: "button",
                onClick: () => goAlertDetail(flow.alert_id),
                style: { fontSize: 12.5, background: "#fff", color: "#334155", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 14px", cursor: "pointer" },
                children: "\u67E5\u770B\u9884\u8B66\u8BE6\u60C5"
              }
            ) })
          ] }) : /* @__PURE__ */ jsx10("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", margin: "12px 0" }, children: /* @__PURE__ */ jsx10("span", { style: { fontSize: 12.5, color: "#94A3B8" }, children: "\u8BE5\u5BA2\u6237\u6682\u65E0\u8FDB\u884C\u4E2D\u7684\u5904\u7F6E\u5DE5\u5355" }) }),
          /* @__PURE__ */ jsxs10("div", { style: { fontSize: 13, fontWeight: 600, color: "#475569", margin: "14px 0 8px" }, children: [
            "\u89C4\u5219\u547D\u4E2D\u9884\u8B66\uFF08",
            alertCards.length,
            " \u6761\uFF09",
            /* @__PURE__ */ jsxs10("span", { style: { fontSize: 11, fontWeight: 400, color: "#94A3B8", marginLeft: 8 }, children: [
              meta.label,
              " \u76F8\u5173 \xB7 \u6765\u81EA\u5168\u5C40\u9884\u8B66\u5E73\u53F0\uFF08midAlerts\uFF0C\u8FD0\u884C\u4E2D\uFF09"
            ] })
          ] }),
          alertCards.length ? /* @__PURE__ */ jsx10("div", { className: "space-y-2", children: alertCards.map((a, i) => {
            const lvColor = a.level === "RED" ? "#DC2626" : a.level === "YELLOW" ? "#D97706" : "#16A34A";
            const lvKind = a.level === "RED" ? "red" : a.level === "YELLOW" ? "amber" : "green";
            return /* @__PURE__ */ jsxs10(
              "button",
              {
                type: "button",
                onClick: () => goAlertDetail(a.alert_id),
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  textAlign: "left",
                  border: "1px solid " + lvColor + "55",
                  borderRadius: 10,
                  padding: "10px 14px",
                  background: lvColor + "0d",
                  cursor: "pointer"
                },
                children: [
                  /* @__PURE__ */ jsx10(Badge, { kind: lvKind, children: a.level === "RED" ? "\u7EA2" : a.level === "YELLOW" ? "\u9EC4" : "\u673A" }),
                  /* @__PURE__ */ jsxs10("div", { style: { flex: 1, minWidth: 0 }, children: [
                    /* @__PURE__ */ jsxs10("div", { style: { fontSize: 13, fontWeight: 600, color: "#1E293B", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
                      a.alert_type,
                      " \xB7 ",
                      a.scene,
                      /* @__PURE__ */ jsx10("span", { style: { fontSize: 10.5, color: "#fff", background: meta.color, borderRadius: 6, padding: "1px 7px" }, children: "\u672C\u6A21\u578B\u76F8\u5173" })
                    ] }),
                    /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12, color: "#94A3B8", marginTop: 2 }, children: [
                      a.rule_name,
                      " \xB7 \u89E6\u53D1\u503C ",
                      a.metric_value,
                      "\uFF08\u9608\u503C ",
                      a.threshold,
                      "\uFF09\xB7 ",
                      a.alert_date
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx10("div", { style: { fontSize: 12, color: a.flowState ? "#D97706" : "#94A3B8", flexShrink: 0 }, children: a.flowState ?? (a.status ?? "\u5F85\u5904\u7F6E") }),
                  /* @__PURE__ */ jsx10("span", { style: { fontSize: 12, color: "#94A3B8", flexShrink: 0 }, children: "\u203A" })
                ]
              },
              i
            );
          }) }) : /* @__PURE__ */ jsxs10("div", { style: { fontSize: 13, color: "#94A3B8", padding: "12px 0" }, children: [
            "\u8BE5\u5BA2\u6237\u6682\u65E0\u4E0E ",
            meta.label,
            " \u76F8\u5173\u7684\u89C4\u5219\u547D\u4E2D\u9884\u8B66\u3002"
          ] }),
          otherAlerts.length > 0 && /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12, color: "#94A3B8", marginTop: 10, lineHeight: 1.8, background: "#F8FAFC", border: "1px dashed #E2E8F0", borderRadius: 8, padding: "8px 12px" }, children: [
            "\u53E6\u6709 ",
            otherAlerts.length,
            " \u6761\u9884\u8B66\u5C5E\u4E8E\u5176\u4ED6\u6A21\u578B\uFF1A",
            otherAlerts.map((a, i) => /* @__PURE__ */ jsxs10("span", { style: { marginLeft: 8 }, children: [
              /* @__PURE__ */ jsx10("span", { style: { color: PROD_META[alertModelOf(a.alert_type) ?? "zhicha"].color }, children: PROD_META[alertModelOf(a.alert_type) ?? "zhicha"].label }),
              "\xB7 ",
              a.alert_type,
              /* @__PURE__ */ jsx10("span", { style: { color: "#CBD5E1" }, children: "\uFF5C" })
            ] }, i))
          ] })
        ] }),
        /* @__PURE__ */ jsxs10(Panel, { title: "\u64CD\u4F5C\u65E5\u5FD7", children: [
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", gap: 12, fontSize: 11, color: "#94A3B8", marginBottom: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxs10("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx10("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#0891B2", display: "inline-block" } }),
              "\u8BC4\u5206/\u91CD\u8BC4"
            ] }),
            /* @__PURE__ */ jsxs10("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx10("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#DC2626", display: "inline-block" } }),
              "\u9884\u8B66"
            ] }),
            /* @__PURE__ */ jsxs10("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx10("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#185FA5", display: "inline-block" } }),
              "\u5904\u7F6E"
            ] }),
            /* @__PURE__ */ jsxs10("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx10("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#16A34A", display: "inline-block" } }),
              "\u5BA1\u6279"
            ] }),
            /* @__PURE__ */ jsxs10("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx10("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#D97706", display: "inline-block" } }),
              "\u6838\u9A8C"
            ] })
          ] }),
          allEvents.length ? /* @__PURE__ */ jsx10("div", { className: "space-y-1", children: allEvents.map((ev, i) => /* @__PURE__ */ jsx10(EventLine, { ev }, i)) }) : /* @__PURE__ */ jsx10("div", { style: { fontSize: 13, color: "#94A3B8", padding: "12px 0" }, children: "\u6682\u65E0\u64CD\u4F5C\u65E5\u5FD7\u3002" })
        ] })
      ] }),
      tab === "data" && /* @__PURE__ */ jsxs10(Fragment8, { children: [
        /* @__PURE__ */ jsxs10(Panel, { title: "\u6570\u636E\u660E\u7EC6", desc: `${meta.label} \u8BC4\u5206\u4F7F\u7528\u7684\u539F\u59CB\u6570\u636E \xB7 \u70B9\u51FB\u5B57\u6BB5\u884C\u5C55\u5F00\u67E5\u770B\u6765\u6E90/\u7A97\u53E3/\u53D6\u503C/\u660E\u7EC6`, children: [
          INPUT_DETAILS[prod].map((d, i) => {
            const open = !!openInput[i];
            const statusKind = d.status === "\u89E6\u53D1" ? "red" : d.status === "\u5173\u6CE8" ? "amber" : "green";
            return /* @__PURE__ */ jsxs10("div", { style: { border: "1px solid " + (open ? "#CBD5E1" : "#F1F5F9"), borderRadius: 10, marginBottom: 8, overflow: "hidden" }, children: [
              /* @__PURE__ */ jsxs10(
                "button",
                {
                  type: "button",
                  onClick: () => setOpenInput((s) => ({ ...s, [i]: !s[i] })),
                  style: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", border: "none", cursor: "pointer", textAlign: "left" },
                  children: [
                    /* @__PURE__ */ jsx10("span", { style: { fontSize: 11, color: "#94A3B8", flexShrink: 0, width: 16, textAlign: "center" }, children: open ? "\u25BE" : "\u25B8" }),
                    /* @__PURE__ */ jsx10("span", { style: { fontSize: 12.5, fontWeight: 600, color: "#1E293B", width: 160, flexShrink: 0 }, children: d.name }),
                    /* @__PURE__ */ jsx10("span", { style: { fontSize: 12, color: "#475569", flex: 1, minWidth: 0, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: d.value }),
                    /* @__PURE__ */ jsx10(Badge, { kind: statusKind, children: d.status })
                  ]
                }
              ),
              open && /* @__PURE__ */ jsxs10("div", { style: { padding: "4px 14px 12px 42px", background: "#F8FAFC", borderTop: "1px dashed #E2E8F0" }, children: [
                /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12 }, children: [
                  /* @__PURE__ */ jsx10(FieldRow, { k: "\u6570\u636E\u6765\u6E90", v: d.source }),
                  /* @__PURE__ */ jsx10(FieldRow, { k: "\u7EDF\u8BA1\u7A97\u53E3", v: d.window }),
                  /* @__PURE__ */ jsx10(FieldRow, { k: "\u5B57\u6BB5\u503C", v: d.value, strong: true }),
                  /* @__PURE__ */ jsx10(FieldRow, { k: "\u4F9B\u6A21\u578B\u7279\u5F81", v: d.feat })
                ] }),
                /* @__PURE__ */ jsx10("div", { style: { fontSize: 11.5, fontWeight: 600, color: "#64748B", margin: "10px 0 6px" }, children: d.detailTitle }),
                /* @__PURE__ */ jsxs10("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8 }, children: [
                  /* @__PURE__ */ jsx10("thead", { children: /* @__PURE__ */ jsx10("tr", { children: d.cols.map((c, j) => /* @__PURE__ */ jsx10("th", { style: { textAlign: "left", padding: "5px 8px", color: "#94A3B8", fontWeight: 500, borderBottom: "1px solid #E2E8F0" }, children: c }, j)) }) }),
                  /* @__PURE__ */ jsx10("tbody", { children: d.rows.map((r, j) => /* @__PURE__ */ jsx10("tr", { style: { borderBottom: "1px solid #EEF2F7" }, children: r.map((cell, k) => /* @__PURE__ */ jsx10("td", { style: { padding: "5px 8px", color: "#334155" }, children: cell }, k)) }, j)) })
                ] })
              ] })
            ] }, i);
          }),
          /* @__PURE__ */ jsx10("div", { style: { fontSize: 12, color: "#94A3B8", marginTop: 8 }, children: "\u72B6\u6001\uFF1A\u89E6\u53D1=\u8E29\u7EBF\u547D\u4E2D\u89C4\u5219\u9884\u8B66\uFF1B\u5173\u6CE8=\u63A5\u8FD1\u9608\u503C\u5F85\u89C2\u5BDF\uFF1B\u6B63\u5E38=\u6B63\u5E38\u53C2\u4E0E\u8BC4\u5206\u3002" })
        ] }),
        /* @__PURE__ */ jsxs10(Panel, { title: "\u6570\u636E\u6765\u6E90", desc: "\u6A21\u578B\u8BC4\u5206\u4F9D\u8D56\u7684\u8F93\u5165\u6570\u636E", children: [
          /* @__PURE__ */ jsx10("div", { style: { fontSize: 13, color: "#334155", lineHeight: 1.9 }, children: capa.lineage.map((s, i) => /* @__PURE__ */ jsxs10("div", { style: { display: "flex", gap: 10, padding: "6px 0", borderBottom: i < capa.lineage.length - 1 ? "1px dashed #F1F5F9" : "none" }, children: [
            /* @__PURE__ */ jsx10("span", { style: { flexShrink: 0, fontSize: 12, fontWeight: 600, color: meta.color, width: 110 }, children: s.stage }),
            /* @__PURE__ */ jsx10("span", { style: { fontSize: 12.5, color: "#64748B" }, children: s.detail })
          ] }, i)) }),
          /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12, color: "#94A3B8", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsx10(
              "button",
              {
                type: "button",
                onClick: () => nav("/console/cr/mid-single-cust?cust=" + encodeURIComponent(custId) + (source ? "&source=sc" : "")),
                style: { fontSize: 12.5, color: "#185FA5", background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" },
                children: "\u67E5\u770B\u5B8C\u6574\u7528\u6237\u6570\u636E\u6863\u6848 \u2192"
              }
            ),
            /* @__PURE__ */ jsx10("span", { children: "\uFF08\u5355\u5BA2 360\xB0 \u753B\u50CF\uFF09" })
          ] })
        ] })
      ] }),
      tab === "model" && /* @__PURE__ */ jsxs10(Fragment8, { children: [
        /* @__PURE__ */ jsx10(Panel, { title: "\u6A21\u578B\u51B3\u7B56\u94FE\u8DEF", desc: "\u672C\u5BA2\u6237\u5728\u6BCF\u4E2A\u8282\u70B9\u4E0A\u7684\u5B9E\u9645\u53D6\u503C\u4E0E\u51B3\u7B56\u8DEF\u5F84\uFF1A\u6570\u636E\u6E90 \u2192 \u7279\u5F81 \u2192 \u6A21\u578B \u2192 \u89C4\u5219 \u2192 \u8F93\u51FA\uFF08\u8282\u70B9\u4E0A\u7684\u7EFF\u8272\u6570\u503C = \u672C\u5BA2\u6237\u5728\u8BE5\u8282\u70B9\u7684\u503C\uFF1B\u70B9\u51FB\u8282\u70B9\u67E5\u770B\u8BE6\u60C5\uFF09", children: /* @__PURE__ */ jsx10(
          ModelDecisionGraph,
          {
            prod,
            model: gModel,
            thresholds: data2.thresholds,
            graph: prod === "zhixin" ? PIPELINE_GRAPHS.zhixin_credit_v1 : void 0,
            nodeResults,
            currentScore: item.score,
            onJumpRules: () => nav("/console/cm/rule-hub"),
            onJumpStrategy: () => nav("/console/sc/model-detail?prod=" + prod + "&tab=threshold")
          }
        ) }),
        /* @__PURE__ */ jsxs10(Panel, { title: "\u57FA\u672C\u4FE1\u606F", desc: "\u6A21\u578B\u7248\u672C\u4E0E\u5F52\u5C5E", children: [
          /* @__PURE__ */ jsxs10("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }, children: [
            /* @__PURE__ */ jsx10(CapCell, { label: "\u6A21\u578B", value: `${meta.label} \xB7 ${item.modelVersion}` }),
            /* @__PURE__ */ jsx10(CapCell, { label: "\u6700\u8FD1\u8BAD\u7EC3", value: reg.lastTrain ?? "\u2014" }),
            /* @__PURE__ */ jsx10(CapCell, { label: "\u8F93\u5165\u6570\u636E\u7248\u672C", value: "2026Q2" }),
            /* @__PURE__ */ jsx10(CapCell, { label: "\u9002\u7528\u5BA2\u7FA4", value: capa.applicable }),
            /* @__PURE__ */ jsx10(CapCell, { label: "\u6A21\u578B\u8D1F\u8D23\u4EBA", value: capa.owner }),
            /* @__PURE__ */ jsx10(CapCell, { label: "\u72B6\u6001", value: reg.status?.v ?? "\u2014" }),
            /* @__PURE__ */ jsx10(CapCell, { label: "\u8BC4\u5206\u65F6\u95F4", value: item.calcedAt })
          ] }),
          /* @__PURE__ */ jsx10("div", { style: { fontSize: 12.5, fontWeight: 600, color: "#475569", margin: "16px 0 8px" }, children: "\u7248\u672C\u5386\u53F2" }),
          /* @__PURE__ */ jsx10("div", { className: "space-y-2", children: capa.versions.map((v, i) => /* @__PURE__ */ jsxs10("div", { style: { display: "flex", gap: 12, padding: "8px 12px", border: "1px solid #F1F5F9", borderRadius: 10, background: i === 0 ? meta.color + "08" : "#fff" }, children: [
            /* @__PURE__ */ jsxs10("div", { style: { flexShrink: 0, width: 110 }, children: [
              /* @__PURE__ */ jsx10("div", { style: { fontSize: 12.5, fontWeight: 700, color: meta.color }, children: v.version }),
              /* @__PURE__ */ jsx10("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 2 }, children: v.date })
            ] }),
            /* @__PURE__ */ jsx10("div", { style: { fontSize: 12.5, color: "#475569", lineHeight: 1.7 }, children: v.note }),
            i === 0 && /* @__PURE__ */ jsx10(Badge, { kind: meta.danger ? "red" : "green", children: "\u5F53\u524D" })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsx10(Panel, { title: "\u7EF4\u5EA6\u6784\u6210\uFF08\u6A21\u578B\u6743\u91CD\uFF09", desc: "\u6A21\u578B\u7531\u4EE5\u4E0B\u7EF4\u5EA6\u6784\u6210\uFF0C\u6743\u91CD\u4E3A\u5404\u7EF4\u5EA6\u5728\u6A21\u578B\u4E2D\u7684\u8D21\u732E\u5360\u6BD4\uFF1B\u4E0E\u300C\u6A21\u578B\u5206\u300D\u9875\u7EF4\u5EA6\u62C6\u89E3\u540C\u540D\u540C\u5E8F", children: /* @__PURE__ */ jsx10("div", { style: { border: "1px solid #F1F5F9", borderRadius: 10, padding: "2px 12px" }, children: capa.global.map((g, i) => /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: "10px 0", borderBottom: i < capa.global.length - 1 ? "1px dashed #F1F5F9" : "none" }, children: [
          /* @__PURE__ */ jsx10("span", { style: { width: 88, flexShrink: 0, color: "#334155", fontWeight: 600 }, children: g.name }),
          /* @__PURE__ */ jsx10("div", { style: { flex: 1, height: 6, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }, children: /* @__PURE__ */ jsx10("div", { style: { width: `${g.importance}%`, height: "100%", background: meta.color, borderRadius: 999 } }) }),
          /* @__PURE__ */ jsxs10("span", { style: { width: 38, textAlign: "right", color: "#475569", fontVariantNumeric: "tabular-nums" }, children: [
            g.importance,
            "%"
          ] })
        ] }, i)) }) }),
        prod === "zhixin" ? /* @__PURE__ */ jsx10(ScorecardLedger, { cust }) : null
      ] })
    ] })
  ] });
}
function ScorecardLedger({ cust }) {
  const [raw, setRaw] = useState9({ m3: 1, dir: 58, inc: 14, q6: 8, util: 43 });
  const result = useMemo5(() => computeZhixin(raw), [raw]);
  const grade = result.score <= 540 ? "D" : result.score <= 660 ? "C" : result.score <= 780 ? "B" : "A";
  const gradeColor = grade === "A" ? "#16A34A" : grade === "B" ? "#0891B2" : grade === "C" ? "#D97706" : "#DC2626";
  const fieldDefs = [
    { key: "m3", label: "\u5386\u53F2\u903E\u671F\uFF08\u8FD12\u5E74 M3+ \u6B21\u6570\uFF09", unit: "\u6B21", min: 0, max: 5 },
    { key: "dir", label: "\u8D1F\u503A\u6536\u5165\u6BD4\uFF08%\uFF09", unit: "%", min: 0, max: 100 },
    { key: "inc", label: "\u6536\u5165\u7A33\u5B9A\uFF08\u8FDE\u7EED\u8FD8\u6B3E\u6708\u6570\uFF09", unit: "\u6708", min: 0, max: 36 },
    { key: "q6", label: "\u5F81\u4FE1\u67E5\u8BE2\uFF08\u8FD16\u6708\u6B21\u6570\uFF09", unit: "\u6B21", min: 0, max: 30 },
    { key: "util", label: "\u6388\u4FE1\u4F7F\u7528\u7387\uFF08%\uFF09", unit: "%", min: 0, max: 100 }
  ];
  return /* @__PURE__ */ jsxs10(Panel, { title: "\u8BC4\u5206\u5361\u8BA1\u7B97\u8D26\u672C", desc: "\u8F93\u5165\u539F\u59CB\u6570\u636E \u2192 \u5206\u7BB1\u52A0\u5206 \u2192 \u603B\u5206\uFF1A\u5206\u6570\u53EF\u590D\u6838\uFF08\u57FA\u7840\u5206 600\uFF0C\u6837\u4F8B\u8F93\u5165 712 \u5206\u53EF\u590D\u73B0\uFF09", children: [
    /* @__PURE__ */ jsx10("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }, children: fieldDefs.map((f) => /* @__PURE__ */ jsxs10("label", { style: { display: "block" }, children: [
      /* @__PURE__ */ jsx10("div", { style: { fontSize: 12, color: "#64748B", marginBottom: 4 }, children: f.label }),
      /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsx10(
          "input",
          {
            type: "number",
            value: raw[f.key],
            min: f.min,
            max: f.max,
            onChange: (e) => setRaw((r) => ({ ...r, [f.key]: Number(e.target.value) })),
            style: { width: "100%", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 10px", fontSize: 14, outline: "none" }
          }
        ),
        /* @__PURE__ */ jsx10("span", { style: { fontSize: 12, color: "#94A3B8" }, children: f.unit })
      ] })
    ] }, f.key)) }),
    /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 16, margin: "14px 0 4px", padding: "10px 14px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10 }, children: [
      /* @__PURE__ */ jsxs10("div", { children: [
        /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12, color: "#64748B" }, children: [
          "\u603B\u5206\uFF08\u57FA\u7840 600 + ",
          result.total,
          "\uFF09"
        ] }),
        /* @__PURE__ */ jsx10("div", { style: { fontSize: 26, fontWeight: 800, color: gradeColor, fontVariantNumeric: "tabular-nums" }, children: result.score })
      ] }),
      /* @__PURE__ */ jsxs10("div", { children: [
        /* @__PURE__ */ jsx10("div", { style: { fontSize: 12, color: "#64748B" }, children: "\u4FE1\u7528\u7B49\u7EA7" }),
        /* @__PURE__ */ jsx10("div", { style: { fontSize: 20, fontWeight: 700, color: gradeColor }, children: grade })
      ] }),
      /* @__PURE__ */ jsxs10("div", { style: { fontSize: 12, color: "#94A3B8", lineHeight: 1.7 }, children: [
        "\u53C2\u8003\u52A8\u4F5C\uFF1A",
        grade === "D" ? "\u62D2\u7EDD" : grade === "C" ? "\u5BA1\u614E\u6388\u4FE1" : grade === "B" ? "\u6807\u51C6\u989D\u5EA6" : "\u63D0\u989D + \u4F18\u5148\u7ECF\u8425",
        /* @__PURE__ */ jsx10("br", {}),
        "\u5BA2\u6237\uFF1A",
        cust.name,
        " \xB7 ",
        cust.custId,
        "\uFF08\u6837\u4F8B\u8F93\u5165\uFF0C\u53EF\u62D6\u52A8\u8C03\u6574\u9A8C\u8BC1\uFF09"
      ] })
    ] }),
    /* @__PURE__ */ jsx10("div", { style: { overflowX: "auto", marginTop: 6 }, children: /* @__PURE__ */ jsxs10("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12.5 }, children: [
      /* @__PURE__ */ jsx10("thead", { children: /* @__PURE__ */ jsxs10("tr", { style: { color: "#64748B", textAlign: "left" }, children: [
        /* @__PURE__ */ jsx10("th", { style: { padding: "6px 10px", borderBottom: "1px solid #E2E8F0" }, children: "\u8BC4\u5206\u56E0\u5B50" }),
        /* @__PURE__ */ jsx10("th", { style: { padding: "6px 10px", borderBottom: "1px solid #E2E8F0" }, children: "\u8F93\u5165\u503C" }),
        /* @__PURE__ */ jsx10("th", { style: { padding: "6px 10px", borderBottom: "1px solid #E2E8F0" }, children: "\u547D\u4E2D\u5206\u7BB1" }),
        /* @__PURE__ */ jsx10("th", { style: { padding: "6px 10px", borderBottom: "1px solid #E2E8F0", textAlign: "right" }, children: "\u52A0\u5206" })
      ] }) }),
      /* @__PURE__ */ jsxs10("tbody", { children: [
        result.steps.map((s, i) => /* @__PURE__ */ jsxs10("tr", { style: { color: "#334155" }, children: [
          /* @__PURE__ */ jsx10("td", { style: { padding: "6px 10px", borderBottom: "1px dashed #F1F5F9" }, children: s.factor }),
          /* @__PURE__ */ jsx10("td", { style: { padding: "6px 10px", borderBottom: "1px dashed #F1F5F9", fontVariantNumeric: "tabular-nums" }, children: s.input }),
          /* @__PURE__ */ jsx10("td", { style: { padding: "6px 10px", borderBottom: "1px dashed #F1F5F9" }, children: /* @__PURE__ */ jsx10("span", { style: { background: s.bin === "\u672A\u8986\u76D6\u533A\u95F4" ? "#FEF3C7" : "#F1F5F9", borderRadius: 6, padding: "1px 8px" }, children: s.bin }) }),
          /* @__PURE__ */ jsxs10("td", { style: { padding: "6px 10px", borderBottom: "1px dashed #F1F5F9", textAlign: "right", fontWeight: 700, color: s.points >= 0 ? "#16A34A" : "#DC2626" }, children: [
            s.points > 0 ? "+" : "",
            s.points
          ] })
        ] }, i)),
        /* @__PURE__ */ jsxs10("tr", { style: { color: "#0F172A", fontWeight: 700 }, children: [
          /* @__PURE__ */ jsx10("td", { style: { padding: "6px 10px" }, children: "\u5408\u8BA1\u52A0\u5206" }),
          /* @__PURE__ */ jsx10("td", { colSpan: 2 }),
          /* @__PURE__ */ jsxs10("td", { style: { padding: "6px 10px", textAlign: "right" }, children: [
            result.total > 0 ? "+" : "",
            result.total
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs10("div", { style: { fontSize: 11.5, color: "#94A3B8", marginTop: 8 }, children: [
      "\u5206\u7BB1\u8868\u4E0E\u9608\u503C\u89C1 ",
      /* @__PURE__ */ jsx10("code", { children: "scoreData.ts" }),
      " ZHIXIN_SCORECARD / model-trace.html\uFF1B\u533A\u95F4\u7AEF\u70B9\u542B\u3001gt/lt \u4E0D\u542B\uFF1B\u672A\u8986\u76D6\u533A\u95F4\u8BB0 0 \u5206\u3002"
    ] })
  ] });
}
export {
  CustScoreDetail as default
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
