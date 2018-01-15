// Create Class.
class WorldManager {
  // constructor.
  constructor() {
    this.World;
    // this.BallList = [[],[]];
    this.PhysicsManagerIns = new PhysicsManager();
    this.GameWidth = 8*(window.innerWidth * window.devicePixelRatio/100);
    this.GameHeight = 8*(window.innerHeight * window.devicePixelRatio/100);
    console.log(window.innerWidth * window.devicePixelRatio/100);
  }
  // .
  CreateWorld(){
    // set world.
    this.World = new p2.World({
      gravity : [0,0]
    });
    this.World.defaultContactMaterial.friction = 0;
    this.World.defaultContactMaterial.restitution = 1; // bounciness.
    // Ball.
    this.PhysicsManagerIns.CreateBall(this.World);
    this.PhysicsManagerIns.AddForce();
    // Plane.
    this.CreatePlane([0, -this.GameHeight/2], 0);
    this.CreatePlane([0, this.GameHeight/2 + this.PhysicsManagerIns.BallRadius*2], Math.PI); // Top
    this.CreatePlane([-this.GameWidth/2, 0], -Math.PI / 2); // Left
    this.CreatePlane([this.GameWidth/2, 0], Math.PI / 2); // Right
  }
  // Creates a physics plane at a given position
  CreatePlane(position, angle){
    var planeBody = new p2.Body({
      position: position,
      angle: angle
    });
    planeBody.addShape(new p2.Plane());
    this.World.addBody(planeBody);
    return planeBody;
  }
  // min から max までの乱数を返す関数
  GetRandomArbitary(min, max) {
    return Math.random() * (max - min) + min;
  }
  // 数値をワールド座標に変換する.
  static ScaleToWorld(value) {
    return value*(window.innerWidth * window.devicePixelRatio/100)
  }
}
// Ballの基本設定が入るクラス.
class BallSetting {
  constructor() {
    this.BallRadius = 3;
    this.BallZoomRadius = 6;
    this.BallVelocity = 0.1;
    this.LimitOfVelocity = 0.5;
    this.Zoom = false;
    this.BallList = [];
  }
}
// 物理演算用のクラス.
class PhysicsManager extends BallSetting {
  constructor() {
    super();
  }
  CreateBall(world) {
    // Create balls.
    for (var i = 0; i<5; i++) {
      var ballXPos = this.GetRandomArbitary(-WorldManager.ScaleToWorld(3), WorldManager.ScaleToWorld(3));
      var ballYPos = this.GetRandomArbitary(-WorldManager.ScaleToWorld(1), WorldManager.ScaleToWorld(1));
      // create ball body.
      let ballBody = new p2.Body({
        mass: 0.1,
        position: [ballXPos, ballYPos]
      });
      // Create ball shape.
      ballBody.addShape(new p2.Circle({ // Give it a circle shape
        radius: this.BallRadius
      }));
      ballBody.damping = 0;
      // add.
      this.BallList.push(ballBody);
      world.addBody(ballBody);
    }
  }
  // Add force to ball.
  AddForce() {
    var force = [this.GetRandomArbitary(-this.BallVelocity,this.BallVelocity)
      ,this.GetRandomArbitary(-this.BallVelocity,this.BallVelocity)];// 12.
    this.BallList.forEach(function(ball) {
      ball.applyForce(force);
    });
  }
  // min から max までの乱数を返す関数
  GetRandomArbitary(min, max) {
    return Math.random() * (max - min) + min;
  }
}
// three.jsを利用して描画するクラス.
class DrawManager extends BallSetting {
  constructor() {
    super();
    this.renderer;
    this.scene;
    this.camera;
  }
  Draw(phyBallList) {
    // init.
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );
    this.camera.position.z = 30;

    // Create Ball.
    for (var i = 0; i<phyBallList.length; i++) {
      // ボールを作成.
      var geometry = new THREE.CircleGeometry( this.BallRadius, 32 );
      var material = new THREE.MeshBasicMaterial( { color: 0xdddddd } );
      var mshBall = new THREE.Mesh( geometry, material );
      // ボールIDを付与する.
      phyBallList.BallId = i;
      mshBall.BallId = i;
      // add.
      this.BallList.push(mshBall);
      this.scene.add( mshBall );
    }
  }
}

// Globals
var WorldManagerIns = new WorldManager();
var DrawManagerIns = new DrawManager();

// Animation function.
var lastTime;
var maxSubSteps = 5; // Max physics ticks per render frame
var fixedDeltaTime = 1 / 30; // Physics "tick" delta time
function PhysicsAnimate(time){
  requestAnimationFrame(PhysicsAnimate);

  // Get the elapsed time since last frame, in seconds
  var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;

  // Make sure the time delta is not too big (can happen if user switches browser tab)
  deltaTime = Math.min(1 / 10, deltaTime);

  // Move physics bodies forward in time
  WorldManagerIns.World.step(fixedDeltaTime, deltaTime, maxSubSteps);

  lastTime = time;

  // マウス移動時にマウス位置にボールを追従させる処理.
  if (holdBall.length > 1) {
    holdBall[0].position[0] = mousePosition.x;
    holdBall[0].position[1] = mousePosition.y;
  }
}
function DrawAnimate(){
  requestAnimationFrame(DrawAnimate);

  // ここで物理計算オブジェクトの座標と描画用オブジェクトの座標を一致させる.
  for (i=0;i<DrawManagerIns.BallList.length;i++) {
    DrawManagerIns.BallList[i].position.x = WorldManagerIns.PhysicsManagerIns.BallList[i].position[0];
    DrawManagerIns.BallList[i].position.y = WorldManagerIns.PhysicsManagerIns.BallList[i].position[1];
  }

  DrawManagerIns.renderer.render(DrawManagerIns.scene, DrawManagerIns.camera);
}

// event
var holdBall = [,];   // ドラッグしているボールを格納する.
var selectBall = [,]; // ダブルクリックしたボールの情報を格納する.
var mousePosition = new THREE.Vector2();
function MouseDown(event){
  // マウス位置をワールド座標に変換して保持する.
  mousePosition = CameraTransformToWorld(event.clientX, event.clientY);

  // オブジェクトの取得
  var intersects = GetIntersectObjects(event.clientX,event.clientY);

  // WEBコンソールにオブジェクト上の座標を出力
  if (intersects[0]) {
    WorldManagerIns.PhysicsManagerIns.BallList.forEach(function(phyBall) {
      if(phyBall.BallId = intersects[0].object.BallId) {
        console.log(phyBall.BallId);
        // in the physics object and draw object.
        holdBall[0] = phyBall;
        holdBall[1] = intersects[0].object;
      }
    });
  }
}
function MouseMove(event) {
  // マウスクリック時のX,y座標
  mousePosition = CameraTransformToWorld(event.clientX, event.clientY);

  if (holdBall.length > 1) {
    holdBall[0].position[0] = mousePosition.x;
    holdBall[0].position[1] = mousePosition.y;
  }

}
function MouseUp(event) {
  holdBall = [,];
}
function MouseDblClick(event){
  // オブジェクトの取得
  var intersects = GetIntersectObjects(event.clientX,event.clientY);

  // ボールをダブルクリックしていれば.
  if (intersects[0]) {
    var _selectBall = [,];
    // 物理オブジェクトと描画オブジェクトをBallIdで照合.
    WorldManagerIns.PhysicsManagerIns.BallList.forEach(function(phyBall) {
      if(phyBall.BallId = intersects[0].object.BallId) {
        _selectBall[0] = phyBall;
        _selectBall[1] = intersects[0].object;
      }
    });

    // 物理オブジェクトと描画オブジェクトを2倍に拡大.
    // console.log(selectBall[0].shapes[0].radius);
    // console.log(selectBall[1].scale);
    _selectBall[0] = shapes[0].radius *= 2;
    _selectBall[1] = scale.set(2,2,0);

    // 選択していたボールは縮小する.
    if (selectBall.length > 1) {
      selectBall[0] = shapes[0].radius *= 0.5;
      selectBall[1] = scale.set(0.5,0.5,0);
    }

    selectBall = _selectBall;
  }
}
function CameraTransformToWorld(eX, eY) {
  var mouse = new THREE.Vector2();
  mouse.x = (eX / window.innerWidth) * 2 - 1;
  mouse.y = - (eY / window.innerHeight) * 2 + 1;

  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  vector.unproject( DrawManagerIns.camera );
  var dir = vector.sub( DrawManagerIns.camera.position ).normalize();
  var distance = - DrawManagerIns.camera.position.z / dir.z;
  var pos = DrawManagerIns.camera.position.clone().add( dir.multiplyScalar( distance ) );

  return pos;
}
// マウス位置と交わるオブジェクトを取得する.
function GetIntersectObjects(eX, eY) {
  var mouse = new THREE.Vector2();
  mouse.x =  ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

  // 取得したX、Y座標でrayの位置を更新
  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera( mouse, DrawManagerIns.camera );

  // オブジェクトの取得
  return raycaster.intersectObjects( DrawManagerIns.scene.children );
}
// Add mouse event listeners
window.addEventListener('mousedown', MouseDown);
window.addEventListener('mousemove', MouseMove);
window.addEventListener('mouseup', MouseUp);
window.addEventListener('dblclick', MouseDblClick);

// Initialize and start rendering the game!
// Initializes canvas, physics and input events
document.addEventListener("DOMContentLoaded", Main);
function Main() {
  // 物理オブジェクトを作り出す.
  WorldManagerIns.CreateWorld();
  // 描画オブジェクトを作り出す.
  DrawManagerIns.Draw(WorldManagerIns.PhysicsManagerIns.BallList);
  // 物理アニメーションを行う.
  requestAnimationFrame(PhysicsAnimate);
  // 描画アニメーションを行う.
  DrawAnimate();
}
