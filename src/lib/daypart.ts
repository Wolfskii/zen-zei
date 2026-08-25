export type DayTone = 'morning' | 'afternoon' | 'evening' | 'night'

export type Daypart = {
	hello: string
	line: string
	suggest: 'focus' | 'cabin' | 'sleep' | null
	tone: DayTone
}

/** Greeting + a scene to hint, from local hour. */
export function daypart(date: Date = new Date()): Daypart {
	const hour = date.getHours()
	if (hour >= 5 && hour < 12) {
		return { hello: 'Good morning', line: 'Keep the first layer thin. Add only what you need.', suggest: 'focus', tone: 'morning' }
	}
	if (hour >= 12 && hour < 17) {
		return { hello: 'Good afternoon', line: 'Leave a window open in the mix.', suggest: null, tone: 'afternoon' }
	}
	if (hour >= 17 && hour < 21) {
		return { hello: 'Good evening', line: 'Warmth first, weather underneath.', suggest: 'cabin', tone: 'evening' }
	}
	return { hello: 'Good night', line: 'Let the low sounds sit closer than the rest.', suggest: 'sleep', tone: 'night' }
}
