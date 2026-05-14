import { CLOUD_API_URL, CLOUD_TOKEN } from '../cloudConfig.js'

function cleanUrl(value) {
  return String(value || '').trim()
}

export function isCloudConfigured() {
  const url = cleanUrl(CLOUD_API_URL)

  return Boolean(
    url &&
    !url.includes('COLOCAR_AQUI') &&
    url.startsWith('https://')
  )
}

function apiUrl(action, extraParams = {}) {
  const url = new URL(cleanUrl(CLOUD_API_URL))

  url.searchParams.set('action', action)
  url.searchParams.set('token', CLOUD_TOKEN)

  Object.entries(extraParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return url.toString()
}

async function parseResponse(response) {
  const text = await response.text()

  let payload = null

  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    throw new Error(`Resposta inválida da cloud: ${text.slice(0, 160)}`)
  }

  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `Erro HTTP ${response.status}`)
  }

  return payload
}

function jsonp(action) {
  return new Promise((resolve, reject) => {
    if (!isCloudConfigured()) {
      resolve(null)
      return
    }

    const callbackName = `meudiario_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const script = document.createElement('script')

    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error('Tempo esgotado ao comunicar com a cloud.'))
    }, 15000)

    function cleanup() {
      window.clearTimeout(timeout)
      delete window[callbackName]
      if (script.parentNode) script.parentNode.removeChild(script)
    }

    window[callbackName] = (payload) => {
      cleanup()

      if (payload?.ok === false) {
        reject(new Error(payload.error || 'Erro na cloud.'))
        return
      }

      resolve(payload)
    }

    script.onerror = () => {
      cleanup()
      reject(new Error('Não foi possível carregar dados da cloud.'))
    }

    script.src = apiUrl(action, { callback: callbackName })
    document.body.appendChild(script)
  })
}

function postForm(action, data) {
  return new Promise((resolve) => {
    const iframeName = `meudiario_iframe_${Date.now()}`
    const iframe = document.createElement('iframe')
    iframe.name = iframeName
    iframe.style.display = 'none'

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = cleanUrl(CLOUD_API_URL)
    form.target = iframeName
    form.style.display = 'none'

    const fields = {
      action,
      token: CLOUD_TOKEN,
      payload: JSON.stringify({ action, token: CLOUD_TOKEN, data })
    }

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    })

    document.body.appendChild(iframe)
    document.body.appendChild(form)
    form.submit()

    window.setTimeout(() => {
      if (form.parentNode) form.parentNode.removeChild(form)
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)

      resolve({ ok: true, message: 'Pedido enviado para a cloud.' })
    }, 1800)
  })
}

export async function getAllCloudData() {
  if (!isCloudConfigured()) return null

  try {
    const response = await fetch(apiUrl('getAllData'), {
      method: 'GET',
      redirect: 'follow'
    })

    const payload = await parseResponse(response)
    return payload.data || null
  } catch {
    const payload = await jsonp('getAllData')
    return payload?.data || null
  }
}

export async function saveAllCloudData(data) {
  if (!isCloudConfigured()) return null

  try {
    const response = await fetch(apiUrl('saveAllData'), {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'saveAllData',
        token: CLOUD_TOKEN,
        data
      })
    })

    return parseResponse(response)
  } catch {
    return postForm('saveAllData', data)
  }
}

export async function pingCloud() {
  if (!isCloudConfigured()) {
    return { ok: false, error: 'Cloud não configurada' }
  }

  try {
    const response = await fetch(apiUrl('ping'), {
      method: 'GET',
      redirect: 'follow'
    })

    return parseResponse(response)
  } catch {
    return jsonp('ping')
  }
}
