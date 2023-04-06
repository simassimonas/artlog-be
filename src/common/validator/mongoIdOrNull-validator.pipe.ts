import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ObjectId } from 'mongodb'

@Injectable()
export class ValidateMongoIdOrNull implements PipeTransform<string> {
    transform(value: string, metadata: ArgumentMetadata): string {
        if (ObjectId.isValid(value)) {
            if ((String)(new ObjectId(value)) === value)
                return value;
            throw new BadRequestException({ message: "Invalid Mongo ObjectId" })
        }
        else if (value === "null") {
            return value;
        }

        throw new BadRequestException({ message: "Invalid Mongo ObjectId or not null" })
    };
}