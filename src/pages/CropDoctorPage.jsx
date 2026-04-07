import { Camera, PlayCircle, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import SectionLabel from "../components/SectionLabel";
import { useLanguage } from "../context/LanguageContext";

export default function CropDoctorPage() {
  const { content } = useLanguage();
  const [preview, setPreview] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const filePreview = URL.createObjectURL(file);
    setPreview(filePreview);
    setIsAnalyzing(true);
    setReportReady(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      setReportReady(true);
    }, 900);
  };

  return (
    <main className="screen-shell">
      <Header
        title={content.cropDoctor.title}
        subtitle={content.cropDoctor.subtitle}
        location={content.locationLabel}
        showBack
      />

      <Card className="border-dashed border-leaf-200 text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-leaf-100 bg-leaf-50 text-leaf-700">
          <Camera size={28} />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-leaf-800">{content.cropDoctor.uploadTitle}</h2>
        <p className="mt-2 text-sm text-leaf-700/75">{content.cropDoctor.uploadHint}</p>
        <label className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-leaf-700 bg-leaf-700 px-5 py-4 text-sm font-semibold text-white">
          <Upload size={18} />
          {content.cropDoctor.uploadImage}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </Card>

      {preview ? (
        <Card className="mt-5 overflow-hidden p-0">
          <img src={preview} alt={content.cropDoctor.uploadTitle} className="h-56 w-full object-cover" />
        </Card>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon="ðŸ“·"
            title={content.cropDoctor.emptyTitle}
            description={content.cropDoctor.emptyDescription}
          />
        </div>
      )}

      {isAnalyzing ? (
        <div className="mt-5">
          <LoadingState label={content.cropDoctor.loading} />
        </div>
      ) : null}

      {reportReady ? (
        <section className="mt-6">
          <SectionLabel eyebrow={content.cropDoctor.diagnosis} title={content.cropDoctor.detectedIssue} />
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl font-extrabold text-leaf-800">
                  {content.cropDoctor.diagnosisResult.disease}
                </p>
                <p className="mt-1 text-sm text-leaf-700/70">
                  {content.common.confidence} 92%
                </p>
              </div>
              <Button variant="secondary" className="min-h-0 px-4 py-2">
                <PlayCircle size={18} />
                {content.cropDoctor.playVoice}
              </Button>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-leaf-100 bg-leaf-50 px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">
                  {content.cropDoctor.treatment}
                </p>
                <p className="mt-2 text-sm text-leaf-700">{content.cropDoctor.diagnosisResult.treatment}</p>
              </div>
              <div className="rounded-2xl border border-leaf-100 bg-white px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">
                  {content.cropDoctor.dosage}
                </p>
                <p className="mt-2 text-sm text-leaf-700">{content.cropDoctor.diagnosisResult.dosage}</p>
              </div>
              <div className="rounded-2xl border border-soil-100 bg-soil-50 px-4 py-4 text-sm font-medium text-leaf-700">
                {content.cropDoctor.diagnosisResult.note}
              </div>
            </div>
          </Card>
        </section>
      ) : null}
    </main>
  );
}
