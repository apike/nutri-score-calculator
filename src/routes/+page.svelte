<script lang="ts">
</script>

<div class="hero bg-base-200 min-h-screen">
	<div class="hero-content">
		<div class="max-w-md">
			<h1 class="mb-8 text-center text-5xl font-bold">Nutri-Score</h1>
			<div class="mb-8 flex justify-center gap-4">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-md text-2xl font-bold"
					style="background-color: #038141; color: white"
				>
					A
				</div>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-md text-2xl font-bold"
					style="background-color: #85BB2F; color: white"
				>
					B
				</div>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-md text-2xl font-bold"
					style="background-color: #FECB02; color: black"
				>
					C
				</div>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-md text-2xl font-bold"
					style="background-color: #EE8100; color: white"
				>
					D
				</div>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-md text-2xl font-bold"
					style="background-color: #E63E11; color: white"
				>
					E
				</div>
			</div>

			<h2 class="text-2xl font-bold">Introduction</h2>
			<p class="py-6">
				The Nutri-Score is a packaging label first adopted by France, and recommended by other EU
				countries and the WHO.
			</p>
			<p>
				The idea is that you can compare to packaged foods (for example, boxes of cereal) and get a
				rough sense of which ones are less unhealthy.
			</p>
			<h2 class="mt-8 text-2xl font-bold">The Calculator</h2>
			<div class="py-6">
				We don't have labelling like this yet in the US or Canada, so here is a quick calculator for
				snack foods.
				<ul class="list-disc pl-5">
					<li>Some cereals and snack bars are pre-loaded.</li>
					<li>
						The formula is based on the
						<a
							href="https://www.aesan.gob.es/AECOSAN/docs/documentos/Nutri_Score/2022_main_algorithm_report_update_FINAL.pdf"
							class="text-primary hover:underline">2022 Nutri-Score algorithm</a
						>.
					</li>
					<li>If you add a food, it will be stored in your browser.</li>
				</ul>
			</div>
			<div class="text-right">
				<a href="/calculator" class="btn btn-primary"> Open Calculator </a>
			</div>
		</div>
	</div>
</div>

<footer class="fixed bottom-0 w-full pb-2 text-center">
	<p class="text-sm">
		Made with ❤️ by <a href="https://allenpike.com/" class="text-primary hover:underline"
			>Allen Pike</a
		>.
		<a href="https://github.com/apike/nutri-score-calculator" class="text-primary hover:underline"
			>Forkable on GitHub</a
		>.
	</p>
</footer>
