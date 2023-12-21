import { Game } from "./core/Game.js";
import { Geometry } from "./gameObjects/geometry/Geometry.js";
import { AxesHelper } from "./gameObjects/helpers/AxesHelper.js";
import { GridHelper } from "./gameObjects/helpers/GridHelper.js";
import { Sphere } from "./gameObjects/geometry/Sphere.js";
import { BaseScene } from "./scene/BaseScene.js";
import { Orbit } from "./utils/Orbit.js";


const PixelPath = {
    Game,
    Scene: BaseScene,
    GameObjects: { Geometry, Sphere, AxesHelper, GridHelper },
    Utils: { Orbit },
    Math: {},
    Version: '0.0.1',
    Author: ''
}


export default PixelPath;