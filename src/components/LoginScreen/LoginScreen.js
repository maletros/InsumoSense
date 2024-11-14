import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { authService } from "../../services/auth/authService";

const LoginScreen = ({ onLogin, onRegisterPress, isLoading }) => {
  const [formData, setFormData] = useState({
    email: { value: "", error: "" },
    password: { value: "", error: "" },
  });
  const [loading, setLoading] = useState(false);
  const [showCreateAccountLink, setShowCreateAccountLink] = useState(false);

  useEffect(() => {
    console.log("FormData atualizado:", formData);
  }, [formData]);

  const showAlert = useCallback((title, message) => {
    Alert.alert(title, message, [{ text: "OK" }]);
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email é obrigatório";
    if (!emailRegex.test(email)) return "Formato de email inválido";
    return "";
  };

  const validatePassword = (password) => {
    if (!password.trim()) return "Senha é obrigatória";
    return "";
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { value, error: "" },
    }));
    setShowCreateAccountLink(false);
  };

  const handleLogin = async () => {
    console.log("LoginScreen: Iniciando handleLogin");
    try {
      const emailError = validateEmail(formData.email.value);
      const passwordError = validatePassword(formData.password.value);

      if (emailError || passwordError) {
        setFormData((prev) => ({
          email: { ...prev.email, error: emailError },
          password: { ...prev.password, error: passwordError },
        }));
        console.log("LoginScreen: Erros de validação encontrados");
        return;
      }

      setLoading(true);

      console.log("LoginScreen: Chamando onLogin");
      await onLogin(formData.email.value, formData.password.value);

      console.log("LoginScreen: Login bem-sucedido");
    } catch (error) {
      console.error("LoginScreen: Erro no login:", error);
      console.log("LoginScreen: Tipo do erro:", error.name);
      console.log("LoginScreen: Mensagem do erro:", error.message);
      console.log("LoginScreen: Stack do erro:", error.stack);

      if (error.message === "USER_NOT_FOUND") {
        console.log("LoginScreen: Usuário não encontrado");
        setFormData((prev) => ({
          ...prev,
          email: { ...prev.email, error: "Email não cadastrado" },
        }));
        setShowCreateAccountLink(true);
        showAlert(
          "Email não encontrado",
          "Não encontramos uma conta com este email. Deseja criar uma nova conta?"
        );
      } else if (error.message === "WRONG_PASSWORD") {
        console.log("LoginScreen: Senha incorreta");
        setFormData((prev) => ({
          ...prev,
          password: { ...prev.password, error: "Senha incorreta" },
        }));
        showAlert(
          "Senha incorreta",
          "A senha informada está incorreta. Por favor, tente novamente."
        );
      } else {
        console.log("LoginScreen: Erro de autenticação genérico");
        showAlert(
          "Erro de autenticação",
          "Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde."
        );
      }
    } finally {
      setLoading(false);
      console.log("LoginScreen: handleLogin finalizado");
    }
  };

  const handleForgotPassword = async () => {
    const email = formData.email.value;
    if (!email) {
      showAlert(
        "Erro",
        "Por favor, insira seu email antes de solicitar a recuperação de senha."
      );
      return;
    }

    try {
      setLoading(true);
      await authService.sendPasswordResetEmail(email);
      showAlert(
        "Sucesso",
        "Um email de recuperação de senha foi enviado para o seu endereço de email."
      );
    } catch (error) {
      console.error("Erro ao enviar email de recuperação de senha:", error);
      showAlert(
        "Erro",
        "Não foi possível enviar o email de recuperação de senha. Por favor, tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Bem-vindo ao sistema</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  formData.email.error ? styles.inputError : {},
                ]}
                placeholder="Email"
                value={formData.email.value}
                onChangeText={(value) => handleChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading && !loading}
                placeholderTextColor="#999"
              />
              {formData.email.error ? (
                <Text style={styles.errorText}>{formData.email.error}</Text>
              ) : null}
              {showCreateAccountLink && (
                <TouchableOpacity
                  onPress={() => onRegisterPress(formData.email.value)}
                >
                  <Text style={styles.createAccountLink}>
                    Criar conta com este email
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  formData.password.error ? styles.inputError : {},
                ]}
                placeholder="Senha"
                value={formData.password.value}
                onChangeText={(value) => handleChange("password", value)}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading && !loading}
                placeholderTextColor="#999"
              />
              {formData.password.error ? (
                <Text style={styles.errorText}>{formData.password.error}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.loginButton,
                (isLoading || loading) && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading || loading}
            >
              {isLoading || loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
              disabled={isLoading || loading}
            >
              <Text style={styles.forgotPasswordButtonText}>
                Esqueci minha senha
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => onRegisterPress(formData.email.value)}
              disabled={isLoading || loading}
            >
              <Text style={styles.registerButtonText}>Criar nova conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

LoginScreen.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onRegisterPress: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ff0000",
  },
  errorText: {
    color: "#ff0000",
    fontSize: 12,
    marginTop: 5,
  },
  createAccountLink: {
    color: "#007AFF",
    fontSize: 14,
    marginTop: 5,
    textDecorationLine: "underline",
  },
  buttonsContainer: {
    gap: 10,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#ccc",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordButton: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  forgotPasswordButtonText: {
    color: "#007AFF",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  registerButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
});

export default LoginScreen;
