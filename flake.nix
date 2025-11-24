{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
        # UNFREE check the license fam
        # Derived from https://github.com/NixOS/nixpkgs/pull/456672
        bencher = pkgs.rustPlatform.buildRustPackage (finalAttrs: {
          pname = "bencher";
          version = "0.5.8";

          # When updating, also make sure to update npmDeps.hash in bencher-console!
          src = pkgs.fetchFromGitHub {
            owner = "bencherdev";
            repo = "bencher";
            tag = "v${finalAttrs.version}";
            hash = "sha256-Nz+j8Iwjy4Ziw/L8D7SK3AFRIWP4QQyu63mQnc7dh4o=";
          };

          cargoHash = "sha256-3jiBz1gWO9klTeXMqVL16qczJptPf9HVksitiGversI=";

          cargoBuildFlags = pkgs. lib.cli.toGNUCommandLine {} {
            package = ["bencher_cli"];
          };

          # The default features include `plus` which has a custom license
          buildNoDefaultFeatures = true;

          # does dlopen() libfontconfig during tests and at runtime
          RUSTFLAGS = pkgs.lib.optionalString pkgs. stdenv.targetPlatform.isElf "-C link-arg=-Wl,--add-needed,${pkgs.fontconfig.lib}/lib/libfontconfig.so";

          nativeBuildInputs = with pkgs; [
            # .cargo/config.toml selects mold
            mold
            pkg-config
          ];

          buildInputs = with pkgs; [
            fontconfig
          ];

          postInstall = ''
            #mv $out/bin/api $out/bin/bencher-api
          '';

          meta = {
            description = "Suite of continuous benchmarking tools";
            homepage = "https://bencher.dev";
            changelog = "https://github.com/bencherdev/bencher/releases/tag/v${finalAttrs.version}";
            license = [
              pkgs. lib.licenses.asl20
              pkgs.lib.licenses.mit
            ];
            maintainers = with pkgs. lib.maintainers; [
              flokli
            ];
            platforms = pkgs.lib.platforms.unix;
            mainProgram = "bencher";
          };
        });

        # todo: playwright support
        nativeBuildInputs = with pkgs; [
          direnv
          nodejs_22
          bencher
          corepack_22
        ];
      in {
        packages = {inherit bencher;};
        devShells.default = pkgs.mkShell {
          inherit system nativeBuildInputs;
          # opt out of nextjs telemetry
          # https://nextjs.org/telemetry
          NEXT_TELEMETRY_DISABLED = 1;
        };
      }
    );
}
