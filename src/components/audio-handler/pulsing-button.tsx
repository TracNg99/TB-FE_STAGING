'use client';

import { ActionIcon, ActionIconProps } from '@mantine/core';
import React, { MouseEventHandler } from 'react';

interface PulsingFabProps extends ActionIconProps {
  isPulsing: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const pulseAnimation = `
    @keyframes pulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 10px rgba(0, 26, 255, 0.75);
      }
      50% {
        transform: scale(1.2);
        box-shadow: 0 0 20px rgba(33, 123, 248, 0.77);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 10px rgba(121, 116, 254, 0.75);
      }
    }
  `;

const PulsingFab: React.FC<PulsingFabProps> = ({
  isPulsing,
  children,
  onClick,
  ...props
}) => {
  const animation = isPulsing ? `${pulseAnimation} 1.5s infinite` : 'none';

  return (
    <ActionIcon
      {...props}
      style={{
        backgroundColor: isPulsing ? 'rgba(0, 102, 255, 0.75)' : undefined,
        transition: 'background-color 0.3s ease',
        borderRadius: '50%',
        animation: animation,
        ...props.style,
      }}
      {...onClick}
    >
      {children}
    </ActionIcon>
  );
};

export default PulsingFab;
