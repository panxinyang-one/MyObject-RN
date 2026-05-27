import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/theme';
import { AddItemScreen } from '../screens/AddItemScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { RootStackParamList } from '../types/item';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={({ route }) => ({
          title: route.params?.itemId ? '编辑物证' : '添加物证',
        })}
      />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{ title: '物证详情' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: '演示与数据' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: '登录' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: '注册' }}
      />
    </Stack.Navigator>
  );
}
