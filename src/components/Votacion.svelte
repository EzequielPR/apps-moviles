<script>
	import { fly } from 'svelte/transition';
    import Swal from 'sweetalert2';

    import firebase, { database } from '../js/firebase-module';
    import { usuario } from '../js/store';

    export let id;
    export let votacion;
    let votoActual = '';

    $: votosTotales = votacion.a_favor + votacion.neutral + votacion.en_contra;
    $: estado = {
        abierta: votacion.abierta ? 'Abierta' : 'Cerrada',
        anonima: votacion.anonima ? 'Anonimos' : 'Publicos',
        activa: votacion.activa ? 'Activa' : 'Detenida',
    }
    $: porcentaje = {
        a_favor: (votacion.a_favor/votosTotales*100 || 0).toFixed(0),
        neutral: (votacion.neutral/votosTotales*100 || 0).toFixed(0),
        en_contra: (votacion.en_contra/votosTotales*100 || 0).toFixed(0),
    };
    $: votantes = getVotantes(votacion.votantes);


    database.ref(`usuarios/${$usuario.uid}/votaciones/${id}`)
        .on('value', async (snapshot) => {
            votoActual = snapshot.val();
        });

    async function actualizarVoto(votoNuevo) {
        if (!votacion.abierta) return;

        const votoAnterior = (await
            database.ref(`usuarios/${$usuario.uid}/votaciones/${id}`).get()
        ).val();

        const updates = {};

        if (votoAnterior) {
            updates[`votaciones/${id}/${votoAnterior}`] =
                firebase.database.ServerValue.increment(-1);
        }

        if (votoAnterior === votoNuevo) {
            database.ref(`usuarios/${$usuario.uid}/votaciones/${id}`).remove();
            database.ref(`votaciones/${id}/votantes/${$usuario.uid}`).remove();
        } else {
            updates[`votaciones/${id}/${votoNuevo}`] =
            firebase.database.ServerValue.increment(1);
            updates[`usuarios/${$usuario.uid}/votaciones/${id}`] = votoNuevo;
            updates[`votaciones/${id}/votantes/${$usuario.uid}`] = votoNuevo;
        }

        database.ref().update(updates);
    }

    async function cambiarEstado(e, propiedad) {
        const updates = {};
        updates[`votaciones/${id}/${propiedad}`] = e.target.checked;
        firebase.database().ref().update(updates);
    }

    async function borrarVotacion() {
        Swal.fire({
            title: `Estas seguro que deseas eliminar esta votacion?
                "${votacion.pregunta}"`,
            showDenyButton: true,
            confirmButtonText: `Si`,
            denyButtonText: `No`,
        }).then((result) => {
            if (result.isConfirmed) {
                firebase.database().ref(`votaciones/${id}`).remove();
            }
        });
    }

    async function getVotantes(votantes) {
        const opciones = {
            a_favor: [],
            neutral: [],
            en_contra: []
        };
        for (const uid in votantes) {
            const nombre = (await database.ref(`usuarios/${uid}/nombre`).get()).val();
            opciones[votacion.votantes[uid]].push(nombre);
        }
        return opciones;
    }
</script>



<div class="my-2">
    <div class="row">
        <div class="col col-12 col-md-8 col-lg-9">
            <div class="d-flex">
                {#if $usuario?.roles['admin']}
                    <span class="badge bg-danger cursor-pointer me-2"
                        on:click={borrarVotacion}>
                        Borrar votación
                    </span>
                {/if}
                <span class="badge bg-{votacion.abierta? 'info':'warning'}">
                    {estado.abierta} - {votosTotales} votos
                </span>
            </div>
            <h3 class="mt-2">{votacion.pregunta}</h3>

            <div class="mt-3 d-grid gap-1 d-md-block mb-2">
                <button
                    class="btn btn-outline-success nohover"
                    class:active={votoActual === 'a_favor'}
                    on:click={() => actualizarVoto('a_favor')}
                    >
                    A favor:  {votacion.a_favor} ({porcentaje.a_favor}%)
                </button>

                <button
                    class="btn btn-outline-secondary"
                    class:active={votoActual === 'neutral'}
                    on:click={() => actualizarVoto('neutral')}
                    >
                    Neutral:  {votacion.neutral} ({porcentaje.neutral}%)
                </button>

                <button
                    class="btn btn-outline-danger"
                    class:active={votoActual === 'en_contra'}
                    on:click={() => actualizarVoto('en_contra')}
                    >
                    En contra:  {votacion.en_contra} ({porcentaje.en_contra}%)
                </button>
            </div>
        </div>

        {#if $usuario?.roles['admin']}
            <div class="col col-12 col-md-4 col-lg-3 place-items-center">
                <div class="d-grid gap-1 text-center">
                    <div class="form-check form-switch">
                        <input type="checkbox" name="anonima-{id}"
                            class="form-check-input" checked={votacion.anonima}
                            on:click={(e) => cambiarEstado(e, 'anonima')}>
                        <label class="form-check-label" for="anonima-{id}">
                            Votantes {estado.anonima}
                        </label>
                    </div>

                    <div class="form-check form-switch">
                        <input type="checkbox" name="abierta-{id}"
                            class="form-check-input" checked={votacion.abierta}
                            on:click={(e) => cambiarEstado(e, 'abierta')}>
                        <label class="form-check-label" for="abierta-{id}">
                            Votacion {estado.abierta}
                        </label>
                    </div>

                    <div class="form-check form-switch">
                        <input type="checkbox" name="activa-{id}"
                            class="form-check-input" checked={votacion.activa}
                            on:click={(e) => cambiarEstado(e, 'activa')}>
                        <label class="form-check-label" for="activa-{id}">
                            Votacion {estado.activa}
                        </label>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    <br>

    <div class="row">
        {#if !votacion.anonima || $usuario?.roles['admin']}
            <div class="bg-light">
                <details class="text-center">
                    <summary>Ver votantes</summary>
                    <div class="row">
                        {#await votantes then votantes}
                            <div class="col-md-4 mb-2">
                                <strong>A favor ({votantes.a_favor.length} votos)</strong>
                                {#each votantes.a_favor as votante}
                                    <p class="m-0">{votante}</p>
                                {/each}
                            </div>
                            <div class="col-md-4 mb-2">
                                <strong>Neutral ({votantes.neutral.length} votos)</strong>
                                {#each votantes.neutral as votante}
                                    <p class="m-0">{votante}</p>
                                {/each}
                            </div>
                            <div class="col-md-4 mb-2">
                                <strong>En contra ({votantes.en_contra.length} votos)</strong>
                                {#each votantes.en_contra as votante}
                                    <p class="m-0">{votante}</p>
                                {/each}
                            </div>
                        {/await}
                    </div>
                </details>
            </div>
        {:else}
            <p>Esta votación es anonima</p>
        {/if}
    </div>
</div>



<style>
    .cursor-pointer {
        cursor: pointer;
    }
    .place-items-center {
        place-items: center;
    }
</style>
