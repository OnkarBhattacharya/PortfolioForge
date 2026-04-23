import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let cachedApp: App | null = null;

function getServiceAccountConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };
}

function assertAdminConfiguration() {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return;
  }

  const serviceAccount = getServiceAccountConfig();
  if (!serviceAccount) {
    throw new Error(
      'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY before using admin helpers.'
    );
  }
}

export function getAdminApp(): App {
  if (cachedApp) {
    return cachedApp;
  }

  const apps = getApps();
  if (apps.length > 0) {
    cachedApp = getApp();
    return cachedApp;
  }

  assertAdminConfiguration();

  const serviceAccount = getServiceAccountConfig();
  if (!serviceAccount) {
    throw new Error(
      'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY before using admin helpers.'
    );
  }

  cachedApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });

  return cachedApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export const getAdminFirestore = getAdminDb;
export const adminAuth = getAdminAuth;
export const adminDb = getAdminDb;