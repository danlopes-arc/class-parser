import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync, ValidationError } from 'class-validator';
import { parseClassFactory, parseClass } from './class-parser';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validateSync: jest.fn(),
}));

jest.mock('class-transformer', () => ({
  ...jest.requireActual('class-transformer'),
  plainToInstance: jest.fn(),
}));

jest.mock('./class-parser');

const mockValidateSync = validateSync as jest.MockedFunction<typeof validateSync>;
const mockPlainToInstance = plainToInstance as jest.MockedFunction<typeof plainToInstance>;
const mockParseClassFactory = parseClassFactory as jest.MockedFunction<typeof parseClassFactory>;
const mockParseClass = parseClass as jest.MockedFunction<typeof parseClass>;

const actualParseClassFactory = jest.requireActual('./class-parser')
  .parseClassFactory as typeof parseClassFactory;
const actualParseClass = jest.requireActual('./class-parser').parseClass as typeof parseClass;

class TestClass {
  @IsString()
  name!: string;
  @IsNumber()
  count!: number;
}
describe('parseClassFactory', () => {
  it('parses class', () => {
    const rawObject = {};
    const expectedErrors: ValidationError[] = [];
    const expectedTransformedInstance = {};
    const expectedRawInstance = {};
    const transformOptions = {};
    const validateOptions = {};

    mockValidateSync.mockReturnValueOnce(expectedErrors);

    mockPlainToInstance.mockImplementation((cls, obj, options) => {
      if (options === transformOptions) {
        return expectedTransformedInstance;
      }

      expect(options).toEqual({
        ignoreDecorators: true,
      });

      return expectedRawInstance;
    });

    const parsed = actualParseClassFactory(TestClass, { transformOptions, validateOptions })(
      rawObject
    );

    expect(parsed).toBe(expectedTransformedInstance);

    expect(mockValidateSync).toHaveBeenCalledWith(expectedRawInstance, validateOptions);
  });

  it('can validate after transformation', () => {
    const rawObject = {};
    const expectedErrors: ValidationError[] = [];
    const expectedTransformedInstance = {};
    const expectedRawInstance = {};
    const transformOptions = {};
    const validateOptions = {};

    mockValidateSync.mockReturnValueOnce(expectedErrors);

    mockPlainToInstance.mockImplementation((cls, obj, options) => {
      if (options === transformOptions) {
        return expectedTransformedInstance;
      }

      expect(options).toEqual({
        ignoreDecorators: true,
      });

      return expectedRawInstance;
    });

    const parsed = actualParseClassFactory(TestClass, {
      transformOptions,
      validateOptions,
      validateAfterTransformation: true,
    })(rawObject);

    expect(parsed).toBe(expectedTransformedInstance);

    expect(mockValidateSync).toHaveBeenCalledWith(
      expectedTransformedInstance,
      validateOptions
    );
  });

  it('throws if validation fails parses class', () => {
    const rawObject = {};
    const expectedErrors = [new ValidationError()];
    const expectedTransformedInstance = {};
    const expectedRawInstance = {};
    const transformOptions = {};
    const validateOptions = {};

    mockValidateSync.mockReturnValueOnce(expectedErrors);

    mockPlainToInstance.mockImplementation((cls, obj, options) => {
      if (options === transformOptions) {
        return expectedTransformedInstance;
      }

      expect(options).toEqual({
        ignoreDecorators: true,
      });

      return expectedRawInstance;
    });

    expect(() =>
      actualParseClassFactory(TestClass, { transformOptions, validateOptions })(rawObject)
    ).toThrowError(expectedErrors.toString());
  });
});

describe('parseClass', () => {
  it('uses parseClassFactory', () => {
    const rawObject = {};
    const expectedTransformedInstance = {};
    const parseOptions = {};

    mockParseClassFactory.mockReturnValueOnce(
      () => expectedTransformedInstance as new (...args: never[]) => unknown
    );

    const result = actualParseClass(TestClass, rawObject, parseOptions);

    expect(result).toBe(expectedTransformedInstance);
  });
});
