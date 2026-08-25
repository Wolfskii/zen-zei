export { mixNameFromLayers, resolveSavedMix, type SavedMix } from '$lib/shelf'
import { addMix, loadShelf, persistShelf, removeMix, type SavedMix } from '$lib/shelf'

export function loadSavedMixes(): SavedMix[] {
	return loadShelf().mixes
}

export function persistSavedMixes(mixes: SavedMix[]): void {
	persistShelf({ ...loadShelf(), mixes })
}

export function addSavedMix(mix: Omit<SavedMix, 'id' | 'savedAt'> & { id?: string }): SavedMix[] {
	return addMix(mix).mixes
}

export function removeSavedMix(id: string): SavedMix[] {
	return removeMix(id).mixes
}
