import client from './client'

export interface DetectResultData {
  mediaFormat: string
  mediaType: string
  hasImplicitLabel: boolean
  hasExplicitLabel: boolean
  isCompliant: boolean
  missingFields: string[]
  report: string
  aigcLabel?: {
    label: string
    contentProducer: string
    produceId: string
    reservedCode1?: string
    contentPropagator?: string
    propagateId?: string
    reservedCode2?: string
    producerDate?: string
    extension: Record<string, unknown>
    complete: boolean
    completeForPropagation: boolean
  }
}

export async function detect(file: File): Promise<DetectResultData> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await client.post('/detect', formData)
  return res.data
}
