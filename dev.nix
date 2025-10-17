{
  pkgs ? import <nixpkgs> {}
}:

pkgs.mkShell {
  buildInputs = with pkgs; [
    (python3.withPackages (ps: with ps; [
      torch
      sentence-transformers
      transformers
      optimum
      scikit-learn
      pandas
      onnxruntime
    ]))
  ];
}
