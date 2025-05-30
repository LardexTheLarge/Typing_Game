# Typing Speed Test

## Description

This application serves as an AI-powered typing test generator, hosting a lightweight Zephyr language model locally to produce unique sentences for typing. When users begin the test, sentences through the API endpoint, the system generates 10 distinct typing prompts by processing AI outputs through rigorous cleaning and validation filters—ensuring proper capitalization, punctuation, and minimum length. The solution features multiple fallback mechanisms, automatically switching to curated sentences if model loading fails or generation attempts exceed retry limits. Optimized for local execution with GPU offloading and multi-threading.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Credits](#credits)
- [License](#license)
- [Tests](#test)
- [Questions](#questions)

## Installation

N/A

## Usage

To use this program you have to start the flask server on your machine and then open the html file in your browser of choice. There is a button to start the test and then you wait for the first sentence to appear. When all sentences are completed the game will give you your score.

## Credits

LardexTheLarge

## License

A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.

## Questions

GitHub: [LardexTheLarge](https://github.com/LardexTheLarge)

Email: 0gabevee0@gmail.com
