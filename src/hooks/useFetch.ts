import { useEffect, useState } from "react";

const Feed = require('feed-to-json-promise')

async function doFetch(url: string, options?: RequestInit) {
  // const result = await fetch(url, options);
  // const json = await result.json();
  const feed = new Feed()
  const json = await feed.load(url);

  return json;

  // if (json.status === "ok") {
  //   return json;
  // } else {
  //   throw new Error(json.message);
  // }
}

export function useFetch(url: string): any {
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    const controller = new AbortController();
    let didCancel = false;
    (async () => {
      setResponse(null);
      try {
        const result = await doFetch(url, { signal: controller.signal });
        if (didCancel) return;
        setResponse(result);
      } catch (e) {
        setResponse({ error: e.message });
      }
    })();

    return () => {
      controller.abort();
      didCancel = true;
    };
  }, [url]);

  return response;
}
