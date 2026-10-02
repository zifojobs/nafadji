-- 0006_notes_bureau_achat_appli.sql — retour client n°7 (02/10/2026)

-- Notes du bureau sur un membre (infos utiles, pense-bête). Jamais lues côté membre :
-- les pages membre ne sélectionnent que des colonnes nommées.
alter table membres add column notes_bureau text;

-- Participation des membres à l'achat de l'application (collecte ponctuelle,
-- séparée des cotisations mensuelles : elle ne doit pas les mettre « en avance »).
create table contributions_achat (
  id uuid primary key default gen_random_uuid(),
  membre_id uuid not null references membres(id) on delete cascade,
  montant numeric not null check (montant > 0),
  date_versement date not null default current_date,
  created_at timestamptz not null default now()
);

alter table contributions_achat enable row level security;
