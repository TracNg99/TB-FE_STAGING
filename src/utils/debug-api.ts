// Utility to debug API responses and ensure proper data structure
export const debugApiResponse = (response: any, endpoint: string) => {
  console.log(`🔍 Debugging ${endpoint}:`, {
    response,
    hasData: !!response?.data,
    dataType: typeof response?.data,
    isArray: Array.isArray(response?.data),
    keys: response ? Object.keys(response) : [],
    dataKeys: response?.data ? Object.keys(response.data) : [],
  });

  return response;
};

// Utility to safely extract story data from API response
export const extractStoryData = (response: any): any => {
  if (!response) return null;

  // Handle different response structures
  if (response.data) {
    // If response has a data property, use it
    return response.data;
  } else if (Array.isArray(response)) {
    // If response is directly an array
    return response;
  } else if (typeof response === 'object') {
    // If response is directly an object
    return response;
  }

  return null;
};

// Utility to validate story data structure
export const validateStoryData = (story: any): boolean => {
  if (!story) return false;

  // Check for required fields
  const hasId = !!story.id;
  const hasContent = !!(story.story_content || story.notes);
  const hasTitle = !!(story.seo_title_tag || story.experiences?.name);

  console.log('📋 Story validation:', {
    hasId,
    hasContent,
    hasTitle,
    storyKeys: Object.keys(story),
    contentLength: story.story_content?.length || story.notes?.length || 0,
  });

  return hasId && (hasContent || hasTitle);
};
