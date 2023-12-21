import { Mesh } from "./Mesh.js";


export class Model extends Mesh
{
    texture = undefined;

    constructor(gl, { geometry, program = 'basic', texture })
    {
        const p = gl.renderer.shaders.get(program);

        super(gl, { geometry, program: p });

        this.texture = texture;
    }
}