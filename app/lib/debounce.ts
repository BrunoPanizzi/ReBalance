function debounce<T>(func: (...args: T[]) => any, ms: number) {
  let timeout: NodeJS.Timeout

  const debounced = (...args: T[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), ms)
  }

  return debounced
}

export default debounce
