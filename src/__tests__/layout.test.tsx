import React from 'react';
import RootLayout, { metadata } from '@/app/layout';

// Mock providers to avoid side effects (firebase, localStorage manip) during render
jest.mock('@/context/ThemeContext', () => ({
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
}));

jest.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>,
}));

describe('RootLayout', () => {
  it('exports metadata with title and description', () => {
    expect(metadata.title).toBe('Hub de Conhecimento');
    expect(metadata.description).toBe('Sua base de conhecimento centralizada');
  });

  it('returns an html element with lang pt-BR and nests ThemeProvider/AuthProvider around children (inspected, not rendered)', () => {
    const child = <div data-testid="child">Hello Layout</div>;
    // call the component to get the React element tree without mounting into the DOM
    // This avoids inserting a top-level <html> into the test renderer container
    // and still lets us inspect the returned element's structure and props.
    // @ts-expect-error - call as plain function
    const el = RootLayout({ children: child });

    // top-level should be an html element with correct lang
    expect(el.type).toBe('html');
    expect(el.props.lang).toBe('pt-BR');

    // body is the child of html
    const body = el.props.children;
    expect(body.type).toBe('body');

    // ThemeProvider element is the child of body
    const themeEl = body.props.children;
    // because we mocked ThemeProvider to a function, its React element type will be that function
    // assert it has children which is the AuthProvider element
    expect(themeEl.props).toBeDefined();
    const authEl = themeEl.props.children;
    expect(authEl).toBeDefined();

    // the final children should be our original child element
    expect(authEl.props.children).toBe(child);
  });
});
