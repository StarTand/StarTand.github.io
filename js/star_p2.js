// Create Class.
class WorldManager {
  // constructor.
  constructor() {
    this.World;
    this.BallList = [];
    this.PhysicsManagerIns = new PhysicsManager();
    this.DrawManagerIns = new DrawManager();
    this.GameWidth = 8*(window.innerWidth * window.devicePixelRatio/100);
    this.GameHeight = 8*(window.innerHeight * window.devicePixelRatio/100);
  }
  // .
  CreateWorld(){
    // set world.
    this.World = new p2.World({
      gravity : [0,0]
    });
    this.World.defaultContactMaterial.friction = 0;
    this.World.defaultContactMaterial.restitution = 1; // bounciness.

    // ボールを生成する.
    for (var i = 0; i<5;i++) {

      // 物理オブジェクトを作成する.
      var phyBall = this.PhysicsManagerIns.CreateBall(this.World);
      this.PhysicsManagerIns.AddForce(phyBall);
      // 描画オブジェクトを作り出す.
      var drawBall = this.DrawManagerIns.Draw();

      // ボールオブジェクトをリストに追加.
      this.BallList[i] = new Ball(i, phyBall, drawBall);
    }

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

  // ボールの速度を抑制する.
  BallSpeedControl() {
    var limitOfVelocity = this.PhysicsManagerIns.LimitOfVelocity;
    var decelerationRate = this.PhysicsManagerIns.DecelerationRate;
    for (var i = 0; i < this.BallList.length; i++) {
      // x velocity deceleration.
      if (this.BallList[i].PhyBall.velocity[0] > limitOfVelocity) {
        this.BallList[i].PhyBall.velocity[0] -= decelerationRate;
      }
      // x velocity deceleration.
      if (this.BallList[i].PhyBall.velocity[1] > limitOfVelocity) {
        this.BallList[i].PhyBall.velocity[1] -= decelerationRate;
      }
    }
  }
  // 数値をワールド座標に変換する.
  static ScaleToWorld(value) {
    return value*(window.innerWidth * window.devicePixelRatio/100)
  }
  // min から max までの乱数を返す関数
  static GetRandomArbitary(min, max) {
    return Math.random() * (max - min) + min;
  }
  // .
  OutputBallInfo() {
    // this.BallList.forEach(function(ball) {
    console.log("-----------------------------");
    for (var i = 0;i<this.BallList.length;i++) {
      console.log("");
      console.log("ball id   : " + this.BallList[i].BallId);
      console.log("ball phy  : " + this.BallList[i].PhyBall.BallId);
      console.log("ball draw : " + this.BallList[i].DrawBall.BallId);
    }
    console.log("-----------------------------");
  }
}
// Ballの基本設定が入るクラス.
class BallSetting {
  constructor() {
    this.BallRadius = 3;
    this.BallZoomRadius = 6;
    this.BallVelocity = 2.8;
    this.LimitOfVelocity = 3.6;
    this.DecelerationRate = 0.5; // LimitOfVelocityを上回る速度のときの減速の勢い.
  }
}
// .
class Ball {
  constructor(ballId, phyBall, drawBall) {
    this.PhyBall = phyBall;
    this.DrawBall = drawBall;

    this.BallId = ballId;
    this.PhyBall.BallId = ballId;
    this.DrawBall.BallId = ballId;
  }
}
// 物理演算用のクラス.
class PhysicsManager extends BallSetting {
  constructor() {
    super();
  }
  CreateBall(world) {
    // Create balls.
    var ballXPos = WorldManager.GetRandomArbitary(-WorldManager.ScaleToWorld(3), WorldManager.ScaleToWorld(3));
    var ballYPos = WorldManager.GetRandomArbitary(-WorldManager.ScaleToWorld(1), WorldManager.ScaleToWorld(1));
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
    world.addBody(ballBody);
    return ballBody;
  }
  // ボールに力を与える.
  AddForce(ball) {
    var randX = WorldManager.GetRandomArbitary(-this.BallVelocity,this.BallVelocity);
    var randY = WorldManager.GetRandomArbitary(-this.BallVelocity,this.BallVelocity);
    var force = [randX, randY];
    ball.applyForce(force);
  }
}
// three.jsを利用して描画するクラス.
class DrawManager extends BallSetting {
  constructor() {
    super();
    this.renderer;
    this.scene;
    this.camera;
    // init.
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );
    this.camera.position.z = 30;
  }
  Draw() {

    // ボールを作成.
    var geometry = new THREE.CircleGeometry( this.BallRadius, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0xdddddd } );
    var mshBall = new THREE.Mesh( geometry, material );
    // add.
    this.scene.add( mshBall );
    return mshBall;
  }
}

// Globals
var WorldManagerIns = new WorldManager();
// var DrawManagerIns = new DrawManager();

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

  // マウスドラッグ時にマウス位置にボールを追従させる処理.
  if (holdBall) {
    holdBall.PhyBall.position[0] = mousePosition.x;
    holdBall.PhyBall.position[1] = mousePosition.y;
  }
  // ボールのスピードを抑制する.
  WorldManagerIns.BallSpeedControl();
}
function DrawAnimate(){
  requestAnimationFrame(DrawAnimate);

  // ここで物理計算オブジェクトの座標と描画用オブジェクトの座標を一致させる.
  for (i=0;i<WorldManagerIns.BallList.length;i++) {
    WorldManagerIns.BallList[i].DrawBall.position.x = WorldManagerIns.BallList[i].PhyBall.position[0];
    WorldManagerIns.BallList[i].DrawBall.position.y = WorldManagerIns.BallList[i].PhyBall.position[1];
  }
  // レンダリングする.
  var drawManagerIns = WorldManagerIns.DrawManagerIns;
  drawManagerIns.renderer.render(drawManagerIns.scene, drawManagerIns.camera);
}

// event
var holdBall;   // ドラッグしているボールを格納する.
var selectBall = [,]; // ダブルクリックしたボールの情報を格納する.
var mousePosition = new THREE.Vector2();
function MouseDown(event){

  // オブジェクトの取得
  var intersects = GetIntersectObjects(event.clientX,event.clientY);

  // ボールをクリックしている時.
  if (intersects[0]) {
    // マウス位置をワールド座標に変換して保持する.
    mousePosition = CameraTransformToWorld(event.clientX, event.clientY);

    // どのボールをクリックしたか判定する.
    WorldManagerIns.BallList.forEach(function(Ball) {
      if(Ball.BallId == intersects[0].object.BallId) {
        holdBall = Ball;
      }
    });
  }
}
function MouseMove(event) {
  // マウスクリック時のX,y座標
  mousePosition = CameraTransformToWorld(event.clientX, event.clientY);

  if (holdBall) {
    holdBall.PhyBall.position[0] = mousePosition.x;
    holdBall.PhyBall.position[1] = mousePosition.y;
  }

}
function MouseUp(event) {
  holdBall = null;
}
function MouseDblClick(event){
  // オブジェクトの取得
  var intersects = GetIntersectObjects(event.clientX,event.clientY);

  // ボールをダブルクリックしていれば.
  if (intersects[0]) {
    var _selectBall;
    // 物理オブジェクトと描画オブジェクトをBallIdで照合.
    WorldManagerIns.PhysicsManagerIns.BallList.forEach(function(ball) {
      if(ball.BallId = intersects[0].object.BallId) {
        _selectBall = ball;
        // _selectBall[0] = phyBall;
        // _selectBall[1] = intersects[0].object;
      }
    });

    // 物理オブジェクトと描画オブジェクトを2倍に拡大.
    // console.log(selectBall[0].shapes[0].radius);
    // console.log(selectBall[1].scale);
    _selectBall.PhyBall.shapes[0].radius *= 2;
    _selectBall.DrawBall.scale.set(2,2,0);

    // 選択していたボールは縮小する.
    if (selectBall.length > 1) {
      selectBall.PhyBall.shapes[0].radius *= 0.5;
      selectBall.DrawBall.scale.set(0.5,0.5,0);
    }

    selectBall = _selectBall;
  }
}
function CameraTransformToWorld(eX, eY) {
  var mouse = new THREE.Vector2();
  mouse.x = (eX / window.innerWidth) * 2 - 1;
  mouse.y = - (eY / window.innerHeight) * 2 + 1;

  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  vector.unproject( WorldManagerIns.DrawManagerIns.camera );
  var dir = vector.sub( WorldManagerIns.DrawManagerIns.camera.position ).normalize();
  var distance = - WorldManagerIns.DrawManagerIns.camera.position.z / dir.z;
  var pos = WorldManagerIns.DrawManagerIns.camera.position.clone().add( dir.multiplyScalar( distance ) );

  return pos;
}
// マウス位置と交わるオブジェクトを取得する.
function GetIntersectObjects(eX, eY) {
  var mouse = new THREE.Vector2();
  mouse.x =  ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

  // 取得したX、Y座標でrayの位置を更新
  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera( mouse, WorldManagerIns.DrawManagerIns.camera );

  // オブジェクトの取得
  return raycaster.intersectObjects( WorldManagerIns.DrawManagerIns.scene.children );
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
  // オブジェクトを作り出す.
  WorldManagerIns.CreateWorld();

  // 物理アニメーションを行う.
  requestAnimationFrame(PhysicsAnimate);
  // 描画アニメーションを行う.
  DrawAnimate();

}
