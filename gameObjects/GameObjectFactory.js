import { AxesHelper } from "./helpers/AxesHelper.js";
import { GridHelper } from "./helpers/GridHelper.js";
import { Mesh } from "./Mesh.js";
import { Model } from "./Model.js";
import { Skin } from "./skin/Skin.js";


export class GameObjectFactory
{
    constructor(scene)
    {
        this.scene = scene;
    }

    static register(factoryType, factoryFunction)
    {
        GameObjectFactory.prototype[factoryType] = factoryFunction;
    }

    existing(object)
    {
        this.scene.addChild(object);
    }
}


GameObjectFactory.register('skin', function (config)  
{
    const skin = new Skin(this.scene.renderer.gl, config);

    this.existing(skin);

    return skin;
});


GameObjectFactory.register('gridHelper', function (config)  
{
    const gridHelper = new GridHelper(this.scene.renderer.gl, config);

    this.existing(gridHelper);

    return gridHelper;
});


GameObjectFactory.register('axesHelper', function (config)  
{
    const axesHelper = new AxesHelper(this.scene.renderer.gl, config);

    this.existing(axesHelper);

    return axesHelper;
});


GameObjectFactory.register('mesh', function (config)  
{
    const mesh = new Mesh(this.scene.renderer.gl, config);

    this.existing(mesh);

    return mesh;
});


GameObjectFactory.register('model', function (config)  
{
    const model = new Model(this.scene.renderer.gl, config);

    this.existing(model);

    return model;
});