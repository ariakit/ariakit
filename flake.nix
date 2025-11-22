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
          name = "bencher";
          version = "0.5.6";

          src = pkgs.fetchFromGitHub {
            owner = "bencherdev";
            repo = "bencher";
            tag = "v${finalAttrs.version}";
            hash = "sha256-iv0BScnDYVtkMnvGv3JysamuOANRNpvY8+ZC32aa2iA=";
          };

          cargoHash = "sha256-9Uf2XvBjZUudrfrLQCu4lCsGLx1zUz95nkNrMHTekm8=";

          cargoBuildFlags = pkgs.lib.cli.toGNUCommandLine {} {
            package = ["bencher_cli"];
          };

          RUSTFLAGS =
            pkgs.lib.optionalString pkgs.stdenv.targetPlatform.isElf
            "-C link-arg=-Wl,--add-needed,${pkgs.fontconfig.lib}/lib/libfontconfig.so";

          checkFlags = [
            "--skip=licensor::test::test_bencher_cloud_annual"
            "--skip=licensor::test::test_bencher_cloud_monthly"
          ];

          # buildNoDefaultFeatures = true;
          nativeBuildInputs = with pkgs; [
            # .cargo/config.toml selects mold
            mold
            pkg-config
          ];

          buildInputs = with pkgs; [
            fontconfig
          ];

          meta.mainProgram = "bencher";
        });
        # todo: playwright support
        nativeBuildInputs = with pkgs; [
          direnv
          nodejs
          biome
          bencher
        ];
      in {
        devShells.default = pkgs.mkShell {
          inherit system nativeBuildInputs;
          # opt out of nextjs telemetry
          # https://nextjs.org/telemetry
          NEXT_TELEMETRY_DISABLED = 1;
        };
      }
    );
}
