import client from './client'

export interface FormatInfo {
  name: string
  extension: string
  description: string
}

export interface FormatsResponse {
  image: FormatInfo[]
  audio: FormatInfo[]
  video: FormatInfo[]
}

export interface LabelResultData {
  success: boolean
  message: string
  outputPath: string
}

export interface AigcLabelFields {
  label?: string
  contentProducer: string
  produceId: string
  reservedCode1?: string
  contentPropagator?: string
  propagateId?: string
  reservedCode2?: string
  producerDate?: string
}

export async function writeMetadata(
  file: File,
  label: AigcLabelFields
): Promise<LabelResultData> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('label', label.label || '1')
  formData.append('contentProducer', label.contentProducer)
  formData.append('produceId', label.produceId)
  if (label.reservedCode1) formData.append('reservedCode1', label.reservedCode1)
  if (label.contentPropagator) formData.append('contentPropagator', label.contentPropagator)
  if (label.propagateId) formData.append('propagateId', label.propagateId)
  if (label.reservedCode2) formData.append('reservedCode2', label.reservedCode2)
  if (label.producerDate) formData.append('producerDate', label.producerDate)
  const res = await client.post('/label/metadata', formData)
  return res.data
}

export async function addWatermark(
  file: File,
  options: Record<string, any>
): Promise<LabelResultData> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('text', options.text || 'AI生成')
  formData.append('position', options.position || 'BOTTOM_RIGHT')
  formData.append('fontSizeRatio', String(options.fontSizeRatio || 0.05))
  formData.append('opacity', String(options.opacity || 0.5))
  formData.append('videoStartDuration', String(options.videoStartDuration || 2.0))
  formData.append('audioPromptType', options.audioPromptType || 'MORSE_CODE')
  formData.append('audioPromptPosition', options.audioPromptPosition || 'START')
  const res = await client.post('/label/watermark', formData)
  return res.data
}

export async function labelAll(
  file: File,
  label: AigcLabelFields,
  options: Record<string, any>
): Promise<LabelResultData> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('label', label.label || '1')
  formData.append('contentProducer', label.contentProducer)
  formData.append('produceId', label.produceId)
  if (label.reservedCode1) formData.append('reservedCode1', label.reservedCode1)
  if (label.contentPropagator) formData.append('contentPropagator', label.contentPropagator)
  if (label.propagateId) formData.append('propagateId', label.propagateId)
  if (label.reservedCode2) formData.append('reservedCode2', label.reservedCode2)
  if (label.producerDate) formData.append('producerDate', label.producerDate)
  formData.append('text', options.text || 'AI生成')
  formData.append('position', options.position || 'BOTTOM_RIGHT')
  formData.append('fontSizeRatio', String(options.fontSizeRatio || 0.05))
  formData.append('opacity', String(options.opacity || 0.5))
  formData.append('videoStartDuration', String(options.videoStartDuration || 2.0))
  formData.append('audioPromptType', options.audioPromptType || 'MORSE_CODE')
  formData.append('audioPromptPosition', options.audioPromptPosition || 'START')
  const res = await client.post('/label/all', formData)
  return res.data
}

export async function getFormats(): Promise<FormatsResponse> {
  const res = await client.get('/formats')
  return res.data
}

export function getDownloadUrl(path: string): string {
  return `/api/label/download?path=${encodeURIComponent(path)}`
}
