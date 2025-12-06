// Map keys to static require() calls
export const postersMap: Record<string, any> = {
    brokenImage: require('../assets/brokenFile.png'),
};
  
// Helper function to safely get a local image
export const getLocalImage = (key: string): any => {
    return postersMap[key] || null;
};