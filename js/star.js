'use strict'

// init();
run_physicsjs();
function run_physicsjs() {
  Physics(function(world){

    var viewWidth = 500;
    var viewHeight = 300;

    var renderer = Physics.renderer('canvas', {
      el: 'viewport',
      width: viewWidth,
      height: viewHeight,
      meta: false, // don't display meta data
      styles: {
          // set colors for the circle bodies
          'circle' : {
              strokeStyle: '#351024',
              lineWidth: 1,
              fillStyle: '#d33682',
              angleIndicator: '#351024'
          }
      }
    });

    // add the renderer
    world.add( renderer );
    // render on each step
    world.on('step', function(){
      world.render();
    });

    // bounds of the window
    var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);

    // constrain objects to these bounds
    world.add(Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds,
        restitution: 0.99,
        cof: 0.99
    }));

    // add a circle
    world.add(
        Physics.body('circle', {
          x: 50, // x-coordinate
          y: 30, // y-coordinate
          vx: 0.2, // velocity in x-direction
          vy: 0.01, // velocity in y-direction
          radius: 20
        })
    );

    // ensure objects bounce when edge collision is detected
    world.add( Physics.behavior('body-impulse-response') );

    // add some gravity
    world.add( Physics.behavior('constant-acceleration') );

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time, dt ){

        world.step( time );
    });

    // start the ticker
    Physics.util.ticker.start();

  });
}
//
// function init() {
//   // start init.
//   var scene;
//   var camera;
//   var renderer;
//   scene = new THREE.Scene();
//   camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
//   renderer = new THREE.WebGLRenderer();
//   init_env(scene, camera, renderer);
//
//   // set content.
//   create_circle(scene);
//
//   // tick process.
//   var animate = function () {
//     requestAnimationFrame( animate );
//
//     renderer.render(scene, camera);
//   };
//
//   animate();
// }
// // 環境設定する.
// function init_env(scene, camera, renderer) {
//   // set renderer
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   document.body.appendChild(renderer.domElement);
//   // set camera.
//   camera.position.z = 5;
// };
// function create_circle(scene) {
//   var geometry = new THREE.CircleGeometry( 5, 32 );
//   var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
//   var circle = new THREE.Mesh( geometry, material );
//   scene.add( circle );
// }
// var circle = function() {
//   var myProto = GeHentai_Downloader.prototype;
//   myProto.Download = function(){
//   };
//   myProto.GetImageUrlArr = function() {
//     return imageUrlArr;
//   }
//   myProto.GetImageObjectArr = function(imageUrlArr) {
//   };
//   myProto.EndProcess = function(imageObjectArr) {
//   }
//   myProto.LoadAllImage = function() {
//   }
// };
