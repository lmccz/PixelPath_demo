import { ImageFile } from "./Image.js";
import { JsonFile } from "./Json.js";


export class Loader
{
    queue = [];
    total = 0;
    completed = 0;
    loaders = Object.create(null);

    constructor(scene)
    {
        this.scene = scene;

        [ImageFile, JsonFile].forEach(e =>
        {
            const file = new e(this);
            this.loaders[file.key] = file;
            this[file.key] = file.init;
        })

        scene.events.once('load', this.load, this);
        scene.events.on('completed', this.complete, this);
    }

    load()
    {
        this.queue.forEach(e =>
        {
            this.loaders[e.type].load(e);
        });

        if(this.queue.length === 0) this.scene.events.emit('loadcompleted');
    }

    complete(data)
    {
        this.completed += 1;
        this.scene.events.emit('loadprogress', { total: this.total, complete: this.completed, ...data });
        if (this.completed === this.total) this.scene.events.emit('loadcompleted');
    }
}