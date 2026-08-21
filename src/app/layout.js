export const metadata = {
  title: "Youth Opportunity Forum",
  description:
    "Youth Opportunity Forum is a free database of internships, research opportunities, and summer programs for high school students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="3a6a37e8f342a9b071e8739c8100a9cd3eddfe53" content="3a6a37e8f342a9b071e8739c8100a9cd3eddfe53" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
