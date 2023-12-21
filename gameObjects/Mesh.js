import { Transform } from '../core/Transform.js';
import { Mat3 } from '../utils/math/Mat3.js';
import { Mat4 } from '../utils/math/Mat4.js';


let ID = 0;


export class Mesh extends Transform
{
    constructor(gl, { geometry, program, mode = gl.TRIANGLES, frustumCulled = true, renderOrder = 0 } = {})
    {
        super();

        if (!gl.canvas) console.error('gl not passed as first argument to Mesh');
        this.gl = gl;
        this.id = ID++;
        this.geometry = geometry;
        this.program = program;
        this.mode = mode;

        // 用于跳过截头体剔除
        this.frustumCulled = frustumCulled;

        // 覆盖排序以强制订单
        this.renderOrder = renderOrder;
        this.modelViewMatrix = new Mat4();
        this.normalMatrix = new Mat3();
        this.beforeRenderCallbacks = [];
        this.afterRenderCallbacks = [];
    }

    onBeforeRender(f)
    {
        this.beforeRenderCallbacks.push(f);
        return this;
    }

    onAfterRender(f)
    {
        this.afterRenderCallbacks.push(f);
        return this;
    }

    draw({ camera } = {})
    {
        if (camera)
        {
            // 如果未设置，则将空矩阵uniforms添加到程序中
            if (!this.program.uniforms.modelMatrix)
            {
                Object.assign(this.program.uniforms, {
                    modelMatrix: { value: null },
                    viewMatrix: { value: null },
                    modelViewMatrix: { value: null },
                    normalMatrix: { value: null },
                    projectionMatrix: { value: null },
                    cameraPosition: { value: null },
                });
            }

            // Set the matrix uniforms
            this.program.uniforms.projectionMatrix.value = camera.projectionMatrix;
            this.program.uniforms.cameraPosition.value = camera.worldPosition;
            this.program.uniforms.viewMatrix.value = camera.viewMatrix;
            this.modelViewMatrix.multiply(camera.viewMatrix, this.worldMatrix);
            this.normalMatrix.getNormalMatrix(this.modelViewMatrix);
            this.program.uniforms.modelMatrix.value = this.worldMatrix;
            this.program.uniforms.modelViewMatrix.value = this.modelViewMatrix;
            this.program.uniforms.normalMatrix.value = this.normalMatrix;
        }
        this.beforeRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));

        // 确定是否需要翻转面-当网格以负比例缩放时
        let flipFaces = this.program.cullFace && this.worldMatrix.determinant() < 0;
        this.program.use({ flipFaces, object: this });
        this.geometry.draw({ mode: this.mode, program: this.program });
        this.afterRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
    }
}
