export const sleep = async (seconds: number, debug = false) => {
  if (debug) console.debug(`awaiting sleep ${seconds}s...`);
  return await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};
