// Utility hỗ trợ resolve đường dẫn tài nguyên tĩnh (video, audio, ảnh, json)
// tự động thích ứng với cả Localhost (/) lẫn GitHub Pages (/sachpopup-buudiensaigon-nckh/)
export function resolvePath(p) {
  if (!p) return ''
  if (
    p.startsWith('http://') ||
    p.startsWith('https://') ||
    p.startsWith('data:') ||
    p.startsWith('blob:')
  ) {
    return p
  }
  const clean = p.startsWith('/') ? p.slice(1) : p
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`
}
