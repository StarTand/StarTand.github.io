'use strict'

window.addEventListener('DOMContentLoaded', init);

var init  = function() {
  console.log("start init");
  var width = window.parent.screen.width;
  var height = window.parent.screen.height;

  // レンダラーを作成.
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#myCanvas')
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.set(0, 0, +1000)
  init_env(scene);

  // create content.
  create_circle(scene);
  // 箱を作成
  const geometry = new THREE.BoxGeometry(500, 500, 500);
  const material = new THREE.MeshStandardMaterial({color: 0x0000FF});
  const box = new THREE.Mesh(geometry, material);
  scene.add(box);

  // end process.
  renderer.render(scene, camera);
}
var init_env = function(scene) {
  // new THREE.DirectionalLight(色)
  const light = new THREE.DirectionalLight(0xffffff);
  // ライトの位置を変更
  light.position.set(1, 1, 1);
  // シーンに追加
  scene.add(light);
}
var create_circle = function(scene) {
  var geometry = new THREE.CircleGeometry( 5, 32 );
  var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  var circle = new THREE.Mesh( geometry, material );
  scene.add( circle );
}
