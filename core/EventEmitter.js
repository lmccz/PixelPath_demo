class Event
{
    fn = undefined;
    context = undefined;
    once = false;

    constructor(fn, context, once = false) 
    {
        this.fn = fn;
        this.context = context;
        this.once = once;
    };
}


export class EventEmitter
{
    events = Object.create(null);

    on(event, callback, context, once = false)
    {
        if (!this.events[event])
        {
            this.events[event] = [];
        }

        this.events[event].push(new Event(callback, context, once));
    }

    once(event, callback, context)
    {
        this.on(event, callback, context, true);
    }

    off(event, callback)
    {
        if (!this.events[event])
        {
            return;
        };

        if (!callback)
        {
            this.events[event] = undefined;
            return
        }

        this.events[event].some((item, i) =>
        {
            if (callback === item.fn)
            {
                this.events[event].splice(i, 1);
                return true;
            }
        });
    }

    removeAllListeners()
    {
        this.events = Object.create(null);
    }

    emit(event, ...args) 
    {
        if (!this.events[event] || !this.events)
        {
            return;
        };

        this.events[event].forEach(e =>
        {
            e.fn.apply(e.context || null, args);
            if (e.once) this.off(event, e);
        });
    }

    destroy()
    {
        this.removeAllListeners();
    }
};

