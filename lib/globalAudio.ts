let globalAudio: HTMLAudioElement | null = null;

export function getGlobalAudio(streamUrl: string): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio(streamUrl);
    globalAudio.crossOrigin = "anonymous";
    globalAudio.loop = true;
  } else if (globalAudio.src !== streamUrl) {
    globalAudio.src = streamUrl;
  }

  return globalAudio;
}
