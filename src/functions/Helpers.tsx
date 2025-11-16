export const generateTripId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
  // Example: "l5k8m9pqx7z9k2m5p"
};
