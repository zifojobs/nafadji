/* eslint-disable @next/next/no-img-element */
// Emblème officiel ADN : l'artwork ORIGINAL fourni par le bureau (LOGO.jpeg),
// découpé au cercle et détouré — la forme de la case n'est pas retouchée.
// public/logo-adn.png = cercle noir + case blanche, fond transparent.
type LogoProps = {
  size?: number;
  /** "sombre" = tel quel (fonds clairs) · "claire" = posé sur une pastille crème (fonds vert foncé/encre) */
  variante?: "sombre" | "claire";
};

export function Logo({ size = 40, variante = "sombre" }: LogoProps) {
  const img = (
    <img
      src="/logo-adn.png"
      alt="Logo ADN"
      width={size}
      height={size}
      style={{ display: "block", width: size, height: size }}
    />
  );
  if (variante === "sombre") return img;
  // Sur fond sombre : pastille crème derrière l'emblème (l'artwork lui-même reste intact)
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#F7F5F0",
        boxShadow: "0 0 0 1.5px #E3B23C",
      }}
    >
      <img src="/logo-adn.png" alt="Logo ADN" width={Math.round(size * 0.98)} height={Math.round(size * 0.98)} style={{ display: "block" }} />
    </span>
  );
}
