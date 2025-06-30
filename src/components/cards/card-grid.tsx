import React from 'react';

type CardGridProps = React.PropsWithChildren<{
  className?: string;
}>;

const CardGrid = ({ children, className }: CardGridProps) => {
  return (
    <div
      className={`
        grid grid-cols-2 
        sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 
        gap-4 lg:gap-8 ${className ?? ''}
        max-h-[calc(100vh-200px)]
        overflow-y-auto
      `}
    >
      {children}
    </div>
  );
};

export default CardGrid;
