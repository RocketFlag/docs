# RocketFlag Docs

The documentation site for [RocketFlag](https://rocketflag.app), built with
[Astro](https://astro.build) + [Starlight](https://starlight.astro.build) and
served at **[docs.rocketflag.app](https://docs.rocketflag.app)**.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
```

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm run dev`     | Start the local dev server                   |
| `npm run build`   | Build the production site to `./dist`         |
| `npm run preview` | Preview the production build locally          |

Content lives in `src/content/docs/` (Markdown / MDX). The sidebar and site
config are in `astro.config.mjs`.

## Deployment

Deploys are automated. On every push to `main`, a Google Cloud Build trigger
builds the site and syncs `./dist` to the `rocketflag-docs-site` GCS bucket,
then invalidates the CDN cache. See `cloudbuild.yaml` and the trigger defined in
the `rocketflag` infra repo (`infrastructure/terraform_prod/docs_deploy.tf`).
