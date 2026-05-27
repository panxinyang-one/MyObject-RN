import { Alert, PermissionsAndroid, Platform } from 'react-native';

async function requestAndroid(
  permission: (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS],
  rationale: { title: string; message: string },
): Promise<boolean> {
  const already = await PermissionsAndroid.check(permission);
  if (already) {
    return true;
  }
  const result = await PermissionsAndroid.request(permission, {
    title: rationale.title,
    message: rationale.message,
    buttonPositive: '允许',
    buttonNegative: '拒绝',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/** Manifest 声明了 CAMERA 时，必须先申请运行时权限（image-picker 文档要求）。 */
export async function ensureCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  return requestAndroid(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: '相机权限',
    message: '拍照记录物品需要访问相机，请点「允许」。',
  });
}

export async function ensurePhotoLibraryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  const sdk = Platform.Version;
  if (sdk >= 33) {
    return requestAndroid(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES, {
      title: '相册权限',
      message: '从相册选择照片需要读取图片权限，请点「允许」。',
    });
  }
  return requestAndroid(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
    title: '相册权限',
    message: '从相册选择照片需要存储读取权限，请点「允许」。',
  });
}

export function showPermissionDeniedAlert(kind: 'camera' | 'library'): void {
  Alert.alert(
    kind === 'camera' ? '无法使用相机' : '无法访问相册',
    '请在 设置 → 应用 → 物证库 → 权限 中开启相机/相册后重试。',
  );
}
