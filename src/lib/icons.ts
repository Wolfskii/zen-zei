/**
 * Lucide icon registry for tiles, categories, and the add-sound picker.
 * Keys are stored in Postgres (`sounds.icon`, `categories.icon`).
 */
import {
	AudioLines,
	Bird,
	Bug,
	CloudFog,
	CloudLightning,
	CloudRain,
	Coffee,
	Droplets,
	Fish,
	Flame,
	Headphones,
	Home,
	Leaf,
	Moon,
	Mountain,
	Music,
	Radio,
	Snowflake,
	Sparkles,
	Sun,
	Sunset,
	Tent,
	Trees,
	Volume2,
	Waves,
	Wind
} from '@lucide/svelte'
import type { Component } from 'svelte'

export const SOUND_ICONS = {
	AudioLines,
	Bird,
	Bug,
	CloudFog,
	CloudLightning,
	CloudRain,
	Coffee,
	Droplets,
	Fish,
	Flame,
	Headphones,
	Home,
	Leaf,
	Moon,
	Mountain,
	Music,
	Radio,
	Snowflake,
	Sparkles,
	Sun,
	Sunset,
	Tent,
	Trees,
	Volume2,
	Waves,
	Wind
} satisfies Record<string, Component>

export type SoundIconName = keyof typeof SOUND_ICONS

export const SOUND_ICON_NAMES = Object.keys(SOUND_ICONS) as SoundIconName[]

export function isSoundIconName(value: string | null | undefined): value is SoundIconName {
	return !!value && value in SOUND_ICONS
}
