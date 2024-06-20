import { Mesh, MeshStandardMaterial, Vector3 } from "three";
import GameEntity from "./GameEntity";
import ResourceManager from "../utils/ResourceManager";

class PlayerTank extends GameEntity {
  constructor(position: Vector3) {
    super(position);
  }
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
  };
}

export default PlayerTank;
