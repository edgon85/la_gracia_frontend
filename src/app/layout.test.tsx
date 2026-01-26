import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from './layout';

describe('RootLayout', () => {
  describe('Metadata', () => {
    it('should have correct title', () => {
      expect(metadata.title).toBe('La Gracia - Sistema de Gestión Hospitalaria');
    });

    it('should have correct description', () => {
      expect(metadata.description).toBe(
        'Sistema de gestión de inventario y dispensación para uso interno del hospital'
      );
    });

    it('should have correct robots settings', () => {
      expect(metadata.robots).toEqual({
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      });
    });
  });

  describe('Component', () => {
    it('should render with lang attribute set to "es"', () => {
      render(
        <RootLayout>
          <div>Test content</div>
        </RootLayout>
      );

      const htmlElement = document.documentElement;
      expect(htmlElement).toHaveAttribute('lang', 'es');
    });

    it('should include correct classes in body element', () => {
      render(
        <RootLayout>
          <div>Test content</div>
        </RootLayout>
      );

      const bodyElement = document.body;
      // In test environment, next/font/google variables are mocked as "variable"
      // Check that the class string contains "variable" (for fonts) and "antialiased"
      expect(bodyElement.className).toContain('variable');
      expect(bodyElement.className).toContain('antialiased');
    });

    it('should render children correctly', () => {
      render(
        <RootLayout>
          <div>Test content</div>
        </RootLayout>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });
});
