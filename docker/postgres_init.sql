CREATE USER azgraphql_test WITH PASSWORD 'azgraphql_test' CREATEDB;
CREATE DATABASE azgraphql_test
    WITH
    OWNER = azgraphql_test
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
