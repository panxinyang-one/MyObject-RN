import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PRESET_TAGS } from '../constants/labels';
import { useItems } from '../context/ItemsContext';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList } from '../types/item';
import {
  ensureCameraPermission,
  ensurePhotoLibraryPermission,
  showPermissionDeniedAlert,
} from '../utils/mediaPermissions';

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

export function AddItemScreen({ navigation, route }: Props) {
  const { addItem, updateItem, getItemById } = useItems();
  const editId = route.params?.itemId;
  const editing = editId ? getItemById(editId) : undefined;

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [saving, setSaving] = useState(false);
  const autoCameraDone = useRef(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setLocation(editing.location);
      setNote(editing.note);
      setImageUri(editing.imageUri);
      setTags(editing.tags);
    }
  }, [editing]);

  const handleImageResult = useCallback((response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }
    if (response.errorCode) {
      const detail = response.errorMessage ?? response.errorCode;
      const hint =
        response.errorCode === 'camera_unavailable'
          ? '\n\n模拟器可在 AVD 设置里启用虚拟相机，或改用「相册」选图。'
          : response.errorCode === 'permission'
            ? '\n\n请在系统设置中为本应用开启相机/相册权限。'
            : '';
      Alert.alert('无法获取照片', `${detail}${hint}`);
      return;
    }
    const uri = response.assets?.[0]?.uri;
    if (uri) {
      setImageUri(uri);
    }
  }, []);

  const pickFromLibrary = useCallback(async () => {
    const ok = await ensurePhotoLibraryPermission();
    if (!ok) {
      showPermissionDeniedAlert('library');
      return;
    }
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, handleImageResult);
  }, [handleImageResult]);

  const takePhoto = useCallback(async () => {
    const ok = await ensureCameraPermission();
    if (!ok) {
      showPermissionDeniedAlert('camera');
      return;
    }
    launchCamera(
      { mediaType: 'photo', quality: 0.8, saveToPhotos: false },
      handleImageResult,
    );
  }, [handleImageResult]);

  useEffect(() => {
    if (
      !route.params?.openCamera ||
      editId ||
      autoCameraDone.current
    ) {
      return;
    }
    autoCameraDone.current = true;
    takePhoto().catch(() => {});
  }, [route.params?.openCamera, editId, takePhoto]);

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (!t) {
      return;
    }
    if (!tags.includes(t)) {
      setTags(prev => [...prev, t]);
    }
    setCustomTag('');
  };

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('请填写名称', '给物品起个名字，方便以后搜索。');
      return;
    }
    if (!location.trim()) {
      Alert.alert('请填写位置', '例如：书桌抽屉、床帘挂钩袋。');
      return;
    }
    if (!imageUri) {
      Alert.alert('请添加照片', '拍一张或从相册选一张，作为物证。');
      return;
    }

    const payload = {
      name: name.trim(),
      location: location.trim(),
      note: note.trim(),
      imageUri,
      tags,
      isPinned: editing?.isPinned ?? false,
    };

    setSaving(true);
    try {
      if (editId && editing) {
        await updateItem(editId, payload);
      } else {
        await addItem(payload);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert(
        '保存失败',
        e instanceof Error ? e.message : '请检查网络与 API 地址（设置页）',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>物证照片</Text>
      {imageUri ? (
        <Pressable onPress={takePhoto}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          <Text style={styles.retakeHint}>点击照片可重新拍摄</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.previewPlaceholder} onPress={takePhoto}>
          <Text style={styles.placeholderEmoji}>📷</Text>
          <Text style={styles.placeholderText}>点这里拍照</Text>
          <Text style={styles.placeholderSub}>或下方选择相册</Text>
        </Pressable>
      )}
      <View style={styles.row}>
        <Pressable style={styles.secondaryBtn} onPress={takePhoto}>
          <Text style={styles.secondaryBtnText}>拍照</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={pickFromLibrary}>
          <Text style={styles.secondaryBtnText}>相册</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>名称 *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="例如：氮化镓充电器"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>位置 *</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="例如：书桌右侧抽屉"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>备注</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={note}
        onChangeText={setNote}
        placeholder="补充说明（可选）"
        placeholderTextColor={colors.textSecondary}
        multiline
      />

      <Text style={styles.label}>标签（点选添加）</Text>
      <View style={styles.presetRow}>
        {PRESET_TAGS.map(tag => {
          const active = tags.includes(tag);
          return (
            <Pressable
              key={tag}
              style={[styles.presetChip, active && styles.presetChipActive]}
              onPress={() => toggleTag(tag)}>
              <Text
                style={[
                  styles.presetChipText,
                  active && styles.presetChipTextActive,
                ]}>
                {tag}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.selectedTags}>
        {tags.map(t => (
          <Pressable key={t} onPress={() => toggleTag(t)} style={styles.selectedChip}>
            <Text style={styles.selectedChipText}>{t} ×</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.customTagRow}>
        <TextInput
          style={[styles.input, styles.flex]}
          value={customTag}
          onChangeText={setCustomTag}
          placeholder="自定义标签"
          placeholderTextColor={colors.textSecondary}
          onSubmitEditing={addCustomTag}
        />
        <Pressable style={styles.addTagBtn} onPress={addCustomTag}>
          <Text style={styles.addTagText}>添加</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.primaryBtn, saving && styles.primaryBtnDisabled]}
        onPress={submit}
        disabled={saving}>
        <Text style={styles.primaryBtnText}>
          {saving ? '保存中…' : editId ? '保存修改' : '保存物证'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  previewPlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  placeholderSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  retakeHint: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.text,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  selectedChipText: {
    color: '#fff',
    fontSize: 13,
  },
  customTagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  addTagBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.chip,
    borderRadius: radius.md,
  },
  addTagText: {
    color: colors.primary,
    fontWeight: '600',
  },
  primaryBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryBtnDisabled: {
    opacity: 0.65,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetChip: {
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetChipText: {
    color: colors.chipText,
    fontSize: 13,
  },
  presetChipTextActive: {
    color: '#fff',
  },
});
