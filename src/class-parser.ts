import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer';
import { validateSync, ValidationOptions } from 'class-validator';

type Class = {
  new (...args: never[]): unknown;
};

interface ParseClassFactoryOptions {
  /**
   * If set to true, the validation will be done against the transformed
   * class instance, otherwise validation will be done against
   * the raw object.
   *
   * @default false
   */
  validateAfterTransformation?: boolean;

  /**
   * Options to be used when transforming the object.
   */
  transformOptions?: ClassTransformOptions;

  /**
   * Options to be used when validating the class instance.
   */
  validateOptions?: ValidationOptions;
}

/**
 * Creates a function that instantiates and validates a class.
 *
 * Obs.: By default, the transformation happens after the validation, so make sure to
 * use string validatorts (e.g. `IsNumberString` instead of `IsNumber`).
 * To change this behaviour, set validateAfterTransformation to true.
 *
 * @param cls The class to be intantiated and validated against.
 * @param options Options to be used in the transformation and validation.
 *
 * @returns The validate function that receives an object
 * and returns the class instance.
 */
export const parseClassFactory =
  <T extends Class>(cls: T, options?: ParseClassFactoryOptions) =>
  (obj: Record<string, unknown>): T => {
    const castClass = cls as unknown as ClassConstructor<T>;

    const rawInstance = plainToInstance(castClass, obj, {
      ignoreDecorators: true,
    });

    const convertedInstance = plainToInstance(castClass, obj, options?.transformOptions);

    const instanceToBeValidated = options?.validateAfterTransformation
      ? convertedInstance
      : rawInstance;

    const errors = validateSync(instanceToBeValidated, options?.validateOptions);

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return convertedInstance;
  };

/**
 * Parses an object to a class instance
 *
 * @param cls The class to be intantiated and validated against.
 * @param obj The souce object to be parsed
 * @param options: Options to be used in the transformation and validation.
 * @returns The parsed class instance
 */
export const parseClass = <T extends Class>(
  cls: T,
  obj: Record<string, unknown>,
  options?: ParseClassFactoryOptions
): T => {
  return parseClassFactory(cls, options)(obj);
};
