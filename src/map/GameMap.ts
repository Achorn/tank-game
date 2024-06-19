import { Vector3 } from "three";
import GameEntity from "../entities/GameEntity";

class MapTile extends GameEntity {
  constructor(position: vector3) {
    super(position);
  }
  public load = async () => {};
}

class GameMap extends GameEntity {
  private _size: number;
  constructor(position: Vector3, size: number) {
    super(position);
    this._size = size;
  }
}

export default GameMap;
