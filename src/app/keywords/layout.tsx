import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

export default function KeywordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayoutWrapper>
      {children}
    </MainLayoutWrapper>
  );
}