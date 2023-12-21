import { Vec3 } from "../../utils/math/Vec3.js";
import { Geometry } from "../geometry/Geometry.js";
import { Mesh } from "../Mesh.js";


export class AxesHelper extends Mesh
{
    color = new Vec3(0.18, 0.52, 0.89);

    constructor(gl, { size = 1, symmetric = false, ...meshProps } = {})
    {
        const a = symmetric ? -size : 0;
        const b = size;

        // prettier-ignore
        const vertices = new Float32Array([
            a, 0, 0, b, 0, 0,
            0, a, 0, 0, b, 0,
            0, 0, a, 0, 0, b
        ]);

        const geometry = new Geometry(gl, {
            position: { size: 3, data: vertices },
        });

        const program = gl.renderer.shaders.get('simple');

        super(gl, { ...meshProps, mode: gl.LINES, geometry, program });
    }
}
