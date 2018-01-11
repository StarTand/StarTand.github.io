'use strict'

init();

function init() {
  // start init.
  var scene;
  var camera;
  var renderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer();
  init_env(scene, camera, renderer);

  // set content.
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  // tick process.
  var animate = function () {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;

    renderer.render(scene, camera);
  };

  animate();
}
// 環境設定する.
function init_env(scene, camera, renderer) {
  // set renderer
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  // set camera.
  camera.position.z = 5;
};
var create_circle = function(scene) {
  var geometry = new THREE.CircleGeometry( 5, 32 );
  var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  var circle = new THREE.Mesh( geometry, material );
  scene.add( circle );
}
var circle = function() {
  var myProto = GeHentai_Downloader.prototype;
  myProto.Download = function(){
  };
  myProto.GetImageUrlArr = function() {
    return imageUrlArr;
  }
  myProto.GetImageObjectArr = function(imageUrlArr) {
  };
  myProto.EndProcess = function(imageObjectArr) {
  }
  myProto.LoadAllImage = function() {
  }
};
