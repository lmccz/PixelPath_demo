import { Euler } from "../utils/math/Euler.js";
import { Mat4 } from "../utils/math/Mat4.js";
import { Quat } from "../utils/math/Quat.js";
import { Vec3 } from "../utils/math/Vec3.js";


export class Transform
{
    parent = null;
    children = [];
    visible = true;

    matrix = new Mat4();
    worldMatrix = new Mat4();
    matrixAutoUpdate = true;
    worldMatrixNeedsUpdate = false;

    position = new Vec3();
    quaternion = new Quat();  // 四元数
    scale = new Vec3(1);
    rotation = new Euler();
    up = new Vec3(0, 1, 0);

    constructor()
    {
        this.rotation.onChange = () => this.quaternion.fromEuler(this.rotation);
        this.quaternion.onChange = () => this.rotation.fromQuaternion(this.quaternion);
    }

    setParent(parent, notifyParent = true)
    {
        if (this.parent && parent !== this.parent) this.parent.removeChild(this, false);
        this.parent = parent;
        if (notifyParent && parent) parent.addChild(this, false);
    }

    addChild(child, notifyChild = true)
    {
        if (!~this.children.indexOf(child)) this.children.push(child);
        if (notifyChild) child.setParent(this, false);
    }

    removeChild(child, notifyChild = true)
    {
        if (!!~this.children.indexOf(child)) this.children.splice(this.children.indexOf(child), 1);
        if (notifyChild) child.setParent(null, false);
    }

    updateMatrixWorld(force)
    {
        if (this.matrixAutoUpdate) this.updateMatrix();
        if (this.worldMatrixNeedsUpdate || force)
        {
            if (this.parent === null) this.worldMatrix.copy(this.matrix);
            else this.worldMatrix.multiply(this.parent.worldMatrix, this.matrix);
            this.worldMatrixNeedsUpdate = false;
            force = true;
        }

        for (let i = 0, l = this.children.length; i < l; i++)
        {
            this.children[i].updateMatrixWorld(force);
        }
    }

    updateMatrix()
    {
        this.matrix.compose(this.quaternion, this.position, this.scale);
        this.worldMatrixNeedsUpdate = true;
    }

    traverse(callback)
    {
        // 在回调中返回true以停止遍历子级
        if (callback(this)) return;
        for (let i = 0, l = this.children.length; i < l; i++)
        {
            this.children[i].traverse(callback);
        }
    }

    decompose()
    {
        this.matrix.getTranslation(this.position);
        this.matrix.getRotation(this.quaternion);
        this.matrix.getScaling(this.scale);
        this.rotation.fromQuaternion(this.quaternion);
    }

    lookAt(target, invert = false)
    {
        if (invert) this.matrix.lookAt(this.position, target, this.up);
        else this.matrix.lookAt(target, this.position, this.up);
        this.matrix.getRotation(this.quaternion);
        this.rotation.fromQuaternion(this.quaternion);
    }
}