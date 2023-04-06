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
import { Response, Request } from 'express';
import * as fs from 'fs';
import { GenerateArtDto } from './dto/generate-art.dto';

@UseGuards(JwtAuthGuard)
@Controller('art')
export class ArtController {
  constructor(private readonly artService: ArtService) {}

  @Post()
  async generateArt(@Body() generateArt: GenerateArtDto, @Req() req) {
    const art = await this.artService.generateArt(
      generateArt.prompt,
      req.user.id,
    );

    return art;
  }

  @Get('images/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = `./images/${filename}`;

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
}
