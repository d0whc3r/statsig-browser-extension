;(function () {
  try {
    const el = document.querySelector('#__statsig_action_args')
    if (!el) {
      return null
    }

    const args = JSON.parse(el.textContent || '{}')
    const { op, key, value } = args

    if (op === 'getLocalStorage') {
      return localStorage.getItem(key)
    }

    if (op === 'setLocalStorage') {
      localStorage.setItem(key, value)
      return null
    }

    if (op === 'removeLocalStorage') {
      localStorage.removeItem(key)
      return null
    }

    if (op === 'getCookie') {
      const nameEQ = key + '='
      const ca = document.cookie.split(';')
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') {
          c = c.slice(1, c.length)
        }
        if (c.indexOf(nameEQ) === 0) {
          return c.slice(nameEQ.length, c.length)
        }
      }
      return null
    }

    if (op === 'setCookie') {
      document.cookie = `${key}=${value};path=/;max-age=31536000`
      return null
    }

    if (op === 'removeCookie') {
      document.cookie = `${key}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
      return null
    }

    return null
  } catch (error) {
    console.error('Statsig Extension: Error in storage helper', error)
    return null
  }
})()
