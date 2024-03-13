import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

const gui = new GUI()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particlesTexture = textureLoader.load('/textures/particles/1.png')

/**
 * Base
 */
// Debug
const parameters = {
    radius: 5,
    levels: 3,
    radiusMin: 3,
    radiusMax: 7
}
// gui.add(parameters, 'radius')
//     .step(1)
//     .min(1)
//     .max(20)
//     .onChange(newRadius => {
//         particles.geometry.dispose()
//         const positions = createPositions(5000, newRadius, 10)
//         particles.geometry = createParticleGeometry(positions)
//     })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
function createPositions(count, radius, height) {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < positions.length; i += 3) {
        const x = i 
        const y = i + 1
        const z = i + 2
        const angle = Math.random() * 2 * Math.PI
        positions[x] = Math.sin(angle) * radius
        positions[y] = (Math.random() - .5) * 2 * height
        positions[z] = Math.cos(angle) * radius
    }
    return positions
}
function createParticleGeometry(positions) {
    const particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return particlesGeometry
}
function createParticlesMaterial(color) {
    const particlesMaterial = new THREE.PointsMaterial()
    particlesMaterial.transparent = true
    particlesMaterial.alphaMap = particlesTexture
    particlesMaterial.size = 0.1
    particlesMaterial.sizeAttenuation = true
    particlesMaterial.depthWrite = false
    particlesMaterial.color = color
    return particlesMaterial
}
// Particles set 1
const particlesOne = {
    count: 5000,
    radius: 5,
    height: 10, 
    color: new THREE.Color('#ff88cc')
}
const particleData = [particlesOne]
const particles = []
for (const particle of particleData) {
    const positions = createPositions(particle.count, particle.radius, particle.height)
    const particlesGeometry = createParticleGeometry(positions)
    const particlesMaterial = createParticlesMaterial(particle.color)
    const particleSet = new THREE.Points(particlesGeometry, particlesMaterial)
    particles.push(particleSet)
}

scene.add(...particles)

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.MeshBasicMaterial({ color: '#a9c388' })
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
// scene.add(floor)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

camera.position.z = 1   
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// renderer.setClearColor('#1e1f29')

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()