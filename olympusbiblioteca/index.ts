class Provider {
  private api = "https://dashboard.olympusbiblioteca.com/api";

  getSettings(): Settings {
    return {
      supportsMultiLanguage: false,
      supportsMultiScanlator: false,
    };
  }

  async search(opts: QueryOptions): Promise<SearchResult[]> {
    const requestRes = await fetch(
      `${this.api}/series?search=${encodeURIComponent(opts.query)}&type=comic`,
      {
        method: "get",
      },
    );

    const json = await requestRes.json();

    if (!json?.data && !json?.results) return [];

    const results = json.data || json.results || [];

    return results.map((item: any) => ({
      id: item.slug || item._id || item.id,
      title: item.title || item.name || "Sin título",
      synonyms: item.synonyms || item.alternative_titles || [],
      year: item.year || null,
      image: item.cover || item.image || item.thumbnail || "",
    }));
  }

  async findChapters(mangaId: string): Promise<ChapterDetails[]> {
    const requestRes = await fetch(`${this.api}/series/${mangaId}?type=comic`, {
      method: "get",
    });

    const json = await requestRes.json();

    if (!json?.chapters && !json?.data?.chapters) return [];

    const chapters = json.chapters || json.data?.chapters || [];

    return chapters.map((ch: any, index: number) => ({
      id: ch.id || ch._id || `${mangaId}-${ch.chapter_number || ch.number}`,
      url: ch.url || ch.link || "",
      title: ch.title || `Capítulo ${ch.chapter_number || ch.number}`,
      chapter: String(ch.chapter_number || ch.number),
      index,
    }));
  }

  async findChapterPages(chapterId: string): Promise<ChapterPage[]> {
    const requestRes = await fetch(`${this.api}/chapter/${chapterId}/pages`, {
      method: "get",
    });

    const json = await requestRes.json();

    if (!json?.pages && !json?.images && !json?.data?.pages) return [];

    const pages = json.pages || json.images || json.data?.pages || [];

    return pages.map((page: any, index: number) => ({
      url: typeof page === "string" ? page : page.url || page.image || page.src,
      index,
      headers: {
        Referer: "https://olympusbiblioteca.com/",
      },
    }));
  }
}
