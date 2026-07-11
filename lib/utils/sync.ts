export function syncToDb(key: string, data: any) {
  if (typeof window === 'undefined') return
  fetch('/api/admin/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, data }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text()
        console.error(`Failed to sync ${key} to DB: ${res.status} ${res.statusText} - ${text}`)
      } else {
        console.log(`Successfully synced ${key} to DB`)
      }
    })
    .catch((err) => {
      console.error(`Failed to sync ${key} to DB:`, err)
    })
}


