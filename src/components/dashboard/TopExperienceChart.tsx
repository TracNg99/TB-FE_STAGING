'use client';

import { CompositeChart } from '@mantine/charts';
import { Title } from '@mantine/core';
import React from 'react';

import {
  ExperienceStat,
  TopExperiencesChartProps,
  TopExperiencesChartType,
  TopExperiencesMetricKey,
  TopExperiencesSeriesItem,
} from '@/types/dashboard';

// Generate some mock data
export const mockData: ExperienceStat[] = [
  {
    experience_id: 'Saigon After Dark',
    cnt_visits: 150,
    cnt_stories: 10,
    cnt_photos: 30,
  },
  {
    experience_id: 'Insider Saigon',
    cnt_visits: 200,
    cnt_stories: 15,
    cnt_photos: 20,
  },
  {
    experience_id: 'Lovesick',
    cnt_visits: 80,
    cnt_stories: 12,
    cnt_photos: 25,
  },
  {
    experience_id: 'Starstruck',
    cnt_visits: 160,
    cnt_stories: 20,
    cnt_photos: 35,
  },
  {
    experience_id: 'Love In The City',
    cnt_visits: 90,
    cnt_stories: 5,
    cnt_photos: 10,
  },
  {
    experience_id: 'Rainy Metro',
    cnt_visits: 130,
    cnt_stories: 10,
    cnt_photos: 30,
  },
  {
    experience_id: 'Sunshine in HCM',
    cnt_visits: 180,
    cnt_stories: 14,
    cnt_photos: 28,
  },
  {
    experience_id: 'Dance All Night',
    cnt_visits: 100,
    cnt_stories: 9,
    cnt_photos: 22,
  },
  {
    experience_id: 'Foodie Haven',
    cnt_visits: 220,
    cnt_stories: 2,
    cnt_photos: 40,
  },
  {
    experience_id: 'Lalaland',
    cnt_visits: 110,
    cnt_stories: 7,
    cnt_photos: 18,
  },
];

const TopExperiencesChart: React.FC<TopExperiencesChartProps> = ({
  data = mockData,
}) => {
  // Create the mapping object with full typing
  const mapMetric: Record<TopExperiencesMetricKey, TopExperiencesChartType> = {
    cnt_visits: 'line',
    cnt_stories: 'bar',
    cnt_photos: 'bar',
  };

  // Create the mapping object with full typing
  const mapMetricColor: Record<TopExperiencesMetricKey, string> = {
    cnt_visits: '#FFB07C',
    cnt_stories: 'violet.4',
    cnt_photos: 'yellow',
  };

  // Create the mapping object with full typing
  const mapMetricLabel: Record<TopExperiencesMetricKey, string> = {
    cnt_visits: 'Visitors',
    cnt_stories: 'Stories',
    cnt_photos: 'Photos',
  };

  // Define metrics array with correct typing
  const metrics: TopExperiencesMetricKey[] = [
    // 'cnt_visits',
    'cnt_stories',
    'cnt_photos',
  ];

  // Properly typed and constructed series array
  const series: TopExperiencesSeriesItem[] = [];

  for (const metric of metrics) {
    series.push({
      name: metric,
      type: mapMetric[metric],
      // color: `${mapMetricColor[metric]}.${idx + 3}`,
      color: mapMetricColor[metric],
      label: mapMetricLabel[metric],
    });
  }

  return (
    <div>
      <Title order={4} mb="sm">
        All Experiences
      </Title>
      <CompositeChart
        data={data}
        dataKey="experience_name" // The key to use for labels on the y-axis
        series={series}
        h={350}
        withLegend
        legendProps={{
          verticalAlign: 'top',
          layout: 'horizontal',
          wrapperStyle: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            justifyContent: 'right',
          },
        }}
        xAxisProps={{
          tickMargin: 15,
          orientation: 'bottom',
          angle: 0,
          style: { fontSize: '0.5rem' },
          interval: 0,
          tick: ({ x, y, payload }) => {
            const words = String(payload.value).split(' ');
            const groups = [];
            for (let i = 0; i < words.length; i += 2) {
              // Combine the current word with the next if it exists
              groups.push(words[i] + (words[i + 1] ? ` ${words[i + 1]}` : ''));
            }
            return (
              <g transform={`translate(${x},${y + 10})`}>
                <text textAnchor="middle" fill="#666" fontSize="0.5rem">
                  {groups.map((group, index) => (
                    <tspan key={index} x={0} dy={index === 0 ? 0 : 12}>
                      {group}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          },
        }}
      />
    </div>
  );
};

export default TopExperiencesChart;
