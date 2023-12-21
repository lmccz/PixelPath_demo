import { Texture } from "../renderer/Texture.js";


export class ImageFile
{
    key = 'image';

    constructor(loader)
    {
        this.loader = loader;
    }

    init(key, src)
    {
        // 注意 这里的this是指向的loader的
        // 因为把init添加到了loader上
        this.queue.push({ type: 'image', src, key });
        this.total += 1;
    }

    load(data)
    {
        const image = new Image;

        image.onload = () =>
        {
            const texture = new Texture(this.loader.scene.renderer.gl, { image });
            // texture.update();
            this.loader.scene.cache.set(data.key, texture)
            this.loader.scene.events.emit('completed', data);
        };

        image.src = data.src;
    }
}