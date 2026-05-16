'use client';

import { useCallback, useRef, useState } from 'react';

type Props = {
  audio_base64?: string | null;
  className?: string;
};

function toAudioSrc(audio_base64: string) {
  if (audio_base64.startsWith('data:')) return audio_base64;
  return `data:audio/mpeg;base64,${audio_base64}`;
}

export default function CallAudioListenButton({ audio_base64, className = '' }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!audio_base64) return;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setPlaying(false);
      }

      const audio = new Audio(toAudioSrc(audio_base64));
      audioRef.current = audio;
      audio.onended = () => {
        setPlaying(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setPlaying(false);
        audioRef.current = null;
      };

      setPlaying(true);
      void audio.play().catch(() => {
        setPlaying(false);
        audioRef.current = null;
      });
    },
    [audio_base64],
  );

  if (!audio_base64) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-teal-600 dark:hover:bg-teal-950/40 dark:hover:text-teal-300 ${className}`}
      aria-label={playing ? 'Playing audio' : 'Listen to agent response'}
    >
      <span aria-hidden>{playing ? '⏸' : '▶️'}</span>
      <span>{playing ? 'Playing' : 'Listen'}</span>
    </button>
  );
}
