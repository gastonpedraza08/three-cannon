window.addEventListener('DOMContentLoaded', async function () {
    var velocity = 0.0;
    var speed = 0.0;

    var camera, scene, renderer, mesh, goal, keys, follow, clock, mixer, loader;

    var temp = new THREE.Vector3;
    var dir = new THREE.Vector3;
    var a = new THREE.Vector3;
    var b = new THREE.Vector3;
    var coronaSafetyDistance = 0.3;

    init();

    function createMesh() {
        return new Promise((res, rej) => {
            loader.load( 'characters/2.glb', function ( gltf ) {
                //set mesh
                mesh = gltf.scene;
                //change size
                mesh.scale.set(0.05, 0.05, 0.05);
                //set animations
                mesh.animations = gltf.animations;
                //config for animations
                mixer = new THREE.AnimationMixer(mesh);
                //run idle animation (default)
                mixer.clipAction( mesh.animations[1]).play();

                res(true);
            } );
        });
    }

    function createControls() {
        keys = {
            a: false,
            s: false,
            d: false,
            w: false
        };

        document.body.addEventListener( 'keydown', function(e) {

        const key = e.code.replace('Key', '').toLowerCase();
            if ( keys[ key ] !== undefined )
                keys[ key ] = true;
                if (key === "w") {
                    mixer.clipAction( mesh.animations[0] ).stop();
                    mixer.clipAction( mesh.animations[1] ).stop();
                    mixer.clipAction( mesh.animations[2] ).play();
                } else if (key === "s") {
                    mixer.clipAction( mesh.animations[0] ).play();
                    mixer.clipAction( mesh.animations[1] ).stop();
                    mixer.clipAction( mesh.animations[2] ).stop();
                }
        });
        document.body.addEventListener( 'keyup', function(e) {
            const key = e.code.replace('Key', '').toLowerCase();
            if ( keys[ key ] !== undefined )
                keys[ key ] = false;
                if (key === "w") {
                    mixer.clipAction( mesh.animations[0] ).stop();
                    mixer.clipAction( mesh.animations[2] ).stop();
                    mixer.clipAction( mesh.animations[1] ).play();
                } else if (key === "s") {
                    mixer.clipAction( mesh.animations[0] ).stop();
                    mixer.clipAction( mesh.animations[2] ).stop();
                    mixer.clipAction( mesh.animations[1] ).play();
                }
        });
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    async function init() {

        camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.01, 10 );
        camera.position.set( 0, .3, 0 );

        scene = new THREE.Scene();
        clock = new THREE.Clock();
        camera.lookAt( scene.position );

        const light = new THREE.AmbientLight( 0xffffff );
        scene.add( light );

        // to load 3d objects
        loader = new THREE.GLTFLoader().setPath( 'glb files/' );

        //createGround();
        await createMesh();

        goal = new THREE.Object3D;
        follow = new THREE.Object3D;
        follow.position.z = -coronaSafetyDistance;
        mesh.add( follow );
        
        goal.add( camera );
        scene.add( mesh );

        var gridHelper = new THREE.GridHelper( 40, 40 );
        scene.add( gridHelper );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        window.addEventListener("resize", onWindowResize, false);

        createControls();

        animate();
    }


    function animate() {

        requestAnimationFrame( animate );

        speed = 0.0;

        if ( keys.w )
            speed = 0.01;
        else if ( keys.s )
            speed = -0.005;

        velocity += ( speed - velocity ) * .3;
        mesh.translateZ( velocity );

        if ( keys.a )
            mesh.rotateY(0.05);
        else if ( keys.d )
            mesh.rotateY(-0.05);
        
        a.lerp(mesh.position, 0.4);
        b.copy(goal.position);
    
        dir.copy( a ).sub( b ).normalize();
        const dis = a.distanceTo( b ) - coronaSafetyDistance;
        goal.position.addScaledVector( dir, dis );
        goal.position.lerp(temp, 0.2);
        temp.setFromMatrixPosition(follow.matrixWorld);

        camera.lookAt(mesh.position);

        var delta = clock.getDelta();
        if ( mixer ) mixer.update( delta );

        renderer.render( scene, camera );
    }
});