// src/components/RegisterScreen/RegisterScreen.js
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { authService } from "../../services";

const RegisterScreen = ({ onRegister, onBack, initialEmail = "" }) => {
  const [formData, setFormData] = useState({
    name: { value: "", error: "" },
    email: { value: initialEmail, error: "" },
    password: { value: "", error: "" },
    confirmPassword: { value: "", error: "" },
  });
  const [loading, setLoading] = useState(false);

  const validateField = (field, value) => {
    switch (field) {
      case "name":
        return !value.trim() ? "Nome é obrigatório" : "";
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return "Email é obrigatório";
        if (!emailRegex.test(value)) return "Email inválido";
        return "";
      }
      case "password":
        if (!value) return "Senha é obrigatória";
        if (value.length < 6) return "Senha deve ter pelo menos 6 caracteres";
        return "";
      case "confirmPassword":
        if (!value) return "Confirmação de senha é obrigatória";
        if (value !== formData.password.value)
          return "As senhas não correspondem";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { value, error: validateField(field, value) },
    }));
  };

  const handleRegister = async () => {
    // Validar todos os campos
    const newFormData = {};
    let hasError = false;

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field].value);
      newFormData[field] = { ...formData[field], error };
      if (error) hasError = true;
    });

    setFormData(newFormData);

    if (hasError) {
      Alert.alert("Erro", "Por favor, corrija os erros no formulário");
      return;
    }

    setLoading(true);
    try {
      const newUser = await authService.register({
        name: formData.name.value.trim(),
        email: formData.email.value.toLowerCase().trim(),
        password: formData.password.value,
      });

      Alert.alert("Sucesso", "Cadastro realizado com sucesso!", [
        { text: "OK", onPress: () => onRegister(newUser) },
      ]);
    } catch (error) {
      Alert.alert("Erro", error.message);
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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>
                Preencha seus dados para começar
              </Text>
            </View>

            <View style={styles.form}>
              {/* Nome */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nome completo</Text>
                <TextInput
                  style={[
                    styles.input,
                    formData.name.error ? styles.inputError : {},
                  ]}
                  placeholder="Digite seu nome"
                  value={formData.name.value}
                  onChangeText={(value) => handleChange("name", value)}
                  autoCapitalize="words"
                  editable={!loading}
                  placeholderTextColor="#999"
                />
                {formData.name.error ? (
                  <Text style={styles.errorText}>{formData.name.error}</Text>
                ) : null}
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    formData.email.error ? styles.inputError : {},
                  ]}
                  placeholder="Digite seu email"
                  value={formData.email.value}
                  onChangeText={(value) => handleChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  placeholderTextColor="#999"
                />
                {formData.email.error ? (
                  <Text style={styles.errorText}>{formData.email.error}</Text>
                ) : null}
              </View>

              {/* Senha */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Senha</Text>
                <TextInput
                  style={[
                    styles.input,
                    formData.password.error ? styles.inputError : {},
                  ]}
                  placeholder="Digite sua senha"
                  value={formData.password.value}
                  onChangeText={(value) => handleChange("password", value)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                  placeholderTextColor="#999"
                />
                {formData.password.error ? (
                  <Text style={styles.errorText}>
                    {formData.password.error}
                  </Text>
                ) : null}
              </View>

              {/* Confirmar Senha */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirmar senha</Text>
                <TextInput
                  style={[
                    styles.input,
                    formData.confirmPassword.error ? styles.inputError : {},
                  ]}
                  placeholder="Digite sua senha novamente"
                  value={formData.confirmPassword.value}
                  onChangeText={(value) =>
                    handleChange("confirmPassword", value)
                  }
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                  placeholderTextColor="#999"
                />
                {formData.confirmPassword.error ? (
                  <Text style={styles.errorText}>
                    {formData.confirmPassword.error}
                  </Text>
                ) : null}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Criar conta</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

RegisterScreen.propTypes = {
  onRegister: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  initialEmail: PropTypes.string,
};

RegisterScreen.defaultProps = {
  initialEmail: "",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    paddingBottom: 10,
  },
  backButton: {
    paddingVertical: 10,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
  inputError: {
    borderColor: "#ff0000",
  },
  errorText: {
    color: "#ff0000",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  registerButton: {
    backgroundColor: "#007AFF",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: "#ccc",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
