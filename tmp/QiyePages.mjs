// src/console/QiyePages.tsx
import { useMemo as useMemo3, useState as useState4 } from "react";

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
  fetch("/api/load-source-tag").then((r) => r.ok ? r.json() : null).then((data3) => {
    if (data3 && typeof data3.showSourceTags === "boolean") {
      if (data3.showSourceTags !== showSourceTags) {
        showSourceTags = data3.showSourceTags;
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

// src/console/qiyeData.ts
import { useSyncExternalStore as useSyncExternalStore2 } from "react";
var SEED_QIYE = {
  enterprises: [
    {
      keyNo: "51f9f32bfadbcbbca4ab1e9e59efabe4",
      name: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8",
      status: "\u5B58\u7EED",
      tags: ["\u4E13\u7CBE\u7279\u65B0\u4E2D\u5C0F\u4F01\u4E1A", "\u66FE\u7528\u540D\uFF1A\u6C38\u548C\u98DF\u54C1\u6709\u9650\u516C\u53F8"],
      industry: "\u519C\u526F\u98DF\u54C1\u52A0\u5DE5\u4E1A",
      creditCode: "91310000MA1FL5X1X2",
      regNo: "310000000152345",
      legalPerson: "\u6797\u5EFA\u96C4",
      regCapital: 68e3,
      paidCapital: 51200,
      regDate: "2004-07-15",
      regAddr: "\u4E0A\u6D77\u5E02\u9759\u5B89\u533A\u6C5F\u573A\u897F\u8DEF160\u53F7501-19\u5BA4",
      bizScope: "\u98DF\u54C1\u751F\u4EA7\uFF0C\u98DF\u54C1\u9500\u552E\uFF0C\u98DF\u7528\u519C\u4EA7\u54C1\u6279\u53D1\u3001\u96F6\u552E\uFF0C\u9910\u996E\u670D\u52A1\uFF0C\u8D27\u7269\u6216\u6280\u672F\u8FDB\u51FA\u53E3\uFF08\u56FD\u5BB6\u7981\u6B62\u6216\u6D89\u53CA\u884C\u653F\u5BA1\u6279\u7684\u8D27\u7269\u548C\u6280\u672F\u8FDB\u51FA\u53E3\u9664\u5916\uFF09\u3002",
      email: "zcb@yonho.com",
      website: "www.yonho.com",
      phone: "021-5666****",
      employees: 2380,
      followed: false,
      kcScore: 824,
      shareholders: [
        { name: "\u6797\u5EFA\u96C4", ratio: 38.6, amount: 26248, type: "\u81EA\u7136\u4EBA" },
        { name: "\u4E0A\u6D77\u6C38\u548C\u5B9E\u4E1A\u96C6\u56E2\u6709\u9650\u516C\u53F8", ratio: 27.2, amount: 18496, type: "\u4F01\u4E1A\u6CD5\u4EBA" },
        { name: "\u4E2D\u56FD\u519C\u57A6\u4EA7\u4E1A\u53D1\u5C55\u57FA\u91D1\uFF08\u6709\u9650\u5408\u4F19\uFF09", ratio: 14.1, amount: 9588, type: "\u4F01\u4E1A\u6CD5\u4EBA" },
        { name: "\u516C\u4F17\u6D41\u901A\u80A1", ratio: 20.1, amount: 13668, type: "\u5176\u4ED6" }
      ],
      persons: [
        { name: "\u6797\u5EFA\u96C4", position: "\u8463\u4E8B\u957F / \u6CD5\u5B9A\u4EE3\u8868\u4EBA" },
        { name: "\u9648\u5FD7\u660E", position: "\u8463\u4E8B / \u603B\u7ECF\u7406" },
        { name: "\u738B\u60E0\u82B3", position: "\u8463\u4E8B / \u8D22\u52A1\u8D1F\u8D23\u4EBA" },
        { name: "\u674E\u5EFA\u56FD", position: "\u8463\u4E8B\u4F1A\u79D8\u4E66" },
        { name: "\u5F20\u654F", position: "\u76D1\u4E8B\u4F1A\u4E3B\u5E2D" },
        { name: "\u8D75\u78CA", position: "\u526F\u603B\u7ECF\u7406" },
        { name: "\u5B59\u6587", position: "\u526F\u603B\u7ECF\u7406" },
        { name: "\u5468\u5029", position: "\u72EC\u7ACB\u8463\u4E8B" }
      ],
      invests: [
        { name: "\u6C38\u548C\uFF08\u4E0A\u6D77\uFF09\u98DF\u54C1\u6709\u9650\u516C\u53F8", ratio: 100, legal: "\u9648\u5FD7\u660E", status: "\u5B58\u7EED" },
        { name: "\u6C38\u548C\u98DF\u54C1\uFF08\u6C88\u9633\uFF09\u6709\u9650\u516C\u53F8", ratio: 85, legal: "\u674E\u5EFA\u56FD", status: "\u5B58\u7EED" },
        { name: "\u6C38\u548C\uFF08\u6210\u90FD\uFF09\u9910\u996E\u7BA1\u7406\u6709\u9650\u516C\u53F8", ratio: 70, legal: "\u8D75\u78CA", status: "\u5B58\u7EED" },
        { name: "\u4E0A\u6D77\u6C38\u548C\u8C46\u6D46\u9910\u996E\u7BA1\u7406\u6709\u9650\u516C\u53F8", ratio: 90, legal: "\u5B59\u6587", status: "\u5B58\u7EED" },
        { name: "\u6C38\u548C\u98DF\u54C1\uFF08\u6B66\u6C49\uFF09\u6709\u9650\u516C\u53F8", ratio: 60, legal: "\u9648\u5FD7\u660E", status: "\u5728\u4E1A" },
        { name: "\u6C38\u548C\uFF08\u5E7F\u5DDE\uFF09\u4F9B\u5E94\u94FE\u6709\u9650\u516C\u53F8", ratio: 55, legal: "\u738B\u60E0\u82B3", status: "\u5B58\u7EED" },
        { name: "\u6C38\u548C\u98DF\u54C1\u7814\u7A76\u9662\u6709\u9650\u516C\u53F8", ratio: 100, legal: "\u6797\u5EFA\u96C4", status: "\u5B58\u7EED" },
        { name: "\u6C38\u548C\u6D77\u5916\u63A7\u80A1\uFF08\u9999\u6E2F\uFF09\u6709\u9650\u516C\u53F8", ratio: 100, legal: "\u5468\u5029", status: "\u6CE8\u518C\u5730\u9999\u6E2F" }
      ],
      branches: [
        { name: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8\u5317\u4EAC\u5206\u516C\u53F8", addr: "\u5317\u4EAC\u5E02\u671D\u9633\u533A\u5EFA\u56FD\u8DEF88\u53F7" },
        { name: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8\u5E7F\u5DDE\u5206\u516C\u53F8", addr: "\u5E7F\u5DDE\u5E02\u5929\u6CB3\u533A\u5929\u6CB3\u8DEF208\u53F7" },
        { name: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8\u6210\u90FD\u5206\u516C\u53F8", addr: "\u6210\u90FD\u5E02\u6B66\u4FAF\u533A\u4EBA\u6C11\u5357\u8DEF\u56DB\u6BB5" },
        { name: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8\u6DF1\u5733\u5206\u516C\u53F8", addr: "\u6DF1\u5733\u5E02\u5357\u5C71\u533A\u79D1\u6280\u56ED\u5317\u533A" },
        { name: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8\u6B66\u6C49\u5206\u516C\u53F8", addr: "\u6B66\u6C49\u5E02\u6C5F\u6C49\u533A\u89E3\u653E\u5927\u9053" },
        { name: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8\u5357\u4EAC\u5206\u516C\u53F8", addr: "\u5357\u4EAC\u5E02\u9F13\u697C\u533A\u4E2D\u5C71\u8DEF" },
        { name: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8\u676D\u5DDE\u5206\u516C\u53F8", addr: "\u676D\u5DDE\u5E02\u897F\u6E56\u533A\u6587\u4E09\u8DEF" },
        { name: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8\u897F\u5B89\u5206\u516C\u53F8", addr: "\u897F\u5B89\u5E02\u96C1\u5854\u533A\u9AD8\u65B0\u533A" },
        { name: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8\u6C88\u9633\u5206\u516C\u53F8", addr: "\u6C88\u9633\u5E02\u548C\u5E73\u533A\u9752\u5E74\u5927\u8857" }
      ],
      changes: [
        { date: "2026-08-02", item: "\u6CE8\u518C\u8D44\u672C", before: "65000 \u4E07\u5143", after: "68000 \u4E07\u5143" },
        { date: "2025-11-18", item: "\u6CD5\u5B9A\u4EE3\u8868\u4EBA", before: "\u6797\u5EFA\u96C4", after: "\u6797\u5EFA\u96C4" },
        { date: "2025-06-30", item: "\u7ECF\u8425\u8303\u56F4", before: "\u98DF\u54C1\u751F\u4EA7\u3001\u9500\u552E", after: "\u98DF\u54C1\u751F\u4EA7\uFF0C\u98DF\u54C1\u9500\u552E\uFF0C\u9910\u996E\u670D\u52A1\uFF0C\u8D27\u7269\u8FDB\u51FA\u53E3" },
        { date: "2024-09-12", item: "\u8463\u4E8B\u5907\u6848", before: "\uFF088 \u4EBA\uFF09", after: "\uFF08\u65B0\u589E\u72EC\u7ACB\u8463\u4E8B \u5468\u5029\uFF09" },
        { date: "2023-12-05", item: "\u6CE8\u518C\u8D44\u672C", before: "60000 \u4E07\u5143", after: "65000 \u4E07\u5143" }
      ],
      legalCases: [
        { id: "LA-2026-0312", title: "\u6C38\u548C\u98DF\u54C1\u8BC9\u67D0\u7ECF\u9500\u5546\u4E70\u5356\u5408\u540C\u7EA0\u7EB7", type: "\u4E70\u5356\u5408\u540C\u7EA0\u7EB7", date: "2026-03-12", role: "\u539F\u544A", amount: 386, status: "\u5DF2\u5224\u51B3" },
        { id: "LA-2025-1882", title: "\u67D0\u4F9B\u5E94\u5546\u8BC9\u6C38\u548C\u98DF\u54C1\u627F\u63FD\u5408\u540C\u7EA0\u7EB7", type: "\u627F\u63FD\u5408\u540C\u7EA0\u7EB7", date: "2025-11-20", role: "\u88AB\u544A", amount: 142, status: "\u8C03\u89E3\u7ED3\u6848" },
        { id: "LA-2025-0901", title: "\u6C38\u548C\u98DF\u54C1\u8BC9\u5458\u5DE5\u7ADE\u4E1A\u7981\u6B62\u7EA0\u7EB7", type: "\u52B3\u52A8\u4E89\u8BAE", date: "2025-07-08", role: "\u539F\u544A", status: "\u4E00\u5BA1\u5BA1\u7406\u4E2D" },
        { id: "LA-2024-2230", title: "\u5546\u6807\u4FB5\u6743\u7EA0\u7EB7", type: "\u77E5\u8BC6\u4EA7\u6743\u7EA0\u7EB7", date: "2024-12-15", role: "\u539F\u544A", amount: 58, status: "\u5DF2\u5224\u51B3" }
      ],
      ips: [
        { id: "IP-TM-001", name: "\u6C38\u548C\u8C46\u6D46", type: "\u5546\u6807", no: "\u7B2C 3002157 \u53F7", date: "2003-09-21", status: "\u6709\u6548" },
        { id: "IP-TM-002", name: "YONHO", type: "\u5546\u6807", no: "\u7B2C 4883201 \u53F7", date: "2008-05-14", status: "\u6709\u6548" },
        { id: "IP-PAT-001", name: "\u4E00\u79CD\u5373\u98DF\u8C46\u6D46\u7C89\u7684\u5236\u5907\u65B9\u6CD5", type: "\u53D1\u660E\u4E13\u5229", no: "ZL202110234567.8", date: "2021-03-02", status: "\u6709\u6548" },
        { id: "IP-PAT-002", name: "\u8C46\u6D46\u751F\u4EA7\u7528\u9AD8\u6548\u78E8\u6D46\u8BBE\u5907", type: "\u5B9E\u7528\u65B0\u578B", no: "ZL202220998877.6", date: "2022-04-26", status: "\u6709\u6548" },
        { id: "IP-CR-001", name: "\u6C38\u548C\u98DF\u54C1\u4F1A\u5458\u5C0F\u7A0B\u5E8F", type: "\u8457\u4F5C\u6743", no: "\u8F6F\u8457\u767B\u5B57\u7B2C 8821534 \u53F7", date: "2023-08-10", status: "\u6709\u6548" }
      ],
      riskCounts: [
        { name: "\u884C\u653F\u5904\u7F5A", count: 0 },
        { name: "\u7ECF\u8425\u5F02\u5E38", count: 0 },
        { name: "\u4E25\u91CD\u8FDD\u6CD5", count: 0 },
        { name: "\u73AF\u4FDD\u5904\u7F5A", count: 0 },
        { name: "\u7A0E\u52A1\u975E\u6B63\u5E38\u6237", count: 0 },
        { name: "\u6B20\u7A0E\u516C\u544A", count: 0 },
        { name: "\u80A1\u6743\u51BB\u7ED3", count: 0 },
        { name: "\u52A8\u4EA7\u62B5\u62BC", count: 0 },
        { name: "\u52B3\u52A8\u4EF2\u88C1", count: 1, danger: true },
        { name: "\u6CE8\u9500\u5907\u6848", count: 0 },
        { name: "\u6E05\u7B97\u4FE1\u606F", count: 0 },
        { name: "\u516C\u793A\u50AC\u544A", count: 0 }
      ],
      bizCounts: [
        { name: "\u62DB\u6295\u6807", count: 1 },
        { name: "\u8D44\u8D28\u8BC1\u4E66", count: 8 },
        { name: "\u4FE1\u7528\u8BC4\u4EF7", count: 2 },
        { name: "\u884C\u653F\u8BB8\u53EF", count: 14 },
        { name: "\u62BD\u67E5\u68C0\u67E5", count: 1 },
        { name: "\u7ECF\u8425\u5546\u54C1", count: 954 },
        { name: "\u4F9B\u5E94\u5546", count: 3 },
        { name: "\u5BA2\u6237", count: 1 },
        { name: "\u7EB3\u7A0E\u4EBA\u72B6\u6001", count: 1 },
        { name: "\u7EB3\u7A0E\u4EBA\u8D44\u8D28", count: 3 },
        { name: "\u98DF\u54C1\u5B89\u5168", count: 10 },
        { name: "\u62DB\u8058", count: 542 }
      ],
      devCounts: [
        { name: "\u4F01\u4E1A\u4E1A\u52A1", count: 1 },
        { name: "\u7ADE\u54C1\u4FE1\u606F", count: 7 },
        { name: "\u4E0A\u699C\u699C\u5355", count: 12 },
        { name: "\u8363\u8A89", count: 2 },
        { name: "\u76F8\u5173\u516C\u544A", count: 18 },
        { name: "\u65B0\u95FB\u8206\u60C5", count: 229 },
        { name: "\u878D\u8D44\u4FE1\u606F", count: 0 },
        { name: "\u79D1\u6280\u6210\u679C", count: 0 },
        { name: "\u4F01\u4E1A\u516C\u544A", count: 0 }
      ],
      ipCounts: [
        { name: "\u5546\u6807\u4FE1\u606F", count: 497 },
        { name: "\u5546\u6807\u6587\u4E66", count: 1239 },
        { name: "\u4E13\u5229\u4FE1\u606F", count: 37 },
        { name: "\u4F5C\u54C1\u8457\u4F5C\u6743", count: 3 },
        { name: "\u8F6F\u4EF6\u8457\u4F5C\u6743", count: 0 },
        { name: "\u7F51\u7EDC\u670D\u52A1\u5907\u6848", count: 3 },
        { name: "\u6807\u51C6\u4FE1\u606F", count: 6 },
        { name: "\u5C0F\u7A0B\u5E8F", count: 1 },
        { name: "\u5FAE\u4FE1\u516C\u4F17\u53F7", count: 1 }
      ],
      newsCount: 229
    },
    {
      keyNo: "a83f21c9d2e0b74f5c6a1b3390ff77aa",
      name: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280\u6709\u9650\u516C\u53F8",
      status: "\u5B58\u7EED",
      tags: ["\u9AD8\u65B0\u6280\u672F\u4F01\u4E1A", "\u79D1\u6280\u578B\u4E2D\u5C0F\u4F01\u4E1A"],
      industry: "\u8F6F\u4EF6\u548C\u4FE1\u606F\u6280\u672F\u670D\u52A1\u4E1A",
      creditCode: "91330100MA2H3K9P21",
      regNo: "330100000998877",
      legalPerson: "\u6C88\u9038\u5C18",
      regCapital: 5e3,
      paidCapital: 3200,
      regDate: "2019-09-23",
      regAddr: "\u6D59\u6C5F\u7701\u676D\u5DDE\u5E02\u4F59\u676D\u533A\u6587\u4E00\u897F\u8DEF998\u53F7\u6D77\u521B\u56ED5\u5E62",
      bizScope: "\u6280\u672F\u670D\u52A1\u3001\u6280\u672F\u5F00\u53D1\u3001\u6280\u672F\u54A8\u8BE2\uFF1B\u8BA1\u7B97\u673A\u8F6F\u786C\u4EF6\u53CA\u8F85\u52A9\u8BBE\u5907\u6279\u53D1\uFF1B\u4EBA\u5DE5\u667A\u80FD\u5E94\u7528\u8F6F\u4EF6\u5F00\u53D1\uFF1B\u5927\u6570\u636E\u670D\u52A1\u3002",
      email: "contact@yun-suan.com",
      website: "www.yun-suan.com",
      phone: "0571-8888****",
      employees: 412,
      followed: false,
      kcScore: 901,
      shareholders: [
        { name: "\u6C88\u9038\u5C18", ratio: 52, amount: 2600, type: "\u81EA\u7136\u4EBA" },
        { name: "\u676D\u5DDE\u4F59\u676D\u4EA7\u4E1A\u6295\u8D44\u57FA\u91D1", ratio: 23.5, amount: 1175, type: "\u4F01\u4E1A\u6CD5\u4EBA" },
        { name: "\u67D0\u5458\u5DE5\u6301\u80A1\u5E73\u53F0\uFF08\u6709\u9650\u5408\u4F19\uFF09", ratio: 24.5, amount: 1225, type: "\u5176\u4ED6" }
      ],
      persons: [
        { name: "\u6C88\u9038\u5C18", position: "\u8463\u4E8B\u957F / CEO" },
        { name: "\u97E9\u96EA", position: "CTO" },
        { name: "\u7F57\u6210", position: "CFO" },
        { name: "\u65B9\u5706", position: "COO" }
      ],
      invests: [
        { name: "\u4E91\u7B97\uFF08\u4E0A\u6D77\uFF09\u667A\u80FD\u79D1\u6280\u6709\u9650\u516C\u53F8", ratio: 100, legal: "\u97E9\u96EA", status: "\u5B58\u7EED" },
        { name: "\u4E91\u7B97\uFF08\u6DF1\u5733\uFF09\u6570\u636E\u6709\u9650\u516C\u53F8", ratio: 80, legal: "\u7F57\u6210", status: "\u5B58\u7EED" }
      ],
      branches: [
        { name: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280\u6709\u9650\u516C\u53F8\u5317\u4EAC\u5206\u516C\u53F8", addr: "\u5317\u4EAC\u5E02\u6D77\u6DC0\u533A\u4E0A\u5730\u4FE1\u606F\u8DEF" },
        { name: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280\u6709\u9650\u516C\u53F8\u6210\u90FD\u7814\u53D1\u4E2D\u5FC3", addr: "\u6210\u90FD\u5E02\u9AD8\u65B0\u533A\u5929\u5E9C\u8F6F\u4EF6\u56ED" }
      ],
      changes: [
        { date: "2025-04-10", item: "\u6CE8\u518C\u8D44\u672C", before: "3000 \u4E07\u5143", after: "5000 \u4E07\u5143" },
        { date: "2024-02-18", item: "\u8463\u4E8B\u5907\u6848", before: "\uFF083 \u4EBA\uFF09", after: "\uFF084 \u4EBA\uFF0C\u65B0\u589E COO\uFF09" }
      ],
      legalCases: [
        { id: "LA-2025-7712", title: "\u67D0\u5BA2\u6237\u8BC9\u4E91\u7B97\u79D1\u6280\u670D\u52A1\u5408\u540C\u7EA0\u7EB7", type: "\u670D\u52A1\u5408\u540C\u7EA0\u7EB7", date: "2025-05-09", role: "\u88AB\u544A", amount: 96, status: "\u5DF2\u5224\u51B3" }
      ],
      ips: [
        { id: "IP-PAT-101", name: "\u4E00\u79CD\u5206\u5E03\u5F0F\u6D41\u8BA1\u7B97\u4EFB\u52A1\u8C03\u5EA6\u65B9\u6CD5", type: "\u53D1\u660E\u4E13\u5229", no: "ZL202210556677.9", date: "2022-07-19", status: "\u6709\u6548" },
        { id: "IP-CR-101", name: "\u4E91\u7B97\u6570\u636E\u6CBB\u7406\u5E73\u53F0", type: "\u8457\u4F5C\u6743", no: "\u8F6F\u8457\u767B\u5B57\u7B2C 7012345 \u53F7", date: "2022-11-02", status: "\u6709\u6548" }
      ],
      riskCounts: [
        { name: "\u884C\u653F\u5904\u7F5A", count: 0 },
        { name: "\u7ECF\u8425\u5F02\u5E38", count: 0 },
        { name: "\u4E25\u91CD\u8FDD\u6CD5", count: 0 },
        { name: "\u52B3\u52A8\u4EF2\u88C1", count: 0 },
        { name: "\u80A1\u6743\u51BB\u7ED3", count: 0 },
        { name: "\u52A8\u4EA7\u62B5\u62BC", count: 0 }
      ],
      bizCounts: [
        { name: "\u8D44\u8D28\u8BC1\u4E66", count: 12 },
        { name: "\u4FE1\u7528\u8BC4\u4EF7", count: 3 },
        { name: "\u884C\u653F\u8BB8\u53EF", count: 6 },
        { name: "\u62DB\u6295\u6807", count: 24 },
        { name: "\u62DB\u8058", count: 168 },
        { name: "\u4F9B\u5E94\u5546", count: 9 }
      ],
      devCounts: [
        { name: "\u4F01\u4E1A\u4E1A\u52A1", count: 2 },
        { name: "\u7ADE\u54C1\u4FE1\u606F", count: 5 },
        { name: "\u4E0A\u699C\u699C\u5355", count: 8 },
        { name: "\u8363\u8A89", count: 6 },
        { name: "\u65B0\u95FB\u8206\u60C5", count: 76 },
        { name: "\u878D\u8D44\u4FE1\u606F", count: 2 }
      ],
      ipCounts: [
        { name: "\u5546\u6807\u4FE1\u606F", count: 28 },
        { name: "\u4E13\u5229\u4FE1\u606F", count: 19 },
        { name: "\u8F6F\u4EF6\u8457\u4F5C\u6743", count: 41 },
        { name: "\u4F5C\u54C1\u8457\u4F5C\u6743", count: 1 },
        { name: "\u6807\u51C6\u4FE1\u606F", count: 2 },
        { name: "\u5C0F\u7A0B\u5E8F", count: 2 }
      ],
      newsCount: 76
    },
    {
      keyNo: "c19b4e7a0d6532f8b2c4410e7aa99331",
      name: "\u6DF1\u5733\u5E02\u9510\u8FDB\u4F9B\u5E94\u94FE\u6709\u9650\u516C\u53F8",
      status: "\u5728\u4E1A",
      tags: ["A \u7EA7\u7EB3\u7A0E\u4EBA", "\u4E00\u822C\u7EB3\u7A0E\u4EBA"],
      industry: "\u5546\u52A1\u670D\u52A1\u4E1A",
      creditCode: "91440300MA5GK2Q880",
      regNo: "440300210776655",
      legalPerson: "\u9EC4\u9510\u950B",
      regCapital: 2e3,
      paidCapital: 2e3,
      regDate: "2021-01-08",
      regAddr: "\u5E7F\u4E1C\u7701\u6DF1\u5733\u5E02\u524D\u6D77\u6DF1\u6E2F\u5408\u4F5C\u533A\u524D\u6E7E\u4E00\u8DEF1\u53F7",
      bizScope: "\u4F9B\u5E94\u94FE\u7BA1\u7406\uFF1B\u56FD\u9645\u8D27\u8FD0\u4EE3\u7406\uFF1B\u7269\u6D41\u65B9\u6848\u8BBE\u8BA1\uFF1B\u56FD\u5185\u8D38\u6613\uFF1B\u7ECF\u8425\u8FDB\u51FA\u53E3\u4E1A\u52A1\uFF1B\u4ED3\u50A8\u670D\u52A1\u3002",
      email: "service@ruijin-scm.com",
      website: "www.ruijin-scm.com",
      phone: "0755-2666****",
      employees: 156,
      followed: false,
      kcScore: 712,
      shareholders: [
        { name: "\u9EC4\u9510\u950B", ratio: 70, amount: 1400, type: "\u81EA\u7136\u4EBA" },
        { name: "\u6DF1\u5733\u5E02\u524D\u6D77\u542F\u822A\u6295\u8D44\u5408\u4F19\u4F01\u4E1A", ratio: 30, amount: 600, type: "\u4F01\u4E1A\u6CD5\u4EBA" }
      ],
      persons: [
        { name: "\u9EC4\u9510\u950B", position: "\u8463\u4E8B\u957F / \u603B\u7ECF\u7406" },
        { name: "\u5434\u654F", position: "\u8FD0\u8425\u603B\u76D1" },
        { name: "\u90D1\u51EF", position: "\u8D22\u52A1\u603B\u76D1" }
      ],
      invests: [
        { name: "\u9510\u8FDB\uFF08\u5E7F\u5DDE\uFF09\u4ED3\u50A8\u6709\u9650\u516C\u53F8", ratio: 60, legal: "\u5434\u654F", status: "\u5B58\u7EED" }
      ],
      branches: [
        { name: "\u6DF1\u5733\u5E02\u9510\u8FDB\u4F9B\u5E94\u94FE\u6709\u9650\u516C\u53F8\u5E7F\u5DDE\u5206\u516C\u53F8", addr: "\u5E7F\u5DDE\u5E02\u5357\u6C99\u533A\u6E2F\u524D\u5927\u9053" }
      ],
      changes: [
        { date: "2023-08-22", item: "\u7ECF\u8425\u8303\u56F4", before: "\u4F9B\u5E94\u94FE\u7BA1\u7406", after: "\u4F9B\u5E94\u94FE\u7BA1\u7406\uFF1B\u56FD\u9645\u8D27\u8FD0\u4EE3\u7406\uFF1B\u4ED3\u50A8\u670D\u52A1" }
      ],
      legalCases: [
        { id: "LA-2024-5521", title: "\u9510\u8FDB\u4F9B\u5E94\u94FE\u8BC9\u67D0\u7269\u6D41\u516C\u53F8\u8FD0\u8F93\u5408\u540C\u7EA0\u7EB7", type: "\u8FD0\u8F93\u5408\u540C\u7EA0\u7EB7", date: "2024-10-30", role: "\u539F\u544A", amount: 73, status: "\u5DF2\u5224\u51B3" }
      ],
      ips: [
        { id: "IP-TM-201", name: "\u9510\u8FDB\u4F9B\u5E94\u94FE RUIJIN SCM", type: "\u5546\u6807", no: "\u7B2C 5566890 \u53F7", date: "2021-06-11", status: "\u6709\u6548" }
      ],
      riskCounts: [
        { name: "\u884C\u653F\u5904\u7F5A", count: 0 },
        { name: "\u7ECF\u8425\u5F02\u5E38", count: 0 },
        { name: "\u52B3\u52A8\u4EF2\u88C1", count: 0 },
        { name: "\u80A1\u6743\u51BB\u7ED3", count: 0 },
        { name: "\u52A8\u4EA7\u62B5\u62BC", count: 0 },
        { name: "\u6B20\u7A0E\u516C\u544A", count: 0 }
      ],
      bizCounts: [
        { name: "\u8D44\u8D28\u8BC1\u4E66", count: 4 },
        { name: "\u884C\u653F\u8BB8\u53EF", count: 9 },
        { name: "\u62DB\u6295\u6807", count: 6 },
        { name: "\u62DB\u8058", count: 43 },
        { name: "\u4F9B\u5E94\u5546", count: 21 },
        { name: "\u5BA2\u6237", count: 14 }
      ],
      devCounts: [
        { name: "\u4F01\u4E1A\u4E1A\u52A1", count: 1 },
        { name: "\u7ADE\u54C1\u4FE1\u606F", count: 3 },
        { name: "\u8363\u8A89", count: 1 },
        { name: "\u65B0\u95FB\u8206\u60C5", count: 18 },
        { name: "\u878D\u8D44\u4FE1\u606F", count: 0 },
        { name: "\u4E0A\u699C\u699C\u5355", count: 2 }
      ],
      ipCounts: [
        { name: "\u5546\u6807\u4FE1\u606F", count: 6 },
        { name: "\u4E13\u5229\u4FE1\u606F", count: 2 },
        { name: "\u8F6F\u4EF6\u8457\u4F5C\u6743", count: 3 },
        { name: "\u4F5C\u54C1\u8457\u4F5C\u6743", count: 0 },
        { name: "\u6807\u51C6\u4FE1\u606F", count: 0 },
        { name: "\u5C0F\u7A0B\u5E8F", count: 0 }
      ],
      newsCount: 18
    }
  ]
};
var FILES = { qiye: "qiyeData.json" };
var data = JSON.parse(JSON.stringify(SEED_QIYE));
var version = 0;
var saveStatus = null;
var listeners2 = /* @__PURE__ */ new Set();
var statusListeners = /* @__PURE__ */ new Set();
function emit2() {
  version++;
  listeners2.forEach((fn) => fn());
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
  const saved = await loadOne(FILES.qiye);
  if (saved && typeof saved === "object" && Array.isArray(saved.enterprises)) {
    data = saved;
  } else {
    saveOne(FILES.qiye, data);
  }
  emit2();
}
void bootstrap();
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
function useQiyeData() {
  return useSnap(() => data);
}
function updateQiyeData(fn) {
  data = fn(data);
  emit2();
  saveOne(FILES.qiye, data);
}
function toggleFollow(keyNo) {
  updateQiyeData((d) => ({
    ...d,
    enterprises: d.enterprises.map((e) => e.keyNo === keyNo ? { ...e, followed: !e.followed } : e)
  }));
}

// src/console/enterpriseData.ts
import { useSyncExternalStore as useSyncExternalStore3 } from "react";
var SEED_ENTERPRISE = {
  dueTasks: [
    { id: "DT-2608-01", name: "8\u6708\u5BF9\u516C\u5B58\u91CF\u5BA2\u6237\u5C3D\u8C03", count: 126, source: "\u63A5\u53E3\u5BFC\u5165", status: "\u8FDB\u884C\u4E2D", progress: 68, hitRisk: 9, startedAt: "2026-08-11 09:00", createdBy: "\u7CFB\u7EDF\u7BA1\u7406\u5458" },
    { id: "DT-2608-02", name: "\u65B0\u51C6\u5165\u4F9B\u5E94\u5546\u98CE\u9669\u7B5B\u67E5", count: 54, source: "\u4E0A\u4F20\u540D\u5355", status: "\u5DF2\u5B8C\u6210", progress: 100, hitRisk: 3, startedAt: "2026-08-09 14:30", finishedAt: "2026-08-10 10:12", createdBy: "\u5F20\u4E09" },
    { id: "DT-2608-03", name: "\u6388\u4FE1\u5230\u671F\u7EED\u7EA6\u5C3D\u8C03", count: 87, source: "\u63A5\u53E3\u5BFC\u5165", status: "\u5F85\u5F00\u59CB", progress: 0, hitRisk: 0, startedAt: "2026-08-12 08:00", createdBy: "\u674E\u56DB" },
    { id: "DT-2607-04", name: "\u56ED\u533A\u91CD\u70B9\u4F01\u4E1A\u5B63\u5EA6\u590D\u5BA1", count: 32, source: "\u624B\u5DE5\u5F55\u5165", status: "\u5DF2\u5B8C\u6210", progress: 100, hitRisk: 4, startedAt: "2026-07-28 09:00", finishedAt: "2026-07-30 16:00", createdBy: "\u738B\u4E94" },
    { id: "DT-2607-05", name: "\u5B58\u91CF\u4F01\u4E1A\u6279\u91CF\u5E74\u68C0", count: 210, source: "\u63A5\u53E3\u5BFC\u5165", status: "\u5931\u8D25", progress: 42, hitRisk: 0, startedAt: "2026-07-20 10:00", createdBy: "\u7CFB\u7EDF\u7BA1\u7406\u5458" }
  ],
  monitorList: [
    { keyNo: "e1", name: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8", industry: "\u519C\u526F\u98DF\u54C1\u52A0\u5DE5\u4E1A", riskLevel: "\u4E2D", monitorSince: "2025-03-01", alerts: 2, lastAlert: "2026-08-01", status: "\u76D1\u63A7\u4E2D" },
    { keyNo: "e2", name: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280\u6709\u9650\u516C\u53F8", industry: "\u8F6F\u4EF6\u548C\u4FE1\u606F\u6280\u672F\u670D\u52A1\u4E1A", riskLevel: "\u4F4E", monitorSince: "2025-06-15", alerts: 1, lastAlert: "2026-07-20", status: "\u76D1\u63A7\u4E2D" },
    { keyNo: "e3", name: "\u6DF1\u5733\u5E02\u9510\u8FDB\u4F9B\u5E94\u94FE\u6709\u9650\u516C\u53F8", industry: "\u5546\u52A1\u670D\u52A1\u4E1A", riskLevel: "\u9AD8", monitorSince: "2025-02-10", alerts: 5, lastAlert: "2026-08-08", status: "\u76D1\u63A7\u4E2D" },
    { keyNo: "e4", name: "\u5317\u4EAC\u534E\u4FE1\u667A\u63A7\u79D1\u6280\u6709\u9650\u516C\u53F8", industry: "\u4E13\u7528\u8BBE\u5907\u5236\u9020\u4E1A", riskLevel: "\u9AD8", monitorSince: "2024-11-01", alerts: 7, lastAlert: "2026-08-06", status: "\u76D1\u63A7\u4E2D" },
    { keyNo: "e5", name: "\u4E0A\u6D77\u6668\u5149\u8D38\u6613\u6709\u9650\u516C\u53F8", industry: "\u6279\u53D1\u4E1A", riskLevel: "\u4E2D", monitorSince: "2025-09-20", alerts: 3, lastAlert: "2026-07-28", status: "\u5DF2\u6682\u505C" }
  ],
  decisionEvents: [
    { id: "DE-2608-101", entKeyNo: "e3", entName: "\u6DF1\u5733\u5E02\u9510\u8FDB\u4F9B\u5E94\u94FE\u6709\u9650\u516C\u53F8", scene: "\u6388\u4FE1\u5BA1\u6279", score: 482, scoreModel: "\u4F01\u4E1A\u8FDD\u7EA6\u5206", result: "\u62D2\u7EDD", level: "\u9AD8", status: "\u5DF2\u5B8C\u6210", decidedAt: "2026-08-08 11:20", operator: "\u98CE\u63A7\u7CFB\u7EDF", rules: ["\u53F8\u6CD5\u6D89\u8BC9\u22653", "\u6B20\u7A0E\u516C\u544A\u547D\u4E2D", "\u7ECF\u8425\u5F02\u5E38"] },
    { id: "DE-2608-102", entKeyNo: "e1", entName: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8", scene: "\u6388\u4FE1\u5BA1\u6279", score: 762, scoreModel: "\u4F01\u4E1A\u8FDD\u7EA6\u5206", result: "\u901A\u8FC7", level: "\u4F4E", status: "\u5DF2\u5B8C\u6210", decidedAt: "2026-08-02 15:40", operator: "\u98CE\u63A7\u7CFB\u7EDF", rules: ["\u65E0\u91CD\u5927\u53F8\u6CD5\u98CE\u9669", "\u8D22\u52A1\u7A33\u5065"] },
    { id: "DE-2608-103", entKeyNo: "e4", entName: "\u5317\u4EAC\u534E\u4FE1\u667A\u63A7\u79D1\u6280\u6709\u9650\u516C\u53F8", scene: "\u5C3D\u8C03\u7ED3\u8BBA", score: 555, scoreModel: "\u4F01\u4E1A\u6B3A\u8BC8\u5206", result: "\u8F6C\u4EBA\u5DE5", level: "\u9AD8", status: "\u5F85\u590D\u6838", decidedAt: "2026-08-09 09:10", operator: "\u5C3D\u8C03\u5F15\u64CE", rules: ["\u5173\u8054\u4F01\u4E1A\u98CE\u9669", "\u80A1\u6743\u51BB\u7ED3"] },
    { id: "DE-2608-104", entKeyNo: "e2", entName: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280\u6709\u9650\u516C\u53F8", scene: "\u9884\u8B66\u5904\u7F6E", score: 801, scoreModel: "\u4F01\u4E1A\u8FDD\u7EA6\u5206", result: "\u901A\u8FC7", level: "\u4F4E", status: "\u5DF2\u5B8C\u6210", decidedAt: "2026-07-30 10:00", operator: "\u98CE\u63A7\u7CFB\u7EDF", rules: ["\u9AD8\u65B0\u6280\u672F\u4F01\u4E1A", "\u65E0\u7ECF\u8425\u5F02\u5E38"] },
    { id: "DE-2608-105", entKeyNo: "e5", entName: "\u4E0A\u6D77\u6668\u5149\u8D38\u6613\u6709\u9650\u516C\u53F8", scene: "\u540D\u5355\u547D\u4E2D", score: 610, scoreModel: "\u4F01\u4E1A\u8FDD\u7EA6\u5206", result: "\u9884\u8B66", level: "\u4E2D", status: "\u590D\u6838\u4E2D", decidedAt: "2026-08-05 14:00", operator: "\u540D\u5355\u5F15\u64CE", rules: ["\u7070\u540D\u5355\u547D\u4E2D", "\u7ECF\u8425\u5F02\u5E38"] }
  ],
  reviewOrders: [
    { id: "RO-2608-01", eventId: "DE-2608-103", entName: "\u5317\u4EAC\u534E\u4FE1\u667A\u63A7\u79D1\u6280\u6709\u9650\u516C\u53F8", reason: "\u6A21\u578B\u8F93\u51FA\u300C\u8F6C\u4EBA\u5DE5\u300D\uFF1A\u5173\u8054\u4F01\u4E1A\u98CE\u9669 + \u80A1\u6743\u51BB\u7ED3\uFF0C\u9700\u4EBA\u5DE5\u7814\u5224\u6388\u4FE1", level: "\u9AD8", status: "\u5F85\u590D\u6838", assignee: "\u98CE\u63A7\u4E3B\u7BA1", createdAt: "2026-08-09 09:10" },
    { id: "RO-2608-02", eventId: "DE-2608-105", entName: "\u4E0A\u6D77\u6668\u5149\u8D38\u6613\u6709\u9650\u516C\u53F8", reason: "\u7070\u540D\u5355\u547D\u4E2D\u4E14\u7ECF\u8425\u5F02\u5E38\uFF0C\u9700\u786E\u8BA4\u540D\u5355\u89C4\u5219\u4E0E\u5B9E\u9645\u60C5\u51B5", level: "\u4E2D", status: "\u590D\u6838\u4E2D", assignee: "\u5F20\u4E09", createdAt: "2026-08-05 14:00" },
    { id: "RO-2608-03", eventId: "DE-2608-106", entName: "\u5E7F\u5DDE\u8054\u8BDA\u7269\u6D41\u6709\u9650\u516C\u53F8", reason: "\u9ED1\u540D\u5355\u5173\u8054\u4F01\u4E1A\u547D\u4E2D\uFF0C\u9700\u4EBA\u5DE5\u590D\u6838\u5173\u8054\u771F\u5B9E\u6027", level: "\u9AD8", status: "\u5F85\u590D\u6838", assignee: "\u674E\u56DB", createdAt: "2026-08-07 16:30" },
    { id: "RO-2608-04", eventId: "DE-2608-107", entName: "\u6210\u90FD\u660E\u8FDC\u673A\u68B0\u6709\u9650\u516C\u53F8", reason: "\u7A0E\u52A1\u6B20\u7A0E\u516C\u544A\u547D\u4E2D\uFF0C\u9700\u786E\u8BA4\u91D1\u989D\u4E0E\u5904\u7F6E", level: "\u4E2D", status: "\u5DF2\u590D\u6838", assignee: "\u738B\u4E94", createdAt: "2026-08-01 11:00", conclusion: "\u6B20\u7A0E\u91D1\u989D\u8F83\u5C0F\uFF0C\u5EFA\u8BAE\u6682\u7F13\u6388\u4FE1\u89C2\u5BDF", reviewer: "\u738B\u4E94", reviewedAt: "2026-08-02 09:30" }
  ],
  listEnts: [
    { id: "LB-01", name: "\u5E7F\u5DDE\u8054\u8BDA\u7269\u6D41\u6709\u9650\u516C\u53F8", list: "black", reason: "\u91CD\u5927\u53F8\u6CD5\u6D89\u8BC9 + \u7A7A\u58F3\u7279\u5F81", source: "\u5C3D\u8C03\u547D\u4E2D", addedAt: "2026-07-15", operator: "\u5F20\u4E09", status: "\u751F\u6548" },
    { id: "LB-02", name: "\u4E0A\u6D77\u6668\u5149\u8D38\u6613\u6709\u9650\u516C\u53F8", list: "gray", reason: "\u7ECF\u8425\u5F02\u5E38\uFF0C\u9700\u6301\u7EED\u89C2\u5BDF", source: "\u89C4\u5219\u547D\u4E2D", addedAt: "2026-08-01", operator: "\u674E\u56DB", status: "\u751F\u6548" },
    { id: "LB-03", name: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280\u6709\u9650\u516C\u53F8", list: "white", reason: "\u6838\u5FC3\u4F18\u8D28\u5BA2\u6237", source: "\u624B\u5DE5\u6DFB\u52A0", addedAt: "2026-06-20", operator: "\u738B\u4E94", status: "\u751F\u6548" },
    { id: "LB-04", name: "\u6210\u90FD\u660E\u8FDC\u673A\u68B0\u6709\u9650\u516C\u53F8", list: "gray", reason: "\u7A0E\u52A1\u5F02\u5E38\u5F85\u786E\u8BA4", source: "\u5C3D\u8C03\u547D\u4E2D", addedAt: "2026-08-03", operator: "\u5F20\u4E09", status: "\u751F\u6548" },
    { id: "LB-05", name: "\u5317\u4EAC\u534E\u4FE1\u667A\u63A7\u79D1\u6280\u6709\u9650\u516C\u53F8", list: "black", reason: "\u80A1\u6743\u51BB\u7ED3 + \u5173\u8054\u98CE\u9669", source: "\u6A21\u578B\u547D\u4E2D", addedAt: "2026-08-08", operator: "\u674E\u56DB", status: "\u751F\u6548" }
  ],
  dataSources: [
    { id: "ES-01", name: "\u4F01\u4E1A\u5DE5\u5546\u6570\u636E", category: "\u5DE5\u5546", desc: "\u5DE5\u5546\u6CE8\u518C\u3001\u80A1\u4E1C\u3001\u4E3B\u8981\u4EBA\u5458\u3001\u5BF9\u5916\u6295\u8D44\u3001\u53D8\u66F4\u8BB0\u5F55", status: "\u5DF2\u63A5\u5165", vendor: "\u5DE5\u5546\u603B\u5C40 / \u4F01\u67E5\u67E5", updatedAt: "2026-08-01" },
    { id: "ES-02", name: "\u53F8\u6CD5\u6D89\u8BC9\u6570\u636E", category: "\u53F8\u6CD5", desc: "\u88C1\u5224\u6587\u4E66\u3001\u7ACB\u6848\u3001\u5F00\u5EAD\u3001\u6267\u884C\u3001\u5931\u4FE1\u88AB\u6267\u884C\u4EBA", status: "\u5DF2\u63A5\u5165", vendor: "\u4E2D\u56FD\u88C1\u5224\u6587\u4E66\u7F51", updatedAt: "2026-08-01" },
    { id: "ES-03", name: "\u7A0E\u52A1\u6570\u636E", category: "\u7A0E\u52A1", desc: "\u6B20\u7A0E\u516C\u544A\u3001\u7EB3\u7A0E\u4FE1\u7528\u7B49\u7EA7\u3001\u7A0E\u52A1\u5F02\u5E38", status: "\u5DF2\u63A5\u5165", vendor: "\u7A0E\u52A1\u90E8\u95E8", updatedAt: "2026-07-28" },
    { id: "ES-04", name: "\u5F81\u4FE1\u6570\u636E", category: "\u5F81\u4FE1", desc: "\u4F01\u4E1A\u5F81\u4FE1\u62A5\u544A\u3001\u4FE1\u8D37\u8BB0\u5F55\u3001\u6388\u4FE1\u60C5\u51B5", status: "\u6D4B\u8BD5\u4E2D", vendor: "\u4EBA\u884C\u5F81\u4FE1", updatedAt: "2026-07-30" },
    { id: "ES-05", name: "\u8206\u60C5\u6570\u636E", category: "\u8206\u60C5", desc: "\u65B0\u95FB\u8206\u60C5\u3001\u8D1F\u9762\u62A5\u9053\u3001\u793E\u4EA4\u5A92\u4F53", status: "\u5DF2\u63A5\u5165", vendor: "\u8206\u60C5\u76D1\u6D4B", updatedAt: "2026-08-05" },
    { id: "ES-06", name: "\u5173\u8054\u56FE\u8C31\u6570\u636E", category: "\u5173\u8054", desc: "\u80A1\u6743\u5173\u8054\u3001\u6295\u8D44\u5173\u8054\u3001\u4EBA\u5458\u5173\u8054\u3001\u62C5\u4FDD\u5173\u8054", status: "\u5DF2\u63A5\u5165", vendor: "\u5185\u90E8\u56FE\u8C31\u5F15\u64CE", updatedAt: "2026-08-01" },
    { id: "ES-07", name: "\u8D22\u52A1\u6570\u636E", category: "\u8D22\u52A1", desc: "\u8D22\u62A5\u3001\u5BA1\u8BA1\u62A5\u544A\u3001\u7ECF\u8425\u6570\u636E", status: "\u672A\u63A5\u5165", vendor: "\u2014", updatedAt: "2026-08-06" }
  ],
  alertRules: [
    { id: "ER-01", name: "\u53F8\u6CD5\u6D89\u8BC9\u9884\u8B66", category: "\u53F8\u6CD5\u6D89\u8BC9", condition: "\u65B0\u589E\u8BC9\u8BBC/\u88AB\u6267\u884C\u22651 \u6216 \u6D89\u6848\u91D1\u989D\u2265500\u4E07", level: "\u9AD8", action: "\u7ACB\u5373\u6838\u5B9E\uFF0C\u6682\u505C\u6388\u4FE1", enabled: true },
    { id: "ER-02", name: "\u7ECF\u8425\u5F02\u5E38\u9884\u8B66", category: "\u7ECF\u8425\u5F02\u5E38", condition: "\u88AB\u5217\u5165\u7ECF\u8425\u5F02\u5E38\u540D\u5F55", level: "\u9AD8", action: "\u6838\u5B9E\u539F\u56E0\uFF0C\u9650\u65F6\u6574\u6539", enabled: true },
    { id: "ER-03", name: "\u8206\u60C5\u8D1F\u9762\u9884\u8B66", category: "\u8206\u60C5\u8D1F\u9762", condition: "\u51FA\u73B0\u91CD\u5927\u8D1F\u9762\u8206\u60C5", level: "\u4E2D", action: "\u8206\u60C5\u7814\u5224", enabled: true },
    { id: "ER-04", name: "\u8D22\u52A1\u6076\u5316\u9884\u8B66", category: "\u8D22\u52A1\u6076\u5316", condition: "\u8D44\u4EA7\u8D1F\u503A\u7387\u4E0A\u5347>15% \u6216 \u73B0\u91D1\u6D41\u6076\u5316", level: "\u9AD8", action: "\u8D22\u52A1\u5C3D\u8C03\uFF0C\u538B\u7F29\u6388\u4FE1", enabled: false },
    { id: "ER-05", name: "\u5173\u8054\u98CE\u9669\u9884\u8B66", category: "\u5173\u8054\u98CE\u9669", condition: "\u5173\u8054\u4F01\u4E1A\u51FA\u73B0\u9ED1\u540D\u5355/\u91CD\u5927\u98CE\u9669", level: "\u4E2D", action: "\u6838\u67E5\u5173\u8054\u5173\u7CFB", enabled: true },
    { id: "ER-06", name: "\u6B20\u7A0E\u9884\u8B66", category: "\u7A0E\u52A1", condition: "\u51FA\u73B0\u6B20\u7A0E\u516C\u544A", level: "\u4E2D", action: "\u6838\u5B9E\u6B20\u7A0E\u91D1\u989D", enabled: true }
  ],
  alerts: [
    { id: "EA-001", entKeyNo: "e3", entName: "\u6DF1\u5733\u5E02\u9510\u8FDB\u4F9B\u5E94\u94FE\u6709\u9650\u516C\u53F8", ruleId: "ER-01", ruleName: "\u53F8\u6CD5\u6D89\u8BC9\u9884\u8B66", category: "\u53F8\u6CD5\u6D89\u8BC9", level: "RED", alert_date: "2026-08-08 11:20", detail: "\u65B0\u589E\u88AB\u6267\u884C\u6848\u4EF61\u8D77\uFF0C\u6D89\u6848\u91D1\u989D 730 \u4E07", status: "\u5F85\u5904\u7F6E", flowKey: "f-ent-alert", flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D", flowStateAt: "2026-08-08 11:20:00" },
    { id: "EA-002", entKeyNo: "e4", entName: "\u5317\u4EAC\u534E\u4FE1\u667A\u63A7\u79D1\u6280\u6709\u9650\u516C\u53F8", ruleId: "ER-01", ruleName: "\u53F8\u6CD5\u6D89\u8BC9\u9884\u8B66", category: "\u53F8\u6CD5\u6D89\u8BC9", level: "RED", alert_date: "2026-08-06 09:00", detail: "\u65B0\u589E\u80A1\u6743\u51BB\u7ED3\uFF0C\u5173\u8054\u4F01\u4E1A\u98CE\u9669\u4E0A\u5347", status: "\u6838\u5B9E\u4E2D", flowKey: "f-ent-alert", flowState: "\u98CE\u9669\u7814\u5224\u4E2D", flowStateAt: "2026-08-06 09:00:00" },
    { id: "EA-003", entKeyNo: "e1", entName: "\u6C38\u548C\u98DF\u54C1\uFF08\u4E2D\u56FD\uFF09\u80A1\u4EFD\u6709\u9650\u516C\u53F8", ruleId: "ER-03", ruleName: "\u8206\u60C5\u8D1F\u9762\u9884\u8B66", category: "\u8206\u60C5\u8D1F\u9762", level: "YELLOW", alert_date: "2026-08-01 14:30", detail: "\u4E2A\u522B\u8D1F\u9762\u8206\u60C5\u62A5\u9053\uFF0C\u5F71\u54CD\u6709\u9650", status: "\u5DF2\u5904\u7F6E", flowKey: "f-ent-alert", flowState: "\u5DF2\u7ED3\u6848", flowStateAt: "2026-08-02 10:00:00" },
    { id: "EA-004", entKeyNo: "e5", entName: "\u4E0A\u6D77\u6668\u5149\u8D38\u6613\u6709\u9650\u516C\u53F8", ruleId: "ER-02", ruleName: "\u7ECF\u8425\u5F02\u5E38\u9884\u8B66", category: "\u7ECF\u8425\u5F02\u5E38", level: "RED", alert_date: "2026-07-28 10:00", detail: "\u88AB\u5217\u5165\u7ECF\u8425\u5F02\u5E38\u540D\u5F55\uFF08\u672A\u6309\u671F\u5E74\u62A5\uFF09", status: "\u5F85\u5904\u7F6E", flowKey: "f-ent-alert", flowState: "\u9884\u8B66\u786E\u8BA4\u4E2D", flowStateAt: "2026-07-28 10:00:00" },
    { id: "EA-005", entKeyNo: "e2", entName: "\u676D\u5DDE\u4E91\u7B97\u79D1\u6280\u6709\u9650\u516C\u53F8", ruleId: "ER-06", ruleName: "\u6B20\u7A0E\u9884\u8B66", category: "\u7A0E\u52A1", level: "YELLOW", alert_date: "2026-07-20 09:00", detail: "\u5C0F\u989D\u6B20\u7A0E\u516C\u544A\uFF0C\u91D1\u989D 3.2 \u4E07", status: "\u5DF2\u5904\u7F6E", flowKey: "f-ent-alert", flowState: "\u5DF2\u7ED3\u6848", flowStateAt: "2026-07-21 09:00:00" }
  ],
  models: [
    {
      id: "ent-credit",
      name: "\u4F01\u4E1A\u8FDD\u7EA6\u5206",
      range: [300, 900],
      color: "#ef4444",
      score: 762,
      desc: "\u4F01\u4E1A\u4FE1\u7528\u8FDD\u7EA6\u98CE\u9669\u6A21\u578B\uFF1A\u7ED3\u5408\u5DE5\u5546\u3001\u53F8\u6CD5\u3001\u7A0E\u52A1\u3001\u8D22\u52A1\u4E0E\u5F81\u4FE1\u6570\u636E\u8BC4\u4F30\u8FDD\u7EA6\u6982\u7387",
      algoType: "XGBoost",
      version: "v2.4.1",
      enabled: true,
      updatedAt: "2026-08-01",
      factors: [
        { name: "\u53F8\u6CD5\u6D89\u8BC9\u8BB0\u5F55", weight: 0.24 },
        { name: "\u8D22\u52A1\u5065\u5EB7\u5EA6", weight: 0.22 },
        { name: "\u7A0E\u52A1\u4FE1\u7528", weight: 0.18 },
        { name: "\u7ECF\u8425\u7A33\u5B9A\u6027", weight: 0.16 },
        { name: "\u5173\u8054\u98CE\u9669", weight: 0.12 },
        { name: "\u8206\u60C5\u8D1F\u9762", weight: 0.08 }
      ],
      thresholds: [
        { range: "300-600", level: "\u9AD8\u98CE\u9669", meaning: "\u8FDD\u7EA6\u6982\u7387\u6781\u9AD8", action: "\u62D2\u7EDD\u6388\u4FE1" },
        { range: "601-750", level: "\u4E2D\u98CE\u9669", meaning: "\u8FDD\u7EA6\u6982\u7387\u8F83\u9AD8", action: "\u5BA1\u614E\u6388\u4FE1\uFF0C\u52A0\u5F3A\u62C5\u4FDD" },
        { range: "751-900", level: "\u4F4E\u98CE\u9669", meaning: "\u8FDD\u7EA6\u6982\u7387\u8F83\u4F4E", action: "\u6807\u51C6\u6388\u4FE1" }
      ],
      ops: { coverage: 86, accuracy: 89, timely: 92, calls: 182300, trend: [
        { month: "2026-03", coverage: 82, accuracy: 85, timely: 88, calls: 152e3 },
        { month: "2026-04", coverage: 83, accuracy: 86, timely: 89, calls: 158e3 },
        { month: "2026-05", coverage: 84, accuracy: 87, timely: 90, calls: 165e3 },
        { month: "2026-06", coverage: 85, accuracy: 88, timely: 91, calls: 172e3 },
        { month: "2026-07", coverage: 85, accuracy: 88, timely: 92, calls: 178e3 },
        { month: "2026-08", coverage: 86, accuracy: 89, timely: 92, calls: 182300 }
      ] }
    },
    {
      id: "ent-fraud",
      name: "\u4F01\u4E1A\u6B3A\u8BC8\u5206",
      range: [0, 100],
      color: "#8b5cf6",
      score: 42,
      desc: "\u4F01\u4E1A\u6B3A\u8BC8\u98CE\u9669\u6A21\u578B\uFF1A\u8BC6\u522B\u7A7A\u58F3\u3001\u5173\u8054\u6B3A\u8BC8\u3001\u865A\u5047\u7ECF\u8425\u7B49\u6B3A\u8BC8\u7279\u5F81",
      algoType: "LightGBM",
      version: "v3.1.0",
      enabled: true,
      updatedAt: "2026-07-20",
      factors: [
        { name: "\u7A7A\u58F3\u7279\u5F81", weight: 0.28 },
        { name: "\u5173\u8054\u56E2\u4F19", weight: 0.24 },
        { name: "\u80A1\u4E1C\u5F02\u5E38", weight: 0.2 },
        { name: "\u7ECF\u8425\u771F\u5B9E\u6027", weight: 0.16 },
        { name: "\u6CE8\u518C\u5F02\u5E38", weight: 0.12 }
      ],
      thresholds: [
        { range: "0-40", level: "\u4F4E\u98CE\u9669", meaning: "\u6B3A\u8BC8\u98CE\u9669\u8F83\u4F4E", action: "\u6B63\u5E38\u5904\u7406" },
        { range: "41-70", level: "\u4E2D\u98CE\u9669", meaning: "\u5B58\u5728\u6B3A\u8BC8\u7279\u5F81", action: "\u52A0\u5F3A\u6838\u9A8C" },
        { range: "71-100", level: "\u9AD8\u98CE\u9669", meaning: "\u9AD8\u5EA6\u7591\u4F3C\u6B3A\u8BC8", action: "\u62D2\u7EDD + \u540D\u5355" }
      ],
      ops: { coverage: 78, accuracy: 91, timely: 90, calls: 96500, trend: [
        { month: "2026-03", coverage: 74, accuracy: 88, timely: 87, calls: 82e3 },
        { month: "2026-04", coverage: 75, accuracy: 89, timely: 88, calls: 86e3 },
        { month: "2026-05", coverage: 76, accuracy: 90, timely: 89, calls: 89e3 },
        { month: "2026-06", coverage: 77, accuracy: 90, timely: 89, calls: 92e3 },
        { month: "2026-07", coverage: 78, accuracy: 91, timely: 90, calls: 94e3 },
        { month: "2026-08", coverage: 78, accuracy: 91, timely: 90, calls: 96500 }
      ] }
    },
    {
      id: "ent-rel",
      name: "\u5173\u8054\u98CE\u9669\u5206",
      range: [0, 100],
      color: "#0ea5e9",
      score: 61,
      desc: "\u4F01\u4E1A\u5173\u8054\u98CE\u9669\u6A21\u578B\uFF1A\u8BC4\u4F30\u4F01\u4E1A\u6240\u5904\u5173\u8054\u7F51\u7EDC\u7684\u98CE\u9669\u4F20\u5BFC\u4E0E\u96C6\u4E2D\u5EA6",
      algoType: "GraphSAGE",
      version: "v1.3.2",
      enabled: true,
      updatedAt: "2026-06-30",
      factors: [
        { name: "\u5173\u8054\u7F51\u7EDC\u5BC6\u5EA6", weight: 0.3 },
        { name: "\u5173\u8054\u4F01\u4E1A\u98CE\u9669", weight: 0.28 },
        { name: "\u63A7\u80A1\u96C6\u4E2D\u5EA6", weight: 0.18 },
        { name: "\u62C5\u4FDD\u73AF", weight: 0.14 },
        { name: "\u6295\u8D44\u5F02\u5E38", weight: 0.1 }
      ],
      thresholds: [
        { range: "0-40", level: "\u4F4E\u98CE\u9669", meaning: "\u5173\u8054\u98CE\u9669\u8F83\u4F4E", action: "\u6B63\u5E38\u5904\u7406" },
        { range: "41-70", level: "\u4E2D\u98CE\u9669", meaning: "\u5173\u8054\u7F51\u7EDC\u5B58\u5728\u98CE\u9669\u4F20\u5BFC", action: "\u5173\u8054\u5C3D\u8C03" },
        { range: "71-100", level: "\u9AD8\u98CE\u9669", meaning: "\u5904\u4E8E\u9AD8\u98CE\u9669\u5173\u8054\u7F51\u7EDC", action: "\u62D2\u7EDD + \u9884\u8B66" }
      ],
      ops: { coverage: 72, accuracy: 87, timely: 91, calls: 54300, trend: [
        { month: "2026-03", coverage: 68, accuracy: 84, timely: 88, calls: 46e3 },
        { month: "2026-04", coverage: 69, accuracy: 85, timely: 89, calls: 48e3 },
        { month: "2026-05", coverage: 70, accuracy: 86, timely: 90, calls: 5e4 },
        { month: "2026-06", coverage: 71, accuracy: 86, timely: 90, calls: 52e3 },
        { month: "2026-07", coverage: 72, accuracy: 87, timely: 91, calls: 53e3 },
        { month: "2026-08", coverage: 72, accuracy: 87, timely: 91, calls: 54300 }
      ] }
    }
  ]
};
var FILES2 = { ent: "enterpriseData.json" };
var data2 = JSON.parse(JSON.stringify(SEED_ENTERPRISE));
var version2 = 0;
var saveStatus2 = null;
var listeners3 = /* @__PURE__ */ new Set();
var statusListeners2 = /* @__PURE__ */ new Set();
function emit3() {
  version2++;
  listeners3.forEach((fn) => fn());
}
function emitStatus2() {
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
    emitStatus2();
  }).catch(() => {
    saveStatus2 = "error";
    emitStatus2();
  });
}
async function bootstrap2() {
  const saved = await loadOne2(FILES2.ent);
  if (saved && typeof saved === "object") {
    const s = saved;
    data2 = {
      ...JSON.parse(JSON.stringify(SEED_ENTERPRISE)),
      ...s.dueTasks ? { dueTasks: s.dueTasks } : {},
      ...s.monitorList ? { monitorList: s.monitorList } : {},
      ...s.decisionEvents ? { decisionEvents: s.decisionEvents } : {},
      ...s.reviewOrders ? { reviewOrders: s.reviewOrders } : {},
      ...s.listEnts ? { listEnts: s.listEnts } : {},
      ...s.dataSources ? { dataSources: s.dataSources } : {},
      ...s.alertRules ? { alertRules: s.alertRules } : {},
      ...s.alerts ? { alerts: s.alerts } : {},
      ...s.models ? { models: s.models } : {}
    };
  } else {
    saveOne2(FILES2.ent, data2);
  }
  emit3();
}
void bootstrap2();
function useSnap2(sel) {
  useSyncExternalStore3(
    (l) => {
      listeners3.add(l);
      return () => {
        listeners3.delete(l);
      };
    },
    () => version2
  );
  return sel();
}
function useEnterpriseData() {
  return useSnap2(() => data2);
}

// src/console/QiyePages.tsx
import { Fragment as Fragment5, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var CRUMB = "\u4F01\u4E1A\u98CE\u63A7 / \u4F01\u4E1A\u6863\u6848";
var qiyeSelectedKeyNo = "";
var qiyeSelectedName = "";
var setQiyeSelected = (name, keyNo) => {
  qiyeSelectedName = name;
  qiyeSelectedKeyNo = keyNo;
};
var STATUS_KIND = {
  \u5B58\u7EED: "green",
  \u5728\u4E1A: "blue",
  \u540A\u9500: "red",
  \u6CE8\u9500: "gray",
  \u8FC1\u51FA: "amber"
};
function QiyeSearch() {
  const d = useQiyeData();
  const nav = useNavigate();
  const [kw, setKw] = useState4("");
  const list = useMemo3(() => {
    const q = kw.trim().toLowerCase();
    if (!q) return d.enterprises;
    return d.enterprises.filter(
      (e) => e.name.toLowerCase().includes(q) || e.industry.toLowerCase().includes(q) || e.legalPerson.toLowerCase().includes(q) || e.keyNo.includes(q)
    );
  }, [kw, d.enterprises]);
  const open = (e) => {
    qiyeSelectedKeyNo = e.keyNo;
    nav("/console/ep/qiye-profile");
  };
  return /* @__PURE__ */ jsxs4("div", { style: { padding: 24, maxWidth: 1360 }, children: [
    /* @__PURE__ */ jsx4(
      PageShell,
      {
        title: "\u4F01\u4E1A\u6863\u6848\u68C0\u7D22",
        crumb: `${CRUMB} / \u68C0\u7D22`,
        subtitle: "\u6309\u4F01\u4E1A\u540D\u79F0\u3001\u884C\u4E1A\u3001\u6CD5\u5B9A\u4EE3\u8868\u4EBA\u6216\u552F\u4E00\u6807\u8BC6\u68C0\u7D22\u4F01\u4E1A\u5DE5\u5546\u6863\u6848\uFF0C\u67E5\u770B\u5DE5\u5546\u4FE1\u606F\u3001\u80A1\u4E1C\u3001\u53F8\u6CD5\u3001\u7ECF\u8425\u3001\u77E5\u8BC6\u4EA7\u6743\u7B49\u5168\u7EF4\u5EA6\u753B\u50CF",
        actions: /* @__PURE__ */ jsxs4(Fragment5, { children: [
          /* @__PURE__ */ jsx4(Sam, { label: "\u4F01\u4E1A\u6837\u4F8B", value: "qiyeData.json.enterprises" }),
          /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" })
        ] })
      }
    ),
    /* @__PURE__ */ jsx4(Panel, { title: "\u68C0\u7D22", desc: /* @__PURE__ */ jsxs4("span", { children: [
      "\u5171 ",
      /* @__PURE__ */ jsx4("b", { children: d.enterprises.length }),
      " \u5BB6\u5728\u6863\u4F01\u4E1A \xB7 ",
      /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u6C47\u603B" })
    ] }), children: /* @__PURE__ */ jsxs4("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }, children: [
      /* @__PURE__ */ jsx4(
        "input",
        {
          value: kw,
          onChange: (e) => setKw(e.target.value),
          placeholder: "\u8F93\u5165\u4F01\u4E1A\u540D\u79F0 / \u884C\u4E1A / \u6CD5\u5B9A\u4EE3\u8868\u4EBA / \u6807\u8BC6",
          style: { flex: 1, minWidth: 280, padding: "8px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, outline: "none" }
        }
      ),
      /* @__PURE__ */ jsxs4("span", { style: { fontSize: 12, color: "#94A3B8" }, children: [
        "\u547D\u4E2D ",
        list.length,
        " \u5BB6"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs4("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12, marginTop: 16 }, children: [
      list.map((e) => /* @__PURE__ */ jsxs4(
        "div",
        {
          style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, background: "#fff", cursor: "pointer" },
          onClick: () => open(e),
          children: [
            /* @__PURE__ */ jsxs4("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }, children: [
              /* @__PURE__ */ jsx4("div", { style: { fontSize: 15, fontWeight: 700, color: "#0F172A" }, children: e.name }),
              /* @__PURE__ */ jsx4(Badge, { kind: STATUS_KIND[e.status], children: e.status })
            ] }),
            /* @__PURE__ */ jsx4("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }, children: e.tags.map((t) => /* @__PURE__ */ jsx4(Badge, { kind: "blue", children: t }, t)) }),
            /* @__PURE__ */ jsxs4("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: 12, color: "#475569", marginTop: 10 }, children: [
              /* @__PURE__ */ jsxs4("div", { children: [
                "\u884C\u4E1A\uFF1A",
                e.industry
              ] }),
              /* @__PURE__ */ jsxs4("div", { children: [
                "\u6CD5\u5B9A\u4EE3\u8868\u4EBA\uFF1A",
                e.legalPerson
              ] }),
              /* @__PURE__ */ jsxs4("div", { children: [
                "\u6CE8\u518C\u8D44\u672C\uFF1A",
                e.regCapital.toLocaleString(),
                " \u4E07\u5143"
              ] }),
              /* @__PURE__ */ jsxs4("div", { children: [
                "\u6210\u7ACB\uFF1A",
                e.regDate
              ] }),
              /* @__PURE__ */ jsxs4("div", { children: [
                "\u53C2\u4FDD\u4EBA\u6570\uFF1A",
                e.employees.toLocaleString()
              ] }),
              /* @__PURE__ */ jsxs4("div", { children: [
                "\u79D1\u521B\u5206\uFF1A",
                /* @__PURE__ */ jsx4("b", { style: { color: "#0EA5E9" }, children: e.kcScore })
              ] })
            ] }),
            /* @__PURE__ */ jsxs4("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }, children: [
              /* @__PURE__ */ jsxs4("span", { style: { fontSize: 11, color: "#94A3B8" }, children: [
                "\u6807\u8BC6 ",
                e.keyNo.slice(0, 12),
                "\u2026"
              ] }),
              /* @__PURE__ */ jsx4(Button, { size: "sm", onClick: (ev) => {
                ev.stopPropagation();
                open(e);
              }, children: "\u67E5\u770B\u6863\u6848" })
            ] })
          ]
        },
        e.keyNo
      )),
      !list.length && /* @__PURE__ */ jsx4("div", { style: { color: "#94A3B8", fontSize: 13, padding: 24 }, children: "\u672A\u68C0\u7D22\u5230\u5339\u914D\u4F01\u4E1A" })
    ] })
  ] });
}
function CountGrid({ title, items }) {
  return /* @__PURE__ */ jsx4(Panel, { title, desc: /* @__PURE__ */ jsxs4("span", { children: [
    "\u5B50\u9879\u7EDF\u8BA1 \xB7 ",
    /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" })
  ] }), children: /* @__PURE__ */ jsx4("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }, children: items.map((it) => /* @__PURE__ */ jsxs4("div", { style: { border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", background: it.danger && it.count > 0 ? "#FEF2F2" : "#fff" }, children: [
    /* @__PURE__ */ jsx4("span", { style: { fontSize: 12, color: it.danger && it.count > 0 ? "#DC2626" : "#475569" }, children: it.name }),
    /* @__PURE__ */ jsx4("span", { style: { fontSize: 13, fontWeight: 600, color: it.danger && it.count > 0 ? "#DC2626" : "#334155" }, children: it.count })
  ] }, it.name)) }) });
}
var TABS = ["\u98CE\u9669\u753B\u50CF", "\u57FA\u672C\u4FE1\u606F", "\u6CD5\u5F8B\u8BC9\u8BBC", "\u7ECF\u8425\u98CE\u9669", "\u7ECF\u8425\u4FE1\u606F", "\u4F01\u4E1A\u53D1\u5C55", "\u77E5\u8BC6\u4EA7\u6743"];
function QiyeProfile() {
  const d = useQiyeData();
  const ent = useEnterpriseData();
  const init = (qiyeSelectedName ? d.enterprises.find((e) => e.name === qiyeSelectedName) : void 0) ?? (qiyeSelectedKeyNo ? d.enterprises.find((e) => e.keyNo === qiyeSelectedKeyNo) : void 0);
  const [cur, setCur] = useState4(init ?? d.enterprises[0]);
  const [tab, setTab] = useState4("\u98CE\u9669\u753B\u50CF");
  if (!cur) return /* @__PURE__ */ jsx4("div", { style: { padding: 24 }, children: "\u6682\u65E0\u4F01\u4E1A\u6863\u6848" });
  const shCols = [
    { key: "name", label: "\u80A1\u4E1C", type: "text", fixed: "left", width: "220px" },
    { key: "type", label: "\u7C7B\u578B", type: "badge", badgeKind: "blue", width: "110px" },
    { key: "ratio", label: "\u6301\u80A1\u6BD4\u4F8B", type: "percent", width: "110px" },
    { key: "amount", label: "\u8BA4\u7F34\u51FA\u8D44\u989D", type: "money", width: "140px" }
  ];
  const shRows = cur.shareholders.map((s) => ({ id: s.name, name: s.name, type: { v: s.type, kind: "blue" }, ratio: s.ratio, amount: s.amount * 1e4 }));
  const psCols = [
    { key: "name", label: "\u59D3\u540D", type: "text", fixed: "left", width: "160px" },
    { key: "position", label: "\u804C\u52A1", type: "text" }
  ];
  const psRows = cur.persons.map((p) => ({ id: p.name, name: p.name, position: p.position }));
  const invCols = [
    { key: "name", label: "\u88AB\u6295\u8D44\u4F01\u4E1A", type: "text", fixed: "left", width: "260px" },
    { key: "ratio", label: "\u6301\u80A1", type: "percent", width: "100px" },
    { key: "legal", label: "\u6CD5\u5B9A\u4EE3\u8868\u4EBA", type: "text", width: "140px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "gray", width: "120px" }
  ];
  const invRows = cur.invests.map((i) => ({ id: i.name, name: i.name, ratio: i.ratio, legal: i.legal, status: { v: i.status, kind: "gray" } }));
  const chCols = [
    { key: "date", label: "\u53D8\u66F4\u65E5\u671F", type: "text", width: "130px" },
    { key: "item", label: "\u53D8\u66F4\u9879\u76EE", type: "text", width: "140px" },
    { key: "before", label: "\u53D8\u66F4\u524D", type: "text" },
    { key: "after", label: "\u53D8\u66F4\u540E", type: "text" }
  ];
  const chRows = cur.changes.map((c, idx) => ({ id: `c${idx}`, date: c.date, item: c.item, before: c.before, after: c.after }));
  const brCols = [
    { key: "name", label: "\u5206\u652F\u673A\u6784", type: "text", fixed: "left", width: "320px" },
    { key: "addr", label: "\u6CE8\u518C\u5730\u5740", type: "text" }
  ];
  const brRows = cur.branches.map((b) => ({ id: b.name, name: b.name, addr: b.addr }));
  const caseCols = [
    { key: "id", label: "\u6848\u53F7", type: "text", width: "140px" },
    { key: "title", label: "\u6848\u4EF6\u540D\u79F0", type: "text" },
    { key: "type", label: "\u7C7B\u578B", type: "badge", badgeKind: "red", width: "130px" },
    { key: "date", label: "\u65E5\u671F", type: "text", width: "120px" },
    { key: "role", label: "\u8EAB\u4EFD", type: "badge", badgeKind: "blue", width: "100px" },
    { key: "amount", label: "\u6807\u7684(\u4E07)", type: "number", width: "100px" },
    { key: "status", label: "\u72B6\u6001", type: "text", width: "120px" }
  ];
  const caseRows = cur.legalCases.map((c) => ({ id: c.id, title: c.title, type: { v: c.type, kind: "red" }, date: c.date, role: { v: c.role, kind: "blue" }, amount: c.amount ?? 0, status: c.status }));
  const ipCols = [
    { key: "name", label: "\u540D\u79F0", type: "text", fixed: "left", width: "240px" },
    { key: "type", label: "\u7C7B\u578B", type: "badge", badgeKind: "violet", width: "120px" },
    { key: "no", label: "\u6CE8\u518C\u53F7", type: "text", width: "200px" },
    { key: "date", label: "\u7533\u8BF7/\u6CE8\u518C\u65E5", type: "text", width: "130px" },
    { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "green", width: "100px" }
  ];
  const ipRows = cur.ips.map((i) => ({ id: i.id, name: i.name, type: { v: i.type, kind: "violet" }, no: i.no, date: i.date, status: { v: i.status, kind: "green" } }));
  const riskCases = cur.legalCases.length;
  const dangerCount = cur.riskCounts.filter((r) => r.danger && r.count > 0).length;
  const mon = ent.monitorList.find((m) => m.name === cur.name) ?? { riskLevel: "\u4F4E", alerts: 0, lastAlert: "\u2014", monitorSince: "\u2014" };
  const alertOf = ent.alerts.filter((a) => a.entName === cur.name);
  const riskLevel = mon.riskLevel;
  const modelScore = (mid) => {
    if (mid === "ent-credit") return riskLevel === "\u9AD8" ? 498 : riskLevel === "\u4E2D" ? 648 : 792;
    if (mid === "ent-fraud") return riskLevel === "\u9AD8" ? 82 : riskLevel === "\u4E2D" ? 58 : 32;
    return riskLevel === "\u9AD8" ? 78 : riskLevel === "\u4E2D" ? 54 : 28;
  };
  const gradeOf = (score, range, invert = false) => {
    const w = range[1] - range[0];
    let pos = (score - range[0]) / w;
    if (invert) pos = 1 - pos;
    return pos < 0.34 ? "\u4F4E\u98CE\u9669" : pos < 0.67 ? "\u4E2D\u98CE\u9669" : "\u9AD8\u98CE\u9669";
  };
  const riskLevelKind = (lv) => lv === "\u9AD8" ? "red" : lv === "\u4E2D" ? "amber" : "green";
  const tabBadge = (t) => {
    switch (t) {
      case "\u98CE\u9669\u753B\u50CF":
        return { n: alertOf.length || dangerCount, danger: (alertOf.length || dangerCount) > 0 };
      case "\u57FA\u672C\u4FE1\u606F":
        return { n: cur.shareholders.length + cur.persons.length };
      case "\u6CD5\u5F8B\u8BC9\u8BBC":
        return { n: riskCases, danger: riskCases > 0 };
      case "\u7ECF\u8425\u98CE\u9669":
        return { n: dangerCount, danger: dangerCount > 0 };
      case "\u7ECF\u8425\u4FE1\u606F":
        return { n: cur.bizCounts.reduce((s, r) => s + r.count, 0) };
      case "\u4F01\u4E1A\u53D1\u5C55":
        return { n: cur.devCounts.reduce((s, r) => s + r.count, 0) };
      case "\u77E5\u8BC6\u4EA7\u6743":
        return { n: cur.ipCounts.reduce((s, r) => s + r.count, 0) };
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxs4("div", { style: { padding: 24, maxWidth: 1360 }, children: [
    /* @__PURE__ */ jsx4(
      PageShell,
      {
        title: "\u4F01\u4E1A\u6863\u6848",
        crumb: `${CRUMB} / ${cur.name}`,
        subtitle: "\u4F01\u4E1A\u5DE5\u5546\u6863\u6848\uFF1A\u5DE5\u5546\u4FE1\u606F\u3001\u80A1\u4E1C\u4E0E\u4E3B\u8981\u4EBA\u5458\u3001\u5BF9\u5916\u6295\u8D44\u4E0E\u5206\u652F\u3001\u53F8\u6CD5\u4E0E\u7ECF\u8425\u98CE\u9669\u3001\u7ECF\u8425\u4FE1\u606F\u3001\u4F01\u4E1A\u53D1\u5C55\u4E0E\u77E5\u8BC6\u4EA7\u6743\u5168\u7EF4\u5EA6\u753B\u50CF",
        actions: /* @__PURE__ */ jsxs4(Fragment5, { children: [
          /* @__PURE__ */ jsx4(Sam, { label: "\u4F01\u4E1A\u6837\u4F8B", value: "qiyeData.json" }),
          /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs4("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, background: "#fff", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxs4("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs4("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ jsx4("div", { style: { width: 52, height: 52, borderRadius: 10, background: "linear-gradient(135deg,#0EA5E9,#22D3EE)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }, children: cur.name.slice(0, 1) }),
          /* @__PURE__ */ jsxs4("div", { children: [
            /* @__PURE__ */ jsxs4("div", { style: { fontSize: 18, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }, children: [
              cur.name,
              " ",
              /* @__PURE__ */ jsx4(Badge, { kind: STATUS_KIND[cur.status], children: cur.status })
            ] }),
            /* @__PURE__ */ jsx4("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }, children: cur.tags.map((t) => /* @__PURE__ */ jsx4(Badge, { kind: "blue", children: t }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs4("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ jsxs4("div", { style: { textAlign: "right" }, children: [
            /* @__PURE__ */ jsx4("div", { style: { fontSize: 12, color: "#94A3B8" }, children: "\u79D1\u521B\u5206" }),
            /* @__PURE__ */ jsx4("div", { style: { fontSize: 22, fontWeight: 800, color: "#0EA5E9" }, children: cur.kcScore })
          ] }),
          /* @__PURE__ */ jsx4(Button, { size: "sm", variant: cur.followed ? "secondary" : "primary", onClick: () => toggleFollow(cur.keyNo), children: cur.followed ? "\u5DF2\u5173\u6CE8" : "\uFF0B \u5173\u6CE8" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs4("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", marginTop: 14, fontSize: 13, color: "#475569" }, children: [
        /* @__PURE__ */ jsxs4("span", { children: [
          "\u6CE8\u518C\u8D44\u672C\uFF1A",
          /* @__PURE__ */ jsxs4("b", { children: [
            cur.regCapital.toLocaleString(),
            " \u4E07\u5143"
          ] })
        ] }),
        /* @__PURE__ */ jsxs4("span", { children: [
          "\u5B9E\u7F34\u8D44\u672C\uFF1A",
          /* @__PURE__ */ jsxs4("b", { children: [
            cur.paidCapital.toLocaleString(),
            " \u4E07\u5143"
          ] })
        ] }),
        /* @__PURE__ */ jsxs4("span", { children: [
          "\u6210\u7ACB\u65E5\u671F\uFF1A",
          /* @__PURE__ */ jsx4("b", { children: cur.regDate })
        ] }),
        /* @__PURE__ */ jsxs4("span", { children: [
          "\u6CD5\u5B9A\u4EE3\u8868\u4EBA\uFF1A",
          /* @__PURE__ */ jsx4("b", { children: cur.legalPerson })
        ] }),
        /* @__PURE__ */ jsxs4("span", { children: [
          "\u53C2\u4FDD\u4EBA\u6570\uFF1A",
          /* @__PURE__ */ jsx4("b", { children: cur.employees.toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxs4("span", { children: [
          "\u884C\u4E1A\uFF1A",
          /* @__PURE__ */ jsx4("b", { children: cur.industry })
        ] })
      ] }),
      /* @__PURE__ */ jsxs4("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", marginTop: 6, fontSize: 12, color: "#64748B" }, children: [
        /* @__PURE__ */ jsxs4("span", { children: [
          "\u90AE\u7BB1\uFF1A",
          cur.email
        ] }),
        /* @__PURE__ */ jsxs4("span", { children: [
          "\u5B98\u7F51\uFF1A",
          cur.website
        ] }),
        /* @__PURE__ */ jsxs4("span", { children: [
          "\u5730\u5740\uFF1A",
          cur.regAddr
        ] }),
        /* @__PURE__ */ jsxs4("span", { children: [
          "\u7EDF\u4E00\u793E\u4F1A\u4FE1\u7528\u4EE3\u7801\uFF1A",
          cur.creditCode
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx4("div", { style: { display: "flex", gap: 4, borderBottom: "1px solid #E2E8F0", marginBottom: 14, flexWrap: "wrap" }, children: TABS.map((t) => {
      const bg = tabBadge(t);
      return /* @__PURE__ */ jsxs4(
        "button",
        {
          onClick: () => setTab(t),
          style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 13, border: "none", background: "none", cursor: "pointer", color: t === tab ? "#0EA5E9" : "#64748B", fontWeight: t === tab ? 700 : 400, borderBottom: t === tab ? "2px solid #0EA5E9" : "2px solid transparent", marginBottom: -1 },
          children: [
            t,
            bg && /* @__PURE__ */ jsx4("span", { style: { fontSize: 10, fontWeight: 600, lineHeight: 1, padding: "2px 6px", borderRadius: 999, background: bg.danger ? "#FEE2E2" : "#E0F2FE", color: bg.danger ? "#B91C1C" : "#0369A1" }, children: bg.n })
          ]
        },
        t
      );
    }) }),
    tab === "\u98CE\u9669\u753B\u50CF" && /* @__PURE__ */ jsxs4(Fragment5, { children: [
      /* @__PURE__ */ jsxs4("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ jsx4(StatCard, { label: "\u7EFC\u5408\u98CE\u9669\u7B49\u7EA7", value: riskLevel, accent: riskLevelKind(riskLevel), hint: /* @__PURE__ */ jsx4(Cal, { label: "\u6A21\u578B+\u76D1\u63A7\u540D\u5355" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u7D2F\u8BA1\u9884\u8B66", value: String(mon.alerts), accent: "amber", hint: mon.lastAlert !== "\u2014" ? `\u6700\u8FD1 ${mon.lastAlert}` : "\u65E0\u9884\u8B66" }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u53F8\u6CD5\u6D89\u8BC9", value: String(riskCases), accent: riskCases > 0 ? "rose" : "green", hint: "\u88C1\u5224\u6587\u4E66 + \u7ACB\u6848" }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u98CE\u9669\u547D\u4E2D\u9879", value: String(dangerCount), accent: dangerCount > 0 ? "rose" : "green", hint: "\u7ECF\u8425\u98CE\u9669\u547D\u4E2D" })
      ] }),
      /* @__PURE__ */ jsx4(Panel, { title: "\u98CE\u9669\u6A21\u578B\u7ED3\u679C", desc: /* @__PURE__ */ jsxs4("span", { children: [
        "\u4F01\u4E1A\u98CE\u63A7\u6A21\u578B\u8BC4\u5206\u4E0E\u98CE\u9669\u7ED3\u8BBA \xB7 ",
        /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u8BA1\u7B97" }),
        " \xB7 ",
        /* @__PURE__ */ jsx4(Sam, { value: "enterpriseData.json.models" })
      ] }), children: /* @__PURE__ */ jsx4("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }, children: ent.models.map((m) => {
        const score = modelScore(m.id);
        const gr = gradeOf(score, m.range, m.id === "ent-credit");
        const grKind = gr === "\u9AD8\u98CE\u9669" ? "red" : gr === "\u4E2D\u98CE\u9669" ? "amber" : "green";
        const thr = m.thresholds.find((t) => t.level === gr);
        return /* @__PURE__ */ jsxs4("div", { style: { border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, background: "#F8FAFC" }, children: [
          /* @__PURE__ */ jsxs4("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
            /* @__PURE__ */ jsx4("span", { style: { fontSize: 14, fontWeight: 700, color: "#0F172A" }, children: m.name }),
            /* @__PURE__ */ jsx4(Badge, { kind: grKind, children: gr })
          ] }),
          /* @__PURE__ */ jsxs4("div", { style: { display: "flex", alignItems: "baseline", gap: 4, margin: "10px 0" }, children: [
            /* @__PURE__ */ jsx4("span", { style: { fontSize: 30, fontWeight: 800, color: m.color, fontVariantNumeric: "tabular-nums" }, children: score }),
            /* @__PURE__ */ jsxs4("span", { style: { fontSize: 12, color: "#94A3B8" }, children: [
              "/ ",
              m.range[0],
              "\u2013",
              m.range[1]
            ] })
          ] }),
          /* @__PURE__ */ jsxs4("div", { style: { fontSize: 12, color: "#475569", lineHeight: 1.6 }, children: [
            /* @__PURE__ */ jsxs4("div", { children: [
              "\u7B97\u6CD5\uFF1A",
              m.algoType,
              " \xB7 ",
              m.version
            ] }),
            /* @__PURE__ */ jsxs4("div", { children: [
              "\u7ED3\u8BBA\uFF1A",
              thr?.meaning ?? "\u2014"
            ] }),
            /* @__PURE__ */ jsxs4("div", { style: { color: "#94A3B8" }, children: [
              "\u5EFA\u8BAE\uFF1A",
              thr?.action ?? "\u2014"
            ] })
          ] })
        ] }, m.id);
      }) }) }),
      /* @__PURE__ */ jsx4(Panel, { title: "\u9884\u8B66\u8BB0\u5F55", desc: /* @__PURE__ */ jsxs4("span", { children: [
        "\u8BE5\u4F01\u4E1A\u8FD1\u671F\u9884\u8B66 \xB7 ",
        /* @__PURE__ */ jsx4(Sam, { value: "enterpriseData.json.alerts" })
      ] }), children: /* @__PURE__ */ jsx4(
        DataTable,
        {
          columns: [
            { key: "time", label: "\u9884\u8B66\u65F6\u95F4", type: "text", width: "150px" },
            { key: "rule", label: "\u547D\u4E2D\u89C4\u5219", type: "text", width: "180px" },
            { key: "lv", label: "\u7B49\u7EA7", type: "badge", badgeKind: "gray", width: "110px" },
            { key: "detail", label: "\u9884\u8B66\u5185\u5BB9", type: "text" },
            { key: "status", label: "\u72B6\u6001", type: "badge", badgeKind: "gray", width: "100px" }
          ],
          rows: alertOf.map((a, i) => ({ id: String(i), time: a.alert_date, rule: a.ruleName, lv: { v: a.level === "RED" ? "\u7EA2\u706F" : a.level === "YELLOW" ? "\u9EC4\u706F" : "\u673A\u4F1A", kind: a.level === "RED" ? "red" : a.level === "YELLOW" ? "amber" : "cyan" }, detail: a.detail, status: { v: a.status, kind: a.status === "\u5F85\u5904\u7F6E" ? "red" : a.status === "\u6838\u5B9E\u4E2D" ? "amber" : "green" } })),
          empty: "\u8BE5\u4F01\u4E1A\u6682\u65E0\u9884\u8B66",
          pager: true,
          defaultPageSize: 6
        }
      ) }),
      /* @__PURE__ */ jsx4(Panel, { title: "\u98CE\u9669\u547D\u4E2D\u7EF4\u5EA6", desc: /* @__PURE__ */ jsxs4("span", { children: [
        "\u7ECF\u8425/\u53F8\u6CD5/\u8206\u60C5\u7B49\u98CE\u9669\u7EF4\u5EA6 \xB7 ",
        /* @__PURE__ */ jsx4(Sam, { value: "qiyeData.json.riskCounts" })
      ] }), children: /* @__PURE__ */ jsx4("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }, children: cur.riskCounts.map((r) => /* @__PURE__ */ jsxs4("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F1F5F9", borderRadius: 8, padding: "8px 12px", fontSize: 13 }, children: [
        /* @__PURE__ */ jsx4("span", { style: { color: "#475569" }, children: r.name }),
        /* @__PURE__ */ jsxs4("span", { style: { color: r.danger && r.count > 0 ? "#DC2626" : "#059669", fontWeight: 600 }, children: [
          r.count > 0 ? `${r.count} \u9879` : "\u65E0",
          " ",
          r.danger && r.count > 0 ? "\u26A0" : "\u2713"
        ] })
      ] }, r.name)) }) })
    ] }),
    tab === "\u57FA\u672C\u4FE1\u606F" && /* @__PURE__ */ jsxs4(Fragment5, { children: [
      /* @__PURE__ */ jsxs4("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ jsx4(StatCard, { label: "\u80A1\u4E1C\u4EBA\u6570", value: String(cur.shareholders.length), accent: "brand", hint: /* @__PURE__ */ jsx4(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u4E3B\u8981\u4EBA\u5458", value: String(cur.persons.length), accent: "cyan", hint: /* @__PURE__ */ jsx4(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u5BF9\u5916\u6295\u8D44", value: String(cur.invests.length), accent: "violet", hint: /* @__PURE__ */ jsx4(Sam, { label: "\u6837\u4F8B" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u5206\u652F\u673A\u6784", value: String(cur.branches.length), accent: "emerald", hint: /* @__PURE__ */ jsx4(Sam, { label: "\u6837\u4F8B" }) })
      ] }),
      /* @__PURE__ */ jsxs4(Panel, { title: "\u5DE5\u5546\u4FE1\u606F", desc: /* @__PURE__ */ jsxs4("span", { children: [
        "\u57FA\u7840\u767B\u8BB0\u4FE1\u606F \xB7 ",
        /* @__PURE__ */ jsx4(Sam, { value: "qiyeData.json" })
      ] }), children: [
        /* @__PURE__ */ jsx4("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontSize: 13 }, children: [
          ["\u7EDF\u4E00\u793E\u4F1A\u4FE1\u7528\u4EE3\u7801", cur.creditCode],
          ["\u6CE8\u518C\u53F7", cur.regNo],
          ["\u6CD5\u5B9A\u4EE3\u8868\u4EBA", cur.legalPerson],
          ["\u6CE8\u518C\u8D44\u672C", `${cur.regCapital.toLocaleString()} \u4E07\u5143`],
          ["\u5B9E\u7F34\u8D44\u672C", `${cur.paidCapital.toLocaleString()} \u4E07\u5143`],
          ["\u6210\u7ACB\u65E5\u671F", cur.regDate],
          ["\u7ECF\u8425\u72B6\u6001", cur.status],
          ["\u884C\u4E1A", cur.industry],
          ["\u6CE8\u518C\u5730\u5740", cur.regAddr],
          ["\u53C2\u4FDD\u4EBA\u6570", `${cur.employees.toLocaleString()} \u4EBA`]
        ].map(([k, v]) => /* @__PURE__ */ jsxs4("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #F1F5F9", paddingBottom: 4 }, children: [
          /* @__PURE__ */ jsx4("span", { style: { color: "#94A3B8" }, children: k }),
          /* @__PURE__ */ jsx4("span", { style: { color: "#334155", fontWeight: 500 }, children: v })
        ] }, k)) }),
        /* @__PURE__ */ jsxs4("div", { style: { marginTop: 10, fontSize: 12, color: "#64748B" }, children: [
          "\u7ECF\u8425\u8303\u56F4\uFF1A",
          cur.bizScope
        ] })
      ] }),
      /* @__PURE__ */ jsx4(Panel, { title: "\u80A1\u4E1C\u4FE1\u606F", desc: /* @__PURE__ */ jsxs4("span", { children: [
        "\u80A1\u4E1C\u53CA\u51FA\u8D44 \xB7 ",
        /* @__PURE__ */ jsx4(Sam, { value: "qiyeData.json.shareholders" })
      ] }), children: /* @__PURE__ */ jsx4(DataTable, { columns: shCols, rows: shRows, empty: "\u65E0", pager: true, defaultPageSize: 10 }) }),
      /* @__PURE__ */ jsx4(Panel, { title: "\u4E3B\u8981\u4EBA\u5458", desc: /* @__PURE__ */ jsxs4("span", { children: [
        "\u8463\u76D1\u9AD8 \xB7 ",
        /* @__PURE__ */ jsx4(Sam, { value: "qiyeData.json.persons" })
      ] }), children: /* @__PURE__ */ jsx4(DataTable, { columns: psCols, rows: psRows, empty: "\u65E0", pager: true, defaultPageSize: 10 }) }),
      /* @__PURE__ */ jsx4(Panel, { title: "\u5BF9\u5916\u6295\u8D44", desc: /* @__PURE__ */ jsxs4("span", { children: [
        "\u88AB\u6295\u8D44\u4F01\u4E1A\u4E0E\u6301\u80A1\u6BD4\u4F8B \xB7 ",
        /* @__PURE__ */ jsx4(Sam, { value: "qiyeData.json.invests" })
      ] }), children: /* @__PURE__ */ jsx4(DataTable, { columns: invCols, rows: invRows, empty: "\u65E0", pager: true, defaultPageSize: 10 }) }),
      /* @__PURE__ */ jsxs4("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }, children: [
        /* @__PURE__ */ jsx4(Panel, { title: "\u53D8\u66F4\u8BB0\u5F55", desc: /* @__PURE__ */ jsxs4("span", { children: [
          "\u5DE5\u5546\u53D8\u66F4 \xB7 ",
          /* @__PURE__ */ jsx4(Sam, { value: "qiyeData.json.changes" })
        ] }), children: /* @__PURE__ */ jsx4(DataTable, { columns: chCols, rows: chRows, empty: "\u65E0", pager: true, defaultPageSize: 6 }) }),
        /* @__PURE__ */ jsx4(Panel, { title: "\u5206\u652F\u673A\u6784", desc: /* @__PURE__ */ jsxs4("span", { children: [
          "\u5206\u516C\u53F8 \xB7 ",
          /* @__PURE__ */ jsx4(Sam, { value: "qiyeData.json.branches" })
        ] }), children: /* @__PURE__ */ jsx4(DataTable, { columns: brCols, rows: brRows, empty: "\u65E0", pager: true, defaultPageSize: 6 }) })
      ] })
    ] }),
    tab === "\u6CD5\u5F8B\u8BC9\u8BBC" && /* @__PURE__ */ jsxs4(Fragment5, { children: [
      /* @__PURE__ */ jsxs4("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ jsx4(StatCard, { label: "\u53F8\u6CD5\u6848\u4EF6", value: String(riskCases), accent: "rose", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u88C1\u5224\u6587\u4E66", value: String(cur.legalCases.length), accent: "amber", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u7ACB\u6848\u4FE1\u606F", value: "99", accent: "amber", hint: "\u6848\u4EF6\u91CF\u7EA7" }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u5F00\u5EAD\u516C\u544A", value: "119", accent: "cyan", hint: "\u6848\u4EF6\u91CF\u7EA7" })
      ] }),
      /* @__PURE__ */ jsx4(Panel, { title: "\u53F8\u6CD5\u6848\u4EF6", desc: /* @__PURE__ */ jsxs4("span", { children: [
        "\u4F01\u4E1A\u6D89\u8BC9\u8BB0\u5F55\uFF08\u62BD\u6837\uFF09 \xB7 ",
        /* @__PURE__ */ jsx4(Sam, { value: "qiyeData.json.legalCases" })
      ] }), children: /* @__PURE__ */ jsx4(DataTable, { columns: caseCols, rows: caseRows, empty: "\u65E0\u6D89\u8BC9\u8BB0\u5F55", pager: true, defaultPageSize: 10 }) })
    ] }),
    tab === "\u7ECF\u8425\u98CE\u9669" && /* @__PURE__ */ jsxs4(Fragment5, { children: [
      /* @__PURE__ */ jsxs4("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ jsx4(StatCard, { label: "\u98CE\u9669\u5B50\u9879", value: String(cur.riskCounts.length), accent: "brand", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u98CE\u9669\u547D\u4E2D", value: String(dangerCount), accent: "rose", hint: "\u9700\u5173\u6CE8\u9879" }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u884C\u653F\u5904\u7F5A", value: String(cur.riskCounts.find((r) => r.name === "\u884C\u653F\u5904\u7F5A")?.count ?? 0), accent: "emerald", hint: "\u7EFF\u8272\u4E3A\u65E0" }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u52B3\u52A8\u4EF2\u88C1", value: String(cur.riskCounts.find((r) => r.name === "\u52B3\u52A8\u4EF2\u88C1")?.count ?? 0), accent: "amber", hint: "\u4E89\u8BAE\u9879" })
      ] }),
      /* @__PURE__ */ jsx4(CountGrid, { title: "\u7ECF\u8425\u98CE\u9669", items: cur.riskCounts })
    ] }),
    tab === "\u7ECF\u8425\u4FE1\u606F" && /* @__PURE__ */ jsxs4(Fragment5, { children: [
      /* @__PURE__ */ jsxs4("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ jsx4(StatCard, { label: "\u8D44\u8D28\u8BC1\u4E66", value: String(cur.bizCounts.find((r) => r.name === "\u8D44\u8D28\u8BC1\u4E66")?.count ?? 0), accent: "brand", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u884C\u653F\u8BB8\u53EF", value: String(cur.bizCounts.find((r) => r.name === "\u884C\u653F\u8BB8\u53EF")?.count ?? 0), accent: "cyan", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u62DB\u6295\u6807", value: String(cur.bizCounts.find((r) => r.name === "\u62DB\u6295\u6807")?.count ?? 0), accent: "violet", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u62DB\u8058", value: String(cur.bizCounts.find((r) => r.name === "\u62DB\u8058")?.count ?? 0), accent: "emerald", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) })
      ] }),
      /* @__PURE__ */ jsx4(CountGrid, { title: "\u7ECF\u8425\u4FE1\u606F", items: cur.bizCounts })
    ] }),
    tab === "\u4F01\u4E1A\u53D1\u5C55" && /* @__PURE__ */ jsxs4(Fragment5, { children: [
      /* @__PURE__ */ jsxs4("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ jsx4(StatCard, { label: "\u65B0\u95FB\u8206\u60C5", value: String(cur.newsCount), accent: "brand", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u4E0A\u699C\u699C\u5355", value: String(cur.devCounts.find((r) => r.name === "\u4E0A\u699C\u699C\u5355")?.count ?? 0), accent: "violet", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u8363\u8A89", value: String(cur.devCounts.find((r) => r.name === "\u8363\u8A89")?.count ?? 0), accent: "amber", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u76F8\u5173\u516C\u544A", value: String(cur.devCounts.find((r) => r.name === "\u76F8\u5173\u516C\u544A")?.count ?? 0), accent: "cyan", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) })
      ] }),
      /* @__PURE__ */ jsx4(CountGrid, { title: "\u4F01\u4E1A\u53D1\u5C55", items: cur.devCounts })
    ] }),
    tab === "\u77E5\u8BC6\u4EA7\u6743" && /* @__PURE__ */ jsxs4(Fragment5, { children: [
      /* @__PURE__ */ jsxs4("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 14 }, children: [
        /* @__PURE__ */ jsx4(StatCard, { label: "\u5546\u6807\u4FE1\u606F", value: String(cur.ipCounts.find((r) => r.name === "\u5546\u6807\u4FE1\u606F")?.count ?? 0), accent: "brand", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u4E13\u5229\u4FE1\u606F", value: String(cur.ipCounts.find((r) => r.name === "\u4E13\u5229\u4FE1\u606F")?.count ?? 0), accent: "violet", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u8F6F\u4EF6\u8457\u4F5C\u6743", value: String(cur.ipCounts.find((r) => r.name === "\u8F6F\u4EF6\u8457\u4F5C\u6743")?.count ?? 0), accent: "cyan", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) }),
        /* @__PURE__ */ jsx4(StatCard, { label: "\u6807\u51C6\u4FE1\u606F", value: String(cur.ipCounts.find((r) => r.name === "\u6807\u51C6\u4FE1\u606F")?.count ?? 0), accent: "emerald", hint: /* @__PURE__ */ jsx4(Cal, { label: "\u5B9E\u65F6\u7EDF\u8BA1" }) })
      ] }),
      /* @__PURE__ */ jsx4(CountGrid, { title: "\u77E5\u8BC6\u4EA7\u6743", items: cur.ipCounts }),
      /* @__PURE__ */ jsx4(Panel, { title: "\u5546\u6807 / \u4E13\u5229 / \u8457\u4F5C\u6743\uFF08\u62BD\u6837\uFF09", desc: /* @__PURE__ */ jsxs4("span", { children: [
        "\u77E5\u8BC6\u4EA7\u6743\u660E\u7EC6 \xB7 ",
        /* @__PURE__ */ jsx4(Sam, { value: "qiyeData.json.ips" })
      ] }), children: /* @__PURE__ */ jsx4(DataTable, { columns: ipCols, rows: ipRows, empty: "\u65E0", pager: true, defaultPageSize: 10 }) })
    ] })
  ] });
}
export {
  QiyeProfile,
  QiyeSearch,
  qiyeSelectedKeyNo,
  qiyeSelectedName,
  setQiyeSelected
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
