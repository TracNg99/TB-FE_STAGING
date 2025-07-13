'use client';

import React from 'react';

interface IconHandlerProps {
  className?: string;
  IconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

const IconHandler: React.FC<IconHandlerProps> = ({
  className,
  IconComponent,
}: IconHandlerProps) => {
  return <IconComponent className={className} />;
};

export default IconHandler;
