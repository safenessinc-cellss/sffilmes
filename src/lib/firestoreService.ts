import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { 
  signInAnonymously, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { PortfolioItem, AppConfig, SavedBudget, AdminAuthorization } from '../types';

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

// Estado de autenticação
let authReady = false;
let authPromise: Promise<void> | null = null;
const authErrorListeners = new Set<(err: string | null) => void>();

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
  
  if (errMsg.includes("offline") || errMsg.includes("unavailable")) {
    console.warn('⚠️ Firestore offline: ', errMsg);
  } else if (errMsg.includes("configuration-not-found")) {
    console.warn('⚠️ Firebase Auth não configurado. Ative o provedor "Anônimo" no Firebase Console.');
    setAuthError('Anonymous auth not enabled. Please enable it in Firebase Console.');
  } else {
    console.warn('⚠️ Firestore Operation Warn:', errMsg);
  }
}

export let firebaseAuthError: string | null = null;

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

// --- NOVA VERSÃO DA AUTENTICAÇÃO ---

// Verifica se o usuário está autenticado, se não, tenta autenticar
export async function ensureAuthenticated(): Promise<boolean> {
  try {
    // Se já tem usuário, está autenticado
    if (auth.currentUser) {
      return true;
    }

    // Tenta autenticar anonimamente
    try {
      await signInAnonymously(auth);
      console.log('✅ Autenticado anonimamente com sucesso');
      setAuthError(null);
      return true;
    } catch (anonError: any) {
      // Se o erro for de configuração, avisa o usuário
      if (anonError?.code === 'auth/operation-not-allowed') {
        const msg = '❌ Autenticação anônima não está habilitada. Habilite no Firebase Console > Authentication > Sign-in methods > Anonymous.';
        console.error(msg);
        setAuthError(msg);
        return false;
      }
      throw anonError;
    }
  } catch (error: any) {
    console.warn('⚠️ Erro na autenticação:', error?.message || String(error));
    setAuthError(error?.message || String(error));
    return false;
  }
}

// Versão antiga mantida para compatibilidade (deprecated)
export async function authenticateAdmin(): Promise<void> {
  const success = await ensureAuthenticated();
  if (!success) {
    throw new Error('Falha na autenticação. Verifique o console para detalhes.');
  }
}

// Logout
export async function logoutAdminFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
    console.log("✅ Logout realizado com sucesso");
  } catch (error) {
    console.warn("⚠️ Erro ao fazer logout:", error);
  }
}

// Google Sign-In (para super admin)
export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log('✅ Login Google realizado:', user.email);
    
    // Verifica se é super admin
    if (user.email && isEmailSuperAdmin(user.email)) {
      return { success: true };
    }
    
    // Verifica se está autorizado
    const status = await checkAdminStatus(user.email || '');
    if (status === 'approved') {
      return { success: true };
    } else if (status === 'pending') {
      return { success: false, error: 'pending' };
    } else {
      return { success: false, error: 'not_authorized' };
    }
  } catch (error: any) {
    console.error('❌ Erro no login Google:', error);
    return { success: false, error: error?.message || String(error) };
  }
}

// --- FIM DA SEÇÃO DE AUTENTICAÇÃO ---

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
    const authed = await ensureAuthenticated();
    if (!authed) throw new Error('Não autenticado');
    await setDoc(doc(db, PORTFOLIO_PATH, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deletePortfolioItemFromFirestore(itemId: string): Promise<void> {
  const path = `${PORTFOLIO_PATH}/${itemId}`;
  try {
    const authed = await ensureAuthenticated();
    if (!authed) throw new Error('Não autenticado');
    await deleteDoc(doc(db, PORTFOLIO_PATH, itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// Seeding standard initial entries if portfolio is empty
export async function seedInitialPortfolio(defaultItems: PortfolioItem[]): Promise<void> {
  try {
    const authed = await ensureAuthenticated();
    if (!authed) {
      console.log("⚠️ Não autenticado, pulando seed do portfólio");
      return;
    }
    const querySnapshot = await getDocs(collection(db, PORTFOLIO_PATH));
    if (querySnapshot.empty) {
      console.log("📦 Portfolio vazio. Semeando itens padrão...");
      const batch = writeBatch(db);
      defaultItems.forEach((item) => {
        const itemRef = doc(db, PORTFOLIO_PATH, item.id);
        batch.set(itemRef, item);
      });
      await batch.commit();
      console.log("✅ Seed do portfólio concluído!");
    }
  } catch (error: any) {
    const errStr = error?.message || String(error);
    if (errStr.includes("offline") || errStr.includes("unavailable")) {
      console.log("⚠️ Firestore offline. Usando dados locais padrão.");
    } else {
      console.warn("⚠️ Erro durante seed do portfólio:", errStr);
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
    const authed = await ensureAuthenticated();
    if (!authed) throw new Error('Não autenticado');
    await setDoc(doc(db, CONFIG_PATH, CONFIG_DOC_ID), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function seedInitialConfig(defaultConfig: AppConfig): Promise<void> {
  const path = `${CONFIG_PATH}/${CONFIG_DOC_ID}`;
  try {
    const authed = await ensureAuthenticated();
    if (!authed) {
      console.log("⚠️ Não autenticado, pulando seed da configuração");
      return;
    }
    const docRef = doc(db, CONFIG_PATH, CONFIG_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.log("📦 Config vazia. Semeando configurações padrão...");
      await setDoc(docRef, defaultConfig);
      console.log("✅ Seed da configuração concluído!");
    }
  } catch (error: any) {
    const errStr = error?.message || String(error);
    if (errStr.includes("offline") || errStr.includes("unavailable")) {
      console.log("⚠️ Firestore offline. Usando configurações locais padrão.");
    } else {
      console.warn("⚠️ Erro durante seed da configuração:", errStr);
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
    const authed = await ensureAuthenticated();
    if (!authed) throw new Error('Não autenticado');
    await setDoc(doc(db, BUDGETS_PATH, budget.id), budget);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteBudgetFromFirestore(budgetId: string): Promise<void> {
  const path = `${BUDGETS_PATH}/${budgetId}`;
  try {
    const authed = await ensureAuthenticated();
    if (!authed) throw new Error('Não autenticado');
    await deleteDoc(doc(db, BUDGETS_PATH, budgetId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ADMIN AUTHORIZATION ACTIONS
const ADMIN_AUTH_PATH = 'admin_authorizations';

export function isEmailSuperAdmin(email: string): boolean {
  const clean = email.toLowerCase().trim();
  return clean === 'safeness.c.a@gmail' || clean === 'safeness.c.a@gmail.com';
}

export async function checkAdminStatus(email: string): Promise<'approved' | 'pending' | 'rejected' | 'none'> {
  const clean = email.toLowerCase().trim();
  if (isEmailSuperAdmin(clean)) {
    return 'approved';
  }
  try {
    const docRef = doc(db, ADMIN_AUTH_PATH, clean);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return (docSnap.data() as AdminAuthorization).status;
    }
  } catch (error) {
    console.warn("⚠️ Erro ao verificar status admin:", error);
  }
  return 'none';
}

export async function requestAdminAuthorization(email: string, displayName: string, photoURL?: string): Promise<void> {
  const clean = email.toLowerCase().trim();
  try {
    const docRef = doc(db, ADMIN_AUTH_PATH, clean);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || (docSnap.data() as AdminAuthorization).status === 'rejected') {
      const authRecord: AdminAuthorization = {
        email: clean,
        displayName,
        status: isEmailSuperAdmin(clean) ? 'approved' : 'pending',
        requestedAt: new Date().toISOString(),
        photoURL: photoURL || ""
      };
      await setDoc(docRef, authRecord);
      console.log(`📧 Solicitação de admin enviada para: ${clean}`);
    }
  } catch (error) {
    console.warn("⚠️ Erro ao solicitar autorização admin:", error);
  }
}

export function listenToAdminAuthorizations(
  onUpdate: (items: AdminAuthorization[]) => void,
  onError: (err: any) => void
) {
  return onSnapshot(
    collection(db, ADMIN_AUTH_PATH),
    (snapshot) => {
      const items: AdminAuthorization[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as AdminAuthorization);
      });
      items.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, ADMIN_AUTH_PATH);
      onError(error);
    }
  );
}

export async function updateAdminStatus(email: string, status: 'approved' | 'rejected'): Promise<void> {
  const clean = email.toLowerCase().trim();
  try {
    const docRef = doc(db, ADMIN_AUTH_PATH, clean);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const current = docSnap.data() as AdminAuthorization;
      await setDoc(docRef, {
        ...current,
        status
      });
      console.log(`✅ Status admin atualizado para ${clean}: ${status}`);
    } else {
      await setDoc(docRef, {
        email: clean,
        displayName: clean.split('@')[0],
        status,
        requestedAt: new Date().toISOString()
      });
      console.log(`✅ Registro admin criado para ${clean}: ${status}`);
    }
  } catch (error) {
    console.warn("⚠️ Erro ao atualizar status admin:", error);
  }
}

export async function deleteAdminAuthorization(email: string): Promise<void> {
  const clean = email.toLowerCase().trim();
  try {
    await deleteDoc(doc(db, ADMIN_AUTH_PATH, clean));
    console.log(`🗑️ Autorização admin removida: ${clean}`);
  } catch (error) {
    console.warn("⚠️ Erro ao deletar autorização admin:", error);
  }
}
