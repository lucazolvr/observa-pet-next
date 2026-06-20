import imageCompression from 'browser-image-compression'

export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.82,
  })
}

export type NsfwResult = { safe: boolean; reason?: string }

export async function checkNsfw(file: File): Promise<NsfwResult> {
  try {
    // Lazy-load TensorFlow.js + nsfwjs to evitar bundle pesado na página principal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [nsfwjsMod, tf]: [any, any] = await Promise.all([
      import('nsfwjs'),
      import('@tensorflow/tfjs'),
    ])
    await tf.ready()
    const model = await nsfwjsMod.load()

    const img = new Image()
    img.src = URL.createObjectURL(file)
    await new Promise<void>((res, rej) => {
      img.onload  = () => res()
      img.onerror = () => rej(new Error('load'))
    })

    const predictions = await model.classify(img)
    URL.revokeObjectURL(img.src)

    const riskCategories = ['Porn', 'Hentai', 'Sexy']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const risk = (predictions as any[])
      .filter((p: any) => riskCategories.includes(p.className))
      .reduce((max: number, p: any) => p.probability > max ? p.probability : max, 0)

    if (risk > 0.65) {
      return { safe: false, reason: 'Conteúdo impróprio detectado (nudez ou conteúdo sensível).' }
    }
    return { safe: true }
  } catch {
    // Falha silenciosa — não bloqueia o upload se o modelo falhar
    return { safe: true }
  }
}
