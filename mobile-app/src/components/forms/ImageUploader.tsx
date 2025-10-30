import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Button, LoadingState } from '@components/common';
import { uploadImage } from '@api/endpoints/uploads';
import { IMAGE_UPLOAD } from '@constants';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (imageIds: number[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

interface UploadedImage {
  id: number;
  url: string;
  localUri?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = IMAGE_UPLOAD.MAX_IMAGES,
  disabled = false,
}) => {
  const tamil = isTamil();
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: maxImages - uploadedImages.length,
        quality: IMAGE_UPLOAD.QUALITY,
        maxWidth: IMAGE_UPLOAD.MAX_WIDTH,
        maxHeight: IMAGE_UPLOAD.MAX_HEIGHT,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert(t('errors.title'), t('errors.imagePicker'));
        return;
      }

      if (result.assets) {
        await handleUpload(result.assets);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(t('errors.title'), t('errors.imagePicker'));
    }
  };

  const handleUpload = async (assets: Asset[]) => {
    setUploading(true);

    try {
      const uploads = await Promise.all(
        assets.map(async (asset) => {
          if (!asset.uri) return null;

          // Check file size
          if (asset.fileSize && asset.fileSize > IMAGE_UPLOAD.MAX_SIZE) {
            Alert.alert(
              t('errors.title'),
              t('errors.imageTooLarge', {
                max: IMAGE_UPLOAD.MAX_SIZE / 1024 / 1024,
              })
            );
            return null;
          }

          // Create FormData
          const formData = new FormData();
          formData.append('files', {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `image_${Date.now()}.jpg`,
          } as any);

          // Upload
          const response = await uploadImage(formData);
          return {
            id: response[0].id,
            url: response[0].url,
            localUri: asset.uri,
          };
        })
      );

      const successfulUploads = uploads.filter(
        (upload): upload is UploadedImage => upload !== null
      );

      const newImages = [...uploadedImages, ...successfulUploads];
      setUploadedImages(newImages);
      onImagesChange(newImages.map((img) => img.id));
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(t('errors.title'), t('errors.imageUpload'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    Alert.alert(
      t('common.confirm'),
      t('imageUploader.confirmRemove'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => {
            const newImages = uploadedImages.filter((_, i) => i !== index);
            setUploadedImages(newImages);
            onImagesChange(newImages.map((img) => img.id));
          },
        },
      ]
    );
  };

  const canAddMore = uploadedImages.length < maxImages && !disabled;

  return (
    <View style={styles.container}>
      <Text
        style={[
          tamil ? theme.tamilTypography.label : theme.englishTypography.label,
          styles.label,
        ]}
      >
        {t('imageUploader.title')}
      </Text>

      {uploadedImages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
        >
          {uploadedImages.map((image, index) => (
            <View key={image.id} style={styles.imageWrapper}>
              <Image
                source={{ uri: image.localUri || image.url }}
                style={styles.image}
                resizeMode="cover"
              />
              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemoveImage(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {uploading && (
        <LoadingState text={t('imageUploader.uploading')} size="small" />
      )}

      {canAddMore && (
        <Button
          title={t('imageUploader.addImage')}
          onPress={handlePickImage}
          variant="outline"
          loading={uploading}
          disabled={disabled}
          fullWidth
        />
      )}

      <Text
        style={[
          tamil
            ? theme.tamilTypography.caption
            : theme.englishTypography.caption,
          styles.helperText,
        ]}
      >
        {t('imageUploader.helper', {
          current: uploadedImages.length,
          max: maxImages,
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  imagesContainer: {
    marginBottom: theme.spacing.md,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: theme.spacing.sm,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceLight,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  removeButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  helperText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
