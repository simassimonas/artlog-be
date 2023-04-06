import { registerDecorator, ValidationOptions } from 'class-validator';
import { Types } from 'mongoose';

export function isMongoObjectIdOrNull(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isMongoObjectIdOrNull',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    return (Types.ObjectId.isValid(value) && (new Types.ObjectId(value).toString() === value)) || value === null
                },
                defaultMessage() {
                    return "Invalid Mongo ObjectId"
                }
            },
        });
    };
}