import { Text, Title } from '@mantine/core';
import React from 'react';

import { NumberChartProps } from '@/types/dashboard';

const NumberChart: React.FC<NumberChartProps> = ({
  title,
  value,
  gradientColor = 'linear-gradient(to right, #f39c12, #f1c40f)',
  icon,
  change,
}) => {
  const showChange = typeof change === 'number';
  const changeColor = change !== undefined && change < 0 ? 'red' : 'green';

  return (
    <div
      style={{ background: gradientColor }}
      className="shadow-xs rounded-lg p-4"
    >
      <div className="flex justify-between items-center">
        <div>
          {/* Flex container aligns the main value and the change block at the bottom */}
          <div className="flex items-end gap-4">
            <Title order={1} className="whitespace-nowrap">
              {value.toLocaleString()}
            </Title>
            {showChange && (
              // Adjust the negative top offset to fine-tune the alignment with the Title's top
              <div
                className="grid grid-rows-2 text-left relative"
                style={{ top: '-10px' }}
              >
                <Text size="xs" color="dimmed" className="leading-none">
                  Last week
                </Text>
                <Text
                  size="xs"
                  color={changeColor}
                  fw={600}
                  className="leading-none"
                  mt={1}
                >
                  {`${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                </Text>
              </div>
            )}
          </div>
          <Text>{title}</Text>
        </div>
        {icon && <div>{icon}</div>}
      </div>
    </div>
  );
};

export default NumberChart;
