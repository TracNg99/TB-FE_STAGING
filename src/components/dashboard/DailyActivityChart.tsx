import { LineChart } from '@mantine/charts';
import { Card, Title } from '@mantine/core';
import React from 'react';

import { DailyActivityChartProps, DailyStats } from '@/types/dashboard';

// Sample data for initial rendering / testing
const sampleData: DailyStats[] = [
  { date: '2025-03-12', cnt_stories: 5, cnt_photos: 8 },
  { date: '2025-03-13', cnt_stories: 3, cnt_photos: 6 },
  { date: '2025-03-14', cnt_stories: 7, cnt_photos: 9 },
  { date: '2025-03-15', cnt_stories: 4, cnt_photos: 5 },
  { date: '2025-03-16', cnt_stories: 6, cnt_photos: 7 },
  { date: '2025-03-17', cnt_stories: 6, cnt_photos: 7 },
  { date: '2025-03-18', cnt_stories: 6, cnt_photos: 7 },
];

const DailyActivityChart: React.FC<DailyActivityChartProps> = ({ data }) => {
  // Use provided data or fallback to sample data
  const chartData = data || sampleData;

  return (
    <Card padding="lg">
      <Title order={4} mb="md">
        Daily Stories and Photos
      </Title>
      <LineChart
        h={300}
        data={chartData}
        dataKey="date"
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
        series={[
          { name: 'cnt_stories', color: 'violet.4', label: 'Stories' },
          { name: 'cnt_photos', color: 'yellow', label: 'Photos' },
        ]}
        curveType="linear"
        xAxisProps={{
          tickMargin: 15,
          orientation: 'bottom',
          angle: -30,
          style: { fontSize: '0.6rem' },
        }}
      />
    </Card>
  );
};

export default DailyActivityChart;
