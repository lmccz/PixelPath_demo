import { WebGLRenderer } from "../renderer/WebglRender.js";
import { SceneManager } from "../scene/SceneManager.js"; 
import { EventEmitter } from "./EventEmitter.js";
import { PluginManager } from "./Plugins.js";
import { TimeStep } from "./TimeStep.js";


export class Game
{
    canvas = document.createElement('canvas');
    events = new EventEmitter;
    timestep = new TimeStep;
    cache = new Map;

    constructor(config)
    {
        const width = config.width || 320;
        const height = config.height || 160;
        const plugins = config.plugins || [];
        const scenes = config.scenes;

        this.canvas.width = width;
        this.canvas.height = height;
        document.body.appendChild(this.canvas);

        this.renderer = new WebGLRenderer(this, { width, height, canvas: this.canvas });
        this.plugins = new PluginManager(this, plugins);
        this.scene = new SceneManager(this, scenes);

        this.init();
    }

    init()
    {
        this.events.once("gamestart", () =>
        {
            this.timestep.start(this.tick.bind(this));
        });

        this.events.emit('gameready');
    }

    tick(t, d)
    {
        this.scene.update(t, d);
        this.scene.render(this.renderer);
    }
}