export interface OfflineProgress {
  completed: number;
  total: number;
}
export async function prepareOffline(
  onProgress: (progress: OfflineProgress) => void,
): Promise<void> {
  if (!("serviceWorker" in navigator) || !("caches" in window)) {
    throw new Error(
      "Offline preparation is unavailable in this browser. Online play still works.",
    );
  }
  const base = new URL(import.meta.env.BASE_URL, window.location.origin);
  const response = await fetch(new URL("offline-assets.json", base), {
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(
      "The offline package could not be found. Retry while connected.",
    );
  const manifest = (await response.json()) as {
    version: string;
    assets: string[];
  };
  if (
    !manifest.version ||
    !Array.isArray(manifest.assets) ||
    !manifest.assets.length
  )
    throw new Error("The offline package is incomplete.");
  const registration = await navigator.serviceWorker.register(
    new URL("sw.js", base),
    { scope: base.pathname },
  );
  const worker =
    registration.installing || registration.waiting || registration.active;
  if (!worker)
    throw new Error("Offline worker did not start. Retry while connected.");
  if (worker.state !== "activated") {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.removeEventListener("statechange", changed);
        reject(new Error("Offline setup timed out. Retry while connected."));
      }, 30000);
      function changed() {
        if (worker!.state === "activated") {
          clearTimeout(timeout);
          worker!.removeEventListener("statechange", changed);
          resolve();
        } else if (worker!.state === "redundant") {
          clearTimeout(timeout);
          worker!.removeEventListener("statechange", changed);
          reject(new Error("Offline worker was replaced. Retry."));
        }
      }
      worker.addEventListener("statechange", changed);
      changed();
    });
  }
  await new Promise<void>((resolve, reject) => {
    const channel = new MessageChannel();
    let timer: ReturnType<typeof setTimeout>;
    const finish = (error?: Error) => {
      clearTimeout(timer);
      channel.port1.close();
      error ? reject(error) : resolve();
    };
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(
        () =>
          finish(
            new Error(
              "Offline download timed out. Keep this tab open and retry while connected.",
            ),
          ),
        120000,
      );
    };
    channel.port1.onmessage = ({ data }) => {
      resetTimer();
      if (data.type === "progress")
        onProgress({ completed: data.completed, total: data.total });
      else if (data.type === "ready") finish();
      else if (data.type === "error")
        finish(
          new Error(
            data.message || "Offline download failed. Retry while connected.",
          ),
        );
    };
    resetTimer();
    worker.postMessage({ type: "PREPARE_OFFLINE", manifest }, [channel.port2]);
  });
}
