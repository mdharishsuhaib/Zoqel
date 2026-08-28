ALTER TABLE recovery_cases
ALTER COLUMN agent_confidence TYPE DOUBLE PRECISION
USING agent_confidence::DOUBLE PRECISION;

ALTER TABLE recovery_cases
ALTER COLUMN recovery_probability TYPE DOUBLE PRECISION
USING recovery_probability::DOUBLE PRECISION;
