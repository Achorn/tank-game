import { Box3, Mesh, MeshStandardMaterial, Sphere, Vector3 } from "three";
import GameEntity from "./GameEntity";
import ResourceManager from "../utils/ResourceManager";
import GameScene from "../scene/GameScene";

type KeyboardState = {
  LeftPressed: boolean;
  RightPressed: boolean;
  UpPressed: boolean;
  DownPressed: boolean;
};

class PlayerTank extends GameEntity {
  private _rotation: number = 0;

  private _keyboardState: KeyboardState = {
    LeftPressed: false,
    RightPressed: false,
    UpPressed: false,
    DownPressed: false,
  };
  constructor(position: Vector3) {
    super(position);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        this._keyboardState.UpPressed = true;
        break;
      case "ArrowDown":
        this._keyboardState.DownPressed = true;
        break;
      case "ArrowLeft":
        this._keyboardState.LeftPressed = true;
        break;
      case "ArrowRight":
        this._keyboardState.RightPressed = true;
        break;
      default:
        break;
    }
  };
  private handleKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        this._keyboardState.UpPressed = false;
        break;
      case "ArrowDown":
        this._keyboardState.DownPressed = false;
        break;
      case "ArrowLeft":
        this._keyboardState.LeftPressed = false;
        break;
      case "ArrowRight":
        this._keyboardState.RightPressed = false;
        break;
      default:
        break;
    }
  };
  public load = async () => {
    // ask for the models and textures from the resource manager
    const tankeModel = ResourceManager.instance.getModel("tank");
    if (!tankeModel) {
      throw "unable to get tank model";
    }
    // model contains meshes we need for the scene
    const tankBodyMesh = tankeModel.scene.children.find(
      (model) => model.name === "Body"
    ) as Mesh;

    const tankTurretMesh = tankeModel.scene.children.find(
      (model) => model.name === "Turret"
    ) as Mesh;

    const tankBodyTexture = ResourceManager.instance.getTexture("tank-body");
    const tankTurretTexture =
      ResourceManager.instance.getTexture("tank-turret");

    if (
      !tankBodyMesh ||
      !tankTurretMesh ||
      !tankBodyTexture ||
      !tankBodyTexture
    ) {
      throw "unable to load player model or textures";
    }

    // with all assets, we can build final mesh and materials
    const bodyMaterial = new MeshStandardMaterial({
      map: tankBodyTexture,
    });

    const turretMaterial = new MeshStandardMaterial({
      map: tankTurretTexture,
    });

    tankBodyMesh.material = bodyMaterial;
    tankTurretMesh.material = turretMaterial;

    // add meshes as child of entity mesh

    this._mesh.add(tankBodyMesh);
    this._mesh.add(tankTurretMesh);

    //create collider for tank
    const collider = new Box3()
      .setFromObject(this._mesh)
      .getBoundingSphere(new Sphere(this._mesh.position.clone()));
    // this creates a sphere around the tank which is easier to calulate

    // reduce radius
    collider.radius *= 0.75;
    this._collider = collider;
  };
  public update = (deltaT: number) => {
    let computedRotation = this._rotation;
    let computedMovement = new Vector3(); // final movement for this frame
    const moveSpeed = 2; // in tiles per second
    if (this._keyboardState.LeftPressed) {
      computedRotation += Math.PI * deltaT;
    } else if (this._keyboardState.RightPressed) {
      computedRotation -= Math.PI * deltaT;
    }
    // kep computed rotation between 0 and 2PI
    const fullCircle = Math.PI * 2;
    if (computedRotation > fullCircle) {
      computedRotation = fullCircle - computedRotation;
    } else if (computedRotation < 0) {
      computedRotation = fullCircle + computedRotation;
    }
    // decompose movement depending on rotation
    const yMovement = moveSpeed * deltaT * Math.cos(computedRotation);
    const xMovement = moveSpeed * deltaT * Math.sin(computedRotation);
    if (this._keyboardState.UpPressed) {
      computedMovement = new Vector3(xMovement, -yMovement, 0);
    } else if (this._keyboardState.DownPressed) {
      computedMovement = new Vector3(-xMovement, yMovement, 0);
    }

    this._rotation = computedRotation;
    this._mesh.setRotationFromAxisAngle(new Vector3(0, 0, 1), computedRotation);

    //check for solid objects before moving the tank
    const testingSphere = this._collider?.clone() as Sphere;
    testingSphere.center.add(computedMovement);
    console.log(testingSphere);
    //search for possible collisions
    const colliders = GameScene.instance.gameEntities.filter(
      (e) =>
        // not self
        e !== this &&
        //has collider
        e.collider &&
        // collider is intersecting with tanks sphere
        e.collider!.intersectsSphere(testingSphere)
    );

    // something is blocking tank!!
    if (colliders.length) {
      return;
    }

    // update the current position by adding the movement
    this._mesh.position.add(computedMovement);

    // ..also update collider
    (this._collider as Sphere).center.add(computedMovement);

    // lock camera position to tank
    GameScene.instance.camera.position.set(
      this._mesh.position.x,
      this._mesh.position.y,
      GameScene.instance.camera.position.z
    );
  };
}

export default PlayerTank;
