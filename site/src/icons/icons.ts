interface Icon {
  viewBox?: string;
  html: string;
  stroke?: string;
  fill?: string;
}

export const copy: Icon = {
  stroke: "currentColor",
  fill: "none",
  html: `<g stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></g>`,
};

export const check: Icon = {
  viewBox: "0 0 16 16",
  stroke: "currentColor",
  fill: "none",
  html: `<polyline stroke-linecap="round" stroke-linejoin="round" points="4,8 7,12 12,4" />`,
};

export const react: Icon = {
  viewBox: "0 0 32 32",
  stroke: "none",
  html: `<g class="ak-layer-contrast-[#007acc] bg-none fill-(--ak-layer)"><path d="M16 21.706a28.4 28.4 0 0 1-8.88-1.2a11.3 11.3 0 0 1-3.657-1.958A3.54 3.54 0 0 1 2 15.974c0-1.653 1.816-3.273 4.858-4.333A28.8 28.8 0 0 1 16 10.293a28.7 28.7 0 0 1 9.022 1.324a11.4 11.4 0 0 1 3.538 1.866A3.4 3.4 0 0 1 30 15.974c0 1.718-2.03 3.459-5.3 4.541a28.8 28.8 0 0 1-8.7 1.191m0-10.217a28 28 0 0 0-8.749 1.282c-2.8.977-4.055 2.313-4.055 3.2c0 .928 1.349 2.387 4.311 3.4A27.2 27.2 0 0 0 16 20.51a27.6 27.6 0 0 0 8.325-1.13C27.4 18.361 28.8 16.9 28.8 15.974a2.33 2.33 0 0 0-1.01-1.573a10.2 10.2 0 0 0-3.161-1.654A27.5 27.5 0 0 0 16 11.489"/><path d="M10.32 28.443a2.64 2.64 0 0 1-1.336-.328c-1.432-.826-1.928-3.208-1.327-6.373a28.8 28.8 0 0 1 3.4-8.593a28.7 28.7 0 0 1 5.653-7.154a11.4 11.4 0 0 1 3.384-2.133a3.4 3.4 0 0 1 2.878 0c1.489.858 1.982 3.486 1.287 6.859a28.8 28.8 0 0 1-3.316 8.133a28.4 28.4 0 0 1-5.476 7.093a11.3 11.3 0 0 1-3.523 2.189a4.9 4.9 0 0 1-1.624.307m1.773-14.7a28 28 0 0 0-3.26 8.219c-.553 2.915-.022 4.668.75 5.114c.8.463 2.742.024 5.1-2.036a27.2 27.2 0 0 0 5.227-6.79a27.6 27.6 0 0 0 3.181-7.776c.654-3.175.089-5.119-.713-5.581a2.33 2.33 0 0 0-1.868.089A10.2 10.2 0 0 0 17.5 6.9a27.5 27.5 0 0 0-5.4 6.849Z"/><path d="M21.677 28.456c-1.355 0-3.076-.82-4.868-2.361a28.8 28.8 0 0 1-5.747-7.237a28.7 28.7 0 0 1-3.374-8.471a11.4 11.4 0 0 1-.158-4A3.4 3.4 0 0 1 8.964 3.9c1.487-.861 4.01.024 6.585 2.31a28.8 28.8 0 0 1 5.39 6.934a28.4 28.4 0 0 1 3.41 8.287a11.3 11.3 0 0 1 .137 4.146a3.54 3.54 0 0 1-1.494 2.555a2.6 2.6 0 0 1-1.315.324m-9.58-10.2a28 28 0 0 0 5.492 6.929c2.249 1.935 4.033 2.351 4.8 1.9c.8-.465 1.39-2.363.782-5.434A27.2 27.2 0 0 0 19.9 13.74a27.6 27.6 0 0 0-5.145-6.64c-2.424-2.152-4.39-2.633-5.191-2.169a2.33 2.33 0 0 0-.855 1.662a10.2 10.2 0 0 0 .153 3.565a27.5 27.5 0 0 0 3.236 8.1Z"/></g>`,
};

export const ts: Icon = {
  viewBox: "0 0 32 32",
  html: `<rect fill="#3178c6" width="28" height="28" x="2" y="2" rx="1.312"/><path fill="#fff" fill-rule="evenodd" d="M18.245 23.759v3.068a6.5 6.5 0 0 0 1.764.575a11.6 11.6 0 0 0 2.146.192a10 10 0 0 0 2.088-.211a5.1 5.1 0 0 0 1.735-.7a3.54 3.54 0 0 0 1.181-1.266a4.47 4.47 0 0 0 .186-3.394a3.4 3.4 0 0 0-.717-1.117a5.2 5.2 0 0 0-1.123-.877a12 12 0 0 0-1.477-.734q-.6-.249-1.08-.484a5.5 5.5 0 0 1-.813-.479a2.1 2.1 0 0 1-.516-.518a1.1 1.1 0 0 1-.181-.618a1.04 1.04 0 0 1 .162-.571a1.4 1.4 0 0 1 .459-.436a2.4 2.4 0 0 1 .726-.283a4.2 4.2 0 0 1 .956-.1a6 6 0 0 1 .808.058a6 6 0 0 1 .856.177a6 6 0 0 1 .836.3a4.7 4.7 0 0 1 .751.422V13.9a7.5 7.5 0 0 0-1.525-.4a12.4 12.4 0 0 0-1.9-.129a8.8 8.8 0 0 0-2.064.235a5.2 5.2 0 0 0-1.716.733a3.66 3.66 0 0 0-1.171 1.271a3.73 3.73 0 0 0-.431 1.845a3.6 3.6 0 0 0 .789 2.34a6 6 0 0 0 2.395 1.639q.63.26 1.175.509a6.5 6.5 0 0 1 .942.517a2.5 2.5 0 0 1 .626.585a1.2 1.2 0 0 1 .23.719a1.1 1.1 0 0 1-.144.552a1.3 1.3 0 0 1-.435.441a2.4 2.4 0 0 1-.726.292a4.4 4.4 0 0 1-1.018.105a5.8 5.8 0 0 1-1.969-.35a5.9 5.9 0 0 1-1.805-1.045m-5.154-7.638h4v-2.527H5.938v2.527H9.92v11.254h3.171Z"/>`,
};

export const js: Icon = {
  viewBox: "0 0 32 32",
  html: `<path fill="#f5de19" d="M2 2h28v28H2z"/><path d="M20.809 23.875a2.87 2.87 0 0 0 2.6 1.6c1.09 0 1.787-.545 1.787-1.3c0-.9-.716-1.222-1.916-1.747l-.658-.282c-1.9-.809-3.16-1.822-3.16-3.964c0-1.973 1.5-3.476 3.853-3.476a3.89 3.89 0 0 1 3.742 2.107L25 18.128A1.79 1.79 0 0 0 23.311 17a1.145 1.145 0 0 0-1.259 1.128c0 .789.489 1.109 1.618 1.6l.658.282c2.236.959 3.5 1.936 3.5 4.133c0 2.369-1.861 3.667-4.36 3.667a5.06 5.06 0 0 1-4.795-2.691Zm-9.295.228c.413.733.789 1.353 1.693 1.353c.864 0 1.41-.338 1.41-1.653v-8.947h2.631v8.982c0 2.724-1.6 3.964-3.929 3.964a4.085 4.085 0 0 1-3.947-2.4Z"/>`,
};

export const tailwind: Icon = {
  viewBox: "0 0 32 32",
  html: `<path class="ak-layer-contrast-[#44a8b3] bg-none fill-(--ak-layer)" d="M9 13.7q1.4-5.6 7-5.6c5.6 0 6.3 4.2 9.1 4.9q2.8.7 4.9-2.1q-1.4 5.6-7 5.6c-5.6 0-6.3-4.2-9.1-4.9q-2.8-.7-4.9 2.1m-7 8.4q1.4-5.6 7-5.6c5.6 0 6.3 4.2 9.1 4.9q2.8.7 4.9-2.1q-1.4 5.6-7 5.6c-5.6 0-6.3-4.2-9.1-4.9q-2.8-.7-4.9 2.1"/>`,
};

export const npm: Icon = {
  viewBox: "0 0 128 128",
  stroke: "none",
  html: `<g><path fill="#cb3837" d="M0 7.062C0 3.225 3.225 0 7.062 0h113.88c3.838 0 7.063 3.225 7.063 7.062v113.88c0 3.838-3.225 7.063-7.063 7.063H7.062c-3.837 0-7.062-3.225-7.062-7.063zm23.69 97.518h40.395l.05-58.532h19.494l-.05 58.581h19.543l.05-78.075l-78.075-.1l-.1 78.126z"/><path fill="#fff" d="M25.105 65.52V26.512H40.96c8.72 0 26.274.034 39.008.075l23.153.075v77.866H83.645v-58.54H64.057v58.54H25.105z"/></g>`,
};

export const pnpm: Icon = {
  viewBox: "0 0 32 32",
  stroke: "none",
  html: `<g><path class="ak-layer-contrast-[#f9ad00] bg-none fill-(--ak-layer)" d="M30 10.75h-8.749V2H30Zm-9.626 0h-8.75V2h8.75Zm-9.625 0H2V2h8.749ZM30 20.375h-8.749v-8.75H30Z"/><path class="ak-text/50 fill-current" d="M20.374 20.375h-8.75v-8.75h8.75Zm0 9.625h-8.75v-8.75h8.75ZM30 30h-8.749v-8.75H30Zm-19.251 0H2v-8.75h8.749Z"/></g>`,
};

export const yarn: Icon = {
  viewBox: "0 0 32 32",
  html: `<path stroke="none" class="ak-layer-contrast-[#2188b6] bg-none fill-(--ak-layer)" d="M28.208 24.409a10.5 10.5 0 0 0-3.959 1.822a23.7 23.7 0 0 1-5.835 2.642a1.63 1.63 0 0 1-.983.55a62 62 0 0 1-6.447.577c-1.163.009-1.876-.3-2.074-.776a1.573 1.573 0 0 1 .866-2.074a4 4 0 0 1-.514-.379c-.171-.171-.352-.514-.406-.388c-.225.55-.343 1.894-.947 2.5c-.83.839-2.4.559-3.328.072c-1.019-.541.072-1.813.072-1.813a.73.73 0 0 1-.992-.343a4.85 4.85 0 0 1-.667-2.949a5.37 5.37 0 0 1 1.749-2.895a9.3 9.3 0 0 1 .658-4.4a10.45 10.45 0 0 1 3.165-3.661S6.628 10.747 7.35 8.817c.469-1.262.658-1.253.812-1.308a3.6 3.6 0 0 0 1.452-.857a5.27 5.27 0 0 1 4.41-1.7S15.2 1.4 16.277 2.09a18.4 18.4 0 0 1 1.533 2.886s1.281-.748 1.425-.469a11.33 11.33 0 0 1 .523 6.132a14 14 0 0 1-2.6 5.411c-.135.225 1.551.938 2.615 3.887c.983 2.7.108 4.96.262 5.212c.027.045.036.063.036.063s1.127.09 3.391-1.308a8.5 8.5 0 0 1 4.277-1.604a1.081 1.081 0 0 1 .469 2.11Z"/>`,
};

export const bun: Icon = {
  viewBox: "0 0 128 128",
  html: `<path d="M113.744 41.999a19 19 0 0 0-.8-.772c-.272-.246-.528-.524-.8-.771s-.528-.525-.8-.771c-.272-.247-.528-.525-.8-.772s-.528-.524-.8-.771s-.528-.525-.8-.772s-.528-.524-.8-.771c7.936 7.52 12.483 17.752 12.656 28.481c0 25.565-26.912 46.363-60 46.363c-18.528 0-35.104-6.526-46.128-16.756l.8.772l.8.771l.8.772l.8.771l.8.772l.8.771l.8.771c11.008 10.662 27.952 17.527 46.928 17.527c33.088 0 60-20.797 60-46.285c0-10.893-4.864-21.215-13.456-29.33"/><path fill="#fbf0df" d="M116.8 65.08c0 23.467-25.072 42.49-56 42.49s-56-19.023-56-42.49c0-14.55 9.6-27.401 24.352-35.023S53.088 14.628 60.8 14.628S75.104 21 92.448 30.058C107.2 37.677 116.8 50.53 116.8 65.08"/><path fill="#f6dece" d="M116.8 65.08a32.3 32.3 0 0 0-1.28-8.918c-4.368 51.377-69.36 53.846-94.912 38.48c11.486 8.584 25.66 13.144 40.192 12.928c30.88 0 56-19.054 56-42.49"/><path fill="#fffefc" d="M39.248 27.234c7.152-4.135 16.656-11.896 26-11.911a15.4 15.4 0 0 0-4.448-.695c-3.872 0-8 1.93-13.2 4.83c-1.808 1.018-3.68 2.144-5.664 3.317c-3.728 2.222-8 4.736-12.8 7.251C13.904 37.972 4.8 51.071 4.8 65.08v1.836c9.696-33.033 27.312-35.547 34.448-39.682"/><path fill="#ccbea7" d="M56.192 18.532A24.55 24.55 0 0 1 53.867 29.1a25.4 25.4 0 0 1-6.683 8.671c-.448.386-.096 1.127.48.91c5.392-2.02 12.672-8.068 9.6-20.272c-.128-.695-1.072-.51-1.072.123m3.632 0a24.5 24.5 0 0 1 3.646 10.12c.445 3.587.08 7.224-1.07 10.662c-.192.54.496 1.003.88.556c3.504-4.32 6.56-12.899-2.592-22.156c-.464-.4-1.184.216-.864.756zm4.416-.262a25.7 25.7 0 0 1 7.521 7.925A24.7 24.7 0 0 1 75.2 36.414c-.016.13.02.26.101.365a.543.543 0 0 0 .718.117a.5.5 0 0 0 .221-.313c1.472-5.384.64-14.564-11.472-19.332c-.64-.246-1.056.587-.528.957zM34.704 34.315a27.4 27.4 0 0 0 9.91-5.222a26.3 26.3 0 0 0 6.842-8.663c.288-.556 1.2-.34 1.056.277c-2.768 12.343-12.032 14.92-17.792 14.58c-.608.016-.592-.802-.016-.972"/><path d="M60.8 111.443c-33.088 0-60-20.798-60-46.363c0-15.429 9.888-29.823 26.448-38.448c4.8-2.469 8.912-4.953 12.576-7.128c2.016-1.203 3.92-2.33 5.76-3.379C51.2 12.916 56 10.771 60.8 10.771s8.992 1.852 14.24 4.845c1.6.88 3.2 1.836 4.912 2.885c3.984 2.376 8.48 5.06 14.4 8.131c16.56 8.625 26.448 23.004 26.448 38.448c0 25.565-26.912 46.363-60 46.363m0-96.814c-3.872 0-8 1.928-13.2 4.829c-1.808 1.018-3.68 2.144-5.664 3.317c-3.728 2.222-8 4.736-12.8 7.251C13.904 37.972 4.8 51.071 4.8 65.08c0 23.436 25.12 42.506 56 42.506s56-19.07 56-42.506c0-14.01-9.104-27.108-24.352-35.023c-6.048-3.086-10.768-5.986-14.592-8.27c-1.744-1.033-3.344-1.99-4.8-2.838c-4.848-2.778-8.384-4.32-12.256-4.32"/><path fill="#b71422" d="M72.08 76.343c-.719 2.839-2.355 5.383-4.672 7.267a11.07 11.07 0 0 1-6.4 2.9a11.13 11.13 0 0 1-6.608-2.9c-2.293-1.892-3.906-4.436-4.608-7.267a1.1 1.1 0 0 1 .05-.5a1.1 1.1 0 0 1 .272-.428a1.19 1.19 0 0 1 .958-.322h19.744a1.19 1.19 0 0 1 .947.33a1.07 1.07 0 0 1 .317.92"/><path fill="#ff6164" d="M54.4 83.733a11.24 11.24 0 0 0 6.592 2.932a11.24 11.24 0 0 0 6.576-2.932a17 17 0 0 0 1.6-1.65a10.9 10.9 0 0 0-3.538-2.564a11.3 11.3 0 0 0-4.302-1a10.1 10.1 0 0 0-4.549 1.192a9.7 9.7 0 0 0-3.451 3.097c.368.323.688.632 1.072.925"/><path d="M54.656 82.514a8.5 8.5 0 0 1 2.97-2.347a8.8 8.8 0 0 1 3.734-.862a9.78 9.78 0 0 1 6.4 2.608c.368-.386.72-.787 1.056-1.188c-2.035-1.87-4.726-2.933-7.536-2.978a10.5 10.5 0 0 0-4.335.975a10.1 10.1 0 0 0-3.489 2.666q.568.595 1.2 1.126"/><path d="M60.944 87.436a12.08 12.08 0 0 1-7.12-3.086c-2.477-2.02-4.22-4.75-4.976-7.791c-.054-.27-.045-.55.027-.817a1.8 1.8 0 0 1 .389-.726a2.25 2.25 0 0 1 .81-.595a2.3 2.3 0 0 1 .998-.192h19.744c.343-.007.683.06.996.196a2.3 2.3 0 0 1 .812.591c.182.212.313.46.382.728c.07.267.076.545.018.815c-.756 3.042-2.5 5.771-4.976 7.791a12.08 12.08 0 0 1-7.104 3.086m-9.872-11.417c-.256 0-.32.108-.336.139c.676 2.638 2.206 4.999 4.368 6.742a10.12 10.12 0 0 0 5.84 2.7a10.2 10.2 0 0 0 5.84-2.67c2.155-1.745 3.679-4.106 4.352-6.741a.33.33 0 0 0-.14-.113a.35.35 0 0 0-.18-.026z"/><path fill="#febbd0" d="M85.152 77.3c5.17 0 9.36-2.377 9.36-5.308s-4.19-5.307-9.36-5.307s-9.36 2.376-9.36 5.307s4.19 5.307 9.36 5.307zm-48.432 0c5.17 0 9.36-2.377 9.36-5.308s-4.19-5.307-9.36-5.307s-9.36 2.376-9.36 5.307s4.19 5.307 9.36 5.307z"/><path d="M41.12 69.863a9.05 9.05 0 0 0 4.902-1.425a8.6 8.6 0 0 0 3.254-3.812a8.2 8.2 0 0 0 .508-4.913a8.4 8.4 0 0 0-2.408-4.357a8.9 8.9 0 0 0-4.514-2.33a9.1 9.1 0 0 0-5.096.48a8.76 8.76 0 0 0-3.96 3.131a8.3 8.3 0 0 0-1.486 4.725c0 2.252.927 4.412 2.577 6.005c1.65 1.594 3.888 2.492 6.223 2.496m39.632 0a9.05 9.05 0 0 0 4.915-1.403a8.6 8.6 0 0 0 3.275-3.802a8.2 8.2 0 0 0 .528-4.917a8.4 8.4 0 0 0-2.398-4.368a8.9 8.9 0 0 0-4.512-2.344a9.1 9.1 0 0 0-5.103.473a8.76 8.76 0 0 0-3.967 3.13a8.3 8.3 0 0 0-1.49 4.73c-.004 2.245.914 4.4 2.555 5.994c1.64 1.593 3.869 2.495 6.197 2.507"/><path fill="#fff" d="M38.4 61.902a3.4 3.4 0 0 0 1.844-.531c.547-.35.974-.847 1.227-1.43a3.1 3.1 0 0 0 .195-1.847a3.16 3.16 0 0 0-.902-1.639a3.35 3.35 0 0 0-1.696-.878a3.43 3.43 0 0 0-1.916.179a3.3 3.3 0 0 0-1.489 1.176a3.1 3.1 0 0 0-.559 1.776c0 .844.347 1.654.964 2.253a3.37 3.37 0 0 0 2.332.94zm39.632 0a3.4 3.4 0 0 0 1.844-.531c.547-.35.974-.847 1.227-1.43a3.1 3.1 0 0 0 .195-1.847a3.16 3.16 0 0 0-.902-1.639a3.35 3.35 0 0 0-1.696-.878a3.43 3.43 0 0 0-1.916.179a3.3 3.3 0 0 0-1.489 1.176a3.1 3.1 0 0 0-.559 1.776c0 .84.342 1.644.953 2.242c.61.598 1.44.94 2.311.952z"/>`,
};

export const sparks: Icon = {
  viewBox: "0 0 24 24",
  html: `<g fill="none"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.06.16l.807 2.36a4 4 0 0 0 2.276 2.411l.217.081l2.36.806c1.75.598 1.803 3.016.16 3.725l-.16.06l-2.36.807a4 4 0 0 0-2.412 2.276l-.081.216l-.806 2.361c-.598 1.75-3.016 1.803-3.724.16l-.062-.16l-.806-2.36a4 4 0 0 0-2.276-2.412l-.216-.081l-2.36-.806c-1.751-.598-1.804-3.016-.16-3.724l.16-.062l2.36-.806A4 4 0 0 0 8.22 8.025l.081-.216zM11 6.094l-.806 2.36a6 6 0 0 1-3.49 3.649l-.25.091l-2.36.806l2.36.806a6 6 0 0 1 3.649 3.49l.091.25l.806 2.36l.806-2.36a6 6 0 0 1 3.49-3.649l.25-.09l2.36-.807l-2.36-.806a6 6 0 0 1-3.649-3.49l-.09-.25zM19 2a1 1 0 0 1 .898.56l.048.117l.35 1.026l1.027.35a1 1 0 0 1 .118 1.845l-.118.048l-1.026.35l-.35 1.027a1 1 0 0 1-1.845.117l-.048-.117l-.35-1.026l-1.027-.35a1 1 0 0 1-.118-1.845l.118-.048l1.026-.35l.35-1.027A1 1 0 0 1 19 2"/></g>`,
};

export const edit: Icon = {
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  fill: "none",
  html: `<path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />`,
};

export const newWindow: Icon = {
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  fill: "none",
  html: `<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />`,
};

export const chevronUp: Icon = {
  viewBox: "0 0 16 16",
  stroke: "currentColor",
  fill: "none",
  html: `<polyline stroke-linecap="round" stroke-linejoin="round" points="4,10 8,6 12,10" />`,
};

export const chevronRight: Icon = {
  viewBox: "0 0 16 16",
  stroke: "currentColor",
  fill: "none",
  html: `<polyline stroke-linecap="round" stroke-linejoin="round" points="6,4 10,8 6,12" />`,
};

export const chevronDown: Icon = {
  viewBox: "0 0 16 16",
  stroke: "currentColor",
  fill: "none",
  html: `<polyline stroke-linecap="round" stroke-linejoin="round" points="4,6 8,10 12,6" />`,
};

export const chevronLeft: Icon = {
  viewBox: "0 0 16 16",
  stroke: "currentColor",
  fill: "none",
  html: `<polyline stroke-linecap="round" stroke-linejoin="round" points="10,4 6,8 10,12" />`,
};
