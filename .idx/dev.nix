{ pkgs, ... }:

{
  # Enable docker daemon
  virtualisation.docker.enable = true;

  # Packages
  environment.systemPackages = [
    pkgs.docker-compose
    pkgs.docker
    pkgs.openssl
  ];
}

