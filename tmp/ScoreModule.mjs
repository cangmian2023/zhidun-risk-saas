// src/console/ScoreRecords.tsx
import { useState as useState4 } from "react";

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
function StatCard({
  label,
  value,
  delta,
  deltaType,
  hint,
  accent = "brand"
}) {
  const accents = {
    brand: "text-brand-600",
    cyan: "text-cyan-600",
    violet: "text-violet-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600"
  };
  const deltaColor = deltaType === "up" ? "text-emerald-600" : deltaType === "down" ? "text-rose-600" : "text-slate-400";
  return /* @__PURE__ */ jsxs2("div", { className: "rounded-2xl border border-slate-100 bg-white p-5 shadow-card", children: [
    /* @__PURE__ */ jsx2("p", { className: "text-sm text-slate-500", children: label }),
    /* @__PURE__ */ jsx2("p", { className: `mt-2 text-3xl font-bold tabular-nums ${accents[accent]}`, children: value }),
    /* @__PURE__ */ jsxs2("div", { className: "mt-1.5 flex items-center gap-2 text-xs", children: [
      delta && /* @__PURE__ */ jsx2("span", { className: `font-medium ${deltaColor}`, children: delta }),
      hint && /* @__PURE__ */ jsx2("span", { className: "text-slate-400", children: hint })
    ] })
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
function RightDrawer({
  open,
  onClose,
  title,
  children,
  width = 560,
  level = 1
}) {
  if (!open) return null;
  const z = 50 + level * 10;
  return createPortal(
    /* @__PURE__ */ jsxs2("div", { className: "fixed inset-0", style: { zIndex: z }, children: [
      /* @__PURE__ */ jsx2(
        "div",
        {
          className: "absolute inset-y-0 bg-slate-900/40",
          style: { left: 0, right: level > 1 ? width : 0, zIndex: z - 1 },
          onClick: onClose
        }
      ),
      /* @__PURE__ */ jsxs2("div", { className: "absolute inset-y-0 right-0 overflow-y-auto bg-white shadow-2xl", style: { width, zIndex: z }, children: [
        /* @__PURE__ */ jsxs2("div", { className: "sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur", children: [
          /* @__PURE__ */ jsx2("h2", { className: "text-base font-semibold text-ink-900", children: title }),
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
        /* @__PURE__ */ jsx2("div", { className: "px-5 py-4", children })
      ] })
    ] }),
    document.body
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

// src/console/ScoreRecords.tsx
import { Fragment as Fragment5, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function levelKind(level) {
  if (level.includes("\u9AD8\u98CE\u9669") || level.startsWith("D")) return "red";
  if (level.includes("\u4E2D\u98CE\u9669") || level.startsWith("C")) return "amber";
  if (level.includes("\u4F4E\u98CE\u9669") || level.startsWith("A")) return "green";
  if (level.startsWith("B")) return "blue";
  return "gray";
}
function modelKind(m) {
  return m === "zhicha" ? "red" : m === "zhixin" ? "green" : "violet";
}
function ScoreRecordsPage() {
  const data2 = useScore();
  const nav = useNavigate();
  const [q, setQ] = useState4("");
  const [modelFilter, setModelFilter] = useState4("all");
  const [importOpen, setImportOpen] = useState4(false);
  const [csv, setCsv] = useState4("");
  const filtered = data2.records.filter((r) => {
    const matchQ = !q.trim() || r.custName.includes(q.trim()) || r.custId.includes(q.trim());
    const matchM = modelFilter === "all" || r.model === modelFilter;
    return matchQ && matchM;
  });
  const failCount = data2.records.filter((r) => r.status === "fail").length;
  const retry = (id) => updateScore((d) => ({
    ...d,
    records: d.records.map((rec) => rec.id === id ? { ...rec, status: "success" } : rec)
  }));
  const openImport = () => setImportOpen(true);
  const confirmImport = () => {
    const now2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
    const recs = [
      { id: `R-IMP-${Date.now()}`, time: now2, custId: "CUST-IMPORT", custName: "\u5BFC\u5165\u5BA2\u6237", model: "zhixin", score: 650, level: resolveRisk("zhixin", 650)?.level ?? "C", source: "\u6279\u91CF", status: "success" },
      { id: `R-IMP-${Date.now() + 1}`, time: now2, custId: "CUST-IMPORT", custName: "\u5BFC\u5165\u5BA2\u6237", model: "zhirong", score: 720, level: resolveRisk("zhirong", 720)?.level ?? "B", source: "\u6279\u91CF", status: "success" }
    ];
    updateScore((d) => ({ ...d, records: [...recs, ...d.records] }));
    setImportOpen(false);
    setCsv("");
  };
  const columns = [
    { key: "time", label: "\u65F6\u95F4" },
    {
      key: "customer",
      label: "\u5BA2\u6237",
      render: (r) => /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx4("div", { className: "font-medium text-ink-900", children: r.custName }),
        /* @__PURE__ */ jsx4("div", { className: "text-xs text-slate-400", children: r.custId })
      ] })
    },
    {
      key: "model",
      label: "\u6A21\u578B",
      render: (r) => /* @__PURE__ */ jsx4(Badge, { kind: modelKind(r.model), children: SCORE_PROD_LABEL[r.model] })
    },
    { key: "score", label: "\u5206\u6570", type: "score" },
    {
      key: "level",
      label: "\u7B49\u7EA7 / \u98CE\u9669\u7ED3\u8BBA",
      render: (r) => /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx4(Badge, { kind: levelKind(r.level), children: r.level }),
        r.action ? /* @__PURE__ */ jsx4("div", { className: "mt-1 text-[11px] leading-tight text-slate-400", children: r.action }) : null
      ] })
    },
    { key: "source", label: "\u6765\u6E90" },
    {
      key: "status",
      label: "\u72B6\u6001",
      render: (r) => /* @__PURE__ */ jsx4(Badge, { kind: r.status === "success" ? "green" : "red", children: r.status === "success" ? "\u6210\u529F" : "\u5931\u8D25" })
    }
  ];
  const rows = filtered.map((r) => {
    const risk = resolveRisk(r.model, r.score);
    return {
      id: r.id,
      time: r.time,
      custName: r.custName,
      custId: r.custId,
      model: r.model,
      score: r.score,
      level: risk?.level ?? "\u2014",
      action: risk?.action ?? "",
      source: r.source,
      status: r.status
    };
  });
  return /* @__PURE__ */ jsxs4(Fragment5, { children: [
    /* @__PURE__ */ jsx4(PageShell, { title: "\u8BC4\u5206\u8BB0\u5F55", crumb: "\u8BC4\u5206\u4EA7\u54C1 / \u5728\u7EBF\u8BC4\u5206" }),
    /* @__PURE__ */ jsxs4("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs4("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsx4(StatCard, { label: "\u603B\u8C03\u7528\u6B21\u6570", value: data2.records.length.toLocaleString(), accent: "brand" }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u5931\u8D25\u6B21\u6570", value: failCount.toLocaleString(), accent: "rose" }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u672C\u6708\u6B21\u6570", value: data2.monthlyCount.toLocaleString(), accent: "emerald" })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card", children: [
        /* @__PURE__ */ jsx4("span", { className: "text-sm text-slate-500", children: "\u6A21\u578B" }),
        /* @__PURE__ */ jsxs4(
          "select",
          {
            value: modelFilter,
            onChange: (e) => setModelFilter(e.target.value),
            className: "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-400",
            children: [
              /* @__PURE__ */ jsx4("option", { value: "all", children: "\u5168\u90E8" }),
              /* @__PURE__ */ jsx4("option", { value: "zhicha", children: "\u667A\u5BDF\u5206" }),
              /* @__PURE__ */ jsx4("option", { value: "zhixin", children: "\u667A\u4FE1\u5206" }),
              /* @__PURE__ */ jsx4("option", { value: "zhirong", children: "\u667A\u878D\u5206" })
            ]
          }
        ),
        /* @__PURE__ */ jsx4("span", { className: "text-sm text-slate-500", children: "\u641C\u7D22" }),
        /* @__PURE__ */ jsx4(
          "input",
          {
            value: q,
            onChange: (e) => setQ(e.target.value),
            placeholder: "\u5BA2\u6237\u53F7/\u59D3\u540D",
            className: "h-9 w-48 rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-400"
          }
        ),
        /* @__PURE__ */ jsx4(Button, { size: "sm", variant: "primary", onClick: openImport, children: "\u5BFC\u5165\u6279\u91CF\u8BC4\u5206" }),
        /* @__PURE__ */ jsxs4("span", { className: "ml-auto text-xs text-slate-400", children: [
          "\u5171 ",
          filtered.length,
          " \u6761"
        ] })
      ] }),
      /* @__PURE__ */ jsx4(
        Panel,
        {
          title: "\u5386\u53F2\u8BC4\u5206\u8C03\u7528\u660E\u7EC6",
          actions: /* @__PURE__ */ jsx4(Sam, { value: "scoreData.json" }),
          children: /* @__PURE__ */ jsx4(
            DataTable,
            {
              columns,
              rows,
              pager: true,
              defaultPageSize: 10,
              actions: (r) => /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx4(Button, { size: "sm", variant: "ghost", onClick: () => nav("/console/cr/mid-cust-score?cust=" + r.custId + "&prod=" + r.model + "&back=" + encodeURIComponent("/console/sc/score-records")), children: "\u67E5\u770B" }),
                r.status === "fail" ? /* @__PURE__ */ jsx4(Button, { size: "sm", variant: "ghost", onClick: () => retry(r.id), children: "\u91CD\u8BD5" }) : null
              ] })
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ jsxs4(Modal, { open: importOpen, onClose: () => setImportOpen(false), title: "\u6279\u91CF\u8BC4\u5206\u5BFC\u5165", children: [
      /* @__PURE__ */ jsx4("p", { className: "mb-3 text-xs text-slate-500", children: "\u652F\u6301\u7C98\u8D34 CSV\uFF08\u5BA2\u6237\u53F7,\u6A21\u578B,\u5206\u6570\uFF09\uFF0C\u786E\u8BA4\u540E\u8FFD\u52A0\u4E3A\u8BC4\u5206\u8BB0\u5F55\u3002" }),
      /* @__PURE__ */ jsx4(
        "textarea",
        {
          value: csv,
          onChange: (e) => setCsv(e.target.value),
          placeholder: "\u7C98\u8D34 CSV\uFF08\u5BA2\u6237\u53F7,\u6A21\u578B,\u5206\u6570\uFF09",
          className: "h-40 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-ink-900 outline-none focus:border-brand-400"
        }
      ),
      /* @__PURE__ */ jsxs4("p", { className: "mt-2 text-[11px] text-slate-400", children: [
        /* @__PURE__ */ jsx4(Sam, { value: "scoreData.json" }),
        " \u5C06\u751F\u6210\u793A\u4F8B\u8BB0\u5F55\uFF08\u667A\u4FE1\u5206/\u667A\u878D\u5206\uFF09"
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "mt-4 flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx4(Button, { size: "sm", variant: "ghost", onClick: () => setImportOpen(false), children: "\u53D6\u6D88" }),
        /* @__PURE__ */ jsx4(Button, { size: "sm", variant: "primary", onClick: confirmImport, children: "\u786E\u8BA4\u5BFC\u5165" })
      ] })
    ] })
  ] });
}

// src/console/ScoreCrowd.tsx
import { useMemo as useMemo4, useState as useState6 } from "react";

// src/console/midStore.ts
import { useSyncExternalStore as useSyncExternalStore3 } from "react";

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
var VISUAL_OP_LABEL = {
  eq: "\u7B49\u4E8E",
  neq: "\u4E0D\u7B49\u4E8E",
  lt: "\u5C0F\u4E8E",
  gt: "\u5927\u4E8E",
  range: "\u533A\u95F4",
  has: "\u6709\u503C",
  empty: "\u6CA1\u503C",
  in: "\u5305\u542B"
};
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
  const rules = Array.isArray(raw.rules) ? raw.rules.map((r) => {
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
  return { tasks, rules, disposes };
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
function evalMetricFormula(formula, metricValues) {
  if (!formula) return null;
  let expr = formula;
  expr = expr.replace(/m_[A-Za-z0-9_]+/g, (m) => {
    const v = metricValues[m];
    return v === void 0 ? "0" : String(v);
  });
  expr = expr.replace(/ratio\(\s*([^,()]+)\s*,\s*([^()]+)\s*\)/g, "($1 / $2 * 100)");
  expr = expr.replace(/mom\(\s*([^()]+)\s*\)/g, "($1)");
  expr = expr.replace(/yoy\(\s*([^()]+)\s*\)/g, "($1)");
  expr = expr.replace(/cumsum\(\s*([^()]+)\s*\)/g, "($1)");
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) return null;
  try {
    const v = new Function(`"use strict"; return (${expr});`)();
    return typeof v === "number" && isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
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
  const clamp2 = (v, lo, hi2) => Math.max(lo, Math.min(hi2, v));
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
    const zcS = walkDown(zc, 5).map((v) => clamp2(v, 5, 98));
    const zxS = walkUp(zx, 26).map((v) => clamp2(v, 320, 880));
    const zrS = walkUp(zr, 26).map((v) => clamp2(v, 320, 880));
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
function applyMetricFilters(rows, filters) {
  if (!filters || !filters.length) return rows;
  return rows.filter((r) => filters.every((f) => {
    const cell = r[f.field];
    const cv = Number(cell);
    const nv = Number(f.value);
    const isnum = f.value !== "" && Number.isFinite(cv) && !Number.isNaN(nv);
    switch (f.op) {
      case "eq":
        return String(cell) === f.value;
      case "neq":
        return String(cell) !== f.value;
      case "gt":
        return isnum && cv > nv;
      case "gte":
        return isnum && cv >= nv;
      case "lt":
        return isnum && cv < nv;
      case "lte":
        return isnum && cv <= nv;
      case "contains":
        return String(cell).includes(f.value);
      default:
        return true;
    }
  }));
}
function evalFieldExpr(expr, row) {
  if (!expr) return null;
  const e = expr.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (tok) => {
    if (Object.prototype.hasOwnProperty.call(row, tok)) {
      const v = Number(row[tok]);
      return Number.isFinite(v) ? String(v) : "0";
    }
    return tok;
  });
  if (!/^[0-9+\-*/().\s]+$/.test(e)) return null;
  try {
    const v = new Function(`"use strict"; return (${e});`)();
    return typeof v === "number" && isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
function computeMetricValue(m, rows) {
  if (m.type === "derived") return 0;
  const filtered = applyMetricFilters(rows, m.filters);
  const nums = filtered.map((r) => m.expr ? evalFieldExpr(m.expr, r) ?? 0 : Number(r[m.field ?? ""]));
  switch (m.agg) {
    case "sum":
      return nums.reduce((a, b) => a + b, 0);
    case "avg":
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    case "max":
      return nums.length ? Math.max(...nums) : 0;
    case "min":
      return nums.length ? Math.min(...nums) : 0;
    case "distinct":
      return new Set(filtered.map((r) => r[m.dedupField ?? m.field ?? ""])).size;
    case "count":
    default:
      return filtered.length;
  }
}
function resolveMetricsForRows(metrics2, rows) {
  const vals = {};
  let changed = true;
  let guard = 0;
  while (changed && guard++ < 16) {
    changed = false;
    for (const m of metrics2) {
      if (m.type === "base") {
        const v = computeMetricValue(m, rows);
        if (vals[m.id] !== v) {
          vals[m.id] = v;
          changed = true;
        }
      } else {
        const v = evalMetricFormula(m.formula ?? "", vals);
        if (v !== null && vals[m.id] !== v) {
          vals[m.id] = v;
          changed = true;
        }
      }
    }
  }
  return vals;
}
function groupRowsByDim(rows, dim) {
  const map = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const k = String(r[dim] ?? "\u672A\u77E5");
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r);
  }
  return Array.from(map.entries()).map(([key, rs]) => ({ key, rows: rs }));
}
var LEVEL_META = {
  RED: { label: "\u7EA2\u706F", badge: "red", fill: "#E11D48", soft: "#FFE4E6" },
  YELLOW: { label: "\u9EC4\u706F", badge: "amber", fill: "#D97706", soft: "#FEF3C7" },
  OPPORTUNITY: { label: "\u673A\u4F1A", badge: "cyan", fill: "#0891B2", soft: "#CFFAFE" },
  GREEN: { label: "\u7EFF\u706F", badge: "green", fill: "#059669", soft: "#D1FAE5" }
};

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
function loadOne2(file) {
  return fetch(`/api/load-mid?file=${encodeURIComponent(file)}`).then((r) => r.ok ? r.json() : null).catch(() => null);
}
function saveOne2(file, data2) {
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
var version2 = 0;
var listeners3 = /* @__PURE__ */ new Set();
var saveStatus2 = "idle";
var statusListeners2 = /* @__PURE__ */ new Set();
var timers = {};
function notify() {
  version2 += 1;
  listeners3.forEach((l) => l());
}
function setSaveStatus(s) {
  saveStatus2 = s;
  statusListeners2.forEach((l) => l(s));
}
function scheduleSave(file, data2) {
  if (timers[file]) clearTimeout(timers[file]);
  setSaveStatus("saving");
  timers[file] = setTimeout(() => saveOne2(FILES[file], data2), 350);
}
async function bootstrap2() {
  const [ds, mt, st, db, al, cu, dp, vz] = await Promise.all([
    loadOne2(FILES.dataSources),
    loadOne2(FILES.metrics),
    loadOne2(FILES.strategy),
    loadOne2(FILES.dashboards),
    loadOne2(FILES.alerts),
    loadOne2(FILES.customers),
    loadOne2(FILES.disposeTasks),
    loadOne2(FILES.vizSamples)
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
  else saveOne2(FILES.dataSources, dataSources);
  if (Array.isArray(mt) && mt.length) metrics = mt;
  else saveOne2(FILES.metrics, metrics);
  if (st && Array.isArray(st.tasks)) strategy = normalizeStrategy(st);
  else saveOne2(FILES.strategy, strategy);
  if (Array.isArray(db) && db.length) dashboards = db;
  else saveOne2(FILES.dashboards, dashboards);
  if (Array.isArray(al) && al.length) alerts = al;
  else saveOne2(FILES.alerts, alerts);
  if (Array.isArray(cu) && cu.length) customers = cu.map(withCustGraph);
  else saveOne2(FILES.customers, customers);
  if (Array.isArray(dp) && dp.length) disposeTasks = dp;
  else saveOne2(FILES.disposeTasks, disposeTasks);
  if (Array.isArray(vz) && vz.length) vizSamples = vz;
  else saveOne2(FILES.vizSamples, vizSamples);
  notify();
}
void bootstrap2();
function subscribe2(l) {
  listeners3.add(l);
  return () => {
    listeners3.delete(l);
  };
}
function getVersion() {
  return version2;
}
function useSnap2(sel) {
  useSyncExternalStore3(subscribe2, getVersion);
  return sel();
}
function useMidDataSources() {
  return useSnap2(() => dataSources);
}
function useMidMetrics() {
  return useSnap2(() => metrics);
}
function useMidDashboards() {
  return useSnap2(() => dashboards);
}
function useMidAlerts2() {
  return useSnap2(() => alerts);
}
function useMidCustomers() {
  return useSnap2(() => customers);
}
function useMidSaveStatus() {
  useSyncExternalStore3(
    (l) => {
      statusListeners2.add(l);
      return () => {
        statusListeners2.delete(l);
      };
    },
    () => saveStatus2
  );
  return saveStatus2;
}
function updateDataSources(fn) {
  dataSources = fn(dataSources);
  notify();
  scheduleSave("dataSources", dataSources);
}
function updateAlerts(fn) {
  alerts = fn(alerts);
  notify();
  scheduleSave("alerts", alerts);
}
function midNewId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}

// src/console/CrowdDrawer.tsx
import { useEffect as useEffect4, useMemo as useMemo3, useState as useState5 } from "react";

// src/console/CondBuilder.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var inpSm = { padding: "4px 6px", borderRadius: 6, border: "1px solid #E2E8F0", fontSize: 12, background: "#fff" };
function emptyFilter() {
  return { logic: "and", groups: [], loose: [] };
}
function LogicSwitch({ value, onChange }) {
  const seg = { display: "inline-flex", border: "1px solid #E2E8F0", borderRadius: 6, overflow: "hidden" };
  const opt = (v, label) => ({
    padding: "2px 10px",
    fontSize: 11,
    cursor: "pointer",
    userSelect: "none",
    background: value === v ? "#2563EB" : "#fff",
    color: value === v ? "#fff" : "#64748B",
    fontWeight: value === v ? 600 : 400
  });
  return /* @__PURE__ */ jsxs5("div", { style: seg, children: [
    /* @__PURE__ */ jsx5("div", { style: opt("and", "\u4E14"), onClick: () => onChange("and"), children: "\u4E14" }),
    /* @__PURE__ */ jsx5("div", { style: opt("or", "\u6216"), onClick: () => onChange("or"), children: "\u6216" })
  ] });
}
function CondRow({ cond, fields, onPatch, onRemove, indent }) {
  const inputWrap = { display: "flex", gap: 4, alignItems: "center" };
  const hasVal = cond.op === "eq" || cond.op === "neq" || cond.op === "lt" || cond.op === "gt";
  const isRange = cond.op === "range";
  const noVal = cond.op === "has" || cond.op === "empty";
  const isIn = cond.op === "in";
  const inCandidates = ["\u4E2D\u56FD", "\u7F8E\u56FD", "\u65E5\u672C", "\u97E9\u56FD", "\u5176\u4ED6"];
  return /* @__PURE__ */ jsxs5("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap", paddingLeft: indent ? 16 : 0 }, children: [
    /* @__PURE__ */ jsxs5("select", { style: inpSm, value: cond.field, onChange: (e) => onPatch({ ...cond, field: e.target.value }), children: [
      /* @__PURE__ */ jsx5("option", { value: "", children: "\u9009\u62E9\u5B57\u6BB5" }),
      fields.map((x) => /* @__PURE__ */ jsx5("option", { value: x.ref, children: x.label }, x.ref))
    ] }),
    /* @__PURE__ */ jsx5("select", { style: inpSm, value: cond.op, onChange: (e) => onPatch({ ...cond, op: e.target.value }), children: Object.keys(VISUAL_OP_LABEL).map((op) => /* @__PURE__ */ jsx5("option", { value: op, children: VISUAL_OP_LABEL[op] }, op)) }),
    hasVal && /* @__PURE__ */ jsx5(
      "input",
      {
        style: { ...inpSm, width: 160 },
        value: cond.value ?? "",
        placeholder: "\u8F93\u5165\u503C",
        onChange: (e) => onPatch({ ...cond, value: e.target.value })
      }
    ),
    isRange && /* @__PURE__ */ jsxs5("div", { style: inputWrap, children: [
      /* @__PURE__ */ jsx5(
        "input",
        {
          style: { ...inpSm, width: 110 },
          value: cond.value ?? "",
          placeholder: "\u6700\u5C0F\u503C",
          onChange: (e) => onPatch({ ...cond, value: e.target.value })
        }
      ),
      /* @__PURE__ */ jsx5("span", { style: { color: "#94A3B8", fontSize: 11 }, children: "~" }),
      /* @__PURE__ */ jsx5(
        "input",
        {
          style: { ...inpSm, width: 110 },
          value: cond.rangeMax ?? "",
          placeholder: "\u6700\u5927\u503C",
          onChange: (e) => onPatch({ ...cond, rangeMax: e.target.value })
        }
      )
    ] }),
    isIn && /* @__PURE__ */ jsxs5("div", { style: { ...inpSm, display: "inline-flex", gap: 4, flexWrap: "wrap", alignItems: "center", padding: "3px 6px", minWidth: 220 }, children: [
      (cond.values ?? []).map((v) => /* @__PURE__ */ jsxs5("span", { style: { display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, padding: "1px 6px", borderRadius: 10, background: "#DBEAFE", color: "#1D4ED8" }, children: [
        v,
        /* @__PURE__ */ jsx5("span", { style: { cursor: "pointer", fontWeight: 700 }, onClick: () => onPatch({ ...cond, values: (cond.values ?? []).filter((x) => x !== v) }), children: "\u2715" })
      ] }, v)),
      /* @__PURE__ */ jsxs5(
        "select",
        {
          style: { border: "none", background: "transparent", fontSize: 11, color: "#2563EB", outline: "none", cursor: "pointer" },
          value: "",
          onChange: (e) => {
            if (e.target.value) onPatch({ ...cond, values: [...cond.values ?? [], e.target.value] });
          },
          children: [
            /* @__PURE__ */ jsx5("option", { value: "", children: "+ \u591A\u9009\u503C" }),
            inCandidates.filter((c) => !(cond.values ?? []).includes(c)).map((c) => /* @__PURE__ */ jsx5("option", { value: c, children: c }, c))
          ]
        }
      )
    ] }),
    noVal && /* @__PURE__ */ jsx5("span", { style: { fontSize: 11, color: "#94A3B8" }, children: "\uFF08\u65E0\u9700\u8F93\u5165\u503C\uFF09" }),
    /* @__PURE__ */ jsx5(
      "button",
      {
        type: "button",
        onClick: onRemove,
        style: { border: "1px solid #FECACA", background: "#fff", color: "#DC2626", borderRadius: 6, padding: "3px 8px", fontSize: 12, cursor: "pointer" },
        children: "\u5220\u9664"
      }
    )
  ] });
}
function CondBuilder({ value, fields, onChange, title, sourceTag, showLogicHint = true }) {
  const vf = value ?? { logic: "and", groups: [], loose: [] };
  const setFilter = (f) => onChange(f);
  const groups = vf.groups ?? [];
  const loose = vf.loose ?? [];
  const hasGroups = groups.length > 0;
  const addCond = () => {
    if (!hasGroups) {
      setFilter({ ...vf, loose: [...loose, { field: "", op: "eq", value: "" }] });
    } else {
      const gi = groups.length - 1;
      setFilter({ ...vf, groups: groups.map((x, k) => k === gi ? { ...x, conds: [...x.conds ?? [], { field: "", op: "eq", value: "" }] } : x) });
    }
  };
  const addGroup = () => {
    if (loose.length) {
      setFilter({ ...vf, loose: [], groups: [{ logic: vf.logic, conds: loose }, ...groups] });
    } else {
      setFilter({ ...vf, groups: [...groups, { logic: "and", conds: [{ field: "", op: "eq", value: "" }] }] });
    }
  };
  return /* @__PURE__ */ jsxs5("div", { style: { border: "1px solid #E2E8F0", borderRadius: 10, padding: 12, background: "#FCFDFE" }, children: [
    /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 8, flexWrap: "wrap" }, children: [
      title,
      " ",
      sourceTag,
      /* @__PURE__ */ jsx5("span", { style: { fontSize: 11, fontWeight: 400, color: "#94A3B8" }, children: hasGroups ? `\u5171 ${groups.length} \u4E2A\u6761\u4EF6\u7EC4` : loose.length ? `${loose.length} \u4E2A\u6761\u4EF6` : "\u5C1A\u672A\u6DFB\u52A0\u6761\u4EF6" })
    ] }),
    hasGroups && /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "6px 10px", background: "#F1F5F9", borderRadius: 8 }, children: [
      /* @__PURE__ */ jsx5("span", { style: { fontSize: 12, color: "#64748B" }, children: "\u7EC4\u95F4\u5173\u7CFB\uFF1A" }),
      /* @__PURE__ */ jsx5(LogicSwitch, { value: vf.logic, onChange: (logic) => setFilter({ ...vf, logic }) }),
      /* @__PURE__ */ jsx5("span", { style: { fontSize: 11, color: "#94A3B8", marginLeft: 4 }, children: "\u6761\u4EF6\u7EC4\u4E4B\u95F4\u7528\u6B64\u5173\u7CFB\u8FDE\u63A5" })
    ] }),
    !hasGroups && loose.map((c, ci) => /* @__PURE__ */ jsx5(
      CondRow,
      {
        cond: c,
        fields,
        onPatch: (nc) => setFilter({ ...vf, loose: loose.map((y, j) => j === ci ? nc : y) }),
        onRemove: () => setFilter({ ...vf, loose: loose.filter((_, j) => j !== ci) })
      },
      ci
    )),
    !hasGroups && showLogicHint && /* @__PURE__ */ jsx5("div", { style: { fontSize: 11, color: "#94A3B8", marginBottom: 6 }, children: "\u63D0\u793A\uFF1A\u76F4\u63A5\u6DFB\u52A0\u7B5B\u9009\u6761\u4EF6\u5373\u53EF\uFF1B\u9700\u8981\u5D4C\u5957\u5173\u7CFB\u65F6\u53EF\u300C\uFF0B \u6DFB\u52A0\u6761\u4EF6\u7EC4\u300D\uFF0C\u5DF2\u6709\u6761\u4EF6\u4F1A\u81EA\u52A8\u5F52\u5165\u7B2C 1 \u7EC4\u3002" }),
    groups.map((g, gi) => /* @__PURE__ */ jsxs5("div", { style: { border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 12px", marginBottom: 8, background: "#fff" }, children: [
      /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#475569", marginBottom: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs5("span", { style: { color: "#64748B" }, children: [
          "\u7B2C ",
          gi + 1,
          " \u7EC4"
        ] }),
        /* @__PURE__ */ jsxs5("span", { style: { fontSize: 11, color: "#94A3B8" }, children: [
          "\u7EC4\u5185 ",
          /* @__PURE__ */ jsx5(LogicSwitch, { value: g.logic, onChange: (logic) => setFilter({ ...vf, groups: groups.map((x, k) => k === gi ? { ...x, logic } : x) }) })
        ] }),
        /* @__PURE__ */ jsxs5("span", { style: { fontSize: 11, color: "#94A3B8" }, children: [
          g.conds?.length ?? 0,
          " \u4E2A\u6761\u4EF6"
        ] }),
        /* @__PURE__ */ jsx5("span", { style: { marginLeft: "auto" }, children: /* @__PURE__ */ jsx5(
          "button",
          {
            type: "button",
            onClick: () => setFilter({ ...vf, groups: groups.filter((_, k) => k !== gi) }),
            style: { border: "1px solid #FECACA", background: "#fff", color: "#DC2626", borderRadius: 6, padding: "2px 8px", fontSize: 11, cursor: "pointer" },
            children: "\u5220\u9664\u7EC4"
          }
        ) })
      ] }),
      (g.conds ?? []).map((c, ci) => /* @__PURE__ */ jsx5(
        CondRow,
        {
          cond: c,
          fields,
          indent: true,
          onPatch: (nc) => setFilter({ ...vf, groups: groups.map((x, k) => k === gi ? { ...x, conds: x.conds.map((y, j) => j === ci ? nc : y) } : x) }),
          onRemove: () => setFilter({ ...vf, groups: groups.map((x, k) => k === gi ? { ...x, conds: x.conds.filter((_, j) => j !== ci) } : x) })
        },
        ci
      )),
      /* @__PURE__ */ jsx5(
        "button",
        {
          type: "button",
          onClick: () => setFilter({ ...vf, groups: groups.map((x, k) => k === gi ? { ...x, conds: [...x.conds ?? [], { field: "", op: "eq", value: "" }] } : x) }),
          style: { border: "1px dashed #93C5FD", background: "#EFF6FF", color: "#2563EB", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" },
          children: "\uFF0B \u7EC4\u5185\u6DFB\u52A0\u6761\u4EF6"
        }
      )
    ] }, gi)),
    /* @__PURE__ */ jsxs5("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsx5(
        "button",
        {
          type: "button",
          onClick: addCond,
          style: { border: "1px dashed #93C5FD", background: "#EFF6FF", color: "#2563EB", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" },
          children: "\uFF0B \u6DFB\u52A0\u6761\u4EF6"
        }
      ),
      /* @__PURE__ */ jsx5(
        "button",
        {
          type: "button",
          onClick: addGroup,
          style: { border: "1px dashed #93C5FD", background: "#EFF6FF", color: "#2563EB", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" },
          children: "\uFF0B \u6DFB\u52A0\u6761\u4EF6\u7EC4"
        }
      )
    ] }),
    /* @__PURE__ */ jsx5("div", { style: { fontSize: 11, color: "#94A3B8", marginTop: 6 }, children: "\u6761\u4EF6\u4E4B\u95F4\u7528\u300C\u4E14/\u6216\u300D\u8FDE\u63A5\uFF0C\u6761\u4EF6\u7EC4\u4E4B\u95F4\u4E5F\u53EF\u8BBE\u7F6E\u300C\u4E14/\u6216\u300D\uFF0C\u751F\u6210\u903B\u8F91\u81EA\u52A8\u52A0\u62EC\u53F7\u3002" })
  ] });
}

// src/console/crowdRule.ts
var CROWD_FIELDS = [
  { ref: "product", label: "\u4EA7\u54C1", group: "\u5BA2\u6237\u5C5E\u6027" },
  { ref: "loanStatus", label: "\u8D37\u6B3E\u72B6\u6001", group: "\u5BA2\u6237\u5C5E\u6027" },
  { ref: "creditLine", label: "\u6388\u4FE1\u989D\u5EA6\uFF08\u5143\uFF09", group: "\u5BA2\u6237\u5C5E\u6027" },
  { ref: "loanBalance", label: "\u5728\u8D37\u4F59\u989D\uFF08\u5143\uFF09", group: "\u5BA2\u6237\u5C5E\u6027" },
  { ref: "utilization", label: "\u989D\u5EA6\u4F7F\u7528\u7387\uFF08%\uFF09", group: "\u6D3E\u751F" },
  { ref: "score.zhicha", label: "\u667A\u5BDF\u5206\uFF08\u6B3A\u8BC8\uFF09", group: "\u6A21\u578B\u5206" },
  { ref: "score.zhixin", label: "\u667A\u4FE1\u5206\uFF08\u4FE1\u7528\uFF09", group: "\u6A21\u578B\u5206" },
  { ref: "score.zhirong", label: "\u667A\u878D\u5206\uFF08\u7EFC\u5408\uFF09", group: "\u6A21\u578B\u5206" }
];
function fallbackScore(c, prod) {
  const W = { \u6B3A\u8BC8: 0.3, \u591A\u5934: 0.25, \u884C\u4E3A: 0.2, \u53F8\u6CD5: 0.15, \u8D1F\u503A: 0.1, \u8206\u60C5: 0.05 };
  const used = (c.riskDims ?? []).filter((d) => W[d.dim] != null);
  if (!used.length) return null;
  const wsum = used.reduce((s, d) => s + W[d.dim], 0);
  const riskAvg = used.reduce((s, d) => s + d.score * W[d.dim], 0) / wsum;
  if (prod === "zhicha") return Math.round(riskAvg);
  if (prod === "zhixin") return Math.max(300, Math.min(900, Math.round(900 - riskAvg * 3.4)));
  return Math.max(300, Math.min(900, Math.round(900 - riskAvg * 3.8)));
}
function crowdFieldValue(c, ref) {
  switch (ref) {
    case "riskLevel":
      return (c.riskLevel ?? "") || "\u2014";
    case "product":
      return c.product ?? "";
    case "loanStatus":
      return c.loanStatus ?? "";
    case "creditLine":
      return c.creditLine ?? 0;
    case "loanBalance":
      return c.loanBalance ?? 0;
    case "utilization": {
      const l = c.loanBalance ?? 0;
      const cl = c.creditLine ?? 0;
      return cl > 0 ? Math.round(l / cl * 1e3) / 10 : 0;
    }
    default: {
      if (ref.startsWith("score.")) {
        const p = ref.slice(6);
        const s = c.scores?.[p]?.score;
        if (s != null) return s;
        return fallbackScore(c, p) ?? -1;
      }
      return "";
    }
  }
}
function matchCond(cond, c) {
  if (!cond.field) return false;
  const v = crowdFieldValue(c, cond.field);
  const empty = v === "" || v === "\u2014" || v == null;
  if (cond.op === "empty") return empty;
  if (cond.op === "has") return !empty;
  if (empty) return false;
  const num = typeof v === "number";
  const n = (s) => Number(String(s ?? "").trim());
  switch (cond.op) {
    case "eq":
      return String(v) === String(cond.value ?? "").trim();
    case "neq":
      return String(v) !== String(cond.value ?? "").trim();
    case "lt":
      return num ? v < n(cond.value) : false;
    case "gt":
      return num ? v > n(cond.value) : false;
    case "range":
      return num ? v >= n(cond.value) && v <= n(cond.rangeMax) : false;
    case "in":
      return (cond.values ?? []).includes(String(v));
    default:
      return false;
  }
}
function matchCrowd(c, conds, logic = "and") {
  const list = (conds ?? []).filter((x) => x.field);
  if (!list.length) return false;
  return logic === "or" ? list.some((x) => matchCond(x, c)) : list.every((x) => matchCond(x, c));
}
function crowdMembers(g, customers2) {
  return customers2.filter((c) => matchCrowd(c, g.conds, g.logic));
}
function crowdRuleText(conds, logic = "and") {
  const list = (conds ?? []).filter((x) => x.field);
  if (!list.length) return "\u2014";
  const parts = list.map((c) => {
    const f = CROWD_FIELDS.find((x) => x.ref === c.field);
    const fn = f?.label ?? c.field;
    const opn = VISUAL_OP_LABEL[c.op] ?? c.op;
    if (c.op === "has") return `${fn} \u6709\u503C`;
    if (c.op === "empty") return `${fn} \u6CA1\u503C`;
    if (c.op === "in") return `${fn} \u5305\u542B ${(c.values ?? []).join("\u3001")}`;
    if (c.op === "range") return `${fn} \u533A\u95F4 ${c.value ?? ""}~${c.rangeMax ?? ""}`;
    return `${fn} ${opn} ${c.value ?? ""}`;
  });
  return parts.join(logic === "or" ? " \u6216 " : " \u4E14 ");
}
function crowdRuleValid(conds) {
  return (conds ?? []).some((c) => c.field && String(c.value ?? "") !== "");
}

// src/console/CrowdDrawer.tsx
import { Fragment as Fragment6, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var now = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
var PREVIEW_N = 20;
function riskKindOf(level) {
  const l = (level ?? "").replace("\u98CE\u9669", "");
  if (l === "\u9AD8") return "red";
  if (l === "\u4E2D") return "amber";
  return "green";
}
function CrowdDrawer({ open, onClose, editing, customers: customers2, onSave }) {
  const [name, setName] = useState5("");
  const [filter, setFilter] = useState5(emptyFilter());
  useEffect4(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    const list = (editing?.conds ?? []).filter((c) => c.field);
    setFilter({ logic: editing?.logic ?? "and", groups: [], loose: list.length ? list : [{ field: "", op: "eq", value: "" }] });
  }, [open, editing]);
  const conds = filter.loose ?? [];
  const members = useMemo3(() => crowdMembers({ conds, logic: filter.logic }, customers2), [conds, filter.logic, customers2]);
  const valid = crowdRuleValid(conds);
  const ruleText = useMemo3(() => crowdRuleText(conds, filter.logic), [conds, filter.logic]);
  const save = () => {
    const n = name.trim();
    if (!n || !valid) return;
    const base = conds.filter((c) => c.field);
    const g = editing ? { ...editing, name: n, rule: ruleText, conds: base, logic: filter.logic, count: members.length, updatedAt: now() } : { id: "g-" + Date.now().toString(36), name: n, rule: ruleText, conds: base, logic: filter.logic, count: members.length, createdAt: now(), updatedAt: now() };
    onSave(g);
    onClose();
  };
  return /* @__PURE__ */ jsx6(RightDrawer, { open, onClose, title: editing ? `\u7F16\u8F91\u5206\u7EC4 \xB7 ${editing.name}` : "\u65B0\u589E\u5BA2\u6237\u5206\u7EC4", width: 640, children: /* @__PURE__ */ jsxs6("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs6("div", { children: [
      /* @__PURE__ */ jsx6("div", { className: "mb-1 text-xs text-slate-500", children: "\u5206\u7EC4\u540D\u79F0 *" }),
      /* @__PURE__ */ jsx6(
        "input",
        {
          value: name,
          onChange: (e) => setName(e.target.value),
          placeholder: "\u5982\uFF1A\u667A\u878D\u5206\u5927\u4E8E 680 \u7684\u5BA2\u6237",
          className: "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-400"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs6("div", { children: [
      /* @__PURE__ */ jsx6("div", { className: "mb-1 text-xs text-slate-500", children: "\u5206\u7EC4\u89C4\u5219\uFF08\u6EE1\u8DB3\u6761\u4EF6\u5373\u5165\u9009\uFF09" }),
      /* @__PURE__ */ jsx6(
        CondBuilder,
        {
          title: "\u89C4\u5219\u6761\u4EF6",
          value: filter,
          fields: CROWD_FIELDS.map((f) => ({ ref: f.ref, label: `${f.label}\uFF08${f.group}\uFF09` })),
          onChange: setFilter,
          showLogicHint: false
        }
      ),
      /* @__PURE__ */ jsxs6("div", { className: "mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600", children: [
        "\u89C4\u5219\uFF1A",
        /* @__PURE__ */ jsx6("span", { className: "font-medium text-ink-900", children: valid ? ruleText : "\u5C1A\u672A\u5B8C\u6574\u914D\u7F6E\u89C4\u5219" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs6("div", { className: "rounded-xl border border-slate-200 p-3", children: [
      /* @__PURE__ */ jsxs6("div", { className: "mb-2 flex items-baseline gap-3", children: [
        /* @__PURE__ */ jsx6("span", { className: "text-sm font-semibold text-ink-900", children: "\u89C4\u5219\u9884\u89C8" }),
        /* @__PURE__ */ jsx6("span", { className: "text-xs text-slate-400", children: "\u6210\u5458\u6570\u7531\u89C4\u5219\u8BA1\u7B97\u8FD4\u56DE\uFF0C\u4E0D\u53EF\u7F16\u8F91" }),
        /* @__PURE__ */ jsx6("span", { className: "ml-auto text-lg font-bold text-brand-600 tabular-nums", children: members.length }),
        /* @__PURE__ */ jsxs6("span", { className: "text-xs text-slate-400", children: [
          "\u547D\u4E2D / \u5171 ",
          customers2.length,
          " \u5BA2\u6237"
        ] })
      ] }),
      members.length ? /* @__PURE__ */ jsxs6(Fragment6, { children: [
        /* @__PURE__ */ jsx6("div", { className: "max-h-[300px] overflow-auto rounded-lg border border-slate-100", children: members.slice(0, PREVIEW_N).map((c, i) => /* @__PURE__ */ jsxs6(
          "div",
          {
            className: "flex items-center gap-2 border-b border-slate-50 px-2 py-1.5 text-xs text-slate-500 last:border-b-0 hover:bg-slate-50",
            children: [
              /* @__PURE__ */ jsx6("span", { className: "w-5 text-right text-slate-300 tabular-nums", children: i + 1 }),
              /* @__PURE__ */ jsx6("span", { className: "font-medium text-ink-900", children: c?.custId ?? "\u2014" }),
              /* @__PURE__ */ jsx6("span", { children: c?.name ?? "\u2014" }),
              /* @__PURE__ */ jsx6("span", { className: "text-slate-400", children: c?.product ?? "\u2014" }),
              /* @__PURE__ */ jsx6(Badge, { kind: riskKindOf(c?.riskLevel), children: (c?.riskLevel ?? "\u2014").replace("\u98CE\u9669", "") }),
              /* @__PURE__ */ jsxs6("span", { className: "ml-auto tabular-nums", children: [
                "\u667A\u878D ",
                c?.scores?.zhirong?.score ?? "\u2014"
              ] })
            ]
          },
          c?.custId ?? ""
        )) }),
        members.length > PREVIEW_N && /* @__PURE__ */ jsxs6("div", { className: "mt-1 text-right text-[11px] text-slate-400", children: [
          "\u4EC5\u5C55\u793A\u524D ",
          PREVIEW_N,
          " \u6761\uFF0C\u5171\u547D\u4E2D ",
          members.length,
          " \u6761"
        ] })
      ] }) : /* @__PURE__ */ jsx6("div", { className: "rounded-lg bg-slate-50 px-3 py-6 text-center text-xs text-slate-400", children: valid ? "\u6682\u65E0\u5BA2\u6237\u547D\u4E2D\u8BE5\u89C4\u5219" : "\u8BF7\u5148\u914D\u7F6E\u5B8C\u6574\u7684\u89C4\u5219\u6761\u4EF6" })
    ] }),
    /* @__PURE__ */ jsxs6("div", { className: "flex justify-end gap-2 border-t border-slate-100 pt-3", children: [
      /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "ghost", onClick: onClose, children: "\u53D6\u6D88" }),
      /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "primary", onClick: save, disabled: !name.trim() || !valid, children: editing ? "\u4FDD\u5B58\u4FEE\u6539" : "\u786E\u8BA4\u65B0\u589E" })
    ] })
  ] }) });
}

// src/console/ScoreCrowd.tsx
import { Fragment as Fragment7, jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function riskKindOf2(level) {
  const l = (level ?? "").replace("\u98CE\u9669", "");
  if (l === "\u9AD8") return "red";
  if (l === "\u4E2D") return "amber";
  return "green";
}
var CARD_PREVIEW_N = 5;
function ScoreCrowdPage() {
  const data2 = useScore();
  const customers2 = useMidCustomers();
  const nav = useNavigate();
  const crowds = data2.crowds ?? [];
  const [drawerOpen, setDrawerOpen] = useState6(false);
  const [editing, setEditing] = useState6(null);
  const openNew = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (g) => {
    setEditing(g);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);
  const saveGroup = (g) => {
    updateScore((d) => ({
      ...d,
      crowds: d.crowds.some((x) => x.id === g.id) ? d.crowds.map((x) => x.id === g.id ? g : x) : [...d.crowds, g]
    }));
  };
  const removeGroup = (id) => {
    updateScore((d) => ({ ...d, crowds: d.crowds.filter((g) => g.id !== id) }));
  };
  const openDetail = (custId) => nav("/console/cr/mid-cust-score?cust=" + custId + "&prod=zhixin&back=" + encodeURIComponent("/console/sc/crowd-groups"));
  const openList = (g) => nav("/console/sc/customer-list?group=" + g.id);
  return /* @__PURE__ */ jsxs7(Fragment7, { children: [
    /* @__PURE__ */ jsx7(PageShell, { title: "\u5BA2\u6237\u5206\u7EC4", crumb: "\u8BC4\u5206\u4EA7\u54C1 / \u5BA2\u6237\u6D1E\u5BDF" }),
    /* @__PURE__ */ jsxs7("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx7(Sam, { value: "scoreData.json" }),
          /* @__PURE__ */ jsx7("p", { className: "text-xs text-slate-400", children: "\u6309\u89C4\u5219\u5B9A\u4E49\u5BA2\u7FA4\uFF1A\u6210\u5458\u6570\u7531\u89C4\u5219\u5B9E\u65F6\u8BA1\u7B97\uFF0C\u70B9\u51FB\u5206\u7EC4\u8FDB\u5165\u8BE5\u5206\u7EC4\u7684\u5BA2\u6237\u5217\u8868\u3002" })
        ] }),
        /* @__PURE__ */ jsx7(Button, { size: "sm", variant: "primary", onClick: openNew, children: "\uFF0B \u65B0\u589E\u5206\u7EC4" })
      ] }),
      /* @__PURE__ */ jsx7("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", children: crowds.map((group) => {
        const list = useCrowdMembers(group, customers2);
        const preview = list.slice(0, CARD_PREVIEW_N);
        return /* @__PURE__ */ jsxs7(
          "div",
          {
            className: "flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition hover:border-brand-400 hover:shadow-md",
            children: [
              /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx7("span", { className: "text-[15px] font-semibold text-ink-900", children: group.name }),
                /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-2 opacity-0 transition group-hover:opacity-100", children: [
                  /* @__PURE__ */ jsx7(
                    "button",
                    {
                      type: "button",
                      onClick: () => openEdit(group),
                      className: "rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-500 transition hover:border-brand-400 hover:text-brand-600",
                      children: "\u7F16\u8F91"
                    }
                  ),
                  /* @__PURE__ */ jsx7(
                    "button",
                    {
                      type: "button",
                      title: "\u5220\u9664\u8BE5\u5206\u7EC4",
                      onClick: () => removeGroup(group.id),
                      className: "rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-400 transition hover:border-rose-300 hover:text-rose-600",
                      children: "\u5220\u9664"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx7("div", { className: "mt-2 min-h-[40px] text-sm leading-relaxed text-slate-500", children: group.rule }),
              /* @__PURE__ */ jsxs7("div", { className: "mt-3 flex items-end gap-2", children: [
                /* @__PURE__ */ jsx7("span", { className: "text-[26px] font-bold leading-none text-ink-900 tabular-nums", children: list.length.toLocaleString() }),
                /* @__PURE__ */ jsxs7("span", { className: "mb-0.5 text-xs text-slate-400", children: [
                  "\u6210\u5458 / ",
                  customers2.length,
                  " \u5BA2\u6237",
                  /* @__PURE__ */ jsx7("span", { className: "ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500", children: "\u5B9E\u65F6\u8BA1\u7B97" })
                ] })
              ] }),
              preview.length > 0 ? /* @__PURE__ */ jsx7("div", { className: "mt-3 flex-1 space-y-1", children: preview.map((c) => /* @__PURE__ */ jsxs7(
                "button",
                {
                  type: "button",
                  onClick: () => openDetail(c?.custId ?? ""),
                  className: "flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-50",
                  children: [
                    /* @__PURE__ */ jsx7("span", { className: "text-ink-900", children: c?.custId ?? "\u2014" }),
                    /* @__PURE__ */ jsx7("span", { children: c?.name ?? "\u2014" }),
                    /* @__PURE__ */ jsx7(Badge, { kind: riskKindOf2(c?.riskLevel), children: (c?.riskLevel ?? "\u2014").replace("\u98CE\u9669", "") }),
                    /* @__PURE__ */ jsxs7("span", { className: "ml-auto tabular-nums", children: [
                      "\u667A\u878D ",
                      c?.scores?.zhirong?.score ?? "\u2014"
                    ] })
                  ]
                },
                c?.custId ?? ""
              )) }) : /* @__PURE__ */ jsx7("div", { className: "mt-3 flex-1 rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-400", children: "\u6682\u65E0\u6210\u5458" }),
              /* @__PURE__ */ jsx7("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsxs7(Button, { variant: "secondary", size: "sm", onClick: () => openList(group), children: [
                "\u67E5\u770B\u5168\u90E8\u6210\u5458\uFF08",
                list.length,
                "\uFF09 \u2192"
              ] }) })
            ]
          },
          group.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsx7(
      CrowdDrawer,
      {
        open: drawerOpen,
        onClose: closeDrawer,
        editing,
        customers: customers2,
        onSave: saveGroup
      }
    )
  ] });
}
function useCrowdMembers(group, customers2) {
  return useMemo4(
    () => crowdMembers({ conds: group.conds, logic: group.logic }, customers2),
    [group.conds, group.logic, customers2]
  );
}

// src/console/ScoreCustomerList.tsx
import { useMemo as useMemo5, useState as useState7 } from "react";
import { Fragment as Fragment8, jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function riskKindOf3(level) {
  const l = (level ?? "").replace("\u98CE\u9669", "");
  if (l === "\u9AD8") return "red";
  if (l === "\u4E2D") return "amber";
  return "green";
}
function tagFrom(level) {
  const l = (level ?? "").replace("\u98CE\u9669", "");
  if (l === "\u9AD8") return "\u9AD8\u98CE\u9669";
  if (l === "\u4E2D") return "\u5173\u6CE8";
  return "\u6B63\u5E38";
}
function ScoreCustomerListPage() {
  const data2 = useScore();
  const customers2 = useMidCustomers();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const groupId = params.get("group");
  const [q, setQ] = useState7("");
  const group = groupId ? (data2.crowds ?? []).find((c) => c.id === groupId) : void 0;
  const [drawerOpen, setDrawerOpen] = useState7(false);
  const saveGroup = (g) => {
    updateScore((d) => ({
      ...d,
      crowds: d.crowds.some((x) => x.id === g.id) ? d.crowds.map((x) => x.id === g.id ? g : x) : [...d.crowds, g]
    }));
  };
  const members = useMemo5(
    () => group ? crowdMembers(group, customers2) : customers2,
    [group, customers2]
  );
  const openDetail = (custId) => nav("/console/cr/mid-cust-score?cust=" + custId + "&prod=zhixin&back=" + encodeURIComponent("/console/sc/customer-list" + (groupId ? "?group=" + groupId : "")));
  const rows = useMemo5(() => {
    const ql = (q ?? "").trim().toLowerCase();
    return members.filter((c) => {
      if (!ql) return true;
      const name = (c?.name ?? "").toLowerCase();
      const id = (c?.custId ?? "").toLowerCase();
      return name.includes(ql) || id.includes(ql);
    }).map((c) => {
      const level = c?.riskLevel ?? "\u2014";
      const score = c?.scores?.zhixin?.score ?? "\u2014";
      return {
        id: c?.custId ?? "",
        custId: c?.custId ?? "\u2014",
        name: c?.name ?? "\u2014",
        product: c?.product ?? "\u2014",
        riskLevel: { v: level.replace("\u98CE\u9669", ""), kind: riskKindOf3(level) },
        score: typeof score === "number" ? String(score) : "\u2014",
        tag: { v: tagFrom(level), kind: riskKindOf3(level) },
        action: /* @__PURE__ */ jsx8(Button, { size: "sm", variant: "ghost", onClick: () => openDetail(c?.custId ?? ""), children: "\u67E5\u770B" })
      };
    });
  }, [members, q]);
  const columns = [
    { key: "custId", label: "\u5BA2\u6237\u53F7" },
    { key: "name", label: "\u59D3\u540D" },
    { key: "product", label: "\u4EA7\u54C1" },
    { key: "riskLevel", label: "\u98CE\u9669\u7B49\u7EA7" },
    { key: "score", label: "\u667A\u4FE1\u5206" },
    { key: "tag", label: "\u6807\u7B7E" },
    { key: "action", label: "\u64CD\u4F5C" }
  ];
  return /* @__PURE__ */ jsxs8(Fragment8, { children: [
    /* @__PURE__ */ jsx8(
      PageShell,
      {
        header: /* @__PURE__ */ jsx8(
          DetailHeader,
          {
            title: group ? group.name : "\u5BA2\u6237\u5217\u8868",
            crumb: "\u8BC4\u5206\u4EA7\u54C1 / \u5BA2\u6237\u6D1E\u5BDF / \u5BA2\u6237\u5217\u8868",
            subtitle: group ? `\u5206\u7EC4\u89C4\u5219\uFF1A${group.rule} \xB7 \u6210\u5458 ${members.length} \u4EBA\uFF08\u89C4\u5219\u5B9E\u65F6\u8BA1\u7B97\uFF09` : "\u5168\u90E8\u5BA2\u6237",
            backLabel: "\u2190 \u8FD4\u56DE\u5BA2\u6237\u5206\u7EC4",
            onBack: () => nav("/console/sc/crowd-groups"),
            actions: /* @__PURE__ */ jsxs8(Fragment8, { children: [
              /* @__PURE__ */ jsx8(
                "input",
                {
                  value: q,
                  onChange: (e) => setQ(e.target.value),
                  placeholder: "\u641C\u7D22\u5BA2\u6237\u53F7/\u59D3\u540D",
                  className: "rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-ink-900 outline-none focus:border-brand-600"
                }
              ),
              group && /* @__PURE__ */ jsx8(Button, { size: "sm", variant: "secondary", onClick: () => setDrawerOpen(true), children: "\u7F16\u8F91\u5206\u7EC4" })
            ] })
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs8("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx8(Sam, { value: "midCustomers.json" }),
      /* @__PURE__ */ jsx8(Panel, { children: /* @__PURE__ */ jsx8(
        DataTable,
        {
          columns,
          rows,
          clickableKey: "custId",
          onCellClick: (r) => openDetail(String(r.custId)),
          defaultPageSize: 15,
          empty: "\u6682\u65E0\u5BA2\u6237"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx8(
      CrowdDrawer,
      {
        open: drawerOpen,
        onClose: () => setDrawerOpen(false),
        editing: group ?? null,
        customers: customers2,
        onSave: saveGroup
      }
    )
  ] });
}

// src/console/ScoreModelManage.tsx
import { Fragment as Fragment9, jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var MODEL_COLOR = {
  zhicha: "#ef4444",
  zhixin: "#22c55e",
  zhirong: "#8b5cf6"
};
function ScoreModelManagePage() {
  const data2 = useScore();
  const nav = useNavigate();
  const prods = ["zhicha", "zhixin", "zhirong"];
  const toggleEnabled = (prod) => updateScore((d) => ({
    ...d,
    models: d.models.map((m) => m.prod === prod ? { ...m, enabled: !m.enabled } : m)
  }));
  return /* @__PURE__ */ jsxs9(Fragment9, { children: [
    /* @__PURE__ */ jsx9(
      PageShell,
      {
        title: "\u6A21\u578B\u7BA1\u7406",
        subtitle: "\u8BC4\u5206\u4EA7\u54C1\u4E0B\u6240\u6709\u6A21\u578B\u5217\u8868\uFF0C\u70B9\u51FB\u5361\u7247\u8FDB\u5165\u6A21\u578B\u8BE6\u60C5\uFF08\u57FA\u672C\u4FE1\u606F\u3001\u7B97\u6CD5\u7F16\u8F91\u3001\u7248\u672C\u7BA1\u7406\uFF09",
        crumb: "\u8BC4\u5206\u4EA7\u54C1 / \u6A21\u578B\u7BA1\u7406"
      }
    ),
    /* @__PURE__ */ jsxs9("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx9("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: prods.map((p) => {
        const m = data2.models.find((x) => x.prod === p);
        return /* @__PURE__ */ jsxs9(
          "button",
          {
            onClick: () => nav("/console/sc/model-detail?prod=" + p),
            className: "group rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-card transition hover:border-brand-300 hover:shadow-lg",
            children: [
              /* @__PURE__ */ jsxs9("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx9("span", { className: "h-3 w-3 rounded-full", style: { background: MODEL_COLOR[p] } }),
                  /* @__PURE__ */ jsx9("span", { className: "text-base font-semibold text-ink-900", children: m.name })
                ] }),
                /* @__PURE__ */ jsx9(Badge, { kind: m.enabled ? "green" : "gray", children: m.enabled ? "\u5DF2\u542F\u7528" : "\u5DF2\u505C\u7528" })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "mt-3 flex items-end gap-2", children: [
                /* @__PURE__ */ jsx9("span", { className: "text-3xl font-bold tabular-nums", style: { color: MODEL_COLOR[p] }, children: m.score }),
                /* @__PURE__ */ jsxs9("span", { className: "mb-1 text-xs text-slate-400", children: [
                  "\u5F53\u524D\u5F97\u5206 \xB7 ",
                  m.range[0],
                  "\u2013",
                  m.range[1]
                ] })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "mt-3 space-y-1 text-sm text-slate-500", children: [
                /* @__PURE__ */ jsxs9("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx9("span", { children: "\u7B97\u6CD5\u7C7B\u578B" }),
                  /* @__PURE__ */ jsx9("span", { className: "text-slate-700", children: m.algoType })
                ] }),
                /* @__PURE__ */ jsxs9("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx9("span", { children: "\u7248\u672C" }),
                  /* @__PURE__ */ jsx9("span", { className: "text-slate-700", children: m.version })
                ] }),
                /* @__PURE__ */ jsxs9("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx9("span", { children: "\u66F4\u65B0\u65F6\u95F4" }),
                  /* @__PURE__ */ jsx9("span", { className: "text-slate-700", children: m.updatedAt })
                ] }),
                /* @__PURE__ */ jsxs9("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx9("span", { children: "\u56E0\u5B50\u6570" }),
                  /* @__PURE__ */ jsx9("span", { className: "text-slate-700", children: m.factors.length })
                ] })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "mt-4 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx9(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    onClick: (e) => {
                      e.stopPropagation();
                      toggleEnabled(p);
                    },
                    children: m.enabled ? "\u505C\u7528" : "\u542F\u7528"
                  }
                ),
                /* @__PURE__ */ jsx9("span", { className: "text-sm font-medium text-brand-600 group-hover:underline", children: "\u8FDB\u5165\u8BE6\u60C5 \u2192" })
              ] })
            ]
          },
          p
        );
      }) }),
      /* @__PURE__ */ jsx9(Panel, { title: "\u8BF4\u660E", actions: /* @__PURE__ */ jsx9(Sam, { value: "scoreData.json" }), children: /* @__PURE__ */ jsx9("p", { className: "text-sm text-slate-500", children: "\u8BC4\u5206\u4EA7\u54C1\u5305\u542B\u4E09\u4E2A\u6A21\u578B\uFF1A\u667A\u5BDF\u5206\uFF08\u6B3A\u8BC8\u8BC6\u522B\uFF09\u3001\u667A\u4FE1\u5206\uFF08\u4FE1\u7528\u8FDD\u7EA6\uFF09\u3001\u667A\u878D\u5206\uFF08\u7EFC\u5408\u4EF7\u503C\uFF09\u3002 \u70B9\u51FB\u4EFB\u4E00\u6A21\u578B\u5361\u7247\u8FDB\u5165\u8BE6\u60C5\u9875\uFF0C\u53EF\u67E5\u770B\u4E0E\u7F16\u8F91\u57FA\u672C\u4FE1\u606F\u3001\u4EE5\u300C\u53EF\u89C6\u5316 / \u4EE3\u7801\u300D\u4E24\u79CD\u65B9\u5F0F\u7F16\u8F91\u7B97\u6CD5\u3001\u5E76\u7BA1\u7406\u8BE5\u6A21\u578B\u7684\u7248\u672C\u3002" }) })
    ] })
  ] });
}

// src/console/ScoreModelDetail.tsx
import { useEffect as useEffect8, useState as useState11 } from "react";

// src/components/charts.tsx
import { useState as useState8, useRef as useRef4, useEffect as useEffect5 } from "react";
import { Fragment as Fragment10, jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
function useContainerWidth(fallback = 640) {
  const ref = useRef4(null);
  const [w, setW] = useState8(fallback);
  useEffect5(() => {
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
  const [hover, setHover] = useState8(null);
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = rect.width / W;
    const px = e.clientX - rect.left;
    const idx = Math.round((px / ratio - padL) / plotW * (labels.length - 1));
    setHover(idx >= 0 && idx < labels.length ? idx : null);
  };
  return /* @__PURE__ */ jsxs10("div", { ref: wrapRef, children: [
    /* @__PURE__ */ jsxs10("svg", { viewBox: `0 0 ${W} ${H}`, style: { height, width: width ?? "100%" }, onMouseMove: onMove, onMouseLeave: () => setHover(null), children: [
      Array.from({ length: grid + 1 }).map((_, i) => {
        const gy = padT + i / grid * plotH;
        const val = max - i / grid * (max - min);
        return /* @__PURE__ */ jsxs10("g", { children: [
          /* @__PURE__ */ jsx10("line", { x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: "#eef2f7", strokeWidth: 1 }),
          /* @__PURE__ */ jsxs10("text", { x: padL - 8, y: gy + 4, textAnchor: "end", className: "fill-slate-400", fontSize: 11, children: [
            Math.round(val),
            unit
          ] })
        ] }, i);
      }),
      labels.map((lb, i) => /* @__PURE__ */ jsx10("text", { x: x(i), y: H - 10, textAnchor: "middle", className: "fill-slate-400", fontSize: 11, children: lb }, lb)),
      series.map((s) => /* @__PURE__ */ jsx10(
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
        (s) => s.data.map((v, i) => /* @__PURE__ */ jsx10(
          "circle",
          {
            cx: x(i),
            cy: y(v),
            r: hover === i ? 5 : 3,
            fill: s.color,
            stroke: hover === i ? "#fff" : "none",
            strokeWidth: 2,
            style: { cursor: "crosshair", transition: "r .12s" },
            children: /* @__PURE__ */ jsx10("title", { children: `${labels[i]} \xB7 ${s.name}: ${v}${unit}` })
          },
          `${s.name}-${i}`
        ))
      ),
      hover != null && /* @__PURE__ */ jsxs10("g", { pointerEvents: "none", children: [
        /* @__PURE__ */ jsx10("line", { x1: x(hover), y1: padT, x2: x(hover), y2: padT + plotH, stroke: "#CBD5E1", strokeDasharray: "4 3", strokeWidth: 1 }),
        series.map((s) => {
          const v = s.data[hover] ?? 0;
          return /* @__PURE__ */ jsxs10("g", { children: [
            /* @__PURE__ */ jsx10("rect", { x: x(hover) - 34, y: Math.min(y(v) - 26, padT), width: 68, height: 20, rx: 6, fill: "#0F172A", opacity: 0.85 }),
            /* @__PURE__ */ jsxs10("text", { x: x(hover), y: Math.min(y(v) - 12, padT + 13), textAnchor: "middle", fontSize: 11, fontWeight: 600, fill: "#fff", children: [
              v,
              unit
            ] })
          ] }, s.name);
        }),
        /* @__PURE__ */ jsx10("text", { x: x(hover), y: H - 24, textAnchor: "middle", fontSize: 10, fill: "#64748B", children: labels[hover] })
      ] })
    ] }),
    /* @__PURE__ */ jsx10("div", { className: "mt-2 flex flex-wrap gap-4", children: series.map((s) => /* @__PURE__ */ jsxs10("span", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
      /* @__PURE__ */ jsx10("span", { className: "h-2.5 w-2.5 rounded-full", style: { background: s.color } }),
      s.name
    ] }, s.name)) })
  ] });
}
function BarChart({
  labels,
  series,
  height = 240,
  unit = ""
}) {
  const [wrapRef, measured] = useContainerWidth(640);
  const W = measured;
  const H = height;
  const padL = 46;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(1, ...series.flatMap((s) => s.data));
  const groupW = plotW / labels.length;
  const barW = Math.min(34, groupW * 0.7 / series.length);
  const y = (v) => padT + plotH - v / max * plotH;
  const grid = 4;
  const [hover, setHover] = useState8(null);
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = rect.width / W;
    const px = e.clientX - rect.left;
    const idx = Math.floor((px / ratio - padL) / plotW * labels.length);
    setHover(idx >= 0 && idx < labels.length ? idx : null);
  };
  return /* @__PURE__ */ jsxs10("div", { ref: wrapRef, children: [
    /* @__PURE__ */ jsxs10("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full", style: { height }, onMouseMove: onMove, onMouseLeave: () => setHover(null), children: [
      Array.from({ length: grid + 1 }).map((_, i) => {
        const gy = padT + i / grid * plotH;
        const val = max - i / grid * max;
        return /* @__PURE__ */ jsxs10("g", { children: [
          /* @__PURE__ */ jsx10("line", { x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: "#eef2f7", strokeWidth: 1 }),
          /* @__PURE__ */ jsxs10("text", { x: padL - 8, y: gy + 4, textAnchor: "end", className: "fill-slate-400", fontSize: 11, children: [
            Math.round(val),
            unit
          ] })
        ] }, i);
      }),
      labels.map((lb, gi) => {
        const gx = padL + gi * groupW + groupW / 2;
        return /* @__PURE__ */ jsxs10("g", { children: [
          series.map((s, si) => {
            const v = s.data[gi] ?? 0;
            const bx = gx - series.length * barW / 2 + si * barW;
            const on = hover === gi;
            return /* @__PURE__ */ jsx10(
              "rect",
              {
                x: bx,
                y: y(v),
                width: barW - 3,
                height: plotH - (y(v) - padT),
                rx: 3,
                fill: s.color,
                opacity: on ? 1 : 0.82,
                stroke: on ? "#0F172A" : "none",
                strokeWidth: on ? 1 : 0,
                style: { cursor: "crosshair", transition: "opacity .12s" },
                children: /* @__PURE__ */ jsx10("title", { children: `${lb} \xB7 ${s.name}: ${v}${unit}` })
              },
              s.name
            );
          }),
          /* @__PURE__ */ jsx10("text", { x: gx, y: H - 10, textAnchor: "middle", className: "fill-slate-400", fontSize: 11, children: lb })
        ] }, lb);
      }),
      hover != null && /* @__PURE__ */ jsx10("g", { pointerEvents: "none", children: series.map((s, si) => {
        const v = s.data[hover] ?? 0;
        const gx = padL + hover * groupW + groupW / 2;
        const bx = gx - series.length * barW / 2 + si * barW;
        return /* @__PURE__ */ jsxs10("g", { children: [
          /* @__PURE__ */ jsx10("rect", { x: bx, y: y(v) - 22, width: barW, height: 18, rx: 4, fill: s.color }),
          /* @__PURE__ */ jsxs10("text", { x: bx + (barW - 3) / 2, y: y(v) - 9, textAnchor: "middle", fontSize: 10, fontWeight: 600, fill: "#fff", children: [
            v,
            unit
          ] })
        ] }, s.name);
      }) })
    ] }),
    /* @__PURE__ */ jsx10("div", { className: "mt-2 flex flex-wrap gap-4", children: series.map((s) => /* @__PURE__ */ jsxs10("span", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
      /* @__PURE__ */ jsx10("span", { className: "h-2.5 w-2.5 rounded-full", style: { background: s.color } }),
      s.name
    ] }, s.name)) })
  ] });
}
function DonutChart({
  data: data2,
  centerLabel,
  centerValue,
  height = 220
}) {
  const size = height;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const total = data2.reduce((a, d) => a + d.value, 0) || 1;
  let acc = 0;
  const segs = data2.map((d) => {
    const frac = d.value / total;
    const start = acc * 2 * Math.PI - Math.PI / 2;
    acc += frac;
    const end = acc * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = frac > 0.5 ? 1 : 0;
    return { d, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}` };
  });
  const [hover, setHover] = useState8(null);
  const hov = hover != null ? segs[hover] : null;
  const hovFrac = hov ? hov.d.value / total : 0;
  return /* @__PURE__ */ jsxs10("div", { className: "flex items-center gap-6", children: [
    /* @__PURE__ */ jsxs10("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, className: "shrink-0", children: [
      /* @__PURE__ */ jsx10("circle", { cx, cy, r, fill: "none", stroke: "#eef2f7", strokeWidth: stroke }),
      segs.map((s, i) => /* @__PURE__ */ jsx10(
        "path",
        {
          d: s.path,
          fill: "none",
          stroke: s.d.color,
          strokeWidth: hover === i ? stroke + 7 : stroke,
          strokeLinecap: "butt",
          style: { cursor: "pointer", transition: "stroke-width .12s" },
          onMouseEnter: () => setHover(i),
          onMouseLeave: () => setHover(null),
          children: /* @__PURE__ */ jsx10("title", { children: `${s.d.label}: ${s.d.value}\uFF08${(s.d.value / total * 100).toFixed(1)}%\uFF09` })
        },
        i
      )),
      hov ? /* @__PURE__ */ jsxs10(Fragment10, { children: [
        /* @__PURE__ */ jsxs10("text", { x: cx, y: cy - 4, textAnchor: "middle", fill: hov.d.color, fontSize: 22, fontWeight: 700, children: [
          (hovFrac * 100).toFixed(1),
          "%"
        ] }),
        /* @__PURE__ */ jsx10("text", { x: cx, y: cy + 16, textAnchor: "middle", className: "fill-slate-500", fontSize: 12, children: hov.d.label })
      ] }) : /* @__PURE__ */ jsxs10(Fragment10, { children: [
        centerValue && /* @__PURE__ */ jsx10("text", { x: cx, y: cy - 4, textAnchor: "middle", className: "fill-ink-900", fontSize: 22, fontWeight: 700, children: centerValue }),
        centerLabel && /* @__PURE__ */ jsx10("text", { x: cx, y: cy + 16, textAnchor: "middle", className: "fill-slate-400", fontSize: 12, children: centerLabel })
      ] })
    ] }),
    /* @__PURE__ */ jsx10("div", { className: "space-y-2", children: data2.map((d, i) => /* @__PURE__ */ jsxs10(
      "div",
      {
        className: "flex items-center gap-2 text-sm",
        onMouseEnter: () => setHover(i),
        onMouseLeave: () => setHover(null),
        style: { cursor: "pointer", borderRadius: 8, padding: "2px 6px", background: hover === i ? "#F1F5F9" : "transparent" },
        children: [
          /* @__PURE__ */ jsx10("span", { className: "h-2.5 w-2.5 rounded-full", style: { background: d.color } }),
          /* @__PURE__ */ jsx10("span", { className: "text-slate-600", children: d.label }),
          /* @__PURE__ */ jsxs10("span", { className: "ml-auto font-medium tabular-nums text-ink-900", children: [
            d.value,
            /* @__PURE__ */ jsxs10("span", { className: "ml-1 text-xs text-slate-400", children: [
              "(",
              (d.value / total * 100).toFixed(1),
              "%)"
            ] })
          ] })
        ]
      },
      d.label
    )) })
  ] });
}

// src/console/ModelDecisionGraph.tsx
import { useState as useState9, useRef as useRef5, useEffect as useEffect6, useMemo as useMemo6 } from "react";

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
import { Fragment as Fragment11, jsx as jsx11, jsxs as jsxs11 } from "react/jsx-runtime";
var NODE_CATEGORY = [
  { label: "\u8F93\u5165\u5C42", types: ["source", "transform"] },
  { label: "\u8BA1\u7B97\u5C42", types: ["model", "graph", "ruleset"] },
  { label: "\u51B3\u7B56\u5C42", types: ["collision", "decision", "block"] },
  { label: "\u8F93\u51FA\u5C42", types: ["output", "alert"] }
];
function ScoreCardView({ bins }) {
  return /* @__PURE__ */ jsxs11("div", { className: "text-[11px] leading-tight", children: [
    /* @__PURE__ */ jsx11("div", { className: "mb-1 font-semibold text-slate-700", children: "\u57FA\u7840\u5206 600 + \u5404\u56E0\u5B50\u67E5\u8868\u52A0\u5206" }),
    bins.map((f) => /* @__PURE__ */ jsxs11("div", { className: "mb-1", children: [
      /* @__PURE__ */ jsx11("div", { className: "text-slate-600", children: f.name }),
      /* @__PURE__ */ jsx11("div", { className: "text-slate-400", children: f.bins.map((b) => /* @__PURE__ */ jsxs11("span", { className: "mr-2 inline-block", children: [
        b.label,
        " ",
        /* @__PURE__ */ jsxs11("span", { className: b.points >= 0 ? "text-emerald-600" : "text-rose-600", children: [
          b.points >= 0 ? "+" : "",
          b.points
        ] })
      ] }, b.label)) })
    ] }, f.key)),
    /* @__PURE__ */ jsx11("div", { className: "mt-1 border-t border-slate-100 pt-1 text-slate-500", children: "\u5408\u8BA1 = 600 + \u03A3\u52A0\u5206\uFF0C\u88C1\u526A [300,900]" })
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
  const [localGraph, setLocalGraph] = useState9(null);
  const graph = localGraph ?? graphBase;
  const isPipeline = !!graphProp;
  const isEditable = editable ?? !!onSaveCollisions;
  const containerRef = useRef5(null);
  const [scale, setScale] = useState9(1);
  const [tx, setTx] = useState9(0);
  const [ty, setTy] = useState9(0);
  const [hi, setHi] = useState9("all");
  const [focus, setFocus] = useState9(null);
  const [selected, setSelected] = useState9(null);
  const [editingCollision, setEditingCollision] = useState9(false);
  const [localRules, setLocalRules] = useState9([]);
  const [isFs, setIsFs] = useState9(false);
  const [openNodes, setOpenNodes] = useState9(/* @__PURE__ */ new Set());
  const [pos, setPos] = useState9({});
  const dragRef = useRef5(null);
  const [dragging, setDragging] = useState9(false);
  const [editMode, setEditMode] = useState9(false);
  const [linkMode, setLinkMode] = useState9(false);
  const [linkFrom, setLinkFrom] = useState9(null);
  const [nodeFilter, setNodeFilter] = useState9("");
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
  useEffect6(() => {
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
  const focusPath = useMemo6(() => {
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
  const TBtn = ({ onClick, title, children }) => /* @__PURE__ */ jsx11("button", { onClick, title, className: "h-7 min-w-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 hover:border-brand-400 hover:bg-slate-50", children });
  return /* @__PURE__ */ jsxs11("div", { children: [
    /* @__PURE__ */ jsxs11(
      "div",
      {
        ref: containerRef,
        className: "relative flex overflow-hidden rounded-xl border border-slate-200 bg-[#FAFBFC]",
        style: isFs ? { height: "100vh" } : { maxHeight: 600 },
        children: [
          isEditable && editMode && /* @__PURE__ */ jsxs11("aside", { className: "z-30 flex w-[188px] shrink-0 flex-col border-r border-slate-200 bg-white", children: [
            /* @__PURE__ */ jsxs11("div", { className: "flex items-center justify-between border-b border-slate-100 px-3 py-2", children: [
              /* @__PURE__ */ jsx11("span", { className: "text-xs font-semibold text-slate-600", children: "\u6DFB\u52A0\u8282\u70B9" }),
              /* @__PURE__ */ jsxs11("span", { className: "rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400", children: [
                graph.nodes.length,
                " \u4E2A"
              ] })
            ] }),
            /* @__PURE__ */ jsx11("div", { className: "px-3 pb-2 pt-2", children: /* @__PURE__ */ jsx11(
              "input",
              {
                value: nodeFilter,
                onChange: (e) => setNodeFilter(e.target.value),
                placeholder: "\u7B5B\u9009\u8282\u70B9\u7C7B\u578B",
                className: "w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand-400"
              }
            ) }),
            /* @__PURE__ */ jsx11("div", { className: "flex-1 space-y-3 overflow-y-auto px-3 pb-3", children: NODE_CATEGORY.map((cat) => {
              const items = cat.types.filter((t) => GNODE_META[t].label.includes(nodeFilter) || nodeFilter === "");
              if (!items.length) return null;
              return /* @__PURE__ */ jsxs11("div", { children: [
                /* @__PURE__ */ jsx11("div", { className: "mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400", children: cat.label }),
                /* @__PURE__ */ jsx11("div", { className: "space-y-1", children: items.map((t) => /* @__PURE__ */ jsxs11(
                  "button",
                  {
                    onClick: () => addNode(t),
                    className: "flex w-full items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:border-brand-400 hover:bg-slate-50",
                    children: [
                      /* @__PURE__ */ jsx11("span", { className: "h-3 w-3 shrink-0 rounded-sm", style: { background: GNODE_META[t].color } }),
                      /* @__PURE__ */ jsx11("span", { className: "truncate", children: GNODE_META[t].label })
                    ]
                  },
                  t
                )) })
              ] }, cat.label);
            }) }),
            /* @__PURE__ */ jsx11("div", { className: "border-t border-slate-100 p-2", children: /* @__PURE__ */ jsx11(
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
          /* @__PURE__ */ jsxs11("div", { className: "flex min-w-0 flex-1 flex-col", children: [
            /* @__PURE__ */ jsxs11("div", { className: "sticky top-0 z-20 flex shrink-0 flex-wrap items-center gap-1 border-b border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur", children: [
              /* @__PURE__ */ jsx11("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u7F29\u653E" }),
              /* @__PURE__ */ jsx11(TBtn, { onClick: () => zoom(-0.1), title: "\u7F29\u5C0F", children: "\u2212" }),
              /* @__PURE__ */ jsxs11("span", { className: "w-12 text-center text-xs tabular-nums text-slate-500", children: [
                Math.round(scale * 100),
                "%"
              ] }),
              /* @__PURE__ */ jsx11(TBtn, { onClick: () => zoom(0.1), title: "\u653E\u5927", children: "\uFF0B" }),
              /* @__PURE__ */ jsx11(TBtn, { onClick: fit, title: "\u9002\u5E94\u5C4F\u5E55", children: "\u9002\u5E94" }),
              /* @__PURE__ */ jsx11(TBtn, { onClick: () => setScale(1), title: "\u539F\u59CB\u5927\u5C0F 100%", children: "1:1" }),
              /* @__PURE__ */ jsx11("span", { className: "mx-1 h-5 w-px bg-slate-200" }),
              /* @__PURE__ */ jsx11("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u89C6\u56FE" }),
              /* @__PURE__ */ jsx11(TBtn, { onClick: resetView, title: "\u590D\u4F4D\uFF08\u7F29\u653E+\u5E73\u79FB\u5F52\u96F6\uFF09", children: "\u590D\u4F4D" }),
              /* @__PURE__ */ jsx11(TBtn, { onClick: toggleFs, title: isFs ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F", children: isFs ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F" }),
              /* @__PURE__ */ jsx11("span", { className: "mx-1 h-5 w-px bg-slate-200" }),
              /* @__PURE__ */ jsx11("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u9AD8\u4EAE" }),
              /* @__PURE__ */ jsx11(TBtn, { onClick: () => {
                setHi("main");
                setFocus(null);
              }, title: "\u4EC5\u9AD8\u4EAE\u4E3B\u7EBF\uFF08\u4E32\u884C\u94FE\u8DEF\uFF09", children: "\u4E3B\u7EBF" }),
              /* @__PURE__ */ jsx11(TBtn, { onClick: () => {
                setHi("branch");
                setFocus(null);
              }, title: "\u4EC5\u9AD8\u4EAE\u652F\u7EBF\uFF08\u5E76\u884C\u9884\u8B66\uFF09", children: "\u652F\u7EBF" }),
              /* @__PURE__ */ jsx11(TBtn, { onClick: () => {
                setHi("all");
                setFocus(null);
              }, title: "\u5168\u90E8\u663E\u793A\uFF08\u53D6\u6D88\u9AD8\u4EAE\uFF09", children: "\u5168\u90E8" }),
              isEditable && /* @__PURE__ */ jsxs11(Fragment11, { children: [
                /* @__PURE__ */ jsx11("span", { className: "mx-1 h-5 w-px bg-slate-200" }),
                /* @__PURE__ */ jsx11("span", { className: "mr-1 text-[11px] text-slate-400", children: "\u7F16\u8F91" }),
                /* @__PURE__ */ jsx11(TBtn, { onClick: () => {
                  setEditMode((v) => !v);
                  setLinkMode(false);
                  setLinkFrom(null);
                }, title: editMode ? "\u9000\u51FA\u753B\u5E03\u7F16\u8F91" : "\u8FDB\u5165\u753B\u5E03\u7F16\u8F91\uFF08\u6DFB\u52A0\u8282\u70B9 / \u8FDE\u7EBF / \u5220\u9664\uFF09", children: editMode ? "\u5B8C\u6210\u7F16\u8F91" : "\u7F16\u8F91\u753B\u5E03" }),
                editMode && dirty && /* @__PURE__ */ jsx11("button", { onClick: saveGraph, title: "\u4FDD\u5B58\u5F53\u524D\u753B\u5E03\uFF08\u8282\u70B9 / \u8FDE\u7EBF / \u4F4D\u7F6E\uFF09\u5230\u6A21\u578B\u914D\u7F6E", className: "h-7 rounded-md bg-brand-600 px-3 text-xs font-medium text-white hover:bg-brand-700", children: "\u4FDD\u5B58\u753B\u5E03" })
              ] }),
              /* @__PURE__ */ jsx11("span", { className: "ml-2 text-[11px] text-slate-300", children: editMode && linkMode ? linkFrom ? "\u8FDE\u7EBF\u4E2D \xB7 \u70B9\u51FB\u7EC8\u70B9\u8282\u70B9\u5B8C\u6210\u8FDE\u7EBF" : "\u8FDE\u7EBF\u6A21\u5F0F \xB7 \u70B9\u51FB\u8D77\u70B9\u8282\u70B9" : "\u62D6\u62FD\u8282\u70B9\u53EF\u8C03\u6574\u4F4D\u7F6E \xB7 \u70B9\u51FB\u8282\u70B9\u67E5\u770B\u8BE6\u60C5\u5E76\u9AD8\u4EAE\u5176\u6574\u6761\u94FE\u8DEF" })
            ] }),
            /* @__PURE__ */ jsx11("div", { className: "relative flex-1 overflow-auto", children: /* @__PURE__ */ jsxs11(
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
                  /* @__PURE__ */ jsxs11("svg", { width: graph.width, height: graph.height, className: "pointer-events-none absolute left-0 top-0", children: [
                    /* @__PURE__ */ jsx11("defs", { children: /* @__PURE__ */ jsx11("marker", { id: "arrow", markerWidth: "10", markerHeight: "10", refX: "8", refY: "3", orient: "auto", markerUnits: "strokeWidth", children: /* @__PURE__ */ jsx11("path", { d: "M0,0 L8,3 L0,6 Z", fill: "#94A3B8" }) }) }),
                    graph.edges.map((e, i) => {
                      const a = anchorR(nodeMap.get(e.from));
                      const b = anchorL(nodeMap.get(e.to));
                      const midX = (a.x + b.x) / 2;
                      const d = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
                      const col = e.color ?? (isAlertEdge(e) ? "#0891B2" : "#CBD5E1");
                      const dim = edgeDim(e);
                      return /* @__PURE__ */ jsxs11("g", { style: { opacity: dim ? 0.18 : 1, transition: "opacity .15s" }, children: [
                        /* @__PURE__ */ jsx11("path", { d, fill: "none", stroke: col, strokeWidth: isAlertEdge(e) ? 2 : 1.5, strokeDasharray: e.dashed ? "5 4" : void 0, markerEnd: "url(#arrow)" }),
                        e.label && /* @__PURE__ */ jsx11("text", { x: midX, y: (a.y + b.y) / 2 - 6, textAnchor: "middle", fontSize: 11, fill: col, children: e.label }),
                        editMode && /* @__PURE__ */ jsx11(
                          "path",
                          {
                            d,
                            fill: "none",
                            stroke: "transparent",
                            strokeWidth: 14,
                            style: { pointerEvents: "stroke", cursor: "pointer" },
                            onClick: () => removeEdge(i),
                            children: /* @__PURE__ */ jsx11("title", { children: "\u70B9\u51FB\u5220\u9664\u8BE5\u8FDE\u7EBF" })
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
                    return /* @__PURE__ */ jsxs11(
                      "div",
                      {
                        className: `absolute flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-opacity ${dim ? "opacity-20" : "opacity-100"} ${isCollision ? "cursor-grab hover:border-rose-400 hover:ring-2 hover:ring-rose-200 active:cursor-grabbing" : "cursor-grab hover:border-slate-400 hover:ring-2 hover:ring-slate-200 active:cursor-grabbing"}`,
                        style: { left: cp.x, top: cp.y, width: NODE_W, height: NODE_H, ...isAlertNode ? { borderStyle: "dashed", borderColor: "#0891B2" } : {} },
                        onMouseDown: (e) => startDrag(e, n),
                        children: [
                          /* @__PURE__ */ jsxs11("div", { className: "flex shrink-0 items-center justify-between rounded-t-xl px-3 py-1.5", style: { background: headerBg }, children: [
                            /* @__PURE__ */ jsx11("span", { className: "text-xs font-semibold text-white", children: n.title }),
                            /* @__PURE__ */ jsxs11("span", { className: "flex items-center gap-1.5", children: [
                              isCollision && onSaveCollisions && /* @__PURE__ */ jsx11("span", { className: "rounded bg-white/25 px-1 py-0.5 text-[10px] font-medium text-white", children: "\u53EF\u7F16\u8F91" }),
                              n.badge && /* @__PURE__ */ jsx11("span", { className: "rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-medium text-white", children: n.badge })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs11("div", { className: "min-h-0 flex-1 overflow-y-auto px-3 py-1.5", children: [
                            nodeResults?.[n.id] && /* @__PURE__ */ jsx11("div", { className: "mb-1.5 rounded-md border px-1.5 py-1 text-[11px] font-semibold leading-snug " + hintTone(nodeResults?.[n.id]), children: nodeResults[n.id] }),
                            cardBins ? /* @__PURE__ */ jsx11(ScoreCardView, { bins: cardBins }) : /* @__PURE__ */ jsxs11(Fragment11, { children: [
                              n.subtitle && /* @__PURE__ */ jsx11("div", { className: "mb-1 text-[11px] text-slate-400", children: n.subtitle }),
                              /* @__PURE__ */ jsx11("div", { className: "space-y-0.5 opacity-60", children: metaOf(n).map((m, i) => /* @__PURE__ */ jsx11("div", { className: `whitespace-normal break-words text-[10.5px] leading-tight text-slate-500 ${!openNodes.has(n.id) && i > 0 ? "hidden" : ""}`, children: m }, i)) }),
                              metaOf(n).length > 1 && /* @__PURE__ */ jsx11("button", { onClick: () => toggleNode(n.id), className: "mt-0.5 text-[10px] text-blue-500 hover:underline", children: openNodes.has(n.id) ? "\u6536\u8D77\u8BF4\u660E" : "\u5C55\u5F00\u8BF4\u660E" })
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
          selected && /* @__PURE__ */ jsxs11("div", { className: "absolute right-0 top-10 bottom-0 z-30 flex w-[360px] max-w-[80%] flex-col border-l border-slate-200 bg-white shadow-2xl", children: [
            /* @__PURE__ */ jsxs11("div", { className: "flex items-center justify-between border-b border-slate-100 px-4 py-3", children: [
              /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx11("span", { className: "h-3 w-3 rounded-sm", style: { background: GNODE_META[selected.type].color } }),
                /* @__PURE__ */ jsx11("span", { className: "text-sm font-semibold text-slate-800", children: selected.title })
              ] }),
              /* @__PURE__ */ jsx11("button", { onClick: () => {
                setSelected(null);
                setFocus(null);
              }, className: "rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100", children: "\u5173\u95ED" })
            ] }),
            /* @__PURE__ */ jsxs11("div", { className: "flex-1 space-y-3 overflow-y-auto px-4 py-3", children: [
              /* @__PURE__ */ jsxs11("div", { className: "flex flex-wrap items-center gap-2 text-xs", children: [
                /* @__PURE__ */ jsx11("span", { className: "rounded-full bg-slate-100 px-2 py-0.5 text-slate-500", children: GNODE_META[selected.type].label }),
                selected.subtitle && /* @__PURE__ */ jsx11("span", { className: "text-slate-400", children: selected.subtitle }),
                selected.badge && /* @__PURE__ */ jsx11("span", { className: "rounded-full bg-brand-50 px-2 py-0.5 text-brand-600", children: selected.badge })
              ] }),
              /* @__PURE__ */ jsxs11("div", { children: [
                /* @__PURE__ */ jsx11("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u672C\u5BA2\u6237\u503C" }),
                /* @__PURE__ */ jsx11("div", { className: "rounded-lg border px-3 py-2 text-[12.5px] font-semibold leading-relaxed " + hintTone(nodeResults?.[selected.id]), children: nodeResults?.[selected.id] ?? "\u2014\uFF08\u8BE5\u8282\u70B9\u65E0\u672C\u5BA2\u6237\u53D6\u503C\uFF09" })
              ] }),
              /* @__PURE__ */ jsxs11("div", { children: [
                /* @__PURE__ */ jsx11("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8BF4\u660E" }),
                /* @__PURE__ */ jsx11("div", { className: "rounded-lg bg-slate-50 px-3 py-2 text-[12px] leading-relaxed text-slate-600", children: (metaOf(selected).length ? metaOf(selected) : ["\uFF08\u8BE5\u8282\u70B9\u65E0\u989D\u5916\u914D\u7F6E\u8BF4\u660E\uFF09"]).map((m, i) => /* @__PURE__ */ jsx11("div", { className: "whitespace-pre-wrap", children: m }, i)) })
              ] }),
              /* @__PURE__ */ jsxs11("div", { children: [
                /* @__PURE__ */ jsx11("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8F93\u5165\uFF08\u4E0A\u6E38\u8282\u70B9\uFF09" }),
                /* @__PURE__ */ jsxs11("div", { className: "flex flex-wrap gap-1.5", children: [
                  inputsOf(selected.id).map((t, i) => /* @__PURE__ */ jsx11("span", { className: "rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600", children: t }, i)),
                  inputsOf(selected.id).length === 0 && /* @__PURE__ */ jsx11("span", { className: "text-[11px] text-slate-300", children: "\u65E0\uFF08\u8D77\u70B9\u8282\u70B9\uFF09" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs11("div", { children: [
                /* @__PURE__ */ jsx11("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8F93\u51FA\uFF08\u4E0B\u6E38\u8282\u70B9\uFF09" }),
                /* @__PURE__ */ jsxs11("div", { className: "flex flex-wrap gap-1.5", children: [
                  outputsOf(selected.id).map((t, i) => /* @__PURE__ */ jsx11("span", { className: "rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600", children: t }, i)),
                  outputsOf(selected.id).length === 0 && /* @__PURE__ */ jsx11("span", { className: "text-[11px] text-slate-300", children: "\u65E0\uFF08\u7EC8\u70B9\u8282\u70B9\uFF09" })
                ] })
              ] }),
              selected.type === "collision" && onSaveCollisions && /* @__PURE__ */ jsxs11(Fragment11, { children: [
                /* @__PURE__ */ jsx11("p", { className: "text-xs leading-relaxed text-slate-400", children: "\u5F53\u591A\u6761\u89C4\u5219\u540C\u65F6\u547D\u4E2D\u4EA7\u751F\u51B2\u7A81\u65F6\uFF0C\u6309\u6B64\u88C1\u51B3\u903B\u8F91\u53D6\u820D\u5E76\u751F\u6210\u5BF9\u5E94\u7684\u9884\u8B66\u7B49\u7EA7\u3002\u4FEE\u6539\u4EC5\u5F71\u54CD\u672C\u6A21\u578B\u7684\u914D\u7F6E\uFF0C\u4FDD\u5B58\u540E\u968F\u6A21\u578B\u6301\u4E45\u5316\u3002" }),
                /* @__PURE__ */ jsx11("button", { onClick: () => {
                  setSelected(null);
                  setFocus(null);
                  openCollision();
                }, className: "w-full rounded-lg border border-rose-200 bg-rose-50 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100", children: "\u7F16\u8F91\u51B2\u7A81\u88C1\u51B3\u89C4\u5219 \u2192" })
              ] }),
              editMode && /* @__PURE__ */ jsxs11(Fragment11, { children: [
                /* @__PURE__ */ jsxs11("div", { children: [
                  /* @__PURE__ */ jsx11("div", { className: "mb-1 text-xs font-medium text-slate-500", children: "\u8282\u70B9\u6807\u9898" }),
                  /* @__PURE__ */ jsx11(
                    "input",
                    {
                      value: selected.title,
                      onChange: (e) => renameNode(selected.id, e.target.value),
                      className: "w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx11(
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
          editingCollision && onSaveCollisions && /* @__PURE__ */ jsx11("div", { className: "absolute inset-0 z-40 flex justify-end bg-black/20", onClick: () => setEditingCollision(false), children: /* @__PURE__ */ jsxs11("div", { className: "flex h-full w-[440px] max-w-[90%] flex-col bg-white shadow-xl", onClick: (e) => e.stopPropagation(), children: [
            /* @__PURE__ */ jsxs11("div", { className: "flex items-center justify-between border-b border-slate-100 px-4 py-3", children: [
              /* @__PURE__ */ jsxs11("div", { className: "text-sm font-semibold text-slate-800", children: [
                "\u89C4\u5219\u78B0\u649E \xB7 \u51B2\u7A81\u88C1\u51B3 ",
                /* @__PURE__ */ jsx11("span", { className: "ml-1 text-xs font-normal text-slate-400", children: SCORE_PROD_LABEL[prod] })
              ] }),
              /* @__PURE__ */ jsx11("button", { onClick: () => setEditingCollision(false), className: "rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100", children: "\u5173\u95ED" })
            ] }),
            /* @__PURE__ */ jsxs11("div", { className: "flex-1 space-y-3 overflow-y-auto px-4 py-3", children: [
              /* @__PURE__ */ jsx11("p", { className: "text-xs text-slate-400", children: "\u5B9A\u4E49\u5F53\u591A\u6761\u89C4\u5219\u540C\u65F6\u547D\u4E2D\u4EA7\u751F\u51B2\u7A81\u65F6\u5982\u4F55\u88C1\u51B3\u3001\u5E76\u751F\u6210\u4F55\u79CD\u9884\u8B66\u3002\u6B64\u5373\u6A21\u578B\u914D\u7F6E\u9636\u6BB5\u7684\u51B2\u7A81\u903B\u8F91\uFF0C\u4FDD\u5B58\u540E\u968F\u6A21\u578B\u6301\u4E45\u5316\u3002" }),
              localRules.map((r, i) => /* @__PURE__ */ jsxs11("div", { className: "rounded-xl border border-slate-200 p-3", children: [
                /* @__PURE__ */ jsxs11("div", { className: "mb-2 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs11("span", { className: "text-xs font-medium text-slate-500", children: [
                    "\u88C1\u51B3\u89C4\u5219 ",
                    i + 1
                  ] }),
                  /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxs11("label", { className: "flex items-center gap-1 text-xs text-slate-500", children: [
                      /* @__PURE__ */ jsx11("input", { type: "checkbox", checked: r.enabled, onChange: () => toggleRule(r.id), className: "accent-rose-500" }),
                      " \u542F\u7528"
                    ] }),
                    /* @__PURE__ */ jsx11("button", { onClick: () => removeRule(r.id), className: "text-xs text-rose-500 hover:underline", children: "\u5220\u9664" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx11(
                  "input",
                  {
                    className: "mb-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400",
                    placeholder: "\u51B2\u7A81\u6761\u4EF6\uFF08\u5982\uFF1A\u9ED1\u7070\u540D\u5355\u547D\u4E2D \u2229 XGB \u4E2D\u98CE\u9669\uFF09",
                    value: r.conflict,
                    onChange: (e) => updateRule(r.id, "conflict", e.target.value)
                  }
                ),
                /* @__PURE__ */ jsx11(
                  "input",
                  {
                    className: "mb-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400",
                    placeholder: "\u88C1\u51B3\u7ED3\u679C / \u751F\u6210\u7684\u9884\u8B66\uFF08\u5982\uFF1A\u5F3A\u5236\u62D2\u7EDD\uFF0C\u751F\u6210\u6B3A\u8BC8\u9884\u8B66\uFF09",
                    value: r.result,
                    onChange: (e) => updateRule(r.id, "result", e.target.value)
                  }
                ),
                /* @__PURE__ */ jsxs11(
                  "select",
                  {
                    className: "w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400",
                    value: r.priority,
                    onChange: (e) => updateRule(r.id, "priority", e.target.value),
                    children: [
                      /* @__PURE__ */ jsx11("option", { value: "\u62E6\u622A\u4F18\u5148", children: "\u4F18\u5148\u7EA7\uFF1A\u62E6\u622A\u4F18\u5148\uFF08\u89C4\u5219/\u540D\u5355\u538B\u8FC7\u5206\u6570\uFF09" }),
                      /* @__PURE__ */ jsx11("option", { value: "\u5206\u6570\u4F18\u5148", children: "\u4F18\u5148\u7EA7\uFF1A\u5206\u6570\u4F18\u5148\uFF08\u6A21\u578B\u5206\u51B3\u5B9A\uFF09" }),
                      /* @__PURE__ */ jsx11("option", { value: "\u8F6C\u4EBA\u5DE5", children: "\u4F18\u5148\u7EA7\uFF1A\u8F6C\u4EBA\u5DE5\u590D\u6838" })
                    ]
                  }
                )
              ] }, r.id)),
              localRules.length === 0 && /* @__PURE__ */ jsx11("div", { className: "rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400", children: "\u6682\u65E0\u51B2\u7A81\u88C1\u51B3\u89C4\u5219\uFF0C\u70B9\u51FB\u4E0B\u65B9\u65B0\u589E\u3002" }),
              /* @__PURE__ */ jsx11("button", { onClick: addRule, className: "w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600", children: "\uFF0B \u65B0\u589E\u51B2\u7A81\u88C1\u51B3\u89C4\u5219" })
            ] }),
            /* @__PURE__ */ jsxs11("div", { className: "flex gap-2 border-t border-slate-100 px-4 py-3", children: [
              /* @__PURE__ */ jsx11("button", { onClick: saveCollision, className: "flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700", children: "\u4FDD\u5B58" }),
              /* @__PURE__ */ jsx11("button", { onClick: () => setEditingCollision(false), className: "rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50", children: "\u53D6\u6D88" })
            ] })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs11("div", { className: "mt-2 flex flex-wrap items-center gap-3", children: [
      Object.keys(GNODE_META).map((t) => /* @__PURE__ */ jsxs11("span", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
        /* @__PURE__ */ jsx11("span", { className: "h-2.5 w-2.5 rounded-sm", style: { background: GNODE_META[t].color } }),
        GNODE_META[t].label
      ] }, t)),
      /* @__PURE__ */ jsxs11("span", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
        /* @__PURE__ */ jsx11("span", { className: "inline-block h-0 w-5 border-t-2 border-dashed border-cyan-500" }),
        "\u5E76\u884C\u9884\u8B66\uFF08\u865A\u7EBF\uFF09"
      ] })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "mt-4 overflow-hidden rounded-xl border border-slate-200", children: [
      /* @__PURE__ */ jsxs11("div", { className: "flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2", children: [
        /* @__PURE__ */ jsx11("div", { className: "text-sm font-semibold text-slate-800", children: "\u8282\u70B9\u660E\u7EC6 \xB7 \u6BCF\u4E2A\u8282\u70B9\u7684\u8BF4\u660E / \u8F93\u5165 / \u8F93\u51FA" }),
        /* @__PURE__ */ jsx11(
          "button",
          {
            onClick: () => setOpenNodes(openNodes.size === graph.nodes.length ? /* @__PURE__ */ new Set() : new Set(graph.nodes.map((n) => n.id))),
            className: "text-xs text-blue-600 hover:underline",
            children: openNodes.size === graph.nodes.length ? "\u5168\u90E8\u5C55\u5F00\u8BF4\u660E" : "\u5168\u90E8\u6536\u8D77\u8BF4\u660E"
          }
        )
      ] }),
      /* @__PURE__ */ jsx11("div", { className: "max-h-[340px] overflow-auto", children: /* @__PURE__ */ jsxs11("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx11("thead", { className: "sticky top-0 bg-slate-50", children: /* @__PURE__ */ jsxs11("tr", { className: "text-left text-xs text-slate-400", children: [
          /* @__PURE__ */ jsx11("th", { className: "px-3 py-2 font-medium", children: "\u8282\u70B9" }),
          /* @__PURE__ */ jsx11("th", { className: "px-3 py-2 font-medium", children: "\u7C7B\u578B" }),
          /* @__PURE__ */ jsx11("th", { className: "px-3 py-2 font-medium", children: "\u7ED3\u679C\uFF08\u672C\u5BA2\u6237\u5728\u6B64\u8282\u70B9\u7684\u8F93\u51FA\uFF09" }),
          /* @__PURE__ */ jsx11("th", { className: "px-3 py-2 font-medium", children: "\u8BF4\u660E" }),
          /* @__PURE__ */ jsx11("th", { className: "px-3 py-2 font-medium", children: "\u8F93\u5165\uFF08\u4E0A\u6E38\uFF09" }),
          /* @__PURE__ */ jsx11("th", { className: "px-3 py-2 font-medium", children: "\u8F93\u51FA\uFF08\u4E0B\u6E38\uFF09" })
        ] }) }),
        /* @__PURE__ */ jsx11("tbody", { children: graph.nodes.map((n) => {
          const open = openNodes.has(n.id);
          const ins = inputsOf(n.id);
          const outs = outputsOf(n.id);
          const m = metaOf(n);
          return /* @__PURE__ */ jsxs11("tr", { className: "border-t border-slate-50 align-top", children: [
            /* @__PURE__ */ jsx11("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxs11("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx11("span", { className: "h-2.5 w-2.5 shrink-0 rounded-sm", style: { background: GNODE_META[n.type].color } }),
              /* @__PURE__ */ jsx11("span", { className: "font-medium text-slate-700", children: n.title }),
              n.badge && /* @__PURE__ */ jsx11("span", { className: "rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-600", children: n.badge })
            ] }) }),
            /* @__PURE__ */ jsx11("td", { className: "px-3 py-2 text-slate-500", children: GNODE_META[n.type].label }),
            /* @__PURE__ */ jsx11("td", { className: "px-3 py-2", children: nodeResults?.[n.id] ? /* @__PURE__ */ jsx11("span", { className: "inline-block max-w-[240px] whitespace-pre-wrap rounded-md border px-2 py-1 text-[11px] font-medium leading-snug " + hintTone(nodeResults?.[n.id]), children: nodeResults[n.id] }) : /* @__PURE__ */ jsx11("span", { className: "text-[11px] text-slate-300", children: "\u2014" }) }),
            /* @__PURE__ */ jsxs11("td", { className: "px-3 py-2 text-slate-600", children: [
              /* @__PURE__ */ jsx11("div", { className: "space-y-0.5", children: m.length ? m.map((t, i) => /* @__PURE__ */ jsx11("div", { className: `whitespace-pre-wrap text-[12px] leading-tight ${!open && i > 0 ? "hidden" : ""}`, children: t }, i)) : /* @__PURE__ */ jsx11("span", { className: "text-[12px] text-slate-300", children: "\uFF08\u65E0\uFF09" }) }),
              m.length > 1 && /* @__PURE__ */ jsx11("button", { onClick: () => toggleNode(n.id), className: "mt-1 text-[11px] text-blue-600 hover:underline", children: open ? "\u6536\u8D77" : "\u5C55\u5F00\u8BF4\u660E" })
            ] }),
            /* @__PURE__ */ jsx11("td", { className: "px-3 py-2 text-slate-600", children: ins.length ? ins.map((t, i) => /* @__PURE__ */ jsx11("span", { className: "mr-1 mb-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600", children: t }, i)) : /* @__PURE__ */ jsx11("span", { className: "text-[11px] text-slate-300", children: "\u65E0" }) }),
            /* @__PURE__ */ jsx11("td", { className: "px-3 py-2 text-slate-600", children: outs.length ? outs.map((t, i) => /* @__PURE__ */ jsx11("span", { className: "mr-1 mb-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600", children: t }, i)) : /* @__PURE__ */ jsx11("span", { className: "text-[11px] text-slate-300", children: "\u65E0" }) })
          ] }, n.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "mt-4 overflow-hidden rounded-xl border border-slate-200", children: [
      /* @__PURE__ */ jsxs11("div", { className: "flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2", children: [
        /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2 text-sm font-semibold text-slate-800", children: [
          "\u51B3\u7B56\u6620\u5C04 \xB7 \u8F93\u51FA\u5206\u6570\u5982\u4F55\u53D8\u6210\u5904\u7F6E\u52A8\u4F5C",
          /* @__PURE__ */ jsx11("span", { className: "rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-normal text-slate-400", children: "\u53EA\u8BFB \xB7 \u6570\u636E\u6765\u81EA\u300C\u8BC4\u5206\u9608\u503C\u300D" })
        ] }),
        /* @__PURE__ */ jsx11("button", { onClick: onJumpStrategy, className: "text-xs text-blue-600 hover:underline", children: "\u5728\u89C4\u5219\u5F15\u64CE\u914D\u7F6E \u2192" })
      ] }),
      /* @__PURE__ */ jsxs11("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx11("thead", { children: /* @__PURE__ */ jsxs11("tr", { className: "text-left text-xs text-slate-400", children: [
          /* @__PURE__ */ jsx11("th", { className: "px-3 py-2 font-medium", children: "\u5206\u6570\u6BB5" }),
          /* @__PURE__ */ jsx11("th", { className: "px-3 py-2 font-medium", children: "\u7B49\u7EA7" }),
          /* @__PURE__ */ jsx11("th", { className: "px-3 py-2 font-medium", children: "\u542B\u4E49" }),
          /* @__PURE__ */ jsx11("th", { className: "px-3 py-2 font-medium", children: "\u5EFA\u8BAE\u52A8\u4F5C\uFF08\u9608\u503C\u89C4\u5219\uFF09" }),
          /* @__PURE__ */ jsx11("th", { className: "px-3 py-2 font-medium", children: "\u6267\u884C\u5F15\u64CE" })
        ] }) }),
        /* @__PURE__ */ jsxs11("tbody", { children: [
          rows.map((t) => {
            const hit = hitRow?.range === t.range;
            return /* @__PURE__ */ jsxs11("tr", { className: "border-t border-slate-50", style: hit ? { background: "#EFF6FF", boxShadow: "inset 3px 0 0 #2563EB" } : void 0, children: [
              /* @__PURE__ */ jsxs11("td", { className: "px-3 py-2 tabular-nums text-slate-700", children: [
                t.range,
                hit && /* @__PURE__ */ jsxs11("span", { className: "ml-2 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white", children: [
                  "\u25C0 \u672C\u5BA2\u6237 ",
                  currentScore,
                  " \u5206"
                ] })
              ] }),
              /* @__PURE__ */ jsx11("td", { className: "px-3 py-2 font-semibold", style: hit ? { color: "#1D4ED8" } : { color: "#334155" }, children: t.level }),
              /* @__PURE__ */ jsx11("td", { className: "px-3 py-2", style: hit ? { color: "#1E40AF" } : { color: "#64748B" }, children: t.meaning }),
              /* @__PURE__ */ jsx11("td", { className: "px-3 py-2", style: hit ? { color: "#1E40AF", fontWeight: 600 } : { color: "#334155" }, children: t.action }),
              /* @__PURE__ */ jsx11("td", { className: "px-3 py-2 text-sky-500", children: "\u89C4\u5219\u5F15\u64CE" })
            ] }, t.range);
          }),
          rows.length === 0 && /* @__PURE__ */ jsx11("tr", { children: /* @__PURE__ */ jsx11("td", { colSpan: 5, className: "px-3 py-3 text-center text-xs text-slate-400", children: "\u5F53\u524D\u6A21\u578B\u6682\u65E0\u9608\u503C\u51B3\u7B56\u914D\u7F6E" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs11("div", { className: "flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-400", children: [
        /* @__PURE__ */ jsx11("span", { children: "\u9608\u503C\u89C4\u5219\u4E0E\u9884\u8B66\u89C4\u5219\u5747\u7531\u89C4\u5219\u5F15\u64CE\u5B50\u7CFB\u7EDF\u7EDF\u4E00\u6267\u884C\uFF1B\u94FE\u8DEF\u5B9E\u4F53\u5747\u6765\u81EA\u771F\u5B9E\u914D\u7F6E\uFF08scoreData.json / ruleHub.json\uFF09\uFF0C\u975E\u793A\u610F\u3002" }),
        /* @__PURE__ */ jsx11("button", { onClick: onJumpRules, className: "ml-3 shrink-0 text-xs text-blue-600 hover:underline", children: "\u5728\u89C4\u5219\u5F15\u64CE\u67E5\u770B\u5168\u90E8\u89C4\u5219 \u2192" })
      ] })
    ] })
  ] });
}

// src/console/FlowCanvasEditor.tsx
import { useRef as useRef6, useState as useState10, useEffect as useEffect7 } from "react";

// src/console/templateNull.json
var templateNull_default = {
  id: "tpl-null",
  name: "\u7A7A\u6A21\u677F\uFF08\u6240\u6709\u5B57\u6BB5\u503C\u4E3Anull\uFF09",
  reportType: "info_verify",
  scope: ["\u5168\u4EA7\u54C1"],
  status: "\u8349\u7A3F",
  isDefault: false,
  description: null,
  version: null,
  lastEditor: null,
  lastEditTime: null,
  showOpLog: false,
  showSectionTotals: false,
  sections: [
    {
      id: "score_model",
      name: null,
      desc: null,
      sourceType: "rule_set",
      order: 0,
      visible: true,
      homeTab: "score",
      weight: 1,
      cardScoreMode: "add",
      scoreable: true,
      demoScore: null,
      demoValues: null,
      displayMode: "list",
      fieldGroups: [],
      ruleSetId: null,
      fields: []
    },
    {
      id: "conclusion_process",
      name: null,
      desc: null,
      sourceType: "rule_set",
      order: 1,
      visible: true,
      homeTab: "flow",
      weight: 1,
      cardScoreMode: "add",
      scoreable: true,
      demoScore: null,
      demoValues: null,
      displayMode: "list",
      fieldGroups: [],
      ruleSetId: null,
      fields: []
    },
    {
      id: "basic_info",
      name: null,
      desc: null,
      sourceType: "data_source",
      order: 2,
      visible: true,
      homeTab: "content",
      weight: 1,
      cardScoreMode: "add",
      scoreable: false,
      demoScore: null,
      demoValues: null,
      displayMode: "list",
      fieldGroups: [
        { name: "\u57FA\u7840\u8D44\u6599", fields: ["f_name", "f_id", "f_phone"] },
        { name: "\u8BBE\u5907\u73AF\u5883", fields: ["f_ip", "f_gps", "f_channel"] }
      ],
      ds: {
        dbType: null,
        ip: null,
        port: null,
        username: null,
        password: null,
        database: null,
        table: null,
        tableFields: []
      },
      fields: [
        { id: "f_name", name: null, visible: true, sourceRef: null, group: "\u57FA\u7840\u8D44\u6599", scorePoints: 0, hitReject: false, condType: null, condValue: null, severity: "low", hitText: null, missText: null, displayMode: "list", maskRule: "none", container: "text" },
        { id: "f_id", name: null, visible: true, sourceRef: null, group: "\u57FA\u7840\u8D44\u6599", scorePoints: 0, hitReject: false, condType: null, condValue: null, severity: "low", hitText: null, missText: null, displayMode: "list", maskRule: "none", container: "text" },
        { id: "f_phone", name: null, visible: true, sourceRef: null, group: "\u57FA\u7840\u8D44\u6599", scorePoints: 0, hitReject: false, condType: null, condValue: null, severity: "low", hitText: null, missText: null, displayMode: "list", maskRule: "none", container: "text" },
        { id: "f_ip", name: null, visible: true, sourceRef: null, group: "\u8BBE\u5907\u73AF\u5883", scorePoints: 0, hitReject: false, condType: null, condValue: null, severity: "low", hitText: null, missText: null, displayMode: "list", maskRule: "none", container: "text" },
        { id: "f_gps", name: null, visible: true, sourceRef: null, group: "\u8BBE\u5907\u73AF\u5883", scorePoints: 0, hitReject: false, condType: null, condValue: null, severity: "low", hitText: null, missText: null, displayMode: "list", maskRule: "none", container: "text" },
        { id: "f_channel", name: null, visible: true, sourceRef: null, group: "\u8BBE\u5907\u73AF\u5883", scorePoints: 0, hitReject: false, condType: null, condValue: null, severity: "low", hitText: null, missText: null, displayMode: "list", maskRule: "none", container: "text" }
      ]
    },
    {
      id: "id_images",
      name: null,
      desc: null,
      sourceType: "api",
      order: 3,
      visible: true,
      homeTab: "content",
      weight: 1,
      cardScoreMode: "add",
      scoreable: true,
      demoScore: null,
      demoValues: null,
      displayMode: "list",
      fieldGroups: [],
      api: {
        url: null,
        method: "GET",
        headers: [],
        inputs: [],
        bodyType: null,
        bodyText: null,
        outputs: []
      },
      fields: [
        { id: "img_front", name: null, visible: true, sourceRef: null, scorePoints: 0, hitReject: false, condType: null, condValue: null, severity: "low", hitText: null, missText: null, displayMode: "list", maskRule: "none", container: "image" },
        { id: "img_back", name: null, visible: true, sourceRef: null, scorePoints: 0, hitReject: false, condType: null, condValue: null, severity: "low", hitText: null, missText: null, displayMode: "list", maskRule: "none", container: "image" },
        { id: "img_live", name: null, visible: true, sourceRef: null, scorePoints: 0, hitReject: false, condType: null, condValue: null, severity: "low", hitText: null, missText: null, displayMode: "list", maskRule: "none", container: "image" }
      ]
    },
    {
      id: "single_verify",
      name: null,
      desc: null,
      sourceType: "rule_set",
      order: 4,
      visible: true,
      homeTab: "content",
      weight: 1,
      cardScoreMode: "deduct",
      scoreable: true,
      demoScore: null,
      demoValues: null,
      displayMode: "list",
      fieldGroups: [],
      ruleSetId: null,
      fields: [
        { id: "r1", name: null, visible: true, sourceRef: null, scorePoints: 0, hitReject: false, condType: "hit", condValue: null, severity: "mid", hitText: "\u547D\u4E2D", missText: "\u672A\u547D\u4E2D", displayMode: "list", maskRule: "none", container: "text" }
      ]
    },
    {
      id: "cross_fusion",
      name: null,
      desc: null,
      sourceType: "rule_set",
      order: 5,
      visible: true,
      homeTab: "content",
      weight: 1,
      cardScoreMode: "deduct",
      scoreable: true,
      demoScore: null,
      demoValues: null,
      displayMode: "list",
      fieldGroups: [],
      ruleSetId: null,
      fields: [
        { id: "c1", name: null, visible: true, sourceRef: null, scorePoints: 0, hitReject: false, condType: "hit", condValue: null, severity: "mid", hitText: "\u547D\u4E2D", missText: "\u672A\u547D\u4E2D", displayMode: "list", maskRule: "none", container: "text" }
      ]
    },
    {
      id: "op_logs",
      name: null,
      desc: null,
      sourceType: "api",
      order: 6,
      visible: true,
      homeTab: "log",
      weight: 1,
      cardScoreMode: "add",
      scoreable: false,
      demoScore: null,
      demoValues: null,
      displayMode: "list",
      fieldGroups: [],
      api: {
        url: null,
        method: "GET",
        headers: [],
        inputs: [],
        bodyType: null,
        bodyText: null,
        outputs: []
      },
      fields: []
    }
  ],
  scoreBlock: {
    show: true,
    title: "\u5F97\u5206\u8BA1\u7B97",
    min: 0,
    max: 100,
    rejectCount: 0
  },
  flowBlock: {
    show: true,
    title: "\u7ED3\u8BBA\u4E0E\u7EC8\u5BA1",
    statusEnum: "\u5F85\u786E\u8BA4/\u901A\u8FC7/\u62D2\u7EDD/\u6302\u8D77/\u5DF2\u529E\u7ED3/\u8F6C\u4EBA\u5DE5"
  },
  scoreDisplay: {
    displayComponent: "\u5927\u6570\u5B57",
    showDescription: true,
    showThresholdBar: true,
    showRiskTags: true,
    baseScore: 0,
    title: null,
    scoreSemantic: "credit",
    grades: [
      { grade: "A", label: "A", minScore: 0, maxScore: 33, riskLevel: "\u4F4E", color: "#10B981", autoResult: "\u901A\u8FC7", description: null, tags: null },
      { grade: "B", label: "B", minScore: 34, maxScore: 66, riskLevel: "\u4E2D", color: "#F59E0B", autoResult: "\u8F6C\u4EBA\u5DE5", description: null, tags: null },
      { grade: "C", label: "C", minScore: 67, maxScore: 100, riskLevel: "\u9AD8", color: "#EF4444", autoResult: "\u62D2\u7EDD", description: null, tags: null }
    ]
  },
  scoreFormula: {
    terms: [],
    updatedAt: null
  },
  specialRules: [],
  businessFlow: [],
  dimBands: [],
  demoApplicant: null,
  theme: {
    preset: null,
    primaryColor: null,
    spacing: null,
    fontSize: null,
    tableStyle: null,
    borderRadius: null,
    headerStyle: null
  },
  export: {
    format: null,
    watermark: null,
    scope: null
  },
  changeLogs: []
};

// src/console/reportTemplateData.ts
var REVIEW_ROLES = ["\u521D\u5BA1\u5458", "\u590D\u5BA1\u5458", "\u98CE\u63A7\u4E3B\u7BA1", "\u98CE\u63A7\u7ECF\u7406", "\u98CE\u63A7\u603B\u76D1"];
function inferApiContainer(name, desc) {
  const t = `${name} ${desc}`;
  if (/文本|文字|ocr/i.test(t)) return void 0;
  if (/视频|活体|录像|mp4/i.test(t)) return "video";
  if (/影像|图片|照片|证照|头像|面/i.test(t)) return "image";
  return void 0;
}
function recommendDbContainer(dbType) {
  if (/image|img|pic|头像|照片|证照|影像/.test(dbType)) return "image";
  if (/file|附件|pdf|影像|文档/.test(dbType)) return "file";
  if (/json|clob|longtext|text\(/.test(dbType)) return "table";
  return "text";
}
function inferFieldType(name, desc) {
  const t = `${name} ${desc}`;
  if (/图片|影像|照片|证照|头像|面|活体/i.test(t)) return "image";
  if (/视频|录像|mp4/i.test(t)) return "video";
  if (/文件|附件|pdf|文档|合同/i.test(t)) return "file";
  if (/时间|日期|date|出生|到期|创建|更新|申请时间/i.test(t)) return "date";
  if (/是否|通过|拒绝|命中|成功|失败|一致|异常|校验|核验|有|无|bool/i.test(t)) return "boolean";
  if (/年龄|岁|月收入|收入|额度|金额|分数|分|利率|期数|笔数|次数|数量|余额|负债|比例|评分|分值/i.test(t)) return "number";
  if (/状态|等级|类型|渠道|来源|原因|行业|职业|婚姻|学历|性别|证件|关系|标签/i.test(t)) return "enum";
  if (/维度|明细|列表|结构|json|详情|记录|图谱|项/i.test(t)) return "json";
  return "string";
}
function inferDbType(name) {
  if (/金额|收入|额度|利率|余额|负债|比例/.test(name)) return "decimal(18,2)";
  if (/年龄|岁|月收入|笔数|次数|数量|期数|分|分数|评分|分值/i.test(name)) return "int";
  if (/时间|日期|date|出生|到期|创建|更新|申请时间/i.test(name)) return "datetime";
  if (/是否|通过|命中|校验|核验|一致|异常|有|无/i.test(name)) return "tinyint";
  return "varchar(64)";
}
function autoMaskRule(name) {
  if (/身份证|证件/.test(name)) return "idcard";
  if (/手机/.test(name)) return "phone";
  if (/银行卡|卡号/.test(name)) return "bank";
  if (/姓名/.test(name)) return "name";
  return "none";
}
function computeSectionScore(s) {
  const mode = s.cardScoreMode ?? (s.sourceType === "rule_set" ? "deduct" : "add");
  if (s.scoreable === false) return { total: 0, addCount: 0, deductCount: 0, mode };
  if (s.sourceType === "tpl_copy") {
    let total2 = 0, addCount2 = 0, deductCount2 = 0;
    for (const cs of s.copySections ?? []) {
      for (const f of cs.fields ?? []) {
        if (!f || f.visible === false || f.hitReject) continue;
        const pts = f.scorePoints ?? 0;
        if (mode === "add") {
          total2 += pts;
          addCount2++;
        } else if (mode === "deduct") {
          total2 -= pts;
          deductCount2++;
        }
      }
    }
    return { total: total2, addCount: addCount2, deductCount: deductCount2, mode };
  }
  const raw = s.sourceType === "data_source" ? s.ds?.tableFields : s.sourceType === "api" ? s.api?.outputs : s.fields;
  const fields = raw ?? s.fields;
  let total = 0, addCount = 0, deductCount = 0;
  for (const f of fields) {
    if (!f || f.visible === false || f.hitReject) continue;
    const pts = f.scorePoints ?? 0;
    if (mode === "add") {
      total += pts;
      addCount++;
    } else if (mode === "deduct") {
      total -= pts;
      deductCount++;
    }
  }
  return { total, addCount, deductCount, mode };
}
function defaultDimBandsForScore(score) {
  const max = Math.max(1, Math.ceil(Math.abs(score)));
  const t = Math.max(1, Math.ceil(max / 3));
  return [
    { level: "\u4F4E", min: 0, max: t, note: "\u8BE5\u7EF4\u5EA6\u8868\u73B0\u6B63\u5E38\uFF0C\u65E0\u660E\u663E\u98CE\u9669" },
    { level: "\u4E2D", min: t + 1, max: t * 2, note: "\u8BE5\u7EF4\u5EA6\u5B58\u5728\u4E00\u5B9A\u5F02\u5E38\uFF0C\u5EFA\u8BAE\u5173\u6CE8" },
    { level: "\u9AD8", min: Math.min(t * 2 + 1, max), max, note: "\u8BE5\u7EF4\u5EA6\u98CE\u9669\u7A81\u51FA\uFF0C\u9700\u91CD\u70B9\u6838\u67E5" }
  ];
}
var FLOW_NODE_TYPE_LABEL = {
  start: "\u5F00\u59CB\u8282\u70B9",
  normal: "\u666E\u901A\u8282\u70B9",
  end: "\u7ED3\u675F\u8282\u70B9"
};
var FLOW_NODE_TYPE_COLOR = {
  start: { bg: "#ECFDF5", border: "#10B981", text: "#065F46" },
  normal: { bg: "#EFF6FF", border: "#3B82F6", text: "#1E40AF" },
  end: { bg: "#F8FAFC", border: "#94A3B8", text: "#475569" }
};
var REVIEW_CHECK_ITEMS = [
  "\u8EAB\u4EFD\u771F\u5B9E\u6027\u6838\u9A8C",
  "\u8D44\u6599\u5B8C\u6574\u6027\u68C0\u67E5",
  "\u6536\u5165\u4E0E\u8D1F\u503A\u8BC4\u4F30",
  "\u5F81\u4FE1\u62A5\u544A\u590D\u6838",
  "\u53CD\u6B3A\u8BC8\u89C4\u5219\u590D\u6838",
  "\u989D\u5EA6\u4E0E\u5229\u7387\u5408\u7406\u6027"
];
var REVIEW_RESULTS = ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"];
var DEFAULT_OPINIONS = {
  "\u901A\u8FC7": ["\u8C03\u6574\u5229\u7387", "\u8C03\u6574\u501F\u8D37\u91D1\u989D"],
  "\u8F6C\u4EBA\u5DE5": ["\u4FE1\u606F\u5B58\u7591\uFF0C\u8BF7\u4EBA\u5DE5\u590D\u6838"],
  "\u62D2\u7EDD": ["\u98CE\u63A7\u8BC4\u5206\u4E0D\u8DB3", "\u53CD\u6B3A\u8BC8\u89C4\u5219\u547D\u4E2D"]
};
function defaultOpinionPresets() {
  return { "\u901A\u8FC7": [...DEFAULT_OPINIONS["\u901A\u8FC7"]], "\u8F6C\u4EBA\u5DE5": [...DEFAULT_OPINIONS["\u8F6C\u4EBA\u5DE5"]], "\u62D2\u7EDD": [...DEFAULT_OPINIONS["\u62D2\u7EDD"]] };
}
function defaultButtonName(autoResult) {
  return autoResult === "\u901A\u8FC7" ? "\u786E\u8BA4\u901A\u8FC7" : autoResult === "\u62D2\u7EDD" ? "\u786E\u8BA4\u62D2\u7EDD" : "\u8F6C\u4EBA\u5DE5\u5BA1\u6838";
}
var DEFAULT_DECISION_FORMULA = {
  terms: [
    { id: "t1", op: "+", kind: "var", varId: "credit_score", factor: 0.4 },
    { id: "t2", op: "-", kind: "var", varId: "fraud_score", factor: 0.3 },
    { id: "t3", op: "-", kind: "var", varId: "info_score", factor: 0.3 }
  ]
};
function evaluateFormula(f, values) {
  if (!f || f.terms.length === 0) return null;
  let sum = 0;
  for (const t of f.terms) {
    const base = t.kind === "var" ? values[t.varId ?? ""] ?? 0 : t.constVal ?? 0;
    sum += (t.op === "-" ? -1 : 1) * t.factor * base;
  }
  return sum;
}
function buildDefaultScoreFormula(sections) {
  const scored = sections.filter((s) => (s.homeTab ?? "content") === "content");
  return {
    terms: scored.map((s, i) => ({
      id: "t" + (i + 1),
      op: s.cardScoreMode === "deduct" ? "-" : "+",
      kind: "var",
      varId: "sec_" + s.id,
      factor: s.weight ?? 1
    }))
  };
}
var PRODUCT_TREE = [
  {
    id: "credit",
    name: "\u4FE1\u7528\u8D37",
    children: [
      { id: "credit-salary", name: "\u5DE5\u85AA\u8D37" },
      { id: "credit-fund", name: "\u516C\u79EF\u91D1\u8D37" },
      { id: "credit-social", name: "\u793E\u4FDD\u8D37" },
      { id: "credit-edu", name: "\u5B66\u5386\u8D37" },
      { id: "credit-merchant", name: "\u5546\u6237\u8D37" }
    ]
  },
  {
    id: "mortgage",
    name: "\u62B5\u62BC\u8D37",
    children: [
      { id: "mortgage-house", name: "\u623F\u4EA7\u62B5\u62BC\u8D37" },
      { id: "mortgage-car", name: "\u8F66\u8F86\u62B5\u62BC\u8D37" },
      { id: "mortgage-device", name: "\u8BBE\u5907\u62B5\u62BC\u8D37" }
    ]
  },
  {
    id: "biz",
    name: "\u7ECF\u8425\u8D37",
    children: [
      { id: "biz-micro", name: "\u5C0F\u5FAE\u7ECF\u8425\u8D37" },
      { id: "biz-individual", name: "\u4E2A\u4F53\u5DE5\u5546\u6237\u8D37" },
      { id: "biz-supply", name: "\u4F9B\u5E94\u94FE\u8D37" }
    ]
  },
  {
    id: "consume",
    name: "\u6D88\u8D39\u8D37",
    children: [
      { id: "consume-goods", name: "\u5546\u54C1\u5206\u671F\u8D37" },
      { id: "consume-education", name: "\u6559\u80B2\u5206\u671F\u8D37" },
      { id: "consume-medical", name: "\u533B\u7F8E\u5206\u671F\u8D37" },
      { id: "consume-travel", name: "\u65C5\u6E38\u5206\u671F\u8D37" }
    ]
  },
  {
    id: "card",
    name: "\u4FE1\u7528\u5361",
    children: [
      { id: "card-standard", name: "\u6807\u51C6\u4FE1\u7528\u5361" },
      { id: "card-gold", name: "\u91D1\u5361" },
      { id: "card-platinum", name: "\u767D\u91D1\u5361" }
    ]
  },
  {
    id: "other",
    name: "\u5176\u4ED6",
    children: [
      { id: "other-assist", name: "\u52A9\u519C\u8D37" },
      { id: "other-policy", name: "\u4FDD\u5355\u8D37" },
      { id: "other-lease", name: "\u79DF\u8D41\u8D37" }
    ]
  }
];
var PRODUCT_LEAVES = PRODUCT_TREE.flatMap(
  (c) => c.children.map((ch) => ({ id: ch.id, name: ch.name, catId: c.id, cat: c.name }))
);
var SECTION_CATALOG = {
  info_verify: [
    {
      id: "score_model",
      name: "\u5F97\u5206\u8BA1\u7B97",
      desc: "\u62A5\u544A\u9876\u90E8\u7684\u603B\u98CE\u9669\u503C\u5361\u7247\uFF1A\u5206\u6570\u8D8A\u5927\u4EE3\u8868\u98CE\u9669\u8D8A\u9AD8\uFF080-100\uFF0C\u226580 \u4E3A\u9AD8\u5371\uFF09\u3002\u5C5E\u4E8E\u300C\u81EA\u52A8\u5BA1\u6838\u300DTab\uFF0C\u7531\u5DF2\u914D\u7F6E\u7684\u6570\u636E\u6E90/\u89C4\u5219\u96C6\u7B97\u5F97\uFF0C\u4E0D\u5728\u300C\u62A5\u544A\u5185\u5BB9\u300D\u91CC\u914D\u6765\u6E90\u3002",
      fields: [
        { id: "sv_big", name: "\u5F02\u5E38\u503C\u5927\u6570\u5B57", desc: "\u9876\u90E8\u6838\u5FC3\u5206\u6570\uFF0C\u5982 82 \u5206\u3002\u52FE\u6389\u5219\u53EA\u4FDD\u7559\u7B49\u7EA7\u6807\u7B7E" },
        { id: "sv_denom", name: "\u6EE1\u5206\u5206\u6BCD", desc: "\u5F02\u5E38\u503C\u7684\u8BA1\u7B97\u6EE1\u5206\u57FA\u51C6\uFF08\u56FA\u5B9A 100\uFF09" },
        { id: "sv_level", name: "\u98CE\u9669\u6863\u6807\u7B7E", desc: "\u5982\u300C\u9AD8\u5371\u300D\u7684\u5F69\u8272\u6807\u7B7E\uFF0C\u989C\u8272\u968F\u6863\u4F4D\u53D8\u5316" },
        { id: "sv_threshold", name: "\u9608\u503C\u523B\u5EA6\u6761", desc: "\u6807\u6CE8 \u5B89\u5168/\u5173\u6CE8/\u8B66\u793A/\u9AD8\u5371 \u56DB\u6BB5\u7684\u523B\u5EA6\u6761\uFF0C\u6307\u9488\u6307\u5411\u5F53\u524D\u5206" },
        { id: "sv_breakdown", name: "\u6784\u6210\u9879\u5206\u89E3\u8868", desc: "\u5F02\u5E38\u503C\u7531\u54EA\u4E9B\u98CE\u9669\u9879\u7D2F\u8BA1\u6784\u6210\uFF08\u542B\u6743\u91CD\u4E0E\u65B9\u5411\uFF09" },
        { id: "sv_total", name: "\u5408\u8BA1\u884C", desc: "\u5404\u6784\u6210\u9879\u52A0\u6743\u540E\u7684\u5408\u8BA1\u5206" },
        { id: "sv_rule", name: "\u5224\u5B9A\u89C4\u5219\u6587\u672C", desc: "\u5F53\u524D\u5F02\u5E38\u503C\u5BF9\u5E94\u7684\u5224\u5B9A\u89C4\u5219\u8BF4\u660E" },
        { id: "sv_audit", name: "\u5BA1\u8BA1\u680F", desc: "\u6A21\u578B\u7248\u672C\u3001\u8BA1\u7B97\u65F6\u95F4\u7B49\u53EF\u8FFD\u6EAF\u4FE1\u606F" },
        { id: "sv_weight", name: "\u67E5\u770B\u6743\u91CD\u660E\u7EC6\u6309\u94AE", desc: "\u6253\u5F00\u5F39\u7A97\u67E5\u770B\u5404\u98CE\u9669\u9879\u6253\u5206\u6743\u91CD" }
      ]
    },
    {
      id: "conclusion_process",
      name: "\u7ED3\u8BBA\u4E0E\u7EC8\u5BA1",
      desc: "\u7CFB\u7EDF\u81EA\u52A8\u7ED3\u8BBA + \u4EBA\u5DE5\u5BA1\u6838\u7ED3\u679C + \u7EC8\u5BA1\u64CD\u4F5C\u5165\u53E3\uFF0C\u4EE5\u53CA\u6838\u9A8C\u8FC7\u7A0B\u65F6\u95F4\u7EBF\u3002\u5C5E\u4E8E\u300C\u4EBA\u5DE5\u5BA1\u6838\u300DTab\uFF0C\u7531\u5DF2\u914D\u7F6E\u7684\u6570\u636E\u6E90/\u89C4\u5219\u96C6\u7B97\u5F97\uFF0C\u4E0D\u5728\u300C\u62A5\u544A\u5185\u5BB9\u300D\u91CC\u914D\u6765\u6E90\u3002",
      fields: [
        { id: "cp_system", name: "\u81EA\u52A8\u5BA1\u6838", desc: "\u673A\u5668\u81EA\u52A8\u7ED9\u51FA\u7684\u5904\u7F6E\u7ED3\u8BBA\uFF08\u901A\u8FC7/\u9884\u8B66/\u62D2\u7EDD\uFF09\uFF0C\u7531\u5206\u6570\u8BA1\u7B97\u540E\u5224\u5B9A" },
        { id: "cp_manual", name: "\u4EBA\u5DE5\u5BA1\u6838", desc: "\u4EBA\u5DE5\u64CD\u4F5C\u540E\u7684\u5DE5\u5355\u72B6\u6001\uFF08\u5F85\u786E\u8BA4/\u786E\u8BA4\u901A\u8FC7/\u786E\u8BA4\u62D2\u7EDD/\u63D0\u4EA4\u590D\u6838/\u590D\u6838\u901A\u8FC7/\u590D\u6838\u62D2\u7EDD/\u5173\u95ED\uFF09" },
        { id: "cp_operator", name: "\u64CD\u4F5C\u4EBA\u5458", desc: "\u5F53\u524D\u5904\u7406\u8BE5\u4EF6\u7684\u5BA1\u6838\u5458" },
        { id: "cp_advice", name: "\u6388\u4FE1\u5EFA\u8BAE", desc: "\u7CFB\u7EDF\u7ED9\u51FA\u7684\u6388\u4FE1\u989D\u5EA6/\u5229\u7387\u5EFA\u8BAE" },
        { id: "cp_reason", name: "\u5EFA\u8BAE\u7406\u7531", desc: "\u7ED9\u51FA\u8BE5\u5EFA\u8BAE\u7684\u4F9D\u636E\u6458\u8981" },
        { id: "cp_pos", name: "\u6B63\u5411\u56E0\u7D20", desc: "\u652F\u6301\u901A\u8FC7\u7684\u6709\u5229\u70B9" },
        { id: "cp_risk", name: "\u98CE\u9669\u56E0\u7D20", desc: "\u5BFC\u81F4\u9884\u8B66/\u62D2\u7EDD\u7684\u98CE\u9669\u70B9" },
        { id: "cp_amount", name: "\u53C2\u8003\u6388\u4FE1\u989D\u5EA6", desc: "\u5EFA\u8BAE\u53EF\u6388\u4E88\u7684\u989D\u5EA6\u4E0A\u9650" },
        { id: "cp_ops", name: "\u64CD\u4F5C\u6309\u94AE\u7EC4", desc: "\u8BE5\u72B6\u6001\u4E0B\u53EF\u6267\u884C\u7684\u64CD\u4F5C\uFF08\u5982\u62A5\u544A\u786E\u8BA4/\u5F3A\u5236\u590D\u5BA1\uFF09" },
        { id: "cp_timeline", name: "\u6838\u9A8C\u8FC7\u7A0B\u65F6\u95F4\u7EBF", desc: "\u4ECE\u8FDB\u4EF6\u5230\u5F53\u524D\u7684\u5404\u6B65\u5904\u7406\u8BB0\u5F55" },
        { id: "cp_step_icon", name: "\u6B65\u9AA4\u56FE\u6807", desc: "\u65F6\u95F4\u7EBF\u6BCF\u6B65\u7684\u72B6\u6001\u56FE\u6807" },
        { id: "cp_step_status", name: "\u6B65\u9AA4\u72B6\u6001\u8272", desc: "\u6B65\u9AA4\u901A\u8FC7/\u5F02\u5E38\u7684\u989C\u8272\u6807\u8BC6" },
        { id: "cp_step_cost", name: "\u6B65\u9AA4\u8017\u65F6", desc: "\u6BCF\u6B65\u5904\u7406\u82B1\u8D39\u7684\u65F6\u95F4" }
      ]
    },
    {
      id: "basic_info",
      name: "\u7528\u6237\u57FA\u672C\u4FE1\u606F",
      desc: "\u7533\u8BF7\u4EBA\u8EAB\u4EFD\u3001\u8054\u7CFB\u65B9\u5F0F\u4E0E\u8BBE\u5907\u73AF\u5883\u7B49\u57FA\u7840\u8D44\u6599\u3002",
      groups: [
        { id: "g_base", name: "\u57FA\u7840\u8D44\u6599" },
        { id: "g_env", name: "\u73AF\u5883\u91C7\u96C6" }
      ],
      fields: [
        { id: "bi_name", name: "\u59D3\u540D", desc: "\u7533\u8BF7\u4EBA\u59D3\u540D", group: "g_base" },
        { id: "bi_id", name: "\u8EAB\u4EFD\u8BC1\u53F7", desc: "\u8131\u654F\u540E\u7684\u8BC1\u4EF6\u53F7", group: "g_base" },
        { id: "bi_phone", name: "\u624B\u673A\u53F7", desc: "\u7533\u8BF7\u6240\u7528\u624B\u673A\u53F7", group: "g_base" },
        { id: "bi_bank", name: "\u94F6\u884C\u5361\u53F7", desc: "\u6536\u6B3E/\u7ED1\u5B9A\u94F6\u884C\u5361", group: "g_base" },
        { id: "bi_bank_branch", name: "\u5F00\u6237\u884C", desc: "\u94F6\u884C\u5361\u5F52\u5C5E\u652F\u884C", group: "g_base" },
        { id: "bi_age", name: "\u5E74\u9F84", desc: "\u7533\u8BF7\u4EBA\u5E74\u9F84", group: "g_base" },
        { id: "bi_edu", name: "\u5B66\u5386", desc: "\u6700\u9AD8\u5B66\u5386", group: "g_base" },
        { id: "bi_company", name: "\u5DE5\u4F5C\u5355\u4F4D", desc: "\u4EFB\u804C\u5355\u4F4D", group: "g_base" },
        { id: "bi_income", name: "\u6708\u6536\u5165", desc: "\u7533\u62A5\u6708\u6536\u5165", group: "g_base" },
        { id: "bi_address", name: "\u5C45\u4F4F\u5730\u5740", desc: "\u5E38\u4F4F\u5730\u5740", group: "g_base" },
        { id: "bi_marriage", name: "\u5A5A\u59FB", desc: "\u5A5A\u59FB\u72B6\u51B5", group: "g_base" },
        { id: "bi_fp", name: "\u8BBE\u5907\u6307\u7EB9", desc: "\u672C\u673A\u8BBE\u5907\u6307\u7EB9\u6807\u8BC6", group: "g_env" },
        { id: "bi_ip", name: "IP\u5730\u5740", desc: "\u7533\u8BF7\u65F6 IP", group: "g_env" },
        { id: "bi_gps", name: "GPS\u5B9A\u4F4D", desc: "\u7533\u8BF7\u65F6\u5B9A\u4F4D", group: "g_env" },
        { id: "bi_channel", name: "\u8FDB\u4EF6\u6E20\u9053", desc: "\u6765\u81EA\u54EA\u4E2A\u6E20\u9053", group: "g_env" },
        { id: "bi_appver", name: "APP\u7248\u672C", desc: "\u7533\u8BF7\u6240\u7528 App \u7248\u672C", group: "g_env" }
      ]
    },
    {
      id: "id_images",
      name: "\u7528\u6237\u8BC1\u4EF6\u7167",
      desc: "\u8EAB\u4EFD\u8BC1\u3001\u6D3B\u4F53\u4E0E\u94F6\u884C\u5361\u7B49\u51ED\u8BC1\u5F71\u50CF\u53CA OCR \u6587\u672C\u3002",
      fields: [
        { id: "ii_front", name: "\u8EAB\u4EFD\u8BC1\u4EBA\u50CF\u9762", desc: "\u8EAB\u4EFD\u8BC1\u6B63\u9762\u5F71\u50CF" },
        { id: "ii_back", name: "\u8EAB\u4EFD\u8BC1\u56FD\u5FBD\u9762", desc: "\u8EAB\u4EFD\u8BC1\u80CC\u9762\u5F71\u50CF" },
        { id: "ii_live", name: "\u6D3B\u4F53\u4EBA\u8138\uFF08\u89C6\u9891\uFF09", desc: "\u6D3B\u4F53\u68C0\u6D4B\u91C7\u96C6" },
        { id: "ii_bank", name: "\u94F6\u884C\u5361", desc: "\u94F6\u884C\u5361\u5F71\u50CF" },
        { id: "ii_ocr", name: "OCR\u8BC6\u522B\u6587\u672C", desc: "\u5F71\u50CF\u8BC6\u522B\u51FA\u7684\u6587\u5B57" }
      ]
    },
    {
      id: "single_verify",
      name: "\u591A\u6E90\u5E76\u884C\u6838\u9A8C\u5355\u9879\u62A5\u544A",
      desc: "\u516C\u5B89\u3001\u94F6\u884C\u5361\u3001\u8FD0\u8425\u5546\u3001\u8BBE\u5907\u3001\u8054\u9632\u8054\u63A7\u7B49\u5404\u6570\u636E\u6E90\u7684\u72EC\u7ACB\u6838\u9A8C\u7ED3\u679C\u3002",
      fields: [
        { id: "sv_police", name: "\u516C\u5B89\u5B9E\u540D\uFF08\u53EF\u72EC\u7ACB\u9690\u85CF\uFF09", desc: "\u516C\u5B89\u8EAB\u4EFD\u5B9E\u540D\u6838\u9A8C\u7ED3\u679C" },
        { id: "sv_bank4", name: "\u94F6\u884C\u5361\u56DB\u8981\u7D20\uFF08\u53EF\u72EC\u7ACB\u9690\u85CF\uFF09", desc: "\u59D3\u540D/\u5361\u53F7/\u8BC1\u4EF6/\u624B\u673A \u56DB\u8981\u7D20" },
        { id: "sv_operator", name: "\u8FD0\u8425\u5546\u5B9E\u540D\uFF08\u53EF\u72EC\u7ACB\u9690\u85CF\uFF09", desc: "\u8FD0\u8425\u5546\u5B9E\u540D\u6838\u9A8C", options: ["\u5DF2\u5B9E\u540D", "\u672A\u5B9E\u540D", "\u672A\u6838\u9A8C"] },
        { id: "sv_device", name: "\u7EC8\u7AEF\u8BBE\u5907\uFF08\u53EF\u72EC\u7ACB\u9690\u85CF\uFF09", desc: "\u8BBE\u5907\u771F\u5B9E\u6027\u6838\u9A8C" },
        { id: "sv_link", name: "\u8054\u9632\u8054\u63A7\uFF08\u53EF\u72EC\u7ACB\u9690\u85CF\uFF09", desc: "\u8DE8\u673A\u6784\u8054\u9632\u7ED3\u679C" },
        { id: "sv_head", name: "\u5361\u7247\u5934\u90E8", desc: "\u5355\u9879\u5361\u7247\u6807\u9898\u533A" },
        { id: "sv_concl", name: "\u6574\u4F53\u7ED3\u8BBA", desc: "\u8BE5\u6570\u636E\u6E90\u6574\u4F53\u7ED3\u8BBA" },
        { id: "sv_cause", name: "\u7ED3\u8BBA\u539F\u56E0", desc: "\u7ED3\u8BBA\u6210\u56E0" },
        { id: "sv_subfields", name: "\u5B50\u5B57\u6BB5\u5217\u8868", desc: "\u8BE5\u6570\u636E\u6E90\u8FD4\u56DE\u7684\u660E\u7EC6\u5B57\u6BB5" },
        { id: "sv_serial", name: "\u6838\u9A8C\u6D41\u6C34\u53F7", desc: "\u672C\u6B21\u6838\u9A8C\u6D41\u6C34\u53F7" },
        { id: "sv_time", name: "\u6838\u9A8C\u65F6\u95F4", desc: "\u6838\u9A8C\u53D1\u751F\u65F6\u95F4" },
        { id: "sv_channel", name: "\u8C03\u7528\u6E20\u9053", desc: "\u8C03\u7528\u8BE5\u6570\u636E\u6E90\u7684\u6E20\u9053" },
        { id: "sv_cost", name: "\u8C03\u7528\u8017\u65F6", desc: "\u63A5\u53E3\u8017\u65F6" }
      ]
    },
    {
      id: "cross_fusion",
      name: "\u6570\u636E\u4EA4\u53C9\u878D\u5408\u7EFC\u5408\u62A5\u544A",
      desc: "\u591A\u6E90\u6570\u636E\u4EA4\u53C9\u6BD4\u5BF9\u540E\u7684\u7EFC\u5408\u98CE\u9669\u7ED3\u8BBA\u4E0E\u7591\u70B9\u660E\u7EC6\u3002",
      fields: [
        { id: "cf_head", name: "\u7EFC\u5408\u98CE\u9669\u5934\u90E8\u680F", desc: "\u4EA4\u53C9\u878D\u5408\u7ED3\u8BBA\u7684\u5934\u90E8\u533A" },
        { id: "cf_atom", name: "5\u9879\u539F\u5B50\u7ED3\u8BBA\u5361", desc: "\u5404\u7EF4\u5EA6\u539F\u5B50\u7EA7\u7ED3\u8BBA" },
        { id: "cf_doubt", name: "\u591A\u6E90\u98CE\u9669\u4EA4\u53C9\u7591\u70B9\u660E\u7EC6", desc: "\u8DE8\u6E90\u51B2\u7A81/\u7591\u70B9\u6E05\u5355" },
        { id: "cf_abnormal", name: "\u5F02\u5E38\u503C\u6784\u6210\u9879\u5206\u89E3", desc: "\u5F02\u5E38\u503C\u7684\u5404\u9879\u6784\u6210" },
        { id: "cf_tags", name: "\u98CE\u9669\u6807\u7B7E", desc: "\u547D\u4E2D\u98CE\u9669\u6807\u7B7E" },
        { id: "cf_rule", name: "\u5224\u5B9A\u89C4\u5219\u6587\u672C", desc: "\u5224\u5B9A\u89C4\u5219\u8BF4\u660E" },
        { id: "cf_audit", name: "\u5BA1\u8BA1\u4FE1\u606F", desc: "\u6EAF\u6E90\u4FE1\u606F" },
        { id: "cf_weight", name: "\u67E5\u770B\u6253\u5206\u6743\u91CD\u660E\u7EC6\u5F39\u7A97\u5165\u53E3", desc: "\u6253\u5F00\u6743\u91CD\u5F39\u7A97" }
      ]
    },
    {
      id: "op_logs",
      name: "\u5355\u9879\u6838\u9A8C\u5168\u91CF\u64CD\u4F5C\u65E5\u5FD7",
      desc: "\u6240\u6709\u5355\u9879\u6838\u9A8C\u4E0E\u62A5\u544A\u7EA7\u64CD\u4F5C\u7684\u65F6\u95F4\u7EBF\u8BB0\u5F55\u3002",
      fields: [
        { id: "ol_single", name: "\u5355\u9879\u64CD\u4F5C\u8BB0\u5F55", desc: "\u5404\u6570\u636E\u6E90\u5355\u9879\u64CD\u4F5C" },
        { id: "ol_report", name: "\u62A5\u544A\u7EA7\u64CD\u4F5C\u8BB0\u5F55", desc: "\u62A5\u544A\u6574\u4F53\u64CD\u4F5C" },
        { id: "ol_timeline", name: "\u64CD\u4F5C\u65E5\u5FD7\u65F6\u95F4\u7EBF", desc: "\u64CD\u4F5C\u65F6\u95F4\u7EBF" },
        { id: "ol_attach", name: "\u9644\u4EF6\u5217", desc: "\u64CD\u4F5C\u9644\u4EF6" },
        { id: "ol_review", name: "\u590D\u6838\u72B6\u6001\u5217", desc: "\u590D\u6838\u72B6\u6001" }
      ]
    }
  ],
  credit: [
    {
      id: "applicant_info",
      name: "\u7528\u6237\u57FA\u672C\u4FE1\u606F",
      desc: "\u7533\u8BF7\u4EBA\u8EAB\u4EFD\u4E0E\u57FA\u7840\u8D44\u6599\u3002",
      fields: [
        { id: "ai_name", name: "\u59D3\u540D", desc: "\u7533\u8BF7\u4EBA\u59D3\u540D" },
        { id: "ai_id", name: "\u8EAB\u4EFD\u8BC1\u53F7", desc: "\u8131\u654F\u8BC1\u4EF6\u53F7" },
        { id: "ai_phone", name: "\u624B\u673A\u53F7", desc: "\u624B\u673A\u53F7" },
        { id: "ai_bank", name: "\u94F6\u884C\u5361\u53F7", desc: "\u94F6\u884C\u5361\u53F7" },
        { id: "ai_bank_branch", name: "\u5F00\u6237\u884C", desc: "\u5F00\u6237\u884C" },
        { id: "ai_age", name: "\u5E74\u9F84", desc: "\u5E74\u9F84" },
        { id: "ai_edu", name: "\u5B66\u5386", desc: "\u5B66\u5386" },
        { id: "ai_company", name: "\u5DE5\u4F5C\u5355\u4F4D", desc: "\u5DE5\u4F5C\u5355\u4F4D" },
        { id: "ai_income", name: "\u6708\u6536\u5165", desc: "\u6708\u6536\u5165" },
        { id: "ai_address", name: "\u5C45\u4F4F\u5730\u5740", desc: "\u5C45\u4F4F\u5730\u5740" },
        { id: "ai_marriage", name: "\u5A5A\u59FB", desc: "\u5A5A\u59FB" },
        { id: "ai_fp", name: "\u8BBE\u5907\u6307\u7EB9", desc: "\u8BBE\u5907\u6307\u7EB9" },
        { id: "ai_ip", name: "IP\u5730\u5740", desc: "IP" },
        { id: "ai_gps", name: "GPS\u5B9A\u4F4D", desc: "GPS" },
        { id: "ai_channel", name: "\u8FDB\u4EF6\u6E20\u9053", desc: "\u6E20\u9053" },
        { id: "ai_appver", name: "APP\u7248\u672C", desc: "App \u7248\u672C" }
      ]
    },
    {
      id: "credit_overview",
      name: "\u4FE1\u7528\u8BC4\u5206\u603B\u89C8",
      desc: "\u9876\u90E8\u73AF\u5F62\u56FE\uFF1A\u4FE1\u7528\u8BC4\u5206 + \u98CE\u9669\u7B49\u7EA7 Badge + \u884C\u4E1A\u5E73\u5747\u5BF9\u6BD4 + \u516D\u5927\u7EF4\u5EA6\u8BC4\u5206\u6761\uFF08\u542B\u6743\u91CD\uFF09\u3002",
      fields: [
        { id: "co_ring", name: "\u4FE1\u7528\u8BC4\u5206\u73AF\u5F62\u56FE", desc: "\u603B\u8BC4\u5206\u73AF\u5F62\u56FE\uFF08DisplayComponent=\u73AF\u5F62\u56FE\uFF0C\u6A21\u578B\u5DF2\u652F\u6301\uFF09" },
        { id: "co_level", name: "\u98CE\u9669\u7B49\u7EA7 Badge", desc: "A/B/C/D \u7B49\u7EA7\u5F69\u8272\u6807\u7B7E" },
        { id: "co_industry", name: "\u884C\u4E1A\u5E73\u5747\u5BF9\u6BD4", desc: "\u4E0E\u884C\u4E1A\u5E73\u5747\u5206\u7684\u5BF9\u6BD4\u6807\u6CE8" },
        { id: "co_dims", name: "\u516D\u5927\u7EF4\u5EA6\u8BC4\u5206\u6761", desc: "\u8EAB\u4EFD/\u8FD8\u6B3E/\u4FE1\u7528\u5386\u53F2/\u884C\u4E3A/\u8BBE\u5907/\u5173\u8054 \u516D\u7EF4 ProgressBar\uFF08\u6807\u6CE8\u6743\u91CD\uFF09" },
        { id: "co_tags", name: "\u98CE\u9669\u6807\u7B7E", desc: "\u547D\u4E2D\u7684\u98CE\u9669\u6807\u7B7E" }
      ]
    },
    {
      id: "credit_factors",
      name: "\u98CE\u9669\u56E0\u5B50\u5206\u6790",
      desc: "\u516D\u7EF4\u98CE\u9669\u56E0\u5B50\u5361\u7247\uFF1A\u6BCF\u7EF4\u542B\u5F97\u5206/\u6743\u91CD/\u7B49\u7EA7/\u903B\u8F91/\u6765\u6E90\u3002",
      fields: [
        { id: "cf_dim_card", name: "\u516D\u7EF4\u56E0\u5B50\u5361\u7247", desc: "\u8EAB\u4EFD/\u8FD8\u6B3E/\u4FE1\u7528\u5386\u53F2/\u884C\u4E3A/\u8BBE\u5907/\u5173\u8054 \u5404\u4E00\u5F20\u5361\u7247" },
        { id: "cf_dim_score", name: "\u7EF4\u5EA6\u5F97\u5206", desc: "\u8BE5\u7EF4\u5F97\u5206" },
        { id: "cf_dim_weight", name: "\u7EF4\u5EA6\u6743\u91CD", desc: "\u8BE5\u7EF4\u6743\u91CD" },
        { id: "cf_dim_level", name: "\u7EF4\u5EA6\u7B49\u7EA7", desc: "\u8BE5\u7EF4\u98CE\u9669\u7B49\u7EA7" },
        { id: "cf_dim_logic", name: "\u7EF4\u5EA6\u903B\u8F91", desc: "\u8BE5\u7EF4\u5224\u5B9A\u903B\u8F91" },
        { id: "cf_dim_source", name: "\u7EF4\u5EA6\u6765\u6E90", desc: "\u8BE5\u7EF4\u6570\u636E\u6765\u6E90" },
        { id: "cf_table", name: "\u7EF4\u5EA6\u8BF4\u660E\u8868", desc: "\u516D\u7EF4 \u6743\u91CD/\u903B\u8F91/\u6765\u6E90 \u6C47\u603B\u8868" }
      ]
    },
    {
      id: "credit_trend",
      name: "\u4FE1\u7528\u8BC4\u5206\u8D8B\u52BF",
      desc: "\u7528\u6237\u8FD1 7 \u6708\u4FE1\u7528\u8BC4\u5206 vs \u884C\u4E1A\u5E73\u5747\u7684\u8D8B\u52BF\u6298\u7EBF\u56FE\u3002",
      fields: [
        { id: "ct_line", name: "\u8D8B\u52BF\u6298\u7EBF\u56FE", desc: "\u26A0\uFE0F DisplayComponent \u65E0\u6298\u7EBF/\u8D8B\u52BF\u56FE\u7C7B\u578B\uFF0C\u9700\u6A21\u578B\u6269\u5C55\uFF08GAP\uFF09" },
        { id: "ct_user", name: "\u7528\u6237\u8BC4\u5206\u66F2\u7EBF", desc: "\u7528\u6237\u6BCF\u6708\u8BC4\u5206" },
        { id: "ct_industry", name: "\u884C\u4E1A\u5E73\u5747\u66F2\u7EBF", desc: "\u884C\u4E1A\u6BCF\u6708\u5E73\u5747" }
      ]
    },
    {
      id: "credit_radar",
      name: "\u98CE\u9669\u7EF4\u5EA6\u96F7\u8FBE\u56FE",
      desc: "\u5F53\u524D\u516D\u7EF4 vs \u884C\u4E1A\u5E73\u5747\u7684\u96F7\u8FBE\u56FE\u3002",
      fields: [
        { id: "cr_radar", name: "\u96F7\u8FBE\u56FE", desc: "\u26A0\uFE0F DisplayComponent \u65E0\u96F7\u8FBE\u56FE\u7C7B\u578B\uFF0C\u9700\u6A21\u578B\u6269\u5C55\uFF08GAP\uFF09" },
        { id: "cr_cur", name: "\u5F53\u524D\u7EF4\u5EA6\u503C", desc: "\u5F53\u524D\u516D\u7EF4\u503C" },
        { id: "cr_avg", name: "\u884C\u4E1A\u5E73\u5747\u7EF4\u5EA6\u503C", desc: "\u884C\u4E1A\u5E73\u5747\u516D\u7EF4\u503C" }
      ]
    },
    {
      id: "credit_suggestion",
      name: "\u98CE\u63A7\u51B3\u7B56\u5EFA\u8BAE",
      desc: "\u7CFB\u7EDF\u5EFA\u8BAE + \u6B63\u5411/\u98CE\u9669\u56E0\u7D20 + \u51B3\u7B56\u6309\u94AE\u3002",
      fields: [
        { id: "cs_text", name: "\u7CFB\u7EDF\u5EFA\u8BAE\u6587\u6848", desc: "\u51B3\u7B56\u5EFA\u8BAE\u6587\u5B57" },
        { id: "cs_pos", name: "\u6B63\u5411\u56E0\u7D20\u5217\u8868", desc: "\u6709\u5229\u56E0\u7D20" },
        { id: "cs_risk", name: "\u98CE\u9669\u56E0\u7D20\u5217\u8868", desc: "\u98CE\u9669\u70B9" },
        { id: "cs_ops", name: "4\u51B3\u7B56\u6309\u94AE", desc: "\u5BA1\u6838\u901A\u8FC7/\u62D2\u7EDD\u6388\u4FE1/\u63D0\u4EA4\u4EBA\u5DE5\u590D\u6838/\u9000\u56DE\u8865\u5145\u6750\u6599" }
      ]
    },
    {
      id: "history_records",
      name: "\u5386\u53F2\u6388\u4FE1\u8BB0\u5F55",
      desc: "\u8BE5\u5BA2\u6237\u5386\u53F2\u6388\u4FE1\u4E0E\u903E\u671F\u60C5\u51B5\u3002",
      fields: [
        { id: "hr_table", name: "\u5386\u53F2\u6388\u4FE1\u8BB0\u5F55\u8868", desc: "\u65F6\u95F4/\u989D\u5EA6/\u671F\u9650/\u72B6\u6001/\u903E\u671F" }
      ]
    },
    {
      id: "credit_logs",
      name: "\u98CE\u63A7\u64CD\u4F5C\u65E5\u5FD7",
      desc: "\u4FE1\u7528\u98CE\u63A7\u76F8\u5173\u64CD\u4F5C\u65F6\u95F4\u7EBF\u3002",
      fields: [
        { id: "cl_timeline", name: "\u65F6\u95F4\u7EBF\u65E5\u5FD7", desc: "\u64CD\u4F5C\u4EBA/\u64CD\u4F5C/\u65F6\u95F4/\u7ED3\u679C/\u5907\u6CE8" }
      ]
    }
  ],
  fraud: [
    {
      id: "fraud_score_model",
      name: "\u6B3A\u8BC8\u98CE\u9669\u8BC4\u5206\u6A21\u578B\u5361",
      desc: "\u62A5\u544A\u9876\u90E8\u7684\u6B3A\u8BC8\u5206\u5361\u7247\uFF1A\u5206\u6570\u8D8A\u5927\u6B3A\u8BC8\u98CE\u9669\u8D8A\u9AD8\uFF080-100\uFF0C\u226580 \u4E3A\u6781\u9AD8\uFF09\u3002",
      fields: [
        { id: "fsm_big", name: "\u6B3A\u8BC8\u5206\u5927\u6570\u5B57", desc: "\u6838\u5FC3\u6B3A\u8BC8\u5206\uFF0C\u5982 88 \u5206" },
        { id: "fsm_level", name: "\u98CE\u9669\u7B49\u7EA7\u6807\u7B7E", desc: "\u6781\u4F4E/\u4F4E/\u4E2D/\u9AD8/\u6781\u9AD8 \u6807\u7B7E" },
        { id: "fsm_threshold", name: "\u9608\u503C\u523B\u5EA6\u6761", desc: "\u4E94\u6863\u523B\u5EA6\u6761\uFF0C\u6307\u9488\u6307\u5411\u5F53\u524D\u5206" },
        { id: "fsm_hit", name: "\u547D\u4E2D\u89C4\u5219\u7EDF\u8BA1", desc: "\u547D\u4E2D X/Y \u6761\u89C4\u5219\uFF0C\u5360\u6BD4 Z%" },
        { id: "fsm_tags", name: "\u98CE\u9669\u6807\u7B7E", desc: "\u8BBE\u5907\u7FA4\u63A7/\u56E2\u4F19\u6B3A\u8BC8/\u9ED1\u540D\u5355\u547D\u4E2D" },
        { id: "fsm_version", name: "\u89C4\u5219\u7248\u672C", desc: "\u5F53\u524D\u53CD\u6B3A\u8BC8\u89C4\u5219\u7248\u672C\u53F7" }
      ]
    },
    {
      id: "disposal_bar",
      name: "\u5904\u7F6E\u5EFA\u8BAE\u4E0E\u64CD\u4F5C\u680F",
      desc: "\u98CE\u9669\u7B49\u7EA7 + \u81EA\u52A8/\u4EBA\u5DE5\u5904\u7F6E\u7ED3\u8BBA + \u5904\u7F6E\u64CD\u4F5C\u5165\u53E3\u3002",
      fields: [
        { id: "db_level", name: "\u98CE\u9669\u7B49\u7EA7", desc: "\u6B3A\u8BC8\u98CE\u9669\u7B49\u7EA7" },
        { id: "db_auto", name: "\u81EA\u52A8\u5BA1\u6838", desc: "\u673A\u5668\u81EA\u52A8\u5BA1\u6838\u7ED3\u8BBA" },
        { id: "db_status", name: "\u5904\u7F6E\u72B6\u6001", desc: "\u5F53\u524D\u5904\u7F6E\u72B6\u6001" },
        { id: "db_operator", name: "\u5904\u7F6E\u4EBA", desc: "\u5904\u7406\u4EBA" },
        { id: "db_ops", name: "\u5904\u7F6E\u6309\u94AE\u7EC4", desc: "\u67E5\u770B/\u62A5\u544A\u786E\u8BA4/\u5F3A\u5236\u590D\u5BA1/\u52A0\u5165\u9ED1\u540D\u5355\u7B49" },
        { id: "db_advice", name: "\u5904\u7F6E\u5EFA\u8BAE\u6587\u6848", desc: "\u5904\u7F6E\u5EFA\u8BAE\u6587\u5B57" }
      ]
    },
    {
      id: "basic_info",
      name: "\u7528\u6237\u57FA\u672C\u4FE1\u606F",
      desc: "\u7533\u8BF7\u4EBA\u57FA\u7840\u8D44\u6599\u3002",
      fields: [
        { id: "fbi_name", name: "\u59D3\u540D", desc: "\u59D3\u540D" },
        { id: "fbi_id", name: "\u8EAB\u4EFD\u8BC1\u53F7", desc: "\u8131\u654F\u8BC1\u4EF6\u53F7" },
        { id: "fbi_phone", name: "\u624B\u673A\u53F7", desc: "\u624B\u673A\u53F7" },
        { id: "fbi_bank", name: "\u94F6\u884C\u5361\u53F7", desc: "\u94F6\u884C\u5361\u53F7" },
        { id: "fbi_age", name: "\u5E74\u9F84", desc: "\u5E74\u9F84" },
        { id: "fbi_channel", name: "\u8FDB\u4EF6\u6E20\u9053", desc: "\u6E20\u9053" }
      ]
    },
    {
      id: "identity_fraud",
      name: "\u8EAB\u4EFD\u6B3A\u8BC8\u8BE6\u60C5",
      desc: "\u5192\u7528\u4ED6\u4EBA\u8EAB\u4EFD\u3001\u8BC1\u4EF6\u4F2A\u9020\u7B49\u547D\u4E2D\u89C4\u5219\u660E\u7EC6\u3002",
      fields: [
        { id: "if_table", name: "RuleTable", desc: "\u89C4\u5219\u540D\u79F0/\u547D\u4E2D\u6761\u4EF6/\u6743\u91CD/\u72B6\u6001/\u64CD\u4F5C" },
        { id: "if_detail", name: "\u67E5\u770B\u8BE6\u60C5", desc: "\u6253\u5F00\u660E\u7EC6" },
        { id: "if_exempt", name: "\u6807\u8BB0\u8C41\u514D", desc: "\u5BF9\u8BE5\u89C4\u5219\u6807\u8BB0\u8C41\u514D" }
      ]
    },
    {
      id: "info_forgery",
      name: "\u4FE1\u606F\u4F2A\u9020\u8BE6\u60C5",
      desc: "\u8D44\u6599\u9020\u5047\u7C7B\u547D\u4E2D\u89C4\u5219\uFF08\u4E0E\u8EAB\u4EFD\u6B3A\u8BC8\u4E0D\u540C\u6570\u636E\u6E90\uFF09\u3002",
      fields: [
        { id: "inf_table", name: "RuleTable", desc: "\u540C\u8EAB\u4EFD\u6B3A\u8BC8\uFF0C\u4E0D\u540C\u6570\u636E\u6E90" },
        { id: "inf_detail", name: "\u67E5\u770B\u8BE6\u60C5", desc: "\u6253\u5F00\u660E\u7EC6" },
        { id: "inf_exempt", name: "\u6807\u8BB0\u8C41\u514D", desc: "\u6807\u8BB0\u8C41\u514D" }
      ]
    },
    {
      id: "device_fraud",
      name: "\u8BBE\u5907\u6B3A\u8BC8\u8BE6\u60C5",
      desc: "\u7FA4\u63A7\u3001\u6A21\u62DF\u5668\u3001Root/\u8D8A\u72F1\u7B49\u8BBE\u5907\u98CE\u9669\u3002",
      fields: [
        { id: "df_fp", name: "\u8BBE\u5907\u6307\u7EB9", desc: "\u8BBE\u5907\u6307\u7EB9" },
        { id: "df_type", name: "\u8BBE\u5907\u7C7B\u578B", desc: "\u673A\u578B" },
        { id: "df_root", name: "Root/\u8D8A\u72F1\u72B6\u6001", desc: "\u662F\u5426 Root/\u8D8A\u72F1" },
        { id: "df_emulator", name: "\u6A21\u62DF\u5668\u68C0\u6D4B", desc: "\u662F\u5426\u6A21\u62DF\u5668" },
        { id: "df_proxy", name: "\u4EE3\u7406/VPN\u68C0\u6D4B", desc: "\u662F\u5426\u4EE3\u7406" },
        { id: "df_rel_id", name: "\u8BBE\u5907\u5173\u8054\u8EAB\u4EFD\u6570", desc: "\u8BE5\u8BBE\u5907\u5173\u8054\u591A\u5C11\u8EAB\u4EFD" },
        { id: "df_rel_app", name: "\u8BBE\u5907\u5173\u8054\u7533\u8BF7\u6570", desc: "\u8BE5\u8BBE\u5907\u5173\u8054\u591A\u5C11\u7533\u8BF7" },
        { id: "df_first", name: "\u9996\u6B21\u51FA\u73B0\u65F6\u95F4", desc: "\u9996\u6B21\u51FA\u73B0" },
        { id: "df_graph", name: "\u8BBE\u5907\u5173\u8054\u56FE\u8C31", desc: "\u8BBE\u5907\u5173\u8054\u56FE\u8C31" }
      ]
    },
    {
      id: "behavior_fraud",
      name: "\u884C\u4E3A\u6B3A\u8BC8\u8BE6\u60C5",
      desc: "\u586B\u5199\u901F\u5EA6\u3001\u505C\u7559\u3001\u64CD\u4F5C\u8F68\u8FF9\u7B49\u5F02\u5E38\u884C\u4E3A\u3002",
      fields: [
        { id: "bf_cost", name: "\u7533\u8BF7\u8017\u65F6", desc: "\u603B\u8017\u65F6" },
        { id: "bf_speed", name: "\u586B\u5199\u901F\u5EA6", desc: "\u586B\u5199\u5FEB\u6162" },
        { id: "bf_stay", name: "\u9875\u9762\u505C\u7559", desc: "\u505C\u7559\u65F6\u957F" },
        { id: "bf_track", name: "\u64CD\u4F5C\u8F68\u8FF9", desc: "\u64CD\u4F5C\u8F68\u8FF9" },
        { id: "bf_gps", name: "GPS\u5B9A\u4F4D", desc: "GPS" },
        { id: "bf_cmp", name: "\u4E0E\u6B63\u5E38\u7528\u6237\u5BF9\u6BD4", desc: "\u4E0E\u6B63\u5E38\u7528\u6237\u884C\u4E3A\u57FA\u7EBF\u7684\u504F\u79BB\u5EA6" },
        { id: "bf_path", name: "\u64CD\u4F5C\u8DEF\u5F84", desc: "\u64CD\u4F5C\u8DEF\u5F84" },
        { id: "bf_timeline", name: "\u884C\u4E3A\u8F68\u8FF9\u65F6\u95F4\u7EBF", desc: "\u884C\u4E3A\u65F6\u95F4\u7EBF" }
      ]
    },
    {
      id: "gang_fraud",
      name: "\u56E2\u4F19\u6B3A\u8BC8\u8BE6\u60C5",
      desc: "\u5173\u8054\u5EA6\u3001\u56E2\u4F19\u89C4\u6A21\u4E0E\u5173\u8054\u56FE\u8C31\u3002",
      fields: [
        { id: "gf_tag", name: "\u56E2\u4F19\u6807\u7B7E", desc: "\u56E2\u4F19\u6807\u7B7E" },
        { id: "gf_score", name: "\u5173\u8054\u5EA6\u8BC4\u5206", desc: "\u5173\u8054\u5EA6" },
        { id: "gf_dim", name: "\u5173\u8054\u7EF4\u5EA6", desc: "\u5173\u8054\u7EF4\u5EA6" },
        { id: "gf_nodes", name: "\u5173\u8054\u8282\u70B9\u6570", desc: "\u8282\u70B9\u6570" },
        { id: "gf_scale", name: "\u56E2\u4F19\u89C4\u6A21", desc: "\u89C4\u6A21" },
        { id: "gf_case", name: "\u5386\u53F2\u6848\u4EF6", desc: "\u5386\u53F2\u6848\u4EF6" },
        { id: "gf_graph", name: "\u5173\u8054\u56FE\u8C31\u53EF\u89C6\u5316", desc: "\u5173\u8054\u56FE\u8C31" },
        { id: "gf_list", name: "\u5173\u8054\u5217\u8868", desc: "\u5173\u8054\u5217\u8868" }
      ]
    },
    {
      id: "blacklist_hit",
      name: "\u9ED1\u540D\u5355\u547D\u4E2D\u8BE6\u60C5",
      desc: "\u547D\u4E2D\u5185\u90E8/\u5916\u90E8\u9ED1\u540D\u5355\u7684\u660E\u7EC6\u3002",
      fields: [
        { id: "bh_type", name: "\u9ED1\u540D\u5355\u7C7B\u578B", desc: "\u9ED1\u7C7B\u578B" },
        { id: "bh_field", name: "\u547D\u4E2D\u5B57\u6BB5", desc: "\u547D\u4E2D\u5B57\u6BB5" },
        { id: "bh_source", name: "\u6765\u6E90", desc: "\u6765\u6E90" },
        { id: "bh_reason", name: "\u539F\u56E0", desc: "\u539F\u56E0" },
        { id: "bh_time", name: "\u547D\u4E2D\u65F6\u95F4", desc: "\u547D\u4E2D\u65F6\u95F4" },
        { id: "bh_level", name: "\u7B49\u7EA7", desc: "\u7B49\u7EA7" },
        { id: "bh_table", name: "\u547D\u4E2D\u8BB0\u5F55\u8868", desc: "\u547D\u4E2D\u8BB0\u5F55" }
      ]
    },
    {
      id: "history_fraud",
      name: "\u5386\u53F2\u6B3A\u8BC8\u8BB0\u5F55",
      desc: "\u8BE5\u5BA2\u6237\u5386\u53F2\u6B3A\u8BC8\u5904\u7F6E\u8BB0\u5F55\u3002",
      fields: [
        { id: "hf_table", name: "\u5386\u53F2\u6B3A\u8BC8\u8BB0\u5F55\u8868", desc: "\u65F6\u95F4/\u7C7B\u578B/\u7B49\u7EA7/\u5904\u7406\u7ED3\u679C" }
      ]
    },
    {
      id: "fraud_logs",
      name: "\u64CD\u4F5C\u65E5\u5FD7",
      desc: "\u6B3A\u8BC8\u8BC6\u522B\u64CD\u4F5C\u65F6\u95F4\u7EBF\u3002",
      fields: [
        { id: "fl_table", name: "MergedOpTable", desc: "\u5355\u9879+\u62A5\u544A\u7EA7+\u65F6\u95F4\u7EBF\u5408\u5E76" }
      ]
    }
  ],
  decision: [
    {
      id: "applicant_info",
      name: "\u7528\u6237\u57FA\u672C\u4FE1\u606F",
      desc: "\u7533\u8BF7\u4EBA\u8EAB\u4EFD\u4E0E\u57FA\u7840\u8D44\u6599\u3002",
      fields: [
        { id: "ai_name", name: "\u59D3\u540D", desc: "\u7533\u8BF7\u4EBA\u59D3\u540D" },
        { id: "ai_id", name: "\u8EAB\u4EFD\u8BC1\u53F7", desc: "\u8131\u654F\u8BC1\u4EF6\u53F7" },
        { id: "ai_phone", name: "\u624B\u673A\u53F7", desc: "\u624B\u673A\u53F7" },
        { id: "ai_bank", name: "\u94F6\u884C\u5361\u53F7", desc: "\u94F6\u884C\u5361\u53F7" },
        { id: "ai_age", name: "\u5E74\u9F84", desc: "\u5E74\u9F84" },
        { id: "ai_edu", name: "\u5B66\u5386", desc: "\u5B66\u5386" },
        { id: "ai_company", name: "\u5DE5\u4F5C\u5355\u4F4D", desc: "\u5DE5\u4F5C\u5355\u4F4D" },
        { id: "ai_income", name: "\u6708\u6536\u5165", desc: "\u6708\u6536\u5165" },
        { id: "ai_address", name: "\u5C45\u4F4F\u5730\u5740", desc: "\u5C45\u4F4F\u5730\u5740" },
        { id: "ai_marriage", name: "\u5A5A\u59FB", desc: "\u5A5A\u59FB" },
        { id: "ai_fp", name: "\u8BBE\u5907\u6307\u7EB9", desc: "\u8BBE\u5907\u6307\u7EB9" },
        { id: "ai_ip", name: "IP\u5730\u5740", desc: "IP" },
        { id: "ai_gps", name: "GPS\u5B9A\u4F4D", desc: "GPS" },
        { id: "ai_channel", name: "\u8FDB\u4EF6\u6E20\u9053", desc: "\u6E20\u9053" },
        { id: "ai_appver", name: "APP\u7248\u672C", desc: "App \u7248\u672C" }
      ]
    },
    {
      id: "decision_overview",
      name: "\u7EFC\u5408\u51B3\u7B56\u603B\u89C8",
      desc: "\u878D\u5408\u4E09\u5927\u62A5\u544A\u8BC4\u5206\uFF0C\u7ED9\u51FA\u7EFC\u5408\u98CE\u9669\u7B49\u7EA7\u4E0E\u6700\u7EC8\u51B3\u7B56\u5EFA\u8BAE\u3002",
      fields: [
        { id: "do_three", name: "\u4E09\u5927\u62A5\u544A\u8BC4\u5206\u6C47\u603B", desc: "\u4FE1\u7528\u503C/\u4FE1\u7528\u8BC4\u5206/\u6B3A\u8BC8\u5206 \u6C47\u603B" },
        { id: "do_level", name: "\u7EFC\u5408\u98CE\u9669\u7B49\u7EA7", desc: "\u7EFC\u5408\u7B49\u7EA7" },
        { id: "do_advice", name: "\u6700\u7EC8\u51B3\u7B56\u5EFA\u8BAE", desc: "\u6700\u7EC8\u5EFA\u8BAE" },
        { id: "do_basis", name: "\u51B3\u7B56\u4F9D\u636E\u6458\u8981", desc: "\u4F9D\u636E\u6458\u8981" }
      ]
    },
    {
      id: "verify_summary",
      name: "\u4FE1\u606F\u6838\u9A8C\u6458\u8981",
      desc: "\u4ECE\u4FE1\u606F\u6838\u9A8C\u62A5\u544A\u6458\u5F55\u7684\u5173\u952E\u7ED3\u8BBA\u3002",
      fields: [
        { id: "vs_concl", name: "\u4FE1\u606F\u6838\u9A8C\u7ED3\u8BBA\u6458\u8981", desc: "\u7ED3\u8BBA\u6458\u8981" },
        { id: "vs_risk", name: "\u5173\u952E\u98CE\u9669\u70B9", desc: "\u5173\u952E\u98CE\u9669" },
        { id: "vs_jump", name: "\u5C55\u5F00\u67E5\u770B\u5B8C\u6574\u4FE1\u606F\u6838\u9A8C\u62A5\u544A\u5165\u53E3", desc: "\u8DF3\u8F6C\u5165\u53E3" }
      ]
    },
    {
      id: "credit_summary",
      name: "\u4FE1\u7528\u98CE\u63A7\u6458\u8981",
      desc: "\u4ECE\u4FE1\u7528\u98CE\u63A7\u62A5\u544A\u6458\u5F55\u7684\u5173\u952E\u7ED3\u8BBA\u3002",
      fields: [
        { id: "cs2_concl", name: "\u4FE1\u7528\u98CE\u63A7\u7ED3\u8BBA\u6458\u8981", desc: "\u7ED3\u8BBA\u6458\u8981" },
        { id: "cs2_risk", name: "\u5173\u952E\u98CE\u9669\u70B9", desc: "\u5173\u952E\u98CE\u9669" },
        { id: "cs2_jump", name: "\u5C55\u5F00\u67E5\u770B\u5B8C\u6574\u4FE1\u7528\u98CE\u63A7\u62A5\u544A\u5165\u53E3", desc: "\u8DF3\u8F6C\u5165\u53E3" }
      ]
    },
    {
      id: "fraud_summary",
      name: "\u6B3A\u8BC8\u8BC6\u522B\u6458\u8981",
      desc: "\u4ECE\u6B3A\u8BC8\u8BC6\u522B\u62A5\u544A\u6458\u5F55\u7684\u5173\u952E\u7ED3\u8BBA\u3002",
      fields: [
        { id: "fs_concl", name: "\u6B3A\u8BC8\u8BC6\u522B\u7ED3\u8BBA\u6458\u8981", desc: "\u7ED3\u8BBA\u6458\u8981" },
        { id: "fs_risk", name: "\u5173\u952E\u98CE\u9669\u70B9", desc: "\u5173\u952E\u98CE\u9669" },
        { id: "fs_jump", name: "\u5C55\u5F00\u67E5\u770B\u5B8C\u6574\u6B3A\u8BC8\u8BC6\u522B\u62A5\u544A\u5165\u53E3", desc: "\u8DF3\u8F6C\u5165\u53E3" }
      ]
    },
    {
      id: "decision_suggestion",
      name: "\u6700\u7EC8\u51B3\u7B56\u5EFA\u8BAE",
      desc: "\u7EFC\u5408\u5EFA\u8BAE + \u56E0\u7D20\u6C47\u603B + \u51B3\u7B56\u6309\u94AE\u3002",
      fields: [
        { id: "ds_text", name: "\u7EFC\u5408\u5EFA\u8BAE\u6587\u6848", desc: "\u5EFA\u8BAE\u6587\u5B57" },
        { id: "ds_pos", name: "\u6B63\u5411\u56E0\u7D20\u6C47\u603B", desc: "\u6709\u5229\u56E0\u7D20" },
        { id: "ds_risk", name: "\u98CE\u9669\u56E0\u7D20\u6C47\u603B", desc: "\u98CE\u9669\u70B9" },
        { id: "ds_ops", name: "\u51B3\u7B56\u6309\u94AE\u7EC4", desc: "\u51B3\u7B56\u6309\u94AE" },
        { id: "ds_amount", name: "\u6388\u4FE1\u989D\u5EA6\u5EFA\u8BAE", desc: "\u989D\u5EA6\u5EFA\u8BAE" }
      ]
    },
    {
      id: "decision_logs",
      name: "\u7EFC\u5408\u64CD\u4F5C\u65E5\u5FD7",
      desc: "\u4E09\u5927\u62A5\u544A\u64CD\u4F5C\u65E5\u5FD7\u6C47\u603B\u65F6\u95F4\u7EBF\u3002",
      fields: [
        { id: "dl_timeline", name: "\u4E09\u5927\u62A5\u544A\u64CD\u4F5C\u65E5\u5FD7\u6C47\u603B\u65F6\u95F4\u7EBF", desc: "\u7EFC\u5408\u65F6\u95F4\u7EBF" }
      ]
    }
  ]
};
var GRADE_PRESETS = {
  /* 信息核验：异常值，越高越危险 → 危险度语义 */
  info_verify: [
    { grade: "\u5B89\u5168", label: "\u98CE\u9669\u53EF\u63A7", minScore: 0, maxScore: 20, riskLevel: "\u4F4E", color: "#10B981", autoResult: "\u901A\u8FC7", description: "\u5F02\u5E38\u503C\u5904\u4E8E\u4F4E\u4F4D\uFF0C\u98CE\u9669\u53EF\u63A7\uFF0C\u5EFA\u8BAE\u6B63\u5E38\u901A\u8FC7" },
    { grade: "\u5173\u6CE8", label: "\u4E2D\u7B49\u98CE\u9669", minScore: 21, maxScore: 50, riskLevel: "\u4E2D", color: "#F59E0B", autoResult: "\u8F6C\u4EBA\u5DE5", description: "\u5F02\u5E38\u503C\u4E2D\u7B49\uFF0C\u5EFA\u8BAE\u5173\u6CE8\u4E2A\u522B\u98CE\u9669\u9879" },
    { grade: "\u8B66\u793A", label: "\u8F83\u9AD8\u98CE\u9669", minScore: 51, maxScore: 80, riskLevel: "\u9AD8", color: "#F97316", autoResult: "\u8F6C\u4EBA\u5DE5", description: "\u5F02\u5E38\u503C\u8F83\u9AD8\uFF0C\u5EFA\u8BAE\u4EBA\u5DE5\u590D\u6838" },
    { grade: "\u9AD8\u5371", label: "\u6781\u9AD8\u98CE\u9669", minScore: 81, maxScore: 100, riskLevel: "\u6781\u9AD8", color: "#EF4444", autoResult: "\u62D2\u7EDD", description: "\u5F02\u5E38\u503C\u6781\u9AD8\uFF0C\u5F3A\u70C8\u5EFA\u8BAE\u9884\u8B66\u5904\u7F6E" }
  ],
  /* 信用风控：信用评分，越高越好 */
  credit: [
    { grade: "A", label: "\u4F18\u79C0", minScore: 75, maxScore: 100, riskLevel: "\u4F4E", color: "#10B981", autoResult: "\u901A\u8FC7", description: "\u4FE1\u7528\u4F18\u79C0\uFF0C\u5EFA\u8BAE\u6B63\u5E38\u6388\u4FE1" },
    { grade: "B", label: "\u826F\u597D", minScore: 60, maxScore: 74, riskLevel: "\u4E2D", color: "#F59E0B", autoResult: "\u901A\u8FC7", description: "\u4FE1\u7528\u826F\u597D\uFF0C\u5EFA\u8BAE\u6B63\u5E38\u6388\u4FE1" },
    { grade: "C", label: "\u4E00\u822C", minScore: 45, maxScore: 59, riskLevel: "\u9AD8", color: "#F97316", autoResult: "\u8F6C\u4EBA\u5DE5", description: "\u4FE1\u7528\u4E00\u822C\uFF0C\u5EFA\u8BAE\u4EBA\u5DE5\u590D\u6838" },
    { grade: "D", label: "\u8F83\u5DEE", minScore: 0, maxScore: 44, riskLevel: "\u9AD8", color: "#EF4444", autoResult: "\u62D2\u7EDD", description: "\u4FE1\u7528\u8F83\u5DEE\uFF0C\u5EFA\u8BAE\u62D2\u7EDD\u6388\u4FE1" }
  ],
  /* 欺诈识别：欺诈分，越高越危险 */
  fraud: [
    { grade: "\u6781\u4F4E", label: "\u6781\u4F4E\u98CE\u9669", minScore: 0, maxScore: 19, riskLevel: "\u4F4E", color: "#10B981", autoResult: "\u901A\u8FC7", description: "\u6781\u4F4E\u98CE\u9669\uFF0C\u53EF\u6B63\u5E38\u901A\u8FC7" },
    { grade: "\u4F4E", label: "\u4F4E\u98CE\u9669", minScore: 20, maxScore: 39, riskLevel: "\u4F4E", color: "#10B981", autoResult: "\u901A\u8FC7", description: "\u4F4E\u98CE\u9669\uFF0C\u5EFA\u8BAE\u6B63\u5E38\u901A\u8FC7" },
    { grade: "\u4E2D", label: "\u4E2D\u98CE\u9669", minScore: 40, maxScore: 59, riskLevel: "\u4E2D", color: "#F59E0B", autoResult: "\u8F6C\u4EBA\u5DE5", description: "\u4E2D\u98CE\u9669\uFF0C\u5EFA\u8BAE\u4EBA\u5DE5\u590D\u6838" },
    { grade: "\u9AD8", label: "\u9AD8\u98CE\u9669", minScore: 60, maxScore: 79, riskLevel: "\u9AD8", color: "#F97316", autoResult: "\u62D2\u7EDD", description: "\u9AD8\u98CE\u9669\uFF0C\u5EFA\u8BAE\u62D2\u7EDD\u6388\u4FE1" },
    { grade: "\u6781\u9AD8", label: "\u6781\u9AD8\u98CE\u9669", minScore: 80, maxScore: 100, riskLevel: "\u6781\u9AD8", color: "#EF4444", autoResult: "\u62D2\u7EDD", description: "\u6781\u9AD8\u98CE\u9669\uFF0C\u5F3A\u70C8\u5EFA\u8BAE\u62D2\u7EDD\u5E76\u52A0\u5165\u9ED1\u540D\u5355" }
  ],
  /* 决策报告：综合分，越高越好 */
  decision: [
    { grade: "\u4F18\u5148\u901A\u8FC7", label: "\u4F18\u5148\u901A\u8FC7", minScore: 80, maxScore: 100, riskLevel: "\u4F4E", color: "#10B981", autoResult: "\u901A\u8FC7", description: "\u7EFC\u5408\u98CE\u9669\u6781\u4F4E\uFF0C\u5EFA\u8BAE\u4F18\u5148\u6388\u4FE1" },
    { grade: "\u901A\u8FC7", label: "\u901A\u8FC7", minScore: 60, maxScore: 79, riskLevel: "\u4F4E", color: "#10B981", autoResult: "\u901A\u8FC7", description: "\u7EFC\u5408\u98CE\u9669\u4F4E\uFF0C\u5EFA\u8BAE\u6B63\u5E38\u6388\u4FE1" },
    { grade: "\u9650\u5236\u989D\u5EA6", label: "\u9650\u5236\u989D\u5EA6", minScore: 40, maxScore: 59, riskLevel: "\u4E2D", color: "#F59E0B", autoResult: "\u8F6C\u4EBA\u5DE5", description: "\u7EFC\u5408\u98CE\u9669\u4E2D\u7B49\uFF0C\u5EFA\u8BAE\u9650\u5236\u989D\u5EA6" },
    { grade: "\u4E25\u683C\u9650\u5236", label: "\u4E25\u683C\u9650\u5236", minScore: 20, maxScore: 39, riskLevel: "\u9AD8", color: "#F97316", autoResult: "\u62D2\u7EDD", description: "\u7EFC\u5408\u98CE\u9669\u8F83\u9AD8\uFF0C\u5EFA\u8BAE\u4E25\u683C\u9650\u5236" },
    { grade: "\u62D2\u7EDD", label: "\u62D2\u7EDD", minScore: 0, maxScore: 19, riskLevel: "\u9AD8", color: "#EF4444", autoResult: "\u62D2\u7EDD", description: "\u7EFC\u5408\u98CE\u9669\u9AD8\uFF0C\u5EFA\u8BAE\u62D2\u7EDD\u6388\u4FE1" }
  ]
};
function buildDefaultGradesForRange(min, max, count = 3, semantic = "risk") {
  if (max <= min) max = min + 1;
  const span = max - min;
  const seg = Math.ceil(span / count);
  const colors = ["#10B981", "#F59E0B", "#F97316", "#EF4444", "#7C3AED"];
  const labels = ["A", "B", "C", "D", "E"];
  const results = [];
  for (let i = 0; i < count; i++) {
    const lo = min + i * seg;
    const hi = i === count - 1 ? max : Math.min(max, lo + seg - 1);
    const idx = semantic === "credit" ? i : count - 1 - i;
    const g = labels[idx] ?? labels[labels.length - 1];
    results.push({
      grade: g,
      label: g,
      minScore: lo,
      maxScore: hi,
      riskLevel: idx === 0 ? "\u4F4E" : idx === 1 ? "\u4E2D" : "\u9AD8",
      color: colors[idx % colors.length],
      tags: "",
      // 风险标签（空格分隔）默认空，配置页可编辑，保证 JSON 始终有记录
      autoResult: idx === 0 ? "\u901A\u8FC7" : idx === count - 1 ? "\u62D2\u7EDD" : "\u8F6C\u4EBA\u5DE5",
      description: `\u5206\u6BB5 ${g}`
    });
  }
  return results;
}
function defaultFlowRow(gradeId, suggestionText) {
  return {
    gradeId,
    suggestionText,
    passNeedConfirm: true,
    passConfirmRole: "\u521D\u5BA1\u5458",
    rejectAllowRecheck: true,
    recheckSubmitRole: "\u590D\u5BA1\u5458",
    recheckApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    manualSuggestRole: "\u521D\u5BA1\u5458",
    manualApproveRole: "\u98CE\u63A7\u4E3B\u7BA1",
    flowGraphs: []
  };
}
function mkAuditGraph(autoResult, content, buttonName) {
  const opin = {
    "\u901A\u8FC7": content.opinion?.["\u901A\u8FC7"] ?? ["\u6B63\u5E38\u901A\u8FC7"],
    "\u8F6C\u4EBA\u5DE5": content.opinion?.["\u8F6C\u4EBA\u5DE5"] ?? content.opinion?.["\u9A73\u56DE"] ?? ["\u4FE1\u606F\u5B58\u7591\uFF0C\u8BF7\u590D\u6838"],
    "\u62D2\u7EDD": content.opinion?.["\u62D2\u7EDD"] ?? ["\u98CE\u9669\u8FC7\u9AD8\uFF0C\u5EFA\u8BAE\u62D2\u7EDD"]
  };
  const post = autoResult === "\u901A\u8FC7" ? "\u5DF2\u901A\u8FC7" : autoResult === "\u62D2\u7EDD" ? "\u5DF2\u62D2\u7EDD" : "\u5DF2\u5BA1\u6838";
  const startLabel = buttonName ?? defaultButtonName(autoResult);
  return {
    name: startLabel,
    nodes: [
      { id: "n_start", type: "start", label: startLabel, buttonName: startLabel, x: 40, y: 140 },
      { id: "n_audit", type: "normal", label: "\u7EC8\u5BA1\u5BA1\u6838", x: 360, y: 140, role: "\u98CE\u63A7\u4E3B\u7BA1", checkItems: content.checkItems, results: content.results, opinionPresets: opin, postState: post },
      { id: "n_end", type: "end", label: "\u7ED3\u675F", x: 640, y: 140, showButton: true }
    ],
    edges: [
      { id: "e1", from: "n_start", to: "n_audit" },
      { id: "e2", from: "n_audit", to: "n_end" }
    ]
  };
}
function mkFlow(gradeId, suggestionText, autoResult, content) {
  return { ...defaultFlowRow(gradeId, suggestionText), flowGraphs: [mkAuditGraph(autoResult, content)] };
}
var FLOW_PRESETS = {
  /* 信息核验：异常值，越高越危险（安全/关注/警示/高危） */
  info_verify: [
    defaultFlowRow("\u2014", "\u7CFB\u7EDF\u6B63\u5728\u8BA1\u7B97\u5F02\u5E38\u503C\uFF0C\u8BF7\u7A0D\u5019\u2026"),
    mkFlow("\u5B89\u5168", GRADE_PRESETS.info_verify[0].description, "\u901A\u8FC7", {
      checkItems: ["\u8EAB\u4EFD\u771F\u5B9E\u6027\u6838\u9A8C", "\u8D44\u6599\u5B8C\u6574\u6027\u68C0\u67E5"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5"],
      opinion: { "\u901A\u8FC7": ["\u5F02\u5E38\u503C\u4F4E\u4F4D\uFF0C\u6B63\u5E38\u901A\u8FC7"], "\u8F6C\u4EBA\u5DE5": ["\u4FE1\u606F\u5B58\u7591\uFF0C\u9000\u56DE\u8865\u5145"] }
    }),
    mkFlow("\u5173\u6CE8", GRADE_PRESETS.info_verify[1].description, "\u8F6C\u4EBA\u5DE5", {
      checkItems: ["\u5F02\u5E38\u9879\u4EBA\u5DE5\u590D\u6838", "\u6536\u5165\u4E0E\u8D1F\u503A\u8BC4\u4F30"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinion: { "\u901A\u8FC7": ["\u98CE\u9669\u53EF\u63A7\uFF0C\u4E88\u4EE5\u901A\u8FC7"], "\u62D2\u7EDD": ["\u5B58\u5728\u5173\u6CE8\u9879\uFF0C\u8C28\u614E\u62D2\u7EDD"] }
    }),
    mkFlow("\u8B66\u793A", GRADE_PRESETS.info_verify[2].description, "\u8F6C\u4EBA\u5DE5", {
      checkItems: ["\u8BBE\u5907\u7FA4\u63A7\u6838\u67E5", "\u9ED1\u540D\u5355\u547D\u4E2D\u590D\u6838", "\u516C\u5B89/\u8FD0\u8425\u5546\u8054\u9632\u590D\u6838"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinion: { "\u62D2\u7EDD": ["\u5F02\u5E38\u503C\u8F83\u9AD8\uFF0C\u5EFA\u8BAE\u62D2\u7EDD"] }
    }),
    mkFlow("\u9AD8\u5371", GRADE_PRESETS.info_verify[3].description, "\u62D2\u7EDD", {
      checkItems: ["\u8BBE\u5907\u7FA4\u63A7\u6838\u67E5", "\u9ED1\u540D\u5355\u547D\u4E2D\u590D\u6838", "\u516C\u5B89/\u8FD0\u8425\u5546\u8054\u9632\u590D\u6838"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinion: { "\u62D2\u7EDD": ["\u5F02\u5E38\u503C\u6781\u9AD8\uFF0C\u5EFA\u8BAE\u62D2\u7EDD\u5904\u7F6E", "\u547D\u4E2D\u9ED1\u540D\u5355\uFF0C\u5F3A\u5236\u62E6\u622A"] }
    })
  ],
  /* 信用风控：信用评分，越高越好（A/B/C/D） */
  credit: [
    defaultFlowRow("\u2014", "\u7CFB\u7EDF\u6B63\u5728\u8BA1\u7B97\u8BC4\u5206\u2026"),
    mkFlow("A", GRADE_PRESETS.credit[0].description, "\u901A\u8FC7", {
      checkItems: ["\u5F81\u4FE1\u62A5\u544A\u590D\u6838", "\u989D\u5EA6\u4E0E\u5229\u7387\u5408\u7406\u6027"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5"],
      opinion: { "\u901A\u8FC7": ["\u4FE1\u7528\u4F18\u79C0\uFF0C\u6B63\u5E38\u6388\u4FE1"] }
    }),
    mkFlow("B", GRADE_PRESETS.credit[1].description, "\u901A\u8FC7", {
      checkItems: ["\u5F81\u4FE1\u62A5\u544A\u590D\u6838", "\u989D\u5EA6\u4E0E\u5229\u7387\u5408\u7406\u6027"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5"],
      opinion: { "\u901A\u8FC7": ["\u4FE1\u7528\u826F\u597D\uFF0C\u6B63\u5E38\u6388\u4FE1"] }
    }),
    mkFlow("C", GRADE_PRESETS.credit[2].description, "\u8F6C\u4EBA\u5DE5", {
      checkItems: ["\u4FE1\u7528\u5386\u53F2\u6838\u67E5", "\u8D1F\u503A\u7387\u8BC4\u4F30"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinion: { "\u62D2\u7EDD": ["\u4FE1\u7528\u4E00\u822C\uFF0C\u8C28\u614E\u6388\u4FE1"] }
    }),
    mkFlow("D", GRADE_PRESETS.credit[3].description, "\u62D2\u7EDD", {
      checkItems: ["\u5F81\u4FE1\u62A5\u544A\u590D\u6838", "\u507F\u503A\u80FD\u529B\u8BC4\u4F30"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinion: { "\u62D2\u7EDD": ["\u4FE1\u7528\u8F83\u5DEE\uFF0C\u5EFA\u8BAE\u62D2\u7EDD\u6388\u4FE1"] }
    })
  ],
  /* 欺诈识别：欺诈分，越高越危险（极低/低/中/高/极高） */
  fraud: [
    defaultFlowRow("\u2014", "\u7CFB\u7EDF\u6B63\u5728\u8BA1\u7B97\u8BC4\u5206\uFF0C\u8BF7\u7A0D\u5019\u2026"),
    mkFlow("\u6781\u4F4E", GRADE_PRESETS.fraud[0].description, "\u901A\u8FC7", {
      checkItems: ["\u53CD\u6B3A\u8BC8\u89C4\u5219\u590D\u6838"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5"],
      opinion: { "\u901A\u8FC7": ["\u6781\u4F4E\u98CE\u9669\uFF0C\u6B63\u5E38\u901A\u8FC7"] }
    }),
    mkFlow("\u4F4E", GRADE_PRESETS.fraud[1].description, "\u901A\u8FC7", {
      checkItems: ["\u53CD\u6B3A\u8BC8\u89C4\u5219\u590D\u6838"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5"],
      opinion: { "\u901A\u8FC7": ["\u4F4E\u98CE\u9669\uFF0C\u6B63\u5E38\u901A\u8FC7"] }
    }),
    mkFlow("\u4E2D", GRADE_PRESETS.fraud[2].description, "\u8F6C\u4EBA\u5DE5", {
      checkItems: ["\u56E2\u4F19\u6B3A\u8BC8\u6838\u67E5", "\u8BBE\u5907\u5173\u8054\u56FE\u8C31\u590D\u6838"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinion: { "\u62D2\u7EDD": ["\u4E2D\u98CE\u9669\uFF0C\u5EFA\u8BAE\u4EBA\u5DE5\u7814\u5224"] }
    }),
    mkFlow("\u9AD8", GRADE_PRESETS.fraud[3].description, "\u62D2\u7EDD", {
      checkItems: ["\u56E2\u4F19\u6B3A\u8BC8\u6838\u67E5", "\u9ED1\u540D\u5355\u547D\u4E2D\u590D\u6838"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinion: { "\u62D2\u7EDD": ["\u9AD8\u98CE\u9669\uFF0C\u5EFA\u8BAE\u62D2\u7EDD\u6388\u4FE1"] }
    }),
    mkFlow("\u6781\u9AD8", GRADE_PRESETS.fraud[4].description, "\u62D2\u7EDD", {
      checkItems: ["\u56E2\u4F19\u6B3A\u8BC8\u6838\u67E5", "\u9ED1\u540D\u5355\u547D\u4E2D\u590D\u6838", "\u8BBE\u5907\u7FA4\u63A7\u6838\u67E5"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinion: { "\u62D2\u7EDD": ["\u6B3A\u8BC8\u5206\u6781\u9AD8\uFF0C\u5EFA\u8BAE\u62D2\u7EDD\u5E76\u52A0\u5165\u9ED1\u540D\u5355"] }
    })
  ],
  /* 决策报告：综合分，越高越好（优先通过/通过/限制额度/严格限制/拒绝） */
  decision: [
    defaultFlowRow("\u2014", "\u7CFB\u7EDF\u6B63\u5728\u751F\u6210\u7EFC\u5408\u51B3\u7B56\uFF0C\u8BF7\u7A0D\u5019\u2026"),
    mkFlow("\u4F18\u5148\u901A\u8FC7", GRADE_PRESETS.decision[0].description, "\u901A\u8FC7", {
      checkItems: ["\u4E09\u9879\u5B50\u62A5\u544A\u4E00\u81F4\u6027\u6838\u5BF9", "\u989D\u5EA6\u4E0E\u5229\u7387\u5408\u7406\u6027"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5"],
      opinion: { "\u901A\u8FC7": ["\u7EFC\u5408\u98CE\u9669\u6781\u4F4E\uFF0C\u4F18\u5148\u6388\u4FE1"] }
    }),
    mkFlow("\u901A\u8FC7", GRADE_PRESETS.decision[1].description, "\u901A\u8FC7", {
      checkItems: ["\u4E09\u9879\u5B50\u62A5\u544A\u4E00\u81F4\u6027\u6838\u5BF9"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5"],
      opinion: { "\u901A\u8FC7": ["\u7EFC\u5408\u98CE\u9669\u4F4E\uFF0C\u6B63\u5E38\u6388\u4FE1"] }
    }),
    mkFlow("\u9650\u5236\u989D\u5EA6", GRADE_PRESETS.decision[2].description, "\u8F6C\u4EBA\u5DE5", {
      checkItems: ["\u4FE1\u7528\u4E0E\u6B3A\u8BC8\u7EFC\u5408\u7814\u5224"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinion: { "\u62D2\u7EDD": ["\u7EFC\u5408\u98CE\u9669\u4E2D\u7B49\uFF0C\u9650\u5236\u989D\u5EA6"] }
    }),
    mkFlow("\u4E25\u683C\u9650\u5236", GRADE_PRESETS.decision[3].description, "\u62D2\u7EDD", {
      checkItems: ["\u4FE1\u7528\u4E0E\u6B3A\u8BC8\u7EFC\u5408\u7814\u5224"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinion: { "\u62D2\u7EDD": ["\u7EFC\u5408\u98CE\u9669\u8F83\u9AD8\uFF0C\u4E25\u683C\u9650\u5236"] }
    }),
    mkFlow("\u62D2\u7EDD", GRADE_PRESETS.decision[4].description, "\u62D2\u7EDD", {
      checkItems: ["\u6B3A\u8BC8\u5206\u4E3B\u5BFC\u7814\u5224", "\u4FE1\u7528\u590D\u6838"],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinion: { "\u62D2\u7EDD": ["\u7EFC\u5408\u98CE\u9669\u9AD8\uFF0C\u5EFA\u8BAE\u62D2\u7EDD\u6388\u4FE1"] }
    })
  ]
};
function computeScoreSummary(t) {
  const rows = t.sections.filter((s) => (s.homeTab ?? "content") === "content").sort((a, b) => a.order - b.order).map((s) => {
    const r = computeSectionScore(s);
    const w = s.weight ?? 1;
    const rejectItems = r.mode === "reject" ? s.fields.filter((f) => f.visible).length : s.fields.filter((f) => f.visible && f.hitReject).length;
    return {
      id: s.id,
      name: s.sourceName || s.name,
      sourceType: s.sourceType,
      mode: r.mode,
      countedItems: r.mode === "add" ? r.addCount : r.deductCount,
      points: r.total * w,
      weight: w,
      rejectItems,
      visible: s.visible
    };
  });
  const enabled = rows.filter((r) => r.visible);
  const addMax = enabled.reduce((sum, r) => sum + (r.mode === "add" ? r.points : 0), 0);
  const deductMax = enabled.reduce((sum, r) => sum + (r.mode === "deduct" ? -r.points : 0), 0);
  const baseScore = t.scoreDisplay.baseScore ?? 0;
  const formula = t.scoreFormula ?? buildDefaultScoreFormula(t.sections);
  const rawTotals = {};
  for (const s of t.sections.filter((s2) => (s2.homeTab ?? "content") === "content")) {
    const r = computeSectionScore(s);
    rawTotals[s.id] = Math.abs(r.total);
  }
  const maxVals = {};
  const minVals = {};
  for (const term of formula.terms) {
    if (term.kind === "var" && term.varId) {
      const secId = term.varId.replace("sec_", "");
      const raw = rawTotals[secId] ?? 0;
      maxVals[term.varId] = term.op === "+" ? raw : 0;
      minVals[term.varId] = term.op === "-" ? raw : 0;
    }
  }
  const formulaMax = evaluateFormula(formula, maxVals) ?? 0;
  const formulaMin = evaluateFormula(formula, minVals) ?? 0;
  const specialRejectCount = (t.specialRules ?? []).filter((r) => r.autoResult === "\u62D2\u7EDD").length;
  return {
    rows,
    baseScore,
    addMax,
    deductMax,
    min: baseScore + formulaMin,
    max: baseScore + formulaMax,
    // 9.5.1 命中即拒 = 特殊命中规则中「命中-拒绝」的条目总数（用户定义；不再累加字段级命中即拒项）
    rejectTotal: specialRejectCount
  };
}
function syncFlowToGrades(flow, grades) {
  const calc = flow[0] ?? defaultFlowRow("\u2014", "\u7CFB\u7EDF\u6B63\u5728\u8BA1\u7B97\u8BC4\u5206\uFF0C\u8BF7\u7A0D\u5019\u2026");
  const per = grades.map((g, i) => {
    const prev = flow[i + 1];
    return prev ? { ...prev, gradeId: g.grade } : defaultFlowRow(g.grade, `${g.label}\uFF0C\u8BF7\u914D\u7F6E\u5904\u7F6E\u7B56\u7565`);
  });
  return [calc, ...per];
}
var SECTION_SOURCE = {
  // 信息核验
  score_model: "api",
  conclusion_process: "api",
  basic_info: "data_source",
  id_images: "api",
  single_verify: "rule_set",
  cross_fusion: "tpl_copy",
  op_logs: "api",
  // 信用风控
  applicant_info: "data_source",
  credit_suggestion: "api",
  history_records: "data_source",
  credit_logs: "api",
  // 欺诈识别
  fraud_score_model: "api",
  disposal_bar: "api",
  identity_fraud: "rule_set",
  info_forgery: "rule_set",
  // 设备/行为/团伙/黑名单/历史 这五段在报告详情里是「字段明细」而非规则表，来源按数据源建模，
  // 展示项即字段本身（设备指纹、填写速度…），这样详情页每个 item 才能取到自己的分值。
  device_fraud: "data_source",
  behavior_fraud: "data_source",
  gang_fraud: "data_source",
  blacklist_hit: "data_source",
  history_fraud: "data_source",
  fraud_logs: "api",
  // 决策报告（进件审核）
  decision_overview: "api",
  // 信息核验摘要/信用风控摘要/欺诈识别摘要：不是接口调用，是「现有模板」类型（tpl_copy），
  // 集成对应报告模板的分析维度快照（见 SUMMARY_SRC）
  verify_summary: "tpl_copy",
  credit_summary: "tpl_copy",
  fraud_summary: "tpl_copy",
  decision_suggestion: "api",
  decision_logs: "api"
};
var SECTION_SCORE_MODE = {
  device_fraud: "deduct",
  behavior_fraud: "deduct",
  gang_fraud: "deduct",
  blacklist_hit: "deduct",
  history_fraud: "deduct"
};
var RULE_SETS = [
  {
    id: "rs_identity",
    name: "\u8EAB\u4EFD\u771F\u5B9E\u6027\u89C4\u5219\u96C6",
    rules: [
      { id: "R1", name: "\u516C\u5B89\u5B9E\u540D", desc: "\u6BD4\u5BF9\u516C\u5B89\u8EAB\u4EFD\u4FE1\u606F\u662F\u5426\u4E00\u81F4" },
      { id: "R2", name: "\u94F6\u884C\u5361\u56DB\u8981\u7D20", desc: "\u59D3\u540D+\u8EAB\u4EFD\u8BC1+\u5361\u53F7+\u624B\u673A\u53F7\u56DB\u8981\u7D20\u6838\u9A8C" },
      { id: "R3", name: "\u8FD0\u8425\u5546\u5B9E\u540D", desc: "\u624B\u673A\u53F7\u8FD0\u8425\u5546\u5B9E\u540D\u6838\u9A8C" },
      { id: "R4", name: "\u8BBE\u5907\u771F\u5B9E\u6027", desc: "\u8BBE\u5907\u6307\u7EB9\u771F\u5B9E\u6027\u6821\u9A8C" },
      { id: "R9", name: "\u8D44\u6599\u4E00\u81F4\u6027", desc: "\u591A\u6E90\u8D44\u6599\u4EA4\u53C9\u4E00\u81F4\u6027" }
    ]
  },
  {
    id: "rs_device",
    name: "\u8BBE\u5907\u4E0E\u56E2\u4F19\u89C4\u5219\u96C6",
    rules: [
      { id: "R4", name: "\u8BBE\u5907\u771F\u5B9E\u6027", desc: "\u8BBE\u5907\u6307\u7EB9\u771F\u5B9E\u6027\u6821\u9A8C" },
      { id: "R5", name: "\u8054\u9632\u8054\u63A7", desc: "\u8DE8\u673A\u6784\u8054\u9632\u8054\u63A7\u547D\u4E2D" },
      { id: "R6", name: "\u8BBE\u5907\u7FA4\u63A7", desc: "\u7FA4\u63A7\u8BBE\u5907\u7279\u5F81\u8BC6\u522B" },
      { id: "R7", name: "\u56E2\u4F19\u5173\u8054", desc: "\u56E2\u4F19\u5173\u7CFB\u7F51\u7EDC\u5173\u8054" },
      { id: "R8", name: "\u9ED1\u540D\u5355\u547D\u4E2D", desc: "\u9ED1\u540D\u5355\u5E93\u547D\u4E2D" }
    ]
  },
  {
    id: "rs_behavior",
    name: "\u884C\u4E3A\u5F02\u5E38\u89C4\u5219\u96C6",
    rules: [
      { id: "R10", name: "\u884C\u4E3A\u5F02\u5E38", desc: "\u7533\u8BF7\u884C\u4E3A\u5F02\u5E38\u6A21\u5F0F" },
      { id: "R6", name: "\u8BBE\u5907\u7FA4\u63A7", desc: "\u7FA4\u63A7\u8BBE\u5907\u7279\u5F81\u8BC6\u522B" },
      { id: "R7", name: "\u56E2\u4F19\u5173\u8054", desc: "\u56E2\u4F19\u5173\u7CFB\u7F51\u7EDC\u5173\u8054" }
    ]
  },
  {
    id: "rs_all",
    name: "\u5168\u91CF\u6838\u9A8C\u89C4\u5219\u96C6",
    rules: [
      { id: "R1", name: "\u516C\u5B89\u5B9E\u540D", desc: "\u6BD4\u5BF9\u516C\u5B89\u8EAB\u4EFD\u4FE1\u606F" },
      { id: "R2", name: "\u94F6\u884C\u5361\u56DB\u8981\u7D20", desc: "\u56DB\u8981\u7D20\u6838\u9A8C" },
      { id: "R3", name: "\u8FD0\u8425\u5546\u5B9E\u540D", desc: "\u8FD0\u8425\u5546\u5B9E\u540D" },
      { id: "R4", name: "\u8BBE\u5907\u771F\u5B9E\u6027", desc: "\u8BBE\u5907\u6307\u7EB9\u771F\u5B9E" },
      { id: "R5", name: "\u8054\u9632\u8054\u63A7", desc: "\u8054\u9632\u8054\u63A7" },
      { id: "R6", name: "\u8BBE\u5907\u7FA4\u63A7", desc: "\u7FA4\u63A7\u8BC6\u522B" },
      { id: "R7", name: "\u56E2\u4F19\u5173\u8054", desc: "\u56E2\u4F19\u5173\u8054" },
      { id: "R8", name: "\u9ED1\u540D\u5355\u547D\u4E2D", desc: "\u9ED1\u540D\u5355" },
      { id: "R9", name: "\u8D44\u6599\u4E00\u81F4\u6027", desc: "\u4E00\u81F4\u6027" },
      { id: "R10", name: "\u884C\u4E3A\u5F02\u5E38", desc: "\u884C\u4E3A\u5F02\u5E38" }
    ]
  }
];
var SECTION_RULESET = {
  identity_fraud: "rs_identity",
  info_forgery: "rs_identity",
  device_fraud: "rs_device",
  behavior_fraud: "rs_behavior",
  gang_fraud: "rs_device",
  blacklist_hit: "rs_device",
  history_fraud: "rs_all"
};
var SECTION_COPY_FROM = {
  cross_fusion: "single_verify"
};
var SUMMARY_SRC = {
  verify_summary: {
    name: "\u4FE1\u606F\u6838\u9A8C\u6458\u8981",
    cardScoreMode: "deduct",
    sections: [
      { id: "single_verify", name: "\u591A\u6E90\u5E76\u884C\u6838\u9A8C", sourceType: "rule_set", fields: [
        { id: "R1", name: "\u516C\u5B89\u5B9E\u540D" },
        { id: "R2", name: "\u94F6\u884C\u5361\u56DB\u8981\u7D20" },
        { id: "R3", name: "\u8FD0\u8425\u5546\u5B9E\u540D" },
        { id: "R4", name: "\u8BBE\u5907\u771F\u5B9E\u6027" },
        { id: "R5", name: "\u8054\u9632\u8054\u63A7" }
      ] },
      { id: "cross_fusion", name: "\u6570\u636E\u4EA4\u53C9\u878D\u5408", sourceType: "rule_set", fields: [
        { id: "R6", name: "\u8BBE\u5907\u7FA4\u63A7" },
        { id: "R7", name: "\u56E2\u4F19\u5173\u8054" },
        { id: "R8", name: "\u9ED1\u540D\u5355\u547D\u4E2D" },
        { id: "R9", name: "\u8D44\u6599\u4E00\u81F4\u6027" },
        { id: "R10", name: "\u884C\u4E3A\u5F02\u5E38" }
      ] }
    ]
  },
  credit_summary: {
    name: "\u4FE1\u7528\u98CE\u63A7\u6458\u8981",
    cardScoreMode: "add",
    sections: [
      { id: "credit_overview", name: "\u4FE1\u7528\u8BC4\u5206\u603B\u89C8", sourceType: "data_source", fields: [
        { id: "co_ring", name: "\u4FE1\u7528\u8BC4\u5206", scorePoints: 10 },
        { id: "co_level", name: "\u98CE\u9669\u7B49\u7EA7" },
        { id: "co_industry", name: "\u884C\u4E1A\u5BF9\u6BD4" },
        { id: "co_dims", name: "\u516D\u7EF4\u8BC4\u5206" },
        { id: "co_tags", name: "\u98CE\u9669\u6807\u7B7E" }
      ] },
      { id: "credit_factors", name: "\u98CE\u9669\u56E0\u5B50", sourceType: "data_source", fields: [
        { id: "cf_dim_card", name: "\u516D\u7EF4\u56E0\u5B50\u5361\u7247" },
        { id: "cf_dim_score", name: "\u7EF4\u5EA6\u5F97\u5206" },
        { id: "cf_dim_weight", name: "\u7EF4\u5EA6\u6743\u91CD" },
        { id: "cf_dim_level", name: "\u7EF4\u5EA6\u7B49\u7EA7" },
        { id: "cf_dim_logic", name: "\u7EF4\u5EA6\u903B\u8F91" },
        { id: "cf_dim_source", name: "\u7EF4\u5EA6\u6765\u6E90" },
        { id: "cf_table", name: "\u7EF4\u5EA6\u8BF4\u660E\u8868" }
      ] }
    ]
  },
  fraud_summary: {
    name: "\u6B3A\u8BC8\u8BC6\u522B\u6458\u8981",
    cardScoreMode: "deduct",
    sections: [
      { id: "identity_fraud", name: "\u8EAB\u4EFD\u6B3A\u8BC8", sourceType: "rule_set", fields: [
        { id: "R1", name: "\u516C\u5B89\u5B9E\u540D" },
        { id: "R2", name: "\u94F6\u884C\u5361\u56DB\u8981\u7D20" },
        { id: "R3", name: "\u8FD0\u8425\u5546\u5B9E\u540D" },
        { id: "R4", name: "\u8BBE\u5907\u771F\u5B9E\u6027" },
        { id: "R9", name: "\u8D44\u6599\u4E00\u81F4\u6027" }
      ] },
      { id: "device_fraud", name: "\u8BBE\u5907\u6B3A\u8BC8", sourceType: "data_source", fields: [
        { id: "df_fp", name: "\u8BBE\u5907\u6307\u7EB9" },
        { id: "df_root", name: "\u8D8A\u72F1/ROOT" },
        { id: "df_sim", name: "SIM\u66F4\u6362" },
        { id: "df_vm", name: "\u865A\u62DF\u673A" },
        { id: "df_gps", name: "GPS\u5F02\u5E38" },
        { id: "df_ip", name: "IP\u5F02\u5E38" },
        { id: "df_time", name: "\u64CD\u4F5C\u65F6\u6BB5" },
        { id: "df_speed", name: "\u64CD\u4F5C\u901F\u5EA6" },
        { id: "df_multi", name: "\u591A\u5F00\u8BBE\u5907" }
      ] }
    ]
  }
};
var SCORE_SECTION = {
  info_verify: "score_model",
  fraud: "fraud_score_model",
  decision: "decision_overview"
};
var FLOW_SECTION = {
  info_verify: "conclusion_process",
  fraud: "disposal_bar",
  decision: "decision_suggestion"
};
function buildSections(type) {
  const built = {};
  return SECTION_CATALOG[type].filter((s) => s.id !== SCORE_SECTION[type] && s.id !== FLOW_SECTION[type]).map((s, i) => {
    const sType = SECTION_SOURCE[s.id] ?? "data_source";
    let ds;
    let api;
    let ruleSetId;
    let copyFromId;
    let copyFromName;
    let copySections;
    let copyScoreRange;
    let fields;
    let secCardMode;
    if (sType === "data_source") {
      const tableFields = s.fields.map((f) => ({ name: f.name, type: inferDbType(f.name), visible: true, scorePoints: 5, condType: "eq", group: f.group }));
      ds = { dbType: "MySQL", ip: "", port: "3306", username: "", password: "", database: "", table: "", tableFields };
      fields = ds.tableFields.map((tf, k) => ({ id: s.fields[k].id, name: tf.name, displayLabel: tf.name, type: tf.type, container: recommendDbContainer(tf.type), visible: true, sourceRef: tf.name, mask: /身份证|手机|银行卡|证件|姓名/.test(tf.name), maskRule: autoMaskRule(tf.name), scorePoints: 5, condType: "eq", condValue: "", exempt: false, group: tf.group }));
    } else if (sType === "api") {
      const inputs = s.id === "id_images" ? [{ key: "applicantId", from: "\u8FDB\u4EF6\u8868\u5355.\u7533\u8BF7\u4EBAID", required: true }, { key: "idCard", from: "\u8FDB\u4EF6\u8868\u5355.\u8EAB\u4EFD\u8BC1\u53F7", required: true }] : [];
      const containerOf = (name) => /ocr|文本|文字/i.test(name) ? "text" : "image";
      const outputs = s.fields.map((f) => ({ key: f.id, label: f.name, type: inferFieldType(f.name, f.desc), container: s.id === "id_images" ? containerOf(f.name) : inferApiContainer(f.name, f.desc), visible: true, scorePoints: 5, condType: "eq" }));
      api = { url: "", method: "POST", headers: [], inputs, bodyType: "none", bodyText: "", outputs };
      fields = api.outputs.map((o, k) => ({ id: s.fields[k].id, name: o.label, displayLabel: o.label, type: o.type, container: o.container, visible: true, sourceRef: o.key, scorePoints: 5, condType: "eq", condValue: "", exempt: false, group: o.group }));
    } else if (sType === "tpl_copy") {
      const fromId = SECTION_COPY_FROM[s.id] ?? "";
      const fromSec = built[fromId];
      const sumSrc = SUMMARY_SRC[s.id];
      if (sumSrc) {
        copyFromName = sumSrc.name;
        copySections = sumSrc.sections.map((ss) => ({
          id: ss.id,
          name: ss.name,
          desc: ss.name,
          order: 0,
          visible: true,
          sourceType: ss.sourceType,
          sourceName: ss.name,
          cardScoreMode: ss.sourceType === "rule_set" ? "deduct" : "add",
          fields: ss.fields.map((f) => ({
            id: f.id,
            name: f.name,
            visible: true,
            sourceRef: f.id,
            scorePoints: f.scorePoints ?? 5,
            condType: ss.sourceType === "rule_set" ? "hit" : "eq"
          }))
        }));
        copyScoreRange = {
          min: 0,
          max: copySections.reduce((a, cs) => a + (cs.fields ?? []).reduce((x, f) => x + (f.scorePoints ?? 0), 0), 0),
          base: 0
        };
        secCardMode = sumSrc.cardScoreMode;
      } else {
        copyFromId = fromId;
        copyFromName = fromSec?.name;
        copySections = fromSec ? [fromSec] : void 0;
        copyScoreRange = fromSec ? { min: 0, max: fromSec.fields.reduce((a, f) => a + (f.scorePoints ?? 0), 0), base: 0 } : void 0;
      }
      fields = [];
    } else {
      const rsId = SECTION_RULESET[s.id] ?? RULE_SETS[0].id;
      ruleSetId = rsId;
      const rs = RULE_SETS.find((r) => r.id === rsId);
      fields = rs.rules.map((r) => ({ id: r.id, name: r.name, visible: true, sourceRef: r.id, weight: 1, hitText: "\u547D\u4E2D", missText: "\u672A\u547D\u4E2D", severity: "mid", hitReject: false, exempt: false, scorePoints: 5, condType: "hit", condValue: "" }));
    }
    const sec = {
      id: s.id,
      name: s.name,
      desc: s.desc,
      order: i + 1,
      visible: true,
      sourceType: sType,
      // 模板复制段为「仅展示」型：不参与风险计分；跨模板摘要段（SUMMARY_SRC）参与计分（与 backup222 的 cross_fusion 先例一致）
      scoreable: sType === "tpl_copy" ? SUMMARY_SRC[s.id] ? void 0 : false : void 0,
      cardScoreMode: secCardMode ?? SECTION_SCORE_MODE[s.id] ?? (sType === "rule_set" ? "deduct" : "add"),
      homeTab: /logs?$/i.test(s.id) ? "log" : "content",
      sourceName: s.name,
      ds,
      api,
      ruleSetId,
      copyFromId,
      copyFromName,
      copySections,
      copyScoreRange,
      fieldGroups: s.groups ? s.groups.map((g) => ({ ...g })) : void 0,
      fields
    };
    if ((sec.homeTab ?? "content") === "content" && sec.sourceType !== "tpl_copy") {
      sec.dimBands = defaultDimBandsForScore(computeSectionScore(sec).total);
    }
    built[s.id] = sec;
    return sec;
  });
}
function defaultSpecialRules(type) {
  const mk = (sectionId, fieldId, sectionName, ruleName, autoResult, priority, note, score, weight) => ({ id: `sr_${sectionId}_${fieldId}`, sectionId, fieldId, sectionName, ruleName, trigger: "hit", autoResult, priority, note, score, weight });
  if (type === "fraud") {
    return [
      mk("blacklist_hit", "bh_type", "\u9ED1\u540D\u5355\u547D\u4E2D\u8BE6\u60C5", "\u9ED1\u540D\u5355\u547D\u4E2D", "\u62D2\u7EDD", "decisive", "\u547D\u4E2D\u9ED1\u540D\u5355\u4E00\u5F8B\u62D2\u7EDD\uFF0C\u4E0D\u770B\u603B\u5206", 30, 25),
      mk("identity_fraud", "R1", "\u8EAB\u4EFD\u6B3A\u8BC8\u8BE6\u60C5", "\u516C\u5B89\u5B9E\u540D", "\u62D2\u7EDD", "decisive", "\u516C\u5B89\u5B9E\u540D\u6838\u9A8C\u4E0D\u901A\u8FC7\u76F4\u63A5\u62D2\u7EDD", 25, 20),
      mk("device_fraud", "df_fp", "\u8BBE\u5907\u6B3A\u8BC8\u8BE6\u60C5", "\u8BBE\u5907\u7FA4\u63A7", "\u8F6C\u4EBA\u5DE5", "warning", "\u7591\u4F3C\u7FA4\u63A7\uFF0C\u91CD\u70B9\u63D0\u793A\uFF0C\u4ECD\u770B\u603B\u5206", 18, 15)
    ];
  }
  if (type === "info_verify") {
    return [
      mk("cross_fusion", "R6", "\u6570\u636E\u4EA4\u53C9\u878D\u5408", "\u8BBE\u5907\u7FA4\u63A7", "\u62D2\u7EDD", "decisive", "\u8BC6\u522B\u5230\u7FA4\u63A7/\u8BBE\u5907\u519C\u573A\uFF0C\u76F4\u63A5\u62D2\u7EDD", 35, 30),
      mk("cross_fusion", "R5", "\u6570\u636E\u4EA4\u53C9\u878D\u5408", "\u8054\u9632\u8054\u63A7", "\u8F6C\u4EBA\u5DE5", "warning", "\u8DE8\u673A\u6784\u8054\u9632\u8054\u63A7\u547D\u4E2D\uFF0C\u91CD\u70B9\u63D0\u793A", 18, 15)
    ];
  }
  return [];
}
function defaultTheme() {
  return {
    preset: "\u6807\u51C6\u84DD",
    primaryColor: "#3B82F6",
    passColor: "#10B981",
    warningColor: "#F59E0B",
    rejectColor: "#EF4444",
    spacing: "\u6807\u51C6",
    fontSize: "\u6807\u51C6",
    tableStyle: "\u7EBF\u6846\u8868",
    borderRadius: "\u5C0F\u5706\u89D2",
    headerStyle: "\u6807\u51C6"
  };
}
function defaultExport() {
  return {
    formats: ["PDF", "Word"],
    defaultFormat: "PDF",
    pdfHeader: "{\u6A21\u677F\u540D\u79F0}",
    pdfFooter: "\u7B2C {page} \u9875 / \u5171 {total} \u9875",
    watermark: { enabled: false, text: "\u5185\u90E8\u673A\u5BC6", opacity: 10 },
    wordStyle: "\u4E0E\u9875\u9762\u4E00\u81F4",
    excelSplitSheet: true,
    exportScope: "\u5B8C\u6574\u62A5\u544A",
    includeOpLogs: true,
    includeSignature: false,
    signatureTemplate: void 0
  };
}
var STATUS_ENUM_PRESETS = {
  info_verify: ["\u5F85\u786E\u8BA4", "\u901A\u8FC7", "\u62D2\u7EDD", "\u6302\u8D77", "\u5DF2\u529E\u7ED3", "\u8F6C\u4EBA\u5DE5"],
  credit: ["\u5F85\u5BA1\u6838", "\u901A\u8FC7", "\u62D2\u7EDD", "\u590D\u6838\u4E2D", "\u5DF2\u529E\u7ED3", "\u8F6C\u4EBA\u5DE5"],
  fraud: ["\u5F85\u786E\u8BA4", "\u901A\u8FC7", "\u62D2\u7EDD", "\u52A0\u5165\u9ED1\u540D\u5355", "\u5DF2\u529E\u7ED3", "\u8F6C\u4EBA\u5DE5"],
  decision: ["\u5F85\u5BA1\u6279", "\u901A\u8FC7", "\u62D2\u7EDD", "\u9000\u56DE", "\u5DF2\u529E\u7ED3", "\u8F6C\u4EBA\u5DE5"]
};
function buildTemplate(type, o) {
  const sections = buildSections(type);
  const tpl = {
    id: o.id,
    name: o.name,
    reportType: type,
    scope: o.scope,
    status: o.status,
    isDefault: o.isDefault ?? false,
    description: o.description ?? "",
    version: o.version ?? "V1.0",
    lastEditor: o.lastEditor ?? "admin",
    lastEditTime: o.lastEditTime ?? "\u521A\u521A",
    sections,
    scoreBlock: { show: true, title: "", min: 0, max: 100, rejectCount: 0 },
    flowBlock: { show: true, title: "", statusEnum: STATUS_ENUM_PRESETS[type] },
    showOpLog: true,
    showSectionTotals: true,
    scoreDisplay: {
      displayComponent: "\u5927\u6570\u5B57",
      showDescription: true,
      showThresholdBar: true,
      showRiskTags: true,
      baseScore: 0,
      title: type === "info_verify" ? "\u4FE1\u606F\u6838\u9A8C\u7EFC\u5408\u4FE1\u7528\u6A21\u578B" : "",
      // 信息核验/欺诈的 grades 是异常值语义，但报告详情页习惯给客户看「信用值」→ 默认翻转；信用/决策本身就是越高越好，直读
      scoreSemantic: type === "info_verify" || type === "fraud" ? "credit" : "risk",
      grades: GRADE_PRESETS[type].map((g) => ({ ...g }))
    },
    scoreFormula: type === "decision" ? { ...DEFAULT_DECISION_FORMULA, terms: DEFAULT_DECISION_FORMULA.terms.map((t) => ({ ...t })) } : buildDefaultScoreFormula(sections),
    specialRules: defaultSpecialRules(type),
    businessFlow: syncFlowToGrades(FLOW_PRESETS[type], GRADE_PRESETS[type]),
    theme: defaultTheme(),
    export: defaultExport(),
    changeLogs: [
      { version: o.version ?? "V1.0", action: "\u521B\u5EFA", operator: o.lastEditor ?? "admin", timestamp: o.lastEditTime ?? "\u521A\u521A", summary: `\u521B\u5EFA\u300C${o.name}\u300D` }
    ]
  };
  const summary = computeScoreSummary(tpl);
  tpl.scoreBlock.min = summary.min;
  tpl.scoreBlock.max = summary.max;
  tpl.scoreBlock.rejectCount = summary.rejectTotal;
  tpl.scoreDisplay.grades = buildDefaultGradesForRange(summary.min, summary.max, 3, tpl.scoreDisplay.scoreSemantic);
  return tpl;
}
function mkDsSection(id, name, desc, weight, mode, demoScore, table, fields) {
  const ds = {
    dbType: "MySQL",
    ip: "",
    port: "3306",
    username: "",
    password: "",
    database: "risk_iv",
    table,
    tableFields: fields.map((f) => ({ name: f.ref, label: f.name, type: inferDbType(f.ref), visible: true, scorePoints: f.scorePoints, condType: f.condType, condValue: f.condValue }))
  };
  return {
    id,
    name,
    desc,
    order: 0,
    visible: true,
    sourceType: "data_source",
    sourceName: name,
    cardScoreMode: mode,
    homeTab: "content",
    weight,
    dimNote: "",
    ds,
    fields: fields.map((f) => ({
      id: f.id,
      name: f.name,
      desc: f.desc,
      visible: true,
      sourceRef: f.ref,
      maskRule: autoMaskRule(f.ref),
      scorePoints: f.scorePoints,
      condType: f.condType,
      condValue: f.condValue
    })),
    demoScore,
    demoValues: Object.fromEntries(fields.map((f) => [f.id, { name: f.name, value: f.demo.value, status: f.demo.status }]))
  };
}
function mkApiSection(id, name, desc, weight, mode, demoScore, url, inputs, fields) {
  const api = {
    url,
    method: "POST",
    headers: [],
    inputs,
    bodyType: "json",
    bodyText: "",
    outputs: fields.map((f) => ({
      key: f.ref,
      label: f.name,
      type: inferFieldType(f.name, f.desc),
      container: inferApiContainer(f.name, f.desc),
      visible: true,
      scorePoints: f.scorePoints,
      condType: f.condType,
      condValue: f.condValue
    }))
  };
  return {
    id,
    name,
    desc,
    order: 0,
    visible: true,
    sourceType: "api",
    sourceName: name,
    cardScoreMode: mode,
    homeTab: "content",
    weight,
    dimNote: "",
    api,
    fields: fields.map((f) => ({
      id: f.id,
      name: f.name,
      desc: f.desc,
      visible: true,
      sourceRef: f.ref,
      scorePoints: f.scorePoints,
      condType: f.condType,
      condValue: f.condValue
    })),
    demoScore,
    demoValues: Object.fromEntries(fields.map((f) => [f.id, { name: f.name, value: f.demo.value, status: f.demo.status }]))
  };
}
function mkRuleSection(id, name, desc, weight, mode, demoScore, ruleSetId, fields) {
  return {
    id,
    name,
    desc,
    order: 0,
    visible: true,
    sourceType: "rule_set",
    sourceName: name,
    cardScoreMode: mode,
    homeTab: "content",
    weight,
    dimNote: "",
    ruleSetId,
    fields: fields.map((f) => ({
      id: f.id,
      name: f.name,
      desc: f.desc,
      visible: true,
      sourceRef: f.ref,
      hitText: f.hitText ?? "\u547D\u4E2D",
      missText: f.missText ?? "\u672A\u547D\u4E2D",
      severity: f.severity ?? "mid",
      hitReject: f.hitReject ?? false,
      scorePoints: f.scorePoints,
      condType: f.condType,
      condValue: f.condValue
    })),
    demoScore,
    demoValues: Object.fromEntries(fields.map((f) => [f.id, { name: f.name, value: f.demo.value, status: f.demo.status }]))
  };
}
function buildAuthorityInfoTemplate() {
  const sections = [
    mkDsSection("sec_identity", "\u8EAB\u4EFD\u5B9E\u540D\u6838\u9A8C", "\u8EAB\u4EFD\u8BC1\u8981\u7D20\u4E0E\u516C\u5B89\u5E93\u4E00\u81F4\u6027\uFF0C\u786E\u8BA4\u300C\u672C\u4EBA+\u771F\u5B9E\u8EAB\u4EFD\u300D", 15, "deduct", 10, "t_identity_verify", [
      { id: "iv_no", name: "\u8EAB\u4EFD\u8BC1\u53F7\u683C\u5F0F\u6821\u9A8C", ref: "id_no", desc: "18 \u4F4D\u7ED3\u6784/\u6821\u9A8C\u4F4D", scorePoints: 8, condType: "regex", condValue: "^\\d{17}[\\dX]$", demo: { value: "\u683C\u5F0F\u6B63\u786E", status: "pass" } },
      { id: "iv_2e", name: "\u59D3\u540D+\u8BC1\u4EF6\u4E8C\u8981\u7D20", ref: "id_2elem", desc: "\u4E0E\u516C\u5B89\u5E93\u59D3\u540D\u8BC1\u4EF6\u53F7\u6BD4\u5BF9", scorePoints: 15, condType: "eq", condValue: "\u4E00\u81F4", demo: { value: "\u4E00\u81F4", status: "pass" } },
      { id: "iv_exp", name: "\u8BC1\u4EF6\u6709\u6548\u671F", ref: "id_expire", desc: "\u662F\u5426\u5728\u6709\u6548\u671F\u5185", scorePoints: 8, condType: "eq", condValue: "\u6709\u6548\u671F\u5185", demo: { value: "\u6709\u6548\u671F\u5185", status: "pass" } },
      { id: "iv_lost", name: "\u8BC1\u4EF6\u6302\u5931/\u5192\u7528", ref: "id_lost", desc: "\u516C\u5B89\u5E93\u6302\u5931\u5192\u7528\u72B6\u6001", scorePoints: 12, condType: "eq", condValue: "\u6B63\u5E38", demo: { value: "\u6B63\u5E38", status: "pass" } },
      { id: "iv_photo", name: "\u516C\u5B89\u5E93\u4EBA\u50CF\u4E00\u81F4\u6027", ref: "id_photo", desc: "\u8BC1\u4EF6\u7167\u4E0E\u516C\u5B89\u7559\u5B58\u7167\u6BD4\u5BF9", scorePoints: 10, condType: "eq", condValue: "\u4E00\u81F4", demo: { value: "\u4E00\u81F4", status: "pass" } }
    ]),
    mkApiSection("sec_liveness", "\u6D3B\u4F53\u68C0\u6D4B\u4E0E\u4EBA\u50CF\u6BD4\u5BF9", "\u6D3B\u4F53\u68C0\u6D4B + 1:1 \u4EBA\u50CF\u6BD4\u5BF9\uFF0C\u9632\u7167\u7247/\u89C6\u9891/\u9762\u5177\u653B\u51FB", 12, "deduct", 8, "/api/face/verify", [
      { key: "applicantId", from: "\u8FDB\u4EF6\u8868\u5355.\u7533\u8BF7\u4EBAID", required: true },
      { key: "liveImage", from: "\u91C7\u96C6SDK.\u6D3B\u4F53\u7167", required: true }
    ], [
      { id: "lv_live", name: "\u6D3B\u4F53\u68C0\u6D4B", ref: "live_result", desc: "\u52A8\u4F5C\u914D\u5408/\u9632\u7FFB\u62CD", scorePoints: 15, condType: "eq", condValue: "\u901A\u8FC7", demo: { value: "\u901A\u8FC7", status: "pass" } },
      { id: "lv_face", name: "1:1 \u4EBA\u50CF\u6BD4\u5BF9", ref: "face_similarity", desc: "\u4E0E\u8BC1\u4EF6\u7167\u76F8\u4F3C\u5EA6", scorePoints: 15, condType: "gt", condValue: "90", demo: { value: "98.2%", status: "pass" } },
      { id: "lv_spoof", name: "\u7FFB\u62CD/\u9762\u5177\u653B\u51FB", ref: "spoof_result", desc: "\u653B\u51FB\u68C0\u6D4B", scorePoints: 12, condType: "eq", condValue: "\u672A\u547D\u4E2D", demo: { value: "\u672A\u547D\u4E2D", status: "pass" } }
    ]),
    mkApiSection("sec_ocr", "\u8BC1\u4EF6 OCR \u8BC6\u522B", "\u8EAB\u4EFD\u8BC1/\u94F6\u884C\u5361\u5F71\u50CF\u6587\u5B57\u8BC6\u522B", 8, "deduct", 6, "/api/ocr/idcard", [
      { key: "imageId", from: "\u5F71\u50CF\u8D44\u6599.\u8EAB\u4EFD\u8BC1\u5F71\u50CF", required: true }
    ], [
      { id: "oc_id", name: "\u8EAB\u4EFD\u8BC1 OCR", ref: "ocr_id", desc: "\u6B63\u53CD\u9762\u6587\u5B57\u8BC6\u522B", scorePoints: 8, condType: "eq", condValue: "\u8BC6\u522B\u6210\u529F", demo: { value: "\u8BC6\u522B\u6210\u529F", status: "pass" } },
      { id: "oc_bank", name: "\u94F6\u884C\u5361 OCR", ref: "ocr_bank", desc: "\u5361\u53F7\u8BC6\u522B", scorePoints: 6, condType: "eq", condValue: "\u8BC6\u522B\u6210\u529F", demo: { value: "\u8BC6\u522B\u6210\u529F", status: "pass" } }
    ]),
    mkDsSection("sec_bank", "\u94F6\u884C\u5361\u6838\u9A8C", "\u94F6\u884C\u5361\u4E8C/\u4E09/\u56DB\u8981\u7D20\u4E0E\u94F6\u884C\u5F00\u6237\u9884\u7559\u4E00\u81F4\u6027", 12, "deduct", 12, "t_bank_verify", [
      { id: "bk_3e", name: "\u94F6\u884C\u5361\u4E09\u8981\u7D20", ref: "bank_3elem", desc: "\u59D3\u540D+\u8BC1\u4EF6+\u5361\u53F7", scorePoints: 12, condType: "eq", condValue: "\u4E00\u81F4", demo: { value: "\u4E00\u81F4", status: "pass" } },
      { id: "bk_4e", name: "\u94F6\u884C\u5361\u56DB\u8981\u7D20", ref: "bank_4elem", desc: "+\u9884\u7559\u624B\u673A\u53F7", scorePoints: 12, condType: "eq", condValue: "\u4E00\u81F4", demo: { value: "\u4E00\u81F4", status: "pass" } },
      { id: "bk_stat", name: "\u5361\u72B6\u6001", ref: "bank_status", desc: "\u662F\u5426\u6B62\u4ED8/\u51BB\u7ED3", scorePoints: 6, condType: "eq", condValue: "\u6B63\u5E38", demo: { value: "\u6B63\u5E38", status: "pass" } },
      { id: "bk_type", name: "\u5361\u7C7B\u578B", ref: "bank_type", desc: "\u501F\u8BB0/\u8D37\u8BB0", scorePoints: 4, condType: "eq", condValue: "\u501F\u8BB0\u5361", demo: { value: "\u501F\u8BB0\u5361", status: "pass" } }
    ]),
    mkDsSection("sec_operator", "\u8FD0\u8425\u5546\u6838\u9A8C\u4E0E\u5728\u7F51", "\u8FD0\u8425\u5546\u4E09\u8981\u7D20\u4E00\u81F4\u6027\u3001\u5728\u7F51\u65F6\u957F\u4E0E\u72B6\u6001", 15, "deduct", 15, "t_citynet_verify", [
      { id: "op_3e", name: "\u8FD0\u8425\u5546\u4E09\u8981\u7D20", ref: "op_3elem", desc: "\u59D3\u540D+\u8BC1\u4EF6+\u624B\u673A\u53F7", scorePoints: 12, condType: "eq", condValue: "\u4E00\u81F4", demo: { value: "\u4E00\u81F4", status: "pass" } },
      { id: "op_dur", name: "\u5728\u7F51\u65F6\u957F", ref: "op_duration", desc: "\u5165\u7F51\u6708\u6570", scorePoints: 8, condType: "gt", condValue: "12", demo: { value: "36 \u4E2A\u6708", status: "pass" } },
      { id: "op_stat", name: "\u5728\u7F51\u72B6\u6001", ref: "op_status", desc: "\u6B63\u5E38/\u505C\u673A", scorePoints: 8, condType: "eq", condValue: "\u6B63\u5E38", demo: { value: "\u6B63\u5E38", status: "pass" } },
      { id: "op_prov", name: "\u5F52\u5C5E\u5730\u4E00\u81F4\u6027", ref: "op_province", desc: "\u4E0E\u7533\u8BF7\u5730\u6BD4\u5BF9", scorePoints: 4, condType: "eq", condValue: "\u4E00\u81F4", demo: { value: "\u4E00\u81F4", status: "pass" } }
    ]),
    mkRuleSection("sec_blacklist", "\u53CD\u6B3A\u8BC8\u9ED1\u540D\u5355\u4E0E\u8054\u9632\u8054\u63A7", "\u9ED1\u540D\u5355/\u516C\u5B89\u91CD\u70B9\u4EBA\u5458/\u8DE8\u673A\u6784\u8054\u9632\u8054\u63A7\u547D\u4E2D\u6838\u67E5", 18, "deduct", 5, "rs_all", [
      { id: "bl_ovd", name: "\u4FE1\u8D37\u903E\u671F\u9ED1\u540D\u5355", ref: "rule_bl_overdue", desc: "\u8FD1 X \u6708\u4FE1\u8D37\u903E\u671F\u9ED1\u540D\u5355", scorePoints: 15, condType: "hit", severity: "high", hitReject: true, demo: { value: "\u672A\u547D\u4E2D", status: "pass" } },
      { id: "bl_sx", name: "\u5931\u4FE1\u88AB\u6267\u884C\u4EBA", ref: "rule_bl_sx", desc: "\u6CD5\u9662\u5931\u4FE1\u540D\u5355", scorePoints: 15, condType: "hit", severity: "high", hitReject: true, demo: { value: "\u672A\u547D\u4E2D", status: "pass" } },
      { id: "bl_pol", name: "\u516C\u5B89\u91CD\u70B9\u4EBA\u5458", ref: "rule_bl_police", desc: "\u516C\u5B89\u91CD\u70B9\u4EBA\u5458\u5E93", scorePoints: 15, condType: "hit", severity: "high", hitReject: true, demo: { value: "\u672A\u547D\u4E2D", status: "pass" } },
      { id: "bl_link", name: "\u8DE8\u673A\u6784\u8054\u9632\u8054\u63A7", ref: "rule_bl_link", desc: "\u591A\u5934\u8054\u9632\u8054\u63A7\u547D\u4E2D", scorePoints: 10, condType: "hit", severity: "mid", demo: { value: "\u672A\u547D\u4E2D", status: "pass" } }
    ]),
    mkRuleSection("sec_device", "\u8BBE\u5907\u4E0E\u884C\u4E3A\u98CE\u9669", "\u8BBE\u5907\u7FA4\u63A7/\u5F02\u5E38\u3001\u884C\u4E3A\u8F68\u8FF9\u3001\u5730\u7406\u4F4D\u7F6E\u8DF3\u52A8", 12, "deduct", 58, "rs_device", [
      { id: "dv_farm", name: "\u8BBE\u5907\u7FA4\u63A7/\u519C\u573A", ref: "rule_dv_farm", desc: "\u7FA4\u63A7/\u8BBE\u5907\u519C\u573A\u8BC6\u522B", scorePoints: 12, condType: "hit", severity: "high", demo: { value: "\u672A\u547D\u4E2D", status: "pass" } },
      { id: "dv_abn", name: "\u8BBE\u5907\u5F02\u5E38", ref: "rule_dv_abn", desc: "\u4E00\u8BBE\u5907\u591A\u7533\u8BF7\u5173\u8054", scorePoints: 8, condType: "hit", severity: "mid", demo: { value: "\u547D\u4E2D\uFF08\u5173\u8054 3 \u4E2A\u7533\u8BF7\uFF09", status: "warn" } },
      { id: "dv_geo", name: "\u5730\u7406\u4F4D\u7F6E\u8DF3\u52A8", ref: "rule_dv_geo", desc: "\u77ED\u65F6\u53D1\u751F\u5730\u8DF3\u8DC3", scorePoints: 8, condType: "hit", severity: "mid", demo: { value: "\u547D\u4E2D\uFF082 \u7701\uFF09", status: "warn" } },
      { id: "dv_root", name: "\u6A21\u62DF\u5668/\u8D8A\u72F1", ref: "rule_dv_root", desc: "\u8FD0\u884C\u73AF\u5883\u98CE\u9669", scorePoints: 6, condType: "hit", severity: "mid", demo: { value: "\u672A\u547D\u4E2D", status: "pass" } }
    ]),
    mkDsSection("sec_multi", "\u591A\u5934\u501F\u8D37\u4E0E\u4FE1\u8D37\u7533\u8BF7", "\u8FD1\u5468\u671F\u4FE1\u8D37\u7533\u8BF7\u673A\u6784\u6570\u3001\u67E5\u8BE2\u6B21\u6570\u3001\u903E\u671F\u8BB0\u5F55", 8, "deduct", 62, "t_multi_loan", [
      { id: "ml_org", name: "\u8FD1 30 \u5929\u7533\u8BF7\u673A\u6784\u6570", ref: "ml_org_30d", desc: "\u4FE1\u8D37\u7533\u8BF7\u673A\u6784\u6570", scorePoints: 8, condType: "lt", condValue: "10", demo: { value: "6 \u5BB6", status: "warn" } },
      { id: "ml_qry", name: "\u8FD1 30 \u5929\u5BA1\u6279\u67E5\u8BE2", ref: "ml_query_30d", desc: "\u5F81\u4FE1\u5BA1\u6279\u67E5\u8BE2\u6B21\u6570", scorePoints: 8, condType: "lt", condValue: "15", demo: { value: "9 \u6B21", status: "warn" } },
      { id: "ml_ovd", name: "\u5386\u53F2\u903E\u671F\u8BB0\u5F55", ref: "ml_overdue", desc: "\u5386\u53F2\u903E\u671F\u7B14\u6570", scorePoints: 10, condType: "eq", condValue: "\u65E0", demo: { value: "\u65E0", status: "pass" } },
      { id: "ml_cur", name: "\u5F53\u524D\u5728\u8D37\u7B14\u6570", ref: "ml_current", desc: "\u5F53\u524D\u672A\u7ED3\u6E05\u7B14\u6570", scorePoints: 6, condType: "lt", condValue: "5", demo: { value: "2 \u7B14", status: "pass" } }
    ])
  ];
  sections.forEach((s, i) => s.order = i + 1);
  const tpl = buildTemplate("info_verify", {
    id: "tpl-info-authority",
    name: "\u6743\u5A01\u4FE1\u606F\u6838\u9A8C\u62A5\u544A\u6A21\u677F\uFF08\u5907\u7528\uFF09",
    status: "\u8349\u7A3F",
    scope: ["\u5168\u4EA7\u54C1"],
    isDefault: false,
    version: "V1.0",
    lastEditor: "admin",
    lastEditTime: "\u4ECA\u5929",
    description: "\u4F9D\u636E\u884C\u4E1A\u6743\u5A01\u8EAB\u4EFD\u6838\u9A8C\u80FD\u529B\u8BBE\u8BA1\u7684\u5907\u7528\u6F14\u793A\u6A21\u677F\uFF1A8 \u4E2A\u96C6\u5408\u5747\u5DF2\u914D\u7F6E\u5177\u4F53\u6570\u636E\u9879\uFF08\u6570\u636E\u6E90\u7ED1\u5B9A/\u8131\u654F/\u8BA1\u5206\u6761\u4EF6\uFF09\uFF0C\u8986\u76D6\u8EAB\u4EFD\u8BC1\u8981\u7D20\u3001\u4EBA\u50CF\u6BD4\u5BF9\u3001\u6D3B\u4F53\u3001OCR\u3001\u94F6\u884C\u5361\u3001\u8FD0\u8425\u5546\u3001\u9ED1\u540D\u5355\u3001\u8BBE\u5907\u3001\u591A\u5934\u3002\u7528\u4E8E\u9A8C\u8BC1\u300C\u6A21\u677F\u9A71\u52A8\u62A5\u544A\u300D\u94FE\u8DEF\uFF0C\u4E0D\u66FF\u6362\u73B0\u6709\u6807\u51C6\u6A21\u677F\u3002"
  });
  tpl.sections = sections;
  tpl.showSectionTotals = true;
  tpl.specialRules = [];
  tpl.demoApplicant = {
    \u7533\u8BF7\u4EBA: "\u5F20*\u660E",
    \u8BC1\u4EF6\u53F7: "3301**********1234",
    \u624B\u673A\u53F7: "138****6688",
    \u94F6\u884C\u5361: "6222********1234",
    \u7533\u8BF7\u4EA7\u54C1: "\u5DE5\u85AA\u8D37",
    \u7533\u8BF7\u989D\u5EA6: "\xA580,000"
  };
  return tpl;
}
function buildBackup222Template() {
  const t = buildTemplate("info_verify", {
    id: "tpl-info-backup222",
    name: "\u7EFC\u5408\u4FE1\u7528\u6A21\u578B\uFF08\u65B9\u6848222\u5907\u7528\uFF09",
    status: "\u5DF2\u542F\u7528",
    scope: ["\u5168\u4EA7\u54C1"],
    isDefault: true,
    version: "V2.6\u98CE\u63A7\u7B56\u7565\u96C6",
    lastEditor: "admin",
    lastEditTime: "2026-07-21",
    description: "\u4FE1\u606F\u6838\u9A8C\u5F53\u524D\u542F\u7528\u6A21\u677F\uFF1A\u6A21\u677F\u9A71\u52A8\u8FD8\u539F\u62A5\u544A\uFF08\u65B9\u6848222\uFF09\uFF0C\u6570\u636E\u4ECE\u672C\u5730 JSON \u8BFB\u53D6\u3002"
  });
  const sec = (id) => t.sections.find((s) => s.id === id);
  const basic = sec("basic_info");
  basic.demoScore = 6;
  basic.demoValues = {
    bi_name: { name: "\u59D3\u540D", value: "\u5F20*\u660E", status: "pass" },
    bi_id: { name: "\u8EAB\u4EFD\u8BC1\u53F7", value: "3301**********1234", status: "pass" },
    bi_phone: { name: "\u624B\u673A\u53F7", value: "138****6688", status: "pass" },
    bi_bank: { name: "\u94F6\u884C\u5361\u53F7", value: "6222********1234", status: "pass" },
    bi_bank_branch: { name: "\u5F00\u6237\u884C", value: "\u5DE5\u5546\u94F6\u884C\u676D\u5DDE\u5206\u884C", status: "pass" },
    bi_age: { name: "\u5E74\u9F84", value: "32", status: "pass" },
    bi_edu: { name: "\u5B66\u5386", value: "\u672C\u79D1", status: "pass" },
    bi_company: { name: "\u5DE5\u4F5C\u5355\u4F4D", value: "\u676D\u5DDE\u67D0\u79D1\u6280\u6709\u9650\u516C\u53F8", status: "pass" },
    bi_income: { name: "\u6708\u6536\u5165", value: "\xA515,000", status: "pass" },
    bi_address: { name: "\u5C45\u4F4F\u5730\u5740", value: "\u676D\u5DDE\u5E02\u897F\u6E56\u533A", status: "pass" },
    bi_marriage: { name: "\u5A5A\u59FB", value: "\u5DF2\u5A5A", status: "pass" },
    bi_fp: { name: "\u8BBE\u5907\u6307\u7EB9", value: "FP-9A2B7C\u2026", status: "pass" },
    bi_ip: { name: "IP\u5730\u5740", value: "223.104.xx.xx", status: "pass" },
    bi_gps: { name: "GPS\u5B9A\u4F4D", value: "\u676D\u5DDE\xB7\u897F\u6E56\u533A", status: "pass" },
    bi_channel: { name: "\u8FDB\u4EF6\u6E20\u9053", value: "APP", status: "pass" },
    bi_appver: { name: "APP\u7248\u672C", value: "v3.2.1", status: "pass" }
  };
  const images = sec("id_images");
  images.demoScore = 2;
  images.demoValues = {
    ii_front: { name: "\u8EAB\u4EFD\u8BC1\u4EBA\u50CF\u9762", value: "\u5DF2\u91C7\u96C6", status: "pass" },
    ii_back: { name: "\u8EAB\u4EFD\u8BC1\u56FD\u5FBD\u9762", value: "\u5DF2\u91C7\u96C6", status: "pass" },
    ii_live: { name: "\u6D3B\u4F53\u4EBA\u8138", value: "\u6D3B\u4F53\u901A\u8FC7", status: "pass" },
    ii_bank: { name: "\u94F6\u884C\u5361", value: "\u5DF2\u91C7\u96C6", status: "pass" },
    ii_ocr: { name: "OCR\u8BC6\u522B\u6587\u672C", value: "\u59D3\u540D/\u8BC1\u4EF6\u53F7\u4E00\u81F4", status: "pass" }
  };
  const single = sec("single_verify");
  single.demoScore = 9;
  single.demoValues = {
    sv_police: { name: "\u516C\u5B89\u5B9E\u540D", value: "\u4E00\u81F4", status: "pass" },
    sv_bank4: { name: "\u94F6\u884C\u5361\u56DB\u8981\u7D20", value: "\u4E00\u81F4", status: "pass" },
    sv_operator: { name: "\u8FD0\u8425\u5546\u5B9E\u540D", value: "\u5DF2\u5B9E\u540D", status: "pass" },
    sv_device: { name: "\u7EC8\u7AEF\u8BBE\u5907", value: "\u771F\u5B9E\u8BBE\u5907", status: "warn" },
    sv_link: { name: "\u8054\u9632\u8054\u63A7", value: "\u65E0\u5F02\u5E38", status: "pass" },
    sv_serial: { name: "\u6838\u9A8C\u6D41\u6C34\u53F7", value: "OPR-20260721-143218", status: "pass" },
    sv_time: { name: "\u6838\u9A8C\u65F6\u95F4", value: "2026-07-21 15:00:12", status: "pass" }
  };
  const cross = sec("cross_fusion");
  cross.sourceType = "rule_set";
  cross.scoreable = true;
  cross.copyFromId = void 0;
  cross.copyFromName = void 0;
  cross.copySections = void 0;
  cross.copyScoreRange = void 0;
  cross.ruleSetId = "rs_device";
  const crossRs = RULE_SETS.find((r) => r.id === "rs_device");
  cross.fields = crossRs.rules.map((r) => ({
    id: r.id,
    name: r.name,
    desc: r.desc,
    visible: true,
    sourceRef: r.id,
    hitText: "\u547D\u4E2D",
    missText: "\u672A\u547D\u4E2D",
    severity: "mid",
    hitReject: false,
    scorePoints: 5,
    condType: "hit"
  }));
  cross.demoScore = 18;
  cross.demoValues = {
    R4: { name: "\u8BBE\u5907\u771F\u5B9E\u6027", value: "\u5F02\u5E38", status: "warn" },
    R5: { name: "\u8054\u9632\u8054\u63A7", value: "\u547D\u4E2D 2 \u9879", status: "warn" },
    R6: { name: "\u8BBE\u5907\u7FA4\u63A7", value: "\u547D\u4E2D", status: "warn" },
    R7: { name: "\u56E2\u4F19\u5173\u8054", value: "\u672A\u547D\u4E2D", status: "pass" },
    R8: { name: "\u9ED1\u540D\u5355\u547D\u4E2D", value: "\u547D\u4E2D", status: "reject" }
  };
  sec("op_logs").demoScore = 0;
  t.scoreDisplay.scoreSemantic = "risk";
  const s2 = computeScoreSummary(t);
  t.scoreBlock = { show: true, title: "\u4FE1\u606F\u6838\u9A8C\u81EA\u52A8\u5BA1\u6838\u5F97\u5206", min: s2.min, max: s2.max, rejectCount: s2.rejectTotal };
  t.flowBlock = { ...t.flowBlock, title: "\u4FE1\u606F\u6838\u9A8C\u4EBA\u5DE5\u5BA1\u6838" };
  t.scoreDisplay.grades = buildDefaultGradesForRange(s2.min, s2.max, 3, "risk");
  t.businessFlow = syncFlowToGrades(t.businessFlow, t.scoreDisplay.grades);
  t.scoreFormula = buildDefaultScoreFormula(t.sections);
  t.showSectionTotals = true;
  t.showOpLog = true;
  t.specialRules = [
    { id: "sr1", sectionId: "single_verify", fieldId: "sv_device", sectionName: "\u591A\u6E90\u5E76\u884C\u6838\u9A8C\u5355\u9879\u62A5\u544A", ruleName: "\u8BBE\u5907\u7FA4\u63A7", trigger: "hit", autoResult: "\u8F6C\u4EBA\u5DE5", priority: "warning", score: 18, weight: 20, note: "\u547D\u4E2D\u8BBE\u5907\u7FA4\u63A7\u7279\u5F81" },
    { id: "sr2", sectionId: "cross_fusion", fieldId: "R8", sectionName: "\u6570\u636E\u4EA4\u53C9\u878D\u5408\u7EFC\u5408\u62A5\u544A", ruleName: "\u9ED1\u540D\u5355\u547D\u4E2D", trigger: "hit", autoResult: "\u62D2\u7EDD", priority: "decisive", score: 50, weight: 30, note: "\u547D\u4E2D\u98CE\u63A7\u9ED1\u540D\u5355" },
    { id: "sr3", sectionId: "basic_info", fieldId: "bi_id", sectionName: "\u7528\u6237\u57FA\u672C\u4FE1\u606F", ruleName: "\u8BC1\u4EF6\u53F7\u683C\u5F0F\u5F02\u5E38", trigger: "hit", autoResult: "\u8F6C\u4EBA\u5DE5", priority: "warning", score: 10, weight: 15, note: "\u8BC1\u4EF6\u53F7\u4E0E\u59D3\u540D\u4E00\u81F4\u6027\u5F85\u6838" },
    { id: "sr4", sectionId: "id_images", fieldId: "ii_live", sectionName: "\u7528\u6237\u8BC1\u4EF6\u7167", ruleName: "\u6D3B\u4F53\u6BD4\u5BF9\u5931\u8D25", trigger: "hit", autoResult: "\u62D2\u7EDD", priority: "decisive", score: 40, weight: 25, note: "\u6D3B\u4F53\u68C0\u6D4B\u5206\u6570\u504F\u4F4E" }
  ];
  t.demoApplicant = {
    \u7533\u8BF7\u4EBA: "\u5F20*\u660E",
    \u8BC1\u4EF6\u53F7: "3301**********1234",
    \u624B\u673A\u53F7: "138****6688",
    \u94F6\u884C\u5361: "6222********1234",
    \u7533\u8BF7\u4EA7\u54C1: "\u5DE5\u85AA\u8D37",
    \u7533\u8BF7\u989D\u5EA6: "\xA580,000",
    \u62A5\u544AID: "CR20260721001",
    \u8BA1\u7B97\u65F6\u95F4: "2026-07-21 15:00:22"
  };
  return t;
}
function buildBiz222Template(type, o) {
  const t = buildTemplate(type, { ...o, scope: o.scope ?? ["\u5168\u4EA7\u54C1"], isDefault: o.isDefault ?? false });
  t.scoreDisplay.scoreSemantic = "risk";
  t.scoreDisplay.title = o.name;
  t.scoreFormula = buildDefaultScoreFormula(t.sections);
  const s2 = computeScoreSummary(t);
  t.scoreBlock = { show: true, title: o.autoTitle ?? "", min: s2.min, max: s2.max, rejectCount: s2.rejectTotal };
  t.flowBlock = { ...t.flowBlock, title: o.manualTitle ?? "" };
  t.scoreDisplay.grades = buildDefaultGradesForRange(s2.min, s2.max, 3, "risk");
  t.businessFlow = syncFlowToGrades(t.businessFlow, t.scoreDisplay.grades);
  t.showSectionTotals = true;
  t.showOpLog = true;
  return t;
}
var seedReportTemplates = [
  // 下架旧版模板（信息核验/信用风控/欺诈识别/决策 四报告改用 222 方案模板）
  buildTemplate("info_verify", {
    id: "tpl-info-standard",
    name: "\u6807\u51C6\u4FE1\u606F\u6838\u9A8C\u62A5\u544A\u6A21\u677F",
    status: "\u5DF2\u505C\u7528",
    scope: ["\u5168\u4EA7\u54C1"],
    isDefault: false,
    version: "V2.1",
    lastEditor: "admin",
    lastEditTime: "\u4ECA\u5929",
    description: "\u4FE1\u606F\u6838\u9A8C\u62A5\u544A\u6807\u51C6\u5C55\u793A\u6A21\u677F\uFF08\u5DF2\u4E0B\u67B6\uFF0C\u7531 \u7EFC\u5408\u4FE1\u7528\u6A21\u578B\uFF08\u65B9\u6848222\u5907\u7528\uFF09 \u66FF\u4EE3\uFF09\u3002"
  }),
  buildTemplate("credit", {
    id: "tpl-credit-loan",
    name: "\u4FE1\u7528\u8D37\u4FE1\u7528\u98CE\u63A7\u62A5\u544A\u6A21\u677F",
    status: "\u5DF2\u505C\u7528",
    scope: ["\u5DE5\u85AA\u8D37", "\u516C\u79EF\u91D1\u8D37", "\u793E\u4FDD\u8D37", "\u5B66\u5386\u8D37", "\u5546\u6237\u8D37"],
    version: "V1.3",
    lastEditor: "\u4E3B\u7BA1",
    lastEditTime: "3\u5929\u524D",
    description: "\u9762\u5411\u4FE1\u7528\u8D37\u5BA2\u7FA4\u7684\u4FE1\u7528\u98CE\u63A7\u62A5\u544A\u6A21\u677F\uFF08\u5DF2\u4E0B\u67B6\uFF0C\u7531 \u4FE1\u7528\u98CE\u63A7\u7EFC\u5408\u6A21\u578B\uFF08\u65B9\u6848222\u5907\u7528\uFF09 \u66FF\u4EE3\uFF09\u3002"
  }),
  buildTemplate("fraud", {
    id: "tpl-fraud-standard",
    name: "\u6B3A\u8BC8\u8BC6\u522B\u6807\u51C6\u6A21\u677F",
    status: "\u5DF2\u505C\u7528",
    scope: ["\u5168\u4EA7\u54C1"],
    version: "V1.0",
    lastEditor: "admin",
    lastEditTime: "\u521A\u521A",
    description: "\u6B3A\u8BC8\u8BC6\u522B\u62A5\u544A\u6A21\u677F\uFF08\u5DF2\u4E0B\u67B6\uFF0C\u7531 \u6B3A\u8BC8\u8BC6\u522B\u7EFC\u5408\u6A21\u578B\uFF08\u65B9\u6848222\u5907\u7528\uFF09 \u66FF\u4EE3\uFF09\u3002"
  }),
  buildTemplate("decision", {
    id: "tpl-decision-standard",
    name: "\u51B3\u7B56\u62A5\u544A\u7EFC\u5408\u6A21\u677F",
    status: "\u5DF2\u505C\u7528",
    scope: ["\u5168\u4EA7\u54C1"],
    version: "V1.2",
    lastEditor: "admin",
    lastEditTime: "1\u5468\u524D",
    description: "\u6574\u5408\u4E09\u5927\u62A5\u544A\u7684\u7EFC\u5408\u51B3\u7B56\u62A5\u544A\u6A21\u677F\uFF08\u5DF2\u4E0B\u67B6\uFF0C\u7531 \u8FDB\u4EF6\u5BA1\u6838\u7EFC\u5408\u6A21\u578B\uFF08\u65B9\u6848222\u5907\u7528\uFF09 \u66FF\u4EE3\uFF09\u3002"
  }),
  buildAuthorityInfoTemplate(),
  buildBackup222Template(),
  // 222 方案模板：四报告当前启用模板（默认模板）
  buildBiz222Template("credit", {
    id: "tpl-credit-222",
    name: "\u4FE1\u7528\u98CE\u63A7\u7EFC\u5408\u6A21\u578B\uFF08\u65B9\u6848222\u5907\u7528\uFF09",
    status: "\u5DF2\u542F\u7528",
    isDefault: true,
    version: "V2.6\u98CE\u63A7\u7B56\u7565\u96C6",
    lastEditor: "admin",
    lastEditTime: "2026-08-03",
    description: "\u4FE1\u7528\u98CE\u63A7\u5F53\u524D\u542F\u7528\u6A21\u677F\uFF1A\u6309\u4FE1\u606F\u6838\u9A8C222 \u6A21\u677F\u9A71\u52A8\u67B6\u6784\uFF0C\u4F9B \u4FE1\u7528\u98CE\u63A7 \u5217\u8868/\u8BE6\u60C5\u9875\u4F7F\u7528\u3002",
    autoTitle: "\u4FE1\u7528\u98CE\u63A7\u81EA\u52A8\u5BA1\u6838\u5F97\u5206",
    manualTitle: "\u4FE1\u7528\u98CE\u63A7\u4EBA\u5DE5\u5BA1\u6838"
  }),
  buildBiz222Template("fraud", {
    id: "tpl-fraud-222",
    name: "\u6B3A\u8BC8\u8BC6\u522B\u7EFC\u5408\u6A21\u578B\uFF08\u65B9\u6848222\u5907\u7528\uFF09",
    status: "\u5DF2\u542F\u7528",
    isDefault: true,
    version: "V2.6\u98CE\u63A7\u7B56\u7565\u96C6",
    lastEditor: "admin",
    lastEditTime: "2026-08-03",
    description: "\u6B3A\u8BC8\u8BC6\u522B\u5F53\u524D\u542F\u7528\u6A21\u677F\uFF1A\u6309\u4FE1\u606F\u6838\u9A8C222 \u6A21\u677F\u9A71\u52A8\u67B6\u6784\uFF0C\u4F9B \u6B3A\u8BC8\u8BC6\u522B \u5217\u8868/\u8BE6\u60C5\u9875\u4F7F\u7528\u3002",
    autoTitle: "\u6B3A\u8BC8\u8BC6\u522B\u81EA\u52A8\u5BA1\u6838\u5F97\u5206",
    manualTitle: "\u6B3A\u8BC8\u8BC6\u522B\u4EBA\u5DE5\u5BA1\u6838"
  }),
  buildBiz222Template("decision", {
    id: "tpl-decision-222",
    name: "\u8FDB\u4EF6\u5BA1\u6838\u7EFC\u5408\u6A21\u578B\uFF08\u65B9\u6848222\u5907\u7528\uFF09",
    status: "\u5DF2\u542F\u7528",
    isDefault: true,
    version: "V2.6\u98CE\u63A7\u7B56\u7565\u96C6",
    lastEditor: "admin",
    lastEditTime: "2026-08-03",
    description: "\u8FDB\u4EF6\u5BA1\u6838\u5F53\u524D\u542F\u7528\u6A21\u677F\uFF1A\u6309\u4FE1\u606F\u6838\u9A8C222 \u6A21\u677F\u9A71\u52A8\u67B6\u6784\uFF0C\u4F9B \u8FDB\u4EF6\u5BA1\u6838 \u5217\u8868/\u8BE6\u60C5\u9875\u4F7F\u7528\u3002",
    autoTitle: "\u8FDB\u4EF6\u5BA1\u6838\u81EA\u52A8\u5BA1\u6838\u5F97\u5206",
    manualTitle: "\u8FDB\u4EF6\u5BA1\u6838\u4EBA\u5DE5\u5BA1\u6838"
  })
];
if (!seedReportTemplates.find((t) => t.id === templateNull_default.id)) {
  seedReportTemplates.push(templateNull_default);
}
var IV_A = {
  view: { key: "view", label: "\u67E5\u770B", opens: "none", next: "pass_done" },
  audit: { key: "audit", label: "\u5BA1\u6279", variant: "primary", opens: "approval", auditGradeFrom: "riskScore", contexts: ["detail"], next: "pass_done" },
  reportConfirm: { key: "reportConfirm", label: "\u62A5\u544A\u786E\u8BA4", opens: "custom", contexts: ["list"], next: "pass_done" },
  forceRecheck: { key: "forceRecheck", label: "\u5F3A\u5236\u590D\u5BA1", opens: "custom", next: "reject_closed" },
  submitDual: { key: "submitDual", label: "\u63D0\u4EA4\u53CC\u4EBA\u590D\u6838", opens: "custom", next: "warn_dual" },
  confirmPass: { key: "confirmPass", label: "\u786E\u8BA4\u653E\u884C", opens: "custom", contexts: ["list"], next: "warn_done" },
  confirmReject: { key: "confirmReject", label: "\u786E\u8BA4\u62D2\u7EDD", opens: "custom", contexts: ["list"], next: "warn_done" }
};
var VERIFY_MACHINE = {
  reportType: "info_verify",
  derive: (r) => r.workStatus === "\u6838\u9A8C\u8BA1\u7B97\u4E2D" ? "calculating" : r.sysResult === "\u901A\u8FC7" ? r.workStatus === "\u5F85\u786E\u8BA4" ? "pass_pending" : "pass_done" : r.sysResult === "\u62D2\u7EDD" ? r.workStatus === "\u5F85\u786E\u8BA4" ? "reject_pending" : "reject_closed" : r.workStatus === "\u5F85\u5BA1\u6838" ? "warn_review" : r.workStatus === "\u63D0\u4EA4\u590D\u6838" ? "warn_dual" : "warn_done",
  states: [
    { id: "calculating", label: "\u6838\u9A8C\u8BA1\u7B97\u4E2D", actions: [IV_A.view] },
    { id: "pass_pending", label: "\u901A\u8FC7-\u5F85\u786E\u8BA4", actions: [IV_A.view, IV_A.audit, IV_A.reportConfirm] },
    { id: "pass_done", label: "\u901A\u8FC7-\u5DF2\u529E\u7ED3", actions: [IV_A.view] },
    { id: "reject_pending", label: "\u62D2\u7EDD-\u5F85\u786E\u8BA4", actions: [IV_A.view, IV_A.audit, IV_A.forceRecheck, IV_A.reportConfirm] },
    { id: "reject_closed", label: "\u62D2\u7EDD-\u5DF2\u529E\u7ED3", actions: [IV_A.view] },
    { id: "warn_review", label: "\u9884\u8B66-\u5F85\u5BA1\u6838", actions: [IV_A.view, IV_A.submitDual] },
    { id: "warn_dual", label: "\u9884\u8B66-\u63D0\u4EA4\u590D\u6838", actions: [IV_A.view, IV_A.audit, IV_A.confirmPass, IV_A.confirmReject] },
    { id: "warn_done", label: "\u9884\u8B66-\u5DF2\u529E\u7ED3", actions: [IV_A.view] }
  ]
};
var FRAUD_A = {
  view: { key: "view", label: "\u67E5\u770B", opens: "none", next: "closed" },
  audit: { key: "audit", label: "\u5BA1\u6279", variant: "primary", opens: "approval", auditGradeFrom: "scoreBand", contexts: ["detail"], next: "closed" },
  reportConfirm: { key: "reportConfirm", label: "\u62A5\u544A\u786E\u8BA4", opens: "custom", contexts: ["list"], next: "closed" },
  forceReview: { key: "forceReview", label: "\u5F3A\u5236\u590D\u5BA1", opens: "custom", next: "closed" },
  addBlacklist: { key: "addBlacklist", label: "\u52A0\u5165\u9ED1\u540D\u5355", opens: "custom", next: "closed" },
  submitReview: { key: "submitReview", label: "\u63D0\u4EA4\u53CC\u4EBA\u590D\u6838", opens: "custom", next: "dual" },
  note: { key: "note", label: "\u5F55\u5165\u5907\u6CE8", opens: "custom", next: "dual" },
  confirmPass: { key: "confirmPass", label: "\u786E\u8BA4\u653E\u884C", opens: "custom", contexts: ["list"], next: "done" },
  confirmReject: { key: "confirmReject", label: "\u786E\u8BA4\u62D2\u7EDD", opens: "custom", contexts: ["list"], next: "done" }
};
var FRAUD_MACHINE = {
  reportType: "fraud",
  derive: (r) => r.workStatus === "\u6838\u9A8C\u8BA1\u7B97\u4E2D" ? "calc" : r.workStatus === "\u5F85\u786E\u8BA4" ? r.scoreBand === "\u6781\u9AD8" ? "pending_black" : r.scoreBand === "\u9AD8" ? "pending_force" : "pending_confirm" : ["\u5DF2\u786E\u8BA4", "\u521D\u5BA1\u62D2\u8D37", "\u5F3A\u5236\u653E\u884C", "\u52A0\u5165\u9ED1\u540D\u5355"].includes(r.workStatus) ? "closed" : r.workStatus === "\u5F85\u5BA1\u6838" ? "review" : r.workStatus === "\u63D0\u4EA4\u590D\u6838" ? "dual" : "done",
  states: [
    { id: "calc", label: "\u6838\u9A8C\u8BA1\u7B97\u4E2D", actions: [FRAUD_A.view] },
    { id: "pending_confirm", label: "\u5F85\u786E\u8BA4-\u6781\u4F4E/\u4F4E", actions: [FRAUD_A.view, FRAUD_A.audit, FRAUD_A.reportConfirm] },
    { id: "pending_force", label: "\u5F85\u786E\u8BA4-\u9AD8", actions: [FRAUD_A.view, FRAUD_A.audit, FRAUD_A.forceReview, FRAUD_A.reportConfirm] },
    { id: "pending_black", label: "\u5F85\u786E\u8BA4-\u6781\u9AD8", actions: [FRAUD_A.view, FRAUD_A.audit, FRAUD_A.addBlacklist, FRAUD_A.reportConfirm] },
    { id: "closed", label: "\u5DF2\u529E\u7ED3", actions: [FRAUD_A.view] },
    { id: "review", label: "\u5F85\u5BA1\u6838", actions: [FRAUD_A.view, FRAUD_A.submitReview, FRAUD_A.note] },
    { id: "dual", label: "\u63D0\u4EA4\u590D\u6838", actions: [FRAUD_A.view, FRAUD_A.audit, FRAUD_A.note, FRAUD_A.confirmPass, FRAUD_A.confirmReject] },
    { id: "done", label: "\u590D\u6838\u5DF2\u529E\u7ED3", actions: [FRAUD_A.view] }
  ]
};
var CREDIT_A = {
  view: { key: "view", label: "\u67E5\u770B", opens: "none", next: "done" },
  audit: { key: "audit", label: "\u5BA1\u6279", variant: "primary", opens: "approval", auditGradeFrom: "creditScore", contexts: ["detail"], next: "done" },
  submitReview: { key: "submitReview", label: "\u63D0\u4EA4\u590D\u6838", opens: "custom", next: "dual" },
  confirmPass: { key: "confirmPass", label: "\u786E\u8BA4\u653E\u884C", opens: "custom", contexts: ["list"], next: "done" },
  confirmReject: { key: "confirmReject", label: "\u786E\u8BA4\u62D2\u7EDD", opens: "custom", contexts: ["list"], next: "done" },
  note: { key: "note", label: "\u5F55\u5165\u5907\u6CE8", opens: "custom", next: "dual" }
};
var CREDIT_MACHINE = {
  reportType: "credit",
  derive: (r) => r.sysResult === "\u5904\u7406\u4E2D" ? "calc" : r.sysResult === "\u901A\u8FC7" || r.sysResult === "\u62D2\u7EDD" ? "auto_done" : r.workStatus === "\u5F85\u5BA1\u6838" ? "review" : r.workStatus === "\u63D0\u4EA4\u590D\u6838" ? "dual" : "done",
  states: [
    { id: "calc", label: "\u5904\u7406\u4E2D", actions: [CREDIT_A.view] },
    { id: "auto_done", label: "\u81EA\u52A8\u901A\u8FC7/\u62D2\u7EDD", actions: [CREDIT_A.view] },
    { id: "review", label: "\u5F85\u5BA1\u6838", actions: [CREDIT_A.view, CREDIT_A.submitReview, CREDIT_A.note] },
    { id: "dual", label: "\u63D0\u4EA4\u590D\u6838", actions: [CREDIT_A.view, CREDIT_A.audit, CREDIT_A.confirmPass, CREDIT_A.confirmReject, CREDIT_A.note] },
    { id: "done", label: "\u590D\u6838\u5DF2\u529E\u7ED3", actions: [CREDIT_A.view] }
  ]
};
var DEC_A = {
  view: { key: "view", label: "\u67E5\u770B", opens: "none", next: "done" },
  audit: { key: "audit", label: "\u5BA1\u6279", variant: "primary", opens: "approval", auditGradeFrom: "suggestion", next: "pending" },
  submitReview: { key: "submitReview", label: "\u63D0\u4EA4\u590D\u6838", opens: "custom", next: "dual" },
  return: { key: "return", label: "\u9000\u56DE\u8865\u5145\u6750\u6599", opens: "custom", next: "done" },
  note: { key: "note", label: "\u5F55\u5165\u5907\u6CE8", opens: "custom", next: "pending" }
};
var DECISION_APPROVAL_MACHINE = {
  reportType: "decision",
  derive: (r) => ["\u5DF2\u901A\u8FC7", "\u5DF2\u62D2\u7EDD", "\u5DF2\u9000\u56DE"].includes(r.approvalStatus) ? "done" : r.approvalStatus === "\u5DF2\u63D0\u4EA4\u53CC\u4EBA\u590D\u6838" ? "dual" : "pending",
  states: [
    { id: "done", label: "\u5DF2\u529E\u7ED3", actions: [DEC_A.view] },
    { id: "dual", label: "\u53CC\u4EBA\u590D\u6838\u4E2D", actions: [DEC_A.view] },
    { id: "pending", label: "\u5F85\u5BA1\u6279", actions: [DEC_A.view, DEC_A.audit] }
  ]
};
var DEC_R = {
  view: { key: "view", label: "\u67E5\u770B", opens: "none", next: "closed" },
  reportConfirm: { key: "reportConfirm", label: "\u62A5\u544A\u786E\u8BA4", opens: "custom", next: "closed" },
  forceRecheck: { key: "forceRecheck", label: "\u5F3A\u5236\u590D\u5BA1", opens: "custom", next: "closed" },
  blacklist: { key: "blacklist", label: "\u52A0\u5165\u9ED1\u540D\u5355", opens: "custom", next: "closed" },
  submitDual: { key: "submitDual", label: "\u63D0\u4EA4\u53CC\u4EBA\u590D\u6838", opens: "custom", next: "dual" },
  note: { key: "note", label: "\u5F55\u5165\u5907\u6CE8", opens: "custom", next: "dual" },
  confirmPass: { key: "confirmPass", label: "\u786E\u8BA4\u653E\u884C", opens: "custom", next: "done" },
  confirmReject: { key: "confirmReject", label: "\u786E\u8BA4\u62D2\u7EDD", opens: "custom", next: "done" }
};
var DECISION_REVIEW_MACHINE = {
  reportType: "decision",
  derive: (r) => r.manualReview === "\u6838\u9A8C\u8BA1\u7B97\u4E2D" ? "calc" : r.manualReview === "\u5F85\u786E\u8BA4" ? r.suggestion === "\u901A\u8FC7" ? "pending_pass" : r.suggestion === "\u4E25\u683C\u9650\u5236" ? "pending_force" : "pending_black" : ["\u5DF2\u786E\u8BA4", "\u521D\u5BA1\u62D2\u8D37", "\u5F3A\u5236\u653E\u884C", "\u590D\u6838\u901A\u8FC7", "\u590D\u6838\u62D2\u7EDD", "\u52A0\u5165\u9ED1\u540D\u5355"].includes(r.manualReview) ? "closed" : r.manualReview === "\u5F85\u5BA1\u6838" ? "review" : r.manualReview === "\u63D0\u4EA4\u590D\u6838" ? "dual" : "done",
  states: [
    { id: "calc", label: "\u6838\u9A8C\u8BA1\u7B97\u4E2D", actions: [DEC_R.view] },
    { id: "pending_pass", label: "\u5F85\u786E\u8BA4-\u901A\u8FC7", actions: [DEC_R.view, DEC_R.reportConfirm] },
    { id: "pending_force", label: "\u5F85\u786E\u8BA4-\u4E25\u683C\u9650\u5236", actions: [DEC_R.view, DEC_R.reportConfirm, DEC_R.forceRecheck] },
    { id: "pending_black", label: "\u5F85\u786E\u8BA4-\u62D2\u7EDD", actions: [DEC_R.view, DEC_R.reportConfirm, DEC_R.blacklist] },
    { id: "closed", label: "\u5DF2\u529E\u7ED3", actions: [DEC_R.view] },
    { id: "review", label: "\u5F85\u5BA1\u6838", actions: [DEC_R.view, DEC_R.submitDual, DEC_R.note] },
    { id: "dual", label: "\u63D0\u4EA4\u590D\u6838", actions: [DEC_R.view, DEC_R.confirmPass, DEC_R.confirmReject, DEC_R.note] },
    { id: "done", label: "\u5DF2\u529E\u7ED3", actions: [DEC_R.view] }
  ]
};

// src/console/FlowCanvasEditor.tsx
import { Fragment as Fragment12, jsx as jsx12, jsxs as jsxs12 } from "react/jsx-runtime";
var NODE_W2 = 132;
var NODE_H2 = 52;
var CANVAS_H = 420;
var CONTENT_W = 1600;
var inp = { border: "1px solid #E5E7EB", borderRadius: 6, padding: "4px 8px", fontSize: 12, outline: "none", width: "100%" };
var SEL = "#2563EB";
var miniBtn = { padding: "3px 10px", fontSize: 12, borderRadius: 6, cursor: "pointer", background: "#fff", border: "1px solid #E5E7EB" };
var miniInp = { padding: "4px 8px", fontSize: 12, borderRadius: 6, border: "1px solid #E2E8F0", outline: "none", background: "#fff" };
var seq = 0;
var nid = () => `n_${Date.now().toString(36)}_${seq++}`;
var eid = () => `e_${Date.now().toString(36)}_${seq++}`;
var clamp = (v, min, max) => Math.max(min, Math.min(max, v));
var IconBtn = ({ title, onClick, children }) => /* @__PURE__ */ jsx12(
  "button",
  {
    title,
    onClick: (e) => {
      e.stopPropagation();
      onClick();
    },
    style: { width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, cursor: "pointer", background: "#fff", border: "1px solid #E5E7EB", color: "#475569", boxShadow: "0 1px 2px rgba(0,0,0,.06)" },
    children
  }
);
var IconZoomIn = () => /* @__PURE__ */ jsxs12("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx12("circle", { cx: "11", cy: "11", r: "7" }),
  /* @__PURE__ */ jsx12("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
  /* @__PURE__ */ jsx12("line", { x1: "11", y1: "8", x2: "11", y2: "14" }),
  /* @__PURE__ */ jsx12("line", { x1: "8", y1: "11", x2: "14", y2: "11" })
] });
var IconZoomOut = () => /* @__PURE__ */ jsxs12("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx12("circle", { cx: "11", cy: "11", r: "7" }),
  /* @__PURE__ */ jsx12("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
  /* @__PURE__ */ jsx12("line", { x1: "8", y1: "11", x2: "14", y2: "11" })
] });
var IconFit = () => /* @__PURE__ */ jsxs12("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx12("path", { d: "M4 9V5a1 1 0 0 1 1-1h4" }),
  /* @__PURE__ */ jsx12("path", { d: "M20 9V5a1 1 0 0 0-1-1h-4" }),
  /* @__PURE__ */ jsx12("path", { d: "M4 15v4a1 1 0 0 0 1 1h4" }),
  /* @__PURE__ */ jsx12("path", { d: "M20 15v4a1 1 0 0 1-1 1h-4" })
] });
var IconCenter = () => /* @__PURE__ */ jsxs12("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx12("circle", { cx: "12", cy: "12", r: "3" }),
  /* @__PURE__ */ jsx12("line", { x1: "12", y1: "2", x2: "12", y2: "6" }),
  /* @__PURE__ */ jsx12("line", { x1: "12", y1: "18", x2: "12", y2: "22" }),
  /* @__PURE__ */ jsx12("line", { x1: "2", y1: "12", x2: "6", y2: "12" }),
  /* @__PURE__ */ jsx12("line", { x1: "18", y1: "12", x2: "22", y2: "12" })
] });
var IconFull = () => /* @__PURE__ */ jsxs12("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx12("path", { d: "M8 3H5a2 2 0 0 0-2 2v3" }),
  /* @__PURE__ */ jsx12("path", { d: "M21 8V5a2 2 0 0 0-2-2h-3" }),
  /* @__PURE__ */ jsx12("path", { d: "M3 16v3a2 2 0 0 0 2 2h3" }),
  /* @__PURE__ */ jsx12("path", { d: "M16 21h3a2 2 0 0 0 2-2v-3" })
] });
function FlowCanvasEditor({ graph, onChange, readOnly, statusEnum, matchFieldOptions, defaultSteps }) {
  const canvasRef = useRef6(null);
  const contentRef = useRef6(null);
  const [selNode, setSelNode] = useState10(null);
  const [selEdge, setSelEdge] = useState10(null);
  const [linkFrom, setLinkFrom] = useState10(null);
  const dragRef = useRef6(null);
  const [customCheck, setCustomCheck] = useState10("");
  const [showCheckPresets, setShowCheckPresets] = useState10(false);
  const [propTab, setPropTab] = useState10("basic");
  const [matchOpen, setMatchOpen] = useState10(false);
  const [scale, setScale] = useState10(1);
  const [offset, setOffset] = useState10({ x: 0, y: 0 });
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const selected = selNode ? nodeMap.get(selNode) : void 0;
  const selectedEdge = selEdge ? graph.edges.find((e) => e.id === selEdge) : void 0;
  const patchNode = (id, p) => onChange({ ...graph, nodes: graph.nodes.map((n) => n.id === id ? { ...n, ...p } : n) });
  const [draft, setDraft] = useState10({ "\u901A\u8FC7": "", "\u8F6C\u4EBA\u5DE5": "", "\u62D2\u7EDD": "" });
  const patchEdge = (id, p) => onChange({ ...graph, edges: graph.edges.map((e) => e.id === id ? { ...e, ...p } : e) });
  const addNode = (type) => {
    if (readOnly) return;
    const n = {
      id: nid(),
      type,
      label: FLOW_NODE_TYPE_LABEL[type],
      x: 60 + graph.nodes.length * 40 % 400,
      y: 40 + graph.nodes.length * 60 % 280,
      role: REVIEW_ROLES[0],
      checkItems: [],
      results: ["\u901A\u8FC7", "\u8F6C\u4EBA\u5DE5", "\u62D2\u7EDD"],
      opinionPresets: { "\u901A\u8FC7": [], "\u8F6C\u4EBA\u5DE5": [], "\u62D2\u7EDD": [] }
    };
    onChange({ ...graph, nodes: [...graph.nodes, n] });
    setSelNode(n.id);
    setSelEdge(null);
  };
  const removeNode = (id) => {
    onChange({ nodes: graph.nodes.filter((n) => n.id !== id), edges: graph.edges.filter((e) => e.from !== id && e.to !== id) });
    setSelNode(null);
  };
  const removeEdge = (id) => {
    onChange({ ...graph, edges: graph.edges.filter((e) => e.id !== id) });
    setSelEdge(null);
  };
  const onNodeClick = (id) => {
    if (linkFrom) {
      if (linkFrom !== id && !graph.edges.some((e) => e.from === linkFrom && e.to === id)) {
        onChange({ ...graph, edges: [...graph.edges, { id: eid(), from: linkFrom, to: id }] });
      }
      setLinkFrom(null);
      return;
    }
    setSelNode(id);
    setSelEdge(null);
    setPropTab("basic");
  };
  const onPointerDown = (ev, n) => {
    if (readOnly || linkFrom) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const localX = (ev.clientX - rect.left - offset.x) / scale;
    const localY = (ev.clientY - rect.top - offset.y) / scale;
    dragRef.current = { id: n.id, dx: localX - n.x, dy: localY - n.y };
    ev.target.setPointerCapture(ev.pointerId);
  };
  const onPointerMove = (ev) => {
    const d = dragRef.current;
    if (!d) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (ev.clientX - rect.left - offset.x) / scale - d.dx;
    const y = (ev.clientY - rect.top - offset.y) / scale - d.dy;
    patchNode(d.id, { x: Math.round(Math.max(0, Math.min(CONTENT_W - NODE_W2, x))), y: Math.round(Math.max(0, Math.min(CANVAS_H - NODE_H2, y))) });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };
  const edgePath = (e) => {
    const a = nodeMap.get(e.from);
    const b = nodeMap.get(e.to);
    if (!a || !b) return null;
    const x1 = a.x + NODE_W2, y1 = a.y + NODE_H2 / 2, x2 = b.x, y2 = b.y + NODE_H2 / 2;
    const c = Math.max(30, Math.abs(x2 - x1) / 2);
    return { d: `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 - 8 };
  };
  const zoom = (dir) => setScale((s) => Math.max(0.4, Math.min(2.5, dir > 0 ? s * 1.15 : s / 1.15)));
  const bbox = () => {
    if (!graph.nodes.length) return { w: 0, h: 0 };
    const w = Math.max(...graph.nodes.map((n) => n.x + NODE_W2));
    const h = Math.max(...graph.nodes.map((n) => n.y + NODE_H2));
    return { w, h };
  };
  const fitView = () => {
    const el = canvasRef.current;
    if (!el || !graph.nodes.length) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      return;
    }
    const { w, h } = bbox();
    const cw = el.clientWidth, ch = CANVAS_H;
    const s = Math.min(cw / w, ch / h, 1.6);
    setScale(s);
    setOffset({ x: Math.max(0, (cw - w * s) / 2), y: Math.max(0, (ch - h * s) / 2) });
  };
  const centerView = () => {
    const el = canvasRef.current;
    if (!el || !graph.nodes.length) return;
    const { w, h } = bbox();
    const cw = el.clientWidth, ch = CANVAS_H;
    setOffset({ x: Math.max(0, (cw - w * scale) / 2), y: Math.max(0, (ch - h * scale) / 2) });
  };
  const centerOnNode = (n) => {
    const el = canvasRef.current;
    if (!el) return;
    const cw = el.clientWidth, ch = CANVAS_H;
    const cx = n.x + NODE_W2 / 2, cy = n.y + NODE_H2 / 2;
    setOffset({ x: cw / 2 - cx * scale, y: ch / 2 - cy * scale });
  };
  useEffect7(() => {
    if (selNode) {
      const n = graph.nodes.find((x) => x.id === selNode);
      if (n) centerOnNode(n);
    }
  }, [selNode]);
  const toggleFull = () => {
    const el = canvasRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };
  return /* @__PURE__ */ jsxs12("div", { style: { position: "relative" }, children: [
    /* @__PURE__ */ jsx12("datalist", { id: "statusEnumList", children: (statusEnum ?? []).map((s) => /* @__PURE__ */ jsx12("option", { value: s }, s)) }),
    /* @__PURE__ */ jsxs12("div", { style: { flex: 1, minWidth: 0 }, children: [
      /* @__PURE__ */ jsx12("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }, children: /* @__PURE__ */ jsxs12("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsx12("span", { style: { fontSize: 12, color: "#6B7280", whiteSpace: "nowrap" }, children: "\u6D41\u7A0B\u540D\u79F0" }),
        /* @__PURE__ */ jsx12(
          "input",
          {
            disabled: readOnly,
            value: graph.name ?? "",
            onChange: (e) => onChange({ ...graph, name: e.target.value }),
            placeholder: "\u5982 \u786E\u8BA4\u901A\u8FC7 / \u8F6C\u4EBA\u5DE5\u5BA1\u6838",
            style: { ...inp, width: 200 }
          }
        )
      ] }) }),
      matchFieldOptions && !readOnly && /* @__PURE__ */ jsxs12("div", { style: { border: "1px solid #E5E7EB", borderRadius: 8, background: "#FAFBFE", marginBottom: 8, overflow: "hidden" }, children: [
        /* @__PURE__ */ jsxs12("div", { onClick: () => setMatchOpen((v) => !v), style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", cursor: "pointer", userSelect: "none" }, children: [
          /* @__PURE__ */ jsx12("span", { style: { transform: matchOpen ? "rotate(90deg)" : "none", transition: "transform .15s", fontSize: 10, color: "#9CA3AF" }, children: "\u25B6" }),
          /* @__PURE__ */ jsx12("span", { style: { fontSize: 12, fontWeight: 600, color: "#374151" }, children: "\u5173\u8054\u5B57\u6BB5\u4E0E\u72B6\u6001\u673A" }),
          /* @__PURE__ */ jsxs12("span", { style: { fontSize: 11, color: "#9CA3AF" }, children: [
            "\u53EF\u9009 \xB7 \u4E0D\u5173\u8054 = \u8BE5\u9875\u9762\u6240\u6709\u6570\u636E\u90FD\u8D70\u672C\u6D41\u7A0B \xB7 \u5DF2\u914D ",
            (graph.match ?? []).length,
            " \u6761\u5173\u8054 / ",
            (graph.flowSteps ?? []).length,
            " \u4E2A\u72B6\u6001\u8282\u70B9"
          ] })
        ] }),
        matchOpen && /* @__PURE__ */ jsxs12("div", { style: { padding: "0 10px 10px", borderTop: "1px solid #EEF2F7" }, children: [
          /* @__PURE__ */ jsxs12("div", { style: { fontSize: 12, fontWeight: 600, color: "#374151", margin: "10px 0 4px" }, children: [
            "\u5173\u8054\u5B57\u6BB5",
            /* @__PURE__ */ jsx12("span", { style: { fontWeight: 400, fontSize: 11, color: "#9CA3AF" }, children: "\u6309\u300C\u5B57\u6BB5 = \u503C\u300D\u5339\u914D\u6570\u636E\u5230\u672C\u6D41\u7A0B\uFF1B\u503C\u652F\u6301\u9017\u53F7\u5206\u9694\u591A\u9009" })
          ] }),
          (graph.match ?? []).length === 0 && /* @__PURE__ */ jsx12("div", { style: { fontSize: 11, color: "#9CA3AF", marginBottom: 4 }, children: "\uFF08\u672A\u5173\u8054\u5B57\u6BB5\uFF1A\u9875\u9762\u6240\u6709\u6570\u636E\u90FD\u5173\u8054\u672C\u6D41\u7A0B\uFF09" }),
          (graph.match ?? []).map((m, i) => /* @__PURE__ */ jsxs12("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxs12("select", { value: m.field, onChange: (e) => {
              const arr = [...graph.match ?? []];
              arr[i] = { ...arr[i], field: e.target.value };
              onChange({ ...graph, match: arr });
            }, style: { ...inp, width: 150 }, children: [
              /* @__PURE__ */ jsx12("option", { value: "", children: "\u9009\u62E9\u5B57\u6BB5" }),
              matchFieldOptions.map((o) => /* @__PURE__ */ jsx12("option", { value: o.field, children: o.label }, o.field))
            ] }),
            /* @__PURE__ */ jsx12(
              "input",
              {
                value: m.value,
                placeholder: "\u503C\uFF08\u5982 RED / \u8D1F\u503A\u6FC0\u589E\uFF0C\u9017\u53F7\u5206\u9694\u591A\u9009\uFF09",
                onChange: (e) => {
                  const arr = [...graph.match ?? []];
                  arr[i] = { ...arr[i], value: e.target.value };
                  onChange({ ...graph, match: arr });
                },
                style: { ...inp, width: 240 }
              }
            ),
            /* @__PURE__ */ jsx12(
              "button",
              {
                onClick: () => onChange({ ...graph, match: (graph.match ?? []).filter((_, k) => k !== i) }),
                style: { ...miniBtn, borderColor: "#FCA5A5", color: "#DC2626" },
                children: "\u5220\u9664"
              }
            )
          ] }, i)),
          /* @__PURE__ */ jsx12(
            "button",
            {
              onClick: () => onChange({ ...graph, match: [...graph.match ?? [], { field: matchFieldOptions[0]?.field ?? "", value: "" }] }),
              style: { ...miniBtn, borderColor: SEL, color: SEL, marginTop: 2 },
              children: "\uFF0B \u6DFB\u52A0\u5173\u8054\u6761\u4EF6"
            }
          ),
          /* @__PURE__ */ jsxs12("div", { style: { fontSize: 12, fontWeight: 600, color: "#374151", margin: "12px 0 4px" }, children: [
            "\u72B6\u6001\u673A\uFF08\u672C\u6D41\u7A0B\u72EC\u7ACB \xB7 \u65B0\u5EFA\u9ED8\u8BA4\u4E09\u4E2A\u8282\u70B9\uFF09",
            /* @__PURE__ */ jsx12("span", { style: { fontWeight: 400, fontSize: 11, color: "#9CA3AF" }, children: "\u6BCF\u4E2A\u8282\u70B9\uFF1A\u72B6\u6001\u540D / \u64CD\u4F5C\u6309\u94AE\uFF08\u65F6\u9650\u5728\u8282\u70B9\u5C5E\u6027\u9762\u677F\u914D\u7F6E\uFF09" })
          ] }),
          (graph.flowSteps ?? []).length === 0 && /* @__PURE__ */ jsxs12("div", { style: { fontSize: 11, color: "#9CA3AF", marginBottom: 4 }, children: [
            "\uFF08\u672A\u914D\u7F6E\u72EC\u7ACB\u72B6\u6001\u673A\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u4E09\u8282\u70B9\uFF1A\u5F85\u5904\u7406 \u2192 \u5904\u7406\u4E2D \u2192 \u5DF2\u5904\u7406\uFF09",
            defaultSteps && /* @__PURE__ */ jsx12(
              "button",
              {
                onClick: () => onChange({ ...graph, flowSteps: defaultSteps.map((s) => ({ ...s })) }),
                style: { ...miniBtn, borderColor: SEL, color: SEL, marginLeft: 8 },
                children: "\u7528\u9ED8\u8BA4\u4E09\u8282\u70B9"
              }
            )
          ] }),
          (graph.flowSteps ?? []).map((s, i) => /* @__PURE__ */ jsxs12("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsx12("span", { style: { fontSize: 11, color: "#94A3B8", width: 14 }, children: i + 1 }),
            /* @__PURE__ */ jsx12(
              "input",
              {
                value: s.state ?? "",
                placeholder: "\u72B6\u6001\u540D",
                onChange: (e) => {
                  const arr = [...graph.flowSteps ?? []];
                  arr[i] = { ...arr[i], state: e.target.value };
                  onChange({ ...graph, flowSteps: arr });
                },
                style: { ...miniInp, width: 130 }
              }
            ),
            /* @__PURE__ */ jsx12("span", { style: { color: "#CBD5E1" }, children: "\u2192" }),
            /* @__PURE__ */ jsx12(
              "input",
              {
                value: s.action ?? "",
                placeholder: "\u64CD\u4F5C\u6309\u94AE\uFF08\u7EC8\u6001\u7559\u7A7A\uFF09",
                onChange: (e) => {
                  const arr = [...graph.flowSteps ?? []];
                  arr[i] = { ...arr[i], action: e.target.value };
                  onChange({ ...graph, flowSteps: arr });
                },
                style: { ...miniInp, width: 110 }
              }
            ),
            /* @__PURE__ */ jsx12(
              "button",
              {
                onClick: () => onChange({ ...graph, flowSteps: (graph.flowSteps ?? []).filter((_, k) => k !== i) }),
                style: { ...miniBtn, borderColor: "#FCA5A5", color: "#DC2626" },
                children: "\u5220\u9664"
              }
            )
          ] }, i)),
          /* @__PURE__ */ jsx12(
            "button",
            {
              onClick: () => onChange({ ...graph, flowSteps: [...graph.flowSteps ?? [], { state: "", action: "", timeLimit: void 0 }] }),
              style: { ...miniBtn, borderColor: SEL, color: SEL },
              children: "\uFF0B \u6DFB\u52A0\u8282\u70B9"
            }
          ),
          /* @__PURE__ */ jsx12("span", { style: { marginLeft: 8, fontSize: 11, color: "#9CA3AF" }, children: "\u72B6\u6001\u6309 \u5F85\u2192\u6A59 / \u4E2D\u2192\u84DD / \u5DF2\u2192\u7EFF \u81EA\u52A8\u914D\u8272" })
        ] })
      ] }),
      !readOnly && /* @__PURE__ */ jsxs12("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }, children: [
        ["start", "normal", "end"].map((t) => /* @__PURE__ */ jsxs12(
          "button",
          {
            onClick: () => addNode(t),
            style: { padding: "4px 10px", fontSize: 12, borderRadius: 6, cursor: "pointer", background: FLOW_NODE_TYPE_COLOR[t].bg, border: `1px solid ${FLOW_NODE_TYPE_COLOR[t].border}`, color: FLOW_NODE_TYPE_COLOR[t].text },
            children: [
              "\uFF0B ",
              FLOW_NODE_TYPE_LABEL[t]
            ]
          },
          t
        )),
        /* @__PURE__ */ jsx12("span", { style: { flex: 1 } }),
        linkFrom ? /* @__PURE__ */ jsxs12("span", { style: { fontSize: 12, color: "#1D4ED8" }, children: [
          "\u8FDE\u7EBF\u6A21\u5F0F\uFF1A\u70B9\u51FB\u76EE\u6807\u8282\u70B9\u5B8C\u6210\uFF0C",
          /* @__PURE__ */ jsx12("a", { style: { cursor: "pointer", textDecoration: "underline" }, onClick: () => setLinkFrom(null), children: "\u53D6\u6D88" })
        ] }) : /* @__PURE__ */ jsx12("span", { style: { fontSize: 12, color: "#9CA3AF" }, children: "\u62D6\u52A8\u8282\u70B9\u8C03\u6574\u4F4D\u7F6E\uFF1B\u70B9\u8282\u70B9\u53F3\u4FA7 \u25CF \u5F00\u59CB\u8FDE\u7EBF" })
      ] }),
      /* @__PURE__ */ jsxs12(
        "div",
        {
          ref: canvasRef,
          onPointerMove,
          onPointerUp,
          onClick: (e) => {
            if (e.target === canvasRef.current || e.target === contentRef.current) {
              setSelNode(null);
              setSelEdge(null);
              setLinkFrom(null);
            }
          },
          style: { position: "relative", height: CANVAS_H, border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden", cursor: linkFrom ? "crosshair" : "default", background: "#FBFCFE" },
          children: [
            /* @__PURE__ */ jsxs12(
              "div",
              {
                ref: contentRef,
                style: { position: "absolute", top: 0, left: 0, width: CONTENT_W, height: CANVAS_H, transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: "0 0", backgroundImage: "radial-gradient(#E2E8F0 1px, transparent 1px)", backgroundSize: "16px 16px" },
                children: [
                  /* @__PURE__ */ jsxs12("svg", { style: { position: "absolute", inset: 0, width: CONTENT_W, height: CANVAS_H, pointerEvents: "none" }, children: [
                    /* @__PURE__ */ jsxs12("defs", { children: [
                      /* @__PURE__ */ jsx12("marker", { id: "fc-arrow", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse", children: /* @__PURE__ */ jsx12("path", { d: "M1 1L9 5L1 9", fill: "none", stroke: "#94A3B8", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }),
                      /* @__PURE__ */ jsx12("marker", { id: "fc-arrow-sel", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse", children: /* @__PURE__ */ jsx12("path", { d: "M1 1L9 5L1 9", fill: "none", stroke: "#2563EB", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })
                    ] }),
                    graph.edges.map((e) => {
                      const p = edgePath(e);
                      if (!p) return null;
                      const sel = e.id === selEdge;
                      return /* @__PURE__ */ jsxs12("g", { children: [
                        /* @__PURE__ */ jsx12(
                          "path",
                          {
                            d: p.d,
                            fill: "none",
                            stroke: "transparent",
                            strokeWidth: "12",
                            style: { pointerEvents: "stroke", cursor: "pointer" },
                            onClick: (ev) => {
                              ev.stopPropagation();
                              setSelEdge(e.id);
                              setSelNode(null);
                            }
                          }
                        ),
                        /* @__PURE__ */ jsx12("path", { d: p.d, fill: "none", stroke: sel ? "#2563EB" : "#94A3B8", strokeWidth: sel ? 2 : 1.5, markerEnd: sel ? "url(#fc-arrow-sel)" : "url(#fc-arrow)" }),
                        e.label && /* @__PURE__ */ jsx12("text", { x: p.mx, y: p.my, textAnchor: "middle", fontSize: "11", fill: sel ? "#2563EB" : "#64748B", style: { paintOrder: "stroke", stroke: "#FBFCFE", strokeWidth: 3 }, children: e.label }),
                        e.result && /* @__PURE__ */ jsxs12("text", { x: p.mx, y: (p.my ?? 0) + 13, textAnchor: "middle", fontSize: "10", fill: sel ? "#DB2777" : "#BE185D", style: { paintOrder: "stroke", stroke: "#FBFCFE", strokeWidth: 3 }, children: [
                          "if ",
                          e.result
                        ] })
                      ] }, e.id);
                    })
                  ] }),
                  graph.nodes.map((n) => {
                    const c = FLOW_NODE_TYPE_COLOR[n.type];
                    const sel = n.id === selNode;
                    const linkable = !!linkFrom && linkFrom !== n.id;
                    return /* @__PURE__ */ jsxs12(
                      "div",
                      {
                        onPointerDown: (ev) => onPointerDown(ev, n),
                        onClick: (ev) => {
                          ev.stopPropagation();
                          onNodeClick(n.id);
                        },
                        style: { position: "absolute", left: n.x, top: n.y, width: NODE_W2, height: NODE_H2, borderRadius: 8, background: c.bg, border: `${sel || linkable ? 2 : 1}px solid ${linkable ? "#2563EB" : sel ? c.border : c.border + "99"}`, boxShadow: sel ? "0 2px 8px rgba(37,99,235,.18)" : "0 1px 2px rgba(0,0,0,.05)", cursor: readOnly ? "default" : "grab", userSelect: "none", padding: "7px 10px", boxSizing: "border-box" },
                        children: [
                          /* @__PURE__ */ jsx12("div", { style: { fontSize: 12, fontWeight: 600, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: n.label }),
                          /* @__PURE__ */ jsxs12("div", { style: { fontSize: 11, color: c.text, opacity: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
                            FLOW_NODE_TYPE_LABEL[n.type],
                            n.role ? ` \xB7 ${n.role}` : "",
                            n.buttonName ? ` \xB7 \u6309\u94AE\u300C${n.buttonName}\u300D` : "",
                            n.type !== "end" && n.results && n.results.length ? n.resultStates ? " \u27F6 \u7ED3\u679C\u6620\u5C04" : "" : n.postState ? ` \u2192 ${n.postState}` : ""
                          ] }),
                          !readOnly && n.type !== "end" && /* @__PURE__ */ jsx12(
                            "div",
                            {
                              onClick: (ev) => {
                                ev.stopPropagation();
                                setLinkFrom(n.id);
                                setSelNode(null);
                                setSelEdge(null);
                              },
                              title: "\u4ECE\u6B64\u8282\u70B9\u8FDE\u7EBF",
                              style: { position: "absolute", right: -7, top: NODE_H2 / 2 - 7, width: 14, height: 14, borderRadius: 999, background: linkFrom === n.id ? "#2563EB" : "#fff", border: "2px solid #2563EB", cursor: "crosshair" }
                            }
                          )
                        ]
                      },
                      n.id
                    );
                  })
                ]
              }
            ),
            /* @__PURE__ */ jsxs12("div", { onClick: (e) => e.stopPropagation(), style: { position: "absolute", top: 10, right: 10, zIndex: 5, display: "flex", flexDirection: "column", gap: 6 }, children: [
              /* @__PURE__ */ jsx12(IconBtn, { title: "\u653E\u5927", onClick: () => zoom(1), children: /* @__PURE__ */ jsx12(IconZoomIn, {}) }),
              /* @__PURE__ */ jsx12(IconBtn, { title: "\u7F29\u5C0F", onClick: () => zoom(-1), children: /* @__PURE__ */ jsx12(IconZoomOut, {}) }),
              /* @__PURE__ */ jsx12(IconBtn, { title: "\u5168\u753B\u5E45\uFF08\u9002\u5E94\u5185\u5BB9\uFF09", onClick: fitView, children: /* @__PURE__ */ jsx12(IconFit, {}) }),
              /* @__PURE__ */ jsx12(IconBtn, { title: "\u5C45\u4E2D", onClick: centerView, children: /* @__PURE__ */ jsx12(IconCenter, {}) }),
              /* @__PURE__ */ jsx12(IconBtn, { title: "\u5168\u5C4F", onClick: toggleFull, children: /* @__PURE__ */ jsx12(IconFull, {}) })
            ] }),
            selected && (() => {
              const n = selected;
              const W = 360;
              const ch = canvasRef.current?.clientHeight ?? CANVAS_H;
              const tabs = n.type === "end" ? [{ key: "basic", label: "\u57FA\u7840" }] : [
                { key: "basic", label: "\u57FA\u7840" },
                { key: "check", label: "\u5BA1\u6838\u4E8B\u9879" },
                { key: "review", label: "\u5BA1\u6279\u7ED3\u679C" }
              ];
              return /* @__PURE__ */ jsxs12("div", { onClick: (e) => e.stopPropagation(), style: { position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: W, maxHeight: ch - 24, zIndex: 20, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.12)", display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
                /* @__PURE__ */ jsxs12("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderBottom: "1px solid #E5E7EB", flexShrink: 0 }, children: [
                  /* @__PURE__ */ jsxs12("div", { children: [
                    /* @__PURE__ */ jsx12("div", { style: { fontSize: 13, fontWeight: 600, color: FLOW_NODE_TYPE_COLOR[n.type].text }, children: "\u8282\u70B9\u5C5E\u6027" }),
                    /* @__PURE__ */ jsxs12("div", { style: { fontSize: 11, color: "#9CA3AF" }, children: [
                      FLOW_NODE_TYPE_LABEL[n.type],
                      " \xB7 ",
                      n.label,
                      n.role ? ` \xB7 ${n.role}` : ""
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx12("button", { onClick: (e) => {
                    e.stopPropagation();
                    setSelNode(null);
                    setSelEdge(null);
                  }, style: { border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 16, lineHeight: 1 }, children: "\xD7" })
                ] }),
                tabs.length > 1 && /* @__PURE__ */ jsx12("div", { style: { display: "flex", gap: 2, padding: "0 8px", borderBottom: "1px solid #E5E7EB", flexShrink: 0 }, children: tabs.map((t) => /* @__PURE__ */ jsx12("button", { type: "button", onClick: () => setPropTab(t.key), style: { border: "none", background: "transparent", padding: "9px 10px", fontSize: 12, cursor: "pointer", color: propTab === t.key ? "#2563EB" : "#64748B", borderBottom: propTab === t.key ? "2px solid #2563EB" : "2px solid transparent", marginBottom: -1, fontWeight: propTab === t.key ? 600 : 400 }, children: t.label }, t.key)) }),
                /* @__PURE__ */ jsxs12("div", { style: { flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }, children: [
                  propTab === "basic" && (n.type === "end" ? /* @__PURE__ */ jsxs12(Fragment12, { children: [
                    /* @__PURE__ */ jsxs12("div", { style: { fontSize: 12, color: "#6B7280", lineHeight: 1.7, background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 6, padding: "8px 10px" }, children: [
                      "\u7ED3\u675F\u8282\u70B9\u7684\u72B6\u6001",
                      /* @__PURE__ */ jsx12("span", { style: { color: "#DC2626" }, children: "\u65E0\u9700\u5728\u6B64\u914D\u7F6E" }),
                      "\u3002",
                      /* @__PURE__ */ jsx12("br", {}),
                      "\u6700\u7EC8\u72B6\u6001\u7531",
                      /* @__PURE__ */ jsx12("span", { style: { color: "#1D4ED8", fontWeight: 600 }, children: "\u4E0A\u4E00\u51B3\u7B56\u8282\u70B9" }),
                      "\u7684\u300C\u5BA1\u6279\u7ED3\u679C \u2192 \u72B6\u6001\u300D\u6620\u5C04\uFF08resultStates\uFF09\u6D3E\u751F\uFF0C\u6D41\u7A0B\u8D70\u5230\u6B64\u5904\u5373\u843D\u5730\u8BE5\u72B6\u6001\u3002"
                    ] }),
                    /* @__PURE__ */ jsxs12("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151", cursor: readOnly ? "default" : "pointer" }, children: [
                      /* @__PURE__ */ jsx12(
                        "input",
                        {
                          type: "checkbox",
                          disabled: readOnly,
                          checked: n.showButton ?? false,
                          onChange: (e) => patchNode(n.id, { showButton: e.target.checked })
                        }
                      ),
                      "\u7EE7\u7EED\u663E\u793A\u6309\u94AE\uFF08\u5728\u7ED3\u675F\u72B6\u6001\u5C55\u793A\u64CD\u4F5C\u6309\u94AE\uFF09"
                    ] })
                  ] }) : /* @__PURE__ */ jsxs12(Fragment12, { children: [
                    /* @__PURE__ */ jsxs12("label", { style: { fontSize: 12, color: "#6B7280" }, children: [
                      "\u8282\u70B9\u6807\u9898\uFF08\u753B\u5E03\u663E\u793A\uFF09",
                      /* @__PURE__ */ jsx12("input", { disabled: readOnly, value: n.label, onChange: (e) => patchNode(n.id, { label: e.target.value }), style: { ...inp, marginTop: 4 } })
                    ] }),
                    /* @__PURE__ */ jsxs12("label", { style: { fontSize: 12, color: "#6B7280" }, children: [
                      "\u6309\u94AE\u540D\u79F0\uFF08\u8FD0\u884C\u65F6\u64CD\u4F5C\u6309\u94AE\u6587\u6848\uFF09",
                      /* @__PURE__ */ jsx12("input", { disabled: readOnly, value: n.buttonName ?? "", onChange: (e) => patchNode(n.id, { buttonName: e.target.value }), placeholder: n.label || "\u7F3A\u7701\u540C\u8282\u70B9\u6807\u9898", style: { ...inp, marginTop: 4 } })
                    ] }),
                    /* @__PURE__ */ jsxs12("label", { style: { fontSize: 12, color: "#6B7280" }, children: [
                      "\u65F6\u9650\u5012\u8BA1\u65F6\uFF08\u5206\u949F\uFF0C\u7A7A = \u4E0D\u9650\u5236\uFF09",
                      /* @__PURE__ */ jsx12(
                        "input",
                        {
                          type: "number",
                          min: 0,
                          disabled: readOnly,
                          value: n.timeLimit ?? "",
                          onChange: (e) => patchNode(n.id, { timeLimit: e.target.value === "" ? void 0 : Math.max(0, Number(e.target.value)) }),
                          placeholder: "\u5982 30 / 120",
                          style: { ...inp, marginTop: 4 }
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs12("label", { style: { fontSize: 12, color: "#6B7280" }, children: [
                      "\u7ECF\u529E\u89D2\u8272",
                      /* @__PURE__ */ jsx12("select", { disabled: readOnly, value: n.role, onChange: (e) => patchNode(n.id, { role: e.target.value }), style: { ...inp, marginTop: 4 }, children: REVIEW_ROLES.map((r) => /* @__PURE__ */ jsx12("option", { value: r, children: r }, r)) })
                    ] }),
                    /* @__PURE__ */ jsxs12("label", { style: { fontSize: 12, color: "#6B7280" }, children: [
                      "\u9644\u6CE8",
                      /* @__PURE__ */ jsx12("input", { disabled: readOnly, value: n.note ?? "", onChange: (e) => patchNode(n.id, { note: e.target.value }), placeholder: "\u9009\u586B", style: { ...inp, marginTop: 4 } })
                    ] })
                  ] })),
                  propTab === "check" && /* @__PURE__ */ jsxs12("div", { style: { fontSize: 12, color: "#6B7280" }, children: [
                    "\u5F39\u51FA\u5185\u5BB9 \xB7 \u5BA1\u6838\u4E8B\u9879",
                    /* @__PURE__ */ jsxs12("div", { style: { marginTop: 4, border: "1px solid #E5E7EB", borderRadius: 6, padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4, maxHeight: 260, overflowY: "auto" }, children: [
                      (n.checkItems ?? []).length === 0 ? /* @__PURE__ */ jsx12("span", { style: { fontSize: 11, color: "#9CA3AF" }, children: "\uFF08\u9ED8\u8BA4\u65E0\u5BA1\u6838\u4E8B\u9879\uFF0C\u6DFB\u52A0\u540E\u751F\u6210\u6807\u7B7E\uFF09" }) : (n.checkItems ?? []).map((it) => /* @__PURE__ */ jsxs12("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, fontSize: 12, color: "#374151", background: "#F1F5F9", borderRadius: 4, padding: "2px 6px" }, children: [
                        /* @__PURE__ */ jsx12("span", { children: it }),
                        !readOnly && /* @__PURE__ */ jsx12("button", { onClick: () => patchNode(n.id, { checkItems: (n.checkItems ?? []).filter((x) => x !== it) }), style: { border: "none", background: "transparent", color: "#DC2626", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 0 }, children: "\xD7" })
                      ] }, it)),
                      showCheckPresets && /* @__PURE__ */ jsx12("div", { style: { borderTop: "1px dashed #E5E7EB", marginTop: 2, paddingTop: 4, display: "flex", flexDirection: "column", gap: 2 }, children: REVIEW_CHECK_ITEMS.map((it) => /* @__PURE__ */ jsxs12("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151", cursor: readOnly ? "default" : "pointer" }, children: [
                        /* @__PURE__ */ jsx12(
                          "input",
                          {
                            type: "checkbox",
                            disabled: readOnly,
                            checked: (n.checkItems ?? []).includes(it),
                            onChange: (e) => patchNode(n.id, { checkItems: e.target.checked ? [...n.checkItems ?? [], it] : (n.checkItems ?? []).filter((x) => x !== it) })
                          }
                        ),
                        it
                      ] }, it)) })
                    ] }),
                    !readOnly && /* @__PURE__ */ jsxs12("div", { style: { display: "flex", gap: 6, marginTop: 4 }, children: [
                      /* @__PURE__ */ jsx12("input", { value: customCheck, onChange: (e) => setCustomCheck(e.target.value), placeholder: "\u81EA\u5B9A\u4E49\u5BA1\u6838\u4E8B\u9879", style: { ...inp, flex: 1 } }),
                      /* @__PURE__ */ jsx12("button", { onClick: () => {
                        const v = customCheck.trim();
                        if (v && !(n.checkItems ?? []).includes(v)) patchNode(n.id, { checkItems: [...n.checkItems ?? [], v] });
                        setCustomCheck("");
                      }, style: { border: "1px solid #E5E7EB", borderRadius: 6, padding: "4px", fontSize: 12, background: "#fff", cursor: "pointer" }, children: "\u6DFB\u52A0" }),
                      /* @__PURE__ */ jsx12("button", { onClick: () => setShowCheckPresets((v) => !v), style: { border: "1px solid #E5E7EB", borderRadius: 6, padding: "4px 10px", fontSize: 12, background: "#fff", cursor: "pointer", whiteSpace: "nowrap" }, children: showCheckPresets ? "\u6536\u8D77\u9884\u8BBE" : "\u4ECE\u9884\u8BBE\u9009\u62E9" })
                    ] })
                  ] }),
                  propTab === "review" && /* @__PURE__ */ jsxs12("div", { style: { border: "1px solid #E5E7EB", borderRadius: 8, padding: 10, background: "#F9FAFB" }, children: [
                    /* @__PURE__ */ jsx12("div", { style: { fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }, children: "\u5BA1\u6279\u7ED3\u679C \u2192 \u72B6\u6001\u6620\u5C04\u4E0E\u9ED8\u8BA4\u610F\u89C1\uFF08\u9A71\u52A8\u8FD0\u884C\u65F6\u5DE5\u5355\u72B6\u6001\uFF1B\u610F\u89C1\u53EF\u5728\u8FD0\u884C\u65F6\u4FEE\u6539\uFF09" }),
                    /* @__PURE__ */ jsx12("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: REVIEW_RESULTS.map((r) => {
                      const on = (n.results ?? REVIEW_RESULTS).includes(r);
                      const presets = n.opinionPresets ?? defaultOpinionPresets();
                      const list = presets[r] ?? [];
                      return /* @__PURE__ */ jsxs12("div", { style: { borderTop: "1px dashed #E5E7EB", paddingTop: 8 }, children: [
                        /* @__PURE__ */ jsxs12("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                          /* @__PURE__ */ jsx12(
                            "input",
                            {
                              type: "checkbox",
                              disabled: readOnly,
                              checked: on,
                              onChange: (e) => {
                                const cur = n.results ?? REVIEW_RESULTS;
                                patchNode(n.id, { results: e.target.checked ? [...cur, r] : cur.filter((x) => x !== r) });
                              }
                            }
                          ),
                          /* @__PURE__ */ jsx12("span", { style: { width: 42, fontSize: 12, color: "#374151", fontWeight: 600 }, children: r }),
                          /* @__PURE__ */ jsx12("span", { style: { color: "#9CA3AF" }, children: "\u2192" }),
                          /* @__PURE__ */ jsx12(
                            "input",
                            {
                              disabled: readOnly,
                              value: n.resultStates?.[r] ?? "",
                              onChange: (e) => patchNode(n.id, { resultStates: { ...n.resultStates ?? {}, [r]: e.target.value } }),
                              placeholder: "\u64CD\u4F5C\u540E\u72B6\u6001",
                              list: "statusEnumList",
                              style: { ...inp, flex: 1 }
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxs12("div", { style: { marginTop: 6 }, children: [
                          /* @__PURE__ */ jsx12("div", { style: { fontSize: 11, color: "#6B7280", marginBottom: 3 }, children: "\u9ED8\u8BA4\u5BA1\u6279\u610F\u89C1\uFF08\u8FD0\u884C\u65F6\u53EF\u4FEE\u6539\uFF09" }),
                          /* @__PURE__ */ jsx12("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 }, children: list.length === 0 ? /* @__PURE__ */ jsx12("span", { style: { fontSize: 11, color: "#9CA3AF" }, children: "\uFF08\u9ED8\u8BA4\u65E0\uFF0C\u8FD0\u884C\u65F6\u518D\u586B\u5199\uFF09" }) : list.map((o) => /* @__PURE__ */ jsxs12("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, background: "#F1F5F9", borderRadius: 12, padding: "2px 8px", color: "#374151" }, children: [
                            o,
                            !readOnly && /* @__PURE__ */ jsx12("button", { onClick: () => {
                              const next = list.filter((x) => x !== o);
                              patchNode(n.id, { opinionPresets: { ...presets, [r]: next } });
                            }, style: { border: "none", background: "transparent", color: "#DC2626", cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 0 }, children: "\xD7" })
                          ] }, o)) }),
                          !readOnly && /* @__PURE__ */ jsxs12("div", { style: { display: "flex", gap: 4, marginTop: 4 }, children: [
                            /* @__PURE__ */ jsx12("input", { value: draft[r] ?? "", onChange: (e) => setDraft((d) => ({ ...d, [r]: e.target.value })), placeholder: `\u6DFB\u52A0\u300C${r}\u300D\u9ED8\u8BA4\u610F\u89C1`, style: { ...inp, flex: 1 } }),
                            /* @__PURE__ */ jsx12("button", { onClick: () => {
                              const v = (draft[r] ?? "").trim();
                              if (v && !list.includes(v)) patchNode(n.id, { opinionPresets: { ...presets, [r]: [...list, v] } });
                              setDraft((d) => ({ ...d, [r]: "" }));
                            }, style: { border: "1px solid #E5E7EB", borderRadius: 6, padding: "4px 10px", fontSize: 12, background: "#fff", cursor: "pointer" }, children: "\u6DFB\u52A0" })
                          ] })
                        ] })
                      ] }, r);
                    }) }),
                    !(n.results ?? REVIEW_RESULTS).length && /* @__PURE__ */ jsx12("div", { style: { marginTop: 8 }, children: /* @__PURE__ */ jsxs12("label", { style: { fontSize: 12, color: "#6B7280" }, children: [
                      "\u64CD\u4F5C\u540E\u7684\u72B6\u6001\uFF08\u672A\u52FE\u9009\u4EFB\u4F55\u5BA1\u6279\u7ED3\u679C\uFF0C\u53D6\u81EA\u72B6\u6001\u679A\u4E3E\u7C7B\uFF09",
                      /* @__PURE__ */ jsx12("input", { disabled: readOnly, value: n.postState ?? "", onChange: (e) => patchNode(n.id, { postState: e.target.value }), placeholder: "\u5982 \u901A\u8FC7 / \u5DF2\u786E\u8BA4 / \u5F85\u4EBA\u5DE5", list: "statusEnumList", style: { ...inp, marginTop: 4 } })
                    ] }) }),
                    /* @__PURE__ */ jsx12("div", { style: { marginTop: 4, fontSize: 11, color: "#9CA3AF" }, children: "\u52FE\u9009\u5373\u8BE5\u7ED3\u679C\u53EF\u9009\uFF1B\u53D6\u503C\u6765\u81EA\u672C\u5206\u6BB5\u300C\u72B6\u6001\u679A\u4E3E\u7C7B\u300D\uFF1B\u8FD0\u884C\u65F6\u6309\u6240\u9009\u5BA1\u6279\u7ED3\u679C\u843D\u5730\u5BF9\u5E94\u72B6\u6001\uFF0C\u5E76\u53EF\u5728\u5BA1\u6279\u65F6\u4FEE\u6539\u9ED8\u8BA4\u610F\u89C1\u3002" })
                  ] })
                ] }),
                !readOnly && n.type !== "start" && /* @__PURE__ */ jsx12("div", { style: { padding: 12, borderTop: "1px solid #E5E7EB", flexShrink: 0 }, children: /* @__PURE__ */ jsx12("button", { onClick: () => removeNode(n.id), style: { width: "100%", padding: "6px 0", fontSize: 12, borderRadius: 6, cursor: "pointer", background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }, children: "\u5220\u9664\u8282\u70B9\uFF08\u542B\u5173\u8054\u8FDE\u7EBF\uFF09" }) })
              ] });
            })(),
            selectedEdge && (() => {
              const a = nodeMap.get(selectedEdge.from), b = nodeMap.get(selectedEdge.to);
              const mx = a && b ? (a.x + NODE_W2 / 2 + b.x + NODE_W2 / 2) / 2 : 400;
              const my = a && b ? (a.y + NODE_H2 / 2 + b.y + NODE_H2 / 2) / 2 : 200;
              const sx = offset.x + mx * scale, sy = offset.y + my * scale;
              const cw = canvasRef.current?.clientWidth ?? 800, ch = CANVAS_H, W = 282;
              const px = clamp(sx + 14, 8, Math.max(8, cw - W - 8));
              const py = clamp(sy - 60, 8, Math.max(8, ch - 300));
              return /* @__PURE__ */ jsxs12("div", { onClick: (e) => e.stopPropagation(), style: { position: "absolute", left: px, top: py, width: W, zIndex: 20, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.12)", padding: 12, maxHeight: ch - 16, overflowY: "auto" }, children: [
                /* @__PURE__ */ jsxs12("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }, children: [
                  /* @__PURE__ */ jsx12("div", { style: { fontSize: 13, fontWeight: 600, color: "#1D4ED8" }, children: "\u8FDE\u7EBF\u5C5E\u6027" }),
                  /* @__PURE__ */ jsx12("button", { onClick: (e) => {
                    e.stopPropagation();
                    setSelEdge(null);
                    setSelNode(null);
                  }, style: { border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 16, lineHeight: 1 }, children: "\xD7" })
                ] }),
                /* @__PURE__ */ jsxs12("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
                  /* @__PURE__ */ jsxs12("div", { style: { fontSize: 12, color: "#6B7280" }, children: [
                    nodeMap.get(selectedEdge.from)?.label ?? "?",
                    " \u2192 ",
                    nodeMap.get(selectedEdge.to)?.label ?? "?"
                  ] }),
                  /* @__PURE__ */ jsxs12("label", { style: { fontSize: 12, color: "#6B7280" }, children: [
                    "\u8FDE\u7EBF\u6807\u7B7E",
                    /* @__PURE__ */ jsx12("input", { disabled: readOnly, value: selectedEdge.label ?? "", onChange: (e) => patchEdge(selectedEdge.id, { label: e.target.value }), placeholder: "\u5982\uFF1A\u901A\u8FC7 / \u62D2\u7EDD / \u9000\u56DE", style: { ...inp, marginTop: 4 } })
                  ] }),
                  /* @__PURE__ */ jsxs12("label", { style: { fontSize: 12, color: "#6B7280" }, children: [
                    "\u6D41\u8F6C\u6761\u4EF6\uFF08if\uFF09\u2014\u2014 \u8D77\u70B9\u5BA1\u6279\u7ED3\u679C\u7B49\u4E8E\u6B64\u503C\u65F6\u8D70\u8BE5\u7EBF\uFF1B\u65E0\u6761\u4EF6\u5219\u4F5C\u4E3A\u515C\u5E95",
                    /* @__PURE__ */ jsxs12("select", { disabled: readOnly, value: selectedEdge.result ?? "", onChange: (e) => patchEdge(selectedEdge.id, { result: e.target.value || void 0 }), style: { ...inp, marginTop: 4 }, children: [
                      /* @__PURE__ */ jsx12("option", { value: "", children: "\u65E0\u6761\u4EF6\uFF08\u515C\u5E95\uFF09" }),
                      REVIEW_RESULTS.map((r) => /* @__PURE__ */ jsxs12("option", { value: r, children: [
                        "\u5BA1\u6279\u7ED3\u679C = ",
                        r
                      ] }, r))
                    ] }),
                    /* @__PURE__ */ jsx12("span", { style: { display: "block", fontSize: 11, color: "#9CA3AF", marginTop: 3 }, children: "\u4F8B\uFF1A\u590D\u5BA1\u8282\u70B9\u51FA\u4E24\u6761\u7EBF \u2014\u2014 \u300C\u901A\u8FC7\u300D\u6761\u4EF6\u7EBF \u2192 \u4E0B\u4E00\u5BA1\u6838\u8282\u70B9\uFF1B\u300C\u62D2\u7EDD\u300D\u6761\u4EF6\u7EBF \u2192 \u7ED3\u675F\uFF08\u62D2\u7EDD\uFF09\u3002\u8FD0\u884C\u65F6\u6309\u5BA1\u6279\u7ED3\u679C\u9009\u7EBF\u3002" })
                  ] }),
                  !readOnly && /* @__PURE__ */ jsx12("button", { onClick: () => removeEdge(selectedEdge.id), style: { padding: "5px 0", fontSize: 12, borderRadius: 6, cursor: "pointer", background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }, children: "\u5220\u9664\u8FDE\u7EBF" })
                ] })
              ] });
            })(),
            !selected && !selectedEdge && !readOnly && /* @__PURE__ */ jsx12("div", { style: { position: "absolute", left: 12, bottom: 12, fontSize: 12, color: "#9CA3AF", background: "rgba(255,255,255,.82)", padding: "4px 8px", borderRadius: 6, pointerEvents: "none" }, children: "\u70B9\u51FB\u8282\u70B9 / \u8FDE\u7EBF\u67E5\u770B\u4E0E\u7F16\u8F91\u5C5E\u6027" })
          ]
        }
      )
    ] })
  ] });
}

// src/console/flowStore.ts
import { useSyncExternalStore as useSyncExternalStore4 } from "react";

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
var version3 = 0;
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
var listeners4 = /* @__PURE__ */ new Set();
function subscribe3(fn) {
  listeners4.add(fn);
  return () => {
    listeners4.delete(fn);
  };
}
function getSnapshot() {
  return version3;
}
function useFlowsVersion() {
  return useSyncExternalStore4(subscribe3, getSnapshot);
}
function useFlows() {
  useFlowsVersion();
  return flows;
}
function getFlowsByPage(pageRoute) {
  return flows.filter((f) => f.pageRoute === pageRoute || f.pageRoutes?.includes(pageRoute));
}
function getFlowById(id) {
  return flows.find((f) => f.id === id);
}

// src/console/ScoreModelDetail.tsx
import { Fragment as Fragment13, jsx as jsx13, jsxs as jsxs13 } from "react/jsx-runtime";
var MODEL_COLOR2 = {
  zhicha: "#ef4444",
  zhixin: "#22c55e",
  zhirong: "#8b5cf6"
};
var PSI_KIND = { \u7A33\u5B9A: "green", \u4E34\u754C: "amber", \u504F\u79FB: "red" };
var DETAIL_TABS = [
  { key: "base", label: "\u57FA\u672C\u4FE1\u606F" },
  { key: "algo", label: "\u7B97\u6CD5\u7F16\u8F91" },
  { key: "effect", label: "\u6A21\u578B\u6548\u679C" },
  { key: "threshold", label: "\u8BC4\u5206\u9608\u503C" }
];
function levelKind2(level) {
  if (level.includes("\u4F4E") || level === "A") return "green";
  if (level.includes("\u4E2D") || level === "B") return "blue";
  if (level.includes("\u9AD8") || level === "C") return "amber";
  if (level === "D") return "red";
  return "gray";
}
function ScoreModelDetailPage() {
  const data2 = useScore();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const prod = params.get("prod") ?? "zhicha";
  const m = data2.models.find((x) => x.prod === prod) ?? data2.models[0];
  const color = MODEL_COLOR2[m.prod];
  const tabParam = params.get("tab");
  const [tab, setTab] = useState11(
    DETAIL_TABS.some((t) => t.key === tabParam) ? tabParam : "base"
  );
  useEffect8(() => {
    if (tabParam && DETAIL_TABS.some((t) => t.key === tabParam)) setTab(tabParam);
  }, [tabParam]);
  const [infoOpen, setInfoOpen] = useState11(false);
  const [info, setInfo] = useState11({
    name: m.name,
    version: m.version,
    algoType: m.algoType,
    enabled: m.enabled,
    range0: m.range[0],
    range1: m.range[1]
  });
  useEffect8(() => {
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
  const [onlineOpen, setOnlineOpen] = useState11(false);
  const [onlineVer, setOnlineVer] = useState11(m.version);
  const [onlineNote, setOnlineNote] = useState11("");
  const [algoTab, setAlgoTab] = useState11("visual");
  const [code, setCode] = useState11(m.algoCode);
  useEffect8(() => {
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
        return v.current ? /* @__PURE__ */ jsx13("span", { className: "text-xs text-slate-300", children: "\u2014" }) : /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "ghost", onClick: () => rollback(ver), children: "\u56DE\u6EDA" });
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
  const flows2 = useFlows();
  const flowName = (id) => flows2.find((f) => f.id === id)?.name ?? "\u672A\u5173\u8054";
  const [thEditId, setThEditId] = useState11(null);
  const [thAction, setThAction] = useState11("");
  const [thBizOpen, setThBizOpen] = useState11(null);
  const [thBizId, setThBizId] = useState11("");
  const [thSelId, setThSelId] = useState11(null);
  const [thNewOpen, setThNewOpen] = useState11(false);
  const [thDraft, setThDraft] = useState11({ range: "", level: "", meaning: "", action: "", bizFlowId: "" });
  const thKey = (t) => `${t.prod}|${t.range}|${t.level}`;
  const thRows = data2.thresholds.filter((t) => t.prod === prod).map((t) => ({
    id: thKey(t),
    range: t.range,
    level: { v: t.level, kind: levelKind2(t.level) },
    meaning: t.meaning,
    action: t.action,
    bizFlowId: t.bizFlowId ?? ""
  }));
  const thCols = [
    { key: "range", label: "\u5206\u6570\u533A\u95F4", width: "150px" },
    { key: "level", label: "\u7B49\u7EA7", type: "badge", badgeKind: "gray", width: "90px" },
    { key: "meaning", label: "\u542B\u4E49", width: "200px" },
    {
      key: "bizFlow",
      label: "\u9884\u8B66\u5904\u7F6E\u6D41\u7A0B",
      width: "200px",
      render: (r) => {
        const id = r.id;
        const cur = r.bizFlowId || "";
        if (thBizOpen === id) {
          return /* @__PURE__ */ jsxs13(
            "select",
            {
              value: thBizId,
              onChange: (e) => {
                const v = e.target.value;
                setThBizId(v);
                updateScore((d) => ({ ...d, thresholds: d.thresholds.map((t) => thKey(t) === id ? { ...t, bizFlowId: v } : t) }));
                setThBizOpen(null);
              },
              className: "w-full rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400",
              children: [
                /* @__PURE__ */ jsx13("option", { value: "", children: "\u672A\u5173\u8054" }),
                flows2.map((f) => /* @__PURE__ */ jsx13("option", { value: f.id, children: f.name }, f.id))
              ]
            }
          );
        }
        return /* @__PURE__ */ jsx13("button", { className: "text-left text-sm text-brand-600 hover:underline", onClick: () => {
          setThBizOpen(id);
          setThBizId(cur);
        }, children: cur ? flowName(cur) : "\uFF0B \u5173\u8054\u6D41\u7A0B" });
      }
    },
    {
      key: "action",
      label: "\u5EFA\u8BAE\u52A8\u4F5C",
      render: (r) => {
        const id = r.id;
        if (thEditId === id) {
          return /* @__PURE__ */ jsxs13("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx13(
              "input",
              {
                value: thAction,
                onChange: (e) => setThAction(e.target.value),
                className: "w-40 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400"
              }
            ),
            /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "primary", onClick: () => {
              updateScore((d) => ({ ...d, thresholds: d.thresholds.map((t) => thKey(t) === id ? { ...t, action: thAction } : t) }));
              setThEditId(null);
            }, children: "\u4FDD\u5B58" }),
            /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "ghost", onClick: () => setThEditId(null), children: "\u53D6\u6D88" })
          ] });
        }
        return /* @__PURE__ */ jsxs13("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx13("span", { className: "text-sm", children: r.action }),
          /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "ghost", onClick: () => {
            const [p, range, level] = id.split("|");
            const t = data2.thresholds.find((x) => x.prod === p && x.range === range && x.level === level);
            setThAction(t.action);
            setThEditId(id);
          }, children: "\u7F16\u8F91" })
        ] });
      }
    },
    {
      key: "flowPrev",
      label: "\u5904\u7F6E\u6D41\u7A0B",
      width: "96px",
      render: (r) => {
        const t = data2.thresholds.find((x) => thKey(x) === r.id);
        if (!t?.bizFlowId) return /* @__PURE__ */ jsx13("span", { className: "text-xs text-slate-300", children: "\u2014" });
        return /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "ghost", onClick: () => setThSelId(r.id), children: "\u67E5\u770B" });
      }
    }
  ];
  const confirmThNew = () => {
    const range = thDraft.range.trim();
    const level = thDraft.level.trim();
    if (!range || !level) return;
    updateScore((d) => ({ ...d, thresholds: [...d.thresholds, { prod, range, level, meaning: thDraft.meaning.trim(), action: thDraft.action.trim(), bizFlowId: thDraft.bizFlowId || void 0 }] }));
    setThNewOpen(false);
  };
  const selThreshold = data2.thresholds.find((t) => thKey(t) === thSelId) ?? null;
  const selFlow = selThreshold?.bizFlowId ? getFlowById(selThreshold.bizFlowId) : void 0;
  const PROD_SCENE = { zhicha: "\u53CD\u6B3A\u8BC8\u76D1\u6D4B", zhixin: "\u8D37\u4E2D\u98CE\u63A7", zhirong: "\u8D37\u540E\u50AC\u6536" };
  const midAlerts = useMidAlerts();
  const relatedAlerts = midAlerts.filter((a) => a.scene === PROD_SCENE[prod]);
  const [alOpen, setAlOpen] = useState11(false);
  const [alForm, setAlForm] = useState11({ cust_name: "", alert_type: "\u8D1F\u503A\u6FC0\u589E", level: "RED", rule_name: "", metric_value: 0, threshold: 0, flowKey: "" });
  const addAlert = () => {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    updateAlerts((list) => [...list, {
      alert_id: midNewId("AL"),
      cust_id: "C" + String(Math.floor(Math.random() * 9e3) + 1e3),
      cust_name: alForm.cust_name || "\u672A\u77E5\u5BA2\u6237",
      scene: PROD_SCENE[prod],
      alert_type: alForm.alert_type,
      level: alForm.level,
      alert_date: today,
      rule_name: alForm.rule_name || "\u81EA\u5B9A\u4E49\u89C4\u5219",
      metric_value: Number(alForm.metric_value) || 0,
      threshold: Number(alForm.threshold) || 0,
      flowKey: alForm.flowKey || void 0
    }]);
    setAlForm({ cust_name: "", alert_type: "\u8D1F\u503A\u6FC0\u589E", level: "RED", rule_name: "", metric_value: 0, threshold: 0, flowKey: "" });
    setAlOpen(false);
  };
  const alCols = [
    { key: "alert_id", label: "\u9884\u8B66\u7F16\u53F7", width: "130px" },
    { key: "cust_name", label: "\u5BA2\u6237", width: "110px" },
    { key: "alert_type", label: "\u7C7B\u578B", width: "130px" },
    { key: "level", label: "\u7B49\u7EA7", type: "badge", badgeKind: "gray", width: "90px" },
    { key: "rule_name", label: "\u547D\u4E2D\u89C4\u5219" },
    { key: "flowState", label: "\u5904\u7F6E\u72B6\u6001", width: "130px" }
  ];
  const alRows = relatedAlerts.map((a) => ({
    id: a.alert_id,
    alert_id: a.alert_id,
    cust_name: a.cust_name,
    alert_type: a.alert_type,
    level: { v: a.level === "RED" ? "\u7EA2" : a.level === "YELLOW" ? "\u9EC4" : "\u673A\u4F1A", kind: a.level === "RED" ? "red" : a.level === "YELLOW" ? "amber" : "blue" },
    rule_name: a.rule_name,
    flowState: a.flowState ?? "\u2014"
  }));
  const ops = data2.ops.find((x) => x.prod === prod);
  return /* @__PURE__ */ jsxs13(Fragment13, { children: [
    /* @__PURE__ */ jsx13(
      PageShell,
      {
        title: m.name,
        subtitle: `${SCORE_PROD_LABEL[m.prod]} \xB7 \u6A21\u578B\u8BE6\u60C5\uFF08\u57FA\u672C\u4FE1\u606F / \u7B97\u6CD5\u7F16\u8F91 / \u6A21\u578B\u6548\u679C / \u8BC4\u5206\u9608\u503C / \u7248\u672C\u65E5\u5FD7\uFF09`,
        crumb: "\u8BC4\u5206\u4EA7\u54C1 / \u6A21\u578B\u7BA1\u7406",
        actions: /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "secondary", onClick: () => nav("/console/sc/model-manage"), children: "\u2190 \u8FD4\u56DE\u6A21\u578B\u5217\u8868" })
      }
    ),
    /* @__PURE__ */ jsxs13("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx13("div", { className: "flex flex-wrap gap-1 border-b border-slate-100 pb-2", children: DETAIL_TABS.map((t) => /* @__PURE__ */ jsx13(
        "button",
        {
          onClick: () => setTab(t.key),
          className: `rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${tab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`,
          children: t.label
        },
        t.key
      )) }),
      tab === "base" && /* @__PURE__ */ jsxs13(Fragment13, { children: [
        /* @__PURE__ */ jsx13(
          Panel,
          {
            title: "\u57FA\u672C\u4FE1\u606F",
            desc: infoOpen ? "\u7F16\u8F91\u540E\u70B9\u51FB\u4FDD\u5B58" : "\u70B9\u51FB\u300C\u5C55\u5F00\u7F16\u8F91\u300D\u4FEE\u6539\u6A21\u578B\u4FE1\u606F",
            actions: infoOpen ? /* @__PURE__ */ jsxs13("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "primary", onClick: saveInfo, children: "\u4FDD\u5B58" }),
              /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "ghost", onClick: () => setInfoOpen(false), children: "\u6536\u8D77" })
            ] }) : /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "ghost", onClick: openInfo, children: "\u5C55\u5F00\u7F16\u8F91" }),
            children: infoOpen ? /* @__PURE__ */ jsxs13("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
              /* @__PURE__ */ jsx13(Field, { label: "\u6A21\u578B\u540D\u79F0", children: /* @__PURE__ */ jsx13("input", { className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400", value: info.name, onChange: (e) => setInfo({ ...info, name: e.target.value }) }) }),
              /* @__PURE__ */ jsx13(Field, { label: "\u7B97\u6CD5\u7C7B\u578B", children: /* @__PURE__ */ jsx13("input", { className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400", value: info.algoType, onChange: (e) => setInfo({ ...info, algoType: e.target.value }) }) }),
              /* @__PURE__ */ jsx13(Field, { label: "\u7248\u672C", children: /* @__PURE__ */ jsx13("input", { className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400", value: info.version, onChange: (e) => setInfo({ ...info, version: e.target.value }) }) }),
              /* @__PURE__ */ jsx13(Field, { label: "\u5206\u6570\u533A\u95F4", children: /* @__PURE__ */ jsxs13("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx13("input", { className: "w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400", value: info.range0, onChange: (e) => setInfo({ ...info, range0: e.target.value }) }),
                /* @__PURE__ */ jsx13("span", { className: "text-slate-400", children: "\u2013" }),
                /* @__PURE__ */ jsx13("input", { className: "w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400", value: info.range1, onChange: (e) => setInfo({ ...info, range1: e.target.value }) })
              ] }) }),
              /* @__PURE__ */ jsx13(Field, { label: "\u542F\u7528\u72B6\u6001", children: /* @__PURE__ */ jsx13(
                "button",
                {
                  onClick: () => setInfo({ ...info, enabled: !info.enabled }),
                  className: `rounded-lg px-3 py-1.5 text-sm font-medium ${info.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`,
                  children: info.enabled ? "\u5DF2\u542F\u7528\uFF08\u70B9\u51FB\u505C\u7528\uFF09" : "\u5DF2\u505C\u7528\uFF08\u70B9\u51FB\u542F\u7528\uFF09"
                }
              ) })
            ] }) : /* @__PURE__ */ jsxs13("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: [
              /* @__PURE__ */ jsxs13("div", { children: [
                /* @__PURE__ */ jsx13("div", { className: "text-xs text-slate-400", children: "\u5F53\u524D\u5F97\u5206" }),
                /* @__PURE__ */ jsx13("div", { className: "text-2xl font-bold tabular-nums", style: { color }, children: m.score })
              ] }),
              /* @__PURE__ */ jsxs13("div", { children: [
                /* @__PURE__ */ jsx13("div", { className: "text-xs text-slate-400", children: "\u5206\u6570\u533A\u95F4" }),
                /* @__PURE__ */ jsxs13("div", { className: "mt-1 text-sm", children: [
                  m.range[0],
                  " \u2013 ",
                  m.range[1]
                ] })
              ] }),
              /* @__PURE__ */ jsxs13("div", { children: [
                /* @__PURE__ */ jsx13("div", { className: "text-xs text-slate-400", children: "\u7248\u672C" }),
                /* @__PURE__ */ jsx13("div", { className: "mt-1 text-sm", children: m.version })
              ] }),
              /* @__PURE__ */ jsxs13("div", { children: [
                /* @__PURE__ */ jsx13("div", { className: "text-xs text-slate-400", children: "\u66F4\u65B0\u65F6\u95F4" }),
                /* @__PURE__ */ jsx13("div", { className: "mt-1 text-sm", children: m.updatedAt })
              ] }),
              /* @__PURE__ */ jsxs13("div", { className: "col-span-2 md:col-span-4 flex items-center gap-3", children: [
                /* @__PURE__ */ jsx13(Badge, { kind: m.enabled ? "green" : "gray", children: m.enabled ? "\u5DF2\u542F\u7528" : "\u5DF2\u505C\u7528" }),
                /* @__PURE__ */ jsx13("span", { className: "text-sm text-slate-500", children: m.algoType })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsx13(
          Panel,
          {
            title: "\u4E0A\u7EBF\u7BA1\u7406",
            desc: "\u6A21\u578B\u6295\u4EA7\u4E0E\u4E0B\u7EBF\u63A7\u5236\uFF1B\u4E0A\u7EBF\u65F6\u53EF\u6307\u5B9A\u7248\u672C\u4E0E\u53D8\u66F4\u5185\u5BB9\uFF0C\u81EA\u52A8\u8BB0\u5165\u7248\u672C\u65E5\u5FD7",
            actions: /* @__PURE__ */ jsx13(Cfg, { value: "scoreData.json" }),
            children: /* @__PURE__ */ jsxs13("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsx13(Badge, { kind: m.enabled ? "green" : "gray", children: m.enabled ? "\u5DF2\u4E0A\u7EBF" : "\u5DF2\u4E0B\u7EBF" }),
              /* @__PURE__ */ jsxs13("span", { className: "text-sm text-slate-500", children: [
                "\u5F53\u524D\u7248\u672C ",
                m.version
              ] }),
              /* @__PURE__ */ jsx13("div", { className: "flex-1" }),
              m.enabled ? /* @__PURE__ */ jsx13(
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
              ) : /* @__PURE__ */ jsx13(
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
        /* @__PURE__ */ jsx13(Panel, { title: "\u90E8\u7F72\u4E0E\u5BF9\u63A5", desc: "\u6A21\u578B\u751F\u4EA7\u5316\u5BF9\u63A5\u65B9\u5F0F\uFF08\u53EA\u8BFB\uFF09", actions: /* @__PURE__ */ jsx13(Cal, {}), children: /* @__PURE__ */ jsxs13("dl", { className: "grid grid-cols-1 gap-x-8 gap-y-2 text-sm md:grid-cols-2", children: [
          /* @__PURE__ */ jsx13(Def, { k: "\u670D\u52A1\u5730\u5740", v: `POST /api/score/${m.prod}` }),
          /* @__PURE__ */ jsx13(Def, { k: "\u8C03\u7528\u65B9\u5F0F", v: "\u5B9E\u65F6 API / \u6279\u91CF\u6587\u4EF6" }),
          /* @__PURE__ */ jsx13(Def, { k: "\u7248\u672C\u6807\u8BC6", v: "\u8BF7\u6C42\u5934 x-model-version" }),
          /* @__PURE__ */ jsx13(Def, { k: "\u7070\u5EA6\u53D1\u5E03", v: "\u51A0\u519B / \u6311\u6218\u8005\uFF08Champion-Challenger\uFF09" }),
          /* @__PURE__ */ jsx13(Def, { k: "\u76D1\u63A7\u6307\u6807", v: `PSI \u2265 0.25 \u89E6\u53D1\u81EA\u52A8\u56DE\u6EDA` }),
          /* @__PURE__ */ jsx13(Def, { k: "\u5F53\u524D\u7EBF\u4E0A\u7248\u672C", v: current?.version ?? "\u2014" })
        ] }) }),
        /* @__PURE__ */ jsx13(Panel, { title: "\u7248\u672C\u65E5\u5FD7", desc: "\u672C\u6A21\u578B\u7248\u672C\u5386\u53F2\uFF0C\u53EF\u56DE\u6EDA\u81F3\u5386\u53F2\u7248\u672C", actions: /* @__PURE__ */ jsx13(Cfg, { value: "scoreData.json" }), children: /* @__PURE__ */ jsx13(DataTable, { columns: verCols, rows: verRows, empty: "\u6682\u65E0\u7248\u672C", pager: true, defaultPageSize: 10 }) })
      ] }),
      tab === "algo" && /* ===== 算法编辑 ===== */
      /* @__PURE__ */ jsxs13(
        Panel,
        {
          title: "\u7B97\u6CD5\u7F16\u8F91",
          desc: "\u4EE5\u300C\u53EF\u89C6\u5316\u300D\u67E5\u770B\u672C\u6A21\u578B\u771F\u5B9E\u8BA1\u7B97\u94FE\u8DEF\uFF08\u6570\u636E\u6E90 \u2192 \u7B97\u6CD5\u4E0E\u56E0\u5B50 \u2192 \u89C4\u5219\u96C6 \u2192 \u8F93\u51FA\u5206\u6570 \u2192 \u51B3\u7B56\u6620\u5C04\uFF09\uFF0C\u6216\u4EE5\u300C\u4EE3\u7801\u300D\u67E5\u770B\u6A21\u578B\u7B97\u6CD5\uFF08Model-as-Code\uFF09",
          actions: /* @__PURE__ */ jsxs13("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx13(Button, { size: "sm", variant: algoTab === "visual" ? "primary" : "secondary", onClick: () => setAlgoTab("visual"), children: "\u53EF\u89C6\u5316" }),
            /* @__PURE__ */ jsx13(Button, { size: "sm", variant: algoTab === "code" ? "primary" : "secondary", onClick: () => setAlgoTab("code"), children: "\u4EE3\u7801" })
          ] }),
          children: [
            algoTab === "visual" ? /* @__PURE__ */ jsx13("div", { children: /* @__PURE__ */ jsx13(
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
            ) }) : /* @__PURE__ */ jsxs13("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs13("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs13("span", { className: "text-xs text-slate-400", children: [
                  m.name,
                  " \xB7 \u7B97\u6CD5\u4EE3\u7801\uFF08Python\uFF09"
                ] }),
                /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "primary", onClick: saveCode, children: "\u4FDD\u5B58\u4EE3\u7801" })
              ] }),
              /* @__PURE__ */ jsx13(
                "textarea",
                {
                  value: code,
                  onChange: (e) => setCode(e.target.value),
                  spellCheck: false,
                  className: "h-72 w-full rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100 outline-none focus:border-brand-400"
                }
              )
            ] }),
            /* @__PURE__ */ jsx13("div", { className: "mt-3", children: /* @__PURE__ */ jsx13(Cfg, { value: "scoreData.json" }) })
          ]
        }
      ),
      tab === "effect" && /* ===== 模型效果（本模型） ===== */
      /* @__PURE__ */ jsxs13(Fragment13, { children: [
        /* @__PURE__ */ jsxs13(Panel, { title: "\u6A21\u578B\u6548\u679C", desc: `${SCORE_PROD_LABEL[prod]} \xB7 \u8FD0\u8425\u6548\u679C\u6307\u6807\u4E0E 6 \u4E2A\u6708\u8D8B\u52BF\uFF08\u5355\u6A21\u578B\u89C6\u89D2\uFF1B\u4E09\u6A21\u578B\u6A2A\u5411\u5BF9\u6BD4\u89C1\u300C\u6A21\u578B\u6548\u679C\u300D\u9875\uFF09`, actions: /* @__PURE__ */ jsxs13(Fragment13, { children: [
          /* @__PURE__ */ jsx13(Cal, {}),
          /* @__PURE__ */ jsx13(Sam, { value: "scoreData.json" })
        ] }), children: [
          /* @__PURE__ */ jsxs13("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: [
            /* @__PURE__ */ jsxs13("div", { children: [
              /* @__PURE__ */ jsx13("div", { className: "text-xs text-slate-400", children: "\u8BC4\u5206\u8986\u76D6\u7387" }),
              /* @__PURE__ */ jsxs13("div", { className: "text-2xl font-bold tabular-nums", style: { color }, children: [
                ops.coverage,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs13("div", { children: [
              /* @__PURE__ */ jsx13("div", { className: "text-xs text-slate-400", children: "\u9884\u8B66\u51C6\u786E\u7387" }),
              /* @__PURE__ */ jsxs13("div", { className: "text-2xl font-bold tabular-nums", style: { color }, children: [
                ops.accuracy,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs13("div", { children: [
              /* @__PURE__ */ jsx13("div", { className: "text-xs text-slate-400", children: "\u5904\u7F6E\u53CA\u65F6\u7387" }),
              /* @__PURE__ */ jsxs13("div", { className: "text-2xl font-bold tabular-nums", style: { color }, children: [
                ops.timely,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs13("div", { children: [
              /* @__PURE__ */ jsx13("div", { className: "text-xs text-slate-400", children: "\u672C\u6708\u8C03\u7528" }),
              /* @__PURE__ */ jsx13("div", { className: "text-2xl font-bold tabular-nums", style: { color }, children: ops.calls.toLocaleString() })
            ] })
          ] }),
          /* @__PURE__ */ jsxs13("div", { className: "mt-4 flex items-center gap-2 border-t border-slate-100 pt-3", children: [
            /* @__PURE__ */ jsx13("span", { className: "text-xs text-slate-500", children: "PSI" }),
            /* @__PURE__ */ jsxs13(Badge, { kind: PSI_KIND[ops.psiStatus], children: [
              ops.psi,
              " \xB7 ",
              ops.psiStatus
            ] }),
            /* @__PURE__ */ jsx13("span", { className: "text-xs text-slate-400", children: "PSI \u2265 0.25 \u89E6\u53D1\u6F02\u79FB\u9884\u8B66" }),
            /* @__PURE__ */ jsx13("div", { className: "flex-1" }),
            /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "ghost", onClick: () => nav("/console/sc/model-effect"), children: "\u67E5\u770B\u4E09\u6A21\u578B\u5BF9\u6BD4 \u2192" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs13("div", { className: "grid gap-4 lg:grid-cols-2", children: [
          /* @__PURE__ */ jsx13(Panel, { title: "\u8986\u76D6\u7387 / \u51C6\u786E\u7387\u8D8B\u52BF", actions: /* @__PURE__ */ jsx13(Cal, {}), children: /* @__PURE__ */ jsx13(
            LineChart,
            {
              labels: ops.trend.map((t) => t.month),
              series: [
                { name: "\u8986\u76D6\u7387", color: MODEL_COLOR2[prod], data: ops.trend.map((t) => t.coverage) },
                { name: "\u51C6\u786E\u7387", color: "#3b82f6", data: ops.trend.map((t) => t.accuracy) }
              ],
              unit: "%",
              height: 220
            }
          ) }),
          /* @__PURE__ */ jsx13(Panel, { title: "\u53CA\u65F6\u7387 / \u8C03\u7528\u91CF\u8D8B\u52BF", actions: /* @__PURE__ */ jsx13(Cal, {}), children: /* @__PURE__ */ jsx13(
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
      tab === "threshold" && /* @__PURE__ */ jsxs13("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs13(
          Panel,
          {
            title: `\u8BC4\u5206\u9608\u503C\u914D\u7F6E \xB7 ${SCORE_PROD_LABEL[prod]}`,
            desc: "\u5206\u503C\u5206\u533A \u2192 \u7B49\u7EA7 \u2192 \u542B\u4E49 \u2192 \u5EFA\u8BAE\u52A8\u4F5C \u2192 \u5173\u8054\u9884\u8B66\u5904\u7F6E\u6D41\u7A0B\uFF08\u672C\u6A21\u578B\u8F93\u51FA\u6620\u5C04\uFF0C\u968F\u6A21\u578B\u7BA1\u7406\uFF09",
            actions: /* @__PURE__ */ jsxs13(Fragment13, { children: [
              /* @__PURE__ */ jsx13(Cfg, { value: "scoreData.json" }),
              /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "primary", onClick: () => {
                setThDraft({ range: "", level: "", meaning: "", action: "", bizFlowId: "" });
                setThNewOpen(true);
              }, children: "\u65B0\u589E\u9608\u503C" })
            ] }),
            children: [
              /* @__PURE__ */ jsx13(DataTable, { columns: thCols, rows: thRows, empty: "\u6682\u65E0\u9608\u503C", pager: true, defaultPageSize: 10 }),
              selFlow?.flowGraphs?.[0] && /* @__PURE__ */ jsxs13("div", { className: "mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3", children: [
                /* @__PURE__ */ jsxs13("div", { className: "mb-2 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs13("span", { className: "text-sm font-medium text-slate-700", children: [
                    "\u5904\u7F6E\u6D41\u7A0B\u9884\u89C8\uFF1A",
                    selFlow.name
                  ] }),
                  /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "ghost", onClick: () => setThSelId(null), children: "\u6536\u8D77" })
                ] }),
                /* @__PURE__ */ jsx13(FlowCanvasEditor, { graph: selFlow.flowGraphs[0], readOnly: true })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx13(
          Panel,
          {
            title: "\u5173\u8054\u9884\u8B66\uFF08\u9884\u8B66\u5E73\u53F0\uFF09",
            desc: `\u672C\u6A21\u578B\u7684\u9884\u8B66\u7EDF\u4E00\u6765\u6E90\u4E8E\u9884\u8B66\u5E73\u53F0 midAlerts\uFF08\u573A\u666F\uFF1A${PROD_SCENE[prod]}\uFF09\uFF0C\u6A21\u578B\u7BA1\u7406\u4EC5\u4F5C\u7F16\u8F91\u5165\u53E3`,
            actions: /* @__PURE__ */ jsxs13(Fragment13, { children: [
              /* @__PURE__ */ jsx13(Cfg, { value: "midAlerts.json" }),
              /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "primary", onClick: () => setAlOpen(true), children: "\u65B0\u589E\u9884\u8B66" })
            ] }),
            children: /* @__PURE__ */ jsx13(DataTable, { columns: alCols, rows: alRows, empty: "\u6682\u65E0\u5173\u8054\u9884\u8B66", pager: true, defaultPageSize: 10 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs13(Modal, { open: onlineOpen, onClose: () => setOnlineOpen(false), title: `\u4E0A\u7EBF \xB7 ${SCORE_PROD_LABEL[prod]}`, children: [
      /* @__PURE__ */ jsxs13("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs13("label", { className: "block", children: [
          /* @__PURE__ */ jsx13("span", { className: "mb-1 block text-xs text-slate-400", children: "\u4E0A\u7EBF\u7248\u672C" }),
          /* @__PURE__ */ jsx13(
            "input",
            {
              value: onlineVer,
              onChange: (e) => setOnlineVer(e.target.value),
              placeholder: "\u5982 v2.3.1",
              className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs13("label", { className: "block", children: [
          /* @__PURE__ */ jsx13("span", { className: "mb-1 block text-xs text-slate-400", children: "\u53D8\u66F4\u5185\u5BB9" }),
          /* @__PURE__ */ jsx13(
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
      /* @__PURE__ */ jsxs13("div", { className: "mt-4 flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "ghost", onClick: () => setOnlineOpen(false), children: "\u53D6\u6D88" }),
        /* @__PURE__ */ jsx13(
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
    /* @__PURE__ */ jsxs13(Modal, { open: thNewOpen, onClose: () => setThNewOpen(false), title: `\u65B0\u589E\u9608\u503C \xB7 ${SCORE_PROD_LABEL[prod]}`, children: [
      /* @__PURE__ */ jsxs13("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs13("label", { className: "block", children: [
          /* @__PURE__ */ jsx13("span", { className: "mb-1 block text-xs text-slate-400", children: "\u5206\u6570\u533A\u95F4\uFF08\u5982 0-40 / 41-69\uFF09" }),
          /* @__PURE__ */ jsx13(
            "input",
            {
              value: thDraft.range,
              onChange: (e) => setThDraft({ ...thDraft, range: e.target.value }),
              placeholder: "0-40",
              className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs13("label", { className: "block", children: [
          /* @__PURE__ */ jsx13("span", { className: "mb-1 block text-xs text-slate-400", children: "\u7B49\u7EA7\uFF08\u5982 \u9AD8 / \u4E2D / \u4F4E \u6216 A-E\uFF09" }),
          /* @__PURE__ */ jsx13(
            "input",
            {
              value: thDraft.level,
              onChange: (e) => setThDraft({ ...thDraft, level: e.target.value }),
              placeholder: "\u9AD8",
              className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs13("label", { className: "block", children: [
          /* @__PURE__ */ jsx13("span", { className: "mb-1 block text-xs text-slate-400", children: "\u542B\u4E49" }),
          /* @__PURE__ */ jsx13(
            "input",
            {
              value: thDraft.meaning,
              onChange: (e) => setThDraft({ ...thDraft, meaning: e.target.value }),
              placeholder: "\u6B3A\u8BC8\u98CE\u9669\u6781\u9AD8\uFF0C\u76F4\u63A5\u62D2\u7EDD",
              className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs13("label", { className: "block", children: [
          /* @__PURE__ */ jsx13("span", { className: "mb-1 block text-xs text-slate-400", children: "\u5EFA\u8BAE\u52A8\u4F5C" }),
          /* @__PURE__ */ jsx13(
            "input",
            {
              value: thDraft.action,
              onChange: (e) => setThDraft({ ...thDraft, action: e.target.value }),
              placeholder: "\u62D2\u7EDD / \u5BA1\u614E\u6388\u4FE1 / \u6807\u51C6\u989D\u5EA6",
              className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs13("label", { className: "block", children: [
          /* @__PURE__ */ jsx13("span", { className: "mb-1 block text-xs text-slate-400", children: "\u5173\u8054\u9884\u8B66\u5904\u7F6E\u6D41\u7A0B\uFF08\u53EF\u9009\uFF09" }),
          /* @__PURE__ */ jsxs13(
            "select",
            {
              value: thDraft.bizFlowId,
              onChange: (e) => setThDraft({ ...thDraft, bizFlowId: e.target.value }),
              className: "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400",
              children: [
                /* @__PURE__ */ jsx13("option", { value: "", children: "\u672A\u5173\u8054" }),
                flows2.map((f) => /* @__PURE__ */ jsx13("option", { value: f.id, children: f.name }, f.id))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs13("div", { className: "mt-4 flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "ghost", onClick: () => setThNewOpen(false), children: "\u53D6\u6D88" }),
        /* @__PURE__ */ jsx13(Button, { size: "sm", variant: "primary", onClick: confirmThNew, children: "\u786E\u8BA4\u65B0\u589E" })
      ] })
    ] }),
    /* @__PURE__ */ jsx13(Modal, { open: alOpen, onClose: () => setAlOpen(false), title: `\u65B0\u589E\u5173\u8054\u9884\u8B66 \xB7 ${SCORE_PROD_LABEL[prod]}`, children: /* @__PURE__ */ jsxs13("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs13("label", { className: "block", children: [
        /* @__PURE__ */ jsx13("span", { className: "text-sm text-slate-500", children: "\u5BA2\u6237\u540D\u79F0" }),
        /* @__PURE__ */ jsx13(
          "input",
          {
            value: alForm.cust_name,
            onChange: (e) => setAlForm((f) => ({ ...f, cust_name: e.target.value })),
            placeholder: "\u5982 \u5F20*\u660E",
            className: "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs13("label", { className: "block", children: [
        /* @__PURE__ */ jsx13("span", { className: "text-sm text-slate-500", children: "\u9884\u8B66\u7C7B\u578B" }),
        /* @__PURE__ */ jsx13(
          "input",
          {
            value: alForm.alert_type,
            onChange: (e) => setAlForm((f) => ({ ...f, alert_type: e.target.value })),
            placeholder: "\u5982 \u8D1F\u503A\u6FC0\u589E / \u591A\u5934\u501F\u8D37 / \u53F8\u6CD5\u6D89\u8BC9",
            className: "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs13("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs13("label", { className: "block", children: [
          /* @__PURE__ */ jsx13("span", { className: "text-sm text-slate-500", children: "\u7B49\u7EA7" }),
          /* @__PURE__ */ jsxs13("select", { value: alForm.level, onChange: (e) => setAlForm((f) => ({ ...f, level: e.target.value })), className: "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400", children: [
            /* @__PURE__ */ jsx13("option", { value: "RED", children: "\u7EA2\uFF08\u9AD8\u98CE\u9669\uFF09" }),
            /* @__PURE__ */ jsx13("option", { value: "YELLOW", children: "\u9EC4\uFF08\u5173\u6CE8\uFF09" }),
            /* @__PURE__ */ jsx13("option", { value: "OPPORTUNITY", children: "\u673A\u4F1A\uFF08\u8425\u9500\uFF09" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs13("label", { className: "block", children: [
          /* @__PURE__ */ jsx13("span", { className: "text-sm text-slate-500", children: "\u5173\u8054\u5904\u7F6E\u6D41\u7A0B" }),
          /* @__PURE__ */ jsxs13("select", { value: alForm.flowKey, onChange: (e) => setAlForm((f) => ({ ...f, flowKey: e.target.value })), className: "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400", children: [
            /* @__PURE__ */ jsx13("option", { value: "", children: "\u672A\u5173\u8054" }),
            flows2.map((f) => /* @__PURE__ */ jsx13("option", { value: f.id, children: f.name }, f.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs13("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs13("label", { className: "block", children: [
          /* @__PURE__ */ jsx13("span", { className: "text-sm text-slate-500", children: "\u6307\u6807\u503C" }),
          /* @__PURE__ */ jsx13("input", { type: "number", value: alForm.metric_value, onChange: (e) => setAlForm((f) => ({ ...f, metric_value: Number(e.target.value) })), className: "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" })
        ] }),
        /* @__PURE__ */ jsxs13("label", { className: "block", children: [
          /* @__PURE__ */ jsx13("span", { className: "text-sm text-slate-500", children: "\u9608\u503C" }),
          /* @__PURE__ */ jsx13("input", { type: "number", value: alForm.threshold, onChange: (e) => setAlForm((f) => ({ ...f, threshold: Number(e.target.value) })), className: "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs13("label", { className: "block", children: [
        /* @__PURE__ */ jsx13("span", { className: "text-sm text-slate-500", children: "\u547D\u4E2D\u89C4\u5219" }),
        /* @__PURE__ */ jsx13(
          "input",
          {
            value: alForm.rule_name,
            onChange: (e) => setAlForm((f) => ({ ...f, rule_name: e.target.value })),
            placeholder: "\u5982 \u8FD130\u5929\u65B0\u589E\u8D37\u6B3E\u22653\u7B14",
            className: "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs13("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsx13(Button, { variant: "ghost", onClick: () => setAlOpen(false), children: "\u53D6\u6D88" }),
        /* @__PURE__ */ jsx13(Button, { variant: "primary", onClick: addAlert, children: "\u786E\u8BA4\u65B0\u589E" })
      ] })
    ] }) })
  ] });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxs13("div", { children: [
    /* @__PURE__ */ jsx13("div", { className: "mb-1 text-xs text-slate-400", children: label }),
    children
  ] });
}
function Def({ k, v }) {
  return /* @__PURE__ */ jsxs13("div", { className: "flex justify-between border-b border-slate-50 py-1.5", children: [
    /* @__PURE__ */ jsx13("dt", { className: "text-slate-500", children: k }),
    /* @__PURE__ */ jsx13("dd", { className: "font-medium text-ink-900", children: v })
  ] });
}

// src/console/ScoreDisposeFlow.tsx
import { Fragment as Fragment14, jsx as jsx14, jsxs as jsxs14 } from "react/jsx-runtime";
function ScoreDisposeFlowPage() {
  const flows2 = useFlows();
  const nav = useNavigate();
  const item = flows2.find((f) => f.id === "f-alert-dispose");
  const graphs = item?.flowGraphs ?? [];
  return /* @__PURE__ */ jsxs14(Fragment14, { children: [
    /* @__PURE__ */ jsx14(
      PageShell,
      {
        title: "\u5904\u7F6E\u6D41\u7A0B",
        crumb: "\u8BC4\u5206\u4EA7\u54C1 / \u7B56\u7565\u914D\u7F6E",
        actions: /* @__PURE__ */ jsx14(Button, { size: "sm", variant: "primary", onClick: () => nav("/console/cm/biz-flow?id=f-alert-dispose"), children: "\u524D\u5F80\u7BA1\u7406\u4E2D\u5FC3\u914D\u7F6E \u2192" })
      }
    ),
    /* @__PURE__ */ jsxs14("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs14(Panel, { title: "\u6D41\u7A0B\u5DF2\u7EDF\u4E00\u5230\u7BA1\u7406\u4E2D\u5FC3", actions: /* @__PURE__ */ jsx14(Cfg, { value: "bizFlows.json" }), children: [
        /* @__PURE__ */ jsxs14("p", { className: "text-sm leading-relaxed text-slate-600", children: [
          "\u8BC4\u5206\u4EA7\u54C1\u7684\u9884\u8B66\u5904\u7F6E\u6D41\u7A0B\u5DF2\u7EDF\u4E00\u7531\u300C\u7BA1\u7406\u4E2D\u5FC3 \u2192 \u4E1A\u52A1\u6D41\u7A0B\u300D\u914D\u7F6E\uFF08\u6D41\u7A0B ID\uFF1A",
          /* @__PURE__ */ jsx14("code", { className: "rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs", children: "f-alert-dispose" }),
          "\uFF09\uFF0C \u4E0E\u9884\u8B66\u5904\u7F6E\u5DE5\u4F5C\u53F0\u3001\u9884\u8B66\u8BE6\u60C5\u3001\u6A21\u578B\u8BC4\u5206\u9875\u300C\u9884\u8B66\u5904\u7F6E\u300D\u5171\u7528\u540C\u4E00\u4EFD\u914D\u7F6E\uFF0C\u6539\u4E00\u5904\u5168\u5C40\u751F\u6548\u3002"
        ] }),
        /* @__PURE__ */ jsxs14("div", { className: "mt-3 flex gap-2", children: [
          /* @__PURE__ */ jsx14(Button, { size: "sm", variant: "secondary", onClick: () => nav("/console/cm/biz-flow"), children: "\u7BA1\u7406\u4E2D\u5FC3 \xB7 \u4E1A\u52A1\u6D41\u7A0B" }),
          /* @__PURE__ */ jsx14(Button, { size: "sm", variant: "ghost", onClick: () => nav("/console/sc/alert-workbench"), children: "\u9884\u8B66\u5904\u7F6E\u5DE5\u4F5C\u53F0" })
        ] })
      ] }),
      /* @__PURE__ */ jsx14(Panel, { title: `\u9884\u8B66\u5904\u7F6E\u6D41\u7A0B \xB7 \u5B50\u6D41\u7A0B\u4E00\u89C8\uFF08${graphs.length} \u6761\uFF09`, desc: "\u6309\u9884\u8B66\u7B49\u7EA7/\u7C7B\u578B\u81EA\u52A8\u5339\u914D\uFF1B\u7F16\u8F91\u8BF7\u524D\u5F80\u7BA1\u7406\u4E2D\u5FC3", children: graphs.length === 0 ? /* @__PURE__ */ jsx14("p", { className: "text-sm text-slate-500", children: "\u7BA1\u7406\u4E2D\u5FC3\u5C1A\u672A\u914D\u7F6E\u300C\u9884\u8B66\u5904\u7F6E\u6D41\u7A0B\uFF08f-alert-dispose\uFF09\u300D\uFF0C\u8BF7\u5148\u5230\u7BA1\u7406\u4E2D\u5FC3\u521B\u5EFA\u3002" }) : /* @__PURE__ */ jsx14("div", { className: "space-y-3", children: graphs.map((g, i) => {
        const steps = g.flowSteps ?? [];
        const matchTxt = (g.match ?? []).map((m) => `${m.field}=${m.value}`).join(" \u4E14 ");
        return /* @__PURE__ */ jsxs14("div", { className: "rounded-xl border border-slate-200 p-3", children: [
          /* @__PURE__ */ jsxs14("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx14("span", { className: "text-sm font-medium text-ink-900", children: g.name }),
            /* @__PURE__ */ jsxs14(Badge, { kind: "gray", children: [
              "match\uFF1A",
              matchTxt || "\u5168\u90E8"
            ] }),
            /* @__PURE__ */ jsxs14("span", { className: "text-xs text-slate-400", children: [
              steps.length,
              " \u6B65"
            ] })
          ] }),
          /* @__PURE__ */ jsx14("div", { className: "mt-2 flex flex-wrap items-center gap-1.5", children: steps.map((s, j) => /* @__PURE__ */ jsxs14("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx14(
              "span",
              {
                className: "rounded-md px-2 py-0.5 text-xs font-medium",
                style: { background: (s.color ?? "#94A3B8") + "1a", color: s.color ?? "#475569" },
                children: s.state
              }
            ),
            j < steps.length - 1 && /* @__PURE__ */ jsx14("span", { className: "text-slate-300", children: "\u2192" })
          ] }, j)) })
        ] }, i);
      }) }) })
    ] })
  ] });
}

// src/console/MidAlertWorkbench.tsx
import { useMemo as useMemo7, useState as useState16 } from "react";

// src/console/FlowStateCell.tsx
import { useState as useState13 } from "react";

// src/console/FlowConfirmModal.tsx
import { useState as useState12 } from "react";
import { Fragment as Fragment15, jsx as jsx15, jsxs as jsxs15 } from "react/jsx-runtime";
function FlowConfirmModal({
  open,
  flowName,
  action,
  from,
  to,
  onClose,
  onConfirm
}) {
  const [opinion, setOpinion] = useState12("");
  const [lastOpen, setLastOpen] = useState12(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setOpinion("");
  }
  return /* @__PURE__ */ jsx15(
    Modal,
    {
      title: `${flowName} \xB7 ${action}`,
      open,
      onClose,
      zIndex: 200,
      footer: /* @__PURE__ */ jsxs15(Fragment15, { children: [
        /* @__PURE__ */ jsx15(Button, { variant: "ghost", onClick: onClose, children: "\u53D6\u6D88" }),
        /* @__PURE__ */ jsx15(Button, { variant: "primary", onClick: () => onConfirm(opinion.trim()), children: "\u786E\u8BA4\u6D41\u8F6C" })
      ] }),
      children: /* @__PURE__ */ jsxs15("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs15("div", { className: "text-xs text-slate-400", children: [
          "\u4E1A\u52A1\u6D41\u7A0B\uFF1A",
          /* @__PURE__ */ jsx15("span", { className: "font-medium text-slate-600", children: flowName })
        ] }),
        /* @__PURE__ */ jsxs15("div", { className: "flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsx15("span", { className: "rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700", children: from }),
          /* @__PURE__ */ jsxs15("span", { className: "text-slate-400", children: [
            "\u2500[",
            action,
            "]\u2192"
          ] }),
          /* @__PURE__ */ jsx15("span", { className: "rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700", children: to })
        ] }),
        /* @__PURE__ */ jsxs15("div", { children: [
          /* @__PURE__ */ jsx15("div", { className: "mb-1 text-xs text-slate-400", children: "\u5BA1\u6279\u610F\u89C1\uFF08\u53EF\u9009\uFF09" }),
          /* @__PURE__ */ jsx15(
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

// src/console/FlowStateCell.tsx
import { Fragment as Fragment16, jsx as jsx16, jsxs as jsxs16 } from "react/jsx-runtime";
function FlowStateCell({ flowId, state, onChange, buttonOnly = false, matchObj }) {
  const flows2 = useFlows();
  const f = flowId ? flows2.find((x) => x.id === flowId) : void 0;
  const { steps, name } = matchFlowGraph(f, matchObj ?? {});
  const [confirm, setConfirm] = useState13(null);
  if (!f) return /* @__PURE__ */ jsx16("span", { style: { color: "#CBD5E1" }, children: "\u2014" });
  if (!steps.length) return /* @__PURE__ */ jsx16("span", { style: { color: "#CBD5E1" }, children: "\u2014" });
  const { state: st, step } = flowStepOf({ flowSteps: steps, flowState: state });
  const sc = step?.color ?? stepColorOf(st);
  if (buttonOnly) {
    if (!step?.next || !onChange) return /* @__PURE__ */ jsx16("span", { style: { color: "#CBD5E1" }, children: "\u2014" });
    return /* @__PURE__ */ jsxs16(Fragment16, { children: [
      /* @__PURE__ */ jsx16(
        "button",
        {
          type: "button",
          onClick: () => setConfirm({ f, step }),
          style: { fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "none", cursor: "pointer", background: "#2563EB", color: "#fff" },
          children: step.action
        }
      ),
      /* @__PURE__ */ jsx16(
        FlowConfirmModal,
        {
          open: confirm != null,
          flowName: name || f.name,
          action: confirm?.step.action ?? "",
          from: confirm ? flowStepOf({ flowSteps: steps, flowState: state }).state : "",
          to: confirm?.step.next ?? "",
          onClose: () => setConfirm(null),
          onConfirm: () => {
            if (confirm) onChange(confirm.step.next);
            setConfirm(null);
          }
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs16(Fragment16, { children: [
    /* @__PURE__ */ jsxs16("div", { style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap" }, children: [
      /* @__PURE__ */ jsx16("span", { style: { fontSize: 12, fontWeight: 600, color: sc }, children: st }),
      step?.next && onChange && /* @__PURE__ */ jsx16(
        "button",
        {
          type: "button",
          onClick: () => setConfirm({ f, step }),
          style: { fontSize: 11, padding: "1px 9px", borderRadius: 4, border: "none", cursor: "pointer", background: "#2563EB", color: "#fff" },
          children: step.action
        }
      )
    ] }),
    /* @__PURE__ */ jsx16(
      FlowConfirmModal,
      {
        open: confirm != null,
        flowName: name || f.name,
        action: confirm?.step.action ?? "",
        from: confirm ? flowStepOf({ flowSteps: steps, flowState: state }).state : "",
        to: confirm?.step.next ?? "",
        onClose: () => setConfirm(null),
        onConfirm: () => {
          if (confirm) onChange(confirm.step.next);
          setConfirm(null);
        }
      }
    )
  ] });
}

// src/console/flowBinding.tsx
import { useEffect as useEffect9, useState as useState15 } from "react";

// src/console/FlowActionBar.tsx
import { useState as useState14 } from "react";
import { jsx as jsx17, jsxs as jsxs17 } from "react/jsx-runtime";
function FlowActionBar({ flowId, state, onStateChange, onSave, saveLabel = "\u4FDD\u5B58", matchObj }) {
  const flows2 = useFlows();
  const f = flowId ? flows2.find((x) => x.id === flowId) : void 0;
  const { graph, steps, name } = matchFlowGraph(f, matchObj ?? {});
  const [confirm, setConfirm] = useState14(null);
  const hasFlow = !!(f && steps.length);
  if (!hasFlow && !onSave) return null;
  return /* @__PURE__ */ jsxs17("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 10, padding: "8px 12px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10 }, children: [
    onSave && /* @__PURE__ */ jsx17(
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
      return /* @__PURE__ */ jsxs17("span", { style: { display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, padding: "3px 8px" }, children: [
        /* @__PURE__ */ jsx17("span", { style: { fontSize: 12, color: "#64748B" }, children: name || f.name }),
        /* @__PURE__ */ jsxs17("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: sc, background: `${sc}1A`, borderRadius: 10, padding: "1px 9px" }, children: [
          /* @__PURE__ */ jsx17("span", { style: { width: 6, height: 6, borderRadius: "50%", background: sc, display: "inline-block" } }),
          st
        ] }),
        step?.next && onStateChange && /* @__PURE__ */ jsx17(
          "button",
          {
            type: "button",
            onClick: () => setConfirm({ f, step }),
            style: { height: 22, padding: "0 12px", fontSize: 12, borderRadius: 6, border: "none", cursor: "pointer", background: "#2563EB", color: "#fff", fontWeight: 500 },
            children: step.action
          }
        ),
        tl != null && /* @__PURE__ */ jsxs17("span", { style: { fontSize: 12, fontWeight: 600, color: "#B45309", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, padding: "1px 9px", whiteSpace: "nowrap" }, children: [
          "\u8282\u70B9\u65F6\u9650 ",
          tl,
          " \u5206\u949F"
        ] })
      ] });
    })(),
    /* @__PURE__ */ jsx17(
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

// src/console/flowBinding.tsx
import { jsx as jsx18 } from "react/jsx-runtime";
function useFlowBinding(pageRoute) {
  useFlows();
  const routes = Array.isArray(pageRoute) ? pageRoute : [pageRoute];
  const out = [];
  for (const r of routes) {
    for (const f of getFlowsByPage(r)) if (!out.some((x) => x.id === f.id)) out.push(f);
  }
  return out;
}
function usePageFlow(pageRoute) {
  return useFlowBinding(pageRoute)[0];
}
function flowIdOfRow(row, pageFlow) {
  const own = String(row.flowKey ?? "");
  return own || pageFlow?.id || "";
}
function matchObjOf(row, matchFields) {
  if (!matchFields) return {};
  const pairs = Array.isArray(matchFields) ? matchFields.map((k) => [k, k]) : Object.entries(matchFields);
  const o = {};
  for (const [field, rowKey] of pairs) o[field] = row[rowKey] ?? "";
  return o;
}
function useMinuteTick() {
  const [, setTick] = useState15(0);
  useEffect9(() => {
    const t = setInterval(() => setTick((x) => x + 1), 6e4);
    return () => clearInterval(t);
  }, []);
}
var DASH = /* @__PURE__ */ jsx18("span", { style: { color: "#94A3B8" }, children: "\u2014" });
function renderCountdown(opts) {
  const { flowId, flowState, flowStateAt, matchObj } = opts;
  const flow = opts.flow ?? (flowId ? getFlowById(flowId) : void 0);
  const { graph, steps } = matchFlowGraph(flow, matchObj ?? {});
  if (!flow || !steps.length || !flowStateAt) return DASH;
  const { step } = flowStepOf({ flowSteps: steps, flowState: flowState ?? "" });
  if (!step?.next) return DASH;
  const tl = nodeTimeLimitOf(graph, flowState ?? "");
  if (!tl) return DASH;
  const remain = new Date(String(flowStateAt)).getTime() + tl * 6e4 - Date.now();
  if (remain <= 0) return /* @__PURE__ */ jsx18("span", { style: { color: "#DC2626", fontWeight: 600 }, children: "\u5DF2\u8D85\u65F6" });
  const h = Math.floor(remain / 36e5);
  const m = Math.floor(remain % 36e5 / 6e4);
  const color = remain < 30 * 6e4 ? "#DC2626" : remain < 120 * 6e4 ? "#D97706" : "#475569";
  return /* @__PURE__ */ jsx18("span", { style: { color, fontWeight: 600, fontVariantNumeric: "tabular-nums" }, children: h > 0 ? `${h}\u5C0F\u65F6${m}\u5206` : `${m}\u5206\u949F` });
}

// src/console/MidAlertWorkbench.tsx
import { Fragment as Fragment17, jsx as jsx19, jsxs as jsxs18 } from "react/jsx-runtime";
var ALERT_MATCH_FIELDS = { level: "levelRaw", alert_type: "alertTypeRaw", scene: "scene" };
function MidAlertWorkbench() {
  const alerts2 = useMidAlerts2();
  const saveStatus3 = useMidSaveStatus();
  useFlows();
  const pageFlow = usePageFlow("/console/cr/mid-alert");
  const nav = useNavigate();
  useMinuteTick();
  const countdownOf = (r) => renderCountdown({
    flowId: flowIdOfRow(r, pageFlow),
    flowState: String(r.flowState ?? ""),
    flowStateAt: String(r.flowStateAt ?? ""),
    matchObj: matchObjOf(r, ALERT_MATCH_FIELDS)
  });
  const [lvl, setLvl] = useState16("");
  const [scene, setScene] = useState16("");
  const [type, setType] = useState16("");
  const scenes = useMemo7(() => Array.from(new Set(alerts2.map((a) => a.scene))), [alerts2]);
  const types = useMemo7(() => Array.from(new Set(alerts2.map((a) => a.alert_type))), [alerts2]);
  const filtered = alerts2.filter(
    (a) => (!lvl || a.level === lvl) && (!scene || a.scene === scene) && (!type || a.alert_type === type)
  );
  const levelCounts = useMemo7(() => {
    const c = { RED: 0, YELLOW: 0, OPPORTUNITY: 0 };
    alerts2.forEach((a) => {
      c[a.level] = (c[a.level] ?? 0) + 1;
    });
    return c;
  }, [alerts2]);
  const typeCounts = useMemo7(() => {
    const c = {};
    alerts2.forEach((a) => {
      c[a.alert_type] = (c[a.alert_type] ?? 0) + 1;
    });
    return c;
  }, [alerts2]);
  const cols = [
    { key: "alert_id", label: "\u9884\u8B66ID", type: "text", width: "130px" },
    { key: "cust_name", label: "\u5BA2\u6237", type: "text", width: "90px" },
    { key: "alert_type", label: "\u9884\u8B66\u7C7B\u578B", type: "badge", badgeKind: "violet", width: "110px" },
    { key: "scene", label: "\u89E6\u53D1\u573A\u666F", type: "text", width: "110px" },
    { key: "level", label: "\u7B49\u7EA7", type: "badge", badgeKind: "red", width: "80px" },
    { key: "rule_name", label: "\u547D\u4E2D\u89C4\u5219", type: "text", width: "200px" },
    { key: "metric", label: "\u6307\u6807\u503C/\u9608\u503C", type: "text", width: "100px" },
    { key: "alert_date", label: "\u9884\u8B66\u65F6\u95F4", type: "text", width: "100px" },
    { key: "countdown", label: "\u65F6\u9650\u5012\u8BA1\u65F6", render: (r) => countdownOf(r) },
    { key: "flowState", label: "\u6D41\u7A0B\u72B6\u6001", fixed: "right", tag: { kind: "sample", value: "midAlerts.json.flowState" }, render: (r) => /* @__PURE__ */ jsx19(
      FlowStateCell,
      {
        flowId: String(r.flowKey ?? ""),
        state: String(r.flowState ?? ""),
        matchObj: { level: r.levelRaw ?? "", alert_type: r.alertTypeRaw ?? "", scene: r.scene ?? "" },
        onChange: (s) => updateAlerts((list) => list.map((a) => a.alert_id === String(r.id) ? { ...a, flowState: s, flowStateAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ") } : a))
      }
    ) }
  ];
  const TYPE_KIND = {
    \u8D1F\u503A\u6FC0\u589E: "red",
    \u591A\u5934\u501F\u8D37: "red",
    \u903E\u671F\u9884\u8B66: "red",
    \u53F8\u6CD5\u6D89\u8BC9: "red",
    \u5173\u8054\u4F01\u4E1A\u98CE\u9669: "red",
    \u8BBE\u5907\u5F02\u5E38: "amber",
    \u53CD\u6B3A\u8BC8\u547D\u4E2D: "amber",
    \u884C\u4E3A\u8BC4\u5206\u4E0B\u964D: "amber",
    \u8FD8\u6B3E\u80FD\u529B\u4E0D\u8DB3: "blue",
    \u56DE\u8BBF\u5931\u8054: "blue",
    \u8206\u60C5\u8D1F\u9762: "violet",
    \u63D0\u989D\u673A\u4F1A: "green"
  };
  const rows = filtered.map((a) => ({
    id: a.alert_id,
    alert_id: a.alert_id,
    cust_name: a.cust_name,
    alert_type: { v: a.alert_type, kind: TYPE_KIND[a.alert_type] ?? "gray" },
    scene: a.scene,
    level: { v: LEVEL_META[a.level].label, kind: LEVEL_META[a.level].badge },
    levelRaw: a.level,
    // 需求16：原始字段值（供匹配具体流程）
    alertTypeRaw: a.alert_type,
    rule_name: a.rule_name,
    metric: `${a.metric_value} / ${a.threshold}`,
    alert_date: a.alert_date,
    flowKey: a.flowKey ?? "",
    flowState: a.flowState ?? "",
    flowStateAt: a.flowStateAt ?? ""
  }));
  return /* @__PURE__ */ jsxs18("div", { style: { padding: 24, maxWidth: 1360 }, children: [
    /* @__PURE__ */ jsx19(
      PageShell,
      {
        title: "\u9884\u8B66\u5DE5\u4F5C\u53F0",
        crumb: "\u96F6\u552E\u4FE1\u8D37\u98CE\u63A7 / \u8D37\u4E2D\u76D1\u63A7 / \u9884\u8B66\u5904\u7F6E",
        subtitle: "\u9884\u8B66\u961F\u5217 \xB7 \u70B9\u51FB\u4EFB\u610F\u4E00\u6761\u67E5\u770B\u8BE6\u60C5\u5E76\u5904\u7F6E",
        actions: /* @__PURE__ */ jsxs18(Fragment17, { children: [
          /* @__PURE__ */ jsx19(Sam, { label: "\u7B56\u7565\u914D\u7F6E", value: "midStrategy.json" }),
          /* @__PURE__ */ jsx19(Sam, { label: "\u9884\u8B66\u6837\u4F8B", value: `${alerts2.length} \u6761` }),
          /* @__PURE__ */ jsx19(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs18("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, margin: "4px 0 16px" }, children: [
      /* @__PURE__ */ jsx19(StatCard, { label: "\u9884\u8B66\u603B\u6570", value: String(alerts2.length), accent: "brand" }),
      /* @__PURE__ */ jsx19(StatCard, { label: "\u7EA2\u706F\u9884\u8B66", value: String(levelCounts.RED), accent: "rose" }),
      /* @__PURE__ */ jsx19(StatCard, { label: "\u9EC4\u706F\u9884\u8B66", value: String(levelCounts.YELLOW), accent: "amber" }),
      /* @__PURE__ */ jsx19(StatCard, { label: "\u673A\u4F1A\u9884\u8B66", value: String(levelCounts.OPPORTUNITY), accent: "emerald" })
    ] }),
    /* @__PURE__ */ jsx19(
      Panel,
      {
        title: "\u9884\u8B66\u961F\u5217",
        desc: /* @__PURE__ */ jsxs18("span", { children: [
          "\u7B5B\u9009\u540E\u5171 ",
          /* @__PURE__ */ jsx19("b", { children: filtered.length }),
          " \u6761 \xB7 ",
          /* @__PURE__ */ jsx19(Cal, { label: "\u5B9E\u65F6\u8FC7\u6EE4" })
        ] }),
        actions: /* @__PURE__ */ jsxs18("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsx19(Sel, { value: lvl, onChange: setLvl, opts: [{ v: "", l: "\u5168\u90E8\u7B49\u7EA7" }, ...["RED", "YELLOW", "OPPORTUNITY"].map((x) => ({ v: x, l: LEVEL_META[x].label }))] }),
          /* @__PURE__ */ jsx19(Sel, { value: type, onChange: setType, opts: [{ v: "", l: "\u5168\u90E8\u7C7B\u578B" }, ...types.map((x) => ({ v: x, l: `${x}\uFF08${typeCounts[x] ?? 0}\uFF09` }))] }),
          /* @__PURE__ */ jsx19(Sel, { value: scene, onChange: setScene, opts: [{ v: "", l: "\u5168\u90E8\u573A\u666F" }, ...scenes.map((x) => ({ v: x, l: x }))] })
        ] }),
        children: /* @__PURE__ */ jsx19(
          DataTable,
          {
            columns: cols,
            rows,
            empty: "\u65E0\u5339\u914D\u9884\u8B66",
            clickableKey: "alert_id",
            onCellClick: (r) => nav("/console/cr/mid-alert-detail?id=" + String(r.id)),
            actions: (r) => /* @__PURE__ */ jsx19(
              "button",
              {
                type: "button",
                onClick: () => nav("/console/cr/mid-alert-detail?id=" + String(r.id)),
                style: { padding: "3px 12px", borderRadius: 6, border: "1px solid #C7D2FE", background: "#EFF6FF", color: "#1D4ED8", fontSize: 12, cursor: "pointer" },
                children: "\u67E5\u770B"
              }
            )
          }
        )
      }
    ),
    /* @__PURE__ */ jsx19(Modal, { open: saveStatus3 === "error", onClose: () => {
    }, title: "\u4FDD\u5B58\u63D0\u793A", children: /* @__PURE__ */ jsx19("p", { style: { fontSize: 13, color: "#B91C1C" }, children: "\u672C\u5730 JSON \u5199\u5165\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5 /api/save-mid \u7AEF\u70B9\u4E0E\u6587\u4EF6\u6743\u9650\u3002" }) })
  ] });
}
function Sel({ value, onChange, opts }) {
  return /* @__PURE__ */ jsx19("select", { value, onChange: (e) => onChange(e.target.value), style: { padding: "4px 8px", borderRadius: 6, border: "1px solid #E2E8F0", fontSize: 12, background: "#fff" }, children: opts.map((o) => /* @__PURE__ */ jsx19("option", { value: o.v, children: o.l }, o.v)) });
}

// src/console/MidDashboardPage.tsx
import { useMemo as useMemo8, useState as useState17 } from "react";
import { Fragment as Fragment18, jsx as jsx20, jsxs as jsxs19 } from "react/jsx-runtime";
var PALETTE = ["#2563EB", "#0891B2", "#7C3AED", "#DB2777", "#EA580C", "#16A34A", "#CA8A04", "#475569"];
var inp2 = { padding: "5px 8px", borderRadius: 6, border: "1px solid #E2E8F0", fontSize: 12, background: "#fff" };
var DATA_FLOW_MAP = {
  ds_alert: "f-alert-dispose",
  ds_loan: "f-loan-collect",
  ds_sql_demo: "f-loan-collect",
  ds_customer: "f-cust-operate",
  ds_behavior: "f-behavior-promote",
  ds_api_demo: "f-credit-check",
  ds_event: "f-event-analyze"
};
function MidDashboardPage({ pageKey, crumbPrefix }) {
  const dashboards2 = useMidDashboards();
  const sources = useMidDataSources();
  const metrics2 = useMidMetrics();
  const nav = useNavigate();
  const page = useMemo8(() => dashboards2.find((d) => d.key === pageKey), [dashboards2, pageKey]);
  const dsById = (id) => sources.find((s) => s.id === id);
  const metricById = (id) => metrics2.find((m) => m.id === id);
  const [filters, setFilters] = useState17({});
  const [dlWidget, setDlWidget] = useState17(null);
  const [dlOpen, setDlOpen] = useState17(false);
  const [dlRow, setDlRow] = useState17(null);
  if (!page) {
    return /* @__PURE__ */ jsx20("div", { style: { padding: 24 }, children: /* @__PURE__ */ jsx20(PageShell, { title: "\u76D1\u63A7\u770B\u677F", crumb: "\u96F6\u552E\u4FE1\u8D37\u98CE\u63A7 / \u8D37\u4E2D\u76D1\u63A7", subtitle: "\u6682\u65E0\u9875\u9762\u914D\u7F6E" }) });
  }
  const pageDs = Array.from(new Set(page.widgets.map((w) => w.datasetId))).map(dsById).filter(Boolean);
  const applyFilters = (rows, fs) => rows.filter((r) => fs.every((f) => {
    const v = filters[f.id];
    if (v == null || v === "" || Array.isArray(v) && !v.length) return true;
    const cell = String(r[f.field ?? ""] ?? "");
    if (f.kind === "select") return cell === String(v);
    if (f.kind === "dateRange") {
      const from = v?.from, to = v?.to;
      if (from && cell < from) return false;
      if (to && cell > to) return false;
      return true;
    }
    if (f.kind === "input") return JSON.stringify(r).includes(String(v));
    return true;
  }));
  const filteredRows = (dsId) => applyFilters(dsById(dsId)?.rows ?? [], page.filters ?? []);
  const widgetRows = (w) => {
    const rows = filteredRows(w.datasetId);
    if (!w.filters?.length) return rows;
    return applyMetricFilters(rows, w.filters);
  };
  const isSc = crumbPrefix === "\u8BC4\u5206\u4EA7\u54C1";
  const custBack2 = isSc ? "/console/" + pageKey.replace(":", "/") : null;
  const drillTo = (w) => {
    if ((w.drill?.type ?? "none") === "none" || !w.drill?.rowKey) return;
    const rows = filteredRows(w.datasetId);
    const firstCust = rows.find((r) => r[w.drill.rowKey])?.[w.drill.rowKey];
    if (firstCust) nav(`/console/cr/mid-single-cust?cust=${firstCust}` + (custBack2 ? `&back=${encodeURIComponent(custBack2)}&source=sc` : ``));
  };
  const openDetail = (w) => {
    setDlWidget(w);
    setDlRow(null);
    setDlOpen(true);
  };
  const dlDs = dlWidget ? dsById(dlWidget.datasetId) : void 0;
  const dlMetric = dlWidget ? metricById(dlWidget.metricId) : void 0;
  const dlRows = dlWidget ? filteredRows(dlWidget.datasetId) : [];
  const dlCols = (dlDs?.fields ?? []).map((f) => ({ key: f.key, label: f.label ?? f.key, type: "text" }));
  const dlTrows = dlRows.map((r, i) => ({ id: String(i), ...Object.fromEntries((dlDs?.fields ?? []).map((f) => [f.key, String(r[f.key] ?? "")])) }));
  const dlRowData = dlRow != null ? dlRows[dlRow] : void 0;
  return /* @__PURE__ */ jsxs19("div", { style: { padding: 24, maxWidth: 1280 }, children: [
    /* @__PURE__ */ jsx20(
      PageShell,
      {
        title: page.name,
        crumb: `${crumbPrefix ?? "\u96F6\u552E\u4FE1\u8D37\u98CE\u63A7 / \u8D37\u4E2D\u76D1\u63A7"} / ${page.group}`,
        subtitle: page.desc,
        actions: /* @__PURE__ */ jsxs19(Fragment18, { children: [
          /* @__PURE__ */ jsx20(Sam, { label: "\u9875\u9762\u914D\u7F6E", value: "midDashboards.json" }),
          /* @__PURE__ */ jsx20(Sam, { label: "\u6837\u4F8B\u6570\u636E", value: `${pageDs.reduce((a, s) => a + (s.rows?.length || 0), 0)} \u884C` }),
          /* @__PURE__ */ jsx20(Cal, { label: "\u5B9E\u65F6\u8BA1\u7B97" })
        ] })
      }
    ),
    page.filters && page.filters.length > 0 && /* @__PURE__ */ jsxs19("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", margin: "4px 0 16px", padding: 12, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12 }, children: [
      page.filters.map((f) => /* @__PURE__ */ jsx20(FilterControl, { f, rows: pageDs.flatMap((s) => s.rows ?? []), value: filters[f.id], onChange: (v) => setFilters((p) => ({ ...p, [f.id]: v })) }, f.id)),
      /* @__PURE__ */ jsx20("button", { type: "button", onClick: () => setFilters({}), style: { ...inp2, cursor: "pointer", color: "#64748B", borderColor: "#E2E8F0" }, children: "\u91CD\u7F6E" })
    ] }),
    /* @__PURE__ */ jsx20("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, alignItems: "stretch" }, children: page.widgets.map((w) => /* @__PURE__ */ jsx20("div", { style: { gridColumn: `span ${widgetColSpan(w)}`, height: "100%" }, children: /* @__PURE__ */ jsx20(WidgetView, { w, ds: dsById(w.datasetId), metric: metricById(w.metricId ?? w.metricIds?.[0] ?? ""), metrics: metrics2, rows: widgetRows(w), onDrill: () => drillTo(w), onDetail: () => openDetail(w), nav }) }, w.id)) }),
    /* @__PURE__ */ jsx20(RightDrawer, { open: dlOpen, onClose: () => setDlOpen(false), title: `${dlWidget?.title ?? "\u7EC4\u4EF6"} \xB7 \u6570\u636E\u660E\u7EC6`, width: 620, level: 1, children: dlDs ? /* @__PURE__ */ jsxs19(Fragment18, { children: [
      /* @__PURE__ */ jsxs19("div", { style: { marginBottom: 10, fontSize: 12, color: "#64748B" }, children: [
        dlDs.name,
        " \xB7 ",
        dlMetric?.name ?? "",
        " \xB7 ",
        dlRows.length,
        " \u884C\uFF08\u70B9\u51FB\u884C\u300C\u8BE6\u60C5\u300D\u67E5\u770B\u5355\u884C\u5B57\u6BB5\u540D / \u5B57\u6BB5\u503C\uFF09"
      ] }),
      /* @__PURE__ */ jsx20(
        DataTable,
        {
          columns: dlCols,
          rows: dlTrows,
          clickableKey: dlCols[0]?.key,
          onCellClick: (r) => setDlRow(Number(r.id)),
          actions: (r) => /* @__PURE__ */ jsx20("button", { type: "button", onClick: () => setDlRow(Number(r.id)), style: { fontSize: 12, color: "#1D4ED8", background: "none", border: "none", cursor: "pointer" }, children: "\u8BE6\u60C5" }),
          pager: true,
          defaultPageSize: 15,
          empty: "\u6682\u65E0\u6570\u636E"
        }
      )
    ] }) : /* @__PURE__ */ jsx20("div", { style: { fontSize: 12, color: "#94A3B8" }, children: "\u6570\u636E\u96C6\u672A\u627E\u5230" }) }),
    /* @__PURE__ */ jsxs19(RightDrawer, { open: dlOpen && dlRow != null, onClose: () => setDlRow(null), title: `${dlWidget?.title ?? "\u7EC4\u4EF6"} \xB7 \u6570\u636E\u8BE6\u60C5`, width: 400, level: 2, children: [
      dlRowData && dlDs && /* @__PURE__ */ jsx20(
        FlowActionBar,
        {
          flowId: String(dlRowData.flowKey ?? dlWidget?.flowKey ?? DATA_FLOW_MAP[dlWidget?.datasetId ?? ""] ?? ""),
          state: String(dlRowData.flowState ?? ""),
          onStateChange: (s) => updateDataSources((list) => list.map((ds) => {
            if (ds.id !== dlDs.id) return ds;
            return { ...ds, rows: ds.rows.map((r) => r === dlRowData ? { ...r, flowState: s } : r) };
          }))
        }
      ),
      dlRowData && dlDs && /* @__PURE__ */ jsx20("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 }, children: /* @__PURE__ */ jsx20("tbody", { children: dlDs.fields.map((f) => /* @__PURE__ */ jsxs19("tr", { style: { borderTop: "1px solid #F1F5F9" }, children: [
        /* @__PURE__ */ jsx20("td", { style: { padding: "8px 12px", width: "42%", fontWeight: 600, color: "#334155", background: "#F8FAFC" }, children: f.label ?? f.key }),
        /* @__PURE__ */ jsx20("td", { style: { padding: "8px 12px", color: "#0F172A", wordBreak: "break-all" }, children: String(dlRowData[f.key] ?? "") })
      ] }, f.key)) }) })
    ] })
  ] });
}
function widgetColSpan(w) {
  return w.windowSize === "lg" ? 3 : w.windowSize === "sm" ? 1 : 2;
}
function widgetChartH(w) {
  return w.windowSize === "lg" ? 300 : w.windowSize === "sm" ? 170 : 240;
}
function WidgetView({ w, ds, metric, metrics: metrics2, rows, onDrill, nav, onEdit, onDelete, onDetail }) {
  const H = widgetChartH(w);
  const metricById = (id) => metrics2.find((m) => m.id === id);
  const tip = [
    ds ? `\u6570\u636E\u6E90\uFF1A${ds.name}` : "",
    metric ? `\u6307\u6807\uFF1A${metric.name}` : "",
    w.dimensions?.length ? `\u7EF4\u5EA6\uFF1A${w.dimensions.join("\u3001")}` : "",
    w.timeGranularity ? `\u65F6\u95F4\u7C92\u5EA6\uFF1A${w.timeGranularity}` : "",
    w.windowSize === "lg" ? "\u7A97\u53E3\uFF1A\u5927\uFF08\u6574\u884C\uFF09" : w.windowSize === "sm" ? "\u7A97\u53E3\uFF1A\u5C0F\uFF081 \u5217\uFF09" : "\u7A97\u53E3\uFF1A\u4E2D\uFF082 \u5217\uFF09"
  ].filter(Boolean).join("\n");
  const editAction = /* @__PURE__ */ jsxs19("div", { style: { display: "flex", gap: 6 }, children: [
    onDetail && /* @__PURE__ */ jsx20("button", { type: "button", onClick: () => onDetail(), style: { fontSize: 12, color: "#1D4ED8", background: "none", border: "1px solid #C7D2FE", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }, children: "\u6570\u636E\u8BE6\u60C5" }),
    onEdit && /* @__PURE__ */ jsx20("button", { type: "button", onClick: onEdit, style: { fontSize: 12, color: "#1D4ED8", background: "none", border: "1px solid #C7D2FE", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }, children: "\u7F16\u8F91" }),
    onDelete && /* @__PURE__ */ jsx20("button", { type: "button", onClick: onDelete, style: { fontSize: 12, color: "#B91C1C", background: "none", border: "1px solid #FECACA", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }, children: "\u5220\u9664" })
  ] });
  if (!ds || !metric) return /* @__PURE__ */ jsx20(Panel, { title: w.title, actions: editAction, className: "h-full", hoverTip: tip, children: /* @__PURE__ */ jsx20("div", { style: { fontSize: 12, color: "#94A3B8" }, children: "\u914D\u7F6E\u7F3A\u5931\uFF1A\u6570\u636E\u96C6\u6216\u6307\u6807\u672A\u627E\u5230" }) });
  const vals = resolveMetricsForRows(metrics2, rows);
  if (w.type === "metric") {
    const ids = (w.metricIds?.length ? w.metricIds : [w.metricId]).filter(Boolean).filter((id) => metricById(id));
    const cards = ids.map((id) => {
      const m = metricById(id);
      const v = vals[id] ?? 0;
      return /* @__PURE__ */ jsx20(StatCard, { label: m.name, value: fmt(v, m.precision, m.unit), accent: "brand" }, id);
    });
    return /* @__PURE__ */ jsx20(Panel, { title: w.title, actions: editAction, className: "h-full", hoverTip: tip, children: cards.length ? /* @__PURE__ */ jsx20("div", { style: { display: "grid", gridTemplateColumns: ids.length > 1 ? "repeat(auto-fit, minmax(150px, 1fr))" : "1fr", gap: 12 }, children: cards }) : /* @__PURE__ */ jsx20("div", { style: { fontSize: 12, color: "#94A3B8" }, children: "\u672A\u914D\u7F6E\u6307\u6807" }) });
  }
  const dim = w.dimensions?.[0];
  if (!dim) return /* @__PURE__ */ jsx20(Panel, { title: w.title, className: "h-full", hoverTip: tip, children: /* @__PURE__ */ jsx20("div", { style: { fontSize: 12, color: "#94A3B8" }, children: "\u672A\u914D\u7F6E\u7EF4\u5EA6\u5B57\u6BB5" }) });
  const groups = groupRowsByDim(rows, dim);
  const labels = groups.map((g) => g.key);
  const metricIds = (w.metricIds?.length ? w.metricIds : [w.metricId]).filter((id) => metricById(id));
  const seriesOf = () => metricIds.map((mid, si) => {
    const m = metricById(mid);
    return {
      name: m.name,
      color: PALETTE[si % PALETTE.length],
      unit: m.unit ?? "",
      precision: m.precision ?? 0,
      data: groups.map((g) => resolveMetricsForRows(metrics2, g.rows)[mid] ?? 0)
    };
  });
  const colorOf = (k) => LEVEL_META[k]?.fill ?? PALETTE[labels.indexOf(k) % PALETTE.length];
  const drillable = (w.drill?.type ?? "none") !== "none";
  const footer = drillable ? /* @__PURE__ */ jsx20("div", { style: { marginTop: 8, textAlign: "right" }, children: /* @__PURE__ */ jsx20("button", { type: "button", onClick: onDrill, style: { fontSize: 12, color: "#1D4ED8", background: "none", border: "none", cursor: "pointer" }, children: "\u4E0B\u94BB\u4E2A\u4F53\u660E\u7EC6 \u2192" }) }) : null;
  const chartDesc = /* @__PURE__ */ jsxs19("span", { style: { fontSize: 11, color: "#94A3B8" }, children: [
    ds?.name,
    " \xB7 ",
    metricIds.map((id) => metricById(id)?.name).filter(Boolean).join(" / ")
  ] });
  if (w.type === "donut") {
    const data2 = groups.map((g) => ({ label: g.key, value: resolveMetricsForRows(metrics2, g.rows)[metricIds[0]] ?? 0, color: colorOf(g.key) }));
    const m0 = metricById(metricIds[0]);
    return /* @__PURE__ */ jsxs19(Panel, { title: w.title, desc: chartDesc, actions: editAction, className: "h-full", hoverTip: tip, children: [
      footer,
      /* @__PURE__ */ jsx20(DonutChart, { data: data2, centerLabel: m0?.name ?? metric?.name, centerValue: fmt(vals[metricIds[0]] ?? 0, m0?.precision ?? metric.precision, m0?.unit ?? metric.unit), height: H })
    ] });
  }
  if (w.type === "bar") {
    const ss = seriesOf();
    return /* @__PURE__ */ jsxs19(Panel, { title: w.title, desc: chartDesc, actions: editAction, className: "h-full", hoverTip: tip, children: [
      footer,
      /* @__PURE__ */ jsx20(BarChart, { labels, series: ss.map((s) => ({ name: s.name, color: s.color, data: s.data })), unit: ss[0]?.unit ?? metric.unit ?? "", height: H })
    ] });
  }
  if (w.type === "line") {
    const ss = seriesOf();
    return /* @__PURE__ */ jsxs19(Panel, { title: w.title, desc: chartDesc, actions: editAction, className: "h-full", hoverTip: tip, children: [
      footer,
      /* @__PURE__ */ jsx20(LineChart, { labels, series: ss.map((s) => ({ name: s.name, color: s.color, data: s.data })), unit: ss[0]?.unit ?? metric.unit ?? "", height: H })
    ] });
  }
  const cols = (w.dimensions ?? []).map((d) => {
    const f = ds.fields.find((x) => x.key === d);
    return { key: d, label: f?.label ?? d, type: d === "level" ? "badge" : "text" };
  });
  const trows = rows.map((r, i) => {
    const o = { id: String(i) };
    (w.dimensions ?? []).forEach((d) => {
      if (d === "level" && LEVEL_META[String(r[d])]) o[d] = { v: LEVEL_META[String(r[d])].label, kind: LEVEL_META[String(r[d])].badge };
      else o[d] = String(r[d] ?? "");
    });
    return o;
  });
  const tableActions = /* @__PURE__ */ jsxs19(Fragment18, { children: [
    drillable && /* @__PURE__ */ jsx20("button", { type: "button", onClick: onDrill, style: { fontSize: 12, color: "#1D4ED8", background: "none", border: "none", cursor: "pointer" }, children: "\u4E0B\u94BB \u2192" }),
    editAction
  ] });
  return /* @__PURE__ */ jsx20(Panel, { title: w.title, actions: tableActions, className: "h-full", hoverTip: tip, children: /* @__PURE__ */ jsx20(DataTable, { columns: cols, rows: trows, clickableKey: w.dimensions?.[0], onCellClick: (r) => {
    if (drillable && w.drill?.rowKey) {
      const raw = rows[Number(r.id)];
      const cid = raw?.[w.drill.rowKey];
      if (cid) nav(`/console/cr/mid-single-cust?cust=${cid}` + (custBack ? `&back=${encodeURIComponent(custBack)}&source=sc` : ``));
    }
  } }) });
}
function FilterControl({ f, rows, value, onChange }) {
  if (f.kind === "select") {
    const opts = Array.from(new Set(rows.map((r) => String(r[f.field ?? ""] ?? "")))).filter(Boolean);
    return /* @__PURE__ */ jsxs19("label", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#475569", minWidth: 140 }, children: [
      f.label,
      /* @__PURE__ */ jsxs19("select", { style: inp2, value: value ?? "", onChange: (e) => onChange(e.target.value), children: [
        /* @__PURE__ */ jsx20("option", { value: "", children: "\u5168\u90E8" }),
        opts.map((o) => /* @__PURE__ */ jsx20("option", { value: o, children: LEVEL_META[o]?.label ?? o }, o))
      ] })
    ] });
  }
  if (f.kind === "dateRange") {
    return /* @__PURE__ */ jsxs19("div", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#475569", minWidth: 200 }, children: [
      f.label,
      /* @__PURE__ */ jsxs19("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
        /* @__PURE__ */ jsx20("input", { style: inp2, type: "date", value: value?.from ?? "", onChange: (e) => onChange({ ...value, from: e.target.value }) }),
        /* @__PURE__ */ jsx20("span", { style: { color: "#94A3B8" }, children: "~" }),
        /* @__PURE__ */ jsx20("input", { style: inp2, type: "date", value: value?.to ?? "", onChange: (e) => onChange({ ...value, to: e.target.value }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs19("label", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#475569", minWidth: 160 }, children: [
    f.label,
    /* @__PURE__ */ jsx20("input", { style: inp2, value: value ?? "", placeholder: "\u5173\u952E\u8BCD", onChange: (e) => onChange(e.target.value) })
  ] });
}
function fmt(v, precision = 0, unit = "") {
  if (v === null || v === void 0 || Number.isNaN(v)) return "-";
  const n = Number(v);
  return `${n.toLocaleString(void 0, { maximumFractionDigits: precision, minimumFractionDigits: 0 })}${unit}`;
}

// src/console/ScoreModule.tsx
import { jsx as jsx21 } from "react/jsx-runtime";
var DASHBOARD_PAGES = {
  overview: "sc:overview",
  "score-dist": "sc:score-dist",
  "hit-analysis": "sc:hit-analysis",
  "model-effect": "sc:model-effect"
};
function ScoreModule({ pageKey }) {
  const cur = pageKey.split(":")[1] ?? "overview";
  const dashKey = DASHBOARD_PAGES[cur];
  if (dashKey) return /* @__PURE__ */ jsx21(MidDashboardPage, { pageKey: dashKey, crumbPrefix: "\u8BC4\u5206\u4EA7\u54C1" });
  switch (cur) {
    case "alert-workbench":
      return /* @__PURE__ */ jsx21(MidAlertWorkbench, {});
    case "score-records":
      return /* @__PURE__ */ jsx21(ScoreRecordsPage, {});
    case "crowd-groups":
      return /* @__PURE__ */ jsx21(ScoreCrowdPage, {});
    case "customer-list":
      return /* @__PURE__ */ jsx21(ScoreCustomerListPage, {});
    case "model-manage":
      return /* @__PURE__ */ jsx21(ScoreModelManagePage, {});
    case "model-detail":
      return /* @__PURE__ */ jsx21(ScoreModelDetailPage, {});
    case "dispose-flow":
      return /* @__PURE__ */ jsx21(ScoreDisposeFlowPage, {});
    default:
      return /* @__PURE__ */ jsx21(MidDashboardPage, { pageKey: "sc:overview", crumbPrefix: "\u8BC4\u5206\u4EA7\u54C1" });
  }
}
export {
  ScoreModule as default
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
