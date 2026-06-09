# Skill: Style — Animation

> Motion that communicates physics · GPU-safe · Respects user preferences.
> Back to parent: [style](../SKILL.md) · See also: [ux-laws](../ux-laws/SKILL.md)

---

## Trigger

Use this skill when:

- Adding transitions, hover effects, or enter/exit animations
- Choosing animation duration or easing
- Using `keyframes` from `@emotion/react`

---

## The Rule: Easing Reflects Physics

Every element in real life accelerates and decelerates. The easing you pick should match what the element is **doing**.

| Easing | Curve | When to Use | When NOT to Use |
| --- | --- | --- | --- |
| `ease-out` | Fast → Slow | **Entering** (modal open, dropdown show, slide in) | Exiting, spinning |
| `ease-in` | Slow → Fast | **Exiting** (modal close, toast dismiss, slide out) | Entering (feels sluggish) |
| `ease-in-out` | Slow → Fast → Slow | **Moving** between positions (drag, reorder, progress step) | Short <150ms — too subtle |
| `linear` | Constant | **Continuous/looping** (spinner, skeleton shimmer, progress bar) | Enter/exit — feels robotic |
| `ease` *(CSS default)* | Slight ease-in-out | Avoid — not intentional, replace with one of the above | — |

---

## Duration Guidelines

Respect **Doherty Threshold** (< 400ms keeps users in flow):

| Interaction | Duration | Notes |
| --- | --- | --- |
| Hover, focus ring | `100ms` | Too short to ease — use `linear` or `ease-out` |
| Dropdown, tooltip | `150ms ease-out` | Open fast, close with `ease-in` |
| Modal, drawer open | `220ms ease-out` | |
| Modal, drawer close | `180ms ease-in` | Close slightly faster — feels snappy |
| Accordion expand | `200ms ease-in-out` | Height + opacity together |
| Page/route transition | `250ms ease-out` | Fade or slide in |
| Skeleton shimmer | `1400ms linear` | Infinite loop |
| Spinner | `800ms linear` | Infinite loop |

> Never animate beyond 400ms for interactive UI. Users wait for the animation to finish — any longer feels broken.

---

## GPU-Accelerated Properties Only

Animate only these CSS properties — they do NOT trigger layout reflow:

```ts
// Safe to animate
opacity
transform   // translate, scale, rotate
filter      // blur, brightness

// NEVER animate — triggers layout
width, height
margin, padding
top, left  // use transform: translate instead
max-height // only acceptable workaround for accordion — keep <300ms
```

---

## Emotion Keyframe Patterns

```tsx
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { colors } from '@design-system/tokens';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(8px); }
`;

const shimmer = keyframes`
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
`;

const pop = keyframes`
  0%   { transform: scale(1); }
  50%  { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const Card = styled.div`
  animation: ${fadeIn} 220ms ease-out;
`;

const SkeletonBar = styled.div`
  background: linear-gradient(
    90deg,
    ${colors.neutral[100]} 25%,
    ${colors.neutral[50]}  50%,
    ${colors.neutral[100]} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1400ms linear infinite;
  border-radius: 4px;
  height: 16px;
`;
```

---

## Reduced Motion — Always Respect

Add to every component with `animation` or `transition`:

```tsx
const AnimatedEl = styled.div`
  animation: ${fadeIn} 220ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
```

---

## Transition Shorthand Reference

```ts
transition: background 100ms ease-out, box-shadow 100ms ease-out;  // hover
transition: opacity 150ms ease-out;                                  // show/hide overlay
transition: width 220ms ease-in-out;                                 // sidebar collapse
animation: ${fadeIn} 220ms ease-out;                                 // appear from bottom
```

---

## Warning Triggers

```
> Warning: Animating a layout-triggering property (width/height/margin/padding)
> Why: Forces browser to reflow every frame — causes jank on low-end devices
> Fix: Use transform (translate/scale) or opacity instead

> Warning: Animation duration exceeds 400ms on an interactive element
> Why: Violates Doherty Threshold — users wait for the animation before proceeding
> Fix: Keep interactive animations ≤ 300ms

> Warning: Using ease-in for an entering element (or ease-out for an exiting one)
> Why: Feels physically wrong — entering should decelerate, exiting should accelerate
> Fix: Swap the easing function

> Warning: No prefers-reduced-motion check on animated component
> Why: Some users experience motion sickness from animations
> Fix: Add @media (prefers-reduced-motion: reduce) { animation: none }
```

---

## Quick Reference

```
ENTERING element   → ease-out
EXITING element    → ease-in
MOVING element     → ease-in-out
LOOPING animation  → linear

Micro hover        → 100ms
Show/hide UI       → 150–220ms
Page transition    → 250ms
MAX interactive    → 400ms  (Doherty Threshold)

Animate ONLY: opacity · transform · filter
NEVER animate: width · height · margin · padding
```
