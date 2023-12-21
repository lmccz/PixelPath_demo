import { Color } from "../utils/math/Color.js";
import { Mesh } from "./Mesh.js";
import { Plane } from "./Plane.js";


export class Image extends Mesh
{
    color = new Color([0, 0, 0]);
    texture = undefined;
    
    constructor(gl)
    {
        const geometry = new Plane(gl, { widthSegments: 10, heightSegments: 10, });
        const program = gl.renderer.shaders.get('image');
        super(gl, { geometry, program });
    }
}