# LibGen Reader

An application that turns books into audiobooks using the website [LibGen](http://libgen.is/) and multiple Text-to-Speech Engines, such as:

- Google Text-to-Speech

- Edge

- ElevenLabs

## Technologies

To build libgen-reader, I used the following technologies:

- [Nextron](https://github.com/saltyshiomix/nextron) - Next.js + Electron

- [Next.js](https://nextjs.org/) - React Framework

- [Electron](https://www.electronjs.org/) - Desktop Application Framework

- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework

- [Libgen API Wrapper](https://www.npmjs.com/package/libgen)

## Installation

1. Clone the repository

```bash
git clone https://github.com/FujiwaraChoki/libgen-reader.git
```

2. Install the dependencies

```bash
yarn install
```

3. Create a `.env` file in the root directory of the project

```bash
touch ./renderer/.env
```

You can also copy the `.env.example` file and rename it to `.env`

```bash

cp ./renderer/.env.example ./renderer/.env

```

4. You can now fill in the values.

5. Install Python dependencies

```bash
pip install -r requirements.txt
```

6. Start the application

```bash
yarn dev
```

## Usage

1. Open the application

2. Search for a book

3. Select the book

4) Choose the Text-to-Speech Engine

5. Click on the "Create Audiobook" button

6) Wait for the audiobook to be created

7. Listen to the audiobook

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
