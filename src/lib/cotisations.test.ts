import { describe, it, expect } from "vitest";
import { calculerEtat } from "./cotisations";

const M = 20; // montant mensuel

describe("calculerEtat (modèle solde)", () => {
  it("membre à jour, versements exacts", () => {
    const e = calculerEtat({
      dateAdhesion: "2026-05-10",
      versements: [{ montant: 20 }, { montant: 20 }, { montant: 20 }],
      montantMensuel: M, aujourdhui: "2026-07-16",
    });
    expect(e.moisDus).toEqual(["2026-05-01", "2026-06-01", "2026-07-01"]);
    expect(e.totalVerse).toBe(60);
    expect(e.solde).toBe(0);
    expect(e.aJour).toBe(true);
    expect(e.moisRetard).toBe(0);
    expect(e.aJourJusqua).toBeNull();
  });

  it("dette : 6 mois dus, 40 € versés → solde −80, 4 mois de retard", () => {
    const e = calculerEtat({
      dateAdhesion: "2026-01-05",
      versements: [{ montant: 20 }, { montant: 20 }],
      montantMensuel: M, aujourdhui: "2026-06-20",
    });
    expect(e.moisDus.length).toBe(6);
    expect(e.solde).toBe(-80);
    expect(e.moisRetard).toBe(4);
    expect(e.aJour).toBe(false);
  });

  it("versement partiel : solde négatif non multiple du montant", () => {
    const e = calculerEtat({
      dateAdhesion: "2026-06-01", versements: [{ montant: 30 }],
      montantMensuel: M, aujourdhui: "2026-07-16",
    });
    expect(e.solde).toBe(-10);
    expect(e.moisRetard).toBe(1);
  });

  it("avance projetée : 100 € versés pour 3 mois dus → à jour jusqu'en septembre", () => {
    const e = calculerEtat({
      dateAdhesion: "2026-05-01", versements: [{ montant: 100 }],
      montantMensuel: M, aujourdhui: "2026-07-16",
    });
    expect(e.solde).toBe(40);
    expect(e.aJour).toBe(true);
    expect(e.aJourJusqua).toBe("2026-09-01");
  });

  it("suspension ouverte : les mois après le début sont gelés", () => {
    const e = calculerEtat({
      dateAdhesion: "2026-01-10", versements: [],
      suspensions: [{ debut: "2026-03-15", fin: null }],
      montantMensuel: M, aujourdhui: "2026-07-16",
    });
    // 03-01 est avant le début de suspension → mars reste dû ; 04→07 gelés
    expect(e.moisDus).toEqual(["2026-01-01", "2026-02-01", "2026-03-01"]);
    expect(e.solde).toBe(-60);
    expect(e.moisRetard).toBe(3);
  });

  it("suspension fermée : seuls les 1ers du mois dans la période sont gelés", () => {
    const e = calculerEtat({
      dateAdhesion: "2026-01-10", versements: [],
      suspensions: [{ debut: "2026-03-15", fin: "2026-05-20" }],
      montantMensuel: M, aujourdhui: "2026-07-16",
    });
    // gelés : 04-01 et 05-01 ; 06 et 07 redevenus dus après réactivation
    expect(e.moisDus).toEqual(["2026-01-01", "2026-02-01", "2026-03-01", "2026-06-01", "2026-07-01"]);
  });

  it("adhésion ancienne traversant une année", () => {
    const e = calculerEtat({ dateAdhesion: "2025-11-20", versements: [], montantMensuel: M, aujourdhui: "2026-02-01" });
    expect(e.moisDus).toEqual(["2025-11-01", "2025-12-01", "2026-01-01", "2026-02-01"]);
  });

  it("adhésion le mois courant, rien versé", () => {
    const e = calculerEtat({ dateAdhesion: "2026-07-02", versements: [], montantMensuel: M, aujourdhui: "2026-07-16" });
    expect(e.moisDus).toEqual(["2026-07-01"]);
    expect(e.solde).toBe(-20);
    expect(e.moisRetard).toBe(1);
  });
});
