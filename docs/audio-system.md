# Procedural Audio System

Ashen Oracle avoids large asset downloads for ambient sounds by using procedural generation directly in the browser via the **Web Audio API**.

## How it Works

The audio system is centralized in `lib/soundManager.js`. Instead of `fetch`ing an MP3 or WAV file, the manager constructs an `AudioContext` and uses mathematical nodes to simulate environments.

### The "Noise" Buffer
For environments like wind, caves, and fire, the base element is a **white noise buffer**. The script generates an array of random values between -1.0 and 1.0.

### Filters and Nodes
- **BiquadFilterNode**: By passing the white noise through various filters (lowpass, bandpass), we shape the harsh static into specific atmospheric elements.
  - A lowpass filter at a low frequency creates the deep rumble of a cave.
  - A modulated bandpass filter creates the whistling of wind.
- **OscillatorNode**: Used for tonal, pitched elements. By running sine or triangle waves at very low frequencies with heavy reverb, it adds tension to the atmosphere.
- **GainNode**: Controls the volume. We use LFOs (Low Frequency Oscillators) mapped to GainNodes to create the random "crackling" pops for a forge fire or the swelling and fading of wind gusts.

## Audio Context Lifecycle
Because modern browsers block autoplaying audio, the `AudioContext` is only instantiated after a user interaction (such as clicking the "Awaken" button in the intro, or toggling the voice switch). 

When a user switches between Personas, the `ChatContent` component unmounts the old audio nodes by calling `setAmbientEnabled(false)` and then rebuilds the new soundscape by invoking `setAmbientEnabled(true, newAmbientType)`.
