export function checkJSONToArray(a: string) {
  try {
    const x = JSON.parse(a);
    if (Array.isArray(x)) {
      return x;
    } else {
      throw false;
    }
  } catch (error) {
    return [];
  }
}
/**
 *
 * @param {number} min Minimum number
 * @param {number} max Maximum number
 * @returns {number} A random number between
 */
export function getRandomNumber(min: number, max: number): number {
  const value = Math.random() * (max - min) + min;
  return parseInt(value.toFixed(0));
}
