import React from 'react';
import { brandComponents, brandShadows, brandAnimations } from '../../theme/brand';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'default',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const cardClasses = `
    ${brandComponents.card}
    ${paddingClasses[padding]}
    ${hover ? brandAnimations.scaleHover : ''}
    ${className}
  `.trim();

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
