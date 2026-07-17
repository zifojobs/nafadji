// Emblème officiel ADN (Association pour le Développement de Nafadji) :
// case traditionnelle à toit de chaume dans un cercle — redessiné en vectoriel
// depuis le logo fourni par le bureau (LOGO.jpeg), adapté à la palette de l'appli.
type LogoProps = {
  size?: number;
  /** "sombre" = cercle plein vert foncé (fond clair) · "claire" = cercle translucide (fond vert foncé, ex. hero) */
  variante?: "sombre" | "claire";
};

export function Logo({ size = 40, variante = "sombre" }: LogoProps) {
  const cercleFill = variante === "sombre" ? "#0B3D2E" : "rgba(247,245,240,.1)";
  const cercleStrokeWidth = variante === "sombre" ? 1.5 : 2;
  const case_ = "#F7F5F0";

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill={cercleFill} stroke="#E3B23C" strokeWidth={cercleStrokeWidth} />
      {/* Toit de chaume en 3 étages, comme sur le logo original */}
      <polygon points="50,14 61.1,30 38.9,30" fill={case_} />
      <polygon points="36.2,34 63.8,34 73.5,48 26.5,48" fill={case_} />
      <polygon points="23.7,52 76.3,52 86,66 14,66" fill={case_} />
      {/* Corps de la case + porte */}
      <rect x="30" y="66" width="40" height="24" fill={case_} />
      <rect x="44" y="74" width="12" height="16" fill="#0B3D2E" />
    </svg>
  );
}
