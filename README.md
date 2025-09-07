![GitHub repo size](https://img.shields.io/github/repo-size/its-namami/dx-calc) ![GitHub License](https://img.shields.io/github/license/its-namami/dx-calc) ![GitHub Issues](https://img.shields.io/github/issues/its-namami/dx-calc)

<p align="left">
  <img src='https://raw.githubusercontent.com/its-namami/dc-calc/main/assets/media/images/docs/dx-calc-logo.webp' alt='DXCalc Logo' width='200'/>
</p>

# DXCalc

A custom-built JavaScript math engine focused on precision, clarity, and full control.
No dependencies. No borrowed logic. Just pure vanilla JS, crafted from scratch.

## Features

- Arbitrary-precision number handling (BigInt-friendly)
- Core arithmetic: addition, subtraction, multiplication, division
- Square root (in progress)
- Planned: logarithms, exponentiation, trigonometry, parsing, memory stack
- Eventually: graphical *extension* (plotting via canvas)

## Philosophy

DXCalc is not meant to be a competitor to Decimal.js or Math.js.
It’s an **exercise in reinventing the wheel** — fully self-developed, no lookups, no libraries.
Every feature is designed, debugged, and refined from scratch as a personal learning journey.

## The name

DXCalc is Decimal Class for standard base 10 numbers (from 0 to 9), that's why the roman 10 "X" in the name.

## Why?

I started this project as part of [The Odin Project](https://www.theodinproject.com/), but it grew beyond a simple calculator.
This is a math engine and it's teaching me how math, precision, and JavaScript really work under the hood.
Every feature is born from the challenge of solving it unaided — this project is less about speed and more about understanding the why behind every result.

## Method Input Expectations:

### DXCalc.number(input):

- Accepts string or number.

### DXCalc.multiply(input):

- string (recommended): Expected format for precise calculations.

- number (not recommended): May lead to precision issues.

- bigint: Supported, but the .value getter will return a string in decimal form when needed (e.g., for non-integer results).

### DXCalc.number(x).sqrt():

- Does not expect any input parameters.

## Example Usage

To create a new instance of the `DXCalc` class, use the static `DXCalc.number()` method.

The `DXCalc.number()` method accepts a number, a bigint or a string representing a number.
- **Please refrain from inputting number type**: DXCalc.number(3.14) → leads to warning (and subtle bugs) or may use octal or whatever representation.

```js
import DXCalc from './path/to/dxCalc.js';

// Create a DXCalc number from a string
const num1 = DXCalc.number('-1.23');

// Example: Division
const num2 = '3.501';
const result = num1.divide(num2).value; // returns '-0.351328191945158'

// Don't do this: Multiplication with a warning about number-type input
DXCalc.number('2.25').multiply(0.000001).value; // Warning: Prefer string input for precision, returns '0.00000225'

// Example: Addition with high precision
const preciseSum = DXCalc.number('0.000000000000000000000000000000001')
  .add(DXCalc.number('0.000000000000000000000000000000002'))
  .value; // Returns '0.000000000000000000000000000000003'
```

## Roadmap
For more detailed progress and future plans, see the [DXCalc Project Board](https://github.com/users/its-namami/projects/3) or explore the [issues](https://github.com/its-namami/decx/issues)

### Math Engine Core

- [x] DXCalc Class

- [x] Addition, Subtraction, etc.

- [x] Square Root

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
