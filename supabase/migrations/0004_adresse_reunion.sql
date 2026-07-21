-- 0004_adresse_reunion.sql — retour client n°4 (21/07/2026)
-- Adresse de la réunion, distincte du "lieu" (ex. lieu = "Chez Djiby DANFAKHA",
-- adresse = "1 Résidence du Vieux Moulin - 91350 Grigny").
alter table reunions add column adresse text;
