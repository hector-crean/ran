// Asset preloader utility
export const preloadAsset = (
  url: string,
  type: "image" | "video" = "image"
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (type === "image") {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    } else if (type === "video") {
      const video = document.createElement("video");
      video.onloadeddata = () => resolve();
      video.onerror = reject;
      video.preload = "metadata";
      video.src = url;
    }
  });
};

// Preload sequence images
export const preloadSequence = async (
  baseUrl: string,
  frameCount: number,
  format: string,
  priority: "high" | "low" = "low"
) => {
  const promises: Promise<void>[] = [];
  const batchSize = priority === "high" ? 10 : 5;

  // Also collect URLs for service worker preloading
  const sequenceUrls: string[] = [];

  for (let i = 1; i <= frameCount; i += batchSize) {
    const batch = [];
    for (let j = i; j < Math.min(i + batchSize, frameCount + 1); j++) {
      const frameUrl = `${baseUrl}${j.toString().padStart(5, "0")}.${format}`;
      batch.push(preloadAsset(frameUrl, "image"));
      sequenceUrls.push(frameUrl);
    }

    // Wait for each batch before starting the next
    await Promise.allSettled(batch);

    // Add a small delay to avoid overwhelming the browser
    if (priority === "low") {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Send to service worker for background caching
  if (priority === "low") {
    const { preloadAssetsViaServiceWorker } = await import("./service-worker");
    preloadAssetsViaServiceWorker(sequenceUrls);
  }
};
