// lib/audio.ts

let globalAudioRef: HTMLAudioElement | null = null;
let currentUrl: string | null = null;

export function getGlobalAudioRef(): HTMLAudioElement | null {
  return globalAudioRef;
}

export function setGlobalAudioRef(audio: HTMLAudioElement, streamUrl: string) {
  globalAudioRef = audio;
  currentUrl = streamUrl;
}

export function ensureGlobalAudio(streamUrl: string): HTMLAudioElement {
  if (!globalAudioRef) {
    globalAudioRef = new Audio(streamUrl);
    globalAudioRef.loop = true;
    setGlobalAudioRef(globalAudioRef, streamUrl);
  } else if (currentUrl !== streamUrl) {
    globalAudioRef.src = streamUrl;
    currentUrl = streamUrl;
  }
  return globalAudioRef;
}
