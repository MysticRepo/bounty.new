/**
 * Design system tokens to reduce styling duplication
 * Consolidates 148+ instances of repeated className patterns
 */

export const colors = {
  // Background colors
  bg: {
    primary: 'bg-[#111110]',
    secondary: 'bg-[#191919]',
    tertiary: 'bg-[#1D1D1D]',
    card: 'bg-[#222222]',
    neutral: 'bg-neutral-900',
    overlay: 'bg-neutral-900/90',
  },
  
  // Border colors
  border: {
    primary: 'border-[#383838]/20',
    secondary: 'border-neutral-800',
    tertiary: 'border-neutral-700',
    accent: 'border-neutral-600',
  },
  
  // Text colors
  text: {
    primary: 'text-white',
    secondary: 'text-neutral-200',
    tertiary: 'text-neutral-300',
    muted: 'text-neutral-400',
    disabled: 'text-neutral-500',
    accent: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
  },
  
  // Interactive states
  interactive: {
    hover: 'hover:bg-neutral-700/40',
    active: 'active:scale-[.98]',
    focus: 'focus:ring-1 focus:ring-neutral-700',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  },
} as const;

export const spacing = {
  // Padding
  p: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
    xl: 'p-6',
  },
  
  // Margin
  m: {
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-3',
    lg: 'm-4',
    xl: 'm-6',
  },
  
  // Gap
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
  },
} as const;

export const typography = {
  // Font sizes
  text: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '4xl': 'text-4xl',
  },
  
  // Font weights
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
  
  // Line heights
  leading: {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
  },
} as const;

export const layout = {
  // Flexbox
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    row: 'flex flex-row',
  },
  
  // Grid
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-2',
    cols3: 'grid-cols-3',
    cols4: 'grid-cols-4',
  },
  
  // Positioning
  position: {
    sticky: 'sticky top-0',
    fixed: 'fixed',
    absolute: 'absolute',
    relative: 'relative',
  },
} as const;

export const effects = {
  // Transitions
  transition: {
    all: 'transition-all duration-200',
    colors: 'transition-colors duration-150',
    transform: 'transition-transform duration-150',
  },
  
  // Animations
  animation: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
  },
  
  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
} as const;

/**
 * Common component class combinations
 */
export const componentClasses = {
  // Card components
  card: `${colors.bg.card} ${colors.border.secondary} rounded-lg border`,
  cardHover: `${colors.bg.card} ${colors.border.secondary} rounded-lg border ${colors.interactive.hover} ${effects.transition.all}`,
  
  // Button components
  button: {
    primary: `rounded-md border ${colors.border.tertiary} ${colors.bg.neutral} px-2 py-1 ${colors.text.tertiary} ${colors.interactive.hover}`,
    secondary: `rounded-md border ${colors.border.secondary} ${colors.bg.neutral}/40 px-2 py-1 ${colors.text.tertiary} ${colors.interactive.hover}`,
    icon: `rounded-md border ${colors.border.tertiary} ${colors.bg.neutral}/40 p-1 ${colors.text.tertiary} ${colors.interactive.hover}`,
  },
  
  // Input components
  input: `w-full rounded-md border ${colors.border.secondary} ${colors.bg.neutral} p-3 ${colors.text.secondary} ${typography.text.sm} resize-none placeholder:${colors.text.muted} focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700 ${colors.interactive.disabled} ${effects.transition.colors}`,
  
  // Badge components
  badge: {
    default: `px-2 py-1 rounded-md ${colors.text.accent} ${colors.bg.neutral}/10 border border-green-500/20 ${typography.text.xs} ${typography.weight.medium}`,
    secondary: `px-2 py-1 rounded-md ${colors.text.tertiary} ${colors.bg.neutral}/20 border ${colors.border.secondary} ${typography.text.xs} ${typography.weight.medium}`,
  },
  
  // Avatar components
  avatar: `h-10 w-10 rounded-full`,
  avatarSmall: `h-6 w-6 rounded-full`,
  
  // Loading states
  skeleton: `animate-pulse rounded ${colors.bg.neutral}`,
  loading: `${colors.bg.neutral}/30 animate-pulse rounded-md border ${colors.border.secondary} p-3`,
} as const;

/**
 * Responsive design tokens
 */
export const responsive = {
  // Breakpoints
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
  
  // Common responsive patterns
  grid: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3',
  },
  
  flex: {
    mobile: 'flex-col',
    desktop: 'lg:flex-row',
  },
  
  text: {
    mobile: 'text-sm',
    desktop: 'lg:text-base',
  },
} as const;

/**
 * Utility function to combine classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Create variant-based class combinations
 */
export function createVariants<T extends string>(
  base: string,
  variants: Record<T, string>
) {
  return (variant: T) => cn(base, variants[variant]);
}