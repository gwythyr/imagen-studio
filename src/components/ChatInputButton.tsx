import { useMemo, useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';

type ButtonVariant = 'send' | 'record' | 'image' | 'ai';
type ButtonStateKey = 'default' | 'active' | 'busy';

interface ButtonState {
  background: string;
  hover: string;
  shadow: string;
  hoverShadow: string;
  text?: string;
}

type ButtonPalette = {
  default: ButtonState;
  active?: ButtonState;
  busy?: ButtonState;
};

const disabledBackground = 'rgba(0,0,0,0.1)';
const disabledText = 'rgba(0,0,0,0.4)';

const createState = (
  background: string,
  hover: string,
  shadow: string,
  hoverShadow: string,
  text = '#ffffff'
): ButtonState => ({
  background,
  hover,
  shadow,
  hoverShadow,
  text
});

const buttonPalettes: Record<ButtonVariant, ButtonPalette> = {
  send: { default: createState('#2563eb', '#1d4ed8', '0 2px 8px rgba(37,99,235,0.3)', '0 4px 12px rgba(37,99,235,0.4)') },
  record: {
    default: createState('#64748b', '#475569', '0 2px 8px rgba(100,116,139,0.3)', '0 4px 12px rgba(100,116,139,0.4)'),
    active: createState('#ef4444', '#dc2626', '0 2px 8px rgba(239,68,68,0.3)', '0 4px 12px rgba(239,68,68,0.4)')
  },
  image: { default: createState('#10b981', '#059669', '0 2px 8px rgba(16,185,129,0.3)', '0 4px 12px rgba(16,185,129,0.4)') },
  ai: {
    default: createState('#6366f1', '#4f46e5', '0 2px 8px rgba(99,102,241,0.3)', '0 4px 12px rgba(99,102,241,0.4)'),
    busy: createState('#f59e0b', '#d97706', '0 2px 8px rgba(245,158,11,0.3)', '0 4px 12px rgba(245,158,11,0.4)')
  }
};

const baseButtonStyle: CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 500,
  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
  transform: 'scale(1)'
};

interface ChatInputButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  variant: ButtonVariant;
  active?: boolean;
  busy?: boolean;
  fontSize?: string;
}

export function ChatInputButton({
  icon,
  label,
  onClick,
  disabled,
  variant,
  active,
  busy,
  fontSize = '18px'
}: ChatInputButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const palette = buttonPalettes[variant];

  const paletteKey: ButtonStateKey = busy
    ? 'busy'
    : active
      ? 'active'
      : 'default';

  const paletteState = palette[paletteKey] ?? palette.default;

  const style = useMemo<CSSProperties>(() => {
    if (disabled) {
      return {
        ...baseButtonStyle,
        backgroundColor: disabledBackground,
        color: disabledText,
        cursor: 'not-allowed',
        boxShadow: 'none',
        fontSize
      };
    }

    const backgroundColor = isHovered
      ? paletteState.hover
      : paletteState.background;

    const boxShadow = isHovered
      ? paletteState.hoverShadow
      : paletteState.shadow;

    const transform = isPressed ? 'scale(0.95)' : isHovered ? 'scale(1.05)' : 'scale(1)';

    return {
      ...baseButtonStyle,
      backgroundColor,
      color: paletteState.text ?? '#ffffff',
      cursor: 'pointer',
      boxShadow,
      transform,
      fontSize
    };
  }, [disabled, isHovered, isPressed, paletteState, fontSize]);

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {icon}
    </button>
  );
}
