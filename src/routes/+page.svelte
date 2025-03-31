<script lang="ts">
</script>

<div class="hero bg-base-200 min-h-screen">
	<div class="hero-content">
		<div class="max-w-md">
			<h1 class="mt-16 mb-8 text-center text-4xl font-bold">Nutri-Score Calculator</h1>
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
			<div class="mt-4 text-right">
				<a href="/calculator" class="btn btn-primary"> Open Calculator </a>
			</div>

			<h2 class="mt-8 text-2xl font-bold">FAQ</h2>
			<div class="py-6">
				<p class="mb-2 font-bold">Where does the formula come from?</p>
				<p class="mb-2">
					The
					<a
						href="https://www.aesan.gob.es/AECOSAN/docs/documentos/Nutri_Score/2022_main_algorithm_report_update_FINAL.pdf"
						class="text-primary hover:underline">2022 Nutri-Score algorithm</a
					>.
				</p>
				<p class="mt-6 mb-2 font-bold">Who made this?</p>
				<p class="mb-2">
					I'm a programmer named <a
						href="https://allenpike.com/"
						class="text-primary hover:underline">Allen Pike</a
					>. It's
					<a
						href="https://github.com/apike/nutri-score-calculator"
						class="text-primary hover:underline">open source</a
					>, so you can contribute or file an issue.
				</p>
				<p class="mt-6 mb-2 font-bold">Why do some foods get a good number but still a C grade?</p>
				<p class="mb-2">
					The 2022 algorithm prevents manufacturers from stuffing sugary or calorie-dense foods with
					protein in order to get an "A" grade. Over a certain density threshold – which almost all
					snack bars exceed – the letter grade ignores protein content.
				</p>
				<p class="mb-2">
					IMO this penalty should be more gradual – there are two SimplyProtein bars that get an A
					and a C just because one barely meets the threshold and the other doesn't. An opportunity
					for a future algorithm improvement.
				</p>
				<p class="mt-6 mb-2 font-bold">Why does it say it's just for snacks?</p>
				<p class="mb-2">
					There are variants on the Nutri-Score algorithm for beverages and other food types, so I
					started with snacks. If there's interest I could expand this.
				</p>
			</div>
		</div>
	</div>
</div>
