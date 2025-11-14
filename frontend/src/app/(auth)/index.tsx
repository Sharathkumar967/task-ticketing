import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import styles from "./authScreen.styles";
import { useAuth } from "../../hooks/useAuth";

export default function AuthScreen() {
  const {
    isLogin,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    selectedRole,
    setSelectedRole,
    switchTab,
    handleLogin,
    handleRegister,
  } = useAuth();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandContainer}>
          <Text style={styles.brandName}>TaskFlow</Text>
          <Text style={styles.brandTagline}>
            {isLogin ? "Log in to continue" : "Get started with TaskFlow"}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.activeTab]}
              onPress={() => switchTab(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                Log in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.activeTab]}
              onPress={() => switchTab(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                Sign up
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#8993A4"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#8993A4"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#8993A4"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select your role</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      selectedRole === "USER" && styles.roleButtonActive,
                    ]}
                    onPress={() => setSelectedRole("USER")}
                  >
                    <View style={styles.roleIcon}>
                      <Text style={styles.roleEmoji}>👤</Text>
                    </View>
                    <Text
                      style={[
                        styles.roleText,
                        selectedRole === "USER" && styles.roleTextActive,
                      ]}
                    >
                      Team Member
                    </Text>
                    <Text style={styles.roleDescription}>Work on tasks</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      selectedRole === "ADMIN" && styles.roleButtonActive,
                    ]}
                    onPress={() => setSelectedRole("ADMIN")}
                  >
                    <View style={styles.roleIcon}>
                      <Text style={styles.roleEmoji}>⚡</Text>
                    </View>
                    <Text
                      style={[
                        styles.roleText,
                        selectedRole === "ADMIN" && styles.roleTextActive,
                      ]}
                    >
                      Admin
                    </Text>
                    <Text style={styles.roleDescription}>Manage projects</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={isLogin ? handleLogin : handleRegister}
            >
              <Text style={styles.buttonText}>
                {isLogin ? "Log in" : "Sign up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
