import { SceneEvents } from "./Events.js";


export class SceneManager 
{
    scenes = [];

    constructor(game, scenes)
    {
        this.game = game;

        let key = '';

        scenes.forEach((e, i) =>
        {
            const scene = new e;

            if (i === 0) key = scene.key;

            this.game.plugins.install(scene);

            this.scenes.push(scene);
        });

        game.events.once('gameready', () =>
        {
            this.start(key);
            this.game.events.emit('gamestart');
        });
    }

    start(key)
    {
        const scene = this.scenes.find(e => e.key === key);

        if (!scene)
        {
            throw Error(`error: no find scene for "${key}"`);
        }

        if (scene.preload)
        {
            scene.preload();

            scene.events.emit(SceneEvents.LOAD);

            scene.events.once('loadcompleted', () =>
            {
                this.create(key);
            });

            return;
        }

        this.create(key);
    }

    create(key)
    {
        const scene = this.scenes.find(e => e.key === key);

        if (!scene)
        {
            throw Error(`error: no find scene for "${key}"`);
        }

        if (scene.create) scene.create();

        scene.visible = true;
    }

    update(t, d)
    {
        for (let i = 0; i < this.scenes.length; i++)
        {
            if (this.scenes[i].visible)
            {
                this.scenes[i].update(t, d);
            }
        }
    }

    render(renderer)
    {
        for (let i = 0; i < this.scenes.length; i++)
        {
            if (this.scenes[i].visible)
            {
                renderer.render({
                    scene: this.scenes[i],
                    camera: this.scenes[i].camera
                });
            }
        }
    }
}