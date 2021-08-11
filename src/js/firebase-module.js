import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyB0_G0NHnlYeCAmSprcgkX6_Tp2aUtp83M",
    authDomain: "peaceful-app-303921.firebaseapp.com",
    databaseURL: "https://peaceful-app-303921-default-rtdb.firebaseio.com",
    projectId: "peaceful-app-303921",
    storageBucket: "peaceful-app-303921.appspot.com",
    messagingSenderId: "834441108220",
    appId: "1:834441108220:web:eac1a8ff86e7b6e5d4d579"
};
firebase.initializeApp(firebaseConfig);

export default firebase;

export const auth = firebase.auth();
export const database = firebase.database();
