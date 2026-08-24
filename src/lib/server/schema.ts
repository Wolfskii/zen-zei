import { integer, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
	id: uuid('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	icon: text('icon').notNull(),
	sortOrder: integer('sort_order').notNull().default(0)
})

export const sounds = pgTable('sounds', {
	id: uuid('id').primaryKey(),
	kind: text('kind').notNull(),
	name: text('name').notNull(),
	description: text('description').notNull().default(''),
	categoryId: uuid('category_id')
		.notNull()
		.references(() => categories.id),
	youtubeUrl: text('youtube_url'),
	youtubeVideoId: text('youtube_video_id'),
	audioPath: text('audio_path'),
	coverPath: text('cover_path'),
	icon: text('icon'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const votes = pgTable(
	'votes',
	{
		soundId: uuid('sound_id')
			.notNull()
			.references(() => sounds.id, { onDelete: 'cascade' }),
		voterId: text('voter_id').notNull(),
		stars: integer('stars').notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [primaryKey({ columns: [table.soundId, table.voterId] })]
)
