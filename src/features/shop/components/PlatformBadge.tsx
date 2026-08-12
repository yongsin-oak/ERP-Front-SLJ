import { PlatformHex } from '../types';
import type { Platform } from '../types';
import { PlatformIcon, hasPlatformIcon } from './PlatformIcon';

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
        color: 'var(--white)',
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
      {hasPlatformIcon(platform) ? <PlatformIcon platform={platform} size={size * 0.62} /> : platform[0]}
    </div>
  );
}
