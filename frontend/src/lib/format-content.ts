/**
 * Procesa formato markdown-like en contenido de noticias.
 * Soporta: **negrita**, __subrayado__, _cursiva_, y - listas.
 *
 * IMPORTANTE: Underline (__) debe procesarse ANTES que italic (_)
 * para evitar que el regex de italic consuma los delimitadores de underline.
 *
 * Retorna un string HTML para usar con dangerouslySetInnerHTML.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function formatNewsContent(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/^- (.*)$/gm, '• $1')
}

/**
 * Elimina marcadores de formato para mostrar texto plano en previews.
 */
export function stripNewsFormatting(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^- /gm, '')
}
