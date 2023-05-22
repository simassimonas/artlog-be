import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ArtService } from './art.service';
import { Response } from 'express';
import * as fs from 'fs';
import { GenerateArtDto } from './dto/generate-art.dto';
import { ArtDocument } from './schemas/art.schema';

@UseGuards(JwtAuthGuard)
@Controller('art')
export class ArtController {
  constructor(private readonly artService: ArtService) {}

  @Post()
  async generateArt(@Body() generateArt: GenerateArtDto, @Req() req) {
    return this.artService.generateArt(generateArt.prompt, req.user.id);
  }

  @Get('images/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = `./images/art/${filename}`;

    if (!fs.existsSync(filepath)) {
      res.status(404).send('Image not found');
    }

    // Read the file as a buffer
    const file = fs.readFileSync(filepath);

    // Set the Content-Type header based on the file type
    const ext = filename.split('.').pop();
    const contentType = `image/${ext}`;
    res.set('Content-Type', contentType);

    res.send(file);
  }

  @Get('')
  async getArt(
    @Req() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{
    art: ArtDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    return this.artService.getArt(req.user.id, page, limit);
  }
}
