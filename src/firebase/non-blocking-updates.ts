
'use client';

import {
  Firestore,
  setDoc,
  doc,
  addDoc,
  collection,
  DocumentData,
  WithFieldValue,
  SetOptions,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * A non-blocking version of setDoc. It updates the local cache immediately
 * and sends the write to the server in the background. It includes optimistic
 * UI updates and robust, non-blocking error handling.
 *
 * @param reference The DocumentReference to write to.
 * @param data The data to write.
 * @param options The SetOptions for the operation (e.g., { merge: true }).
 */
export const setDocumentNonBlocking = <T>(
  reference: DocumentReference<T, DocumentData>,
  data: WithFieldValue<T>,
  options?: SetOptions
) => {
  setDoc(reference, data, { ...(options || {}) }).catch(async (error) => {
    // In case of an error (like a permission error), create a rich,
    // contextual error object and emit it globally.
    const permissionError = new FirestorePermissionError({
      path: reference.path,
      operation: options && 'merge' in options ? 'update' : 'create',
      requestResourceData: data,
    });
    // This allows a central listener to catch it for debugging or logging,
    // without blocking the UI.
    errorEmitter.emit('permission-error', permissionError);
  });
};

/**
 * A non-blocking version of addDoc that provides optimistic UI updates and
 * handles errors gracefully in the background.
 *
 * @param reference The CollectionReference to add the document to.
 * @param data The data for the new document.
 */
export const addDocumentNonBlocking = <T>(
  reference: CollectionReference<T, DocumentData>,
  data: WithFieldValue<T>
) => {
  addDoc(reference, data).catch(async (error) => {
    const tempDocId = `__temp_${Date.now()}__`;
    const tempDocPath = `${reference.path}/${tempDocId}`;
    
    const permissionError = new FirestorePermissionError({
      path: tempDocPath, // Use a temporary path for the error context
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
};
