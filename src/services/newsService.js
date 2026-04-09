import { supabase } from "../lib/supabase";

/**
 * Agriculture News Service
 * Fetches data from Supabase news_articles table
 */

export async function getAgricultureNews(query = "agriculture", perPage = 5) {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('publishedAt', { ascending: false })
      .limit(perPage);

    if (error) throw error;

    return data ?? [];
  } catch (error) {
    console.error("Error fetching news from Supabase:", error);
    return [];
  }
}

/**
 * Fetch news for specific crop
 */
export async function getCropNews(cropName) {
  return getAgricultureNews(`${cropName} agriculture news`, 3);
}
