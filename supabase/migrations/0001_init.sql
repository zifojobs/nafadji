-- 0001_init.sql — schéma initial Nafadji
create table parametres (
  id int primary key default 1 check (id = 1),
  montant_mensuel numeric not null default 20,
  devise text not null default 'EUR',
  nom_association text not null default 'Association des ressortissants de Nafadji'
);

create table membres (
  id uuid primary key default gen_random_uuid(),
  nom_complet text not null,
  telephone text,
  code_hash text not null,
  is_admin boolean not null default false,
  actif boolean not null default true,
  date_adhesion date not null default current_date,
  created_at timestamptz not null default now()
);

create table cotisations (
  id uuid primary key default gen_random_uuid(),
  membre_id uuid not null references membres(id) on delete cascade,
  mois date not null,
  montant numeric not null,
  date_paiement date not null default current_date,
  note text,
  unique (membre_id, mois)
);

create table reunions (
  id uuid primary key default gen_random_uuid(),
  date_reunion timestamptz not null,
  lieu text not null,
  ordre_du_jour text,
  pv_texte text,
  created_at timestamptz not null default now()
);

create table caisse (
  id int primary key default 1 check (id = 1),
  solde numeric not null default 0,
  maj_le timestamptz not null default now(),
  maj_par uuid references membres(id)
);

create table caisse_historique (
  id uuid primary key default gen_random_uuid(),
  solde numeric not null,
  maj_le timestamptz not null default now(),
  maj_par uuid references membres(id),
  note text
);

-- RLS activée partout, aucune policy : seul le service key (serveur) accède.
alter table parametres enable row level security;
alter table membres enable row level security;
alter table cotisations enable row level security;
alter table reunions enable row level security;
alter table caisse enable row level security;
alter table caisse_historique enable row level security;

insert into parametres (id) values (1);
insert into caisse (id) values (1);
