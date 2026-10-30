import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sampleRate = 22050
const musicDirectory = path.join(projectRoot, 'public/audio/music')
const effectsDirectory = path.join(projectRoot, 'public/audio/sfx')

function writeWav(filePath, samples) {
  const data = Buffer.alloc(samples.length * 2)
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]))
    data.writeInt16LE(Math.round(sample * 32767), index * 2)
  }

  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  fs.writeFileSync(filePath, Buffer.concat([header, data]))
}

function note(frequency, time, duration, wave = 'sine') {
  if (time < 0 || time >= duration) return 0
  const attack = Math.min(1, time / 0.018)
  const release = Math.min(1, (duration - time) / 0.09)
  const envelope = attack * release * Math.exp(-time * 2.2)
  const phase = 2 * Math.PI * frequency * time
  if (wave === 'square') return Math.sign(Math.sin(phase)) * envelope
  if (wave === 'triangle') return (2 / Math.PI) * Math.asin(Math.sin(phase)) * envelope
  return Math.sin(phase) * envelope
}

function generateMusic(kind, duration = 8) {
  const sampleCount = Math.floor(sampleRate * duration)
  const output = new Float32Array(sampleCount)
  const homeChords = [
    [196, 246.94, 293.66, 392],
    [174.61, 220, 261.63, 349.23],
    [146.83, 220, 293.66, 369.99],
    [164.81, 246.94, 293.66, 392],
  ]
  const adventureChords = [
    [130.81, 196, 261.63, 329.63],
    [110, 164.81, 220, 293.66],
    [123.47, 185, 246.94, 311.13],
    [98, 146.83, 196, 261.63],
  ]
  const arcadeNotes = [
    [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 349.23],
    [220, 293.66, 329.63, 440, 329.63, 293.66, 246.94, 329.63],
  ]

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate
    const loopFade = Math.min(1, time * 8, (duration - time) * 8)
    let value = 0

    if (kind === 'home') {
      const chord = homeChords[Math.floor(time / 2) % homeChords.length]
      const noteTime = time % 0.75
      chord.forEach((frequency, voice) => {
        value += note(frequency, noteTime, 0.58) * (voice === 0 ? 0.11 : 0.045)
      })
      value += Math.sin(2 * Math.PI * (chord[0] / 2) * time) * 0.07
      value += Math.sin(2 * Math.PI * 3300 * time) * Math.sin(2 * Math.PI * 17 * time) * 0.003
    } else if (kind === 'arcade') {
      const sequence = arcadeNotes[Math.floor(time / 4) % arcadeNotes.length]
      const step = Math.floor(time / 0.25) % sequence.length
      const noteTime = time % 0.25
      value += note(sequence[step], noteTime, 0.21, 'triangle') * 0.14
      value += note(sequence[step] / 2, noteTime, 0.22, 'square') * 0.035
      value += Math.sin(2 * Math.PI * 82.41 * time) * 0.045
    } else {
      const chord = adventureChords[Math.floor(time / 2) % adventureChords.length]
      chord.forEach((frequency, voice) => {
        value += Math.sin(2 * Math.PI * frequency * time) * (voice === 0 ? 0.06 : 0.027)
        value += Math.sin(2 * Math.PI * (frequency * 1.003) * time) * 0.008
      })
      const swell = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.12 * time)
      value += Math.sin(2 * Math.PI * 55 * time) * swell * 0.05
    }

    output[index] = value * loopFade
  }

  return output
}

function generateEffect(voices, duration) {
  const sampleCount = Math.floor(sampleRate * duration)
  const output = new Float32Array(sampleCount)

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate
    let value = 0
    voices.forEach((voice) => {
      const localTime = time - voice.start
      if (localTime < 0 || localTime >= voice.duration) return
      const progress = localTime / voice.duration
      const frequency = voice.from + (voice.to - voice.from) * progress
      const tone = note(frequency, localTime, voice.duration, voice.wave || 'sine')
      value += tone * (voice.gain || 0.5)
    })
    output[index] = Math.max(-0.9, Math.min(0.9, value))
  }

  return output
}

fs.mkdirSync(musicDirectory, { recursive: true })
fs.mkdirSync(effectsDirectory, { recursive: true })

for (const theme of ['home', 'arcade', 'adventure']) {
  writeWav(path.join(musicDirectory, `${theme}.wav`), generateMusic(theme))
}

const effects = {
  'ui-click': [0.09, [{ start: 0, duration: 0.08, from: 760, to: 1040, gain: 0.25 }]],
  navigation: [0.16, [
    { start: 0, duration: 0.08, from: 520, to: 660, gain: 0.2 },
    { start: 0.07, duration: 0.08, from: 780, to: 940, gain: 0.16 },
  ]],
  start: [0.38, [
    { start: 0, duration: 0.13, from: 330, to: 440, gain: 0.25 },
    { start: 0.1, duration: 0.15, from: 440, to: 554, gain: 0.22 },
    { start: 0.22, duration: 0.15, from: 554, to: 660, gain: 0.18 },
  ]],
  success: [0.42, [
    { start: 0, duration: 0.25, from: 523, to: 523, gain: 0.2 },
    { start: 0.08, duration: 0.27, from: 659, to: 659, gain: 0.17 },
    { start: 0.16, duration: 0.26, from: 784, to: 784, gain: 0.15 },
  ]],
  invalid: [0.24, [
    { start: 0, duration: 0.12, from: 310, to: 240, wave: 'triangle', gain: 0.25 },
    { start: 0.12, duration: 0.12, from: 230, to: 170, wave: 'triangle', gain: 0.21 },
  ]],
  draw: [0.32, [
    { start: 0, duration: 0.22, from: 440, to: 440, gain: 0.17 },
    { start: 0.1, duration: 0.22, from: 554, to: 554, gain: 0.15 },
  ]],
  move: [0.075, [{ start: 0, duration: 0.06, from: 350, to: 290, gain: 0.16 }]],
  collect: [0.22, [
    { start: 0, duration: 0.13, from: 660, to: 880, gain: 0.22 },
    { start: 0.09, duration: 0.13, from: 990, to: 1320, gain: 0.14 },
  ]],
  jump: [0.2, [{ start: 0, duration: 0.18, from: 240, to: 620, wave: 'triangle', gain: 0.2 }]],
  collision: [0.28, [
    { start: 0, duration: 0.22, from: 180, to: 65, wave: 'triangle', gain: 0.28 },
    { start: 0, duration: 0.12, from: 100, to: 45, wave: 'square', gain: 0.08 },
  ]],
  'power-up': [0.42, [
    { start: 0, duration: 0.31, from: 392, to: 784, gain: 0.17 },
    { start: 0.08, duration: 0.32, from: 587, to: 1174, gain: 0.14 },
  ]],
  'game-over': [0.55, [
    { start: 0, duration: 0.35, from: 392, to: 196, gain: 0.19 },
    { start: 0.12, duration: 0.38, from: 294, to: 147, gain: 0.16 },
  ]],
  pause: [0.16, [{ start: 0, duration: 0.14, from: 520, to: 390, gain: 0.17 }]],
}

Object.entries(effects).forEach(([name, [duration, voices]]) => {
  writeWav(path.join(effectsDirectory, `${name}.wav`), generateEffect(voices, duration))
})

console.log(`Generated ${3 + Object.keys(effects).length} audio files under public/audio.`)