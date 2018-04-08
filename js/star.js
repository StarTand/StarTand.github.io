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
    // ...github.
    // 物理オブジェクトを作成する.
    var phyBall = this.PhysicsManagerIns.CreateBall(this.World);
    this.PhysicsManagerIns.AddForce(phyBall);
    // 描画オブジェクトを作り出す.
    var drawBall = this.DrawManagerIns.Draw_Github();

    // ボールオブジェクトをリストに追加.
    this.BallList[i] = new Ball(i, phyBall, drawBall);
    // ...twitter.
    // ....
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
    this.CreatePlane([0, this.GameHeight/2 + this.PhysicsManagerIns.BallRadius*2], Math.PI); // Top
    this.CreatePlane([0, -this.GameHeight/2], 0);
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
    this.ZoomFlag = false;
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
    // set inner variable.
    super();
    this.renderer;
    this.scene;
    this.camera;
    this.composer;

    // init.
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );
    this.camera.position.z = 30;

    // set postprocessing.
    this.composer = new THREE.EffectComposer(this.renderer);
    // let renderPass = new THREE.RenderPass(this.scene, this.camera);
    // let effectBloom = new THREE.Bloompass(1.0, 25, 2.0, 512);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
    this.composer.addPass(new THREE.BloomPass(4.0, 25, 2.0, 512));

    var toScreen = new THREE.ShaderPass(THREE.CopyShader);
    toScreen.renderToScreen = true;
    this.composer.addPass(toScreen);

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
  Draw_Github() {
    // github log.
    var texLoader = new THREE.TextureLoader();
    texLoader.crossOrigin = '*';
    var texture = texLoader.load('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Logo.png');
    // var loader = new THREE.FontLoader();
    // var font = loader.load('fonts/helvetiker_regular.typeface.json');
    // var text = new THREE.TextGeometry("Github", {font:font});
    // ボールを作成.
    var geometry = new THREE.CircleGeometry( this.BallRadius, 32 );
    var material = new THREE.MeshPhongMaterial( { map:texture } );
    var mshBall = new THREE.Mesh( geometry, material );
    // add.
    this.scene.add( mshBall );
    return mshBall;
  }
}
// マウスイベントを管理するクラス.
class MouseManager {
  constructor() {
    this.holdFlag;   // ボールをドラッグしたかどうか判定する.
    this.holdBall;   // ドラッグしているボールを格納する.
    this.selectBall; // ダブルクリックしたボールの情報を格納する.
    this.mousePosition = new THREE.Vector2();
  }
  MouseDown(cX, cY, worldManagerIns){

    // オブジェクトの取得
    var intersects = this.GetIntersectObjects(cX, cY
      , worldManagerIns.DrawManagerIns.camera, worldManagerIns.DrawManagerIns.scene);

    // ボールをクリックしている時.
    if (intersects[0]) {
      // マウス位置をワールド座標に変換して保持する.
      this.mousePosition = this.CameraTransformToWorld(cX, cY
        , worldManagerIns.DrawManagerIns.camera);

      // どのボールをクリックしたか判定する.
      var ballList = worldManagerIns.BallList;
      for (i=0;i<ballList.length;i++) {
        if(ballList[i].BallId == intersects[0].object.BallId) {
          console.log(ballList[i]);
          this.holdBall = ballList[i];
          console.log(this.holdBall.PhyBall);
        }
      }
    }
  }
  MouseWhileClick() {
    if (this.holdBall) {
      console.log(this.holdBall.PhyBall);
      // position.
      this.holdBall.PhyBall.position[0] = this.mousePosition.x;
      this.holdBall.PhyBall.position[1] = this.mousePosition.y;
      // velocity.
      // this.holdBall.PhyBall.velocity[0] = this.mousePosition.x * 3;
      // this.holdBall.PhyBall.velocity[1] = this.mousePosition.y * 3;
    }
  }
  MouseMove(cX, cY, worldManagerIns) {
    this.holdFlag = true;
    // マウスクリック時のX,y座標
    this.mousePosition = this.CameraTransformToWorld(cX, cY, worldManagerIns.DrawManagerIns.camera);

    if (this.holdBall) {
      // this.holdBall.PhyBall.position[0] = this.mousePosition.x;
      // this.holdBall.PhyBall.position[1] = this.mousePosition.y;
    }
  }
  MouseUp() {
    this.holdBall = null;
  }
  MouseDblClick(cX, cY, worldManagerIns){
    // オブジェクトの取得
    var intersects = this.GetIntersectObjects(cX, cY
      , worldManagerIns.DrawManagerIns.camera, worldManagerIns.DrawManagerIns.scene);


    // ボールをダブルクリックしていれば.
    if (intersects[0]) {
      var _selectBall;
      var ballList = worldManagerIns.BallList;
      // 物理オブジェクトと描画オブジェクトをBallIdで照合.
      for (i = 0; i < ballList.length; i++) {
        if(ballList[i].BallId == intersects[0].object.BallId) {
          _selectBall = ballList[i];
        }
      }

      // 物理オブジェクトと描画オブジェクトを2倍に拡大.
      _selectBall.PhyBall.shapes[0].radius *= 2;
      _selectBall.DrawBall.scale.set(2,2,1);
      _selectBall.ZoomFlag = true;

      // 選択していたボールは縮小する.
      if (this.selectBall) {
        this.selectBall.PhyBall.shapes[0].radius *= 0.5;
        this.selectBall.DrawBall.scale.set(1,1,1);
        this.selectBall.ZoomFlag = false;
      }
      // .
      this.selectBall = _selectBall;
    }
  }
  CameraTransformToWorld(cX, cY, camera) {
    var mouse = new THREE.Vector2();
    mouse.x = (cX / window.innerWidth) * 2 - 1;
    mouse.y = - (cY / window.innerHeight) * 2 + 1;

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject( camera );
    var dir = vector.sub( camera.position ).normalize();
    var distance = - camera.position.z / dir.z;
    var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

    return pos;
  }
  // マウス位置と交わるオブジェクトを取得する.
  GetIntersectObjects(cX, cY, camera, scene) {
    var mouse = new THREE.Vector2();
    mouse.x =  ( cX / window.innerWidth ) * 2 - 1;
    mouse.y = -( cY / window.innerHeight ) * 2 + 1;

    // 取得したX、Y座標でrayの位置を更新
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // オブジェクトの取得
    return raycaster.intersectObjects(scene.children);
  }
}

// Globals
var WorldManagerIns = new WorldManager();
var MouseManagerIns = new MouseManager();

// Animation function.
var lastTime;
var maxSubSteps = 5; // Max physics ticks per render frame
var fixedDeltaTime = 1 / 30; // Physics "tick" delta time
// 剛体計算.
function PhysicsAnimate(time){
  requestAnimationFrame(PhysicsAnimate);

  // Get the elapsed time since last frame, in seconds
  var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;

  // Make sure the time delta is not too big (can happen if user switches browser tab)
  deltaTime = Math.min(1 / 10, deltaTime);

  // Move physics bodies forward in time
  WorldManagerIns.World.step(fixedDeltaTime, deltaTime, maxSubSteps);

  lastTime = time;

  // マウスをクリックしている間にマウス位置にボールを追従させる処理.
  MouseManagerIns.MouseWhileClick();

  // ボールのスピードを抑制する.
  WorldManagerIns.BallSpeedControl();
}
// 描画計算..
function DrawAnimate(){
  requestAnimationFrame(DrawAnimate);

  // ここで物理計算オブジェクトの座標と描画用オブジェクトの座標を一致させる.
  for (i=0;i<WorldManagerIns.BallList.length;i++) {
    WorldManagerIns.BallList[i].DrawBall.position.x = WorldManagerIns.BallList[i].PhyBall.position[0];
    WorldManagerIns.BallList[i].DrawBall.position.y = WorldManagerIns.BallList[i].PhyBall.position[1];
  }
  // レンダリングする.
  var drawManagerIns = WorldManagerIns.DrawManagerIns;
  // drawManagerIns.renderer.render(drawManagerIns.scene, drawManagerIns.camera);
  drawManagerIns.composer.render();
}

// mouse event
window.addEventListener('mousedown', function(event) {
  MouseManagerIns.MouseDown(event.clientX, event.clientY, WorldManagerIns);
});
window.addEventListener('mousemove', function(event) {
  MouseManagerIns.MouseMove(event.clientX, event.clientY, WorldManagerIns);
});
window.addEventListener('mouseup', function(event) {
  MouseManagerIns.MouseUp();
});
window.addEventListener('dblclick', function(event) {
  MouseManagerIns.MouseDblClick(event.clientX, event.clientY, WorldManagerIns);
});


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
