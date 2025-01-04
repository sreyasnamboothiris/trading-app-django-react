import React, { useEffect, useRef, memo } from 'react';

function SymbolSearchWidget() {
  const container = useRef();

  useEffect(() => {
    if (container.current && container.current.children.length === 0) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-search.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "width": "100%",
          "height": "50",
          "locale": "en",
          "theme": "dark"
        }`;
      container.current.appendChild(script);
    }
  }, []); // Run only once when the component mounts

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ width: '100%', height: '50px' }}
    />
  );
}

export default memo(SymbolSearchWidget);
