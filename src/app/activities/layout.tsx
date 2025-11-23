import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

export default function ActivitiesLayout({
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
