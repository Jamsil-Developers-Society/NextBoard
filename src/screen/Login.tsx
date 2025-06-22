import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleSignUp = () => {
    navigation.navigate('Signup');
  };

  const handleSignIn = () => {
    Alert.alert('로그인 시도', `Email: ${email}\nPassword: ${password}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.heading}>Welcome</Text>
        <Text style={styles.subheading}>Sign in to continue!</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email ID</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.linkRight}>
            <Text style={styles.linkText}>Forget Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>I'm a new user. </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={[styles.linkText, styles.footerLink]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    width: '90%',
    maxWidth: 290,
  },
  heading: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1f2937', // coolGray.800
  },
  subheading: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563', // coolGray.600
    marginTop: 4,
  },
  formGroup: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  linkRight: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  linkText: {
    fontSize: 12,
    color: '#6366f1', // indigo.500
    fontWeight: '500',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#4b5563',
  },
  footerLink: {
    marginLeft: 4,
  },
});
