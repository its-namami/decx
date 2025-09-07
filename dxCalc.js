export default class DXCalc {
  #_isNegative;
  #_digits;
  #_integer = {};
  #_decimal = {};
  static #_scale;
  static #_token;

  constructor(number, token = undefined) {
    if (token !== DXCalc.#_token) DXCalc.#callError('newDXCalcCalled');

    const numberString = DXCalc.#normalize(number);

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
    return DXCalc.#enScientify(this.value);
  }

  get decimal() {
    return this.#_decimal;
  }

  get value() {
    return DXCalc.#formatToDecimal(this.#_digits.toString(), this.#_decimal?.length);
  }

  add(secondNumber) {
    if (secondNumber instanceof DXCalc === false) secondNumber = DXCalc.number(secondNumber);

    const maxDecimalLength = Math.max(this.#_decimal?.length ?? 0, secondNumber.#_decimal?.length ?? 0);
    const firstNumberValue = this.#rescaleDecimal(maxDecimalLength);
    const secondNumberValue = secondNumber.#rescaleDecimal(maxDecimalLength);
    const numberResult = firstNumberValue + secondNumberValue;

    return DXCalc.number(DXCalc.#formatToDecimal(numberResult, maxDecimalLength));
  }

  subtract(secondNumber) {
    if (secondNumber instanceof DXCalc === false) secondNumber = DXCalc.number(secondNumber);

    secondNumber.#_digits *= -1n; // invert sign
    secondNumber.#_isNegative ^= true; // toggle true | false

    return this.add(secondNumber);
  }

  multiply(secondNumber) {
    if (secondNumber instanceof DXCalc === false) secondNumber = DXCalc.number(secondNumber);

    const sumLength = (this.#_decimal?.length ?? 0) + (secondNumber.#_decimal?.length ?? 0);
    const numberResult = this.#_digits * secondNumber.#_digits;

    return DXCalc.number(DXCalc.#formatToDecimal(numberResult, sumLength));
  }

  divide(secondNumber) {
    if (secondNumber instanceof DXCalc === false) secondNumber = DXCalc.number(secondNumber);
    const maxDecimalLength = Math.max(this.#_decimal?.length ?? 0, secondNumber.#_decimal?.length ?? 0);
    const divident = this.#rescaleDecimal(maxDecimalLength);
    const divisor = secondNumber.#rescaleDecimal(maxDecimalLength);

    if (divisor === 0n) return DXCalc.#callError('divideZero');

    const adjustDividentForDivision = (divident, divisor, iterations = 0) => {
      if (iterations <= DXCalc.#_scale && divident % divisor !== 0n) {
        const newDivident = divident * 10n;
        iterations++; // THIS DOESN'T WORK
        return adjustDividentForDivision(newDivident, divisor, iterations);
      } else {
        return [divident, iterations];
      }
    }

    DXCalc.#_scale++;
    const [adjustedDivident, addedDecimals] = adjustDividentForDivision(divident, divisor);
    DXCalc.#_scale--;
    const quotient = (adjustedDivident / divisor).toString();
    const formattedQuotient = DXCalc.#formatToDecimal(quotient, addedDecimals);
    const DXCalcResult = DXCalc.number(formattedQuotient);

    return DXCalcResult;
  }

  sqrt() {
    if (this.#_isNegative) DXCalc.#callError('negativeForbidden', this.value);
    const sqrt = DXCalc.#newtonsMethodSqrt(this);

    return DXCalc.number(sqrt.value.slice(0, DXCalc.#_scale + 1 + sqrt.#_integer.length));
  }

  static get scale() {
    return DXCalc.#_scale;
  }

  static number(input) {
    if (input instanceof DXCalc) {
      return input;
    }


    const validatedInput = DXCalc.#validate(input);

    return new DXCalc(validatedInput, DXCalc.#_token);
  }

  static {
    DXCalc.#_scale = 9;
    DXCalc.#_token = Symbol('unique identifier');
    // aliases
    DXCalc.from = DXCalc.number;
    DXCalc.prototype.times = DXCalc.prototype.multiply;
    DXCalc.prototype.plus = DXCalc.prototype.add;
    DXCalc.prototype.minus = DXCalc.prototype.subtract;
    DXCalc.prototype.div = DXCalc.prototype.divide;
  }

  static setScale = scale => {
    if (typeof scale === 'number') {
      DXCalc.#validate(scale, 'scale');

      if (scale > 0) DXCalc.#_scale = scale;
      else DXCalc.#callError('numNeedMoreThanZero');
    } else {
      DXCalc.#callError('unsupportedType', scale);
    }

    return DXCalc;
  }

  static longScale() {
    DXCalc.setScale(20);
    return DXCalc;
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
        if (mode !== 'scale') DXCalc.#warning('inputNumber');
        number = number.toString();
        break;
      case 'bigint':
        number = number.toString();
        break;
      default:
        return DXCalc.#callError('unsupportedType', number);
    }

    number = number.trim();

    const validNumberRegex = (
      mode === 'scale'
      ? /^[+-]?(\d+)$/
      : /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/
    );

    if (!validNumberRegex.test(number)) return DXCalc.#callError('badNum', number);

    switch (mode) {
      case 'default':
        return number;
      case 'scale':
        return +number;
      default:
        DXCalc.#callError('unsupportedValidateMode');
    }
  }

  static #callError(error = 'default', info = undefined) {
    switch (error) {
      case 'numNeedMoreThanZero':
        throw new Error('\nThe number ${info} is invalid!\nMust be more than zero');
      case 'newDXCalcCalled':
        throw new Error('\nDXCalc constructor cannot be called directly.\nUse DXCalc.number() instead.');
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
        ? DXCalc.#deScientify(numberString)
        : numberString
    );
    const scaledNumber = DXCalc.#trimNumberToScale(descientifiedNumber);
    const trimmedNumber = DXCalc.#trimZeroes(scaledNumber);

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

    return DXCalc.#trimZeroes(result);
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
      return DXCalc.#formatToDecimal(integer + (decimal ?? ''), exponentValue + (decimal?.length ?? 0));
    } else {
      return DXCalc.#formatToDecimal(integer + (decimal ?? ''), (decimal?.length ?? 0) - exponentValue);
    }
  }

  static #enScientify(stringNumber) {
    const validatedNumber = DXCalc.#validate(stringNumber);
    const realStringNumber = DXCalc.#trimZeroes(stringNumber);

    const getDescientifiedNumber = () => {
      if (validatedNumber.includes('e')
          || validatedNumber.includes('E')) {
        return DXCalc.#deScientify(realStringNumber);
      } else {
        return realStringNumber;
      }
    }

    const descientifiedNumber = getDescientifiedNumber();
    const [integer, decimal = ''] = descientifiedNumber.split('.');
    const sign = integer[0] === '-' ? '-' : '';
    const pureDigits = DXCalc.#trimZeroes((integer + decimal).slice(sign.length));

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
    const validatedString = DXCalc.#validate(str);
    const sign = validatedString[0] === '-' ? '-' : '';
    let absoluteDigits = BigInt(validatedString.replace(/^-|\./g, ''));
    const decimalLength = validatedString.split('.')[1]?.length ?? 0;

    if (absoluteDigits % 10n >= 5n) absoluteDigits += 10n;

    absoluteDigits -= absoluteDigits % 10n;
    absoluteDigits /= 10n;

    return DXCalc.#formatToDecimal(sign + absoluteDigits.toString(), Math.min(DXCalc.#_scale, decimalLength));
  }

  static #trimNumberToScale(str) {
    const validatedString = DXCalc.#validate(str);
    let [integer, decimal] = validatedString.split('.');
    const sign = validatedString[0] === '-' ? '-' : '';

    if (decimal === undefined || decimal.length <= DXCalc.#_scale) return validatedString;

    decimal = decimal.slice(0, DXCalc.#_scale + 1);
    return DXCalc.#roundLastDecimal(integer + '.' + decimal);
  }

  static #newtonsMethodSqrt(number) {
    if (number.#_digits === 0n) return number;
    // temporary increase for precision
    DXCalc.#_scale++;
    // safeguard
    const maxIterations = 100;

    // newtons Method
    const newGuess = currentGuess => currentGuess.add(number.divide(currentGuess)).divide('2');

    // initial guess for newtons method
    let currentGuess = DXCalc.number('1');

    for (let i = 0; i < maxIterations; i++) {
      const nextGuess = newGuess(currentGuess);
      const difference = currentGuess.subtract(nextGuess);
      const perfectPrecision = difference.#_digits === 0n;
      const hasEnoughPrecision = difference.#_decimal?.startsWith('0'.repeat(this.#_scale - 1)) ?? false;

      if (perfectPrecision || hasEnoughPrecision) break;
      else currentGuess = newGuess(currentGuess);
    }

    DXCalc.#_scale--;

    // automatically scales the decimal of guess down
    currentGuess = DXCalc.number(currentGuess.value);

    return currentGuess;
  }

  #decomposeNumber(str) {
    this.#_isNegative = str[0] === '-';
    this.#_digits = BigInt(str.replace(/\./g, ''));
    [this.#_integer, this.#_decimal] = str.split('.');

    if (this.#_isNegative) this.#_integer = this.#_integer.slice(1);
  }
}
