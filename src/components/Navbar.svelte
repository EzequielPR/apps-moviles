<script>
    import { usuario } from '../js/store';
    import firebase, { auth, database } from '../js/firebase-module';

    function googleLogin() {
        const googleProvider = new firebase.auth.GoogleAuthProvider();

        auth.signInWithPopup(googleProvider).then(uc => {
            const user = uc.user;
            database.ref(`usuarios/${user.uid}/nombre`).set(user.displayName);
        });
    }

    function logout() {
        auth.signOut();
    }
</script>



<nav class="navbar navbar-expand-sm navbar-dark bg-dark">
    <div class="container">
        <a class="navbar-brand" href="/">Votaciones</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav w-100">
                <!-- <li class="nav-item">
                    <a class="nav-link" href="">Votaciones</a>
                </li> -->
                {#if $usuario}
                    <li class="nav-item">
                        <div class="nav-link disabled">{$usuario.displayName}</div>
                    </li>
                    <li class="nav-item ms-sm-auto">
                        <div class="nav-link" on:click={logout}>Cerrar sesión</div>
                    </li>
                {:else}
                    <li class="nav-item ms-sm-auto">
                        <div class="nav-link" on:click={googleLogin}>Acceder con Google</div>
                    </li>
                {/if}
            </ul>
        </div>
    </div>
</nav>



<style></style>
