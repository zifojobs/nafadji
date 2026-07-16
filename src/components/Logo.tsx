// Emblème Nafadji : silhouette du Sénégal (côte ouest + presqu'île de Dakar,
// encoche de la Gambie, pointe sud-est = Kédougou) + point or sur Kédougou,
// cercle liseré or. Copié depuis design-system/marque/logo.html.
type LogoProps = {
  size?: number;
  /** "sombre" = badge à cercle plein vert foncé (fond clair) · "claire" = cercle translucide (fond vert foncé, ex. hero) */
  variante?: "sombre" | "claire";
};

const SILHOUETTE_SENEGAL =
  "M 30,10 C 45,6 62,7 76,10 C 84,12 90,16 91,24 C 92,34 93,44 92,54 C 91,62 90,70 86,78 C 83,84 78,89 70,89 C 62,89 54,88 47,86 C 38,84 28,82 19,79 C 14,77 11,73 12,68 C 13,66 15,65 18,65 L 46,65 C 48,65 49,63 49,61 C 49,59 48,57 46,57 L 16,57 C 12,57 9,54 7,50 C 5,46 4,42 6,39 C 8,36 12,36 15,37 C 13,33 12,28 14,23 C 17,15 23,12 30,10 Z";

export function Logo({ size = 40, variante = "sombre" }: LogoProps) {
  const cercleFill = variante === "sombre" ? "#0B3D2E" : "rgba(247,245,240,.1)";
  const cercleStrokeWidth = variante === "sombre" ? 1.5 : 2;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill={cercleFill} stroke="#E3B23C" strokeWidth={cercleStrokeWidth} />
      <g transform="translate(15,15) scale(0.7)">
        <path d={SILHOUETTE_SENEGAL} fill="#F7F5F0" opacity={0.92} />
        <circle cx="80" cy="76" r="6" fill="#E3B23C" />
        <circle cx="80" cy="76" r="10" fill="none" stroke="#E3B23C" strokeWidth={1.4} opacity={0.55} />
      </g>
    </svg>
  );
}
