{ pkgs, ... }:

{
  # Enable docker daemon
  virtualisation.docker.enable = true;

  # Enable PostgreSQL
  services.postgres.enable = true;

  # Packages
  environment.systemPackages = [
    pkgs.docker-compose
    pkgs.docker
    pkgs.openssl
    pkgs.nodejs-18_x
  ];
}
