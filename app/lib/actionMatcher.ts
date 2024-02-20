/**
 * Very big and complicated typescript stuff
 *
 * The idea behind a matcher is to enable an action to accept multiple http methods in a simple and ergonomic way.
 *
 * The usage should be like this:
 *
 * ```
 * // define the type of the arguments that all functions will recieve
 * type Args = { request: Request }
 *
 * // create the matcher, passing the Args type
 * const matcher = createMatcher<Args>()({
 *   POST: postHandler,
 *   DELETE: deleteHandler
 * })
 *
 * // export the extractValue method, for the types
 * export { extractValue: matcher.extractValue }
 * export const action = ({ request }: ActionFunctionArgs) => {
 *   // use the request method to find the appropriate handler and pass the arugments for it
 *   const result = await matcher.match(request.method, { request })
 *
 *   return json(result)
 * }
 *
 *
 * // in the component
 * const actionData = useActionData<typeof action>()
 * // using this helper, the result will be undefined or the return type for this method
 * const actionResult = extractValue(actionData, 'DELETE')
 * ```
 *
 */
export function createMatcher<A>() {
  return function <
    T extends Record<string, (arg: A) => R>,
    R extends Promise<U>,
    U,
  >(matches: T) {
    type MatchResult = {
      method: string
      value: Awaited<ReturnType<T[keyof T]>>
    }

    async function match<K extends keyof T | (string & {})>(
      matching: K,
      args: A,
      defaultFn = () => {
        throw new Error('bad input')
      },
    ): Promise<MatchResult> {
      if (matches[matching] === undefined) {
        defaultFn()
      }

      const value = (await matches[matching](args)) as unknown as Awaited<
        ReturnType<T[K]>
      >
      // assertion as string is needed, probably a bug
      // see: https://stackoverflow.com/questions/63721756/with-t-extending-recordstring-any-keyof-t-does-not-give-string-as-type
      return {
        value,
        method: matching as string,
      }
    }

    function extractValue<K extends keyof T>(
      result: MatchResult | undefined,
      key: K,
    ) {
      if (!result) return

      if (result.method === key) {
        return result.value as Awaited<ReturnType<(typeof matches)[K]>>
      }
    }

    return {
      match,
      extractValue,
    }
  }
}
