import { Transform } from "../core/Transform.js";


export class BaseScene extends Transform
{
    key = '';

    constructor(key)
    {
        super();

        this.key = key;
        this.visible = false;
    }

    update(t, d) { }
}