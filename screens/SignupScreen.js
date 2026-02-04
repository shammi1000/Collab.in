import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }
  
    try {
      setLoading(true);
      await api.post('/auth/register', { name, email, password });
      const loginRes = await api.post('/auth/login', { email, password });
      const { token, user } = loginRes.data;
  
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
  
      setLoading(false);
      if (user.role === 'admin') {
        navigation.replace('Admin', { user });
      } else {
        navigation.replace('AppTabs', { user });
      }
  
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={styles.innerContainer}>
        <Text style={styles.title}>Create Account</Text>
        {error ? <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text> : null}

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

<TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
  {loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={styles.buttonText}>Sign Up</Text>
  )}
</TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  title: {
    fontSize: 28, fontWeight: 'bold', color: '#fff',
    marginBottom: 40, textAlign: 'center'
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff',
    padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16,
  },
  button: {
    backgroundColor: '#8E2DE2', padding: 15,
    borderRadius: 30, alignItems: 'center', marginBottom: 20,
  },
  buttonText: {
    color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 1,
  },
  linkText: {
    color: '#BBBBBB', textAlign: 'center', fontSize: 14, marginTop: 10,
  },
});
