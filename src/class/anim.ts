import * as fs from 'fs/promises';
import { module } from './modules';
import path from 'path'

class Anim {
  constructor(private scaledHeight: number, private imageX: number, private imageY: number) {}
  async test() {
    await new module().deleteFilesInFolder(path.join(__dirname, 'temp'))
    await new module().deleteFilesInFolder(path.join(__dirname, '..', '..', 'outputs'))
    await new module().frameSplit(2)
    await new module().createCanvas(this.scaledHeight, this.imageX, this.imageY, "../../outputs")
  }
  async start() {
    await new module().deleteFilesInFolder(path.join(__dirname, 'temp'))
    await new module().deleteFilesInFolder(path.join(__dirname, '..', '..', 'outputs'))
    await new module().frameSplit(10)
    await new module().createCanvas(this.scaledHeight, this.imageX, this.imageY, 'temp')
    await new module().createSpitesheet()
  }
}

export { Anim }