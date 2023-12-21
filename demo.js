import PixelPath from "./PixelPath.js";


class TestScene extends PixelPath.Scene
{
    constructor()
    {
        super();
        this.key = 'test'
    }

    preload()
    {
        console.log('preload');

        this.load.image('sky', './sky.jpg');
        this.load.image('earth_cloud', './earth_cloud.jpg');

        this.load.image('fox', './fox.jpg');
        this.load.json('foxjson', './fox.json');

        this.load.image('forest', './forest.jpg');
        this.load.json('forestjson', './forest.json');

        this.load.image('snout', './snout.jpg');
        this.load.json('snout-rig', './snout-rig.json');
        this.load.json('snout-anim', './snout-anim.json');
    }

    create()
    {
        console.log('create');

        const gl = this.renderer.gl

        // this.renderer.dpr = 2;
        this.renderer.gl.clearColor(1, 1, 1, 1);
        // this.renderer.setSize(640, 640);

        this.camera.fov = 45;
        this.camera.position.set(0, 4, 8);
        // this.camera.rotation.z = -0.3;
        this.camera.lookAt([0, 0, 0]);
        this.camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        this.controls = new PixelPath.Utils.Orbit(this.camera);

        const size = 8;
        const num = size * size;
        let offset = new Float32Array(num * 3);
        let random = new Float32Array(num * 3);
        for (let i = 0; i < num; i++)
        {
            // Layout in a grid
            offset.set([((i % size) - size * 0.5) * 2, 0, (Math.floor(i / size) - size * 0.5) * 2], i * 3);
            random.set([Math.random(), Math.random(), Math.random()], i * 3);
        }
        const forestjson = this.cache.get('forestjson');
        const forestTexture = this.cache.get('forest');
        const forestGeometry = new PixelPath.GameObjects.Geometry(gl, {
            position: { size: 3, data: new Float32Array(forestjson.position) },
            uv: { size: 2, data: new Float32Array(forestjson.uv) },
            offset: { instanced: true, size: 3, data: offset },
            random: { instanced: true, size: 3, data: random },
        });
        this.forest = this.add.model({ geometry: forestGeometry, program: 'fog', texture: forestTexture });


        const foxJson = this.cache.get('foxjson');
        const foxTexture = this.cache.get('fox');
        const foxGeometry = new PixelPath.GameObjects.Geometry(gl, {
            position: { size: 3, data: new Float32Array(foxJson.position) },
            uv: { size: 2, data: new Float32Array(foxJson.uv) },
            normal: { size: 3, data: new Float32Array(foxJson.normal) },
        });
        this.fox = this.add.model({ geometry: foxGeometry, texture: foxTexture })
        this.fox.position.set(0, 0, 0);
        this.fox.scale.set(0.3, 0.3, 0.3);


        const snoutJson = this.cache.get('snout-rig');
        const snoutTexture = this.cache.get('snout');
        const snoutGeometry = new PixelPath.GameObjects.Geometry(gl, {
            position: { size: 3, data: new Float32Array(snoutJson.position) },
            uv: { size: 2, data: new Float32Array(snoutJson.uv) },
            normal: { size: 3, data: new Float32Array(snoutJson.normal) },
        });
        this.snout = this.add.model({ geometry: snoutGeometry, texture: snoutTexture })
        this.snout.position.set(-2, 0, 0);
        this.snout.scale.set(0.01);


        const skinGeometry = new PixelPath.GameObjects.Geometry(gl, {
            position: { size: 3, data: new Float32Array(snoutJson.position) },
            uv: { size: 2, data: new Float32Array(snoutJson.uv) },
            normal: { size: 3, data: new Float32Array(snoutJson.normal) },
            skinIndex: { size: 4, data: new Float32Array(snoutJson.skinIndex) },
            skinWeight: { size: 4, data: new Float32Array(snoutJson.skinWeight) },
        });
        this.skin = this.add.skin({ rig: snoutJson.rig, geometry: skinGeometry, texture: snoutTexture })
        this.skin.position.set(2, 0, 0);
        this.skin.scale.set(0.01);
        this.animation = this.skin.addAnimation(this.cache.get('snout-anim'));

        const skyTexture = this.cache.get('sky');
        const skyGeometry = new PixelPath.GameObjects.Sphere(gl, { radius: 1, widthSegments: 64 });
        this.skybox = this.add.model({ geometry: skyGeometry, texture: skyTexture })
        this.skybox.scale.set(20);


        this.add.gridHelper({ size: 20, divisions: 20 });
        this.add.axesHelper({ size: 6, symmetric: true });


        const mode = [gl.POINTS, gl.LINES, gl.LINE_LOOP, gl.TRIANGLES];
        let modeIndex = 3

        document.addEventListener("mousedown", () =>
        {
            modeIndex += 1;
            if (modeIndex >= mode.length) modeIndex = 0;
            this.fox.mode = mode[modeIndex];
            this.snout.mode = mode[modeIndex];
        });
    }

    update(t, d)
    {
        this.fox.rotation.y -= 0.005;
        this.controls.update();
        this.animation.elapsed += 0.1;
        this.skin.update();
    }
}


new PixelPath.Game({
    width: 640,
    height: 640,
    scenes: [TestScene]
})