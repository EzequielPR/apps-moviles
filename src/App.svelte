<script>
	import Navbar from './components/Navbar.svelte';
	import Votacion from './components/Votacion.svelte';

	import Swal from 'sweetalert2';

	import { usuario, votaciones } from './js/store';
	import firebase, { auth, database } from './js/firebase-module';

	$: vArray = Object.entries($votaciones);

	async function nuevaVotacion() {
		Swal.fire({
			title: 'Pregunta de la votación',
			input: 'text',
			inputAttributes: {
			autocapitalize: 'on'
			},
			showCancelButton: true,
			confirmButtonText: 'Agregar',
			showLoaderOnConfirm: true,
			preConfirm: (pregunta) => {
				database.ref(`votaciones/`).push({
					'pregunta': pregunta,
					'a_favor': 0,
					'neutral': 0,
					'en_contra': 0,
					'abierta': false
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
	<div>
		{#if $usuario}
			<div class="d-flex justify-content-between">
				<h1 class="d-inline">Votaciones activas: {vArray.length}</h1>
				{#if $usuario?.roles['admin']}
					<button class="btn btn-primary m-2 nueva" on:click={nuevaVotacion}>Nueva Votación</button>
				{/if}
			</div>
			<ul id="votaciones-list" class="list-group mt-2">
				{#each vArray.reverse() as [id, votacion]}
					<Votacion {id} {votacion} />
				{/each}
			</ul>
		{/if}
	</div>
</main>



<style></style>
