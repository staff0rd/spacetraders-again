/// <reference types="vite-plugin-svgr/client" />
declare global {
  interface ObjectConstructor {
    entries<T extends object>(o: T): Entries<T>
  }
}
