import { Vec3 } from "../../utils/math/Vec3.js";


const vertex = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;
uniform vec3 color;

void main() {    
    gl_FragColor = vec4(color, 1.0);
}
`;


export const Simple = {
    vertex,
    fragment,
    uniforms: {
        color: { value: new Vec3(1.0, 1.0, 1.0), objectkey: 'color' },
    },
}