-- 0005_presences.sql — retour client n°6 (02/08/2026)
-- Feuille d'appel : qui était présent à quelle réunion, et combien il a versé ce jour-là.

-- Une ligne par membre et par réunion. Pas de ligne = appel pas encore fait
-- pour ce membre (à distinguer d'un absent, qui est une décision constatée).
create table presences (
  reunion_id uuid not null references reunions(id) on delete cascade,
  membre_id uuid not null references membres(id) on delete cascade,
  statut text not null check (statut in ('present', 'absent', 'excuse')),
  primary key (reunion_id, membre_id)
);

alter table presences enable row level security;

-- Rattache un versement à la réunion où il a été encaissé. Nullable : les
-- versements saisis hors réunion (virement, remise en main propre) n'en ont pas.
-- on delete set null : supprimer une réunion ne doit jamais effacer de l'argent reçu.
alter table cotisations add column reunion_id uuid references reunions(id) on delete set null;
