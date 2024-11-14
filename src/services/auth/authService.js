// src/services/auth/authService.js

import { auth, db } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser as firebaseDeleteUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

const ADMIN_EMAIL = "admin@admin.com";

class AuthService {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      console.log("AuthService: Iniciando inicialização");
      const adminQuery = query(
        collection(db, "users"),
        where("email", "==", ADMIN_EMAIL)
      );
      const adminSnapshot = await getDocs(adminQuery);

      if (adminSnapshot.empty) {
        console.log("AuthService: Admin não encontrado, criando...");
        await this.register({
          email: ADMIN_EMAIL,
          password: "admin123",
          name: "Administrador",
          role: "admin",
        });
        console.log("AuthService: Admin padrão criado com sucesso");
      } else {
        console.log("AuthService: Admin já existe");
      }

      this.initialized = true;
      console.log("AuthService: Inicialização concluída");
    } catch (error) {
      console.error("AuthService: Erro na inicialização:", error);
      throw new Error("Não foi possível inicializar o serviço de autenticação");
    }
  }

  async checkEmailExists(email) {
    console.log("AuthService: Verificando existência do email:", email);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("AuthService: Email encontrado no Firestore");
        return true;
      }

      const methods = await fetchSignInMethodsForEmail(auth, email);
      console.log("AuthService: Métodos de login para o email:", methods);
      return methods.length > 0;
    } catch (error) {
      console.error("AuthService: Erro ao verificar email:", error);
      throw error;
    }
  }

  async login(email, password) {
    console.log("AuthService: Iniciando login para email:", email);
    try {
      const emailExists = await this.checkEmailExists(email);
      console.log("AuthService: Email existe?", emailExists);

      if (!emailExists) {
        console.log("AuthService: Email não encontrado");
        throw new Error("USER_NOT_FOUND");
      }

      try {
        console.log("AuthService: Tentando signInWithEmailAndPassword");
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log(
          "AuthService: Login bem-sucedido, userCredential:",
          userCredential
        );
        const user = userCredential.user;

        let userDoc = await getDoc(doc(db, "users", user.uid));
        console.log(
          "AuthService: Documento do usuário existe?",
          userDoc.exists()
        );

        if (!userDoc.exists()) {
          console.log(
            "AuthService: Documento do usuário não existe no Firestore, criando..."
          );
          const userData = {
            email: user.email,
            name: user.displayName || "Usuário",
            role: email === ADMIN_EMAIL ? "admin" : "employee",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", user.uid), userData);
          userDoc = { data: () => userData };
        }

        const userData = userDoc.data();
        console.log("AuthService: Dados do usuário:", userData);

        await updateDoc(doc(db, "users", user.uid), {
          lastLogin: new Date().toISOString(),
        });

        return { uid: user.uid, email: user.email, ...userData };
      } catch (error) {
        console.error("AuthService: Erro na autenticação:", error);
        console.log("AuthService: Código do erro:", error.code);
        if (
          error.code === "auth/wrong-password" ||
          error.code === "auth/invalid-credential"
        ) {
          throw new Error("WRONG_PASSWORD");
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("AuthService: Erro no login:", error);
      console.log("AuthService: Mensagem do erro:", error.message);
      if (
        error.message === "USER_NOT_FOUND" ||
        error.message === "WRONG_PASSWORD"
      ) {
        throw error;
      } else {
        throw new Error("AUTH_ERROR");
      }
    }
  }

  async register(userData) {
    try {
      const { email, password, name, role = "employee" } = userData;

      console.log("AuthService: Iniciando registro para email:", email);

      const emailExists = await this.checkEmailExists(email);
      if (emailExists) {
        console.log("AuthService: Email já está em uso");
        throw new Error("EMAIL_IN_USE");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log("AuthService: Usuário registrado com sucesso:", user.uid);
      return { success: true, user: { uid: user.uid, email, name, role } };
    } catch (error) {
      console.error("AuthService: Erro no registro:", error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log(
        "AuthService: Email de recuperação de senha enviado com sucesso"
      );
    } catch (error) {
      console.error(
        "AuthService: Erro ao enviar email de recuperação de senha:",
        error
      );
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth);
      console.log("AuthService: Logout realizado com sucesso");
    } catch (error) {
      console.error("AuthService: Erro ao fazer logout:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          unsubscribe();
          if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            resolve({ uid: user.uid, email: user.email, ...userDoc.data() });
          } else {
            resolve(null);
          }
        },
        reject
      );
    });
  }

  async getAllUsers() {
    try {
      console.log("AuthService: Obtendo todos os usuários");
      const usersSnapshot = await getDocs(collection(db, "users"));
      return usersSnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("AuthService: Erro ao obter usuários:", error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      console.log("AuthService: Atualizando usuário:", userId);
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado");
      }

      if (userDoc.data().email === ADMIN_EMAIL) {
        throw new Error("Não é possível alterar o admin padrão");
      }

      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString(),
      });

      if (userData.password) {
        const user = auth.currentUser;
        if (user && user.uid === userId) {
          await updatePassword(user, userData.password);
        } else {
          console.warn(
            "AuthService: Não foi possível atualizar a senha do usuário"
          );
        }
      }

      console.log("AuthService: Usuário atualizado com sucesso");
      return { uid: userId, ...userData };
    } catch (error) {
      console.error("AuthService: Erro ao atualizar usuário:", error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      console.log("AuthService: Iniciando exclusão do usuário:", userId);
      const userRef = doc(db, "users", userId);
      console.log("AuthService: Obtendo documento do usuário");
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.log("AuthService: Usuário não encontrado");
        throw new Error("Usuário não encontrado");
      }

      const userData = userDoc.data();
      if (userData.email === ADMIN_EMAIL) {
        console.log("AuthService: Tentativa de excluir admin padrão");
        throw new Error("Não é possível excluir o admin padrão");
      }

      console.log("AuthService: Deletando documento do usuário no Firestore");
      await deleteDoc(userRef);
      console.log("AuthService: Documento do usuário deletado do Firestore");

      try {
        console.log("AuthService: Tentando deletar usuário da autenticação");
        const user = auth.currentUser;
        if (user && user.uid === userId) {
          await firebaseDeleteUser(user);
          console.log(
            "AuthService: Usuário deletado da autenticação com sucesso"
          );
        } else {
          console.warn(
            "AuthService: Não foi possível deletar o usuário da autenticação: usuário não encontrado ou não é o usuário atual"
          );
        }
      } catch (authError) {
        console.warn(
          "AuthService: Erro ao deletar o usuário da autenticação:",
          authError
        );
      }

      console.log(
        "AuthService: Processo de exclusão do usuário concluído com sucesso"
      );
      return true;
    } catch (error) {
      console.error("AuthService: Erro ao deletar usuário:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();
