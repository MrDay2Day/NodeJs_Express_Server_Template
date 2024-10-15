/**
 * A helper function to handle errors in asynchronous code without the need for try-catch blocks.
 * It wraps a promise and returns a tuple where the first element is an error (if any) and the second is the resolved data.
 *
 * @template T - The type of the promise result.
 *
 * @param {Promise<T>} promise - The promise to handle errors for.
 * @returns {Promise<[undefined, T] | [Error | unknown]>} A promise that resolves to a tuple:
 *  - On success: `[undefined, T]` where `T` is the resolved value of the passed promise.
 *  - On error: `[Error | unknown]` where the first element is the caught error.
 */
export default async function catchError<T>(
  promise: Promise<T>
): Promise<[undefined, T] | [Error | unknown]> {
  try {
    const data = await promise;
    return [undefined, data] as [undefined, T];
  } catch (error: Error | unknown) {
    return [error];
  }
}
