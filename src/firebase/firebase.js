import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDinVQtDmFkbO90uhKcciMYCs7yq2wJ_1g",
  authDomain: "navigenius-439ed.firebaseapp.com",
  databaseURL: "https://navigenius-439ed-default-rtdb.firebaseio.com",
  projectId: "navigenius-439ed",
  storageBucket: "navigenius-439ed.appspot.com",
  messagingSenderId: "40052314225",
  appId: "1:40052314225:web:a2163b1cb96d27146e0bd0"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)



export { app, auth };
