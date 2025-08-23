import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const EmptyState = ({ icon: Icon, title, description, buttonText, onButtonClick }) => {
  return (
    <Card padding="lg">
      <div className="bg-slate-50 rounded-xl p-8 text-center">
        <Icon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-slate-700 mb-2">{title}</h4>
        <p className="text-slate-500 mb-4">{description}</p>
        {buttonText && onButtonClick && (
          <Button onClick={onButtonClick}>
            {buttonText}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default EmptyState;
