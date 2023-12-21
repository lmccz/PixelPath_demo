import { Transform } from "../../core/Transform.js";
import { Texture } from "../../renderer/Texture.js";
import { Mat4 } from "../../utils/math/Mat4.js";
import { Mesh } from "../Mesh.js";
import { Animation } from "./Animation.js";


const tempMat4 = new Mat4();


export class Skin extends Mesh
{
    constructor(gl, { rig, geometry, program = 'skin', mode = gl.TRIANGLES, texture } = {})
    {
        const p = gl.renderer.shaders.get(program);
        super(gl, { geometry, program: p, mode });

        this.createBones(rig);
        this.createBoneTexture();
        this.animations = [];
        this.texture = texture;

        Object.assign(this.program.uniforms, {
            boneTexture: { value: this.boneTexture },
            boneTextureSize: { value: this.boneTextureSize },
        });
    }

    createBones(rig)
    {
        // 创建root，以便可以简单地更新整个骨架的世界矩阵
        this.root = new Transform();

        // 创建骨骼
        this.bones = [];
        if (!rig.bones || !rig.bones.length) return;
        for (let i = 0; i < rig.bones.length; i++)
        {
            const bone = new Transform();

            // 设置初始值（绑定姿势）
            bone.position.fromArray(rig.bindPose.position, i * 3);
            bone.quaternion.fromArray(rig.bindPose.quaternion, i * 4);
            bone.scale.fromArray(rig.bindPose.scale, i * 3);

            this.bones.push(bone);
        }

        // 创建后，设置层次结构
        rig.bones.forEach((data, i) =>
        {
            this.bones[i].name = data.name;
            if (data.parent === -1) return this.bones[i].setParent(this.root);
            this.bones[i].setParent(this.bones[data.parent]);
        });

        // 然后更新以计算世界矩阵
        this.root.updateMatrixWorld(true);

        // 存储绑定姿势的反转以计算差异
        this.bones.forEach((bone) =>
        {
            bone.bindInverse = new Mat4(...bone.worldMatrix).inverse();
        });
    }

    createBoneTexture()
    {
        if (!this.bones.length) return;
        const size = Math.max(4, Math.pow(2, Math.ceil(Math.log(Math.sqrt(this.bones.length * 4)) / Math.LN2)));
        this.boneMatrices = new Float32Array(size * size * 4);
        this.boneTextureSize = size;
        this.boneTexture = new Texture(this.gl, {
            image: this.boneMatrices,
            generateMipmaps: false,
            type: this.gl.FLOAT,
            internalFormat: this.gl.renderer.isWebgl2 ? this.gl.RGBA32F : this.gl.RGBA,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            flipY: false,
            width: size,
        });
    }

    addAnimation(data)
    {
        const animation = new Animation({ objects: this.bones, data });
        this.animations.push(animation);
        return animation;
    }

    update()
    {
        // 计算组合动画权重
        let total = 0;
        this.animations.forEach((animation) => (total += animation.weight));

        this.animations.forEach((animation, i) =>
        {
            // 强制设置第一个动画以重置帧
            animation.update(total, i === 0);
        });
    }

    draw({ camera } = {})
    {
        // 手动更新世界矩阵，因为它不是场景图的一部分
        this.root.updateMatrixWorld(true);

        // 更新骨骼纹理
        this.bones.forEach((bone, i) =>
        {
            // 查找当前姿势和绑定姿势之间的差异
            tempMat4.multiply(bone.worldMatrix, bone.bindInverse);
            this.boneMatrices.set(tempMat4, i * 16);
        });
        if (this.boneTexture) this.boneTexture.needsUpdate = true;

        super.draw({ camera });
    }
}
