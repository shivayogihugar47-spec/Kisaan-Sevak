import { BellRing, Megaphone, SendHorizontal } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import { useLanguage } from "../context/LanguageContext";

export default function KisaanNetworkPage() {
  const { content } = useLanguage();
  const [customPosts, setCustomPosts] = useState([]);
  const [draft, setDraft] = useState("");

  const posts = [...customPosts, ...content.network.posts];

  const handleBroadcast = () => {
    if (!draft.trim()) {
      return;
    }

    setCustomPosts((current) => [
      {
        id: crypto.randomUUID(),
        categoryKey: "farmer",
        author: content.network.you,
        message: draft.trim(),
        time: content.network.justNow,
      },
      ...current,
    ]);
    setDraft("");
  };

  return (
    <main className="screen-shell">
      <Header
        title={content.network.title}
        subtitle={content.network.subtitle}
        location={content.locationLabel}
        showBack
      />

      <Card>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-leaf-700">{content.network.postLabel}</span>
          <textarea
            rows="3"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={content.network.placeholder}
            className="w-full rounded-2xl border border-leaf-100 bg-leaf-50 px-4 py-4 text-sm text-leaf-800 outline-none transition focus:border-leaf-300 focus:bg-white"
          />
        </label>
        <Button className="mt-4 w-full" onClick={handleBroadcast}>
          <Megaphone size={18} />
          {content.network.broadcast}
        </Button>
      </Card>

      <section className="mt-6">
        <div className="mb-3 flex items-center gap-2 text-leaf-700">
          <BellRing size={18} />
          <h2 className="font-display text-lg font-bold">{content.network.alertsTitle}</h2>
        </div>

        {posts.length ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-soil-50 px-3 py-1 text-xs font-bold text-soil-700 ring-1 ring-soil-100">
                      {content.network.categories[post.categoryKey]}
                    </span>
                    <p className="mt-3 font-display text-lg font-bold text-leaf-800">{post.author}</p>
                  </div>
                  <span className="text-xs font-semibold text-leaf-500">{post.time}</span>
                </div>
                <p className="mt-3 text-sm text-leaf-700">{post.message}</p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-leaf-100 bg-leaf-50 px-4 py-2 text-xs font-semibold text-leaf-700"
                >
                  <SendHorizontal size={14} />
                  {content.network.forwardNearby}
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="ðŸ“£"
            title={content.network.emptyTitle}
            description={content.network.emptyDescription}
          />
        )}
      </section>
    </main>
  );
}
