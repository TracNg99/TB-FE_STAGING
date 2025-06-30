export interface ActivityData {
  date: string;
  cnt_stories: number;
  cnt_photos: number;
}

export interface DailyStats {
  business_id?: string;
  date: string;
  cnt_stories: number;
  cnt_photos: number;
}

export interface DailyActivityChartProps {
  data?: DailyStats[];
}

export interface NumberChartProps {
  title: string;
  value: number;
  gradientColor?: string;
  icon?: React.ReactNode;
  change?: number; // percentage change compared to last week
}

export interface ExperienceStat {
  experience_id: string;
  experience_name?: string;
  business_id?: string;
  cnt_visits: number;
  cnt_stories: number;
  cnt_photos: number;
}

export type TopExperiencesMetricKey =
  | 'cnt_visits'
  | 'cnt_stories'
  | 'cnt_photos';

export type TopExperiencesChartType = 'bar' | 'line' | 'area';

export interface TopExperiencesChartProps {
  data?: ExperienceStat[];
}

export interface TopExperiencesSeriesItem {
  name: TopExperiencesMetricKey;
  type: TopExperiencesChartType;
  color: string;
  label: string;
}

export interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  payload: {
    name: string;
    value: number;
  };
}

export interface CustomLabelLineProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
}

export interface MyPieChartCell {
  name: string;
  value: number;
  color: string;
}

export interface TopExperiencePieChartProps {
  data?: ExperienceStat[];
  numberOfTop: number; // How many top experiences to display before grouping "Others"
}

export interface DailyStatsUniqueUsers {
  business_id?: string;
  date: string;
  unique_visits_users: number;
  unique_stories_users: number;
}

export interface UniqueUsersBarChartProps {
  data?: DailyStatsUniqueUsers[];
}
