import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("package", {
    description: "Create a new package in packages/*",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Package name (used as packages/<name> and @repo/<name>):",
        validate: (input: string) =>
          /^[a-z0-9-]+$/.test(input)
            ? true
            : "Use lowercase letters, numbers, and dashes only",
      },
    ],
    actions: [
      {
        type: "addMany",
        destination: "{{ turbo.paths.root }}/packages/{{ name }}",
        base: "templates/package",
        templateFiles: "templates/package/**/*.hbs",
      },
    ],
  });
}
