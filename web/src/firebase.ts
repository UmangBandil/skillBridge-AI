
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
// Ensure singleton app instance (prevents duplicate initialization with HMR)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Safely initialize Analytics only in the browser and when supported
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  analyticsIsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // ignore analytics init errors (e.g., unsupported env)
    });
}

export default app;
export { analytics };
