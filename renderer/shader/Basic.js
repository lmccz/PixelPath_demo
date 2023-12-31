const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec3 position;
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 5.0;
}
`;


const fragment = /* glsl */ `
precision highp float;

uniform float uTime;
uniform sampler2D tMap;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 tex = texture2D(tMap, vUv).rgb;

    vec3 light = normalize(vec3(0.5, 1.0, -0.3));
    float shading = dot(normal, light) * 0.15;
    gl_FragColor.rgb = tex + shading;
    gl_FragColor.a = 1.0;
}
`;


export const Basic = {
    vertex,
    fragment,
    cullFace: false,
    uniforms: {
        tMap: { value: 0, objectkey: 'texture' },
    },
}