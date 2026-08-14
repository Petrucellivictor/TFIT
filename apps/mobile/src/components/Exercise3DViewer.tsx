import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { GLView, type ExpoWebGLRenderingContext } from "expo-gl";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as THREE from "three";
import { ErrorState, IconButton, Skeleton, Stack, useTheme } from "@tfit/ui";
import { buildExerciseScene, CHARACTER_MODEL_URL, type ExerciseScene } from "@/lib/exercise3d";

const MIN_DISTANCE = 1.5;
const MAX_DISTANCE = 8;
const VIEWER_HEIGHT = 280;

export function Exercise3DViewer({ animationUrl, exerciseName }: { animationUrl: string; exerciseName: string }) {
  const theme = useTheme();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isPlaying, setIsPlaying] = useState(true);
  const rotationY = useSharedValue(0);
  const distance = useSharedValue(4);
  const isPlayingRef = useRef(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    if (!CHARACTER_MODEL_URL) {
      console.error("Exercise3DViewer: CHARACTER_MODEL_URL is not configured yet.");
      setStatus("error");
      return;
    }

    let built: ExerciseScene;
    try {
      built = await buildExerciseScene(gl, animationUrl);
    } catch (error) {
      console.error(`Exercise3DViewer failed to load "${exerciseName}"`, error);
      if (mountedRef.current) setStatus("error");
      return;
    }

    if (!mountedRef.current) return;
    setStatus("ready");

    const clock = new THREE.Clock();
    const renderLoop = () => {
      if (!mountedRef.current) return;
      requestAnimationFrame(renderLoop);

      const delta = clock.getDelta();
      if (isPlayingRef.current) built.mixer.update(delta);

      built.camera.position.x = Math.sin(rotationY.value) * distance.value;
      built.camera.position.z = Math.cos(rotationY.value) * distance.value;
      built.camera.position.y = 1.2;
      built.camera.lookAt(0, 1, 0);

      built.renderer.render(built.scene, built.camera);
      gl.endFrameEXP();
    };
    renderLoop();
  };

  const pan = Gesture.Pan().onChange((event) => {
    rotationY.value += event.changeX * 0.01;
  });

  const pinch = Gesture.Pinch().onChange((event) => {
    const next = distance.value / event.scaleChange;
    distance.value = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, next));
  });

  const composedGesture = Gesture.Simultaneous(pan, pinch);

  const togglePlay = () => {
    isPlayingRef.current = !isPlayingRef.current;
    setIsPlaying(isPlayingRef.current);
  };

  if (status === "error") {
    return <ErrorState message="Não conseguimos carregar a demonstração 3D agora." />;
  }

  return (
    <Stack gap="xs">
      <View style={{ height: VIEWER_HEIGHT, borderRadius: theme.radius.soft, overflow: "hidden" }}>
        <GestureDetector gesture={composedGesture}>
          <GLView
            style={{ width: "100%", height: "100%" }}
            onContextCreate={onContextCreate}
            accessibilityLabel={`Demonstração 3D de ${exerciseName}`}
          />
        </GestureDetector>
        {status === "loading" ? (
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
            <Skeleton height={VIEWER_HEIGHT} />
          </View>
        ) : null}
      </View>

      {status === "ready" ? (
        <Stack direction="row" justify="center">
          <IconButton
            icon={<Ionicons name={isPlaying ? "pause" : "play"} size={22} color={theme.colors.text.primary} />}
            accessibilityLabel={isPlaying ? "Pausar demonstração" : "Reproduzir demonstração"}
            variant="surface"
            onPress={togglePlay}
          />
        </Stack>
      ) : null}
    </Stack>
  );
}
