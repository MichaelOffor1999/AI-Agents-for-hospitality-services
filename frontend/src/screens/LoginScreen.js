import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../utils/theme';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AppContext);
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login({ email, password });
      // Navigate to dashboard or home after successful login
      navigation.replace('DashboardScreen');
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <View style={[styles.card, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}> 
        <Text style={[styles.title, { color: theme.primary }]}>Login</Text>
        <TextInput
          style={[styles.input, { color: theme.textStrong, borderColor: theme.border, backgroundColor: theme.buttonBg }]}
          placeholder="Email"
          placeholderTextColor={theme.textDim}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { color: theme.textStrong, borderColor: theme.border, backgroundColor: theme.buttonBg }]}
          placeholder="Password"
          placeholderTextColor={theme.textDim}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={[styles.link, { color: theme.accent }]}>Don't have an account? Sign up</Text>
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
});

export default LoginScreen;
