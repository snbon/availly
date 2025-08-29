// Availly Brand Theme
export const brandColors = {
  primary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  brand: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87'
  },
  accent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12'
  }
};

export const brandGradients = {
  primary: 'bg-gradient-to-br from-brand-600 via-indigo-600 to-blue-600',
  primaryHover: 'hover:from-brand-700 hover:via-indigo-700 hover:to-blue-700',
  secondary: 'bg-gradient-to-r from-slate-100 to-slate-200',
  accent: 'bg-gradient-to-r from-accent-400 to-orange-400',
  success: 'bg-gradient-to-r from-emerald-500 to-green-600',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600',
  background: 'bg-gradient-to-br from-slate-50 via-brand-50/30 to-indigo-100/50'
};

export const brandShadows = {
  card: 'shadow-lg shadow-brand-100/50',
  cardHover: 'hover:shadow-xl hover:shadow-brand-200/50',
  button: 'shadow-lg shadow-brand-500/25',
  buttonHover: 'hover:shadow-xl hover:shadow-brand-500/40'
};

export const brandAnimations = {
  scaleHover: 'hover:scale-[1.02] active:scale-[0.98]',
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  pulse: 'animate-pulse'
};

export const brandTypography = {
  heading: 'font-bold tracking-tight',
  subheading: 'font-semibold',
  body: 'font-medium',
  caption: 'font-normal text-sm'
};

// Responsive design utilities
export const responsive = {
  // Mobile-first spacing
  spacing: {
    xs: 'p-3 sm:p-4 md:p-6 lg:p-8',
    sm: 'p-4 sm:p-6 md:p-8 lg:p-10',
    md: 'p-6 sm:p-8 md:p-10 lg:p-12',
    lg: 'p-8 sm:p-10 md:p-12 lg:p-16',
    xl: 'p-10 sm:p-12 md:p-16 lg:p-20'
  },
  // Responsive text sizes
  text: {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
    body: 'text-sm sm:text-base md:text-lg',
    caption: 'text-xs sm:text-sm'
  },
  // Responsive margins
  margin: {
    section: 'mb-6 sm:mb-8 md:mb-10 lg:mb-12',
    element: 'mb-4 sm:mb-6 md:mb-8',
    small: 'mb-2 sm:mb-3 md:mb-4'
  },
  // Responsive widths
  width: {
    container: 'w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl',
    form: 'w-full max-w-xs sm:max-w-sm md:max-w-md',
    button: 'w-full sm:w-auto sm:px-8'
  }
};

// Component styles
export const brandComponents = {
  card: `bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 ${brandShadows.card} ${brandShadows.cardHover} transition-all duration-200`,
  button: {
    primary: `${brandGradients.primary} text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold ${brandShadows.button} ${brandShadows.buttonHover} ${brandAnimations.scaleHover} transition-all duration-200 text-sm sm:text-base`,
    secondary: `bg-white border-2 border-brand-200 text-brand-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-brand-50 hover:border-brand-300 ${brandAnimations.scaleHover} transition-all duration-200 text-sm sm:text-base`,
    ghost: `text-slate-600 hover:text-brand-600 hover:bg-brand-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 text-sm sm:text-base`
  },
  input: `w-full px-3 sm:px-4 py-3 sm:py-4 border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400 text-sm sm:text-base`,
  badge: {
    primary: 'bg-brand-100 text-brand-700 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium',
    success: 'bg-green-100 text-green-700 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium',
    warning: 'bg-amber-100 text-amber-700 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium',
    danger: 'bg-red-100 text-red-700 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium'
  }
};

export const brandLayout = {
  container: 'max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8',
  section: 'py-8 sm:py-12 md:py-16 lg:py-20',
  grid: {
    stats: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
    cards: 'grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8',
    full: 'grid grid-cols-1 gap-6 sm:gap-8'
  }
};
