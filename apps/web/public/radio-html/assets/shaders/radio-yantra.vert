attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z += sin(position.x * 3.0 + uTime) * 0.04;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
