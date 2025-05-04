
// ✅ 5. AudioVisualizer.tsx
"use client";
import { useEffect, useRef } from "react";
import { useGlobalAudio } from "@/stores/useGlobalAudio";

export default function AudioVisualizer() {
  const { audio } = useGlobalAudio();
  const barsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!audio) return;

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 64;
    const source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);
      barsRef.current.forEach((bar, i) => {
        if (bar) {
          const height = dataArray[i] / 2;
          bar.style.height = `${height}px`;
        }
      });
      requestAnimationFrame(animate);
    };

    animate();
    return () => {
      source.disconnect();
      analyser.disconnect();
    };
  }, [audio]);

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-1 z-0">
      {Array.from({ length: 32 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) barsRef.current[i] = el;
          }}
          className="w-1 bg-primary transition-all duration-100"
          style={{ height: "4px" }}
        />
      ))}
    </div>
  );
}