import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../utils/theme';

const SignupScreen = ({ navigation }) => {
  const { signup } = useApp();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    try {
      await signup({ name, email, password, phone });
      navigation.replace('Login');
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <View style={[styles.card, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}> 
        <Text style={[styles.title, { color: theme.primary }]}>Sign Up</Text>
        <TextInput
          style={[styles.input, { color: theme.textStrong, borderColor: theme.border, backgroundColor: theme.buttonBg }]}
          placeholder="Restaurant Name"
          placeholderTextColor={theme.textDim}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { color: theme.textStrong, borderColor: theme.border, backgroundColor: theme.buttonBg }]}
          placeholder="Email"
          placeholderTextColor={theme.textDim}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { color: theme.textStrong, borderColor: theme.border, backgroundColor: theme.buttonBg }]}
          placeholder="Password"
          placeholderTextColor={theme.textDim}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={[styles.input, { color: theme.textStrong, borderColor: theme.border, backgroundColor: theme.buttonBg }]}
          placeholder="Phone"
          placeholderTextColor={theme.textDim}
          value={phone}
          onChangeText={setPhone}
        />
        {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={[styles.link, { color: theme.accent }]}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 18,
    padding: 28,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderWidth: 1.2,
    borderRadius: 10,
    marginBottom: 18,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  button: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  link: {
    marginTop: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 15,
    fontWeight: '500',
  },
  error: {
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default SignupScreen;
