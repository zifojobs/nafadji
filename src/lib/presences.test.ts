import { describe, it, expect } from "vitest";
import { grouperPresences, texteListePresence } from "./presences";

const noms = new Map([
  ["a", "Bangaly Danfakha"],
  ["b", "aminata Sow"],
  ["c", "Élise Camara"],
  ["d", "Moussa Diallo"],
]);

describe("grouperPresences", () => {
  it("range chaque membre dans son groupe, trié par nom sans tenir compte de la casse ni des accents", () => {
    const g = grouperPresences(
      [
        { membre_id: "d", statut: "present" },
        { membre_id: "b", statut: "present" },
        { membre_id: "c", statut: "excuse" },
        { membre_id: "a", statut: "absent" },
      ],
      noms,
    );
    expect(g.present).toEqual(["aminata Sow", "Moussa Diallo"]);
    expect(g.excuse).toEqual(["Élise Camara"]);
    expect(g.absent).toEqual(["Bangaly Danfakha"]);
  });

  it("omet un membre supprimé depuis la réunion (on ne peut plus le nommer)", () => {
    const g = grouperPresences([{ membre_id: "inconnu", statut: "present" }], noms);
    expect(g.present).toEqual([]);
  });

  it("ignore un statut inattendu au lieu de planter", () => {
    const g = grouperPresences([{ membre_id: "a", statut: "retard" }], noms);
    expect(g).toEqual({ present: [], absent: [], excuse: [] });
  });
});

describe("texteListePresence", () => {
  it("nomme les présents d'abord, puis les excusés, puis les absents", () => {
    const texte = texteListePresence({
      present: ["Moussa Diallo", "Aminata Sow"],
      excuse: ["Élise Camara"],
      absent: ["Bangaly Danfakha"],
    });
    expect(texte).toBe(
      "Présents (2) : Moussa Diallo, Aminata Sow\n" +
      "Excusés (1) : Élise Camara\n" +
      "Absents (1) : Bangaly Danfakha",
    );
  });

  it("n'écrit pas les groupes vides", () => {
    expect(texteListePresence({ present: ["Moussa Diallo"], excuse: [], absent: [] }))
      .toBe("Présents (1) : Moussa Diallo");
  });

  it("rend une chaîne vide quand l'appel n'a pas été fait", () => {
    expect(texteListePresence({ present: [], excuse: [], absent: [] })).toBe("");
  });
});
