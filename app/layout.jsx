import './globals.css';

export const metadata = {
  title: 'The Office Dungeon',
  description: 'A 2.5D Web Escape Room',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}