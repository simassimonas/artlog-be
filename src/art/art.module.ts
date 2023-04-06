import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtController } from './art.controller';
import { ArtRepository } from './art.repository';
import { ArtService } from './art.service';
import { Art, ArtSchema } from './schemas/art.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Art.name, schema: ArtSchema }]),
  ],
  controllers: [ArtController],
  providers: [ArtService, ArtRepository],
})
export class ArtModule {}
