export class JsonFile
{
    key = 'json';

    constructor(loader)
    {
        this.loader = loader;
    }

    init(key, src)
    {
        this.queue.push({ type: 'json', src, key });
        this.total += 1;
    }

    load(data)
    {
        const request = new XMLHttpRequest();
        request.open("GET", data.src);
        request.send(null);
        request.onload = () =>
        {
            if (request.status == 200)
            {
                const json = JSON.parse(request.response);
                this.loader.scene.cache.set(data.key, json)
                this.loader.scene.events.emit('completed', data);
            }
        };
    }
}