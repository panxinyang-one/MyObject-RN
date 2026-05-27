import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getApiBaseUrl, getDefaultApiBaseUrl, setApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList } from '../types/item';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { items, importSeedData, clearAllItems, syncError, isCloudMode, refreshItems } =
    useItems();
  const { email, isAuthenticated, logout } = useAuth();
  const [apiUrl, setApiUrl] = useState(getDefaultApiBaseUrl());
  const [savedUrl, setSavedUrl] = useState('');

  useEffect(() => {
    getApiBaseUrl().then(url => {
      setApiUrl(url);
      setSavedUrl(url);
    });
  }, []);

  const handleImport = () => {
    Alert.alert(
      '导入演示数据',
      '将用 5 条预设物品覆盖当前列表，方便答辩演示。确定继续？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '导入',
          onPress: () => {
            importSeedData()
              .then(() => {
                Alert.alert('完成', '演示数据已导入，返回首页查看。');
              })
              .catch(() => {});
          },
        },
      ],
    );
  };

  const handleClear = () => {
    Alert.alert(
      '清空全部',
      '将删除所有物证记录，且无法恢复。确定继续？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: () => {
            clearAllItems()
              .then(() => navigation.goBack())
              .catch(() => {});
          },
        },
      ],
    );
  };

  const saveApiUrl = async () => {
    await setApiBaseUrl(apiUrl.trim());
    const next = await getApiBaseUrl();
    setSavedUrl(next);
    Alert.alert('已保存', `API 地址：${next}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.section}>云端账号</Text>
      {isAuthenticated ? (
        <>
          <Text style={styles.desc}>已登录：{email}</Text>
          <Text style={styles.desc}>
            模式：云端同步（{items.length} 条物证）
          </Text>
          {syncError ? (
            <Text style={styles.warn}>同步提示：{syncError}</Text>
          ) : null}
          <Pressable style={styles.secondaryBtn} onPress={() => refreshItems()}>
            <Text style={styles.secondaryText}>重新拉取云端数据</Text>
          </Pressable>
          <Pressable
            style={styles.dangerBtn}
            onPress={() => {
              logout().then(() => refreshItems());
            }}>
            <Text style={styles.dangerText}>退出登录</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.desc}>
            未登录时使用本地存储。登录后数据保存到服务器。
          </Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryText}>登录 / 注册</Text>
          </Pressable>
        </>
      )}

      <Text style={styles.section}>API 地址</Text>
      <Text style={styles.desc}>
        模拟器默认 {getDefaultApiBaseUrl()}。真机请改为你电脑的局域网 IP，例如
        http://192.168.1.10:3000。当前生效：{savedUrl}
      </Text>
      <TextInput
        style={styles.input}
        value={apiUrl}
        onChangeText={setApiUrl}
        autoCapitalize="none"
        placeholder="http://10.0.2.2:3000"
        placeholderTextColor={colors.textSecondary}
      />
      <Pressable style={styles.secondaryBtn} onPress={saveApiUrl}>
        <Text style={styles.secondaryText}>保存 API 地址</Text>
      </Pressable>

      {!isCloudMode ? (
        <>
          <Text style={[styles.section, { marginTop: spacing.xl }]}>
            答辩演示（仅离线）
          </Text>
          <Text style={styles.desc}>
            当前共 {items.length} 条物证。答辩前可一键导入演示数据，或清空后现场新建。
          </Text>
          <Pressable style={styles.primaryBtn} onPress={handleImport}>
            <Text style={styles.primaryText}>导入演示数据（5 条）</Text>
          </Pressable>
          <Pressable style={styles.dangerBtn} onPress={handleClear}>
            <Text style={styles.dangerText}>清空全部物证</Text>
          </Pressable>
        </>
      ) : null}

      <Text style={styles.hint}>
        部署文档：docs/DEPLOY_RUNBOOK.md · API：docs/BACKEND_API_SPEC.md
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  desc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  warn: {
    fontSize: 13,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  dangerBtn: {
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  dangerText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 16,
  },
  hint: {
    marginTop: spacing.xl,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
