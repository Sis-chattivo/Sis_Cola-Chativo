// Importar Supabase desde CDN como módulo ES
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Reemplaza con tus claves de Supabase
const SUPABASE_URL = "https://nqdhdlzzlpumxkdrpzmt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xZGhkbHp6bHB1bXhrZHJwem10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDMwNTksImV4cCI6MjA3OTQxOTA1OX0.4ckZ_grkFvulGP37cgx2my0CfihfANmEC7SXJAxGLrk";

// Crear cliente Supabase correctamente
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);