CREATE TABLE IF NOT EXISTS categories (
	id uuid PRIMARY KEY,
	slug text NOT NULL UNIQUE,
	name text NOT NULL,
	icon text NOT NULL,
	sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sounds (
	id uuid PRIMARY KEY,
	kind text NOT NULL,
	name text NOT NULL,
	description text NOT NULL DEFAULT '',
	category_id uuid NOT NULL REFERENCES categories (id),
	youtube_url text,
	youtube_video_id text,
	audio_path text,
	cover_path text,
	icon text,
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes (
	sound_id uuid NOT NULL REFERENCES sounds (id) ON DELETE CASCADE,
	voter_id text NOT NULL,
	stars integer NOT NULL,
	updated_at timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY (sound_id, voter_id),
	CONSTRAINT votes_stars_range CHECK (stars >= 1 AND stars <= 5)
);

CREATE INDEX IF NOT EXISTS votes_sound_id_idx ON votes (sound_id);
CREATE INDEX IF NOT EXISTS sounds_category_id_idx ON sounds (category_id);
CREATE INDEX IF NOT EXISTS sounds_created_at_idx ON sounds (created_at DESC);
