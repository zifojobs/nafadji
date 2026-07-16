import { describe, it, expect } from "vitest";
import { calculerEtat } from "./cotisations";

const M = 20; // montant mensuel

describe("calculerEtat", () => {
  it("membre à jour", () => {
    const e = calculerEtat({
      dateAdhesion: "2026-05-10",
      paiements: [
        { mois: "2026-05-01", montant: 20 },
        { mois: "2026-06-01", montant: 20 },
        { mois: "2026-07-01", montant: 20 },
      ],
      montantMensuel: M, aujourdhui: "2026-07-16",
    });
    expect(e.moisDus).toEqual(["2026-05-01", "2026-06-01", "2026-07-01"]);
    expect(e.moisEnRetard).toEqual([]);
    expect(e.aJour).toBe(true);
    expect(e.totalVerse).toBe(60);
    expect(e.resteDu).toBe(0);
  });

  it("membre avec trous", () => {
    const e = calculerEtat({
      dateAdhesion: "2026-03-01",
      paiements: [{ mois: "2026-03-01", montant: 20 }, { mois: "2026-06-01", montant: 20 }],
      montantMensuel: M, aujourdhui: "2026-07-16",
    });
    expect(e.moisEnRetard).toEqual(["2026-04-01", "2026-05-01", "2026-07-01"]);
    expect(e.aJour).toBe(false);
    expect(e.resteDu).toBe(60);
  });

  it("adhésion le mois courant, rien payé", () => {
    const e = calculerEtat({ dateAdhesion: "2026-07-02", paiements: [], montantMensuel: M, aujourdhui: "2026-07-16" });
    expect(e.moisDus).toEqual(["2026-07-01"]);
    expect(e.moisEnRetard).toEqual(["2026-07-01"]);
    expect(e.resteDu).toBe(20);
  });

  it("adhésion ancienne traversant une année", () => {
    const e = calculerEtat({ dateAdhesion: "2025-11-20", paiements: [], montantMensuel: M, aujourdhui: "2026-02-01" });
    expect(e.moisDus).toEqual(["2025-11-01", "2025-12-01", "2026-01-01", "2026-02-01"]);
  });

  it("aucun paiement : total versé 0, reste dû = nb mois × montant", () => {
    const e = calculerEtat({ dateAdhesion: "2026-05-01", paiements: [], montantMensuel: M, aujourdhui: "2026-07-16" });
    expect(e.totalVerse).toBe(0);
    expect(e.resteDu).toBe(60);
  });
});
