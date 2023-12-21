import { Program } from "./Program.js";
import { Basic } from "./shader/Basic.js";
import { Fog } from "./shader/Fog.js";
import { Simple } from "./shader/Simple.js";
import { Skin } from "./shader/Skin.js";


export class Shaders 
{
    map = new Map;

    constructor(gl)
    {
        const shaders = [
            { name: 'skin', config: Skin },
            { name: 'fog', config: Fog },
            { name: 'basic', config: Basic },
            { name: 'simple', config: Simple },
        ];

        shaders.forEach(e =>
        {
            const program = new Program(gl, { ...e.config });
            this.map.set(e.name, program);
        });
    }

    get(key)
    {
        return this.map.get(key);
    }
}