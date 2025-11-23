import { Camera, CameraView, type CameraMountError } from "expo-camera";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../assets/colors";
import AppButton from "./AppButton";

export type TripPhotoPhase = "start" | "end";

interface TripPhotoCaptureProps {
  phase: TripPhotoPhase;
  photoUri: string | null;
  onPhotoCaptured: (uri: string) => void;
  buttonDisabled?: boolean;
  helperText?: string;
}

const SETTINGS_MESSAGE =
  "Enable camera access in your device settings to capture trip photos.";

export default function TripPhotoCapture({
  phase,
  photoUri,
  onPhotoCaptured,
  buttonDisabled = false,
  helperText,
}: TripPhotoCaptureProps) {
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");

  const phaseLabel = useMemo(
    () => (phase === "start" ? "Start Photo" : "End Photo"),
    [phase]
  );

  const buttonLabel = photoUri ? `Retake ${phaseLabel}` : `Take ${phaseLabel}`;

  const ensurePermissionAsync = useCallback(async () => {
    const permissionStatus = await Camera.getCameraPermissionsAsync();

    if (permissionStatus.granted) {
      return true;
    }

    if (!permissionStatus.canAskAgain) {
      Alert.alert("Camera Disabled", SETTINGS_MESSAGE);
      return false;
    }

    const requestResult = await Camera.requestCameraPermissionsAsync();
    if (!requestResult.granted) {
      Alert.alert(
        "Camera Permission Needed",
        requestResult.canAskAgain
          ? "We need camera access to capture required trip photos."
          : SETTINGS_MESSAGE
      );
      return false;
    }

    return true;
  }, []);

  const openCameraAsync = useCallback(async () => {
    if (buttonDisabled) {
      return;
    }

    setCameraError(null);
    const hasPermission = await ensurePermissionAsync();
    if (!hasPermission) {
      return;
    }

    setCameraVisible(true);
  }, [buttonDisabled, ensurePermissionAsync]);

  const closeCamera = useCallback(() => {
    setCameraVisible(false);
    setIsCapturing(false);
  }, []);

  const handleCaptureAsync = useCallback(async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      setCameraError(null);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });

      if (photo?.uri) {
        onPhotoCaptured(photo.uri);
        closeCamera();
      } else {
        setCameraError("We couldn't capture that photo. Please try again.");
      }
    } catch (error) {
      console.error("Camera capture error", error);
      setCameraError("We couldn't capture that photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [closeCamera, isCapturing, onPhotoCaptured]);

  return (
    <View style={styles.wrapper}>
      <AppButton
        onPress={openCameraAsync}
        size="md"
        variant="outline"
        shape="rounded"
        disabled={buttonDisabled}
        style={styles.captureButton}
      >
        {buttonLabel}
      </AppButton>

      {photoUri ? (
        <View style={styles.photoStatusRow}>
          <Text style={styles.photoStatusText}>Photo ready ✔️</Text>
          <Image source={{ uri: photoUri }} style={styles.thumbnail} />
        </View>
      ) : (
        <Text style={styles.photoHelperText}>
          {helperText || "A trip photo is required before you continue."}
        </Text>
      )}

      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={closeCamera}
        presentationStyle="fullScreen"
      >
        <View style={styles.modalContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            mode="picture"
            ref={(ref: CameraView | null) => {
              cameraRef.current = ref;
            }}
            onMountError={(error: CameraMountError) => {
              console.error("Camera mount error", error);
              setCameraError("Unable to start the camera. Please try again.");
            }}
          />

          {cameraError ? (
            <Text style={styles.cameraErrorText}>{cameraError}</Text>
          ) : null}

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={[styles.secondaryButton, styles.cancelButton]}
              onPress={closeCamera}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setFacing((prev) => (prev === "back" ? "front" : "back"))
              }
              style={[styles.secondaryButton, styles.flipButton]}
            >
              <Text style={styles.secondaryButtonText}>Flip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shutterButton}
              onPress={handleCaptureAsync}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
  },
  captureButton: {
    marginBottom: 12,
  },
  photoStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.successLighter,
    borderWidth: 1,
    borderColor: COLORS.successLight,
    gap: 12,
  },
  photoStatusText: {
    color: COLORS.success,
    fontWeight: "600",
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  photoHelperText: {
    color: COLORS.warning,
    fontSize: 13,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "rgba(15, 23, 42, 0.3)",
  },
  cancelButton: {
    backgroundColor: "rgba(239, 68, 68, 0.4)",
  },
  flipButton: {
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  cameraErrorText: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 13,
  },
});
