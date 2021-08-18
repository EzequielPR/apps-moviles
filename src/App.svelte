<script>
	import Navbar from './components/Navbar.svelte';
	import Votacion from './components/Votacion.svelte';

	import Swal from 'sweetalert2';

	import { usuario, votaciones } from './js/store';
	import firebase, { auth, database } from './js/firebase-module';

	$: votacionesActivas = Object.entries($votaciones).filter(([id, v]) => v.activa);
	$: votacionesDetenidas = Object.entries($votaciones).filter(([id, v]) => !v.activa);

	async function nuevaVotacion() {
		Swal.fire({
			title: 'Pregunta de la votación',
			input: 'text',
			inputAttributes: { autocapitalize: 'on' },
			showCancelButton: true,
			confirmButtonText: 'Agregar',
			showLoaderOnConfirm: true,
			preConfirm: (pregunta) => {
				database.ref(`votaciones/`).push({
					'pregunta': pregunta,
					'a_favor': 0,
					'neutral': 0,
					'en_contra': 0,
					'abierta': true,
					'anonima': true,
					'activa': false,
				});
			},
		}).then((result) => {
			if (result.isConfirmed) {
				Swal.fire({ title: `Votación "${result.value}" agregada` })
			}
		});
	}
</script>



<Navbar />
<main class="container mt-5 mb-5">
	{#if $usuario}
		<div class="d-flex justify-content-between align-items-center">
			<h1 class="d-inline">Votaciones activas: {votacionesActivas.length}</h1>
			{#if $usuario?.roles['admin']}
				<button class="btn btn-primary" on:click={nuevaVotacion}>Nueva Votación</button>
			{/if}
		</div>

		<ul id="votaciones-list" class="list-group mt-2">
			{#each [...votacionesActivas].reverse() as [id, votacion] (id)}
				<li class="list-group-item">
					<Votacion {id} {votacion} />
				</li>
			{/each}
		</ul>
		<br><br><hr><br>

		{#if $usuario?.roles['admin']}
			<div class="d-flex justify-content-between align-items-center">
				<h1>Votaciones detenidas: {votacionesDetenidas.length}</h1>
				<button class="btn btn-danger"
					hidden={!votacionesDetenidas.length}
					on:click={nuevaVotacion}>
					Borrar Todas
				</button>
			</div>

			<ul id="votaciones-list" class="list-group mt-2">
				{#each [...votacionesDetenidas].reverse() as [id, votacion] (id)}
					<li class="list-group-item">
						<Votacion {id} {votacion} />
					</li>
				{/each}
			</ul>
		{/if}

	{:else}
		<h1 class="text-center">Accede con tu cuenta de Google para ver y participar en las votaciones</h1>

	{/if}
</main>



<style></style>
