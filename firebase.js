import { initializeApp } from "firebase/app";
import { isSupported, getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCI7QL76cTZFQyUWajMEvX97fWEVLP74Nw",
  authDomain: "inventorymanagement-a3b6e.firebaseapp.com",
  projectId: "inventorymanagement-a3b6e",
  storageBucket: "inventorymanagement-a3b6e.appspot.com",
  messagingSenderId: "546731898493",
  appId: "1:546731898493:web:eb4e4a619d64a0a2a42314",
  measurementId: "G-G3C4EXVGDS"
};

const app = initializeApp(firebaseConfig);
isSupported().then((supported) => {
  if (supported) {
      const analytics = getAnalytics(app);
  }
});
const firestore = getFirestore(app);

export { firestore };
