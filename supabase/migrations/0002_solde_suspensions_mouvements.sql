-- 0002_solde_suspensions_mouvements.sql — retour client n°2 (17/07/2026)
-- La table cotisations devient un registre de versements libres :
-- les lignes historiques gardent leur mois, les nouvelles n'en ont plus.
alter table cotisations drop constraint cotisations_membre_id_mois_key;
alter table cotisations alter column mois drop not null;

-- Périodes de suspension (append-only). Un mois dont le 1er tombe dans
-- une période est "gelé" : il ne compte pas dans les mois dus.
create table suspensions (
  id uuid primary key default gen_random_uuid(),
  membre_id uuid not null references membres(id) on delete cascade,
  debut date not null default current_date,
  fin date,
  cree_par uuid references membres(id),
  note text
);

-- Journal informatif des sorties d'argent (visible par tous les membres).
create table mouvements (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('don', 'depense')),
  libelle text not null,
  montant numeric not null,
  date_mouvement date not null default current_date,
  cree_par uuid references membres(id),
  created_at timestamptz not null default now()
);

alter table suspensions enable row level security;
alter table mouvements enable row level security;

-- Membres déjà inactifs : dette gelée à partir d'aujourd'hui (le passé reste dû).
insert into suspensions (membre_id, debut)
  select id, current_date from membres where actif = false;
