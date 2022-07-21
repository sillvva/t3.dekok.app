/**
 * Credit to:
 * https://github.com/shettypuneeth/react-codepen-embed
 */

import { useState, useRef, useEffect } from "react";
import PageMessage from "../page-message";

const SCRIPT_URL = "https://static.codepen.io/assets/embed/ei.js"; // new embed
const LOAD_STATE = {
  BOOTING: "__booting__",
  ERROR: "__error__",
  LOADING: "__loading__",
  LOADED: "__loaded__"
};

type CodePenProps = {
  hash: string;
  user: string;
  title?: string;
  defaultTab?: string;
  height?: number;
  loader?: JSX.Element | ((...args: any[]) => JSX.Element);
  preview?: boolean;
  editable?: boolean;
  themeId?: string | number;
  version?: number;
};

function ReactCodepen(props: CodePenProps) {
  const [loadState, setLoadState] = useState(LOAD_STATE.BOOTING);
  const [error, setError] = useState("");
  const _isMounted = useRef(false);
  const _isMobile = useRef(false);
  const scriptId = "codepen-script";

  if (typeof window !== "undefined") {
    _isMobile.current = !!navigator.userAgent.match(/Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i);
  }

  useEffect(() => {
    if (!_isMounted.current) _isMounted.current = true;
    if (_isMobile.current) return;

    const codepenScript = document.getElementById(scriptId);
    if (codepenScript) return;

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.id = scriptId;
    script.onload = () => {
      if (!_isMounted.current) return;
      setLoadState(LOAD_STATE.LOADED);
    };
    script.onerror = () => {
      if (!_isMounted.current) return;
      setLoadState(LOAD_STATE.ERROR);
      setError("Failed to load the pen");
    };

    setLoadState(LOAD_STATE.LOADING);
    document.body.appendChild(script);

    return () => {
      _isMounted.current = false;
      document.getElementById(scriptId)?.remove();
    };
  }, []);

  const showLoader = loadState == LOAD_STATE.LOADING && props.loader;
  const penLink = `https://codepen.io/${props.user}/pen/${props.hash}/`;
  const userProfileLink = `https://codepen.io/${props.user}`;
  const loader = typeof props.loader == "function" ? props.loader() : props.loader;

  return (
    <div className="codepen-container">
      {showLoader && loader}
      {loadState == LOAD_STATE.ERROR ?? error}
      <div
        data-height={props.height}
        data-theme-id={props.themeId}
        data-slug-hash={props.hash}
        data-default-tab={props.defaultTab}
        data-user={props.user}
        data-embed-version={props.version}
        data-pen-title={props.title}
        data-preview={props.preview}
        data-editable={props.editable}
        className="codepen">
        See the <a href={penLink}>{props.title}</a> Pen by <a href={userProfileLink}>@{props.user}</a> on <a href="https://codepen.io">CodePen</a>.
      </div>
    </div>
  );
}

ReactCodepen.defaultProps = {
  defaultTab: "result",
  height: 500,
  preview: true,
  editable: false,
  themeId: "dark",
  version: 2,
  loader: <PageMessage>Loading...</PageMessage>
};

export default ReactCodepen;
