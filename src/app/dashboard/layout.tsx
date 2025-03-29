import Sidebar from '@/components/dashboard/Sidebar';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 pl-64">
        {children}
      </div>
    </div>
  );
}
