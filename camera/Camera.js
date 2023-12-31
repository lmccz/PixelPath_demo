 
import { Transform } from '../core/Transform.js';
import { Mat4 } from '../utils/math/Mat4.js';
import { Vec3 } from '../utils/math/Vec3.js';


const tempMat4 = new Mat4();
const tempVec3a = new Vec3();
const tempVec3b = new Vec3();


export class Camera extends Transform
{
    projectionMatrix = new Mat4();
    viewMatrix = new Mat4();
    projectionViewMatrix = new Mat4();
    worldPosition = new Vec3();

    constructor(gl, { near = 0.1, far = 100, fov = 45, aspect = 1, left, right, bottom, top, zoom = 1 } = {})
    {
        super();

        Object.assign(this, { near, far, fov, aspect, left, right, bottom, top, zoom });

        // 如果设置为左/右，则使用正交，否则默认为透视摄影机
        this.type = left || right ? 'orthographic' : 'perspective';

        if (this.type === 'orthographic') this.orthographic();
        else this.perspective();
    }

    perspective({ near = this.near, far = this.far, fov = this.fov, aspect = this.aspect } = {})
    {
        Object.assign(this, { near, far, fov, aspect });
        this.projectionMatrix.fromPerspective({ fov: fov * (Math.PI / 180), aspect, near, far });
        this.type = 'perspective';
        return this;
    }

    orthographic({ near = this.near, far = this.far, left = this.left || -1, right = this.right || 1, bottom = this.bottom || -1, top = this.top || 1, zoom = this.zoom } = {})
    {
        Object.assign(this, { near, far, left, right, bottom, top, zoom });
        left /= zoom;
        right /= zoom;
        bottom /= zoom;
        top /= zoom;
        this.projectionMatrix.fromOrthogonal({ left, right, bottom, top, near, far });
        this.type = 'orthographic';
        return this;
    }

    updateMatrixWorld()
    {
        super.updateMatrixWorld();
        this.viewMatrix.inverse(this.worldMatrix);
        this.worldMatrix.getTranslation(this.worldPosition);

        // used for sorting
        this.projectionViewMatrix.multiply(this.projectionMatrix, this.viewMatrix);
        return this;
    }

    lookAt(target)
    {
        super.lookAt(target, true);
        return this;
    }

    //  将三维坐标投影到二维点
    project(v)
    {
        v.applyMatrix4(this.viewMatrix);
        v.applyMatrix4(this.projectionMatrix);
        return this;
    }

    // 取消投影二维点到三维坐标
    unproject(v)
    {
        v.applyMatrix4(tempMat4.inverse(this.projectionMatrix));
        v.applyMatrix4(this.worldMatrix);
        return this;
    }

    updateFrustum()
    {
        if (!this.frustum)
        {
            this.frustum = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
        }

        const m = this.projectionViewMatrix;
        this.frustum[0].set(m[3] - m[0], m[7] - m[4], m[11] - m[8]).constant = m[15] - m[12]; // -x
        this.frustum[1].set(m[3] + m[0], m[7] + m[4], m[11] + m[8]).constant = m[15] + m[12]; // +x
        this.frustum[2].set(m[3] + m[1], m[7] + m[5], m[11] + m[9]).constant = m[15] + m[13]; // +y
        this.frustum[3].set(m[3] - m[1], m[7] - m[5], m[11] - m[9]).constant = m[15] - m[13]; // -y
        this.frustum[4].set(m[3] - m[2], m[7] - m[6], m[11] - m[10]).constant = m[15] - m[14]; // +z (far)
        this.frustum[5].set(m[3] + m[2], m[7] + m[6], m[11] + m[10]).constant = m[15] + m[14]; // -z (near)

        for (let i = 0; i < 6; i++)
        {
            const invLen = 1.0 / this.frustum[i].distance();
            this.frustum[i].multiply(invLen);
            this.frustum[i].constant *= invLen;
        }
    }

    frustumIntersectsMesh(node, worldMatrix = node.worldMatrix)
    {
        // 如果没有位置属性，则视为截头体Culled false
        if (!node.geometry.attributes.position) return true;

        if (!node.geometry.bounds || node.geometry.bounds.radius === Infinity) node.geometry.computeBoundingSphere();

        if (!node.geometry.bounds) return true;

        const center = tempVec3a;
        center.copy(node.geometry.bounds.center);
        center.applyMatrix4(worldMatrix);

        const radius = node.geometry.bounds.radius * worldMatrix.getMaxScaleOnAxis();

        return this.frustumIntersectsSphere(center, radius);
    }

    frustumIntersectsSphere(center, radius)
    {
        const normal = tempVec3b;

        for (let i = 0; i < 6; i++)
        {
            const plane = this.frustum[i];
            const distance = normal.copy(plane).dot(center) + plane.constant;
            if (distance < -radius) return false;
        }
        return true;
    }
}
