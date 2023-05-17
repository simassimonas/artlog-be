import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';
import { mockBase64Image } from 'src/common/mock/base64image';
import { v4 as uuidv4 } from 'uuid';
import { ArtRepository } from './art.repository';
import { Art, ArtDocument } from './schemas/art.schema';
import { FilterQuery } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { delay } from 'src/common/services/utils';

@Injectable()
export class ArtService {
  constructor(
    private readonly httpService: HttpService,
    private readonly artRepository: ArtRepository,
    private readonly usersService: UsersService,
  ) {}

  async checkIfUserCanGenerateArt(userId: string) {
    const user = await this.usersService.getUserById(userId);

    if (!user || user.credits < Number(process.env.AI_ART_GENERATION_COST)) {
      throw new ForbiddenException('Not enough credits to perform action');
    }

    return true;
  }

  async generateArt(prompt: string, userId: string): Promise<Art> {
    await this.checkIfUserCanGenerateArt(userId);

    try {
      const image = await this.fetchImage(prompt);
      const filename = this.saveImageToFileSystem(image);
      const art = await this.saveImageToDb(filename, userId, prompt);
      const updatedUser = await this.usersService.updateUser(userId, {
        $inc: { credits: -Number(process.env.AI_ART_GENERATION_COST) },
      });

      return art;
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate art');
    }
  }

  async fetchImage(prompt: string): Promise<string> {
    if (process.env.AI_ART_GENERATOR_MOCK == 'true') {
      await delay(1500); // mock the wait time of real AI art generator
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
      steps: 90,
      seed: 4231,
    };

    const response = await firstValueFrom(
      this.httpService.post(apiUrl, requestBody),
    );

    const imageData = response.data.images[0];
    return imageData;
  }

  saveImageToFileSystem(image: string) {
    const filename = `test-${uuidv4()}.png`;
    const filepath = `./images/art/${filename}`;
    fs.writeFileSync(filepath, image, { encoding: 'base64' });
    return filename;
  }

  async saveImageToDb(filename: string, userId: string, prompt: string) {
    return this.artRepository.create(filename, userId, prompt);
  }

  async getArt(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    art: ArtDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    const filterQuery: FilterQuery<ArtDocument> = {
      receiverId: userId,
    };
    const sortQuery = { createdAt: -1 };

    return this.getPaginatedArt(filterQuery, sortQuery, page, limit);
  }

  async getPaginatedArt(
    filterQuery: FilterQuery<ArtDocument>,
    sortQuery: any,
    page: number,
    limit: number,
  ): Promise<{
    art: ArtDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    const skip = page * limit;

    const art = await this.artRepository.find(
      filterQuery,
      sortQuery,
      skip,
      limit,
    );

    const hasNextPage =
      (await this.artRepository.find(filterQuery, {}, skip + limit, 1)).length >
      0;

    return {
      art,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : null,
    };
  }
}
