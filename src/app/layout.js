import "./globals.css";

export const metadata = {
  title: "TUNT Space — พื้นที่เซฟใจ",
  description: "ระบบเฝ้าระวังและดูแลสุขภาพจิตนักเรียนกลุ่มเสี่ยงแฝงเชิงรุก",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
