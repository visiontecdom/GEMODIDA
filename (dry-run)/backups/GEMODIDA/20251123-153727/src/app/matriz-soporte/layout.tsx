import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

export default function MatrizSoporteLayout({
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
