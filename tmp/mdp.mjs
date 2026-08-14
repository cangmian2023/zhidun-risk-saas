// src/console/MidDashboardPage.tsx
import { useMemo as useMemo3, useState as useState7 } from "react";

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
  fetch("/api/load-source-tag").then((r) => r.ok ? r.json() : null).then((data) => {
    if (data && typeof data.showSourceTags === "boolean") {
      if (data.showSourceTags !== showSourceTags) {
        showSourceTags = data.showSourceTags;
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

// src/components/charts.tsx
import { useState as useState4, useRef as useRef4, useEffect as useEffect4 } from "react";
import { Fragment as Fragment4, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs3("div", { ref: wrapRef, children: [
    /* @__PURE__ */ jsxs3("svg", { viewBox: `0 0 ${W} ${H}`, style: { height, width: width ?? "100%" }, onMouseMove: onMove, onMouseLeave: () => setHover(null), children: [
      Array.from({ length: grid + 1 }).map((_, i) => {
        const gy = padT + i / grid * plotH;
        const val = max - i / grid * (max - min);
        return /* @__PURE__ */ jsxs3("g", { children: [
          /* @__PURE__ */ jsx3("line", { x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: "#eef2f7", strokeWidth: 1 }),
          /* @__PURE__ */ jsxs3("text", { x: padL - 8, y: gy + 4, textAnchor: "end", className: "fill-slate-400", fontSize: 11, children: [
            Math.round(val),
            unit
          ] })
        ] }, i);
      }),
      labels.map((lb, i) => /* @__PURE__ */ jsx3("text", { x: x(i), y: H - 10, textAnchor: "middle", className: "fill-slate-400", fontSize: 11, children: lb }, lb)),
      series.map((s) => /* @__PURE__ */ jsx3(
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
        (s) => s.data.map((v, i) => /* @__PURE__ */ jsx3(
          "circle",
          {
            cx: x(i),
            cy: y(v),
            r: hover === i ? 5 : 3,
            fill: s.color,
            stroke: hover === i ? "#fff" : "none",
            strokeWidth: 2,
            style: { cursor: "crosshair", transition: "r .12s" },
            children: /* @__PURE__ */ jsx3("title", { children: `${labels[i]} \xB7 ${s.name}: ${v}${unit}` })
          },
          `${s.name}-${i}`
        ))
      ),
      hover != null && /* @__PURE__ */ jsxs3("g", { pointerEvents: "none", children: [
        /* @__PURE__ */ jsx3("line", { x1: x(hover), y1: padT, x2: x(hover), y2: padT + plotH, stroke: "#CBD5E1", strokeDasharray: "4 3", strokeWidth: 1 }),
        series.map((s) => {
          const v = s.data[hover] ?? 0;
          return /* @__PURE__ */ jsxs3("g", { children: [
            /* @__PURE__ */ jsx3("rect", { x: x(hover) - 34, y: Math.min(y(v) - 26, padT), width: 68, height: 20, rx: 6, fill: "#0F172A", opacity: 0.85 }),
            /* @__PURE__ */ jsxs3("text", { x: x(hover), y: Math.min(y(v) - 12, padT + 13), textAnchor: "middle", fontSize: 11, fontWeight: 600, fill: "#fff", children: [
              v,
              unit
            ] })
          ] }, s.name);
        }),
        /* @__PURE__ */ jsx3("text", { x: x(hover), y: H - 24, textAnchor: "middle", fontSize: 10, fill: "#64748B", children: labels[hover] })
      ] })
    ] }),
    /* @__PURE__ */ jsx3("div", { className: "mt-2 flex flex-wrap gap-4", children: series.map((s) => /* @__PURE__ */ jsxs3("span", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
      /* @__PURE__ */ jsx3("span", { className: "h-2.5 w-2.5 rounded-full", style: { background: s.color } }),
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
  const [hover, setHover] = useState4(null);
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = rect.width / W;
    const px = e.clientX - rect.left;
    const idx = Math.floor((px / ratio - padL) / plotW * labels.length);
    setHover(idx >= 0 && idx < labels.length ? idx : null);
  };
  return /* @__PURE__ */ jsxs3("div", { ref: wrapRef, children: [
    /* @__PURE__ */ jsxs3("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full", style: { height }, onMouseMove: onMove, onMouseLeave: () => setHover(null), children: [
      Array.from({ length: grid + 1 }).map((_, i) => {
        const gy = padT + i / grid * plotH;
        const val = max - i / grid * max;
        return /* @__PURE__ */ jsxs3("g", { children: [
          /* @__PURE__ */ jsx3("line", { x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: "#eef2f7", strokeWidth: 1 }),
          /* @__PURE__ */ jsxs3("text", { x: padL - 8, y: gy + 4, textAnchor: "end", className: "fill-slate-400", fontSize: 11, children: [
            Math.round(val),
            unit
          ] })
        ] }, i);
      }),
      labels.map((lb, gi) => {
        const gx = padL + gi * groupW + groupW / 2;
        return /* @__PURE__ */ jsxs3("g", { children: [
          series.map((s, si) => {
            const v = s.data[gi] ?? 0;
            const bx = gx - series.length * barW / 2 + si * barW;
            const on = hover === gi;
            return /* @__PURE__ */ jsx3(
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
                children: /* @__PURE__ */ jsx3("title", { children: `${lb} \xB7 ${s.name}: ${v}${unit}` })
              },
              s.name
            );
          }),
          /* @__PURE__ */ jsx3("text", { x: gx, y: H - 10, textAnchor: "middle", className: "fill-slate-400", fontSize: 11, children: lb })
        ] }, lb);
      }),
      hover != null && /* @__PURE__ */ jsx3("g", { pointerEvents: "none", children: series.map((s, si) => {
        const v = s.data[hover] ?? 0;
        const gx = padL + hover * groupW + groupW / 2;
        const bx = gx - series.length * barW / 2 + si * barW;
        return /* @__PURE__ */ jsxs3("g", { children: [
          /* @__PURE__ */ jsx3("rect", { x: bx, y: y(v) - 22, width: barW, height: 18, rx: 4, fill: s.color }),
          /* @__PURE__ */ jsxs3("text", { x: bx + (barW - 3) / 2, y: y(v) - 9, textAnchor: "middle", fontSize: 10, fontWeight: 600, fill: "#fff", children: [
            v,
            unit
          ] })
        ] }, s.name);
      }) })
    ] }),
    /* @__PURE__ */ jsx3("div", { className: "mt-2 flex flex-wrap gap-4", children: series.map((s) => /* @__PURE__ */ jsxs3("span", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
      /* @__PURE__ */ jsx3("span", { className: "h-2.5 w-2.5 rounded-full", style: { background: s.color } }),
      s.name
    ] }, s.name)) })
  ] });
}
function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 220
}) {
  const size = height;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  let acc = 0;
  const segs = data.map((d) => {
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
  const [hover, setHover] = useState4(null);
  const hov = hover != null ? segs[hover] : null;
  const hovFrac = hov ? hov.d.value / total : 0;
  return /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-6", children: [
    /* @__PURE__ */ jsxs3("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, className: "shrink-0", children: [
      /* @__PURE__ */ jsx3("circle", { cx, cy, r, fill: "none", stroke: "#eef2f7", strokeWidth: stroke }),
      segs.map((s, i) => /* @__PURE__ */ jsx3(
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
          children: /* @__PURE__ */ jsx3("title", { children: `${s.d.label}: ${s.d.value}\uFF08${(s.d.value / total * 100).toFixed(1)}%\uFF09` })
        },
        i
      )),
      hov ? /* @__PURE__ */ jsxs3(Fragment4, { children: [
        /* @__PURE__ */ jsxs3("text", { x: cx, y: cy - 4, textAnchor: "middle", fill: hov.d.color, fontSize: 22, fontWeight: 700, children: [
          (hovFrac * 100).toFixed(1),
          "%"
        ] }),
        /* @__PURE__ */ jsx3("text", { x: cx, y: cy + 16, textAnchor: "middle", className: "fill-slate-500", fontSize: 12, children: hov.d.label })
      ] }) : /* @__PURE__ */ jsxs3(Fragment4, { children: [
        centerValue && /* @__PURE__ */ jsx3("text", { x: cx, y: cy - 4, textAnchor: "middle", className: "fill-ink-900", fontSize: 22, fontWeight: 700, children: centerValue }),
        centerLabel && /* @__PURE__ */ jsx3("text", { x: cx, y: cy + 16, textAnchor: "middle", className: "fill-slate-400", fontSize: 12, children: centerLabel })
      ] })
    ] }),
    /* @__PURE__ */ jsx3("div", { className: "space-y-2", children: data.map((d, i) => /* @__PURE__ */ jsxs3(
      "div",
      {
        className: "flex items-center gap-2 text-sm",
        onMouseEnter: () => setHover(i),
        onMouseLeave: () => setHover(null),
        style: { cursor: "pointer", borderRadius: 8, padding: "2px 6px", background: hover === i ? "#F1F5F9" : "transparent" },
        children: [
          /* @__PURE__ */ jsx3("span", { className: "h-2.5 w-2.5 rounded-full", style: { background: d.color } }),
          /* @__PURE__ */ jsx3("span", { className: "text-slate-600", children: d.label }),
          /* @__PURE__ */ jsxs3("span", { className: "ml-auto font-medium tabular-nums text-ink-900", children: [
            d.value,
            /* @__PURE__ */ jsxs3("span", { className: "ml-1 text-xs text-slate-400", children: [
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

// src/console/PageShell.tsx
import { Fragment as Fragment5, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function PageShell({
  title,
  subtitle,
  crumb,
  actions,
  header,
  legend = true
}) {
  return /* @__PURE__ */ jsxs4(Fragment5, { children: [
    header ?? /* @__PURE__ */ jsx4(PageHeader, { title: title ?? "", subtitle, crumb, actions }),
    legend && /* @__PURE__ */ jsx4(SourceTagLegend, {})
  ] });
}

// src/console/FlowActionBar.tsx
import { useState as useState6 } from "react";

// src/console/flowStore.ts
import { useSyncExternalStore as useSyncExternalStore2 } from "react";

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
var version = 0;
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
var listeners2 = /* @__PURE__ */ new Set();
function subscribe2(fn) {
  listeners2.add(fn);
  return () => {
    listeners2.delete(fn);
  };
}
function getSnapshot() {
  return version;
}
function useFlowsVersion() {
  return useSyncExternalStore2(subscribe2, getSnapshot);
}
function useFlows() {
  useFlowsVersion();
  return flows;
}

// src/console/FlowConfirmModal.tsx
import { useState as useState5 } from "react";
import { Fragment as Fragment6, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx5(
    Modal,
    {
      title: `${flowName} \xB7 ${action}`,
      open,
      onClose,
      zIndex: 200,
      footer: /* @__PURE__ */ jsxs5(Fragment6, { children: [
        /* @__PURE__ */ jsx5(Button, { variant: "ghost", onClick: onClose, children: "\u53D6\u6D88" }),
        /* @__PURE__ */ jsx5(Button, { variant: "primary", onClick: () => onConfirm(opinion.trim()), children: "\u786E\u8BA4\u6D41\u8F6C" })
      ] }),
      children: /* @__PURE__ */ jsxs5("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs5("div", { className: "text-xs text-slate-400", children: [
          "\u4E1A\u52A1\u6D41\u7A0B\uFF1A",
          /* @__PURE__ */ jsx5("span", { className: "font-medium text-slate-600", children: flowName })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsx5("span", { className: "rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700", children: from }),
          /* @__PURE__ */ jsxs5("span", { className: "text-slate-400", children: [
            "\u2500[",
            action,
            "]\u2192"
          ] }),
          /* @__PURE__ */ jsx5("span", { className: "rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700", children: to })
        ] }),
        /* @__PURE__ */ jsxs5("div", { children: [
          /* @__PURE__ */ jsx5("div", { className: "mb-1 text-xs text-slate-400", children: "\u5BA1\u6279\u610F\u89C1\uFF08\u53EF\u9009\uFF09" }),
          /* @__PURE__ */ jsx5(
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
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function FlowActionBar({ flowId, state, onStateChange, onSave, saveLabel = "\u4FDD\u5B58", matchObj }) {
  const flows2 = useFlows();
  const f = flowId ? flows2.find((x) => x.id === flowId) : void 0;
  const { graph, steps, name } = matchFlowGraph(f, matchObj ?? {});
  const [confirm, setConfirm] = useState6(null);
  const hasFlow = !!(f && steps.length);
  if (!hasFlow && !onSave) return null;
  return /* @__PURE__ */ jsxs6("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 10, padding: "8px 12px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10 }, children: [
    onSave && /* @__PURE__ */ jsx6(
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
      return /* @__PURE__ */ jsxs6("span", { style: { display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, padding: "3px 8px" }, children: [
        /* @__PURE__ */ jsx6("span", { style: { fontSize: 12, color: "#64748B" }, children: name || f.name }),
        /* @__PURE__ */ jsxs6("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: sc, background: `${sc}1A`, borderRadius: 10, padding: "1px 9px" }, children: [
          /* @__PURE__ */ jsx6("span", { style: { width: 6, height: 6, borderRadius: "50%", background: sc, display: "inline-block" } }),
          st
        ] }),
        step?.next && onStateChange && /* @__PURE__ */ jsx6(
          "button",
          {
            type: "button",
            onClick: () => setConfirm({ f, step }),
            style: { height: 22, padding: "0 12px", fontSize: 12, borderRadius: 6, border: "none", cursor: "pointer", background: "#2563EB", color: "#fff", fontWeight: 500 },
            children: step.action
          }
        ),
        tl != null && /* @__PURE__ */ jsxs6("span", { style: { fontSize: 12, fontWeight: 600, color: "#B45309", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, padding: "1px 9px", whiteSpace: "nowrap" }, children: [
          "\u8282\u70B9\u65F6\u9650 ",
          tl,
          " \u5206\u949F"
        ] })
      ] });
    })(),
    /* @__PURE__ */ jsx6(
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
function loadOne(file) {
  return fetch(`/api/load-mid?file=${encodeURIComponent(file)}`).then((r) => r.ok ? r.json() : null).catch(() => null);
}
function saveOne(file, data) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
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
var saveStatus = "idle";
var statusListeners = /* @__PURE__ */ new Set();
var timers = {};
function notify() {
  version2 += 1;
  listeners3.forEach((l) => l());
}
function setSaveStatus(s) {
  saveStatus = s;
  statusListeners.forEach((l) => l(s));
}
function scheduleSave(file, data) {
  if (timers[file]) clearTimeout(timers[file]);
  setSaveStatus("saving");
  timers[file] = setTimeout(() => saveOne(FILES[file], data), 350);
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
    for (const [file, data, arr] of [
      ["midDataSources.json", ds, true],
      ["midMetrics.json", mt, true],
      ["midStrategy.json", st, false],
      ["midDashboards.json", db, true],
      ["midAlerts.json", al, true],
      ["midCustomers.json", cu, true],
      ["midDisposeTasks.json", dp, true]
    ]) {
      if (data == null) console.warn(`[mid][dev] ${file} \u7F3A\u5931\uFF0C\u5DF2\u7528 SEED \u843D\u76D8`);
      else if (arr && !Array.isArray(data)) console.warn(`[mid][dev] ${file} \u671F\u671B\u6570\u7EC4\uFF0C\u5B9E\u9645\u4E3A ${typeof data}`);
      else if (!arr && (typeof data !== "object" || Array.isArray(data))) console.warn(`[mid][dev] ${file} \u671F\u671B\u5BF9\u8C61`);
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
function subscribe3(l) {
  listeners3.add(l);
  return () => {
    listeners3.delete(l);
  };
}
function getVersion() {
  return version2;
}
function useSnap(sel) {
  useSyncExternalStore3(subscribe3, getVersion);
  return sel();
}
function useMidDataSources() {
  return useSnap(() => dataSources);
}
function useMidMetrics() {
  return useSnap(() => metrics);
}
function useMidDashboards() {
  return useSnap(() => dashboards);
}
function updateDataSources(fn) {
  dataSources = fn(dataSources);
  notify();
  scheduleSave("dataSources", dataSources);
}

// src/console/MidDashboardPage.tsx
import { Fragment as Fragment7, jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var PALETTE = ["#2563EB", "#0891B2", "#7C3AED", "#DB2777", "#EA580C", "#16A34A", "#CA8A04", "#475569"];
var inp = { padding: "5px 8px", borderRadius: 6, border: "1px solid #E2E8F0", fontSize: 12, background: "#fff" };
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
  const page = useMemo3(() => dashboards2.find((d) => d.key === pageKey), [dashboards2, pageKey]);
  const dsById = (id) => sources.find((s) => s.id === id);
  const metricById = (id) => metrics2.find((m) => m.id === id);
  const [filters, setFilters] = useState7({});
  const [dlWidget, setDlWidget] = useState7(null);
  const [dlOpen, setDlOpen] = useState7(false);
  const [dlRow, setDlRow] = useState7(null);
  if (!page) {
    return /* @__PURE__ */ jsx7("div", { style: { padding: 24 }, children: /* @__PURE__ */ jsx7(PageShell, { title: "\u76D1\u63A7\u770B\u677F", crumb: "\u96F6\u552E\u4FE1\u8D37\u98CE\u63A7 / \u8D37\u4E2D\u76D1\u63A7", subtitle: "\u6682\u65E0\u9875\u9762\u914D\u7F6E" }) });
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
  const drillTo = (w) => {
    if ((w.drill?.type ?? "none") === "none" || !w.drill?.rowKey) return;
    const rows = filteredRows(w.datasetId);
    const firstCust = rows.find((r) => r[w.drill.rowKey])?.[w.drill.rowKey];
    if (firstCust) nav(`/console/cr/mid-single-cust?cust=${firstCust}`);
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
  return /* @__PURE__ */ jsxs7("div", { style: { padding: 24, maxWidth: 1280 }, children: [
    /* @__PURE__ */ jsx7(
      PageShell,
      {
        title: page.name,
        crumb: `${crumbPrefix ?? "\u96F6\u552E\u4FE1\u8D37\u98CE\u63A7 / \u8D37\u4E2D\u76D1\u63A7"} / ${page.group}`,
        subtitle: page.desc,
        actions: /* @__PURE__ */ jsxs7(Fragment7, { children: [
          /* @__PURE__ */ jsx7(Sam, { label: "\u9875\u9762\u914D\u7F6E", value: "midDashboards.json" }),
          /* @__PURE__ */ jsx7(Sam, { label: "\u6837\u4F8B\u6570\u636E", value: `${pageDs.reduce((a, s) => a + (s.rows?.length || 0), 0)} \u884C` }),
          /* @__PURE__ */ jsx7(Cal, { label: "\u5B9E\u65F6\u8BA1\u7B97" })
        ] })
      }
    ),
    page.filters && page.filters.length > 0 && /* @__PURE__ */ jsxs7("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", margin: "4px 0 16px", padding: 12, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12 }, children: [
      page.filters.map((f) => /* @__PURE__ */ jsx7(FilterControl, { f, rows: pageDs.flatMap((s) => s.rows ?? []), value: filters[f.id], onChange: (v) => setFilters((p) => ({ ...p, [f.id]: v })) }, f.id)),
      /* @__PURE__ */ jsx7("button", { type: "button", onClick: () => setFilters({}), style: { ...inp, cursor: "pointer", color: "#64748B", borderColor: "#E2E8F0" }, children: "\u91CD\u7F6E" })
    ] }),
    /* @__PURE__ */ jsx7("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, alignItems: "stretch" }, children: page.widgets.map((w) => /* @__PURE__ */ jsx7("div", { style: { gridColumn: `span ${widgetColSpan(w)}`, height: "100%" }, children: /* @__PURE__ */ jsx7(WidgetView, { w, ds: dsById(w.datasetId), metric: metricById(w.metricId ?? w.metricIds?.[0] ?? ""), metrics: metrics2, rows: widgetRows(w), onDrill: () => drillTo(w), onDetail: () => openDetail(w), nav }) }, w.id)) }),
    /* @__PURE__ */ jsx7(RightDrawer, { open: dlOpen, onClose: () => setDlOpen(false), title: `${dlWidget?.title ?? "\u7EC4\u4EF6"} \xB7 \u6570\u636E\u660E\u7EC6`, width: 620, level: 1, children: dlDs ? /* @__PURE__ */ jsxs7(Fragment7, { children: [
      /* @__PURE__ */ jsxs7("div", { style: { marginBottom: 10, fontSize: 12, color: "#64748B" }, children: [
        dlDs.name,
        " \xB7 ",
        dlMetric?.name ?? "",
        " \xB7 ",
        dlRows.length,
        " \u884C\uFF08\u70B9\u51FB\u884C\u300C\u8BE6\u60C5\u300D\u67E5\u770B\u5355\u884C\u5B57\u6BB5\u540D / \u5B57\u6BB5\u503C\uFF09"
      ] }),
      /* @__PURE__ */ jsx7(
        DataTable,
        {
          columns: dlCols,
          rows: dlTrows,
          clickableKey: dlCols[0]?.key,
          onCellClick: (r) => setDlRow(Number(r.id)),
          actions: (r) => /* @__PURE__ */ jsx7("button", { type: "button", onClick: () => setDlRow(Number(r.id)), style: { fontSize: 12, color: "#1D4ED8", background: "none", border: "none", cursor: "pointer" }, children: "\u8BE6\u60C5" }),
          pager: true,
          defaultPageSize: 15,
          empty: "\u6682\u65E0\u6570\u636E"
        }
      )
    ] }) : /* @__PURE__ */ jsx7("div", { style: { fontSize: 12, color: "#94A3B8" }, children: "\u6570\u636E\u96C6\u672A\u627E\u5230" }) }),
    /* @__PURE__ */ jsxs7(RightDrawer, { open: dlOpen && dlRow != null, onClose: () => setDlRow(null), title: `${dlWidget?.title ?? "\u7EC4\u4EF6"} \xB7 \u6570\u636E\u8BE6\u60C5`, width: 400, level: 2, children: [
      dlRowData && dlDs && /* @__PURE__ */ jsx7(
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
      dlRowData && dlDs && /* @__PURE__ */ jsx7("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 }, children: /* @__PURE__ */ jsx7("tbody", { children: dlDs.fields.map((f) => /* @__PURE__ */ jsxs7("tr", { style: { borderTop: "1px solid #F1F5F9" }, children: [
        /* @__PURE__ */ jsx7("td", { style: { padding: "8px 12px", width: "42%", fontWeight: 600, color: "#334155", background: "#F8FAFC" }, children: f.label ?? f.key }),
        /* @__PURE__ */ jsx7("td", { style: { padding: "8px 12px", color: "#0F172A", wordBreak: "break-all" }, children: String(dlRowData[f.key] ?? "") })
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
  const editAction = /* @__PURE__ */ jsxs7("div", { style: { display: "flex", gap: 6 }, children: [
    onDetail && /* @__PURE__ */ jsx7("button", { type: "button", onClick: () => onDetail(), style: { fontSize: 12, color: "#1D4ED8", background: "none", border: "1px solid #C7D2FE", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }, children: "\u6570\u636E\u8BE6\u60C5" }),
    onEdit && /* @__PURE__ */ jsx7("button", { type: "button", onClick: onEdit, style: { fontSize: 12, color: "#1D4ED8", background: "none", border: "1px solid #C7D2FE", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }, children: "\u7F16\u8F91" }),
    onDelete && /* @__PURE__ */ jsx7("button", { type: "button", onClick: onDelete, style: { fontSize: 12, color: "#B91C1C", background: "none", border: "1px solid #FECACA", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }, children: "\u5220\u9664" })
  ] });
  if (!ds || !metric) return /* @__PURE__ */ jsx7(Panel, { title: w.title, actions: editAction, className: "h-full", hoverTip: tip, children: /* @__PURE__ */ jsx7("div", { style: { fontSize: 12, color: "#94A3B8" }, children: "\u914D\u7F6E\u7F3A\u5931\uFF1A\u6570\u636E\u96C6\u6216\u6307\u6807\u672A\u627E\u5230" }) });
  const vals = resolveMetricsForRows(metrics2, rows);
  if (w.type === "metric") {
    const ids = (w.metricIds?.length ? w.metricIds : [w.metricId]).filter(Boolean).filter((id) => metricById(id));
    const cards = ids.map((id) => {
      const m = metricById(id);
      const v = vals[id] ?? 0;
      return /* @__PURE__ */ jsx7(StatCard, { label: m.name, value: fmt(v, m.precision, m.unit), accent: "brand" }, id);
    });
    return /* @__PURE__ */ jsx7(Panel, { title: w.title, actions: editAction, className: "h-full", hoverTip: tip, children: cards.length ? /* @__PURE__ */ jsx7("div", { style: { display: "grid", gridTemplateColumns: ids.length > 1 ? "repeat(auto-fit, minmax(150px, 1fr))" : "1fr", gap: 12 }, children: cards }) : /* @__PURE__ */ jsx7("div", { style: { fontSize: 12, color: "#94A3B8" }, children: "\u672A\u914D\u7F6E\u6307\u6807" }) });
  }
  const dim = w.dimensions?.[0];
  if (!dim) return /* @__PURE__ */ jsx7(Panel, { title: w.title, className: "h-full", hoverTip: tip, children: /* @__PURE__ */ jsx7("div", { style: { fontSize: 12, color: "#94A3B8" }, children: "\u672A\u914D\u7F6E\u7EF4\u5EA6\u5B57\u6BB5" }) });
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
  const footer = drillable ? /* @__PURE__ */ jsx7("div", { style: { marginTop: 8, textAlign: "right" }, children: /* @__PURE__ */ jsx7("button", { type: "button", onClick: onDrill, style: { fontSize: 12, color: "#1D4ED8", background: "none", border: "none", cursor: "pointer" }, children: "\u4E0B\u94BB\u4E2A\u4F53\u660E\u7EC6 \u2192" }) }) : null;
  const chartDesc = /* @__PURE__ */ jsxs7("span", { style: { fontSize: 11, color: "#94A3B8" }, children: [
    ds?.name,
    " \xB7 ",
    metricIds.map((id) => metricById(id)?.name).filter(Boolean).join(" / ")
  ] });
  if (w.type === "donut") {
    const data = groups.map((g) => ({ label: g.key, value: resolveMetricsForRows(metrics2, g.rows)[metricIds[0]] ?? 0, color: colorOf(g.key) }));
    const m0 = metricById(metricIds[0]);
    return /* @__PURE__ */ jsxs7(Panel, { title: w.title, desc: chartDesc, actions: editAction, className: "h-full", hoverTip: tip, children: [
      footer,
      /* @__PURE__ */ jsx7(DonutChart, { data, centerLabel: m0?.name ?? metric?.name, centerValue: fmt(vals[metricIds[0]] ?? 0, m0?.precision ?? metric.precision, m0?.unit ?? metric.unit), height: H })
    ] });
  }
  if (w.type === "bar") {
    const ss = seriesOf();
    return /* @__PURE__ */ jsxs7(Panel, { title: w.title, desc: chartDesc, actions: editAction, className: "h-full", hoverTip: tip, children: [
      footer,
      /* @__PURE__ */ jsx7(BarChart, { labels, series: ss.map((s) => ({ name: s.name, color: s.color, data: s.data })), unit: ss[0]?.unit ?? metric.unit ?? "", height: H })
    ] });
  }
  if (w.type === "line") {
    const ss = seriesOf();
    return /* @__PURE__ */ jsxs7(Panel, { title: w.title, desc: chartDesc, actions: editAction, className: "h-full", hoverTip: tip, children: [
      footer,
      /* @__PURE__ */ jsx7(LineChart, { labels, series: ss.map((s) => ({ name: s.name, color: s.color, data: s.data })), unit: ss[0]?.unit ?? metric.unit ?? "", height: H })
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
  const tableActions = /* @__PURE__ */ jsxs7(Fragment7, { children: [
    drillable && /* @__PURE__ */ jsx7("button", { type: "button", onClick: onDrill, style: { fontSize: 12, color: "#1D4ED8", background: "none", border: "none", cursor: "pointer" }, children: "\u4E0B\u94BB \u2192" }),
    editAction
  ] });
  return /* @__PURE__ */ jsx7(Panel, { title: w.title, actions: tableActions, className: "h-full", hoverTip: tip, children: /* @__PURE__ */ jsx7(DataTable, { columns: cols, rows: trows, clickableKey: w.dimensions?.[0], onCellClick: (r) => {
    if (drillable && w.drill?.rowKey) {
      const raw = rows[Number(r.id)];
      const cid = raw?.[w.drill.rowKey];
      if (cid) nav(`/console/cr/mid-single-cust?cust=${cid}`);
    }
  } }) });
}
function FilterControl({ f, rows, value, onChange }) {
  if (f.kind === "select") {
    const opts = Array.from(new Set(rows.map((r) => String(r[f.field ?? ""] ?? "")))).filter(Boolean);
    return /* @__PURE__ */ jsxs7("label", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#475569", minWidth: 140 }, children: [
      f.label,
      /* @__PURE__ */ jsxs7("select", { style: inp, value: value ?? "", onChange: (e) => onChange(e.target.value), children: [
        /* @__PURE__ */ jsx7("option", { value: "", children: "\u5168\u90E8" }),
        opts.map((o) => /* @__PURE__ */ jsx7("option", { value: o, children: LEVEL_META[o]?.label ?? o }, o))
      ] })
    ] });
  }
  if (f.kind === "dateRange") {
    return /* @__PURE__ */ jsxs7("div", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#475569", minWidth: 200 }, children: [
      f.label,
      /* @__PURE__ */ jsxs7("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
        /* @__PURE__ */ jsx7("input", { style: inp, type: "date", value: value?.from ?? "", onChange: (e) => onChange({ ...value, from: e.target.value }) }),
        /* @__PURE__ */ jsx7("span", { style: { color: "#94A3B8" }, children: "~" }),
        /* @__PURE__ */ jsx7("input", { style: inp, type: "date", value: value?.to ?? "", onChange: (e) => onChange({ ...value, to: e.target.value }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs7("label", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#475569", minWidth: 160 }, children: [
    f.label,
    /* @__PURE__ */ jsx7("input", { style: inp, value: value ?? "", placeholder: "\u5173\u952E\u8BCD", onChange: (e) => onChange(e.target.value) })
  ] });
}
function fmt(v, precision = 0, unit = "") {
  if (v === null || v === void 0 || Number.isNaN(v)) return "-";
  const n = Number(v);
  return `${n.toLocaleString(void 0, { maximumFractionDigits: precision, minimumFractionDigits: 0 })}${unit}`;
}
export {
  WidgetView,
  MidDashboardPage as default,
  widgetColSpan
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
