// Map keys to static require() calls
export const postersMap: Record<string, any> = {
    interstellar: require('../assets/posters/interstellar.png'),
    // inception: require('../assets/posters/inception.png'),
    // darkknight: require('../assets/posters/darkknight.png'),
};
  
// Helper function to safely get a local image
export const getLocalImage = (key: string): any => {
    return postersMap[key] || null;
};