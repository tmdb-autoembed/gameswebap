REVOKE EXECUTE ON FUNCTION public.bump_community_counter(uuid, text, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_community_counter(uuid, text, int) TO service_role;