<script>
    import Swal from 'sweetalert2';

    import firebase, { database } from '../js/firebase-module';
    import { usuario } from '../js/store';

    export let id;
    export let votacion;
    let votoActual = '';

    $: votosTotales = votacion.a_favor + votacion.neutral + votacion.en_contra;
    $: estado = votacion.abierta ? 'Abierta' : 'Cerrada';
    $: porcentaje = {
        a_favor: (votacion.a_favor/votosTotales*100 || 0).toFixed(0),
        neutral: (votacion.neutral/votosTotales*100 || 0).toFixed(0),
        en_contra: (votacion.en_contra/votosTotales*100 || 0).toFixed(0),
    };


    database.ref(`usuarios/${$usuario.uid}/votaciones/${id}`).on('value', async (snapshot) => {
        votoActual = snapshot.val();
    });

    async function actualizarVoto(votoNuevo) {
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
        } else {
            updates[`votaciones/${id}/${votoNuevo}`] =
                firebase.database.ServerValue.increment(1);
            updates[`usuarios/${$usuario.uid}/votaciones/${id}`] = votoNuevo;
        }

        database.ref().update(updates);
    }

    async function cambiarEstado(estadoNuevo) {
        const updates = {};
        updates[`votaciones/${id}/abierta`] = estadoNuevo;
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
</script>



<li class="list-group-item d-flex flex-column flex-lg-row align-items-center p-4">
<div class="flex-grow-1">
<div>
    <span class="badge text-dark {votacion.abierta? 'bg-info':'bg-warning'} fs-6">
        {estado} - {votosTotales} votos
    </span>
    <h3 class="mt-2">{votacion.pregunta}</h3>
</div>

<div class="mt-3 d-grid gap-1 d-md-block">
    <button
        class="btn btn-outline-success"
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

<div>
{#if $usuario?.roles['admin']}
    <div class="form-check form-switch mt-2 btn">
        <input class="form-check-input"
            type="checkbox" id="abierta-{id}"
            checked={votacion.abierta}
            on:click={(e) => cambiarEstado(e.target.checked)}>
        <label class="form-check-label" for="abierta-{id}">
            Votación {estado}
        </label>
    </div>
    <button class="btn btn-danger" on:click={borrarVotacion}>Borrar</button>
{/if}
</div>
</li>



<style></style>
