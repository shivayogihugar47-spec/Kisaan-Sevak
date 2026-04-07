import { Award, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import SelectField from "../components/SelectField";
import { useLanguage } from "../context/LanguageContext";
import { residueBuyers } from "../data/mockData";
import { formatPrice } from "../utils/helpers";

const residueIds = Object.keys(residueBuyers);

export default function WasteToWealthPage() {
  const { content } = useLanguage();
  const [residueType, setResidueType] = useState(residueIds[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const residueOptions = residueIds.map((residueId) => ({
    value: residueId,
    label: content.waste.residueOptions[residueId],
  }));

  useEffect(() => {
    setIsLoading(true);
    setConfirmed(false);
    const timer = setTimeout(() => setIsLoading(false), 500);

    return () => clearTimeout(timer);
  }, [residueType]);

  const buyers = residueBuyers[residueType];
  const bestBuyer = [...buyers].sort((a, b) => b.price - a.price)[0];

  return (
    <main className="screen-shell">
      <Header
        title={content.waste.title}
        subtitle={content.waste.subtitle}
        location={content.locationLabel}
        showBack
      />

      <Card>
        <SelectField
          label={content.waste.residueType}
          value={residueType}
          onChange={(event) => setResidueType(event.target.value)}
          options={residueOptions}
        />
      </Card>

      {isLoading ? (
        <div className="mt-5">
          <LoadingState label={content.waste.loading} />
        </div>
      ) : buyers.length ? (
        <section className="mt-6 space-y-3">
          {buyers.map((buyer) => {
            const isBest = buyer.name === bestBuyer.name;

            return (
              <Card
                key={buyer.name}
                className={`${isBest ? "border-sun-100 bg-sun-100" : ""} flex items-center justify-between gap-3`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-bold text-leaf-800">{buyer.name}</p>
                    {isBest ? (
                      <span className="rounded-full border border-white/80 bg-white px-2 py-1 text-[11px] font-bold text-leaf-700">
                        {content.common.bestOption}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-leaf-700/75">
                    {content.waste.buyerTypes[buyer.type] ?? buyer.type}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-leaf-500">
                    {content.waste.distance} {buyer.distance}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-extrabold text-leaf-800">
                    {formatPrice(buyer.price, content.locale)}
                  </p>
                  <p className="text-xs text-leaf-700/70">{content.common.perLoad}</p>
                </div>
              </Card>
            );
          })}

          <Button className="w-full" onClick={() => setConfirmed(true)}>
            <ShoppingCart size={18} />
            {content.waste.sellNow}
          </Button>

          {confirmed ? (
            <Card className="border-leaf-700 bg-leaf-800 text-white">
              <div className="flex items-center gap-3">
                <Award size={20} />
                <p className="text-sm font-semibold">
                  {content.waste.successPrefix} {bestBuyer.name}. {content.waste.successSuffix}
                </p>
              </div>
            </Card>
          ) : null}
        </section>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon="â™»ï¸ "
            title={content.waste.emptyTitle}
            description={content.waste.emptyDescription}
          />
        </div>
      )}
    </main>
  );
}
