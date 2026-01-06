import { Outlet } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/configuration/')({
  component: ConfigurationLayout,
});

function ConfigurationLayout() {
  return (
    <div className="container mx-auto py-6">
      <Outlet />
    </div>
  );
}
