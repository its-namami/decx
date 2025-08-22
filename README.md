![GitHub repo size](https://img.shields.io/github/repo-size/its-namami/decx) ![GitHub License](https://img.shields.io/github/license/its-namami/decx) ![GitHub Issues](https://img.shields.io/github/issues/its-namami/decx)

<p align="left">
  <img src='https://raw.githubusercontent.com/its-namami/decx/main/assets/media/images/docs/decx-logo.webp' alt='DecX Logo' width='200'/>
</p>

# DecX

A custom-built JavaScript math engine focused on precision, clarity, and full control.
No dependencies. No borrowed logic. Just pure vanilla JS, crafted from scratch.

## Features

- Arbitrary-precision number handling (BigInt-friendly)
- Core arithmetic: addition, subtraction, multiplication, division
- Square root (in progress)
- Planned: logarithms, exponentiation, trigonometry, parsing, memory stack
- Eventually: graphical *extension* (plotting via canvas)

## Philosophy

DecX is not meant to be a competitor to Decimal.js or Math.js.
It’s an **exercise in reinventing the wheel** — fully self-developed, no lookups, no libraries.
Every feature is designed, debugged, and refined from scratch as a personal learning journey.

## The name

DecX is Decimal Class for standard base 10 numbers (from 0 to 9), that's why the roman 10 "X" at the end.

## Why?

I started this project as part of [The Odin Project](https://www.theodinproject.com/), but it grew beyond a simple calculator.
This is a math engine and it's teaching me how math, precision, and JavaScript really work under the hood.
Every feature is born from the challenge of solving it unaided — this project is less about speed and more about understanding the why behind every result.

## Method Input Expectations:

### DecX.number(input):

- Accepts string or number.

### DecX.multiply(input):

- string (recommended): Expected format for precise calculations.

- number (not recommended): May lead to precision issues.

- bigint: Supported, but the .value getter will return a string in decimal form when needed (e.g., for non-integer results).

### DecX.number(x).sqrt():

- Does not expect any input parameters.

## Example Usage

To create a new instance of the `DecX` class, use the static `DecX.number()` method.

The `DecX.number()` method accepts a number, a bigint or a string representing a number.
- **Please refrain from inputting number type**: DecX.number(3.14) → leads to warning (and subtle bugs) or may use octal or whatever representation.

```js
import DecX from './path/to/decx.js';

// Create a DecX number from a string
const num1 = DecX.number('-1.23');

// Example: Division
const num2 = '3.501';
const result = num1.divide(num2).value; // returns '-0.351328191945158'

// Don't do this: Multiplication with a warning about number-type input
DecX.number('2.25').multiply(0.000001).value; // Warning: Prefer string input for precision, returns '0.00000225'

// Example: Addition with high precision
const preciseSum = DecX.number('0.000000000000000000000000000000001')
  .add(DecX.number('0.000000000000000000000000000000002'))
  .value; // Returns '0.000000000000000000000000000000003'
```

## Roadmap
For more detailed progress and future plans, see the [DecX Project Board](https://github.com/users/its-namami/projects/3) or explore the [issues](https://github.com/its-namami/decx/issues)

### Math Engine Core

- [x] DecX Class

- [x] Addition, Subtraction, etc.

- [ ] Square Root

- [ ] Logarithms

- [ ] Exponentiation

### Extended Features

- [ ] Expression Parser

- [ ] Constants (π, e)

- [ ] Memory/Registers

- [ ] Graphical Plotting (Canvas)

### Smart Input

- [ ] Word-based Input Parsing

Built solo with ❤️ by [its-namami](https://github.com/its-namami).
