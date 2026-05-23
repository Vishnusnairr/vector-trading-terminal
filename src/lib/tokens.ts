/**
 * Vector design tokens
 * Mirror of the Tailwind palette so we can use exact hex values
 * in SVG charts, gradients, and inline styles where utility classes
 * don't reach.
 */

export const tokens = {
  bg:        '#07080b',
  bgPanel:   '#0e1015',
  bgElev:    '#11131a',
  border:    'rgba(255,255,255,0.06)',
  borderHi:  'rgba(255,255,255,0.1)',
  fg:        '#e8ebf2',
  fgDim:     '#8a92a6',
  fgMute:    '#525a6b',
  bull:      '#00e5a8',
  bullDim:   'rgba(0,229,168,0.15)',
  bear:      '#ff5470',
  bearDim:   'rgba(255,84,112,0.15)',
  cyan:      '#00d4ff',
  amber:     '#ffb547',
  violet:    '#9d6bff',
} as const;

export type TokenKey = keyof typeof tokens;
