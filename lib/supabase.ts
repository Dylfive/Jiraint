import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckkwpphjkbrkyaklekdf.supabase.co';
const supabaseAnonKey = 'sb_publishable_yUwTWWQvjDMlLLwlETv-vg_EfUiitQh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
