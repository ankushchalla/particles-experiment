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
    numRings: 10,
    countMin: 1000,
    countMax: 10000,
    radiusMin: 3,
    radiusMax: 7,
    yMin: -10,
    yMax: 10,
    hslMin: 190,
    hslMax: 360,
    rotationScaler: .05,
    cameraOrientation: 'front',
    theme: 'night',
    fullscreen: false
}
function dispose() {
    for (const particles of allParticles) {
        particles.geometry.dispose()
        particles.material.dispose()
        scene.remove(particles)
    }
}
gui.add(parameters, 'theme', ['night', 'day', 'ocean'])
    .onChange(theme => {
        if (theme === 'night') {
            dispose()
            parameters.hslMin = 190
            parameters.hslMax = 360
            gui.controllers.forEach(controller => controller.updateDisplay())
            allParticles = createAllParticles(parameters)
            scene.add(...allParticles)
        } else if (theme === 'day') {
            dispose()
            parameters.hslMin = 0
            parameters.hslMax = 60
            gui.controllers.forEach(controller => controller.updateDisplay())
            allParticles = createAllParticles(parameters)
            scene.add(...allParticles)
        } else if (theme === 'ocean') {
            dispose()
            parameters.hslMin = 150
            parameters.hslMax = 250
            gui.controllers.forEach(controller => controller.updateDisplay())
            allParticles = createAllParticles(parameters)
            scene.add(...allParticles)
        }
    })
gui.add(parameters, 'cameraOrientation', ['front', 'above', 'below', 'inside'])
    .onChange(position => {
        controls.target = new THREE.Vector3(0,0,0)
        if (position === 'front') {
            camera.position.y = 0
            camera.position.z = 12
        }
        else if (position === 'above') {
            camera.position.y = 12
            camera.position.z = 0
        }
        else if (position === 'below') {
            camera.position.y = - 12
            camera.position.z = 0
        }
        else if (position === 'inside') {
            controls.target = new THREE.Vector3(0,0,-.5)
            camera.position.y = 0
            camera.position.z = 0

        }
    })
gui.add(parameters, 'numRings')
    .step(1)
    .min(1)
    .max(30)
    .onChange(numRings => {
        dispose()
        const newParameters = {
            numRings,
            ...parameters
        }
        allParticles = createAllParticles(newParameters)
        scene.add(...allParticles)
    })
gui.add(parameters, 'radiusMax')
    .step(1)
    .min(1)
    .max(30)
    .onChange(radiusMax => {
        dispose()
        const newParameters = {
            radiusMax,
            ...parameters
        }
        allParticles = createAllParticles(newParameters)
        scene.add(...allParticles)
    })
gui.add(parameters, 'hslMin')
    .step(.25)
    .min(0)
    .max(360)
    .onChange(hslMin => {
        dispose()
        const newParameters = {
            hslMin,
            ...parameters
        }
        allParticles = createAllParticles(newParameters)
        scene.add(...allParticles)
    })
gui.add(parameters, 'hslMax')
    .step(.25)
    .min(0)
    .max(360)
    .onChange(hslMax => {
        dispose()
        const newParameters = {
            hslMax,
            ...parameters
        }
        allParticles = createAllParticles(newParameters)
        scene.add(...allParticles)
    })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
// Create a particle with randomly generated parameters
function random(min, max) {
    return Math.random() * (max - min) + min
}
function createRandomParticleData(parameters) {
    const count = random(parameters.countMin, parameters.countMax)
    const radius = random(parameters.radiusMin, parameters.radiusMax)
    const randHsl = random(parameters.hslMin, parameters.hslMax)
    const color = new THREE.Color(`hsl(${randHsl}, 98%, 49%)`)
    let yMin = random(parameters.yMin, parameters.yMax)
    let yMax = random(parameters.yMin, parameters.yMax)
    if (yMin > yMax) [yMin, yMax] = [yMax, yMin]
    return { count, radius, yMin, yMax, color }
}
function createPositions(count, radius, yMin, yMax) {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < positions.length; i += 3) {
        const x = i
        const y = i + 1
        const z = i + 2
        const angle = Math.random() * 2 * Math.PI
        positions[x] = Math.sin(angle) * radius
        const height = yMax - yMin
        positions[y] = yMin + (Math.random() * height)
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
function createAllParticles(parameters) {
    const allParticles = []
    for (let i = 0; i < parameters.numRings; i++) {
        const particles = createRandomParticleData(parameters)
        const positions = createPositions(particles.count, particles.radius, particles.yMin, particles.yMax)
        const particlesGeometry = createParticleGeometry(positions)
        const particlesMaterial = createParticlesMaterial(particles.color)
        const particleSet = new THREE.Points(particlesGeometry, particlesMaterial)
        allParticles.push(particleSet)
    }
    return allParticles
}

let allParticles = createAllParticles(parameters)
scene.add(...allParticles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
function handleResize() {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
window.addEventListener('resize', handleResize)


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

camera.position.z = 12
// camera.position.y = 10
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

    for (const particle of allParticles) {
        particle.rotation.y = elapsedTime * parameters.rotationScaler
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()