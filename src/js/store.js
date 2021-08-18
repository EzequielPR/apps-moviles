import { writable } from 'svelte/store';
import { auth, database } from './firebase-module';


export const usuario = writable(auth.currentUser);
export const votaciones = writable({});


auth.onAuthStateChanged(async (newUser) => {
    if (newUser) {
        newUser.roles = (
            await database.ref(`usuarios/${newUser.uid}/roles`
        ).get()).val() || {};
    }

    usuario.set(newUser);
});

database.ref('votaciones').on('value', async (snapshot) => {
    // console.log(snapshot.exists());
    votaciones.set(snapshot.val());
});
