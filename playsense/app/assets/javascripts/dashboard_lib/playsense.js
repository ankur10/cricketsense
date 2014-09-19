var finalPlaySenseObject = function() {

    var playSenseObj = {};

    playSenseObj.scene = null;
    playSenseObj.camera = null;
    playSenseObj.bat = null;
    playSenseObj.ball = null;
    playSenseObj.renderer = null;
    playSenseObj.clock = null;
    playSenseObj._mythisobj = null;
    playSenseObj.size = {};


    // ----------------------------------------------------
    //
    playSenseObj.init = function(options) {

        var camera_position = options.camera_position;

        var div_name = options.div_name;;
        var cricket_ground_div = $("#" + div_name);

        this.size = options.size;

        $(cricket_ground_div).empty();
        $(cricket_ground_div).html("");

        // create a render and set the size
        var renderer_obj = new THREE.WebGLRenderer();
        renderer_obj.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
        renderer_obj.setSize(this.size.width, this.size.height);
        renderer_obj.shadowMapEnabled = true;

        playSenseObj.renderer = renderer_obj;

        // add the output of the renderer to the html element
        $(cricket_ground_div).append(this.renderer.domElement);

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        // var scene = new THREE.Scene();
        var scene = new THREE.Scene();
        this.scene = scene;

        // Ground
        this.drawGround(this.scene);

        // Pitch
        this.drawPitch(this.scene);

        // Camera and controls
        var camera_and_controls = this.drawCameraAndControls(this.scene, camera_position);
        this.camera = camera_and_controls.camera;
        trackballControls = camera_and_controls.trackballControls;

        // Lights
        this.drawLight(this.scene);

        // Bat
        this.bat = this.drawBat(this.scene);

        // ball
        this.ball = this.drawBall(this.scene);
    }




    // ----------------------------------------------------
    //
    playSenseObj.rotateBatUsingSensorData = function(sensor_data) {

        var _mythisobj = this;

        var bat_height = 17;
        var start_rotation_angle = 0.9;
        var end_rotation_angle = -0.5;

        this.bat.rotation.z = start_rotation_angle;
        this.bat.position.x = 0 + bat_height * Math.sin(start_rotation_angle);
        this.bat.position.y = bat_height - bat_height * Math.cos(start_rotation_angle);

        var angle = start_rotation_angle;

        // populate coordinates
        // var points = [];
        var speed = 0.08;


        var ctr = 0;
        all_global_points = [];

        var gyrscope_data = []
        sensor_data.forEach(function(row) {

            var pdata = row.processed_data;
            var gyroscope = pdata.gyroscope;
            gyrscope_data.push(gyroscope);
        });


        gyrscope_data.forEach(function(row) {
            var pt = {
                rotation: {},
                position: {}
            };

            var angle = row.z;

            pt.rotation.x = 0;
            pt.rotation.y = 0;
            pt.rotation.z = angle;

            var x_pos = 0 + bat_height * Math.sin(angle);
            var y_pos = bat_height - bat_height * Math.cos(angle);
            var z_pos = 0;

            if (x_pos < 0) {
                z_pos = -0.1 * ctr;
                x_pos = -0.1 * ctr + bat_height * Math.sin(angle);

                pt.rotation.y = -0.2;
            }

            pt.position.x = x_pos;
            pt.position.y = y_pos;
            pt.position.z = z_pos;

            all_global_points.push(pt);

            ctr = ctr + 1;

        });


        console.log("all_global_points---> ", all_global_points);

        all_global_points = all_global_points.slice(0, 20)


        this.clock = new THREE.Clock();
        // render_new_inline();


        setInterval(my_new_render_func, 150);

        function my_new_render_func(){

            var delta = _mythisobj.clock.getDelta();
            var pt = all_global_points.shift();

            if (pt) {

                var bat_rot_angle =  pt.rotation.z * Math.PI/180;
                console.log(bat_rot_angle, pt.rotation.z);

                _mythisobj.bat.rotation.x = pt.rotation.x;
                _mythisobj.bat.rotation.y = pt.rotation.y;
                _mythisobj.bat.rotation.z = pt.rotation.z;

                $("#bat_rotation_angle").html(bat_rot_angle);

                _mythisobj.bat.position.x = pt.position.x;
                _mythisobj.bat.position.y = pt.position.y;
                _mythisobj.bat.position.z = pt.position.z;

                // if (pt.position.x < 0) {
                //     _mythisobj.ball.position.x = pt.position.x;
                //     _mythisobj.ball.position.y = 1;
                //     _mythisobj.ball.position.z = pt.position.z;
                // }
            }

            _mythisobj.renderer.render(_mythisobj.scene, _mythisobj.camera);
        }





        function render_new_inline() {

            var delta = _mythisobj.clock.getDelta();

            var pt = all_global_points.shift();

            if (pt) {


                // Absolute angle
                // var bat_rot = Math.sqrt(_mythisobj.bat.rotation.x * _mythisobj.bat.rotation.x + _mythisobj.bat.rotation.y * _mythisobj.bat.rotation.y + _mythisobj.bat.rotation.z * _mythisobj.bat.rotation.z);
                // var bat_rot_angle = bat_rot * 180 / Math.PI;
                // bat_rot_angle = bat_rot_angle.toFixed(1);                

                // if (pt.position.x > 0) {
                //     bat_rot_angle = -1.0 * bat_rot_angle;
                // }


                var bat_rot_angle =  pt.rotation.z * Math.PI/180;
                console.log(bat_rot_angle, pt.rotation.z);

                _mythisobj.bat.rotation.x = pt.rotation.x;
                _mythisobj.bat.rotation.y = pt.rotation.y;
                _mythisobj.bat.rotation.z = bat_rot_angle;



                $("#bat_rotation_angle").html(bat_rot_angle);

                _mythisobj.bat.position.x = pt.position.x;
                _mythisobj.bat.position.y = pt.position.y;
                _mythisobj.bat.position.z = pt.position.z;

                if (pt.position.x < 0) {
                    _mythisobj.ball.position.x = pt.position.x;
                    _mythisobj.ball.position.y = 1;
                    _mythisobj.ball.position.z = pt.position.z;
                }
            }

            trackballControls.update(delta);
            requestAnimationFrame(render_new_inline);

            _mythisobj.renderer.render(_mythisobj.scene, _mythisobj.camera);

        }
    }



    // ----------------------------------------------------
    //
    playSenseObj.drawAndRotateBatNew = function() {

        var _mythisobj = this;

        var bat_height = 17;
        var start_rotation_angle = 0.9;
        var end_rotation_angle = -0.5;

        this.bat.rotation.z = start_rotation_angle;
        this.bat.position.x = 0 + bat_height * Math.sin(start_rotation_angle);
        this.bat.position.y = bat_height - bat_height * Math.cos(start_rotation_angle);

        var angle = start_rotation_angle;

        // populate coordinates
        // var points = [];
        var speed = 0.08;

        all_global_points = [];

        var ctr = 0;

        while (angle > end_rotation_angle) {

            var pt = {
                rotation: {},
                position: {}
            };

            pt.rotation.x = 0;
            pt.rotation.y = 0;
            pt.rotation.z = angle;

            var x_pos = 0 + bat_height * Math.sin(angle);
            var y_pos = bat_height - bat_height * Math.cos(angle);
            var z_pos = 0;

            if (x_pos < 0) {
                z_pos = -0.1 * ctr;
                x_pos = -0.1 * ctr + bat_height * Math.sin(angle);

                pt.rotation.y = -0.2;
            }

            pt.position.x = x_pos;
            pt.position.y = y_pos;
            pt.position.z = z_pos;

            all_global_points.push(pt);

            angle = angle - 0.05;
            ctr = ctr + 1;
        }

        this.clock = new THREE.Clock();
        render_new_inline();


        function render_new_inline() {

            var delta = _mythisobj.clock.getDelta();

            var pt = all_global_points.shift();

            if (pt) {

                _mythisobj.bat.rotation.x = pt.rotation.x;
                _mythisobj.bat.rotation.y = pt.rotation.y;
                _mythisobj.bat.rotation.z = pt.rotation.z;

                // Absolute angle
                var bat_rot = Math.sqrt(_mythisobj.bat.rotation.x * _mythisobj.bat.rotation.x + _mythisobj.bat.rotation.y * _mythisobj.bat.rotation.y + _mythisobj.bat.rotation.z * _mythisobj.bat.rotation.z);
                var bat_rot_angle = bat_rot * 180 / Math.PI;
                bat_rot_angle = bat_rot_angle.toFixed(1);

                if (pt.position.x > 0) {
                    bat_rot_angle = -1.0 * bat_rot_angle;
                }

                $("#bat_rotation_angle").html(bat_rot_angle);

                _mythisobj.bat.position.x = pt.position.x;
                _mythisobj.bat.position.y = pt.position.y;
                _mythisobj.bat.position.z = pt.position.z;

                if (pt.position.x < 0) {
                    _mythisobj.ball.position.x = pt.position.x;
                    _mythisobj.ball.position.y = 1;
                    _mythisobj.ball.position.z = pt.position.z;
                }
            }

            trackballControls.update(delta);
            requestAnimationFrame(render_new_inline);

            _mythisobj.renderer.render(_mythisobj.scene, _mythisobj.camera);

        }
    }



    // ----------------------------------------------------
    // Camera and controls
    playSenseObj.updateCameraPosition = function(camera_position_new) {

        this.camera.position.x = camera_position_new.x;
        this.camera.position.y = camera_position_new.y;
        this.camera.position.z = camera_position_new.z;
        this.camera.lookAt(this.scene.position);
    }



    // ----------------------------------------------------
    // Camera and controls
    playSenseObj.drawCameraAndControls = function(scene, camera_position) {

        // create a camera, which defines where we're looking at.
        // var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        var camera = new THREE.PerspectiveCamera(45, this.size.width / this.size.height, 0.1, 1000);

        camera.position.x = camera_position.x;
        camera.position.y = camera_position.y;
        camera.position.z = camera_position.z;
        camera.lookAt(scene.position);

        var trackballControls = new THREE.TrackballControls(camera);
        trackballControls.rotateSpeed = 1.0;
        trackballControls.zoomSpeed = 1.0;
        trackballControls.panSpeed = 1.0;
        trackballControls.staticMoving = true;
        trackballControls.dynamicDampingFactor = 0.3;

        var obj = {};
        obj.camera = camera;
        obj.trackballControls = trackballControls;

        return obj;
    }



    // ----------------------------------------------------
    // Lights
    playSenseObj.drawLight = function(scene) {

        // add subtle ambient lighting
        var ambientLight = new THREE.AmbientLight(0x0c0c0c);
        scene.add(ambientLight);

        // add spotlight for the shadows
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-400, 180, 20);
        spotLight.castShadow = true;
        scene.add(spotLight);

    }


    // ----------------------------------------------------
    // Bat Object
    playSenseObj.drawBat = function(scene) {

        // Cube
        var material = new THREE.MeshLambertMaterial({
            color: 0x6B4423
        });
        var geom = new THREE.BoxGeometry(1.5, 8, 3);
        var cube = new THREE.Mesh(geom, material);
        cube.position.y = 8;
        cube.castShadow = true;

        // Cylinder
        var geometry = new THREE.CylinderGeometry(0.5, 0.5, 5);
        var material = new THREE.MeshBasicMaterial({
            color: 0xfeb24c
        });
        var cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.y = 14;
        cylinder.castShadow = true;

        // bat object
        var bat = new THREE.Object3D();
        bat.add(cube);
        bat.add(cylinder);
        scene.add(bat);

        return bat;
    }


    // ----------------------------------------------------
    // Ball Object
    playSenseObj.drawBall = function(scene) {

        var sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
        var sphereMaterial = new THREE.MeshLambertMaterial({
            color: 0xC41E3A
        });
        var ball = new THREE.Mesh(sphereGeometry, sphereMaterial);

        // position the sphere
        ball.position.x = 0;
        ball.position.y = 1;
        ball.position.z = 0;
        ball.castShadow = true;

        // add the sphere to the scene
        scene.add(ball);

        return ball;
    }


    // ----------------------------------------------------
    // Ground
    playSenseObj.drawGround = function(scene) {

        // ground
        var groundTexture = THREE.ImageUtils.loadTexture("/ground_lower_res.jpg");
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(25, 25);
        groundTexture.anisotropy = 16;
        var groundMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0xffffff,
            map: groundTexture
        });

        var ground_mesh = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), groundMaterial);
        ground_mesh.position.y = -1;
        ground_mesh.rotation.x = -Math.PI / 2;
        scene.add(ground_mesh);
    }


    // ----------------------------------------------------
    // Pitch
    playSenseObj.drawPitch = function(scene) {

        // ground plane
        var pitchTexture = THREE.ImageUtils.loadTexture("/ground_lower_res.jpg");
        pitchTexture.wrapS = pitchTexture.wrapT = THREE.RepeatWrapping;
        pitchTexture.repeat.set(5, 5);
        pitchTexture.anisotropy = 32;
        var pitchMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0xffffff,
            map: pitchTexture
        });
        var pitch_mesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 30, 1, 1), pitchMaterial);

        // rotate and position the plane
        pitch_mesh.rotation.x = -0.5 * Math.PI;
        pitch_mesh.position.x = -15
        pitch_mesh.position.y = 0
        pitch_mesh.position.z = 0

        // add the plane to the scene
        scene.add(pitch_mesh);

        this.drawPitchDecoration(scene);
    }



    // ----------------------------------------------------
    // Pitch Decoration
    playSenseObj.drawPitchDecoration = function(scene) {

        // wicket line
        var material1 = new THREE.LineBasicMaterial({
            color: 0xEEEEEE,
            linewidth: 5
        });
        var geometry1 = new THREE.Geometry();
        geometry1.vertices.push(new THREE.Vector3(0, 0, -14));
        geometry1.vertices.push(new THREE.Vector3(0, 0, 14));
        var line1 = new THREE.Line(geometry1, material1);
        scene.add(line1);

        // crease line
        var material_crease = new THREE.LineBasicMaterial({
            color: 0xEEEEEE,
            linewidth: 5
        });
        var geometry_crease = new THREE.Geometry();
        geometry_crease.vertices.push(new THREE.Vector3(9, 0, -14));
        geometry_crease.vertices.push(new THREE.Vector3(9, 0, 14));
        var line_crease = new THREE.Line(geometry_crease, material_crease);
        scene.add(line_crease);

        // left wide line
        var material_wide_line = new THREE.LineBasicMaterial({
            color: 0xEEEEEE,
            linewidth: 3
        });
        var geometry_left_wide = new THREE.Geometry();
        geometry_left_wide.vertices.push(new THREE.Vector3(0, 0, -14));
        geometry_left_wide.vertices.push(new THREE.Vector3(14, 0, -14));
        var line_wide_left = new THREE.Line(geometry_left_wide, material_wide_line);
        scene.add(line_wide_left);

        // right wide line
        var geometry_right_wide = new THREE.Geometry();
        geometry_right_wide.vertices.push(new THREE.Vector3(0, 0, 14));
        geometry_right_wide.vertices.push(new THREE.Vector3(14, 0, 14));
        var line_wide_right = new THREE.Line(geometry_right_wide, material_wide_line);
        scene.add(line_wide_right);


        // perpendicular line
        var material_perpendicular_line = new THREE.LineBasicMaterial({
            color: 0x162609,
            linewidth: 3
        });

        // wickets
        var material_wkt = new THREE.LineBasicMaterial({
            color: 0x6B4423,
            linewidth: 4
        });
        var x_pos_wkt = 9;
        var wicket_height = 10;
        var z_pos_wkt = -2;
        var space_between_wkt = 2;

        // draw wickets and perpendicular lines
        for (var i = 0; i < 3; i++) {
            var geometry_wkt = new THREE.Geometry();
            geometry_wkt.vertices.push(new THREE.Vector3(x_pos_wkt, 0, z_pos_wkt));
            geometry_wkt.vertices.push(new THREE.Vector3(x_pos_wkt, wicket_height, z_pos_wkt));
            var line_wkt = new THREE.Line(geometry_wkt, material_wkt);
            scene.add(line_wkt);

            var geometry_perpendicular_line = new THREE.Geometry();
            geometry_perpendicular_line.vertices.push(new THREE.Vector3(-20, 0, z_pos_wkt));
            geometry_perpendicular_line.vertices.push(new THREE.Vector3(15, 0, z_pos_wkt));
            var line = new THREE.Line(geometry_perpendicular_line, material_perpendicular_line);
            scene.add(line);

            z_pos_wkt = z_pos_wkt + space_between_wkt;
        }

        // vertical line
        var material2 = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 2
        });
        var geometry2 = new THREE.Geometry();
        geometry2.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry2.vertices.push(new THREE.Vector3(0, 25, 0));
        var line2 = new THREE.Line(geometry2, material2);
        scene.add(line2);

    }


    return playSenseObj;

}; // end of finalPlaySenseObject
