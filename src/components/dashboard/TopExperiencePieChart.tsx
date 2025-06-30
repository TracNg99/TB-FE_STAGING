'use client';

import { PieChart } from '@mantine/charts';
import { Select, Title } from '@mantine/core';
import React, { useMemo, useState } from 'react';

import {
  CustomLabelLineProps,
  CustomizedLabelProps,
  MyPieChartCell,
  TopExperiencePieChartProps,
  TopExperiencesMetricKey,
} from '@/types/dashboard';

import { mockData } from './TopExperienceChart';

const pieChartDefaultColors = [
  '#569EE3',
  '#96CEFE',
  '#6487FB',
  '#9674F8',
  '#C4AFFD',
  '#FECD32',
];

const TopExperiencePieChart: React.FC<TopExperiencePieChartProps> = ({
  data = mockData,
  numberOfTop,
}) => {
  // State for the selected metric (default is "cnt_visits")
  const [selectedMetric, setSelectedMetric] =
    useState<TopExperiencesMetricKey>('cnt_visits');

  // Prepare pie chart data as an array of cells matching Mantine's PieChartCell type
  const pieChartData: MyPieChartCell[] = useMemo(() => {
    // Sort experiences in descending order by the selected metric
    const sortedData = [...data].sort(
      (a, b) => b[selectedMetric] - a[selectedMetric],
    );
    const topItems = sortedData.slice(0, numberOfTop);
    const otherItems = sortedData.slice(numberOfTop);

    // Map top experiences to PieChartCell objects using "name"
    const cells: MyPieChartCell[] = topItems.map((item, index) => ({
      name: item.experience_name || '',
      value: item[selectedMetric],
      color: pieChartDefaultColors[index % pieChartDefaultColors.length],
    }));

    // If there are additional experiences, group them into "Others"
    if (otherItems.length > 0) {
      const othersTotal = otherItems.reduce(
        (sum, item) => sum + item[selectedMetric],
        0,
      );
      cells.push({
        name: 'Others',
        value: othersTotal,
        color:
          pieChartDefaultColors[topItems.length % pieChartDefaultColors.length],
      });
    }

    return cells;
  }, [data, numberOfTop, selectedMetric]);

  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    payload,
  }: CustomizedLabelProps) => {
    const RADIAN = Math.PI / 180;

    // Position for the value inside the slice.
    const valueRadius = innerRadius + (outerRadius - innerRadius) / 2;
    const valueX = cx + valueRadius * Math.cos(-midAngle * RADIAN);
    const valueY = cy + valueRadius * Math.sin(-midAngle * RADIAN);

    // Position for the name outside the slice.
    const nameRadius = outerRadius + 15;
    const nameX = cx + nameRadius * Math.cos(-midAngle * RADIAN);
    const nameY = cy + nameRadius * Math.sin(-midAngle * RADIAN);

    // Truncate the label if it's too long
    let labelText = payload.name;
    if (labelText.length > 50) {
      labelText = labelText.slice(0, 50) + '...';
    }

    // Determine distance from horizontal (3 o'clock or 9 o'clock)
    const diffRight = Math.min(midAngle, 360 - midAngle); // distance from 0°/360°
    const diffLeft = Math.abs(midAngle - 180); // distance from 180°
    const diff = Math.min(diffRight, diffLeft);

    // Determine how many lines to use based on the angle:
    // <30° => 3 lines, <60° => 2 lines, else 1 line.
    let linesCount = 1;
    if (diff < 30) {
      linesCount = 3;
    } else if (diff < 60) {
      linesCount = 2;
    }

    // Split the label into words.
    const words = labelText.split(' ');
    let lines: string[] = [];

    if (linesCount === 1) {
      lines = [labelText];
    } else if (linesCount === 2) {
      const midPoint = Math.ceil(words.length / 2);
      lines = [
        words.slice(0, midPoint).join(' '),
        words.slice(midPoint).join(' '),
      ];
    } else if (linesCount === 3) {
      const partSize = Math.ceil(words.length / 3);
      lines = [
        words.slice(0, partSize).join(' '),
        words.slice(partSize, 2 * partSize).join(' '),
        words.slice(2 * partSize).join(' '),
      ];
    }

    return (
      <g>
        {/* Value inside the slice */}
        <text
          x={valueX}
          y={valueY}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight="bold"
        >
          {payload.value}
        </text>
        {/* Name outside the slice */}
        <text
          x={nameX}
          y={nameY}
          fill="#333"
          textAnchor={nameX > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={8}
        >
          {lines.map((line, index) => (
            <tspan key={index} x={nameX} dy={index === 0 ? 0 : 12}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  const renderCustomLabelLine = ({
    cx,
    cy,
    midAngle,
    outerRadius,
  }: CustomLabelLineProps) => {
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    // Starting point at the outer edge of the slice
    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;
    // A middle point with a small offset from the outer edge
    const mx = cx + (outerRadius + 10) * cos;
    const my = cy + (outerRadius + 10) * sin;

    return (
      <polyline stroke="#333" fill="none" points={`${sx},${sy} ${mx},${my}`} />
    );
  };

  return (
    <div>
      <Title order={4} mb="sm">
        Top {numberOfTop} Experiences -{' '}
        {selectedMetric === 'cnt_visits' ? 'Visitors' : 'Stories'}
      </Title>
      <Select
        label="Select Metric"
        data={[
          { value: 'cnt_visits', label: 'Visitors' },
          { value: 'cnt_stories', label: 'Stories' },
        ]}
        value={selectedMetric}
        onChange={(value) =>
          value && setSelectedMetric(value as TopExperiencesMetricKey)
        }
      />
      <PieChart
        data={pieChartData}
        h={300}
        w={300}
        withTooltip
        tooltipDataSource="segment"
        pieProps={{
          label: renderCustomizedLabel,
          labelLine: renderCustomLabelLine,
        }}
      />
    </div>
  );
};

export default TopExperiencePieChart;
