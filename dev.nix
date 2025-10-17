{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  name = "skillbridge-env";

  packages = with pkgs; [
    nodejs
    git
    curl
  ];

  shellHook = ''
    echo "✅ SkillBridge AI Firebase Dev Environment Ready!"
  '';
}
