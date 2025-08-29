# Responsive Design Guide for Availly

## Overview
This document outlines the responsive design system implemented in Availly to ensure optimal user experience across all device sizes, with a mobile-first approach.

## Breakpoints
We use Tailwind CSS breakpoints with custom additions:

- **Default (Mobile)**: 0px - 639px
- **sm**: 640px+
- **md**: 768px+
- **lg**: 1024px+
- **xl**: 1280px+
- **2xl**: 1536px+

## Mobile-First Approach
All styles start with mobile defaults and scale up using responsive prefixes:
- Base classes for mobile
- `sm:` prefix for small screens and up
- `md:` prefix for medium screens and up
- `lg:` prefix for large screens and up

## Responsive Utilities

### Text Sizing
```jsx
// Responsive text classes from theme
${responsive.text.h1}     // text-2xl sm:text-3xl md:text-4xl lg:text-5xl
${responsive.text.h2}     // text-xl sm:text-2xl md:text-3xl lg:text-4xl
${responsive.text.h3}     // text-lg sm:text-xl md:text-2xl lg:text-3xl
${responsive.text.body}   // text-sm sm:text-base md:text-lg
${responsive.text.caption} // text-xs sm:text-sm
```

### Spacing
```jsx
// Responsive spacing classes
${responsive.spacing.xs}  // p-3 sm:p-4 md:p-6 lg:p-8
${responsive.spacing.sm}  // p-4 sm:p-6 md:p-8 lg:p-10
${responsive.spacing.md}  // p-6 sm:p-8 md:p-10 lg:p-12
${responsive.spacing.lg}  // p-8 sm:p-10 md:p-12 lg:p-16
${responsive.spacing.xl}  // p-10 sm:p-12 md:p-16 lg:p-20
```

### Margins
```jsx
// Responsive margin classes
${responsive.margin.section} // mb-6 sm:mb-8 md:mb-10 lg:mb-12
${responsive.margin.element}  // mb-4 sm:mb-6 md:mb-8
${responsive.margin.small}    // mb-2 sm:mb-3 md:mb-4
```

### Container Widths
```jsx
// Responsive container classes
${responsive.width.container} // w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl
${responsive.width.form}      // w-full max-w-xs sm:max-w-sm md:max-w-md
${responsive.width.button}    // w-full sm:w-auto sm:px-8
```

## Component Guidelines

### Logo Component
- **Mobile**: Smaller sizes (w-6 h-6, w-8 h-8)
- **Desktop**: Larger sizes (w-12 h-12, w-20 h-20)
- **Text**: Responsive sizing with mobile-first approach

### Form Elements
- **Input fields**: `py-3 sm:py-4` for responsive padding
- **Icons**: `w-4 h-4 sm:w-5 sm:h-5` for responsive sizing
- **Borders**: `rounded-lg sm:rounded-xl` for responsive border radius

### Buttons
- **Mobile**: Full width with smaller padding
- **Desktop**: Auto width with larger padding
- **Text**: `text-base sm:text-lg` for responsive font sizing

### Cards and Containers
- **Mobile**: Smaller padding and border radius
- **Desktop**: Larger padding and border radius
- **Shadows**: Consistent across breakpoints

## Implementation Examples

### Basic Responsive Component
```jsx
<div className="p-3 sm:p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
    Responsive Title
  </h1>
  <p className="text-sm sm:text-base md:text-lg">
    Responsive body text
  </p>
</div>
```

### Form Input with Icon
```jsx
<div className="relative">
  <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
  <input
    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border rounded-lg sm:rounded-xl"
    placeholder="Enter email"
  />
</div>
```

### Responsive Button
```jsx
<button className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg">
  Submit
</button>
```

## Best Practices

### 1. Always Start with Mobile
- Begin with mobile-first classes
- Add responsive prefixes for larger screens
- Test on actual mobile devices

### 2. Use Consistent Spacing
- Leverage the responsive spacing utilities
- Maintain visual hierarchy across breakpoints
- Avoid hardcoded pixel values

### 3. Optimize Touch Targets
- Minimum 44px height for interactive elements on mobile
- Adequate spacing between clickable elements
- Consider thumb-friendly positioning

### 4. Test Responsive Behavior
- Test on various screen sizes
- Verify text readability on small screens
- Ensure proper spacing and layout on all devices

### 5. Performance Considerations
- Use CSS classes over inline styles
- Leverage Tailwind's utility-first approach
- Minimize custom CSS for responsive behavior

## Common Patterns

### Responsive Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {/* Grid items */}
</div>
```

### Responsive Flexbox
```jsx
<div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
  {/* Flex items */}
</div>
```

### Responsive Text Alignment
```jsx
<div className="text-left sm:text-center lg:text-right">
  {/* Content */}
</div>
```

## Testing Checklist

- [ ] Mobile (320px - 639px)
- [ ] Small tablet (640px - 767px)
- [ ] Large tablet (768px - 1023px)
- [ ] Desktop (1024px+)
- [ ] Touch interactions on mobile
- [ ] Text readability on small screens
- [ ] Proper spacing and layout
- [ ] Performance on mobile devices

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile-First Design Principles](https://www.lukew.com/ff/entry.asp?933)
- [Touch Target Guidelines](https://material.io/design/usability/accessibility.html#layout-typography)
