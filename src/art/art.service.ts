import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';
import { mockBase64Image } from 'src/common/mock/base64image';
import { v4 as uuidv4 } from 'uuid';
import { ArtRepository } from './art.repository';
import { Art, ArtDocument } from './schemas/art.schema';

@Injectable()
export class ArtService {
  constructor(
    private readonly httpService: HttpService,
    private readonly artRepository: ArtRepository,
  ) {}

  async generateArt(prompt: string, userId: string): Promise<Art> {
    try {
      const image = await this.fetchImage(prompt);
      const filename = this.saveImageToFileSystem(image);
      const art = await this.saveImageToDb(filename, userId, prompt);

      return art;
    } catch (error) {
      console.error('Error generating art:', error.message);
      throw new Error('Failed to generate art');
    }
  }

  async fetchImage(prompt: string): Promise<string> {
    const hm = process.env.AI_ART_GENERATOR_MOCK;
    if (process.env.AI_ART_GENERATOR_MOCK == 'true') {
      return mockBase64Image;
    }
    const apiUrl = process.env.AI_ART_GENERATOR_API;

    const requestBody = {
      prompt: prompt,
      negative_prompt: '',
      scheduler: 'EulerAncestralDiscreteScheduler',
      image_height: 512,
      image_width: 512,
      num_images: 1,
      guidance_scale: 7,
      steps: 30,
      seed: 4231,
    };

    const response = await firstValueFrom(
      this.httpService.post(apiUrl, requestBody),
    );

    const imageData = response.data.image;
  }

  saveImageToFileSystem(image: string) {
    const filename = `${uuidv4()}.png`;
    const filepath = `./images/${filename}`;
    fs.writeFileSync(filepath, image, { encoding: 'base64' });
    return filename;
  }

  async saveImageToDb(filename: string, userId: string, prompt: string) {
    return this.artRepository.create(filename, userId, prompt);
  }
}
