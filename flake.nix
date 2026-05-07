{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
  };

  outputs = inputs@{ self, nixpkgs, flake-parts, systems }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = import systems;
      perSystem = { config, system, pkgs, ... }: {
        devShells.default =
        pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
          ];
        };
      };
    };
}