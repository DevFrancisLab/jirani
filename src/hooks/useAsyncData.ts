import { useCallback, useEffect, useState } from "react";

export type AsyncStatus = "loading" | "success" | "error";

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): AsyncState<T> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    status: "loading",
    data: null,
    error: null,
  });

  const load = useCallback(() => {
    let cancelled = false;
    setState((current) => ({
      ...current,
      status: "loading",
      error: null,
    }));

    loader()
      .then((data) => {
        if (!cancelled) {
          setState({ status: "success", data, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            data: null,
            error:
              error instanceof Error
                ? error.message
                : "Something went wrong while loading this view.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    return load();
  }, [load]);

  return {
    ...state,
    retry: () => {
      load();
    },
  };
}
