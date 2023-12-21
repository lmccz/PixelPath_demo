import { Camera } from "../camera/Camera.js";
import { GameObjectFactory } from "../gameObjects/GameObjectFactory.js";
import { Loader } from "../loader/Loader.js";
import { EventEmitter } from "./EventEmitter.js";


export class PluginManager 
{
    global = ['cache', 'renderer'];

    plugins = [
        { key: 'events', plugin: EventEmitter },
        { key: 'load', plugin: Loader },
        { key: 'add', plugin: GameObjectFactory },
        { key: 'camera', plugin: Camera },
        // { key: 'world', plugin: World },
        // { key: 'physics', plugin: Physics },
        // { key: 'tweens', plugin: TweenManager } 
    ];

    constructor(game, plugins = [])
    {
        this.game = game;
        this.plugins.push(...plugins);
    }

    install(scene)
    {
        this.global.forEach(e =>
        {
            scene[e] = this.game[e];
        });

        this.plugins.forEach(e =>
        {
            scene[e.key] = new e.plugin(scene);
        });
    }
}