export class TimeStep
{
    #fps = 60;

    running = false;
    now = 0;
    then = Date.now();
    interval = 1000 / this.#fps;
    delta;
    reqId = null;
    callback;

    get fps()
    {
        return this.#fps;
    }

    set fps(v = 60)
    {
        this.#fps = v;
        this.interval = 1000 / this.#fps;
    }

    start(callback)
    {
        if (this.running) return this;
        this.running = true;
        this.callback = callback;

        const tick = () =>
        {
            this.reqId = window.requestAnimationFrame(tick);
            this.now = Date.now();
            this.delta = this.now - this.then;

            if (this.delta > this.interval)
            {
                this.then = this.now - (this.delta % this.interval);
                this.callback(this.then, this.delta)
            }
        }

        window.requestAnimationFrame(tick);
    }
}