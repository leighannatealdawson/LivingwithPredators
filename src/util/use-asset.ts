import { useEffect, useState } from "react";

/**
 * Lightweight existence check for public/ assets served under `import.meta.env.BASE_URL`.
 * Used for optional images (e.g. Consent.png) that the researcher may or may
 * not have supplied yet — lets us render unconditionally without broken-image
 * placeholders.
 */
export function usePageAssetExists(relativePath: string): boolean {
  const [exists, setExists] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const url = import.meta.env.BASE_URL + relativePath;
    fetch(url, { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setExists(r.ok);
      })
      .catch(() => {
        if (!cancelled) setExists(false);
      });
    return () => {
      cancelled = true;
    };
  }, [relativePath]);
  return exists;
}
