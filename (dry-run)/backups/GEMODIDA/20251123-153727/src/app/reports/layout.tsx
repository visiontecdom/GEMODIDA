import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

export default function ReportsLayout({
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
