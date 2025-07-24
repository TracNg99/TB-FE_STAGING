// Your API slices
import { configureStore } from '@reduxjs/toolkit';

import { BuddyAgentApi, streamBuddyApi } from './slices/agents/buddy';
import { SearchAgentApi } from './slices/agents/search';
import { ttsApi } from './slices/agents/text-to-speech';
import { ActivityBusinessApi } from './slices/business/activity';
import { BusinessAnalyticsApi } from './slices/business/analytics';
import { AttractionBusinessApi } from './slices/business/attraction';
import { BusinessAuthApi } from './slices/business/auth';
import { ChallengeApi } from './slices/business/challenge';
import { DestinationBusinessApi } from './slices/business/destination';
import { ExperienceBusinessApi } from './slices/business/experience';
import { LocationBusinessApi } from './slices/business/location';
import { BusinessProfileApi } from './slices/business/profile';
import {
  MultipartApi,
  StorageApi,
  StorageCloudRunApi,
} from './slices/storage/upload';
import { ActivityUserApi } from './slices/user/activity';
import { UserAuthApi } from './slices/user/auth';
import { JoinChallengeApi } from './slices/user/challenge';
import { ChannelApi } from './slices/user/channel';
import { DestinationApi } from './slices/user/destination';
import { ExperienceApi } from './slices/user/experience';
import { LocationUserApi } from './slices/user/location';
import { UserProfileApi } from './slices/user/profile';
import { StoryApi, streamStoryApi } from './slices/user/story';
import StoryAgentApi from './slices/user/storyAgent';

export const store = configureStore({
  reducer: {
    [UserAuthApi.reducerPath]: UserAuthApi.reducer,
    [UserProfileApi.reducerPath]: UserProfileApi.reducer,
    [BusinessAuthApi.reducerPath]: BusinessAuthApi.reducer,
    [BusinessProfileApi.reducerPath]: BusinessProfileApi.reducer,
    [JoinChallengeApi.reducerPath]: JoinChallengeApi.reducer,
    [ChallengeApi.reducerPath]: ChallengeApi.reducer,
    [StorageApi.reducerPath]: StorageApi.reducer,
    [MultipartApi.reducerPath]: MultipartApi.reducer,
    [StoryApi.reducerPath]: StoryApi.reducer,
    [StoryAgentApi.reducerPath]: StoryAgentApi.reducer,
    [DestinationApi.reducerPath]: DestinationApi.reducer,
    [ChannelApi.reducerPath]: ChannelApi.reducer,
    [DestinationBusinessApi.reducerPath]: DestinationBusinessApi.reducer,
    [SearchAgentApi.reducerPath]: SearchAgentApi.reducer,
    [AttractionBusinessApi.reducerPath]: AttractionBusinessApi.reducer,
    [ExperienceBusinessApi.reducerPath]: ExperienceBusinessApi.reducer,
    [ExperienceApi.reducerPath]: ExperienceApi.reducer,
    [LocationBusinessApi.reducerPath]: LocationBusinessApi.reducer,
    [LocationUserApi.reducerPath]: LocationUserApi.reducer,
    [ActivityBusinessApi.reducerPath]: ActivityBusinessApi.reducer,
    [ActivityUserApi.reducerPath]: ActivityUserApi.reducer,
    [BusinessAnalyticsApi.reducerPath]: BusinessAnalyticsApi.reducer,
    [BuddyAgentApi.reducerPath]: BuddyAgentApi.reducer,
    [streamBuddyApi.reducerPath]: streamBuddyApi.reducer,
    [StorageCloudRunApi.reducerPath]: StorageCloudRunApi.reducer,
    [streamStoryApi.reducerPath]: streamStoryApi.reducer,
    [ttsApi.reducerPath]: ttsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(UserAuthApi.middleware)
      .concat(UserProfileApi.middleware)
      .concat(BusinessAuthApi.middleware)
      .concat(BusinessProfileApi.middleware)
      .concat(BusinessProfileApi.middleware)
      .concat(JoinChallengeApi.middleware)
      .concat(ChallengeApi.middleware)
      .concat(StorageApi.middleware)
      .concat(StoryApi.middleware)
      .concat(StoryAgentApi.middleware)
      .concat(DestinationApi.middleware)
      .concat(ChannelApi.middleware)
      .concat(DestinationBusinessApi.middleware)
      .concat(SearchAgentApi.middleware)
      .concat(AttractionBusinessApi.middleware)
      .concat(ExperienceBusinessApi.middleware)
      .concat(ExperienceApi.middleware)
      .concat(LocationBusinessApi.middleware)
      .concat(LocationUserApi.middleware)
      .concat(ActivityBusinessApi.middleware)
      .concat(ActivityUserApi.middleware)
      .concat(BusinessAnalyticsApi.middleware)
      .concat(MultipartApi.middleware)
      .concat(BuddyAgentApi.middleware)
      .concat(streamBuddyApi.middleware)
      .concat(StorageCloudRunApi.middleware)
      .concat(streamStoryApi.middleware)
      .concat(ttsApi.middleware),
});
