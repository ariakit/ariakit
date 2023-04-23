test("markup", () => {
  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          class="wrapper"
        >
          <h1
            class="heading"
          >
            Heading 1
          </h1>
          <p>
            Torquent penatibus ipsum nascetur cursus primis lobortis
          </p>
          <h2
            class="heading"
          >
            Heading 2
          </h2>
          <p>
            Volutpat metus id purus dignissim fusce Tellus egestas.
          </p>
          <h2
            class="heading"
          >
            Heading 2
          </h2>
          <p>
            Platea justo lectus. Praesent. Et sodales pellentesque
          </p>
        </div>
      </div>
    </body>
  `);
});
