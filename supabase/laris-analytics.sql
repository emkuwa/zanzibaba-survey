-- Isolated LARIS analytics. Only the scoped Edge Function's service role may access these objects.
create table public.laris_visitors (
 visitor_id text primary key check (visitor_id ~ '^[0-9a-f]{64}$'),
 first_seen timestamptz not null default now(), last_seen timestamptz not null default now(),
 name_consent boolean not null default false,
 display_name text check (char_length(display_name) <= 200),
 consent_updated_at timestamptz,
 check ((name_consent and nullif(btrim(display_name),'') is not null) or (not name_consent and display_name is null))
);
create table public.laris_usage_events (
 event_id uuid primary key,
 visitor_id text not null references public.laris_visitors(visitor_id) on delete cascade,
 event_type text not null check (event_type in ('visit','profile_saved','cv_generated','letter_generated','print_cv_opened','print_letter_opened','email_clicked','share_clicked','app_installed')),
 document_language text check (document_language in ('sw','en')),
 device_type text not null check (device_type in ('mobile','tablet','desktop')),
 received_at timestamptz not null default now()
);
create index laris_usage_received_idx on public.laris_usage_events(received_at desc);
create index laris_usage_visitor_time_idx on public.laris_usage_events(visitor_id,received_at desc);
create table public.laris_admin_access (
 name text primary key,
 key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
 created_at timestamptz not null default now()
);
alter table public.laris_visitors enable row level security;
alter table public.laris_usage_events enable row level security;
alter table public.laris_admin_access enable row level security;
revoke all on public.laris_visitors,public.laris_usage_events,public.laris_admin_access from public,anon,authenticated;
grant select,insert,update,delete on public.laris_visitors,public.laris_usage_events,public.laris_admin_access to service_role;

create function public.laris_record_usage(p_visitor text,p_event uuid,p_kind text,p_language text,p_device text)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
 -- Serialize writes for one device; capped to prevent accidental loops or replay inflation.
 perform pg_advisory_xact_lock(hashtextextended(p_visitor,781));
 if exists(select 1 from public.laris_usage_events where event_id=p_event) then return true; end if;
 if (select count(*) from public.laris_usage_events where visitor_id=p_visitor and received_at>now()-interval '24 hours') >= 300 then return false; end if;
 insert into public.laris_visitors(visitor_id) values(p_visitor) on conflict(visitor_id) do update set last_seen=now();
 insert into public.laris_usage_events(event_id,visitor_id,event_type,document_language,device_type) values(p_event,p_visitor,p_kind,p_language,p_device) on conflict(event_id) do nothing;
 return true;
end $$;
create function public.laris_set_name_consent(p_visitor text,p_consent boolean,p_name text)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
 if p_consent and (p_name is null or char_length(btrim(p_name))=0 or char_length(p_name)>200) then raise exception 'Invalid name'; end if;
 insert into public.laris_visitors(visitor_id,name_consent,display_name,consent_updated_at)
 values(p_visitor,p_consent,case when p_consent then btrim(p_name) else null end,now())
 on conflict(visitor_id) do update set name_consent=excluded.name_consent,display_name=excluded.display_name,consent_updated_at=now();
 return true;
end $$;
create function public.laris_usage_dashboard(p_key_hash text,p_days integer default 30,p_offset integer default 0)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
 if not exists(select 1 from public.laris_admin_access where name='owner' and key_hash=p_key_hash) then raise exception 'Unauthorized' using errcode='28000'; end if;
 if p_days not in (1,7,30,90,365) or p_offset<0 or p_offset>100000 then raise exception 'Invalid range'; end if;
 with selected as (select * from public.laris_usage_events where received_at >= now()-make_interval(days=>p_days)),
 per_device as (select visitor_id,count(*) filter(where event_type='cv_generated') as cvs,count(*) filter(where event_type='letter_generated') as letters,count(*) filter(where event_type='profile_saved') as profiles,count(*) filter(where event_type='print_cv_opened') as cv_prints,count(*) filter(where event_type='print_letter_opened') as letter_prints,count(*) filter(where event_type='email_clicked') as email_clicks,min(received_at) as first_report,max(received_at) as last_report from selected group by visitor_id),
 named as (select v.display_name,p.* from per_device p join public.laris_visitors v using(visitor_id) where v.name_consent and v.display_name is not null),
 daily as (select (received_at at time zone 'Africa/Dar_es_Salaam')::date as day,count(*) filter(where event_type='cv_generated') as cvs,count(*) filter(where event_type='letter_generated') as letters,count(distinct visitor_id) as devices from selected group by 1 order by 1),
 totals as (select event_type,count(*) as actions,count(distinct visitor_id) as devices from selected group by event_type)
 select jsonb_build_object(
  'generated_at',now(),'started_at',(select min(first_seen) from public.laris_visitors),
  'days',p_days,'devices',(select count(*) from per_device),
  'named_count',(select count(*) from named),
  'totals',coalesce((select jsonb_agg(to_jsonb(t)) from totals t),'[]'::jsonb),
  'daily',coalesce((select jsonb_agg(to_jsonb(d)) from daily d),'[]'::jsonb),
  'people',coalesce((select jsonb_agg(to_jsonb(n)-'visitor_id') from (select * from named order by last_report desc limit 50 offset p_offset) n),'[]'::jsonb),
  'offset',p_offset,'limit',50
 ) into result;
 return result;
end $$;
revoke all on function public.laris_record_usage(text,uuid,text,text,text),public.laris_set_name_consent(text,boolean,text),public.laris_usage_dashboard(text,integer,integer) from public,anon,authenticated;
grant execute on function public.laris_record_usage(text,uuid,text,text,text),public.laris_set_name_consent(text,boolean,text),public.laris_usage_dashboard(text,integer,integer) to service_role;
comment on table public.laris_visitors is 'LARIS device identifiers and explicitly consented names only. No application contents or contact details.';
comment on table public.laris_usage_events is 'Self-reported LARIS preparation actions. Print/email clicks do not establish PDF download or application delivery.';
