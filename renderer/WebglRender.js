import { Vec3 } from "../utils/math/Vec3.js";
import { Shaders } from "./Shaders.js";


const tempVec3 = new Vec3();
let ID = 1;


export class WebGLRenderer 
{
    color = true;
    // 存储请求的扩展
    extensions = {};
    parameters = {};
    // gl状态存储以避免对内部使用的方法进行冗余调用
    state = {};

    dpr = 1;
    alpha = false;
    depth = true;
    stencil = false;
    antialias = false;
    premultipliedAlpha = false;
    preserveDrawingBuffer = false;
    powerPreference = 'default';
    autoClear = true;


    constructor(game, { width, height, canvas })
    {
        this.id = ID++;
        this.game = game;

        const webgl = 2;
        const attributes = {
            alpha: this.alpha,
            depth: this.depth,
            stencil: this.stencil,
            antialias: this.antialias,
            premultipliedAlpha: this.premultipliedAlpha,
            preserveDrawingBuffer: this.preserveDrawingBuffer,
            powerPreference: this.powerPreference,
        };

        if (webgl === 2) this.gl = canvas.getContext('webgl2', attributes);
        this.isWebgl2 = !!this.gl;
        if (!this.gl) this.gl = canvas.getContext('webgl', attributes);
        if (!this.gl) console.error('unable to create webgl context');

        this.gl.renderer = this;

        this.setSize(width, height);

        this.state.blendFunc = { src: this.gl.ONE, dst: this.gl.ZERO };
        this.state.blendEquation = { modeRGB: this.gl.FUNC_ADD };
        this.state.cullFace = false;
        this.state.frontFace = this.gl.CCW;
        this.state.depthMask = true;
        this.state.depthFunc = this.gl.LESS;
        this.state.premultiplyAlpha = false;
        this.state.flipY = false;
        this.state.unpackAlignment = 4;
        this.state.framebuffer = null;
        this.state.viewport = { x: 0, y: 0, width: null, height: null };
        this.state.textureUnits = [];
        this.state.activeTextureUnit = 0;
        this.state.boundBuffer = null;
        this.state.uniformLocations = new Map();
        this.state.currentProgram = null;

        // 初始化额外的格式类型
        if (this.isWebgl2)
        {
            this.getExtension('EXT_color_buffer_float');
            this.getExtension('OES_texture_float_linear');
        } else
        {
            this.getExtension('OES_texture_float');
            this.getExtension('OES_texture_float_linear');
            this.getExtension('OES_texture_half_float');
            this.getExtension('OES_texture_half_float_linear');
            this.getExtension('OES_element_index_uint');
            this.getExtension('OES_standard_derivatives');
            this.getExtension('EXT_sRGB');
            this.getExtension('WEBGL_depth_texture');
            this.getExtension('WEBGL_draw_buffers');
        }
        this.getExtension('WEBGL_compressed_texture_astc');
        this.getExtension('EXT_texture_compression_bptc');
        this.getExtension('WEBGL_compressed_texture_s3tc');
        this.getExtension('WEBGL_compressed_texture_etc1');
        this.getExtension('WEBGL_compressed_texture_pvrtc');
        this.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');

        // 使用扩展名（WebGL1）或本机（如果可用）（WebGL2）创建方法别名
        this.vertexAttribDivisor = this.getExtension('ANGLE_instanced_arrays', 'vertexAttribDivisor', 'vertexAttribDivisorANGLE');
        this.drawArraysInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawArraysInstanced', 'drawArraysInstancedANGLE');
        this.drawElementsInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawElementsInstanced', 'drawElementsInstancedANGLE');
        this.createVertexArray = this.getExtension('OES_vertex_array_object', 'createVertexArray', 'createVertexArrayOES');
        this.bindVertexArray = this.getExtension('OES_vertex_array_object', 'bindVertexArray', 'bindVertexArrayOES');
        this.deleteVertexArray = this.getExtension('OES_vertex_array_object', 'deleteVertexArray', 'deleteVertexArrayOES');
        this.drawBuffers = this.getExtension('WEBGL_draw_buffers', 'drawBuffers', 'drawBuffersWEBGL');

        // 存储设备参数
        this.parameters.maxTextureUnits = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        this.parameters.maxAnisotropy = this.getExtension('EXT_texture_filter_anisotropic')
            ? this.gl.getParameter(this.getExtension('EXT_texture_filter_anisotropic').MAX_TEXTURE_MAX_ANISOTROPY_EXT)
            : 0;

        // 存储所有shader 
       this.shaders = new Shaders(this.gl);
    }

    setSize(width, height)
    {
        this.width = width;
        this.height = height;

        this.gl.canvas.width = width * this.dpr;
        this.gl.canvas.height = height * this.dpr;

        if (!this.gl.canvas.style) return;
        Object.assign(this.gl.canvas.style, {
            width: width + 'px',
            height: height + 'px',
        });
    }

    setViewport(width, height, x = 0, y = 0)
    {
        if (this.state.viewport.width === width && this.state.viewport.height === height) return;
        this.state.viewport.width = width;
        this.state.viewport.height = height;
        this.state.viewport.x = x;
        this.state.viewport.y = y;
        this.gl.viewport(x, y, width, height);
    }

    setScissor(width, height, x = 0, y = 0)
    {
        this.gl.scissor(x, y, width, height);
    }

    enable(id)
    {
        if (this.state[id] === true) return;
        this.gl.enable(id);
        this.state[id] = true;
    }

    disable(id)
    {
        if (this.state[id] === false) return;
        this.gl.disable(id);
        this.state[id] = false;
    }

    setBlendFunc(src, dst, srcAlpha, dstAlpha)
    {
        if (
            this.state.blendFunc.src === src &&
            this.state.blendFunc.dst === dst &&
            this.state.blendFunc.srcAlpha === srcAlpha &&
            this.state.blendFunc.dstAlpha === dstAlpha
        ) return;
        this.state.blendFunc.src = src;
        this.state.blendFunc.dst = dst;
        this.state.blendFunc.srcAlpha = srcAlpha;
        this.state.blendFunc.dstAlpha = dstAlpha;
        if (srcAlpha !== undefined) this.gl.blendFuncSeparate(src, dst, srcAlpha, dstAlpha);
        else this.gl.blendFunc(src, dst);
    }

    setBlendEquation(modeRGB, modeAlpha)
    {
        modeRGB = modeRGB || this.gl.FUNC_ADD;
        if (this.state.blendEquation.modeRGB === modeRGB && this.state.blendEquation.modeAlpha === modeAlpha) return;
        this.state.blendEquation.modeRGB = modeRGB;
        this.state.blendEquation.modeAlpha = modeAlpha;
        if (modeAlpha !== undefined) this.gl.blendEquationSeparate(modeRGB, modeAlpha);
        else this.gl.blendEquation(modeRGB);
    }

    setCullFace(value)
    {
        if (this.state.cullFace === value) return;
        this.state.cullFace = value;
        this.gl.cullFace(value);
    }

    setFrontFace(value)
    {
        if (this.state.frontFace === value) return;
        this.state.frontFace = value;
        this.gl.frontFace(value);
    }

    setDepthMask(value)
    {
        if (this.state.depthMask === value) return;
        this.state.depthMask = value;
        this.gl.depthMask(value);
    }

    setDepthFunc(value)
    {
        if (this.state.depthFunc === value) return;
        this.state.depthFunc = value;
        this.gl.depthFunc(value);
    }

    activeTexture(value)
    {
        if (this.state.activeTextureUnit === value) return;
        this.state.activeTextureUnit = value;
        this.gl.activeTexture(this.gl.TEXTURE0 + value);
    }

    bindFramebuffer({ target = this.gl.FRAMEBUFFER, buffer = null } = {})
    {
        if (this.state.framebuffer === buffer) return;
        this.state.framebuffer = buffer;
        this.gl.bindFramebuffer(target, buffer);
    }

    // 获取扩展
    getExtension(extension, webgl2Func, extFunc)
    {
        // 如果支持webgl2函数，则返回绑定到gl上下文的func
        if (webgl2Func && this.gl[webgl2Func]) return this.gl[webgl2Func].bind(this.gl);

        // 仅获取一次扩展
        if (!this.extensions[extension])
        {
            this.extensions[extension] = this.gl.getExtension(extension);
        }

        // 如果未请求任何功能，则返回扩展
        if (!webgl2Func) return this.extensions[extension];

        // 如果不支持扩展，则返回null
        if (!this.extensions[extension]) return null;

        // 返回扩展函数，绑定到扩展
        return this.extensions[extension][extFunc].bind(this.extensions[extension]);
    }

    sortOpaque(a, b)
    {
        if (a.renderOrder !== b.renderOrder)
        {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id)
        {
            return a.program.id - b.program.id;
        } else if (a.zDepth !== b.zDepth)
        {
            return a.zDepth - b.zDepth;
        } else
        {
            return b.id - a.id;
        }
    }

    sortTransparent(a, b)
    {
        if (a.renderOrder !== b.renderOrder)
        {
            return a.renderOrder - b.renderOrder;
        }
        if (a.zDepth !== b.zDepth)
        {
            return b.zDepth - a.zDepth;
        } else
        {
            return b.id - a.id;
        }
    }

    sortUI(a, b)
    {
        if (a.renderOrder !== b.renderOrder)
        {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id)
        {
            return a.program.id - b.program.id;
        } else
        {
            return b.id - a.id;
        }
    }

    getRenderList({ scene, camera, frustumCull, sort })
    {
        let renderList = [];

        if (camera && frustumCull) camera.updateFrustum();

        // Get visible
        scene.traverse((node) =>
        {
            if (!node.visible) return true;
            if (!node.draw) return;

            if (frustumCull && node.frustumCulled && camera)
            {
                if (!camera.frustumIntersectsMesh(node)) return;
            }

            renderList.push(node);
        });

        if (sort)
        {
            const opaque = []; // 不透明的
            const transparent = []; // depthTest true
            const ui = []; // depthTest false

            renderList.forEach((node) =>
            {
                // 拆分为3个渲染组
                if (!node.program.transparent)
                {
                    opaque.push(node);
                } else if (node.program.depthTest)
                {
                    transparent.push(node);
                } else
                {
                    ui.push(node);
                }

                node.zDepth = 0;

                // 仅当renderOrder未设置且depthTest为true时才计算z深度
                if (node.renderOrder !== 0 || !node.program.depthTest || !camera) return;

                // update z-depth
                node.worldMatrix.getTranslation(tempVec3);
                tempVec3.applyMatrix4(camera.projectionViewMatrix);
                node.zDepth = tempVec3.z;
            });

            opaque.sort(this.sortOpaque);
            transparent.sort(this.sortTransparent);
            ui.sort(this.sortUI);

            renderList = opaque.concat(transparent, ui);
        }

        return renderList;
    }

    render({ scene, camera, target = null, update = true, sort = true, frustumCull = true, clear })
    {
        if (target === null)
        {
            // 确保没有渲染目标绑定以便绘制到画布
            this.bindFramebuffer();
            this.setViewport(this.width * this.dpr, this.height * this.dpr);
        } else
        {
            // 绑定提供的渲染目标和更新视口
            this.bindFramebuffer(target);
            this.setViewport(target.width, target.height);
        }

        if (clear || (this.autoClear && clear !== false))
        {
            // 确保深度缓冲区写入已启用，以便可以清除
            if (this.depth && (!target || target.depth))
            {
                this.enable(this.gl.DEPTH_TEST);
                this.setDepthMask(true);
            }
            this.gl.clear(
                (this.color ? this.gl.COLOR_BUFFER_BIT : 0) |
                (this.depth ? this.gl.DEPTH_BUFFER_BIT : 0) |
                (this.stencil ? this.gl.STENCIL_BUFFER_BIT : 0)
            );
        }

        // 更新所有场景图矩阵
        if (update) scene.updateMatrixWorld();

        // 单独更新相机，以防不在场景图中
        if (camera) camera.updateMatrixWorld();

        // 获取渲染列表-需要剔除和排序
        const renderList = this.getRenderList({ scene, camera, frustumCull, sort });

        renderList.forEach((node) =>
        {
            node.draw({ camera });
        });
    }
}