{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
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
        # todo: playwright support
        nativeBuildInputs = with pkgs; [
          direnv
          nodejs
        ];
      in {
        devShells.default =
          pkgs.mkShell {
            inherit system nativeBuildInputs;
            # opt out of nextjs telemetry
            # https://nextjs.org/telemetry
            NEXT_TELEMETRY_DISABLED = 1;
          };
      }
    );
}
