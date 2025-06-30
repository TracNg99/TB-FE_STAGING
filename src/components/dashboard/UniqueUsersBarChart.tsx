import { LineChart } from '@mantine/charts';
import { Card, Title } from '@mantine/core';
import React from 'react';

import {
  DailyStatsUniqueUsers,
  UniqueUsersBarChartProps,
} from '@/types/dashboard';

// Sample data for testing and initial rendering
export const sampleData: DailyStatsUniqueUsers[] = [
  { date: '2025-03-12', unique_visits_users: 10, unique_stories_users: 5 },
  { date: '2025-03-13', unique_visits_users: 12, unique_stories_users: 5 },
  { date: '2025-03-14', unique_visits_users: 15, unique_stories_users: 6 },
  { date: '2025-03-15', unique_visits_users: 18, unique_stories_users: 8 },
  { date: '2025-03-16', unique_visits_users: 20, unique_stories_users: 9 },
  { date: '2025-03-17', unique_visits_users: 24, unique_stories_users: 13 },
  { date: '2025-03-18', unique_visits_users: 30, unique_stories_users: 13 },
];

const UniqueUsersBarChart: React.FC<UniqueUsersBarChartProps> = ({ data }) => {
  const chartData = data || sampleData;

  return (
    <Card padding="lg">
      <Title order={4} mb="md">
        Unique Users Posting Stories
      </Title>
      <LineChart
        h={300}
        data={chartData}
        dataKey="date"
        series={[
          { name: 'unique_visits_users', color: 'violet.4', label: 'Visited' },
          { name: 'unique_stories_users', color: 'blue.4', label: 'Posted' },
        ]}
        curveType="linear"
        tickLine="y"
        withLegend
        dotProps={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
        activeDotProps={{ r: 8, strokeWidth: 1, fill: '#fff' }}
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

export default UniqueUsersBarChart;
