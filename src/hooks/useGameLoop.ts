import { useRef, useCallback, useEffect, MutableRefObject } from 'react';
import { GameEngine } from '../game/GameEngine';

const FIXED_TIMESTEP = 1000 / 60; // 60 FPS

export function useGameLoop(
  engineRef: MutableRefObject<GameEngine | null>,
  onUpdate: () => void
) {
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  const loop = useCallback((currentTime: number) => {
    if (!engineRef.current) {
      frameRef.current = requestAnimationFrame(loop);
      return;
    }

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = currentTime;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    accumulatorRef.current += deltaTime;

    // 固定时间步长更新
    while (accumulatorRef.current >= FIXED_TIMESTEP) {
      engineRef.current.update(1);
      accumulatorRef.current -= FIXED_TIMESTEP;
    }

    onUpdate();

    frameRef.current = requestAnimationFrame(loop);
  }, [engineRef, onUpdate]);

  const start = useCallback(() => {
    lastTimeRef.current = 0;
    accumulatorRef.current = 0;
    frameRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop };
}
