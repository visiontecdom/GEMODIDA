import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

export default function SurveysLayout({
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
