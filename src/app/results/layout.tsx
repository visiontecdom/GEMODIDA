import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

export default function ResultsLayout({
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
