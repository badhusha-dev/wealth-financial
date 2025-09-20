// Theme Utility System for CIMB Wealth App

export interface ThemeColors {
  primary: string
  primaryDark: string
  primaryLight: string
  burgundy: string
  burgundyLight: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
  shadow: string
}

export interface ThemeGradients {
  primary: string
  primarySoft: string
  glass: string
  glassDark: string
}

export interface ThemeShadows {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  glow: string
  glass: string
}

export interface ThemeSpacing {
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  layout: {
    sidebarWidth: string
    sidebarWidthCollapsed: string
    navbarHeight: string
    fabSize: string
  }
}

export interface ThemeTransitions {
  fast: string
  base: string
  slow: string
  bounce: string
}

export class ThemeUtils {
  // Get current theme colors
  static getColors(): ThemeColors {
    const root = document.documentElement
    const isDark = root.getAttribute('data-theme') === 'dark'
    
    return {
      primary: getComputedStyle(root).getPropertyValue('--cimb-red').trim(),
      primaryDark: getComputedStyle(root).getPropertyValue('--cimb-red-dark').trim(),
      primaryLight: getComputedStyle(root).getPropertyValue('--cimb-red-light').trim(),
      burgundy: getComputedStyle(root).getPropertyValue('--cimb-burgundy').trim(),
      burgundyLight: getComputedStyle(root).getPropertyValue('--cimb-burgundy-light').trim(),
      background: getComputedStyle(root).getPropertyValue('--bs-body-bg').trim(),
      surface: getComputedStyle(root).getPropertyValue('--card-bg').trim(),
      text: getComputedStyle(root).getPropertyValue('--bs-body-color').trim(),
      textMuted: getComputedStyle(root).getPropertyValue('--text-muted').trim(),
      border: getComputedStyle(root).getPropertyValue('--bs-border-color').trim(),
      shadow: getComputedStyle(root).getPropertyValue('--card-shadow').trim(),
    }
  }

  // Get current gradients
  static getGradients(): ThemeGradients {
    const root = document.documentElement
    
    return {
      primary: getComputedStyle(root).getPropertyValue('--gradient-primary').trim(),
      primarySoft: getComputedStyle(root).getPropertyValue('--gradient-primary-soft').trim(),
      glass: getComputedStyle(root).getPropertyValue('--gradient-glass').trim(),
      glassDark: getComputedStyle(root).getPropertyValue('--gradient-glass-dark').trim(),
    }
  }

  // Get current shadows
  static getShadows(): ThemeShadows {
    const root = document.documentElement
    
    return {
      xs: getComputedStyle(root).getPropertyValue('--shadow-xs').trim(),
      sm: getComputedStyle(root).getPropertyValue('--shadow-sm').trim(),
      md: getComputedStyle(root).getPropertyValue('--shadow-md').trim(),
      lg: getComputedStyle(root).getPropertyValue('--shadow-lg').trim(),
      xl: getComputedStyle(root).getPropertyValue('--shadow-xl').trim(),
      '2xl': getComputedStyle(root).getPropertyValue('--shadow-2xl').trim(),
      glow: getComputedStyle(root).getPropertyValue('--shadow-glow').trim(),
      glass: getComputedStyle(root).getPropertyValue('--glass-shadow').trim(),
    }
  }

  // Get spacing and layout values
  static getSpacing(): ThemeSpacing {
    const root = document.documentElement
    
    return {
      borderRadius: {
        sm: getComputedStyle(root).getPropertyValue('--border-radius-sm').trim(),
        md: getComputedStyle(root).getPropertyValue('--border-radius-md').trim(),
        lg: getComputedStyle(root).getPropertyValue('--border-radius-lg').trim(),
        xl: getComputedStyle(root).getPropertyValue('--border-radius-xl').trim(),
        '2xl': getComputedStyle(root).getPropertyValue('--border-radius-2xl').trim(),
      },
      layout: {
        sidebarWidth: getComputedStyle(root).getPropertyValue('--sidebar-width').trim(),
        sidebarWidthCollapsed: getComputedStyle(root).getPropertyValue('--sidebar-width-collapsed').trim(),
        navbarHeight: getComputedStyle(root).getPropertyValue('--navbar-height').trim(),
        fabSize: getComputedStyle(root).getPropertyValue('--fab-size').trim(),
      }
    }
  }

  // Get transition values
  static getTransitions(): ThemeTransitions {
    const root = document.documentElement
    
    return {
      fast: getComputedStyle(root).getPropertyValue('--transition-fast').trim(),
      base: getComputedStyle(root).getPropertyValue('--transition-base').trim(),
      slow: getComputedStyle(root).getPropertyValue('--transition-slow').trim(),
      bounce: getComputedStyle(root).getPropertyValue('--transition-bounce').trim(),
    }
  }

  // Create glassmorphism styles
  static createGlassStyle(intensity: 'light' | 'medium' | 'strong' = 'medium'): string {
    const intensityMap = {
      light: { bg: 'rgba(255, 255, 255, 0.1)', blur: 'blur(10px)', border: 'rgba(255, 255, 255, 0.1)' },
      medium: { bg: 'rgba(255, 255, 255, 0.25)', blur: 'blur(20px)', border: 'rgba(255, 255, 255, 0.18)' },
      strong: { bg: 'rgba(255, 255, 255, 0.4)', blur: 'blur(30px)', border: 'rgba(255, 255, 255, 0.3)' }
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const config = intensityMap[intensity]
    
    if (isDark) {
      return `
        background: rgba(30, 41, 59, ${intensity === 'light' ? '0.2' : intensity === 'medium' ? '0.4' : '0.6'});
        backdrop-filter: ${config.blur};
        -webkit-backdrop-filter: ${config.blur};
        border: 1px solid rgba(148, 163, 184, 0.1);
      `
    }
    
    return `
      background: ${config.bg};
      backdrop-filter: ${config.blur};
      -webkit-backdrop-filter: ${config.blur};
      border: 1px solid ${config.border};
    `
  }

  // Create gradient text style
  static createGradientText(): string {
    return `
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    `
  }

  // Create hover animation styles
  static createHoverAnimation(type: 'lift' | 'scale' | 'glow' | 'bounce' = 'lift'): string {
    switch (type) {
      case 'lift':
        return `
          transition: all var(--transition-base);
          &:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
          }
        `
      case 'scale':
        return `
          transition: all var(--transition-fast);
          &:hover {
            transform: scale(1.05);
          }
        `
      case 'glow':
        return `
          transition: all var(--transition-base);
          &:hover {
            box-shadow: var(--shadow-glow);
          }
        `
      case 'bounce':
        return `
          transition: all var(--transition-bounce);
          &:hover {
            transform: scale(1.1);
          }
        `
      default:
        return ''
    }
  }

  // Animate number counter
  static animateCounter(
    element: HTMLElement,
    start: number,
    end: number,
    duration: number = 2000,
    formatter?: (value: number) => string
  ): void {
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (easeOutCubic)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = start + (end - start) * easeOut
      
      element.textContent = formatter ? formatter(currentValue) : Math.round(currentValue).toString()
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }

  // Format currency for counter animations
  static formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format percentage for counter animations
  static formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`
  }

  // Check if user prefers reduced motion
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Create responsive breakpoint checker
  static createBreakpointChecker() {
    return {
      isMobile: () => window.innerWidth <= 768,
      isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
      isDesktop: () => window.innerWidth > 1024,
    }
  }

  // Generate random particle positions for background effects
  static generateParticles(count: number = 50): Array<{ x: number; y: number; size: number; delay: number }> {
    const particles = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        delay: Math.random() * 3,
      })
    }
    return particles
  }
}

// Export theme utility as default
export default ThemeUtils