---
path: /docs/troubleshooting/
redirect_from:
  - /guide/troubleshooting/
---

# Troubleshooting

<carbon-ad></carbon-ad>

## Randomly generated IDs

For components that generate random id's internally, like tooltips and popovers, you'll likely run into the problem when trying to test them with snapshots due to the internal use of randomly generated IDs. There's two solutions to this problem, you can either mock `Math.random` for the specific test or you can wrap your tests on a Provider for SSR, which is a more adequate solution.
