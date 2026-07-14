import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AnimationMixer, Box3, MathUtils, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MetaRingsGrid } from './AbstractVisuals';

const CHARACTER_MODEL_URL = `${import.meta.env.BASE_URL}models/poly/poly.glb`;
const CHARACTER_FLOOR_Y = -3.02;
const CHARACTER_TARGET_HEIGHT = 3.52;
const CHARACTER_FLOAT_AMPLITUDE = 0.07;
const CHARACTER_LOOK_AT_Y = -1.2;

function CharacterModel() {
  const group = useRef(null);
  const mixerRef = useRef(null);
  const { scene, animations } = useLoader(GLTFLoader, CHARACTER_MODEL_URL);
  const preparedScene = useMemo(() => {
    scene.traverse((node) => {
      if ('frustumCulled' in node) {
        node.frustumCulled = false;
      }
    });

    return scene;
  }, [scene]);
  const fittedModel = useMemo(() => {
    const bounds = new Box3().setFromObject(preparedScene);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const scale = CHARACTER_TARGET_HEIGHT / size.y;

    return {
      scale,
      offsetX: -center.x * scale,
      offsetY: -bounds.min.y * scale,
      offsetZ: -center.z * scale,
    };
  }, [preparedScene]);

  useEffect(() => {
    const mixer = new AnimationMixer(preparedScene);
    const idleClip = animations.find((clip) => clip.name.includes('Idle')) ?? animations[0];
    const idleAction = idleClip ? mixer.clipAction(idleClip) : null;

    mixerRef.current = mixer;
    idleAction?.reset().fadeIn(0.35).play();

    return () => {
      idleAction?.fadeOut(0.24);
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [animations, preparedScene]);

  useFrame((state, delta) => {
    if (!group.current) {
      return;
    }

    const targetRotationY = state.pointer.x * 0.34;
    const targetRotationX = state.pointer.y * -0.12;
    const floatOffset = CHARACTER_FLOOR_Y + Math.sin(state.clock.elapsedTime * 1.45) * CHARACTER_FLOAT_AMPLITUDE;

    mixerRef.current?.update(delta);
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, targetRotationY, 4, delta);
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, targetRotationX, 4, delta);
    group.current.position.y = MathUtils.damp(group.current.position.y, floatOffset, 4, delta);
  });

  return (
    <group ref={group} position={[0, CHARACTER_FLOOR_Y, 0]}>
      <group
        position={[fittedModel.offsetX, fittedModel.offsetY, fittedModel.offsetZ]}
        scale={fittedModel.scale}
      >
        <primitive object={preparedScene} />
      </group>
    </group>
  );
}

function CharacterScene() {
  return (
    <Canvas
      className="character-canvas"
      camera={{ fov: 31, position: [0, 1.45, 6.25] }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => {
        camera.lookAt(0, CHARACTER_LOOK_AT_Y, 0);
      }}
    >
      <ambientLight intensity={1.5} color="#fff0de" />
      <directionalLight intensity={2.1} color="#ffd3aa" position={[3.8, 5.2, 5.5]} />
      <directionalLight intensity={0.95} color="#98ab76" position={[-3.6, 2.8, -2.4]} />
      <pointLight intensity={10} color="#f28b50" position={[0, 1.2, 3.2]} distance={10} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CHARACTER_FLOOR_Y - 0.03, 0]}>
        <circleGeometry args={[1.62, 64]} />
        <meshBasicMaterial color="#f2b888" opacity={0.16} transparent />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CHARACTER_FLOOR_Y - 0.02, 0]}>
        <ringGeometry args={[1.5, 1.74, 64]} />
        <meshBasicMaterial color="#f7ddbb" opacity={0.14} transparent />
      </mesh>

      <Suspense fallback={null}>
        <CharacterModel />
      </Suspense>
    </Canvas>
  );
}

export default function HeroCharacter({ title, description, meta }) {
  return (
    <article className="feature-card character-card">
      <div className="character-copy">
        <div className="character-topline">
          <span className="card-tag">3D PRESENCE</span>
          <span className="character-credit">Imported Model</span>
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="character-stage" aria-label="默认主页 3D 人物展示">
        <div className="character-stage-glow character-stage-glow-one" aria-hidden="true" />
        <div className="character-stage-glow character-stage-glow-two" aria-hidden="true" />
        <div className="character-hud character-hud-top" aria-hidden="true">
          <span>Custom Hero</span>
          <span>3D Preview</span>
        </div>
        <div className="character-hud character-hud-bottom" aria-hidden="true">
          <span>Cursor Follow</span>
          <span>Warm Editorial</span>
        </div>
        <CharacterScene />
      </div>

      <MetaRingsGrid items={meta} />
    </article>
  );
}

useLoader.preload(GLTFLoader, CHARACTER_MODEL_URL);
