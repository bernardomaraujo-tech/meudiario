import { CLOUD_API_URL, CLOUD_TOKEN } from '../cloudConfig.js'

function cleanUrl(value) {
  return String(value || '').trim()
}

export function isCloudConfigured() {
  const url = cleanUrl(CLOUD_API_URL)
  return Boolean(url && !url.includes('COLOCAR_AQUI') && url.startsWith('https://'))
}

function apiUrl(action) {
  const url = new URL(cleanUrl(CLOUD_API_URL))
  url.searchParams.set('action', action)
  url.searchParams.set('token', CLOUD_TOKEN)
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

export async function getAllCloudData() {
  if (!isCloudConfigured()) return null

  const response = await fetch(apiUrl('getAllData'), {
    method: 'GET',
    redirect: 'follow'
  })

  const payload = await parseResponse(response)

  return payload.data || null
}

export async function saveAllCloudData(data) {
  if (!isCloudConfigured()) return null

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
}

export async function pingCloud() {
  if (!isCloudConfigured()) {
    return {
      ok: false,
      error: 'Cloud não configurada'
    }
  }

  const response = await fetch(apiUrl('ping'), {
    method: 'GET',
    redirect: 'follow'
  })

  return parseResponse(response)
}
