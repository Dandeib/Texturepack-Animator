import { logger } from "src/utils/logger"
import * as fs from 'fs/promises';
import path from 'path'
import { spawn } from 'child_process'
import { Image, createCanvas, loadImage } from "canvas";
import Jimp from "jimp";

class module {
  async frameSplit(fps: number) { 
    logger.info('Starting frame splitting...');

    const inputPath = path.join(__dirname, '..', '..', 'inputs', 'input.mp4');
    const outputPattern = path.join(__dirname, 'temp', '%04d.png');

    const ffmpegArgs = [
      '-i', inputPath,    
      '-vf', `fps=${fps}`,   
      outputPattern       
    ];

    try {
      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);


      await new Promise<void>((resolve, reject) => {
        ffmpegProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`ffmpeg exited with code ${code}`))
          }
        });
      });

      logger.info('Finished frame splitting')
    } catch (error) {
      logger.error('Error during frame splitting:', error);
    }
  }

  async createCanvas(scaledHeight: number, imageX: number, imageY: number, output: string){

    logger.info('Start creating animation frames...')
  
    const NumImages = (await fs.readdir(path.join(__dirname, "temp"))).length

    const image = new Image()
    image.onerror = (err) => {
      throw err;
    };
    image.src = path.join(__dirname, '..', '..', 'inputs', 'layout.png')

    for (let i = 1; i <= NumImages; i++) {
      let formattedNumber = i.toString().padStart(4, "0");

      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.onerror = (err) => {
        throw err;
      };

      img.src = path.join(__dirname, `temp/${(formattedNumber)}.png`);

      const aspectRatio = img.width / img.height;
      const scaledWidth = Math.round(scaledHeight * aspectRatio);

      ctx.drawImage(
        img,
        imageX,
        imageY,
        scaledWidth,
        scaledHeight
      );

      ctx.drawImage(image, 0, 0);

      const filePath = path.join(__dirname, output, `${i}.png`);

      try {
        const fileHandle = await fs.open(filePath, 'w'); // Datei zum Schreiben öffnen ('w' = write)
    
        await fileHandle.write(canvas.toBuffer());
        await fileHandle.close()
    
        logger.info(`Processed image: ${i}.png`)
      } catch (error) {
        logger.error('Error writing image:', error);
      }

      fs.unlink(path.join(__dirname, 'temp', `${formattedNumber}.png`));

    }
    
    logger.info('Finished creating animation frames')
  }

  async createSpitesheet() {

    const image = new Image()
    image.onerror = (err) => {
      throw err;
    };
    image.src = path.join(__dirname, '..', '..', 'inputs', 'layout.png')

    const NumImages = (await fs.readdir(path.join(__dirname, "temp"))).length

    const IMAGE_WIDTH = image.width
    const IMAGE_HEIGHT = image.height
    const NUM_IMAGES = NumImages
    const IMAGES_PER_ROW = 1;
    const SPRITE_SHEET_WIDTH = IMAGE_WIDTH * IMAGES_PER_ROW;
    const SPRITE_SHEET_HEIGHT = IMAGE_HEIGHT * (NUM_IMAGES / IMAGES_PER_ROW);

      const spriteSheet = new Jimp(SPRITE_SHEET_WIDTH, SPRITE_SHEET_HEIGHT);

      for (let i = 1; i <= NUM_IMAGES; i++) {
        const imagePath = path.join(__dirname, "temp", `${i}.png`);
        const image = await Jimp.read(imagePath);

        const x = ((i - 1) % IMAGES_PER_ROW) * IMAGE_WIDTH;
        const y = Math.floor((i - 1) / IMAGES_PER_ROW) * IMAGE_HEIGHT;

        spriteSheet.composite(image, x, y);
      }

      await spriteSheet.writeAsync(path.join(__dirname, '..', '..', 'outputs', "spritesheet.png"));

      const folderPath = './temp'

      const files = await fs.readdir(path.join(__dirname, folderPath))

      files.forEach(file => {
        const filePath = path.join(folderPath, file);
  
        fs.unlink(path.join(__dirname, filePath));
      });

      logger.info('Spritesheet finished')

  }
  
  async deleteFilesInFolder(folderPath: string) {
    try {
      const entries = await fs.readdir(folderPath, { withFileTypes: true });
  
      for (const entry of entries) {
        const entryPath = path.join(folderPath, entry.name);
  
        if (entry.isFile()) {
          await fs.unlink(entryPath);
        } else if (entry.isDirectory()) {
          await this.deleteFilesInFolder(entryPath);
        }
      }
    } catch (err) {
      logger.error(`Error deleting files in ${folderPath}:`, err);
    }

    logger.info('Cleard temp files')
  }
}

export { module }