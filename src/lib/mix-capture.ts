export const MIX_CAPTURE_EVENT = 'zenzei:mix-capture'

export type MixCaptureLayer = {
	id: string
	volume: number
	name: string
}

export type MixCapture = {
	master: number
	layers: MixCaptureLayer[]
}
