import { useState, useEffect, useRef } from "react";

export interface SolrResult {
  label: string;
  value: string;
  isisKey: string;
}

export function useSolrSearch(query: string, debounceMs = 300) {
  const [results, setResults] = useState<SolrResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const term = query.trim();
    if (!term || term.length <= 1) {
      setResults([]);
      return;
    }

    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: `fulltext:${term}~`,
          wt: "json",
          fq: "facet:StreetAddress",
          rows: "20",
        });

        const res = await fetch(
          `https://mapsearch.capetown.gov.za/solr/coct/select?${params}`,
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error(`Solr request failed: ${res.status}`);

        const data = await res.json();
        const docs = data?.response?.docs ?? [];
        setResults(
          docs.map((item: any) => ({
            label: item.fulltext,
            value: item.fulltext,
            isisKey: item.pid,
          })),
        );
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setError("Failed to retrieve address search results");
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [query, debounceMs]);
  return { results, loading, error };
}
