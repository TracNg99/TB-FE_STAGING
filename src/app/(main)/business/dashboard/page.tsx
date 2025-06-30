'use client';

import { Container, Text, Title } from '@mantine/core';
import { IconFlag, IconStar, IconUsers } from '@tabler/icons-react';
import React from 'react';

import DailyActivityChart from '@/components/dashboard/DailyActivityChart';
import NumberChart from '@/components/dashboard/NumberChart';
import TopExperiencesChart from '@/components/dashboard/TopExperienceChart';
import TopExperiencePieChart from '@/components/dashboard/TopExperiencePieChart';
import UniqueUsersBarChart from '@/components/dashboard/UniqueUsersBarChart';
import {
  useGetAllStatsByExpQuery,
  useGetDailyStatsQuery,
  useGetDailyStatsUniqueUsersQuery,
  useGetNumExperiencesQuery,
  useGetNumExplorersQuery,
  useGetNumStoriesQuery,
} from '@/store/redux/slices/business/analytics';

const Dashboard: React.FC = () => {
  const { data: dailyStats } = useGetDailyStatsQuery({
    businessId: '96cfafc8-b02e-4fa0-99d6-6550cbf9aaa0',
  });
  const { data: uniqueUsers } = useGetDailyStatsUniqueUsersQuery({
    businessId: '96cfafc8-b02e-4fa0-99d6-6550cbf9aaa0',
  });
  const { data: numExperiences } = useGetNumExperiencesQuery({
    businessId: '96cfafc8-b02e-4fa0-99d6-6550cbf9aaa0',
  });
  const { data: numExplorers } = useGetNumExplorersQuery({
    businessId: '96cfafc8-b02e-4fa0-99d6-6550cbf9aaa0',
  });
  const { data: numStories } = useGetNumStoriesQuery({
    businessId: '96cfafc8-b02e-4fa0-99d6-6550cbf9aaa0',
  });
  const { data: allExperiences } = useGetAllStatsByExpQuery({
    businessId: '96cfafc8-b02e-4fa0-99d6-6550cbf9aaa0',
  });
  return (
    <Container className="py-8">
      <div className="mb-8">
        <Title order={2} className="text-base-black font-semibold">
          Dashboard Overview
        </Title>
        <Text className="text-base-black/70">Your insights at a glance</Text>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <NumberChart
          title="experiences created"
          value={numExperiences?.experience_count || 0}
          // change={1.2} // temporarily disabled the change feature, will implement later
          gradientColor="#f8f8f8"
          icon={<IconFlag size={48} />}
        />
        <NumberChart
          title="explorers visited"
          value={numExplorers?.cnt_visits || 0}
          // change={0} // temporarily disabled the change feature, will implement later
          gradientColor="#f8f8f8"
          icon={<IconUsers size={48} />}
        />
        <NumberChart
          title="stories posted"
          value={numStories?.cnt_stories || 0}
          // change={0} // temporarily disabled the change feature, will implement later
          gradientColor="#f8f8f8"
          icon={<IconStar size={48} />}
        />
      </div>
      <div className="flex gap-2 mb-8">
        <div className="w-[35%] mr-5">
          <TopExperiencePieChart numberOfTop={5} data={allExperiences} />
        </div>
        <div className="w-[65%]">
          <TopExperiencesChart data={allExperiences} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-8">
        <DailyActivityChart data={dailyStats} />
        <UniqueUsersBarChart data={uniqueUsers} />
      </div>
    </Container>
  );
};

export default Dashboard;
