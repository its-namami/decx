export default class DecX {
  #_isNegative;
  #_digits;
  #_integer = {};
  #_decimal = {};
  static #_scale;
  static #_token;

  constructor(number, token = undefined) {
    if (token !== DecX.#_token) DecX.#callError('newDecXCalled');

    const numberString = DecX.#normalize(number);

    this.#decomposeNumber(numberString);
  }

  get digits() {
    return this.#_digits;
  }

  get isNegative() {
    return this.#_isNegative;
  }

  get integer() {
    return this.#_integer;
  }

  get sciNum() {
    return DecX.#enScientify(this.value);
  }

  get decimal() {
    return this.#_decimal;
  }

  get value() {
    return DecX.#formatToDecimal(this.#_digits.toString(), this.#_decimal?.length);
  }

  add(secondNumber) {
    if (secondNumber instanceof DecX === false) secondNumber = DecX.number(secondNumber);

    const maxDecimalLength = Math.max(this.#_decimal?.length ?? 0, secondNumber.#_decimal?.length ?? 0);
    const firstNumberValue = this.#rescaleDecimal(maxDecimalLength);
    const secondNumberValue = secondNumber.#rescaleDecimal(maxDecimalLength);
    const numberResult = firstNumberValue + secondNumberValue;

    return DecX.number(DecX.#formatToDecimal(numberResult, maxDecimalLength));
  }

  subtract(secondNumber) {
    if (secondNumber instanceof DecX === false) secondNumber = DecX.number(secondNumber);

    secondNumber.#_digits *= -1n; // invert sign
    secondNumber.#_isNegative ^= true; // toggle true | false

    return this.add(secondNumber);
  }

  multiply(secondNumber) {
    if (secondNumber instanceof DecX === false) secondNumber = DecX.number(secondNumber);

    const sumLength = (this.#_decimal?.length ?? 0) + (secondNumber.#_decimal?.length ?? 0);
    const numberResult = this.#_digits * secondNumber.#_digits;

    return DecX.number(DecX.#formatToDecimal(numberResult, sumLength));
  }

  divide(secondNumber) {
    if (secondNumber instanceof DecX === false) secondNumber = DecX.number(secondNumber);
    const maxDecimalLength = Math.max(this.#_decimal?.length ?? 0, secondNumber.#_decimal?.length ?? 0);
    const divident = this.#rescaleDecimal(maxDecimalLength);
    const divisor = secondNumber.#rescaleDecimal(maxDecimalLength);

    if (divisor === 0n) return DecX.#callError('divideZero');

    const adjustDividentForDivision = (divident, divisor, iterations = 0) => {
      if (iterations <= DecX.#_scale && divident % divisor !== 0n) {
        const newDivident = divident * 10n;
        iterations++; // THIS DOESN'T WORK
        return adjustDividentForDivision(newDivident, divisor, iterations);
      } else {
        return [divident, iterations];
      }
    }

    DecX.#_scale++;
    const [adjustedDivident, addedDecimals] = adjustDividentForDivision(divident, divisor);
    DecX.#_scale--;
    const quotient = (adjustedDivident / divisor).toString();
    const formattedQuotient = DecX.#formatToDecimal(quotient, addedDecimals);
    const DecXResult = DecX.number(formattedQuotient);

    return DecXResult;
  }

  sqrt() {
    if (this.#_isNegative) DecX.#callError('negativeForbidden', this.value);
    const sqrt = DecX.#newtonsMethodSqrt(this);

    return DecX.number(sqrt.value.slice(0, DecX.#_scale + 1 + sqrt.#_integer.length));
  }

  static get scale() {
    return DecX.#_scale;
  }

  static number(input) {
    const validatedInput = DecX.#validate(input);

    return new DecX(validatedInput, DecX.#_token);
  }

  static {
    DecX.#_scale = 9;
    DecX.#_token = Symbol('unique identifier');
    // aliases
    DecX.from = DecX.number;
    DecX.prototype.times = DecX.prototype.multiply;
    DecX.prototype.plus = DecX.prototype.add;
    DecX.prototype.minus = DecX.prototype.subtract;
    DecX.prototype.div = DecX.prototype.divide;
  }

  static setScale = scale => {
    if (typeof scale === 'number') {
      DecX.#validate(scale, 'scale');

      if (scale > 0) DecX.#_scale = scale;
      else DecX.#callError('numNeedMoreThanZero');
    } else {
      DecX.#callError('unsupportedType', scale);
    }

    return DecX;
  }

  static longScale() {
    DecX.setScale(20);
    return DecX;
  }

  #rescaleDecimal(scale) {
    const decimalsNeeded = scale - (this?.#_decimal?.length || 0);

    if (decimalsNeeded < 0) return this.#_digits / 10n ** -BigInt(decimalsNeeded);

    return this.#_digits * 10n ** BigInt(decimalsNeeded);
  }

  static #validate(number, mode = 'default') {
    switch (typeof number) {
      case 'string':
        break;
      case 'number':
        if (mode !== 'scale') DecX.#warning('inputNumber');
        number = number.toString();
        break;
      case 'bigint':
        number = number.toString();
        break;
      default:
        return DecX.#callError('unsupportedType', number);
    }

    number = number.trim();

    const validNumberRegex = (
      mode === 'scale'
      ? /^[+-]?(\d+)$/
      : /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/
    );

    if (!validNumberRegex.test(number)) return DecX.#callError('badNum', number);

    switch (mode) {
      case 'default':
        return number;
      case 'scale':
        return +number;
      default:
        DecX.#callError('unsupportedValidateMode');
    }
  }

  static #callError(error = 'default', info = undefined) {
    switch (error) {
      case 'numNeedMoreThanZero':
        throw new Error('\nThe number ${info} is invalid!\nMust be more than zero');
      case 'newDecXCalled':
        throw new Error('\nDecX constructor cannot be called directly.\nUse DecX.number() instead.');
      case 'unsupportedValidateMode':
        throw new Error (`\nUnsupported validate mode <${info}>!\nPlease refer to the documentation.`);
      case 'unsupportedType':
        throw new Error (`\nUnsupported type <${typeof info}>!\nPlease refer to the documentation.`);
      case 'badNum':
        if (info === '') info = 'empty string';

        throw new Error (`\nIncorrect number: <${info}> is not a valid number!`);
      case 'badScale':
        throw new Error (`\nCannot have less than 0 decimals: <${info}>!`);
      case 'divideZero':
        throw new Error ('\nCannot divide by zero!');
      case 'negSqrt':
        throw new Error ('\nSquare root of a negative number is imaginary!');
      case 'negativeForbidden':
        throw new Error (`\nNumber <${info}> not in range: only positive numbers allowed!`);
      case 'default':
        throw new Error ("\nFatal error, that's all we know...");
    }
  }

  static #warning(warning = 'default', info = undefined) {
    switch (warning) {
      case 'inputNumber':
        console.warn("Don't use number type: Prefer string or bigint input for higher precision and avoiding bugs");
        break;
      default:
        console.warn("This is a warning, that's all we know...");
    }
  }

  static #normalize = number => {
    const numberString = number.toString();
    const descientifiedNumber = (
      numberString.includes('e') || numberString.includes('E')
        ? DecX.#deScientify(numberString)
        : numberString
    );
    const scaledNumber = DecX.#trimNumberToScale(descientifiedNumber);
    const trimmedNumber = DecX.#trimZeroes(scaledNumber);

    return trimmedNumber;
  }

  static #formatToDecimal(digits, decimals) {
    const digitsString = digits.toString();
    const sign = digitsString[0] === '-' ? '-' : '';
    const pureDigitsString = digitsString.slice(sign.length);
    const digitsLength = pureDigitsString.length;


    const getResult = () => {
      const originalNumber = sign + pureDigitsString;
      if (decimals === 0 || decimals === undefined) {
        return originalNumber;
      } else if (decimals < 0) {
        return sign + pureDigitsString + '0'.repeat(-decimals);
      } else if (digitsLength > decimals) {
        return sign + pureDigitsString.slice(0, digitsLength - decimals) + '.' + pureDigitsString.slice(digitsLength - decimals);
      } else {
        return sign + '0.' + '0'.repeat(decimals - digitsLength) + pureDigitsString;
      }
    }

    const result = getResult();

    return DecX.#trimZeroes(result);
  }

  static #trimZeroes = numberString => {
    const dotIndex = numberString.indexOf('.');
    const sign = (numberString[0] === '-' ? '-' : '');
    numberString = numberString.replace('-', '').replace(/^0+/g, '');

    if (numberString.includes('.')) {
      numberString = numberString.replace(/0+$/g, '');

      if (numberString.at(-1) === '.') numberString = numberString.slice(0, -1);
      if (numberString.at(0) === '.') numberString = '0' + numberString;
    }

    const [mantissa, decimal] = numberString.split('.');

    if (mantissa === '' && decimal !== undefined) {
      numberString = '0.' + decimal;
    }

    return numberString === '' ? '0' : sign + numberString;
  }

  static #deScientify = str => {
    const [mantissa, exponent = '0'] = str.split('e');
    const [integer, decimal] = mantissa.split('.');
    const negativeExponent = exponent[0] === '-';
    const exponentValue = +(negativeExponent ? exponent.slice(1) : exponent);

    if (negativeExponent) {
      return DecX.#formatToDecimal(integer + (decimal ?? ''), exponentValue + (decimal?.length ?? 0));
    } else {
      return DecX.#formatToDecimal(integer + (decimal ?? ''), (decimal?.length ?? 0) - exponentValue);
    }
  }

  static #enScientify(stringNumber) {
    const validatedNumber = DecX.#validate(stringNumber);
    const realStringNumber = DecX.#trimZeroes(stringNumber);

    const getDescientifiedNumber = () => {
      if (validatedNumber.includes('e')
          || validatedNumber.includes('E')) {
        return DecX.#deScientify(realStringNumber);
      } else {
        return realStringNumber;
      }
    }

    const descientifiedNumber = getDescientifiedNumber();
    const [integer, decimal = ''] = descientifiedNumber.split('.');
    const sign = integer[0] === '-' ? '-' : '';
    const pureDigits = DecX.#trimZeroes((integer + decimal).slice(sign.length));

    const calculateMantissa = () => {
      const mantissaHasDecimal = pureDigits.length > 1;
      const mantissaWithDecimal = pureDigits[0] + '.' + pureDigits.slice(1);

      if (mantissaHasDecimal) {
        return sign + mantissaWithDecimal;
      } else {
        return sign + integer;
      }
    }

    const mantissa = calculateMantissa();
    const decimalPoint = descientifiedNumber.includes('.') ? '.' : '';
    const [mantissaInteger, mantissaDecimal] = mantissa.split('.');

    const calculateExponentValue = () => {
      const exponentIsPositive = pureDigits.length + sign.length === descientifiedNumber.length - decimalPoint.length;
      const positiveExponentValue = integer.length - mantissaInteger.length;
      const negativeExponentValue = pureDigits.length - descientifiedNumber.length + decimalPoint.length + sign.length;

      if (exponentIsPositive) {
        return positiveExponentValue;
      } else {
        return negativeExponentValue;
      }
    }

    const exponentValue = calculateExponentValue();
    const exponentString = exponentValue === 0 ? '' : 'e' + exponentValue;

    return(mantissa + exponentString);
  }

  static #roundLastDecimal(str) {
    const validatedString = DecX.#validate(str);
    const sign = validatedString[0] === '-' ? '-' : '';
    let absoluteDigits = BigInt(validatedString.replace(/^-|\./g, ''));
    const decimalLength = validatedString.split('.')[1]?.length ?? 0;

    if (absoluteDigits % 10n >= 5n) absoluteDigits += 10n;

    absoluteDigits -= absoluteDigits % 10n;
    absoluteDigits /= 10n;

    return DecX.#formatToDecimal(sign + absoluteDigits.toString(), Math.min(DecX.#_scale, decimalLength));
  }

  static #trimNumberToScale(str) {
    const validatedString = DecX.#validate(str);
    let [integer, decimal] = validatedString.split('.');
    const sign = validatedString[0] === '-' ? '-' : '';

    if (decimal === undefined || decimal.length <= DecX.#_scale) return validatedString;

    decimal = decimal.slice(0, DecX.#_scale + 1);
    return DecX.#roundLastDecimal(integer + '.' + decimal);
  }

  static #newtonsMethodSqrt(number) {
    if (number.#_digits === 0n) return number;
    // temporary increase for precision
    DecX.#_scale++;
    // safeguard
    const maxIterations = 100;

    // newtons Method
    const newGuess = currentGuess => currentGuess.add(number.divide(currentGuess)).divide('2');

    // initial guess for newtons method
    let currentGuess = DecX.number('1');

    for (let i = 0; i < maxIterations; i++) {
      const nextGuess = newGuess(currentGuess);
      const difference = currentGuess.subtract(nextGuess);
      const perfectPrecision = difference.#_digits === 0n;
      const hasEnoughPrecision = difference.#_decimal?.startsWith('0'.repeat(this.#_scale - 1)) ?? false;

      if (perfectPrecision || hasEnoughPrecision) break;
      else currentGuess = newGuess(currentGuess);
    }

    DecX.#_scale--;

    // automatically scales the decimal of guess down
    currentGuess = DecX.number(currentGuess.value);

    return currentGuess;
  }

  #decomposeNumber(str) {
    this.#_isNegative = str[0] === '-';
    this.#_digits = BigInt(str.replace(/\./g, ''));
    [this.#_integer, this.#_decimal] = str.split('.');

    if (this.#_isNegative) this.#_integer = this.#_integer.slice(1);
  }
}
