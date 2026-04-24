import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const formSchema = z.object({
  motive: z.string().min(1, "신청 계기를 입력해 주세요"),
  name: z.string().min(1, "성명을 입력해 주세요"),
  age: z
    .string()
    .min(1, "나이를 입력해 주세요")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 120, {
      message: "올바른 나이를 입력해 주세요 (1~120)",
    }),
  gender: z.enum(["male", "female"] as const, {
    error: "성별을 선택해 주세요",
  }),
  reason: z.string().min(1, "신청 사유를 입력해 주세요"),
  agreeConsent: z.boolean().refine((v) => v === true, {
    message: "동의서에 동의해주세요",
  }),
});

type FormValues = z.infer<typeof formSchema>;

function MemphisShapes() {
  return (
    <>
      <div className="absolute pointer-events-none" style={{ top: 24, left: 24, width: 72, height: 72, borderRadius: "50%", background: "#b5ead7", border: "2.5px solid #222", zIndex: 0 }} />
      <svg className="absolute pointer-events-none" style={{ top: 16, right: 32, zIndex: 0 }} width="60" height="52" viewBox="0 0 60 52">
        <polygon points="30,2 58,50 2,50" fill="#c9b1ff" stroke="#222" strokeWidth="2.5" />
      </svg>
      <div className="absolute pointer-events-none" style={{ top: "38%", left: 18, width: 32, height: 32, background: "#fdffb6", border: "2.5px solid #222", transform: "rotate(45deg)", zIndex: 0 }} />
      <div className="absolute pointer-events-none" style={{ top: "42%", right: 20, width: 44, height: 44, borderRadius: "50%", background: "#ffd6a5", border: "2.5px solid #222", zIndex: 0 }} />
      <div className="absolute pointer-events-none" style={{ bottom: 32, left: 32, width: 40, height: 40, background: "#ffb3c1", border: "2.5px solid #222", zIndex: 0 }} />
      <div className="absolute pointer-events-none" style={{ bottom: 24, right: 40, width: 56, height: 56, borderRadius: "50%", background: "#a0c4ff", border: "2.5px solid #222", zIndex: 0 }} />
      {[{ top: 90, left: 120 }, { top: 160, right: 90 }, { top: 260, left: 60 }, { bottom: 120, right: 110 }, { bottom: 80, left: 110 }].map((pos, i) => (
        <div key={i} className="absolute pointer-events-none" style={{ ...pos, width: 10, height: 10, borderRadius: "50%", background: "#222", zIndex: 0 }} />
      ))}
      {[{ top: 200, right: 60 }, { bottom: 160, left: 80 }].map((pos, i) => (
        <svg key={i} className="absolute pointer-events-none" style={{ ...pos, zIndex: 0 }} width="14" height="14" viewBox="0 0 14 14">
          <polygon points="7,1 13,7 7,13 1,7" fill="#222" />
        </svg>
      ))}
      <div className="absolute pointer-events-none" style={{ top: 110, left: 100, width: 60, height: 3, background: "#222", zIndex: 0 }} />
      <div className="absolute pointer-events-none" style={{ bottom: 140, right: 80, width: 50, height: 3, background: "#222", zIndex: 0 }} />
    </>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-bold text-sm mb-1.5" style={{ fontFamily: "'Noto Sans KR', sans-serif", color: "#222" }}>
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs mt-1" style={{ color: "#e03e3e" }}>{message}</p>;
}

function SuccessScreen({ formData, onDownloadPdf, onReset, isDownloading }: {
  formData: FormValues;
  onDownloadPdf: () => void;
  onReset: () => void;
  isDownloading: boolean;
}) {
  const genderLabel = formData.gender === "male" ? "남성" : formData.gender === "female" ? "여성" : "기타";
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "oklch(0.97 0.025 60)" }}>
      <MemphisShapes />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#b5ead7", border: "2px solid #222" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#888" }}>Psychology Test</span>
            <div style={{ width: 14, height: 14, background: "#fdffb6", border: "2px solid #222", transform: "rotate(45deg)" }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-2" style={{ fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif", textShadow: "4px 4px 0px rgba(0,0,0,0.15)", color: "#222", letterSpacing: "0.02em" }}>
            신청 완료!
          </h1>
          <p className="text-base" style={{ color: "#555" }}>심리검사 신청이 성공적으로 접수되었습니다.</p>
        </div>
        <div className="w-full max-w-lg mb-6" style={{ background: "white", border: "2.5px solid #222", borderRadius: 16, boxShadow: "6px 6px 0px #222", padding: "28px 32px" }}>
          <h2 className="font-black text-lg mb-4 uppercase tracking-wide" style={{ fontFamily: "'Black Han Sans', sans-serif" }}>신청 내용 요약</h2>
          <div className="space-y-3">
            {[
              { label: "신청 계기", value: formData.motive },
              { label: "성명", value: formData.name },
              { label: "나이", value: `${formData.age}세` },
              { label: "성별", value: genderLabel },
              { label: "신청 사유", value: formData.reason },
            ].map((item, i) => (
              <div key={i} className="flex gap-3" style={{ padding: "10px 14px", borderRadius: 8, background: i % 2 === 0 ? "oklch(0.97 0.025 60)" : "white", border: "1.5px solid #eee" }}>
                <span className="font-bold text-sm w-24 shrink-0" style={{ color: "#222" }}>{item.label}</span>
                <span className="text-sm" style={{ color: "#444", wordBreak: "break-word" }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-center" style={{ padding: "8px 12px", borderRadius: 8, background: "#b5ead7", border: "1.5px solid #222", color: "#333" }}>
            신청이 완료되었습니다.
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          <button
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="flex-1 py-3 px-6 text-base font-black uppercase tracking-wide"
            style={{ fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif", background: "#222", color: "oklch(0.97 0.025 60)", border: "2.5px solid #222", borderRadius: 8, boxShadow: "4px 4px 0px #c9b1ff", cursor: isDownloading ? "not-allowed" : "pointer", opacity: isDownloading ? 0.7 : 1, transition: "all 0.12s ease" }}
          >
            {isDownloading ? "PDF 생성 중..." : "PDF 다운로드"}
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-3 px-6 text-base font-black uppercase tracking-wide"
            style={{ fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif", background: "#b5ead7", color: "#222", border: "2.5px solid #222", borderRadius: 8, boxShadow: "4px 4px 0px #222", cursor: "pointer", transition: "all 0.12s ease" }}
          >
            새 신청하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const submitMutation = trpc.application.submit.useMutation({
    onSuccess: () => { setSubmitted(true); },
    onError: (err) => { toast.error(`신청 중 오류가 발생했습니다: ${err.message}`); },
  });

  const downloadPdfMutation = trpc.application.downloadPdf.useMutation({
    onSuccess: (data) => {
      const byteChars = atob(data.pdfBase64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `심리검사_신청서_${submittedData?.name ?? "신청자"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF가 다운로드되었습니다!");
    },
    onError: (err) => { toast.error(`PDF 생성 중 오류가 발생했습니다: ${err.message}`); },
  });

  const onSubmit = (values: FormValues) => {
    setSubmittedData(values);
    submitMutation.mutate({ motive: values.motive, name: values.name, age: Number(values.age), gender: values.gender, reason: values.reason });
  };

  const handleDownloadPdf = () => {
    // 동의서 PDF 다운로드
    const link = document.createElement('a');
    link.href = '/consent_form.pdf';
    link.download = 'consent_form.pdf';
    link.click();
  };

  const handleReset = () => { setSubmitted(false); setSubmittedData(null); reset(); };

  if (submitted && submittedData) {
    return <SuccessScreen formData={submittedData} onDownloadPdf={handleDownloadPdf} onReset={handleReset} isDownloading={false} />;
  }

  const selectedGender = watch("gender");

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "oklch(0.97 0.025 60)" }}>
      <MemphisShapes />
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#b5ead7", border: "2px solid #222" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#888", fontFamily: "'Space Grotesk', sans-serif" }}>Psychology Test</span>
            <div style={{ width: 12, height: 12, background: "#fdffb6", border: "2px solid #222", transform: "rotate(45deg)" }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-3" style={{ fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif", textShadow: "4px 4px 0px rgba(0,0,0,0.13)", color: "#222", letterSpacing: "0.02em", lineHeight: 1.15 }}>
            심리검사 신청
          </h1>
          <p className="text-sm md:text-base max-w-sm mx-auto" style={{ color: "#555", lineHeight: 1.7 }}>
            아래 양식을 작성하시면 담당자가 확인 후 연락드립니다.<br />모든 정보는 상담 목적으로만 활용됩니다.
          </p>
        </div>

        <div className="w-full max-w-lg" style={{ background: "white", border: "2.5px solid #222", borderRadius: 20, boxShadow: "7px 7px 0px #222", padding: "36px 32px" }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div>
              <FieldLabel><span style={{ color: "#c9b1ff", marginRight: 6 }}>◆</span>신청 계기</FieldLabel>
              <textarea {...register("motive")} rows={3} placeholder="심리검사를 신청하게 된 계기를 적어주세요"
                className="w-full px-4 py-3 text-sm resize-none"
                style={{ border: "2px solid #222", borderRadius: 10, background: "oklch(0.99 0.01 60)", fontFamily: "'Noto Sans KR', sans-serif", outline: "none", transition: "box-shadow 0.15s", color: "#222" }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = "3px 3px 0px #c9b1ff"; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              />
              <FieldError message={errors.motive?.message} />
            </div>

            <div>
              <FieldLabel><span style={{ color: "#b5ead7", marginRight: 6 }}>●</span>성명</FieldLabel>
              <input {...register("name")} type="text" placeholder="이름을 입력해 주세요"
                className="w-full px-4 py-3 text-sm"
                style={{ border: "2px solid #222", borderRadius: 10, background: "oklch(0.99 0.01 60)", fontFamily: "'Noto Sans KR', sans-serif", outline: "none", transition: "box-shadow 0.15s", color: "#222" }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = "3px 3px 0px #b5ead7"; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel><span style={{ color: "#ffd6a5", marginRight: 6 }}>▲</span>나이</FieldLabel>
                <input {...register("age")} type="number" min={1} max={120} placeholder="예: 25"
                  className="w-full px-4 py-3 text-sm"
                  style={{ border: "2px solid #222", borderRadius: 10, background: "oklch(0.99 0.01 60)", fontFamily: "'Noto Sans KR', sans-serif", outline: "none", transition: "box-shadow 0.15s", color: "#222" }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = "3px 3px 0px #ffd6a5"; }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                />
                <FieldError message={errors.age?.message} />
              </div>
              <div>
                <FieldLabel><span style={{ color: "#ffb3c1", marginRight: 6 }}>■</span>성별</FieldLabel>
                <div className="flex gap-2 mt-1">
                  {[{ value: "male", label: "남성" }, { value: "female", label: "여성" }].map((opt) => (
                    <label key={opt.value} className="flex-1 text-center py-2.5 text-sm font-bold cursor-pointer select-none"
                      style={{ border: "2px solid #222", borderRadius: 8, background: selectedGender === opt.value ? "#222" : "white", color: selectedGender === opt.value ? "oklch(0.97 0.025 60)" : "#222", transition: "all 0.1s", boxShadow: selectedGender === opt.value ? "2px 2px 0px #c9b1ff" : "none" }}>
                      <input type="radio" value={opt.value} {...register("gender")} className="sr-only" />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <FieldError message={errors.gender?.message} />
              </div>
            </div>

            <div>
              <FieldLabel><span style={{ color: "#a0c4ff", marginRight: 6 }}>◉</span>신청 사유</FieldLabel>
              <textarea {...register("reason")} rows={4} placeholder="심리검사를 신청하는 이유나 현재 상태를 자유롭게 적어주세요"
                className="w-full px-4 py-3 text-sm resize-none"
                style={{ border: "2px solid #222", borderRadius: 10, background: "oklch(0.99 0.01 60)", fontFamily: "'Noto Sans KR', sans-serif", outline: "none", transition: "box-shadow 0.15s", color: "#222" }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = "3px 3px 0px #a0c4ff"; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              />
              <FieldError message={errors.reason?.message} />
            </div>

            <div className="bg-white border-2 border-dashed border-gray-300 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm" style={{ color: "#222", fontFamily: "'Noto Sans KR', sans-serif" }}>📋 심리검사 동의서</h3>
                <a href="/consent_form.pdf" download className="inline-block px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-700 border border-blue-400 rounded hover:bg-blue-200 transition" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                  다운로드
                </a>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input {...register("agreeConsent")} type="checkbox" className="mt-1" />
                <span className="text-xs" style={{ color: "#555", fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.5 }}>
                  심리검사 동의서를 읽었으며, 심리검사 진행에 동의합니다.
                </span>
              </label>
              <FieldError message={errors.agreeConsent?.message} />
            </div>

            <button type="submit" disabled={submitMutation.isPending}
              className="w-full py-4 text-base font-black uppercase tracking-widest"
              style={{ fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif", background: submitMutation.isPending ? "#888" : "#222", color: "oklch(0.97 0.025 60)", border: "2.5px solid #222", borderRadius: 10, boxShadow: submitMutation.isPending ? "none" : "5px 5px 0px #c9b1ff", cursor: submitMutation.isPending ? "not-allowed" : "pointer", transition: "all 0.12s ease", letterSpacing: "0.1em" }}
              onMouseEnter={(e) => { if (!submitMutation.isPending) { (e.currentTarget as HTMLButtonElement).style.transform = "translate(-2px,-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "7px 7px 0px #c9b1ff"; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translate(0,0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "5px 5px 0px #c9b1ff"; }}
            >
              {submitMutation.isPending ? "신청 중..." : "신청하기"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-xs text-center" style={{ color: "#888", maxWidth: 400 }}>
          신청 완료 후 동의서 PDF를 다운로드할 수 있습니다.
        </p>
        <div className="mt-12 text-center">
          <a href="/admin" className="inline-block text-xs font-bold text-gray-500 hover:text-gray-700 transition underline" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            관리자
          </a>
        </div>
      </div>
    </div>
  );
}
