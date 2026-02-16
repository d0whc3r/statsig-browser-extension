;(function storageHelper() {
  const handlers = {
    getCookie: (key) => {
      const nameEQ = `${key}=`
      const ca = document.cookie.split(';')
      for (const element of ca) {
        const cookie = element.trimStart()
        if (cookie.startsWith(nameEQ)) {
          return cookie.slice(nameEQ.length)
        }
      }
      return null
    },
    getLocalStorage: (key) => localStorage.getItem(key),
    removeCookie: (key) => {
      document.cookie = `${key}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
      return null
    },
    removeLocalStorage: (key) => {
      localStorage.removeItem(key)
      return null
    },
    setCookie: (key, value) => {
      document.cookie = `${key}=${value};path=/;max-age=31536000`
      return null
    },
    setLocalStorage: (key, value) => {
      localStorage.setItem(key, value)
      return null
    },
  }

  function execute() {
    try {
      const el = document.querySelector('#__statsig_action_args')
      if (!el) {
        return null
      }

      const { op, key, value } = JSON.parse(el.textContent || '{}')

      if (handlers[op]) {
        return handlers[op](key, value)
      }

      return null
    } catch (error) {
      console.error('Statsig Extension: Error in storage helper', error)
      return null
    }
  }

  return execute()
})()
