import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../firebase';
import { PortfolioItem, AppConfig, SavedBudget } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Global Firebase error translator
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  if (errMsg.includes("offline") || errMsg.includes("unavailable") || errMsg.includes("configuration-not-found")) {
    console.warn('Firestore offline/config warning (non-blocking): ', errMsg);
  } else {
    console.warn('Firestore Operation Warn: ', JSON.stringify(errInfo));
  }
}

export let firebaseAuthError: string | null = null;
const authErrorListeners = new Set<(err: string | null) => void>();

export function subscribeToAuthError(listener: (err: string | null) => void) {
  authErrorListeners.add(listener);
  listener(firebaseAuthError);
  return () => {
    authErrorListeners.delete(listener);
  };
}

function setAuthError(err: string | null) {
  firebaseAuthError = err;
  authErrorListeners.forEach(l => l(err));
}

// Authenticate Admin to Firebase Auth
export async function authenticateAdmin(): Promise<void> {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
      setAuthError(null);
      console.log("Authenticated anonymously to Firebase Auth as administrator successfully");
    }
  } catch (error: any) {
    console.warn("Firebase authentication notice (anonymously signed-in is disabled, non-blocking):", error?.message || String(error));
    setAuthError(error?.message || String(error));
  }
}

// De-authenticate Admin
export async function logoutAdminFromFirebase(): Promise<void> {
  try {
    await auth.signOut();
    console.log("Logged out from Firebase Auth");
  } catch (error) {
    console.warn("Firebase logout notice:", error);
  }
}

// PORTFOLIO ACTIONS
const PORTFOLIO_PATH = 'portfolio';

export function listenToPortfolio(
  onUpdate: (items: PortfolioItem[]) => void, 
  onError: (err: any) => void
) {
  return onSnapshot(
    collection(db, PORTFOLIO_PATH), 
    (snapshot) => {
      const items: PortfolioItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as PortfolioItem);
      });
      onUpdate(items);
    }, 
    (error) => {
      handleFirestoreError(error, OperationType.GET, PORTFOLIO_PATH);
      onError(error);
    }
  );
}

export async function savePortfolioItemToFirestore(item: PortfolioItem): Promise<void> {
  const path = `${PORTFOLIO_PATH}/${item.id}`;
  try {
    await authenticateAdmin();
    await setDoc(doc(db, PORTFOLIO_PATH, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePortfolioItemFromFirestore(itemId: string): Promise<void> {
  const path = `${PORTFOLIO_PATH}/${itemId}`;
  try {
    await authenticateAdmin();
    await deleteDoc(doc(db, PORTFOLIO_PATH, itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Seeding standard initial entries if portfolio is empty
export async function seedInitialPortfolio(defaultItems: PortfolioItem[]): Promise<void> {
  try {
    await authenticateAdmin();
    const querySnapshot = await getDocs(collection(db, PORTFOLIO_PATH));
    if (querySnapshot.empty) {
      console.log("Portfolio collection is empty on Firestore. Seeding default items...");
      const batch = writeBatch(db);
      defaultItems.forEach((item) => {
        const itemRef = doc(db, PORTFOLIO_PATH, item.id);
        batch.set(itemRef, item);
      });
      await batch.commit();
      console.log("Seeding portfolio completed successfully!");
    }
  } catch (error: any) {
    const errStr = error?.message || String(error);
    if (errStr.includes("offline") || errStr.includes("unavailable")) {
      console.log("Firestore client is offline. Skipping portfolio database seeding, using local defaults.");
    } else {
      console.warn("Notice: Error during initial portfolio seeding:", errStr);
    }
  }
}


// CONFIG ACTIONS
const CONFIG_PATH = 'config';
const CONFIG_DOC_ID = 'settings';

export function listenToConfig(
  onUpdate: (config: AppConfig) => void,
  onError: (err: any) => void
) {
  return onSnapshot(
    doc(db, CONFIG_PATH, CONFIG_DOC_ID),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as AppConfig);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${CONFIG_PATH}/${CONFIG_DOC_ID}`);
      onError(error);
    }
  );
}

export async function saveConfigToFirestore(config: AppConfig): Promise<void> {
  const path = `${CONFIG_PATH}/${CONFIG_DOC_ID}`;
  try {
    await authenticateAdmin();
    await setDoc(doc(db, CONFIG_PATH, CONFIG_DOC_ID), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function seedInitialConfig(defaultConfig: AppConfig): Promise<void> {
  const path = `${CONFIG_PATH}/${CONFIG_DOC_ID}`;
  try {
    await authenticateAdmin();
    const docRef = doc(db, CONFIG_PATH, CONFIG_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.log("Config document is empty on Firestore. Seeding default settings...");
      await setDoc(docRef, defaultConfig);
      console.log("Seeding config settings completed successfully!");
    }
  } catch (error: any) {
    const errStr = error?.message || String(error);
    if (errStr.includes("offline") || errStr.includes("unavailable")) {
      console.log("Firestore client is offline. Skipping app config database seeding, using local defaults.");
    } else {
      console.warn("Notice: Error during initial config seeding:", errStr);
    }
  }
}

// BUDGETS ACTIONS
const BUDGETS_PATH = 'budgets';

export function listenToBudgets(
  onUpdate: (budgets: SavedBudget[]) => void,
  onError: (err: any) => void
) {
  return onSnapshot(
    collection(db, BUDGETS_PATH),
    (snapshot) => {
      const budgets: SavedBudget[] = [];
      snapshot.forEach((doc) => {
        budgets.push({ id: doc.id, ...doc.data() } as SavedBudget);
      });
      // Sort by generation date descending
      budgets.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
      onUpdate(budgets);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, BUDGETS_PATH);
      onError(error);
    }
  );
}

export async function saveBudgetToFirestore(budget: SavedBudget): Promise<void> {
  const path = `${BUDGETS_PATH}/${budget.id}`;
  try {
    await authenticateAdmin();
    await setDoc(doc(db, BUDGETS_PATH, budget.id), budget);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBudgetFromFirestore(budgetId: string): Promise<void> {
  const path = `${BUDGETS_PATH}/${budgetId}`;
  try {
    await authenticateAdmin();
    await deleteDoc(doc(db, BUDGETS_PATH, budgetId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

