-- создаём схему и ставим её в search_path
CREATE SCHEMA IF NOT EXISTS heatstr AUTHORIZATION heatstr;
ALTER ROLE heatstr IN DATABASE heatstr SET search_path = heatstr, public;
