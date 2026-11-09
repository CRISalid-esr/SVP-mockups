import { QuantizerCelebi, Score, hexFromArgb } from '@/app/theme/brand'

/**
 * Couleurs dominantes d'un logo, lues dans le navigateur (rien n'est envoyé).
 * L'image est réduite à 128 px, puis Material regroupe ses pixels et classe
 * les couleurs selon leur aptitude à servir de couleur principale.
 */
export async function colorsFromImage(file: File, count = 4): Promise<string[]> {
  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Image illisible'))
      img.src = url
    })
    const scale = Math.min(1, 128 / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const context = canvas.getContext('2d')
    if (!context) return []
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)

    const pixels: number[] = []
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 255) continue // fond transparent
      pixels.push(((255 << 24) | (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]) >>> 0)
    }
    if (pixels.length === 0) return []
    const quantized = QuantizerCelebi.quantize(pixels, 128)
    return Score.score(quantized, { desired: count, filter: true, fallbackColorARGB: 0xff006a61 }).map((argb) => hexFromArgb(argb))
  } finally {
    URL.revokeObjectURL(url)
  }
}
