<script lang="ts">
	const src = `${import.meta.env.BASE_URL}videos/rain.mp4`
</script>

<div class="atmosphere" aria-hidden="true">
	<video autoplay muted loop playsinline poster="">
		<source {src} type="video/mp4" />
	</video>
	<div class="fog"></div>
	<div class="grain"></div>
</div>

<style>
	.atmosphere {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
	}

	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(0.7) brightness(0.55);
	}

	.fog {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 20% 10%, rgba(157, 204, 176, 0.12), transparent 40%),
			linear-gradient(180deg, rgba(7, 16, 22, 0.35), rgba(7, 16, 22, 0.72));
	}

	.grain {
		position: absolute;
		inset: 0;
		opacity: 0.18;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
	}
</style>
