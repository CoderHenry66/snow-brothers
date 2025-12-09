import { useEffect, useCallback, useRef } from 'react';
import { InputState } from '../types/game';

interface KeyBindings {
  left: string[];
  right: string[];
  up: string[];
  down: string[];
  jump: string[];
  attack: string[];
}

// 玩家1: WASD + J(跳跃) + K(攻击)
const PLAYER1_BINDINGS: KeyBindings = {
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  jump: ['KeyJ', 'Space'],
  attack: ['KeyK', 'KeyL']
};

// 玩家2: 方向键 + .(跳跃) + ,(攻击) 或 小键盘
const PLAYER2_BINDINGS: KeyBindings = {
  left: ['Numpad4'],
  right: ['Numpad6'],
  up: ['Numpad8'],
  down: ['Numpad5', 'Numpad2'],
  jump: ['Numpad0', 'Period'],
  attack: ['NumpadDecimal', 'Comma']
};

export function useInput(
  playerNumber: 1 | 2,
  onInputChange: (input: InputState) => void,
  enabled: boolean = true
) {
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false
  });

  const bindings = playerNumber === 1 ? PLAYER1_BINDINGS : PLAYER2_BINDINGS;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    let changed = false;
    const code = e.code;

    if (bindings.left.includes(code)) {
      if (!inputRef.current.left) {
        inputRef.current.left = true;
        changed = true;
      }
    }
    if (bindings.right.includes(code)) {
      if (!inputRef.current.right) {
        inputRef.current.right = true;
        changed = true;
      }
    }
    if (bindings.up.includes(code)) {
      if (!inputRef.current.up) {
        inputRef.current.up = true;
        changed = true;
      }
    }
    if (bindings.down.includes(code)) {
      if (!inputRef.current.down) {
        inputRef.current.down = true;
        changed = true;
      }
    }
    if (bindings.jump.includes(code)) {
      if (!inputRef.current.jump) {
        inputRef.current.jump = true;
        changed = true;
      }
      e.preventDefault();
    }
    if (bindings.attack.includes(code)) {
      if (!inputRef.current.attack) {
        inputRef.current.attack = true;
        changed = true;
      }
    }

    if (changed) {
      onInputChange({ ...inputRef.current });
    }
  }, [bindings, onInputChange, enabled]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    let changed = false;
    const code = e.code;

    if (bindings.left.includes(code)) {
      if (inputRef.current.left) {
        inputRef.current.left = false;
        changed = true;
      }
    }
    if (bindings.right.includes(code)) {
      if (inputRef.current.right) {
        inputRef.current.right = false;
        changed = true;
      }
    }
    if (bindings.up.includes(code)) {
      if (inputRef.current.up) {
        inputRef.current.up = false;
        changed = true;
      }
    }
    if (bindings.down.includes(code)) {
      if (inputRef.current.down) {
        inputRef.current.down = false;
        changed = true;
      }
    }
    if (bindings.jump.includes(code)) {
      if (inputRef.current.jump) {
        inputRef.current.jump = false;
        changed = true;
      }
    }
    if (bindings.attack.includes(code)) {
      if (inputRef.current.attack) {
        inputRef.current.attack = false;
        changed = true;
      }
    }

    if (changed) {
      onInputChange({ ...inputRef.current });
    }
  }, [bindings, onInputChange, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const resetInput = useCallback(() => {
    inputRef.current = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      attack: false
    };
    onInputChange({ ...inputRef.current });
  }, [onInputChange]);

  return { resetInput };
}

// 用于处理暂停等全局按键
export function useGlobalKeys(
  onPause: () => void,
  onRestart: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onPause();
      }
      if (e.code === 'Enter') {
        onRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPause, onRestart]);
}
