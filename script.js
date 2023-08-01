const relationships = [
  {
    source: "Vitamin A",
    relationship: "Transport",
    target: "Vitamin D3"
  },
  {
    source: "Vitamin D3",
    relationship: "Absorption",
    target: "Calcium"
  },
  {
    source: "Vitamin D3",
    relationship: "Half-life",
    target: "Increased"
  },
  {
    source: "Vitamin B2",
    relationship: "Activation",
    target: "Vitamin B12"
  },
  {
    source: "Vitamin B2",
    relationship: "Metabolism",
    target: "Calcium, Phosphorus, Magnesium"
  },
  {
    source: "Vitamin B6",
    relationship: "Absorption",
    target: "Magnesium"
  },
  {
    source: "Vitamin B6",
    relationship: "Activation",
    target: "Vitamin B6"
  },
  {
    source: "Boron",
    relationship: "Absorption",
    target: "Calcium, Magnesium, Vitamin B6"
  },
  {
    source: "Vitamin K2",
    relationship: "Bone Transport",
    target: "Calcium, Phosphorus"
  }
];

// Color palette for nutrients and relationships
const nutrientColors = {
  "Vitamin A": 0xff0000,
  "Vitamin D3": 0x00ff00,
  "Vitamin B2": 0x0000ff,
  "Vitamin B6": 0xffff00,
  "Boron": 0x00ffff,
  "Vitamin K2": 0xff00ff
};

const relationshipColors = {
  "Transport": 0xff0000,
  "Absorption": 0x00ff00,
  "Half-life": 0x0000ff,
  "Activation": 0xffff00,
  "Metabolism": 0x00ffff,
  "Bone Transport": 0xff00ff
};

// Create a 3D scene
const scene = new THREE.Scene();

// Create a 3D camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 0, 1000);

// Create a 3D renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('visualization').appendChild(renderer.domElement);

// Helper function to create text labels
function createTextLabel(text, color) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const fontSize = 20;
  context.font = `${fontSize}px Arial`;
  const textWidth = context.measureText(text).width;
  canvas.width = textWidth;
  canvas.height = fontSize;
  context.font = `${fontSize}px Arial`;
  context.fillStyle = color;
  context.fillText(text, 0, fontSize);
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(textWidth, fontSize), material);
  label.scale.set(0.1, 0.1, 0.1); // Adjust label size
  return label;
}

// Create relationships in 3D space
const labels = [];
for (const rel of relationships) {
  const sourceSphere = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshBasicMaterial({ color: nutrientColors[rel.source] }));
  const targetSpheres = rel.target.split(',').map(t => new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshBasicMaterial({ color: nutrientColors[t.trim()] })));

  sourceSphere.position.set(-100, 0, 0);
  targetSpheres.forEach((target, index) => {
    target.position.set(100, 50 * (index - targetSpheres.length / 2), 0);
  });

  scene.add(sourceSphere, ...targetSpheres);

  const lineMaterial = new THREE.LineBasicMaterial({ color: relationshipColors[rel.relationship] });
  targetSpheres.forEach(target => {
    const points = [sourceSphere.position.clone(), target.position.clone()];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    // Create text label for the relationship
    const labelPosition = sourceSphere.position.clone().lerp(target.position, 0.5);
    const relationshipLabel = createTextLabel(rel.relationship, relationshipColors[rel.relationship]);
    relationshipLabel.position.copy(labelPosition);
    labels.push(relationshipLabel);
    scene.add(relationshipLabel);
  });

  // Create text label for the nutrient
  const nutrientLabel = createTextLabel(rel.source, nutrientColors[rel.source]);
  nutrientLabel.position.copy(sourceSphere.position);
  labels.push(nutrientLabel);
  scene.add(nutrientLabel);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  labels.forEach(label => {
    label.lookAt(camera.position);
  });
  renderer.render(scene, camera);
}

animate();