export const setLocalStorageValue = (localStorageKey: string, localStorageValue: string): void => {
  localStorage.setItem(localStorageKey, localStorageValue)
  document.location.reload()
}

export const deleteLocalStorageValue = (localStorageKey: string): void => {
  localStorage.removeItem(localStorageKey)
  document.location.reload()
}

export const getLocalStorageValue = (localStorageKey: string): string | null =>
  localStorage.getItem(localStorageKey)

export const setCookieValue = (cookieKey: string, cookieValue: string): void => {
  document.cookie = `${cookieKey}=${cookieValue}; path=/; max-age=31536000`
  document.location.reload()
}

export const deleteCookieValue = (cookieKey: string): void => {
  document.cookie = `${cookieKey}=; path=/; max-age=0`
  document.location.reload()
}

export const getCookieValue = (cookieKey: string): string => {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')
    if (key === cookieKey) {
      return value || ''
    }
  }
  return ''
}
