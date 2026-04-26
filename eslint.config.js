import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { defineConfig } from 'eslint/config';
import path from 'node:path';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');
const targetFiles = [
  'src/**/*.ts',
  'src/**/*.astro',
];

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ts.configs.recommended,
  astro.configs.recommended,
  {
    files: [
      ...targetFiles,
    ],
  },
);
