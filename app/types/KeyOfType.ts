export type KeyOfType<T, KType> = {
  [K in keyof T]: T[K] extends KType ? K : never
}[keyof T]
