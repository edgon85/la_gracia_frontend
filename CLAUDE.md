# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "La Gracia Frontend" - a hospital management system frontend built with Next.js 15, React 19, and TypeScript. The project uses the App Router architecture and Tailwind CSS v4 for styling.

## Development Commands

- `pnpm dev` - Start development server (Next.js runs on http://localhost:3000)
- `pnpm build` - Build production application
- `pnpm start` - Start production server

The project uses pnpm as the package manager (evident from pnpm-lock.yaml).

## Architecture & Structure

### Core Technologies
- **Next.js 15** with App Router
- **React 19** 
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** via PostCSS
- **Geist fonts** (Sans and Mono) from Google Fonts

### Directory Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components
- `src/actions/` - Server actions for data mutations
- `src/stores/` - State management (likely Zustand or similar)
- `src/hooks/` - Custom React hooks
- `src/interfaces/` - TypeScript interface definitions
- `src/types/` - TypeScript type definitions
- `src/enums/` - TypeScript enums
- `src/utils/` - Utility functions

### Path Aliases
- `@/*` maps to `./src/*` for cleaner imports

### Key Configuration
- TypeScript target: ES2017
- Strict mode enabled
- Font optimization via `next/font`
- CSS-in-JS ready via Tailwind's PostCSS plugin

## Hospital Management Context

This appears to be a hospital management system frontend ("Control Hospitalario" in Spanish), suggesting the codebase will likely include:
- Patient management interfaces
- Medical record systems
- Hospital administration features
- Healthcare staff management
- Appointment scheduling
- Medical inventory tracking

When working on features, consider healthcare data sensitivity and ensure proper validation and security practices.