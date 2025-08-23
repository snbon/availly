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
  primary: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600',
  primaryHover: 'hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700',
  secondary: 'bg-gradient-to-r from-slate-100 to-slate-200',
  accent: 'bg-gradient-to-r from-amber-400 to-orange-400',
  success: 'bg-gradient-to-r from-emerald-500 to-green-600',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600',
  background: 'bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-100/50'
};

export const brandShadows = {
  card: 'shadow-lg shadow-purple-100/50',
  cardHover: 'hover:shadow-xl hover:shadow-purple-200/50',
  button: 'shadow-lg shadow-purple-500/25',
  buttonHover: 'hover:shadow-xl hover:shadow-purple-500/40'
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

// Component styles
export const brandComponents = {
  card: `bg-white rounded-2xl border border-slate-200/60 ${brandShadows.card} ${brandShadows.cardHover} transition-all duration-200`,
  button: {
    primary: `${brandGradients.primary} text-white px-6 py-3 rounded-xl font-semibold ${brandShadows.button} ${brandShadows.buttonHover} ${brandAnimations.scaleHover} transition-all duration-200`,
    secondary: `bg-white border-2 border-purple-200 text-purple-700 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 hover:border-purple-300 ${brandAnimations.scaleHover} transition-all duration-200`,
    ghost: `text-slate-600 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-all duration-200`
  },
  input: `w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400`,
  badge: {
    primary: 'bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium',
    success: 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium',
    warning: 'bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium',
    danger: 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium'
  }
};

export const brandLayout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-12',
  grid: {
    stats: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
    cards: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
    full: 'grid grid-cols-1 gap-8'
  }
};
