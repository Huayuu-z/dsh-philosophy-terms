# Security and privacy

## Intended deployment

This plugin is designed for a local, single-user DeepSeek Harness profile. It registers a same-origin JSON route at `/philosophy/api` on the Harness Web server. That route has no additional authentication beyond the local origin.

- Keep the Harness Web server bound to `127.0.0.1` (the default).
- Do not expose the Harness Web server to a LAN or the public internet while this plugin is enabled.
- The route serves only the reader's philosophy lexicon and concept definitions; it does not expose credentials or arbitrary files.

## What leaves the machine

When you analyze a book or open a concept, the plugin sends the book title, term, definition context, and the relevant SEP excerpt to the model configured in your Harness profile. It also fetches pages from `plato.stanford.edu`.

No API key is bundled with this plugin. The model and web providers use the credentials already configured in your own profile.

## What stays local

Books, ratings, daily recommendations, and cached concept definitions are stored in the Harness profile storage domain `philosophy_reading` (on the host, under the DSH profile's storage area). They are not uploaded by the plugin itself.

## Reporting

Please open a GitHub issue for security concerns. Do not include private book lists, API keys, or personal reading data in a public issue.
