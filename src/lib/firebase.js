import { initializeApp } from "firebase/app";
import {
  RecaptchaVerifier,
  getAuth,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

void setPersistence(firebaseAuth, browserLocalPersistence).catch(() => null);

export const isFirebasePhoneAuthTestMode =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
  import.meta.env.VITE_FIREBASE_USE_TEST_PHONE_AUTH === "true";

if (isFirebasePhoneAuthTestMode) {
  firebaseAuth.settings.appVerificationDisabledForTesting = true;
}

let recaptchaVerifier = null;

export function ensureRecaptchaVerifier(containerId = "recaptcha-container") {
  if (typeof window === "undefined") {
    throw new Error("reCAPTCHA is only available in the browser");
  }

  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: "invisible",
    });
  }

  return recaptchaVerifier;
}

export async function resetRecaptchaVerifier() {
  if (!recaptchaVerifier) {
    return;
  }

  try {
    recaptchaVerifier.clear();
  } catch {
    // Ignore recaptcha cleanup issues and recreate on the next request.
  } finally {
    recaptchaVerifier = null;
  }
}
