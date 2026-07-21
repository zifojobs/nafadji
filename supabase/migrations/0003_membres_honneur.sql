-- 0003_membres_honneur.sql — retour client n°3 (21/07/2026)
-- Membres d'honneur : ne cotisent pas, jamais de dette calculée pour eux.
alter table membres add column exempte_cotisation boolean not null default false;
