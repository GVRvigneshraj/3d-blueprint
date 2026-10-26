import * as THREE from 'three';
import { useThree, Canvas } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';

const rooms = [
  { id: 'bedroom1', name: 'Bedroom 1', size: [3.81, 2.97], pos: [5.485, 3.355], conn: ['hall'], furniture: ['bed', 'wardrobe'] },
  { id: 'hall', name: 'Hall', size: [4.86, 2.86], pos: [5.485, 6.71 / 2 - 0.3], conn: ['bedroom1', 'bedroom2', 'kitchen', 'toilet1', 'toilet2', 'staircase'], furniture: [] },
  { id: 'kitchen', name: 'Kitchen/Dining', size: [1.83, 3.72], pos: [5.485 - 1.83 / 2, 6.71 - 3.72 - 0.5], conn: ['hall'], furniture: ['table', 'chairs'] },
  { id: 'bedroom2', name: 'Bedroom 2', size: [2.24, 3.16], pos: [5.485 + 3.81 + 0.2, 3.355], conn: ['hall'], furniture: ['bed'] },
  { id: 'toilet1', name: 'Toilet', size: [1.98, 1.22], pos: [5.485 - 0.3, 6.71 / 2 - 2.86 / 2 - 1.98 - 0.3], conn: ['hall'], furniture: ['toilet'] },
  { id: 'toilet2', name: 'Small Toilet', size: [1.5, 1.0], pos: [5.485 + 0.3, 6.71 / 2 + 2.86 / 2 + 0.3], conn: ['hall'], furniture: ['toilet'] },
  { id: 'balcony', name: 'Balcony', size: [2.5, 1.5], pos: [5.485 - 1.5, -0.5], conn: ['hall'], furniture: [] },
  { id: 'staircase', name: 'Staircase', size: [2.0, 1.0], pos: [5.485 - 1.0, 6.71 - 1.5], conn: ['hall'], furniture: [] },
];

function Scene() {
  const { camera } = useThree() as { camera: THREE.PerspectiveCamera };
  useEffect(() => {
    const perspCam = camera;
    perspCam.aspect = window.innerWidth / window.innerHeight;
    perspCam.updateProjectionMatrix();
    return () => {
      window.removeEventListener('resize', () => {
        perspCam.aspect = window.innerWidth / window.innerHeight;
        perspCam.updateProjectionMatrix();
      });
    };
  }, [camera, window.innerWidth, window.innerHeight]);
  return null;
}

const materialLibrary = {
  wood: { color: 0x8b5a2b, roughness: 0.6, metalness: 0.1 },
  concrete: { color: 0x5a5a5a, roughness: 0.8, metalness: 0.2 },
  stone: { color: 0xbfbfbf, roughness: 0.7, metalness: 0.1 },
  tile: { color: 0x4a4a4a, roughness: 0.9, metalness: 0.1 },
};

export default function HouseVisualization() {
  const { camera } = useThree();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showFloorPlan, setShowFloorPlan] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [lightingMode, setLightingMode] = useState<'day' | 'evening' | 'night'>('day');
  const statsRef = useRef<any>(null);
  const clock = useRef(new THREE.Clock());

  useEffect(() => {
    statsRef.current = new Date().getTime();
  }, []);

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    }
  }, []);

  const lightIntensity = lightingMode === 'evening' ? 0.7 : lightingMode === 'night' ? 0.3 : 1.5;

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setShowFloorPlan(false);
  };

  const toggleFloorPlan = () => {
    setShowFloorPlan(!showFloorPlan);
    if (showFloorPlan) { setSelectedRoomId(null); }
  };

  const changeMaterial = (roomId: string, materialKey: string) => {
    setSelectedMaterial(materialKey);
    console.log(`Material changed for ${roomId} to ${materialKey}`);
  };

  const changeLighting = (mode: 'day' | 'evening' | 'night') => {
    setLightingMode(mode);
    console.log(`Lighting changed to ${mode}`);
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || null;

  return (
    <div style={{ overflow: 'hidden', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <Canvas style={{ width: '100%', height: '100%' }}>
        <ambientLight color={0xffffff} intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={lightIntensity} />
        <directionalLight position={[-10, -10, -10]} intensity={lightIntensity} />

        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10, 32, 32]} />
          <meshStandardMaterial color={0xf0e8c5} roughness={0.8} metalness={0.1} />
        </mesh>

        <mesh>
          <boxGeometry args={[10.97, 3.0, 6.71]} />
          <meshStandardMaterial color={0x5a5a5a} />
        </mesh>

        {rooms.map((room) => (
          <mesh key={room.id} position={[room.pos[0], 0, room.pos[1]]}>
            <boxGeometry args={[room.size[0], 0.5, room.size[1]]} />
            <meshStandardMaterial color={0x8b5a2b} opacity={0.3} transparent={true} />
          </mesh>
        ))}
      </Canvas>

      {selectedRoom && (
        <div style={{
          position: 'fixed', top: 100, left: 50, transform: 'translateX(-50%)',
          background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8, padding: 20, color: '#e0e0e0', zIndex: 50, minWidth: 200,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{selectedRoom.name}</div>
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            {selectedRoom.size[0].toFixed(2)}m × {selectedRoom.size[1].toFixed(2)}m
          </div>
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            Area: {Math.round(selectedRoom.size[0] * selectedRoom.size[1])} m²
          </div>
          <p style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
            {selectedRoom.furniture.length > 0 ? 'Has furniture' : 'Empty room'}
          </p>
          <div>
            <span style={{ fontSize: 12, marginRight: 8, color: '#888' }}>Material:</span>
            {[...Object.keys(materialLibrary).map((m, i) => (
              <button
                key={m}
                style={{
                  padding: '4px 8px', margin: '2px', borderRadius: 4,
                  background: selectedMaterial === m ? 'rgba(74,144,226,0.4)' : 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)', color: '#e0e0e0', cursor: 'pointer', fontSize: 11,
                }}
                onClick={() => changeMaterial(selectedRoomId!, m)
                }>
                {m}
              </button>
            ))]}
          </div>
          <div>
            <span style={{ fontSize: 12, marginRight: 8, color: '#888' }}>Lighting:</span>
            <button
              onClick={() => changeLighting('day')}
              style={{ padding: '4px 8px', margin: '2px', borderRadius: 4,
                background: lightingMode === 'day' ? 'rgba(74,144,226,0.4)' : 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)', color: '#e0e0e0', cursor: 'pointer', fontSize: 11 }}
            >
              Day
            </button>
            <button
              onClick={() => changeLighting('evening')}
              style={{ padding: '4px 8px', margin: '2px 4px', borderRadius: 4,
                background: lightingMode === 'evening' ? 'rgba(74,144,226,0.4)' : 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)', color: '#e0e0e0', cursor: 'pointer', fontSize: 11 }}
            >
              Evening
            </button>
            <button
              onClick={() => changeLighting('night')}
              style={{ padding: '4px 8px', margin: '2px 4px', borderRadius: 4,
                background: lightingMode === 'night' ? 'rgba(74,144,226,0.4)' : 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)', color: '#e0e0e0', cursor: 'pointer', fontSize: 11 }}
            >
              Night
            </button>
          </div>
          <button
            onClick={() => { setShowFloorPlan(true); setSelectedRoomId(null); }}
            style={{
              width: '100%', padding: '8px',
              background: 'rgba(74,144,226,0.2)', border: '1px solid rgba(74,144,226,0.4)',
              color: '#4a90e2', borderRadius: 6, cursor: 'pointer', fontSize: 12, marginTop: 12,
            }}
          >
            Return to Floor Plan
          </button>
        </div>
      )}

      {showFloorPlan && (
        <div style={{ position: 'fixed', top: 120, left: 20, bottom: 20, width: 200,
          background: 'rgba(15,15,25,0.8)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: 16, color: '#e0e0e0', zIndex: 50, overflowY: 'auto',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#888' }}>Rooms</div>
          {rooms.map((room) => (
            <div
              key={room.id}
              style={{ padding: 8, margin: 4, borderRadius: 6, cursor: 'pointer',
                borderLeft: selectedRoomId === room.id ? '3px solid #4a90e2' : '3px solid transparent',
                transition: 'border-left 0.2s',
                background: selectedRoomId === room.id ? 'rgba(74,144,226,0.2)' : 'transparent',
              }}
              onClick={() => handleRoomSelect(room.id)}
            >
              <span style={{ fontWeight: 500 }}>{room.name}</span>
              <span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>
                {room.size[0].toFixed(2)}m × {room.size[1].toFixed(2)}m
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 20, left: 20, background: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 4, color: '#e0e0e0', fontSize: 12, zIndex: 50 }}>
        FPS: {statsRef.current ? String(statsRef.current % 60) : '0'}
      </div>
    </div>
  );
}
