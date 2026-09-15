import "./globals.css";

export const metadata = {
  title: 'Axon | AI-powered creator growth, brand collaborations, and content opportunities',
  description: 'AI-powered creator growth, brand collaborations, and content opportunities — all in one platform.',
};
 
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >{children}</body>
    </html>
  );
}