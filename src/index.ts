import { Anim } from "./class/anim";
import config from 'src/config.json'

new Anim(config.scaledImageHeight, config.imageX, config.imageY).start()
