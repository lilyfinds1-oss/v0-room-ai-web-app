import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { put } from '@vercel/blob'

export interface Product3D {
  glbUrl?: string
  imageUrl?: string
  width?: number
  height?: number
  depth?: number
}

export interface RoomContext {
  roomWidth: number
  roomHeight: number
  depthMapUrl?: string
  floorLevel?: number
  cameraDistance?: number
  cameraHeight?: number
}

export interface RenderOptions {
  roomAspect: number
  product: Product3D
  position: { x: number; y: number; z: number }
  rotation?: number
  camera?: RoomContext
}

// Headless Three.js renderer
function createRenderer(width: number, height: number) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(1)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  return renderer
}

// Estimate camera from room dimensions and depth map
function estimateCamera(ctx: RoomContext): { position: THREE.Vector3; target: THREE.Vector3 } {
  const aspect = ctx.roomWidth / ctx.roomHeight
  
  // Default camera setup based on room analysis
  // Typical room: camera at ~1.5m height, looking down at ~15 degrees
  const cameraHeight = ctx.cameraHeight || 1.5
  const cameraDistance = ctx.cameraDistance || 3
  const floorLevel = ctx.floorLevel || 0
  
  return {
    position: new THREE.Vector3(0, cameraHeight, cameraDistance),
    target: new THREE.Vector3(0, floorLevel + 0.5, 0),
  }
}

export async function renderProductSnapshot(options: RenderOptions): Promise<{
  imageUrl: string
  maskUrl: string
}> {
  const { roomAspect, product, position, camera } = options
  
  const width = 1024
  const height = Math.round(width / roomAspect)
  
  const renderer = createRenderer(width, height)
  const scene = new THREE.Scene()
  
  // Set up camera
  const cam = camera ? estimateCamera(camera) : { 
    position: new THREE.Vector3(0, 1.5, 2.5), 
    target: new THREE.Vector3(0, 0.5, 0) 
  }
  
  const threeCamera = new THREE.PerspectiveCamera(50, roomAspect, 0.1, 100)
  threeCamera.position.copy(cam.position)
  threeCamera.lookAt(cam.target)
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(2, 3, 2)
  scene.add(directionalLight)
  
  // Add product from GLB or image
  if (product.glbUrl) {
    // Load GLB model
    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(product.glbUrl)
    const model = gltf.scene
    
    // Scale model based on dimensions
    if (product.width) {
      const scale = product.width / 2  // Approximate
      model.scale.setScalar(scale * 0.5)
    }
    
    model.position.set(position.x, position.y, position.z)
    if (position.z === undefined) model.position.z = 0
    
    scene.add(model)
  } else if (product.imageUrl) {
    // Use transparent image as plane
    const textureLoader = new THREE.TextureLoader()
    const texture = await textureLoader.loadAsync(product.imageUrl)
    texture.flipY = false
    
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    })
    
    const aspect = (product.width || 1) / (product.height || 1)
    const planeWidth = product.width ? product.width / 2 : 1
    const planeHeight = planeWidth / aspect
    
    const plane = new THREE.PlaneGeometry(planeWidth, planeHeight)
    const mesh = new THREE.Mesh(plane, planeMaterial)
    mesh.position.set(position.x, position.y, position.z || 0)
    scene.add(mesh)
  }
  
  // Render snapshot
  renderer.render(scene, threeCamera)
  const imageBuffer = renderer.domElement.toDataURL('image/png')
  
  // Create mask (white product, black background)
  scene.background = new THREE.Color(0x000000)
  
  // Replace materials with white for mask
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const oldMat = obj.material as THREE.MeshMaterial
      if (oldMat) {
        obj.material = new THREE.MeshBasicMaterial({ color: 0xffffff })
      }
    }
  })
  
  renderer.render(scene, threeCamera)
  const maskBuffer = renderer.domElement.toDataURL('image/png')
  
  // Upload both to blob
  const [imageBlob, maskBlob] = await Promise.all([
    put(`snapshots/${Date.now()}-image.png`, Buffer.from(imageBuffer.split(',')[1], 'base64'), {
      contentType: 'image/png', access: 'public'
    }),
    put(`masks/${Date.now()}-mask.png`, Buffer.from(maskBuffer.split(',')[1], 'base64'), {
      contentType: 'image/png', access: 'public'
    })
  ])
  
  // Cleanup
  renderer.dispose()
  
  return {
    imageUrl: imageBlob.url,
    maskUrl: maskBlob.url,
  }
}

// Simple version without GLB (use existing transparent images)
export async function renderSimpleSnapshot(options: Omit<RenderOptions, 'camera'>): Promise<string> {
  const { roomAspect, product, position } = options
  
  const width = 800
  const height = Math.round(width / roomAspect)
  
  const renderer = createRenderer(width, height)
  const scene = new THREE.Scene()
  
  const threeCamera = new THREE.PerspectiveCamera(50, roomAspect, 0.1, 100)
  threeCamera.position.set(0, 1.2, 2)
  threeCamera.lookAt(0, 0.5, 0)
  
  // Add ambient light
  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  
  if (product.imageUrl) {
    const textureLoader = new THREE.TextureLoader()
    const texture = await textureLoader.loadAsync(product.imageUrl)
    texture.flipY = false
    
    const aspect = (product.width || 30) / (product.height || 30)
    const displayWidth = (product.width || 30) / 20
    const displayHeight = displayWidth / aspect
    
    const plane = new THREE.PlaneGeometry(displayWidth, displayHeight)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    })
    
    const mesh = new THREE.Mesh(plane, material)
    // Convert normalized position (0-1) to scene coordinates
    mesh.position.set(
      (position.x - 0.5) * 4,  // Map 0-1 to -2 to 2
      position.y * 1.5,
      position.z === 'far' ? -1.5 : position.z === 'near' ? 1.5 : 0
    )
    
    scene.add(mesh)
  }
  
  renderer.render(scene, threeCamera)
  const dataUrl = renderer.domElement.toDataURL('image/png')
  
  const blob = await put(`snapshots/${Date.now()}.png`, Buffer.from(dataUrl.split(',')[1], 'base64'), {
    contentType: 'image/png', access: 'public'
  })
  
  renderer.dispose()
  
  return blob.url
}