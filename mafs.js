class Mafs {
  #isNegative;
  #absDigits;
  #decimalLength;
  #rawDigits;

  constructor(number) {
    let numberString = number.toString();

    if (numberString.indexOf('e') !== -1) {
      numberString = Mafs.#deScientify(numberString);
    }

    numberString = Mafs.#trimZeroes(numberString);

    let decimalPointPosition = numberString.indexOf('.') + 1;

    this.#absDigits = BigInt(numberString.replace(/-|\./g, ''));
    this.#isNegative = numberString[0] === '-';
    this.#rawDigits = (this.#isNegative ? this.#absDigits * -1n : this.#absDigits);

    if (decimalPointPosition === 0) {
      this.#decimalLength = 0;
    } else {
      this.#decimalLength = numberString.length - decimalPointPosition;
    }
  }

  get value() {
    return Mafs.#normalize(this.#rawDigits.toString(), this.#decimalLength);
  }

  sqrt() {
    const number = this.#getCopy();

    const precision = 17n;
    let seeking = number.#rawDigits * 10n ** precision;
    let lowerLimit = 1n * 10n ** (precision);
    let upperLimit = number.#rawDigits * 10n ** (precision);
    let tolerance = 10n ** BigInt(number.#rawDigits.toString().length);

    const calculate = {
      get average() {
        return (lowerLimit + upperLimit) / 2n;
      },
      get averageSquared() {
        return (this.average ** 2n) / 10n ** precision;
      }
    };

    if (number.#absDigits === 0n) return 0;

    if (number.value[0] !== '0' && !number.#isNegative) {
      let i = 0;

      while (i < 500) {
        i++;

        if (calculate.averageSquared >= seeking && calculate.averageSquared - tolerance < seeking) {
          break;
        } else {
          if (calculate.averageSquared > seeking) {
            upperLimit = calculate.average;
          } else {
            lowerLimit = calculate.average;
          }
        }
      }

      return Mafs.number(Mafs.#normalize(calculate.average, calculate.average.toString().length - Math.round(number.#absDigits.length / 2)));

    } else if (!number.#isNegative) {
      seeking = seeking * 10n ** BigInt(number.#decimalLength);
      upperLimit = seeking;
      let i = 0;

      while (i < 500) {
        i++;

        if (calculate.averageSquared >= seeking && calculate.averageSquared - tolerance < seeking) {
          break;
        } else {
          if (calculate.averageSquared > seeking) {
            upperLimit = calculate.average;
          } else {
            lowerLimit = calculate.average;
          }
        }
      }

      return Mafs.number(Mafs.#normalize(calculate.average, calculate.average.toString().length + number.#absDigits.length / 2 - 1));
    } else {
      return Mafs.#error('negSqrt');
    }
  }

  add(secondNumber) {
    const firstNumber = this.#getCopy();

    if (secondNumber instanceof Mafs === false) secondNumber = Mafs.number(secondNumber);

    const maxLen = Math.max(firstNumber.#absDigits.length, secondNumber.#absDigits.length);
    const maxDecimalLen = Math.max(firstNumber.#decimalLength, secondNumber.#decimalLength);
    const firstNumberValue = firstNumber.#growDecimal(maxDecimalLen);
    const secondNumberValue = secondNumber.#growDecimal(maxDecimalLen);
    const numberResult = firstNumberValue + secondNumberValue;

    return Mafs.number(Mafs.#normalize(numberResult, maxDecimalLen));
  }

  multiply(secondNumber) {
    const firstNumber = this.#getCopy();

    if (secondNumber instanceof Mafs === false) secondNumber = Mafs.number(secondNumber);

    const sumLen = firstNumber.#decimalLength + secondNumber.#decimalLength;
    const numberResult = firstNumber.#rawDigits * secondNumber.#rawDigits;

    return Mafs.number(Mafs.#normalize(numberResult, sumLen));
  }

  divide(secondNumber) {
    const firstNumber = this.#getCopy();

    if (secondNumber instanceof Mafs === false) secondNumber = Mafs.number(secondNumber);

    const maxLen = Math.max(firstNumber.#absDigits.length, secondNumber.#absDigits.length);
    const maxDecimalLen = Math.max(firstNumber.#decimalLength, secondNumber.#decimalLength);
    let firstNumberValue = firstNumber.#growDecimal(maxDecimalLen);
    const secondNumberValue = secondNumber.#growDecimal(maxDecimalLen);

    if (secondNumberValue === 0n) return Mafs.#error('divideZero');

    let decimals = 0;

    for (let i = 0; i < 15; i++) {
      if (firstNumberValue % secondNumberValue !== 0n) {
        firstNumberValue *= 10n;
        decimals++;
      } else {
        break;
      }
    }

    const result = (firstNumberValue / secondNumberValue).toString();

    return Mafs.number(Mafs.#normalize(result, decimals));
  }

  static number(input) {
    Mafs.#validate(input);

    if (typeof input === "number") {
      Mafs.#warning('inputNumber');
      return new Mafs(input.toString());
    } else {
      return new Mafs(input);
    }
  }

  #getCopy() {
    return Mafs.number(this.value);
  }

  #growDecimal(scale) {
    const decimalsNeeded = scale - this.#decimalLength;

    if (decimalsNeeded < 0) return Mafs.#error('badScale', decimalsNeeded);

    return this.#rawDigits * 10n ** BigInt(decimalsNeeded);
  }

  static #validate(number) {
    switch (typeof number) {
      case 'string':
        break;
      case 'number':
        number = number.toString();
        break;
      case 'bigint':
        number = number.toString();
        break;
      default:
        return Mafs.#error('badNum', number);
    }

    const validNumberRegex = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

    if (!validNumberRegex.test(number)) return Mafs.#error('badNum', number);
  }

  static #error(error = 'default', info = undefined) {
    switch (error) {
      case 'badNum':
        throw new Error (`\nIncorrect number: '${info}' is not a valid number!`);
      case 'badScale':
        throw new Error (`\nCannot have less than 0 decimals: (${info})!`);
      case 'divideZero':
        throw new Error ('\nCannot divide by zero!');
      case 'negSqrt':
        throw new Error ('\nSquare root of a negative number is imaginary!');
      case 'default':
        throw new Error ("\nFatal error, that's all we know...");
    }
  }

  static #warning(warning = 'default', info = undefined) {
    switch (warning) {
      case 'sqrtIsOverItterated':
        console.warn(`Sqrt calculation went above planned iterations: forcefully returning current close-enough sqrt`);
        break;
      case 'inputNumber':
        console.warn(`Don't use numbers: Prefer string or bigint input for precision`);
        break;
      default:
        console.warn("There's some warning, that's all we know...");
    }
  }

  static #normalize(digits, decimals) {
    const sign = (digits.toString()[0] === '-' ? '-' : '');
    digits = (sign === '-' ? digits.toString().slice(1) : digits.toString());
    const digitsLength = digits.length - (digits[0] === '-' ? 1 : 0);

    if (decimals === 0 || decimals === undefined) {
      return sign + digits;
    } else if (digitsLength > decimals) {
      return sign + digits.slice(0, digits.length - decimals) + '.' + digits.slice(digits.length - decimals);
    } else {
      return sign + '0.' + '0'.repeat(decimals - digitsLength) + digits;
    }
  }

  static #trimZeroes = str => {
    const dotIndex = str.indexOf('.');
    const sign = (str[0] === '-' ? '-' : '');
    str = str.replace('-', '').replace(/^0+/g, '');

    if (str.indexOf('.') !== -1) {
      str = str.replace(/0+$/g, '');

      if (str.at(-1) === '.') str = str.slice(0, -1);
      if (str.at(0) === '.') str = '0' + str;
    }

    const [mantissa, decimal] = str.split('.');

    if (mantissa === '' && decimal !== undefined) {
      str = '0.' + decimal;
    }

    return str === '' ? '0' : sign + str;
  }

  static #insertString = (str, pos, insert) => {
    return str.slice(0, pos) + insert + str.slice(pos);
  }

  static #deScientify = str => {
    const [mantissa, exponent] = str.split('e');
    const [int, decimal] = mantissa.split('.');
    const decimalIndex = mantissa.indexOf('.');
    const noDecimalPointNumber = (decimal === undefined ? int : int + decimal);
    const decimalLength = (decimal === undefined ? 0 : decimal.length);
    let result;

    if (decimal !== undefined && decimalLength <= +exponent) {
      result = noDecimalPointNumber + '0'.repeat(+exponent - decimalLength);
    } else if (+exponent > 0 || int.length > -Number(exponent)) {
      result = Mafs.#insertString(noDecimalPointNumber, decimalIndex + +exponent, '.');
    } else {
      result = '0.' + '0'.repeat(-Number(exponent) - int.length) + noDecimalPointNumber.replace('-', '');

      if (+int < 0) {
        result = '-' + result;
      }
    }

    return Mafs.#trimZeroes(result);
  }
}

