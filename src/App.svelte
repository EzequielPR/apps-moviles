<script>
	import Navbar from './components/Navbar.svelte';
	import Votacion from './components/Votacion.svelte';

	import Swal from 'sweetalert2';

	import { usuario, votaciones } from './js/store';
	import firebase, { auth, database } from './js/firebase-module';

	$: votacionesActivas = Object.entries($votaciones).filter(([id, v]) => v.activa);
	$: votacionesDetenidas = Object.entries($votaciones).filter(([id, v]) => !v.activa);

	$: console.log(votacionesActivas, votacionesDetenidas);

	async function nuevaVotacion() {
		Swal.fire({
			title: 'Nueva votación',
			showCancelButton: true,
			confirmButtonText: 'Agregar',
			cancelButtonText: 'Cancelar',
			html: `<div class="d-grid">
				<input type="text" class="form-control mb-2" placeholder="pregunta" id="pregunta">
				<div class="form-check mb-2">
					<input class="form-check-input" type="checkbox" id="anonima">
					<label class="form-check-label" for="flexCheckDefault">
						Votantes anonimos?
					</label>
				</div>
				<div class="form-check mb-2">
					<input class="form-check-input" type="checkbox" id="activa">
					<label class="form-check-label" for="flexCheckDefault">
						Votación activa?
					</label>
				</div>
				<div class="form-check mb-2">
					<input class="form-check-input" type="checkbox" id="abierta">
					<label class="form-check-label" for="flexCheckDefault">
						Votación abierta?
					</label>
				</div>
			</div>`,
			showLoaderOnConfirm: true,
			preConfirm: async () => {
				const pregunta = document.querySelector('input#pregunta').value;
				const anonima = document.querySelector('input#anonima').checked;
				const activa = document.querySelector('input#activa').checked;
				const abierta = document.querySelector('input#abierta').checked;

				database.ref(`votaciones`).push({
					'pregunta': pregunta,
					'a_favor': 0,
					'neutral': 0,
					'en_contra': 0,
					'abierta': abierta,
					'anonima': anonima,
					'activa': activa,
					'votantes': {},
				});

				return pregunta;
			},
		}).then((result) => {
			console.log(result);
			if (result.isConfirmed) {
				Swal.fire({ title: `Votación "${result.value}" agregada` })
			}
		});
	}

	async function borrarVotacionesDetenidas() {
		Swal.fire({
            title: `Estas seguro que deseas eliminar todas las votaciones detenidas?`,
            showDenyButton: true,
            confirmButtonText: `Si`,
            denyButtonText: `No`,
        }).then((result) => {
            if (result.isConfirmed) {
				for (const [id, _] of votacionesDetenidas) {
					database.ref(`votaciones/${id}`).remove();
				}
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
		<br><br>

		{#if $usuario?.roles['admin']}
			<hr><br>

			<div class="d-flex justify-content-between align-items-center">
				<h1>Votaciones detenidas: {votacionesDetenidas.length}</h1>
				<button class="btn btn-danger"
					hidden={!votacionesDetenidas.length}
					on:click={borrarVotacionesDetenidas}>
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
