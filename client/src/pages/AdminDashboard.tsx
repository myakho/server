import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const ADMIN_CODE = "Juc2531q!1_";

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const { data: applications, isLoading } = trpc.application.getAll.useQuery(
    undefined,
    { enabled: authenticated }
  );

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      setAuthenticated(true);
      setCode("");
      toast.success("인증되었습니다");
    } else {
      toast.error("코드가 잘못되었습니다");
      setCode("");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#ffd6a5" }}>
        <div className="w-full max-w-sm p-8 bg-white rounded-lg border-2 border-black" style={{ boxShadow: "8px 8px 0px rgba(0,0,0,0.1)" }}>
          <h1 className="text-2xl font-black text-center mb-6" style={{ fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif", color: "#222" }}>
            관리자 인증
          </h1>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="코드를 입력하세요"
              className="w-full px-4 py-3 border-2 border-black rounded-lg"
              style={{ fontFamily: "'Noto Sans KR', sans-serif", outline: "none" }}
            />
            <button
              type="submit"
              className="w-full py-3 font-black text-white bg-black border-2 border-black rounded-lg hover:opacity-90 transition"
              style={{ fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif" }}
            >
              인증하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "#ffd6a5" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif", color: "#222" }}>
            신청 현황
          </h1>
          <button
            onClick={() => setAuthenticated(false)}
            className="px-4 py-2 text-sm font-bold bg-white border-2 border-black rounded hover:bg-gray-100 transition"
            style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            로그아웃
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            로딩 중...
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app, idx) => (
              <div
                key={idx}
                className="p-6 bg-white border-2 border-black rounded-lg"
                style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.1)" }}
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>성명</p>
                    <p className="text-lg font-bold" style={{ fontFamily: "'Noto Sans KR', sans-serif", color: "#222" }}>{app.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>나이</p>
                    <p className="text-lg font-bold" style={{ fontFamily: "'Noto Sans KR', sans-serif", color: "#222" }}>{app.age}세</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>성별</p>
                    <p className="text-lg font-bold" style={{ fontFamily: "'Noto Sans KR', sans-serif", color: "#222" }}>
                      {app.gender === "male" ? "남성" : "여성"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>신청일시</p>
                    <p className="text-sm font-bold" style={{ fontFamily: "'Noto Sans KR', sans-serif", color: "#222" }}>
                      {new Date(app.createdAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                </div>

                <div className="mb-4 pb-4 border-b-2 border-gray-300">
                  <p className="text-xs font-bold text-gray-600 mb-2" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>신청 계기</p>
                  <p className="text-sm" style={{ fontFamily: "'Noto Sans KR', sans-serif", color: "#333", lineHeight: 1.6 }}>{app.motive}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>신청 사유</p>
                  <p className="text-sm" style={{ fontFamily: "'Noto Sans KR', sans-serif", color: "#333", lineHeight: 1.6 }}>{app.reason}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white border-2 border-black rounded-lg" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            신청 내용이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
