precision mediump float;
uniform float uTime;
uniform float uLevel;
varying vec2 vUv;
void main() {
  float wave = sin((vUv.x + uTime * 0.08) * 42.0) * 0.5 + 0.5;
  vec3 cyan = vec3(0.0, 0.96, 0.83);
  vec3 saffron = vec3(1.0, 0.42, 0.21);
  vec3 color = mix(cyan, saffron, smoothstep(0.15, 0.95, wave + uLevel * 0.25));
  gl_FragColor = vec4(color, 0.72);
}
