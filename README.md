![GitHub repo size](https://img.shields.io/github/repo-size/its-namami/mafs-js) ![GitHub License](https://img.shields.io/github/license/its-namami/mafs-js) ![GitHub Issues](https://img.shields.io/github/issues/its-namami/mafs-js)

<p align="left">
  <img src='https://raw.githubusercontent.com/its-namami/mafs-js/main/assets/media/images/docs/mafs-js-logo.webp' alt='Mafs.js Logo' width='200'/>
</p>

# Mafs.js

A custom-built JavaScript math engine focused on precision, clarity, and full control.
No dependencies. No borrowed logic. Just pure vanilla JS, crafted from scratch.

## 🚀 Features

- Arbitrary-precision number handling (BigInt-friendly)
- Core arithmetic: addition, subtraction, multiplication, division
- Square root (in progress)
- Planned: logarithms, exponentiation, trigonometry, parsing, memory stack
- Eventually: graphical *extension* (plotting via canvas)

## 💡 Philosophy

Mafs is not meant to be a competitor to Decimal.js or Math.js.
It’s an **exercise in reinventing the wheel** — fully self-developed, no lookups, no libraries.
Every feature is designed, debugged, and refined from scratch as a personal learning journey.

## 🧠 Why?

I started this project as part of [The Odin Project](https://www.theodinproject.com/), but it grew beyond a simple calculator.
This is a math engine and it's teaching me how math, precision, and JavaScript really work under the hood.
Every feature is born from the challenge of solving it unaided — this project is less about speed and more about understanding the why behind every result.

## 📦 Cloning the project

This project isn't meant for production yet, but feel free to clone it:

If you’d like to experiment or contribute, cloning is the way to go. No build steps required.

```zsh
git clone https://github.com/its-namami/mafs-js.git
```

## Method Input Expectations:

### Mafs.number(input):

- Accepts string or number.

### Mafs.multiply(input):

- string (recommended): Expected format for precise calculations.

- number (not recommended): May lead to precision issues.

- bigint: Supported, but the .value getter will return a string in decimal form when needed (e.g., for non-integer results).

### Mafs.number(x).sqrt():

- Does not expect any input parameters.

## Example Usage

To create a new instance of the `Mafs` class, use the static `Mafs.number()` method.
- **Please refrain from using `new Mafs()` directly**, as it may not handle certain edge cases correctly.

The `Mafs.number()` method accepts a number, a bigint or a string representing a number.
- **Please refrain from inputting number type**: Mafs.number(3.14) → leads to warning (and subtle bugs).

```js
import Mafs from './path/to/mafs.js';

// Create a Mafs number from a string
const num1 = Mafs.number('-1.23');

// Example: Division
const num2 = '3.501';
const result = num1.divide(num2).value; // returns '-0.351328191945158'

// Don't do this: Multiplication with a warning about number-type input
Mafs.number('2.25').multiply(0.000001).value; // Warning: Prefer string input for precision, returns '0.00000225'

// Example: Addition with high precision
const preciseSum = Mafs.number('0.000000000000000000000000000000001')
  .add(Mafs.number('0.000000000000000000000000000000002'))
  .value; // Returns '0.000000000000000000000000000000003'
```

## Roadmap
For more detailed progress and future plans, see the [Mafs.js Project Board](https://github.com/users/its-namami/projects/3) or explore the [issues](https://github.com/its-namami/mafs-js/issues)

### Math Engine Core

- [x] Mafs Class

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
