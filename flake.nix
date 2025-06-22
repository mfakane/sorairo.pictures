{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.simpleFlake {
      inherit self nixpkgs;
      name = "nodejs-shell";
      shell = { pkgs }:
        pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
          ];
        };
    };
}