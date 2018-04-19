// Create Class.
class WorldManager {
  // constructor.
  constructor() {
    this.World;
    this.BallList = [];
    this.PhysicsManagerIns = new PhysicsManager();
    this.DrawManagerIns = new DrawManager();
    this.GameWidth = 6*(window.innerWidth * window.devicePixelRatio/100);
    this.GameHeight = 6*(window.innerHeight * window.devicePixelRatio/100);
  }
  // .
  CreateWorld(){
    // set world.
    this.World = new p2.World({gravity : [0,0]});
    this.World.defaultContactMaterial.friction = 0;
    this.World.defaultContactMaterial.restitution = 1; // bounciness.

    // ボールを生成する.
    this.CreateBalls();

    // Plane.
    this.CreatePlane([0, this.GameHeight/2 + this.PhysicsManagerIns.BallRadius*2], Math.PI); // Top
    this.CreatePlane([0, -this.GameHeight/2], 0);
    this.CreatePlane([-this.GameWidth/2, 0], -Math.PI / 2); // Left
    this.CreatePlane([this.GameWidth/2, 0], Math.PI / 2); // Right
  }
  // ボールを生成する.
  CreateBalls() {
    // declare variable.
    var ballCount = 0;
    var ballMax = 5;
    var phyBall;
    var drawBall;
    var baseMaterial = new THREE.MeshBasicMaterial( { color: 0xdddddd } );
    // set sertvice baseMaterial.
    // var texLoader = new THREE.TextureLoader();
    // texLoader.crossOrigin = '*';
    // var texture = texLoader.load('./image/Transition.png');
    var baseServiceTexture = new THREE.TextureLoader().load('./image/Transition.png');
    var baseServiceMaterial = new THREE.MeshBasicMaterial( { map: baseServiceTexture } );

    // info.
    var textInfo =
        "円形のUIを使ったポートフォリオサイトのようなものを目指して製作中のサイトです.<br>"
      + "描画用にthree.js,物理演算でp2.jsを利用しています.";
    phyBall = this.PhysicsManagerIns.CreateBall(this.World);
    drawBall = this.DrawManagerIns.Draw_Text('./image/info.png', textInfo);
    this.BallList.push(new Ball(ballCount++, phyBall, drawBall, ['info', 'text'], '', textInfo, baseMaterial));

    // github.
    phyBall = this.PhysicsManagerIns.CreateBall(this.World);
    drawBall = this.DrawManagerIns.Draw_Service('./image/github2.png');
    this.BallList.push(new Ball(ballCount++, phyBall, drawBall, ['service'],
      'https://github.com/StarTand', '', baseServiceMaterial
    ));

    // mail.
    var textInfo = "<a href=\"mailto:takeyouthwana@gmail.com\"><p>takeyouthwana@gmail.com</p></a>";
    phyBall = this.PhysicsManagerIns.CreateBall(this.World);
    drawBall = this.DrawManagerIns.Draw_Text('./image/mail.png', textInfo);
    this.BallList.push(new Ball(ballCount++, phyBall, drawBall, ['info', 'text', 'center'], '', textInfo, baseMaterial));
    this.BallList[ballCount-1].TextOffsetX = -55;
    this.BallList[ballCount-1].TextOffsetY = -15;

    // create other balls.
    while (ballCount < ballMax) {
      phyBall = this.PhysicsManagerIns.CreateBall(this.World);
      drawBall = this.DrawManagerIns.Draw();
      this.BallList.push(new Ball(ballCount++, phyBall, drawBall, ['normal'],
        '', '', baseMaterial
      ));
    }
    // add force to ball.
    for (var i = 0; i<this.BallList.lenght;i++) {
      this.PhysicsManagerIns.AddForce(this.BallList[i].PhyBall);
    }
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
  // ボールIDを照合して真偽を返す.
  CheckBallId(ball) {
    for (let i = 0; i < this.BallList.length; i++) {
      if(this.BallList[i].BallId == ball.BallId) {
        return this.BallList[i];
      }
    }
    return null;
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
  constructor(ballId, phyBall, drawBall, tagList, url, text, afterMaterial) {
    this.BallId = ballId;
    this.PhyBall = phyBall;
    this.DrawBall = drawBall;
    this.PhyBall.BallId = ballId;
    this.DrawBall.BallId = ballId;
    this.TagList = ['Ball'].concat(tagList);
    this.Url = url;
    this.BeforeMaterial = this.DrawBall.material;
    this.AfterMaterial = afterMaterial;
    this.ZoomFlag = false;
    this.UrlTransFlag = false; // url遷移した際に真にする.
    this.TextOffsetX = -50;
    this.TextOffsetY = -60;
  }
  CheckTag(tagName) {
    var exist = this.TagList.some(function(value) {
      return value == tagName}
    );
    return exist;
  }
  ZoomIn() {
    this.PhyBall.shapes[0].radius *= 2;
    this.DrawBall.scale.set(2,2,1);
    this.ZoomFlag = true;

    if (this.CheckTag("text")) {
      this.DrawBall.material = this.AfterMaterial;
      this.DrawBall.TextLabel.element.style.opacity = 1;
    }
  }
  ZoomOut() {
    this.PhyBall.shapes[0].radius *= 0.5;
    this.DrawBall.scale.set(1,1,1);
    this.ZoomFlag = false;
    this.UrlTransFlag = false;
    if (this.CheckTag("text")) {
      this.DrawBall.material = this.BeforeMaterial;
      this.DrawBall.TextLabel.element.style.opacity = 0;
    }
  }
  UrlTransition() {
    window.open(this.Url, '');
    this.UrlTransFlag = true;
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
    this.canvas;
    this.BallBasicMaterial = new THREE.MeshBasicMaterial( { color: 0xdddddd, fog: true } )

    // init.
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    this.canvas = document.getElementById('canvas');
    this.renderer = new THREE.WebGLRenderer({antialias: false});
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.canvas.appendChild( this.renderer.domElement );
    this.camera.position.set( 0, 0, 30 );

    // set postprocessing.
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
    this.composer.addPass(new THREE.BloomPass(1.5, 25, 0.3, 2048));//1024));//512));
    this.scene.fog = new THREE.FogExp2(0x0000ff, 0.00035);

    var toScreen = new THREE.ShaderPass(THREE.CopyShader);
    toScreen.renderToScreen = true;
    this.composer.addPass(toScreen);
  }
  Draw() {
    // ボールを作成.
    var textGeo = new THREE.CircleGeometry( this.BallRadius, 32 );
    // var material = new THREE.MeshBasicMaterial( { color: 0xdddddd } );
    var mshBall = new THREE.Mesh( textGeo, this.BallBasicMaterial );
    // add.
    this.scene.add( mshBall );
    return mshBall;
  }
  Draw_Service(imagePath) {
    // github log.
    var texLoader = new THREE.TextureLoader();
    texLoader.crossOrigin = '*';
    var texture = texLoader.load(imagePath);

    // create ball.
    var geometry = new THREE.CircleGeometry( this.BallRadius, 32 );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    var mshBall = new THREE.Mesh( geometry, material );

    // add.
    this.scene.add( mshBall );
    return mshBall;
  }
  Draw_Text(befImagePath, text) {
    // load texture.
    var texLoader = new THREE.TextureLoader();
    texLoader.crossOrigin = '*';
    var befTexture = texLoader.load(befImagePath);
    var scene = this.scene;

    // create ball.
    var textGeo = new THREE.CircleGeometry( this.BallRadius, 32 );
    var material = new THREE.MeshBasicMaterial( { map: befTexture } );
    var mshBall = new THREE.Mesh( textGeo, material );

    // create text.
    var textLabel = this.CreateTextLabel();
    textLabel.setHTML(text);
    textLabel.setParent(mshBall);
    mshBall.TextLabel = textLabel;
    this.canvas.appendChild(textLabel.element);

    // add.
    this.scene.add( mshBall );
    return mshBall;
  }
  CreateTextLabel() {
    var div = document.createElement('div');
    div.className = 'text-label';
    div.style.position = 'absolute';
    div.style.width = 100;
    div.style.height = 100;
    div.innerHTML = "hi there!";
    div.style.top = -1000;
    div.style.left = -1000;

    var _this = this;

    return {
      element: div,
      parent: false,
      position: new THREE.Vector3(0,0,0),
      setHTML: function(html) {
        this.element.innerHTML = html;
      },
      setParent: function(threejsobj) {
        this.parent = threejsobj;
      },
      updatePosition: function(offsetX, offsetY) {
        if(parent) {
          this.position.copy(this.parent.position);
        }

        var coords2d = this.get2DCoords(this.position, _this.camera);
        this.element.style.left = offsetX + coords2d.x + 'px';
        this.element.style.top = offsetY + coords2d.y + 'px';
      },
      get2DCoords: function(position, camera) {
        var vector = position.project(camera);
        vector.x = (vector.x + 1)/2 * window.innerWidth;
        vector.y = -(vector.y - 1)/2 * window.innerHeight;
        return vector;
      }
    };
  }
}
// マウスイベントを管理するクラス.
class MouseManager {
  constructor() {
    this.HoldFlag;   // ボールをドラッグしたかどうか判定する.
    this.HoldBall;   // ドラッグしているボールを格納する.
    this.SelectBall; // ダブルクリックしたボールの情報を格納する.
    this.MousePosition = new THREE.Vector2();
  }
  MouseDown(cX, cY, worldManagerIns){

    // オブジェクトの取得
    var intersects = this.GetIntersectObjects(cX, cY
      , worldManagerIns.DrawManagerIns.camera, worldManagerIns.DrawManagerIns.scene);

    // ボールをクリックしている時.
    if (intersects[0]) {
      // マウス位置をワールド座標に変換して保持する.
      this.MousePosition = this.CameraTransformToWorld(cX, cY
        , worldManagerIns.DrawManagerIns.camera);

      // どのボールをクリックしたか判定する.
      this.HoldBall = worldManagerIns.CheckBallId(intersects[0].object);

      // tagがserviceであり、拡大中かつ、url遷移前のときにurl遷移する.
      if (this.HoldBall.CheckTag("service") && this.HoldBall.ZoomFlag && !this.HoldBall.UrlTransFlag) {
        this.HoldBall.UrlTransition();
      }
    }
  }
  MouseWhileClick() {
    if (this.HoldBall) {
      // position.
      this.HoldBall.PhyBall.position[0] = this.MousePosition.x;
      this.HoldBall.PhyBall.position[1] = this.MousePosition.y;
      // velocity.
      // this.HoldBall.PhyBall.velocity[0] = this.MousePosition.x * 3;
      // this.HoldBall.PhyBall.velocity[1] = this.MousePosition.y * 3;
    }
  }
  MouseMove(cX, cY, worldManagerIns) {
    this.HoldFlag = true;
    // マウスクリック時のX,y座標
    this.MousePosition = this.CameraTransformToWorld(cX, cY, worldManagerIns.DrawManagerIns.camera);

    if (this.HoldBall) {
      // this.HoldBall.PhyBall.position[0] = this.MousePosition.x;
      // this.HoldBall.PhyBall.position[1] = this.MousePosition.y;
    }
  }
  MouseUp() {
    this.HoldBall = null;
  }
  MouseDblClick(cX, cY, worldManagerIns){
    // オブジェクトの取得
    var intersects = this.GetIntersectObjects(cX, cY
      , worldManagerIns.DrawManagerIns.camera, worldManagerIns.DrawManagerIns.scene);

    // ボールをダブルクリックしていれば.
    if (intersects[0]) {
      // BallIdを照合.
      var selectBall = worldManagerIns.CheckBallId(intersects[0].object);

      // 物理オブジェクトと描画オブジェクトを2倍に拡大.
      selectBall.ZoomIn();

      // 選択していたボールは縮小する.
      if (this.SelectBall) {
        this.SelectBall.ZoomOut();
      }
      // .
      this.SelectBall = selectBall;

      console.log(this.SelectBall);
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

  // ここで物理計算オブジェクトの座標と描画用オブジェクトの座標を一致させる.
  WorldManagerIns.BallList.forEach(function( ball ) {
    ball.DrawBall.position.x = ball.PhyBall.position[0];
    ball.DrawBall.position.y = ball.PhyBall.position[1];

    // textタグのボールのテキスト位置を更新する.
    if (ball.CheckTag("text")) {
      ball.DrawBall.TextLabel.updatePosition(ball.TextOffsetX, ball.TextOffsetY);
    }
  });
}
// 描画計算..
function DrawAnimate(){
  requestAnimationFrame(DrawAnimate);
  // レンダリングする.
  var drawManagerIns = WorldManagerIns.DrawManagerIns;
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
