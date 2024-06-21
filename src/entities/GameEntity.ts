import { Box3, Mesh, Sphere, Vector3 } from "three";

// discrimination for type of entity
type EntityType = "general" | "player" | "bullet";

abstract class GameEntity {
  protected _position: Vector3;
  protected _mesh: Mesh = new Mesh();
  public get mesh() {
    return this._mesh;
  }

  protected _collider?: Box3 | Sphere;
  public get collider() {
    return this._collider;
  }

  protected _entityType: EntityType;
  public get entityType() {
    return this._entityType;
  }

  // flag to let gamescene know this entity needs to be disposed
  protected _shouldDispose = false;
  public get shouldDispose() {
    return this._shouldDispose;
  }

  constructor(position: Vector3, entityType: EntityType) {
    this._position = position;
    this._entityType = entityType;
    this._mesh.position.set(
      this._position.x,
      this._position.y,
      this._position.z
    );
  }

  // methods
  public load = async () => {};
  public update = (_deltaT: number) => {};

  // method call before disposing entyty (to free resources)
  public dispose = () => {};
}

export default GameEntity;
