import { Geometry } from "../geometry/Geometry.js";
import { Mesh } from "../Mesh.js";


export class GridHelper extends Mesh
{
    constructor(gl, { size = 10, divisions = 10, ...meshProps } = {})
    {
        const numVertices = (size + 1) * 2 * 2;
        const vertices = new Float32Array(numVertices * 3);
        const hs = size / 2;

        for (let i = 0; i <= divisions; i++)
        {
            const t = i / divisions;
            const o = t * size - hs;

            vertices.set([o, 0, -hs, o, 0, hs], i * 12);
            vertices.set([-hs, 0, o, hs, 0, o], i * 12 + 6);
        }

        const geometry = new Geometry(gl, {
            position: { size: 3, data: vertices },
        });

        const program = gl.renderer.shaders.get('simple');

        super(gl, { ...meshProps, mode: gl.TRIANGLES, geometry, program });
    }
}


