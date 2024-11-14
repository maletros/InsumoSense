import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGLT-MrTSAFBvs0mdTMEO1JVD3aFqjz_E",
  authDomain: "clinica-banco-unama.firebaseapp.com",
  projectId: "clinica-banco-unama",
  storageBucket: "clinica-banco-unama.appspot.com",
  messagingSenderId: "131507496212",
  appId: "1:131507496212:web:8e6a6e2c81519dee5e4e01",
  measurementId: "G-7JM13EQL5R",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
