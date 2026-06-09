import { colors } from '@design-system';
import { PlatformHex } from '../types';
import type { Platform } from '../types';

interface PlatformBadgeProps {
  platform: Platform;
  size?: number;
}

export function PlatformBadge({ platform, size = 24 }: PlatformBadgeProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: PlatformHex[platform],
        color: colors.text.inverse,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.55,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: -0.5,
      }}
      aria-label={platform}
      title={platform}
    >
      {platform[0]}
    </div>
  );
}
