# Skill: Style — Animation

> Motion that communicates physics · GPU-safe · Respects user preferences.
> Back to parent: [style](../SKILL.md) · See also: [ux-laws](../ux-laws/SKILL.md)

---

## Trigger

Use this skill when:

- Adding transitions, hover effects, or enter/exit animations
- Choosing animation duration or easing
- Adding Tailwind animation utilities or CSS keyframes in `src/index.css`

## Atlassian + Tailwind contract

- อ้าง motion, accessibility และ reduced-motion guidance จาก [Atlassian foundations](https://atlassian.design/foundations)
- ใช้ Tailwind transition/animation utilities และ keyframes กลางใน `src/index.css` เท่านั้น ห้าม Emotion/CSS-in-JS

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

## Tailwind Keyframe Patterns

```tsx
<div className="animate-in fade-in slide-in-from-bottom-2 duration-(--duration-base) motion-reduce:animate-none" />
<div className="animate-pulse rounded-sm bg-surface-200 motion-reduce:animate-none" />
```

---

## Reduced Motion — Always Respect

Add to every component with `animation` or `transition`:

```tsx
<div className="transition-transform duration-(--duration-base) motion-reduce:transition-none" />
```

---

## Transition Shorthand Reference

```ts
transition-colors duration-(--duration-fast) ease-out
transition-opacity duration-(--duration-base) ease-out
transition-transform duration-(--duration-base) ease-in-out
animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none
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
