import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

export interface ApplicationData {
  motive: string;
  name: string;
  age: number;
  gender: string;
  reason: string;
}

export async function sendApplicationEmail(data: ApplicationData): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ENV.gmailUser,
      pass: ENV.gmailAppPassword,
    },
  });

  const genderLabel =
    data.gender === "male" ? "남성" : data.gender === "female" ? "여성" : data.gender;

  const htmlContent = `
    <div style="font-family: 'Noto Sans KR', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff8f5; border-radius: 16px; overflow: hidden; border: 2px solid #222;">
      <div style="background: #222; padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 22px; letter-spacing: 2px;">🧠 심리검사 신청 접수</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #555; margin-bottom: 24px;">새로운 심리검사 신청이 접수되었습니다.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 8px; font-weight: bold; color: #222; width: 30%;">신청 계기</td>
            <td style="padding: 12px 8px; color: #444;">${data.motive}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee; background: #fef9f7;">
            <td style="padding: 12px 8px; font-weight: bold; color: #222;">성명</td>
            <td style="padding: 12px 8px; color: #444;">${data.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 8px; font-weight: bold; color: #222;">나이</td>
            <td style="padding: 12px 8px; color: #444;">${data.age}세</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee; background: #fef9f7;">
            <td style="padding: 12px 8px; font-weight: bold; color: #222;">성별</td>
            <td style="padding: 12px 8px; color: #444;">${genderLabel}</td>
          </tr>
          <tr>
            <td style="padding: 12px 8px; font-weight: bold; color: #222; vertical-align: top;">신청 사유</td>
            <td style="padding: 12px 8px; color: #444; line-height: 1.6;">${data.reason}</td>
          </tr>
        </table>
        <p style="margin-top: 32px; color: #888; font-size: 13px;">신청일시: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"심리검사 신청 시스템" <${ENV.gmailUser}>`,
    to: "hyebiu4@gmail.com",
    subject: `[심리검사 신청] ${data.name}님의 신청이 접수되었습니다`,
    html: htmlContent,
  });
}
