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

type MatchResult3<
  T extends Record<string, (arg: A) => R>,
  R extends Promise<U>,
  U,
  A,
> = {
  method: string
  value: Awaited<ReturnType<T[keyof T]>>
}

export function createMatcher<A>() {
  return function <
    T extends Record<string, (arg: A) => R>,
    R extends Promise<U>,
    U,
  >(matches: T) {
    async function match<K extends keyof T | (string & {})>(
      matching: K,
      args: A,
      defaultFn = () => {
        throw new Error('bad input')
      },
    ): Promise<MatchResult3<T, R, U, A>> {
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

    return match
  }
}

export function extractValue<
  T extends Record<string, (arg: A) => R>,
  R extends Promise<U>,
  U,
  A,
  K extends keyof T | (string & {}),
>(
  result: MatchResult3<T, R, U, A> | undefined | null,
  key: K,
): Awaited<ReturnType<T[K]>> | undefined {
  if (!result) return

  if (result.method === key) {
    return result.value as Awaited<ReturnType<T[K]>>
  }
}

const matcher = createMatcher<string>()({
  POST: async (arg: string) => 'hello',
  DELETE: async (arg: string) => -69,
  PATCH: async (arg: string) => false as false,
})

const matched = await matcher('PATCH', 'whatever')

if (matched.method === 'DELETE') {
  matched.value
}

const m3 = Math.random() > 0.5 ? undefined : matched

const a = extractValue(m3, 'DELETE')

/* Failed attempt at simplifying the code, but couldn't get it to work
type Matches<R extends Record<string, R[string]>, Args> = {
  [key in keyof R]: (arg: Args) => Promise<R[key]>
}

type Matcher<R extends Record<string, R[string]>, Args> = (
  k: keyof R,
  arg: Args,
) => Promise<Matched<R>>

type Matched<R extends Record<string, R[string]>> = {
  [key in keyof R]: { method: key; value: R[key] }
}[keyof R]

export function createMatcher2<Args>() {
  return <R extends Record<string, R[string]>>(
    matches: Matches<R, Args>,
  ): Matcher<R, Args> => {
    return async (key, args) => ({
      method: key,
      value: await matches[key](args),
    })
  }
}

export function extractValue<K extends string, R extends Record<K, R[K]>>(
  matched: null,
  key: K,
): undefined
export function extractValue<K extends string, R extends Record<K, R[K]>>(
  matched: Matched<R>,
  key: K,
): R[K] | undefined
export function extractValue<K extends string, R extends Record<K, R[K]>>(
  matched: Matched<R> | null,
  key: K,
): R[K] | undefined
export function extractValue<K extends string, R extends Record<K, R[K]>>(
  matched: Matched<R> | null,
  key: K,
): R[K] | undefined {
  if (matched === null) {
    return undefined
  }

  if (matched.method === key) {
    return matched.value as R[typeof key]
  }

  return undefined
}

function shit<
  K extends string,
  R extends Record<K, R[K]>,
  M extends Matched<R>,
>(matched: M | null, key: K): R[K] | undefined {
  if (matched?.method === key) return matched.value
}

const matcher = createMatcher2<string>()({
  DELETE: async (a: string) => 2,
  PUT: async (a: string) => false,
  PATCH: async (a: string) => 'true' as const,
})

const matched = await matcher('DELETE', 'blahblah')

if (matched.method === 'DELETE') {
  matched.value
}

const m = Math.random() > 0.5 ? matched : null

const extracted = extractValue(m, 'DELETE')

*/
